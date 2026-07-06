import { beforeEach, describe, expect, it, vi } from "vitest";

const readFileSyncMock = vi.hoisted(() => vi.fn());
const blobGetMock = vi.hoisted(() => vi.fn());

vi.mock("node:fs", () => ({
  readFileSync: readFileSyncMock,
  default: { readFileSync: readFileSyncMock }
}));

vi.mock("@netlify/blobs", () => ({
  getStore: vi.fn(() => ({ get: blobGetMock }))
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
    blobGetMock.mockReset();
    // By default blob returns null (not configured) → falls back to file
    blobGetMock.mockResolvedValue(null);
  });

  it("loads all 8 data keys with non-empty content (blob unavailable → file fallback)", async () => {
    const data = await loadData();
    expect(Object.keys(data).sort()).toEqual([...DATA_KEYS].sort());
    for (const key of DATA_KEYS) {
      expect(data[key]).toBe(`CONTENT_${key}.data.md`);
      expect(data[key].length).toBeGreaterThan(0);
    }
  });

  it("caches result across calls (async, resolves once)", async () => {
    await loadData();
    await loadData();
    // readFileSync called once per non-thisisme file on first call, not again on second
    expect(readSpy).toHaveBeenCalledTimes(DATA_KEYS.length - 1 /* thisisme from blob/file once */);
  });

  it("re-reads after __resetDataCacheForTests()", async () => {
    await loadData();
    const firstCallCount = readSpy.mock.calls.length;
    __resetDataCacheForTests();
    await loadData();
    expect(readSpy).toHaveBeenCalledTimes(firstCallCount * 2);
  });

  it("throws with the file name if a non-thisisme data file is missing", async () => {
    readSpy.mockImplementation(((p: unknown) => {
      const name = String(p).replace(/\\/g, "/").split("/").pop() ?? "";
      if (name === "work.data.md") throw new Error("ENOENT");
      return `CONTENT_${name}`;
    }) as never);

    await expect(loadData()).rejects.toThrow(/work\.data\.md/);
  });

  it("throws 'Missing or empty' if a data file is an empty string", async () => {
    readSpy.mockImplementation(((p: unknown) => {
      const name = String(p).replace(/\\/g, "/").split("/").pop() ?? "";
      if (name === "skills.data.md") return "";
      return `CONTENT_${name}`;
    }) as never);

    await expect(loadData()).rejects.toThrow(/Missing or empty.*skills\.data\.md/);
  });

  it("reads thisisme from Blob store when available", async () => {
    blobGetMock.mockResolvedValue("BLOB_THISISME_CONTENT");
    const data = await loadData();
    expect(data["thisisme"]).toBe("BLOB_THISISME_CONTENT");
    // readFileSync should NOT have been called for thisisme
    const calls = readSpy.mock.calls.map((c) =>
      String(c[0]).replace(/\\/g, "/").split("/").pop()
    );
    expect(calls).not.toContain("thisisme.data.md");
  });

  it("falls back to file when Blob returns null", async () => {
    blobGetMock.mockResolvedValue(null);
    const data = await loadData();
    expect(data["thisisme"]).toBe("CONTENT_thisisme.data.md");
  });

  it("falls back to file when Blob store throws", async () => {
    blobGetMock.mockRejectedValue(new Error("Blob unavailable"));
    const data = await loadData();
    expect(data["thisisme"]).toBe("CONTENT_thisisme.data.md");
  });

  it("throws when both Blob and file are unavailable for thisisme", async () => {
    blobGetMock.mockResolvedValue(null);
    readSpy.mockImplementation(((p: unknown) => {
      const name = String(p).replace(/\\/g, "/").split("/").pop() ?? "";
      if (name === "thisisme.data.md") throw new Error("ENOENT");
      return `CONTENT_${name}`;
    }) as never);

    await expect(loadData()).rejects.toThrow(/thisisme\.data\.md/);
  });
});
