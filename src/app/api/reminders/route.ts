import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));

  return NextResponse.json({
    ok: true,
    mode: "mock",
    providerReadyFor: ["Twilio", "Firebase Cloud Messaging", "Supabase scheduled jobs"],
    reminder: {
      ...body,
      status: "queued-placeholder",
    },
    message: "Reminder architecture is in place. Add a provider adapter when SMS credentials are configured.",
  });
}
