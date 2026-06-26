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
    // Use 'click' (not 'mousedown') so a click on a suggestion selects it
    // before the outside-close fires — avoids a select-vs-close race.
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
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
      <form onSubmit={handleSubmit} className="flex gap-2.5">
        <div className="flex-1 relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-dim text-base">🔍</span>
          <input
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
            placeholder="Search any city, postcode, landmark or lat,lon…"
            className="card-2 w-full pl-11 pr-10 py-3.5 text-[15px] text-white placeholder:text-dimmer focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-shadow"
            disabled={loading}
          />
          {(searching || loading) && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={!query.trim() || loading || searching}
          className="btn-accent px-6 py-3.5 text-sm disabled:opacity-40"
        >
          Search
        </button>
        <button
          type="button"
          onClick={handleGeolocate}
          disabled={geoLoading || loading}
          title="Use my current location"
          className="btn-ghost px-4 py-3.5 text-base disabled:opacity-40"
        >
          {geoLoading ? (
            <div className="w-4 h-4 border-2 border-[var(--text-dim)] border-t-transparent rounded-full animate-spin" />
          ) : (
            <span aria-hidden>📍</span>
          )}
        </button>
      </form>

      {/* Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div className="card-2 absolute top-full left-0 right-0 z-50 mt-2 overflow-hidden animate-fade-in border border-white/10">
          {suggestions.map((loc, i) => (
            <button
              key={i}
              onClick={() => handleSelect(loc)}
              className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-[var(--accent)]/15 transition-colors border-b hairline last:border-0"
            >
              <span className="text-lg" aria-hidden>📌</span>
              <span className="min-w-0 flex-1">
                <span className="font-medium text-[15px]">{loc.name}</span>
                {(loc.admin1 || loc.country) && (
                  <span className="ml-2 text-dim text-xs">
                    {[loc.admin1, loc.country].filter(Boolean).join(', ')}
                  </span>
                )}
              </span>
              {loc.population ? (
                <span className="text-dimmer text-[11px] shrink-0">{(loc.population / 1000).toFixed(0)}k people</span>
              ) : null}
            </button>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="mt-2.5 text-sm text-red-400 flex items-center justify-center gap-1.5">
          <span aria-hidden>⚠️</span> {error}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs">
        <span className="text-dim">Try</span>
        {['London', 'Tokyo', '48.8566, 2.3522', 'Eiffel Tower'].map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => { setQuery(ex); search(ex); }}
            className="px-2.5 py-1 rounded-full bg-[var(--surface-2)] text-dim hover:text-white transition-colors"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}
