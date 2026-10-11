import type { Vec2, Rect } from "./types";

export type CircleCollider = {
  offset: number; // Aracın merkezinden ileri (+) veya geri (-) yerel mesafe
  radius: number;
};

/**
 * 1.25m genişlik, 2.10m uzunluktaki araç gövdesi için 3 daireli kapsül modeli.
 * Ön ve arka tamponlara ve tekerlek köşelerine tam oturur.
 */
export const DEFAULT_VEHICLE_COLLIDERS: CircleCollider[] = [
  { offset: 0.52, radius: 0.58 }, // Ön tekerlek / tampon bölgesi
  { offset: 0.0, radius: 0.58 },  // Orta gövde
  { offset: -0.52, radius: 0.58 }, // Arka tekerlek / tampon bölgesi
];

export type CollisionOptions = {
  radius?: number;
  heading?: number;
  velocity?: Vec2;
  restitution?: number;
  friction?: number;
  colliders?: CircleCollider[];
};

export type CollisionContact = {
  id: string;
  normal: Vec2; // Engelden dışarı doğru birim vektör
  depth: number;
};

export type CollisionResult = {
  position: Vec2;
  velocity: Vec2;
  collided: boolean;
  normals: Vec2[];
  contacts: CollisionContact[];
};

/**
 * Verilen bir AABB (Rect) ve daire merkezi için en yakın noktayı,
 * penetrasyon derinliğini ve dışarı doğru normal vektörünü hesaplar.
 */
export function testCircleVsRect(
  cx: number,
  cz: number,
  radius: number,
  rect: Rect,
): { hit: boolean; normal: Vec2; depth: number } {
  const nx = Math.max(rect.minX, Math.min(rect.maxX, cx));
  const nz = Math.max(rect.minZ, Math.min(rect.maxZ, cz));
  const dx = cx - nx;
  const dz = cz - nz;
  const distSq = dx * dx + dz * dz;

  if (distSq > 1e-12) {
    if (distSq >= radius * radius) {
      return { hit: false, normal: { x: 0, z: 0 }, depth: 0 };
    }
    const dist = Math.sqrt(distSq);
    return {
      hit: true,
      normal: { x: dx / dist, z: dz / dist },
      depth: radius - dist,
    };
  }

  // Daire merkezi kutunun tam içindeyse en yakın kenardan dışarı it
  const left = cx - rect.minX;
  const right = rect.maxX - cx;
  const bottom = cz - rect.minZ;
  const top = rect.maxZ - cz;
  const minDist = Math.min(left, right, bottom, top);

  if (minDist === left) {
    return { hit: true, normal: { x: -1, z: 0 }, depth: radius + left };
  }
  if (minDist === right) {
    return { hit: true, normal: { x: 1, z: 0 }, depth: radius + right };
  }
  if (minDist === bottom) {
    return { hit: true, normal: { x: 0, z: -1 }, depth: radius + bottom };
  }
  return { hit: true, normal: { x: 0, z: 1 }, depth: radius + top };
}

/**
 * Gelişmiş çarpışma çözücü:
 * - Çoklu daire kapsül geometrisi (heading destekli)
 * - Yüksek hızda tünellemeyi engelleyen sub-stepping
 * - Teğet kayma (wall sliding) ve hafif sekme (restitution) hız tepkisi
 */
export function resolveCollision(
  previous: Vec2,
  proposed: Vec2,
  obstacles: Rect[],
  bounds: Rect,
  options: CollisionOptions = {},
): CollisionResult {
  const restitution = options.restitution ?? 0.2;
  const friction = options.friction ?? 0.92;
  let currentVelocity = options.velocity ? { ...options.velocity } : { x: 0, z: 0 };

  const hasHeading = options.heading !== undefined;
  const heading = options.heading ?? 0;
  const colliders: CircleCollider[] = hasHeading
    ? (options.colliders ?? DEFAULT_VEHICLE_COLLIDERS)
    : [{ offset: 0, radius: options.radius ?? 0.65 }];

  const minRadius = Math.min(...colliders.map((c) => c.radius));
  const totalDx = proposed.x - previous.x;
  const totalDz = proposed.z - previous.z;

  // Sub-step sayısı: yüksek hızda tünellemeyi önler
  const count = Math.max(
    1,
    Math.ceil(Math.max(Math.abs(totalDx), Math.abs(totalDz)) / (minRadius * 0.35)),
  );

  let currentX = previous.x;
  let currentZ = previous.z;
  const subDx = totalDx / count;
  const subDz = totalDz / count;

  const sinH = Math.sin(heading);
  const cosH = Math.cos(heading);

  const accumulatedContacts: CollisionContact[] = [];
  const accumulatedNormals: Vec2[] = [];
  let everCollided = false;

  // Dairelerin herhangi bir engele veya sınıra değip değmediğini kontrol eden yardımcı
  function getOverlap(px: number, pz: number) {
    let maxPushX = 0;
    let maxPushZ = 0;
    let hit = false;

    for (const col of colliders) {
      const cx = px + col.offset * sinH;
      const cz = pz + col.offset * cosH;

      // Sınırlar (Bounds)
      if (cx < bounds.minX + col.radius) {
        const depth = bounds.minX + col.radius - cx;
        if (depth > maxPushX) maxPushX = depth;
        accumulatedContacts.push({ id: "boundary:left", normal: { x: 1, z: 0 }, depth });
        accumulatedNormals.push({ x: 1, z: 0 });
        hit = true;
      } else if (cx > bounds.maxX - col.radius) {
        const depth = cx - (bounds.maxX - col.radius);
        if (-depth < maxPushX) maxPushX = -depth;
        accumulatedContacts.push({ id: "boundary:right", normal: { x: -1, z: 0 }, depth });
        accumulatedNormals.push({ x: -1, z: 0 });
        hit = true;
      }

      if (cz < bounds.minZ + col.radius) {
        const depth = bounds.minZ + col.radius - cz;
        if (depth > maxPushZ) maxPushZ = depth;
        accumulatedContacts.push({ id: "boundary:top", normal: { x: 0, z: 1 }, depth });
        accumulatedNormals.push({ x: 0, z: 1 });
        hit = true;
      } else if (cz > bounds.maxZ - col.radius) {
        const depth = cz - (bounds.maxZ - col.radius);
        if (-depth < maxPushZ) maxPushZ = -depth;
        accumulatedContacts.push({ id: "boundary:bottom", normal: { x: 0, z: -1 }, depth });
        accumulatedNormals.push({ x: 0, z: -1 });
        hit = true;
      }

      // Engeller (Obstacles)
      for (let oIdx = 0; oIdx < obstacles.length; oIdx++) {
        const rect = obstacles[oIdx];
        if (
          cx + col.radius < rect.minX ||
          cx - col.radius > rect.maxX ||
          cz + col.radius < rect.minZ ||
          cz - col.radius > rect.maxZ
        ) {
          continue;
        }
        const test = testCircleVsRect(cx, cz, col.radius, rect);
        if (test.hit) {
          const px = test.normal.x * test.depth;
          const pz = test.normal.z * test.depth;
          if (Math.abs(px) > Math.abs(maxPushX)) maxPushX = px;
          if (Math.abs(pz) > Math.abs(maxPushZ)) maxPushZ = pz;
          accumulatedContacts.push({
            id: `obstacle:${oIdx}`,
            normal: test.normal,
            depth: test.depth,
          });
          accumulatedNormals.push(test.normal);
          hit = true;
        }
      }
    }

    return { hit, pushX: maxPushX, pushZ: maxPushZ };
  }

  // İlk konumda zaten bir örtüşme varsa dışarı it (örn. dönüş sebebiyle köşeler takıldıysa)
  const initialOverlap = getOverlap(currentX, currentZ);
  if (initialOverlap.hit) {
    everCollided = true;
    currentX += initialOverlap.pushX;
    currentZ += initialOverlap.pushZ;
  }

  // Sub-step döngüsü: her adımda X ve Z eksenlerinde teğet kaymayı (sliding) koruyarak ilerle
  for (let step = 0; step < count; step++) {
    // 1. X ekseninde dene
    const candX = currentX + subDx;
    const testX = getOverlap(candX, currentZ);
    if (!testX.hit) {
      currentX = candX;
    } else {
      everCollided = true;
      currentX = candX + testX.pushX;
    }

    // 2. Z ekseninde dene
    const candZ = currentZ + subDz;
    const testZ = getOverlap(currentX, candZ);
    if (!testZ.hit) {
      currentZ = candZ;
    } else {
      everCollided = true;
      currentZ = candZ + testZ.pushZ;
    }
  }

  // Son kalan küçük penetrasyonlar için kısa gevşetme (relaxation)
  for (let r = 0; r < 2; r++) {
    const finalOverlap = getOverlap(currentX, currentZ);
    if (finalOverlap.hit) {
      everCollided = true;
      currentX += finalOverlap.pushX;
      currentZ += finalOverlap.pushZ;
    } else {
      break;
    }
  }

  // Hız yansıması ve teğet kayma (velocity response):
  if (everCollided && options.velocity) {
    const uniqueNormals: Vec2[] = [];
    for (const n of accumulatedNormals) {
      const exists = uniqueNormals.some(
        (un) => Math.hypot(un.x - n.x, un.z - n.z) < 0.2,
      );
      if (!exists) uniqueNormals.push(n);
    }

    for (const n of uniqueNormals) {
      const vn = currentVelocity.x * n.x + currentVelocity.z * n.z;
      if (vn < 0) {
        // vn < 0: Araç yüzeye doğru hareket ediyor
        const vPerpX = vn * n.x;
        const vPerpZ = vn * n.z;
        const vParX = currentVelocity.x - vPerpX;
        const vParZ = currentVelocity.z - vPerpZ;

        // Teğet hız sürtünme kaybıyla korunur, dik hız hafifçe seker
        currentVelocity.x = vParX * friction - restitution * vPerpX;
        currentVelocity.z = vParZ * friction - restitution * vPerpZ;
      }
    }
  }

  return {
    position: { x: currentX, z: currentZ },
    velocity: currentVelocity,
    collided: everCollided,
    normals: accumulatedNormals,
    contacts: accumulatedContacts,
  };
}

/**
 * Geriye dönük uyumlu hareket çözücü fonksiyonu.
 */
export function resolveMovement(
  previous: Vec2,
  proposed: Vec2,
  radiusOrOptions: number | CollisionOptions,
  obstacles: Rect[],
  bounds: Rect,
  heading?: number,
): Vec2 {
  const options: CollisionOptions =
    typeof radiusOrOptions === "number"
      ? { radius: radiusOrOptions, heading }
      : { ...radiusOrOptions, heading: heading ?? radiusOrOptions.heading };

  const result = resolveCollision(previous, proposed, obstacles, bounds, options);
  return result.position;
}
