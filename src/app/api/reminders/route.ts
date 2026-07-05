import { NextRequest, NextResponse } from "next/server";
import { newId, readStore, updateStore, StoredReminder } from "@/lib/store";

export async function GET() {
  const store = await readStore();
  return NextResponse.json({ reminders: store.reminders });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!message) {
    return NextResponse.json({ error: "A reminder message is required." }, { status: 400 });
  }

  const reminder: StoredReminder = {
    id: newId("reminder"),
    message,
    type: typeof body.type === "string" && body.type ? body.type : "General",
    schedule: typeof body.schedule === "string" && body.schedule ? body.schedule : "Daily",
    phone: typeof body.phone === "string" && body.phone ? body.phone : undefined,
    active: true,
    createdAt: new Date().toISOString(),
  };

  const reminders = await updateStore((store) => {
    store.reminders.push(reminder);
    return store.reminders;
  });

  return NextResponse.json({
    ok: true,
    reminder,
    reminders,
    message:
      "Reminder saved. SMS delivery still needs a provider (Twilio) — the reminder itself now persists across restarts.",
  });
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id") ?? "";

  const reminders = await updateStore((store) => {
    store.reminders = store.reminders.filter((entry) => entry.id !== id);
    return store.reminders;
  });

  return NextResponse.json({ reminders });
}
