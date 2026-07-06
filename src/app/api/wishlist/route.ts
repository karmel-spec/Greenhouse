import { NextRequest, NextResponse } from "next/server";
import { newId, readStore, updateStore, StoredWishlistItem } from "@/lib/store";
import { wishlistItems } from "@/lib/mock-data";

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

  const item: StoredWishlistItem = {
    id: newId("wish"),
    name,
    category: typeof body.category === "string" && body.category ? body.category : "General",
    price: typeof body.price === "string" && body.price ? body.price : "—",
    priority: ["High", "Medium", "Low"].includes(body.priority) ? body.priority : "Medium",
    note: typeof body.note === "string" && body.note ? body.note : undefined,
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
