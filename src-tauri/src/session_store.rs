use serde::{Deserialize, Serialize};

pub const SESSION_STORE_KEY: &str = "sessions.dat";

/// Metadata for a session stored in the Tauri store
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionMetadata {
    pub id: String,
    pub name: String,
    pub workspace_path: String,
    pub created_at: u64, // Unix timestamp in seconds
    pub last_active: u64, // Unix timestamp in seconds
}

impl SessionMetadata {
    pub fn new(id: String, name: String, workspace_path: String) -> Self {
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();
        Self {
            id,
            name,
            workspace_path,
            created_at: now,
            last_active: now,
        }
    }

    pub fn update_last_active(&mut self) {
        self.last_active = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();
    }
}
