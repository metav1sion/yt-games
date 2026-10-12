import type { Vec2, VehicleState } from "./types";

export type Ramp = {
  id?: string;
  name?: string;
  position: Vec2;
  size: Vec2; // [width across, length along ramp]
  heading: number; // direction of jump (radians)
  height: number;
  launchSpeed: number; // minimum speed to jump (units/sec)
  launchMultiplier?: number;
};

export type RampLaunchResult = {
  ramp: Ramp;
  verticalVelocity: number;
  launchSpeed: number;
};

const wrapAngle = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

/**
 * Şehirdeki stratejik atlama rampaları:
 * 1. Sanayi Konteyner Rampası: Konteynerlerin üzerinden atlar.
 * 2. Çarşı Kestirme Rampası: Dar sokaktan meydana uçar.
 * 3. Sahil Parkı Tepe Rampası: Sahil şeridine ve kumsala doğru havalanır.
 * 4. Güneş Kargo Depo Rampası: Depo arkasından ana bulvara atlar.
 * 5. Sanayi Yan Yol Rampası: Hangar bölgesinden transit yola bağlar.
 */
export const RAMPS: Ramp[] = [
  {
    id: "ramp_industrial_containers",
    name: "Sanayi Konteyner Rampası",
    position: { x: 50, z: -38 },
    size: { x: 5.2, z: 6.2 },
    heading: Math.PI, // Kuzeye (-Z) konteynerlere doğru bakar
    height: 2.2,
    launchSpeed: 8,
    launchMultiplier: 0.95,
  },
  {
    id: "ramp_market_shortcut",
    name: "Çarşı Kestirme Rampası",
    position: { x: 38, z: 38 },
    size: { x: 4.8, z: 5.6 },
    heading: (3 * Math.PI) / 4, // Güneydoğuya meydan tarafına bakar
    height: 1.8,
    launchSpeed: 8,
    launchMultiplier: 0.88,
  },
  {
    id: "ramp_coastal_hill",
    name: "Sahil Park Tepe Rampası",
    position: { x: -35, z: 28 },
    size: { x: 5.4, z: 6.4 },
    heading: 0, // Güneye (+Z) sahile doğru bakar
    height: 2.3,
    launchSpeed: 7.5,
    launchMultiplier: 0.92,
  },
  {
    id: "ramp_sunny_depot",
    name: "Güneş Depo Kestirme Rampası",
    position: { x: -40, z: -26 },
    size: { x: 4.8, z: 5.6 },
    heading: 0, // Güneye (+Z) ana bulvara doğru bakar
    height: 1.8,
    launchSpeed: 7.5,
    launchMultiplier: 0.86,
  },
  {
    id: "ramp_industrial_crosscut",
    name: "Sanayi Transit Rampası",
    position: { x: 18, z: -25 },
    size: { x: 4.8, z: 5.8 },
    heading: Math.PI / 2, // Doğuya (+X) doğru bakar
    height: 2.0,
    launchSpeed: 8,
    launchMultiplier: 0.9,
  },
];

/**
 * Araç rampanın üzerinde ve doğru yönde yeterli hızla (> launchSpeed) gidiyorsa
 * fırlatma hız vektörü hesaplar.
 */
export function checkRampLaunch(
  vehicle: VehicleState,
  ramps: readonly Ramp[] = RAMPS,
): RampLaunchResult | null {
  const currentAlt = vehicle.altitude ?? 0;

  for (const ramp of ramps) {
    // Araç halihazırda rampanın çok üstünde uçuyorsa tekrar tetiklenme
    if (currentAlt > ramp.height + 0.6) continue;

    const dx = vehicle.position.x - ramp.position.x;
    const dz = vehicle.position.z - ramp.position.z;

    const sinR = Math.sin(ramp.heading);
    const cosR = Math.cos(ramp.heading);

    // Rampanın yerel eksenine izdüşüm:
    // localZ: rampa yönü boyunca (+ ileri)
    // localX: rampa genişliği boyunca
    const localZ = dx * sinR + dz * cosR;
    const localX = dx * cosR - dz * sinR;

    const halfW = ramp.size.x / 2 + 0.35;
    const halfL = ramp.size.z / 2 + 0.55;

    if (Math.abs(localX) <= halfW && Math.abs(localZ) <= halfL) {
      // Araç rampanın fırlatma yönüyle kabaca aynı hizada olmalı (en fazla ±60°)
      const headingDiff = Math.abs(wrapAngle(vehicle.heading - ramp.heading));
      if (headingDiff <= Math.PI / 3) {
        // Rampa yönündeki ileri hız bileşeni
        const forwardVel = vehicle.velocity.x * sinR + vehicle.velocity.z * cosR;
        const speed = Math.hypot(vehicle.velocity.x, vehicle.velocity.z);

        if (forwardVel >= ramp.launchSpeed) {
          const multiplier = ramp.launchMultiplier ?? 0.88;
          const verticalVelocity = Math.max(
            vehicle.verticalVelocity ?? 0,
            speed * multiplier,
          );
          return {
            ramp,
            verticalVelocity,
            launchSpeed: speed,
          };
        }
      }
    }
  }

  return null;
}
