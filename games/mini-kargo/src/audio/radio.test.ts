import { describe, it, expect, beforeEach, vi } from "vitest";
import { createRadio, RADIO_STATIONS, type StationId } from "./radio";

describe("procedural radio system", () => {
  let mockContext: any;

  beforeEach(() => {
    const createMockAudioNode = () => ({
      connect: vi.fn(),
      disconnect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
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

  it("initializes in off state with valid station metadata", () => {
    const radio = createRadio(() => mockContext);
    expect(radio.getStation()).toBe("off");
    const info = radio.getStationInfo();
    expect(info.name).toBe("Radyo Kapalı");
    expect(info.bpm).toBe(0);
    expect(RADIO_STATIONS.length).toBe(4);
  });

  it("cycles through all stations in correct order and loops back", () => {
    const radio = createRadio(() => mockContext);
    expect(radio.getStation()).toBe("off");

    const st1 = radio.cycleStation();
    expect(st1).toBe("cozy_chill");
    expect(radio.getStationInfo(st1).name).toBe("Sakin Lo-Fi");

    const st2 = radio.cycleStation();
    expect(st2).toBe("arcade_turbo");
    expect(radio.getStationInfo(st2).name).toBe("Turbo FM");

    const st3 = radio.cycleStation();
    expect(st3).toBe("city_vibes");
    expect(radio.getStationInfo(st3).name).toBe("Şehir Vibes");

    const st4 = radio.cycleStation();
    expect(st4).toBe("off");
  });

  it("synthesizes music steps during update ticks without throwing", () => {
    const radio = createRadio(() => mockContext);

    // Test Cozy Chill
    radio.setStation("cozy_chill");
    for (let i = 0; i < 20; i++) {
      mockContext.currentTime += 0.2;
      radio.update(0.2);
    }

    // Test Arcade Turbo
    radio.setStation("arcade_turbo");
    for (let i = 0; i < 20; i++) {
      mockContext.currentTime += 0.15;
      radio.update(0.15);
    }

    // Test City Vibes
    radio.setStation("city_vibes");
    for (let i = 0; i < 20; i++) {
      mockContext.currentTime += 0.15;
      radio.update(0.15);
    }

    expect(radio.getStation()).toBe("city_vibes");
  });

  it("handles audio ducking and recovery gracefully", () => {
    const radio = createRadio(() => mockContext);
    radio.setStation("arcade_turbo");
    radio.update(0.1);

    radio.duck(0.3, 1.0);
    radio.update(0.5);
    radio.update(0.6); // Should recover after 1.0s

    expect(radio.getStation()).toBe("arcade_turbo");
  });

  it("respects muting, pausing and null-context safety", () => {
    const nullRadio = createRadio(() => null);
    expect(nullRadio.getStation()).toBe("off");
    nullRadio.cycleStation();
    nullRadio.update(1.0);
    nullRadio.duck();
    nullRadio.dispose();

    const radio = createRadio(() => mockContext);
    radio.setStation("cozy_chill");
    radio.setEnabled(false);
    radio.update(0.5);
    radio.setEnabled(true);
    radio.setPaused(true);
    radio.update(0.5);
    radio.setPaused(false);
    radio.dispose();

    expect(radio.getStation()).toBe("off");
  });
});
