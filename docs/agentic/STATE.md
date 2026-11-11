# Mini Kargo — Project State Snapshot

**Date**: 2026-11-11  
**Branch**: `feat/mini-kargo`  
**Latest Git Commit**: `[Pending Commit for Run 39]`  
**Current Milestone**: Çarşı "Tarihi Baharatçı, Aktar & Lokman Hekim Şifahanesi (Aktar İdris Efendi)" (Execution Run 39)  
**Victory Audit Status**: `VICTORY CONFIRMED`

## Verification Summary
- **Unit & Integration Tests**: 102 test files, 988 passed, 0 failed (2.33s execution)
- **TypeScript Typecheck**: 0 errors (`tsc --noEmit`)
- **Vite Production Build**: Successful (`dist/` generated in 167ms)
- **Playwright Browser Smoke**: PASS across Desktop (1280x800), Mobile Portrait (390x844), Mobile Landscape (844x390) with 0 console errors.
- **Persistence Compatibility**: Verified backwards compatibility for `localStorage` key `mini-kargo:v1`.
- **Visual QA Capture**: Verified `artifacts/carsi-herbalist.png` with live rendered 3D Çarşı Tarihi Baharatçı, Aktar & Lokman Hekim Şifahanesi: 11.8m x 8.4m klinker tuğla ve kesme kireçtaşı avlu tablası (`#ded2be`, `#8d6e63`), çevre granit bordür taşları (`#5d4037`), servis yanaşma peronu cebi at `X: 24.5, Z: 47.2` (Çarşı Z: 50 bulvarının kuzey bordüründe) with yellow-and-black safety curb striping, white guide arrow, authentic Ottoman stone & timber storefront architecture (8.4m x 4.8m x 4.9m), pointed double stone arches, mukarnas marble capitals & pilasters (`#f5f0e6`), traditional timber bay eaves with corbels and terracotta hip roof (`#a04000`), prominent illuminated marquee sign on the south roof fascia (`"🌿 TARİHİ ÇARŞI AKTARI & ŞİFAHANESİ · İDRİS EFENDİ 🧪"`) with gold-yellow border trim, sub-banner (`"LOKMAN HEKİM ŞİFALI BİTKİLERİ · BAHARAT & DOĞAL MACUNLAR · 1892"`), warm amber PointLight illumination fixture and hanging wrought-iron brass lantern, colorful conical spice mounds on solid walnut counter (Antep İpek Pul Biberi & Sumak `#c0392b`, Hint Zerdeçal & Safran `#f39c12`, Dağ Kekiği & Nane `#27ae60`, Tatlı Toz Biber & Kimyon `#d35400`) in brass bowls with wooden scoops, front rustic burlap jute sacks (`"İPEK PUL BİBER"`, `"KİMYON & TARÇIN"`, `"HİNT SAFRANI"`), hanging garlands of dried red chili peppers, eggplants and wild herbs from the rafters, 12-drawer traditional apothecary cabinet with brass handles, apothecary glass showcase with amber, emerald and sapphire tincture vials, brass double-pan balance scale with weight set, animated cast bronze mortar & pestle with rhythmic grinding motion and aromatic rising herbal steam particles, animated Master Herbalist NPC "Aktar İdris Efendi" (X: 22.8, Z: 43.6) in emerald green velvet vest, red silk sash, round wireframe spectacles, wise white beard, fresh mint bundle in hand, 22m head tracking, wave salute on honk/dwell, 3D speech bubble callout ("🌿 Aktar İdris Efendi: Hoş geldin evlat! Lokman Hekim şifasıyla dertlere deva, kargoya can katarız! 🧪"), +10 ₺ cash bonus, +1 reputation, +0.45 nitro refill, 25s "Aktar Şifası & Bitkisel Zindelik" nitro acceleration, handling & +15 ₺ herbal delivery tip buff, procedural bronze mortar clink & herbal grinding crunch audio (`sound.spiceMortar()`), and radar icon (`🌿`).

## Completed Improvements in this Run
1. **Çarşı "Tarihi Baharatçı, Aktar & Lokman Hekim Şifahanesi (Aktar İdris Efendi)" (T64)**:
   - Built authentic traditional Turkish herbalist, spice bazaar & apothecary shop in historic Çarşı along the northern curb of the central Z = 50 boulevard (`src/scene/herbalist.ts`, `src/game/herbalist.ts`) at X: 24.5, Z: 42.0:
     - **Zemin & Peron Yapısı**: 11.8m x 8.4m klinker tuğla ve kesme kireçtaşı avlu tablası, çevre granit bordür taşları, asfalt servis yanaşma peronu cebi (`HERBALIST_BAY`: X: 24.5, Z: 47.2 - Çarşı Z: 50 bulvarının kuzey bordüründe), sarı-siyah bordür emniyet çizgileri, beyaz peron sınırları ve zemin beyaz kılavuz yön oku.
     - **Otantik Osmanlı Taş & Ahşap Dükkan Mimarisi**: Kesme kireçtaşı ve klinker tuğla ana gövde (8.4m x 4.8m x 4.9m), cephede çift sivri Osmanlı taş kemeri (pointed stone arches), mukarnaslı mermer söveler ve sütunlar (`#f5f0e6`), geleneksel ahşap cumbalı saçaklık, oyma payandalar ve alaturka kiremit kırma sundurma çatı (`#a04000`).
     - **Aydınlatmalı Büyük Kurumsal Çatı Tabelası & Gece Işıklandırması**: Çatı alınlığında büyük ışıklı tabela (`"🌿 TARİHİ ÇARŞI AKTARI & ŞİFAHANESİ · İDRİS EFENDİ 🧪"`), alt kurumsal şerit (`"LOKMAN HEKİM ŞİFALI BİTKİLERİ · BAHARAT & DOĞAL MACUNLAR · 1892"`), altın-sarı koruyucu pervaz çerçevesi, gece dükkanı aydınlatan sıcak kehribar PointLight armatürü ve asılı ferforje pirinç kandil.
     - **Renkli Baharat Piramitleri & Çuvalları**: Masif ceviz ahşap tezgah üzerinde 4 adet konik renkli baharat tepesi: Antep İpek Pul Biberi & Sumak (`#c0392b`), Zerdeçal & Safran (`#f39c12`), Dağ Kekiği & Nane (`#27ae60`), Tatlı Toz Biber & Kimyon (`#d35400`), pirinç kaseler, ahşap baharat kürekleri, tezgah önünde yerde sıralı 3 adet rustik jüt çuval (`"İPEK PUL BİBER"`, `"KİMYON & TARÇIN"`, `"HİNT SAFRANI"`).
     - **Kurutulmuş Biber, Patlıcan & Bamya Dizileri**: Ahşap saçaklardan asılı sallanan geleneksel kurutulmuş kırmızı acı biber dizileri, kuru dolmalık patlıcan oyuntuları, sarımsak ve dağ kekiği demetleri.
     - **Lokman Hekim Şifahane Cam Eczacı Kavanozları & Ahşap Aktar Dolabı**: Duvara dayalı 12 çekmeceli pirinç kulplu geleneksel ceviz aktar dolabı, cam vitrinde sıralı amber, zümrüt ve safir şifa tentür kavanozları (`#e65100`, `#1b5e20`, `#0d47a1`, `#b71c1c`).
     - **Kollu Pirinç Denge Terazisi & Ağırlıklar**: Tezgah üzerinde döküm pirinç denge terazisi, asılı pirinç kefeler ve pirinç gramaj ağırlıkları seti.
     - **Ritmik Animasyonlu Bronz Havan & Havaneli**: Dökme bronz havan, içinde ezilen şifalı bitkiler, ritmik öğütme animasyonu yapan dövme bronz havaneli ve yükselen aromatik şifa buharı / bitki partikülleri.
     - **Animasyonlu Usta Aktar NPC — "Aktar İdris Efendi" (X: 22.8, Z: 43.6)**: Koyu kahve pantolon, beyaz yakasız gömlek, altın sırmalı zümrüt yeşili kadife cepken yelek (`#1e8449`), ipek kırmızı kuşak, bordo fes, bilge ak sakal, yuvarlak tel gözlükler, elinde taze nane demeti, 22m mesafeden kafa/gövde takibi, korna ve duraklamada kolunu kaldırarak bilge selamı ve 3D konuşma balonuyla karşılama (`"🌿 Aktar İdris Efendi: Hoş geldin evlat! Lokman Hekim şifasıyla dertlere deva, kargoya can katarız! 🧪"`).
     - **"Aktar Şifası & Bitkisel Zindelik" Mola Bonusu & Prosedürel Havan / Baharat Sesi (`src/game/herbalist.ts`)**: Servis peronunda 1.2s duraklama: +10 ₺ nakit esnaf desteği, +1 itibar, +0.45 nitro dolumu, 25s "Aktar Şifası & Bitkisel Zindelik" nitro/çeviklik & teslimatlarda +15 ₺ şifalı bahşiş primi buff'ı, altın konfeti ve para akışı, 35s soğuma ve prosedürel dökme bronz havan çınlaması ile taze bitki ezilme ve öğütme çıtırtısı sesi (`sound.spiceMortar()`).
     - **Minimap Radar Simgesi**: Çarşı Bölgesi üzerinde canlı `🌿` şifahane / aktar simgesi.
   - Tested in `src/game/herbalist.test.ts`, `src/scene/herbalist.test.ts`, `src/scene/world.test.ts`, `src/audio/sound.test.ts`, `src/ui/minimap.ts`, and verified in browser smoke tests across 3 viewports with 0 errors.

## Exact Next Development Task
- **T65 — Sahil "Tarihi Yelken Kulübü, Yat Çekek Yeri & Gemi Marangozhanesi (Kaptan Rauf Bey)"**: Authentic Turkish coastal sailing club, yacht slipway & wooden boat restoration shipyard along Sahil marina / coastal promenade: timber drydock staging cradle, drydocked classic wooden cutter / sailboat ("EGE YILDIZI") with polished mahogany transom and brass cleats, canvas sail drying loft, brass marine compass & sextant, lifebuoys, shipyard gantry crane, animated Sailing Master / Shipwright NPC ("Kaptan Rauf Bey") in navy double-breasted skipper jacket with captain's peaked cap and brass binoculars, procedural ocean breeze bell chime & boat halyard clink audio (`sound.yachtHalyard()`), dedicated service bay, and "Rüzgar & Yelken Seyri" top speed & nitro acceleration buff.

## Quick Resume Instructions
To test and run locally:
```bash
cd games/mini-kargo
npm test                # Run 988 unit & E2E tests
npm run typecheck       # Verify TypeScript types
npm run build           # Build client bundle
npm run test:browser    # Run Playwright visual smoke tests
npm run dev             # Start local development server
```
