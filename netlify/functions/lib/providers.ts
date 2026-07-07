import type { ChatTurn } from "./types";
import { streamReply as streamReplyGemini, UpstreamError } from "./geminiClient";
import { streamReplyGroq } from "./groqClient";

export const PROVIDER_IDS = ["gemini", "groq"] as const;
export type ProviderId = (typeof PROVIDER_IDS)[number];

export const PROVIDER_LABELS: Record<ProviderId, string> = {
  gemini: "Gemini (Google)",
  groq: "Groq (Llama)"
};

/** Max time to wait for the first token before falling back to the next provider. */
export const FIRST_TOKEN_TIMEOUT_MS = 6000;
/** Overall hard cap on a single provider's generation. */
export const OVERALL_TIMEOUT_MS = 25000;

interface StreamArgs {
  systemPrompt: string;
  history: ChatTurn[];
  apiKeys: Partial<Record<ProviderId, string>>;
}

interface OpenStreamResult {
  provider: ProviderId;
  /** Text-delta generator already committed to `provider` (first token consumed). */
  stream: AsyncGenerator<string>;
}

type StreamFn = (args: {
  systemPrompt: string;
  history: ChatTurn[];
  apiKey: string;
  signal: AbortSignal;
}) => AsyncGenerator<string>;

const STREAMERS: Record<ProviderId, StreamFn> = {
  gemini: streamReplyGemini,
  groq: streamReplyGroq
};

async function* wrapCommitted(
  first: string,
  iterator: AsyncIterator<string>,
  overallTimer: ReturnType<typeof setTimeout>
): AsyncGenerator<string> {
  try {
    yield first;
    while (true) {
      const next = await iterator.next();
      if (next.done) break;
      yield next.value;
    }
  } finally {
    clearTimeout(overallTimer);
  }
}

/**
 * Opens a streaming reply, trying providers in cyclic order starting from
 * `preferred`. A provider that fails or does not emit its first token within
 * FIRST_TOKEN_TIMEOUT_MS is abandoned in favor of the next available one.
 * Returns as soon as a provider commits its first token, so the caller can
 * start streaming immediately. Throws UpstreamError if every provider fails.
 */
export async function openStreamWithFallback(
  preferred: ProviderId,
  args: StreamArgs
): Promise<OpenStreamResult> {
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

    const controller = new AbortController();
    const overallTimer = setTimeout(() => controller.abort(), OVERALL_TIMEOUT_MS);
    const firstTokenTimer = setTimeout(
      () => controller.abort(),
      FIRST_TOKEN_TIMEOUT_MS
    );

    try {
      const gen = STREAMERS[provider]({
        systemPrompt: args.systemPrompt,
        history: args.history,
        apiKey,
        signal: controller.signal
      });
      const iterator = gen[Symbol.asyncIterator]();
      const firstResult = await iterator.next();
      clearTimeout(firstTokenTimer);

      if (firstResult.done) {
        clearTimeout(overallTimer);
        throw new UpstreamError(
          `Provider "${provider}" produced an empty stream`
        );
      }

      if (provider !== preferred) {
        console.info(
          `providers: fell back from "${preferred}" to "${provider}"`
        );
      }

      return {
        provider,
        stream: wrapCommitted(firstResult.value, iterator, overallTimer)
      };
    } catch (err) {
      clearTimeout(firstTokenTimer);
      clearTimeout(overallTimer);
      controller.abort();
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`providers: "${provider}" failed — ${msg}`);
      lastError = err instanceof UpstreamError ? err : new UpstreamError(msg);
    }
  }

  throw lastError ?? new UpstreamError("All providers failed");
}
