import { describe, it, expect } from "vitest";
import { stepVehicle, resetVehicle, TUNING } from "./vehicle";
import { joystickToDrive } from "./input";
import type { DriveInput, VehicleState } from "./types";

const car = (): VehicleState => ({
  position: { x: 0, z: 0 },
  velocity: { x: 0, z: 0 },
  heading: 0,
  nitro: 1,
  drifting: false,
  steerAngle: 0,
  altitude: 0,
  verticalVelocity: 0,
  airborne: false,
});
const drive = (over: Partial<DriveInput> = {}): DriveInput => ({
  throttle: 0,
  steer: 0,
  handbrake: false,
  nitro: false,
  ...over,
});
const speedOf = (s: VehicleState) => Math.hypot(s.velocity.x, s.velocity.z);
const forward = (s: VehicleState) =>
  s.velocity.x * Math.sin(s.heading) + s.velocity.z * Math.cos(s.heading);
const lateral = (s: VehicleState) =>
  s.velocity.x * Math.cos(s.heading) - s.velocity.z * Math.sin(s.heading);
function run(
  s: VehicleState,
  input: DriveInput,
  seconds: number,
  dt = 1 / 60,
  upgrades = { engine: 0, brakes: 0, cargo: 0 },
) {
  for (let i = 0; i < Math.round(seconds / dt); i++)
    s = stepVehicle(s, input, dt, upgrades);
  return s;
}
const cruising = (speed = 12): VehicleState => ({
  ...car(),
  velocity: { x: 0, z: speed },
});

describe("throttle and braking", () => {
  it("accelerates with throttle and never exceeds max speed", () => {
    const early = run(car(), drive({ throttle: 1 }), 0.5);
    expect(forward(early)).toBeGreaterThan(3);
    let s = car();
    for (let i = 0; i < 600; i++) {
      s = stepVehicle(s, drive({ throttle: 1 }), 1 / 60);
      expect(speedOf(s)).toBeLessThanOrEqual(TUNING.maxSpeed + 1e-6);
    }
    expect(speedOf(s)).toBeGreaterThan(TUNING.maxSpeed * 0.97);
  });
  it("accelerates without teleporting", () => {
    const s = stepVehicle(car(), drive({ throttle: 1 }), 1 / 60);
    expect(speedOf(s)).toBeGreaterThan(0);
    expect(Math.hypot(s.position.x, s.position.z)).toBeLessThan(0.02);
  });
  it("accelerates less as speed rises", () => {
    const slow = stepVehicle(car(), drive({ throttle: 1 }), 1 / 60);
    const fast = stepVehicle(cruising(12), drive({ throttle: 1 }), 1 / 60);
    expect(forward(fast) - 12).toBeLessThan(forward(slow));
  });
  it("coasts to a stop within 1.5 s after releasing throttle (delivery stop threshold)", () => {
    let s = run(car(), drive({ throttle: 1 }), 4);
    expect(speedOf(s)).toBeGreaterThan(13);
    s = run(s, drive(), 1.5);
    expect(speedOf(s)).toBeLessThanOrEqual(0.5);
    expect(speedOf(s)).toBeLessThan(0.5);
  });
  it("still stops within 1.5 s from a nitro-boosted speed", () => {
    let s = run(car(), drive({ throttle: 1, nitro: true }), 2.4);
    expect(speedOf(s)).toBeGreaterThan(TUNING.maxSpeed * 1.2);
    s = run(s, drive(), 1.5);
    expect(speedOf(s)).toBeLessThanOrEqual(0.5);
  });
  it("brakes when reverse is pressed at speed, then reverses", () => {
    let s = cruising(12);
    s = run(s, drive({ throttle: -1 }), 0.3);
    expect(forward(s)).toBeLessThan(12);
    expect(forward(s)).toBeGreaterThan(0);
    s = run(s, drive({ throttle: -1 }), 0.6);
    expect(forward(s)).toBeLessThan(0.5);
    s = run(s, drive({ throttle: -1 }), 3);
    expect(forward(s)).toBeLessThan(-1);
  });
  it("limits reverse speed to ~40% of forward max", () => {
    const s = run(car(), drive({ throttle: -1 }), 6);
    expect(-forward(s)).toBeGreaterThan(TUNING.maxSpeed * 0.4 * 0.95);
    expect(-forward(s)).toBeLessThanOrEqual(TUNING.maxSpeed * 0.4 + 1e-6);
  });
});

describe("steering", () => {
  it("does not turn a stationary car", () => {
    const s = run(car(), drive({ steer: 1 }), 1);
    expect(s.heading).toBe(0);
  });
  it("turns while moving, right for positive steer", () => {
    const right = run(cruising(8), drive({ steer: 1, throttle: 0.6 }), 0.5);
    const left = run(cruising(8), drive({ steer: -1, throttle: 0.6 }), 0.5);
    expect(Math.abs(right.heading)).toBeGreaterThan(0.3);
    expect(right.heading).toBeLessThan(0);
    expect(left.heading).toBeGreaterThan(0);
  });
  it("turns gradually", () => {
    const s = stepVehicle(cruising(5), drive({ steer: 1 }), 1 / 60);
    expect(Math.abs(s.heading)).toBeGreaterThan(0);
    expect(Math.abs(s.heading)).toBeLessThan(0.1);
  });
  it("turns most at mid speed and less at very high speed", () => {
    const rate = (v: number) =>
      Math.abs(stepVehicle(cruising(v), drive({ steer: 1, throttle: 1 }), 1 / 60).heading);
    expect(rate(1)).toBeLessThan(rate(6));
    expect(rate(14)).toBeLessThan(rate(8));
  });
  it("steers in the opposite direction when reversing", () => {
    const fwd = run(cruising(6), drive({ steer: 1, throttle: 0.5 }), 0.3);
    const back = run(
      { ...car(), velocity: { x: 0, z: -3 } },
      drive({ steer: 1, throttle: -1 }),
      0.3,
    );
    expect(fwd.heading).toBeLessThan(0);
    expect(back.heading).toBeGreaterThan(0);
  });
  it("tracks a visual steer angle", () => {
    const s = run(cruising(8), drive({ steer: 1 }), 0.5);
    expect(s.steerAngle).toBeCloseTo(TUNING.steerAngleMax, 1);
  });
});

describe("drift", () => {
  const manoeuvre = (handbrake: boolean) => {
    let drifted = false;
    let peak = 0;
    let s = cruising(12);
    for (let i = 0; i < 60; i++) {
      s = stepVehicle(s, drive({ steer: 1, throttle: 0.8, handbrake }), 1 / 60);
      drifted ||= s.drifting;
      peak = Math.max(peak, Math.abs(lateral(s)));
    }
    return { drifted, peak };
  };
  it("handbrake plus steering produces lateral speed and drifting", () => {
    const withBrake = manoeuvre(true);
    expect(withBrake.drifted).toBe(true);
    expect(withBrake.peak).toBeGreaterThan(TUNING.driftThreshold);
  });
  it("the same manoeuvre without handbrake does not drift", () => {
    const grip = manoeuvre(false);
    expect(grip.drifted).toBe(false);
    expect(grip.peak).toBeLessThan(manoeuvre(true).peak * 0.6);
  });
  it("handbrake trims forward speed slightly", () => {
    const a = run(cruising(12), drive({ throttle: 1 }), 0.5);
    const b = run(cruising(12), drive({ throttle: 1, handbrake: true }), 0.5);
    expect(forward(b)).toBeLessThan(forward(a));
    expect(forward(b)).toBeGreaterThan(forward(a) * 0.6);
  });
  it("lateral speed dies out quickly with grip", () => {
    const s = run({ ...car(), velocity: { x: 3, z: 0 } }, drive(), 0.6);
    expect(Math.abs(lateral(s))).toBeLessThan(0.1);
  });
  it("drifting flag clears after the slide ends", () => {
    let s = run(cruising(12), drive({ steer: 1, throttle: 0.8, handbrake: true }), 1);
    expect(s.drifting).toBe(true);
    s = run(s, drive({ throttle: 0.5 }), 1.5);
    expect(s.drifting).toBe(false);
  });
});

describe("nitro", () => {
  it("raises the speed limit by about 45%", () => {
    const normal = run(car(), drive({ throttle: 1 }), 2.4);
    const boosted = run(car(), drive({ throttle: 1, nitro: true }), 2.4);
    expect(speedOf(boosted)).toBeGreaterThan(speedOf(normal) * 1.25);
    expect(speedOf(boosted)).toBeLessThanOrEqual(TUNING.maxSpeed * TUNING.nitroBoost + 1e-6);
  });
  it("drains about 0.4 per second and lasts ~2.5 s", () => {
    const s = run(car(), drive({ throttle: 1, nitro: true }), 1);
    expect(s.nitro).toBeCloseTo(0.6, 1);
    const empty = run(car(), drive({ throttle: 1, nitro: true }), 2.6);
    expect(empty.nitro).toBeLessThan(0.1);
  });
  it("refills slowly when unused", () => {
    const s = run({ ...car(), nitro: 0.5 }, drive({ throttle: 1 }), 1);
    expect(s.nitro).toBeCloseTo(0.6, 1);
  });
  it("has no effect at zero and stays locked until above 0.15", () => {
    const start = { ...car(), nitro: 0, nitroLocked: true };
    const plain = run(car(), drive({ throttle: 1 }), 1);
    const s = run(start, drive({ throttle: 1, nitro: true }), 1);
    expect(speedOf(s)).toBeLessThanOrEqual(speedOf(plain) + 1e-6);
    expect(s.nitro).toBeGreaterThan(0);
    // 0.15 üstüne çıkana kadar boost yok: kısa süre sonra hâlâ kilitli
    const brief = run(start, drive({ throttle: 1, nitro: true }), 0.5);
    expect(brief.nitro).toBeLessThan(0.15 + 0.1);
    expect(speedOf(brief)).toBeCloseTo(speedOf(run(car(), drive({ throttle: 1 }), 0.5)), 3);
    // dolum 0.15'i geçince tekrar kullanılabilir
    const later = run(start, drive({ nitro: true }), 1.6);
    expect(later.nitro).toBeGreaterThan(0.15);
    const again = stepVehicle(later, drive({ throttle: 1, nitro: true }), 1 / 60);
    expect(again.nitro).toBeLessThan(later.nitro);
  });
  it("does not flicker when held after running out", () => {
    let s = car();
    const states: boolean[] = [];
    for (let i = 0; i < 60 * 6; i++) {
      const before = s.nitro;
      s = stepVehicle(s, drive({ throttle: 1, nitro: true }), 1 / 60);
      states.push(s.nitro < before);
    }
    let toggles = 0;
    for (let i = 1; i < states.length; i++) if (states[i] !== states[i - 1]) toggles++;
    expect(toggles).toBeLessThanOrEqual(6);
  });
  it("refills faster while drifting", () => {
    const base = { ...cruising(12), nitro: 0.3 };
    const drifting = run(base, drive({ steer: 1, throttle: 0.8, handbrake: true }), 1);
    const straight = run(base, drive({ throttle: 0.8 }), 1);
    expect(drifting.nitro - 0.3).toBeGreaterThan((straight.nitro - 0.3) * 1.5);
  });
});

describe("upgrades", () => {
  it("engine raises top speed and acceleration", () => {
    const up = { engine: 2, brakes: 0, cargo: 0 };
    const base = run(car(), drive({ throttle: 1 }), 4);
    const upgraded = run(car(), drive({ throttle: 1 }), 4, 1 / 60, up);
    expect(speedOf(upgraded)).toBeGreaterThan(speedOf(base));
    const quickBase = run(car(), drive({ throttle: 1 }), 0.4);
    const quickUp = run(car(), drive({ throttle: 1 }), 0.4, 1 / 60, up);
    expect(speedOf(quickUp)).toBeGreaterThan(speedOf(quickBase));
  });
  it("brakes shorten the braking distance", () => {
    const up = { engine: 0, brakes: 3, cargo: 0 };
    const stopDistance = (u: typeof up) => {
      let s = cruising(12);
      for (let i = 0; i < 180 && forward(s) > 0.3; i++)
        s = stepVehicle(s, drive({ throttle: -1 }), 1 / 60, u);
      return s.position.z;
    };
    expect(stopDistance(up)).toBeLessThan(stopDistance({ engine: 0, brakes: 0, cargo: 0 }));
  });
});

describe("dt independence", () => {
  it("2 s of driving matches between dt=1/60 and dt=1/30", () => {
    const input = drive({ throttle: 1, steer: 0.4 });
    const a = run(car(), input, 2, 1 / 60);
    const b = run(car(), input, 2, 1 / 30);
    expect(speedOf(b)).toBeCloseTo(speedOf(a), 0);
    expect(Math.abs(speedOf(b) - speedOf(a))).toBeLessThan(speedOf(a) * 0.1);
    expect(Math.abs(b.position.x - a.position.x)).toBeLessThan(
      Math.hypot(a.position.x, a.position.z) * 0.1,
    );
    expect(Math.abs(b.position.z - a.position.z)).toBeLessThan(
      Math.hypot(a.position.x, a.position.z) * 0.1,
    );
    expect(Math.abs(b.heading - a.heading)).toBeLessThan(Math.abs(a.heading) * 0.1);
  });
  it("drift manoeuvre is also consistent across dt", () => {
    const input = drive({ throttle: 0.8, steer: 1, handbrake: true });
    const a = run(cruising(12), input, 1, 1 / 60);
    const b = run(cruising(12), input, 1, 1 / 30);
    expect(Math.abs(speedOf(b) - speedOf(a))).toBeLessThan(speedOf(a) * 0.1);
  });
});

describe("resetVehicle", () => {
  it("restores the new fields", () => {
    const s = resetVehicle({ x: 3, z: 4 });
    expect(s).toMatchObject({
      position: { x: 3, z: 4 },
      velocity: { x: 0, z: 0 },
      nitro: 1,
      drifting: false,
      steerAngle: 0,
    });
  });
});

describe("joystick drive integration", () => {
  it("completes U-turn simulation from east to west within 4 seconds", () => {
    // 1. "Simülasyon" testi: stepVehicle + joystickToDrive ile duvar OLMADAN, araç doğuya giderken joystick'i batıya çek.
    // Araç makul sürede (< 4 sn) batıya dönmüş ve hedefe yönelmiş olsun (U dönüşü tamamlanıyor).
    let s: VehicleState = {
      ...car(),
      heading: Math.PI / 2, // Doğu (+x)
      velocity: { x: 10, z: 0 },
    };
    const joy = { x: -1, z: 0 }; // Batı (-x)
    const target = -Math.PI / 2; // Batı hedef açısı
    const dt = 1 / 60;
    for (let i = 0; i < 4 * 60; i++) {
      const drive = joystickToDrive(
        joy,
        s.heading,
        Math.hypot(s.velocity.x, s.velocity.z),
      );
      s = stepVehicle(s, drive, dt);
    }
    const diff = Math.atan2(Math.sin(target - s.heading), Math.cos(target - s.heading));
    expect(Math.abs(diff)).toBeLessThan((5 * Math.PI) / 180);
  });

  it("stationary car reverses and turns to face target when joystick points behind", () => {
    // 2. Duran araç (hız 0), joystick arkayı gösteriyor: araç geri gitmeye başlar (ileri hız < 0)
    // ve heading hedefe doğru ilerler. Sonunda araç hedef yöne bakar.
    let s: VehicleState = {
      ...car(),
      heading: 0, // +z
      velocity: { x: 0, z: 0 },
    };
    const joy = { x: 0, z: -1 }; // Arka (-z)
    const target = Math.PI;
    const dt = 1 / 60;
    let startedReversing = false;
    let headingMovedTowardsTarget = false;

    for (let i = 0; i < 4 * 60; i++) {
      const drive = joystickToDrive(
        joy,
        s.heading,
        Math.hypot(s.velocity.x, s.velocity.z),
      );
      s = stepVehicle(s, drive, dt);
      const vf =
        s.velocity.x * Math.sin(s.heading) + s.velocity.z * Math.cos(s.heading);
      if (vf < -0.1) startedReversing = true;
      if (Math.abs(s.heading) > 0.1) headingMovedTowardsTarget = true;
    }

    expect(startedReversing).toBe(true);
    expect(headingMovedTowardsTarget).toBe(true);
    const diff = Math.atan2(Math.sin(target - s.heading), Math.cos(target - s.heading));
    expect(Math.abs(diff)).toBeLessThan((5 * Math.PI) / 180);
  });

  it("vehicle facing wall moves away within 1 second when pulling joystick back", () => {
    let s: VehicleState = {
      ...car(),
      heading: 0,
      position: { x: 0, z: 0 },
      velocity: { x: 0, z: 0 },
    };
    const joy = { x: 0, z: -1 };
    const dt = 1 / 60;
    for (let i = 0; i < 60; i++) {
      const drive = joystickToDrive(
        joy,
        s.heading,
        Math.hypot(s.velocity.x, s.velocity.z),
      );
      s = stepVehicle(s, drive, dt);
    }
    expect(s.position.z).toBeLessThan(-1);
  });

  it("avoids steering oscillation at high speed with 30 degree offset", () => {
    // 3. Salınım testi: araç 12 hızla gidiyor, joystick 30° sapmış sabit bir yönü gösteriyor. 5 sn simüle et.
    // Son 2 saniyede heading ile hedef arasındaki fark sürekli küçük (< 5°) kalmalı
    // ve işareti (steer yönü) en fazla 2 kez değişmeli (titreme/salınım yok).
    const targetAngle = (30 * Math.PI) / 180;
    const joy = { x: Math.sin(targetAngle), z: Math.cos(targetAngle) };
    let s: VehicleState = {
      ...car(),
      heading: 0,
      velocity: { x: 0, z: 12 },
    };
    const dt = 1 / 60;
    let lastSteerSign: number | null = null;
    let signChangesInLast2s = 0;

    for (let i = 0; i < 5 * 60; i++) {
      const drive = joystickToDrive(
        joy,
        s.heading,
        Math.hypot(s.velocity.x, s.velocity.z),
      );
      s = stepVehicle(s, drive, dt);

      // Son 2 saniye (i >= 3 * 60)
      if (i >= 3 * 60) {
        const diff = Math.atan2(
          Math.sin(targetAngle - s.heading),
          Math.cos(targetAngle - s.heading),
        );
        expect(Math.abs(diff)).toBeLessThan((5 * Math.PI) / 180);

        const currentSign = drive.steer > 0.001 ? 1 : drive.steer < -0.001 ? -1 : 0;
        if (currentSign !== 0) {
          if (lastSteerSign !== null && currentSign !== lastSteerSign) {
            signChangesInLast2s++;
          }
          lastSteerSign = currentSign;
        }
      }
    }

    expect(signChangesInLast2s).toBeLessThanOrEqual(2);
  });
});

describe("jumping and vertical physics (air time)", () => {
  it("launches into the air, ascends to apex, and lands safely on ground with gravity", () => {
    let s: VehicleState = {
      ...car(),
      velocity: { x: 0, z: 12 },
      verticalVelocity: 12,
      altitude: 0.1,
      airborne: true,
    };
    const dt = 1 / 60;
    let maxAltitude = 0;
    let reachedApex = false;

    // Simulate flight
    for (let i = 0; i < 120; i++) {
      s = stepVehicle(s, drive(), dt);
      if (s.altitude > maxAltitude) {
        maxAltitude = s.altitude;
      }
      if (s.verticalVelocity < 0 && s.airborne) {
        reachedApex = true;
      }
      if (!s.airborne) {
        break;
      }
    }

    expect(reachedApex).toBe(true);
    expect(maxAltitude).toBeGreaterThan(1.5);
    expect(s.airborne).toBe(false);
    expect(s.altitude).toBe(0);
    expect(s.verticalVelocity).toBe(0);
  });

  it("restricts steering yaw rate while airborne", () => {
    const dt = 1 / 60;
    // Ground car turning
    const groundCar = stepVehicle(
      { ...car(), velocity: { x: 0, z: 10 } },
      drive({ steer: 1, throttle: 0.5 }),
      dt,
    );

    // Airborne car turning
    const airCar = stepVehicle(
      {
        ...car(),
        velocity: { x: 0, z: 10 },
        altitude: 2.0,
        verticalVelocity: 5,
        airborne: true,
      },
      drive({ steer: 1, throttle: 0.5 }),
      dt,
    );

    expect(Math.abs(airCar.heading)).toBeLessThan(Math.abs(groundCar.heading) * 0.35);
  });

  it("reduces lateral grip while airborne allowing ballistic glide", () => {
    const dt = 1 / 60;
    // Car with lateral slide on ground
    const groundCar = stepVehicle(
      { ...car(), velocity: { x: 6, z: 0 }, heading: 0 },
      drive(),
      dt,
    );

    // Car with lateral slide in air
    const airCar = stepVehicle(
      {
        ...car(),
        velocity: { x: 6, z: 0 },
        heading: 0,
        altitude: 2.0,
        verticalVelocity: 5,
        airborne: true,
      },
      drive(),
      dt,
    );

    // Airborne vehicle retains more lateral velocity due to reduced grip
    expect(Math.abs(airCar.velocity.x)).toBeGreaterThan(Math.abs(groundCar.velocity.x));
  });

  it("initializes vehicle on ground with resetVehicle", () => {
    const s = resetVehicle({ x: 10, z: 20 });
    expect(s.altitude).toBe(0);
    expect(s.verticalVelocity).toBe(0);
    expect(s.airborne).toBe(false);
  });
});


