import type { DriveInput, Vec2, VehicleState } from "./types";
import type { VehicleUpgrades } from "./upgrades";

/** Tüm sürüş sabitleri burada; birimler: birim, saniye, radyan. */
export const TUNING = {
  // İleri/geri hareket
  maxSpeed: 14, // normal maksimum ileri hız (birim/sn)
  accel: 18, // ivme; hız maxSpeed'e yaklaştıkça azalır (üstel eğri)
  brake: 24, // fren yavaşlaması (birim/sn²)
  reverseRatio: 0.4, // geri vites maksimum hızı / ileri maksimum hız
  reverseAccel: 10, // geri vites ivmesi
  coastDrag: 1.2, // gazsız hızla orantılı sürtünme (1/sn)
  coastDecel: 6, // gazsız sabit sürtünme (birim/sn²)
  stopSnap: 0.12, // bu hızın altında gazsız araç tamamen durur
  brakeZone: 0.3, // zıt yöne basınca "fren" sayılan hız eşiği
  // Yanal tutuş
  grip: 9, // normal yanal hız sönümü (1/sn)
  driftGrip: 1.2, // el freni basılıyken yanal sönüm
  highSpeedSlip: 0.45, // yüksek hızda sert direksiyonla grip kaybı oranı
  handbrakeDrag: 0.9, // el freni ileri hız kaybı (1/sn)
  driftThreshold: 4.5, // |yanal hız| bunu geçince drifting = true
  // Dönüş
  turnRate: 2.6, // en iyi hızdaki dönüş hızı (rad/sn)
  turnRiseSpeed: 4, // dönüşün tam açıldığı hız
  turnFalloffStart: 0.65, // yüksek hızda azalmanın başladığı maxSpeed oranı
  turnFalloff: 0.35, // maxSpeed'de kaybedilen dönüş oranı
  handbrakeTurnBoost: 1.3, // el freniyle dönüş çarpanı
  steerAngleMax: 0.45, // görsel ön teker açısı (rad)
  steerAngleFollow: 14, // görsel direksiyon takip hızı (1/sn)
  // Nitro
  nitroBoost: 1.45, // nitro açıkken maxSpeed ve accel çarpanı
  nitroDrain: 0.4, // basılıyken azalma (1/sn)
  nitroRefill: 0.1, // normal dolum (1/sn)
  nitroDriftRefill: 0.25, // drift sırasında dolum (1/sn)
  nitroResume: 0.15, // tükenince yeniden başlamak için gereken doluluk
  // Dikey ve Zıplama Fiziği (Air Time)
  gravity: 30, // yerçekimi ivmesi (birim/sn²)
  airGripMultiplier: 0.15, // havada tekerlek yanal tutuş çarpanı
  airTurnMultiplier: 0.2, // havada yönlendirme çarpanı
  airThrottleMultiplier: 0.3, // havada gaz ivmesi çarpanı
  // Geliştirmeler (seviye başına)
  engineSpeed: 1.2,
  engineAccel: 1.65,
  brakePower: 5.5,
};

const wrapAngle = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));
const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));
const smoothstep = (t: number) => {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
};

/** Hedefin üstündeki hız için sürtünme; w >= target >= 0. */
function coast(w: number, target: number, amount: number, dt: number) {
  const T = TUNING;
  const dragged = target + (w - target) * Math.exp(-T.coastDrag * dt);
  return Math.max(target, dragged - T.coastDecel * (1 - amount) * dt);
}

export function stepVehicle(
  state: VehicleState,
  input: DriveInput,
  dt: number,
  upgrades: VehicleUpgrades = { engine: 0, brakes: 0, cargo: 0 },
): VehicleState {
  const T = TUNING;
  const throttle = clamp(input.throttle, -1, 1);
  const steer = clamp(input.steer, -1, 1);
  const baseMax = T.maxSpeed + upgrades.engine * T.engineSpeed;
  const baseAccel = T.accel + upgrades.engine * T.engineAccel;
  const brakePower = T.brake + upgrades.brakes * T.brakePower;

  // Nitro: tükenince doluluk nitroResume üstüne çıkana kadar kilitli.
  let nitro = clamp(state.nitro, 0, 1);
  let locked = state.nitroLocked ?? false;
  if (locked && nitro > T.nitroResume) locked = false;
  const boosting = input.nitro && !locked && nitro > 0 && throttle > 0.1;
  if (boosting) {
    nitro = Math.max(0, nitro - T.nitroDrain * dt);
    if (nitro <= 0) locked = true;
  } else {
    const refill = state.drifting ? T.nitroDriftRefill : T.nitroRefill;
    nitro = Math.min(1, nitro + refill * dt);
  }
  const boost = boosting ? T.nitroBoost : 1;

  // Dikey hareket ve zıplama fiziği
  let altitude = state.altitude ?? 0;
  let verticalVelocity = state.verticalVelocity ?? 0;
  let airborne = state.airborne ?? (altitude > 0 || verticalVelocity > 0);

  if (altitude > 0 || verticalVelocity !== 0 || airborne) {
    verticalVelocity -= T.gravity * dt;
    altitude += verticalVelocity * dt;
    if (altitude <= 0) {
      altitude = 0;
      verticalVelocity = 0;
      airborne = false;
    } else {
      airborne = true;
    }
  }

  const maxSpeed = baseMax * boost;
  const accel = baseAccel * boost * (airborne ? T.airThrottleMultiplier : 1);

  // Dönüş: hıza bağlı, duran araç dönmez, geri giderken ters çalışır.
  const vfBefore =
    state.velocity.x * Math.sin(state.heading) +
    state.velocity.z * Math.cos(state.heading);
  const speedAbs = Math.abs(vfBefore);
  const rise = smoothstep(speedAbs / T.turnRiseSpeed);
  const falloff =
    1 -
    T.turnFalloff *
      smoothstep(
        (speedAbs / baseMax - T.turnFalloffStart) / (1 - T.turnFalloffStart),
      );
  const isReversing = vfBefore < -0.2 && throttle < -0.05;
  const steerDir = isReversing ? -1 : 1;
  let yawRate =
    -steer *
    T.turnRate *
    rise *
    falloff *
    steerDir *
    (input.handbrake ? T.handbrakeTurnBoost : 1);
  if (airborne) yawRate *= T.airTurnMultiplier;
  const heading = wrapAngle(state.heading + yawRate * dt);

  // Hız vektörü dünyada sabit kalır; yeni heading'e göre ileri/yanal ayrıştır.
  const fx = Math.sin(heading);
  const fz = Math.cos(heading);
  const lx = fz;
  const lz = -fx;
  let vf = state.velocity.x * fx + state.velocity.z * fz;
  let vl = state.velocity.x * lx + state.velocity.z * lz;

  // Yanal tutuş
  const totalSpeed = Math.hypot(state.velocity.x, state.velocity.z);
  const baseGrip = input.handbrake
    ? T.driftGrip
    : T.grip *
      (1 -
        T.highSpeedSlip * Math.abs(steer) * clamp(totalSpeed / baseMax, 0, 1));
  const grip = baseGrip * (airborne ? T.airGripMultiplier : 1);
  vl *= Math.exp(-grip * dt);

  // İleri hız
  const sign = Math.abs(throttle) < 0.02 ? 0 : Math.sign(throttle);
  const amount = Math.abs(throttle);
  if (sign === 0) {
    const w = coast(Math.abs(vf), 0, 0, dt);
    vf = w < T.stopSnap ? 0 : w * Math.sign(vf);
  } else {
    let w = vf * sign;
    const limit = sign > 0 ? maxSpeed : baseMax * T.reverseRatio;
    const target = limit * amount;
    if (w < -T.brakeZone) {
      w = Math.min(w + brakePower * amount * dt, 0);
    } else if (w < target) {
      const rate = (sign > 0 ? accel : T.reverseAccel) / limit;
      w = target + (w - target) * Math.exp(-rate * dt);
    } else {
      w = coast(w, target, amount, dt);
    }
    vf = w * sign;
  }
  if (input.handbrake) vf *= Math.exp(-T.handbrakeDrag * dt);

  const vx = fx * vf + lx * vl;
  const vz = fz * vf + lz * vl;
  const steerAngle =
    state.steerAngle +
    (steer * T.steerAngleMax - state.steerAngle) *
      (1 - Math.exp(-T.steerAngleFollow * dt));
  return {
    heading,
    velocity: { x: vx, z: vz },
    position: {
      x: state.position.x + vx * dt,
      z: state.position.z + vz * dt,
    },
    nitro,
    nitroLocked: locked,
    drifting: Math.abs(vl) > T.driftThreshold,
    steerAngle,
    altitude,
    verticalVelocity,
    airborne,
  };
}

export function resetVehicle(depot: Vec2): VehicleState {
  return {
    position: { ...depot },
    velocity: { x: 0, z: 0 },
    heading: Math.PI / 2,
    nitro: 1,
    nitroLocked: false,
    drifting: false,
    steerAngle: 0,
    altitude: 0,
    verticalVelocity: 0,
    airborne: false,
  };
}
