## ADDED Requirements

### Requirement: Claude-Inspired Session Sidebar

The system SHALL provide a sidebar on the left side of the interface that displays all available sessions, allowing users to create, select, and delete sessions. The sidebar design shall be similar to Claude's web interface.

#### Scenario: Displaying session list

- **WHEN** the application loads
- **THEN** the sidebar SHALL display a list of all saved sessions
- **THEN** each session SHALL show its name and optionally a truncated workspace path
- **THEN** sessions SHALL be ordered by last activity (most recent first)

#### Scenario: Creating a new session button

- **WHEN** the user views the sidebar
- **THEN** there SHALL be a prominent "New Session" button at the top of the sidebar
- **WHEN** the user clicks the "New Session" button
- **THEN** the workspace directory picker SHALL appear

#### Scenario: Selecting an active session

- **WHEN** multiple sessions exist
- **THEN** the currently active session SHALL be visually highlighted
- **THEN** other sessions SHALL be clearly distinguishable from the active session

#### Scenario: Deleting a session

- **WHEN** the user hovers over a session item
- **THEN** a delete button/icon SHALL appear
- **WHEN** the user clicks the delete button
- **THEN** a confirmation dialog SHALL appear
- **WHEN** the user confirms deletion
- **THEN** the session SHALL be removed from the list and storage

### Requirement: Workspace Picker Dialog

The system SHALL provide a user-friendly workspace picker that allows users to select a directory before creating a session. The picker shall display the selected directory clearly and allow re-selection.

#### Scenario: Initial workspace selection

- **WHEN** a user clicks "New Session"
- **THEN** a workspace picker dialog SHALL appear
- **THEN** the dialog SHALL explain the purpose (select directory for codex to work in)
- **THEN** the user SHALL select a directory from the native file picker

#### Scenario: Displaying selected workspace

- **WHEN** a workspace directory is selected
- **THEN** the session SHALL display the directory name prominently
- **THEN** the full path MAY be shown on hover or in a tooltip

#### Scenario: Changing workspace for existing session

- **WHEN** a user wants to change the workspace for an existing session
- **THEN** the system SHALL NOT allow workspace modification for existing sessions
- **THEN** the user MUST create a new session with a different workspace

### Requirement: Responsive Three-Column Layout

The system SHALL implement a responsive layout with three columns: session sidebar (left), main chat area (center), and optional tools panel (right, reserved for future features). The layout shall adapt to different screen sizes.

#### Scenario: Desktop layout (wide screen)

- **WHEN** the application is viewed on a wide screen (> 1200px)
- **THEN** the sidebar SHALL occupy approximately 250-300px width
- **THEN** the chat area SHALL use the remaining space
- **THEN** the layout SHALL have proper spacing and visual hierarchy

#### Scenario: Medium screen layout

- **WHEN** the application is viewed on a medium screen (768px - 1200px)
- **THEN** the sidebar SHALL be visible but slightly narrower
- **THEN** the chat area SHALL maintain usability

#### Scenario: Mobile layout

- **WHEN** the application is viewed on a small screen (< 768px)
- **THEN** the sidebar SHALL be collapsible or drawer-based
- **WHEN** the sidebar is collapsed
- **THEN** a menu button SHALL allow toggling the sidebar visibility

### Requirement: Session Switching

The system SHALL allow users to switch between sessions seamlessly, maintaining each session's conversation history and workspace context independently.

#### Scenario: Switching from current session to another

- **WHEN** a user clicks on a different session in the sidebar
- **THEN** the active session SHALL change immediately
- **THEN** the chat area SHALL display the new session's conversation history
- **THEN** the workspace indicator SHALL update to show the new session's directory
- **THEN** the previous session SHALL remain unchanged and preserved

#### Scenario: Active session highlighting

- **WHEN** a user selects a session
- **THEN** the session item in the sidebar SHALL have a distinct active state
- **THEN** other sessions SHALL revert to their default state

### Requirement: Session Auto-Naming

The system SHALL automatically generate session names based on the selected workspace directory, providing clear identification of each session.

#### Scenario: Auto-generating session name from directory

- **WHEN** a user selects a workspace directory (e.g., `/Users/dev/my-project`)
- **THEN** the session SHALL be named after the final directory component (e.g., "my-project")
- **THEN** the name SHALL be displayed in the session list

#### Scenario: Handling duplicate directory names

- **WHEN** multiple sessions have the same directory name from different paths
- **THEN** the system SHALL append a counter or path suffix to make names unique
- **THEN** sessions SHALL still be uniquely identifiable

#### Scenario: Displaying session metadata

- **WHEN** a session is displayed
- **THEN** the session SHALL show its auto-generated name
- **THEN** the session MAY show the last activity time (e.g., "2 hours ago")

### Requirement: Workspace Directory Display

The system SHALL display the current session's workspace directory in the interface, providing users with clear visibility of which directory codex is operating on.

#### Scenario: Displaying workspace in header

- **WHEN** a session is active
- **THEN** the workspace directory path SHALL be displayed in the main content header
- **THEN** the display SHALL show a readable representation of the path
- **THEN** hover MAY reveal the full path if truncated

#### Scenario: Workspace indicator visual design

- **WHEN** the workspace is displayed
- **THEN** it SHALL use a distinct visual style (e.g., badge, icon, or highlighted text)
- **THEN** it SHALL be clearly distinguishable from other header elements

### Requirement: Empty States and Placeholders

The system SHALL provide clear empty states and placeholders when no session exists or when a session has no messages, guiding users to take appropriate actions.

#### Scenario: No sessions exist

- **WHEN** a user opens the application with no saved sessions
- **THEN** the sidebar SHALL show a message encouraging session creation
- **THEN** the main area SHALL show a welcome message with a "New Session" call-to-action

#### Scenario: Session with no messages

- **WHEN** a user creates a new session or selects an empty session
- **THEN** the chat area SHALL show a placeholder message
- **THEN** the placeholder SHALL instruct the user to send a message to begin

### Requirement: Loading and Error States

The system SHALL provide visual feedback during loading operations and display user-friendly error messages when operations fail.

#### Scenario: Loading session data

- **WHEN** the application is loading sessions or session history
- **THEN** a loading indicator SHALL be displayed
- **THEN** the UI SHALL remain responsive or provide skeleton states

#### Scenario: Error in session creation

- **WHEN** session creation fails (e.g., invalid directory, agent error)
- **THEN** an error message SHALL be displayed to the user
- **THEN** the error message SHALL explain what went wrong and how to fix it
- **THEN** the user SHALL be able to retry the operation

#### Scenario: Error in message sending

- **WHEN** sending a message fails
- **THEN** the message SHALL remain in the input field
- **THEN** an error banner SHALL appear explaining the failure
- **THEN** the user SHALL be able to retry sending

### Requirement: Session Activity Indicators

The system SHALL provide visual indicators of session activity and agent status, helping users understand the current state of the application.

#### Scenario: Agent working indicator

- **WHEN** the codex agent is processing a message
- **THEN** a visual indicator (e.g., "Working...", spinner, or typing indicator) SHALL be displayed
- **THEN** the indicator SHALL disappear when the agent responds

#### Scenario: Session last activity timestamp

- **WHEN** displaying session items in the sidebar
- **THEN** each session SHALL show a relative timestamp of last activity
- **THEN** examples include "Just now", "5m ago", "2h ago", or actual date for older sessions

#### Scenario: Unread or new session indicators

- **WHEN** a new session is created
- **THEN** it SHALL be highlighted or marked as new
- **THEN** the new indication SHALL persist until the user sends a message
