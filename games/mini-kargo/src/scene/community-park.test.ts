import { describe, expect, it } from "vitest";
import { createCommunityParkView } from "./community-park";
import { createCommunityParkState } from "../game/community-park";

describe("CommunityPark 3D Scene View", () => {
  it("constructs hierarchy with park grounds, gazebo, playground, and gardener NPC", () => {
    const view = createCommunityParkView();
    expect(view.group).toBeDefined();
    expect(view.group.name).toBe("community-park");
    expect(view.obstacles.length).toBeGreaterThan(0);
    // Verifies colliders for gazebo and play fortress
    expect(view.obstacles.some((o) => o.minX < -30 && o.maxX > -32)).toBe(true);
    view.dispose();
  });

  it("updates without errors during animation ticks and handles player proximity", () => {
    const view = createCommunityParkView();
    const state = createCommunityParkState();

    expect(() => {
      view.update(0.016, state, { x: -35.0, z: -60.0 }, false);
      view.update(0.016, state, { x: -35.0, z: -60.0 }, true); // night
    }).not.toThrow();

    view.dispose();
  });

  it("responds to player honk when within range and ignores far honks", () => {
    const view = createCommunityParkView();
    const greeted = view.onPlayerHonk({ x: -34.0, z: -60.0 });
    expect(greeted).toBe(true);

    const farGreeted = view.onPlayerHonk({ x: 50.0, z: 50.0 });
    expect(farGreeted).toBe(false);

    view.dispose();
  });

  it("disposes geometries and materials cleanly without throwing", () => {
    const view = createCommunityParkView();
    expect(() => view.dispose()).not.toThrow();
    expect(view.group.children.length).toBe(0);
  });
});
