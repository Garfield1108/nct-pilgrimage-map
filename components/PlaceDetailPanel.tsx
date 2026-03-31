'use client';

import WantVisitedButtons from './WantVisitedButtons';
import { MemberGlyph, PlaceTypeGlyph, normalizePlaceTypeId } from './IconSystem';
import { Locale, uiText } from '@/lib/i18n';
import { Member, Place, PlaceType, UserPlaceState } from '@/lib/types';

type Props = {
  place?: Place;
  members: Member[];
  placeTypes: PlaceType[];
  userState?: UserPlaceState;
  isFavorite: boolean;
  locale: Locale;
  onToggleFavorite: () => void;
  onToggleVisited: () => void;
};

export default function PlaceDetailPanel({
  place,
  members,
  placeTypes,
  userState,
  isFavorite,
  locale,
  onToggleFavorite,
  onToggleVisited
}: Props) {
  const t = uiText[locale];

  if (!place) {
    return <div className="paper-panel p-4 text-sm text-[#4c5f49]">{t.selectPlace}</div>;
  }

  const memberMap = new Map(members.map((m) => [m.id, m]));
  const rawType = placeTypes.find((p) => p.id === place.placeTypeId);
  const displayTypeId = normalizePlaceTypeId(place.placeTypeId);
  const displayTypeLabel = t.placeTypeLabels[displayTypeId as keyof typeof t.placeTypeLabels] ?? rawType?.label ?? 'Other';
  const description = locale === 'zh' ? place.descriptionZh ?? place.description : place.description;

  return (
    <div key={place.id} className="paper-panel detail-card-surface panel-fade overflow-hidden p-4 md:p-5">
      <div className="detail-photo-frame">
        <img src={place.images[0]} alt={place.englishName} className="h-44 w-full rounded-2xl object-cover" />
      </div>

      <section className="detail-section mt-4">
        <p className="paper-kicker">{t.basicInfo}</p>
        <h2 className="hero-serif mt-1 text-[32px] leading-[0.96] text-[#172116]">{place.englishName}</h2>
        <p className="mt-1 text-sm text-[#4f6548]">{place.koreanName}</p>
        <div className="mt-3 rounded-xl border border-[#d6e1cc] bg-[#f8fcf1] p-3">
          <p className="text-xs text-[#4c6051]">{place.englishAddress}</p>
          <p className="mt-1 text-xs text-[#657a68]">{place.koreanAddress}</p>
        </div>
      </section>

      <section className="detail-section mt-4 border-t border-[#d8e3ce] pt-4">
        <p className="paper-kicker">{t.relationInfo}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          <span className="sticker-chip type-chip-pill">
            <PlaceTypeGlyph placeTypeId={displayTypeId} className="h-4 w-4" />
            {displayTypeLabel}
          </span>
          {place.memberIds.map((id) => (
            <span key={id} className="tag-chip member-chip-pill">
              <MemberGlyph memberId={id} className="h-3.5 w-3.5" />
              {memberMap.get(id)?.displayName}
            </span>
          ))}
        </div>
      </section>

      <section className="detail-section mt-4 border-t border-[#d8e3ce] pt-4">
        <p className="paper-kicker">{t.descriptionTitle}</p>
        <p className="memo-note mt-2">{description}</p>
      </section>

      <section className="detail-section mt-4 border-t border-[#d8e3ce] pt-4">
        <WantVisitedButtons
          isFavorite={isFavorite}
          visited={!!userState?.visited}
          onToggleFavorite={onToggleFavorite}
          onToggleVisited={onToggleVisited}
          wantLabel={t.wantToGo}
          visitedLabel={t.visited}
        />
        <p className="mt-2 text-xs text-[#5c7259]">{t.actionHint}</p>
      </section>
    </div>
  );
}
