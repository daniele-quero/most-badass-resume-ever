import Groq from "groq-sdk";
import type { ChatTurn } from "./types";
import { UpstreamError } from "./geminiClient";
import { MAX_OUTPUT_TOKENS } from "./constants";

export const GROQ_MODEL = "llama-3.3-70b-versatile";

interface GenerateReplyArgs {
  systemPrompt: string;
  history: ChatTurn[];
  apiKey: string;
  signal?: AbortSignal;
}

/**
 * Streams the Groq reply chunk by chunk, yielding non-empty text deltas.
 * Honors the provided AbortSignal (passed to the SDK and re-checked per chunk).
 */
export async function* streamReplyGroq(
  args: GenerateReplyArgs
): AsyncGenerator<string> {
  const { systemPrompt, history, apiKey, signal } = args;

  const messages: Groq.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...history.map((turn) => ({
      role: turn.role === "assistant" ? ("assistant" as const) : ("user" as const),
      content: turn.content
    }))
  ];

  try {
    const groq = new Groq({ apiKey });
    const stream = await groq.chat.completions.create(
      {
        model: GROQ_MODEL,
        messages,
        max_tokens: MAX_OUTPUT_TOKENS,
        stream: true
      },
      { signal }
    );

    for await (const chunk of stream) {
      if (signal?.aborted) {
        throw new UpstreamError("Aborted");
      }
      const text = chunk.choices[0]?.delta?.content ?? "";
      if (text) {
        yield text;
      }
    }
  } catch (err) {
    if (err instanceof UpstreamError) throw err;
    const message =
      err instanceof Error && err.message
        ? err.message
        : "Groq upstream request failed";
    throw new UpstreamError(message);
  }
}
