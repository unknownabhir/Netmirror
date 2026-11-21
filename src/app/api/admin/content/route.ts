import { NextResponse } from "next/server";
import { getCatalog, saveCatalog } from "@/lib/db";
import { Movie } from "@/types";

export async function GET() {
  const catalog = getCatalog();
  return NextResponse.json(catalog);
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const catalog = getCatalog();
    const id = data.id || crypto.randomUUID();
    const movie = { ...data, id } as Movie;
    catalog.movies[id] = movie;
    saveCatalog(catalog);
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Save content error:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}