import { describe, it, expect } from "vitest";
import * as THREE from "three";
import { createStreetVendorsView } from "./street-vendors";
import { createStreetVendorState } from "../game/street-vendors";

describe("street vendors 3D view", () => {
  it("creates scene nodes for Simitçi and Kestaneci with pushcarts and animated NPCs", () => {
    const scene = new THREE.Scene();
    const view = createStreetVendorsView();
    scene.add(view.group);

    expect(view.group).toBeDefined();
    // 2 vendors created (Çarşı and Sahil)
    expect(view.group.children.length).toBe(2);

    const state = createStreetVendorState();

    // Update with far player
    expect(() => {
      view.update(0.016, state, { x: 0, z: 0 });
    }).not.toThrow();

    // Update with player close to Simitçi
    expect(() => {
      view.update(0.016, state, { x: 42, z: 47 });
    }).not.toThrow();

    // Player honks
    expect(() => {
      view.onPlayerHonk();
      view.update(0.016, state, { x: 42, z: 47 });
    }).not.toThrow();

    view.dispose();
  });
});
