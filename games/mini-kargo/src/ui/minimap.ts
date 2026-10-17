import { SUNNY_ROADS, SUNNY_DEPOT, SUNNY_DEPOT_APRON } from "../scene/sunny-layout";
import type { Rect, Vec2 } from "../game/types";
import { districtById, type DistrictId } from "../game/districts";

export const DEFAULT_BOUNDS: Rect = {
  minX: -100,
  maxX: 100,
  minZ: -100,
  maxZ: 100,
};

/**
 * Dünya koordinatlarını (x, z) 2D canvas piksel koordinatlarına dönüştürür.
 * -X: Batı (Canvas Sol), +X: Doğu (Canvas Sağ)
 * -Z: Kuzey (Canvas Üst), +Z: Güney (Canvas Alt)
 */
export function worldToMinimap(
  x: number,
  z: number,
  canvasSize: number,
  bounds: Rect = DEFAULT_BOUNDS,
): { x: number; y: number } {
  const width = bounds.maxX - bounds.minX;
  const height = bounds.maxZ - bounds.minZ;
  const nx = (x - bounds.minX) / (width || 1);
  const nz = (z - bounds.minZ) / (height || 1);
  return {
    x: nx * canvasSize,
    y: nz * canvasSize,
  };
}

/**
 * Belirtilen bölgenin oyuncunun şirket seviyesine göre kilitli olup olmadığını kontrol eder.
 */
export function isDistrictLocked(
  districtId: DistrictId,
  companyLevel: number,
): boolean {
  const district = districtById(districtId);
  return companyLevel < district.unlockLevel;
}

export type MinimapOptions = {
  bounds?: Rect;
  depot?: Vec2;
  homes?: Vec2[];
  size?: number;
};

export type MinimapInstance = {
  container: HTMLElement;
  canvas: HTMLCanvasElement;
  update(
    vehiclePos: Vec2,
    vehicleHeading: number,
    targetPos: Vec2,
    phase: string,
    companyLevel: number,
    dt: number,
  ): void;
  dispose(): void;
};

export function createMinimap(
  root: HTMLElement,
  options?: MinimapOptions,
): MinimapInstance {
  const size = options?.size ?? 105;
  const bounds = options?.bounds ?? DEFAULT_BOUNDS;
  const depot = options?.depot ?? SUNNY_DEPOT;
  const homes = options?.homes ?? [];

  const container = document.createElement("div");
  container.className = "minimap-container";
  container.setAttribute("aria-label", "Şehir Radarı");

  const canvas = document.createElement("canvas");
  canvas.className = "minimap-canvas";
  canvas.width = size;
  canvas.height = size;
  container.appendChild(canvas);
  root.appendChild(container);

  const ctx = canvas.getContext("2d");
  let pulseTime = 0;

  function draw(
    vehiclePos: Vec2,
    vehicleHeading: number,
    targetPos: Vec2,
    phase: string,
    companyLevel: number,
  ) {
    if (!ctx) return;

    ctx.clearRect(0, 0, size, size);

    const half = size / 2;

    // 1. DÖRT BÖLGE ARKA PLAN RENKLERİ
    // Sunny (Kuzeybatı): [0..half, 0..half]
    ctx.fillStyle = "#dce7d3";
    ctx.fillRect(0, 0, half, half);

    // Industrial (Kuzeydoğu): [half..size, 0..half]
    ctx.fillStyle = "#d5dbe2";
    ctx.fillRect(half, 0, half, half);

    // Coastal (Güneybatı): [0..half, half..size]
    ctx.fillStyle = "#eddab8";
    ctx.fillRect(0, half, half, half);

    // Coastal Deniz Alanı: X: [-100..-10], Z: [40..100]
    const seaTopLeft = worldToMinimap(-100, 40, size, bounds);
    const seaBottomRight = worldToMinimap(-10, 100, size, bounds);
    ctx.fillStyle = "#6bb3ca";
    ctx.fillRect(
      seaTopLeft.x,
      seaTopLeft.y,
      seaBottomRight.x - seaTopLeft.x,
      seaBottomRight.y - seaTopLeft.y,
    );

    // Market (Güneydoğu): [half..size, half..size]
    ctx.fillStyle = "#f6e4c8";
    ctx.fillRect(half, half, half, half);

    // 2. BULVARLAR VE CADDELER (Grid yolları)
    ctx.save();
    // Tali caddeler (X = ±50, Z = ±50)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
    ctx.lineWidth = 1.2;
    for (const coord of [-50, 50]) {
      const pX = worldToMinimap(coord, 0, size, bounds).x;
      const pZ = worldToMinimap(0, coord, size, bounds).y;
      // Dikey yol
      ctx.beginPath();
      ctx.moveTo(pX, coord === -50 ? worldToMinimap(0, -5, size, bounds).y : 0);
      ctx.lineTo(pX, size);
      ctx.stroke();
      // Yatay yol
      ctx.beginPath();
      ctx.moveTo(coord === -50 ? worldToMinimap(-5, 0, size, bounds).x : 0, pZ);
      ctx.lineTo(size, pZ);
      ctx.stroke();
    }

    // Same street footprints as the Sunny scene tiles, plus the depot approach.
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    for (const road of [...SUNNY_ROADS, SUNNY_DEPOT_APRON]) {
      const a = worldToMinimap(road.minX, road.minZ, size, bounds);
      const b = worldToMinimap(road.maxX, road.maxZ, size, bounds);
      ctx.fillRect(a.x, a.y, b.x - a.x, b.y - a.y);
    }

    // Ana bulvarlar (X = 0, Z = 0)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(half, 0);
    ctx.lineTo(half, size);
    ctx.moveTo(0, half);
    ctx.lineTo(size, half);
    ctx.stroke();
    ctx.restore();

    // 3. KİLİTLİ BÖLGELER FİLTRESİ & 🔒 SEMBOLLERİ
    ctx.save();
    const lockedDistricts: { id: DistrictId; x: number; y: number; w: number; h: number }[] = [
      { id: "market", x: half, y: half, w: half, h: half },
      { id: "industrial", x: half, y: 0, w: half, h: half },
      { id: "coastal", x: 0, y: half, w: half, h: half },
    ];

    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (const d of lockedDistricts) {
      if (isDistrictLocked(d.id, companyLevel)) {
        ctx.fillStyle = "rgba(18, 38, 34, 0.65)";
        ctx.fillRect(d.x, d.y, d.w, d.h);
        ctx.fillText("🔒", d.x + d.w / 2, d.y + d.h / 2);
      }
    }
    ctx.restore();

    // 4. EVLER (Homes)
    ctx.save();
    for (const h of homes) {
      const hp = worldToMinimap(h.x, h.z, size, bounds);
      ctx.beginPath();
      ctx.arc(hp.x, hp.y, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = "#8a9785";
      ctx.fill();
    }
    ctx.restore();

    // 5. DEPO NOKTASI
    ctx.save();
    const dp = worldToMinimap(depot.x, depot.z, size, bounds);
    ctx.fillStyle = "#e67e22";
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    ctx.fillRect(dp.x - 2.5, dp.y - 2.5, 5, 5);
    ctx.strokeRect(dp.x - 2.5, dp.y - 2.5, 5, 5);
    ctx.restore();

    // 6. AKTİF HEDEF GÖSTERGESİ (Nabız animasyonu)
    if (phase !== "result") {
      ctx.save();
      const tp = worldToMinimap(targetPos.x, targetPos.z, size, bounds);
      const isDelivering = phase === "delivering";
      const baseColor = isDelivering ? "#2ecc71" : "#f39c12";
      const glowColor = isDelivering
        ? "rgba(46, 204, 113, 0.45)"
        : "rgba(243, 156, 18, 0.45)";

      const pulseRadius = 3.5 + Math.sin(pulseTime * 5) * 1.5;

      // Dış ışıma
      ctx.beginPath();
      ctx.arc(tp.x, tp.y, pulseRadius + 2.5, 0, Math.PI * 2);
      ctx.fillStyle = glowColor;
      ctx.fill();

      // İç dolgu
      ctx.beginPath();
      ctx.arc(tp.x, tp.y, Math.max(1, pulseRadius), 0, Math.PI * 2);
      ctx.fillStyle = baseColor;
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Merkez nokta
      ctx.beginPath();
      ctx.arc(tp.x, tp.y, 1.2, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.restore();
    }

    // 7. OYUNCU (Araba)
    ctx.save();
    const cp = worldToMinimap(vehiclePos.x, vehiclePos.z, size, bounds);
    const dirX = Math.sin(vehicleHeading);
    const dirY = -Math.cos(vehicleHeading);

    // Dönen yön oku / üçgen
    const tipX = cp.x + dirX * 6.5;
    const tipY = cp.y + dirY * 6.5;
    const leftX = cp.x - dirX * 3.5 - dirY * 3.5;
    const leftY = cp.y - dirY * 3.5 + dirX * 3.5;
    const rightX = cp.x - dirX * 3.5 + dirY * 3.5;
    const rightY = cp.y - dirY * 3.5 - dirX * 3.5;

    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(leftX, leftY);
    ctx.lineTo(rightX, rightY);
    ctx.closePath();

    ctx.fillStyle = "#ffd13b";
    ctx.fill();
    ctx.strokeStyle = "#1b3c34";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Merkez minik gösterge
    ctx.beginPath();
    ctx.arc(cp.x, cp.y, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.restore();
  }

  return {
    container,
    canvas,
    update(vehiclePos, vehicleHeading, targetPos, phase, companyLevel, dt) {
      pulseTime += dt;
      draw(vehiclePos, vehicleHeading, targetPos, phase, companyLevel);
    },
    dispose() {
      container.remove();
    },
  };
}
