'use client';

import { Member, Place, PlaceType } from '@/lib/types';
import { MemberGlyph, PlaceTypeGlyph, normalizePlaceTypeId } from './IconSystem';

type Props = {
  places: Place[];
  members: Member[];
  placeTypes: PlaceType[];
  selectedPlaceId?: string;
  onSelectPlace: (placeId: string) => void;
  emptyText: string;
  favoritePlaceIds?: string[];
  visitedPlaceIds?: string[];
  savedBadgeText?: string;
  visitedBadgeText?: string;
};

export default function PlaceList({
  places,
  members,
  placeTypes,
  selectedPlaceId,
  onSelectPlace,
  emptyText,
  favoritePlaceIds = [],
  visitedPlaceIds = [],
  savedBadgeText = 'Saved',
  visitedBadgeText = 'Visited'
}: Props) {
  const memberMap = new Map(members.map((m) => [m.id, m.displayName]));
  const typeMap = new Map(placeTypes.map((t) => [normalizePlaceTypeId(t.id), t.label]));

  if (!places.length) {
    return <div className="paper-panel p-5 text-sm text-[#60755d]">{emptyText}</div>;
  }

  return (
    <div className="scrapbook-grid">
      {places.map((place, idx) => {
        const active = place.id === selectedPlaceId;
        const typeId = normalizePlaceTypeId(place.placeTypeId);
        const variant = `variant-${idx % 4}`;
        const isSaved = favoritePlaceIds.includes(place.id);
        const isVisited = visitedPlaceIds.includes(place.id);

        return (
          <button
            key={place.id}
            onClick={() => onSelectPlace(place.id)}
            type="button"
            className={`polaroid-card collage-entry ${variant} text-left ${active ? 'is-active' : ''}`}
          >
            <span className="tape-strip" />

            <div className="polaroid-top">
              <img src={place.images[0]} alt={place.englishName} className="h-24 w-full rounded-md object-cover" />
              <span className="post-stamp">SEOUL / NCT</span>
            </div>

            <div className="mt-3 flex items-start justify-between gap-2">
              <div>
                <p className="hand-note">entry no.{String(idx + 1).padStart(2, '0')}</p>
                <p className="hero-serif text-[23px] leading-6 text-[#243122]">{place.englishName}</p>
                <p className="text-xs text-[#62765c]">{place.koreanName}</p>
              </div>
              <span className="tag-chip ticket-chip">
                <PlaceTypeGlyph placeTypeId={typeId} className="h-3.5 w-3.5" />
                {typeMap.get(typeId)}
              </span>
            </div>

            <p className="mt-2 line-clamp-1 text-xs text-[#5d7458]">{place.englishAddress}</p>
            <p className="mt-2 line-clamp-2 text-xs text-[#4f664a]">{place.description}</p>

            <div className="mt-2 flex flex-wrap gap-1.5">
              {isSaved ? <span className="status-chip saved">{savedBadgeText}</span> : null}
              {isVisited ? <span className="status-chip visited">{visitedBadgeText}</span> : null}
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {place.memberIds.slice(0, 4).map((id, tagIdx) => (
                <span key={id} className={`sticker-chip small tilt-${tagIdx % 3}`}>
                  <MemberGlyph memberId={id} className="h-3 w-3" />
                  {memberMap.get(id)}
                </span>
              ))}
            </div>

            <span className="date-ticket">2026.03.{String((idx % 21) + 8).padStart(2, '0')}</span>
          </button>
        );
      })}
    </div>
  );
}
