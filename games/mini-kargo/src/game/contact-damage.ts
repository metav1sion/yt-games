import type { Rect, Vec2 } from "./types";

export type DamageContact = { id: string; severity: number };

/** Yeni hız ölçeği referansı (normal maxSpeed: 14, nitro: ~20 birim/sn) */
export const IMPACT_REFERENCE_SPEED = 20;

export function createContactDamageTracker() {
  const history = new Map<string, { peak: number; absent: number }>();
  return {
    update(contacts: DamageContact[], dt: number): number {
      const active = new Map<string, number>();
      for (const { id, severity } of contacts)
        if (severity > 0)
          active.set(id, Math.max(active.get(id) ?? 0, severity));

      for (const [id, contact] of history) {
        if (active.has(id)) continue;
        contact.absent += dt;
        if (contact.absent + 1e-9 >= 0.15) history.delete(id);
      }

      let impact = 0;
      for (const [id, severity] of active) {
        const peak = history.get(id)?.peak ?? 0;
        impact += Math.max(0, severity - peak);
        history.set(id, { peak: Math.max(peak, severity), absent: 0 });
      }
      return impact;
    },
    reset() {
      history.clear();
    },
  };
}

/**
 * Yüzey normaline ve geliş hızına göre çarpışma şiddetini hesaplar.
 * Duvara dik kafa kafaya çarpmalar tam hasar üretirken, teğet kaymalar
 * sürtünme bazlı çok daha düşük şiddet üretir.
 */
function calculateContactSeverity(normal: Vec2, velocity: Vec2): number {
  const vn = -(velocity.x * normal.x + velocity.z * normal.z);
  const vNormal = Math.max(0, vn);
  const totalSpeedSq = velocity.x * velocity.x + velocity.z * velocity.z;
  const dot = velocity.x * normal.x + velocity.z * normal.z;
  const vTangent = Math.sqrt(Math.max(0, totalSpeedSq - dot * dot));

  const vEffective = vNormal + 0.15 * vTangent;
  return Math.min(1, vEffective / IMPACT_REFERENCE_SPEED);
}

export function staticCollisionContacts(
  proposed: Vec2,
  resolved: Vec2,
  velocity: Vec2,
  obstacles: Rect[],
  bounds: Rect,
  radius = 0.65,
  heading?: number,
): DamageContact[] {
  const blockedX = Math.abs(proposed.x - resolved.x) > 1e-6;
  const blockedZ = Math.abs(proposed.z - resolved.z) > 1e-6;
  if (!blockedX && !blockedZ) return [];

  const speed = Math.hypot(velocity.x, velocity.z);
  if (speed < 1e-6) return [];

  const contacts: DamageContact[] = [];

  // Probe noktaları (heading varsa kapsül merkezleri, yoksa temel noktalar)
  let probes: Vec2[] = [];
  if (heading !== undefined) {
    const sinH = Math.sin(heading);
    const cosH = Math.cos(heading);
    probes = [
      { x: proposed.x + 0.52 * sinH, z: proposed.z + 0.52 * cosH },
      { x: proposed.x, z: proposed.z },
      { x: proposed.x - 0.52 * sinH, z: proposed.z - 0.52 * cosH },
    ];
  } else {
    probes = [proposed];
    if (blockedX) probes.push({ x: proposed.x, z: resolved.z });
    if (blockedZ) probes.push({ x: resolved.x, z: proposed.z });
  }

  // 1. Engeller (obstacles)
  obstacles.forEach((rect, index) => {
    let closestDistSq = Infinity;
    let contactNormal: Vec2 | null = null;

    for (const point of probes) {
      const nx = Math.max(rect.minX, Math.min(rect.maxX, point.x));
      const nz = Math.max(rect.minZ, Math.min(rect.maxZ, point.z));
      const dx = point.x - nx;
      const dz = point.z - nz;
      const dSq = dx * dx + dz * dz;

      if (dSq < radius * radius) {
        if (dSq < closestDistSq) {
          closestDistSq = dSq;
          if (dSq > 1e-8) {
            const dist = Math.sqrt(dSq);
            contactNormal = { x: dx / dist, z: dz / dist };
          } else {
            // Merkezin en yakın olduğu kenarı bul
            const left = point.x - rect.minX;
            const right = rect.maxX - point.x;
            const bottom = point.z - rect.minZ;
            const top = rect.maxZ - point.z;
            const m = Math.min(left, right, bottom, top);
            if (m === left) contactNormal = { x: -1, z: 0 };
            else if (m === right) contactNormal = { x: 1, z: 0 };
            else if (m === bottom) contactNormal = { x: 0, z: -1 };
            else contactNormal = { x: 0, z: 1 };
          }
        }
      }
    }

    if (contactNormal) {
      const severity = calculateContactSeverity(contactNormal, velocity);
      if (severity > 0) {
        contacts.push({ id: `obstacle:${index}`, severity });
      }
    }
  });

  // 2. Sınır duvarları (bounds)
  const isLeft = blockedX && proposed.x < bounds.minX + radius;
  const isRight = blockedX && proposed.x > bounds.maxX - radius;
  const isTop = blockedZ && proposed.z < bounds.minZ + radius;
  const isBottom = blockedZ && proposed.z > bounds.maxZ - radius;

  if (isLeft) {
    const severity = calculateContactSeverity({ x: 1, z: 0 }, velocity);
    if (severity > 0) contacts.push({ id: "boundary:left", severity });
  }
  if (isRight) {
    const severity = calculateContactSeverity({ x: -1, z: 0 }, velocity);
    if (severity > 0) contacts.push({ id: "boundary:right", severity });
  }
  if (isTop) {
    const severity = calculateContactSeverity({ x: 0, z: 1 }, velocity);
    if (severity > 0) contacts.push({ id: "boundary:top", severity });
  }
  if (isBottom) {
    const severity = calculateContactSeverity({ x: 0, z: -1 }, velocity);
    if (severity > 0) contacts.push({ id: "boundary:bottom", severity });
  }

  return contacts;
}
