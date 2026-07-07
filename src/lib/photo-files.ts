import { promises as fs } from "fs";
import path from "path";
import { copyPhotoObject, deletePhotoObject, hasSupabase, uploadPhotoBuffer } from "@/lib/supabase-backend";

export const PHOTOS_DIR = path.join(process.cwd(), "data", "photos");

const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/heic": "heic",
};

/** Writes a data: URL image to disk; returns its public /api/photos path, or undefined. */
export async function saveDataUrlPhoto(dataUrl: unknown, baseName: string): Promise<string | undefined> {
  if (typeof dataUrl !== "string" || !dataUrl.startsWith("data:image/")) return undefined;
  const match = dataUrl.match(/^data:(image\/[a-z+.-]+);base64,(.+)$/);
  if (!match) return undefined;

  const extension = MIME_EXTENSIONS[match[1]] ?? "jpg";
  const fileName = `${baseName}.${extension}`;
  const bytes = Buffer.from(match[2], "base64");
  if (hasSupabase()) {
    await uploadPhotoBuffer(fileName, bytes, match[1]);
    return `/api/photos/${fileName}`;
  }
  await fs.mkdir(PHOTOS_DIR, { recursive: true });
  await fs.writeFile(path.join(PHOTOS_DIR, fileName), bytes);
  return `/api/photos/${fileName}`;
}

/** Copies an existing /api/photos/<file> to a new name; returns the new public path. */
export async function copyPhoto(publicPath: unknown, baseName: string): Promise<string | undefined> {
  if (typeof publicPath !== "string" || !publicPath.startsWith("/api/photos/")) return undefined;
  const sourceName = path.basename(publicPath);
  const extension = sourceName.split(".").pop() ?? "jpg";
  const fileName = `${baseName}.${extension}`;
  if (hasSupabase()) {
    return (await copyPhotoObject(sourceName, fileName)) ? `/api/photos/${fileName}` : undefined;
  }
  try {
    await fs.copyFile(path.join(PHOTOS_DIR, sourceName), path.join(PHOTOS_DIR, fileName));
    return `/api/photos/${fileName}`;
  } catch {
    return undefined;
  }
}

export async function deletePhoto(publicPath: unknown) {
  if (typeof publicPath !== "string" || !publicPath.startsWith("/api/photos/")) return;
  const fileName = path.basename(publicPath);
  if (hasSupabase()) {
    await deletePhotoObject(fileName).catch(() => {});
    return;
  }
  await fs.unlink(path.join(PHOTOS_DIR, fileName)).catch(() => {});
}
