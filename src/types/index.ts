export interface VideoSource {
  name: string;
  url: string;
  quality: '4K' | '1080p' | '720p';
  type: 'hls' | 'mp4' | 'iframe';
}

export interface Episode {
  id: string;
  title: string;
  number: number;
  overview: string;
  thumbnail: string;
  duration: number;
  sources: VideoSource[];
}

export interface Season {
  id: string;
  number: number;
  title: string;
  episodes: Episode[];
}

export interface Movie {
  id: string;
  title: string;
  overview: string;
  posterPath: string;
  backdropPath: string;
  releaseYear: number;
  rating: number;
  genres: string[];
  sources: VideoSource[];
  type: 'movie' | 'series';
  seasons?: Season[];
}

export interface Category {
  id: string;
  name: string;
  movieIds: string[];
  isVisible: boolean;
  order: number;
}

export interface Catalog {
  movies: Record<string, Movie>;
  categories: Category[];
}

export interface WatchProgress {
  movieId: string;
  episodeId?: string;
  currentTime: number;
  duration: number;
  lastWatched: number;
}
