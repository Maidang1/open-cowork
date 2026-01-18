# Change: Add Real-Time Agent Status

## Why

Users wait a long time for agent replies without seeing what the model is doing. The UI currently only shows a simple sending state, so users cannot tell if the agent is thinking, streaming, or stuck. Clear, live status and partial output feedback are needed to keep the experience trustworthy during slow operations.

## What Changes

- Surface live agent phases (e.g., connecting, thinking, streaming output, finishing) in the chat UI
- Stream partial agent output to the conversation as chunks arrive, then finalize the message
- Bridge ACP session notifications into structured Tauri events the frontend can subscribe to per session
- Add graceful fallbacks and error messaging when streaming fails or a phase stalls

## Impact

- **Affected specs**: New capability `agent-status`; integrates with existing `session-ui` layout conventions
- **Affected code**: `src-tauri/src/acp_agent_provider/codex.rs`, `src-tauri/src/acp_client/client.rs`, `src-tauri/src/lib.rs`, React chat UI components and state management under `src/`
- **Testing**: Manual long-prompt trials to verify phase transitions, streaming output, and error handling; future automated coverage can mock event payloads
