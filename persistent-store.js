(function initPersistentStore() {
  const DB_NAME = "spotGameDevTools";
  const DB_VERSION = 1;
  const LEVEL_STORE = "levels";
  const UI_STORE = "uiLayouts";

  function openDb() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new Error("IndexedDB is not available in this browser context."));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.addEventListener("upgradeneeded", () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(LEVEL_STORE)) {
          db.createObjectStore(LEVEL_STORE, { keyPath: "levelId" });
        }
        if (!db.objectStoreNames.contains(UI_STORE)) {
          db.createObjectStore(UI_STORE, { keyPath: "uiId" });
        }
      });

      request.addEventListener("success", () => resolve(request.result));
      request.addEventListener("error", () => reject(request.error));
    });
  }

  async function saveLevel(levelId, config, assets) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(LEVEL_STORE, "readwrite");
      tx.objectStore(LEVEL_STORE).put({
        levelId,
        config,
        assets,
        savedAt: new Date().toISOString(),
      });
      tx.addEventListener("complete", () => resolve(true));
      tx.addEventListener("error", () => reject(tx.error));
    });
  }

  async function loadLevel(levelId) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(LEVEL_STORE, "readonly");
      const request = tx.objectStore(LEVEL_STORE).get(levelId);
      request.addEventListener("success", () => resolve(request.result || null));
      request.addEventListener("error", () => reject(request.error));
    });
  }

  async function deleteLevel(levelId) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(LEVEL_STORE, "readwrite");
      tx.objectStore(LEVEL_STORE).delete(levelId);
      tx.addEventListener("complete", () => resolve(true));
      tx.addEventListener("error", () => reject(tx.error));
    });
  }

  async function saveUi(uiId, config, assets) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(UI_STORE, "readwrite");
      tx.objectStore(UI_STORE).put({
        uiId,
        config,
        assets,
        savedAt: new Date().toISOString(),
      });
      tx.addEventListener("complete", () => resolve(true));
      tx.addEventListener("error", () => reject(tx.error));
    });
  }

  async function loadUi(uiId) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(UI_STORE, "readonly");
      const request = tx.objectStore(UI_STORE).get(uiId);
      request.addEventListener("success", () => resolve(request.result || null));
      request.addEventListener("error", () => reject(request.error));
    });
  }

  async function deleteUi(uiId) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(UI_STORE, "readwrite");
      tx.objectStore(UI_STORE).delete(uiId);
      tx.addEventListener("complete", () => resolve(true));
      tx.addEventListener("error", () => reject(tx.error));
    });
  }

  window.SpotPersistentStore = {
    saveLevel,
    loadLevel,
    deleteLevel,
    saveUi,
    loadUi,
    deleteUi,
  };
})();
