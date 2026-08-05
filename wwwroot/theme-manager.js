/*
   fellas comparation - theme-manager.js
*/

const THEME_STORAGE_KEY = 'theme';
const THEME_TRANSITION_FADE_MS = 220;
const THEME_TRANSITION_HOLD_MS = 70;
const THEME_TRANSITION_REVEAL_MS = 280;

const THEMES = [
    {
        id: 'cyberpunk',
        label: 'Cyberpunk'
    },
    {
        id: 'heaven',
        label: 'Heaven'
    },
    {
        id: 'crimson',
        label: 'Crimson Night'
    }
];

function getTheme(themeId) {
    return THEMES.find(theme => theme.id === themeId) || THEMES[0];
}

function canUseLockedThemes() {
    const host = window.location.hostname;
    return host === 'localhost'
        || host === '127.0.0.1'
        || host === '::1'
        || host.endsWith('.local');
}

function isThemeLocked(theme) {
    return Boolean(theme?.locked) && !canUseLockedThemes();
}

function getPublicTheme(themeId) {
    const theme = getTheme(themeId);
    return isThemeLocked(theme) ? THEMES[0] : theme;
}

function showThemeLockedNotice(theme) {
    const message = theme?.lockedMessage || 'This theme is not available yet.';
    let notice = document.getElementById('theme-locked-notice');

    if (!notice) {
        notice = document.createElement('div');
        notice.id = 'theme-locked-notice';
        notice.className = 'theme-locked-notice';
        notice.setAttribute('role', 'status');
        notice.setAttribute('aria-live', 'polite');
        document.body.appendChild(notice);
    }

    notice.textContent = message;
    notice.classList.remove('is-visible');
    window.clearTimeout(showThemeLockedNotice.hideTimer);
    requestAnimationFrame(() => notice.classList.add('is-visible'));
    showThemeLockedNotice.hideTimer = window.setTimeout(() => {
        notice.classList.remove('is-visible');
    }, 3200);
}

function waitThemeFrame(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function isThemeShareMode() {
    return new URLSearchParams(window.location.search).has('share');
}

function shouldReduceThemeMotion() {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

function getThemeTransitionOverlay() {
    let overlay = document.getElementById('theme-transition-overlay');
    if (overlay) return overlay;

    overlay = document.createElement('div');
    overlay.id = 'theme-transition-overlay';
    overlay.className = 'theme-transition-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = `
        <div class="theme-transition-scan"></div>
        <div class="theme-transition-flash"></div>
    `;
    document.body.appendChild(overlay);
    return overlay;
}

function syncThemeControls(themeId) {
    document.querySelectorAll('.theme-option').forEach(option => {
        option.classList.toggle('active', option.dataset.theme === themeId);
    });

    document.querySelectorAll('#theme-select, [data-theme-select], .compare-duel-theme select').forEach(select => {
        ensureThemeOption(select, themeId);
        if (select.value !== themeId) select.value = themeId;
    });
}

function getSelectableThemes(activeThemeId = '') {
    return THEMES.filter(theme => !theme.hidden || theme.id === activeThemeId);
}

function renderThemeOptions(activeThemeId = '') {
    return getSelectableThemes(activeThemeId)
        .map(theme => {
            const locked = isThemeLocked(theme);
            const label = locked ? (theme.lockedLabel || `${theme.label} 🔒`) : theme.label;
            return `<option class="theme-option" value="${theme.id}" data-theme="${theme.id}"${locked ? ' data-locked="true"' : ''}>${label}</option>`;
        })
        .join('');
}

function ensureThemeOption(select, themeId) {
    if (!select || [...select.options].some(option => option.value === themeId)) return;

    const theme = THEMES.find(item => item.id === themeId);
    if (!theme) return;
    const locked = isThemeLocked(theme);
    const label = locked ? (theme.lockedLabel || `${theme.label} 🔒`) : theme.label;

    select.insertAdjacentHTML(
        'beforeend',
        `<option class="theme-option" value="${theme.id}" data-theme="${theme.id}"${locked ? ' data-locked="true"' : ''}>${label}</option>`
    );
}

function applyTheme(themeId) {
    const theme = getPublicTheme(themeId);
    document.documentElement.dataset.theme = theme.id;
    localStorage.setItem(THEME_STORAGE_KEY, theme.id);
    syncThemeControls(theme.id);
    return theme.id;
}

let themeTransitionPromise = Promise.resolve();

function switchTheme(themeId) {
    const theme = getTheme(themeId);
    const currentTheme = document.documentElement.dataset.theme || localStorage.getItem(THEME_STORAGE_KEY) || THEMES[0].id;

    if (isThemeLocked(theme)) {
        showThemeLockedNotice(theme);
        syncThemeControls(currentTheme);
        return Promise.resolve(currentTheme);
    }

    if (theme.id === currentTheme || isThemeShareMode() || shouldReduceThemeMotion()) {
        return Promise.resolve(applyTheme(theme.id));
    }

    themeTransitionPromise = themeTransitionPromise
        .catch(() => undefined)
        .then(() => runThemeTransition(theme.id));

    return themeTransitionPromise;
}

async function runThemeTransition(themeId) {
    const overlay = getThemeTransitionOverlay();
    const root = document.documentElement;

    overlay.dataset.nextTheme = themeId;
    root.classList.add('theme-transitioning');
    overlay.classList.remove('is-revealing');
    overlay.classList.add('is-active');

    await waitThemeFrame(THEME_TRANSITION_FADE_MS);
    applyTheme(themeId);
    await waitThemeFrame(THEME_TRANSITION_HOLD_MS);

    overlay.classList.add('is-revealing');
    overlay.classList.remove('is-active');
    await waitThemeFrame(THEME_TRANSITION_REVEAL_MS);

    overlay.classList.remove('is-revealing');
    root.classList.remove('theme-transitioning');

    return themeId;
}

function initThemeSelector() {
    const select = document.getElementById('theme-select');
    if (!select) return;

    const storedTheme = getPublicTheme(localStorage.getItem(THEME_STORAGE_KEY) || THEMES[0].id);
    select.innerHTML = renderThemeOptions(storedTheme.id);

    select.dataset.themeSelect = 'true';
    select.addEventListener('change', () => switchTheme(select.value));
    applyTheme(storedTheme.id);
}

initThemeSelector();
