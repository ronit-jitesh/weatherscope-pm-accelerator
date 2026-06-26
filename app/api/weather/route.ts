import { NextRequest, NextResponse } from 'next/server';
import { fetchWeather } from '@/lib/weather';
import { z } from 'zod';

const schema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  name: z.string().optional(),
  country: z.string().optional(),
  admin1: z.string().optional(),
  timezone: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const parsed = schema.safeParse({
    latitude: sp.get('latitude'),
    longitude: sp.get('longitude'),
    name: sp.get('name'),
    country: sp.get('country'),
    admin1: sp.get('admin1'),
    timezone: sp.get('timezone'),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
  }

  try {
    const { latitude, longitude, name, country, admin1, timezone } = parsed.data;
    const weather = await fetchWeather({
      latitude,
      longitude,
      name: name || `${latitude},${longitude}`,
      country: country || '',
      admin1,
      timezone: timezone || 'auto',
    });
    return NextResponse.json(weather);
  } catch (err) {
    console.error('Weather fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 });
  }
}
