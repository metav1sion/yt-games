import { describe, it, expect } from 'vitest';
import { createInputState } from './input';
describe('direction input', () => {
  it('normalizesDiagonalInput', () => { const input = createInputState(); input.set({x:1,z:1}); expect(Math.hypot(input.read().x,input.read().z)).toBeCloseTo(1); });
  it('resetClearsHeldDirection', () => { const input = createInputState(); input.set({x:1,z:0}); expect(input.read().x).toBe(1); input.reset(); expect(input.read()).toEqual({x:0,z:0}); });
  it('preservesGentleJoystickInput', () => { const input=createInputState(); input.set({x:0.3,z:0}); expect(input.read()).toEqual({x:0.3,z:0}); });
});
