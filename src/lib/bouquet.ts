/**
 * Today's Bouquet — celebrate what you DID do. Every nurturing action earns
 * a flower; the day's flowers become a bouquet; bouquets build a collection.
 * No streaks, nothing to lose — flowers only grow. (Design: Karmel's
 * "Daily Bouquet Rewards" mockups, 2026-07.)
 */

export type BouquetAction = {
  key: string;
  label: string;
  flower: string;
  emoji: string;
  meaning: string;
};

export const BOUQUET_ACTIONS: BouquetAction[] = [
  { key: "exercise", label: "Exercised / strength workout", flower: "Sunflower", emoji: "🌻", meaning: "Strength · Resilience" },
  { key: "walk", label: "Took a walk", flower: "Tulip", emoji: "🌷", meaning: "Movement · Steps" },
  { key: "salad", label: "Ate a salad or nourishing meal", flower: "Daisy", emoji: "🌼", meaning: "Nourishing meals" },
  { key: "water", label: "Stayed hydrated", flower: "Eucalyptus", emoji: "🌿", meaning: "Hydration · Breath" },
  { key: "friend", label: "Connected with a friend", flower: "Zinnia", emoji: "🌸", meaning: "Friendship · Connection" },
  { key: "husband", label: "Did something nice for my husband", flower: "Red rose", emoji: "🌹", meaning: "Kindness · Love" },
  { key: "scripture", label: "Scripture or prayer time", flower: "Lavender", emoji: "🪻", meaning: "Peace · Faith" },
  { key: "journal", label: "Journaled or reflected", flower: "Peony", emoji: "🌺", meaning: "Reflection" },
  { key: "garden", label: "Tended the garden or greenhouse", flower: "Fern", emoji: "🌱", meaning: "Plant care · Growth" },
  { key: "harvest", label: "Ate something I grew", flower: "Wildflower", emoji: "💐", meaning: "Harvest · Abundance" },
  { key: "gratitude", label: "Noticed something to be grateful for", flower: "Cherry blossom", emoji: "💮", meaning: "Gratitude · Joy" },
  { key: "rest", label: "Rested well / slept 7+ hours", flower: "Camellia", emoji: "🏵️", meaning: "Rest · Recovery" },
];

export const COMPASSION_ACTION: BouquetAction = {
  key: "compassion",
  label: "Faced a hard moment with self-compassion",
  flower: "Lotus",
  emoji: "🪷",
  meaning: "Resilience — you grow through what you go through",
};

export const ALL_ACTIONS = [...BOUQUET_ACTIONS, COMPASSION_ACTION];
export const ACTION_BY_KEY = new Map(ALL_ACTIONS.map((action) => [action.key, action]));

export const REDEEM_TIERS = [
  { flowers: 100, reward: "A new seed packet", emoji: "🌱" },
  { flowers: 500, reward: "A garden shopping trip", emoji: "🛒" },
  { flowers: 1000, reward: "A massage or self-care day", emoji: "🧖‍♀️" },
  { flowers: 2000, reward: "A weekend getaway", emoji: "🧳" },
];

/** Encouragement scaled to the day's bouquet size. */
export function bouquetTag(count: number): string {
  if (count === 0) return "Every choice you make is a seed of future you.";
  if (count <= 3) return "Small steps. Beautiful growth.";
  if (count <= 7) return "Look how your garden grows when you choose to care for yourself.";
  return "You showed up for you today. So proud!";
}

export function todayKey(now = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
