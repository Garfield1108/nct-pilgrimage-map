import { PlaceType } from '@/lib/types';

type GlyphProps = {
  className?: string;
  strokeWidth?: number;
};

const memberPathMap: Record<string, string> = {
  // cat ears + head arc
  johnny: '<path d="M4 13c0-3 2.2-5 6-5s6 2 6 5"/><path d="M6.2 8 4.7 4.8 7.5 6"/><path d="M13.8 8l1.5-3.2L12.5 6"/>',
  // rose bud + stem + simple leaves
  taeyong: '<path d="M10 4.2c2.2 0 3.8 1.4 3.8 3.2S12.2 10.8 10 10.8 6.2 9.2 6.2 7.4 7.8 4.2 10 4.2Z"/><path d="M8.4 6.8c.4-.9 1.2-1.4 2.1-1.4 1.1 0 2 .8 2 1.9"/><path d="M10 10.8v5"/><path d="M10 13.2l-1.7 1.1"/><path d="M10 14.2l1.8 1.1"/>',
  // double cherries
  yuta: '<circle cx="7" cy="12.2" r="2.5"/><circle cx="13" cy="12.2" r="2.5"/><path d="M10 5.2c.8 2-1.2 3.6-3 4.4"/><path d="M10 5.2c-.8 2 1.2 3.6 3 4.4"/><path d="M10 5.2l2-1.4"/>',
  // rabbit ears
  doyoung: '<path d="M6.6 9V4.3c0-1.2.8-2.1 1.8-2.1s1.8.9 1.8 2.1V9"/><path d="M11.6 9V4.3c0-1.2.8-2.1 1.8-2.1s1.8.9 1.8 2.1V9"/><path d="M5 13.2c0-2.3 2.2-4.2 5-4.2s5 1.9 5 4.2"/>',
  // peach outline + split + leaf
  jaehyun: '<path d="M10 4.3c2.9 0 5.3 2.2 5.3 5 0 3-2.4 5.4-5.3 5.4S4.7 12.3 4.7 9.3c0-2.8 2.4-5 5.3-5Z"/><path d="M10 5.4c-1.1 1.2-1.1 2.8 0 4.4"/><path d="M9.8 4.3l1.6-1.2"/>',
  // puppy droopy ears
  jungwoo: '<path d="M5.8 7.2 3.9 5.6 4.4 9"/><path d="M14.2 7.2l1.9-1.6L15.6 9"/><path d="M4.8 12.8c0-2.6 2.2-4.6 5.2-4.6s5.2 2 5.2 4.6"/>',
  // tiger ears + forehead stripes
  mark: '<path d="M5 13c0-2.8 2.1-4.8 5-4.8s5 2 5 4.8"/><path d="M6.6 8 5.2 5.3 7.6 6.2"/><path d="M13.4 8l1.4-2.7-2.4.9"/><path d="M8.2 9.2l.6 1.1"/><path d="M10 8.8v1.4"/><path d="M11.8 9.2l-.6 1.1"/>',
  // bear round ears + round head
  haechan: '<circle cx="6.4" cy="6.2" r="1.7"/><circle cx="13.6" cy="6.2" r="1.7"/><path d="M4.6 12.8c0-2.7 2.3-4.7 5.4-4.7s5.4 2 5.4 4.7"/>',
  default: '<circle cx="10" cy="10" r="5"/><path d="M10 6v8"/><path d="M6 10h8"/>'
};

const placeTypePathMap: Record<string, string> = {
  cafe: '<path d="M4.2 8.4h9v4.8c0 1.7-1.4 3.1-3.1 3.1H7.3c-1.7 0-3.1-1.4-3.1-3.1V8.4Z"/><path d="M13.2 9.4h2.1a1.9 1.9 0 1 1 0 3.8h-2.1"/><path d="M7.4 4.5v2"/><path d="M10.4 4.5v2"/>',
  restaurant: '<path d="M6 4.3v11.8"/><path d="M4.2 4.3v4.8c0 1 .8 1.8 1.8 1.8s1.8-.8 1.8-1.8V4.3"/><path d="M13.1 4.3v11.8"/><path d="M15.7 4.3c0 2.8-1.3 4.7-2.6 4.7"/>',
  'filming-spot': '<rect x="4.1" y="7.2" width="11.8" height="8.6" rx="1.8"/><path d="M4.1 10.1h11.8"/><path d="M6.2 7.2 8 4.4"/><path d="M10 7.2l1.8-2.8"/><path d="M13.8 7.2l1.8-2.8"/>',
  other: '<path d="M10 3.7 11.9 7.9 16.5 8.2 13 11.1 14.2 15.7 10 13.2 5.8 15.7 7 11.1 3.5 8.2 8.1 7.9 10 3.7Z"/>'
};

function buildSvg(paths: string, className?: string, strokeWidth = 1.7) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className={className ?? 'h-4 w-4'}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      dangerouslySetInnerHTML={{ __html: paths }}
    />
  );
}

export function MemberGlyph({ memberId, className, strokeWidth }: GlyphProps & { memberId: string }) {
  return buildSvg(memberPathMap[memberId] ?? memberPathMap.default, className, strokeWidth);
}

export function PlaceTypeGlyph({ placeTypeId, className, strokeWidth }: GlyphProps & { placeTypeId: string }) {
  return buildSvg(placeTypePathMap[placeTypeId] ?? placeTypePathMap.other, className, strokeWidth);
}

export function memberGlyphSvgString(memberId: string, strokeColor: string): string {
  const paths = memberPathMap[memberId] ?? memberPathMap.default;
  return `<svg viewBox="0 0 20 20" fill="none" stroke="${strokeColor}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
}

export function placeTypeGlyphSvgString(placeTypeId: string, strokeColor: string): string {
  const normalized = normalizePlaceTypeId(placeTypeId);
  const paths = placeTypePathMap[normalized] ?? placeTypePathMap.other;
  return `<svg viewBox="0 0 20 20" fill="none" stroke="${strokeColor}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
}

export function normalizePlaceTypeId(placeTypeId: string): string {
  if (placeTypeId === 'shop') return 'other';
  return placeTypeId;
}

export function normalizePlaceTypes(types: PlaceType[]): PlaceType[] {
  return types
    .filter((t) => t.id !== 'shop')
    .map((t) => ({
      ...t,
      id: normalizePlaceTypeId(t.id)
    }));
}
