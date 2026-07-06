/**
 * Propagation knowledge base — how to propagate each plant, matched by name
 * keywords. Shared by the Propagation Lab API and the plant detail cards.
 */

export type PropagationGuide = {
  method: string;
  steps: string[];
  seasonNote?: string;
};

type KnowledgeEntry = { match: RegExp } & PropagationGuide;

export const PROPAGATION_KB: KnowledgeEntry[] = [
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
    match: /chamomile|feverfew|calendula|yarrow|poppy/i,
    method: "Seed saving & direct sow",
    steps: [
      "These propagate best by seed: let a few flower heads dry fully on the plant.",
      "Crumble or shake the dry heads over a tray of moist seed-starting mix — most need light, so don't bury them.",
      "Keep misted; germination in 7–21 days.",
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
    match: /pothos|philodendron|monstera|ivy|hedera/i,
    method: "Node cuttings in water",
    steps: [
      "Cut just below a node (the bump where a leaf meets the stem — aerial root is a bonus).",
      "Place in water with the node submerged, leaf out of the water.",
      "Change water weekly; pot up when roots are 2–3 inches.",
    ],
  },
  {
    match: /spider plant|chlorophytum/i,
    method: "Plantlet division",
    steps: [
      "Snip off a plantlet (baby) from the runner.",
      "Rest it on a glass of water or directly on moist soil — it roots either way in 1–2 weeks.",
    ],
  },
  {
    match: /snake plant|sansevieria|dracaena trifasciata/i,
    method: "Leaf cuttings or division",
    steps: [
      "Cut a healthy leaf into 3-inch sections (keep track of which end was down).",
      "Let the cuts callus for 2 days, then stick the bottom ends in barely-moist mix.",
      "Be patient — pups appear in 1–2 months. Division of the root ball is much faster.",
    ],
  },
  {
    match: /succulent|echeveria|jade|sedum|crassula|haworthia|sempervivum/i,
    method: "Leaf or offset propagation",
    steps: [
      "Twist off a healthy leaf cleanly, or cut an offset (pup) at the base.",
      "Let it callus for 2–3 days in shade.",
      "Lay on dry cactus mix; mist lightly every few days once roots appear.",
    ],
  },
  {
    match: /aglaonema|chinese evergreen|dieffenbachia|calathea|goeppertia|maranta|peace lily|spathiphyllum/i,
    method: "Division at repotting",
    steps: [
      "At repotting time, gently tease the root ball apart into clumps, each with several stems and roots.",
      "Pot each clump into fresh mix; keep warm, humid, and in bright indirect light.",
      "Stem-tip cuttings of Aglaonema/Dieffenbachia also root in water at a node.",
    ],
  },
  {
    match: /fittonia|nerve plant|tradescantia|wandering|coleus|peperomia|begonia/i,
    method: "Stem cuttings in water",
    steps: [
      "Snip a 3–4 inch stem tip just below a node.",
      "Strip the lowest leaves and stand it in water in bright indirect light.",
      "These root fast — often within a week or two; pot up when roots reach an inch.",
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
    match: /grape|vitis|vine/i,
    method: "Hardwood cuttings (dormant season)",
    steps: [
      "Wait for dormancy (late winter): cut pencil-thick, 3-node lengths of last year's wood.",
      "Store bundled in damp sand in the fridge, then stick two nodes deep outdoors in spring.",
    ],
    seasonNote: "Best taken in late winter — add it to the calendar rather than doing it now.",
  },
  {
    match: /rose\b|rosa\b/i,
    method: "Softwood cuttings",
    steps: [
      "After a bloom fades, take an 8-inch cutting with 4 nodes.",
      "Remove the spent flower and lower leaves, dip in rooting hormone.",
      "Stick in moist mix under a loose plastic tent, out of direct sun; roots in 4–8 weeks.",
    ],
  },
  {
    match: /lilac|syringa/i,
    method: "Suckers or softwood cuttings",
    steps: [
      "Easiest: dig a rooted sucker from the base in early spring and replant it.",
      "Or take softwood cuttings in late spring, dip in rooting hormone, and keep humid under a dome.",
    ],
  },
  {
    match: /sand cherry|prunus|hydrangea|spirea|forsythia|boxwood|buxus|euonymus|barberry|shrub/i,
    method: "Softwood cuttings (or layering)",
    steps: [
      "Take 4–6 inch softwood cuttings from this year's growth in early summer.",
      "Strip lower leaves, dip in rooting hormone, stick in a moist perlite-heavy mix under a dome.",
      "Or bend a low branch to the ground, pin and bury a section (layering), and sever once it roots.",
    ],
  },
  {
    match: /hosta|daylily|iris|peony|phlox|shasta|leucanthemum|echinacea|penstemon|veronica|rudbeckia|bee balm|monarda|daisy|perennial/i,
    method: "Division (or basal cuttings)",
    steps: [
      "Most clumping perennials divide best in early spring or fall.",
      "Lift the clump, split it into sections each with roots and 2–3 growing points, and replant promptly.",
      "Water in well and keep the divisions shaded for a few days while they settle.",
    ],
  },
];

export const DEFAULT_PROPAGATION: PropagationGuide = {
  method: "Stem cuttings (general method)",
  steps: [
    "Take a 3–4 inch cutting of healthy, non-flowering growth just below a node.",
    "Strip the lower leaves, dip in rooting hormone if you have it.",
    "Stick in moist, well-draining mix; keep humid and in bright indirect light.",
    "Tug-test gently after 3–4 weeks — resistance means roots.",
  ],
};

export function propagationGuide(name: string): PropagationGuide {
  const entry = PROPAGATION_KB.find((candidate) => candidate.match.test(name));
  if (!entry) return DEFAULT_PROPAGATION;
  return { method: entry.method, steps: entry.steps, seasonNote: entry.seasonNote };
}
