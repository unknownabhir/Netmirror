"use client";

import { WatchProgress } from "@/types";

const STORAGE_KEY = "watch-movie-progress";

export function getWatchProgress(): WatchProgress[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveWatchProgress(progress: WatchProgress[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function updateProgress(movieId: string, currentTime: number, duration: number, episodeId?: string): void {
  const progress = getWatchProgress();
  const existingIndex = progress.findIndex(p => p.movieId === movieId && p.episodeId === episodeId);

  const newProgress: WatchProgress = {
    movieId,
    episodeId,
    currentTime,
    duration,
    lastWatched: Date.now(),
  };

  if (existingIndex >= 0) {
    progress[existingIndex] = newProgress;
  } else {
    progress.unshift(newProgress);
  }

  // Keep only last 50 items
  saveWatchProgress(progress.slice(0, 50));
}

export function getContinueWatching(movieId?: string): WatchProgress[] {
  const progress = getWatchProgress();
  if (movieId) {
    return progress.filter(p => p.movieId === movieId);
  }
  return progress.filter(p => p.currentTime > 60 && p.currentTime < p.duration - 60).slice(0, 10);
}

export function clearProgress(movieId: string, episodeId?: string): void {
  const progress = getWatchProgress().filter(p => !(p.movieId === movieId && p.episodeId === episodeId));
  saveWatchProgress(progress);
}