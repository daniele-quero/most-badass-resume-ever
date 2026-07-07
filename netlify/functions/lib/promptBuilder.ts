import { DATA_KEYS, type DataKey } from "./dataLoader";

/** Sections excluded from the chat context entirely (not useful for conversation). */
export const CHAT_EXCLUDED_KEYS: readonly DataKey[] = ["research"];

/** Matches a Markdown list item (unordered `-`/`*`/`+` or ordered `1.`/`1)`). */
const BULLET_RE = /^\s*(?:[-*+]|\d+[.)])\s+/;

/** Matches Markdown/inline links or raw URLs. */
const LINK_RE = /\[[^\]]*\]\([^)]*\)|https?:\/\/|www\./i;

/** Matches common date forms: 4-digit years, ISO dates, and d/m/y or d.m.y. */
const DATE_RE =
  /\b(?:19|20)\d{2}\b|\b\d{4}-\d{2}(?:-\d{2})?\b|\b\d{1,2}[/.]\d{1,2}[/.]\d{2,4}\b/;

/**
 * Filters a Markdown section for chat use: drops any *bullet* line that carries
 * a link or a date (noise for conversation). Non-bullet lines are kept as-is.
 * This is a send-time filter only — the source files are never modified.
 */
export function filterMarkdownForChat(md: string): string {
  return md
    .split("\n")
    .filter((line) => {
      if (!BULLET_RE.test(line)) return true;
      return !LINK_RE.test(line) && !DATE_RE.test(line);
    })
    .join("\n");
}

export function buildSystemPrompt(data: Record<DataKey, string>): string {
  const header = [
    "You are Daniele Quero's digital twin. Answer in first person as Daniele (\"I\", \"my\").",
    "Respond in the language used by the user in their latest message. If ambiguous, default to English.",
    "You only answer questions about my education, professional experience, working attitude, achievements, professional behavior, courses, published games, public repositories, and technical skills. Politely decline anything else.",
    "When declining, respond with a short sentence like \"Sorry, that's outside what I can share here — ask me about my education, work, or skills.\" (translate to the user's language).",
    "Never invent facts. If the data does not cover something (e.g. contact details, opinions, private life), say explicitly that you don't have that information.",
    "If personality data in the <thisisme> section is minimal or empty, do not fabricate psychological traits — stay factual and professional."
  ].join("\n\n");

  const sections = DATA_KEYS.filter(
    (key) => !CHAT_EXCLUDED_KEYS.includes(key)
  )
    .map((key) => `<${key}>\n${filterMarkdownForChat(data[key])}\n</${key}>`)
    .join("\n\n");

  const footer =
    "Remember: first person, user's language (English fallback), only my career/education/technical profile/working attitude/professional behavior, never invent.";

  return `${header}\n\n${sections}\n\n${footer}`;
}
