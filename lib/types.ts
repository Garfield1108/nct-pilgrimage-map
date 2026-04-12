export type PlaceType = {
  id: string;
  label: string;
};

export type Member = {
  id: string;
  englishName: string;
  displayName: string;
  aliases: string[];
};

export type PlaceMoodTag = 'hot' | 'classic' | 'hidden' | 'photo-spot';

export type Place = {
  id: string;
  name: string;
  address: string;
  englishName: string;
  koreanName: string;
  englishAddress: string;
  koreanAddress: string;
  latitude: number;
  longitude: number;
  memberIds: string[];
  placeTypeId: string;
  description: string;
  descriptionZh?: string;
  moodTags?: PlaceMoodTag[];
  images: string[];
  thumbnailImages?: string[];
  sourceNote?: string;
};

export type PlaceFilters = {
  memberIds: string[];
  placeTypeIds: string[];
  keyword: string;
};

export type UserPlaceState = {
  placeId: string;
  sessionId: string;
  wantToGo: boolean;
  visited: boolean;
  updatedAt: string;
};
