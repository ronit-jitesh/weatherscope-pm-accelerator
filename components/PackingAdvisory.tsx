'use client';

import { useState } from 'react';
import { getPackingAdvisory } from '@/lib/packing-advisory';
import type { DailyForecast } from '@/types/weather';

interface Props {
  today: DailyForecast;
}

const categoryIcons: Record<string, string> = {
  Clothing: '🧥',
  'Sun Protection': '🕶️',
  'Rain Gear': '☂️',
  'Snow Gear': '🧤',
  'Wind Protection': '🌬️',
  Hydration: '💧',
};

export default function PackingAdvisory({ today }: Props) {
  const [open, setOpen] = useState(true);

  const advisory = getPackingAdvisory({
    apparentTempMax: today.apparentTempMax,
    apparentTempMin: today.apparentTempMin,
    uvIndexMax: today.uvIndexMax,
    precipitationProbabilityMax: today.precipitationProbabilityMax,
    windSpeedMax: today.windSpeedMax,
    weatherCode: today.weatherCode,
  });

  if (advisory.length === 0) return null;

  return (
    <section className="card overflow-hidden animate-fade-up" style={{ animationDelay: '0.08s' }}>
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between gap-3 px-6 py-5 text-left">
        <span className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl text-xl" style={{ background: 'var(--accent)' }} aria-hidden>🎒</span>
          <span>
            <span className="flex items-center gap-2">
              <span className="pill pill-accent">Smart brief</span>
            </span>
            <span className="block mt-1.5 font-semibold">What to pack &amp; wear today</span>
          </span>
        </span>
        <span className="text-xs font-medium text-dim shrink-0">{open ? 'Hide' : 'Show'}</span>
      </button>

      {open && (
        <div className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 stagger">
          {advisory.map((item) => (
            <div key={item.category} className="card-2 p-4 lift">
              <p className="flex items-center gap-2 font-semibold text-sm">
                <span className="text-lg" aria-hidden>{categoryIcons[item.category] ?? '📦'}</span>
                {item.category}
              </p>
              <p className="mt-1 mb-3 text-[11px] text-dim italic">{item.reason}</p>
              <ul className="space-y-1.5">
                {item.items.map((i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px]">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: 'var(--accent)' }} />
                    <span>{i}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
