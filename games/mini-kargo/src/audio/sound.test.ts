import { describe, it, expect, beforeEach, vi } from "vitest";
import { createSound } from "./sound";

describe("audio system", () => {
  beforeEach(() => {
    // Web Audio API mock
    const createMockAudioNode = () => ({
      connect: vi.fn(),
      disconnect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
      setTargetAtTime: vi.fn(),
    });

    const createMockParam = (initial = 0) => ({
      value: initial,
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
      setTargetAtTime: vi.fn(),
    });

    class MockAudioContext {
      state = "running";
      currentTime = 0;
      sampleRate = 44100;
      destination = createMockAudioNode();

      createGain() {
        return {
          ...createMockAudioNode(),
          gain: createMockParam(1),
        };
      }

      createOscillator() {
        return {
          ...createMockAudioNode(),
          frequency: createMockParam(440),
          type: "sine",
        };
      }

      createBiquadFilter() {
        return {
          ...createMockAudioNode(),
          frequency: createMockParam(350),
          Q: createMockParam(1),
          type: "lowpass",
        };
      }

      createBuffer(channels: number, length: number) {
        return {
          length,
          numberOfChannels: channels,
          getChannelData: () => new Float32Array(length),
        };
      }

      createBufferSource() {
        return {
          ...createMockAudioNode(),
          buffer: null,
          loop: false,
        };
      }

      resume = vi.fn().mockResolvedValue(undefined);
      suspend = vi.fn().mockResolvedValue(undefined);
      close = vi.fn().mockResolvedValue(undefined);
    }

    vi.stubGlobal("AudioContext", MockAudioContext);
  });

  it("initializes without throwing errors", () => {
    const sound = createSound();
    expect(sound).toBeDefined();
    sound.pickup();
    sound.delivery();
    sound.collision();
    sound.playMoneyDrain();
    sound.playUnlockJingle();
    sound.setEnabled(false);
    sound.setPaused(true);
    sound.dispose();
  });

  it("plays money drain and unlock jingle when unlocked and running", async () => {
    const sound = createSound();
    await sound.unlock();

    expect(() => {
      sound.playMoneyDrain();
      sound.playUnlockJingle();
      sound.carHorn();
      sound.metalCrash();
    }).not.toThrow();

    sound.dispose();
  });

  it("unlocks and initializes synthesized motor and drift nodes", async () => {
    const sound = createSound();
    await sound.unlock();

    // Rölanti durumu
    sound.updateMotor(0, 0, false, false);

    // Tam gaz ileri sürüş
    sound.updateMotor(14, 1.0, false, false);

    // Nitro aktif sürüş
    sound.updateMotor(20, 1.0, true, false);

    // Drift durumu
    sound.updateMotor(12, 0.8, false, true);

    sound.dispose();
  });

  it("gracefully silences sounds when disabled or paused", async () => {
    const sound = createSound();
    await sound.unlock();

    sound.setEnabled(false);
    sound.updateMotor(14, 1.0, true, true);

    sound.setPaused(true);
    sound.setPaused(false);
    sound.setEnabled(true);

    sound.dispose();
  });
});
