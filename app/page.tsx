'use client';

import { useState } from 'react';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import CurrentWeather from '@/components/CurrentWeather';
import ForecastGrid from '@/components/ForecastGrid';
import WeatherMap from '@/components/WeatherMap';
import PackingAdvisory from '@/components/PackingAdvisory';
import AirQualityCard from '@/components/AirQualityCard';
import SaveRecordModal from '@/components/SaveRecordModal';
import AboutPMA from '@/components/AboutPMA';
import { getSkyTheme } from '@/lib/weather-theme';
import type { GeocodedLocation, WeatherData, AirQualityData } from '@/types/weather';

type State = 'idle' | 'loading' | 'success' | 'error';

const DEFAULT_GRADIENT = 'linear-gradient(180deg, #4f9bf5 0%, #9cc6f7 42%, #e9f1fc 100%)';
const DEFAULT_GLOW = 'radial-gradient(720px 380px at 84% 6%, rgba(255, 221, 120, 0.45), transparent 70%)';

export default function HomePage() {
  const [state, setState] = useState<State>('idle');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [aqi, setAqi] = useState<AirQualityData | null>(null);
  const [weatherError, setWeatherError] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<GeocodedLocation | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savedBanner, setSavedBanner] = useState(false);

  const theme = weather ? getSkyTheme(weather.current.weatherCode, weather.current.isDay) : null;

  async function handleLocationSelect(location: GeocodedLocation) {
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
    } catch (err) {
      setWeatherError(err instanceof Error ? err.message : 'We couldn’t load the weather. Please try again.');
      setState('error');
    }
  }

  function handleSaved() {
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 4000);
  }

  return (
    <div className="relative min-h-screen">
      {/* Dynamic atmospheric backdrop */}
      <div className="sky-backdrop" style={{ background: theme?.pageGradient ?? DEFAULT_GRADIENT }} />
      <div className="sky-glow" style={{ background: theme?.glow ?? DEFAULT_GLOW }} />

      {/* Header */}
      <header className="sticky top-0 z-40">
        <div className="glass border-b hairline">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white text-lg shadow-lg shadow-indigo-500/20">⛅</span>
              <span className="flex flex-col leading-none">
                <span className="font-semibold tracking-tight">WeatherScope</span>
                <span className="text-[11px] text-muted mt-0.5">by Ronit Jitesh</span>
              </span>
            </Link>
            <Link
              href="/history"
              className="glass-strong inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-all hover:ring-2 hover:ring-[var(--accent)]/40 active:scale-95"
            >
              🗃️ <span className="hidden sm:inline">History &amp; export</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10 sm:py-14 space-y-8">
        {/* Hero search */}
        <div className="text-center space-y-5 animate-fade-up">
          <div className="inline-flex items-center gap-2 glass rounded-full px-3.5 py-1.5 text-xs font-medium text-muted">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Live data · no API key required
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Weather, beautifully clear
          </h1>
          <p className="text-muted text-base sm:text-lg max-w-xl mx-auto">
            Live conditions, a seven-day outlook, air quality, and a smart packing brief —
            for any city, postcode, landmark, or coordinate on Earth.
          </p>
          <div className="pt-2">
            <SearchBar onLocationSelect={handleLocationSelect} loading={state === 'loading'} />
          </div>
        </div>

        {/* Loading skeleton */}
        {state === 'loading' && (
          <div className="space-y-4">
            <div className="h-72 rounded-[28px] skeleton" />
            <div className="h-28 rounded-3xl skeleton" />
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {Array.from({ length: 7 }).map((_, i) => <div key={i} className="h-44 rounded-3xl skeleton" />)}
            </div>
          </div>
        )}

        {/* Error state */}
        {state === 'error' && (
          <div className="glass rounded-3xl p-8 text-center max-w-lg mx-auto animate-fade-up">
            <div className="text-5xl mb-3">🌧️</div>
            <p className="text-lg font-semibold mb-1">That didn’t work</p>
            <p className="text-sm text-muted mb-4">{weatherError}</p>
            <p className="text-xs text-muted">
              Double-check the spelling, or try coordinates like <code className="font-mono">48.8566, 2.3522</code>.
            </p>
          </div>
        )}

        {/* Success */}
        {state === 'success' && weather && (
          <div className="space-y-8">
            {savedBanner && (
              <div className="glass rounded-2xl px-4 py-3 flex items-center gap-2 text-sm animate-fade-up">
                <span className="text-emerald-500">✅</span>
                <span>Saved to your history.</span>
                <Link href="/history" className="font-medium text-[var(--accent)] underline">View records →</Link>
              </div>
            )}

            <CurrentWeather data={weather} />
            {weather.daily[0] && <PackingAdvisory today={weather.daily[0]} />}
            <ForecastGrid daily={weather.daily} timezone={weather.timezone} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <WeatherMap
                latitude={weather.location.latitude}
                longitude={weather.location.longitude}
                locationName={weather.location.name}
              />
              {aqi ? (
                <AirQualityCard data={aqi} />
              ) : (
                <div className="glass rounded-3xl grid place-items-center min-h-[200px] text-sm text-muted">
                  Air-quality data isn’t available here
                </div>
              )}
            </div>

            {/* Save CTA */}
            <div className="glass rounded-3xl p-5 sm:p-6 flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="font-semibold">Heading here later? Save it.</p>
                <p className="text-sm text-muted mt-0.5">
                  Pick a date range to archive temperature data and revisit it anytime.
                </p>
              </div>
              <button
                onClick={() => setShowSaveModal(true)}
                className="px-5 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-strong)] text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-[var(--accent)]/25 active:scale-95"
              >
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
            <p className="text-sm text-muted mt-1">The sky above adapts to whatever you find.</p>
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
