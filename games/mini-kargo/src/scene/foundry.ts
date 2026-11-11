import * as THREE from "three";
import type { Rect, Vec2 } from "../game/types";
import { box, cylinder, label, mat } from "./world-kit";
import {
  type FoundryState,
  FOUNDRY_CENTER,
  FOUNDRY_BAY,
  HAMDI_USTA_POS,
  HAMDI_USTA_CALLOUTS,
} from "../game/foundry";

export type FoundryView = {
  group: THREE.Group;
  obstacles: Rect[];
  update(
    dt: number,
    stateOrNight?: FoundryState | boolean,
    playerPos?: Vec2,
    isNightOrDusk?: boolean,
  ): void;
  onPlayerHonk(playerPos: Vec2): boolean;
  dispose(): void;
};

/**
 * Sanayi "Demirciler ve Dökümcüler Sanayi Sitesi & Sıcak Dövme Haddehanesi" (T59)
 * - Otantik Ağır Çelik Konstrüksiyon Haddehane ve Dökümhane Tesisi:
 *   - Ağır çelik I-kolonlar, çatı makasları, oluklu galvaniz sanayi sacı çatısı ve duman menfezi
 *   - Cüruflu endüstriyel beton avlu tablası (12.0m x 9.2m) ve servis yanaşma peronu (FOUNDRY_BAY: X: 37.5, Z: -68.0)
 *   - Sarı-siyah bordür emniyet çizgileri, beyaz peron sınırları ve yön oku
 *   - Işıklı büyük kurumsal çatı tabelası ("⚒️ DEMİRCİLER VE DÖKÜMCÜLER SİTESİ · HAMDİ USTA 🔥")
 *   - Kızgın kok kömürü eritme ocağı / indüksiyon potası ve termal akkor turuncu PointLight
 *   - Pnömatik havalı şahmerdan (power hammer) ritmik dikey vuruş animasyonu ve kıvılcım partikülleri
 *   - Dökme demir pik külçeleri, inşaat demiri / profil rafı, demirci örsü, su teknesi ve MK ağır sanayi sandığı
 * - Animasyonlu Usta Demirci NPC — "Demirci Hamdi Usta" (X: 36.0, Z: -72.5):
 *   - Deri demirci önlüğü, dökümcü koruyucu gözlüğü, dövme maşası ve kızıl kor kütük
 *   - 22m mesafeden oyuncu aracına baş/gövde takibi (head tracking)
 *   - Korna ve yanaşmada çekicini kaldırarak usta selamı ve 3D konuşma balonu
 */
export function createFoundryView(): FoundryView {
  const group = new THREE.Group();
  group.name = "foundry-view";
  const obstacles: Rect[] = [];

  const cx = FOUNDRY_CENTER.x; // 37.5
  const cz = FOUNDRY_CENTER.z; // -75.0

  // =========================================================================
  // 1. ZEMİN TABLASI, YANAŞMA PERONU VE BORDÜRLER
  // =========================================================================
  const yardGroup = new THREE.Group();
  yardGroup.position.set(cx, 0, cz);
  group.add(yardGroup);

  // Atölye zemin cüruflu beton tablası (12.0m x 9.2m)
  box(yardGroup, [12.0, 0.12, 9.2], [0, 0.04, 0], "#4a4e52");
  box(yardGroup, [11.6, 0.05, 8.8], [0, 0.10, 0], "#3c4043");

  // Çevre endüstriyel bordür taşları
  box(yardGroup, [12.2, 0.18, 0.22], [0, 0.09, -4.6], "#2d3135");
  box(yardGroup, [12.2, 0.18, 0.22], [0, 0.09, 4.6], "#2d3135");
  box(yardGroup, [0.22, 0.18, 9.4], [-6.05, 0.09, 0], "#2d3135");
  box(yardGroup, [0.22, 0.18, 9.4], [6.05, 0.09, 0], "#2d3135");

  // Servis Yanaşma Peronu (FOUNDRY_BAY: X: 37.5, Z: -68.0) - Z: -66 sokağının kuzey bordüründe
  box(group, [5.2, 0.02, 3.2], [cx, 0.025, cz + 7.0], "#26292d"); // Asfalt yanaşma cebi
  box(group, [0.15, 0.025, 3.2], [cx - 2.5, 0.03, cz + 7.0], "#fff4d4"); // Sol sınır çizgisi
  box(group, [0.15, 0.025, 3.2], [cx + 2.5, 0.03, cz + 7.0], "#fff4d4"); // Sağ sınır çizgisi
  box(group, [5.2, 0.025, 0.15], [cx, 0.03, cz + 5.4], "#fff4d4"); // Durak çizgisi

  // Sarı-Siyah Emniyet Bordürü (Peron önü kaldırım sınırı)
  for (let bx = -2.4; bx <= 2.4; bx += 0.8) {
    const isYellow = Math.round((bx + 2.4) / 0.8) % 2 === 0;
    box(group, [0.76, 0.16, 0.22], [cx + bx, 0.08, cz + 5.3], isYellow ? "#f1c40f" : "#212529");
  }

  // Zemin Beyaz Kılavuz Yön Oku (Oyuncu aracına yanaşma yönünü gösterir)
  const arrowStem = box(group, [0.35, 0.02, 1.2], [cx, 0.035, cz + 6.9], "#ffffff");
  arrowStem.rotation.x = -Math.PI / 2;
  const arrowHead = new THREE.Mesh(
    new THREE.ConeGeometry(0.5, 0.8, 3),
    mat("#ffffff"),
  );
  arrowHead.rotation.x = -Math.PI / 2;
  arrowHead.position.set(cx, 0.035, cz + 7.7);
  group.add(arrowHead);

  // =========================================================================
  // 2. AĞIR ÇELİK KONSTRÜKSİYON HADDEHANE & DÖKÜMHANE SUNDURMASI
  // =========================================================================
  const shedGroup = new THREE.Group();
  shedGroup.position.set(cx, 0, cz);
  group.add(shedGroup);

  // 4 Adet Ağır Çelik I-Kolon Sütun (Corten / antrasit çelik)
  const columnPositions = [
    [-4.8, -3.6],
    [4.8, -3.6],
    [-4.8, 3.6],
    [4.8, 3.6],
  ];

  columnPositions.forEach(([colX, colZ]) => {
    // Çelik I-kolon gövdesi
    box(shedGroup, [0.42, 5.2, 0.42], [colX, 2.6, colZ], "#2c3e50");
    // Taban çelik ankraj flanşı
    box(shedGroup, [0.65, 0.22, 0.65], [colX, 0.11, colZ], "#1e272e");
    // Kolon başlığı destek takozu
    box(shedGroup, [0.65, 0.24, 0.65], [colX, 5.1, colZ], "#1e272e");
  });

  // Yatay Çelik Taşıyıcı Kafes Kirişler (Steel Trusses)
  box(shedGroup, [10.2, 0.45, 0.35], [0, 5.2, -3.6], "#34495e");
  box(shedGroup, [10.2, 0.45, 0.35], [0, 5.2, 3.6], "#34495e");
  box(shedGroup, [0.35, 0.45, 7.6], [-4.8, 5.2, 0], "#34495e");
  box(shedGroup, [0.35, 0.45, 7.6], [4.8, 5.2, 0], "#34495e");

  // Çapraz Çelik Rüzgar Gergileri
  const diagX = box(shedGroup, [0.15, 0.15, 7.8], [-4.7, 4.4, 0], "#475569");
  diagX.rotation.x = 0.45;
  const diagX2 = box(shedGroup, [0.15, 0.15, 7.8], [4.7, 4.4, 0], "#475569");
  diagX2.rotation.x = -0.45;

  // Oluklu Paslı Galvaniz Sanayi Sacı Çatısı
  const roof = box(shedGroup, [10.8, 0.22, 8.4], [0, 5.5, 0], "#46515a");
  roof.rotation.x = -0.04;

  // Çatı Duman Tahliye Fenerliği / Lüveri (Roof Ridge Smoke Monitor)
  box(shedGroup, [6.4, 0.65, 2.4], [0, 5.9, 0], "#374151");
  box(shedGroup, [6.8, 0.12, 2.8], [0, 6.25, 0], "#2c3e50");

  // Havalandırma Egzoz Bacası & Duman Külahı
  cylinder(shedGroup, 0.35, 0.45, 2.6, [3.8, 6.6, -2.4], "#2d3436", 8);
  cylinder(shedGroup, 0.65, 0.15, 0.35, [3.8, 7.9, -2.4], "#1e272e", 8);

  // Arka ve Yan Rüzgar Koruma Sac Perdeleri (Sıcak havayı içeride tutar)
  box(shedGroup, [9.8, 2.8, 0.18], [0, 3.5, -3.7], "#3b434c");
  box(shedGroup, [0.18, 2.8, 4.4], [-4.85, 3.5, -1.4], "#3b434c");

  // =========================================================================
  // 3. IŞIKLI BÜYÜK KURUMSAL ÇATI TABELASI & GECE AYDINLATMASI
  // =========================================================================
  const marqueeGroup = new THREE.Group();
  marqueeGroup.position.set(0, 5.85, 4.1);
  marqueeGroup.rotation.x = 0.20; // 12 derece öne eğik
  shedGroup.add(marqueeGroup);

  // Tabela arkalığı ve altın sanayi uyarı pervazı
  box(marqueeGroup, [9.2, 1.45, 0.18], [0, 0, 0], "#1a1e24");
  box(marqueeGroup, [9.4, 0.12, 0.24], [0, 0.72, 0], "#e67e22");
  box(marqueeGroup, [9.4, 0.12, 0.24], [0, -0.72, 0], "#e67e22");
  box(marqueeGroup, [0.12, 1.45, 0.24], [-4.65, 0, 0], "#e67e22");
  box(marqueeGroup, [0.12, 1.45, 0.24], [4.65, 0, 0], "#e67e22");

  // Ana Yazı Levhası
  const mainTitle = label("⚒️ DEMİRCİLER VE DÖKÜMCÜLER SİTESİ · HAMDİ USTA 🔥", "#ffffff", "#c0392b");
  mainTitle.scale.set(7.8, 0.85, 1);
  mainTitle.position.set(0, 0.22, 0.12);
  marqueeGroup.add(mainTitle);

  // Alt Kurumsal Şerit
  const subtitle = label("SICAK DÖVME ÇELİK · İNDÜKSİYON OCAĞI & HADDEHANE · 1958", "#f39c12", "#1a1e24");
  subtitle.scale.set(7.4, 0.42, 1);
  subtitle.position.set(0, -0.38, 0.12);
  marqueeGroup.add(subtitle);

  // Gece ve Gündüz Çalışan Termal PointLight Armatürü
  const facadeLight = new THREE.PointLight("#ff6b1a", 1.8, 26, 1.6);
  facadeLight.position.set(cx, 4.8, cz + 3.2);
  group.add(facadeLight);

  // =========================================================================
  // 4. KIZGIN KOK KÖMÜRÜ / İNDÜKSİYON ERİTME OCAĞI (Smelting Furnace)
  // =========================================================================
  const furnaceGroup = new THREE.Group();
  furnaceGroup.position.set(cx + 3.4, 0, cz - 1.8);
  group.add(furnaceGroup);

  // Refrakter tuğla silindirik fırın kaidesi
  cylinder(furnaceGroup, 1.4, 1.5, 2.2, [0, 1.1, 0], "#7f1d1d", 12);
  // Çelik döküm bağlama çemberleri
  cylinder(furnaceGroup, 1.45, 1.45, 0.12, [0, 0.6, 0], "#1e293b", 12);
  cylinder(furnaceGroup, 1.45, 1.45, 0.12, [0, 1.4, 0], "#1e293b", 12);
  cylinder(furnaceGroup, 1.42, 1.42, 0.12, [0, 2.1, 0], "#1e293b", 12);

  // Konik Çelik Duman Davlumbazı Külahı
  const hood = new THREE.Mesh(
    new THREE.ConeGeometry(1.5, 1.4, 12),
    mat("#1e272e"),
  );
  hood.position.set(0, 2.8, 0);
  furnaceGroup.add(hood);

  // Ocağın İçinde Korlaşmış Akkor Erimiş Lav / Demir Yatağı
  const lavaBed = cylinder(furnaceGroup, 1.1, 1.1, 0.15, [0, 1.95, 0], "#ff4500", 12);
  (lavaBed.material as THREE.MeshStandardMaterial).emissive = new THREE.Color("#ff5722");
  (lavaBed.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.4;

  // Ocak Isı Titreşim Işığı (PointLight)
  const furnaceGlow = new THREE.PointLight("#ff5722", 2.2, 12, 1.8);
  furnaceGlow.position.set(0, 2.4, 0);
  furnaceGroup.add(furnaceGlow);

  // =========================================================================
  // 5. PNÖMATİK HAVALI ŞAHMERDAN (Drop Forge / Power Hammer)
  // =========================================================================
  const hammerGroup = new THREE.Group();
  hammerGroup.position.set(cx - 2.8, 0, cz - 1.5);
  group.add(hammerGroup);

  // Ağır Döküm Çelik C-Gövde Kaidesi
  box(hammerGroup, [1.6, 0.5, 1.8], [0, 0.25, 0], "#1e293b"); // Zemin kaidesi
  box(hammerGroup, [0.75, 3.4, 0.85], [0, 1.95, -0.45], "#1e293b"); // Dikey C-kolonu
  box(hammerGroup, [0.75, 0.65, 1.4], [0, 3.3, 0.1], "#1e293b"); // Üst konsol kolu

  // Üst Pnömatik Hava Silindiri & Boruları
  cylinder(hammerGroup, 0.32, 0.32, 1.2, [0, 3.6, 0.45], "#475569", 10);
  box(hammerGroup, [0.12, 2.6, 0.12], [0.38, 2.4, -0.1], "#94a3b8"); // Hava besleme borusu

  // Dövme Örs Bloğu (Anvil Base)
  box(hammerGroup, [0.85, 0.85, 0.85], [0, 0.65, 0.45], "#334155");
  box(hammerGroup, [0.75, 0.18, 0.75], [0, 1.15, 0.45], "#475569"); // Örs aşınma plakası

  // Örs üzerinde dövülen kızgın çelik kütük
  const hotBillet = box(hammerGroup, [0.45, 0.15, 0.45], [0, 1.28, 0.45], "#ff4500");
  (hotBillet.material as THREE.MeshStandardMaterial).emissive = new THREE.Color("#ff7700");
  (hotBillet.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.2;

  // Hareketli Pnömatik Şahmerdan Tokmağı (Hammer Ram / Tup)
  const hammerRamGroup = new THREE.Group();
  hammerRamGroup.position.set(0, 2.1, 0.45);
  hammerGroup.add(hammerRamGroup);

  cylinder(hammerRamGroup, 0.12, 0.12, 1.1, [0, 0.55, 0], "#cbd5e1", 8); // Krom piston mili
  box(hammerRamGroup, [0.65, 0.55, 0.65], [0, 0, 0], "#0f172a"); // Çelik tokmak başı

  // Kıvılcım Partikülleri (Sparks on impact)
  const sparkMeshes: THREE.Mesh[] = [];
  const sparkCount = 6;
  const sparkGeom = new THREE.SphereGeometry(0.045, 4, 4);
  const sparkMat = mat("#ffd700", 0.1);
  (sparkMat as THREE.MeshStandardMaterial).emissive = new THREE.Color("#ff9900");
  (sparkMat as THREE.MeshStandardMaterial).emissiveIntensity = 2.0;

  for (let i = 0; i < sparkCount; i++) {
    const spark = new THREE.Mesh(sparkGeom, sparkMat);
    spark.position.set(0, 1.35, 0.45);
    spark.visible = false;
    hammerGroup.add(spark);
    sparkMeshes.push(spark);
  }

  // =========================================================================
  // 6. DONATILAR: MALZEME VE DÖVME ÇELİK İSTİFLERİ
  // =========================================================================
  // 6.1 Ham Dökme Demir Pik Kütük Yığınları (Raw Cast Iron Ingots on Pallet)
  const ingotGroup = new THREE.Group();
  ingotGroup.position.set(cx + 4.2, 0, cz + 1.8);
  group.add(ingotGroup);

  // Ahşap EUR Palet
  box(ingotGroup, [1.6, 0.14, 1.4], [0, 0.07, 0], "#a1887f");
  box(ingotGroup, [1.5, 0.06, 0.2], [0, 0.03, -0.5], "#6d4c41");
  box(ingotGroup, [1.5, 0.06, 0.2], [0, 0.03, 0], "#6d4c41");
  box(ingotGroup, [1.5, 0.06, 0.2], [0, 0.03, 0.5], "#6d4c41");

  // Dökme Demir Pik Külçeleri (Piramit İstif)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      box(ingotGroup, [0.38, 0.15, 0.32], [-0.42 + col * 0.42, 0.22, -0.35 + row * 0.35], "#374151");
    }
  }
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 2; col++) {
      box(ingotGroup, [0.38, 0.15, 0.32], [-0.21 + col * 0.42, 0.37, -0.18 + row * 0.35], "#475569");
    }
  }

  // 6.2 İnşaat Demiri ve Profil Rafı (A-Frame Storage Rack)
  const rackGroup = new THREE.Group();
  rackGroup.position.set(cx - 4.4, 0, cz + 1.6);
  group.add(rackGroup);

  // Çelik Konsol A-Ayakları
  box(rackGroup, [0.12, 2.2, 0.12], [-0.8, 1.1, -0.6], "#e67e22");
  box(rackGroup, [0.12, 2.2, 0.12], [-0.8, 1.1, 0.6], "#e67e22");
  box(rackGroup, [0.12, 2.2, 0.12], [0.8, 1.1, -0.6], "#e67e22");
  box(rackGroup, [0.12, 2.2, 0.12], [0.8, 1.1, 0.6], "#e67e22");
  box(rackGroup, [1.8, 0.12, 0.12], [0, 2.1, -0.6], "#e67e22");
  box(rackGroup, [1.8, 0.12, 0.12], [0, 2.1, 0.6], "#e67e22");

  // Raflardaki I-Profil ve Yuvarlak İnşaat Demiri Demetleri
  cylinder(rackGroup, 0.08, 0.08, 2.2, [-0.2, 0.8, 0], "#64748b", 8);
  cylinder(rackGroup, 0.08, 0.08, 2.2, [0.2, 0.8, 0], "#64748b", 8);
  cylinder(rackGroup, 0.08, 0.08, 2.2, [0, 1.5, 0], "#64748b", 8);
  box(rackGroup, [0.35, 0.35, 2.2], [-0.4, 0.4, 0], "#334155"); // Ağır kare profil

  // 6.3 Demirci Örsü & Su Soğutma Teknesi (Blacksmith Anvil & Quench Trough)
  const anvilGroup = new THREE.Group();
  anvilGroup.position.set(cx + 0.8, 0, cz - 1.2);
  group.add(anvilGroup);

  // Meşe Kütük Kaide
  cylinder(anvilGroup, 0.45, 0.5, 0.75, [0, 0.38, 0], "#5c3d2e", 8);
  // Çift Boynuzlu Dövme Çelik Örs
  box(anvilGroup, [0.75, 0.35, 0.32], [0, 0.9, 0], "#1e293b");
  cylinder(anvilGroup, 0.02, 0.14, 0.35, [-0.48, 0.9, 0], "#1e293b", 6); // Sivri boynuz
  box(anvilGroup, [0.25, 0.28, 0.28], [0.42, 0.88, 0], "#1e293b"); // Kare boynuz

  // Ahşap Su Soğutma Teknesi
  box(anvilGroup, [0.85, 0.55, 0.55], [0, 0.28, 0.75], "#4a3525");
  box(anvilGroup, [0.75, 0.05, 0.45], [0, 0.48, 0.75], "#2980b9"); // Soğutma suyu

  // 6.4 Mini Kargo Ağır Sanayi Sevkiyat Kasası
  const mkCrate = box(shedGroup, [1.2, 0.95, 1.0], [0.8, 0.48, 2.4], "#2c3e50");
  const crateLabel = label("MK AĞIR ÇELİK", "#ffffff", "#e67e22");
  crateLabel.scale.set(1.1, 0.3, 1);
  crateLabel.position.set(0, 0, 0.52);
  mkCrate.add(crateLabel);

  // =========================================================================
  // 7. ANİMASYONLU USTA DEMİRCİ NPC — "Demirci Hamdi Usta" (X: 36.0, Z: -72.5)
  // =========================================================================
  const characterGroup = new THREE.Group();
  characterGroup.position.set(HAMDI_USTA_POS.x, 0, HAMDI_USTA_POS.z);
  group.add(characterGroup);

  // Ayaklar & Çelik Burunlu Botlar
  box(characterGroup, [0.24, 0.24, 0.42], [-0.22, 0.12, 0.06], "#0f172a");
  box(characterGroup, [0.24, 0.24, 0.42], [0.22, 0.12, 0.06], "#0f172a");

  // Bacaklar (Ağır gri sanayi pantolonu)
  box(characterGroup, [0.20, 0.75, 0.22], [-0.22, 0.52, 0], "#1e293b");
  box(characterGroup, [0.20, 0.75, 0.22], [0.22, 0.52, 0], "#1e293b");

  // Gövde (Gri atlet/gömlek + Kalın deri demirci önlüğü)
  const torso = box(characterGroup, [0.65, 0.85, 0.38], [0, 1.25, 0], "#475569");
  box(torso, [0.55, 0.88, 0.12], [0, 0, 0.15], "#8b4513"); // Kahverengi deri önlük
  box(torso, [0.62, 0.12, 0.40], [0, -0.32, 0], "#5c3d2e"); // Deri kemer
  box(torso, [0.18, 0.14, 0.42], [0, -0.32, 0.04], "#d4ac0d"); // Pirinç toka

  // Kafa & Boyun
  cylinder(characterGroup, 0.14, 0.14, 0.22, [0, 1.76, 0], "#f5cba7", 8); // Boyun
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.98, 0);
  characterGroup.add(headGroup);

  // Baş kütlesi
  box(headGroup, [0.38, 0.42, 0.36], [0, 0, 0], "#f5cba7");
  box(headGroup, [0.42, 0.18, 0.40], [0, 0.22, -0.02], "#334155"); // Kır saçlar

  // Heybetli Pos Bıyık
  box(headGroup, [0.34, 0.12, 0.14], [0, -0.08, 0.22], "#2c3e50");

  // Alnında Dökümcü Koruyucu Gözlüğü (Safety Goggles)
  box(headGroup, [0.36, 0.12, 0.14], [0, 0.14, 0.20], "#0f172a"); // Gözlük çerçevesi
  cylinder(headGroup, 0.07, 0.07, 0.08, [-0.09, 0.14, 0.25], "#00d2d3", 8); // Sol lens
  cylinder(headGroup, 0.07, 0.07, 0.08, [0.09, 0.14, 0.25], "#00d2d3", 8); // Sağ lens

  // Sol Kol & Dövme Maşası (Örse uzanan çelik maşa ve kızgın kütük)
  const leftArmPivot = new THREE.Group();
  leftArmPivot.position.set(-0.42, 1.58, 0);
  characterGroup.add(leftArmPivot);
  box(leftArmPivot, [0.16, 0.42, 0.18], [0, -0.22, 0], "#475569");
  box(leftArmPivot, [0.15, 0.38, 0.16], [0, -0.55, 0.12], "#f5cba7");

  // 1.2m Çelik Dövme Maşası (Forging Tongs)
  const tongs = cylinder(leftArmPivot, 0.03, 0.03, 1.2, [0.15, -0.65, 0.65], "#1e293b", 6);
  tongs.rotation.x = Math.PI / 3;
  // Maşanın ucundaki akkor kızıl çelik kütük
  const tongsBillet = box(leftArmPivot, [0.15, 0.12, 0.22], [0.15, -0.92, 1.15], "#ff4500");
  (tongsBillet.material as THREE.MeshStandardMaterial).emissive = new THREE.Color("#ff6600");
  (tongsBillet.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.4;

  // Sağ Kol & Ağır Dövme Çekici (Salute / Forging Hammer)
  const rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(0.42, 1.58, 0);
  characterGroup.add(rightArmPivot);
  box(rightArmPivot, [0.16, 0.42, 0.18], [0, -0.22, 0], "#475569");
  box(rightArmPivot, [0.15, 0.38, 0.16], [0, -0.55, 0.08], "#f5cba7");

  // Dövme Çekici (Hickory sap + Ağır çelik kafa)
  const hammerHandle = cylinder(rightArmPivot, 0.03, 0.03, 0.85, [0, -0.72, 0.22], "#b9770e", 6);
  hammerHandle.rotation.x = Math.PI / 4;
  const hammerHeadMesh = box(rightArmPivot, [0.28, 0.18, 0.16], [0, -0.98, 0.48], "#2c3e50");
  hammerHeadMesh.rotation.x = Math.PI / 4;

  // 3D Konuşma Balonu (Speech Bubble)
  const bubbleGroup = new THREE.Group();
  bubbleGroup.position.set(0, 2.85, 0.2);
  bubbleGroup.visible = false;
  characterGroup.add(bubbleGroup);

  let currentBubbleText = "";
  let bubbleLabel: THREE.Sprite | null = null;

  function updateBubble(text: string) {
    if (text === currentBubbleText && bubbleLabel) return;
    if (bubbleLabel) {
      bubbleGroup.remove(bubbleLabel);
      bubbleLabel.material.dispose();
      bubbleLabel = null;
    }
    currentBubbleText = text;
    bubbleLabel = label(text, "#ffffff", "#1e293b");
    bubbleLabel.scale.set(5.6, 1.15, 1);
    bubbleGroup.add(bubbleLabel);
  }

  // =========================================================================
  // 8. ÇARPIŞMA ENGELLERİ (Obstacles)
  // =========================================================================
  // Ana Tesis & Sundurma Gövdesi (Binayı ve arkasını korur)
  // Peron cz + 7.0 = -68.0'da; engeller cz + 3.8 = -71.2 seviyesinde biter.
  obstacles.push({
    minX: cx - 5.5,
    maxX: cx + 5.5,
    minZ: cz - 4.4,
    maxZ: cz + 3.8,
  });

  // Eritme Ocağı Kaidesi
  obstacles.push({
    minX: cx + 2.0,
    maxX: cx + 4.8,
    minZ: cz - 3.2,
    maxZ: cz - 0.4,
  });

  // Pnömatik Şahmerdan Kaidesi
  obstacles.push({
    minX: cx - 4.2,
    maxX: cx - 1.4,
    minZ: cz - 3.0,
    maxZ: cz + 0.2,
  });

  // Ham Dökme Demir Palet İstifi
  obstacles.push({
    minX: cx + 3.2,
    maxX: cx + 5.2,
    minZ: cz + 0.8,
    maxZ: cz + 2.8,
  });

  // İnşaat Demiri Rafı
  obstacles.push({
    minX: cx - 5.4,
    maxX: cx - 3.4,
    minZ: cz + 0.6,
    maxZ: cz + 2.6,
  });

  // =========================================================================
  // 9. GÜNCELLEME VE ETKİLEŞİM DÖNGÜSÜ (Animation & Update Loop)
  // =========================================================================
  let hammerTime = 0;
  let honkAnimationTimer = 0;

  return {
    group,
    obstacles,
    onPlayerHonk(playerPos: Vec2): boolean {
      const dist = Math.hypot(playerPos.x - HAMDI_USTA_POS.x, playerPos.z - HAMDI_USTA_POS.z);
      if (dist <= 24.0) {
        honkAnimationTimer = 4.5;
        const idx = Math.floor(Math.random() * HAMDI_USTA_CALLOUTS.length);
        updateBubble(HAMDI_USTA_CALLOUTS[idx]);
        bubbleGroup.visible = true;
        return true;
      }
      return false;
    },
    update(
      dt: number,
      stateOrNight?: FoundryState | boolean,
      playerPos?: Vec2,
      isNightOrDusk = false,
    ) {
      const state = typeof stateOrNight === "object" ? stateOrNight : undefined;
      const night = typeof stateOrNight === "boolean" ? stateOrNight : isNightOrDusk;

      // 1. Şahmerdan Tokmak Hareketi (Drop hammer pneumatic cycle)
      hammerTime += dt * 4.2;
      const stroke = Math.sin(hammerTime);
      // Tokmak örse doğru iner, vuruş anında (stroke < -0.85) örse çarpar
      const hammerHeight = 1.35 + Math.max(0, stroke) * 0.75;
      hammerRamGroup.position.y = hammerHeight;

      // Vuruş anında kıvılcım saçılması
      const isImpacting = stroke < -0.82;
      for (let i = 0; i < sparkMeshes.length; i++) {
        const spark = sparkMeshes[i];
        if (isImpacting) {
          spark.visible = true;
          const angle = (i / sparkCount) * Math.PI * 2 + hammerTime * 2.0;
          const r = 0.35 + Math.sin(hammerTime * 10 + i) * 0.25;
          spark.position.set(
            Math.cos(angle) * r,
            1.32 + Math.abs(Math.sin(hammerTime * 8 + i)) * 0.35,
            0.45 + Math.sin(angle) * r,
          );
        } else {
          spark.visible = false;
        }
      }

      // 2. Ocağın termal akkor titreşimi (Furnace pulsing glow)
      const pulsePhase = state ? state.furnacePulsePhase : hammerTime * 2.0;
      const flicker = 0.85 + Math.sin(pulsePhase * 3.0) * 0.15 + Math.sin(pulsePhase * 7.0) * 0.08;
      furnaceGlow.intensity = 2.0 * flicker;

      // 3. Cephe tabela aydınlatması (Gece/Gündüz ayarı)
      facadeLight.intensity = night ? 2.4 : 1.2;

      // 4. Usta Demirci Hamdi Usta Kafa/Gövde Takibi & Selamlama
      if (playerPos) {
        const dx = playerPos.x - HAMDI_USTA_POS.x;
        const dz = playerPos.z - HAMDI_USTA_POS.z;
        const dist = Math.hypot(dx, dz);

        if (dist <= 22.0) {
          const targetAngle = Math.atan2(dx, dz);
          headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, targetAngle, dt * 4.0);
          characterGroup.rotation.y = THREE.MathUtils.lerp(
            characterGroup.rotation.y,
            targetAngle * 0.45,
            dt * 2.5,
          );
        } else {
          headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, 0, dt * 2.0);
          characterGroup.rotation.y = THREE.MathUtils.lerp(characterGroup.rotation.y, 0, dt * 2.0);
        }
      }

      // 5. Korna / Mola Selamlaması
      if (honkAnimationTimer > 0) {
        honkAnimationTimer -= dt;
        // Çekici havaya kaldırarak heybetli usta selamı
        rightArmPivot.rotation.x = -1.6 + Math.sin(honkAnimationTimer * 6.0) * 0.35;
        rightArmPivot.rotation.z = -0.4;
        bubbleGroup.visible = true;
      } else if (state && state.honkGreetingTimer > 0) {
        rightArmPivot.rotation.x = -1.6 + Math.sin(state.honkGreetingTimer * 6.0) * 0.35;
        rightArmPivot.rotation.z = -0.4;
        const text = state.callout || state.lastHonkCallout;
        if (text) {
          updateBubble(text);
          bubbleGroup.visible = true;
        }
      } else {
        // Normal çalışma duruşu: çekici örs üzerinde hafif ritmik salınım
        rightArmPivot.rotation.x = THREE.MathUtils.lerp(
          rightArmPivot.rotation.x,
          Math.sin(hammerTime) * 0.25,
          dt * 3.0,
        );
        rightArmPivot.rotation.z = THREE.MathUtils.lerp(rightArmPivot.rotation.z, 0, dt * 3.0);
        bubbleGroup.visible = false;
      }
    },
    dispose() {
      group.traverse(obj => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
        if (obj instanceof THREE.Light) {
          obj.dispose?.();
        }
        if (obj instanceof THREE.Sprite) {
          obj.material.dispose();
        }
      });
      obstacles.length = 0;
    },
  };
}
