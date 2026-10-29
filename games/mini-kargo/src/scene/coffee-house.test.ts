import { describe, expect, it } from "vitest";
import { createCoffeeHouseView } from "./coffee-house";
import { createCoffeeHouseState } from "../game/coffee-house";

describe("CoffeeHouse 3D Scene View (T48)", () => {
  it("constructs hierarchy with stone coffeehouse, plane tree, terrace tables, and coffee master NPC", () => {
    const view = createCoffeeHouseView();
    expect(view.group).toBeDefined();
    expect(view.group.name).toBe("coffee-house-view");
    expect(view.obstacles.length).toBeGreaterThan(0);
    // Verifies collider for main stone coffeehouse building and plane tree
    expect(view.obstacles.some((o) => o.minX < 34 && o.maxX > 34)).toBe(true);
    expect(view.obstacles.some((o) => o.minX < 37 && o.maxX > 36)).toBe(true);
    view.dispose();
  });

  it("updates without errors during animation ticks and handles player proximity", () => {
    const view = createCoffeeHouseView();
    const state = createCoffeeHouseState();

    expect(() => {
      view.update(0.016, state, { x: 43.0, z: 56.5 }, false);
      view.update(0.016, state, { x: 43.0, z: 56.5 }, true); // night
    }).not.toThrow();

    view.dispose();
  });

  it("responds to player honk when within range and ignores far honks", () => {
    const view = createCoffeeHouseView();
    const greeted = view.onPlayerHonk({ x: 41.0, z: 58.0 });
    expect(greeted).toBe(true);

    const farGreeted = view.onPlayerHonk({ x: -80.0, z: -80.0 });
    expect(farGreeted).toBe(false);

    view.dispose();
  });

  it("disposes geometries and materials cleanly without throwing", () => {
    const view = createCoffeeHouseView();
    expect(() => view.dispose()).not.toThrow();
    expect(view.group.children.length).toBe(0);
  });
});
