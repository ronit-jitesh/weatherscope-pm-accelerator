import Papa from 'papaparse';
import { create } from 'xmlbuilder2';
import PDFDocument from 'pdfkit';
import type { WeatherRecordRow } from '@/types/weather';

function flattenRecords(records: WeatherRecordRow[]) {
  return records.map((r) => ({
    id: r.id,
    location_query: r.locationQuery,
    resolved_name: r.resolvedName,
    latitude: r.latitude,
    longitude: r.longitude,
    start_date: r.startDate,
    end_date: r.endDate,
    notes: r.notes || '',
    created_at: r.createdAt,
    temperature_data: JSON.stringify(r.temperatureData),
  }));
}

export function toJson(records: WeatherRecordRow[]): string {
  return JSON.stringify(records, null, 2);
}

export function toCsv(records: WeatherRecordRow[]): string {
  return Papa.unparse(flattenRecords(records));
}

export function toXml(records: WeatherRecordRow[]): string {
  const root = create({ version: '1.0', encoding: 'UTF-8' }).ele('WeatherRecords');
  for (const r of records) {
    const rec = root.ele('Record');
    rec.ele('Id').txt(r.id);
    rec.ele('LocationQuery').txt(r.locationQuery);
    rec.ele('ResolvedName').txt(r.resolvedName);
    rec.ele('Latitude').txt(String(r.latitude));
    rec.ele('Longitude').txt(String(r.longitude));
    rec.ele('StartDate').txt(r.startDate);
    rec.ele('EndDate').txt(r.endDate);
    rec.ele('Notes').txt(r.notes || '');
    rec.ele('CreatedAt').txt(r.createdAt);
    const temps = rec.ele('TemperatureData');
    for (const d of r.temperatureData) {
      const day = temps.ele('Day');
      day.ele('Date').txt(d.date);
      day.ele('TempMax').txt(String(d.tempMax));
      day.ele('TempMin').txt(String(d.tempMin));
      day.ele('PrecipitationSum').txt(String(d.precipitationSum));
    }
  }
  return root.end({ prettyPrint: true });
}

export function toMarkdown(records: WeatherRecordRow[]): string {
  const lines: string[] = ['# Weather Records Export\n'];
  for (const r of records) {
    lines.push(`## ${r.resolvedName}`);
    lines.push(`- **Query:** ${r.locationQuery}`);
    lines.push(`- **Coordinates:** ${r.latitude}, ${r.longitude}`);
    lines.push(`- **Date Range:** ${r.startDate} → ${r.endDate}`);
    if (r.notes) lines.push(`- **Notes:** ${r.notes}`);
    lines.push('');
    lines.push('| Date | Max °C | Min °C | Precip (mm) |');
    lines.push('|------|--------|--------|-------------|');
    for (const d of r.temperatureData) {
      lines.push(`| ${d.date} | ${d.tempMax} | ${d.tempMin} | ${d.precipitationSum} |`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

export async function toPdf(records: WeatherRecordRow[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(20).font('Helvetica-Bold').text('Weather Records Report', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(1);

    for (const r of records) {
      if (doc.y > 680) doc.addPage();

      doc.fontSize(14).font('Helvetica-Bold').text(r.resolvedName);
      doc.fontSize(10).font('Helvetica');
      doc.text(`Query: ${r.locationQuery}`);
      doc.text(`Coordinates: ${r.latitude.toFixed(4)}, ${r.longitude.toFixed(4)}`);
      doc.text(`Date Range: ${r.startDate} → ${r.endDate}`);
      if (r.notes) doc.text(`Notes: ${r.notes}`);
      doc.moveDown(0.5);

      // Table header
      const cols = [60, 100, 80, 80, 100];
      const headers = ['Date', 'Max Temp (°C)', 'Min Temp (°C)', 'Precip (mm)', ''];
      let x = doc.page.margins.left;
      doc.font('Helvetica-Bold').fontSize(9);
      headers.forEach((h, i) => {
        doc.text(h, x, doc.y, { width: cols[i], continued: i < headers.length - 1 });
        x += cols[i];
      });
      doc.font('Helvetica').fontSize(9);
      doc.moveDown(0.3);
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.2);

      for (const d of r.temperatureData) {
        if (doc.y > 700) doc.addPage();
        x = doc.page.margins.left;
        const row = [d.date, String(d.tempMax), String(d.tempMin), String(d.precipitationSum), ''];
        row.forEach((cell, i) => {
          doc.text(cell, x, doc.y, { width: cols[i], continued: i < row.length - 1 });
          x += cols[i];
        });
        doc.moveDown(0.2);
      }

      doc.moveDown(1);
    }

    doc.end();
  });
}
