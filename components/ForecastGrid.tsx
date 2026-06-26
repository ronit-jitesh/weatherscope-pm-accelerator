'use client';

import { getWmoInfo } from '@/lib/wmo-codes';
import type { DailyForecast } from '@/types/weather';

interface Props {
  daily: DailyForecast[];
  timezone: string;
}

export default function ForecastGrid({ daily, timezone }: Props) {
  const days = daily.slice(0, 7);

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">7-Day Forecast</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {days.map((day, i) => {
          const wmo = getWmoInfo(day.weatherCode);
          const date = new Date(day.date + 'T12:00:00Z');
          const label = i === 0
            ? 'Today'
            : date.toLocaleDateString('en-US', { weekday: 'short', timeZone: timezone });
          const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: timezone });

          return (
            <div
              key={day.date}
              className={`flex flex-col items-center p-3 rounded-xl border transition-colors ${
                i === 0
                  ? 'bg-sky-50 dark:bg-sky-900/30 border-sky-200 dark:border-sky-700'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750'
              }`}
            >
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{dateStr}</p>
              <div className="text-3xl my-2">{wmo.emoji}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center leading-tight">{wmo.description}</p>
              <div className="mt-2 flex gap-2 text-sm font-medium">
                <span className="text-gray-800 dark:text-gray-200">{Math.round(day.tempMax)}°</span>
                <span className="text-gray-400">{Math.round(day.tempMin)}°</span>
              </div>
              <div className="mt-1.5 flex flex-col items-center gap-0.5 text-xs text-gray-400 dark:text-gray-500">
                {day.precipitationProbabilityMax > 0 && (
                  <span>🌧 {day.precipitationProbabilityMax}%</span>
                )}
                {day.uvIndexMax >= 3 && (
                  <span>☀️ UV {day.uvIndexMax}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
