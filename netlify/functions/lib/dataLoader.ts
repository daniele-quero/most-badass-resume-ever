import { readFileSync } from "node:fs";
import path from "node:path";

export type DataKey =
  | "thisisme"
  | "academy"
  | "work"
  | "research"
  | "courses"
  | "gamefolio"
  | "repofolio"
  | "skills";

export const DATA_KEYS: readonly DataKey[] = [
  "thisisme",
  "academy",
  "work",
  "research",
  "courses",
  "gamefolio",
  "repofolio",
  "skills"
] as const;

let cache: Record<DataKey, string> | null = null;

export function loadData(): Record<DataKey, string> {
  if (cache) return cache;

  const result = {} as Record<DataKey, string>;
  for (const key of DATA_KEYS) {
    const filePath = path.join(process.cwd(), "data", `${key}.data.md`);
    let content: string;
    try {
      content = readFileSync(filePath, "utf-8");
    } catch {
      throw new Error(`Missing or empty data file: ${key}.data.md`);
    }
    if (typeof content !== "string" || content.trim() === "") {
      throw new Error(`Missing or empty data file: ${key}.data.md`);
    }
    result[key] = content;
  }

  cache = result;
  return cache;
}

export function __resetDataCacheForTests(): void {
  cache = null;
}
