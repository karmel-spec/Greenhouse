import { NextRequest, NextResponse } from "next/server";
import { newId, readStore, StoredGreenhousePhoto, updateStore } from "@/lib/store";
import { deletePhoto, saveDataUrlPhoto } from "@/lib/photo-files";

/** The Greenhouse — structure notes and a photo gallery of the building itself. */

export async function GET() {
  const store = await readStore();
  return NextResponse.json({ greenhouse: store.greenhouse });
}

/** POST { photoDataUrl, caption? } adds a photo to the gallery. */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const id = newId("ghphoto");
  const photo = await saveDataUrlPhoto(body.photoDataUrl, id);
  if (!photo) {
    return NextResponse.json({ error: "That photo didn't come through — try again." }, { status: 400 });
  }

  const record: StoredGreenhousePhoto = {
    id,
    photo,
    caption: typeof body.caption === "string" ? body.caption.slice(0, 200) : "",
    addedAt: new Date().toISOString(),
  };

  const greenhouse = await updateStore((store) => {
    store.greenhouse.photos.unshift(record);
    return store.greenhouse;
  });
  return NextResponse.json({ greenhouse }, { status: 201 });
}

/** PATCH { notes } or { photoId, caption } */
export async function PATCH(request: NextRequest) {
  const body = await request.json().catch(() => ({}));

  const greenhouse = await updateStore((store) => {
    if (typeof body.notes === "string") {
      store.greenhouse.notes = body.notes.slice(0, 5000);
    }
    if (typeof body.photoId === "string" && typeof body.caption === "string") {
      const photo = store.greenhouse.photos.find((candidate) => candidate.id === body.photoId);
      if (photo) photo.caption = body.caption.slice(0, 200);
    }
    return store.greenhouse;
  });
  return NextResponse.json({ greenhouse });
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id") ?? "";

  const removed = await updateStore((store) => {
    const target = store.greenhouse.photos.find((photo) => photo.id === id);
    store.greenhouse.photos = store.greenhouse.photos.filter((photo) => photo.id !== id);
    return target ?? null;
  });
  if (removed?.photo) await deletePhoto(removed.photo);

  const store = await readStore();
  return NextResponse.json({ greenhouse: store.greenhouse });
}
