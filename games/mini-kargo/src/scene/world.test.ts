import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { readFileSync, existsSync } from "node:fs";
import { SUNNY_ROAD_TILES, SUNNY_ROADS, SUNNY_HOMES, SUNNY_DEPOT_APRON } from "./sunny-layout";
import { createWorld } from "./world";
import { DISTRICT_TRAFFIC } from "./traffic";
import { DISTRICT_PEDESTRIANS } from "./pedestrians";
import { createAssetManager, DEFAULT_ASSET_MANIFEST } from "./assets";
import { testCircleVsRect } from "../game/collision";
import { getAvailableHomeIndices, getDistrictForHome, districts } from "../game/districts";

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
      { x: 25, z: 31.5 }, { x: 75, z: 31.5 },
      { x: 25, z: 81.5 }, { x: 75, z: 81.5 },
      { x: 25, z: -68 }, { x: 75, z: -68 },
      { x: 25, z: -18 }, { x: 75, z: -18 },
      { x: -75, z: 31.5 }, { x: -25, z: 31.5 },
      { x: -75, z: 81.5 }, { x: -25, z: 81.5 },
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
    const [, pack, file] = item.url.match(/kenney\/([^/]+)\/([^/]+)\.glb$/)!;
    const { json } = glb(file, pack);
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

describe("world district structure", () => {
  it("maps every home index to a district and keeps delivery points clear once all districts are unlocked", () => {
    const world = createWorld();
    world.updateUnlockedDistricts(4);
    expect(world.homes).toHaveLength(districts.reduce((n, d) => n + d.homeIndices.length, 0));
    world.homes.forEach((home, i) => {
      expect(getDistrictForHome(i)).toBeDefined();
      expect(
        world.obstacles.some(r => testCircleVsRect(home.x, home.z, 1.8, r).hit),
        `home ${i} delivery blocked`,
      ).toBe(false);
      expect(home.x).toBeGreaterThan(world.bounds.minX);
      expect(home.x).toBeLessThan(world.bounds.maxX);
      expect(home.z).toBeGreaterThan(world.bounds.minZ);
      expect(home.z).toBeLessThan(world.bounds.maxZ);
    });
  });

  it("blocks locked district entrances until their unlock level and removes them after", () => {
    const world = createWorld();
    const lockedCount = world.obstacles.length;
    for (const b of world.barriers) {
      expect(b.group.visible).toBe(true);
      expect(b.obstacles.length).toBeGreaterThan(0);
    }
    world.updateUnlockedDistricts(2);
    expect(world.barriers.find(b => b.districtId === "market")!.group.visible).toBe(false);
    expect(world.barriers.find(b => b.districtId === "industrial")!.group.visible).toBe(true);
    expect(world.obstacles.length).toBeLessThan(lockedCount);
  });
});

// Gerçek GLB sınır kutularıyla (render yok) tüm Kenney modelleri yüklüyken harita tutarlılığı.
describe("world with every manifest model loaded", () => {
  async function loadedWorld() {
    const manager = createAssetManager(async (_id, url) => {
      const [, pack, file] = url.match(/kenney\/([^/]+)\/([^/]+)\.glb$/)!;
      const { json } = glb(file, pack);
      const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
      for (const mesh of json.meshes) for (const prim of mesh.primitives) {
        const a = json.accessors[prim.attributes.POSITION];
        for (let k = 0; k < 3; k++) { min[k] = Math.min(min[k], a.min[k]); max[k] = Math.max(max[k], a.max[k]); }
      }
      const g = new THREE.Group();
      const m = new THREE.Mesh(new THREE.BoxGeometry(max[0] - min[0], max[1] - min[1], max[2] - min[2]));
      m.position.set((min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2);
      g.add(m);
      return g;
    });
    await manager.load();
    const world = createWorld(manager);
    world.updateUnlockedDistricts(4);
    return world;
  }

  it("keeps every delivery stop clear of colliders", async () => {
    const world = await loadedWorld();
    world.homes.forEach((h, i) => {
      expect(world.obstacles.some(r => testCircleVsRect(h.x, h.z, 1.8, r).hit), `home ${i}`).toBe(false);
    });
    expect(world.obstacles.some(r => testCircleVsRect(world.depot.x, world.depot.z, 1.8, r).hit)).toBe(false);
  });

  it("keeps boulevard centrelines drivable across the whole map", async () => {
    const world = await loadedWorld();
    for (const c of [-50, 0, 50]) {
      for (let t = -95; t <= 95; t += 0.5) {
        for (const [x, z] of [[c, t], [t, c]]) {
          // Çarşı meydanındaki çeşme kasıtlı bir ada (çevresinden dönülür); onun dışında eksen açık olmalı.
          if (Math.hypot(x - 50, z - 50) < 7) continue;
          const blocker = world.obstacles.find(r => testCircleVsRect(x, z, 1.1, r).hit);
          expect(blocker, `blocked at ${x},${z}`).toBeUndefined();
        }
      }
    }
  });

  it("keeps district traffic lanes clear of model colliders", async () => {
    const world = await loadedWorld();
    for (const car of DISTRICT_TRAFFIC) {
      for (let t = car.min ?? -90; t <= (car.max ?? 90); t += 0.5) {
        const x = car.axis === "x" ? t : car.position.x;
        const z = car.axis === "z" ? t : car.position.z;
        expect(world.obstacles.some(r => testCircleVsRect(x, z, 0.7, r).hit), `${car.district} ${x},${z}`).toBe(false);
      }
    }
  });

  it("attaches district models", async () => {
    const world = await loadedWorld();
    const ids = new Set<string>();
    world.group.traverse(o => { if (o.userData.assetId) ids.add(o.userData.assetId); });
    for (const id of ["commercial/building-a", "industrial/building-a", "industrial/shipping-container-a", "nature/tree_palmTall"]) {
      expect(ids.has(id), id).toBe(true);
    }
  });
});

describe("district traffic lanes", () => {
  it("never route traffic through buildings or props, with or without loaded models", async () => {
    const plain = createWorld();
    plain.updateUnlockedDistricts(4);
    for (const car of DISTRICT_TRAFFIC) {
      const min = car.min ?? -90, max = car.max ?? 90;
      for (let t = min; t <= max; t += 0.5) {
        const x = car.axis === "x" ? t : car.position.x;
        const z = car.axis === "z" ? t : car.position.z;
        expect(plain.obstacles.some(r => testCircleVsRect(x, z, 0.7, r).hit), `${car.district} lane at ${x},${z}`).toBe(false);
      }
    }
  });

  it("never route district pedestrians into building colliders", async () => {
    const plain = createWorld();
    plain.updateUnlockedDistricts(4);
    for (const ped of DISTRICT_PEDESTRIANS) {
      const min = ped.min ?? -ped.limit!;
      const max = ped.max ?? ped.limit!;
      for (let t = min; t <= max; t += 0.5) {
        const x = ped.axis === "x" ? t : ped.position.x;
        const z = ped.axis === "z" ? t : ped.position.z;
        expect(plain.obstacles.some(r => testCircleVsRect(x, z, 0.3, r).hit), `${ped.district} pedestrian at ${x},${z}`).toBe(false);
      }
    }
  });

  it("allows unlocking individual districts via extraUnlocked at level 1 (BuyPad purchase)", () => {
    const world = createWorld();
    expect(world.isDistrictUnlocked("market")).toBe(false);
    expect(world.barriers.find((b) => b.districtId === "market")?.group.visible).toBe(true);

    const initialObstacles = world.obstacles.length;
    const newly = world.updateUnlockedDistricts(1, ["market"]);
    expect(newly).toEqual(["market"]);
    expect(world.isDistrictUnlocked("market")).toBe(true);
    expect(world.barriers.find((b) => b.districtId === "market")?.group.visible).toBe(false);
    expect(world.obstacles.length).toBeLessThan(initialObstacles);
  });
});
