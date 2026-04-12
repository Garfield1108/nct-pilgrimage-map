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
import { Member, Place, PlaceFilters, PlaceType, UserPlaceState } from '@/lib/types';

const LeafletMap = dynamic(() => import('@/components/LeafletMap'), {
  ssr: false
});

const adapter = getDataAdapter();
const SOLO_MEMBER_ID = 'jungwoo';

type ViewMode = 'all' | 'route';

const defaultFilters: PlaceFilters = {
  memberIds: [],
  placeTypeIds: [],
  keyword: ''
};

function toSoloPlaces(places: Place[]): Place[] {
  return places
    .filter((place) => place.memberIds.includes(SOLO_MEMBER_ID))
    .map((place) => ({
      ...place,
      memberIds: [SOLO_MEMBER_ID]
    }));
}

export default function HomePage() {
  const [locale, setLocale] = useState<Locale>('zh');
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [isMobileLayout, setIsMobileLayout] = useState(false);
  const [mobileMapDetailOpen, setMobileMapDetailOpen] = useState(false);
  const [expandedRoutePlaceId, setExpandedRoutePlaceId] = useState<string>();
  const [members, setMembers] = useState<Member[]>([]);
  const [placeTypes, setPlaceTypes] = useState<PlaceType[]>([]);
  const [filters, setFilters] = useState<PlaceFilters>(defaultFilters);
  const [allPlaces, setAllPlaces] = useState<Place[]>([]);
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>();
  const [sessionId, setSessionId] = useState<string>('');
  const [states, setStates] = useState<UserPlaceState[]>([]);
  const [favoritePlaceIds, setFavoritePlaceIds] = useState<string[]>([]);
  const detailPanelRef = useRef<HTMLDivElement>(null);

  const t = uiText[locale];

  useEffect(() => {
    setLocale(getStoredLocale());
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(max-width: 1023px)');
    const syncViewport = () => {
      setIsMobileLayout(mediaQuery.matches);
    };

    syncViewport();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', syncViewport);
      return () => mediaQuery.removeEventListener('change', syncViewport);
    }

    mediaQuery.addListener(syncViewport);
    return () => mediaQuery.removeListener(syncViewport);
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
      const soloPlaces = toSoloPlaces(all).filter((place) => Number.isFinite(place.latitude) && Number.isFinite(place.longitude));
      setMembers(m.filter((member) => member.id === SOLO_MEMBER_ID));
      setPlaceTypes(normalizePlaceTypes(p));
      setAllPlaces(soloPlaces);
      setFavoritePlaceIds(favorites);
      setStates(userStates);
    };

    void bootstrap();
  }, []);

  useEffect(() => {
    const loadPlaces = async () => {
      const result = await adapter.getPlaces(filters);
      setFilteredPlaces(toSoloPlaces(result).filter((place) => Number.isFinite(place.latitude) && Number.isFinite(place.longitude)));
    };

    void loadPlaces();
  }, [filters]);

  const visitedPlaceIds = useMemo(() => states.filter((s) => s.visited).map((s) => s.placeId), [states]);
  const stateByPlaceId = useMemo(() => new Map(states.map((state) => [state.placeId, state])), [states]);

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
    if (!isMobileLayout && selectedPlaceId) {
      detailPanelRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isMobileLayout, selectedPlaceId]);

  useEffect(() => {
    if (viewMode !== 'all') {
      setMobileMapDetailOpen(false);
    }
  }, [viewMode]);

  useEffect(() => {
    if (!isMobileLayout) {
      setMobileMapDetailOpen(false);
    }
  }, [isMobileLayout]);

  useEffect(() => {
    if (!visiblePlaces.length) {
      setExpandedRoutePlaceId(undefined);
      return;
    }

    if (expandedRoutePlaceId && !visiblePlaces.some((place) => place.id === expandedRoutePlaceId)) {
      setExpandedRoutePlaceId(undefined);
    }
  }, [expandedRoutePlaceId, visiblePlaces]);

  useEffect(() => {
    if (viewMode !== 'route' || !isMobileLayout || !expandedRoutePlaceId) return;

    const card = document.getElementById(`collection-card-${expandedRoutePlaceId}`);
    card?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [expandedRoutePlaceId, isMobileLayout, viewMode]);

  const selectedPlace = useMemo(() => visiblePlaces.find((p) => p.id === selectedPlaceId), [visiblePlaces, selectedPlaceId]);
  const selectedState = useMemo(() => states.find((s) => s.placeId === selectedPlaceId), [states, selectedPlaceId]);
  const memberNameMap = useMemo(() => Object.fromEntries(members.map((m) => [m.id, m.displayName])), [members]);

  const selectPlaceFromMap = (placeId: string) => {
    setSelectedPlaceId(placeId);

    if (isMobileLayout && viewMode === 'all') {
      setMobileMapDetailOpen(true);
      return;
    }

    if (isMobileLayout && viewMode === 'route') {
      setExpandedRoutePlaceId(placeId);
    }
  };

  const selectPlaceFromRouteList = (placeId: string) => {
    setSelectedPlaceId(placeId);

    if (isMobileLayout) {
      setExpandedRoutePlaceId((current) => (current === placeId ? undefined : placeId));
    }
  };

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

  const onToggleFavoriteById = async (placeId: string) => {
    const next = await adapter.toggleFavoritePlaceId(placeId);
    setFavoritePlaceIds(next);
  };

  const onToggleVisitedById = async (placeId: string) => {
    if (!sessionId) return;
    const nextStates = await adapter.toggleVisited(sessionId, placeId);
    setStates(nextStates);
  };

  return (
    <main className="archive-page sugar-archive-page collection-page mx-auto max-w-[1720px] px-4 pb-6 pt-3 md:px-8 md:pt-4">
      <section className="snoopy-hero mb-2 md:mb-3">
                <nav className="snoopy-nav" aria-label="hero nav">
          <button type="button" className={`snoopy-nav-tab ${locale === 'zh' ? 'active' : ''}`} onClick={() => switchLocale('zh')}>
            中文 CN
          </button>
          <button type="button" className={`snoopy-nav-tab ${locale === 'en' ? 'active' : ''}`} onClick={() => switchLocale('en')}>
            English EN
          </button>
          <button type="button" className={`snoopy-nav-tab ${viewMode === 'all' ? 'active' : ''}`} onClick={() => setViewMode('all')}>
            地图
          </button>
          <button type="button" className={`snoopy-nav-tab ${viewMode === 'route' ? 'active' : ''}`} onClick={() => setViewMode('route')}>
            {t.route}
          </button>
        </nav>

        <span className="snoopy-washi-tape" aria-hidden />

        <span className="snoopy-paw-deco paw-top-left" aria-hidden>
          <svg viewBox="0 0 24 24" className="h-full w-full" fill="currentColor">
            <circle cx="12" cy="14.3" r="4.8" />
            <circle cx="7" cy="8.6" r="2.6" />
            <circle cx="12" cy="5.9" r="2.7" />
            <circle cx="17" cy="8.6" r="2.6" />
          </svg>
        </span>

        <span className="snoopy-paw-deco paw-bottom-right" aria-hidden>
          <svg viewBox="0 0 24 24" className="h-full w-full" fill="currentColor">
            <circle cx="12" cy="14.3" r="4.8" />
            <circle cx="7" cy="8.6" r="2.6" />
            <circle cx="12" cy="5.9" r="2.7" />
            <circle cx="17" cy="8.6" r="2.6" />
          </svg>
        </span>

        <span className="snoopy-floating-candy" aria-hidden>
          <svg viewBox="0 0 60 40" className="h-full w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="15" y="10" width="30" height="20" rx="5" fill="#F7D6D0" stroke="#5C4B43" strokeWidth="1.5" />
            <path d="M5 10 L15 20 L5 30 Z" stroke="#5C4B43" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M55 10 L45 20 L55 30 Z" stroke="#5C4B43" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>

        <div className="snoopy-hero-content">
          <h1 className="snoopy-hero-title">Sugar Rush Spots</h1>
          <p className="snoopy-hero-sub">{t.subtitle}</p>
        </div>
      </section>

      <section className="filter-ribbon keepsake-filter-ribbon mb-2 p-2.5 md:mb-3 md:p-3.5">
        <FilterPanel
          placeTypes={placeTypes}
          filters={filters}
          onFiltersChange={setFilters}
          searchPlaceholder={t.searchPlaceholder}
          searchActionLabel={t.searchAction}
          placeTypeLabel={t.placeType}
          allPlaceTypesLabel={t.allPlaceTypes}
          placeTypeTextMap={t.placeTypeLabels}
        />
      </section>

      <section className="map-led-stage stage-shell sugar-stage collection-stage p-2 md:p-2.5">
        <div className="map-canvas-wrap collection-stage-wrap">
          <div className="map-stage-frame collection-map-stage h-[400px] min-h-0 overflow-hidden rounded-[24px] sm:h-[480px] lg:h-[74vh] lg:min-h-[600px]">
            <LeafletMap
              places={visiblePlaces}
              selectedPlaceId={selectedPlaceId}
              onSelectPlace={selectPlaceFromMap}
              activeMemberId={null}
              favoritePlaceIds={favoritePlaceIds}
              visitedPlaceIds={visitedPlaceIds}
              routePlaceIds={myPilgrimagePlaces.map((p) => p.id)}
              showRouteLine={viewMode === 'route'}
              memberNameMap={memberNameMap}
              placeTypeTextMap={t.placeTypeLabels}
              popupMembersLabel={t.popupMembersLabel}
              popupTypeLabel={t.popupTagType}
              popupOverline={t.popupOverline}
              popupNote={t.popupNote}
              popupNoImageText={t.noImageText}
            />

            {isMobileLayout && viewMode === 'all' && mobileMapDetailOpen && selectedPlace ? (
              <div className="mobile-map-detail-sheet">
                <div className="mobile-map-detail-sheet-inner">
                  <span className="mobile-detail-sheet-grab" aria-hidden />
                  <button
                    type="button"
                    className="mobile-detail-sheet-close"
                    onClick={() => setMobileMapDetailOpen(false)}
                    aria-label={t.closeDetail}
                  >
                    {t.closeDetail}
                  </button>
                  <PlaceDetailPanel
                    place={selectedPlace}
                    placeTypes={placeTypes}
                    userState={selectedState}
                    isFavorite={!!selectedPlaceId && favoritePlaceIds.includes(selectedPlaceId)}
                    locale={locale}
                    onToggleFavorite={onToggleFavorite}
                    onToggleVisited={onToggleVisited}
                  />
                </div>
              </div>
            ) : null}
          </div>

          {!isMobileLayout ? (
            <aside ref={detailPanelRef} className="detail-floating-card collection-detail-float">
              <PlaceDetailPanel
                place={selectedPlace}
                placeTypes={placeTypes}
                userState={selectedState}
                isFavorite={!!selectedPlaceId && favoritePlaceIds.includes(selectedPlaceId)}
                locale={locale}
                onToggleFavorite={onToggleFavorite}
                onToggleVisited={onToggleVisited}
              />
            </aside>
          ) : null}
        </div>
      </section>

      {viewMode === 'route' ? (
        <section className="route-surface sugar-route-surface collection-route-surface mt-2 p-3 md:mt-3 md:p-4">
          <div className="mb-3 collection-route-head">
            <h3 className="hero-serif text-[30px] leading-none text-[#7d6885]">{t.routeList}</h3>
            {t.routeHint ? <p className="mt-1 text-sm text-[#9a889f]">{t.routeHint}</p> : null}
          </div>

          <PlaceList
            places={myPilgrimagePlaces}
            placeTypes={placeTypes}
            selectedPlaceId={selectedPlaceId}
            expandedPlaceId={isMobileLayout ? expandedRoutePlaceId : undefined}
            activeBadgeText={t.viewingBadge}
            onSelectPlace={selectPlaceFromRouteList}
            emptyText={t.routeEmpty}
            favoritePlaceIds={favoritePlaceIds}
            visitedPlaceIds={visitedPlaceIds}
            savedBadgeText={t.savedBadge}
            visitedBadgeText={t.visitedBadge}
            descriptionFallback={t.descriptionFallback}
            noImageText={t.noImageText}
            wantLabel={t.wantToGo}
            visitedLabel={t.visited}
            onToggleFavorite={onToggleFavoriteById}
            onToggleVisited={onToggleVisitedById}
            renderExpandedContent={
              isMobileLayout
                ? (place) => (
                    <PlaceDetailPanel
                      place={place}
                      placeTypes={placeTypes}
                      userState={stateByPlaceId.get(place.id)}
                      isFavorite={favoritePlaceIds.includes(place.id)}
                      locale={locale}
                      onToggleFavorite={() => void onToggleFavoriteById(place.id)}
                      onToggleVisited={() => void onToggleVisitedById(place.id)}
                    />
                  )
                : undefined
            }
          />
        </section>
      ) : null}
    </main>
  );
}















