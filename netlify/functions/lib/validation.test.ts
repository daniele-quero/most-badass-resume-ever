import { describe, expect, it } from "vitest";
import { InvalidRequestError, parseChatRequest } from "./validation";

describe("parseChatRequest", () => {
  it("accepts a minimal valid payload", () => {
    const body = { messages: [{ role: "user", content: "ciao" }] };
    const parsed = parseChatRequest(body);
    expect(parsed.messages).toEqual([{ role: "user", content: "ciao" }]);
  });

  it("does not mutate the input", () => {
    const body = { messages: [{ role: "user", content: "hello" }] };
    const snapshot = JSON.parse(JSON.stringify(body));
    parseChatRequest(body);
    expect(body).toEqual(snapshot);
  });

  it("is idempotent", () => {
    const body = {
      messages: [
        { role: "user", content: "one" },
        { role: "assistant", content: "two" },
        { role: "user", content: "three" }
      ]
    };
    const a = parseChatRequest(body);
    const b = parseChatRequest(body);
    expect(a).toEqual(b);
  });

  it.each([
    ["null", null],
    ["string", "stringa"],
    ["number", 42],
    ["array", []],
    ["empty object", {}]
  ])("rejects non-object / bad body: %s", (_label, body) => {
    expect(() => parseChatRequest(body)).toThrow(InvalidRequestError);
  });

  it("rejects when 'messages' is not an array", () => {
    expect(() => parseChatRequest({ messages: "no" })).toThrow(
      InvalidRequestError
    );
  });

  it("rejects an empty messages array", () => {
    expect(() => parseChatRequest({ messages: [] })).toThrow(
      InvalidRequestError
    );
  });

  it("rejects when messages exceed 40 entries", () => {
    const messages = Array.from({ length: 41 }, () => ({
      role: "user",
      content: "x"
    }));
    expect(() => parseChatRequest({ messages })).toThrow(InvalidRequestError);
  });

  it("rejects an unknown role like 'system'", () => {
    expect(() =>
      parseChatRequest({
        messages: [{ role: "system", content: "hi" }]
      })
    ).toThrow(InvalidRequestError);
  });

  it("rejects an empty string content", () => {
    expect(() =>
      parseChatRequest({
        messages: [{ role: "user", content: "" }]
      })
    ).toThrow(InvalidRequestError);
  });

  it("rejects content longer than 4000 chars", () => {
    expect(() =>
      parseChatRequest({
        messages: [{ role: "user", content: "a".repeat(4001) }]
      })
    ).toThrow(InvalidRequestError);
  });

  it("rejects a total payload above 60000 chars", () => {
    const bigContent = "a".repeat(4000);
    const messages: Array<{ role: string; content: string }> = [];
    for (let i = 0; i < 16; i += 1) {
      messages.push({
        role: i % 2 === 0 ? "user" : "assistant",
        content: bigContent
      });
    }
    messages.push({ role: "user", content: "final" });
    expect(() => parseChatRequest({ messages })).toThrow(InvalidRequestError);
  });

  it("rejects when the last message is from assistant", () => {
    expect(() =>
      parseChatRequest({
        messages: [
          { role: "user", content: "hi" },
          { role: "assistant", content: "hello" }
        ]
      })
    ).toThrow(InvalidRequestError);
  });
});
