import { NextResponse } from "next/server";
import { readStore, updateStore, newId, CompostLogEntry, StoredCompostPile } from "@/lib/store";

export async function GET() {
  const store = await readStore();
  return NextResponse.json({ piles: store.compostPiles });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Partial<StoredCompostPile>;
  const method = typeof body.method === "string" ? body.method : "cold";
  const name = typeof body.name === "string" && body.name.trim() ? body.name.trim() : "New pile";

  const piles = await updateStore((store) => {
    store.compostPiles.push({
      id: newId("pile"),
      name,
      method,
      startedAt: new Date().toISOString(),
      status: "active",
      log: [],
      createdAt: new Date().toISOString(),
    });
    return store.compostPiles;
  });
  return NextResponse.json({ piles });
}

export async function PATCH(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    id?: string;
    name?: string;
    status?: StoredCompostPile["status"];
    logEntry?: Partial<CompostLogEntry>;
  };
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const piles = await updateStore((store) => {
    const pile = store.compostPiles.find((candidate) => candidate.id === body.id);
    if (!pile) return store.compostPiles;
    if (typeof body.name === "string" && body.name.trim()) pile.name = body.name.trim();
    if (body.status === "active" || body.status === "curing" || body.status === "done") pile.status = body.status;
    const entry = body.logEntry;
    if (entry && ["greens", "browns", "turn", "water", "temp", "note"].includes(entry.type ?? "")) {
      pile.log.push({
        at: new Date().toISOString(),
        type: entry.type as CompostLogEntry["type"],
        detail: typeof entry.detail === "string" && entry.detail.trim() ? entry.detail.trim() : undefined,
        tempF: typeof entry.tempF === "number" && entry.tempF > 0 && entry.tempF < 220 ? entry.tempF : undefined,
      });
    }
    return store.compostPiles;
  });
  return NextResponse.json({ piles });
}

export async function DELETE(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const piles = await updateStore((store) => {
    store.compostPiles = store.compostPiles.filter((pile) => pile.id !== id);
    return store.compostPiles;
  });
  return NextResponse.json({ piles });
}
