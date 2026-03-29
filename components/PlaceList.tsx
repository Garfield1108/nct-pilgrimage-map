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
};

export default function PlaceList({ places, members, placeTypes, selectedPlaceId, onSelectPlace, emptyText }: Props) {
  const memberMap = new Map(members.map((m) => [m.id, m.displayName]));
  const typeMap = new Map(placeTypes.map((t) => [normalizePlaceTypeId(t.id), t.label]));

  if (!places.length) {
    return <div className="paper-panel p-5 text-sm text-[#60755d]">{emptyText}</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      {places.map((place, idx) => {
        const active = place.id === selectedPlaceId;
        const typeId = normalizePlaceTypeId(place.placeTypeId);
        return (
          <button
            key={place.id}
            onClick={() => onSelectPlace(place.id)}
            type="button"
            className={`polaroid-card text-left ${active ? 'is-active' : ''}`}
          >
            <div className="polaroid-top">
              <img src={place.images[0]} alt={place.englishName} className="h-24 w-full rounded-md object-cover" />
            </div>

            <div className="mt-3 flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] tracking-[0.14em] text-[#6f8367]">No.{String(idx + 1).padStart(2, '0')}</p>
                <p className="hero-serif text-[23px] leading-6 text-[#243122]">{place.englishName}</p>
                <p className="text-xs text-[#62765c]">{place.koreanName}</p>
              </div>
              <span className="tag-chip">
                <PlaceTypeGlyph placeTypeId={typeId} className="h-3.5 w-3.5" />
                {typeMap.get(typeId)}
              </span>
            </div>

            <p className="mt-2 line-clamp-1 text-xs text-[#5d7458]">{place.englishAddress}</p>
            <p className="mt-2 line-clamp-2 text-xs text-[#4f664a]">{place.description}</p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {place.memberIds.slice(0, 4).map((id) => (
                <span key={id} className="sticker-chip small">
                  <MemberGlyph memberId={id} className="h-3 w-3" />
                  {memberMap.get(id)}
                </span>
              ))}
            </div>
          </button>
        );
      })}
    </div>
  );
}
