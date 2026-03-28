'use client';

import { Member, Place, PlaceType } from '@/lib/types';

type Props = {
  places: Place[];
  members: Member[];
  placeTypes: PlaceType[];
  selectedPlaceId?: string;
  onSelectPlace: (placeId: string) => void;
};

export default function PlaceList({ places, members, placeTypes, selectedPlaceId, onSelectPlace }: Props) {
  const memberMap = new Map(members.map((m) => [m.id, m.displayName]));
  const typeMap = new Map(placeTypes.map((t) => [t.id, t.label]));

  if (!places.length) {
    return (
      <div className="soft-card p-6 text-sm text-[#60755d]">
        没有匹配的地点，试试减少筛选条件或更换关键词。
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {places.map((place, idx) => {
        const active = place.id === selectedPlaceId;
        return (
          <button
            key={place.id}
            onClick={() => onSelectPlace(place.id)}
            type="button"
            className={`w-full rounded-[20px] border text-left transition-all duration-200 ${
              active
                ? 'border-[#9dd670] bg-[#f6fde9] shadow-[0_14px_26px_rgba(143,203,105,0.26)]'
                : 'border-[#dde9d1] bg-[#fbfdf7] hover:-translate-y-0.5 hover:border-[#cadfb6] hover:shadow-[0_10px_24px_rgba(74,98,70,0.12)]'
            }`}
          >
            <div className="grid grid-cols-[58px_1fr] gap-3 p-3.5">
              <div className="flex flex-col items-center gap-2 pt-0.5">
                <span className="text-[10px] font-semibold tracking-[0.16em] text-[#6d8465]">{String(idx + 1).padStart(2, '0')}</span>
                <img src={place.images[0]} alt={place.englishName} className="h-12 w-12 rounded-xl object-cover" />
              </div>

              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="hero-serif text-[22px] leading-6 text-[#233022]">{place.englishName}</p>
                    <p className="mt-0.5 text-xs text-[#62775d]">{place.koreanName}</p>
                  </div>
                  <span className="rounded-full border border-[#d2e4c4] bg-[#f0f8e7] px-2 py-1 text-[10px] uppercase tracking-[0.1em] text-[#5f7657]">
                    {typeMap.get(place.placeTypeId)}
                  </span>
                </div>

                <p className="mt-2 line-clamp-1 text-xs text-[#5f755a]">{place.englishAddress}</p>

                <div className="mt-2 flex flex-wrap gap-1.5">
                  {place.memberIds.slice(0, 3).map((id) => (
                    <span key={id} className="rounded-full bg-[#ecf7df] px-2 py-1 text-[11px] text-[#3f5438]">
                      {memberMap.get(id)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
