#!/usr/bin/env node
/**
 * One-time upload of the local garden (data/garden-store.json + data/photos/)
 * to Supabase Storage, so the Netlify-hosted app has the same data.
 * Safe to re-run — it upserts everything. Local files are never touched.
 *
 * Needs SUPABASE_URL and SUPABASE_SERVICE_KEY in .env.local.
 * Run via "Upload Garden to Cloud.command" or: node scripts/migrate-to-supabase.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// read .env.local
const env = {};
try {
  for (const line of (await fs.readFile(path.join(ROOT, ".env.local"), "utf8")).split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const [key, ...rest] = trimmed.split("=");
      env[key.trim()] = rest.join("=").trim();
    }
  }
} catch {
  /* no .env.local */
}

const URL = env.SUPABASE_URL || process.env.SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!URL || !KEY) {
  console.log("Missing Supabase keys. In .env.local add:");
  console.log("  SUPABASE_URL=https://<your-project>.supabase.co");
  console.log("  SUPABASE_SERVICE_KEY=<the service_role key from Settings → API>");
  process.exit(1);
}

const supabase = createClient(URL, KEY, { auth: { persistSession: false } });

const CONTENT_TYPES = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif", heic: "image/heic" };

console.log("🌱 Uploading Karmel's garden to Supabase…\n");

// 1. buckets
for (const [name, isPublic] of [["data", false], ["photos", true]]) {
  const { error } = await supabase.storage.createBucket(name, { public: isPublic });
  if (error && !/already exists/i.test(error.message)) {
    console.error(`Could not create bucket "${name}": ${error.message}`);
    process.exit(1);
  }
  console.log(`✓ bucket "${name}" ready${isPublic ? " (public)" : ""}`);
}

// 2. the store
const storeJson = await fs.readFile(path.join(ROOT, "data", "garden-store.json"), "utf8");
const { error: storeError } = await supabase.storage
  .from("data")
  .upload("garden-store.json", new Blob([storeJson], { type: "application/json" }), { upsert: true, contentType: "application/json" });
if (storeError) {
  console.error("Store upload failed:", storeError.message);
  process.exit(1);
}
console.log(`✓ garden store uploaded (${(storeJson.length / 1024).toFixed(0)} KB)`);

// 3. photos
const photosDir = path.join(ROOT, "data", "photos");
let files = [];
try {
  files = (await fs.readdir(photosDir)).filter((file) => !file.startsWith("."));
} catch {
  console.log("  (no local photos folder — skipping photos)");
}
let uploaded = 0;
let failed = 0;
for (const [index, file] of files.entries()) {
  const bytes = await fs.readFile(path.join(photosDir, file));
  const extension = file.split(".").pop()?.toLowerCase() ?? "jpg";
  const { error } = await supabase.storage
    .from("photos")
    .upload(file, bytes, { upsert: true, contentType: CONTENT_TYPES[extension] ?? "application/octet-stream" });
  if (error) {
    failed += 1;
    console.log(`  ! ${file}: ${error.message}`);
  } else {
    uploaded += 1;
  }
  if ((index + 1) % 20 === 0) console.log(`  … ${index + 1}/${files.length} photos`);
}
console.log(`✓ photos: ${uploaded} uploaded${failed ? `, ${failed} FAILED (re-run to retry)` : ""}`);

// 4. verify round-trip
const { data: check, error: checkError } = await supabase.storage.from("data").download("garden-store.json");
if (checkError || !check) {
  console.error("Verification failed — the store didn't come back:", checkError?.message);
  process.exit(1);
}
const parsed = JSON.parse(await check.text());
console.log(`\n🎉 Verified: cloud store holds ${parsed.plants?.length ?? 0} plants, ${parsed.journal?.length ?? 0} journal entries, ${parsed.wishlist?.length ?? 0} wishlist items.`);
console.log("\nNext: add SUPABASE_URL, SUPABASE_SERVICE_KEY, OPENAI_API_KEY, and GOVEE_API_KEY");
console.log("to Netlify → Site configuration → Environment variables, then redeploy.");
