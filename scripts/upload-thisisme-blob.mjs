/**
 * Uploads data/thisisme.data.md to the Netlify Blob store.
 *
 * Usage:
 *   NETLIFY_SITE_ID=<your-site-id> NETLIFY_TOKEN=<your-pat> node scripts/upload-thisisme-blob.mjs
 *
 * NETLIFY_SITE_ID : found at Site configuration > General > Site ID
 * NETLIFY_TOKEN   : a personal access token from https://app.netlify.com/user/applications
 *
 * Run this locally whenever you update data/thisisme.data.md.
 * The file itself is git-ignored and never committed.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { getStore } from "@netlify/blobs";

const STORE_NAME = "resume-private";
const BLOB_KEY   = "thisisme";

const siteId = process.env["NETLIFY_SITE_ID"];
const token  = process.env["NETLIFY_TOKEN"];

if (!siteId || !token) {
  console.error("ERROR: set NETLIFY_SITE_ID and NETLIFY_TOKEN env vars before running.");
  process.exit(1);
}

const filePath = path.join(process.cwd(), "data", "thisisme.data.md");
let content;
try {
  content = readFileSync(filePath, "utf-8");
} catch {
  console.error(`ERROR: could not read ${filePath}`);
  process.exit(1);
}

if (!content || content.trim() === "") {
  console.error("ERROR: thisisme.data.md is empty.");
  process.exit(1);
}

const store = getStore({
  name: STORE_NAME,
  siteID: siteId,
  token,
});

await store.set(BLOB_KEY, content, { metadata: { updatedAt: new Date().toISOString() } });
console.log(`✓ Uploaded ${BLOB_KEY} to Netlify Blob store "${STORE_NAME}" (${content.length} bytes)`);
