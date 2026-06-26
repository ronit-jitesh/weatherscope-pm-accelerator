export interface WmoInfo {
  description: string;
  emoji: string;
  dayEmoji: string;
  nightEmoji: string;
}

const WMO_MAP: Record<number, WmoInfo> = {
  0:  { description: 'Clear sky',              emoji: '☀️', dayEmoji: '☀️', nightEmoji: '🌙' },
  1:  { description: 'Mainly clear',            emoji: '🌤️', dayEmoji: '🌤️', nightEmoji: '🌤️' },
  2:  { description: 'Partly cloudy',           emoji: '⛅', dayEmoji: '⛅', nightEmoji: '☁️' },
  3:  { description: 'Overcast',                emoji: '☁️', dayEmoji: '☁️', nightEmoji: '☁️' },
  45: { description: 'Fog',                     emoji: '🌫️', dayEmoji: '🌫️', nightEmoji: '🌫️' },
  48: { description: 'Icy fog',                 emoji: '🌫️', dayEmoji: '🌫️', nightEmoji: '🌫️' },
  51: { description: 'Light drizzle',           emoji: '🌦️', dayEmoji: '🌦️', nightEmoji: '🌧️' },
  53: { description: 'Moderate drizzle',        emoji: '🌧️', dayEmoji: '🌧️', nightEmoji: '🌧️' },
  55: { description: 'Dense drizzle',           emoji: '🌧️', dayEmoji: '🌧️', nightEmoji: '🌧️' },
  61: { description: 'Slight rain',             emoji: '🌦️', dayEmoji: '🌦️', nightEmoji: '🌧️' },
  63: { description: 'Moderate rain',           emoji: '🌧️', dayEmoji: '🌧️', nightEmoji: '🌧️' },
  65: { description: 'Heavy rain',              emoji: '🌧️', dayEmoji: '🌧️', nightEmoji: '🌧️' },
  71: { description: 'Slight snow',             emoji: '🌨️', dayEmoji: '🌨️', nightEmoji: '🌨️' },
  73: { description: 'Moderate snow',           emoji: '❄️', dayEmoji: '❄️', nightEmoji: '❄️' },
  75: { description: 'Heavy snow',              emoji: '❄️', dayEmoji: '❄️', nightEmoji: '❄️' },
  77: { description: 'Snow grains',             emoji: '🌨️', dayEmoji: '🌨️', nightEmoji: '🌨️' },
  80: { description: 'Slight rain showers',     emoji: '🌦️', dayEmoji: '🌦️', nightEmoji: '🌧️' },
  81: { description: 'Moderate rain showers',   emoji: '🌧️', dayEmoji: '🌧️', nightEmoji: '🌧️' },
  82: { description: 'Violent rain showers',    emoji: '⛈️', dayEmoji: '⛈️', nightEmoji: '⛈️' },
  85: { description: 'Slight snow showers',     emoji: '🌨️', dayEmoji: '🌨️', nightEmoji: '🌨️' },
  86: { description: 'Heavy snow showers',      emoji: '❄️', dayEmoji: '❄️', nightEmoji: '❄️' },
  95: { description: 'Thunderstorm',            emoji: '⛈️', dayEmoji: '⛈️', nightEmoji: '⛈️' },
  96: { description: 'Thunderstorm w/ hail',    emoji: '⛈️', dayEmoji: '⛈️', nightEmoji: '⛈️' },
  99: { description: 'Thunderstorm, heavy hail',emoji: '⛈️', dayEmoji: '⛈️', nightEmoji: '⛈️' },
};

export function getWmoInfo(code: number, isDay = 1): WmoInfo {
  const info = WMO_MAP[code];
  if (!info) return { description: 'Unknown', emoji: '🌡️', dayEmoji: '🌡️', nightEmoji: '🌡️' };
  return {
    ...info,
    emoji: isDay ? info.dayEmoji : info.nightEmoji,
  };
}
