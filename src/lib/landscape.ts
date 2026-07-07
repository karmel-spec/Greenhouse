/**
 * Edible landscape project guides — what to plant, how to lay it out, and
 * when to do it in Orem (zone 6b, high desert). Each guide backs one card
 * in the Edible Landscape Planner.
 */

export type LandscapeProject = {
  key: string;
  name: string;
  tagline: string;
  heroPlant: string; // looked up via plantPhoto() for the detail image
  why: string;
  plants: { name: string; note: string }[];
  layout: string[];
  oremTiming: string;
};

export const LANDSCAPE_PROJECTS: LandscapeProject[] = [
  {
    key: "berries",
    name: "Sun Garden berries",
    tagline: "A berry patch that earns its full-sun real estate",
    heroPlant: "Strawberry",
    why:
      "Berries are the highest-value edible landscaping there is: perennial, beautiful in bloom, and Utah's dry summers mean less fruit rot than almost anywhere.",
    plants: [
      { name: "June-bearing strawberries", note: "One big early-summer flush for jam and freezing — 'Honeoye' or 'Jewel'." },
      { name: "Everbearing strawberries", note: "'Seascape' or 'Albion' keep fruiting until frost — the snacking row." },
      { name: "Fall-bearing raspberries", note: "'Heritage' or 'Caroline' — mow canes each winter, fruit every fall, no trellis drama." },
      { name: "Thornless blackberries", note: "'Triple Crown' on a simple two-wire fence — huge yields off a small footprint." },
      { name: "Currants or honeyberries", note: "The part-shade edge workers — they take the corner the sun misses." },
    ],
    layout: [
      "Run raspberry and blackberry rows north–south so both sides get even light.",
      "Edge the beds with strawberries as a living, fruiting border.",
      "Leave a 3 ft mulched path between rows — you'll be in here every day in July.",
      "Drip line under mulch; berries want steady water but dry leaves.",
    ],
    oremTiming: "Plant bare-root in late March–April. Net everything by mid-June — the robins know your schedule.",
  },
  {
    key: "vineyard",
    name: "Vineyard pathway",
    tagline: "Table grapes overhead, a shaded walk underneath",
    heroPlant: "Grape",
    why:
      "Grapes love Utah — hot days, cool nights, low disease pressure. Trained over a pathway arbor they turn a walkway into the prettiest structure on the property.",
    plants: [
      { name: "'Himrod' (white seedless)", note: "Early, hardy, and the sweetest snacking grape for zone 6." },
      { name: "'Canadice' (red seedless)", note: "Compact clusters, ripens early — good for the arbor's cooler end." },
      { name: "'Concord'", note: "The juice-and-jelly classic; bulletproof in Utah winters." },
      { name: "'Niagara'", note: "Concord's white cousin — vigorous, fragrant, fills an arbor fast." },
    ],
    layout: [
      "Set arbor posts 8 ft apart along the path; one vine per post.",
      "First year: grow a single trunk up each post — pinch everything else.",
      "Years two and three: train two arms along the top wires; fruit spurs hang the clusters at head height.",
      "Underplant the shady path edge with alpine strawberries.",
    ],
    oremTiming: "Plant dormant vines in late April. Prune hard every year in late February — grapes fruit on new wood off last year's spurs.",
  },
  {
    key: "tea",
    name: "Tea garden border",
    tagline: "A border you harvest by the cupful",
    heroPlant: "Chamomile",
    why:
      "A tea border near the patio turns an ornamental strip into a daily ritual — every plant in it doubles as a cut-and-dry herbal tea.",
    plants: [
      { name: "German chamomile", note: "The backbone — flowers all season if you keep picking. Self-sows politely." },
      { name: "Lemon balm", note: "Bright citrus base note; shear it monthly so it stays soft and leafy." },
      { name: "Mint (contained!)", note: "Sink it in a bottomless pot or it becomes the whole border." },
      { name: "Anise hyssop", note: "Licorice-sweet leaves, pollinator magnet, gorgeous purple spikes." },
      { name: "Bee balm (Monarda)", note: "Earl-Grey bergamot notes; loves a slightly moister spot." },
      { name: "Lavender", note: "A few buds deepen any blend — and it thrives in Utah's dry air." },
    ],
    layout: [
      "Put the border within 20 steps of the kettle — tea gardens get used when they're close.",
      "Tall anise hyssop and bee balm at the back, chamomile and lemon balm mid, thyme and lavender at the hot front edge.",
      "Harvest mornings after dew dries; dry small bundles in the greenhouse.",
    ],
    oremTiming: "Set out perennials in late April; direct-sow chamomile then too. First real harvests by mid-June, dried jars by August.",
  },
  {
    key: "pollinator",
    name: "Pollinator flower bands",
    tagline: "Waterwise bloom ribbons that feed the whole garden",
    heroPlant: "Echinacea",
    why:
      "Bands of nectar flowers along fences multiply every squash, berry, and tomato you grow — and Utah natives do it on almost no water.",
    plants: [
      { name: "Yarrow & penstemon", note: "Native, drought-proof early bloom that brings mason bees in April–May." },
      { name: "Echinacea & blanketflower", note: "The tough midsummer core — bloom through July heat without complaint." },
      { name: "Bee balm & anise hyssop", note: "Hummingbird layer, mid-band where a drip line runs." },
      { name: "Calendula & zinnias", note: "Annual color gap-fillers you can also cut for the table." },
      { name: "Sunflowers", note: "The back row — birds get the seed heads, you get the September show." },
    ],
    layout: [
      "Plant 3–4 ft wide bands along fence lines and bed ends — edges, not islands.",
      "Aim for three of everything, drifted; pollinators find clumps, not singles.",
      "Sequence bloom: penstemon/yarrow (spring) → echinacea/blanketflower (summer) → zinnias/sunflowers (fall).",
      "Leave seed heads standing through winter — food and habitat.",
    ],
    oremTiming: "Sow annuals after Mother's Day; plant perennial starts April–May or fall. Skip fertilizer — natives bloom harder lean.",
  },
  {
    key: "spiral",
    name: "Herb spiral",
    tagline: "Six microclimates in six feet",
    heroPlant: "Rosemary",
    why:
      "A spiral of stacked stone creates a dry Mediterranean top and a moist shaded base in one sculptural mound — the whole herb pantry in a single feature.",
    plants: [
      { name: "Top (hot & dry)", note: "Rosemary, lavender, thyme — they want the drainage and the baking sun." },
      { name: "Mid-slope south", note: "Sage, oregano — full sun, average water." },
      { name: "Mid-slope north", note: "Parsley, cilantro — the cooler face slows summer bolting." },
      { name: "Base (moist)", note: "Chives, lemon balm — and mint in a sunken pot at the very bottom." },
    ],
    layout: [
      "Mark a 5–6 ft circle; spiral drystack stone or brick rising to about 3 ft at the center.",
      "Fill with soil as you build — lean and gritty up top, richer compost mix at the base.",
      "Face the spiral's opening north so the ramp itself shades the moisture-lovers.",
      "Water from the top; the spiral shares it downhill.",
    ],
    oremTiming: "Build any time the ground isn't frozen; plant late April. Perfect one-Saturday project with the rock from any Utah yard.",
  },
  {
    key: "shade",
    name: "Shade garden greens",
    tagline: "Salad all summer where the sun doesn't scorch",
    heroPlant: "Lettuce",
    why:
      "Orem's July sun bolts lettuce in days — but the north side of the house or greenhouse grows sweet, tender greens straight through the heat.",
    plants: [
      { name: "Lettuce (looseleaf)", note: "Succession-sow every 2 weeks in the shade bed all summer — no bolting, no bitterness." },
      { name: "Spinach & arugula", note: "Spring and fall stars; the shade stretches their season a month each way." },
      { name: "Mizuna & Asian greens", note: "Cut-and-come-again texture for stir-fries; handle part shade beautifully." },
      { name: "Sorrel", note: "Perennial lemon-bright leaves — one plant, decades of soup." },
      { name: "Alpine strawberries", note: "The shade-tolerant groundcover that pays rent in fruit." },
    ],
    layout: [
      "Claim the bed on the north side of the house, greenhouse, or fence — 3–4 hours of morning sun is plenty.",
      "Rich soil + steady drip: shade greens grow slower, so give them no other excuse.",
      "Sow short rows every two weeks instead of one big planting.",
    ],
    oremTiming: "First sowing mid-April; in summer this is the ONLY bed where lettuce holds. Last sowing early September for an October salad run.",
  },
];
