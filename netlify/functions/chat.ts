import type { ChatTurn } from "./lib/types";
import { loadData } from "./lib/dataLoader";
import { buildSystemPrompt } from "./lib/promptBuilder";
import { parseChatRequest, InvalidRequestError } from "./lib/validation";

const DEFAULT_CHAT_MODEL = "auto:fast";
const AI_GATEWAY_API_KEY_ENV = "AI_GATEWAY_API_KEY";
const AI_GATEWAY_CHAT_URL_ENV = "AI_GATEWAY_CHAT_URL";

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

function parseUpstreamErrorPayload(payload: unknown): {
  code: string;
  message: string;
} {
  if (typeof payload !== "object" || payload === null) {
    return { code: "UPSTREAM_ERROR", message: "Model request failed" };
  }

  const error = (payload as { error?: unknown }).error;
  if (typeof error !== "object" || error === null) {
    return { code: "UPSTREAM_ERROR", message: "Model request failed" };
  }

  const code = (error as { code?: unknown }).code;
  const message = (error as { message?: unknown }).message;
  return {
    code: typeof code === "string" ? code : "UPSTREAM_ERROR",
    message: typeof message === "string" ? message : "Model request failed"
  };
}

export default async (req: Request): Promise<Response> => {
  if (req.method !== "POST") {
    return jsonResponse(
      405,
      errorBody("METHOD_NOT_ALLOWED", "Only POST is allowed"),
      { Allow: "POST" }
    );
  }

  const apiKey = process.env[AI_GATEWAY_API_KEY_ENV] ?? "";
  const upstreamUrl = process.env[AI_GATEWAY_CHAT_URL_ENV] ?? "";

  if (!apiKey || !upstreamUrl) {
    console.error("chat handler: missing gateway configuration");
    return jsonResponse(
      500,
      errorBody("MISSING_SECRET", "AI gateway chat backend not configured")
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

  let messages: ChatTurn[];
  try {
    ({ messages } = parseChatRequest(rawBody));
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

  try {
    const upstream = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "text/event-stream",
        authorization: `Bearer ${apiKey}`,
        "x-ai-gateway-key": apiKey
      },
      body: JSON.stringify({
        model: DEFAULT_CHAT_MODEL,
        stream: true,
        messages: [{ role: "system", content: systemPrompt }, ...messages]
      })
    });

    if (!upstream.ok) {
      let parsed: unknown;
      try {
        parsed = await upstream.json();
      } catch {
        return jsonResponse(
          upstream.status >= 400 && upstream.status < 500 ? upstream.status : 502,
          errorBody("UPSTREAM_ERROR", "Model request failed")
        );
      }

      const { code, message } = parseUpstreamErrorPayload(parsed);
      return jsonResponse(
        upstream.status >= 400 && upstream.status < 500 ? upstream.status : 502,
        errorBody(code, message)
      );
    }

    return new Response(upstream.body, {
      status: 200,
      headers: {
        "content-type":
          upstream.headers.get("content-type") || "text/event-stream; charset=utf-8",
        "cache-control": "no-cache, no-transform",
        connection: "keep-alive"
      }
    });
  } catch (err) {
    console.error("chat handler: upstream request failed", err);
    return jsonResponse(
      502,
      errorBody("UPSTREAM_ERROR", "Model request failed")
    );
  }
};
