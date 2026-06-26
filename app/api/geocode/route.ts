import { NextRequest, NextResponse } from 'next/server';
import { resolveLocation } from '@/lib/geocode';
import { z } from 'zod';

const schema = z.object({ query: z.string().min(1).max(200) });

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('query') ?? '';
  const parsed = schema.safeParse({ query: q });

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid query' }, { status: 400 });
  }

  try {
    const results = await resolveLocation(parsed.data.query);
    if (results.length === 0) {
      return NextResponse.json({ error: 'Location not found', results: [] }, { status: 404 });
    }
    return NextResponse.json({ results });
  } catch (err) {
    console.error('Geocode error:', err);
    return NextResponse.json({ error: 'Geocoding service error' }, { status: 500 });
  }
}
