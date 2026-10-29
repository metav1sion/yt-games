import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { createIceCreamStandView } from "./ice-cream-stand";
import { createIceCreamStandState } from "../game/ice-cream-stand";

describe("Sahil Maraş Dondurmacısı 3D View", () => {
  it("initializes 3D view hierarchy, labels, and colliders", () => {
    const view = createIceCreamStandView();
    expect(view.group.name).toBe("ice-cream-stand-view");
    expect(view.obstacles.length).toBeGreaterThan(0);

    // Kiosk, voleybol sahası ve güneşlenme terası colliders
    const kioskObstacle = view.obstacles.find(
      (o) => o.minX <= -22 && o.maxX >= -20 && o.minZ >= 83 && o.maxZ <= 86,
    );
    expect(kioskObstacle).toBeDefined();

    const netObstacle = view.obstacles.find(
      (o) => o.minX <= -27 && o.maxX >= -27,
    );
    expect(netObstacle).toBeDefined();

    view.dispose();
  });

  it("updates animation and head tracking towards player position", () => {
    const view = createIceCreamStandView();
    const state = createIceCreamStandState();

    // Normal güncelleme
    expect(() => {
      view.update(0.016, state, { x: -23.5, z: 80.5 }, false);
    }).not.toThrow();

    // Gece modu
    expect(() => {
      view.update(0.016, state, { x: -23.5, z: 80.5 }, true);
    }).not.toThrow();

    // Hile/şov animasyonu ve konuşma balonu aktifken
    state.trickActive = true;
    state.honkGreetingTimer = 3.0;
    state.lastHonkCallout = "Test callout";

    expect(() => {
      view.update(0.016, state, { x: -20, z: 80 }, false);
    }).not.toThrow();

    view.dispose();
  });

  it("handles player honk interaction within range", () => {
    const view = createIceCreamStandView();

    // Yakın korna
    const closeSuccess = view.onPlayerHonk({ x: -23.5, z: 80.5 });
    expect(closeSuccess).toBe(true);

    // Uzak korna
    const farSuccess = view.onPlayerHonk({ x: 50, z: 50 });
    expect(farSuccess).toBe(false);

    view.dispose();
  });

  it("cleans up resources and meshes on dispose", () => {
    const view = createIceCreamStandView();
    expect(view.group.children.length).toBeGreaterThan(0);

    view.dispose();
    expect(view.group.children.length).toBe(0);
  });
});
