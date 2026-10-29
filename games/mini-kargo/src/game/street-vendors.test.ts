import { describe, it, expect } from "vitest";
import {
  createStreetVendorState,
  stepStreetVendors,
  DEFAULT_STREET_VENDORS,
  SNACK_HOLD_TIME,
  SNACK_COOLDOWN,
  SNACK_ENERGY_DURATION,
} from "./street-vendors";

describe("Traditional Turkish Street Vendors Mechanics", () => {
  it("initializes with zero snacks and full readiness", () => {
    const state = createStreetVendorState();
    expect(state.activeVendorId).toBeNull();
    expect(state.totalSnacksPurchased).toBe(0);
    expect(state.energyBuffTimer).toBe(0);
    expect(state.cooldowns.simit_carsi).toBe(0);
    expect(state.cooldowns.kestane_sahil).toBe(0);
  });

  it("detects when vehicle is within range of Simitçi in Çarşı", () => {
    const state = createStreetVendorState();
    const simitVendor = DEFAULT_STREET_VENDORS.find((v) => v.id === "simit_carsi")!;

    // Player nearby
    const result = stepStreetVendors(state, simitVendor.position, 5.0, 50, 0.1);
    expect(result.state.activeVendorId).toBe("simit_carsi");
    // Not stopped, so hold timer should remain 0
    expect(result.state.holdTimers.simit_carsi).toBe(0);
    expect(result.event).toBeUndefined();
  });

  it("buys a simit when stopped near Simitçi with sufficient money", () => {
    let state = createStreetVendorState();
    const simitVendor = DEFAULT_STREET_VENDORS.find((v) => v.id === "simit_carsi")!;

    // Hold for full SNACK_HOLD_TIME
    const result = stepStreetVendors(
      state,
      simitVendor.position,
      0.5,
      50,
      SNACK_HOLD_TIME + 0.1,
    );

    expect(result.event).toBeDefined();
    expect(result.event?.type).toBe("snack_purchased");
    expect(result.event?.vendor.id).toBe("simit_carsi");
    expect(result.state.totalSnacksPurchased).toBe(1);
    expect(result.state.cooldowns.simit_carsi).toBe(SNACK_COOLDOWN);
    expect(result.state.energyBuffTimer).toBe(SNACK_ENERGY_DURATION);
  });

  it("does not purchase if player cannot afford the 5 ₺ snack", () => {
    const state = createStreetVendorState();
    const simitVendor = DEFAULT_STREET_VENDORS.find((v) => v.id === "simit_carsi")!;

    const result = stepStreetVendors(
      state,
      simitVendor.position,
      0,
      2, // Only 2 TL, needs 5 TL
      SNACK_HOLD_TIME + 0.1,
    );

    expect(result.event).toBeUndefined();
    expect(result.state.totalSnacksPurchased).toBe(0);
  });

  it("respects vendor cooldown after purchase", () => {
    const state = createStreetVendorState();
    state.cooldowns.simit_carsi = 10.0;
    const simitVendor = DEFAULT_STREET_VENDORS.find((v) => v.id === "simit_carsi")!;

    const result = stepStreetVendors(
      state,
      simitVendor.position,
      0,
      50,
      1.5,
    );

    expect(result.event).toBeUndefined();
    expect(result.state.cooldowns.simit_carsi).toBeCloseTo(8.5);
  });

  it("buys chestnuts when stopped near Kestaneci in Sahil", () => {
    const state = createStreetVendorState();
    const kestaneVendor = DEFAULT_STREET_VENDORS.find((v) => v.id === "kestane_sahil")!;

    const result = stepStreetVendors(
      state,
      kestaneVendor.position,
      0.2,
      100,
      SNACK_HOLD_TIME + 0.1,
    );

    expect(result.event).toBeDefined();
    expect(result.event?.type).toBe("snack_purchased");
    expect(result.event?.vendor.id).toBe("kestane_sahil");
    expect(result.state.totalSnacksPurchased).toBe(1);
    expect(result.state.energyBuffTimer).toBe(SNACK_ENERGY_DURATION);
  });
});
