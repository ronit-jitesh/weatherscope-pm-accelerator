export default function AboutProject() {
  const stack = [
    'Next.js 16', 'TypeScript', 'Tailwind CSS 4', 'Prisma 7',
    'Supabase Postgres', 'Open-Meteo API', 'Leaflet', 'PWA',
  ];

  const highlights = [
    { icon: '🧠', title: 'Smart insights engine', desc: 'Deterministic rules over hourly data: best outdoor window, umbrella timing, UV and severe-weather flags, activity verdicts.' },
    { icon: '⚡', title: 'Fast by design', desc: 'Server-side API fan-out, prefetch on hover, cached responses, offline app shell. No API keys anywhere.' },
    { icon: '🗄️', title: 'Full-stack CRUD', desc: 'Date-range weather records persisted in Postgres, validated with Zod, exportable as JSON, CSV, XML, Markdown or PDF.' },
    { icon: '🎨', title: 'Custom design system', desc: 'Black and electric-yellow neon theme, hand-built SVG gauges and charts, 3D depth and motion throughout.' },
  ];

  return (
    <section className="card p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" className="h-11 w-11 rounded-2xl object-cover" />
          <div>
            <span className="pill mb-1.5">About this project</span>
            <h2 className="text-xl font-semibold leading-tight">WeatherScope</h2>
          </div>
        </div>
        <span className="pill pill-accent">Designed &amp; built by Ronit Jitesh</span>
      </div>

      <p className="mt-5 text-sm leading-relaxed text-dim max-w-3xl">
        A full-stack weather platform built end to end: flexible location search
        (city, postcode, landmark or raw coordinates), live conditions with hourly and
        seven-day forecasts, air quality, city comparison, and an insights engine that
        turns raw data into decisions. Installable as an app, works offline, and runs
        entirely on free, keyless APIs.
      </p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {highlights.map(({ icon, title, desc }) => (
          <div key={title} className="card-2 p-4 lift">
            <p className="flex items-center gap-2 font-semibold text-sm">
              <span aria-hidden>{icon}</span> {title}
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-dim">{desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className="text-xs text-dim mr-1">Stack</span>
        {stack.map((s) => (
          <span key={s} className="px-2.5 py-1 rounded-full bg-[var(--surface-2)] text-xs text-dim">{s}</span>
        ))}
      </div>

      <div className="mt-6 border-t hairline pt-4 flex flex-wrap items-center justify-between gap-3">
        <span className="text-[11px] text-dimmer">
          Weather data by <a href="https://open-meteo.com" target="_blank" rel="noreferrer" className="underline hover:text-white">Open-Meteo</a>
          {' · '}Map © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline hover:text-white">OpenStreetMap</a> · © CARTO
        </span>
        <span className="flex flex-wrap gap-2">
          <a href="https://ronit-jitesh.github.io" target="_blank" rel="noreferrer" className="btn-accent px-3 py-1.5 text-xs">
            Portfolio ↗
          </a>
          <a href="https://github.com/ronit-jitesh" target="_blank" rel="noreferrer" className="btn-ghost px-3 py-1.5 text-xs font-medium">
            GitHub ↗
          </a>
          <a href="https://www.linkedin.com/in/ronit-jitesh-440a1319b" target="_blank" rel="noreferrer" className="btn-ghost px-3 py-1.5 text-xs font-medium">
            LinkedIn ↗
          </a>
        </span>
      </div>
    </section>
  );
}
