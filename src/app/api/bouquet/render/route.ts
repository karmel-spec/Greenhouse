import { NextRequest, NextResponse } from "next/server";
import { readStore, updateStore } from "@/lib/store";
import { saveDataUrlPhoto } from "@/lib/photo-files";
import { ACTION_BY_KEY } from "@/lib/bouquet";

/**
 * Paints the day's bouquet as a real watercolor illustration with OpenAI
 * image generation, using the prompt style from Codex's design handoff.
 * The finished painting is stored through the normal photo pipeline (local
 * disk or Supabase) and remembered per day in store.bouquetArt.
 */

export const maxDuration = 120; // image generation is slow

function buildPrompt(flowerCounts: Map<string, number>, total: number): string {
  const flowerList = Array.from(flowerCounts.entries())
    .map(([name, count]) => (count > 1 ? `${count} ${name.toLowerCase()}s` : `one ${name.toLowerCase()}`))
    .join(", ");

  const fullness =
    total <= 4
      ? "a modest, gentle bouquet with generous space between stems"
      : total <= 9
        ? "a graceful medium bouquet, comfortably full"
        : "a lush, flourishing, abundant bouquet";

  const mood =
    total <= 4
      ? "peaceful, tender, encouraging — small steps, beautiful growth"
      : total <= 9
        ? "warm, nourishing, quietly joyful"
        : "joyful, abundant, celebratory";

  return [
    "An elegant watercolor botanical illustration for a wellness app, in the style of fine hand-painted garden art.",
    `Subject: ${fullness} in a clear glass vase, containing exactly these flowers: ${flowerList}.`,
    "Add soft eucalyptus sprigs, fern leaves, and a few tiny white baby's-breath blossoms as filler greenery.",
    `Mood: ${mood}. No guilt, no scoring — every bouquet is beautiful.`,
    "Composition: centered bouquet with a soft rounded silhouette on a warm ivory paper background, generous whitespace, delicate botanical detail, subtle natural shadow beneath the vase, refined modern wellness-app aesthetic.",
    "No text, no letters, no numbers, no UI, no watermark, no border.",
  ].join(" ");
}

export async function POST(request: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY is not configured." }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const date = typeof body.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.date) ? body.date : null;
  if (!date) return NextResponse.json({ error: "date (yyyy-mm-dd) required" }, { status: 400 });

  const store = await readStore();
  const keys = store.bouquet[date] ?? [];
  if (!keys.length) {
    return NextResponse.json({ error: "No flowers earned that day yet — check something off first. 🌱" }, { status: 400 });
  }

  // Count flowers by name (built-in + her custom actions).
  const customByKey = new Map(store.bouquetCustom.map((action) => [action.key, action]));
  const counts = new Map<string, number>();
  for (const key of keys) {
    const action = ACTION_BY_KEY.get(key) ?? customByKey.get(key);
    const name = action?.flower ?? "wildflower";
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1",
      prompt: buildPrompt(counts, keys.length),
      size: "1024x1024",
      quality: process.env.BOUQUET_IMAGE_QUALITY ?? "medium",
    }),
  });

  const raw = await response.json();
  if (!response.ok) {
    return NextResponse.json(
      { error: raw.error?.message ?? "Image generation failed." },
      { status: response.status },
    );
  }

  const b64 = raw.data?.[0]?.b64_json;
  if (!b64) {
    return NextResponse.json({ error: "The painter returned no image — try again." }, { status: 502 });
  }

  const photoPath = await saveDataUrlPhoto(`data:image/png;base64,${b64}`, `bouquet-${date}-${Date.now()}`);
  if (!photoPath) {
    return NextResponse.json({ error: "Couldn't save the painting." }, { status: 500 });
  }

  const art = await updateStore((current) => {
    current.bouquetArt[date] = photoPath;
    return current.bouquetArt;
  });

  return NextResponse.json({ art, painting: photoPath });
}
