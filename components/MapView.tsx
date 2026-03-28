'use client';

import 'mapbox-gl/dist/mapbox-gl.css';
import Map, { Marker, NavigationControl, Popup } from 'react-map-gl/mapbox';
import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM, MAP_STYLE } from '@/lib/config';
import { Place } from '@/lib/types';

type Props = {
  places: Place[];
  selectedPlaceId?: string;
  onSelectPlace: (placeId: string) => void;
};

export default function MapView({ places, selectedPlaceId, onSelectPlace }: Props) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  if (!token) {
    return (
      <div className="flex h-[360px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-4 text-center text-sm text-slate-500 lg:h-[520px]">
        未设置 Mapbox Token。当前已降级为列表可用模式，请在 `.env.local` 配置 `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`。
      </div>
    );
  }

  const selected = places.find((p) => p.id === selectedPlaceId);

  return (
    <div className="h-[360px] overflow-hidden rounded-xl border border-slate-200 lg:h-[520px]">
      <Map
        mapboxAccessToken={token}
        initialViewState={{
          latitude: MAP_DEFAULT_CENTER.lat,
          longitude: MAP_DEFAULT_CENTER.lng,
          zoom: MAP_DEFAULT_ZOOM
        }}
        mapStyle={MAP_STYLE}
      >
        <NavigationControl position="top-right" />

        {places.map((place) => {
          const isActive = place.id === selectedPlaceId;
          return (
            <Marker key={place.id} latitude={place.latitude} longitude={place.longitude} anchor="bottom">
              <button
                type="button"
                onClick={() => onSelectPlace(place.id)}
                className={`rounded-full border-2 px-2 py-1 text-[11px] font-semibold ${
                  isActive
                    ? 'border-coral bg-coral text-white'
                    : 'border-slate-900 bg-white text-slate-900 hover:bg-slate-100'
                }`}
              >
                {place.name}
              </button>
            </Marker>
          );
        })}

        {selected ? (
          <Popup
            longitude={selected.longitude}
            latitude={selected.latitude}
            anchor="top"
            closeButton={false}
            closeOnClick={false}
            offset={20}
          >
            <div className="max-w-[180px] text-xs">
              <p className="font-semibold">{selected.name}</p>
              <p className="text-slate-600">{selected.address}</p>
            </div>
          </Popup>
        ) : null}
      </Map>
    </div>
  );
}
