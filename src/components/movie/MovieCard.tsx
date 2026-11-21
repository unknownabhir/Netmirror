import { Movie } from "@/types";
import Image from "next/image";

interface MovieCardProps {
  movie: Movie;
  onClick?: () => void;
}

export function MovieCard({ movie, onClick }: MovieCardProps) {
  return (
    <div
      onClick={onClick}
      className="relative group w-48 h-72 flex-shrink-0 cursor-pointer transition-transform duration-300 hover:scale-105 z-10"
    >
      <Image
        src={movie.posterPath}
        alt={movie.title}
        fill
        className="rounded object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
        <div className="w-full">
          <p className="font-bold text-white truncate">{movie.title}</p>
          <p className="text-xs text-gray-400">{movie.releaseYear} • {movie.rating.toFixed(1)}</p>
        </div>
      </div>
    </div>
  );
}