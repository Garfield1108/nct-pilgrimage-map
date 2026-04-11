'use client';

import { ChangeEvent, FormEvent } from 'react';
import { PlaceFilters, PlaceType } from '@/lib/types';
import { CandyGlyph, PlaceTypeGlyph, normalizePlaceTypeId } from './IconSystem';


const fallbackPlaceTypes: PlaceType[] = [
  { id: 'cafe', label: '咖啡店' },
  { id: 'restaurant', label: '餐厅' },
  { id: 'filming-spot', label: '拍摄地' },
  { id: 'other', label: '其他' }
];
type Props = {
  placeTypes: PlaceType[];
  filters: PlaceFilters;
  onFiltersChange: (next: PlaceFilters) => void;
  searchPlaceholder: string;
  searchActionLabel: string;
  placeTypeLabel: string;
  allPlaceTypesLabel: string;
  placeTypeTextMap: Record<string, string>;
};

export default function FilterPanel({
  placeTypes,
  filters,
  onFiltersChange,
  searchPlaceholder,
  searchActionLabel,
  placeTypeLabel,
  allPlaceTypesLabel,
  placeTypeTextMap
}: Props) {
  const visiblePlaceTypes = placeTypes.length ? placeTypes : fallbackPlaceTypes;

  const togglePlaceType = (id: string) => {
    if (filters.placeTypeIds.length === 0) {
      onFiltersChange({ ...filters, placeTypeIds: [id] });
      return;
    }

    const has = filters.placeTypeIds.includes(id);
    const next = has ? filters.placeTypeIds.filter((x) => x !== id) : [...filters.placeTypeIds, id];
    if (!next.length) return;

    onFiltersChange({ ...filters, placeTypeIds: next });
  };

  const selectAllPlaceTypes = () => {
    onFiltersChange({ ...filters, placeTypeIds: [] });
  };

  const onSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, keyword: e.target.value });
  };

  const onSearchSubmit = (event: FormEvent) => {
    event.preventDefault();
    onFiltersChange({ ...filters, keyword: filters.keyword.trim() });
  };

  return (
    <div className="paper-filter-stack collage-filter integrated-filter-ribbon single-member-ribbon keepsake-filter-ribbon">
      <form className="filter-search-wrap filter-search-row relative collection-search-shell" onSubmit={onSearchSubmit}>
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#7a625d] collection-search-icon">
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="9" cy="9" r="5" />
            <path d="M13 13l4 4" />
          </svg>
        </span>
        <input value={filters.keyword} onChange={onSearchChange} placeholder={searchPlaceholder} className="paper-search-input collection-search-input" />
        <button type="submit" className="search-action-btn collection-search-btn">
          <CandyGlyph className="h-3.5 w-3.5" />
          {searchActionLabel}
        </button>
      </form>

      <div className="filter-grid filter-ribbon-grid single-filter-grid">
        <div className="scrap-section filter-group-card ribbon-group ribbon-group-type ribbon-group-full collection-chip-section">
          <div className="filter-group-head collection-chip-head">
            <p className="paper-kicker lined-label subtle-label collection-chip-label">{placeTypeLabel}</p>
          </div>
          <div className="chip-track collection-chip-track">
            <button
              type="button"
              onClick={selectAllPlaceTypes}
              className={`sticker-filter type-chip sugar-chip sticker-tab keepsake-chip all-type-chip ${filters.placeTypeIds.length === 0 ? 'active' : ''}`}
            >
              <CandyGlyph className="h-4 w-4" />
              {allPlaceTypesLabel}
            </button>
            {visiblePlaceTypes.map((type, idx) => {
              const normalizedId = normalizePlaceTypeId(type.id);
              const active = filters.placeTypeIds.includes(type.id);
              const label = placeTypeTextMap[normalizedId] ?? type.label;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => togglePlaceType(type.id)}
                  className={`sticker-filter type-chip sugar-chip sticker-tab keepsake-chip tab-${idx % 4} ${active ? 'active' : ''}`}
                >
                  <PlaceTypeGlyph placeTypeId={normalizedId} className="h-4 w-4" />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}



