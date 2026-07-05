import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { readStore } from "@/lib/store";

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

type KnowledgeEntry = {
  match: RegExp;
  method: string;
  steps: string[];
  seasonNote?: string;
};

const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  {
    match: /basil/i,
    method: "Stem cuttings in water",
    steps: [
      "Cut a 4-inch stem just below a leaf node, from a stem that hasn't flowered.",
      "Strip the lower leaves, keep 2 sets of top leaves.",
      "Stand it in a jar of water on a bright windowsill; change water every 2 days.",
      "Pot up into moist potting mix once roots reach about 2 inches (7–14 days).",
    ],
  },
  {
    match: /mint|peppermint|spearmint/i,
    method: "Stem cuttings or runner division",
    steps: [
      "Snip a 4-inch stem below a node — mint roots in water in under a week.",
      "Or lift a runner (horizontal stem) with roots already attached and pot it directly.",
      "Keep the new pot consistently moist and out of harsh afternoon sun for a week.",
    ],
  },
  {
    match: /lavender/i,
    method: "Semi-hardwood cuttings",
    steps: [
      "Take a 3–4 inch cutting from this year's growth that's firm at the base but soft at the tip (late summer is ideal).",
      "Strip the lower two-thirds of leaves and scrape one side of the base lightly.",
      "Dip in rooting hormone and stick into a 50/50 perlite-potting soil mix.",
      "Cover loosely with a plastic dome, keep barely moist; roots take 3–6 weeks.",
    ],
  },
  {
    match: /rosemary/i,
    method: "Semi-hardwood cuttings",
    steps: [
      "Cut 3-inch tips of new growth, strip lower leaves.",
      "Dip in rooting hormone, stick in damp perlite-heavy mix.",
      "Bright indirect light, misting every few days; roots in 4–8 weeks.",
    ],
  },
  {
    match: /thyme|oregano|sage/i,
    method: "Stem cuttings or layering",
    steps: [
      "Take 3-inch soft cuttings and root in damp mix under a dome, or",
      "pin a low-growing stem to the soil with a bent wire (layering) and sever after it roots in place.",
    ],
  },
  {
    match: /chamomile/i,
    method: "Seed saving & direct sow",
    steps: [
      "Chamomile propagates best by seed: let a few flower heads dry fully on the plant.",
      "Crumble the dry heads over a tray of moist seed-starting mix — don't cover; the seeds need light.",
      "Keep misted; germination in 7–14 days.",
    ],
  },
  {
    match: /tomato/i,
    method: "Sucker cuttings",
    steps: [
      "Find a 4–6 inch sucker (the shoot growing in the joint between stem and branch).",
      "Snap or cut it off and stand it in water — roots appear in about a week.",
      "Pot up and harden off before planting; midsummer suckers give you a fall greenhouse crop.",
    ],
  },
  {
    match: /pothos|philodendron|monstera|ivy/i,
    method: "Node cuttings in water",
    steps: [
      "Cut just below a node (the bump where a leaf meets the stem — aerial root is a bonus).",
      "Place in water with the node submerged, leaf out of the water.",
      "Change water weekly; pot up when roots are 2–3 inches.",
    ],
  },
  {
    match: /spider plant/i,
    method: "Plantlet division",
    steps: [
      "Snip off a plantlet (baby) from the runner.",
      "Rest it on a glass of water or directly on moist soil — it roots either way in 1–2 weeks.",
    ],
  },
  {
    match: /snake plant|sansevieria/i,
    method: "Leaf cuttings or division",
    steps: [
      "Cut a healthy leaf into 3-inch sections (keep track of which end was down).",
      "Let the cuts callus for 2 days, then stick the bottom ends in barely-moist mix.",
      "Be patient — pups appear in 1–2 months. Division of the root ball is much faster.",
    ],
  },
  {
    match: /succulent|echeveria|jade|sedum/i,
    method: "Leaf or offset propagation",
    steps: [
      "Twist off a healthy leaf cleanly, or cut an offset (pup) at the base.",
      "Let it callus for 2–3 days in shade.",
      "Lay on dry cactus mix; mist lightly every few days once roots appear.",
    ],
  },
  {
    match: /geranium|pelargonium/i,
    method: "Stem cuttings",
    steps: [
      "Take 3–4 inch cuttings above a node, strip lower leaves and any buds.",
      "Let the cut end dry for a few hours, then stick in barely-moist mix — no dome (they rot easily).",
      "Roots in 3–4 weeks in bright indirect light.",
    ],
  },
  {
    match: /strawberr/i,
    method: "Runner pegging",
    steps: [
      "Pick a vigorous runner and peg the plantlet onto a buried pot of soil with a wire.",
      "Keep it watered for 3–4 weeks, then cut the runner cord once it resists a gentle tug.",
    ],
  },
  {
    match: /grape|vine/i,
    method: "Hardwood cuttings (dormant season)",
    steps: [
      "Wait for dormancy (late winter): cut pencil-thick, 3-node lengths of last year's wood.",
      "Store bundled in damp sand in the fridge, then stick two nodes deep outdoors in spring.",
    ],
    seasonNote: "Best taken in late winter — add it to the calendar rather than doing it now.",
  },
  {
    match: /rose/i,
    method: "Softwood cuttings",
    steps: [
      "After a bloom fades, take an 8-inch cutting with 4 nodes.",
      "Remove the spent flower and lower leaves, dip in rooting hormone.",
      "Stick in moist mix under a loose plastic tent, out of direct sun; roots in 4–8 weeks.",
    ],
  },
];

const DEFAULT_ENTRY = {
  method: "Stem cuttings (general method)",
  steps: [
    "Take a 3–4 inch cutting of healthy, non-flowering growth just below a node.",
    "Strip the lower leaves, dip in rooting hormone if you have it.",
    "Stick in moist, well-draining mix; keep humid and in bright indirect light.",
    "Tug-test gently after 3–4 weeks — resistance means roots.",
  ],
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
    const entry = KNOWLEDGE_BASE.find((candidate) => candidate.match.test(plant.name));
    const method = entry?.method ?? DEFAULT_ENTRY.method;
    const steps = entry?.steps ?? DEFAULT_ENTRY.steps;

    let readiness: PropagationItem["readiness"];
    let readinessReason: string;

    if (entry?.seasonNote) {
      readiness = "wait";
      readinessReason = entry.seasonNote;
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
