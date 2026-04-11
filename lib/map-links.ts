import { Place } from './types';

function encode(value: string): string {
  return encodeURIComponent(value.trim());
}

export function buildGoogleMapsDirectionsUrl(place: Place): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encode(`${place.latitude},${place.longitude}`)}&travelmode=walking`;
}

export function buildAppleMapsDirectionsUrl(place: Place): string {
  const destination = `${place.latitude},${place.longitude}`;
  const query = place.englishName || place.name;
  return `https://maps.apple.com/?daddr=${encode(destination)}&dirflg=w&q=${encode(query)}`;
}
