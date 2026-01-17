# Open Cowork

A Tauri + React + TypeScript desktop application that provides a Claude-inspired interface for interacting with Codex CLI via the Agent Client Protocol (ACP).

## Features

- **Session Management**: Create and manage multiple independent conversation sessions
- **Workspace Selection**: Select specific directories for each session to define Codex's working scope
- **Claude-Inspired UI**: Clean, modern interface with sidebar for sessions and dedicated chat area
- **Persistent Sessions**: Sessions are saved locally and persist across application restarts
- **ACP Protocol Integration**: Full support for the Agent Client Protocol for communicating with Codex
- **Workspace-Aware File Operations**: Codex can read and write files within selected workspace directories

## Getting Started

### Prerequisites

- Node.js and Bun (or npm)
- Rust toolchain (for Tauri)
- Codex ACP agent binary (`codex-acp`) placed in `src-tauri/agents/codex/`

### Installation

```bash
# Install dependencies
bun install

# Start development server
bun run tauri dev
```

### Building

```bash
# Build for production
bun run tauri build
```

## Usage

1. **Create a Session**: Click the "+ New Session" button in the sidebar
2. **Select Workspace**: Choose a directory from the file picker dialog - this is where Codex will have file access
3. **Start Chatting**: Type your request in the input area and press Enter or click Send
4. **Manage Sessions**:
   - Click on any session in the sidebar to switch between conversations
   - Click the "×" button on a session to delete it
5. **Workspace Display**: The current workspace path is shown at the top of the main content area

## Architecture

### Frontend (React + TypeScript)
- `src/App.tsx`: Main application component with session management
- `src/App.css`: Claude-inspired styling with responsive design

### Backend (Rust + Tauri 2)
- `src-tauri/src/lib.rs`: Tauri command handlers
- `src-tauri/src/acp_agent_provider/codex.rs`: Codex agent integration
- `src-tauri/src/acp_client/client.rs`: ACP client implementation with workspace validation
- `src-tauri/src/session_store.rs`: Session metadata persistence

### Tauri Plugins
- `tauri-plugin-dialog`: Native directory picker for workspace selection
- `tauri-plugin-store`: Persistent storage for session metadata
- `tauri-plugin-opener`: URL handling

## Development

### Adding New Tauri Commands

1. Add the command function with `#[tauri::command]` in `src-tauri/src/lib.rs`
2. Register the command in the `invoke_handler!` macro
3. Add required permissions to `src-tauri/capabilities/default.json`
4. Call from frontend using `invoke('command_name', { params })`

### Session Management

Sessions are persisted using Tauri's store plugin and include:
- `id`: Unique session identifier
- `name`: Session name (derived from workspace directory)
- `workspace_path`: Path to the selected workspace directory
- `created_at`: Creation timestamp
- `last_active`: Last interaction timestamp

### ACP Integration

The application implements the ACP client protocol with workspace-aware file operations:
- File reads and writes are validated to ensure they stay within the workspace
- The agent is initialized with the workspace directory as its working directory
- All ACP protocol notifications are handled to capture agent responses

## Security Considerations

- File operations are restricted to the user-selected workspace directory
- The ACP client validates that all file paths are within the workspace before allowing access
- Workspace selection uses native OS file picker dialogs for security

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## License

[Add your license here]
