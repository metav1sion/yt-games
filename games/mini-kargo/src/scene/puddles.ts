import * as THREE from "three";
import type { Vec2 } from "../game/types";

export type PuddleDef = {
  id: string;
  district: "sunny" | "market" | "industrial" | "coastal";
  x: number;
  z: number;
  radius: number;
};

export const CITY_PUDDLES: PuddleDef[] = [
  // Güneş Mahallesi sokakları ve konut araları
  { id: "sunny_depot_spur", district: "sunny", x: -58, z: -31, radius: 1.8 },
  { id: "sunny_cross_c", district: "sunny", x: -48, z: -48, radius: 1.9 },
  { id: "sunny_cross_w", district: "sunny", x: -76, z: -52, radius: 1.7 },
  { id: "sunny_cross_s", district: "sunny", x: -48, z: -12, radius: 1.6 },

  // Ana Şehir Bulvarı (Z ~ 0)
  { id: "blvd_west", district: "sunny", x: -44, z: 1.2, radius: 2.1 },
  { id: "blvd_center", district: "market", x: 6, z: -1.2, radius: 2.3 },
  { id: "blvd_east", district: "industrial", x: 45, z: 1.4, radius: 2.0 },

  // Çarşı Bölgesi
  { id: "mkt_piazza_spur", district: "market", x: 12, z: 35, radius: 1.8 },
  { id: "mkt_south_avenue", district: "market", x: 52, z: 82, radius: 2.0 },

  // Sanayi Bölgesi (Ağır tonajlı araç olukları)
  { id: "ind_warehouse_bay", district: "industrial", x: 16, z: -15, radius: 2.2 },
  { id: "ind_heavy_dock", district: "industrial", x: 48, z: -64, radius: 2.4 },

  // Sahil Bölgesi (Promenade ve Kordon)
  { id: "cst_north_pier", district: "coastal", x: -76, z: 35, radius: 2.0 },
  { id: "cst_south_boardwalk", district: "coastal", x: -52, z: 76, radius: 2.2 },
];

export type PuddleSplashEvent = {
  splashed: boolean;
  x: number;
  z: number;
  speed: number;
  hydroplaning: boolean;
  puddleId?: string;
};

export type PuddlesView = {
  group: THREE.Group;
  puddles: PuddleDef[];
  update(
    dt: number,
    playerPos?: Vec2,
    playerSpeed?: number,
    playerHeading?: number,
    wetness?: number,
  ): PuddleSplashEvent;
  checkPositionSplash(pos: Vec2, speed: number, wetness: number): boolean;
  dispose(): void;
};

/**
 * Mini Kargo Yağmur Su Birikintileri & Sıçrama Sistemi (Dynamic Road Puddles & Splash System)
 * - Yağış sırasında asfalt oyuklarında ve yol kenarlarında dinamik olarak beliren su birikintileri
 * - Islaklık (`wetness`) arttıkça şeffaflıktan parlak yansımalı su göletine yumuşak geçiş
 * - Araç tekerlekleri su birikintisinden yüksek hızla geçtiğinde su püskürmesi ve hidrodinamik kayma (hydroplaning)
 */
export function createPuddlesView(puddleDefs: PuddleDef[] = CITY_PUDDLES): PuddlesView {
  const group = new THREE.Group();

  const puddleMeshes: {
    mesh: THREE.Mesh;
    rippleMesh: THREE.Mesh;
    def: PuddleDef;
    rippleTimer: number;
  }[] = [];

  const puddleMat = new THREE.MeshBasicMaterial({
    color: "#1e3799",
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });

  const rippleMat = new THREE.MeshBasicMaterial({
    color: "#6a89cc",
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });

  // Her su birikintisi için organik 3B mesh ve dalgalanma halkası
  for (const def of puddleDefs) {
    const pGroup = new THREE.Group();
    pGroup.position.set(def.x, 0.052, def.z);

    // Dairesel su yüzeyi
    const geo = new THREE.CylinderGeometry(def.radius, def.radius * 1.05, 0.015, 16);
    const mesh = new THREE.Mesh(geo, puddleMat);
    pGroup.add(mesh);

    // İnce halka (su halkası / ripple rim)
    const ringGeo = new THREE.RingGeometry(def.radius * 0.75, def.radius * 0.98, 16);
    ringGeo.rotateX(-Math.PI / 2);
    const rippleMesh = new THREE.Mesh(ringGeo, rippleMat);
    rippleMesh.position.y = 0.009;
    pGroup.add(rippleMesh);

    group.add(pGroup);

    puddleMeshes.push({
      mesh,
      rippleMesh,
      def,
      rippleTimer: Math.random() * Math.PI * 2,
    });
  }

  group.visible = false;

  let splashCooldown = 0;
  let currentOpacity = 0;

  return {
    group,
    puddles: puddleDefs,
    update(
      dt: number,
      playerPos = { x: 0, z: 0 },
      playerSpeed = 0,
      playerHeading = 0,
      wetness = 0,
    ): PuddleSplashEvent {
      splashCooldown = Math.max(0, splashCooldown - dt);

      // Islaklığa göre opaklık ve görünürlük
      const targetOpacity = wetness > 0.02 ? Math.min(0.82, wetness * 0.88) : 0;
      currentOpacity = THREE.MathUtils.lerp(currentOpacity, targetOpacity, 1 - Math.exp(-4 * dt));

      if (currentOpacity > 0.01) {
        group.visible = true;
        puddleMat.opacity = currentOpacity;
        rippleMat.opacity = currentOpacity * 0.45;

        // Dalga ve hafif hareket simülasyonu (Fırtına ve yüksek ıslaklıkta genişleme ve hızlı dalgalanma)
        const rippleSpeed = wetness > 0.8 ? 4.2 : 2.2;
        const sizeMultiplier = wetness > 0.85 ? 1.18 : (wetness > 0.5 ? 1.08 : 1.0);
        for (const item of puddleMeshes) {
          item.rippleTimer += dt * rippleSpeed;
          const scale = (0.95 + Math.sin(item.rippleTimer) * 0.05) * sizeMultiplier;
          item.rippleMesh.scale.set(scale, 1, scale);
          item.mesh.scale.set(sizeMultiplier, 1, sizeMultiplier);
        }
      } else {
        group.visible = false;
        puddleMat.opacity = 0;
        rippleMat.opacity = 0;
      }

      // Oyuncu aracı su birikintisi üzerinden geçtiğinde su sıçratma kontrolü
      if (wetness > 0.15 && playerSpeed > 2.2 && splashCooldown <= 0) {
        for (const item of puddleMeshes) {
          const dist = Math.hypot(playerPos.x - item.def.x, playerPos.z - item.def.z);
          if (dist <= item.def.radius + 0.3) {
            splashCooldown = 0.14; // Sıçrama aralığı (cooldown)
            const isHydroplaning = playerSpeed > 6.0;
            return {
              splashed: true,
              x: playerPos.x,
              z: playerPos.z,
              speed: playerSpeed,
              hydroplaning: isHydroplaning,
              puddleId: item.def.id,
            };
          }
        }
      }

      return {
        splashed: false,
        x: playerPos.x,
        z: playerPos.z,
        speed: playerSpeed,
        hydroplaning: false,
      };
    },
    checkPositionSplash(pos: Vec2, speed: number, wetness: number): boolean {
      if (wetness <= 0.15 || speed <= 2.2) return false;
      for (const def of puddleDefs) {
        const dist = Math.hypot(pos.x - def.x, pos.z - def.z);
        if (dist <= def.radius + 0.2) return true;
      }
      return false;
    },
    dispose() {
      puddleMat.dispose();
      rippleMat.dispose();
      for (const item of puddleMeshes) {
        item.mesh.geometry.dispose();
        item.rippleMesh.geometry.dispose();
      }
    },
  };
}
