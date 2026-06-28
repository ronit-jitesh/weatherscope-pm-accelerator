import type { WeatherData, HourlyPoint } from '@/types/weather';

export interface Insight {
  icon: string;
  title: string;
  detail: string;
  tone: 'good' | 'warn' | 'info';
}

export interface BestWindow {
  label: string;     // "9 AM – 12 PM"
  reason: string;    // "mild and mostly dry"
}

export interface ActivityVerdict {
  name: string;
  icon: string;
  verdict: 'Great' | 'Good' | 'Fair' | 'Poor';
}

function severe(code: number): boolean {
  // thunderstorm, heavy snow, violent showers, freezing rain
  return [65, 67, 75, 82, 86, 95, 96, 99].includes(code);
}

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

function nextHours(weather: WeatherData, n = 16): HourlyPoint[] {
  const key = currentHourKey(weather.timezone);
  let start = weather.hourly.findIndex((h) => h.time.slice(0, 13) === key);
  if (start < 0) start = 0;
  return weather.hourly.slice(start, start + n);
}

function fmtTime(iso: string, timezone: string): string {
  return new Date(iso)
    .toLocaleTimeString('en-US', { hour: 'numeric', timeZone: timezone })
    .replace(' ', ' ');
}

function comfy(h: HourlyPoint): boolean {
  return (
    h.precipitationProbability < 40 &&
    h.apparentTemperature >= 6 &&
    h.apparentTemperature <= 30 &&
    !severe(h.weatherCode)
  );
}

/** Longest contiguous comfortable daytime stretch in the next ~14h. */
export function getBestWindow(weather: WeatherData): BestWindow | null {
  const hrs = nextHours(weather, 14).filter((h) => h.isDay === 1);
  if (hrs.length === 0) return null;

  let bestStart = -1, bestLen = 0;
  let runStart = -1, runLen = 0;
  for (let i = 0; i < hrs.length; i++) {
    if (comfy(hrs[i])) {
      if (runStart < 0) runStart = i;
      runLen++;
      if (runLen > bestLen) { bestLen = runLen; bestStart = runStart; }
    } else {
      runStart = -1; runLen = 0;
    }
  }
  if (bestStart < 0 || bestLen < 2) return null;

  const startH = hrs[bestStart];
  const endH = hrs[Math.min(bestStart + bestLen, hrs.length - 1)];
  const win = hrs.slice(bestStart, bestStart + bestLen);
  const avgPrecip = win.reduce((s, h) => s + h.precipitationProbability, 0) / win.length;
  const avgTemp = win.reduce((s, h) => s + h.apparentTemperature, 0) / win.length;

  const tempWord = avgTemp < 12 ? 'cool' : avgTemp > 24 ? 'warm' : 'mild';
  const dryWord = avgPrecip < 15 ? 'dry' : 'mostly dry';

  return {
    label: `${fmtTime(startH.time, weather.timezone)} – ${fmtTime(endH.time, weather.timezone)}`,
    reason: `${tempWord} and ${dryWord}`,
  };
}

export function getInsights(weather: WeatherData): Insight[] {
  const out: Insight[] = [];
  const hrs = nextHours(weather, 24);
  const today = weather.daily[0];
  const tz = weather.timezone;

  // 1. Severe weather
  const severeHour = hrs.find((h) => severe(h.weatherCode));
  if (severeHour) {
    const isStorm = [95, 96, 99].includes(severeHour.weatherCode);
    out.push({
      icon: isStorm ? '⛈️' : '⚠️',
      title: isStorm ? 'Thunderstorms expected' : 'Rough weather ahead',
      detail: `Around ${fmtTime(severeHour.time, tz)} — plan indoor time and avoid being caught out.`,
      tone: 'warn',
    });
  }

  // 2. Rain timing
  const heavy = hrs.find((h) => h.precipitationProbability >= 50);
  if (heavy) {
    out.push({
      icon: '☔',
      title: 'Take an umbrella',
      detail: `Rain likely around ${fmtTime(heavy.time, tz)} (${heavy.precipitationProbability}% chance).`,
      tone: 'warn',
    });
  } else {
    const showers = hrs.slice(0, 12).reduce((m, h) => (h.precipitationProbability > m.precipitationProbability ? h : m), hrs[0]);
    if (showers && showers.precipitationProbability >= 30) {
      out.push({
        icon: '🌦️',
        title: 'Showers possible',
        detail: `A ${showers.precipitationProbability}% chance around ${fmtTime(showers.time, tz)} — maybe pack a layer.`,
        tone: 'info',
      });
    } else {
      out.push({
        icon: '✅',
        title: 'Dry for the next 24 hours',
        detail: 'No meaningful rain expected — no umbrella needed.',
        tone: 'good',
      });
    }
  }

  // 3. UV
  if (today && today.uvIndexMax >= 6) {
    const extreme = today.uvIndexMax >= 8;
    out.push({
      icon: '🧴',
      title: extreme ? `Very high UV (${Math.round(today.uvIndexMax)})` : `High UV (${Math.round(today.uvIndexMax)})`,
      detail: 'Sunscreen and sunglasses around midday; seek shade 11am–3pm.',
      tone: 'warn',
    });
  }

  // 4. Wind
  if (today && today.windSpeedMax > 40) {
    out.push({
      icon: '💨',
      title: 'Breezy day',
      detail: `Gusts up to ${Math.round(today.windSpeedMax)} km/h — secure loose items, mind cyclists.`,
      tone: 'info',
    });
  }

  return out.slice(0, 4);
}

export function getActivityVerdicts(weather: WeatherData): ActivityVerdict[] {
  const day = nextHours(weather, 14).filter((h) => h.isDay === 1);
  if (day.length === 0) return [];

  const minPrecip = Math.min(...day.map((h) => h.precipitationProbability));
  const temps = day.map((h) => h.apparentTemperature).sort((a, b) => a - b);
  const medTemp = temps[Math.floor(temps.length / 2)];
  const maxWind = weather.daily[0]?.windSpeedMax ?? 0;
  const anySevere = day.some((h) => severe(h.weatherCode));

  function score(idealLo: number, idealHi: number, windCap: number): ActivityVerdict['verdict'] {
    let s = 100;
    if (medTemp < idealLo) s -= (idealLo - medTemp) * 4;
    if (medTemp > idealHi) s -= (medTemp - idealHi) * 5;
    s -= minPrecip * 0.8;
    if (maxWind > windCap) s -= (maxWind - windCap) * 1.5;
    if (anySevere) s -= 40;
    if (s >= 80) return 'Great';
    if (s >= 60) return 'Good';
    if (s >= 40) return 'Fair';
    return 'Poor';
  }

  return [
    { name: 'Running', icon: '🏃', verdict: score(4, 18, 35) },
    { name: 'Cycling', icon: '🚲', verdict: score(10, 24, 28) },
    { name: 'Picnic', icon: '🧺', verdict: score(17, 28, 22) },
    { name: 'Photos', icon: '📸', verdict: score(2, 30, 45) },
  ];
}
