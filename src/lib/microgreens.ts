/**
 * Microgreens knowledge base — everything needed to grow each type well:
 * timing, soak/blackout, flavor, nutrition, and tray tips. Photos live in
 * public/crops/micro/<key>.jpg (fetched from Wikimedia Commons; a missing
 * file just hides the image).
 */

export type Microgreen = {
  key: string;
  name: string;
  days: number; // seed to harvest
  soakHours: number; // 0 = no soak
  blackoutDays: number;
  flavor: string;
  nutrition: string;
  difficulty: "Easy" | "Moderate" | "Advanced";
  seedPerTray: string; // for a standard 10x20 tray
  regrows: boolean;
  tips: string[];
};

export const MICROGREENS: Microgreen[] = [
  {
    key: "radish",
    name: "Radish",
    days: 8,
    soakHours: 0,
    blackoutDays: 3,
    flavor: "Crisp and peppery — the fastest payoff in the studio.",
    nutrition: "Vitamin C, folate, and the same mustard-family antioxidants as the mature root.",
    difficulty: "Easy",
    seedPerTray: "~1 oz",
    regrows: false,
    tips: [
      "The best beginner green: fast, forgiving, and nearly always germinates.",
      "Harvest right when the first true leaf appears — flavor turns hot after that.",
      "Purple varieties (Rambo) make the prettiest garnish.",
    ],
  },
  {
    key: "broccoli",
    name: "Broccoli",
    days: 10,
    soakHours: 0,
    blackoutDays: 3,
    flavor: "Mild, fresh, faintly like broccoli stems.",
    nutrition: "The famous one: sulforaphane concentrations many times higher than mature broccoli.",
    difficulty: "Easy",
    seedPerTray: "~1 oz",
    regrows: false,
    tips: [
      "Keep the mist light — broccoli dislikes soggy trays and damps off easily.",
      "Dense, even seeding gives the carpet-like tray everyone photographs.",
      "Eat raw to keep the sulforaphane; heat breaks it down.",
    ],
  },
  {
    key: "pea",
    name: "Pea Shoots",
    days: 12,
    soakHours: 8,
    blackoutDays: 4,
    flavor: "Sweet, juicy, tastes exactly like fresh peas.",
    nutrition: "Vitamins A, C, and folate with real protein for a green.",
    difficulty: "Easy",
    seedPerTray: "~10 oz (big seeds)",
    regrows: true,
    tips: [
      "Soak overnight, then weight the seeds with a second tray for 3–4 days — stockier shoots.",
      "Cut above the lowest leaf node and most trays regrow a second harvest.",
      "Harvest at 3–4 inches with the tendrils curling; they get stringy past 5 inches.",
    ],
  },
  {
    key: "sunflower",
    name: "Sunflower",
    days: 12,
    soakHours: 12,
    blackoutDays: 4,
    flavor: "Nutty and crunchy — the snacking microgreen.",
    nutrition: "Vitamin E, healthy fats, and minerals from the seed reserves.",
    difficulty: "Moderate",
    seedPerTray: "~9 oz (black oil, in shell)",
    regrows: false,
    tips: [
      "Soak 12 hours, weight the tray during blackout, and brush shed hulls off with dry hands.",
      "Harvest before true leaves — they turn bitter the day the second leaves show.",
      "Prone to mold in stagnant air; run a small fan across the shelf.",
    ],
  },
  {
    key: "arugula",
    name: "Arugula",
    days: 9,
    soakHours: 0,
    blackoutDays: 3,
    flavor: "Peppery rocket bite, softer than the mature leaf.",
    nutrition: "Calcium, vitamin K, and glucosinolates.",
    difficulty: "Easy",
    seedPerTray: "~0.5 oz",
    regrows: false,
    tips: [
      "Seeds turn gelatinous when wet (that's normal) — mist gently, don't drench.",
      "Sow thinner than you think; crowded arugula stays leggy.",
      "A staple for sandwich and pizza topping mixes.",
    ],
  },
  {
    key: "kale",
    name: "Kale",
    days: 10,
    soakHours: 0,
    blackoutDays: 3,
    flavor: "Mild sweet cabbage — none of the mature leaf's toughness.",
    nutrition: "Vitamins A, C, K and lutein, concentrated in the seedling.",
    difficulty: "Easy",
    seedPerTray: "~1 oz",
    regrows: false,
    tips: [
      "Red Russian kale gives pink stems that look beautiful against the cotyledons.",
      "Harvest at cotyledon stage for mixes, or let the first true leaf develop for body.",
      "Nearly as reliable as radish — a good second tray.",
    ],
  },
  {
    key: "mizuna",
    name: "Mizuna",
    days: 10,
    soakHours: 0,
    blackoutDays: 3,
    flavor: "Gentle mustard with a feathery, elegant leaf.",
    nutrition: "Folate, vitamin C, and antioxidants typical of Asian brassicas.",
    difficulty: "Easy",
    seedPerTray: "~0.5 oz",
    regrows: false,
    tips: [
      "The serrated leaves make it the prettiest filler in a salad mix.",
      "Grows fast and tall — harvest promptly or it flops.",
      "Tolerates cooler shelves than most, good for the greenhouse edge in spring.",
    ],
  },
  {
    key: "basil",
    name: "Basil",
    days: 18,
    soakHours: 0,
    blackoutDays: 4,
    flavor: "Full basil aroma in a two-inch plant — intense garnish.",
    nutrition: "Vitamin K and the aromatic oils that make basil basil.",
    difficulty: "Advanced",
    seedPerTray: "~0.4 oz",
    regrows: false,
    tips: [
      "The patience tray: slow to germinate and slow to size up — don't give up at day 7.",
      "Seeds gel like chia when misted; that coating is protective, leave it be.",
      "Needs the warmest spot in the studio — below 70°F it just sulks.",
    ],
  },
  {
    key: "beet",
    name: "Beet",
    days: 14,
    soakHours: 8,
    blackoutDays: 5,
    flavor: "Earthy and sweet with candy-striped magenta stems.",
    nutrition: "Betalain antioxidants, folate, and manganese.",
    difficulty: "Moderate",
    seedPerTray: "~2 oz",
    regrows: false,
    tips: [
      "Each 'seed' is a cluster — expect clumpy germination and thin gently.",
      "Soak overnight to soften the corky seed coat.",
      "The most striking color in the studio; chefs pay a premium for a reason.",
    ],
  },
  {
    key: "cilantro",
    name: "Cilantro",
    days: 16,
    soakHours: 6,
    blackoutDays: 5,
    flavor: "Bright citrus-cilantro punch, stronger than the mature herb.",
    nutrition: "Vitamins A and K plus the aromatic compounds of the leaf.",
    difficulty: "Advanced",
    seedPerTray: "~1.5 oz (split seed)",
    regrows: false,
    tips: [
      "Buy 'split' coriander seed — whole seed husks germinate slowly and unevenly.",
      "Slow but worth it: taco night from the greenhouse shelf.",
      "Keep it cool; heat makes the flavor soapy-sharp.",
    ],
  },
  {
    key: "mustard",
    name: "Mustard",
    days: 9,
    soakHours: 0,
    blackoutDays: 3,
    flavor: "Hot horseradish-wasabi kick — a little goes far.",
    nutrition: "Vitamin K, carotenoids, and pungent isothiocyanates.",
    difficulty: "Easy",
    seedPerTray: "~0.75 oz",
    regrows: false,
    tips: [
      "Fast and aggressive like radish — a great confidence tray.",
      "Mix 1 part mustard to 3 parts mild greens for a balanced spicy mix.",
      "Harvest young; heat builds every day past the first true leaf.",
    ],
  },
  {
    key: "cabbage",
    name: "Red Cabbage",
    days: 10,
    soakHours: 0,
    blackoutDays: 3,
    flavor: "Mild and sweet with red-violet stems.",
    nutrition: "One of the highest vitamin C microgreens, plus anthocyanins.",
    difficulty: "Easy",
    seedPerTray: "~1 oz",
    regrows: false,
    tips: [
      "The purple stems + green leaf make salad mixes look professional.",
      "Even germinator — good for teaching kids the process.",
      "Same care as broccoli: light mist, moving air.",
    ],
  },
  {
    key: "amaranth",
    name: "Amaranth",
    days: 12,
    soakHours: 0,
    blackoutDays: 4,
    flavor: "Mild and beet-like; grown mostly for the neon magenta color.",
    nutrition: "Complete amino-acid profile and betalain pigments.",
    difficulty: "Moderate",
    seedPerTray: "~0.3 oz (tiny seed)",
    regrows: false,
    tips: [
      "Seeds are dust-fine — mix with sand or use a shaker to sow evenly.",
      "Wants real warmth (75°F+) to germinate; the greenhouse in summer is perfect.",
      "The brightest color in the tray room — use it as the accent, not the base.",
    ],
  },
  {
    key: "kohlrabi",
    name: "Kohlrabi",
    days: 10,
    soakHours: 0,
    blackoutDays: 3,
    flavor: "Sweet, mild cabbage crunch with purple-tinged stems.",
    nutrition: "Vitamin C and the usual brassica antioxidant suite.",
    difficulty: "Easy",
    seedPerTray: "~1 oz",
    regrows: false,
    tips: [
      "Underrated: as easy as broccoli but prettier in the tray.",
      "Purple Vienna is the variety worth finding.",
      "Great texture green for slaws and grain bowls.",
    ],
  },
  {
    key: "wheatgrass",
    name: "Wheatgrass",
    days: 10,
    soakHours: 10,
    blackoutDays: 3,
    flavor: "Sweet grassy — juiced, not chewed.",
    nutrition: "Chlorophyll, iron, and enzymes; the classic juicing shot.",
    difficulty: "Easy",
    seedPerTray: "~12 oz (hard red wheat)",
    regrows: true,
    tips: [
      "Soak 8–12 hours, sow thick as a lawn, harvest with scissors at 6 inches.",
      "Regrows once, but the second cut is noticeably weaker — most growers re-sow.",
      "A 10×20 tray yields roughly 10–14 oz of juice-ready grass.",
    ],
  },
  {
    key: "chard",
    name: "Swiss Chard",
    days: 14,
    soakHours: 8,
    blackoutDays: 5,
    flavor: "Mild beet-spinach with rainbow stems.",
    nutrition: "Vitamins A, C, K and magnesium.",
    difficulty: "Moderate",
    seedPerTray: "~2 oz",
    regrows: false,
    tips: [
      "Same clustered seed as beets — soak it and forgive uneven patches.",
      "'Bright Lights' seed gives gold, pink, and red stems in one tray.",
      "Slower than the brassicas; pair it with a radish tray so something's always ready.",
    ],
  },
];

export const MICROGREENS_BY_KEY = new Map(MICROGREENS.map((m) => [m.key, m]));

export function microPhoto(key: string) {
  return `/crops/micro/${key}.jpg`;
}
