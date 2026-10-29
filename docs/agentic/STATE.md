# Mini Kargo — Project State Snapshot

**Date**: 2026-10-29  
**Branch**: `feat/mini-kargo`  
**Latest Git Commit**: `20cf36c`  
**Current Milestone**: Güneş Mahallesi "Tarihi Taş Mektep & Mahalle Okulu" (Execution Run 26)  
**Victory Audit Status**: `VICTORY CONFIRMED`

## Verification Summary
- **Unit & Integration Tests**: 76 test files, 837 passed, 0 failed (2.06s execution)
- **TypeScript Typecheck**: 0 errors (`tsc --noEmit`)
- **Vite Production Build**: Successful (`dist/` generated in 163ms)
- **Playwright Browser Smoke**: PASS across Desktop (1280x800), Mobile Portrait (390x844), Mobile Landscape (844x390) with 0 console errors.
- **Persistence Compatibility**: Verified backwards compatibility for `localStorage` key `mini-kargo:v1`.
- **Visual QA Capture**: Verified `artifacts/gunes-tarihi-tas-mektep.png` with live rendered 3D Tarihi Taş Mektep primary school building, cut-stone ashlar masonry facade, stone foundation plinth, corner quoins, hipped terracotta roof, copper bell tower / belfry with verdigris patina, suspended swinging brass school bell, forward-tilted illuminated marquee ("🏫 GÜNEŞ MAHALLESİ İLKOKULU 🔔"), sub-banner ("T.C. MİLLİ EĞİTİM BAKANLIĞI · TARİHİ TAŞ MEKTEP · 1938"), marble flagpole with dynamic waving Turkish flag, 10-square colorful chalk hopscotch court (seksek alanı), parked yellow municipal school bus ("34 MK 2026 - OKUL TAŞITI") with octagonal STOP sign, marble drinking fountain, bicycle rack, notice board, animated Crossing Guard NPC "Hasan Dayı" with reflective safety vest, white peaked cap, pos bıyık, dual-sided STOP/GO paddle ("DUR / GEÇ"), animated paddle raising, vehicle head tracking within 20m, celebratory waving on honk, 3D speech bubble callout ("🏫 Hasan Dayı: Aferin evlat! Okul geçidinde yavaşlayan şoförün başımızın üstünde yeri var! ⭐"), dedicated service bay (`SCHOOL_BAY`: X: -35.0, Z: -46.5), procedural brass school bell chime (`sound.schoolBell()`), and minimap tracking icon (`🏫`).

## Completed Improvements in this Run
1. **Güneş Mahallesi "Tarihi Taş Mektep & Mahalle Okulu" (T51)**:
   - Built authentic Early Republican Turkish primary stone school ("Tarihi Taş Mektep") in Güneş Mahallesi (`src/scene/school.ts`, `src/game/school.ts`) at X: -35.0, Z: -36.5 along the southern curb of the Güneş boulevard (Z: -50) directly across from the Community Park:
     - **Courtyard Apron & Service Stall**: 14.0m x 12.0m stone paved ceremonial courtyard slab, granite curbs, player service bay (`SCHOOL_BAY`: X: -35.0, Z: -46.5), white stall borders, curb hazard striping, and ground directional guide arrow.
     - **Tarihi Taş Mektep Building**: 9.4m wide x 4.6m tall x 5.2m deep building with cut limestone ashlar blocks (`#dcdde1`), foundation plinth (`#747d8c`), corner quoins (`#b2bec3`), timber eaves, terracotta tile hipped roof (`#b03a2e`), twin brick chimneys.
     - **Copper Bell Tower & Belfry**: 4 copper arched columns with verdigris patina (`#2e7d32`), pyramidal copper dome roof, brass finial alem, and swinging brass school bell (`#f39c12`).
     - **Illuminated Marquee Sign**: Large rooftop marquee tilted 12° forward toward the camera (`"🏫 GÜNEŞ MAHALLESİ İLKOKULU 🔔"`), subtitle band (`"T.C. MİLLİ EĞİTİM BAKANLIĞI · TARİHİ TAŞ MEKTEP · 1938"`), PointLight illumination.
     - **Ceremonial Flagpole & Turkish Flag**: 6.5m stainless steel flagpole on stepped white marble plinth, brass sphere finial, and dynamic harmonically waving Turkish flag (`#e74c3c` + white crescent and star).
     - **Chalk Hopscotch Court (Seksek Alanı)**: Courtyard asphalt 10 numbered squares in cheerful chalk colors (cyan, yellow, coral pink, pastel green, orange) with crisp white chalk borders and top semicircular "GÖKYÜZÜ" chalk arc.
     - **Parked Yellow Municipal School Bus ("Okul Servis Minibüsü - 34 MK 2026")**: Parked inside dropoff stall (X: -30.4, Z: -44.0) with vibrant school yellow body (`#f1c40f`), white roof, tinted windows, chrome hubcaps, front/rear plates (`"34 MK 2026"`), side banner (`"OKUL TAŞITI"`), and pop-out octagonal red STOP paddle.
     - **Crossing Guard NPC ("Hasan Dayı" - X: -37.2, Z: -46.5)**: Navy trousers, fluorescent lime/yellow safety vest with silver reflective bands, white peaked cap, pos bıyık, dual-sided handheld paddle (`"DUR"` red / `"GEÇ"` green). Animated paddle guidance motion, vehicle head tracking within 20m, celebratory waving on player honk (`H`) or approach, and 3D speech bubble callouts (`"🏫 Hasan Dayı: Aferin evlat! Okul geçidinde yavaşlayan şoförün başımızın üstünde yeri var! ⭐"`).
     - **Courtyard Props**: Marble drinking fountain (hayrat çeşme) with brass spigot, bicycle rack with student bikes, bulletin cabinet, white perimeter fences and corner stone pillars.
     - **"Okul Yolu Saygısı" Pitstop Interaction**: 1.2s stationary dwell near service bay (X: -35.0, Z: -46.5) awards +10 ₺ cash bonus, +1 reputation, +0.45 nitro refill, 25s "Okul Yolu Saygısı" courtesy & safe driving buff, procedural brass school bell chime (`sound.schoolBell()`), celebratory confetti and golden coin stream, and 35s cooldown.
     - **Procedural Brass School Bell Audio**: Triple-tone arpeggiated brass bell chime (C6 1046Hz -> E6 1318Hz -> G6 1568Hz) with high shimmering overtones in `sound.schoolBell()`.
     - **Radar Minimap Icon**: Real-time `🏫` tracking icon on the radar minimap at X: -35.0, Z: -36.5.
   - Tested in `src/game/school.test.ts`, `src/scene/school.test.ts`, `src/scene/world.test.ts`, `src/audio/sound.test.ts`, `src/ui/minimap.ts`, and verified in browser smoke tests.

## Exact Next Development Task
- **T52 — Çarşı "Meşhur Tarihi Simit Fırını & Taş Fırın Odun Ateşi"**: Authentic historic 24/7 wood-fired stone oven bakery ("Meşhur Tarihi Simit Fırını") in Çarşı with glowing ember wood-fire oven aperture, baking sesame simits, ramazan pidesi, crusty bread racks, flour sacks, animated Baker Master NPC ("Fırıncı Şaban Usta") with long wooden baker's peel (fırın küreği), procedural crackling hearth & oven chime audio (`sound.woodOven()`), service bay, and "Sıcak Simit Çıtırı" pitstop stamina & speed buff.

## Quick Resume Instructions
To test and run locally:
```bash
cd games/mini-kargo
npm test                # Run 837 unit & E2E tests
npm run typecheck       # Verify TypeScript types
npm run build           # Build client bundle
npm run test:browser    # Run Playwright visual smoke tests
npm run dev             # Start local development server
```
