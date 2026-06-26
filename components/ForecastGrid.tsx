'use client';

import { getWmoInfo } from '@/lib/wmo-codes';
import type { DailyForecast } from '@/types/weather';

interface Props {
  daily: DailyForecast[];
  timezone: string;
}

export default function ForecastGrid({ daily, timezone }: Props) {
  const days = daily.slice(0, 7);

  // Shared scale so the temp bars are comparable across the week.
  const allMax = Math.max(...days.map((d) => d.tempMax));
  const allMin = Math.min(...days.map((d) => d.tempMin));
  const span = Math.max(allMax - allMin, 1);

  return (
    <section className="animate-fade-up" style={{ animationDelay: '0.05s' }}>
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-lg font-semibold">The week ahead</h3>
        <span className="text-xs text-muted">7-day outlook</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 stagger">
        {days.map((day, i) => {
          const wmo = getWmoInfo(day.weatherCode);
          const date = new Date(day.date + 'T12:00:00Z');
          const label = i === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short', timeZone: timezone });
          const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: timezone });

          const lo = ((day.tempMin - allMin) / span) * 100;
          const hi = ((day.tempMax - allMin) / span) * 100;

          return (
            <div
              key={day.date}
              className={`group rounded-3xl p-4 flex flex-col items-center text-center lift ${
                i === 0 ? 'glass-strong ring-1 ring-[var(--accent)]/30' : 'glass'
              }`}
            >
              <p className="text-sm font-semibold">{label}</p>
              <p className="text-[11px] text-muted">{dateStr}</p>

              <div className="my-2 text-4xl transition-transform duration-300 group-hover:scale-110 select-none" aria-hidden>
                {wmo.emoji}
              </div>
              <p className="text-[11px] text-muted leading-tight min-h-[28px] flex items-center">{wmo.description}</p>

              <div className="mt-2 flex w-full items-center gap-2 text-xs font-medium">
                <span className="text-muted w-6 text-right">{Math.round(day.tempMin)}°</span>
                <span className="relative h-1.5 flex-1 rounded-full bg-[var(--muted)]/20">
                  <span
                    className="absolute h-full rounded-full bg-gradient-to-r from-sky-400 to-amber-400"
                    style={{ left: `${lo}%`, right: `${100 - hi}%` }}
                  />
                </span>
                <span className="w-6 text-left">{Math.round(day.tempMax)}°</span>
              </div>

              <div className="mt-2.5 flex items-center gap-3 text-[11px] text-muted">
                <span title="Chance of rain">💧 {day.precipitationProbabilityMax}%</span>
                {day.uvIndexMax >= 3 && <span title="Max UV index">☀️ {Math.round(day.uvIndexMax)}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
