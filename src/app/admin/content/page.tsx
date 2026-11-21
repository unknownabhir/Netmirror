"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ContentFormModal } from "@/components/admin/ContentFormModal";
import { Movie } from "@/types";

export default function AdminContentPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMovies = async () => {
    try {
      const res = await fetch("/api/admin/content");
      const data = await res.json();
      setMovies(Object.values(data.movies || {}));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadMovies();
  }, []);

  const handleSubmit = async (data: Partial<Movie>) => {
    try {
      await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setIsOpen(false);
      loadMovies();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Content Manager</h1>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-brand text-white px-4 py-2 rounded font-bold"
        >
          Add Content
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : movies.length === 0 ? (
        <div className="bg-cinema-panel p-12 rounded border border-cinema-border text-center">
          <p className="text-gray-400 mb-4">No content yet. Click &ldquo;Add Content&rdquo; to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {movies.map((movie) => (
            <div key={movie.id} className="bg-cinema-panel rounded overflow-hidden border border-cinema-border group relative aspect-[2/3]">
              <Image
                src={movie.posterPath}
                alt={movie.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
              />
              <div className="p-3">
                <h3 className="font-bold truncate">{movie.title}</h3>
                <p className="text-sm text-gray-400">{movie.releaseYear} • {movie.type}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <ContentFormModal isOpen={isOpen} onClose={() => setIsOpen(false)} onSubmit={handleSubmit} />
    </div>
  );
}