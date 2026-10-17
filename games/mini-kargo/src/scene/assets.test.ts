import { describe, it, expect, vi } from "vitest";
import * as THREE from "three";
import { createAssetManager } from "./assets";

describe("3D asset manager and loader", () => {
  it("initializes in idle state with empty models", () => {
    const manager = createAssetManager();
    const state = manager.getState();
    expect(state.state).toBe("idle");
    expect(state.progress).toBe(0);
    expect(manager.getModel("car")).toBeNull();
    expect(manager.cloneModel("car")).toBeNull();
    expect(manager.hasModel("car")).toBe(false);
  });

  it("handles empty manifest gracefully", async () => {
    const manager = createAssetManager();
    const loadedSpy = vi.fn();
    manager.onLoaded(loadedSpy);

    await manager.load([]);

    expect(manager.getState().state).toBe("loaded");
    expect(loadedSpy).toHaveBeenCalled();
  });

  it("handles headless/test environments without crashing and triggers loaded callbacks", async () => {
    const manager = createAssetManager();
    const progressSpy = vi.fn();
    const loadedSpy = vi.fn();

    manager.onProgress(progressSpy);
    manager.onLoaded(loadedSpy);

    // Node/test environment (mock fetch/no network)
    await manager.load([{ id: "car", url: "/models/car.glb" }]);

    expect(manager.getState().state).toBe("loaded");
    expect(loadedSpy).toHaveBeenCalled();
  });

  it("resets state and cached models cleanly", () => {
    const manager = createAssetManager();
    manager.reset();
    expect(manager.getState().state).toBe("idle");
    expect(manager.getModel("car")).toBeNull();
  });
});

it("settles failed loads, keeps successful models, and reuses cached downloads", async () => {
  let requests = 0;
  const manager = createAssetManager(async id => {
    requests++;
    if (id === "missing") throw new Error("404");
    const group = new THREE.Group();
    group.add(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1)));
    return group;
  });
  const manifest = [{ id: "house", url: "./house.glb" }, { id: "missing", url: "./missing.glb" }];
  await expect(manager.load(manifest)).resolves.toBeUndefined();
  expect(manager.getState()).toMatchObject({ state: "loaded", progress: 1, loadedCount: 2 });
  expect(manager.cloneModel("missing")).toBeNull();
  const first = manager.cloneModel("house")!;
  const second = manager.cloneModel("house")!;
  expect(first).not.toBe(second);
  first.position.x = 9;
  expect(second.position.x).toBe(0);
  expect((first.children[0] as THREE.Mesh).geometry).toBe((second.children[0] as THREE.Mesh).geometry);
  await manager.load([{ id: "house", url: "./house.glb" }]);
  expect(requests).toBe(2);
});


it("continues with a complete procedural world when every asset fails", async () => {
  const { createWorld } = await import("./world");
  const manager = createAssetManager(async () => { throw new Error("offline"); });
  await expect(manager.load()).resolves.toBeUndefined();
  const world = createWorld(manager);
  expect(world.homes).toHaveLength(16);
  expect(world.group.children.length).toBeGreaterThan(0);
  expect(world.homes[0]).toEqual({ x: -65, z: -84 });
  expect(world.updateUnlockedDistricts(3)).toEqual(["market", "industrial"]);
  expect(manager.getState().progress).toBe(1);
  const ids: string[] = [];
  world.group.traverse(o => { if (o.userData.assetId) ids.push(o.userData.assetId); });
  expect(ids).toEqual([]);
});
