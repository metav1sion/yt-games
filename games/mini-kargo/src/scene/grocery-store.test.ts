import { describe, expect, it } from "vitest";
import { createGroceryStoreView } from "./grocery-store";
import { createGroceryStoreState } from "../game/grocery-store";

describe("GroceryStore 3D Scene View (T47)", () => {
  it("constructs hierarchy with shop building, striped awning, displays, and grocer NPC", () => {
    const view = createGroceryStoreView();
    expect(view.group).toBeDefined();
    expect(view.group.name).toBe("grocery-store-view");
    expect(view.obstacles.length).toBeGreaterThan(0);
    // Verifies collider for main shop building
    expect(view.obstacles.some((o) => o.minX < -58 && o.maxX > -59)).toBe(true);
    view.dispose();
  });

  it("updates without errors during animation ticks and handles player proximity", () => {
    const view = createGroceryStoreView();
    const state = createGroceryStoreState();

    expect(() => {
      view.update(0.016, state, { x: -55.0, z: -54.0 }, false);
      view.update(0.016, state, { x: -55.0, z: -54.0 }, true); // night
    }).not.toThrow();

    view.dispose();
  });

  it("responds to player honk when within range and ignores far honks", () => {
    const view = createGroceryStoreView();
    const greeted = view.onPlayerHonk({ x: -56.0, z: -54.0 });
    expect(greeted).toBe(true);

    const farGreeted = view.onPlayerHonk({ x: 50.0, z: 50.0 });
    expect(farGreeted).toBe(false);

    view.dispose();
  });

  it("disposes geometries and materials cleanly without throwing", () => {
    const view = createGroceryStoreView();
    expect(() => view.dispose()).not.toThrow();
    expect(view.group.children.length).toBe(0);
  });
});
