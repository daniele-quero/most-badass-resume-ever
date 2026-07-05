import { type FormEvent, useRef, useState } from "react";

type ChatRole = "assistant" | "user";

type ChatMessage = {
  id: number;
  role: ChatRole;
  text: string;
};

const initialMessage: ChatMessage = {
  id: 0,
  role: "assistant",
  text: "Interfaccia chat pronta. In attesa di provider AI esterno."
};

const fallbackAnswer =
  "Modulo AI non collegato. Connetti endpoint LLM per risposte reali.";

export function ChatPlaceholder() {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const idCursor = useRef(1);

  const createId = () => {
    const nextId = idCursor.current;
    idCursor.current += 1;
    return nextId;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextPrompt = draft.trim();
    if (!nextPrompt) {
      return;
    }

    setMessages((current) => [
      ...current,
      {
        id: createId(),
        role: "user",
        text: nextPrompt
      },
      {
        id: createId(),
        role: "assistant",
        text: fallbackAnswer
      }
    ]);

    setDraft("");
  };

  return (
    <div className="chat-shell">
      <p className="chat-hint">
        Placeholder pronto all&apos;integrazione con servizi AI (streaming o
        request/response).
      </p>

      <ul className="chat-log" aria-live="polite" aria-label="Storico chat">
        {messages.map((message) => (
          <li key={message.id} className={`chat-line ${message.role}`}>
            <p className="chat-role">{message.role === "assistant" ? "AI" : "Tu"}</p>
            <p className="chat-text">{message.text}</p>
          </li>
        ))}
      </ul>

      <form className="chat-form" onSubmit={handleSubmit}>
        <label className="visually-hidden" htmlFor="chat-input">
          Messaggio
        </label>
        <input
          id="chat-input"
          className="chat-input"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Scrivi un prompt..."
          autoComplete="off"
        />
        <button className="chat-submit" type="submit">
          Invia
        </button>
      </form>
    </div>
  );
}
