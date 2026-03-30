import { Locale } from './i18n';
import { Place } from './types';

function toTitle(source: string): string {
  if (!source) return '';
  return source
    .split(/\s+/)
    .slice(0, 4)
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

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawTape(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, rotate = 0) {
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(rotate);
  ctx.translate(-(x + w / 2), -(y + h / 2));
  roundedRect(ctx, x, y, w, h, 3);
  ctx.fillStyle = 'rgba(231, 220, 189, 0.78)';
  ctx.fill();
  ctx.restore();
}

function drawMapPreview(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  places: Place[]
) {
  roundedRect(ctx, x, y, w, h, 18);
  ctx.fillStyle = '#f6faee';
  ctx.fill();
  ctx.strokeStyle = '#d4e3c6';
  ctx.lineWidth = 1;
  ctx.stroke();

  if (places.length < 1) return;

  const lats = places.map((p) => p.latitude);
  const lngs = places.map((p) => p.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const project = (p: Place) => {
    const px = x + ((p.longitude - minLng) / Math.max(maxLng - minLng, 0.0001)) * (w - 50) + 25;
    const py = y + ((maxLat - p.latitude) / Math.max(maxLat - minLat, 0.0001)) * (h - 50) + 25;
    return [px, py] as const;
  };

  const points = places.map(project);

  if (points.length > 1) {
    ctx.strokeStyle = '#6d9e51';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 6]);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    points.slice(1).forEach((p) => ctx.lineTo(p[0], p[1]));
    ctx.stroke();
    ctx.setLineDash([]);
  }

  points.forEach(([px, py], index) => {
    ctx.fillStyle = '#a8ff60';
    ctx.strokeStyle = '#264020';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(px, py, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1f3120';
    ctx.font = '10px Inter, Arial';
    ctx.fillText(String(index + 1), px - 2.7, py + 3.2);
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
  canvas.height = 780;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  ctx.fillStyle = '#eef4e3';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  roundedRect(ctx, 40, 28, 1200, 724, 28);
  ctx.fillStyle = '#f9fcf4';
  ctx.fill();
  ctx.strokeStyle = '#d2e2c4';
  ctx.stroke();

  drawTape(ctx, 140, 38, 72, 16, -0.08);
  drawTape(ctx, 1040, 44, 62, 14, 0.11);

  ctx.fillStyle = '#2f4928';
  ctx.font = '700 24px Inter, Arial';
  ctx.fillText('NCT PILGRIMAGE ARCHIVE', 94, 100);

  ctx.font = '700 56px Georgia, serif';
  ctx.fillText(toTitle(title || 'My Route'), 92, 166);

  ctx.font = '500 20px Inter, Arial';
  const sub = locale === 'zh' ? `共 ${spots.length} 个地点 · scrapbook route entry` : `${spots.length} spots · scrapbook route entry`;
  ctx.fillStyle = '#53704d';
  ctx.fillText(sub, 94, 203);

  drawMapPreview(ctx, 88, 236, 760, 438, spots);

  ctx.fillStyle = '#304729';
  ctx.font = '600 16px Inter, Arial';
  ctx.fillText('TICKET LOG', 890, 258);

  const cards = spots.slice(0, 4);
  let y = 282;
  for (let i = 0; i < cards.length; i++) {
    const spot = cards[i];
    const tilt = i % 2 === 0 ? -0.03 : 0.03;

    ctx.save();
    ctx.translate(1038, y + 48);
    ctx.rotate(tilt);
    ctx.translate(-1038, -(y + 48));

    roundedRect(ctx, 884, y, 300, 96, 14);
    ctx.fillStyle = '#f6fbee';
    ctx.fill();
    ctx.strokeStyle = '#d4e3c6';
    ctx.stroke();

    const image = await loadImage(spot.images[0]);
    if (image) {
      roundedRect(ctx, 896, y + 10, 74, 74, 10);
      ctx.save();
      ctx.clip();
      ctx.drawImage(image, 896, y + 10, 74, 74);
      ctx.restore();
    }

    ctx.fillStyle = '#2a3f25';
    ctx.font = '600 18px Georgia, serif';
    ctx.fillText(toTitle(spot.englishName), 982, y + 38);
    ctx.font = '400 12px Inter, Arial';
    ctx.fillStyle = '#5d7758';
    ctx.fillText(spot.koreanName, 982, y + 58);

    ctx.restore();
    y += 108;
  }

  ctx.beginPath();
  ctx.arc(1160, 700, 40, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(61,84,54,0.35)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#5e7957';
  ctx.font = '600 12px Inter, Arial';
  ctx.fillText('SEOUL', 1142, 704);

  return canvas.toDataURL('image/png');
}

export async function generateVisitCardImage(options: {
  locale: Locale;
  place: Place;
  memberNames: string[];
  placeTypeLabel: string;
  note?: string;
  imageUrl?: string;
  visitedAt?: string;
}): Promise<string> {
  const { locale, place, memberNames, placeTypeLabel, note, imageUrl, visitedAt } = options;

  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  ctx.fillStyle = '#eef4e3';
  ctx.fillRect(0, 0, 1080, 1350);

  roundedRect(ctx, 58, 52, 964, 1240, 28);
  ctx.fillStyle = '#f9fdf4';
  ctx.fill();
  ctx.strokeStyle = '#d1e0c4';
  ctx.lineWidth = 1;
  ctx.stroke();

  drawTape(ctx, 148, 70, 72, 15, -0.11);
  drawTape(ctx, 870, 74, 68, 14, 0.12);

  ctx.fillStyle = '#2a4323';
  ctx.font = '700 20px Inter, Arial';
  ctx.fillText('NCT PILGRIMAGE VISIT CARD', 118, 142);

  const dateText = visitedAt ? new Date(visitedAt).toLocaleString() : new Date().toLocaleDateString();
  ctx.font = '500 13px Inter, Arial';
  ctx.fillStyle = '#5d7856';
  ctx.fillText(dateText, 118, 170);

  ctx.save();
  ctx.translate(540, 440);
  ctx.rotate(-0.024);
  ctx.translate(-540, -440);
  roundedRect(ctx, 112, 230, 856, 430, 16);
  ctx.fillStyle = '#f4faea';
  ctx.fill();
  ctx.strokeStyle = '#d2e2c6';
  ctx.stroke();

  const image = imageUrl ? await loadImage(imageUrl) : await loadImage(place.images[0]);
  if (image) {
    roundedRect(ctx, 130, 248, 820, 320, 14);
    ctx.save();
    ctx.clip();
    ctx.drawImage(image, 130, 248, 820, 320);
    ctx.restore();
  }
  ctx.restore();

  roundedRect(ctx, 134, 584, 230, 50, 12);
  ctx.fillStyle = '#b6f884';
  ctx.fill();
  ctx.fillStyle = '#20331d';
  ctx.font = '700 17px Inter, Arial';
  ctx.fillText(locale === 'zh' ? '已打卡 VISITED' : 'VISITED', 154, 616);

  ctx.fillStyle = '#263d22';
  ctx.font = '700 54px Georgia, serif';
  ctx.fillText(toTitle(place.englishName), 114, 740);

  ctx.font = '400 24px Inter, Arial';
  ctx.fillStyle = '#5b7554';
  ctx.fillText(place.koreanName, 114, 776);

  const tags = [placeTypeLabel, ...memberNames.slice(0, 3)];
  let x = 114;
  let y = 810;
  tags.forEach((tag, idx) => {
    const width = ctx.measureText(tag).width + 26;
    ctx.save();
    ctx.translate(x + width / 2, y + 17);
    ctx.rotate(idx % 2 ? -0.04 : 0.03);
    ctx.translate(-(x + width / 2), -(y + 17));

    roundedRect(ctx, x, y, width, 34, 17);
    ctx.fillStyle = '#edf8df';
    ctx.fill();
    ctx.strokeStyle = '#c9dbba';
    ctx.stroke();
    ctx.fillStyle = '#355230';
    ctx.font = '500 14px Inter, Arial';
    ctx.fillText(tag, x + 13, y + 22);
    ctx.restore();

    x += width + 8;
  });

  roundedRect(ctx, 112, 866, 856, 162, 16);
  ctx.fillStyle = '#f6fbef';
  ctx.fill();
  ctx.strokeStyle = '#d3e2c6';
  ctx.stroke();

  ctx.fillStyle = '#6a8262';
  ctx.font = '600 14px Inter, Arial';
  ctx.fillText(locale === 'zh' ? 'MEMO NOTE' : 'MEMO NOTE', 134, 895);

  ctx.fillStyle = '#304429';
  ctx.font = '400 22px Georgia, serif';
  const memo = note?.trim() || (locale === 'zh' ? '今天把这站正式贴进了我的首尔巡礼手账。' : 'This spot is now pinned in my Seoul pilgrimage scrapbook.');
  const words = memo.split(' ');
  let line = '';
  let yy = 934;
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > 808) {
      ctx.fillText(line, 134, yy);
      yy += 34;
      line = w;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, 134, yy);

  ctx.beginPath();
  ctx.arc(912, 1230, 48, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(61,84,54,0.34)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#6a8462';
  ctx.font = '600 13px Inter, Arial';
  ctx.fillText('FAN STAMP', 880, 1234);

  return canvas.toDataURL('image/png');
}
