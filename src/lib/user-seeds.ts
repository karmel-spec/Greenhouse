import type { SeedPacket } from "@/lib/seed-vault-types";
import type { StoredSeedPacket } from "@/lib/store";

/** Converts a user-added packet into the full SeedPacket shape the browser,
 *  cards, and planting-window logic already understand. */
export function toSeedPacket(stored: StoredSeedPacket): SeedPacket {
  return {
    id: stored.id,
    commonName: stored.commonName,
    botanicalName: stored.botanicalName ?? "",
    variety: stored.variety,
    seedCount: stored.seedCount,
    germinationRate: stored.germinationRate,
    packagedDate: stored.packagedDate,
    storageLocation: "Added by Karmel",
    isHeirloom: stored.isHeirloom ?? false,
    isAnnual: stored.isAnnual ?? true,
    source: stored.source ?? "Karmel's addition",
    daysToMaturity: stored.daysToMaturity ?? 70,
    daysToGermination: stored.daysToGermination,
    startIndoors: stored.startIndoors,
    utahPlantingWindows:
      stored.springStart && stored.springEnd
        ? { spring: { start: stored.springStart, end: stored.springEnd } }
        : undefined,
    utahZone: "6b",
    utahSpecificNotes: stored.notes,
    canSaveSeed: true,
    seedStorageMethod: "cool-dry",
    estimatedShelfLife: 4,
    createdAt: stored.createdAt,
    updatedAt: stored.createdAt,
  } as SeedPacket;
}
