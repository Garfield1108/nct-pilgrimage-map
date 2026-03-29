'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState } from 'react';
import FilterPanel from '@/components/FilterPanel';
import PlaceDetailPanel from '@/components/PlaceDetailPanel';
import PlaceList from '@/components/PlaceList';
import { normalizePlaceTypes } from '@/components/IconSystem';
import { getDataAdapter } from '@/lib/adapters';
import { getStoredLocale, Locale, setStoredLocale, uiText } from '@/lib/i18n';
import { generatePilgrimageCardImage } from '@/lib/route-card';
import { getSessionId } from '@/lib/storage';
import { DisplayCheckIn, Member, Place, PlaceFilters, PlaceType } from '@/lib/types';

const LeafletMap = dynamic(() => import('@/components/LeafletMap'), {
  ssr: false
});

const adapter = getDataAdapter();

type ViewMode = 'all' | 'route';

const defaultFilters: PlaceFilters = {
  memberIds: [],
  placeTypeIds: [],
  keyword: ''
};

export default function HomePage() {
  const [locale, setLocale] = useState<Locale>('zh');
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [members, setMembers] = useState<Member[]>([]);
  const [placeTypes, setPlaceTypes] = useState<PlaceType[]>([]);
  const [filters, setFilters] = useState<PlaceFilters>(defaultFilters);
  const [allPlaces, setAllPlaces] = useState<Place[]>([]);
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>();
  const [sessionId, setSessionId] = useState<string>('');
  const [checkIns, setCheckIns] = useState<DisplayCheckIn[]>([]);
  const [favoritePlaceIds, setFavoritePlaceIds] = useState<string[]>([]);
  const [routeCardDataUrl, setRouteCardDataUrl] = useState<string>('');
  const [generatingCard, setGeneratingCard] = useState(false);
  const detailPanelRef = useRef<HTMLDivElement>(null);

  const t = uiText[locale];

  useEffect(() => {
    setLocale(getStoredLocale());
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      const [m, p, all, favorites] = await Promise.all([
        adapter.getMembers(),
        adapter.getPlaceTypes(),
        adapter.getPlaces(defaultFilters),
        adapter.getFavoritePlaceIds()
      ]);
      setMembers(m);
      setPlaceTypes(normalizePlaceTypes(p));
      setAllPlaces(all);
      setFavoritePlaceIds(favorites);

      setSessionId(getSessionId());
    };

    void bootstrap();
  }, []);

  useEffect(() => {
    const loadPlaces = async () => {
      const result = await adapter.getPlaces(filters);
      setFilteredPlaces(result);
    };

    void loadPlaces();
  }, [filters]);

  const routePlaces = useMemo(() => {
    const map = new Map(allPlaces.map((p) => [p.id, p]));
    return favoritePlaceIds.map((id) => map.get(id)).filter(Boolean) as Place[];
  }, [allPlaces, favoritePlaceIds]);

  const visiblePlaces = viewMode === 'route' ? routePlaces : filteredPlaces;

  useEffect(() => {
    if (!visiblePlaces.length) {
      setSelectedPlaceId(undefined);
      return;
    }

    if (!selectedPlaceId || !visiblePlaces.some((p) => p.id === selectedPlaceId)) {
      setSelectedPlaceId(visiblePlaces[0].id);
    }
  }, [visiblePlaces, selectedPlaceId]);

  useEffect(() => {
    if (selectedPlaceId) {
      detailPanelRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedPlaceId]);

  useEffect(() => {
    const loadCheckins = async () => {
      if (!selectedPlaceId) {
        setCheckIns([]);
        return;
      }
      setCheckIns(await adapter.getCheckIns(selectedPlaceId));
    };

    void loadCheckins();
  }, [selectedPlaceId]);

  const selectedPlace = useMemo(
    () => visiblePlaces.find((p) => p.id === selectedPlaceId),
    [visiblePlaces, selectedPlaceId]
  );

  const activeMemberForMap = viewMode === 'all' ? filters.memberIds[0] ?? null : null;

  const switchLocale = (next: Locale) => {
    setLocale(next);
    setStoredLocale(next);
  };

  const onToggleFavorite = async () => {
    if (!selectedPlaceId) return;
    const next = await adapter.toggleFavoritePlaceId(selectedPlaceId);
    setFavoritePlaceIds(next);
  };

  const onSubmitCheckIn = async (files: File[], note: string, force: boolean) => {
    if (!sessionId || !selectedPlaceId) {
      throw new Error('Please refresh the page and try again.');
    }

    if (!force) {
      const warned = await adapter.shouldWarnDuplicate(sessionId, selectedPlaceId);
      if (warned) return { warned: true };
    }

    const created = await adapter.createCheckIn({
      files,
      note,
      placeId: selectedPlaceId,
      sessionId
    });

    setCheckIns((prev) => [created, ...prev]);
    return { warned: false };
  };

  const onGenerateRouteCard = async () => {
    if (!routePlaces.length) return;
    setGeneratingCard(true);
    try {
      const title = selectedPlace?.englishName ? `${selectedPlace.englishName} Route` : t.routeMapTitle;
      const card = await generatePilgrimageCardImage({
        locale,
        title,
        spots: routePlaces
      });
      setRouteCardDataUrl(card);
    } finally {
      setGeneratingCard(false);
    }
  };

  return (
    <main className="archive-page mx-auto max-w-[1680px] px-4 pb-8 pt-5 md:px-8 md:pt-7">
      <section className="archive-header mb-4">
        <div className="archive-header-main">
          <div>
            <p className="editorial-tag mb-2 inline-flex">NCT FAN ARCHIVE</p>
            <h1 className="hero-serif archive-title">{t.headerTitle}</h1>
            <p className="archive-subtitle">{t.subtitle}</p>
            <p className="archive-note">{t.headerNote}</p>
          </div>

          <div className="archive-actions">
            <div className="language-switcher" role="group" aria-label={t.language}>
              <span className="language-label">{t.language}</span>
              <button
                type="button"
                onClick={() => switchLocale('zh')}
                className={`language-option ${locale === 'zh' ? 'active' : ''}`}
              >
                {t.localeZh}
              </button>
              <button
                type="button"
                onClick={() => switchLocale('en')}
                className={`language-option ${locale === 'en' ? 'active' : ''}`}
              >
                {t.localeEn}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'all' ? 'route' : 'all')}
              className="paper-button-secondary"
            >
              {viewMode === 'all' ? t.route : t.mapView}
            </button>
          </div>
        </div>

        <FilterPanel
          members={members}
          placeTypes={placeTypes}
          filters={filters}
          onFiltersChange={setFilters}
          searchPlaceholder={t.searchPlaceholder}
          membersLabel={t.members}
          placeTypeLabel={t.placeType}
          placeTypeTextMap={t.placeTypeLabels}
        />
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_430px]">
        <div className="space-y-4">
          <div className="paper-panel map-board p-3">
            <div className="mb-2 flex items-center justify-between px-1">
              <h3 className="hero-serif text-[28px] leading-none text-[#263223]">{t.mapBoardTitle}</h3>
              <span className="memo-badge">{t.mapBoardNote}</span>
            </div>

            <div className="h-[66vh] min-h-[500px] overflow-hidden rounded-[22px] border border-[#d2dfc6] bg-[#f8fbf4]">
              <LeafletMap
                places={visiblePlaces}
                selectedPlaceId={selectedPlaceId}
                onSelectPlace={setSelectedPlaceId}
                activeMemberId={activeMemberForMap}
                favoritePlaceIds={favoritePlaceIds}
                routePlaceIds={favoritePlaceIds}
                showRouteLine={viewMode === 'route'}
              />
            </div>
          </div>

          {viewMode === 'all' ? (
            <div className="paper-panel p-4">
              <div className="mb-3 flex items-end justify-between gap-2">
                <h3 className="hero-serif text-[28px] leading-none text-[#263223]">{t.collectionTitle}</h3>
                <span className="text-xs text-[#6b8064]">{visiblePlaces.length} spots</span>
              </div>
              <PlaceList
                places={visiblePlaces}
                members={members}
                placeTypes={placeTypes}
                selectedPlaceId={selectedPlaceId}
                onSelectPlace={setSelectedPlaceId}
                emptyText={t.collectionEmpty}
              />
            </div>
          ) : (
            <div className="paper-panel p-4">
              <p className="paper-kicker">{t.routeList}</p>
              <p className="mt-1 text-sm text-[#5f7559]">{t.routeHint}</p>

              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  disabled={!routePlaces.length || generatingCard}
                  onClick={() => void onGenerateRouteCard()}
                  className="paper-button-primary"
                >
                  {generatingCard ? t.submitting : t.generateCard}
                </button>
                {routeCardDataUrl ? (
                  <a href={routeCardDataUrl} download="nct-pilgrimage-card.png" className="paper-button-secondary">
                    {t.downloadCard}
                  </a>
                ) : null}
              </div>

              {routeCardDataUrl ? <p className="mt-2 text-xs text-[#5e7657]">{t.cardReady}</p> : null}

              <div className="mt-3 space-y-2">
                {routePlaces.map((place, idx) => (
                  <button
                    key={place.id}
                    onClick={() => setSelectedPlaceId(place.id)}
                    className={`route-note-card ${selectedPlaceId === place.id ? 'active' : ''}`}
                  >
                    <p className="text-xs text-[#6a8164]">#{idx + 1}</p>
                    <p className="hero-serif text-xl text-[#223021]">{place.englishName}</p>
                    <p className="text-xs text-[#5d7358]">{place.koreanName}</p>
                  </button>
                ))}
                {!routePlaces.length ? <p className="text-sm text-[#62775d]">{t.routeEmpty}</p> : null}
              </div>
            </div>
          )}
        </div>

        <aside ref={detailPanelRef} className="xl:sticky xl:top-4 xl:max-h-[88vh] xl:overflow-y-auto">
          <PlaceDetailPanel
            place={selectedPlace}
            members={members}
            placeTypes={placeTypes}
            checkIns={checkIns}
            isFavorite={!!selectedPlaceId && favoritePlaceIds.includes(selectedPlaceId)}
            locale={locale}
            onToggleFavorite={onToggleFavorite}
            onSubmitCheckIn={onSubmitCheckIn}
          />
        </aside>
      </section>
    </main>
  );
}
