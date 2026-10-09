/**
 * 智能提词器 Pro - 核心逻辑
 */

// ==================== 全局状态管理 ====================
const appState = {
    isPlaying: false,
    speedLevel: 5,
    scrollPosition: 0,
    animationId: null,
    pixelsPerLevel: 0.25
};

// ==================== DOM 元素缓存 ====================
const dom = {
    textDisplay: document.getElementById('textDisplay'),
    prompterArea: document.getElementById('prompterArea'),
    btnPlay: document.getElementById('btnPlay'),
    btnPause: document.getElementById('btnPause'),
    btnReset: document.getElementById('btnReset'),
    statusText: document.getElementById('statusText'),
    speedControl: document.getElementById('speedControl'),
    speedValue: document.getElementById('speedValue'),
    fontSizeControl: document.getElementById('fontSizeControl'),
    btnZen: document.getElementById('btnZen'),
    btnTheme: document.getElementById('btnTheme'),
    btnMirror: document.getElementById('btnMirror'),
    btnFullscreen: document.getElementById('btnFullscreen')
};

// ==================== 核心滚动引擎 ====================
function scrollStep() {
    if (!appState.isPlaying) return;

    const pixelsPerFrame = appState.speedLevel * appState.pixelsPerLevel;
    appState.scrollPosition += pixelsPerFrame;

    const maxScroll = dom.textDisplay.scrollHeight - dom.prompterArea.clientHeight;

    if (appState.scrollPosition >= maxScroll) {
        appState.scrollPosition = maxScroll;
        dom.textDisplay.style.transform = `translateY(-${appState.scrollPosition}px)`;
        pauseScrolling();
        dom.statusText.textContent = '已到底部';
        return;
    }

    dom.textDisplay.style.transform = `translateY(-${appState.scrollPosition}px)`;
    appState.animationId = requestAnimationFrame(scrollStep);
}

function startScrolling() {
    if (appState.isPlaying) return;
    appState.isPlaying = true;
    dom.statusText.textContent = '正在滚动...';
    appState.animationId = requestAnimationFrame(scrollStep);
}

function pauseScrolling() {
    appState.isPlaying = false;
    if (appState.animationId) {
        cancelAnimationFrame(appState.animationId);
        appState.animationId = null;
    }
    dom.statusText.textContent = '已暂停';
}

function resetScrolling() {
    pauseScrolling();
    appState.scrollPosition = 0;
    dom.textDisplay.style.transform = 'translateY(0)';
    dom.statusText.textContent = '已重置';
}

// ==================== 事件绑定 ====================

// 基础控制
dom.btnPlay.addEventListener('click', startScrolling);
dom.btnPause.addEventListener('click', pauseScrolling);
dom.btnReset.addEventListener('click', resetScrolling);

// 速度控制
dom.speedControl.addEventListener('input', (e) => {
    appState.speedLevel = parseInt(e.target.value, 10);
    dom.speedValue.textContent = `${appState.speedLevel}x`;
});

// 字体大小调节
if (dom.fontSizeControl) {
    dom.fontSizeControl.addEventListener('input', (e) => {
        document.documentElement.style.setProperty('--font-size', `${e.target.value}px`);
        dom.textDisplay.style.fontSize = `${e.target.value}px`;
    });
}

// 专注模式
if (dom.btnZen) {
    dom.btnZen.addEventListener('click', () => {
        document.body.classList.toggle('zen-mode');
    });
}

// 主题切换
if (dom.btnTheme) {
    dom.btnTheme.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
    });
}

// ==================== 镜像模式（整合版） ====================
if (dom.btnMirror) {
    dom.btnMirror.addEventListener('click', () => {
        document.body.classList.toggle('mirror-mode');
    });
}

// 全屏模式
if (dom.btnFullscreen) {
    dom.btnFullscreen.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    });
}

// ==================== 键盘快捷键 ====================
document.addEventListener('keydown', (e) => {
    // 空格：播放/暂停
    if (e.code === 'Space') {
        e.preventDefault();
        if (appState.isPlaying) pauseScrolling();
        else startScrolling();
    }

    // F：全屏
    if (e.code === 'KeyF') {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen();
        else document.exitFullscreen();
    }

    // R：重置
    if (e.code === 'KeyR') {
        resetScrolling();
    }

    // 上下键：调速
    if (e.code === 'ArrowUp') {
        e.preventDefault();
        appState.speedLevel = Math.min(appState.speedLevel + 1, 10);
        dom.speedControl.value = appState.speedLevel;
        dom.speedValue.textContent = `${appState.speedLevel}x`;
    }
    if (e.code === 'ArrowDown') {
        e.preventDefault();
        appState.speedLevel = Math.max(appState.speedLevel - 1, 1);
        dom.speedControl.value = appState.speedLevel;
        dom.speedValue.textContent = `${appState.speedLevel}x`;
    }

    // ==================== 段落跳转（N/P） ====================
    if (e.code === 'KeyN') {
        const paragraphs = dom.textDisplay.querySelectorAll('p');
        const currentScroll = appState.scrollPosition;
        for (let p of paragraphs) {
            if (p.offsetTop > currentScroll + 50) {
                appState.scrollPosition = p.offsetTop - 50;
                dom.textDisplay.style.transform = `translateY(-${appState.scrollPosition}px)`;
                break;
            }
        }
    }

    if (e.code === 'KeyP') {
        const paragraphs = dom.textDisplay.querySelectorAll('p');
        const currentScroll = appState.scrollPosition;
        for (let i = paragraphs.length - 1; i >= 0; i--) {
            if (paragraphs[i].offsetTop < currentScroll - 50) {
                appState.scrollPosition = paragraphs[i].offsetTop - 50;
                dom.textDisplay.style.transform = `translateY(-${appState.scrollPosition}px)`;
                break;
            }
        }
    }
});

// ==================== 初始化 ====================
(function init() {
    if (dom.speedValue) dom.speedValue.textContent = `${appState.speedLevel}x`;
    if (dom.statusText) dom.statusText.textContent = '已就绪';
    console.log('提词器初始化完成');
})();
