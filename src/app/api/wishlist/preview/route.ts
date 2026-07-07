import { NextRequest, NextResponse } from "next/server";

/**
 * Fetches a product page and extracts name / image / price so a pasted link
 * can autopopulate a wishlist item. Works with Amazon product pages and any
 * site with OpenGraph tags; degrades to a name guessed from the URL.
 */

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15";

// Rough zone guess from the product title so the form lands close.
const ZONE_HINTS: [RegExp, string][] = [
  [/compost|worm|vermicompost/i, "Compost Area"],
  [/pruner|shear|trowel|shovel|rake|glove|tool/i, "Tools"],
  [/microgreen|sprout/i, "Microgreens Shelf"],
  [/greenhouse|thermometer|hygrometer|heat mat|grow light/i, "Greenhouse"],
  [/herb/i, "Herb Garden"],
  [/decor|statue|gnome|wind chime|lantern/i, "Outdoor Decor"],
  [/raised bed|trellis|drip|irrigation|soaker/i, "Terraced Square Foot Vegetable Garden"],
];

function decodeEntities(text: string) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

function cleanTitle(raw: string) {
  let title = decodeEntities(raw.trim());
  title = title.replace(/^Amazon\.com\s*:\s*/i, "").replace(/\s*[|–-]\s*Amazon\.com.*$/i, "");
  // Amazon titles run long — keep the first descriptive chunk.
  if (title.length > 80) {
    const cut = title.slice(0, 80);
    const comma = cut.lastIndexOf(",");
    title = comma > 30 ? cut.slice(0, comma) : cut;
  }
  return title.trim();
}

function canonicalize(url: URL) {
  // Amazon: strip tracking params down to /dp/ASIN.
  const asin = url.pathname.match(/\/dp\/([A-Z0-9]{10})/i);
  if (url.hostname.includes("amazon.") && asin) {
    return `${url.origin}/dp/${asin[1]}`;
  }
  return `${url.origin}${url.pathname}`;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const raw = typeof body.url === "string" ? body.url.trim() : "";

  let url: URL;
  try {
    url = new URL(raw);
    if (!/^https?:$/.test(url.protocol)) throw new Error("bad protocol");
  } catch {
    return NextResponse.json({ error: "That doesn't look like a product link." }, { status: 400 });
  }

  const fallbackName = cleanTitle(
    decodeURIComponent(url.pathname.split("/").filter((part) => part && !/^(dp|gp|product|ref=|itm)/i.test(part))[0] ?? "")
      .replace(/[-_+]/g, " ")
      .trim() || url.hostname,
  );

  let name = fallbackName;
  let image: string | undefined;
  let price = "";

  try {
    const response = await fetch(url.toString(), {
      headers: { "User-Agent": UA, "Accept-Language": "en-US,en;q=0.9" },
      signal: AbortSignal.timeout(15_000),
      redirect: "follow",
    });
    const html = await response.text();

    const ogTitle = html.match(/property=["']og:title["']\s+content=["']([^"']+)["']/i)?.[1];
    const docTitle = html.match(/<title>([^<]{4,300})<\/title>/i)?.[1];
    const robot = /captcha|robot check/i.test(docTitle ?? "");
    if (!robot && (ogTitle || docTitle)) name = cleanTitle(ogTitle ?? docTitle ?? fallbackName);

    image =
      html.match(/"hiRes":"(https:[^"]+)"/)?.[1] ??
      html.match(/property=["']og:image["']\s+content=["']([^"']+)["']/i)?.[1] ??
      html.match(/id="landingImage"[\s\S]{0,600}?src="(https:[^"]+)"/)?.[1] ??
      undefined;

    const priceMatch =
      html.match(/class="a-offscreen">\s*\$([0-9][0-9,]*\.?[0-9]{0,2})/)?.[1] ??
      html.match(/property=["']og:price:amount["']\s+content=["']([0-9.,]+)["']/i)?.[1] ??
      html.match(/"price"\s*:\s*"?\$?([0-9][0-9,]*\.[0-9]{2})/)?.[1];
    if (priceMatch) price = `$${priceMatch}`;
  } catch {
    // Page unreachable or blocked — return what the URL alone gives us.
  }

  const category = ZONE_HINTS.find(([pattern]) => pattern.test(name))?.[1] ?? "General";

  return NextResponse.json({
    preview: { name, image, price, link: canonicalize(url), category, priority: "Medium" },
  });
}
