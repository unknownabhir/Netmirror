import { Movie, VideoSource } from "@/types";
import Image from "next/image";
import { Play, Info } from "lucide-react";

interface HeroBannerProps {
  movie: Movie;
  onPlay?: (source?: VideoSource) => void;
  onMoreInfo?: () => void;
}

export function HeroBanner({ movie, onPlay, onMoreInfo }: HeroBannerProps) {
  return (
    <div className="relative h-[80vh] w-full">
      <Image
        src={movie.backdropPath}
        alt={movie.title}
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-cinema-bg via-transparent to-transparent" />
      <div className="absolute bottom-20 left-12 w-1/3 space-y-4">
        <h1 className="text-6xl font-bold">{movie.title}</h1>
        <p className="text-lg text-gray-300 line-clamp-3">{movie.overview}</p>
        <div className="flex gap-4">
          <button
            onClick={() => onPlay?.(movie.sources[0])}
            className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded font-bold hover:bg-gray-200"
          >
            <Play fill="black" /> Play Now
          </button>
          <button
            onClick={onMoreInfo}
            className="flex items-center gap-2 bg-gray-500/50 text-white px-8 py-3 rounded font-bold hover:bg-gray-500/70"
          >
            <Info /> More Info
          </button>
        </div>
      </div>
    </div>
  );
}