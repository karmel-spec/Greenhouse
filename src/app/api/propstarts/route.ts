import { NextRequest, NextResponse } from "next/server";
import { PROP_STATION_SPOTS, readStore, StoredPropStart, updateStore } from "@/lib/store";

/** The propagation station: 10 fixed spots, each holding one start (or empty). */

const STATUSES: StoredPropStart["status"][] = ["rooting", "rooted", "potted", "failed"];

function spotIndex(value: unknown): number | null {
  const index = typeof value === "number" ? value : NaN;
  return Number.isInteger(index) && index >= 0 && index < PROP_STATION_SPOTS ? index : null;
}

export async function GET() {
  const store = await readStore();
  return NextResponse.json({ spots: store.propStarts });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const spot = spotIndex(body.spot);
  const plant = typeof body.plant === "string" ? body.plant.trim().slice(0, 80) : "";
  if (spot === null) return NextResponse.json({ error: "Pick a spot (1-10)." }, { status: 400 });
  if (!plant) return NextResponse.json({ error: "What are you starting?" }, { status: 400 });

  const start: StoredPropStart = {
    plant,
    method: typeof body.method === "string" && body.method.trim() ? body.method.trim().slice(0, 120) : "Cutting",
    startedAt: new Date().toISOString(),
    status: "rooting",
  };

  const spots = await updateStore((store) => {
    store.propStarts[spot] = start;
    return store.propStarts;
  });
  return NextResponse.json({ spots }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const spot = spotIndex(body.spot);
  if (spot === null) return NextResponse.json({ error: "spot required" }, { status: 400 });

  const spots = await updateStore((store) => {
    const start = store.propStarts[spot];
    if (!start) return store.propStarts;
    if (STATUSES.includes(body.status)) start.status = body.status;
    if (typeof body.notes === "string") start.notes = body.notes.slice(0, 500) || undefined;
    return store.propStarts;
  });
  return NextResponse.json({ spots });
}

export async function DELETE(request: NextRequest) {
  const spot = spotIndex(Number(request.nextUrl.searchParams.get("spot")));
  if (spot === null) return NextResponse.json({ error: "spot required" }, { status: 400 });
  const spots = await updateStore((store) => {
    store.propStarts[spot] = null;
    return store.propStarts;
  });
  return NextResponse.json({ spots });
}
