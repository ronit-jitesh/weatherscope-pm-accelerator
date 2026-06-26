'use client';

import { useState } from 'react';
import { getPackingAdvisory } from '@/lib/packing-advisory';
import type { DailyForecast } from '@/types/weather';

interface Props {
  today: DailyForecast;
}

const categoryIcons: Record<string, string> = {
  Clothing: '👕',
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
    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <span className="font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-2">
          🎒 What to Pack / Wear Today
        </span>
        <span className="text-amber-600 dark:text-amber-400 text-sm">{open ? '▲ Hide' : '▼ Show'}</span>
      </button>

      {open && (
        <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {advisory.map((item) => (
            <div key={item.category} className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm">
              <p className="font-semibold text-sm text-gray-800 dark:text-gray-200 mb-1">
                {categoryIcons[item.category] ?? '📦'} {item.category}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 italic">{item.reason}</p>
              <ul className="space-y-0.5">
                {item.items.map((i) => (
                  <li key={i} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-1">
                    <span className="text-amber-500 mt-0.5">•</span> {i}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
