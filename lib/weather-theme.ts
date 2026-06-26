/**
 * Maps a WMO weather code + day/night flag to an atmospheric theme.
 * Drives the page's animated sky backdrop and the hero card gradient,
 * so the whole app "feels" like the weather it's describing.
 */
export interface SkyTheme {
  id: string;
  /** Full-page background gradient (CSS value). */
  pageGradient: string;
  /** Soft radial glow overlay colour. */
  glow: string;
  /** Rich gradient used inside the hero weather card. */
  heroGradient: string;
  /** Tailwind text tone that reads well on the hero. */
  heroOnDark: boolean;
}

function bucket(code: number): 'clear' | 'cloudy' | 'fog' | 'rain' | 'snow' | 'storm' {
  if (code <= 1) return 'clear';
  if (code <= 3) return 'cloudy';
  if (code === 45 || code === 48) return 'fog';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
  if (code >= 95) return 'storm';
  return 'cloudy';
}

export function getSkyTheme(code: number, isDay: number): SkyTheme {
  const day = isDay !== 0;
  const kind = bucket(code);

  const themes: Record<string, SkyTheme> = {
    'clear-day': {
      id: 'clear-day',
      pageGradient: 'linear-gradient(180deg, #4f9bf5 0%, #9cc6f7 42%, #e9f1fc 100%)',
      glow: 'radial-gradient(720px 380px at 84% 6%, rgba(255, 221, 120, 0.55), transparent 70%)',
      heroGradient: 'linear-gradient(135deg, #2f80ed 0%, #56a8f5 50%, #7cc0fb 100%)',
      heroOnDark: true,
    },
    'clear-night': {
      id: 'clear-night',
      pageGradient: 'linear-gradient(180deg, #0b1437 0%, #1b2a5e 45%, #0a0f1f 100%)',
      glow: 'radial-gradient(640px 340px at 82% 8%, rgba(173, 196, 255, 0.28), transparent 72%)',
      heroGradient: 'linear-gradient(135deg, #131c44 0%, #28366f 55%, #3b4a8a 100%)',
      heroOnDark: true,
    },
    'cloudy-day': {
      id: 'cloudy-day',
      pageGradient: 'linear-gradient(180deg, #8aa0bd 0%, #c3cfde 45%, #e8edf3 100%)',
      glow: 'radial-gradient(640px 340px at 80% 8%, rgba(255, 255, 255, 0.4), transparent 70%)',
      heroGradient: 'linear-gradient(135deg, #5b6e87 0%, #7c91ab 55%, #9fb1c7 100%)',
      heroOnDark: true,
    },
    'cloudy-night': {
      id: 'cloudy-night',
      pageGradient: 'linear-gradient(180deg, #1a2235 0%, #2b3650 45%, #0c111c 100%)',
      glow: 'radial-gradient(560px 320px at 80% 10%, rgba(160, 178, 210, 0.18), transparent 72%)',
      heroGradient: 'linear-gradient(135deg, #232c42 0%, #36425f 55%, #475573 100%)',
      heroOnDark: true,
    },
    'fog-day': {
      id: 'fog-day',
      pageGradient: 'linear-gradient(180deg, #aab3bd 0%, #ccd2d8 45%, #e9ebee 100%)',
      glow: 'radial-gradient(640px 360px at 78% 10%, rgba(255, 255, 255, 0.5), transparent 72%)',
      heroGradient: 'linear-gradient(135deg, #6b7480 0%, #8a929c 55%, #a7adb6 100%)',
      heroOnDark: true,
    },
    'fog-night': {
      id: 'fog-night',
      pageGradient: 'linear-gradient(180deg, #20262e 0%, #333a44 45%, #10141a 100%)',
      glow: 'radial-gradient(520px 300px at 78% 12%, rgba(190, 198, 210, 0.16), transparent 72%)',
      heroGradient: 'linear-gradient(135deg, #2b313b 0%, #3e4651 55%, #525b67 100%)',
      heroOnDark: true,
    },
    'rain-day': {
      id: 'rain-day',
      pageGradient: 'linear-gradient(180deg, #5a7088 0%, #8499ad 45%, #dde4ea 100%)',
      glow: 'radial-gradient(600px 340px at 80% 10%, rgba(180, 205, 230, 0.32), transparent 72%)',
      heroGradient: 'linear-gradient(135deg, #3d5169 0%, #566d88 55%, #6f86a1 100%)',
      heroOnDark: true,
    },
    'rain-night': {
      id: 'rain-night',
      pageGradient: 'linear-gradient(180deg, #131b2a 0%, #243349 45%, #0a0f18 100%)',
      glow: 'radial-gradient(520px 300px at 80% 12%, rgba(120, 160, 205, 0.2), transparent 72%)',
      heroGradient: 'linear-gradient(135deg, #1b2638 0%, #2c3e57 55%, #3c5170 100%)',
      heroOnDark: true,
    },
    'snow-day': {
      id: 'snow-day',
      pageGradient: 'linear-gradient(180deg, #aac4dd 0%, #d4e3f0 45%, #f0f5fa 100%)',
      glow: 'radial-gradient(640px 360px at 80% 8%, rgba(255, 255, 255, 0.55), transparent 72%)',
      heroGradient: 'linear-gradient(135deg, #6f8aa6 0%, #93b0cb 55%, #b6cee3 100%)',
      heroOnDark: true,
    },
    'snow-night': {
      id: 'snow-night',
      pageGradient: 'linear-gradient(180deg, #1c2738 0%, #324460 45%, #0c1018 100%)',
      glow: 'radial-gradient(520px 320px at 80% 10%, rgba(190, 215, 245, 0.2), transparent 72%)',
      heroGradient: 'linear-gradient(135deg, #2a3a52 0%, #3d5474 55%, #51699a 100%)',
      heroOnDark: true,
    },
    'storm-day': {
      id: 'storm-day',
      pageGradient: 'linear-gradient(180deg, #434a63 0%, #6b6f85 45%, #d8d6e0 100%)',
      glow: 'radial-gradient(560px 320px at 80% 10%, rgba(190, 175, 255, 0.28), transparent 72%)',
      heroGradient: 'linear-gradient(135deg, #2c2f47 0%, #45405f 55%, #5d5377 100%)',
      heroOnDark: true,
    },
    'storm-night': {
      id: 'storm-night',
      pageGradient: 'linear-gradient(180deg, #15172a 0%, #2a2542 45%, #08060f 100%)',
      glow: 'radial-gradient(520px 300px at 80% 12%, rgba(150, 120, 230, 0.24), transparent 72%)',
      heroGradient: 'linear-gradient(135deg, #1c1b33 0%, #322a52 55%, #463a6e 100%)',
      heroOnDark: true,
    },
  };

  return themes[`${kind}-${day ? 'day' : 'night'}`] ?? themes['clear-day'];
}
