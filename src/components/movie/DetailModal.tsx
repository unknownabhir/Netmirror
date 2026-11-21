"use client";

import { useState } from "react";
import { X, Play, Star } from "lucide-react";
import Image from "next/image";
import { Movie, VideoSource } from "@/types";

interface DetailModalProps {
  movie: Movie;
  isOpen: boolean;
  onClose: () => void;
  onPlay: (movie: Movie, source?: VideoSource) => void;
}

export function DetailModal({ movie, isOpen, onClose, onPlay }: DetailModalProps) {
  const [selectedSource, setSelectedSource] = useState<VideoSource | undefined>(movie.sources[0]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-cinema-panel rounded-lg border border-cinema-border w-full max-w-5xl max-h-[90vh] overflow-y-auto relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-gray-400 hover:text-white bg-cinema-bg/50 p-2 rounded-full transition-colors"
        >
          <X size={24} />
        </button>

        <div className="grid md:grid-cols-3 gap-0">
          {/* Backdrop/Poster Section */}
          <div className="md:col-span-2 relative aspect-video">
            <Image
              src={movie.backdropPath}
              alt={movie.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

            {/* Overlay Info */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h2 className="text-4xl font-bold mb-3">{movie.title}</h2>
                  <div className="flex flex-wrap items-center gap-2.5 text-sm">
                    <span className="badge badge-year">{movie.releaseYear}</span>
                    <span className="badge badge-rating flex items-center gap-1">
                      <Star className="fill-yellow-400 text-yellow-400" size={12} />
                      {movie.rating.toFixed(1)}
                    </span>
                    <span className="badge badge-type">{movie.type === 'series' ? 'Series' : 'Movie'}</span>
                    {movie.sources[0] && (
                      <span className="badge badge-quality">{movie.sources[0].quality}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => onPlay(movie, selectedSource)}
                    className="bg-white text-black px-8 py-3 rounded font-bold hover:bg-gray-200 transition-colors flex items-center gap-2"
                  >
                    <Play fill="black" size={20} /> Play
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="p-6 space-y-6 border-l border-cinema-border">
            <div>
              <h3 className="font-bold mb-3 text-lg">Overview</h3>
              <p className="text-gray-300 leading-relaxed">{movie.overview}</p>
            </div>

            <div>
              <h3 className="font-bold mb-3 text-lg">Genres</h3>
              <div className="flex flex-wrap gap-2">
                {movie.genres.map((genre) => (
                  <span key={genre} className="badge badge-genre">
                    {genre}
                  </span>
                ))}
              </div>
            </div>

            {movie.type === 'series' && (
              <div>
                <h3 className="font-bold mb-3 text-lg">Seasons</h3>
                <select className="w-full bg-cinema-bg border border-cinema-border rounded px-4 py-2 text-white focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand">
                  <option>Season 1</option>
                  <option>Season 2</option>
                </select>
              </div>
            )}

            <div>
              <h3 className="font-bold mb-3 text-lg">Select Source</h3>
              <div className="space-y-2">
                {movie.sources.map((source) => (
                  <button
                    key={source.url}
                    onClick={() => setSelectedSource(source)}
                    className={`source-btn ${selectedSource === source ? 'source-btn-selected' : 'source-btn-unselected'}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{source.name || 'Unnamed Source'}</span>
                      <span className="text-xs text-gray-400 badge badge-quality">{source.quality} • {source.type.toUpperCase()}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Similar Titles Section */}
        <div className="p-6 border-t border-cinema-border">
          <h3 className="font-bold mb-4 text-lg">Similar Titles</h3>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar">
            {/* Similar movies would be rendered here */}
            <div className="similar-card">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3 text-center text-sm text-gray-400">Similar</div>
            </div>
            <div className="similar-card">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3 text-center text-sm text-gray-400">Similar</div>
            </div>
            <div className="similar-card">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3 text-center text-sm text-gray-400">Similar</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}