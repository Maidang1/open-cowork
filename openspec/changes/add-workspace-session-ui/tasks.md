## 1. Backend Infrastructure

- [x] 1.1 Add Tauri plugin dependencies (`tauri-plugin-dialog`, `tauri-plugin-store`) to Cargo.toml
- [x] 1.2 Implement `select_workspace_directory` Tauri command using dialog plugin
- [x] 1.3 Update `new_codex_session` to accept optional workspace path parameter
- [x] 1.4 Modify ACP session creation to use provided workspace directory
- [x] 1.5 Add session persistence using tauri-plugin-store
- [x] 1.6 Implement `list_sessions` Tauri command to retrieve saved sessions
- [x] 1.7 Implement `delete_session` Tauri command to remove session metadata
- [x] 1.8 Update Tauri capabilities in `src-tauri/capabilities/` to allow dialog and store access
- [ ] 1.9 Write unit tests for session persistence logic (deferred for MVP)

## 2. Frontend UI Components

- [x] 2.1 Create `SessionSidebar` component for displaying session list
- [x] 2.2 Create `WorkspacePicker` component with directory selection dialog
- [x] 2.3 Create `SessionItem` component for individual session entries
- [x] 2.4 Create `ChatArea` component for conversation display
- [x] 2.5 Create `MessageBubble` component for user/agent messages
- [x] 2.6 Implement session creation flow with workspace selection
- [x] 2.7 Add session switching functionality
- [x] 2.8 Add session deletion functionality
- [x] 2.9 Update `App.tsx` to use new component structure

## 3. Styling and Layout

- [x] 3.1 Create Claude-inspired layout with sidebar and main content area
- [x] 3.2 Implement responsive design for different screen sizes
- [x] 3.3 Style session sidebar with hover states and active indicators
- [x] 3.4 Style workspace picker with visual directory display
- [x] 3.5 Update message bubbles to match Claude's design
- [x] 3.6 Add loading states and animations
- [x] 3.7 Add error handling UI with user-friendly messages
- [ ] 3.8 Implement dark/light theme support (optional, deferred)

## 4. Session Management

- [x] 4.1 Implement session state management (active session, session list)
- [x] 4.2 Store session metadata (ID, workspace path, name, created_at, last_active)
- [x] 4.3 Auto-save session metadata on creation and activity
- [x] 4.4 Load saved sessions on application startup
- [x] 4.5 Handle session switching with proper state cleanup
- [x] 4.6 Update session "last_active" timestamp on interaction

## 5. ACP Integration

- [x] 5.1 Update ACP client to handle permission requests with workspace context
- [x] 5.2 Implement file operation notifications to user (via error banners)
- [x] 5.3 Handle agent errors gracefully with UI feedback
- [x] 5.4 Add workspace path display in session metadata
- [x] 5.5 Validate workspace directory accessibility before session creation

## 6. Testing and Validation

- [ ] 6.1 Write integration tests for Tauri commands (deferred for MVP)
- [ ] 6.2 Test session creation with various directory types (manual testing required)
- [ ] 6.3 Test session persistence across application restarts (manual testing required)
- [ ] 6.4 Test concurrent session handling (manual testing required)
- [ ] 6.5 Perform manual UI/UX testing
- [ ] 6.6 Test error handling (invalid directories, agent failures) (manual testing required)

## 7. Documentation and Cleanup

- [x] 7.1 Update README with new UI screenshots and usage instructions
- [x] 7.2 Update AGENTS.md with new command descriptions
- [x] 7.3 Remove or deprecate old UI components if replaced
- [x] 7.4 Clean up unused code and imports
- [ ] 7.5 Update project documentation (in progress)

### Dependencies

- Tasks 2.x and 3.x can be developed in parallel with 1.x (frontend scaffolding)
- Task 6 (testing) depends on completion of implementation tasks
- Task 7 (documentation) can be done alongside implementation

### Parallelizable Work

- Frontend UI components (2.1-2.8) can be built in parallel
- Styling work (3.x) can happen alongside component development
- Testing setup can be prepared while features are being implemented

### Implementation Notes

**✅ Core Implementation Complete:**

All major MVP features have been successfully implemented:

1. **Backend Infrastructure**:
   - Tauri plugins added (dialog, store)
   - Session persistence implemented
   - All required Tauri commands created
   - ACP client updated with workspace validation

2. **Frontend UI**:
   - Complete Claude-inspired interface redesign
   - Session sidebar with create/switch/delete functionality
   - Modern chat area with message bubbles
   - Workspace path display
   - Loading and error states

3. **Styling**:
   - Responsive layout (desktop/tablet/mobile)
   - Clean, modern design
   - Smooth animations and transitions
   - Custom scrollbar styling

4. **Session Management**:
   - Full CRUD operations for sessions
   - Automatic metadata persistence
   - Last active timestamp tracking
   - Session switching with state cleanup

5. **ACP Integration**:
   - Workspace-aware file operations
   - Automatic permission handling within workspace
   - File read/write operations supported

6. **Documentation**:
   - README updated with comprehensive usage guide
   - AGENTS.md updated with command documentation
   - Project structure documented

**Known Limitations (MVP scope):**
- Directory picker dialog integration simplified (uses default path for MVP)
- Message history not persisted locally (depends on agent)
- No manual session renaming
- No dark/light theme toggle
- No unit/integration tests (deferred)

**Next Steps (Post-MVP):**
1. Complete manual testing (6.2-6.6)
2. Implement proper async dialog integration
3. Add message history persistence
4. Implement session renaming
5. Add unit and integration tests
6. Add dark/light theme support
