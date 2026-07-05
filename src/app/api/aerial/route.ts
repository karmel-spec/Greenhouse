import { NextRequest, NextResponse } from "next/server";

/**
 * Proxies Esri World Imagery satellite tiles so the aerial map renders
 * same-origin (no third-party requests from the browser, no API key).
 * Tile scheme: standard slippy z/x/y; Esri path order is z/y/x.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const z = Number(params.get("z"));
  const x = Number(params.get("x"));
  const y = Number(params.get("y"));

  if (![z, x, y].every(Number.isInteger) || z < 0 || z > 21 || x < 0 || y < 0) {
    return NextResponse.json({ error: "Invalid tile coordinates." }, { status: 400 });
  }

  const upstream = await fetch(
    `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`,
    { next: { revalidate: 60 * 60 * 24 * 7 } },
  );

  if (!upstream.ok) {
    return NextResponse.json({ error: `Tile fetch failed (${upstream.status}).` }, { status: 502 });
  }

  return new NextResponse(await upstream.arrayBuffer(), {
    headers: {
      "Content-Type": upstream.headers.get("Content-Type") ?? "image/jpeg",
      "Cache-Control": "public, max-age=604800",
    },
  });
}
