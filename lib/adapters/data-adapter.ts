import { members, places, placeTypes } from '../mock-data';
import { filterPlaces } from '../filters';
import {
  getFavorites,
  getUserPlaceStates,
  toggleFavorite,
  toggleVisited as toggleVisitedLocal
} from '../storage';
import { Member, Place, PlaceFilters, PlaceType, UserPlaceState } from '../types';

export type DataAdapter = {
  getMembers: () => Promise<Member[]>;
  getPlaceTypes: () => Promise<PlaceType[]>;
  getPlaces: (filters: PlaceFilters) => Promise<Place[]>;
  getPlaceById: (placeId: string) => Promise<Place | undefined>;
  getUserPlaceStates: (sessionId: string) => Promise<UserPlaceState[]>;
  toggleVisited: (sessionId: string, placeId: string) => Promise<UserPlaceState[]>;
  getFavoritePlaceIds: () => Promise<string[]>;
  toggleFavoritePlaceId: (placeId: string) => Promise<string[]>;
};

const localStateAdapter = {
  async getUserPlaceStates(sessionId: string) {
    return getUserPlaceStates(sessionId);
  },

  async toggleVisited(sessionId: string, placeId: string) {
    toggleVisitedLocal(placeId);
    return getUserPlaceStates(sessionId);
  },

  async getFavoritePlaceIds() {
    return getFavorites();
  },

  async toggleFavoritePlaceId(placeId: string) {
    return toggleFavorite(placeId);
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

  ...localStateAdapter
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

  ...localStateAdapter
};
