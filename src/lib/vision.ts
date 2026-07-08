/**
 * Shared plant-vision diagnosis: sends a batch of images to OpenAI vision and
 * returns structured per-photo diagnoses. Used by the Photo Journal upload
 * route and the bulk "process all" route.
 */

export type DiagnoseImage = { fileName: string; dataUrl: string };

/**
 * Catch the classic env mix-up before it becomes OpenAI's cryptic
 * "Your authentication token is not from a valid issuer": a Supabase key
 * (a JWT starting "eyJ" or "sb_...") or an Anthropic key pasted into
 * OPENAI_API_KEY. Returns a human fix-it message, or null if the key looks right.
 */
export function openaiKeyProblem(): string | null {
  const key = process.env.OPENAI_API_KEY ?? "";
  if (!key) return null; // "not configured" is handled separately
  if (key.startsWith("eyJ") || key.startsWith("sb_")) {
    return "OPENAI_API_KEY is set to a Supabase key (it looks like a JWT). Swap in your real OpenAI key (starts with sk-) — the Supabase key belongs in SUPABASE_SERVICE_KEY.";
  }
  if (key.startsWith("sk-ant-")) {
    return "OPENAI_API_KEY is set to an Anthropic key (sk-ant-...). That belongs in ANTHROPIC_API_KEY; vision needs a real OpenAI key (starts with sk-).";
  }
  if (!key.startsWith("sk-")) {
    return "OPENAI_API_KEY doesn't look like an OpenAI key (they start with sk-). Double-check the value in your environment settings.";
  }
  return null;
}

export type Diagnosis = {
  file_name: string;
  plant_candidates: { name: string; confidence: number; why: string }[];
  confidence: number;
  zone_guess: string;
  health_status: "Thriving" | "Watch" | "Needs attention";
  visual_signals: string;
  water_recommendation: string;
  sun_recommendation: string;
  pruning_recommendation: string;
  recommended_actions: string[];
  needs_human_review: boolean;
};

export type DiagnoseResult =
  | { mode: "configured"; provider: "openai"; diagnoses: Diagnosis[] }
  | { mode: "mock"; provider: string; diagnoses: Diagnosis[]; message: string }
  | { mode: "error"; provider: string; error: string; status: number };

export async function diagnoseImages(
  images: DiagnoseImage[],
  context: Record<string, unknown> = {},
  hermesContext: unknown = null,
): Promise<DiagnoseResult> {
  if (!images.length) {
    return { mode: "error", provider: "none", error: "No images were provided.", status: 400 };
  }

  const keyProblem = openaiKeyProblem();
  if (keyProblem) {
    return { mode: "error", provider: "openai", error: keyProblem, status: 401 };
  }

  if (!process.env.OPENAI_API_KEY) {
    return {
      mode: "mock",
      provider: hermesContext ? "hermes eve" : "local mock",
      message: "OPENAI_API_KEY is not configured, so these are local draft notes without real image recognition.",
      diagnoses: images.map((image) => localDraftDiagnosis(image.fileName)),
    };
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
            { type: "input_text", text: buildDiagnosisPrompt(context, hermesContext) },
            ...images.map((image) => ({ type: "input_image", image_url: image.dataUrl })),
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
    return {
      mode: "error",
      provider: "openai",
      error: raw.error?.message ?? "OpenAI diagnosis request failed.",
      status: response.status,
    };
  }

  const parsed = safeJsonParse(extractOutputText(raw));
  if (!parsed?.diagnoses) {
    return {
      mode: "error",
      provider: "openai",
      error: "OpenAI returned a response, but it did not match the diagnosis schema.",
      status: 502,
    };
  }

  return { mode: "configured", provider: "openai", diagnoses: parsed.diagnoses };
}

export function buildDiagnosisPrompt(context: unknown, hermesContext: unknown) {
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

export function localDraftDiagnosis(fileName: string): Diagnosis {
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
  return (
    raw.output
      ?.flatMap((item) => item.content ?? [])
      .map((content) => content.text)
      .filter(Boolean)
      .join("\n") ?? ""
  );
}

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
