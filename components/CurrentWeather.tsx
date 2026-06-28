'use client';

import { getWmoInfo } from '@/lib/wmo-codes';
import { windDirectionLabel } from '@/lib/weather';
import { useUnits } from '@/lib/units';
import type { WeatherData } from '@/types/weather';

interface Props {
  data: WeatherData;
}

/** 270° speedometer-style arc gauge with a yellow fill + dot terminator. */
function ArcGauge({ temp, min, max, wind }: { temp: number; min: number; max: number; wind: number }) {
  const u = useUnits();
  const R = 92;
  const CX = 110;
  const CY = 110;
  const C = 2 * Math.PI * R;
  const SWEEP = 0.75; // 270°
  const arcLen = C * SWEEP;

  const frac = Math.max(0, Math.min(1, (temp - min) / Math.max(max - min, 1)));
  const fillLen = frac * arcLen;

  const dotAngle = (135 + frac * 270) * (Math.PI / 180);
  const dotX = CX + R * Math.cos(dotAngle);
  const dotY = CY + R * Math.sin(dotAngle);

  return (
    <div className="relative w-[220px] h-[220px] mx-auto">
      <svg viewBox="0 0 220 220" className="w-full h-full">
        {/* track */}
        <circle
          cx={CX} cy={CY} r={R} fill="none" stroke="#2e2e2e" strokeWidth="14" strokeLinecap="round"
          strokeDasharray={`${arcLen} ${C}`} transform={`rotate(135 ${CX} ${CY})`}
        />
        {/* fill */}
        <circle
          cx={CX} cy={CY} r={R} fill="none" stroke="var(--accent)" strokeWidth="14" strokeLinecap="round"
          strokeDasharray={`${fillLen} ${C}`} transform={`rotate(135 ${CX} ${CY})`}
        />
        {/* dot */}
        <circle cx={dotX} cy={dotY} r="9" fill="var(--accent)" stroke="#000" strokeWidth="2" />
      </svg>

      {/* center readout */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-6xl font-extralight leading-none tracking-tight">
          {u.tempVal(temp)}<span className="align-top text-2xl">°</span>
        </span>
        <span className="mt-1 text-sm text-dim">↑ {u.wind(wind)}</span>
      </div>

      {/* min / max at the arc ends */}
      <span className="absolute bottom-4 left-1 text-sm text-dim">{u.tempVal(min)}°</span>
      <span className="absolute bottom-4 right-1 text-sm text-dim">{u.tempVal(max)}°</span>
    </div>
  );
}

export default function CurrentWeather({ data }: Props) {
  const u = useUnits();
  const { current, location, daily, timezone } = data;
  const wmo = getWmoInfo(current.weatherCode, current.isDay);
  const today = daily[0];

  const now = new Date().toLocaleString('en-US', {
    timeZone: timezone,
    weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const fmt = (iso?: string) =>
    iso ? new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: timezone }) : '—';

  function uvLabel(uv: number) {
    if (uv <= 2) return 'Low';
    if (uv <= 5) return 'Moderate';
    if (uv <= 7) return 'High';
    if (uv <= 10) return 'Very high';
    return 'Extreme';
  }

  const chips = [
    { icon: '🌡️', label: 'Feels like', value: u.temp(current.apparentTemperature) },
    { icon: '💧', label: 'Humidity', value: `${current.humidity}%` },
    { icon: '🧭', label: 'Wind', value: `${u.wind(current.windSpeed)} ${windDirectionLabel(current.windDirection)}` },
    { icon: '🌧️', label: 'Rain', value: today ? `${today.precipitationProbabilityMax}%` : '—' },
    { icon: '🔆', label: 'UV index', value: `${Math.round(current.uvIndex)} · ${uvLabel(current.uvIndex)}` },
    { icon: '☁️', label: 'Cloud', value: `${current.cloudCover}%` },
    { icon: '🌅', label: 'Sunrise', value: fmt(today?.sunrise) },
    { icon: '🌇', label: 'Sunset', value: fmt(today?.sunset) },
  ];

  return (
    <section className="card p-6 sm:p-8 animate-fade-up">
      {/* header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <span className="pill mb-3">📍 Current weather</span>
          <h2 className="text-3xl sm:text-4xl font-semibold leading-tight truncate">{location.name}</h2>
          <p className="mt-1 text-sm text-dim">
            {[location.admin1, location.country].filter(Boolean).join(' · ') ||
              `${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}`}
          </p>
        </div>
        <span className="text-xs text-dimmer whitespace-nowrap mt-1">{now}</span>
      </div>

      {/* gauge + condition + chips */}
      <div className="mt-6 grid lg:grid-cols-[240px_1fr] gap-6 lg:gap-8 items-center">
        <ArcGauge temp={current.temperature} min={today?.tempMin ?? current.temperature - 5} max={today?.tempMax ?? current.temperature + 5} wind={current.windSpeed} />

        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-5xl float-icon select-none" aria-hidden>{wmo.emoji}</span>
            <div>
              <p className="text-xl font-semibold">{wmo.description}</p>
              <p className="text-sm text-dim">Feels like {u.temp(current.apparentTemperature)} · {current.humidity}% humidity</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 stagger">
            {chips.map(({ icon, label, value }) => (
              <div key={label} className="card-2 px-3.5 py-3">
                <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-dim">
                  <span aria-hidden>{icon}</span> {label}
                </p>
                <p className="mt-1 text-base font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
