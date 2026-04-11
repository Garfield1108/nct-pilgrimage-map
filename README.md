# Jungwoo Sugar Rush Spots

A Next.js + Leaflet pilgrimage map for Jungwoo spots in Seoul.

## Runtime behavior
- Public place data comes from Google Sheets at runtime through `/api/places`.
- Personal state stays local-only in the browser:
  - favorites: `jw-favorites`
  - visited: `jw-visited`
- Place images are served from `public/jw-images`.
- A build-time script generates `data/jw-image-manifest.json` so Cloudflare Workers can resolve local images without relying on runtime filesystem scans.

## Stack
- Next.js App Router
- TypeScript
- Tailwind CSS
- Leaflet + OpenStreetMap
- localStorage for favorites / visited
- Google Sheets published CSV for live place data
- Cloudflare Workers via OpenNext (`@cloudflare/next-on-pages`)

## Required environment variables
Use these in local `.env.local` and in Cloudflare Pages -> Settings -> Environment Variables:

```bash
NEXT_PUBLIC_DATA_PROVIDER=google-sheets
GOOGLE_SHEETS_ID=your_google_sheet_id
GOOGLE_SHEETS_GID=0
```

Optional only if you later switch to a Mapbox view:

```bash
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=
```

## Google Sheets format
Recommended sheet columns for the current runtime parser:

| column | required | notes |
|---|---|---|
| id | recommended | e.g. `JW001` |
| name | optional | fallback display name |
| category | yes | `cafe` / `restaurant` / `filming-spot` / `other` |
| area | optional | area label only |
| address_ko | recommended | Korean address |
| address_zh | optional | secondary address field |
| lat | yes | latitude |
| lng | yes | longitude |
| description | optional | displayed in notes section |
| images | optional | direct URLs or filenames separated by `|` |
| coord_method | optional | reference only |
| coord_confidence | optional | reference only |
| coord_source_url | optional | reference only |

Notes:
- `images` may be full URLs, `/jw-images/...` paths, or filenames like `JW004-1.jpg|JW004-2.jpg`.
- If `images` is empty, the app still works and shows a no-image placeholder.
- If local files exist in `public/jw-images`, the build step writes a manifest used by the API route.

## Local development
```bash
npm install
npm run dev
```

## Production build (Cloudflare)
```bash
npm run pages:build
```

## Cloudflare Pages deployment
- Framework Preset: `Next.js`
- Build Command: `npm run pages:build`
- Install Command: `npm install`
- Output Directory: leave empty
- Root Directory: leave empty (unless this is inside a larger monorepo, then set to `nct-pilgrimage-map`)

### Notes
- Google Sheet edits update the site without rebuild/redeploy because `/api/places` fetches the published CSV at runtime.
- Adding or changing files in `public/jw-images` requires a new deploy, because static assets are bundled at build time.
