import { getCatalog } from "@/lib/db";
import { VideoPlayer } from "@/components/movie/VideoPlayer";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface WatchPageProps {
  params: Promise<{ id: string }>;
}

export default async function WatchPage({ params }: WatchPageProps) {
  const { id } = await params;
  const catalog = getCatalog();
  const movie = catalog.movies[id];

  if (!movie) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-cinema-bg">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <VideoPlayer movie={movie} />
        <div className="mt-8">
          <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>
          <p className="text-gray-400">{movie.overview}</p>
        </div>
      </div>
    </div>
  );
}