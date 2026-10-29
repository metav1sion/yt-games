import * as THREE from "three";
import { box, cylinder, label } from "./world-kit";
import {
  DEFAULT_STREET_VENDORS,
  type StreetVendorDef,
  type StreetVendorState,
} from "../game/street-vendors";
import type { Vec2 } from "../game/types";

export type StreetVendorsView = {
  group: THREE.Group;
  update(dt: number, state: StreetVendorState, playerPos: Vec2): void;
  onPlayerHonk(): void;
  dispose(): void;
};

type VendorInstance = {
  def: StreetVendorDef;
  group: THREE.Group;
  armPivot: THREE.Group;
  bubble: THREE.Sprite;
  steamGroup?: THREE.Group;
  waveTimer: number;
};

/**
 * Çarşı ve Sahil için Geleneksel Seyyar Sokak Satıcıları (Simitçi & Kestaneci)
 * 3B Sahnesi, animasyonlu NPC'ler, nostaljik tekerlekli tezgahlar ve konuşma balonları.
 */
export function createStreetVendorsView(
  vendors: StreetVendorDef[] = DEFAULT_STREET_VENDORS,
): StreetVendorsView {
  const group = new THREE.Group();
  const instances: VendorInstance[] = [];

  vendors.forEach((v) => {
    const vg = new THREE.Group();
    vg.position.set(v.position.x, 0, v.position.z);
    group.add(vg);

    // =========================================================================
    // 1. TEZGAH MODELLERİ (Simit vs. Kestane)
    // =========================================================================
    let steamGroup: THREE.Group | undefined;

    if (v.id === "simit_carsi") {
      // -----------------------------------------------------------------------
      // SİMİT ARABASI: Nostaljik Kırmızı Ahşap/Metal Gövde & Cam Vitrin
      // -----------------------------------------------------------------------
      // Alt araba gövdesi
      box(vg, [1.4, 0.75, 0.95], [0, 0.55, 0], "#c0392b");
      // Pirinç/Altın rengi köşe çıtaları
      box(vg, [1.44, 0.06, 0.99], [0, 0.93, 0], "#f1c40f");
      box(vg, [1.44, 0.06, 0.99], [0, 0.18, 0], "#f1c40f");

      // Pirinç kollu itme barı (Arka taraf Z: -0.55)
      cylinder(vg, 0.025, 0.025, 0.9, [0, 0.85, -0.65], "#d4af37", 8);
      cylinder(vg, 0.025, 0.025, 0.35, [-0.4, 0.75, -0.55], "#d4af37", 8);
      cylinder(vg, 0.025, 0.025, 0.35, [0.4, 0.75, -0.55], "#d4af37", 8);

      // İki büyük ispitli nostaljik araba tekerleği (X: -0.65 ve +0.65, Z: -0.15)
      for (const wx of [-0.68, 0.68]) {
        // Lastik çember
        const wheelGeo = new THREE.TorusGeometry(0.38, 0.045, 8, 24);
        const wheelMat = new THREE.MeshBasicMaterial({ color: "#2c3e50" });
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.rotation.y = Math.PI / 2;
        wheel.position.set(wx, 0.38, -0.15);
        vg.add(wheel);

        // Pirinç jant göbeği & ispitler
        cylinder(vg, 0.08, 0.08, 0.12, [wx, 0.38, -0.15], "#f1c40f", 8);
      }
      // Ön denge ayakları
      cylinder(vg, 0.03, 0.03, 0.38, [-0.55, 0.19, 0.38], "#34495e", 8);
      cylinder(vg, 0.03, 0.03, 0.38, [0.55, 0.19, 0.38], "#34495e", 8);

      // Şeffaf cam vitrin (Simitlerin sergilendiği üst kısım)
      box(vg, [1.3, 0.55, 0.85], [0, 1.25, 0], "#dff9fb", 0.45); // Cam kabin

      // Vitrin içi çıtır susamlı simitler (Küçük Torus halkaları)
      const simitGeo = new THREE.TorusGeometry(0.09, 0.032, 6, 14);
      const simitMat = new THREE.MeshBasicMaterial({ color: "#d35400" }); // Altın sarısı çıtır simit rengi
      for (let row = -0.4; row <= 0.4; row += 0.22) {
        for (let col = -0.22; col <= 0.22; col += 0.22) {
          const simitMesh = new THREE.Mesh(simitGeo, simitMat);
          simitMesh.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.2;
          simitMesh.position.set(row, 1.05 + Math.random() * 0.04, col);
          vg.add(simitMesh);
        }
      }

      // Üst vitrin kapağında sergilenen hasır simit tepsisi
      cylinder(vg, 0.32, 0.32, 0.04, [0, 1.55, 0.1], "#c19a6b", 16);
      const topSimit = new THREE.Mesh(simitGeo, simitMat);
      topSimit.rotation.x = Math.PI / 2;
      topSimit.position.set(0, 1.6, 0.1);
      vg.add(topSimit);

      // Kırmızı-Beyaz çizgili nostaljik güneş şemsiyesi
      cylinder(vg, 0.03, 0.03, 1.6, [0, 1.8, -0.2], "#f5f6fa", 8); // Şemsiye direği
      const umbrellaGeo = new THREE.ConeGeometry(1.2, 0.45, 12);
      const umbrellaMat = new THREE.MeshBasicMaterial({ color: "#e74c3c" });
      const umbrella = new THREE.Mesh(umbrellaGeo, umbrellaMat);
      umbrella.position.set(0, 2.7, -0.2);
      vg.add(umbrella);

      // Şemsiye altı beyaz fırfırlı saçaklar
      cylinder(vg, 1.22, 1.22, 0.06, [0, 2.48, -0.2], "#ffffff", 12);
    } else {
      // -----------------------------------------------------------------------
      // KESTANECİ & MISIR ARABASI: Bordo Sac Kasa, Köz Mangalı & Buhar Bacası
      // -----------------------------------------------------------------------
      box(vg, [1.4, 0.8, 0.95], [0, 0.55, 0], "#962d2d"); // Bordo kestaneci kasası
      box(vg, [1.44, 0.05, 0.99], [0, 0.96, 0], "#f39c12"); // Pirinç üst tabla çıtası

      // İki tekerlek
      for (const wx of [-0.68, 0.68]) {
        const wheelGeo = new THREE.TorusGeometry(0.38, 0.045, 8, 24);
        const wheelMat = new THREE.MeshBasicMaterial({ color: "#1e272e" });
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.rotation.y = Math.PI / 2;
        wheel.position.set(wx, 0.38, -0.15);
        vg.add(wheel);
      }
      cylinder(vg, 0.03, 0.03, 0.38, [-0.55, 0.19, 0.38], "#34495e", 8);
      cylinder(vg, 0.03, 0.03, 0.38, [0.55, 0.19, 0.38], "#34495e", 8);

      // 1. Bölüm: Sıcak Kömür Közü & Çizik Kestaneler (X: -0.35)
      box(vg, [0.55, 0.1, 0.7], [-0.35, 1.02, 0], "#2d3436"); // Mangal tepsisi
      box(vg, [0.5, 0.04, 0.65], [-0.35, 1.07, 0], "#e17055"); // Akkor kömür közü
      // Çizik kestaneler (Küçük koyu kahve küpler)
      for (let k = 0; k < 6; k++) {
        box(
          vg,
          [0.08, 0.06, 0.08],
          [-0.45 + (k % 3) * 0.12, 1.11, -0.15 + Math.floor(k / 3) * 0.25],
          "#4a2810",
        );
      }

      // 2. Bölüm: Taze Süt Mısır Kazan & Sarı Koçanlar (X: 0.35)
      cylinder(vg, 0.28, 0.28, 0.25, [0.35, 1.12, 0], "#b2bec3", 16); // Parlak kazan
      cylinder(vg, 0.22, 0.22, 0.06, [0.35, 1.25, 0], "#f1c40f", 12); // Taze haşlanmış sarı mısır

      // Minik köz buharı bacası
      cylinder(vg, 0.04, 0.04, 0.5, [-0.55, 1.25, -0.3], "#636e72", 8);

      // Buhar animasyonu grubu
      steamGroup = new THREE.Group();
      steamGroup.position.set(-0.55, 1.5, -0.3);
      vg.add(steamGroup);
      for (let s = 0; s < 3; s++) {
        const puff = new THREE.Mesh(
          new THREE.SphereGeometry(0.06 + s * 0.02, 6, 6),
          new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.4 }),
        );
        puff.position.set((Math.random() - 0.5) * 0.05, s * 0.12, (Math.random() - 0.5) * 0.05);
        steamGroup.add(puff);
      }

      // Sarı-Kırmızı çizgili şemsiye
      cylinder(vg, 0.03, 0.03, 1.6, [0, 1.8, -0.2], "#f5f6fa", 8);
      const umbrellaGeo = new THREE.ConeGeometry(1.2, 0.45, 12);
      const umbrellaMat = new THREE.MeshBasicMaterial({ color: "#f39c12" });
      const umbrella = new THREE.Mesh(umbrellaGeo, umbrellaMat);
      umbrella.position.set(0, 2.7, -0.2);
      vg.add(umbrella);
    }

    // =========================================================================
    // 2. SEYYAR SATICI ESNAF NPC'Sİ (Tezgahın Arkasında Z: -0.95)
    // =========================================================================
    const npcGroup = new THREE.Group();
    npcGroup.position.set(0, 0, -0.95);
    vg.add(npcGroup);

    // Ayaklar / Pantolon
    box(npcGroup, [0.18, 0.7, 0.18], [-0.14, 0.35, 0], "#2c3e50");
    box(npcGroup, [0.18, 0.7, 0.18], [0.14, 0.35, 0], "#2c3e50");

    // Gövde (Mavi/Kırmızı gömlek + Beyaz Esnaf Önlüğü)
    box(npcGroup, [0.55, 0.7, 0.32], [0, 1.05, 0], v.id === "simit_carsi" ? "#3498db" : "#e74c3c");
    box(npcGroup, [0.46, 0.65, 0.08], [0, 1.02, 0.15], "#ffffff"); // Beyaz önlük

    // Kafa & Esnaf Şapkası
    box(npcGroup, [0.32, 0.32, 0.32], [0, 1.55, 0], "#f5cd79"); // Yüz
    // Bıyık
    box(npcGroup, [0.16, 0.05, 0.05], [0, 1.48, 0.17], "#2d3436");
    // Kasket / Şapka
    box(npcGroup, [0.36, 0.1, 0.36], [0, 1.73, 0], "#2c3e50");
    box(npcGroup, [0.34, 0.03, 0.14], [0, 1.71, 0.22], "#2c3e50"); // Kasket siperliği

    // Sabit sol kol
    box(npcGroup, [0.12, 0.55, 0.12], [-0.34, 1.0, 0], "#3498db");

    // Animasyonlu Sağ Kol Mafsalı (Pivot) - Oyuncuya el sallar
    const armPivot = new THREE.Group();
    armPivot.position.set(0.34, 1.25, 0);
    npcGroup.add(armPivot);
    box(armPivot, [0.12, 0.55, 0.12], [0, -0.22, 0], "#3498db");
    // Sağ el
    box(armPivot, [0.1, 0.1, 0.1], [0, -0.52, 0], "#f5cd79");

    // =========================================================================
    // 3. 3B KONUŞMA BALONU (Speech Bubble Sprite)
    // =========================================================================
    const initialText = v.calloutLines[0];
    const bubble = label(initialText, "#ffffff", v.id === "simit_carsi" ? "#c0392b" : "#b33939");
    bubble.position.set(0, 2.2, -0.8);
    bubble.scale.set(3.2, 0.95, 1);
    vg.add(bubble);

    instances.push({
      def: v,
      group: vg,
      armPivot,
      bubble,
      steamGroup,
      waveTimer: 0,
    });
  });

  return {
    group,
    update(dt: number, state: StreetVendorState, playerPos: Vec2) {
      instances.forEach((inst) => {
        const dist = Math.hypot(
          playerPos.x - inst.def.position.x,
          playerPos.z - inst.def.position.z,
        );
        const isNear = dist <= inst.def.radius + 3.5;

        // 1. El sallama animasyonu
        if (isNear || inst.waveTimer > 0) {
          inst.waveTimer = Math.max(0, inst.waveTimer - dt);
          // Sağ kolu yukarı kaldırıp salla
          inst.armPivot.rotation.z = -Math.PI * 0.75 + Math.sin(Date.now() * 0.008) * 0.35;
          inst.armPivot.rotation.x = Math.sin(Date.now() * 0.006) * 0.2;
        } else {
          // Dinlenme pozu (kol aşağıda)
          inst.armPivot.rotation.z = THREE.MathUtils.lerp(inst.armPivot.rotation.z, 0, 0.1);
          inst.armPivot.rotation.x = THREE.MathUtils.lerp(inst.armPivot.rotation.x, 0, 0.1);
        }

        // 2. Buhar animasyonu (Kestaneci)
        if (inst.steamGroup) {
          inst.steamGroup.children.forEach((puff, idx) => {
            puff.position.y += dt * 0.35;
            puff.scale.addScalar(dt * 0.15);
            if (puff.position.y > 0.45) {
              puff.position.y = 0;
              puff.scale.setScalar(0.7 + idx * 0.2);
            }
          });
        }

        // 3. Konuşma balonu yönü ve metin animasyonu
        const dx = playerPos.x - inst.def.position.x;
        const dz = playerPos.z - inst.def.position.z;
        const angle = Math.atan2(dx, dz);
        inst.bubble.rotation.y = THREE.MathUtils.lerp(inst.bubble.rotation.y, angle, 0.08);

        // Yakındayken daha belirgin büyüme
        const targetScale = isNear ? 1.05 : 0.85;
        inst.bubble.scale.lerp(new THREE.Vector3(3.2 * targetScale, 0.95 * targetScale, 1), 0.1);
      });
    },
    onPlayerHonk() {
      // Korna çalındığında tüm satıcılar coşkuyla el sallar
      instances.forEach((inst) => {
        inst.waveTimer = 3.5;
      });
    },
    dispose() {
      // Temizleme
    },
  };
}
