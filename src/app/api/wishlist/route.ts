import { NextRequest, NextResponse } from "next/server";
import { newId, readStore, updateStore, StoredWishlistItem } from "@/lib/store";
import { saveDataUrlPhoto } from "@/lib/photo-files";
import { wishlistItems } from "@/lib/mock-data";

/**
 * External product images (Amazon etc.) often block hotlinking, so we
 * download them once at add-time and serve them locally via /api/photos.
 */
async function localizeImage(url: unknown, id: string): Promise<string | undefined> {
  if (typeof url !== "string" || !/^https?:\/\//.test(url)) return undefined;
  if (url.startsWith("/api/photos/")) return url;
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" },
      signal: AbortSignal.timeout(12_000),
    });
    const type = response.headers.get("content-type") ?? "";
    if (!response.ok || !type.startsWith("image/")) return undefined;
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length < 1000 || bytes.length > 8_000_000) return undefined;
    const mime = type.split(";")[0] as string;
    return await saveDataUrlPhoto(`data:${mime};base64,${bytes.toString("base64")}`, id);
  } catch {
    return undefined;
  }
}

// The curated defaults always show; user-added items persist in the store.
const defaults: StoredWishlistItem[] = wishlistItems.map((item, index) => ({
  id: `default-${index}`,
  name: item.name,
  category: item.category,
  price: item.price,
  priority: item.priority as StoredWishlistItem["priority"],
  note: item.note,
  createdAt: "",
}));

export async function GET() {
  const store = await readStore();
  return NextResponse.json({ items: [...defaults, ...store.wishlist] });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "Give the wishlist item a name." }, { status: 400 });
  }

  const id = newId("wish");
  const localImage = await localizeImage(body.image, id);

  const item: StoredWishlistItem = {
    id,
    name,
    category: typeof body.category === "string" && body.category ? body.category : "General",
    price: typeof body.price === "string" && body.price ? body.price : "—",
    priority: ["High", "Medium", "Low"].includes(body.priority) ? body.priority : "Medium",
    note: typeof body.note === "string" && body.note ? body.note : undefined,
    link: typeof body.link === "string" && /^https?:\/\//.test(body.link) ? body.link : undefined,
    image: localImage,
    createdAt: new Date().toISOString(),
  };

  const wishlist = await updateStore((store) => {
    store.wishlist.push(item);
    return store.wishlist;
  });

  return NextResponse.json({ item, items: [...defaults, ...wishlist] }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id") ?? "";
  const wishlist = await updateStore((store) => {
    store.wishlist = store.wishlist.filter((entry) => entry.id !== id);
    return store.wishlist;
  });
  return NextResponse.json({ items: [...defaults, ...wishlist] });
}
