'use client';

import type { AirQualityData } from '@/types/weather';

interface Props {
  data: AirQualityData;
}

function aqiInfo(aqi: number) {
  if (aqi <= 20) return { label: 'Good', tone: 'from-emerald-400 to-green-500', text: 'text-emerald-600 dark:text-emerald-400', advice: 'Air is fresh — perfect for the outdoors.' };
  if (aqi <= 40) return { label: 'Fair', tone: 'from-lime-400 to-emerald-500', text: 'text-lime-600 dark:text-lime-400', advice: 'Generally clean air with little concern.' };
  if (aqi <= 60) return { label: 'Moderate', tone: 'from-amber-400 to-yellow-500', text: 'text-amber-600 dark:text-amber-400', advice: 'Sensitive groups should take it easy outdoors.' };
  if (aqi <= 80) return { label: 'Poor', tone: 'from-orange-400 to-red-500', text: 'text-orange-600 dark:text-orange-400', advice: 'Consider limiting prolonged outdoor effort.' };
  if (aqi <= 100) return { label: 'Very poor', tone: 'from-red-500 to-rose-600', text: 'text-red-600 dark:text-red-400', advice: 'Reduce outdoor activity where possible.' };
  return { label: 'Hazardous', tone: 'from-purple-500 to-fuchsia-700', text: 'text-purple-600 dark:text-purple-400', advice: 'Avoid outdoor exertion; mask up if needed.' };
}

export default function AirQualityCard({ data }: Props) {
  const info = aqiInfo(data.europeanAqi);
  const pct = Math.min((data.europeanAqi / 120) * 100, 100);

  return (
    <section className="glass rounded-3xl p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Air quality</h3>
        <span className={`text-sm font-semibold ${info.text}`}>{info.label}</span>
      </div>

      <div className="mt-4 flex items-end gap-3">
        <span className="text-5xl font-light leading-none">{data.europeanAqi}</span>
        <span className="mb-1 text-xs text-muted">European AQI</span>
      </div>

      {/* gradient gauge */}
      <div className="mt-3 h-2 w-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-purple-600 relative">
        <span
          className="absolute -top-1 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-white bg-[var(--foreground)] shadow"
          style={{ left: `${pct}%` }}
        />
      </div>

      <p className="mt-3 text-xs text-muted">{info.advice}</p>

      <div className="mt-4 grid grid-cols-3 gap-2.5">
        {[
          { label: 'PM2.5', value: `${data.pm2_5}`, unit: 'µg/m³' },
          { label: 'PM10', value: `${data.pm10}`, unit: 'µg/m³' },
          { label: 'US AQI', value: `${data.usAqi}`, unit: 'index' },
        ].map(({ label, value, unit }) => (
          <div key={label} className="glass-strong rounded-2xl px-3 py-2.5 text-center">
            <p className="text-[11px] text-muted">{label}</p>
            <p className="mt-0.5 text-lg font-semibold leading-none">{value}</p>
            <p className="text-[10px] text-muted">{unit}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
