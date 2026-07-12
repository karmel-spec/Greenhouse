import { NextRequest, NextResponse } from "next/server";
import { newId, readStore, StoredVisit, updateStore } from "@/lib/store";
import { deletePhoto, saveDataUrlPhoto } from "@/lib/photo-files";

/** Greenhouse Visitors — the people who come to help or just to see it. */

export async function GET() {
  const store = await readStore();
  return NextResponse.json({ visits: store.visits });
}

/** POST { name, note?, visitedAt?, photoDataUrl? } */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 120) : "";
  if (!name) return NextResponse.json({ error: "Who came to visit?" }, { status: 400 });

  const id = newId("visit");
  const photo = await saveDataUrlPhoto(body.photoDataUrl, id);

  const visit: StoredVisit = {
    id,
    photo,
    name,
    note: typeof body.note === "string" && body.note.trim() ? body.note.trim().slice(0, 500) : undefined,
    visitedAt:
      typeof body.visitedAt === "string" && !Number.isNaN(Date.parse(body.visitedAt))
        ? body.visitedAt
        : new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  const visits = await updateStore((store) => {
    store.visits.unshift(visit);
    return store.visits;
  });
  return NextResponse.json({ visit, visits }, { status: 201 });
}

/** PATCH { id, name?, note? } */
export async function PATCH(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const visits = await updateStore((store) => {
    const visit = store.visits.find((candidate) => candidate.id === id);
    if (!visit) return store.visits;
    if (typeof body.name === "string" && body.name.trim()) visit.name = body.name.trim().slice(0, 120);
    if (typeof body.note === "string") visit.note = body.note.trim() ? body.note.trim().slice(0, 500) : undefined;
    return store.visits;
  });
  return NextResponse.json({ visits });
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id") ?? "";
  const removed = await updateStore((store) => {
    const target = store.visits.find((visit) => visit.id === id);
    store.visits = store.visits.filter((visit) => visit.id !== id);
    return target ?? null;
  });
  if (removed?.photo) await deletePhoto(removed.photo);
  const store = await readStore();
  return NextResponse.json({ visits: store.visits });
}
