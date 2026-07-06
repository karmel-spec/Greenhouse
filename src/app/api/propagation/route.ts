import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { readStore } from "@/lib/store";
import { propagationGuide } from "@/lib/propagation";

/**
 * Builds a propagation to-do list from Karmel's real plants (Plant Library +
 * named Photo Journal entries). Uses Claude when ANTHROPIC_API_KEY is set;
 * otherwise falls back to a built-in propagation knowledge base.
 */

export type PropagationItem = {
  plant: string;
  zone: string;
  readiness: "ready" | "soon" | "wait";
  readinessReason: string;
  method: string;
  steps: string[];
  photo?: string;
};


export async function GET() {
  const store = await readStore();

  // Real plants first (library), then named journal plants not already in the library.
  const seen = new Set<string>();
  const plants: { name: string; zone: string; health: string; photo?: string }[] = [];

  for (const plant of store.plants) {
    const key = plant.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    plants.push({ name: plant.name, zone: plant.zone, health: plant.health, photo: plant.photo });
  }
  for (const entry of store.journal) {
    const key = entry.plant.toLowerCase();
    if (entry.plant === "Unidentified plant" || seen.has(key)) continue;
    seen.add(key);
    plants.push({ name: entry.plant, zone: entry.zone, health: entry.health, photo: entry.photo });
  }

  const usingStarters = plants.length === 0;
  if (usingStarters) {
    plants.push(
      { name: "Basil", zone: "Propagation Shelf", health: "Thriving" },
      { name: "Lavender", zone: "Apothecary Garden", health: "Thriving" },
      { name: "Peppermint", zone: "Herb Garden", health: "Thriving" },
      { name: "Chamomile", zone: "Tea Garden", health: "Watch" },
      { name: "Tomato", zone: "Greenhouse", health: "Thriving" },
    );
  }

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const items = await aiPropagationPlan(plants);
      if (items.length) {
        const photoByName = new Map(plants.map((plant) => [plant.name.toLowerCase(), plant.photo]));
        for (const item of items) {
          item.photo = photoByName.get(item.plant.toLowerCase()) ?? undefined;
        }
        return NextResponse.json({ items, generatedBy: "anthropic", usingStarters });
      }
    } catch {
      // fall through to knowledge base
    }
  }

  const month = new Date().getMonth(); // 0-11
  const items: PropagationItem[] = plants.map((plant) => {
    const guide = propagationGuide(plant.name);
    const method = guide.method;
    const steps = guide.steps;

    let readiness: PropagationItem["readiness"];
    let readinessReason: string;

    if (guide.seasonNote) {
      readiness = "wait";
      readinessReason = guide.seasonNote;
    } else if (plant.health === "Thriving") {
      readiness = "ready";
      readinessReason =
        month >= 4 && month <= 8
          ? "Healthy growth and active growing season — take cuttings now."
          : "Plant is healthy; indoor propagation works year-round in the greenhouse.";
    } else if (plant.health === "Watch") {
      readiness = "soon";
      readinessReason = "Let it stabilize first — propagate once it shows fresh, healthy growth.";
    } else {
      readiness = "wait";
      readinessReason = "Nurse it back to health before taking cuttings; stressed cuttings rarely root.";
    }

    return { plant: plant.name, zone: plant.zone, readiness, readinessReason, method, steps, photo: plant.photo };
  });

  const order = { ready: 0, soon: 1, wait: 2 };
  items.sort((a, b) => order[a.readiness] - order[b.readiness]);

  return NextResponse.json({ items, generatedBy: "knowledge-base", usingStarters });
}

async function aiPropagationPlan(
  plants: { name: string; zone: string; health: string }[],
): Promise<PropagationItem[]> {
  const anthropic = new Anthropic();
  const today = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const response = await anthropic.messages.create({
    model: process.env.EVE_ANTHROPIC_MODEL ?? "claude-opus-4-8",
    max_tokens: 4096,
    system:
      "You are Eve, the garden assistant in Karmel's Greenhouse Growth Operating System. " +
      "Karmel gardens in Orem, Utah (high desert, zone 6b) with a backyard greenhouse. " +
      "Return ONLY valid JSON matching: {\"items\": [{\"plant\": string, \"zone\": string, " +
      "\"readiness\": \"ready\"|\"soon\"|\"wait\", \"readinessReason\": string, \"method\": string, " +
      "\"steps\": string[]}]} — one item per plant, 3-5 concrete steps each, " +
      "readiness judged from the plant's health and the current season.",
    messages: [
      {
        role: "user",
        content: `It is ${today}. Build a propagation plan for these plants: ${JSON.stringify(plants)}`,
      },
    ],
  });

  const text = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n");

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return [];
  const parsed = JSON.parse(jsonMatch[0]);
  return Array.isArray(parsed.items) ? parsed.items : [];
}
