import { UserPlaceState } from './types';

const SESSION_KEY = 'nct-pilgrimage-session-id';
const USER_STATE_KEY = 'nct-user-place-states';
const FAVORITES_KEY = 'nct-favorite-place-ids';

function uid(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
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
