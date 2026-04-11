import { UserPlaceState } from './types';

const SESSION_KEY = 'nct-pilgrimage-session-id';
export const FAVORITES_KEY = 'jw-favorites';
export const VISITED_KEY = 'jw-visited';

function canUseLocalStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function uid(prefix: string): string {
  const randomId = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);
  return `${prefix}_${randomId}`;
}

function normalizeIdArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return Array.from(
    new Set(
      value
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );
}

function readIdArray(key: string): string[] {
  if (!canUseLocalStorage()) return [];

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    return normalizeIdArray(JSON.parse(raw));
  } catch {
    return [];
  }
}

function writeIdArray(key: string, ids: string[]): string[] {
  const next = normalizeIdArray(ids);
  if (!canUseLocalStorage()) return next;

  try {
    window.localStorage.setItem(key, JSON.stringify(next));
  } catch {
    // Ignore storage quota/private-mode failures and keep the UI from crashing.
  }

  return next;
}

function toggleId(key: string, placeId: string): string[] {
  const normalizedId = placeId.trim();
  if (!normalizedId) return readIdArray(key);

  const existing = readIdArray(key);
  const next = existing.includes(normalizedId) ? existing.filter((id) => id !== normalizedId) : [...existing, normalizedId];
  return writeIdArray(key, next);
}

function setIdState(key: string, placeId: string, enabled: boolean): string[] {
  const normalizedId = placeId.trim();
  if (!normalizedId) return readIdArray(key);

  const existing = readIdArray(key);
  const next = enabled
    ? Array.from(new Set([...existing, normalizedId]))
    : existing.filter((id) => id !== normalizedId);
  return writeIdArray(key, next);
}

export function getSessionId(): string {
  if (!canUseLocalStorage()) return 'server-session';

  const existing = window.localStorage.getItem(SESSION_KEY);
  if (existing) return existing;

  const created = uid('session');
  window.localStorage.setItem(SESSION_KEY, created);
  return created;
}

export function getFavorites(): string[] {
  return readIdArray(FAVORITES_KEY);
}

export function isFavorite(placeId: string): boolean {
  return getFavorites().includes(placeId);
}

export function toggleFavorite(placeId: string): string[] {
  return toggleId(FAVORITES_KEY, placeId);
}

export function getVisited(): string[] {
  return readIdArray(VISITED_KEY);
}

export function isVisited(placeId: string): boolean {
  return getVisited().includes(placeId);
}

export function toggleVisited(placeId: string): string[] {
  return toggleId(VISITED_KEY, placeId);
}

export function getFavoritePlaceIds(): string[] {
  return getFavorites();
}

export function toggleFavoritePlaceId(placeId: string): string[] {
  return toggleFavorite(placeId);
}

export function getUserPlaceStates(sessionId: string): UserPlaceState[] {
  const favoriteIds = getFavorites();
  const visitedIds = getVisited();
  const placeIds = Array.from(new Set([...favoriteIds, ...visitedIds]));
  const now = new Date().toISOString();

  return placeIds.map((placeId) => ({
    sessionId,
    placeId,
    wantToGo: favoriteIds.includes(placeId),
    visited: visitedIds.includes(placeId),
    updatedAt: now
  }));
}

export function upsertUserPlaceState(
  sessionId: string,
  placeId: string,
  patch: Partial<Pick<UserPlaceState, 'wantToGo' | 'visited'>>
): UserPlaceState[] {
  if (typeof patch.wantToGo === 'boolean') {
    setIdState(FAVORITES_KEY, placeId, patch.wantToGo);
  }

  if (typeof patch.visited === 'boolean') {
    setIdState(VISITED_KEY, placeId, patch.visited);
  }

  return getUserPlaceStates(sessionId);
}
