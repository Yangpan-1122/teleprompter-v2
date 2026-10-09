/**
 * 智能提词器核心逻辑
 * 使用 requestAnimationFrame 实现平滑滚动
 */

// ==================== 全局状态管理 ====================
const appState = {
    isPlaying: false,
    speedLevel: 5,
    scrollPosition: 0,
    animationId: null,
    pixelsPerLevel: 0.25,
};

// ==================== DOM 元素缓存 ====================
const dom = {
    textDisplay: document.getElementById('textDisplay'),
    prompterArea: document.getElementById('prompterArea'),
    btnPlay: document.getElementById('btnPlay'),
    btnPause: document.getElementById('btnPause'),
    btnReset: document.getElementById('btnReset'),
    speedControl: document.getElementById('speedControl'),
    speedValue: document.getElementById('speedValue'),
    statusText: document.getElementById('statusText'),
};

// ==================== 工具函数 ====================

/**
 * 更新状态栏文字及颜色
 */
function updateStatus(text, className) {
    dom.statusText.textContent = text;
    dom.statusText.className = className;
}

/**
 * 计算最大可滚动距离
 */
function getMaxScrollDistance() {
    return Math.max(0, dom.textDisplay.scrollHeight - dom.prompterArea.clientHeight);
}

/**
 * 应用当前滚动位置到 DOM
 */
function applyTransform() {
    dom.textDisplay.style.transform = `translateY(-${appState.scrollPosition}px)`;
}

// ==================== 核心滚动引擎 ====================

function scrollStep() {
    if (!appState.isPlaying) return;

    const pixelsPerFrame = appState.speedLevel * appState.pixelsPerLevel;
    appState.scrollPosition += pixelsPerFrame;

    const maxScroll = getMaxScrollDistance();

    if (appState.scrollPosition >= maxScroll) {
        appState.scrollPosition = maxScroll;
        applyTransform();
        pauseScrolling();
        updateStatus('已到底部', 'status-paused');
        return;
    }

    applyTransform();
    appState.animationId = requestAnimationFrame(scrollStep);
}

function startScrolling() {
    if (appState.isPlaying) return;
    if (appState.scrollPosition >= getMaxScrollDistance()) {
        updateStatus('已到底部，请重置', 'status-paused');
        return;
    }
    appState.isPlaying = true;
    updateStatus('正在滚动...', 'status-running');
    appState.animationId = requestAnimationFrame(scrollStep);
}

function pauseScrolling() {
    appState.isPlaying = false;
    if (appState.animationId) {
        cancelAnimationFrame(appState.animationId);
        appState.animationId = null;
    }
    updateStatus('已暂停', 'status-paused');
}

function resetScrolling() {
    pauseScrolling();
    appState.scrollPosition = 0;
    applyTransform();
    updateStatus('已重置', 'status-ready');
}

function setSpeedLevel(level) {
    appState.speedLevel = level;
    dom.speedValue.textContent = `${level}x`;
    dom.speedControl.value = level;
}

// ==================== 事件绑定与初始化 ====================

dom.btnPlay.addEventListener('click', startScrolling);
dom.btnPause.addEventListener('click', pauseScrolling);
dom.btnReset.addEventListener('click', resetScrolling);

dom.speedControl.addEventListener('input', (e) => {
    setSpeedLevel(parseInt(e.target.value, 10));
});

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        if (appState.isPlaying) pauseScrolling();
        else startScrolling();
    }
    if (e.code === 'ArrowUp') {
        e.preventDefault();
        setSpeedLevel(Math.min(appState.speedLevel + 1, 10));
    }
    if (e.code === 'ArrowDown') {
        e.preventDefault();
        setSpeedLevel(Math.max(appState.speedLevel - 1, 1));
    }
    if (e.code === 'KeyR') {
        resetScrolling();
    }
});

// 初始化
(function init() {
    setSpeedLevel(appState.speedLevel);
    updateStatus('已就绪', 'status-ready');
    console.log('提词器初始化完成，当前速度等级:', appState.speedLevel);
})();
