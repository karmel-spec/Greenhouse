import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Cloud backend (Supabase Storage) — used automatically when SUPABASE_URL and
 * SUPABASE_SERVICE_KEY are set (Netlify env vars, or .env.local to test).
 * Without them the app keeps its local file store, so dev on the Mac works
 * offline and unchanged.
 *
 * Layout: bucket "data" (private) holds garden-store.json; bucket "photos"
 * (public) holds every image, keeping the /api/photos/<name> URLs stable.
 */

export const DATA_BUCKET = "data";
export const PHOTOS_BUCKET = "photos";
export const STORE_OBJECT = "garden-store.json";

export function hasSupabase(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY);
}

let client: SupabaseClient | null = null;

export function supabase(): SupabaseClient {
  if (!client) {
    client = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

export async function downloadStoreJson(): Promise<string | null> {
  const { data, error } = await supabase().storage.from(DATA_BUCKET).download(STORE_OBJECT);
  if (error || !data) return null;
  return await data.text();
}

export async function uploadStoreJson(json: string): Promise<void> {
  const { error } = await supabase()
    .storage.from(DATA_BUCKET)
    .upload(STORE_OBJECT, new Blob([json], { type: "application/json" }), { upsert: true, contentType: "application/json" });
  if (error) throw new Error(`Supabase store upload failed: ${error.message}`);
}

export async function uploadPhotoBuffer(fileName: string, bytes: Buffer, contentType: string): Promise<void> {
  const { error } = await supabase()
    .storage.from(PHOTOS_BUCKET)
    .upload(fileName, bytes, { upsert: true, contentType });
  if (error) throw new Error(`Supabase photo upload failed: ${error.message}`);
}

export async function copyPhotoObject(fromName: string, toName: string): Promise<boolean> {
  const { error } = await supabase().storage.from(PHOTOS_BUCKET).copy(fromName, toName);
  return !error;
}

export async function deletePhotoObject(fileName: string): Promise<void> {
  await supabase().storage.from(PHOTOS_BUCKET).remove([fileName]);
}

export function publicPhotoUrl(fileName: string): string {
  return supabase().storage.from(PHOTOS_BUCKET).getPublicUrl(fileName).data.publicUrl;
}
