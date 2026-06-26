'use client';

import { useState, useRef, useEffect } from 'react';
import type { GeocodedLocation } from '@/types/weather';

interface Props {
  onLocationSelect: (location: GeocodedLocation) => void;
  loading?: boolean;
}

export default function SearchBar({ onLocationSelect, loading }: Props) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeocodedLocation[]>([]);
  const [searching, setSearching] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function search(q: string) {
    if (!q.trim()) { setSuggestions([]); setShowDropdown(false); return; }
    setSearching(true);
    setError('');
    try {
      const res = await fetch(`/api/geocode?query=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Location not found');
        setSuggestions([]);
        setShowDropdown(false);
      } else {
        setSuggestions(data.results);
        setShowDropdown(true);
        setError('');
      }
    } catch {
      setError('Search failed — check your connection');
    } finally {
      setSearching(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length >= 2) {
      debounceRef.current = setTimeout(() => search(val), 400);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    search(query);
  }

  function handleSelect(loc: GeocodedLocation) {
    setQuery([loc.name, loc.admin1, loc.country].filter(Boolean).join(', '));
    setShowDropdown(false);
    onLocationSelect(loc);
  }

  function handleGeolocate() {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    setGeoLoading(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(`/api/geocode?query=${latitude},${longitude}`);
          const data = await res.json();
          if (res.ok && data.results?.length) {
            handleSelect(data.results[0]);
          } else {
            // fallback: use raw coords
            onLocationSelect({ name: 'Current Location', country: '', latitude, longitude, timezone: 'auto' });
            setQuery('Current Location');
          }
        } catch {
          onLocationSelect({ name: 'Current Location', country: '', latitude, longitude, timezone: 'auto' });
          setQuery('Current Location');
        } finally {
          setGeoLoading(false);
        }
      },
      (err) => {
        setGeoLoading(false);
        setError(
          err.code === 1 ? 'Location access denied — please allow location permissions'
          : err.code === 2 ? 'Location unavailable — try searching manually'
          : 'Location request timed out',
        );
      },
      { timeout: 10000 },
    );
  }

  return (
    <div ref={wrapperRef} className="w-full max-w-2xl mx-auto relative">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
            placeholder="Search city, zip code, coordinates, landmark…"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm shadow-sm"
            disabled={loading}
          />
          {(searching || loading) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={!query.trim() || loading || searching}
          className="px-5 py-3 bg-sky-500 hover:bg-sky-600 disabled:opacity-40 text-white rounded-xl font-medium text-sm transition-colors shadow-sm"
        >
          Search
        </button>
        <button
          type="button"
          onClick={handleGeolocate}
          disabled={geoLoading || loading}
          title="Use my location"
          className="px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40 text-gray-700 dark:text-gray-300 rounded-xl text-sm transition-colors shadow-sm"
        >
          {geoLoading ? (
            <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <span>📍</span>
          )}
        </button>
      </form>

      {/* Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
          {suggestions.map((loc, i) => (
            <button
              key={i}
              onClick={() => handleSelect(loc)}
              className="w-full text-left px-4 py-3 hover:bg-sky-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0"
            >
              <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">{loc.name}</span>
              {(loc.admin1 || loc.country) && (
                <span className="ml-2 text-gray-500 dark:text-gray-400 text-xs">
                  {[loc.admin1, loc.country].filter(Boolean).join(', ')}
                </span>
              )}
              {loc.population && (
                <span className="ml-2 text-gray-400 text-xs">pop. {loc.population.toLocaleString()}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="mt-2 text-sm text-red-500 dark:text-red-400 flex items-center gap-1">
          <span>⚠️</span> {error}
        </p>
      )}

      <p className="mt-2 text-xs text-gray-400 text-center">
        Try: city name, &quot;48.8566,2.3522&quot;, postal code, or a landmark
      </p>
    </div>
  );
}
