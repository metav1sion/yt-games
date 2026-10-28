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
- **Visual Identity**: Warm, welcoming suburban atmosphere. Soft pastel and terracotta roofs, picket fences, front gardens, flowerbeds, deciduous green trees, and authentic American-suburban curbside mailboxes with red alert flags.
- **Architecture**: Single-family houses, small apartment blocks, neighborhood grocery shops, local park benches, and kids playground.
- **Logistics Headquarters Campus**: Situated at X: -67..-50, Z: -42..-26. Features the main sorting hub, truck loading dock, corporate monument signage, security guard checkpoint, and an organized 2x2 upgrade apron.
- **Road & Traffic**: Calm residential streets, cul-de-sacs, residential speed bumps, pedestrian crosswalks, and an unblocked stunt jump ramp (`ramp_sunny_depot` at X=-50, Z=-22) equipped with high-visibility reflector bollards.
- **Soundscape**: Soft summer breeze whisper, rustling trees, and cheerful morning bird chirps.
- **Key Delivery Points**: 4 residential house front porches and garden gates with clear driveways.

---

## 2. Çarşı Bölgesi (Commercial District)
- **Visual Identity**: Dense, bustling urban market center. Storefront awnings, neon and wooden shop signage, outdoor cafe seating, streetlamps, colorful banners, authentic striped-canopy open-air market stalls (Pastane, Manav, Kitapçı, Hediyelik), and the Historic Piazza Clock Tower.
- **Centerpiece Landmark**: Historic Tiered Marble Fountain (`buildPiazzaFountain`) centered in the Piazza roundabout (X: 50, Z: 50) featuring an octagonal marble basin, turquoise pool water, and animated water spray droplets splashing into the bowl.
- **Architecture**: Multi-story commercial buildings, bakeries, cafes, boutique shops, and a central plaza with a marble statue column, tiered fountain, and historic clock tower at the alley entrance.
- **Road & Traffic**: Dual-lane thoroughfares, heavy pedestrian crossings, active delivery loading zones, curbside parked vehicles.
- **Soundscape**: Bustling market crowd murmur, distant cafe cup chimes, and lively merchant activity.
- **Key Delivery Points**: 4 commercial storefronts, cafe service entrances, and central plaza kiosks.

---

## 3. Sanayi Bölgesi (Industrial District)
- **Visual Identity**: Utilitarian, functional heavy logistics hub. Corrugated metal cladding, industrial smokestacks, security fences, stacked shipping containers, elevated steel pipe corridors, and an imposing 10.4m x 8.5m container gantry crane with an operator cab and airborne suspended cargo container.
- **Environmental Activity**: Factory smokestacks and crane diesel generator actively vent animated rising steam/smoke plumes (`buildFactoryChimneySmoke`).
- **Architecture**: Large warehouse complexes, cargo depots, repair garages, crane rigs, elevated steel pipe corridors, and heavy storage yards.
- **Road & Traffic**: Wide truck lanes, concrete barrier curbs, industrial jump ramps, forklift traffic lanes, breakable wooden crates.
- **Soundscape**: Low-frequency 48Hz generator hum, 96Hz harmonic vibration, and heavy logistics activity.
- **Key Delivery Points**: 4 warehouse loading docks with roll-up gates and freight pallet zones.

---

## 4. Sahil Şeridi (Coastal Marina District)
- **Visual Identity**: Open, scenic coastal promenade. Seaside stone piers, palm trees, sandy beach borders, water shaders, yachts, vintage cast-iron promenade lanterns, and an elevated wooden beach lifeguard watchtower equipped with ladder and lifebuoy ring.
- **Centerpiece Landmark**: Classic Maritime Coastal Lighthouse (`buildLighthouse`) on a breakwater stone jetty at X: -28, Z: 91 with alternating bold crimson and white bands, cast-iron gallery observation deck, glass lantern housing, copper cupola, and a sweeping volumetric rotating searchlight beam illuminating the waves at sunset and dusk.
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
