import type { ChatTurn } from "./types";
import { generateReply as generateReplyGemini, UpstreamError } from "./geminiClient";
import { generateReplyGroq } from "./groqClient";

export const PROVIDER_IDS = ["gemini", "groq"] as const;
export type ProviderId = (typeof PROVIDER_IDS)[number];

export const PROVIDER_LABELS: Record<ProviderId, string> = {
  gemini: "Gemini (Google)",
  groq: "Groq (Llama)"
};

interface GenerateArgs {
  systemPrompt: string;
  history: ChatTurn[];
  apiKeys: Partial<Record<ProviderId, string>>;
}

interface GenerateResult {
  reply: string;
  provider: ProviderId;
}

/**
 * Tries providers in cyclic order starting from `preferred`.
 * Falls back to the next available provider on UpstreamError.
 * Throws UpstreamError if all providers fail.
 */
export async function generateWithFallback(
  preferred: ProviderId,
  args: GenerateArgs
): Promise<GenerateResult> {
  const startIdx = PROVIDER_IDS.indexOf(preferred);
  const order = [
    ...PROVIDER_IDS.slice(startIdx),
    ...PROVIDER_IDS.slice(0, startIdx)
  ];

  let lastError: UpstreamError | null = null;

  for (const provider of order) {
    const apiKey = args.apiKeys[provider];
    if (!apiKey) {
      console.warn(`providers: no API key for provider "${provider}", skipping`);
      continue;
    }

    try {
      let reply: string;
      if (provider === "gemini") {
        reply = await generateReplyGemini({
          systemPrompt: args.systemPrompt,
          history: args.history,
          apiKey
        });
      } else {
        reply = await generateReplyGroq({
          systemPrompt: args.systemPrompt,
          history: args.history,
          apiKey
        });
      }
      if (provider !== preferred) {
        console.info(
          `providers: fell back from "${preferred}" to "${provider}"`
        );
      }
      return { reply, provider };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`providers: "${provider}" failed — ${msg}`);
      lastError = err instanceof UpstreamError ? err : new UpstreamError(msg);
    }
  }

  throw lastError ?? new UpstreamError("All providers failed");
}
