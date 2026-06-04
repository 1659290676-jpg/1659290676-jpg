const STORAGE_KEYS = {
  levelConfig: "spotGame.levelConfig",
  levelAssets: "spotGame.levelAssets",
  uiConfig: "spotGame.uiConfig",
  uiAssets: "spotGame.uiAssets",
};

const STATIC_DEFAULT_LEVEL = {
  schemaVersion: "0.1",
  engineTarget: "web-preview",
  levelId: "level-001",
  title: "Level 1",
  collectionId: "collection-001",
  theme: "default",
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

const STATIC_DEFAULT_ASSETS = {
  top: STATIC_DEFAULT_LEVEL.images.top,
  bottom: STATIC_DEFAULT_LEVEL.images.bottom,
};

const canvas = document.querySelector("#gameCanvas");
const statusText = document.querySelector("#statusText");
const refreshPreview = document.querySelector("#refreshPreview");
const resetRun = document.querySelector("#resetRun");

let levelConfig = null;
let levelAssets = {};
let uiConfig = null;
let uiAssets = {};
let run = null;
let timerId = null;

function readJson(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.warn(`Failed to read ${key}`, error);
    return fallback;
  }
}

function cloneDefaultLevel() {
  return JSON.parse(JSON.stringify(STATIC_DEFAULT_LEVEL));
}

function ensurePlayableLevel() {
  if (!levelConfig || !Array.isArray(levelConfig.differences) || levelConfig.differences.length === 0) {
    levelConfig = cloneDefaultLevel();
  }
  levelAssets = {
    ...STATIC_DEFAULT_ASSETS,
    ...(levelAssets || {}),
  };
  if (!levelAssets.top) levelAssets.top = STATIC_DEFAULT_ASSETS.top;
  if (!levelAssets.bottom) levelAssets.bottom = STATIC_DEFAULT_ASSETS.bottom;
}

function loadAll() {
  const shared = window.spotGameShared || {};
  const storedAssets = readJson(STORAGE_KEYS.levelAssets, {});
  levelConfig = shared.levelConfig || readJson(STORAGE_KEYS.levelConfig, null) || cloneDefaultLevel();
  levelAssets = { ...STATIC_DEFAULT_ASSETS, ...(storedAssets || {}), ...(shared.levelAssets || {}) };
  uiConfig = shared.uiConfig || readJson(STORAGE_KEYS.uiConfig, null);
  uiAssets = shared.uiAssets || {};
  ensurePlayableLevel();
}

function applySharedState(shared) {
  window.spotGameShared.levelConfig = shared?.levelConfig || null;
  window.spotGameShared.levelAssets = shared?.levelAssets || {};
  window.spotGameShared.uiConfig = shared?.uiConfig || null;
  window.spotGameShared.uiAssets = shared?.uiAssets || {};
  loadAll();
}

function requestState() {
  try {
    window.parent.postMessage({ type: "request-state" }, "*");
    statusText.textContent = "正在刷新配置...";
  } catch (error) {
    loadAll();
    renderEntry();
  }
}

function getScreen(id) {
  return uiConfig?.screens?.find((screen) => screen.id === id) || null;
}

function applyBox(node, element) {
  node.style.left = `${(element.x - element.w / 2) * 100}%`;
  node.style.top = `${(element.y - element.h / 2) * 100}%`;
  node.style.width = `${element.w * 100}%`;
  node.style.height = `${element.h * 100}%`;
  node.style.opacity = element.opacity ?? 1;
  node.style.fontSize = `${element.fontSize || 18}px`;
  node.style.backgroundColor = element.fillMode === "transparent" ? "transparent" : element.backgroundColor || "#ffffff";
  node.style.borderColor = element.borderEnabled === false ? "transparent" : element.borderColor || "rgba(38, 50, 56, 0.12)";
  node.style.color = element.textColor || "#263238";
}

function renderDecorElement(element, overrides = {}) {
  if (element.visible === false) return null;
  const node = document.createElement("div");
  node.className = `preview-node ${overrides.className || ""}`;
  node.dataset.id = element.id;
  node.dataset.type = element.type;
  applyBox(node, element);

  const imageName = element.image ? element.image.split("/").pop() : "";
  if (imageName && uiAssets[imageName]) {
    const img = document.createElement("img");
    img.className = "asset";
    img.src = uiAssets[imageName];
    img.alt = element.name || "";
    node.appendChild(img);
  }

  const label = document.createElement("span");
  label.className = "label";
  label.textContent = overrides.text ?? element.text ?? "";
  node.appendChild(label);
  return node;
}

function defaultEntryScreen() {
  return {
    id: "level-entry",
    elements: [
      { id: "entry-title", type: "text", text: "找茬游戏", x: 0.5, y: 0.16, w: 0.5, h: 0.08, opacity: 1, fontSize: 30, textColor: "#263238", backgroundColor: "transparent", visible: true },
      { id: "start-level", type: "button", text: "关卡 1", x: 0.5, y: 0.52, w: 0.5, h: 0.08, opacity: 1, fontSize: 22, textColor: "#ffffff", backgroundColor: "#1e88e5", visible: true },
    ],
  };
}

function defaultGameplayScreen() {
  return {
    id: "gameplay",
    elements: [
      { id: "level-title", type: "text", text: "关卡 1", x: 0.17, y: 0.035, w: 0.24, h: 0.04, opacity: 1, fontSize: 18, textColor: "#263238", backgroundColor: "transparent", visible: true },
      { id: "life", type: "text", text: "生命 5", x: 0.45, y: 0.035, w: 0.24, h: 0.04, opacity: 1, fontSize: 18, textColor: "#263238", backgroundColor: "transparent", visible: true },
      { id: "timer", type: "text", text: "05:00", x: 0.76, y: 0.035, w: 0.22, h: 0.04, opacity: 1, fontSize: 18, textColor: "#263238", backgroundColor: "transparent", visible: true },
      { id: "top-image", type: "image", text: "上图", x: 0.5, y: 0.28, w: 0.88, h: 0.27, opacity: 1, fontSize: 18, textColor: "#263238", backgroundColor: "#fbf2d9", fillMode: "transparent", borderEnabled: false, borderColor: "#d7b873", visible: true },
      { id: "bottom-image", type: "image", text: "下图", x: 0.5, y: 0.59, w: 0.88, h: 0.27, opacity: 1, fontSize: 18, textColor: "#263238", backgroundColor: "#fbf2d9", fillMode: "transparent", borderEnabled: false, borderColor: "#d7b873", visible: true },
      { id: "hint-button", type: "button", text: "提示", x: 0.5, y: 0.94, w: 0.28, h: 0.055, opacity: 1, fontSize: 18, textColor: "#ffffff", backgroundColor: "#1e88e5", visible: true },
    ],
  };
}

function clearTimer() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
}

function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function renderEntry() {
  clearTimer();
  canvas.innerHTML = "";
  const screen = getScreen("level-entry") || defaultEntryScreen();
  screen.elements.forEach((element) => {
    const node = renderDecorElement(element, {
      className: element.id === "start-level" ? "level-card" : "",
      text: element.id === "start-level" ? "关卡 1" : undefined,
    });
    if (!node) return;
    if (element.id === "start-level") {
      node.addEventListener("click", startLevel);
    }
    canvas.appendChild(node);
  });

  if (!screen.elements.some((element) => element.id === "start-level")) {
    const fallback = renderDecorElement(defaultEntryScreen().elements[1], { className: "level-card" });
    fallback.addEventListener("click", startLevel);
    canvas.appendChild(fallback);
  }

  statusText.textContent = levelConfig ? "已读取关卡配置。点击关卡 1 开始预览。" : "还没有关卡配置。请先在关卡编辑器保存。";
}

function startLevel() {
  loadAll();
  ensurePlayableLevel();

  clearTimer();
  run = {
    found: new Set(),
    lives: levelConfig.life || 5,
    timeLeft: levelConfig.timeLimitSec || 300,
    finished: false,
  };

  renderGameplay();
  timerId = setInterval(() => {
    if (!run || run.finished) return;
    run.timeLeft -= 1;
    updateHud();
    if (run.timeLeft <= 0) {
      showModal("时间耗尽", "观看视频恢复 90 秒", [
        ["增加时间", () => { run.timeLeft += 90; closeModal(); updateHud(); }],
        ["重新开始", startLevel],
      ]);
    }
  }, 1000);
}

function renderGameplay() {
  canvas.innerHTML = "";
  const screen = getScreen("gameplay") || defaultGameplayScreen();
  screen.elements.forEach((element) => {
    if (element.id === "top-image" || element.id === "bottom-image") {
      canvas.appendChild(renderPlayImage(element, element.id === "top-image" ? "top" : "bottom"));
      return;
    }

    let text = element.text;
    if (element.id === "level-title") text = levelConfig.title || "关卡 1";
    if (element.id === "life") text = `生命 ${run.lives}`;
    if (element.id === "timer") text = formatTime(run.timeLeft);
    const node = renderDecorElement(element, { text });
    if (node) canvas.appendChild(node);
  });
  updateHud();
}

function renderPlayImage(element, imageKey) {
  const board = document.createElement("div");
  board.className = "play-image";
  board.dataset.imageKey = imageKey;
  applyBox(board, element);
  board.style.borderColor = element.borderEnabled === false ? "transparent" : element.borderColor || "transparent";
  board.style.borderWidth = element.borderEnabled === false ? "0" : "1px";
  board.style.borderStyle = "solid";
  board.style.background = element.fillMode === "transparent" ? "transparent" : element.backgroundColor || "transparent";

  const img = document.createElement("img");
  img.src = imageKey === "top" ? levelAssets.top : levelAssets.bottom;
  img.alt = imageKey === "top" ? "上图" : "下图";
  board.appendChild(img);
  board.addEventListener("click", (event) => handleImageClick(event, board));
  return board;
}

function handleImageClick(event, board) {
  if (!run || run.finished) return;
  const rect = board.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width;
  const y = (event.clientY - rect.top) / rect.height;
  const hit = (levelConfig.differences || []).find((diff) => {
    if (run.found.has(diff.id)) return false;
    const dx = x - diff.x;
    const dy = y - diff.y;
    return Math.sqrt(dx * dx + dy * dy) <= diff.r;
  });

  if (hit) {
    run.found.add(hit.id);
    drawCircle(board, hit);
    updateHud();
    if (run.found.size >= (levelConfig.differences || []).length) {
      finishLevel();
    }
    return;
  }

  drawMiss(board, x, y);
  run.lives -= 1;
  updateHud();
  if (run.lives <= 0) {
    showModal("生命值耗尽", "观看视频恢复 5 生命值", [
      ["恢复生命", () => { run.lives = 5; closeModal(); updateHud(); }],
      ["重新开始", startLevel],
    ]);
  }
}

function drawCircle(board, diff) {
  const rect = board.getBoundingClientRect();
  const size = Math.min(rect.width, rect.height);
  const circle = document.createElement("div");
  circle.className = "circle";
  circle.style.left = `${diff.x * 100}%`;
  circle.style.top = `${diff.y * 100}%`;
  circle.style.width = `${diff.r * size * 2 * 1.3}px`;
  circle.style.height = `${diff.r * size * 2 * 1.3}px`;
  board.appendChild(circle);
}

function drawMiss(board, x, y) {
  const miss = document.createElement("div");
  miss.className = "miss";
  miss.textContent = "×";
  miss.style.left = `${x * 100}%`;
  miss.style.top = `${y * 100}%`;
  board.appendChild(miss);
  setTimeout(() => miss.remove(), 3000);
}

function updateHud() {
  canvas.querySelector('[data-id="life"] .label')?.replaceChildren(`生命 ${run?.lives ?? 0}`);
  canvas.querySelector('[data-id="timer"] .label')?.replaceChildren(formatTime(Math.max(0, run?.timeLeft ?? 0)));
  statusText.textContent = run
    ? `已找到 ${run.found.size}/${(levelConfig.differences || []).length}，生命 ${run.lives}，剩余 ${formatTime(Math.max(0, run.timeLeft))}`
    : "等待开始";
}

function finishLevel() {
  run.finished = true;
  clearTimer();
  canvas.querySelectorAll(".circle").forEach((circle, index) => {
    setTimeout(() => {
      circle.style.borderColor = "#f2b705";
      circle.style.background = "rgba(242, 183, 5, 0.22)";
    }, index * 180);
  });
  setTimeout(() => {
    showModal("恭喜胜利", "全部不同点都找到了", [["下一关", renderEntry]]);
  }, 3000);
}

function showModal(title, message, actions) {
  run.finished = true;
  const modal = document.createElement("div");
  modal.className = "toast";
  modal.innerHTML = `<h2>${title}</h2><p>${message}</p>`;
  actions.forEach(([label, handler]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.addEventListener("click", handler);
    modal.appendChild(button);
  });
  canvas.appendChild(modal);
}

function closeModal() {
  canvas.querySelector(".toast")?.remove();
  if (run) run.finished = false;
}

function refresh() {
  requestState();
}

refreshPreview.addEventListener("click", refresh);
resetRun.addEventListener("click", () => {
  if (run) {
    startLevel();
    return;
  }
  refresh();
});
window.addEventListener("message", (event) => {
  if (event.data?.type === "state-update") {
    applySharedState(event.data.state);
    renderEntry();
  }
  if (event.data?.type === "refresh-preview") refresh();
});

loadAll();
renderEntry();
requestState();
