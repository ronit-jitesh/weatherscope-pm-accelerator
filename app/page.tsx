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
        throw new Error((err as { error?: string }).error || `Weather API returned ${weatherRes.status}`);
      }

      const [weatherData, aqiData] = await Promise.all([
        weatherRes.json(),
        aqiRes.ok ? aqiRes.json() : Promise.resolve(null),
      ]);

      setWeather(weatherData);
      setAqi(aqiData);
      setState('success');
    } catch (err) {
      setWeatherError(err instanceof Error ? err.message : 'Failed to load weather. Please try again.');
      setState('error');
    }
  }

  function handleSaved() {
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 4000);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">⛅</span>
            <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">WeatherScope</span>
            <span className="hidden sm:inline text-xs text-gray-400 ml-1">by Ronit Jitesh</span>
          </div>
          <Link
            href="/history"
            className="text-xs sm:text-sm font-medium text-sky-500 hover:text-sky-600 flex items-center gap-1"
          >
            🗃️ <span>History &amp; Export</span>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Hero search */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            Real-time Weather Intelligence
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base max-w-xl mx-auto">
            Search any city, postal code, coordinates, or landmark — get current conditions, 7-day forecast, air quality, and a personalised packing advisory.
          </p>
          <SearchBar onLocationSelect={handleLocationSelect} loading={state === 'loading'} />
        </div>

        {/* Loading skeleton */}
        {state === 'loading' && (
          <div className="space-y-4 animate-pulse">
            <div className="h-56 bg-sky-200 dark:bg-sky-900/30 rounded-2xl" />
            <div className="h-36 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
          </div>
        )}

        {/* Error state */}
        {state === 'error' && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-2xl p-6 text-center">
            <p className="text-red-600 dark:text-red-400 font-medium text-lg mb-2">⚠️ Weather data unavailable</p>
            <p className="text-red-500 dark:text-red-400 text-sm mb-4">{weatherError}</p>
            <p className="text-gray-400 text-xs">
              Check the location name, or try coordinates like &quot;48.8566,2.3522&quot;
            </p>
          </div>
        )}

        {/* Success state */}
        {state === 'success' && weather && (
          <>
            {savedBanner && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl px-4 py-3 flex items-center gap-2 text-green-700 dark:text-green-400 text-sm">
                <span>✅</span> Weather record saved to your history!{' '}
                <Link href="/history" className="underline font-medium">View records →</Link>
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
                <div className="flex items-center justify-center h-full min-h-[160px] bg-gray-100 dark:bg-gray-800 rounded-2xl text-gray-400 text-sm">
                  Air quality data unavailable for this location
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 flex items-center justify-between flex-wrap gap-4 shadow-sm">
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">Save this location to your history</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Choose a date range to store temperature data and revisit it anytime.
                </p>
              </div>
              <button
                onClick={() => setShowSaveModal(true)}
                className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-medium text-sm transition-colors shadow-sm"
              >
                🗃️ Save Record
              </button>
            </div>
          </>
        )}

        {state === 'idle' && (
          <div className="text-center py-10 text-gray-300 dark:text-gray-700">
            <p className="text-6xl mb-4">🌍</p>
            <p className="text-lg font-medium text-gray-400 dark:text-gray-500">Search a location to get started</p>
            <p className="text-sm text-gray-300 dark:text-gray-600 mt-1">
              Powered by Open-Meteo — no API key needed
            </p>
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
