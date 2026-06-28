export interface GeocodedLocation {
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone: string;
  population?: number;
}

export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  weatherCode: number;
  windSpeed: number;
  windDirection: number;
  humidity: number;
  precipitation: number;
  uvIndex: number;
  pressure: number;
  cloudCover: number;
  isDay: number;
}

export interface DailyForecast {
  date: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  apparentTempMax: number;
  apparentTempMin: number;
  sunrise: string;
  sunset: string;
  uvIndexMax: number;
  precipitationProbabilityMax: number;
  precipitationSum: number;
  windSpeedMax: number;
}

export interface HourlyPoint {
  time: string;
  temperature: number;
  apparentTemperature: number;
  weatherCode: number;
  precipitationProbability: number;
  isDay: number;
}

export interface WeatherData {
  location: GeocodedLocation;
  current: CurrentWeather;
  daily: DailyForecast[];
  hourly: HourlyPoint[];
  timezone: string;
  timezoneAbbreviation: string;
}

export interface AirQualityData {
  pm10: number;
  pm2_5: number;
  europeanAqi: number;
  usAqi: number;
}

export interface HistoricalDailyData {
  date: string;
  tempMax: number;
  tempMin: number;
  precipitationSum: number;
  weatherCode: number;
}

export interface WeatherRecordRow {
  id: string;
  locationQuery: string;
  resolvedName: string;
  latitude: number;
  longitude: number;
  startDate: string;
  endDate: string;
  temperatureData: HistoricalDailyData[];
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PackingItem {
  category: string;
  items: string[];
  reason: string;
}
