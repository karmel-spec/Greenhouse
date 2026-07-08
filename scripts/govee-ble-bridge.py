#!/usr/bin/env python3
"""
Greenhouse Bluetooth bridge.

Listens for the Govee H5075 thermometer's Bluetooth advertisements from this
Mac and posts each fresh reading to the garden app at
http://localhost:3005/api/govee/local — so the dashboard shows live
greenhouse temperature and humidity without a WiFi gateway or phone.

Run it via "Greenhouse Bluetooth Bridge.command" (double-click in Finder).
Leave the Terminal window open; Ctrl+C stops it.
"""

import asyncio
import json
import sys
import time
import urllib.request
from pathlib import Path

from bleak import BleakScanner


def read_env():
    env = {}
    path = Path(__file__).resolve().parent.parent / ".env.local"
    if path.exists():
        for line in path.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, _, value = line.partition("=")
                env[key.strip()] = value.strip()
    return env


# Readings go to the app on this Mac, and — if GARDEN_APP_URL is set in
# .env.local (your live site, e.g. https://your-site.netlify.app) — to the
# live site too, so the dashboard works away from home.
APP_URLS = ["http://localhost:3005/api/govee/local"]
_live = read_env().get("GARDEN_APP_URL", "").rstrip("/")
if _live:
    APP_URLS.append(f"{_live}/api/govee/local")

POST_EVERY_SECONDS = 30
GOVEE_MFG_KEY = 0xEC88  # manufacturer-data key used by Govee H5075 adverts

latest = {}
last_post = 0.0
last_heard = 0.0


def decode_h5075(mfg: bytes):
    """Temp/humidity are packed into a 24-bit int in the advertisement."""
    if len(mfg) < 5:
        return None
    raw = int.from_bytes(mfg[1:4], "big")
    negative = bool(raw & 0x800000)
    if negative:
        raw &= 0x7FFFFF
    temp_c = (raw // 1000) / 10 * (-1 if negative else 1)
    humidity = (raw % 1000) / 10
    battery = mfg[4]
    if not (-40 <= temp_c <= 80 and 0 <= humidity <= 100):
        return None
    return temp_c, humidity, battery


def on_advert(device, adv):
    global latest, last_heard
    name = adv.local_name or device.name or ""
    data = adv.manufacturer_data.get(GOVEE_MFG_KEY)
    if not data and not name.startswith(("GVH", "Govee")):
        return
    if not data:
        return
    decoded = decode_h5075(bytes(data))
    if not decoded:
        return
    temp_c, humidity, battery = decoded
    latest = {
        "tempC": temp_c,
        "tempF": round(temp_c * 9 / 5 + 32, 1),
        "humidity": humidity,
        "battery": battery,
        "rssi": adv.rssi,
        "name": name or "Govee H5075",
        "address": device.address,
    }
    last_heard = time.time()


def post_reading():
    global last_post
    if not latest or time.time() - last_post < POST_EVERY_SECONDS:
        return
    delivered = []
    for url in APP_URLS:
        try:
            request = urllib.request.Request(
                url,
                data=json.dumps(latest).encode(),
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            urllib.request.urlopen(request, timeout=10)
            delivered.append("live site" if url.startswith("https") else "local app")
        except Exception:
            pass
    last_post = time.time()  # don't spam retries every second
    if delivered:
        print(
            f"  ✓ {time.strftime('%H:%M:%S')}  {latest['tempF']}°F · {latest['humidity']}% humidity"
            f" · battery {latest['battery']}% · signal {latest['rssi']} dBm → sent to {' + '.join(delivered)}"
        )
    else:
        print(
            "  … heard the sensor but couldn't deliver the reading. Start the garden app on this Mac, "
            "or set GARDEN_APP_URL=https://your-site.netlify.app in .env.local to send straight to the live site."
        )


async def main():
    print("Greenhouse Bluetooth bridge")
    print("Listening for the Govee thermometer… (leave this window open, Ctrl+C to stop)")
    print("If macOS asks about Bluetooth access, click Allow.\n")

    scanner = BleakScanner(on_advert)
    await scanner.start()
    quiet_since = time.time()
    try:
        while True:
            await asyncio.sleep(2)
            post_reading()
            if latest:
                quiet_since = time.time()
            elif time.time() - quiet_since > 60:
                print(
                    "  Nothing heard in 60s. The sensor may be out of Bluetooth range of this Mac — "
                    "try moving the Mac closer to the greenhouse, or use the H5151 WiFi gateway."
                )
                quiet_since = time.time()
    finally:
        await scanner.stop()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nBridge stopped.")
        sys.exit(0)
