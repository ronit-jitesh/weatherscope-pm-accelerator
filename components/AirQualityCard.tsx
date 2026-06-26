'use client';

import type { AirQualityData } from '@/types/weather';

interface Props {
  data: AirQualityData;
}

function aqiInfo(aqi: number): { label: string; color: string; bg: string } {
  if (aqi <= 20) return { label: 'Good', color: 'text-green-700', bg: 'bg-green-100' };
  if (aqi <= 40) return { label: 'Fair', color: 'text-lime-700', bg: 'bg-lime-100' };
  if (aqi <= 60) return { label: 'Moderate', color: 'text-yellow-700', bg: 'bg-yellow-100' };
  if (aqi <= 80) return { label: 'Poor', color: 'text-orange-700', bg: 'bg-orange-100' };
  if (aqi <= 100) return { label: 'Very Poor', color: 'text-red-700', bg: 'bg-red-100' };
  return { label: 'Hazardous', color: 'text-purple-700', bg: 'bg-purple-100' };
}

export default function AirQualityCard({ data }: Props) {
  const eu = aqiInfo(data.europeanAqi);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">🌬️ Air Quality</h3>

      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${eu.bg} mb-4`}>
        <span className={`text-sm font-bold ${eu.color}`}>European AQI: {data.europeanAqi}</span>
        <span className={`text-xs font-medium ${eu.color}`}>— {eu.label}</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'PM2.5', value: `${data.pm2_5} µg/m³` },
          { label: 'PM10', value: `${data.pm10} µg/m³` },
          { label: 'US AQI', value: String(data.usAqi) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-3">
        Source: <a href="https://open-meteo.com" target="_blank" rel="noreferrer" className="underline">Open-Meteo Air Quality API</a>
      </p>
    </div>
  );
}
