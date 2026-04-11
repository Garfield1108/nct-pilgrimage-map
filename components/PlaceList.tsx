'use client';

import { KeyboardEvent, MouseEvent } from 'react';
import { Place, PlaceType } from '@/lib/types';
import { CandyGlyph, PlaceTypeGlyph, normalizePlaceTypeId } from './IconSystem';

type Props = {
  places: Place[];
  placeTypes: PlaceType[];
  selectedPlaceId?: string;
  onSelectPlace: (placeId: string) => void;
  emptyText: string;
  favoritePlaceIds?: string[];
  visitedPlaceIds?: string[];
  savedBadgeText?: string;
  visitedBadgeText?: string;
  descriptionFallback: string;
  noImageText: string;
  wantLabel?: string;
  visitedLabel?: string;
  onToggleFavorite?: (placeId: string) => void;
  onToggleVisited?: (placeId: string) => void;
};

function SaveIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M10 3.3l1.95 3.95 4.35.63-3.15 3.08.74 4.34L10 13.25 6.11 15.3l.74-4.34L3.7 7.88l4.35-.63L10 3.3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function VisitedIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M4 10.4l3.7 3.7L16 5.8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.2 16.1h9.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export default function PlaceList({
  places,
  placeTypes,
  selectedPlaceId,
  onSelectPlace,
  emptyText,
  favoritePlaceIds = [],
  visitedPlaceIds = [],
  savedBadgeText = 'Saved',
  visitedBadgeText = 'Visited',
  descriptionFallback,
  noImageText,
  wantLabel = 'Want to go',
  visitedLabel = 'Visited',
  onToggleFavorite,
  onToggleVisited
}: Props) {
  const typeMap = new Map(placeTypes.map((t) => [normalizePlaceTypeId(t.id), t.label]));

  if (!places.length) {
    return <div className="paper-panel collection-empty-card p-5 text-sm text-[#637056]">{emptyText}</div>;
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>, placeId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelectPlace(placeId);
    }
  };

  const stopCardSelection = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
  };

  return (
    <div className="scrapbook-grid sugar-route-grid collection-route-grid">
      {places.map((place, idx) => {
        const active = place.id === selectedPlaceId;
        const typeId = normalizePlaceTypeId(place.placeTypeId);
        const typeLabel = typeMap.get(typeId) ?? typeId;
        const variant = `variant-${idx % 4}`;
        const isSaved = favoritePlaceIds.includes(place.id);
        const isVisited = visitedPlaceIds.includes(place.id);
        const blurb = place.description || descriptionFallback;
        const coverImage = place.images[0];

        return (
          <article
            key={place.id}
            role="button"
            tabIndex={0}
            onClick={() => onSelectPlace(place.id)}
            onKeyDown={(event) => handleKeyDown(event, place.id)}
            className={`polaroid-card collection-card sugar-card collection-spot-card collage-entry ${variant} cursor-pointer text-left ${active ? 'is-active' : ''}`}
          >
            <span className="tape-strip sugar-tape collection-tape" />

            <div className="polaroid-top collection-media sugar-media-frame collection-photo-card">
              {coverImage ? (
                <img src={coverImage} alt={place.englishName} className="h-36 w-full rounded-xl bg-[#fffafc] object-contain" />
              ) : (
                <div className="collection-no-image-card h-36 w-full rounded-xl border border-dashed border-[#dccfd7] bg-[#fffafc]">
                  <span className="collection-no-image-type">
                    <PlaceTypeGlyph placeTypeId={typeId} className="h-4 w-4" />
                    {typeLabel}
                  </span>
                  <p className="collection-no-image-note">{noImageText}</p>
                </div>
              )}
              <span className="collection-index sugar-index">{String(idx + 1).padStart(2, '0')}</span>
              <span className="collection-candy-stamp">
                <CandyGlyph className="h-3.5 w-3.5" />
              </span>
            </div>

            <div className="collection-body mt-3">
              <div className="collection-title-stack">
                <p className="hero-serif text-[24px] leading-6 text-[#3a452f]">{place.englishName}</p>
                <p className="text-xs text-[#78806c]">{place.koreanName}</p>
              </div>

              <div className="collection-meta-row">
                <span className="tag-chip ticket-chip sugar-type-chip">
                  <PlaceTypeGlyph placeTypeId={typeId} className="h-3.5 w-3.5" />
                  {typeLabel}
                </span>

                <div className="collection-status-row">
                  {isSaved ? <span className="status-chip saved">{savedBadgeText}</span> : null}
                  {isVisited ? <span className="status-chip visited">{visitedBadgeText}</span> : null}
                </div>
              </div>

              <div className="collection-copy collection-note-sheet rounded-xl border px-3 py-2.5">
                <p className="line-clamp-1 text-xs text-[#6d785f]">{place.englishAddress}</p>
                <p className="mt-2 line-clamp-2 text-xs text-[#4e5b43]">{blurb}</p>
              </div>

              <div className="collection-card-actions" aria-label="local place actions">
                {onToggleFavorite ? (
                  <button
                    type="button"
                    onClick={(event) => {
                      stopCardSelection(event);
                      onToggleFavorite(place.id);
                    }}
                    className={`collection-card-action save-action ${isSaved ? 'active' : ''}`}
                  >
                    <SaveIcon className="h-3.5 w-3.5" />
                    {wantLabel}
                  </button>
                ) : null}
                {onToggleVisited ? (
                  <button
                    type="button"
                    onClick={(event) => {
                      stopCardSelection(event);
                      onToggleVisited(place.id);
                    }}
                    className={`collection-card-action visited-action ${isVisited ? 'active' : ''}`}
                  >
                    <VisitedIcon className="h-3.5 w-3.5" />
                    {visitedLabel}
                  </button>
                ) : null}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
