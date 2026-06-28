'use client';

import { useState } from 'react';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import { UnitToggle, useUnits } from '@/lib/units';
import { getWmoInfo } from '@/lib/wmo-codes';
import { windDirectionLabel } from '@/lib/weather';
import type { GeocodedLocation, WeatherData } from '@/types/weather';

interface Entry {
  id: string;
  loc: GeocodedLocation;
  weather: WeatherData | null;
  error?: boolean;
}

const MAX = 3;

export default function ComparePage() {
  const u = useUnits();
  const [entries, setEntries] = useState<Entry[]>([]);

  async function add(loc: GeocodedLocation) {
    if (entries.length >= MAX) return;
    const id = `${loc.latitude},${loc.longitude}`;
    if (entries.some((e) => e.id === id)) return;

    setEntries((prev) => [...prev, { id, loc, weather: null }]);
    try {
      const params = new URLSearchParams({
        latitude: String(loc.latitude),
        longitude: String(loc.longitude),
        name: loc.name,
        country: loc.country,
        ...(loc.admin1 && { admin1: loc.admin1 }),
        timezone: loc.timezone || 'auto',
      });
      const res = await fetch(`/api/weather?${params}`);
      if (!res.ok) throw new Error('failed');
      const w = (await res.json()) as WeatherData;
      setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, weather: w } : e)));
    } catch {
      setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, error: true } : e)));
    }
  }

  function remove(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  const loaded = entries.filter((e) => e.weather);
  const warmestTemp = loaded.length ? Math.max(...loaded.map((e) => e.weather!.current.temperature)) : null;
  const driestRain = loaded.length ? Math.min(...loaded.map((e) => e.weather!.daily[0]?.precipitationProbabilityMax ?? 100)) : null;

  return (
    <div className="relative min-h-screen grain ambient-glow">
      <header className="sticky top-0 z-40">
        <div className="bg-black/80 backdrop-blur-md border-b hairline">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="btn-ghost inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium">← Back</Link>
              <span className="font-semibold tracking-tight hidden sm:inline">Compare cities</span>
            </div>
            <UnitToggle />
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 py-10 space-y-7">
        <div className="text-center space-y-4 animate-fade-in">
          <span className="pill pill-accent">Compare</span>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">Two cities, side by side</h1>
          <p className="text-dim text-sm sm:text-base max-w-xl mx-auto">
            Deciding where to go? Add up to three places and compare their weather at a glance.
          </p>
          {entries.length < MAX && (
            <div className="pt-2">
              <SearchBar onLocationSelect={add} />
            </div>
          )}
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-12 text-dim animate-fade-up">
            <div className="text-6xl mb-3">🆚</div>
            <p className="font-medium text-white">Add a city to start comparing</p>
            <p className="text-sm mt-1">Then add a second (and a third) to see them next to each other.</p>
          </div>
        ) : (
          <div className={`grid gap-4 ${entries.length === 1 ? 'sm:grid-cols-1 max-w-md mx-auto' : entries.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
            {entries.map((e) => {
              const w = e.weather;
              const today = w?.daily[0];
              const wmo = w ? getWmoInfo(w.current.weatherCode, w.current.isDay) : null;
              const isWarmest = w && warmestTemp !== null && w.current.temperature === warmestTemp && loaded.length > 1;
              const isDriest = w && driestRain !== null && (today?.precipitationProbabilityMax ?? 100) === driestRain && loaded.length > 1;

              return (
                <section key={e.id} className="card p-5 animate-fade-up">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="text-xl font-semibold truncate">{e.loc.name}</h2>
                      <p className="text-xs text-dim truncate">
                        {[e.loc.admin1, e.loc.country].filter(Boolean).join(' · ') || `${e.loc.latitude.toFixed(2)}, ${e.loc.longitude.toFixed(2)}`}
                      </p>
                    </div>
                    <button onClick={() => remove(e.id)} aria-label={`Remove ${e.loc.name}`}
                      className="shrink-0 grid h-7 w-7 place-items-center rounded-full bg-[var(--surface-2)] text-dim hover:text-white transition-colors">✕</button>
                  </div>

                  {!w && !e.error && (
                    <div className="h-44 mt-4 rounded-2xl skeleton" />
                  )}
                  {e.error && (
                    <p className="mt-6 text-sm text-red-400">Couldn’t load this location.</p>
                  )}

                  {w && wmo && (
                    <>
                      <div className="mt-3 flex items-center gap-3">
                        <span className="text-5xl select-none" aria-hidden>{wmo.emoji}</span>
                        <div>
                          <p className="text-4xl font-light leading-none">{u.temp(w.current.temperature)}</p>
                          <p className="text-sm text-dim mt-1">{wmo.description}</p>
                        </div>
                      </div>

                      {(isWarmest || isDriest) && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {isWarmest && <span className="pill pill-accent">☀️ Warmest</span>}
                          {isDriest && <span className="pill pill-accent">🌂 Driest</span>}
                        </div>
                      )}

                      <div className="mt-4 divide-y divide-white/5 text-sm">
                        {[
                          ['Feels like', u.temp(w.current.apparentTemperature)],
                          ['High / Low', today ? `${u.tempVal(today.tempMax)}° / ${u.tempVal(today.tempMin)}°` : '—'],
                          ['Rain chance', today ? `${today.precipitationProbabilityMax}%` : '—'],
                          ['Wind', `${u.wind(w.current.windSpeed)} ${windDirectionLabel(w.current.windDirection)}`],
                          ['Humidity', `${w.current.humidity}%`],
                          ['UV index', `${Math.round(w.current.uvIndex)}`],
                        ].map(([label, value]) => (
                          <div key={label} className="flex items-center justify-between py-2">
                            <span className="text-dim">{label}</span>
                            <span className="font-medium">{value}</span>
                          </div>
                        ))}
                      </div>

                      <Link href={`/?q=${encodeURIComponent([e.loc.name, e.loc.admin1, e.loc.country].filter(Boolean).join(', '))}`}
                        className="mt-4 block text-center text-xs font-medium text-[var(--accent)] hover:underline">
                        Full forecast →
                      </Link>
                    </>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
