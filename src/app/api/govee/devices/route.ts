import { NextResponse } from "next/server";

/**
 * Debug/discovery endpoint: lists every device on the Govee account so
 * Karmel can find the greenhouse sensor's device id + sku if auto-detect
 * picks the wrong one. Visit /api/govee/devices in the browser.
 */
export async function GET() {
  const apiKey = process.env.GOVEE_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "GOVEE_API_KEY is not set. Add it to .env.local first." },
      { status: 400 },
    );
  }

  const response = await fetch("https://openapi.api.govee.com/router/api/v1/user/devices", {
    headers: { "Govee-API-Key": apiKey },
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return NextResponse.json(
      { error: `Govee returned ${response.status}`, detail: data },
      { status: response.status },
    );
  }

  return NextResponse.json({
    devices: (data?.data ?? []).map((device: Record<string, unknown>) => ({
      deviceName: device.deviceName,
      sku: device.sku,
      device: device.device,
      type: device.type,
    })),
    hint: "Pin the greenhouse sensor with GOVEE_DEVICE=<device> and GOVEE_SKU=<sku> in .env.local.",
  });
}
