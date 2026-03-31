# NCT Pilgrimage Map (Focused MVP)

## Product Scope
This version keeps only:
- Map (default)
- My Pilgrimage
- Want to go
- Visited

Removed:
- Comment / record layer in place detail
- Record form (note/photo upload)
- User place submission flow
- Moderation/admin flow
- Archive page / Pilgrimage Card page

## Stack
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Leaflet + OpenStreetMap
- localStorage (saved/visited state)
- Google Sheets runtime source (places, optional)

## Runtime Data Source
Set `NEXT_PUBLIC_DATA_PROVIDER`:
- `mock` (default)
- `google-sheets`

When `google-sheets` is enabled, places are fetched from `/api/places` at runtime.
Sheet edits do not require rebuild/redeploy.

## Google Sheet Columns
Header row:

| column | required | notes |
|---|---|---|
| id | recommended | unique id |
| name | optional | fallback for englishName |
| englishName | yes | primary name |
| koreanName | optional | secondary name |
| address | optional | fallback for englishAddress |
| englishAddress | recommended | address |
| koreanAddress | optional | Korean address |
| latitude | yes | decimal |
| longitude | yes | decimal |
| memberIds | yes | `|` separated ids, e.g. `taeyong|mark` |
| placeTypeId | yes | `cafe` / `restaurant` / `filming-spot` / `other` |
| description | recommended | EN description |
| descriptionZh | optional | ZH description |
| moodTags | optional | `hot|classic|hidden|photo-spot` |
| images | optional | image URLs separated by `|` |
| sourceNote | optional | source text |

## Google Sheets Setup
1. Create sheet with the columns above.
2. Add rows for places.
3. Share as public read (anyone with link can view).
4. Ensure CSV endpoint is accessible.
5. Configure `.env.local`:

```bash
NEXT_PUBLIC_DATA_PROVIDER=google-sheets
GOOGLE_SHEETS_ID=your_sheet_id
GOOGLE_SHEETS_GID=0
```

If sheet fetch fails, API falls back to local mock places.

## Local Run
```bash
npm install
npm run dev
```
