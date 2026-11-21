"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, Menu, ChevronDown, Filter, Settings, Film, Heart, LogOut } from "lucide-react";
import { HeroBanner } from "@/components/movie/HeroBanner";
import { ContentRow } from "@/components/movie/ContentRow";
import { DetailModal } from "@/components/movie/DetailModal";
import { Movie } from "@/types";
import { getContinueWatching } from "@/lib/watch-progress";
import { WatchProgress } from "@/types";

export default function HomePage() {
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState("All");
  const [continueWatchingList, setContinueWatchingList] = useState<WatchProgress[]>([]);
  const filterRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const loadCatalog = async () => {
    try {
      const res = await fetch("/api/catalog");
      const data = await res.json();
      const movieList = Object.values(data.movies || []) as Movie[];
      setMovies(movieList);
      if (movieList.length > 0) {
        setFeaturedMovie(movieList[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadContinueWatching = () => {
    const progress = getContinueWatching();
    setContinueWatchingList(progress);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCatalog();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadContinueWatching();
  }, []);

  const handlePlay = (movie: Movie) => {
    router.push(`/watch/${movie.id}`);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query.length >= 2) {
      const results = movies.filter(m =>
        m.title.toLowerCase().includes(query.toLowerCase()) ||
        m.genres.some(g => g.toLowerCase().includes(query.toLowerCase()))
      );
      setSearchResults(results.slice(0, 8));
    } else {
      setSearchResults([]);
    }
  };

  const trendingMovies = movies.slice(0, 10);
  const topRated = [...movies].sort((a, b) => b.rating - a.rating).slice(0, 10);

  const continueWatchingMovies = continueWatchingList.map(p => movies.find(m => m.id === p.movieId)).filter(Boolean) as Movie[];

  if (loading) {
    return (
      <main className="min-h-screen bg-cinema-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-brand">WATCH <span className="text-white">MOVIE</span></h1>
          <p className="text-gray-400 mt-2">Loading catalog...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cinema-bg">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass-nav px-6 py-4 flex items-center justify-between">
        <div className="text-2xl font-bold text-brand">WATCH <span className="text-white">MOVIE</span></div>

        <div className="hidden md:flex gap-8 text-sm font-medium text-gray-300">
          <a href="#" className="hover:text-white transition">Home</a>
          <a href="#" className="hover:text-white transition">Movies</a>
          <a href="#" className="hover:text-white transition">TV Shows</a>
          <a href="#" className="hover:text-white transition">Trending</a>
          <a href="#" className="hover:text-white transition">My List</a>
        </div>

        <div className="flex items-center gap-4">
          {/* Live Search */}
          <div className="relative" ref={filterRef}>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search movies, shows..."
                className="bg-cinema-card/50 border border-cinema-border rounded-full px-4 py-2 pl-10 text-white placeholder-gray-500 w-64 md:w-80 focus:outline-none focus:border-brand transition"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>
            {searchResults.length > 0 && (
              <div className="absolute top-full right-0 mt-2 w-full bg-cinema-panel border border-cinema-border rounded-lg overflow-hidden shadow-xl z-50">
                {searchResults.map((movie) => (
                  <button
                    key={movie.id}
                    onClick={() => { setSelectedMovie(movie); setSearchQuery(""); setSearchResults([]); }}
                    className="w-full flex items-center gap-3 p-3 hover:bg-cinema-card/50 transition text-left"
                  >
                    <Image src={movie.posterPath} alt={movie.title} width={48} height={72} className="object-cover rounded" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{movie.title}</p>
                      <p className="text-xs text-gray-400">{movie.releaseYear} • {movie.type === 'series' ? 'Series' : 'Movie'}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Provider Filter Dropdown */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="flex items-center gap-2 bg-cinema-card/50 border border-cinema-border rounded-full px-4 py-2 text-gray-300 hover:text-white transition"
            >
              <Filter size={18} />
              <span>{selectedProvider}</span>
              <ChevronDown size={14} />
            </button>
            {showFilter && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-cinema-panel border border-cinema-border rounded-lg overflow-hidden shadow-xl z-50">
                {["All", "Netflix", "Prime Video", "Disney+", "HBO", "Apple TV+"].map((provider) => (
                  <button
                    key={provider}
                    onClick={() => { setSelectedProvider(provider); setShowFilter(false); }}
                    className={`w-full px-4 py-2 text-left text-sm transition ${selectedProvider === provider ? "bg-brand/20 text-brand" : "hover:bg-cinema-card/50"}`}
                  >
                    {provider}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Admin Link */}
          <a href="/admin/login" className="text-gray-400 hover:text-brand transition p-2">
            <Menu size={22} />
          </a>

          {/* User Profile Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-8 h-8 rounded-full bg-brand flex items-center justify-center font-bold text-sm cursor-pointer hover:opacity-80 transition"
            >
              U
            </button>
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-cinema-panel border border-cinema-border rounded-lg overflow-hidden shadow-xl z-50">
                <div className="px-4 py-3 border-b border-cinema-border">
                  <p className="font-bold">User Profile</p>
                  <p className="text-xs text-gray-400">Premium Member</p>
                </div>
                <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-cinema-card/50 transition text-left">
                  <Film size={18} /> Continue Watching
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-cinema-card/50 transition text-left">
                  <Heart size={18} /> My List
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-cinema-card/50 transition text-left">
                  <Settings size={18} /> Settings
                </button>
                <hr className="border-cinema-border my-1" />
                <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-cinema-card/50 transition text-left text-red-400">
                  <LogOut size={18} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-20 pb-20 px-6">
        {/* Hero Banner */}
        {featuredMovie && (
          <HeroBanner
            movie={featuredMovie}
            onPlay={() => handlePlay(featuredMovie)}
            onMoreInfo={() => setSelectedMovie(featuredMovie)}
          />
        )}

        {/* Content Rows */}
        <div className="space-y-8 mt-12">
          {continueWatchingMovies.length > 0 && (
            <ContentRow title="Continue Watching" movies={continueWatchingMovies} onMovieClick={setSelectedMovie} />
          )}
          <ContentRow title="Trending Now" movies={trendingMovies} onMovieClick={setSelectedMovie} />
          <ContentRow title="Top Rated" movies={topRated} onMovieClick={setSelectedMovie} />
        </div>
      </div>

      {/* Detail Modal */}
      {selectedMovie && (
        <DetailModal
          movie={selectedMovie}
          isOpen={!!selectedMovie}
          onClose={() => setSelectedMovie(null)}
          onPlay={handlePlay}
        />
      )}
    </main>
  );
}