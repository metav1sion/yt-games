import { describe, it, expect } from "vitest";
import {
  createCourierFleet,
  buildCourierRoute,
  findNearestNode,
  ROAD_NODES,
} from "./fleet";
import type { Courier } from "../platform/storage";

const mockDepot = { x: -62, z: -32 };
const mockHomes = [
  { x: -65, z: -84 },
  { x: -35, z: -84 },
  { x: -65, z: -14 },
  { x: -35, z: -14 },
];

const testCourier: Courier = {
  id: "c1",
  name: "Burak Hızlı",
  level: 1,
  speed: 1.0,
  reliability: 0.9,
  wage: 20,
  assigned: true,
};

describe("Courier Fleet Logic", () => {
  it("finds the nearest road node correctly", () => {
    const node = findNearestNode({ x: -61, z: -31 });
    expect(node).toBe("depot_gate");
  });

  it("builds a valid route between depot and home", () => {
    const route = buildCourierRoute(mockDepot, mockHomes[0]);
    expect(route.length).toBeGreaterThanOrEqual(2);
    expect(route[0]).toEqual(mockDepot);
  });

  it("syncs couriers with company progression", () => {
    const fleet = createCourierFleet();
    expect(fleet.couriers).toHaveLength(0);

    fleet.syncWithProgression([testCourier], 1, mockDepot, mockHomes);
    expect(fleet.couriers).toHaveLength(1);
    expect(fleet.couriers[0].courier.name).toBe("Burak Hızlı");
  });

  it("advances courier through lifecycle and produces delivery event", () => {
    const deliveredEvents: any[] = [];
    const fleet = createCourierFleet({
      onDelivery(ev) {
        deliveredEvents.push(ev);
      },
    });

    fleet.syncWithProgression([testCourier], 1, mockDepot, mockHomes);
    const courier = fleet.couriers[0];

    // Simüle et: kuryeyi hedefe yakınlaştır
    courier.phase = "driving_to_target";
    courier.waypoints = [{ x: mockHomes[0].x, z: mockHomes[0].z }];
    courier.waypointIndex = 0;
    courier.position = { x: mockHomes[0].x - 0.5, z: mockHomes[0].z - 0.5 };

    // 1 adım at, hedefe varsın ve delivering aşamasına geçsin
    fleet.update(0.1, 1, mockDepot, mockHomes);
    expect(courier.phase).toBe("delivering");

    // Delivering süresi bitene kadar simüle et
    fleet.update(1.5, 1, mockDepot, mockHomes);
    expect(deliveredEvents.length).toBe(1);
    expect(deliveredEvents[0].courierName).toBe("Burak Hızlı");
    expect(deliveredEvents[0].earnings).toBeGreaterThan(0);
    expect(courier.phase).toBe("driving_to_depot");
  });
});
