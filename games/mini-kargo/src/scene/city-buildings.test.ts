import { describe, expect, it } from "vitest";
import * as THREE from "three";
import {
  buildCityBuildings,
  CITY_BUILDINGS_CATALOG,
} from "./city-buildings";
import { createWorldContext } from "./world-kit";
import { createAssetManager } from "./assets";

describe("city buildings system", () => {
  it("includes diverse architectural kinds across all districts", () => {
    expect(CITY_BUILDINGS_CATALOG.length).toBeGreaterThanOrEqual(15);

    const kinds = new Set(CITY_BUILDINGS_CATALOG.map((b) => b.kind));
    expect(kinds.has("apartment")).toBe(true);
    expect(kinds.has("plaza")).toBe(true);
    expect(kinds.has("row_shops")).toBe(true);

    // Her binanın geçerli boyut ve kat sayısına sahip olduğunu doğrula
    for (const b of CITY_BUILDINGS_CATALOG) {
      expect(b.floors).toBeGreaterThanOrEqual(2);
      expect(b.width).toBeGreaterThan(4);
      expect(b.depth).toBeGreaterThan(4);
    }
  });

  it("builds 3D meshes and registers obstacles in world context", () => {
    const group = new THREE.Group();
    const assets = createAssetManager(async () => new THREE.Group());
    const ctx = createWorldContext(group, assets);

    const { group: bGroup, obstacles } = buildCityBuildings(ctx);

    expect(bGroup.children.length).toBe(CITY_BUILDINGS_CATALOG.length);
    expect(obstacles.length).toBe(CITY_BUILDINGS_CATALOG.length);
    expect(ctx.baseObstacles.length).toBeGreaterThanOrEqual(obstacles.length);

    // Binaların engel sınırları pozitif alana sahip olmalı
    for (const obs of obstacles) {
      expect(obs.maxX).toBeGreaterThan(obs.minX);
      expect(obs.maxZ).toBeGreaterThan(obs.minZ);
    }
  });
});
