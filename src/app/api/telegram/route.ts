import { NextRequest, NextResponse } from "next/server";

/**
 * Eve's Telegram webhook — the Mac-free replacement for
 * scripts/telegram-eve-bridge.py. Telegram POSTs every message sent to
 * @evelarsonbot here; Eve files photos in the Photo Journal (with vision ID),
 * runs garden commands as tool calls, and answers everything else herself.
 *
 * Netlify env vars:
 *   TELEGRAM_BOT_TOKEN       — from @BotFather (required)
 *   TELEGRAM_WEBHOOK_SECRET  — random string; must match the secret_token
 *                              given to Telegram's setWebhook (required)
 *   TELEGRAM_ALLOWED_USERNAMES — optional comma-separated allowlist; when set,
 *                              only these Telegram usernames can use Eve
 *   OPENAI_API_KEY           — Eve's brain for text commands (already set)
 *
 * Register (one-time, after deploy):
 *   https://api.telegram.org/bot<TOKEN>/setWebhook?url=<site>/api/telegram&secret_token=<SECRET>
 */

export const maxDuration = 26;

const TG = () => `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

type TelegramMessage = {
  message_id?: number;
  text?: string;
  caption?: string;
  photo?: { file_id: string }[];
  chat?: { id: number };
  from?: { first_name?: string; username?: string };
};

async function send(chatId: number, text: string) {
  await fetch(`${TG()}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: text.slice(0, 4000) }),
  }).catch(() => {});
}

/** Call this same deployment's own API routes, reusing all their validation. */
async function appCall(origin: string, method: string, path: string, payload?: object) {
  const response = await fetch(`${origin}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: payload !== undefined ? JSON.stringify(payload) : undefined,
  });
  return response.json().catch(() => ({}));
}

// ---------------------------- Eve's tools ----------------------------------

const TOOLS = [
  { type: "function", function: {
    name: "add_seed_packet",
    description: "Add a seed packet to the Seed Library",
    parameters: { type: "object", properties: {
      commonName: { type: "string" }, variety: { type: "string" },
      seedCount: { type: "number" }, germinationRate: { type: "number" },
      packagedYear: { type: "number" }, daysToGermination: { type: "number" },
      daysToMaturity: { type: "number" }, notes: { type: "string" },
      isHeirloom: { type: "boolean" }, isAnnual: { type: "boolean" },
    }, required: ["commonName"] } } },
  { type: "function", function: {
    name: "start_microgreens_tray",
    description: "Start a live microgreens tray with a harvest countdown",
    parameters: { type: "object", properties: {
      name: { type: "string", description: "e.g. Radish, Pea Shoots" },
      harvestDays: { type: "number" },
    }, required: ["name"] } } },
  { type: "function", function: {
    name: "create_seed_tray",
    description: "Create a seed-starting tray grid (72=6x12, 50=5x10, 32=4x8, 18=3x6 cells)",
    parameters: { type: "object", properties: {
      name: { type: "string" }, rows: { type: "number" }, cols: { type: "number" },
    }, required: ["name"] } } },
  { type: "function", function: {
    name: "add_task",
    description: "Add a task to today's garden list",
    parameters: { type: "object", properties: {
      title: { type: "string" }, time: { type: "string" },
      priority: { type: "string", enum: ["High", "Medium", "Low"] },
    }, required: ["title"] } } },
  { type: "function", function: {
    name: "add_wishlist_item",
    description: "Pin an item to the garden wishlist boards",
    parameters: { type: "object", properties: {
      name: { type: "string" }, category: { type: "string", description: "e.g. Tools Wishlist, Plant Wishlist, Grandkids Fun Wishlist" },
      price: { type: "string" }, note: { type: "string" },
    }, required: ["name"] } } },
  { type: "function", function: {
    name: "start_quart_jar",
    description: "Start a quart jar kratky hydroponic grow (lettuce, basil, etc.)",
    parameters: { type: "object", properties: {
      plant: { type: "string" }, variety: { type: "string" },
      daysToHarvest: { type: "number" },
    }, required: ["plant"] } } },
  { type: "function", function: {
    name: "add_propagation_start",
    description: "Put a new cutting/start into the next open spot on the 10-spot propagation station",
    parameters: { type: "object", properties: {
      plant: { type: "string" }, method: { type: "string", description: "e.g. stem cutting in water" },
    }, required: ["plant"] } } },
  { type: "function", function: {
    name: "record_meal",
    description: "Record a garden-fed meal in the Culinary Garden Journal",
    parameters: { type: "object", properties: {
      dish: { type: "string" },
      ingredients: { type: "array", items: { type: "string" } },
      mealCost: { type: "string" }, storeCost: { type: "string" },
      insight: { type: "string" },
    }, required: ["dish"] } } },
];

const MICRO_DAYS: Record<string, number> = {
  radish: 8, arugula: 9, mustard: 9, broccoli: 10, kale: 10, mizuna: 10,
  cabbage: 10, kohlrabi: 10, wheatgrass: 10, pea: 12, sunflower: 12,
  amaranth: 12, beet: 14, chard: 14, cilantro: 16, basil: 18,
};

async function runTool(origin: string, name: string, args: Record<string, unknown>): Promise<string> {
  if (name === "add_seed_packet") {
    const result = await appCall(origin, "POST", "/api/seeds", args);
    const packet = result.packet ?? {};
    return `🌱 Added "${packet.commonName ?? args.commonName}" to the Seed Library (${packet.seedCount} seeds, ${packet.germinationRate}% germination).`;
  }
  if (name === "start_microgreens_tray") {
    const trayName = String(args.name ?? "");
    const days = Number(args.harvestDays) || MICRO_DAYS[trayName.trim().toLowerCase().split(/\s+/)[0]] || 10;
    await appCall(origin, "POST", "/api/trays", { name: trayName, harvestDays: days });
    return `🌿 Started a ${trayName} microgreens tray — harvest countdown ${days} days.`;
  }
  if (name === "create_seed_tray") {
    const rows = Number(args.rows) || 6;
    const cols = Number(args.cols) || 12;
    await appCall(origin, "POST", "/api/seedtrays", { name: args.name, rows, cols });
    return `🧫 Created seed tray "${args.name}" (${rows * cols} cells). Open Seed Trays in the app to sow it.`;
  }
  if (name === "add_task") {
    await appCall(origin, "POST", "/api/tasks", { title: args.title, time: args.time ?? "Anytime", priority: args.priority ?? "Medium" });
    return `✅ Task added: ${args.title}`;
  }
  if (name === "add_wishlist_item") {
    await appCall(origin, "POST", "/api/wishlist", { name: args.name, category: args.category ?? "General", price: args.price ?? "—", note: args.note });
    return `🛒 Pinned to the wishlist: ${args.name}`;
  }
  if (name === "start_quart_jar") {
    await appCall(origin, "POST", "/api/hydrojars", { plant: args.plant, variety: args.variety, daysToHarvest: args.daysToHarvest });
    return `🫙 Quart jar started: ${args.plant}. Tap the jar in the app when the water level drops.`;
  }
  if (name === "add_propagation_start") {
    const current = await appCall(origin, "GET", "/api/propstarts");
    const spots: unknown[] = Array.isArray(current.spots) ? current.spots : [];
    const spot = spots.findIndex((candidate) => candidate === null);
    if (spot === -1) return "🌱 The propagation station is full (10/10) — clear a spot in the app first.";
    await appCall(origin, "POST", "/api/propstarts", { spot, plant: args.plant, method: args.method });
    return `🌱 ${args.plant} is rooting in spot ${spot + 1} of the propagation station.`;
  }
  if (name === "record_meal") {
    await appCall(origin, "POST", "/api/culinary", args);
    return `🍽️ Filed in the Culinary Journal: ${args.dish}. The garden fed you again.`;
  }
  return "I couldn't run that action.";
}

// ---------------------------- handlers -------------------------------------

async function handleText(origin: string, chatId: number, text: string) {
  if (!process.env.OPENAI_API_KEY) {
    await send(chatId, "My thinking key isn't configured on the site yet, so I can only file photos right now.");
    return;
  }
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: process.env.OPENAI_CHAT_MODEL || "gpt-5.5",
        messages: [
          { role: "system", content:
            "You are Eve, the assistant inside Karmel's Greenhouse Growth Operating System (Orem, Utah, zone 6b). " +
            "When her message is an instruction to record something, call the matching tool (fill sensible defaults). " +
            "Otherwise answer warmly and briefly (under 120 words) as her garden companion." },
          { role: "user", content: text },
        ],
        tools: TOOLS,
      }),
    });
    const raw = await response.json();
    if (!response.ok) {
      await send(chatId, `I hit a snag thinking (${raw.error?.message ?? response.status}). Try again in a minute.`);
      return;
    }
    const message = raw.choices?.[0]?.message ?? {};
    const calls: { function: { name: string; arguments: string } }[] = message.tool_calls ?? [];
    if (calls.length) {
      for (const call of calls) {
        try {
          const args = JSON.parse(call.function.arguments || "{}");
          await send(chatId, await runTool(origin, call.function.name, args));
        } catch {
          await send(chatId, "That action failed on my end — try rephrasing, or do it in the app.");
        }
      }
    } else {
      await send(chatId, message.content || "🌿");
    }
  } catch {
    await send(chatId, "I hit a snag talking to my brain. Try again in a minute.");
  }
}

async function handlePhoto(origin: string, chatId: number, message: TelegramMessage) {
  const photos = message.photo ?? [];
  if (!photos.length) return;
  await send(chatId, "📸 Got it — filing this in the Photo Journal and taking a look…");
  try {
    const fileId = photos[photos.length - 1].file_id; // largest size
    const info = await fetch(`${TG()}/getFile?file_id=${encodeURIComponent(fileId)}`).then((r) => r.json());
    const filePath = info.result?.file_path;
    if (!filePath) throw new Error("no file path");
    const bytes = await fetch(`https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${filePath}`).then((r) => r.arrayBuffer());
    const dataUrl = `data:image/jpeg;base64,${Buffer.from(bytes).toString("base64")}`;

    const caption = (message.caption ?? "").trim();
    const fileName = `telegram-${message.message_id ?? Date.now()}.jpg`;
    await appCall(origin, "POST", "/api/journal", {
      entry: {
        fileName,
        plant: "Unidentified plant",
        zone: caption || "Unassigned zone",
        health: "Watch",
        identificationStatus: "Needs ID",
        signal: "Sent from Telegram — awaiting identification.",
        water: "", sun: "", pruning: "", recommendation: "",
        recordedAt: new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Denver" }),
      },
      photoDataUrl: dataUrl,
    });

    // Vision pass — the new photo is the only unprocessed target.
    await appCall(origin, "POST", "/api/journal/process-all", { limit: 3 });
    const entries: { fileName?: string; plant?: string; health?: string; recommendation?: string; signal?: string }[] =
      (await appCall(origin, "GET", "/api/journal")).entries ?? [];
    const newest = entries.find((candidate) => candidate.fileName === fileName);
    if (newest?.plant && newest.plant !== "Unidentified plant") {
      await send(chatId,
        `🔍 Looks like ${newest.plant} (${newest.health ?? "Watch"}).\n` +
        `${newest.recommendation || newest.signal || ""}\n` +
        `Filed in the Photo Journal${caption ? ` under ${caption}` : ""} — add it to the Plant Library from the app if it's a keeper.`);
    } else {
      await send(chatId, "Filed in the Photo Journal. I couldn't confidently identify it — open the app to label it, and caption future photos with the zone name to file them faster.");
    }
  } catch {
    await send(chatId, "The photo didn't make it through — try sending it again.");
  }
}

// ---------------------------- webhook entry --------------------------------

export async function GET() {
  return NextResponse.json({
    telegram: Boolean(process.env.TELEGRAM_BOT_TOKEN),
    secured: Boolean(process.env.TELEGRAM_WEBHOOK_SECRET),
  });
}

export async function POST(request: NextRequest) {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Telegram is not configured on this deployment." }, { status: 503 });
  }
  if (request.headers.get("x-telegram-bot-api-secret-token") !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Bad secret." }, { status: 401 });
  }

  const update = await request.json().catch(() => ({}));
  const message: TelegramMessage = update.message ?? {};
  const chatId = message.chat?.id;
  if (!chatId) return NextResponse.json({ ok: true });

  const allowlist = (process.env.TELEGRAM_ALLOWED_USERNAMES ?? "")
    .split(",")
    .map((name) => name.trim().replace(/^@/, "").toLowerCase())
    .filter(Boolean);
  if (allowlist.length && !allowlist.includes((message.from?.username ?? "").toLowerCase())) {
    await send(chatId, "🌿 This is Karmel's private garden assistant — I only chat with her.");
    return NextResponse.json({ ok: true });
  }

  const origin = new URL(request.url).origin;
  try {
    if (message.photo?.length) await handlePhoto(origin, chatId, message);
    else if (message.text) await handleText(origin, chatId, message.text);
  } catch {
    // Always 200 so Telegram doesn't retry-flood; errors were already messaged.
  }
  return NextResponse.json({ ok: true });
}
