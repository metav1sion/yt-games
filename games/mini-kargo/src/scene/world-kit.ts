import * as THREE from "three";
import type { Rect, Vec2 } from "../game/types";
import type { AssetManager } from "./assets";

const materials = new Map<string, THREE.MeshStandardMaterial>();
const originalRoughness = new Map<THREE.MeshStandardMaterial, number>();
const ASPHALT_COLORS = new Set(["#2f3640", "#526362", "#4f5b66", "#586570", "#697782"]);

export function setWorldWetness(wetness: number) {
  const clamped = Math.max(0, Math.min(1, wetness));
  for (const [key, material] of materials.entries()) {
    const color = key.split("_")[0];
    if (ASPHALT_COLORS.has(color)) {
      if (!originalRoughness.has(material)) {
        originalRoughness.set(material, material.roughness);
      }
      const baseRough = originalRoughness.get(material) ?? 0.85;
      material.roughness = THREE.MathUtils.lerp(baseRough, 0.22, clamped);
      material.metalness = THREE.MathUtils.lerp(0.0, 0.22, clamped);
    }
  }
}

/**
 * Şehir gece aydınlatması ve pencere/fener ışıkları (Night Emissive Illumination)
 * - Alacakaranlık ve gün batımında sokak lambaları, döküm sahil fenerleri ve vitrinler parlar.
 */
export function setWorldNightEmissive(nightFactor: number) {
  const clamped = Math.max(0, Math.min(1, nightFactor));
  for (const [key, material] of materials.entries()) {
    const color = key.split("_")[0];
    if (color === "#fbeecc") {
      // Sokak lambası armatürleri (Sıcak akkor ışık)
      material.emissive.set("#ffdd66");
      material.emissiveIntensity = clamped * 1.5;
    } else if (color === "#fff3bf") {
      // Sahil kordonu nostaljik fenerleri (Altın sarısı parıltı)
      material.emissive.set("#ffa834");
      material.emissiveIntensity = clamped * 1.6;
    } else if (color === "#bee3f8" || color === "#e2e8f0") {
      // Dükkan vitrinleri ve apartman pencereleri (Sıcak iç mekan ışığı)
      material.emissive.set("#f6e58d");
      material.emissiveIntensity = clamped * 0.75;
    } else if (color === "#f59e0b" || color === "#ecc94b") {
      // Sanayi trafo/helipad uyarı ışıkları
      material.emissive.set("#f39c12");
      material.emissiveIntensity = clamped * 0.85;
    }
  }
}

export function mat(color: string, roughness = 0.85): THREE.MeshStandardMaterial {
  const key = `${color}_${roughness}`;
  if (!materials.has(key)) {
    materials.set(
      key,
      new THREE.MeshStandardMaterial({ color, roughness }),
    );
  }
  return materials.get(key)!;
}

export function box(
  parent: THREE.Object3D,
  size: number[],
  pos: number[],
  color: string,
  roughness = 0.85,
) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(size[0], size[1], size[2]),
    mat(color, roughness),
  );
  mesh.position.set(pos[0], pos[1], pos[2]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

export function cylinder(
  parent: THREE.Object3D,
  top: number,
  bottom: number,
  height: number,
  pos: number[],
  color: string,
  sides = 12,
) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(top, bottom, height, sides),
    mat(color),
  );
  mesh.position.set(pos[0], pos[1], pos[2]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

export function label(text: string, color = "#23443d", bg = "#fff9e7") {
  if (typeof document === "undefined") {
    return new THREE.Sprite();
  }
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const c = canvas.getContext("2d")!;
  c.fillStyle = bg;
  c.beginPath();
  c.roundRect(0, 0, 512, 128, 24);
  c.fill();
  c.fillStyle = color;
  c.font = "bold 52px system-ui";
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.fillText(text, 256, 66);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: texture, depthTest: true }),
  );
  sprite.scale.set(5, 1.25, 1);
  return sprite;
}

/** Her bölge oluşturucusunun paylaştığı bağlam ve yardımcılar. */
export type WorldContext = {
  group: THREE.Group;
  baseObstacles: Rect[];
  homes: Vec2[];
  assets: Pick<AssetManager, "cloneModel">;
  addTree(x: number, z: number, scale?: number): void;
  addPalmTree(x: number, z: number): void;
  addStreetLight(x: number, z: number): void;
  addModel(parent: THREE.Object3D, id: string, x: number, z: number, scale: number, rotation?: number): boolean;
  /** Modeli dünyaya yerleştirir ve dünya koordinatlarındaki taban dikdörtgenini döndürür; model yoksa null. */
  placeModel(id: string, x: number, z: number, scale: number, rotation?: number, pad?: number): Rect | null;
};

export function createWorldContext(
  group: THREE.Group,
  assets: Pick<AssetManager, "cloneModel">,
): WorldContext {
  const baseObstacles: Rect[] = [];
  const homes: Vec2[] = [];
  const TREE_MODELS = ["nature/tree_default", "nature/tree_oak", "nature/tree_detailed"];
  function addTree(x: number, z: number, scale = 1) {
    baseObstacles.push({ minX: x - 0.45, maxX: x + 0.45, minZ: z - 0.45, maxZ: z + 0.45 });
    // Kenney ağacı varsa onu kullan; yoksa prosedürel ağaca düş.
    const pick = TREE_MODELS[Math.abs(Math.round(x * 7 + z * 13)) % TREE_MODELS.length];
    if (addModel(group, pick, x, z, 3.4 * scale, ((x * 31 + z * 17) % 6.28))) return;
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.scale.setScalar(scale);
    group.add(g);
    cylinder(g, 0.22, 0.3, 1.9, [0, 0.95, 0], "#8f6e4a", 7);
    const crown = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.4, 1),
      mat("#559467"),
    );
    crown.position.set(0, 2.6, 0);
    crown.scale.set(1, 1.1, 0.95);
    crown.castShadow = true;
    g.add(crown);
    const tip = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.9, 0),
      mat("#78a666"),
    );
    tip.position.set(0.4, 3.2, 0.1);
    tip.castShadow = true;
    g.add(tip);
  }

  const PALM_MODELS = ["nature/tree_palmTall", "nature/tree_palmDetailedShort", "nature/tree_palmShort"];
  function addPalmTree(x: number, z: number) {
    baseObstacles.push({ minX: x - 0.4, maxX: x + 0.4, minZ: z - 0.4, maxZ: z + 0.4 });
    const pick = PALM_MODELS[Math.abs(Math.round(x * 5 + z * 11)) % PALM_MODELS.length];
    if (addModel(group, pick, x, z, pick.endsWith("Tall") ? 4.2 : 5.5, ((x * 13 + z * 7) % 6.28))) return;
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    group.add(g);
    cylinder(g, 0.18, 0.28, 3.2, [0, 1.6, 0], "#9e7d56", 6);
    for (let i = 0; i < 5; i++) {
      const leaf = box(g, [2.2, 0.06, 0.5], [1.0, 3.3, 0], "#42875b");
      leaf.rotation.y = (i * Math.PI * 2) / 5;
      leaf.rotation.z = -0.25;
    }
  }

  function addStreetLight(x: number, z: number) {
    cylinder(group, 0.08, 0.12, 3.6, [x, 1.8, z], "#38524a", 8);
    box(group, [0.8, 0.16, 0.4], [x, 3.65, z], "#fbeecc");
  }

  function addModel(parent: THREE.Object3D, id: string, x: number, z: number, scale: number, rotation = 0) {
    const model = assets.cloneModel(id);
    if (!model) return false;
    model.userData.assetId = id;
    model.position.set(x, 0, z);
    model.scale.setScalar(scale);
    model.rotation.y = rotation;
    model.traverse(o => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    parent.add(model);
    return true;
  }

  function placeModel(id: string, x: number, z: number, scale: number, rotation = 0, pad = 0.3): Rect | null {
    if (!addModel(group, id, x, z, scale, rotation)) return null;
    const placed = group.children[group.children.length - 1];
    placed.updateMatrixWorld(true);
    const b = new THREE.Box3().setFromObject(placed);
    return { minX: b.min.x - pad, maxX: b.max.x + pad, minZ: b.min.z - pad, maxZ: b.max.z + pad };
  }
  return { group, baseObstacles, homes, assets, addTree, addPalmTree, addStreetLight, addModel, placeModel };
}
