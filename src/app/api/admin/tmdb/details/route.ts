import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const type = searchParams.get("type") || "movie";

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "TMDB API key not configured" }, { status: 500 });
  }

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/${type}/${id}?language=en-US`,
      {
        headers: { Authorization: `Bearer ${apiKey}` },
      }
    );
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("TMDB details error:", error);
    return NextResponse.json({ error: "Details fetch failed" }, { status: 500 });
  }
}