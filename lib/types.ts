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
  sourceNote?: string;
};

export type PlaceFilters = {
  memberIds: string[];
  placeTypeIds: string[];
  keyword: string;
};

export type CheckIn = {
  id: string;
  placeId: string;
  sessionId: string;
  note?: string;
  imageRefs: string[];
  createdAt: string;
};

export type CheckInImage = {
  id: string;
  mimeType: string;
  blob: Blob;
};

export type UserPlaceState = {
  placeId: string;
  sessionId: string;
  wantToGo: boolean;
  visited: boolean;
  updatedAt: string;
};

export type DisplayCheckIn = CheckIn & {
  imageUrls: string[];
};

export type CreateCheckInInput = {
  placeId: string;
  sessionId: string;
  note?: string;
  files: File[];
};
