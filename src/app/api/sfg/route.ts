import { NextRequest, NextResponse } from "next/server";
import { newId, readStore, updateStore, StoredSfgBed } from "@/lib/store";

const SQUARES = 16;

function normalizeSquares(raw: unknown): (string | null)[] {
  const list = Array.isArray(raw) ? raw : [];
  return Array.from({ length: SQUARES }, (_, index) => {
    const value = list[index];
    return typeof value === "string" && value ? value : null;
  });
}

export async function GET() {
  const store = await readStore();
  return NextResponse.json({ beds: store.sfgBeds });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const name = typeof body.name === "string" && body.name.trim() ? body.name.trim() : "My 4×4 bed";

  const bed: StoredSfgBed = {
    id: newId("bed"),
    name,
    squares: normalizeSquares(body.squares),
    createdAt: new Date().toISOString(),
  };

  const beds = await updateStore((store) => {
    store.sfgBeds.push(bed);
    return store.sfgBeds;
  });

  return NextResponse.json({ bed, beds }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const id = typeof body.id === "string" ? body.id : "";

  const result = await updateStore((store) => {
    const bed = store.sfgBeds.find((entry) => entry.id === id);
    if (!bed) return null;
    if ("squares" in body) bed.squares = normalizeSquares(body.squares);
    if (typeof body.name === "string" && body.name.trim()) bed.name = body.name.trim();
    return bed;
  });

  if (!result) {
    return NextResponse.json({ error: "Bed not found." }, { status: 404 });
  }
  return NextResponse.json({ bed: result });
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id") ?? "";
  const beds = await updateStore((store) => {
    store.sfgBeds = store.sfgBeds.filter((entry) => entry.id !== id);
    return store.sfgBeds;
  });
  return NextResponse.json({ beds });
}
