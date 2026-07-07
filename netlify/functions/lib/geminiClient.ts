import { GoogleGenAI } from "@google/genai";
import type { ChatTurn } from "./types";
import { MAX_OUTPUT_TOKENS } from "./constants";

export const GEMINI_MODEL = "gemini-2.0-flash";

export { MAX_OUTPUT_TOKENS } from "./constants";

export class UpstreamError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UpstreamError";
  }
}

interface GenerateReplyArgs {
  systemPrompt: string;
  history: ChatTurn[];
  apiKey: string;
  signal?: AbortSignal;
}

function toContents(history: ChatTurn[]) {
  return history.map((turn) => ({
    role: turn.role === "assistant" ? "model" : "user",
    parts: [{ text: turn.content }]
  }));
}

/**
 * Streams the model reply chunk by chunk, yielding non-empty text deltas.
 * Honors the provided AbortSignal (passed to the SDK and re-checked per chunk).
 */
export async function* streamReply(
  args: GenerateReplyArgs
): AsyncGenerator<string> {
  const { systemPrompt, history, apiKey, signal } = args;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const stream = await ai.models.generateContentStream({
      model: GEMINI_MODEL,
      contents: toContents(history),
      config: {
        systemInstruction: { parts: [{ text: systemPrompt }] },
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        abortSignal: signal
      }
    });

    for await (const chunk of stream) {
      if (signal?.aborted) {
        throw new UpstreamError("Aborted");
      }
      const text = chunk.text ?? "";
      if (text) {
        yield text;
      }
    }
  } catch (err) {
    if (err instanceof UpstreamError) throw err;
    const message =
      err instanceof Error && err.message
        ? err.message
        : "Upstream request failed";
    throw new UpstreamError(message);
  }
}
