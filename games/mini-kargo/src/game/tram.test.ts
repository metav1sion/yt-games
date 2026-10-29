import { describe, it, expect } from "vitest";
import {
  createTramState,
  updateTram,
  triggerTramHonk,
  TRAM_LINE_Z,
  TRAM_MIN_X,
  TRAM_MAX_X,
  TRAM_STATION_STOP_X,
  TRAM_STATION_POS,
  TRAM_CRUISE_SPEED,
} from "./tram";

describe("game/tram", () => {
  it("initializes with correct defaults and positions on the track", () => {
    const state = createTramState();
    expect(state.position.z).toBe(TRAM_LINE_Z);
    expect(state.direction).toBe(1);
    expect(state.speed).toBe(0);
    expect(state.phase).toBe("cruising");
    expect(state.totalVisits).toBe(0);
    expect(state.cooldownTimer).toBe(0);
  });

  it("accelerates and cruises along the track toward the station and east terminus", () => {
    const state = createTramState();
    state.position.x = 20.0;

    // Simulate 2 seconds of cruising
    updateTram(state, 1.0, { x: 0, z: 0 }, 0);
    expect(state.speed).toBeGreaterThan(0);
    expect(state.position.x).toBeGreaterThan(20.0);

    updateTram(state, 1.0, { x: 0, z: 0 }, 0);
    expect(state.speed).toBeCloseTo(TRAM_CRUISE_SPEED, 0.5);
  });

  it("dwells at Çarşı station and rings departure bell", () => {
    const state = createTramState();
    state.position.x = TRAM_STATION_STOP_X - 0.2;
    state.speed = 1.0;

    // Approach and stop at station
    const event1 = updateTram(state, 0.5, { x: 0, z: 0 }, 0);
    expect(state.phase).toBe("dwelling");
    expect(state.position.x).toBe(TRAM_STATION_STOP_X);
    expect(event1.bellRung).toBe(true);

    // Dwell for 4.2 seconds
    updateTram(state, 4.2, { x: 0, z: 0 }, 0);
    expect(state.phase).toBe("cruising");
    expect(state.speed).toBeGreaterThanOrEqual(0);
  });

  it("decelerates at terminus, reverses direction, and rings bell", () => {
    const state = createTramState();
    state.position.x = TRAM_MAX_X - 0.2;
    state.speed = 2.0;
    state.direction = 1;

    // Reach terminus
    const ev1 = updateTram(state, 0.5, { x: 0, z: 0 }, 0);
    expect(state.position.x).toBe(TRAM_MAX_X);
    expect(state.phase).toBe("dwelling");
    expect(ev1.bellRung).toBe(true);

    // Complete terminus dwell
    const ev2 = updateTram(state, 3.8, { x: 0, z: 0 }, 0);
    expect(state.direction).toBe(-1); // Switched direction to West!
    expect(state.phase).toBe("cruising");
    expect(ev2.bellRung).toBe(true);
  });

  it("yields and brakes when player vehicle blocks the track ahead", () => {
    const state = createTramState();
    state.position.x = 30.0;
    state.speed = 3.0;
    state.direction = 1;

    // Player parked on track at x=34.0, z=34.0 (4 meters ahead)
    const event = updateTram(state, 0.2, { x: 34.0, z: TRAM_LINE_Z }, 0);
    expect(state.phase).toBe("yielding");
    expect(state.targetSpeed).toBe(0);

    // If player leaves track (z=40.0)
    updateTram(state, 0.2, { x: 34.0, z: 40.0 }, 0);
    expect(state.phase).toBe("cruising");
    expect(state.targetSpeed).toBe(TRAM_CRUISE_SPEED);
  });

  it("triggers honk greeting when player honks within range", () => {
    const state = createTramState();
    state.position.x = 40.0;

    // Too far away (>16m)
    const greetedFar = triggerTramHonk(state, { x: 10.0, z: 10.0 });
    expect(greetedFar).toBe(false);

    // Nearby (6m away)
    const greetedNear = triggerTramHonk(state, { x: 42.0, z: 36.0 });
    expect(greetedNear).toBe(true);
    expect(state.honkGreetingTimer).toBeGreaterThan(0);
    expect(state.lastHonkCallout).toBeDefined();
    expect(state.bellPending).toBe(true);

    const event = updateTram(state, 0.1, { x: 42.0, z: 36.0 }, 0);
    expect(event.honkGreeted).toBe(true);
    expect(event.bellRung).toBe(true);
  });

  it("awards Tarihi Tramvay Hatırası bonus upon lingering near station or tram", () => {
    const state = createTramState();
    state.position.x = 48.0;

    // Player arrives at station platform
    const event1 = updateTram(state, 0.5, TRAM_STATION_POS, 0.5);
    expect(event1.awardedHeritageBonus).toBe(false);

    // Linger for another 0.8s (total > 1.2s)
    const event2 = updateTram(state, 0.8, TRAM_STATION_POS, 0.5);
    expect(event2.awardedHeritageBonus).toBe(true);
    expect(event2.cashBonus).toBe(10);
    expect(event2.repBonus).toBe(1);
    expect(state.totalVisits).toBe(1);
    expect(state.cooldownTimer).toBe(30.0);

    // Cooldown prevents immediate re-awarding
    const event3 = updateTram(state, 1.5, TRAM_STATION_POS, 0.5);
    expect(event3.awardedHeritageBonus).toBe(false);
  });
});
