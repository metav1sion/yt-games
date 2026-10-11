import type { Vec2, VehicleState } from "./types";
import type { VehicleUpgrades } from "./upgrades";
export function stepVehicle(
  state: VehicleState,
  input: Vec2,
  dt: number,
  upgrades: VehicleUpgrades = { engine: 0, brakes: 0, cargo: 0 },
): VehicleState {
  const amount = Math.min(1, Math.hypot(input.x, input.z));
  let heading = state.heading;
  const speed = Math.hypot(state.velocity.x, state.velocity.z);
  if (amount > 0.06) {
    const target = Math.atan2(input.x, input.z);
    const difference = Math.atan2(
      Math.sin(target - heading),
      Math.cos(target - heading),
    );
    const maxTurn = (4.4 - Math.min(speed, 8) * 0.12) * dt;
    heading += Math.max(-maxTurn, Math.min(maxTurn, difference));
  }
  const maxSpeed = 8 + upgrades.engine * 0.7;
  const desired = amount * maxSpeed;
  const acceleration = 3.8 + upgrades.engine * 0.35;
  const braking = 4.8 + upgrades.brakes * 1.2;
  const follow = 1 - Math.exp(
    -(amount > 0.06 ? acceleration : braking) * dt,
  );
  const vx =
    state.velocity.x +
    (Math.sin(heading) * desired - state.velocity.x) * follow;
  const vz =
    state.velocity.z +
    (Math.cos(heading) * desired - state.velocity.z) * follow;
  return {
    heading,
    velocity: { x: vx, z: vz },
    position: {
      x: state.position.x + vx * dt,
      z: state.position.z + vz * dt,
    },
  };
}
export function resetVehicle(depot: Vec2): VehicleState {
  return {
    position: { ...depot },
    velocity: { x: 0, z: 0 },
    heading: Math.PI / 2,
  };
}
