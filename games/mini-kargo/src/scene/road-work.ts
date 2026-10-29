import * as THREE from "three";
import { box, cylinder, label } from "./world-kit";
import type { Rect } from "../game/types";
import { ROAD_WORK_CENTER } from "../game/road-work";

export type RoadWorkView = {
  group: THREE.Group;
  obstacles: Rect[];
  update(
    dt: number,
    flasherActive: boolean,
    speechText: string | null,
    isNightOrDusk?: boolean,
  ): void;
};

export function createRoadWorkView(): RoadWorkView {
  const group = new THREE.Group();
  group.name = "road-work";

  const cx = ROAD_WORK_CENTER.x;
  const cz = ROAD_WORK_CENTER.z;

  // 1. Kazılmış Asfalt / Şantiye Tabanı (Yolun kuzey şeridi: Z = -14.5)
  // Koyu asfalt kazı çukuru
  box(group, [6.5, 0.04, 2.2], [cx, 0.02, cz + 1.5], "#2c3e50");
  // Kazı içi dolgu çakıl/kum tepeciği
  box(group, [4.8, 0.22, 1.6], [cx - 0.3, 0.12, cz + 1.5], "#7f8c8d");
  box(group, [2.5, 0.35, 1.2], [cx - 0.8, 0.2, cz + 1.6], "#95a5a6");
  box(group, [1.4, 0.28, 0.9], [cx + 1.2, 0.16, cz + 1.4], "#d35400"); // Kiremit/kum molozu

  // 2. Yanıp Sönen Flaşörlü İkaz Kulesi (X = cx - 3.2, Z = cz + 1.2)
  const towerGroup = new THREE.Group();
  towerGroup.position.set(cx - 3.2, 0, cz + 1.2);
  group.add(towerGroup);

  // Kule taban ağırlığı & çelik borular
  box(towerGroup, [1.0, 0.2, 1.0], [0, 0.1, 0], "#1e272e");
  cylinder(towerGroup, 0.06, 0.06, 2.4, [-0.35, 1.2, 0], "#34495e", 8);
  cylinder(towerGroup, 0.06, 0.06, 2.4, [0.35, 1.2, 0], "#34495e", 8);
  box(towerGroup, [0.9, 0.08, 0.08], [0, 1.4, 0], "#34495e");
  box(towerGroup, [0.9, 0.08, 0.08], [0, 2.0, 0], "#34495e");

  // Sarı-Siyah Diyagonal Çizgili Uyarı Levhası
  box(towerGroup, [1.4, 0.8, 0.1], [0, 1.8, 0.05], "#f39c12");
  for (let s = -0.5; s <= 0.5; s += 0.25) {
    box(towerGroup, [0.1, 0.78, 0.12], [s, 1.8, 0.06], "#1e272e");
  }

  // Flaşör Muhafazası & LED Lens
  cylinder(towerGroup, 0.18, 0.18, 0.25, [0, 2.35, 0], "#2c3e50", 12);
  const flasherMat = new THREE.MeshStandardMaterial({
    color: "#ffaa00",
    emissive: "#ff9900",
    emissiveIntensity: 1.5,
    roughness: 0.2,
    metalness: 0.1,
  });
  const flasherGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.2, 12);
  const flasherMesh = new THREE.Mesh(flasherGeo, flasherMat);
  flasherMesh.position.set(0, 2.5, 0);
  towerGroup.add(flasherMesh);

  // Flaşör Noktasal Işığı
  const flasherLight = new THREE.PointLight("#ffaa00", 1.8, 14, 1.5);
  flasherLight.position.set(0, 2.6, 0);
  towerGroup.add(flasherLight);

  // 3. Şantiye Koruma Bariyerleri (Kırmızı-Beyaz çizgili 2 adet)
  function createBarrier(x: number, z: number, rotY = 0) {
    const bGroup = new THREE.Group();
    bGroup.position.set(x, 0, z);
    bGroup.rotation.y = rotY;
    group.add(bGroup);

    // A-frame bacaklar
    box(bGroup, [0.08, 0.9, 0.08], [-0.85, 0.45, -0.2], "#bdc3c7");
    box(bGroup, [0.08, 0.9, 0.08], [-0.85, 0.45, 0.2], "#bdc3c7");
    box(bGroup, [0.08, 0.9, 0.08], [0.85, 0.45, -0.2], "#bdc3c7");
    box(bGroup, [0.08, 0.9, 0.08], [0.85, 0.45, 0.2], "#bdc3c7");

    // Ana yatay panel
    box(bGroup, [1.9, 0.35, 0.06], [0, 0.65, 0], "#ffffff");
    // Kırmızı şeritler
    for (let i = -0.7; i <= 0.7; i += 0.35) {
      box(bGroup, [0.16, 0.35, 0.07], [i, 0.65, 0], "#e74c3c");
    }
  }

  createBarrier(cx - 2.2, cz + 0.3, 0);
  createBarrier(cx + 2.2, cz + 0.3, 0);

  // 4. Reflektörlü Turuncu Trafik Konileri (4 adet)
  const cones: THREE.Group[] = [];
  function createCone(x: number, z: number) {
    const cGroup = new THREE.Group();
    cGroup.position.set(x, 0, z);
    group.add(cGroup);
    cones.push(cGroup);

    // Taban plakası
    box(cGroup, [0.36, 0.04, 0.36], [0, 0.02, 0], "#e67e22");
    // Konik turuncu gövde
    cylinder(cGroup, 0.06, 0.16, 0.55, [0, 0.3, 0], "#e67e22", 10);
    // Beyaz reflektör halka
    cylinder(cGroup, 0.095, 0.125, 0.16, [0, 0.32, 0], "#ffffff", 10);
  }

  createCone(cx - 4.2, cz + 0.3);
  createCone(cx - 0.2, cz + 0.3);
  createCone(cx + 3.8, cz + 0.3);
  createCone(cx + 4.6, cz + 1.2);

  // 5. Belediye Yol İşçileri
  // İşçi 1: Kadir Usta (Bayrak sallayan yönlendirici - X: cx - 1.8, Z: cz + 2.2)
  const kadirGroup = new THREE.Group();
  kadirGroup.position.set(cx - 1.8, 0, cz + 2.2);
  group.add(kadirGroup);

  // Bacaklar (Mavi kot pantolon)
  box(kadirGroup, [0.16, 0.5, 0.16], [-0.11, 0.25, 0], "#2980b9");
  box(kadirGroup, [0.16, 0.5, 0.16], [0.11, 0.25, 0], "#2980b9");
  // Gövde (Fosforlu yeşil yelekli turuncu tişört)
  box(kadirGroup, [0.42, 0.52, 0.26], [0, 0.76, 0], "#d35400");
  box(kadirGroup, [0.44, 0.44, 0.28], [0, 0.78, 0], "#2ecc71"); // Fosforlu yelek
  box(kadirGroup, [0.45, 0.08, 0.29], [0, 0.78, 0], "#ecf0f1"); // Yelek reflektör şeridi
  // Kafa ve Turuncu Baret
  box(kadirGroup, [0.24, 0.24, 0.24], [0, 1.15, 0], "#f5cd79");
  box(kadirGroup, [0.32, 0.12, 0.32], [0, 1.3, 0], "#e67e22"); // Baret siperi
  box(kadirGroup, [0.26, 0.14, 0.26], [0, 1.4, 0], "#e67e22"); // Baret kubbesi

  // Kadir Usta'nın Hareketli Sağ Kolu ve Bayrağı / DUR-GEÇ Tabelası
  const kadirArm = new THREE.Group();
  kadirArm.position.set(0.24, 0.95, 0);
  kadirGroup.add(kadirArm);
  box(kadirArm, [0.12, 0.45, 0.12], [0, -0.2, 0], "#d35400");
  // Yönlendirme Tabelası
  cylinder(kadirArm, 0.03, 0.03, 0.8, [0, -0.4, 0.25], "#bdc3c7", 8);
  box(kadirArm, [0.45, 0.45, 0.04], [0, -0.75, 0.25], "#e74c3c"); // Kırmızı DUR
  cylinder(kadirArm, 0.16, 0.16, 0.05, [0, -0.75, 0.26], "#ffffff", 12); // Beyaz orta daire

  // İşçi 2: Murat Usta (Kazı / Kırıcı Ustası - X: cx + 0.8, Z: cz + 1.6)
  const muratGroup = new THREE.Group();
  muratGroup.position.set(cx + 0.8, 0, cz + 1.6);
  muratGroup.rotation.y = -0.4;
  group.add(muratGroup);

  // Bacaklar & Gövde (Hafif eğik duruş)
  box(muratGroup, [0.16, 0.46, 0.16], [-0.11, 0.23, -0.05], "#34495e");
  box(muratGroup, [0.16, 0.46, 0.16], [0.11, 0.23, 0.05], "#34495e");
  box(muratGroup, [0.42, 0.5, 0.26], [0, 0.72, 0], "#e67e22"); // Turuncu tulum
  box(muratGroup, [0.24, 0.24, 0.24], [0, 1.08, 0.06], "#eccc68"); // Baş hafif öne eğik
  box(muratGroup, [0.32, 0.12, 0.32], [0, 1.22, 0.06], "#f1c40f"); // Sarı Baret

  // Pnömatik Kırıcı Makinesi (Jackhammer)
  const drillGroup = new THREE.Group();
  drillGroup.position.set(0, 0.3, 0.25);
  muratGroup.add(drillGroup);
  box(drillGroup, [0.16, 0.45, 0.16], [0, 0.25, 0], "#2c3e50"); // Gövde
  box(drillGroup, [0.38, 0.08, 0.08], [0, 0.5, 0], "#e74c3c"); // Çift tutamak
  cylinder(drillGroup, 0.03, 0.03, 0.35, [0, 0.02, 0], "#bdc3c7", 8); // Çelik uç

  // Konuşma Balonu Sprite
  let bubbleSprite: THREE.Sprite | null = null;
  const bubbleAnchor = new THREE.Group();
  bubbleAnchor.position.set(0, 1.7, 0);
  kadirGroup.add(bubbleAnchor);

  // Engeller: Yolun kapalı kuzey şeridi (araçlar çarpıp geçemez)
  // Serbest güney şeridi: Z = -19.5 .. -16.0 arası açıktır.
  const obstacles: Rect[] = [
    {
      minX: cx - 3.8,
      maxX: cx + 3.8,
      minZ: cz - 0.2,
      maxZ: cz + 2.6,
    },
  ];

  let waveTimer = 0;
  let muratVibeTimer = 0;

  return {
    group,
    obstacles,
    update(dt: number, flasherActive: boolean, speechText: string | null, isNightOrDusk = false) {
      // 1. Flaşör ışığı ve emissive kontrolü
      const mult = isNightOrDusk ? 2.5 : 1.5;
      if (flasherActive) {
        flasherMat.emissiveIntensity = mult;
        flasherLight.intensity = mult * 1.2;
      } else {
        flasherMat.emissiveIntensity = 0.1;
        flasherLight.intensity = 0.0;
      }

      // 2. Kadir Usta bayrak sallama animasyonu
      waveTimer += dt * 3.5;
      kadirArm.rotation.z = Math.sin(waveTimer) * 0.4 - 0.3;
      kadirArm.rotation.x = Math.cos(waveTimer * 0.8) * 0.2;

      // 3. Murat Usta kırıcı titreşimi
      muratVibeTimer += dt * 25.0;
      const vibe = Math.sin(muratVibeTimer) * 0.025;
      drillGroup.position.y = 0.3 + vibe;
      muratGroup.position.y = vibe * 0.4;

      // 4. Konuşma balonu güncellemesi
      if (speechText) {
        if (!bubbleSprite || bubbleSprite.name !== speechText) {
          if (bubbleSprite) bubbleAnchor.remove(bubbleSprite);
          bubbleSprite = label(speechText, "#ffffff", "#1e272e");
          bubbleSprite.scale.set(3.6, 0.9, 1);
          bubbleSprite.name = speechText;
          bubbleAnchor.add(bubbleSprite);
        }
        bubbleSprite.visible = true;
      } else if (bubbleSprite) {
        bubbleSprite.visible = false;
      }
    },
  };
}
