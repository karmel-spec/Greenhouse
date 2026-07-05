import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { readStore } from "@/lib/store";

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

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({
      ok: true,
      action: "diagnose",
      mode: "mock",
      provider: hermesContext ? "hermes eve" : "local mock",
      message: "OPENAI_API_KEY is not configured, so these are local draft notes without real image recognition.",
      diagnoses: images.map((image) => localDraftDiagnosis(image.fileName)),
    });
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_VISION_MODEL ?? "gpt-5.5",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: buildDiagnosisPrompt(body.context, hermesContext),
            },
            ...images.map((image) => ({
              type: "input_image",
              image_url: image.dataUrl,
            })),
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "garden_photo_batch_diagnosis",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["diagnoses"],
            properties: {
              diagnoses: {
                type: "array",
                minItems: images.length,
                maxItems: images.length,
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: [
                    "file_name",
                    "plant_candidates",
                    "confidence",
                    "zone_guess",
                    "health_status",
                    "visual_signals",
                    "water_recommendation",
                    "sun_recommendation",
                    "pruning_recommendation",
                    "recommended_actions",
                    "needs_human_review",
                  ],
                  properties: {
                    file_name: { type: "string" },
                    plant_candidates: {
                      type: "array",
                      maxItems: 5,
                      items: {
                        type: "object",
                        additionalProperties: false,
                        required: ["name", "confidence", "why"],
                        properties: {
                          name: { type: "string" },
                          confidence: { type: "number", minimum: 0, maximum: 1 },
                          why: { type: "string" },
                        },
                      },
                    },
                    confidence: { type: "number", minimum: 0, maximum: 1 },
                    zone_guess: { type: "string" },
                    health_status: { type: "string", enum: ["Thriving", "Watch", "Needs attention"] },
                    visual_signals: { type: "string" },
                    water_recommendation: { type: "string" },
                    sun_recommendation: { type: "string" },
                    pruning_recommendation: { type: "string" },
                    recommended_actions: { type: "array", items: { type: "string" }, maxItems: 5 },
                    needs_human_review: { type: "boolean" },
                  },
                },
              },
            },
          },
        },
      },
    }),
  });

  const raw = await response.json();

  if (!response.ok) {
    return NextResponse.json(
      {
        error: raw.error?.message ?? "OpenAI diagnosis request failed.",
        provider: "openai",
        raw,
      },
      { status: response.status },
    );
  }

  const outputText = extractOutputText(raw);
  const parsed = safeJsonParse(outputText);

  if (!parsed?.diagnoses) {
    return NextResponse.json(
      {
        error: "OpenAI returned a response, but it did not match the diagnosis schema.",
        provider: "openai",
        raw,
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    action: "diagnose",
    mode: "configured",
    provider: "openai",
    diagnoses: parsed.diagnoses,
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

function buildDiagnosisPrompt(context: unknown, hermesContext: unknown) {
  return [
    "You are Eve, Karmel's careful garden assistant.",
    "Analyze this batch of garden photos. Identify likely plants only as candidates with confidence, never as guaranteed truth.",
    "Diagnose visible plant health signals: water stress, sun stress, crowding, pruning needs, pest/disease signs, and follow-up actions.",
    "Use Karmel-specific context when available, especially known plants, zones, prior corrections, and Orem, Utah seasonality.",
    "If the plant is uncertain, use low confidence, set needs_human_review to true, and avoid overconfident naming.",
    "",
    `App context: ${JSON.stringify(context ?? {})}`,
    `Hermes/Eve knowledge context: ${JSON.stringify(hermesContext ?? {})}`,
  ].join("\n");
}

function localDraftDiagnosis(fileName: string) {
  return {
    file_name: fileName,
    plant_candidates: [],
    confidence: 0,
    zone_guess: "Unassigned zone",
    health_status: "Watch",
    visual_signals: "Local draft only. Add OPENAI_API_KEY for real image recognition and plant health analysis.",
    water_recommendation: "Check soil moisture by touch before watering.",
    sun_recommendation: "Confirm recent sun exposure and watch for curling, bleaching, or stretching.",
    pruning_recommendation: "Do not prune until the plant is identified and stress source is clearer.",
    recommended_actions: ["Label the plant manually.", "Add an OpenAI key to enable vision analysis."],
    needs_human_review: true,
  };
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
