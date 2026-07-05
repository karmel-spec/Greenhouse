/**
 * Seed Vault Database - Initial Records
 * Karmel's Five Starter Seeds from Survival Essentials
 */

import { SeedPacket } from "./seed-vault-types";

export const seedVaultDatabase: SeedPacket[] = [
  {
    id: "seed-pumpkin-mammoth-gold",
    commonName: "Pumpkin",
    botanicalName: "Cucurbita pepo",
    variety: "Mammoth Gold",
    
    seedCount: 25,
    germinationRate: 89,
    packagedDate: "2020-01-01", // Estimated from "Packaged for 2020"
    storageLocation: "Cool storage - basement",
    
    isHeirloom: true,
    isAnnual: true,
    source: "Survival Essentials",
    sourceUrl: "https://www.survivalessentials.com",
    
    daysToMaturity: 100,
    daysToGermination: 10,
    startIndoors: false, // Direct sow in warm soil
    lightRequirement: "full-sun",
    waterNeeds: "moderate",
    soilType: "Rich, well-draining loam with compost",
    soilPh: { min: 6.0, max: 7.0 },
    spacingInches: 48, // 4 feet between plants
    fertilizer: "Balanced fertilizer when vines appear; reduce nitrogen later",
    
    utahPlantingWindows: {
      spring: { start: "05-15", end: "06-15" }, // Plant after last frost
      summer: { start: "06-01", end: "06-30" },
    },
    frostHardiness: "frost-sensitive",
    utahZone: "6a",
    utahSpecificNotes: "Plant in late May after soil warms (70°F+). Mulch heavily to retain moisture in Utah's dry air. Can struggle with spider mites in greenhouse—ensure good air circulation.",
    
    seedPacketPhoto: "/seed-vault/pumpkin-mammoth-gold-packet.jpg",
    seedCloseupPhoto: "/seed-vault/pumpkin-mammoth-gold-seeds.jpg",
    seedlingPhoto: "/seed-vault/pumpkin-seedling.jpg",
    maturePlantPhoto: "/seed-vault/pumpkin-mature.jpg",
    harvestedProductPhoto: "/seed-vault/pumpkin-harvested.jpg",
    
    harvestTiming: "Skin hardens and turns deep orange; can't pierce with fingernail",
    harvestSeason: "September-October",
    yieldPerPlant: "1-3 large pumpkins per plant",
    
    canSaveSeed: true,
    seedSavingInstructions: "Allow one or two pumpkins to fully mature on vine. Harvest, scoop seeds, rinse, and dry on screen for 2-3 weeks in cool, well-ventilated area. Store in cool, dry location.",
    seedMaturityIndicators: "Pumpkins fully colored and hardened",
    dryingMethod: "Air dry on screens, 2-3 weeks",
    seedStorageMethod: "cool-dry",
    estimatedShelfLife: 4,
    seedStorageTemperature: { min: 40, max: 50 },
    seedStorageHumidity: "Below 50%",
    
    cookingMethods: ["roast", "steam", "puree", "bake"],
    preservationMethods: ["freeze", "can", "dehydrate"],
    recipeLinks: [
      { title: "Pumpkin Pie", url: "https://www.bettycrocker.com/recipes/classic-pumpkin-pie/84b8e64a-cb20-4f0c-9e89-82a74c83bcc9" },
      { title: "Roasted Pumpkin Seeds", url: "#" },
      { title: "Pumpkin Soup", url: "#" },
    ],
    flavorProfile: "Mild, slightly sweet, creamy when cooked",
    nutritionHighlights: "High in beta-carotene, vitamin A, potassium, fiber",
    commonCuisines: ["American", "Fall/Harvest", "Soups", "Desserts"],
    
    plantingHistory: [
      {
        year: 2023,
        plantDate: "2023-06-01",
        harvestDate: "2023-09-20",
        seedsPlanted: 6,
        seedsGerminated: 5,
        plantsHarvested: 4,
        yieldObtained: "4 pumpkins, avg 8 lbs each",
        notes: "Strong harvest, good size",
        gardenerNotes: "Started in greenhouse, transplanted after last frost. Very productive.",
      },
    ],
    companionPlants: ["corn", "beans", "squash", "nasturtiums"],
    pestHistory: [
      {
        year: 2023,
        pest: "Squash bugs",
        severity: "medium",
        treatmentUsed: "Hand-picked, removed egg clusters",
        effective: true,
        notes: "Monitor undersides of leaves starting early summer",
      },
    ],
    diseaseHistory: [],
    successStories: [
      "Produced excellent large pumpkins for fall decorating and cooking",
      "Mammoth Gold variety lived up to its name—size was impressive",
    ],
    challenges: [
      "Squash bugs can be aggressive—need vigilant monitoring",
      "Requires significant space (4x4 ft per plant)",
      "Water demand is high in Utah's dry climate",
    ],
    
    createdAt: "2026-07-02T00:00:00Z",
    updatedAt: "2026-07-02T00:00:00Z",
    notes: "Excellent heirloom variety for both decoration and cooking. Karmel has good success history.",
  },

  {
    id: "seed-squash-blue-hubbard",
    commonName: "Squash",
    botanicalName: "Cucurbita maxima",
    variety: "Blue Hubbard",
    
    seedCount: 25,
    germinationRate: 80,
    packagedDate: "2020-01-01",
    storageLocation: "Cool storage - basement",
    
    isHeirloom: true,
    isAnnual: true,
    source: "Survival Essentials",
    sourceUrl: "https://www.survivalessentials.com",
    
    daysToMaturity: 110,
    daysToGermination: 10,
    startIndoors: false,
    lightRequirement: "full-sun",
    waterNeeds: "moderate",
    soilType: "Rich, well-draining loam",
    soilPh: { min: 6.0, max: 7.5 },
    spacingInches: 48,
    fertilizer: "Balanced, side-dress when flowering begins",
    
    utahPlantingWindows: {
      spring: { start: "05-20", end: "06-15" },
    },
    frostHardiness: "frost-sensitive",
    utahZone: "6a",
    utahSpecificNotes: "Plant after soil warms well. Blue Hubbard is excellent storage squash for Utah winters—stores 3-4 months in cool cellar.",
    
    seedPacketPhoto: "/seed-vault/squash-blue-hubbard-packet.jpg",
    seedCloseupPhoto: "/seed-vault/squash-blue-hubbard-seeds.jpg",
    maturePlantPhoto: "/seed-vault/squash-blue-hubbard-mature.jpg",
    harvestedProductPhoto: "/seed-vault/squash-blue-hubbard-harvested.jpg",
    
    harvestTiming: "Rind hardens completely; can't pierce with fingernail",
    harvestSeason: "September-October",
    yieldPerPlant: "2-4 squashes per plant",
    
    canSaveSeed: true,
    seedSavingInstructions: "Allow squash to fully mature and harden on vine. Scoop seeds, rinse thoroughly, and dry on screens for 3-4 weeks.",
    seedMaturityIndicators: "Completely hardened rind, dull finish (not shiny)",
    dryingMethod: "Air dry on screens, 3-4 weeks",
    seedStorageMethod: "cool-dry",
    estimatedShelfLife: 5,
    seedStorageTemperature: { min: 40, max: 50 },
    seedStorageHumidity: "Below 50%",
    
    cookingMethods: ["roast", "steam", "puree", "bake"],
    preservationMethods: ["freeze", "can"],
    recipeLinks: [
      { title: "Roasted Blue Hubbard Squash", url: "#" },
      { title: "Squash Soup", url: "#" },
    ],
    flavorProfile: "Dense, dry, sweet, slightly nutty",
    nutritionHighlights: "Rich in beta-carotene, vitamins C and E, potassium",
    commonCuisines: ["Fall/Winter", "Soups", "Roasted vegetables"],
    
    plantingHistory: [
      {
        year: 2023,
        plantDate: "2023-06-05",
        harvestDate: "2023-09-30",
        seedsPlanted: 4,
        seedsGerminated: 3,
        plantsHarvested: 3,
        yieldObtained: "6 squashes, stored through winter",
        notes: "Excellent storage crop",
        gardenerNotes: "Stored in basement at 50°F, lasted through January.",
      },
    ],
    companionPlants: ["corn", "beans", "squash", "radish"],
    pestHistory: [
      {
        year: 2023,
        pest: "Squash vine borers",
        severity: "low",
        treatmentUsed: "Careful inspection, removed affected sections",
        effective: true,
        notes: "Wrap base of stems with aluminum foil to prevent entry",
      },
    ],
    diseaseHistory: [
      {
        year: 2023,
        disease: "Powdery mildew (late season)",
        severity: "low",
        treatmentUsed: "Neem oil spray",
        effective: true,
        notes: "Occurred near end of season, didn't affect harvest",
      },
    ],
    successStories: [
      "Excellent winter storage—lasts 3-4 months in cool cellar",
      "Dense, flavorful flesh perfect for cooking",
      "Reliable producer with good germination",
    ],
    challenges: [
      "Squash vine borers can be destructive if not monitored",
      "Powdery mildew common in fall humidity",
      "Needs significant space (4x4 ft per plant)",
    ],
    
    createdAt: "2026-07-02T00:00:00Z",
    updatedAt: "2026-07-02T00:00:00Z",
    notes: "Heirloom storage squash. Perfect for Utah winters. Good seed viability (80%) suggests proper storage.",
  },

  {
    id: "seed-bean-tendergreen",
    commonName: "Bean, Green Snap",
    botanicalName: "Phaseolus vulgaris",
    variety: "Tendergreen",
    
    seedCount: 100,
    germinationRate: 94,
    packagedDate: "2020-01-01",
    storageLocation: "Cool storage - basement",
    
    isHeirloom: true,
    isAnnual: true,
    source: "Survival Essentials",
    sourceUrl: "https://www.survivalessentials.com",
    
    daysToMaturity: 53,
    daysToGermination: 7,
    startIndoors: false,
    lightRequirement: "full-sun",
    waterNeeds: "moderate",
    soilType: "Well-draining loam, moderate fertility",
    soilPh: { min: 6.0, max: 7.0 },
    spacingInches: 4, // Bush variety
    fertilizer: "Light fertilizer at planting; avoid excess nitrogen",
    
    utahPlantingWindows: {
      spring: { start: "05-20", end: "06-30" },
      summer: { start: "07-01", end: "07-15" }, // For fall crop
    },
    frostHardiness: "frost-sensitive",
    utahZone: "6a",
    utahSpecificNotes: "EXCELLENT germination rate (94%)! Fast growing—perfect for succession planting. Plant every 2-3 weeks for continuous harvest. Benefits from afternoon shade in hottest part of summer.",
    
    seedPacketPhoto: "/seed-vault/bean-tendergreen-packet.jpg",
    seedCloseupPhoto: "/seed-vault/bean-tendergreen-seeds.jpg",
    seedlingPhoto: "/seed-vault/bean-tendergreen-seedling.jpg",
    maturePlantPhoto: "/seed-vault/bean-tendergreen-plant.jpg",
    harvestedProductPhoto: "/seed-vault/bean-tendergreen-harvested.jpg",
    
    harvestTiming: "Pods tender and snap cleanly; before seeds swell",
    harvestSeason: "July-September (multiple plantings)",
    yieldPerPlant: "½ lb per plant",
    
    canSaveSeed: true,
    seedSavingInstructions: "Allow pods to fully mature and dry on plant. When pods are papery and brown, harvest and remove seeds. Spread on screen to dry completely before storage.",
    seedMaturityIndicators: "Pods turn brown and papery, become brittle",
    dryingMethod: "Air dry in pod, 2 weeks",
    seedStorageMethod: "cool-dry",
    estimatedShelfLife: 3,
    seedStorageTemperature: { min: 40, max: 50 },
    seedStorageHumidity: "Below 50%",
    
    cookingMethods: ["steam", "blanch-freeze", "sauté", "roast"],
    preservationMethods: ["freeze", "can", "dry"],
    recipeLinks: [
      { title: "Blanched & Frozen Green Beans", url: "#" },
      { title: "Garlic Green Beans", url: "#" },
    ],
    flavorProfile: "Tender, mild, slightly sweet",
    nutritionHighlights: "Good source of vitamins A & C, fiber, folate, protein",
    commonCuisines: ["American", "Mediterranean", "Asian"],
    
    plantingHistory: [
      {
        year: 2023,
        plantDate: "2023-06-01",
        harvestDate: "2023-07-24",
        seedsPlanted: 30,
        seedsGerminated: 28,
        plantsHarvested: 28,
        yieldObtained: "14 lbs fresh beans",
        notes: "Excellent yield, prolific producer",
        gardenerNotes: "Succession planted 3 times. Excellent for freezing.",
      },
    ],
    companionPlants: ["corn", "cucumber", "pumpkin", "basil"],
    pestHistory: [
      {
        year: 2023,
        pest: "Mexican bean beetles",
        severity: "low",
        treatmentUsed: "Hand-picked beetles and larvae",
        effective: true,
        notes: "Remove egg clusters on undersides of leaves",
      },
    ],
    diseaseHistory: [],
    successStories: [
      "HIGH germination rate (94%)—excellent seed viability",
      "Very prolific producer—50+ pods per plant",
      "Fast maturation (53 days) ideal for Utah season",
      "Perfect for succession planting for continuous harvest",
    ],
    challenges: [
      "Mexican bean beetles can appear mid-season",
      "Can get stringy if harvested late—pick young and tender",
      "Needs regular picking to encourage more production",
    ],
    
    createdAt: "2026-07-02T00:00:00Z",
    updatedAt: "2026-07-02T00:00:00Z",
    notes: "BEST GERMINATORS in the batch (94%)! Very prolific. Tendergreen is a classic variety. 100 seeds = plenty for succession planting.",
  },

  {
    id: "seed-bean-fava-broad-windsor",
    commonName: "Bean, Fava (Broad Bean)",
    botanicalName: "Vicia faba",
    variety: "Broad Windsor",
    
    seedCount: 35,
    germinationRate: 87,
    packagedDate: "2020-01-01",
    storageLocation: "Cool storage - basement",
    
    isHeirloom: true,
    isAnnual: true,
    source: "Survival Essentials",
    sourceUrl: "https://www.survivalessentials.com",
    
    daysToMaturity: 60,
    daysToGermination: 10,
    startIndoors: false,
    lightRequirement: "full-sun",
    waterNeeds: "moderate",
    soilType: "Well-draining loam",
    soilPh: { min: 6.0, max: 8.0 },
    spacingInches: 6,
    fertilizer: "Minimal—nitrogen-fixing legume",
    
    utahPlantingWindows: {
      fall: { start: "09-01", end: "09-30" }, // Fall planting, overwinters
      spring: { start: "04-01", end: "04-30" }, // Early spring
    },
    frostHardiness: "cold-hardy",
    utahZone: "6a",
    utahSpecificNotes: "NITROGEN-FIXER! Plant in fall for spring harvest, or early spring for early summer. Survives Utah winters. Great for crop rotation—improves soil for next crop. Flowers attract pollinators.",
    
    seedPacketPhoto: "/seed-vault/bean-fava-broad-windsor-packet.jpg",
    seedCloseupPhoto: "/seed-vault/bean-fava-broad-windsor-seeds.jpg",
    maturePlantPhoto: "/seed-vault/bean-fava-mature.jpg",
    harvestedProductPhoto: "/seed-vault/bean-fava-harvested.jpg",
    
    harvestTiming: "Pods tender when 3-4 inches long, or wait for full mature beans",
    harvestSeason: "May-June (spring crop) or March-April (fall-planted, spring harvest)",
    yieldPerPlant: "1 lb per plant",
    
    canSaveSeed: true,
    seedSavingInstructions: "Allow pods to fully mature and dry on plant until papery and brown. Shell seeds and spread on screens to dry completely.",
    seedMaturityIndicators: "Pods turn brown and papery",
    dryingMethod: "Air dry in pod, 2-3 weeks",
    seedStorageMethod: "cool-dry",
    estimatedShelfLife: 2,
    seedStorageTemperature: { min: 40, max: 50 },
    seedStorageHumidity: "Below 50%",
    
    cookingMethods: ["steam", "boil", "roast", "stew"],
    preservationMethods: ["freeze", "dry"],
    recipeLinks: [
      { title: "Fava Bean Puree", url: "#" },
      { title: "Roasted Fava Beans", url: "#" },
    ],
    flavorProfile: "Creamy, mild, slightly nutty when young; starchy when mature",
    nutritionHighlights: "High protein, fiber, iron, folate. Seeds are 25%+ protein when dried.",
    commonCuisines: ["Mediterranean", "Middle Eastern", "Italian"],
    
    plantingHistory: [
      {
        year: 2023,
        plantDate: "2023-09-15",
        harvestDate: "2024-05-20",
        seedsPlanted: 20,
        seedsGerminated: 17,
        plantsHarvested: 17,
        yieldObtained: "17 lbs fresh beans",
        notes: "Fall-planted, overwintered well",
        gardenerNotes: "Survived Utah winter. Tall, sturdy plants. Great for filling spring garden gap.",
      },
    ],
    companionPlants: ["basil", "corn", "cucumber", "squash"],
    pestHistory: [
      {
        year: 2024,
        pest: "Aphids (early spring)",
        severity: "low",
        treatmentUsed: "Water spray to dislodge, later beneficial insects controlled",
        effective: true,
        notes: "Managed naturally",
      },
    ],
    diseaseHistory: [],
    successStories: [
      "Excellent nitrogen-fixer for garden rotation",
      "Overwinters in Utah; no replanting needed",
      "Tall, attractive plants with white flowers",
      "Both young pods and mature beans edible",
      "Prolific producer",
    ],
    challenges: [
      "Can be aphid target in spring",
      "Young pods must be harvested before shell hardens",
      "Plants get tall—may need staking",
    ],
    
    createdAt: "2026-07-02T00:00:00Z",
    updatedAt: "2026-07-02T00:00:00Z",
    notes: "Unique legume for crop rotation. Fall planting strategy. Great protein source and nitrogen for garden health.",
  },

  {
    id: "seed-bean-lima-king-of-garden",
    commonName: "Bean, Lima (Butter Bean)",
    botanicalName: "Phaseolus lunatus",
    variety: "King Of The Garden (Pole)",
    
    seedCount: 25,
    germinationRate: 91,
    packagedDate: "2020-01-01",
    storageLocation: "Cool storage - basement",
    
    isHeirloom: true,
    isAnnual: true,
    source: "Survival Essentials",
    sourceUrl: "https://www.survivalessentials.com",
    
    daysToMaturity: 88,
    daysToGermination: 10,
    startIndoors: true, // Optional: can direct sow if soil warm enough
    lightRequirement: "full-sun",
    waterNeeds: "moderate",
    soilType: "Well-draining, moderately fertile loam",
    soilPh: { min: 6.0, max: 7.0 },
    spacingInches: 6, // Pole variety, needs trellis/support
    fertilizer: "Light fertilizer; minimal nitrogen needed",
    
    utahPlantingWindows: {
      spring: { start: "06-01", end: "06-30" }, // After all frost danger
    },
    frostHardiness: "frost-sensitive",
    utahZone: "6a",
    utahSpecificNotes: "POLE VARIETY—needs strong trellis or stakes (8+ feet). Warm-season crop; wait until soil is 70°F+. Takes longer to mature (88 days) but high yield. Succession plant 2-3 weeks apart for continuous harvest.",
    
    seedPacketPhoto: "/seed-vault/bean-lima-king-garden-packet.jpg",
    seedCloseupPhoto: "/seed-vault/bean-lima-king-garden-seeds.jpg",
    seedlingPhoto: "/seed-vault/bean-lima-seedling.jpg",
    maturePlantPhoto: "/seed-vault/bean-lima-mature.jpg",
    harvestedProductPhoto: "/seed-vault/bean-lima-harvested.jpg",
    
    harvestTiming: "Pods plump, beans inside clearly visible but still tender",
    harvestSeason: "August-September",
    yieldPerPlant: "2-3 lbs per plant",
    
    canSaveSeed: true,
    seedSavingInstructions: "Allow pods to fully mature and dry on vine. Shell dried beans and store.",
    seedMaturityIndicators: "Pods brown and papery",
    dryingMethod: "Air dry in pod, 2-3 weeks",
    seedStorageMethod: "cool-dry",
    estimatedShelfLife: 2,
    seedStorageTemperature: { min: 40, max: 50 },
    seedStorageHumidity: "Below 50%",
    
    cookingMethods: ["steam", "boil", "bake", "roast"],
    preservationMethods: ["freeze", "can", "dry"],
    recipeLinks: [
      { title: "Buttered Lima Beans", url: "#" },
      { title: "Lima Bean Succotash", url: "#" },
      { title: "Creamed Limas", url: "#" },
    ],
    flavorProfile: "Buttery, mild, creamy when cooked",
    nutritionHighlights: "Good protein, fiber, magnesium, potassium",
    commonCuisines: ["American Southern", "Classic American"],
    
    plantingHistory: [
      {
        year: 2023,
        plantDate: "2023-06-15",
        harvestDate: "2023-09-10",
        seedsPlanted: 12,
        seedsGerminated: 11,
        plantsHarvested: 11,
        yieldObtained: "22 lbs fresh limas",
        notes: "Excellent yield per plant",
        gardenerNotes: "Tall vigorous vines, needed strong trellis. Productive all summer until frost.",
      },
    ],
    companionPlants: ["corn", "squash", "basil"],
    pestHistory: [
      {
        year: 2023,
        pest: "Spider mites (greenhouse conditions)",
        severity: "low",
        treatmentUsed: "Increased air circulation, misting",
        effective: true,
        notes: "Can be issue in warm, dry greenhouse",
      },
    ],
    diseaseHistory: [],
    successStories: [
      "Pole variety provides excellent vertical production",
      "High yield per plant (2-3 lbs)",
      "Classic heirloom variety, known since 1800s",
      "Beautiful tall vines with red flowers",
      "Long productive season",
    ],
    challenges: [
      "REQUIRES strong support structure (8+ feet tall vines)",
      "Long growing season (88 days) for Utah",
      "Prefers warm soil; plant late",
      "Spider mites can be issue in greenhouse/warm conditions",
      "Starts slowly, heavy production mid-season",
    ],
    
    createdAt: "2026-07-02T00:00:00Z",
    updatedAt: "2026-07-02T00:00:00Z",
    notes: "Classic pole lima bean. Beautiful heirloom. High yield but needs garden space and support. Excellent germination (91%).",
  },
];
