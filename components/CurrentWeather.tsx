'use client';

import { getWmoInfo } from '@/lib/wmo-codes';
import { windDirectionLabel } from '@/lib/weather';
import type { WeatherData } from '@/types/weather';

interface Props {
  data: WeatherData;
}

export default function CurrentWeather({ data }: Props) {
  const { current, location, daily, timezone } = data;
  const wmo = getWmoInfo(current.weatherCode, current.isDay);
  const today = daily[0];

  const now = new Date().toLocaleString('en-US', {
    timeZone: timezone,
    weekday: 'long', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const sunrise = today?.sunrise
    ? new Date(today.sunrise).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: timezone })
    : '—';
  const sunset = today?.sunset
    ? new Date(today.sunset).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: timezone })
    : '—';

  function uvLabel(uv: number) {
    if (uv <= 2) return { label: 'Low', color: 'text-green-500' };
    if (uv <= 5) return { label: 'Moderate', color: 'text-yellow-500' };
    if (uv <= 7) return { label: 'High', color: 'text-orange-500' };
    if (uv <= 10) return { label: 'Very High', color: 'text-red-500' };
    return { label: 'Extreme', color: 'text-purple-500' };
  }

  const uvInfo = uvLabel(current.uvIndex);

  return (
    <div className="bg-gradient-to-br from-sky-500 to-blue-700 text-white rounded-2xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-2xl font-bold">
            {location.name}
            {location.admin1 && <span className="font-normal opacity-80">, {location.admin1}</span>}
          </h2>
          <p className="text-sm opacity-80">{location.country}</p>
          <p className="text-xs opacity-60 mt-0.5">{now}</p>
        </div>
        <div className="text-right">
          <div className="text-6xl leading-none">{wmo.emoji}</div>
          <p className="text-sm opacity-90 mt-1">{wmo.description}</p>
        </div>
      </div>

      {/* Temperature */}
      <div className="mt-4 flex items-end gap-4">
        <div>
          <span className="text-7xl font-thin">{Math.round(current.temperature)}°</span>
          <span className="text-2xl opacity-70">C</span>
        </div>
        <div className="mb-3 opacity-80">
          <p className="text-sm">Feels like {Math.round(current.apparentTemperature)}°C</p>
          {today && (
            <p className="text-sm">H: {Math.round(today.tempMax)}° / L: {Math.round(today.tempMin)}°</p>
          )}
        </div>
      </div>

      {/* Detail grid */}
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {[
          { icon: '💧', label: 'Humidity', value: `${current.humidity}%` },
          { icon: '💨', label: 'Wind', value: `${Math.round(current.windSpeed)} km/h ${windDirectionLabel(current.windDirection)}` },
          { icon: '🌡️', label: 'Pressure', value: `${Math.round(current.pressure)} hPa` },
          { icon: '☁️', label: 'Cloud cover', value: `${current.cloudCover}%` },
          { icon: '🌧️', label: 'Precip prob.', value: today ? `${today.precipitationProbabilityMax}%` : '—' },
          { icon: '🔆', label: 'UV Index', value: `${current.uvIndex} (${uvInfo.label})` },
          { icon: '🌅', label: 'Sunrise', value: sunrise },
          { icon: '🌇', label: 'Sunset', value: sunset },
        ].map(({ icon, label, value }) => (
          <div key={label} className="bg-white/10 rounded-xl px-3 py-2">
            <p className="text-xs opacity-70">{icon} {label}</p>
            <p className="text-sm font-semibold mt-0.5">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
