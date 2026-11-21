const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export async function searchTMDB(query: string) {
  const res = await fetch(`${TMDB_BASE}/search/multi?query=${encodeURIComponent(query)}&language=en-US&page=1`, {
    headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_API_KEY}` },
  });
  return res.json();
}

export async function getTMDBDetails(id: string, type: 'movie' | 'tv') {
  const res = await fetch(`${TMDB_BASE}/${type}/${id}?language=en-US`, {
    headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_API_KEY}` },
  });
  return res.json();
}

export function getImageUrl(path: string | null, size: 'w500' | 'original' = 'original') {
  return path ? `${TMDB_IMAGE_BASE}/${size}${path}` : '/placeholder.jpg';
}