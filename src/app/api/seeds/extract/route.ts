import { NextRequest, NextResponse } from "next/server";
import { openaiKeyProblem } from "@/lib/vision";

/**
 * Reads seed-packet photos (front and back) with OpenAI vision and returns
 * the fields for a Seed Library card — the "scan the packet" feature.
 */

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const images: string[] = (Array.isArray(body.images) ? body.images : [])
    .filter((entry: unknown): entry is string => typeof entry === "string" && entry.startsWith("data:image/"))
    .slice(0, 2);

  if (!images.length) {
    return NextResponse.json({ error: "Send one or two packet photos (front/back)." }, { status: 400 });
  }
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY is not configured, so I can't read the packet." }, { status: 503 });
  }
  const keyProblem = openaiKeyProblem();
  if (keyProblem) {
    return NextResponse.json({ error: keyProblem }, { status: 401 });
  }

  const prompt = [
    "You are Eve, reading a seed packet for Karmel's Seed Library (Orem, Utah, zone 6b — last frost ~May 15, first frost ~Oct 1).",
    "The photos show the front (and possibly back) of one seed packet. Extract everything legible.",
    "Rules:",
    "- commonName is the plant (e.g. 'Carrot'); variety is the cultivar (e.g. 'Danvers 126').",
    "- Numbers you cannot read: use 0. Strings you cannot read: use ''.",
    "- packagedYear: the 'packed for' or sell-by year if printed.",
    "- springStart/springEnd: the packet's outdoor sowing window converted to MM-DD for zone 6b. If the packet says 'after last frost', use 05-15 to 06-15. Leave '' if truly unclear.",
    "- sowingNotes: one compact sentence with depth, spacing, and any special instructions from the packet back.",
    "- isAnnual: false only if the packet says perennial/biennial.",
    "- confidence: how sure you are overall (0-1).",
  ].join("\n");

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
            { type: "input_text", text: prompt },
            ...images.map((dataUrl) => ({ type: "input_image", image_url: dataUrl })),
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "seed_packet_extraction",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            required: [
              "commonName", "botanicalName", "variety", "seedCount", "germinationRate",
              "packagedYear", "daysToGermination", "daysToMaturity", "springStart",
              "springEnd", "sowingNotes", "isHeirloom", "isAnnual", "confidence",
            ],
            properties: {
              commonName: { type: "string" },
              botanicalName: { type: "string" },
              variety: { type: "string" },
              seedCount: { type: "number" },
              germinationRate: { type: "number" },
              packagedYear: { type: "number" },
              daysToGermination: { type: "number" },
              daysToMaturity: { type: "number" },
              springStart: { type: "string" },
              springEnd: { type: "string" },
              sowingNotes: { type: "string" },
              isHeirloom: { type: "boolean" },
              isAnnual: { type: "boolean" },
              confidence: { type: "number", minimum: 0, maximum: 1 },
            },
          },
        },
      },
    }),
  });

  const raw = await response.json();
  if (!response.ok) {
    return NextResponse.json(
      { error: raw.error?.message ?? "Vision request failed." },
      { status: response.status },
    );
  }

  const text =
    raw.output_text ??
    (raw.output ?? [])
      .flatMap((item: { content?: Array<{ text?: string }> }) => item.content ?? [])
      .map((content: { text?: string }) => content.text)
      .filter(Boolean)
      .join("\n");

  try {
    const extracted = JSON.parse(text);
    return NextResponse.json({ extracted });
  } catch {
    return NextResponse.json({ error: "The packet photo came back unreadable — try a straighter, brighter shot." }, { status: 502 });
  }
}
