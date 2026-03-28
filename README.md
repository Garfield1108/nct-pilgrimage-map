# NCT Pilgrimage Map Web App (MVP)

A lightweight MVP for validating:
- whether users browse places on a map,
- whether member-based filters are useful,
- whether users are willing to upload check-ins.

## Stack
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Mapbox (`react-map-gl`)
- Local mock data + IndexedDB persistence (MVP)

## MVP Features
- Map home with place markers
- Filter by members (multi-select)
- Filter by place types (multi-select)
- Keyword search
- Place detail panel
- Want to go / Visited toggles
- Check-in upload
  - at least 1 image required
  - optional short note
  - soft duplicate warning for same session + place within a short interval

## Project Structure
- `app/` routes and page entry
- `components/` UI components
- `lib/types.ts` domain types
- `lib/mock-data.ts` mock members/place types/places
- `lib/storage.ts` local session + IndexedDB persistence
- `lib/filters.ts` filtering logic
- `lib/config.ts` configurable constants (including map default center)
- `lib/adapters/` data adapter (mock now, supabase-ready TODO)

## Local Run
1. Install Node.js 20+.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy env:
   ```bash
   cp .env.example .env.local
   ```
4. Optional: set `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` in `.env.local`.
   - If missing, the app falls back to list-first mode.
5. Run dev server:
   ```bash
   npm run dev
   ```

## Data Notes
- Mock data includes:
  - 5 place types
  - 8 members
  - 12 places
- Check-ins and uploaded image blobs are persisted in IndexedDB.
- Session identity is stored in localStorage.

## Supabase Migration Plan (TODO)
- Keep UI unchanged, replace adapter implementation:
  - `getMembers/getPlaceTypes/getPlaces/getPlaceById`
  - `getCheckIns/createCheckIn`
  - `getUserPlaceStates/toggleWantToGo/toggleVisited`
- Replace image storage path:
  - from local IndexedDB blobs
  - to Supabase Storage public URLs
- Add `supabaseAdapter` in `lib/adapters/` and switch via `NEXT_PUBLIC_DATA_PROVIDER=supabase`.

## Non-goals in MVP
- Full auth/login
- Comment system
- Admin review dashboard
- Social feed
- Notification system
- Multi-language UI
- Complex moderation workflow
