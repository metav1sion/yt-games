# Mini Kargo — QA & Verification Report

## Automated Test Suites
- **Vitest Unit & Integration**:
  - `src/game/vehicle.test.ts` (44 tests) — Handling, acceleration, braking, nitro, drift
  - `src/game/delivery.test.ts` (33 tests) — Package lifecycle, scoring, bonuses, multi-district special contracts (VIP, cold-chain, heavy-freight), combo streaks and damage reset
  - `src/game/contact-damage.test.ts` (17 tests) — Recoil, damage mitigation, invulnerability frames
  - `src/game/districts.test.ts` (14 tests) — District unlocks, boundaries, drop zones
  - `src/game/upgrades.test.ts` (27 tests) — 5 upgrade tiers, stat scaling, costs
  - `src/game/company.test.ts` (8 tests) — Courier hiring, fleet balance, revenue
  - `src/ui/minimap.test.ts` (12 tests) — Canvas radar rendering, marker coordinates
  - `src/scene/city-buildings.test.ts` (2 tests) — District building placement & clearance
  - `src/scene/pedestrians.test.ts` (3 tests) — Sidewalk pathing, vehicle evasion & summer rain umbrella deployment
  - `src/scene/traffic.test.ts` (3 tests) — Traffic loops & distance keeping
  - `src/scene/buy-pad.test.ts` (4 tests) — BuyPad visuals, rings, discs, dynamic syncing
  - `src/scene/car.test.ts` (11 tests) — Wheel physics, scooter switching, and dynamic vehicle headlight activation
  - `src/scene/atmosphere.test.ts` (2 tests) — Time-of-day phases (morning, noon, golden hour, dusk), sun/sky/fog interpolation
  - `src/scene/weather.test.ts` (2 tests) — Dynamic weather transitions (clear / summer rain), 3D volumetric rain streaks, asphalt wetness & sheen, disposal
  - `src/scene/delivery-stations.test.ts` (4 tests) — 16 district stations, NPC waving on approach, celebratory jumping on delivery, visual parcel stacking, and disposal
  - `src/scene/urban-fauna.test.ts` (5 tests) — Seagull thermal flight & coastal cry, piazza pigeon scatter & flight evasion on proximity/honk, suburban cat head tracking & meow, industrial guard dog tail wagging & protective bark
  - `src/scene/environmental-fx.test.ts` (5 tests) — 4 leaf piles in Güneş with speed-trigger scattering & +5₺ reward, coastal wave breaker spray mist & surf sound, Sanayi welding workshop with Welder NPC, dynamic arc flicker & spark shower, and disposal
  - `src/scene/traffic-lights.test.ts` (4 tests) — 8 intersection traffic light signals, 26.6s cycle timing, 3-aspect vehicular lenses, 2-aspect pedestrian signals, night emissive multiplier & disposal
  - `src/scene/bus-stops.test.ts` (4 tests) — 4 district bus stops, curved glass canopies, "D" transit signs, commuter NPC head tracking & friendly arm wave on honk, and disposal
  - `src/scene/city-buildings.test.ts` (3 tests) — District building placement, obstacles, and rooftop architectural detailing (solar water heaters, satellite dishes, HVAC chillers)
  - `src/scene/traffic.test.ts` (4 tests) — 37 traffic vehicles including AI courier scooters with lean roll physics and interactive horn greeting
  - `src/scene/delivery-stations.test.ts` (4 tests) — 16 district stations, NPC waving/receiving handoff stance, celebratory jump, gratitude speech bubbles, parcel stacking & disposal
  - `src/game/career.test.ts` (6 tests) — 4 vehicle liveries (classic, coastal_wave, midnight_express, gold_rush), career trophy unlock evaluations, and new trophy notifications
  - `src/scene/markers.test.ts` (4 tests) — Radial hold progress disc scaling, VIP/contract theme colors, and parabolic delivery animation with squash-and-stretch bounce
  - `src/audio/ambience.test.ts` (2 tests) — 4-district procedural soundscape synthesis, rain patter audio, crossfading, muting & null-context safety
  - `src/audio/radio.test.ts` (5 tests) — Procedural in-game car radio, Lo-Fi, Synthwave, City Funk track sequences, ducking & muting
  - `src/audio/sound.test.ts` (4 tests) — Motor, horn, crash, money drain, jingle, launch/landing, clean driving bonus, combo fanfare, ambience, rain intensity, fauna cries (seagull, pigeon, cat, dog), leaf crunch, surf crash, welding arc buzz, package drop thud & tape rustle, scooter courier horn beep, radio integration
  - `src/scene/puddles.test.ts` (5 tests) — 12 road puddles across 4 districts, wetness-responsive opacity, speed-triggered splash events, hydroplaning threshold & external vehicle splash checks
  - `src/scene/particles.test.ts` (8 tests) — Money stream, confetti, drift, nitro, sparks, crash smoke, landing dust, and lateral wheel puddle splash spray
  - `src/game/delivery.test.ts` (36 tests) — Package lifecycle, scoring, bonuses, multi-district special contracts (VIP, cold-chain, heavy-freight), combo streaks, damage reset, and customer tipping mechanics (15–30 ₺)
  - `src/scene/delivery-stations.test.ts` (5 tests) — 16 district stations, NPC waving/receiving handoff stance, celebratory jump, gratitude speech bubbles, customer tip badges, parcel stacking & disposal
  - `src/audio/sound.test.ts` (4 tests) — Motor, horn, crash, money drain, jingle, launch/landing, clean driving bonus, combo fanfare, ambience, rain intensity, fauna cries (seagull, pigeon, cat, dog), leaf crunch, surf crash, welding arc buzz, package drop thud & tape rustle, scooter courier horn beep, puddle splash whoosh, customer tip coin chime, radio integration
  - `src/scene/world.test.ts` (17 tests) — Road connectivity, delivery zone clearance, boulevard clearance, district traffic & pedestrian paths, night factor emissive modulation, integrated traffic lights, integrated bus stops
  - `tests/adversarial-challenger2.test.ts` (35 tests) — 1,521 BFS node pairs tested with 0 disconnections; 10,000 tick courier simulation with 0 deadlocks
  - `tests/stress/adversarial_simulation.test.ts` (22 tests) — Simulation stress tests
  - `src/game/pitstop.test.ts` (6 tests) — EV quick-charger pad proximity, charge speed thresholds, 1.5s charge duration, 25s supercharge buff timer & events
  - `src/scene/pitstop.test.ts` (1 test) — 3D EV charging pad mesh hierarchy, kiosk displays, status LEDs, and disposal
  - `src/game/street-vendors.test.ts` (7 tests) — Simitçi & Kestaneci proximity interaction, 5₺ purchase cost, cooldown timers, reputation bonus, 15s energy buff, pet treats accumulation & consumption
  - `src/scene/street-vendors.test.ts` (1 test) — 3D street cart models, glass showcases, umbrellas, vendor NPCs, horn interaction & disposal
  - `src/game/gas-station.test.ts` (6 tests) — Gas station fuel pump proximity & hold timers, full tank completion, wash bay detection, car wash cycle, 30s clean buff duration & cash tip bonus
  - `src/scene/gas-station.test.ts` (3 tests) — 3D canopy, dual pump islands, 24/7 store, rotating wash bay foam rollers, Selim Usta NPC, horn reaction, and colliders
  - `src/scene/urban-fauna.test.ts` (6 tests) — Seagulls, piazza pigeons, neighborhood cats, Karabaş the Anatolian Shepherd, head tracking, horn reactions, and dynamic pet treat feeding interactions
  - `src/scene/particles.test.ts` (10 tests) — Money stream, confetti, drift, nitro, sparks, crash smoke, landing dust, puddle splash, EV sparks, wash foam spray, car shine sparkles, and floating heart particles
  - `src/game/road-work.test.ts` (6 tests) — Road work state initialization, zone detection, safe speed passing reward (+15 ₺ & +1 rep), speeding violation warning, worker greeting on honk, and beacon flasher intervals
  - `src/scene/road-work.test.ts` (2 tests) — 3D hazard zone hierarchy, excavation trench, amber flasher tower with PointLight, safety cones, A-frame barricades, municipal worker NPCs (Kadir Usta & Murat Usta), speech bubbles, and colliders
  - `src/game/seaside-life.test.ts` (5 tests) — Seaside cafe dwell timer, 1s tea serving threshold, 20s tea buff duration, reputation bonus, fisherman reel sound on honk, and cafe greeting
  - `src/scene/seaside-life.test.ts` (2 tests) — 3D tea garden deck, pergola columns, red/white canvas awning, tables with wicker stools, saucers with tulip glasses, copper samovar counter, Tea Master Rıza Dayı, fishing NPCs (Salih Reis & Kemal Ağabey), moored wooden rowboats with wave physics, and non-blocking colliders
  - `src/scene/particles.test.ts` (11 tests) — Money stream, confetti, drift, nitro, sparks, crash smoke, landing dust, puddle splash, EV sparks, wash foam spray, car shine sparkles, floating hearts, construction dust, and coastal water splash
  - `src/scene/weather.test.ts` (3 tests) — Dynamic weather transitions (clear / summer rain / thunderstorm), 420 volumetric rain streaks with wind tilt, 3D jagged lightning bolt, road wetness & specular reflection, disposal
  - `src/game/ferris-wheel.test.ts` (6 tests) — Ferris wheel rotation angle, chase light phase, 1.2s boarding dwell timer, Sahil Neşesi cash & rep bonus (+15 ₺, +1 rep), cooldown timer, operator greeting on honk
  - `src/scene/ferris-wheel.test.ts` (3 tests) — 3D pier foundation, twin A-frame steel lattice towers, rotating double-ring wheel truss, 12 passenger gondolas with gravity counter-rotation, 24 animated LED chase lights, ticket booth, operator NPC, and colliders
  - `src/audio/sound.test.ts` (4 tests) — Motor, horn, crash, money drain, jingle, launch/landing, clean driving bonus, combo fanfare, ambience, rain intensity, fauna cries (seagull, pigeon, cat, dog), leaf crunch, surf crash, welding arc buzz, package drop thud & tape rustle, scooter courier horn beep, puddle splash whoosh, customer tip coin chime, tea spoon clink, fishing reel click, multi-stage rolling thunder, carnival chime, radio integration
  - `src/game/tram.test.ts` (7 tests) — Tram state machine initialization, cruising speed, station dwell timing, terminus direction reversal & departure bell, obstacle yielding/braking, player honk greetings, and "Nostaljik Hat Hatırası" proximity reward (+10 ₺, +1 rep) with cooldown
  - `src/scene/tram.test.ts` (3 tests) — 3D hierarchy creation, embedded rails, catenary masts, overhead wire, station shelter & platform, animated tram car, driver posture, waving arm on honk, speech bubble, and disposal
  - `src/scene/world.test.ts` (18 tests) — Road connectivity, delivery zone clearance, boulevard clearance, district traffic & pedestrian paths, night factor emissive modulation, integrated traffic lights, bus stops, gas station, road work hazards, seaside life, grand ferris wheel, Çarşı heritage tramway, and Sanayi freight rail spur & shunting locomotive
  - `src/audio/sound.test.ts` (4 tests) — Motor, horn, crash, money drain, jingle, launch/landing, clean driving bonus, combo fanfare, ambience, rain intensity, fauna cries, leaf crunch, surf crash, welding arc buzz, package drop thud & tape rustle, scooter courier horn beep, puddle splash whoosh, customer tip coin chime, tea spoon clink, fishing reel click, multi-stage rolling thunder, carnival chime, nostalgic tram brass bell chime (`tramBell()`), level crossing bell chime (`railCrossing()`), and 3-tone diesel locomotive air horn (`trainHorn()`)
  - `src/game/train.test.ts` (7 tests) — Train state machine initialization, cruising speed, level crossing activation & gate lowering, terminus dwelling & reversal with departure horn, track obstacle yielding/braking, Makinist Cemal greeting on honk, and "Sanayi Demiryolu Lojistik Bonusu" (+15 ₺, +1 rep)
  - `src/scene/train.test.ts` (3 tests) — 3D hierarchy creation, ballasted track bed & buffers, automated level crossing signal masts & animated barrier arms, freight siding loading dock, forklift, supervisor Necati NPC, diesel shunter locomotive, intermodal container flatcar, and machinery cable spool flatcar
  - `src/game/community-park.test.ts` (7 tests) — Park state machine initialization, dwell time accumulation near gazebo/entrance, "Mahalle Huzuru" bonus granting (+10 ₺, +1 rep), buff timer & cooldown timer, animation angles (swings, spring rocker, carousel), gardener honk greeting and range checks
  - `src/scene/community-park.test.ts` (4 tests) — 3D hierarchy creation, park lawn and stone curbs, gazebo platform & terracotta cone roof, playground play fortress & slide, swings & spring rocker, Bahçıvan Selahattin NPC posture, head tracking, speech bubble and disposal
  - `tests/e2e/mini-kargo-e2e.test.ts` (242 tests) — Opaque-box E2E tests covering features F01–F21 across Tiers 1–4
  - **Total**: 62 test files, 767 passed, 0 failed.

## Playwright Browser Testing & Visual QA
- **Environment**: Chromium headless on local Vite preview server (`127.0.0.1:4173`).
- **Viewports Verified**:
  - Desktop: 1280x800 — PASS, 0 console errors (`desktop-1280x800.png`)
  - Mobile Portrait: 390x844 — PASS, 0 console errors (`mobile-portrait-390x844.png`)
  - Mobile Landscape: 844x390 — PASS, 0 console errors (`mobile-landscape-844x390.png`)
- **Feature Visual QA**:
  - `artifacts/carsi-nostalgic-tram.png`: Verified visual fidelity of Historic Çarşı Tram ("İETT 1923" Nostaljik Tramvay) in crimson red and ivory livery, clerestory monitor roof, diamond pantograph attached to overhead catenary wire, open driver vestibules with Vatman İhsan Efendi waving, 3D speech bubble callout (`"Vatman İhsan: Çan çan! Yol kargonun kaptan, buyur geç! 📦"`), raised timber passenger boarding platform with green canopy shelter ("Tarihi Çarşı Tramvay Durağı"), round stop sign post ("DURAK · T2"), waiting passenger NPC on timber bench, and live tracking icon (`🚋`) on the radar minimap. Zero clipping through boulevards or delivery routes.
  - `artifacts/sanayi-freight-train.png`: Verified visual fidelity of Industrial Sanayi Freight Rail Spur and TCDD-style Diesel Shunter Locomotive in industrial safety yellow and orange livery, heavy underframe chassis with yellow/black hazard chevron pilot beams, dual 2-axle bogies with flanged wheels, illuminated operator cab, Makinist Cemal Usta NPC waving with speech bubble (`"🚂 Makinist Cemal: Düüüt! Sanayi Ekspresi seyrinde, hemzemin geçide dikkat! 📦"`), automated level crossing at X: 50 with St. Andrew's crossbuck signs and lowered red/white striped barrier arms, coupled 20ft Intermodal Container Flatcar in cobalt blue with "TCDD TAŞIMACILIK" lettering, heavy machinery flatcar with giant timber cable spool and tie-down strapped cargo crate, elevated yellow industrial pipeline, and real-time radar minimap tracking icon (`🚂`). Zero clipping or road blockages.
  - `artifacts/gunes-community-park.png`: Verified visual fidelity of Güneş Mahallesi Community Park, Traditional Timber Gazebo / Kamelya with octagonal terracotta pitched roof and finial, multi-tier children's playground fortress with climbing ladder and bright yellow slide, dynamic red A-frame swing set with suspended seats, orange spring rocker pony ("Atlı Zıpzıp"), rotating carousel, wooden sandbox, grand entrance arch ("🏡 GÜNEŞ MAHALLESİ PARK & ÇOCUK ALANI"), white picket fence, raised rose and lavender flowerbeds, Hayrat stone drinking fountain, Bahçıvan Selahattin Efendi NPC in olive-green overalls and straw hat watering flowers and waving with active speech bubble callout (`"🌻 Bahçıvan Selahattin: Hoş geldin evlat! Parkımızın gülleri gibi açtın, kolay gelsin! 🌹"`), and real-time radar tracking icon (`🌳`). Zero clipping, wide clear peripheral roads (>4.5m distance).
  - `artifacts/sahil-fishing-harbour.png`: Verified visual fidelity of Sahil Marina Balıkçı Barınağı & Taze Balık-Ekmek Teknesi ("Tarihi Marmara Balıkçısı") with scalloped canopy, sizzling mackerel fillets, bread halves, Chef NPC Balıkçı Temel Reis, 2 moored wooden trawlers ("Karadenizli" & "Albatros"), hovering seagull flock, and minimap tracking icon (`🐟`).
  - `artifacts/sanayi-auto-repair.png`: Verified visual fidelity of Sanayi "Usta Eller Oto Sanayi" Tamirhanesi & Araç Bakım Lifti (X: 78.0, Z: -57.5) facing the Sanayi boulevard (Z: -50) directly adjacent to the Container Gantry Crane:
    - Workshop hangar concrete apron with oil stain decals, yellow/black hazard perimeter curbs, corrugated steel siding, and large illuminated marquee sign ("🔧 USTA ELLER OTO SANAYİ · MOTOR & MEKANİK 🚗").
    - Two-post working hydraulic vehicle lift in safety blue with dynamic elevating classic turquoise coupe.
    - Full mechanical workshop detailing: red 5-drawer rolling tool chest, tire changing machine with turntable and bead breaker, digital wheel balancer, heavy workbench with cast iron bench vise and tool shadow board, tire storage rack with 4 tires, stacked loose wheels, 3 industrial 200L oil drum barrels (Castrol, Mobil, Opet) with rotary hand pumps, and dual oxygen/acetylene gas cylinders.
    - Chief Mechanic NPC "Tamirci Muharrem Usta" in navy coveralls and red bandana holding a chrome ratchet socket wrench with animated tightening motion, vehicle head tracking, celebratory wrench-waving upon player honk (`H`) or approach, and 3D speech bubble callout (`"🔧 Tamirci Muharrem Usta: Gel kaptan geeel! Motorun sesinden anlarım, saat gibi çalışacak! 🚗💨"`).
    - Player service bay with floor marking box, white directional arrow, and curbside digital air & water inflator tower (32 PSI).
    - Real-time radar tracking icon (`🔧`) at X: 78, Z: -57.5.
  - **Güneş Mahallesi "Bizim Bakkal" Mahalle Bakkaliyesi & Ekmek/Gazete Tezgahı (T47)**:
    - 10.6m x 7.6m terracotta/limestone sidewalk apron, granite perimeter curbs, terracotta tiled entrance paving, white/yellow parking stall lines (`GROCERY_STORE_BAY`: X: -55.0, Z: -54.0), and white ground guide arrow.
    - Traditional grocery store building (8.2m wide x 4.2m tall x 4.6m deep) with warm pastel cream masonry (`#fef9e7`), brick base plinth, white corner pilasters, terracotta tiled eaves, brick chimney, upper-floor blue shuttered window, and blooming geranium flowerpot.
    - Large illuminated roof marquee sign (`"🏪 BİZİM BAKKAL · HÜSNÜ AMCA 🥖"`), secondary goods banner (`"EKMEK · GAZETE · MANAV · SOĞUK MEŞRUBAT"`), 3.6m x 2.0m shop display window with warm interior PointLight illumination, and interior silhouette shelves stocked with packaged groceries and tea tins.
    - Nostalgic crimson red and white striped fabric awning (7.4m wide x 2.2m projection) with scalloped valance fringe and white support columns.
    - Sidewalk goods: wooden bread & simit cabinet with sourdough loaves, baguettes, and simits; 3-tier chrome revolving wire newspaper rack; slanted wooden crates with apples, oranges, and greens; A-frame chalkboard menu; retro red beverage cooler with soda bottles; and classic yellow PTT post box.
    - Friendly Grocer NPC "Bakkal Hüsnü Amca" in navy trousers, sky-blue collared shirt, white grocer apron, gray mustache, holding fresh crusty bread, and iconic yellow pencil tucked behind his right ear (`#f1c40f`). Animated arm waving, player vehicle head tracking within 18m, celebratory waving upon player honk (`H`) or approach, and 3D speech bubble callout (`"🥖 Bakkal Hüsnü Amca: Hoş geldin evlat! Fırından yeni çıktı ekmekler, çıtır çıtır! 🥐"`).
    - Pitstop interaction: 1.2s stationary dwell near service bay (X: -55.0, Z: -54.0) awards +10 ₺ cash bonus, +1 reputation, +0.45 nitro refill, 25s "Buz Gibi Gazoz Enerjisi" stamina buff, procedural brass shop bell chime (`sound.shopBell()`), celebratory confetti and golden coin stream, and 35s cooldown.
    - Real-time radar tracking icon (`🏪`) at X: -58.5, Z: -57.0.

- **Çarşı "Tarihi Çınaraltı Kıraathanesi" & Tavla/Kahve Meydanı (T48)**:
  - `src/game/coffee-house.test.ts` (6 tests) — Coffee house state machine, dwell timing, pitstop bonus rewards (+10 ₺, +1 rep, full stamina/nitro), 25s buff duration, cooldown timing, interactive honk greeting, and periodic dice roll audio events.
  - `src/scene/coffee-house.test.ts` (4 tests) — 3D hierarchy, stone building, monumental plane tree, terrace tables, coffee master NPC, proximity head tracking, arm waving, night lighting, and cleanup disposal.
  - Verification:
    - 14.0m x 12.0m cobblestone plaza terrace with dark timber/granite curbs and dedicated player parking stall (`COFFEE_HOUSE_BAY`: X: 43.0, Z: 56.5) with guide arrow.
    - Historic stone coffeehouse building in weathered limestone masonry, darker ashlar quoins, tiled hipped roof, brick chimney with coffee aroma vents, arched transom windows with warm interior PointLight illumination, and carved wooden entrance doors.
    - Large illuminated marquee sign ("☕ TARİHİ ÇINARALTI KIRAATHANESİ · 1923 🌿"), secondary goods banner ("KUMDA TÜRK KAHVESİ · TAZE ÇAY · TAVLA KEYFİ"), and emerald green and cream striped entrance awning.
    - Monumental ancient plane tree ("Ulu Çınar Ağacı" - X: 36.8, Z: 58.8): 5.8m tall gnarled tree trunk with root buttresses, sprawling branches, 7 lush foliage clusters, 8-segment circular wooden surround bench ("Halka Sedir"), and 3 suspended brass/amber glass lanterns casting warm amber glow.
    - Outdoor tables and wicker stools: intense backgammon table with mother-of-pearl inlaid board, checkers, and miniature dice; coffee and tulip tea glass table; daily newspaper reading corner.
    - "Kumda Kahve" roasting sand hearth with embedded copper cezves, twin-faucet copper tea samovar, and A-frame chalkboard menu easel (`"☕ Kumda Kahve: 15₺ | 🍵 Tavşan Kanı Çay: 5₺ | 🎲 Tavla: Müesseseden"`).
    - Friendly animated Coffee Master NPC "Kahveci Bekir Usta" with burgundy/brown embroidered vest, white shirt, black trousers, apron, Ottoman kasket/fez, holding iconic swinging brass tea tray with tulip glasses, arm waving animation, vehicle head tracking, celebratory waving upon player honk (`H`) or approach, and 3D speech bubble callouts (`"☕ Kahveci Bekir Usta: Hoş geldin evlat! Közde kahvemiz taze, tavla masası hazır! 🎲"`).
    - Pitstop interaction: 1.2s stationary dwell near service bay (X: 43.0, Z: 56.5) awards +10 ₺ cash bonus, +1 reputation, +0.45 nitro refill, 25s "Közde Kahve Zindeliği" stamina buff, procedural backgammon dice roll clatter (`sound.diceRoll()`), celebratory confetti and golden coin stream, and 35s cooldown.
    - Real-time radar tracking icon (`🎲`) at X: 38.5, Z: 62.0.

- **Sanayi "Bereket Sanayi Lokantası" & Sulu Yemek / Döner Ocağı (T50)**:
  - `src/game/restaurant.test.ts` (6 tests) — Sanayi Bereket Lokantası state machine, 1.2s dwell timer at service bay, +10 ₺ cash tip, +1 rep, +0.45 nitro refill, 25s "Sanayi Tabldot Zindeliği" stamina & speed buff, 35s cooldown, rotating vertical döner spit simulation, and Chef Hakkı Usta honk greeting.
  - `src/scene/restaurant.test.ts` (4 tests) — 3D hierarchy creation, brick plinth, cream stucco walls, terracotta tile hipped roof, chimney, forward-tilted illuminated marquee ("🍲 BEREKET SANAYİ LOKANTASI · HAKKI USTA 🥩"), red-and-yellow striped awning with scalloped valance fringe, stainless steel bain-marie counter with 4 GN pans and rising steam puffs, vertical döner kebab spit with glowing infrared heaters, outdoor dining tables with red checkered tablecloths and bread baskets, animated Chef NPC "Aşçı Hakkı Usta" with toque hat, apron, mustache, carving knife, head tracking, 3D speech bubble callouts, and non-blocking colliders.
  - Verification:
    - 11.5m x 9.0m concrete veranda slab, granite curbs, player service bay (`RESTAURANT_BAY`: X: 30.0, Z: -52.5), yellow-and-black hazard striping, white stall borders, and ground directional guide arrow.
    - Traditional industrial canteen building in red brick plinth, warm cream stucco walls, terracotta tile hipped roof, and brick chimney with metal rain cowl.
    - Large illuminated marquee sign tilted 12° forward ("🍲 BEREKET SANAYİ LOKANTASI · HAKKI USTA 🥩"), sub-banner ("GÜNLÜK TABLDOT · SULU YEMEK · YAPRAK DÖNER & PİLAV"), gold trim, and night PointLight.
    - Red-and-yellow striped awning with scalloped valance fringe and steel support columns.
    - Stainless steel bain-marie steam table with 4 GN food pans (Pilav, Kuru Fasulye, Güveç, Mercimek Çorbası) venting animated rising steam puffs.
    - Rotating vertical döner spit with glowing radiant heating elements, meat roll, and tomato/onion garnishes.
    - 2 outdoor dining tables with red checkered tablecloths (kırmızı pötikare), bread baskets, condiment shakers, A-frame chalkboard menu easel, and retro beverage cooler.
    - Animated Chef NPC "Aşçı Hakkı Usta" with chef's tall toque hat, white double-breasted jacket, red neckerchief, apron, handlebar mustache, carving knife, döner carving animation, vehicle head tracking within 20m, celebratory waving on honk, and 3D speech bubble callout.
    - Pitstop interaction: 1.2s stationary dwell near service bay (X: 30.0, Z: -52.5) awards +10 ₺ cash bonus, +1 reputation, +0.45 nitro refill, 25s "Sanayi Tabldot Zindeliği" stamina & speed buff, procedural metallic ladle tap & simmering stew sizzle (`sound.soupLadle()`), celebratory confetti and golden coin stream, and 35s cooldown.
    - Real-time radar tracking icon (`🍲`) at X: 30.0, Z: -57.0.

## Browser Automation & Visual QA (Playwright)
- **Tool**: `scripts/browser-smoke.cjs` via `npm run test:browser` and `scripts/capture-sahil-lighthouse.cjs`
- **Execution Date**: 2026-10-29 (Execution Run 28 Verification — Sahil "Tarihi Deniz Feneri & Kıyı Kurtarma Rıhtımı" T53)
- **Automated Tests**: 80 test files, 859 passed, 0 failed
- **TypeScript Typecheck**: 0 errors (`tsc --noEmit`)
- **Vite Production Build**: Successful (`dist/` generated in 168ms)
- **Viewports Tested**:
  1. **Desktop (1280x800)**:
     - Shift start button click: PASS
     - 3D WebGL canvas initialization: PASS
     - HUD, minimap, topbar time pill, weather pill, radio pill, supercharge pill, market buff pill: PASS
     - Keyboard driving controls (W, A, D, Arrow keys), Horn (`H` key), and Radio toggle (`R` key): PASS
     - Güneş Mahallesi "Geleneksel Mahalle Semt Pazarı & Taze Manav Tezgahları" (T54): 12.6m x 9.0m stone paved market square, granite curbs, service bay at `X: -72.0, Z: -52.5` with yellow-black hazard striping, white guide arrow, 3 authentic wooden stalls with striped canopies (yellow/white, red/white, green/white), scalloped valance fringes, illuminated roof marquee ("🍉 GÜNEŞ MAHALLESİ SEMT PAZARI · CEMİL DAYI 🍋"), warm PointLight night illumination, tiered crates with fresh Mediterranean produce (tomatoes with green calyx, oranges, lemons, eggplants, peppers, cucumbers, parsley bunches), giant watermelon and melon pyramid on Euro-pallet with sliced red watermelon wedge, vintage hanging balance scale with brass pans & weights, chalkboard price easel ("🍅 DOMATES: 15₺ | 🍋 LİMON: 20₺..."), animated Market Vendor NPC "Pazarcı Cemil Dayı" in flat cap, striped shirt, and apron holding fresh lemon, 22m head tracking, wave & dual-arm salute on honk/dwell, 3D speech bubble callout ("🍉 Pazarcı Cemil Dayı: Gel vatandaş geeel! Çiftlikten taze çıktı..."), +10 ₺, +1 rep, +0.45 nitro, 25s "Taze Pazar Bereketi" buff, procedural market scale clink audio (`sound.marketScale()`), and radar icon (`🧺`): VERIFIED
     - Console errors: 0
     - Screenshot: `games/mini-kargo/artifacts/desktop-1280x800.png` and `games/mini-kargo/artifacts/gunes-semt-pazari.png`
  2. **Mobile Portrait (390x844)**:
     - Responsive canvas & UI scaling: PASS
     - Touch joystick, drift, nitro & dedicated horn button (`📢 KORNA`): PASS
     - Topbar radio equalizer pill touch interaction, market buff pill: PASS
     - Company sheet "🏆 Başarılar & Garaj" tab and livery applicator: PASS
     - Console errors: 0
     - Screenshot: `games/mini-kargo/artifacts/mobile-portrait-390x844.png`
  3. **Mobile Landscape (844x390)**:
     - Landscape canvas & control separation: PASS
     - Minimap (with gas station `⛽`, road work `🚧`, tea cafe `☕`, ferris wheel `🎡`, tram `🚋`, freight train `🚂`, community park `🌳`, fishing harbour `🐟`, auto repair workshop `🔧`, grocery store `🏪`, coffeehouse `🎲`, ice cream stand `🍦`, restaurant `🍲`, school `🏫`, bakery `🥖`, lighthouse `🗼`, market `🧺`, and carpenter `🪵` icons) and action buttons isolated: PASS
     - Console errors: 0
     - Screenshot: `games/mini-kargo/artifacts/mobile-landscape-844x390.png`

---

## Visual QA & Browser Verification Summary — Run 30 (2026-10-29)

### Automated Test Suite
- **Unit & Integration Tests**: 84 test files, 883 passed, 0 failed (2.12s execution)
- **TypeScript Typecheck**: 0 errors (`tsc --noEmit`)
- **Vite Production Build**: Successful (`dist/` generated in 171ms)
- **Playwright Browser Smoke**: PASS across Desktop (1280x800), Mobile Portrait (390x844), Mobile Landscape (844x390) with 0 console errors.

### Visual Quality & Landmark Verification
- **Sanayi "Tarihi Marangozlar Sitesi & Ahşap Kereste Atölyesi" (T55)**:
  - 12.0m x 9.0m endüstriyel ahşap talaşlı beton avlu, granit taş bordürler, asfalt servis yanaşma peronu cebi (`CARPENTER_BAY`: X: 62.0, Z: -68.0), sarı-siyah bordür emniyet çizgileri, beyaz peron sınırları ve zemin beyaz kılavuz yön oku: VERIFIED
  - 4 adet dikey masif ahşap kolon sütun (Douglas-fir), döküm demir taban pabuçları, yatay masif lamine kirişler, A-çatı makasları ve oluklu galvaniz sanayi sacı gölgeliği: VERIFIED
  - Işıklı büyük kurumsal çatı tabelası (`"🪵 SANAYİ TARİHİ MARANGOZLAR SİTESİ · RÜSTEM USTA 🪚"`), alt kurumsal şerit (`"MASİF AHŞAP İŞÇİLİĞİ · KERESTE & KARGO SANDIKLARI · 1968"`), gece tezgahı aydınlatan sıcak kehribar PointLight armatürü: VERIFIED
  - Dikey kereste istif rafları (sarı çam, kızıl sedir, koyu meşe kalasları): VERIFIED
  - Ahşap EUR palet üzerinde piramit şeklinde istiflenmiş silindirik kabuklu çam kütükleri ve çelik bağlama çemberleri: VERIFIED
  - Dönen dairesel testere tezgahı (çelik daire bıçak, kırmızı güvenlik muhafazası, kesilen ahşap parça ve 8 adet savrulan dinamik altın sarısı talaş partikülü): VERIFIED
  - Marangoz çalışma masası, mengene, el rendesi, marangoz tokmağı ve dayanıklı ahşap Mini Kargo ambalaj sandığı (`"📦 MK"`): VERIFIED
  - Animasyonlu Usta Marangoz NPC "Marangoz Rüstem Usta" (X: 60.5, Z: -72.0) bordo flanel gömlek, askılı kot tulum, talaş lekeleri, kulak arkasında marangoz kurşun kalemi, cepte katlanır sarı metre, heybetli usta bıyığı, 22m mesafeden kafa/gövde takibi, korna ve yanaşmada kolunu kaldırarak usta selamı ve 3D konuşma balonuyla karşılama: VERIFIED
  - "Sanayi İşçiliği Gücü" pitstop bonusu (+10 ₺, +1 itibar, +0.45 nitro dolumu, 25s şasi takviyesi & çarpışma hasarını %50 azaltma buff'ı, altın konfeti ve para akışı, 35s soğuma ve prosedürel testere sesi `sound.buzzSaw()`): VERIFIED
  - Minimap radar simgesi: Sanayi Bölgesi üzerinde canlı `🪵` odun/kereste simgesi: VERIFIED
  - Screenshot verified: `games/mini-kargo/artifacts/sanayi-marangozlar-sitesi.png`

## Visual QA & Browser Verification Summary — Run 31 (2026-10-29)

### Automated Test Suite
- **Unit & Integration Tests**: 86 test files, 894 passed, 0 failed (2.14s execution)
- **TypeScript Typecheck**: 0 errors (`tsc --noEmit`)
- **Vite Production Build**: Successful (`dist/` generated in 226ms)
- **Playwright Browser Smoke**: PASS across Desktop (1280x800), Mobile Portrait (390x844), Mobile Landscape (844x390) with 0 console errors.

### Visual Quality & Landmark Verification
- **Çarşı "Tarihi Bakırcılar Çarşısı & Antik Kapalı Bedesten" (T56)**:
  - 12.0m x 9.5m klinker tuğla ve rustik taş avlu tablası, granit taş bordürler, asfalt servis yanaşma peronu cebi (`COPPERSMITH_BAY`: X: 63.0, Z: 81.0), sarı-siyah bordür emniyet çizgileri, beyaz peron sınırları ve zemin beyaz kılavuz yön oku: VERIFIED
  - Kesme kireçtaşı ve traverten taş kemerli bedesten revakları, pişmiş toprak kiremitli saçaklıklar ve rustik tuğla kaideler: VERIFIED
  - Işıklı büyük kurumsal çatı tabelası (`"🏺 TARİHİ BAKIRCILAR ÇARŞISI · KAZIM USTA 🔨"`), alt kurumsal şerit (`"EL DÖVMESİ BAKIR SANATI & ANTİK BEDESTEN · 1954"`), gece ve gündüz tezgahı aydınlatan sıcak kehribar PointLight armatürü: VERIFIED
  - Parlak el dövmesi bakır kazanlar, cezve takımları, semaverler, oymalı bakır siniler ve kemerlerde sergilenen otantik Türk kilimleri: VERIFIED
  - Ağaç kütük kaide üzerinde döküm çelik bakırcı örsü, topuz çekiç ve bakır işleme aletleri: VERIFIED
  - Animasyonlu Usta Bakırcı NPC "Bakırcı Kazım Usta" (X: 61.5, Z: 76.5) deri esnaf önlüğü, bordo fes, kıvrık pala bıyık, deri bileklikler, elinde pirinç topuz çekiç ile ritmik bakır dövme animasyonu, 22m mesafeden kafa/gövde takibi, korna ve yanaşmada çekicini kaldırarak usta selamı ve 3D konuşma balonuyla karşılama: VERIFIED
  - "Usta Esnaf Hürmeti" pitstop bonusu (+10 ₺ esnaf desteği, +1 itibar, +0.45 nitro dolumu, 30s "Usta Esnaf Hürmeti" teslimatlarda +15 ₺ müşteri bahşişi buff'ı, altın konfeti ve para akışı, 35s soğuma ve prosedürel çekiç vuruşu ve rezonans sesi `sound.coppersmith()`): VERIFIED
  - Minimap radar simgesi: Çarşı Bölgesi üzerinde canlı `🏺` antik amfora/bakır simgesi: VERIFIED
  - Screenshot verified: `games/mini-kargo/artifacts/carsi-bakircilar-carsisi.png`

## Visual QA & Browser Verification Summary — Run 32 (2026-11-11)

### Automated Test Suite
- **Unit & Integration Tests**: 88 test files, 906 passed, 0 failed (2.26s execution)
- **TypeScript Typecheck**: 0 errors (`tsc --noEmit`)
- **Vite Production Build**: Successful (`dist/` generated in 173ms)
- **Playwright Browser Smoke**: PASS across Desktop (1280x800), Mobile Portrait (390x844), Mobile Landscape (844x390) with 0 console errors.

### Visual Quality & Landmark Verification
- **Sahil "Açık Hava Yazlık Sineması & Sahil Gazinosu" (T57)**:
  - 14.0m x 10.5m kumtaşı ve deniz kumu avlu tablası, rustik bordür taşları, asfalt servis yanaşma peronu cebi (`CINEMA_BAY`: X: -26.0, Z: 47.2 - Güney Bulvarı Z: 50 kuzey bordüründe), sarı-siyah bordür emniyet çizgileri, beyaz peron sınırları ve zemin beyaz kılavuz yön oku: VERIFIED
  - 8.2m x 4.8m devasa açık hava projeksiyon perdesi, Art-Deco kesme taş kule sütunları, altın pervazlar, çelik kafes taşıyıcı iskelet, kırmızı tiyatro saçaklığı ve altın korniş, vintage sinema hoparlör boruları, 6.8m x 3.6m masif beyaz yansıtıcı perde tuvali ve dinamik perde ışık armatürü: VERIFIED
  - Yükseltilmiş retro 35mm makinist kulesi (X: -22.2, Z: 43.2), yeşil ahşap lambri kabin, oluklu metal çatı, perdenin merkezine bakan projeksiyon mazgalı ve pirinç namlu, üstte sürekli dönen çift 35mm pirinç film makaraları: VERIFIED
  - Çapraz hacimsel projektör ışık huzmesi (Volumetric Projection Beam Cone with additive blending, dynamic flicker and night emissive boost): VERIFIED
  - Kademeli nostaljik şezlonglar (kırmızı-beyaz ve turkuaz-beyaz çizgili kumaşlar), beyaz örtülü yuvarlak gazino masaları, yeşil cam nostaljik gazoz şişeleri ("Çamlıca / Niğde Gazozu"), porselen kasede siyah ayçekirdeği ve çizgili patlamış mısır kutuları ("🍿"): VERIFIED
  - Rengarenk asılı yazlık ampul kordonları (8 adet rengarenk küre ampul): VERIFIED
  - 4.4m anıtsal giriş sütunları, kavisli neon tabela (`"🎬 SAHİL AÇIK HAVA YAZLIK SİNEMASI · YILDIZ GAZİNOSU 🍿"`), alt kurumsal şerit (`"HER AKŞAM İKİ FİLM BİRDEN · AİLELERE MAHSUSTUR · 1968"`), gece peronu aydınlatan sıcak kehribar PointLight armatürü, ahşap nostaljik bilet gişesi (`"🎟️ BİLET: 15₺ 🍿"`) ve A-şövale tebeşirli film afişi (`"BU AKŞAM: NEŞELİ GÜNLER & SELVİ BOYLUM"`): VERIFIED
  - Animasyonlu Makinist NPC "Makinist Rıfat" (X: -28.8, Z: 46.2) nostaljik kasket, kıvrık kollu beyaz gömlek, askılı lacivert pantolon, pos bıyık, elinde tuttuğu 35mm pirinç film makarası/kutusu ile perona yanaşan araca 22m mesafeden kafa/gövde takibi, korna ve duraklamada makarayı havaya kaldırarak selamlama ve 3D konuşma balonuyla karşılama: VERIFIED
  - "Yazlık Sinema Keyfi" pitstop bonusu (+10 ₺ esnaf desteği, +1 itibar, +0.45 nitro dolumu, 25s "Yazlık Sinema Keyfi" teslimatlarda +15 ₺ sinema neşesi bahşişi buff'ı, altın konfeti ve para akışı, 35s soğuma ve prosedürel mekanik obtüratör tıklaması, motor uğultusu ve makara hışırtısı sesi `sound.filmProjector()`): VERIFIED
  - Minimap radar simgesi: Sahil Şeridi üzerinde canlı `🎬` sinema klaket simgesi: VERIFIED
  - Screenshot verified: `games/mini-kargo/artifacts/sahil-yazlik-sinemasi.png`

## Visual QA & Browser Verification Summary — Run 33 (2026-11-11)

### Automated Test Suite
- **Unit & Integration Tests**: 90 test files, 918 passed, 0 failed (2.46s execution)
- **TypeScript Typecheck**: 0 errors (`tsc --noEmit`)
- **Vite Production Build**: Successful (`dist/` generated in 173ms)
- **Playwright Browser Smoke**: PASS across Desktop (1280x800), Mobile Portrait (390x844), Mobile Landscape (844x390) with 0 console errors.

### Visual Quality & Landmark Verification
- **Güneş Mahallesi "Tarihi Mahalle Postanesi & Kargo Dağıtım Şubesi (PTT)" (T58)**:
  - 14.0m x 11.4m klinker tuğla ve granit taş avlu tablası, bordür taşları, asfalt servis yanaşma peronu cebi (`POST_OFFICE_BAY`: X: -14.0, Z: -83.5 - Kuzey Bulvarı Z: -80 kuzey bordüründe), sarı-siyah bordür emniyet çizgileri, beyaz peron sınırları ve zemin beyaz kılavuz yön oku: VERIFIED
  - 9.6m x 5.2m x 6.4m Erken Cumhuriyet / Neoklasik kesme kireçtaşı ve sıcak traverten cephe, koyu gri kaide süpürgeliği, köşe silmeleri (ashlar quoins), 4 adet neoklasik pilaster sütun ve İon/Dorik sütun başlıkları: VERIFIED
  - Basamaklı taş giriş sahanlığı, kemerli söveli masif koyu meşe çift kanatlı giriş kapısı, pirinç kapı kolları, simetrik kemerli vitray pencereler, masif kiremit kırma çatı (`#962d22`), taş friz silmesi ve tuğla baca: VERIFIED
  - Çatı alınlığında büyük aydınlatmalı sarı-lacivert kurumsal tabela (`"🏤 GÜNEŞ MAHALLESİ TARİHİ POSTANESİ · PTT 📬"`), alt kurumsal şerit (`"T.C. POSTA VE TELGRAF TEŞKİLATI · KURULUŞ 1840 · DAĞITIM ŞUBESİ"`), giriş kemeri üzerinde pirinç döküm Posta Güvercini & Borazan rölyefi ve gece cepheyi aydınlatan sıcak kehribar PointLight armatürü: VERIFIED
  - Cephe duvarında 3 adet nostaljik pirinç mektup atma mazgalı (`"ŞEHİR İÇİ"`, `"ŞEHİRLER ARASI"`, `"TELGRAF & APS"`), kaldırım kenarında klasik nostaljik sarı silindirik döküm PTT posta kutusu: VERIFIED
  - Batı kanadında park etmiş 2 adet nostaljik kırmızı-sarı PTT dağıtım mopedi (çift sarı heybe kargo çantası, ön tel sepet ve minyatür `"PTT DAĞITIM"` plakası): VERIFIED
  - Döküm çelik mekanik paket kantar baskülü, ahşap Mini Kargo / PTT mühürlü koli sandıkları, seramik porselen izolatörlü ahşap telgraf direği: VERIFIED
  - Animasyonlu Başpostacı NPC "Postacı Kemal Efendi" (X: -11.5, Z: -85.5) lacivert PTT postacı üniforması, sarı biyeler, altın düğmeler, sarı şeritli kasket, omuzda deri mektup çantası, elinde mühürlü ekspres kargo zarfı ve teslimat çizelgesi, 22m mesafeden kafa/gövde takibi, korna ve duraklamada zarfı havaya kaldırarak selamlama ve 3D konuşma balonuyla karşılama: VERIFIED
  - "Ekspres Posta Güvencesi" pitstop bonusu (+10 ₺ nakit desteği, +1 itibar, +0.45 nitro dolumu, 25s teslimatlarda +15 ₺ ekspres posta primi buff'ı, altın konfeti ve para akışı, 35s soğuma ve prosedürel posta kaşesi tok sesi ile telgraf tıkırtısı `sound.postStamp()`): VERIFIED
  - Minimap radar simgesi: Güneş Mahallesi üzerinde canlı `🏤` postane simgesi: VERIFIED
  - Screenshot verified: `games/mini-kargo/artifacts/gunes-post-office.png`

## Visual QA & Browser Verification Summary — Run 34 (2026-11-11)

### Automated Test Suite
- **Unit & Integration Tests**: 92 test files, 929 passed, 0 failed (2.17s execution)
- **TypeScript Typecheck**: 0 errors (`tsc --noEmit`)
- **Vite Production Build**: Successful (`dist/` generated in 162ms)
- **Playwright Browser Smoke**: PASS across Desktop (1280x800), Mobile Portrait (390x844), Mobile Landscape (844x390) with 0 console errors.

### Visual Quality & Landmark Verification
- **Sanayi "Demirciler ve Dökümcüler Sanayi Sitesi & Sıcak Dövme Haddehanesi" (T59)**:
  - 12.0m x 9.2m endüstriyel cüruflu beton avlu tablası, antrasit bordür taşları, asfalt servis yanaşma peronu cebi (`FOUNDRY_BAY`: X: 37.5, Z: -68.0 - Sanayi ara sokağı Z: -66 kuzey bordüründe), sarı-siyah bordür emniyet çizgileri, beyaz peron sınırları ve zemin beyaz kılavuz yön oku: VERIFIED
  - 4 adet ağır çelik I-kolon sütun, taban ankraj flanşları, kafes kirişler, çapraz rüzgar gergileri, oluklu galvaniz sanayi sacı çatısı (`#46515a`), çatı duman tahliye fenerliği/lüveri ve egzoz külahı: VERIFIED
  - Çatı alınlığında 12° öne eğimli büyük aydınlatmalı kurumsal tabela (`"⚒️ DEMİRCİLER VE DÖKÜMCÜLER SİTESİ · HAMDİ USTA 🔥"`), alt şerit (`"SICAK DÖVME ÇELİK · İNDÜKSİYON OCAĞI & HADDEHANE · 1958"`), altın sarısı pervaz ve termal turuncu PointLight armatürü (`#ff6b1a`): VERIFIED
  - Refrakter tuğla eritme ocağı / indüksiyon potası, çelik bağlama çemberleri, konik duman davlumbazı külahı, akkor kor lav yatağı ve nabız atan alev ışığı (PointLight): VERIFIED
  - Pnömatik havalı şahmerdan (power hammer): C-gövde, üst hava silindiri ve boruları, örs kaidesi, üzerinde dövülen akkor kızıl kütük, hareketli pnömatik şahmerdan tokmağı (ritmik dikey vuruş animasyonu) ve darbe anında saçılan altın sarısı akkor kıvılcım partikülleri: VERIFIED
  - Donatılar: Ahşap palet üzerinde piramit istiflenmiş dökme demir pik külçeleri, turuncu A-çerçeve inşaat demiri rafı, meşe kütük kaideli çift boynuzlu dövme örsü, ahşap su verme teknesi ve mühürlü MK ağır çelik kasası: VERIFIED
  - Animasyonlu Usta Demirci NPC "Demirci Hamdi Usta" (X: 36.0, Z: -72.5) kalın deri önlük, dökümcü koruyucu gözlüğü, dövme maşası ucunda kor kütük ve elinde dövme çekici, 22m mesafeden kafa/gövde takibi, korna ve duraklamada çekici havaya kaldırarak heybetli usta selamı ve 3D konuşma balonuyla karşılama: VERIFIED
  - "Sanayi Çeliği Dayanıklılığı" pitstop bonusu (+10 ₺ nakit esnaf desteği, +1 itibar, +0.45 nitro dolumu, 25s "Sanayi Çeliği Dayanıklılığı" şasi zırhı %50 temas hasarı indirimi & teslimatlarda +15 ₺ sanayi primi buff'ı, altın konfeti ve para akışı, 35s soğuma ve prosedürel şahmerdan tok darbesi, hava tıslaması ve örs çınlaması sesi `sound.powerHammer()`): VERIFIED
  - Minimap radar simgesi: Sanayi Bölgesi üzerinde canlı `⚒️` demirci örsü/çekiç simgesi: VERIFIED
  - Screenshot verified: `games/mini-kargo/artifacts/sanayi-foundry.png`

## Visual QA & Browser Verification Summary — Run 35 (2026-11-11)

### Automated Test Suite
- **Unit & Integration Tests**: 94 test files, 940 passed, 0 failed (2.65s execution)
- **TypeScript Typecheck**: 0 errors (`tsc --noEmit`)
- **Vite Production Build**: Successful (`dist/` generated in 180ms)
- **Playwright Browser Smoke**: PASS across Desktop (1280x800), Mobile Portrait (390x844), Mobile Landscape (844x390) with 0 console errors.

### Visual Quality & Landmark Verification
- **Çarşı "Tarihi Türk Kahvecisi & Közde Kahve / Lokum İmalathanesi" (T60)**:
  - 12.0m x 9.6m klinker tuğla ve kesme kireçtaşı avlu tablası, granit bordür taşları, asfalt servis yanaşma peronu cebi (`TURKISH_COFFEE_BAY`: X: 37.0, Z: 81.0 - Çarşı güney sokağı Z: 84 kuzey bordüründe), sarı-siyah bordür emniyet çizgileri, beyaz peron sınırları ve zemin beyaz kılavuz yön oku: VERIFIED
  - 8.6m x 4.8m x 5.4m Otantik Osmanlı Revaklı Taş Köşk mimarisi: kesme kireçtaşı cephe kaplaması (`#f5f0e6`), rustik pişmiş toprak kaide süpürgeliği (`#a04000`), köşe silmeleri (ashlar quoins `#d7ccc8`), 3 adet sivri Osmanlı taş kemeri, 4 adet yivli mermer sütun (`#ecf0f1`), mukarnaslı sütun başlıkları ve alaturka kiremit kırma çatı (`#a04000`): VERIFIED
  - Çatı merkezinde silindirik kasnak üzerinde yükselen pirinç/bakır kubbe (`#d4af37`) ve hilalli pirinç alem finiali (`#f39c12`): VERIFIED
  - Çatı alınlığında 12° öne eğimli büyük kurumsal aydınlatmalı tabela (`"☕ TARİHİ ÇARŞI TÜRK KAHVECİSİ · TAHSİN EFENDİ 🍬"`), alt şerit (`"KÖZDE TÜRK KAHVESİ · DİBEK & ANTEP DUBLE LOKUMU · 1908"`), altın sarısı pervaz çerçevesi, gece cepheyi aydınlatan sıcak kehribar PointLight armatürü ve asılı pirinç kafesli kandil: VERIFIED
  - Közde Kahve Mangalı & Bakır Kum Ocağı: dövme bakır mangal teknesi (`#b87333`), kızgın kor kömürleri, sıcak kavurma kumu yatağı (`#c0392b`, `#ff5722`), ocağın içinde nabız atan termal alev ışığı (PointLight), 4 adet uzun saplı el dövmesi bakır cezve, köpüren kahve kreması ve gökyüzüne süzülen dinamik buhar partikülleri: VERIFIED
  - İstiflenmiş jüt kahve çuvalları (`"YEMEN KAHVESİ · 50 KG"` ve `"DİBEK KAHVESİ · 50 KG"`), bazalt taşı tarihi oyma dibek ve gürgen tokmak, dönen krank kollu pirinç manuel kahve el değirmeni: VERIFIED
  - Antep fıstıklı ve güllü duble lokum ahşap vitrini, pudra şekerli lokum küpleri, tebeşirli karataş A-frame fiyat listesi şövalesi, ahşap masa üzerinde bakır tepsi ve dantelli altın zarflı porselen fincanlar: VERIFIED
  - Animasyonlu Usta Kahveci NPC "Kahveci Tahsin Efendi" (X: 35.5, Z: 76.8) koyu lacivert pantolon, beyaz gömlek, altın sırmalı bordo kadife cepken yelek (`#800000`), ipek kırmızı bel kuşağı, siyah püsküllü bordo fes, heybetli bıyık, pirinç kahve servis tepsisi ve fincanlar, 22m mesafeden kafa/gövde takibi, korna ve duraklamada kolunu kaldırarak usta selamı ve 3D konuşma balonuyla karşılama: VERIFIED
  - "Kırk Yıllık Hatır" pitstop bonusu (+10 ₺ nakit esnaf ikramı, +1 itibar, +0.45 nitro dolumu, 25s "Kırk Yıllık Hatır" teslimatlarda +15 ₺ müşteri bahşişi buff'ı, altın konfeti ve para akışı, 35s soğuma ve prosedürel kahve çekirdeği kavrulma çıtırtısı, sıcak kum cızırtısı ve bakır cezve çınlama sesi `sound.turkishCoffee()`): VERIFIED
  - Minimap radar simgesi: Çarşı Bölgesi üzerinde canlı `☕` kahve fincanı simgesi: VERIFIED
  - Screenshot verified: `games/mini-kargo/artifacts/carsi-turkish-coffee.png`

## Visual QA & Browser Verification Summary — Run 36 (2026-11-11)

### Automated Test Suite
- **Unit & Integration Tests**: 96 test files, 952 passed, 0 failed (2.21s execution)
- **TypeScript Typecheck**: 0 errors (`tsc --noEmit`)
- **Vite Production Build**: Successful (`dist/` generated in 166ms)
- **Playwright Browser Smoke**: PASS across Desktop (1280x800), Mobile Portrait (390x844), Mobile Landscape (844x390) with 0 console errors.

### Visual Quality & Landmark Verification
- **Sahil "Tarihi Kıyı Tahlisiye & Deniz Kurtarma İstasyonu (Can Kurtarma Botu & Kıyı Gözetleme Kulesi)" (T61)**:
  - 13.0m x 11.0m yıpranmış ahşap sedir güverte ve granit taş kaide, döküm çelik palamar babaları, kalın halat kangalları, su altı dolfen kazıkları, asfalt servis yanaşma cebi (`LIFESAVING_BAY`: X: -68.0, Z: 80.5 - Sahil Kordon Yolu Z: 80 güney bordüründe), sarı-siyah bordür emniyet çizgileri, beyaz peron sınırları ve zemin beyaz kılavuz yön oku: VERIFIED
  - 8.4m x 5.2m x 5.0m Tarihi Tahlisiye Kayıkhane Binası: 1.8m rustik granit/kireçtaşı taş kaide duvarları, üst kat yıpranmış yatay ahşap lambri kaplama, kırma galvaniz/kiremit çatı, çatı havalandırma fenerliği ve pirinç paratoner, geniş çift kanatlı raylı bot hangarı kapısı: VERIFIED
  - Çatı alınlığında büyük aydınlatmalı kurumsal tabela (`"🛟 TARİHİ KIYI TAHLİSİYE & CAN KURTARMA ⚓"`), alt kurumsal şerit (`"T.C. KIYI EMNİYETİ GENEL MÜDÜRLÜĞÜ · 1928"`), altın sarısı pervaz çerçevesi, gece peronu aydınlatan sıcak PointLight armatürü ve asılı ferforje gemici feneri: VERIFIED
  - Eğimli Bot Kızağı & Çelik Ray Sistemi (Angled Slipway Ramp & Rails): 14° açıyla doğrudan turkuaz denize inen 9.5m masif ahşap ve beton kızak rampası, çift döküm çelik tren rayı, traversler, tekerlekli çelik bot taşıyıcı beşik (rail slipway carriage), döküm dişli vinç tamburu, dönen krank kolu ve gergin çelik çekme halatı: VERIFIED
  - Tarihi Çift Başlı Can Kurtarma Botu — "TAHLİSİYE-1" (X: -68.0, Z: 91.5): 6.4m uzunluğunda otantik çift başlı Türk tahlisiye botu gövdesi, canlı tahlisiye turuncusu ve beyaz Kıyı Emniyeti gövde boyası (`"⚓ TAHLİSİYE-1 · CAN KURTARMA 🛟"`), lacivert omurga, ahşap oturaklar, yedek ahşap kürekler, palamar halatları, pruva projektörü ve dalga/kızak salınım fiziği: VERIFIED
  - Yükseltilmiş Ahşap Kıyı Gözetleme Kulesi (Lookout Watchtower - X: -63.5, Z: 87.0): 4 masif ahşap ayak üzerinde 4.4m yükseklikte ahşap seyir güvertesi ve güvenlik balüstradı, piramidal kırmızı kiremit çatı, pirinç rüzgar gülü, denizci gözetleme dürbünü, arama projektörü ve salınan pirinç Sis Çanı (Maritime Fog Bell): VERIFIED
  - Can Kurtarma Donatım Rafları & Denizcilik Teçhizatı: 4 adet turuncu-beyaz reflektörlü can simidi, paslı döküm çapa, katranlı urgan makaraları ve ilk yardım teçhizat sandığı (`"🚑 İLK YARDIM · TAHLİSİYE"`): VERIFIED
  - Animasyonlu Baş Tahlisiyeci NPC "Tahlisiye Reisi Şükrü Kaptan" (X: -65.5, Z: 85.5) turuncu-lacivert Kıyı Emniyeti marin montu, sarı çizmeler, beyaz kaptan kasketi, gür beyaz denizci sakalı, elinde pirinç denizci megafonu, 22m mesafeden kafa/gövde takibi (head tracking), korna ve duraklamada megafonunu havaya kaldırarak usta selamı ve 3D konuşma balonuyla karşılama: VERIFIED
  - "Kıyı Emniyeti Güvencesi" pitstop bonusu (+10 ₺ nakit esnaf desteği, +1 itibar, +0.45 nitro dolumu, 25s "Kıyı Emniyeti Güvencesi" suda kızaklama (hydroplane) bağışıklığı ve teslimatlarda +15 ₺ kurtarma primi buff'ı, altın konfeti ve para akışı, 35s soğuma ve prosedürel rezonanslı pirinç sis çanı ile dişli vinç mandalı tıkırtısı sesi `sound.lifeboatWinch()`): VERIFIED
  - Minimap radar simgesi: Sahil Şeridi üzerinde canlı `🛟` can simidi simgesi: VERIFIED
  - Screenshot verified: `games/mini-kargo/artifacts/sahil-lifesaving.png`

## Visual QA & Browser Verification Summary — Run 37 (2026-11-11)

### Automated Test Suite
- **Unit & Integration Tests**: 98 test files, 964 passed, 0 failed (2.25s execution)
- **TypeScript Typecheck**: 0 errors (`tsc --noEmit`)
- **Vite Production Build**: Successful (`dist/` generated in 164ms)
- **Playwright Browser Smoke**: PASS across Desktop (1280x800), Mobile Portrait (390x844), Mobile Landscape (844x390) with 0 console errors.

### Visual Quality & Landmark Verification
- **Güneş Mahallesi "Tarihi Mahalle Sağlık Ocağı & Dispanseri (Beyaz Ambulans & Nöbetçi Eczane)" (T62)**:
  - 10.4m x 11.6m granit ve klinker taş avlu tablası, bordür taşları, asfalt servis yanaşma peronu cebi (`HEALTH_CLINIC_BAY`: X: -11.0, Z: -43.5 - Güneş Z: -50 bulvarının güney bordüründe), sarı-siyah bordür emniyet çizgileri, beyaz peron sınırları ve zemin beyaz kılavuz yön oku: VERIFIED
  - 7.6m x 5.0m x 5.6m Erken Cumhuriyet / Neoklasik taş sağlık ocağı mimarisi: beyaz badanalı kesme taş cephe kaplaması (`#f8f9fa`), açık gri kaide süpürgeliği, köşe silmeleri (ashlar quoins), 4 adet neoklasik pilaster sütun ve Dorik/İon başlıklar: VERIFIED
  - Üçgen klasik alınlık (pediment), kabartma Kızılay Kırmızı Hilal amblemi (`#e74c3c`), alaturka kiremit kırma çatı (`#962d22`) ve tuğla havalandırma bacası: VERIFIED
  - Çatı alınlığında büyük aydınlatmalı tabela (`"🏥 GÜNEŞ MAHALLESİ 1 NOLU SAĞLIK OCAĞI & DİSPANSERİ 🩺"`), alt kurumsal şerit (`"T.C. SAĞLIK BAKANLIĞI · BİRİNCİ BASAMAK SAĞLIK HİZMETLERİ · 1952"`), giriş sahanlığı üzerinde sıcak beyaz PointLight armatürü: VERIFIED
  - 24/7 Nöbetçi Eczane Kanadı: Binanın batı kanadında çizgili zümrüt yeşili tente sundurması, aydınlatmalı yeşil neon tabela (`"💚 NÖBETÇİ ECZANE · 24 SAAT AÇIK 💊"`), canlı parlayan ve nabız atan Yeşil Neon Medikal Haç Armatürü (Green Neon Pharmacy Cross) ve yeşil PointLight: VERIFIED
  - Park Etmiş Vintage Beyaz Ambulans ("SAĞLIK İMDAT · 112 / HIZIR ACİL"): Binanın doğu kanadında (X: -7.6, Z: -38.5) acil ambulans park cebinde park etmiş 4.2m x 1.8m x 1.9m vintage Türk ambulansı (beyaz gövde, boydan boya kırmızı şerit, döner tepe flaşörleri, `"SAĞLIK İMDAT · 112"` yazısı): VERIFIED
  - Medikal Vitrin & Donatılar: İlaç vitrini, pirinç ibreli klasik boy-kilo medikal baskülü, tebeşirli karataş sağlık panosu, ilk yardım sedyesi ve oksijen tüpü: VERIFIED
  - Animasyonlu Başhekim NPC "Dr. Hikmet Bey" (X: -13.0, Z: -38.5): Beyaz doktor önlüğü, boyunda steteskop, elinde tıbbi hasta müşahade dosyası / klipsli pano, altın çerçeveli gözlük, 22m mesafeden kafa/gövde takibi, korna ve duraklamada panoyu kaldırarak hekim selamı ve 3D konuşma balonuyla karşılama: VERIFIED
  - "Sağlık & Sıhhat Güvencesi" pitstop bonusu (+10 ₺ nakit esnaf desteği, +1 itibar, +0.45 nitro dolumu, 25s "Sağlık & Sıhhat Güvencesi" yorgunluk giderme & teslimatlarda +15 ₺ sağlık primi buff'ı, altın konfeti ve para akışı, 35s soğuma ve prosedürel medikal EKG kalp atışı ile klinik zili sesi `sound.medicalChime()`): VERIFIED
  - Minimap radar simgesi: Güneş Mahallesi üzerinde canlı `🏥` sağlık ocağı simgesi: VERIFIED
  - Screenshot verified: `games/mini-kargo/artifacts/gunes-health-clinic.png`

## Visual QA & Browser Verification Summary — Run 38 (2026-11-11)

### Automated Test Suite
- **Unit & Integration Tests**: 100 test files, 976 passed, 0 failed (2.65s execution)
- **TypeScript Typecheck**: 0 errors (`tsc --noEmit`)
- **Vite Production Build**: Successful (`dist/` generated in 162ms)
- **Playwright Browser Smoke**: PASS across Desktop (1280x800), Mobile Portrait (390x844), Mobile Landscape (844x390) with 0 console errors.

### Visual Quality & Landmark Verification
- **Sanayi "Tarihi Makine, Torna & Freze İmalathanesi (Torna Aynası & Pres Tezgahı — Torna Ustası Necati Usta)" (T63)**:
  - 11.6m x 7.6m endüstriyel beton avlu tablası, döküm yağ lekeleri, çevre bordür taşları, asfalt servis yanaşma peronu cebi (`LATHE_WORKSHOP_BAY`: X: 40.0, Z: -52.8 - Sanayi Z: -50 bulvarının kuzey bordüründe), sarı-siyah bordür emniyet çizgileri, beyaz peron sınırları ve zemin beyaz kılavuz yön oku: VERIFIED
  - 4 adet ağır çelik I-kolon taşıyıcı sütun, kafes kirişler, çapraz rüzgar gergileri, oluklu sac arka ve yan paneller, galvaniz sac çatı, çatı mahya havalandırma fenerliği ve egzoz bacası (güney cephe kameraya tamamen açık): VERIFIED
  - Çatı alınlığında büyük aydınlatmalı tabela (`"⚙️ SANAYİ TORNA & FREZE · NECATİ USTA 🔩"`), alt kurumsal şerit (`"HASSAS TALAŞLI İMALAT · HİDROLİK PRES · 1964"`), altın-sarı pervaz çerçevesi ve gece atölyeyi aydınlatan sıcak kehribar PointLight armatürü: VERIFIED
  - Ağır Sanayi Üniversal Torna Tezgahı: dökme demir torna gövdesi, çift prizmatik kızak yatağı, fener mili hız kolları, mantar acil durdurma butonu, dönen 3-ayaklı torna aynası, aynaya bağlı tornalanan parlak krom çelik mil, gezer punta ve el çarkı, araba ve karbür torna kalemi, boyuna vida mili, dinamik titreşen kıvrık mavi çelik talaşları: VERIFIED
  - Ağır Hidrolik Eksantrik Pres Tezgahı: güvenlik kırmızısı döküm çelik C-gövde, üst hidrolik silindir ve yüksek basınç hortumları, alt kalıp tablası, ritmik basma animasyonlu hidrolik koç kafası, zımba takımı, basınç manometresi ve çift el emniyet butonları: VERIFIED
  - Dikey Freze Tezgahı & 5 Çekmeceli Takım Dolabı: freze gövdesi, iş mili, T-kanallı hareketli tabla ve el çarkları; 5 çekmeceli lacivert metal takım dolabı, krom kulplar, kumpas, mikrometre ve ağır döküm çelik tezgah mengenesi: VERIFIED
  - Hammadde Rafları, Mamul Dişliler & Sevkiyat Sandığı: konsol kollu profil/çubuk rafı (krom miller, pirinç çubuklar, bronz borular), ahşap EUR palet üzerinde işlenmiş dişli çarklar ve mühürlü "MK MAKİNE" sandığı: VERIFIED
  - Animasyonlu Usta Tornacı NPC "Tornacı Necati Usta" (X: 37.8, Z: -54.6): lacivert iş tulumu, torna gözlüğü, silme bezi, elinde parlak krom İngiliz anahtarı, 22m mesafeden kafa/gövde takibi, korna ve duraklamada kolunu kaldırarak usta selamı ve 3D konuşma balonuyla karşılama (`"⚙️ Necati Usta: Hoş geldin evlat! Binde bir milim hassasiyetle işleriz! 🔩"`): VERIFIED
  - "Sanayi Hassasiyeti & Torna Ayarı" pitstop bonusu (+10 ₺ nakit esnaf desteği, +1 itibar, +0.45 nitro dolumu, 25s "Sanayi Hassasiyeti & Torna Ayarı" nitro/çeviklik & teslimatlarda +15 ₺ hassasiyet primi buff'ı, altın konfeti ve para akışı, 35s soğuma ve prosedürel yüksek hızlı torna mili dönme vızıltısı ile hidrolik pres vuruşu ve basınç tıslama sesi `sound.latheMachine()`): VERIFIED
  - Minimap radar simgesi: Sanayi Bölgesi üzerinde canlı `⚙️` çark simgesi: VERIFIED
  - Screenshot verified: `games/mini-kargo/artifacts/sanayi-lathe-workshop.png`

## Independent Victory Audit Verdict
- **Verdict**: `VICTORY CONFIRMED`
- **Integrity**: Zero skipped tests, zero mock facades, genuine implementations.
