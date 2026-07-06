import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../lib/geminiClient", () => ({
  generateReply: vi.fn(),
  UpstreamError: class UpstreamError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "UpstreamError";
    }
  }
}));

vi.mock("../lib/dataLoader", () => ({
  loadData: vi.fn(() => ({
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

  it("happy path → 200 with reply and correct generateReply args", async () => {
    const { generateReply } = await import("../lib/geminiClient");
    (generateReply as ReturnType<typeof vi.fn>).mockResolvedValue(
      "Sono Daniele"
    );

    const handler = await importHandler();
    const messages = [{ role: "user", content: "Chi sei?" }];
    const req = makeRequest("POST", { messages });
    const res = await handler(req);

    expect(res.status).toBe(200);
    const body = (await res.json()) as { reply: string; provider: string };
    expect(body.reply).toBe("Sono Daniele");
    expect(typeof body.provider).toBe("string");

    expect(generateReply).toHaveBeenCalledTimes(1);
    const call = (generateReply as ReturnType<typeof vi.fn>).mock
      .calls[0][0] as {
      apiKey: string;
      history: unknown;
      systemPrompt: string;
    };
    expect(call.apiKey).toBe("test-key");
    expect(call.history).toEqual(messages);
    expect(call.systemPrompt).toContain("<thisisme>");
    expect(call.systemPrompt).toContain("T");
    expect(call.systemPrompt).toContain("<academy>");
    expect(call.systemPrompt).toContain("A");
    expect(call.systemPrompt).toContain("<work>");
    expect(call.systemPrompt).toContain("W");
    expect(call.systemPrompt).toContain("<skills>");
    expect(call.systemPrompt).toContain("S");
  });

  it("SDK failure → 500 UPSTREAM_ERROR and apiKey never logged", async () => {
    const { generateReply } = await import("../lib/geminiClient");
    (generateReply as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("gemini down")
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
