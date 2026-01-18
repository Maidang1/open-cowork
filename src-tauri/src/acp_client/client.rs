use std::{
    fs,
    path::{Path, PathBuf},
    sync::Arc,
};

use crate::event_bus::{self, AgentEvent};
use agent_client_protocol as acp;
use tokio::sync::Mutex;

#[derive(Clone)]
pub struct AcpClient {
    output: Arc<Mutex<String>>,
    workspace: Arc<Mutex<Option<PathBuf>>>,
    current_session_id: Arc<Mutex<Option<String>>>,
}

impl AcpClient {
    pub fn new(output: Arc<Mutex<String>>) -> Self {
        Self {
            output,
            workspace: Arc::new(Mutex::new(None)),
            current_session_id: Arc::new(Mutex::new(None)),
        }
    }

    pub async fn set_current_session_id(&self, session_id: Option<String>) {
        *self.current_session_id.lock().await = session_id;
    }

    pub async fn set_workspace(&self, path: PathBuf) {
        *self.workspace.lock().await = Some(path);
    }

    async fn ensure_in_workspace(&self, file_path: &Path) -> Result<(), String> {
        let workspace = self.workspace.lock().await;
        if let Some(ref workspace_path) = *workspace {
            if let Ok(abs_path) = file_path.canonicalize() {
                if let Ok(workspace_abs) = workspace_path.canonicalize() {
                    if !abs_path.starts_with(&workspace_abs) {
                        return Err(format!(
                            "Access denied: {} is outside workspace {}",
                            file_path.display(),
                            workspace_path.display()
                        ));
                    }
                }
            }
        }
        Ok(())
    }

    async fn emit_status(&self, status: String) {
        if let Some(session_id) = &*self.current_session_id.lock().await {
            event_bus::emit_event(AgentEvent::Status {
                session_id: session_id.clone(),
                status,
            });
        }
    }
}

#[async_trait::async_trait(?Send)]
impl acp::Client for AcpClient {
    async fn request_permission(
        &self,
        args: acp::RequestPermissionRequest,
    ) -> acp::Result<acp::RequestPermissionResponse> {
        if let Some(option) = args.options.first() {
            return Ok(acp::RequestPermissionResponse::new(
                acp::RequestPermissionOutcome::Selected(acp::SelectedPermissionOutcome::new(
                    option.option_id.clone(),
                )),
            ));
        }

        Ok(acp::RequestPermissionResponse::new(
            acp::RequestPermissionOutcome::Cancelled,
        ))
    }

    async fn write_text_file(
        &self,
        args: acp::WriteTextFileRequest,
    ) -> acp::Result<acp::WriteTextFileResponse> {
        let path = PathBuf::from(&args.path);
        
        self.emit_status(format!("Writing file: {}", path.display())).await;

        if let Err(e) = self.ensure_in_workspace(&path).await {
            return Err(acp::Error::new(-1, e));
        }

        // Ensure parent directory exists
        if let Some(parent) = path.parent() {
            if !parent.exists() {
                fs::create_dir_all(parent)
                    .map_err(|e| acp::Error::new(-2, format!("Failed to create directory: {}", e)))?;
            }
        }

        fs::write(&path, args.content)
            .map_err(|e| acp::Error::new(-3, format!("Failed to write file: {}", e)))?;

        Ok(acp::WriteTextFileResponse::new())
    }

    async fn read_text_file(
        &self,
        args: acp::ReadTextFileRequest,
    ) -> acp::Result<acp::ReadTextFileResponse> {
        let path = PathBuf::from(&args.path);
        
        self.emit_status(format!("Reading file: {}", path.display())).await;

        if let Err(e) = self.ensure_in_workspace(&path).await {
            return Err(acp::Error::new(-1, e));
        }

        let content = fs::read_to_string(&path)
            .map_err(|e| acp::Error::new(-4, format!("Failed to read file: {}", e)))?;

        Ok(acp::ReadTextFileResponse::new(content))
    }

    async fn create_terminal(
        &self,
        _args: acp::CreateTerminalRequest,
    ) -> Result<acp::CreateTerminalResponse, acp::Error> {
        Err(acp::Error::method_not_found())
    }

    async fn terminal_output(
        &self,
        _args: acp::TerminalOutputRequest,
    ) -> acp::Result<acp::TerminalOutputResponse> {
        Err(acp::Error::method_not_found())
    }

    async fn release_terminal(
        &self,
        _args: acp::ReleaseTerminalRequest,
    ) -> acp::Result<acp::ReleaseTerminalResponse> {
        Err(acp::Error::method_not_found())
    }

    async fn wait_for_terminal_exit(
        &self,
        _args: acp::WaitForTerminalExitRequest,
    ) -> acp::Result<acp::WaitForTerminalExitResponse> {
        Err(acp::Error::method_not_found())
    }

    async fn kill_terminal_command(
        &self,
        _args: acp::KillTerminalCommandRequest,
    ) -> acp::Result<acp::KillTerminalCommandResponse> {
        Err(acp::Error::method_not_found())
    }

    async fn session_notification(
        &self,
        args: acp::SessionNotification,
    ) -> acp::Result<(), acp::Error> {
        if let Some(session_id) = &*self.current_session_id.lock().await {
            event_bus::emit_event(AgentEvent::Update {
                session_id: session_id.clone(),
                update: args.update.clone(),
            });
        }

        match args.update {
            acp::SessionUpdate::AgentMessageChunk(acp::ContentChunk { content, .. }) => {
                let text = match content {
                    acp::ContentBlock::Text(text_content) => text_content.text,
                    acp::ContentBlock::Image(_) => "<image>".into(),
                    acp::ContentBlock::Audio(_) => "<audio>".into(),
                    acp::ContentBlock::ResourceLink(resource_link) => resource_link.uri,
                    acp::ContentBlock::Resource(_) => "<resource>".into(),
                    _ => "<unknown>".into(),
                };

                let mut output = self.output.lock().await;
                if !output.is_empty() {
                    output.push('\n');
                    if let Some(session_id) = &*self.current_session_id.lock().await {
                        event_bus::emit_event(AgentEvent::Chunk {
                            session_id: session_id.clone(),
                            content: "\n".to_string(),
                        });
                    }
                }
                output.push_str(&text);

                if let Some(session_id) = &*self.current_session_id.lock().await {
                    event_bus::emit_event(AgentEvent::Chunk {
                        session_id: session_id.clone(),
                        content: text,
                    });
                }
            }
            acp::SessionUpdate::UserMessageChunk(_) => {}
            acp::SessionUpdate::AgentThoughtChunk(acp::ContentChunk { content, .. }) => {
                println!("AgentThoughtChunk: {:?}", content);
                let text = match content {
                    acp::ContentBlock::Text(text_content) => text_content.text,
                    acp::ContentBlock::Image(_) => "<image>".into(),
                    acp::ContentBlock::Audio(_) => "<audio>".into(),
                    acp::ContentBlock::ResourceLink(resource_link) => resource_link.uri,
                    acp::ContentBlock::Resource(_) => "<resource>".into(),
                    _ => "<unknown>".into(),
                };

                if let Some(session_id) = &*self.current_session_id.lock().await {
                    event_bus::emit_event(AgentEvent::ThoughtChunk {
                        session_id: session_id.clone(),
                        content: text,
                    });
                }
            }
            acp::SessionUpdate::ToolCall(_) => {}
            acp::SessionUpdate::ToolCallUpdate(_) => {}
            acp::SessionUpdate::Plan(_) => {}
            acp::SessionUpdate::AvailableCommandsUpdate(_) => {}
            acp::SessionUpdate::CurrentModeUpdate(_) => {}
            _ => {}
        }
        Ok(())
    }

    async fn ext_method(&self, _args: acp::ExtRequest) -> acp::Result<acp::ExtResponse> {
        Err(acp::Error::method_not_found())
    }

    async fn ext_notification(&self, _args: acp::ExtNotification) -> acp::Result<()> {
        Err(acp::Error::method_not_found())
    }
}
