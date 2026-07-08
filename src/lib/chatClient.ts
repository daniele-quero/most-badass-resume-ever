export type ChatRole = "user" | "assistant";
export type ProviderId = "gemini" | "groq";

export const PROVIDER_IDS: ProviderId[] = ["gemini", "groq"];
export const PROVIDER_LABELS: Record<ProviderId, string> = {
  gemini: "Gemini (Google)",
  groq: "Groq (Llama)"
};

export interface ChatTurn {
  role: ChatRole;
  content: string;
}

export interface ChatErrorPayload {
  code: string;
  message: string;
}

export class ChatClientError extends Error {
  readonly code: string;
  readonly status?: number;

  constructor(message: string, code: string, status?: number) {
    super(message);
    this.name = "ChatClientError";
    this.code = code;
    this.status = status;
  }
}

export const CHAT_ENDPOINT = "/api/chat";

function isAbortError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    (err as { name?: unknown }).name === "AbortError"
  );
}

function isChatErrorPayload(v: unknown): v is { error: ChatErrorPayload } {
  if (typeof v !== "object" || v === null) return false;
  const err = (v as { error?: unknown }).error;
  if (typeof err !== "object" || err === null) return false;
  const code = (err as { code?: unknown }).code;
  const message = (err as { message?: unknown }).message;
  return typeof code === "string" && typeof message === "string";
}

export interface StreamCallbacks {
  /** Called with the committed provider id as soon as the stream starts. */
  onProvider?: (provider: ProviderId) => void;
  /** Called for each incremental text delta. */
  onDelta?: (text: string) => void;
}

function parseSseEvent(raw: string): { event: string; data: string } {
  let event = "message";
  const dataLines: string[] = [];
  for (const line of raw.split("\n")) {
    if (line.startsWith("event:")) {
      event = line.slice(6).trim();
    } else if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).trim());
    }
  }
  return { event, data: dataLines.join("\n") };
}

/**
 * Sends the conversation and consumes the Server-Sent Events reply stream,
 * invoking `callbacks.onDelta` for each chunk. Resolves with the full reply.
 * A non-OK response is surfaced as a `ChatClientError`; AbortErrors bubble up.
 */
export async function sendChatStream(
  messages: ChatTurn[],
  provider: ProviderId,
  callbacks?: StreamCallbacks,
  signal?: AbortSignal
): Promise<string> {
  let res: Response;
  try {
    res = await fetch(CHAT_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messages, provider }),
      signal
    });
  } catch (err) {
    if (isAbortError(err)) {
      throw err;
    }
    const message =
      err instanceof Error && err.message ? err.message : "Network error";
    throw new ChatClientError(message, "NETWORK_ERROR");
  }

  if (!res.ok) {
    let parsed: unknown;
    try {
      parsed = await res.json();
    } catch {
      throw new ChatClientError("Request failed", "HTTP_ERROR", res.status);
    }
    if (isChatErrorPayload(parsed)) {
      throw new ChatClientError(
        parsed.error.message,
        parsed.error.code,
        res.status
      );
    }
    throw new ChatClientError("Request failed", "HTTP_ERROR", res.status);
  }

  const stream = res.body;
  if (!stream) {
    throw new ChatClientError(
      "Malformed response",
      "MALFORMED_RESPONSE",
      res.status
    );
  }

  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let full = "";

  const handleEvent = (raw: string) => {
    const { event, data } = parseSseEvent(raw);
    if (data === "") return;
    let payload: unknown;
    try {
      payload = JSON.parse(data);
    } catch {
      return;
    }
    if (event === "meta") {
      const p = (payload as { provider?: unknown }).provider;
      if (typeof p === "string") callbacks?.onProvider?.(p as ProviderId);
    } else if (event === "delta") {
      const t = (payload as { text?: unknown }).text;
      if (typeof t === "string" && t !== "") {
        full += t;
        callbacks?.onDelta?.(t);
      }
    } else if (event === "error") {
      const code = (payload as { code?: unknown }).code;
      const message = (payload as { message?: unknown }).message;
      throw new ChatClientError(
        typeof message === "string" ? message : "Stream error",
        typeof code === "string" ? code : "UPSTREAM_ERROR",
        res.status
      );
    }
  };

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let sep: number;
    while ((sep = buffer.indexOf("\n\n")) !== -1) {
      const raw = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);
      handleEvent(raw);
    }
  }

  const tail = buffer.trim();
  if (tail !== "") handleEvent(tail);

  return full;
}
