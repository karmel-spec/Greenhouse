/**
 * Climate playbook for Karmel's 7.8 × 6.7 ft cedar-and-polycarbonate
 * greenhouse in Orem, Utah — high desert zone 6b, where winter nights sink
 * to 20°F and July afternoons roast at 95–110°F. Season-by-season targets,
 * the cooling (and heating) toolkit, and two break-glass emergency plans.
 */

export type SeasonalTarget = {
  season: string;
  /** Display label, e.g. "Dec–Feb" */
  months: string;
  /** Calendar months (1–12) this row covers — used to match "today" */
  monthNumbers: number[];
  /** Typical outside temps in Orem for the stretch */
  outsideF: string;
  /** What you're aiming for inside the greenhouse */
  targetF: string;
  tactics: string[];
};

export const SEASONAL_TARGETS: SeasonalTarget[] = [
  {
    season: "Winter",
    months: "Dec–Feb",
    monthNumbers: [12, 1, 2],
    outsideF: "20–35",
    targetF: "50–65 inside",
    tactics: [
      "Heat mat running under anything tender",
      "Infrared heater on a thermostat (wishlist) carries the cold nights",
    ],
  },
  {
    season: "Early Spring",
    months: "Mar–Apr",
    monthNumbers: [3, 4],
    outsideF: "35–55",
    targetF: "60–70 day / 55–60 night",
    tactics: [
      "Crack the roof vent on sunny mornings so it doesn't spike",
      "Keep the heat mat going for seedlings",
    ],
  },
  {
    season: "Late Spring",
    months: "May",
    monthNumbers: [5],
    outsideF: "55–75",
    targetF: "65–75 day / 60–65 night",
    tactics: [
      "Ventilation does most of the work — roof vent plus louvered floor vent",
      "Throw partial shade on any day pushing past 80°F",
    ],
  },
  {
    season: "Early Summer",
    months: "Jun",
    monthNumbers: [6],
    outsideF: "75–90",
    targetF: "70–80 day / 60–70 night",
    tactics: [
      "Deploy 30–50% shade cloth",
      "Fans moving air all day",
      "Misting through the hot afternoons",
    ],
  },
  {
    season: "Peak Summer",
    months: "Jul–Aug",
    monthNumbers: [7, 8],
    outsideF: "95–110",
    targetF: "75–85 day — the fight is keeping it BELOW",
    tactics: [
      "Step up to 50–70% shade cloth",
      "Heavy misting during peak heat",
      "Fans ON, vents wide open, all day",
    ],
  },
  {
    season: "Fall",
    months: "Sep–Oct",
    monthNumbers: [9, 10],
    outsideF: "75–55",
    targetF: "65–75 day / 55–65 night",
    tactics: [
      "Reduce shade gradually as the sun softens",
      "Vent by day, close up before evening",
    ],
  },
  {
    season: "Early Winter",
    months: "Nov",
    monthNumbers: [11],
    outsideF: "35–50",
    targetF: "55–65 minimum",
    tactics: [
      "Heat mat back in service",
      "Heater on standby for the first hard freezes",
    ],
  },
];

export type CoolingStrategy = {
  name: string;
  emoji: string;
  effect: string;
  details: string[];
};

export const COOLING_STRATEGIES: CoolingStrategy[] = [
  {
    name: "Shade cloth",
    emoji: "⛱️",
    effect: "Drops inside temps 10–20°F before anything else has to work",
    details: [
      "Comes in 30%, 50%, and 70% densities — match it to the season",
      "Deploy around June 1, take it down around September 1",
      "Mounting it outside the polycarbonate works best — block the heat before it gets in",
    ],
  },
  {
    name: "Ventilation",
    emoji: "🌬️",
    effect: "Your first line of defense — moving air is free cooling",
    details: [
      "Automatic vent openers trigger around 75°F, no electricity needed",
      "Rule of thumb: one exhaust fan per 300 sq ft (your greenhouse needs just one)",
      "Spring and fall: vent by day, close at night. Summer: continuous",
    ],
  },
  {
    name: "Misting",
    emoji: "💧",
    effect: "Evaporative cooling knocks off 8–15°F in Utah's dry air",
    details: [
      "Run it during peak hours, roughly 11am–4pm",
      "Stop by evening — wet leaves overnight invite fungus",
    ],
  },
  {
    name: "Solar fan kit",
    emoji: "☀️",
    effect: "Passive heat removal that runs hardest exactly when the sun does",
    details: [
      "25W panel driving three IP67-rated fans",
      "No wiring to the house — the sun powers its own fix",
      "On the wishlist",
    ],
  },
  {
    name: "Infrared heater",
    emoji: "🔥",
    effect: "The winter side of the coin — steady radiant warmth through 20°F nights",
    details: [
      "Thermostat control so it only runs when the greenhouse actually needs it",
      "Pairs beautifully with a nighttime thermal blanket over the benches",
      "On the wishlist",
    ],
  },
];

export type EmergencyPlaybook = {
  key: "heatwave" | "frost";
  title: string;
  trigger: string;
  immediate: string[];
  next: string[];
  overnight: string[];
};

export const EMERGENCY_PLAYBOOKS: EmergencyPlaybook[] = [
  {
    key: "heatwave",
    title: "Heatwave protocol",
    trigger: "Forecast hits 100°F or higher",
    immediate: [
      "70% shade cloth on, right now",
      "Every fan to maximum",
      "Mist every 20 minutes through the peak",
      "Open everything — roof vent, floor louvers, the door",
    ],
    next: [
      "Move heat-sensitive pots to the shadiest corner",
      "Drape wet burlap over delicate plants",
      "Stop fertilizing until the heat breaks — stressed plants can't use it",
    ],
    overnight: [
      "Leave the vents open",
      "Keep the fans running",
      "Deep-water everything at the roots before sunset",
    ],
  },
  {
    key: "frost",
    title: "Frost protocol",
    trigger: "Forecast dips below 40°F",
    immediate: [
      "Close the vents before sunset to trap the day's warmth",
      "Cover delicate plants",
      "Pull tender houseplants away from the walls — that's where the cold bites first",
    ],
    next: [
      "Insulate with burlap or frost cloth",
      "Lean newspaper tents over low seedlings",
      "Set out wet towels — water holds heat 2–3°C better than dry fabric",
    ],
    overnight: [
      "Water everything thoroughly before the frost arrives — moist soil banks the day's heat and releases it slowly all night",
    ],
  },
];

export const SENSOR_NOTE =
  "Your Govee thermometer inside the greenhouse reports through the Mac's Bluetooth bridge, so the dashboard's \"right now\" numbers are the same ones these targets are judged against.";
