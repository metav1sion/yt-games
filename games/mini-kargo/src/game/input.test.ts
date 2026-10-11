import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import {
  createInput,
  createInputState,
  createKeyboardState,
  joystickToDrive,
  type InputController,
} from "./input";
describe("direction input", () => {
  it("normalizesDiagonalInput", () => {
    const input = createInputState();
    input.set({ x: 1, z: 1 });
    expect(Math.hypot(input.read().x, input.read().z)).toBeCloseTo(1);
  });
  it("resetClearsHeldDirection", () => {
    const input = createInputState();
    input.set({ x: 1, z: 0 });
    expect(input.read().x).toBe(1);
    input.reset();
    expect(input.read()).toEqual({ x: 0, z: 0 });
  });
  it("preservesGentleJoystickInput", () => {
    const input = createInputState();
    input.set({ x: 0.3, z: 0 });
    expect(input.read()).toEqual({ x: 0.3, z: 0 });
  });
});

// Small DOM/event fixture for the Node test runner; no browser is involved.
class InputElement extends EventTarget {
  style = { left: "", top: "", bottom: "", transform: "" };
  classes = new Set<string>();
  classList = {
    add: (name: string) => this.classes.add(name),
    remove: (name: string) => this.classes.delete(name),
  };
  parent: InputElement | null = null;
  children: InputElement[] = [];
  captured: number | null = null;
  hidden = false;
  constructor(readonly selector = "") { super(); }
  contains(target: unknown): boolean {
    return target === this || this.children.some(child => child.contains(target));
  }
  closest(selectors: string): InputElement | null {
    return selectors.split(",").map(value => value.trim()).includes(this.selector)
      ? this : this.parent?.closest(selectors) ?? null;
  }
  querySelector() { return this.children[0]; }
  getBoundingClientRect() {
    return { left: parseFloat(this.style.left) || 30,
      top: parseFloat(this.style.top) || 400, width: 100, height: 100 };
  }
  setPointerCapture(id: number) { this.captured = id; }
  hasPointerCapture(id: number) { return this.captured === id; }
  releasePointerCapture(id: number) {
    if (this.captured === id) {
      this.captured = null;
      this.dispatchEvent(pointerEvent("lostpointercapture", this, { pointerId: id }));
    }
  }
}
function pointerEvent(type: string, target: InputElement, values = {}) {
  const event = new Event(type, { cancelable: true });
  Object.defineProperties(event, Object.fromEntries(Object.entries({
    target, pointerId: 1, pointerType: "touch", clientX: 112, clientY: 450, ...values,
  }).map(([key, value]) => [key, { value }])));
  return event;
}

describe("input controller events", () => {
  let joystick: InputElement, knob: InputElement, ring: InputElement;
  let win: EventTarget, doc: EventTarget & { hidden: boolean; querySelector(): unknown };
  let input: InputController;
  let sheet: InputElement | null;
  const zero = { x: 0, z: 0 };
  function down(target = joystick, values = {}) {
    doc.dispatchEvent(pointerEvent("pointerdown", target, values));
  }
  function move(values = {}) {
    joystick.dispatchEvent(pointerEvent("pointermove", joystick, values));
  }
  function key(type: string, value: string, target = joystick) {
    const event = new Event(type, { cancelable: true });
    Object.defineProperties(event, { key: { value }, target: { value: target } });
    win.dispatchEvent(event);
  }
  beforeEach(() => {
    joystick = new InputElement();
    knob = new InputElement(".stick-knob");
    ring = new InputElement(".stick-ring");
    joystick.children = [knob, ring];
    knob.parent = ring.parent = joystick;
    win = new EventTarget();
    sheet = null;
    doc = Object.assign(new EventTarget(), {
      hidden: false, querySelector: () => sheet && !sheet.hidden ? sheet : null,
    });
    vi.stubGlobal("Element", InputElement);
    vi.stubGlobal("Node", InputElement);
    vi.stubGlobal("window", win);
    vi.stubGlobal("document", doc);
    vi.stubGlobal("innerWidth", 800);
    vi.stubGlobal("innerHeight", 600);
    input = createInput(joystick as unknown as HTMLElement);
  });
  afterEach(() => { input.dispose(); vi.unstubAllGlobals(); });

  it.each(["knob", "ring", "base"])("accepts mouse presses on the joystick %s", part => {
    down(part === "knob" ? knob : part === "ring" ? ring : joystick, { pointerType: "mouse" });
    expect(input.readJoystick()).toEqual({ x: 1, z: 0 });
  });
  it("keeps the floating touch origin and follows the active pointer", () => {
    down(joystick, { clientX: 300, clientY: 300 });
    expect(joystick.style.left).toBe("250px");
    expect(joystick.style.top).toBe("250px");
    expect(input.readJoystick()).toEqual(zero);
    move({ clientX: 332, clientY: 300, pointerId: 2 });
    expect(input.readJoystick()).toEqual(zero);
    move({ clientX: 332, clientY: 300 });
    expect(input.readJoystick()).toEqual({ x: 1, z: 0 });
    down(joystick, { clientX: 100, pointerId: 2 });
    expect(input.readJoystick()).toEqual({ x: 1, z: 0 });
  });
  it.each([".toolbar", ".sheet"])("ignores touch interactions inside %s", selector => {
    const container = new InputElement(selector), button = new InputElement("button");
    button.parent = container;
    down(button);
    move();
    expect(input.readJoystick()).toEqual(zero);
    expect(joystick.classes.has("active")).toBe(false);
  });
  it.each(["welcome", "result"])("ignores joystick presses while the %s sheet is open", () => {
    sheet = new InputElement(".sheet");
    down(knob, { pointerType: "mouse" });
    down(joystick);
    move();
    expect(input.readJoystick()).toEqual(zero);
    expect(joystick.classes.has("active")).toBe(false);
    sheet.hidden = true;
    down(joystick, { pointerType: "mouse" });
    expect(input.readJoystick()).toEqual({ x: 1, z: 0 });
  });
  it.each(["pointerup", "pointercancel", "lostpointercapture"])("resets on %s and accepts a new pointer", type => {
    down(joystick, { pointerType: "mouse" });
    joystick.dispatchEvent(pointerEvent(type, joystick, { pointerId: 2 }));
    expect(input.readJoystick()).toEqual({ x: 1, z: 0 });
    joystick.dispatchEvent(pointerEvent(type, joystick));
    expect(input.readJoystick()).toEqual(zero);
    expect(knob.style.transform).toBe("");
    expect(joystick.classes.has("active")).toBe(false);
    move();
    expect(input.readJoystick()).toEqual(zero);
    down(joystick, { pointerType: "mouse", pointerId: 2 });
    expect(input.readJoystick()).toEqual({ x: 1, z: 0 });
  });
  it.each(["blur", "visibilitychange"])("clears keyboard and pointer input on %s", type => {
    key("keydown", "w");
    key("keydown", " ");
    down(joystick, { pointerType: "mouse" });
    if (type === "blur") win.dispatchEvent(new Event(type));
    else { doc.hidden = true; doc.dispatchEvent(new Event(type)); }
    expect(input.readJoystick()).toEqual(zero);
    expect(input.read(0, 0, 1)).toEqual({ throttle: 0, steer: 0, handbrake: false, nitro: false });
    expect(joystick.captured).toBeNull();
    move();
    key("keyup", "unrelated");
    expect(input.readJoystick()).toEqual(zero);
  });
  it("clears the active pointer and restores CSS positioning after resize", () => {
    down(joystick, { clientX: 700, clientY: 500 });
    move({ clientX: 732, clientY: 500 });
    expect(input.readJoystick()).toEqual({ x: 1, z: 0 });
    vi.stubGlobal("innerWidth", 320);
    vi.stubGlobal("innerHeight", 240);
    win.dispatchEvent(new Event("resize"));
    expect(input.readJoystick()).toEqual(zero);
    expect(joystick.captured).toBeNull();
    expect(joystick.style).toMatchObject({ left: "", top: "", bottom: "" });
    expect(knob.style.transform).toBe("");
    move();
    expect(input.readJoystick()).toEqual(zero);
    down(joystick, { clientX: 160, clientY: 120, pointerId: 2 });
    move({ clientX: 192, clientY: 120, pointerId: 2 });
    expect(input.readJoystick()).toEqual({ x: 1, z: 0 });
  });
  it("maps WASD, arrows, Space and Shift to drive input", () => {
    key("keydown", "w", new InputElement("button"));
    expect(input.read(0, 0, 1).throttle).toBe(0);
    key("keydown", "W");
    expect(input.read(0, 0, 1).throttle).toBeCloseTo(1, 1);
    key("keydown", "ArrowRight");
    expect(input.read(0, 0, 1).steer).toBeCloseTo(1, 1);
    key("keydown", " ");
    key("keydown", "Shift");
    expect(input.read(0, 0, 1)).toMatchObject({ handbrake: true, nitro: true });
    key("keyup", " ");
    key("keyup", "Shift");
    expect(input.read(0, 0, 1)).toMatchObject({ handbrake: false, nitro: false });
  });
  it("lets the keyboard override the joystick", () => {
    down(joystick, { pointerType: "mouse" });
    expect(input.read(0, 0, 1 / 60).throttle).toBeGreaterThan(0);
    key("keydown", "s");
    expect(input.read(0, 0, 1).throttle).toBeLessThan(-0.9);
  });
  it("supports external nitro and handbrake and clears them on reset", () => {
    input.setNitro(true);
    input.setHandbrake(true);
    expect(input.read(0, 0, 1 / 60)).toMatchObject({ nitro: true, handbrake: true });
    input.reset();
    expect(input.read(0, 0, 1 / 60)).toMatchObject({ nitro: false, handbrake: false });
  });
  it("removes event handlers on disposal", () => {
    input.dispose();
    down(joystick, { pointerType: "mouse" });
    key("keydown", "w");
    expect(input.readJoystick()).toEqual(zero);
    expect(input.read(0, 0, 1).throttle).toBe(0);
  });
});

describe("joystickToDrive", () => {
  const deg = (d: number) => (d * Math.PI) / 180;
  it("drives straight with full throttle when joystick matches heading", () => {
    // heading 0 = ileri +z; ekranda aşağı
    const d = joystickToDrive({ x: 0, z: 1 }, 0, 5);
    expect(d.throttle).toBeCloseTo(1);
    expect(d.steer).toBeCloseTo(0);
  });
  it("steers toward the joystick side and scales throttle by magnitude", () => {
    const d = joystickToDrive({ x: 0.5, z: 0 }, 0, 5);
    expect(d.throttle).toBeCloseTo(0.5);
    expect(d.steer).toBe(-1); // +x, +z'ye bakan aracın solundadır
    expect(joystickToDrive({ x: -1, z: 0 }, 0, 5).steer).toBe(1);
  });
  it("gives gentle steering for small angle differences", () => {
    const d = joystickToDrive({ x: Math.sin(deg(10)), z: Math.cos(deg(10)) }, 0, 5);
    expect(Math.abs(d.steer)).toBeGreaterThan(0);
    expect(Math.abs(d.steer)).toBeLessThan(0.5);
  });
  it("uses gas with full steering for a slow U-turn instead of reversing", () => {
    const d = joystickToDrive({ x: 0, z: -1 }, 0, 0.5);
    expect(d.throttle).toBeGreaterThan(0);
    expect(Math.abs(d.steer)).toBe(1);
  });
  it("brakes instead of reversing when behind the car at speed", () => {
    const d = joystickToDrive({ x: 0, z: -1 }, 0, 8);
    expect(d.throttle).toBeLessThan(0);
    expect(Math.abs(d.steer)).toBe(1);
  });
  it("releases throttle when the joystick is released", () => {
    expect(joystickToDrive({ x: 0, z: 0 }, 1, 9)).toEqual({
      throttle: 0,
      steer: 0,
      handbrake: false,
      nitro: false,
    });
  });
});

describe("keyboard state", () => {
  it("maps keys and smooths toward the target", () => {
    const k = createKeyboardState();
    k.press("d");
    const first = k.step(1 / 60);
    expect(first.steer).toBeGreaterThan(0);
    expect(first.steer).toBeLessThan(1);
    expect(k.step(1).steer).toBe(1);
    k.press("S");
    expect(k.step(1).throttle).toBe(-1);
  });
  it("decays to zero after release and then becomes inactive", () => {
    const k = createKeyboardState();
    k.press("ArrowUp");
    k.press("ArrowLeft");
    k.step(1);
    k.release("ArrowLeft");
    const mid = k.step(1 / 60);
    expect(mid.steer).toBeLessThan(0);
    expect(mid.steer).toBeGreaterThan(-1);
    k.release("ArrowUp");
    expect(k.active()).toBe(true);
    for (let i = 0; i < 120; i++) k.step(1 / 60);
    expect(k.active()).toBe(false);
  });
  it("reset clears everything", () => {
    const k = createKeyboardState();
    k.press("w");
    k.press(" ");
    k.step(1);
    k.reset();
    expect(k.step(1 / 60)).toEqual({ throttle: 0, steer: 0, handbrake: false, nitro: false });
  });
});
