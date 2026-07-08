import { NextResponse } from "next/server";
import { hasSupabase } from "@/lib/supabase-backend";

/**
 * Storage health for the UI: which store this deployment writes to, and
 * whether uploads actually persist. On Netlify without Supabase configured,
 * writes land on an ephemeral function filesystem and quietly vanish — the
 * Photo Journal uses this to warn instead of losing photos silently.
 */

export async function GET() {
  const cloud = hasSupabase();
  const ephemeral = !cloud && Boolean(process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME);
  return NextResponse.json({
    storage: cloud ? "supabase" : "local-file",
    persistent: !ephemeral,
  });
}
