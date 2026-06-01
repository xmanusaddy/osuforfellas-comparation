/*
   fellas comparation - theme-manager.js
*/

const THEME_STORAGE_KEY = 'theme';

const THEMES = [
    {
        id: 'cyberpunk',
        label: 'Cyberpunk'
    }
];

function getTheme(themeId) {
    return THEMES.find(theme => theme.id === themeId) || THEMES[0];
}

function applyTheme(themeId) {
    const theme = getTheme(themeId);
    document.documentElement.dataset.theme = theme.id;
    localStorage.setItem(THEME_STORAGE_KEY, theme.id);

    document.querySelectorAll('.theme-option').forEach(option => {
        option.classList.toggle('active', option.dataset.theme === theme.id);
    });

    const select = document.getElementById('theme-select');
    if (select) select.value = theme.id;
}

function initThemeSelector() {
    const select = document.getElementById('theme-select');
    if (!select) return;

    select.innerHTML = THEMES
        .map(theme => `<option class="theme-option" value="${theme.id}" data-theme="${theme.id}">${theme.label}</option>`)
        .join('');

    select.addEventListener('change', () => applyTheme(select.value));
    applyTheme(localStorage.getItem(THEME_STORAGE_KEY) || THEMES[0].id);
}

initThemeSelector();
