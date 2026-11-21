import { NextResponse } from "next/server";
import { getCatalog, saveCatalog } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { categories } = await request.json();
    if (!Array.isArray(categories)) {
      return NextResponse.json({ error: "Categories array required" }, { status: 400 });
    }

    const catalog = getCatalog();
    catalog.categories = categories.map((cat, index) => ({ ...cat, order: index }));
    saveCatalog(catalog);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to reorder" }, { status: 500 });
  }
}