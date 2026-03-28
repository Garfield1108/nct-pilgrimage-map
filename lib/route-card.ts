import { Locale } from './i18n';
import { Place } from './types';

function toTitle(source: string): string {
  if (!source) return '';
  return source
    .split(/\s+/)
    .slice(0, 3)
    .join(' ')
    .trim();
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function drawMapPreview(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  places: Place[]
) {
  ctx.fillStyle = '#f6f9f0';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#d3e3c5';
  ctx.strokeRect(x, y, w, h);

  if (places.length < 1) return;

  const lats = places.map((p) => p.latitude);
  const lngs = places.map((p) => p.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const project = (p: Place) => {
    const px = x + ((p.longitude - minLng) / Math.max(maxLng - minLng, 0.0001)) * (w - 40) + 20;
    const py = y + ((maxLat - p.latitude) / Math.max(maxLat - minLat, 0.0001)) * (h - 40) + 20;
    return [px, py] as const;
  };

  const points = places.map(project);

  if (points.length > 1) {
    ctx.strokeStyle = '#7ca85b';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 7]);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    points.slice(1).forEach((p) => ctx.lineTo(p[0], p[1]));
    ctx.stroke();
    ctx.setLineDash([]);
  }

  points.forEach(([px, py], index) => {
    ctx.fillStyle = '#a8ff60';
    ctx.strokeStyle = '#2a3a24';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1f2a1f';
    ctx.font = '10px Inter, Arial';
    ctx.fillText(String(index + 1), px - 2.5, py + 3.3);
  });
}

export async function generatePilgrimageCardImage(options: {
  locale: Locale;
  title: string;
  spots: Place[];
}): Promise<string> {
  const { locale, title, spots } = options;
  const canvas = document.createElement('canvas');
  canvas.width = 1280;
  canvas.height = 720;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  ctx.fillStyle = '#f4f8ec';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#dff2ca';
  ctx.fillRect(0, 0, canvas.width, 145);

  ctx.fillStyle = '#2a3924';
  ctx.font = '600 24px Inter, Arial';
  ctx.fillText('NCT SEOUL PILGRIMAGE', 48, 52);

  ctx.font = '700 56px Georgia, Times New Roman, serif';
  ctx.fillText(toTitle(title || 'My Route'), 48, 112);

  ctx.font = '500 20px Inter, Arial';
  const sub = locale === 'zh' ? `共 ${spots.length} 个地点 · Your pilgrimage is taking shape.` : `${spots.length} spots · Your pilgrimage is taking shape.`;
  ctx.fillText(sub, 52, 166);

  drawMapPreview(ctx, 52, 200, 760, 440, spots);

  ctx.fillStyle = '#2f4129';
  ctx.font = '600 20px Inter, Arial';
  ctx.fillText(locale === 'zh' ? 'Saved Spots' : 'Saved Spots', 860, 230);

  const cards = spots.slice(0, 4);
  let y = 250;
  for (let i = 0; i < cards.length; i++) {
    const spot = cards[i];
    ctx.fillStyle = '#f9fdf3';
    ctx.strokeStyle = '#d5e5c7';
    ctx.lineWidth = 1;
    ctx.fillRect(860, y, 360, 100);
    ctx.strokeRect(860, y, 360, 100);

    const image = await loadImage(spot.images[0]);
    if (image) {
      ctx.drawImage(image, 874, y + 12, 78, 76);
    } else {
      ctx.fillStyle = '#e4f1d4';
      ctx.fillRect(874, y + 12, 78, 76);
      ctx.fillStyle = '#3b4d34';
      ctx.font = '600 16px Inter, Arial';
      ctx.fillText(String(i + 1), 906, y + 56);
    }

    ctx.fillStyle = '#253422';
    ctx.font = '600 20px Georgia, serif';
    ctx.fillText(toTitle(spot.englishName), 966, y + 40);
    ctx.font = '400 13px Inter, Arial';
    ctx.fillStyle = '#567052';
    ctx.fillText(spot.koreanName, 966, y + 62);
    y += 112;
  }

  return canvas.toDataURL('image/png');
}
