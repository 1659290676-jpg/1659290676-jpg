const STORAGE_KEYS = {
  uiConfig: "spotGame.uiConfig",
  uiAssets: "spotGame.uiAssets",
  frozenUiConfig: "spotGame.frozenUiConfig",
  frozenUiAssets: "spotGame.frozenUiAssets",
};

const DESIGN_SIZE = {
  width: 720,
  height: 1280,
};

const screens = [
  {
    id: "level-entry",
    name: "关卡入口",
    elements: [
      makeElement("settings-button", "button", "设置", 0.88, 0.045, 0.14, 0.045),
      makeElement("puzzle-board", "panel", "25块拼图", 0.5, 0.48, 0.78, 0.48, "#d6a05f"),
      makeElement("start-level", "button", "开始挑战", 0.5, 0.86, 0.42, 0.06),
    ],
  },
  {
    id: "gameplay",
    name: "关卡界面",
    elements: [
      makeElement("level-title", "text", "关卡 1", 0.17, 0.035, 0.22, 0.035),
      makeElement("life", "text", "生命 5", 0.45, 0.035, 0.22, 0.035),
      makeElement("timer", "text", "05:00", 0.76, 0.035, 0.22, 0.035),
      makeElement("top-image", "image", "上图", 0.5, 0.28, 0.88, 0.27, "#fbf2d9"),
      makeElement("bottom-image", "image", "下图", 0.5, 0.59, 0.88, 0.27, "#fbf2d9"),
      makeElement("hint-button", "button", "提示", 0.5, 0.94, 0.28, 0.055),
    ],
  },
  {
    id: "gallery",
    name: "图库",
    elements: [
      makeElement("gallery-title", "text", "图库", 0.5, 0.055, 0.28, 0.045),
      makeElement("album-1", "panel", "主题图集 1", 0.5, 0.25, 0.78, 0.18, "#d6a05f"),
      makeElement("album-2", "panel", "主题图集 2", 0.5, 0.48, 0.78, 0.18, "#b98549"),
      makeElement("album-3", "panel", "主题图集 3", 0.5, 0.71, 0.78, 0.18, "#c7965b"),
    ],
  },
  {
    id: "settings",
    name: "设置",
    elements: [
      makeElement("settings-title", "text", "设置", 0.5, 0.08, 0.28, 0.05),
      makeElement("user-card", "panel", "用户 ID / 头像", 0.5, 0.2, 0.76, 0.1),
      makeElement("music-toggle", "button", "背景音乐", 0.5, 0.38, 0.62, 0.06),
      makeElement("sound-toggle", "button", "音效", 0.5, 0.49, 0.62, 0.06),
      makeElement("vibrate-toggle", "button", "震动", 0.5, 0.6, 0.62, 0.06),
      makeElement("version", "text", "v0.1.0", 0.5, 0.9, 0.28, 0.035),
    ],
  },
  {
    id: "loading",
    name: "加载界面",
    elements: [
      makeElement("logo", "text", "找茬游戏", 0.5, 0.32, 0.46, 0.07),
      makeElement("progress", "panel", "加载进度", 0.5, 0.58, 0.7, 0.035, "#80cbc4"),
      makeElement("loading-tip", "text", "正在准备图片...", 0.5, 0.66, 0.58, 0.035),
    ],
  },
  {
    id: "modal",
    name: "通用弹窗",
    elements: [
      makeElement("modal-mask", "panel", "", 0.5, 0.5, 1, 1, "#263238", 0.45),
      makeElement("modal-card", "panel", "恭喜胜利", 0.5, 0.46, 0.76, 0.34),
      makeElement("modal-button", "button", "下一关", 0.5, 0.62, 0.42, 0.06),
    ],
  },
];

const state = {
  screenId: screens[0].id,
  selectedId: screens[0].elements[0].id,
  drag: null,
};

const gameplayTop = screens.find((screen) => screen.id === "gameplay")?.elements.find((element) => element.id === "top-image");
const gameplayBottom = screens.find((screen) => screen.id === "gameplay")?.elements.find((element) => element.id === "bottom-image");
[gameplayTop, gameplayBottom].forEach((element) => {
  if (!element) return;
  element.fillMode = "transparent";
  element.borderEnabled = false;
});

const dom = {
  screenSelect: document.querySelector("#screenSelect"),
  canvas: document.querySelector("#canvas"),
  elementList: document.querySelector("#elementList"),
  jsonPreview: document.querySelector("#jsonPreview"),
  addText: document.querySelector("#addText"),
  addButton: document.querySelector("#addButton"),
  addPanel: document.querySelector("#addPanel"),
  addImage: document.querySelector("#addImage"),
  elName: document.querySelector("#elName"),
  elText: document.querySelector("#elText"),
  elImage: document.querySelector("#elImage"),
  elX: document.querySelector("#elX"),
  elY: document.querySelector("#elY"),
  elW: document.querySelector("#elW"),
  elH: document.querySelector("#elH"),
  elOpacity: document.querySelector("#elOpacity"),
  elFontSize: document.querySelector("#elFontSize"),
  elVisible: document.querySelector("#elVisible"),
  elBg: document.querySelector("#elBg"),
  elColor: document.querySelector("#elColor"),
  elFillMode: document.querySelector("#elFillMode"),
  elBorderEnabled: document.querySelector("#elBorderEnabled"),
  elBorderColor: document.querySelector("#elBorderColor"),
  bringToFront: document.querySelector("#bringToFront"),
  moveUp: document.querySelector("#moveUp"),
  moveDown: document.querySelector("#moveDown"),
  sendToBack: document.querySelector("#sendToBack"),
  deleteElement: document.querySelector("#deleteElement"),
  saveLayout: document.querySelector("#saveLayout"),
  freezeUi: document.querySelector("#freezeUi"),
  unfreezeUi: document.querySelector("#unfreezeUi"),
  importPackage: document.querySelector("#importPackage"),
  downloadPackage: document.querySelector("#downloadPackage"),
  downloadConfig: document.querySelector("#downloadConfig"),
  actionStatus: document.querySelector("#actionStatus"),
};

function makeElement(id, type, text, x, y, w, h, backgroundColor = "#ffffff", opacity = 1) {
  return {
    id,
    type,
    name: text || id,
    text,
    imageName: "",
    imagePreview: "",
    imageData: "",
    x,
    y,
    w,
    h,
    opacity,
    fontSize: type === "text" ? 24 : 18,
    backgroundColor,
    textColor: "#263238",
    fillMode: type === "text" ? "transparent" : "solid",
    borderEnabled: type !== "text",
    borderColor: type === "image" ? "#d7b873" : "#263238",
    visible: true,
    locked: false,
    assetWidth: 0,
    assetHeight: 0,
  };
}

function currentScreen() {
  return screens.find((screen) => screen.id === state.screenId);
}

function currentElement() {
  return currentScreen().elements.find((element) => element.id === state.selectedId);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function round(value) {
  return Number(value.toFixed(4));
}

function buildConfig() {
  return {
    schemaVersion: "0.1",
    engineTarget: "cocos-creator-3.8.8",
    canvas: {
      aspect: "9:16",
      designWidth: DESIGN_SIZE.width,
      designHeight: DESIGN_SIZE.height,
    },
    screens: screens.map((screen) => ({
      id: screen.id,
      name: screen.name,
      elements: screen.elements.map((element) => ({
        id: element.id,
        type: element.type,
        name: element.name,
        text: element.text,
        image: element.imageName ? `ui/${element.imageName}` : "",
        x: round(element.x),
        y: round(element.y),
        w: round(element.w),
        h: round(element.h),
        opacity: round(element.opacity),
        fontSize: element.fontSize,
        backgroundColor: element.backgroundColor,
        textColor: element.textColor,
        fillMode: element.fillMode || "solid",
        borderEnabled: element.borderEnabled !== false,
        borderColor: element.borderColor || "#263238",
        visible: element.visible,
        locked: element.locked === true,
        assetWidth: element.assetWidth || 0,
        assetHeight: element.assetHeight || 0,
      })),
    })),
  };
}

function setActionStatus(message) {
  if (dom.actionStatus) {
    dom.actionStatus.textContent = message;
  }
}

function sendToHub(message) {
  try {
    window.parent.postMessage(message, "*");
  } catch (error) {
    window.postMessage(message, "*");
  }
}

function renderScreenOptions() {
  dom.screenSelect.innerHTML = "";
  screens.forEach((screen) => {
    const option = document.createElement("option");
    option.value = screen.id;
    option.textContent = screen.name;
    dom.screenSelect.appendChild(option);
  });
  dom.screenSelect.value = state.screenId;
}

function renderCanvas() {
  dom.canvas.innerHTML = "";
  currentScreen().elements.forEach((element) => {
    if (!element.visible) return;

    const node = document.createElement("div");
    node.className = `ui-node${element.id === state.selectedId ? " selected" : ""}${element.locked ? " locked" : ""}`;
    if (state.screenId === "gameplay" && ["top-image", "bottom-image"].includes(element.id)) {
      node.classList.add("no-frame");
    }
    node.dataset.id = element.id;
    node.dataset.type = element.type;
    if (element.imagePreview) {
      const img = document.createElement("img");
      img.src = element.imagePreview;
      img.alt = element.name;
      node.appendChild(img);
    }

    const label = document.createElement("span");
    label.className = "node-label";
    label.textContent = element.text;
    node.appendChild(label);
    node.style.left = `${(element.x - element.w / 2) * 100}%`;
    node.style.top = `${(element.y - element.h / 2) * 100}%`;
    node.style.width = `${element.w * 100}%`;
    node.style.height = `${element.h * 100}%`;
    node.style.opacity = element.opacity;
    node.style.fontSize = `${element.fontSize}px`;
    node.style.backgroundColor = element.fillMode === "transparent" ? "transparent" : element.backgroundColor;
    node.style.borderColor = element.borderEnabled === false ? "transparent" : element.borderColor || "#263238";
    node.style.color = element.textColor;

    if (!element.locked) {
      const handle = document.createElement("span");
      handle.className = "resize-handle";
      handle.addEventListener("pointerdown", (event) => startResize(event, element.id));
      node.appendChild(handle);
    }

    node.addEventListener("pointerdown", (event) => startDrag(event, element.id));
    dom.canvas.appendChild(node);
  });
}

function renderList() {
  dom.elementList.innerHTML = "";
  currentScreen().elements.forEach((element) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = `element-item${element.id === state.selectedId ? " active" : ""}`;
    item.innerHTML = `
      <span class="element-main">
        <span>${element.name}</span>
        <span class="element-type">${element.type}${element.locked ? " · locked" : ""}</span>
      </span>
      <span class="lock-toggle" role="button" tabindex="0">${element.locked ? "解锁" : "锁定"}</span>
    `;
    item.addEventListener("click", () => {
      state.selectedId = element.id;
      render();
    });
    item.querySelector(".lock-toggle").addEventListener("click", (event) => {
      event.stopPropagation();
      element.locked = !element.locked;
      state.selectedId = element.id;
      render();
    });
    dom.elementList.appendChild(item);
  });
}

function renderInspector() {
  const element = currentElement();
  const disabled = !element;
  const locked = element?.locked === true;
  [
    dom.elName,
    dom.elText,
    dom.elImage,
    dom.elX,
    dom.elY,
    dom.elW,
    dom.elH,
    dom.elOpacity,
    dom.elFontSize,
    dom.elVisible,
    dom.elBg,
    dom.elColor,
    dom.elFillMode,
    dom.elBorderEnabled,
    dom.elBorderColor,
    dom.bringToFront,
    dom.moveUp,
    dom.moveDown,
    dom.sendToBack,
    dom.deleteElement,
  ].forEach((control) => {
    control.disabled = disabled || locked;
  });

  if (!element) return;
  dom.elName.disabled = locked;

  dom.elName.value = element.name;
  dom.elText.value = element.text;
  dom.elImage.value = "";
  dom.elImage.disabled = locked || !["image", "button", "panel"].includes(element.type);
  dom.elX.value = round(element.x);
  dom.elY.value = round(element.y);
  dom.elW.value = round(element.w);
  dom.elH.value = round(element.h);
  dom.elOpacity.value = element.opacity;
  dom.elFontSize.value = element.fontSize;
  dom.elVisible.value = String(element.visible);
  dom.elBg.value = element.backgroundColor;
  dom.elColor.value = element.textColor;
  dom.elFillMode.value = element.fillMode || "solid";
  dom.elBorderEnabled.value = String(element.borderEnabled !== false);
  dom.elBorderColor.value = element.borderColor || "#263238";
}

function renderJson() {
  dom.jsonPreview.textContent = JSON.stringify(buildConfig(), null, 2);
}

function render() {
  renderScreenOptions();
  renderCanvas();
  renderList();
  renderInspector();
  renderJson();
}

function canvasMetrics() {
  const rect = dom.canvas.getBoundingClientRect();
  return { rect, width: rect.width, height: rect.height };
}

function startDrag(event, id) {
  if (event.target.classList.contains("resize-handle")) return;
  const element = currentScreen().elements.find((item) => item.id === id);
  state.selectedId = id;
  if (element.locked) {
    render();
    return;
  }
  const { rect } = canvasMetrics();
  state.drag = {
    mode: "move",
    id,
    offsetX: event.clientX - (rect.left + element.x * rect.width),
    offsetY: event.clientY - (rect.top + element.y * rect.height),
  };
  event.currentTarget.setPointerCapture(event.pointerId);
  render();
}

function startResize(event, id) {
  event.stopPropagation();
  state.selectedId = id;
  if (currentElement()?.locked) {
    render();
    return;
  }
  state.drag = {
    mode: "resize",
    id,
    startX: event.clientX,
    startY: event.clientY,
    startW: currentElement().w,
    startH: currentElement().h,
  };
  event.currentTarget.setPointerCapture(event.pointerId);
  render();
}

function handlePointerMove(event) {
  if (!state.drag) return;
  const element = currentScreen().elements.find((item) => item.id === state.drag.id);
  if (!element || element.locked) return;
  const { rect } = canvasMetrics();

  if (state.drag.mode === "move") {
    const x = (event.clientX - rect.left - state.drag.offsetX) / rect.width;
    const y = (event.clientY - rect.top - state.drag.offsetY) / rect.height;
    element.x = round(x);
    element.y = round(y);
  }

  if (state.drag.mode === "resize") {
    const deltaW = (event.clientX - state.drag.startX) / rect.width;
    const deltaH = (event.clientY - state.drag.startY) / rect.height;
    element.w = round(Math.max(0.001, state.drag.startW + deltaW));
    element.h = round(Math.max(0.001, state.drag.startH + deltaH));
  }

  render();
}

function stopPointer() {
  state.drag = null;
}

function addElement(type) {
  const id = `${type}-${Date.now()}`;
  const labels = {
    text: "新文字",
    button: "新按钮",
    panel: "新面板",
    image: "图片占位",
  };
  const sizes = {
    text: [0.3, 0.045],
    button: [0.32, 0.06],
    panel: [0.55, 0.16],
    image: [0.62, 0.22],
  };
  const [w, h] = sizes[type];
  const bg = type === "panel" ? "#ffffff" : type === "image" ? "#fbf2d9" : "#1e88e5";
  const element = makeElement(id, type, labels[type], 0.5, 0.5, w, h, bg);
  if (type === "button") element.textColor = "#ffffff";
  currentScreen().elements.push(element);
  state.selectedId = element.id;
  render();
}

function updateSelected(partial) {
  const element = currentElement();
  if (!element) return;
  if (element.locked) return;
  Object.assign(element, partial);
  render();
}

function moveSelectedLayer(action) {
  const screen = currentScreen();
  const index = screen.elements.findIndex((element) => element.id === state.selectedId);
  if (index < 0) return;

  const [element] = screen.elements.splice(index, 1);
  if (action === "front") {
    screen.elements.push(element);
  }
  if (action === "back") {
    screen.elements.unshift(element);
  }
  if (action === "up") {
    screen.elements.splice(Math.min(index + 1, screen.elements.length), 0, element);
  }
  if (action === "down") {
    screen.elements.splice(Math.max(index - 1, 0), 0, element);
  }
  render();
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", reject);
    reader.readAsDataURL(file);
  });
}

function readImageInfo(file) {
  return readFileAsDataUrl(file).then((dataUrl) => new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => {
      resolve({
        dataUrl,
        width: image.naturalWidth || image.width,
        height: image.naturalHeight || image.height,
      });
    });
    image.addEventListener("error", reject);
    image.src = dataUrl;
  }));
}

function collectUiAssets() {
  const assets = {};
  screens.forEach((screen) => {
    screen.elements.forEach((element) => {
      if (element.imageName && element.imageData) {
        assets[element.imageName] = element.imageData;
      }
    });
  });
  return assets;
}

function clearHeavyUiStorage() {
  try {
    localStorage.removeItem(STORAGE_KEYS.uiAssets);
    localStorage.removeItem(STORAGE_KEYS.frozenUiAssets);
    sessionStorage.removeItem(STORAGE_KEYS.uiAssets);
    sessionStorage.removeItem(STORAGE_KEYS.frozenUiAssets);
  } catch (error) {
    console.warn("Failed to clear heavy UI asset storage.", error);
  }
}

function writeSmallUiStorage(uiConfig, frozen = false) {
  localStorage.setItem(STORAGE_KEYS.uiConfig, JSON.stringify(uiConfig));
  if (frozen) {
    localStorage.setItem(STORAGE_KEYS.frozenUiConfig, JSON.stringify(uiConfig));
  }
}

function saveLayoutToPreview() {
  try {
    window.spotGameShared.uiConfig = buildConfig();
    window.spotGameShared.uiAssets = collectUiAssets();
    sendToHub({ type: "save-ui-preview", uiConfig: window.spotGameShared.uiConfig, uiAssets: window.spotGameShared.uiAssets });
    try {
      clearHeavyUiStorage();
      writeSmallUiStorage(window.spotGameShared.uiConfig);
    } catch (storageError) {
      console.warn("UI layout was saved in memory only.", storageError);
    }
    setActionStatus("已保存到预览");
    alert("UI 已保存到游戏预览。切换到“游戏预览”即可查看效果。");
  } catch (error) {
    console.error(error);
    setActionStatus("保存失败");
    alert("保存失败，请刷新后重试。");
  }
}

async function freezeUiLayout() {
  const uiConfig = buildConfig();
  const uiAssets = collectUiAssets();
  let savedToIndexedDb = false;
  let savedToFallback = false;

  clearHeavyUiStorage();

  try {
    await window.SpotPersistentStore.saveUi("default-ui", uiConfig, uiAssets);
    savedToIndexedDb = true;
  } catch (error) {
    console.warn("IndexedDB freeze failed, using fallback freeze.", error);
  }

  try {
    writeSmallUiStorage(uiConfig, true);
    savedToFallback = true;
  } catch (localError) {
    console.warn("localStorage freeze failed, trying sessionStorage.", localError);
    try {
      sessionStorage.setItem(STORAGE_KEYS.frozenUiConfig, JSON.stringify(uiConfig));
      savedToFallback = true;
    } catch (sessionError) {
      console.error(sessionError);
    }
  }

  if (!savedToIndexedDb) {
    setActionStatus("冻结 UI 失败");
    alert("冻结 UI 失败：已自动清理旧的大图缓存，请再点一次“冻结 UI”。如果仍失败，请用本地服务器方式打开工具。");
    return;
  }

  window.spotGameShared.uiConfig = uiConfig;
  window.spotGameShared.uiAssets = uiAssets;
  sendToHub({ type: "save-ui-preview", uiConfig, uiAssets, frozen: true });
  setActionStatus(savedToIndexedDb ? "UI 已冻结" : "UI 已冻结（备用存储）");
  alert(savedToIndexedDb
    ? "UI 已冻结。之后游戏预览刷新也会优先读取这个冻结版本，直到你点击“解冻 UI”。"
    : "UI 已冻结到备用存储。当前 file:// 环境下 IndexedDB 不稳定，但游戏预览会优先读取这个冻结版本。");
}

async function unfreezeUiLayout() {
  let storageCleared = true;
  try {
    await window.SpotPersistentStore.deleteUi("default-ui");
  } catch (error) {
    storageCleared = false;
    console.warn("Frozen UI storage could not be deleted, continuing with in-page unfreeze.", error);
  }

  try {
    localStorage.removeItem(STORAGE_KEYS.uiConfig);
    localStorage.removeItem(STORAGE_KEYS.uiAssets);
    localStorage.removeItem(STORAGE_KEYS.frozenUiConfig);
    localStorage.removeItem(STORAGE_KEYS.frozenUiAssets);
    sessionStorage.removeItem(STORAGE_KEYS.frozenUiConfig);
    sessionStorage.removeItem(STORAGE_KEYS.frozenUiAssets);
    window.spotGameShared.uiConfig = null;
    window.spotGameShared.uiAssets = {};
    sendToHub({ type: "save-ui-preview", uiConfig: null, uiAssets: {} });
    setActionStatus(storageCleared ? "UI 已解冻" : "UI 已临时解冻");
    alert(
      storageCleared
        ? "UI 已解冻。现在可以重新编辑并保存或重新冻结。"
        : "UI 已从当前工具状态中解冻。当前浏览器阻止删除底层冻结记录，如刷新后仍恢复旧 UI，请用本地服务器方式打开工具中心。"
    );
  } catch (error) {
    console.error(error);
    setActionStatus("解冻 UI 失败");
    alert("解冻 UI 失败，请刷新后重试。");
  }
}

function downloadConfig() {
  try {
    const config = buildConfig();
    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ui-layout.json";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      link.remove();
      URL.revokeObjectURL(url);
    }, 0);
    setActionStatus("已下载 UI JSON");
  } catch (error) {
    console.error(error);
    setActionStatus("下载失败");
    alert("下载失败，请刷新后重试。");
  }
}

function downloadPackage() {
  try {
    const uiPackage = {
      schemaVersion: "0.1",
      exportedAt: new Date().toISOString(),
      uiConfig: buildConfig(),
      uiAssets: collectUiAssets(),
    };
    const blob = new Blob([JSON.stringify(uiPackage, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ui-layout-package.json";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      link.remove();
      URL.revokeObjectURL(url);
    }, 0);
    setActionStatus("已下载 UI 完整包");
  } catch (error) {
    console.error(error);
    setActionStatus("完整包下载失败");
    alert("完整包下载失败，请刷新后重试。");
  }
}

function applyUiPackage(uiPackage) {
  const config = uiPackage.uiConfig || uiPackage.config || uiPackage;
  const assets = uiPackage.uiAssets || uiPackage.assets || {};
  if (!config?.screens) {
    throw new Error("Invalid UI package.");
  }

  (config.screens || []).forEach((savedScreen) => {
    const screen = screens.find((item) => item.id === savedScreen.id);
    if (!screen) return;
    screen.elements = (savedScreen.elements || []).map((element) => {
      const imageName = element.image ? element.image.split("/").pop() : "";
      return {
        id: element.id,
        type: element.type,
        name: element.name,
        text: element.text,
        imageName,
        imagePreview: imageName && assets[imageName] ? assets[imageName] : "",
        imageData: imageName && assets[imageName] ? assets[imageName] : "",
        x: element.x,
        y: element.y,
        w: element.w,
        h: element.h,
        opacity: element.opacity,
        fontSize: element.fontSize,
        backgroundColor: element.backgroundColor,
        textColor: element.textColor,
        fillMode: element.fillMode || (element.type === "text" ? "transparent" : "solid"),
        borderEnabled: element.borderEnabled !== false,
        borderColor: element.borderColor || (element.type === "image" ? "#d7b873" : "#263238"),
        visible: element.visible !== false,
        locked: element.locked === true,
        assetWidth: element.assetWidth || 0,
        assetHeight: element.assetHeight || 0,
      };
    });
  });

  state.screenId = screens[0].id;
  state.selectedId = screens[0].elements[0]?.id || null;
  window.spotGameShared.uiConfig = buildConfig();
  window.spotGameShared.uiAssets = collectUiAssets();
  sendToHub({ type: "save-ui-preview", uiConfig: window.spotGameShared.uiConfig, uiAssets: window.spotGameShared.uiAssets });
  render();
}

async function importPackageFromFile() {
  const file = dom.importPackage.files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    applyUiPackage(JSON.parse(text));
    dom.importPackage.value = "";
    setActionStatus("已导入 UI 完整包");
    alert("UI 完整包已导入。可以先去游戏预览查看，再点击“冻结 UI”。");
  } catch (error) {
    console.error(error);
    setActionStatus("导入 UI 完整包失败");
    alert("导入 UI 完整包失败，请确认文件是从本工具导出的完整包。");
  }
}

function loadSavedLayout() {
  const configText = localStorage.getItem(STORAGE_KEYS.uiConfig);
  const assetsText = localStorage.getItem(STORAGE_KEYS.uiAssets);
  if (!configText) return;

  try {
    const config = JSON.parse(configText);
    const assets = window.spotGameShared.uiAssets || (assetsText ? JSON.parse(assetsText) : {});
    (config.screens || []).forEach((savedScreen) => {
      const screen = screens.find((item) => item.id === savedScreen.id);
      if (!screen) return;
      screen.elements = (savedScreen.elements || []).map((element) => {
        const imageName = element.image ? element.image.split("/").pop() : "";
        return {
          id: element.id,
          type: element.type,
          name: element.name,
          text: element.text,
          imageName,
          imagePreview: imageName && assets[imageName] ? assets[imageName] : "",
          imageData: imageName && assets[imageName] ? assets[imageName] : "",
          x: element.x,
          y: element.y,
          w: element.w,
          h: element.h,
          opacity: element.opacity,
          fontSize: element.fontSize,
          backgroundColor: element.backgroundColor,
          textColor: element.textColor,
          fillMode: element.fillMode || (element.type === "text" ? "transparent" : "solid"),
          borderEnabled: element.borderEnabled !== false,
          borderColor: element.borderColor || (element.type === "image" ? "#d7b873" : "#263238"),
          visible: element.visible !== false,
          locked: element.locked === true,
          assetWidth: element.assetWidth || 0,
          assetHeight: element.assetHeight || 0,
        };
      });
    });
    state.screenId = screens[0].id;
    state.selectedId = screens[0].elements[0]?.id || null;
  } catch (error) {
    console.warn("Failed to load saved UI layout", error);
  }
}

dom.screenSelect.addEventListener("change", () => {
  state.screenId = dom.screenSelect.value;
  state.selectedId = currentScreen().elements[0]?.id || null;
  render();
});

dom.addText.addEventListener("click", () => addElement("text"));
dom.addButton.addEventListener("click", () => addElement("button"));
dom.addPanel.addEventListener("click", () => addElement("panel"));
dom.addImage.addEventListener("click", () => addElement("image"));

dom.elName.addEventListener("input", () => updateSelected({ name: dom.elName.value }));
dom.elText.addEventListener("input", () => updateSelected({ text: dom.elText.value }));
dom.elImage.addEventListener("change", async () => {
  const element = currentElement();
  const file = dom.elImage.files[0];
  if (!element || element.locked || !["image", "button", "panel"].includes(element.type) || !file) return;

  element.imageName = file.name;
  const imageInfo = await readImageInfo(file);
  element.imageData = imageInfo.dataUrl;
  element.imagePreview = element.imageData;
  element.assetWidth = imageInfo.width;
  element.assetHeight = imageInfo.height;
  element.w = round(imageInfo.width / DESIGN_SIZE.width);
  element.h = round(imageInfo.height / DESIGN_SIZE.height);
  element.fillMode = "transparent";
  element.backgroundColor = "#ffffff";
  element.borderEnabled = false;
  if (!element.name || element.name === element.text) {
    element.name = file.name;
  }
  render();
});
dom.elX.addEventListener("input", () => updateSelected({ x: Number(dom.elX.value) }));
dom.elY.addEventListener("input", () => updateSelected({ y: Number(dom.elY.value) }));
dom.elW.addEventListener("input", () => updateSelected({ w: Math.max(0.001, Number(dom.elW.value)) }));
dom.elH.addEventListener("input", () => updateSelected({ h: Math.max(0.001, Number(dom.elH.value)) }));
dom.elOpacity.addEventListener("input", () => updateSelected({ opacity: Number(dom.elOpacity.value) }));
dom.elFontSize.addEventListener("input", () => updateSelected({ fontSize: Number(dom.elFontSize.value) }));
dom.elVisible.addEventListener("change", () => updateSelected({ visible: dom.elVisible.value === "true" }));
dom.elBg.addEventListener("input", () => updateSelected({ backgroundColor: dom.elBg.value }));
dom.elColor.addEventListener("input", () => updateSelected({ textColor: dom.elColor.value }));
dom.elFillMode.addEventListener("change", () => updateSelected({ fillMode: dom.elFillMode.value }));
dom.elBorderEnabled.addEventListener("change", () => updateSelected({ borderEnabled: dom.elBorderEnabled.value === "true" }));
dom.elBorderColor.addEventListener("input", () => updateSelected({ borderColor: dom.elBorderColor.value }));
dom.bringToFront.addEventListener("click", () => moveSelectedLayer("front"));
dom.moveUp.addEventListener("click", () => moveSelectedLayer("up"));
dom.moveDown.addEventListener("click", () => moveSelectedLayer("down"));
dom.sendToBack.addEventListener("click", () => moveSelectedLayer("back"));

dom.deleteElement.addEventListener("click", () => {
  const screen = currentScreen();
  screen.elements = screen.elements.filter((element) => element.id !== state.selectedId);
  state.selectedId = screen.elements[0]?.id || null;
  render();
});

dom.downloadConfig.addEventListener("click", downloadConfig);
dom.downloadPackage.addEventListener("click", downloadPackage);
dom.importPackage.addEventListener("change", importPackageFromFile);
dom.saveLayout.addEventListener("click", saveLayoutToPreview);
dom.freezeUi.addEventListener("click", freezeUiLayout);
dom.unfreezeUi.addEventListener("click", unfreezeUiLayout);

window.addEventListener("message", async (event) => {
  if (event.data?.type !== "freeze-current-ui") return;
  await freezeUiLayout();
});

window.addEventListener("pointermove", handlePointerMove);
window.addEventListener("pointerup", stopPointer);

loadSavedLayout();
render();
