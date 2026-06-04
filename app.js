const STORAGE_KEYS = {
  levelConfig: "spotGame.levelConfig",
  levelAssets: "spotGame.levelAssets",
};

const SAMPLE_LEVEL_CONFIG = {
  schemaVersion: "0.1",
  engineTarget: "cocos-creator-3.8.8",
  levelId: "level-001",
  title: "第 1 关",
  collectionId: "collection-001",
  theme: "默认主题",
  timeLimitSec: 300,
  life: 5,
  images: {
    top: "levels/level-001/Gemini_Generated_Image_5c91v05c91v05c91.png",
    bottom: "levels/level-001/Gemini_Generated_Image_gair9igair9igair.png",
  },
  differences: [
    { id: "diff-001", x: 0.6495, y: 0.2808, r: 0.045, shape: "circle", tutorial: true, hintable: true },
    { id: "diff-002", x: 0.9407, y: 0.225, r: 0.045, shape: "circle", tutorial: true, hintable: true },
    { id: "diff-003", x: 0.8918, y: 0.9181, r: 0.045, shape: "circle", tutorial: true, hintable: true },
    { id: "diff-004", x: 0.4021, y: 0.3611, r: 0.045, shape: "circle", tutorial: true, hintable: true },
    { id: "diff-005", x: 0.7397, y: 0.4615, r: 0.045, shape: "circle", tutorial: true, hintable: true },
  ],
  tutorial: {
    maskFirstCount: 2,
    idleHintSec: 5,
    enablePinchGuide: true,
  },
  rewards: {
    puzzlePiece: 1,
    galleryImage: "levels/level-001/reward.png",
  },
};

const state = {
  selectedId: null,
  topImageName: "top.png",
  bottomImageName: "bottom.png",
  topImageData: "",
  bottomImageData: "",
  differences: [],
};

const fields = {
  levelId: document.querySelector("#levelId"),
  title: document.querySelector("#title"),
  collectionId: document.querySelector("#collectionId"),
  theme: document.querySelector("#theme"),
  timeLimitSec: document.querySelector("#timeLimitSec"),
  life: document.querySelector("#life"),
  topImage: document.querySelector("#topImage"),
  bottomImage: document.querySelector("#bottomImage"),
  importJson: document.querySelector("#importJson"),
  loadSample: document.querySelector("#loadSample"),
  unfreezeLevel: document.querySelector("#unfreezeLevel"),
  topPreview: document.querySelector("#topPreview"),
  bottomPreview: document.querySelector("#bottomPreview"),
  topBoard: document.querySelector("#topBoard"),
  bottomBoard: document.querySelector("#bottomBoard"),
  diffList: document.querySelector("#diffList"),
  radius: document.querySelector("#radius"),
  tutorial: document.querySelector("#tutorial"),
  hintable: document.querySelector("#hintable"),
  deleteDiff: document.querySelector("#deleteDiff"),
  savePreview: document.querySelector("#savePreview"),
  freezeLevel: document.querySelector("#freezeLevel"),
  downloadJson: document.querySelector("#downloadJson"),
  actionStatus: document.querySelector("#actionStatus"),
  jsonPreview: document.querySelector("#jsonPreview"),
  stageTitle: document.querySelector("#stageTitle"),
};

function padId(value) {
  return String(value).padStart(3, "0");
}

function getLevelNumber() {
  const match = fields.levelId.value.match(/(\d+)/);
  return match ? Number(match[1]) : 1;
}

function getLevelFolder() {
  return `levels/${fields.levelId.value || "level-001"}`;
}

function buildConfig() {
  return {
    schemaVersion: "0.1",
    engineTarget: "cocos-creator-3.8.8",
    levelId: fields.levelId.value,
    title: fields.title.value,
    collectionId: fields.collectionId.value,
    theme: fields.theme.value,
    timeLimitSec: Number(fields.timeLimitSec.value),
    life: Number(fields.life.value),
    images: {
      top: `${getLevelFolder()}/${state.topImageName}`,
      bottom: `${getLevelFolder()}/${state.bottomImageName}`,
    },
    differences: state.differences.map((diff, index) => ({
      id: `diff-${padId(index + 1)}`,
      x: Number(diff.x.toFixed(4)),
      y: Number(diff.y.toFixed(4)),
      r: Number(diff.r.toFixed(4)),
      shape: "circle",
      tutorial: diff.tutorial,
      hintable: diff.hintable,
    })),
    tutorial: {
      maskFirstCount: getLevelNumber() === 1 ? 2 : 0,
      idleHintSec: getLevelNumber() <= 2 ? 5 : 0,
      enablePinchGuide: getLevelNumber() === 1,
    },
    rewards: {
      puzzlePiece: getLevelNumber(),
      galleryImage: `${getLevelFolder()}/reward.png`,
    },
  };
}

function setActionStatus(message) {
  if (fields.actionStatus) {
    fields.actionStatus.textContent = message;
  }
}

function sendToHub(message) {
  try {
    window.parent.postMessage(message, "*");
  } catch (error) {
    window.postMessage(message, "*");
  }
}

function renderJson() {
  fields.jsonPreview.textContent = JSON.stringify(buildConfig(), null, 2);
  fields.stageTitle.textContent = fields.title.value || "关卡";
}

function renderMarkers() {
  document.querySelectorAll(".diff-marker").forEach((node) => node.remove());

  [fields.topBoard, fields.bottomBoard].forEach((board) => {
    const rect = board.getBoundingClientRect();
    const size = Math.min(rect.width, rect.height);

    state.differences.forEach((diff) => {
      const marker = document.createElement("button");
      marker.type = "button";
      marker.className = `diff-marker${diff.id === state.selectedId ? " selected" : ""}`;
      marker.style.left = `${diff.x * 100}%`;
      marker.style.top = `${diff.y * 100}%`;
      marker.style.width = `${diff.r * size * 2}px`;
      marker.style.height = `${diff.r * size * 2}px`;
      marker.title = diff.id;
      marker.addEventListener("click", (event) => {
        event.stopPropagation();
        selectDiff(diff.id);
      });
      board.appendChild(marker);
    });
  });
}

function renderDiffList() {
  fields.diffList.innerHTML = "";

  if (state.differences.length === 0) {
    const empty = document.createElement("div");
    empty.className = "tip";
    empty.textContent = "还没有不同点。点击预览图片添加。";
    fields.diffList.appendChild(empty);
    return;
  }

  state.differences.forEach((diff, index) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = `diff-item${diff.id === state.selectedId ? " active" : ""}`;
    item.innerHTML = `<span>不同点 ${index + 1}</span><span>x ${diff.x.toFixed(2)} y ${diff.y.toFixed(2)}</span>`;
    item.addEventListener("click", () => selectDiff(diff.id));
    fields.diffList.appendChild(item);
  });
}

function renderInspector() {
  const selected = state.differences.find((diff) => diff.id === state.selectedId);
  const disabled = !selected;

  fields.radius.disabled = disabled;
  fields.tutorial.disabled = disabled;
  fields.hintable.disabled = disabled;
  fields.deleteDiff.disabled = disabled;

  if (!selected) {
    fields.radius.value = 0.045;
    fields.tutorial.checked = false;
    fields.hintable.checked = true;
    return;
  }

  fields.radius.value = selected.r;
  fields.tutorial.checked = selected.tutorial;
  fields.hintable.checked = selected.hintable;
}

function render() {
  renderDiffList();
  renderInspector();
  renderMarkers();
  renderJson();
}

function selectDiff(id) {
  state.selectedId = id;
  render();
}

function addDiffFromBoard(event) {
  const board = event.currentTarget;
  const rect = board.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width;
  const y = (event.clientY - rect.top) / rect.height;
  const diff = {
    id: crypto.randomUUID(),
    x: Math.max(0, Math.min(1, x)),
    y: Math.max(0, Math.min(1, y)),
    r: Number(fields.radius.value),
    tutorial: false,
    hintable: true,
  };

  state.differences.push(diff);
  state.selectedId = diff.id;
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

async function loadImage(input, image, board, nameKey, dataKey) {
  const file = input.files[0];
  if (!file) return;

  state[nameKey] = file.name;
  state[dataKey] = await readFileAsDataUrl(file);
  image.src = state[dataKey];
  board.classList.add("has-image");
  renderJson();
}

function currentAssets() {
  return {
    top: state.topImageData,
    bottom: state.bottomImageData,
    topName: state.topImageName,
    bottomName: state.bottomImageName,
  };
}

function saveToPreview() {
  const config = buildConfig();
  const assets = currentAssets();

  try {
    window.spotGameShared.levelConfig = config;
    window.spotGameShared.levelAssets = assets;
    sendToHub({ type: "save-level-preview", levelConfig: config, levelAssets: assets });
    try {
      localStorage.setItem(STORAGE_KEYS.levelConfig, JSON.stringify(config));
    } catch (storageError) {
      console.warn("Level config was saved in memory only.", storageError);
    }
    setActionStatus("已保存预览");
    alert("已保存到临时预览。未冻结前，刷新后可能被冻结版覆盖。");
  } catch (error) {
    console.error(error);
    setActionStatus("保存失败");
    alert("保存失败，请查看控制台或刷新后重试。");
  }
}

async function freezeLevelOne() {
  const config = buildConfig();
  const assets = currentAssets();
  try {
    await window.SpotPersistentStore.saveLevel(config.levelId || "level-001", config, assets);
    window.spotGameShared.levelConfig = config;
    window.spotGameShared.levelAssets = assets;
    sendToHub({ type: "save-level-preview", levelConfig: config, levelAssets: assets });
    setActionStatus("已冻结");
    alert("关卡 1 已冻结。之后游戏预览刷新也会优先读取这个冻结版本，直到你点击“解冻关卡 1”。");
  } catch (error) {
    console.error(error);
    setActionStatus("冻结失败");
    alert("冻结失败，请刷新后重试。");
  }
}

function downloadJson() {
  try {
    const config = buildConfig();
    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${config.levelId || "level"}.json`;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      link.remove();
      URL.revokeObjectURL(url);
    }, 0);
    setActionStatus("已下载");
  } catch (error) {
    console.error(error);
    setActionStatus("下载失败");
    alert("下载失败，请刷新后重试。");
  }
}

function applyConfig(config) {
  fields.levelId.value = config.levelId || "level-001";
  fields.title.value = config.title || "第 1 关";
  fields.collectionId.value = config.collectionId || "collection-001";
  fields.theme.value = config.theme || "默认主题";
  fields.timeLimitSec.value = config.timeLimitSec || 300;
  fields.life.value = config.life || 5;
  state.topImageName = config.images?.top?.split("/").pop() || "top.png";
  state.bottomImageName = config.images?.bottom?.split("/").pop() || "bottom.png";
  state.differences = (config.differences || []).map((diff) => ({
    id: crypto.randomUUID(),
    x: diff.x,
    y: diff.y,
    r: diff.r,
    tutorial: Boolean(diff.tutorial),
    hintable: diff.hintable !== false,
  }));
  state.selectedId = state.differences[0]?.id || null;
  render();
}

function resetEditor() {
  fields.levelId.value = "level-001";
  fields.title.value = "第 1 关";
  fields.collectionId.value = "collection-001";
  fields.theme.value = "默认主题";
  fields.timeLimitSec.value = 300;
  fields.life.value = 5;
  fields.topImage.value = "";
  fields.bottomImage.value = "";
  fields.importJson.value = "";
  state.selectedId = null;
  state.topImageName = "top.png";
  state.bottomImageName = "bottom.png";
  state.topImageData = "";
  state.bottomImageData = "";
  state.differences = [];
  fields.topPreview.removeAttribute("src");
  fields.bottomPreview.removeAttribute("src");
  fields.topBoard.classList.remove("has-image");
  fields.bottomBoard.classList.remove("has-image");
  render();
}

async function unfreezeLevelOne() {
  let storageCleared = true;
  try {
    await window.SpotPersistentStore.deleteLevel("level-001");
  } catch (error) {
    storageCleared = false;
    console.warn("Frozen level storage could not be deleted, continuing with in-page unfreeze.", error);
  }

  try {
    localStorage.removeItem(STORAGE_KEYS.levelConfig);
    localStorage.removeItem(STORAGE_KEYS.levelAssets);
    window.spotGameShared.levelConfig = null;
    window.spotGameShared.levelAssets = {};
    sendToHub({ type: "save-level-preview", levelConfig: null, levelAssets: {} });
    resetEditor();
    setActionStatus(storageCleared ? "已解冻" : "已临时解冻");
    alert(
      storageCleared
        ? "关卡 1 已解冻。现在可以重新上传上图、下图并标记不同点。"
        : "关卡 1 已从当前工具状态中解冻。当前浏览器阻止删除底层冻结记录，如刷新后仍恢复旧关卡，请使用本地服务器方式打开工具中心。"
    );
  } catch (error) {
    console.error(error);
    setActionStatus("解冻失败");
    alert("解冻失败，请刷新后重试。");
  }
}

async function importJsonFile() {
  const file = fields.importJson.files[0];
  if (!file) return;
  try {
    const config = JSON.parse(await file.text());
    applyConfig(config);
    alert("关卡 JSON 已导入。请确认上图和下图也已上传，然后点击“保存到预览”。");
  } catch (error) {
    alert("导入失败：JSON 格式不正确。");
    console.error(error);
  }
}

async function loadSavedPreview() {
  try {
    const frozen = await window.SpotPersistentStore.loadLevel("level-001");
    if (frozen?.config) {
      applyConfig(frozen.config);
      state.topImageData = frozen.assets?.top || "";
      state.bottomImageData = frozen.assets?.bottom || "";
      state.topImageName = frozen.assets?.topName || state.topImageName;
      state.bottomImageName = frozen.assets?.bottomName || state.bottomImageName;
      if (state.topImageData) {
        fields.topPreview.src = state.topImageData;
        fields.topBoard.classList.add("has-image");
      }
      if (state.bottomImageData) {
        fields.bottomPreview.src = state.bottomImageData;
        fields.bottomBoard.classList.add("has-image");
      }
      window.spotGameShared.levelConfig = frozen.config;
      window.spotGameShared.levelAssets = frozen.assets || {};
      setActionStatus("已恢复冻结关卡");
      return;
    }
  } catch (error) {
    console.warn("Failed to load frozen level", error);
  }

  const configText = localStorage.getItem(STORAGE_KEYS.levelConfig);
  if (!configText) return;

  try {
    const config = JSON.parse(configText);
    const assets = window.spotGameShared.levelAssets || {};
    applyConfig(config);
    state.topImageData = assets.top || "";
    state.bottomImageData = assets.bottom || "";
    if (state.topImageData) {
      fields.topPreview.src = state.topImageData;
      fields.topBoard.classList.add("has-image");
    }
    if (state.bottomImageData) {
      fields.bottomPreview.src = state.bottomImageData;
      fields.bottomBoard.classList.add("has-image");
    }
  } catch (error) {
    console.warn("Failed to load saved level config", error);
  }
}

[
  fields.levelId,
  fields.title,
  fields.collectionId,
  fields.theme,
  fields.timeLimitSec,
  fields.life,
].forEach((field) => field.addEventListener("input", renderJson));

fields.topImage.addEventListener("change", () => {
  loadImage(fields.topImage, fields.topPreview, fields.topBoard, "topImageName", "topImageData");
});

fields.bottomImage.addEventListener("change", () => {
  loadImage(fields.bottomImage, fields.bottomPreview, fields.bottomBoard, "bottomImageName", "bottomImageData");
});

fields.importJson.addEventListener("change", importJsonFile);
fields.loadSample.addEventListener("click", () => {
  applyConfig(SAMPLE_LEVEL_CONFIG);
  alert("已载入本次示例配置。请上传对应的上图、下图，然后点击“保存到预览”。");
});
fields.unfreezeLevel.addEventListener("click", unfreezeLevelOne);
fields.topBoard.addEventListener("click", addDiffFromBoard);
fields.bottomBoard.addEventListener("click", addDiffFromBoard);

fields.radius.addEventListener("input", () => {
  const selected = state.differences.find((diff) => diff.id === state.selectedId);
  if (!selected) return;
  selected.r = Number(fields.radius.value);
  render();
});

fields.tutorial.addEventListener("change", () => {
  const selected = state.differences.find((diff) => diff.id === state.selectedId);
  if (!selected) return;
  selected.tutorial = fields.tutorial.checked;
  renderJson();
});

fields.hintable.addEventListener("change", () => {
  const selected = state.differences.find((diff) => diff.id === state.selectedId);
  if (!selected) return;
  selected.hintable = fields.hintable.checked;
  renderJson();
});

fields.deleteDiff.addEventListener("click", () => {
  state.differences = state.differences.filter((diff) => diff.id !== state.selectedId);
  state.selectedId = state.differences[0]?.id || null;
  render();
});

fields.savePreview.addEventListener("click", saveToPreview);
fields.freezeLevel.addEventListener("click", freezeLevelOne);
fields.downloadJson.addEventListener("click", downloadJson);

window.addEventListener("resize", renderMarkers);

loadSavedPreview().finally(render);
