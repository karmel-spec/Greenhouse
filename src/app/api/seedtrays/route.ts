import { NextRequest, NextResponse } from "next/server";
import { newId, readStore, updateStore, SeedTrayCell, StoredSeedTray } from "@/lib/store";

const MAX_CELLS = 288;
const STATES = ["sown", "sprouted", "failed", "transplanted"];

function normalizeCells(raw: unknown, count: number): SeedTrayCell[] {
  const cells: SeedTrayCell[] = Array.isArray(raw) ? (raw.slice(0, count) as SeedTrayCell[]) : [];
  const out: SeedTrayCell[] = [];
  for (let index = 0; index < count; index += 1) {
    const cell = cells[index];
    if (cell && typeof cell === "object" && typeof cell.seed === "string" && cell.seed.trim() && STATES.includes(cell.state)) {
      out.push({
        seed: cell.seed.trim().slice(0, 60),
        variety: typeof cell.variety === "string" && cell.variety ? cell.variety.slice(0, 60) : undefined,
        state: cell.state,
      });
    } else {
      out.push(null);
    }
  }
  return out;
}

export async function GET() {
  const store = await readStore();
  return NextResponse.json({ trays: store.seedTrays });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const rows = Math.min(Math.max(Number(body.rows) || 6, 1), 16);
  const cols = Math.min(Math.max(Number(body.cols) || 12, 1), 18);
  if (rows * cols > MAX_CELLS) {
    return NextResponse.json({ error: "Tray too large" }, { status: 400 });
  }

  const tray: StoredSeedTray = {
    id: newId("seedtray"),
    name: typeof body.name === "string" && body.name.trim() ? body.name.trim().slice(0, 60) : "New tray",
    rows,
    cols,
    cells: normalizeCells(body.cells, rows * cols),
    sownAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  const trays = await updateStore((store) => {
    store.seedTrays.push(tray);
    return store.seedTrays;
  });
  return NextResponse.json({ tray, trays }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const trays = await updateStore((store) => {
    const tray = store.seedTrays.find((candidate) => candidate.id === id);
    if (!tray) return store.seedTrays;
    if (typeof body.name === "string" && body.name.trim()) tray.name = body.name.trim().slice(0, 60);
    if (Array.isArray(body.cells)) tray.cells = normalizeCells(body.cells, tray.rows * tray.cols);
    return store.seedTrays;
  });
  return NextResponse.json({ trays });
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id") ?? "";
  const trays = await updateStore((store) => {
    store.seedTrays = store.seedTrays.filter((tray) => tray.id !== id);
    return store.seedTrays;
  });
  return NextResponse.json({ trays });
}
