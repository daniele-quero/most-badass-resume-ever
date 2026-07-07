import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  CHAT_ENDPOINT,
  ChatClientError,
  sendChatStream,
  type ChatTurn
} from "./chatClient";

const originalFetch = globalThis.fetch;

function sseResponse(events: string[], init?: { status?: number }): Response {
  const payload = events.map((e) => `${e}\n\n`).join("");
  return new Response(payload, {
    status: init?.status ?? 200,
    headers: { "content-type": "text/event-stream" }
  });
}

function delta(text: string): string {
  return `event: delta\ndata: ${JSON.stringify({ text })}`;
}

describe("chatClient.sendChatStream", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("streams deltas, invokes callbacks, and returns the full reply", async () => {
    fetchMock.mockResolvedValue(
      sseResponse([
        `event: meta\ndata: ${JSON.stringify({ provider: "groq" })}`,
        delta("Hello"),
        delta(" world"),
        "event: done\ndata: {}"
      ])
    );

    const deltas: string[] = [];
    let provider: string | undefined;
    const messages: ChatTurn[] = [{ role: "user", content: "hi" }];
    const result = await sendChatStream(messages, "gemini", {
      onProvider: (p) => (provider = p),
      onDelta: (t) => deltas.push(t)
    });

    expect(result).toBe("Hello world");
    expect(deltas).toEqual(["Hello", " world"]);
    expect(provider).toBe("groq");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(CHAT_ENDPOINT);
    expect(init.method).toBe("POST");
    expect(
      (init.headers as Record<string, string>)["content-type"]
    ).toMatch(/application\/json/);
    expect(JSON.parse(init.body as string)).toEqual({
      messages,
      provider: "gemini"
    });
  });

  it("throws ChatClientError with structured error payload on HTTP error", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({ error: { code: "INVALID_REQUEST", message: "bad" } }),
        { status: 400, headers: { "content-type": "application/json" } }
      )
    );

    await expect(
      sendChatStream([{ role: "user", content: "x" }], "gemini")
    ).rejects.toMatchObject({
      name: "ChatClientError",
      code: "INVALID_REQUEST",
      status: 400,
      message: "bad"
    });
  });

  it("throws ChatClientError HTTP_ERROR when error payload cannot be parsed", async () => {
    fetchMock.mockResolvedValue(
      new Response("not json", { status: 500 })
    );

    await expect(
      sendChatStream([{ role: "user", content: "x" }], "gemini")
    ).rejects.toMatchObject({
      name: "ChatClientError",
      code: "HTTP_ERROR",
      status: 500
    });
  });

  it("throws MALFORMED_RESPONSE when the OK response has no body", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }));

    await expect(
      sendChatStream([{ role: "user", content: "x" }], "gemini")
    ).rejects.toMatchObject({
      name: "ChatClientError",
      code: "MALFORMED_RESPONSE"
    });
  });

  it("throws ChatClientError when the stream emits an error event", async () => {
    fetchMock.mockResolvedValue(
      sseResponse([
        delta("partial"),
        `event: error\ndata: ${JSON.stringify({
          code: "UPSTREAM_ERROR",
          message: "boom"
        })}`
      ])
    );

    await expect(
      sendChatStream([{ role: "user", content: "x" }], "gemini")
    ).rejects.toMatchObject({
      name: "ChatClientError",
      code: "UPSTREAM_ERROR",
      message: "boom"
    });
  });

  it("wraps network errors as ChatClientError NETWORK_ERROR", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));

    await expect(
      sendChatStream([{ role: "user", content: "x" }], "gemini")
    ).rejects.toMatchObject({
      name: "ChatClientError",
      code: "NETWORK_ERROR"
    });
  });

  it("rethrows AbortError without wrapping in ChatClientError", async () => {
    const abortErr =
      typeof DOMException !== "undefined"
        ? new DOMException("aborted", "AbortError")
        : Object.assign(new Error("aborted"), { name: "AbortError" });
    fetchMock.mockRejectedValue(abortErr);

    let caught: unknown;
    try {
      await sendChatStream([{ role: "user", content: "x" }], "gemini");
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeDefined();
    expect((caught as Error).name).toBe("AbortError");
    expect(caught).not.toBeInstanceOf(ChatClientError);
  });
});
