import * as THREE from "three";
import { box, cylinder, label, mat } from "./world-kit";
import type { Vec2 } from "../game/types";
import { getDistrictForHome, type DistrictId } from "../game/districts";
import type { PackageType } from "../game/delivery";

export type StationKind = "porch" | "store" | "pallet" | "dock";

export type StationView = {
  homeIndex: number;
  districtId: DistrictId;
  kind: StationKind;
  stationPos: Vec2;
  homePosition: Vec2;
  group: THREE.Group;
  characterGroup: THREE.Group;
  leftArmPivot: THREE.Group;
  rightArmPivot: THREE.Group;
  deliveredParcelsGroup: THREE.Group;
  deliveredCount: number;
  celebrateTimer: number;
  waveTimer: number;
  baseY: number;
};

export type DeliveryStationsView = {
  group: THREE.Group;
  stations: StationView[];
  onDelivered(homeIndex: number, packageType?: PackageType): void;
  update(dt: number, activeTargetIndex?: number, isDelivering?: boolean): void;
  getStationStats(): { totalStations: number; totalDeliveredParcels: number };
  dispose(): void;
};

/**
 * 16 Teslimat Noktası İçin Özel Fiziksel İstasyonlar & Karşılayıcı NPC Karakterleri
 */
export function createDeliveryStations(homes: Vec2[]): DeliveryStationsView {
  const group = new THREE.Group();
  const stations: StationView[] = [];

  // 16 evin istasyon yerleşim offsetleri (araç yaklaşma yolunu ve 1.8m durma çemberini engellemeyecek şekilde)
  homes.forEach((home, index) => {
    const districtId = getDistrictForHome(index);
    const stationGroup = new THREE.Group();

    let kind: StationKind = "porch";
    let offsetX = -2.6;
    let offsetZ = -2.8;

    if (districtId === "sunny") {
      kind = "porch";
      // Güneş Mahallesi (0..3): Ev verandası ve posta alanı
      offsetX = -2.5;
      offsetZ = -2.8;
    } else if (districtId === "market") {
      kind = "store";
      // Çarşı Bölgesi (4..7): Dükkan önü sipariş tezgahı
      offsetX = -2.8;
      offsetZ = -2.3;
    } else if (districtId === "industrial") {
      kind = "pallet";
      // Sanayi Bölgesi (8..11): Antrepo yükleme paleti alanı
      offsetX = -3.2;
      offsetZ = -2.8;
    } else {
      kind = "dock";
      // Sahil Şeridi (12..15): Ahşap iskele ve sahil teslimat masası
      offsetX = -2.8;
      offsetZ = -2.5;
    }

    const stationX = home.x + offsetX;
    const stationZ = home.z + offsetZ;
    stationGroup.position.set(stationX, 0, stationZ);
    group.add(stationGroup);

    // Teslim edilen paketlerin istiflendiği grup
    const deliveredParcelsGroup = new THREE.Group();
    stationGroup.add(deliveredParcelsGroup);

    // =========================================================================
    // 1. Bölgeye Özgü Mimari İstasyon Donanımı (Station Furniture & Props)
    // =========================================================================
    if (kind === "porch") {
      // Güneş Mahallesi Veranda Teslimat Masası & Paspas
      box(stationGroup, [1.8, 0.04, 1.2], [0, 0.02, 0], "#34495e"); // Welcome Paspası
      box(stationGroup, [1.88, 0.02, 1.28], [0, 0.01, 0], "#f39c12"); // Altın rengi bordür
      // Ahşap teslimat sehpası
      box(stationGroup, [0.85, 0.65, 0.55], [-0.45, 0.33, 0], "#8d6e63");
      box(stationGroup, [0.92, 0.06, 0.62], [-0.45, 0.68, 0], "#a1887f");
      // Güneş enerjili bahçe feneri
      cylinder(stationGroup, 0.04, 0.04, 0.6, [0.65, 0.3, 0.4], "#2c3e50");
      box(stationGroup, [0.14, 0.14, 0.14], [0.65, 0.62, 0.4], "#f6e58d");
    } else if (kind === "store") {
      // Çarşı Butik / Kafe Sipariş Kabul Bankosu
      box(stationGroup, [1.4, 0.85, 0.6], [0, 0.42, 0], "#5d4037");
      box(stationGroup, [1.48, 0.06, 0.68], [0, 0.88, 0], "#efebe9");
      // Pirinç servis zili
      cylinder(stationGroup, 0.07, 0.09, 0.06, [-0.4, 0.94, 0.05], "#f1c40f");
      cylinder(stationGroup, 0.015, 0.015, 0.04, [-0.4, 0.98, 0.05], "#d35400");
      // Teslimat sipariş formu / fatura panosu
      box(stationGroup, [0.28, 0.02, 0.36], [-0.05, 0.92, 0], "#d7ccc8");
      box(stationGroup, [0.24, 0.025, 0.32], [-0.05, 0.925, 0], "#ffffff");
      // Ahşap ön tabela
      const storeSign = label("SİPARİŞ TESLİM", "#ffffff", "#c0392b");
      storeSign.scale.set(1.4, 0.35, 1);
      storeSign.position.set(0, 0.5, 0.32);
      stationGroup.add(storeSign);
    } else if (kind === "pallet") {
      // Sanayi Bölgesi Ağır Yük Paleti & Sarı-Siyah Emniyet Şeritleri
      box(stationGroup, [1.6, 0.14, 1.4], [0, 0.07, 0], "#a1887f"); // Ahşap palet üstü
      box(stationGroup, [1.5, 0.06, 0.2], [0, 0.03, -0.5], "#6d4c41");
      box(stationGroup, [1.5, 0.06, 0.2], [0, 0.03, 0], "#6d4c41");
      box(stationGroup, [1.5, 0.06, 0.2], [0, 0.03, 0.5], "#6d4c41");
      // Emniyet sarı-siyah zemin çerçevesi
      box(stationGroup, [1.8, 0.03, 0.15], [0, 0.015, 0.8], "#f1c40f");
      box(stationGroup, [1.8, 0.03, 0.15], [0, 0.015, -0.8], "#f1c40f");
      // Çelik yönlendirme bariyer babası
      cylinder(stationGroup, 0.06, 0.06, 0.85, [0.85, 0.42, 0.65], "#e74c3c");
      cylinder(stationGroup, 0.065, 0.065, 0.1, [0.85, 0.65, 0.65], "#ffffff");
    } else {
      // Sahil Şeridi İskele Ahşap Teslimat Platformu & Can Simidi
      box(stationGroup, [1.6, 0.12, 1.3], [0, 0.06, 0], "#8d6e63");
      // Halat bağlama babası
      cylinder(stationGroup, 0.08, 0.08, 0.9, [-0.65, 0.45, 0.5], "#4e342e");
      // Can simidi
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.18, 0.06, 8, 16),
        mat("#e74c3c", 0.7),
      );
      ring.position.set(-0.65, 0.65, 0.58);
      stationGroup.add(ring);
    }

    // =========================================================================
    // 2. Karşılayıcı NPC Karakteri (Resident / Merchant / Worker / Attendant)
    // =========================================================================
    const characterGroup = new THREE.Group();
    characterGroup.position.set(0.35, 0, 0);
    stationGroup.add(characterGroup);

    let outfitColor = "#3498db";
    let pantsColor = "#2c3e50";
    let skinColor = "#fed7aa";

    if (kind === "porch") {
      const porchOutfits = ["#e67e22", "#27ae60", "#8e44ad", "#d35400"];
      outfitColor = porchOutfits[index % porchOutfits.length];
      pantsColor = "#34495e";
    } else if (kind === "store") {
      const storeOutfits = ["#c0392b", "#16a085", "#2980b9", "#d35400"];
      outfitColor = storeOutfits[index % storeOutfits.length];
      pantsColor = "#1a252f";
    } else if (kind === "pallet") {
      outfitColor = "#ff9f43"; // Parlak işçi yeleği
      pantsColor = "#7f8c8d";
    } else {
      outfitColor = "#2980b9"; // Denizci mavisi
      pantsColor = "#ecf0f1";
    }

    // Gövde (Torso)
    box(characterGroup, [0.28, 0.44, 0.2], [0, 0.68, 0], outfitColor);
    if (kind === "pallet") {
      // Sanayi yeleği reflektör çizgileri
      box(characterGroup, [0.29, 0.06, 0.21], [0, 0.72, 0], "#ffffff");
      box(characterGroup, [0.29, 0.06, 0.21], [0, 0.58, 0], "#ffffff");
    }

    // Bacaklar
    box(characterGroup, [0.11, 0.42, 0.14], [-0.07, 0.23, 0], pantsColor);
    box(characterGroup, [0.11, 0.42, 0.14], [0.07, 0.23, 0], pantsColor);
    // Ayakkabılar
    box(characterGroup, [0.12, 0.06, 0.18], [-0.07, 0.03, 0.02], "#1a1a1a");
    box(characterGroup, [0.12, 0.06, 0.18], [0.07, 0.03, 0.02], "#1a1a1a");

    // Kafa & Şapka
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.05, 0);
    characterGroup.add(headGroup);

    const headMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 10, 8),
      mat(skinColor, 0.9),
    );
    headGroup.add(headMesh);

    if (kind === "pallet") {
      // Sarı güvenlik bareti
      box(headGroup, [0.26, 0.1, 0.26], [0, 0.12, 0], "#f1c40f");
    } else if (kind === "dock") {
      // Denizci siperlikli kep
      box(headGroup, [0.24, 0.07, 0.24], [0, 0.12, 0], "#ffffff");
      box(headGroup, [0.2, 0.03, 0.12], [0, 0.09, 0.14], "#2c3e50");
    } else {
      // Mahalle / butik saç stili
      box(headGroup, [0.24, 0.08, 0.24], [0, 0.12, 0], "#4a2c11");
    }

    // Kollar & Animasyon Pivotları (Omuz hizası: y = 0.85)
    const leftArmPivot = new THREE.Group();
    leftArmPivot.position.set(-0.19, 0.85, 0);
    characterGroup.add(leftArmPivot);
    box(leftArmPivot, [0.09, 0.38, 0.1], [0, -0.18, 0], outfitColor);
    box(leftArmPivot, [0.08, 0.09, 0.09], [0, -0.37, 0], skinColor);

    const rightArmPivot = new THREE.Group();
    rightArmPivot.position.set(0.19, 0.85, 0);
    characterGroup.add(rightArmPivot);
    box(rightArmPivot, [0.09, 0.38, 0.1], [0, -0.18, 0], outfitColor);
    box(rightArmPivot, [0.08, 0.09, 0.09], [0, -0.37, 0], skinColor);

    if (kind === "pallet") {
      // Sanayi formeninin elinde el terminali/barkod okuyucu
      box(rightArmPivot, [0.06, 0.12, 0.08], [0, -0.42, 0.04], "#2c3e50");
    }

    stations.push({
      homeIndex: index,
      districtId,
      kind,
      stationPos: { x: stationX, z: stationZ },
      homePosition: home,
      group: stationGroup,
      characterGroup,
      leftArmPivot,
      rightArmPivot,
      deliveredParcelsGroup,
      deliveredCount: 0,
      celebrateTimer: 0,
      waveTimer: 0,
      baseY: 0,
    });
  });

  return {
    group,
    stations,
    onDelivered(homeIndex: number, packageType: PackageType = "standard") {
      const station = stations[homeIndex];
      if (!station) return;

      station.celebrateTimer = 1.8;
      station.deliveredCount++;

      // İstasyon masası veya paleti üzerinde teslim edilmiş şık paket yığını oluştur (en fazla 3 adet)
      if (station.deliveredParcelsGroup.children.length < 3) {
        const parcelIdx = station.deliveredParcelsGroup.children.length;
        const pGroup = new THREE.Group();

        let boxColor = "#c98e51";
        let ribbonColor = "#e74c3c";
        let width = 0.5;
        let height = 0.35;
        let depth = 0.45;

        if (packageType === "vip_express") {
          boxColor = "#2c3e50";
          ribbonColor = "#f1c40f"; // Altın sarısı şerit
        } else if (packageType === "cold_chain") {
          boxColor = "#00cec9";
          ribbonColor = "#ffffff";
        } else if (packageType === "heavy_freight") {
          boxColor = "#636e72";
          ribbonColor = "#f39c12";
          width = 0.65;
          height = 0.42;
          depth = 0.55;
        } else if (packageType === "urgent") {
          boxColor = "#d63031";
          ribbonColor = "#ffffff";
        } else if (packageType === "fragile") {
          boxColor = "#ffeaa7";
          ribbonColor = "#0984e3";
        }

        // İstasyon türüne göre kutunun konulacağı zemin yüksekliği
        let tableY = 0.72; // Veranda sehpası
        let tableX = -0.45;
        let tableZ = 0;

        if (station.kind === "store") {
          tableY = 0.92;
          tableX = 0.35;
          tableZ = 0;
        } else if (station.kind === "pallet") {
          tableY = 0.18;
          tableX = 0;
          tableZ = 0;
        } else if (station.kind === "dock") {
          tableY = 0.16;
          tableX = -0.1;
          tableZ = 0.15;
        }

        const stackY = tableY + parcelIdx * (height + 0.02);
        pGroup.position.set(tableX, stackY, tableZ);

        box(pGroup, [width, height, depth], [0, height / 2, 0], boxColor);
        // Dekoratif hediye/kargo şeritleri
        box(pGroup, [width + 0.01, height + 0.01, 0.06], [0, height / 2, 0], ribbonColor);
        box(pGroup, [0.06, height + 0.01, depth + 0.01], [0, height / 2, 0], ribbonColor);

        // Minik şirin yay/fiyonk
        box(pGroup, [0.12, 0.06, 0.12], [0, height + 0.03, 0], ribbonColor);

        station.deliveredParcelsGroup.add(pGroup);
      }
    },
    update(dt: number, activeTargetIndex = -1, isDelivering = false) {
      for (const st of stations) {
        if (st.celebrateTimer > 0) {
          st.celebrateTimer -= dt;
          // Zıplama & iki kol havada neşeli kutlama dansı ("🙌")
          const jumpPhase = Math.sin((1.8 - st.celebrateTimer) * 14);
          st.characterGroup.position.y = st.baseY + Math.max(0, jumpPhase * 0.32);
          st.leftArmPivot.rotation.z = Math.PI * 0.85;
          st.rightArmPivot.rotation.z = -Math.PI * 0.85;
          st.leftArmPivot.rotation.x = Math.sin((1.8 - st.celebrateTimer) * 10) * 0.3;
          st.rightArmPivot.rotation.x = -Math.sin((1.8 - st.celebrateTimer) * 10) * 0.3;
        } else if (isDelivering && activeTargetIndex === st.homeIndex) {
          // Oyuncu aracı bu eve teslimat yaparken el sallayarak karşılama
          st.waveTimer += dt;
          st.characterGroup.position.y = st.baseY + Math.sin(st.waveTimer * 4) * 0.03;
          // Sağ kol yukarıda el sallama
          st.rightArmPivot.rotation.z = -Math.PI * 0.72 + Math.sin(st.waveTimer * 8) * 0.28;
          st.rightArmPivot.rotation.x = 0.15;
          st.leftArmPivot.rotation.z = 0.1;
          st.leftArmPivot.rotation.x = 0;
        } else {
          // Sakin nefes alma duruşu
          st.characterGroup.position.y = st.baseY;
          st.leftArmPivot.rotation.set(0, 0, 0.08);
          st.rightArmPivot.rotation.set(0, 0, -0.08);
        }
      }
    },
    getStationStats() {
      let totalDeliveredParcels = 0;
      for (const st of stations) {
        totalDeliveredParcels += st.deliveredCount;
      }
      return {
        totalStations: stations.length,
        totalDeliveredParcels,
      };
    },
    dispose() {
      group.clear();
      stations.length = 0;
    },
  };
}
