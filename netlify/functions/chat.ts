import { loadData } from "./lib/dataLoader";
import { buildSystemPrompt } from "./lib/promptBuilder";
import { parseChatRequest, InvalidRequestError } from "./lib/validation";
import { UpstreamError } from "./lib/geminiClient";
import { generateWithFallback } from "./lib/providers";

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

  let reply: string;
  let usedProvider: string;
  try {
    ({ reply, provider: usedProvider } = await generateWithFallback(provider, {
      systemPrompt,
      history: messages,
      apiKeys
    }));
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

  return jsonResponse(200, { reply, provider: usedProvider });
};
