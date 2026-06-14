/* ══════════════════════════════════════
   fellas comparation — script.js
   ══════════════════════════════════════ */

// ══ IDIOMAS ══
let currentLang = localStorage.getItem('lang') || 'es';
const FRIEND_FAVORITES_STORAGE_KEY = 'osu_friend_favorites';
const RECENT_COMPARISONS_STORAGE_KEY = 'osu_recent_comparisons';
const FAVORITE_COMPARISONS_STORAGE_KEY = 'osu_favorite_comparisons';
const COMPARISON_HISTORY_LIMIT = 20;
const DEFAULT_TOP_PLAYS_LIMIT = 10;
const MAX_TOP_PLAYS_LIMIT = 20;
const ROOM_SCORES_REFRESH_INTERVAL_MS = 90000;
const playerProfileCache = new Map();
const topPlaysCache = new Map();
const recentPlaysCache = new Map();
const MOD_FULL_NAMES = {
    NM: 'No Mod',
    NF: 'No Fail',
    EZ: 'Easy',
    TD: 'Touch Device',
    HD: 'Hidden',
    HR: 'Hard Rock',
    SD: 'Sudden Death',
    PF: 'Perfect',
    DT: 'Double Time',
    NC: 'Nightcore',
    HT: 'Half Time',
    FL: 'Flashlight',
    SO: 'Spun Out',
    AP: 'Autopilot',
    RX: 'Relax',
    AT: 'Auto',
    CN: 'Cinema',
    V2: 'ScoreV2',
    SV2: 'ScoreV2',
    MR: 'Mirror',
    CL: 'Classic',
    RD: 'Random',
    DA: 'Difficulty Adjust',
    TC: 'Traceable',
    BL: 'Blinds',
    ST: 'Strict Tracking',
    AC: 'Accuracy Challenge',
    WU: 'Wind Up',
    WD: 'Wind Down'
};

const LANGS = {
    es: {
        search: '▶ BUSCAR JUGADORES',
        compareFriends: '▶ COMPARAR AMIGOS',
        loading: 'Cargando...',
        updated: 'Actualizado',
        refresh: '⟳ Actualizar',
        refreshing: '⟳ Actualizando...',
        leader: '👑 Líder',
        back: '← Volver',
        theme: 'Tema',
        createdBy: 'creado por',
        rooms: {
            compare: 'Comparar',
            friends: 'Amigos',
            history: 'Historial',
            back: '← Volver',
            backToComparison: '← Volver a comparación',
            friendsTitle: 'Amigos',
            friendsCopy: 'Aquí vivirá una vista amplia para buscar, filtrar y organizar amigos sin cargar la pantalla principal.',
            friendsRoomCopy: 'Busca, marca favoritos y selecciona hasta 4 amigos para compararlos desde una vista con más espacio.',
            totalFriends: 'Amigos totales',
            favoriteFriends: 'Favoritos',
            selectedFriends: 'Seleccionados',
            compareSelected: 'Comparar seleccionados',
            noSelectedFriends: 'Selecciona amigos para preparar una comparación.',
            loginForFriends: 'Inicia sesión con osu! para ver tu lista de amigos.',
            historyTitle: 'Historial',
            historyCopy: 'Aquí vivirá una vista amplia para revisar comparaciones recientes y favoritas con más espacio.',
            historyRoomCopy: 'Revisa comparaciones anteriores, marca favoritas y recupera jugadores recientes sin ensuciar la pantalla principal.',
            recentComparisons: 'Comparaciones recientes',
            favoriteComparisons: 'Comparaciones favoritas',
            recentPlayers: 'Jugadores recientes',
            noRecentPlayers: 'Sin jugadores recientes',
            loadPlayer: 'Cargar jugador',
            playerTitle: 'Perfil de jugador',
            playerCopy: 'Vista extendida de {player}, con resumen visual, top play y accesos rápidos.',
            loadingProfile: 'Cargando perfil...',
            profileError: 'No se pudo cargar el perfil',
            noPlayerSelected: 'Selecciona un jugador para abrir su perfil extendido.',
            viewFullProfile: 'Ver perfil completo',
            viewTopPlays: 'Ver Top Plays',
            viewRecent: 'Ver jugadas recientes',
            openOsuProfile: 'Abrir perfil en osu!',
            topPlaysTitle: 'Top Plays',
            topPlaysCopy: 'Las mejores jugadas de {player}, con resumen de PP, accuracy, mods y cliente usado.',
            loadingTopPlays: 'Cargando top plays...',
            topPlaysError: 'No se pudieron cargar los top plays',
            topPlaysLoaded: 'Top plays cargadas',
            averagePp: 'PP promedio',
            averageAccuracy: 'Accuracy promedio',
            mostUsedMod: 'Mod más usado',
            noMod: 'Sin mod',
            backToProfile: '← Volver al perfil',
            refreshPlays: 'Actualizar jugadas',
            recentTitle: 'Jugadas recientes',
            recentCopy: 'Jugadas recientes de {player}, con fecha, rank, accuracy, mods y cliente usado.',
            loadingRecentPlays: 'Cargando jugadas recientes...',
            recentPlaysError: 'No se pudieron cargar las jugadas recientes',
            recentPlaysLoaded: 'Jugadas recientes cargadas',
            latestPlay: 'Última jugada',
            noRecentPlays: 'Sin jugadas recientes',
            openCompare: 'Ir a comparar'
        },
        loginOsu: 'Iniciar sesión con osu!',
        logout: 'Cerrar sesión',
        connectedAs: 'Conectado como',
        loginError: 'Error al iniciar sesión',
        friendsTitle: 'Amigos',
        favoritesTitle: 'Favoritos',
        friendsLoading: 'Cargando amigos...',
        friendsError: 'Error al cargar amigos',
        friendsEmpty: 'No hay amigos para mostrar',
        favoritesEmpty: 'Sin favoritos todavía',
        friendsNoResults: 'No se encontraron amigos',
        friendsSearch: 'Buscar amigos...',
        favoritesSearch: 'Buscar favoritos...',
        friendsUnknownCountry: 'País no disponible',
        historyTitle: 'Historial',
        comparisonFavoritesTitle: 'Favoritos',
        historySearch: 'Buscar historial...',
        comparisonFavoritesSearch: 'Buscar favoritos...',
        historyEmpty: 'Sin comparaciones recientes',
        comparisonFavoritesEmpty: 'Sin comparaciones favoritas',
        historyNoResults: 'No se encontraron comparaciones',
        fillComparison: 'Rellenar comparación',
        rerunComparison: 'Repetir comparación',
        focusBtn: '⤢',
        playedOnLazer: 'Jugado en Lazer',
        playedOnStable: 'Jugado en Stable',
        openMap: '↗ VER BEATMAP EN OSU!',
        topPlay: 'TOP PLAY',
        ppGained: 'PP GANADOS',
        noTopPlay: 'Sin top play',
        misses: 'Misses',
        missSingular: 'miss',
        missPlural: 'misses',
        chokeOneMiss: '1 miss choke',
        chokeHighAcc: 'Choke de alta acc',
        chokeComboDrop: 'Combo drop',
        downloadReplay: 'Descargar Replay',
        replayUnavailable: 'Replay no disponible',
        clickToExpand: 'CLICK PARA EXPANDIR',
        activityNow: '🟢 Activo ahora',
        activityMin: '⏱ Activo hace {n} min',
        activityHour: '⏱ Activo hace {n} h',
        activityDay: '⏱ Activo hace {n} días',
        activityMonth: '⏱ Activo hace {n} meses',
        peakRank: 'PEAK RANK',
        trend90: 'Últimos 90 días',
        trendStable: '→ Sin cambios',
        errors: {
            userNotFound: 'Jugador "{user}" no encontrado',
            one: 'Un jugador no fue encontrado',
            two: 'Dos jugadores no fueron encontrados',
            all: 'Ningún jugador fue encontrado',
            mixed: 'No se puede comparar: hay jugadores inválidos'
        },
        players: { one: 'jugador', many: 'jugadores' },
        modes: { osu: 'osu!', taiko: 'osu!Taiko', fruits: 'osu!Catch', mania: 'osu!Mania' },
        compare: {
            ppLead: 'Ventaja PP',
            ppLeadVs: 'contra {player}',
            bestAcc: 'Mejor precisión',
            playCount: 'Partidas jugadas',
            bestTopPlay: 'Mejor Top Play'
        },
        stats: {
            pp: 'Performance Points',
            acc: 'Precisión',
            playcount: 'Partidas',
            playtime: 'Tiempo jugado',
            score: 'Score total',
            global: 'Global',
            country: 'País',
            level: 'Nivel',
            accuracy: 'Accuracy',
            maxCombo: 'Max Combo',
            rank: 'Rank',
            date: 'Fecha',
            misses: 'Misses'
        }
    },
    en: {
        search: '▶ SEARCH PLAYERS',
        compareFriends: '▶ COMPARE FRIENDS',
        loading: 'Loading...',
        updated: 'Updated',
        refresh: '⟳ Refresh',
        refreshing: '⟳ Refreshing...',
        leader: '👑 Leader',
        back: '← Back',
        theme: 'Theme',
        createdBy: 'created by',
        rooms: {
            compare: 'Compare',
            friends: 'Friends',
            history: 'History',
            back: '← Back',
            backToComparison: '← Back to comparison',
            friendsTitle: 'Friends',
            friendsCopy: 'This will become a wider view for searching, filtering, and organizing friends without crowding the main screen.',
            friendsRoomCopy: 'Search, favorite, and select up to 4 friends for comparison from a room with more space.',
            totalFriends: 'Total friends',
            favoriteFriends: 'Favorites',
            selectedFriends: 'Selected',
            compareSelected: 'Compare selected',
            noSelectedFriends: 'Select friends to prepare a comparison.',
            loginForFriends: 'Sign in with osu! to see your friends list.',
            historyTitle: 'History',
            historyCopy: 'This will become a wider view for recent and favorite comparisons with more breathing room.',
            historyRoomCopy: 'Review previous comparisons, mark favorites, and recover recent players without crowding the main screen.',
            recentComparisons: 'Recent comparisons',
            favoriteComparisons: 'Favorite comparisons',
            recentPlayers: 'Recent players',
            noRecentPlayers: 'No recent players',
            loadPlayer: 'Load player',
            playerTitle: 'Player Profile',
            playerCopy: 'Extended view of {player}, with visual summary, top play, and quick actions.',
            loadingProfile: 'Loading profile...',
            profileError: 'Could not load profile',
            noPlayerSelected: 'Select a player to open their extended profile.',
            viewFullProfile: 'View full profile',
            viewTopPlays: 'View Top Plays',
            viewRecent: 'View Recent Plays',
            openOsuProfile: 'Open osu! profile',
            topPlaysTitle: 'Top Plays',
            topPlaysCopy: "{player}'s best plays, with PP, accuracy, mods, and game client summary.",
            loadingTopPlays: 'Loading top plays...',
            topPlaysError: 'Could not load top plays',
            topPlaysLoaded: 'Top plays loaded',
            averagePp: 'Average PP',
            averageAccuracy: 'Average Accuracy',
            mostUsedMod: 'Most used mod',
            noMod: 'No mod',
            backToProfile: '← Back to profile',
            refreshPlays: 'Refresh plays',
            recentTitle: 'Recent Plays',
            recentCopy: "{player}'s recent plays, with date, rank, accuracy, mods, and game client.",
            loadingRecentPlays: 'Loading recent plays...',
            recentPlaysError: 'Could not load recent plays',
            recentPlaysLoaded: 'Recent plays loaded',
            latestPlay: 'Latest play',
            noRecentPlays: 'No recent plays',
            openCompare: 'Go compare'
        },
        loginOsu: 'Sign in with osu!',
        logout: 'Log out',
        connectedAs: 'Connected as',
        loginError: 'Sign-in failed',
        friendsTitle: 'Friends',
        favoritesTitle: 'Favorites',
        friendsLoading: 'Loading friends...',
        friendsError: 'Could not load friends',
        friendsEmpty: 'No friends to show',
        favoritesEmpty: 'No favorites yet',
        friendsNoResults: 'No friends found',
        friendsSearch: 'Search friends...',
        favoritesSearch: 'Search favorites...',
        friendsUnknownCountry: 'Country unavailable',
        historyTitle: 'History',
        comparisonFavoritesTitle: 'Favorites',
        historySearch: 'Search history...',
        comparisonFavoritesSearch: 'Search favorites...',
        historyEmpty: 'No recent comparisons',
        comparisonFavoritesEmpty: 'No favorite comparisons',
        historyNoResults: 'No comparisons found',
        fillComparison: 'Fill comparison',
        rerunComparison: 'Repeat comparison',
        focusBtn: '⤢',
        playedOnLazer: 'Played on Lazer',
        playedOnStable: 'Played on Stable',
        openMap: '↗ OPEN BEATMAP IN OSU!',
        topPlay: 'TOP PLAY',
        ppGained: 'PP GAINED',
        noTopPlay: 'No top play',
        misses: 'Misses',
        missSingular: 'miss',
        missPlural: 'misses',
        chokeOneMiss: '1 miss choke',
        chokeHighAcc: 'High acc choke',
        chokeComboDrop: 'Combo drop',
        downloadReplay: 'Download Replay',
        replayUnavailable: 'Replay unavailable',
        clickToExpand: 'CLICK TO EXPAND',
        activityNow: '🟢 Active now',
        activityMin: '⏱ Active {n} min ago',
        activityHour: '⏱ Active {n} h ago',
        activityDay: '⏱ Active {n} days ago',
        activityMonth: '⏱ Active {n} months ago',
        peakRank: 'PEAK RANK',
        trend90: 'Last 90 days',
        trendStable: '→ No change',
        errors: {
            userNotFound: 'Player "{user}" not found',
            one: 'One player was not found',
            two: 'Two players were not found',
            all: 'No players were found',
            mixed: 'Cannot compare: some players are invalid'
        },
        players: { one: 'player', many: 'players' },
        modes: { osu: 'osu!', taiko: 'osu!Taiko', fruits: 'osu!Catch', mania: 'osu!Mania' },
        compare: {
            ppLead: 'PP Lead',
            ppLeadVs: 'vs {player}',
            bestAcc: 'Best Accuracy',
            playCount: 'Play Count',
            bestTopPlay: 'Best Top Play'
        },
        stats: {
            pp: 'Performance Points',
            acc: 'Accuracy',
            playcount: 'Play Count',
            playtime: 'Play Time',
            score: 'Total Score',
            global: 'Global',
            country: 'Country',
            level: 'Level',
            accuracy: 'Accuracy',
            maxCombo: 'Max Combo',
            rank: 'Rank',
            date: 'Date',
            misses: 'Misses'
        }
    },
    de: {
        search: '▶ SPIELER SUCHEN',
        compareFriends: '▶ FREUNDE VERGLEICHEN',
        loading: 'Wird geladen...',
        updated: 'Aktualisiert',
        refresh: '⟳ Aktualisieren',
        refreshing: '⟳ Wird aktualisiert...',
        leader: '👑 Anführer',
        back: '← Zurück',
        theme: 'Thema',
        createdBy: 'erstellt von',
        rooms: {
            compare: 'Vergleichen',
            friends: 'Freunde',
            history: 'Verlauf',
            back: '← Zurück',
            backToComparison: '← Zurück zum Vergleich',
            friendsTitle: 'Freunde',
            friendsCopy: 'Hier entsteht eine größere Ansicht zum Suchen, Filtern und Organisieren von Freunden, ohne die Hauptseite zu überladen.',
            friendsRoomCopy: 'Suche, favorisiere und wähle bis zu 4 Freunde zum Vergleichen in einer Ansicht mit mehr Platz.',
            totalFriends: 'Freunde gesamt',
            favoriteFriends: 'Favoriten',
            selectedFriends: 'Ausgewählt',
            compareSelected: 'Ausgewählte vergleichen',
            noSelectedFriends: 'Wähle Freunde aus, um einen Vergleich vorzubereiten.',
            loginForFriends: 'Melde dich mit osu! an, um deine Freundesliste zu sehen.',
            historyTitle: 'Verlauf',
            historyCopy: 'Hier entsteht eine größere Ansicht für letzte und favorisierte Vergleiche mit mehr Platz.',
            historyRoomCopy: 'Prüfe frühere Vergleiche, markiere Favoriten und lade letzte Spieler, ohne die Hauptseite zu überladen.',
            recentComparisons: 'Letzte Vergleiche',
            favoriteComparisons: 'Favoritenvergleiche',
            recentPlayers: 'Letzte Spieler',
            noRecentPlayers: 'Keine letzten Spieler',
            loadPlayer: 'Spieler laden',
            playerTitle: 'Spielerprofil',
            playerCopy: 'Erweiterte Ansicht von {player}, mit visueller Zusammenfassung, Top Play und Schnellaktionen.',
            loadingProfile: 'Profil wird geladen...',
            profileError: 'Profil konnte nicht geladen werden',
            noPlayerSelected: 'Wähle einen Spieler aus, um sein erweitertes Profil zu öffnen.',
            viewFullProfile: 'Vollständiges Profil',
            viewTopPlays: 'Top Plays ansehen',
            viewRecent: 'Letzte Plays ansehen',
            openOsuProfile: 'osu!-Profil öffnen',
            topPlaysTitle: 'Top Plays',
            topPlaysCopy: 'Die besten Plays von {player}, mit Zusammenfassung von PP, Accuracy, Mods und Spielclient.',
            loadingTopPlays: 'Top Plays werden geladen...',
            topPlaysError: 'Top Plays konnten nicht geladen werden',
            topPlaysLoaded: 'Geladene Top Plays',
            averagePp: 'Durchschnitts-PP',
            averageAccuracy: 'Durchschnitts-Accuracy',
            mostUsedMod: 'Häufigster Mod',
            noMod: 'Kein Mod',
            backToProfile: '← Zurück zum Profil',
            refreshPlays: 'Plays aktualisieren',
            recentTitle: 'Letzte Plays',
            recentCopy: 'Letzte Plays von {player}, mit Datum, Rang, Accuracy, Mods und Spielclient.',
            loadingRecentPlays: 'Letzte Plays werden geladen...',
            recentPlaysError: 'Letzte Plays konnten nicht geladen werden',
            recentPlaysLoaded: 'Geladene letzte Plays',
            latestPlay: 'Letztes Play',
            noRecentPlays: 'Keine letzten Plays',
            openCompare: 'Zum Vergleich'
        },
        loginOsu: 'Mit osu! anmelden',
        logout: 'Abmelden',
        connectedAs: 'Verbunden als',
        loginError: 'Anmeldung fehlgeschlagen',
        friendsTitle: 'Freunde',
        favoritesTitle: 'Favoriten',
        friendsLoading: 'Freunde werden geladen...',
        friendsError: 'Freunde konnten nicht geladen werden',
        friendsEmpty: 'Keine Freunde anzuzeigen',
        favoritesEmpty: 'Noch keine Favoriten',
        friendsNoResults: 'Keine Freunde gefunden',
        friendsSearch: 'Freunde suchen...',
        favoritesSearch: 'Favoriten suchen...',
        friendsUnknownCountry: 'Land nicht verfügbar',
        historyTitle: 'Verlauf',
        comparisonFavoritesTitle: 'Favoriten',
        historySearch: 'Verlauf suchen...',
        comparisonFavoritesSearch: 'Favoriten suchen...',
        historyEmpty: 'Keine letzten Vergleiche',
        comparisonFavoritesEmpty: 'Keine Favoritenvergleiche',
        historyNoResults: 'Keine Vergleiche gefunden',
        fillComparison: 'Vergleich ausfüllen',
        rerunComparison: 'Vergleich wiederholen',
        focusBtn: '⤢',
        playedOnLazer: 'Gespielt auf Lazer',
        playedOnStable: 'Gespielt auf Stable',
        openMap: '↗ BEATMAP IN OSU! ÖFFNEN',
        topPlay: 'TOP PLAY',
        ppGained: 'PP ERHALTEN',
        noTopPlay: 'Kein Top-Play',
        misses: 'Misses',
        missSingular: 'Miss',
        missPlural: 'Misses',
        chokeOneMiss: '1-Miss-Choke',
        chokeHighAcc: 'High-Acc-Choke',
        chokeComboDrop: 'Combo-Drop',
        downloadReplay: 'Replay herunterladen',
        replayUnavailable: 'Replay nicht verfügbar',
        clickToExpand: 'KLICKEN ZUM ERWEITERN',
        activityNow: '🟢 Jetzt aktiv',
        activityMin: '⏱ Vor {n} Min. aktiv',
        activityHour: '⏱ Vor {n} Std. aktiv',
        activityDay: '⏱ Vor {n} Tagen aktiv',
        activityMonth: '⏱ Vor {n} Monaten aktiv',
        peakRank: 'PEAK RANK',
        trend90: 'Letzte 90 Tage',
        trendStable: '→ Keine Änderung',
        errors: {
            userNotFound: 'Spieler "{user}" nicht gefunden',
            one: 'Ein Spieler wurde nicht gefunden',
            two: 'Zwei Spieler wurden nicht gefunden',
            all: 'Keine Spieler gefunden',
            mixed: 'Vergleich nicht möglich: ungültige Spieler vorhanden'
        },
        players: { one: 'Spieler', many: 'Spieler' },
        modes: { osu: 'osu!', taiko: 'osu!Taiko', fruits: 'osu!Catch', mania: 'osu!Mania' },
        compare: {
            ppLead: 'PP-Vorsprung',
            ppLeadVs: 'gegen {player}',
            bestAcc: 'Beste Genauigkeit',
            playCount: 'Spielanzahl',
            bestTopPlay: 'Bestes Top Play'
        },
        stats: {
            pp: 'Leistungspunkte',
            acc: 'Genauigkeit',
            playcount: 'Spiele',
            playtime: 'Spielzeit',
            score: 'Gesamtpunktzahl',
            global: 'Global',
            country: 'Land',
            level: 'Level',
            accuracy: 'Genauigkeit',
            maxCombo: 'Max Combo',
            rank: 'Rang',
            date: 'Datum',
            misses: 'Misses'
        }
    }
};

function applyLang() {
    const t = LANGS[currentLang];
    updateSearchButtonLabel();
    document.getElementById('btn-refresh').textContent = t.refresh;
    document.getElementById('btn-back').textContent = t.back;
    document.getElementById('theme-label').textContent = t.theme;
    document.getElementById('theme-select').setAttribute('aria-label', t.theme);
    document.getElementById('footer-created-by').textContent = t.createdBy;
    document.getElementById('room-nav-compare').textContent = t.rooms.compare;
    document.getElementById('room-nav-friends').textContent = t.rooms.friends;
    document.getElementById('room-nav-history').textContent = t.rooms.history;
    updateRoomBackLabel();

    const label = document.querySelector('.podium-label');
    if (label) label.textContent = t.leader;

    document.querySelector('.refresh-info').innerHTML =
        `${t.updated}: <span id="last-update">—</span>`;

    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.lang-btn[data-lang='${currentLang}']`)?.classList.add('active');

    renderAuthWidget();
    renderFriendsPanel();
    renderComparisonHistoryPanel();
    renderRoomView(currentRoomRoute);

    if (document.getElementById('results').style.display !== 'none') {
        loadCards();
    }
}

function changeLang(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    applyLang();
}

function parseRoomRoute() {
    const raw = (window.location.hash || '#/compare').replace(/^#\/?/, '');
    const parts = raw.split('/').filter(Boolean);
    const name = parts[0] || 'compare';
    const param = parts.slice(1).join('/');

    if (['compare', 'results', 'friends', 'history', 'player', 'top-plays', 'recent'].includes(name)) {
        return { name, param: decodeURIComponent(param || '') };
    }

    return { name: 'compare', param: '' };
}

function buildRoomHash(name, param = '') {
    const cleanName = name || 'compare';
    const cleanParam = param ? `/${encodeURIComponent(param)}` : '';
    return `#/${cleanName}${cleanParam}`;
}

function navigateToRoom(name, param = '') {
    const nextHash = buildRoomHash(name, param);
    if (window.location.hash === nextHash) {
        handleRouteChange();
        return;
    }
    window.location.hash = nextHash;
}

function setChromeMode(mode) {
    const active = mode !== 'compare';
    document.getElementById('lang-switch').classList.toggle('results-mode', active);
    document.getElementById('top-right-controls').classList.toggle('results-mode', active);
    document.getElementById('theme-switch').classList.toggle('results-mode', active);
    document.getElementById('auth-widget').classList.toggle('results-mode', active);
}

function setActiveRoomLink(name) {
    document.querySelectorAll('[data-room-link]').forEach(link => {
        link.classList.toggle('active', link.dataset.roomLink === name);
    });
}

function clearRoomScoresRefreshTimer() {
    if (!roomScoresRefreshTimer) return;
    clearInterval(roomScoresRefreshTimer);
    roomScoresRefreshTimer = null;
}

function startRoomScoresRefreshTimer(route) {
    clearRoomScoresRefreshTimer();
    if (!route?.param || !['top-plays', 'recent'].includes(route.name)) return;

    roomScoresRefreshTimer = setInterval(() => {
        const activeRoute = currentRoomRoute;
        if (!activeRoute?.param || activeRoute.name !== route.name || normalizeUsername(activeRoute.param) !== normalizeUsername(route.param)) {
            clearRoomScoresRefreshTimer();
            return;
        }

        refreshScoreRoom(activeRoute.name, activeRoute.param);
    }, ROOM_SCORES_REFRESH_INTERVAL_MS);
}

function refreshScoreRoom(name = currentRoomRoute?.name, username = currentRoomRoute?.param) {
    if (!username || !['top-plays', 'recent'].includes(name)) return;

    if (name === 'top-plays') {
        topPlaysCache.clear();
        renderTopPlaysRoom({ name, param: username });
        return;
    }

    recentPlaysCache.clear();
    renderRecentPlaysRoom({ name, param: username });
}

function setRoomTitle(text, extraClass = '') {
    const title = document.getElementById('room-title');
    if (!title) return;

    title.textContent = text;
    title.className = `room-title${extraClass}`;
}

function hasActiveComparison() {
    return Array.isArray(currentPlayers) && currentPlayers.length > 0;
}

function shouldReturnToResultsFromRoom() {
    return currentRoomRoute?.name === 'player' && hasActiveComparison();
}

function getRoomBackLabel() {
    const rooms = LANGS[currentLang].rooms;
    if ((currentRoomRoute?.name === 'top-plays' || currentRoomRoute?.name === 'recent') && currentRoomRoute.param) {
        return rooms.backToProfile;
    }
    return shouldReturnToResultsFromRoom() ? rooms.backToComparison : rooms.back;
}

function updateRoomBackLabel() {
    const back = document.getElementById('room-back');
    if (back) back.textContent = getRoomBackLabel();
}

function roomBack() {
    if ((currentRoomRoute?.name === 'top-plays' || currentRoomRoute?.name === 'recent') && currentRoomRoute.param) {
        navigateToRoom('player', currentRoomRoute.param);
        return;
    }

    navigateToRoom(shouldReturnToResultsFromRoom() ? 'results' : 'compare');
}

function showCompareRoom() {
    clearRoomScoresRefreshTimer();
    if (refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = null;
    }
    closeFocusBtn();
    document.getElementById('results').style.display = 'none';
    document.getElementById('room-view').style.display = 'none';
    document.getElementById('landing').style.display = 'flex';
    setChromeMode('compare');
    setActiveRoomLink('compare');
    currentRoomRoute = { name: 'compare', param: '' };
    topPlayCache = {};
    topPlaysCache.clear();
    recentPlaysCache.clear();
}

function showResultsRoom() {
    clearRoomScoresRefreshTimer();
    if (!currentPlayers.length) {
        history.replaceState(null, '', buildRoomHash('compare'));
        showCompareRoom();
        return;
    }

    document.getElementById('landing').style.display = 'none';
    document.getElementById('room-view').style.display = 'none';
    document.getElementById('results').style.display = 'block';
    setChromeMode('results');
    setActiveRoomLink('');
    currentRoomRoute = { name: 'results', param: '' };
    updateRoomBackLabel();

    if (!refreshTimer) {
        refreshTimer = setInterval(refreshData, 60000);
    }
}

function showFutureRoom(route) {
    clearRoomScoresRefreshTimer();
    if (refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = null;
    }
    closeFocusBtn();
    document.getElementById('landing').style.display = 'none';
    document.getElementById('results').style.display = 'none';
    document.getElementById('room-view').style.display = 'block';
    setChromeMode('room');
    setActiveRoomLink(route.name);
    currentRoomRoute = route;
    updateRoomBackLabel();
    renderRoomView(route);
    startRoomScoresRefreshTimer(route);
    window.scrollTo({ top: 0, behavior: 'auto' });
}

function renderRoomView(route = currentRoomRoute) {
    const view = document.getElementById('room-view');
    if (!view || !route || route.name === 'compare' || route.name === 'results') return;

    const t = LANGS[currentLang].rooms;
    if (route.name === 'friends') {
        renderFriendsRoom();
        return;
    }
    if (route.name === 'history') {
        renderHistoryRoom();
        return;
    }
    if (route.name === 'player') {
        renderPlayerRoom(route);
        return;
    }
    if (route.name === 'top-plays') {
        renderTopPlaysRoom(route);
        return;
    }
    if (route.name === 'recent') {
        renderRecentPlaysRoom(route);
        return;
    }

    setRoomTitle(t.compare);
    document.getElementById('room-copy').textContent = t.openCompare;
    document.getElementById('room-actions').innerHTML = `
        <a class="room-action-link" href="#/compare">${escapeHtml(t.openCompare)}</a>
    `;
}

async function renderPlayerRoom(route) {
    const rooms = LANGS[currentLang].rooms;
    const username = String(route.param || '').trim();
    const mode = getActiveMode();

    setRoomTitle(rooms.playerTitle, ' room-title--profile');

    if (!username) {
        document.getElementById('room-copy').textContent = rooms.noPlayerSelected;
        document.getElementById('room-actions').innerHTML = `
            <div class="player-profile-state">${escapeHtml(rooms.noPlayerSelected)}</div>
            <a class="room-action-link" href="#/compare">${escapeHtml(rooms.openCompare)}</a>
        `;
        return;
    }

    document.getElementById('room-copy').textContent = rooms.playerCopy.replace('{player}', username);

    const cacheKey = `${mode}:${normalizeUsername(username)}`;
    if (playerProfileCache.has(cacheKey)) {
        const cached = playerProfileCache.get(cacheKey);
        renderPlayerProfileContent(cached.user, cached.topPlay, mode);
        return;
    }

    document.getElementById('room-actions').innerHTML = `
        <div class="player-profile-state">
            <div class="spinner"></div>
            <span>${escapeHtml(rooms.loadingProfile)}</span>
        </div>
    `;

    try {
        const [user, topPlay] = await Promise.all([
            fetchPlayer(username, mode),
            fetchBestPlay(username, mode)
        ]);

        playerProfileCache.set(cacheKey, { user, topPlay });

        if (currentRoomRoute?.name === 'player' && normalizeUsername(currentRoomRoute.param) === normalizeUsername(username)) {
            renderPlayerProfileContent(user, topPlay, mode);
        }
    } catch (error) {
        if (currentRoomRoute?.name !== 'player') return;

        document.getElementById('room-actions').innerHTML = `
            <div class="player-profile-state player-profile-state--error">
                ${escapeHtml(error?.message || rooms.profileError)}
            </div>
            <a class="room-action-link" href="#/compare">${escapeHtml(rooms.openCompare)}</a>
        `;
    }
}

function renderPlayerProfileContent(user, topPlay, mode) {
    const t = LANGS[currentLang];
    const rooms = t.rooms;
    const username = user.username || 'osu!';
    const pp = Math.round(user.statistics?.pp || 0);
    const isCreator = isCreatorUsername(username);
    const title = isCreator ? 'PAGE CREATOR' : getUserTitle(pp);
    const avatarUrl = user.avatar_url || 'https://osu.ppy.sh/images/layout/avatar-guest.png';
    const flag = getCountryFlag(user.country_code);
    const activity = getActivityLabel(user.last_visit);
    const peakRank = user.rank_highest?.rank;
    const trend = getRankTrend(user.rank_history);
    const osuProfileUrl = `https://osu.ppy.sh/users/${user.id}/${mode}`;

    setRoomTitle(rooms.playerTitle, ' room-title--profile');
    document.getElementById('room-copy').textContent = rooms.playerCopy.replace('{player}', username);

    document.getElementById('room-actions').innerHTML = `
        <div class="player-profile-room">
            <div class="player-profile-hero">
                <div class="player-profile-avatar-wrap${isCreator ? ' creator-frame' : ''}">
                    <div class="avatar-glow"></div>
                    <img class="player-profile-avatar" src="${escapeHtml(avatarUrl)}" alt="${escapeHtml(username)}" onerror="this.src='https://osu.ppy.sh/images/layout/avatar-guest.png'">
                </div>
                <div class="player-profile-identity">
                    <div class="player-profile-flag">${escapeHtml(flag)}</div>
                    <div class="player-profile-name${isCreator ? ' creator-name' : ''}">${escapeHtml(username)}</div>
                    <div class="player-profile-title${isCreator ? ' creator-title' : ''}">${escapeHtml(title)}</div>
                    ${activity ? `<div class="activity-indicator${activity.active ? ' activity-now' : ''}">${escapeHtml(activity.text)}</div>` : ''}
                    <div class="player-profile-pp">
                        <span>${escapeHtml(t.stats.pp)}</span>
                        <strong>${fmtNum(pp)}<small>pp</small></strong>
                    </div>
                </div>
                <div class="player-profile-ranks">
                    <div class="player-profile-rank">
                        <strong>#${fmtNum(user.statistics?.global_rank) || '—'}</strong>
                        <span>${escapeHtml(t.stats.global)}</span>
                    </div>
                    <div class="player-profile-rank">
                        <strong>#${fmtNum(user.statistics?.country_rank) || '—'}</strong>
                        <span>${escapeHtml(user.country_code || t.stats.country)}</span>
                    </div>
                    <div class="player-profile-rank">
                        <strong>${escapeHtml(String(user.statistics?.level?.current || '—'))}</strong>
                        <span>${escapeHtml(t.stats.level)}</span>
                    </div>
                </div>
            </div>

            ${(peakRank || trend) ? `
                <div class="player-profile-rankline">
                    ${peakRank ? `<div class="focus-peak"><span class="focus-peak-icon">★</span><span class="focus-peak-label">${escapeHtml(t.peakRank)}</span><span class="focus-peak-value">#${fmtNum(peakRank)}</span></div>` : ''}
                    ${trend ? renderTrendLine(trend) : ''}
                </div>
            ` : ''}

            <div class="player-profile-stats">
                <div class="player-profile-stat">
                    <span>${escapeHtml(t.stats.acc)}</span>
                    <strong class="accent">${fmtAcc(user.statistics?.hit_accuracy)}</strong>
                </div>
                <div class="player-profile-stat">
                    <span>${escapeHtml(t.stats.playcount)}</span>
                    <strong>${fmtNum(user.statistics?.play_count)}</strong>
                </div>
                <div class="player-profile-stat">
                    <span>${escapeHtml(t.stats.playtime)}</span>
                    <strong>${fmtTime(user.statistics?.play_time)}</strong>
                </div>
                <div class="player-profile-stat">
                    <span>${escapeHtml(t.stats.score)}</span>
                    <strong class="gold">${fmtNum(user.statistics?.total_score)}</strong>
                </div>
            </div>

            <div class="player-profile-topplay">
                ${renderTopPlayFull(topPlay)}
            </div>

            <div class="player-profile-actions">
                <a class="room-action-link" href="${buildRoomHash('top-plays', username)}">${escapeHtml(rooms.viewTopPlays)}</a>
                <a class="room-action-link" href="${buildRoomHash('recent', username)}">${escapeHtml(rooms.viewRecent)}</a>
                <a class="room-action-link" href="${escapeHtml(osuProfileUrl)}" target="_blank" rel="noopener">${escapeHtml(rooms.openOsuProfile)}</a>
            </div>
        </div>
    `;
}

function renderTrendLine(trend) {
    const t = LANGS[currentLang];
    if (trend.state === 'stable') {
        return `<div class="focus-trend focus-trend--stable">${escapeHtml(t.trendStable)} <span class="focus-trend-label">${escapeHtml(t.trend90)}</span></div>`;
    }

    const arrow = trend.state === 'up' ? '↗' : '↘';
    const sign = trend.state === 'up' ? '+' : '−';
    const cls = trend.state === 'up' ? 'focus-trend--up' : 'focus-trend--down';
    return `<div class="focus-trend ${cls}">${arrow} ${sign}${fmtNum(Math.abs(trend.diff))} <span class="focus-trend-label">${escapeHtml(t.trend90)}</span></div>`;
}

async function renderTopPlaysRoom(route) {
    const rooms = LANGS[currentLang].rooms;
    const username = String(route.param || '').trim();
    const mode = getActiveMode();
    const limit = DEFAULT_TOP_PLAYS_LIMIT;

    setRoomTitle(rooms.topPlaysTitle);

    if (!username) {
        document.getElementById('room-copy').textContent = rooms.noPlayerSelected;
        document.getElementById('room-actions').innerHTML = `
            <div class="top-plays-state">${escapeHtml(rooms.noPlayerSelected)}</div>
            <a class="room-action-link" href="#/compare">${escapeHtml(rooms.openCompare)}</a>
        `;
        return;
    }

    document.getElementById('room-copy').textContent = rooms.topPlaysCopy.replace('{player}', username);
    document.getElementById('room-actions').innerHTML = `
        <div class="top-plays-state">
            <div class="spinner"></div>
            <span>${escapeHtml(rooms.loadingTopPlays)}</span>
        </div>
    `;

    try {
        const [user, scores] = await Promise.all([
            fetchPlayer(username, mode),
            fetchBestPlays(username, mode, limit)
        ]);

        if (currentRoomRoute?.name === 'top-plays' && normalizeUsername(currentRoomRoute.param) === normalizeUsername(username)) {
            renderTopPlaysContent(user, scores, mode, limit);
        }
    } catch (error) {
        if (currentRoomRoute?.name !== 'top-plays') return;

        document.getElementById('room-actions').innerHTML = `
            <div class="top-plays-state top-plays-state--error">
                ${escapeHtml(error?.message || rooms.topPlaysError)}
            </div>
            <a class="room-action-link" href="${buildRoomHash('player', username)}">${escapeHtml(rooms.backToProfile.replace('← ', ''))}</a>
        `;
    }
}

function renderTopPlaysContent(user, scores, mode, limit) {
    const t = LANGS[currentLang];
    const rooms = t.rooms;
    const username = user.username || 'osu!';
    const pp = Math.round(user.statistics?.pp || 0);
    const isCreator = isCreatorUsername(username);
    const avatarUrl = user.avatar_url || 'https://osu.ppy.sh/images/layout/avatar-guest.png';
    const safeScores = Array.isArray(scores) ? scores.slice(0, limit) : [];
    const summary = getTopPlaysSummary(safeScores);

    setRoomTitle(rooms.topPlaysTitle);
    document.getElementById('room-copy').textContent = rooms.topPlaysCopy.replace('{player}', username);

    document.getElementById('room-actions').innerHTML = `
        <div class="top-plays-room">
            <div class="top-plays-player">
                <img class="top-plays-avatar" src="${escapeHtml(avatarUrl)}" alt="${escapeHtml(username)}" onerror="this.src='https://osu.ppy.sh/images/layout/avatar-guest.png'">
                <div class="top-plays-player-info">
                    <div class="top-plays-name${isCreator ? ' creator-name' : ''}">${escapeHtml(username)}</div>
                    <div class="top-plays-meta">
                        <span>${escapeHtml(t.modes[mode] || mode)}</span>
                        <span>${fmtNum(pp)}pp</span>
                    </div>
                </div>
                <div class="top-plays-player-actions">
                    <button class="room-action-link top-plays-refresh-link" type="button" onclick="refreshScoreRoom()">${escapeHtml(rooms.refreshPlays)}</button>
                    <a class="room-action-link top-plays-profile-link" href="${buildRoomHash('player', username)}">${escapeHtml(rooms.backToProfile.replace('← ', ''))}</a>
                </div>
            </div>

            <div class="top-plays-summary">
                <div class="top-plays-stat">
                    <span>${escapeHtml(rooms.topPlaysLoaded)}</span>
                    <strong>${fmtNum(safeScores.length)} / ${fmtNum(limit)}</strong>
                </div>
                <div class="top-plays-stat">
                    <span>${escapeHtml(rooms.averagePp)}</span>
                    <strong>${summary.avgPp ? `${fmtNum(summary.avgPp)}pp` : '—'}</strong>
                </div>
                <div class="top-plays-stat">
                    <span>${escapeHtml(rooms.averageAccuracy)}</span>
                    <strong>${summary.avgAcc ? `${summary.avgAcc.toFixed(2)}%` : '—'}</strong>
                </div>
                <div class="top-plays-stat">
                    <span>${escapeHtml(rooms.mostUsedMod)}</span>
                    <strong>${escapeHtml(summary.topMod || rooms.noMod)}</strong>
                </div>
            </div>

            ${safeScores.length
                ? `<div class="top-plays-list">${safeScores.map((score, index) => renderTopPlayListItem(score, index)).join('')}</div>`
                : `<div class="top-plays-state">${escapeHtml(t.noTopPlay)}</div>`}
        </div>
    `;
}

async function renderRecentPlaysRoom(route) {
    const rooms = LANGS[currentLang].rooms;
    const username = String(route.param || '').trim();
    const mode = getActiveMode();

    setRoomTitle(rooms.recentTitle);

    if (!username) {
        document.getElementById('room-copy').textContent = rooms.noPlayerSelected;
        document.getElementById('room-actions').innerHTML = `
            <div class="top-plays-state">${escapeHtml(rooms.noPlayerSelected)}</div>
            <a class="room-action-link" href="#/compare">${escapeHtml(rooms.openCompare)}</a>
        `;
        return;
    }

    document.getElementById('room-copy').textContent = rooms.recentCopy.replace('{player}', username);
    document.getElementById('room-actions').innerHTML = `
        <div class="top-plays-state">
            <div class="spinner"></div>
            <span>${escapeHtml(rooms.loadingRecentPlays)}</span>
        </div>
    `;

    try {
        const [user, scores] = await Promise.all([
            fetchPlayer(username, mode),
            fetchRecentPlays(username, mode)
        ]);

        if (currentRoomRoute?.name === 'recent' && normalizeUsername(currentRoomRoute.param) === normalizeUsername(username)) {
            renderRecentPlaysContent(user, scores, mode);
        }
    } catch (error) {
        if (currentRoomRoute?.name !== 'recent') return;

        document.getElementById('room-actions').innerHTML = `
            <div class="top-plays-state top-plays-state--error">
                ${escapeHtml(error?.message || rooms.recentPlaysError)}
            </div>
            <a class="room-action-link" href="${buildRoomHash('player', username)}">${escapeHtml(rooms.backToProfile.replace('← ', ''))}</a>
        `;
    }
}

function renderRecentPlaysContent(user, scores, mode) {
    const t = LANGS[currentLang];
    const rooms = t.rooms;
    const username = user.username || 'osu!';
    const pp = Math.round(user.statistics?.pp || 0);
    const isCreator = isCreatorUsername(username);
    const avatarUrl = user.avatar_url || 'https://osu.ppy.sh/images/layout/avatar-guest.png';
    const safeScores = Array.isArray(scores) ? scores : [];
    const summary = getTopPlaysSummary(safeScores);
    const latestDate = safeScores[0]
        ? fmtDate(safeScores[0].ended_at || safeScores[0].created_at).replace('\n', ' ')
        : '—';

    setRoomTitle(rooms.recentTitle);
    document.getElementById('room-copy').textContent = rooms.recentCopy.replace('{player}', username);

    document.getElementById('room-actions').innerHTML = `
        <div class="top-plays-room recent-plays-room">
            <div class="top-plays-player">
                <img class="top-plays-avatar" src="${escapeHtml(avatarUrl)}" alt="${escapeHtml(username)}" onerror="this.src='https://osu.ppy.sh/images/layout/avatar-guest.png'">
                <div class="top-plays-player-info">
                    <div class="top-plays-name${isCreator ? ' creator-name' : ''}">${escapeHtml(username)}</div>
                    <div class="top-plays-meta">
                        <span>${escapeHtml(t.modes[mode] || mode)}</span>
                        <span>${fmtNum(pp)}pp</span>
                    </div>
                </div>
                <div class="top-plays-player-actions">
                    <button class="room-action-link top-plays-refresh-link" type="button" onclick="refreshScoreRoom()">${escapeHtml(rooms.refreshPlays)}</button>
                    <a class="room-action-link top-plays-profile-link" href="${buildRoomHash('player', username)}">${escapeHtml(rooms.backToProfile.replace('← ', ''))}</a>
                </div>
            </div>

            <div class="top-plays-summary">
                <div class="top-plays-stat">
                    <span>${escapeHtml(rooms.recentPlaysLoaded)}</span>
                    <strong>${fmtNum(safeScores.length)}</strong>
                </div>
                <div class="top-plays-stat">
                    <span>${escapeHtml(rooms.latestPlay)}</span>
                    <strong>${escapeHtml(latestDate)}</strong>
                </div>
                <div class="top-plays-stat">
                    <span>${escapeHtml(rooms.averageAccuracy)}</span>
                    <strong>${summary.avgAcc ? `${summary.avgAcc.toFixed(2)}%` : '—'}</strong>
                </div>
                <div class="top-plays-stat">
                    <span>${escapeHtml(rooms.mostUsedMod)}</span>
                    <strong>${escapeHtml(summary.topMod || rooms.noMod)}</strong>
                </div>
            </div>

            ${safeScores.length
                ? `<div class="top-plays-list">${safeScores.map((score, index) => renderTopPlayListItem(score, index)).join('')}</div>`
                : `<div class="top-plays-state">${escapeHtml(rooms.noRecentPlays)}</div>`}
        </div>
    `;
}

function getTopPlaysSummary(scores) {
    const validScores = scores.filter(Boolean);
    const ppScores = validScores.filter(score => typeof score.pp === 'number');
    const accScores = validScores.filter(score => typeof score.accuracy === 'number');
    const modCounts = new Map();

    validScores.forEach(score => {
        const mods = getMods(score);
        if (!mods.length) {
            modCounts.set('NM', (modCounts.get('NM') || 0) + 1);
            return;
        }

        mods.forEach(mod => {
            modCounts.set(mod, (modCounts.get(mod) || 0) + 1);
        });
    });

    const topMod = [...modCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || '';

    return {
        avgPp: ppScores.length ? Math.round(ppScores.reduce((sum, score) => sum + (score.pp || 0), 0) / ppScores.length) : 0,
        avgAcc: accScores.length ? accScores.reduce((sum, score) => sum + ((score.accuracy || 0) * 100), 0) / accScores.length : 0,
        topMod
    };
}

function getChokeInfo(score) {
    if (!score) return null;

    const t = LANGS[currentLang];
    const accuracy = typeof score.accuracy === 'number' ? score.accuracy : 0;
    const misses = Number(score.statistics?.miss ?? score.statistics?.count_miss ?? 0) || 0;
    const scoreCombo = Number(score.max_combo || 0) || 0;
    const beatmapCombo = Number(score.beatmap?.max_combo || 0) || 0;
    const comboRatio = scoreCombo && beatmapCombo ? scoreCombo / beatmapCombo : 0;
    const rank = String(score.rank || '').toUpperCase();
    const accText = accuracy ? `${(accuracy * 100).toFixed(2)}%` : '—';
    const missText = `${misses} ${misses === 1 ? t.missSingular : t.missPlural}`;
    const comboText = beatmapCombo ? `${fmtNum(scoreCombo)}x / ${fmtNum(beatmapCombo)}x` : `${fmtNum(scoreCombo)}x`;

    if (misses === 1 && accuracy >= 0.965) {
        return {
            type: 'miss',
            label: t.chokeOneMiss,
            detail: `${accText} · ${missText} · ${comboText}`
        };
    }

    if (misses > 0 && misses <= 3 && accuracy >= 0.975) {
        return {
            type: 'high-acc',
            label: t.chokeHighAcc,
            detail: `${accText} · ${missText} · ${comboText}`
        };
    }

    if (beatmapCombo && scoreCombo && comboRatio < 0.65 && accuracy >= 0.94 && (misses <= 3 || ['S', 'SH', 'A'].includes(rank))) {
        return {
            type: 'combo',
            label: t.chokeComboDrop,
            detail: `${accText} · ${missText} · ${comboText}`
        };
    }

    return null;
}

function renderChokeChip(choke) {
    if (!choke) return '';

    return `<span class="choke-chip choke-chip--${escapeHtml(choke.type)}" data-choke-detail="${escapeHtml(choke.detail)}" aria-label="${escapeHtml(choke.detail)}">${escapeHtml(choke.label)}</span>`;
}

function renderTopPlayListItem(score, index) {
    const t = LANGS[currentLang];
    const cover = getCoverUrl(score);
    const mapName = score.beatmapset?.title || '—';
    const artist = score.beatmapset?.artist || '';
    const diff = score.beatmap?.version || '';
    const stars = score.beatmap?.difficulty_rating?.toFixed(2);
    const mods = getMods(score);
    const pp = typeof score.pp === 'number' ? Math.round(score.pp) : null;
    const acc = typeof score.accuracy === 'number' ? (score.accuracy * 100).toFixed(2) : '—';
    const rank = score.rank || 'D';
    const misses = score.statistics?.miss ?? score.statistics?.count_miss ?? 0;
    const dateStr = fmtDate(score.ended_at || score.created_at);
    const mapUrl = getBeatmapUrl(score);
    const hasReplay = score.replay === true || score.has_replay === true;
    const choke = getChokeInfo(score);
    const replayUrl = hasReplay && score.id
        ? `https://osu.ppy.sh/scores/${score.id}/download`
        : null;

    return `
        <article class="top-play-row">
            <div class="top-play-position">#${index + 1}</div>
            <div class="top-play-cover-wrap">
                ${cover
                    ? `<img class="top-play-cover" src="${cover}" alt="${escapeHtml(mapName)}" onerror="this.style.display='none'">`
                    : `<div class="top-play-cover top-play-cover--empty">♫</div>`}
            </div>
            <div class="top-play-main">
                <div class="top-play-header-line">
                    <div class="top-play-map">${escapeHtml(mapName)}</div>
                    ${renderScoreClient(score)}
                </div>
                <div class="top-play-artist">by ${escapeHtml(artist)}</div>
                <div class="top-play-tags">
                    ${renderModChips(mods)}
                    ${renderChokeChip(choke)}
                    ${stars ? `<span class="tp-full-stars">✦ ${stars}</span>` : ''}
                    ${diff ? `<span class="top-play-diff">[${escapeHtml(diff)}]</span>` : ''}
                </div>
                <div class="top-play-metrics">
                    <div><span>${escapeHtml(t.stats.accuracy)}</span><strong class="accent">${acc}%</strong></div>
                    <div><span>${escapeHtml(t.stats.rank)}</span><strong>${getRankDisplay(rank)}</strong></div>
                    <div><span>${escapeHtml(t.stats.misses)}</span><strong class="${misses > 0 ? 'miss-val' : ''}">${misses}</strong></div>
                    <div><span>${escapeHtml(t.stats.date)}</span><strong>${escapeHtml(dateStr.replace('\n', ' '))}</strong></div>
                </div>
            </div>
            <div class="top-play-side">
                <div class="top-play-pp">${pp == null ? '—' : fmtNum(pp)}<span>pp</span></div>
                <a class="top-play-action" href="${mapUrl}" target="_blank" rel="noopener">↗</a>
                ${replayUrl ? `<a class="top-play-action top-play-action--replay" href="${replayUrl}" target="_blank" rel="noopener">⬇</a>` : ''}
            </div>
        </article>
    `;
}

function getActiveMode() {
    return currentMode || document.getElementById('gamemode')?.value || 'osu';
}

function renderHistoryRoom() {
    const t = LANGS[currentLang];
    const rooms = t.rooms;
    const activeItems = getComparisonItemsForActiveFilter();
    const visibleItems = getFilteredComparisonItems();
    const title = comparisonHistoryFilter === 'favorites' ? t.comparisonFavoritesTitle : t.historyTitle;
    const placeholder = comparisonHistoryFilter === 'favorites' ? t.comparisonFavoritesSearch : t.historySearch;
    const recentPlayers = getRecentHistoryPlayers();

    setRoomTitle(rooms.historyTitle);
    document.getElementById('room-copy').textContent = rooms.historyRoomCopy;

    let body = '';
    if (!activeItems.length) {
        body = `<div class="history-room-state">${escapeHtml(comparisonHistoryFilter === 'favorites' ? t.comparisonFavoritesEmpty : t.historyEmpty)}</div>`;
    } else if (!visibleItems.length) {
        body = `<div class="history-room-state">${escapeHtml(t.historyNoResults)}</div>`;
    } else {
        body = `
            <div class="history-room-grid">
                ${visibleItems.map(renderComparisonHistoryItem).join('')}
            </div>
        `;
    }

    const playersHtml = recentPlayers.length
        ? recentPlayers.map(player => `
            <button class="history-player-chip" type="button" onclick="loadHistoryPlayer('${escapeJsArg(player)}')" title="${escapeHtml(rooms.loadPlayer)}">
                ${escapeHtml(player)}
            </button>
        `).join('')
        : `<span class="history-player-empty">${escapeHtml(rooms.noRecentPlayers)}</span>`;

    document.getElementById('room-actions').innerHTML = `
        <div class="history-room">
            <div class="history-room-summary" aria-label="${escapeHtml(rooms.historyTitle)}">
                <div class="history-room-stat">
                    <span>${escapeHtml(rooms.recentComparisons)}</span>
                    <strong>${fmtNum(comparisonHistory.length)}</strong>
                </div>
                <div class="history-room-stat">
                    <span>${escapeHtml(rooms.favoriteComparisons)}</span>
                    <strong>${fmtNum(favoriteComparisons.length)}</strong>
                </div>
                <div class="history-room-stat">
                    <span>${escapeHtml(rooms.recentPlayers)}</span>
                    <strong>${fmtNum(recentPlayers.length)}</strong>
                </div>
            </div>

            <div class="history-room-toolbar">
                <label class="history-search-wrap history-room-search-wrap">
                    <span class="history-search-icon">⌕</span>
                    <input
                        class="history-search history-room-search"
                        id="history-room-search"
                        type="search"
                        value="${escapeHtml(comparisonHistorySearch)}"
                        placeholder="${escapeHtml(placeholder)}"
                        oninput="updateComparisonHistorySearch(this.value)"
                        autocomplete="off"
                        spellcheck="false">
                </label>
                <div class="history-panel-header history-room-filter-title">
                    <span class="history-panel-mark">◇</span>
                    <span>${escapeHtml(title)}</span>
                </div>
                <div class="history-filter-group history-room-filter-group" aria-label="${escapeHtml(title)}">
                    <button class="history-filter-btn${comparisonHistoryFilter === 'history' ? ' active' : ''}" type="button" onclick="setComparisonHistoryFilter('history')" title="${escapeHtml(t.historyTitle)}" aria-label="${escapeHtml(t.historyTitle)}">≋</button>
                    <button class="history-filter-btn${comparisonHistoryFilter === 'favorites' ? ' active' : ''}" type="button" onclick="setComparisonHistoryFilter('favorites')" title="${escapeHtml(t.comparisonFavoritesTitle)}" aria-label="${escapeHtml(t.comparisonFavoritesTitle)}">★</button>
                </div>
                <div class="history-count">${fmtNum(visibleItems.length)} / ${fmtNum(activeItems.length)}</div>
            </div>

            <div class="history-players-row">
                <div class="history-players-label">${escapeHtml(rooms.recentPlayers)}</div>
                <div class="history-players-list">${playersHtml}</div>
            </div>

            ${body}
        </div>
    `;
}

function renderFriendsRoom() {
    const t = LANGS[currentLang];
    const rooms = t.rooms;
    const activeFriends = getFriendsForActiveFilter();
    const visibleFriends = getFilteredFriends();
    const favoriteCount = friendsState.items.filter(friend => favoriteFriendIds.has(getFriendId(friend))).length;
    const selectedFriends = getSelectedFriendNames();
    const title = friendFilterMode === 'favorites' ? t.favoritesTitle : t.friendsTitle;
    const searchPlaceholder = friendFilterMode === 'favorites' ? t.favoritesSearch : t.friendsSearch;

    setRoomTitle(rooms.friendsTitle);
    document.getElementById('room-copy').textContent = rooms.friendsRoomCopy;

    if (!loggedInUser) {
        document.getElementById('room-actions').innerHTML = `
            <div class="friends-room">
                <div class="friends-room-state">
                    <span>${escapeHtml(rooms.loginForFriends)}</span>
                    <a class="room-action-link" href="/auth/osu/login">${escapeHtml(t.loginOsu)}</a>
                </div>
            </div>
        `;
        return;
    }

    let body = '';
    if (friendsState.loading) {
        body = `
            <div class="friends-room-state">
                <div class="spinner"></div>
                <span>${escapeHtml(t.friendsLoading)}</span>
            </div>
        `;
    } else if (friendsState.error) {
        body = `<div class="friends-room-state friends-state--error">${escapeHtml(t.friendsError)}</div>`;
    } else if (!friendsState.items.length) {
        body = `<div class="friends-room-state">${escapeHtml(t.friendsEmpty)}</div>`;
    } else if (friendFilterMode === 'favorites' && !activeFriends.length) {
        body = `<div class="friends-room-state friends-state--empty">${escapeHtml(t.favoritesEmpty)}</div>`;
    } else if (!visibleFriends.length) {
        body = `<div class="friends-room-state">${escapeHtml(t.friendsNoResults)}</div>`;
    } else {
        body = `
            <div class="friends-room-grid">
                ${visibleFriends.map(renderFriendItem).join('')}
            </div>
        `;
    }

    const selectedHtml = selectedFriends.length
        ? selectedFriends.map(name => `
            <button class="friends-selected-pill" type="button" onclick="removeFriendSelection('${escapeJsArg(name)}')">
                <span>${escapeHtml(name)}</span>
                <span>×</span>
            </button>
        `).join('')
        : `<span class="friends-selected-empty">${escapeHtml(rooms.noSelectedFriends)}</span>`;

    document.getElementById('room-actions').innerHTML = `
        <div class="friends-room">
            <div class="friends-room-summary" aria-label="${escapeHtml(rooms.friendsTitle)}">
                <div class="friends-room-stat">
                    <span>${escapeHtml(rooms.totalFriends)}</span>
                    <strong>${fmtNum(friendsState.items.length)}</strong>
                </div>
                <div class="friends-room-stat">
                    <span>${escapeHtml(rooms.favoriteFriends)}</span>
                    <strong>${fmtNum(favoriteCount)}</strong>
                </div>
                <div class="friends-room-stat">
                    <span>${escapeHtml(rooms.selectedFriends)}</span>
                    <strong>${fmtNum(selectedFriends.length)} / 4</strong>
                </div>
            </div>

            <div class="friends-room-toolbar">
                <label class="friends-search-wrap friends-room-search-wrap">
                    <span class="friends-search-icon">⌕</span>
                    <input
                        class="friends-search friends-room-search"
                        id="friends-room-search"
                        type="search"
                        value="${escapeHtml(friendSearchQuery)}"
                        placeholder="${escapeHtml(searchPlaceholder)}"
                        oninput="updateFriendSearch(this.value)"
                        autocomplete="off"
                        spellcheck="false">
                </label>
                <div class="friends-panel-header friends-room-filter-title">
                    <span class="friends-panel-mark">◎</span>
                    <span>${escapeHtml(title)}</span>
                </div>
                <div class="friends-filter-group friends-room-filter-group" aria-label="${escapeHtml(title)}">
                    <button class="friends-filter-btn${friendFilterMode === 'friends' ? ' active' : ''}" type="button" onclick="setFriendFilterMode('friends')" title="${escapeHtml(t.friendsTitle)}" aria-label="${escapeHtml(t.friendsTitle)}">◎</button>
                    <button class="friends-filter-btn${friendFilterMode === 'favorites' ? ' active' : ''}" type="button" onclick="setFriendFilterMode('favorites')" title="${escapeHtml(t.favoritesTitle)}" aria-label="${escapeHtml(t.favoritesTitle)}">★</button>
                </div>
                <div class="friends-count">${fmtNum(visibleFriends.length)} / ${fmtNum(activeFriends.length)}</div>
            </div>

            <div class="friends-selected-row">
                <div class="friends-selected-label">${escapeHtml(rooms.selectedFriends)}</div>
                <div class="friends-selected-list">${selectedHtml}</div>
                <button class="friends-compare-btn" type="button" onclick="doSearch()" ${selectedFriends.length ? '' : 'disabled'}>
                    ${escapeHtml(rooms.compareSelected)}
                </button>
            </div>

            ${body}
        </div>
    `;
}

function handleRouteChange() {
    const route = parseRoomRoute();
    if (route.name === 'compare') {
        showCompareRoom();
        return;
    }
    if (route.name === 'results') {
        showResultsRoom();
        return;
    }
    showFutureRoom(route);
}

// ══ ESTADO ══
let currentPlayers = [];
let currentMode = 'osu';
let refreshTimer = null;
let roomScoresRefreshTimer = null;
// Cache de top plays para el Focus Mode: { 'username': scoreData | null }
let topPlayCache = {};
let loggedInUser = null;
let authErrorVisible = false;
let friendsState = {
    loading: false,
    loaded: false,
    error: false,
    items: []
};
let friendSearchQuery = '';
const selectedFriendUsernames = new Set();
let friendFilterMode = 'friends';
const favoriteFriendIds = new Set();
let comparisonHistory = [];
let favoriteComparisons = [];
let comparisonHistoryFilter = 'history';
let comparisonHistorySearch = '';
let currentRoomRoute = { name: 'compare', param: '' };

// ══ FONDO ANIMADO ══
(function bgInit() {
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');
    let W, H, circles = [];
    let animationFrame = null;
    let isRunning = false;

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    function makeCircle() {
        return {
            x: Math.random() * W,
            y: Math.random() * H,
            r: Math.random() * 150 + 50,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            alpha: Math.random() * 0.04 + 0.01,
            color: Math.random() > 0.5 ? '#FF66AA' : '#6644CC'
        };
    }

    resize();
    for (let i = 0; i < 12; i++) circles.push(makeCircle());
    window.addEventListener('resize', resize);

    function drawGrid() {
        ctx.strokeStyle = 'rgba(255,102,170,0.04)';
        ctx.lineWidth = 1;
        const step = 60;
        for (let x = 0; x < W; x += step) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
        }
        for (let y = 0; y < H; y += step) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
        }
    }

    function tick() {
        if (document.documentElement.dataset.theme !== 'cyberpunk') {
            isRunning = false;
            animationFrame = null;
            ctx.clearRect(0, 0, W, H);
            return;
        }

        ctx.clearRect(0, 0, W, H);
        const grad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) / 1.5);
        grad.addColorStop(0, 'rgba(20,10,40,1)');
        grad.addColorStop(1, 'rgba(5,5,15,1)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
        drawGrid();
        circles.forEach(c => {
            c.x += c.vx; c.y += c.vy;
            if (c.x < -c.r) c.x = W + c.r;
            if (c.x > W + c.r) c.x = -c.r;
            if (c.y < -c.r) c.y = H + c.r;
            if (c.y > H + c.r) c.y = -c.r;
            const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r);
            g.addColorStop(0, c.color + Math.floor(c.alpha * 255).toString(16).padStart(2, '0'));
            g.addColorStop(1, c.color + '00');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
            ctx.fill();
        });
        animationFrame = requestAnimationFrame(tick);
    }

    function startCyberpunkBg() {
        if (isRunning || document.documentElement.dataset.theme !== 'cyberpunk') return;
        isRunning = true;
        animationFrame = requestAnimationFrame(tick);
    }

    const themeObserver = new MutationObserver(() => {
        if (document.documentElement.dataset.theme === 'cyberpunk') {
            startCyberpunkBg();
        } else if (animationFrame) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
            isRunning = false;
            ctx.clearRect(0, 0, W, H);
        }
    });

    themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
    });

    startCyberpunkBg();
})();

// ══ API ══
async function fetchPlayer(username, mode) {
    const res = await fetch(`/api/osu/${mode}/${encodeURIComponent(username)}`);
    if (!res.ok) {
        const t = LANGS[currentLang];
        throw new Error(t.errors.userNotFound.replace('{user}', username));
    }
    return res.json();
}

async function fetchBestPlay(username, mode) {
    const cacheKey = `${username}__${mode}`;
    if (cacheKey in topPlayCache) return topPlayCache[cacheKey];

    try {
        const scores = await fetchBestPlays(username, mode, 1);
        const score = scores[0] || null;
        topPlayCache[cacheKey] = score || null;
        return topPlayCache[cacheKey];
    } catch {
        topPlayCache[cacheKey] = null;
        return null;
    }
}

async function fetchBestPlays(username, mode, limit = DEFAULT_TOP_PLAYS_LIMIT) {
    const safeLimit = Math.max(1, Math.min(MAX_TOP_PLAYS_LIMIT, Number(limit) || DEFAULT_TOP_PLAYS_LIMIT));
    const cacheKey = `${mode}:${normalizeUsername(username)}:${safeLimit}`;

    if (topPlaysCache.has(cacheKey)) return topPlaysCache.get(cacheKey);

    const res = await fetch(`/api/osu/${mode}/${encodeURIComponent(username)}/best?limit=${safeLimit}`);
    if (!res.ok) throw new Error(LANGS[currentLang].rooms.topPlaysError);

    const data = await res.json();
    const scores = Array.isArray(data) ? data : [];
    topPlaysCache.set(cacheKey, scores);
    return scores;
}

async function fetchRecentPlays(username, mode, limit = null) {
    const hasLimit = limit != null;
    const safeLimit = hasLimit ? Math.max(1, Math.min(MAX_TOP_PLAYS_LIMIT, Number(limit) || DEFAULT_TOP_PLAYS_LIMIT)) : null;
    const cacheKey = `${mode}:${normalizeUsername(username)}:${safeLimit || 'all'}`;

    if (recentPlaysCache.has(cacheKey)) return recentPlaysCache.get(cacheKey);

    const query = safeLimit ? `?limit=${safeLimit}` : '';
    const res = await fetch(`/api/osu/${mode}/${encodeURIComponent(username)}/recent${query}`);
    if (!res.ok) throw new Error(LANGS[currentLang].rooms.recentPlaysError);

    const data = await res.json();
    const scores = Array.isArray(data) ? data : [];
    recentPlaysCache.set(cacheKey, scores);
    return scores;
}

// ══ HELPERS ══
function fmtNum(n) {
    if (!n && n !== 0) return '—';
    return Math.round(n).toLocaleString('es');
}

function fmtAcc(n) {
    if (!n) return '—';
    return n.toFixed(2) + '%';
}

function fmtTime(secs) {
    if (!secs) return '—';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    if (h > 999) return `${(h / 1000).toFixed(1)}k h`;
    return `${h}h ${m}m`;
}

function getCountryFlag(code) {
    if (!code) return '';
    return code.toUpperCase().split('').map(c =>
        String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)
    ).join('');
}

function getUserTitle(pp) {
    if (!pp) return 'UNRANKED';
    if (pp >= 10000) return 'THE BEST';
    if (pp >= 8000) return 'ELITE PLAYER';
    if (pp >= 6000) return 'EXPERT';
    if (pp >= 4000) return 'ADVANCED';
    if (pp >= 2000) return 'INTERMEDIATE';
    return 'BEGINNER';
}

function getActivityLabel(lastVisit) {
    if (!lastVisit) return null;
    const t = LANGS[currentLang];
    const diffMs = Date.now() - new Date(lastVisit).getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin <= 15) return { text: t.activityNow, active: true };
    if (diffMin < 60) return { text: t.activityMin.replace('{n}', diffMin), active: false };
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return { text: t.activityHour.replace('{n}', diffH), active: false };
    const diffD = Math.floor(diffH / 24);
    if (diffD < 30) return { text: t.activityDay.replace('{n}', diffD), active: false };
    const diffM = Math.floor(diffD / 30);
    return { text: t.activityMonth.replace('{n}', diffM), active: false };
}

function getRankTrend(rankHistory) {
    const data = rankHistory?.data;
    if (!data || data.length < 2) return null;
    const valid = data.filter(v => v > 0);
    if (valid.length < 2) return null;
    const first = valid[0];
    const last = valid[valid.length - 1];
    const diff = first - last; // positivo = mejoró (rank bajó)
    const STABLE_THRESHOLD = 50; // diferencia menor a esto = estable
    if (Math.abs(diff) < STABLE_THRESHOLD) return { diff: 0, state: 'stable' };
    return { diff, state: diff > 0 ? 'up' : 'down' };
}

function fmtDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy}\n${hh}:${min}`;
}

function getMods(score) {
    if (!score) return [];
    // API v2: mods es array de strings o array de objetos { acronym }
    const rawMods = score.mods || [];
    if (!rawMods.length) return [];
    if (typeof rawMods[0] === 'string') return rawMods;
    return rawMods.map(m => m.acronym || m.mod || '').filter(Boolean);
}

function modClass(mod) {
    const m = String(mod ?? '').toUpperCase();
    if (m === 'HD') return 'mod-hd';
    if (m === 'HR') return 'mod-hr';
    if (m === 'DT' || m === 'NC') return 'mod-dt';
    if (m === 'FL') return 'mod-fl';
    if (m === 'EZ') return 'mod-ez';
    if (m === 'NF') return 'mod-nf';
    return '';
}

function getModFullName(mod) {
    const normalized = String(mod ?? '').trim();
    if (!normalized) return '';
    const key = normalized.toUpperCase();
    return MOD_FULL_NAMES[key] || normalized;
}

function renderModChips(mods) {
    return mods.map(m => {
        const code = escapeHtml(String(m ?? '').trim());
        const fullName = escapeHtml(getModFullName(m));
        return `<span class="mod-chip ${modClass(m)}" data-mod-name="${fullName}" aria-label="${fullName}">${code}</span>`;
    }).join('');
}

function getCoverUrl(score) {
    return score?.beatmapset?.covers?.['list@2x']
        || score?.beatmapset?.covers?.list
        || score?.beatmapset?.covers?.card
        || '';
}

function getBeatmapUrl(score) {
    if (!score) return '#';
    const bid = score.beatmap?.id;
    return bid ? `https://osu.ppy.sh/b/${bid}` : '#';
}

function getRankDisplay(rank) {
    // XH = SS silver, X = SS gold, SH = S silver
    const map = { XH: 'SS', X: 'SS', SH: 'S', S: 'S', A: 'A', B: 'B', C: 'C', D: 'D' };
    return map[rank] || rank || '—';
}

function getRankClass(rank) {
    return `rank-letter rank-${rank || 'D'}`;
}

function renderScoreClient(score) {
    const t = LANGS[currentLang];
    const isStable = score?.legacy_score_id != null;
    const label = isStable ? t.playedOnStable : t.playedOnLazer;
    const clientClass = isStable ? 'stable' : 'lazer';
    const icon = isStable ? '◉' : '✦';

    return `<div class="score-client score-client--${clientClass}">
        <span class="score-client-icon">${icon}</span>
        <span>${label}</span>
    </div>`;
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[char]));
}

function escapeJsArg(value) {
    return String(value ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function isCreatorUsername(username) {
    return String(username ?? '').trim().toLowerCase() === 'manu is washed';
}

function normalizeUsername(username) {
    return String(username ?? '').trim().toLowerCase();
}

function readFavoriteFriendIds() {
    try {
        const key = getFriendFavoritesStorageKey();
        if (!key) return [];

        const value = JSON.parse(localStorage.getItem(key) || '[]');
        return Array.isArray(value) ? value.map(String) : [];
    } catch {
        return [];
    }
}

function saveFavoriteFriendIds() {
    const key = getFriendFavoritesStorageKey();
    if (!key) return;

    localStorage.setItem(key, JSON.stringify([...favoriteFriendIds]));
}

function getFriendFavoritesStorageKey() {
    const userId = loggedInUser?.id;
    return userId ? `${FRIEND_FAVORITES_STORAGE_KEY}_${userId}` : '';
}

function getHistoryOwnerKey() {
    return loggedInUser?.id ? String(loggedInUser.id) : 'guest';
}

function getComparisonStorageKey(baseKey) {
    return `${baseKey}_${getHistoryOwnerKey()}`;
}

function loadFavoriteFriendIdsForUser() {
    favoriteFriendIds.clear();
    readFavoriteFriendIds().forEach(id => favoriteFriendIds.add(id));
}

function migrateLegacyFavoriteFriendIds() {
    const key = getFriendFavoritesStorageKey();
    if (!key || localStorage.getItem(key)) return;

    const legacy = localStorage.getItem(FRIEND_FAVORITES_STORAGE_KEY);
    if (!legacy) return;

    localStorage.setItem(key, legacy);
    localStorage.removeItem(FRIEND_FAVORITES_STORAGE_KEY);
}

function readStoredComparisons(baseKey) {
    try {
        const value = JSON.parse(localStorage.getItem(getComparisonStorageKey(baseKey)) || '[]');
        return Array.isArray(value) ? value.filter(isValidComparisonRecord) : [];
    } catch {
        return [];
    }
}

function writeStoredComparisons(baseKey, records) {
    localStorage.setItem(getComparisonStorageKey(baseKey), JSON.stringify(records));
}

function isValidComparisonRecord(record) {
    return record &&
        typeof record.id === 'string' &&
        Array.isArray(record.players) &&
        record.players.length > 0 &&
        typeof record.mode === 'string';
}

function loadComparisonHistoryForCurrentUser() {
    comparisonHistory = readStoredComparisons(RECENT_COMPARISONS_STORAGE_KEY);
    favoriteComparisons = readStoredComparisons(FAVORITE_COMPARISONS_STORAGE_KEY);
    comparisonHistorySearch = '';
    comparisonHistoryFilter = comparisonHistory.length ? 'history' : 'favorites';
    renderComparisonHistoryPanel();
}

function consumeAuthStatusFromUrl() {
    const url = new URL(window.location.href);
    const status = url.searchParams.get('auth');
    authErrorVisible = status === 'error' || status === 'missing_config';

    if (status) {
        url.searchParams.delete('auth');
        const cleanUrl = `${url.pathname}${url.search}${url.hash}`;
        window.history.replaceState({}, document.title, cleanUrl);
    }
}

async function initAuth() {
    consumeAuthStatusFromUrl();
    await refreshAuthSession();
}

async function refreshAuthSession() {
    try {
        const res = await fetch('/api/me', { cache: 'no-store' });
        if (!res.ok) throw new Error('me_failed');
        const data = await res.json();
        loggedInUser = data.authenticated ? data.user : null;
    } catch {
        loggedInUser = null;
    }

    renderAuthWidget();
    loadComparisonHistoryForCurrentUser();
    if (loggedInUser) {
        migrateLegacyFavoriteFriendIds();
        loadFavoriteFriendIdsForUser();
        await loadFriends();
    } else {
        favoriteFriendIds.clear();
        resetFriends();
        renderFriendsPanel();
    }
}

function renderAuthWidget() {
    const widget = document.getElementById('auth-widget');
    if (!widget) return;

    const t = LANGS[currentLang];

    if (!loggedInUser) {
        widget.innerHTML = `
            <a class="auth-login-btn" href="/auth/osu/login">${escapeHtml(t.loginOsu)}</a>
            ${authErrorVisible ? `<div class="auth-error">${escapeHtml(t.loginError)}</div>` : ''}
        `;
        return;
    }

    authErrorVisible = false;
    const username = loggedInUser.username || 'osu!';
    const isCreator = isCreatorUsername(username);
    const pp = Math.round(loggedInUser.statistics?.pp || 0);
    const title = isCreator ? 'PAGE CREATOR' : getUserTitle(pp);
    const avatar = loggedInUser.avatar_url || '';

    widget.innerHTML = `
        <div class="auth-card">
            <img class="auth-avatar" src="${escapeHtml(avatar)}" alt="${escapeHtml(username)}">
            <div class="auth-meta">
                <div class="auth-kicker">${escapeHtml(t.connectedAs)}</div>
                <div class="auth-name${isCreator ? ' creator-name' : ''}">${escapeHtml(username)}</div>
                <div class="auth-tag${isCreator ? ' creator-title' : ''}">${escapeHtml(title)}</div>
            </div>
            <button class="auth-logout" type="button" onclick="logoutOsu()">
                <span>⏻</span>
                <span>${escapeHtml(t.logout)}</span>
            </button>
        </div>
    `;
}

async function logoutOsu() {
    try {
        await fetch('/auth/logout', { method: 'POST' });
    } finally {
        loggedInUser = null;
        authErrorVisible = false;
        favoriteFriendIds.clear();
        resetFriends();
        renderAuthWidget();
        renderFriendsPanel();
        renderRoomView(currentRoomRoute);
    }
}

function resetFriends() {
    friendSearchQuery = '';
    selectedFriendUsernames.clear();
    getPlayerInputs().forEach(input => {
        delete input.dataset.friendUsername;
    });
    updateSearchButtonLabel();

    friendsState = {
        loading: false,
        loaded: false,
        error: false,
        items: []
    };
}

async function loadFriends() {
    friendsState = {
        loading: true,
        loaded: false,
        error: false,
        items: []
    };
    renderFriendsPanel();

    try {
        const res = await fetch('/api/me/friends', { cache: 'no-store' });
        if (!res.ok) throw new Error(`friends_${res.status}`);

        const data = await res.json();
        friendsState = {
            loading: false,
            loaded: true,
            error: false,
            items: Array.isArray(data) ? data : []
        };
    } catch {
        friendsState = {
            loading: false,
            loaded: true,
            error: true,
            items: []
        };
    }

    renderFriendsPanel();
}

function renderFriendsPanel() {
    const panel = document.getElementById('friends-panel');
    if (!panel) {
        renderFriendsRoomIfActive();
        return;
    }

    if (!loggedInUser) {
        panel.innerHTML = '';
        panel.style.display = 'none';
        renderFriendsRoomIfActive();
        return;
    }

    const t = LANGS[currentLang];
    panel.style.display = 'block';
    const activeFriends = getFriendsForActiveFilter();
    const visibleFriends = getFilteredFriends();
    const title = friendFilterMode === 'favorites' ? t.favoritesTitle : t.friendsTitle;
    const searchPlaceholder = friendFilterMode === 'favorites' ? t.favoritesSearch : t.friendsSearch;

    let body = '';
    if (friendsState.loading) {
        body = `
            <div class="friends-state">
                <div class="spinner"></div>
                <span>${escapeHtml(t.friendsLoading)}</span>
            </div>
        `;
    } else if (friendsState.error) {
        body = `<div class="friends-state friends-state--error">${escapeHtml(t.friendsError)}</div>`;
    } else if (!friendsState.items.length) {
        body = `<div class="friends-state">${escapeHtml(t.friendsEmpty)}</div>`;
    } else if (friendFilterMode === 'favorites' && !activeFriends.length) {
        body = `<div class="friends-state friends-state--empty">${escapeHtml(t.favoritesEmpty)}</div>`;
    } else if (!visibleFriends.length) {
        body = `<div class="friends-state">${escapeHtml(t.friendsNoResults)}</div>`;
    } else {
        body = `
            <div class="friends-grid">
                ${visibleFriends.map(renderFriendItem).join('')}
            </div>
        `;
    }

    panel.innerHTML = `
        <div class="friends-panel-toolbar">
            <label class="friends-search-wrap">
                <span class="friends-search-icon">⌕</span>
                <input
                    class="friends-search"
                    id="friends-search"
                    type="search"
                    value="${escapeHtml(friendSearchQuery)}"
                    placeholder="${escapeHtml(searchPlaceholder)}"
                    oninput="updateFriendSearch(this.value)"
                    autocomplete="off"
                    spellcheck="false">
            </label>
            <div class="friends-panel-header">
                <span class="friends-panel-mark">◎</span>
                <span>${escapeHtml(title)}</span>
            </div>
            <div class="friends-filter-group" aria-label="${escapeHtml(title)}">
                <button class="friends-filter-btn${friendFilterMode === 'friends' ? ' active' : ''}" type="button" onclick="setFriendFilterMode('friends')" title="${escapeHtml(t.friendsTitle)}" aria-label="${escapeHtml(t.friendsTitle)}">◎</button>
                <button class="friends-filter-btn${friendFilterMode === 'favorites' ? ' active' : ''}" type="button" onclick="setFriendFilterMode('favorites')" title="${escapeHtml(t.favoritesTitle)}" aria-label="${escapeHtml(t.favoritesTitle)}">★</button>
            </div>
            <div class="friends-count">${fmtNum(visibleFriends.length)} / ${fmtNum(activeFriends.length)}</div>
        </div>
        ${body}
    `;

    renderFriendsRoomIfActive();
}

function renderFriendsRoomIfActive() {
    if (currentRoomRoute?.name === 'friends') {
        renderFriendsRoom();
    }
}

function setFriendFilterMode(mode) {
    friendFilterMode = mode === 'favorites' ? 'favorites' : 'friends';
    friendSearchQuery = '';
    renderFriendsPanel();
}

function updateFriendSearch(value) {
    friendSearchQuery = value || '';
    renderFriendsPanel();
    const searchInput = document.getElementById('friends-room-search') || document.getElementById('friends-search');
    if (searchInput) {
        const cursorPosition = searchInput.value.length;
        searchInput.focus({ preventScroll: true });
        searchInput.setSelectionRange(cursorPosition, cursorPosition);
    }
}

function getSelectedFriendNames() {
    return getPlayerInputs()
        .filter(input => input.dataset.friendUsername && selectedFriendUsernames.has(input.dataset.friendUsername))
        .map(input => input.value.trim())
        .filter(Boolean);
}

function getFilteredFriends() {
    const query = friendSearchQuery.trim().toLowerCase();
    const source = getFriendsForActiveFilter();
    if (!query) return source;

    return source.filter(friend => {
        const country = getFriendCountry(friend);
        return [
            friend?.username,
            friend?.country_code,
            friend?.country?.code,
            friend?.country?.name,
            country.label
        ].some(value => String(value ?? '').toLowerCase().includes(query));
    });
}

function getFriendsForActiveFilter() {
    if (friendFilterMode !== 'favorites') return friendsState.items;
    return friendsState.items.filter(friend => favoriteFriendIds.has(getFriendId(friend)));
}

function renderFriendItem(friend) {
    const username = friend?.username || 'osu!';
    const avatar = friend?.avatar_url || '';
    const country = getFriendCountry(friend);
    const selected = selectedFriendUsernames.has(normalizeUsername(username));
    const friendId = getFriendId(friend);
    const favorite = friendId && favoriteFriendIds.has(friendId);

    return `
        <div class="friend-card${selected ? ' friend-card--selected' : ''}" role="button" tabindex="0" data-friend-username="${escapeHtml(username)}" onclick="toggleFriendSelection(this.dataset.friendUsername)" onkeydown="handleFriendCardKey(event, this.dataset.friendUsername)">
            <button class="friend-favorite${favorite ? ' active' : ''}" type="button" data-friend-id="${escapeHtml(friendId)}" onclick="toggleFriendFavorite(event, this.dataset.friendId)" title="${escapeHtml(LANGS[currentLang].favoritesTitle)}" aria-label="${escapeHtml(LANGS[currentLang].favoritesTitle)}"${friendId ? '' : ' disabled'}>★</button>
            <img class="friend-avatar" src="${escapeHtml(avatar)}" alt="${escapeHtml(username)}">
            <div class="friend-info">
                <div class="friend-name">${escapeHtml(username)}</div>
                <div class="friend-country">
                    ${country.flag ? `<span class="friend-country-flag">${escapeHtml(country.flag)}</span>` : ''}
                    <span>${escapeHtml(country.label)}</span>
                </div>
            </div>
        </div>
    `;
}

function getFriendId(friend) {
    return friend?.id != null ? String(friend.id) : '';
}

function toggleFriendFavorite(event, friendId) {
    event.stopPropagation();
    const id = String(friendId || '');
    if (!id) return;

    if (favoriteFriendIds.has(id)) {
        favoriteFriendIds.delete(id);
    } else {
        favoriteFriendIds.add(id);
    }

    saveFavoriteFriendIds();
    renderFriendsPanel();
}

function handleFriendCardKey(event, username) {
    if (event.target.closest('.friend-favorite')) return;
    if (event.key !== 'Enter' && event.key !== ' ') return;

    event.preventDefault();
    toggleFriendSelection(username);
}

function getFriendCountry(friend) {
    const t = LANGS[currentLang];
    const code = friend?.country_code || friend?.country?.code || '';
    const label = friend?.country?.name || code || t.friendsUnknownCountry;

    return {
        flag: code ? getCountryFlag(code) : '',
        label
    };
}

function getPlayerInputs() {
    return ['p1', 'p2', 'p3', 'p4']
        .map(id => document.getElementById(id))
        .filter(Boolean);
}

function toggleFriendSelection(username) {
    const key = normalizeUsername(username);
    if (!key) return;

    if (selectedFriendUsernames.has(key)) {
        removeFriendSelection(username);
        return;
    }

    const freeInput = getPlayerInputs().find(input => !input.value.trim());
    if (!freeInput) return;

    selectedFriendUsernames.add(key);
    freeInput.value = username;
    freeInput.dataset.friendUsername = key;
    syncFriendSelectionsFromInputs();
}

function removeFriendSelection(username) {
    const key = normalizeUsername(username);
    selectedFriendUsernames.delete(key);

    getPlayerInputs().forEach(input => {
        if (input.dataset.friendUsername === key) {
            input.value = '';
            delete input.dataset.friendUsername;
        }
    });

    syncFriendSelectionsFromInputs();
}

function syncFriendSelectionsFromInputs() {
    getPlayerInputs().forEach(input => {
        const friendKey = input.dataset.friendUsername;
        if (!friendKey) return;

        if (normalizeUsername(input.value) !== friendKey) {
            selectedFriendUsernames.delete(friendKey);
            delete input.dataset.friendUsername;
        }
    });

    updateSearchButtonLabel();
    renderFriendsPanel();
}

function updateSearchButtonLabel() {
    const btn = document.getElementById('btn-search');
    if (!btn) return;

    const t = LANGS[currentLang];
    btn.textContent = selectedFriendUsernames.size ? t.compareFriends : t.search;
}

function createComparisonRecord(players, mode) {
    const cleanPlayers = players
        .map(player => String(player ?? '').trim())
        .filter(Boolean)
        .slice(0, 4);

    if (!cleanPlayers.length) return null;

    const normalizedKey = cleanPlayers
        .map(player => normalizeUsername(player))
        .sort()
        .join('|');

    return {
        id: `${mode}:${normalizedKey}`,
        players: cleanPlayers,
        mode,
        lastUsedAt: new Date().toISOString()
    };
}

function saveComparisonToHistory(players, mode) {
    const record = createComparisonRecord(players, mode);
    if (!record) return;

    comparisonHistory = [
        record,
        ...comparisonHistory.filter(item => item.id !== record.id)
    ].slice(0, COMPARISON_HISTORY_LIMIT);

    comparisonHistoryFilter = 'history';
    writeStoredComparisons(RECENT_COMPARISONS_STORAGE_KEY, comparisonHistory);
    renderComparisonHistoryPanel();
}

function renderComparisonHistoryPanel() {
    const panel = document.getElementById('comparison-history-panel');
    if (!panel) {
        renderHistoryRoomIfActive();
        return;
    }

    const hasAnyItems = comparisonHistory.length || favoriteComparisons.length;
    if (!hasAnyItems) {
        panel.innerHTML = '';
        panel.style.display = 'none';
        renderHistoryRoomIfActive();
        return;
    }

    const t = LANGS[currentLang];
    const activeItems = getComparisonItemsForActiveFilter();
    const visibleItems = getFilteredComparisonItems();
    const title = comparisonHistoryFilter === 'favorites' ? t.comparisonFavoritesTitle : t.historyTitle;
    const placeholder = comparisonHistoryFilter === 'favorites' ? t.comparisonFavoritesSearch : t.historySearch;

    let body = '';
    if (!activeItems.length) {
        body = `<div class="history-state">${escapeHtml(comparisonHistoryFilter === 'favorites' ? t.comparisonFavoritesEmpty : t.historyEmpty)}</div>`;
    } else if (!visibleItems.length) {
        body = `<div class="history-state">${escapeHtml(t.historyNoResults)}</div>`;
    } else {
        body = `
            <div class="history-grid">
                ${visibleItems.map(renderComparisonHistoryItem).join('')}
            </div>
        `;
    }

    panel.style.display = 'block';
    panel.innerHTML = `
        <div class="history-panel-toolbar">
            <label class="history-search-wrap">
                <span class="history-search-icon">⌕</span>
                <input
                    class="history-search"
                    id="history-search"
                    type="search"
                    value="${escapeHtml(comparisonHistorySearch)}"
                    placeholder="${escapeHtml(placeholder)}"
                    oninput="updateComparisonHistorySearch(this.value)"
                    autocomplete="off"
                    spellcheck="false">
            </label>
            <div class="history-panel-header">
                <span class="history-panel-mark">◇</span>
                <span>${escapeHtml(title)}</span>
            </div>
            <div class="history-filter-group" aria-label="${escapeHtml(title)}">
                <button class="history-filter-btn${comparisonHistoryFilter === 'history' ? ' active' : ''}" type="button" onclick="setComparisonHistoryFilter('history')" title="${escapeHtml(t.historyTitle)}" aria-label="${escapeHtml(t.historyTitle)}">≋</button>
                <button class="history-filter-btn${comparisonHistoryFilter === 'favorites' ? ' active' : ''}" type="button" onclick="setComparisonHistoryFilter('favorites')" title="${escapeHtml(t.comparisonFavoritesTitle)}" aria-label="${escapeHtml(t.comparisonFavoritesTitle)}">★</button>
            </div>
            <div class="history-count">${fmtNum(visibleItems.length)} / ${fmtNum(activeItems.length)}</div>
        </div>
        ${body}
    `;

    renderHistoryRoomIfActive();
}

function renderHistoryRoomIfActive() {
    if (currentRoomRoute?.name === 'history') {
        renderHistoryRoom();
    }
}

function setComparisonHistoryFilter(filter) {
    comparisonHistoryFilter = filter === 'favorites' ? 'favorites' : 'history';
    comparisonHistorySearch = '';
    renderComparisonHistoryPanel();
}

function updateComparisonHistorySearch(value) {
    comparisonHistorySearch = value || '';
    renderComparisonHistoryPanel();
    const searchInput = document.getElementById('history-room-search') || document.getElementById('history-search');
    if (searchInput) {
        const cursorPosition = searchInput.value.length;
        searchInput.focus({ preventScroll: true });
        searchInput.setSelectionRange(cursorPosition, cursorPosition);
    }
}

function getComparisonItemsForActiveFilter() {
    return comparisonHistoryFilter === 'favorites' ? favoriteComparisons : comparisonHistory;
}

function getFilteredComparisonItems() {
    const source = getComparisonItemsForActiveFilter();
    const query = comparisonHistorySearch.trim().toLowerCase();
    if (!query) return source;

    return source.filter(item => [
        item.mode,
        ...(item.players || [])
    ].some(value => String(value ?? '').toLowerCase().includes(query)));
}

function renderComparisonHistoryItem(item) {
    const t = LANGS[currentLang];
    const favorite = favoriteComparisons.some(fav => fav.id === item.id);
    const modeLabel = LANGS[currentLang].modes[item.mode] || item.mode;
    const usedAt = formatHistoryDate(item.lastUsedAt);

    return `
        <div class="history-card" role="button" tabindex="0" data-comparison-id="${escapeHtml(item.id)}" onclick="fillComparisonFromHistory(this.dataset.comparisonId)" onkeydown="handleComparisonHistoryKey(event, this.dataset.comparisonId)" title="${escapeHtml(t.fillComparison)}">
            <button class="history-favorite${favorite ? ' active' : ''}" type="button" data-comparison-id="${escapeHtml(item.id)}" onclick="toggleFavoriteComparison(event, this.dataset.comparisonId)" title="${escapeHtml(t.comparisonFavoritesTitle)}" aria-label="${escapeHtml(t.comparisonFavoritesTitle)}">★</button>
            <div class="history-players">${escapeHtml(item.players.join(' / '))}</div>
            <div class="history-meta">
                <span>${escapeHtml(modeLabel)}</span>
                <span>${escapeHtml(usedAt)}</span>
            </div>
            <button class="history-run" type="button" data-comparison-id="${escapeHtml(item.id)}" onclick="runComparisonFromHistory(event, this.dataset.comparisonId)" title="${escapeHtml(t.rerunComparison)}" aria-label="${escapeHtml(t.rerunComparison)}">↻</button>
        </div>
    `;
}

function formatHistoryDate(dateString) {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '';

    return date.toLocaleString(currentLang, {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getAllComparisonRecords() {
    const map = new Map();
    [...comparisonHistory, ...favoriteComparisons].forEach(item => map.set(item.id, item));
    return [...map.values()];
}

function getRecentHistoryPlayers(limit = 16) {
    const seen = new Set();
    const players = [];
    const records = [...comparisonHistory, ...favoriteComparisons]
        .filter(isValidComparisonRecord)
        .sort((a, b) => new Date(b.lastUsedAt || b.favoritedAt || 0) - new Date(a.lastUsedAt || a.favoritedAt || 0));

    records.forEach(record => {
        record.players.forEach(player => {
            const clean = String(player ?? '').trim();
            const key = normalizeUsername(clean);
            if (!clean || seen.has(key)) return;
            seen.add(key);
            players.push(clean);
        });
    });

    return players.slice(0, limit);
}

function loadHistoryPlayer(username) {
    const clean = String(username ?? '').trim();
    if (!clean) return;

    selectedFriendUsernames.delete(normalizeUsername(clean));
    const inputs = getPlayerInputs();
    const target = inputs.find(input => !input.value.trim()) || inputs[0];
    if (!target) return;

    target.value = clean;
    delete target.dataset.friendUsername;
    syncFriendSelectionsFromInputs();
    navigateToRoom('compare');
}

function findComparisonRecord(id) {
    return getAllComparisonRecords().find(item => item.id === id) || null;
}

function fillComparisonFromHistory(id, shouldNavigate = true) {
    const item = findComparisonRecord(id);
    if (!item) return;

    selectedFriendUsernames.clear();
    getPlayerInputs().forEach((input, index) => {
        input.value = item.players[index] || '';
        delete input.dataset.friendUsername;
    });

    const modeSelect = document.getElementById('gamemode');
    if (modeSelect) modeSelect.value = item.mode;

    updateSearchButtonLabel();
    renderFriendsPanel();
    renderHistoryRoomIfActive();

    if (shouldNavigate && currentRoomRoute?.name === 'history') {
        navigateToRoom('compare');
    }
}

async function runComparisonFromHistory(event, id) {
    event.stopPropagation();
    fillComparisonFromHistory(id, false);
    await doSearch();
}

function toggleFavoriteComparison(event, id) {
    event.stopPropagation();
    const item = findComparisonRecord(id);
    if (!item) return;

    if (favoriteComparisons.some(fav => fav.id === id)) {
        favoriteComparisons = favoriteComparisons.filter(fav => fav.id !== id);
    } else {
        favoriteComparisons = [
            { ...item, favoritedAt: new Date().toISOString() },
            ...favoriteComparisons.filter(fav => fav.id !== id)
        ];
    }

    writeStoredComparisons(FAVORITE_COMPARISONS_STORAGE_KEY, favoriteComparisons);
    renderComparisonHistoryPanel();
}

function handleComparisonHistoryKey(event, id) {
    if (event.target.closest('.history-favorite, .history-run')) return;
    if (event.key !== 'Enter' && event.key !== ' ') return;

    event.preventDefault();
    fillComparisonFromHistory(id);
}

function renderCompareSummaryValue(item) {
    if (!item.player) {
        return `<div class="compare-summary-value">${escapeHtml(item.value)}</div>`;
    }

    const creatorClass = isCreatorUsername(item.player) ? ' creator-name' : '';
    return `
        <div class="compare-summary-value">
            <span class="compare-summary-player${creatorClass}">${escapeHtml(item.player)}</span>
            <span class="compare-summary-metric">${escapeHtml(item.metric)}</span>
        </div>
    `;
}

function renderCompareSummary(users, topPlays, isSingle) {
    const summary = document.getElementById('compare-summary');
    if (!summary) return;

    const valid = users
        .map((user, idx) => user.ok ? { ...user, topPlay: topPlays[idx] } : null)
        .filter(Boolean);

    if (isSingle || valid.length < 2) {
        summary.innerHTML = '';
        summary.style.display = 'none';
        return;
    }

    const t = LANGS[currentLang].compare;
    const byPP = [...valid].sort((a, b) =>
        (b.data.statistics?.pp || 0) - (a.data.statistics?.pp || 0)
    );
    const leader = byPP[0];
    const runnerUp = byPP[1];
    const ppLead = Math.max(
        0,
        Math.round((leader.data.statistics?.pp || 0) - (runnerUp.data.statistics?.pp || 0))
    );

    const bestAcc = [...valid]
        .filter(item => typeof item.data.statistics?.hit_accuracy === 'number')
        .sort((a, b) => b.data.statistics.hit_accuracy - a.data.statistics.hit_accuracy)[0];

    const mostActive = [...valid]
        .filter(item => typeof item.data.statistics?.play_count === 'number')
        .sort((a, b) => b.data.statistics.play_count - a.data.statistics.play_count)[0];

    const bestTopPlay = [...valid]
        .filter(item => typeof item.topPlay?.pp === 'number')
        .sort((a, b) => (b.topPlay.pp || 0) - (a.topPlay.pp || 0))[0];

    const items = [
        {
            icon: 'Δ',
            label: t.ppLead,
            player: leader.data.username,
            metric: `+${fmtNum(ppLead)}pp`,
            detail: t.ppLeadVs.replace('{player}', runnerUp.data.username),
            tone: 'gold'
        },
        bestAcc && {
            icon: '◎',
            label: t.bestAcc,
            player: bestAcc.data.username,
            metric: fmtAcc(bestAcc.data.statistics.hit_accuracy),
            tone: 'cyan'
        },
        mostActive && {
            icon: '▶',
            label: t.playCount,
            player: mostActive.data.username,
            metric: fmtNum(mostActive.data.statistics.play_count),
            tone: 'pink'
        },
        bestTopPlay && {
            icon: '♛',
            label: t.bestTopPlay,
            player: bestTopPlay.data.username,
            metric: `${fmtNum(Math.round(bestTopPlay.topPlay.pp || 0))}pp`,
            tone: 'gold'
        }
    ].filter(Boolean);

    summary.innerHTML = items.map(item => `
        <div class="compare-summary-item compare-summary-item--${item.tone}">
            <div class="compare-summary-label">
                <span class="compare-summary-icon">${item.icon}</span>
                <span>${escapeHtml(item.label)}</span>
            </div>
            ${renderCompareSummaryValue(item)}
            ${item.detail ? `<div class="compare-summary-detail">${escapeHtml(item.detail)}</div>` : ''}
        </div>
    `).join('');

    summary.style.display = items.length ? 'grid' : 'none';
}

// ══ TOP PLAY COMPACTO (cards multi-player) ══
function renderTopPlayCompact(score) {
    const t = LANGS[currentLang];
    if (!score) {
        return `<div class="tp-compact">
            <div class="tp-compact-info">
                <div class="tp-compact-label">${t.topPlay}</div>
                <div class="tp-compact-title" style="color:var(--muted)">${t.noTopPlay}</div>
            </div>
        </div>`;
    }

    const cover = getCoverUrl(score);
    const mapName = score.beatmapset?.title || '—';
    const mods = getMods(score);
    const pp = Math.round(score.pp || 0);
    const mapUrl = getBeatmapUrl(score);

    return `
    <div class="tp-compact">
        ${cover ? `<img class="tp-compact-cover" src="${cover}" alt="cover" onerror="this.style.display='none'">` : ''}
        <div class="tp-compact-info">
            <div class="tp-compact-label">♛ ${t.topPlay}</div>
            <div class="tp-compact-title">${mapName}</div>
            <div class="tp-compact-mods">${renderModChips(mods)}</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:0.3rem;flex-shrink:0">
            <div class="tp-compact-pp">${fmtNum(pp)}<span>pp</span></div>
            <a class="tp-compact-link" href="${mapUrl}" target="_blank" rel="noopener" title="Ver en osu!">↗</a>
        </div>
    </div>`;
}

// ══ TOP PLAY FULL (single player, derecha de la card) ══
function renderTopPlayFull(score) {
    const t = LANGS[currentLang];
    if (!score) {
        return `<div class="tp-full" style="justify-content:center;align-items:center;">
            <div style="color:var(--muted);font-family:'Oswald',sans-serif;font-size:0.8rem;letter-spacing:0.2em">${t.noTopPlay.toUpperCase()}</div>
        </div>`;
    }

    const cover = getCoverUrl(score);
    const mapName = score.beatmapset?.title || '—';
    const artist = score.beatmapset?.artist || '';
    const diff = score.beatmap?.version || '';
    const stars = score.beatmap?.difficulty_rating?.toFixed(2);
    const mods = getMods(score);
    const pp = Math.round(score.pp || 0);
    const acc = (score.accuracy * 100).toFixed(2);
    const maxCombo = score.max_combo || 0;
    const rank = score.rank || 'D';
    const dateStr = fmtDate(score.ended_at || score.created_at);
    const mapUrl = getBeatmapUrl(score);

    return `
    <div class="tp-full">
        <div class="tp-full-header">
            <span class="tp-full-crown">♛</span>
            <span class="tp-full-label">${t.topPlay}</span>
        </div>
        <div class="tp-full-body">
            <div class="tp-full-cover-wrap">
                ${cover
            ? `<img class="tp-full-cover" src="${cover}" alt="cover" onerror="this.style.display='none'">`
            : `<div class="tp-full-cover" style="background:var(--dark3);display:flex;align-items:center;justify-content:center;font-size:2rem;opacity:0.3">♫</div>`}
            </div>
            <div class="tp-full-info">
                <div class="tp-full-map-name">${mapName}</div>
                <div class="tp-full-artist">by ${artist}</div>
                <div class="tp-full-tags">
                    ${renderModChips(mods)}
                    ${stars ? `<span class="tp-full-stars">✦ ${stars}</span>` : ''}
                    ${diff ? `<span style="font-family:'Oswald',sans-serif;font-size:0.65rem;color:var(--muted);letter-spacing:0.1em">[${diff}]</span>` : ''}
                </div>
                <div class="tp-full-pp-row">
                    <span class="tp-full-pp-label">${t.ppGained}</span>
                    <div class="tp-full-pp-value">${fmtNum(pp)}<span>pp</span></div>
                </div>
            </div>
        </div>
        <div class="tp-full-mini-stats">
            <div class="tp-mini-stat">
                <div class="tp-mini-label">${t.stats.accuracy}</div>
                <div class="tp-mini-val acc">${acc}%</div>
            </div>
            <div class="tp-mini-stat">
                <div class="tp-mini-label">${t.stats.maxCombo}</div>
                <div class="tp-mini-val">${fmtNum(maxCombo)}x</div>
            </div>
            <div class="tp-mini-stat">
                <div class="tp-mini-label">${t.stats.rank}</div>
                <div class="${getRankClass(rank)}">${getRankDisplay(rank)}</div>
            </div>
            <div class="tp-mini-stat">
                <div class="tp-mini-label">${t.stats.date}</div>
                <div class="tp-mini-val date-val" style="white-space:pre-line;font-size:0.7rem">${dateStr}</div>
            </div>
        </div>
        <a class="tp-full-openmap" href="${mapUrl}" target="_blank" rel="noopener">↗ ${t.openMap.replace('↗ ', '')}</a>
    </div>`;
}

// ══ RENDER CARD ══
function renderCard(user, rank, maxPP, idx, topPlay, isSingle) {
    const t = LANGS[currentLang];
    const pp = Math.round(user.statistics?.pp || 0);
    const barPct = maxPP > 0 ? (pp / maxPP * 100) : 0;
    const delay = idx * 0.15;
    const isCreator = user.username.toLowerCase() === 'manu is washed';
    const avatarUrl = user.avatar_url || 'https://osu.ppy.sh/images/layout/avatar-guest.png';
    const flag = getCountryFlag(user.country_code);
    const title = getUserTitle(pp);
    const activity = getActivityLabel(user.last_visit);

    const card = document.createElement('div');
    card.className = 'player-card';
    card.style.animationDelay = delay + 's';

    // ── Layout VERTICAL (single y multi usan el mismo layout) ──
    card.innerHTML = `
    <div class="card-rank-badge">#${rank}</div>
    <div class="focus-hint">${t.clickToExpand}</div>

    <div class="card-avatar-section">
        <div class="avatar-frame${isCreator ? ' creator-frame' : ''}">
            <div class="avatar-glow"></div>
            <img class="avatar-img" src="${avatarUrl}" alt="${user.username}"
                 onerror="this.src='https://osu.ppy.sh/images/layout/avatar-guest.png'">
        </div>
        <div class="card-identity">
            <span class="country-flag">${flag}</span>
            <div class="player-name${isCreator ? ' creator-name' : ''}">${user.username}</div>
            <div class="player-title${isCreator ? ' creator-title' : ''}">${isCreator ? 'PAGE CREATOR' : title}</div>
            ${activity ? `<div class="activity-indicator${activity.active ? ' activity-now' : ''}">${activity.text}</div>` : ''}
        </div>
    </div>

    <div class="pp-section">
        <div class="pp-label">${t.stats.pp}</div>
        <div class="pp-value">${fmtNum(pp)}<span class="pp-unit">pp</span></div>
        <div class="pp-bar-wrap">
            <div class="pp-bar-bg">
                <div class="pp-bar-fill" data-pct="${isSingle ? 100 : barPct}"></div>
            </div>
        </div>
    </div>

    ${renderTopPlayCompact(topPlay)}

    <div class="stats-grid">
        <div class="stat-cell">
            <div class="stat-label">${t.stats.acc}</div>
            <div class="stat-value accent">${fmtAcc(user.statistics?.hit_accuracy)}</div>
        </div>
        <div class="stat-cell">
            <div class="stat-label">${t.stats.playcount}</div>
            <div class="stat-value">${fmtNum(user.statistics?.play_count)}</div>
        </div>
        <div class="stat-cell">
            <div class="stat-label">${t.stats.playtime}</div>
            <div class="stat-value">${fmtTime(user.statistics?.play_time)}</div>
        </div>
        <div class="stat-cell">
            <div class="stat-label">${t.stats.score}</div>
            <div class="stat-value gold">${fmtNum(user.statistics?.total_score)}</div>
        </div>
    </div>

    <div class="rank-section">
        <div class="rank-global">
            <div class="rank-num">#${fmtNum(user.statistics?.global_rank) || '—'}</div>
            <div class="rank-type">${t.stats.global}</div>
        </div>
        <div class="rank-divider"></div>
        <div class="rank-global">
            <div class="rank-num">#${fmtNum(user.statistics?.country_rank) || '—'}</div>
            <div class="rank-type">${user.country_code || t.stats.country}</div>
        </div>
        <div class="rank-divider"></div>
        <div class="rank-global">
            <div class="rank-num" style="font-size:1rem;">${user.statistics?.level?.current || '—'}</div>
            <div class="rank-type">${t.stats.level}</div>
        </div>
    </div>

    <button class="focus-btn" title="Focus Mode" onclick="openFocus(event, this)">⤢</button>`;

    // Guardar datos en el botón para el modal
    card.querySelector('.focus-btn').__userData = user;
    card.querySelector('.focus-btn').__topPlay = topPlay;

    // Click en la card (no en botón/link) también abre focus
    card.addEventListener('click', (e) => {
        if (e.target.closest('.tp-compact-link') || e.target.closest('.focus-btn')) return;
        openFocusWithData(user, topPlay);
    });

    return card;
}

// ══ FOCUS MODE ══
function openFocus(e, btn) {
    e.stopPropagation();
    openFocusWithData(btn.__userData, btn.__topPlay);
}

function openFocusWithData(user, topPlay) {
    const t = LANGS[currentLang];
    const isCreator = user.username.toLowerCase() === 'manu is washed';
    const pp = Math.round(user.statistics?.pp || 0);

    // Avatar
    const avatarEl = document.getElementById('focus-avatar');
    avatarEl.src = user.avatar_url || 'https://osu.ppy.sh/images/layout/avatar-guest.png';

    const avatarWrap = document.getElementById('focus-avatar-wrap');
    avatarWrap.className = 'focus-avatar-wrap' + (isCreator ? ' creator-frame' : '');

    // Identidad
    document.getElementById('focus-flag').textContent = getCountryFlag(user.country_code);

    const nameEl = document.getElementById('focus-name');
    nameEl.textContent = user.username;
    nameEl.className = 'focus-player-name' + (isCreator ? ' creator-name' : '');

    const titleEl = document.getElementById('focus-title');
    titleEl.textContent = isCreator ? 'PAGE CREATOR' : getUserTitle(pp);
    titleEl.className = 'focus-player-title' + (isCreator ? ' creator-title' : '');

    const activity = getActivityLabel(user.last_visit);
    const activityEl = document.getElementById('focus-activity');
    if (activity) {
        activityEl.textContent = activity.text;
        activityEl.className = 'focus-activity activity-indicator' + (activity.active ? ' activity-now' : '');
    } else {
        activityEl.textContent = '';
        activityEl.className = 'focus-activity';
    }

    const profileLink = document.getElementById('focus-profile-link');
    profileLink.textContent = t.rooms.viewFullProfile;
    profileLink.onclick = () => {
        closeFocusBtn();
        navigateToRoom('player', user.username);
    };

    document.getElementById('focus-pp').innerHTML =
        `${fmtNum(pp)}<span class="focus-pp-unit">pp</span>`;

    // Peak rank y tendencia
    const peakRank = user.rank_highest?.rank;
    const trend = getRankTrend(user.rank_history);
    const metricsEl = document.getElementById('focus-rank-metrics');
    if (peakRank || trend) {
        let trendHtml = '';
        if (trend) {
            if (trend.state === 'stable') {
                trendHtml = `<div class="focus-trend focus-trend--stable">${t.trendStable} <span class="focus-trend-label">${t.trend90}</span></div>`;
            } else {
                const arrow = trend.state === 'up' ? '↗' : '↘';
                const sign = trend.state === 'up' ? '+' : '−';
                const cls = trend.state === 'up' ? 'focus-trend--up' : 'focus-trend--down';
                trendHtml = `<div class="focus-trend ${cls}">${arrow} ${sign}${fmtNum(Math.abs(trend.diff))} <span class="focus-trend-label">${t.trend90}</span></div>`;
            }
        }
        metricsEl.innerHTML = `
            ${peakRank ? `<div class="focus-peak"><span class="focus-peak-icon">★</span><span class="focus-peak-label">${t.peakRank}</span><span class="focus-peak-value">#${fmtNum(peakRank)}</span></div>` : ''}
            ${trendHtml}`;
    } else {
        metricsEl.innerHTML = '';
    }

    // Ranks
    document.getElementById('focus-ranks').innerHTML = `
        <div class="focus-rank-item">
            <div class="focus-rank-num">#${fmtNum(user.statistics?.global_rank) || '—'}</div>
            <div class="focus-rank-type">${t.stats.global}</div>
        </div>
        <div class="focus-rank-item">
            <div class="focus-rank-num">#${fmtNum(user.statistics?.country_rank) || '—'}</div>
            <div class="focus-rank-type">${user.country_code || t.stats.country}</div>
        </div>
        <div class="focus-rank-item">
            <div class="focus-rank-num">${user.statistics?.level?.current || '—'}</div>
            <div class="focus-rank-type">${t.stats.level}</div>
        </div>`;

    // Stats extendidos
    document.getElementById('focus-stats').innerHTML = `
        <div class="focus-stat-cell">
            <div class="focus-stat-label">${t.stats.acc}</div>
            <div class="focus-stat-val accent">${fmtAcc(user.statistics?.hit_accuracy)}</div>
        </div>
        <div class="focus-stat-cell">
            <div class="focus-stat-label">${t.stats.playcount}</div>
            <div class="focus-stat-val">${fmtNum(user.statistics?.play_count)}</div>
        </div>
        <div class="focus-stat-cell">
            <div class="focus-stat-label">${t.stats.playtime}</div>
            <div class="focus-stat-val">${fmtTime(user.statistics?.play_time)}</div>
        </div>
        <div class="focus-stat-cell">
            <div class="focus-stat-label">${t.stats.score}</div>
            <div class="focus-stat-val gold">${fmtNum(user.statistics?.total_score)}</div>
        </div>`;

    // Top play en modal
    renderFocusTopPlay(topPlay);
    document.getElementById('focus-score-client').innerHTML = topPlay ? renderScoreClient(topPlay) : '';

    // Fondo beatmap
    const bgEl = document.getElementById('focus-bg');
    bgEl.className = 'focus-bg';
    bgEl.style.backgroundImage = '';
    const bgCover = topPlay?.beatmapset?.covers?.cover
        || topPlay?.beatmapset?.covers?.['cover@2x']
        || getCoverUrl(topPlay);
    if (bgCover) {
        const img = new Image();
        img.onload = () => {
            bgEl.style.backgroundImage = `url('${bgCover}')`;
            bgEl.classList.add('loaded');
        };
        img.src = bgCover;
    }

    // Abrir
    const overlay = document.getElementById('focus-overlay');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Scroll al top del modal
    document.getElementById('focus-modal').scrollTop = 0;
}

function renderFocusTopPlay(score) {
    const t = LANGS[currentLang];
    const body = document.getElementById('focus-topplay-body');

    if (!score) {
        body.innerHTML = `<div style="color:var(--muted);font-family:'Oswald',sans-serif;font-size:0.85rem;letter-spacing:0.2em;padding:1rem">${t.noTopPlay.toUpperCase()}</div>`;
        return;
    }

    const cover = getCoverUrl(score);
    const mapName = score.beatmapset?.title || '—';
    const artist = score.beatmapset?.artist || '';
    const diff = score.beatmap?.version || '';
    const stars = score.beatmap?.difficulty_rating?.toFixed(2);
    const mods = getMods(score);
    const pp = Math.round(score.pp || 0);
    const acc = (score.accuracy * 100).toFixed(2);
    const maxCombo = score.max_combo || 0;
    const rank = score.rank || 'D';
    const dateStr = fmtDate(score.ended_at || score.created_at);
    const mapUrl = getBeatmapUrl(score);
    // Misses: API v2 expone statistics.miss o statistics.count_miss
    const misses = score.statistics?.miss ?? score.statistics?.count_miss ?? 0;
    // Replay: API v2 indica si hay replay con replay o has_replay
    const hasReplay = score.replay === true || score.has_replay === true;
    const replayUrl = hasReplay && score.id
        ? `https://osu.ppy.sh/scores/${score.id}/download`
        : null;

    body.innerHTML = `
    <div class="focus-tp-cover-wrap">
        ${cover
            ? `<img class="focus-tp-cover" src="${cover}" alt="cover" onerror="this.style.display='none'">`
            : `<div class="focus-tp-cover" style="background:var(--dark3);display:flex;align-items:center;justify-content:center;font-size:3rem;opacity:0.3">♫</div>`}
    </div>
    <div class="focus-tp-info">
        <div class="focus-tp-map">${mapName}</div>
        <div class="focus-tp-artist">by ${artist}</div>
        <div class="focus-tp-tags">
            ${renderModChips(mods)}
            ${stars ? `<span class="tp-full-stars">✦ ${stars}</span>` : ''}
            ${diff ? `<span style="font-family:'Oswald',sans-serif;font-size:0.7rem;color:var(--muted);letter-spacing:0.1em">[${diff}]</span>` : ''}
        </div>
        <div class="focus-tp-pp-row">
            <span class="focus-tp-pp-label">${t.ppGained}</span>
            <div class="focus-tp-pp-value">${fmtNum(pp)}<span>pp</span></div>
        </div>
        <div class="focus-tp-mini-grid">
            <div class="focus-tp-mini-cell">
                <div class="focus-tp-mini-label">${t.stats.accuracy}</div>
                <div class="focus-tp-mini-val acc">${acc}%</div>
            </div>
            <div class="focus-tp-mini-cell">
                <div class="focus-tp-mini-label">${t.stats.maxCombo}</div>
                <div class="focus-tp-mini-val">${fmtNum(maxCombo)}x</div>
            </div>
            <div class="focus-tp-mini-cell">
                <div class="focus-tp-mini-label">${t.stats.rank}</div>
                <div class="${getRankClass(rank)}">${getRankDisplay(rank)}</div>
            </div>
            <div class="focus-tp-mini-cell">
                <div class="focus-tp-mini-label">${t.stats.misses}</div>
                <div class="focus-tp-mini-val${misses > 0 ? ' miss-val' : ''}">${misses > 0 ? `${misses} ✗` : '0 ✓'}</div>
            </div>
            <div class="focus-tp-mini-cell date-cell">
                <div class="focus-tp-mini-label">${t.stats.date}</div>
                <div class="focus-tp-mini-val date-sm" style="white-space:pre-line">${dateStr}</div>
            </div>
        </div>
        <div class="focus-tp-actions">
            <a class="focus-tp-openmap" href="${mapUrl}" target="_blank" rel="noopener">↗ ${t.openMap.replace('↗ ', '')}</a>
            ${replayUrl
            ? `<a class="focus-tp-replay" href="${replayUrl}" target="_blank" rel="noopener">⬇ ${t.downloadReplay}</a>`
            : `<span class="focus-tp-replay focus-tp-replay--disabled">⬇ ${t.replayUnavailable}</span>`
        }
        </div>
    </div>`;
}

function closeFocusBtn() {
    const overlay = document.getElementById('focus-overlay');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    // Limpiar fondo
    setTimeout(() => {
        const bg = document.getElementById('focus-bg');
        bg.className = 'focus-bg';
        bg.style.backgroundImage = '';
    }, 400);
}

function closeFocus(e) {
    if (e.target === document.getElementById('focus-overlay')) {
        closeFocusBtn();
    }
}

// ESC para cerrar
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        const focusOverlay = document.getElementById('focus-overlay');
        if (focusOverlay?.classList.contains('active')) {
            closeFocusBtn();
            return;
        }

        if (shouldReturnToResultsFromRoom()) {
            navigateToRoom('results');
            return;
        }

        if (currentRoomRoute?.name === 'top-plays' && currentRoomRoute.param) {
            navigateToRoom('player', currentRoomRoute.param);
            return;
        }

        if (currentRoomRoute?.name === 'recent' && currentRoomRoute.param) {
            navigateToRoom('player', currentRoomRoute.param);
            return;
        }
    }

    if (e.key === 'Enter' && document.getElementById('landing').style.display !== 'none') {
        doSearch();
    }
});

// ══ BÚSQUEDA ══
async function doSearch() {
    const names = [
        document.getElementById('p1').value.trim(),
        document.getElementById('p2').value.trim(),
        document.getElementById('p3').value.trim(),
        document.getElementById('p4').value.trim()
    ].filter(Boolean);

    if (!names.length) return;

    // Limpiar cache al hacer nueva búsqueda
    topPlayCache = {};
    topPlaysCache.clear();
    recentPlaysCache.clear();

    currentPlayers = names;
    currentMode = document.getElementById('gamemode').value;
    saveComparisonToHistory(currentPlayers, currentMode);

    history.replaceState(null, '', buildRoomHash('results'));
    showResultsRoom();


    const t = LANGS[currentLang];
    document.getElementById('mode-display').innerHTML =
        `<div class="mode-chip">${t.modes[currentMode] || currentMode}</div>
         <div class="mode-chip">${names.length} ${names.length === 1 ? t.players.one : t.players.many}</div>`;

    await loadCards();

    if (refreshTimer) clearInterval(refreshTimer);
    refreshTimer = setInterval(refreshData, 60000);
}

async function loadCards() {
    const isSingle = currentPlayers.length === 1;
    const container = document.getElementById('cards');

    container.className = 'cards-container';
    if (isSingle) container.classList.add('single-player');
    else if (currentPlayers.length === 4) container.classList.add('four-cards');

    container.innerHTML = '';
    document.getElementById('podium-banner').style.display = 'none';
    const summary = document.getElementById('compare-summary');
    if (summary) {
        summary.innerHTML = '';
        summary.style.display = 'none';
    }

    // Spinners
    currentPlayers.forEach(() => {
        const loadDiv = document.createElement('div');
        loadDiv.className = 'card-loading';
        loadDiv.innerHTML = `<div class="spinner"></div>
                             <div class="loading-text">${LANGS[currentLang].loading}</div>`;
        container.appendChild(loadDiv);
    });

    // Fetch usuarios y top plays en paralelo
    const [userResults, bestResults] = await Promise.all([
        Promise.allSettled(currentPlayers.map(name => fetchPlayer(name, currentMode))),
        Promise.allSettled(currentPlayers.map(name => fetchBestPlay(name, currentMode)))
    ]);

    // Timestamp
    const now = new Date();
    document.getElementById('last-update').textContent =
        now.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const users = userResults.map((r, i) => {
        if (r.status === 'fulfilled') return { ok: true, data: r.value, name: currentPlayers[i] };
        return { ok: false, error: r.reason.message, name: currentPlayers[i] };
    });

    const topPlays = bestResults.map(r => r.status === 'fulfilled' ? r.value : null);

    // Errores globales
    const t = LANGS[currentLang];
    const errorBox = document.getElementById('global-error');
    if (errorBox) {
        errorBox.style.display = 'none';
        const failed = users.filter(u => !u.ok).length;
        const success = users.filter(u => u.ok).length;
        if (failed > 0) {
            let msg = failed === users.length ? t.errors.all
                : failed === 1 ? t.errors.one
                    : t.errors.two;
            if (success > 0) msg += ' — ' + t.errors.mixed;
            errorBox.textContent = msg;
            errorBox.style.display = 'block';
        }
    }

    // Ordenar por PP
    const sorted = [...users].filter(u => u.ok)
        .sort((a, b) => (b.data.statistics?.pp || 0) - (a.data.statistics?.pp || 0));
    const maxPP = sorted.length ? (sorted[0].data.statistics?.pp || 1) : 1;

    // Podio (solo para multi)
    if (!isSingle && sorted.length >= 2) {
        document.getElementById('podium-banner').style.display = 'flex';
        document.getElementById('podium-winner').textContent =
            `${sorted[0].data.username} — ${fmtNum(Math.round(sorted[0].data.statistics?.pp || 0))}pp`;
    }

    renderCompareSummary(users, topPlays, isSingle);

    // Render
    container.innerHTML = '';
    users.forEach((u, idx) => {
        if (u.ok) {
            const rank = isSingle ? 1 : (sorted.findIndex(s => s.data.id === u.data.id) + 1);
            const card = renderCard(u.data, rank, maxPP, idx, topPlays[idx], isSingle);
            container.appendChild(card);
        } else {
            const errDiv = document.createElement('div');
            errDiv.className = 'card-error';
            errDiv.style.animationDelay = (idx * 0.15) + 's';
            errDiv.innerHTML = `
                <div class="error-icon">!</div>
                <div class="error-text">${u.error}</div>
                <div style="margin-top:0.5rem;font-size:0.7rem;color:#88446688;font-family:'Oswald',sans-serif;letter-spacing:0.1em;">${u.name}</div>`;
            container.appendChild(errDiv);
        }
    });

    // Animar barras PP
    setTimeout(() => {
        document.querySelectorAll('.pp-bar-fill').forEach(el => {
            el.style.width = el.dataset.pct + '%';
        });
    }, 200);
}

async function refreshData() {
    // Limpiar cache para obtener datos frescos
    topPlayCache = {};
    topPlaysCache.clear();
    recentPlaysCache.clear();
    const btn = document.getElementById('btn-refresh');
    btn.textContent = LANGS[currentLang].refreshing;
    btn.style.opacity = '0.5';
    btn.style.pointerEvents = 'none';
    try {
        await loadCards();
    } finally {
        btn.textContent = LANGS[currentLang].refresh;
        btn.style.opacity = '1';
        btn.style.pointerEvents = '';
    }
}

function goBack() {
    navigateToRoom('compare');
}

// ══ HIDE LANG-SWITCH ON SCROLL ══
let lastScrollY = window.scrollY;
window.addEventListener('scroll', () => {
    const langSwitch = document.querySelector('.lang-switch');
    const topRightControls = document.querySelector('.top-right-controls');
    if (window.scrollY > lastScrollY && window.scrollY > 80) {
        langSwitch.classList.add('hidden');
        topRightControls.classList.add('hidden');
    } else {
        langSwitch.classList.remove('hidden');
        topRightControls.classList.remove('hidden');
    }
    lastScrollY = window.scrollY;
});

// Init
applyLang();
window.addEventListener('hashchange', handleRouteChange);
handleRouteChange();
initAuth();
getPlayerInputs().forEach(input => {
    input.addEventListener('input', syncFriendSelectionsFromInputs);
});
