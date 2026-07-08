import { NextRequest, NextResponse } from "next/server";
import { newId, readStore, StoredCulinaryEntry, updateStore } from "@/lib/store";
import { deletePhoto, saveDataUrlPhoto } from "@/lib/photo-files";

/** Culinary Garden Journal — farm-to-table records with cost analysis. */

const str = (value: unknown, max = 400) =>
  typeof value === "string" && value.trim() ? value.trim().slice(0, max) : undefined;

export async function GET() {
  const store = await readStore();
  return NextResponse.json({ entries: store.culinaryEntries });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const dish = str(body.dish, 140);
  if (!dish) return NextResponse.json({ error: "What did you make?" }, { status: 400 });

  const id = newId("meal");
  const photo = await saveDataUrlPhoto(body.photoDataUrl, id);

  const entry: StoredCulinaryEntry = {
    id,
    dish,
    photo,
    ingredients: Array.isArray(body.ingredients)
      ? body.ingredients.filter((item: unknown): item is string => typeof item === "string" && !!item.trim()).map((item: string) => item.trim().slice(0, 160)).slice(0, 24)
      : [],
    flavorProfile: str(body.flavorProfile),
    mealCost: str(body.mealCost, 40),
    storeCost: str(body.storeCost, 40),
    savings: str(body.savings, 80),
    timeline: str(body.timeline),
    insight: str(body.insight, 600),
    cookedAt: str(body.cookedAt, 40) ?? new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  const entries = await updateStore((store) => {
    store.culinaryEntries.unshift(entry);
    return store.culinaryEntries;
  });
  return NextResponse.json({ entry, entries }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id") ?? "";
  const removed = await updateStore((store) => {
    const target = store.culinaryEntries.find((entry) => entry.id === id);
    store.culinaryEntries = store.culinaryEntries.filter((entry) => entry.id !== id);
    return target ?? null;
  });
  if (removed?.photo) await deletePhoto(removed.photo);
  const store = await readStore();
  return NextResponse.json({ entries: store.culinaryEntries });
}
