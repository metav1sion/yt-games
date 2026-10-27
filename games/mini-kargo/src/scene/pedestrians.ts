import * as THREE from "three";
import { box } from "./world";
import type { Vec2 } from "../game/types";
import type { DamageContact } from "../game/contact-damage";
import { districts, isDistrictUnlocked, type DistrictId } from "../game/districts";

type Pedestrian = {
  group: THREE.Group;
  position: Vec2;
  axis: "x" | "z";
  direction: 1 | -1;
  speed: number;
  min?: number;
  max?: number;
  limit?: number;
  district?: DistrictId;
  color?: string;
};

export const DISTRICT_PEDESTRIANS: Omit<Pedestrian, "group">[] = [
  // Çarşı Bölgesi: Dar kestirme sokakta ve dükkan önü kaldırımlarında gezen yayalar
  { district: "market", position: { x: 35.4, z: 22 }, axis: "z", direction: 1, speed: 0.82, min: 21, max: 37, color: "#d9534f" },
  { district: "market", position: { x: 18, z: 45.5 }, axis: "x", direction: 1, speed: 0.75, min: 12, max: 42, color: "#5bc0de" },
  { district: "market", position: { x: 54.5, z: 62 }, axis: "z", direction: -1, speed: 0.85, min: 58, max: 90, color: "#f0ad4e" },
  // Sahil Bölgesi: İskele ve sahil yolu üzerinde yürüyen tatilciler
  { district: "coastal", position: { x: -50, z: 88 }, axis: "z", direction: 1, speed: 0.7, min: 86, max: 97, color: "#5cb85c" },
  { district: "coastal", position: { x: -30, z: 83 }, axis: "x", direction: 1, speed: 0.85, min: -80, max: -20, color: "#9b59b6" },
];

export function createPedestrians() {
  const group = new THREE.Group();
  const pedestrians: Pedestrian[] = [
    { group: new THREE.Group(), position: { x: -18, z: -4.1 }, axis: "x", direction: 1, speed: 1.05, limit: 28 },
    { group: new THREE.Group(), position: { x: 14, z: 4.1 }, axis: "x", direction: -1, speed: 0.8, limit: 28 },
    { group: new THREE.Group(), position: { x: -4.1, z: -19 }, axis: "z", direction: 1, speed: 0.9, limit: 23 },
    { group: new THREE.Group(), position: { x: 4.1, z: 18 }, axis: "z", direction: -1, speed: 0.72, limit: 23 },
  ];

  for (const extra of DISTRICT_PEDESTRIANS) {
    pedestrians.push({ ...extra, position: { ...extra.position }, group: new THREE.Group() });
  }

  const defaultColors = ["#d66f5b", "#6d8fc0", "#d5a64f", "#8b6fa6"];
  pedestrians.forEach((pedestrian, index) => {
    const color = pedestrian.color ?? defaultColors[index % defaultColors.length];
    box(pedestrian.group, [0.28, 0.65, 0.28], [0, 0.72, 0], color);
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 10, 8),
      new THREE.MeshStandardMaterial({ color: "#e7b98e", roughness: 1 }),
    );
    head.position.y = 1.18;
    head.castShadow = true;
    pedestrian.group.add(head);
    pedestrian.group.position.set(pedestrian.position.x, 0, pedestrian.position.z);
    pedestrian.group.visible = !pedestrian.district;
    group.add(pedestrian.group);
  });

  let unlocked = new Set<DistrictId>(["sunny"]);

  return {
    group,
    setCompanyLevel(level: number, unlockedDistricts?: DistrictId[] | Set<DistrictId>) {
      unlocked = new Set(
        districts
          .filter((d) => isDistrictUnlocked(d.id, level, unlockedDistricts))
          .map((d) => d.id),
      );
      for (const ped of pedestrians) {
        ped.group.visible = !ped.district || unlocked.has(ped.district);
      }
    },
    update(dt: number, player: Vec2, playerSpeed: number) {
      const contacts: DamageContact[] = [];
      for (const [index, pedestrian] of pedestrians.entries()) {
        const active = !pedestrian.district || unlocked.has(pedestrian.district);
        if (!active) continue;

        pedestrian.position[pedestrian.axis] +=
          pedestrian.direction * pedestrian.speed * dt;

        if (pedestrian.limit !== undefined) {
          if (Math.abs(pedestrian.position[pedestrian.axis]) > pedestrian.limit) {
            pedestrian.direction = pedestrian.direction === 1 ? -1 : 1;
          }
        } else if (pedestrian.min !== undefined && pedestrian.max !== undefined) {
          if (pedestrian.direction > 0 && pedestrian.position[pedestrian.axis] > pedestrian.max) {
            pedestrian.direction = -1;
          } else if (pedestrian.direction < 0 && pedestrian.position[pedestrian.axis] < pedestrian.min) {
            pedestrian.direction = 1;
          }
        }

        pedestrian.group.position.set(
          pedestrian.position.x,
          0,
          pedestrian.position.z,
        );
        pedestrian.group.rotation.y =
          pedestrian.axis === "x"
            ? pedestrian.direction > 0 ? Math.PI / 2 : -Math.PI / 2
            : pedestrian.direction > 0 ? 0 : Math.PI;
        const distance = Math.hypot(
          player.x - pedestrian.position.x,
          player.z - pedestrian.position.z,
        );
        if (distance < 1.35 && playerSpeed > 3.5)
          contacts.push({ id: `pedestrian:${index}`, severity: (1 - distance / 1.35) * 0.45 });
      }
      return contacts;
    },
  };
}

