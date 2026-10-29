import { describe, it, expect } from "vitest";
import {
  createAutoRepairState,
  updateAutoRepair,
  triggerMechanicHonk,
  AUTO_REPAIR_CENTER,
  AUTO_REPAIR_BAY,
  MECHANIC_MUHARREM_POS,
  CAR_LIFT_POS,
  AUTO_REPAIR_BUFF_DURATION,
  AUTO_REPAIR_COOLDOWN,
  AUTO_REPAIR_DWELL_THRESHOLD,
  MECHANIC_MUHARREM_CALLOUTS,
} from "./auto-repair";

describe("Sanayi Auto Repair Workshop & Lift Logic (T46)", () => {
  it("initializes auto repair state with expected default values", () => {
    const state = createAutoRepairState();
    expect(state.center).toEqual(AUTO_REPAIR_CENTER);
    expect(state.serviceBay).toEqual(AUTO_REPAIR_BAY);
    expect(state.dwellTimer).toBe(0);
    expect(state.buffTimer).toBe(0);
    expect(state.cooldownTimer).toBe(0);
    expect(state.honkGreetingTimer).toBe(0);
    expect(state.lastHonkCallout).toBeUndefined();
    expect(state.liftHeight).toBeGreaterThan(0.4);
    expect(state.liftHeight).toBeLessThan(1.8);
    expect(state.totalRepairs).toBe(0);
  });

  it("animates hydraulic car lift elevation up and down", () => {
    const state = createAutoRepairState();
    state.liftHeight = 1.0;
    state.liftDir = 1;

    // Advance 1 second: lift should move up
    updateAutoRepair(state, 1.0, { x: 0, z: 0 }, 5.0);
    expect(state.liftHeight).toBeGreaterThan(1.0);

    // Force top limit
    state.liftHeight = 1.74;
    state.liftDir = 1;
    updateAutoRepair(state, 0.1, { x: 0, z: 0 }, 5.0);
    expect(state.liftDir).toBe(-1);

    // Force bottom limit
    state.liftHeight = 0.46;
    state.liftDir = -1;
    updateAutoRepair(state, 0.1, { x: 0, z: 0 }, 5.0);
    expect(state.liftDir).toBe(1);
  });

  it("does not trigger pitstop reward if player is far away or driving fast", () => {
    const state = createAutoRepairState();

    // Player far away
    const resFar = updateAutoRepair(state, 1.0, { x: 0, z: 0 }, 0);
    expect(resFar.awardedRepairBonus).toBe(false);
    expect(state.dwellTimer).toBe(0);

    // Player near service bay but speeding
    const resFast = updateAutoRepair(
      state,
      AUTO_REPAIR_DWELL_THRESHOLD + 0.5,
      AUTO_REPAIR_BAY,
      5.0,
    );
    expect(resFast.awardedRepairBonus).toBe(false);
    expect(state.dwellTimer).toBe(0);
  });

  it("awards Sanayi Bakımı reward after dwelling in the service bay", () => {
    const state = createAutoRepairState();

    // Advance dwell time partially
    const resPartial = updateAutoRepair(state, 0.8, AUTO_REPAIR_BAY, 0.5);
    expect(resPartial.awardedRepairBonus).toBe(false);
    expect(state.dwellTimer).toBeCloseTo(0.8);
    expect(state.totalRepairs).toBe(0);

    // Complete dwell time threshold
    const resComplete = updateAutoRepair(state, 0.5, AUTO_REPAIR_BAY, 0.2);
    expect(resComplete.awardedRepairBonus).toBe(true);
    expect(resComplete.cashBonus).toBe(10);
    expect(resComplete.repBonus).toBe(1);
    expect(resComplete.packageRepair).toBe(true);
    expect(resComplete.nitroRefill).toBe(true);
    expect(resComplete.buffActive).toBe(true);
    expect(resComplete.wrenchPlayed).toBe(true);
    expect(resComplete.honkGreeted).toBe(true);
    expect(resComplete.callout).toBe(MECHANIC_MUHARREM_CALLOUTS[0]);

    expect(state.totalRepairs).toBe(1);
    expect(state.cooldownTimer).toBeCloseTo(AUTO_REPAIR_COOLDOWN);
    expect(state.buffTimer).toBeCloseTo(AUTO_REPAIR_BUFF_DURATION);
  });

  it("respects cooldown timer and prevents consecutive immediate rewards", () => {
    const state = createAutoRepairState();

    // Trigger first repair
    updateAutoRepair(
      state,
      AUTO_REPAIR_DWELL_THRESHOLD + 0.1,
      AUTO_REPAIR_BAY,
      0,
    );
    expect(state.totalRepairs).toBe(1);
    expect(state.cooldownTimer).toBeGreaterThan(0);

    // Attempt second dwell during cooldown
    const resDuringCooldown = updateAutoRepair(
      state,
      AUTO_REPAIR_DWELL_THRESHOLD + 0.1,
      AUTO_REPAIR_BAY,
      0,
    );
    expect(resDuringCooldown.awardedRepairBonus).toBe(false);
    expect(state.totalRepairs).toBe(1);

    // Advance past cooldown
    updateAutoRepair(state, AUTO_REPAIR_COOLDOWN + 1.0, { x: 0, z: 0 }, 5);
    expect(state.cooldownTimer).toBe(0);

    // Second repair now succeeds
    const resAfterCooldown = updateAutoRepair(
      state,
      AUTO_REPAIR_DWELL_THRESHOLD + 0.1,
      AUTO_REPAIR_BAY,
      0,
    );
    expect(resAfterCooldown.awardedRepairBonus).toBe(true);
    expect(state.totalRepairs).toBe(2);
  });

  it("handles mechanic Muharrem Usta honk interaction", () => {
    const state = createAutoRepairState();

    // Honk from far away fails
    const farHonk = triggerMechanicHonk(state, { x: 0, z: 0 });
    expect(farHonk).toBe(false);
    expect(state.honkGreetingTimer).toBe(0);

    // Honk near workshop succeeds
    const nearHonk = triggerMechanicHonk(state, AUTO_REPAIR_BAY);
    expect(nearHonk).toBe(true);
    expect(state.honkGreetingTimer).toBe(3.5);
    expect(MECHANIC_MUHARREM_CALLOUTS).toContain(state.lastHonkCallout);

    // Honk timer decays over time
    updateAutoRepair(state, 4.0, { x: 0, z: 0 }, 5);
    expect(state.honkGreetingTimer).toBe(0);
    expect(state.lastHonkCallout).toBeUndefined();
  });
});
