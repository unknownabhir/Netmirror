import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");
  const size = searchParams.get("size") || "original";

  if (!path) {
    return NextResponse.redirect("/placeholder.jpg");
  }

  try {
    const res = await fetch(`https://image.tmdb.org/t/p/${size}${path}`);
    const blob = await res.blob();
    return new NextResponse(blob, {
      headers: {
        "Content-Type": res.headers.get("Content-Type") || "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.redirect("/placeholder.jpg");
  }
}