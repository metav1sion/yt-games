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
