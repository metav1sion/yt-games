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
    sound.jumpLaunch();
    sound.jumpLanding(1.5);
    sound.cleanDriveBonus();
    sound.comboFanfare(2);
    sound.comboFanfare(3);
    sound.comboFanfare(5);
    sound.seagullCry();
    sound.pigeonScatter();
    sound.catMeow();
    sound.dogBark();
    sound.leafCrunch();
    sound.surfCrash(0.8);
    sound.weldingArc(0.9);
    sound.packageDrop();
    sound.courierBeep();
    sound.puddleSplash(6.5);
    sound.customerTip();
    sound.chargerHum(0.5);
    sound.chargeComplete();
    sound.streetSnack();
    sound.fuelPump();
    sound.carWash();
    sound.railCrossing();
    sound.trainHorn();
    sound.windChime();
    sound.fishSizzle(0.9);
    sound.wrenchClick(1.0);
    sound.soupLadle(1.0);
    sound.schoolBell(1.0);
    sound.woodOven(1.0);
    sound.setDistrict("coastal");
    sound.setRadioStation("cozy_chill");
    expect(sound.getRadioStation()).toBe("cozy_chill");
    expect(sound.getRadioStationInfo().name).toBe("Sakin Lo-Fi");
    expect(sound.cycleRadioStation()).toBe("arcade_turbo");
    sound.duckRadio(0.3, 1.0);
    sound.updateAmbience(1.0);
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
      sound.jumpLaunch();
      sound.jumpLanding(2.0);
      sound.seagullCry();
      sound.pigeonScatter();
      sound.catMeow();
      sound.dogBark();
      sound.leafCrunch();
      sound.surfCrash(1.0);
      sound.weldingArc(0.7);
      sound.packageDrop();
      sound.courierBeep();
      sound.puddleSplash(8.0);
      sound.customerTip();
      sound.chargerHum(0.7);
      sound.chargeComplete();
      sound.streetSnack();
      sound.fuelPump();
      sound.carWash();
      sound.constructionDrill();
      sound.teaSpoonClink();
      sound.fishingReel();
      sound.thunderRoll(1.2);
      sound.carnivalChime();
      sound.tramBell();
      sound.railCrossing();
      sound.trainHorn();
      sound.fishSizzle(1.0);
      sound.wrenchClick(1.0);
      sound.diceRoll(1.0);
      sound.iceCreamBell(1.0);
      sound.soupLadle(1.0);
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

  it("plays shop door bell chime without throwing", async () => {
    const sound = createSound();
    await sound.unlock();

    expect(() => {
      sound.shopBell(1.0);
      sound.shopBell(0.5);
    }).not.toThrow();

    sound.dispose();
  });

  it("plays backgammon dice roll sound without throwing", async () => {
    const sound = createSound();
    await sound.unlock();

    expect(() => {
      sound.diceRoll(1.0);
      sound.diceRoll(0.5);
    }).not.toThrow();

    sound.dispose();
  });
});
