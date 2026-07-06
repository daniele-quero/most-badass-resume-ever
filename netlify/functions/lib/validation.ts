import type { ChatTurn } from "./types";
import { PROVIDER_IDS, type ProviderId } from "./providers";

const MAX_MESSAGES = 40;
const MIN_MESSAGES = 1;
const MAX_CONTENT_CHARS = 4000;
const MAX_TOTAL_CHARS = 60000;
const VALID_ROLES = new Set(["user", "assistant"]);

export class InvalidRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidRequestError";
  }
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function parseChatRequest(body: unknown): {
  messages: ChatTurn[];
  provider: ProviderId;
} {
  if (!isPlainObject(body)) {
    throw new InvalidRequestError("Body must be a JSON object");
  }

  // Validate provider (optional, defaults to "gemini")
  const rawProvider = body["provider"];
  let provider: ProviderId = "gemini";
  if (rawProvider !== undefined) {
    if (!PROVIDER_IDS.includes(rawProvider as ProviderId)) {
      throw new InvalidRequestError(
        `'provider' must be one of: ${PROVIDER_IDS.join(", ")}`
      );
    }
    provider = rawProvider as ProviderId;
  }

  const rawMessages = body["messages"];
  if (!Array.isArray(rawMessages)) {
    throw new InvalidRequestError("'messages' must be an array");
  }

  if (rawMessages.length < MIN_MESSAGES || rawMessages.length > MAX_MESSAGES) {
    throw new InvalidRequestError(
      `'messages' must contain ${MIN_MESSAGES}\u2013${MAX_MESSAGES} entries`
    );
  }

  let total = 0;
  const messages: ChatTurn[] = [];
  for (const item of rawMessages) {
    if (!isPlainObject(item)) {
      throw new InvalidRequestError(
        "Each message must have role 'user'|'assistant' and non-empty string content"
      );
    }
    const role = item["role"];
    const content = item["content"];
    if (
      typeof role !== "string" ||
      !VALID_ROLES.has(role) ||
      typeof content !== "string" ||
      content.length === 0
    ) {
      throw new InvalidRequestError(
        "Each message must have role 'user'|'assistant' and non-empty string content"
      );
    }

    if (content.length > MAX_CONTENT_CHARS) {
      throw new InvalidRequestError(
        `Each message content must be <= ${MAX_CONTENT_CHARS} chars`
      );
    }

    total += content.length;
    if (total > MAX_TOTAL_CHARS) {
      throw new InvalidRequestError(
        `Total payload exceeds ${MAX_TOTAL_CHARS} chars`
      );
    }

    messages.push({ role: role as ChatTurn["role"], content });
  }

  const last = messages[messages.length - 1] as ChatTurn;
  if (last.role !== "user") {
    throw new InvalidRequestError("Last message must be from user");
  }

  return { messages, provider };
}
