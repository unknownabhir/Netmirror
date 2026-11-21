"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, Search, Loader2, Check, Download, Upload } from "lucide-react";
import { Movie, VideoSource } from "@/types";
import { EpisodeManager } from "./EpisodeManager";

interface TMDBResult {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  media_type: 'movie' | 'tv';
}

interface TMDBDetails {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  genres?: { name: string }[];
  media_type?: 'movie' | 'tv';
}

interface ContentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Movie>) => void;
}

export function ContentFormModal({ isOpen, onClose, onSubmit }: ContentFormModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TMDBResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Movie>>({
    title: "",
    overview: "",
    posterPath: "",
    backdropPath: "",
    releaseYear: 0,
    rating: 0,
    genres: [],
    sources: [] as VideoSource[],
    type: "movie",
  });

  // Initialize releaseYear on mount to avoid prerender issues
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData(prev => ({ ...prev, releaseYear: new Date().getFullYear() }));
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/tmdb/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (item: TMDBResult) => {
    const type = item.media_type === 'tv' ? 'tv' : 'movie';
    const fallbackDate = new Date().toISOString();
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/tmdb/details?id=${item.id}&type=${type}`);
      const details: TMDBDetails = await res.json();
      setFormData({
        ...formData,
        title: details.title || details.name,
        overview: details.overview,
        posterPath: `/api/proxy/image?path=${details.poster_path}&size=w500`,
        backdropPath: `/api/proxy/image?path=${details.backdrop_path}&size=original`,
        releaseYear: new Date(details.release_date || details.first_air_date || fallbackDate).getFullYear(),
        rating: details.vote_average,
        genres: details.genres?.map((g) => g.name) || [],
        type: (details.media_type === 'tv' ? 'series' : details.media_type) || (item.media_type === 'tv' ? 'series' : 'movie'),
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const data = JSON.stringify(formData, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${formData.title || "content"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        setFormData(prev => ({ ...prev, ...imported }));
      } catch (err) {
        console.error("Invalid JSON file", err);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-cinema-panel rounded-lg border border-cinema-border w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-cinema-border">
          <h2 className="text-2xl font-bold">Add Content</h2>
          <div className="flex items-center gap-2">
            <button onClick={handleExport} className="flex items-center gap-1 px-3 py-1 bg-gray-700 text-white rounded text-sm hover:bg-gray-600">
              <Download size={14} /> Export
            </button>
            <label className="flex items-center gap-1 px-3 py-1 bg-gray-700 text-white rounded text-sm hover:bg-gray-600 cursor-pointer">
              <Upload size={14} /> Import
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
            <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={24} /></button>
          </div>
        </div>

        <div className="p-6 grid gap-6">
          {/* TMDB Search Section */}
          <div className="space-y-4">
            <h3 className="font-bold">Search TMDB</h3>
            <div className="flex gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search for movie or TV show..."
                className="flex-1 bg-cinema-bg border border-cinema-border rounded px-4 py-2 text-white"
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="bg-brand text-white px-4 py-2 rounded font-bold disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Search />}
              </button>
            </div>

            {results.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-60 overflow-y-auto">
                {results.map((item: TMDBResult) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className="relative aspect-[2/3] rounded overflow-hidden border-2 border-transparent hover:border-brand transition"
                  >
                    <Image
                      src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
                      alt={item.title || item.name || "Movie poster"}
                      fill
                      className="object-cover"
                      sizes="25vw"
                    />
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                      <span className="text-white font-medium px-2">Select</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-cinema-bg border border-cinema-border rounded px-4 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={formData.type || "movie"}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'movie' | 'series' })}
                className="w-full bg-cinema-bg border border-cinema-border rounded px-4 py-2 text-white"
              >
                <option value="movie">Movie</option>
                <option value="series">TV Series</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Release Year</label>
              <input
                type="number"
                value={formData.releaseYear || ""}
                onChange={(e) => setFormData({ ...formData, releaseYear: parseInt(e.target.value) })}
                className="w-full bg-cinema-bg border border-cinema-border rounded px-4 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Rating</label>
              <input
                type="number"
                step="0.1"
                value={formData.rating || ""}
                onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                className="w-full bg-cinema-bg border border-cinema-border rounded px-4 py-2 text-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Overview</label>
              <textarea
                value={formData.overview || ""}
                onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                rows={4}
                className="w-full bg-cinema-bg border border-cinema-border rounded px-4 py-2 text-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Poster URL</label>
              <input
                value={formData.posterPath || ""}
                onChange={(e) => setFormData({ ...formData, posterPath: e.target.value })}
                className="w-full bg-cinema-bg border border-cinema-border rounded px-4 py-2 text-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Backdrop URL</label>
              <input
                value={formData.backdropPath || ""}
                onChange={(e) => setFormData({ ...formData, backdropPath: e.target.value })}
                className="w-full bg-cinema-bg border border-cinema-border rounded px-4 py-2 text-white"
              />
            </div>
          </div>

          {/* Video Sources */}
          <div className="border-t border-cinema-border pt-6">
            <h3 className="font-bold mb-4">Video Sources</h3>
            <VideoSourcesForm
              sources={formData.sources || []}
              onChange={(sources) => setFormData({ ...formData, sources })}
            />
          </div>

          {/* Episode Manager for Series */}
          {formData.type === 'series' && (
            <div className="border-t border-cinema-border pt-6">
              <EpisodeManager
                movie={formData as Movie}
                onUpdate={(updated) => setFormData(updated)}
              />
            </div>
          )}

          <div className="flex justify-end gap-4 pt-4 border-t border-cinema-border">
            <button onClick={onClose} className="px-6 py-2 border border-cinema-border rounded font-bold hover:bg-cinema-card">
              Cancel
            </button>
            <button
              onClick={() => onSubmit(formData)}
              className="bg-brand text-white px-6 py-2 rounded font-bold hover:bg-brand-hover"
            >
              <Check className="inline mr-1" /> Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function VideoSourcesForm({ sources, onChange }: { sources: VideoSource[], onChange: (s: VideoSource[]) => void }) {
  const [localSources, setLocalSources] = useState(sources);

  const addSource = () => {
    const newSources = [...localSources, { name: "", url: "", quality: "1080p" as const, type: "hls" as const }];
    setLocalSources(newSources);
    onChange(newSources);
  };

  const updateSource = (index: number, field: keyof VideoSource, value: string) => {
    const newSources = [...localSources];
    newSources[index] = { ...newSources[index], [field]: value };
    setLocalSources(newSources);
    onChange(newSources);
  };

  const removeSource = (index: number) => {
    const newSources = localSources.filter((_, i) => i !== index);
    setLocalSources(newSources);
    onChange(newSources);
  };

  return (
    <div className="space-y-3">
      {localSources.map((source, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input
            placeholder="Source Name (e.g., Primary HLS)"
            value={source.name}
            onChange={(e) => updateSource(i, "name", e.target.value)}
            className="w-40 bg-cinema-bg border border-cinema-border rounded px-3 py-2 text-white"
          />
          <input
            placeholder="Stream URL (.m3u8, .mp4, or iframe)"
            value={source.url}
            onChange={(e) => updateSource(i, "url", e.target.value)}
            className="flex-1 bg-cinema-bg border border-cinema-border rounded px-3 py-2 text-white"
          />
          <select
            value={source.quality}
            onChange={(e) => updateSource(i, "quality", e.target.value)}
            className="w-24 bg-cinema-bg border border-cinema-border rounded px-3 py-2 text-white"
          >
            <option value="4K">4K</option>
            <option value="1080p">1080p</option>
            <option value="720p">720p</option>
          </select>
          <select
            value={source.type}
            onChange={(e) => updateSource(i, "type", e.target.value)}
            className="w-24 bg-cinema-bg border border-cinema-border rounded px-3 py-2 text-white"
          >
            <option value="hls">HLS (.m3u8)</option>
            <option value="mp4">MP4</option>
            <option value="iframe">Iframe Embed</option>
          </select>
          <button
            onClick={() => removeSource(i)}
            className="text-red-500 hover:text-red-400"
          >
            ×
          </button>
        </div>
      ))}
      <button onClick={addSource} className="text-brand hover:underline text-sm">
        + Add Another Source
      </button>
    </div>
  );
}