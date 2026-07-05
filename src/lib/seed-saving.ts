/**
 * Seed-saving know-how by crop family: when the seed is ready on the plant,
 * how to collect and dry it, and anything special (fermentation, biennials,
 * cross-pollination). Packet-specific fields override these when present.
 */

export type SeedSavingGuide = {
  collect: string;
  process: string;
  note?: string;
};

const GUIDES: { match: RegExp; guide: SeedSavingGuide }[] = [
  {
    match: /tomato/i,
    guide: {
      collect: "Let a few of your best fruits get dead-ripe on the vine — softer and deeper-colored than you'd ever eat.",
      process:
        "Squeeze seeds and gel into a jar with a splash of water and ferment 2–3 days until a film forms, stirring daily. The fermentation dissolves the sprout-blocking gel. Rinse in a sieve, then dry on a labeled paper plate for 1–2 weeks.",
      note: "Tomatoes self-pollinate, so even one plant gives true seed from an heirloom.",
    },
  },
  {
    match: /cucumber/i,
    guide: {
      collect: "Leave a fruit on the vine weeks past eating stage until it turns fat, yellow-orange, and the vine dies back.",
      process:
        "Scoop the seed pulp, ferment it in water 2–3 days like tomatoes, rinse the good seeds (they sink), and dry 1–2 weeks.",
      note: "Cucumbers cross with other cucumbers — save from one variety at a time or bag blossoms.",
    },
  },
  {
    match: /melon|watermelon/i,
    guide: {
      collect: "Harvest seeds when the melon is perfectly ripe for eating — the seeds are ready when the fruit is.",
      process: "Rinse seeds free of pulp in a colander, float off the duds, and dry on a plate for 2 weeks, stirring daily.",
      note: "Melons cross readily with other melons flowering at the same time.",
    },
  },
  {
    match: /squash|pumpkin/i,
    guide: {
      collect: "Let the fruit cure well past eating ripeness — hard rind, dull stem — then 3 more weeks indoors before opening.",
      process: "Scoop, rinse pulp off in a colander, keep the plump seeds that sink, and dry 2–3 weeks until they snap, not bend.",
      note: "All squash of the same species cross with each other — expect surprises unless you hand-pollinate.",
    },
  },
  {
    match: /pepper/i,
    guide: {
      collect: "Let a fruit ripen fully to its final color (red/orange/yellow) on the plant — green peppers have immature seed.",
      process: "Scrape seeds onto a plate, no washing needed, and dry 1–2 weeks. Wear gloves for hot varieties.",
      note: "Peppers mostly self-pollinate; separate hot and sweet varieties to keep sweet ones sweet.",
    },
  },
  {
    match: /bean|pea|lentil/i,
    guide: {
      collect: "Leave pods on the plant until they turn brown, papery, and rattle when shaken — usually 4–6 weeks past eating stage.",
      process: "Shell the pods, then spread seeds to dry indoors 2 more weeks. Done when a seed shatters instead of dents under a hammer or tooth.",
      note: "Self-pollinating and beginner-perfect — this is the easiest seed you'll ever save.",
    },
  },
  {
    match: /lettuce/i,
    guide: {
      collect: "Let a plant bolt into a flower stalk; each little flower turns into a dandelion-like puff about 2–3 weeks after blooming.",
      process: "Shake or rub the fluffy heads into a paper bag every few days, then winnow the chaff and dry a week more.",
      note: "Self-pollinating; one bolted plant yields thousands of seeds.",
    },
  },
  {
    match: /spinach/i,
    guide: {
      collect: "Let spring plants bolt; seeds cluster tight along the stalk and are ready when the stalk browns.",
      process: "Strip the dry stalks into a bucket wearing gloves (some varieties are prickly), winnow, and dry another week.",
    },
  },
  {
    match: /broccoli|kale|cabbage|collard|brussels|kohlrabi/i,
    guide: {
      collect: "These are biennials: they flower the SECOND year. Overwinter the plant (mulch heavily in Utah, or a cold greenhouse), and in year two let the yellow flowers become slim pods that dry tan on the plant.",
      process: "Pick the dry pods into a bag, crush, and winnow out the small round seeds. Dry a week more before jarring.",
      note: "All brassicas cross with each other — only one variety can flower at a time for true seed.",
    },
  },
  {
    match: /radish|mustard|turnip/i,
    guide: {
      collect: "Let a few plants bolt past eating stage; slim seed pods follow the flowers and are ready when tan and brittle.",
      process: "Strip dry pods into a bag, crush, winnow, and dry the seed a week more.",
      note: "Radish and mustard will seed the same season they're sown — no overwintering needed.",
    },
  },
  {
    match: /carrot|parsnip/i,
    guide: {
      collect: "Biennial: leave your best roots in the ground under thick mulch (or replant stored roots in spring). In year two, lacy white flower umbels form seed heads.",
      process: "Cut the umbels when brown, dry a week in a paper bag, then rub the seeds free and winnow.",
      note: "Carrots cross with wild Queen Anne's lace — snip any you see flowering nearby.",
    },
  },
  {
    match: /beet|chard/i,
    guide: {
      collect: "Biennial: overwinter the root under mulch, and in year two tall stalks carry knobby seed clusters that turn brown and corky.",
      process: "Strip the dry clusters off the stalk — each 'seed' is a capsule holding several true seeds. Dry a week and store as-is.",
      note: "Beets and chard are the same species and cross freely; save from one at a time.",
    },
  },
  {
    match: /onion|leek/i,
    guide: {
      collect: "Biennial: replant your best bulbs in spring; each sends up a globe flower that sets shiny black seed.",
      process: "Bag the heads as they dry, shake seeds free, and dry a week more. Onion seed is short-lived — use within 1–2 years.",
    },
  },
  {
    match: /corn/i,
    guide: {
      collect: "Leave the best ears on the stalk 4–6 weeks past eating stage, until husks are papery and kernels dent-hard.",
      process: "Finish drying ears indoors 2 more weeks, then twist kernels off the cob and dry until they crack, not mash.",
      note: "Corn crosses on the wind from far away; neighbors' corn will mix with yours.",
    },
  },
  {
    match: /okra/i,
    guide: {
      collect: "Let a few pods grow far past eating size until they're brown, ridged, and starting to split.",
      process: "Twist the pods open over a bowl, dry the round seeds for a week, and jar.",
    },
  },
  {
    match: /poppy|chamomile|calendula|amaranth|coriander|fennel|dill/i,
    guide: {
      collect: "Let flower heads mature and dry right on the plant until they rattle (poppy) or turn brown and brittle.",
      process: "Bend heads into a paper bag and shake, or snip whole heads and dry a week before shaking out the seed. Winnow the chaff.",
      note: "These self-sow enthusiastically — collect before the heads shatter or the garden decides for you.",
    },
  },
  {
    match: /asparagus/i,
    guide: {
      collect: "Female plants set red berries in fall; pick when fully red and starting to shrivel.",
      process: "Squash the berries in water, rinse the black seeds clean, and dry 2 weeks.",
      note: "Asparagus from seed takes 3 years to harvest — crowns are faster, but seed is free.",
    },
  },
  {
    match: /almond/i,
    guide: {
      collect: "The seed is the nut: harvest when hulls split and the shells inside are dry, then finish drying in the shell.",
      process: "Store in-shell nuts cool and dry; crack and plant in fall — almonds need winter cold to sprout.",
    },
  },
  {
    match: /celery|chicory/i,
    guide: {
      collect: "Biennial: overwinter the plant, and in year two collect the tiny seeds from dried flower umbels.",
      process: "Rub the dry heads between your palms over a bowl, winnow, and dry a week more.",
    },
  },
];

const DEFAULT_GUIDE: SeedSavingGuide = {
  collect: "Let your healthiest plant mature completely — seeds are ready when their pods, heads, or fruit are fully ripe and starting to dry on the plant.",
  process: "Collect on a dry afternoon, clean away pulp or chaff, and dry seeds on a labeled paper plate for 1–2 weeks until hard and brittle.",
};

export function seedSavingGuide(commonName: string): SeedSavingGuide {
  return GUIDES.find((entry) => entry.match.test(commonName))?.guide ?? DEFAULT_GUIDE;
}

export const STORAGE_DEFAULT =
  "Airtight jar in a cool, dark, dry place (below 50% humidity; 32–50°F is ideal — a fridge works with a good seal). Label with variety and year.";
