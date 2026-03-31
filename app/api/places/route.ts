import { NextResponse } from 'next/server';
import { places as mockPlaces } from '@/lib/mock-data';
import { buildGoogleSheetsCsvUrl, parsePlacesFromGoogleSheetCsv } from '@/lib/google-sheets';

export async function GET() {
  const sheetId = process.env.GOOGLE_SHEETS_ID;
  const gid = process.env.GOOGLE_SHEETS_GID ?? '0';

  if (!sheetId) {
    return NextResponse.json(
      { places: mockPlaces, source: 'mock', reason: 'missing-google-sheets-env' },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  }

  try {
    const url = buildGoogleSheetsCsvUrl(sheetId, gid);
    const response = await fetch(url, { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`Google Sheets request failed: ${response.status}`);
    }

    const csv = await response.text();
    const sheetPlaces = parsePlacesFromGoogleSheetCsv(csv);

    if (!sheetPlaces.length) {
      return NextResponse.json(
        { places: mockPlaces, source: 'mock', reason: 'empty-sheet-data' },
        { headers: { 'Cache-Control': 'no-store, max-age=0' } }
      );
    }

    return NextResponse.json(
      { places: sheetPlaces, source: 'google-sheets' },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch {
    return NextResponse.json(
      { places: mockPlaces, source: 'mock', reason: 'google-sheets-fetch-failed' },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  }
}
