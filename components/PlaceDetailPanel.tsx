'use client';

import { useEffect, useState } from 'react';
import WantVisitedButtons from './WantVisitedButtons';
import { PlaceTypeGlyph, normalizePlaceTypeId } from './IconSystem';
import { buildAppleMapsDirectionsUrl, buildGoogleMapsDirectionsUrl } from '@/lib/map-links';
import { Locale, uiText } from '@/lib/i18n';
import { Place, PlaceType, UserPlaceState } from '@/lib/types';

type Props = {
  place?: Place;
  placeTypes: PlaceType[];
  userState?: UserPlaceState;
  isFavorite: boolean;
  locale: Locale;
  onToggleFavorite: () => void;
  onToggleVisited: () => void;
};

export default function PlaceDetailPanel({
  place,
  placeTypes,
  userState,
  isFavorite,
  locale,
  onToggleFavorite,
  onToggleVisited
}: Props) {
  const t = uiText[locale];
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    setShowFullDescription(false);
  }, [place?.id]);

  if (!place) {
    return <div className="paper-panel detail-empty-state collection-empty-card p-4 text-sm text-[#657056]">{t.selectPlace}</div>;
  }

  const rawType = placeTypes.find((p) => p.id === place.placeTypeId);
  const displayTypeId = normalizePlaceTypeId(place.placeTypeId);
  const displayTypeLabel = t.placeTypeLabels[displayTypeId as keyof typeof t.placeTypeLabels] ?? rawType?.label ?? 'Other';
  const description = (locale === 'zh' ? place.descriptionZh ?? place.description : place.description) || t.descriptionFallback;
  const descriptionItems = description
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);
  const hasMoreDescription = descriptionItems.length > 3;
  const visibleDescriptionItems = showFullDescription ? descriptionItems : descriptionItems.slice(0, 3);
  const googleMapsUrl = buildGoogleMapsDirectionsUrl(place);
  const appleMapsUrl = buildAppleMapsDirectionsUrl(place);
  const addressLines = Array.from(
    new Set([place.englishAddress, place.koreanAddress, place.address].map((item) => item?.trim()).filter(Boolean))
  );

  return (
    <div key={place.id} className="paper-panel detail-card-surface detail-shell sugar-detail-shell sugar-detail-card collection-detail-card panel-fade overflow-hidden p-4 md:p-4">

      <section className="detail-header-block collection-header-block detail-header-no-photo">
        <p className="paper-kicker detail-overline">{t.basicInfo}</p>
        <div className="detail-title-row mt-2">
          <div className="detail-title-stack">
            <h2 className="hero-serif text-[31px] leading-[0.95] text-[#6f5d79]">{place.englishName}</h2>
            <p className="detail-korean-name mt-1 text-sm text-[#9a89a0]">{place.koreanName}</p>
          </div>

          <span className="tag-chip type-chip-pill detail-type-chip sugar-type-chip">
            <PlaceTypeGlyph placeTypeId={displayTypeId} className="h-4 w-4" />
            {displayTypeLabel}
          </span>
        </div>

        <div className="detail-address-card sugar-info-card collection-info-card mt-3">
          {addressLines.map((address, addressIndex) => (
            <p key={place.id + '-address-' + addressIndex} className={addressIndex === 0 ? 'text-xs text-[#7a625d]' : 'mt-1 text-xs text-[#9a8580]'}>
              {address}
            </p>
          ))}
        </div>
      </section>

      <section className="detail-map-links detail-block-divider">
        <p className="paper-kicker detail-overline">{t.navigationTitle}</p>
        <div className="nav-link-row mt-2">
          <a href={googleMapsUrl} target="_blank" rel="noreferrer" className="nav-link-chip nav-link-google">
            <span className="nav-link-dot" aria-hidden>
              ↗
            </span>
            {t.googleMaps}
          </a>
          <a href={appleMapsUrl} target="_blank" rel="noreferrer" className="nav-link-chip nav-link-apple">
            <span className="nav-link-dot" aria-hidden>
              ↗
            </span>
            {t.appleMaps}
          </a>
        </div>
      </section>

      <section className="detail-note-block detail-block-divider">
        <p className="paper-kicker detail-overline">{t.descriptionTitle}</p>
        <div className="memo-note detail-note-copy sugar-note-card collection-note-paper mt-2">
          <ul className="paw-note-list">
            {visibleDescriptionItems.map((item, itemIndex) => (
              <li key={`${place.id}-note-${itemIndex}`} className="paw-note-item">
                <span className="paw-note-bullet" aria-hidden="true">
                  <span className="paw-note-pad" />
                  <span className="paw-note-toe toe-one" />
                  <span className="paw-note-toe toe-two" />
                  <span className="paw-note-toe toe-three" />
                </span>
                <p>{item}</p>
              </li>
            ))}
          </ul>
          {hasMoreDescription ? (
            <button
              type="button"
              className="paw-note-toggle hand-note"
              onClick={() => setShowFullDescription((current) => !current)}
            >
              {showFullDescription ? t.collapseDescription : t.expandDescription}
            </button>
          ) : null}
        </div>
      </section>

      <section className="detail-actions-shell detail-block-divider sugar-action-block">
        <WantVisitedButtons
          isFavorite={isFavorite}
          visited={!!userState?.visited}
          onToggleFavorite={onToggleFavorite}
          onToggleVisited={onToggleVisited}
          wantLabel={t.wantToGo}
          visitedLabel={t.visited}
        />
      </section>
    </div>
  );
}


