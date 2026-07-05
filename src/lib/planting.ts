import { SeedPacket } from "@/lib/seed-vault-types";

export type PlantingInfo = {
  text: string;
  now: boolean;
  /** Next plantable date (today if inside a window). */
  start: Date;
  /** Window close when `now`, otherwise the next window's start. */
  end: Date;
  estimated: boolean;
};

/**
 * Next planting date for Utah zone 6b. Uses the packet's Utah windows when
 * present; otherwise estimates from frost hardiness (last frost ~May 15,
 * estimates marked with "~").
 */
export function nextPlanting(seed: SeedPacket, today: Date): PlantingInfo | null {
  const explicit = seed.utahPlantingWindows
    ? ([seed.utahPlantingWindows.spring, seed.utahPlantingWindows.summer, seed.utahPlantingWindows.fall].filter(
        Boolean,
      ) as { start: string; end: string }[])
    : [];

  let windows = explicit;
  let estimated = false;
  if (!windows.length) {
    estimated = true;
    windows =
      seed.frostHardiness === "frost-sensitive"
        ? [{ start: "05-15", end: "06-30" }]
        : seed.frostHardiness === "cold-hardy" || seed.frostHardiness === "frost-tolerant"
          ? [
              { start: "03-20", end: "05-01" },
              { start: "08-01", end: "09-01" },
            ]
          : [{ start: "04-15", end: "06-15" }];
  }

  const year = today.getFullYear();
  const parse = (mmdd: string, y: number) => {
    const [month, day] = mmdd.split("-").map(Number);
    if (!month || !day) return null;
    return new Date(y, month - 1, day);
  };
  const format = (date: Date) =>
    date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      ...(date.getFullYear() !== year ? { year: "numeric" } : {}),
    });
  const approx = estimated ? "~" : "";

  for (const window of windows) {
    const start = parse(window.start, year);
    const end = parse(window.end, year);
    if (!start || !end || end < start) continue;
    if (today >= start && today <= end) {
      return { text: `Plant now — thru ${approx}${format(end)}`, now: true, start: today, end, estimated };
    }
  }

  let next: Date | null = null;
  for (const window of windows) {
    for (const y of [year, year + 1]) {
      const start = parse(window.start, y);
      if (start && start > today && (!next || start < next)) next = start;
    }
  }

  return next
    ? { text: `Ready to plant: ${approx}${format(next)}`, now: false, start: next, end: next, estimated }
    : null;
}

/** Sort key: plantable-now first (closing soonest first), then by next start date. */
export function plantingSortKey(seed: SeedPacket, today: Date): number {
  const info = nextPlanting(seed, today);
  if (!info) return Number.MAX_SAFE_INTEGER;
  // "now" items sort ahead of every future date, ordered by how soon the window closes.
  return info.now ? info.end.getTime() - 10_000 * 86_400_000 : info.start.getTime();
}
