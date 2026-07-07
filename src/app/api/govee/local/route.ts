import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { LOCAL_SENSOR_FILE, readLocalSensor, type LocalSensorReading } from "@/lib/local-sensor";

/**
 * Ingest endpoint for the Bluetooth bridge (scripts/govee-ble-bridge.py).
 * The bridge hears the H5075's BLE advertisements from this Mac and posts
 * readings here; /api/environment prefers a fresh local reading over the
 * (usually empty) Govee cloud.
 */

export async function GET() {
  const reading = await readLocalSensor();
  return NextResponse.json({ reading });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const tempC = typeof body.tempC === "number" ? body.tempC : null;
  const humidity = typeof body.humidity === "number" ? body.humidity : null;
  if (tempC === null || humidity === null || tempC < -40 || tempC > 80 || humidity < 0 || humidity > 100) {
    return NextResponse.json({ error: "tempC and humidity (sane values) required" }, { status: 400 });
  }

  const reading: LocalSensorReading = {
    tempC,
    tempF: typeof body.tempF === "number" ? body.tempF : Math.round(((tempC * 9) / 5 + 32) * 10) / 10,
    humidity,
    battery: typeof body.battery === "number" ? body.battery : undefined,
    rssi: typeof body.rssi === "number" ? body.rssi : undefined,
    name: typeof body.name === "string" ? body.name.slice(0, 60) : undefined,
    address: typeof body.address === "string" ? body.address.slice(0, 60) : undefined,
    at: new Date().toISOString(),
  };

  await fs.mkdir(path.dirname(LOCAL_SENSOR_FILE), { recursive: true });
  await fs.writeFile(LOCAL_SENSOR_FILE, JSON.stringify(reading, null, 2), "utf8");
  return NextResponse.json({ ok: true, reading });
}
