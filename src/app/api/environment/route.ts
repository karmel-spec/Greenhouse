import { NextResponse } from "next/server";
import { readLocalSensor, readingAgeMinutes } from "@/lib/local-sensor";

/**
 * One call for everything the dashboard needs about conditions:
 *  - outdoor: live Orem, UT weather from Open-Meteo (no key needed)
 *  - greenhouse: inside temp + humidity from the Govee thermo/hygrometer —
 *    a fresh reading from the Mac's Bluetooth bridge wins, then the Govee
 *    cloud API (needs GOVEE_API_KEY; device auto-discovered or pinned with
 *    GOVEE_DEVICE + GOVEE_SKU)
 */

const OREM = { latitude: 40.2969, longitude: -111.6946 };

const WEATHER_CODES: Record<number, string> = {
  0: "Clear sky",
  1: "Mostly sunny",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Icy fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  66: "Freezing rain",
  67: "Freezing rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Light showers",
  81: "Showers",
  82: "Heavy showers",
  85: "Snow showers",
  86: "Snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Thunderstorm with hail",
};

type GoveeDevice = {
  device: string;
  sku: string;
  deviceName?: string;
  type?: string;
};

let cachedDevice: { device: GoveeDevice; fetchedAt: number } | null = null;

export async function GET() {
  const [outdoor, greenhouse] = await Promise.all([getOutdoorWeather(), getGreenhouseReading()]);
  return NextResponse.json({ outdoor, greenhouse, fetchedAt: new Date().toISOString() });
}

async function getOutdoorWeather() {
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${OREM.latitude}&longitude=${OREM.longitude}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m` +
      `&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America%2FDenver`;

    const response = await fetch(url, { next: { revalidate: 600 } });
    if (!response.ok) throw new Error(`Open-Meteo returned ${response.status}`);

    const data = await response.json();
    const current = data.current ?? {};

    return {
      ok: true,
      temperatureF: Math.round(current.temperature_2m),
      feelsLikeF: Math.round(current.apparent_temperature),
      humidity: Math.round(current.relative_humidity_2m),
      windMph: Math.round(current.wind_speed_10m),
      condition: WEATHER_CODES[current.weather_code] ?? "Unknown",
      source: "open-meteo",
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Weather lookup failed",
      source: "open-meteo",
    };
  }
}

async function getGreenhouseReading() {
  // A fresh reading from the Mac's Bluetooth bridge beats the cloud —
  // the H5075 is BLE-only, so the cloud is usually empty anyway.
  const local = await readLocalSensor();
  if (local && readingAgeMinutes(local) <= 10) {
    return {
      ok: true,
      configured: true,
      online: true,
      temperatureF: Math.round(local.tempF * 10) / 10,
      humidity: Math.round(local.humidity),
      deviceName: local.name || "Greenhouse thermometer",
      sku: "H5075",
      battery: local.battery ?? null,
      source: "bluetooth-bridge",
    };
  }

  const apiKey = process.env.GOVEE_API_KEY;

  if (!apiKey) {
    return {
      ok: false,
      configured: false,
      message: "Set GOVEE_API_KEY in .env.local to show live greenhouse readings.",
    };
  }

  try {
    const device = await resolveDevice(apiKey);
    if (!device) {
      return {
        ok: false,
        configured: true,
        message:
          "No thermo/hygrometer found on this Govee account. Pin one with GOVEE_DEVICE and GOVEE_SKU, or check /api/govee/devices.",
      };
    }

    const stateResponse = await fetch("https://openapi.api.govee.com/router/api/v1/device/state", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Govee-API-Key": apiKey,
      },
      body: JSON.stringify({
        requestId: crypto.randomUUID(),
        payload: { sku: device.sku, device: device.device },
      }),
      // Sensor readings change slowly; don't hammer the 10k/day quota.
      next: { revalidate: 120 },
    });

    if (!stateResponse.ok) {
      throw new Error(`Govee state request returned ${stateResponse.status}`);
    }

    const data = await stateResponse.json();
    const capabilities: Array<{ type: string; instance: string; state?: { value?: unknown } }> =
      data.payload?.capabilities ?? [];

    const readCapability = (instance: string) => {
      const cap = capabilities.find((entry) => entry.instance === instance);
      const value = cap?.state?.value;
      return typeof value === "number" ? value : null;
    };

    const online = capabilities.find((entry) => entry.instance === "online")?.state?.value;
    const temperature = readCapability("sensorTemperature");
    const humidity = readCapability("sensorHumidity");

    if (temperature === null && humidity === null) {
      const isBleOnly = /^H50/.test(device.sku);
      return {
        ok: false,
        configured: true,
        online: online === true,
        message: isBleOnly
          ? `Found "${device.deviceName ?? device.sku}" (${device.sku} — Bluetooth-only). Three ways to get live readings: double-click "Greenhouse Bluetooth Bridge.command" in the Greenhouse folder (uses this Mac's Bluetooth — free), plug in a Govee H5151 WiFi gateway (on your wishlist), or open the Govee app on your phone near the sensor to sync once.`
          : `Device ${device.deviceName ?? device.sku} responded without sensor readings. It may be offline or not synced to the cloud.`,
      };
    }

    return {
      ok: true,
      configured: true,
      online: online !== false,
      temperatureF: temperature !== null ? Math.round(temperature * 10) / 10 : null,
      humidity: humidity !== null ? Math.round(humidity) : null,
      deviceName: device.deviceName ?? device.sku,
      sku: device.sku,
      source: "govee",
    };
  } catch (error) {
    return {
      ok: false,
      configured: true,
      message: error instanceof Error ? error.message : "Govee lookup failed",
    };
  }
}

async function resolveDevice(apiKey: string): Promise<GoveeDevice | null> {
  const pinnedDevice = process.env.GOVEE_DEVICE;
  const pinnedSku = process.env.GOVEE_SKU;

  if (pinnedDevice && pinnedSku) {
    return { device: pinnedDevice, sku: pinnedSku };
  }

  if (cachedDevice && Date.now() - cachedDevice.fetchedAt < 60 * 60 * 1000) {
    return cachedDevice.device;
  }

  const response = await fetch("https://openapi.api.govee.com/router/api/v1/user/devices", {
    headers: { "Govee-API-Key": apiKey },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Govee device list returned ${response.status}`);
  }

  const data = await response.json();
  const devices: GoveeDevice[] = data.data ?? [];

  const sensor =
    devices.find((device) => device.type === "devices.types.thermometer") ??
    devices.find((device) => /^H5(0|1)\d/.test(device.sku));

  if (sensor) {
    cachedDevice = { device: sensor, fetchedAt: Date.now() };
  }

  return sensor ?? null;
}
