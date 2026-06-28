'use client';

import { getWmoInfo } from '@/lib/wmo-codes';
import type { HourlyPoint } from '@/types/weather';

interface Props {
  hourly: HourlyPoint[];
  timezone: string;
}

const COL = 62; // px per hour column
const HOURS = 24;

function currentHourKey(timezone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hour12: false,
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  let hour = get('hour');
  if (hour === '24') hour = '00';
  return `${get('year')}-${get('month')}-${get('day')}T${hour}`;
}

export default function HourlyForecast({ hourly, timezone }: Props) {
  if (!hourly || hourly.length === 0) return null;

  const key = currentHourKey(timezone);
  let start = hourly.findIndex((h) => h.time.slice(0, 13) === key);
  if (start < 0) start = 0;
  const hours = hourly.slice(start, start + HOURS);
  if (hours.length === 0) return null;

  const temps = hours.map((h) => h.temperature);
  const min = Math.min(...temps);
  const max = Math.max(...temps);
  const span = Math.max(max - min, 1);

  const width = hours.length * COL;
  const H = 64;
  const padTop = 22;
  const padBottom = 8;
  const y = (t: number) => padTop + (1 - (t - min) / span) * (H - padTop - padBottom);
  const pts = hours.map((h, i) => ({ x: i * COL + COL / 2, y: y(h.temperature) }));
  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaPath = `${linePath} L${pts[pts.length - 1].x},${H} L${pts[0].x},${H} Z`;

  const fmtHour = (iso: string, i: number) => {
    if (i === 0) return 'Now';
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', timeZone: timezone }).replace(' ', '').toLowerCase();
  };

  return (
    <section className="card p-6 sm:p-7 animate-fade-up">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <span className="pill mb-2">Next 24 hours</span>
          <h3 className="text-xl font-semibold">Hour by hour</h3>
        </div>
        <span className="text-xs text-dim">{Math.round(min)}° – {Math.round(max)}°</span>
      </div>

      <div className="overflow-x-auto pb-1 -mx-2 px-2" style={{ scrollbarWidth: 'thin' }}>
        <div style={{ width }} className="relative">
          {/* temperature curve */}
          <svg width={width} height={H} className="block">
            <defs>
              <linearGradient id="hourlyFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.28" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={areaPath} fill="url(#hourlyFill)" />
            <path d={linePath} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
            {pts.map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r={i === 0 ? 4 : 2.5} fill="var(--accent)" stroke="#000" strokeWidth="1.5" />
                <text x={p.x} y={p.y - 9} textAnchor="middle" className="fill-white" style={{ fontSize: 11, fontWeight: 600 }}>
                  {Math.round(hours[i].temperature)}°
                </text>
              </g>
            ))}
          </svg>

          {/* hour columns */}
          <div className="flex">
            {hours.map((h, i) => {
              const wmo = getWmoInfo(h.weatherCode, h.isDay);
              return (
                <div key={h.time} style={{ width: COL }} className="flex flex-col items-center gap-1 pt-1">
                  <span className="text-lg leading-none select-none" aria-hidden>{wmo.emoji}</span>
                  <span className={`text-[11px] ${i === 0 ? 'font-bold' : 'text-dim'}`}>{fmtHour(h.time, i)}</span>
                  <span className={`text-[10px] flex items-center gap-0.5 ${h.precipitationProbability >= 30 ? '' : 'text-dimmer'}`}
                    style={h.precipitationProbability >= 30 ? { color: 'var(--accent)' } : undefined}>
                    {h.precipitationProbability >= 5 ? `💧${h.precipitationProbability}%` : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
