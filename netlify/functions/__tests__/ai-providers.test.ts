import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

async function importHandler() {
  vi.resetModules();
  const mod = await import("../ai-providers");
  return mod.default;
}

describe("ai-providers handler", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("GET -> 200 with providers and default provider", async () => {
    vi.stubEnv("CHAT_GEMINI_API_KEY", "gemini-key");
    vi.stubEnv("CHAT_GROQ_API_KEY", "");

    const handler = await importHandler();
    const req = new Request("http://localhost/.netlify/functions/ai-providers", {
      method: "GET"
    });
    const res = await handler(req);

    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      providers: Array<{ id: string; label: string; available: boolean }>;
      defaultProvider: string;
    };

    expect(body.providers).toEqual([
      { id: "gemini", label: "Gemini (Google)", available: true },
      { id: "groq", label: "Groq (Llama)", available: false }
    ]);
    expect(body.defaultProvider).toBe("gemini");
  });

  it("GET -> falls back default provider to first configured id when none available", async () => {
    vi.stubEnv("CHAT_GEMINI_API_KEY", "");
    vi.stubEnv("CHAT_GROQ_API_KEY", "");

    const handler = await importHandler();
    const req = new Request("http://localhost/.netlify/functions/ai-providers", {
      method: "GET"
    });
    const res = await handler(req);

    expect(res.status).toBe(200);
    const body = (await res.json()) as { defaultProvider: string };
    expect(body.defaultProvider).toBe("gemini");
  });

  it("method not allowed -> 405 with Allow header", async () => {
    const handler = await importHandler();
    const req = new Request("http://localhost/.netlify/functions/ai-providers", {
      method: "POST"
    });
    const res = await handler(req);

    expect(res.status).toBe(405);
    expect(res.headers.get("Allow")).toBe("GET");
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe("METHOD_NOT_ALLOWED");
  });
});