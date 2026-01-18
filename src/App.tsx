import { useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { XMarkdown } from "@ant-design/x-markdown";
import "./App.css";
import {
  Actions,
  Bubble,
  CodeHighlighter,
  Conversations,
  FileCard,
  Mermaid,
  Notification,
  NotificationItem,
  Prompts,
  Sender,
  Sources,
  Think,
  ThoughtChain,
  Welcome,
} from "./components/Antdx";

type Message = {
  role: "user" | "agent";
  text: string;
  status?: "thinking" | "streaming" | "done" | "error";
  timestamp: number;
  structured?: {
    actions?: { label: string; hint?: string }[];
    files?: { name: string; path?: string }[];
    sources?: { label: string; url?: string }[];
    code?: { language?: string; code: string };
    mermaid?: string;
    thoughtChain?: string[];
  };
};

type Session = {
  id: string;
  name: string;
  workspace_path: string;
  created_at: number;
  last_active: number;
};

type Prompt = { id: string; title: string; body: string };

const promptPresets: Prompt[] = [
  { id: "summarize", title: "Summarize changes", body: "Summarize the recent edits and next steps." },
  { id: "todo", title: "Generate TODOs", body: "List the next 5 actionable tasks with owners." },
  { id: "explain", title: "Explain code", body: "Explain the main logic of this file in simple terms." },
];

const suggestionPresets = ["Summarize", "List TODOs", "Explain this code"];

function App() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [liveAgentMessage, setLiveAgentMessage] = useState<Message | null>(null);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [workspacePath, setWorkspacePath] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [thoughtSteps, setThoughtSteps] = useState<string[]>([]);

  useEffect(() => {
    loadSessions();
  }, []);

  const sortedSessions = useMemo(
    () => [...sessions].sort((a, b) => b.last_active - a.last_active),
    [sessions]
  );

  const addNotification = (type: NotificationItem["type"], message: string) => {
    setNotifications((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        type,
        message,
      },
    ]);
  };

  const closeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const loadSessions = async () => {
    try {
      const loadedSessions = await invoke<Session[]>("list_sessions");
      setSessions(loadedSessions);
    } catch (err) {
      console.error("Failed to load sessions:", err);
      addNotification("error", "Failed to load sessions");
    }
  };

  const createNewSession = async () => {
    try {
      const selectedWorkspace = await invoke<string>("select_workspace_directory");
      setWorkspacePath(selectedWorkspace);
      const sessionId = await invoke<string>("create_agent_session", {
        workspace: selectedWorkspace,
      });

      const dirName =
        selectedWorkspace.split("/").pop() ||
        selectedWorkspace.split("\\").pop() ||
        "New Session";

      const now = Math.floor(Date.now() / 1000);
      const newSession: Session = {
        id: sessionId,
        name: dirName,
        workspace_path: selectedWorkspace,
        created_at: now,
        last_active: now,
      };

      await invoke("save_session", { session: newSession });
      setSessions((prev) => [...prev, newSession]);
      setActiveSessionId(sessionId);
      setMessages([]);
      setLiveAgentMessage(null);
      addNotification("success", "Session created");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create session";
      console.error("create new session error:", err);
      addNotification("error", message);
    }
  };

  const switchSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      setWorkspacePath(session.workspace_path);
    }
    setMessages([]);
    setLiveAgentMessage(null);
    setThoughtSteps([]);
  };

  const deleteSession = async (sessionId: string) => {
    try {
      await invoke("delete_session", { sessionId });
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
        setWorkspacePath(null);
        setMessages([]);
        setLiveAgentMessage(null);
      }
      addNotification("success", "Session deleted");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete session";
      addNotification("error", message);
    }
  };

  const updateSessionActivity = async (sessionId: string | null) => {
    if (!sessionId) return;
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;
    const updatedSession = {
      ...session,
      last_active: Math.floor(Date.now() / 1000),
    };
    await invoke("save_session", { session: updatedSession });
    setSessions((prev) => prev.map((s) => (s.id === sessionId ? updatedSession : s)));
  };

  const handleSubmit = async () => {
    const prompt = draft.trim();
    if (!prompt || isSending || !activeSessionId) {
      return;
    }

    const now = Date.now();
    const userMessage: Message = {
      role: "user",
      text: prompt,
      timestamp: now,
      status: "done",
    };

    setMessages((current) => [...current, userMessage]);
    setDraft("");
    setIsSending(true);
    setThoughtSteps(["Understanding your request", "Generating response"]);
    setLiveAgentMessage({
      role: "agent",
      text: "Thinking…",
      status: "thinking",
      timestamp: Date.now(),
      structured: { thoughtChain: [] },
    });

    try {
      await updateSessionActivity(activeSessionId);
      const response = await invoke<string>("send_agent_message", {
        message: prompt,
        session_id: activeSessionId,
      });

      const agentMessage: Message = {
        role: "agent",
        text: response || "(no response received)",
        status: "done",
        timestamp: Date.now(),
        structured: parseStructuredContent(response || ""),
      };

      setMessages((current) => [...current, agentMessage]);
      setLiveAgentMessage(null);
      setThoughtSteps([]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to reach the agent";
      addNotification("error", message);
      setLiveAgentMessage({
        role: "agent",
        text: message,
        status: "error",
        timestamp: Date.now(),
      });
    } finally {
      setIsSending(false);
    }
  };

  const handlePromptSelect = (prompt: Prompt) => {
    setDraft(prompt.body);
  };

  const handleAttachment = () => {
    addNotification("info", "Attachment support coming soon.");
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = (now - timestamp) / 1000;
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;
  const hasMessages = messages.length > 0 || !!liveAgentMessage;

  const renderContent = (message: Message) => {
    const structured = message.structured;

    return (
      <>
        {!structured?.code && !structured?.mermaid && (
          <XMarkdown content={message.text} />
        )}
        {structured?.actions && <Actions items={structured.actions} />}
        {structured?.files && <FileCard files={structured.files} />}
        {structured?.sources && <Sources sources={structured.sources} />}
        {structured?.code && (
          <CodeHighlighter code={structured.code.code} language={structured.code.language} />
        )}
        {structured?.mermaid && <Mermaid definition={structured.mermaid} />}
      </>
    );
  };

  return (
    <main className="app-shell">
      <Conversations
        items={sortedSessions.map((session) => ({
          id: session.id,
          title: session.name,
          description: session.workspace_path,
          meta: formatTimestamp(session.last_active * 1000),
        }))}
        activeId={activeSessionId}
        onSelect={switchSession}
        onAdd={createNewSession}
        onDelete={deleteSession}
      />

      <section className="main">
        <Notification notices={notifications} onClose={closeNotification} />
        <header className="main__header">
          <div>
            <p className="eyebrow">Workspace</p>
            <h1>{activeSession ? activeSession.name : "Open Cowork"}</h1>
            <p className="muted">{workspacePath || "Select a session to begin"}</p>
          </div>
          <div className="status">
            {isSending && <Think text="Thinking" />}
            <ThoughtChain steps={thoughtSteps} />
          </div>
        </header>

        <div className="chat-pane">
          {!activeSession && (
            <Welcome
              title="Welcome to Open Cowork"
              description="Pick or create a session to start collaborating."
              actions={<Prompts prompts={promptPresets} onSelect={handlePromptSelect} />}
            />
          )}

          {activeSession && !hasMessages && (
            <Welcome
              title="Start a conversation"
              description="Use prompts or type your own request."
              actions={<Prompts prompts={promptPresets} onSelect={handlePromptSelect} />}
            />
          )}

          {activeSession && hasMessages && (
            <div className="bubble-list">
              {messages.map((message, index) => (
                <Bubble
                  key={`${message.role}-${message.timestamp}-${index}`}
                  role={message.role}
                  status={message.status}
                  footer={<span className="muted">{formatTimestamp(message.timestamp)}</span>}
                >
                  {renderContent(message)}
                </Bubble>
              ))}
              {liveAgentMessage && (
                <Bubble
                  role={liveAgentMessage.role}
                  status={liveAgentMessage.status}
                  footer={<span className="muted">Live</span>}
                >
                  {renderContent(liveAgentMessage)}
                </Bubble>
              )}
            </div>
          )}
        </div>

        <Sender
          value={draft}
          disabled={!activeSessionId || isSending}
          onChange={setDraft}
          onSend={handleSubmit}
          onAttach={handleAttachment}
          suggestions={suggestionPresets}
        />
      </section>
    </main>
  );
}

function parseStructuredContent(text: string): Message["structured"] {
  const codeMatch = text.match(/```(\w+)?\n([\s\S]*?)```/);
  if (codeMatch) {
    return { code: { language: codeMatch[1] || "text", code: codeMatch[2] } };
  }

  return undefined;
}

export default App;
