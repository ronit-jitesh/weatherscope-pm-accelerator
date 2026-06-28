'use client';

import type { DailyForecast } from '@/types/weather';

interface Props {
  today: DailyForecast;
  timezone: string;
}

function minutesOfDay(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function fmt(iso: string, timezone: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: timezone });
}

export default function SunArc({ today, timezone }: Props) {
  if (!today?.sunrise || !today?.sunset) return null;

  const sunriseMin = minutesOfDay(today.sunrise.slice(11, 16));
  const sunsetMin = minutesOfDay(today.sunset.slice(11, 16));
  const nowStr = new Intl.DateTimeFormat('en-GB', { timeZone: timezone, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
  const nowMin = minutesOfDay(nowStr);

  const span = Math.max(sunsetMin - sunriseMin, 1);
  const f = Math.max(0, Math.min(1, (nowMin - sunriseMin) / span));
  const isNight = nowMin < sunriseMin || nowMin > sunsetMin;

  const dlH = Math.floor(span / 60);
  const dlM = span % 60;

  // Elliptical arc geometry
  const RX = 170, RY = 75, CX = 200, CY = 105;
  const theta = Math.PI * (1 - f);
  const sunX = CX + RX * Math.cos(theta);
  const sunY = CY - RY * Math.sin(theta);

  return (
    <section className="card p-6 sm:p-7 animate-fade-up">
      <div className="mb-1 flex items-center justify-between">
        <span className="pill">Daylight</span>
        <span className="text-xs text-dim">{dlH}h {dlM}m of daylight</span>
      </div>

      <svg viewBox="0 0 400 130" className="w-full" style={{ maxHeight: 150 }}>
        <defs>
          <linearGradient id="sunArcFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="sunGlow">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* filled daylight area */}
        <path d={`M30,${CY} A${RX},${RY} 0 0 1 370,${CY} Z`} fill="url(#sunArcFill)" />
        {/* the sun's path */}
        <path d={`M30,${CY} A${RX},${RY} 0 0 1 370,${CY}`} fill="none" stroke="rgb(255 255 255 / 0.15)" strokeWidth="2" strokeDasharray="3 5" />
        {/* horizon */}
        <line x1="20" y1={CY} x2="380" y2={CY} stroke="rgb(255 255 255 / 0.12)" strokeWidth="1.5" />

        {/* sun */}
        {!isNight && (
          <>
            <circle cx={sunX} cy={sunY} r="20" fill="url(#sunGlow)" />
            <circle cx={sunX} cy={sunY} r="7" fill="var(--accent)" stroke="#000" strokeWidth="1.5" />
          </>
        )}
        {isNight && <text x={CX} y={CY - 18} textAnchor="middle" style={{ fontSize: 22 }}>🌙</text>}

        {/* endpoint markers */}
        <circle cx="30" cy={CY} r="3.5" fill="rgb(255 255 255 / 0.5)" />
        <circle cx="370" cy={CY} r="3.5" fill="rgb(255 255 255 / 0.5)" />
      </svg>

      <div className="flex items-center justify-between -mt-2">
        <div className="text-center">
          <p className="text-sm font-semibold">{fmt(today.sunrise, timezone)}</p>
          <p className="text-[11px] text-dim">🌅 Sunrise</p>
        </div>
        {isNight && (
          <p className="text-xs text-dim">The sun is below the horizon</p>
        )}
        <div className="text-center">
          <p className="text-sm font-semibold">{fmt(today.sunset, timezone)}</p>
          <p className="text-[11px] text-dim">🌇 Sunset</p>
        </div>
      </div>
    </section>
  );
}
