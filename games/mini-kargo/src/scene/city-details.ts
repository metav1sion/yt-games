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
