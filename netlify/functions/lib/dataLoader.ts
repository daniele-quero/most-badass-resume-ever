import { readFileSync } from "node:fs";
import path from "node:path";
import { getStore } from "@netlify/blobs";

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

export const BLOB_STORE_NAME = "resume-private";

async function loadThisIsMe(): Promise<string> {
  try {
    const store = getStore(BLOB_STORE_NAME);
    const content = await store.get("thisisme");
    if (content && content.trim() !== "") return content;
  } catch {
    // Blob store not available (local dev without netlify dev), fall through
  }

  // Local dev fallback: read from file
  const filePath = path.join(process.cwd(), "data", "thisisme.data.md");
  try {
    const content = readFileSync(filePath, "utf-8");
    if (content && content.trim() !== "") return content;
  } catch {
    // File not present
  }

  throw new Error("Missing or empty data file: thisisme.data.md");
}

let cachePromise: Promise<Record<DataKey, string>> | null = null;

async function _loadData(): Promise<Record<DataKey, string>> {
  const result = {} as Record<DataKey, string>;

  result["thisisme"] = await loadThisIsMe();

  for (const key of DATA_KEYS) {
    if (key === "thisisme") continue;
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

  return result;
}

export function loadData(): Promise<Record<DataKey, string>> {
  if (!cachePromise) {
    cachePromise = _loadData();
  }
  return cachePromise;
}

export function __resetDataCacheForTests(): void {
  cachePromise = null;
}
