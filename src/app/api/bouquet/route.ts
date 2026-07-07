import { NextRequest, NextResponse } from "next/server";
import { newId, readStore, updateStore, StoredBouquetAction } from "@/lib/store";

/**
 * Today's Bouquet — daily checked actions (PATCH), plus Karmel's own custom
 * activities (POST to add, DELETE to remove).
 */

export async function GET() {
  const store = await readStore();
  return NextResponse.json({ history: store.bouquet, custom: store.bouquetCustom, art: store.bouquetArt });
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
    .slice(0, 40);

  const history = await updateStore((store) => {
    if (actions.length) store.bouquet[date] = Array.from(new Set(actions));
    else delete store.bouquet[date];
    return store.bouquet;
  });
  return NextResponse.json({ history });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const label = typeof body.label === "string" ? body.label.trim().slice(0, 80) : "";
  const emoji = typeof body.emoji === "string" ? body.emoji.trim().slice(0, 8) : "";
  const flower = typeof body.flower === "string" ? body.flower.trim().slice(0, 40) : "Flower";
  const category =
    typeof body.category === "string" && body.category.trim() ? body.category.trim().slice(0, 30) : "Soul";
  if (!label || !emoji) {
    return NextResponse.json({ error: "Give the activity a name and pick its flower." }, { status: 400 });
  }

  const action: StoredBouquetAction = { key: newId("custom"), label, flower, emoji, category };
  const custom = await updateStore((store) => {
    store.bouquetCustom.push(action);
    return store.bouquetCustom;
  });
  return NextResponse.json({ action, custom }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key") ?? "";
  const custom = await updateStore((store) => {
    store.bouquetCustom = store.bouquetCustom.filter((action) => action.key !== key);
    // Past earned flowers stay in history — you never lose flowers.
    return store.bouquetCustom;
  });
  return NextResponse.json({ custom });
}
