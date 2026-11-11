# NASA Time Capsule (React + Framer Motion + React Three Fiber)

## Run locally
    npm install
    npm run dev          # calls NASA's API directly in dev

## Turn on accounts + cross-device capsules (Supabase)
1. Create a free project at supabase.com.
2. SQL Editor: run `supabase/schema.sql` (creates the `capsules` table with row-level security).
3. Authentication > Providers: enable Email (magic link). Add your site URL under URL Configuration.
4. Copy `.env.example` to `.env` and paste your project URL and anon key.
Without keys the app still works; capsules just stay on one device.

## Deploy + cache NASA calls (Vercel)
Push to GitHub, import in Vercel, add the two env vars. `api/nasa.js` becomes a serverless proxy that
whitelists NASA paths and caches responses (memory + CDN, 1 hour), so repeat searches don't count toward
NASA's 1,000 requests/hour limit.

Note: the unlock date is enforced in the browser. For a stricter lock, move the check into a Supabase
Edge Function that withholds items until the date.

## Features
Journey (warp + odometer), bento results, morphing story panel, capsule (local or Supabase-synced), curated stories
(`src/data/curated.js`), "Did you know?" quiz with stars, Then vs. Now slider, shareable Cosmic Day card, sound
(muted by default), Offline demo mode (checkbox on the landing page; no network calls), lazy-loaded 3D with a safe fallback.

## Testing controls
Add `?demo` to the URL to show the Offline demo checkbox and the capsule's "Demo: open it now" button. Run `npm test` for quiz and ranking tests.
Result pages have shareable links (the date is kept in the URL hash), and the browser Back button returns to the start.
