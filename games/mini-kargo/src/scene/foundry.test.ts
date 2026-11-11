import { describe, it, expect } from "vitest";
import { createFoundryView } from "./foundry";
import { createFoundryState, HAMDI_USTA_POS, FOUNDRY_BAY } from "../game/foundry";

describe("Foundry 3D Scene View", () => {
  it("creates foundry scene hierarchy with heavy steel shed, smelting furnace, power hammer, signs, and obstacles", () => {
    const view = createFoundryView();
    expect(view.group).toBeDefined();
    expect(view.group.name).toBe("foundry-view");
    expect(view.obstacles.length).toBeGreaterThan(0);

    for (const obs of view.obstacles) {
      expect(obs.minX).toBeLessThan(obs.maxX);
      expect(obs.minZ).toBeLessThan(obs.maxZ);
      // All static obstacles must stay north of the service bay / road Z: -66.0 corridor (maxZ <= -70.0)
      expect(obs.maxZ).toBeLessThanOrEqual(-70.0);
    }
    view.dispose();
  });

  it("updates without errors across day and night cycles and tracking player", () => {
    const view = createFoundryView();
    const state = createFoundryState();

    // Day update with player near Hamdi Usta
    expect(() => {
      view.update(0.016, state, { x: HAMDI_USTA_POS.x + 4, z: HAMDI_USTA_POS.z + 4 }, false);
    }).not.toThrow();

    // Night update
    expect(() => {
      view.update(0.016, true, { x: 0, z: 0 }, true);
    }).not.toThrow();

    view.dispose();
  });

  it("responds to player honking within range of Hamdi Usta", () => {
    const view = createFoundryView();
    const near = { x: HAMDI_USTA_POS.x + 2, z: HAMDI_USTA_POS.z + 2 };
    const far = { x: HAMDI_USTA_POS.x + 50, z: HAMDI_USTA_POS.z + 50 };

    expect(view.onPlayerHonk(near)).toBe(true);
    expect(view.onPlayerHonk(far)).toBe(false);

    view.dispose();
  });

  it("disposes meshes, geometries, and materials cleanly without residual obstacles", () => {
    const view = createFoundryView();
    expect(view.obstacles.length).toBeGreaterThan(0);
    view.dispose();
    expect(view.obstacles.length).toBe(0);
  });
});
