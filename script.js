/**
 * 智能提词器 Pro - 完整逻辑
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
    btnZen: document.getElementById('btnZen'),
    btnTheme: document.getElementById('btnTheme'),
    btnMirror: document.getElementById('btnMirror'),
    btnFullscreen: document.getElementById('btnFullscreen'),
    btnNext: document.getElementById('btnNext'),
    btnPrev: document.getElementById('btnPrev'),
    statusText: document.getElementById('statusText'),
    speedControl: document.getElementById('speedControl'),
    speedValue: document.getElementById('speedValue'),
    fontSizeControl: document.getElementById('fontSizeControl')
};

// ==================== 核心滚动引擎 ====================
function scrollStep() {
    if (!appState.isPlaying) return;
    appState.scrollPosition += appState.speedLevel * appState.pixelsPerLevel;
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
    if (appState.animationId) cancelAnimationFrame(appState.animationId);
    dom.statusText.textContent = '已暂停';
}

function resetScrolling() {
    pauseScrolling();
    appState.scrollPosition = 0;
    dom.textDisplay.style.transform = 'translateY(0)';
    dom.statusText.textContent = '已重置';
}

// ==================== 完整事件绑定 ====================
dom.btnPlay.addEventListener('click', startScrolling);
dom.btnPause.addEventListener('click', pauseScrolling);
dom.btnReset.addEventListener('click', resetScrolling);

dom.speedControl.addEventListener('input', (e) => {
    appState.speedLevel = parseInt(e.target.value, 10);
    dom.speedValue.textContent = `${appState.speedLevel}x`;
});

if (dom.fontSizeControl) {
    dom.fontSizeControl.addEventListener('input', (e) => {
        document.documentElement.style.setProperty('--font-size', `${e.target.value}px`);
        dom.textDisplay.style.fontSize = `${e.target.value}px`;
    });
}

if (dom.btnZen) {
    dom.btnZen.addEventListener('click', () => {
        document.body.classList.toggle('zen-mode');
        dom.statusText.textContent = document.body.classList.contains('zen-mode') ? '专注模式：按 ESC 退出' : '已退出专注模式';
    });
}

if (dom.btnTheme) {
    dom.btnTheme.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        dom.statusText.textContent = document.body.classList.contains('light-theme') ? '已切换至浅色主题' : '已切换至深色主题';
    });
}

if (dom.btnMirror) {
    dom.btnMirror.addEventListener('click', () => {
        document.body.classList.toggle('mirror-mode');
        dom.statusText.textContent = document.body.classList.contains('mirror-mode') ? '镜像模式：适配分光镜' : '已退出镜像模式';
    });
}

function toggleFullscreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
}
if (dom.btnFullscreen) dom.btnFullscreen.addEventListener('click', toggleFullscreen);

// 段落跳转
function jumpToNext() {
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
function jumpToPrev() {
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
if (dom.btnNext) dom.btnNext.addEventListener('click', jumpToNext);
if (dom.btnPrev) dom.btnPrev.addEventListener('click', jumpToPrev);

// ==================== 键盘快捷键 ====================
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') { e.preventDefault(); appState.isPlaying ? pauseScrolling() : startScrolling(); }
    if (e.code === 'KeyF') toggleFullscreen();
    if (e.code === 'KeyR') resetScrolling();
    if (e.code === 'Escape' && document.body.classList.contains('zen-mode')) {
        document.body.classList.remove('zen-mode');
        dom.statusText.textContent = '已退出专注模式';
    }
    if (e.code === 'ArrowUp') { e.preventDefault(); appState.speedLevel = Math.min(appState.speedLevel + 1, 10); dom.speedControl.value = appState.speedLevel; dom.speedValue.textContent = `${appState.speedLevel}x`; }
    if (e.code === 'ArrowDown') { e.preventDefault(); appState.speedLevel = Math.max(appState.speedLevel - 1, 1); dom.speedControl.value = appState.speedLevel; dom.speedValue.textContent = `${appState.speedLevel}x`; }
    if (e.code === 'KeyN') jumpToNext();
    if (e.code === 'KeyP') jumpToPrev();
});

// ==================== 初始化 ====================
(function init() {
    dom.statusText.textContent = '已就绪';
    console.log('提词器 Pro 初始化完成');
})();
