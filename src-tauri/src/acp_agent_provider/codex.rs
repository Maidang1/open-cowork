use std::{
    path::PathBuf,
    sync::{Arc, OnceLock},
    thread,
};

use agent_client_protocol::{self as acp, Agent};
use tokio::{
    process::Command,
    runtime::Builder,
    task::LocalSet,
    time::{sleep, Duration},
};
use tokio_util::compat::{TokioAsyncReadCompatExt, TokioAsyncWriteCompatExt};

use crate::acp_client::client::AcpClient;

struct AgentWorker {
    sender: tokio::sync::mpsc::UnboundedSender<WorkerRequest>,
}

enum WorkerRequest {
    NewSession {
        reply: tokio::sync::oneshot::Sender<Result<String, String>>,
    },
    Prompt {
        session_id: Option<String>,
        message: String,
        reply: tokio::sync::oneshot::Sender<Result<String, String>>,
    },
}

static AGENT_WORKER: OnceLock<Result<AgentWorker, String>> = OnceLock::new();

/// Sends a prompt to the codex ACP agent and returns the accumulated text response.
pub async fn send_codex_message(
    message: String,
    session_id: Option<String>,
) -> Result<String, String> {
    if message.trim().is_empty() {
        return Err("Message cannot be empty".into());
    }

    let worker = AGENT_WORKER
        .get_or_init(start_worker)
        .as_ref()
        .map_err(|err| err.clone())?;

    let (tx, rx) = tokio::sync::oneshot::channel();
    worker
        .sender
        .send(WorkerRequest::Prompt {
            session_id,
            message,
            reply: tx,
        })
        .map_err(|err| format!("Agent channel send failed: {err}"))?;

    rx.await
        .map_err(|err| format!("Agent channel closed: {err}"))?
}

/// Starts a new session and returns its identifier. Also updates the default session in the worker.
pub async fn new_codex_session() -> Result<String, String> {
    let worker = AGENT_WORKER
        .get_or_init(start_worker)
        .as_ref()
        .map_err(|err| err.clone())?;

    let (tx, rx) = tokio::sync::oneshot::channel();
    worker
        .sender
        .send(WorkerRequest::NewSession { reply: tx })
        .map_err(|err| format!("Agent channel send failed: {err}"))?;

    rx.await
        .map_err(|err| format!("Agent channel closed: {err}"))?
}

fn start_worker() -> Result<AgentWorker, String> {
    let agent_path = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("agents/codex/codex-acp");
    if !agent_path.exists() {
        return Err(format!(
            "Agent binary not found at {}",
            agent_path.display()
        ));
    }

    let (ready_tx, ready_rx) = std::sync::mpsc::channel();

    thread::spawn(move || {
        let runtime = match Builder::new_current_thread().enable_all().build() {
            Ok(rt) => rt,
            Err(err) => {
                let _ = ready_tx.send(Err(format!("Failed to build runtime: {err}")));
                return;
            }
        };

        let local = LocalSet::new();
        let worker_future = async move {
            let cwd = std::env::current_dir()
                .and_then(|path| path.canonicalize())
                .map_err(|err| format!("Failed to resolve current directory: {err}"))?;

            let mut child = Command::new(agent_path)
                .stdin(std::process::Stdio::piped())
                .stdout(std::process::Stdio::piped())
                .spawn()
                .map_err(|err| format!("Failed to start agent: {err}"))?;

            let stdout = child
                .stdout
                .take()
                .ok_or_else(|| "Failed to capture agent stdout".to_string())?
                .compat();
            let stdin = child
                .stdin
                .take()
                .ok_or_else(|| "Failed to capture agent stdin".to_string())?
                .compat_write();

            let output = Arc::new(tokio::sync::Mutex::new(String::new()));
            let client = AcpClient::new(output.clone());

            let (agent_conn, io_task) =
                acp::ClientSideConnection::new(client, stdin, stdout, |fut| {
                    tokio::task::spawn_local(fut);
                });
            tokio::task::spawn_local(io_task);

            agent_conn
                .initialize(
                    acp::InitializeRequest::new(acp::ProtocolVersion::LATEST).client_info(
                        acp::Implementation::new("open-cowork", env!("CARGO_PKG_VERSION"))
                            .title("Open Cowork Client"),
                    ),
                )
                .await
                .map_err(|err| format!("initialize failed: {err}"))?;

            let session = agent_conn
                .new_session(acp::NewSessionRequest::new(cwd.clone()))
                .await
                .map_err(|err| format!("new_session failed: {err}"))?;

            let (tx, mut rx) = tokio::sync::mpsc::unbounded_channel::<WorkerRequest>();
            let _ = ready_tx.send(Ok(tx.clone()));
            let mut default_session = Some(session.session_id.clone());

            while let Some(request) = rx.recv().await {
                match request {
                    WorkerRequest::NewSession { reply } => {
                        let new_session = agent_conn
                            .new_session(acp::NewSessionRequest::new(cwd.clone()))
                            .await
                            .map_err(|err| format!("new_session failed: {err}"));

                        if let Ok(ref session) = new_session {
                            default_session = Some(session.session_id.clone());
                        }

                        let _ =
                            reply.send(new_session.map(|s| s.session_id.0.as_ref().to_string()));
                    }
                    WorkerRequest::Prompt {
                        session_id,
                        message,
                        reply,
                    } => {
                        let target_session = match session_id {
                            Some(id) => acp::SessionId::new(id),
                            None => {
                                if let Some(existing) = default_session.clone() {
                                    existing
                                } else {
                                    let new_session = agent_conn
                                        .new_session(acp::NewSessionRequest::new(cwd.clone()))
                                        .await
                                        .map_err(|err| format!("new_session failed: {err}"));
                                    match new_session {
                                        Ok(session) => {
                                            default_session = Some(session.session_id.clone());
                                            session.session_id
                                        }
                                        Err(err) => {
                                            let _ = reply.send(Err(err));
                                            continue;
                                        }
                                    }
                                }
                            }
                        };

                        let prompt = vec![acp::ContentBlock::Text(acp::TextContent::new(message))];

                        {
                            let mut guard = output.lock().await;
                            guard.clear();
                        }

                        let result = agent_conn
                            .prompt(acp::PromptRequest::new(target_session.clone(), prompt))
                            .await
                            .map_err(|err| format!("prompt failed: {err}"));

                        if result.is_ok() {
                            sleep(Duration::from_millis(120)).await;
                        }

                        let response_text = {
                            let mut guard = output.lock().await;
                            std::mem::take(&mut *guard)
                        };

                        let _ = reply.send(result.map(|_| response_text));
                    }
                }
            }

            let _ = child.kill().await;
            Ok::<(), String>(())
        };

        let _ = local.block_on(&runtime, worker_future);
    });

    match ready_rx.recv() {
        Ok(Ok(sender)) => Ok(AgentWorker { sender }),
        Ok(Err(err)) => Err(err),
        Err(_) => Err("Agent worker failed to start".into()),
    }
}
