import * as THREE from "three";
import { box, cylinder, label, mat, type WorldContext } from "./world-kit";
import type { Rect } from "../game/types";

export type BuildingKind = "apartment" | "plaza" | "row_shops" | "industrial_hq" | "coastal_hotel";

export type CityBuildingDef = {
  id: string;
  name: string;
  x: number;
  z: number;
  width: number;
  depth: number;
  floors: number;
  kind: BuildingKind;
  mainColor: string;
  accentColor: string;
  roofColor?: string;
  rotation?: number;
};

/**
 * 3-6 Katlı Modern Şehir Apartmanı:
 * Pencereler, balkonlar, yangın merdivenleri, giriş sundurması ve çatı parapeti.
 */
export function buildModernApartment(
  parent: THREE.Object3D,
  b: CityBuildingDef,
): Rect {
  const g = new THREE.Group();
  g.position.set(b.x, 0, b.z);
  if (b.rotation) g.rotation.y = b.rotation;
  parent.add(g);

  const floorHeight = 2.4;
  const totalHeight = b.floors * floorHeight + 0.6;
  const w = b.width;
  const d = b.depth;
  const halfW = w / 2;
  const halfD = d / 2;

  // 1. Zemin Temel ve Kaide
  box(g, [w + 0.4, 0.4, d + 0.4], [0, 0.2, 0], "#4a5568");

  // 2. Ana Gövde
  box(g, [w, totalHeight, d], [0, totalHeight / 2 + 0.2, 0], b.mainColor, 0.8);

  // 3. Kat Silmeleri (Kornişler)
  for (let f = 1; f <= b.floors; f++) {
    const y = 0.2 + f * floorHeight;
    box(g, [w + 0.25, 0.16, d + 0.25], [0, y, 0], b.accentColor);
  }

  // 4. Çatı Parapeti ve Çatı Üstü Detayları (Asansör kulesi, havalandırma)
  box(g, [w + 0.2, 0.5, d + 0.2], [0, totalHeight + 0.35, 0], b.accentColor);
  // Asansör / Merdiven çıkış kulesi
  const towerW = Math.min(2.8, w * 0.4);
  const towerD = Math.min(2.8, d * 0.4);
  box(g, [towerW, 1.8, towerD], [-w * 0.2, totalHeight + 1.1, 0], b.mainColor);
  box(g, [towerW + 0.2, 0.2, towerD + 0.2], [-w * 0.2, totalHeight + 2.05, 0], b.accentColor);
  // Çatı anteni
  cylinder(g, 0.04, 0.06, 2.2, [w * 0.25, totalHeight + 1.6, -d * 0.2], "#718096", 6);
  cylinder(g, 0.02, 0.03, 1.0, [w * 0.25, totalHeight + 3.0, -d * 0.2], "#e53e3e", 6);

  // 5. Pencereler ve Balkonlar (Ön ve Arka Cephe)
  const windowColor = "#bee3f8"; // Açık parlak cam
  const frameColor = "#2d3748";
  const numWindowsX = Math.max(2, Math.floor(w / 2.2));
  const spacingX = w / (numWindowsX + 1);

  for (let f = 0; f < b.floors; f++) {
    const floorY = 0.4 + f * floorHeight + floorHeight * 0.5;
    const isGround = f === 0;

    for (let i = 1; i <= numWindowsX; i++) {
      const winX = -halfW + i * spacingX;
      // Ön cephe (+Z)
      if (!(isGround && Math.abs(winX) < 1.2)) {
        // Çerçeve & Cam
        box(g, [1.0, 1.2, 0.06], [winX, floorY, halfD + 0.03], frameColor);
        box(g, [0.84, 1.04, 0.08], [winX, floorY, halfD + 0.04], windowColor, 0.3);

        // Kat 1 ve üstü için balkon
        if (!isGround && i % 2 === 1) {
          // Balkon tabanı
          box(g, [1.4, 0.12, 0.8], [winX, floorY - 0.55, halfD + 0.4], b.accentColor);
          // Balkon ön korkuluğu
          box(g, [1.4, 0.5, 0.08], [winX, floorY - 0.3, halfD + 0.76], "#cbd5e0");
          // Balkon yan korkulukları
          box(g, [0.08, 0.5, 0.72], [winX - 0.66, floorY - 0.3, halfD + 0.4], "#cbd5e0");
          box(g, [0.08, 0.5, 0.72], [winX + 0.66, floorY - 0.3, halfD + 0.4], "#cbd5e0");
        }
      }

      // Arka cephe (-Z)
      box(g, [1.0, 1.2, 0.06], [winX, floorY, -halfD - 0.03], frameColor);
      box(g, [0.84, 1.04, 0.08], [winX, floorY, -halfD - 0.04], windowColor, 0.3);
    }
  }

  // 6. Yan Cephe Yangın Merdiveni (+X cephesi)
  const fireLadderX = halfW + 0.4;
  for (let f = 1; f < b.floors; f++) {
    const platY = 0.4 + f * floorHeight;
    // Merdiven sahanlığı
    box(g, [0.8, 0.08, 1.6], [fireLadderX, platY, 0], "#4a5568");
    box(g, [0.8, 0.5, 0.06], [fireLadderX, platY + 0.25, 0.78], "#718096");
    box(g, [0.8, 0.5, 0.06], [fireLadderX, platY + 0.25, -0.78], "#718096");
    box(g, [0.06, 0.5, 1.6], [fireLadderX + 0.38, platY + 0.25, 0], "#718096");

    // Eğimli merdiven kolu
    const stair = box(g, [0.4, 0.06, 1.8], [fireLadderX - 0.1, platY - floorHeight * 0.5, 0], "#2d3748");
    stair.rotation.x = f % 2 === 0 ? 0.6 : -0.6;
  }

  // 7. Zemin Kat Giriş Kapısı & Giriş Gölgeliği
  box(g, [1.8, 2.1, 0.15], [0, 1.15, halfD + 0.05], "#1a202c"); // Kapı kasası
  box(g, [0.7, 1.8, 0.16], [-0.4, 1.05, halfD + 0.07], "#319795"); // Sol kapı kanadı
  box(g, [0.7, 1.8, 0.16], [0.4, 1.05, halfD + 0.07], "#319795"); // Sağ kapı kanadı
  box(g, [2.4, 0.15, 1.2], [0, 2.35, halfD + 0.6], b.accentColor); // Giriş tentesi
  cylinder(g, 0.05, 0.05, 2.2, [-1.0, 1.15, halfD + 1.1], "#a0aec0", 6); // Sol direk
  cylinder(g, 0.05, 0.05, 2.2, [1.0, 1.15, halfD + 1.1], "#a0aec0", 6); // Sağ direk

  // Bina ismi tabelası
  const bSign = label(b.name, "#ffffff", b.accentColor);
  bSign.scale.set(1.8, 0.45, 1);
  bSign.position.set(0, 2.75, halfD + 0.2);
  g.add(bSign);

  const pad = 0.2;
  return {
    minX: b.x - halfW - pad,
    maxX: b.x + halfW + pad,
    minZ: b.z - halfD - pad,
    maxZ: b.z + halfD + pad,
  };
}

/**
 * 5-8 Katlı Cam Cepheli İş Merkezi / Plaza Kulesi:
 * Modern cam karkas, çatı helipadi veya anten kulesi, lüks lobi girişi.
 */
export function buildPlazaTower(
  parent: THREE.Object3D,
  b: CityBuildingDef,
): Rect {
  const g = new THREE.Group();
  g.position.set(b.x, 0, b.z);
  if (b.rotation) g.rotation.y = b.rotation;
  parent.add(g);

  const floorHeight = 2.6;
  const totalHeight = b.floors * floorHeight + 1.0;
  const w = b.width;
  const d = b.depth;
  const halfW = w / 2;
  const halfD = d / 2;

  // 1. Zemin Kaidesi ve Geniş Giriş Lobisi
  box(g, [w + 0.6, 0.5, d + 0.6], [0, 0.25, 0], "#1a202c");
  // Lobi Cam Giydirme (Zemin kat)
  box(g, [w + 0.1, 2.6, d + 0.1], [0, 1.55, 0], "#2b6cb0", 0.2);
  // Lobi köşe kolonları
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      box(g, [0.6, 2.6, 0.6], [sx * halfW, 1.55, sz * halfD], "#2d3748");
    }
  }

  // 2. Ana Kule Gövdesi (Cam ve Metal Karkas)
  box(g, [w, totalHeight - 2.6, d], [0, (totalHeight + 2.6) / 2, 0], b.mainColor, 0.3);

  // Dikey ve yatay cephe profilleri (Curtain Wall Mullions)
  const numMullionsX = Math.max(3, Math.floor(w / 1.8));
  const stepX = w / numMullionsX;
  for (let i = 0; i <= numMullionsX; i++) {
    const mx = -halfW + i * stepX;
    box(g, [0.12, totalHeight, 0.1], [mx, totalHeight / 2, halfD + 0.05], b.accentColor);
    box(g, [0.12, totalHeight, 0.1], [mx, totalHeight / 2, -halfD - 0.05], b.accentColor);
  }

  const numMullionsZ = Math.max(3, Math.floor(d / 1.8));
  const stepZ = d / numMullionsZ;
  for (let j = 0; j <= numMullionsZ; j++) {
    const mz = -halfD + j * stepZ;
    box(g, [0.1, totalHeight, 0.12], [halfW + 0.05, totalHeight / 2, mz], b.accentColor);
    box(g, [0.1, totalHeight, 0.12], [-halfW - 0.05, totalHeight / 2, mz], b.accentColor);
  }

  // Yatay kat profilleri
  for (let f = 1; f <= b.floors; f++) {
    const fy = f * floorHeight;
    box(g, [w + 0.2, 0.2, d + 0.2], [0, fy, 0], b.accentColor);
  }

  // 3. Çatı Terası ve Helipad
  box(g, [w + 0.3, 0.6, d + 0.3], [0, totalHeight + 0.3, 0], "#2d3748");
  // Helipad Platformu
  const padSize = Math.min(w, d) * 0.75;
  box(g, [padSize, 0.12, padSize], [0, totalHeight + 0.65, 0], "#4a5568");
  // Helipad 'H' Harfi
  box(g, [0.35, 0.04, padSize * 0.55], [-padSize * 0.18, totalHeight + 0.73, 0], "#ecc94b");
  box(g, [0.35, 0.04, padSize * 0.55], [padSize * 0.18, totalHeight + 0.73, 0], "#ecc94b");
  box(g, [padSize * 0.36, 0.04, 0.35], [0, totalHeight + 0.73, 0], "#ecc94b");
  // Helipad Güvenlik Işıkları (Köşeler)
  for (const hx of [-1, 1]) {
    for (const hz of [-1, 1]) {
      cylinder(g, 0.08, 0.08, 0.25, [hx * padSize * 0.46, totalHeight + 0.75, hz * padSize * 0.46], "#e53e3e", 8);
    }
  }

  // 4. Giriş Döner Kapısı ve Çelik Sundurma
  box(g, [3.2, 0.2, 1.6], [0, 2.7, halfD + 0.8], b.accentColor);
  cylinder(g, 0.08, 0.08, 2.6, [-1.4, 1.35, halfD + 1.5], "#cbd5e0", 8);
  cylinder(g, 0.08, 0.08, 2.6, [1.4, 1.35, halfD + 1.5], "#cbd5e0", 8);
  // Döner kapı silindiri
  cylinder(g, 0.9, 0.9, 2.1, [0, 1.05, halfD + 0.2], "#63b3ed", 12);

  // Plaza İsmi
  const plazaSign = label(b.name, "#ffffff", "#1a365d");
  plazaSign.scale.set(2.4, 0.6, 1);
  plazaSign.position.set(0, totalHeight - 1.2, halfD + 0.2);
  g.add(plazaSign);

  const pad = 0.25;
  return {
    minX: b.x - halfW - pad,
    maxX: b.x + halfW + pad,
    minZ: b.z - halfD - pad,
    maxZ: b.z + halfD + pad,
  };
}

/**
 * Sıra Dükkanlar ve Kasaba Binaları (Row Houses & Street Shops):
 * Bitişik nizam, renkli tenteler, dükkan vitrinleri, panjurlar, üçgen kiremit çatı.
 */
export function buildRowShops(
  parent: THREE.Object3D,
  b: CityBuildingDef,
): Rect {
  const g = new THREE.Group();
  g.position.set(b.x, 0, b.z);
  if (b.rotation) g.rotation.y = b.rotation;
  parent.add(g);

  const totalHeight = b.floors * 2.3 + 0.5;
  const w = b.width;
  const d = b.depth;
  const halfW = w / 2;
  const halfD = d / 2;

  // 1. Zemin Kaidesi
  box(g, [w + 0.3, 0.25, d + 0.3], [0, 0.12, 0], "#718096");

  // 2. Ana Gövde
  box(g, [w, totalHeight, d], [0, totalHeight / 2 + 0.15, 0], b.mainColor);

  // 3. Eğimli Kiremit Çatı (Mansard / Gable Roof)
  const roofColor = b.roofColor ?? "#c53030";
  box(g, [w + 0.4, 0.35, d + 0.4], [0, totalHeight + 0.3, 0], "#4a5568");
  const roofTop = box(g, [w - 0.4, 1.4, d - 0.6], [0, totalHeight + 1.15, 0], roofColor);
  roofTop.rotation.x = 0.05;

  // 4. Alt Kat Dükkan Vitrinleri & Tenteler (Row Shop Units)
  const shopCount = Math.max(2, Math.floor(w / 3.2));
  const shopWidth = w / shopCount;
  const AWNING_COLORS = ["#e53e3e", "#dd6b20", "#319795", "#3182ce", "#805ad5"];

  for (let s = 0; s < shopCount; s++) {
    const sx = -halfW + s * shopWidth + shopWidth / 2;
    const awningCol = AWNING_COLORS[s % AWNING_COLORS.length];

    // Dükkan vitrini camı
    box(g, [shopWidth * 0.75, 1.6, 0.12], [sx, 0.95, halfD + 0.05], "#bee3f8", 0.2);
    // Vitrin alt paneli
    box(g, [shopWidth * 0.78, 0.3, 0.14], [sx, 0.25, halfD + 0.06], "#2d3748");

    // Eğimli kumaş tente
    const awning = box(g, [shopWidth * 0.88, 0.25, 1.2], [sx, 2.0, halfD + 0.6], awningCol);
    awning.rotation.x = 0.25;

    // Üst kat panjurlu pencereler
    for (let f = 1; f < b.floors; f++) {
      const fy = 0.3 + f * 2.3 + 1.1;
      // Pencere camı
      box(g, [0.85, 1.1, 0.06], [sx, fy, halfD + 0.03], "#e2e8f0");
      // Ahşap panjurlar (sağ ve sol)
      box(g, [0.32, 1.1, 0.08], [sx - 0.52, fy, halfD + 0.04], b.accentColor);
      box(g, [0.32, 1.1, 0.08], [sx + 0.52, fy, halfD + 0.04], b.accentColor);
      // Çiçek saksısı
      box(g, [1.1, 0.22, 0.3], [sx, fy - 0.62, halfD + 0.15], "#975a16");
      box(g, [0.95, 0.18, 0.22], [sx, fy - 0.52, halfD + 0.15], "#38a169");
    }
  }

  // Bina tabelası
  const shopSign = label(b.name, "#ffffff", b.accentColor);
  shopSign.scale.set(1.9, 0.48, 1);
  shopSign.position.set(0, 2.45, halfD + 0.25);
  g.add(shopSign);

  const pad = 0.2;
  return {
    minX: b.x - halfW - pad,
    maxX: b.x + halfW + pad,
    minZ: b.z - halfD - pad,
    maxZ: b.z + halfD + pad,
  };
}

/**
 * Şehir genelinde yer alan yoğun metropol bina listesi.
 * Tüm yollar, teslimat evleri (0-15), rampa atlama hatları ve depolar
 * titizlikle korunmuştur.
 */
export const CITY_BUILDINGS_CATALOG: CityBuildingDef[] = [
  // =========================================================================
  // 1. GÜNEŞ MAHALLESİ (Kuzeybatı Bölgesi)
  // =========================================================================
  {
    id: "sunny_apt_park",
    name: "GÜNEŞ PARK APARTMANI",
    x: -65,
    z: -65,
    width: 7.2,
    depth: 7.2,
    floors: 4,
    kind: "apartment",
    mainColor: "#e2e8f0", // Açık modern gri
    accentColor: "#dd6b20", // Canlı kiremit turuncusu
  },
  {
    id: "sunny_apt_cicek",
    name: "ÇİÇEK SİTESİ A BLOK",
    x: -35,
    z: -65,
    width: 7.0,
    depth: 7.0,
    floors: 3,
    kind: "apartment",
    mainColor: "#feebc8", // Sıcak bej
    accentColor: "#319795", // Camgöbeği
  },
  {
    id: "sunny_row_shops",
    name: "MAHALLE ÇARŞISI",
    x: -35,
    z: -42,
    width: 6.8,
    depth: 6.2,
    floors: 2,
    kind: "row_shops",
    mainColor: "#f7fafc",
    accentColor: "#3182ce",
    roofColor: "#c53030",
  },
  {
    id: "sunny_boulevard_apt",
    name: "BULVAR PALAS",
    x: -14,
    z: -65,
    width: 5.6,
    depth: 7.8,
    floors: 4,
    kind: "apartment",
    mainColor: "#edf2f7",
    accentColor: "#805ad5",
  },

  // =========================================================================
  // 2. ÇARŞI VE İŞ MERKEZİ BÖLGESİ (Güneydoğu Bölgesi)
  // =========================================================================
  {
    id: "market_plaza_kristal",
    name: "KRİSTAL İŞ MERKEZİ",
    x: 27,
    z: 18,
    width: 6.8,
    depth: 7.2,
    floors: 6,
    kind: "plaza",
    mainColor: "#2b6cb0", // Mavi cam giydirme
    accentColor: "#1a202c", // Koyu çelik karkas
  },
  {
    id: "market_row_piazza",
    name: "MEYDAN PASAJI & KAFELER",
    x: 16,
    z: 18,
    width: 6.4,
    depth: 6.2,
    floors: 3,
    kind: "row_shops",
    mainColor: "#fffaf0",
    accentColor: "#d69e2e",
    roofColor: "#9b2c2c",
  },
  {
    id: "market_tower_merkez",
    name: "METROPOL TOWER",
    x: 68,
    z: 18,
    width: 8.2,
    depth: 7.8,
    floors: 7,
    kind: "plaza",
    mainColor: "#2c5282",
    accentColor: "#cbd5e0",
  },
  {
    id: "market_shops_dogu",
    name: "KAPALI ÇARŞI BUTİKLERİ",
    x: 82,
    z: 18,
    width: 6.5,
    depth: 6.0,
    floors: 2,
    kind: "row_shops",
    mainColor: "#fefcbf",
    accentColor: "#c53030",
  },
  {
    id: "market_apt_rezidans",
    name: "ÇARŞI REZİDANS",
    x: 20,
    z: 67,
    width: 7.2,
    depth: 7.2,
    floors: 5,
    kind: "apartment",
    mainColor: "#e2e8f0",
    accentColor: "#4299e1",
  },
  {
    id: "market_plaza_finans",
    name: "FİNANS MERKEZİ PLAZA",
    x: 68,
    z: 67,
    width: 8.0,
    depth: 7.8,
    floors: 6,
    kind: "plaza",
    mainColor: "#1a365d",
    accentColor: "#d69e2e",
  },
  {
    id: "market_shops_guney",
    name: "ESNAF SOKAĞI",
    x: 82,
    z: 67,
    width: 6.5,
    depth: 6.0,
    floors: 2,
    kind: "row_shops",
    mainColor: "#fff5f5",
    accentColor: "#319795",
  },

  // =========================================================================
  // 3. SANAYİ VE TEKNOLOJİ BÖLGESİ (Kuzeydoğu Bölgesi)
  // =========================================================================
  {
    id: "ind_teknopark",
    name: "SANAYİ TEKNOPARK A.Ş.",
    x: 35,
    z: -84,
    width: 7.8,
    depth: 6.8,
    floors: 4,
    kind: "plaza",
    mainColor: "#4a5568",
    accentColor: "#e2e8f0",
  },
  {
    id: "ind_yonetim",
    name: "ORGANİZE SANAYİ BİRLİĞİ",
    x: 65,
    z: -84,
    width: 7.8,
    depth: 6.8,
    floors: 4,
    kind: "apartment",
    mainColor: "#718096",
    accentColor: "#c53030",
  },
  {
    id: "ind_antrepo_hq",
    name: "LOJİSTİK KOORDİNASYON",
    x: 20,
    z: -34,
    width: 6.8,
    depth: 6.2,
    floors: 3,
    kind: "apartment",
    mainColor: "#2d3748",
    accentColor: "#f6ad55",
  },
  {
    id: "ind_plaza_gumruk",
    name: "GÜMRÜK & TİCARET BİNASI",
    x: 80,
    z: -35,
    width: 7.2,
    depth: 6.2,
    floors: 5,
    kind: "plaza",
    mainColor: "#2b6cb0",
    accentColor: "#edf2f7",
  },

  // =========================================================================
  // 4. SAHİL VE MARİNA BÖLGESİ (Güneybatı Bölgesi)
  // =========================================================================
  {
    id: "coastal_palas_hotel",
    name: "GRAND SAHİL PALAS OTEL",
    x: -70,
    z: 18,
    width: 7.8,
    depth: 7.2,
    floors: 5,
    kind: "plaza",
    mainColor: "#ffffff",
    accentColor: "#319795", // Turkuaz detaylar
  },
  {
    id: "coastal_marina_apt",
    name: "MARİNA VİLLALARI REZİDANS",
    x: -20,
    z: 18,
    width: 7.0,
    depth: 7.0,
    floors: 4,
    kind: "apartment",
    mainColor: "#f7fafc",
    accentColor: "#38b2ac",
  },
  {
    id: "coastal_sea_tower",
    name: "DENİZ MANZARA REZİDANS",
    x: -35,
    z: 66,
    width: 7.2,
    depth: 7.2,
    floors: 5,
    kind: "apartment",
    mainColor: "#edf2f7",
    accentColor: "#4299e1",
  },
  {
    id: "coastal_kordon_apt",
    name: "KORDON APARTMANI",
    x: -65,
    z: 66,
    width: 7.2,
    depth: 7.0,
    floors: 4,
    kind: "apartment",
    mainColor: "#ffffff",
    accentColor: "#ed8936",
  },
];

/**
 * Şehir binalarını oluşturur ve engellerini (colliders) listeye ekler.
 */
export function buildCityBuildings(ctx: WorldContext): {
  group: THREE.Group;
  obstacles: Rect[];
} {
  const group = new THREE.Group();
  group.name = "city_buildings";
  ctx.group.add(group);

  const obstacles: Rect[] = [];

  for (const def of CITY_BUILDINGS_CATALOG) {
    let collider: Rect;
    switch (def.kind) {
      case "plaza":
        collider = buildPlazaTower(group, def);
        break;
      case "row_shops":
        collider = buildRowShops(group, def);
        break;
      case "apartment":
      default:
        collider = buildModernApartment(group, def);
        break;
    }
    obstacles.push(collider);
    ctx.baseObstacles.push(collider);
  }

  return { group, obstacles };
}
