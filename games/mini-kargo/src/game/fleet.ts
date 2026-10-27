import type { Vec2 } from "./types";
import type { Courier } from "../platform/storage";
import { getAvailableHomeIndices, getDistrictForHome, districts, type DistrictId } from "./districts";

export type CourierPhase =
  | "loading"
  | "driving_to_target"
  | "delivering"
  | "driving_to_depot";

export type ActiveCourierState = {
  courier: Courier;
  phase: CourierPhase;
  position: Vec2;
  heading: number; // Radyan cinsinden yön
  targetHomeIndex: number;
  waypoints: Vec2[];
  waypointIndex: number;
  timer: number;
  currentSpeed: number;
};

export type CourierDeliveryEvent = {
  courierId: string;
  courierName: string;
  homeIndex: number;
  districtId: string;
  earnings: number;
  reputation: number;
};

/**
 * Şehir içi yol düğümleri (NavMesh Waypoints).
 * Tüm kavşaklar ve ana sokak geçiş noktaları.
 */
export const ROAD_NODES: Record<string, Vec2> = {
  // Depo apronu & bağlantısı
  depot_gate: { x: -62, z: -32 },
  depot_spur: { x: -60, z: -30 },
  sunny_junc_depot: { x: -50, z: -30 },

  // Güneş Mahallesi kavşakları
  sunny_nw: { x: -80, z: -80 },
  sunny_n: { x: -50, z: -80 },
  sunny_ne: { x: -20, z: -80 },
  sunny_w: { x: -80, z: -50 },
  sunny_c: { x: -50, z: -50 },
  sunny_e: { x: -20, z: -50 },
  sunny_sw: { x: -80, z: -10 },
  sunny_s: { x: -50, z: -10 },
  sunny_se: { x: -20, z: -10 },

  // Ana Bulvar Kavşakları (Z = 0, X ekseni)
  boulevard_w: { x: -50, z: 0 },
  boulevard_c: { x: 0, z: 0 },
  boulevard_e: { x: 50, z: 0 },
  boulevard_far_e: { x: 80, z: 0 },

  // Kuzey Bulvarı (Z = -50)
  north_c: { x: 0, z: -50 },
  north_e: { x: 50, z: -50 },
  north_far_e: { x: 80, z: -50 },

  // Güney Bulvarı (Z = 50)
  south_w: { x: -50, z: 50 },
  south_c: { x: 0, z: 50 },
  south_e: { x: 50, z: 50 },
  south_far_e: { x: 80, z: 50 },

  // Sanayi Bölgesi Sokakları (Z = -66, Z = -16)
  ind_n_w: { x: 0, z: -66 },
  ind_n_c: { x: 50, z: -66 },
  ind_n_e: { x: 80, z: -66 },
  ind_s_w: { x: 0, z: -16 },
  ind_s_c: { x: 50, z: -16 },
  ind_s_e: { x: 80, z: -16 },

  // Çarşı Bölgesi Sokakları (Z = 34, Z = 84)
  mkt_n_w: { x: 0, z: 34 },
  mkt_n_c: { x: 50, z: 34 },
  mkt_n_e: { x: 80, z: 34 },
  mkt_s_w: { x: 0, z: 84 },
  mkt_s_c: { x: 50, z: 84 },
  mkt_s_e: { x: 80, z: 84 },

  // Sahil Bölgesi Sokakları (Z = 34, Z = 80, X < 0)
  cst_n_w: { x: -80, z: 34 },
  cst_n_e: { x: -50, z: 34 },
  cst_s_w: { x: -80, z: 80 },
  cst_s_e: { x: -50, z: 80 },
};

/** Yol düğümleri arasındaki iki yönlü bağlantılar */
export const ROAD_EDGES: [string, string][] = [
  // Depo yolu
  ["depot_gate", "depot_spur"],
  ["depot_spur", "sunny_junc_depot"],
  ["sunny_junc_depot", "sunny_c"],
  ["sunny_junc_depot", "sunny_s"],

  // Güneş Mahallesi içi
  ["sunny_nw", "sunny_n"],
  ["sunny_n", "sunny_ne"],
  ["sunny_w", "sunny_c"],
  ["sunny_c", "sunny_e"],
  ["sunny_sw", "sunny_s"],
  ["sunny_s", "sunny_se"],
  ["sunny_nw", "sunny_w"],
  ["sunny_w", "sunny_sw"],
  ["sunny_n", "sunny_c"],
  ["sunny_ne", "sunny_e"],
  ["sunny_e", "sunny_se"],

  // Güneş'ten Ana Bulvarlara bağlantı
  ["sunny_e", "north_c"],
  ["sunny_se", "boulevard_w"],
  ["sunny_s", "boulevard_w"],
  ["sunny_c", "north_c"],

  // Ana Bulvar Bağlantıları
  ["boulevard_w", "boulevard_c"],
  ["boulevard_c", "boulevard_e"],
  ["boulevard_e", "boulevard_far_e"],
  ["north_c", "north_e"],
  ["north_e", "north_far_e"],
  ["south_w", "south_c"],
  ["south_c", "south_e"],
  ["south_e", "south_far_e"],

  // Dikey Bulvar Bağlantıları (X = -50, X = 0, X = 50)
  ["sunny_c", "boulevard_w"],
  ["boulevard_w", "south_w"],
  ["north_c", "boulevard_c"],
  ["boulevard_c", "south_c"],
  ["north_e", "boulevard_e"],
  ["boulevard_e", "south_e"],

  // Sanayi Bağlantıları
  ["north_c", "ind_n_w"],
  ["north_e", "ind_n_c"],
  ["north_far_e", "ind_n_e"],
  ["ind_n_w", "ind_n_c"],
  ["ind_n_c", "ind_n_e"],
  ["boulevard_c", "ind_s_w"],
  ["boulevard_e", "ind_s_c"],
  ["boulevard_far_e", "ind_s_e"],
  ["ind_s_w", "ind_s_c"],
  ["ind_s_c", "ind_s_e"],
  ["ind_n_c", "north_e"],
  ["ind_s_c", "north_e"],

  // Çarşı Bağlantıları
  ["boulevard_c", "mkt_n_w"],
  ["boulevard_e", "mkt_n_c"],
  ["boulevard_far_e", "mkt_n_e"],
  ["mkt_n_w", "mkt_n_c"],
  ["mkt_n_c", "mkt_n_e"],
  ["south_c", "mkt_s_w"],
  ["south_e", "mkt_s_c"],
  ["south_far_e", "mkt_s_e"],
  ["mkt_s_w", "mkt_s_c"],
  ["mkt_s_c", "mkt_s_e"],
  ["mkt_n_c", "south_e"],
  ["mkt_s_c", "south_e"],

  // Sahil Bağlantıları
  ["boulevard_w", "cst_n_e"],
  ["cst_n_w", "cst_n_e"],
  ["south_w", "cst_s_e"],
  ["cst_s_w", "cst_s_e"],
  ["cst_n_w", "cst_s_w"],
  ["cst_n_e", "cst_s_e"],
];

// Yol komşuluk tablosu (Adjacency List)
const ROAD_ADJACENCY: Map<string, string[]> = new Map();
for (const [a, b] of ROAD_EDGES) {
  if (!ROAD_ADJACENCY.has(a)) ROAD_ADJACENCY.set(a, []);
  if (!ROAD_ADJACENCY.has(b)) ROAD_ADJACENCY.set(b, []);
  ROAD_ADJACENCY.get(a)!.push(b);
  ROAD_ADJACENCY.get(b)!.push(a);
}

/** En yakın yol düğümünü bulur */
export function findNearestNode(pt: Vec2): string {
  let bestKey = "depot_gate";
  let bestDistSq = Infinity;
  for (const [key, node] of Object.entries(ROAD_NODES)) {
    const dx = node.x - pt.x;
    const dz = node.z - pt.z;
    const distSq = dx * dx + dz * dz;
    if (distSq < bestDistSq) {
      bestDistSq = distSq;
      bestKey = key;
    }
  }
  return bestKey;
}

/**
 * İki düğüm arasında en kısa yol düğümlerini BFS ile bulur.
 */
export function findNodePath(startKey: string, endKey: string): Vec2[] {
  if (startKey === endKey) {
    return [{ ...ROAD_NODES[startKey] }];
  }

  const queue: string[] = [startKey];
  const cameFrom = new Map<string, string>();
  const visited = new Set<string>([startKey]);

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === endKey) break;

    const neighbors = ROAD_ADJACENCY.get(current) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        cameFrom.set(neighbor, current);
        queue.push(neighbor);
      }
    }
  }

  if (!cameFrom.has(endKey)) {
    // Doğrudan bağlantı bulunamazsa başlangıç ve bitişi döndür
    return [{ ...ROAD_NODES[startKey] }, { ...ROAD_NODES[endKey] }];
  }

  const pathKeys: string[] = [];
  let curr: string | undefined = endKey;
  while (curr) {
    pathKeys.unshift(curr);
    curr = cameFrom.get(curr);
  }

  return pathKeys.map((key) => ({ ...ROAD_NODES[key] }));
}

/**
 * Başlangıç ve bitiş noktası arasında yol ağını takip eden tam waypoint rotasını üretir.
 */
export function buildCourierRoute(from: Vec2, to: Vec2): Vec2[] {
  const startNode = findNearestNode(from);
  const endNode = findNearestNode(to);
  const intermediate = findNodePath(startNode, endNode);

  const route: Vec2[] = [{ ...from }];

  // Eğer başlangıç noktası ilk yol düğümüne çok yakın değilse düğümü rotaya ekle
  for (const pt of intermediate) {
    const last = route[route.length - 1];
    if (Math.hypot(pt.x - last.x, pt.z - last.z) > 1.5) {
      route.push(pt);
    }
  }

  // Son düğümden varış noktasına ekle
  const last = route[route.length - 1];
  if (Math.hypot(to.x - last.x, to.z - last.z) > 1.5) {
    route.push({ ...to });
  }

  return route;
}

export type CourierFleetOptions = {
  onDelivery?: (event: CourierDeliveryEvent) => void;
};

export type CourierFleet = {
  couriers: ActiveCourierState[];
  syncWithProgression(
    couriers: Courier[],
    companyLevel: number,
    depot: Vec2,
    homes: Vec2[],
    unlockedDistricts?: DistrictId[] | Set<DistrictId>,
  ): void;
  update(
    dt: number,
    companyLevel: number,
    depot: Vec2,
    homes: Vec2[],
    unlockedDistricts?: DistrictId[] | Set<DistrictId>,
  ): CourierDeliveryEvent[];
};

export function createCourierFleet(options: CourierFleetOptions = {}): CourierFleet {
  let activeCouriers: ActiveCourierState[] = [];

  function pickTargetHome(
    companyLevel: number,
    usedIndices: Set<number>,
    unlockedDistricts?: DistrictId[] | Set<DistrictId>,
  ): number {
    const available = getAvailableHomeIndices(companyLevel, unlockedDistricts);
    const unused = available.filter((idx) => !usedIndices.has(idx));
    const pool = unused.length > 0 ? unused : available;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function spawnCourier(
    courier: Courier,
    companyLevel: number,
    depot: Vec2,
    homes: Vec2[],
    indexOffset: number,
    unlockedDistricts?: DistrictId[] | Set<DistrictId>,
  ): ActiveCourierState {
    const targetIdx = pickTargetHome(companyLevel, new Set(), unlockedDistricts);
    const targetPos = homes[targetIdx] ?? { x: -35, z: -84 };
    const route = buildCourierRoute(depot, targetPos);

    // Kuryelerin hepsi aynı anda aynı noktada yığılmasın diye başlangıç ofseti
    const staggerPhase: CourierPhase =
      indexOffset % 2 === 0 ? "driving_to_target" : "loading";

    return {
      courier,
      phase: staggerPhase,
      position: { ...depot },
      heading: 0,
      targetHomeIndex: targetIdx,
      waypoints: route,
      waypointIndex: 0,
      timer: staggerPhase === "loading" ? 1.5 + (indexOffset * 0.8) : 0,
      currentSpeed: 0,
    };
  }

  return {
    get couriers() {
      return activeCouriers;
    },

    syncWithProgression(
      hiredCouriers: Courier[],
      companyLevel: number,
      depot: Vec2,
      homes: Vec2[],
      unlockedDistricts?: DistrictId[] | Set<DistrictId>,
    ) {
      const activeHired = (hiredCouriers || []).filter((c) => c.assigned !== false);
      const existingMap = new Map(activeCouriers.map((ac) => [ac.courier.id, ac]));

      const nextList: ActiveCourierState[] = [];
      activeHired.forEach((hired, idx) => {
        const existing = existingMap.get(hired.id);
        if (existing) {
          existing.courier = hired;
          nextList.push(existing);
        } else {
          nextList.push(
            spawnCourier(
              hired,
              companyLevel,
              depot,
              homes,
              idx,
              unlockedDistricts,
            ),
          );
        }
      });

      activeCouriers = nextList;
    },

    update(
      dt: number,
      companyLevel: number,
      depot: Vec2,
      homes: Vec2[],
      unlockedDistricts?: DistrictId[] | Set<DistrictId>,
    ): CourierDeliveryEvent[] {
      const events: CourierDeliveryEvent[] = [];
      const usedHomeIndices = new Set<number>(
        activeCouriers
          .filter((c) => c.phase === "driving_to_target")
          .map((c) => c.targetHomeIndex),
      );

      for (const ac of activeCouriers) {
        // Base hız: 11 birim/sn civarı (kurye speed katsayısı ile ölçekli)
        const targetSpeed = 10 * ac.courier.speed;

        switch (ac.phase) {
          case "loading": {
            ac.currentSpeed = 0;
            ac.timer -= dt;
            if (ac.timer <= 0) {
              // Paket yüklendi, yeni hedef seç ve yola çık
              ac.targetHomeIndex = pickTargetHome(
                companyLevel,
                usedHomeIndices,
                unlockedDistricts,
              );
              usedHomeIndices.add(ac.targetHomeIndex);
              const targetPos = homes[ac.targetHomeIndex] ?? depot;
              ac.waypoints = buildCourierRoute(ac.position, targetPos);
              ac.waypointIndex = 0;
              ac.phase = "driving_to_target";
            }
            break;
          }

          case "driving_to_target": {
            const reached = followWaypoints(ac, targetSpeed, dt);
            if (reached) {
              // Hedef eve ulaşıldı, teslimat başlat
              ac.phase = "delivering";
              ac.timer = 1.4; // 1.4 saniye teslimat süresi
            }
            break;
          }

          case "delivering": {
            ac.currentSpeed = 0;
            ac.timer -= dt;
            if (ac.timer <= 0) {
              // Teslimat tamamlandı! Kazancı hesapla
              const districtId = getDistrictForHome(ac.targetHomeIndex);
              const dist = districts.find((d) => d.id === districtId) ?? districts[0];
              const earnings = Math.round(
                (35 + ac.courier.level * 15) * dist.rewardMultiplier * ac.courier.reliability,
              );
              const event: CourierDeliveryEvent = {
                courierId: ac.courier.id,
                courierName: ac.courier.name,
                homeIndex: ac.targetHomeIndex,
                districtId,
                earnings,
                reputation: 1,
              };
              events.push(event);
              if (options.onDelivery) options.onDelivery(event);

              // Depoya dönüş rotasını çiz
              ac.waypoints = buildCourierRoute(ac.position, depot);
              ac.waypointIndex = 0;
              ac.phase = "driving_to_depot";
            }
            break;
          }

          case "driving_to_depot": {
            const reached = followWaypoints(ac, targetSpeed, dt);
            if (reached) {
              // Depoya varıldı, yüklemeye başla
              ac.phase = "loading";
              ac.timer = 2.0; // 2 sn yeni paket yükleme
            }
            break;
          }
        }
      }

      return events;
    },
  };
}

/**
 * Kuryeyi waypoint rotası boyunca yumuşak hızlanma ve yönlenme ile hareket ettirir.
 * Rota bittiğinde true döndürür.
 */
function followWaypoints(
  ac: ActiveCourierState,
  maxSpeed: number,
  dt: number,
): boolean {
  if (ac.waypointIndex >= ac.waypoints.length) {
    return true;
  }

  const target = ac.waypoints[ac.waypointIndex];
  const dx = target.x - ac.position.x;
  const dz = target.z - ac.position.z;
  const dist = Math.hypot(dx, dz);

  // Hedef waypoint'e varıldı mı?
  if (dist < 1.2) {
    ac.waypointIndex++;
    if (ac.waypointIndex >= ac.waypoints.length) {
      ac.currentSpeed = 0;
      return true;
    }
    return false;
  }

  // Yönü hedef noktaya doğru yumuşak çevir
  const desiredHeading = Math.atan2(dx, -dz);
  let headingDiff = desiredHeading - ac.heading;
  while (headingDiff > Math.PI) headingDiff -= 2 * Math.PI;
  while (headingDiff < -Math.PI) headingDiff += 2 * Math.PI;

  const turnSpeed = 5.5; // radyan/sn
  ac.heading += Math.max(-turnSpeed * dt, Math.min(turnSpeed * dt, headingDiff));

  // Hızlanma
  ac.currentSpeed = Math.min(maxSpeed, ac.currentSpeed + 15 * dt);

  // İlerleme
  const moveDist = ac.currentSpeed * dt;
  ac.position.x += Math.sin(ac.heading) * moveDist;
  ac.position.z -= Math.cos(ac.heading) * moveDist;

  return false;
}
