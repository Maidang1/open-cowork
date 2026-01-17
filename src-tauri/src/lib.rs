mod acp_agent_provider;
mod acp_client;
mod session_store;

use acp_agent_provider::codex;
use session_store::{SessionMetadata, SESSION_STORE_KEY};
use tauri_plugin_store::StoreExt;
use std::sync::Mutex;

// Global state for workspace directory (simplified for MVP)
lazy_static::lazy_static! {
    static ref SELECTED_WORKSPACE: Mutex<Option<String>> = Mutex::new(None);
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn send_agent_message(message: String, session_id: Option<String>) -> Result<String, String> {
    codex::send_codex_message(message, session_id).await
}

#[tauri::command]
async fn create_agent_session(workspace: Option<String>) -> Result<String, String> {
    codex::new_codex_session(workspace).await
}

#[tauri::command]
fn select_workspace_directory() -> Result<String, String> {
    // Use rfd to open a native folder picker dialog
    let folder = rfd::FileDialog::new()
        .pick_folder();

    match folder {
        Some(path) => Ok(path.to_string_lossy().to_string()),
        None => Err("No folder selected".to_string()),
    }
}

#[tauri::command]
async fn list_sessions(app: tauri::AppHandle) -> Result<Vec<SessionMetadata>, String> {
    let store = app.store(SESSION_STORE_KEY).map_err(|e| e.to_string())?;
    match store.get("sessions") {
        Some(sessions) => serde_json::from_value(sessions)
            .map_err(|e| format!("Failed to parse sessions: {}", e)),
        None => Ok(vec![]),
    }
}

#[tauri::command]
async fn save_session(app: tauri::AppHandle, session: SessionMetadata) -> Result<(), String> {
    let store = app.store(SESSION_STORE_KEY).map_err(|e| e.to_string())?;
    let mut sessions: Vec<SessionMetadata> = store
        .get("sessions")
        .and_then(|v| serde_json::from_value(v).ok())
        .unwrap_or_default();

    println!("sessions: {:?}", sessions);

    // Update existing or add new
    if let Some(pos) = sessions.iter().position(|s| s.id == session.id) {
        sessions[pos] = session;
    } else {
        sessions.push(session);
    }

    store.set("sessions", serde_json::to_value(sessions).unwrap());
    store.save().map_err(|e| e.to_string())
}

#[tauri::command]
async fn delete_session(app: tauri::AppHandle, session_id: String) -> Result<(), String> {
    let store = app.store(SESSION_STORE_KEY).map_err(|e| e.to_string())?;
    let mut sessions: Vec<SessionMetadata> = store
        .get("sessions")
        .and_then(|v| serde_json::from_value(v).ok())
        .unwrap_or_default();

    sessions.retain(|s| s.id != session_id);

    store.set("sessions", serde_json::to_value(sessions).unwrap());
    store.save().map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            greet,
            send_agent_message,
            create_agent_session,
            select_workspace_directory,
            list_sessions,
            save_session,
            delete_session
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
