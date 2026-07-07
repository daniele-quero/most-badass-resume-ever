import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UpstreamError } from "../lib/geminiClient";

vi.mock("../lib/providers", () => ({
  openStreamWithFallback: vi.fn(),
  PROVIDER_IDS: ["gemini", "groq"] as const
}));

vi.mock("../lib/dataLoader", () => ({
  loadData: vi.fn(() => Promise.resolve({
    thisisme: "T",
    academy: "A",
    work: "W",
    research: "R",
    courses: "C",
    gamefolio: "G",
    repofolio: "P",
    skills: "S"
  })),
  DATA_KEYS: [
    "thisisme",
    "academy",
    "work",
    "research",
    "courses",
    "gamefolio",
    "repofolio",
    "skills"
  ] as const
}));

async function importHandler() {
  vi.resetModules();
  const mod = await import("../chat");
  return mod.default;
}

function makeRequest(
  method: string,
  body?: string | object | null
): Request {
  const init: RequestInit = {
    method,
    headers: { "content-type": "application/json" }
  };
  if (body !== undefined && body !== null) {
    init.body = typeof body === "string" ? body : JSON.stringify(body);
  }
  return new Request("http://localhost/api/chat", init);
}

async function* fromChunks(chunks: string[]): AsyncGenerator<string> {
  for (const c of chunks) yield c;
}

describe("chat handler", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubEnv("CHAT_GEMINI_API_KEY", "test-key");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    consoleErrorSpy.mockRestore();
  });

  it("GET → 405 METHOD_NOT_ALLOWED with Allow: POST header", async () => {
    const handler = await importHandler();
    const req = new Request("http://localhost/api/chat", { method: "GET" });
    const res = await handler(req);
    expect(res.status).toBe(405);
    expect(res.headers.get("Allow")).toBe("POST");
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe("METHOD_NOT_ALLOWED");
  });

  it("missing secret → 500 MISSING_SECRET", async () => {
    vi.stubEnv("CHAT_GEMINI_API_KEY", "");
    const handler = await importHandler();
    const req = makeRequest("POST", {
      messages: [{ role: "user", content: "hi" }]
    });
    const res = await handler(req);
    expect(res.status).toBe(500);
    const body = (await res.json()) as {
      error: { code: string; message: string };
    };
    expect(body.error.code).toBe("MISSING_SECRET");
    expect(body.error.message).not.toContain("CHAT_GEMINI_API_KEY");
  });

  it("invalid JSON body → 400 INVALID_REQUEST", async () => {
    const handler = await importHandler();
    const req = makeRequest("POST", "not json");
    const res = await handler(req);
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe("INVALID_REQUEST");
  });

  it("body validation error → 400 INVALID_REQUEST", async () => {
    const handler = await importHandler();
    const req = makeRequest("POST", { messages: [] });
    const res = await handler(req);
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe("INVALID_REQUEST");
  });

  it("happy path → 200 SSE stream with meta/delta/done and correct args", async () => {
    const { openStreamWithFallback } = await import("../lib/providers");
    (openStreamWithFallback as ReturnType<typeof vi.fn>).mockResolvedValue({
      provider: "groq",
      stream: fromChunks(["Sono ", "Daniele"])
    });

    const handler = await importHandler();
    const messages = [{ role: "user", content: "Chi sei?" }];
    const req = makeRequest("POST", { messages });
    const res = await handler(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/event-stream");

    const text = await res.text();
    expect(text).toContain("event: meta");
    expect(text).toContain('"provider":"groq"');
    expect(text).toContain("event: delta");
    expect(text).toContain('"text":"Sono "');
    expect(text).toContain('"text":"Daniele"');
    expect(text).toContain("event: done");

    expect(openStreamWithFallback).toHaveBeenCalledTimes(1);
    const [preferred, callArgs] = (
      openStreamWithFallback as ReturnType<typeof vi.fn>
    ).mock.calls[0] as [
      string,
      { apiKeys: Record<string, string>; history: unknown; systemPrompt: string }
    ];
    expect(typeof preferred).toBe("string");
    expect(callArgs.apiKeys.gemini).toBe("test-key");
    expect(callArgs.history).toEqual(messages);
    expect(callArgs.systemPrompt).toContain("<thisisme>");
    expect(callArgs.systemPrompt).toContain("<skills>");
    expect(callArgs.systemPrompt).not.toContain("<research>");
  });

  it("mid-stream failure → SSE error event, no apiKey leaked", async () => {
    async function* broken(): AsyncGenerator<string> {
      yield "partial";
      throw new UpstreamError("stream died");
    }
    const { openStreamWithFallback } = await import("../lib/providers");
    (openStreamWithFallback as ReturnType<typeof vi.fn>).mockResolvedValue({
      provider: "gemini",
      stream: broken()
    });

    const handler = await importHandler();
    const req = makeRequest("POST", {
      messages: [{ role: "user", content: "hi" }]
    });
    const res = await handler(req);

    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain('"text":"partial"');
    expect(text).toContain("event: error");
    expect(text).toContain("UPSTREAM_ERROR");
  });

  it("all providers fail before first token → 500 UPSTREAM_ERROR, apiKey never logged", async () => {
    const { openStreamWithFallback } = await import("../lib/providers");
    (openStreamWithFallback as ReturnType<typeof vi.fn>).mockRejectedValue(
      new UpstreamError("all down")
    );

    const handler = await importHandler();
    const req = makeRequest("POST", {
      messages: [{ role: "user", content: "hi" }]
    });
    const res = await handler(req);

    expect(res.status).toBe(500);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe("UPSTREAM_ERROR");

    for (const call of consoleErrorSpy.mock.calls) {
      const serialized = call
        .map((a) => (typeof a === "string" ? a : JSON.stringify(a)))
        .join(" ");
      expect(serialized).not.toContain("test-key");
    }
  });
});
