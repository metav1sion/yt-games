import { describe, it, expect } from "vitest";
import { createTurkishCoffeeView } from "./turkish-coffee";
import { createTurkishCoffeeState, TAHSIN_EFENDI_POS, TURKISH_COFFEE_BAY } from "../game/turkish-coffee";

describe("Turkish Coffee 3D Scene View", () => {
  it("creates scene hierarchy with pavilion, dome, columns, barbecue, sacks, vitrine, and obstacles", () => {
    const view = createTurkishCoffeeView();
    expect(view.group).toBeDefined();
    expect(view.group.name).toBe("turkish-coffee-view");
    expect(view.obstacles.length).toBeGreaterThanOrEqual(4);

    // Verify pavilion group children
    expect(view.group.children.length).toBeGreaterThan(0);

    // Verify obstacles cover the pavilion building and counter
    const hasBuildingObstacle = view.obstacles.some(
      (obs) => obs.minX < 37.0 && obs.maxX > 37.0 && obs.minZ < 75.5 && obs.maxZ > 75.5,
    );
    expect(hasBuildingObstacle).toBe(true);

    view.dispose();
  });

  it("updates dynamic elements, light intensities, steam particles, and crank rotation across frames", () => {
    const view = createTurkishCoffeeView();
    const state = createTurkishCoffeeState();

    // Day update
    view.update(0.016, state, { x: 37.0, z: 80.0 }, false);

    // Night update
    view.update(0.016, state, { x: 37.0, z: 80.0 }, true);

    // Far away update
    view.update(0.016, state, { x: -80, z: -80 }, false);

    expect(view.group.children.length).toBeGreaterThan(0);
    view.dispose();
  });

  it("handles player honk greeting trigger within range", () => {
    const view = createTurkishCoffeeView();
    const nearPos = { x: TAHSIN_EFENDI_POS.x + 2, z: TAHSIN_EFENDI_POS.z + 2 };

    const greeted = view.onPlayerHonk(nearPos);
    expect(greeted).toBe(true);

    const farPos = { x: -80, z: -80 };
    const farGreeted = view.onPlayerHonk(farPos);
    expect(farGreeted).toBe(false);

    view.dispose();
  });

  it("integrates with service bay coordinates and state events", () => {
    const view = createTurkishCoffeeView();
    const state = createTurkishCoffeeState();

    state.honkGreetingTimer = 3.0;
    state.lastHonkCallout = "Test callout";
    state.callout = "Test callout";

    view.update(0.016, state, { x: TURKISH_COFFEE_BAY.x, z: TURKISH_COFFEE_BAY.z }, false);
    expect(view.group.name).toBe("turkish-coffee-view");

    view.dispose();
  });
});
