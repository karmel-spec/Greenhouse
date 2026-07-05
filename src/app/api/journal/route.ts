import { NextRequest, NextResponse } from "next/server";
import { newId, readStore, updateStore, StoredJournalEntry } from "@/lib/store";
import { deletePhoto, saveDataUrlPhoto } from "@/lib/photo-files";

export async function GET() {
  const store = await readStore();
  return NextResponse.json({ entries: store.journal });
}

/**
 * Accepts a single entry ({ entry, photoDataUrl }) or a batch
 * ({ entries: [...] } without photos, used to migrate old localStorage
 * records). Newest entries go to the front.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));

  if (Array.isArray(body.entries)) {
    const migrated: StoredJournalEntry[] = body.entries
      .filter((entry: Record<string, unknown>) => entry && typeof entry.fileName === "string")
      .map((entry: Record<string, unknown>) => normalizeEntry(entry, newId("journal")));

    const entries = await updateStore((store) => {
      store.journal.push(...migrated);
      return store.journal;
    });
    return NextResponse.json({ entries }, { status: 201 });
  }

  const raw = body.entry;
  if (!raw || typeof raw.fileName !== "string") {
    return NextResponse.json({ error: "Missing journal entry." }, { status: 400 });
  }

  const id = newId("journal");
  const photo = await saveDataUrlPhoto(body.photoDataUrl, id);
  const entry = { ...normalizeEntry(raw, id), photo };

  const entries = await updateStore((store) => {
    store.journal.unshift(entry);
    return store.journal;
  });

  return NextResponse.json({ entry, entries }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const id = typeof body.id === "string" ? body.id : "";
  const updates = body.updates && typeof body.updates === "object" ? body.updates : {};

  const updatable = [
    "plant",
    "zone",
    "health",
    "identificationStatus",
    "confidence",
    "candidates",
    "source",
    "signal",
    "water",
    "sun",
    "pruning",
    "recommendation",
    "savedToLibrary",
  ] as const;

  const result = await updateStore((store) => {
    const entry = store.journal.find((item) => item.id === id);
    if (!entry) return null;
    for (const key of updatable) {
      if (key in updates) {
        (entry as Record<string, unknown>)[key] = updates[key];
      }
    }
    return entry;
  });

  if (!result) {
    return NextResponse.json({ error: "Journal entry not found." }, { status: 404 });
  }

  return NextResponse.json({ entry: result });
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id") ?? "";

  const removed = await updateStore((store) => {
    const target = store.journal.find((entry) => entry.id === id);
    store.journal = store.journal.filter((entry) => entry.id !== id);
    return target ?? null;
  });

  if (removed?.photo) await deletePhoto(removed.photo);

  const store = await readStore();
  return NextResponse.json({ entries: store.journal });
}

function normalizeEntry(raw: Record<string, unknown>, id: string): StoredJournalEntry {
  const str = (value: unknown, fallback: string) =>
    typeof value === "string" && value ? value : fallback;

  return {
    id,
    fileName: str(raw.fileName, "photo"),
    plant: str(raw.plant, "Unidentified plant"),
    zone: str(raw.zone, "Unassigned zone"),
    health: str(raw.health, "Watch"),
    identificationStatus: str(raw.identificationStatus, "Needs ID"),
    confidence: typeof raw.confidence === "number" ? raw.confidence : undefined,
    candidates: Array.isArray(raw.candidates) ? raw.candidates.filter((c) => typeof c === "string") : [],
    source: str(raw.source, "local mock"),
    signal: str(raw.signal, ""),
    water: str(raw.water, ""),
    sun: str(raw.sun, ""),
    pruning: str(raw.pruning, ""),
    recommendation: str(raw.recommendation, ""),
    recordedAt: str(raw.recordedAt, new Date().toLocaleString([], { dateStyle: "medium", timeStyle: "short" })),
    savedToLibrary: raw.savedToLibrary === true,
  };
}
