import { NextRequest, NextResponse } from "next/server";
import { newId, readStore, updateStore, StoredPlant } from "@/lib/store";
import { copyPhoto, deletePhoto, saveDataUrlPhoto } from "@/lib/photo-files";

export async function GET() {
  const store = await readStore();
  return NextResponse.json({ plants: store.plants });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";

  if (!name || name.toLowerCase() === "unidentified plant") {
    return NextResponse.json(
      { error: "Give the plant a name before saving it to the library." },
      { status: 400 },
    );
  }

  const id = newId("plant");
  // Fresh upload sends a data URL; journal saves reference an existing photo to copy.
  const photo =
    (await saveDataUrlPhoto(body.photoDataUrl, id)) ?? (await copyPhoto(body.photoSource, id));

  const plant: StoredPlant = {
    id,
    name,
    variety: typeof body.variety === "string" && body.variety ? body.variety : undefined,
    zone: typeof body.zone === "string" && body.zone ? body.zone : "Unassigned zone",
    health: typeof body.health === "string" && body.health ? body.health : "Watch",
    photo,
    notes: typeof body.notes === "string" && body.notes ? body.notes : undefined,
    addedAt: new Date().toISOString(),
  };

  const plants = await updateStore((store) => {
    store.plants.push(plant);
    return store.plants;
  });

  return NextResponse.json({ plant, plants }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const plants = await updateStore((store) => {
    const plant = store.plants.find((entry) => entry.id === id);
    if (!plant) return store.plants;
    if (typeof body.name === "string" && body.name.trim()) plant.name = body.name.trim();
    if (typeof body.zone === "string" && body.zone.trim()) plant.zone = body.zone.trim();
    if (typeof body.health === "string" && body.health) plant.health = body.health;
    if (typeof body.notes === "string") plant.notes = body.notes || undefined;
    // Keep the linked journal entry in step so zone edits don't drift apart.
    if (plant.sourceJournalId) {
      const entry = store.journal.find((candidate) => candidate.id === plant.sourceJournalId);
      if (entry) {
        if (typeof body.zone === "string" && body.zone.trim()) entry.zone = body.zone.trim();
        if (typeof body.health === "string" && body.health) entry.health = body.health;
      }
    }
    return store.plants;
  });

  return NextResponse.json({ plants });
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id") ?? "";

  const removed = await updateStore((store) => {
    const target = store.plants.find((entry) => entry.id === id);
    store.plants = store.plants.filter((entry) => entry.id !== id);
    return target ?? null;
  });

  if (removed?.photo) await deletePhoto(removed.photo);

  const store = await readStore();
  return NextResponse.json({ plants: store.plants });
}
