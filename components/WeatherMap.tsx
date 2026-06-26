'use client';

import dynamic from 'next/dynamic';

const MapInner = dynamic(() => import('./MapInner'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full grid place-items-center skeleton rounded-3xl">
      <div className="text-center text-muted">
        <div className="text-2xl mb-1">🗺️</div>
        <p className="text-sm">Loading map…</p>
      </div>
    </div>
  ),
});

interface Props {
  latitude: number;
  longitude: number;
  locationName: string;
}

export default function WeatherMap({ latitude, longitude, locationName }: Props) {
  return (
    <section className="glass rounded-3xl p-5 sm:p-6 flex flex-col">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-lg font-semibold">On the map</h3>
        <span className="text-xs text-muted">{latitude.toFixed(3)}, {longitude.toFixed(3)}</span>
      </div>
      <div className="flex-1 min-h-[260px] rounded-2xl overflow-hidden ring-1 ring-[var(--border-glass)]/20">
        <MapInner latitude={latitude} longitude={longitude} locationName={locationName} />
      </div>
      <p className="mt-2 text-[11px] text-muted text-right">
        © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline hover:text-[var(--foreground)]">OpenStreetMap</a> contributors
      </p>
    </section>
  );
}
