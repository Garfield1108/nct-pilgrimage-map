// @ts-nocheck
"use client";

import { useEffect, useMemo } from 'react';
import { MapContainer, Marker, Popup, Polyline, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM } from '@/lib/config';
import { Place } from '@/lib/types';
import { memberGlyphSvgString, normalizePlaceTypeId, placeTypeGlyphSvgString } from './IconSystem';

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
};

function createMarkerIcon(
  active: boolean,
  activeMemberId: string | null,
  placeTypeId: string,
  favorited: boolean,
  visited: boolean
) {
  const iconStroke = active ? '#ffffff' : '#1f2a1f';
  const glyph = activeMemberId
    ? memberGlyphSvgString(activeMemberId, iconStroke)
    : placeTypeGlyphSvgString(normalizePlaceTypeId(placeTypeId), iconStroke);

  const favoriteBadge = favorited ? '<span class="favorite-badge" title="saved">★</span>' : '';
  const visitedBadge = visited ? '<span class="visited-badge" title="visited">✓</span>' : '';

  const classes = ['map-marker-shell'];
  if (active) classes.push('is-selected');
  if (favorited) classes.push('is-saved');
  if (visited) classes.push('is-visited');

  return L.divIcon({
    className: '',
    html: `<div class="${classes.join(' ')}"><span class="map-marker-glyph">${glyph}</span>${favoriteBadge}${visitedBadge}</div>`,
    iconSize: active ? [40, 40] : [34, 34],
    iconAnchor: active ? [20, 20] : [17, 17]
  });
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

function miniGlyphHtml(activeMemberId: string | null, placeTypeId: string): string {
  const glyph = activeMemberId
    ? memberGlyphSvgString(activeMemberId, '#385030')
    : placeTypeGlyphSvgString(normalizePlaceTypeId(placeTypeId), '#385030');
  return `<span class="popup-mini-glyph">${glyph}</span>`;
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
  memberNameMap,
  placeTypeTextMap,
  popupMembersLabel,
  popupTypeLabel
}: LeafletMapProps) {
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
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; CARTO'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        opacity={0.88}
      />

      <MapFocusController selectedPlace={selectedPlace} />

      {routePolyline.length > 1 ? (
        <Polyline
          positions={routePolyline}
          pathOptions={{
            color: '#557148',
            weight: 2.4,
            opacity: 0.78,
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
        const shortMembers = place.memberIds.slice(0, 2).map((id) => memberNameMap[id]).filter(Boolean);
        const placeTypeId = normalizePlaceTypeId(place.placeTypeId);

        return (
          <Marker
            key={place.id}
            position={[place.latitude, place.longitude]}
            icon={createMarkerIcon(active, activeMemberId, placeTypeId, favorited, visited)}
            eventHandlers={{ click: () => onSelectPlace?.(place.id) }}
          >
            <Popup className="custom-popup memo-popup" autoPan>
              <div className="memo-popup-card">
                <p className="popup-overline">NCT SPOT</p>
                <div className="memo-popup-title">
                  <span dangerouslySetInnerHTML={{ __html: miniGlyphHtml(activeMemberId, placeTypeId) }} />
                  <p>{place.englishName}</p>
                </div>

                <div className="memo-popup-tags">
                  <span className="memo-popup-tag">
                    {popupTypeLabel}: {placeTypeTextMap[placeTypeId] ?? placeTypeId}
                  </span>
                  {shortMembers.length ? (
                    <span className="memo-popup-tag">
                      {popupMembersLabel}: {shortMembers.join(', ')}
                    </span>
                  ) : null}
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
