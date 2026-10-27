import * as THREE from "three";
import { box, label } from "./world-kit";
import type { ActiveCourierState } from "../game/fleet";

type CourierVisual = {
  group: THREE.Group;
  body: THREE.Group;
  cargoBox: THREE.Mesh;
  labelSprite: THREE.Sprite;
  wheels: THREE.Group[];
  wheelSpin: number;
};

export type FleetView = {
  group: THREE.Group;
  update(couriers: ActiveCourierState[], dt: number): void;
  dispose(): void;
};

export function createFleetView(): FleetView {
  const group = new THREE.Group();
  const visualMap = new Map<string, CourierVisual>();

  function createCourierModel(ac: ActiveCourierState): CourierVisual {
    const courierGroup = new THREE.Group();
    const body = new THREE.Group();
    courierGroup.add(body);

    const isVan = ac.courier.level >= 3;

    const wheels: THREE.Group[] = [];

    // Kurye aracı gövdesi
    if (isVan) {
      // Seviye 3+ Büyük Kargo Vanı (Koyu Turkuaz / Şirket Rengi)
      box(body, [1.2, 0.5, 2.0], [0, 0.6, 0], "#2a7b88"); // Gövde
      box(body, [1.1, 0.55, 0.8], [0, 1.05, 0.5], "#e2f1f5"); // Kabin
      box(body, [1.0, 0.35, 0.05], [0, 1.08, 0.92], "#1a363b"); // Ön cam

      // Tekerlekler
      for (const x of [-0.62, 0.62]) {
        for (const z of [-0.6, 0.65]) {
          const wGroup = new THREE.Group();
          wGroup.position.set(x, 0.3, z);
          const wMesh = box(wGroup, [0.18, 0.5, 0.5], [0, 0, 0], "#1f2d2d");
          body.add(wGroup);
          wheels.push(wGroup);
        }
      }
    } else {
      // Seviye 1-2 Kurye Motoru / Scooter (Canlı Sarı / Turuncu)
      box(body, [0.45, 0.4, 1.3], [0, 0.45, 0], "#e67e22"); // Motor gövdesi
      box(body, [0.4, 0.5, 0.25], [0, 0.75, 0.35], "#f39c12"); // Ön konsol
      box(body, [0.55, 0.08, 0.08], [0, 0.95, 0.35], "#2c3e50"); // Gidon

      // Tekerlekler (Ön ve Arka)
      for (const z of [-0.45, 0.5]) {
        const wGroup = new THREE.Group();
        wGroup.position.set(0, 0.25, z);
        box(wGroup, [0.12, 0.45, 0.45], [0, 0, 0], "#1a252f");
        body.add(wGroup);
        wheels.push(wGroup);
      }
    }

    // Kargo Paketi
    const cargoBox = box(
      body,
      isVan ? [0.8, 0.6, 0.8] : [0.5, 0.4, 0.5],
      [0, isVan ? 0.9 : 0.65, isVan ? -0.4 : -0.3],
      "#d35400",
    );

    // Kurye İsim ve Durum Etiketi
    const labelSprite = label(
      `📦 ${ac.courier.name} (Sv.${ac.courier.level})`,
      "#ffffff",
      "#2c3e50",
    );
    labelSprite.scale.set(1.4, 0.42, 1);
    labelSprite.position.set(0, isVan ? 2.1 : 1.7, 0);
    courierGroup.add(labelSprite);

    group.add(courierGroup);

    return {
      group: courierGroup,
      body,
      cargoBox,
      labelSprite,
      wheels,
      wheelSpin: 0,
    };
  }

  return {
    group,

    update(couriers: ActiveCourierState[], dt: number) {
      const activeIds = new Set(couriers.map((c) => c.courier.id));

      // Artık var olmayan kuryelerin 3B modellerini temizle
      for (const [id, visual] of visualMap.entries()) {
        if (!activeIds.has(id)) {
          group.remove(visual.group);
          visualMap.delete(id);
        }
      }

      // Kuryeleri güncelle
      for (const ac of couriers) {
        let visual = visualMap.get(ac.courier.id);
        if (!visual) {
          visual = createCourierModel(ac);
          visualMap.set(ac.courier.id, visual);
        }

        // Pozisyon ve yön
        visual.group.position.set(ac.position.x, 0, ac.position.z);
        visual.group.rotation.y = ac.heading;

        // Tekerlek dönüş animasyonu
        if (ac.currentSpeed > 0.1) {
          visual.wheelSpin += ac.currentSpeed * dt * 4;
          for (const w of visual.wheels) {
            w.rotation.x = visual.wheelSpin;
          }
        }

        // Kargo paketi görünürlüğü: hedefe giderken veya teslim ederken dolu
        const hasPackage =
          ac.phase === "driving_to_target" || ac.phase === "delivering";
        visual.cargoBox.visible = hasPackage;

        // Teslimat durumunda hafif zıplama/titreme
        if (ac.phase === "delivering") {
          visual.body.position.y = Math.sin(Date.now() * 0.015) * 0.08;
        } else if (ac.phase === "loading") {
          visual.body.position.y = Math.sin(Date.now() * 0.008) * 0.04;
        } else {
          visual.body.position.y = 0;
        }
      }
    },

    dispose() {
      for (const visual of visualMap.values()) {
        group.remove(visual.group);
      }
      visualMap.clear();
    },
  };
}
