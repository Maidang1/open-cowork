## ADDED Requirements

### Requirement: AntDX Conversations Shell

The system SHALL use Ant Design X `Conversations` to manage session lists and controls.

#### Scenario: Rendering sessions with AntDX

- **WHEN** sessions are loaded
- **THEN** they SHALL be rendered via `Conversations` with active state, workspace label, and relative last-active time
- **THEN** create/delete actions SHALL use built-in AntDX affordances (e.g., add button, overflow menu) and trigger existing session commands

### Requirement: Bubble-Based Message Stream

The system SHALL render chat messages using Ant Design X `Bubble` with clear roles and states.

#### Scenario: Displaying user and agent bubbles

- **WHEN** messages are shown
- **THEN** each SHALL appear as a `Bubble` with role-specific styling and timestamps
- **THEN** in-flight agent replies SHALL display as a streaming Bubble that finalizes once the response completes

### Requirement: Sender with Attachments and Suggestions

The system SHALL use Ant Design X `Sender` for composing messages with attachment and quick-suggestion affordances.

#### Scenario: Composing with Sender

- **WHEN** the user opens the input area
- **THEN** `Sender` SHALL present multiline input, send action, and disabled state while sending
- **THEN** `Attachment` SHALL be available to collect files (even if stubbed for future backend)
- **THEN** `Suggestion` chips SHALL insert predefined prompts into the draft

### Requirement: Structured Agent Output Rendering

The system SHALL render structured agent responses with Ant Design X components for clarity.

#### Scenario: Rich output display

- **WHEN** agent responses include actionable items
- **THEN** they SHALL render as `Actions` lists
- **WHEN** responses reference files
- **THEN** they SHALL render as `FileCard` entries with path and action hints
- **WHEN** responses cite sources
- **THEN** they SHALL render with `Sources`
- **WHEN** responses include code or diagrams
- **THEN** code SHALL render with `CodeHighlighter` and diagrams with `Mermaid`

### Requirement: Thinking and Thought Chains

The system SHALL visualize agent reasoning phases using Ant Design X `Think` and `ThoughtChain` components tied to streaming status.

#### Scenario: Showing reasoning progress

- **WHEN** an agent begins processing a prompt
- **THEN** `Think` SHALL appear to indicate active reasoning
- **WHEN** intermediate steps are available
- **THEN** `ThoughtChain` SHALL display the ordered steps until the final response completes or errors
