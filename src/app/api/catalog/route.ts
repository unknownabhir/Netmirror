import { NextResponse } from "next/server";
import { getCatalog } from "@/lib/db";

export async function GET() {
  const catalog = getCatalog();
  return NextResponse.json(catalog);
}