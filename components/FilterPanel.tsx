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
    <div className="paper-filter-stack collage-filter">
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6a7f64]">
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="9" cy="9" r="5" />
            <path d="M13 13l4 4" />
          </svg>
        </span>
        <input value={filters.keyword} onChange={onSearchChange} placeholder={searchPlaceholder} className="paper-search-input" />
      </div>

      <div className="scrap-section">
        <p className="paper-kicker lined-label">{membersLabel}</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {members.map((member, idx) => {
            const active = filters.memberIds.includes(member.id);
            return (
              <button
                key={member.id}
                type="button"
                onClick={() => toggleItem('memberIds', member.id)}
                className={`sticker-filter tab-${idx % 4} ${active ? 'active' : ''}`}
              >
                <MemberGlyph memberId={member.id} className="h-4 w-4" />
                {member.displayName}
              </button>
            );
          })}
        </div>
      </div>

      <div className="scrap-section">
        <p className="paper-kicker lined-label">{placeTypeLabel}</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {placeTypes.map((type, idx) => {
            const normalizedId = normalizePlaceTypeId(type.id);
            const active = filters.placeTypeIds.includes(type.id);
            const label = placeTypeTextMap[normalizedId] ?? type.label;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => toggleItem('placeTypeIds', type.id)}
                className={`sticker-filter tab-${idx % 4} ${active ? 'active' : ''}`}
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
