import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { hasSupabase, publicPhotoUrl } from "@/lib/supabase-backend";

const PHOTOS_DIR = path.join(process.cwd(), "data", "photos");

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  heic: "image/heic",
};

export async function GET(_request: NextRequest, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const fileName = path.basename(file); // strip any traversal attempts

  try {
    const data = await fs.readFile(path.join(PHOTOS_DIR, fileName));
    const extension = fileName.split(".").pop()?.toLowerCase() ?? "jpg";
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": CONTENT_TYPES[extension] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    // Not on local disk — in cloud mode the photo lives in Supabase Storage.
    if (hasSupabase()) {
      return NextResponse.redirect(publicPhotoUrl(fileName), 302);
    }
    return NextResponse.json({ error: "Photo not found." }, { status: 404 });
  }
}
