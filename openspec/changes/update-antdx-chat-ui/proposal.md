# Change: Update Chat UI with Ant Design X

## Why

The current chat UI is custom-styled and minimal, which limits clarity during long agent responses. Users want a richer, production-grade experience with real-time thinking/streaming signals, structured message rendering, and consistent interaction patterns. Integrating Ant Design X components (Bubble, Conversations, Notification, Welcome, Prompts, Sender, Attachment, Suggestion, Think, ThoughtChain, Actions, FileCard, Sources, CodeHighlighter, Mermaid) will provide a cohesive design system and improve usability.

## What Changes

- Replace the bespoke layout with an Ant Design X shell: Conversations sidebar, Bubble-based chat stream, Sender with attachments/suggestions, and Notifications for system feedback.
- Add Ant Design X thinking/streaming affordances (Think, ThoughtChain) to surface the agent’s live status and reasoning stages.
- Render structured agent output using Actions, FileCard, Sources, CodeHighlighter, and Mermaid components where applicable.
- Provide welcome/empty states and prompt shortcuts via Welcome and Prompts components to encourage fast starts.

## Impact

- **Affected specs**: `session-ui` (layout and interactions), new capability `antdx-ui-kit` (component integration and rendering rules); aligns with `agent-status` streaming indicators.
- **Affected code**: `src/App.tsx`, `src/App.css`, new React component structure for Ant Design X primitives, potential utility hooks for streaming/status.
- **Testing**: Manual UI verification (layout, state transitions, streaming) plus story-style fixtures if available; no automated tests currently.
