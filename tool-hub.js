const buttons = document.querySelectorAll(".hub-tabs button");
const frames = document.querySelectorAll(".tool-frame");
const ignoredFrozenLevelIds = new Set();
let ignoreFrozenUi = false;

function ensureSharedStore() {
  window.spotGameShared = window.spotGameShared || {
    levelConfig: null,
    levelAssets: {},
    uiConfig: null,
    uiAssets: {},
  };
}

ensureSharedStore();

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.target;
    buttons.forEach((item) => item.classList.toggle("active", item === button));
    frames.forEach((frame) => {
      const isActive = frame.id === target;
      frame.classList.toggle("active", isActive);
      if (isActive && target === "game-preview-frame") {
        frame.contentWindow?.postMessage({ type: "refresh-preview" }, "*");
      }
    });
  });
});

window.addEventListener("message", (event) => {
  ensureSharedStore();
  const data = event.data || {};

  if (data.type === "save-level-preview") {
    window.spotGameShared.levelConfig = data.levelConfig;
    window.spotGameShared.levelAssets = data.levelAssets || {};
    if (data.levelConfig?.levelId) {
      ignoredFrozenLevelIds.delete(data.levelConfig.levelId);
    }
    if (!data.levelConfig) {
      ignoredFrozenLevelIds.add("level-001");
    }
    sendStateTo(document.querySelector("#game-preview-frame")?.contentWindow);
    return;
  }

  if (data.type === "save-ui-preview") {
    window.spotGameShared.uiConfig = data.uiConfig;
    window.spotGameShared.uiAssets = data.uiAssets || {};
    ignoreFrozenUi = data.frozen ? false : !data.uiConfig;
    sendStateTo(document.querySelector("#game-preview-frame")?.contentWindow);
    return;
  }

  if (data.type === "request-state") {
    sendStateTo(event.source);
    return;
  }

  if (data.type === "request-preview-refresh") {
    sendStateTo(document.querySelector("#game-preview-frame")?.contentWindow);
  }
});

async function buildStateForPreview() {
  ensureSharedStore();
  try {
    const frozen = ignoredFrozenLevelIds.has("level-001")
      ? null
      : await window.SpotPersistentStore?.loadLevel("level-001");
    if (frozen?.config) {
      return {
        ...window.spotGameShared,
        levelConfig: frozen.config,
        levelAssets: frozen.assets || {},
        frozenLevelId: "level-001",
      };
    }
  } catch (error) {
    console.warn("Failed to load frozen level", error);
  }

  try {
    const frozenUi = ignoreFrozenUi ? null : await window.SpotPersistentStore?.loadUi("default-ui");
    if (frozenUi?.config) {
      return {
        ...window.spotGameShared,
        uiConfig: frozenUi.config,
        uiAssets: frozenUi.assets || {},
        frozenUiId: "default-ui",
      };
    }
  } catch (error) {
    console.warn("Failed to load frozen UI", error);
  }

  return window.spotGameShared;
}

async function sendStateTo(target) {
  if (!target) return;
  const state = await buildStateForPreview();
  target.postMessage({ type: "state-update", state }, "*");
}
