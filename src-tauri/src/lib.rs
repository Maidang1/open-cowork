mod acp_agent_provider;
mod acp_client;

use acp_agent_provider::codex;

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
async fn create_agent_session() -> Result<String, String> {
    codex::new_codex_session().await
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            send_agent_message,
            create_agent_session
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
