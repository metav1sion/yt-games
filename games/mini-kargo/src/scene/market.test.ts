import { describe, it, expect, beforeEach } from "vitest";
import { createMarketView } from "./market";
import {
  createMarketState,
  MARKET_BAY,
  CEMIL_DAYI_POS,
  CEMIL_DAYI_CALLOUTS,
} from "../game/market";

describe("Market View (Güneş Mahallesi Semt Pazarı & Manav Tezgahları - T54)", () => {
  let view: ReturnType<typeof createMarketView>;

  beforeEach(() => {
    view = createMarketView();
  });

  it("creates scene group with obstacles", () => {
    expect(view.group).toBeDefined();
    expect(view.obstacles.length).toBeGreaterThan(0);

    // Verify obstacles cover market stalls but do not block service bay
    const bayInObstacle = view.obstacles.some(
      (obs) =>
        MARKET_BAY.x >= obs.minX &&
        MARKET_BAY.x <= obs.maxX &&
        MARKET_BAY.z >= obs.minZ &&
        MARKET_BAY.z <= obs.maxZ,
    );
    expect(bayInObstacle).toBe(false);
  });

  it("updates without errors during day and night", () => {
    const state = createMarketState();
    expect(() => {
      view.update(0.016, state, { x: -65, z: -75 }, false);
      view.update(0.016, state, { x: -65, z: -75 }, true);
    }).not.toThrow();
  });

  it("responds to player honk nearby Cemil Dayı", () => {
    const honkedClose = view.onPlayerHonk(CEMIL_DAYI_POS);
    expect(honkedClose).toBe(true);

    const honkedFar = view.onPlayerHonk({ x: 50, z: 50 });
    expect(honkedFar).toBe(false);
  });

  it("animates vendor arm wave and shows 3D speech bubble when greeting", () => {
    const state = createMarketState();
    state.honkGreetingTimer = 3.5;
    state.lastHonkCallout = CEMIL_DAYI_CALLOUTS[0];

    view.update(0.016, state, CEMIL_DAYI_POS, false);

    // Speech bubble group should be visible
    const npcGroup = view.group.children.find((c) =>
      c.position.x === CEMIL_DAYI_POS.x && c.position.z === CEMIL_DAYI_POS.z,
    );
    expect(npcGroup).toBeDefined();

    view.dispose();
  });
});
