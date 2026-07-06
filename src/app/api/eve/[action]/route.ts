import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { readStore } from "@/lib/store";
import { wishlistItems } from "@/lib/mock-data";
import { diagnoseImages } from "@/lib/vision";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatRequest = {
  messages?: ChatMessage[];
};

type DiagnoseImage = {
  fileName: string;
  dataUrl: string;
};

type DiagnoseRequest = {
  images?: DiagnoseImage[];
  context?: Record<string, unknown>;
};

const supportedActions = new Set([
  "chat",
  "daily-plan",
  "plant-advice",
  "seed-advice",
  "diagnose",
  "shopping-list",
  "weekly-review",
]);

export async function POST(request: NextRequest, { params }: { params: Promise<{ action: string }> }) {
  const { action } = await params;

  if (!supportedActions.has(action)) {
    return NextResponse.json({ error: "Unsupported Eve action" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));

  if (action === "diagnose") {
    return diagnosePlants(body as DiagnoseRequest);
  }

  if (action === "chat") {
    return chatWithEve(body as ChatRequest);
  }

  return NextResponse.json({
    ok: true,
    action,
    mode: "mock",
    received: body,
    message:
      "Eve is connected to mock data for now. This route is ready to be wired to OpenAI, Supabase, Firebase, image storage, and garden records.",
    suggestions: [
      "Water greenhouse herbs before the warmest part of the day.",
      "Rotate microgreens trays after lunch.",
      "Take a progress photo so Eve can compare growth over time.",
    ],
  });
}

async function diagnosePlants(body: DiagnoseRequest) {
  const images = Array.isArray(body.images) ? body.images : [];
  if (!images.length) {
    return NextResponse.json({ error: "No images were provided for diagnosis." }, { status: 400 });
  }

  const hermesContext = await getHermesGardenContext(body.context);
  const result = await diagnoseImages(images, body.context ?? {}, hermesContext);

  if (result.mode === "error") {
    return NextResponse.json({ error: result.error, provider: result.provider }, { status: result.status });
  }

  return NextResponse.json({
    ok: true,
    action: "diagnose",
    mode: result.mode,
    provider: result.provider,
    ...(result.mode === "mock" ? { message: result.message } : {}),
    diagnoses: result.diagnoses,
  });
}

async function chatWithEve(body: ChatRequest) {
  const incoming = Array.isArray(body.messages) ? body.messages : [];
  const messages = incoming
    .filter(
      (message): message is ChatMessage =>
        !!message &&
        (message.role === "user" || message.role === "assistant") &&
        typeof message.content === "string" &&
        message.content.trim().length > 0,
    )
    .slice(-20);

  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return NextResponse.json({ error: "Send at least one user message." }, { status: 400 });
  }

  const system = await buildEveSystemPrompt();

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const anthropic = new Anthropic();
      const response = await anthropic.messages.create({
        model: process.env.EVE_ANTHROPIC_MODEL ?? "claude-opus-4-8",
        max_tokens: 1024,
        system,
        messages,
      });

      const reply = response.content
        .filter((block) => block.type === "text")
        .map((block) => block.text)
        .join("\n")
        .trim();

      if (response.stop_reason === "refusal" || !reply) {
        return NextResponse.json({
          ok: true,
          mode: "configured",
          provider: "anthropic",
          reply: "I can't help with that one — ask me anything about the garden instead.",
        });
      }

      return NextResponse.json({ ok: true, mode: "configured", provider: "anthropic", reply });
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Anthropic request failed.", provider: "anthropic" },
        { status: 502 },
      );
    }
  }

  if (process.env.OPENAI_API_KEY) {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_CHAT_MODEL ?? process.env.OPENAI_VISION_MODEL ?? "gpt-5.5",
        instructions: system,
        input: messages.map((message) => ({ role: message.role, content: message.content })),
      }),
    });

    const raw = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: raw.error?.message ?? "OpenAI chat request failed.", provider: "openai" },
        { status: response.status },
      );
    }

    return NextResponse.json({
      ok: true,
      mode: "configured",
      provider: "openai",
      reply: extractOutputText(raw).trim(),
    });
  }

  return NextResponse.json({
    ok: true,
    mode: "mock",
    provider: "local mock",
    reply:
      "I'm running without an AI key right now, so here's my standing advice: water before the heat of the day, " +
      "rotate the microgreens trays after lunch, and snap one progress photo tonight. " +
      "Add ANTHROPIC_API_KEY (or OPENAI_API_KEY) to .env.local and I'll answer for real.",
  });
}

async function buildEveSystemPrompt() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Denver",
  });

  let taskLines = "";
  let plantLines = "";
  try {
    const store = await readStore();
    taskLines = store.tasks
      .map((task) => `- [${task.done ? "done" : "open"}] ${task.title} (${task.time}, ${task.priority})`)
      .join("\n");
    plantLines = store.plants
      .map(
        (plant) =>
          `- ${plant.name}${plant.variety ? ` (${plant.variety})` : ""} — ${plant.zone}, health: ${plant.health}`,
      )
      .join("\n");
  } catch {
    taskLines = "(task list unavailable)";
  }

  return [
    "You are Eve, the garden assistant inside Karmel's Greenhouse Growth Operating System.",
    "Karmel gardens in Orem, Utah (high desert, USDA zone ~6b) with a backyard greenhouse, microgreens trays, propagation shelf, and themed garden zones.",
    "Be warm, encouraging, and practical. Keep answers short — a few sentences or a tight list. Ground advice in Utah seasonality and what's actually in the garden.",
    "If asked about plant identification from photos, point Karmel to the Photo Journal, which does real vision diagnosis.",
    "",
    `Today is ${today}.`,
    "Current garden plan:",
    taskLines,
    "",
    plantLines
      ? `Karmel's plant library (from her own photo uploads):\n${plantLines}`
      : "Known plants: Lavender (English, Apothecary Garden), Basil (Genovese, rooting on Propagation Shelf), Chamomile (German, Tea Garden), Tomato (Brandywine, Greenhouse), Peppermint (Herb Garden).",
    "",
    `Wishlist (wanted, not yet owned): ${wishlistItems
      .map((item) => `${item.name} (${item.price}, ${item.priority} priority, for ${item.category})`)
      .join("; ")}.`,
  ].join("\n");
}

async function getHermesGardenContext(context: unknown) {
  if (!process.env.HERMES_EVE_CONTEXT_URL) return null;

  try {
    const response = await fetch(process.env.HERMES_EVE_CONTEXT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.HERMES_EVE_API_KEY ? { Authorization: `Bearer ${process.env.HERMES_EVE_API_KEY}` } : {}),
      },
      body: JSON.stringify({ context }),
    });

    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

function extractOutputText(raw: { output_text?: string; output?: Array<{ content?: Array<{ text?: string }> }> }) {
  if (raw.output_text) return raw.output_text;

  return raw.output
    ?.flatMap((item) => item.content ?? [])
    .map((content) => content.text)
    .filter(Boolean)
    .join("\n") ?? "";
}

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
