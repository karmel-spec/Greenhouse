// Pest Management Database for Greenhouse
// Utah Zone 6a/6b context: High heat (spider mites), dry air (powdery mildew), alkaline water (fungal issues)

export interface Pest {
  id: string;
  name: string;
  emoji: string;
  severity: number; // 1-5 scale
  identification: string[];
  damageSymptoms: string[];
  affectedPlants: string[];
  naturalTreatments: TreatmentOption[];
  chemicalTreatments: TreatmentOption[];
  prevention: string[];
  utahNotes: string;
  treatmentTimeline: string;
  safeForEdibles: boolean;
}

export interface TreatmentOption {
  name: string;
  description: string;
  frequency: string;
  costLevel: "free" | "low" | "medium" | "high";
  effectiveness: number; // 1-5 scale
  difficulty: number; // 1-5 scale (1=easy, 5=hard)
}

export const pestDatabase: Pest[] = [
  {
    id: "spider-mites",
    name: "Spider Mites",
    emoji: "🕷️",
    severity: 5,
    identification: [
      "Tiny red, yellow, or brown dots (barely visible without magnifying glass)",
      "Fine webbing on undersides of leaves",
      "White 'specks' or dust-like debris on leaves",
      "Most active in hot, dry conditions (above 90°F)",
    ],
    damageSymptoms: [
      "Yellow stippling on leaves (tiny holes from feeding)",
      "Leaves turn bronze or gray",
      "Premature leaf drop",
      "Weakened plant growth",
      "Web-covered buds",
    ],
    affectedPlants: [
      "eve-0032", // Pothos (stressed)
      "eve-0037", // Heartleaf philodendron
      "eve-0008", // Pink florist kalanchoe
      "eve-0034", // Yellow begonia
      "eve-0036", // Spider plant
      "Tomatoes",
      "Cucumbers",
      "Peppers",
      "Beans",
    ],
    naturalTreatments: [
      {
        name: "Strong Water Spray",
        description:
          "Spray plants with forceful water stream, focus on leaf undersides. Knocks mites off plant. Repeat every 2-3 days.",
        frequency: "Every 2-3 days for 2-3 weeks",
        costLevel: "free",
        effectiveness: 2,
        difficulty: 1,
      },
      {
        name: "Neem Oil",
        description:
          "Apply diluted neem oil (follow label). Disrupts mite lifecycle. Works best in early morning or evening (not hot sun).",
        frequency: "Every 5-7 days for 3-4 weeks",
        costLevel: "low",
        effectiveness: 4,
        difficulty: 2,
      },
      {
        name: "Insecticidal Soap",
        description:
          "Spray with horticultural soap. Coats mites and disrupts respiration. Repeat every 3-5 days.",
        frequency: "Every 3-5 days for 2-3 weeks",
        costLevel: "low",
        effectiveness: 3,
        difficulty: 2,
      },
      {
        name: "Increased Humidity & Ventilation",
        description:
          "Mites HATE humidity. Mist foliage daily, run fans, keep humidity above 60%. Also keeps them from returning.",
        frequency: "Daily for ongoing prevention",
        costLevel: "free",
        effectiveness: 3,
        difficulty: 1,
      },
    ],
    chemicalTreatments: [
      {
        name: "Miticide (Sulfur Dust or Spray)",
        description:
          "Kills all life stages of mites. Follow label directions exactly. Do NOT use if temps above 85°F or on sulfur-sensitive plants.",
        frequency: "Every 7-10 days x 2-3 applications",
        costLevel: "medium",
        effectiveness: 5,
        difficulty: 2,
      },
      {
        name: "Spinosad",
        description:
          "Organic pesticide. Targets mites and other soft-bodied insects. Safe for most edibles (check label). Effective but slower.",
        frequency: "Every 7 days x 3-4 applications",
        costLevel: "medium",
        effectiveness: 3,
        difficulty: 2,
      },
    ],
    prevention: [
      "Keep greenhouse below 90°F (spider mites love heat)",
      "Increase humidity (mites hate 60%+ humidity)",
      "Run fans for air circulation",
      "Inspect new plants before bringing to greenhouse",
      "Quarantine infested plants immediately",
      "Remove heavily infested leaves",
      "Clean greenhouse in fall (mites overwinter on debris)",
    ],
    utahNotes:
      "CRITICAL in Utah summer: 110°F+ greenhouses are SPIDER MITE HEAVEN. Shade cloth + ventilation to cool below 90°F is essential. High desert air is naturally dry, which favors mites. Use daily misting + fans as prevention.",
    treatmentTimeline: "2-3 weeks to see clear improvement. Full recovery: 4-6 weeks.",
    safeForEdibles: true,
  },

  {
    id: "aphids",
    name: "Aphids",
    emoji: "🐛",
    severity: 3,
    identification: [
      "Small (1-3mm) soft-bodied insects, green, black, yellow, or white",
      "Often clustered on new growth and shoot tips",
      "Sticky residue on leaves (honeydew = mold grows on it)",
      "Ants attending the colony (protecting them for honeydew)",
    ],
    damageSymptoms: [
      "Curled, distorted new leaves",
      "Yellowing and wilting",
      "Stunted growth",
      "Sticky residue (attracts mold, sooty mold)",
      "Plant weakness, poor flowering",
    ],
    affectedPlants: [
      "eve-0038", // Shasta daisy
      "eve-0023", // Bee balm
      "eve-0022", // Garden phlox
      "Basil",
      "Cucumbers",
      "Beans",
      "Roses",
      "Asters",
    ],
    naturalTreatments: [
      {
        name: "Water Spray",
        description:
          "Strong spray of water dislodges aphids. Repeat every 2 days.",
        frequency: "Every 2 days for 1-2 weeks",
        costLevel: "free",
        effectiveness: 2,
        difficulty: 1,
      },
      {
        name: "Neem Oil",
        description:
          "Disrupts feeding and reproduction. Apply in early morning or evening.",
        frequency: "Every 5-7 days x 2-3 applications",
        costLevel: "low",
        effectiveness: 4,
        difficulty: 2,
      },
      {
        name: "Insecticidal Soap",
        description:
          "Kills soft-bodied aphids on contact. Must coat insects directly. Repeat every 3-5 days.",
        frequency: "Every 3-5 days x 2-3 applications",
        costLevel: "low",
        effectiveness: 4,
        difficulty: 2,
      },
      {
        name: "Encourage Beneficial Insects",
        description:
          "Ladybugs, lacewings, parasitic wasps eat aphids. Plant flowers to attract them. Natural long-term control.",
        frequency: "Ongoing (plant alyssum, yarrow, dill)",
        costLevel: "low",
        effectiveness: 3,
        difficulty: 1,
      },
    ],
    chemicalTreatments: [
      {
        name: "Permethrin Spray",
        description:
          "Broad-spectrum insecticide. Effective but kills beneficials too. Use only when other methods fail.",
        frequency: "Every 7-10 days x 2 applications",
        costLevel: "medium",
        effectiveness: 5,
        difficulty: 2,
      },
    ],
    prevention: [
      "Remove infested shoots (pinch off) early",
      "Plant alyssum, yarrow, dill to attract predators",
      "Avoid excessive nitrogen (makes plants soft and tasty to aphids)",
      "Strong plants are more resistant",
      "Inspect plants regularly, especially new growth",
    ],
    utahNotes:
      "Aphids are a spring problem in Utah outdoor gardens. In greenhouse, can occur year-round if temps stay above 60°F. Use neem oil early to prevent populations.",
    treatmentTimeline: "1-2 weeks to control. Can be rapid if caught early.",
    safeForEdibles: true,
  },

  {
    id: "mealybugs",
    name: "Mealybugs",
    emoji: "🤍",
    severity: 4,
    identification: [
      "White, cottony, powdery-looking clusters on stems and leaf joints",
      "Small insects under the white coating (looks like tiny rice grains)",
      "Sticky residue (honeydew)",
      "Most common on tropical houseplants",
    ],
    damageSymptoms: [
      "Yellowing leaves",
      "Leaf drop",
      "Sticky residue on nearby surfaces",
      "Mold growth on sticky residue",
      "Stunted growth",
      "Plant weakness",
    ],
    affectedPlants: [
      "eve-0012", // Pink Chinese evergreen
      "eve-0013", // Dieffenbachia
      "eve-0004", // Lemon Lime dracaena
      "eve-0021", // Croton
      "eve-0025", // Ponytail palm
      "Ferns",
      "Begonias",
      "African violets",
    ],
    naturalTreatments: [
      {
        name: "Isopropyl Alcohol (70%)",
        description:
          "Dab directly on white clusters with cotton swab. Kills mealybugs on contact. Repeat every 3-5 days.",
        frequency: "Every 3-5 days x 3-4 applications",
        costLevel: "free",
        effectiveness: 4,
        difficulty: 2,
      },
      {
        name: "Neem Oil",
        description:
          "Apply thoroughly to all affected areas, especially leaf joints. Repeat every 5-7 days.",
        frequency: "Every 5-7 days x 3-4 applications",
        costLevel: "low",
        effectiveness: 3,
        difficulty: 2,
      },
      {
        name: "Horticultural Oil Spray",
        description:
          "Suffocates mealybugs. Apply in early morning or evening. May need 2-3 applications.",
        frequency: "Every 7-10 days x 2-3 applications",
        costLevel: "low",
        effectiveness: 4,
        difficulty: 2,
      },
    ],
    chemicalTreatments: [
      {
        name: "Systemic Insecticide (Imidacloprid)",
        description:
          "Moves through plant sap, kills insects feeding on plant. Effective for persistent infestations.",
        frequency: "Apply once, repeat if needed after 2 weeks",
        costLevel: "medium",
        effectiveness: 5,
        difficulty: 1,
      },
    ],
    prevention: [
      "Inspect new plants before bringing to greenhouse",
      "Isolate infected plants immediately",
      "Check leaf joints and stem crevices regularly",
      "Avoid overwatering (mealybugs like moist conditions)",
      "Increase air circulation",
      "Don't let plants touch other plants",
    ],
    utahNotes:
      "Less common outdoors in Utah. Greenhouse problem primarily on tropical houseplants. Keep humidity moderate (not too high).",
    treatmentTimeline:
      "2-3 weeks to control. Mealybugs are persistent; multiple treatments needed.",
    safeForEdibles: true,
  },

  {
    id: "scale-insects",
    name: "Scale Insects",
    emoji: "🟤",
    severity: 4,
    identification: [
      "Small, hard bumps on stems and leaves (look like tiny shells or scales)",
      "May be brown, tan, gray, or white",
      "Don't move (unlike other insects) — stuck in place",
      "Sticky residue (honeydew) present",
      "Often unnoticed until severe damage",
    ],
    damageSymptoms: [
      "Yellow leaves with brown patches",
      "Leaf drop",
      "Sticky residue and mold",
      "Weakened plant, slow growth",
      "Visible decline in health",
    ],
    affectedPlants: [
      "eve-0020", // Snake plant
      "eve-0025", // Ponytail palm
      "eve-0040", // Bay/laurel shrub
      "eve-0039", // Japanese maple
      "Ivy",
      "Gardenias",
      "Camellias",
    ],
    naturalTreatments: [
      {
        name: "Horticultural Oil Spray",
        description:
          "Suffocates scale insects. Most effective on crawler stage (young, mobile scales). Apply early morning or evening.",
        frequency: "Every 7-10 days x 3-4 applications (repeat each generation)",
        costLevel: "low",
        effectiveness: 4,
        difficulty: 2,
      },
      {
        name: "Neem Oil",
        description:
          "Works on young crawlers. Less effective on adult (hardened) scales. Repeat frequently.",
        frequency: "Every 5-7 days x 4-5 applications",
        costLevel: "low",
        effectiveness: 2,
        difficulty: 2,
      },
      {
        name: "Manual Removal",
        description:
          "Scrape off visible scales with a plastic scraper or old credit card. Labor-intensive but effective for light infestations.",
        frequency: "Weekly inspection and removal",
        costLevel: "free",
        effectiveness: 3,
        difficulty: 2,
      },
    ],
    chemicalTreatments: [
      {
        name: "Systemic Insecticide (Imidacloprid)",
        description:
          "Enters plant, poisons sap. Works on all life stages. Effective but slow-acting.",
        frequency: "Apply once, may repeat after 2-3 weeks",
        costLevel: "medium",
        effectiveness: 5,
        difficulty: 1,
      },
    ],
    prevention: [
      "Inspect plants carefully at purchase",
      "Quarantine new plants",
      "Monitor regularly (easy to miss)",
      "Remove heavily infested stems",
      "Avoid over-fertilizing (soft growth attracts scales)",
      "Keep plants healthy and strong",
    ],
    utahNotes:
      "Scale overwinters outdoors in Utah. Greenhouse-grown plants less likely to get it. Watch outdoor shrubs (Japanese maple, ivy).",
    treatmentTimeline:
      "3-4 weeks minimum, often 2-3 months. Scale has multiple generations; need to treat multiple times.",
    safeForEdibles: true,
  },

  {
    id: "whiteflies",
    name: "Whiteflies",
    emoji: "🤍",
    severity: 3,
    identification: [
      "Tiny (1-2mm) white flying insects",
      "Look like small flying bits of paper or dandruff",
      "Flutter around when plant is disturbed",
      "Yellow eggs on undersides of leaves",
      "Nymphs are transparent, immobile, on leaf undersides",
    ],
    damageSymptoms: [
      "Yellow, wilted leaves",
      "Leaf drop",
      "Sticky residue (honeydew) on leaves and nearby surfaces",
      "Sooty mold grows on sticky residue",
      "Stunted growth",
      "Visible swarms of insects when plant is shaken",
    ],
    affectedPlants: [
      "eve-0024", // Fittonia
      "eve-0009", // Oyster plant
      "eve-0012", // Pink Chinese evergreen
      "Basil",
      "Tomatoes",
      "Cucumbers",
      "Squash",
      "Sweet potato",
    ],
    naturalTreatments: [
      {
        name: "Yellow Sticky Traps",
        description:
          "Hang yellow sticky cards near affected plants. Catches flying adults. Replace every 2-3 weeks.",
        frequency: "Hang continuously during infestation",
        costLevel: "low",
        effectiveness: 2,
        difficulty: 1,
      },
      {
        name: "Water Spray + Insecticidal Soap",
        description:
          "Spray forcefully to dislodge nymphs. Follow with soap spray. Repeat every 3-5 days.",
        frequency: "Every 3-5 days x 2-3 weeks",
        costLevel: "low",
        effectiveness: 3,
        difficulty: 2,
      },
      {
        name: "Neem Oil",
        description:
          "Effective on nymphs and eggs. Apply to leaf undersides thoroughly. Repeat every 5-7 days.",
        frequency: "Every 5-7 days x 3-4 applications",
        costLevel: "low",
        effectiveness: 4,
        difficulty: 2,
      },
    ],
    chemicalTreatments: [
      {
        name: "Permethrin Spray",
        description:
          "Kills adults and nymphs. Effective but kills beneficial insects. Use as last resort.",
        frequency: "Every 7 days x 2-3 applications",
        costLevel: "medium",
        effectiveness: 5,
        difficulty: 2,
      },
    ],
    prevention: [
      "Use yellow sticky traps for early detection",
      "Keep greenhouse well-ventilated (whiteflies like calm, warm conditions)",
      "Avoid overwatering (attracts whiteflies)",
      "Inspect new plants carefully",
      "Quarantine infested plants immediately",
      "Spray water regularly (whiteflies don't like water)",
    ],
    utahNotes:
      "More of a problem in warm, humid greenhouses. Utah's dry air helps prevent them.",
    treatmentTimeline:
      "2-3 weeks to control populations. Multiple life stages require repeated treatments.",
    safeForEdibles: true,
  },

  {
    id: "fungus-gnats",
    name: "Fungus Gnats",
    emoji: "🪰",
    severity: 2,
    identification: [
      "Tiny (1-3mm) black or dark gray flying insects",
      "Weak fliers, seen around soil surface and plant base",
      "White, thread-like larvae in soil (barely visible)",
      "Larvae wiggle when soil disturbed",
      "More of a nuisance than plant damage",
    ],
    damageSymptoms: [
      "Minimal direct plant damage (larvae feed on roots slightly)",
      "May weaken seedlings or very young plants",
      "Psychological annoyance (flying around)",
      "Fungus gnats indicate consistently wet soil",
    ],
    affectedPlants: [
      "eve-0024", // Fittonia
      "eve-0026", // Green Fantasy fern
      "eve-0043", // African Blue basil
      "Seedlings",
      "Herbs",
      "Houseplants",
    ],
    naturalTreatments: [
      {
        name: "Let Soil Dry Out",
        description:
          "Gnats breed in moist soil. Let top 1-2 inches dry between waterings. Most effective long-term solution.",
        frequency: "Adjust watering permanently",
        costLevel: "free",
        effectiveness: 5,
        difficulty: 1,
      },
      {
        name: "Yellow Sticky Traps",
        description:
          "Catch flying adults. Use around pots and on soil surface. Replace when full.",
        frequency: "Hang continuously, replace weekly",
        costLevel: "low",
        effectiveness: 3,
        difficulty: 1,
      },
      {
        name: "Watering with Hydrogen Peroxide",
        description:
          "Mix 1 part 3% hydrogen peroxide with 4 parts water. Water plants with it. Kills larvae in soil.",
        frequency: "Once every 3-5 days x 3-4 times",
        costLevel: "low",
        effectiveness: 4,
        difficulty: 1,
      },
      {
        name: "Neem Soil Soak",
        description:
          "Dilute neem oil and water plants with mixture. Kills larvae. Repeat every 5-7 days.",
        frequency: "Every 5-7 days x 2-3 times",
        costLevel: "low",
        effectiveness: 3,
        difficulty: 1,
      },
    ],
    chemicalTreatments: [
      {
        name: "Insecticidal Drench (Imidacloprid)",
        description:
          "Pour systemic insecticide into soil. Kills larvae and poisons adults. Effective but harsh.",
        frequency: "Apply once, may repeat after 1-2 weeks",
        costLevel: "medium",
        effectiveness: 5,
        difficulty: 1,
      },
    ],
    prevention: [
      "Don't overwater (most important!)",
      "Improve soil drainage (add perlite or coco coir)",
      "Water only when top 1 inch of soil is dry",
      "Remove saucers or drain water promptly",
      "Use fresh potting soil (not old soil with gnat larvae)",
      "Keep greenhouse clean (remove dead plant material)",
    ],
    utahNotes:
      "Less of a problem in Utah's dry climate. Usually appears in greenhouse with high humidity.",
    treatmentTimeline:
      "1-2 weeks if soil dries out. Gnats breed quickly; control is about drying soil.",
    safeForEdibles: true,
  },

  {
    id: "thrips",
    name: "Thrips",
    emoji: "⚫",
    severity: 3,
    identification: [
      "Tiny (1-2mm) thin insects, yellow, brown, or black",
      "Quickly move away when disturbed (fast runners)",
      "Prefer flowers and new growth",
      "Cause silvery streaks/trails on leaves",
      "Difficult to see without magnification",
    ],
    damageSymptoms: [
      "Silver or tan streaks on leaves and petals",
      "Distorted flowers and fruit (may be stippled or silvered)",
      "Yellowing leaves",
      "Deformed new growth",
      "Black fecal spots (thrip droppings)",
    ],
    affectedPlants: [
      "eve-0038", // Shasta daisy
      "eve-0046", // Bellflower
      "eve-0022", // Garden phlox
      "eve-0044", // Annual vinca
      "Roses",
      "Tomatoes",
      "Peppers",
      "Onions",
    ],
    naturalTreatments: [
      {
        name: "Blue Sticky Traps",
        description:
          "Thrips attracted to blue. Hang traps to monitor and catch adults. Replace weekly.",
        frequency: "Hang continuously, replace weekly",
        costLevel: "low",
        effectiveness: 2,
        difficulty: 1,
      },
      {
        name: "Neem Oil",
        description:
          "Apply to all plant parts including flowers. Thrips hide in flowers, so spray thoroughly.",
        frequency: "Every 5-7 days x 3-4 applications",
        costLevel: "low",
        effectiveness: 3,
        difficulty: 2,
      },
      {
        name: "Spinosad",
        description:
          "Organic insecticide effective on thrips. Must coat all plant parts. Repeat every 7 days.",
        frequency: "Every 7 days x 2-3 applications",
        costLevel: "medium",
        effectiveness: 4,
        difficulty: 2,
      },
    ],
    chemicalTreatments: [
      {
        name: "Imidacloprid Spray",
        description:
          "Systemic insecticide. Works well on thrips. Apply to all plant parts including flowers.",
        frequency: "Every 7-10 days x 2-3 applications",
        costLevel: "medium",
        effectiveness: 5,
        difficulty: 2,
      },
    ],
    prevention: [
      "Remove infested flowers and new growth (prune off)",
      "Improve air circulation (thrips don't like air movement)",
      "Avoid excessive nitrogen (soft growth attracts thrips)",
      "Monitor regularly with blue sticky traps",
      "Isolate infested plants",
      "Disinfect tools between plants",
    ],
    utahNotes:
      "Thrips are a Utah problem, especially on outdoor flowers in summer. Less common in cool greenhouses.",
    treatmentTimeline:
      "2-3 weeks to control. Thrips have multiple generations; persistent treatment needed.",
    safeForEdibles: true,
  },

  {
    id: "powdery-mildew",
    name: "Powdery Mildew",
    emoji: "🤍",
    severity: 3,
    identification: [
      "White, powdery coating on leaves, stems, and buds",
      "Looks like someone dusted plant with flour",
      "Coating easily rubs off",
      "Usually starts on lower leaves",
      "More common in fall and in dry conditions",
    ],
    damageSymptoms: [
      "Leaf distortion and curling",
      "Yellowing and browning",
      "Leaves appear weak and pale",
      "Buds may not open",
      "Overall plant weakness",
      "Reduced flowering",
    ],
    affectedPlants: [
      "eve-0022", // Garden phlox
      "eve-0023", // Bee balm
      "eve-0024", // Fittonia
      "Roses",
      "Peas",
      "Beans",
      "Squash",
      "Cucumbers",
      "Asters",
    ],
    naturalTreatments: [
      {
        name: "Baking Soda Spray",
        description:
          "Mix 1 tbsp baking soda + 1 tbsp horticultural oil + 1 gallon water. Spray weekly. Very safe.",
        frequency: "Weekly until gone, then every 10-14 days for prevention",
        costLevel: "free",
        effectiveness: 2,
        difficulty: 1,
      },
      {
        name: "Sulfur Dust/Spray",
        description:
          "Kills mildew spores. Do NOT use if temps above 85°F (phytotoxic). Apply in early morning or evening.",
        frequency: "Every 7-10 days x 2-3 applications",
        costLevel: "low",
        effectiveness: 4,
        difficulty: 2,
      },
      {
        name: "Neem Oil",
        description:
          "Works preventatively and curatively. Apply in early morning or evening (not in heat).",
        frequency: "Every 5-7 days x 3-4 applications",
        costLevel: "low",
        effectiveness: 3,
        difficulty: 2,
      },
      {
        name: "Milk Spray",
        description:
          "Spray 1 part milk to 9 parts water weekly. Organic and safe. May be less effective but works for prevention.",
        frequency: "Weekly",
        costLevel: "free",
        effectiveness: 2,
        difficulty: 1,
      },
    ],
    chemicalTreatments: [
      {
        name: "Fungicide (Triazole or Sulfur)",
        description:
          "Professional fungicides. Follow label exactly. Do not use sulfur above 85°F.",
        frequency: "Every 7-10 days x 2-3 applications",
        costLevel: "medium",
        effectiveness: 5,
        difficulty: 2,
      },
    ],
    prevention: [
      "Improve air circulation (fans, spacing)",
      "Remove lower leaves to increase airflow",
      "Water at soil level, not overhead",
      "Avoid evening watering (leaves stay wet overnight)",
      "Don't crowd plants",
      "Remove heavily infected leaves",
      "Keep humidity moderate (not too high, not too low)",
    ],
    utahNotes:
      "Utah's dry air helps prevent powdery mildew outdoors, but it's common in greenhouses (high humidity + poor airflow). Focus on ventilation!",
    treatmentTimeline:
      "1-2 weeks to see improvement. Prevention is easier than cure.",
    safeForEdibles: true,
  },

  {
    id: "root-rot",
    name: "Root Rot & Damping Off",
    emoji: "🪱",
    severity: 4,
    identification: [
      "Roots black, mushy, or slimy (vs. white and firm when healthy)",
      "Foul smell from soil",
      "Plant wilts despite wet soil",
      "Seedlings topple over at soil line (damping off)",
      "No visible insects",
    ],
    damageSymptoms: [
      "Wilting despite adequate water",
      "Yellowing leaves starting from bottom",
      "Leaf drop",
      "Stunted growth",
      "Plant collapse (sudden, especially in seedlings)",
      "No recovery with normal care",
    ],
    affectedPlants: [
      "eve-0024", // Fittonia
      "eve-0025", // Ponytail palm
      "eve-0043", // African Blue basil
      "Seedlings",
      "Succulents (if overwatered)",
      "Ferns",
      "Orchids",
    ],
    naturalTreatments: [
      {
        name: "Repot in Fresh Soil",
        description:
          "Remove plant from pot, trim away black/mushy roots with sterile knife. Repot in fresh, dry potting soil. This is CRITICAL.",
        frequency: "Do this immediately when suspected",
        costLevel: "low",
        effectiveness: 5,
        difficulty: 2,
      },
      {
        name: "Improve Drainage",
        description:
          "Add perlite or coco coir (50/50 mix). Ensure pots have drainage holes. Reduce watering frequency.",
        frequency: "Ongoing (preventative)",
        costLevel: "low",
        effectiveness: 5,
        difficulty: 1,
      },
      {
        name: "Chamomile or Cinnamon Tea",
        description:
          "Antifungal properties. Steep chamomile or cinnamon, cool, use to water soil. Research suggests efficacy.",
        frequency: "Once at repotting, then water with regular water",
        costLevel: "free",
        effectiveness: 1,
        difficulty: 1,
      },
    ],
    chemicalTreatments: [
      {
        name: "Fungicide Drench",
        description:
          "Fungicides like captan or benomyl. Water soil (not leaves). Follow label exactly.",
        frequency: "As directed on label, usually 1-2 applications",
        costLevel: "medium",
        effectiveness: 3,
        difficulty: 2,
      },
    ],
    prevention: [
      "Use well-draining potting soil (never garden soil)",
      "Ensure pots have drainage holes",
      "Don't overwater (let soil dry slightly between waterings)",
      "Water at soil level, not overhead",
      "Use sterile pots and soil for seedlings",
      "Provide air circulation",
      "Empty saucers promptly",
      "Remove fallen leaves from soil surface",
    ],
    utahNotes:
      "Less common in Utah's dry air, but happens in overwatered pots. Best solution is better drainage + less water.",
    treatmentTimeline:
      "If caught early: repotting may save plant (50/50 chance). If advanced: plant loss likely.",
    safeForEdibles: true,
  },

  {
    id: "slugs-snails",
    name: "Slugs & Snails",
    emoji: "🐌",
    severity: 2,
    identification: [
      "Visible slimy trails on soil or leaves",
      "Slugs (no shell) or snails (with shell)",
      "Most active at night and in wet conditions",
      "Holes in leaves with smooth, clean edges (vs. ragged edges from insects)",
      "Visible on plants at dusk",
    ],
    damageSymptoms: [
      "Large, ragged holes in leaves and stems",
      "Seedlings completely eaten overnight",
      "Slimy trails on plants and soil",
      "Damage to vegetables (lettuce, basil, etc.)",
      "Young growth targeted preferentially",
    ],
    affectedPlants: [
      "eve-0014", // Variegated hosta
      "eve-0015", // Irish moss
      "eve-0001", // Creeping vinca
      "Lettuce",
      "Basil",
      "Beans",
      "Peas",
      "Seedlings",
    ],
    naturalTreatments: [
      {
        name: "Handpicking",
        description:
          "Search for slugs/snails at night with a flashlight. Drop into soapy water bucket. Most effective for light infestations.",
        frequency: "3-4 times per week in evening/night",
        costLevel: "free",
        effectiveness: 3,
        difficulty: 1,
      },
      {
        name: "Beer Traps",
        description:
          "Bury shallow container level with soil, fill with beer. Slugs crawl in and drown. Charming and effective!",
        frequency: "Set up, check daily, replace beer every 2-3 days",
        costLevel: "low",
        effectiveness: 3,
        difficulty: 1,
      },
      {
        name: "Diatomaceous Earth (Food-Grade)",
        description:
          "Sprinkle around plants. Sharp edges cut slug exoskeletons. Reapply after rain. Safe for pets/humans.",
        frequency: "Weekly or after rain",
        costLevel: "low",
        effectiveness: 3,
        difficulty: 1,
      },
      {
        name: "Copper Tape/Mesh",
        description:
          "Slugs hate copper. Wrap around pots or create barriers. Reusable and long-lasting.",
        frequency: "Permanent barrier",
        costLevel: "low",
        effectiveness: 4,
        difficulty: 1,
      },
    ],
    chemicalTreatments: [
      {
        name: "Slug Pellets (Metaldehyde)",
        description:
          "Poison pellets. Effective but toxic to pets. Use only in pet-free areas. Follow label carefully.",
        frequency: "Scatter around plants as directed",
        costLevel: "low",
        effectiveness: 5,
        difficulty: 1,
      },
    ],
    prevention: [
      "Remove hiding spots (boards, dense mulch, dead leaves)",
      "Reduce watering frequency (slugs love moist conditions)",
      "Water in morning, not evening (allows plants to dry)",
      "Keep greenhouse dry and well-ventilated",
      "Remove debris piles near gardens",
      "Avoid dense mulch (2 inches max)",
      "Create barriers (copper, eggshells, gravel)",
    ],
    utahNotes:
      "Less of a problem in Utah's dry climate. Mainly an issue in shady, moist areas or overly watered pots.",
    treatmentTimeline:
      "Handpicking: 1-2 weeks with nightly searches. Traps: ongoing reduction over weeks.",
    safeForEdibles: true,
  },
];

export function getPestById(id: string): Pest | undefined {
  return pestDatabase.find((pest) => pest.id === id);
}

export function getPestsByPlant(plantId: string): Pest[] {
  return pestDatabase.filter((pest) =>
    pest.affectedPlants.includes(plantId)
  );
}

export function getPestsBySeverity(minSeverity: number): Pest[] {
  return pestDatabase.filter((pest) => pest.severity >= minSeverity);
}
