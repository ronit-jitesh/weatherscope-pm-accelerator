'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getRecents, addRecent, getLastLocation, resolveQuery } from '@/lib/recents';
import { UnitToggle } from '@/lib/units';
import SearchBar from '@/components/SearchBar';
import CurrentWeather from '@/components/CurrentWeather';
import DayBrief from '@/components/DayBrief';
import HourlyForecast from '@/components/HourlyForecast';
import ForecastGrid from '@/components/ForecastGrid';
import SunArc from '@/components/SunArc';
import WeatherMap from '@/components/WeatherMap';
import PackingAdvisory from '@/components/PackingAdvisory';
import AirQualityCard from '@/components/AirQualityCard';
import SaveRecordModal from '@/components/SaveRecordModal';
import AboutPMA from '@/components/AboutPMA';
import type { GeocodedLocation, WeatherData, AirQualityData } from '@/types/weather';

type State = 'idle' | 'loading' | 'success' | 'error';

export default function HomePage() {
  const [state, setState] = useState<State>('idle');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [aqi, setAqi] = useState<AirQualityData | null>(null);
  const [weatherError, setWeatherError] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<GeocodedLocation | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savedBanner, setSavedBanner] = useState(false);
  const [recents, setRecents] = useState<GeocodedLocation[]>([]);

  const handleLocationSelect = useCallback(async (location: GeocodedLocation) => {
    setSelectedLocation(location);
    setState('loading');
    setWeatherError('');
    setAqi(null);

    try {
      const params = new URLSearchParams({
        latitude: String(location.latitude),
        longitude: String(location.longitude),
        name: location.name,
        country: location.country,
        ...(location.admin1 && { admin1: location.admin1 }),
        timezone: location.timezone || 'auto',
      });

      const [weatherRes, aqiRes] = await Promise.all([
        fetch(`/api/weather?${params}`),
        fetch(`/api/air-quality?latitude=${location.latitude}&longitude=${location.longitude}`),
      ]);

      if (!weatherRes.ok) {
        const err = await weatherRes.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || `Weather service returned ${weatherRes.status}`);
      }

      const [weatherData, aqiData] = await Promise.all([
        weatherRes.json(),
        aqiRes.ok ? aqiRes.json() : Promise.resolve(null),
      ]);

      setWeather(weatherData);
      setAqi(aqiData);
      setState('success');

      // Make it sticky + shareable: remember it, and reflect it in the URL
      setRecents(addRecent(location));
      const label = [location.name, location.admin1, location.country].filter(Boolean).join(', ');
      const url = new URL(window.location.href);
      url.searchParams.set('q', label);
      window.history.replaceState(null, '', url.toString());
    } catch (err) {
      setWeatherError(err instanceof Error ? err.message : 'We couldn’t load the weather. Please try again.');
      setState('error');
    }
  }, []);

  // On first load: open a shared ?q= link, else reopen your last location
  useEffect(() => {
    setRecents(getRecents());
    const q = new URLSearchParams(window.location.search).get('q');
    if (q) {
      resolveQuery(q).then((loc) => { if (loc) handleLocationSelect(loc); });
      return;
    }
    const last = getLastLocation();
    if (last) handleLocationSelect(last);
  }, [handleLocationSelect]);

  function handleSaved() {
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 4000);
  }

  return (
    <div className="relative min-h-screen grain ambient-glow">
      {/* Header */}
      <header className="sticky top-0 z-40">
        <div className="bg-black/80 backdrop-blur-md border-b hairline">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="WeatherScope" className="h-10 w-10 rounded-lg object-cover" />
              <span className="flex flex-col leading-none">
                <span className="font-bold tracking-tight">WeatherScope</span>
                <span className="text-[11px] text-dim mt-0.5">by Ronit Jitesh</span>
              </span>
            </Link>
            <div className="flex items-center gap-2.5">
              <UnitToggle />
              <Link href="/compare" className="btn-ghost inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium">
                🆚 <span className="hidden sm:inline">Compare</span>
              </Link>
              <Link href="/history" className="btn-ghost inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium">
                🗃️ <span className="hidden sm:inline">History</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 py-10 sm:py-14 space-y-7">
        {/* Hero search, opacity-only fade (no translate) so the search box is
            clickable at its final position immediately, avoiding a "moved as I clicked" miss */}
        <div className="text-center space-y-5 animate-fade-in">
          <div className="inline-flex items-center gap-2 pill">
            <span className="h-2 w-2 rounded-full neon-dot" style={{ background: 'var(--accent)' }} />
            Live data · no API key required
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight leading-[1.05]">
            Make weather data<br /><span className="neon-text" style={{ color: 'var(--accent)' }}>work for you</span>
          </h1>
          <p className="text-dim text-base sm:text-lg max-w-xl mx-auto">
            Live conditions, an hourly and seven-day outlook, air quality, and smart insights
            for any city, postcode, landmark, or coordinate on Earth.
          </p>
          <div className="pt-2">
            <SearchBar onLocationSelect={handleLocationSelect} loading={state === 'loading'} />
          </div>

          {recents.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto pt-1">
              <span className="text-xs text-dim">Recent</span>
              {recents.map((loc, i) => (
                <button
                  key={i}
                  onClick={() => handleLocationSelect(loc)}
                  className="px-2.5 py-1 rounded-full bg-[var(--surface-2)] text-dim hover:text-white text-xs transition-colors"
                  title={[loc.name, loc.admin1, loc.country].filter(Boolean).join(', ')}
                >
                  📍 {loc.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loading */}
        {state === 'loading' && (
          <div className="space-y-4">
            <div className="h-80 rounded-[28px] skeleton" />
            <div className="h-28 rounded-[28px] skeleton" />
          </div>
        )}

        {/* Error */}
        {state === 'error' && (
          <div className="card p-8 text-center max-w-lg mx-auto animate-fade-up">
            <div className="text-5xl mb-3">🌧️</div>
            <p className="text-lg font-semibold mb-1">That didn’t work</p>
            <p className="text-sm text-dim mb-4">{weatherError}</p>
            <p className="text-xs text-dimmer">
              Double-check the spelling, or try coordinates like <code className="font-mono" style={{ color: 'var(--accent)' }}>48.8566, 2.3522</code>.
            </p>
          </div>
        )}

        {/* Success */}
        {state === 'success' && weather && (
          <div className="space-y-7">
            {savedBanner && (
              <div className="card px-4 py-3 flex items-center gap-2 text-sm animate-fade-up">
                <span style={{ color: 'var(--accent)' }}>✅</span>
                <span>Saved to your history.</span>
                <Link href="/history" className="font-medium underline" style={{ color: 'var(--accent)' }}>View records →</Link>
              </div>
            )}

            <CurrentWeather data={weather} />
            <DayBrief data={weather} />
            {weather.hourly?.length > 0 && <HourlyForecast hourly={weather.hourly} timezone={weather.timezone} />}
            {weather.daily[0] && <PackingAdvisory today={weather.daily[0]} />}
            <ForecastGrid daily={weather.daily} timezone={weather.timezone} />
            {weather.daily[0] && <SunArc today={weather.daily[0]} timezone={weather.timezone} />}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <WeatherMap
                latitude={weather.location.latitude}
                longitude={weather.location.longitude}
                locationName={weather.location.name}
              />
              {aqi ? (
                <AirQualityCard data={aqi} />
              ) : (
                <div className="card grid place-items-center min-h-[200px] text-sm text-dim">
                  Air-quality data isn’t available here
                </div>
              )}
            </div>

            {/* Save CTA */}
            <div className="card p-5 sm:p-6 flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="font-semibold">Heading here later? Save it.</p>
                <p className="text-sm text-dim mt-0.5">
                  Pick a date range to archive temperature data and revisit it anytime.
                </p>
              </div>
              <button onClick={() => setShowSaveModal(true)} className="btn-accent px-5 py-2.5 text-sm">
                🗃️ Save this location
              </button>
            </div>
          </div>
        )}

        {/* Idle */}
        {state === 'idle' && (
          <div className="text-center py-12 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <div className="text-7xl mb-4 float-icon inline-block">🌍</div>
            <p className="text-lg font-medium">Search a place to begin</p>
            <p className="text-sm text-dim mt-1">Real conditions, real data, for anywhere on the map.</p>
          </div>
        )}

        <AboutPMA />
      </main>

      {showSaveModal && selectedLocation && (
        <SaveRecordModal
          location={selectedLocation}
          onSaved={handleSaved}
          onClose={() => setShowSaveModal(false)}
        />
      )}
    </div>
  );
}
