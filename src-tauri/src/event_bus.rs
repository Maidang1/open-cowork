use std::sync::Mutex;
use tokio::sync::mpsc::{unbounded_channel, UnboundedReceiver, UnboundedSender};
use lazy_static::lazy_static;
use agent_client_protocol::SessionUpdate;

#[derive(Clone, Debug, serde::Serialize)]
#[serde(tag = "type", content = "payload")]
pub enum AgentEvent {
    Status { session_id: String, status: String },
    Chunk { session_id: String, content: String },
    ThoughtChunk { session_id: String, content: String },
    Update { session_id: String, update: SessionUpdate },
}

lazy_static! {
    pub static ref EVENT_BUS: (UnboundedSender<AgentEvent>, Mutex<Option<UnboundedReceiver<AgentEvent>>>) = {
        let (tx, rx) = unbounded_channel();
        (tx, Mutex::new(Some(rx)))
    };
}

pub fn emit_event(event: AgentEvent) {
    let _ = EVENT_BUS.0.send(event);
}
