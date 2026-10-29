# Mini Kargo — Project State Snapshot

**Date**: 2026-10-29  
**Branch**: `feat/mini-kargo`  
**Latest Git Commit**: `PENDING_COMMIT`  
**Current Milestone**: Çarşı "Tarihi Çınaraltı Kıraathanesi" & Tavla/Kahve Meydanı (Execution Run 23)  
**Victory Audit Status**: `VICTORY CONFIRMED`

## Verification Summary
- **Unit & Integration Tests**: 70 test files, 807 passed, 0 failed (1.65s execution)
- **TypeScript Typecheck**: 0 errors (`tsc --noEmit`)
- **Vite Production Build**: Successful (`dist/` generated in 172ms)
- **Playwright Browser Smoke**: PASS across Desktop (1280x800), Mobile Portrait (390x844), Mobile Landscape (844x390) with 0 console errors.
- **Persistence Compatibility**: Verified backwards compatibility for `localStorage` key `mini-kargo:v1`.
- **Visual QA Capture**: Verified `artifacts/carsi-cinaralti-kiraathane.png` with live rendered 3D historic stone coffeehouse building, ashlar quoins, tiled hipped roof, brick chimney with coffee aroma vents, arched transom windows with warm interior PointLight illumination, carved double timber entrance doors, large illuminated marquee sign ("☕ TARİHİ ÇINARALTI KIRAATHANESİ · 1923 🌿"), secondary goods banner ("KUMDA TÜRK KAHVESİ · TAZE ÇAY · TAVLA KEYFİ"), emerald green and cream striped awning, monumental ancient plane tree ("Ulu Çınar Ağacı") with gnarled trunk, root buttresses, sprawling canopy, circular wooden tree surround bench ("Halka Sedir"), suspended brass/amber glass lanterns, outdoor cobblestone terrace, wicker stool tables, intense backgammon table with mother-of-pearl inlaid board, checkers, and miniature dice, coffee and tulip tea glass table, daily newspaper reading corner, brick & copper "Kumda Kahve" roasting sand hearth with cezves, copper tea samovar, A-frame chalkboard menu easel, friendly animated Coffee Master NPC "Kahveci Bekir Usta" with burgundy/brown embroidered vest, white shirt, black trousers, apron, Ottoman kasket/fez, holding iconic swinging brass tea tray with tulip glasses, arm waving animation, vehicle head tracking, celebratory waving upon player honk (`H`) or approach, 3D speech bubble callouts (`"☕ Kahveci Bekir Usta: Hoş geldin evlat! Közde kahvemiz taze, tavla masası hazır! 🎲"`), player service bay with parking lines, guide arrow, and real-time radar tracking icon (`🎲`).

## Completed Improvements in this Run
1. **Çarşı "Tarihi Çınaraltı Kıraathanesi" & Tavla/Kahve Meydanı (T48)**:
   - Built authentic Ottoman/Anatolian historic stone coffeehouse complex (`src/scene/coffee-house.ts`, `src/game/coffee-house.ts`) at X: 38.5, Z: 62.0 directly facing the Çarşı Piazza and south boulevard:
     - **Terrace Cobblestone Apron & Structure**: 14.0m x 12.0m cobblestone plaza terrace with dark timber/granite curbs, player service bay (`COFFEE_HOUSE_BAY`: X: 43.0, Z: 56.5), parking perimeter lines, and white ground guide arrow.
     - **Historic Stone Coffeehouse Building**: 8.4m wide x 4.4m tall x 4.8m deep building with weathered limestone masonry (`#d7ccc8`), darker ashlar quoins (`#8d6e63`), base plinth, terracotta tiled hipped roof (`#a04000`), carved timber eaves frieze, stone chimney, arched wooden windows with warm interior PointLight illumination, and carved wooden entrance doors.
     - **Illuminated Marquee & Awning**: Large illuminated roof marquee sign (`"☕ TARİHİ ÇINARALTI KIRAATHANESİ · 1923 🌿"`), secondary goods banner (`"KUMDA TÜRK KAHVESİ · TAZE ÇAY · TAVLA KEYFİ"`), and emerald green and cream striped entrance awning.
     - **Monumental Ancient Plane Tree ("Ulu Çınar Ağacı" - X: 36.8, Z: 58.8)**: 5.8m tall gnarled tree trunk with root buttresses, sprawling branches, 7 lush foliage clusters (`#2e7d32`, `#388e3c`, `#43a047`, with warm autumn touch `#f9a825`), 8-segment circular wooden surround bench ("Halka Sedir"), and 3 suspended brass/amber glass lanterns casting warm amber glow.
     - **Outdoor Tables & Wicker Stools**:
       - *Kızışmalı Tavla Masası*: Circular wooden table with open mother-of-pearl inlaid backgammon board, black and white checkers, miniature dice, and 2 woven wicker stools.
       - *Kumda Kahve & Çay Masası*: Circular table with copper cezve, tulip tea glasses on red/white saucers, and sugar cubes.
       - *Gazete & Kahve Masası*: Circular table with opened daily newspaper and Turkish coffee cup in ornate brass filigree holder.
     - **"Kumda Kahve" Ocağı & Bakır Semaver**: Heavy copper basin on brick counter filled with golden roasting sand, embedded copper cezves, twin-faucet copper Turkish tea samovar with chimney, and A-frame chalkboard menu easel (`"☕ Kumda Kahve: 15₺ | 🍵 Tavşan Kanı Çay: 5₺ | 🎲 Tavla: Müesseseden"`).
     - **Coffee Master NPC ("Kahveci Bekir Usta" - X: 40.5, Z: 58.5)**: Navy trousers, white collared shirt, brown embroidered vest, white apron, pos bıyık, Ottoman kasket/fez, holding iconic 3-chain swinging brass tea tray with tulip tea glasses. Animated swinging tray arm, player vehicle head tracking within 18m, celebratory waving upon player honk (`H`) or approach, and 3D speech bubble callouts (`"☕ Kahveci Bekir Usta: Hoş geldin evlat! Közde kahvemiz taze, tavla masası hazır! 🎲"`).
     - **"Esnaf Kahvesi" Pitstop Interaction**: 1.2s stationary dwell near service bay (X: 43.0, Z: 56.5) awards +10 ₺ cash bonus, +1 reputation, +0.45 nitro refill, 25s "Közde Kahve Zindeliği" stamina buff, procedural backgammon dice roll clatter (`sound.diceRoll()`), celebratory confetti and golden coin stream, and 35s cooldown.
     - **Procedural Backgammon Dice Roll Audio**: Rapid synthesized woody clatters and resonance in `sound.diceRoll()`.
     - **Radar Minimap Icon**: Real-time `🎲` tracking icon on the radar minimap.
   - Tested in `src/game/coffee-house.test.ts`, `src/scene/coffee-house.test.ts`, `src/scene/world.test.ts`, `src/audio/sound.test.ts`, `src/ui/minimap.test.ts`, and verified in browser smoke tests.

## Exact Next Development Task
- **T49 — Sahil "Kordon Boyu Hakiki Maraş Dondurmacısı" & Plaj Voleybolu / Güneşlenme Terası**: Authentic Turkish Maraş ice cream stand along Sahil coastal promenade with traditional brass/steel cooling cauldrons, long-handled paddles, ringing shop bell, colorful beach umbrellas, sun loungers, beach volleyball court, animated Ice Cream Master NPC ("Maraşlı Ali Usta") with traditional embroidered Maraş cepken vest, tall fez, paddle trick animation, procedural ice cream bell audio (`sound.iceCreamBell()`), and "Buz Gibi Maraş Dondurması" pitstop speed doping.

## Quick Resume Instructions
To test and run locally:
```bash
cd games/mini-kargo
npm test                # Run 807 unit & E2E tests
npm run typecheck       # Verify TypeScript types
npm run build           # Build client bundle
npm run test:browser    # Run Playwright visual smoke tests
npm run dev             # Start local development server
```
