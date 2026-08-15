import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

function sseResponse(payload: string): Response {
  return new Response(payload, {
    status: 200,
    headers: { "content-type": "text/event-stream; charset=utf-8" }
  });
}

describe("chat handler", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubEnv("AI_GATEWAY_API_KEY", "gateway-key");
    vi.stubEnv("AI_GATEWAY_CHAT_URL", "https://example.test/api/chat");
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
    vi.stubEnv("AI_GATEWAY_API_KEY", "");
    vi.stubEnv("AI_GATEWAY_CHAT_URL", "");
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
    expect(body.error.message).toContain("configured");
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

  it("happy path → 200 SSE stream and forwards auto:fast request", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      sseResponse(
        [
          "event: meta\ndata: {\"provider\":\"groq\"}",
          "event: delta\ndata: {\"text\":\"Sono \"}",
          "event: delta\ndata: {\"text\":\"Daniele\"}",
          "event: done\ndata: {}"
        ].join("\n\n")
      )
    );
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const handler = await importHandler();
    const messages = [{ role: "user", content: "Chi sei?" }];
    const req = makeRequest("POST", { messages });
    const res = await handler(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/event-stream");

    const text = await res.text();
    expect(text).toContain("event: meta");
    expect(text).toContain('"provider":"groq"');
    expect(text).toContain('"text":"Sono "');
    expect(text).toContain('"text":"Daniele"');
    expect(text).toContain("event: done");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://example.test/api/chat");
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({
      authorization: "Bearer gateway-key",
      accept: "text/event-stream",
      "content-type": "application/json"
    });
    const body = JSON.parse(init.body as string);
    expect(body.model).toBe("auto:fast");
    expect(body.stream).toBe(true);
    expect(body.messages).toHaveLength(2);
    expect(body.messages[0]).toEqual({ role: "system", content: expect.any(String) });
    expect(body.messages[0].content).toContain("<thisisme>");
    expect(body.messages[0].content).toContain("<skills>");
    expect(body.messages[0].content).not.toContain("<research>");
    expect(body.messages[1]).toEqual(messages[0]);
  });

  it("upstream HTTP error → JSON error payload without leaking the api key", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: { code: "MODEL_NOT_FOUND", message: "No such model" } }), {
        status: 404,
        headers: { "content-type": "application/json" }
      })
    );
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const handler = await importHandler();
    const req = makeRequest("POST", {
      messages: [{ role: "user", content: "hi" }]
    });
    const res = await handler(req);

    expect(res.status).toBe(404);
    const body = (await res.json()) as { error: { code: string; message: string } };
    expect(body.error.code).toBe("MODEL_NOT_FOUND");
    expect(body.error.message).toBe("No such model");
    expect(JSON.stringify(consoleErrorSpy.mock.calls)).not.toContain("gateway-key");
  });
});
