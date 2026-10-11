export type Vec2 = { x: number; z: number };
export type Rect = { minX: number; maxX: number; minZ: number; maxZ: number };
export type VehicleState = {
  position: Vec2;
  velocity: Vec2;
  heading: number;
  nitro: number;
  drifting: boolean;
  steerAngle: number;
  nitroLocked?: boolean;
};
export type DriveInput = {
  throttle: number;
  steer: number;
  handbrake: boolean;
  nitro: boolean;
};
