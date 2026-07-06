import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { newId, readStore, updateStore, StoredPlant } from "@/lib/store";
import { diagnoseImages, DiagnoseImage } from "@/lib/vision";
import { zones } from "@/lib/mock-data";

const KNOWN_ZONES = new Set(zones.map((zone) => zone.name));

const PHOTOS_DIR = path.join(process.cwd(), "data", "photos");
const CHUNK = 6;
const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

/**
 * One-tap bulk pass over the Photo Journal: identify every un-processed photo,
 * write its diagnosis, and add confidently-identified plants to the Plant
 * Library. `?force=1` re-runs entries already identified.
 */
export async function POST(request: NextRequest) {
  const limitParam = Number(request.nextUrl.searchParams.get("limit"));
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : Infinity;

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "Add OPENAI_API_KEY to .env.local to run vision analysis, then try again." },
      { status: 400 },
    );
  }

  const store = await readStore();
  const inLibrary = new Set(
    store.plants.map((p) => p.sourceJournalId).filter(Boolean) as string[],
  );
  // A photo needs work if it hasn't been through a real vision pass yet, or it
  // was identified but its library plant is missing (e.g. library was cleared).
  // `force` re-runs everything. This selection advances each batch.
  const targets = store.journal
    .filter((entry) => {
      if (!entry.photo) return false;
      if (!entry.visionProcessed) return true; // first real vision pass
      // already processed & identified but its library plant is gone → re-add
      return entry.plant !== "Unidentified plant" && !inLibrary.has(entry.id);
    })
    .slice(0, limit === Infinity ? undefined : limit);

  if (!targets.length) {
    return NextResponse.json({
      ok: true,
      processed: 0,
      identified: 0,
      addedToLibrary: 0,
      message: "Every photo has already been identified. Use force to re-run.",
    });
  }

  // Track which journal photos already have a library plant, so re-runs don't
  // duplicate but every distinct photo still lands in the library.
  const addedJournalIds = new Set(
    store.plants.map((plant) => plant.sourceJournalId).filter(Boolean) as string[],
  );
  let identified = 0;
  let added = 0;
  let processed = 0;

  for (let start = 0; start < targets.length; start += CHUNK) {
    const chunk = targets.slice(start, start + CHUNK);

    // Keep entry alignment with images so we can match diagnoses by index
    // (the model doesn't reliably echo file names).
    const loaded: { entry: (typeof chunk)[number]; image: DiagnoseImage }[] = [];
    for (const entry of chunk) {
      const dataUrl = await photoToDataUrl(entry.photo!);
      if (dataUrl) loaded.push({ entry, image: { fileName: entry.id, dataUrl } });
    }
    if (!loaded.length) continue;

    const result = await diagnoseImages(
      loaded.map((l) => l.image),
      {
        location: "Orem, Utah",
        date: new Date().toISOString(),
        zones: [...new Set(store.plants.map((p) => p.zone))],
      },
    );
    if (result.mode !== "configured") {
      return NextResponse.json(
        { error: result.mode === "error" ? result.error : "Vision analysis unavailable.", processed },
        { status: 502 },
      );
    }

    // Apply diagnoses + collect plants to add, in one store mutation per chunk.
    const toAdd: StoredPlant[] = [];
    await updateStore((liveStore) => {
      loaded.forEach(({ entry }, index) => {
        const diagnosis = result.diagnoses[index];
        const live = liveStore.journal.find((j) => j.id === entry.id);
        if (!diagnosis || !live) return;
        processed++;
        live.visionProcessed = true;

        const candidates = (diagnosis.plant_candidates ?? []).map((c) => c.name).filter(Boolean);
        const best = candidates[0];
        const confidence = typeof diagnosis.confidence === "number" ? diagnosis.confidence : 0;
        // Trust a human label over vision — keep Karmel's name/zone, still apply diagnosis.
        const userLabeled = live.identificationStatus === "User labeled";
        const isIdentified = userLabeled || (!!best && confidence >= 0.55);
        const name = userLabeled ? live.plant : cleanPlantName(best);
        // Only trust a zone guess that matches a real zone; the model sometimes
        // returns a sentence, which we must not store as a zone.
        const zone =
          !userLabeled && diagnosis.zone_guess && KNOWN_ZONES.has(diagnosis.zone_guess)
            ? diagnosis.zone_guess
            : live.zone;

        live.plant = isIdentified ? name! : "Unidentified plant";
        live.zone = zone;
        live.health = diagnosis.health_status ?? live.health;
        live.identificationStatus = userLabeled ? "User labeled" : isIdentified ? "Vision draft" : "Needs ID";
        live.confidence = confidence;
        live.candidates = candidates;
        live.source = userLabeled ? live.source : "openai vision";
        live.signal = diagnosis.visual_signals ?? live.signal;
        live.water = diagnosis.water_recommendation ?? live.water;
        live.sun = diagnosis.sun_recommendation ?? live.sun;
        live.pruning = diagnosis.pruning_recommendation ?? live.pruning;
        live.recommendation = diagnosis.recommended_actions?.join(" ") ?? live.recommendation;

        if (isIdentified) identified++;

        // Add one library plant per identified photo (deduped by journal id so
        // re-runs are idempotent, but every distinct photo lands in the library).
        const finalName = live.plant;
        if (isIdentified && finalName !== "Unidentified plant" && !addedJournalIds.has(live.id)) {
          addedJournalIds.add(live.id);
          toAdd.push({
            id: newId("plant"),
            name: finalName,
            zone,
            health: live.health,
            notes: diagnosis.recommended_actions?.join(" ") || undefined,
            photo: live.photo, // shares the stored photo file with the journal entry
            addedAt: new Date().toISOString(),
            sourceJournalId: live.id,
          });
          live.savedToLibrary = true;
        }
      });
      liveStore.plants.push(...toAdd);
    });

    added += toAdd.length;
  }

  const final = await readStore();
  return NextResponse.json({
    ok: true,
    processed,
    identified,
    addedToLibrary: added,
    entries: final.journal,
    message: `Analyzed ${processed} photos: identified ${identified}, added ${added} new plants to your library.`,
  });
}

/** Trim the model's verbose candidate to a tidy library name. */
function cleanPlantName(raw: string | undefined): string {
  if (!raw) return "Unidentified plant";
  let name = raw.split(/, | such as | — | - like /i)[0].trim();
  name = name.replace(/\s+or similar.*$/i, "").replace(/\s+likely.*$/i, "").trim();
  if (name.length > 64) name = name.slice(0, 61).trimEnd() + "…";
  return name || "Unidentified plant";
}

async function photoToDataUrl(publicPath: string): Promise<string | null> {
  try {
    const fileName = path.basename(publicPath);
    const data = await fs.readFile(path.join(PHOTOS_DIR, fileName));
    const ext = fileName.split(".").pop()?.toLowerCase() ?? "jpg";
    return `data:${MIME[ext] ?? "image/jpeg"};base64,${data.toString("base64")}`;
  } catch {
    return null;
  }
}
