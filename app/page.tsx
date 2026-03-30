'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState } from 'react';
import FilterPanel from '@/components/FilterPanel';
import PlaceDetailPanel from '@/components/PlaceDetailPanel';
import PlaceList from '@/components/PlaceList';
import { normalizePlaceTypes } from '@/components/IconSystem';
import { getDataAdapter } from '@/lib/adapters';
import { getStoredLocale, Locale, setStoredLocale, uiText } from '@/lib/i18n';
import { getSessionId } from '@/lib/storage';
import { DisplayCheckIn, Member, Place, PlaceFilters, PlaceType, UserPlaceState } from '@/lib/types';

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
  const [states, setStates] = useState<UserPlaceState[]>([]);
  const [favoritePlaceIds, setFavoritePlaceIds] = useState<string[]>([]);
  const detailPanelRef = useRef<HTMLDivElement>(null);

  const t = uiText[locale];

  useEffect(() => {
    setLocale(getStoredLocale());
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      const sid = getSessionId();
      setSessionId(sid);

      const [m, p, all, favorites, userStates] = await Promise.all([
        adapter.getMembers(),
        adapter.getPlaceTypes(),
        adapter.getPlaces(defaultFilters),
        adapter.getFavoritePlaceIds(),
        adapter.getUserPlaceStates(sid)
      ]);
      setMembers(m);
      setPlaceTypes(normalizePlaceTypes(p));
      setAllPlaces(all);
      setFavoritePlaceIds(favorites);
      setStates(userStates);
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

  const visitedPlaceIds = useMemo(() => states.filter((s) => s.visited).map((s) => s.placeId), [states]);

  const myPilgrimagePlaces = useMemo(() => {
    const ids = Array.from(new Set([...favoritePlaceIds, ...visitedPlaceIds]));
    const map = new Map(allPlaces.map((p) => [p.id, p]));
    return ids.map((id) => map.get(id)).filter(Boolean) as Place[];
  }, [allPlaces, favoritePlaceIds, visitedPlaceIds]);

  const visiblePlaces = viewMode === 'route' ? myPilgrimagePlaces : filteredPlaces;

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

  const selectedPlace = useMemo(() => visiblePlaces.find((p) => p.id === selectedPlaceId), [visiblePlaces, selectedPlaceId]);

  const selectedState = useMemo(() => states.find((s) => s.placeId === selectedPlaceId), [states, selectedPlaceId]);

  const memberNameMap = useMemo(() => Object.fromEntries(members.map((m) => [m.id, m.displayName])), [members]);

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

  const onToggleVisited = async () => {
    if (!sessionId || !selectedPlaceId) return;
    const nextStates = await adapter.toggleVisited(sessionId, selectedPlaceId);
    setStates(nextStates);
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

    const current = states.find((s) => s.placeId === selectedPlaceId);
    if (!current?.visited) {
      const nextStates = await adapter.toggleVisited(sessionId, selectedPlaceId);
      setStates(nextStates);
    }

    return { warned: false };
  };

  return (
    <main className="archive-page mx-auto max-w-[1680px] px-4 pb-8 pt-5 md:px-8 md:pt-7">
      <section className="archive-header collage-header mb-4">
        <div className="archive-header-main">
          <div>
            <p className="editorial-tag mb-2 inline-flex">NCT FAN MAP</p>
            <h1 className="hero-serif archive-title">{t.headerTitle}</h1>
            <p className="archive-subtitle">{t.subtitle}</p>
            <p className="archive-note">{t.headerNote}</p>
          </div>

          <div className="archive-actions">
            <div className="language-switcher-wrap">
              <p className="language-top-label">{t.language}</p>
              <div className="language-switcher" role="group" aria-label={t.language}>
                <button type="button" onClick={() => switchLocale('zh')} className={`language-option ${locale === 'zh' ? 'active' : ''}`}>
                  {t.localeZh}
                </button>
                <button type="button" onClick={() => switchLocale('en')} className={`language-option ${locale === 'en' ? 'active' : ''}`}>
                  {t.localeEn}
                </button>
              </div>
            </div>

            <button type="button" onClick={() => setViewMode(viewMode === 'all' ? 'route' : 'all')} className="paper-button-secondary">
              {viewMode === 'all' ? t.route : t.mapView}
            </button>
          </div>
        </div>
      </section>

      <section className="paper-panel mb-4 p-4">
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
          <div className="paper-panel map-board lifted-layer p-3">
            <div className="mb-2 flex items-center justify-between px-1">
              <h3 className="hero-serif text-[28px] leading-none text-[#263223]">{viewMode === 'all' ? t.mapBoardTitle : t.myPilgrimageTitle}</h3>
              <span className="memo-badge">{viewMode === 'all' ? t.mapBoardNote : t.myPilgrimageNote}</span>
            </div>

            <div className="h-[66vh] min-h-[500px] overflow-hidden rounded-[22px] border border-[#d2dfc6] bg-[#f8fbf4]">
              <LeafletMap
                places={visiblePlaces}
                selectedPlaceId={selectedPlaceId}
                onSelectPlace={setSelectedPlaceId}
                activeMemberId={activeMemberForMap}
                favoritePlaceIds={favoritePlaceIds}
                visitedPlaceIds={visitedPlaceIds}
                routePlaceIds={myPilgrimagePlaces.map((p) => p.id)}
                showRouteLine={viewMode === 'route'}
                memberNameMap={memberNameMap}
                placeTypeTextMap={t.placeTypeLabels}
                popupMembersLabel={t.popupTagMembers}
                popupTypeLabel={t.popupTagType}
                viewSpotLabel={t.viewSpot}
              />
            </div>
          </div>

          {viewMode === 'route' ? (
            <div className="paper-panel scrapbook-layer p-4">
              <div className="mb-3">
                <h3 className="hero-serif text-[28px] leading-none text-[#263223]">{t.routeList}</h3>
                <p className="mt-1 text-sm text-[#5f7559]">{t.routeHint}</p>
              </div>

              <PlaceList
                places={myPilgrimagePlaces}
                members={members}
                placeTypes={placeTypes}
                selectedPlaceId={selectedPlaceId}
                onSelectPlace={setSelectedPlaceId}
                emptyText={t.routeEmpty}
                favoritePlaceIds={favoritePlaceIds}
                visitedPlaceIds={visitedPlaceIds}
                savedBadgeText={t.savedBadge}
                visitedBadgeText={t.visitedBadge}
              />
            </div>
          ) : null}
        </div>

        <aside ref={detailPanelRef} className="xl:sticky xl:top-4 xl:max-h-[88vh] xl:overflow-y-auto">
          <PlaceDetailPanel
            place={selectedPlace}
            members={members}
            placeTypes={placeTypes}
            checkIns={checkIns}
            userState={selectedState}
            isFavorite={!!selectedPlaceId && favoritePlaceIds.includes(selectedPlaceId)}
            locale={locale}
            onToggleFavorite={onToggleFavorite}
            onToggleVisited={onToggleVisited}
            onSubmitCheckIn={onSubmitCheckIn}
          />
        </aside>
      </section>
    </main>
  );
}
