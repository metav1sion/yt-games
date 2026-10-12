import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export type AssetState = "idle" | "loading" | "loaded" | "error";

export type AssetManifestItem = {
  id: string;
  url: string;
};

export const DEFAULT_ASSET_MANIFEST: AssetManifestItem[] = [];

export type AssetManager = {
  load(manifest?: readonly AssetManifestItem[]): Promise<void>;
  getModel(id: string): THREE.Group | null;
  cloneModel(id: string): THREE.Group | null;
  hasModel(id: string): boolean;
  getState(): {
    state: AssetState;
    progress: number;
    loadedCount: number;
    totalCount: number;
  };
  onProgress(cb: (progress: number) => void): () => void;
  onLoaded(cb: () => void): () => void;
  reset(): void;
};

export function createAssetManager(): AssetManager {
  const models = new Map<string, THREE.Group>();
  let state: AssetState = "idle";
  let loadedCount = 0;
  let totalCount = 0;
  const progressListeners = new Set<(progress: number) => void>();
  const loadedListeners = new Set<() => void>();

  function getProgress() {
    if (state === "loaded") return 1;
    if (totalCount === 0) return 0;
    return loadedCount / totalCount;
  }

  function notifyProgress() {
    const progress = getProgress();
    for (const listener of progressListeners) {
      try {
        listener(progress);
      } catch (err) {
        console.warn("Asset progress listener error:", err);
      }
    }
  }

  function notifyLoaded() {
    for (const listener of loadedListeners) {
      try {
        listener();
      } catch (err) {
        console.warn("Asset loaded listener error:", err);
      }
    }
  }

  async function load(
    manifest: readonly AssetManifestItem[] = DEFAULT_ASSET_MANIFEST,
  ): Promise<void> {
    if (manifest.length === 0) {
      state = "loaded";
      notifyLoaded();
      return;
    }

    state = "loading";
    totalCount = manifest.length;
    loadedCount = 0;

    // Node.js veya test ortamında fetch/XHR desteği yoksa güvenli fallback
    const hasNetwork =
      typeof window !== "undefined" && typeof fetch !== "undefined";

    if (!hasNetwork) {
      state = "loaded";
      notifyLoaded();
      return;
    }

    const loader = new GLTFLoader();

    await Promise.all(
      manifest.map(async (item) => {
        try {
          await new Promise<void>((resolve) => {
            loader.load(
              item.url,
              (gltf) => {
                const scene = gltf.scene;
                scene.traverse((child) => {
                  if (child instanceof THREE.Mesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                  }
                });
                models.set(item.id, scene);
                loadedCount++;
                notifyProgress();
                resolve();
              },
              undefined,
              (err) => {
                // Dosya bulunamadığında (404) oyunu çökertme, fallback prosedürel modellere devam et
                console.warn(
                  `[AssetManager] Model yüklenemedi (${item.id}):`,
                  err,
                );
                loadedCount++;
                notifyProgress();
                resolve();
              },
            );
          });
        } catch {
          loadedCount++;
          notifyProgress();
        }
      }),
    );

    state = "loaded";
    notifyLoaded();
  }

  return {
    load,
    getModel(id: string): THREE.Group | null {
      return models.get(id) ?? null;
    },
    cloneModel(id: string): THREE.Group | null {
      const original = models.get(id);
      if (!original) return null;
      const clone = original.clone(true);
      clone.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      return clone;
    },
    hasModel(id: string): boolean {
      return models.has(id);
    },
    getState() {
      const progress = getProgress();
      return {
        state,
        progress,
        loadedCount,
        totalCount,
      };
    },
    onProgress(cb: (progress: number) => void) {
      progressListeners.add(cb);
      return () => {
        progressListeners.delete(cb);
      };
    },
    onLoaded(cb: () => void) {
      loadedListeners.add(cb);
      if (state === "loaded") {
        cb();
      }
      return () => {
        loadedListeners.delete(cb);
      };
    },
    reset() {
      models.clear();
      state = "idle";
      loadedCount = 0;
      totalCount = 0;
    },
  };
}

export const assetManager = createAssetManager();
