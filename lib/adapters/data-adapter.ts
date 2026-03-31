import { members, places, placeTypes } from '../mock-data';
import { filterPlaces } from '../filters';
import {
  createCheckIn,
  getFavoritePlaceIds,
  getUserPlaceStates,
  listCheckIns,
  shouldWarnDuplicate,
  toDisplayCheckIns,
  toggleFavoritePlaceId,
  upsertUserPlaceState
} from '../storage';
import {
  CreateCheckInInput,
  DisplayCheckIn,
  Member,
  Place,
  PlaceFilters,
  PlaceType,
  UserPlaceState
} from '../types';

export type DataAdapter = {
  getMembers: () => Promise<Member[]>;
  getPlaceTypes: () => Promise<PlaceType[]>;
  getPlaces: (filters: PlaceFilters) => Promise<Place[]>;
  getPlaceById: (placeId: string) => Promise<Place | undefined>;
  getCheckIns: (placeId: string, sessionId?: string) => Promise<DisplayCheckIn[]>;
  createCheckIn: (input: CreateCheckInInput) => Promise<DisplayCheckIn>;
  shouldWarnDuplicate: (sessionId: string, placeId: string) => Promise<boolean>;
  getUserPlaceStates: (sessionId: string) => Promise<UserPlaceState[]>;
  toggleVisited: (sessionId: string, placeId: string) => Promise<UserPlaceState[]>;
  getFavoritePlaceIds: () => Promise<string[]>;
  toggleFavoritePlaceId: (placeId: string) => Promise<string[]>;
};

const localInteractionAdapter = {
  async getCheckIns(placeId: string, sessionId?: string) {
    const items = await listCheckIns(placeId, sessionId);
    return toDisplayCheckIns(items);
  },

  async createCheckIn(input: CreateCheckInInput) {
    const created = await createCheckIn(input);
    const [display] = await toDisplayCheckIns([created]);
    return display;
  },

  async shouldWarnDuplicate(sessionId: string, placeId: string) {
    return shouldWarnDuplicate(sessionId, placeId);
  },

  async getUserPlaceStates(sessionId: string) {
    return getUserPlaceStates(sessionId);
  },

  async toggleVisited(sessionId: string, placeId: string) {
    const states = getUserPlaceStates(sessionId);
    const current = states.find((s) => s.placeId === placeId);
    return upsertUserPlaceState(sessionId, placeId, { visited: !(current?.visited ?? false) });
  },

  async getFavoritePlaceIds() {
    return getFavoritePlaceIds();
  },

  async toggleFavoritePlaceId(placeId: string) {
    return toggleFavoritePlaceId(placeId);
  }
};

async function fetchGoogleSheetPlaces(): Promise<Place[]> {
  const response = await fetch('/api/places', {
    method: 'GET',
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error('Failed to load places from Google Sheets API.');
  }

  const payload = (await response.json()) as { places?: Place[] };
  return Array.isArray(payload.places) ? payload.places : [];
}

export const mockAdapter: DataAdapter = {
  async getMembers() {
    return members;
  },

  async getPlaceTypes() {
    return placeTypes;
  },

  async getPlaces(filters: PlaceFilters) {
    return filterPlaces(places, members, filters);
  },

  async getPlaceById(placeId: string) {
    return places.find((p) => p.id === placeId);
  },

  ...localInteractionAdapter
};

export const googleSheetsAdapter: DataAdapter = {
  async getMembers() {
    return members;
  },

  async getPlaceTypes() {
    return placeTypes;
  },

  async getPlaces(filters: PlaceFilters) {
    const sheetPlaces = await fetchGoogleSheetPlaces();
    return filterPlaces(sheetPlaces, members, filters);
  },

  async getPlaceById(placeId: string) {
    const sheetPlaces = await fetchGoogleSheetPlaces();
    return sheetPlaces.find((p) => p.id === placeId);
  },

  ...localInteractionAdapter
};
