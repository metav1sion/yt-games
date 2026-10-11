import type { Vec2 } from "./types";
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
export type InputController = { read(): Vec2; reset(): void; dispose(): void };
export function createInput(joystick: HTMLElement): InputController {
  const state = createInputState();
  const keys = new Set<string>();
  const knob = joystick.querySelector<HTMLElement>(".stick-knob")!;
  let pointer: number | null = null;
  const directionKeys = new Set([
    "w",
    "a",
    "s",
    "d",
    "arrowup",
    "arrowdown",
    "arrowleft",
    "arrowright",
  ]);
  function keyboard() {
    state.set({
      x:
        Number(keys.has("d") || keys.has("arrowright")) -
        Number(keys.has("a") || keys.has("arrowleft")),
      z:
        Number(keys.has("s") || keys.has("arrowdown")) -
        Number(keys.has("w") || keys.has("arrowup")),
    });
  }
  function keydown(e: KeyboardEvent) {
    const k = e.key.toLowerCase();
    if (!directionKeys.has(k)) return;
    if ((e.target as HTMLElement)?.closest("button,input")) return;
    e.preventDefault();
    keys.add(k);
    keyboard();
  }
  function keyup(e: KeyboardEvent) {
    keys.delete(e.key.toLowerCase());
    if (pointer === null) keyboard();
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
    if (pointer !== null) return;
    e.preventDefault();
    pointer = e.pointerId;
    joystick.setPointerCapture(pointer);
    joystick.classList.add("active");
    move(e);
  }
  function release(e: PointerEvent) {
    if (e.pointerId !== pointer) return;
    pointer = null;
    state.reset();
    knob.style.transform = "";
    joystick.classList.remove("active");
  }
  function reset() {
    keys.clear();
    pointer = null;
    state.reset();
    knob.style.transform = "";
    joystick.classList.remove("active");
  }
  function visibility() {
    if (document.hidden) reset();
  }
  window.addEventListener("keydown", keydown);
  window.addEventListener("keyup", keyup);
  window.addEventListener("blur", reset);
  document.addEventListener("visibilitychange", visibility);
  joystick.addEventListener("pointerdown", down);
  joystick.addEventListener("pointermove", move);
  for (const event of ["pointerup", "pointercancel", "lostpointercapture"])
    joystick.addEventListener(event, release as EventListener);
  return {
    read: state.read,
    reset,
    dispose() {
      reset();
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("keyup", keyup);
      window.removeEventListener("blur", reset);
      document.removeEventListener("visibilitychange", visibility);
      joystick.removeEventListener("pointerdown", down);
      joystick.removeEventListener("pointermove", move);
      for (const event of ["pointerup", "pointercancel", "lostpointercapture"])
        joystick.removeEventListener(event, release as EventListener);
    },
  };
}
