import { NextRequest, NextResponse } from "next/server";
import { newId, readStore, updateStore, SeedTestPlug, StoredSeedTest } from "@/lib/store";

const PLUG_STATES: SeedTestPlug[] = ["sown", "sprouted", "failed"];
const PLUG_COUNT = 12;

export async function GET() {
  const store = await readStore();
  return NextResponse.json({ tests: store.seedTests });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const seedName = typeof body.seedName === "string" ? body.seedName.trim().slice(0, 80) : "";
  if (!seedName) return NextResponse.json({ error: "Which seed are you testing?" }, { status: 400 });

  const test: StoredSeedTest = {
    id: newId("seedtest"),
    seedName,
    variety: typeof body.variety === "string" && body.variety.trim() ? body.variety.trim().slice(0, 80) : undefined,
    claimedGermination:
      typeof body.claimedGermination === "number" && body.claimedGermination > 0 && body.claimedGermination <= 100
        ? Math.round(body.claimedGermination)
        : undefined,
    daysToGermination:
      typeof body.daysToGermination === "number" && body.daysToGermination > 0 && body.daysToGermination <= 60
        ? Math.round(body.daysToGermination)
        : undefined,
    startedAt: new Date().toISOString(),
    plugs: Array.from({ length: PLUG_COUNT }, () => "sown" as SeedTestPlug),
    notes: "",
    status: "active",
    createdAt: new Date().toISOString(),
  };

  const tests = await updateStore((store) => {
    store.seedTests.unshift(test);
    return store.seedTests;
  });
  return NextResponse.json({ test, tests }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const tests = await updateStore((store) => {
    const test = store.seedTests.find((candidate) => candidate.id === id);
    if (!test) return store.seedTests;
    if (Array.isArray(body.plugs)) {
      test.plugs = Array.from({ length: PLUG_COUNT }, (_, index) => {
        const value = body.plugs[index];
        return PLUG_STATES.includes(value) ? value : "sown";
      });
    }
    if (typeof body.notes === "string") test.notes = body.notes.slice(0, 2000);
    if (body.status === "active" || body.status === "done") test.status = body.status;
    return store.seedTests;
  });
  return NextResponse.json({ tests });
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id") ?? "";
  const tests = await updateStore((store) => {
    store.seedTests = store.seedTests.filter((test) => test.id !== id);
    return store.seedTests;
  });
  return NextResponse.json({ tests });
}
