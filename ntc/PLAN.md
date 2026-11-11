# Team NASA: plan
Team: Ani Pogula, Chuol Deng, Jabari Cooke, Lilia Sofia Mora Larraga

## Setup order
1. `npm install` then `npm run dev` (dev calls NASA directly, no key needed).
2. Supabase: create project, run `supabase/schema.sql`, enable Email auth, add redirect URLs, fill `.env`.
3. Vercel: import repo, add the two env vars, deploy. `api/nasa.js` caches NASA calls for an hour.
4. Add the live URL to Supabase Site URL / redirects.

## Workstreams (put a name next to each)
- Data + backend: ______ (Supabase, Vercel, capsule lock via Edge Function)
- 3D + motion: ______ (scene polish, mobile performance)
- Learning layer: ______ (more curated stories in `src/data/curated.js`, quiz questions, Then vs. Now topics)
- Personal layer + QA: ______ (share card, sound, accessibility, phone testing)

## Test checklist
July 20 + "Apollo" returns real images; birthday via My Cosmic Day; out-of-range year message; no-results message;
Wi-Fi off message; image morph + full image/video; save, seal, demo-open; sign-in sync on a second device;
share card with and without image; Then vs. Now (Earth, Mars, Moon); quiz star once per image; sound off by default;
phone + reduced motion; live site uses /api/nasa; Offline demo mode works with Wi-Fi off.

## Known gaps
Capsule unlock is checked in the browser only (use an Edge Function for a real lock). Stars are stored per device.
Demo mode shows generated illustrations, not NASA photos. NASA `date_created` is unreliable for some items.
