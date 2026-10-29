# Mini Kargo — Project State Snapshot

**Date**: 2026-10-29  
**Branch**: `feat/mini-kargo`  
**Latest Git Commit**: `83d21a9` (working tree updated with T50)  
**Current Milestone**: Sanayi "Bereket Sanayi Lokantası" & Sulu Yemek / Döner Ocağı (Execution Run 25)  
**Victory Audit Status**: `VICTORY CONFIRMED`

## Verification Summary
- **Unit & Integration Tests**: 74 test files, 827 passed, 0 failed (1.83s execution)
- **TypeScript Typecheck**: 0 errors (`tsc --noEmit`)
- **Vite Production Build**: Successful (`dist/` generated in 164ms)
- **Playwright Browser Smoke**: PASS across Desktop (1280x800), Mobile Portrait (390x844), Mobile Landscape (844x390) with 0 console errors.
- **Persistence Compatibility**: Verified backwards compatibility for `localStorage` key `mini-kargo:v1`.
- **Visual QA Capture**: Verified `artifacts/sanayi-bereket-lokantasi.png` with live rendered 3D Bereket Sanayi Lokantası canteen, red brick plinth, warm cream stucco walls, hipped terracotta roof, brick chimney with cowl, forward-tilted illuminated marquee ("🍲 BEREKET SANAYİ LOKANTASI · HAKKI USTA 🥩"), sub-banner ("GÜNLÜK TABLDOT · SULU YEMEK · YAPRAK DÖNER & PİLAV"), red-and-yellow awning with scalloped fringe, stainless steel bain-marie steam table with 4 GN pans (Pilav, Kuru Fasulye, Güveç, Mercimek Çorbası) venting animated rising steam puffs, vertical rotating döner kebab spit with glowing infrared heaters, outdoor dining tables with red checkered tablecloths, bread baskets with sliced bread, condiment shakers, bistro chairs, A-frame chalkboard menu easel, retro beverage cooler, animated Chef NPC "Aşçı Hakkı Usta" with tall white toque hat, double-breasted coat, red neckerchief, apron, mustache, long carving knife, animated döner carving motion, head tracking, 3D speech bubble callouts, dedicated service bay (`RESTAURANT_BAY`: X: 30.0, Z: -52.5), and minimap tracking icon (`🍲`).

## Completed Improvements in this Run
1. **Sanayi "Bereket Sanayi Lokantası" & Sulu Yemek / Döner Ocağı (T50)**:
   - Built authentic traditional Turkish industrial district canteen ("Esnaf Lokantası") in Sanayi (`src/scene/restaurant.ts`, `src/game/restaurant.ts`) at X: 30.0, Z: -57.0 along the northern curb of the Sanayi boulevard (Z: -50):
     - **Veranda Apron & Parking Stall**: 11.5m x 9.0m concrete apron slab, granite curbs, player service bay (`RESTAURANT_BAY`: X: 30.0, Z: -52.5), yellow-and-black hazard striping, white stall borders, and ground directional guide arrow.
     - **Traditional Industrial Canteen Building**: 9.2m wide x 4.2m tall x 5.2m deep building with red brick plinth (`#9c3d23`), warm cream stucco walls (`#fdfbf7`), timber eaves, terracotta tile hipped roof (`#b03a2e`), brick chimney with metal rain cowl.
     - **Illuminated Marquee & Awning**: Large rooftop marquee tilted 12° forward toward the camera (`"🍲 BEREKET SANAYİ LOKANTASI · HAKKI USTA 🥩"`), subtitle band (`"GÜNLÜK TABLDOT · SULU YEMEK · YAPRAK DÖNER & PİLAV"`), gold trim, PointLight illumination, and red-and-yellow striped fabric awning with scalloped valance fringe.
     - **Stainless Steel Bain-Marie Steam Table Counter**: 3.4m brushed stainless steel counter with sneeze guard and 4 GN pans (Pirinç Pilavı, Kuru Fasulye, Kuzu Güveç, Mercimek Çorbası) venting animated rising steam puff particles.
     - **Vertical Döner Spit (Döner Ocağı)**: Stainless steel backplate and hood, 3 vertical glowing radiant infrared heating bricks with heat shimmer light, and rotating spit carrying seasoned marinated meat cone topped with tomato and onion.
     - **Outdoor Dining Tables & Street Props**: 2 veranda dining tables with red checkered tablecloths (kırmızı pötikare), bread baskets with sliced bread, condiment shakers, bistro chairs, A-frame chalkboard menu easel (`"GÜNÜN TABLDOTU: KURU PİLAV 25₺ | DÖNER 35₺ | MERCİMEK 15₺"`), and retro Ayran/Gazoz beverage cooler.
     - **Chef NPC ("Aşçı Hakkı Usta" - X: 28.5, Z: -53.6)**: Tall white chef's toque hat, white double-breasted jacket with black buttons, red neckerchief, white apron, pos bıyık, and long stainless steel carving knife. Animated döner carving/stirring motion, vehicle head tracking within 20m, celebratory waving on player honk (`H`) or approach, and 3D speech bubble callouts (`"🍲 Aşçı Hakkı Usta: Gel kaptan geeel! Kuru fasulye fırından yeni çıktı, pilav tane tane! 🍚"`).
     - **"Sanayi Tabldot Menüsü" Pitstop Interaction**: 1.2s stationary dwell near service bay (X: 30.0, Z: -52.5) awards +10 ₺ cash bonus, +1 reputation, +0.45 nitro refill, 25s "Sanayi Tabldot Zindeliği" stamina & speed buff, procedural metallic ladle tap & simmering stew sizzle (`sound.soupLadle()`), celebratory confetti and golden coin stream, and 35s cooldown.
     - **Procedural Stainless Steel Ladle & Simmer Audio**: Dual-tone ladle rim strike (1864Hz & 2093Hz) and warm bubbling stew simmer audio in `sound.soupLadle()`.
     - **Radar Minimap Icon**: Real-time `🍲` tracking icon on the radar minimap at X: 30, Z: -57.
   - Tested in `src/game/restaurant.test.ts`, `src/scene/restaurant.test.ts`, `src/scene/world.test.ts`, `src/audio/sound.test.ts`, `src/ui/minimap.ts`, and verified in browser smoke tests.

## Exact Next Development Task
- **T51 — Güneş Mahallesi "Tarihi Taş Mektep & Mahalle Okulu"**: Authentic Turkish neighborhood primary school ("Tarihi Taş Mektep") in Güneş Mahallesi with cut-stone masonry facade, hipped terracotta roof, copper bell tower, flagpole with waving Turkish flag, hopscotch court (seksek alanı), parked yellow municipal school bus (servis minibüsü), Crossing Guard NPC ("Hasan Dayı") with stop paddle, procedural brass school bell chime (`sound.schoolBell()`), service bay, and "Okul Yolu Saygısı" safe-speed & courtesy bonus.

## Quick Resume Instructions
To test and run locally:
```bash
cd games/mini-kargo
npm test                # Run 827 unit & E2E tests
npm run typecheck       # Verify TypeScript types
npm run build           # Build client bundle
npm run test:browser    # Run Playwright visual smoke tests
npm run dev             # Start local development server
```
