## 1. Backend Event Stream

- [ ] 1.1 Emit structured Tauri events for agent lifecycle (start, streaming chunk, complete, error) with session IDs
- [ ] 1.2 Forward ACP `SessionNotification` chunks immediately instead of only aggregating text buffers
- [ ] 1.3 Maintain compatibility with the existing `send_agent_message` return value for final text

## 2. Frontend Status & Streaming UI

- [ ] 2.1 Add per-session agent status state (phase, last update, latest chunk)
- [ ] 2.2 Render live status indicators in the chat header and near the composer during active phases
- [ ] 2.3 Stream agent message content incrementally in the conversation view and finalize on completion
- [ ] 2.4 Handle session switching by scoping status and partial output to the active session only
- [ ] 2.5 Surface timeout/error states inline with clear retry guidance

## 3. UX Polish

- [ ] 3.1 Add subtle animations or typing indicators for thinking/streaming states
- [ ] 3.2 Ensure empty states and send button copy reflect active processing

## 4. Validation

- [ ] 4.1 Manually test long-running prompts to observe phase transitions and streamed text
- [ ] 4.2 Manually test error/timeout handling and fallback to final aggregated response
