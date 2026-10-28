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
- **Visual Identity**: Warm, welcoming suburban atmosphere. Soft pastel and terracotta roofs, picket fences, front gardens, flowerbeds, and deciduous green trees.
- **Architecture**: Single-family houses, small apartment blocks, neighborhood grocery shops, local park benches.
- **Road & Traffic**: Calm residential streets, cul-de-sacs, residential speed bumps, pedestrian crosswalks.
- **Key Delivery Points**: 4 residential house front porches and garden gates with clear driveways.

---

## 2. Çarşı Bölgesi (Commercial District)
- **Visual Identity**: Dense, bustling urban market center. Storefront awnings, neon and wooden shop signage, outdoor cafe seating, streetlamps, and colorful banners.
- **Architecture**: Multi-story commercial buildings, bakeries, cafes, boutique shops, and a central plaza.
- **Road & Traffic**: Dual-lane thoroughfares, heavy pedestrian crossings, active delivery loading zones, curbside parked vehicles.
- **Key Delivery Points**: 4 commercial storefronts, cafe service entrances, and central plaza kiosks.

---

## 3. Sanayi Bölgesi (Industrial District)
- **Visual Identity**: Utilitarian, functional logistics hub. Corrugated metal cladding, industrial smokestacks, security fences, stacked shipping containers, and pallet storage.
- **Architecture**: Large warehouse complexes, cargo depots, repair garages, crane rigs, and heavy storage yards.
- **Road & Traffic**: Wide truck lanes, concrete barrier curbs, industrial jump ramps, forklift traffic lanes, breakable wooden crates.
- **Key Delivery Points**: 4 warehouse loading docks with roll-up gates and freight pallet zones.

---

## 4. Sahil Şeridi (Coastal Marina District)
- **Visual Identity**: Open, scenic coastal promenade. Seaside stone piers, palm trees, sandy beach borders, water shaders, yachts, and decorative lighthouses.
- **Architecture**: Waterfront restaurants, marina harbor master station, boardwalk pavilions, resort beach huts.
- **Road & Traffic**: Winding scenic coastal boulevard, bridge crossings, promenade sidewalks, seaside view benches.
- **Key Delivery Points**: 4 marina piers, seafood bistro patios, and coastal boardwalk kiosks.

---

## Environmental Density & Quality Guardrails
- **Dropoff Zone Clearance**: Every delivery pad maintains at least 1.8m clearance from building walls and barriers to ensure zero vehicle clipping or stuck states.
- **Road Connectivity**: 39 interconnected nodes forming continuous driving loops across all district borders.
- **Visual Budget**: Instanced foliage (trees, bushes) and shared geometries keep draw calls below 50, maintaining smooth 60 FPS on mobile devices.
