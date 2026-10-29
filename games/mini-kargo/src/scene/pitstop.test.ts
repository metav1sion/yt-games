import { describe, it, expect } from "vitest";
import * as THREE from "three";
import { createPitstopView } from "./pitstop";
import { createPitstopState } from "../game/pitstop";

describe("pitstop 3D view", () => {
  it("creates scene hierarchy with kiosks, canopy, ground ring and billboard sign", () => {
    const scene = new THREE.Scene();
    const view = createPitstopView();
    scene.add(view.group);

    expect(view.group).toBeDefined();
    expect(view.group.children.length).toBeGreaterThan(5);

    // Update with default standby state
    const state = createPitstopState();
    expect(() => {
      view.update(0.016, state, { x: 0, z: 0 });
    }).not.toThrow();

    // Update with active charging state
    state.isCharging = true;
    state.chargeProgress = 0.5;
    expect(() => {
      view.update(0.016, state, { x: -66, z: -25 });
    }).not.toThrow();

    // Update with supercharged state
    state.isCharging = false;
    state.isSupercharged = true;
    expect(() => {
      view.update(0.016, state, { x: -50, z: -30 });
    }).not.toThrow();

    view.dispose();
  });
});
