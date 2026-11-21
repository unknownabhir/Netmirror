"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Maximize,
  Minimize,
  Settings,
  ChevronDown,
  Star,
} from "lucide-react";
import { Movie, VideoSource } from "@/types";
import { updateProgress } from "@/lib/watch-progress";

interface VideoPlayerProps {
  movie: Movie;
  selectedSource?: VideoSource;
  onSourceChange?: (source: VideoSource) => void;
  onNextEpisode?: () => void;
  episodeId?: string;
}

export function VideoPlayer({ movie, selectedSource, onSourceChange, onNextEpisode, episodeId }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [qualityMenuOpen, setQualityMenuOpen] = useState(false);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const source = selectedSource || movie.sources[0];
  const sources = movie.sources;

  const loadSource = useCallback((src: VideoSource) => {
    if (!videoRef.current) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const video = videoRef.current;
    video.pause();
    video.src = "";

    if (src.type === "hls" && Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true });
      hls.loadSource(src.url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play();
        setIsPlaying(true);
      });
      hlsRef.current = hls;
    } else if (src.type === "mp4" || (src.type === "hls" && video.canPlayType("application/vnd.apple.mpegurl"))) {
      video.src = src.url;
      video.load();
      video.play();
      setIsPlaying(true);
    } else if (src.type === "iframe") {
      console.warn("Iframe source requires different handling");
    }
  }, []);

  useEffect(() => {
    loadSource(source);
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [source, loadSource]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      // Save progress every 10 seconds
      if (Math.floor(video.currentTime) % 10 === 0) {
        updateProgress(movie.id, video.currentTime, video.duration, episodeId);
      }
    };
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handleEnded = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, [movie.id, episodeId]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) video.pause();
    else video.play();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = parseFloat(e.target.value);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const vol = parseFloat(e.target.value);
    video.volume = vol;
    setVolume(vol);
    setIsMuted(vol === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
  };

  const toggleFullscreen = () => {
    const container = videoRef.current?.parentElement;
    if (!container) return;
    if (!isFullscreen) {
      container.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
  };

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden" onMouseMove={handleMouseMove}>
      <video
        ref={videoRef}
        className="w-full h-full"
        playsInline
        onClick={togglePlay}
      />

      {source.type === "iframe" && (
        <iframe
          src={source.url}
          className="w-full h-full"
          frameBorder="0"
          allowFullScreen
        />
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

      {/* Top Info Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 pointer-events-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold">{movie.title}</h2>
            <div className="flex items-center gap-2">
              <span className="badge badge-year">{movie.releaseYear}</span>
              <span className="badge badge-rating flex items-center gap-1">
                <Star fill="currentColor" size={12} /> {movie.rating.toFixed(1)}
              </span>
              <span className="badge badge-type">{movie.type === 'series' ? 'Series' : 'Movie'}</span>
              <span className="badge badge-quality">{source.quality}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-auto">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-gray-600 rounded appearance-none accent-brand mb-4 cursor-pointer"
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={togglePlay} className="text-white hover:text-brand transition-colors p-1" aria-label={isPlaying ? "Pause" : "Play"}>
                {isPlaying ? <Pause size={28} /> : <Play size={28} />}
              </button>

              <button onClick={() => skip(-10)} className="text-white hover:text-brand transition-colors p-1" aria-label="Rewind 10s">
                <SkipBack size={24} />
              </button>

              <button onClick={() => skip(10)} className="text-white hover:text-brand transition-colors p-1" aria-label="Forward 10s">
                <SkipForward size={24} />
              </button>

              <div className="flex items-center gap-2">
                <button onClick={toggleMute} className="text-white hover:text-brand transition-colors p-1" aria-label={isMuted ? "Unmute" : "Mute"}>
                  {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-24 h-1 bg-gray-600 rounded appearance-none accent-brand cursor-pointer"
                />
              </div>

              <span className="text-white text-sm font-mono text-gray-300">{formatTime(currentTime)} / {formatTime(duration)}</span>
            </div>

            <div className="flex items-center gap-3">
              {/* Playback Speed */}
              <div className="relative">
                <button
                  onClick={() => setPlaybackRate(playbackRate === 1 ? 1.5 : playbackRate === 1.5 ? 2 : 1)}
                  className="text-white text-sm font-bold px-3 py-1.5 bg-cinema-panel border border-cinema-border rounded hover:bg-cinema-card transition-colors"
                >
                  {playbackRate}x
                </button>
              </div>

              {/* Quality/Source Selector */}
              <div className="relative">
                <button
                  onClick={() => setQualityMenuOpen(!qualityMenuOpen)}
                  className="flex items-center gap-1.5 text-white text-sm font-medium px-3 py-1.5 bg-cinema-panel border border-cinema-border rounded hover:bg-cinema-card transition-colors"
                >
                  <Settings size={16} /> {source.quality} <ChevronDown size={12} />
                </button>
                {qualityMenuOpen && (
                  <div className="absolute bottom-full right-0 mb-2 bg-cinema-panel border border-cinema-border rounded overflow-hidden z-10 min-w-[200px]">
                    {sources.map((s) => (
                      <button
                        key={s.url}
                        onClick={() => {
                          onSourceChange?.(s);
                          setQualityMenuOpen(false);
                        }}
                        className="block w-full px-4 py-2.5 text-left text-white hover:bg-brand transition-colors border-b border-cinema-border last:border-0"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{s.name || 'Unnamed Source'}</span>
                          <span className="text-xs text-gray-400 badge badge-quality">{s.quality} • {s.type.toUpperCase()}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {onNextEpisode && (
                <button
                  onClick={onNextEpisode}
                  className="bg-brand text-white px-4 py-2 rounded font-bold hover:bg-brand-hover transition-colors flex items-center gap-2"
                >
                  Next Episode
                </button>
              )}

              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-brand transition-colors p-1.5 bg-cinema-panel border border-cinema-border rounded hover:bg-cinema-card"
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}