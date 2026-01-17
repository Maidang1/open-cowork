# Change: Add Workspace Selection and Session Management UI

## Why

The current open-cowork application uses the current working directory for all codex sessions and lacks a user-friendly way to manage multiple independent sessions with different workspaces. Users need the ability to:
- Select specific directories to grant codex permissions for each session
- Create multiple independent conversations (Claude-like UI)
- Have a more intuitive interface similar to Claude's web layout

## What Changes

- Add workspace directory selection capability before creating a session
- Redesign UI to match Claude's web interface layout
- Implement session management sidebar showing multiple conversations
- Update ACP client to support workspace-specific initialization
- Add new Tauri commands for directory selection and session persistence

**BREAKING**: The default session behavior will change - users must explicitly select a workspace directory instead of using the current working directory by default.

## Impact

- **Affected specs**:
  - New capabilities: `workspace-management`, `session-ui`
  
- **Affected code**:
  - `src/App.tsx` - Complete UI redesign
  - `src/App.css` - New styling matching Claude's layout
  - `src-tauri/src/lib.rs` - New Tauri commands
  - `src-tauri/src/acp_agent_provider/codex.rs` - Workspace-aware session creation
  - `src-tauri/src/acp_client/client.rs` - Permission handling for file operations

- **Affected configurations**:
  - May need to update Tauri capabilities to allow directory dialog access
