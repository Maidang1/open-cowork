# Design: Real-Time Agent Status

## Goals

- Provide continuous feedback during agent interactions: visible phases plus streamed output
- Keep the existing `send_agent_message` contract usable while adding event-driven updates
- Keep implementation minimal and resilient: graceful fallbacks when streaming is unavailable

## Approach

1. **Event bridge**: Emit structured Tauri events for agent lifecycle and chunks.
   - Around `send_agent_message`, emit `agent-status` events for `start`, `complete`, and `error` (include `session_id`, `prompt_id`, timestamps).
   - From `session_notification`, emit `agent-chunk` events immediately with content text and phase `streaming`.
   - Preserve the aggregated final text in the existing `send_agent_message` response for compatibility.

2. **Phase model**: Normalize phases for the UI: `idle`, `thinking` (prompt received), `streaming` (chunks arriving), `tooling` (if ACP signals tool work), `completed`, `error`.

3. **Frontend handling**:
   - Add a session-scoped store for agent status and the active streaming message (content buffer + phase + last update time).
   - Subscribe once to the Tauri events and route updates by `session_id` to avoid cross-session bleed.
   - Render a status pill/typing indicator in the header and show the in-flight agent message as a live bubble while `streaming`, replacing it with the final message on `completed`.

4. **Fallbacks and timeouts**:
   - If no chunks arrive within a short threshold (e.g., 5–10s), surface "Still thinking" and allow retry.
   - On error events, show inline error state and keep the user's prompt available for resend.
   - If streaming is unsupported, fall back to the final aggregated response only.

## Open Questions / Risks

- Do we need to expose low-level ACP events (e.g., file operations) in the same UI, or keep this focused on messaging phases?
- How should multiple windows be handled? (Assume single-window for now; emit to the main window.)
