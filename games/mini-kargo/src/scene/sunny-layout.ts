import type { Rect, Vec2 } from "../game/types";

// Only Sunny's streets and lots. Existing inter-district boulevards stay connected.
export const SUNNY_DEPOT: Vec2 = { x: -62, z: -32 };
export const SUNNY_DEPOT_BUILDING: Vec2 = { x: -62, z: -42 };
export const SUNNY_DEPOT_COLLIDER: Rect = { minX: -67.5, maxX: -56.5, minZ: -46.5, maxZ: -37.5 };
export const SUNNY_HOMES = [
  { index: 0, x: -65, z: -90, model: "building-type-a", color: "#efa265", roof: "#b05e46" },
  { index: 1, x: -35, z: -90, model: "building-type-c", color: "#8abcb0", roof: "#3e6e66" },
  { index: 2, x: -65, z: -20, model: "building-type-c", color: "#f5d475", roof: "#ae6550" },
  { index: 3, x: -35, z: -20, model: "building-type-a", color: "#d9a1a1", roof: "#45766b" },
].map(home => ({
  ...home,
  delivery: { x: home.x, z: home.z + 6 },
  collider: { minX: home.x - 3.8, maxX: home.x + 3.8, minZ: home.z - 3.2, maxZ: home.z + 3.2 },
}));

export type SunnyRoadTile = Vec2 & { model: string; rotation: number };
const columns = [-80, -50, -20];
const rows = [-80, -50, -10];
export const SUNNY_ROAD_TILES: SunnyRoadTile[] = [];
for (const z of rows) {
  for (let x = -90; x <= -10; x += 10) {
    SUNNY_ROAD_TILES.push({ x, z, model: columns.includes(x) ? "road-crossroad" : "road-straight", rotation: 0 });
  }
}
for (const x of columns) {
  for (let z = -90; z <= -10; z += 10) {
    if (!rows.includes(z)) {
      const isDepotJunction = x === -50 && z === -30;
      SUNNY_ROAD_TILES.push({
        x,
        z,
        model: isDepotJunction ? "road-crossroad" : "road-straight",
        rotation: isDepotJunction ? 0 : Math.PI / 2,
      });
    }
  }
}
SUNNY_ROAD_TILES.push({ x: -60, z: -30, model: "road-straight", rotation: 0 });
export const SUNNY_ROADS: Rect[] = [
  ...rows.map(z => ({ minX: -95, maxX: -5, minZ: z - 5, maxZ: z + 5 })),
  ...columns.map(x => ({ minX: x - 5, maxX: x + 5, minZ: -95, maxZ: -5 })),
];
export const SUNNY_DEPOT_APRON: Rect = { minX: -67, maxX: -50, minZ: -35, maxZ: -29 };
