import * as THREE from "three";
import { box, mat } from "./world-kit";

export type CargoRacksView = {
  group: THREE.Group;
  level: number;
  update(cargoLevel: number): void;
  dispose(): void;
};

/**
 * Ahşap/karton koli oluşturur.
 * Bant, etiket ve gölge özellikleriyle arcade idle stili kargo kolisi.
 */
function createParcel(
  parent: THREE.Object3D,
  size: [number, number, number],
  pos: [number, number, number],
  boxColor = "#b88654",
  tapeColor = "#d4af78",
  rotY = 0,
) {
  const parcelGroup = new THREE.Group();
  parcelGroup.position.set(pos[0], pos[1], pos[2]);
  if (rotY !== 0) {
    parcelGroup.rotation.y = rotY;
  }
  parent.add(parcelGroup);

  // Ana karton gövde
  box(parcelGroup, size, [0, 0, 0], boxColor, 0.9);

  // Üst bant şeridi
  box(
    parcelGroup,
    [size[0] * 1.01, 0.015, size[2] * 0.22],
    [0, size[1] / 2 + 0.008, 0],
    tapeColor,
    0.6,
  );

  // Yan nakliye etiketi
  box(
    parcelGroup,
    [size[0] * 0.35, size[1] * 0.35, 0.01],
    [0, 0, size[2] / 2 + 0.006],
    "#f8fafc",
    0.95,
  );

  return parcelGroup;
}

/**
 * Standart Euro-Palet oluşturur.
 * Alt kızaklar, ara takozlar ve üst tahta çıtalar.
 */
function createEuroPallet(
  parent: THREE.Object3D,
  pos: [number, number, number],
  width = 1.2,
  depth = 0.9,
  palletColor = "#8c6239",
) {
  const palletGroup = new THREE.Group();
  palletGroup.position.set(pos[0], pos[1], pos[2]);
  parent.add(palletGroup);

  const skidThickness = 0.024;
  const blockHeight = 0.08;
  const totalH = skidThickness * 2 + blockHeight;

  // 1. Alt kızaklar (3 adet)
  const skidPositions = [-depth / 2 + 0.06, 0, depth / 2 - 0.06];
  for (const z of skidPositions) {
    box(
      palletGroup,
      [width, skidThickness, 0.1],
      [0, skidThickness / 2, z],
      palletColor,
      0.88,
    );
  }

  // 2. Takoz bloklar (6 adet)
  const blockX = [-width / 2 + 0.08, 0, width / 2 - 0.08];
  for (const x of blockX) {
    for (const z of skidPositions) {
      box(
        palletGroup,
        [0.1, blockHeight, 0.1],
        [x, skidThickness + blockHeight / 2, z],
        palletColor,
        0.88,
      );
    }
  }

  // 3. Üst tahta çıtaları (5 adet)
  const slatPositions = [
    -depth / 2 + 0.06,
    -depth / 4 + 0.03,
    0,
    depth / 4 - 0.03,
    depth / 2 - 0.06,
  ];
  for (const z of slatPositions) {
    box(
      palletGroup,
      [width, skidThickness, 0.12],
      [0, skidThickness + blockHeight + skidThickness / 2, z],
      palletColor,
      0.88,
    );
  }

  return { group: palletGroup, height: totalH };
}

/**
 * 2 Katlı Ahşap Kargo Raf Ünitesi oluşturur.
 */
function createWoodenShelving(
  parent: THREE.Object3D,
  pos: [number, number, number],
  width = 1.6,
  height = 1.8,
  depth = 0.75,
  postColor = "#784a28",
  boardColor = "#9c673b",
) {
  const shelfGroup = new THREE.Group();
  shelfGroup.position.set(pos[0], pos[1], pos[2]);
  parent.add(shelfGroup);

  const postThickness = 0.07;
  const halfW = width / 2;
  const halfD = depth / 2;

  // 4 Dikey Ahşap Dikme
  for (const x of [-halfW, halfW]) {
    for (const z of [-halfD, halfD]) {
      box(
        shelfGroup,
        [postThickness, height, postThickness],
        [x, height / 2, z],
        postColor,
        0.85,
      );
    }
  }

  // Arka & Yan Destek Kirişleri
  box(
    shelfGroup,
    [width, 0.04, 0.04],
    [0, height * 0.95, -halfD],
    postColor,
    0.85,
  );
  box(
    shelfGroup,
    [0.04, 0.04, depth],
    [-halfW, height * 0.5, 0],
    postColor,
    0.85,
  );
  box(
    shelfGroup,
    [0.04, 0.04, depth],
    [halfW, height * 0.5, 0],
    postColor,
    0.85,
  );

  // 2 Adet Ahşap Raf Tablası (Alt ve Üst)
  const shelfLevels = [0.45, 1.15];
  for (const y of shelfLevels) {
    box(
      shelfGroup,
      [width + 0.06, 0.04, depth + 0.04],
      [0, y, 0],
      boardColor,
      0.8,
    );
  }

  return shelfGroup;
}

/**
 * Paletli Büyük Endüstriyel Depo Rafı (Heavy-Duty Warehouse High-Bay Rack).
 */
function createPalletWarehouseRack(
  parent: THREE.Object3D,
  pos: [number, number, number],
  width = 2.1,
  height = 2.3,
  depth = 0.85,
) {
  const rackGroup = new THREE.Group();
  rackGroup.position.set(pos[0], pos[1], pos[2]);
  parent.add(rackGroup);

  const uprightColor = "#334155"; // Endüstriyel koyu çelik dikmeler
  const beamColor = "#f59e0b"; // Güvenlik sarı/turuncu taşıyıcı kirişler
  const postW = 0.08;
  const halfW = width / 2;
  const halfD = depth / 2;

  // 4 Çelik Dikme
  for (const x of [-halfW, halfW]) {
    for (const z of [-halfD, halfD]) {
      box(
        rackGroup,
        [postW, height, postW],
        [x, height / 2, z],
        uprightColor,
        0.7,
      );
    }
  }

  // Yan Çapraz Kirişler (Truss)
  for (const x of [-halfW, halfW]) {
    box(rackGroup, [0.03, 0.03, depth], [x, height * 0.35, 0], uprightColor, 0.7);
    box(rackGroup, [0.03, 0.03, depth], [x, height * 0.75, 0], uprightColor, 0.7);
  }

  // 2 Katlı Ağır Yük Kirişleri ve Ahşap Izgara Tablaları
  const tierHeights = [0.2, 1.25];
  for (const y of tierHeights) {
    // Ön ve Arka Turuncu Emniyet Kirişleri
    box(rackGroup, [width + 0.04, 0.08, 0.05], [0, y, halfD], beamColor, 0.6);
    box(rackGroup, [width + 0.04, 0.08, 0.05], [0, y, -halfD], beamColor, 0.6);

    // Ahşap Raf Deck Tablası
    box(
      rackGroup,
      [width - 0.04, 0.03, depth - 0.02],
      [0, y + 0.04, 0],
      "#a16207",
      0.85,
    );
  }

  return rackGroup;
}

function clearMeshTree(obj: THREE.Object3D) {
  while (obj.children.length > 0) {
    const child = obj.children[0];
    obj.remove(child);
    if (child instanceof THREE.Mesh) {
      child.geometry?.dispose();
    } else if (child instanceof THREE.Group) {
      clearMeshTree(child);
    }
  }
}

/**
 * Depo önündeki 3D Kargo Rafları ve Koli Yığınları Yöneticisi.
 *
 * - Seviye 0: Az koli (depo apronunda birkaç karton koli)
 * - Seviye 1: Yeni bir ahşap raf ünitesi ve raflara dizilmiş kargo kolileri
 * - Seviye 2+: Paletli büyük endüstriyel kargo rafı, Euro-paletler ve zenginleştirilmiş kargo yığınları
 */
export function createCargoRacksView(initialLevel = 0): CargoRacksView {
  const group = new THREE.Group();
  // Depo dock platformunun batı tarafına yerleşir: world x: -65.5, y: 0.2, z: -37.0
  group.position.set(-65.5, 0.2, -37.0);

  let currentLevel = -1;

  function buildLevel(level: number) {
    clearMeshTree(group);
    currentLevel = level;

    if (level === 0) {
      // ==========================================
      // SEVİYE 0: Az Koli (Başlangıç Depo Görünümü)
      // ==========================================
      // Platform üstünde küçük koli yığını
      createParcel(group, [0.65, 0.45, 0.6], [0, 0.225, 0], "#b88654", "#d4af78", 0.05);
      createParcel(group, [0.55, 0.4, 0.5], [-0.05, 0.65, -0.05], "#c89a6a", "#d4af78", -0.08);
      createParcel(group, [0.5, 0.35, 0.55], [0.7, 0.175, 0.05], "#a87544", "#e0be8a", 0.12);
      createParcel(group, [0.35, 0.25, 0.35], [0.7, 0.475, 0], "#b88654", "#ea580c", -0.05);
    } else if (level === 1) {
      // ==========================================
      // SEVİYE 1: Yeni Ahşap Raf Ünitesi ve Koliler
      // ==========================================
      // 1. İki katlı ahşap kargo raf ünitesi
      createWoodenShelving(group, [0, 0, 0], 1.6, 1.8, 0.75);

      // Alt raf katındaki koliler (y: 0.45 üzeri)
      createParcel(group, [0.45, 0.35, 0.5], [-0.45, 0.65, 0], "#b88654", "#d4af78", 0.02);
      createParcel(group, [0.4, 0.32, 0.45], [0.05, 0.635, 0], "#c89a6a", "#10b981", -0.04);
      createParcel(group, [0.4, 0.38, 0.5], [0.5, 0.665, 0], "#a87544", "#d4af78", 0.06);

      // Üst raf katındaki koliler (y: 1.15 üzeri)
      createParcel(group, [0.5, 0.35, 0.48], [-0.3, 1.35, 0], "#c49666", "#d4af78", -0.03);
      createParcel(group, [0.45, 0.3, 0.45], [0.35, 1.325, 0], "#b88654", "#06b6d4", 0.04);

      // Rafın yanında platformda istiflenmiş bekleme kolileri
      createParcel(group, [0.55, 0.42, 0.55], [1.1, 0.21, 0.05], "#b88654", "#ea580c", 0.1);
      createParcel(group, [0.42, 0.35, 0.42], [1.1, 0.595, 0.05], "#c89a6a", "#d4af78", -0.06);
    } else {
      // ==========================================
      // SEVİYE 2+: Paletli Büyük Endüstriyel Kargo Rafı
      // ==========================================
      // 1. Sol tarafta ahşap raf ünitesi
      createWoodenShelving(group, [-1.0, 0, 0], 1.4, 1.8, 0.75);
      createParcel(group, [0.4, 0.32, 0.45], [-1.25, 0.635, 0], "#b88654", "#d4af78", 0.02);
      createParcel(group, [0.4, 0.36, 0.45], [-0.75, 0.655, 0], "#c89a6a", "#10b981", -0.04);
      createParcel(group, [0.45, 0.3, 0.45], [-1.0, 1.325, 0], "#b88654", "#06b6d4", 0.03);

      // 2. Sağ tarafta Paletli Büyük Kargo Rafı (High-Bay Warehouse Rack)
      createPalletWarehouseRack(group, [1.15, 0, 0], 2.1, 2.3, 0.85);

      // Alt kat Euro-Palet ve Koli Yığını
      createEuroPallet(group, [1.15, 0.25, 0], 1.2, 0.75);
      // Palet üzeri büyük paket grubu
      createParcel(group, [0.48, 0.4, 0.32], [0.88, 0.62, -0.16], "#b88654", "#d4af78");
      createParcel(group, [0.48, 0.4, 0.32], [1.42, 0.62, -0.16], "#c89a6a", "#d4af78");
      createParcel(group, [0.48, 0.4, 0.32], [0.88, 0.62, 0.16], "#a87544", "#ea580c");
      createParcel(group, [0.48, 0.4, 0.32], [1.42, 0.62, 0.16], "#b88654", "#d4af78");
      createParcel(group, [0.55, 0.35, 0.45], [1.15, 1.0, 0], "#c89a6a", "#0284c7", 0.08);

      // Üst kat Euro-Palet ve Ahşap Kargo Sandığı
      createEuroPallet(group, [1.15, 1.3, 0], 1.2, 0.75);
      // Ahşap kargo sandığı
      box(group, [0.65, 0.5, 0.55], [0.82, 1.7, 0], "#7c502b", 0.85);
      box(group, [0.67, 0.04, 0.04], [0.82, 1.7, 0.28], "#9b673c", 0.85);
      box(group, [0.67, 0.04, 0.04], [0.82, 1.7, -0.28], "#9b673c", 0.85);
      createParcel(group, [0.42, 0.38, 0.42], [1.4, 1.64, 0], "#c89a6a", "#ea580c", -0.05);

      // 3. Depo Apronuna İnen Zemin Paleti (World y: 0 -> relative y: -0.2, z: 1.3)
      createEuroPallet(group, [0.1, -0.2, 1.25], 1.1, 0.8);
      createParcel(group, [0.45, 0.35, 0.4], [-0.15, 0.13, 1.25], "#b88654", "#d4af78", 0.05);
      createParcel(group, [0.4, 0.32, 0.4], [0.35, 0.115, 1.25], "#c89a6a", "#10b981", -0.08);
      createParcel(group, [0.35, 0.26, 0.35], [0.1, 0.41, 1.25], "#a87544", "#ea580c", 0.02);
    }
  }

  buildLevel(initialLevel);

  return {
    group,
    get level() {
      return currentLevel;
    },
    update(cargoLevel: number) {
      if (cargoLevel !== currentLevel) {
        buildLevel(cargoLevel);
      }
    },
    dispose() {
      clearMeshTree(group);
      while (group.children.length > 0) {
        group.remove(group.children[0]);
      }
    },
  };
}
