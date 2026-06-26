import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { resolveLocation } from '@/lib/geocode';
import { fetchHistoricalWeather } from '@/lib/weather';

const updateSchema = z.object({
  locationQuery: z.string().min(1).max(200).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  notes: z.string().max(500).optional().nullable(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const record = await prisma.weatherRecord.findUnique({ where: { id } });
  if (!record) return NextResponse.json({ error: 'Record not found' }, { status: 404 });

  return NextResponse.json({
    record: {
      ...record,
      startDate: record.startDate.toISOString().split('T')[0],
      endDate: record.endDate.toISOString().split('T')[0],
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
      temperatureData: JSON.parse(record.temperatureData),
    },
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const existing = await prisma.weatherRecord.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: 'Record not found' }, { status: 404 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const data = parsed.data;
  const startDate = data.startDate ?? existing.startDate.toISOString().split('T')[0];
  const endDate = data.endDate ?? existing.endDate.toISOString().split('T')[0];
  const locationQuery = data.locationQuery ?? existing.locationQuery;

  if (startDate > endDate) {
    return NextResponse.json({ error: 'Start date must be before end date' }, { status: 400 });
  }

  let updatePayload: Record<string, unknown> = { notes: data.notes !== undefined ? data.notes : existing.notes };

  const locationChanged = data.locationQuery && data.locationQuery !== existing.locationQuery;
  const datesChanged = data.startDate !== undefined || data.endDate !== undefined;

  if (locationChanged || datesChanged) {
    // Re-validate location if changed
    let lat = existing.latitude;
    let lon = existing.longitude;
    let resolvedName = existing.resolvedName;

    if (locationChanged) {
      const locations = await resolveLocation(locationQuery);
      if (locations.length === 0) {
        return NextResponse.json({ error: 'Location not found' }, { status: 422 });
      }
      lat = locations[0].latitude;
      lon = locations[0].longitude;
      resolvedName = [locations[0].name, locations[0].admin1, locations[0].country].filter(Boolean).join(', ');
    }

    const temperatureData = await fetchHistoricalWeather(lat, lon, startDate, endDate);

    updatePayload = {
      ...updatePayload,
      locationQuery,
      resolvedName,
      latitude: lat,
      longitude: lon,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      temperatureData: JSON.stringify(temperatureData),
    };
  }

  const updated = await prisma.weatherRecord.update({ where: { id }, data: updatePayload });

  return NextResponse.json({
    record: {
      ...updated,
      startDate: updated.startDate.toISOString().split('T')[0],
      endDate: updated.endDate.toISOString().split('T')[0],
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      temperatureData: JSON.parse(updated.temperatureData),
    },
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const existing = await prisma.weatherRecord.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: 'Record not found' }, { status: 404 });

  await prisma.weatherRecord.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
