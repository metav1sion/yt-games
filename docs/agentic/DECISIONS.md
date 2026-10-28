# Mini Kargo — Architectural & Technical Decisions

## ADR-001: Asset Strategy — Kenney Low-Poly Re-use
- **Context**: The game needs a vibrant, cohesive 3D city without ballooning download size or creating remote runtime network dependencies.
- **Decision**: Re-use local Kenney 3D GLTF assets (`assets/kenney/`) supplemented by procedural geometries and instancing.
- **Consequences**: Fast startup, zero remote network risk, consistent low-poly aesthetic, mobile-friendly memory footprint.

## ADR-002: Collision Model — Capsule 3-Circle Sliding
- **Context**: Axis-aligned bounding boxes (AABB) caused frustrating vehicle snagging, corner sticking, and unfair repeated contact damage.
- **Decision**: Implemented a 3-circle capsule representation for the player vehicle with wall sliding projection and recoil velocity damping.
- **Consequences**: Vehicles smoothly deflect off buildings, curbs, and props without getting stuck or trapped in corners.

## ADR-003: Road Network Topology & Courier AI Pathfinding
- **Context**: Traffic and autonomous fleet couriers need reliable navigation across all 4 districts without stalling or colliding into dead ends.
- **Decision**: Standardized a 39-node connected graph (`ROAD_NODES`). Autonomous couriers utilize a breadth-first search (BFS) pathfinder across the network.
- **Consequences**: Tested 1,521 node-pair combinations with zero disconnections; 10,000-tick simulation with 5 active couriers verified zero deadlocks.

## ADR-004: Audio Synthesis — Procedural Web Audio API
- **Context**: Audio files add bundle weight and latency. Prop impacts and engine revs require immediate dynamic feedback.
- **Decision**: Synthesize engine tones, horn alerts, nitro hum, prop hits, and delivery chimes procedurally using Web Audio API oscillators and noise buffers.
- **Consequences**: Zero audio asset download overhead, instantaneous audio response, responsive pitch/gain adjustments based on vehicle speed.

## ADR-005: Mobile-First Responsive Layout & Minimap Separation
- **Context**: In landscape mobile mode, touch action buttons (drift/nitro) risked overlapping the radar minimap.
- **Decision**: Tuned CSS cascade and grid layout to strictly isolate touch control zones to the lower-right and minimap to the upper-right corner.
- **Consequences**: Clean touch usability in both portrait (390x844) and landscape (844x390) viewports without accidental control inputs.
