/**
 * Seed Vault Data Types
 * Comprehensive schema for Karmel's seed inventory and growing guide
 */

export interface SeedPacket {
  id: string; // unique seed ID (e.g., "seed-pumpkin-mammoth-gold")
  commonName: string;
  botanicalName: string;
  variety?: string;
  
  // Inventory
  seedCount: number;
  germinationRate: number; // percentage 0-100
  packagedDate: string; // ISO date
  storageLocation?: string; // e.g., "Basement cool closet"
  lastCheckedDate?: string;
  
  // Heirloom & Type
  isHeirloom: boolean;
  isAnnual: boolean;
  source: string; // e.g., "Survival Essentials"
  sourceUrl?: string;
  
  // Growing
  daysToMaturity: number;
  daysToGermination?: number;
  startIndoors?: boolean; // true = start indoors, false = direct sow
  lightRequirement?: "full-sun" | "part-shade" | "shade";
  waterNeeds?: "low" | "moderate" | "high";
  soilType?: string; // e.g., "well-draining loam"
  soilPh?: { min: number; max: number };
  spacingInches?: number;
  fertilizer?: string;
  
  // Utah-Specific
  utahPlantingWindows?: {
    spring?: { start: string; end: string }; // MM-DD format
    summer?: { start: string; end: string };
    fall?: { start: string; end: string };
  };
  frostHardiness?: "frost-tolerant" | "frost-sensitive" | "cold-hardy";
  utahZone?: string; // e.g., "6a", "6b"
  utahSpecificNotes?: string;
  
  // Images
  seedPacketPhoto?: string; // URL or path
  seedCloseupPhoto?: string;
  seedlingPhoto?: string;
  maturePlantPhoto?: string;
  harvestedProductPhoto?: string;
  
  // Harvest
  harvestTiming?: string; // e.g., "When pods snap cleanly"
  harvestSeason?: string; // e.g., "July-September"
  yieldPerPlant?: string; // e.g., "1-2 lbs per plant"
  
  // Seed Saving (for heirlooms)
  canSaveSeed: boolean;
  seedSavingInstructions?: string;
  seedMaturityIndicators?: string;
  dryingMethod?: string;
  seedStorageMethod?: "cool-dry" | "refrigerated" | "frozen" | "vacuum-sealed";
  estimatedShelfLife?: number; // years viable
  seedStorageTemperature?: { min: number; max: number }; // Fahrenheit
  seedStorageHumidity?: string; // e.g., "below 50%"
  
  // Culinary
  cookingMethods?: string[]; // e.g., ["roast", "steam", "raw"]
  preservationMethods?: string[]; // e.g., ["freeze", "can", "dehydrate"]
  recipeLinks?: { title: string; url: string }[];
  flavorProfile?: string; // e.g., "nutty, slightly sweet"
  nutritionHighlights?: string;
  commonCuisines?: string[]; // e.g., ["Italian", "Mediterranean"]
  
  // Growing History & Tracking
  plantingHistory?: PlantingRecord[];
  companionPlants?: string[]; // e.g., ["tomatoes", "basil"]
  pestHistory?: PestIssue[];
  diseaseHistory?: DiseaseIssue[];
  successStories?: string[];
  challenges?: string[];
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface PlantingRecord {
  year: number;
  plantDate: string; // ISO date
  harvestDate?: string;
  seedsPlanted: number;
  seedsGerminated?: number;
  plantsHarvested?: number;
  yieldObtained?: string;
  notes?: string;
  gardenerNotes?: string; // Karmel's personal observations
}

export interface PestIssue {
  year: number;
  pest: string; // e.g., "squash bugs"
  severity: "low" | "medium" | "high";
  treatmentUsed?: string;
  effective: boolean;
  notes?: string;
}

export interface DiseaseIssue {
  year: number;
  disease: string; // e.g., "powdery mildew"
  severity: "low" | "medium" | "high";
  treatmentUsed?: string;
  effective: boolean;
  notes?: string;
}

export interface SeedVaultFilter {
  heirloomOnly?: boolean;
  annualOnly?: boolean;
  readyToPlant?: boolean;
  plantingSeason?: "spring" | "summer" | "fall" | "winter";
  lightRequirement?: "full-sun" | "part-shade" | "shade";
  waterNeeds?: "low" | "moderate" | "high";
  search?: string;
}

export interface SeedStats {
  totalSeeds: number;
  totalVarieties: number;
  heirloomCount: number;
  totalSeedCount: number; // sum of all seed counts
  averageGermination: number;
  oldestPacket: { name: string; year: number };
  mostSeeds: { name: string; count: number };
}
