import type { GeocodedLocation } from '@/types/weather';

const KEY = 'weatherscope:recents';
const LAST = 'weatherscope:last';
const MAX = 6;

export function getRecents(): GeocodedLocation[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as GeocodedLocation[]) : [];
  } catch {
    return [];
  }
}

function samePlace(a: GeocodedLocation, b: GeocodedLocation) {
  return Math.abs(a.latitude - b.latitude) < 0.01 && Math.abs(a.longitude - b.longitude) < 0.01;
}

export function addRecent(loc: GeocodedLocation): GeocodedLocation[] {
  if (typeof window === 'undefined') return [];
  const existing = getRecents().filter((r) => !samePlace(r, loc));
  const next = [loc, ...existing].slice(0, MAX);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
    localStorage.setItem(LAST, JSON.stringify(loc));
  } catch {
    /* storage full / disabled, non-fatal */
  }
  return next;
}

export function getLastLocation(): GeocodedLocation | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LAST);
    return raw ? (JSON.parse(raw) as GeocodedLocation) : null;
  } catch {
    return null;
  }
}

export function clearRecents() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

/** Resolve a free-text query (used for ?q= deep links) to a location. */
export async function resolveQuery(query: string): Promise<GeocodedLocation | null> {
  try {
    const res = await fetch(`/api/geocode?query=${encodeURIComponent(query)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.results?.[0] ?? null;
  } catch {
    return null;
  }
}
