import * as THREE from "three";
import { mat } from "./world-kit";

export type CloudInstance = {
  group: THREE.Group;
  speed: number;
  initialY: number;
  bobPhase: number;
  bobSpeed: number;
};

export type CloudSystem = {
  group: THREE.Group;
  update(dt: number): void;
  dispose(): void;
};

/**
 * Birbiriyle kaynaşmış 5-8 adet hafif basık düşük poligonlu küreden oluşan
 * kabarık ve sevimli (cozy low-poly) bulut modeli oluşturur.
 */
function createCloudMesh(): THREE.Group {
  const group = new THREE.Group();
  const cloudMat = mat("#ffffff", 0.95);
  // Bulut gövdesini oluşturan merkez ve çevre kabarık parçalar
  const puffDefs: { x: number; y: number; z: number; scale: number }[] = [
    { x: 0, y: 0, z: 0, scale: 2.2 },
    { x: 1.4, y: -0.2, z: 0.2, scale: 1.6 },
    { x: -1.3, y: -0.25, z: -0.1, scale: 1.5 },
    { x: 0.6, y: 0.5, z: -0.2, scale: 1.4 },
    { x: -0.6, y: 0.45, z: 0.3, scale: 1.3 },
    { x: 2.3, y: -0.4, z: 0, scale: 1.1 },
    { x: -2.1, y: -0.4, z: 0.1, scale: 1.0 },
  ];

  // Paylaşılan tek bir düşük poligonlu ikosahedron geometrisi (performans için)
  const sphereGeo = new THREE.DodecahedronGeometry(1, 1);

  for (const puff of puffDefs) {
    const mesh = new THREE.Mesh(sphereGeo, cloudMat);
    mesh.position.set(puff.x, puff.y, puff.z);
    mesh.scale.set(puff.scale * 1.1, puff.scale * 0.75, puff.scale * 0.9);
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    group.add(mesh);
  }

  return group;
}

/**
 * Gökyüzünde yavaşça süzülen 8-12 adet stilize kabarık 3D bulut oluşturur.
 */
export function createClouds(count = 11): CloudSystem {
  const group = new THREE.Group();
  const clouds: CloudInstance[] = [];

  // Harita sınırları X: -100..100, Z: -100..100
  for (let i = 0; i < count; i++) {
    const cloudGroup = createCloudMesh();
    // Farklı boyut ve rastgele dağılım
    const scale = 1.6 + Math.random() * 1.6;
    cloudGroup.scale.setScalar(scale);

    const x = -100 + (220 / count) * i + (Math.random() - 0.5) * 18;
    const y = 24 + Math.random() * 14;
    const z = -90 + Math.random() * 180;

    cloudGroup.position.set(x, y, z);
    group.add(cloudGroup);

    clouds.push({
      group: cloudGroup,
      speed: 1.0 + Math.random() * 1.5,
      initialY: y,
      bobPhase: Math.random() * Math.PI * 2,
      bobSpeed: 0.4 + Math.random() * 0.4,
    });
  }

  return {
    group,
    update(dt: number) {
      for (const c of clouds) {
        c.group.position.x += c.speed * dt;
        c.bobPhase += c.bobSpeed * dt;
        c.group.position.y = c.initialY + Math.sin(c.bobPhase) * 0.35;

        // Harita dışına çıktığında soldan yeniden başlat
        if (c.group.position.x > 115) {
          c.group.position.x = -115;
          c.group.position.z = -90 + Math.random() * 180;
        }
      }
    },
    dispose() {
      // Temizleme
      group.clear();
    },
  };
}
