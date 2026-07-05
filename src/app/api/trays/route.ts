import { NextRequest, NextResponse } from "next/server";
import { newId, readStore, updateStore, StoredTray } from "@/lib/store";

export async function GET() {
  const store = await readStore();
  return NextResponse.json({ trays: store.trays });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";

  if (!name) {
    return NextResponse.json({ error: "Give the tray a name (what's growing in it)." }, { status: 400 });
  }

  const harvestDays = Number(body.harvestDays);
  const tray: StoredTray = {
    id: newId("tray"),
    name,
    startedAt:
      typeof body.startedAt === "string" && !Number.isNaN(Date.parse(body.startedAt))
        ? body.startedAt
        : new Date().toISOString(),
    harvestDays: Number.isFinite(harvestDays) && harvestDays > 0 ? Math.round(harvestDays) : 10,
    status: "active",
    notes: typeof body.notes === "string" && body.notes ? body.notes : undefined,
  };

  const trays = await updateStore((store) => {
    store.trays.push(tray);
    return store.trays;
  });

  return NextResponse.json({ tray, trays }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const id = typeof body.id === "string" ? body.id : "";

  const result = await updateStore((store) => {
    const tray = store.trays.find((entry) => entry.id === id);
    if (!tray) return null;

    if (body.status === "harvested" && tray.status !== "harvested") {
      tray.status = "harvested";
      tray.harvestedAt = new Date().toISOString();
    }
    if (body.status === "active") {
      tray.status = "active";
      tray.harvestedAt = undefined;
    }
    if (typeof body.notes === "string") tray.notes = body.notes || undefined;
    const harvestDays = Number(body.harvestDays);
    if (Number.isFinite(harvestDays) && harvestDays > 0) tray.harvestDays = Math.round(harvestDays);

    return { tray, trays: store.trays };
  });

  if (!result) {
    return NextResponse.json({ error: "Tray not found." }, { status: 404 });
  }

  return NextResponse.json(result);
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id") ?? "";

  const trays = await updateStore((store) => {
    store.trays = store.trays.filter((entry) => entry.id !== id);
    return store.trays;
  });

  return NextResponse.json({ trays });
}
