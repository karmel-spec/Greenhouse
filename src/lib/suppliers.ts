/**
 * Suppliers — Karmel's reorder book. Every company she buys from, what she
 * gets there, and why she goes back. URLs are stored without a protocol;
 * the Suppliers component adds https:// when it links out.
 */

export interface Supplier {
  key: string;
  name: string;
  emoji: string;
  /** Bare domain, no protocol (may or may not include www). */
  url?: string;
  /** Email or other contact when there's no storefront to link. */
  contact?: string;
  /** How long they've been around, when it's part of their story. */
  since?: string;
  products: string[];
  goodFor: string;
}

export const SUPPLIERS: Supplier[] = [
  {
    key: "true-leaf-market",
    name: "True Leaf Market",
    emoji: "🌱",
    url: "www.trueleafmarket.com",
    products: [
      "Microgreens seeds",
      "Micro-Mat hydroponic grow mats (SKU 17428, biodegradable)",
    ],
    goodFor: "your microgreens program",
  },
  {
    key: "ferry-morse",
    name: "Ferry-Morse",
    emoji: "🌾",
    url: "ferrymorse.com",
    since: "est. 1856",
    products: [
      "72-cell seed starting tray",
      "Heat mat",
      "Pumpkin, sunflower, asian greens, microgreens & salad mix seeds",
      "Queen of Night tulip bulbs",
    ],
    goodFor: "your seed starting backbone — reliable germination",
  },
  {
    key: "burpee",
    name: "Burpee",
    emoji: "🥬",
    url: "burpee.com",
    products: ["Spinach Baby's Leaf Hybrid", "Pea Super Snappy"],
    goodFor: "proven vegetable varieties",
  },
  {
    key: "survival-essentials",
    name: "Survival Essentials",
    emoji: "🏺",
    url: "survival-essentials.com",
    products: [
      "Premium Heirloom Seed vault (144 varieties, non-GMO, open-pollinated)",
      "Green Bean Blue Lake Pole (100 seeds, 87% germination)",
    ],
    goodFor: "seed saving + your emergency vault",
  },
  {
    key: "govee",
    name: "Govee",
    emoji: "🌡️",
    contact: "support@govee.com",
    products: [
      "H5075 thermometer/hygrometer",
      "Smart Thermostat HS6075",
      "App alerts",
    ],
    goodFor: "greenhouse monitoring",
  },
  {
    key: "netherland-bulb",
    name: "Netherland Bulb Company",
    emoji: "🧅",
    url: "www.netherlandbulb.com",
    products: [
      "White onion bulbs (Allium cepa 14/21mm)",
      "Dutch onion sets (white 8/21mm, 75-set)",
    ],
    goodFor: "fall bulbs & onion sets",
  },
  {
    key: "gourmet-grow",
    name: "Gourmet Grow",
    emoji: "🌿",
    products: ["Curry Plant (non-GMO)"],
    goodFor: "unusual herbs",
  },
  {
    key: "aviflora",
    name: "Aviflora",
    emoji: "🌷",
    url: "www.aviflora.nl",
    products: ["Queen of Night tulips (product of Netherlands)"],
    goodFor: "specialty Dutch tulips",
  },
];
