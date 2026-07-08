/**
 * Fertilizers — what Karmel actually owns on the shelf, plus a feeding map
 * for everything growing in the greenhouse. Orem sits in high-desert zone 6b
 * with alkaline soil and tap water (pH 7.5–8.5), so the guidance here leans
 * gentle: dilute, feed less often than the label brags, and flush salts.
 */

export interface FertilizerProduct {
  key: string;
  name: string;
  emoji: string;
  form: string;
  activeIngredient: string;
  bestFor: string[];
  application: string[];
  notes: string;
}

export interface FeedingGroup {
  plants: string;
  fertilizer: string;
  npkHint: string;
  frequency: string;
  warning?: string;
}

export interface FeedingCard {
  key: string;
  title: string;
  emoji: string;
  groups: FeedingGroup[];
}

export interface FeedingTips {
  overFeedingSigns: string[];
  underFeedingSigns: string[];
  generalRules: string[];
}

export const FERTILIZER_PRODUCTS: FertilizerProduct[] = [
  {
    key: "osmocote",
    name: "Osmocote Smart-Release Plant Food",
    emoji: "🫘",
    form: "Granular — the little teal/blue prills",
    activeIngredient: "Slow-release balanced NPK (feeds 3–6 months)",
    bestFor: ["Container plants", "Houseplants", "Flowers", "Vegetables"],
    application: [
      "Mix 1–2 tbsp into the soil per 6-inch pot at planting time.",
      "Water thoroughly to activate the prills.",
      "Top up once the feeding window (3–6 months) has passed.",
    ],
    notes:
      "Release is temperature-driven — warm soil speeds it up, cool soil slows it down. In a hot greenhouse summer the prills empty faster than the bag promises, so check your plants, not the calendar. Spent prills stay visible in the soil; they're just empty shells.",
  },
  {
    key: "takeroot",
    name: "Garden Safe TakeRoot Rooting Hormone",
    emoji: "🌿",
    form: "Powder",
    activeIngredient: "0.1% IBA (indole-3-butyric acid)",
    bestFor: ["Cuttings", "Water propagation", "Soil propagation"],
    application: [
      "Water propagation: dust the cut end lightly, then water-change every 3–5 days.",
      "Soil propagation: coat generously, pop on a humidity dome, and expect roots in 2–4 weeks.",
      "Pour a little powder into a separate dish to dip from — never dip cuttings into the jar itself.",
    ],
    notes:
      "Keeps 2–3 years sealed and stored dry. It's a hormone, not a fertilizer — it tells the cutting to grow roots, it doesn't feed it. Once roots appear, that's when feeding begins.",
  },
];

export const FEEDING_CARDS: FeedingCard[] = [
  {
    key: "houseplants",
    title: "Houseplants, year-round",
    emoji: "🪴",
    groups: [
      {
        plants: "Foliage plants",
        fertilizer: "Balanced liquid feed at quarter strength",
        npkHint: "10-10-10, diluted to ¼",
        frequency: "Monthly during active growth",
        warning: "Take winter off — short days mean slow growth, and unused food just builds up as salt.",
      },
      {
        plants: "Succulents & cacti",
        fertilizer: "Low-nitrogen cactus feed",
        npkHint: "2-7-7 (low N keeps them compact)",
        frequency: "Only 2–3 times per growing season",
        warning: "Overfed succulents stretch, split, and go soft. When in doubt, skip it.",
      },
      {
        plants: "Flowering houseplants",
        fertilizer: "Higher-phosphorus bloom feed during bud set",
        npkHint: "Higher middle number (P) when buds form",
        frequency: "Every 2–3 weeks, diluted",
      },
      {
        plants: "Ferns & humidity lovers",
        fertilizer: "Gentle quarter-strength feed",
        npkHint: "Balanced, at ¼ strength",
        frequency: "Monthly",
        warning: "Never fertilize dry soil — ferns burn easily. Water first, feed second.",
      },
    ],
  },
  {
    key: "vegetables",
    title: "Vegetables & herbs",
    emoji: "🍅",
    groups: [
      {
        plants: "Leafy greens (lettuce, spinach, chard)",
        fertilizer: "Nitrogen-forward feed for leafy growth",
        npkHint: "N-forward (high first number)",
        frequency: "Weekly at ¼ strength",
      },
      {
        plants: "Fruiting veg (tomatoes, peppers, cucumbers)",
        fertilizer: "Start balanced, switch to a bloom formula at first flowers",
        npkHint: "Balanced early, then 5-10-10 once flowering",
        frequency: "Every 1–2 weeks",
        warning: "Too much nitrogen after flowering means gorgeous leaves and no fruit.",
      },
      {
        plants: "Culinary herbs (basil, parsley, cilantro)",
        fertilizer: "A light hand — flavor drops when overfed",
        npkHint: "Balanced, well diluted",
        frequency: "Monthly at most",
      },
      {
        plants: "Mediterranean herbs (rosemary, lavender, thyme, sage)",
        fertilizer: "Almost none",
        npkHint: "Lean soil = stronger oils",
        frequency: "Rarely — a little compost in spring is plenty",
        warning: "These grew up on rocky hillsides. Rich soil makes them floppy and bland.",
      },
    ],
  },
  {
    key: "propagation",
    title: "Propagation station",
    emoji: "🌱",
    groups: [
      {
        plants: "Rooting cuttings (in water or soil)",
        fertilizer: "None",
        npkHint: "No roots, no food",
        frequency: "Never while rooting",
        warning: "Fertilizer in propagation water feeds algae and rot, not your cutting.",
      },
      {
        plants: "Rooted cuttings",
        fertilizer: "Quarter-strength balanced feed",
        npkHint: "Balanced, at ¼ strength",
        frequency: "Start after 2–3 weeks of visible new growth",
      },
      {
        plants: "Seedlings",
        fertilizer: "Quarter-strength feed once first true leaves appear",
        npkHint: "Balanced, at ¼ strength",
        frequency: "Weekly after true leaves show",
      },
      {
        plants: "Microgreens",
        fertilizer: "None",
        npkHint: "The seed carries everything to harvest",
        frequency: "Never — you'll harvest before they need a meal",
      },
    ],
  },
  {
    key: "apothecary",
    title: "Apothecary garden",
    emoji: "🌼",
    groups: [
      {
        plants: "Perennial medicinal herbs (echinacea, yarrow, valerian)",
        fertilizer: "Light spring compost top-dress, minimal synthetic",
        npkHint: "Gentle organic matter over NPK numbers",
        frequency: "Once in spring",
        warning: "Lean feeding concentrates the bioactive compounds — the whole point of an apothecary bed.",
      },
      {
        plants: "Annual medicinal herbs (calendula, chamomile)",
        fertilizer: "Gentle diluted feed",
        npkHint: "Balanced, well diluted",
        frequency: "Monthly",
      },
      {
        plants: "Mint family (mint, lemon balm, catnip)",
        fertilizer: "Feed lightly or it takes the county",
        npkHint: "Barely any — mint invents its own",
        frequency: "Rarely, if ever",
        warning: "A well-fed mint is a mint planning an invasion. Keep it hungry and in a pot.",
      },
    ],
  },
];

export const FEEDING_TIPS: FeedingTips = {
  overFeedingSigns: [
    "White crust on the soil surface or pot rim — that's fertilizer salt.",
    "Brown, crispy leaf tips and edges even when watering is on schedule.",
    "Lush, floppy growth that flops over or attracts aphids.",
    "Leaves curling downward or wilting right after a feed.",
    "Flowering plants making all leaves and no blooms (too much nitrogen).",
  ],
  underFeedingSigns: [
    "Older, lower leaves turning uniformly yellow while new growth stays small.",
    "Pale, washed-out green across the whole plant.",
    "Growth stalling out during the season when it should be surging.",
    "Small new leaves and short gaps between them.",
    "Purple or reddish tinting on leaves (often a phosphorus shortage).",
  ],
  generalRules: [
    "Water BEFORE fertilizing — feed on moist soil, never dry roots.",
    "Flush pots monthly with plain water to rinse accumulated salts out the drainage holes.",
    "Cool season = less food; hot season = careful food. Evaporation concentrates salts fast in a warm greenhouse.",
    "Your Utah tap water runs alkaline (pH 7.5–8.5) — watch pH with acid-lovers and consider an acidifying fertilizer for them.",
    "When you're unsure, halve the label rate. It's far easier to feed again than to un-burn roots.",
  ],
};
