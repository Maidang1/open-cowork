<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# Repository Guidelines

## Project Structure & Module Organization
- `src/`: React 19 + TypeScript UI; entry at `main.tsx`, primary view in `App.tsx`, styles in `App.css`, static assets under `src/assets`.
- `public/` with `index.html` for Vite-served statics.
- `src-tauri/`: Rust side of the Tauri 2 app; `src/lib.rs` hosts `#[tauri::command]` handlers (e.g., `greet`) and plugins, `tauri.conf.json` controls bundling, `icons/` and `capabilities/` support packaging/perms.
  - `src-tauri/src/acp_agent_provider/`: ACP agent integration (codex.rs)
  - `src-tauri/src/acp_client/`: ACP client implementation (client.rs)
  - `src-tauri/src/session_store.rs`: Session metadata persistence
- `vite.config.ts` and `tsconfig*.json` define bundling and strict TS settings.

## Build, Test, and Development Commands
- Install deps with `bun install` (or `npm install` if Bun is unavailable); `bun.lock` is authoritative.
- `bun run dev` starts the Vite dev server; `bun run preview` serves the built bundle for smoke checks.
- `bun run build` type-checks (`tsc`) then builds the frontend.
- Desktop: `bun run tauri dev` launches the desktop shell; `bun run tauri build` produces binaries.

## Coding Style & Naming Conventions
- TypeScript runs in strict mode; avoid `any`, prefer explicit props/state types, and surface Tauri calls through typed helpers around `@tauri-apps/api`.
- React components stay functional; name components in PascalCase and helpers/hooks in camelCase. Keep feature assets colocated under `src/feature` folders when they grow.
- Use 2-space indentation; keep imports grouped (react, libs, local). Favor small, pure components over large containers.
- Tauri commands live in `src-tauri/src/lib.rs`; expose new commands with `#[tauri::command]` and register in `invoke_handler`.

## Available Tauri Commands

### Session Management
- `create_agent_session(workspace: Option<String>) -> Result<String, String>`: Creates a new ACP session with optional workspace directory
- `list_sessions() -> Result<Vec<SessionMetadata>, String>`: Retrieves all saved sessions
- `save_session(session: SessionMetadata) -> Result<(), String>`: Saves or updates session metadata
- `delete_session(session_id: String) -> Result<(), String>`: Deletes a session

### File Operations
- `select_workspace_directory() -> Result<String, String>`: Opens native directory picker dialog and returns the selected folder path. Returns an error if no folder was selected.

### Agent Communication
- `send_agent_message(message: String, session_id: Option<String>) -> Result<String, String>`: Sends a message to the codex agent

### SessionMetadata Structure
```typescript
{
  id: string;
  name: string;
  workspace_path: string;
  created_at: number; // Unix timestamp
  last_active: number; // Unix timestamp
}
```

## Testing Guidelines
- No automated tests are present yet; when adding, prefer Vitest + React Testing Library in `src/**/__tests__` or `*.test.tsx`, and Rust unit/integration tests alongside modules in `src-tauri/src`.
- Target fast unit coverage for UI logic and Rust commands; mock Tauri APIs when exercising front-end calls.
- Run `bun run build` before PRs to catch type errors and missing assets.

## Commit & Pull Request Guidelines
- No existing history to mirror; use concise imperative or Conventional Commits (e.g., `feat: add meeting view`, `fix: guard opener input`).
- PRs should outline scope, key changes, manual steps (Tauri config, capabilities), and include screenshots/gifs for UI updates. Link issues when available.
- Keep changes scoped; note breaking migrations (config/schema) explicitly for reviewers.

## Security & Configuration Tips
- Avoid embedding secrets; prefer Vite `VITE_` env vars in `.env` (keep untracked). Validate URLs before passing to `@tauri-apps/plugin-opener`.
- When introducing new commands or permissions, update `src-tauri/capabilities` and `tauri.conf.json` accordingly to match the allowlist.
