import * as THREE from "three";
import type { Vec2, VehicleState } from "../game/types";

export type PropKind = "cone" | "trash" | "box";

export type PropDef = {
  kind: PropKind;
  position: Vec2;
  rotationY?: number;
};

export type PropInstance = {
  id: number;
  kind: PropKind;
  initialPos: THREE.Vector3;
  initialRot: THREE.Euler;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  rot: THREE.Euler;
  angVel: THREE.Vector3;
  radius: number;
  height: number;
  hit: boolean;
  timeSinceHit: number;
  mesh: THREE.Group;
};

const materials = new Map<string, THREE.MeshStandardMaterial>();
function getMat(color: string, roughness = 0.8): THREE.MeshStandardMaterial {
  const key = `${color}_${roughness}`;
  if (!materials.has(key)) {
    materials.set(
      key,
      new THREE.MeshStandardMaterial({
        color,
        roughness,
      }),
    );
  }
  return materials.get(key)!;
}

// 🔶 1. Trafik Konisi (Traffic Cone)
function buildConeMesh(): THREE.Group {
  const g = new THREE.Group();

  // Taban kare plaka
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(0.46, 0.05, 0.46),
    getMat("#d35400", 0.6),
  );
  base.position.y = 0.025;
  base.castShadow = true;
  g.add(base);

  // Turuncu alt gövde
  const lowerCone = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.22, 0.32, 10),
    getMat("#e67e22", 0.5),
  );
  lowerCone.position.y = 0.21;
  lowerCone.castShadow = true;
  g.add(lowerCone);

  // Beyaz yansıtıcı orta şerit
  const stripe = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.12, 0.15, 10),
    getMat("#ffffff", 0.4),
  );
  stripe.position.y = 0.445;
  stripe.castShadow = true;
  g.add(stripe);

  // Turuncu tepe konisi
  const topCone = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.08, 0.18, 10),
    getMat("#e67e22", 0.5),
  );
  topCone.position.y = 0.61;
  topCone.castShadow = true;
  g.add(topCone);

  return g;
}

// 🗑️ 2. Çöp Kovası (Trash Can)
function buildTrashMesh(): THREE.Group {
  const g = new THREE.Group();

  // Koyu yeşil / metalik silindir gövde
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.26, 0.78, 12),
    getMat("#2f4f4f", 0.6),
  );
  body.position.y = 0.39;
  body.castShadow = true;
  g.add(body);

  // Kapak ve üst çember
  const lid = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.32, 0.08, 12),
    getMat("#203535", 0.5),
  );
  lid.position.y = 0.82;
  lid.castShadow = true;
  g.add(lid);

  // Tutma kulpu
  const handle = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.06, 0.04),
    getMat("#182a2a", 0.4),
  );
  handle.position.y = 0.88;
  g.add(handle);

  return g;
}

// 📦 3. Karton Koli Yığını (Cardboard Box Stack)
function buildBoxStackMesh(): THREE.Group {
  const g = new THREE.Group();

  // Alt büyük koli
  const bottomBox = new THREE.Mesh(
    new THREE.BoxGeometry(0.72, 0.54, 0.72),
    getMat("#c39b63", 0.85),
  );
  bottomBox.position.y = 0.27;
  bottomBox.castShadow = true;
  g.add(bottomBox);

  // Koli bandı çizgisi
  const tape1 = new THREE.Mesh(
    new THREE.BoxGeometry(0.73, 0.55, 0.14),
    getMat("#9c7a4b", 0.7),
  );
  tape1.position.y = 0.27;
  g.add(tape1);

  // Üst küçük koli (hafif açılı durur)
  const topBox = new THREE.Mesh(
    new THREE.BoxGeometry(0.56, 0.44, 0.56),
    getMat("#d4ac75", 0.85),
  );
  topBox.position.set(0.05, 0.76, -0.04);
  topBox.rotation.y = 0.25;
  topBox.castShadow = true;
  g.add(topBox);

  const tape2 = new THREE.Mesh(
    new THREE.BoxGeometry(0.57, 0.45, 0.12),
    getMat("#9c7a4b", 0.7),
  );
  tape2.position.set(0.05, 0.76, -0.04);
  tape2.rotation.y = 0.25;
  g.add(tape2);

  return g;
}

/**
 * Şehir genelinde ve kestirmelerin ağzında yer alan yıkılabilir nesneler listesi.
 */
export const PROP_DEFINITIONS: PropDef[] = [
  // ==========================================
  // KESTİRME 1: ÇARŞI GİZLİ SOKAĞI (Market Alley)
  // Giriş ve çıkışta kırılabilir karton yığınları
  // ==========================================
  { kind: "box", position: { x: 35, z: 22 }, rotationY: 0.1 },
  { kind: "box", position: { x: 35.8, z: 23 }, rotationY: -0.3 },
  { kind: "box", position: { x: 34.8, z: 35.5 }, rotationY: 0.4 },
  { kind: "box", position: { x: 35.6, z: 36.5 }, rotationY: -0.2 },
  { kind: "trash", position: { x: 33.2, z: 28 } },
  { kind: "cone", position: { x: 36.6, z: 29 } },

  // ==========================================
  // KESTİRME 2: SANAYİ HANGAR KORİDORU & RAMPA ÖNÜ
  // ==========================================
  { kind: "box", position: { x: 49.2, z: -27.5 }, rotationY: 0.15 },
  { kind: "box", position: { x: 50.8, z: -27.5 }, rotationY: -0.2 },
  { kind: "box", position: { x: 50, z: -29 }, rotationY: 0.35 },
  { kind: "cone", position: { x: 48.0, z: -32 } },
  { kind: "cone", position: { x: 52.0, z: -32 } },
  { kind: "cone", position: { x: 48.2, z: -35 } },
  { kind: "cone", position: { x: 51.8, z: -35 } },

  // ==========================================
  // SAHİL PARKI & RAMPA YAKINI
  // ==========================================
  { kind: "cone", position: { x: -33, z: 22 } },
  { kind: "cone", position: { x: -37, z: 22 } },
  { kind: "box", position: { x: -28, z: 30 } },
  { kind: "trash", position: { x: -30, z: 36 } },
  { kind: "trash", position: { x: -60, z: 36 } },

  // ==========================================
  // GÜNEŞ MAHALLESİ (Kargo Deposu Çevresi & Kaldırımlar)
  // ==========================================
  { kind: "cone", position: { x: -37.5, z: -36 } },
  { kind: "cone", position: { x: -42.5, z: -36 } },
  { kind: "box", position: { x: -39.8, z: -23 } },
  { kind: "trash", position: { x: -70, z: -71 } },
  { kind: "trash", position: { x: -20, z: -71 } },
  { kind: "trash", position: { x: -70, z: -21 } },
  { kind: "trash", position: { x: -20, z: -21 } },

  // ==========================================
  // ÇARŞI DÜKKANLARI & MEYDAN
  // ==========================================
  { kind: "trash", position: { x: 20, z: 29 } },
  { kind: "trash", position: { x: 70, z: 29 } },
  { kind: "trash", position: { x: 20, z: 79 } },
  { kind: "trash", position: { x: 70, z: 79 } },
  { kind: "cone", position: { x: 44, z: 44 } },
  { kind: "cone", position: { x: 56, z: 44 } },

  // ==========================================
  // BULVAR KAVŞAKLARI & ŞANTİYE KENARLARI
  // ==========================================
  { kind: "cone", position: { x: 9, z: 49 } },
  { kind: "cone", position: { x: 49, z: 9 } },
  { kind: "cone", position: { x: -49, z: 9 } },
  { kind: "cone", position: { x: 9, z: -49 } },
];

export type PropsSystem = {
  group: THREE.Group;
  props: PropInstance[];
  update(dt: number, vehicle: VehicleState): boolean;
  reset(): void;
};

export function createProps(
  scene: THREE.Scene,
  defs: readonly PropDef[] = PROP_DEFINITIONS,
): PropsSystem {
  const group = new THREE.Group();
  scene.add(group);

  const props: PropInstance[] = [];

  defs.forEach((def, id) => {
    let mesh: THREE.Group;
    let radius = 0.45;
    let height = 0.7;

    if (def.kind === "cone") {
      mesh = buildConeMesh();
      radius = 0.45;
      height = 0.7;
    } else if (def.kind === "trash") {
      mesh = buildTrashMesh();
      radius = 0.52;
      height = 0.9;
    } else {
      mesh = buildBoxStackMesh();
      radius = 0.65;
      height = 1.0;
    }

    const y = 0.05;
    mesh.position.set(def.position.x, y, def.position.z);
    mesh.rotation.y = def.rotationY ?? 0;
    group.add(mesh);

    props.push({
      id,
      kind: def.kind,
      initialPos: new THREE.Vector3(def.position.x, y, def.position.z),
      initialRot: new THREE.Euler(0, def.rotationY ?? 0, 0),
      pos: new THREE.Vector3(def.position.x, y, def.position.z),
      vel: new THREE.Vector3(0, 0, 0),
      rot: new THREE.Euler(0, def.rotationY ?? 0, 0),
      angVel: new THREE.Vector3(0, 0, 0),
      radius,
      height,
      hit: false,
      timeSinceHit: 0,
      mesh,
    });
  });

  return {
    group,
    props,
    update(dt: number, vehicle: VehicleState): boolean {
      let anyHit = false;
      const vAlt = vehicle.altitude ?? 0;
      const carRadius = 0.65;

      for (const p of props) {
        // Çarpışma algılama:
        // Henüz havada uçmuyorsa ve araç zemin seviyesindeyse çarpışma kontrolü
        if (!p.hit && vAlt < p.height + 0.2) {
          const dx = p.pos.x - vehicle.position.x;
          const dz = p.pos.z - vehicle.position.z;
          const distSq = dx * dx + dz * dz;
          const hitDist = p.radius + carRadius;

          if (distSq < hitDist * hitDist) {
            const dist = Math.sqrt(distSq);
            p.hit = true;
            p.timeSinceHit = 0;
            anyHit = true;

            const carSpeed = Math.hypot(vehicle.velocity.x, vehicle.velocity.z);
            const pushFactor = 0.8;

            if (carSpeed > 0.5) {
              p.vel.x = vehicle.velocity.x * pushFactor + (Math.random() - 0.5) * 2.5;
              p.vel.z = vehicle.velocity.z * pushFactor + (Math.random() - 0.5) * 2.5;
            } else {
              const nx = dist > 1e-4 ? dx / dist : 1;
              const nz = dist > 1e-4 ? dz / dist : 0;
              p.vel.x = nx * 3.5;
              p.vel.z = nz * 3.5;
            }

            // Havaya fırlama hızı (vel.y ≈ 4-8 birim/sn)
            p.vel.y = 4.8 + Math.random() * 3.2;

            // Takla ve dönüş hızı
            p.angVel.x = (Math.random() - 0.5) * 14;
            p.angVel.y = (Math.random() - 0.5) * 10;
            p.angVel.z = (Math.random() - 0.5) * 14;

            // Araba hafifçe yavaşlar (~%8 hız kaybı), duvara çarpmış gibi durmaz!
            vehicle.velocity.x *= 0.92;
            vehicle.velocity.z *= 0.92;
          }
        }

        // Fırlayan objelerin fizik hareketi
        if (p.hit) {
          p.timeSinceHit += dt;

          // Yerçekimi
          p.vel.y -= 26 * dt;

          p.pos.x += p.vel.x * dt;
          p.pos.y += p.vel.y * dt;
          p.pos.z += p.vel.z * dt;

          // Zeminle temas / sekme
          if (p.pos.y <= p.initialPos.y) {
            p.pos.y = p.initialPos.y;
            if (Math.abs(p.vel.y) > 1.2) {
              p.vel.y = -p.vel.y * 0.32; // Sekme
            } else {
              p.vel.y = 0;
            }
            // Zemin sürtünmesi
            p.vel.x *= Math.exp(-6.5 * dt);
            p.vel.z *= Math.exp(-6.5 * dt);
            p.angVel.x *= Math.exp(-5.5 * dt);
            p.angVel.y *= Math.exp(-5.5 * dt);
            p.angVel.z *= Math.exp(-5.5 * dt);
          }

          p.rot.x += p.angVel.x * dt;
          p.rot.y += p.angVel.y * dt;
          p.rot.z += p.angVel.z * dt;

          p.mesh.position.copy(p.pos);
          p.mesh.rotation.copy(p.rot);

          // Sıfırlama kontrolü:
          // 12 saniye sonra veya oyuncu uzaklaştığında (mesafe > 45, süre > 5s) orijinal yerine döner
          const distToPlayer = Math.hypot(
            p.pos.x - vehicle.position.x,
            p.pos.z - vehicle.position.z,
          );

          if (p.timeSinceHit > 12 || (p.timeSinceHit > 5 && distToPlayer > 45)) {
            p.hit = false;
            p.timeSinceHit = 0;
            p.pos.copy(p.initialPos);
            p.rot.copy(p.initialRot);
            p.vel.set(0, 0, 0);
            p.angVel.set(0, 0, 0);
            p.mesh.position.copy(p.initialPos);
            p.mesh.rotation.copy(p.initialRot);
          }
        }
      }

      return anyHit;
    },

    reset() {
      for (const p of props) {
        p.hit = false;
        p.timeSinceHit = 0;
        p.pos.copy(p.initialPos);
        p.rot.copy(p.initialRot);
        p.vel.set(0, 0, 0);
        p.angVel.set(0, 0, 0);
        p.mesh.position.copy(p.initialPos);
        p.mesh.rotation.copy(p.initialRot);
      }
    },
  };
}
