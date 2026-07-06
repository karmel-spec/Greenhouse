/**
 * Beginner lesson library — short, real, task-connected lessons written for
 * Karmel's high-desert Utah garden and greenhouse.
 */

export type Lesson = {
  id: string;
  title: string;
  tagline: string;
  minutes: number;
  steps: { heading: string; body: string }[];
  tip: string;
};

export const lessons: Lesson[] = [
  {
    id: "transplant-seedlings",
    title: "How to transplant seedlings",
    tagline: "Gentle steps for roots, timing, and aftercare.",
    minutes: 4,
    steps: [
      { heading: "Wait for true leaves", body: "Transplant once a seedling has 2–3 'true' leaves (the ones that look like the adult plant, not the first rounded pair). Earlier than that, roots are too fragile." },
      { heading: "Water an hour before", body: "Moist soil holds the root ball together and slides out of the cell cleanly. Never transplant bone-dry seedlings." },
      { heading: "Handle by the leaves, never the stem", body: "A torn leaf grows back; a crushed stem is fatal. Loosen the cell from the bottom and lift by a leaf with the soil ball attached." },
      { heading: "Plant at the same depth", body: "Set the seedling into a pre-made hole at the depth it grew before. (Exception: tomatoes love being buried deeper — they root along the stem.)" },
      { heading: "Firm, water, and shade", body: "Press soil gently around it, water immediately to settle air pockets, and keep it out of harsh afternoon sun for 2–3 days while it re-roots." },
    ],
    tip: "In Orem's dry air, transplant in the evening so seedlings get a cool, dark recovery night before their first full day.",
  },
  {
    id: "watering-basics",
    title: "Watering the high-desert way",
    tagline: "Deep, infrequent, and always checked by finger first.",
    minutes: 3,
    steps: [
      { heading: "Check before you water", body: "Push a finger a knuckle deep into the soil. Damp? Wait. Dry? Water. More plants die of kindness (overwatering) than drought." },
      { heading: "Water deep, not often", body: "A long soak that reaches the whole root zone beats a daily sprinkle. Shallow watering trains shallow, fragile roots." },
      { heading: "Morning is best", body: "Watering before the heat means less evaporation and dry leaves by night — which prevents most fungal disease." },
      { heading: "Water the soil, not the leaves", body: "Aim at the base. Wet foliage in sun can scorch, and wet foliage at night invites mildew." },
      { heading: "Know your pots", body: "Containers and greenhouse trays dry out far faster than beds — in July heat they may genuinely need daily checks." },
    ],
    tip: "Utah's clay soil sheds water at first. Water in two short passes a few minutes apart and the second pass soaks in beautifully.",
  },
  {
    id: "seed-starting",
    title: "Starting seeds indoors",
    tagline: "From packet to sprout without the guesswork.",
    minutes: 4,
    steps: [
      { heading: "Use seed-starting mix, not garden soil", body: "It's fine-textured, sterile, and drains well. Garden soil compacts and can carry damping-off fungus that kills sprouts." },
      { heading: "Plant at 2–3× the seed's width", body: "Tiny seeds (lettuce, chamomile) barely covered or surface-sown; big seeds (beans, squash) an inch deep. The packet always tells you." },
      { heading: "Keep evenly moist and warm", body: "Cover trays with a dome or plastic wrap until sprouting. Most vegetables germinate fastest at 65–75°F — the greenhouse shelf is perfect." },
      { heading: "Give light immediately at sprout", body: "The moment green appears, remove the cover and give strong light, or you'll get pale, leggy stretchers." },
      { heading: "Feed lightly after true leaves", body: "Seed-starting mix has no food. Half-strength liquid feed every week or two once true leaves show." },
    ],
    tip: "Label every cell the day you sow. Every gardener who skips this becomes a mystery-plant farmer by May.",
  },
  {
    id: "cuttings-101",
    title: "Propagation by cuttings",
    tagline: "Turn one plant into ten, free.",
    minutes: 4,
    steps: [
      { heading: "Pick healthy, non-flowering growth", body: "Cut 3–4 inches of fresh growth just below a node (the bump where leaves attach). Flowering stems put energy into blooms, not roots." },
      { heading: "Strip the lower leaves", body: "Leaves below the water or soil line rot. Keep just the top pair or two to power rooting." },
      { heading: "Water or soil, know which", body: "Soft herbs (basil, mint) root happily in a jar of water. Woody herbs (lavender, rosemary) do better in barely-moist perlite mix with rooting hormone." },
      { heading: "Keep humid and bright, not sunny", body: "Bright indirect light and high humidity (a loose plastic tent works) keep cuttings alive while they grow roots." },
      { heading: "Tug-test, then pot up", body: "After 2–4 weeks, a gentle tug that meets resistance means roots. Pot up into real soil and treat like a seedling for a week." },
    ],
    tip: "Check the Propagation tab — it already lists which of your plants are ready for cuttings right now, with per-plant steps.",
  },
  {
    id: "microgreens-first-tray",
    title: "Your first microgreens tray",
    tagline: "Salad in ten days, start to harvest.",
    minutes: 3,
    steps: [
      { heading: "Fill a shallow tray with an inch of mix", body: "Level it flat. Drainage holes plus a second solid tray underneath makes bottom-watering easy." },
      { heading: "Sow thick, press, don't bury", body: "Microgreen seeds go far denser than garden sowing — a near-solid layer. Press them into contact with the soil; most don't need covering." },
      { heading: "Blackout for 2–3 days", body: "Cover with an upside-down tray. Darkness plus a daily misting makes them stretch evenly and root down." },
      { heading: "Uncover into bright light", body: "They'll be yellow and tangled — one day of light turns the whole tray green. Water from the bottom from now on." },
      { heading: "Harvest with scissors at 2–4 inches", body: "Cut just above the soil when the first true leaves are starting. Rinse, spin dry, refrigerate — use within a week." },
    ],
    tip: "Track each tray in the Microgreens Studio — it counts the days and tells you when harvest week arrives.",
  },
  {
    id: "harvest-drying-herbs",
    title: "Harvesting & drying herbs",
    tagline: "Capture the oils; keep the medicine.",
    minutes: 3,
    steps: [
      { heading: "Cut mid-morning after dew dries", body: "Essential oils peak after the dew burns off but before afternoon heat. That's the flavor and the medicine." },
      { heading: "Cut above a leaf pair", body: "Take up to a third of the plant, always cutting just above a set of leaves so it regrows bushier." },
      { heading: "Bundle small, hang upside down", body: "Pencil-thick bundles rubber-banded and hung in a warm, dark, airy spot. Big bundles molder in the middle." },
      { heading: "Dry until crisp — about 1–2 weeks", body: "Leaves should crumble, stems should snap. In Utah's dry air this goes fast; check at one week." },
      { heading: "Strip and store whole", body: "Strip leaves into airtight jars, kept dark. Crumble only when you use them — whole leaves hold flavor twice as long." },
    ],
    tip: "Label jars with the herb AND the month. Dried herbs are best within a year; the jar from 2022 is compost.",
  },
  {
    id: "soil-compost-basics",
    title: "Soil & compost basics",
    tagline: "Feed the soil and the soil feeds everything.",
    minutes: 4,
    steps: [
      { heading: "Know what you have", body: "Utah Valley soil is usually alkaline clay: rich in minerals, terrible at drainage. Squeeze a moist handful — if it ribbons like dough, it's clay." },
      { heading: "Compost fixes clay", body: "Two inches of compost worked into the top of a bed each season loosens clay, feeds microbes, and holds moisture through hot weeks." },
      { heading: "Browns + greens = compost", body: "Roughly 2–3 parts dry 'browns' (leaves, straw, cardboard) to 1 part fresh 'greens' (kitchen scraps, grass). Keep it as damp as a wrung-out sponge." },
      { heading: "Turn it, or wait longer", body: "Turned weekly, a hot pile finishes in about 2 months. Never turned, it still becomes compost — it just takes a year." },
      { heading: "Skip the no-nos", body: "No meat, dairy, oils, diseased plants, or weeds gone to seed. Everything else from the garden and kitchen is fair game." },
    ],
    tip: "Coffee grounds are a free 'green' — most coffee shops happily hand over a bucket, and they help acidify alkaline Utah soil a touch.",
  },
  {
    id: "pest-prevention",
    title: "Pest prevention, gently",
    tagline: "See problems early; fix them without the spray aisle.",
    minutes: 3,
    steps: [
      { heading: "Walk the garden with your coffee", body: "Five minutes of daily looking — under leaves especially — catches every outbreak while it's still ten bugs, not ten thousand." },
      { heading: "Blast aphids with water", body: "A hard hose spray knocks aphids off; most never climb back. Repeat for a few mornings and ladybugs finish the job." },
      { heading: "Healthy plants shrug off pests", body: "Stressed plants send chemical invitations to insects. Right water, right light, and airflow prevent more problems than any spray." },
      { heading: "Invite the helpers", body: "Yarrow, dill, calendula, and alyssum feed the ladybugs, lacewings, and tiny wasps that eat your pests for free." },
      { heading: "Escalate slowly", body: "If you must treat: insecticidal soap first, neem oil second, always at dusk so bees are home. Photograph the pest and ask Eve to identify it first." },
    ],
    tip: "Snap a photo of any chewed or curling leaf into the Photo Journal — Eve's diagnosis will tell you if it's pests, water, or sun.",
  },
];

export const squareFootLesson: Lesson = {
  id: "square-foot-basics",
  title: "How to build a square foot garden",
  tagline: "Mel Bartholomew's method: more harvest, less work, no rows.",
  minutes: 5,
  steps: [
    { heading: "Build a 4×4 box", body: "A 4-foot-by-4-foot bed, 6+ inches deep, is the sweet spot — you can reach the center from any side without stepping on the soil. Frame it with untreated lumber. In Utah, raised beds warm up faster in spring and drain our clay." },
    { heading: "Fill with Mel's Mix, not garden dirt", body: "The classic recipe is 1/3 compost (blend several kinds), 1/3 peat or coco coir, 1/3 coarse vermiculite. It's light, holds moisture in our dry air, and never compacts — so roots and water move freely." },
    { heading: "Grid it into 16 squares", body: "Lay a physical grid (lath strips, string) across the top to make sixteen 1×1-foot squares. The grid isn't decoration — it's what keeps you planting the right density instead of over-sowing." },
    { heading: "Plant by square, not by row", body: "Each square holds a different crop at its own spacing: 1 tomato, 4 lettuce, 9 spinach, or 16 carrots/radishes per square. Big plants get 1; tiny ones get 16. No thinning, almost no wasted seed." },
    { heading: "Go vertical and put tall plants north", body: "Trellis tomatoes, cucumbers, beans, and peas up the NORTH side so they don't shade shorter squares. Vertical growing is what makes a tiny bed absurdly productive." },
    { heading: "Succession-plant every square", body: "The moment a square is harvested, replant it. A radish square (25 days) can become lettuce, then bush beans, in one season. In Orem, cool crops go spring and again from an August sowing; warm crops fill the summer." },
  ],
  tip: "Companion planting supercharges the grid: basil and marigold next to tomatoes, onions away from beans, dill near cabbage. The planner below flags these for you as you drag plants in.",
};

export function lessonOfTheDay(date: Date): Lesson {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86_400_000);
  return lessons[dayOfYear % lessons.length];
}
