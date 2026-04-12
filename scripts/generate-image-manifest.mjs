import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const imagesDir = path.join(projectRoot, 'public', 'jw-images');
const thumbsDir = path.join(imagesDir, 'thumbs');
const outputDir = path.join(projectRoot, 'data');
const imageManifestFile = path.join(outputDir, 'jw-image-manifest.json');
const thumbManifestFile = path.join(outputDir, 'jw-image-thumb-manifest.json');
const imageFileRe = /\.(png|jpe?g|webp|avif)$/i;
const thumbSize = 640;

const imageManifest = {};
const thumbManifest = {};

function getManifestKey(fileName) {
  const match = fileName.toUpperCase().match(/^(JW\d{3})/);
  return match?.[1] ?? null;
}

async function ensureThumb(fileName) {
  const sourcePath = path.join(imagesDir, fileName);
  const targetPath = path.join(thumbsDir, fileName);

  if (existsSync(targetPath)) {
    const sourceStat = statSync(sourcePath);
    const targetStat = statSync(targetPath);
    if (targetStat.mtimeMs >= sourceStat.mtimeMs) {
      return true;
    }
  }

  try {
    let pipeline = sharp(sourcePath)
      .rotate()
      .resize({
        width: thumbSize,
        height: thumbSize,
        fit: 'inside',
        withoutEnlargement: true
      });

    const ext = path.extname(fileName).toLowerCase();
    if (ext === '.jpg' || ext === '.jpeg') {
      pipeline = pipeline.jpeg({ quality: 72, mozjpeg: true });
    } else if (ext === '.png') {
      pipeline = pipeline.png({ compressionLevel: 9, quality: 72 });
    } else if (ext === '.webp') {
      pipeline = pipeline.webp({ quality: 72 });
    } else if (ext === '.avif') {
      pipeline = pipeline.avif({ quality: 55 });
    }

    await pipeline.toFile(targetPath);
    return true;
  } catch {
    return false;
  }
}

mkdirSync(outputDir, { recursive: true });
mkdirSync(thumbsDir, { recursive: true });

try {
  const files = readdirSync(imagesDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && imageFileRe.test(entry.name))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

  for (const fileName of files) {
    const id = getManifestKey(fileName);
    if (!id) continue;

    imageManifest[id] ??= [];
    imageManifest[id].push(`/jw-images/${fileName}`);

    const thumbCreated = await ensureThumb(fileName);
    thumbManifest[id] ??= [];
    thumbManifest[id].push(thumbCreated ? `/jw-images/thumbs/${fileName}` : `/jw-images/${fileName}`);
  }
} catch {
  // Keep empty manifests if the image folder is missing.
}

writeFileSync(imageManifestFile, `${JSON.stringify(imageManifest, null, 2)}\n`, 'utf8');
writeFileSync(thumbManifestFile, `${JSON.stringify(thumbManifest, null, 2)}\n`, 'utf8');

console.log(`Wrote image manifest: ${imageManifestFile}`);
console.log(`Wrote thumbnail manifest: ${thumbManifestFile}`);
