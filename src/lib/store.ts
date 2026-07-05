/**
 * File-backed JSON store for tasks and reminders.
 * Lives in data/garden-store.json (gitignored). Good enough for a
 * single-gardener app; swap for Supabase/Firebase later without
 * changing the API routes' shapes.
 */

import { promises as fs } from "fs";
import path from "path";

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

export type GardenStore = {
  tasks: StoredTask[];
  reminders: StoredReminder[];
  plants: StoredPlant[];
  journal: StoredJournalEntry[];
  trays: StoredTray[];
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

export async function readStore(): Promise<GardenStore> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<GardenStore>;
    return {
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
      reminders: Array.isArray(parsed.reminders) ? parsed.reminders : [],
      plants: Array.isArray(parsed.plants) ? parsed.plants : [],
      journal: Array.isArray(parsed.journal) ? parsed.journal : [],
      trays: Array.isArray(parsed.trays) ? parsed.trays : [],
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
    };
    await persist(initial);
    return initial;
  }
}

async function persist(store: GardenStore) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
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
