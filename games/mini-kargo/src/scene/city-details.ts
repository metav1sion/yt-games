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

/** 🎪 Çarşı Açık Hava Pazar / Esnaf Tezgahı (Market Stall with Striped Canopy) */
export function buildMarketStall(
  parent: THREE.Object3D,
  x: number,
  z: number,
  rotY = 0,
  awningColor1 = "#e74c3c",
  awningColor2 = "#ffffff",
  goodsColor = "#e67e22",
  signText = "TAZE PAZAR",
) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  parent.add(g);

  // 4 Ahşap Köşe Ayağı
  const legColor = "#8c6239";
  for (const lx of [-1.1, 1.1]) {
    for (const lz of [-0.65, 0.65]) {
      cylinder(g, 0.05, 0.05, 2.2, [lx, 1.1, lz], legColor, 6);
    }
  }

  // Ahşap Tezgah Masası ve Alt Çıtalar
  box(g, [2.4, 0.12, 1.4], [0, 0.85, 0], "#a07855"); // Masa tablası
  box(g, [2.3, 0.35, 1.3], [0, 0.62, 0], "#7a5230"); // Tezgah alt sandığı

  // Eğimli Çizgili Kumaş Tente (Çatılı Gölgelik)
  const canopy = new THREE.Group();
  canopy.position.set(0, 2.15, 0);
  g.add(canopy);

  // Çizgili kumaş dilimleri (Stripes)
  const stripeWidth = 0.3;
  const stripes = [-1.05, -0.75, -0.45, -0.15, 0.15, 0.45, 0.75, 1.05];
  stripes.forEach((sx, idx) => {
    const col = idx % 2 === 0 ? awningColor1 : awningColor2;
    // Ön eğimli parça
    const stripe = box(canopy, [stripeWidth - 0.02, 0.05, 0.85], [sx, 0.1, 0.35], col);
    stripe.rotation.x = 0.22;
    // Arka eğimli parça
    const backStripe = box(canopy, [stripeWidth - 0.02, 0.05, 0.85], [sx, 0.1, -0.35], col);
    backStripe.rotation.x = -0.22;
    // Ön sarkan süs kumaş ucu (Valance)
    box(canopy, [stripeWidth - 0.02, 0.18, 0.04], [sx, -0.06, 0.76], col);
  });

  // Tezgah Üstündeki Taze Ürün Kasaları ve Meyveler/Mallar
  for (const [cx, cz] of [[-0.65, 0], [0.65, 0], [0, 0]] as const) {
    box(g, [0.65, 0.18, 0.5], [cx, 1.0, cz], "#c89d66"); // Ahşap meyve kasası
    box(g, [0.55, 0.14, 0.4], [cx, 1.1, cz], goodsColor);
  }

  // Ön Küçük Fiyat / Esnaf Levhası
  const miniSign = label(signText, "#ffffff", awningColor1);
  miniSign.scale.set(1.4, 0.4, 1);
  miniSign.position.set(0, 0.85, 0.72);
  g.add(miniSign);

  return g;
}

/** 🕰️ Tarihi Çarşı Meydanı Saat Kulesi (Town Square Clock Pillar) */
export function buildTownClockTower(parent: THREE.Object3D, x: number, z: number) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  parent.add(g);

  // Kademeli Taş Kaide (Zemin)
  box(g, [2.2, 0.3, 2.2], [0, 0.15, 0], "#d5cbb2");
  box(g, [1.8, 0.3, 1.8], [0, 0.45, 0], "#c4b99f");

  // Döküm Bronz / Zümrüt Yeşili Klasik Gövde
  cylinder(g, 0.42, 0.52, 2.8, [0, 1.95, 0], "#1e372f", 8);
  cylinder(g, 0.56, 0.46, 0.3, [0, 3.45, 0], "#f1c40f", 8); // Altın korniş bileziği

  // 4 Yönlü Saat Gövde Başlığı
  box(g, [1.2, 1.2, 1.2], [0, 4.2, 0], "#1e372f");
  box(g, [1.3, 0.16, 1.3], [0, 4.88, 0], "#d4ac0d"); // Saat üst kornişi

  // 4 Cephedeki Analog Saat Kadranları
  const clockOffsets = [
    { pos: [0, 4.2, 0.62], rotY: 0 },
    { pos: [0, 4.2, -0.62], rotY: Math.PI },
    { pos: [0.62, 4.2, 0], rotY: Math.PI / 2 },
    { pos: [-0.62, 4.2, 0], rotY: -Math.PI / 2 },
  ] as const;

  clockOffsets.forEach(c => {
    const face = cylinder(g, 0.42, 0.42, 0.05, c.pos as [number, number, number], "#ffffff", 16);
    face.rotation.x = Math.PI / 2;
    face.rotation.y = c.rotY;
    const rim = cylinder(g, 0.46, 0.46, 0.04, c.pos as [number, number, number], "#f39c12", 16);
    rim.rotation.x = Math.PI / 2;
    rim.rotation.y = c.rotY;
  });

  // Bakır Kubbe ve Alem/Spire Tepe Noktası
  const dome = new THREE.Mesh(
    new THREE.ConeGeometry(0.75, 0.9, 8),
    mat("#16a085"),
  );
  dome.position.set(0, 5.4, 0);
  dome.castShadow = true;
  g.add(dome);

  // Altın Tepe Mili (Spire)
  cylinder(g, 0.04, 0.08, 0.7, [0, 6.15, 0], "#f1c40f", 6);
  cylinder(g, 0.12, 0.12, 0.22, [0, 6.55, 0], "#f39c12", 8);

  return g;
}

/** 🏗️ Sanayi Bölgesi Ağır Konteyner Vinç İskelesi (Container Gantry Crane) */
export function buildGantryCrane(
  parent: THREE.Object3D,
  x: number,
  z: number,
  rotY = 0,
) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  parent.add(g);

  const craneColor = "#f39c12"; // Canlı sanayi iş makinesi sarısı
  const steelGray = "#2c3e50";

  // Vinç Ayakları (Portal A-Frame Çift Ayaklar: Genişlik 10.4m, Yükseklik 8.5m)
  const spanX = 5.2;
  const height = 8.5;

  for (const sx of [-spanX, spanX]) {
    box(g, [1.4, 0.6, 3.8], [sx, 0.3, 0], steelGray);
    cylinder(g, 0.28, 0.28, 0.3, [sx - 0.45, 0.28, 1.4], "#1a252f", 8).rotation.z = Math.PI / 2;
    cylinder(g, 0.28, 0.28, 0.3, [sx - 0.45, 0.28, -1.4], "#1a252f", 8).rotation.z = Math.PI / 2;

    const leg1 = cylinder(g, 0.16, 0.2, height, [sx, height / 2, -1.0], craneColor, 6);
    leg1.rotation.x = -0.12;
    const leg2 = cylinder(g, 0.16, 0.2, height, [sx, height / 2, 1.0], craneColor, 6);
    leg2.rotation.x = 0.12;

    box(g, [0.18, 0.18, 2.2], [sx, 3.2, 0], steelGray);
    box(g, [0.18, 0.18, 1.8], [sx, 5.8, 0], steelGray);
  }

  // Üst Ana Taşıyıcı Köprü Kirişleri
  box(g, [spanX * 2 + 3.0, 0.8, 0.9], [0, height, -0.6], craneColor);
  box(g, [spanX * 2 + 3.0, 0.8, 0.9], [0, height, 0.6], craneColor);
  box(g, [1.4, 0.3, 2.0], [-spanX, height + 0.45, 0], steelGray);
  box(g, [1.4, 0.3, 2.0], [spanX, height + 0.45, 0], steelGray);

  // Operatör Kabini (Camlı kontrol kulübesi)
  box(g, [1.5, 1.4, 1.5], [spanX - 1.2, height - 1.0, 0], "#e67e22");
  box(g, [1.3, 0.7, 0.1], [spanX - 1.2, height - 0.9, 0.76], "#74b9ff", 0.3);

  // Vinç Arabası (Trolley) ve Asılı Kargo Konteyneri
  box(g, [1.8, 0.5, 1.6], [0, height - 0.3, 0], steelGray);
  for (const hx of [-0.65, 0.65]) {
    for (const hz of [-0.55, 0.55]) {
      cylinder(g, 0.02, 0.02, 2.6, [hx, height - 1.6, hz], "#bdc3c7", 4);
    }
  }
  box(g, [3.2, 0.25, 1.6], [0, height - 2.9, 0], "#c0392b");

  // Havada Asılı Konteyner
  box(g, [5.8, 2.2, 2.2], [0, height - 4.1, 0], "#d35400");
  box(g, [5.85, 0.15, 2.25], [0, height - 4.1 + 1.1, 0], steelGray);

  // Üstte Flaşör Kaidesi
  cylinder(g, 0.08, 0.1, 0.3, [0, height + 0.55, 0], "#e74c3c", 6);

  return g;
}

/** 🏮 Sahil Kordonu Nostaljik Döküm Fener Direği (Promenade Boardwalk Lamp) */
export function buildPromenadeLantern(parent: THREE.Object3D, x: number, z: number) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  parent.add(g);

  // Döküm Kaide ve Gövde
  cylinder(g, 0.18, 0.24, 0.45, [0, 0.22, 0], "#1e272e", 8);
  cylinder(g, 0.08, 0.12, 2.8, [0, 1.65, 0], "#2c3e50", 8);
  cylinder(g, 0.14, 0.08, 0.25, [0, 3.1, 0], "#1e272e", 8);

  // Sıcak Işıklı Küre Cam Fener
  cylinder(g, 0.26, 0.26, 0.36, [0, 3.38, 0], "#fff3bf", 12);
  cylinder(g, 0.06, 0.32, 0.15, [0, 3.62, 0], "#1e272e", 8);

  return g;
}

/** 🏖️ Sahil Plajı Ahşap Cankurtaran Kulesi (Coastal Lifeguard Watchtower) */
export function buildLifeguardTower(
  parent: THREE.Object3D,
  x: number,
  z: number,
  rotY = 0,
) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  parent.add(g);

  const woodColor = "#d7995b";
  const darkWood = "#8e5726";

  // 4 Ahşap Eğimli Taşıyıcı Ayak
  for (const lx of [-1.1, 1.1]) {
    for (const lz of [-1.1, 1.1]) {
      const leg = cylinder(g, 0.07, 0.09, 2.6, [lx * 0.85, 1.3, lz * 0.85], darkWood, 6);
      leg.rotation.z = -lx * 0.08;
      leg.rotation.x = lz * 0.08;
    }
  }

  // Ayaklar Arası Çapraz Ahşap Bağlar
  box(g, [2.0, 0.08, 0.08], [0, 1.2, -0.9], darkWood);
  box(g, [2.0, 0.08, 0.08], [0, 1.2, 0.9], darkWood);
  box(g, [0.08, 0.08, 2.0], [-0.9, 1.2, 0], darkWood);
  box(g, [0.08, 0.08, 2.0], [0.9, 1.2, 0], darkWood);

  // Gözlem Platformu Ahşap Tabanı
  box(g, [2.4, 0.12, 2.4], [0, 2.65, 0], woodColor);

  // Platform Çevre Korkulukları
  box(g, [2.4, 0.45, 0.06], [0, 2.92, -1.18], "#ecf0f1");
  box(g, [2.4, 0.45, 0.06], [0, 2.92, 1.18], "#ecf0f1");
  box(g, [0.06, 0.45, 2.3], [-1.18, 2.92, 0], "#ecf0f1");
  box(g, [0.06, 0.45, 2.3], [1.18, 2.92, 0], "#ecf0f1");

  // Kulübe Kabini
  box(g, [1.6, 1.5, 1.6], [0, 3.45, -0.2], "#f1f2f6");
  box(g, [1.4, 0.7, 0.1], [0, 3.5, 0.62], "#74b9ff", 0.3);

  // Eğimli Gölgelik Çatısı
  const roof = box(g, [2.1, 0.1, 2.1], [0, 4.3, -0.2], "#e74c3c");
  roof.rotation.x = 0.12;

  // Çıkış Merdiveni
  const ladderGroup = new THREE.Group();
  ladderGroup.position.set(0, 1.3, 1.35);
  ladderGroup.rotation.x = 0.28;
  g.add(ladderGroup);
  cylinder(ladderGroup, 0.04, 0.04, 2.8, [-0.4, 0, 0], darkWood, 6);
  cylinder(ladderGroup, 0.04, 0.04, 2.8, [0.4, 0, 0], darkWood, 6);
  for (let s = -1.1; s <= 1.1; s += 0.4) {
    box(ladderGroup, [0.8, 0.05, 0.08], [0, s, 0], woodColor);
  }

  // Can Simidi
  const buoy = cylinder(g, 0.3, 0.3, 0.08, [1.22, 2.9, 0], "#e74c3c", 16);
  buoy.rotation.z = Math.PI / 2;
  const innerHole = cylinder(g, 0.16, 0.16, 0.1, [1.22, 2.9, 0], "#ecf0f1", 16);
  innerHole.rotation.z = Math.PI / 2;

  return g;
}

/** 📬 Güneş Mahallesi Sevimli Bahçe Posta Kutusu (Suburban Curbside Mailbox) */
export function buildMailbox(
  parent: THREE.Object3D,
  x: number,
  z: number,
  rotY = 0,
  boxColor = "#ffffff",
) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  parent.add(g);

  // Ahşap Dikme Direk
  cylinder(g, 0.06, 0.07, 1.1, [0, 0.55, 0], "#795548", 6);

  // Posta Kutusu Gövdesi
  box(g, [0.45, 0.32, 0.65], [0, 1.15, 0], boxColor);
  const dome = cylinder(g, 0.22, 0.22, 0.65, [0, 1.31, 0], boxColor, 12);
  dome.rotation.x = Math.PI / 2;

  // Ön Kapak & Kolu
  box(g, [0.42, 0.3, 0.04], [0, 1.15, 0.33], "#bdc3c7");
  cylinder(g, 0.02, 0.02, 0.08, [0, 1.25, 0.36], "#2c3e50", 4).rotation.x = Math.PI / 2;

  // Kırmızı Bildirim Bayrağı
  box(g, [0.03, 0.22, 0.03], [0.24, 1.3, -0.15], "#c0392b");
  box(g, [0.03, 0.08, 0.14], [0.24, 1.38, -0.09], "#e74c3c");

  return g;
}

export type LighthouseView = {
  group: THREE.Group;
  update(dt: number, isNightOrDusk?: boolean): void;
};

/** 🏮 Sahil Şeridi İkonik Deniz Feneri (Coastal Maritime Lighthouse) */
export function buildLighthouse(
  parent: THREE.Object3D,
  x: number,
  z: number,
  rotY = 0,
): LighthouseView {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  parent.add(g);

  // 1. Taş İskele Kaidesi (Granite Foundation)
  cylinder(g, 2.6, 2.8, 1.1, [0, 0.55, 0], "#4a5568", 8);
  cylinder(g, 2.35, 2.55, 0.3, [0, 1.25, 0], "#2d3748", 8);

  // Giriş Kapısı & Eşiği
  box(g, [0.85, 1.45, 0.15], [0, 1.85, 2.1], "#2c3e50");
  box(g, [0.95, 0.14, 0.3], [0, 1.15, 2.2], "#718096");

  // 2. Kırmızı-Beyaz Şeritli Koni Gövde (5 Katmanlı Mimari Şerit)
  const bands = [
    { yBottom: 1.4, yTop: 3.1, rBottom: 2.15, rTop: 1.95, color: "#c0392b" },
    { yBottom: 3.1, yTop: 4.8, rBottom: 1.95, rTop: 1.75, color: "#f5f6fa" },
    { yBottom: 4.8, yTop: 6.5, rBottom: 1.75, rTop: 1.55, color: "#c0392b" },
    { yBottom: 6.5, yTop: 8.2, rBottom: 1.55, rTop: 1.35, color: "#f5f6fa" },
    { yBottom: 8.2, yTop: 9.6, rBottom: 1.35, rTop: 1.2, color: "#c0392b" },
  ];

  for (const b of bands) {
    const h = b.yTop - b.yBottom;
    const yCenter = b.yBottom + h / 2;
    cylinder(g, b.rTop, b.rBottom, h, [0, yCenter, 0], b.color, 16);
  }

  // Gözetleme Pencereleri
  box(g, [0.35, 0.6, 0.1], [0, 4.0, 1.86], "#1a202c");
  box(g, [0.3, 0.5, 0.1], [0, 7.3, 1.46], "#1a202c");

  // 3. Döküm Demir Seyir Terası & Güvenlik Korkulukları (Gallery Balcony)
  cylinder(g, 1.65, 1.65, 0.18, [0, 9.69, 0], "#1a202c", 16);
  // Korkuluk üst çemberi
  cylinder(g, 1.62, 1.62, 0.05, [0, 10.3, 0], "#2d3748", 16);
  // Korkuluk dikmeleri
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
    const rx = Math.cos(a) * 1.58;
    const rz = Math.sin(a) * 1.58;
    cylinder(g, 0.03, 0.03, 0.65, [rx, 9.98, rz], "#2d3748", 4);
  }

  // 4. Cam Fener Odası (Lantern Room)
  const glassMat = mat("#74b9ff", 0.35);
  const glassGeo = new THREE.CylinderGeometry(1.15, 1.15, 1.4, 12);
  const glassMesh = new THREE.Mesh(glassGeo, glassMat);
  glassMesh.position.set(0, 10.5, 0);
  g.add(glassMesh);

  // Fener ampulü / Reflektör göbeği
  const bulb = cylinder(g, 0.45, 0.45, 0.65, [0, 10.5, 0], "#fff799", 8);
  if (bulb.material instanceof THREE.MeshStandardMaterial) {
    bulb.material.emissive.set("#fffa65");
    bulb.material.emissiveIntensity = 0.8;
  }

  // 5. Tarihi Yeşil Bakır Çatı & Rüzgar Gülü (Copper Cupola & Weathervane)
  cylinder(g, 0.08, 1.35, 1.55, [0, 11.95, 0], "#16a085", 16);
  cylinder(g, 0.03, 0.04, 0.8, [0, 12.95, 0], "#d35400", 6);
  box(g, [0.65, 0.08, 0.03], [0, 13.25, 0], "#f39c12");

  // 6. Dönen Projektör / Deniz Arama Işığı (Volumetric Sweeping Searchlight Beam)
  const beamGroup = new THREE.Group();
  beamGroup.position.set(0, 10.5, 0);
  g.add(beamGroup);

  const beamGeo = new THREE.CylinderGeometry(0.2, 3.2, 22, 16, 1, true);
  beamGeo.rotateX(Math.PI / 2);
  beamGeo.translate(0, 0, 11);
  const beamMat = new THREE.MeshBasicMaterial({
    color: "#fff7c2",
    transparent: true,
    opacity: 0.28,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const beamMesh = new THREE.Mesh(beamGeo, beamMat);
  beamGroup.add(beamMesh);

  return {
    group: g,
    update(dt: number, isNightOrDusk = false) {
      beamGroup.rotation.y += dt * 0.75;
      beamMat.opacity = isNightOrDusk ? 0.38 : 0.12;
      if (bulb.material instanceof THREE.MeshStandardMaterial) {
        bulb.material.emissiveIntensity = isNightOrDusk ? 1.2 : 0.5;
      }
    },
  };
}

export type FountainView = {
  group: THREE.Group;
  update(dt: number): void;
};

/** ⛲ Çarşı Bölgesi Tarihi Mermer Meydan Çeşmesi (Historic Piazza Fountain) */
export function buildPiazzaFountain(
  parent: THREE.Object3D,
  x: number,
  z: number,
): FountainView {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  parent.add(g);

  // 1. Sekizgen Mermer Havuz Çanağı (Octagonal Basin)
  cylinder(g, 2.5, 2.65, 0.65, [0, 0.32, 0], "#f5f6fa", 8);
  cylinder(g, 2.6, 2.7, 0.12, [0, 0.65, 0], "#dcdde1", 8); // Havuz küpeştesi

  // Havuz İçi Berrak Su Yüzeyi
  cylinder(g, 2.2, 2.2, 0.06, [0, 0.48, 0], "#00cec9", 16);

  // 2. Klasik Oyma Mermer Kaide (Fluted Pedestal)
  cylinder(g, 0.65, 0.78, 1.35, [0, 1.15, 0], "#dfe6e9", 12);

  // 3. Orta Mermer Su Çanağı (Mid-tier Basin)
  cylinder(g, 1.45, 0.7, 0.38, [0, 1.85, 0], "#f5f6fa", 16);
  cylinder(g, 1.35, 1.35, 0.05, [0, 1.95, 0], "#00cec9", 16);

  // 4. Üst Kaide ve Tepe Fıskiye Kasesi (Upper Bowl & Spout)
  cylinder(g, 0.35, 0.42, 0.85, [0, 2.35, 0], "#dfe6e9", 8);
  cylinder(g, 0.8, 0.35, 0.32, [0, 2.8, 0], "#f5f6fa", 12);
  cylinder(g, 0.7, 0.7, 0.04, [0, 2.9, 0], "#00cec9", 12);

  // 5. Animasyonlu Fıskiye Su Damlacıkları (Water Spray Droplets)
  const sprayCount = 10;
  const sprayGroup = new THREE.Group();
  sprayGroup.position.set(0, 2.95, 0);
  g.add(sprayGroup);

  const droplets: { mesh: THREE.Mesh; angle: number; speed: number; radius: number; progress: number }[] = [];
  const dropletGeo = new THREE.BoxGeometry(0.08, 0.12, 0.08);
  const dropletMat = new THREE.MeshBasicMaterial({ color: "#81ecec", transparent: true, opacity: 0.85 });

  for (let i = 0; i < sprayCount; i++) {
    const mesh = new THREE.Mesh(dropletGeo, dropletMat);
    sprayGroup.add(mesh);
    droplets.push({
      mesh,
      angle: (i / sprayCount) * Math.PI * 2,
      speed: 1.8 + (i % 3) * 0.4,
      radius: 0.35 + (i % 2) * 0.45,
      progress: (i / sprayCount),
    });
  }

  return {
    group: g,
    update(dt: number) {
      for (const d of droplets) {
        d.progress = (d.progress + dt * d.speed * 0.45) % 1.0;
        // Parabolik yay (yukarı fışkırma ve kaseye düşüş)
        const py = Math.sin(d.progress * Math.PI) * 1.1;
        const dist = d.progress * d.radius;
        d.mesh.position.set(
          Math.cos(d.angle) * dist,
          py,
          Math.sin(d.angle) * dist,
        );
      }
    },
  };
}

export type ChimneySmokeView = {
  group: THREE.Group;
  update(dt: number): void;
};

/** 🏭 Sanayi Bölgesi Canlı Fabrika Bacası Buhar/Duman Püskürtücü */
export function buildFactoryChimneySmoke(
  parent: THREE.Object3D,
  x: number,
  y: number,
  z: number,
): ChimneySmokeView {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  parent.add(g);

  const puffCount = 6;
  const puffs: { mesh: THREE.Mesh; progress: number; speed: number; driftX: number }[] = [];
  const geo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
  const matSmoke = new THREE.MeshBasicMaterial({
    color: "#ecf0f1",
    transparent: true,
    opacity: 0.65,
    depthWrite: false,
  });

  for (let i = 0; i < puffCount; i++) {
    const mesh = new THREE.Mesh(geo, matSmoke);
    g.add(mesh);
    puffs.push({
      mesh,
      progress: i / puffCount,
      speed: 0.35 + (i % 2) * 0.15,
      driftX: 0.8 + (i % 3) * 0.3,
    });
  }

  return {
    group: g,
    update(dt: number) {
      for (const p of puffs) {
        p.progress = (p.progress + dt * p.speed) % 1.0;
        const curY = p.progress * 3.5;
        const curX = p.progress * p.driftX;
        const scale = 0.5 + p.progress * 1.6;
        p.mesh.position.set(curX, curY, 0);
        p.mesh.scale.set(scale, scale, scale);
      }
    },
  };
}

export type MarinaBoatsView = {
  group: THREE.Group;
  update(dt: number): void;
};

/** ⛵ Sahil İskelesine Bağlı Yelkenli ve Sürat Teknesi (Marina Boats with Wave Bobbing) */
export function buildMarinaBoats(
  parent: THREE.Object3D,
  pierX = -50,
  pierZ = 92,
): MarinaBoatsView {
  const g = new THREE.Group();
  parent.add(g);

  // 1. Yelkenli Yat (Sailing Yacht - İskelenin batı kanadı: X: -54.5, Z: 92)
  const yacht = new THREE.Group();
  yacht.position.set(pierX - 4.5, 0.08, pierZ);
  g.add(yacht);

  // Gövde (Derin lacivert gövde ve beyaz güverte)
  box(yacht, [2.2, 0.85, 5.8], [0, 0.35, 0], "#1e3799");
  box(yacht, [2.0, 0.2, 5.4], [0, 0.8, 0], "#f5f6fa"); // Güverte
  // Pruva sivrilmesi
  cylinder(yacht, 0.01, 1.0, 1.2, [0, 0.4, 3.2], "#1e3799", 6).rotation.x = -Math.PI / 2;
  // Kamara üst yapısı ve pencereler
  box(yacht, [1.4, 0.55, 2.8], [0, 1.05, -0.4], "#ffffff");
  box(yacht, [1.44, 0.2, 2.2], [0, 1.05, -0.4], "#0984e3"); // Mavi pencereler
  // Direk (Mast) ve bumba (Boom)
  cylinder(yacht, 0.06, 0.08, 6.4, [0, 4.0, 0.4], "#dcdde1", 8);
  box(yacht, [0.06, 0.08, 2.8], [0, 1.4, -0.9], "#dcdde1"); // Bumba
  // Sarılmış beyaz ana yelken (Furled mainsail)
  cylinder(yacht, 0.12, 0.12, 2.6, [0, 1.5, -0.9], "#f1f2f6", 8).rotation.x = Math.PI / 2;
  // Paslanmaz vardavela korkulukları
  box(yacht, [1.6, 0.35, 0.04], [0, 0.95, -2.6], "#bdc3c7");
  box(yacht, [0.04, 0.35, 4.8], [-0.95, 0.95, 0], "#bdc3c7");
  box(yacht, [0.04, 0.35, 4.8], [0.95, 0.95, 0], "#bdc3c7");

  // 2. Motorlu Sürat Teknesi (Sport Speedboat - İskelenin doğu kanadı: X: -45.5, Z: 92)
  const speedboat = new THREE.Group();
  speedboat.position.set(pierX + 4.5, 0.08, pierZ);
  g.add(speedboat);

  // Gövde (Ateş kırmızısı ve beyaz)
  box(speedboat, [1.9, 0.65, 4.5], [0, 0.28, 0], "#c0392b");
  box(speedboat, [1.7, 0.15, 4.2], [0, 0.65, 0], "#ffffff");
  // Pruva sivrilmesi
  cylinder(speedboat, 0.01, 0.9, 1.0, [0, 0.32, 2.5], "#c0392b", 6).rotation.x = -Math.PI / 2;
  // Aerodinamik cam siperlik (Wraparound windscreen)
  box(speedboat, [1.5, 0.3, 0.08], [0, 0.85, 0.6], "#74b9ff", 0.4);
  // Kokpit koltukları
  box(speedboat, [1.3, 0.35, 0.4], [0, 0.7, 0.1], "#2d3436");
  // Çift dıştan takma motor (Twin Outboard Motors)
  box(speedboat, [0.35, 0.6, 0.4], [-0.5, 0.45, -2.25], "#2c3e50");
  box(speedboat, [0.35, 0.6, 0.4], [0.5, 0.45, -2.25], "#2c3e50");

  let animTime = 0;
  return {
    group: g,
    update(dt: number) {
      animTime += dt;
      // Yelkenli hafif dalga salınımı (Rocking & pitching)
      yacht.rotation.z = Math.sin(animTime * 1.4) * 0.038;
      yacht.rotation.x = Math.cos(animTime * 1.1) * 0.02;
      yacht.position.y = 0.08 + Math.sin(animTime * 1.8) * 0.055;

      // Sürat teknesi hafif daha dinamik dalga salınımı
      speedboat.rotation.z = Math.sin(animTime * 1.8 + 1.2) * 0.042;
      speedboat.rotation.x = Math.cos(animTime * 1.5 + 0.5) * 0.025;
      speedboat.position.y = 0.08 + Math.sin(animTime * 2.2 + 0.8) * 0.048;
    },
  };
}

/** 🛟 Sahil İskelesi Can Simidi Güvenlik İstasyonu (Lifebuoy Station) */
export function buildLifebuoyStation(parent: THREE.Object3D, x: number, z: number, rotY = 0) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  parent.add(g);

  // Ahşap direk
  box(g, [0.12, 1.4, 0.12], [0, 0.7, 0], "#795548");
  // Beyaz koruma arkalığı
  box(g, [0.7, 0.7, 0.04], [0, 1.0, 0.08], "#ffffff");
  // Kırmızı-beyaz can simidi
  cylinder(g, 0.28, 0.28, 0.12, [0, 1.0, 0.15], "#e74c3c", 16).rotation.x = Math.PI / 2;
  cylinder(g, 0.14, 0.14, 0.13, [0, 1.0, 0.15], "#ffffff", 16).rotation.x = Math.PI / 2;
  // Kurtarma halatı bobini
  cylinder(g, 0.1, 0.1, 0.1, [0, 0.45, 0.1], "#f39c12", 8);
  return g;
}

/** 🎏 Çarşı Meydanı Kutlama Flamaları (Festive Market Bunting / Pennants) */
export function buildMarketBunting(
  parent: THREE.Object3D,
  startX: number,
  startZ: number,
  endX: number,
  endZ: number,
  height = 4.2,
) {
  const g = new THREE.Group();
  parent.add(g);

  const dx = endX - startX;
  const dz = endZ - startZ;
  const dist = Math.hypot(dx, dz);
  const flagCount = Math.floor(dist / 1.1);
  const colors = ["#e74c3c", "#f1c40f", "#00cec9", "#e67e22", "#9b59b6", "#2ecc71"];

  // Catenary sarkma eğrisi üzerinde üçgen flamalar
  for (let i = 0; i <= flagCount; i++) {
    const t = i / Math.max(1, flagCount);
    const px = startX + dx * t;
    const pz = startZ + dz * t;
    // Sarkma: ortada maksimum 0.4m aşağı sarkar
    const sag = Math.sin(t * Math.PI) * 0.4;
    const py = height - sag;

    const color = colors[i % colors.length];
    const flag = cylinder(g, 0.01, 0.2, 0.3, [px, py - 0.15, pz], color, 3);
    flag.rotation.x = Math.PI; // Aşağı sarkan üçgen
  }

  // Taşıyıcı ince kablo
  const cable = box(g, [dist, 0.02, 0.02], [(startX + endX) / 2, height - 0.2, (startZ + endZ) / 2], "#2c3e50");
  cable.rotation.y = -Math.atan2(dz, dx);

  return g;
}

/** 📋 Açık Hava Kafe Menü Tabelası (Cafe A-Frame Chalkboard Easel) */
export function buildCafeMenuBoard(parent: THREE.Object3D, x: number, z: number, rotY = 0) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  parent.add(g);

  // Ahşap A-çerçeve ayaklar
  box(g, [0.65, 0.95, 0.06], [0, 0.48, 0.12], "#5c3d25").rotation.x = 0.15;
  box(g, [0.65, 0.95, 0.06], [0, 0.48, -0.12], "#5c3d25").rotation.x = -0.15;
  // Siyah tebeşir yazı tahtası
  box(g, [0.52, 0.68, 0.02], [0, 0.52, 0.15], "#2c3e50").rotation.x = 0.15;
  // Tebeşir menü başlığı
  const boardLabel = label("KAFE · MENÜ", "#ffffff", "#2c3e50");
  boardLabel.scale.set(0.6, 0.22, 1);
  boardLabel.position.set(0, 0.65, 0.18);
  g.add(boardLabel);

  return g;
}

/** 🌸 Kaldırım Ahşap Çiçeklik Kutusu (Sidewalk Flower Planter) */
export function buildFlowerPlanter(parent: THREE.Object3D, x: number, z: number, rotY = 0) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  parent.add(g);

  // Ahşap kutu gövdesi
  box(g, [1.4, 0.45, 0.5], [0, 0.22, 0], "#795548");
  box(g, [1.5, 0.08, 0.6], [0, 0.44, 0], "#5d4037"); // Üst pervaz
  box(g, [1.3, 0.1, 0.42], [0, 0.42, 0], "#3e2723"); // Toprak

  // Rengarenk açan çiçekler
  const flowerColors = ["#e84393", "#fdcb6e", "#a29bfe", "#00cec9", "#fd79a8"];
  for (let i = 0; i < 5; i++) {
    const fx = -0.5 + i * 0.25;
    cylinder(g, 0.08, 0.04, 0.16, [fx, 0.54, (i % 2 === 0 ? 0.06 : -0.06)], flowerColors[i], 6);
  }
  return g;
}

/** ⚡ Sanayi Bölgesi Yüksek Gerilim Trafo İstasyonu (Electrical Transformer Substation) */
export function buildElectricalSubstation(
  parent: THREE.Object3D,
  x: number,
  z: number,
  rotY = 0,
) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  parent.add(g);

  // 1. Beton Kaide
  box(g, [4.8, 0.3, 3.8], [0, 0.15, 0], "#7f8c8d");

  // 2. Ana Trafo Gövdesi (Heavy Transformer Tank)
  box(g, [2.4, 2.2, 1.8], [0, 1.4, 0], "#34495e");
  // Soğutma radyatör kanatları (Radiator fins)
  for (const rx of [-1.25, 1.25]) {
    for (let fz = -0.6; fz <= 0.6; fz += 0.3) {
      box(g, [0.35, 1.6, 0.08], [rx, 1.35, fz], "#2c3e50");
    }
  }

  // 3. Üst Seramik İzolatörler (Ceramic High-Voltage Bushings)
  for (const ix of [-0.6, 0, 0.6]) {
    cylinder(g, 0.1, 0.14, 0.7, [ix, 2.85, 0], "#d35400", 8);
    cylinder(g, 0.03, 0.03, 0.35, [ix, 3.25, 0], "#bdc3c7", 6);
  }

  // 4. Güvenlik Çevre Çiti (Perimeter Security Hazard Barrier)
  box(g, [4.6, 0.18, 0.12], [0, 0.09, 1.7], "#f1c40f"); // Sarı zemin çizgisi
  box(g, [0.12, 1.6, 0.12], [-2.2, 0.8, 1.7], "#2c3e50");
  box(g, [0.12, 1.6, 0.12], [2.2, 0.8, 1.7], "#2c3e50");
  box(g, [4.4, 0.06, 0.04], [0, 1.5, 1.7], "#95a5a6");
  box(g, [4.4, 0.06, 0.04], [0, 0.8, 1.7], "#95a5a6");

  // 5. Sarı Tehlike Tabelası
  const warnSign = label("⚡ DİKKAT · YÜKSEK GERİLİM", "#1e272e", "#f1c40f");
  warnSign.scale.set(2.2, 0.6, 1);
  warnSign.position.set(0, 1.2, 1.75);
  g.add(warnSign);

  return g;
}

/** 💡 Sanayi Bölgesi Ağır Hizmet Yükleme Sahası Aydınlatma Direği (Industrial Floodlight) */
export function buildIndustrialFloodlight(parent: THREE.Object3D, x: number, z: number, rotY = 0) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  parent.add(g);

  // Galvaniz çelik yüksek direk (5.5m)
  cylinder(g, 0.1, 0.16, 5.5, [0, 2.75, 0], "#7f8c8d", 8);
  // Çapraz montaj traversi
  box(g, [1.4, 0.1, 0.1], [0, 5.5, 0], "#34495e");
  // Çift LED projektör kasası ve parlak sarı camı
  for (const lx of [-0.45, 0.45]) {
    const fLight = box(g, [0.38, 0.28, 0.4], [lx, 5.4, 0.15], "#2c3e50");
    fLight.rotation.x = 0.35;
    const fGlass = box(g, [0.34, 0.24, 0.05], [lx, 5.35, 0.35], "#f6e58d");
    fGlass.rotation.x = 0.35;
  }
  return g;
}

/** 🏡 Güneş Mahallesi Giriş Karşılama Takı (Suburban Welcome Archway) */
export function buildWelcomeArch(
  parent: THREE.Object3D,
  x: number,
  z: number,
  rotY = 0,
) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  parent.add(g);

  // İki yan kalın ahşap kolon (4.8m yükseklik, 8.4m açıklık - yoldan geçişi engellemez)
  const span = 4.2;
  box(g, [0.45, 4.8, 0.45], [-span, 2.4, 0], "#6d4c41");
  box(g, [0.45, 4.8, 0.45], [span, 2.4, 0], "#6d4c41");
  // Taş taban pabuçları
  box(g, [0.8, 0.6, 0.8], [-span, 0.3, 0], "#9e9e9e");
  box(g, [0.8, 0.6, 0.8], [span, 0.3, 0], "#9e9e9e");

  // Üst kiriş ve kırma çatı sundurması
  box(g, [span * 2 + 1.2, 0.5, 0.6], [0, 4.8, 0], "#5d4037");
  box(g, [span * 2 + 1.6, 0.2, 0.9], [0, 5.1, 0], "#3e2723");

  // Karşılama Tabelası
  const archSign = label("🏡 GÜNEŞ MAHALLESİ", "#ffffff", "#27ae60");
  archSign.scale.set(4.2, 0.95, 1);
  archSign.position.set(0, 4.2, 0);
  g.add(archSign);

  return g;
}

/** ☀️ Konut Çatısı Güneş Enerjisi & Su Isıtıcı Panelleri (Rooftop Solar Panels) */
export function buildRooftopSolarPanels(
  parent: THREE.Object3D,
  x: number,
  roofY: number,
  z: number,
  rotY = 0,
) {
  const g = new THREE.Group();
  g.position.set(x, roofY, z);
  g.rotation.y = rotY;
  parent.add(g);

  // İki adet açılı fotovoltaik güneş paneli
  for (const px of [-0.65, 0.65]) {
    box(g, [0.05, 0.35, 0.4], [px, 0.18, -0.2], "#bdc3c7");
    const panel = box(g, [1.0, 0.05, 1.4], [px, 0.32, 0], "#1e3799");
    panel.rotation.x = -0.32; // Güneşe bakan açı
    box(panel, [1.05, 0.06, 0.04], [0, 0.02, 0], "#bdc3c7");
  }

  // Yatay silindirik termosifon su boyleri (Boiler Tank)
  cylinder(g, 0.22, 0.22, 1.8, [0, 0.55, -0.75], "#ecf0f1", 12).rotation.z = Math.PI / 2;

  return g;
}
