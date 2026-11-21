import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ results: [], error: "TMDB API key not configured" }, { status: 500 });
  }

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}&language=en-US&page=1`,
      {
        headers: { Authorization: `Bearer ${apiKey}` },
      }
    );
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("TMDB search error:", error);
    return NextResponse.json({ results: [], error: "Search failed" }, { status: 500 });
  }
}