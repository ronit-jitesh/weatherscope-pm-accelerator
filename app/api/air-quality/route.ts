import { NextRequest, NextResponse } from 'next/server';
import { fetchAirQuality } from '@/lib/weather';
import { z } from 'zod';

const schema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
});

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const parsed = schema.safeParse({
    latitude: sp.get('latitude'),
    longitude: sp.get('longitude'),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
  }

  const data = await fetchAirQuality(parsed.data.latitude, parsed.data.longitude);
  if (!data) return NextResponse.json({ error: 'Air quality data unavailable' }, { status: 503 });
  return NextResponse.json(data);
}
