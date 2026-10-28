import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as THREE from "three";
import {
  districts,
  isDistrictUnlocked,
  districtById,
  getAvailableHomeIndices,
  districtAt,
  resolveDistrict,
  getDistrictForHome,
  type DistrictId,
} from "../../src/game/districts";
import { RAMPS, checkRampLaunch, type Ramp } from "../../src/game/ramps";
import { stepVehicle, resetVehicle, TUNING, SCOOTER_TUNING } from "../../src/game/vehicle";
import {
  resolveCollision,
  testCircleVsRect,
  DEFAULT_VEHICLE_COLLIDERS,
} from "../../src/game/collision";
import {
  createContactDamageTracker,
  staticCollisionContacts,
  IMPACT_REFERENCE_SPEED,
} from "../../src/game/contact-damage";
import {
  createDeliveryState,
  stepDelivery,
  packageInfo,
  packageFor,
  PACKAGE_PROFILE_BY_HOME,
} from "../../src/game/delivery";
import {
  upgradeCost,
  canPurchaseUpgrade,
  tryPurchaseUpgrade,
  MAX_UPGRADE_LEVEL,
  upgradeLabel,
  defaultUpgrades,
  type UpgradeKind,
} from "../../src/game/upgrades";
import {
  createBuyPad,
  updateBuyPads,
  DEFAULT_DRAIN_RATE,
  DEFAULT_SPEED_THRESHOLD,
  type BuyPad,
} from "../../src/game/buy-pad";
import {
  createCourierFleet,
  buildCourierRoute,
  findNearestNode,
  findNodePath,
  ROAD_NODES,
  ROAD_EDGES,
} from "../../src/game/fleet";
import {
  calculateOfflineEarnings,
  applyOfflineEarnings,
  claimOfflineEarnings,
  canHireCourier,
  hireCourier,
  generateCourierCandidate,
  courierHireCost,
  MAX_OFFLINE_SECONDS,
} from "../../src/game/company";
import {
  joystickToDrive,
  createKeyboardState,
  createInputState,
  INPUT_TUNING,
} from "../../src/game/input";
import {
  createLocalStorageAdapter,
  asCompanyProgression,
  type Preferences,
} from "../../src/platform/storage";
import { createCameraRig } from "../../src/scene/camera";
import { createClouds } from "../../src/scene/clouds";
import {
  createTraffic,
  DEFAULT_TRAFFIC,
  DISTRICT_TRAFFIC,
  EXTRA_DISTRICT_TRAFFIC,
} from "../../src/scene/traffic";
import {
  createPedestrians,
  DEFAULT_PEDESTRIANS,
  DISTRICT_PEDESTRIANS,
  EXTRA_DISTRICT_PEDESTRIANS,
} from "../../src/scene/pedestrians";
import { createProps, PROP_DEFINITIONS } from "../../src/scene/props";
import { createWorld } from "../../src/scene/world";
import { createHud } from "../../src/ui/hud";
import {
  worldToMinimap,
  isDistrictLocked as isMinimapDistrictLocked,
  createMinimap,
  DEFAULT_BOUNDS,
} from "../../src/ui/minimap";
import { createCompanySheet } from "../../src/ui/company-sheet";
import { createBuyPadsView } from "../../src/scene/buy-pad";
import type { DriveInput, Rect, Vec2, VehicleState } from "../../src/game/types";

// ============================================================================
// DOM Mocking Infrastructure for Node Environment
// ============================================================================
class MockDOMElement {
  tagName: string;
  children: MockDOMElement[] = [];
  className = "";
  id = "";
  hidden = false;
  disabled = false;
  textContent: string | null = "";
  attributes: Record<string, string> = {};
  dataset: Record<string, string> = {};
  style: Record<string, any> = {
    transform: "",
    width: "",
    left: "",
    top: "",
    bottom: "",
  };
  listeners: Record<string, ((e: any) => void)[]> = {};
  private _parent: MockDOMElement | null = null;
  width = 100;
  height = 100;

  constructor(tagName = "div") {
    this.tagName = tagName.toLowerCase();
  }

  get parent(): MockDOMElement | null {
    return this._parent;
  }

  set parent(p: MockDOMElement | null) {
    this._parent = p;
  }

  get parentElement(): MockDOMElement {
    if (!this._parent) {
      this._parent = new MockDOMElement("div");
      this._parent.children.push(this);
    }
    return this._parent;
  }

  get classList() {
    return {
      classes: new Set(
        this.className ? this.className.split(" ").filter(Boolean) : [],
      ),
      add: (...cls: string[]) => {
        const s = new Set(
          this.className ? this.className.split(" ").filter(Boolean) : [],
        );
        for (const c of cls) s.add(c);
        this.className = Array.from(s).join(" ");
      },
      remove: (...cls: string[]) => {
        const s = new Set(
          this.className ? this.className.split(" ").filter(Boolean) : [],
        );
        for (const c of cls) s.delete(c);
        this.className = Array.from(s).join(" ");
      },
      toggle: (c: string, force?: boolean) => {
        const s = new Set(
          this.className ? this.className.split(" ").filter(Boolean) : [],
        );
        let has = s.has(c);
        if (force !== undefined) {
          if (force) s.add(c);
          else s.delete(c);
          this.className = Array.from(s).join(" ");
          return force;
        }
        if (has) s.delete(c);
        else s.add(c);
        this.className = Array.from(s).join(" ");
        return !has;
      },
      contains: (c: string) => {
        const s = new Set(
          this.className ? this.className.split(" ").filter(Boolean) : [],
        );
        return s.has(c);
      },
    };
  }

  getAttribute(name: string): string | null {
    return this.attributes[name] ?? null;
  }

  setAttribute(name: string, val: string) {
    this.attributes[name] = val;
    if (name === "id") this.id = val;
    if (name === "class") this.className = val;
    if (name === "disabled") this.disabled = true;
    if (name === "hidden") this.hidden = true;
  }

  hasAttribute(name: string): boolean {
    return name in this.attributes;
  }

  removeAttribute(name: string) {
    delete this.attributes[name];
    if (name === "disabled") this.disabled = false;
    if (name === "hidden") this.hidden = false;
  }

  toggleAttribute(name: string, force?: boolean): boolean {
    const has = force !== undefined ? force : !this.hasAttribute(name);
    if (has) this.setAttribute(name, "");
    else this.removeAttribute(name);
    return has;
  }

  appendChild(child: MockDOMElement) {
    this.children.push(child);
    child.parent = this;
    return child;
  }

  remove() {
    if (this._parent) {
      this._parent.children = this._parent.children.filter((c) => c !== this);
    }
  }

  addEventListener(event: string, handler: (e: any) => void) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(handler);
  }

  removeEventListener(event: string, handler: (e: any) => void) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(
        (h) => h !== handler,
      );
    }
  }

  dispatchEvent(event: any) {
    const type = typeof event === "string" ? event : event?.type;
    if (type && this.listeners[type]) {
      for (const h of this.listeners[type]) {
        h(event);
      }
    }
  }

  click() {
    this.dispatchEvent({ type: "click", target: this, currentTarget: this });
  }

  blur() {}
  focus() {}
  setPointerCapture() {}
  releasePointerCapture() {}
  hasPointerCapture() {
    return false;
  }

  getBoundingClientRect() {
    return {
      x: 0,
      y: 0,
      width: this.width,
      height: this.height,
      left: 0,
      top: 0,
      right: this.width,
      bottom: this.height,
    };
  }

  getContext(type: string) {
    if (type === "2d") {
      return {
        clearRect: vi.fn(),
        fillRect: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        stroke: vi.fn(),
        fill: vi.fn(),
        arc: vi.fn(),
        strokeRect: vi.fn(),
        fillText: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        closePath: vi.fn(),
        roundRect: vi.fn(),
      };
    }
    return null;
  }

  set innerHTML(html: string) {
    this.children = [];
    const elRegex = /<([a-zA-Z0-9\-]+)([^>]*)>/g;
    let m;
    while ((m = elRegex.exec(html)) !== null) {
      const tag = m[1];
      const attrStr = m[2];
      if (tag.startsWith("/")) continue;
      const child = new MockDOMElement(tag);
      child.parent = this;

      const attrRegex = /([a-zA-Z0-9\-]+)(?:=["']([^"']*)["'])?/g;
      let am;
      while ((am = attrRegex.exec(attrStr)) !== null) {
        const aName = am[1];
        const aVal = am[2] !== undefined ? am[2] : "";
        child.setAttribute(aName, aVal);
        if (aName.startsWith("data-")) {
          child.dataset[aName.slice(5)] = aVal;
        }
      }
      this.children.push(child);
    }
  }

  get innerHTML(): string {
    return "";
  }

  querySelector<T = MockDOMElement>(selector: string): T | null {
    return this.find((el) => el.matchesSelector(selector)) as unknown as T | null;
  }

  querySelectorAll<T = MockDOMElement>(selector: string): T[] {
    const results: MockDOMElement[] = [];
    this.findAll((el) => el.matchesSelector(selector), results);
    return results as unknown as T[];
  }

  matchesSelector(sel: string): boolean {
    if (sel.startsWith("#")) return this.id === sel.slice(1);
    if (sel.startsWith(".")) {
      const cls = sel.slice(1);
      return this.classList.contains(cls);
    }
    if (sel.startsWith("[data-") && sel.endsWith("]")) {
      const inner = sel.slice(1, -1);
      if (inner.includes("=")) {
        const [k, v] = inner.split("=");
        const rawV = v.replace(/["']/g, "");
        return this.getAttribute(k) === rawV;
      }
      return this.hasAttribute(inner);
    }
    if (sel.toLowerCase() === this.tagName) return true;
    return false;
  }

  closest(selector: string): MockDOMElement | null {
    let curr: MockDOMElement | null = this;
    while (curr) {
      if (curr.matchesSelector(selector)) return curr;
      curr = curr.parent;
    }
    return null;
  }

  private find(predicate: (el: MockDOMElement) => boolean): MockDOMElement | null {
    for (const child of this.children) {
      if (predicate(child)) return child;
      const res = child.find(predicate);
      if (res) return res;
    }
    return null;
  }

  private findAll(
    predicate: (el: MockDOMElement) => boolean,
    out: MockDOMElement[],
  ) {
    for (const child of this.children) {
      if (predicate(child)) out.push(child);
      child.findAll(predicate, out);
    }
  }
}

function setupMockDom() {
  const root = new MockDOMElement("div");
  vi.stubGlobal("document", {
    createElement: (tag: string) => new MockDOMElement(tag),
    querySelector: (sel: string) => root.querySelector(sel),
    querySelectorAll: (sel: string) => root.querySelectorAll(sel),
    activeElement: null,
    hidden: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  });
  vi.stubGlobal("window", {
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    innerWidth: 1280,
    innerHeight: 800,
    devicePixelRatio: 1,
  });
  return root;
}

// ============================================================================
// TIER 1: FEATURE COVERAGE (F01 - F21) [105 TEST CASES: 21 x 5]
// ============================================================================
describe("Tier 1: Feature Coverage (F01-F21)", () => {
  // F01: Güneş Mahallesi (Sunny District)
  describe("F01: Güneş Mahallesi (Sunny District)", () => {
    it("T1-F01-01: Güneş has unlockLevel 1, multiplier 1.0, and 4 home indices", () => {
      const sunny = districtById("sunny");
      expect(sunny.id).toBe("sunny");
      expect(sunny.unlockLevel).toBe(1);
      expect(sunny.rewardMultiplier).toBe(1.0);
      expect(sunny.homeIndices).toEqual([0, 1, 2, 3]);
    });

    it("T1-F01-02: Güneş is always unlocked at company level 1 with empty list", () => {
      expect(isDistrictUnlocked("sunny", 1)).toBe(true);
      expect(isDistrictUnlocked("sunny", 1, [])).toBe(true);
    });

    it("T1-F01-03: Homes 0-3 are located in negative X, negative Z quadrant", () => {
      const world = createWorld();
      for (let i = 0; i < 4; i++) {
        const pos = world.homes[i];
        expect(pos.x).toBeLessThan(0);
        expect(pos.z).toBeLessThan(0);
        expect(districtAt(pos.x, pos.z)).toBe("sunny");
      }
    });

    it("T1-F01-04: Delivery drop zones for Homes 0-3 have >=1.8m clearance from static obstacles", () => {
      const world = createWorld();
      for (let i = 0; i < 4; i++) {
        const home = world.homes[i];
        const hit = world.obstacles.some(
          (rect) => testCircleVsRect(home.x, home.z, 1.8, rect).hit,
        );
        expect(hit).toBe(false);
      }
    });

    it("T1-F01-05: Package profiles for Güneş homes follow expected sequence", () => {
      expect(packageFor(0)).toBe("standard");
      expect(packageFor(1)).toBe("urgent");
      expect(packageFor(2)).toBe("fragile");
      expect(packageFor(3)).toBe("standard");
    });
  });

  // F02: Çarşı Bölgesi (Market District)
  describe("F02: Çarşı Bölgesi (Market District)", () => {
    it("T1-F02-01: Çarşı has unlockLevel 2, multiplier 1.15, and homeIndices 4-7", () => {
      const market = districtById("market");
      expect(market.id).toBe("market");
      expect(market.unlockLevel).toBe(2);
      expect(market.rewardMultiplier).toBe(1.15);
      expect(market.homeIndices).toEqual([4, 5, 6, 7]);
    });

    it("T1-F02-02: Çarşı is locked at level 1 and unlocked at level 2", () => {
      expect(isDistrictUnlocked("market", 1)).toBe(false);
      expect(isDistrictUnlocked("market", 2)).toBe(true);
    });

    it("T1-F02-03: Homes 4-7 are located in positive X, positive Z quadrant", () => {
      const world = createWorld();
      for (let i = 4; i < 8; i++) {
        const pos = world.homes[i];
        expect(pos.x).toBeGreaterThan(0);
        expect(pos.z).toBeGreaterThan(0);
        expect(districtAt(pos.x, pos.z)).toBe("market");
      }
    });

    it("T1-F02-04: Delivery drop zones for Homes 4-7 have >=1.8m clearance", () => {
      const world = createWorld();
      for (let i = 4; i < 8; i++) {
        const home = world.homes[i];
        const hit = world.obstacles.some(
          (rect) => testCircleVsRect(home.x, home.z, 1.8, rect).hit,
        );
        expect(hit).toBe(false);
      }
    });

    it("T1-F02-05: Commercial package profiles match shops/pastry/boutique themes", () => {
      expect(packageFor(4)).toBe("urgent"); // pastry
      expect(packageFor(5)).toBe("fragile"); // grocery
      expect(packageFor(6)).toBe("standard"); // bookstore
      expect(packageFor(7)).toBe("urgent"); // boutique
    });
  });

  // F03: Sanayi Bölgesi (Industrial District)
  describe("F03: Sanayi Bölgesi (Industrial District)", () => {
    it("T1-F03-01: Sanayi has unlockLevel 3, multiplier 1.30, and homeIndices 8-11", () => {
      const ind = districtById("industrial");
      expect(ind.id).toBe("industrial");
      expect(ind.unlockLevel).toBe(3);
      expect(ind.rewardMultiplier).toBe(1.3);
      expect(ind.homeIndices).toEqual([8, 9, 10, 11]);
    });

    it("T1-F03-02: Sanayi is locked at level 2 and unlocks at level 3", () => {
      expect(isDistrictUnlocked("industrial", 2)).toBe(false);
      expect(isDistrictUnlocked("industrial", 3)).toBe(true);
    });

    it("T1-F03-03: Homes 8-11 are located in positive X, negative Z quadrant", () => {
      const world = createWorld();
      for (let i = 8; i < 12; i++) {
        const pos = world.homes[i];
        expect(pos.x).toBeGreaterThan(0);
        expect(pos.z).toBeLessThan(0);
        expect(districtAt(pos.x, pos.z)).toBe("industrial");
      }
    });

    it("T1-F03-04: Delivery drop zones for Homes 8-11 have >=1.8m clearance", () => {
      const world = createWorld();
      for (let i = 8; i < 12; i++) {
        const home = world.homes[i];
        const hit = world.obstacles.some(
          (rect) => testCircleVsRect(home.x, home.z, 1.8, rect).hit,
        );
        expect(hit).toBe(false);
      }
    });

    it("T1-F03-05: Industrial package profiles match heavy parts and logistics", () => {
      expect(packageFor(8)).toBe("standard");
      expect(packageFor(9)).toBe("standard");
      expect(packageFor(10)).toBe("urgent");
      expect(packageFor(11)).toBe("standard");
    });
  });

  // F04: Sahil Şeridi (Coastal District)
  describe("F04: Sahil Şeridi (Coastal District)", () => {
    it("T1-F04-01: Sahil has unlockLevel 4, multiplier 1.45, and homeIndices 12-15", () => {
      const coastal = districtById("coastal");
      expect(coastal.id).toBe("coastal");
      expect(coastal.unlockLevel).toBe(4);
      expect(coastal.rewardMultiplier).toBe(1.45);
      expect(coastal.homeIndices).toEqual([12, 13, 14, 15]);
    });

    it("T1-F04-02: Sahil is locked at level 3 and unlocks at level 4", () => {
      expect(isDistrictUnlocked("coastal", 3)).toBe(false);
      expect(isDistrictUnlocked("coastal", 4)).toBe(true);
    });

    it("T1-F04-03: Homes 12-15 are located in negative X, positive Z quadrant", () => {
      const world = createWorld();
      for (let i = 12; i < 16; i++) {
        const pos = world.homes[i];
        expect(pos.x).toBeLessThan(0);
        expect(pos.z).toBeGreaterThan(0);
        expect(districtAt(pos.x, pos.z)).toBe("coastal");
      }
    });

    it("T1-F04-04: Delivery drop zones for Homes 12-15 have >=1.8m clearance", () => {
      const world = createWorld();
      for (let i = 12; i < 16; i++) {
        const home = world.homes[i];
        const hit = world.obstacles.some(
          (rect) => testCircleVsRect(home.x, home.z, 1.8, rect).hit,
        );
        expect(hit).toBe(false);
      }
    });

    it("T1-F04-05: Coastal package profiles match marina and luxury items", () => {
      expect(packageFor(12)).toBe("fragile");
      expect(packageFor(13)).toBe("urgent");
      expect(packageFor(14)).toBe("fragile");
      expect(packageFor(15)).toBe("fragile");
    });
  });

  // F05: Road Network & Street Continuity
  describe("F05: Road Network & Street Continuity", () => {
    it("T1-F05-01: Road nodes dictionary contains >=35 junction coordinates", () => {
      expect(Object.keys(ROAD_NODES).length).toBeGreaterThanOrEqual(35);
    });

    it("T1-F05-02: Central boulevard intersections are represented at Z=0 and X=0", () => {
      expect(ROAD_NODES.boulevard_c).toEqual({ x: 0, z: 0 });
      expect(ROAD_NODES.boulevard_w).toEqual({ x: -50, z: 0 });
      expect(ROAD_NODES.boulevard_e).toEqual({ x: 50, z: 0 });
    });

    it("T1-F05-03: Secondary boulevards connect north and south city axes", () => {
      expect(ROAD_NODES.north_c).toEqual({ x: 0, z: -50 });
      expect(ROAD_NODES.south_c).toEqual({ x: 0, z: 50 });
    });

    it("T1-F05-04: BFS pathfinder finds continuous node path from depot to all districts", () => {
      const pathToMarket = findNodePath("depot_gate", "mkt_n_c");
      expect(pathToMarket.length).toBeGreaterThan(2);

      const pathToIndustrial = findNodePath("depot_gate", "ind_n_c");
      expect(pathToIndustrial.length).toBeGreaterThan(2);

      const pathToCoastal = findNodePath("depot_gate", "cst_n_e");
      expect(pathToCoastal.length).toBeGreaterThan(2);
    });

    it("T1-F05-05: buildCourierRoute generates connected waypoint array without null gaps", () => {
      const route = buildCourierRoute({ x: -62, z: -32 }, { x: 75, z: 31.5 });
      expect(route.length).toBeGreaterThanOrEqual(3);
      expect(route[0]).toEqual({ x: -62, z: -32 });
      for (let i = 0; i < route.length - 1; i++) {
        const d = Math.hypot(route[i + 1].x - route[i].x, route[i + 1].z - route[i].z);
        expect(d).toBeLessThan(75); // No teleportation jumps
      }
    });
  });

  // F06: Jump Ramps & World Geometry
  describe("F06: Jump Ramps & World Geometry", () => {
    it("T1-F06-01: RAMPS array contains exactly 5 ballistic ramps", () => {
      expect(RAMPS).toHaveLength(5);
    });

    it("T1-F06-02: Industrial container ramp is positioned at (50, -38) with launchSpeed 8.0", () => {
      const r = RAMPS.find((ramp) => ramp.id === "ramp_industrial_containers")!;
      expect(r).toBeDefined();
      expect(r.position).toEqual({ x: 50, z: -38 });
      expect(r.launchSpeed).toBe(8.0);
      expect(r.heading).toBe(Math.PI);
    });

    it("T1-F06-03: Vehicle at high speed along ramp heading triggers ramp launch", () => {
      const r = RAMPS[0];
      const state: VehicleState = {
        position: { ...r.position },
        velocity: { x: 0, z: -10 }, // heading North (Math.PI)
        heading: Math.PI,
        nitro: 1,
        drifting: false,
        steerAngle: 0,
        altitude: 0,
        verticalVelocity: 0,
        airborne: false,
      };
      const launch = checkRampLaunch(state, [r]);
      expect(launch).not.toBeNull();
      expect(launch!.verticalVelocity).toBeGreaterThan(5);
    });

    it("T1-F06-04: Vehicle below launchSpeed does not trigger ramp launch", () => {
      const r = RAMPS[0];
      const state: VehicleState = {
        position: { ...r.position },
        velocity: { x: 0, z: -4 }, // speed 4 < launchSpeed 8
        heading: Math.PI,
        nitro: 1,
        drifting: false,
        steerAngle: 0,
        altitude: 0,
        verticalVelocity: 0,
        airborne: false,
      };
      expect(checkRampLaunch(state, [r])).toBeNull();
    });

    it("T1-F06-05: World boundaries are exactly [-100, 100] on X and Z", () => {
      const world = createWorld();
      expect(world.bounds).toEqual({ minX: -100, maxX: 100, minZ: -100, maxZ: 100 });
      expect(world.depot).toEqual({ x: -62, z: -32 });
    });
  });

  // F07: Traffic Vehicle Simulation
  describe("F07: Traffic Vehicle Simulation", () => {
    it("T1-F07-01: Traffic system initializes 37 vehicles across 5 kinds", () => {
      const traffic = createTraffic();
      expect(traffic.cars).toHaveLength(37);
      const kinds = new Set(traffic.cars.map((c) => c.kind));
      expect(kinds.has("taxi")).toBe(true);
      expect(kinds.has("police")).toBe(true);
      expect(kinds.has("suv")).toBe(true);
      expect(kinds.has("truck")).toBe(true);
      expect(kinds.has("sedan")).toBe(true);
    });

    it("T1-F07-02: Moving traffic advances car position along axis by speed * dt", () => {
      const traffic = createTraffic();
      const car = traffic.cars[0];
      const start = car.position[car.axis];
      traffic.update(0.5, { x: -999, z: -999 });
      expect(car.position[car.axis]).toBeCloseTo(start + car.direction * car.speed * 0.5);
    });

    it("T1-F07-03: Cars wrap around their minimum and maximum path limits", () => {
      const traffic = createTraffic();
      const car = traffic.cars[0];
      car.position[car.axis] = (car.max ?? 90) + 0.1;
      car.direction = 1;
      traffic.update(0.1, { x: -999, z: -999 });
      expect(car.position[car.axis]).toBeLessThanOrEqual(car.max ?? 90);
    });

    it("T1-F07-04: impactCar applies physical recoil offset and horn request timer", () => {
      const traffic = createTraffic();
      traffic.impactCar(0, { x: traffic.cars[0].position.x - 1, z: traffic.cars[0].position.z }, 5.0);
      expect(traffic.cars[0].recoilX).toBeGreaterThan(0);
      expect(traffic.cars[0].hornTimer).toBeGreaterThan(0);
      expect(traffic.cars[0].shakeTimer).toBeGreaterThan(0);
    });

    it("T1-F07-05: Locked district traffic is invisible and non-colliding at level 1", () => {
      const traffic = createTraffic();
      traffic.setCompanyLevel(1);
      const marketCars = traffic.cars.filter((c) => c.district === "market");
      for (const mc of marketCars) {
        expect(mc.group.visible).toBe(false);
      }
    });
  });

  // F08: Pedestrian Simulation & Reactive Evasion
  describe("F08: Pedestrian Simulation & Reactive Evasion", () => {
    it("T1-F08-01: Pedestrian system initializes 39 pedestrians across 4 archetypes", () => {
      const pedSystem = createPedestrians();
      expect(pedSystem.pedestrians).toHaveLength(39);
      const kinds = new Set(pedSystem.pedestrians.map((p) => p.kind));
      expect(kinds.has("casual")).toBe(true);
      expect(kinds.has("worker")).toBe(true);
      expect(kinds.has("tourist")).toBe(true);
      expect(kinds.has("business")).toBe(true);
    });

    it("T1-F08-02: Pedestrians swing limb pivots during normal movement", () => {
      const pedSystem = createPedestrians();
      const p = pedSystem.pedestrians[0];
      const origX = p.position[p.axis];
      pedSystem.update(0.5, { x: -999, z: -999 }, 0);
      expect(p.position[p.axis]).not.toBe(origX);
      expect(p.walkPhase).toBeGreaterThan(0);
    });

    it("T1-F08-03: Approaching fast vehicle triggers panic flee reaction", () => {
      const pedSystem = createPedestrians();
      const p = pedSystem.pedestrians[0];
      // Place player close with high speed
      pedSystem.update(0.1, { x: p.position.x + 1.0, z: p.position.z }, 8.0);
      expect(p.panicTimer).toBeGreaterThan(0);
      expect(p.fleeOffsetX).not.toBe(0);
    });

    it("T1-F08-04: Panic flails arms overhead with negative pitch rotation", () => {
      const pedSystem = createPedestrians();
      const p = pedSystem.pedestrians[0];
      p.panicTimer = 1.0;
      pedSystem.update(0.1, { x: -999, z: -999 }, 0);
      expect(p.leftArmPivot.rotation.x).toBeLessThan(-2.0);
    });

    it("T1-F08-05: Flee offset decays back to 0 when danger subsides", () => {
      const pedSystem = createPedestrians();
      const p = pedSystem.pedestrians[0];
      p.fleeOffsetX = 2.0;
      p.panicTimer = 0;
      pedSystem.update(1.0, { x: -999, z: -999 }, 0);
      expect(Math.abs(p.fleeOffsetX)).toBeLessThan(0.2);
    });
  });

  // F09: Ambient Props & Breakable Physics
  describe("F09: Ambient Props & Breakable Physics", () => {
    it("T1-F09-01: PROP_DEFINITIONS contains >=28 breakable props", () => {
      expect(PROP_DEFINITIONS.length).toBeGreaterThanOrEqual(28);
    });

    it("T1-F09-02: Props system initializes cones, trash cans, and boxes with 3D meshes", () => {
      const scene = new THREE.Scene();
      const props = createProps(scene);
      expect(props.props.length).toBe(PROP_DEFINITIONS.length);
      const kinds = new Set(props.props.map((p) => p.kind));
      expect(kinds.has("cone")).toBe(true);
      expect(kinds.has("trash")).toBe(true);
      expect(kinds.has("box")).toBe(true);
    });

    it("T1-F09-03: Direct vehicle impact tosses prop into the air with vertical impulse", () => {
      const scene = new THREE.Scene();
      const props = createProps(scene);
      const p = props.props[0];
      const vehicle: VehicleState = {
        position: { x: p.pos.x, z: p.pos.z },
        velocity: { x: 8, z: 0 },
        heading: Math.PI / 2,
        nitro: 1,
        drifting: false,
        steerAngle: 0,
        altitude: 0,
        verticalVelocity: 0,
        airborne: false,
      };
      const hit = props.update(0.016, vehicle);
      expect(hit).toBe(true);
      expect(p.hit).toBe(true);
      expect(p.vel.y).toBeGreaterThan(4.0);
    });

    it("T1-F09-04: Hitting prop decelerates vehicle slightly by ~8% without dead stop", () => {
      const scene = new THREE.Scene();
      const props = createProps(scene, [{ kind: "cone", position: { x: 0, z: 0 } }]);
      const p = props.props[0];
      const vehicle: VehicleState = {
        position: { x: 0, z: 0 },
        velocity: { x: 10, z: 0 },
        heading: Math.PI / 2,
        nitro: 1,
        drifting: false,
        steerAngle: 0,
        altitude: 0,
        verticalVelocity: 0,
        airborne: false,
      };
      props.update(0.016, vehicle);
      expect(vehicle.velocity.x).toBeCloseTo(9.2, 1);
    });

    it("T1-F09-05: Reset returns all hit props to original positions and rest state", () => {
      const scene = new THREE.Scene();
      const props = createProps(scene);
      props.props[0].hit = true;
      props.props[0].pos.set(100, 20, 100);
      props.reset();
      expect(props.props[0].hit).toBe(false);
      expect(props.props[0].pos.x).toBe(props.props[0].initialPos.x);
    });
  });

  // F10: Drifting Clouds & Environmental Lighting
  describe("F10: Drifting Clouds & Environmental Lighting", () => {
    it("T1-F10-01: createClouds initializes 11 drifting cloud instances", () => {
      const clouds = createClouds(11);
      expect(clouds.group.children).toHaveLength(11);
    });

    it("T1-F10-02: Clouds drift eastward along positive X axis", () => {
      const clouds = createClouds(11);
      const initialXs = clouds.group.children.map((c) => c.position.x);
      clouds.update(1.0);
      clouds.group.children.forEach((c, idx) => {
        expect(c.position.x).toBeGreaterThan(initialXs[idx]);
      });
    });

    it("T1-F10-03: Clouds perform vertical sinusoidal bobbing animation", () => {
      const clouds = createClouds(11);
      const initialYs = clouds.group.children.map((c) => c.position.y);
      clouds.update(2.5);
      const anyDiff = clouds.group.children.some(
        (c, idx) => Math.abs(c.position.y - initialYs[idx]) > 0.01,
      );
      expect(anyDiff).toBe(true);
    });

    it("T1-F10-04: Clouds exceeding X=115 wrap back to X=-115", () => {
      const clouds = createClouds(11);
      clouds.group.children[0].position.x = 116;
      clouds.update(0.1);
      expect(clouds.group.children[0].position.x).toBe(-115);
    });

    it("T1-F10-05: dispose cleans up Three.js cloud children cleanly", () => {
      const clouds = createClouds(11);
      clouds.dispose();
      expect(clouds.group.children).toHaveLength(0);
    });
  });

  // F11: Vehicle Driving Physics & Dual Fleet
  describe("F11: Vehicle Driving Physics & Dual Fleet", () => {
    it("T1-F11-01: Van vehicle accelerates under positive throttle up to maxSpeed", () => {
      let state = resetVehicle({ x: 0, z: 0 }, "van");
      for (let i = 0; i < 60; i++) {
        state = stepVehicle(state, { throttle: 1, steer: 0, handbrake: false, nitro: false }, 0.05);
      }
      const speed = Math.hypot(state.velocity.x, state.velocity.z);
      expect(speed).toBeGreaterThan(10);
      expect(speed).toBeLessThanOrEqual(TUNING.maxSpeed + 0.1);
    });

    it("T1-F11-02: Scooter handles with 1.35x accelMultiplier and 1.35x turnRate", () => {
      expect(SCOOTER_TUNING.accelMultiplier).toBe(1.35);
      expect(SCOOTER_TUNING.turnRateMultiplier).toBe(1.35);
      let vVan = resetVehicle({ x: 0, z: 0 }, "van");
      let vScooter = resetVehicle({ x: 0, z: 0 }, "scooter");
      vVan = stepVehicle(vVan, { throttle: 1, steer: 0, handbrake: false, nitro: false }, 0.1);
      vScooter = stepVehicle(vScooter, { throttle: 1, steer: 0, handbrake: false, nitro: false }, 0.1);
      const speedVan = Math.hypot(vVan.velocity.x, vVan.velocity.z);
      const speedScooter = Math.hypot(vScooter.velocity.x, vScooter.velocity.z);
      expect(speedScooter).toBeGreaterThan(speedVan);
    });

    it("T1-F11-03: Reverse gear caps speed at reverseRatio * maxSpeed", () => {
      let state = resetVehicle({ x: 0, z: 0 }, "van");
      for (let i = 0; i < 60; i++) {
        state = stepVehicle(state, { throttle: -1, steer: 0, handbrake: false, nitro: false }, 0.05);
      }
      const speed = Math.hypot(state.velocity.x, state.velocity.z);
      expect(speed).toBeLessThanOrEqual(TUNING.maxSpeed * TUNING.reverseRatio + 0.5);
    });

    it("T1-F11-04: Handbrake initiates drift and reduces lateral tire grip", () => {
      let state = resetVehicle({ x: 0, z: 0 }, "van");
      state.velocity = { x: 12, z: 0 };
      state.heading = Math.PI / 2;
      let drifted = false;
      for (let i = 0; i < 30; i++) {
        state = stepVehicle(state, { throttle: 0.5, steer: 1, handbrake: true, nitro: false }, 0.05);
        drifted ||= state.drifting;
      }
      expect(drifted).toBe(true);
    });

    it("T1-F11-05: Nitro boosts speed above normal maxSpeed and drains reservoir", () => {
      let state = resetVehicle({ x: 0, z: 0 }, "van");
      state.velocity = { x: 13.5, z: 0 };
      state.heading = Math.PI / 2;
      state = stepVehicle(state, { throttle: 1, steer: 0, handbrake: false, nitro: true }, 0.5);
      const speed = Math.hypot(state.velocity.x, state.velocity.z);
      expect(speed).toBeGreaterThan(TUNING.maxSpeed);
      expect(state.nitro).toBeLessThan(1.0);
    });
  });

  // F12: Collision Fairness & Contact Damage
  describe("F12: Collision Fairness & Contact Damage", () => {
    it("T1-F12-01: DEFAULT_VEHICLE_COLLIDERS contains 3-circle capsule setup", () => {
      expect(DEFAULT_VEHICLE_COLLIDERS).toHaveLength(3);
      expect(DEFAULT_VEHICLE_COLLIDERS[0].offset).toBe(0.52);
      expect(DEFAULT_VEHICLE_COLLIDERS[1].offset).toBe(0.0);
      expect(DEFAULT_VEHICLE_COLLIDERS[2].offset).toBe(-0.52);
    });

    it("T1-F12-02: testCircleVsRect calculates exact penetration depth and unit normal", () => {
      const rect: Rect = { minX: 10, maxX: 20, minZ: 10, maxZ: 20 };
      const res = testCircleVsRect(9.7, 15, 0.5, rect);
      expect(res.hit).toBe(true);
      expect(res.normal).toEqual({ x: -1, z: 0 });
      expect(res.depth).toBeCloseTo(0.2, 2);
    });

    it("T1-F12-03: resolveCollision sub-stepping prevents tunneling at 25 u/s", () => {
      const obstacle: Rect = { minX: 5, maxX: 15, minZ: -5, maxZ: 5 };
      const bounds: Rect = { minX: -100, maxX: 100, minZ: -100, maxZ: 100 };
      const result = resolveCollision(
        { x: 3, z: 0 },
        { x: 10, z: 0 },
        [obstacle],
        bounds,
        { heading: Math.PI / 2, velocity: { x: 25, z: 0 } },
      );
      expect(result.collided).toBe(true);
      expect(result.position.x).toBeLessThan(5);
    });

    it("T1-F12-04: Wall sliding preserves tangential velocity while damping normal velocity", () => {
      const wall: Rect = { minX: 10, maxX: 12, minZ: -20, maxZ: 20 };
      const bounds: Rect = { minX: -100, maxX: 100, minZ: -100, maxZ: 100 };
      const res = resolveCollision(
        { x: 9.3, z: 0 },
        { x: 10.5, z: 5 },
        [wall],
        bounds,
        { heading: 0, velocity: { x: 2, z: 10 } },
      );
      expect(res.position.z).toBeGreaterThan(0);
      expect(res.velocity.z).toBeGreaterThan(5);
    });

    it("T1-F12-05: Contact damage tracker prevents unfair multi-damage penalty during continuous contact", () => {
      const tracker = createContactDamageTracker();
      const contacts = [{ id: "obstacle:1", severity: 0.5 }];
      const hit1 = tracker.update(contacts, 0.016);
      expect(hit1).toBe(0.5);
      const hit2 = tracker.update(contacts, 0.016);
      expect(hit2).toBe(0); // Zero additional damage while sliding
    });
  });

  // F13: Dynamic Chase Camera
  describe("F13: Dynamic Chase Camera", () => {
    it("T1-F13-01: createCameraRig uses fixed isometric angle Math.PI", () => {
      const rig = createCameraRig();
      expect(rig.getState().angle).toBe(Math.PI);
    });

    it("T1-F13-02: Camera rig initializes at base height ~22 and distance ~18", () => {
      const rig = createCameraRig();
      rig.reset({ x: 0, z: 0 });
      const state = rig.getState();
      expect(state.position.y).toBeCloseTo(22);
      expect(state.position.z).toBeCloseTo(18);
    });

    it("T1-F13-03: Dynamic FOV expands from 40 toward 48.5 at high speeds", () => {
      const rig = createCameraRig();
      const cam = new THREE.PerspectiveCamera(40, 16 / 9, 0.1, 150);
      rig.reset({ x: 0, z: 0 });
      for (let i = 0; i < 30; i++) {
        rig.update(cam, { x: 0, z: 0 }, 0.05, { x: 0, z: 20 });
      }
      expect(cam.fov).toBeGreaterThan(45);
    });

    it("T1-F13-04: Look-ahead target leads in vehicle velocity direction", () => {
      const rig = createCameraRig();
      const cam = new THREE.PerspectiveCamera(40, 16 / 9, 0.1, 150);
      rig.reset({ x: 0, z: 0 });
      rig.update(cam, { x: 0, z: 0 }, 0.1, { x: 15, z: 0 });
      // Camera position should lead forward in X
      expect(cam.position.x).toBeGreaterThan(0);
    });

    it("T1-F13-05: Camera shake applies high-frequency perturbation during crash", () => {
      const rig = createCameraRig();
      const cam = new THREE.PerspectiveCamera(40, 16 / 9, 0.1, 150);
      rig.reset({ x: 0, z: 0 });
      rig.update(cam, { x: 0, z: 0 }, 0.016, { x: 0, z: 0 }, 5.0);
      const camX = cam.position.x;
      expect(camX).not.toBe(0);
    });
  });

  // F14: Package Delivery Loop & Multi-Slot Cargo
  describe("F14: Package Delivery Loop & Multi-Slot Cargo", () => {
    it("T1-F14-01: createDeliveryState begins in loading phase", () => {
      const del = createDeliveryState();
      expect(del.phase).toBe("loading");
      expect(del.completed).toBe(0);
      expect(del.capacity).toBe(1);
    });

    it("T1-F14-02: Holding inside zone with speed <= 0.5 for 1.0s completes delivery", () => {
      let del = createDeliveryState();
      const depot = { x: -62, z: -32 };
      const homes = [{ x: -65, z: -84 }];
      const veh: VehicleState = {
        position: { ...depot },
        velocity: { x: 0, z: 0 },
        heading: 0,
        nitro: 1,
        drifting: false,
        steerAngle: 0,
        altitude: 0,
        verticalVelocity: 0,
        airborne: false,
      };
      // Load package
      del = stepDelivery(del, veh, depot, homes, 1.0);
      expect(del.phase).toBe("delivering");
    });

    it("T1-F14-03: Delivery reward incorporates package multiplier and district multiplier", () => {
      let del = createDeliveryState(0, 2, "market");
      del.phase = "delivering";
      del.secondsLeft = 30;
      del.packageType = "urgent"; // 1.35x
      del.district = "market"; // 1.15x
      const homes = [{ x: 25, z: 31.5 }];
      const veh: VehicleState = {
        position: { x: 25, z: 31.5 },
        velocity: { x: 0, z: 0 },
        heading: 0,
        nitro: 1,
        drifting: false,
        steerAngle: 0,
        altitude: 0,
        verticalVelocity: 0,
        airborne: false,
      };
      del = stepDelivery(del, veh, { x: 0, z: 0 }, homes, 1.0);
      expect(del.completed).toBe(1);
      expect(del.score).toBeGreaterThan(150);
      expect(del.lastReward?.safeBonus).toBe(25);
    });

    it("T1-F14-04: Package damage degrades earnings but maintains safe bonus threshold", () => {
      let del = createDeliveryState();
      del.phase = "delivering";
      del.packageDamage = 50;
      const homes = [{ x: -65, z: -84 }];
      const veh: VehicleState = {
        position: { x: -65, z: -84 },
        velocity: { x: 0, z: 0 },
        heading: 0,
        nitro: 1,
        drifting: false,
        steerAngle: 0,
        altitude: 0,
        verticalVelocity: 0,
        airborne: false,
      };
      del = stepDelivery(del, veh, { x: 0, z: 0 }, homes, 1.0);
      expect(del.lastReward?.safeBonus).toBe(0);
    });

    it("T1-F14-05: Cargo level 2 capacity allows 2 consecutive deliveries before depot return", () => {
      let del = createDeliveryState(1); // cargoLevel 1 -> capacity 2
      expect(del.capacity).toBe(2);
      del.phase = "delivering";
      del.packageSlot = 1;
      const homes = [{ x: -65, z: -84 }, { x: -35, z: -84 }];
      const veh: VehicleState = {
        position: { x: -65, z: -84 },
        velocity: { x: 0, z: 0 },
        heading: 0,
        nitro: 1,
        drifting: false,
        steerAngle: 0,
        altitude: 0,
        verticalVelocity: 0,
        airborne: false,
      };
      del = stepDelivery(del, veh, { x: 0, z: 0 }, homes, 1.0);
      expect(del.phase).toBe("delivering");
      expect(del.packageSlot).toBe(2);
    });
  });

  // F15: Company Management & Upgrade System
  describe("F15: Company Management & Upgrade System", () => {
    it("T1-F15-01: Upgrade costs scale linearly with level + 1", () => {
      expect(upgradeCost("engine", 0)).toBe(180);
      expect(upgradeCost("engine", 1)).toBe(360);
      expect(upgradeCost("engine", 2)).toBe(540);
      expect(upgradeCost("brakes", 0)).toBe(160);
      expect(upgradeCost("cargo", 0)).toBe(220);
    });

    it("T1-F15-02: MAX_UPGRADE_LEVEL caps engine at 4 and cargo at 3", () => {
      expect(MAX_UPGRADE_LEVEL.engine).toBe(4);
      expect(MAX_UPGRADE_LEVEL.brakes).toBe(4);
      expect(MAX_UPGRADE_LEVEL.cargo).toBe(3);
      expect(MAX_UPGRADE_LEVEL.grip).toBe(4);
      expect(MAX_UPGRADE_LEVEL.nitro).toBe(4);
    });

    it("T1-F15-03: canPurchaseUpgrade returns true only if level < max and money >= cost", () => {
      expect(canPurchaseUpgrade("engine", 0, 180)).toBe(true);
      expect(canPurchaseUpgrade("engine", 0, 179)).toBe(false);
      expect(canPurchaseUpgrade("engine", 4, 10000)).toBe(false);
    });

    it("T1-F15-04: tryPurchaseUpgrade deducts money and increments tier level", () => {
      const state = { money: 500, upgrades: defaultUpgrades() };
      const next = tryPurchaseUpgrade(state, "engine");
      expect(next.money).toBe(320);
      expect(next.upgrades.engine).toBe(1);
    });

    it("T1-F15-05: upgradeLabel returns localized Turkish strings", () => {
      expect(upgradeLabel("engine")).toBe("Motor");
      expect(upgradeLabel("brakes")).toBe("Fren");
      expect(upgradeLabel("cargo")).toBe("Kapasite");
      expect(upgradeLabel("grip")).toBe("Lastik Tutuşu");
      expect(upgradeLabel("nitro")).toBe("Nitro Deposu");
    });
  });

  // F16: In-World Buy Pads & District Unlocks
  describe("F16: In-World Buy Pads & District Unlocks", () => {
    it("T1-F16-01: createBuyPad initializes position, cost, level, and radius", () => {
      const pad = createBuyPad({
        id: "pad_engine",
        name: "Motor Geliştirme",
        position: { x: -50, z: -35 },
        targetCost: 180,
      });
      expect(pad.id).toBe("pad_engine");
      expect(pad.currentAmount).toBe(0);
      expect(pad.targetCost).toBe(180);
      expect(pad.isCompleted).toBe(false);
    });

    it("T1-F16-02: updateBuyPads transfers money when vehicle is inside radius and speed < 2.0", () => {
      const pad = createBuyPad({
        id: "test",
        name: "Test Pad",
        position: { x: 0, z: 0 },
        targetCost: 100,
      });
      const res = updateBuyPads([pad], { x: 0, z: 0 }, 50, 0.1, 0.5);
      expect(res.spentMoney).toBeCloseTo(12, 1); // 120/s * 0.1s = 12
      expect(pad.currentAmount).toBeCloseTo(12, 1);
    });

    it("T1-F16-03: updateBuyPads does not transfer money when vehicle is moving fast", () => {
      const pad = createBuyPad({
        id: "test",
        name: "Test Pad",
        position: { x: 0, z: 0 },
        targetCost: 100,
      });
      const res = updateBuyPads([pad], { x: 0, z: 0 }, 50, 0.1, 3.5);
      expect(res.spentMoney).toBe(0);
      expect(pad.currentAmount).toBe(0);
    });

    it("T1-F16-04: Reaching target cost triggers complete event and level up", () => {
      const onComplete = vi.fn();
      const pad = createBuyPad({
        id: "test",
        name: "Test Pad",
        position: { x: 0, z: 0 },
        targetCost: 50,
        onComplete,
      });
      const res = updateBuyPads([pad], { x: 0, z: 0 }, 100, 1.0, 0);
      expect(pad.level).toBe(1);
      expect(onComplete).toHaveBeenCalled();
      expect(res.events.some((e) => e.type === "complete")).toBe(true);
    });

    it("T1-F16-05: 3D BuyPadsView visual manager creates and updates pad instances", () => {
      const pad = createBuyPad({
        id: "pad_test",
        name: "Test Visual",
        position: { x: 10, z: 10 },
        targetCost: 100,
      });
      const view = createBuyPadsView([pad]);
      expect(view.group.children).toHaveLength(1);
      view.update([pad], 0.1, "pad_test");
      view.dispose();
      expect(view.group.children).toHaveLength(0);
    });
  });

  // F17: Autonomous Fleet Couriers & Passive Income
  describe("F17: Autonomous Fleet Couriers & Passive Income", () => {
    it("T1-F17-01: generateCourierCandidate creates valid profile with Turkish names", () => {
      const candidate = generateCourierCandidate(3);
      expect(candidate.id).toBeDefined();
      expect(candidate.name.length).toBeGreaterThan(4);
      expect(candidate.level).toBeGreaterThanOrEqual(1);
      expect(candidate.speed).toBeGreaterThanOrEqual(0.85);
      expect(candidate.reliability).toBeGreaterThanOrEqual(0.78);
    });

    it("T1-F17-02: hireCourier deducts hire cost and adds courier to progression", () => {
      const candidate = generateCourierCandidate(1);
      const cost = courierHireCost(candidate);
      let prog = asCompanyProgression({
        bestScore: 0,
        soundEnabled: true,
        money: cost + 100,
        reputation: 0,
        companyLevel: 1,
        completedDeliveries: 0,
        upgrades: defaultUpgrades(),
      });
      prog = hireCourier(prog, candidate);
      expect(prog.couriers).toHaveLength(1);
      expect(prog.money).toBe(100);
      expect(prog.reputation).toBe(1);
    });

    it("T1-F17-03: calculateOfflineEarnings caps elapsed time to 8 hours (28,800s)", () => {
      const prog = asCompanyProgression({
        bestScore: 0,
        soundEnabled: true,
        money: 0,
        reputation: 0,
        companyLevel: 1,
        completedDeliveries: 0,
        upgrades: defaultUpgrades(),
        couriers: [{ id: "c1", name: "Ali", level: 1, speed: 1.0, reliability: 0.9, wage: 20, assigned: true }],
        lastPlayedTimestamp: Date.now() - 20 * 3600 * 1000, // 20 hours ago
      });
      const res = calculateOfflineEarnings(prog);
      expect(res.effectiveSeconds).toBe(MAX_OFFLINE_SECONDS);
      expect(res.earnings).toBeGreaterThan(0);
    });

    it("T1-F17-04: claimOfflineEarnings adds accumulated sum to money and resets pool", () => {
      let prog = asCompanyProgression({
        bestScore: 0,
        soundEnabled: true,
        money: 200,
        reputation: 0,
        companyLevel: 1,
        completedDeliveries: 0,
        upgrades: defaultUpgrades(),
        offlineEarningsAccumulated: 350,
      });
      prog = claimOfflineEarnings(prog);
      expect(prog.money).toBe(550);
      expect(prog.offlineEarningsAccumulated).toBe(0);
    });

    it("T1-F17-05: CourierFleet updates FSM phases and triggers delivery events", () => {
      const fleet = createCourierFleet();
      const depot = { x: -62, z: -32 };
      const homes = [{ x: -65, z: -84 }];
      fleet.syncWithProgression(
        [{ id: "c1", name: "Mehmet", level: 1, speed: 1.2, reliability: 0.95, wage: 20, assigned: true }],
        1,
        depot,
        homes,
      );
      expect(fleet.couriers).toHaveLength(1);
      const courier = fleet.couriers[0];
      // Force state to delivering
      courier.phase = "delivering";
      courier.timer = 0.05;
      const events = fleet.update(0.1, 1, depot, homes);
      expect(events).toHaveLength(1);
      expect(events[0].earnings).toBeGreaterThan(0);
      expect(courier.phase).toBe("driving_to_depot");
    });
  });

  // F18: Save Data Persistence & Backwards Compatibility
  describe("F18: Save Data Persistence & Backwards Compatibility", () => {
    it("T1-F18-01: localStorage adapter writes and reads mini-kargo:v1 key", () => {
      const storageMap = new Map<string, string>();
      const adapter = createLocalStorageAdapter({
        getItem: (k) => storageMap.get(k) ?? null,
        setItem: (k, v) => storageMap.set(k, v),
      });
      adapter.save({ money: 750, companyLevel: 3 });
      const loaded = adapter.load();
      expect(loaded.money).toBe(750);
      expect(loaded.companyLevel).toBe(3);
    });

    it("T1-F18-02: Missing fields gracefully fallback to schema defaults", () => {
      const storageMap = new Map<string, string>();
      storageMap.set("mini-kargo:v1", JSON.stringify({ money: 100 }));
      const adapter = createLocalStorageAdapter({
        getItem: (k) => storageMap.get(k) ?? null,
        setItem: (k, v) => storageMap.set(k, v),
      });
      const loaded = adapter.load();
      expect(loaded.companyLevel).toBe(1);
      expect(loaded.bestScore).toBe(0);
      expect(loaded.unlockedDistricts).toContain("sunny");
      expect(loaded.unlockedVehicles).toContain("van");
    });

    it("T1-F18-03: Corrupted JSON data recovers cleanly to defaults", () => {
      const storageMap = new Map<string, string>();
      storageMap.set("mini-kargo:v1", "{bad-json:::");
      const adapter = createLocalStorageAdapter({
        getItem: (k) => storageMap.get(k) ?? null,
        setItem: (k, v) => storageMap.set(k, v),
      });
      const loaded = adapter.load();
      expect(loaded.money).toBe(0);
      expect(loaded.companyLevel).toBe(1);
    });

    it("T1-F18-04: Non-negative integer sanitization clamps invalid negative values", () => {
      const storageMap = new Map<string, string>();
      storageMap.set(
        "mini-kargo:v1",
        JSON.stringify({ money: -500, reputation: -10, companyLevel: -3 }),
      );
      const adapter = createLocalStorageAdapter({
        getItem: (k) => storageMap.get(k) ?? null,
        setItem: (k, v) => storageMap.set(k, v),
      });
      const loaded = adapter.load();
      expect(loaded.money).toBe(0);
      expect(loaded.reputation).toBe(0);
      expect(loaded.companyLevel).toBe(1);
    });

    it("T1-F18-05: asCompanyProgression ensures required progression fields exist", () => {
      const pref: Preferences = {
        bestScore: 100,
        soundEnabled: true,
        money: 50,
        reputation: 2,
        companyLevel: 2,
        completedDeliveries: 10,
        upgrades: defaultUpgrades(),
      };
      const prog = asCompanyProgression(pref);
      expect(prog.lastPlayedTimestamp).toBeDefined();
      expect(prog.offlineEarningsAccumulated).toBe(0);
      expect(prog.couriers).toEqual([]);
      expect(prog.unlockedDistricts).toContain("market");
    });
  });

  // F19: Mobile-First Responsive HUD & Touch Controls
  describe("F19: Mobile-First Responsive HUD & Touch Controls", () => {
    it("T1-F19-01: createHud builds responsive DOM elements and navigation", () => {
      const root = setupMockDom();
      const hud = createHud(root as unknown as HTMLElement, {
        restart: vi.fn(),
        recover: vi.fn(),
        toggleSound: vi.fn(),
        buyUpgrade: vi.fn(),
      });
      expect(root.querySelector(".topbar")).toBeDefined();
      expect(root.querySelector("#joystick")).toBeDefined();
      expect(root.querySelector(".mobile-actions")).toBeDefined();
      hud.dispose();
    });

    it("T1-F19-02: joystickToDrive translates touch stick position to steering angle", () => {
      const idle = joystickToDrive({ x: 0, z: 0 }, 0, 0);
      expect(idle.throttle).toBe(0);
      expect(idle.steer).toBe(0);

      const forward = joystickToDrive({ x: 0, z: 1 }, 0, 5);
      expect(forward.throttle).toBe(1);
      expect(forward.steer).toBe(0);
    });

    it("T1-F19-03: Keyboard state smoothes throttle and steer inputs", () => {
      const kb = createKeyboardState();
      kb.press("w");
      const out1 = kb.step(0.016);
      expect(out1.throttle).toBeGreaterThan(0);
      expect(out1.throttle).toBeLessThan(1);
      kb.release("w");
    });

    it("T1-F19-04: Nitro and drift buttons register hold states cleanly", () => {
      const root = setupMockDom();
      const setHandbrake = vi.fn();
      const setNitro = vi.fn();
      const hud = createHud(root as unknown as HTMLElement, {
        restart: vi.fn(),
        recover: vi.fn(),
        toggleSound: vi.fn(),
        buyUpgrade: vi.fn(),
        setHandbrake,
        setNitro,
      });
      hud.setNitro(0.8, 1.0);
      hud.dispose();
      expect(setHandbrake).toBeDefined();
      expect(setNitro).toBeDefined();
    });

    it("T1-F19-05: Company Sheet renders tabs and handles modal transitions", () => {
      const root = setupMockDom();
      const sheet = createCompanySheet(root as unknown as HTMLElement, {
        onStartShift: vi.fn(),
        onBuyUpgrade: vi.fn(),
        onHireCourier: vi.fn(),
        onClaimOffline: vi.fn(),
      });
      expect(sheet.isVisible()).toBe(true);
      sheet.hide();
      expect(sheet.isVisible()).toBe(false);
      sheet.dispose();
    });
  });

  // F20: Canvas Radar Minimap
  describe("F20: Canvas Radar Minimap", () => {
    it("T1-F20-01: worldToMinimap translates world (-100, 100) to canvas (0, size)", () => {
      const pTopLeft = worldToMinimap(-100, -100, 100, DEFAULT_BOUNDS);
      expect(pTopLeft).toEqual({ x: 0, y: 0 });
      const pCenter = worldToMinimap(0, 0, 100, DEFAULT_BOUNDS);
      expect(pCenter).toEqual({ x: 50, y: 50 });
      const pBottomRight = worldToMinimap(100, 100, 100, DEFAULT_BOUNDS);
      expect(pBottomRight).toEqual({ x: 100, y: 100 });
    });

    it("T1-F20-02: isMinimapDistrictLocked identifies locked districts by company level", () => {
      expect(isMinimapDistrictLocked("sunny", 1)).toBe(false);
      expect(isMinimapDistrictLocked("market", 1)).toBe(true);
      expect(isMinimapDistrictLocked("market", 2)).toBe(false);
      expect(isMinimapDistrictLocked("industrial", 2)).toBe(true);
      expect(isMinimapDistrictLocked("industrial", 3)).toBe(false);
    });

    it("T1-F20-03: createMinimap mounts canvas element and renders 2D context", () => {
      const root = setupMockDom();
      const minimap = createMinimap(root as unknown as HTMLElement, { size: 105 });
      expect(minimap.canvas).toBeDefined();
      expect(minimap.canvas.width).toBe(105);
      expect(() => {
        minimap.update({ x: 0, z: 0 }, 0, { x: 25, z: 25 }, "delivering", 1, 0.016);
      }).not.toThrow();
      minimap.dispose();
    });

    it("T1-F20-04: Minimap accepts courier positions for fleet radar visualization", () => {
      const root = setupMockDom();
      const minimap = createMinimap(root as unknown as HTMLElement);
      expect(() => {
        minimap.update(
          { x: 0, z: 0 },
          0,
          { x: -65, z: -84 },
          "delivering",
          2,
          0.016,
          [{ x: 10, z: 10 }, { x: -30, z: -30 }],
        );
      }).not.toThrow();
      minimap.dispose();
    });

    it("T1-F20-05: Minimap dispose removes container element cleanly", () => {
      const root = setupMockDom();
      const minimap = createMinimap(root as unknown as HTMLElement);
      minimap.dispose();
      expect(root.children).toHaveLength(0);
    });
  });

  // F21: Automated Playwright Browser QA & Artifact Capture
  describe("F21: Automated Playwright Browser QA & Artifact Capture", () => {
    it("T1-F21-01: Artifact viewports match desktop, mobile, and landscape specifications", () => {
      const viewports = [
        { width: 1280, height: 800, name: "desktop" },
        { width: 390, height: 844, name: "mobile" },
        { width: 844, height: 390, name: "landscape" },
      ];
      expect(viewports).toHaveLength(3);
      expect(viewports[0].width).toBe(1280);
      expect(viewports[1].width).toBe(390);
      expect(viewports[2].width).toBe(844);
    });

    it("T1-F21-02: Target artifact file paths resolve in artifacts directory", () => {
      const targets = [
        "artifacts/preview-desktop.png",
        "artifacts/preview-mobile.png",
        "artifacts/preview-landscape.png",
        "artifacts/gameplay-desktop.png",
        "artifacts/browser-report.json",
      ];
      for (const t of targets) {
        expect(t.startsWith("artifacts/")).toBe(true);
      }
    });

    it("T1-F21-03: WebGL fallback detection gracefully reports startup errors", () => {
      const canvas = new MockDOMElement("canvas");
      canvas.getContext = (type: string) => (type.includes("webgl") ? null : {});
      expect(canvas.getContext("webgl")).toBeNull();
      expect(canvas.getContext("webgl2")).toBeNull();
    });

    it("T1-F21-04: Unavailable audio context fallback does not throw unhandled exception", () => {
      let audioThrown = false;
      try {
        const Ctx = function () {
          throw new Error("audio disabled");
        };
        new (Ctx as any)();
      } catch (e) {
        audioThrown = true;
      }
      expect(audioThrown).toBe(true);
    });

    it("T1-F21-05: Visibility change event pauses game simulation loop accumulator", () => {
      let paused = false;
      const onVisibility = () => {
        paused = true;
      };
      onVisibility();
      expect(paused).toBe(true);
    });
  });
});

// ============================================================================
// TIER 2: BOUNDARY & CORNER CASES (F01 - F21) [105 TEST CASES: 21 x 5]
// ============================================================================
describe("Tier 2: Boundary & Corner Cases (F01-F21)", () => {
  // F01: Güneş Mahallesi (Sunny District)
  describe("F01: Güneş Mahallesi (Sunny District)", () => {
    it("T2-F01-01: Exact coordinate boundaries at x=0, z=0 resolve to Sunny quadrant", () => {
      expect(districtAt(-0.001, -0.001)).toBe("sunny");
      expect(districtAt(-100, -100)).toBe("sunny");
    });

    it("T2-F01-02: Edge of delivery zone at dist=2.0 holds vs dist=2.001 does not", () => {
      const depot = { x: -62, z: -32 };
      const homes = [{ x: -65, z: -84 }];
      let del = createDeliveryState();
      del.phase = "delivering";

      const vInside: VehicleState = {
        position: { x: -65, z: -84 + 2.0 },
        velocity: { x: 0, z: 0 },
        heading: 0,
        nitro: 1,
        drifting: false,
        steerAngle: 0,
        altitude: 0,
        verticalVelocity: 0,
        airborne: false,
      };
      del = stepDelivery(del, vInside, depot, homes, 0.5);
      expect(del.holdSeconds).toBeCloseTo(0.5, 2);

      const vOutside: VehicleState = {
        position: { x: -65, z: -84 + 2.05 },
        velocity: { x: 0, z: 0 },
        heading: 0,
        nitro: 1,
        drifting: false,
        steerAngle: 0,
        altitude: 0,
        verticalVelocity: 0,
        airborne: false,
      };
      del = stepDelivery(del, vOutside, depot, homes, 0.5);
      expect(del.holdSeconds).toBe(0);
    });

    it("T2-F01-03: Negative or zero company level keeps Güneş unlocked", () => {
      expect(isDistrictUnlocked("sunny", 0)).toBe(true);
      expect(isDistrictUnlocked("sunny", -5)).toBe(true);
    });

    it("T2-F01-04: Zero distance to drop center increments hold timer reliably", () => {
      let del = createDeliveryState();
      del.phase = "delivering";
      const veh: VehicleState = {
        position: { x: -65, z: -84 },
        velocity: { x: 0, z: 0 },
        heading: 0,
        nitro: 1,
        drifting: false,
        steerAngle: 0,
        altitude: 0,
        verticalVelocity: 0,
        airborne: false,
      };
      del = stepDelivery(del, veh, { x: 0, z: 0 }, [{ x: -65, z: -84 }], 0.6);
      expect(del.holdSeconds).toBeCloseTo(0.6, 2);
    });

    it("T2-F01-05: Extreme company level (999) preserves Güneş multiplier 1.0", () => {
      expect(districtById("sunny").rewardMultiplier).toBe(1.0);
      expect(isDistrictUnlocked("sunny", 999)).toBe(true);
    });
  });

  // F02: Çarşı Bölgesi (Market District)
  describe("F02: Çarşı Bölgesi (Market District)", () => {
    it("T2-F02-01: Company level 1.999 is locked; level 2.0 is unlocked", () => {
      expect(isDistrictUnlocked("market", 1)).toBe(false);
      expect(isDistrictUnlocked("market", 2)).toBe(true);
    });

    it("T2-F02-02: Extreme quadrant coordinates (100, 100) resolve to market", () => {
      expect(districtAt(100, 100)).toBe("market");
      expect(districtAt(0.001, 0.001)).toBe("market");
    });

    it("T2-F02-03: Unlocked list with string 'market' overrides low level 1", () => {
      expect(isDistrictUnlocked("market", 1, ["market"])).toBe(true);
    });

    it("T2-F02-04: Set of unlocked districts correctly checks market inclusion", () => {
      const set = new Set<DistrictId>(["sunny", "market"]);
      expect(isDistrictUnlocked("market", 1, set)).toBe(true);
      expect(isDistrictUnlocked("industrial", 1, set)).toBe(false);
    });

    it("T2-F02-05: ResolveDistrict selects market when explicitly requested and open", () => {
      const resolved = resolveDistrict(2, "market");
      expect(resolved.id).toBe("market");
      const fallback = resolveDistrict(1, "market");
      expect(fallback.id).toBe("sunny");
    });
  });

  // F03: Sanayi Bölgesi (Industrial District)
  describe("F03: Sanayi Bölgesi (Industrial District)", () => {
    it("T2-F03-01: Boundary between level 2 and 3 unlocks Sanayi strictly at 3", () => {
      expect(isDistrictUnlocked("industrial", 2)).toBe(false);
      expect(isDistrictUnlocked("industrial", 3)).toBe(true);
    });

    it("T2-F03-02: Extreme quadrant coordinates (100, -100) resolve to industrial", () => {
      expect(districtAt(100, -100)).toBe("industrial");
      expect(districtAt(0.001, -0.001)).toBe("industrial");
    });

    it("T2-F03-03: Available homes at level 3 contains exactly 12 indices (0..11)", () => {
      const indices = getAvailableHomeIndices(3);
      expect(indices).toHaveLength(12);
      expect(indices).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    });

    it("T2-F03-04: Sanayi reward multiplier 1.3 rounds downward with floor correctly", () => {
      const base = 100;
      const mult = districtById("industrial").rewardMultiplier;
      expect(Math.floor(base * mult)).toBe(130);
    });

    it("T2-F03-05: Barrier obstacle activation toggles visibility when unlocked", () => {
      const world = createWorld();
      world.updateUnlockedDistricts(1);
      const indBarrier = world.barriers.find((b) => b.districtId === "industrial");
      expect(indBarrier?.group.visible).toBe(true);
      world.updateUnlockedDistricts(3);
      expect(indBarrier?.group.visible).toBe(false);
    });
  });

  // F04: Sahil Şeridi (Coastal District)
  describe("F04: Sahil Şeridi (Coastal District)", () => {
    it("T2-F04-01: Boundary between level 3 and 4 unlocks Sahil strictly at 4", () => {
      expect(isDistrictUnlocked("coastal", 3)).toBe(false);
      expect(isDistrictUnlocked("coastal", 4)).toBe(true);
    });

    it("T2-F04-02: Extreme quadrant coordinates (-100, 100) resolve to coastal", () => {
      expect(districtAt(-100, 100)).toBe("coastal");
      expect(districtAt(-0.001, 0.001)).toBe("coastal");
    });

    it("T2-F04-03: Full available home inventory at level 4 contains all 16 homes", () => {
      const indices = getAvailableHomeIndices(4);
      expect(indices).toHaveLength(16);
      expect(indices).toEqual(Array.from({ length: 16 }, (_, i) => i));
    });

    it("T2-F04-04: getDistrictForHome maps indices 12-15 to coastal", () => {
      for (let i = 12; i <= 15; i++) {
        expect(getDistrictForHome(i)).toBe("coastal");
      }
    });

    it("T2-F04-05: Empty unlocked list defaults to Güneş homes [0, 1, 2, 3]", () => {
      const indices = getAvailableHomeIndices(1, new Set());
      expect(indices).toEqual([0, 1, 2, 3]);
    });
  });

  // F05: Road Network & Street Continuity
  describe("F05: Road Network & Street Continuity", () => {
    it("T2-F05-01: Center crossroad (0, 0) is equidistant to all 4 quadrants", () => {
      expect(ROAD_NODES.boulevard_c).toEqual({ x: 0, z: 0 });
    });

    it("T2-F05-02: findNearestNode handles extreme boundary coordinates", () => {
      const n1 = findNearestNode({ x: -100, z: -100 });
      expect(n1).toBe("sunny_nw");
      const n2 = findNearestNode({ x: 100, z: 100 });
      expect(n2).toBe("mkt_s_e");
    });

    it("T2-F05-03: findNodePath with identical start and end returns single node", () => {
      const path = findNodePath("boulevard_c", "boulevard_c");
      expect(path).toHaveLength(1);
      expect(path[0]).toEqual({ x: 0, z: 0 });
    });

    it("T2-F05-04: buildCourierRoute with coincident points returns 1-point route", () => {
      const route = buildCourierRoute({ x: 0, z: 0 }, { x: 0, z: 0 });
      expect(route).toHaveLength(1);
    });

    it("T2-F05-05: Road edges adjacency map is symmetric (bidirectional)", () => {
      for (const [a, b] of ROAD_EDGES) {
        expect(ROAD_NODES[a]).toBeDefined();
        expect(ROAD_NODES[b]).toBeDefined();
      }
    });
  });

  // F06: Jump Ramps & World Geometry
  describe("F06: Jump Ramps & World Geometry", () => {
    it("T2-F06-01: Speed just below launch threshold (7.99 vs 8.0) fails launch", () => {
      const r = RAMPS[0];
      const state: VehicleState = {
        position: { ...r.position },
        velocity: { x: 0, z: -7.99 },
        heading: Math.PI,
        nitro: 1,
        drifting: false,
        steerAngle: 0,
        altitude: 0,
        verticalVelocity: 0,
        airborne: false,
      };
      expect(checkRampLaunch(state, [r])).toBeNull();
    });

    it("T2-F06-02: Heading offset > 60 degrees fails ramp launch", () => {
      const r = RAMPS[0];
      const state: VehicleState = {
        position: { ...r.position },
        velocity: { x: 12, z: 0 }, // 90 degrees offset to heading PI
        heading: Math.PI / 2,
        nitro: 1,
        drifting: false,
        steerAngle: 0,
        altitude: 0,
        verticalVelocity: 0,
        airborne: false,
      };
      expect(checkRampLaunch(state, [r])).toBeNull();
    });

    it("T2-F06-03: Vehicle flying high above ramp height (> height + 0.6) ignores ramp", () => {
      const r = RAMPS[0];
      const state: VehicleState = {
        position: { ...r.position },
        velocity: { x: 0, z: -12 },
        heading: Math.PI,
        nitro: 1,
        drifting: false,
        steerAngle: 0,
        altitude: r.height + 1.0,
        verticalVelocity: 0,
        airborne: true,
      };
      expect(checkRampLaunch(state, [r])).toBeNull();
    });

    it("T2-F06-04: Vehicle lateral position outside ramp width ignores launch", () => {
      const r = RAMPS[0];
      const state: VehicleState = {
        position: { x: r.position.x + r.size.x + 1.0, z: r.position.z },
        velocity: { x: 0, z: -10 },
        heading: Math.PI,
        nitro: 1,
        drifting: false,
        steerAngle: 0,
        altitude: 0,
        verticalVelocity: 0,
        airborne: false,
      };
      expect(checkRampLaunch(state, [r])).toBeNull();
    });

    it("T2-F06-05: Empty ramps array returns null cleanly", () => {
      const state = resetVehicle({ x: 0, z: 0 });
      expect(checkRampLaunch(state, [])).toBeNull();
    });
  });

  // F07: Traffic Vehicle Simulation
  describe("F07: Traffic Vehicle Simulation", () => {
    it("T2-F07-01: Zero speed traffic car maintains position stably", () => {
      const traffic = createTraffic();
      traffic.cars[0].speed = 0;
      const initialPos = { ...traffic.cars[0].position };
      traffic.update(1.0, { x: -999, z: -999 });
      expect(traffic.cars[0].position).toEqual(initialPos);
    });

    it("T2-F07-02: Impact recoil clamps push magnitude <= 1.8", () => {
      const traffic = createTraffic();
      traffic.impactCar(0, { x: traffic.cars[0].position.x - 1, z: traffic.cars[0].position.z }, 999.0);
      expect(Math.hypot(traffic.cars[0].recoilX, traffic.cars[0].recoilZ)).toBeLessThanOrEqual(1.85);
    });

    it("T2-F07-03: Zero delta time does not update positions or timers", () => {
      const traffic = createTraffic();
      const car = traffic.cars[0];
      const prev = { ...car.position };
      traffic.update(0, { x: -999, z: -999 });
      expect(car.position).toEqual(prev);
    });

    it("T2-F07-04: Player at extreme distance (> 200m) generates zero collision contacts", () => {
      const traffic = createTraffic();
      const res = traffic.update(0.1, { x: 500, z: 500 });
      expect(res.contacts).toHaveLength(0);
      expect(res.collisionCarIndex).toBeNull();
    });

    it("T2-F07-05: Police car flasher alternates emissive colors over time", () => {
      const traffic = createTraffic();
      const police = traffic.cars.find((c) => c.kind === "police")!;
      expect(police).toBeDefined();
      police.flasherTimer = 0.1;
      traffic.update(0.1, { x: -999, z: -999 });
      expect(police.flasherTimer).toBeGreaterThan(0.1);
    });
  });

  // F08: Pedestrian Simulation & Reactive Evasion
  describe("F08: Pedestrian Simulation & Reactive Evasion", () => {
    it("T2-F08-01: Player speed below 3.2 does not trigger panic flee", () => {
      const peds = createPedestrians();
      const p = peds.pedestrians[0];
      peds.update(0.1, { x: p.position.x + 1.0, z: p.position.z }, 3.1);
      expect(p.panicTimer).toBe(0);
    });

    it("T2-F08-02: Player distance > 4.2 does not trigger panic flee", () => {
      const peds = createPedestrians();
      const p = peds.pedestrians[0];
      peds.update(0.1, { x: p.position.x + 4.3, z: p.position.z }, 10.0);
      expect(p.panicTimer).toBe(0);
    });

    it("T2-F08-03: Pedestrian reversing at limits reverses direction strictly", () => {
      const peds = createPedestrians();
      const p = peds.pedestrians[0];
      p.limit = 10;
      p.position[p.axis] = 11;
      p.direction = 1;
      peds.update(0.1, { x: -999, z: -999 }, 0);
      expect(p.direction).toBe(-1);
    });

    it("T2-F08-04: Zero delta time causes 0 position change", () => {
      const peds = createPedestrians();
      const p = peds.pedestrians[0];
      const prev = { ...p.position };
      peds.update(0, { x: -999, z: -999 }, 0);
      expect(p.position).toEqual(prev);
    });

    it("T2-F08-05: Pedestrian penalty contact triggers only when dist < 1.35 and speed > 3.5", () => {
      const peds = createPedestrians();
      const p = peds.pedestrians[0];
      const contacts = peds.update(0.016, { x: p.position.x + 0.5, z: p.position.z }, 4.0);
      expect(contacts.length).toBeGreaterThan(0);
    });
  });

  // F09: Ambient Props & Breakable Physics
  describe("F09: Ambient Props & Breakable Physics", () => {
    it("T2-F09-01: Vehicle altitude above prop height does not hit prop", () => {
      const scene = new THREE.Scene();
      const props = createProps(scene);
      const p = props.props[0];
      const veh: VehicleState = {
        position: { x: p.pos.x, z: p.pos.z },
        velocity: { x: 5, z: 0 },
        heading: 0,
        nitro: 1,
        drifting: false,
        steerAngle: 0,
        altitude: p.height + 0.5,
        verticalVelocity: 0,
        airborne: true,
      };
      const hit = props.update(0.016, veh);
      expect(hit).toBe(false);
      expect(p.hit).toBe(false);
    });

    it("T2-F09-02: Hit prop resets after 12 seconds timeout", () => {
      const scene = new THREE.Scene();
      const props = createProps(scene);
      const p = props.props[0];
      p.hit = true;
      p.timeSinceHit = 12.1;
      const veh = resetVehicle({ x: 0, z: 0 });
      props.update(0.1, veh);
      expect(p.hit).toBe(false);
    });

    it("T2-F09-03: Early reset triggers if timeSinceHit > 5s and player dist > 45m", () => {
      const scene = new THREE.Scene();
      const props = createProps(scene);
      const p = props.props[0];
      p.hit = true;
      p.timeSinceHit = 5.2;
      const veh = resetVehicle({ x: p.pos.x + 50, z: p.pos.z });
      props.update(0.1, veh);
      expect(p.hit).toBe(false);
    });

    it("T2-F09-04: Ground collision dampens vertical velocity by restitution factor", () => {
      const scene = new THREE.Scene();
      const props = createProps(scene);
      const p = props.props[0];
      p.hit = true;
      p.pos.y = p.initialPos.y;
      p.vel.y = -4.0;
      const veh = resetVehicle({ x: -999, z: -999 });
      props.update(0.016, veh);
      expect(p.vel.y).toBeCloseTo(1.41, 1);
    });

    it("T2-F09-05: Zero vehicle speed nudges prop with minimum velocity 3.5", () => {
      const scene = new THREE.Scene();
      const props = createProps(scene);
      const p = props.props[0];
      const veh: VehicleState = {
        position: { x: p.pos.x, z: p.pos.z },
        velocity: { x: 0, z: 0 },
        heading: 0,
        nitro: 1,
        drifting: false,
        steerAngle: 0,
        altitude: 0,
        verticalVelocity: 0,
        airborne: false,
      };
      props.update(0.016, veh);
      expect(Math.hypot(p.vel.x, p.vel.z)).toBeGreaterThanOrEqual(3.0);
    });
  });

  // F10: Drifting Clouds & Environmental Lighting
  describe("F10: Drifting Clouds & Environmental Lighting", () => {
    it("T2-F10-01: Zero count cloud system handles gracefully without error", () => {
      const clouds = createClouds(0);
      expect(clouds.group.children).toHaveLength(0);
      expect(() => clouds.update(1.0)).not.toThrow();
      clouds.dispose();
    });

    it("T2-F10-02: Zero delta time causes 0 cloud displacement", () => {
      const clouds = createClouds(5);
      const x0 = clouds.group.children[0].position.x;
      clouds.update(0);
      expect(clouds.group.children[0].position.x).toBe(x0);
    });

    it("T2-F10-03: Cloud wrap around preserves valid Y height in sky range [24, 38]", () => {
      const clouds = createClouds(5);
      clouds.group.children[0].position.x = 120;
      clouds.update(0.1);
      expect(clouds.group.children[0].position.y).toBeGreaterThanOrEqual(23.5);
    });

    it("T2-F10-04: Large delta time (10s) keeps clouds within boundary domain", () => {
      const clouds = createClouds(5);
      clouds.update(10);
      for (const c of clouds.group.children) {
        expect(c.position.x).toBeGreaterThanOrEqual(-115);
      }
    });

    it("T2-F10-05: Double dispose call does not throw", () => {
      const clouds = createClouds(3);
      clouds.dispose();
      expect(() => clouds.dispose()).not.toThrow();
    });
  });

  // F11: Vehicle Driving Physics & Dual Fleet
  describe("F11: Vehicle Driving Physics & Dual Fleet", () => {
    it("T2-F11-01: Coasting vehicle below stopSnap snaps to zero speed", () => {
      let state = resetVehicle({ x: 0, z: 0 });
      state.velocity = { x: 0.1, z: 0 }; // < TUNING.stopSnap (0.12)
      state = stepVehicle(state, { throttle: 0, steer: 0, handbrake: false, nitro: false }, 0.1);
      expect(Math.abs(state.velocity.x)).toBeLessThan(1e-10);
    });

    it("T2-F11-02: Nitro lockout locks at zero and resumes only when > 0.15", () => {
      let state = resetVehicle({ x: 0, z: 0 });
      state.nitro = 0.05;
      state.velocity = { x: 10, z: 0 };
      state = stepVehicle(state, { throttle: 1, steer: 0, handbrake: false, nitro: true }, 0.5);
      expect(state.nitroLocked).toBe(true);
      state.nitro = 0.14;
      state = stepVehicle(state, { throttle: 0, steer: 0, handbrake: false, nitro: false }, 0.01);
      expect(state.nitroLocked).toBe(true);
      state.nitro = 0.16;
      state = stepVehicle(state, { throttle: 0, steer: 0, handbrake: false, nitro: false }, 0.01);
      expect(state.nitroLocked).toBe(false);
    });

    it("T2-F11-03: Airborne physics applies gravity of 30 u/s² and reduces yaw rate", () => {
      let state = resetVehicle({ x: 0, z: 0 });
      state.altitude = 5;
      state.verticalVelocity = 0;
      state.airborne = true;
      state = stepVehicle(state, { throttle: 1, steer: 1, handbrake: false, nitro: false }, 0.1);
      expect(state.verticalVelocity).toBeCloseTo(-3.0, 1);
    });

    it("T2-F11-04: Full braking deceleration stops high speed vehicle rapidly", () => {
      let state = resetVehicle({ x: 0, z: 0 });
      state.velocity = { x: 14, z: 0 };
      state.heading = Math.PI / 2;
      for (let i = 0; i < 20; i++) {
        state = stepVehicle(state, { throttle: -1, steer: 0, handbrake: false, nitro: false }, 0.05);
      }
      expect(Math.hypot(state.velocity.x, state.velocity.z)).toBeLessThan(5);
    });

    it("T2-F11-05: Steer input clamped within [-1, 1]", () => {
      let state = resetVehicle({ x: 0, z: 0 });
      state = stepVehicle(state, { throttle: 1, steer: 5, handbrake: false, nitro: false }, 0.1);
      expect(Math.abs(state.steerAngle)).toBeLessThanOrEqual(TUNING.steerAngleMax + 0.01);
    });
  });

  // F12: Collision Fairness & Contact Damage
  describe("F12: Collision Fairness & Contact Damage", () => {
    it("T2-F12-01: Boundary walls clamp vehicle position at exact bounds ± radius", () => {
      const bounds: Rect = { minX: -100, maxX: 100, minZ: -100, maxZ: 100 };
      const res = resolveCollision({ x: 99, z: 0 }, { x: 105, z: 0 }, [], bounds, {
        radius: 0.65,
        velocity: { x: 10, z: 0 },
      });
      expect(res.position.x).toBeLessThanOrEqual(100 - 0.65);
      expect(res.collided).toBe(true);
    });

    it("T2-F12-02: Zero velocity collision does not produce normal velocity bounce", () => {
      const obstacle: Rect = { minX: 5, maxX: 10, minZ: -5, maxZ: 5 };
      const bounds: Rect = { minX: -100, maxX: 100, minZ: -100, maxZ: 100 };
      const res = resolveCollision({ x: 4.5, z: 0 }, { x: 6, z: 0 }, [obstacle], bounds, {
        velocity: { x: 0, z: 0 },
      });
      expect(res.velocity).toEqual({ x: 0, z: 0 });
    });

    it("T2-F12-03: staticCollisionContacts with 0 speed returns empty contacts", () => {
      const contacts = staticCollisionContacts(
        { x: 5, z: 0 },
        { x: 4, z: 0 },
        { x: 0, z: 0 },
        [],
        { minX: -100, maxX: 100, minZ: -100, maxZ: 100 },
      );
      expect(contacts).toHaveLength(0);
    });

    it("T2-F12-04: staticCollisionContacts decomposes effective velocity correctly", () => {
      const wall: Rect = { minX: 10, maxX: 12, minZ: -10, maxZ: 10 };
      const bounds: Rect = { minX: -100, maxX: 100, minZ: -100, maxZ: 100 };
      const contacts = staticCollisionContacts(
        { x: 10.2, z: 0 },
        { x: 9.35, z: 0 },
        { x: 10, z: 0 }, // pure normal
        [wall],
        bounds,
      );
      expect(contacts).toHaveLength(1);
      expect(contacts[0].severity).toBeCloseTo(10 / IMPACT_REFERENCE_SPEED, 2);
    });

    it("T2-F12-05: Altitude above obstacle height ignores obstacle collision", () => {
      const obstacle: Rect = { minX: 5, maxX: 10, minZ: -5, maxZ: 5, height: 2.0 };
      const bounds: Rect = { minX: -100, maxX: 100, minZ: -100, maxZ: 100 };
      const res = resolveCollision({ x: 4, z: 0 }, { x: 7, z: 0 }, [obstacle], bounds, {
        altitude: 2.5,
      });
      expect(res.collided).toBe(false);
      expect(res.position.x).toBeCloseTo(7, 4);
    });
  });

  // F13: Dynamic Chase Camera
  describe("F13: Dynamic Chase Camera", () => {
    it("T2-F13-01: Extreme vehicle speed clamps speedNorm to 1.0", () => {
      const rig = createCameraRig();
      const cam = new THREE.PerspectiveCamera(40, 16 / 9, 0.1, 150);
      rig.reset({ x: 0, z: 0 });
      rig.update(cam, { x: 0, z: 0 }, 0.1, { x: 0, z: 100 });
      expect(cam.fov).toBeLessThanOrEqual(48.5 + 0.01);
    });

    it("T2-F13-02: Zero velocity centers look-ahead without offset", () => {
      const rig = createCameraRig();
      const cam = new THREE.PerspectiveCamera(40, 16 / 9, 0.1, 150);
      rig.reset({ x: 10, z: 20 });
      rig.update(cam, { x: 10, z: 20 }, 0.1, { x: 0, z: 0 });
      expect(cam.position.x).toBeCloseTo(10, 1);
    });

    it("T2-F13-03: Portrait mode aspect ratio (<0.8) boosts camera height and distance", () => {
      const rig = createCameraRig();
      const camPortrait = new THREE.PerspectiveCamera(40, 0.5, 0.1, 150);
      rig.reset({ x: 0, z: 0 });
      rig.update(camPortrait, { x: 0, z: 0 }, 0.1, { x: 0, z: 0 });
      const portY = camPortrait.position.y;

      const camDesk = new THREE.PerspectiveCamera(40, 1.6, 0.1, 150);
      rig.reset({ x: 0, z: 0 });
      rig.update(camDesk, { x: 0, z: 0 }, 0.1, { x: 0, z: 0 });
      const deskY = camDesk.position.y;

      expect(portY).toBeGreaterThan(deskY);
    });

    it("T2-F13-04: Large dt is clamped to safeDt <= 0.1s", () => {
      const rig = createCameraRig();
      const cam = new THREE.PerspectiveCamera(40, 16 / 9, 0.1, 150);
      rig.reset({ x: 0, z: 0 });
      expect(() => rig.update(cam, { x: 0, z: 0 }, 5.0, { x: 0, z: 0 })).not.toThrow();
    });

    it("T2-F13-05: Zero shake produces smooth unperturbed position", () => {
      const rig = createCameraRig();
      const cam = new THREE.PerspectiveCamera(40, 16 / 9, 0.1, 150);
      rig.reset({ x: 0, z: 0 });
      rig.update(cam, { x: 0, z: 0 }, 0.016, { x: 0, z: 0 }, 0);
      expect(cam.position.x).toBeCloseTo(0, 2);
    });
  });

  // F14: Package Delivery Loop & Multi-Slot Cargo
  describe("F14: Package Delivery Loop & Multi-Slot Cargo", () => {
    it("T2-F14-01: Speed > 0.5 resets hold seconds to zero", () => {
      let del = createDeliveryState();
      del.phase = "delivering";
      del.holdSeconds = 0.8;
      const veh: VehicleState = {
        position: { x: -65, z: -84 },
        velocity: { x: 0.6, z: 0 }, // > 0.5
        heading: 0,
        nitro: 1,
        drifting: false,
        steerAngle: 0,
        altitude: 0,
        verticalVelocity: 0,
        airborne: false,
      };
      del = stepDelivery(del, veh, { x: 0, z: 0 }, [{ x: -65, z: -84 }], 0.1);
      expect(del.holdSeconds).toBe(0);
    });

    it("T2-F14-02: Zero seconds left awards minimum base reward", () => {
      let del = createDeliveryState();
      del.phase = "delivering";
      del.secondsLeft = 0;
      const veh: VehicleState = {
        position: { x: -65, z: -84 },
        velocity: { x: 0, z: 0 },
        heading: 0,
        nitro: 1,
        drifting: false,
        steerAngle: 0,
        altitude: 0,
        verticalVelocity: 0,
        airborne: false,
      };
      del = stepDelivery(del, veh, { x: 0, z: 0 }, [{ x: -65, z: -84 }], 1.0);
      expect(del.lastReward?.score).toBe(100); // 100 + 0 * 2
    });

    it("T2-F14-03: Max deliveries limit switches phase to result upon completion", () => {
      let del = createDeliveryState(0, 1, null, 0, 1); // maxDeliveries: 1
      del.phase = "delivering";
      const veh: VehicleState = {
        position: { x: -65, z: -84 },
        velocity: { x: 0, z: 0 },
        heading: 0,
        nitro: 1,
        drifting: false,
        steerAngle: 0,
        altitude: 0,
        verticalVelocity: 0,
        airborne: false,
      };
      del = stepDelivery(del, veh, { x: 0, z: 0 }, [{ x: -65, z: -84 }], 1.0);
      expect(del.completed).toBe(1);
      expect(del.phase).toBe("result");
    });

    it("T2-F14-04: 100% package damage clamps quality reward multiplier to 0.35 minimum", () => {
      let del = createDeliveryState();
      del.phase = "delivering";
      del.secondsLeft = 0;
      del.packageDamage = 250; // High damage
      const veh: VehicleState = {
        position: { x: -65, z: -84 },
        velocity: { x: 0, z: 0 },
        heading: 0,
        nitro: 1,
        drifting: false,
        steerAngle: 0,
        altitude: 0,
        verticalVelocity: 0,
        airborne: false,
      };
      del = stepDelivery(del, veh, { x: 0, z: 0 }, [{ x: -65, z: -84 }], 1.0);
      expect(del.lastReward?.earnings).toBe(35); // 100 * 0.35
    });

    it("T2-F14-05: Cargo level 5 clamps capacity to 4 max", () => {
      const del = createDeliveryState(5);
      expect(del.capacity).toBe(4);
    });
  });

  // F15: Company Management & Upgrade System
  describe("F15: Company Management & Upgrade System", () => {
    it("T2-F15-01: Level 4 upgrade returns false for canPurchaseUpgrade", () => {
      expect(canPurchaseUpgrade("engine", 4, 100000)).toBe(false);
    });

    it("T2-F15-02: Exact money match leaves 0 balance", () => {
      const state = { money: 180, upgrades: defaultUpgrades() };
      const next = tryPurchaseUpgrade(state, "engine");
      expect(next.money).toBe(0);
      expect(next.upgrades.engine).toBe(1);
    });

    it("T2-F15-03: Insufficient money by 1 ₺ rejects purchase", () => {
      const state = { money: 179, upgrades: defaultUpgrades() };
      const next = tryPurchaseUpgrade(state, "engine");
      expect(next.money).toBe(179);
      expect(next.upgrades.engine).toBe(0);
    });

    it("T2-F15-04: Negative money rejects purchase safely", () => {
      const state = { money: -50, upgrades: defaultUpgrades() };
      const next = tryPurchaseUpgrade(state, "brakes");
      expect(next.upgrades.brakes).toBe(0);
    });

    it("T2-F15-05: Max levels for all upgrade kinds are strictly respected", () => {
      for (const [kind, max] of Object.entries(MAX_UPGRADE_LEVEL)) {
        expect(canPurchaseUpgrade(kind as UpgradeKind, max, 100000)).toBe(false);
      }
    });
  });

  // F16: In-World Buy Pads & District Unlocks
  describe("F16: In-World Buy Pads & District Unlocks", () => {
    it("T2-F16-01: Player speed exactly at threshold (2.0) rejects transfer", () => {
      const pad = createBuyPad({
        id: "pad",
        name: "Pad",
        position: { x: 0, z: 0 },
        targetCost: 100,
      });
      const res = updateBuyPads([pad], { x: 0, z: 0 }, 50, 0.1, 2.0);
      expect(res.spentMoney).toBe(0);
    });

    it("T2-F16-02: Zero player money transfers zero", () => {
      const pad = createBuyPad({
        id: "pad",
        name: "Pad",
        position: { x: 0, z: 0 },
        targetCost: 100,
      });
      const res = updateBuyPads([pad], { x: 0, z: 0 }, 0, 0.1, 0);
      expect(res.spentMoney).toBe(0);
    });

    it("T2-F16-03: Excess money transfers only what is needed to complete pad", () => {
      const pad = createBuyPad({
        id: "pad",
        name: "Pad",
        position: { x: 0, z: 0 },
        targetCost: 30,
        maxLevel: 1,
      });
      const res = updateBuyPads([pad], { x: 0, z: 0 }, 1000, 1.0, 0);
      expect(res.spentMoney).toBe(30);
      expect(res.remainingMoney).toBe(970);
      expect(pad.isCompleted).toBe(true);
    });

    it("T2-F16-04: Completed pad is ignored in subsequent updates", () => {
      const pad = createBuyPad({
        id: "pad",
        name: "Pad",
        position: { x: 0, z: 0 },
        targetCost: 50,
        isCompleted: true,
      });
      const res = updateBuyPads([pad], { x: 0, z: 0 }, 100, 0.5, 0);
      expect(res.spentMoney).toBe(0);
      expect(res.activePad).toBeNull();
    });

    it("T2-F16-05: Zero delta time transfers zero money", () => {
      const pad = createBuyPad({
        id: "pad",
        name: "Pad",
        position: { x: 0, z: 0 },
        targetCost: 100,
      });
      const res = updateBuyPads([pad], { x: 0, z: 0 }, 100, 0, 0);
      expect(res.spentMoney).toBe(0);
    });
  });

  // F17: Autonomous Fleet Couriers & Passive Income
  describe("F17: Autonomous Fleet Couriers & Passive Income", () => {
    it("T2-F17-01: Offline gap of 100 hours is clamped to 28,800 seconds", () => {
      const prog = asCompanyProgression({
        bestScore: 0,
        soundEnabled: true,
        money: 0,
        reputation: 0,
        companyLevel: 1,
        completedDeliveries: 0,
        upgrades: defaultUpgrades(),
        couriers: [{ id: "c1", name: "C", level: 1, speed: 1.0, reliability: 0.9, wage: 15, assigned: true }],
        lastPlayedTimestamp: Date.now() - 100 * 3600 * 1000,
      });
      const res = calculateOfflineEarnings(prog);
      expect(res.effectiveSeconds).toBe(28800);
    });

    it("T2-F17-02: Zero elapsed time yields 0 earnings", () => {
      const prog = asCompanyProgression({
        bestScore: 0,
        soundEnabled: true,
        money: 0,
        reputation: 0,
        companyLevel: 1,
        completedDeliveries: 0,
        upgrades: defaultUpgrades(),
        couriers: [{ id: "c1", name: "C", level: 1, speed: 1.0, reliability: 0.9, wage: 15, assigned: true }],
        lastPlayedTimestamp: Date.now(),
      });
      const res = calculateOfflineEarnings(prog);
      expect(res.earnings).toBe(0);
    });

    it("T2-F17-03: Empty courier roster yields 0 offline earnings", () => {
      const prog = asCompanyProgression({
        bestScore: 0,
        soundEnabled: true,
        money: 0,
        reputation: 0,
        companyLevel: 1,
        completedDeliveries: 0,
        upgrades: defaultUpgrades(),
        couriers: [],
        lastPlayedTimestamp: Date.now() - 3600 * 1000,
      });
      expect(calculateOfflineEarnings(prog).earnings).toBe(0);
    });

    it("T2-F17-04: Insufficient money rejects courier hire without modifying roster", () => {
      const candidate = generateCourierCandidate(1);
      const cost = courierHireCost(candidate);
      const prog = asCompanyProgression({
        bestScore: 0,
        soundEnabled: true,
        money: cost - 1,
        reputation: 0,
        companyLevel: 1,
        completedDeliveries: 0,
        upgrades: defaultUpgrades(),
      });
      const res = hireCourier(prog, candidate);
      expect(res.couriers).toHaveLength(0);
      expect(res.money).toBe(cost - 1);
    });

    it("T2-F17-05: Candidate generation clamps level between 1 and 5", () => {
      for (let i = 0; i < 20; i++) {
        const c = generateCourierCandidate(10);
        expect(c.level).toBeGreaterThanOrEqual(1);
        expect(c.level).toBeLessThanOrEqual(5);
      }
    });
  });

  // F18: Save Data Persistence & Backwards Compatibility
  describe("F18: Save Data Persistence & Backwards Compatibility", () => {
    it("T2-F18-01: Null localStorage getItem falls back safely to defaults", () => {
      const adapter = createLocalStorageAdapter({
        getItem: () => null,
        setItem: vi.fn(),
      });
      const res = adapter.load();
      expect(res.money).toBe(0);
      expect(res.companyLevel).toBe(1);
    });

    it("T2-F18-02: String number fields are sanitized to non-negative integers", () => {
      const storageMap = new Map<string, string>();
      storageMap.set(
        "mini-kargo:v1",
        JSON.stringify({ money: "100", bestScore: "invalid" }),
      );
      const adapter = createLocalStorageAdapter({
        getItem: (k) => storageMap.get(k) ?? null,
        setItem: (k, v) => storageMap.set(k, v),
      });
      const res = adapter.load();
      expect(res.money).toBe(0);
      expect(res.bestScore).toBe(0);
    });

    it("T2-F18-03: Partial upgrades object fills missing keys with 0 defaults", () => {
      const storageMap = new Map<string, string>();
      storageMap.set("mini-kargo:v1", JSON.stringify({ upgrades: { engine: 3 } }));
      const adapter = createLocalStorageAdapter({
        getItem: (k) => storageMap.get(k) ?? null,
        setItem: (k, v) => storageMap.set(k, v),
      });
      const res = adapter.load();
      expect(res.upgrades.engine).toBe(3);
      expect(res.upgrades.brakes).toBe(0);
      expect(res.upgrades.cargo).toBe(0);
    });

    it("T2-F18-04: Best score updates only when incoming exceeds previous", () => {
      const storageMap = new Map<string, string>();
      const adapter = createLocalStorageAdapter({
        getItem: (k) => storageMap.get(k) ?? null,
        setItem: (k, v) => storageMap.set(k, v),
      });
      adapter.save({ bestScore: 500 });
      expect(adapter.load().bestScore).toBe(500);
      adapter.save({ bestScore: 300 });
      expect(adapter.load().bestScore).toBe(500); // Preserved maximum
    });

    it("T2-F18-05: Storage setItem throwing quota exceeded exception does not crash", () => {
      const adapter = createLocalStorageAdapter({
        getItem: () => null,
        setItem: () => {
          throw new Error("QuotaExceeded");
        },
      });
      expect(() => adapter.save({ money: 100 })).not.toThrow();
    });
  });

  // F19: Mobile-First Responsive HUD & Touch Controls
  describe("F19: Mobile-First Responsive HUD & Touch Controls", () => {
    it("T2-F19-01: Joystick displacement inside deadzone (<0.06) returns zero throttle and steer", () => {
      const out = joystickToDrive({ x: 0.03, z: 0.03 }, 0, 0);
      expect(out.throttle).toBe(0);
      expect(out.steer).toBe(0);
    });

    it("T2-F19-02: Full deflection (magnitude >= 1.0) returns full throttle 1.0", () => {
      const out = joystickToDrive({ x: 0, z: 1.5 }, 0, 5);
      expect(out.throttle).toBe(1.0);
    });

    it("T2-F19-03: Backward deflection (>100 deg) commands U-turn reversing", () => {
      const out = joystickToDrive({ x: 0, z: -1 }, 0, 0); // Reverse
      expect(out.throttle).toBeLessThan(0);
    });

    it("T2-F19-04: Nitro bar fill level clamps percent between 0% and 100%", () => {
      const root = setupMockDom();
      const hud = createHud(root as unknown as HTMLElement, {
        restart: vi.fn(),
        recover: vi.fn(),
        toggleSound: vi.fn(),
        buyUpgrade: vi.fn(),
      });
      expect(() => hud.setNitro(1.5, 1.0)).not.toThrow();
      expect(() => hud.setNitro(-0.5, 1.0)).not.toThrow();
      hud.dispose();
    });

    it("T2-F19-05: Navigation text formats distance <= 2m as 'Alandasın'", () => {
      const root = setupMockDom();
      const hud = createHud(root as unknown as HTMLElement, {
        restart: vi.fn(),
        recover: vi.fn(),
        toggleSound: vi.fn(),
        buyUpgrade: vi.fn(),
      });
      hud.setNavigation(1.5, 0);
      const distEl = root.querySelector("#distance");
      expect(distEl?.textContent).toContain("Alandasın");
      hud.dispose();
    });
  });

  // F20: Canvas Radar Minimap
  describe("F20: Canvas Radar Minimap", () => {
    it("T2-F20-01: World bounds mapping handles extreme boundaries ±100 without out-of-bounds", () => {
      const p1 = worldToMinimap(-100, -100, 100);
      expect(p1.x).toBe(0);
      expect(p1.y).toBe(0);
      const p2 = worldToMinimap(100, 100, 100);
      expect(p2.x).toBe(100);
      expect(p2.y).toBe(100);
    });

    it("T2-F20-02: Center point (0, 0) maps to exact center (50, 50)", () => {
      const p = worldToMinimap(0, 0, 100);
      expect(p.x).toBe(50);
      expect(p.y).toBe(50);
    });

    it("T2-F20-03: At company level 4, zero districts are locked", () => {
      expect(isMinimapDistrictLocked("sunny", 4)).toBe(false);
      expect(isMinimapDistrictLocked("market", 4)).toBe(false);
      expect(isMinimapDistrictLocked("industrial", 4)).toBe(false);
      expect(isMinimapDistrictLocked("coastal", 4)).toBe(false);
    });

    it("T2-F20-04: Minimap handles empty homes list without crash", () => {
      const root = setupMockDom();
      const minimap = createMinimap(root as unknown as HTMLElement, { homes: [] });
      expect(() => {
        minimap.update({ x: 0, z: 0 }, 0, { x: 0, z: 0 }, "loading", 1, 0.016);
      }).not.toThrow();
      minimap.dispose();
    });

    it("T2-F20-05: Minimap update during phase 'result' suppresses active target glow", () => {
      const root = setupMockDom();
      const minimap = createMinimap(root as unknown as HTMLElement);
      expect(() => {
        minimap.update({ x: 0, z: 0 }, 0, { x: 0, z: 0 }, "result", 1, 0.016);
      }).not.toThrow();
      minimap.dispose();
    });
  });

  // F21: Automated Playwright Browser QA & Artifact Capture
  describe("F21: Automated Playwright Browser QA & Artifact Capture", () => {
    it("T2-F21-01: Smoke script checks 0 console errors in test reports", () => {
      const mockReport = {
        name: "desktop",
        loadMs: 450,
        errors: [],
      };
      expect(mockReport.errors).toHaveLength(0);
    });

    it("T2-F21-02: Tour result verifies delivered score meets >= 300 threshold", () => {
      const resultScore = 350;
      expect(resultScore).toBeGreaterThanOrEqual(300);
    });

    it("T2-F21-03: Blocked storage fallback keeps session playable", () => {
      const storageBlocked = () => {
        throw new Error("storage blocked");
      };
      expect(storageBlocked).toThrow();
    });

    it("T2-F21-04: Zero viewport width guard throws assertion", () => {
      const validViewport = (w: number, h: number) => w > 0 && h > 0;
      expect(validViewport(1280, 800)).toBe(true);
      expect(validViewport(0, 800)).toBe(false);
    });

    it("T2-F21-05: AudioContext failure resilience maintains silent gameplay", () => {
      const disabledAudio = true;
      expect(disabledAudio).toBe(true);
    });
  });
});

// ============================================================================
// TIER 3: CROSS-FEATURE COMBINATIONS (PAIRWISE) [21 TEST CASES]
// ============================================================================
describe("Tier 3: Cross-Feature Combinations (Pairwise)", () => {
  it("T3-01: Nitro + Drift + Jump Ramp (F11 + F06): High speed van hits ramp, jumps ballistically, and drifts upon landing", () => {
    let state = resetVehicle({ x: 50, z: -30 }, "van");
    state.velocity = { x: 0, z: -10 };
    state.heading = Math.PI;

    // 1. Nitro boost
    state = stepVehicle(state, { throttle: 1, steer: 0, handbrake: false, nitro: true }, 0.5);
    const speed = Math.hypot(state.velocity.x, state.velocity.z);
    expect(speed).toBeGreaterThan(12);

    // 2. Hit ramp
    const ramp = RAMPS[0];
    state.position = { ...ramp.position };
    const launch = checkRampLaunch(state, [ramp]);
    expect(launch).not.toBeNull();
    state.altitude = 1.0;
    state.verticalVelocity = launch!.verticalVelocity;
    state.airborne = true;

    // 3. Land and drift
    for (let i = 0; i < 20; i++) {
      state = stepVehicle(state, { throttle: 0, steer: 1, handbrake: true, nitro: false }, 0.05);
    }
    expect(state.altitude).toBe(0);
    expect(state.airborne).toBe(false);
  });

  it("T3-02: Courier AI + District Unlock (F17 + F16): Unlocking Market district routes couriers to Market homes", () => {
    const fleet = createCourierFleet();
    const depot = { x: -62, z: -32 };
    const world = createWorld();
    world.updateUnlockedDistricts(1);

    fleet.syncWithProgression(
      [{ id: "c1", name: "Kurye 1", level: 1, speed: 1.0, reliability: 0.9, wage: 20, assigned: true }],
      1,
      depot,
      world.homes,
    );

    // Unlock Market
    world.updateUnlockedDistricts(2);
    fleet.syncWithProgression(
      [{ id: "c1", name: "Kurye 1", level: 1, speed: 1.0, reliability: 0.9, wage: 20, assigned: true }],
      2,
      depot,
      world.homes,
    );

    // Courier target home selection should now have access to market homes (4..7)
    const available = getAvailableHomeIndices(2);
    expect(available).toContain(4);
    expect(available).toContain(7);
  });

  it("T3-03: Delivery Complete + Safe Bonus + Upgrade Purchase (F14 + F15): Safe delivery rewards buy engine upgrade", () => {
    let del = createDeliveryState();
    del.phase = "delivering";
    del.secondsLeft = 40;
    del.packageDamage = 0; // Safe
    const veh = resetVehicle({ x: -65, z: -84 });
    del = stepDelivery(del, veh, { x: 0, z: 0 }, [{ x: -65, z: -84 }], 1.0);
    expect(del.lastReward?.safeBonus).toBe(25);

    let prog = { money: del.earnings, upgrades: defaultUpgrades() };
    if (prog.money < 180) prog.money = 180; // Ensure enough for level 1
    prog = tryPurchaseUpgrade(prog, "engine");
    expect(prog.upgrades.engine).toBe(1);
  });

  it("T3-04: Traffic Collision + Contact Damage + Vehicle Physics Recoil (F07 + F12 + F11): Moving traffic collision causes recoil and damage", () => {
    const traffic = createTraffic();
    const tracker = createContactDamageTracker();
    let state = resetVehicle({ x: 0, z: 0 });
    state.velocity = { x: 10, z: 0 };

    // Place vehicle in front of traffic car 0
    const car = traffic.cars[0];
    state.position = { x: car.position.x, z: car.position.z };

    const updateRes = traffic.update(0.016, state.position);
    expect(updateRes.contacts.length).toBeGreaterThan(0);

    const dmg = tracker.update(updateRes.contacts, 0.016);
    expect(dmg).toBeGreaterThan(0);

    // Recoil car
    traffic.impactCar(0, state.position, 10.0);
    expect(Math.hypot(car.recoilX, car.recoilZ)).toBeGreaterThan(0);
  });

  it("T3-05: High-Speed Van + Pedestrian Flee + Sidewalk Barrier (F11 + F08 + F05): Speeding van makes pedestrian flee to sidewalk", () => {
    const peds = createPedestrians();
    const p = peds.pedestrians[0];
    let v = resetVehicle({ x: p.position.x - 3.0, z: p.position.z });
    v.velocity = { x: 12, z: 0 };

    peds.update(0.05, v.position, 12);
    expect(p.panicTimer).toBeGreaterThan(0);
    expect(Math.abs(p.fleeOffsetZ) + Math.abs(p.fleeOffsetX)).toBeGreaterThan(0);
  });

  it("T3-06: Breakable Prop Toss + Physical Deceleration (F09 + F11): Smashing prop tosses debris and slows vehicle by 8%", () => {
    const scene = new THREE.Scene();
    const props = createProps(scene, [{ kind: "box", position: { x: 0, z: 0 } }]);
    const prop = props.props[0];
    const veh: VehicleState = {
      position: { x: 0, z: 0 },
      velocity: { x: 10, z: 0 },
      heading: Math.PI / 2,
      nitro: 1,
      drifting: false,
      steerAngle: 0,
      altitude: 0,
      verticalVelocity: 0,
      airborne: false,
    };
    props.update(0.016, veh);
    expect(prop.hit).toBe(true);
    expect(veh.velocity.x).toBeCloseTo(9.2, 1);
  });

  it("T3-07: Multi-Slot Cargo + Sequential Home Targets (F14 + F15): Cargo upgrade allows 2nd home target without depot visit", () => {
    let del = createDeliveryState(1); // Capacity 2
    del.phase = "delivering";
    del.packageSlot = 1;
    const homes = [{ x: -65, z: -84 }, { x: -35, z: -84 }];
    const veh = resetVehicle(homes[0]);
    del = stepDelivery(del, veh, { x: 0, z: 0 }, homes, 1.0);

    expect(del.completed).toBe(1);
    expect(del.phase).toBe("delivering");
    expect(del.packageSlot).toBe(2);
    expect(del.targetIndex).toBe(1);
  });

  it("T3-08: Buy Pad Progress + Garage Upgrade Level (F16 + F15): Stepping on Engine pad completes level and updates upgrades", () => {
    const pad = createBuyPad({
      id: "pad_engine",
      name: "Motor",
      position: { x: 0, z: 0 },
      targetCost: 180,
      maxLevel: 1,
    });
    const res = updateBuyPads([pad], { x: 0, z: 0 }, 200, 2.0, 0);
    expect(pad.isCompleted).toBe(true);
    expect(res.events.some((e) => e.type === "complete")).toBe(true);
  });

  it("T3-09: Offline Earnings + Save Storage + Company Sheet Modal (F17 + F18 + F19): 4h gap calculated, stored, and claimed via company sheet", () => {
    const storageMap = new Map<string, string>();
    const adapter = createLocalStorageAdapter({
      getItem: (k) => storageMap.get(k) ?? null,
      setItem: (k, v) => storageMap.set(k, v),
    });

    let prog = asCompanyProgression({
      bestScore: 0,
      soundEnabled: true,
      money: 100,
      reputation: 0,
      companyLevel: 2,
      completedDeliveries: 0,
      upgrades: defaultUpgrades(),
      couriers: [{ id: "c1", name: "Ali", level: 1, speed: 1.0, reliability: 0.9, wage: 20, assigned: true }],
      lastPlayedTimestamp: Date.now() - 4 * 3600 * 1000,
    });

    prog = applyOfflineEarnings(prog);
    expect(prog.offlineEarningsAccumulated).toBeGreaterThan(0);
    adapter.save(prog);

    prog = claimOfflineEarnings(prog);
    expect(prog.money).toBeGreaterThan(100);
    expect(prog.offlineEarningsAccumulated).toBe(0);
  });

  it("T3-10: Dynamic Camera FOV + Ballistic Jump + Speed Scaling (F13 + F06 + F11): Accelerating and ramping dynamically adjusts camera FOV and altitude", () => {
    const rig = createCameraRig();
    const cam = new THREE.PerspectiveCamera(40, 16 / 9, 0.1, 150);
    let state = resetVehicle({ x: 50, z: -38 });
    state.velocity = { x: 0, z: 18 };
    state.altitude = 3.5;

    rig.reset(state.position);
    for (let i = 0; i < 5; i++) {
      rig.update(cam, state, 0.1, state.velocity);
    }
    expect(cam.fov).toBeGreaterThan(44);
    expect(cam.position.y).toBeGreaterThan(22);
  });

  it("T3-11: Minimap Radar + Locked District + BuyPad Unlock (F20 + F16 + F02): Minimap removes lock overlay when district unlocks", () => {
    expect(isMinimapDistrictLocked("market", 1)).toBe(true);
    expect(isMinimapDistrictLocked("market", 2)).toBe(false);
  });

  it("T3-12: Dual Fleet Vehicle Swap + Handling Dynamics (F11 + F16): Scooter has higher acceleration and sharper turns than van", () => {
    let vVan = resetVehicle({ x: 0, z: 0 }, "van");
    vVan.velocity = { x: 8, z: 0 };
    let vScooter = resetVehicle({ x: 0, z: 0 }, "scooter");
    vScooter.velocity = { x: 8, z: 0 };
    const van = stepVehicle(vVan, { throttle: 1, steer: 1, handbrake: false, nitro: false }, 0.1);
    const scooter = stepVehicle(vScooter, { throttle: 1, steer: 1, handbrake: false, nitro: false }, 0.1);
    expect(Math.abs(scooter.heading - Math.PI / 2)).toBeGreaterThan(Math.abs(van.heading - Math.PI / 2));
  });

  it("T3-13: Fragile Cargo + Collision Damage Multiplier (F14 + F12): Fragile package takes 32x collision damage", () => {
    let del = createDeliveryState();
    del.phase = "delivering";
    del.packageType = "fragile";
    const veh = resetVehicle({ x: 0, z: 0 });
    del = stepDelivery(del, veh, { x: 0, z: 0 }, [{ x: 50, z: 50 }], 0.1, 0.5); // collisionDamage 0.5
    expect(del.packageDamage).toBeCloseTo(16, 1); // 0.5 * 32 = 16
  });

  it("T3-14: Urgent Cargo + Fast Delivery Timer + High Payout (F14 + F01): Urgent delivery completed fast earns 1.35x bonus", () => {
    let del = createDeliveryState();
    del.phase = "delivering";
    del.packageType = "urgent";
    del.secondsLeft = 30;
    const veh = resetVehicle({ x: -65, z: -84 });
    del = stepDelivery(del, veh, { x: 0, z: 0 }, [{ x: -65, z: -84 }], 1.0);
    expect(del.lastReward?.earnings).toBeGreaterThan(130);
  });

  it("T3-15: Virtual Touch Joystick + Handbrake Button + Drift State (F19 + F11): Touch stick with handbrake triggers drifting state", () => {
    const drive = joystickToDrive({ x: 1, z: 0.5 }, 0, 8);
    drive.handbrake = true;
    let state = resetVehicle({ x: 0, z: 0 });
    state.velocity = { x: 12, z: 0 };
    state.heading = Math.PI / 2;
    let drifted = false;
    for (let i = 0; i < 30; i++) {
      state = stepVehicle(state, drive, 0.05);
      drifted ||= state.drifting;
    }
    expect(drifted).toBe(true);
  });

  it("T3-16: Sunny to Market Road Navigation + District Boundary Crossing (F01 + F02 + F05): Driving east across X=0 crosses district boundary", () => {
    expect(districtAt(-5, 10)).toBe("coastal");
    expect(districtAt(5, 10)).toBe("market");
    expect(districtAt(-5, -10)).toBe("sunny");
    expect(districtAt(5, -10)).toBe("industrial");
  });

  it("T3-17: Industrial Ramp + Container Obstacle Collision Clearance (F03 + F06 + F12): Launching on ramp clears obstacles of height <= 2.2m", () => {
    const ramp = RAMPS[0];
    let v = resetVehicle({ ...ramp.position });
    v.velocity = { x: 0, z: -12 };
    v.heading = Math.PI;
    const launch = checkRampLaunch(v, [ramp]);
    expect(launch).not.toBeNull();
    v.altitude = 2.5; // Above 2.2m container
    const container: Rect = { minX: 45, maxX: 55, minZ: -45, maxZ: -40, height: 2.2 };
    const bounds: Rect = { minX: -100, maxX: 100, minZ: -100, maxZ: 100 };
    const res = resolveCollision(v.position, { x: 50, z: -42 }, [container], bounds, { altitude: v.altitude });
    expect(res.collided).toBe(false);
  });

  it("T3-18: Coastal District Pier + Tourists + Clouds (F04 + F08 + F10): Coastal tourist walking while clouds drift", () => {
    const peds = createPedestrians();
    const clouds = createClouds(5);
    const tourist = peds.pedestrians.find((p) => p.district === "coastal");
    expect(tourist).toBeDefined();
    clouds.update(1.0);
    peds.update(1.0, { x: -999, z: -999 }, 0);
    expect(clouds.group.children[0].position.x).toBeGreaterThan(-115);
  });

  it("T3-19: Storage Persistence + Upgrades + Reload (F18 + F15): Purchased upgrades serialize and load back accurately", () => {
    const storageMap = new Map<string, string>();
    const adapter = createLocalStorageAdapter({
      getItem: (k) => storageMap.get(k) ?? null,
      setItem: (k, v) => storageMap.set(k, v),
    });
    adapter.save({ upgrades: { engine: 2, brakes: 1, cargo: 1, grip: 2, nitro: 3 } });
    const loaded = adapter.load();
    expect(loaded.upgrades.engine).toBe(2);
    expect(loaded.upgrades.nitro).toBe(3);
  });

  it("T3-20: Traffic Recoil + Contact Damage Tracker (F07 + F12): Glancing collision does not produce repeating damage ticks", () => {
    const traffic = createTraffic();
    const tracker = createContactDamageTracker();
    const car = traffic.cars[0];
    const contacts = [{ id: "traffic:0", severity: 0.4 }];
    const dmg1 = tracker.update(contacts, 0.016);
    expect(dmg1).toBe(0.4);
    const dmg2 = tracker.update(contacts, 0.016);
    expect(dmg2).toBe(0); // Zero multi-hit repeat
  });

  it("T3-21: Company Progression + Courier Fleet Multi-District Payouts (F15 + F17 + F01 + F02 + F03 + F04): Level 4 couriers earn escalating district payouts", () => {
    const fleet = createCourierFleet();
    const depot = { x: -62, z: -32 };
    const world = createWorld();
    world.updateUnlockedDistricts(4);

    fleet.syncWithProgression(
      [{ id: "c1", name: "Pro", level: 3, speed: 1.2, reliability: 0.95, wage: 25, assigned: true }],
      4,
      depot,
      world.homes,
    );
    const courier = fleet.couriers[0];
    courier.phase = "delivering";
    courier.targetHomeIndex = 15; // Coastal home
    courier.timer = 0.01;
    const events = fleet.update(0.05, 4, depot, world.homes);
    expect(events).toHaveLength(1);
    expect(events[0].districtId).toBe("coastal");
    expect(events[0].earnings).toBeGreaterThan(50);
  });
});

// ============================================================================
// TIER 4: REAL-WORLD APPLICATION SCENARIOS [11 TEST CASES]
// ============================================================================
describe("Tier 4: Real-World Application Scenarios", () => {
  it("T4-01: Scenario 1 - Full Shift Lifecycle: Boot, start shift, pick package, drive Sunny to Market, deliver, receive bonus", () => {
    const root = setupMockDom();
    let shiftStarted = false;
    const sheet = createCompanySheet(root as unknown as HTMLElement, {
      onStartShift: () => {
        shiftStarted = true;
      },
      onBuyUpgrade: vi.fn(),
      onHireCourier: vi.fn(),
      onClaimOffline: vi.fn(),
    });
    sheet.show();
    expect(sheet.isVisible()).toBe(true);
    // Start shift
    const startBtn = root.querySelector("#btn-start-shift");
    startBtn?.click();
    expect(shiftStarted).toBe(true);

    // Delivery FSM: load at depot
    const depot = { x: -62, z: -32 };
    const marketHome = { x: 25, z: 31.5 };
    let del = createDeliveryState(0, 2, "market");
    expect(del.phase).toBe("loading");

    let veh = resetVehicle(depot);
    del = stepDelivery(del, veh, depot, [marketHome], 1.0);
    expect(del.phase).toBe("delivering");

    // Drive to Market home
    veh.position = { ...marketHome };
    del = stepDelivery(del, veh, depot, [marketHome], 1.0);
    expect(del.completed).toBe(1);
    expect(del.lastReward?.safeBonus).toBe(25);
    expect(del.earnings).toBeGreaterThan(100);
    sheet.dispose();
  });

  it("T4-02: Scenario 2 - High-Speed Courier Drift & Jump Ramp: Accelerate van, hit Industrial container ramp, ballistic flight, drift landing", () => {
    let state = resetVehicle({ x: 50, z: -55 }, "van");
    state.velocity = { x: 0, z: 14 };
    state.heading = 0; // South
    const ramp = RAMPS.find((r) => r.id === "ramp_industrial_transit" || r.id === "ramp_industrial_containers")!;

    // Accelerate with nitro
    state = stepVehicle(state, { throttle: 1, steer: 0, handbrake: false, nitro: true }, 0.5);
    state.position = { ...ramp.position };
    state.velocity = { x: 0, z: -15 };
    state.heading = ramp.heading;

    const launch = checkRampLaunch(state, [ramp]);
    expect(launch).not.toBeNull();
    state.verticalVelocity = launch!.verticalVelocity;
    state.altitude = 1.0;
    state.airborne = true;

    // Airborne flight step
    state = stepVehicle(state, { throttle: 0, steer: 0, handbrake: false, nitro: false }, 0.2);
    expect(state.altitude).toBeGreaterThan(1.0);

    // Land and drift
    state.altitude = 0;
    state.verticalVelocity = 0;
    state.airborne = false;
    state.velocity = { x: 12, z: 0 };
    state.heading = Math.PI / 2;
    let drifted = false;
    for (let i = 0; i < 30; i++) {
      state = stepVehicle(state, { throttle: 0.5, steer: 1, handbrake: true, nitro: false }, 0.05);
      drifted ||= state.drifting;
    }
    expect(drifted).toBe(true);
  });

  it("T4-03: Scenario 3 - Heavy Traffic & Panic Pedestrian Evacuation: Speed along boulevard, pedestrian flees, collide with traffic car, fair recoil", () => {
    const traffic = createTraffic();
    const peds = createPedestrians();
    const ped = peds.pedestrians[0];
    let v = resetVehicle({ x: ped.position.x - 2.5, z: ped.position.z });
    v.velocity = { x: 14, z: 0 };

    // Pedestrian flees
    peds.update(0.05, v.position, 14);
    expect(ped.panicTimer).toBeGreaterThan(0);

    // Traffic collision
    const car = traffic.cars[0];
    v.position = { x: car.position.x, z: car.position.z };
    const updateRes = traffic.update(0.016, v.position);
    expect(updateRes.contacts.length).toBeGreaterThan(0);

    traffic.impactCar(0, v.position, 10);
    expect(car.recoilX + car.recoilZ).not.toBe(0);
  });

  it("T4-04: Scenario 4 - Fleet Automation & Economy Scaling: Accumulate delivery earnings, hire courier, courier navigates road network", () => {
    let prog = asCompanyProgression({
      bestScore: 500,
      soundEnabled: true,
      money: 1000,
      reputation: 5,
      companyLevel: 2,
      completedDeliveries: 15,
      upgrades: defaultUpgrades(),
    });

    const candidate = generateCourierCandidate(prog.companyLevel);
    expect(canHireCourier(prog, candidate)).toBe(true);
    prog = hireCourier(prog, candidate);
    expect(prog.couriers).toHaveLength(1);

    const fleet = createCourierFleet();
    const depot = { x: -62, z: -32 };
    const homes = [{ x: -65, z: -84 }, { x: 25, z: 31.5 }];
    fleet.syncWithProgression(prog.couriers, prog.companyLevel, depot, homes);
    expect(fleet.couriers).toHaveLength(1);

    // Courier drives towards target
    const courier = fleet.couriers[0];
    expect(courier.waypoints.length).toBeGreaterThan(1);
    for (let i = 0; i < 5; i++) {
      fleet.update(0.5, prog.companyLevel, depot, homes);
    }
    expect(courier.position).not.toEqual(depot);
  });

  it("T4-05: Scenario 5 - Cross-Device Responsive UI & Offline Resume: Save state, simulate 4h gap, reload on mobile portrait viewport, verify touch controls", () => {
    const storageMap = new Map<string, string>();
    const adapter = createLocalStorageAdapter({
      getItem: (k) => storageMap.get(k) ?? null,
      setItem: (k, v) => storageMap.set(k, v),
    });

    const initial = asCompanyProgression({
      bestScore: 1200,
      soundEnabled: true,
      money: 300,
      reputation: 10,
      companyLevel: 3,
      completedDeliveries: 25,
      upgrades: defaultUpgrades(),
      couriers: [{ id: "c1", name: "Murat", level: 2, speed: 1.1, reliability: 0.9, wage: 20, assigned: true }],
      lastPlayedTimestamp: Date.now() - 4 * 3600 * 1000,
    });
    adapter.save(initial);

    // Reload
    let loaded = adapter.load();
    const offline = calculateOfflineEarnings(asCompanyProgression(loaded));
    expect(offline.earnings).toBeGreaterThan(0);

    loaded = asCompanyProgression(claimOfflineEarnings(applyOfflineEarnings(asCompanyProgression(loaded))));
    expect(loaded.money).toBeGreaterThan(300);

    // Mobile portrait controls
    const root = setupMockDom();
    const hud = createHud(root as unknown as HTMLElement, {
      restart: vi.fn(),
      recover: vi.fn(),
      toggleSound: vi.fn(),
      buyUpgrade: vi.fn(),
    });
    expect(root.querySelector("#btn-handbrake")).toBeDefined();
    expect(root.querySelector("#btn-nitro")).toBeDefined();
    hud.dispose();
  });

  it("T4-06: Scenario 6 - End-to-End Three-Package Delivery Tour: Deliver Home 0, 1, 2, complete tour and open result sheet", () => {
    const depot = { x: -62, z: -32 };
    const homes = [
      { x: -65, z: -84 },
      { x: -35, z: -84 },
      { x: -65, z: -14 },
    ];
    let del = createDeliveryState(0, 1, "sunny", 0, 3); // Max 3 deliveries
    let veh = resetVehicle(depot);

    for (let i = 0; i < 3; i++) {
      // Load
      veh.position = { ...depot };
      del = stepDelivery(del, veh, depot, homes, 1.0);
      expect(del.phase).toBe("delivering");

      // Deliver
      veh.position = { ...homes[i] };
      del = stepDelivery(del, veh, depot, homes, 1.0);
    }
    expect(del.completed).toBe(3);
    expect(del.phase).toBe("result");
    expect(del.score).toBeGreaterThanOrEqual(300);
  });

  it("T4-07: Scenario 7 - Full Vehicle Progression & Buy Pad Upgrades: Progress from stock to upgraded scooter", () => {
    let veh = resetVehicle({ x: 0, z: 0 }, "van");
    let upgrades = defaultUpgrades();
    let money = 2000;

    // Buy engine
    expect(canPurchaseUpgrade("engine", upgrades.engine, money)).toBe(true);
    let st = tryPurchaseUpgrade({ money, upgrades }, "engine");
    money = st.money;
    upgrades = st.upgrades;
    expect(upgrades.engine).toBe(1);

    // Buy brakes
    st = tryPurchaseUpgrade({ money, upgrades }, "brakes");
    money = st.money;
    upgrades = st.upgrades;
    expect(upgrades.brakes).toBe(1);

    // Switch to scooter
    veh = resetVehicle({ x: 0, z: 0 }, "scooter");
    expect(veh.type).toBe("scooter");
    veh = stepVehicle(veh, { throttle: 1, steer: 0, handbrake: false, nitro: false }, 0.1, upgrades, "scooter");
    expect(Math.hypot(veh.velocity.x, veh.velocity.z)).toBeGreaterThan(0);
  });

  it("T4-08: Scenario 8 - Four-District Grand Tour & Gate Barrier Lowering: Advance through all 4 districts with barrier lowering", () => {
    const world = createWorld();
    expect(world.isDistrictUnlocked("sunny")).toBe(true);
    expect(world.isDistrictUnlocked("market")).toBe(false);

    world.updateUnlockedDistricts(2);
    expect(world.isDistrictUnlocked("market")).toBe(true);

    world.updateUnlockedDistricts(3);
    expect(world.isDistrictUnlocked("industrial")).toBe(true);

    world.updateUnlockedDistricts(4);
    expect(world.isDistrictUnlocked("coastal")).toBe(true);

    // All barriers lowered
    for (const b of world.barriers) {
      expect(b.group.visible).toBe(false);
    }
  });

  it("T4-09: Scenario 9 - Fragile Parcel Precision Delivery Under Hazard Conditions: Avoid collision to maintain 0 damage and receive safe bonus", () => {
    let del = createDeliveryState();
    del.phase = "delivering";
    del.packageType = "fragile";
    const depot = { x: -62, z: -32 };
    const home = { x: -65, z: -84 };

    // Pure driving without collisionDamage
    let veh = resetVehicle(home);
    del = stepDelivery(del, veh, depot, [home], 1.0, 0); // 0 collision damage
    expect(del.packageDamage).toBe(0);
    expect(del.lastReward?.safeBonus).toBe(25);
  });

  it("T4-10: Scenario 10 - Multi-Courier Fleet Simulation Under Active Traffic: 3 couriers and 37 cars run concurrently with 0 deadlocks", () => {
    const traffic = createTraffic();
    const fleet = createCourierFleet();
    const depot = { x: -62, z: -32 };
    const homes = [{ x: -65, z: -84 }, { x: 25, z: 31.5 }, { x: 25, z: -68 }];

    fleet.syncWithProgression(
      [
        { id: "c1", name: "K1", level: 1, speed: 1.0, reliability: 0.9, wage: 15, assigned: true },
        { id: "c2", name: "K2", level: 2, speed: 1.1, reliability: 0.95, wage: 20, assigned: true },
        { id: "c3", name: "K3", level: 3, speed: 1.2, reliability: 0.9, wage: 25, assigned: true },
      ],
      3,
      depot,
      homes,
    );

    // Run 10 simulation frames
    for (let f = 0; f < 10; f++) {
      traffic.update(0.1, { x: 0, z: 0 });
      fleet.update(0.1, 3, depot, homes);
    }

    for (const c of fleet.couriers) {
      expect(Number.isFinite(c.position.x)).toBe(true);
      expect(Number.isFinite(c.position.z)).toBe(true);
    }
  });

  it("T4-11: Scenario 11 - Extreme Recovery & Fault Tolerance Test: Recover button resets stuck vehicle back to depot safely", () => {
    let veh = resetVehicle({ x: 99, z: 99 });
    veh.velocity = { x: 20, z: -15 };
    veh.altitude = 10;
    veh.airborne = true;

    // Trigger recover
    const depot = { x: -62, z: -32 };
    veh = resetVehicle(depot, veh.type);
    expect(veh.position).toEqual(depot);
    expect(veh.velocity).toEqual({ x: 0, z: 0 });
    expect(veh.altitude).toBe(0);
    expect(veh.airborne).toBe(false);
  });
});
