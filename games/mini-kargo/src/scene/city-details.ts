import * as THREE from "three";
import { box, cylinder, label, mat } from "./world-kit";

/**
 * Şık, sevimli (cozy low-poly arcade) sokak mobilyaları, araçlar,
 * tabelalar, boru hatları ve çocuk parkı detayları.
 */

/** 🚰 Kırmızı yangın musluğu (Fire Hydrant) */
export function buildFireHydrant(parent: THREE.Object3D, x: number, z: number) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  parent.add(g);

  // Ana gövde
  cylinder(g, 0.16, 0.18, 0.65, [0, 0.32, 0], "#e74c3c", 8);
  // Üst kubbe/somun
  cylinder(g, 0.12, 0.16, 0.15, [0, 0.72, 0], "#c0392b", 8);
  // Yan hortum bağlantı çıkıntıları
  cylinder(g, 0.08, 0.08, 0.46, [0, 0.42, 0], "#bdc3c7", 8).rotation.z = Math.PI / 2;
  return g;
}

/** 🪑 Şık ahşap park bankı (Park Bench) */
export function buildParkBench(
  parent: THREE.Object3D,
  x: number,
  z: number,
  rotY = 0,
) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  parent.add(g);

  // Döküm metal ayaklar
  box(g, [0.1, 0.45, 0.55], [-0.7, 0.22, 0], "#2c3e50");
  box(g, [0.1, 0.45, 0.55], [0.7, 0.22, 0], "#2c3e50");

  // Ahşap oturma çıtaları
  for (const oz of [-0.15, 0, 0.15]) {
    box(g, [1.6, 0.06, 0.12], [0, 0.45, oz], "#a0522d");
  }

  // Ahşap sırt çıtaları
  for (const oy of [0.62, 0.76]) {
    box(g, [1.6, 0.1, 0.05], [0, oy, -0.25], "#a0522d");
  }

  return g;
}

/** 🚌 Modern camlı otobüs durağı (Bus Stop) */
export function buildBusStop(
  parent: THREE.Object3D,
  x: number,
  z: number,
  rotY = 0,
  adText = "MİNİ KARGO HIZLI VE GÜVENLİ",
) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  parent.add(g);

  // Zemin beton kaidesi
  box(g, [3.6, 0.08, 1.6], [0, 0.04, 0], "#d5dbdb");

  // Arka ve yan çelik direkler
  box(g, [0.12, 2.5, 0.12], [-1.6, 1.25, -0.6], "#34495e");
  box(g, [0.12, 2.5, 0.12], [1.6, 1.25, -0.6], "#34495e");
  box(g, [0.12, 2.5, 0.12], [-1.6, 1.25, 0.6], "#34495e");

  // Tavan tentesi
  box(g, [3.8, 0.12, 1.8], [0, 2.55, 0], "#2c3e50");

  // Arka yarı saydam cam panel
  box(g, [3.2, 1.8, 0.06], [0, 1.3, -0.6], "#74b9ff", 0.3);

  // Yan reklam paneli
  box(g, [0.1, 1.8, 1.1], [1.6, 1.3, 0], "#e67e22");
  const adSprite = label("DURAK · MİNİ KARGO", "#ffffff", "#d35400");
  adSprite.scale.set(1.4, 0.45, 1);
  adSprite.position.set(1.68, 1.4, 0);
  adSprite.rotation.y = Math.PI / 2;
  g.add(adSprite);

  // Durak içi küçük bekleme bankı
  box(g, [2.0, 0.08, 0.4], [-0.4, 0.45, -0.3], "#8e44ad");
  box(g, [0.08, 0.4, 0.3], [-1.2, 0.2, -0.3], "#2c3e50");
  box(g, [0.08, 0.4, 0.3], [0.4, 0.2, -0.3], "#2c3e50");

  return g;
}

/** 🪧 Şehir içi Reklam Panosu / Yön Levhası (Billboard / City Sign) */
export function buildBillboard(
  parent: THREE.Object3D,
  x: number,
  z: number,
  rotY = 0,
  title = "MİNİ KARGO",
  color = "#27ae60",
  bgColor = "#ffffff",
) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  parent.add(g);

  // Çift taşıyıcı çelik ayak
  cylinder(g, 0.08, 0.1, 2.4, [-1.2, 1.2, 0], "#7f8c8d", 8);
  cylinder(g, 0.08, 0.1, 2.4, [1.2, 1.2, 0], "#7f8c8d", 8);

  // Pano çerçevesi
  box(g, [3.4, 1.6, 0.16], [0, 2.8, 0], "#2c3e50");

  // Afiş yazısı
  const billboardSprite = label(title, color, bgColor);
  billboardSprite.scale.set(3.2, 1.4, 1);
  billboardSprite.position.set(0, 2.8, 0.1);
  g.add(billboardSprite);

  return g;
}

/** 🚗 Park cebine yerleşen sevimli statik low-poly sedan araba */
export function buildStaticCar(
  parent: THREE.Object3D,
  x: number,
  z: number,
  rotY = 0,
  bodyColor = "#e74c3c",
) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  parent.add(g);

  // Gövde alt tabanı
  box(g, [1.4, 0.42, 2.6], [0, 0.38, 0], bodyColor, 0.4);

  // Kabin ve tavan
  box(g, [1.2, 0.45, 1.4], [0, 0.78, -0.1], bodyColor, 0.4);

  // Ön ve arka camlar
  box(g, [1.12, 0.38, 0.1], [0, 0.76, 0.62], "#34495e", 0.2); // Ön cam
  box(g, [1.12, 0.38, 0.1], [0, 0.76, -0.82], "#34495e", 0.2); // Arka cam
  // Yan camlar
  box(g, [1.22, 0.35, 1.2], [0, 0.76, -0.1], "#34495e", 0.2);

  // Ön Farlar (parlak sarı/beyaz)
  box(g, [0.32, 0.14, 0.06], [-0.45, 0.42, 1.32], "#f1c40f", 0.1);
  box(g, [0.32, 0.14, 0.06], [0.45, 0.42, 1.32], "#f1c40f", 0.1);

  // Arka Stop Lambaları (kırmızı)
  box(g, [0.32, 0.12, 0.06], [-0.45, 0.44, -1.32], "#c0392b", 0.1);
  box(g, [0.32, 0.12, 0.06], [0.45, 0.44, -1.32], "#c0392b", 0.1);

  // 4 Adet Tekerlek
  const wheelPositions = [
    [-0.68, 0.22, 0.75],
    [0.68, 0.22, 0.75],
    [-0.68, 0.22, -0.75],
    [0.68, 0.22, -0.75],
  ];

  for (const wp of wheelPositions) {
    const wheel = cylinder(g, 0.22, 0.22, 0.16, wp, "#1e272e", 10);
    wheel.rotation.z = Math.PI / 2;
    // Jant göbeği
    const rim = cylinder(g, 0.11, 0.11, 0.17, wp, "#d2dae2", 8);
    rim.rotation.z = Math.PI / 2;
  }

  return g;
}

/** 🛝 Güneş Mahallesi Çocuk Oyun Parkı */
export function buildPlayground(parent: THREE.Object3D, x: number, z: number) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  parent.add(g);

  // Park zemin koruyucu kauçuk kaplaması (kırmızı/yeşil)
  box(g, [14, 0.06, 12], [0, 0.03, 0], "#487eb0");

  // 1. Ahşap Kenarlı Kum Havuzu
  box(g, [4.5, 0.24, 4.5], [-3.8, 0.12, 2.5], "#d35400");
  box(g, [3.9, 0.18, 3.9], [-3.8, 0.12, 2.5], "#f5cd79"); // Sarı kum

  // 2. Renkli Çocuk Kaydırağı
  const slideGroup = new THREE.Group();
  slideGroup.position.set(3.6, 0, 2.5);
  g.add(slideGroup);
  // Merdiven ve kule platformu
  box(slideGroup, [1.4, 1.4, 1.4], [0, 0.7, 0], "#3498db");
  box(slideGroup, [1.6, 0.1, 1.6], [0, 1.45, 0], "#e67e22");
  // Çatı
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(1.2, 0.9, 4),
    mat("#e74c3c"),
  );
  roof.position.set(0, 1.9, 0);
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  slideGroup.add(roof);
  // Eğimli kaydırak rampası
  const ramp = box(slideGroup, [0.75, 0.1, 2.2], [0, 0.7, -1.5], "#f1c40f");
  ramp.rotation.x = -0.65;

  // 3. İkili Salıncak
  const swingGroup = new THREE.Group();
  swingGroup.position.set(0, 0, -3.2);
  g.add(swingGroup);
  // A-şeklinde yan ahşap/metal direkler
  cylinder(swingGroup, 0.07, 0.08, 2.5, [-2.2, 1.25, 0], "#e74c3c", 8);
  cylinder(swingGroup, 0.07, 0.08, 2.5, [2.2, 1.25, 0], "#e74c3c", 8);
  // Üst yatay taşıyıcı boru
  const topBar = cylinder(swingGroup, 0.07, 0.07, 4.6, [0, 2.45, 0], "#e74c3c", 8);
  topBar.rotation.z = Math.PI / 2;
  // İki salıncak oturağı
  for (const sx of [-1.1, 1.1]) {
    cylinder(swingGroup, 0.015, 0.015, 1.8, [sx - 0.24, 1.5, 0], "#bdc3c7", 4);
    cylinder(swingGroup, 0.015, 0.015, 1.8, [sx + 0.24, 1.5, 0], "#bdc3c7", 4);
    box(swingGroup, [0.6, 0.06, 0.3], [sx, 0.55, 0], "#2ecc71");
  }

  // Park bankı
  buildParkBench(g, -3.8, -3.2, 0);

  return g;
}

/** 🏭 Sanayi Bölgesi Yüksek Endüstriyel Boru Hatları */
export function buildIndustrialPipes(
  parent: THREE.Object3D,
  startX: number,
  startZ: number,
  len: number,
  isHorizontal = true,
  height = 3.6,
) {
  const g = new THREE.Group();
  parent.add(g);

  // Taşıyıcı metalik H-ayaklar
  const step = 6.0;
  const count = Math.floor(len / step);

  for (let i = 0; i <= count; i++) {
    const cur = i * step;
    const px = isHorizontal ? startX + cur : startX;
    const pz = isHorizontal ? startZ : startZ + cur;

    // Çift dikme ve üst bağlantı
    cylinder(g, 0.09, 0.11, height, [px, height / 2, pz - 0.35], "#4b6584", 8);
    cylinder(g, 0.09, 0.11, height, [px, height / 2, pz + 0.35], "#4b6584", 8);
    box(g, [0.3, 0.12, 1.1], [px, height - 0.15, pz], "#2c3e50");
  }

  // Çift Paralel Endüstriyel Boru
  const halfLen = len / 2;
  const midX = isHorizontal ? startX + halfLen : startX;
  const midZ = isHorizontal ? startZ : startZ + halfLen;

  for (const offset of [-0.25, 0.25]) {
    const pipeColor = offset < 0 ? "#778ca3" : "#f7b731"; // Sarı gaz / gümüş su borusu
    const pipe = cylinder(g, 0.16, 0.16, len, [
      isHorizontal ? midX : midX + offset,
      height + 0.1,
      isHorizontal ? midZ + offset : midZ,
    ], pipeColor, 10);

    if (isHorizontal) {
      pipe.rotation.z = Math.PI / 2;
    } else {
      pipe.rotation.x = Math.PI / 2;
    }
  }

  return g;
}
