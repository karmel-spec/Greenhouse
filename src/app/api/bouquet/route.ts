import { NextRequest, NextResponse } from "next/server";
import { readStore, updateStore } from "@/lib/store";

/** Today's Bouquet — which nurturing actions were checked, per day. */

export async function GET() {
  const store = await readStore();
  return NextResponse.json({ history: store.bouquet });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const date = typeof body.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.date) ? body.date : null;
  if (!date || !Array.isArray(body.actions)) {
    return NextResponse.json({ error: "date (yyyy-mm-dd) and actions[] required" }, { status: 400 });
  }
  const actions = (body.actions as unknown[])
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry.slice(0, 40))
    .slice(0, 30);

  const history = await updateStore((store) => {
    if (actions.length) store.bouquet[date] = Array.from(new Set(actions));
    else delete store.bouquet[date];
    return store.bouquet;
  });
  return NextResponse.json({ history });
}
