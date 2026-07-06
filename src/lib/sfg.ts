/**
 * Square Foot Gardening knowledge: the plant palette (classic per-square
 * spacing/densities from Mel Bartholomew's method), companion relationships,
 * plant height (for the tall-to-the-north rule), and a bed analyzer that
 * turns a 4x4 layout into concrete recommendations for Orem, Utah (zone 6b).
 */

export type SfgCategory = "Vegetable" | "Herb" | "Flower" | "Fruit";

export type SfgPlant = {
  key: string;
  name: string;
  emoji: string;
  category: SfgCategory;
  perSquare: number; // plants per 1x1 square (SFG spacing)
  height: "low" | "medium" | "tall" | "vertical"; // vertical = needs a trellis
  season: "cool" | "warm";
  sun: "full" | "part";
  note: string;
};

// Per-square counts follow the standard SFG spacing (extra-large 1, large 4,
// medium 9, small 16). "vertical" crops climb a north-side trellis.
export const SFG_PLANTS: SfgPlant[] = [
  // Vegetables
  { key: "tomato", name: "Tomato", emoji: "🍅", category: "Vegetable", perSquare: 1, height: "vertical", season: "warm", sun: "full", note: "1 per square, caged or on a north-side trellis. Heavy feeder." },
  { key: "pepper", name: "Pepper", emoji: "🫑", category: "Vegetable", perSquare: 1, height: "medium", season: "warm", sun: "full", note: "1 per square. Loves Utah heat once nights stay above 55°F." },
  { key: "eggplant", name: "Eggplant", emoji: "🍆", category: "Vegetable", perSquare: 1, height: "medium", season: "warm", sun: "full", note: "1 per square. Needs the hottest spot in the bed." },
  { key: "broccoli", name: "Broccoli", emoji: "🥦", category: "Vegetable", perSquare: 1, height: "medium", season: "cool", sun: "full", note: "1 per square. Cool-season — spring or a fall crop from an Aug 1 sow." },
  { key: "cabbage", name: "Cabbage", emoji: "🥬", category: "Vegetable", perSquare: 1, height: "medium", season: "cool", sun: "full", note: "1 per square. Cool-season; heads split if left too long." },
  { key: "cucumber", name: "Cucumber", emoji: "🥒", category: "Vegetable", perSquare: 2, height: "vertical", season: "warm", sun: "full", note: "2 per square on a trellis — saves huge space and keeps fruit clean." },
  { key: "pole-bean", name: "Pole Bean", emoji: "🫛", category: "Vegetable", perSquare: 8, height: "vertical", season: "warm", sun: "full", note: "8 per square up a trellis. Fixes its own nitrogen." },
  { key: "bush-bean", name: "Bush Bean", emoji: "🫘", category: "Vegetable", perSquare: 9, height: "low", season: "warm", sun: "full", note: "9 per square. No trellis needed; nitrogen-fixer." },
  { key: "pea", name: "Peas", emoji: "🌱", category: "Vegetable", perSquare: 8, height: "vertical", season: "cool", sun: "full", note: "8 per square on a trellis. Earliest spring crop; done by summer heat." },
  { key: "lettuce", name: "Lettuce", emoji: "🥬", category: "Vegetable", perSquare: 4, height: "low", season: "cool", sun: "part", note: "4 per square. Tuck into afternoon shade to beat summer bolt." },
  { key: "spinach", name: "Spinach", emoji: "🥬", category: "Vegetable", perSquare: 9, height: "low", season: "cool", sun: "part", note: "9 per square. Fast cool-season green; bolts in heat." },
  { key: "chard", name: "Swiss Chard", emoji: "🥬", category: "Vegetable", perSquare: 4, height: "medium", season: "cool", sun: "full", note: "4 per square. Cut-and-come-again all season; takes some heat." },
  { key: "kale", name: "Kale", emoji: "🥬", category: "Vegetable", perSquare: 1, height: "medium", season: "cool", sun: "full", note: "1 per square. Sweetens after frost; overwinters under cover." },
  { key: "carrot", name: "Carrot", emoji: "🥕", category: "Vegetable", perSquare: 16, height: "low", season: "cool", sun: "full", note: "16 per square. Needs loose, deep, rock-free soil." },
  { key: "radish", name: "Radish", emoji: "🌰", category: "Vegetable", perSquare: 16, height: "low", season: "cool", sun: "full", note: "16 per square. 25 days to harvest — the classic 'while you wait' crop." },
  { key: "beet", name: "Beet", emoji: "🫐", category: "Vegetable", perSquare: 9, height: "low", season: "cool", sun: "full", note: "9 per square. Roots and greens both edible." },
  { key: "onion", name: "Onion", emoji: "🧅", category: "Vegetable", perSquare: 9, height: "low", season: "cool", sun: "full", note: "9 per square. Plant sets early; long-day types for Utah." },
  { key: "garlic", name: "Garlic", emoji: "🧄", category: "Vegetable", perSquare: 9, height: "low", season: "cool", sun: "full", note: "9 per square. Plant cloves in October, harvest next July." },
  { key: "potato", name: "Potato", emoji: "🥔", category: "Vegetable", perSquare: 1, height: "medium", season: "cool", sun: "full", note: "1 per square (or a deep box). Hill up as it grows." },
  { key: "zucchini", name: "Zucchini", emoji: "🥒", category: "Vegetable", perSquare: 1, height: "tall", season: "warm", sun: "full", note: "1 plant needs ~2 squares — it sprawls. One plant feeds a street." },

  // Herbs
  { key: "basil", name: "Basil", emoji: "🌿", category: "Herb", perSquare: 4, height: "low", season: "warm", sun: "full", note: "4 per square. Classic tomato companion — plant them adjacent." },
  { key: "parsley", name: "Parsley", emoji: "🌿", category: "Herb", perSquare: 4, height: "low", season: "cool", sun: "part", note: "4 per square. Biennial; tolerates part shade." },
  { key: "cilantro", name: "Cilantro", emoji: "🌿", category: "Herb", perSquare: 9, height: "low", season: "cool", sun: "part", note: "9 per square. Bolts fast — resow every 3 weeks." },
  { key: "chives", name: "Chives", emoji: "🌿", category: "Herb", perSquare: 16, height: "low", season: "cool", sun: "full", note: "16 per square. Perennial; pest-confusing border plant." },
  { key: "thyme", name: "Thyme", emoji: "🌿", category: "Herb", perSquare: 4, height: "low", season: "cool", sun: "full", note: "4 per square. Perennial; give it a permanent corner." },
  { key: "oregano", name: "Oregano", emoji: "🌿", category: "Herb", perSquare: 1, height: "low", season: "cool", sun: "full", note: "1 per square. Perennial spreader — one square is plenty." },
  { key: "dill", name: "Dill", emoji: "🌿", category: "Herb", perSquare: 1, height: "tall", season: "cool", sun: "full", note: "1 per square. Tall and airy; loved by beneficial wasps." },
  { key: "mint", name: "Mint", emoji: "🌿", category: "Herb", perSquare: 1, height: "low", season: "cool", sun: "part", note: "1 per square — but honestly, keep mint in its own pot; it invades." },

  // Flowers
  { key: "marigold", name: "Marigold", emoji: "🌼", category: "Flower", perSquare: 4, height: "low", season: "warm", sun: "full", note: "4 per square. Pest-deterring edge plant; pairs with tomatoes." },
  { key: "nasturtium", name: "Nasturtium", emoji: "🌺", category: "Flower", perSquare: 1, height: "low", season: "warm", sun: "full", note: "1 per square. Edible flowers; a living aphid trap." },
  { key: "zinnia", name: "Zinnia", emoji: "🌸", category: "Flower", perSquare: 1, height: "tall", season: "warm", sun: "full", note: "1 per square. Pollinator magnet; plant to the north." },
  { key: "calendula", name: "Calendula", emoji: "🌼", category: "Flower", perSquare: 4, height: "low", season: "cool", sun: "full", note: "4 per square. Edible petals; draws hoverflies that eat aphids." },
  { key: "sunflower", name: "Sunflower", emoji: "🌻", category: "Flower", perSquare: 1, height: "tall", season: "warm", sun: "full", note: "1 per square. Tall — north edge only, or it shades everything." },
  { key: "borage", name: "Borage", emoji: "💠", category: "Flower", perSquare: 1, height: "tall", season: "warm", sun: "full", note: "1 per square. The #1 bee plant; great strawberry companion." },

  // Fruit
  { key: "strawberry", name: "Strawberry", emoji: "🍓", category: "Fruit", perSquare: 4, height: "low", season: "cool", sun: "full", note: "4 per square. Perennial; give it a dedicated bed edge." },
];

export const SFG_BY_KEY: Record<string, SfgPlant> = Object.fromEntries(
  SFG_PLANTS.map((plant) => [plant.key, plant]),
);

// Well-known companion synergies and conflicts (by plant key).
const GOOD_PAIRS: [string, string, string][] = [
  ["tomato", "basil", "Basil is tomato's classic partner — said to improve flavor and repel pests."],
  ["tomato", "marigold", "Marigolds deter nematodes and hornworms around tomatoes."],
  ["carrot", "onion", "Onions confuse the carrot fly; carrots loosen soil for onions."],
  ["carrot", "pea", "Peas fix nitrogen that feeds hungry carrots nearby."],
  ["lettuce", "radish", "Radishes mark rows and break soil for slower lettuce."],
  ["cucumber", "nasturtium", "Nasturtium lures aphids and cucumber beetles away."],
  ["cabbage", "dill", "Dill draws wasps that prey on cabbage worms."],
  ["strawberry", "borage", "Borage boosts strawberry yield and pollination."],
  ["pole-bean", "marigold", "Marigolds shield beans from beetles."],
  ["broccoli", "calendula", "Calendula's sticky stems trap aphids off brassicas."],
];

const BAD_PAIRS: [string, string, string][] = [
  ["onion", "pole-bean", "Alliums stunt beans — keep onions/garlic away from beans and peas."],
  ["onion", "bush-bean", "Alliums stunt beans — keep onions/garlic away from beans and peas."],
  ["onion", "pea", "Alliums stunt peas — separate them."],
  ["garlic", "pole-bean", "Garlic inhibits bean growth — plant them apart."],
  ["garlic", "pea", "Garlic inhibits pea growth — plant them apart."],
  ["tomato", "potato", "Tomato + potato share blight — never neighbor them."],
  ["tomato", "broccoli", "Brassicas and tomatoes compete heavily; keep them separated."],
  ["cabbage", "strawberry", "Brassicas and strawberries suppress each other."],
];

export type SfgRecommendation = { kind: "good" | "warn" | "tip"; text: string };

/** Grid is 16 cells, row-major, row 0 = north. Returns row/col for an index. */
export const rowOf = (i: number) => Math.floor(i / 4);
export const colOf = (i: number) => i % 4;
const adjacent = (a: number, b: number) => {
  const dr = Math.abs(rowOf(a) - rowOf(b));
  const dc = Math.abs(colOf(a) - colOf(b));
  return dr + dc === 1; // orthogonal neighbors
};

export function analyzeBed(squares: (string | null)[]): SfgRecommendation[] {
  const recs: SfgRecommendation[] = [];
  const filled = squares
    .map((key, index) => ({ key, index, plant: key ? SFG_BY_KEY[key] : null }))
    .filter((s): s is { key: string; index: number; plant: SfgPlant } => !!s.plant);

  if (!filled.length) {
    return [
      { kind: "tip", text: "Drag plants from the palette into the squares. Each square is 1 ft × 1 ft — a whole 4×4 bed is 16 squares." },
      { kind: "tip", text: "Rule of thumb: put the tallest plants (tomatoes, trellised beans, sunflowers) along the NORTH edge (top row) so they don't shade the shorter ones." },
    ];
  }

  // Height / shading — tall or vertical plants should be on the north (top) rows.
  const tallSouth = filled.filter(
    (s) => (s.plant.height === "tall" || s.plant.height === "vertical") && rowOf(s.index) >= 2,
  );
  if (tallSouth.length) {
    const names = [...new Set(tallSouth.map((s) => s.plant.name))].join(", ");
    recs.push({
      kind: "warn",
      text: `Tall plants in the south half will shade shorter crops: move ${names} to the north edge (top row).`,
    });
  } else if (filled.some((s) => s.plant.height === "tall" || s.plant.height === "vertical")) {
    recs.push({ kind: "good", text: "Nice — your tall/trellised plants are toward the north, so they won't shade the rest." });
  }

  // Vertical crops need a trellis.
  const verticals = [...new Set(filled.filter((s) => s.plant.height === "vertical").map((s) => s.plant.name))];
  if (verticals.length) {
    recs.push({ kind: "tip", text: `Add a north-side trellis for ${verticals.join(", ")} — growing up is what makes square-foot beds so productive.` });
  }

  // Companion synergies + conflicts among adjacent squares.
  const seenGood = new Set<string>();
  const seenBad = new Set<string>();
  for (let a = 0; a < filled.length; a++) {
    for (let b = a + 1; b < filled.length; b++) {
      if (!adjacent(filled[a].index, filled[b].index)) continue;
      const ka = filled[a].key, kb = filled[b].key;
      for (const [x, y, why] of GOOD_PAIRS) {
        if (((ka === x && kb === y) || (ka === y && kb === x)) && !seenGood.has(x + y)) {
          seenGood.add(x + y);
          recs.push({ kind: "good", text: why });
        }
      }
      for (const [x, y, why] of BAD_PAIRS) {
        if (((ka === x && kb === y) || (ka === y && kb === x)) && !seenBad.has(x + y)) {
          seenBad.add(x + y);
          recs.push({ kind: "warn", text: why });
        }
      }
    }
  }

  // Season mixing note.
  const cool = filled.some((s) => s.plant.season === "cool");
  const warm = filled.some((s) => s.plant.season === "warm");
  if (cool && warm) {
    recs.push({
      kind: "tip",
      text: "You've mixed cool-season and warm-season crops. That's fine for succession — just expect the cool crops (lettuce, peas, radish) to finish before the warm ones peak.",
    });
  }

  // Fullness nudge.
  if (filled.length < 16) {
    recs.push({ kind: "tip", text: `${16 - filled.length} square${16 - filled.length === 1 ? "" : "s"} still open — square-foot beds shine when every square is working.` });
  } else {
    recs.push({ kind: "good", text: "All 16 squares planted — a full, productive bed." });
  }

  return recs;
}
