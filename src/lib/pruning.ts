/**
 * Pruning knowledge base — which plants need pruning, when (Orem, zone 6b),
 * and exactly how. Matched by name against the real Plant Library, like the
 * care and propagation KBs.
 */

export type PruningGuide = {
  match: RegExp;
  plantType: string;
  when: string;
  /** months (1-12) when pruning is appropriate — drives the "prune now" badge */
  months: number[];
  how: string[];
  caution?: string;
};

export const PRUNING_KB: PruningGuide[] = [
  {
    match: /grape|vitis/i,
    plantType: "Grapevine",
    when: "Late winter while fully dormant (late February–early March)",
    months: [1, 2, 3],
    how: [
      "Prune hard: grapes fruit on new shoots off last year's wood, so remove ~90% of last season's growth.",
      "Keep 2 fruiting arms per trunk, cut each side shoot back to 2–3 buds (spur pruning).",
      "Take out anything dead, crossing, or growing from below the graft.",
    ],
    caution: "Pruned in spring they 'bleed' sap — harmless but alarming; earlier is tidier.",
  },
  {
    match: /rose\b|rosa\b/i,
    plantType: "Rose",
    when: "Early spring as buds swell (April in Orem), deadhead all summer",
    months: [3, 4, 5, 6, 7, 8],
    how: [
      "Spring: remove dead/black canes, thin the center to an open vase of 3–5 strong canes, cut each to an outward-facing bud at 12–18\".",
      "Cut at a 45° angle about 1/4\" above the bud.",
      "Summer: deadhead spent blooms back to the first 5-leaflet leaf to keep flushes coming.",
    ],
  },
  {
    match: /lavender/i,
    plantType: "Woody herb",
    when: "Spring after new growth shows, and a light shear after the first flush of bloom",
    months: [4, 5, 7, 8],
    how: [
      "Shear the whole plant into a tidy mound, removing about a third of the green growth.",
      "Cut spent flower stems down to the foliage after blooming for a second flush.",
    ],
    caution: "Never cut into bare brown wood — lavender rarely regrows from old wood.",
  },
  {
    match: /basil/i,
    plantType: "Tender herb",
    when: "Every week or two all season — pruning IS the harvest",
    months: [5, 6, 7, 8, 9],
    how: [
      "Pinch or snip just above a pair of leaves; two new stems grow from every cut.",
      "Start pinching when the plant has 3 sets of leaves to force a bushy plant.",
      "Remove flower spikes the moment they appear — bloom turns the leaves bitter.",
    ],
  },
  {
    match: /mint|peppermint|spearmint|lemon balm|melissa|oregano|marjoram/i,
    plantType: "Spreading herb",
    when: "Shear monthly through the growing season",
    months: [5, 6, 7, 8, 9],
    how: [
      "Cut the whole patch back by half with scissors — it regrows tender and fresh within two weeks.",
      "Hard-shear to 2\" if it gets woody or flowers; dry the trimmings for tea.",
    ],
  },
  {
    match: /thyme|sage|salvia officinalis|purpurascens/i,
    plantType: "Woody herb",
    when: "Light spring shaping + trims at harvest; stop 6 weeks before frost",
    months: [4, 5, 6, 7, 8],
    how: [
      "Spring: trim winter-scraggly tips once new growth shows.",
      "Harvest-prune stems as needed, never removing more than a third at once.",
    ],
    caution: "Like lavender: cut to green growth, not into old bare wood.",
  },
  {
    match: /rosemary/i,
    plantType: "Woody herb",
    when: "Spring and after flowering; anytime lightly for the kitchen",
    months: [4, 5, 6, 7, 8],
    how: [
      "Tip-prune regularly for kitchen sprigs — that alone keeps it dense.",
      "For shaping, cut stems back by a third just above a leaf pair.",
    ],
    caution: "No hard cuts into leafless wood.",
  },
  {
    match: /tomato/i,
    plantType: "Vegetable (vining)",
    when: "Weekly through the season once plants are knee-high",
    months: [6, 7, 8, 9],
    how: [
      "Snap out suckers (shoots in the crotch between stem and branch) while small — or root them as new plants.",
      "Remove leaves touching the soil to keep disease off.",
      "About 4 weeks before first frost (mid-September here), top the plant so energy goes to ripening.",
    ],
    caution: "Prune indeterminate varieties; bush (determinate) tomatoes need only bottom-leaf cleanup.",
  },
  {
    match: /raspberr|blackberr|bramble/i,
    plantType: "Cane fruit",
    when: "Fall-bearing: mow all canes in late winter. Summer-bearing: cut spent canes right after harvest",
    months: [1, 2, 3, 7, 8],
    how: [
      "Fall-bearing (Heritage type): cut every cane to the ground in February — fruit comes on new canes.",
      "Summer-bearing: after harvest, remove the canes that fruited (they die anyway); keep 4–6 strong new canes per foot of row.",
      "Thin skinny canes so air moves through.",
    ],
  },
  {
    match: /blueberr|vaccinium/i,
    plantType: "Berry shrub",
    when: "Late winter while dormant (February–March)",
    months: [1, 2, 3],
    how: [
      "Young plants (first 2–3 years): just remove dead twigs and any flower buds the first spring so roots establish.",
      "Mature: remove the oldest 1–2 canes at the base each year; keep 6–8 strong canes of mixed ages.",
      "Trim twiggy tip clusters — the fat buds on strong wood carry the berries.",
    ],
  },
  {
    match: /strawberr|fragaria/i,
    plantType: "Berry groundcover",
    when: "After harvest (June-bearers) and continuous runner control",
    months: [6, 7, 8, 9],
    how: [
      "Snip runners you don't want as new plants — they steal energy from fruiting crowns.",
      "After June-bearers finish, shear leaves to 3\" (don't cut the crowns) and let them regrow.",
      "Remove old, woody crowns every 2–3 years; a bed renews itself from pegged runners.",
    ],
  },
  {
    match: /lilac|syringa/i,
    plantType: "Flowering shrub",
    when: "Immediately after spring bloom — within 2–3 weeks",
    months: [5, 6],
    how: [
      "Deadhead spent flower clusters just above the pair of new shoots below them.",
      "Remove a few of the oldest, thickest stems at the ground each year to renew.",
    ],
    caution: "Prune in summer/fall and you cut off next spring's flowers — they set buds early.",
  },
  {
    match: /hydrangea/i,
    plantType: "Flowering shrub",
    when: "Depends on type: panicle/smooth in late winter; bigleaf right after bloom",
    months: [2, 3, 7],
    how: [
      "Panicle (cone flowers): cut back by a third in late winter — blooms on new wood.",
      "Bigleaf (mophead): only deadhead and thin right after flowering — blooms on old wood.",
    ],
  },
  {
    match: /sand cherry|prunus|spirea|forsythia|barberry|berberis|euonymus|boxwood|buxus/i,
    plantType: "Landscape shrub",
    when: "Spring bloomers right after flowering; foliage shrubs in late winter",
    months: [2, 3, 5, 6],
    how: [
      "Renewal-prune: remove up to a third of the oldest stems at the base each year.",
      "Shape lightly after the spring flush; avoid shearing everything into balls — natural form is healthier.",
    ],
  },
  {
    match: /maple|acer|fruit tree|apple|malus|pear|pyrus|peach|cherry tree/i,
    plantType: "Tree",
    when: "Late winter while dormant (February–March); remove suckers anytime",
    months: [1, 2, 3],
    how: [
      "Take the 3 D's first: dead, damaged, diseased.",
      "Remove crossing or inward-growing branches so light reaches the center.",
      "Never remove more than a quarter of the canopy in one year; cut just outside the branch collar.",
    ],
  },
  {
    match: /pothos|philodendron|ivy|hedera|tradescantia|wandering/i,
    plantType: "Trailing houseplant",
    when: "Any time it gets leggy — houseplants have no season",
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    how: [
      "Cut leggy vines back to just above a node; two shoots often emerge.",
      "Root the trimmings in water and pot them back in for a fuller plant.",
    ],
  },
  {
    match: /fittonia|nerve plant|coleus|peperomia|begonia|aglaonema|dieffenbachia/i,
    plantType: "Houseplant",
    when: "Pinch year-round whenever stems stretch",
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    how: [
      "Pinch stem tips above a leaf pair to keep the plant compact.",
      "Remove spent or yellowing leaves at the base as they appear.",
    ],
  },
  {
    match: /geranium|pelargonium|petunia|calibrachoa|zinnia|marigold|cosmos|dahlia|snapdragon/i,
    plantType: "Flowering annual/perennial",
    when: "Deadhead weekly all season",
    months: [5, 6, 7, 8, 9],
    how: [
      "Snap spent blooms back to the next bud or leaf — flowering doubles when nothing goes to seed.",
      "Mid-summer, shear leggy annuals back by a third; they rebound in two weeks.",
    ],
  },
  {
    match: /peace lily|spathiphyllum|snake plant|sansevieria|spider plant|chlorophytum|calathea|goeppertia|monstera/i,
    plantType: "Houseplant",
    when: "Grooming only — as needed year-round",
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    how: [
      "Cut spent flower stalks and browned leaves at the base with clean snips.",
      "Trim brown leaf tips at an angle to mimic the leaf shape.",
    ],
  },
];

export function pruningGuide(name: string): PruningGuide | null {
  return PRUNING_KB.find((guide) => guide.match.test(name)) ?? null;
}

export function pruneNow(guide: PruningGuide, now = new Date()): boolean {
  return guide.months.includes(now.getMonth() + 1);
}
