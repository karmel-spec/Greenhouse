import { NextRequest, NextResponse } from "next/server";
import { newId, readStore, updateStore, StoredSeedPacket } from "@/lib/store";

/**
 * User-added seed packets — the writable half of the Seed Library. The
 * built-in 2020 vault lives in src/lib/seed-vault-complete-database.ts;
 * packets added here (app form or the Telegram bridge) persist in the store
 * and merge into the browser at render time.
 */

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

const MMDD = /^\d{2}-\d{2}$/;

export async function GET() {
  const store = await readStore();
  return NextResponse.json({ seeds: store.userSeeds });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const commonName = typeof body.commonName === "string" ? body.commonName.trim().slice(0, 80) : "";
  if (!commonName) {
    return NextResponse.json({ error: "Give the packet a plant name." }, { status: 400 });
  }

  const year = clampNumber(body.packagedYear, 1990, 2100, new Date().getFullYear());
  const packet: StoredSeedPacket = {
    id: newId("userseed"),
    commonName,
    botanicalName: typeof body.botanicalName === "string" && body.botanicalName.trim() ? body.botanicalName.trim().slice(0, 80) : undefined,
    variety: typeof body.variety === "string" && body.variety.trim() ? body.variety.trim().slice(0, 80) : undefined,
    seedCount: clampNumber(body.seedCount, 0, 100000, 25),
    germinationRate: clampNumber(body.germinationRate, 0, 100, 85),
    packagedDate: `${year}-01-01`,
    source: typeof body.source === "string" && body.source.trim() ? body.source.trim().slice(0, 80) : undefined,
    isHeirloom: Boolean(body.isHeirloom),
    isAnnual: body.isAnnual === undefined ? true : Boolean(body.isAnnual),
    daysToMaturity: body.daysToMaturity !== undefined ? clampNumber(body.daysToMaturity, 1, 400, 70) : undefined,
    daysToGermination: body.daysToGermination !== undefined ? clampNumber(body.daysToGermination, 1, 60, 10) : undefined,
    startIndoors: body.startIndoors === undefined ? undefined : Boolean(body.startIndoors),
    springStart: typeof body.springStart === "string" && MMDD.test(body.springStart) ? body.springStart : undefined,
    springEnd: typeof body.springEnd === "string" && MMDD.test(body.springEnd) ? body.springEnd : undefined,
    notes: typeof body.notes === "string" && body.notes.trim() ? body.notes.trim().slice(0, 600) : undefined,
    createdAt: new Date().toISOString(),
  };

  const seeds = await updateStore((store) => {
    store.userSeeds.push(packet);
    return store.userSeeds;
  });
  return NextResponse.json({ packet, seeds }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id") ?? "";
  const seeds = await updateStore((store) => {
    store.userSeeds = store.userSeeds.filter((seed) => seed.id !== id);
    return store.userSeeds;
  });
  return NextResponse.json({ seeds });
}
