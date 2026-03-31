# NCT Pilgrimage Map (Focused MVP)

## Product Scope
This version keeps only core flows:
- Map (default)
- My Pilgrimage
- Want to go
- Visited / check-in
- Personal notes
- Optional personal photo upload

Removed from scope:
- User comments/community feed
- User place submission
- Any moderation/admin flow
- Archive page / Pilgrimage Card page

## Stack
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Leaflet + OpenStreetMap tiles
- Local session + IndexedDB (personal records)
- Google Sheets (places read-only source, optional)

## Runtime Data Source
`NEXT_PUBLIC_DATA_PROVIDER` supports:
- `mock` (default)
- `google-sheets`

When using `google-sheets`, places are fetched at runtime from `app/api/places`.
Sheet edits are reflected without rebuild/redeploy (runtime fetch, no-store cache).

## Required Google Sheet Columns
Use one row per place and keep this header row:

| column | required | notes |
|---|---|---|
| id | recommended | unique id, fallback auto-generated if empty |
| name | optional | fallback for englishName |
| englishName | yes | primary display name |
| koreanName | optional | secondary display name |
| address | optional | fallback for englishAddress |
| englishAddress | recommended | address line |
| koreanAddress | optional | Korean address |
| latitude | yes | decimal number |
| longitude | yes | decimal number |
| memberIds | yes | member ids separated by `|`, e.g. `taeyong|mark` |
| placeTypeId | yes | `cafe` / `restaurant` / `filming-spot` / `other` |
| description | recommended | EN description |
| descriptionZh | optional | ZH description |
| moodTags | optional | `hot|classic|hidden|photo-spot` |
| images | optional | image URLs separated by `|` |
| sourceNote | optional | source note |

## Google Sheets Setup
1. Create a sheet with the columns above in row 1.
2. Put place rows below.
3. Share settings: **Anyone with the link can view**.
4. In Google Sheets, publish or expose sheet for CSV access (public read endpoint).
5. Set env vars in `.env.local`:

```bash
NEXT_PUBLIC_DATA_PROVIDER=google-sheets
GOOGLE_SHEETS_ID=your_sheet_id
GOOGLE_SHEETS_GID=0
```

`GOOGLE_SHEETS_GID` is the tab id (default first tab = `0` for many sheets).

If sheet access fails, API falls back to local mock places.

## Local Run
1. Install deps:
   ```bash
   npm install
   ```
2. Copy env:
   ```bash
   cp .env.example .env.local
   ```
3. Run dev:
   ```bash
   npm run dev
   ```

## Notes
- Personal records (want-to-go, visited, notes, uploaded photos) are local per browser session/storage.
- No account system in this MVP.
