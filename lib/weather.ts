import type { WeatherData, AirQualityData, HistoricalDailyData } from '@/types/weather';
import type { GeocodedLocation } from '@/types/weather';

export async function fetchWeather(location: GeocodedLocation): Promise<WeatherData> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(location.latitude));
  url.searchParams.set('longitude', String(location.longitude));
  url.searchParams.set('current', [
    'temperature_2m', 'apparent_temperature', 'weather_code',
    'wind_speed_10m', 'wind_direction_10m', 'relative_humidity_2m',
    'precipitation', 'uv_index', 'surface_pressure', 'cloud_cover', 'is_day',
  ].join(','));
  url.searchParams.set('daily', [
    'weather_code', 'temperature_2m_max', 'temperature_2m_min',
    'apparent_temperature_max', 'apparent_temperature_min',
    'sunrise', 'sunset', 'uv_index_max',
    'precipitation_probability_max', 'precipitation_sum', 'wind_speed_10m_max',
  ].join(','));
  url.searchParams.set('timezone', location.timezone || 'auto');
  url.searchParams.set('forecast_days', '7');

  const res = await fetch(url.toString(), { next: { revalidate: 600 } });
  if (!res.ok) throw new Error(`Weather API error: ${res.status}`);

  const d = await res.json();
  const c = d.current;
  const daily = d.daily;

  return {
    location,
    timezone: d.timezone,
    timezoneAbbreviation: d.timezone_abbreviation,
    current: {
      temperature: c.temperature_2m,
      apparentTemperature: c.apparent_temperature,
      weatherCode: c.weather_code,
      windSpeed: c.wind_speed_10m,
      windDirection: c.wind_direction_10m,
      humidity: c.relative_humidity_2m,
      precipitation: c.precipitation,
      uvIndex: c.uv_index,
      pressure: c.surface_pressure,
      cloudCover: c.cloud_cover,
      isDay: c.is_day,
    },
    daily: daily.time.map((date: string, i: number) => ({
      date,
      weatherCode: daily.weather_code[i],
      tempMax: daily.temperature_2m_max[i],
      tempMin: daily.temperature_2m_min[i],
      apparentTempMax: daily.apparent_temperature_max[i],
      apparentTempMin: daily.apparent_temperature_min[i],
      sunrise: daily.sunrise[i],
      sunset: daily.sunset[i],
      uvIndexMax: daily.uv_index_max[i],
      precipitationProbabilityMax: daily.precipitation_probability_max[i],
      precipitationSum: daily.precipitation_sum[i],
      windSpeedMax: daily.wind_speed_10m_max[i],
    })),
  };
}

export async function fetchAirQuality(lat: number, lon: number): Promise<AirQualityData | null> {
  const url = new URL('https://air-quality-api.open-meteo.com/v1/air-quality');
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lon));
  url.searchParams.set('current', 'pm10,pm2_5,european_aqi,us_aqi');

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 600 } });
    if (!res.ok) return null;
    const d = await res.json();
    const c = d.current;
    return {
      pm10: c.pm10,
      pm2_5: c.pm2_5,
      europeanAqi: c.european_aqi,
      usAqi: c.us_aqi,
    };
  } catch {
    return null;
  }
}

export async function fetchHistoricalWeather(
  lat: number,
  lon: number,
  startDate: string,
  endDate: string,
): Promise<HistoricalDailyData[]> {
  const today = new Date().toISOString().split('T')[0];
  const archiveCutoff = new Date();
  archiveCutoff.setDate(archiveCutoff.getDate() - 6);
  const archiveCutoffStr = archiveCutoff.toISOString().split('T')[0];

  const results: HistoricalDailyData[] = [];

  // past dates → archive endpoint
  if (startDate <= archiveCutoffStr) {
    const archiveEnd = endDate < archiveCutoffStr ? endDate : archiveCutoffStr;
    const url = new URL('https://archive-api.open-meteo.com/v1/archive');
    url.searchParams.set('latitude', String(lat));
    url.searchParams.set('longitude', String(lon));
    url.searchParams.set('start_date', startDate);
    url.searchParams.set('end_date', archiveEnd);
    url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code');
    url.searchParams.set('timezone', 'UTC');

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Archive API error: ${res.status}`);
    const d = await res.json();
    d.daily.time.forEach((date: string, i: number) => {
      results.push({
        date,
        tempMax: d.daily.temperature_2m_max[i],
        tempMin: d.daily.temperature_2m_min[i],
        precipitationSum: d.daily.precipitation_sum[i],
        weatherCode: d.daily.weather_code[i],
      });
    });
  }

  // future / recent dates → forecast endpoint
  if (endDate >= today) {
    const forecastStart = startDate > today ? startDate : today;
    const forecastDays = Math.min(
      Math.ceil((new Date(endDate).getTime() - new Date(forecastStart).getTime()) / 86400000) + 1,
      16,
    );
    if (forecastDays > 0) {
      const url = new URL('https://api.open-meteo.com/v1/forecast');
      url.searchParams.set('latitude', String(lat));
      url.searchParams.set('longitude', String(lon));
      url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code');
      url.searchParams.set('timezone', 'UTC');
      url.searchParams.set('forecast_days', String(forecastDays));

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`Forecast API error: ${res.status}`);
      const d = await res.json();
      d.daily.time.forEach((date: string, i: number) => {
        if (date >= startDate && date <= endDate) {
          results.push({
            date,
            tempMax: d.daily.temperature_2m_max[i],
            tempMin: d.daily.temperature_2m_min[i],
            precipitationSum: d.daily.precipitation_sum[i],
            weatherCode: d.daily.weather_code[i],
          });
        }
      });
    }
  }

  return results.sort((a, b) => a.date.localeCompare(b.date));
}

export function windDirectionLabel(degrees: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(degrees / 45) % 8];
}
