'use client';

import { ChangeEvent } from 'react';
import { Member, PlaceFilters, PlaceType } from '@/lib/types';
import { MemberGlyph, PlaceTypeGlyph, normalizePlaceTypeId } from './IconSystem';

type Props = {
  members: Member[];
  placeTypes: PlaceType[];
  filters: PlaceFilters;
  onFiltersChange: (next: PlaceFilters) => void;
  searchPlaceholder: string;
  membersLabel: string;
  placeTypeLabel: string;
  placeTypeTextMap: Record<string, string>;
};

export default function FilterPanel({
  members,
  placeTypes,
  filters,
  onFiltersChange,
  searchPlaceholder,
  membersLabel,
  placeTypeLabel,
  placeTypeTextMap
}: Props) {
  const toggleItem = (key: 'memberIds' | 'placeTypeIds', id: string) => {
    const has = filters[key].includes(id);
    const next = has ? filters[key].filter((x) => x !== id) : [...filters[key], id];
    onFiltersChange({ ...filters, [key]: next });
  };

  const onSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, keyword: e.target.value });
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6a7f64]">
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="9" cy="9" r="5" />
            <path d="M13 13l4 4" />
          </svg>
        </span>
        <input
          value={filters.keyword}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          className="h-12 w-full rounded-full border border-[#d6e6c7] bg-[#fbfef6] pl-11 pr-4 text-sm text-[#243124] outline-none transition focus:border-[#98f56b] focus:ring-2 focus:ring-[#b7ff7a]/35"
        />
      </div>

      <div className="space-y-2">
        <p className="px-1 text-[11px] uppercase tracking-[0.16em] text-[#637a5f]">{membersLabel}</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {members.map((member) => {
            const active = filters.memberIds.includes(member.id);
            return (
              <button
                key={member.id}
                type="button"
                onClick={() => toggleItem('memberIds', member.id)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                  active
                    ? 'border-[#8fc168] bg-[#a8ff60] text-[#21301e] shadow-[0_8px_20px_rgba(152,245,107,0.25)]'
                    : 'border-[#d8e7ca] bg-[#fbfef7] text-[#455a40] hover:-translate-y-[1px] hover:border-[#bad9a1]'
                }`}
              >
                <MemberGlyph memberId={member.id} className="h-4 w-4" />
                {member.displayName}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <p className="px-1 text-[11px] uppercase tracking-[0.16em] text-[#637a5f]">{placeTypeLabel}</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {placeTypes.map((type) => {
            const normalizedId = normalizePlaceTypeId(type.id);
            const active = filters.placeTypeIds.includes(type.id);
            const label = placeTypeTextMap[normalizedId] ?? type.label;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => toggleItem('placeTypeIds', type.id)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                  active
                    ? 'border-[#89bb63] bg-[#a8ff60] text-[#22321f]'
                    : 'border-[#d9e8cb] bg-[#fbfef7] text-[#4d6247] hover:border-[#c4dcb0]'
                }`}
              >
                <PlaceTypeGlyph placeTypeId={normalizedId} className="h-4 w-4" />
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
