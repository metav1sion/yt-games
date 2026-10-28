import { describe, it, expect, beforeEach } from "vitest";
import * as THREE from "three";
import { createAtmosphereController } from "./atmosphere";

describe("atmosphere system", () => {
  let renderer: THREE.WebGLRenderer;
  let scene: THREE.Scene;
  let sun: THREE.DirectionalLight;
  let hemi: THREE.HemisphereLight;

  beforeEach(() => {
    renderer = {
      setClearColor: () => {},
    } as unknown as THREE.WebGLRenderer;

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog("#cbe9fc", 80, 180);

    sun = new THREE.DirectionalLight("#fff5eb", 3.2);
    scene.add(sun);
    scene.add(sun.target);

    hemi = new THREE.HemisphereLight("#e2f3ff", "#72b063", 2.2);
    scene.add(hemi);
  });

  it("initializes with noon state and updates time correctly", () => {
    const atmo = createAtmosphereController(renderer, scene, sun, hemi, 240);
    const initial = atmo.getState();

    expect(initial).toBeDefined();
    expect(initial.phase).toBe("noon");
    expect(initial.phaseName).toBe("Öğle");
    expect(initial.phaseIcon).toBe("☀️");
    expect(initial.isNightOrDusk).toBe(false);

    // Update by 60 seconds
    const updated = atmo.update(60, { x: 10, z: 20 });
    expect(updated.time).toBeGreaterThan(initial.time);

    atmo.dispose();
  });

  it("correctly sets and resolves sunset and dusk phases", () => {
    const atmo = createAtmosphereController(renderer, scene, sun, hemi, 240);

    // Set to golden hour
    const golden = atmo.setTime(0.62);
    expect(golden.phase).toBe("golden_hour");
    expect(golden.phaseName).toBe("Gün Batımı");
    expect(golden.phaseIcon).toBe("🌇");
    expect(golden.isNightOrDusk).toBe(true);

    // Set to dusk
    const dusk = atmo.setTime(0.85);
    expect(dusk.phase).toBe("dusk");
    expect(dusk.phaseName).toBe("Alacakaranlık");
    expect(dusk.phaseIcon).toBe("🌙");
    expect(dusk.isNightOrDusk).toBe(true);

    // Set to morning
    const morning = atmo.setTime(0.02);
    expect(morning.phase).toBe("morning");
    expect(morning.phaseName).toBe("Sabah");
    expect(morning.phaseIcon).toBe("🌅");
    expect(morning.isNightOrDusk).toBe(false);

    atmo.dispose();
  });
});
