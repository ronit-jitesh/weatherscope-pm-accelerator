import type { GeocodedLocation } from '@/types/weather';

const COORD_RE = /^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/;

export function parseCoordinates(input: string): { lat: number; lon: number } | null {
  const match = input.trim().match(COORD_RE);
  if (!match) return null;
  const lat = parseFloat(match[1]);
  const lon = parseFloat(match[2]);
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
  return { lat, lon };
}

export async function geocodeWithOpenMeteo(query: string): Promise<GeocodedLocation[]> {
  const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
  url.searchParams.set('name', query);
  url.searchParams.set('count', '5');
  url.searchParams.set('language', 'en');
  url.searchParams.set('format', 'json');

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) return [];

  const data = await res.json();
  if (!data.results) return [];

  return data.results.map((r: Record<string, unknown>) => ({
    name: r.name as string,
    country: r.country as string,
    admin1: r.admin1 as string | undefined,
    latitude: r.latitude as number,
    longitude: r.longitude as number,
    timezone: r.timezone as string,
    population: r.population as number | undefined,
  }));
}

export async function geocodeWithNominatim(query: string): Promise<GeocodedLocation | null> {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '1');
  url.searchParams.set('addressdetails', '1');

  const res = await fetch(url.toString(), {
    headers: {
      'User-Agent': 'WeatherApp/1.0 (s2889071@ed.ac.uk)',
      'Accept-Language': 'en',
    },
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;

  const data = await res.json();
  if (!data.length) return null;

  const r = data[0];
  const displayName: string = r.display_name;
  const parts = displayName.split(',').map((p: string) => p.trim());

  return {
    name: parts[0] || query,
    country: r.address?.country || parts[parts.length - 1] || '',
    admin1: r.address?.state,
    latitude: parseFloat(r.lat),
    longitude: parseFloat(r.lon),
    timezone: 'UTC',
    population: undefined,
  };
}

export async function resolveLocation(query: string): Promise<GeocodedLocation[]> {
  const coords = parseCoordinates(query);
  if (coords) {
    return [{
      name: `${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)}`,
      country: '',
      latitude: coords.lat,
      longitude: coords.lon,
      timezone: 'UTC',
    }];
  }

  const openMeteoResults = await geocodeWithOpenMeteo(query);
  if (openMeteoResults.length > 0) return openMeteoResults;

  const nominatimResult = await geocodeWithNominatim(query);
  if (nominatimResult) return [nominatimResult];

  return [];
}
