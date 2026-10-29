import { describe, it, expect } from "vitest";
import { createCoppersmithView } from "./coppersmith";
import { createCoppersmithState, KAZIM_USTA_POS } from "../game/coppersmith";

describe("Coppersmith 3D Scene View", () => {
  it("creates coppersmith scene hierarchy with authentic bedesten structures and obstacles", () => {
    const view = createCoppersmithView();
    expect(view.group).toBeDefined();
    expect(view.group.name).toBe("coppersmith-view");
    expect(view.obstacles.length).toBeGreaterThan(0);

    const obs = view.obstacles[0];
    expect(obs.minX).toBeLessThan(obs.maxX);
    expect(obs.minZ).toBeLessThan(obs.maxZ);
    view.dispose();
  });

  it("updates without errors across day and night cycles and tracking player", () => {
    const view = createCoppersmithView();
    const state = createCoppersmithState();

    // Day update
    expect(() => {
      view.update(0.016, state, { x: KAZIM_USTA_POS.x + 5, z: KAZIM_USTA_POS.z + 5 }, false);
    }).not.toThrow();

    // Night update
    expect(() => {
      view.update(0.016, true, { x: 0, z: 0 }, true);
    }).not.toThrow();

    view.dispose();
  });

  it("responds to player honking within range", () => {
    const view = createCoppersmithView();
    const near = { x: KAZIM_USTA_POS.x + 2, z: KAZIM_USTA_POS.z + 2 };
    const far = { x: KAZIM_USTA_POS.x + 50, z: KAZIM_USTA_POS.z + 50 };

    expect(view.onPlayerHonk(near)).toBe(true);
    expect(view.onPlayerHonk(far)).toBe(false);

    view.dispose();
  });

  it("disposes meshes, geometries, and materials cleanly", () => {
    const view = createCoppersmithView();
    expect(view.obstacles.length).toBeGreaterThan(0);
    view.dispose();
    expect(view.obstacles.length).toBe(0);
  });
});
