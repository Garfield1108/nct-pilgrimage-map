'use client';

import CheckInForm from './CheckInForm';
import WantVisitedButtons from './WantVisitedButtons';
import { MemberGlyph, PlaceTypeGlyph, normalizePlaceTypeId } from './IconSystem';
import { Locale, uiText } from '@/lib/i18n';
import { DisplayCheckIn, Member, Place, PlaceType, UserPlaceState } from '@/lib/types';

type Props = {
  place?: Place;
  members: Member[];
  placeTypes: PlaceType[];
  checkIns: DisplayCheckIn[];
  userState?: UserPlaceState;
  isFavorite: boolean;
  locale: Locale;
  onToggleFavorite: () => void;
  onToggleVisited: () => void;
  onSubmitCheckIn: (files: File[], note: string, force: boolean) => Promise<{ warned: boolean }>;
};

export default function PlaceDetailPanel({
  place,
  members,
  placeTypes,
  checkIns,
  userState,
  isFavorite,
  locale,
  onToggleFavorite,
  onToggleVisited,
  onSubmitCheckIn
}: Props) {
  const t = uiText[locale];

  if (!place) {
    return <div className="paper-panel p-6 text-sm text-[#647b5f]">{t.selectPlace}</div>;
  }

  const memberMap = new Map(members.map((m) => [m.id, m]));
  const rawType = placeTypes.find((p) => p.id === place.placeTypeId);
  const displayTypeId = normalizePlaceTypeId(place.placeTypeId);
  const displayTypeLabel = t.placeTypeLabels[displayTypeId as keyof typeof t.placeTypeLabels] ?? rawType?.label ?? 'Other';
  const description = locale === 'zh' ? place.descriptionZh ?? place.description : place.description;

  return (
    <div key={place.id} className="paper-panel detail-spread panel-fade overflow-hidden p-4 md:p-5">
      <div className="detail-photo-frame">
        <img src={place.images[0]} alt={place.englishName} className="h-52 w-full rounded-xl object-cover" />
      </div>

      <section className="detail-section mt-4">
        <p className="paper-kicker">{t.basicInfo}</p>
        <h2 className="hero-serif mt-1 text-3xl leading-[0.95] text-[#243022]">{place.englishName}</h2>
        <p className="mt-1 text-sm text-[#5f7258]">{place.koreanName}</p>
        <p className="mt-2 text-xs text-[#5a6d54]">{place.englishAddress}</p>
        <p className="text-xs text-[#70836a]">{place.koreanAddress}</p>
      </section>

      <section className="detail-section mt-4">
        <p className="paper-kicker">{t.relationInfo}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          <span className="sticker-chip ticket-chip">
            <PlaceTypeGlyph placeTypeId={displayTypeId} className="h-4 w-4" />
            {displayTypeLabel}
          </span>
          {place.memberIds.map((id) => (
            <span key={id} className="tag-chip">
              <MemberGlyph memberId={id} className="h-3.5 w-3.5" />
              {memberMap.get(id)?.displayName}
            </span>
          ))}
        </div>
      </section>

      <section className="detail-section mt-4">
        <p className="paper-kicker">{t.descriptionTitle}</p>
        <p className="memo-note mt-2">{description}</p>
      </section>

      <section className="detail-section mt-4 border-t border-dashed border-[#ceddc1] pt-4">
        <WantVisitedButtons
          isFavorite={isFavorite}
          visited={!!userState?.visited}
          onToggleFavorite={onToggleFavorite}
          onToggleVisited={onToggleVisited}
          wantLabel={t.wantToGo}
          visitedLabel={t.visited}
        />
        <p className="mt-2 text-xs text-[#688062]">{t.actionHint}</p>
      </section>

      <section className="detail-section mt-4 border-t border-dashed border-[#ceddc1] pt-4">
        <p className="paper-kicker">
          {t.fanCheckins} · {checkIns.length}
        </p>
        <div className="mt-3 space-y-3">
          {checkIns.map((item) => (
            <div key={item.id} className="paper-note-card">
              {item.note ? <p className="text-sm text-[#2e3d2c]">{item.note}</p> : null}
              <p className="mt-1 text-[11px] text-[#6f8769]">{new Date(item.createdAt).toLocaleString()}</p>
              {item.imageUrls.length ? (
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {item.imageUrls.map((url) => (
                    <img key={url} src={url} alt="check-in" className="h-20 w-full rounded-lg object-cover" />
                  ))}
                </div>
              ) : null}
            </div>
          ))}
          {!checkIns.length ? <div className="paper-empty-card">{t.emptyCheckin}</div> : null}
        </div>
      </section>

      <section className="detail-section mt-4 border-t border-dashed border-[#ceddc1] pt-4">
        <CheckInForm
          onSubmit={onSubmitCheckIn}
          title={t.addCheckin}
          hint={t.addCheckinHint}
          imageOptionalText={t.addCheckinImageOptional}
          needContentText={t.addCheckinNeedContent}
          submitErrorText={t.addCheckinError}
          duplicateWarnText={t.duplicateWarn}
          submittingText={t.submitting}
          submitText={t.uploadAction}
        />
      </section>
    </div>
  );
}
