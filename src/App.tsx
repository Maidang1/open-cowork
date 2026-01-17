import { FormEvent, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

type Message = {
  role: "user" | "agent";
  text: string;
};

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ensureSession = async () => {
    if (sessionId) return sessionId;
    const newId = await invoke<string>("create_agent_session");
    setSessionId(newId);
    return newId;
  };

  const startNewSession = async () => {
    setIsCreatingSession(true);
    setError(null);
    try {
      const newId = await invoke<string>("create_agent_session");
      setSessionId(newId);
      setMessages([]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create session";
      setError(message);
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
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
      const activeSessionId = await ensureSession();
      const response = await invoke<string>("send_agent_message", {
        message: prompt,
        session_id: activeSessionId,
      });
      setMessages((current) => [
        ...current,
        { role: "agent", text: response || "(no response received)" },
      ]);
    } catch (err) {
      console.log("err", err);
      const message =
        err instanceof Error ? err.message : "Failed to reach the agent";
      setError(message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="app">
      <section className="panel">
        <header className="panel__header">
          <div>
            <p className="eyebrow">Agent Client Protocol</p>
            <h1>Codex chat</h1>
            <p className="subtext">
              Send a message to the bundled codex-acp agent and read the reply.
            </p>
          </div>
          <div className="header-actions">
            <button
              type="button"
              className="ghost"
              onClick={startNewSession}
              disabled={isCreatingSession || isSending}
            >
              {isCreatingSession ? "Creating…" : "New session"}
            </button>
            <span className="badge">
              {sessionId
                ? `Session ${sessionId.slice(0, 8)}…`
                : "Session not started"}
            </span>
            <span className="badge subtle">
              {isSending ? "Working…" : "Idle"}
            </span>
          </div>
        </header>

        <div className="conversation">
          {messages.length === 0 && (
            <p className="placeholder">
              Ask a question to start a session with the agent.
            </p>
          )}
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`bubble bubble--${message.role}`}
            >
              <span className="bubble__label">
                {message.role === "user" ? "You" : "Agent"}
              </span>
              <p>{message.text}</p>
            </div>
          ))}
        </div>

        {error && <p className="error">{error}</p>}

        <form className="prompt" onSubmit={handleSubmit}>
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.currentTarget.value)}
            placeholder="Describe what you want the agent to do..."
            rows={3}
          />
          <button type="submit" disabled={isSending || !draft.trim()}>
            {isSending ? "Sending…" : "Send to agent"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default App;
