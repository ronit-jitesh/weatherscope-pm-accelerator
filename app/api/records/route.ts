import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { resolveLocation } from '@/lib/geocode';
import { fetchHistoricalWeather } from '@/lib/weather';

const createSchema = z.object({
  locationQuery: z.string().min(1).max(200),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  notes: z.string().max(500).optional(),
});

export async function GET() {
  const records = await prisma.weatherRecord.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const parsed = records.map((r) => ({
    ...r,
    startDate: r.startDate.toISOString().split('T')[0],
    endDate: r.endDate.toISOString().split('T')[0],
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    temperatureData: JSON.parse(r.temperatureData),
  }));

  return NextResponse.json({ records: parsed });
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { locationQuery, startDate, endDate, notes } = parsed.data;

  // Validate date range
  if (startDate > endDate) {
    return NextResponse.json({ error: 'Start date must be before end date' }, { status: 400 });
  }
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dayDiff = (end.getTime() - start.getTime()) / 86400000;
  if (dayDiff > 365) {
    return NextResponse.json({ error: 'Date range cannot exceed 365 days' }, { status: 400 });
  }
  const minDate = new Date('1940-01-01');
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 16);
  if (start < minDate) {
    return NextResponse.json({ error: 'Start date cannot be before 1940-01-01' }, { status: 400 });
  }
  if (end > maxDate) {
    return NextResponse.json({ error: 'End date cannot exceed 16 days from today' }, { status: 400 });
  }

  // Validate location
  const locations = await resolveLocation(locationQuery);
  if (locations.length === 0) {
    return NextResponse.json({ error: 'Location not found — please try a different name or use coordinates' }, { status: 422 });
  }
  const location = locations[0];

  // Fetch weather data for range
  let temperatureData;
  try {
    temperatureData = await fetchHistoricalWeather(location.latitude, location.longitude, startDate, endDate);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch weather data for that date range' }, { status: 502 });
  }

  const record = await prisma.weatherRecord.create({
    data: {
      locationQuery,
      resolvedName: [location.name, location.admin1, location.country].filter(Boolean).join(', '),
      latitude: location.latitude,
      longitude: location.longitude,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      temperatureData: JSON.stringify(temperatureData),
      notes: notes ?? null,
    },
  });

  return NextResponse.json({
    record: {
      ...record,
      startDate: record.startDate.toISOString().split('T')[0],
      endDate: record.endDate.toISOString().split('T')[0],
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
      temperatureData,
    },
  }, { status: 201 });
}
