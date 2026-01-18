import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import "./App.css";

type Message = {
  role: "user" | "agent";
  text: string;
};

type Session = {
  id: string;
  name: string;
  workspace_path: string;
  created_at: number;
  last_active: number;
};

type SessionState = {
  status: string; // Dynamic status string
  streamBuffer: string;
  thoughtBuffer: string;
};

function App() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionStates, setSessionStates] = useState<Record<string, SessionState>>({});
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [isSelectingWorkspace, setIsSelectingWorkspace] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workspacePath, setWorkspacePath] = useState<string | null>(null);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, []);

  // Listen for agent events
  useEffect(() => {
    const unlistenStatus = listen<{ session_id: string; status: string }>("agent-status", (event) => {
      const { session_id, status } = event.payload;
      setSessionStates((prev) => ({
        ...prev,
        [session_id]: {
          ...(prev[session_id] || { streamBuffer: "", thoughtBuffer: "" }),
          status: status as any,
        },
      }));
    });

    const unlistenChunk = listen<{ session_id: string; content: string }>("agent-chunk", (event) => {
      const { session_id, content } = event.payload;
      setSessionStates((prev) => ({
        ...prev,
        [session_id]: {
          ...(prev[session_id] || { status: "streaming", streamBuffer: "", thoughtBuffer: "" }),
          status: "streaming",
          streamBuffer: (prev[session_id]?.streamBuffer || "") + content,
        },
      }));
    });

    const unlistenThoughtChunk = listen<{ session_id: string; content: string }>("agent-thought-chunk", (event) => {
      const { session_id, content } = event.payload;
      setSessionStates((prev) => ({
        ...prev,
        [session_id]: {
          ...(prev[session_id] || { status: "thinking", streamBuffer: "", thoughtBuffer: "" }),
          thoughtBuffer: (prev[session_id]?.thoughtBuffer || "") + content,
        },
      }));
    });

    return () => {
      unlistenStatus.then((f) => f());
      unlistenChunk.then((f) => f());
      unlistenThoughtChunk.then((f) => f());
    };
  }, []);

  const loadSessions = async () => {
    try {
      const loadedSessions = await invoke<Session[]>("list_sessions");
      setSessions(loadedSessions);
    } catch (err) {
      console.error("Failed to load sessions:", err);
    }
  };

  const createNewSession = async () => {
    setIsSelectingWorkspace(true);
    setIsCreatingSession(true);
    setError(null);
    try {
      const workspacePath = await invoke<string>("select_workspace_directory");
      
      setWorkspacePath(workspacePath);
      console.log("selected workspace:", workspacePath);
      const sessionId = await invoke<string>("create_agent_session", {
        workspace: workspacePath,
      });
      console.log("sessionId:", sessionId);

      // Extract directory name for session name
      const dirName = workspacePath.split("/").pop() || workspacePath.split("\\").pop() || "New Session";
      const newSession: Session = {
        id: sessionId,
        name: dirName,
        workspace_path: workspacePath,
        created_at: parseInt(`${Date.now() / 1000}`),
        last_active: parseInt(`${Date.now() / 1000}`),
      };


      console.log("newSession",newSession)
      await invoke("save_session", { session: newSession });
      setSessions((prev) => [...prev, newSession]);
      setActiveSessionId(sessionId);
      setMessages([]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create session";
      console.error("create new session error:", err);
      setError(message);
    } finally {
      setIsSelectingWorkspace(false);
      setIsCreatingSession(false);
    }
  };

  const switchSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      setWorkspacePath(session.workspace_path);
      setMessages([]); // Clear messages when switching sessions
    }
    setError(null);
  };

  const deleteSession = async (sessionId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await invoke("delete_session", { sessionId });
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
        setWorkspacePath(null);
        setMessages([]);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete session";
      setError(message);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const prompt = draft.trim();
    if (!prompt || isSending) {
      return;
    }

    setMessages((current) => [...current, { role: "user", text: prompt }]);
    setDraft("");
    setIsSending(true);
    setError(null);

    try {
      // Update session last active time
      if (activeSessionId) {
        const session = sessions.find((s) => s.id === activeSessionId);
        if (session) {
          const updatedSession = {
            ...session,
            last_active: parseInt(`${Date.now() / 1000}`),
          };
          await invoke("save_session", { session: updatedSession });
          setSessions((prev) =>
            prev.map((s) => (s.id === activeSessionId ? updatedSession : s))
          );
        }
      }

      const response = await invoke<string>("send_agent_message", {
        message: prompt,
        session_id: activeSessionId,
      });
      setMessages((current) => [
        ...current,
        { role: "agent", text: response || "(no response received)" },
      ]);
      
      // Clear stream buffer for this session
      if (activeSessionId) {
        setSessionStates((prev) => ({
          ...prev,
          [activeSessionId]: {
            status: "idle",
            streamBuffer: "",
            thoughtBuffer: "",
          },
        }));
      }
    } catch (err) {
      console.error("Error sending message:", err);
      const message =
        err instanceof Error ? err.message : "Failed to reach the agent";
      setError(message);
    } finally {
      setIsSending(false);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now() / 1000;
    const diff = now - timestamp;
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const getActiveSession = () => sessions.find((s) => s.id === activeSessionId);

  return (
    <main className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Sessions</h2>
          <button
            type="button"
            className="new-session-btn"
            onClick={createNewSession}
            disabled={isCreatingSession || isSelectingWorkspace}
          >
            {isSelectingWorkspace ? "Selecting..." : "+ New Session"}
          </button>
        </div>

        <div className="session-list">
          {sessions.length === 0 ? (
            <div className="empty-sessions">
              <p>No sessions yet</p>
              <p className="subtext">Create a new session to get started</p>
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className={`session-item ${session.id === activeSessionId ? "active" : ""}`}
                onClick={() => switchSession(session.id)}
              >
                <div className="session-info">
                  <span className="session-name">{session.name}</span>
                  <span className="session-time">
                    {formatTimestamp(session.last_active)}
                  </span>
                </div>
                <button
                  type="button"
                  className="delete-btn"
                  onClick={(e) => deleteSession(session.id, e)}
                  title="Delete session"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Main Content */}
      <section className="main-content">
        <header className="main-header">
          <div>
            {getActiveSession() ? (
              <>
                <h1>{getActiveSession()?.name}</h1>
                <p className="subtext workspace-path">
                  📁 {workspacePath}
                </p>
              </>
            ) : (
              <>
                <h1>Open Cowork</h1>
                <p className="subtext">
                  Select or create a session to start chatting with Codex
                </p>
              </>
            )}
          </div>
          {activeSessionId && sessionStates[activeSessionId]?.status && sessionStates[activeSessionId].status !== 'idle' && (
              <span className="status-badge">
                  {sessionStates[activeSessionId].status}
              </span>
          )}
        </header>

        <div className="chat-area">
          {messages.length === 0 ? (
            <div className="empty-chat">
              <p>
                {getActiveSession()
                  ? "Start a conversation with Codex"
                  : "Create a session to begin"}
              </p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`message message--${message.role}`}
              >
                <span className="message-label">
                  {message.role === "user" ? "You" : "Codex"}
                </span>
                <p className="message-text">{message.text}</p>
              </div>
            ))
          )}
          {activeSessionId && sessionStates[activeSessionId]?.thoughtBuffer && (
            <div className="message message--agent thinking-process" style={{ opacity: 0.8 }}>
               <span className="message-label">Thinking Process</span>
               <p className="message-text" style={{ whiteSpace: "pre-wrap", fontStyle: "italic", color: "#888" }}>
                 {sessionStates[activeSessionId].thoughtBuffer}
               </p>
            </div>
          )}
          {activeSessionId && sessionStates[activeSessionId]?.streamBuffer && (
            <div className="message message--agent streaming">
               <span className="message-label">Codex (Streaming)</span>
               <p className="message-text">{sessionStates[activeSessionId].streamBuffer}</p>
            </div>
          )}
          {activeSessionId && sessionStates[activeSessionId]?.status !== 'idle' && !sessionStates[activeSessionId]?.streamBuffer && (
            <div className="message message--agent thinking">
               <span className="message-label">Codex</span>
               <p className="message-text">{sessionStates[activeSessionId]?.status || 'Thinking...'}</p>
            </div>
          )}
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form className="input-area" onSubmit={handleSubmit}>
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.currentTarget.value)}
            placeholder={
              getActiveSession()
                ? "Describe what you want Codex to do..."
                : "Create a session first"
            }
            rows={3}
            // disabled={!activeSessionId || isSending}
          />
          <button
            type="submit"
            disabled={isSending || !draft.trim() || !activeSessionId}
          >
            {isSending ? "Sending..." : "Send"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default App;
