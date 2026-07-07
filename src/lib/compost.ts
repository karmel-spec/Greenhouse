/**
 * Composting knowledge base + pile math for Orem's high-desert climate.
 * Learn side: methods, the browns/greens recipe, what can go in, fixes.
 * Process side: readiness and balance estimates for tracked piles.
 */

import type { StoredCompostPile } from "@/lib/store";

export type CompostMethod = {
  key: string;
  name: string;
  timeline: string;
  typicalWeeks: [number, number];
  effort: string;
  bestFor: string;
  how: string[];
};

export const COMPOST_METHODS: CompostMethod[] = [
  {
    key: "hot",
    name: "Hot pile",
    timeline: "6–10 weeks",
    typicalWeeks: [6, 10],
    effort: "Turn weekly, monitor moisture",
    bestFor: "Lots of material at once and fast, weed-seed-free compost",
    how: [
      "Build at least a 3×3×3 ft pile all at once — smaller piles can't hold heat.",
      "Layer roughly 2–3 parts browns to 1 part greens, watering as you build.",
      "The pile should heat to 130–160°F within days; turn it every 7–10 days, moving the outside in.",
      "When turning no longer reheats it, let it cure 3–4 weeks before using.",
    ],
  },
  {
    key: "cold",
    name: "Cold pile",
    timeline: "6–12 months",
    typicalWeeks: [26, 52],
    effort: "Toss and forget",
    bestFor: "A steady trickle of scraps with zero schedule",
    how: [
      "Add material as it comes; keep the browns/greens balance loosely in mind.",
      "Bury fresh kitchen scraps under a few inches of browns to keep flies off.",
      "Turn it only when you feel like it — it just speeds things up a little.",
      "Harvest finished compost from the bottom while the top keeps working.",
    ],
  },
  {
    key: "tumbler",
    name: "Tumbler",
    timeline: "4–8 weeks",
    typicalWeeks: [4, 8],
    effort: "Spin every 2–3 days",
    bestFor: "Tidy yards, rodent concerns, and easy turning",
    how: [
      "Fill one chamber, then stop adding — a tumbler wants a batch, not a trickle.",
      "Aim slightly browner than a pile; tumblers hold moisture and go soggy fast.",
      "Spin 3–4 times a week; finished batches cure in the second chamber or a bin.",
    ],
  },
  {
    key: "worms",
    name: "Worm bin (vermicompost)",
    timeline: "3–5 months",
    typicalWeeks: [13, 22],
    effort: "Feed weekly, keep indoors or shaded",
    bestFor: "Kitchen scraps year-round and the richest castings for seedlings",
    how: [
      "Red wigglers (not earthworms) in a shallow bin with moist shredded-paper bedding.",
      "Feed about half the worms' weight in scraps per week; bury each feeding in a different corner.",
      "Keep the bin between 55–80°F — the garage in summer, indoors in an Orem winter.",
      "Harvest castings by pushing everything to one side and feeding only the other side for a few weeks.",
    ],
  },
];

export type Compostable = {
  item: string;
  verdict: "yes" | "caution" | "no";
  kind?: "green" | "brown";
  note: string;
};

export const COMPOSTABLES: Compostable[] = [
  { item: "Vegetable & fruit scraps", verdict: "yes", kind: "green", note: "The core of the pile — bury them under browns." },
  { item: "Coffee grounds & paper filters", verdict: "yes", kind: "green", note: "Count as greens despite the color; worms love them." },
  { item: "Eggshells", verdict: "yes", kind: "brown", note: "Crush them fine — whole shells take years." },
  { item: "Grass clippings", verdict: "yes", kind: "green", note: "Thin layers only, or they mat into a slimy sheet." },
  { item: "Dry leaves", verdict: "yes", kind: "brown", note: "Utah gold — stockpile bags every fall for summer browns." },
  { item: "Straw (not hay)", verdict: "yes", kind: "brown", note: "Hay carries seed; straw is the safe one." },
  { item: "Shredded cardboard & paper", verdict: "yes", kind: "brown", note: "Remove tape; shred it so it doesn't mat." },
  { item: "Greenhouse plant trimmings", verdict: "yes", kind: "green", note: "Chop woody stems small so they keep pace." },
  { item: "Spent microgreen mats & potting soil", verdict: "yes", kind: "green", note: "Roots, mat, and all — a perfect studio-to-pile loop." },
  { item: "Wood chips & small prunings", verdict: "yes", kind: "brown", note: "Slow but great structure; better in cold piles." },
  { item: "Chicken or rabbit manure", verdict: "yes", kind: "green", note: "Hot-compost it and age 3–4 months before edible beds." },
  { item: "Wood ash", verdict: "caution", note: "A sprinkle at most — Utah soil and water are already alkaline." },
  { item: "Citrus peels & onion skins", verdict: "caution", kind: "green", note: "Fine in moderation in piles; keep them out of worm bins." },
  { item: "Bread, rice & pasta", verdict: "caution", kind: "green", note: "Compostable but the #1 rodent magnet — bury deep or skip." },
  { item: "Weeds that have gone to seed", verdict: "caution", kind: "green", note: "Only a true hot pile (140°F+) kills the seeds." },
  { item: "Diseased or pest-infested plants", verdict: "caution", note: "Hot pile only — or trash them; cold piles recycle the problem." },
  { item: "Meat, fish & bones", verdict: "no", note: "Odor, flies, and every raccoon in Orem. Keep them out." },
  { item: "Dairy, grease & oils", verdict: "no", note: "They coat the pile, block air, and go rancid." },
  { item: "Dog & cat waste", verdict: "no", note: "Pathogens that survive backyard piles — never near food beds." },
  { item: "Glossy or coated paper", verdict: "no", note: "Plastic coatings and inks don't break down." },
  { item: "Black walnut leaves & chips", verdict: "no", note: "Juglone is toxic to tomatoes and most garden plants." },
  { item: "Herbicide-treated clippings", verdict: "no", note: "Persistent herbicides pass through and stunt whatever you grow." },
];

export type CompostFix = { problem: string; cause: string; fix: string };

export const COMPOST_FIXES: CompostFix[] = [
  { problem: "Smells rotten or like ammonia", cause: "Too many greens, too wet, not enough air", fix: "Turn it and fork in dry browns (leaves, shredded cardboard) until it smells earthy again." },
  { problem: "Pile won't heat up", cause: "Too small, too dry, or starved of greens", fix: "Build to 3×3×3 ft minimum, water to wrung-out-sponge, and add fresh greens or coffee grounds." },
  { problem: "Bone dry in days", cause: "Orem's high-desert air pulls moisture fast", fix: "Water every layer, park the pile in shade, and cover with a tarp or straw cap." },
  { problem: "Flies and gnats everywhere", cause: "Exposed food scraps on top", fix: "Always bury scraps 4–6 inches deep and finish with a brown layer." },
  { problem: "Everything is still chunky", cause: "Pieces went in too big", fix: "Chop or mow over material first — surface area is speed." },
  { problem: "White ash-like coating inside", cause: "Actinomycetes — beneficial heat-loving microbes", fix: "Nothing! That's the sign of a healthy hot pile doing its job." },
];

export const UTAH_COMPOST_NOTES = [
  "Dryness is your #1 enemy: a pile that reads damp in Georgia is dust in Orem. Water when you turn, every time.",
  "Shade the pile — the north side of the greenhouse or a fence line keeps the sun from baking it.",
  "Stockpile fall leaves in bags; browns are scarce here by July when the greens flood in.",
  "Alkaline caution: skip wood ash and lime. Utah soil sits at pH 7.5–8 already; compost is your acidifier.",
  "Winter piles freeze solid and simply pause — pile through winter and it roars back in March.",
];

/** Rough progress + advice for a tracked pile, from its method and log. */
export function pileStatus(pile: StoredCompostPile, now = Date.now()) {
  const method = COMPOST_METHODS.find((m) => m.key === pile.method) ?? COMPOST_METHODS[1];
  const weeks = (now - Date.parse(pile.startedAt)) / (7 * 86_400_000);
  const [fast, slow] = method.typicalWeeks;
  const progress = Math.min(1, weeks / slow);
  const maybeReady = weeks >= fast;

  const greens = pile.log.filter((entry) => entry.type === "greens").length;
  const browns = pile.log.filter((entry) => entry.type === "browns").length;
  const turns = pile.log.filter((entry) => entry.type === "turn");
  const lastTurn = turns.length ? turns[turns.length - 1].at : null;
  const daysSinceTurn = lastTurn ? Math.floor((now - Date.parse(lastTurn)) / 86_400_000) : null;
  const lastTemp = [...pile.log].reverse().find((entry) => entry.type === "temp")?.tempF ?? null;

  let balance: "browny" | "greeny" | "balanced" | "unknown" = "unknown";
  if (greens + browns >= 3) {
    const ratio = browns / Math.max(greens, 1);
    balance = ratio >= 3.5 ? "browny" : ratio < 1.5 ? "greeny" : "balanced";
  }

  const advice: string[] = [];
  if (balance === "greeny") advice.push("Log more browns — dry leaves or shredded cardboard — the mix is running green and will smell.");
  if (balance === "browny") advice.push("Feed it greens (scraps, clippings, coffee) — a browny pile stalls.");
  if (pile.method === "hot" && daysSinceTurn !== null && daysSinceTurn > 10) advice.push(`It's been ${daysSinceTurn} days since a turn — hot piles want one every 7–10 days.`);
  if (pile.method === "hot" && lastTemp !== null && lastTemp < 110 && weeks < fast) advice.push("Below 110°F mid-run: turn it, water it, and add greens to reheat.");
  if (pile.method === "tumbler" && daysSinceTurn !== null && daysSinceTurn > 4) advice.push("Give it a few spins — tumblers like turning every 2–3 days.");
  if (maybeReady) advice.push("In the ready window: if it's dark, crumbly, and smells like forest floor, start curing or use it.");
  if (!advice.length) advice.push("On track — keep it as moist as a wrung-out sponge.");

  return { method, weeks, progress, maybeReady, greens, browns, turnCount: turns.length, daysSinceTurn, lastTemp, balance, advice };
}
