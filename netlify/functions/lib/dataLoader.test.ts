import { beforeEach, describe, expect, it, vi } from "vitest";

const readFileSyncMock = vi.hoisted(() => vi.fn());

vi.mock("node:fs", () => ({
  readFileSync: readFileSyncMock,
  default: { readFileSync: readFileSyncMock }
}));

import {
  DATA_KEYS,
  __resetDataCacheForTests,
  loadData
} from "./dataLoader";

const readSpy = readFileSyncMock;

function defaultImpl(p: unknown): string {
  const name = String(p).replace(/\\/g, "/").split("/").pop() ?? "";
  return `CONTENT_${name}`;
}

describe("dataLoader", () => {
  beforeEach(() => {
    __resetDataCacheForTests();
    readSpy.mockReset();
    readSpy.mockImplementation(defaultImpl as never);
  });

  it("loads all 8 data keys with non-empty content", () => {
    const data = loadData();
    expect(Object.keys(data).sort()).toEqual([...DATA_KEYS].sort());
    for (const key of DATA_KEYS) {
      expect(data[key]).toBe(`CONTENT_${key}.data.md`);
      expect(data[key].length).toBeGreaterThan(0);
    }
  });

  it("caches result across calls (fs read only once per file)", () => {
    loadData();
    loadData();
    expect(readSpy).toHaveBeenCalledTimes(DATA_KEYS.length);
  });

  it("re-reads after __resetDataCacheForTests()", () => {
    loadData();
    expect(readSpy).toHaveBeenCalledTimes(DATA_KEYS.length);
    __resetDataCacheForTests();
    loadData();
    expect(readSpy).toHaveBeenCalledTimes(DATA_KEYS.length * 2);
  });

  it("throws with the file name if a data file is missing", () => {
    readSpy.mockImplementation(((p: unknown) => {
      const name = String(p).replace(/\\/g, "/").split("/").pop() ?? "";
      if (name === "work.data.md") {
        throw new Error("ENOENT");
      }
      return `CONTENT_${name}`;
    }) as never);

    expect(() => loadData()).toThrow(/work\.data\.md/);
  });

  it("throws 'Missing or empty' if a data file is an empty string", () => {
    readSpy.mockImplementation(((p: unknown) => {
      const name = String(p).replace(/\\/g, "/").split("/").pop() ?? "";
      if (name === "skills.data.md") {
        return "";
      }
      return `CONTENT_${name}`;
    }) as never);

    expect(() => loadData()).toThrow(/Missing or empty/);
    expect(() => loadData()).toThrow(/skills\.data\.md/);
  });
});
