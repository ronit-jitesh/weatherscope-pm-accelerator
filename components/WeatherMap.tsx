'use client';

import dynamic from 'next/dynamic';

const MapInner = dynamic(() => import('./MapInner'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl">
      <div className="text-center text-gray-400">
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
    <div>
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Location Map</h3>
      <div className="h-64 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
        <MapInner latitude={latitude} longitude={longitude} locationName={locationName} />
      </div>
      <p className="text-xs text-gray-400 mt-1 text-right">
        Map data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline">OpenStreetMap</a> contributors
      </p>
    </div>
  );
}
