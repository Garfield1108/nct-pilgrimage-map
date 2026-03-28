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
    return <div className="soft-card journal-card p-6 text-sm text-[#647b5f]">{t.selectPlace}</div>;
  }

  const memberMap = new Map(members.map((m) => [m.id, m]));
  const rawType = placeTypes.find((p) => p.id === place.placeTypeId);
  const displayTypeId = normalizePlaceTypeId(place.placeTypeId);
  const displayTypeLabel = t.placeTypeLabels[displayTypeId as keyof typeof t.placeTypeLabels] ?? rawType?.label ?? 'Other';
  const description = locale === 'zh' ? place.descriptionZh ?? place.description : place.description;

  return (
    <div key={place.id} className="soft-card journal-card panel-fade overflow-hidden p-4 md:p-5">
      <img src={place.images[0]} alt={place.englishName} className="h-48 w-full rounded-2xl object-cover shadow-[0_14px_28px_rgba(53,77,47,0.15)]" />

      <div className="mt-4">
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#67805f]">{t.destination}</p>
        <h2 className="hero-serif mt-1 text-3xl leading-[0.95] text-[#202d1f]">{place.englishName}</h2>
        <p className="mt-1 text-sm text-[#5f755a]">{place.koreanName}</p>
        <p className="mt-3 text-xs text-[#51674d]">{place.englishAddress}</p>
        <p className="text-xs text-[#6c8167]">{place.koreanAddress}</p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1 rounded-full border border-[#c9debb] bg-[#ecf7e1] px-2.5 py-1 text-[#496242]">
          <PlaceTypeGlyph placeTypeId={displayTypeId} className="h-4 w-4" />
          {displayTypeLabel}
        </span>
        {place.memberIds.map((id) => (
          <span key={id} className="inline-flex items-center gap-1 rounded-full border border-[#d8e7cb] bg-[#f6fbef] px-2.5 py-1 text-[#5c7356]">
            <MemberGlyph memberId={id} className="h-3.5 w-3.5" />
            {memberMap.get(id)?.displayName}
          </span>
        ))}
      </div>

      {place.moodTags?.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {place.moodTags.map((tag) => (
            <span key={tag} className="journal-sticker text-[11px] uppercase tracking-[0.08em]">
              {t.moodTagLabels[tag]}
            </span>
          ))}
        </div>
      ) : null}

      <p className="mt-4 text-sm leading-7 text-[#3f513b]">{description}</p>

      <div className="mt-4 border-t border-[#d8e7cb] pt-4">
        <WantVisitedButtons
          isFavorite={isFavorite}
          visited={!!userState?.visited}
          onToggleFavorite={onToggleFavorite}
          onToggleVisited={onToggleVisited}
          wantLabel={t.wantToGo}
          visitedLabel={t.visited}
        />
      </div>

      <div className="mt-4 border-t border-[#d8e7cb] pt-4">
        <p className="text-[11px] uppercase tracking-[0.16em] text-[#667f60]">
          {t.fanCheckins} · {checkIns.length}
        </p>
        <div className="mt-3 space-y-3">
          {checkIns.map((item) => (
            <div key={item.id} className="rounded-2xl border border-[#d8e8cb] bg-[#f8fcf2] p-3">
              {item.note ? <p className="text-sm text-[#2e3d2c]">{item.note}</p> : null}
              <p className="mt-1 text-[11px] text-[#6f8769]">{new Date(item.createdAt).toLocaleString()}</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {item.imageUrls.map((url) => (
                  <img key={url} src={url} alt="check-in" className="h-20 w-full rounded-lg object-cover" />
                ))}
              </div>
            </div>
          ))}
          {!checkIns.length ? (
            <div className="rounded-2xl border border-dashed border-[#d2e4c3] bg-[#f7fbf1] p-3 text-xs text-[#667f60]">
              {t.emptyCheckin}
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-4 border-t border-[#d8e7cb] pt-4">
        <CheckInForm
          onSubmit={onSubmitCheckIn}
          title={t.addCheckin}
          hint={t.addCheckinHint}
          needImageText={t.addCheckinNeedImage}
          submitErrorText={t.addCheckinError}
          duplicateWarnText={t.duplicateWarn}
          submittingText={t.submitting}
          submitText={t.uploadAction}
        />
      </div>
    </div>
  );
}

