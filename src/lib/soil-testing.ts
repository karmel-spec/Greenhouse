/**
 * Soil Testing — reference data for Karmel's 3-in-1 soil meter (moisture /
 * light / pH, no batteries, just probes). How to use each mode, what the
 * readings mean, and a 60-plant chart of target ranges. Orem, Utah context:
 * high-desert zone 6b with naturally alkaline soil (pH 7.5–8.5), so the pH
 * probe matters more here than almost anywhere else.
 */

export interface MeterBand {
  range: string;
  meaning: string;
  action: string;
}

export interface MeterMode {
  key: "moisture" | "light" | "ph";
  name: string;
  emoji: string;
  unit: string;
  scale: string;
  howToUse: string[];
  bands: MeterBand[];
}

export const METER_MODES: MeterMode[] = [
  {
    key: "moisture",
    name: "Moisture",
    emoji: "💧",
    unit: "1–10 scale",
    scale: "1 (bone dry) to 10 (waterlogged)",
    howToUse: [
      "Flip the switch to MOIST and push the probes 2–4 inches into the soil — root depth, not the dry crust on top.",
      "Wait about a minute for the needle to settle; it reads the soil, not the air.",
      "Read the number, then check it against your plant's target band below.",
      "Pull the probes out and wipe them clean and dry — damp probes corrode and drift.",
    ],
    bands: [
      { range: "1–3 (dry)", meaning: "Soil is dry at root depth.", action: "Water now for most plants — but this is exactly where succulents and cacti want to live." },
      { range: "4–7 (moist)", meaning: "Comfortably damp — the happy zone for most houseplants and vegetables.", action: "Leave it alone. Test again in a few days before reaching for the watering can." },
      { range: "8–10 (wet)", meaning: "Saturated soil; roots may be sitting in water.", action: "Hold off watering, check drainage, and let it dry down — soggy roots rot faster than dry ones wilt." },
    ],
  },
  {
    key: "light",
    name: "Light",
    emoji: "☀️",
    unit: "lux",
    scale: "roughly 0 to 10,000+ lux",
    howToUse: [
      "Flip the switch to LIGHT and hold the sensor right where the leaves live, facing the light source.",
      "Give it a minute — take the reading at the time of day the plant actually gets its light.",
      "Read the lux value and compare it to the plant's band; move the plant, not the goalposts.",
      "Wipe the probes and store the meter dry, out of the soil.",
    ],
    bands: [
      { range: "50–500 lux (low)", meaning: "Deep shade or a dim corner — survival light, not growth light.", action: "Fine for snake plants and pothos; anything fussier will slowly sulk. Consider a brighter spot or a grow light." },
      { range: "500–2,000 lux (bright indirect)", meaning: "Near a window without direct sun — the sweet spot for most houseplants.", action: "Most of your tropicals want to live right here. Rotate the pot now and then so growth stays even." },
      { range: "2,000+ lux (direct sun)", meaning: "Direct beams — greenhouse benches, south windows, outdoors.", action: "Perfect for vegetables, herbs, and succulents; too harsh for calatheas and ferns, which will scorch." },
    ],
  },
  {
    key: "ph",
    name: "pH",
    emoji: "🧪",
    unit: "pH 0–14",
    scale: "0 (acidic) to 14 (alkaline), 7 is neutral",
    howToUse: [
      "Flip the switch to pH and sink the probes 2–4 inches into moist soil — pH won't read in dust-dry dirt.",
      "Wait a full minute; the pH needle is the slowest of the three to settle.",
      "Read the value and remember your baseline: untouched Utah soil usually lands at 7.5–8.5.",
      "Wipe the probes clean after every reading — residue skews the next test.",
    ],
    bands: [
      { range: "Below 7 (acidic)", meaning: "Acidic soil — rare in Orem unless you've amended with peat, sulfur, or acid fertilizer.", action: "If you're in the 6.0–7.0 range, celebrate: most plants unlock nutrients best right here." },
      { range: "6.5–7.0 (sweet spot)", meaning: "Slightly acidic to neutral — the target zone for the vast majority of what you grow.", action: "Hold steady. This is what your amendments are working toward in most beds and pots." },
      { range: "Above 7 (alkaline)", meaning: "Alkaline — the Utah default. Your native soil and tap water both push readings to 7.5–8.5.", action: "Expect this outdoors. Acid-lovers (ferns, strawberries, pansies) need acidified potting mix, sulfur, or containers to thrive here." },
    ],
  },
];

export type PlantCategory =
  | "Houseplant"
  | "Herb"
  | "Vegetable"
  | "Flower"
  | "Succulent"
  | "Outdoor perennial";

export interface SoilTestTarget {
  plant: string;
  category: PlantCategory;
  lightLux: { min: number; max: number };
  moisture: { min: number; max: number };
  ph: { min: number; max: number; optimal: number };
}

export const SOIL_TEST_CHART: SoilTestTarget[] = [
  { plant: "African Violet", category: "Houseplant", lightLux: { min: 500, max: 2000 }, moisture: { min: 5, max: 7 }, ph: { min: 5.8, max: 6.5, optimal: 6.2 } },
  { plant: "Aglaonema", category: "Houseplant", lightLux: { min: 200, max: 1500 }, moisture: { min: 4, max: 6 }, ph: { min: 5.6, max: 6.5, optimal: 6.0 } },
  { plant: "Aloe", category: "Succulent", lightLux: { min: 2000, max: 10000 }, moisture: { min: 1, max: 3 }, ph: { min: 6.0, max: 8.0, optimal: 7.0 } },
  { plant: "Aphelandra", category: "Houseplant", lightLux: { min: 800, max: 2000 }, moisture: { min: 6, max: 8 }, ph: { min: 5.5, max: 6.5, optimal: 6.0 } },
  { plant: "Arugula", category: "Vegetable", lightLux: { min: 2000, max: 10000 }, moisture: { min: 5, max: 7 }, ph: { min: 6.0, max: 7.0, optimal: 6.5 } },
  { plant: "Basil", category: "Herb", lightLux: { min: 2000, max: 10000 }, moisture: { min: 5, max: 7 }, ph: { min: 6.0, max: 7.5, optimal: 6.5 } },
  { plant: "Bee Balm", category: "Outdoor perennial", lightLux: { min: 2000, max: 10000 }, moisture: { min: 5, max: 7 }, ph: { min: 6.0, max: 7.5, optimal: 6.8 } },
  { plant: "Beet", category: "Vegetable", lightLux: { min: 2000, max: 10000 }, moisture: { min: 5, max: 7 }, ph: { min: 6.0, max: 7.5, optimal: 6.8 } },
  { plant: "Begonia", category: "Flower", lightLux: { min: 500, max: 2000 }, moisture: { min: 5, max: 7 }, ph: { min: 5.5, max: 6.5, optimal: 6.1 } },
  { plant: "Cactus", category: "Succulent", lightLux: { min: 2000, max: 10000 }, moisture: { min: 1, max: 2 }, ph: { min: 6.0, max: 8.0, optimal: 7.0 } },
  { plant: "Calathea", category: "Houseplant", lightLux: { min: 200, max: 1000 }, moisture: { min: 6, max: 8 }, ph: { min: 6.0, max: 7.0, optimal: 6.5 } },
  { plant: "Calendula", category: "Flower", lightLux: { min: 2000, max: 10000 }, moisture: { min: 4, max: 6 }, ph: { min: 6.0, max: 7.0, optimal: 6.5 } },
  { plant: "Carrot", category: "Vegetable", lightLux: { min: 2000, max: 10000 }, moisture: { min: 5, max: 7 }, ph: { min: 6.0, max: 7.0, optimal: 6.5 } },
  { plant: "Chamomile", category: "Herb", lightLux: { min: 2000, max: 10000 }, moisture: { min: 4, max: 6 }, ph: { min: 5.6, max: 7.5, optimal: 6.5 } },
  { plant: "Croton", category: "Houseplant", lightLux: { min: 800, max: 2000 }, moisture: { min: 5, max: 7 }, ph: { min: 4.5, max: 6.5, optimal: 6.0 } },
  { plant: "Cucumber", category: "Vegetable", lightLux: { min: 2000, max: 10000 }, moisture: { min: 6, max: 8 }, ph: { min: 6.0, max: 7.0, optimal: 6.5 } },
  { plant: "Daylily", category: "Outdoor perennial", lightLux: { min: 2000, max: 10000 }, moisture: { min: 4, max: 7 }, ph: { min: 6.0, max: 7.5, optimal: 6.5 } },
  { plant: "Dieffenbachia", category: "Houseplant", lightLux: { min: 500, max: 1500 }, moisture: { min: 5, max: 7 }, ph: { min: 6.0, max: 6.5, optimal: 6.2 } },
  { plant: "Dracaena", category: "Houseplant", lightLux: { min: 300, max: 1500 }, moisture: { min: 4, max: 6 }, ph: { min: 6.0, max: 6.5, optimal: 6.2 } },
  { plant: "Echinacea", category: "Outdoor perennial", lightLux: { min: 2000, max: 10000 }, moisture: { min: 3, max: 6 }, ph: { min: 6.0, max: 8.0, optimal: 7.0 } },
  { plant: "Fern (Boston)", category: "Houseplant", lightLux: { min: 200, max: 1000 }, moisture: { min: 7, max: 9 }, ph: { min: 5.0, max: 5.5, optimal: 5.3 } },
  { plant: "Ficus", category: "Houseplant", lightLux: { min: 800, max: 2000 }, moisture: { min: 5, max: 6 }, ph: { min: 6.0, max: 6.5, optimal: 6.2 } },
  { plant: "Fittonia", category: "Houseplant", lightLux: { min: 200, max: 800 }, moisture: { min: 6, max: 8 }, ph: { min: 6.0, max: 7.0, optimal: 6.5 } },
  { plant: "Geranium", category: "Flower", lightLux: { min: 2000, max: 10000 }, moisture: { min: 4, max: 6 }, ph: { min: 6.0, max: 7.5, optimal: 6.5 } },
  { plant: "Green Bean", category: "Vegetable", lightLux: { min: 2000, max: 10000 }, moisture: { min: 5, max: 7 }, ph: { min: 6.0, max: 7.0, optimal: 6.5 } },
  { plant: "Hosta", category: "Outdoor perennial", lightLux: { min: 100, max: 1000 }, moisture: { min: 6, max: 8 }, ph: { min: 6.0, max: 7.5, optimal: 6.8 } },
  { plant: "Hoya", category: "Houseplant", lightLux: { min: 500, max: 2000 }, moisture: { min: 3, max: 5 }, ph: { min: 6.0, max: 7.0, optimal: 6.5 } },
  { plant: "Iris", category: "Outdoor perennial", lightLux: { min: 2000, max: 10000 }, moisture: { min: 4, max: 7 }, ph: { min: 6.0, max: 7.5, optimal: 6.8 } },
  { plant: "Jade Plant", category: "Succulent", lightLux: { min: 2000, max: 8000 }, moisture: { min: 1, max: 3 }, ph: { min: 6.0, max: 7.5, optimal: 6.5 } },
  { plant: "Kalanchoe", category: "Succulent", lightLux: { min: 1500, max: 5000 }, moisture: { min: 2, max: 4 }, ph: { min: 6.0, max: 6.7, optimal: 6.3 } },
  { plant: "Kale", category: "Vegetable", lightLux: { min: 2000, max: 10000 }, moisture: { min: 5, max: 7 }, ph: { min: 6.0, max: 7.5, optimal: 6.8 } },
  { plant: "Lavender", category: "Herb", lightLux: { min: 3000, max: 10000 }, moisture: { min: 2, max: 4 }, ph: { min: 6.5, max: 8.0, optimal: 7.2 } },
  { plant: "Lemon Balm", category: "Herb", lightLux: { min: 1500, max: 8000 }, moisture: { min: 5, max: 7 }, ph: { min: 6.0, max: 7.5, optimal: 6.8 } },
  { plant: "Lettuce", category: "Vegetable", lightLux: { min: 1500, max: 8000 }, moisture: { min: 6, max: 8 }, ph: { min: 6.0, max: 7.0, optimal: 6.5 } },
  { plant: "Marigold", category: "Flower", lightLux: { min: 2000, max: 10000 }, moisture: { min: 4, max: 6 }, ph: { min: 6.0, max: 7.5, optimal: 6.5 } },
  { plant: "Mesclun greens", category: "Vegetable", lightLux: { min: 1500, max: 8000 }, moisture: { min: 6, max: 8 }, ph: { min: 6.0, max: 7.0, optimal: 6.5 } },
  { plant: "Mint", category: "Herb", lightLux: { min: 1000, max: 5000 }, moisture: { min: 6, max: 8 }, ph: { min: 6.0, max: 7.5, optimal: 6.8 } },
  { plant: "Monstera", category: "Houseplant", lightLux: { min: 500, max: 2000 }, moisture: { min: 4, max: 6 }, ph: { min: 5.5, max: 7.0, optimal: 6.3 } },
  { plant: "Oregano", category: "Herb", lightLux: { min: 2000, max: 10000 }, moisture: { min: 3, max: 5 }, ph: { min: 6.5, max: 8.0, optimal: 7.0 } },
  { plant: "Pansy", category: "Flower", lightLux: { min: 1500, max: 8000 }, moisture: { min: 5, max: 7 }, ph: { min: 5.4, max: 6.2, optimal: 5.8 } },
  { plant: "Pea", category: "Vegetable", lightLux: { min: 2000, max: 10000 }, moisture: { min: 5, max: 7 }, ph: { min: 6.0, max: 7.5, optimal: 6.8 } },
  { plant: "Peace Lily", category: "Houseplant", lightLux: { min: 200, max: 1500 }, moisture: { min: 5, max: 7 }, ph: { min: 5.8, max: 6.5, optimal: 6.2 } },
  { plant: "Peony", category: "Outdoor perennial", lightLux: { min: 2000, max: 10000 }, moisture: { min: 4, max: 6 }, ph: { min: 6.5, max: 7.5, optimal: 7.0 } },
  { plant: "Peperomia", category: "Houseplant", lightLux: { min: 500, max: 1500 }, moisture: { min: 3, max: 5 }, ph: { min: 6.0, max: 6.6, optimal: 6.3 } },
  { plant: "Pepper", category: "Vegetable", lightLux: { min: 3000, max: 10000 }, moisture: { min: 5, max: 7 }, ph: { min: 6.0, max: 7.0, optimal: 6.5 } },
  { plant: "Philodendron", category: "Houseplant", lightLux: { min: 400, max: 2000 }, moisture: { min: 4, max: 6 }, ph: { min: 5.5, max: 6.5, optimal: 6.0 } },
  { plant: "Pothos", category: "Houseplant", lightLux: { min: 300, max: 2000 }, moisture: { min: 4, max: 6 }, ph: { min: 6.1, max: 6.8, optimal: 6.4 } },
  { plant: "Pumpkin", category: "Vegetable", lightLux: { min: 3000, max: 10000 }, moisture: { min: 6, max: 8 }, ph: { min: 6.0, max: 7.5, optimal: 6.8 } },
  { plant: "Radish", category: "Vegetable", lightLux: { min: 2000, max: 10000 }, moisture: { min: 5, max: 7 }, ph: { min: 6.0, max: 7.0, optimal: 6.5 } },
  { plant: "Rose", category: "Outdoor perennial", lightLux: { min: 3000, max: 10000 }, moisture: { min: 5, max: 7 }, ph: { min: 6.0, max: 7.0, optimal: 6.5 } },
  { plant: "Rosemary", category: "Herb", lightLux: { min: 3000, max: 10000 }, moisture: { min: 2, max: 4 }, ph: { min: 6.0, max: 7.8, optimal: 7.0 } },
  { plant: "Sage", category: "Herb", lightLux: { min: 2500, max: 10000 }, moisture: { min: 3, max: 5 }, ph: { min: 6.0, max: 7.5, optimal: 6.8 } },
  { plant: "Snake Plant", category: "Houseplant", lightLux: { min: 200, max: 2000 }, moisture: { min: 2, max: 4 }, ph: { min: 5.5, max: 7.5, optimal: 6.5 } },
  { plant: "Spider Plant", category: "Houseplant", lightLux: { min: 400, max: 2000 }, moisture: { min: 4, max: 6 }, ph: { min: 6.0, max: 7.2, optimal: 6.5 } },
  { plant: "Spinach", category: "Vegetable", lightLux: { min: 1500, max: 8000 }, moisture: { min: 6, max: 8 }, ph: { min: 6.5, max: 7.5, optimal: 7.0 } },
  { plant: "Strawberry", category: "Vegetable", lightLux: { min: 2500, max: 10000 }, moisture: { min: 5, max: 7 }, ph: { min: 5.5, max: 6.5, optimal: 6.0 } },
  { plant: "Succulents (mixed)", category: "Succulent", lightLux: { min: 2000, max: 8000 }, moisture: { min: 1, max: 3 }, ph: { min: 6.0, max: 7.5, optimal: 6.6 } },
  { plant: "Thyme", category: "Herb", lightLux: { min: 2500, max: 10000 }, moisture: { min: 2, max: 4 }, ph: { min: 6.5, max: 8.0, optimal: 7.0 } },
  { plant: "Tomato", category: "Vegetable", lightLux: { min: 3000, max: 10000 }, moisture: { min: 5, max: 7 }, ph: { min: 6.0, max: 7.0, optimal: 6.5 } },
  { plant: "Watermelon", category: "Vegetable", lightLux: { min: 3000, max: 10000 }, moisture: { min: 5, max: 7 }, ph: { min: 6.0, max: 7.0, optimal: 6.5 } },
];

export const KEY_INSIGHTS: string[] = [
  "Succulents and cacti want the driest soil on the whole chart (moisture 1–3) — if the needle reads 4 or higher, put the watering can down.",
  "Boston ferns sit at the opposite extreme (moisture 7–9): they're the only plants here that genuinely want the meter reading 'wet' most of the time.",
  "Your Orem soil and tap water both run alkaline (pH 7.5–8.5), so acid-lovers like ferns, strawberries, and pansies need acidified potting mix or sulfur to hit their targets — the meter will tell you when the amendments are winning.",
  "Most houseplants cluster in the same comfort zone: moisture 4–7 and pH 6.5–7.0. If a reading lands there, you're probably fine.",
  "Test before you water, not after — a fresh watering pins the moisture needle high and tells you nothing about what the roots were living in.",
];
