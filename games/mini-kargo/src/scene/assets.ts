import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export type AssetState = "idle" | "loading" | "loaded" | "error";

export type AssetManifestItem = {
  id: string;
  url: string;
};

export const DEFAULT_ASSET_MANIFEST: AssetManifestItem[] = [
  ...["building-type-a", "building-type-c"].map(id => ({
    id, url: `${import.meta.env.BASE_URL}assets/kenney/suburban/${id}.glb`,
  })),
  ...["road-straight", "road-crossroad"].map(id => ({
    id, url: `${import.meta.env.BASE_URL}assets/kenney/roads/${id}.glb`,
  })),
];

export type ModelLoader = (id: string, url: string) => Promise<THREE.Group>;

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

export function createAssetManager(loadModel?: ModelLoader): AssetManager {
  const pending = new Map<string, Promise<void>>();
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

    const loader = new GLTFLoader();
    const fetchModel: ModelLoader = loadModel ?? (async (_id, url) => {
      if (typeof window === "undefined" || typeof fetch === "undefined") {
        throw new Error("Model loading requires a browser");
      }
      return (await loader.loadAsync(url)).scene;
    });
    await Promise.all(manifest.map(async item => {
      try {
        if (!models.has(item.id)) {
          let request = pending.get(item.id);
          if (!request) {
            request = (async () => {
              const scene = await fetchModel(item.id, item.url);
              scene.traverse(child => {
                if (child instanceof THREE.Mesh) {
                  child.castShadow = true;
                  child.receiveShadow = true;
                }
              });
              models.set(item.id, scene);
            })();
            pending.set(item.id, request);
          }
          await request;
        }
      } catch (error) {
        // A missing individual asset leaves its procedural replacement in use.
        if (typeof window !== "undefined") {
          console.warn(`[AssetManager] Model yüklenemedi (${item.id}):`, error);
        }
      } finally {
        pending.delete(item.id);
        loadedCount++;
        notifyProgress();
      }
    }));

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
