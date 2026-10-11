import * as THREE from "three";
import { box } from "./world";
import type { Vec2 } from "../game/types";

type TrafficCar = {
  group: THREE.Group;
  position: Vec2;
  axis: "x" | "z";
  direction: 1 | -1;
  speed: number;
};

export function createTraffic() {
  const group = new THREE.Group();
  const cars: TrafficCar[] = [
    { group: new THREE.Group(), position: { x: -25, z: -14 }, axis: "x", direction: 1, speed: 3.2 },
    { group: new THREE.Group(), position: { x: 25, z: 0 }, axis: "x", direction: -1, speed: 2.6 },
    { group: new THREE.Group(), position: { x: 0, z: 22 }, axis: "z", direction: -1, speed: 2.9 },
  ];
  cars.forEach((car, index) => {
    const color = ["#b85d4e", "#477b78", "#7d679b"][index];
    box(car.group, [1.2, 0.55, 2.1], [0, 0.55, 0], color);
    box(car.group, [1, 0.35, 0.8], [0, 0.95, 0.25], "#dce1c8");
    car.group.position.set(car.position.x, 0.08, car.position.z);
    group.add(car.group);
  });
  return {
    group,
    update(dt: number, player: Vec2) {
      let collision = 0;
      for (const car of cars) {
        car.position[car.axis] += car.direction * car.speed * dt;
        if (car.axis === "x" && Math.abs(car.position.x) > 30)
          car.position.x = -car.direction * 30;
        if (car.axis === "z" && Math.abs(car.position.z) > 25)
          car.position.z = -car.direction * 25;
        car.group.position.set(car.position.x, 0.08, car.position.z);
        car.group.rotation.y =
          car.axis === "x"
            ? (car.direction > 0 ? Math.PI / 2 : -Math.PI / 2)
            : car.direction > 0
              ? 0
              : Math.PI;
        if (Math.hypot(player.x - car.position.x, player.z - car.position.z) < 1.7)
          collision = Math.max(collision, 1 - Math.hypot(player.x - car.position.x, player.z - car.position.z) / 1.7);
      }
      return collision;
    },
  };
}
