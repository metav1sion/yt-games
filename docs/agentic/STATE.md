# Mini Kargo — Project State Snapshot

**Date**: 2026-10-29  
**Branch**: `feat/mini-kargo`  
**Latest Git Commit**: `1df7baa`  
**Current Milestone**: Çarşı "Meşhur Tarihi Simit Fırını & Taş Fırın Odun Ateşi" (Execution Run 27)  
**Victory Audit Status**: `VICTORY CONFIRMED`

## Verification Summary
- **Unit & Integration Tests**: 78 test files, 847 passed, 0 failed (2.32s execution)
- **TypeScript Typecheck**: 0 errors (`tsc --noEmit`)
- **Vite Production Build**: Successful (`dist/` generated in 168ms)
- **Playwright Browser Smoke**: PASS across Desktop (1280x800), Mobile Portrait (390x844), Mobile Landscape (844x390) with 0 console errors.
- **Persistence Compatibility**: Verified backwards compatibility for `localStorage` key `mini-kargo:v1`.
- **Visual QA Capture**: Verified `artifacts/carsi-tarihi-simit-firini.png` with live rendered 3D Meşhur Tarihi Simit Fırını building, cut-stone foundation plinth, klinker red brick facade, corner quoins, hipped terracotta roof, forward-tilted illuminated marquee ("🥖 MEŞHUR TARİHİ SİMİT FIRINI · TAŞ FIRIN ODUN ATEŞİ 🥨"), sub-banner ("GELENEKSEL ODUN TAŞ FIRINI · ÇITIR SİMİT & RAMAZAN PİDESİ · 1928"), red-and-cream striped fabric awning with scalloped fringe, front-projecting arched refractory brick dome oven with burning oak ember hearth, dynamic amber flickering flame light (PointLight), baking sesame simits and ramazan pideleri on stone hearth floor, tall masonry chimney with rotating cowl and rising smoke particle puffs, glass-fronted simit/bread vitrine counter ("TAZE ÇITIR SİMİT"), vertical cedar simit pole ("Simit Ağacı") with hanging sesame simit rings, jute burlap flour sacks ("UN 50 KG"), stacked oak firewood logs, A-frame chalkboard menu easel ("🥨 SİMİT: 7₺ | 🍞 EKMEK: 12₺ | 🫓 PİDE: 15₺"), brass samovar, animated Baker Master NPC "Fırıncı Şaban Usta" with white baker's cap, shirt, flour-smudged apron, pos bıyık, 2.4m wooden baker's peel (fırın küreği) holding a hot smoking sesame simit, peel sliding in-and-out motion, vehicle head tracking within 22m, celebratory peel raising and wave on player honk (`H`) or dwell, 3D speech bubble callout ("🥖 Fırıncı Şaban Usta: Gel kaptan geel! Fırından yeni çıktı, çıtır susamlı simitler yakıyor! 🥨"), dedicated service bay (`BAKERY_BAY`: X: 59.5, Z: 31.2) on the northern shoulder of the historic tram street (Z: 34), procedural wood-fire crackle, stone hearth tap & bakery chime audio (`sound.woodOven()`), and radar minimap icon (`🥖`).

## Completed Improvements in this Run
1. **Çarşı "Meşhur Tarihi Simit Fırını & Taş Fırın Odun Ateşi" (T52)**:
   - Built authentic traditional historic 24/7 wood-fired stone oven bakery ("Meşhur Tarihi Simit Fırını") in Çarşı (`src/scene/bakery.ts`, `src/game/bakery.ts`) at X: 59.5, Z: 24.5 along the northern curb of the historic tram avenue (Z: 34):
     - **Courtyard Apron & Service Bay**: 8.0m x 9.5m terracotta klinker paving slab, granite curbs, player dropoff bay (`BAKERY_BAY`: X: 59.5, Z: 31.2), yellow-and-black hazard striping, white stall borders, and ground directional guide arrow.
     - **Tarihi Taş & Tuğla Fırın Mimarisi**: 7.6m wide x 4.8m tall x 5.2m deep building with rustic limestone foundation plinth (`#795548`), klinker red brick walls (`#a04000`), corner ashlar quoins (`#d7ccc8`), timber eaves, terracotta tile hipped roof (`#b03a2e`), upper floor arched windows with wrought iron grilles.
     - **Köz Odun Ateşli Kubbeli Fırın Gözü (Wood-Fired Dome Oven)**: Front-projecting 1.9m tall arched refractory brick dome oven (`#c0392b`), arched stone aperture, internal oak firewood ember bed (`#e65100`, `#ff5722`), dynamic flickering amber flame light (`PointLight` with harmonic flicker), baking sesame simits and scored ramazan pidesi on the stone hearth floor.
     - **Masonry Chimney & Live Smoke**: 3.6m tall brick chimney stack (`#6d4c41`), rotating metal cowl cap (`#37474f`), and 5 rising translucent white smoke puff particles drifting skyward.
     - **Illuminated Marquee Sign & Fabric Awning**: Large rooftop marquee tilted 12° forward toward the camera (`"🥖 MEŞHUR TARİHİ SİMİT FIRINI · TAŞ FIRIN ODUN ATEŞİ 🥨"`), subtitle band (`"GELENEKSEL ODUN TAŞ FIRINI · ÇITIR SİMİT & RAMAZAN PİDESİ · 1928"`), PointLight illumination, and red-and-cream striped canvas awning with scalloped fringe.
     - **Sidewalk Displays & Bakery Props**: Glass-fronted display vitrine counter (`"TAZE ÇITIR SİMİT"`), 2.3m tall cedar simit pole ("Simit Ağacı") with hanging sesame simit rings, 3 stacked jute flour sacks (`"UN 50 KG"`), stacked oak firewood logs, A-frame chalkboard price easel (`"🥨 SİMİT: 7₺ | 🍞 EKMEK: 12₺ | 🫓 PİDE: 15₺"`), and brass samovar on marble stand.
     - **Baker Master NPC ("Fırıncı Şaban Usta" - X: 57.8, Z: 28.5)**: White trousers, white baker's shirt, flour-smudged apron, white cloth baker's cap, pos bıyık, 2.4m wooden baker's peel (fırın küreği) carrying a fresh hot sesame simit. Animated peel sliding in/out motion, vehicle head tracking within 22m, celebratory peel raising and wave on player honk (`H`) or approach, and 3D speech bubble callouts (`"🥖 Fırıncı Şaban Usta: Gel kaptan geel! Fırından yeni çıktı, çıtır susamlı simitler yakıyor! 🥨"`).
     - **"Sıcak Simit Çıtırı" Pitstop Interaction**: 1.2s stationary dwell near service bay (X: 59.5, Z: 31.2) awards +10 ₺ cash bonus, +1 reputation, +0.45 nitro refill, 25s "Sıcak Simit Çıtırı" stamina & agility buff, procedural wood-fire crackle, stone hearth tap & bakery chime audio (`sound.woodOven()`), celebratory confetti and golden coin stream, and 35s cooldown.
     - **Procedural Wood-Fired Oven Web Audio**: Resonant low-mid stone hearth peel tap (240Hz -> 80Hz), bandpass filtered hearth ember crackle bursts, and arpeggiated bakery customer chime (G5 784Hz -> C6 1046Hz) in `sound.woodOven()`.
     - **Radar Minimap Icon**: Real-time `🥖` tracking icon on the radar minimap along the Çarşı tram street at X: 59.5, Z: 24.5.
   - Tested in `src/game/bakery.test.ts`, `src/scene/bakery.test.ts`, `src/scene/world.test.ts`, `src/audio/sound.test.ts`, `src/ui/minimap.ts`, and verified in browser smoke tests.

## Exact Next Development Task
- **T53 — Sahil "Tarihi Deniz Feneri & Kıyı Kurtarma Rıhtımı"**: Authentic coastal maritime landmark at Sahil breakwater pier: spiraled red-and-white historic lighthouse tower, rotating Fresnel lens beam with volumetric cone, observation catwalk, maritime signal flags, animated Lighthouse Keeper NPC ("Fenerci Rıza Kaptan") with yellow oilskin slicker & brass nautical telescope, procedural nautical foghorn audio (`sound.fogHorn()`), service bay, and "Fener Rehberliği" night navigation & high-beam nitro buff.

## Quick Resume Instructions
To test and run locally:
```bash
cd games/mini-kargo
npm test                # Run 847 unit & E2E tests
npm run typecheck       # Verify TypeScript types
npm run build           # Build client bundle
npm run test:browser    # Run Playwright visual smoke tests
npm run dev             # Start local development server
```
