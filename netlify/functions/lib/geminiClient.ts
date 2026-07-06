import { GoogleGenAI } from "@google/genai";
import type { ChatTurn } from "./types";

export const GEMINI_MODEL = "gemini-2.0-flash";

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
}

export async function generateReply(args: GenerateReplyArgs): Promise<string> {
  const { systemPrompt, history, apiKey } = args;

  const contents = history.map((turn) => ({
    role: turn.role === "assistant" ? "model" : "user",
    parts: [{ text: turn.content }]
  }));

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        systemInstruction: { parts: [{ text: systemPrompt }] }
      }
    });

    const primary = response.text;
    const fallback =
      response.candidates?.[0]?.content?.parts?.[0]?.text ?? undefined;
    const text = (primary ?? fallback ?? "").trim();

    if (!text) {
      throw new UpstreamError("Empty response from model");
    }

    return text;
  } catch (err) {
    if (err instanceof UpstreamError) throw err;
    const message =
      err instanceof Error && err.message
        ? err.message
        : "Upstream request failed";
    throw new UpstreamError(message);
  }
}
