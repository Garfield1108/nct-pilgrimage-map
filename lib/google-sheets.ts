import { Place, PlaceMoodTag } from './types';

const allowedMoodTags: PlaceMoodTag[] = ['hot', 'classic', 'hidden', 'photo-spot'];

const jwSheetHeaders = [
  'id',
  'name',
  'category',
  'area',
  'address_ko',
  'address_zh',
  'lat',
  'lng',
  'description',
  'images',
  'coord_method',
  'coord_confidence',
  'coord_source_url'
];

export function buildGoogleSheetsCsvUrl(sheetId: string, gid: string): string {
  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
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
    .split(/[|,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getField(row: Record<string, string>, ...keys: string[]): string {
  for (const key of keys) {
    const value = row[key] ?? row[key.toLowerCase()];
    if (value && value.trim().length > 0) {
      return value.trim();
    }
  }
  return '';
}

function normalizeImagePath(raw: string): string {
  const value = raw.trim();
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith('/')) return value;
  return `/jw-images/${value.replace(/^\.?\/+/, '')}`;
}

function parseImages(row: Record<string, string>): string[] {
  return splitList(getField(row, 'images', 'imageUrls', 'image', 'imageUrl'))
    .map(normalizeImagePath)
    .filter(Boolean);
}

function toMoodTags(value: string | undefined): PlaceMoodTag[] | undefined {
  const tags = splitList(value).filter((tag): tag is PlaceMoodTag => allowedMoodTags.includes(tag as PlaceMoodTag));
  return tags.length ? tags : undefined;
}

function normalizePlaceType(placeTypeId: string): string {
  const normalized = placeTypeId.trim().toLowerCase().replace(/_/g, '-');

  if (normalized === 'cafe' || normalized === 'restaurant' || normalized === 'other') return normalized;
  if (
    normalized === 'filming' ||
    normalized === 'filming spot' ||
    normalized === 'filming-spot' ||
    normalized === 'mv' ||
    normalized === 'scene' ||
    normalized === 'episode' ||
    normalized === 'shooting'
  ) {
    return 'filming-spot';
  }

  return 'other';
}

function sourceNoteFromRow(row: Record<string, string>): string | undefined {
  const parts = [
    getField(row, 'sourceNote'),
    getField(row, 'status'),
    getField(row, 'coord_source_url')
  ].filter(Boolean);

  return parts.length ? parts.join(' | ') : undefined;
}

function buildDescriptionsFromRow(row: Record<string, string>): { description: string; descriptionZh?: string } {
  const englishDescription = getField(
    row,
    'descriptionEn',
    'description_en',
    'englishDescription',
    'english_description',
    'noteEn',
    'note_en',
    'notesEn',
    'notes_en'
  );
  const chineseDescription = getField(
    row,
    'descriptionZh',
    'description_zh',
    'descriptionCn',
    'description_cn',
    'noteZh',
    'note_zh',
    'notesZh',
    'notes_zh'
  );
  const genericDescription = getField(row, 'description', 'note', 'notes');

  return {
    description: englishDescription || genericDescription,
    descriptionZh: chineseDescription || (englishDescription ? genericDescription || undefined : undefined)
  };
}

function rowToPlace(row: Record<string, string>, index: number): Place | null {
  const englishName = getField(row, 'englishName', 'name');
  const koreanName = getField(row, 'koreanName');
  const latitudeRaw = getField(row, 'latitude', 'lat');
  const longitudeRaw = getField(row, 'longitude', 'lng', 'lon');
  const latitude = Number(latitudeRaw);
  const longitude = Number(longitudeRaw);

  if (!englishName || !latitudeRaw || !longitudeRaw || Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return null;
  }

  const explicitMemberIds = splitList(getField(row, 'memberIds', 'members'));
  const memberIds = explicitMemberIds.length ? explicitMemberIds : ['jungwoo'];
  const images = parseImages(row);
  const placeTypeId = normalizePlaceType(getField(row, 'placeTypeId', 'category') || 'other');
  const koreanAddress = getField(row, 'koreanAddress', 'address_ko');
  const englishAddress = getField(row, 'englishAddress', 'address', 'address_zh', 'address_cn');
  const displayAddress = englishAddress || koreanAddress;
  const name = getField(row, 'name') || englishName;
  const { description, descriptionZh } = buildDescriptionsFromRow(row);

  return {
    id: getField(row, 'id') || `sheet-place-${index + 1}`,
    name,
    address: displayAddress,
    englishName,
    koreanName,
    englishAddress,
    koreanAddress,
    latitude,
    longitude,
    memberIds,
    placeTypeId,
    description,
    descriptionZh,
    moodTags: toMoodTags(getField(row, 'moodTags')),
    images,
    sourceNote: sourceNoteFromRow(row)
  };
}

function looksLikeStandardHeader(headers: string[]): boolean {
  const normalized = headers.map((header) => header.trim().toLowerCase());
  return normalized.includes('id') && (normalized.includes('englishname') || normalized.includes('name'));
}

function normalizeLooseHeader(cell: string, fallback: string): string {
  const key = cell.trim().split(/\s+/)[0];
  return key || fallback;
}

function rowsToObjects(headers: string[], dataRows: string[][]): Record<string, string>[] {
  return dataRows.map((values) => {
    const row: Record<string, string> = {};
    headers.forEach((key, keyIndex) => {
      const value = (values[keyIndex] ?? '').trim();
      row[key] = value;
      row[key.toLowerCase()] = value;
    });
    return row;
  });
}

export function parsePlacesFromGoogleSheetCsv(csvText: string): Place[] {
  const rows = parseCsv(csvText);
  if (!rows.length) return [];

  const [headers, ...dataRows] = rows;
  const keys = headers.map((header) => header.trim());
  const useStandardHeader = looksLikeStandardHeader(keys);
  const objects = useStandardHeader ? rowsToObjects(keys, dataRows) : rowsToObjects(jwSheetHeaders, rows.slice(1));

  return objects.map((row, index) => rowToPlace(row, index)).filter(Boolean) as Place[];
}





