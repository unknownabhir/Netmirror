import { Movie } from "@/types";
import { MovieCard } from "./MovieCard";

interface ContentRowProps {
  title: string;
  movies: Movie[];
  onMovieClick: (movie: Movie) => void;
}

export function ContentRow({ title, movies, onMovieClick }: ContentRowProps) {
  return (
    <div className="py-6 px-6">
      <h2 className="text-2xl font-bold mb-4 px-6">{title}</h2>
      <div className="flex gap-4 overflow-x-auto hide-scrollbar px-6">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} onClick={() => onMovieClick(movie)} />
        ))}
      </div>
    </div>
  );
}