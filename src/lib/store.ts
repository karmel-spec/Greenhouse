/**
 * File-backed JSON store for tasks and reminders.
 * Lives in data/garden-store.json (gitignored). Good enough for a
 * single-gardener app; swap for Supabase/Firebase later without
 * changing the API routes' shapes.
 */

import { promises as fs } from "fs";
import path from "path";
import { downloadStoreJson, hasSupabase, uploadStoreJson } from "@/lib/supabase-backend";

export type StoredTask = {
  id: string;
  title: string;
  time: string;
  kind: string;
  priority: "High" | "Medium" | "Low";
  done: boolean;
  createdAt: string;
};

export type StoredReminder = {
  id: string;
  message: string;
  type: string;
  schedule: string;
  phone?: string;
  active: boolean;
  createdAt: string;
};

export type StoredPlant = {
  id: string;
  name: string;
  variety?: string;
  zone: string;
  health: string;
  photo?: string; // served via /api/photos/<file>
  notes?: string;
  addedAt: string;
  sourceJournalId?: string; // journal entry this plant was created from (bulk add)
};

export type StoredJournalEntry = {
  id: string;
  fileName: string;
  photo?: string; // served via /api/photos/<file>
  plant: string;
  zone: string;
  health: string;
  identificationStatus: string;
  confidence?: number;
  candidates?: string[];
  source?: string;
  signal: string;
  water: string;
  sun: string;
  pruning: string;
  recommendation: string;
  recordedAt: string;
  savedToLibrary?: boolean;
  visionProcessed?: boolean; // has been through a real vision pass (bulk)
};

export type StoredTray = {
  id: string;
  name: string;
  startedAt: string; // ISO date
  harvestDays: number;
  status: "active" | "harvested";
  harvestedAt?: string;
  notes?: string;
};

export type StoredWishlistItem = {
  id: string;
  name: string;
  category: string;
  price: string;
  priority: "High" | "Medium" | "Low";
  note?: string;
  link?: string; // where to buy it
  image?: string; // product photo URL
  createdAt: string;
};

export type StoredSfgBed = {
  id: string;
  name: string;
  /** 16 entries (4x4, row-major, row 0 = north). Each is a palette plant key or null. */
  squares: (string | null)[];
  createdAt: string;
};

export type StoredPlotClaim = {
  name: string;
  crop?: string;
  note?: string;
};

export type StoredCommunityGarden = {
  plotSize: string; // key into PLOT_OPTIONS, e.g. "4x8"
  pathFt: number;
  claims: Record<string, StoredPlotClaim>; // keyed by layout plot id ("p2-3")
  checklist: Record<string, boolean>; // keyed by COMMUNITY_CHECKLIST item key
};

export const DEFAULT_COMMUNITY_GARDEN: StoredCommunityGarden = {
  plotSize: "4x8",
  pathFt: 3,
  claims: {},
  checklist: {},
};

export type CompostLogEntry = {
  at: string; // ISO timestamp
  type: "greens" | "browns" | "turn" | "water" | "temp" | "note";
  detail?: string;
  tempF?: number;
};

export type StoredCompostPile = {
  id: string;
  name: string;
  method: string; // key into COMPOST_METHODS: hot | cold | tumbler | worms
  startedAt: string;
  status: "active" | "curing" | "done";
  log: CompostLogEntry[];
  createdAt: string;
};

export type SeedTrayCell = {
  seed: string; // common name from the seed vault
  variety?: string;
  state: "sown" | "sprouted" | "failed" | "transplanted";
} | null;

export type StoredSeedTray = {
  id: string;
  name: string;
  rows: number;
  cols: number;
  cells: SeedTrayCell[]; // rows*cols, row-major
  sownAt: string; // ISO date of first sowing
  createdAt: string;
};

/** Today's Bouquet — nurturing actions checked per day, keyed yyyy-mm-dd. */
export type BouquetHistory = Record<string, string[]>;

/** Karmel's own bouquet activities, alongside the built-in dozen. */
export type StoredBouquetAction = {
  key: string; // "custom-<id>"
  label: string;
  flower: string;
  emoji: string;
  category: string; // Body | Soul | Connection | Garden
};

/** Seed packets Karmel adds herself (app form or Telegram) — merged with the built-in vault. */
export type StoredSeedPacket = {
  id: string; // "userseed-..."
  commonName: string;
  botanicalName?: string;
  variety?: string;
  seedCount: number;
  germinationRate: number;
  packagedDate: string; // ISO date or year
  source?: string;
  isHeirloom?: boolean;
  isAnnual?: boolean;
  daysToMaturity?: number;
  daysToGermination?: number;
  startIndoors?: boolean;
  springStart?: string; // MM-DD
  springEnd?: string; // MM-DD
  notes?: string;
  createdAt: string;
};

/** A run of Karmel's 12-plug hydroponic seed tester. */
export type SeedTestPlug = "sown" | "sprouted" | "failed";

export type StoredSeedTest = {
  id: string;
  seedName: string;
  variety?: string;
  claimedGermination?: number; // what the packet promises, for comparison
  daysToGermination?: number;
  startedAt: string;
  plugs: SeedTestPlug[]; // 12 cone plugs
  notes: string;
  status: "active" | "done";
  createdAt: string;
};

export type GardenStore = {
  tasks: StoredTask[];
  reminders: StoredReminder[];
  plants: StoredPlant[];
  journal: StoredJournalEntry[];
  trays: StoredTray[];
  wishlist: StoredWishlistItem[];
  sfgBeds: StoredSfgBed[];
  communityGarden: StoredCommunityGarden;
  compostPiles: StoredCompostPile[];
  seedTrays: StoredSeedTray[];
  bouquet: BouquetHistory;
  bouquetCustom: StoredBouquetAction[];
  userSeeds: StoredSeedPacket[];
  seedTests: StoredSeedTest[];
};

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "garden-store.json");

const seedTasks: Omit<StoredTask, "id" | "done" | "createdAt">[] = [
  { title: "Water greenhouse herbs", time: "7:00 AM", kind: "Water", priority: "High" },
  { title: "Mist microgreens trays", time: "10:00 AM", kind: "Mist", priority: "High" },
  { title: "Check basil cuttings", time: "12:00 PM", kind: "Propagation", priority: "Medium" },
  { title: "Harvest radish microgreens", time: "3:00 PM", kind: "Harvest", priority: "Medium" },
  { title: "Take progress photos", time: "4:00 PM", kind: "Journal", priority: "Low" },
  { title: "Plant lavender seeds", time: "5:00 PM", kind: "Seeds", priority: "Medium" },
  { title: "Evening greenhouse check", time: "7:00 PM", kind: "Health", priority: "High" },
];

let writeQueue: Promise<unknown> = Promise.resolve();

// In cloud mode, cache reads briefly so a dashboard load (many GET routes)
// doesn't re-download the store for every request.
let cloudCache: { json: string; at: number } | null = null;
const CLOUD_CACHE_MS = 2000;

async function readRawStore(): Promise<string> {
  if (hasSupabase()) {
    if (cloudCache && Date.now() - cloudCache.at < CLOUD_CACHE_MS) return cloudCache.json;
    const json = await downloadStoreJson();
    if (json === null) throw new Error("no cloud store yet");
    cloudCache = { json, at: Date.now() };
    return json;
  }
  return fs.readFile(STORE_PATH, "utf8");
}

export async function readStore(): Promise<GardenStore> {
  try {
    const raw = await readRawStore();
    const parsed = JSON.parse(raw) as Partial<GardenStore>;
    return {
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
      reminders: Array.isArray(parsed.reminders) ? parsed.reminders : [],
      plants: Array.isArray(parsed.plants) ? parsed.plants : [],
      journal: Array.isArray(parsed.journal) ? parsed.journal : [],
      trays: Array.isArray(parsed.trays) ? parsed.trays : [],
      wishlist: Array.isArray(parsed.wishlist) ? parsed.wishlist : [],
      sfgBeds: Array.isArray(parsed.sfgBeds) ? parsed.sfgBeds : [],
      communityGarden:
        parsed.communityGarden && typeof parsed.communityGarden === "object"
          ? { ...DEFAULT_COMMUNITY_GARDEN, ...parsed.communityGarden }
          : { ...DEFAULT_COMMUNITY_GARDEN },
      compostPiles: Array.isArray(parsed.compostPiles) ? parsed.compostPiles : [],
      seedTrays: Array.isArray(parsed.seedTrays) ? parsed.seedTrays : [],
      bouquet: parsed.bouquet && typeof parsed.bouquet === "object" ? parsed.bouquet : {},
      bouquetCustom: Array.isArray(parsed.bouquetCustom) ? parsed.bouquetCustom : [],
      userSeeds: Array.isArray(parsed.userSeeds) ? parsed.userSeeds : [],
      seedTests: Array.isArray(parsed.seedTests) ? parsed.seedTests : [],
    };
  } catch {
    const initial: GardenStore = {
      tasks: seedTasks.map((task, index) => ({
        ...task,
        id: `task-seed-${index}`,
        done: false,
        createdAt: new Date().toISOString(),
      })),
      reminders: [],
      plants: [],
      journal: [],
      trays: [],
      wishlist: [],
      sfgBeds: [],
      communityGarden: { ...DEFAULT_COMMUNITY_GARDEN },
      compostPiles: [],
      seedTrays: [],
      bouquet: {},
      bouquetCustom: [],
      userSeeds: [],
      seedTests: [],
    };
    await persist(initial);
    return initial;
  }
}

async function persist(store: GardenStore) {
  const json = JSON.stringify(store, null, 2);
  if (hasSupabase()) {
    await uploadStoreJson(json);
    cloudCache = { json, at: Date.now() };
    return;
  }
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(STORE_PATH, json, "utf8");
}

// Serialize mutations so concurrent requests don't clobber each other.
export function updateStore<T>(mutate: (store: GardenStore) => T | Promise<T>): Promise<T> {
  const run = writeQueue.then(async () => {
    const store = await readStore();
    const result = await mutate(store);
    await persist(store);
    return result;
  });
  writeQueue = run.catch(() => {});
  return run;
}

export function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
