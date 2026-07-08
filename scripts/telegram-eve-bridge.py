#!/usr/bin/env python3
"""
Eve's Telegram bridge.

Message Eve from your phone; she updates the garden app running on this Mac.

  "Add a seed packet: Genovese basil, 200 seeds, germination 90%"  → Seed Library
  "Start a radish microgreens tray"                                → Microgreens Studio
  "New 72-cell seed tray called March starts"                      → Seed Trays
  "Add a task: water the ferns tonight, high priority"             → Today's list
  "Wishlist: copper plant labels, about $15"                       → Wishlist
  send a photo (optionally captioned with the zone)                → Photo Journal + AI identify
  anything else                                                    → Eve answers as herself

Needs in .env.local: TELEGRAM_BOT_TOKEN (from @BotFather) and OPENAI_API_KEY.
Run via "Eve Telegram Bridge.command" and leave the window open.
Pure standard library — nothing to install.
"""

import base64
import json
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def read_env():
    env = {}
    path = ROOT / ".env.local"
    if path.exists():
        for line in path.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, _, value = line.partition("=")
                env[key.strip()] = value.strip()
    return env


ENV = read_env()
TOKEN = ENV.get("TELEGRAM_BOT_TOKEN", "")
OPENAI_KEY = ENV.get("OPENAI_API_KEY", "")
# Prefer the live site (GARDEN_APP_URL in .env.local) so Eve's updates land in
# the cloud store your phone sees; fall back to the app on this Mac.
APP = ENV.get("GARDEN_APP_URL", "").rstrip("/") or "http://localhost:3005"
TG = f"https://api.telegram.org/bot{TOKEN}"


def http_json(url, payload=None, headers=None, timeout=60):
    data = json.dumps(payload).encode() if payload is not None else None
    request = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json", **(headers or {})})
    with urllib.request.urlopen(request, timeout=timeout) as response:
        return json.load(response)


def app_call(method, path, payload=None):
    request = urllib.request.Request(
        f"{APP}{path}",
        data=json.dumps(payload).encode() if payload is not None else None,
        headers={"Content-Type": "application/json"},
        method=method,
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.load(response)


def send(chat_id, text):
    try:
        http_json(f"{TG}/sendMessage", {"chat_id": chat_id, "text": text[:4000]})
    except Exception as error:
        print("  ! sendMessage failed:", error)


# ---------------------------- Eve's tools ----------------------------------

TOOLS = [
    {"type": "function", "function": {
        "name": "add_seed_packet",
        "description": "Add a seed packet to the Seed Library",
        "parameters": {"type": "object", "properties": {
            "commonName": {"type": "string"}, "variety": {"type": "string"},
            "seedCount": {"type": "number"}, "germinationRate": {"type": "number"},
            "packagedYear": {"type": "number"}, "daysToGermination": {"type": "number"},
            "daysToMaturity": {"type": "number"}, "notes": {"type": "string"},
            "isHeirloom": {"type": "boolean"}, "isAnnual": {"type": "boolean"},
        }, "required": ["commonName"]}}},
    {"type": "function", "function": {
        "name": "start_microgreens_tray",
        "description": "Start a live microgreens tray with a harvest countdown",
        "parameters": {"type": "object", "properties": {
            "name": {"type": "string", "description": "e.g. Radish, Pea Shoots"},
            "harvestDays": {"type": "number"},
        }, "required": ["name"]}}},
    {"type": "function", "function": {
        "name": "create_seed_tray",
        "description": "Create a seed-starting tray grid (72=6x12, 50=5x10, 32=4x8, 18=3x6 cells)",
        "parameters": {"type": "object", "properties": {
            "name": {"type": "string"}, "rows": {"type": "number"}, "cols": {"type": "number"},
        }, "required": ["name"]}}},
    {"type": "function", "function": {
        "name": "add_task",
        "description": "Add a task to today's garden list",
        "parameters": {"type": "object", "properties": {
            "title": {"type": "string"}, "time": {"type": "string"},
            "priority": {"type": "string", "enum": ["High", "Medium", "Low"]},
        }, "required": ["title"]}}},
    {"type": "function", "function": {
        "name": "add_wishlist_item",
        "description": "Add an item to the garden wishlist",
        "parameters": {"type": "object", "properties": {
            "name": {"type": "string"}, "category": {"type": "string"},
            "price": {"type": "string"}, "note": {"type": "string"},
        }, "required": ["name"]}}},
]

MICRO_DAYS = {"radish": 8, "arugula": 9, "mustard": 9, "broccoli": 10, "kale": 10, "mizuna": 10,
              "cabbage": 10, "kohlrabi": 10, "wheatgrass": 10, "pea": 12, "sunflower": 12,
              "amaranth": 12, "beet": 14, "chard": 14, "cilantro": 16, "basil": 18}


def run_tool(name, args):
    if name == "add_seed_packet":
        result = app_call("POST", "/api/seeds", args)
        packet = result.get("packet", {})
        return f"🌱 Added \"{packet.get('commonName', '?')}{' ' + repr(packet.get('variety')) if packet.get('variety') else ''}\" to the Seed Library ({packet.get('seedCount')} seeds, {packet.get('germinationRate')}% germination)."
    if name == "start_microgreens_tray":
        days = args.get("harvestDays") or MICRO_DAYS.get(args.get("name", "").strip().lower().split()[0], 10)
        app_call("POST", "/api/trays", {"name": args["name"], "harvestDays": days})
        return f"🌿 Started a {args['name']} microgreens tray — harvest countdown {days} days."
    if name == "create_seed_tray":
        rows, cols = int(args.get("rows") or 6), int(args.get("cols") or 12)
        app_call("POST", "/api/seedtrays", {"name": args["name"], "rows": rows, "cols": cols})
        return f"🧫 Created seed tray \"{args['name']}\" ({rows * cols} cells). Open Seed Trays in the app to sow it."
    if name == "add_task":
        app_call("POST", "/api/tasks", {"title": args["title"], "time": args.get("time") or "Anytime", "priority": args.get("priority") or "Medium"})
        return f"✅ Task added: {args['title']}"
    if name == "add_wishlist_item":
        app_call("POST", "/api/wishlist", {"name": args["name"], "category": args.get("category") or "General", "price": args.get("price") or "—", "note": args.get("note")})
        return f"🛒 Wishlisted: {args['name']}"
    return "I couldn't run that action."


def handle_text(chat_id, text):
    if not OPENAI_KEY:
        send(chat_id, "OPENAI_API_KEY is missing in .env.local, so I can only file photos right now.")
        return
    try:
        response = http_json(
            "https://api.openai.com/v1/chat/completions",
            {
                "model": "gpt-5.5",
                "messages": [
                    {"role": "system", "content":
                        "You are Eve, the assistant inside Karmel's Greenhouse Growth Operating System (Orem, Utah, zone 6b). "
                        "When her message is an instruction to record something, call the matching tool (fill sensible defaults). "
                        "Otherwise answer warmly and briefly (under 120 words) as her garden companion."},
                    {"role": "user", "content": text},
                ],
                "tools": TOOLS,
            },
            headers={"Authorization": f"Bearer {OPENAI_KEY}"},
        )
        message = response["choices"][0]["message"]
        calls = message.get("tool_calls") or []
        if calls:
            for call in calls:
                args = json.loads(call["function"]["arguments"] or "{}")
                try:
                    send(chat_id, run_tool(call["function"]["name"], args))
                except Exception as error:
                    send(chat_id, f"That action failed ({error}). Is the garden app running on the Mac?")
        else:
            send(chat_id, message.get("content") or "🌿")
    except Exception as error:
        send(chat_id, f"I hit a snag talking to my brain ({error}). Try again in a minute.")


def handle_photo(chat_id, message):
    photos = message.get("photo") or []
    if not photos:
        return
    send(chat_id, "📸 Got it — filing this in the Photo Journal and taking a look…")
    try:
        file_id = photos[-1]["file_id"]  # largest size
        info = http_json(f"{TG}/getFile?file_id={urllib.parse.quote(file_id)}")
        file_path = info["result"]["file_path"]
        with urllib.request.urlopen(f"https://api.telegram.org/file/bot{TOKEN}/{file_path}", timeout=60) as response:
            raw = response.read()
        data_url = "data:image/jpeg;base64," + base64.b64encode(raw).decode()
        caption = (message.get("caption") or "").strip()
        entry = {
            "fileName": f"telegram-{message.get('message_id')}.jpg",
            "plant": "Unidentified plant",
            "zone": caption if caption else "Unassigned zone",
            "health": "Watch",
            "identificationStatus": "Needs ID",
            "signal": "Sent from Telegram — awaiting identification.",
            "water": "", "sun": "", "pruning": "",
            "recommendation": "",
            "recordedAt": time.strftime("%b %d, %Y, %I:%M %p"),
        }
        app_call("POST", "/api/journal", {"entry": entry, "photoDataUrl": data_url})
        # Run the vision pass; the new photo is the only unprocessed target.
        result = app_call("POST", "/api/journal/process-all", {"limit": 3})
        entries = app_call("GET", "/api/journal").get("entries", [])
        newest = next((candidate for candidate in entries if candidate.get("fileName") == entry["fileName"]), None)
        if newest and newest.get("plant") and newest["plant"] != "Unidentified plant":
            send(chat_id,
                 f"🔍 Looks like **{newest['plant']}** ({newest.get('health', 'Watch')}).\n"
                 f"{newest.get('recommendation') or newest.get('signal') or ''}\n"
                 f"Filed in the Photo Journal{f' under {caption}' if caption else ''} — add it to the Plant Library from the app if it's a keeper.")
        else:
            send(chat_id, "Filed in the Photo Journal. I couldn't confidently identify it — open the app to label it, and caption future photos with the zone name to file them faster.")
        _ = result
    except Exception as error:
        send(chat_id, f"The photo didn't make it ({error}). Is the garden app running on the Mac?")


def main():
    if not TOKEN:
        print("No TELEGRAM_BOT_TOKEN in .env.local yet.")
        print("1) In Telegram, message @BotFather → /newbot → name it (e.g. KarmelsGreenhouseBot)")
        print("2) Paste the token into .env.local as TELEGRAM_BOT_TOKEN=...")
        print("3) Run this bridge again, then send your bot a message.")
        sys.exit(1)

    me = http_json(f"{TG}/getMe")["result"]
    print(f"Eve's Telegram bridge is live as @{me['username']} — message her from your phone!")
    print("Leave this window open; Ctrl+C stops the bridge.\n")

    offset = 0
    while True:
        try:
            updates = http_json(f"{TG}/getUpdates?timeout=50&offset={offset}", timeout=70)["result"]
        except Exception as error:
            print("  … reconnecting:", error)
            time.sleep(5)
            continue
        for update in updates:
            offset = update["update_id"] + 1
            message = update.get("message") or {}
            chat_id = (message.get("chat") or {}).get("id")
            if not chat_id:
                continue
            who = (message.get("from") or {}).get("first_name", "?")
            if message.get("photo"):
                print(f"[{time.strftime('%H:%M')}] photo from {who}")
                handle_photo(chat_id, message)
            elif message.get("text"):
                print(f"[{time.strftime('%H:%M')}] {who}: {message['text'][:70]}")
                handle_text(chat_id, message["text"])


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nBridge stopped.")
