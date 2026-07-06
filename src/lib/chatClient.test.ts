import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  CHAT_ENDPOINT,
  ChatClientError,
  sendChat,
  type ChatTurn
} from "./chatClient";

const originalFetch = globalThis.fetch;

function makeResponse(init: {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
}) {
  return init as unknown as Response;
}

describe("chatClient.sendChat", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("returns reply on success and calls fetch with correct args", async () => {
    fetchMock.mockResolvedValue(
      makeResponse({
        ok: true,
        status: 200,
        json: async () => ({ reply: "Hello!" })
      })
    );

    const messages: ChatTurn[] = [{ role: "user", content: "hi" }];
    const result = await sendChat(messages, "gemini");
    expect(result).toBe("Hello!");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(CHAT_ENDPOINT);
    expect(init.method).toBe("POST");
    expect(
      (init.headers as Record<string, string>)["content-type"]
    ).toMatch(/application\/json/);
    expect(JSON.parse(init.body as string)).toEqual({ messages, provider: "gemini" });
  });

  it("throws ChatClientError with structured error payload on HTTP error", async () => {
    fetchMock.mockResolvedValue(
      makeResponse({
        ok: false,
        status: 400,
        json: async () => ({
          error: { code: "INVALID_REQUEST", message: "bad" }
        })
      })
    );

    await expect(
      sendChat([{ role: "user", content: "x" }], "gemini")
    ).rejects.toMatchObject({
      name: "ChatClientError",
      code: "INVALID_REQUEST",
      status: 400,
      message: "bad"
    });
  });

  it("throws ChatClientError HTTP_ERROR when error payload cannot be parsed", async () => {
    fetchMock.mockResolvedValue(
      makeResponse({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error("nope");
        }
      })
    );

    await expect(
      sendChat([{ role: "user", content: "x" }], "gemini")
    ).rejects.toMatchObject({
      name: "ChatClientError",
      code: "HTTP_ERROR",
      status: 500
    });
  });

  it("throws MALFORMED_RESPONSE when success body is missing reply", async () => {
    fetchMock.mockResolvedValue(
      makeResponse({
        ok: true,
        status: 200,
        json: async () => ({ notReply: 1 })
      })
    );

    await expect(
      sendChat([{ role: "user", content: "x" }], "gemini")
    ).rejects.toMatchObject({
      name: "ChatClientError",
      code: "MALFORMED_RESPONSE"
    });
  });

  it("wraps network errors as ChatClientError NETWORK_ERROR", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));

    await expect(
      sendChat([{ role: "user", content: "x" }], "gemini")
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
      await sendChat([{ role: "user", content: "x" }], "gemini");
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeDefined();
    expect((caught as Error).name).toBe("AbortError");
    expect(caught).not.toBeInstanceOf(ChatClientError);
  });
});
