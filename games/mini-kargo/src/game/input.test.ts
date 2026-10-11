import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { createInput, createInputState, type InputController } from "./input";
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
    expect(input.read()).toEqual({ x: 1, z: 0 });
  });
  it("keeps the floating touch origin and follows the active pointer", () => {
    down(joystick, { clientX: 300, clientY: 300 });
    expect(joystick.style.left).toBe("250px");
    expect(joystick.style.top).toBe("250px");
    expect(input.read()).toEqual(zero);
    move({ clientX: 332, clientY: 300, pointerId: 2 });
    expect(input.read()).toEqual(zero);
    move({ clientX: 332, clientY: 300 });
    expect(input.read()).toEqual({ x: 1, z: 0 });
    down(joystick, { clientX: 100, pointerId: 2 });
    expect(input.read()).toEqual({ x: 1, z: 0 });
  });
  it.each([".toolbar", ".sheet"])("ignores touch interactions inside %s", selector => {
    const container = new InputElement(selector), button = new InputElement("button");
    button.parent = container;
    down(button);
    move();
    expect(input.read()).toEqual(zero);
    expect(joystick.classes.has("active")).toBe(false);
  });
  it.each(["welcome", "result"])("ignores joystick presses while the %s sheet is open", () => {
    sheet = new InputElement(".sheet");
    down(knob, { pointerType: "mouse" });
    down(joystick);
    move();
    expect(input.read()).toEqual(zero);
    expect(joystick.classes.has("active")).toBe(false);
    sheet.hidden = true;
    down(joystick, { pointerType: "mouse" });
    expect(input.read()).toEqual({ x: 1, z: 0 });
  });
  it.each(["pointerup", "pointercancel", "lostpointercapture"])("resets on %s and accepts a new pointer", type => {
    down(joystick, { pointerType: "mouse" });
    joystick.dispatchEvent(pointerEvent(type, joystick, { pointerId: 2 }));
    expect(input.read()).toEqual({ x: 1, z: 0 });
    joystick.dispatchEvent(pointerEvent(type, joystick));
    expect(input.read()).toEqual(zero);
    expect(knob.style.transform).toBe("");
    expect(joystick.classes.has("active")).toBe(false);
    move();
    expect(input.read()).toEqual(zero);
    down(joystick, { pointerType: "mouse", pointerId: 2 });
    expect(input.read()).toEqual({ x: 1, z: 0 });
  });
  it.each(["blur", "visibilitychange"])("clears keyboard and pointer input on %s", type => {
    key("keydown", "w");
    down(joystick, { pointerType: "mouse" });
    if (type === "blur") win.dispatchEvent(new Event(type));
    else { doc.hidden = true; doc.dispatchEvent(new Event(type)); }
    expect(input.read()).toEqual(zero);
    expect(joystick.captured).toBeNull();
    move();
    key("keyup", "unrelated");
    expect(input.read()).toEqual(zero);
  });
  it("clears the active pointer and restores CSS positioning after resize", () => {
    down(joystick, { clientX: 700, clientY: 500 });
    move({ clientX: 732, clientY: 500 });
    expect(input.read()).toEqual({ x: 1, z: 0 });
    vi.stubGlobal("innerWidth", 320);
    vi.stubGlobal("innerHeight", 240);
    win.dispatchEvent(new Event("resize"));
    expect(input.read()).toEqual(zero);
    expect(joystick.captured).toBeNull();
    expect(joystick.style).toMatchObject({ left: "", top: "", bottom: "" });
    expect(knob.style.transform).toBe("");
    move();
    expect(input.read()).toEqual(zero);
    down(joystick, { clientX: 160, clientY: 120, pointerId: 2 });
    move({ clientX: 192, clientY: 120, pointerId: 2 });
    expect(input.read()).toEqual({ x: 1, z: 0 });
  });
  it("preserves WASD and arrow key controls and ignores focused buttons", () => {
    key("keydown", "w", new InputElement("button"));
    expect(input.read()).toEqual(zero);
    key("keydown", "W");
    expect(input.read()).toEqual({ x: 0, z: -1 });
    key("keydown", "ArrowRight");
    expect(Math.hypot(input.read().x, input.read().z)).toBeCloseTo(1);
    key("keyup", "w");
    expect(input.read()).toEqual({ x: 1, z: 0 });
    key("keyup", "ArrowRight");
    expect(input.read()).toEqual(zero);
  });
  it("removes event handlers on disposal", () => {
    input.dispose();
    down(joystick, { pointerType: "mouse" });
    key("keydown", "w");
    expect(input.read()).toEqual(zero);
  });
});
