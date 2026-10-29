import { describe, it, expect } from "vitest";
import {
  createGasStationState,
  stepGasStation,
  isVehicleAtFuelPump,
  isVehicleInWashBay,
  FUEL_PUMP_POS,
  FUEL_HOLD_TIME,
  FUEL_COOLDOWN,
  WASH_DURATION,
  WASH_CLEAN_BUFF_DURATION,
  WASH_COOLDOWN,
} from "./gas-station";

describe("Gas Station & Car Wash System (T36)", () => {
  it("initializes clean gas station state with zero progress", () => {
    const state = createGasStationState();
    expect(state.pumpHoldTimer).toBe(0);
    expect(state.pumpProgress).toBe(0);
    expect(state.fuelCooldown).toBe(0);
    expect(state.isWashing).toBe(false);
    expect(state.isClean).toBe(false);
    expect(state.totalRefuels).toBe(0);
    expect(state.totalWashes).toBe(0);
  });

  it("accurately detects when vehicle is at the fuel pump or wash bay", () => {
    expect(isVehicleAtFuelPump(FUEL_PUMP_POS)).toBe(true);
    expect(isVehicleAtFuelPump({ x: FUEL_PUMP_POS.x + 2.0, z: FUEL_PUMP_POS.z })).toBe(true);
    expect(isVehicleAtFuelPump({ x: 0, z: 0 })).toBe(false);

    // Wash bay bounds: x: 56..60.5, z: -12.5..-5.5
    expect(isVehicleInWashBay({ x: 58.0, z: -9.0 })).toBe(true);
    expect(isVehicleInWashBay({ x: 50.0, z: -9.0 })).toBe(false);
  });

  it("handles fuel pump progress and completes refuel when stationary", () => {
    let state = createGasStationState();

    // 1. Vehicle stopped at pump
    const res1 = stepGasStation(state, FUEL_PUMP_POS, 0.2, 0.6);
    state = res1.state;
    expect(res1.event?.type).toBe("fueling");
    expect(state.pumpHoldTimer).toBeCloseTo(0.6, 2);
    expect(state.pumpProgress).toBeCloseTo(0.6 / FUEL_HOLD_TIME, 2);

    // 2. Complete the remaining duration
    const res2 = stepGasStation(state, FUEL_PUMP_POS, 0.1, 0.7);
    state = res2.state;
    expect(res2.event?.type).toBe("fuel_completed");
    if (res2.event?.type === "fuel_completed") {
      expect(res2.event.repBonus).toBe(1);
    }
    expect(state.totalRefuels).toBe(1);
    expect(state.fuelCooldown).toBe(FUEL_COOLDOWN);
    expect(state.pumpHoldTimer).toBe(0);
  });

  it("resets pump hold timer when driving away before completing", () => {
    let state = createGasStationState();
    const res1 = stepGasStation(state, FUEL_PUMP_POS, 0.2, 0.5);
    state = res1.state;
    expect(state.pumpProgress).toBeGreaterThan(0);

    // Move away
    const res2 = stepGasStation(state, { x: 0, z: 0 }, 5.0, 0.5);
    expect(res2.state.pumpHoldTimer).toBeLessThan(state.pumpHoldTimer);
  });

  it("triggers car wash sequence when driving through wash bay and awards clean buff", () => {
    let state = createGasStationState();
    const washBayPos = { x: 58.0, z: -9.0 };

    // 1. Enter wash bay at valid speed
    const res1 = stepGasStation(state, washBayPos, 2.0, 0.1);
    state = res1.state;
    expect(res1.event?.type).toBe("wash_started");
    expect(state.isWashing).toBe(true);
    expect(state.washActiveTimer).toBe(WASH_DURATION);

    // 2. Wash in progress
    const res2 = stepGasStation(state, washBayPos, 1.5, 1.0);
    state = res2.state;
    expect(res2.event?.type).toBe("wash_active");
    expect(state.isWashing).toBe(true);

    // 3. Complete wash duration
    const res3 = stepGasStation(state, washBayPos, 1.0, 1.6);
    state = res3.state;
    expect(res3.event?.type).toBe("wash_completed");
    if (res3.event?.type === "wash_completed") {
      expect(res3.event.cashBonus).toBe(10);
      expect(res3.event.cleanDuration).toBe(WASH_CLEAN_BUFF_DURATION);
    }
    expect(state.isWashing).toBe(false);
    expect(state.isClean).toBe(true);
    expect(state.cleanBuffTimer).toBe(WASH_CLEAN_BUFF_DURATION);
    expect(state.totalWashes).toBe(1);
    expect(state.washCooldown).toBe(WASH_COOLDOWN);
  });

  it("decrements clean buff timer over time", () => {
    let state = createGasStationState();
    state.cleanBuffTimer = 10.0;
    state.isClean = true;

    const res = stepGasStation(state, { x: 0, z: 0 }, 5.0, 3.0);
    expect(res.state.cleanBuffTimer).toBeCloseTo(7.0, 2);
    expect(res.state.isClean).toBe(true);

    const res2 = stepGasStation(res.state, { x: 0, z: 0 }, 5.0, 8.0);
    expect(res2.state.cleanBuffTimer).toBe(0);
    expect(res2.state.isClean).toBe(false);
  });
});
