import { NextResponse } from "next/server";
import { getCatalog, saveCatalog } from "@/lib/db";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await request.json();
    const catalog = getCatalog();
    const index = catalog.categories.findIndex(c => c.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    catalog.categories[index] = { ...catalog.categories[index], ...data };
    saveCatalog(catalog);
    return NextResponse.json({ success: true, category: catalog.categories[index] });
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const catalog = getCatalog();
    catalog.categories = catalog.categories.filter(c => c.id !== id);
    saveCatalog(catalog);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}