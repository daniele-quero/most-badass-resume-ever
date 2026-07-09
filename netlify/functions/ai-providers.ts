import {
  PROVIDER_IDS,
  PROVIDER_LABELS,
  type ProviderId
} from "./lib/providers";

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

const PROVIDER_ENV_KEYS: Record<ProviderId, string> = {
  gemini: "CHAT_GEMINI_API_KEY",
  groq: "CHAT_GROQ_API_KEY"
};

export default async (req: Request): Promise<Response> => {
  if (req.method !== "GET") {
    return jsonResponse(
      405,
      errorBody("METHOD_NOT_ALLOWED", "Only GET is allowed"),
      { Allow: "GET" }
    );
  }

  const providers = PROVIDER_IDS.map((id) => ({
    id,
    label: PROVIDER_LABELS[id],
    available: (process.env[PROVIDER_ENV_KEYS[id]] ?? "").length > 0
  }));

  const defaultProvider =
    providers.find((provider) => provider.available)?.id ?? PROVIDER_IDS[0];

  return jsonResponse(200, {
    providers,
    defaultProvider
  });
};