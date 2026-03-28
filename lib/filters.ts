import { Member, Place, PlaceFilters } from './types';

export function matchesKeyword(place: Place, _members: Member[], keyword: string): boolean {
  if (!keyword.trim()) return true;
  const q = keyword.toLowerCase();
  const areaHints = [
    place.englishName.split(' ')[0],
    place.koreanName.split(' ')[0],
    place.englishAddress.split(',')[0],
    place.koreanAddress.split(' ')[1]
  ].filter(Boolean);

  return [
    place.name,
    place.address,
    place.englishName,
    place.koreanName,
    place.englishAddress,
    place.koreanAddress,
    ...areaHints
  ]
    .join(' ')
    .toLowerCase()
    .includes(q);
}

export function filterPlaces(places: Place[], members: Member[], filters: PlaceFilters): Place[] {
  return places.filter((place) => {
    const byMembers =
      filters.memberIds.length === 0 || filters.memberIds.some((id) => place.memberIds.includes(id));

    const byType =
      filters.placeTypeIds.length === 0 || filters.placeTypeIds.includes(place.placeTypeId);

    const byKeyword = matchesKeyword(place, members, filters.keyword);

    return byMembers && byType && byKeyword;
  });
}

