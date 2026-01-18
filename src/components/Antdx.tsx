import { ReactNode } from "react";

export type ConversationItem = {
  id: string;
  title: string;
  description?: string;
  meta?: string;
};

type ConversationsProps = {
  items: ConversationItem[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
};

export function Conversations({ items, activeId, onSelect, onAdd, onDelete }: ConversationsProps) {
  return (
    <aside className="conversations">
      <div className="conversations__header">
        <div>
          <p className="eyebrow">Conversations</p>
          <h2>Sessions</h2>
        </div>
        <button className="btn ghost" type="button" onClick={onAdd}>
          + New
        </button>
      </div>
      <div className="conversations__list">
        {items.map((item) => (
          <div
            key={item.id}
            className={`conversation-card ${activeId === item.id ? "active" : ""}`}
            onClick={() => onSelect(item.id)}
          >
            <div className="conversation-card__body">
              <div className="conversation-card__title">{item.title}</div>
              {item.description && <div className="conversation-card__desc">{item.description}</div>}
              {item.meta && <div className="conversation-card__meta">{item.meta}</div>}
            </div>
            <button
              className="btn icon"
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onDelete(item.id);
              }}
              aria-label={`Delete ${item.title}`}
            >
              ×
            </button>
          </div>
        ))}
        {items.length === 0 && <div className="empty-text">No sessions yet</div>}
      </div>
    </aside>
  );
}

export type NotificationItem = {
  id: string;
  type: "info" | "success" | "warning" | "error";
  message: string;
};

type NotificationProps = {
  notices: NotificationItem[];
  onClose: (id: string) => void;
};

export function Notification({ notices, onClose }: NotificationProps) {
  if (notices.length === 0) return null;
  return (
    <div className="notification-stack">
      {notices.map((notice) => (
        <div key={notice.id} className={`notice ${notice.type}`}>
          <div>{notice.message}</div>
          <button className="btn icon" type="button" onClick={() => onClose(notice.id)} aria-label="Dismiss">
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

type BubbleProps = {
  role: "user" | "agent";
  status?: "thinking" | "streaming" | "done" | "error";
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
};

export function Bubble({ role, status, header, footer, children }: BubbleProps) {
  return (
    <div className={`bubble bubble--${role} ${status ? `bubble--${status}` : ""}`}>
      <div className="bubble__header">
        <span className="label">{role === "user" ? "You" : "Agent"}</span>
        {status && <span className="pill subtle">{status}</span>}
        {header}
      </div>
      <div className="bubble__body">{children}</div>
      {footer && <div className="bubble__footer">{footer}</div>}
    </div>
  );
}

type WelcomeProps = {
  title: string;
  description: string;
  actions?: ReactNode;
};

export function Welcome({ title, description, actions }: WelcomeProps) {
  return (
    <div className="welcome">
      <h1>{title}</h1>
      <p>{description}</p>
      {actions && <div className="welcome__actions">{actions}</div>}
    </div>
  );
}

type Prompt = { id: string; title: string; body: string };

type PromptsProps = {
  prompts: Prompt[];
  onSelect: (prompt: Prompt) => void;
};

export function Prompts({ prompts, onSelect }: PromptsProps) {
  return (
    <div className="prompts">
      {prompts.map((prompt) => (
        <button key={prompt.id} className="prompt-card" type="button" onClick={() => onSelect(prompt)}>
          <div className="prompt-title">{prompt.title}</div>
          <div className="prompt-body">{prompt.body}</div>
        </button>
      ))}
    </div>
  );
}

type SenderProps = {
  value: string;
  disabled?: boolean;
  onChange: (val: string) => void;
  onSend: () => void;
  onAttach?: () => void;
  suggestions?: string[];
};

export function Sender({ value, disabled, onChange, onSend, onAttach, suggestions = [] }: SenderProps) {
  return (
    <div className="sender">
      <div className="sender__controls">
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Type your request…"
          disabled={disabled}
        />
        <div className="sender__actions">
          <div className="sender__suggestions">
            {suggestions.map((s) => (
              <Suggestion key={s} label={s} onClick={() => onChange(s)} />
            ))}
          </div>
          <div className="sender__buttons">
            <Attachment onClick={onAttach} />
            <button className="btn primary" type="button" onClick={onSend} disabled={disabled || !value.trim()}>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

type AttachmentProps = { onClick?: () => void };

export function Attachment({ onClick }: AttachmentProps) {
  return (
    <button type="button" className="btn ghost" onClick={onClick}>
      📎 Attachment
    </button>
  );
}

type SuggestionProps = { label: string; onClick: () => void };

export function Suggestion({ label, onClick }: SuggestionProps) {
  return (
    <button className="suggestion" type="button" onClick={onClick}>
      {label}
    </button>
  );
}

type ThinkProps = { text?: string };
export function Think({ text = "Thinking" }: ThinkProps) {
  return <div className="think">🤔 {text}…</div>;
}

type ThoughtChainProps = { steps: string[] };
export function ThoughtChain({ steps }: ThoughtChainProps) {
  if (steps.length === 0) return null;
  return (
    <div className="thought-chain">
      {steps.map((step, index) => (
        <div key={step} className="thought-chain__step">
          <span className="pill subtle">{index + 1}</span>
          <span>{step}</span>
        </div>
      ))}
    </div>
  );
}

type ActionsProps = { items: { label: string; hint?: string }[] };
export function Actions({ items }: ActionsProps) {
  if (items.length === 0) return null;
  return (
    <div className="actions">
      {items.map((item) => (
        <div key={item.label} className="action-item">
          <span>{item.label}</span>
          {item.hint && <span className="action-hint">{item.hint}</span>}
        </div>
      ))}
    </div>
  );
}

type FileCardProps = { files: { name: string; path?: string }[] };
export function FileCard({ files }: FileCardProps) {
  if (files.length === 0) return null;
  return (
    <div className="file-cards">
      {files.map((file) => (
        <div key={file.name} className="file-card">
          <div className="file-card__name">{file.name}</div>
          {file.path && <div className="file-card__path">{file.path}</div>}
        </div>
      ))}
    </div>
  );
}

type Source = { label: string; url?: string };
type SourcesProps = { sources: Source[] };
export function Sources({ sources }: SourcesProps) {
  if (sources.length === 0) return null;
  return (
    <div className="sources">
      {sources.map((source) => (
        <div key={source.label} className="source">
          <span>{source.label}</span>
          {source.url && (
            <a href={source.url} target="_blank" rel="noreferrer">
              Open
            </a>
          )}
        </div>
      ))}
    </div>
  );
}

type CodeHighlighterProps = { code: string; language?: string };
export function CodeHighlighter({ code, language }: CodeHighlighterProps) {
  return (
    <pre className="code-block">
      <div className="code-block__lang">{language || "code"}</div>
      <code>{code}</code>
    </pre>
  );
}

type MermaidProps = { definition: string };
export function Mermaid({ definition }: MermaidProps) {
  return (
    <pre className="mermaid-block">
      <div className="code-block__lang">mermaid</div>
      <code>{definition}</code>
    </pre>
  );
}
