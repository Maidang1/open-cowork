# agent-status Specification

## Purpose
TBD - created by archiving change add-agent-live-status. Update Purpose after archive.
## Requirements
### Requirement: Live Agent Activity Indicators

The system SHALL present real-time agent activity phases so users know when the model is thinking, streaming, or finished.

#### Scenario: Showing status while awaiting a reply

- **WHEN** a user sends a prompt for an active session
- **THEN** the UI SHALL immediately show a visible status (e.g., "Thinking…") tied to that session
- **THEN** the status SHALL update as phases change (e.g., "Preparing", "Thinking", "Streaming", "Finishing")
- **THEN** the status indicator SHALL clear once the agent finishes or errors

### Requirement: Streamed Agent Output

The system SHALL display partial agent responses in real time as content chunks arrive, then finalize the message.

#### Scenario: Displaying partial and final agent messages

- **WHEN** the agent emits content chunks for a session
- **THEN** the conversation view SHALL append the partial text in a live agent message bubble without waiting for completion
- **THEN** subsequent chunks SHALL extend the same in-flight bubble in order
- **WHEN** the agent signals completion
- **THEN** the live bubble SHALL be finalized as a normal agent message and removed from the streaming state

### Requirement: Session-Scoped Status Handling

The system SHALL scope streaming status and partial output to the correct session so switching sessions does not cross-contaminate UI state.

#### Scenario: Switching sessions during an active stream

- **WHEN** a user switches from Session A to Session B while Session A is streaming
- **THEN** Session A's status and in-flight content SHALL pause or minimize in the background
- **THEN** Session B SHALL show its own status (or idle state) without displaying Session A's chunks
- **WHEN** the user returns to Session A
- **THEN** the latest status and streamed content for Session A SHALL be restored

### Requirement: Timeout and Error Feedback

The system SHALL surface informative feedback when a stream stalls or fails so users know what to do next.

#### Scenario: Handling stalled or failed streams

- **WHEN** no status or chunk updates arrive within a defined timeout window
- **THEN** the UI SHALL show a "Still thinking" or similar notice with an option to retry
- **WHEN** the agent reports an error or disconnects mid-stream
- **THEN** the UI SHALL show an inline error message tied to the affected session
- **THEN** the user's prompt SHALL remain available (or be easily retried) without losing context

