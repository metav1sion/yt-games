import { describe, it, expect } from "vitest";
import { resolveMovement, resolveCollision } from "./collision";

const bounds = { minX: -10, maxX: 10, minZ: -10, maxZ: 10 };
const wall = { minX: 2, maxX: 4, minZ: -2, maxZ: 2 };

describe("collision resolution", () => {
  it("buildingBlocksMovement", () => {
    const p = resolveMovement(
      { x: 0, z: 0 },
      { x: 3, z: 0 },
      0.65,
      [wall],
      bounds,
    );
    expect(p.x).toBeLessThanOrEqual(1.35);
  });

  it("wallAllowsSliding", () => {
    const p = resolveMovement(
      { x: 1.3, z: 0 },
      { x: 2, z: 1 },
      0.65,
      [wall],
      bounds,
    );
    expect(p.x).toBeLessThanOrEqual(1.35);
    expect(p.z).toBeCloseTo(1);
  });

  it("boundsContainVehicle", () => {
    expect(
      resolveMovement({ x: 9, z: 0 }, { x: 13, z: 12 }, 0.65, [], bounds),
    ).toEqual({ x: 9.35, z: 9.35 });
  });

  it("fastMovementCannotCrossBuilding", () => {
    const p = resolveMovement(
      { x: 0, z: 0 },
      { x: 8, z: 0 },
      0.65,
      [wall],
      bounds,
    );
    expect(p.x).toBeLessThanOrEqual(1.35);
  });

  it("headOnCollisionDoesNotPenetrateAndBouncesBack", () => {
    const result = resolveCollision(
      { x: 0.5, z: 0 },
      { x: 2.2, z: 0 },
      [wall],
      bounds,
      {
        heading: Math.PI / 2, // Pozitif X yönüne bakıyor
        velocity: { x: 14, z: 0 },
        restitution: 0.2,
      },
    );

    // Duvar 2.0'da başlıyor; ön daire offset (0.52) + radius (0.58) = 1.10.
    // Dolayısıyla araç merkezi <= 2.0 - 1.10 = 0.90 olmalı.
    expect(result.position.x).toBeLessThanOrEqual(0.95);
    // Hız ters yönde sekme almalı (-14 * 0.2 = -2.8)
    expect(result.velocity.x).toBeLessThan(0);
    expect(result.velocity.x).toBeCloseTo(-2.8, 1);
    expect(result.collided).toBe(true);
  });

  it("angledCollisionConservesParallelVelocityWhileBouncingPerpendicularly", () => {
    const result = resolveCollision(
      { x: 0.5, z: 0 },
      { x: 2.0, z: 1.5 },
      [wall],
      bounds,
      {
        heading: 0, // Z yönüne bakıyor
        velocity: { x: 10, z: 10 },
        restitution: 0.2,
        friction: 0.92,
      },
    );

    // X ekseninde duvara batmamalı
    expect(result.position.x).toBeLessThanOrEqual(1.45);
    // Z ekseninde kaymaya devam etmeli
    expect(result.position.z).toBeGreaterThan(0.5);
    // X ekseninde sekme almalı
    expect(result.velocity.x).toBeLessThan(0);
    // Z eksenindeki paralel hız sürtünme kaybıyla korunmalı
    expect(result.velocity.z).toBeGreaterThan(8.5);
    expect(result.collided).toBe(true);
  });

  it("turningNoseOrTailIntoObstaclePushesVehicleOut", () => {
    // Araç X=1.35'te duruyor, heading 0 iken serbest (offset z yönünde).
    // Ancak araç sağa doğru dönerse (heading = PI/2) ön burun X=1.35 + 0.52 + 0.58 = 2.45'e uzanır.
    // Bu da X=2'deki duvarın içine batma demek olur. Çözücü aracı geriye itmelidir.
    const result = resolveCollision(
      { x: 1.35, z: 0 },
      { x: 1.35, z: 0 },
      [wall],
      bounds,
      {
        heading: Math.PI / 2, // Burnunu duvara çevirdi
        velocity: { x: 0, z: 0 },
      },
    );

    // Araç duvardan geriye itilmiş olmalı
    expect(result.position.x).toBeLessThanOrEqual(0.95);
    expect(result.collided).toBe(true);
  });

  it("boundsAndObstaclesBehaveConsistently", () => {
    // 1. Obstacle'a dik çarpma
    const obstacleResult = resolveCollision(
      { x: 0.5, z: 0 },
      { x: 2.2, z: 0 },
      [wall],
      bounds,
      {
        velocity: { x: 12, z: 0 },
        radius: 0.65,
        restitution: 0.2,
      },
    );

    // 2. Sağ sınıra dik çarpma (bounds.maxX = 10)
    const boundsResult = resolveCollision(
      { x: 8.5, z: 0 },
      { x: 10.5, z: 0 },
      [],
      bounds,
      {
        velocity: { x: 12, z: 0 },
        radius: 0.65,
        restitution: 0.2,
      },
    );

    // Her ikisi de duvardan dışarıda durur
    expect(obstacleResult.position.x).toBeLessThanOrEqual(1.35);
    expect(boundsResult.position.x).toBeLessThanOrEqual(9.35);

    // Her ikisi de aynı fiziksel sekme tepkisini verir (-12 * 0.2 = -2.4)
    expect(obstacleResult.velocity.x).toBeCloseTo(-2.4, 1);
    expect(boundsResult.velocity.x).toBeCloseTo(-2.4, 1);
  });

  it("highSpeedMovementDoesNotTunnelThroughWall", () => {
    // İnce duvar: minX: 2, maxX: 3, Z aralığı: -5..5
    const thinWall = { minX: 2, maxX: 3, minZ: -5, maxZ: 5 };
    // Tek bir adımda 20 birim/sn hızla duvarın arkasına geçmeye çalışan hareket
    const result = resolveCollision(
      { x: -1, z: 0 },
      { x: 8, z: 0 },
      [thinWall],
      bounds,
      {
        heading: Math.PI / 2,
        velocity: { x: 20, z: 0 },
        restitution: 0.2,
      },
    );

    // Duvarın önünde kalmalı, arkasına geçememeli
    expect(result.position.x).toBeLessThanOrEqual(0.95);
    expect(result.velocity.x).toBeLessThan(0);
    expect(result.collided).toBe(true);
  });
});
