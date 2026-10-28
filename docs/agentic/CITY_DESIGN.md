# Mini Kargo — City Design & District Specifications

## World Overview
The Mini Kargo map is organized into four interconnected, stylistically distinct districts centered around a unified road network of 39 navigation nodes.

```
+---------------------------------------+
|  Güneş Mahallesi   |  Çarşı Bölgesi   |
|  (Residential)     |  (Commercial)    |
|                    |                  |
+--------------------+------------------+
|  Sanayi Bölgesi    |  Sahil Şeridi    |
|  (Industrial)      |  (Coastal Marina)|
|                    |                  |
+---------------------------------------+
```

---

## 1. Güneş Mahallesi (Residential District)
- **Visual Identity**: Warm, welcoming suburban atmosphere. Soft pastel and terracotta roofs, picket fences, front gardens, flowerbeds, deciduous green trees, authentic American-suburban curbside mailboxes with red alert flags, rooftop solar water-heating panels, and a grand timber entrance welcome archway.
- **Architecture**: Single-family houses, small apartment blocks, neighborhood grocery shops, local park benches, kids playground, and welcoming arch monument ("🏡 GÜNEŞ MAHALLESİ").
- **Logistics Headquarters Campus**: Situated at X: -67..-50, Z: -42..-26. Features the main sorting hub, truck loading dock, corporate monument signage, security guard checkpoint, and an organized 2x2 upgrade apron.
- **Road & Traffic**: Calm residential streets, cul-de-sacs, residential speed bumps, pedestrian crosswalks, and an unblocked stunt jump ramp (`ramp_sunny_depot` at X=-50, Z=-22) equipped with high-visibility reflector bollards.
- **Soundscape**: Soft summer breeze whisper, rustling trees, and cheerful morning bird chirps.
- **Key Delivery Points**: 4 residential house front porches and garden gates with clear driveways.

---

## 2. Çarşı Bölgesi (Commercial District)
- **Visual Identity**: Dense, bustling urban market center. Storefront awnings, neon and wooden shop signage, outdoor cafe seating, streetlamps, colorful banners, authentic striped-canopy open-air market stalls (Pastane, Manav, Kitapçı, Hediyelik), festive overhead celebration bunting pennants across alleyways, A-frame chalkboard cafe menus, sidewalk flower planters, and the Historic Piazza Clock Tower.
- **Centerpiece Landmark**: Historic Tiered Marble Fountain (`buildPiazzaFountain`) centered in the Piazza roundabout (X: 50, Z: 50) featuring an octagonal marble basin, turquoise pool water, and animated water spray droplets splashing into the bowl.
- **Architecture**: Multi-story commercial buildings, bakeries, cafes, boutique shops, and a central plaza with a marble statue column, tiered fountain, and historic clock tower at the alley entrance.
- **Road & Traffic**: Dual-lane thoroughfares, heavy pedestrian crossings, active delivery loading zones, curbside parked vehicles.
- **Soundscape**: Bustling market crowd murmur, distant cafe cup chimes, and lively merchant activity.
- **Key Delivery Points**: 4 commercial storefronts, cafe service entrances, and central plaza kiosks.

---

## 3. Sanayi Bölgesi (Industrial District)
- **Visual Identity**: Utilitarian, functional heavy logistics hub. Corrugated metal cladding, industrial smokestacks, security fences, stacked shipping containers, elevated steel pipe corridors, an imposing 10.4m x 8.5m container gantry crane with an operator cab and airborne suspended cargo container, high-voltage electrical transformer substation (`buildElectricalSubstation`), and dual heavy industrial floodlight towers (`buildIndustrialFloodlight`).
- **Environmental Activity**: Factory smokestacks and crane diesel generator actively vent animated rising steam/smoke plumes (`buildFactoryChimneySmoke`).
- **Architecture**: Large warehouse complexes, cargo depots, repair garages, crane rigs, elevated steel pipe corridors, transformer substation, and heavy storage yards.
- **Road & Traffic**: Wide truck lanes, concrete barrier curbs, industrial jump ramps, forklift traffic lanes, breakable wooden crates.
- **Soundscape**: Low-frequency 48Hz generator hum, 96Hz harmonic vibration, and heavy logistics activity.
- **Key Delivery Points**: 4 warehouse loading docks with roll-up gates and freight pallet zones.

---

## 4. Sahil Şeridi (Coastal Marina District)
- **Visual Identity**: Open, scenic coastal promenade. Seaside stone piers, palm trees, sandy beach borders, water shaders, vintage cast-iron promenade lanterns, an elevated wooden beach lifeguard watchtower equipped with ladder and lifebuoy ring, promenade lifebuoy stations, and authentic marina boats.
- **Centerpiece Landmarks**:
  - Classic Maritime Coastal Lighthouse (`buildLighthouse`) on a breakwater stone jetty at X: -28, Z: 91 with alternating bold crimson and white bands, cast-iron gallery observation deck, glass lantern housing, copper cupola, and a sweeping volumetric rotating searchlight beam illuminating the waves at sunset and dusk.
  - Active Marina Boats (`buildMarinaBoats`): A classic 6.2m sailing yacht with cabin, tall mast, boom, and furled sails alongside a sporty red-and-white speedboat moored to the wooden pier with animated harmonic wave bobbing physics.
- **Architecture**: Waterfront restaurants, marina harbor master station, boardwalk pavilions, resort beach huts, canoes, seaside lounging decks, and lifeguard watchtower.
- **Road & Traffic**: Winding scenic coastal boulevard, bridge crossings, promenade sidewalks, seaside view benches.
- **Soundscape**: Gentle rhythmic rolling ocean waves (LFO-modulated pink noise surf) and occasional distant seagull calls.
- **Key Delivery Points**: 4 marina piers, seafood bistro patios, and coastal boardwalk kiosks.

---

## 5. Dynamic Time of Day & Atmosphere System
- **Shift Day Cycle**: Smoothly transitions across 4 keyframes:
  1. **Sabah (Morning)**: Crisp blue sky (`#6ab7f5`), fresh morning fog (`#cbe7fc`), cool white sun (`#fff8ee`), gentle morning light.
  2. **Öğle (Midday)**: Vibrant azure sky (`#70c5ff`), bright overhead sun (`#fff5eb`), lush hemisphere lighting.
  3. **Gün Batımı (Golden Hour Sunset)**: Warm glowing amber sun (`#ff9d42`), coral horizon sky (`#e67e50`), warm peach fog (`#df9d83`), dramatic long shadows.
  4. **Alacakaranlık (Twilight Dusk)**: Deep sapphire night sky (`#1d243a`), slate fog (`#2b3450`), cool moonlit illumination (`#8ea4d2`), and active glowing lighthouse searchlight.
- **HUD Integration**: Real-time time pill badge displayed in topbar (`☀️ ÖĞLE`, `🌇 GÜN BATIMI`, etc.).
- **Proximity Occlusion & Budget**: Instanced geometries and draw calls under 50 maintain 60 FPS mobile target.

---

## 6. Dynamic Weather & Wet Road Reflection System
- **Weather Cycle**: Natural dynamic transitions between clear skies ("Açık Hava" `🌤️`) and refreshing summer rain showers ("Yaz Yağmuru" `🌧️`).
- **3D Rain Particles**: 350 volumetric falling rain streaks tracking vehicle position with speed ~30 m/s and ground resets.
- **Wet Road Specular Sheen**: Real-time asphalt surface reflectivity shader adaptation (`setWorldWetness`). As rain falls, road roughness drops from 0.85 to 0.22 with 0.2 metalness, producing glistening specular tarmac reflections under sunlight and headlights.
- **Procedural Rain Audio**: Bandpass-filtered Web Audio synthesis at 2400Hz simulating continuous soothing rain patter on the vehicle body.
- **HUD Weather Pill**: Real-time weather status badge displayed in topbar (`🌤️ AÇIK` / `🌧️ YAZ YAĞMURU`).

---

## 7. Dynamic Night Lighting & Vehicle Headlight System
- **Vehicle Headlight Cones**:
  - Delivery Van: Dual volumetric forward projection beams (`CylinderGeometry` with `AdditiveBlending` and soft falloff) and specular ground oval puddles on asphalt (`y = 0.03`).
  - Courier Scooter: Single forward headlight beam and ground spot attached to front fork assembly, swiveling seamlessly with handlebar steering angle.
  - Headlight Intensity Lerp: Automatically fades in at dusk/night or during summer rain showers (`headlightIntensity: 0 -> 1`), and dims during bright daylight.
- **City-wide Emissive Architecture**:
  - Streetlamps across Güneş Mahallesi, Çarşı and industrial roads glow with warm incandescent emission (`#ffdd66`, intensity 1.5).
  - Nostalgic promenade cast-iron lanterns along Sahil pier glow with golden amber light (`#ffa834`, intensity 1.6).
  - Commercial storefront display vitrins and apartment windows emit cozy warm interior light (`#f6e58d`, intensity 0.75).
  - Substation electrical safety beacons and heliport pads pulse with caution glow.

---

## 8. Dynamic Pedestrian Rain Reactions & Umbrellas
- **Faceted Colorful Umbrellas**: 8 distinct low-poly umbrella styles (red, blue, yellow, green, purple, orange, turquoise, pink) attached to pedestrian right arm pivots.
- **Dynamic Deployment**: When summer rain begins (`rainIntensity > 0.15`), pedestrians smoothly pop open their umbrellas (`umbrellaScale: 0 -> 1`), raise their right arm overhead, and stroll protected from the downpour.
- **Stowing & Panic Reactions**: Umbrellas fold away when skies clear. Fleeing pedestrians maintain an alert grip on their umbrella while running from vehicle danger.

---

## 9. District Delivery Stations & Customer Reception Visuals
- **16 Physical Delivery Stations** (`createDeliveryStations`):
  1. **Güneş Mahallesi (Homes 0–3)**: Suburban cedar porch parcel bench, "HOŞGELDİNİZ" gold-bordered welcome mat, solar pathway bollard light, resident NPC in cozy casual hoodie and jeans.
  2. **Çarşı Bölgesi (Homes 4–7)**: Boutique reception counter desk, brass service bell, invoice clipboard, "SİPARİŞ TESLİM" sign, storekeeper NPC in apron.
  3. **Sanayi Bölgesi (Homes 8–11)**: Heavy EUR wooden freight pallet, yellow/black hazard safety borders, steel guide stanchions, logistics supervisor NPC with hardhat and barcode scanner.
  4. **Sahil Şeridi (Homes 12–15)**: Boardwalk timber cargo dock, mooring cleat post, hanging lifebuoy ring, coastal server / harbor attendant NPC in nautical sailor shirt.
- **Dynamic NPC Living Reactions**:
  - **Approaching Guidance**: When player drives towards an active delivery target, the corresponding station character waves enthusiastically to welcome the vehicle.
  - **Celebration Jump ("🙌")**: Upon successful delivery drop, the character executes an energetic 1.8-second celebration dance with both arms raised high in victory.
- **Delivered Parcel Visual Stacking**: Neatly stacks up to 3 wrapped gift/cargo parcels matching the delivered contract type on the station desk/pallet.

---

## 10. Delivery Satisfaction, Radial Hold Progress & Combo Streaks
- **Dynamic Radial Hold Progress Disc**: Inner glowing green circle disc expands from 0% to 100% radius as player holds still in the target ring (`holdSeconds`), providing immediate tactile visual feedback before triggering delivery.
- **Contract-Adaptive Marker Themes**: Distinctive ring and pin coloring based on active cargo contract:
  - 💎 VIP Express: Radiant luxury turquoise (`#00d2d3`)
  - 🧊 Cold Chain: Crisp frost azure (`#54a0ff`)
  - ⚡ Heavy Freight: Industrial amber caution (`#ff9f43`)
  - 🔴 Urgent Cargo: Vivid ruby red (`#ee5253`)
  - 🟢 Standard / Fragile: Mint and emerald tones (`#5dbb90`, `#1dd1a1`)
- **Delivery Combo Streak System**:
  - Consecutive undamaged deliveries reward an escalating combo multiplier and cash bonus: 2x (+15 ₺), 3x (+25 ₺, +1 rep), 4x (+40 ₺), 5x+ (+60 ₺).
  - Web Audio procedural fanfare arpeggio chords in `sound.comboFanfare(streak)`.
  - Confetti showers (`particles.spawnConfetti`) and gold coin stream (`particles.spawnMoneyStream`) on milestone streak deliveries.

---

## 11. Living Urban Fauna & Street Life Simulation (T24 & T25)
- **Coastal Soaring Seagulls (`Sahil Şeridi`)**:
  - 4 coastal seagulls soaring gracefully in thermal circular & figure-8 flight paths above the breakwater lighthouse, marina yachts, and beach coastline.
  - Articulated wing flap-and-glide physics: flaps rhythmically for 1.2s then glides with gentle dihedral bank into turns.
  - Procedural oceanic bird cry (`sound.seagullCry()`) synthesized dynamically when driving through Sahil.
- **Piazza Market Pigeons (`Çarşı Bölgesi`)**:
  - 8 city pigeons pecking and bustling on the cobblestones around the historic fountain and market stalls.
  - Idle pecking animation with bobbing heads and small wander hops.
  - Vehicle Evasion / Panic Flight: When player vehicle approaches within 6.5m (or when player honks within 28m), the flock scatters, flaps wings rapidly, ascends into the air up to 3.8m, and circles outward before softly descending to land.
  - Procedural wing flutter & soft coo (`sound.pigeonScatter()`).
- **Suburban Domestic Cats (`Güneş Mahallesi`)**:
  - 3 unique cats situated across the neighborhood:
    - "Tekir" (Ginger Tabby): Perched on the white garden fence / porch railing of Home 1.
    - "Duman" (Smoky Tuxedo): Sunbathing on the front green lawn of Home 2.
    - "Zeytin" (Calico): Resting beside the wooden suburban welcome archway.
  - Gentle tail flicking physics.
  - Head tracking: Head smoothly yaws to follow player vehicle when within 12m.
  - Alert Meow: Meows playfully (`sound.catMeow()`) when player stops close or honks.
- **Industrial Logistics Guard Dog (`Karabaş` - Sanayi Bölgesi)**:
  - Stationed by the entrance checkpoint outside a handcrafted timber doghouse with pitched terracotta roof and water bowl.
  - Authentic Anatolian Shepherd / Kangal coloring (fawn coat, black mask face & ears, curled tail).
  - Continuous tail wagging and vehicle head tracking.
  - Friendly protective bark (`sound.dogBark()`) triggered when vehicle speeds past or honks.
- **Interactive Vehicle Horn & Emergency Flash Delivery Mini-Events (T25)**:
  - Dedicated player horn key (`H`) and mobile HUD touch button (`📢 KORNA`).
  - Honking startles nearby pigeons to take flight, triggers cat meows, and elicits protective barks from Karabaş.
  - "⚡ FLAŞ SİPARİŞ RUSH" mini-event triggers periodically with active countdown and topbar glowing pill indicator, awarding +75 ₺ bonus cash, +2 reputation, and fanfare on timely delivery.

---

## 12. District Environmental Micro-FX & Fleet Career Customization (T26 & T27)
- **Güneş Mahallesi Interactive Crunchy Leaf Piles**:
  - 4 physical leaf pile mounds situated along suburban curbs, lawn borders, and parks (Homes 01 & 02, Depot entrance, Playground).
  - Composed of multi-hued autumn leaves (golden yellow `#f1c40f`, warm amber `#f39c12`, crimson red `#c0392b`, olive green `#27ae60`).
  - Speed-triggered explosion: Driving through a leaf pile at speed (>1.2 m/s) scatters the pile and bursts 24 swirling airborne leaf particles that spiral in the wind before softly floating down.
  - Procedural leaf crunch audio (`sound.leafCrunch()`) and playful "+5 ₺ Sonbahar Keyfi!" bonus reward with 16-second natural pile regeneration.
- **Sahil Şeridi Coastal Breaker Sea Spray Mist**:
  - Located on the maritime lighthouse breakwater rocks (X: -28, Z: 91).
  - Every 3.4 seconds, an ocean swell impacts the rocks, firing foaming white and translucent cyan water droplets (`#e0f7fa`, `#ffffff`) 2.8–4.2m upward into the coastal breeze.
  - Procedural deep ocean surf crash sound (`sound.surfCrash()`) with distance-based acoustic attenuation.
- **Sanayi Bölgesi Metal Fabrication Welding Workshop**:
  - Located in the industrial courtyard (X: 36, Z: -26) equipped with heavy steel workbench, argon gas cylinder, portable inverter machine, and yellow safety screen.
  - Industrial Welder NPC ("Usta Kaynakçı"): Dressed in dark denim overalls and protective leather apron, wearing a full-face helmet with dark visor, holding an articulated welding torch.
  - Dynamic Arc Flicker: High-frequency blue-white point light (`#a5b4fc`, intensity 2.0–5.0) illuminating metal structures and casting dramatic shadows.
  - Falling spark showers: Cascades of glowing orange/yellow sparks bouncing off the workbench and floor.
  - Procedural electric arc buzz audio (`sound.weldingArc()`) with proximity falloff.
- **Çarşı Bölgesi Piazza Fountain Mist**:
  - Glistening water mist particles hovering over the marble fountain basin (X: 50, Z: 50).
- **Company Fleet Career Custom Liveries (T27)**:
  - 4 customizable vehicle styles:
    - 🚚 Klasik Kargo: Traditional yellow/green corporate identity.
    - 🌊 Sahil Dalgası: Vibrant turquoise & ocean blue styling.
    - ⚡ Gece Ekspresi: Stealth anthracite with neon fuchsia racing stripe.
    - 👑 Altın Şampiyon: High-prestige metallic gold & bronze finish.
  - Live real-time material shader color swapping on player van and courier scooter.
  - Career trophies gallery & Livery selector tab in the company management office sheet.

---

## 13. Dynamic Urban Traffic Expansion & Pedestrian Signals (T28)
- **Animated Crosswalk Pedestrian Traffic Signals (`TrafficLights`)**:
  - Installed across 8 key intersections and pedestrian zebra crossings (Central Grand Roundabout, Çarşı Market Square, Sahil Coastal Promenade, Sanayi Heavy Freight Crossing).
  - Physical galvanized steel cantilever mast arms extending 2.6m over road lanes, with round steel bases and anchor brackets.
  - 3-aspect vehicular signal heads (Red, Amber, Green) with hooded sun visors and reflective hazard border panels.
  - 2-aspect pedestrian signal heads mounted at eye level (Red standing silhouette, Green walking silhouette).
  - 26.6-second cyclical traffic controller (Z-axis Green -> Z-axis Yellow -> All Red -> X-axis Green -> X-axis Yellow -> All Red) with dynamic emissive glow scaling up at night and dusk.
- **Scooter Courier AI Traffic Sharing Roads (`CourierScooterTraffic`)**:
  - Autonomous AI delivery scooters driving along city avenues and neighborhood streets in Güneş, Çarşı, and Sahil.
  - Detailed low-poly delivery scooter model: dual wheels with rubber tires and alloy rims, footrest, handlebars, bright LED headlamp, and a large insulated rear thermal delivery box with reflective striping and kargo emblem.
  - Animated AI Courier Rider dressed in windbreaker and safety helmet with tinted visor, dynamically banking and leaning into motion.
  - Interactive horn salute: honking near an AI courier triggers an interactive friendly response ("bip-bip!" procedural sound `sound.courierBeep()`) and greeting shake.
- **Parcel Handoff Micro-Animations & Customer Gratitude**:
  - Customer NPCs transition into an eager receiving handoff posture with outstretched arms when the player vehicle holds to deliver.
  - Floating 3D gratitude speech bubble badges ("⭐⭐⭐⭐⭐ Harika Teslimat!", "📦 Çok Teşekkürler!", "⚡ Jet Hızında Servis!", "🙌 Eline Sağlık Kurye!") rising and fading above customer heads upon delivery.
  - Parabolic parcel swoop animation in `markers.ts` with squash-and-stretch bounce landing.
  - Procedural cardboard rustle and solid drop impact audio (`sound.packageDrop()`).

---

## 14. Audio Jukebox & Living Transit Infrastructure (T29, T30 & T31)
- **Procedural Car Radio Jukebox (`RadioSystem`)**:
  - 3 procedural in-game radio channels + off state:
    1. ☕ **Sakin Lo-Fi** (~76 BPM): Chillhop electric piano/Rhodes chords, smooth walking sub-bass, relaxed pentatonic bell melodies.
    2. ⚡ **Turbo FM** (~126 BPM): High-energy 80s synthwave rolling 16th bassline, punchy kick/snare pulse, driving synth arpeggios.
    3. 🌆 **Şehir Vibes** (~106 BPM): Syncopated funk groove, slap bassline, jazzy chord stabs.
  - Interactive HUD radio pill (`#btn-radio`) with animated 3-bar audio visualizer equalizer, `R` keyboard toggle key, touch controls, and dynamic ducking during horn and fanfare audio events.
- **District Bus Stops & Waiting Commuter NPCs (`BusStops`)**:
  - 4 authentic Turkish transit bus stops ("Otobüs Durakları") placed across all districts:
    - Güneş: `stop_sunny` (X: -44, Z: -14.2)
    - Çarşı: `stop_market` (X: 14.2, Z: 32)
    - Sanayi: `stop_industrial` (X: 44, Z: -14.2)
    - Sahil: `stop_coastal` (X: -14.2, Z: 32)
  - Features curved tinted-glass canopy, classic blue circular "D" (Durak) transit sign post, schedule poster board ("HAT 101"), polished cedar timber bench, recycling receptacle, and curbside yellow painted zigzag bus bay markings.
  - Living Commuter NPCs (seated and standing) featuring vehicle head tracking and friendly responsive arm waving when the player honks (`H`).
- **Rooftop Architectural Realism**:
  - **Solar Water Heaters ("Güneş Enerjisi Termosifon")**: Galvanized storage cylinder tank on A-frame with angled navy blue solar thermal collector panel.
  - **Parabolic Satellite Dishes ("Çanak Anten")**: Concave receiver dish pointed towards the sky with central LNB feed horn.
  - **HVAC Compressor Chillers**: Industrial sheet metal housing with side louvers, circular top exhaust fan, and copper refrigeration piping across apartments and plazas.

---

## 15. Dynamic Weather Puddles, Hydroplaning & Customer Tipping (T32 & T33)
- **Dynamic Road Puddle Accumulation (`createPuddlesView`)**:
  - 12 authentic road puddle locations positioned across all 4 districts along asphalt low points and gutter curbs:
    - Güneş: `sunny_depot_spur` (X: -58, Z: -31), `sunny_cross_c` (X: -48, Z: -48), `sunny_cross_w` (X: -76, Z: -52), `sunny_cross_s` (X: -48, Z: -12)
    - Bulvar: `blvd_west` (X: -44, Z: 1.2), `blvd_center` (X: 6, Z: -1.2), `blvd_east` (X: 45, Z: 1.4)
    - Çarşı: `mkt_piazza_spur` (X: 12, Z: 35), `mkt_south_avenue` (X: 52, Z: 82)
    - Sanayi: `ind_warehouse_bay` (X: 16, Z: -15), `ind_heavy_dock` (X: 48, Z: -64)
    - Sahil: `cst_north_pier` (X: -76, Z: 35), `cst_south_boardwalk` (X: -52, Z: 76)
  - Dynamically responds to weather wetness (`wetness`): invisible and zero-opacity when dry; transitions into reflective deep blue-tinted water discs with expanding concentric ripple rings during and after summer rain showers.
- **Tire Splash Particles & Procedural Audio (`spawnPuddleSplash` & `sound.puddleSplash`)**:
  - Driving through puddles during rain (`wetness > 0.15`) at speed (> 2.2 m/s) triggers dynamic water splashes.
  - Generates 22 aquatic white and cyan droplet particles fanning outwards in lateral wheel bow sprays with gravity drop.
  - Procedural Web Audio synthesis of wet tire water slap and sweeping bandpass spray hiss (2600 Hz -> 650 Hz).
  - Micro-hydroplaning: high-speed puddle encounters (> 6.0 m/s) produce slight realistic tire drag and steering float.
- **Customer Tipping Mechanic & Visual Fanfare (`DeliveryReward.tipBonus` & `sound.customerTip`)**:
  - Prompt, zero-damage deliveries award generous customer cash tips (15 ₺ for fast deliveries, 25 ₺ for lightning-fast deliveries, +5 ₺ extra for Special Contracts up to 30 ₺).
  - Customer NPC displays custom floating speech bubble: `"💵 +{tip} ₺ Bahşiş!"` with a vibrant green badge.
  - Procedural bright two-tone coin chime (1760 Hz & 2637 Hz) and parabolic gold coin stream towards player vehicle.




