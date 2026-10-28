import { describe, it, expect, vi } from "vitest";
import * as THREE from "three";
import { createEnvironmentalFX, type EnvironmentalFXSound } from "./environmental-fx";

describe("environmental-fx system (T26)", () => {
  it("initializes with 4 leaf piles, welding workshop and particle system", () => {
    const fx = createEnvironmentalFX();
    expect(fx.group).toBeDefined();
    expect(fx.group.name).toBe("environmental-fx");

    const stats = fx.getStats();
    expect(stats.leafPilesCount).toBe(4);
    expect(stats.activeLeafPiles).toBe(4);
    expect(stats.welderState).toBe("welding");
    expect(stats.activeParticles).toBe(0);

    fx.dispose();
  });

  it("triggers leaf pile explosion and sound when player drives through it", () => {
    const soundMock: EnvironmentalFXSound = {
      leafCrunch: vi.fn(),
      surfCrash: vi.fn(),
      weldingArc: vi.fn(),
    };

    const fx = createEnvironmentalFX(soundMock);

    // İlk test: Oyuncu uzakta (-10, -10), hız normal
    const idleResult = fx.update(0.1, { x: -10, z: -10 }, 5.0, false);
    expect(idleResult.leafPileTriggered).toBe(false);
    expect(soundMock.leafCrunch).not.toHaveBeenCalled();

    // İkinci test: Oyuncu ilk yaprak yığınına ulaştı (-76, -72), hız 6.0
    const hitResult = fx.update(0.1, { x: -76, z: -72 }, 6.0, false);
    expect(hitResult.leafPileTriggered).toBe(true);
    expect(hitResult.bonusReward).toBe(5);
    expect(hitResult.bonusMessage).toContain("SONBAHAR");
    expect(soundMock.leafCrunch).toHaveBeenCalledTimes(1);

    const stats = fx.getStats();
    expect(stats.activeLeafPiles).toBe(3);
    expect(stats.activeParticles).toBeGreaterThan(0);

    // Üçüncü test: Aynı yığından hemen tekrar geçildiğinde tekrar patlamaz
    const doubleHit = fx.update(0.1, { x: -76, z: -72 }, 6.0, false);
    expect(doubleHit.leafPileTriggered).toBe(false);

    fx.dispose();
  });

  it("triggers coastal wave spray and surf sound near breakwater rocks", () => {
    const soundMock: EnvironmentalFXSound = {
      leafCrunch: vi.fn(),
      surfCrash: vi.fn(),
      weldingArc: vi.fn(),
    };

    const fx = createEnvironmentalFX(soundMock);

    // Oyuncu fener dalgakıran kayalıklarına yakın (-26, 90)
    // 3.6 saniye simüle edilerek dalga döngüsü tetiklenir
    for (let t = 0; t < 38; t++) {
      fx.update(0.1, { x: -26, z: 90 }, 4.0, false);
    }

    expect(soundMock.surfCrash).toHaveBeenCalled();
    fx.dispose();
  });

  it("flickers welding arc, shoots sparks and plays welding audio near Sanayi workshop", () => {
    const soundMock: EnvironmentalFXSound = {
      leafCrunch: vi.fn(),
      surfCrash: vi.fn(),
      weldingArc: vi.fn(),
    };

    const fx = createEnvironmentalFX(soundMock);

    // Oyuncu sanayi kaynak atölyesine yakın (35, -25)
    for (let t = 0; t < 15; t++) {
      fx.update(0.06, { x: 35, z: -25 }, 2.0, false);
    }

    expect(soundMock.weldingArc).toHaveBeenCalled();
    const stats = fx.getStats();
    expect(stats.activeParticles).toBeGreaterThan(0);

    fx.dispose();
  });

  it("disposes scene objects and geometry without throwing", () => {
    const fx = createEnvironmentalFX();
    expect(() => fx.dispose()).not.toThrow();
  });
});
