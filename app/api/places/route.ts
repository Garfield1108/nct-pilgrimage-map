import { NextResponse } from 'next/server';
import imageManifest from '@/data/jw-image-manifest.json';
import imageThumbManifest from '@/data/jw-image-thumb-manifest.json';
import { places as mockPlaces } from '@/lib/mock-data';
import { Place } from '@/lib/types';
import { buildGoogleSheetsCsvUrl, parsePlacesFromGoogleSheetCsv } from '@/lib/google-sheets';
export const runtime = 'edge';
const typedImageManifest = imageManifest as Record<string, string[]>;
const typedImageThumbManifest = imageThumbManifest as Record<string, string[]>;

function buildIdPrefixes(placeId: string): string[] {
  const prefixes = new Set<string>();
  const normalized = placeId.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (normalized) prefixes.add(normalized);

  const numericParts = placeId.match(/\d+/g);
  if (numericParts?.length) {
    const value = Number(numericParts[numericParts.length - 1]);
    if (!Number.isNaN(value)) {
      const padded = String(value).padStart(3, '0');
      prefixes.add(padded);
      prefixes.add(`JW${padded}`);
    }
  }

  return [...prefixes];
}

function resolveLocalImagesById(placeId: string): string[] {
  const prefixes = buildIdPrefixes(placeId);
  if (!prefixes.length) return [];

  const collected = new Set<string>();
  for (const prefix of prefixes) {
    const matches = typedImageManifest[prefix];
    if (matches?.length) {
      for (const imagePath of matches) {
        collected.add(imagePath);
      }
    }
  }

  return [...collected];
}

function resolveLocalThumbsById(placeId: string): string[] {
  const prefixes = buildIdPrefixes(placeId);
  if (!prefixes.length) return [];

  const collected = new Set<string>();
  for (const prefix of prefixes) {
    const matches = typedImageThumbManifest[prefix];
    if (matches?.length) {
      for (const imagePath of matches) {
        collected.add(imagePath);
      }
    }
  }

  return [...collected];
}

function withResolvedImages(places: Place[]): Place[] {
  return places.map((place) => {
    const inferredImages = resolveLocalImagesById(place.id);
    const inferredThumbs = resolveLocalThumbsById(place.id);
    const mergedImages = Array.from(new Set([...inferredImages, ...place.images]));
    const mergedThumbs = Array.from(new Set(inferredThumbs));

    return {
      ...place,
      images: mergedImages,
      thumbnailImages: mergedThumbs.length ? mergedThumbs : mergedImages
    };
  });
}

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

    const csv = new TextDecoder('utf-8').decode(await response.arrayBuffer());
    const parsedPlaces = parsePlacesFromGoogleSheetCsv(csv);
    const sheetPlaces = withResolvedImages(parsedPlaces);

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
