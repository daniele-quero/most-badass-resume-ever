import { type FormEvent, useEffect, useRef, useState } from "react";
import {
  ChatClientError,
  type ChatTurn,
  type ProviderId,
  PROVIDER_IDS,
  PROVIDER_LABELS,
  sendChat
} from "../lib/chatClient";
import {
  getPersistedChatState,
  setPersistedChatState,
  type ChatStatus,
  type ChatViewState
} from "./chatState";

const greeting: ChatTurn = {
  role: "assistant",
  content:
    "Hello, I'm Daniele Quero's digital twin. Ask me about my education, work experience, technical skills, or public projects."
};

const genericErrorMessage = "Network error. Please try again.";

function isAbortError(err: unknown): boolean {
  return err instanceof Error && err.name === "AbortError";
}

export function Chat() {
  const initialState = getPersistedChatState(greeting);
  const [messages, setMessages] = useState<ChatTurn[]>(initialState.messages);
  const [draft, setDraft] = useState(initialState.draft);
  const [status, setStatus] = useState<ChatStatus>(initialState.status);
  const [lastError, setLastError] = useState<string | null>(initialState.lastError);
  const [provider, setProvider] = useState<ProviderId>(initialState.provider);
  const abortRef = useRef<AbortController | null>(null);
  const stateRef = useRef<ChatViewState>(initialState);

  stateRef.current = {
    messages,
    draft,
    status,
    lastError,
    provider
  };

  useEffect(() => {
    setPersistedChatState(stateRef.current);
  }, [messages, draft, status, lastError, provider]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();

      const snapshot = stateRef.current;
      setPersistedChatState({
        ...snapshot,
        status: snapshot.status === "sending" ? "idle" : snapshot.status,
        lastError: snapshot.status === "sending" ? null : snapshot.lastError
      });
    };
  }, []);

  const runRequest = async (history: ChatTurn[]) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const reply = await sendChat(history, provider, controller.signal);
      setMessages([...history, { role: "assistant", content: reply }]);
      setStatus("idle");
      setLastError(null);
    } catch (err) {
      if (isAbortError(err)) {
        return;
      }
      setStatus("error");
      setLastError(
        err instanceof ChatClientError ? err.message : genericErrorMessage
      );
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (status === "sending") return;
    const trimmed = draft.trim();
    if (trimmed === "") return;

    const userTurn: ChatTurn = { role: "user", content: trimmed };
    const nextHistory: ChatTurn[] = [...messages, userTurn];

    setMessages(nextHistory);
    setDraft("");
    setStatus("sending");
    setLastError(null);

    await runRequest(nextHistory);
  };

  const handleRetry = async () => {
    if (status !== "error") return;
    const last = messages[messages.length - 1];
    if (!last || last.role !== "user") return;

    setStatus("sending");
    setLastError(null);
    await runRequest(messages);
  };

  return (
    <div className="chat-shell">
      <div className="chat-toolbar">
        <p className="chat-hint">
          Digital twin of Daniele Quero - ask about his professional background.
        </p>
        <label className="chat-provider-label" htmlFor="chat-provider">
          Provider
          <select
            id="chat-provider"
            className="chat-provider-select"
            value={provider}
            onChange={(e) => setProvider(e.target.value as ProviderId)}
            disabled={status === "sending"}
          >
            {PROVIDER_IDS.map((id) => (
              <option key={id} value={id}>
                {PROVIDER_LABELS[id]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ul className="chat-log" aria-live="polite" aria-label="Chat history">
        {messages.map((m, i) => (
          <li key={i} className={`chat-line ${m.role}`}>
            <p className="chat-role">{m.role === "assistant" ? "Daniele" : "You"}</p>
            <p className="chat-text">{m.content}</p>
          </li>
        ))}
        {status === "sending" && (
          <li className="chat-line assistant chat-loading" aria-live="polite">
            <p className="chat-role">Daniele</p>
            <p className="chat-text">…</p>
          </li>
        )}
      </ul>

      {status === "error" && lastError && (
        <div className="chat-error" role="alert">
          <span>{lastError}</span>
          <button type="button" className="chat-retry" onClick={handleRetry}>
            Retry
          </button>
        </div>
      )}

      <form className="chat-form" onSubmit={handleSubmit}>
        <label className="visually-hidden" htmlFor="chat-input">
          Message
        </label>
        <input
          id="chat-input"
          className="chat-input"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={
            status === "sending" ? "Waiting for reply..." : "Type a message..."
          }
          autoComplete="off"
          disabled={status === "sending"}
        />
        <button
          className="chat-submit"
          type="submit"
          disabled={status === "sending" || draft.trim() === ""}
        >
          Send
        </button>
      </form>
    </div>
  );
}
