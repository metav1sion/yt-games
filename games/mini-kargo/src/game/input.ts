import type { DriveInput, Vec2 } from "./types";
export function createInputState() {
  let value: Vec2 = { x: 0, z: 0 };
  return {
    set(direction: Vec2) {
      const length = Math.max(1, Math.hypot(direction.x, direction.z));
      value = { x: direction.x / length, z: direction.z / length };
    },
    read: () => ({ ...value }),
    reset() {
      value = { x: 0, z: 0 };
    },
  };
}
export const INPUT_TUNING = {
  steerFollow: 12, // klavye direksiyon yumuşatma hızı (1/sn)
  throttleFollow: 20, // klavye gaz yumuşatma hızı (1/sn)
  joystickDeadzone: 0.06,
  joystickFullSteerAngle: Math.PI / 4, // bu açı farkında tam direksiyon (yavaşken, 45°)
  joystickFullSteerAngleFast: Math.PI / 2, // yüksek hızda tam direksiyon açısı (90°)
  joystickSteerDeadzone: (4 * Math.PI) / 180, // titremeyi azaltan açı ölü bölgesi (< ~4°)
  uTurnAngle: (100 * Math.PI) / 180, // bundan büyük farkta U dönüşü
  uTurnSpeed: 2, // U dönüşü için hız eşiği
};

const idleDrive = (): DriveInput => ({
  throttle: 0,
  steer: 0,
  handbrake: false,
  nitro: false,
});
const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

let reversing = false;

/**
 * Joystick yönünü (ekran/dünya x,z) otomatik direksiyona çevirir.
 * heading: aracın yönü (ileri = sin h, cos h); speed: mevcut hız büyüklüğü.
 * steer > 0 sağ; heading azalınca araç sağa döner.
 */
export function joystickToDrive(
  joystick: Vec2,
  heading: number,
  speed: number,
): DriveInput {
  const T = INPUT_TUNING;
  const magnitude = Math.min(1, Math.hypot(joystick.x, joystick.z));
  if (magnitude < T.joystickDeadzone) {
    reversing = false;
    return idleDrive();
  }
  const target = Math.atan2(joystick.x, joystick.z);
  const difference = Math.atan2(
    Math.sin(target - heading),
    Math.cos(target - heading),
  );

  const speedFactor = clamp((Math.abs(speed) - 3) / (14 - 3), 0, 1);
  const fullSteer =
    T.joystickFullSteerAngle +
    (T.joystickFullSteerAngleFast - T.joystickFullSteerAngle) * speedFactor;

  let steer = clamp(-difference / fullSteer, -1, 1);
  if (Math.abs(difference) < T.joystickSteerDeadzone) {
    steer = 0;
  }

  let throttle = magnitude;

  if (Math.abs(difference) > T.uTurnAngle) {
    throttle = -magnitude;
    if (speed < T.uTurnSpeed || reversing) {
      reversing = true;
      steer = difference > 0 ? 1 : -1;
    } else {
      steer = difference > 0 ? -1 : 1;
    }
  } else if (reversing) {
    if (Math.abs(difference) > (15 * Math.PI) / 180) {
      throttle = -magnitude;
      steer = difference > 0 ? 1 : -1;
    } else {
      reversing = false;
    }
  }

  return { throttle, steer, handbrake: false, nitro: false };
}


const movementKeys = new Set([
  "w",
  "a",
  "s",
  "d",
  "arrowup",
  "arrowdown",
  "arrowleft",
  "arrowright",
]);
const driveKeys = new Set([...movementKeys, "space", "shift"]);
export function normalizeKey(key: string) {
  return key === " " ? "space" : key.toLowerCase();
}

export function createKeyboardState() {
  const keys = new Set<string>();
  let throttle = 0,
    steer = 0;
  const follow = (value: number, target: number, rate: number, dt: number) => {
    const next = value + (target - value) * (1 - Math.exp(-rate * dt));
    return Math.abs(next - target) < 0.01 ? target : next;
  };
  const held = (...names: string[]) => names.some((name) => keys.has(name));
  return {
    press(key: string) {
      const k = normalizeKey(key);
      if (driveKeys.has(k)) keys.add(k);
    },
    release(key: string) {
      keys.delete(normalizeKey(key));
    },
    /** Yumuşatmayı dt kadar ilerletip güncel sürüş girdisini verir. */
    step(dt: number): DriveInput {
      const throttleTarget =
        Number(held("w", "arrowup")) - Number(held("s", "arrowdown"));
      const steerTarget =
        Number(held("d", "arrowright")) - Number(held("a", "arrowleft"));
      throttle = follow(throttle, throttleTarget, INPUT_TUNING.throttleFollow, dt);
      steer = follow(steer, steerTarget, INPUT_TUNING.steerFollow, dt);
      return {
        throttle,
        steer,
        handbrake: keys.has("space"),
        nitro: keys.has("shift"),
      };
    },
    /** Hareket tuşu basılı ya da değerler henüz sönmediyse true. */
    active() {
      return (
        [...keys].some((k) => movementKeys.has(k)) ||
        throttle !== 0 ||
        steer !== 0
      );
    },
    reset() {
      keys.clear();
      throttle = 0;
      steer = 0;
    },
  };
}

export type InputController = {
  /** Klavye öncelikli; yoksa joystick otomatik direksiyonu. */
  read(heading: number, speed: number, dt: number): DriveInput;
  readJoystick(): Vec2;
  setNitro(on: boolean): void;
  setHandbrake(on: boolean): void;
  reset(): void;
  dispose(): void;
};
export function createInput(joystick: HTMLElement): InputController {
  const state = createInputState();
  const keyboard = createKeyboardState();
  let externalNitro = false,
    externalHandbrake = false;
  const knob = joystick.querySelector<HTMLElement>(".stick-knob")!;
  let pointer: number | null = null;
  function keydown(e: KeyboardEvent) {
    const k = normalizeKey(e.key);
    if (!driveKeys.has(k)) return;
    if ((e.target as HTMLElement)?.closest("button,input")) return;
    e.preventDefault();
    keyboard.press(k);
  }
  function keyup(e: KeyboardEvent) {
    keyboard.release(e.key);
  }
  function move(e: PointerEvent) {
    if (e.pointerId !== pointer) return;
    const r = joystick.getBoundingClientRect(),
      radius = r.width * 0.32;
    const dx = (e.clientX - r.left - r.width / 2) / radius,
      dz = (e.clientY - r.top - r.height / 2) / radius;
    const length = Math.max(1, Math.hypot(dx, dz));
    const x = dx / length,
      z = dz / length;
    state.set(Math.hypot(x, z) < 0.1 ? { x: 0, z: 0 } : { x, z });
    knob.style.transform = `translate(${x * radius}px,${z * radius}px)`;
  }
  function down(e: PointerEvent) {
    if (document.querySelector(".sheet:not([hidden])")) return;
    if (
      e.pointerType === "touch" &&
      e.target instanceof Element &&
      e.target.closest(".sheet, .toolbar, .mobile-actions")
    )
      return;
    if (
      e.pointerType !== "touch" &&
      (!(e.target instanceof Node) || !joystick.contains(e.target))
    ) return;
    if (pointer !== null) return;
    e.preventDefault();
    pointer = e.pointerId;
    if (e.pointerType === "touch") {
      const size = joystick.getBoundingClientRect().width,
        margin = 8;
      const left = Math.min(
        Math.max(margin, e.clientX - size / 2),
        innerWidth - size - margin,
      );
      const top = Math.min(
        Math.max(margin, e.clientY - size / 2),
        innerHeight - size - margin,
      );
      joystick.style.left = `${left}px`;
      joystick.style.top = `${top}px`;
      joystick.style.bottom = "auto";
    }
    joystick.setPointerCapture(pointer);
    joystick.classList.add("active");
    move(e);
  }
  function release(e: PointerEvent) {
    if (e.pointerId !== pointer) return;
    reset();
  }
  function reset() {
    keyboard.reset();
    externalNitro = false;
    externalHandbrake = false;
    const capturedPointer = pointer;
    pointer = null;
    if (capturedPointer !== null && joystick.hasPointerCapture(capturedPointer))
      joystick.releasePointerCapture(capturedPointer);
    state.reset();
    knob.style.transform = "";
    joystick.classList.remove("active");
  }
  function resize() {
    reset();
    joystick.style.left = "";
    joystick.style.top = "";
    joystick.style.bottom = "";
  }
  function visibility() {
    if (document.hidden) reset();
  }
  window.addEventListener("keydown", keydown);
  window.addEventListener("keyup", keyup);
  window.addEventListener("blur", reset);
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", visibility);
  document.addEventListener("pointerdown", down);
  joystick.addEventListener("pointerdown", down);
  joystick.addEventListener("pointermove", move);
  for (const event of ["pointerup", "pointercancel", "lostpointercapture"])
    joystick.addEventListener(event, release as EventListener);
  return {
    read(heading, speed, dt) {
      const kb = keyboard.step(dt);
      const drive = keyboard.active()
        ? kb
        : joystickToDrive(state.read(), heading, speed);
      return {
        ...drive,
        nitro: kb.nitro || externalNitro,
        handbrake: kb.handbrake || externalHandbrake,
      };
    },
    readJoystick: state.read,
    setNitro(on) {
      externalNitro = on;
    },
    setHandbrake(on) {
      externalHandbrake = on;
    },
    reset,
    dispose() {
      reset();
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("keyup", keyup);
      window.removeEventListener("blur", reset);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", visibility);
      document.removeEventListener("pointerdown", down);
      joystick.removeEventListener("pointerdown", down);
      joystick.removeEventListener("pointermove", move);
      for (const event of ["pointerup", "pointercancel", "lostpointercapture"])
        joystick.removeEventListener(event, release as EventListener);
    },
  };
}
