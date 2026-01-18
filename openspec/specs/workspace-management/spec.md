# workspace-management Specification

## Purpose
TBD - created by archiving change add-workspace-session-ui. Update Purpose after archive.
## Requirements
### Requirement: Workspace Directory Selection

The system SHALL provide a mechanism for users to select a workspace directory before creating a new session. The workspace directory determines which files and folders the codex agent has permission to access and operate on.

#### Scenario: User selects a valid directory

- **WHEN** a user initiates creation of a new session
- **THEN** the system SHALL display a directory picker dialog
- **WHEN** the user selects a valid directory
- **THEN** the system SHALL validate the directory exists and is accessible
- **THEN** the system SHALL use this directory as the workspace for the new session

#### Scenario: User selects an invalid directory

- **WHEN** a user selects a directory that does not exist or is not accessible
- **THEN** the system SHALL display an error message explaining the issue
- **THEN** the system SHALL NOT create a session
- **THEN** the user SHALL be prompted to select a different directory

#### Scenario: Workspace validation succeeds

- **WHEN** a selected directory passes validation
- **THEN** the system SHALL check read/write permissions for the directory
- **THEN** the system SHALL proceed with session creation

### Requirement: Session Metadata Persistence

The system SHALL persist session metadata locally so that sessions survive application restarts. Metadata includes session ID, workspace directory path, session name, creation timestamp, and last activity timestamp.

#### Scenario: Creating a new session saves metadata

- **WHEN** a new session is successfully created
- **THEN** the system SHALL generate a unique session ID
- **THEN** the system SHALL save session metadata including workspace path
- **THEN** the metadata SHALL be persisted to local storage

#### Scenario: Loading sessions on application startup

- **WHEN** the application starts
- **THEN** the system SHALL load all previously saved session metadata
- **THEN** the system SHALL display the sessions in the sidebar

#### Scenario: Deleting a session

- **WHEN** a user deletes a session
- **THEN** the system SHALL remove the session metadata from storage
- **THEN** the session SHALL no longer appear in the session list

#### Scenario: Updating session activity

- **WHEN** a user sends a message in a session
- **THEN** the system SHALL update the last activity timestamp for that session
- **THEN** the updated metadata SHALL be persisted

### Requirement: Workspace-Aware ACP Session Initialization

The system SHALL pass the selected workspace directory to the ACP agent when creating a new session, ensuring the agent operates within the specified directory boundaries.

#### Scenario: Session creation with workspace parameter

- **WHEN** a session is created with a selected workspace directory
- **THEN** the system SHALL invoke the ACP new_session request with the workspace path
- **THEN** the ACP agent SHALL initialize with the specified directory as its working directory
- **THEN** all subsequent file operations in the session SHALL be scoped to this directory

#### Scenario: Switching between sessions with different workspaces

- **WHEN** a user switches from Session A (workspace-dir-1) to Session B (workspace-dir-2)
- **THEN** the system SHALL ensure all messages are sent to the correct session
- **THEN** the ACP agent SHALL use the appropriate workspace directory for each session
- **THEN** file operations in Session B SHALL NOT affect Session A's workspace

### Requirement: Session Management Commands

The system SHALL provide Tauri commands for session management including directory selection, session creation, listing, and deletion.

#### Scenario: Selecting workspace directory

- **WHEN** the frontend invokes the `select_workspace_directory` command
- **THEN** the system SHALL open a native directory picker dialog
- **THEN** the system SHALL return the selected directory path to the frontend
- **THEN** if the user cancels, the system SHALL return an appropriate cancellation result

#### Scenario: Listing all sessions

- **WHEN** the frontend invokes the `list_sessions` command
- **THEN** the system SHALL retrieve all saved session metadata
- **THEN** the system SHALL return the sessions as an array sorted by last activity
- **THEN** each session SHALL include ID, name, workspace path, and timestamps

#### Scenario: Deleting a session

- **WHEN** the frontend invokes the `delete_session` command with a session ID
- **THEN** the system SHALL remove the session from storage
- **THEN** the system SHALL return a success confirmation
- **THEN** if the session ID does not exist, the system SHALL return an appropriate error

### Requirement: Permission Handling for Workspace Operations

The system SHALL automatically approve file operations requested by the codex agent within the selected workspace directory, while providing visual feedback to the user about ongoing operations.

#### Scenario: Agent requests file read within workspace

- **WHEN** the codex agent requests to read a file within the workspace directory
- **THEN** the system SHALL automatically approve the request
- **THEN** the system SHALL display a visual indicator that a read operation occurred

#### Scenario: Agent requests file write within workspace

- **WHEN** the codex agent requests to write a file within the workspace directory
- **THEN** the system SHALL automatically approve the request
- **THEN** the system SHALL display a visual indicator that a write operation occurred

#### Scenario: Agent requests operation outside workspace

- **WHEN** the codex agent requests to access a file outside the workspace directory
- **THEN** the system SHALL deny the request
- **THEN** the system SHALL log a security warning
- **THEN** the user SHALL be notified of the denied operation

