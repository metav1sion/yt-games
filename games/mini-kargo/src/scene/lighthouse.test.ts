import { describe, expect, it } from "vitest";
import { createLighthouseView } from "./lighthouse";
import { createLighthouseState, LIGHTHOUSE_BAY, RIZA_KAPTAN_POS } from "../game/lighthouse";

describe("Sahil Tarihi Deniz Feneri & Kıyı Kurtarma Rıhtımı 3D View (T53)", () => {
  it("initializes 3D view hierarchy, labels, and colliders", () => {
    const view = createLighthouseView();
    expect(view.group.name).toBe("lighthouse-view");
    expect(view.obstacles.length).toBeGreaterThan(0);

    // Dalgakıran kule kaidesi engeli
    const towerObstacle = view.obstacles.find(
      (o) => o.minX <= -28 && o.maxX >= -28 && o.minZ <= 91 && o.maxZ >= 91,
    );
    expect(towerObstacle).toBeDefined();

    view.dispose();
  });

  it("updates animation and head tracking towards player position safely", () => {
    const view = createLighthouseView();
    const state = createLighthouseState();

    // Normal güncelleme
    expect(() => {
      view.update(0.016, state, { ...LIGHTHOUSE_BAY }, false);
    }).not.toThrow();

    // Gece modu
    expect(() => {
      view.update(0.016, state, { ...LIGHTHOUSE_BAY }, true);
    }).not.toThrow();

    // Geriye dönük uyumluluk: update(dt, isNightOrDusk)
    expect(() => {
      view.update(0.016, true);
    }).not.toThrow();

    view.dispose();
  });

  it("displays 3D speech bubble when honk callout is active", () => {
    const view = createLighthouseView();
    const state = createLighthouseState();

    state.honkGreetingTimer = 3.5;
    state.lastHonkCallout = "⚓ Fenerci Rıza Kaptan: Heyy gidi deniz kurdu! Fenerin ışığı pruvana rehber olsun! 🌊";

    expect(() => {
      view.update(0.016, state, { ...LIGHTHOUSE_BAY }, false);
    }).not.toThrow();

    view.dispose();
  });

  it("responds to onPlayerHonk within 26m radius", () => {
    const view = createLighthouseView();

    const nearPos = { x: RIZA_KAPTAN_POS.x + 2.0, z: RIZA_KAPTAN_POS.z + 2.0 };
    expect(view.onPlayerHonk(nearPos)).toBe(true);

    const farPos = { x: 50, z: 50 };
    expect(view.onPlayerHonk(farPos)).toBe(false);

    view.dispose();
  });
});
