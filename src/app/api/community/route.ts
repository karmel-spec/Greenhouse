import { NextResponse } from "next/server";
import { readStore, updateStore, DEFAULT_COMMUNITY_GARDEN, StoredCommunityGarden, StoredPlotClaim } from "@/lib/store";

export async function GET() {
  const store = await readStore();
  return NextResponse.json({ garden: store.communityGarden });
}

export async function PATCH(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Partial<StoredCommunityGarden>;

  const garden = await updateStore((store) => {
    const current = store.communityGarden ?? { ...DEFAULT_COMMUNITY_GARDEN };
    if (typeof body.plotSize === "string") current.plotSize = body.plotSize;
    if (typeof body.pathFt === "number" && body.pathFt >= 2 && body.pathFt <= 6) current.pathFt = body.pathFt;
    if (body.claims && typeof body.claims === "object") {
      const claims: Record<string, StoredPlotClaim> = {};
      for (const [id, claim] of Object.entries(body.claims)) {
        if (claim && typeof claim.name === "string" && claim.name.trim()) {
          claims[id] = { name: claim.name.trim(), crop: claim.crop?.trim() || undefined, note: claim.note?.trim() || undefined };
        }
      }
      current.claims = claims;
    }
    if (body.checklist && typeof body.checklist === "object") {
      const checklist: Record<string, boolean> = {};
      for (const [key, value] of Object.entries(body.checklist)) checklist[key] = Boolean(value);
      current.checklist = checklist;
    }
    store.communityGarden = current;
    return current;
  });

  return NextResponse.json({ garden });
}
