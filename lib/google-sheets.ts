import { Place, PlaceMoodTag } from './types';

const allowedMoodTags: PlaceMoodTag[] = ['hot', 'classic', 'hidden', 'photo-spot'];

export function buildGoogleSheetsCsvUrl(sheetId: string, gid: string): string {
  return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=${gid}`;
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(cell.trim());
      cell = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(cell.trim());
      cell = '';
      if (row.some((value) => value.length > 0)) {
        rows.push(row);
      }
      row = [];
      continue;
    }

    cell += char;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell.trim());
    if (row.some((value) => value.length > 0)) {
      rows.push(row);
    }
  }

  return rows;
}

function splitList(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean);
}

function toMoodTags(value: string | undefined): PlaceMoodTag[] | undefined {
  const tags = splitList(value).filter((tag): tag is PlaceMoodTag => allowedMoodTags.includes(tag as PlaceMoodTag));
  return tags.length ? tags : undefined;
}

function normalizePlaceType(placeTypeId: string): string {
  return placeTypeId === 'shop' ? 'other' : placeTypeId;
}

function rowToPlace(row: Record<string, string>, index: number): Place | null {
  const englishName = row.englishName || row.name;
  const koreanName = row.koreanName || row.name || '';
  const latitude = Number(row.latitude);
  const longitude = Number(row.longitude);

  if (!englishName || Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return null;
  }

  const memberIds = splitList(row.memberIds || row.members);
  const images = splitList(row.images || row.imageUrls);
  const placeTypeId = normalizePlaceType((row.placeTypeId || 'other').trim() || 'other');

  return {
    id: row.id || `sheet-place-${index + 1}`,
    name: row.name || englishName,
    address: row.address || row.englishAddress || '',
    englishName,
    koreanName,
    englishAddress: row.englishAddress || row.address || '',
    koreanAddress: row.koreanAddress || '',
    latitude,
    longitude,
    memberIds,
    placeTypeId,
    description: row.description || '',
    descriptionZh: row.descriptionZh || undefined,
    moodTags: toMoodTags(row.moodTags),
    images: images.length
      ? images
      : ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4'],
    sourceNote: row.sourceNote || undefined
  };
}

export function parsePlacesFromGoogleSheetCsv(csvText: string): Place[] {
  const rows = parseCsv(csvText);
  if (!rows.length) return [];

  const [headers, ...dataRows] = rows;
  const keys = headers.map((header) => header.trim());

  return dataRows
    .map((values, index) => {
      const row: Record<string, string> = {};
      keys.forEach((key, keyIndex) => {
        row[key] = (values[keyIndex] ?? '').trim();
      });
      return rowToPlace(row, index);
    })
    .filter(Boolean) as Place[];
}
