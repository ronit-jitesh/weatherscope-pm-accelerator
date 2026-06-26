import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toJson, toCsv, toXml, toMarkdown, toPdf } from '@/lib/export';
import type { WeatherRecordRow } from '@/types/weather';

export async function GET(req: NextRequest) {
  const format = req.nextUrl.searchParams.get('format') ?? 'json';
  const id = req.nextUrl.searchParams.get('id');

  const where = id ? { id } : {};
  const rawRecords = await prisma.weatherRecord.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  if (rawRecords.length === 0) {
    return NextResponse.json({ error: 'No records found' }, { status: 404 });
  }

  const records: WeatherRecordRow[] = rawRecords.map((r) => ({
    id: r.id,
    locationQuery: r.locationQuery,
    resolvedName: r.resolvedName,
    latitude: r.latitude,
    longitude: r.longitude,
    startDate: r.startDate.toISOString().split('T')[0],
    endDate: r.endDate.toISOString().split('T')[0],
    temperatureData: JSON.parse(r.temperatureData),
    notes: r.notes,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));

  const filename = `weather-records-${new Date().toISOString().split('T')[0]}`;

  switch (format) {
    case 'json':
      return new Response(toJson(records), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}.json"`,
        },
      });

    case 'csv':
      return new Response(toCsv(records), {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}.csv"`,
        },
      });

    case 'xml':
      return new Response(toXml(records), {
        headers: {
          'Content-Type': 'application/xml',
          'Content-Disposition': `attachment; filename="${filename}.xml"`,
        },
      });

    case 'markdown':
    case 'md':
      return new Response(toMarkdown(records), {
        headers: {
          'Content-Type': 'text/markdown',
          'Content-Disposition': `attachment; filename="${filename}.md"`,
        },
      });

    case 'pdf': {
      const buffer = await toPdf(records);
      return new Response(new Uint8Array(buffer), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}.pdf"`,
        },
      });
    }

    default:
      return NextResponse.json({ error: 'Unsupported format. Use: json, csv, xml, markdown, pdf' }, { status: 400 });
  }
}
