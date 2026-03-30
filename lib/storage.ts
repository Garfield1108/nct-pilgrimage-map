import { CHECKIN_DUPLICATE_MINUTES } from './config';
import { CheckIn, CheckInImage, CreateCheckInInput, DisplayCheckIn, UserPlaceState } from './types';

const SESSION_KEY = 'nct-pilgrimage-session-id';
const USER_STATE_KEY = 'nct-user-place-states';
const FAVORITES_KEY = 'nct-favorite-place-ids';

const DB_NAME = 'nct-pilgrimage-db';
const DB_VERSION = 2;
const CHECKINS_STORE = 'checkins';
const CHECKIN_IMAGES_STORE = 'checkin-images';

function uid(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

function withDb<T>(handler: (db: IDBDatabase) => Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(CHECKINS_STORE)) {
        db.createObjectStore(CHECKINS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(CHECKIN_IMAGES_STORE)) {
        db.createObjectStore(CHECKIN_IMAGES_STORE, { keyPath: 'id' });
      }
    };

    request.onsuccess = async () => {
      const db = request.result;
      try {
        const result = await handler(db);
        resolve(result);
      } catch (error) {
        reject(error);
      } finally {
        db.close();
      }
    };

    request.onerror = () => reject(request.error);
  });
}

function txPut<T>(db: IDBDatabase, storeName: string, value: T): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    store.put(value as never);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function txGetAll<T>(db: IDBDatabase, storeName: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.getAll();
    req.onsuccess = () => resolve((req.result ?? []) as T[]);
    req.onerror = () => reject(req.error);
  });
}

function storeImages(files: File[]): Promise<string[]> {
  return withDb(async (db) => {
    const refs: string[] = [];
    for (const file of files) {
      const image: CheckInImage = {
        id: uid('img'),
        mimeType: file.type || 'image/jpeg',
        blob: file
      };
      refs.push(image.id);
      await txPut(db, CHECKIN_IMAGES_STORE, image);
    }
    return refs;
  });
}

export function getSessionId(): string {
  const existing = localStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const created = uid('session');
  localStorage.setItem(SESSION_KEY, created);
  return created;
}

export function getFavoritePlaceIds(): string[] {
  const raw = localStorage.getItem(FAVORITES_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function toggleFavoritePlaceId(placeId: string): string[] {
  const existing = getFavoritePlaceIds();
  const next = existing.includes(placeId) ? existing.filter((id) => id !== placeId) : [...existing, placeId];
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  return next;
}

export function getUserPlaceStates(sessionId: string): UserPlaceState[] {
  const raw = localStorage.getItem(USER_STATE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as UserPlaceState[];
    return parsed.filter((item) => item.sessionId === sessionId);
  } catch {
    return [];
  }
}

export function upsertUserPlaceState(
  sessionId: string,
  placeId: string,
  patch: Partial<Pick<UserPlaceState, 'wantToGo' | 'visited'>>
): UserPlaceState[] {
  const raw = localStorage.getItem(USER_STATE_KEY);
  const all = raw ? ((JSON.parse(raw) as UserPlaceState[]) ?? []) : [];
  const now = new Date().toISOString();
  const existing = all.find((item) => item.sessionId === sessionId && item.placeId === placeId);

  if (existing) {
    existing.wantToGo = patch.wantToGo ?? existing.wantToGo;
    existing.visited = patch.visited ?? existing.visited;
    existing.updatedAt = now;
  } else {
    all.push({
      sessionId,
      placeId,
      wantToGo: patch.wantToGo ?? false,
      visited: patch.visited ?? false,
      updatedAt: now
    });
  }

  localStorage.setItem(USER_STATE_KEY, JSON.stringify(all));
  return all.filter((item) => item.sessionId === sessionId);
}

export async function listCheckIns(placeId?: string, sessionId?: string): Promise<CheckIn[]> {
  const all = await withDb((db) => txGetAll<CheckIn>(db, CHECKINS_STORE));
  const sorted = all.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  return sorted.filter((item) => {
    const byPlace = !placeId || item.placeId === placeId;
    const bySession = !sessionId || item.sessionId === sessionId;
    return byPlace && bySession;
  });
}

export async function shouldWarnDuplicate(sessionId: string, placeId: string): Promise<boolean> {
  const items = await listCheckIns(placeId, sessionId);
  const last = items[0];
  if (!last) return false;

  const mins = (Date.now() - +new Date(last.createdAt)) / 1000 / 60;
  return mins < CHECKIN_DUPLICATE_MINUTES;
}

export async function createCheckIn(input: CreateCheckInInput): Promise<CheckIn> {
  const imageRefs = await storeImages(input.files);
  const record: CheckIn = {
    id: uid('checkin'),
    placeId: input.placeId,
    sessionId: input.sessionId,
    note: input.note?.trim() || undefined,
    imageRefs,
    createdAt: new Date().toISOString()
  };

  await withDb((db) => txPut(db, CHECKINS_STORE, record));
  return record;
}

async function imageRefToUrl(ref: string): Promise<string | null> {
  return withDb(async (db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(CHECKIN_IMAGES_STORE, 'readonly');
      const req = tx.objectStore(CHECKIN_IMAGES_STORE).get(ref);
      req.onsuccess = () => {
        const found = req.result as CheckInImage | undefined;
        if (!found) {
          resolve(null);
          return;
        }
        resolve(URL.createObjectURL(found.blob));
      };
      req.onerror = () => reject(req.error);
    });
  });
}

export async function toDisplayCheckIns(items: CheckIn[]): Promise<DisplayCheckIn[]> {
  const output: DisplayCheckIn[] = [];
  for (const item of items) {
    const urls = await Promise.all(item.imageRefs.map((ref) => imageRefToUrl(ref)));
    output.push({
      ...item,
      imageUrls: urls.filter(Boolean) as string[]
    });
  }
  return output;
}
