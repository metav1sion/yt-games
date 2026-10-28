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

