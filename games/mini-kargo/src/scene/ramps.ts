import * as THREE from "three";
import type { Ramp } from "../game/ramps";

const materials = new Map<string, THREE.MeshStandardMaterial>();
function getMat(color: string, roughness = 0.75): THREE.MeshStandardMaterial {
  const key = `${color}_${roughness}`;
  if (!materials.has(key)) {
    materials.set(
      key,
      new THREE.MeshStandardMaterial({
        color,
        roughness,
        metalness: 0.15,
      }),
    );
  }
  return materials.get(key)!;
}

function createWedgeGeometry(width: number, length: number, height: number): THREE.BufferGeometry {
  const hw = width / 2;
  const hl = length / 2;

  // 6 vertices of a triangular prism / wedge:
  // v0: left-bottom-front (-hw, 0, -hl)
  // v1: right-bottom-front (hw, 0, -hl)
  // v2: right-bottom-back  (hw, 0, hl)
  // v3: left-bottom-back   (-hw, 0, hl)
  // v4: left-top-back      (-hw, height, hl)
  // v5: right-top-back     (hw, height, hl)

  // Triangles:
  // Incline slope (upwards facing towards +Z):
  // (v0, v1, v5) & (v0, v5, v4)
  // Back wall (facing +Z):
  // (v3, v2, v5) & (v3, v5, v4)
  // Left side: (v0, v4, v3)
  // Right side: (v1, v2, v5)
  // Bottom: (v0, v3, v2) & (v0, v2, v1)

  const positions: number[] = [
    // Incline slope
    -hw, 0, -hl,
     hw, 0, -hl,
     hw, height, hl,

    -hw, 0, -hl,
     hw, height, hl,
    -hw, height, hl,

    // Back wall
     hw, 0, hl,
    -hw, 0, hl,
    -hw, height, hl,

     hw, 0, hl,
    -hw, height, hl,
     hw, height, hl,

    // Left side triangle
    -hw, 0, -hl,
    -hw, height, hl,
    -hw, 0, hl,

    // Right side triangle
     hw, 0, -hl,
     hw, 0, hl,
     hw, height, hl,

    // Bottom
    -hw, 0, -hl,
    -hw, 0, hl,
     hw, 0, hl,

    -hw, 0, -hl,
     hw, 0, hl,
     hw, 0, -hl,
  ];

  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geom.computeVertexNormals();
  return geom;
}

export function createRamps(ramps: readonly Ramp[]): THREE.Group {
  const root = new THREE.Group();

  for (const ramp of ramps) {
    const rampGroup = new THREE.Group();
    rampGroup.position.set(ramp.position.x, 0.05, ramp.position.z);
    rampGroup.rotation.y = ramp.heading;

    const w = ramp.size.x;
    const l = ramp.size.z;
    const h = ramp.height;

    // 1. Ana rampa gövdesi (Turuncu-altın renkli arcade rampası)
    const wedgeGeom = createWedgeGeometry(w, l, h);
    const wedgeMesh = new THREE.Mesh(wedgeGeom, getMat("#e67e22", 0.65));
    wedgeMesh.castShadow = true;
    wedgeMesh.receiveShadow = true;
    rampGroup.add(wedgeMesh);

    // 2. Yan güvenlik bariyerleri (Siyah-sarı çizgili bordür)
    const curbW = 0.35;
    const sideGeom = createWedgeGeometry(curbW, l, h + 0.25);
    const leftCurb = new THREE.Mesh(sideGeom, getMat("#2c3e50"));
    leftCurb.position.set(-w / 2 + curbW / 2, 0, 0);
    rampGroup.add(leftCurb);

    const rightCurb = new THREE.Mesh(sideGeom, getMat("#2c3e50"));
    rightCurb.position.set(w / 2 - curbW / 2, 0, 0);
    rampGroup.add(rightCurb);

    // Yanlara parlak sarı uyarı çizgileri
    const stripeCount = 4;
    for (let i = 0; i < stripeCount; i++) {
      const t = (i + 0.5) / stripeCount;
      const zOffset = -l / 2 + t * l;
      const yOffset = t * h + 0.08;

      for (const sideX of [-w / 2, w / 2]) {
        const stripe = new THREE.Mesh(
          new THREE.BoxGeometry(0.38, 0.16, 0.5),
          getMat("#f1c40f", 0.4),
        );
        stripe.position.set(sideX, yOffset, zOffset);
        rampGroup.add(stripe);
      }
    }

    // 3. Rampa üzerindeki beyaz yön okları / şeritleri (Chevron / Arrow stripes)
    const arrowCount = 3;
    for (let i = 0; i < arrowCount; i++) {
      const t = 0.25 + (i * 0.28);
      const zPos = -l / 2 + t * l;
      const yPos = t * h + 0.02;

      // Eğim açısı
      const slopeAngle = Math.atan2(h, l);
      const chevron = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.6, 0.04, 0.4),
        getMat("#ffffff", 0.3),
      );
      chevron.position.set(0, yPos, zPos);
      chevron.rotation.x = -slopeAngle;
      rampGroup.add(chevron);
    }

    // 4. Tepe noktasında sarı flaşör / ışıklar
    for (const sx of [-w / 2 + 0.2, w / 2 - 0.2]) {
      const flasher = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.18, 0.35, 8),
        getMat("#f39c12", 0.2),
      );
      flasher.position.set(sx, h + 0.3, l / 2 - 0.15);
      rampGroup.add(flasher);
    }

    root.add(rampGroup);
  }

  return root;
}
