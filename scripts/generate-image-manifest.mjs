import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const imagesDir = path.join(projectRoot, 'public', 'jw-images');
const outputDir = path.join(projectRoot, 'data');
const outputFile = path.join(outputDir, 'jw-image-manifest.json');
const imageFileRe = /\.(png|jpe?g|webp|gif|avif)$/i;

const manifest = {};

try {
  const files = readdirSync(imagesDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && imageFileRe.test(entry.name))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

  for (const fileName of files) {
    const match = fileName.toUpperCase().match(/^(JW\d{3})/);
    if (!match) continue;
    const id = match[1];
    manifest[id] ??= [];
    manifest[id].push(`/jw-images/${fileName}`);
  }
} catch {
  // Keep empty manifest if image folder is missing.
}

mkdirSync(outputDir, { recursive: true });
writeFileSync(outputFile, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`Wrote image manifest: ${outputFile}`);
