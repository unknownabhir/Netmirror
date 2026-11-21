"use client";

import { useState } from "react";
import { Plus, Trash2, Edit, Save, X, ChevronDown } from "lucide-react";
import { Movie, VideoSource } from "@/types";

interface Episode {
  id: string;
  title: string;
  number: number;
  overview: string;
  thumbnail: string;
  duration: number;
  sources: VideoSource[];
}

interface Season {
  id: string;
  number: number;
  title: string;
  episodes: Episode[];
}

interface EpisodeManagerProps {
  movie: Movie;
  onUpdate: (movie: Movie) => void;
}

export function EpisodeManager({ movie, onUpdate }: EpisodeManagerProps) {
  const [seasons, setSeasons] = useState<Season[]>(movie.type === 'series' ?
    movie.seasons?.map((s: Season) => ({
      ...s,
      episodes: s.episodes?.map((ep: Episode, i: number) => ({
        ...ep,
        number: ep.number || i + 1,
        sources: ep.sources || [],
      })) || [],
    })) || [] : []);
  const [expandedSeason, setExpandedSeason] = useState<string | null>(null);

  const addSeason = () => {
    const newSeason: Season = {
      id: crypto.randomUUID(),
      number: seasons.length + 1,
      title: `Season ${seasons.length + 1}`,
      episodes: [],
    };
    setSeasons([...seasons, newSeason]);
    updateMovie();
  };

  const addEpisode = (seasonId: string) => {
    setSeasons(seasons.map(s => {
      if (s.id !== seasonId) return s;
      const newEpisode: Episode = {
        id: crypto.randomUUID(),
        title: `Episode ${s.episodes.length + 1}`,
        number: s.episodes.length + 1,
        overview: "",
        thumbnail: "",
        duration: 0,
        sources: [],
      };
      return { ...s, episodes: [...s.episodes, newEpisode] };
    }));
    updateMovie();
  };

  const updateSeason = (seasonId: string, data: Partial<Season>) => {
    setSeasons(seasons.map(s => s.id === seasonId ? { ...s, ...data } : s));
    updateMovie();
  };

  const updateEpisode = (seasonId: string, episodeId: string, data: Partial<Episode>) => {
    setSeasons(seasons.map(s => {
      if (s.id !== seasonId) return s;
      return {
        ...s,
        episodes: s.episodes.map(ep => ep.id === episodeId ? { ...ep, ...data } : ep),
      };
    }));
    updateMovie();
  };

  const removeSeason = (seasonId: string) => {
    if (!confirm("Delete this season and all its episodes?")) return;
    setSeasons(seasons.filter(s => s.id !== seasonId));
    updateMovie();
  };

  const removeEpisode = (seasonId: string, episodeId: string) => {
    setSeasons(seasons.map(s => {
      if (s.id !== seasonId) return s;
      return { ...s, episodes: s.episodes.filter(ep => ep.id !== episodeId) };
    }));
    updateMovie();
  };

  const updateMovie = () => {
    onUpdate({ ...movie, seasons });
  };

  const toggleSeason = (seasonId: string) => {
    setExpandedSeason(expandedSeason === seasonId ? null : seasonId);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold flex items-center gap-2">
        Series Manager
        <button onClick={addSeason} className="bg-brand text-white px-3 py-1 rounded text-sm hover:bg-brand-hover">
          <Plus size={14} /> Add Season
        </button>
      </h3>

      {seasons.length === 0 && (
        <div className="bg-cinema-panel p-8 rounded border border-cinema-border text-center text-gray-400">
          No seasons yet. Click &ldquo;Add Season&rdquo; to get started.
        </div>
      )}

      {seasons.map((season) => (
        <div key={season.id} className="bg-cinema-panel rounded-lg border border-cinema-border overflow-hidden">
          <button
            onClick={() => toggleSeason(season.id)}
            className="w-full p-4 flex items-center justify-between hover:bg-cinema-card/50 transition"
          >
            <div className="flex items-center gap-4">
              <span className={expandedSeason === season.id ? "rotate-180" : ""} style={{transition: 'transform 0.2s'}}>
                <ChevronDown size={20} className="text-gray-400" />
              </span>
              <div>
                <input
                  value={season.title}
                  onChange={(e) => updateSeason(season.id, { title: e.target.value })}
                  className="bg-transparent border-none text-white font-bold text-lg focus:outline-none w-64"
                />
                <p className="text-sm text-gray-400">Season {season.number} • {season.episodes.length} episodes</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => addEpisode(season.id)} className="bg-gray-700 text-white px-3 py-1 rounded text-sm hover:bg-gray-600">
                <Plus size={14} /> Add Episode
              </button>
              <button onClick={() => removeSeason(season.id)} className="text-red-500 hover:text-red-400 p-2">
                <Trash2 size={18} />
              </button>
            </div>
          </button>

          {expandedSeason === season.id && (
            <div className="border-t border-cinema-border p-4 space-y-3">
              {season.episodes.length === 0 && (
                <p className="text-gray-500 text-center py-4">No episodes yet.</p>
              )}
              {season.episodes.map((episode, epIndex) => (
                <EpisodeRow
                  key={episode.id}
                  episode={episode}
                  index={epIndex}
                  onUpdate={(data) => updateEpisode(season.id, episode.id, data)}
                  onDelete={() => removeEpisode(season.id, episode.id)}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function EpisodeRow({
  episode,
  index,
  onUpdate,
  onDelete,
}: {
  episode: Episode;
  index: number;
  onUpdate: (data: Partial<Episode>) => void;
  onDelete: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: episode.title,
    number: episode.number,
    overview: episode.overview,
    thumbnail: episode.thumbnail,
    duration: episode.duration,
  });

  const handleSave = () => {
    onUpdate(editData);
    setIsEditing(false);
  };

  const handleSourceChange = (sources: VideoSource[]) => {
    onUpdate({ sources });
  };

  return (
    <div className="bg-cinema-bg rounded-lg border border-cinema-border p-4 space-y-3">
      <div className="flex items-center gap-4">
        <span className="text-gray-400 w-8 text-right">E{index + 1}</span>
        <input
          value={editData.title}
          onChange={(e) => setEditData({ ...editData, title: e.target.value })}
          className="flex-1 bg-cinema-bg border border-cinema-border rounded px-3 py-2 text-white"
          disabled={!isEditing}
        />
        {isEditing ? (
          <div className="flex gap-2">
            <button onClick={handleSave} className="bg-brand text-white px-3 py-1 rounded text-sm">
              <Save size={14} />
            </button>
            <button onClick={() => { setEditData({ title: episode.title, number: episode.number, overview: episode.overview, thumbnail: episode.thumbnail, duration: episode.duration }); setIsEditing(false); }} className="bg-gray-600 text-white px-3 py-1 rounded text-sm">
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setIsEditing(true)} className="p-2 text-gray-400 hover:text-white">
              <Edit size={18} />
            </button>
            <button onClick={onDelete} className="p-2 text-gray-400 hover:text-red-400">
              <Trash2 size={18} />
            </button>
          </div>
        )}
      </div>

      {isEditing && (
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Episode Number</label>
            <input
              type="number"
              value={editData.number}
              onChange={(e) => setEditData({ ...editData, number: parseInt(e.target.value) })}
              className="w-full bg-cinema-bg border border-cinema-border rounded px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Duration (minutes)</label>
            <input
              type="number"
              value={editData.duration}
              onChange={(e) => setEditData({ ...editData, duration: parseInt(e.target.value) })}
              className="w-full bg-cinema-bg border border-cinema-border rounded px-3 py-2 text-white"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs text-gray-400 mb-1">Overview</label>
            <textarea
              value={editData.overview}
              onChange={(e) => setEditData({ ...editData, overview: e.target.value })}
              rows={2}
              className="w-full bg-cinema-bg border border-cinema-border rounded px-3 py-2 text-white"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs text-gray-400 mb-1">Thumbnail URL</label>
            <input
              value={editData.thumbnail}
              onChange={(e) => setEditData({ ...editData, thumbnail: e.target.value })}
              className="w-full bg-cinema-bg border border-cinema-border rounded px-3 py-2 text-white"
            />
          </div>
        </div>
      )}

      <div className="border-t border-cinema-border pt-3">
        <VideoSourcesForm
          sources={episode.sources || []}
          onChange={handleSourceChange}
        />
      </div>
    </div>
  );
}

function VideoSourcesForm({
  sources,
  onChange,
}: {
  sources: VideoSource[];
  onChange: (sources: VideoSource[]) => void;
}) {
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
    <div className="space-y-2">
      <label className="text-xs text-gray-400 font-medium">Video Sources</label>
      {localSources.map((source, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input
            placeholder="Name (e.g., Primary HLS)"
            value={source.name}
            onChange={(e) => updateSource(i, "name", e.target.value)}
            className="w-36 bg-cinema-bg border border-cinema-border rounded px-2 py-1 text-white text-sm"
          />
          <input
            placeholder="Stream URL (.m3u8, .mp4, or iframe)"
            value={source.url}
            onChange={(e) => updateSource(i, "url", e.target.value)}
            className="flex-1 bg-cinema-bg border border-cinema-border rounded px-2 py-1 text-white text-sm"
          />
          <select
            value={source.quality}
            onChange={(e) => updateSource(i, "quality", e.target.value)}
            className="w-20 bg-cinema-bg border border-cinema-border rounded px-2 py-1 text-white text-sm"
          >
            <option value="4K">4K</option>
            <option value="1080p">1080p</option>
            <option value="720p">720p</option>
          </select>
          <select
            value={source.type}
            onChange={(e) => updateSource(i, "type", e.target.value)}
            className="w-20 bg-cinema-bg border border-cinema-border rounded px-2 py-1 text-white text-sm"
          >
            <option value="hls">HLS</option>
            <option value="mp4">MP4</option>
            <option value="iframe">Iframe</option>
          </select>
          <button onClick={() => removeSource(i)} className="text-red-500 hover:text-red-400 p-1">
            ×
          </button>
        </div>
      ))}
      <button onClick={addSource} className="text-brand hover:underline text-sm">
        + Add Source
      </button>
    </div>
  );
}