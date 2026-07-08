import { promises as fs } from "fs";
import path from "path";

/** Latest reading written by the Bluetooth bridge (scripts/govee-ble-bridge.py). */

export const LOCAL_SENSOR_FILE = path.join(process.cwd(), "data", "local-sensor.json");

export type LocalSensorReading = {
  tempF: number;
  tempC: number;
  humidity: number;
  battery?: number;
  rssi?: number;
  name?: string;
  address?: string;
  at: string; // ISO timestamp, set server-side
};

export async function readLocalSensor(): Promise<LocalSensorReading | null> {
  // Fresh file from the bridge posting to this same machine wins…
  try {
    const parsed = JSON.parse(await fs.readFile(LOCAL_SENSOR_FILE, "utf8")) as LocalSensorReading;
    if (typeof parsed.tempF === "number" && typeof parsed.at === "string") return parsed;
  } catch {
    // no local file — fall through to the cloud store
  }
  // …otherwise the reading mirrored into the store (how the live site sees
  // what the Mac's bridge heard).
  try {
    const { readStore } = await import("@/lib/store");
    const stored = (await readStore()).sensorReading;
    if (stored && typeof stored.tempF === "number" && typeof stored.at === "string") return stored;
  } catch {
    // store unavailable
  }
  return null;
}

/** Minutes since the bridge last heard the sensor; null if never. */
export function readingAgeMinutes(reading: LocalSensorReading, now = Date.now()): number {
  return Math.floor((now - Date.parse(reading.at)) / 60_000);
}
