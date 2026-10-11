import * as THREE from "three";
import { box } from "./world";
import type { Vec2 } from "../game/types";
import type { DamageContact } from "../game/contact-damage";

type Pedestrian = {
  group: THREE.Group;
  position: Vec2;
  axis: "x" | "z";
  direction: 1 | -1;
  speed: number;
  limit: number;
};

export function createPedestrians() {
  const group = new THREE.Group();
  const pedestrians: Pedestrian[] = [
    { group: new THREE.Group(), position: { x: -18, z: -4.1 }, axis: "x", direction: 1, speed: 1.05, limit: 28 },
    { group: new THREE.Group(), position: { x: 14, z: 4.1 }, axis: "x", direction: -1, speed: 0.8, limit: 28 },
    { group: new THREE.Group(), position: { x: -4.1, z: -19 }, axis: "z", direction: 1, speed: 0.9, limit: 23 },
    { group: new THREE.Group(), position: { x: 4.1, z: 18 }, axis: "z", direction: -1, speed: 0.72, limit: 23 },
  ];
  pedestrians.forEach((pedestrian, index) => {
    const colors = ["#d66f5b", "#6d8fc0", "#d5a64f", "#8b6fa6"];
    box(pedestrian.group, [0.28, 0.65, 0.28], [0, 0.72, 0], colors[index]);
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 10, 8),
      new THREE.MeshStandardMaterial({ color: "#e7b98e", roughness: 1 }),
    );
    head.position.y = 1.18;
    head.castShadow = true;
    pedestrian.group.add(head);
    pedestrian.group.position.set(pedestrian.position.x, 0, pedestrian.position.z);
    group.add(pedestrian.group);
  });
  return {
    group,
    update(dt: number, player: Vec2, playerSpeed: number) {
      const contacts: DamageContact[] = [];
      for (const [index, pedestrian] of pedestrians.entries()) {
        pedestrian.position[pedestrian.axis] +=
          pedestrian.direction * pedestrian.speed * dt;
        if (Math.abs(pedestrian.position[pedestrian.axis]) > pedestrian.limit) {
          pedestrian.direction = pedestrian.direction === 1 ? -1 : 1;
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
