import { NextRequest, NextResponse } from "next/server";
import { getRecentPhotos, getTasksForToday, getZones, logObservation } from "@/lib/eve-tools";

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
  "recent-photos",
  "zones",
  "today-tasks",
  "log-observation",
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

  if (action === "recent-photos") {
    const count = typeof body.count === "number" ? body.count : 5;
    return NextResponse.json(getRecentPhotos(count));
  }

  if (action === "zones") {
    return NextResponse.json(getZones());
  }

  if (action === "today-tasks") {
    return NextResponse.json(getTasksForToday());
  }

  if (action === "log-observation") {
    return NextResponse.json(logObservation(body));
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
