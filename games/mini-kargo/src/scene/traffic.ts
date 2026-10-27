import * as THREE from "three";
import { box } from "./world";
import type { Vec2 } from "../game/types";
import type { DamageContact } from "../game/contact-damage";
import { districts, isDistrictUnlocked, type DistrictId } from "../game/districts";

type TrafficCar = {
  group: THREE.Group;
  position: Vec2;
  axis: "x" | "z";
  direction: 1 | -1;
  speed: number;
  /** Dolaşım aralığı (hareket ekseni boyunca). Varsayılan -90..90. */
  min?: number;
  max?: number;
  /** Yalnızca bu bölge açıkken görünür ve temas eder. */
  district?: DistrictId;
  color?: string;
  size?: [number, number, number];
};

/**
 * Bölgeye özel trafik: Çarşı yavaş ve yoğun, Sanayi ağır/yavaş kamyonlar, Sahil hızlı ve seyrek.
 */
export const DISTRICT_TRAFFIC: Omit<TrafficCar, "group">[] = [
  { district: "market", position: { x: 20, z: 53.6 }, axis: "x", direction: 1, speed: 2.2, min: 12, max: 90, color: "#d98a3d" },
  { district: "market", position: { x: 80, z: 46.4 }, axis: "x", direction: -1, speed: 2.0, min: 12, max: 90, color: "#4a7fb0" },
  { district: "market", position: { x: 46.4, z: 20 }, axis: "z", direction: 1, speed: 2.1, min: 12, max: 90, color: "#c9576b" },
  { district: "market", position: { x: 53.6, z: 85 }, axis: "z", direction: -1, speed: 1.9, min: 12, max: 90, color: "#6aa86a" },
  { district: "industrial", position: { x: 20, z: -51.8 }, axis: "x", direction: 1, speed: 1.8, min: 12, max: 90, color: "#c05621", size: [1.5, 0.9, 3.2] },
  { district: "industrial", position: { x: 80, z: -48.2 }, axis: "x", direction: -1, speed: 1.7, min: 12, max: 90, color: "#2b6cb0", size: [1.5, 0.9, 3.2] },
  { district: "industrial", position: { x: 50, z: -85 }, axis: "z", direction: 1, speed: 1.9, min: -90, max: -12, color: "#718096", size: [1.5, 0.9, 3.2] },
  { district: "coastal", position: { x: -48.2, z: 20 }, axis: "z", direction: 1, speed: 3.8, min: 12, max: 80, color: "#38b2ac" },
  { district: "coastal", position: { x: -85, z: 51.8 }, axis: "x", direction: 1, speed: 3.4, min: -90, max: -12, color: "#ed64a6" },
];

export function createTraffic() {
  const group = new THREE.Group();
  const cars: TrafficCar[] = [
    { group: new THREE.Group(), position: { x: -55, z: -48.2 }, axis: "x", direction: 1, speed: 3.0, min: -90, max: -10 },
    { group: new THREE.Group(), position: { x: -25, z: -2.2 }, axis: "x", direction: -1, speed: 2.6, min: -90, max: 0 },
    { group: new THREE.Group(), position: { x: -2.2, z: -25 }, axis: "z", direction: -1, speed: 2.9, min: -90, max: 0 },
  ];
  for (const extra of DISTRICT_TRAFFIC) {
    cars.push({ ...extra, position: { ...extra.position }, group: new THREE.Group() });
  }
  cars.forEach((car, index) => {
    const color = car.color ?? ["#b85d4e", "#477b78", "#7d679b"][index];
    const [w, h, l] = car.size ?? [1.2, 0.55, 2.1];
    box(car.group, [w, h, l], [0, h, 0], color);
    box(car.group, [w * 0.83, h * 0.64, l * 0.38], [0, h + h * 0.7, l * 0.12], "#dce1c8");
    car.group.position.set(car.position.x, 0.08, car.position.z);
    car.group.visible = !car.district;
    group.add(car.group);
  });
  let unlocked = new Set<DistrictId>(["sunny"]);
  return {
    group,
    /** Şirket seviyesine veya açık bölgeler listesine göre bölge trafiğini açar. */
    setCompanyLevel(level: number, unlockedDistricts?: DistrictId[] | Set<DistrictId>) {
      unlocked = new Set(
        districts
          .filter((d) => isDistrictUnlocked(d.id, level, unlockedDistricts))
          .map((d) => d.id),
      );
      const hasMarket = unlocked.has("market");
      cars[1].max = hasMarket ? 90 : 0;
      cars[2].max = hasMarket ? 90 : 0;
      for (const car of cars) car.group.visible = !car.district || unlocked.has(car.district);
    },
    update(dt: number, player: Vec2) {
      const contacts: DamageContact[] = [];
      for (const [index, car] of cars.entries()) {
        const active = !car.district || unlocked.has(car.district);
        if (!active) continue;
        const min = car.min ?? -90, max = car.max ?? 90;
        car.position[car.axis] += car.direction * car.speed * dt;
        if (car.direction > 0 && car.position[car.axis] > max) car.position[car.axis] = min;
        if (car.direction < 0 && car.position[car.axis] < min) car.position[car.axis] = max;
        car.group.position.set(car.position.x, 0.08, car.position.z);
        car.group.rotation.y =
          car.axis === "x"
            ? (car.direction > 0 ? Math.PI / 2 : -Math.PI / 2)
            : car.direction > 0
              ? 0
              : Math.PI;
        const distance = Math.hypot(player.x - car.position.x, player.z - car.position.z);
        if (distance < 1.7)
          contacts.push({ id: `traffic:${index}`, severity: 1 - distance / 1.7 });
      }
      return contacts;
    },
  };
}
