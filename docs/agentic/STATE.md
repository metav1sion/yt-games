# Mini Kargo — Project State Snapshot

**Date**: 2026-11-11  
**Branch**: `feat/mini-kargo`  
**Latest Git Commit**: `975a7fd`  
**Current Milestone**: Çarşı "Tarihi Türk Kahvecisi & Közde Kahve / Lokum İmalathanesi" (Execution Run 35)  
**Victory Audit Status**: `VICTORY CONFIRMED`

## Verification Summary
- **Unit & Integration Tests**: 94 test files, 940 passed, 0 failed (2.65s execution)
- **TypeScript Typecheck**: 0 errors (`tsc --noEmit`)
- **Vite Production Build**: Successful (`dist/` generated in 180ms)
- **Playwright Browser Smoke**: PASS across Desktop (1280x800), Mobile Portrait (390x844), Mobile Landscape (844x390) with 0 console errors.
- **Persistence Compatibility**: Verified backwards compatibility for `localStorage` key `mini-kargo:v1`.
- **Visual QA Capture**: Verified `artifacts/carsi-turkish-coffee.png` with live rendered 3D Çarşı Tarihi Türk Kahvecisi & Közde Kahve / Lokum İmalathanesi, 12.0m x 9.6m klinker brick & cut limestone courtyard plinth (`#d7ccc8` & `#8d6e63`), granite curbs (`#5d4037`), service bay at `X: 37.0, Z: 81.0` (Çarşı Z: 84 street northern curb) with yellow-and-black safety curb striping, white guide arrow, authentic 8.6m x 4.8m x 5.4m Ottoman arched pavilion architecture with cut limestone walls (`#f5f0e6`), rusticated terracotta plinth (`#a04000`), ashlar quoins (`#d7ccc8`), 3 pointed stone arches, 4 fluted marble columns (`#ecf0f1`) with carved muqarnas capitals, alaturka hipped terracotta roof (`#a04000`), polished brass/copper central domelet (`#d4af37`), gleaming brass crescent-and-star finial (`#f39c12`), large illuminated corporate marquee sign ("☕ TARİHİ ÇARŞI TÜRK KAHVECİSİ · TAHSİN EFENDİ 🍬"), sub-brand strip ("KÖZDE TÜRK KAHVESİ · DİBEK & ANTEP DUBLE LOKUMU · 1908"), warm amber night facade PointLight, suspended filigree brass lantern with flickering PointLight, heavy riveted copper barbecue pan with glowing red embers, hot brewing sand bed, pulsing PointLight, 4 handcrafted copper cezves, animated coffee steam/aroma puffs, stacked burlap coffee sacks ("YEMEN KAHVESİ · 50 KG" and "DİBEK KAHVESİ · 50 KG"), basalt stone mortar (dibek taşı) with wooden pestle, vintage cylindrical brass manual coffee grinder with mechanical rotating crank handle, cedar wood Turkish delight (lokum) vitrine with powdered sugar-dusted Antep pistachio and rose loukoum cubes, A-frame chalkboard menu easel ("☕ KÖZDE KAHVE: 15₺ | 🍬 ANTEP LOKUMU: 10₺"), round table with copper tray and porcelain fincan cups in lace brass holders, animated Master Coffee Roaster NPC "Kahveci Tahsin Efendi" (X: 35.5, Z: 76.8) in gold-embroidered crimson velvet cepken vest, red sash, crimson fez with black tassel, merchant mustache, holding brass serving tray with steaming fincan cups, 22m head tracking, wave salute on honk/dwell, 3D speech bubble callout ("☕ Kahveci Tahsin Efendi: Hoş geldin kargocu dostum! Közde kahvemiz pişti, bir fincanın kırk yıl hatırı vardır! 🍬"), +10 ₺ cash bonus, +1 reputation, +0.45 nitro refill, 25s "Kırk Yıllık Hatır" +15 ₺ customer tip bonus, procedural coffee bean roasting crackle, hot sand sizzle & brass cezve chime audio (`sound.turkishCoffee()`), and radar icon (`☕`).

## Completed Improvements in this Run
1. **Çarşı "Tarihi Türk Kahvecisi & Közde Kahve / Lokum İmalathanesi" (T60)**:
   - Built authentic Ottoman-style historic coffee roastery & ember-brewed kahvehane in Çarşı (`src/scene/turkish-coffee.ts`, `src/game/turkish-coffee.ts`) at X: 37.0, Z: 75.5:
     - **Zemin & Peron Yapısı**: 12.0m x 9.6m klinker tuğla ve kesme kireçtaşı avlu tablası, granit bordür taşları, asfalt servis yanaşma peronu cebi (`TURKISH_COFFEE_BAY`: X: 37.0, Z: 81.0 - Çarşı Z: 84 sokağının kuzey bordüründe), sarı-siyah bordür emniyet çizgileri, beyaz peron sınırları ve zemin beyaz kılavuz yön oku.
     - **Otantik Osmanlı Revaklı Taş Köşk Mimarisi (8.6m x 4.8m x 5.4m)**: Kesme kireçtaşı cephe kaplaması (`#f5f0e6`), rustik pişmiş toprak kaide süpürgeliği (`#a04000`), köşe silmeleri (ashlar quoins `#d7ccc8`), 3 adet sivri Osmanlı taş kemeri (pointed arches), 4 adet yivli mermer sütun (`#ecf0f1`), mukarnaslı sütun başlıkları ve alaturka kiremit kırma çatı (`#a04000`).
     - **Pirinç/Bakır Kubbe & Hilalli Pirinç Alem**: Çatı merkezinde silindirik kasnak üzerinde parlayan pirinç/bakır kubbe (`#d4af37`), tepede hilalli pirinç alem finiali (`#f39c12`).
     - **Aydınlatmalı Tabela ve Kurumsal Amblem**: Çatı alınlığında 12° öne eğimli büyük ışıklı kurumsal tabela (`"☕ TARİHİ ÇARŞI TÜRK KAHVECİSİ · TAHSİN EFENDİ 🍬"`), alt kurumsal şerit (`"KÖZDE TÜRK KAHVESİ · DİBEK & ANTEP DUBLE LOKUMU · 1908"`), altın sarısı pervaz çerçevesi, gece-gündüz çalışan sıcak termal kehribar PointLight armatürü ve asılı ferforje pirinç kafesli kandil.
     - **Közde Kahve Mangalı & Bakır Kum Ocağı (Ember Barbecue & Hot Sand Stove)**: Ağır dövme bakır mangal teknesi (`#b87333`), kızgın kor kömürleri, sıcak kavurma kumu yatağı (`#c0392b`, `#ff5722`), ocağın içinde nabız atan termal alev ışığı (PointLight), 4 adet uzun saplı el dövmesi bakır cezve, köpüren taze kahve kreması ve gökyüzüne süzülen dinamik buhar/aroma partikülleri.
     - **Kahve Çuvalları, Taş Dibek & Pirinç El Değirmeni**: EUR ahşap palet üzerinde istiflenmiş jüt kahve çuvalları (`"YEMEN KAHVESİ · 50 KG"` ve `"DİBEK KAHVESİ · 50 KG"`), bazalt taşı tarihi oyma dibek ve gürgen tokmak, dönen krank kollu pirinç manuel kahve el değirmeni.
     - **Antep Fıstıklı & Güllü Duble Lokum Vitrini & Donatılar**: Ahşap ve cam vitrinde pudra şekerli Antep fıstıklı ve güllü lokum küpleri, tebeşirli karataş A-frame fiyat tabelası (`"☕ KÖZDE KAHVE: 15₺ | 🍬 ANTEP LOKUMU: 10₺"`), yuvarlak ahşap masa üzerinde dövme bakır sunum tepsisi ve dantelli altın zarflı porselen fincan takımı.
     - **Animasyonlu Usta Kahveci NPC — "Kahveci Tahsin Efendi" (X: 35.5, Z: 76.8)**: Koyu lacivert pantolon, beyaz gömlek, altın sırmalı bordo kadife cepken yelek (`#800000`), ipek kırmızı bel kuşağı (`#c0392b`), siyah püsküllü bordo fes, heybetli esnaf bıyığı, elinde tuttuğu pirinç kahve servis tepsisi ve fincanlar. 22m mesafeden kafa/gövde takibi, korna ve duraklamada kolunu kaldırarak usta selamı ve 3D konuşma balonuyla karşılama (`"☕ Kahveci Tahsin Efendi: Hoş geldin kargocu dostum! Közde kahvemiz pişti, bir fincanın kırk yıl hatırı vardır! 🍬"`).
     - **"Kırk Yıllık Hatır" Mola Bonusu & Prosedürel Kahve Sesi (`src/game/turkish-coffee.ts`)**: Servis peronunda 1.2s duraklama: +10 ₺ nakit esnaf ikramı, +1 itibar, +0.45 nitro dolumu, 25s "Kırk Yıllık Hatır" teslimatlarda +15 ₺ müşteri bahşişi buff'ı, altın konfeti ve para akışı, 35s soğuma ve prosedürel kahve çekirdeği kavrulma çıtırtısı, sıcak kum cızırtısı ve bakır cezve çınlama sesi (`sound.turkishCoffee()`).
     - **Minimap Radar Simgesi**: Çarşı Bölgesi üzerinde canlı `☕` kahve fincanı simgesi.
   - Tested in `src/game/turkish-coffee.test.ts`, `src/scene/turkish-coffee.test.ts`, `src/scene/world.test.ts`, `src/audio/sound.test.ts`, `src/ui/minimap.ts`, and verified in browser smoke tests across 3 viewports with 0 errors.

## Exact Next Development Task
- **T61 — Sahil "Tarihi Kıyı Tahlisiye & Deniz Kurtarma İstasyonu (Can Kurtarma Botu & Kıyı Gözetleme Kulesi)"**: Authentic historic Turkish coastal lifesaving & maritime rescue station along Sahil promenade pier: weathered timber and granite stone boathouse with angled slipway ramp leading into the sea, historic orange-and-white double-ended coastal lifeboat ("TAHLİSİYE-1") secured on rail slipway carriage with winch cable, elevated wooden lookout tower with red roof and brass searchlight, lifesaving gear racks with orange lifebuoys & coiled rescue ropes, animated Chief Lifeguard / Rescuer NPC ("Tahlisiye Reisi Şükrü Kaptan") in high-visibility waterproof marine jacket & captain's cap, procedural coastal rescue fog bell & boat slipway winch ratchet audio (`sound.lifeboatWinch()`), service bay, and "Kıyı Emniyeti Güvencesi" pitstop hydroplane immunity & high-speed handling buff.

## Quick Resume Instructions
To test and run locally:
```bash
cd games/mini-kargo
npm test                # Run 940 unit & E2E tests
npm run typecheck       # Verify TypeScript types
npm run build           # Build client bundle
npm run test:browser    # Run Playwright visual smoke tests
npm run dev             # Start local development server
```
