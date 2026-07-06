import { describe, expect, it } from "vitest";
import { DATA_KEYS, type DataKey } from "./dataLoader";
import { buildSystemPrompt } from "./promptBuilder";

function makeFixture(): Record<DataKey, string> {
  const fixture = {} as Record<DataKey, string>;
  for (const key of DATA_KEYS) {
    fixture[key] = `MARKER_${key.toUpperCase()}_XYZ`;
  }
  return fixture;
}

describe("buildSystemPrompt", () => {
  it("includes an open/close tag pair for every DataKey", () => {
    const prompt = buildSystemPrompt(makeFixture());
    for (const key of DATA_KEYS) {
      expect(prompt).toContain(`<${key}>`);
      expect(prompt).toContain(`</${key}>`);
    }
  });

  it("embeds every fixture marker inside the prompt", () => {
    const data = makeFixture();
    const prompt = buildSystemPrompt(data);
    for (const key of DATA_KEYS) {
      expect(prompt).toContain(data[key]);
    }
  });

  it("contains the mandatory instruction keywords", () => {
    const prompt = buildSystemPrompt(makeFixture()).toLowerCase();
    expect(prompt).toContain("first person");
    expect(prompt).toContain("daniele");
    expect(prompt).toContain("english");
    expect(prompt).toContain("invent");
    expect(prompt).toMatch(/decline|outside/);
    expect(prompt).toContain("personality");
  });

  it("is idempotent for identical input", () => {
    const data = makeFixture();
    expect(buildSystemPrompt(data)).toBe(buildSystemPrompt(data));
  });

  it("orders sections following DATA_KEYS", () => {
    const prompt = buildSystemPrompt(makeFixture());
    const positions = DATA_KEYS.map((key) => prompt.indexOf(`<${key}>`));
    for (const pos of positions) {
      expect(pos).toBeGreaterThan(-1);
    }
    const sorted = [...positions].sort((a, b) => a - b);
    expect(positions).toEqual(sorted);
  });
});
