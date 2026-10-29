import * as THREE from "three";
import { box, cylinder, label } from "./world-kit";
import { DEFAULT_PITSTOP_PAD, type PitstopDef, type PitstopState } from "../game/pitstop";
import type { Vec2 } from "../game/types";

export type PitstopView = {
  group: THREE.Group;
  update(dt: number, state: PitstopState, playerPos: Vec2): void;
  dispose(): void;
};

/**
 * Lojistik Üssü için Yüksek Teknolojili Çift Soketli Hızlı Şarj (EV Quick-Charger)
 * & Yakıt/Süper-Şarj Pitstop İstasyonu 3B Sahnesi.
 */
export function createPitstopView(padDef: PitstopDef = DEFAULT_PITSTOP_PAD): PitstopView {
  const group = new THREE.Group();
  const { x, z } = padDef.position;
  group.position.set(x, 0, z);

  // 1. Zemin Pitstop Beton Platformu ve Çizgili Güvenlik Bordürleri
  box(group, [6.4, 0.08, 4.8], [0, 0.04, 0], "#2f3640");
  // Sarı/Siyah pitstop güvenlik bordürleri
  box(group, [6.6, 0.09, 0.25], [0, 0.045, -2.4], "#f1c40f");
  box(group, [6.6, 0.09, 0.25], [0, 0.045, 2.4], "#f1c40f");
  box(group, [0.25, 0.09, 4.8], [-3.2, 0.045, 0], "#f1c40f");
  box(group, [0.25, 0.09, 4.8], [3.2, 0.045, 0], "#f1c40f");

  // Pitstop içi yönlendirme şeritleri (Turkuaz & Beyaz)
  for (const sx of [-1.5, 0, 1.5]) {
    box(group, [0.18, 0.015, 2.8], [sx, 0.09, 0], "#00d2d3");
  }

  // 2. Kablosuz Endüksiyonlu Şarj / Zemin Enerji Halkası
  const outerRingGeo = new THREE.RingGeometry(2.1, 2.35, 32);
  const outerRingMat = new THREE.MeshBasicMaterial({
    color: "#00f0ff",
    transparent: true,
    opacity: 0.75,
    side: THREE.DoubleSide,
  });
  const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
  outerRing.rotation.x = -Math.PI / 2;
  outerRing.position.y = 0.095;
  group.add(outerRing);

  // İç titreşen enerji diski
  const innerDiscGeo = new THREE.CircleGeometry(1.9, 32);
  const innerDiscMat = new THREE.MeshBasicMaterial({
    color: "#00d2d3",
    transparent: true,
    opacity: 0.18,
    side: THREE.DoubleSide,
  });
  const innerDisc = new THREE.Mesh(innerDiscGeo, innerDiscMat);
  innerDisc.rotation.x = -Math.PI / 2;
  innerDisc.position.y = 0.092;
  group.add(innerDisc);

  // 3. İkiz Hızlı Şarj Kioskları (Kuzey/Sol kenarda x: -2.3, z: -1.2 ve z: 1.2)
  const kioskGroup = new THREE.Group();
  group.add(kioskGroup);

  const kioskPositions = [-1.3, 1.3];
  const screenMeshes: THREE.Mesh[] = [];
  const statusRings: THREE.Mesh[] = [];

  kioskPositions.forEach((kz) => {
    const kx = -2.3;
    // Kiosk kaidesi
    box(kioskGroup, [0.75, 1.9, 0.6], [kx, 0.95, kz], "#1e272e");
    // Kurumsal turkuaz yan paneller
    box(kioskGroup, [0.8, 1.6, 0.08], [kx, 0.95, kz + 0.28], "#00d2d3");
    box(kioskGroup, [0.8, 1.6, 0.08], [kx, 0.95, kz - 0.28], "#00d2d3");

    // Dijital ekran camı
    const screenGeo = new THREE.PlaneGeometry(0.48, 0.55);
    const screenMat = new THREE.MeshBasicMaterial({
      color: "#0984e3",
      side: THREE.DoubleSide,
    });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(kx + 0.39, 1.35, kz);
    screen.rotation.y = Math.PI / 2;
    kioskGroup.add(screen);
    screenMeshes.push(screen);

    // Kiosk tepesi durum LED halkası
    const haloGeo = new THREE.TorusGeometry(0.18, 0.04, 8, 24);
    const haloMat = new THREE.MeshBasicMaterial({
      color: "#2ed573", // Hazır yeşil
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.set(kx, 1.95, kz);
    halo.rotation.x = Math.PI / 2;
    kioskGroup.add(halo);
    statusRings.push(halo);

    // Esnek kalın şarj kablosu kıvrımı (Siyah boru)
    cylinder(kioskGroup, 0.04, 0.04, 1.4, [kx + 0.28, 0.7, kz + 0.35], "#111111", 8);
    // Tabanca / Soket yuvası
    box(kioskGroup, [0.15, 0.25, 0.12], [kx + 0.38, 0.95, kz + 0.35], "#74b9ff");
  });

  // 4. Çatı Kanopisi (Solar Fotovoltaik Sundurma)
  const canopyGroup = new THREE.Group();
  group.add(canopyGroup);

  // İki çelik taşıyıcı direk
  cylinder(canopyGroup, 0.12, 0.12, 3.6, [-2.5, 1.8, -1.8], "#718093", 8);
  cylinder(canopyGroup, 0.12, 0.12, 3.6, [-2.5, 1.8, 1.8], "#718093", 8);

  // Geniş güneş enerjili kanopi tavanı
  box(canopyGroup, [5.6, 0.22, 5.2], [0, 3.6, 0], "#1e5144");
  box(canopyGroup, [5.2, 0.08, 4.8], [0, 3.75, 0], "#2c3e50"); // Fotovoltaik solar paneller

  // Kanopi altı LED aydınlatma armatürü
  box(canopyGroup, [3.8, 0.06, 0.4], [0, 3.48, 0], "#ffffff");
  const canopyLight = new THREE.PointLight("#74b9ff", 1.2, 9);
  canopyLight.position.set(0, 3.4, 0);
  canopyGroup.add(canopyLight);

  // 5. İsim Tabelası / 3D Marka Levhası
  const signLabel = label("⚡ HIZLI ŞARJ · EV PITSTOP", "#ffffff", "#00d2d3");
  signLabel.scale.set(3.8, 1.1, 1);
  signLabel.position.set(0, 4.3, 0);
  group.add(signLabel);

  let pulseTimer = 0;

  return {
    group,
    update(dt: number, state: PitstopState, playerPos: Vec2) {
      pulseTimer += dt;
      const isCharging = state.isCharging;
      const isSupercharged = state.isSupercharged;

      // 1. Zemin enerji halkası animasyonu
      if (isCharging) {
        outerRing.scale.setScalar(1.0 + Math.sin(pulseTimer * 10) * 0.08);
        (outerRing.material as THREE.MeshBasicMaterial).color.setHex(0x00f0ff);
        (outerRing.material as THREE.MeshBasicMaterial).opacity = 0.95;

        innerDisc.scale.setScalar(1.0 + Math.cos(pulseTimer * 8) * 0.12);
        (innerDisc.material as THREE.MeshBasicMaterial).opacity = 0.45;
      } else if (isSupercharged) {
        outerRing.scale.setScalar(1.0 + Math.sin(pulseTimer * 3) * 0.03);
        (outerRing.material as THREE.MeshBasicMaterial).color.setHex(0x2ed573);
        (outerRing.material as THREE.MeshBasicMaterial).opacity = 0.8;

        innerDisc.scale.setScalar(1.0);
        (innerDisc.material as THREE.MeshBasicMaterial).opacity = 0.22;
      } else {
        outerRing.scale.setScalar(1.0);
        (outerRing.material as THREE.MeshBasicMaterial).color.setHex(0x00f0ff);
        (outerRing.material as THREE.MeshBasicMaterial).opacity = 0.7;

        innerDisc.scale.setScalar(1.0);
        (innerDisc.material as THREE.MeshBasicMaterial).opacity = 0.15;
      }

      // 2. Kiosk LED halkaları ve ekran durum renkleri
      statusRings.forEach((ring) => {
        const mat = ring.material as THREE.MeshBasicMaterial;
        if (isCharging) {
          // Yanıp sönen şarj mavi/beyazı
          const flash = Math.sin(pulseTimer * 12) > 0;
          mat.color.setHex(flash ? 0x00f0ff : 0xffffff);
        } else if (isSupercharged) {
          mat.color.setHex(0x2ed573); // Tam dolu zümrüt yeşili
        } else {
          mat.color.setHex(0x00d2d3); // Standby turkuaz
        }
      });

      screenMeshes.forEach((screen) => {
        const mat = screen.material as THREE.MeshBasicMaterial;
        if (isCharging) {
          mat.color.setHex(0x00f0ff);
        } else if (isSupercharged) {
          mat.color.setHex(0x2ed573);
        } else {
          mat.color.setHex(0x0984e3);
        }
      });

      // 3. Kanopi aydınlatması titreşimi
      if (isCharging) {
        canopyLight.intensity = 1.8 + Math.sin(pulseTimer * 14) * 0.6;
        canopyLight.color.setHex(0x00f0ff);
      } else if (isSupercharged) {
        canopyLight.intensity = 1.3;
        canopyLight.color.setHex(0x2ed573);
      } else {
        canopyLight.intensity = 1.0;
        canopyLight.color.setHex(0x74b9ff);
      }

      // 4. Tabelayı oyuncu kamerası / yönüne doğru hizala
      const dx = playerPos.x - (x + signLabel.position.x);
      const dz = playerPos.z - (z + signLabel.position.z);
      const targetAngle = Math.atan2(dx, dz);
      signLabel.rotation.y = THREE.MathUtils.lerp(signLabel.rotation.y, targetAngle, 0.08);
    },
    dispose() {
      outerRingGeo.dispose();
      outerRingMat.dispose();
      innerDiscGeo.dispose();
      innerDiscMat.dispose();
      canopyLight.dispose();
    },
  };
}
