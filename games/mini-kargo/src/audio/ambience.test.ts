import { describe, it, expect, beforeEach, vi } from "vitest";
import { createAmbience } from "./ambience";

describe("ambience sound system", () => {
  let mockContext: any;

  beforeEach(() => {
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
    }

    mockContext = new MockAudioContext();
  });

  it("initializes ambience and switches districts cleanly", () => {
    const ambience = createAmbience(() => mockContext);
    expect(ambience).toBeDefined();

    ambience.setDistrict("coastal");
    ambience.update(1.0);

    ambience.setDistrict("industrial");
    ambience.update(1.0);

    ambience.setDistrict("market");
    ambience.update(1.0);

    ambience.setDistrict("sunny");
    ambience.update(1.0);

    ambience.setRainIntensity(0.8);
    ambience.update(1.0);
    ambience.setRainIntensity(0.0);

    ambience.setEnabled(false);
    ambience.setPaused(true);
    ambience.setEnabled(true);
    ambience.setPaused(false);

    ambience.dispose();
  });

  it("handles null audio context gracefully", () => {
    const ambience = createAmbience(() => null);
    expect(() => {
      ambience.setDistrict("coastal");
      ambience.update(5.0);
      ambience.setEnabled(false);
      ambience.dispose();
    }).not.toThrow();
  });
});
