import type { Vec2, VehicleState } from "./types";
export function stepVehicle(
  state: VehicleState,
  input: Vec2,
  dt: number,
): VehicleState {
  const amount = Math.min(1, Math.hypot(input.x, input.z));
  let heading = state.heading;
  if (amount > 0.06) {
    const target = Math.atan2(input.x, input.z);
    const difference = Math.atan2(
      Math.sin(target - heading),
      Math.cos(target - heading),
    );
    const speed = Math.hypot(state.velocity.x, state.velocity.z);
    const maxTurn = (3.8 - speed * 0.09) * dt;
    heading += Math.max(-maxTurn, Math.min(maxTurn, difference));
  }
  const desired = amount * 8;
  const follow = 1 - Math.exp(-(amount > 0.06 ? 3.2 : 5.2) * dt);
  const vx =
    state.velocity.x +
    (Math.sin(heading) * desired - state.velocity.x) * follow;
  const vz =
    state.velocity.z +
    (Math.cos(heading) * desired - state.velocity.z) * follow;
  return {
    heading,
    velocity: { x: vx, z: vz },
    position: { x: state.position.x + vx * dt, z: state.position.z + vz * dt },
  };
}
export function resetVehicle(depot: Vec2): VehicleState {
  return {
    position: { ...depot },
    velocity: { x: 0, z: 0 },
    heading: Math.PI / 2,
  };
}
