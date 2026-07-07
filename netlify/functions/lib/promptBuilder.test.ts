import { describe, expect, it } from "vitest";
import { DATA_KEYS, type DataKey } from "./dataLoader";
import {
  buildSystemPrompt,
  filterMarkdownForChat,
  CHAT_EXCLUDED_KEYS
} from "./promptBuilder";

function makeFixture(): Record<DataKey, string> {
  const fixture = {} as Record<DataKey, string>;
  for (const key of DATA_KEYS) {
    fixture[key] = `MARKER_${key.toUpperCase()}_XYZ`;
  }
  return fixture;
}

const INCLUDED_KEYS = DATA_KEYS.filter((k) => !CHAT_EXCLUDED_KEYS.includes(k));

describe("filterMarkdownForChat", () => {
  it("drops bullet lines containing a markdown link", () => {
    const md = "- Repo one [see it](https://example.com/repo)\n- Plain fact";
    const out = filterMarkdownForChat(md);
    expect(out).not.toContain("Repo one");
    expect(out).toContain("Plain fact");
  });

  it("drops bullet lines containing a raw URL", () => {
    const md = "* Visit https://itch.io/game\n* Keep me";
    const out = filterMarkdownForChat(md);
    expect(out).not.toContain("itch.io");
    expect(out).toContain("Keep me");
  });

  it("drops bullet lines containing a year or ISO date", () => {
    const md =
      "- Graduated in 2019\n- Started 2020-05\n- Timeless skill statement";
    const out = filterMarkdownForChat(md);
    expect(out).not.toContain("Graduated");
    expect(out).not.toContain("Started");
    expect(out).toContain("Timeless skill statement");
  });

  it("keeps non-bullet lines even if they contain links or dates", () => {
    const md = "## Section 2021\nProse with https://example.com inline.";
    const out = filterMarkdownForChat(md);
    expect(out).toContain("Section 2021");
    expect(out).toContain("https://example.com");
  });

  it("handles ordered list bullets", () => {
    const md = "1. Award won in 2018\n2. Enduring principle";
    const out = filterMarkdownForChat(md);
    expect(out).not.toContain("Award won");
    expect(out).toContain("Enduring principle");
  });
});

describe("buildSystemPrompt", () => {
  it("includes an open/close tag pair for every included DataKey", () => {
    const prompt = buildSystemPrompt(makeFixture());
    for (const key of INCLUDED_KEYS) {
      expect(prompt).toContain(`<${key}>`);
      expect(prompt).toContain(`</${key}>`);
    }
  });

  it("excludes the research section entirely", () => {
    const prompt = buildSystemPrompt(makeFixture());
    expect(CHAT_EXCLUDED_KEYS).toContain("research");
    expect(prompt).not.toContain("<research>");
    expect(prompt).not.toContain("MARKER_RESEARCH_XYZ");
  });

  it("embeds every included fixture marker inside the prompt", () => {
    const data = makeFixture();
    const prompt = buildSystemPrompt(data);
    for (const key of INCLUDED_KEYS) {
      expect(prompt).toContain(data[key]);
    }
  });

  it("applies the chat filter to section content", () => {
    const data = makeFixture();
    data.work = "- Joined a company in 2021\n- I lead backend architecture";
    const prompt = buildSystemPrompt(data);
    expect(prompt).not.toContain("Joined a company");
    expect(prompt).toContain("I lead backend architecture");
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

  it("orders included sections following DATA_KEYS", () => {
    const prompt = buildSystemPrompt(makeFixture());
    const positions = INCLUDED_KEYS.map((key) => prompt.indexOf(`<${key}>`));
    for (const pos of positions) {
      expect(pos).toBeGreaterThan(-1);
    }
    const sorted = [...positions].sort((a, b) => a - b);
    expect(positions).toEqual(sorted);
  });
});
