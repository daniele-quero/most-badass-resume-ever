import Groq from "groq-sdk";
import type { ChatTurn } from "./types";
import { UpstreamError } from "./geminiClient";

export const GROQ_MODEL = "llama-3.3-70b-versatile";

interface GenerateReplyArgs {
  systemPrompt: string;
  history: ChatTurn[];
  apiKey: string;
}

export async function generateReplyGroq(
  args: GenerateReplyArgs
): Promise<string> {
  const { systemPrompt, history, apiKey } = args;

  const messages: Groq.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...history.map((turn) => ({
      role: turn.role === "assistant" ? ("assistant" as const) : ("user" as const),
      content: turn.content
    }))
  ];

  try {
    const groq = new Groq({ apiKey });
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages
    });

    const text = (completion.choices[0]?.message?.content ?? "").trim();

    if (!text) {
      throw new UpstreamError("Empty response from Groq model");
    }

    return text;
  } catch (err) {
    if (err instanceof UpstreamError) throw err;
    const message =
      err instanceof Error && err.message
        ? err.message
        : "Groq upstream request failed";
    throw new UpstreamError(message);
  }
}
