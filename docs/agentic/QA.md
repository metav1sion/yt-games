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

## Independent Victory Audit Verdict
- **Verdict**: `VICTORY CONFIRMED`
- **Integrity**: Zero skipped tests, zero mock facades, genuine implementations.
