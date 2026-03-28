export const APP_NAME = 'NCT Pilgrimage Map';

export const MAP_DEFAULT_CENTER = {
  lat: 37.5665,
  lng: 126.978
};

export const MAP_DEFAULT_ZOOM = 11;
export const MAP_STYLE = 'mapbox://styles/mapbox/streets-v12';

export const CHECKIN_DUPLICATE_MINUTES = 10;

export const DATA_PROVIDER =
  process.env.NEXT_PUBLIC_DATA_PROVIDER === 'supabase' ? 'supabase' : 'mock';
