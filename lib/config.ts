export const APP_NAME = 'NCT Pilgrimage Map';

export const MAP_DEFAULT_CENTER = {
  lat: 37.5665,
  lng: 126.978
};

export const MAP_DEFAULT_ZOOM = 11;
export const MAP_STYLE = 'mapbox://styles/mapbox/streets-v12';

const configuredProvider = process.env.NEXT_PUBLIC_DATA_PROVIDER;

export const DATA_PROVIDER =
  configuredProvider === 'google-sheets'
    ? 'google-sheets'
    : configuredProvider === 'supabase'
      ? 'supabase'
      : 'mock';
