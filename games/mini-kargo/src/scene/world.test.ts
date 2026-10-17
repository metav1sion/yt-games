import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { readFileSync, existsSync } from "node:fs";
import { SUNNY_ROAD_TILES, SUNNY_ROADS, SUNNY_HOMES, SUNNY_DEPOT_APRON } from "./sunny-layout";
import { createWorld } from "./world";
import { createAssetManager, DEFAULT_ASSET_MANIFEST } from "./assets";
import { testCircleVsRect } from "../game/collision";
import { getAvailableHomeIndices } from "../game/districts";

// Catches reordered homes, blocked delivery approaches, disconnected streets,
// and models loaded into a cache but never attached to the game world.
describe("MK-005 sunny world", () => {
  it("keeps four sunny indices and the other districts' destinations", () => {
    const world = createWorld();
    expect(world.homes.slice(0, 4)).toEqual([
      { x: -65, z: -84 }, { x: -35, z: -84 },
      { x: -65, z: -14 }, { x: -35, z: -14 },
    ]);
    expect(world.homes.slice(4)).toEqual([
      { x: 25, z: 30.5 }, { x: 75, z: 30.5 },
      { x: 25, z: 80.5 }, { x: 75, z: 80.5 },
      { x: 25, z: -69 }, { x: 75, z: -69 },
      { x: 25, z: -19 }, { x: 75, z: -19 },
      { x: -75, z: 30.5 }, { x: -25, z: 30.5 },
      { x: -75, z: 80.5 }, { x: -25, z: 80.5 },
    ]);
    expect(getAvailableHomeIndices(1)).toEqual([0, 1, 2, 3]);
    expect(world.updateUnlockedDistricts(4)).toEqual(["market", "industrial", "coastal"]);
    expect(world.barriers.every(b => !b.group.visible)).toBe(true);
  });

  it("leaves delivery zones and their street approaches clear of static obstacles", () => {
    const world = createWorld();
    for (const home of world.homes.slice(0, 4)) {
      // Entire 1.8-unit stop zone is free; approach has vehicle clearance.
      expect(world.obstacles.some(r => testCircleVsRect(home.x, home.z, 1.8, r).hit)).toBe(false);
      const roadZ = home.z + 4;
      for (let z = home.z; z <= roadZ; z += 0.25) {
        expect(world.obstacles.some(r => testCircleVsRect(home.x, z, 1.1, r).hit)).toBe(false);
      }
    }
    expect(world.obstacles.some(r => testCircleVsRect(world.depot.x, world.depot.z, 1.8, r).hit)).toBe(false);
  });

  it("attaches cached suburban and road models to the scene, with per-model fallback", async () => {
    const manager = createAssetManager(async id => {
      if (id.includes("building-type-c")) throw new Error("missing model");
      const g = new THREE.Group();
      g.add(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1)));
      return g;
    });
    await manager.load();
    const world = createWorld(manager);
    const ids: string[] = [];
    world.group.traverse(o => { if (o.userData.assetId) ids.push(o.userData.assetId); });
    expect(ids).toContain("building-type-a");
    expect(ids).toContain("road-straight");
    expect(ids).toContain("road-crossroad");
    expect(ids).not.toContain("building-type-c");
    expect(world.homes).toHaveLength(16);
    expect(DEFAULT_ASSET_MANIFEST.length).toBeGreaterThan(0);
  });
});

// Numeric GLB inspection only: no rendering, screenshots or visual acceptance.
function glb(id: string, pack: string) {
  const bytes = readFileSync(`public/assets/kenney/${pack}/${id}.glb`);
  const jsonLength = bytes.readUInt32LE(12);
  return { json: JSON.parse(bytes.subarray(20, 20 + jsonLength).toString()), binary: bytes.subarray(28 + jsonLength) };
}

it("aligns real road sidewalks along both street directions", () => {
  const { json, binary } = glb("road-straight", "roads");
  const accessor = json.accessors[json.meshes[0].primitives[0].attributes.POSITION];
  const view = json.bufferViews[accessor.bufferView];
  const offset = (view.byteOffset ?? 0) + (accessor.byteOffset ?? 0);
  const vertices: THREE.Vector3[] = [];
  for (let i = 0; i < accessor.count; i++) {
    const p = offset + i * (view.byteStride ?? 12);
    vertices.push(new THREE.Vector3(binary.readFloatLE(p), binary.readFloatLE(p + 4), binary.readFloatLE(p + 8)));
  }
  const indices = json.accessors[json.meshes[0].primitives[0].indices];
  const indexView = json.bufferViews[indices.bufferView];
  const indexOffset = (indexView.byteOffset ?? 0) + (indices.byteOffset ?? 0);
  const indexSize = indices.componentType === 5121 ? 1 : indices.componentType === 5123 ? 2 : 4;
  const sidewalks: THREE.Vector3[] = [];
  for (let i = 0; i < indices.count; i += 3) {
    const triangle = [0, 1, 2].map(j => vertices[indexSize === 1 ? binary.readUInt8(indexOffset + i+j) : indexSize === 2 ? binary.readUInt16LE(indexOffset + (i+j)*2) : binary.readUInt32LE(indexOffset + (i+j)*4)]);
    if (triangle.every(v => v.y > 0.015)) {
      sidewalks.push(triangle.reduce((sum, v) => sum.add(v), new THREE.Vector3()).divideScalar(3));
    }
  }
  expect(sidewalks.length).toBeGreaterThan(0);
  for (const [x, z, direction] of [[-70, -80, "horizontal"], [-80, -70, "vertical"]] as const) {
    const tile = SUNNY_ROAD_TILES.find(t => t.x === x && t.z === z)!;
    for (const vertex of sidewalks) {
      const world = vertex.clone().multiplyScalar(10).applyAxisAngle(new THREE.Vector3(0, 1, 0), tile.rotation);
      // Curbs run beside the road; they must not cap its travel axis.
      expect(Math.abs(direction === "horizontal" ? world.z : world.x)).toBeGreaterThanOrEqual(3.99);
    }
  }
});

it("has one connected tile network with clear links to deliveries, depot and boundary boulevards", () => {
  const world = createWorld();
  const tiles = SUNNY_ROAD_TILES;
  const visited = new Set<number>([0]);
  const queue = [0];
  while (queue.length) {
    const i = queue.shift()!;
    tiles.forEach((tile, j) => {
      if (Math.abs(tile.x - tiles[i].x) + Math.abs(tile.z - tiles[i].z) === 10 && !visited.has(j)) {
        visited.add(j);
        queue.push(j);
      }
    });
  }
  expect(visited.size).toBe(tiles.length);
  expect(new Set(tiles.map(t => `${t.x},${t.z}`)).size).toBe(tiles.length);
  const clearSegment = (a: {x:number; z:number}, b: {x:number; z:number}) => {
    const steps = Math.ceil(Math.hypot(a.x-b.x, a.z-b.z) * 4);
    for (let i = 0; i <= steps; i++) {
      const x = a.x + (b.x-a.x)*i/steps, z = a.z + (b.z-a.z)*i/steps;
      expect(world.obstacles.some(r => testCircleVsRect(x, z, 1.1, r).hit)).toBe(false);
    }
  };
  for (const h of SUNNY_HOMES) {
    const approach = { x: h.x, z: h.delivery.z + 4 };
    expect(SUNNY_ROADS.some(r => approach.x >= r.minX && approach.x <= r.maxX && approach.z >= r.minZ && approach.z <= r.maxZ)).toBe(true);
    clearSegment(h.delivery, approach);
    clearSegment(approach, { x: -50, z: approach.z });
  }
  clearSegment(world.depot, { x: -50, z: world.depot.z });
  expect(world.depot.x).toBeGreaterThan(SUNNY_DEPOT_APRON.minX);
  expect(world.depot.z).toBeLessThan(SUNNY_DEPOT_APRON.maxZ);
  // Existing boundary boulevards overlap the final tiles at -5.
  for (const z of [-80, -50, -10]) clearSegment({ x: -50, z }, { x: 0, z });
  for (const x of [-80, -50, -20]) clearSegment({ x, z: -50 }, { x, z: 0 });
});

it("ships all GLB dependencies locally and keeps scaled houses inside simple colliders", () => {
  for (const item of DEFAULT_ASSET_MANIFEST) {
    const pack = item.id.startsWith("building") ? "suburban" : "roads";
    const { json } = glb(item.id, pack);
    for (const ref of [...(json.images ?? []), ...(json.buffers ?? [])]) {
      if (ref.uri) {
        expect(ref.uri).not.toMatch(/^(https?:|data:)/);
        expect(existsSync(`public/assets/kenney/${pack}/${ref.uri}`)).toBe(true);
      }
    }
    expect(existsSync(`public/assets/kenney/${pack}/License.txt`)).toBe(true);
    for (const home of SUNNY_HOMES.filter(h => h.model === item.id)) {
      for (const primitive of json.meshes[0].primitives) {
        const a = json.accessors[primitive.attributes.POSITION];
        expect(home.x + a.min[0] * 5).toBeGreaterThanOrEqual(home.collider.minX);
        expect(home.x + a.max[0] * 5).toBeLessThanOrEqual(home.collider.maxX);
        expect(home.z + a.min[2] * 5).toBeGreaterThanOrEqual(home.collider.minZ);
        expect(home.z + a.max[2] * 5).toBeLessThanOrEqual(home.collider.maxZ);
      }
    }
  }
});
