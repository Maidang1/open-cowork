# Design: Workspace Selection and Session Management

## Context

The application currently uses `std::env::current_dir()` as the workspace for all codex sessions. This is limiting because:
1. Users cannot work on different projects in separate sessions
2. There's no visual indication of which directory is being used
3. The UI doesn't support multiple conversation sessions
4. The interface is a simple chat window rather than a productivity tool

### Constraints

- Must use Tauri for desktop integration (directory dialogs, file system access)
- Must maintain ACP protocol compatibility with codex agent
- React 19 with TypeScript for the frontend
- Should follow Tauri 2 best practices for capabilities and permissions

### Stakeholders

- End users: Developers who want to use codex CLI through a GUI
- Codex agent: The ACP agent that performs code operations

## Goals / Non-Goals

### Goals
- Provide directory picker dialog to select workspace per session
- Implement Claude-like sidebar for session list management
- Support multiple independent sessions with different workspaces
- Display active workspace directory in the UI
- Persist sessions across application restarts
- Improve permission handling for file operations

### Non-Goals
- Session synchronization between multiple devices
- Advanced permission editing (beyond auto-approve)
- Multi-file project indexing (defer to codex agent)

## Decisions

### UI Layout Decision
**Decision**: Use Claude's three-column layout with left sidebar for sessions, center for chat, right for future tool expansion.

**Alternatives considered**:
1. Single-column chat with dropdown for sessions - Too cramped for desktop
2. Two-column (sidebar + chat) - Chosen for MVP to match Claude closely
3. Tabbed interface - Doesn't scale well for many sessions

**Rationale**: Claude's layout is familiar to users and proven effective for AI coding assistants. The sidebar provides clear session management while keeping focus on the conversation.

### Workspace Persistence Strategy
**Decision**: Store session metadata (ID, workspace path, message count, last modified) in local storage via Tauri's `tauri-plugin-store`.

**Alternatives considered**:
1. File-based JSON storage - More manual work, need to handle serialization
2. SQLite database - Overkill for simple session metadata
3. In-memory only - Lost on app restart, poor UX

**Rationale**: Tauri's store plugin provides a simple key-value API that persists automatically. Sufficient for session list metadata.

### ACP Session Initialization
**Decision**: Pass selected workspace path to `acp::NewSessionRequest` when creating sessions.

**Alternatives considered**:
1. Change working directory before starting agent - Would affect all sessions
2. Virtual workspace mapping - Too complex, requires agent changes
3. Pass workspace as session parameter - Chosen, supported by ACP protocol

**Rationale**: ACP protocol supports specifying workspace directory per session. This is the cleanest approach that doesn't require agent modifications.

### Permission Handling
**Decision**: Auto-approve all codex requests for the selected workspace directory, show user notification of actions.

**Alternatives considered**:
1. Prompt user for every operation - Too disruptive for coding workflows
2. Allow manual permission configuration - Complex, defer to future iteration
3. Sandbox restrictions - Limits codex functionality

**Rationale**: Codex is trusted agent, auto-approving within selected workspace provides balance of usability and security. Visual notifications provide transparency.

## Risks / Trade-offs

### Risk: Security Implications of Auto-Approval
**Risk**: Automatically approving all codex file operations could be misused if agent is compromised.

**Mitigation**:
- Restrict operations to user-selected workspace directory only
- Add clear visual indicators when operations are performed
- Consider adding "review mode" option in future iterations
- Document that users should only select trusted directories

### Trade-off: Session Metadata Storage Limitations
**Trade-off**: Local storage has size limits (typically 10MB) and doesn't support complex queries.

**Impact**: Message history is not stored in metadata; it's retrieved from agent or lost on restart. This is acceptable for initial version.

**Migration**: Future iterations could implement message persistence if needed.

### Trade-off: UI Complexity
**Trade-off**: Full Claude-style UI increases initial implementation effort compared to simple modifications.

**Impact**: Longer development time but better user experience and clearer separation of concerns.

**Justification**: The UI redesign is the primary user value, so investment is justified.

## Migration Plan

### Steps
1. Add new Tauri commands for directory selection alongside existing commands
2. Implement new UI components alongside existing UI
3. Add feature flag or route to switch between old and new UI
4. Gradually migrate functionality to new UI
5. Remove old UI once new UI is stable

### Rollback
- Keep old Tauri commands (`send_agent_message`, `create_agent_session`) as-is initially
- New UI calls new commands, old UI can remain as fallback
- Git history allows reverting UI changes if needed

## Open Questions

1. **Message Persistence**: Should we store full conversation history locally, or only rely on agent-side persistence?
   - **Decision**: For MVP, don't store messages locally. Agent handles history.

2. **Session Deletion**: Should users be able to delete sessions? If so, what happens to agent-side data?
   - **Decision**: Add UI delete button that removes from local list. Agent-side cleanup is optional (depends on agent capabilities).

3. **Directory Validation**: Should we validate that selected directory exists and is readable?
   - **Decision**: Yes, validate before creating session. Show user-friendly error if directory is inaccessible.

4. **Multi-select Workspaces**: Should sessions support multiple workspace directories?
   - **Decision**: No, single directory per session to keep MVP simple. Could be added later if needed.

5. **Session Naming**: Should users customize session names, or auto-generate from workspace directory?
   - **Decision**: Auto-generate from directory name initially. Add rename feature in future iteration.
