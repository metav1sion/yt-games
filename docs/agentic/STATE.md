# Mini Kargo — Project State Snapshot

**Date**: 2026-10-28  
**Branch**: `feat/mini-kargo`  
**Latest Git Commit**: `aab831e` (Sprint 5) -> In Progress (Sprint 6)  
**Current Milestone**: Continuous Polish, Night Lighting & Weather Reaction Sprint (Execution Run 6)  
**Victory Audit Status**: `VICTORY CONFIRMED`

## Verification Summary
- **Unit & Integration Tests**: 35 test files, 623 passed, 0 failed (1.01s execution)
- **TypeScript Typecheck**: 0 errors (`tsc --noEmit`)
- **Vite Production Build**: Successful (`dist/` generated in 141ms)
- **Playwright Browser Smoke**: PASS across Desktop (1280x800), Mobile Portrait (390x844), Mobile Landscape (844x390) with 0 console errors.
- **Persistence Compatibility**: Verified backwards compatibility for `localStorage` key `mini-kargo:v1`.

## Completed Improvements in this Run
1. **Dynamic Vehicle Headlight Beams & Asphalt Specular Sheen (T20)**:
   - Implemented volumetric light cone beams (`CylinderGeometry` with `AdditiveBlending` & soft falloff) for Delivery Van (dual forward beams) and Courier Scooter (swiveling forward beam attached to handlebar stem).
   - Dynamic ground illumination oval pools on asphalt road surface at world `y = 0.03`, creating specular reflections especially when roads are wet from summer rain.
   - Smooth night & rain activation fading (`headlightIntensity: 0 -> 1` via exponential lerp).
   - Test verified in `src/scene/car.test.ts`.
2. **City-Wide Night Emissive Lighting & Shop Window Illumination (T20)**:
   - Created `setWorldNightEmissive` in `src/scene/world-kit.ts`: smoothly modulates warm golden streetlamps (`#ffdd66`, intensity 1.5), promenade lanterns (`#ffa834`, intensity 1.6), cozy shop/apartment windows (`#f6e58d`, intensity 0.75), and industrial warning beacons.
   - Smooth dusk-to-night transitions integrated into `world.update(dt, isNightOrDusk)` with `getNightFactor()`.
   - Test verified in `src/scene/world.test.ts`.
3. **Dynamic Pedestrian Umbrellas & Summer Rain Reactions (T21)**:
   - Deployed colorful low-poly 8-faceted umbrellas (8 vibrant color variants: red, blue, yellow, green, purple, orange, teal, pink) attached to pedestrian right arm pivots.
   - Dynamic scaling and posture adaptation: when summer rain begins (`rainIntensity > 0.15`), pedestrians smoothly pop open their umbrellas, raise their right arm overhead, and walk protected from the rain with subtle walking bobbing.
   - Panic behavior updated: fleeing pedestrians maintain firm grip on their umbrella while running from vehicle danger.
   - Test verified in `src/scene/pedestrians.test.ts` (`getUmbrellaStats()`).

## Quick Resume Instructions
To test and run locally:
```bash
cd games/mini-kargo
npm test                # Run 623 unit & E2E tests
npm run typecheck       # Verify TypeScript types
npm run build           # Build client bundle
npm run test:browser    # Run Playwright visual smoke tests
npm run dev             # Start local development server
```
