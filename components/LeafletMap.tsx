// @ts-nocheck
"use client";

import { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Popup, Polyline, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM } from '@/lib/config';
import { Place } from '@/lib/types';
import { normalizePlaceTypeId, placeTypeGlyphSvgString } from './IconSystem';
import LocalPlaceImage from './LocalPlaceImage';

type LeafletMapProps = {
  places: Place[];
  selectedPlaceId?: string;
  onSelectPlace?: (placeId: string) => void;
  activeMemberId: string | null;
  favoritePlaceIds: string[];
  visitedPlaceIds: string[];
  routePlaceIds: string[];
  showRouteLine: boolean;
  memberNameMap: Record<string, string>;
  placeTypeTextMap: Record<string, string>;
  popupMembersLabel: string;
  popupTypeLabel: string;
  popupOverline: string;
  popupNote: string;
  popupNoImageText: string;
  layoutRefreshKey?: string;
};

function createMarkerIcon(active: boolean, placeTypeId: string, favorited: boolean, visited: boolean) {
  const iconStroke = active || visited ? '#fffdf8' : '#5c4b43';
  const glyph = placeTypeGlyphSvgString(normalizePlaceTypeId(placeTypeId), iconStroke);

  const classes = ['map-marker-shell', 'collection-marker', 'simple-type-marker'];
  if (active) classes.push('is-selected');
  if (favorited) classes.push('is-saved');
  if (visited) classes.push('is-visited');

  return L.divIcon({
    className: '',
    html: `<div class="${classes.join(' ')}"><span class="marker-core"><span class="map-marker-glyph">${glyph}</span></span></div>`,
    iconSize: active ? [39, 39] : [34, 34],
    iconAnchor: active ? [19.5, 19.5] : [17, 17]
  });
}

function MapResizer({ refreshKey }: { refreshKey: string }) {
  const map = useMap();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let frameId = 0;
    const timers: number[] = [];
    const container = map.getContainer();
    const observedTargets = Array.from(
      new Set(
        [
          container,
          container.parentElement,
          container.closest('.collection-map-stage'),
          container.closest('.map-stage-frame')
        ].filter(Boolean)
      )
    ) as Element[];

    const runInvalidate = () => {
      frameId = window.requestAnimationFrame(() => {
        map.invalidateSize({ animate: false });
      });
    };

    const scheduleInvalidate = (delays = [0, 150, 300, 520]) => {
      timers.push(
        ...delays.map((delay) =>
          window.setTimeout(() => {
            runInvalidate();
          }, delay)
        )
      );
    };

    const handleResize = () => scheduleInvalidate([120, 260, 420]);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        scheduleInvalidate([120, 260, 420]);
      }
    };
    const handlePageShow = () => scheduleInvalidate([120, 260, 420]);
    const handleWindowLoad = () => scheduleInvalidate([0, 180, 360]);

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            scheduleInvalidate([120, 260, 420]);
          })
        : null;

    observedTargets.forEach((target) => resizeObserver?.observe(target));
    map.whenReady(() => {
      scheduleInvalidate([0, 150, 300, 520]);
    });

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('load', handleWindowLoad);
    document.addEventListener('visibilitychange', handleVisibility);

    scheduleInvalidate([0, 150, 300, 520]);

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
      timers.forEach((timer) => window.clearTimeout(timer));
      resizeObserver?.disconnect();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('load', handleWindowLoad);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [map, refreshKey]);

  return null;
}

function MapFocusController({ selectedPlace }: { selectedPlace?: Place }) {
  const map = useMap();

  useEffect(() => {
    if (!selectedPlace) return;
    map.flyTo([selectedPlace.latitude, selectedPlace.longitude], 14, {
      animate: true,
      duration: 0.75
    });
  }, [map, selectedPlace]);

  return null;
}

function PlaceImagePopup({
  place,
  noImageText
}: {
  place: Place;
  noImageText: string;
}) {
  const [imageIndex, setImageIndex] = useState(0);
  const originalImages = place.images ?? [];
  const previewImages = place.thumbnailImages ?? [];
  const image = previewImages[imageIndex] ?? originalImages[imageIndex];
  const originalImage = originalImages[imageIndex];
  const hasMultipleImages = originalImages.length > 1;
  const emptyState = (
    <div className="popup-place-image popup-image-empty">
      <div className="popup-empty-card">
        <p className="popup-empty-note">{noImageText}</p>
      </div>
    </div>
  );

  const showPrevious = () => {
    setImageIndex((current) => (current - 1 + originalImages.length) % originalImages.length);
  };

  const showNext = () => {
    setImageIndex((current) => (current + 1) % originalImages.length);
  };

  return (
    <div className="memo-popup-card sugar-popup-card collection-popup-card image-popup-card polaroid-popup-card">
      <div className="popup-photo-card polaroid-popup-frame">
        {image ? (
          <LocalPlaceImage
            src={image}
            fallbackSrc={originalImage}
            alt={place.englishName}
            className="popup-place-image"
            wrapperClassName="popup-place-image-shell"
            loading="eager"
            fetchPriority="high"
            emptyFallback={emptyState}
          />
        ) : (
          emptyState
        )}
      </div>

      {hasMultipleImages ? (
        <div className="popup-image-controls polaroid-popup-controls" aria-label="image carousel controls">
          <button type="button" onClick={showPrevious} className="popup-image-btn" aria-label="Previous image">
            ‹
          </button>
          <span className="popup-image-count">{imageIndex + 1}/{originalImages.length}</span>
          <button type="button" onClick={showNext} className="popup-image-btn" aria-label="Next image">
            ›
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default function LeafletMap({
  places,
  selectedPlaceId,
  onSelectPlace,
  activeMemberId,
  favoritePlaceIds,
  visitedPlaceIds,
  routePlaceIds,
  showRouteLine,
  placeTypeTextMap,
  popupNoImageText,
  layoutRefreshKey = ''
}: LeafletMapProps) {
  const refreshKey = useMemo(
    () =>
      [places.map((place) => place.id).join('|'), selectedPlaceId ?? '', showRouteLine ? 'route' : 'all', layoutRefreshKey].join('::'),
    [places, selectedPlaceId, showRouteLine, layoutRefreshKey]
  );

  const selectedPlace = useMemo(
    () => places.find((place) => place.id === selectedPlaceId),
    [places, selectedPlaceId]
  );

  const routePolyline = useMemo(() => {
    if (!showRouteLine || routePlaceIds.length < 2) return [] as [number, number][];
    const placeMap = new Map(places.map((p) => [p.id, p]));
    return routePlaceIds
      .map((id) => placeMap.get(id))
      .filter(Boolean)
      .map((p) => [p.latitude, p.longitude]) as [number, number][];
  }, [places, routePlaceIds, showRouteLine]);

  const initialCenter: [number, number] = selectedPlace
    ? [selectedPlace.latitude, selectedPlace.longitude]
    : [MAP_DEFAULT_CENTER.lat, MAP_DEFAULT_CENTER.lng];

  return (
    <MapContainer
      center={initialCenter}
      zoom={MAP_DEFAULT_ZOOM}
      scrollWheelZoom
      style={{ height: '100%', width: '100%' }}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        opacity={0.96}
        updateWhenIdle
        keepBuffer={3}
        eventHandlers={{
          tileerror: (event) => {
            const tileEvent = event as unknown as { coords?: unknown; tile?: HTMLImageElement };
            console.warn('[Leaflet tileerror]', {
              coords: tileEvent.coords,
              src: tileEvent.tile?.src
            });
          }
        }}
      />

      <MapResizer refreshKey={refreshKey} />
      <MapFocusController selectedPlace={selectedPlace} />

      {routePolyline.length > 1 ? (
        <Polyline
          positions={routePolyline}
          pathOptions={{
            color: '#f0a6c8',
            weight: 2.5,
            opacity: 0.84,
            dashArray: '4,7',
            lineCap: 'round',
            lineJoin: 'round'
          }}
          smoothFactor={1.8}
        />
      ) : null}

      {places.map((place) => {
        const active = place.id === selectedPlaceId;
        const favorited = favoritePlaceIds.includes(place.id);
        const visited = visitedPlaceIds.includes(place.id);
        const placeTypeId = normalizePlaceTypeId(place.placeTypeId);

        return (
          <Marker
            key={place.id}
            position={[place.latitude, place.longitude]}
            icon={createMarkerIcon(active, placeTypeId, favorited, visited)}
            eventHandlers={{ click: () => onSelectPlace?.(place.id) }}
          >
            <Popup className="custom-popup memo-popup sugar-popup collection-popup image-popup" autoPan maxWidth={270} minWidth={210}>
              <PlaceImagePopup
                place={place}
                noImageText={popupNoImageText}
              />
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
