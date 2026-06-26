'use client';

import dynamic from 'next/dynamic';

const MapInner = dynamic(() => import('./MapInner'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full grid place-items-center skeleton rounded-2xl">
      <div className="text-center text-dim">
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
    <section className="card p-6 flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <span className="pill">On the map</span>
        <span className="text-xs text-dimmer">{latitude.toFixed(3)}, {longitude.toFixed(3)}</span>
      </div>
      <div className="flex-1 min-h-[260px] rounded-2xl overflow-hidden border border-white/10">
        <MapInner latitude={latitude} longitude={longitude} locationName={locationName} />
      </div>
      <p className="mt-2 text-[11px] text-dimmer text-right">
        © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline hover:text-white">OpenStreetMap</a> · © <a href="https://carto.com/attributions" target="_blank" rel="noreferrer" className="underline hover:text-white">CARTO</a>
      </p>
    </section>
  );
}
