import * as THREE from "three";
import { box, cylinder, label, mat } from "./world-kit";
import type { Rect, Vec2 } from "../game/types";
import {
  COMMUNITY_PARK_CENTER,
  GAZEBO_POS,
  PLAYGROUND_POS,
  GARDENER_POS,
  PARK_ENTRANCE_POS,
  type CommunityParkState,
} from "../game/community-park";

export type CommunityParkView = {
  group: THREE.Group;
  obstacles: Rect[];
  update(
    dt: number,
    state: CommunityParkState,
    playerPos?: Vec2,
    isNightOrDusk?: boolean,
  ): void;
  onPlayerHonk(playerPos: Vec2): boolean;
  dispose(): void;
};

export function createCommunityParkView(): CommunityParkView {
  const group = new THREE.Group();
  group.name = "community-park";
  const obstacles: Rect[] = [];

  const cx = COMMUNITY_PARK_CENTER.x;
  const cz = COMMUNITY_PARK_CENTER.z;

  // =========================================================================
  // 1. PARK ZEMİNİ & PEYZAJ ALTYAPISI (Park Grounds & Pathways)
  // =========================================================================
  // Ana yeşil çimen zemin (18.6m x 18.6m)
  const parkBase = box(group, [18.6, 0.1, 18.6], [cx, 0.05, cz], "#78ab5a", 0.9);
  parkBase.receiveShadow = true;

  // Taş bordür çerçevesi
  box(group, [19.0, 0.16, 0.2], [cx, 0.08, cz - 9.3], "#bdc3c7");
  box(group, [19.0, 0.16, 0.2], [cx, 0.08, cz + 9.3], "#bdc3c7");
  box(group, [0.2, 0.16, 18.6], [cx - 9.3, 0.08, cz], "#bdc3c7");
  box(group, [0.2, 0.16, 18.6], [cx + 9.3, 0.08, cz], "#bdc3c7");

  // Taş kaplama yürüyüş yolları (Kuzey-Güney & Doğu-Batı kesişen haç yollar)
  // Güney girişten kuzeye uzanan ana yol (X = cx, Z: cz+9.2 .. cz-9.2, Genişlik 2.6m)
  box(group, [2.6, 0.08, 18.4], [cx, 0.07, cz], "#ded6be", 0.8);
  // Doğu-Batı bağlantı yolu (Z = cz, X: cx-9.2 .. cx+9.2, Genişlik 2.4m)
  box(group, [18.4, 0.08, 2.4], [cx, 0.075, cz], "#ded6be", 0.8);
  // Merkez dairesel meydan döşemesi
  cylinder(group, 2.8, 2.8, 0.09, [cx, 0.08, cz], "#ded6be", 16);

  // Park Giriş Karşılama Takı (Güney Giriş: X = PARK_ENTRANCE_POS.x, Z = PARK_ENTRANCE_POS.z)
  const archGroup = new THREE.Group();
  archGroup.position.set(PARK_ENTRANCE_POS.x, 0, PARK_ENTRANCE_POS.z);
  group.add(archGroup);

  // Ahşap giriş dikmeleri
  box(archGroup, [0.24, 3.4, 0.24], [-1.8, 1.7, 0], "#5d4037");
  box(archGroup, [0.24, 3.4, 0.24], [1.8, 1.7, 0], "#5d4037");
  // Üst kemer kirişi
  box(archGroup, [4.2, 0.28, 0.3], [0, 3.4, 0], "#4e342e");
  box(archGroup, [3.8, 0.12, 0.36], [0, 3.6, 0], "#3e2723");

  // Ahşap Park Giriş Tabelası ("🏡 GÜNEŞ MAHALLESİ PARK & ÇOCUK ALANI")
  const entranceSign = label("🏡 GÜNEŞ MAHALLESİ PARK & ÇOCUK ALANI", "#ffffff", "#27ae60");
  entranceSign.scale.set(3.8, 0.65, 1);
  entranceSign.position.set(0, 3.0, 0.16);
  archGroup.add(entranceSign);

  // Giriş asılı fenerleri
  for (const lx of [-1.8, 1.8]) {
    cylinder(archGroup, 0.015, 0.015, 0.4, [lx, 3.1, 0], "#2c3e50", 4);
    const lampMesh = cylinder(archGroup, 0.14, 0.1, 0.24, [lx, 2.85, 0], "#fff3bf", 8);
    lampMesh.castShadow = true;
  }

  // Beyaz boyalı sevimli köşe bahçe çitleri
  const fenceCoords = [
    // Kuzeybatı çitleri
    { x: cx - 6.2, z: cz - 9.1, w: 5.6, d: 0.1 },
    { x: cx - 9.1, z: cz - 6.2, w: 0.1, d: 5.6 },
    // Kuzeydoğu çitleri
    { x: cx + 6.2, z: cz - 9.1, w: 5.6, d: 0.1 },
    { x: cx + 9.1, z: cz - 6.2, w: 0.1, d: 5.6 },
    // Güneybatı çitleri
    { x: cx - 6.2, z: cz + 9.1, w: 5.6, d: 0.1 },
    { x: cx - 9.1, z: cz + 6.2, w: 0.1, d: 5.6 },
    // Güneydoğu çitleri
    { x: cx + 6.2, z: cz + 9.1, w: 5.6, d: 0.1 },
    { x: cx + 9.1, z: cz + 6.2, w: 0.1, d: 5.6 },
  ];
  for (const f of fenceCoords) {
    box(group, [f.w, 0.65, f.d], [f.x, 0.42, f.z], "#f8f9fa");
    box(group, [f.w + 0.1, 0.08, f.d + 0.04], [f.x, 0.72, f.z], "#ffffff");
  }

  // Renkli çiçek tarhları (Ahşap çerçeveli gül ve lavanta tarhları)
  const flowerBedConfigs = [
    { x: cx + 4.5, z: cz + 5.5, w: 3.2, d: 1.6, flowerColor: "#e74c3c" }, // Kırmızı güller
    { x: cx + 4.5, z: cz - 5.5, w: 3.2, d: 1.6, flowerColor: "#f1c40f" }, // Sarı kadifeler
    { x: cx - 4.5, z: cz + 5.5, w: 3.2, d: 1.6, flowerColor: "#9b59b6" }, // Mor lavantalar
  ];
  for (const fb of flowerBedConfigs) {
    // Ahşap yükseltilmiş çerçeve
    box(group, [fb.w, 0.25, fb.d], [fb.x, 0.18, fb.z], "#6d4c41");
    box(group, [fb.w - 0.25, 0.22, fb.d - 0.25], [fb.x, 0.19, fb.z], "#3e2723"); // Verimli kara toprak
    // Çiçek kümeleri
    for (let fx = -fb.w / 2 + 0.35; fx <= fb.w / 2 - 0.35; fx += 0.55) {
      for (let fz = -fb.d / 2 + 0.35; fz <= fb.d / 2 - 0.35; fz += 0.55) {
        // Yeşil yaprak kümesi
        cylinder(group, 0.16, 0.08, 0.18, [fb.x + fx, 0.32, fb.z + fz], "#27ae60", 6);
        // Çiçek tacı
        cylinder(group, 0.12, 0.12, 0.08, [fb.x + fx, 0.44, fb.z + fz], fb.flowerColor, 6);
      }
    }
  }

  // Mahalle Hayrat Çeşmesi (Taş kaideli pirinç musluklu sokak çeşmesi)
  const fountainGroup = new THREE.Group();
  fountainGroup.position.set(cx - 1.8, 0, cz - 1.8);
  group.add(fountainGroup);
  // Mermer/Taş gövde
  box(fountainGroup, [0.75, 1.45, 0.65], [0, 0.75, 0], "#ecf0f1");
  box(fountainGroup, [0.85, 0.15, 0.75], [0, 1.52, 0], "#bdc3c7"); // Çatı taç taşı
  box(fountainGroup, [0.65, 0.35, 0.45], [0, 0.25, 0.42], "#95a5a6"); // Su teknesi
  box(fountainGroup, [0.55, 0.08, 0.35], [0, 0.32, 0.42], "#3498db"); // Tekne içi su
  // Pirinç musluk
  cylinder(fountainGroup, 0.03, 0.03, 0.22, [0, 0.85, 0.38], "#f39c12", 6);
  // Minik kitabe
  const fountainSign = label("HAYRAT", "#2c3e50", "#ecf0f1");
  fountainSign.scale.set(0.65, 0.25, 1);
  fountainSign.position.set(0, 1.25, 0.34);
  fountainGroup.add(fountainSign);

  // Klasik park bankları (Döküm ayaklı ahşap çıtalı banklar)
  const benchPositions = [
    { x: cx + 1.8, z: cz + 3.2, rot: Math.PI / 2 },
    { x: cx + 1.8, z: cz - 3.2, rot: Math.PI / 2 },
    { x: cx - 1.8, z: cz + 3.2, rot: -Math.PI / 2 },
    { x: cx - 3.2, z: cz + 1.8, rot: 0 },
  ];
  for (const bp of benchPositions) {
    const bg = new THREE.Group();
    bg.position.set(bp.x, 0, bp.z);
    bg.rotation.y = bp.rot;
    group.add(bg);
    // Döküm metal bacaklar
    cylinder(bg, 0.04, 0.04, 0.42, [-0.65, 0.21, -0.15], "#2c3e50", 6);
    cylinder(bg, 0.04, 0.04, 0.42, [0.65, 0.21, -0.15], "#2c3e50", 6);
    cylinder(bg, 0.04, 0.04, 0.42, [-0.65, 0.21, 0.15], "#2c3e50", 6);
    cylinder(bg, 0.04, 0.04, 0.42, [0.65, 0.21, 0.15], "#2c3e50", 6);
    // Ahşap oturak çıtaları
    box(bg, [1.5, 0.05, 0.45], [0, 0.44, 0], "#d35400");
    // Ahşap sırtlık çıtaları
    box(bg, [1.5, 0.38, 0.05], [0, 0.72, -0.2], "#d35400");
  }

  // =========================================================================
  // 2. GELENEKSEL AHŞAP KAMELYA / GAZEBO (Traditional Pavilion)
  // =========================================================================
  const gazeboGroup = new THREE.Group();
  gazeboGroup.position.set(GAZEBO_POS.x, 0, GAZEBO_POS.z);
  group.add(gazeboGroup);

  const gazeboR = 2.5; // Yarıçap
  const gazeboH = 2.4; // Sütun yüksekliği

  // Sekizgen yükseltilmiş ahşap taban platformu (2 basamaklı erişim)
  cylinder(gazeboGroup, gazeboR + 0.2, gazeboR + 0.35, 0.14, [0, 0.07, 0], "#a07855", 8);
  cylinder(gazeboGroup, gazeboR, gazeboR, 0.14, [0, 0.21, 0], "#b8860b", 8);

  // 8 adet taşıyıcı ahşap sütun
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const px = Math.cos(angle) * (gazeboR - 0.2);
    const pz = Math.sin(angle) * (gazeboR - 0.2);
    // Sütun
    cylinder(gazeboGroup, 0.07, 0.08, gazeboH, [px, 0.28 + gazeboH / 2, pz], "#5d4037", 8);

    // Giriş açıklığı hariç korkuluklar (0. açı giriş kapısı)
    if (i !== 4) {
      const nextAngle = ((i + 1) / 8) * Math.PI * 2;
      const nx = Math.cos(nextAngle) * (gazeboR - 0.2);
      const nz = Math.sin(nextAngle) * (gazeboR - 0.2);
      const mx = (px + nx) / 2;
      const mz = (pz + nz) / 2;
      const segLen = Math.hypot(nx - px, nz - pz);
      const segAngle = Math.atan2(nz - pz, nx - px);

      const rail = new THREE.Group();
      rail.position.set(mx, 0.65, mz);
      rail.rotation.y = -segAngle;
      box(rail, [segLen, 0.06, 0.06], [0, 0, 0], "#6d4c41");
      box(rail, [segLen, 0.06, 0.06], [0, -0.32, 0], "#6d4c41");
      // Dikey parmaklıklar
      for (let rx = -segLen / 2 + 0.2; rx <= segLen / 2 - 0.2; rx += 0.28) {
        box(rail, [0.04, 0.32, 0.04], [rx, -0.16, 0], "#8d6e63");
      }
      gazeboGroup.add(rail);

      // İç çeper oturma bankı
      const bench = new THREE.Group();
      bench.position.set(mx * 0.88, 0.48, mz * 0.88);
      bench.rotation.y = -segAngle;
      box(bench, [segLen * 0.85, 0.06, 0.32], [0, 0, 0], "#8d6e63");
      gazeboGroup.add(bench);
    }
  }

  // Çatı taşıyıcı sekizgen ahşap halka
  cylinder(gazeboGroup, gazeboR - 0.1, gazeboR - 0.1, 0.12, [0, 0.28 + gazeboH, 0], "#4e342e", 8);

  // Kiremit çatılı sekizgen piramidal çatı
  const roofGeom = new THREE.ConeGeometry(gazeboR + 0.35, 1.45, 8);
  const roofMesh = new THREE.Mesh(roofGeom, mat("#c0392b", 0.7));
  roofMesh.position.set(0, 0.28 + gazeboH + 0.725, 0);
  roofMesh.castShadow = true;
  gazeboGroup.add(roofMesh);

  // Çatı zirve pirinç alem süsü (Finial spike)
  cylinder(gazeboGroup, 0.04, 0.04, 0.5, [0, 0.28 + gazeboH + 1.6, 0], "#f1c40f", 8);
  const finialBall = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), mat("#f1c40f", 0.3));
  finialBall.position.set(0, 0.28 + gazeboH + 1.85, 0);
  gazeboGroup.add(finialBall);

  // Kamelya içi piknik masası & bakır semaver
  cylinder(gazeboGroup, 0.75, 0.75, 0.08, [0, 0.72, 0], "#8d6e63", 8);
  cylinder(gazeboGroup, 0.12, 0.15, 0.48, [0, 0.48, 0], "#5d4037", 8);
  // Bakır semaver
  cylinder(gazeboGroup, 0.14, 0.16, 0.32, [0, 0.92, 0], "#d35400", 8);
  cylinder(gazeboGroup, 0.03, 0.03, 0.15, [0, 1.12, 0], "#2c3e50", 6); // Baca
  cylinder(gazeboGroup, 0.02, 0.02, 0.06, [0.15, 0.88, 0], "#f1c40f", 6); // Musluk

  // Sıcak akkor asılı tavan feneri
  cylinder(gazeboGroup, 0.015, 0.015, 0.5, [0, 0.28 + gazeboH - 0.25, 0], "#2c3e50", 4);
  const gazeboLamp = cylinder(gazeboGroup, 0.16, 0.12, 0.26, [0, 0.28 + gazeboH - 0.55, 0], "#fbeecc", 8);
  gazeboLamp.castShadow = true;

  // Rüzgar Çanı Mekanizması (Kamelya giriş saçağında asılı metal çanlar)
  const windChimeGroup = new THREE.Group();
  windChimeGroup.position.set(0, 0.28 + gazeboH - 0.15, -(gazeboR - 0.3));
  gazeboGroup.add(windChimeGroup);
  // Çan ahşap üst diski
  cylinder(windChimeGroup, 0.12, 0.12, 0.02, [0, 0, 0], "#5d4037", 8);
  // 5 adet gümüş/pirinç rezonans borusu
  const tubeOffsets = [
    { x: -0.06, z: -0.06, len: 0.35 },
    { x: 0.06, z: -0.06, len: 0.42 },
    { x: -0.06, z: 0.06, len: 0.38 },
    { x: 0.06, z: 0.06, len: 0.46 },
    { x: 0.0, z: 0.0, len: 0.5 },
  ];
  for (const to of tubeOffsets) {
    cylinder(windChimeGroup, 0.01, 0.01, to.len, [to.x, -to.len / 2 - 0.02, to.z], "#bdc3c7", 6);
  }

  // Kamelya Engeli
  obstacles.push({
    minX: GAZEBO_POS.x - 2.6,
    maxX: GAZEBO_POS.x + 2.6,
    minZ: GAZEBO_POS.z - 2.6,
    maxZ: GAZEBO_POS.z + 2.6,
  });

  // =========================================================================
  // 3. ZENGİNLEŞTİRİLMİŞ ÇOCUK OYUN ALANI (Children's Playground)
  // =========================================================================
  const playgroundGroup = new THREE.Group();
  playgroundGroup.position.set(PLAYGROUND_POS.x, 0, PLAYGROUND_POS.z);
  group.add(playgroundGroup);

  // Darbe emici kauçuk zemin kaplaması (10.5m x 8.5m - Bordo & Okyanus Mavisi dama deseni)
  const rubW = 10.5;
  const rubD = 8.5;
  const tileCols = ["#c0392b", "#2980b9"];
  for (let rx = -rubW / 2 + 0.75; rx <= rubW / 2 - 0.75; rx += 1.5) {
    for (let rz = -rubD / 2 + 0.75; rz <= rubD / 2 - 0.75; rz += 1.5) {
      const idx = Math.abs(Math.round((rx + rz) / 1.5)) % 2;
      box(playgroundGroup, [1.46, 0.04, 1.46], [rx, 0.08, rz], tileCols[idx], 0.9);
    }
  }

  // 3.1. Oyun Kulesi & Sarı Helezon / Eğimli Kaydırak (Play Tower & Slide)
  const towerGroup = new THREE.Group();
  towerGroup.position.set(1.5, 0, 1.2);
  playgroundGroup.add(towerGroup);

  const towerH = 1.6;
  // 4 adet ahşap dikme sütun
  cylinder(towerGroup, 0.08, 0.08, towerH + 1.2, [-0.9, (towerH + 1.2) / 2, -0.9], "#e67e22", 8);
  cylinder(towerGroup, 0.08, 0.08, towerH + 1.2, [0.9, (towerH + 1.2) / 2, -0.9], "#e67e22", 8);
  cylinder(towerGroup, 0.08, 0.08, towerH + 1.2, [-0.9, (towerH + 1.2) / 2, 0.9], "#e67e22", 8);
  cylinder(towerGroup, 0.08, 0.08, towerH + 1.2, [0.9, (towerH + 1.2) / 2, 0.9], "#e67e22", 8);

  // Kule platformu
  box(towerGroup, [1.9, 0.12, 1.9], [0, towerH, 0], "#f39c12");
  // Güvenlik korkulukları
  box(towerGroup, [1.8, 0.6, 0.06], [0, towerH + 0.35, -0.9], "#3498db");
  box(towerGroup, [0.06, 0.6, 1.8], [0.9, towerH + 0.35, 0], "#3498db");

  // Rengarenk Kule Kumaş Çatısı (Piramit tente)
  const tentRoof = new THREE.Mesh(
    new THREE.ConeGeometry(1.5, 1.1, 4),
    mat("#e74c3c", 0.6),
  );
  tentRoof.position.set(0, towerH + 1.65, 0);
  tentRoof.rotation.y = Math.PI / 4;
  tentRoof.castShadow = true;
  towerGroup.add(tentRoof);

  // Tırmanma merdiveni (Kuzey tarafı)
  for (let ly = 0.25; ly <= towerH; ly += 0.28) {
    cylinder(towerGroup, 0.02, 0.02, 0.7, [-0.9, ly, 0], "#2ecc71", 6);
  }

  // Parlak sarı eğimli ve kavisli kaydırak rampası
  const slideRamp = box(towerGroup, [0.85, 0.12, 3.2], [0, towerH * 0.52, -1.9], "#f1c40f", 0.4);
  slideRamp.rotation.x = -0.52;
  // Kaydırak güvenlik bordürleri
  const borderL = box(towerGroup, [0.08, 0.25, 3.2], [-0.42, towerH * 0.52 + 0.08, -1.9], "#e67e22", 0.4);
  borderL.rotation.x = -0.52;
  const borderR = box(towerGroup, [0.08, 0.25, 3.2], [0.42, towerH * 0.52 + 0.08, -1.9], "#e67e22", 0.4);
  borderR.rotation.x = -0.52;

  // Oyun Kulesi Engeli
  obstacles.push({
    minX: PLAYGROUND_POS.x + 0.2,
    maxX: PLAYGROUND_POS.x + 2.8,
    minZ: PLAYGROUND_POS.z - 0.2,
    maxZ: PLAYGROUND_POS.z + 2.5,
  });

  // 3.2. İkili Dinamik Salıncak (Twin Classic Swings)
  const swingFrameGroup = new THREE.Group();
  swingFrameGroup.position.set(-2.8, 0, 1.0);
  playgroundGroup.add(swingFrameGroup);

  const swingH = 2.7;
  // Kırmızı A-şeklinde yan direkler
  cylinder(swingFrameGroup, 0.07, 0.08, swingH + 0.2, [-1.8, swingH / 2, 0], "#e74c3c", 8);
  cylinder(swingFrameGroup, 0.07, 0.08, swingH + 0.2, [1.8, swingH / 2, 0], "#e74c3c", 8);
  // Üst yatay taşıyıcı kiriş
  const swingTopBar = cylinder(swingFrameGroup, 0.07, 0.07, 3.8, [0, swingH, 0], "#e74c3c", 8);
  swingTopBar.rotation.z = Math.PI / 2;

  // İki salıncak oturağı ve salınım mafsalları
  const swingPivots: THREE.Group[] = [];
  for (const sx of [-0.95, 0.95]) {
    const sp = new THREE.Group();
    sp.position.set(sx, swingH - 0.05, 0);
    swingFrameGroup.add(sp);
    swingPivots.push(sp);

    // Askı zincirleri
    cylinder(sp, 0.015, 0.015, 1.9, [-0.26, -0.95, 0], "#bdc3c7", 4);
    cylinder(sp, 0.015, 0.015, 1.9, [0.26, -0.95, 0], "#bdc3c7", 4);
    // Yeşil kauçuk oturak
    box(sp, [0.65, 0.06, 0.28], [0, -1.9, 0], "#2ecc71");
  }

  // 3.3. Yaylı Atlı Zıpzıp (Spring Rocker Pony)
  const rockerGroup = new THREE.Group();
  rockerGroup.position.set(-2.2, 0, -2.4);
  playgroundGroup.add(rockerGroup);

  // Zemin ankor plakası
  cylinder(rockerGroup, 0.35, 0.35, 0.06, [0, 0.09, 0], "#2c3e50", 8);
  // Ağır çelik helezon yay simülasyonu
  const springPivot = new THREE.Group();
  springPivot.position.set(0, 0.12, 0);
  rockerGroup.add(springPivot);

  for (let sy = 0.05; sy <= 0.45; sy += 0.08) {
    cylinder(springPivot, 0.09, 0.09, 0.04, [0, sy, 0], "#34495e", 8);
  }

  // Sevimli turuncu at silüeti gövdesi
  box(springPivot, [0.85, 0.45, 0.14], [0, 0.65, 0], "#e67e22");
  // At boynu ve başı
  box(springPivot, [0.28, 0.42, 0.14], [0.35, 0.95, 0], "#e67e22");
  box(springPivot, [0.35, 0.22, 0.14], [0.45, 1.15, 0], "#e67e22");
  // Kırmızı eyer
  box(springPivot, [0.38, 0.06, 0.18], [-0.05, 0.88, 0], "#c0392b");
  // Tutunma kolları (Handlebars)
  const handle = cylinder(springPivot, 0.02, 0.02, 0.38, [0.35, 1.05, 0], "#f1c40f", 6);
  handle.rotation.x = Math.PI / 2;
  // Ayak basma basamakları
  const pegs = cylinder(springPivot, 0.02, 0.02, 0.34, [0.15, 0.52, 0], "#f1c40f", 6);
  pegs.rotation.x = Math.PI / 2;

  // 3.4. Dönen Çocuk Karuseli (Rotating Merry-Go-Round)
  const carouselBase = new THREE.Group();
  carouselBase.position.set(2.0, 0, -2.4);
  playgroundGroup.add(carouselBase);

  // Merkez mil kaidesi
  cylinder(carouselBase, 0.25, 0.28, 0.22, [0, 0.15, 0], "#2c3e50", 8);

  // Dönen dairesel platform
  const carouselPivot = new THREE.Group();
  carouselPivot.position.set(0, 0.24, 0);
  carouselBase.add(carouselPivot);

  cylinder(carouselPivot, 1.35, 1.35, 0.06, [0, 0.04, 0], "#2ecc71", 16);
  cylinder(carouselPivot, 0.12, 0.12, 0.75, [0, 0.4, 0], "#f1c40f", 8); // Merkez direk

  // 4 adet tutunma parmaklığı (Yeşil ve sarı eğriler)
  for (let ca = 0; ca < 4; ca++) {
    const angle = (ca / 4) * Math.PI * 2;
    const hg = new THREE.Group();
    hg.rotation.y = angle;
    cylinder(hg, 0.025, 0.025, 0.7, [0.85, 0.4, 0], "#e74c3c", 6);
    box(hg, [0.85, 0.04, 0.04], [0.42, 0.72, 0], "#f1c40f");
    carouselPivot.add(hg);
  }

  // 3.5. Ahşap Kenarlı Kum Havuzu (Wooden Sandbox)
  const sandBoxGroup = new THREE.Group();
  sandBoxGroup.position.set(0, 0, -2.4);
  // Ahşap kenarlık (2.8m x 2.8m)
  box(sandBoxGroup, [2.8, 0.22, 2.8], [0, 0.15, 0], "#d35400");
  box(sandBoxGroup, [2.4, 0.16, 2.4], [0, 0.16, 0], "#f5cd79"); // Sarı deniz kumu
  // Minik oyuncak kova ve kürek
  cylinder(sandBoxGroup, 0.1, 0.07, 0.15, [-0.5, 0.28, 0.4], "#e74c3c", 8);
  box(sandBoxGroup, [0.04, 0.22, 0.08], [0.4, 0.26, -0.3], "#3498db");
  playgroundGroup.add(sandBoxGroup);

  // =========================================================================
  // 4. BAHÇIVAN SELAHATTİN EFENDİ NPC (Gardener NPC)
  // =========================================================================
  const gardenerGroup = new THREE.Group();
  gardenerGroup.position.set(GARDENER_POS.x, 0, GARDENER_POS.z);
  gardenerGroup.rotation.y = 0.3;
  group.add(gardenerGroup);

  // Bacaklar & Çizmeler
  box(gardenerGroup, [0.15, 0.65, 0.16], [-0.11, 0.32, 0], "#4b654c"); // Zeytin yeşili bahçıvan tulumu
  box(gardenerGroup, [0.15, 0.65, 0.16], [0.11, 0.32, 0], "#4b654c");
  box(gardenerGroup, [0.16, 0.14, 0.26], [-0.11, 0.07, 0.04], "#3e2723"); // Kahverengi bahçe çizmeleri
  box(gardenerGroup, [0.16, 0.14, 0.26], [0.11, 0.07, 0.04], "#3e2723");

  // Gövde & Bahçıvan Tulumu
  box(gardenerGroup, [0.44, 0.58, 0.28], [0, 0.94, 0], "#4b654c");
  // Açık renk pamuklu gömlek kolları & yaka
  box(gardenerGroup, [0.22, 0.12, 0.04], [0, 1.18, 0.14], "#f5f6fa");
  // Tulum ön cebi ve bahçe makası
  box(gardenerGroup, [0.22, 0.16, 0.03], [0, 0.95, 0.15], "#3c503d");
  box(gardenerGroup, [0.03, 0.14, 0.02], [-0.05, 1.05, 0.15], "#bdc3c7"); // Makas sapı

  // Kafa, Bıyık ve Hasır Şapka
  const gardenerHead = new THREE.Group();
  gardenerHead.position.set(0, 1.4, 0);
  box(gardenerHead, [0.24, 0.24, 0.24], [0, 0, 0], "#f5cd79");
  // Güler yüzlü beyaz/gri pala bıyık
  box(gardenerHead, [0.18, 0.06, 0.06], [0, -0.05, 0.14], "#ecf0f1");
  // Hasır bahçıvan şapkası (Geniş siperlik & taç)
  cylinder(gardenerHead, 0.38, 0.38, 0.04, [0, 0.12, 0], "#eedc82", 12);
  cylinder(gardenerHead, 0.2, 0.22, 0.16, [0, 0.22, 0], "#eedc82", 10);
  cylinder(gardenerHead, 0.205, 0.205, 0.04, [0, 0.16, 0], "#27ae60", 10); // Yeşil şapka bandı
  gardenerGroup.add(gardenerHead);

  // Kollar & Sulama İbriği (Watering can)
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.26, 1.18, 0);
  box(leftArm, [0.12, 0.48, 0.12], [0, -0.22, 0], "#4b654c");
  box(leftArm, [0.1, 0.12, 0.1], [0, -0.48, 0], "#f5cd79");
  gardenerGroup.add(leftArm);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.26, 1.18, 0);
  box(rightArm, [0.12, 0.48, 0.12], [0, -0.22, 0], "#4b654c");
  box(rightArm, [0.1, 0.12, 0.1], [0, -0.48, 0], "#f5cd79");
  gardenerGroup.add(rightArm);

  // Galvanizli Çelik Çiçek Sulama İbriği (Watering Can)
  const wateringCan = new THREE.Group();
  wateringCan.position.set(0.04, -0.48, 0.22);
  wateringCan.rotation.x = 0.25;
  rightArm.add(wateringCan);

  // İbrik gövdesi
  cylinder(wateringCan, 0.12, 0.14, 0.24, [0, 0, 0], "#7f8c8d", 8);
  // İbrik emziği (Spout)
  const spout = cylinder(wateringCan, 0.025, 0.03, 0.28, [0, 0.1, 0.16], "#7f8c8d", 6);
  spout.rotation.x = 0.75;
  // Pirinç süzgeç başlığı (Rose)
  cylinder(wateringCan, 0.06, 0.04, 0.05, [0, 0.22, 0.28], "#f1c40f", 6);
  // Taşıma kulbu
  box(wateringCan, [0.03, 0.18, 0.16], [0, 0.12, -0.06], "#57606f");

  // Selahattin Efendi Konuşma Balonu
  const gardenerBubble = label("🌻 Hoş geldin evlat!", "#2c3e50", "#ffffff");
  gardenerBubble.scale.set(3.2, 0.65, 1);
  gardenerBubble.position.set(0, 2.1, 0);
  gardenerBubble.visible = false;
  gardenerGroup.add(gardenerBubble);

  let waveTimer = 0;
  let bubbleTimer = 0;

  return {
    group,
    obstacles,

    update(dt: number, state: CommunityParkState, playerPos?: Vec2, isNightOrDusk = false) {
      // 1. Dinamik Salıncak Salınımı
      if (swingPivots.length >= 2) {
        swingPivots[0].rotation.x = state.swingAngle;
        swingPivots[1].rotation.x = -state.swingAngle * 0.85;
      }

      // 2. Dinamik Yaylı Zıpzıp Sallanması
      springPivot.rotation.z = state.rockerAngle;
      springPivot.rotation.x = state.rockerAngle * 0.4;

      // 3. Karusel Dönüşü
      carouselPivot.rotation.y = state.carouselAngle;

      // 4. Rüzgar çanı hafif salınımı
      windChimeGroup.rotation.z = Math.sin(state.gardenerWaterTimer * 2.2) * 0.08;

      // 5. Bahçıvan Selahattin NPC Kafa Takibi & Sulama Hareketi
      if (playerPos) {
        const dist = Math.hypot(
          playerPos.x - gardenerGroup.position.x,
          playerPos.z - gardenerGroup.position.z,
        );

        if (dist < 14.0) {
          const targetYaw =
            Math.atan2(
              playerPos.x - gardenerGroup.position.x,
              playerPos.z - gardenerGroup.position.z,
            ) - gardenerGroup.rotation.y;
          const clampedYaw = Math.max(-1.15, Math.min(1.15, targetYaw));
          gardenerHead.rotation.y = THREE.MathUtils.lerp(
            gardenerHead.rotation.y,
            clampedYaw,
            dt * 5,
          );

          if (dist < 6.5 && waveTimer <= 0) {
            waveTimer = 2.0;
          }
        } else {
          gardenerHead.rotation.y = THREE.MathUtils.lerp(gardenerHead.rotation.y, 0, dt * 2);
        }
      }

      // El sallama / sulama hareketi
      if (waveTimer > 0) {
        waveTimer -= dt;
        // Sol kolunu havaya kaldırıp sallar
        leftArm.rotation.x = -Math.PI / 1.5 + Math.sin(state.gardenerWaterTimer * 12) * 0.45;
        leftArm.rotation.z = -0.3 + Math.sin(state.gardenerWaterTimer * 8) * 0.25;
      } else {
        leftArm.rotation.x = THREE.MathUtils.lerp(leftArm.rotation.x, 0, dt * 4);
        leftArm.rotation.z = THREE.MathUtils.lerp(leftArm.rotation.z, 0, dt * 4);
      }

      // Sağ kol sulama hareketi (İbriği eğip kaldırma)
      if (waveTimer <= 0) {
        rightArm.rotation.x = -0.35 + Math.sin(state.gardenerWaterTimer * 2.5) * 0.22;
      }

      // Konuşma balonu güncellemesi
      if (state.lastHonkCallout || state.honkGreetingTimer > 0) {
        gardenerBubble.visible = true;
      } else if (bubbleTimer > 0) {
        bubbleTimer -= dt;
        if (bubbleTimer <= 0) gardenerBubble.visible = false;
      } else {
        gardenerBubble.visible = false;
      }

      // Gece fener aydınlatma modülasyonu
      const nightIntensity = isNightOrDusk ? 1.6 : 0.0;
      (gazeboLamp.material as THREE.MeshStandardMaterial).emissive.set("#ffdd66");
      (gazeboLamp.material as THREE.MeshStandardMaterial).emissiveIntensity = nightIntensity;
    },

    onPlayerHonk(playerPos: Vec2): boolean {
      const dist = Math.hypot(
        playerPos.x - gardenerGroup.position.x,
        playerPos.z - gardenerGroup.position.z,
      );
      if (dist < 22.0) {
        waveTimer = 3.5;
        bubbleTimer = 4.0;
        gardenerBubble.visible = true;
        return true;
      }
      return false;
    },

    dispose() {
      group.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material?.dispose();
          }
        } else if (obj instanceof THREE.Sprite) {
          obj.material?.map?.dispose();
          obj.material?.dispose();
        }
      });
      group.clear();
    },
  };
}
