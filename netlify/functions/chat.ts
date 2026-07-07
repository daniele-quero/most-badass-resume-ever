import { loadData } from "./lib/dataLoader";
import { buildSystemPrompt } from "./lib/promptBuilder";
import { parseChatRequest, InvalidRequestError } from "./lib/validation";
import { UpstreamError } from "./lib/geminiClient";
import { openStreamWithFallback, type ProviderId } from "./lib/providers";

interface ErrorBody {
  error: {
    code: string;
    message: string;
  };
}

function jsonResponse(
  status: number,
  body: unknown,
  extraHeaders?: Record<string, string>
): Response {
  const headers: Record<string, string> = {
    "content-type": "application/json"
  };
  if (extraHeaders) {
    for (const [k, v] of Object.entries(extraHeaders)) {
      headers[k] = v;
    }
  }
  return new Response(JSON.stringify(body), { status, headers });
}

function errorBody(code: string, message: string): ErrorBody {
  return { error: { code, message } };
}

function sseEvent(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

/**
 * Builds a Server-Sent Events stream:
 *  - `meta`  once, carrying the committed provider id
 *  - `delta` per text chunk
 *  - `done`  on successful completion
 *  - `error` if the upstream stream breaks mid-flight (tokens already sent)
 */
function buildSseResponse(
  provider: ProviderId,
  stream: AsyncGenerator<string>
): Response {
  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(encoder.encode(sseEvent("meta", { provider })));
      try {
        for await (const chunk of stream) {
          controller.enqueue(encoder.encode(sseEvent("delta", { text: chunk })));
        }
        controller.enqueue(encoder.encode(sseEvent("done", {})));
      } catch (err) {
        console.error("chat handler: stream interrupted", err);
        controller.enqueue(
          encoder.encode(
            sseEvent("error", {
              code: "UPSTREAM_ERROR",
              message: "Stream interrupted"
            })
          )
        );
      } finally {
        controller.close();
      }
    }
  });

  return new Response(body, {
    status: 200,
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive"
    }
  });
}

export default async (req: Request): Promise<Response> => {
  if (req.method !== "POST") {
    return jsonResponse(
      405,
      errorBody("METHOD_NOT_ALLOWED", "Only POST is allowed"),
      { Allow: "POST" }
    );
  }

  const apiKeys = {
    gemini: process.env["CHAT_GEMINI_API_KEY"] ?? "",
    groq: process.env["CHAT_GROQ_API_KEY"] ?? ""
  };

  const hasAnyKey = Object.values(apiKeys).some((k) => k.length > 0);
  if (!hasAnyKey) {
    console.error("chat handler: no API keys configured");
    return jsonResponse(
      500,
      errorBody("MISSING_SECRET", "Chat backend not configured")
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return jsonResponse(
      400,
      errorBody("INVALID_REQUEST", "Body must be valid JSON")
    );
  }

  let messages;
  let provider;
  try {
    ({ messages, provider } = parseChatRequest(rawBody));
  } catch (err) {
    if (err instanceof InvalidRequestError) {
      return jsonResponse(400, errorBody("INVALID_REQUEST", err.message));
    }
    console.error("chat handler: unexpected validation error", err);
    return jsonResponse(
      400,
      errorBody("INVALID_REQUEST", "Invalid request payload")
    );
  }

  let systemPrompt: string;
  try {
    const data = await loadData();
    systemPrompt = buildSystemPrompt(data);
  } catch (err) {
    console.error("chat handler: failed to load profile data", err);
    return jsonResponse(
      500,
      errorBody("DATA_LOAD_ERROR", "Failed to load profile data")
    );
  }

  // Fallback happens during time-to-first-token; only after a provider commits
  // its first chunk do we start streaming a 200 SSE response. If every provider
  // fails before the first token, return a clean JSON error instead.
  try {
    const { provider: usedProvider, stream } = await openStreamWithFallback(
      provider,
      { systemPrompt, history: messages, apiKeys }
    );
    return buildSseResponse(usedProvider, stream);
  } catch (err) {
    if (err instanceof UpstreamError) {
      console.error("chat handler: upstream error", err.message);
    } else {
      console.error("chat handler: unexpected model error", err);
    }
    return jsonResponse(
      500,
      errorBody("UPSTREAM_ERROR", "Model request failed")
    );
  }
};
