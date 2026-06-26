'use client';

import type { AirQualityData } from '@/types/weather';

interface Props {
  data: AirQualityData;
}

function aqiInfo(aqi: number) {
  if (aqi <= 20) return { label: 'Good', advice: 'Air is fresh — perfect for the outdoors.' };
  if (aqi <= 40) return { label: 'Fair', advice: 'Generally clean air with little concern.' };
  if (aqi <= 60) return { label: 'Moderate', advice: 'Sensitive groups should take it easy outdoors.' };
  if (aqi <= 80) return { label: 'Poor', advice: 'Consider limiting prolonged outdoor effort.' };
  if (aqi <= 100) return { label: 'Very poor', advice: 'Reduce outdoor activity where possible.' };
  return { label: 'Hazardous', advice: 'Avoid outdoor exertion; mask up if needed.' };
}

/** Half-circle arc gauge matching the hero dial. */
function HalfGauge({ value, maxVal }: { value: number; maxVal: number }) {
  const R = 70;
  const CX = 90;
  const CY = 90;
  const C = 2 * Math.PI * R;
  const SWEEP = 0.5; // 180°
  const arcLen = C * SWEEP;
  const frac = Math.max(0, Math.min(1, value / maxVal));
  const fillLen = frac * arcLen;
  const dotAngle = (180 + frac * 180) * (Math.PI / 180);
  const dotX = CX + R * Math.cos(dotAngle);
  const dotY = CY + R * Math.sin(dotAngle);

  return (
    <div className="relative w-[180px] h-[110px]">
      <svg viewBox="0 0 180 110" className="w-full h-full">
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#2e2e2e" strokeWidth="12" strokeLinecap="round"
          strokeDasharray={`${arcLen} ${C}`} transform={`rotate(180 ${CX} ${CY})`} />
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="var(--accent)" strokeWidth="12" strokeLinecap="round"
          strokeDasharray={`${fillLen} ${C}`} transform={`rotate(180 ${CX} ${CY})`} />
        <circle cx={dotX} cy={dotY} r="7" fill="var(--accent)" stroke="#000" strokeWidth="2" />
      </svg>
      <div className="absolute inset-x-0 bottom-1 flex flex-col items-center">
        <span className="text-4xl font-light leading-none">{value}</span>
        <span className="text-[11px] text-dim">EU AQI</span>
      </div>
    </div>
  );
}

export default function AirQualityCard({ data }: Props) {
  const info = aqiInfo(data.europeanAqi);

  return (
    <section className="card p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <span className="pill">Air quality</span>
        <span className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>{info.label}</span>
      </div>

      <div className="flex items-center justify-center">
        <HalfGauge value={data.europeanAqi} maxVal={120} />
      </div>

      <p className="mt-3 text-xs text-dim text-center">{info.advice}</p>

      <div className="mt-4 grid grid-cols-3 gap-2.5">
        {[
          { label: 'PM2.5', value: `${data.pm2_5}`, unit: 'µg/m³' },
          { label: 'PM10', value: `${data.pm10}`, unit: 'µg/m³' },
          { label: 'US AQI', value: `${data.usAqi}`, unit: 'index' },
        ].map(({ label, value, unit }) => (
          <div key={label} className="card-2 px-3 py-2.5 text-center">
            <p className="text-[11px] text-dim">{label}</p>
            <p className="mt-0.5 text-lg font-semibold leading-none">{value}</p>
            <p className="text-[10px] text-dimmer">{unit}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
