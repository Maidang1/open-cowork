# Design: Ant Design X Chat UI

## Goals

- Adopt Ant Design X primitives for a cohesive, production-grade chat experience.
- Preserve existing session management and agent-status streaming while improving clarity and discoverability.
- Keep implementation incremental: thin wrappers around AntDX components, minimal new state.

## Layout & Structure

- **Shell**: Three-surface layout using AntDX containers—`Conversations` (left), `Bubble` list + `Sender` (center), optional utility rail (right) for Actions/Files/Sources rendering.
- **Empty states**: Use `Welcome` plus `Prompts` for quick start when no active messages; hook prompts to prefill Sender.
- **System feedback**: Use `Notification` for global errors/success; inline status pills in header or Bubble for in-flight work.

## Data & State Flow

- **Sessions**: Reuse existing session list; feed into `Conversations` with active key, create/delete handlers, and workspace metadata. Session switching resets visible stream buffer but keeps per-session caches.
- **Messaging**: `Bubble` renders chronological messages. Live agent response displayed as a streaming Bubble; finalized on completion (still return final text for compatibility).
- **Status**: Map `agent-status` phases to UI cues—`Think` for initial processing, `ThoughtChain` for multi-step reasoning, streaming badge while chunks arrive.
- **Input**: `Sender` manages draft, disabled states, and `Attachment` hook for future file additions; `Suggestion` pills trigger quick prompts.

## Rich Content Rendering

- Detect structured payloads (actions, file refs, citations, code fences, mermaid blocks) and render via AntDX: `Actions`, `FileCard`, `Sources`, `CodeHighlighter`, `Mermaid`.
- Fallback to plain text Bubble when no structure is present.

## Error & Timeout Handling

- Use `Notification` for failures (send, session ops). Inline Bubble error state for agent failures with retry affordance.
- Show "Still thinking" via `Think` + notification if no chunks within a timeout; allow cancel/retry from Actions list.

## Risks / Open Questions

- Ant Design X availability in the project (package version, tree-shaking). Assume importable via npm/bun; verify during implementation.
- Structured payload format for Actions/FileCard/Sources/CodeHighlighter/Mermaid may need adapters if backend responses are plain text.
