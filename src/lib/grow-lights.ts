/**
 * Grow Lights — reference data for Karmel's multi-spectrum LED panel.
 * Three modes (Vegetative, Fruiting, Full Spectrum) plus the abundant
 * natural sun of Orem's high desert. Distances, photoperiods, and timer
 * recipes tuned for zone 6b and a greenhouse that never lacks daylight
 * from May through September.
 */

export type GrowLightModeKey = "vegetative" | "fruiting" | "full-spectrum";
export type LightIntensity = "low" | "medium" | "high";

export interface SpectrumMix {
  bluePct: number;
  redPct: number;
  warmWhitePct: number;
}

export interface GrowLightMode {
  key: GrowLightModeKey;
  name: string;
  emoji: string;
  spectrum: SpectrumMix;
  description: string;
  bestFor: string[];
  dailyHours: string;
  utahNote: string;
}

export interface DistanceRange {
  min: number;
  max: number;
}

export interface StageGuidance {
  stage: string;
  distanceInches: DistanceRange;
  intensity: LightIntensity;
  mode: GrowLightModeKey;
  hours: string;
  note: string;
}

export interface PlantLightGuide {
  plantType: string;
  stages: StageGuidance[];
}

export interface SeasonalPhotoperiod {
  season: string;
  naturalHours: string;
  recommendation: string;
  schedule: {
    onTime: string;
    offTime: string;
  };
}

export interface LightDecision {
  situation: string;
  useNatural: boolean;
  why: string;
}

export interface TimerRecipe {
  name: string;
  mode: GrowLightModeKey;
  onTime: string;
  offTime: string;
  totalHours: number;
  steps: string[];
}

export const GROW_LIGHT_MODES: GrowLightMode[] = [
  {
    key: "vegetative",
    name: "Vegetative",
    emoji: "🌿",
    spectrum: { bluePct: 55, redPct: 20, warmWhitePct: 25 },
    description:
      "Blue light tells your plants to stay stocky and pour their energy into chlorophyll and leaves — it's the wavelength that keeps seedlings compact instead of leggy.",
    bestFor: ["Seedlings", "Lettuce & greens", "Herbs", "Microgreens", "Transplants finding their feet"],
    dailyHours: "14-16 hours",
    utahNote:
      "Your go-to from January through April, when Orem's sun is still low and your seedlings are racing toward a May 15 transplant date.",
  },
  {
    key: "fruiting",
    name: "Fruiting",
    emoji: "🍅",
    spectrum: { bluePct: 15, redPct: 60, warmWhitePct: 25 },
    description:
      "Red light nudges the flowering hormones awake — it mimics the long, warm light of late summer and tells tomatoes, peppers, and strawberries it's time to bloom and set fruit.",
    bestFor: ["Tomatoes in flower", "Peppers", "Strawberries", "Overwintered fruiting plants", "African violets in bud"],
    dailyHours: "12 hours",
    utahNote:
      "Most useful in fall and winter, when you're coaxing greenhouse tomatoes past October 1 and the natural red light of summer is long gone.",
  },
  {
    key: "full-spectrum",
    name: "Full Spectrum",
    emoji: "🌈",
    spectrum: { bluePct: 33, redPct: 34, warmWhitePct: 33 },
    description:
      "A balanced blend that behaves like gentle sunshine — enough blue for sturdy leaves, enough red to keep flowers coming, and warm white to fill in everything between.",
    bestFor: ["Houseplants", "Succulents", "Mixed benches", "Anything you're unsure about", "Winter greenhouse ambiance"],
    dailyHours: "14 hours",
    utahNote:
      "The safe default for your mixed greenhouse benches — when one light covers seedlings, succulents, and a geranium all at once, full spectrum keeps everyone happy.",
  },
];

export const DISTANCE_CHART: PlantLightGuide[] = [
  {
    plantType: "Seedlings (general)",
    stages: [
      {
        stage: "Just sprouted",
        distanceInches: { min: 4, max: 6 },
        intensity: "medium",
        mode: "vegetative",
        hours: "14-16",
        note: "Close and blue keeps them stocky — legginess means the light is too far away.",
      },
      {
        stage: "First true leaves",
        distanceInches: { min: 6, max: 10 },
        intensity: "medium",
        mode: "vegetative",
        hours: "14-16",
        note: "Raise the light as they grow; keep a hand-width of space so leaves never touch the panel.",
      },
      {
        stage: "Hardening off",
        distanceInches: { min: 10, max: 14 },
        intensity: "low",
        mode: "full-spectrum",
        hours: "12",
        note: "Ease back the hours as you start carrying trays outside — real Orem sun takes over from here.",
      },
    ],
  },
  {
    plantType: "Lettuce & leafy greens",
    stages: [
      {
        stage: "Seedling",
        distanceInches: { min: 4, max: 6 },
        intensity: "medium",
        mode: "vegetative",
        hours: "14",
        note: "Lettuce loves blue light — it stays crisp and compact instead of stretching.",
      },
      {
        stage: "Growing heads",
        distanceInches: { min: 8, max: 12 },
        intensity: "medium",
        mode: "vegetative",
        hours: "12-14",
        note: "Too much heat or light makes lettuce bitter — back off if leaf edges look stressed.",
      },
    ],
  },
  {
    plantType: "Spinach",
    stages: [
      {
        stage: "Seedling",
        distanceInches: { min: 4, max: 6 },
        intensity: "medium",
        mode: "vegetative",
        hours: "12-14",
        note: "Spinach is a cool customer — moderate light and cool nights keep it sweet.",
      },
      {
        stage: "Leaf production",
        distanceInches: { min: 8, max: 12 },
        intensity: "medium",
        mode: "vegetative",
        hours: "12",
        note: "Long days push spinach to bolt — cap the hours at 12 and it will keep making leaves.",
      },
    ],
  },
  {
    plantType: "Basil",
    stages: [
      {
        stage: "Seedling",
        distanceInches: { min: 4, max: 6 },
        intensity: "medium",
        mode: "vegetative",
        hours: "14-16",
        note: "Basil is a sun-lover from the start — generous light means fragrant, dark-green leaves.",
      },
      {
        stage: "Bushy & pinched",
        distanceInches: { min: 8, max: 12 },
        intensity: "high",
        mode: "vegetative",
        hours: "14-16",
        note: "Pinch the tops and keep the light strong — you'll get a bush instead of a stalk.",
      },
    ],
  },
  {
    plantType: "Culinary herbs (thyme, oregano, rosemary)",
    stages: [
      {
        stage: "Seedling",
        distanceInches: { min: 4, max: 6 },
        intensity: "medium",
        mode: "vegetative",
        hours: "14",
        note: "Mediterranean herbs germinate slowly — steady light and patience win.",
      },
      {
        stage: "Established",
        distanceInches: { min: 8, max: 14 },
        intensity: "medium",
        mode: "full-spectrum",
        hours: "12-14",
        note: "These herbs actually taste better with a little stress — lean light, lean water, big flavor.",
      },
    ],
  },
  {
    plantType: "Tomatoes",
    stages: [
      {
        stage: "Seedling",
        distanceInches: { min: 4, max: 6 },
        intensity: "high",
        mode: "vegetative",
        hours: "14-16",
        note: "Tomato seedlings stretch fast under weak light — keep the panel close and blue.",
      },
      {
        stage: "Vegetative growth",
        distanceInches: { min: 8, max: 12 },
        intensity: "high",
        mode: "vegetative",
        hours: "14-16",
        note: "Brush your hand over them daily — the movement plus strong light builds thick stems.",
      },
      {
        stage: "Flowering & fruiting",
        distanceInches: { min: 12, max: 18 },
        intensity: "high",
        mode: "fruiting",
        hours: "12",
        note: "Switch to red-heavy light and 12-hour days to tell your tomatoes it's fruit time.",
      },
    ],
  },
  {
    plantType: "Peppers",
    stages: [
      {
        stage: "Seedling",
        distanceInches: { min: 4, max: 6 },
        intensity: "high",
        mode: "vegetative",
        hours: "14-16",
        note: "Peppers are slow starters — warm roots and close light get them moving.",
      },
      {
        stage: "Vegetative growth",
        distanceInches: { min: 8, max: 12 },
        intensity: "high",
        mode: "vegetative",
        hours: "14",
        note: "Peppers love the same warmth Orem summers deliver — indoors, the light does that work.",
      },
      {
        stage: "Flowering & fruiting",
        distanceInches: { min: 12, max: 18 },
        intensity: "high",
        mode: "fruiting",
        hours: "12",
        note: "Red light plus slightly cooler nights helps peppers set fruit instead of dropping blossoms.",
      },
    ],
  },
  {
    plantType: "Cucumbers",
    stages: [
      {
        stage: "Seedling",
        distanceInches: { min: 5, max: 7 },
        intensity: "medium",
        mode: "vegetative",
        hours: "14",
        note: "Cucumber seedlings grow fast — check the distance every couple of days.",
      },
      {
        stage: "Vining & flowering",
        distanceInches: { min: 12, max: 18 },
        intensity: "high",
        mode: "fruiting",
        hours: "12-14",
        note: "Once vines run and flowers open, give them room and red — they'll reward you quickly.",
      },
    ],
  },
  {
    plantType: "Microgreens",
    stages: [
      {
        stage: "Germination (blackout)",
        distanceInches: { min: 6, max: 8 },
        intensity: "low",
        mode: "vegetative",
        hours: "0 (covered)",
        note: "Keep trays covered and dark for the first 3-4 days — roots first, greens second.",
      },
      {
        stage: "Greening up",
        distanceInches: { min: 4, max: 6 },
        intensity: "medium",
        mode: "vegetative",
        hours: "12-16",
        note: "Uncover and light them up — they'll green and be scissors-ready in under a week.",
      },
    ],
  },
  {
    plantType: "Succulents",
    stages: [
      {
        stage: "Established",
        distanceInches: { min: 6, max: 10 },
        intensity: "high",
        mode: "full-spectrum",
        hours: "12-14",
        note: "Succulents can take the light close and long — pale, stretched growth means they want more.",
      },
      {
        stage: "Propagating leaves & pups",
        distanceInches: { min: 10, max: 14 },
        intensity: "medium",
        mode: "full-spectrum",
        hours: "10-12",
        note: "Babies are tender — a little gentler until roots take hold, then move them up front.",
      },
    ],
  },
  {
    plantType: "Houseplants (foliage)",
    stages: [
      {
        stage: "Maintenance",
        distanceInches: { min: 12, max: 24 },
        intensity: "low",
        mode: "full-spectrum",
        hours: "10-12",
        note: "Most foliage plants just want steady, gentle light — think bright window, not summer sun.",
      },
      {
        stage: "Active growth push",
        distanceInches: { min: 10, max: 16 },
        intensity: "medium",
        mode: "full-spectrum",
        hours: "12-14",
        note: "Want a growth spurt in winter? Move them closer and add a couple of hours.",
      },
    ],
  },
  {
    plantType: "African violet",
    stages: [
      {
        stage: "Foliage growth",
        distanceInches: { min: 12, max: 15 },
        intensity: "medium",
        mode: "full-spectrum",
        hours: "12",
        note: "Violets sunburn easily — never closer than a foot, and rotate the pot weekly.",
      },
      {
        stage: "Coaxing blooms",
        distanceInches: { min: 12, max: 15 },
        intensity: "medium",
        mode: "fruiting",
        hours: "12-14",
        note: "A shift toward red light is often the nudge a stubborn violet needs to set buds.",
      },
    ],
  },
  {
    plantType: "Geraniums",
    stages: [
      {
        stage: "Overwintering",
        distanceInches: { min: 12, max: 16 },
        intensity: "medium",
        mode: "full-spectrum",
        hours: "10-12",
        note: "Just enough light to hold them over — they're resting, not racing, until spring.",
      },
      {
        stage: "Spring wake-up & bloom",
        distanceInches: { min: 10, max: 14 },
        intensity: "high",
        mode: "fruiting",
        hours: "12-14",
        note: "In March, step up the light and they'll be blooming by the time frost danger passes.",
      },
    ],
  },
  {
    plantType: "Strawberries",
    stages: [
      {
        stage: "Runners & establishment",
        distanceInches: { min: 8, max: 12 },
        intensity: "medium",
        mode: "vegetative",
        hours: "14",
        note: "New plants want to build crowns and roots first — blue light helps them settle in.",
      },
      {
        stage: "Flowering & fruiting",
        distanceInches: { min: 10, max: 14 },
        intensity: "high",
        mode: "fruiting",
        hours: "12",
        note: "Red light and 12-hour days mean greenhouse berries even while snow sits on Timpanogos.",
      },
    ],
  },
  {
    plantType: "Watermelon seedlings",
    stages: [
      {
        stage: "Just sprouted",
        distanceInches: { min: 5, max: 7 },
        intensity: "high",
        mode: "vegetative",
        hours: "14-16",
        note: "Melons hate transplant shock — strong light now builds seedlings tough enough for the move.",
      },
      {
        stage: "Pre-transplant",
        distanceInches: { min: 8, max: 12 },
        intensity: "high",
        mode: "full-spectrum",
        hours: "14",
        note: "Start hardening them off in mid-May — they go out only after soil is truly warm.",
      },
    ],
  },
  {
    plantType: "Pumpkin & squash seedlings",
    stages: [
      {
        stage: "Just sprouted",
        distanceInches: { min: 5, max: 8 },
        intensity: "high",
        mode: "vegetative",
        hours: "14",
        note: "These grow fast and big — start seeds only 3-4 weeks before your May 15 frost date.",
      },
      {
        stage: "Pre-transplant",
        distanceInches: { min: 10, max: 14 },
        intensity: "medium",
        mode: "full-spectrum",
        hours: "12-14",
        note: "Big leaves shade their neighbors — give squash trays their own corner under the panel.",
      },
    ],
  },
  {
    plantType: "Green beans",
    stages: [
      {
        stage: "Seedling",
        distanceInches: { min: 5, max: 7 },
        intensity: "medium",
        mode: "vegetative",
        hours: "14",
        note: "Beans mostly prefer direct sowing outside — start indoors only for an extra-early greenhouse crop.",
      },
      {
        stage: "Flowering & pods",
        distanceInches: { min: 12, max: 16 },
        intensity: "high",
        mode: "fruiting",
        hours: "12",
        note: "Keep days near 12 hours once flowers show — beans set pods best without marathon light.",
      },
    ],
  },
];

export const SEASONAL_PHOTOPERIOD: SeasonalPhotoperiod[] = [
  {
    season: "Spring (Mar-May)",
    naturalHours: "12 climbing to 15 hours",
    recommendation:
      "Lights are optional insurance. Run them in the mornings for seedling trays, then lean on the strengthening sun — by May the greenhouse gets everything it needs for free.",
    schedule: { onTime: "06:00", offTime: "10:00" },
  },
  {
    season: "Summer (Jun-Aug)",
    naturalHours: "14.5-15 hours",
    recommendation:
      "Lights off, shade cloth on. Orem's high-desert sun is more than any bulb can offer — your job in summer is protecting plants from too much light, not adding more.",
    schedule: { onTime: "—", offTime: "—" },
  },
  {
    season: "Fall (Sep-Nov)",
    naturalHours: "14 dropping fast to 9 hours",
    recommendation:
      "The days shorten quickly after Labor Day. Bring the lights back from mid-September to keep greenhouse tomatoes and greens producing past the October 1 frost.",
    schedule: { onTime: "06:30", offTime: "19:30" },
  },
  {
    season: "Winter (Dec-Feb)",
    naturalHours: "9-10.5 hours",
    recommendation:
      "Lights are essential now. Supplement to 14-16 total hours for anything actively growing — winter is when your LED panel earns its keep.",
    schedule: { onTime: "06:00", offTime: "20:00" },
  },
];

export const LIGHT_DECISION_GUIDE: LightDecision[] = [
  {
    situation: "Summer leafy greens",
    useNatural: true,
    why: "The desert sun is plenty — shade cloth matters far more than a light in July.",
  },
  {
    situation: "Winter seedlings",
    useNatural: false,
    why: "Nine-hour days won't grow sturdy starts — give them 14-16 hours under the vegetative mode.",
  },
  {
    situation: "Cloudy week in spring",
    useNatural: false,
    why: "Supplement 4-6 morning hours so seedlings don't stall or stretch waiting for the sun to return.",
  },
  {
    situation: "Tomatoes in June",
    useNatural: true,
    why: "Fifteen hours of real sun beats any panel — save the electricity for fall.",
  },
  {
    situation: "Greenhouse tomatoes after mid-September",
    useNatural: false,
    why: "Days are collapsing toward frost — fruiting mode at 12 hours keeps the harvest coming.",
  },
  {
    situation: "Succulents on a winter windowsill",
    useNatural: false,
    why: "Low winter sun makes them stretch and fade — a few close hours of full spectrum keeps them tight and colorful.",
  },
  {
    situation: "Hardening off in early May",
    useNatural: true,
    why: "Real sun and real breeze are the whole point — the lights have done their part.",
  },
  {
    situation: "Microgreens any time of year",
    useNatural: false,
    why: "Consistent trays come from consistent light — the panel gives you the same crop in January as in June.",
  },
];

export const TIMER_SETUP: TimerRecipe[] = [
  {
    name: "Timer 1 — Vegetative bank",
    mode: "vegetative",
    onTime: "06:00",
    offTime: "20:00",
    totalHours: 14,
    steps: [
      "Plug the vegetative-mode light into Timer 1 and set ON at 6:00 AM, OFF at 8:00 PM — 14 honest hours.",
      "Set the panel to Vegetative mode once; the timer handles the daily rhythm from here.",
      "Check the trays each morning — if seedlings lean or stretch, lower the light before adding hours.",
    ],
  },
  {
    name: "Timer 2 — Fruiting bank",
    mode: "fruiting",
    onTime: "07:00",
    offTime: "19:00",
    totalHours: 12,
    steps: [
      "Plug the fruiting-mode light into Timer 2 and set ON at 7:00 AM, OFF at 7:00 PM — a crisp 12 hours.",
      "Keep this bank's nights truly dark; flowering plants count the dark hours as carefully as the bright ones.",
    ],
  },
];
