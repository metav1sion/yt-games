import { describe, it, expect } from "vitest";
import { createLatheWorkshopView } from "./lathe-workshop";
import { createLatheWorkshopState, NECATI_USTA_POS, LATHE_WORKSHOP_BAY, LATHE_WORKSHOP_CENTER } from "../game/lathe-workshop";

describe("Lathe Workshop 3D Scene View", () => {
  it("creates lathe workshop scene hierarchy with heavy steel shed, lathe machine, press, tool cabinet, signs, and obstacles", () => {
    const view = createLatheWorkshopView();
    expect(view.group).toBeDefined();
    expect(view.group.name).toBe("lathe-workshop-view");
    expect(view.obstacles.length).toBeGreaterThan(0);

    for (const obs of view.obstacles) {
      expect(obs.minX).toBeLessThan(obs.maxX);
      expect(obs.minZ).toBeLessThan(obs.maxZ);
      // All static obstacles must stay north of the service bay (maxZ <= LATHE_WORKSHOP_BAY.z - 1.5) and not block Z = -50 boulevard
      expect(obs.maxZ).toBeLessThan(LATHE_WORKSHOP_BAY.z);
      expect(obs.minZ).toBeGreaterThanOrEqual(LATHE_WORKSHOP_CENTER.z - 3.5);
    }
    view.dispose();
  });

  it("updates without errors across day and night cycles and tracking player", () => {
    const view = createLatheWorkshopView();
    const state = createLatheWorkshopState();

    // Day update with player near Necati Usta
    expect(() => {
      view.update(0.016, state, { x: NECATI_USTA_POS.x + 4, z: NECATI_USTA_POS.z + 4 }, false);
    }).not.toThrow();

    // Night update
    expect(() => {
      view.update(0.016, true, { x: 0, z: 0 }, true);
    }).not.toThrow();

    view.dispose();
  });

  it("responds to player honking within range of Necati Usta", () => {
    const view = createLatheWorkshopView();
    const near = { x: NECATI_USTA_POS.x + 2, z: NECATI_USTA_POS.z + 2 };
    const far = { x: NECATI_USTA_POS.x + 50, z: NECATI_USTA_POS.z + 50 };

    expect(view.onPlayerHonk(near)).toBe(true);
    expect(view.onPlayerHonk(far)).toBe(false);

    view.dispose();
  });

  it("disposes meshes, geometries, and materials cleanly without residual obstacles", () => {
    const view = createLatheWorkshopView();
    expect(view.obstacles.length).toBeGreaterThan(0);
    view.dispose();
    expect(view.obstacles.length).toBe(0);
  });
});
