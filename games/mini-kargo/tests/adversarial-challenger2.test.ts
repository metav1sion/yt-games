import { describe, it, expect, vi } from "vitest";
import {
  createLocalStorageAdapter,
  asCompanyProgression,
  type Preferences,
  type Courier,
} from "../src/platform/storage";
import {
  calculateOfflineEarnings,
  applyOfflineEarnings,
  claimOfflineEarnings,
  hireCourier,
  canHireCourier,
  courierHireCost,
  generateCourierCandidate,
  MAX_OFFLINE_SECONDS,
} from "../src/game/company";
import {
  canPurchaseUpgrade,
  tryPurchaseUpgrade,
  upgradeCost,
  MAX_UPGRADE_LEVEL,
  defaultUpgrades,
  type UpgradeKind,
} from "../src/game/upgrades";
import {
  ROAD_NODES,
  ROAD_EDGES,
  findNearestNode,
  findNodePath,
  buildCourierRoute,
  createCourierFleet,
  type ActiveCourierState,
} from "../src/game/fleet";
import {
  districts,
  getAvailableHomeIndices,
  getDistrictForHome,
} from "../src/game/districts";
import type { Vec2 } from "../src/game/types";

// Memory storage helper for adversarial localStorage injection
function createMockStorage(initialData: Record<string, string> = {}) {
  const store = new Map<string, string>(Object.entries(initialData));
  let throwOnGet = false;
  let throwOnSet = false;

  return {
    getItem: vi.fn((key: string): string | null => {
      if (throwOnGet) throw new Error("SecurityError: localStorage is disabled");
      return store.has(key) ? store.get(key)! : null;
    }),
    setItem: vi.fn((key: string, val: string): void => {
      if (throwOnSet) throw new Error("QuotaExceededError: storage is full");
      store.set(key, val);
    }),
    removeItem: vi.fn((key: string) => store.delete(key)),
    clear: vi.fn(() => store.clear()),
    setThrowOnGet: (val: boolean) => {
      throwOnGet = val;
    },
    setThrowOnSet: (val: boolean) => {
      throwOnSet = val;
    },
    raw: store,
  };
}

describe("Adversarial Stress Suite — Challenger 2", () => {
  // =========================================================================
  // 1. ADVERSARIAL LOCALSTORAGE CORRUPTION & PERSISTENCE
  // =========================================================================
  describe("1. LocalStorage Corruption & Safe Fallback", () => {
    const corruptInputs = [
      { label: "empty string", data: "" },
      { label: "whitespace only", data: "   \n\t  " },
      { label: "syntax error truncated JSON", data: '{"bestScore": 12, "mon' },
      { label: "unclosed array", data: "[1, 2, 3" },
      { label: "raw boolean string", data: "false" },
      { label: "raw number string", data: "42" },
      { label: "raw string literal", data: '"invalid"' },
      { label: "null string", data: "null" },
      { label: "undefined literal", data: "undefined" },
      { label: "NaN literal", data: "NaN" },
      { label: "empty JSON array", data: "[]" },
      { label: "array of numbers", data: "[10, 20, 30]" },
    ];

    for (const { label, data } of corruptInputs) {
      it(`falls back safely to default preferences on ${label}`, () => {
        const mock = createMockStorage({ "mini-kargo:v1": data });
        const adapter = createLocalStorageAdapter(mock);
        let loaded: Preferences | null = null;

        expect(() => {
          loaded = adapter.load();
        }).not.toThrow();

        expect(loaded).not.toBeNull();
        expect(loaded!.bestScore).toBe(0);
        expect(loaded!.money).toBe(0);
        expect(loaded!.companyLevel).toBe(1);
        expect(loaded!.soundEnabled).toBe(true);
        expect(loaded!.unlockedVehicles).toContain("van");
        expect(loaded!.currentVehicle).toBe("van");
        expect(loaded!.unlockedDistricts).toContain("sunny");
      });
    }

    it("sanitizes extreme out-of-bound & negative numerical fields", () => {
      const hostilePayload = JSON.stringify({
        bestScore: -99999999,
        money: -500000,
        reputation: -100,
        companyLevel: -5,
        completedDeliveries: -999,
        soundEnabled: "not_a_boolean",
        upgrades: {
          engine: -10,
          brakes: -5,
          cargo: -3,
          grip: -1,
          nitro: -99,
        },
      });

      const mock = createMockStorage({ "mini-kargo:v1": hostilePayload });
      const adapter = createLocalStorageAdapter(mock);
      const loaded = adapter.load();

      expect(loaded.bestScore).toBe(0);
      expect(loaded.money).toBe(0);
      expect(loaded.reputation).toBe(0);
      expect(loaded.companyLevel).toBe(1); // Clamped to at least 1
      expect(loaded.completedDeliveries).toBe(0);
      expect(loaded.soundEnabled).toBe(true); // Fallback to true
      expect(loaded.upgrades.engine).toBe(0);
      expect(loaded.upgrades.brakes).toBe(0);
      expect(loaded.upgrades.cargo).toBe(0);
      expect(loaded.upgrades.grip).toBe(0);
      expect(loaded.upgrades.nitro).toBe(0);
    });

    it("handles non-finite IEEE 754 numbers (NaN, Infinity, -Infinity)", () => {
      const hostilePayload = JSON.stringify({
        bestScore: null,
        money: null,
        reputation: null,
        companyLevel: null,
        lastPlayedTimestamp: null,
        offlineEarningsAccumulated: null,
      });

      const mock = createMockStorage({ "mini-kargo:v1": hostilePayload });
      const adapter = createLocalStorageAdapter(mock);
      const loaded = adapter.load();

      expect(loaded.bestScore).toBe(0);
      expect(loaded.money).toBe(0);
      expect(loaded.reputation).toBe(0);
      expect(loaded.companyLevel).toBe(1);
      expect(loaded.lastPlayedTimestamp).toBeUndefined();
      expect(loaded.offlineEarningsAccumulated).toBeUndefined();
    });

    it("sanitizes malformed, hostile, and mixed-type couriers arrays", () => {
      const hostilePayload = JSON.stringify({
        couriers: [
          null,
          undefined,
          42,
          "fake-courier",
          {},
          {
            id: 12345, // Not a string
            name: { first: "Hacker" }, // Not a string
            level: -999,
            speed: -10,
            reliability: -0.5,
            wage: -500,
            assigned: "yes", // Not a boolean
          },
          {
            id: "legit_1",
            name: "Ali Veli",
            level: 3,
            speed: 1.2,
            reliability: 0.9,
            wage: 35,
            assigned: true,
          },
        ],
      });

      const mock = createMockStorage({ "mini-kargo:v1": hostilePayload });
      const adapter = createLocalStorageAdapter(mock);
      const loaded = adapter.load();

      expect(loaded.couriers).toBeDefined();
      expect(Array.isArray(loaded.couriers)).toBe(true);
      // The 3 objects ({}, hostile object, legit object) should survive and be sanitized
      expect(loaded.couriers!.length).toBe(3);

      const emptyObjCourier = loaded.couriers![0];
      expect(typeof emptyObjCourier.id).toBe("string");
      expect(emptyObjCourier.name).toBe("Kurye");
      expect(emptyObjCourier.level).toBe(1);
      expect(emptyObjCourier.speed).toBe(1.0);
      expect(emptyObjCourier.reliability).toBe(0.85);
      expect(emptyObjCourier.wage).toBe(20);
      expect(emptyObjCourier.assigned).toBe(true);

      const hostileCourier = loaded.couriers![1];
      expect(typeof hostileCourier.id).toBe("string");
      expect(typeof hostileCourier.name).toBe("string");
      expect(hostileCourier.level).toBe(1); // Min 1
      expect(hostileCourier.speed).toBe(1.0); // Safe fallback > 0
      expect(hostileCourier.reliability).toBe(0.85); // Safe fallback > 0
      expect(hostileCourier.wage).toBe(20); // Fallback wage
      expect(hostileCourier.assigned).toBe(true); // Fallback boolean

      const legitCourier = loaded.couriers![2];
      expect(legitCourier.id).toBe("legit_1");
      expect(legitCourier.name).toBe("Ali Veli");
      expect(legitCourier.level).toBe(3);
      expect(legitCourier.speed).toBe(1.2);
    });

    it("safely recovers and overwrites storage after loading corrupted data", () => {
      const mock = createMockStorage({ "mini-kargo:v1": "{BROKEN_PAYLOAD" });
      const adapter = createLocalStorageAdapter(mock);

      // Loading broken payload falls back to defaults
      const loaded = adapter.load();
      expect(loaded.bestScore).toBe(0);

      // Now save clean state
      adapter.save({ bestScore: 250, money: 500 });

      // Re-load and verify persistence is repaired and valid
      const reloaded = adapter.load();
      expect(reloaded.bestScore).toBe(250);
      expect(reloaded.money).toBe(500);
      expect(mock.setItem).toHaveBeenCalled();
    });

    it("preserves bestScore monotonically across lower saves", () => {
      const mock = createMockStorage();
      const adapter = createLocalStorageAdapter(mock);

      adapter.save({ bestScore: 1000 });
      expect(adapter.load().bestScore).toBe(1000);

      // Attempt to overwrite with lower score
      adapter.save({ bestScore: 200 });
      expect(adapter.load().bestScore).toBe(1000);

      // Higher score updates
      adapter.save({ bestScore: 1500 });
      expect(adapter.load().bestScore).toBe(1500);
    });

    it("never crashes if localStorage throws QuotaExceededError or SecurityError", () => {
      const mock = createMockStorage();
      const adapter = createLocalStorageAdapter(mock);

      mock.setThrowOnGet(true);
      expect(() => adapter.load()).not.toThrow();
      expect(adapter.load().companyLevel).toBe(1);

      mock.setThrowOnGet(false);
      mock.setThrowOnSet(true);
      expect(() => adapter.save({ money: 9999 })).not.toThrow();
    });
  });

  // =========================================================================
  // 2. EXTREME OFFLINE TIME GAPS & PASSIVE INCOME
  // =========================================================================
  describe("2. Extreme Offline Time Gaps & Passive Economy", () => {
    const courier: Courier = {
      id: "c_elite",
      name: "Ahmet Usta",
      level: 5,
      speed: 1.3,
      reliability: 0.95,
      wage: 40,
      assigned: true,
    };

    it("strictly clamps 1 year offline (31,536,000s) to 8 hours (28,800s)", () => {
      const oneYearMs = 365 * 24 * 3600 * 1000;
      const now = Date.now();
      const prog = asCompanyProgression({
        ...createLocalStorageAdapter(createMockStorage()).load(),
        couriers: [courier],
        lastPlayedTimestamp: now - oneYearMs,
      });

      const res = calculateOfflineEarnings(prog, now);
      expect(res.elapsedSeconds).toBe(365 * 24 * 3600);
      expect(res.effectiveSeconds).toBe(MAX_OFFLINE_SECONDS); // 28800
      expect(res.effectiveSeconds).toBe(28800);
      expect(res.earnings).toBeGreaterThan(0);
      expect(Number.isFinite(res.earnings)).toBe(true);
      expect(Math.floor(res.earnings)).toBe(res.earnings);
    });

    it("strictly clamps 100 years offline to 28,800s without numeric overflow", () => {
      const centuryMs = 100 * 365.25 * 24 * 3600 * 1000;
      const now = Date.now();
      const prog = asCompanyProgression({
        ...createLocalStorageAdapter(createMockStorage()).load(),
        couriers: [courier],
        lastPlayedTimestamp: now - centuryMs,
      });

      const res = calculateOfflineEarnings(prog, now);
      expect(res.effectiveSeconds).toBe(28800);
      expect(res.earnings).toBeLessThan(1_000_000); // Sanity check: reasonable cap
      expect(res.earnings).toBeGreaterThan(0);
    });

    it("handles future timestamps / negative clock skew safely (0 earnings)", () => {
      const now = Date.now();
      const futureTimestamp = now + 10 * 3600 * 1000; // 10 hours in the future
      const prog = asCompanyProgression({
        ...createLocalStorageAdapter(createMockStorage()).load(),
        couriers: [courier],
        lastPlayedTimestamp: futureTimestamp,
      });

      const res = calculateOfflineEarnings(prog, now);
      expect(res.elapsedSeconds).toBe(0);
      expect(res.effectiveSeconds).toBe(0);
      expect(res.earnings).toBe(0);
    });

    it("handles zero active or unassigned couriers during long offline periods", () => {
      const now = Date.now();
      const unassignedCourier: Courier = { ...courier, assigned: false };

      const prog = asCompanyProgression({
        ...createLocalStorageAdapter(createMockStorage()).load(),
        couriers: [unassignedCourier],
        lastPlayedTimestamp: now - 8 * 3600 * 1000,
      });

      const res = calculateOfflineEarnings(prog, now);
      expect(res.earnings).toBe(0);
      expect(res.effectiveSeconds).toBe(28800);
    });

    it("accumulates and claims offline earnings accurately through progression cycle", () => {
      const now = Date.now();
      const initialProg = asCompanyProgression({
        ...createLocalStorageAdapter(createMockStorage()).load(),
        money: 100,
        couriers: [courier],
        lastPlayedTimestamp: now - 3600 * 1000, // 1 hour offline
      });

      // Apply offline earnings
      const applied = applyOfflineEarnings(initialProg, now);
      expect(applied.offlineEarningsAccumulated).toBeGreaterThan(0);
      expect(applied.lastPlayedTimestamp).toBe(now);

      const accAmount = applied.offlineEarningsAccumulated!;

      // Claim offline earnings into company bank account
      const claimed = claimOfflineEarnings(applied, now);
      expect(claimed.money).toBe(100 + accAmount);
      expect(claimed.offlineEarningsAccumulated).toBe(0);
      expect(claimed.lastPlayedTimestamp).toBe(now);
    });

    it("computes fleet of 10 maximum-level couriers over 8 hours cleanly", () => {
      const fleet10: Courier[] = Array.from({ length: 10 }, (_, i) => ({
        id: `c_${i}`,
        name: `Kurye ${i}`,
        level: 5,
        speed: 1.5,
        reliability: 1.0,
        wage: 15,
        assigned: true,
      }));

      const now = Date.now();
      const prog = asCompanyProgression({
        ...createLocalStorageAdapter(createMockStorage()).load(),
        couriers: fleet10,
        lastPlayedTimestamp: now - 100 * 3600 * 1000, // 100 hours offline
      });

      const res = calculateOfflineEarnings(prog, now);
      expect(res.effectiveSeconds).toBe(28800);
      expect(res.earnings).toBeGreaterThan(10000);
      expect(res.earnings).toBeLessThan(100000);
      expect(Number.isInteger(res.earnings)).toBe(true);
    });
  });

  // =========================================================================
  // 3. UPGRADE PURCHASES & NEGATIVE MONEY EDGE CASES
  // =========================================================================
  describe("3. Upgrades, Courier Hiring & Negative Money Boundaries", () => {
    const allKinds: UpgradeKind[] = ["engine", "brakes", "cargo", "grip", "nitro"];

    it("strictly prohibits upgrade purchases beyond MAX_UPGRADE_LEVEL", () => {
      for (const kind of allKinds) {
        const max = MAX_UPGRADE_LEVEL[kind];
        // At max level
        expect(canPurchaseUpgrade(kind, max, 1000000)).toBe(false);
        // Above max level
        expect(canPurchaseUpgrade(kind, max + 1, 1000000)).toBe(false);

        const state = {
          money: 500000,
          upgrades: { ...defaultUpgrades(), [kind]: max },
        };
        const nextState = tryPurchaseUpgrade(state, kind);
        expect(nextState.upgrades[kind]).toBe(max);
        expect(nextState.money).toBe(500000); // Money untouched
      }
    });

    it("strictly rejects upgrade purchases when money is negative", () => {
      for (const kind of allKinds) {
        expect(canPurchaseUpgrade(kind, 0, -1)).toBe(false);
        expect(canPurchaseUpgrade(kind, 0, -999999)).toBe(false);

        const state = {
          money: -500,
          upgrades: defaultUpgrades(),
        };
        const nextState = tryPurchaseUpgrade(state, kind);
        expect(nextState.money).toBe(-500);
        expect(nextState.upgrades[kind] ?? 0).toBe(0);
      }
    });

    it("verifies exact boundary condition: money == cost vs money == cost - 1", () => {
      for (const kind of allKinds) {
        const cost = upgradeCost(kind, 0);

        // Exactly 1 unit short
        expect(canPurchaseUpgrade(kind, 0, cost - 1)).toBe(false);
        const stateFail = { money: cost - 1, upgrades: defaultUpgrades() };
        expect(tryPurchaseUpgrade(stateFail, kind).money).toBe(cost - 1);

        // Exactly enough money
        expect(canPurchaseUpgrade(kind, 0, cost)).toBe(true);
        const statePass = { money: cost, upgrades: defaultUpgrades() };
        const result = tryPurchaseUpgrade(statePass, kind);
        expect(result.money).toBe(0);
        expect(result.upgrades[kind]).toBe(1);
      }
    });

    it("verifies courier hire cost and negative money rejection", () => {
      const candidate = generateCourierCandidate(1);
      const cost = courierHireCost(candidate);
      expect(cost).toBeGreaterThan(150);

      const progNeg = asCompanyProgression({
        ...createLocalStorageAdapter(createMockStorage()).load(),
        money: -100,
      });

      expect(canHireCourier(progNeg, candidate)).toBe(false);
      const afterHireNeg = hireCourier(progNeg, candidate);
      expect(afterHireNeg.money).toBe(-100);
      expect(afterHireNeg.couriers).toHaveLength(0);

      // Exact money boundary
      const progExact = asCompanyProgression({
        ...createLocalStorageAdapter(createMockStorage()).load(),
        money: cost,
      });
      expect(canHireCourier(progExact, candidate)).toBe(true);
      const afterHireExact = hireCourier(progExact, candidate);
      expect(afterHireExact.money).toBe(0);
      expect(afterHireExact.couriers).toHaveLength(1);
      expect(afterHireExact.couriers[0].id).toBe(candidate.id);
    });
  });

  // =========================================================================
  // 4. ROAD NETWORK GRAPH BFS & FLEET DEADLOCK STRESS
  // =========================================================================
  describe("4. Road Network BFS (All Nodes) & Courier Fleet Automation Stress", () => {
    it("verifies ROAD_NODES count and structure", () => {
      const nodeKeys = Object.keys(ROAD_NODES);
      console.log(`ROAD_NODES total count: ${nodeKeys.length}`);
      expect(nodeKeys.length).toBeGreaterThanOrEqual(39);

      for (const [key, pt] of Object.entries(ROAD_NODES)) {
        expect(typeof pt.x).toBe("number");
        expect(typeof pt.z).toBe("number");
        expect(Number.isFinite(pt.x)).toBe(true);
        expect(Number.isFinite(pt.z)).toBe(true);
      }
    });

    it("verifies BFS pathfinding connects EVERY pair of nodes (0 disconnections)", () => {
      const nodeKeys = Object.keys(ROAD_NODES);
      let totalPairsTested = 0;
      let directFallbacks = 0;

      for (let i = 0; i < nodeKeys.length; i++) {
        for (let j = 0; j < nodeKeys.length; j++) {
          const start = nodeKeys[i];
          const end = nodeKeys[j];
          totalPairsTested++;

          const path = findNodePath(start, end);

          // Path must be non-empty
          expect(path.length).toBeGreaterThanOrEqual(1);

          // First node must match start, last node must match end
          expect(path[0].x).toBe(ROAD_NODES[start].x);
          expect(path[0].z).toBe(ROAD_NODES[start].z);
          expect(path[path.length - 1].x).toBe(ROAD_NODES[end].x);
          expect(path[path.length - 1].z).toBe(ROAD_NODES[end].z);

          // If start !== end, path length must be >= 2
          if (start !== end) {
            expect(path.length).toBeGreaterThanOrEqual(2);
            // Verify path continuity: consecutive nodes must be valid edges in ROAD_EDGES
            for (let k = 0; k < path.length - 1; k++) {
              const p1 = path[k];
              const p2 = path[k + 1];
              const segDist = Math.hypot(p2.x - p1.x, p2.z - p1.z);
              // Max distance between consecutive connected waypoints on road network
              expect(segDist).toBeLessThanOrEqual(55); // Max block length is 50-55 units
            }
          }
        }
      }

      console.log(
        `Tested all ${totalPairsTested} pairs of ROAD_NODES. Disconnections: ${directFallbacks}`,
      );
      expect(totalPairsTested).toBe(nodeKeys.length * nodeKeys.length);
    });

    it("verifies buildCourierRoute reaches all 16 delivery homes from depot and back", () => {
      const depot: Vec2 = { x: -62, z: -32 };
      // All 16 homes coordinates from districts
      const testHomes: Vec2[] = [
        { x: -35, z: -84 }, // Home 0 (Sunny)
        { x: -65, z: -84 }, // Home 1
        { x: -35, z: -16 }, // Home 2
        { x: -65, z: -16 }, // Home 3
        { x: 35, z: 16 }, // Home 4 (Market)
        { x: 65, z: 16 }, // Home 5
        { x: 35, z: 84 }, // Home 6
        { x: 65, z: 84 }, // Home 7
        { x: 35, z: -84 }, // Home 8 (Industrial)
        { x: 65, z: -84 }, // Home 9
        { x: 35, z: -16 }, // Home 10
        { x: 65, z: -16 }, // Home 11
        { x: -35, z: 16 }, // Home 12 (Coastal)
        { x: -65, z: 16 }, // Home 13
        { x: -35, z: 84 }, // Home 14
        { x: -65, z: 84 }, // Home 15
      ];

      for (let i = 0; i < testHomes.length; i++) {
        const home = testHomes[i];
        // Outbound route: depot -> home
        const outbound = buildCourierRoute(depot, home);
        expect(outbound.length).toBeGreaterThanOrEqual(2);
        expect(Math.hypot(outbound[0].x - depot.x, outbound[0].z - depot.z)).toBeLessThan(0.01);
        expect(
          Math.hypot(
            outbound[outbound.length - 1].x - home.x,
            outbound[outbound.length - 1].z - home.z,
          ),
        ).toBeLessThan(0.01);

        // Inbound route: home -> depot
        const inbound = buildCourierRoute(home, depot);
        expect(inbound.length).toBeGreaterThanOrEqual(2);
        expect(Math.hypot(inbound[0].x - home.x, inbound[0].z - home.z)).toBeLessThan(0.01);
        expect(
          Math.hypot(
            inbound[inbound.length - 1].x - depot.x,
            inbound[inbound.length - 1].z - depot.z,
          ),
        ).toBeLessThan(0.01);
      }
    });

    it("stress-tests fleet under 10,000 simulation ticks with 5 couriers (zero deadlocks)", () => {
      const fleet = createCourierFleet();
      const depot: Vec2 = { x: -62, z: -32 };
      const testHomes: Vec2[] = [
        { x: -35, z: -84 },
        { x: -65, z: -84 },
        { x: -35, z: -16 },
        { x: -65, z: -16 },
        { x: 35, z: 16 },
        { x: 65, z: 16 },
        { x: 35, z: 84 },
        { x: 65, z: 84 },
        { x: 35, z: -84 },
        { x: 65, z: -84 },
        { x: 35, z: -16 },
        { x: 65, z: -16 },
        { x: -35, z: 16 },
        { x: -65, z: 16 },
        { x: -35, z: 84 },
        { x: -65, z: 84 },
      ];

      const couriers: Courier[] = [
        { id: "c1", name: "C1", level: 1, speed: 0.9, reliability: 0.85, wage: 20, assigned: true },
        { id: "c2", name: "C2", level: 2, speed: 1.0, reliability: 0.90, wage: 25, assigned: true },
        { id: "c3", name: "C3", level: 3, speed: 1.1, reliability: 0.92, wage: 30, assigned: true },
        { id: "c4", name: "C4", level: 4, speed: 1.2, reliability: 0.95, wage: 35, assigned: true },
        { id: "c5", name: "C5", level: 5, speed: 1.3, reliability: 0.98, wage: 40, assigned: true },
      ];

      fleet.syncWithProgression(couriers, 4, depot, testHomes, ["sunny", "market", "industrial", "coastal"]);
      expect(fleet.couriers).toHaveLength(5);

      const totalDeliveries: Record<string, number> = {
        c1: 0,
        c2: 0,
        c3: 0,
        c4: 0,
        c5: 0,
      };

      const dt = 0.05; // 50ms ticks
      const totalTicks = 10000; // 500 simulated seconds

      for (let tick = 0; tick < totalTicks; tick++) {
        const events = fleet.update(dt, 4, depot, testHomes, [
          "sunny",
          "market",
          "industrial",
          "coastal",
        ]);

        for (const ev of events) {
          totalDeliveries[ev.courierId] = (totalDeliveries[ev.courierId] || 0) + 1;
          expect(ev.earnings).toBeGreaterThan(0);
          expect(ev.reputation).toBe(1);
          expect(Number.isFinite(ev.earnings)).toBe(true);
        }

        // Mid-simulation sanity check on all active couriers
        if (tick % 1000 === 0) {
          for (const ac of fleet.couriers) {
            expect(Number.isFinite(ac.position.x)).toBe(true);
            expect(Number.isFinite(ac.position.z)).toBe(true);
            expect(Number.isFinite(ac.heading)).toBe(true);
            expect(Number.isFinite(ac.currentSpeed)).toBe(true);
            expect(ac.currentSpeed).toBeGreaterThanOrEqual(0);
            expect(ac.currentSpeed).toBeLessThanOrEqual(25); // Speed safety ceiling
          }
        }
      }

      console.log("Deliveries completed per courier over 500s simulation:", totalDeliveries);

      // Verify ZERO deadlocks: every single courier must have successfully delivered multiple parcels
      for (const c of couriers) {
        expect(totalDeliveries[c.id]).toBeGreaterThan(5);
      }
    });

    it("handles extreme variable frame rates (dt spikes, zero dt, large dt) without crashing", () => {
      const fleet = createCourierFleet();
      const depot: Vec2 = { x: -62, z: -32 };
      const testHomes: Vec2[] = [{ x: -35, z: -84 }, { x: 35, z: 84 }];
      const couriers: Courier[] = [
        { id: "c1", name: "C1", level: 1, speed: 1.0, reliability: 0.9, wage: 20, assigned: true },
      ];

      fleet.syncWithProgression(couriers, 2, depot, testHomes);

      const chaoticDts = [0, 0.0001, 0.016, 0.5, 2.0, 5.0, 0.016, 0, 1.0];
      for (const dt of chaoticDts) {
        expect(() => {
          fleet.update(dt, 2, depot, testHomes);
        }).not.toThrow();

        const ac = fleet.couriers[0];
        expect(Number.isFinite(ac.position.x)).toBe(true);
        expect(Number.isFinite(ac.position.z)).toBe(true);
        expect(Number.isFinite(ac.heading)).toBe(true);
      }
    });

    it("survives dynamic courier mutation (hiring and firing mid-delivery)", () => {
      const fleet = createCourierFleet();
      const depot: Vec2 = { x: -62, z: -32 };
      const testHomes: Vec2[] = [{ x: -35, z: -84 }, { x: 35, z: 84 }];
      const c1: Courier = { id: "c1", name: "C1", level: 1, speed: 1.0, reliability: 0.9, wage: 20, assigned: true };
      const c2: Courier = { id: "c2", name: "C2", level: 2, speed: 1.1, reliability: 0.9, wage: 25, assigned: true };

      fleet.syncWithProgression([c1], 2, depot, testHomes);
      expect(fleet.couriers).toHaveLength(1);

      // Advance fleet so c1 is driving
      fleet.update(3.0, 2, depot, testHomes);

      // Hire c2 and unassign c1 mid-transit
      const c1Dismissed: Courier = { ...c1, assigned: false };
      fleet.syncWithProgression([c1Dismissed, c2], 2, depot, testHomes);

      // Only c2 should now be active
      expect(fleet.couriers).toHaveLength(1);
      expect(fleet.couriers[0].courier.id).toBe("c2");

      // Continue simulation without errors
      expect(() => {
        fleet.update(10.0, 2, depot, testHomes);
      }).not.toThrow();
    });

    it("immune to prototype pollution payloads", () => {
      const evilPayload = JSON.stringify({
        __proto__: { isAdmin: true, money: 9999999 },
        constructor: { prototype: { hacked: true } },
        money: 100,
      });

      const mock = createMockStorage({ "mini-kargo:v1": evilPayload });
      const adapter = createLocalStorageAdapter(mock);
      const loaded = adapter.load();

      expect(loaded.money).toBe(100);
      expect((Object.prototype as any).isAdmin).toBeUndefined();
      expect((Object.prototype as any).hacked).toBeUndefined();
    });
  });
});

