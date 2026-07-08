import { NextRequest, NextResponse } from "next/server";
import { HydroWaterLevel, newId, readStore, StoredHydroJar, updateStore } from "@/lib/store";

const WATER_LEVELS: HydroWaterLevel[] = ["full", "half", "low"];

export async function GET() {
  const store = await readStore();
  return NextResponse.json({ jars: store.hydroJars });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const plant = typeof body.plant === "string" ? body.plant.trim().slice(0, 80) : "";
  if (!plant) return NextResponse.json({ error: "What's growing in the jar?" }, { status: 400 });

  const jar: StoredHydroJar = {
    id: newId("hydrojar"),
    plant,
    variety: typeof body.variety === "string" && body.variety.trim() ? body.variety.trim().slice(0, 80) : undefined,
    startedAt: new Date().toISOString(),
    daysToHarvest:
      typeof body.daysToHarvest === "number" && body.daysToHarvest > 0 && body.daysToHarvest <= 365
        ? Math.round(body.daysToHarvest)
        : undefined,
    waterLevel: "full",
    notes: "",
    status: "growing",
    createdAt: new Date().toISOString(),
  };

  const jars = await updateStore((store) => {
    store.hydroJars.unshift(jar);
    return store.hydroJars;
  });
  return NextResponse.json({ jar, jars }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const jars = await updateStore((store) => {
    const jar = store.hydroJars.find((candidate) => candidate.id === id);
    if (!jar) return store.hydroJars;
    if (WATER_LEVELS.includes(body.waterLevel)) jar.waterLevel = body.waterLevel;
    if (typeof body.notes === "string") jar.notes = body.notes.slice(0, 2000);
    if (body.status === "growing" || body.status === "harvested") {
      jar.status = body.status;
      jar.harvestedAt = body.status === "harvested" ? new Date().toISOString() : undefined;
    }
    return store.hydroJars;
  });
  return NextResponse.json({ jars });
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id") ?? "";
  const jars = await updateStore((store) => {
    store.hydroJars = store.hydroJars.filter((jar) => jar.id !== id);
    return store.hydroJars;
  });
  return NextResponse.json({ jars });
}
