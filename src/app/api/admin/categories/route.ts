import { NextResponse } from "next/server";
import { getCatalog, saveCatalog } from "@/lib/db";

export async function GET() {
  const catalog = getCatalog();
  return NextResponse.json({ categories: catalog.categories });
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ error: "Name required" }, { status: 400 });
    }

    const catalog = getCatalog();
    const newCategory = {
      id: crypto.randomUUID(),
      name,
      movieIds: [],
      isVisible: true,
      order: catalog.categories.length,
    };
    catalog.categories.push(newCategory);
    saveCatalog(catalog);
    return NextResponse.json({ success: true, category: newCategory });
  } catch {
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}