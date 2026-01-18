## 1. Shell & Layout

- [x] 1.1 Replace current layout with Ant Design X container primitives (Conversations sidebar, main chat, auxiliary panel) while preserving responsiveness.
- [x] 1.2 Wire session list into AntDX Conversations, including create/delete/active states and workspace metadata display.
- [x] 1.3 Add global/system Notification placement for errors, successes, and streaming/timeout notices.

## 2. Chat Stream & Input

- [x] 2.1 Render messages using Bubble with distinct styling for user/agent and support for inline status pills.
- [x] 2.2 Integrate Sender with multiline input, send state, and hook up Attachment + Suggestion affordances.
- [x] 2.3 Show Welcome and Prompts components for empty states and quick-start templates.

## 3. Agent Status & Rich Output

- [x] 3.1 Surface Think/ThoughtChain indicators during processing and streaming, aligned with `agent-status` phases.
- [x] 3.2 Stream agent output into Bubble; render Actions, FileCard, Sources, CodeHighlighter, and Mermaid when structured payloads exist.
- [x] 3.3 Ensure session switching scopes streaming/status data to the active session.

## 4. Validation

- [x] 4.1 Manual walkthrough: session create/switch/delete, prompt send, streaming, status indicators, and notifications.
- [x] 4.2 Manual responsive check (desktop/tablet/mobile) for Conversations, Bubble list, and Sender.
