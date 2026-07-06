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

export async function sendChat(
  messages: ChatTurn[],
  provider: ProviderId,
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

  let payload: unknown;
  try {
    payload = await res.json();
  } catch {
    throw new ChatClientError(
      "Malformed response",
      "MALFORMED_RESPONSE",
      res.status
    );
  }

  if (
    typeof payload !== "object" ||
    payload === null ||
    typeof (payload as { reply?: unknown }).reply !== "string"
  ) {
    throw new ChatClientError(
      "Malformed response",
      "MALFORMED_RESPONSE",
      res.status
    );
  }

  return (payload as { reply: string }).reply;
}
