# Mini Kargo — Task Tracker

## Completed Tasks
- [x] **T01 — Phase 0 Survey & Codebase Exploration**: Completed by 3 parallel explorers (`survey_codebase.md`, `survey_world.md`, `survey_gameplay.md`).
- [x] **T02 — Feature Inventory & E2E Specification**: Created `PROJECT.md` and `TEST_READY.md` covering features F01–F21 across Tiers 1–4.
- [x] **T03 — City & District Enrichment**:
  - Implemented district-specific buildings, foliage, and props using Kenney 3D assets.
  - Connected 39 road nodes with smooth transitions, 16 reachable delivery locations (>1.8m clearance), and jump ramps.
- [x] **T04 — Traffic, Pedestrian & Ambience Simulation**:
  - 37 traffic vehicles navigating road loops with following distance, horn alerts, and recoil physics.
  - 39 animated pedestrians on sidewalks with limb movement and vehicle evasion behavior.
  - 28 breakable props (cones, trash cans, wooden boxes) with procedural Web Audio impact synthesis.
  - 11 drifting volumetric clouds and atmospheric directional lighting.
- [x] **T05 — Vehicle Handling & Collision Physics**:
  - Balanced acceleration, braking, drifting physics, and nitro boost for delivery van and scooter.
  - 3-circle capsule collision boundary with smooth wall sliding and recoil damping.
- [x] **T06 — Progression & Fleet Automation**:
  - 5 upgrade tiers (Engine, Brakes, Cargo, Speed, Nitro) via Buy Pads and company sheet.
  - 40-node BFS pathfinding for autonomous courier fleet passive income.
  - Backward-compatible `localStorage` persistence (`mini-kargo:v1`).
- [x] **T07 — Mobile UX Polish**:
  - Minimap CSS cascade order corrected to separate touch controls and minimap in mobile landscape.
  - Responsive HUD spacing and modal header margins tuned for mobile portrait.
- [x] **T08 — Comprehensive E2E Test Suite**:
  - Added 242 opaque-box E2E tests, bringing total Vitest test suite to 611/611 passing tests across 32 test files.
- [x] **T09 — Browser Automation & Visual QA**:
  - Verified across desktop (1280x800), mobile portrait (390x844), and mobile landscape (844x390) with 0 console errors.
- [x] **T10 — Independent Victory Audit**:
  - Independent post-victory auditor executed forensic check, verifying 100% genuine test pass and zero mock facades (`VICTORY CONFIRMED`).

## Active / Next Tasks
- [ ] **T11 — Player Hands-on Playtesting & Feedback**: Solicit user evaluation on subjective driving feel, district ambiance, and gameplay pacing.
- [ ] **T12 — Future YouTube Playables SDK Preparation**: (Pending explicit user instruction) integrate YouTube Playables SDK hooks when ready for distribution.
