'use client';

import { getWmoInfo } from '@/lib/wmo-codes';
import type { DailyForecast } from '@/types/weather';

interface Props {
  daily: DailyForecast[];
  timezone: string;
}

/** A single teardrop, filled by precipitation probability. */
function Droplet({ prob }: { prob: number }) {
  const active = prob >= 50;
  const mid = prob >= 20;
  const fill = active ? 'var(--accent)' : mid ? '#f0f0f0' : '#3a3a3a';
  return (
    <svg viewBox="0 0 24 32" className="w-3.5 h-5" aria-hidden>
      <path
        d="M12 1C12 1 22 14 22 21a10 10 0 0 1-20 0C2 14 12 1 12 1Z"
        fill={fill}
      />
    </svg>
  );
}

export default function ForecastGrid({ daily, timezone }: Props) {
  const days = daily.slice(0, 7);

  return (
    <section className="card p-6 sm:p-8 animate-fade-up" style={{ animationDelay: '0.05s' }}>
      <div className="mb-5 flex items-start justify-between">
        <div>
          <span className="pill mb-2">The week ahead</span>
          <h3 className="text-xl font-semibold">7-day outlook</h3>
        </div>
        <span className="hashes mt-1" aria-hidden />
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3 stagger">
        {days.map((day, i) => {
          const wmo = getWmoInfo(day.weatherCode);
          const date = new Date(day.date + 'T12:00:00Z');
          const label = i === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short', timeZone: timezone });
          const dayNum = date.toLocaleDateString('en-US', { day: 'numeric', timeZone: timezone });
          const active = i === 0;

          return (
            <div
              key={day.date}
              className={`rounded-[26px] p-3.5 flex flex-col items-center text-center lift ${
                active ? 'text-black' : 'card-2 text-white'
              }`}
              style={active ? { background: 'var(--accent)' } : undefined}
            >
              <p className={`text-xs font-semibold ${active ? 'text-black/70' : 'text-dim'}`}>{label}</p>
              <p className={`text-sm font-bold ${active ? 'text-black' : ''}`}>{dayNum}</p>
              <div className="my-2 text-3xl select-none" aria-hidden>{wmo.emoji}</div>
              <div className="flex items-baseline gap-1.5 text-sm">
                <span className="font-bold">{Math.round(day.tempMax)}°</span>
                <span className={active ? 'text-black/60' : 'text-dim'}>{Math.round(day.tempMin)}°</span>
              </div>
              <div className={`mt-1.5 flex items-center gap-1 text-[11px] ${active ? 'text-black/70' : 'text-dim'}`}>
                <Droplet prob={day.precipitationProbabilityMax} />
                {day.precipitationProbabilityMax}%
              </div>
            </div>
          );
        })}
      </div>

      {/* precipitation-probability trend, droplet motif from the reference */}
      <div className="mt-6 pt-5 border-t hairline">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-dim">Precipitation trend</span>
          <span className="text-xs text-dimmer">chance of rain per day</span>
        </div>
        <div className="flex items-end justify-between gap-1">
          {days.map((day) => (
            <div key={day.date} className="flex flex-col items-center gap-1.5 flex-1">
              <Droplet prob={day.precipitationProbabilityMax} />
              <span className="text-[10px] text-dimmer">
                {new Date(day.date + 'T12:00:00Z').toLocaleDateString('en-US', { weekday: 'narrow', timeZone: timezone })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
