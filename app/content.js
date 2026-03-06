// ==========================================
// 這個檔案是 Content Script (內容腳本)
// 它的作用是「嵌入」到使用者打開的特定網頁中 (這裡設定為 Google Translate)
// ==========================================

console.log("Extension loaded: Google Translate Audio Looper (Minimal Edition)");

// ==========================================
// 1. 建立 UI 介面：一個包含四個按鈕的控制面板
// ==========================================
const container = document.createElement("div");
container.id = "custom-audio-controller";

// 面板標題與拖曳把手
const titleHandle = document.createElement("div");
titleHandle.className = "panel-drag-handle";
titleHandle.innerText = "≡ Audio Looper";
container.appendChild(titleHandle);

// --- 建立按鈕群組容器，讓排版更緊湊 ---
const sourceGroup = document.createElement("div");
sourceGroup.className = "btn-group";

const sourcePlayBtn = document.createElement("button");
sourcePlayBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> Source`;
sourcePlayBtn.title = "Loop source audio";
sourcePlayBtn.className = "custom-btn play-btn play-btn-source";

const targetPlayBtn = document.createElement("button");
targetPlayBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> Target`;
targetPlayBtn.title = "Loop translated audio";
targetPlayBtn.className = "custom-btn play-btn play-btn-target";

const stopBtn = document.createElement("button");
stopBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16"></rect></svg> Stop`;
stopBtn.title = "Stop playback";
stopBtn.className = "custom-btn stop-btn";
stopBtn.disabled = true;

sourceGroup.appendChild(sourcePlayBtn);
sourceGroup.appendChild(targetPlayBtn);
sourceGroup.appendChild(stopBtn);

// 將群組加入面板
container.appendChild(sourceGroup);



// 將面板掛載到網頁中
document.body.appendChild(container);


// ==========================================
// 2. 核心邏輯變數
// ==========================================
let loopIntervalSource = null;
let loopIntervalTarget = null;
let isLoopingSource = false;
let isLoopingTarget = false;

// 面板拖曳相關變數
let isDragging = false;
let startX, startY, initialX, initialY;

// ==========================================
// 3. 輔助函式區
// ==========================================

// 取得 Google 翻譯畫面上的「原生語音播放按鈕」
function getNativePlayButtons() {
    return document.querySelectorAll(
      'button[aria-label*="Listen"], button[aria-label*="聆聽"], button[data-tooltip*="Listen"], button[data-tooltip*="聆聽"], button[aria-label*="Stop"], button[aria-label*="停止"]'
    );
}

// 判斷某個按鈕是否「正在播放中」
function isPlaying(btn) {
    if (!btn) return false;
    const ariaLabel = btn.getAttribute("aria-label") || "";
    const ariaPressed = btn.getAttribute("aria-pressed") === "true";
    return ariaPressed || ariaLabel.includes("Stop") || ariaLabel.includes("停止");
}

// 停止【原文】的循環與播放
function stopSourceLoop() {
    if (!isLoopingSource) return;
    isLoopingSource = false;
    sourcePlayBtn.disabled = false;
    
    clearInterval(loopIntervalSource);
    
    const buttons = getNativePlayButtons();
    if (buttons && buttons.length > 0 && isPlaying(buttons[0])) {
        buttons[0].click();
    }
}

// 停止【翻譯】的循環與播放
function stopTargetLoop() {
    if (!isLoopingTarget) return;
    isLoopingTarget = false;
    targetPlayBtn.disabled = false;

    clearInterval(loopIntervalTarget);
    
    const buttons = getNativePlayButtons();
    if (buttons && buttons.length > 1 && isPlaying(buttons[1])) {
        buttons[1].click();
    }
}

// 啟動循環播放的計時器
function startLoop(type) {
    const isSource = type === 'source';
    const btnIndex = isSource ? 0 : 1;
    
    return setInterval(() => {
        const buttons = getNativePlayButtons();
        if (buttons && buttons.length > btnIndex) {
            const btn = buttons[btnIndex];
            if (!isPlaying(btn)) {
                btn.click();
            }
        }
    }, 1000); // 1秒檢查一次
}


// ==========================================
// 4. 按鈕事件綁定 (加入互斥邏輯)
// ==========================================

// 監聽全域鍵盤事件
document.addEventListener("keydown", (e) => {
    // 為了避免在輸入框輸入文字時觸發，我們可以檢查 focus 狀態
    const activeTagName = document.activeElement ? document.activeElement.tagName.toLowerCase() : "";
    if (activeTagName === "input" || activeTagName === "textarea") {
        return; // 在輸入框內時不觸發捷徑
    }

    const key = e.key.toLowerCase(); // 轉成小寫方便判斷大小寫

    if (key === "i") {
        // I: 切換原文播放/停止
        if (isLoopingSource) {
            stopSourceLoop();
        } else {
            sourcePlayBtn.click();
        }
    } else if (key === "o") {
        // O: 切換翻譯播放/停止
        if (isLoopingTarget) {
            stopTargetLoop();
        } else {
            targetPlayBtn.click();
        }
    } else if (key === "p") {
        // P: 停止所有播放
        stopSourceLoop();
        stopTargetLoop();
    }
});

// ==========================================
// 5. 面板拖曳邏輯 (Draggable + 邊緣吸附)
// ==========================================
titleHandle.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    
    // 取得元件目前的偏移量
    const rect = container.getBoundingClientRect();
    initialX = rect.left;
    initialY = rect.top;
    
    // 防止選取文字
    e.preventDefault(); 
    
    // 拖曳時暫時移除動畫，避免卡頓
    container.style.transition = 'none';
});

document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    
    // 計算新的左上角位置
    let newLeft = initialX + dx;
    let newTop = initialY + dy;
    
    // --- 確保面板不會超出視窗外部 ---
    const rect = container.getBoundingClientRect();
    const maxLeft = window.innerWidth - rect.width;
    const maxTop = window.innerHeight - rect.height;
    
    if (newLeft < 0) newLeft = 0;
    if (newTop < 0) newTop = 0;
    if (newLeft > maxLeft) newLeft = maxLeft;
    if (newTop > maxTop) newTop = maxTop;
    
    container.style.bottom = 'auto'; // 取消底邊綁定
    container.style.right = 'auto'; // 取消右邊綁定
    container.style.left = `${newLeft}px`;
    container.style.top = `${newTop}px`;
    
    // --- 視覺吸附提示 (Dynamic Snap Indicator) ---
    const SNAP_THRESHOLD = 150;
    
    // 計算到達各邊的距離
    const distLeft = newLeft;
    const distRight = window.innerWidth - (newLeft + rect.width);
    const distTop = newTop;
    const distBottom = window.innerHeight - (newTop + rect.height);
    
    // 先移除所有提示 class
    container.classList.remove('snap-left', 'snap-right', 'snap-top', 'snap-bottom');
    
    // 找出哪個邊緣最近
    const minD = Math.min(distLeft, distRight, distTop, distBottom);
    if (minD < SNAP_THRESHOLD) {
        if (minD === distLeft) container.classList.add('snap-left');
        else if (minD === distRight) container.classList.add('snap-right');
        else if (minD === distTop) container.classList.add('snap-top');
        else if (minD === distBottom) container.classList.add('snap-bottom');
    }
});

document.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    
    // 動畫恢復
    container.style.transition = 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)';
    
    // 移除所有的視覺提示 class
    container.classList.remove('snap-left', 'snap-right', 'snap-top', 'snap-bottom');
    
    // --- 邊緣吸附 (Snap to Edge) 邏輯 ---
    const rect = container.getBoundingClientRect();
    const SNAP_THRESHOLD = 150; // 距離邊緣 150px 內就會啟動吸附
    
    // 計算到達各邊的距離
    const distLeft = rect.left;
    const distRight = window.innerWidth - rect.right;
    const distTop = rect.top;
    const distBottom = window.innerHeight - rect.bottom;
    
    // 找出哪個邊緣最近
    const minD = Math.min(distLeft, distRight, distTop, distBottom);
    
    // 如果最近的距離小於閾值，就吸附過去
    if (minD < SNAP_THRESHOLD) {
        if (minD === distLeft) {
            container.style.left = '0px';
        } else if (minD === distRight) {
            container.style.left = `${window.innerWidth - rect.width}px`;
        } else if (minD === distTop) {
            container.style.top = '0px';
        } else if (minD === distBottom) {
            container.style.top = `${window.innerHeight - rect.height}px`;
        }
    }
});

// ▶️ 【原文】循環播放
sourcePlayBtn.addEventListener("click", () => {
    if (isLoopingSource) return;
    
    // 互斥邏輯：如果【翻譯】正在播放，先把它停掉！
    if (isLoopingTarget) {
        stopTargetLoop();
    }
    
    isLoopingSource = true;
    sourcePlayBtn.disabled = true;
    stopBtn.disabled = false;
    
    const buttons = getNativePlayButtons();
    if (buttons && buttons.length > 0 && !isPlaying(buttons[0])) {
        buttons[0].click();
    }
    loopIntervalSource = startLoop('source');
});

// ▶️ 【翻譯後】循環播放
targetPlayBtn.addEventListener("click", () => {
    if (isLoopingTarget) return;
    
    // 互斥邏輯：如果【原文】正在播放，先把它停掉！
    if (isLoopingSource) {
        stopSourceLoop();
    }
    
    isLoopingTarget = true;
    targetPlayBtn.disabled = true;
    stopBtn.disabled = false;
    
    const buttons = getNativePlayButtons();
    if (buttons && buttons.length > 1 && !isPlaying(buttons[1])) {
        buttons[1].click();
    }
    loopIntervalTarget = startLoop('target');
});

// ⏹️ 停止按鈕 (統一)
stopBtn.addEventListener("click", () => {
    stopSourceLoop();
    stopTargetLoop();
    stopBtn.disabled = true;
});
