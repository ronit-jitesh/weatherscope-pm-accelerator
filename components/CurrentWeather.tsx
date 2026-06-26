'use client';

import { getWmoInfo } from '@/lib/wmo-codes';
import { windDirectionLabel } from '@/lib/weather';
import { getSkyTheme } from '@/lib/weather-theme';
import type { WeatherData } from '@/types/weather';

interface Props {
  data: WeatherData;
}

export default function CurrentWeather({ data }: Props) {
  const { current, location, daily, timezone } = data;
  const wmo = getWmoInfo(current.weatherCode, current.isDay);
  const theme = getSkyTheme(current.weatherCode, current.isDay);
  const today = daily[0];

  const now = new Date().toLocaleString('en-US', {
    timeZone: timezone,
    weekday: 'long', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const fmt = (iso?: string) =>
    iso
      ? new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: timezone })
      : '—';

  function uvLabel(uv: number) {
    if (uv <= 2) return 'Low';
    if (uv <= 5) return 'Moderate';
    if (uv <= 7) return 'High';
    if (uv <= 10) return 'Very high';
    return 'Extreme';
  }

  const details = [
    { icon: '🌡️', label: 'Feels like', value: `${Math.round(current.apparentTemperature)}°` },
    { icon: '💧', label: 'Humidity', value: `${current.humidity}%` },
    { icon: '💨', label: 'Wind', value: `${Math.round(current.windSpeed)} km/h ${windDirectionLabel(current.windDirection)}` },
    { icon: '🌧️', label: 'Rain chance', value: today ? `${today.precipitationProbabilityMax}%` : '—' },
    { icon: '🔆', label: 'UV index', value: `${Math.round(current.uvIndex)} · ${uvLabel(current.uvIndex)}` },
    { icon: '🧭', label: 'Pressure', value: `${Math.round(current.pressure)} hPa` },
    { icon: '🌅', label: 'Sunrise', value: fmt(today?.sunrise) },
    { icon: '🌇', label: 'Sunset', value: fmt(today?.sunset) },
  ];

  return (
    <section
      className="relative overflow-hidden rounded-[28px] p-6 sm:p-8 text-white shadow-2xl animate-fade-up"
      style={{ background: theme.heroGradient }}
    >
      {/* decorative orbs */}
      <div className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

      <div className="relative">
        {/* Top row: place + icon */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/70">
              {now}
            </p>
            <h2 className="mt-1 text-3xl sm:text-4xl font-semibold leading-tight truncate">
              {location.name}
            </h2>
            <p className="mt-0.5 text-sm text-white/80">
              {[location.admin1, location.country].filter(Boolean).join(' · ') || `${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}`}
            </p>
          </div>
          <div className="shrink-0 text-7xl sm:text-8xl float-icon select-none" aria-hidden>
            {wmo.emoji}
          </div>
        </div>

        {/* Temperature block */}
        <div className="mt-4 flex flex-wrap items-end gap-x-6 gap-y-2">
          <div className="flex items-start">
            <span className="text-[5.5rem] sm:text-[7rem] font-extralight leading-[0.85] tracking-tight">
              {Math.round(current.temperature)}
            </span>
            <span className="mt-2 text-3xl font-light text-white/80">°C</span>
          </div>
          <div className="mb-3 space-y-1">
            <p className="text-lg font-medium">{wmo.description}</p>
            {today && (
              <p className="text-sm text-white/80">
                ↑ {Math.round(today.tempMax)}°&nbsp;&nbsp;↓ {Math.round(today.tempMin)}°
                <span className="mx-2 text-white/40">|</span>
                Feels {Math.round(current.apparentTemperature)}°
              </p>
            )}
          </div>
        </div>

        {/* Detail chips */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2.5 stagger">
          {details.map(({ icon, label, value }) => (
            <div
              key={label}
              className="rounded-2xl bg-white/12 px-3.5 py-3 ring-1 ring-white/15 backdrop-blur-sm"
            >
              <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-white/70">
                <span aria-hidden>{icon}</span> {label}
              </p>
              <p className="mt-1 text-base font-semibold">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
