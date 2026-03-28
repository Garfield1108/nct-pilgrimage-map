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
  routePlaceIds: string[];
  showRouteLine: boolean;
};

function createMarkerIcon(
  active: boolean,
  activeMemberId: string | null,
  placeTypeId: string,
  favorited: boolean
){
  const iconStroke = active ? '#ffffff' : '#1f2a1f';
  const glyph = activeMemberId
    ? memberGlyphSvgString(activeMemberId, iconStroke)
    : placeTypeGlyphSvgString(normalizePlaceTypeId(placeTypeId), iconStroke);

  const badge = favorited ? '<span class="favorite-badge">★</span>' : '';

  return L.divIcon({
    className: '',
    html: `<div class="map-marker-shell ${active ? 'selected' : ''} ${favorited ? 'favorited' : ''}"><span class="map-marker-glyph">${glyph}</span>${badge}</div>`,
    iconSize: active ? [34, 34] : [30, 30],
    iconAnchor: active ? [17, 17] : [15, 15]
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
    ? memberGlyphSvgString(activeMemberId, '#354a30')
    : placeTypeGlyphSvgString(normalizePlaceTypeId(placeTypeId), '#354a30');
  return `<span class="popup-mini-glyph">${glyph}</span>`;
}

export default function LeafletMap({
  places,
  selectedPlaceId,
  onSelectPlace,
  activeMemberId,
  favoritePlaceIds,
  routePlaceIds,
  showRouteLine
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
      .map((p) => [p!.latitude, p!.longitude]) as [number, number][];
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
        opacity={0.84}
      />

      <MapFocusController selectedPlace={selectedPlace} />

      {routePolyline.length > 1 ? (
        <Polyline
          positions={routePolyline}
          pathOptions={{
            color: '#6c9f53',
            weight: 2,
            opacity: 0.65,
            dashArray: '5,7',
            lineCap: 'round',
            lineJoin: 'round'
          }}
          smoothFactor={1.8}
        />
      ) : null}

      {places.map((place) => {
        const active = place.id === selectedPlaceId;
        const favorited = favoritePlaceIds.includes(place.id);
        return (
          <Marker
            key={place.id}
            position={[place.latitude, place.longitude]}
            icon={createMarkerIcon(active, activeMemberId, place.placeTypeId, favorited)}
            eventHandlers={{
              click: () => onSelectPlace?.(place.id)
            }}
          >
            <Popup className="custom-popup hint-popup" autoPan>
              <div className="inline-flex items-center gap-1.5">
                <span
                  dangerouslySetInnerHTML={{
                    __html: miniGlyphHtml(activeMemberId, place.placeTypeId)
                  }}
                />
                <p className="popup-title">{place.englishName}</p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}





