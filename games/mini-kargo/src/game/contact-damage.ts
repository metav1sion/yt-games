import type { Rect, Vec2 } from "./types";

export type DamageContact = { id: string; severity: number };

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
    reset() { history.clear(); },
  };
}

export function staticCollisionContacts(
  proposed: Vec2,
  resolved: Vec2,
  velocity: Vec2,
  obstacles: Rect[],
  bounds: Rect,
  radius = 0.65,
): DamageContact[] {
  const blockedX = Math.abs(proposed.x - resolved.x) > 1e-9;
  const blockedZ = Math.abs(proposed.z - resolved.z) > 1e-9;
  if (!blockedX && !blockedZ) return [];
  // Normalize pre-resolution speed: 10 world units/second is severity 1.
  const severity = Math.min(1, Math.hypot(velocity.x, velocity.z) / 10);
  if (severity === 0) return [];
  const contacts: DamageContact[] = [];
  const probes = [proposed];
  if (blockedX) probes.push({ x: proposed.x, z: resolved.z });
  if (blockedZ) probes.push({ x: resolved.x, z: proposed.z });
  obstacles.forEach((rect, index) => {
    if (probes.some(point => {
      const x = Math.max(rect.minX, Math.min(rect.maxX, point.x));
      const z = Math.max(rect.minZ, Math.min(rect.maxZ, point.z));
      return (point.x - x) ** 2 + (point.z - z) ** 2 < radius ** 2;
    })) contacts.push({ id: `obstacle:${index}`, severity });
  });
  if (blockedX && proposed.x < bounds.minX + radius)
    contacts.push({ id: "boundary:left", severity });
  if (blockedX && proposed.x > bounds.maxX - radius)
    contacts.push({ id: "boundary:right", severity });
  if (blockedZ && proposed.z < bounds.minZ + radius)
    contacts.push({ id: "boundary:top", severity });
  if (blockedZ && proposed.z > bounds.maxZ - radius)
    contacts.push({ id: "boundary:bottom", severity });
  return contacts;
}
