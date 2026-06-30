'use client';

import { getInsights, getBestWindow, getActivityVerdicts, type ActivityVerdict } from '@/lib/insights';
import type { WeatherData } from '@/types/weather';

interface Props {
  data: WeatherData;
}

const toneStyles: Record<string, string> = {
  good: 'bg-emerald-500/12 text-emerald-300',
  warn: 'bg-amber-500/12 text-amber-300',
  info: 'bg-white/5 text-dim',
};

function verdictColor(v: ActivityVerdict['verdict']): string {
  switch (v) {
    case 'Great': return 'text-emerald-300';
    case 'Good': return 'text-lime-300';
    case 'Fair': return 'text-amber-300';
    default: return 'text-red-300';
  }
}

export default function DayBrief({ data }: Props) {
  const insights = getInsights(data);
  const best = getBestWindow(data);
  const activities = getActivityVerdicts(data);

  if (insights.length === 0 && !best) return null;

  return (
    <section className="card p-6 sm:p-7 animate-fade-up">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <span className="pill pill-accent mb-2">Smart insights</span>
          <h3 className="text-xl font-semibold">Your day at a glance</h3>
        </div>
        <span className="hashes mt-1" aria-hidden />
      </div>

      {/* Best outdoor window, the headline */}
      {best && (
        <div className="mb-4 rounded-2xl p-4 flex items-center gap-3 neon" style={{ background: 'var(--accent)', color: '#000' }}>
          <span className="text-2xl" aria-hidden>🌤️</span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide opacity-70">Best time to be outside</p>
            <p className="text-lg font-bold leading-tight">{best.label}</p>
          </div>
          <span className="ml-auto text-sm font-medium opacity-80 hidden sm:block">{best.reason}</span>
        </div>
      )}

      {/* Insight rows */}
      {insights.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-2.5">
          {insights.map((ins, i) => (
            <div key={i} className={`rounded-2xl p-3.5 flex items-start gap-3 ${toneStyles[ins.tone]}`}>
              <span className="text-xl leading-none" aria-hidden>{ins.icon}</span>
              <div>
                <p className="font-semibold text-sm text-white">{ins.title}</p>
                <p className="text-xs text-dim mt-0.5 leading-snug">{ins.detail}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Activity verdicts */}
      {activities.length > 0 && (
        <div className="mt-4 pt-4 border-t hairline">
          <p className="text-xs text-dim mb-2.5">Good day for…</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {activities.map((a) => (
              <div key={a.name} className="card-2 rounded-2xl py-3 flex flex-col items-center gap-1">
                <span className="text-xl" aria-hidden>{a.icon}</span>
                <span className="text-[11px] text-dim">{a.name}</span>
                <span className={`text-xs font-bold ${verdictColor(a.verdict)}`}>{a.verdict}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
