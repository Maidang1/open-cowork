## MODIFIED Requirements

### Requirement: Responsive Three-Column Layout

The layout SHALL adopt Ant Design X containers for sidebar, chat canvas, and utility rail while staying responsive.

#### Scenario: Ant Design X shell structure

- **WHEN** the application renders the main chat view
- **THEN** the layout SHALL use Ant Design X containers with a `Conversations` sidebar on the left, a Bubble-based chat canvas in the center, and a utility rail on the right reserved for rich output (Actions/FileCard/Sources)
- **THEN** the layout SHALL remain responsive across desktop, tablet, and mobile by collapsing the sidebar into a drawer on narrow widths

### Requirement: Empty States and Placeholders

The UI SHALL use Ant Design X Welcome and Prompts to guide users when sessions or messages are absent.

#### Scenario: Welcome and prompts for empty chat

- **WHEN** there is no active session or no messages in the active session
- **THEN** the main area SHALL render Ant Design X `Welcome` with contextual copy
- **THEN** the UI SHALL present a `Prompts` component containing quick-start suggestions that prefill the Sender when selected

### Requirement: Session Activity Indicators

The UI SHALL show Ant Design X thinking and streaming cues that reflect the agent’s current processing state.

#### Scenario: AntDX-based agent activity cues

- **WHEN** the agent is processing a message
- **THEN** the UI SHALL display Ant Design X `Think` or `ThoughtChain` indicators tied to the active session
- **THEN** the indicator SHALL clear or transition to a streaming badge when chunks arrive and disappear after completion or error

### ADDED Requirements

### Requirement: System Notifications

The system SHALL surface global feedback using Ant Design X Notification patterns.

#### Scenario: Displaying system notifications

- **WHEN** an operation succeeds or fails (e.g., session creation, message send, streaming timeout)
- **THEN** a Notification SHALL appear with severity-appropriate styling and clear actions (e.g., retry, dismiss)
- **THEN** notifications SHALL be scoped to the relevant session when applicable
