'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState } from 'react';
import FilterPanel from '@/components/FilterPanel';
import PlaceDetailPanel from '@/components/PlaceDetailPanel';
import { normalizePlaceTypes } from '@/components/IconSystem';
import { getDataAdapter } from '@/lib/adapters';
import { getStoredLocale, Locale, setStoredLocale, uiText } from '@/lib/i18n';
import { generatePilgrimageCardImage } from '@/lib/route-card';
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

      const sid = getSessionId();
      setSessionId(sid);
      setStates(await adapter.getUserPlaceStates(sid));
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

  const selectedPlace = useMemo(() => visiblePlaces.find((p) => p.id === selectedPlaceId), [visiblePlaces, selectedPlaceId]);

  const selectedState = useMemo(() => states.find((s) => s.placeId === selectedPlaceId), [states, selectedPlaceId]);

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
    const next = await adapter.toggleVisited(sessionId, selectedPlaceId);
    setStates(next);
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
    <main className="mx-auto max-w-[1600px] px-4 pb-8 pt-5 md:px-8 md:pt-7">
      <section className="mb-4 soft-card journal-card p-4 md:p-5">
        <div className="mb-2 flex items-start justify-between gap-3">
          <div>
            <p className="editorial-tag mb-2 inline-flex">NCT FAN GUIDE MAP</p>
            <h1 className="hero-serif text-2xl leading-[0.95] text-[#1e291f] md:text-4xl">NEO GREEN CITY NOTES</h1>
            <p className="mt-1 text-sm leading-6 text-[#536950]">{t.subtitle}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => switchLocale('en')}
              className={`rounded-full border px-3 py-1.5 text-xs ${locale === 'en' ? 'border-[#89bb63] bg-[#a8ff60] text-[#21301e]' : 'border-[#d8e7ca] bg-[#fbfef7] text-[#4f644a]'}`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => switchLocale('zh')}
              className={`rounded-full border px-3 py-1.5 text-xs ${locale === 'zh' ? 'border-[#89bb63] bg-[#a8ff60] text-[#21301e]' : 'border-[#d8e7ca] bg-[#fbfef7] text-[#4f644a]'}`}
            >
                  
            </button>
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'all' ? 'route' : 'all')}
              className="rounded-full border border-[#c4dcb0] bg-[#f7fcef] px-3 py-1.5 text-xs text-[#3f5438]"
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

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-4">
          <div className="soft-card journal-card h-[72vh] min-h-[560px] overflow-hidden p-3">
            <div className="h-full overflow-hidden rounded-[20px] border border-[#d7e6c8]">
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

          {viewMode === 'route' ? (
            <div className="soft-card journal-card p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-[#637a5f]">{t.routeList}</p>
              <p className="mt-1 text-sm text-[#5f7559]">{t.routeMapSubtitle}</p>

              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  disabled={!routePlaces.length || generatingCard}
                  onClick={() => void onGenerateRouteCard()}
                  className="rounded-full border border-[#91c16f] bg-[#a8ff60] px-4 py-2 text-xs font-semibold text-[#21301d] transition hover:bg-[#98f56b]"
                >
                  {generatingCard ? t.submitting : t.generateCard}
                </button>
                {routeCardDataUrl ? (
                  <a
                    href={routeCardDataUrl}
                    download="nct-pilgrimage-card.png"
                    className="rounded-full border border-[#c4dcb0] bg-[#f9fdf3] px-4 py-2 text-xs text-[#42583c]"
                  >
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
                    className={`w-full rounded-2xl border p-3 text-left transition ${selectedPlaceId === place.id ? 'border-[#8ec168] bg-[#f1f9e8]' : 'border-[#d9e8cb] bg-[#fbfef7] hover:-translate-y-[1px]'}`}
                  >
                    <p className="text-xs text-[#6a8164]">#{idx + 1}</p>
                    <p className="hero-serif text-xl text-[#223021]">{place.englishName}</p>
                    <p className="text-xs text-[#5d7358]">{place.koreanName}</p>
                  </button>
                ))}
                {!routePlaces.length ? <p className="text-sm text-[#62775d]">{t.routeEmpty}</p> : null}
              </div>
            </div>
          ) : null}
        </div>

        <aside ref={detailPanelRef} className="xl:sticky xl:top-4 xl:max-h-[85vh] xl:overflow-y-auto">
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


