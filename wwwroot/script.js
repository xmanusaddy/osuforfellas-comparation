/* ══════════════════════════════════════
   fellas comparation — script.js
   ══════════════════════════════════════ */

// ══ IDIOMAS ══
const INITIAL_URL_PARAMS = new URLSearchParams(window.location.search);
const SUPPORTED_LANGS = ['es', 'en', 'de'];
const SHARE_MODE = INITIAL_URL_PARAMS.get('share');
const IS_SHARE_COMPARE_MODE = SHARE_MODE === 'compare';
const IS_SHARE_ROOM_MODE = SHARE_MODE === 'room';
const IS_SHARE_MODE = IS_SHARE_COMPARE_MODE || IS_SHARE_ROOM_MODE;
const HAS_LINKED_COMPARE_PARAMS = INITIAL_URL_PARAMS.has('player') || INITIAL_URL_PARAMS.has('players');
const requestedLang = INITIAL_URL_PARAMS.get('lang');
let currentLang = SUPPORTED_LANGS.includes(requestedLang)
    ? requestedLang
    : (localStorage.getItem('lang') || 'es');
if (IS_SHARE_MODE) {
    window.__osuShareReady = false;
    window.__osuShareError = '';
}
const FRIEND_FAVORITES_STORAGE_KEY = 'osu_friend_favorites';
const RECENT_COMPARISONS_STORAGE_KEY = 'osu_recent_comparisons';
const FAVORITE_COMPARISONS_STORAGE_KEY = 'osu_favorite_comparisons';
const COMPARISON_HISTORY_LIMIT = 20;
const DEFAULT_TOP_PLAYS_LIMIT = 10;
const MAX_TOP_PLAYS_LIMIT = 20;
const DUEL_TOP_PLAYS_LIMIT = 5;
const DISCORD_TOP_PLAYS_PAGE_SIZE = 4;
const DISCORD_RECENT_PAGE_SIZE = 4;
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
        soundOn: 'Activar sonidos',
        soundOff: 'Silenciar sonidos',
        soundVolume: 'Volumen de sonidos',
        createdBy: 'creado por',
        terms: 'términos',
        privacy: 'privacidad',
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
            page: 'Página',
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
        activityNow: 'Activo ahora',
        activityMin: 'Activo hace {n} min',
        activityHour: 'Activo hace {n} h',
        activityDay: 'Activo hace {n} días',
        activityMonth: 'Activo hace {n} meses',
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
            bestTopPlay: 'Mejor Top Play',
            breakdownKicker: 'Análisis',
            breakdownTitle: 'Desglose de comparación',
            duelKicker: '1v1',
            duelTitle: 'Duelo directo',
            duelPlayers: '2 jugadores',
            duelToggleOn: 'Activar modo duelo',
            duelToggleOff: 'Volver a tradicional',
            duelClose: 'Volver a comparación',
            duelRounds: 'Rounds del duelo',
            duelVs: 'VS',
            duelScore: 'Marcador',
            duelTie: 'Empate técnico',
            duelNoPoint: 'Sin punto',
            duelPoint: '+1 punto',
            duelRoundWinDetail: 'Punto por {diff} de ventaja.',
            duelRoundTieDetail: 'Sin punto: los valores están demasiado cerca.',
            duelWinnerLine: '{player} gana {score} {reason}.',
            duelTieLine: 'Duelo empatado {score}.',
            duelReasonPeak: 'por pico de skill',
            duelReasonConsistency: 'por consistencia',
            duelReasonActivity: 'por actividad general',
            duelReasonOverall: 'por ventaja general',
            duelRankDiff: '{value} puestos',
            duelTopFive: 'Top 5 plays',
            duelTopFiveTotal: 'Total Top 5',
            duelNoTopFive: 'Sin top plays',
            duelCategoryReadout: 'Lectura por estilo',
            duelCategoryOverall: 'General',
            duelCategoryPeak: 'Pico de skill',
            duelCategoryConsistency: 'Consistencia',
            duelCategoryActivity: 'Actividad general',
            duelCategoryEdge: 'Ventaja de {player}',
            duelCategoryNoEdge: 'Sin ventaja clara',
            leaderBadge: 'Líder',
            closeGap: 'Muy parejo',
            clearLead: 'Ventaja clara',
            bigGap: 'Gap grande',
            metricPp: 'PP total',
            metricAccuracy: 'Precisión',
            metricPlayCount: 'Partidas',
            metricPlayTime: 'Tiempo jugado',
            metricGlobalRank: 'Rank global',
            metricTopPlay: 'Top Play',
            metricTopFivePp: 'Top 5 PP',
            metricTotalScore: 'Score total',
            metricTotalHits: 'Hits totales',
            metricMaxCombo: 'Max combo',
            metricReplaysWatched: 'Replays vistos por otros',
            styleLabel: 'Estilo',
            styleTags: {
                ppLeader: 'Líder PP',
                accuracyDemon: 'Demonio acc',
                grinder: 'Grinder',
                topPlayCarry: 'Top Play Carry',
                underdog: 'Underdog',
                balanced: 'Balanceado'
            },
            styleTagDescriptions: {
                ppLeader: 'Tiene más PP que el resto en esta comparación.',
                accuracyDemon: 'Lidera la precisión o está por encima de 98% accuracy.',
                grinder: 'Destaca por partidas jugadas o tiempo jugado.',
                topPlayCarry: 'Su mejor jugada pesa mucho comparada con su PP total.',
                underdog: 'No lidera PP, pero gana una métrica importante.',
                balanced: 'Está fuerte en varias métricas sin depender de una sola.'
            }
        },
        stats: {
            pp: 'Performance Points',
            acc: 'Precisión',
            playcount: 'Partidas',
            playtime: 'Tiempo jugado',
            score: 'Score total',
            totalHits: 'Hits totales',
            replaysWatched: 'Replays vistos por otros',
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
        soundOn: 'Enable sounds',
        soundOff: 'Mute sounds',
        soundVolume: 'Sound volume',
        createdBy: 'created by',
        terms: 'terms',
        privacy: 'privacy',
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
            page: 'Page',
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
        activityNow: 'Active now',
        activityMin: 'Active {n} min ago',
        activityHour: 'Active {n} h ago',
        activityDay: 'Active {n} days ago',
        activityMonth: 'Active {n} months ago',
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
            bestTopPlay: 'Best Top Play',
            breakdownKicker: 'Breakdown',
            breakdownTitle: 'Comparison Breakdown',
            duelKicker: '1v1',
            duelTitle: 'Direct Duel',
            duelPlayers: '2 players',
            duelToggleOn: 'Enable duel mode',
            duelToggleOff: 'Back to traditional',
            duelClose: 'Back to comparison',
            duelRounds: 'Duel rounds',
            duelVs: 'VS',
            duelScore: 'Score',
            duelTie: 'Technical tie',
            duelNoPoint: 'No point',
            duelPoint: '+1 point',
            duelRoundWinDetail: 'Point from a {diff} edge.',
            duelRoundTieDetail: 'No point: values are too close.',
            duelWinnerLine: '{player} wins {score} {reason}.',
            duelTieLine: 'Duel tied {score}.',
            duelReasonPeak: 'through peak skill',
            duelReasonConsistency: 'through consistency',
            duelReasonActivity: 'through general activity',
            duelReasonOverall: 'through overall edge',
            duelRankDiff: '{value} spots',
            duelTopFive: 'Top 5 plays',
            duelTopFiveTotal: 'Top 5 total',
            duelNoTopFive: 'No top plays',
            duelCategoryReadout: 'Style readout',
            duelCategoryOverall: 'Overall',
            duelCategoryPeak: 'Peak skill',
            duelCategoryConsistency: 'Consistency',
            duelCategoryActivity: 'General activity',
            duelCategoryEdge: 'Edge for {player}',
            duelCategoryNoEdge: 'No clear edge',
            leaderBadge: 'Leader',
            closeGap: 'Very close',
            clearLead: 'Clear lead',
            bigGap: 'Big gap',
            metricPp: 'Total PP',
            metricAccuracy: 'Accuracy',
            metricPlayCount: 'Play Count',
            metricPlayTime: 'Play Time',
            metricGlobalRank: 'Global Rank',
            metricTopPlay: 'Top Play',
            metricTopFivePp: 'Top 5 PP',
            metricTotalScore: 'Total Score',
            metricTotalHits: 'Total Hits',
            metricMaxCombo: 'Max Combo',
            metricReplaysWatched: 'Replays watched by others',
            styleLabel: 'Style',
            styleTags: {
                ppLeader: 'PP Leader',
                accuracyDemon: 'Accuracy Demon',
                grinder: 'Grinder',
                topPlayCarry: 'Top Play Carry',
                underdog: 'Underdog',
                balanced: 'Balanced'
            },
            styleTagDescriptions: {
                ppLeader: 'Has the highest PP in this comparison.',
                accuracyDemon: 'Leads accuracy or sits above 98% accuracy.',
                grinder: 'Stands out in play count or play time.',
                topPlayCarry: 'Their best play is heavy compared with their total PP.',
                underdog: 'Does not lead PP, but wins an important metric.',
                balanced: 'Ranks strongly across several metrics without relying on one.'
            }
        },
        stats: {
            pp: 'Performance Points',
            acc: 'Accuracy',
            playcount: 'Play Count',
            playtime: 'Play Time',
            score: 'Total Score',
            totalHits: 'Total Hits',
            replaysWatched: 'Replays watched by others',
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
        soundOn: 'Sounds aktivieren',
        soundOff: 'Sounds stummschalten',
        soundVolume: 'Sound-Lautstärke',
        createdBy: 'erstellt von',
        terms: 'nutzungsbedingungen',
        privacy: 'datenschutz',
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
            page: 'Seite',
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
        activityNow: 'Jetzt aktiv',
        activityMin: 'Vor {n} Min. aktiv',
        activityHour: 'Vor {n} Std. aktiv',
        activityDay: 'Vor {n} Tagen aktiv',
        activityMonth: 'Vor {n} Monaten aktiv',
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
            bestTopPlay: 'Bestes Top Play',
            breakdownKicker: 'Analyse',
            breakdownTitle: 'Vergleichsdetails',
            duelKicker: '1v1',
            duelTitle: 'Direktes Duell',
            duelPlayers: '2 Spieler',
            duelToggleOn: 'Duellmodus aktivieren',
            duelToggleOff: 'Zurueck zur klassischen Ansicht',
            duelClose: 'Zurueck zum Vergleich',
            duelRounds: 'Duell-Runden',
            duelVs: 'VS',
            duelScore: 'Punktestand',
            duelTie: 'Technisches Unentschieden',
            duelNoPoint: 'Kein Punkt',
            duelPoint: '+1 Punkt',
            duelRoundWinDetail: 'Punkt durch {diff} Vorsprung.',
            duelRoundTieDetail: 'Kein Punkt: Werte liegen zu nah beieinander.',
            duelWinnerLine: '{player} gewinnt {score} {reason}.',
            duelTieLine: 'Duell ausgeglichen {score}.',
            duelReasonPeak: 'durch Peak-Skill',
            duelReasonConsistency: 'durch Konstanz',
            duelReasonActivity: 'durch allgemeine Aktivitaet',
            duelReasonOverall: 'durch Gesamtvorteil',
            duelRankDiff: '{value} Plaetze',
            duelTopFive: 'Top 5 Plays',
            duelTopFiveTotal: 'Top-5-Summe',
            duelNoTopFive: 'Keine Top Plays',
            duelCategoryReadout: 'Stil-Auswertung',
            duelCategoryOverall: 'Gesamt',
            duelCategoryPeak: 'Peak-Skill',
            duelCategoryConsistency: 'Konstanz',
            duelCategoryActivity: 'Allgemeine Aktivitaet',
            duelCategoryEdge: 'Vorteil fuer {player}',
            duelCategoryNoEdge: 'Kein klarer Vorteil',
            leaderBadge: 'Anführer',
            closeGap: 'Sehr knapp',
            clearLead: 'Klarer Vorsprung',
            bigGap: 'Großer Abstand',
            metricPp: 'Gesamt-PP',
            metricAccuracy: 'Genauigkeit',
            metricPlayCount: 'Spielanzahl',
            metricPlayTime: 'Spielzeit',
            metricGlobalRank: 'Globaler Rang',
            metricTopPlay: 'Top Play',
            metricTopFivePp: 'Top 5 PP',
            metricTotalScore: 'Gesamtpunktzahl',
            metricTotalHits: 'Gesamttreffer',
            metricMaxCombo: 'Max Combo',
            metricReplaysWatched: 'Replays von anderen gesehen',
            styleLabel: 'Stil',
            styleTags: {
                ppLeader: 'PP-Leader',
                accuracyDemon: 'Accuracy-Profi',
                grinder: 'Grinder',
                topPlayCarry: 'Top-Play-Carry',
                underdog: 'Underdog',
                balanced: 'Ausgeglichen'
            },
            styleTagDescriptions: {
                ppLeader: 'Hat die meisten PP in diesem Vergleich.',
                accuracyDemon: 'Fuehrt bei Genauigkeit oder liegt ueber 98% Accuracy.',
                grinder: 'Sticht durch Spielanzahl oder Spielzeit heraus.',
                topPlayCarry: 'Das beste Play wiegt stark im Vergleich zu den Gesamt-PP.',
                underdog: 'Fuehrt nicht bei PP, gewinnt aber eine wichtige Metrik.',
                balanced: 'Ist in mehreren Metriken stark, ohne nur von einer abzuhaengen.'
            }
        },
        stats: {
            pp: 'Leistungspunkte',
            acc: 'Genauigkeit',
            playcount: 'Spiele',
            playtime: 'Spielzeit',
            score: 'Gesamtpunktzahl',
            totalHits: 'Gesamttreffer',
            replaysWatched: 'Replays von anderen gesehen',
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
    window.UISounds?.setLabels({ enable: t.soundOn, disable: t.soundOff, volume: t.soundVolume });
    document.getElementById('footer-created-by').textContent = t.createdBy;
    document.getElementById('footer-terms-link').textContent = t.terms;
    document.getElementById('footer-terms-link').href = `/terms#${currentLang}`;
    document.getElementById('footer-privacy-link').textContent = t.privacy;
    document.getElementById('footer-privacy-link').href = `/privacy#${currentLang}`;
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

function hasCompareUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return params.has('player') || params.has('players') || params.has('mode') || params.has('theme') || params.has('lang');
}

function cleanCompareUrlIfNeeded() {
    if (IS_SHARE_MODE || !hasCompareUrlParams()) return;
    history.replaceState(null, '', `${window.location.pathname}${buildRoomHash('compare')}`);
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

function getRoomAnimationKey(route = currentRoomRoute) {
    if (!route) return '';
    return `${route.name}:${normalizeUsername(route.param || '')}`;
}

function prepareRoomAnimation(route) {
    if (roomContentAnimationFrame) {
        cancelAnimationFrame(roomContentAnimationFrame);
        roomContentAnimationFrame = null;
    }
    roomAnimationKey = getRoomAnimationKey(route);
    roomContentAnimationDone = false;
}

function animateRoomContentOnce(roomName) {
    if (IS_SHARE_MODE || roomContentAnimationDone || currentRoomRoute?.name !== roomName) return;

    const expectedKey = getRoomAnimationKey(currentRoomRoute);
    if (!expectedKey || expectedKey !== roomAnimationKey) return;

    roomContentAnimationDone = true;
    roomContentAnimationFrame = requestAnimationFrame(() => {
        roomContentAnimationFrame = requestAnimationFrame(() => {
            roomContentAnimationFrame = null;
            if (getRoomAnimationKey(currentRoomRoute) !== expectedKey) return;
            window.AppAnimations?.enterRoomContent(document.getElementById('room-view'), roomName);
        });
    });
}

function playRoomResponseSound(roomName, type = 'success') {
    if (IS_SHARE_MODE || roomContentAnimationDone || currentRoomRoute?.name !== roomName) return;
    if (getRoomAnimationKey(currentRoomRoute) !== roomAnimationKey) return;
    window.UISounds?.play(type);
}

function showCompareRoom() {
    clearRoomScoresRefreshTimer();
    if (refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = null;
    }
    closeCompareDuelMode(false);
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
    cleanCompareUrlIfNeeded();
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

    if (!IS_SHARE_MODE && !refreshTimer) {
        refreshTimer = setInterval(refreshData, 60000);
    }
}

function showFutureRoom(route) {
    clearRoomScoresRefreshTimer();
    if (refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = null;
    }
    closeCompareDuelMode(false);
    closeFocusBtn();
    document.getElementById('landing').style.display = 'none';
    document.getElementById('results').style.display = 'none';
    document.getElementById('room-view').style.display = 'block';
    setChromeMode('room');
    setActiveRoomLink(route.name);
    currentRoomRoute = route;
    prepareRoomAnimation(route);
    updateRoomBackLabel();
    renderRoomView(route);
    window.AppAnimations?.enterRoom(document.getElementById('room-view'));
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
        animateRoomContentOnce('player');
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
            playRoomResponseSound('player', 'profile');
            renderPlayerProfileContent(user, topPlay, mode);
        }
    } catch (error) {
        if (currentRoomRoute?.name !== 'player' || normalizeUsername(currentRoomRoute.param) !== normalizeUsername(username)) return;

        document.getElementById('room-actions').innerHTML = `
            <div class="player-profile-state player-profile-state--error">
                ${escapeHtml(error?.message || rooms.profileError)}
            </div>
            <a class="room-action-link" href="#/compare">${escapeHtml(rooms.openCompare)}</a>
        `;
        playRoomResponseSound('player', 'error');
        animateRoomContentOnce('player');
    }
}

function renderPlayerProfileContent(user, topPlay, mode) {
    const t = LANGS[currentLang];
    const rooms = t.rooms;
    const username = user.username || 'osu!';
    const pp = Math.round(user.statistics?.pp || 0);
    const isCreator = isCreatorUsername(username);
    const title = isCreator ? 'PAGE CREATOR' : getUserTitle(pp);
    const avatarUrl = safeHttpUrl(user.avatar_url) || 'https://osu.ppy.sh/images/layout/avatar-guest.png';
    const flag = getCountryFlag(user.country_code);
    const activity = getActivityLabel(user.last_visit);
    const peakRank = user.rank_highest?.rank;
    const trend = getRankTrend(user.rank_history);
    const totalHits = formatOptionalNumber(getUserTotalHits(user.statistics));
    const maxCombo = formatOptionalNumber(getUserMaxCombo(user.statistics), 'x');
    const replaysWatched = formatOptionalNumber(getUserReplaysWatched(user.statistics));
    const osuProfileUrl = `https://osu.ppy.sh/users/${encodeURIComponent(String(user.id || username))}/${encodeURIComponent(mode)}`;

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
                <div class="player-profile-stat">
                    <span>${escapeHtml(t.stats.maxCombo)}</span>
                    <strong>${escapeHtml(maxCombo)}</strong>
                </div>
                <div class="player-profile-stat">
                    <span>${escapeHtml(t.stats.totalHits)}</span>
                    <strong class="accent">${escapeHtml(totalHits)}</strong>
                </div>
                <div class="player-profile-stat">
                    <span>${escapeHtml(t.stats.replaysWatched)}</span>
                    <strong>${escapeHtml(replaysWatched)}</strong>
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
    animateRoomContentOnce('player');
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
        animateRoomContentOnce('top-plays');
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
            playRoomResponseSound('top-plays');
            renderTopPlaysContent(user, scores, mode, limit);
        }
    } catch (error) {
        if (currentRoomRoute?.name !== 'top-plays' || normalizeUsername(currentRoomRoute.param) !== normalizeUsername(username)) return;

        document.getElementById('room-actions').innerHTML = `
            <div class="top-plays-state top-plays-state--error">
                ${escapeHtml(error?.message || rooms.topPlaysError)}
            </div>
            <a class="room-action-link" href="${buildRoomHash('player', username)}">${escapeHtml(rooms.backToProfile.replace('← ', ''))}</a>
        `;
        playRoomResponseSound('top-plays', 'error');
        animateRoomContentOnce('top-plays');
    }
}

function renderTopPlaysContent(user, scores, mode, limit) {
    const t = LANGS[currentLang];
    const rooms = t.rooms;
    const username = user.username || 'osu!';
    const pp = Math.round(user.statistics?.pp || 0);
    const isCreator = isCreatorUsername(username);
    const avatarUrl = safeHttpUrl(user.avatar_url) || 'https://osu.ppy.sh/images/layout/avatar-guest.png';
    const allScores = Array.isArray(scores) ? scores.slice(0, limit) : [];
    const paging = getTopPlaysSharePaging(allScores, limit);
    const safeScores = paging.scores;
    const summary = getTopPlaysSummary(allScores);

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
                    <strong>${escapeHtml(paging.label)}</strong>
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
                ? `<div class="top-plays-list">${safeScores.map((score, index) => renderTopPlayListItem(score, index + paging.offset)).join('')}</div>`
                : `<div class="top-plays-state">${escapeHtml(t.noTopPlay)}</div>`}
        </div>
    `;
    animateRoomContentOnce('top-plays');
}

function getTopPlaysSharePaging(scores, limit) {
    if (!IS_SHARE_ROOM_MODE || getSharedRoomName() !== 'top-plays') {
        return {
            scores,
            page: 1,
            totalPages: 1,
            offset: 0,
            label: `${fmtNum(scores.length)} / ${fmtNum(limit)}`
        };
    }

    const pageSize = getSharedTopPlaysPageSize();
    const totalPages = Math.max(1, Math.ceil(scores.length / pageSize));
    const page = Math.min(getSharedTopPlaysPage(), totalPages);
    const start = (page - 1) * pageSize;
    const pageScores = scores.slice(start, start + pageSize);
    const rooms = LANGS[currentLang].rooms;

    return {
        scores: pageScores,
        page,
        totalPages,
        offset: start,
        label: `${rooms.page} ${page}/${totalPages} · ${fmtNum(scores.length)} / ${fmtNum(limit)}`
    };
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
        animateRoomContentOnce('recent');
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
            playRoomResponseSound('recent');
            renderRecentPlaysContent(user, scores, mode);
        }
    } catch (error) {
        if (currentRoomRoute?.name !== 'recent' || normalizeUsername(currentRoomRoute.param) !== normalizeUsername(username)) return;

        document.getElementById('room-actions').innerHTML = `
            <div class="top-plays-state top-plays-state--error">
                ${escapeHtml(error?.message || rooms.recentPlaysError)}
            </div>
            <a class="room-action-link" href="${buildRoomHash('player', username)}">${escapeHtml(rooms.backToProfile.replace('← ', ''))}</a>
        `;
        playRoomResponseSound('recent', 'error');
        animateRoomContentOnce('recent');
    }
}

function renderRecentPlaysContent(user, scores, mode) {
    const t = LANGS[currentLang];
    const rooms = t.rooms;
    const username = user.username || 'osu!';
    const pp = Math.round(user.statistics?.pp || 0);
    const isCreator = isCreatorUsername(username);
    const avatarUrl = safeHttpUrl(user.avatar_url) || 'https://osu.ppy.sh/images/layout/avatar-guest.png';
    const allScores = Array.isArray(scores) ? scores : [];
    const paging = getRecentSharePaging(allScores);
    const safeScores = paging.scores;
    const summary = getTopPlaysSummary(safeScores);
    const latestDate = allScores[0]
        ? fmtDate(allScores[0].ended_at || allScores[0].created_at).replace('\n', ' ')
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
                    <strong>${escapeHtml(paging.label)}</strong>
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
                ? `<div class="top-plays-list">${safeScores.map((score, index) => renderTopPlayListItem(score, index + paging.offset)).join('')}</div>`
                : `<div class="top-plays-state">${escapeHtml(rooms.noRecentPlays)}</div>`}
        </div>
    `;
    animateRoomContentOnce('recent');
}

function getRecentSharePaging(scores) {
    if (!IS_SHARE_ROOM_MODE || getSharedRoomName() !== 'recent') {
        return {
            scores,
            page: 1,
            totalPages: 1,
            offset: 0,
            label: fmtNum(scores.length)
        };
    }

    const pageSize = getSharedRecentPageSize();
    const totalPages = Math.max(1, Math.ceil(scores.length / pageSize));
    const page = Math.min(getSharedRecentPage(), totalPages);
    const start = (page - 1) * pageSize;
    const pageScores = scores.slice(start, start + pageSize);
    const rooms = LANGS[currentLang].rooms;

    return {
        scores: pageScores,
        page,
        totalPages,
        offset: start,
        label: `${rooms.page} ${page}/${totalPages} · ${fmtNum(scores.length)}`
    };
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
                    ? `<img class="top-play-cover" src="${escapeHtml(cover)}" alt="${escapeHtml(mapName)}" onerror="this.style.display='none'">`
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
                <a class="top-play-action" href="${escapeHtml(mapUrl)}" target="_blank" rel="noopener">↗</a>
                ${replayUrl ? `<a class="top-play-action top-play-action--replay" href="${escapeHtml(replayUrl)}" target="_blank" rel="noopener">⬇</a>` : ''}
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
    animateRoomContentOnce('history');
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
        animateRoomContentOnce('friends');
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
    if (!friendsState.loading) animateRoomContentOnce('friends');
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
let roomAnimationKey = '';
let roomContentAnimationDone = false;
let roomContentAnimationFrame = null;
let compareDuelModeEnabled = false;
let lastComparisonUsers = [];
let lastComparisonTopPlays = [];
let lastComparisonBestPlays = [];
let lastComparisonIsSingle = false;
let compareDuelAnimationTimer = null;
let focusCleanupTimer = null;
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
    const clean = getCountryCode(code);
    if (!clean) return '';
    return clean.split('').map(c =>
        String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)
    ).join('');
}

function getCountryCode(code) {
    const clean = String(code ?? '').trim().toUpperCase();
    return /^[A-Z]{2}$/.test(clean) ? clean : '';
}

function getCountryFlagImageUrl(code) {
    const clean = getCountryCode(code);
    return clean ? `https://flagcdn.com/w40/${clean.toLowerCase()}.png` : '';
}

function renderCountryFlag(code, className = 'country-flag') {
    const clean = getCountryCode(code);
    if (!clean) return `<span class="${className}"></span>`;

    if (!IS_SHARE_COMPARE_MODE) {
        return `<span class="${className}">${escapeHtml(getCountryFlag(clean))}</span>`;
    }

    return `<span class="${className} country-flag--image" aria-label="${escapeHtml(clean)}">
        <img class="country-flag-img" src="${escapeHtml(getCountryFlagImageUrl(clean))}" alt="${escapeHtml(clean)}" loading="eager" decoding="sync">
    </span>`;
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
    return safeHttpUrl(score?.beatmapset?.covers?.['list@2x']
        || score?.beatmapset?.covers?.list
        || score?.beatmapset?.covers?.card
        || '');
}

function getBeatmapUrl(score) {
    if (!score) return '#';
    const bid = score.beatmap?.id;
    return bid ? `https://osu.ppy.sh/b/${bid}` : '#';
}

function getRankDisplay(rank) {
    const clean = normalizeRank(rank);
    // XH = SS silver, X = SS gold, SH = S silver
    const map = { XH: 'SS', X: 'SS', SH: 'S', S: 'S', A: 'A', B: 'B', C: 'C', D: 'D' };
    return map[clean] || '—';
}

function getRankClass(rank) {
    return `rank-letter rank-${normalizeRank(rank) || 'D'}`;
}

function normalizeRank(rank) {
    const clean = String(rank ?? '').trim().toUpperCase();
    return ['XH', 'X', 'SH', 'S', 'A', 'B', 'C', 'D'].includes(clean) ? clean : '';
}

function renderScoreClient(score) {
    const t = LANGS[currentLang];
    const isStable = score?.legacy_score_id != null;
    const label = isStable ? t.playedOnStable : t.playedOnLazer;
    const clientClass = isStable ? 'stable' : 'lazer';
    const icon = isStable ? '◉' : '✦';

    return `<div class="score-client score-client--${clientClass}">
        <span class="score-client-icon">${icon}</span>
        <span>${escapeHtml(label)}</span>
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

function escapeCssUrl(value) {
    return String(value ?? '').replace(/["'\\\n\r\f]/g, '\\$&');
}

function safeHttpUrl(value) {
    const raw = String(value ?? '').trim();
    if (!raw) return '';

    try {
        const url = new URL(raw);
        return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : '';
    } catch {
        return '';
    }
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
    const avatar = safeHttpUrl(loggedInUser.avatar_url);

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
    const avatar = safeHttpUrl(friend?.avatar_url);
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

function getDuelBestPlays(item) {
    if (Array.isArray(item?.bestPlays) && item.bestPlays.length) return item.bestPlays;
    return item?.topPlay ? [item.topPlay] : [];
}

function getDuelTopFivePp(item) {
    const scores = getDuelBestPlays(item).slice(0, DUEL_TOP_PLAYS_LIMIT);
    const total = scores.reduce((sum, score) => {
        const pp = typeof score?.pp === 'number' ? score.pp : Number(score?.pp);
        return Number.isFinite(pp) ? sum + pp : sum;
    }, 0);
    return total > 0 ? total : null;
}

function getUserTotalHits(stats) {
    const direct = getFiniteMetricValue(stats?.total_hits);
    if (direct !== null) return direct;

    const counts = ['count_300', 'count_100', 'count_50']
        .map(key => Number(stats?.[key]))
        .filter(Number.isFinite);
    const total = counts.reduce((sum, value) => sum + value, 0);
    return total > 0 ? total : null;
}

function getUserMaxCombo(stats) {
    return stats?.maximum_combo ?? stats?.max_combo ?? null;
}

function getUserReplaysWatched(stats) {
    return stats?.replays_watched_by_others ?? stats?.replays_watched ?? null;
}

function formatOptionalNumber(value, suffix = '') {
    if (value === null || value === undefined || value === '') return '—';
    const number = Number(value);
    return Number.isFinite(number) ? `${fmtNum(number)}${suffix}` : '—';
}

function getCompareDuelMetrics(valid) {
    const t = LANGS[currentLang].compare;
    return [
        {
            key: 'pp',
            label: t.metricPp,
            tone: 'gold',
            category: 'overall',
            tieAbs: 50,
            tieRatio: 0.006,
            value: item => getFiniteMetricValue(item.data.statistics?.pp),
            format: value => `${fmtNum(Math.round(value))}pp`,
            formatDiff: value => `+${fmtNum(Math.round(value))}pp`
        },
        {
            key: 'accuracy',
            label: t.metricAccuracy,
            tone: 'cyan',
            category: 'consistency',
            tieAbs: 0.05,
            value: item => getFiniteMetricValue(item.data.statistics?.hit_accuracy),
            format: value => fmtAcc(value),
            formatDiff: value => `+${value.toFixed(2)}%`
        },
        {
            key: 'play-count',
            label: t.metricPlayCount,
            tone: 'pink',
            category: 'activity',
            tieAbs: 250,
            tieRatio: 0.015,
            value: item => getFiniteMetricValue(item.data.statistics?.play_count),
            format: value => fmtNum(value),
            formatDiff: value => `+${fmtNum(value)}`
        },
        {
            key: 'play-time',
            label: t.metricPlayTime,
            tone: 'cyan',
            category: 'activity',
            tieAbs: 3600,
            tieRatio: 0.012,
            value: item => getFiniteMetricValue(item.data.statistics?.play_time),
            format: value => fmtTime(value),
            formatDiff: value => `+${fmtTime(value)}`
        },
        {
            key: 'global-rank',
            label: t.metricGlobalRank,
            tone: 'pink',
            category: 'consistency',
            lowerBetter: true,
            tieAbs: 500,
            tieRatio: 0.004,
            value: item => getFiniteMetricValue(item.data.statistics?.global_rank),
            format: value => `#${fmtNum(value)}`,
            formatDiff: value => t.duelRankDiff.replace('{value}', fmtNum(value))
        },
        {
            key: 'top-play',
            label: t.metricTopPlay,
            tone: 'gold',
            category: 'peak',
            tieAbs: 5,
            tieRatio: 0.02,
            value: item => getFiniteMetricValue(item.topPlay?.pp),
            format: value => `${fmtNum(Math.round(value))}pp`,
            formatDiff: value => `+${fmtNum(Math.round(value))}pp`
        },
        {
            key: 'top-five-pp',
            label: t.metricTopFivePp,
            tone: 'gold',
            category: 'peak',
            tieAbs: 18,
            tieRatio: 0.018,
            value: item => getFiniteMetricValue(getDuelTopFivePp(item)),
            format: value => `${fmtNum(Math.round(value))}pp`,
            formatDiff: value => `+${fmtNum(Math.round(value))}pp`
        },
        {
            key: 'total-score',
            label: t.metricTotalScore,
            tone: 'gold',
            category: 'overall',
            tieAbs: 1000000,
            tieRatio: 0.01,
            value: item => getFiniteMetricValue(item.data.statistics?.total_score),
            format: value => fmtNum(value),
            formatDiff: value => `+${fmtNum(value)}`
        },
        {
            key: 'total-hits',
            label: t.metricTotalHits,
            tone: 'cyan',
            category: 'activity',
            tieAbs: 10000,
            tieRatio: 0.012,
            value: item => getFiniteMetricValue(getUserTotalHits(item.data.statistics)),
            format: value => fmtNum(value),
            formatDiff: value => `+${fmtNum(value)}`
        },
        {
            key: 'max-combo',
            label: t.metricMaxCombo,
            tone: 'cyan',
            category: 'peak',
            tieAbs: 20,
            tieRatio: 0.018,
            value: item => getFiniteMetricValue(getUserMaxCombo(item.data.statistics)),
            format: value => `${fmtNum(value)}x`,
            formatDiff: value => `+${fmtNum(value)}x`
        },
        {
            key: 'replays-watched',
            label: t.metricReplaysWatched,
            tone: 'pink',
            category: 'overall',
            tieAbs: 25,
            tieRatio: 0.02,
            value: item => getFiniteMetricValue(getUserReplaysWatched(item.data.statistics)),
            format: value => fmtNum(value),
            formatDiff: value => `+${fmtNum(value)}`
        }
    ].map(metric => {
        const entries = valid
            .map(item => ({
                item,
                index: item.index,
                value: metric.value(item)
            }))
            .filter(entry => entry.value !== null);

        return { ...metric, entries };
    }).filter(metric => metric.entries.length === 2);
}

function getCompareDuelTieLimit(metric, firstValue, secondValue) {
    const baseline = Math.max(firstValue, secondValue);
    const ratioLimit = Number.isFinite(baseline) && baseline > 0 ? baseline * (metric.tieRatio || 0) : 0;
    return Math.max(metric.tieAbs || 0, ratioLimit);
}

function getCompareDuelDecision(metric) {
    const [first, second] = metric.entries;
    const bestValue = metric.lowerBetter
        ? Math.min(first.value, second.value)
        : Math.max(first.value, second.value);
    const firstLead = metric.lowerBetter
        ? second.value - first.value
        : first.value - second.value;
    const diff = Math.abs(firstLead);
    const tieLimit = getCompareDuelTieLimit(metric, first.value, second.value);
    const winnerIndex = diff <= tieLimit ? null : (firstLead > 0 ? first.index : second.index);
    const entries = metric.entries.map(entry => ({
        ...entry,
        percent: getCompareBreakdownPercent(metric, entry.value, bestValue)
    }));

    return {
        ...metric,
        entries,
        diff,
        winnerIndex,
        diffLabel: metric.formatDiff(diff)
    };
}

function getCompareDuelReason(decisions, winnerIndex) {
    const t = LANGS[currentLang].compare;
    const winningKeys = decisions
        .filter(decision => decision.winnerIndex === winnerIndex)
        .map(decision => decision.key);
    const has = key => winningKeys.includes(key);

    if ((has('play-count') || has('play-time')) && (has('total-hits') || has('total-score'))) return t.duelReasonActivity;
    if ((has('top-play') || has('top-five-pp') || has('max-combo')) && (has('pp') || has('global-rank'))) return t.duelReasonPeak;
    if (has('accuracy') && has('global-rank')) return t.duelReasonConsistency;
    if (has('top-play') || has('top-five-pp') || has('max-combo')) return t.duelReasonPeak;
    if (has('accuracy')) return t.duelReasonConsistency;
    if (has('play-count') || has('play-time') || has('total-hits')) return t.duelReasonActivity;
    return t.duelReasonOverall;
}

function getCompareDuelCategoryLabel(category) {
    const t = LANGS[currentLang].compare;
    const labels = {
        overall: t.duelCategoryOverall,
        peak: t.duelCategoryPeak,
        consistency: t.duelCategoryConsistency,
        activity: t.duelCategoryActivity
    };
    return labels[category] || t.duelCategoryOverall;
}

function getCompareDuelCategoryTone(category) {
    const tones = {
        overall: 'gold',
        peak: 'gold',
        consistency: 'cyan',
        activity: 'pink'
    };
    return tones[category] || 'gold';
}

function renderCompareDuelCategoryReadout(decisions, valid) {
    const t = LANGS[currentLang].compare;
    const [left, right] = valid;
    const categories = ['overall', 'peak', 'consistency', 'activity'];

    const items = categories.map(category => {
        const categoryDecisions = decisions.filter(decision => decision.category === category);
        const points = new Map([[left.index, 0], [right.index, 0]]);

        categoryDecisions.forEach(decision => {
            if (decision.winnerIndex === null) return;
            points.set(decision.winnerIndex, (points.get(decision.winnerIndex) || 0) + 1);
        });

        const leftPoints = points.get(left.index) || 0;
        const rightPoints = points.get(right.index) || 0;
        const winnerIndex = leftPoints === rightPoints ? null : (leftPoints > rightPoints ? left.index : right.index);
        const winner = winnerIndex === null ? null : valid.find(entry => entry.index === winnerIndex);
        const winnerName = winner?.data.username || winner?.name || '';
        const winnerClass = winnerName && isCreatorUsername(winnerName) ? ' creator-name' : '';
        const detail = winner
            ? t.duelCategoryEdge.replace('{player}', winnerName)
            : t.duelCategoryNoEdge;

        return `
            <div class="compare-duel-category compare-duel-category--${getCompareDuelCategoryTone(category)}${winner ? '' : ' compare-duel-category--tie'}">
                <span>${escapeHtml(getCompareDuelCategoryLabel(category))}</span>
                <strong>${leftPoints}-${rightPoints}</strong>
                <em class="${winnerClass.trim()}">${escapeHtml(detail)}</em>
            </div>
        `;
    }).join('');

    return `
        <div class="compare-duel-category-title">${escapeHtml(t.duelCategoryReadout)}</div>
        <div class="compare-duel-category-grid">
            ${items}
        </div>
    `;
}

function renderCompareDuelMiniStat(label, value, tone = '') {
    return `
        <div class="compare-duel-player-stat${tone ? ` compare-duel-player-stat--${tone}` : ''}">
            <span>${escapeHtml(label)}</span>
            <strong>${escapeHtml(value)}</strong>
        </div>
    `;
}

function renderCompareDuelTopFive(scores) {
    const t = LANGS[currentLang].compare;
    const safeScores = Array.isArray(scores) ? scores.slice(0, DUEL_TOP_PLAYS_LIMIT) : [];
    const totalPp = getDuelTopFivePp({ bestPlays: safeScores });

    if (!safeScores.length) {
        return `
            <div class="compare-duel-top-five compare-duel-top-five--empty">
                <div class="compare-duel-top-five-head">
                    <span>${escapeHtml(t.duelTopFive)}</span>
                    <strong>${escapeHtml(t.duelNoTopFive)}</strong>
                </div>
            </div>
        `;
    }

    return `
        <div class="compare-duel-top-five">
            <div class="compare-duel-top-five-head">
                <span>${escapeHtml(t.duelTopFive)}</span>
                <strong>${escapeHtml(t.duelTopFiveTotal)} ${fmtNum(Math.round(totalPp || 0))}pp</strong>
            </div>
            <div class="compare-duel-top-five-list">
                ${safeScores.map((score, index) => {
                    const cover = getCoverUrl(score);
                    const mapName = score.beatmapset?.title || '—';
                    const pp = typeof score.pp === 'number' ? `${fmtNum(Math.round(score.pp))}pp` : '—';
                    const mods = getMods(score).slice(0, 3);
                    return `
                        <div class="compare-duel-top-five-row">
                            <span class="compare-duel-top-five-rank">#${index + 1}</span>
                            ${cover ? `<img src="${escapeHtml(cover)}" alt="" onerror="this.style.display='none'">` : '<span class="compare-duel-top-five-cover"></span>'}
                            <div class="compare-duel-top-five-map">
                                <strong>${escapeHtml(mapName)}</strong>
                                <span>${mods.length ? mods.map(mod => escapeHtml(mod)).join(' ') : 'NM'}</span>
                            </div>
                            <em>${escapeHtml(pp)}</em>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

function renderCompareDuelPlayer(entry, score, isWinner, side = 'left') {
    const t = LANGS[currentLang];
    const compare = t.compare;
    const username = entry.data.username || entry.name || 'osu!';
    const creatorClass = isCreatorUsername(username) ? ' creator-name' : '';
    const avatarUrl = safeHttpUrl(entry.data.avatar_url) || 'https://osu.ppy.sh/images/layout/avatar-guest.png';
    const pp = Math.round(entry.data.statistics?.pp || 0);
    const title = isCreatorUsername(username) ? 'PAGE CREATOR' : getUserTitle(pp);
    const rank = entry.data.statistics?.global_rank ? `#${fmtNum(entry.data.statistics.global_rank)}` : '—';
    const countryRank = entry.data.statistics?.country_rank ? `#${fmtNum(entry.data.statistics.country_rank)}` : '—';
    const acc = fmtAcc(entry.data.statistics?.hit_accuracy);

    return `
        <div class="compare-duel-player compare-duel-player--${side}${isWinner ? ' compare-duel-player--winner' : ''}">
            <div class="compare-duel-score-pill">
                <span>${escapeHtml(compare.duelScore)}</span>
                <strong>${score}</strong>
            </div>
            <div class="compare-duel-avatar-wrap${isCreatorUsername(username) ? ' creator-frame' : ''}">
                <div class="avatar-glow"></div>
                <img class="compare-duel-avatar" src="${escapeHtml(avatarUrl)}" alt="${escapeHtml(username)}" onerror="this.src='https://osu.ppy.sh/images/layout/avatar-guest.png'">
            </div>
            <div class="compare-duel-player-body">
                <div class="compare-duel-player-country">${renderCountryFlag(entry.data.country_code)}</div>
                <div class="compare-duel-player-name${creatorClass}" data-text="${escapeHtml(username)}">
                    <span class="compare-duel-player-name-main">${escapeHtml(username)}</span>
                </div>
                <div class="compare-duel-player-title">${escapeHtml(title)}</div>
                <div class="compare-duel-player-pp">${fmtNum(pp)}<span>pp</span></div>
                <div class="compare-duel-player-stats">
                    ${renderCompareDuelMiniStat(t.stats.global, rank, 'pink')}
                    ${renderCompareDuelMiniStat(t.stats.country, countryRank, 'cyan')}
                    ${renderCompareDuelMiniStat(t.stats.acc, acc, 'gold')}
                </div>
                ${renderCompareDuelTopFive(entry.bestPlays)}
            </div>
        </div>
    `;
}

function renderCompareDuelMetric(decision) {
    const t = LANGS[currentLang].compare;
    const categoryLabel = getCompareDuelCategoryLabel(decision.category);
    const categoryTone = getCompareDuelCategoryTone(decision.category);
    const winnerEntry = decision.winnerIndex === null
        ? null
        : decision.entries.find(entry => entry.index === decision.winnerIndex);
    const resultName = winnerEntry?.item.data.username || '';
    const resultClass = resultName && isCreatorUsername(resultName) ? ' creator-name' : '';
    const resultText = winnerEntry
        ? `${resultName} ${decision.diffLabel}`
        : t.duelTie;
    const pointText = winnerEntry ? t.duelPoint : t.duelNoPoint;
    const roundDetail = winnerEntry
        ? t.duelRoundWinDetail.replace('{diff}', decision.diffLabel)
        : t.duelRoundTieDetail;

    const renderSide = entry => {
        const username = entry.item.data.username || entry.item.name || 'osu!';
        const creatorClass = isCreatorUsername(username) ? ' creator-name' : '';
        const isWinner = entry.index === decision.winnerIndex;
        return `
            <div class="compare-duel-side${isWinner ? ' compare-duel-side--winner' : ''}">
                <div class="compare-duel-side-head">
                    <span class="${creatorClass.trim()}">${escapeHtml(username)}</span>
                    <strong>${escapeHtml(decision.format(entry.value))}</strong>
                </div>
                <div class="compare-duel-track" aria-hidden="true">
                    <div class="compare-duel-fill" style="--pct:${entry.percent.toFixed(2)}%;"></div>
                </div>
            </div>
        `;
    };

    return `
        <div class="compare-duel-metric compare-duel-metric--${decision.tone}${winnerEntry ? '' : ' compare-duel-metric--tie'}">
            <div class="compare-duel-metric-head">
                <span>${escapeHtml(decision.label)}</span>
                <div class="compare-duel-metric-badges">
                    <b class="compare-duel-category-pill compare-duel-category-pill--${categoryTone}">${escapeHtml(categoryLabel)}</b>
                    <em>${escapeHtml(pointText)}</em>
                </div>
            </div>
            <div class="compare-duel-result">
                ${winnerEntry
                    ? `<strong class="${resultClass.trim()}">${escapeHtml(resultName)}</strong><span>${escapeHtml(decision.diffLabel)}</span>`
                    : `<strong>${escapeHtml(resultText)}</strong>`}
            </div>
            <div class="compare-duel-round-note">
                ${winnerEntry ? `<span class="${resultClass.trim()}">${escapeHtml(resultName)}</span>` : ''}
                <em>${escapeHtml(roundDetail)}</em>
            </div>
            <div class="compare-duel-sides">
                ${decision.entries.map(renderSide).join('')}
            </div>
        </div>
    `;
}

function renderCompareDuelVerdict(winner, scoreText, reason) {
    const t = LANGS[currentLang].compare;
    if (!winner) {
        return escapeHtml(t.duelTieLine.replace('{score}', scoreText));
    }

    const username = winner.data.username || winner.name || 'osu!';
    const creatorClass = isCreatorUsername(username) ? ' creator-name' : '';
    const template = t.duelWinnerLine
        .replace('{score}', scoreText)
        .replace('{reason}', reason);
    const [before, after] = template.split('{player}');

    return `${escapeHtml(before)}<span class="${creatorClass.trim()}">${escapeHtml(username)}</span>${escapeHtml(after || '')}`;
}

function canShowCompareDuel(users, isSingle) {
    const validCount = users.filter(user => user.ok).length;
    return !IS_SHARE_COMPARE_MODE && !isSingle && currentPlayers.length === 2 && validCount === 2;
}

function syncCompareDuelModeState(users = lastComparisonUsers, isSingle = lastComparisonIsSingle) {
    const results = document.getElementById('results');
    if (!results) return;

    const active = compareDuelModeEnabled && canShowCompareDuel(users, isSingle);
    const closing = document.getElementById('compare-duel')?.classList.contains('is-closing');
    results.classList.toggle('duel-mode-active', active);
    document.documentElement.classList.toggle('duel-focus-open', active || closing);
    document.body.classList.toggle('duel-focus-open', active || closing);
}

function renderCompareDuelControls(users = lastComparisonUsers, isSingle = lastComparisonIsSingle) {
    const controls = document.getElementById('compare-duel-controls');
    if (!controls) return;

    if (!canShowCompareDuel(users, isSingle)) {
        syncCompareDuelModeState(users, isSingle);
        controls.innerHTML = '';
        controls.style.display = 'none';
        return;
    }

    syncCompareDuelModeState(users, isSingle);
    const t = LANGS[currentLang].compare;
    controls.innerHTML = `
        <button
            type="button"
            class="compare-duel-toggle${compareDuelModeEnabled ? ' active' : ''}"
            onclick="toggleCompareDuelMode()"
            aria-pressed="${compareDuelModeEnabled ? 'true' : 'false'}"
        >
            <span>${escapeHtml(compareDuelModeEnabled ? t.duelToggleOff : t.duelToggleOn)}</span>
        </button>
    `;
    controls.style.display = 'flex';
}

function toggleCompareDuelMode() {
    if (!canShowCompareDuel(lastComparisonUsers, lastComparisonIsSingle)) return;

    compareDuelModeEnabled = !compareDuelModeEnabled;
    renderCompareDuel(lastComparisonUsers, lastComparisonTopPlays, lastComparisonIsSingle, lastComparisonBestPlays);
    renderCompareDuelControls();

    if (compareDuelModeEnabled) {
        requestAnimationFrame(() => {
            document.querySelector('#compare-duel .compare-duel-close')?.focus();
        });
    } else {
        setTimeout(() => {
            document.querySelector('#compare-duel-controls .compare-duel-toggle')?.focus();
        }, 280);
    }
}

function closeCompareDuelMode(restoreFocus = true) {
    if (!compareDuelModeEnabled) return;

    compareDuelModeEnabled = false;
    renderCompareDuel(lastComparisonUsers, lastComparisonTopPlays, lastComparisonIsSingle, lastComparisonBestPlays);
    renderCompareDuelControls();

    if (restoreFocus) {
        setTimeout(() => {
            document.querySelector('#compare-duel-controls .compare-duel-toggle')?.focus();
        }, 280);
    }
}

function closeCompareDuel(event) {
    if (event.target === document.getElementById('compare-duel')) {
        window.UISounds?.play('back');
        closeCompareDuelMode();
    }
}

function renderCompareDuelUtilityControls() {
    const t = LANGS[currentLang];
    const activeTheme = document.documentElement.dataset.theme || 'cyberpunk';
    const themes = typeof THEMES !== 'undefined' && Array.isArray(THEMES) ? THEMES : [];
    const languages = [
        { id: 'es', flag: '🇲🇽', label: 'Español' },
        { id: 'en', flag: '🇺🇸', label: 'English' },
        { id: 'de', flag: '🇩🇪', label: 'Deutsch' }
    ];

    return `
        <div class="compare-duel-utilities">
            <div class="compare-duel-languages" aria-label="Language">
                ${languages.map(language => `
                    <button
                        type="button"
                        class="compare-duel-language${currentLang === language.id ? ' active' : ''}"
                        onclick="changeLang('${language.id}')"
                        title="${escapeHtml(language.label)}"
                        aria-label="${escapeHtml(language.label)}"
                    >${escapeHtml(language.flag)}</button>
                `).join('')}
            </div>
            <label class="compare-duel-theme">
                <span>${escapeHtml(t.theme)}</span>
                <select onchange="applyTheme(this.value)" aria-label="${escapeHtml(t.theme)}">
                    ${themes.map(theme => `
                        <option value="${escapeHtml(theme.id)}"${theme.id === activeTheme ? ' selected' : ''}>${escapeHtml(theme.label)}</option>
                    `).join('')}
                </select>
            </label>
        </div>
    `;
}

function renderCompareDuel(users, topPlays, isSingle, bestPlays = lastComparisonBestPlays) {
    const duel = document.getElementById('compare-duel');
    if (!duel) return;

    const valid = users
        .map((user, idx) => user.ok ? {
            ...user,
            index: idx,
            topPlay: topPlays[idx],
            bestPlays: Array.isArray(bestPlays?.[idx]) ? bestPlays[idx] : (topPlays[idx] ? [topPlays[idx]] : [])
        } : null)
        .filter(Boolean);

    if (!compareDuelModeEnabled || !canShowCompareDuel(users, isSingle) || valid.length !== 2) {
        clearTimeout(compareDuelAnimationTimer);
        if (duel.style.display === 'none' || !duel.innerHTML) {
            duel.innerHTML = '';
            duel.classList.remove('is-open', 'is-closing');
            duel.style.display = 'none';
            document.documentElement.classList.remove('duel-focus-open');
            document.body.classList.remove('duel-focus-open');
            return;
        }

        duel.classList.remove('is-open');
        duel.classList.add('is-closing');
        duel.setAttribute('aria-hidden', 'true');
        window.AppAnimations?.exitDuel(duel);
        compareDuelAnimationTimer = setTimeout(() => {
            if (compareDuelModeEnabled) return;
            duel.innerHTML = '';
            duel.classList.remove('is-closing');
            duel.style.display = 'none';
            document.documentElement.classList.remove('duel-focus-open');
            document.body.classList.remove('duel-focus-open');
        }, 240);
        return;
    }

    const decisions = getCompareDuelMetrics(valid).map(getCompareDuelDecision);
    if (!decisions.length) {
        duel.innerHTML = '';
        duel.style.display = 'none';
        return;
    }

    const t = LANGS[currentLang].compare;
    const scores = new Map(valid.map(entry => [entry.index, 0]));
    decisions.forEach(decision => {
        if (decision.winnerIndex === null) return;
        scores.set(decision.winnerIndex, (scores.get(decision.winnerIndex) || 0) + 1);
    });

    const [left, right] = valid;
    const leftScore = scores.get(left.index) || 0;
    const rightScore = scores.get(right.index) || 0;
    const scoreText = `${leftScore}-${rightScore}`;
    const winnerIndex = leftScore === rightScore ? null : (leftScore > rightScore ? left.index : right.index);
    const winner = winnerIndex === null ? null : valid.find(entry => entry.index === winnerIndex);
    const verdict = renderCompareDuelVerdict(
        winner,
        scoreText,
        winner ? getCompareDuelReason(decisions, winnerIndex) : ''
    );

    clearTimeout(compareDuelAnimationTimer);
    const wasOpen = duel.classList.contains('is-open');
    duel.classList.remove('is-closing');
    duel.innerHTML = `
        <div class="compare-duel-shell" role="dialog" aria-modal="true" aria-labelledby="compare-duel-title">
            <div class="compare-duel-glitch" aria-hidden="true">
                <span class="compare-duel-glitch-bar"></span>
                <span class="compare-duel-glitch-bar"></span>
                <span class="compare-duel-glitch-bar"></span>
                <span class="compare-duel-glitch-bar"></span>
                <span class="compare-duel-glitch-bar"></span>
            </div>
            <div class="compare-duel-header">
                <div>
                    <div class="compare-duel-kicker">${escapeHtml(t.duelKicker)}</div>
                    <h2 id="compare-duel-title" class="compare-duel-glitch-text" data-text="${escapeHtml(t.duelTitle)}">${escapeHtml(t.duelTitle)}</h2>
                </div>
                <div class="compare-duel-header-actions">
                    ${renderCompareDuelUtilityControls()}
                    <span class="compare-duel-player-count">${escapeHtml(t.duelPlayers)}</span>
                    <button class="compare-duel-close" type="button" onclick="closeCompareDuelMode()">← ${escapeHtml(t.duelClose)}</button>
                </div>
            </div>
            <div class="compare-duel-scoreboard" aria-label="${escapeHtml(t.duelScore)}">
                ${renderCompareDuelPlayer(left, leftScore, winnerIndex === left.index, 'left')}
                <div class="compare-duel-center">
                    <span>${escapeHtml(t.duelKicker)}</span>
                    <strong class="compare-duel-glitch-text compare-duel-score-text" data-text="${escapeHtml(scoreText)}">${escapeHtml(scoreText)}</strong>
                    <em>${escapeHtml(t.duelVs)}</em>
                </div>
                ${renderCompareDuelPlayer(right, rightScore, winnerIndex === right.index, 'right')}
            </div>
            <div class="compare-duel-verdict${winner ? '' : ' compare-duel-verdict--tie'}">
                <span>${verdict}</span>
            </div>
            ${renderCompareDuelCategoryReadout(decisions, valid)}
            <div class="compare-duel-rounds-title">${escapeHtml(t.duelRounds)}</div>
            <div class="compare-duel-grid">
                ${decisions.map(renderCompareDuelMetric).join('')}
            </div>
        </div>
    `;
    duel.onclick = closeCompareDuel;
    duel.setAttribute('aria-hidden', 'false');
    duel.style.display = 'block';
    if (!wasOpen) {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                duel.classList.add('is-open');
                window.AppAnimations?.enterDuel(duel);
            });
        });
    } else {
        duel.classList.add('is-open');
    }
}

function getFiniteMetricValue(value) {
    if (value === null || value === undefined || value === '') return null;
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? number : null;
}

function getCompareBreakdownMetrics(valid) {
    const t = LANGS[currentLang].compare;
    return [
        {
            key: 'pp',
            label: t.metricPp,
            tone: 'gold',
            value: item => getFiniteMetricValue(item.data.statistics?.pp),
            format: value => `${fmtNum(Math.round(value))}pp`,
            formatDiff: value => `${fmtNum(Math.round(value))}pp`
        },
        {
            key: 'accuracy',
            label: t.metricAccuracy,
            tone: 'cyan',
            value: item => getFiniteMetricValue(item.data.statistics?.hit_accuracy),
            format: value => fmtAcc(value),
            formatDiff: value => `${value.toFixed(2)}%`
        },
        {
            key: 'play-count',
            label: t.metricPlayCount,
            tone: 'pink',
            value: item => getFiniteMetricValue(item.data.statistics?.play_count),
            format: value => fmtNum(value),
            formatDiff: value => fmtNum(value)
        },
        {
            key: 'play-time',
            label: t.metricPlayTime,
            tone: 'cyan',
            value: item => getFiniteMetricValue(item.data.statistics?.play_time),
            format: value => fmtTime(value),
            formatDiff: value => fmtTime(value)
        },
        {
            key: 'global-rank',
            label: t.metricGlobalRank,
            tone: 'pink',
            lowerBetter: true,
            value: item => getFiniteMetricValue(item.data.statistics?.global_rank),
            format: value => `#${fmtNum(value)}`,
            formatDiff: value => fmtNum(value)
        },
        {
            key: 'top-play',
            label: t.metricTopPlay,
            tone: 'gold',
            value: item => getFiniteMetricValue(item.topPlay?.pp),
            format: value => `${fmtNum(Math.round(value))}pp`,
            formatDiff: value => `${fmtNum(Math.round(value))}pp`
        }
    ].map(metric => {
        const entries = valid
            .map(item => ({
                item,
                value: metric.value(item)
            }))
            .filter(entry => entry.value !== null)
            .sort((a, b) => metric.lowerBetter ? a.value - b.value : b.value - a.value);

        return { ...metric, entries };
    }).filter(metric => metric.entries.length >= 2);
}

function getCompareBreakdownPercent(metric, value, bestValue) {
    if (!Number.isFinite(value) || !Number.isFinite(bestValue) || value <= 0 || bestValue <= 0) return 0;
    const raw = metric.lowerBetter ? (bestValue / value) * 100 : (value / bestValue) * 100;
    return Math.max(4, Math.min(100, raw));
}

function formatCompareBreakdownDelta(metric, value, bestValue, isLeader) {
    if (isLeader) return LANGS[currentLang].compare.leaderBadge;

    const diff = metric.lowerBetter ? value - bestValue : bestValue - value;
    if (!Number.isFinite(diff) || diff <= 0) return '';

    const prefix = metric.lowerBetter ? '+' : '-';
    return `${prefix}${metric.formatDiff(diff)}`;
}

function getCompareBreakdownGapRatio(metric, diff, bestValue, secondValue) {
    if (!Number.isFinite(diff) || diff <= 0) return 0;

    if (metric.key === 'accuracy') {
        return diff / 100;
    }

    const baseline = metric.lowerBetter ? secondValue : bestValue;
    return Number.isFinite(baseline) && baseline > 0 ? diff / baseline : 0;
}

function getCompareBreakdownGapTone(metric, diff, ratio) {
    if (metric.key === 'accuracy') {
        if (diff <= 0.2) return 'close';
        if (diff >= 1) return 'dominant';
        return 'lead';
    }

    if (metric.key === 'global-rank') {
        if (ratio <= 0.08) return 'close';
        if (ratio >= 0.3) return 'dominant';
        return 'lead';
    }

    if (metric.key === 'play-count' || metric.key === 'play-time') {
        if (ratio <= 0.07) return 'close';
        if (ratio >= 0.35) return 'dominant';
        return 'lead';
    }

    if (ratio <= 0.03) return 'close';
    if (ratio >= 0.15) return 'dominant';
    return 'lead';
}

function getCompareBreakdownInsight(metric) {
    if (!metric.entries || metric.entries.length < 2) return null;

    const [best, second] = metric.entries;
    const diff = metric.lowerBetter ? second.value - best.value : best.value - second.value;
    if (!Number.isFinite(diff) || diff <= 0) return null;

    const ratio = getCompareBreakdownGapRatio(metric, diff, best.value, second.value);
    const tone = getCompareBreakdownGapTone(metric, diff, ratio);
    const compare = LANGS[currentLang].compare;
    const labels = {
        close: compare.closeGap,
        lead: compare.clearLead,
        dominant: compare.bigGap
    };
    const username = best.item.data.username || best.item.name || 'osu!';

    return {
        tone,
        label: labels[tone],
        username,
        diff: `+${metric.formatDiff(diff)}`
    };
}

function renderCompareBreakdownRow(metric, entry, index, bestValue) {
    const username = entry.item.data.username || entry.item.name || 'osu!';
    const isLeader = index === 0;
    const creatorClass = isCreatorUsername(username) ? ' creator-name' : '';
    const percent = getCompareBreakdownPercent(metric, entry.value, bestValue).toFixed(2);
    const delta = formatCompareBreakdownDelta(metric, entry.value, bestValue, isLeader);

    return `
        <div class="compare-breakdown-row${isLeader ? ' compare-breakdown-row--leader' : ''}">
            <div class="compare-breakdown-player">
                <span class="compare-breakdown-rank">#${index + 1}</span>
                <span class="compare-breakdown-name${creatorClass}">${escapeHtml(username)}</span>
            </div>
            <div class="compare-breakdown-score">
                <strong>${escapeHtml(metric.format(entry.value))}</strong>
                ${delta ? `<span>${escapeHtml(delta)}</span>` : ''}
            </div>
            <div class="compare-breakdown-track" aria-hidden="true">
                <div class="compare-breakdown-fill" style="--pct:${percent}%;"></div>
            </div>
        </div>
    `;
}

function renderCompareBreakdown(users, topPlays, isSingle) {
    const breakdown = document.getElementById('compare-breakdown');
    if (!breakdown) return;

    const valid = users
        .map((user, idx) => user.ok ? { ...user, topPlay: topPlays[idx] } : null)
        .filter(Boolean);

    if (isSingle || valid.length < 2) {
        breakdown.innerHTML = '';
        breakdown.style.display = 'none';
        return;
    }

    const metrics = getCompareBreakdownMetrics(valid);
    if (!metrics.length) {
        breakdown.innerHTML = '';
        breakdown.style.display = 'none';
        return;
    }

    const midpoint = Math.ceil(metrics.length / 2);
    const groups = [
        { side: 'left', items: metrics.slice(0, midpoint) },
        { side: 'right', items: metrics.slice(midpoint) }
    ];

    const renderMetricCard = metric => {
        const bestValue = metric.entries[0].value;
        const insight = getCompareBreakdownInsight(metric);
        const insightNameClass = insight && isCreatorUsername(insight.username) ? ' creator-name' : '';
        return `
            <div class="compare-breakdown-card compare-breakdown-card--${metric.tone}">
                <div class="compare-breakdown-metric">${escapeHtml(metric.label)}</div>
                ${insight ? `
                    <div class="compare-breakdown-insight compare-breakdown-insight--${insight.tone}">
                        <span>${escapeHtml(insight.label)}</span>
                        <strong class="${insightNameClass.trim()}">${escapeHtml(insight.username)}</strong>
                        <em>${escapeHtml(insight.diff)}</em>
                    </div>
                ` : ''}
                ${metric.entries.map((entry, index) =>
                    renderCompareBreakdownRow(metric, entry, index, bestValue)
                ).join('')}
            </div>
        `;
    };

    breakdown.innerHTML = `
        ${groups.map(group => `
            <div class="compare-breakdown-column compare-breakdown-column--${group.side}">
                ${group.items.map(renderMetricCard).join('')}
            </div>
        `).join('')}
    `;
    breakdown.style.display = 'grid';
}

function getMetricRanking(entries, valueFn, lowerBetter = false) {
    return entries
        .map(entry => ({ ...entry, value: getFiniteMetricValue(valueFn(entry)) }))
        .filter(entry => entry.value !== null)
        .sort((a, b) => lowerBetter ? a.value - b.value : b.value - a.value);
}

function getRankingLeadRatio(ranking, lowerBetter = false) {
    if (!ranking || ranking.length < 2) return 0;
    const [best, second] = ranking;
    const diff = lowerBetter ? second.value - best.value : best.value - second.value;
    if (!Number.isFinite(diff) || diff <= 0) return 0;
    const baseline = lowerBetter ? second.value : best.value;
    return baseline > 0 ? diff / baseline : 0;
}

function getEntryKey(entry) {
    return entry.data.id ?? entry.data.username ?? entry.index;
}

function addStyleTag(tagsByKey, entry, key, tone, priority) {
    if (!entry) return;
    const entryKey = getEntryKey(entry);
    const current = tagsByKey.get(entryKey) || [];
    if (current.some(tag => tag.key === key)) return;
    current.push({ key, tone, priority });
    tagsByKey.set(entryKey, current);
}

function getComparisonStyleTags(users, topPlays, isSingle) {
    const empty = users.map(() => []);
    if (isSingle) return empty;

    const entries = users
        .map((user, index) => user.ok ? {
            index,
            data: user.data,
            topPlay: topPlays[index],
            stats: user.data.statistics || {}
        } : null)
        .filter(Boolean);

    if (entries.length < 2) return empty;

    const tagsByKey = new Map(entries.map(entry => [getEntryKey(entry), []]));
    const ppRanking = getMetricRanking(entries, entry => entry.stats.pp);
    const accuracyRanking = getMetricRanking(entries, entry => entry.stats.hit_accuracy);
    const playCountRanking = getMetricRanking(entries, entry => entry.stats.play_count);
    const playTimeRanking = getMetricRanking(entries, entry => entry.stats.play_time);
    const globalRankRanking = getMetricRanking(entries, entry => entry.stats.global_rank, true);
    const topPlayRanking = getMetricRanking(entries, entry => entry.topPlay?.pp);
    const topPlayRatioRanking = getMetricRanking(entries, entry => {
        const pp = getFiniteMetricValue(entry.stats.pp);
        const topPp = getFiniteMetricValue(entry.topPlay?.pp);
        return pp && topPp ? topPp / pp : null;
    });

    const ppLeader = ppRanking[0];
    const ppLeaderKey = ppLeader ? getEntryKey(ppLeader) : null;
    addStyleTag(tagsByKey, ppLeader, 'ppLeader', 'gold', 100);

    const accuracyLeader = accuracyRanking[0];
    if (accuracyLeader) {
        const accuracyLead = accuracyRanking.length > 1 ? accuracyLeader.value - accuracyRanking[1].value : 0;
        if (accuracyLeader.value >= 98 || accuracyLead >= 0.2) {
            addStyleTag(tagsByKey, accuracyLeader, 'accuracyDemon', 'cyan', 92);
        }
    }

    const playCountLead = getRankingLeadRatio(playCountRanking);
    const playTimeLead = getRankingLeadRatio(playTimeRanking);
    if (playCountLead >= 0.12) addStyleTag(tagsByKey, playCountRanking[0], 'grinder', 'pink', 86);
    if (playTimeLead >= 0.12) addStyleTag(tagsByKey, playTimeRanking[0], 'grinder', 'pink', 86);

    const topRatioLeader = topPlayRatioRanking[0];
    if (topRatioLeader && topPlayRatioRanking.length > 1) {
        const ratioLead = topRatioLeader.value - topPlayRatioRanking[1].value;
        const isBestTopPlay = topPlayRanking[0] && getEntryKey(topPlayRanking[0]) === getEntryKey(topRatioLeader);
        if ((topRatioLeader.value >= 0.05 && ratioLead >= 0.004) || (isBestTopPlay && getEntryKey(topRatioLeader) !== ppLeaderKey)) {
            addStyleTag(tagsByKey, topRatioLeader, 'topPlayCarry', 'gold', 82);
        }
    }

    const metricLeaders = [accuracyRanking, playCountRanking, playTimeRanking, globalRankRanking, topPlayRanking]
        .map(ranking => ranking[0])
        .filter(Boolean);
    metricLeaders.forEach(entry => {
        if (getEntryKey(entry) !== ppLeaderKey) {
            addStyleTag(tagsByKey, entry, 'underdog', 'cyan', 70);
        }
    });

    entries.forEach(entry => {
        const topTwoCount = [ppRanking, accuracyRanking, playCountRanking, playTimeRanking, globalRankRanking, topPlayRanking]
            .filter(ranking => ranking.slice(0, 2).some(candidate => getEntryKey(candidate) === getEntryKey(entry)))
            .length;
        if (topTwoCount >= 4 && getEntryKey(entry) !== ppLeaderKey) {
            addStyleTag(tagsByKey, entry, 'balanced', 'neutral', 58);
        }
    });

    return users.map((user, index) => {
        if (!user.ok) return [];
        const entryKey = user.data.id ?? user.data.username ?? index;
        return (tagsByKey.get(entryKey) || [])
            .sort((a, b) => b.priority - a.priority)
            .slice(0, 3);
    });
}

function renderPlayerStyleTags(tags) {
    if (!tags?.length) return '';

    const compare = LANGS[currentLang].compare;
    return `
        <div class="player-style-tags" aria-label="${escapeHtml(compare.styleLabel)}">
            <div class="player-style-label">${escapeHtml(compare.styleLabel)}</div>
            <div class="player-style-chip-row">
                ${tags.map(tag => {
                    const label = compare.styleTags[tag.key] || tag.key;
                    const description = compare.styleTagDescriptions?.[tag.key] || label;
                    return `
                    <span class="player-style-chip player-style-chip--${tag.tone}" data-style-description="${escapeHtml(description)}" aria-label="${escapeHtml(description)}" tabindex="0">
                        ${escapeHtml(label)}
                    </span>
                `;
                }).join('')}
            </div>
        </div>
    `;
}

let playerStyleTooltipEl = null;

function getPlayerStyleTooltip() {
    if (playerStyleTooltipEl) return playerStyleTooltipEl;

    playerStyleTooltipEl = document.createElement('div');
    playerStyleTooltipEl.className = 'floating-style-tooltip';
    playerStyleTooltipEl.setAttribute('role', 'tooltip');
    document.body.appendChild(playerStyleTooltipEl);
    return playerStyleTooltipEl;
}

function positionPlayerStyleTooltip(target, tooltip) {
    const rect = target.getBoundingClientRect();
    const gap = 9;
    const margin = 8;
    const tooltipRect = tooltip.getBoundingClientRect();
    let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
    let top = rect.bottom + gap;

    left = Math.max(margin, Math.min(left, window.innerWidth - tooltipRect.width - margin));
    if (top + tooltipRect.height > window.innerHeight - margin) {
        top = rect.top - tooltipRect.height - gap;
        tooltip.classList.add('floating-style-tooltip--above');
    } else {
        tooltip.classList.remove('floating-style-tooltip--above');
    }

    const arrowX = rect.left + (rect.width / 2) - left;
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${Math.max(margin, top)}px`;
    tooltip.style.setProperty('--style-tooltip-arrow-x', `${Math.max(10, Math.min(tooltipRect.width - 10, arrowX))}px`);
}

function showPlayerStyleTooltip(target) {
    const description = target?.dataset?.styleDescription;
    if (!description) return;

    const tooltip = getPlayerStyleTooltip();
    tooltip.textContent = description;
    tooltip.classList.add('is-visible');
    positionPlayerStyleTooltip(target, tooltip);
}

function hidePlayerStyleTooltip() {
    playerStyleTooltipEl?.classList.remove('is-visible');
}

function setupPlayerStyleTooltips() {
    if (setupPlayerStyleTooltips.ready) return;
    setupPlayerStyleTooltips.ready = true;

    document.addEventListener('pointerover', event => {
        const target = event.target.closest?.('.player-style-chip');
        if (target) showPlayerStyleTooltip(target);
    });

    document.addEventListener('pointerout', event => {
        const target = event.target.closest?.('.player-style-chip');
        if (target && !target.contains(event.relatedTarget)) hidePlayerStyleTooltip();
    });

    document.addEventListener('focusin', event => {
        if (event.target.matches?.('.player-style-chip')) showPlayerStyleTooltip(event.target);
    });

    document.addEventListener('focusout', event => {
        if (event.target.matches?.('.player-style-chip')) hidePlayerStyleTooltip();
    });

    window.addEventListener('scroll', hidePlayerStyleTooltip, true);
    window.addEventListener('resize', hidePlayerStyleTooltip);
}

// ══ TOP PLAY COMPACTO (cards multi-player) ══
function renderTopPlayCompact(score) {
    const t = LANGS[currentLang];
    if (!score) {
        return `<div class="tp-compact">
            <div class="tp-compact-info">
                <div class="tp-compact-label">${escapeHtml(t.topPlay)}</div>
                <div class="tp-compact-title" style="color:var(--muted)">${escapeHtml(t.noTopPlay)}</div>
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
        ${cover ? `<img class="tp-compact-cover" src="${escapeHtml(cover)}" alt="cover" onerror="this.style.display='none'">` : ''}
        <div class="tp-compact-info">
            <div class="tp-compact-label">♛ ${escapeHtml(t.topPlay)}</div>
            <div class="tp-compact-title">${escapeHtml(mapName)}</div>
            <div class="tp-compact-mods">${renderModChips(mods)}</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:0.3rem;flex-shrink:0">
            <div class="tp-compact-pp">${fmtNum(pp)}<span>pp</span></div>
            <a class="tp-compact-link" href="${escapeHtml(mapUrl)}" target="_blank" rel="noopener" title="Ver en osu!">↗</a>
        </div>
    </div>`;
}

// ══ TOP PLAY FULL (single player, derecha de la card) ══
function renderTopPlayFull(score) {
    const t = LANGS[currentLang];
    if (!score) {
        return `<div class="tp-full" style="justify-content:center;align-items:center;">
            <div style="color:var(--muted);font-family:'Oswald',sans-serif;font-size:0.8rem;letter-spacing:0.2em">${escapeHtml(t.noTopPlay.toUpperCase())}</div>
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
            <span class="tp-full-label">${escapeHtml(t.topPlay)}</span>
        </div>
        <div class="tp-full-body">
            <div class="tp-full-cover-wrap">
                ${cover
            ? `<img class="tp-full-cover" src="${escapeHtml(cover)}" alt="cover" onerror="this.style.display='none'">`
            : `<div class="tp-full-cover" style="background:var(--dark3);display:flex;align-items:center;justify-content:center;font-size:2rem;opacity:0.3">♫</div>`}
            </div>
            <div class="tp-full-info">
                <div class="tp-full-map-name">${escapeHtml(mapName)}</div>
                <div class="tp-full-artist">by ${escapeHtml(artist)}</div>
                <div class="tp-full-tags">
                    ${renderModChips(mods)}
                    ${stars ? `<span class="tp-full-stars">✦ ${stars}</span>` : ''}
                    ${diff ? `<span style="font-family:'Oswald',sans-serif;font-size:0.65rem;color:var(--muted);letter-spacing:0.1em">[${escapeHtml(diff)}]</span>` : ''}
                </div>
                <div class="tp-full-pp-row">
                    <span class="tp-full-pp-label">${escapeHtml(t.ppGained)}</span>
                    <div class="tp-full-pp-value">${fmtNum(pp)}<span>pp</span></div>
                </div>
            </div>
        </div>
        <div class="tp-full-mini-stats">
            <div class="tp-mini-stat">
                <div class="tp-mini-label">${escapeHtml(t.stats.accuracy)}</div>
                <div class="tp-mini-val acc">${acc}%</div>
            </div>
            <div class="tp-mini-stat">
                <div class="tp-mini-label">${escapeHtml(t.stats.maxCombo)}</div>
                <div class="tp-mini-val">${fmtNum(maxCombo)}x</div>
            </div>
            <div class="tp-mini-stat">
                <div class="tp-mini-label">${escapeHtml(t.stats.rank)}</div>
                <div class="${getRankClass(rank)}">${getRankDisplay(rank)}</div>
            </div>
            <div class="tp-mini-stat">
                <div class="tp-mini-label">${escapeHtml(t.stats.date)}</div>
                <div class="tp-mini-val date-val" style="white-space:pre-line;font-size:0.7rem">${escapeHtml(dateStr)}</div>
            </div>
        </div>
        <a class="tp-full-openmap" href="${escapeHtml(mapUrl)}" target="_blank" rel="noopener">↗ ${escapeHtml(t.openMap.replace('↗ ', ''))}</a>
    </div>`;
}

// ══ RENDER CARD ══
function renderCard(user, rank, maxPP, idx, topPlay, isSingle, styleTags = []) {
    const t = LANGS[currentLang];
    const pp = Math.round(user.statistics?.pp || 0);
    const barPct = maxPP > 0 ? (pp / maxPP * 100) : 0;
    const delay = idx * 0.15;
    const username = user.username || 'osu!';
    const isCreator = isCreatorUsername(username);
    const avatarUrl = safeHttpUrl(user.avatar_url) || 'https://osu.ppy.sh/images/layout/avatar-guest.png';
    const title = getUserTitle(pp);
    const activity = getActivityLabel(user.last_visit);

    const card = document.createElement('div');
    card.className = 'player-card';
    card.style.animationDelay = delay + 's';

    // ── Layout VERTICAL (single y multi usan el mismo layout) ──
    card.innerHTML = `
    <div class="card-rank-badge">#${rank}</div>
    <div class="focus-hint">${escapeHtml(t.clickToExpand)}</div>

    <div class="card-avatar-section">
        <div class="avatar-frame${isCreator ? ' creator-frame' : ''}">
            <div class="avatar-glow"></div>
            <img class="avatar-img" src="${escapeHtml(avatarUrl)}" alt="${escapeHtml(username)}"
                 onerror="this.src='https://osu.ppy.sh/images/layout/avatar-guest.png'">
        </div>
        <div class="card-identity">
            ${renderCountryFlag(user.country_code)}
            <div class="player-name${isCreator ? ' creator-name' : ''}">${escapeHtml(username)}</div>
            <div class="player-title${isCreator ? ' creator-title' : ''}">${escapeHtml(isCreator ? 'PAGE CREATOR' : title)}</div>
            ${activity ? `<div class="activity-indicator${activity.active ? ' activity-now' : ''}">${escapeHtml(activity.text)}</div>` : ''}
        </div>
    </div>

    <div class="pp-section">
        <div class="pp-label">${escapeHtml(t.stats.pp)}</div>
        <div class="pp-value">${fmtNum(pp)}<span class="pp-unit">pp</span></div>
        <div class="pp-bar-wrap">
            <div class="pp-bar-bg">
                <div class="pp-bar-fill" data-pct="${isSingle ? 100 : barPct}"></div>
            </div>
        </div>
    </div>

    ${renderPlayerStyleTags(styleTags)}

    ${renderTopPlayCompact(topPlay)}

    <div class="stats-grid">
        <div class="stat-cell">
            <div class="stat-label">${escapeHtml(t.stats.acc)}</div>
            <div class="stat-value accent">${fmtAcc(user.statistics?.hit_accuracy)}</div>
        </div>
        <div class="stat-cell">
            <div class="stat-label">${escapeHtml(t.stats.playcount)}</div>
            <div class="stat-value">${fmtNum(user.statistics?.play_count)}</div>
        </div>
        <div class="stat-cell">
            <div class="stat-label">${escapeHtml(t.stats.playtime)}</div>
            <div class="stat-value">${fmtTime(user.statistics?.play_time)}</div>
        </div>
        <div class="stat-cell">
            <div class="stat-label">${escapeHtml(t.stats.score)}</div>
            <div class="stat-value gold">${fmtNum(user.statistics?.total_score)}</div>
        </div>
    </div>

    <div class="rank-section">
        <div class="rank-global">
            <div class="rank-num">#${fmtNum(user.statistics?.global_rank) || '—'}</div>
            <div class="rank-type">${escapeHtml(t.stats.global)}</div>
        </div>
        <div class="rank-divider"></div>
        <div class="rank-global">
            <div class="rank-num">#${fmtNum(user.statistics?.country_rank) || '—'}</div>
            <div class="rank-type">${escapeHtml(user.country_code || t.stats.country)}</div>
        </div>
        <div class="rank-divider"></div>
        <div class="rank-global">
            <div class="rank-num" style="font-size:1rem;">${escapeHtml(user.statistics?.level?.current || '—')}</div>
            <div class="rank-type">${escapeHtml(t.stats.level)}</div>
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
    const username = user.username || 'osu!';
    const isCreator = isCreatorUsername(username);
    const pp = Math.round(user.statistics?.pp || 0);

    // Avatar
    const avatarEl = document.getElementById('focus-avatar');
    avatarEl.src = safeHttpUrl(user.avatar_url) || 'https://osu.ppy.sh/images/layout/avatar-guest.png';
    avatarEl.alt = username;

    const avatarWrap = document.getElementById('focus-avatar-wrap');
    avatarWrap.className = 'focus-avatar-wrap' + (isCreator ? ' creator-frame' : '');

    // Identidad
    document.getElementById('focus-flag').textContent = getCountryFlag(user.country_code);

    const nameEl = document.getElementById('focus-name');
    nameEl.textContent = username;
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
        navigateToRoom('player', username);
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
                trendHtml = `<div class="focus-trend focus-trend--stable">${escapeHtml(t.trendStable)} <span class="focus-trend-label">${escapeHtml(t.trend90)}</span></div>`;
            } else {
                const arrow = trend.state === 'up' ? '↗' : '↘';
                const sign = trend.state === 'up' ? '+' : '−';
                const cls = trend.state === 'up' ? 'focus-trend--up' : 'focus-trend--down';
                trendHtml = `<div class="focus-trend ${cls}">${arrow} ${sign}${fmtNum(Math.abs(trend.diff))} <span class="focus-trend-label">${escapeHtml(t.trend90)}</span></div>`;
            }
        }
        metricsEl.innerHTML = `
            ${peakRank ? `<div class="focus-peak"><span class="focus-peak-icon">★</span><span class="focus-peak-label">${escapeHtml(t.peakRank)}</span><span class="focus-peak-value">#${fmtNum(peakRank)}</span></div>` : ''}
            ${trendHtml}`;
    } else {
        metricsEl.innerHTML = '';
    }

    // Ranks
    document.getElementById('focus-ranks').innerHTML = `
        <div class="focus-rank-item">
            <div class="focus-rank-num">#${fmtNum(user.statistics?.global_rank) || '—'}</div>
            <div class="focus-rank-type">${escapeHtml(t.stats.global)}</div>
        </div>
        <div class="focus-rank-item">
            <div class="focus-rank-num">#${fmtNum(user.statistics?.country_rank) || '—'}</div>
            <div class="focus-rank-type">${escapeHtml(user.country_code || t.stats.country)}</div>
        </div>
        <div class="focus-rank-item">
            <div class="focus-rank-num">${escapeHtml(user.statistics?.level?.current || '—')}</div>
            <div class="focus-rank-type">${escapeHtml(t.stats.level)}</div>
        </div>`;

    const focusTotalHits = formatOptionalNumber(getUserTotalHits(user.statistics));
    const focusMaxCombo = formatOptionalNumber(getUserMaxCombo(user.statistics), 'x');
    const focusReplaysWatched = formatOptionalNumber(getUserReplaysWatched(user.statistics));

    // Stats extendidos
    document.getElementById('focus-stats').innerHTML = `
        <div class="focus-stat-cell">
            <div class="focus-stat-label">${escapeHtml(t.stats.acc)}</div>
            <div class="focus-stat-val accent">${fmtAcc(user.statistics?.hit_accuracy)}</div>
        </div>
        <div class="focus-stat-cell">
            <div class="focus-stat-label">${escapeHtml(t.stats.playcount)}</div>
            <div class="focus-stat-val">${fmtNum(user.statistics?.play_count)}</div>
        </div>
        <div class="focus-stat-cell">
            <div class="focus-stat-label">${escapeHtml(t.stats.playtime)}</div>
            <div class="focus-stat-val">${fmtTime(user.statistics?.play_time)}</div>
        </div>
        <div class="focus-stat-cell">
            <div class="focus-stat-label">${escapeHtml(t.stats.score)}</div>
            <div class="focus-stat-val gold">${fmtNum(user.statistics?.total_score)}</div>
        </div>
        <div class="focus-stat-cell">
            <div class="focus-stat-label">${escapeHtml(t.stats.maxCombo)}</div>
            <div class="focus-stat-val">${escapeHtml(focusMaxCombo)}</div>
        </div>
        <div class="focus-stat-cell">
            <div class="focus-stat-label">${escapeHtml(t.stats.totalHits)}</div>
            <div class="focus-stat-val accent">${escapeHtml(focusTotalHits)}</div>
        </div>
        <div class="focus-stat-cell">
            <div class="focus-stat-label">${escapeHtml(t.stats.replaysWatched)}</div>
            <div class="focus-stat-val">${escapeHtml(focusReplaysWatched)}</div>
        </div>`;

    // Top play en modal
    renderFocusTopPlay(topPlay);
    document.getElementById('focus-score-client').innerHTML = topPlay ? renderScoreClient(topPlay) : '';

    // Fondo beatmap
    const bgEl = document.getElementById('focus-bg');
    bgEl.className = 'focus-bg';
    bgEl.style.backgroundImage = '';
    const bgCover = safeHttpUrl(topPlay?.beatmapset?.covers?.cover
        || topPlay?.beatmapset?.covers?.['cover@2x']
        || getCoverUrl(topPlay));
    if (bgCover) {
        const img = new Image();
        img.onload = () => {
            bgEl.style.backgroundImage = `url("${escapeCssUrl(bgCover)}")`;
            bgEl.classList.add('loaded');
        };
        img.src = bgCover;
    }

    // Abrir
    const overlay = document.getElementById('focus-overlay');
    clearTimeout(focusCleanupTimer);
    overlay.classList.remove('is-closing');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    window.AppAnimations?.enterFocus(overlay);

    // Scroll al top del modal
    document.getElementById('focus-modal').scrollTop = 0;
}

function renderFocusTopPlay(score) {
    const t = LANGS[currentLang];
    const body = document.getElementById('focus-topplay-body');

    if (!score) {
        body.innerHTML = `<div style="color:var(--muted);font-family:'Oswald',sans-serif;font-size:0.85rem;letter-spacing:0.2em;padding:1rem">${escapeHtml(t.noTopPlay.toUpperCase())}</div>`;
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
            ? `<img class="focus-tp-cover" src="${escapeHtml(cover)}" alt="cover" onerror="this.style.display='none'">`
            : `<div class="focus-tp-cover" style="background:var(--dark3);display:flex;align-items:center;justify-content:center;font-size:3rem;opacity:0.3">♫</div>`}
    </div>
    <div class="focus-tp-info">
        <div class="focus-tp-map">${escapeHtml(mapName)}</div>
        <div class="focus-tp-artist">by ${escapeHtml(artist)}</div>
        <div class="focus-tp-tags">
            ${renderModChips(mods)}
            ${stars ? `<span class="tp-full-stars">✦ ${stars}</span>` : ''}
            ${diff ? `<span style="font-family:'Oswald',sans-serif;font-size:0.7rem;color:var(--muted);letter-spacing:0.1em">[${escapeHtml(diff)}]</span>` : ''}
        </div>
        <div class="focus-tp-pp-row">
            <span class="focus-tp-pp-label">${escapeHtml(t.ppGained)}</span>
            <div class="focus-tp-pp-value">${fmtNum(pp)}<span>pp</span></div>
        </div>
        <div class="focus-tp-mini-grid">
            <div class="focus-tp-mini-cell">
                <div class="focus-tp-mini-label">${escapeHtml(t.stats.accuracy)}</div>
                <div class="focus-tp-mini-val acc">${acc}%</div>
            </div>
            <div class="focus-tp-mini-cell">
                <div class="focus-tp-mini-label">${escapeHtml(t.stats.maxCombo)}</div>
                <div class="focus-tp-mini-val">${fmtNum(maxCombo)}x</div>
            </div>
            <div class="focus-tp-mini-cell">
                <div class="focus-tp-mini-label">${escapeHtml(t.stats.rank)}</div>
                <div class="${getRankClass(rank)}">${getRankDisplay(rank)}</div>
            </div>
            <div class="focus-tp-mini-cell">
                <div class="focus-tp-mini-label">${escapeHtml(t.stats.misses)}</div>
                <div class="focus-tp-mini-val${misses > 0 ? ' miss-val' : ''}">${misses > 0 ? `${misses} ✗` : '0 ✓'}</div>
            </div>
            <div class="focus-tp-mini-cell date-cell">
                <div class="focus-tp-mini-label">${escapeHtml(t.stats.date)}</div>
                <div class="focus-tp-mini-val date-sm" style="white-space:pre-line">${escapeHtml(dateStr)}</div>
            </div>
        </div>
        <div class="focus-tp-actions">
            <a class="focus-tp-openmap" href="${escapeHtml(mapUrl)}" target="_blank" rel="noopener">↗ ${escapeHtml(t.openMap.replace('↗ ', ''))}</a>
            ${replayUrl
            ? `<a class="focus-tp-replay" href="${escapeHtml(replayUrl)}" target="_blank" rel="noopener">⬇ ${escapeHtml(t.downloadReplay)}</a>`
            : `<span class="focus-tp-replay focus-tp-replay--disabled">⬇ ${escapeHtml(t.replayUnavailable)}</span>`
        }
        </div>
    </div>`;
}

function closeFocusBtn() {
    const overlay = document.getElementById('focus-overlay');
    if (!overlay) return;

    const finishClose = () => {
        overlay.classList.remove('active', 'is-closing');
        document.body.style.overflow = '';
        focusCleanupTimer = setTimeout(() => {
            if (overlay.classList.contains('active')) return;
            const bg = document.getElementById('focus-bg');
            bg.className = 'focus-bg';
            bg.style.backgroundImage = '';
        }, 120);
    };

    if (!overlay.classList.contains('active')) {
        finishClose();
        return;
    }

    overlay.classList.add('is-closing');
    const animated = window.AppAnimations?.exitFocus(overlay, finishClose);
    if (!animated) finishClose();
}

function closeFocus(e) {
    if (e.target === document.getElementById('focus-overlay')) {
        window.UISounds?.play('back');
        closeFocusBtn();
    }
}

// ESC para cerrar
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        if (compareDuelModeEnabled) {
            window.UISounds?.play('back');
            closeCompareDuelMode();
            return;
        }

        const focusOverlay = document.getElementById('focus-overlay');
        if (focusOverlay?.classList.contains('active')) {
            window.UISounds?.play('back');
            closeFocusBtn();
            return;
        }

        if (shouldReturnToResultsFromRoom()) {
            window.UISounds?.play('back');
            navigateToRoom('results');
            return;
        }

        if (currentRoomRoute?.name === 'top-plays' && currentRoomRoute.param) {
            window.UISounds?.play('back');
            navigateToRoom('player', currentRoomRoute.param);
            return;
        }

        if (currentRoomRoute?.name === 'recent' && currentRoomRoute.param) {
            window.UISounds?.play('back');
            navigateToRoom('player', currentRoomRoute.param);
            return;
        }
    }

    if (e.key === 'Enter' && document.getElementById('landing').style.display !== 'none') {
        doSearch();
    }
});

function getSharedComparePlayers() {
    const repeated = INITIAL_URL_PARAMS.getAll('player');
    const combined = (INITIAL_URL_PARAMS.get('players') || '')
        .split(',')
        .map(value => value.trim())
        .filter(Boolean);
    const seen = new Set();

    return [...repeated, ...combined]
        .map(value => String(value ?? '').trim())
        .filter(value => {
            const key = normalizeUsername(value);
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
        })
        .slice(0, 4);
}

function getSharedCompareMode() {
    const mode = String(INITIAL_URL_PARAMS.get('mode') || 'osu').trim();
    return ['osu', 'taiko', 'fruits', 'mania'].includes(mode) ? mode : 'osu';
}

function getSharedCompareTheme() {
    const theme = String(INITIAL_URL_PARAMS.get('theme') || 'cyberpunk').trim();
    return ['cyberpunk', 'heaven'].includes(theme) ? theme : 'cyberpunk';
}

function markSharedCompareReady() {
    if (!IS_SHARE_MODE) return;
    window.__osuShareReady = true;
}

function markSharedCompareError(error) {
    if (!IS_SHARE_MODE) return;
    window.__osuShareError = error?.message || String(error || 'share_error');
    window.__osuShareReady = true;
}

async function waitForSharedCompareImages(timeoutMs = 2600) {
    if (!IS_SHARE_MODE) return;

    const pendingImages = [...document.images].filter(img => !img.complete);
    if (!pendingImages.length) return;

    await Promise.race([
        Promise.all(pendingImages.map(img => new Promise(resolve => {
            img.addEventListener('load', resolve, { once: true });
            img.addEventListener('error', resolve, { once: true });
        }))),
        new Promise(resolve => setTimeout(resolve, timeoutMs))
    ]);
}

function initSharedCompareMode() {
    if (!IS_SHARE_COMPARE_MODE) return;

    document.body.classList.add('share-mode', 'share-compare-mode');
    hydrateCompareFromUrlParams();

    const players = getSharedComparePlayers();
    if (players.length < 2) {
        markSharedCompareReady();
        return;
    }

    doSearch().catch(markSharedCompareError);
}

function getSharedRoomName() {
    const room = String(INITIAL_URL_PARAMS.get('room') || 'player').trim().toLowerCase();
    if (room === 'profile' || room === 'player') return 'player';
    if (room === 'top' || room === 'top-plays') return 'top-plays';
    if (room === 'recent' || room === 'recent-plays') return 'recent';
    return 'player';
}

function getSharedRoomPlayer() {
    return String(INITIAL_URL_PARAMS.get('user') || INITIAL_URL_PARAMS.get('player') || '').trim();
}

function getSharedRecentPage() {
    const page = Number(INITIAL_URL_PARAMS.get('page') || 1);
    return Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1;
}

function getSharedTopPlaysPage() {
    const page = Number(INITIAL_URL_PARAMS.get('page') || 1);
    return Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1;
}

function getSharedTopPlaysPageSize() {
    const pageSize = Number(INITIAL_URL_PARAMS.get('pageSize') || DISCORD_TOP_PLAYS_PAGE_SIZE);
    return Number.isFinite(pageSize) ? Math.max(3, Math.min(4, Math.floor(pageSize))) : DISCORD_TOP_PLAYS_PAGE_SIZE;
}

function getSharedRecentPageSize() {
    const pageSize = Number(INITIAL_URL_PARAMS.get('pageSize') || DISCORD_RECENT_PAGE_SIZE);
    return Number.isFinite(pageSize) ? Math.max(3, Math.min(4, Math.floor(pageSize))) : DISCORD_RECENT_PAGE_SIZE;
}

function hydrateShareBaseFromUrlParams(forceDefaults = true) {
    if (forceDefaults || INITIAL_URL_PARAMS.has('theme')) {
        const theme = getSharedCompareTheme();
        if (typeof applyTheme === 'function') {
            applyTheme(theme);
        } else {
            document.documentElement.dataset.theme = theme;
        }
    }

    if (forceDefaults || INITIAL_URL_PARAMS.has('mode')) {
        const modeSelect = document.getElementById('gamemode');
        if (modeSelect) modeSelect.value = getSharedCompareMode();
    }
}

function hydrateLinkedContextFromUrlParams() {
    if (!INITIAL_URL_PARAMS.has('theme') && !INITIAL_URL_PARAMS.has('mode')) return;
    hydrateShareBaseFromUrlParams(false);
}

async function initSharedRoomMode() {
    if (!IS_SHARE_ROOM_MODE) return;

    document.body.classList.add('share-mode', 'share-room-mode', `share-room-${getSharedRoomName()}`);
    hydrateShareBaseFromUrlParams();

    const username = getSharedRoomPlayer();
    if (!username) {
        markSharedCompareReady();
        return;
    }

    const route = { name: getSharedRoomName(), param: username };
    try {
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
        setActiveRoomLink('');
        currentRoomRoute = route;
        updateRoomBackLabel();

        if (route.name === 'player') {
            await renderPlayerRoom(route);
        } else if (route.name === 'top-plays') {
            await renderTopPlaysRoom(route);
        } else {
            await renderRecentPlaysRoom(route);
        }

        await waitForSharedCompareImages(3200);
        markSharedCompareReady();
    } catch (error) {
        markSharedCompareError(error);
    }
}

function hydrateCompareFromUrlParams() {
    hydrateShareBaseFromUrlParams();

    const players = getSharedComparePlayers();
    const inputs = getPlayerInputs();
    inputs.forEach((input, index) => {
        input.value = players[index] || '';
        delete input.dataset.friendUsername;
    });
}

function initLinkedCompareMode() {
    hydrateCompareFromUrlParams();

    const players = getSharedComparePlayers();
    if (players.length < 2) {
        handleRouteChange();
        return;
    }

    doSearch().catch(() => handleRouteChange());
}

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
    compareDuelModeEnabled = false;
    syncCompareDuelModeState([], names.length === 1);

    currentPlayers = names;
    currentMode = document.getElementById('gamemode').value;
    if (!IS_SHARE_COMPARE_MODE) {
        saveComparisonToHistory(currentPlayers, currentMode);
    }

    const nextUrl = IS_SHARE_COMPARE_MODE
        ? `${window.location.pathname}${window.location.search}${buildRoomHash('results')}`
        : buildRoomHash('results');
    history.replaceState(null, '', nextUrl);
    showResultsRoom();


    const t = LANGS[currentLang];
    document.getElementById('mode-display').innerHTML =
        `<div class="mode-chip">${escapeHtml(t.modes[currentMode] || currentMode)}</div>
         <div class="mode-chip">${names.length} ${escapeHtml(names.length === 1 ? t.players.one : t.players.many)}</div>`;

    const loadResult = await loadCards();
    if (!IS_SHARE_MODE) {
        const playerCount = Math.min(4, Math.max(1, names.length));
        window.UISounds?.play(loadResult?.failed ? 'error' : `comparison-${playerCount}`);
    }
    await waitForSharedCompareImages();
    markSharedCompareReady();

    if (!IS_SHARE_COMPARE_MODE) {
        if (refreshTimer) clearInterval(refreshTimer);
        refreshTimer = setInterval(refreshData, 60000);
    }
}

async function loadCards() {
    const isSingle = currentPlayers.length === 1;
    const container = document.getElementById('cards');

    container.className = 'cards-container';
    container.classList.add(`players-${Math.min(Math.max(currentPlayers.length, 1), 4)}`);
    if (isSingle) container.classList.add('single-player');
    else if (currentPlayers.length === 4) container.classList.add('four-cards');

    container.innerHTML = '';
    document.getElementById('podium-banner').style.display = 'none';
    const summary = document.getElementById('compare-summary');
    if (summary) {
        summary.innerHTML = '';
        summary.style.display = 'none';
    }
    const duelControls = document.getElementById('compare-duel-controls');
    if (duelControls) {
        duelControls.innerHTML = '';
        duelControls.style.display = 'none';
    }
    const duel = document.getElementById('compare-duel');
    if (duel && !compareDuelModeEnabled) {
        duel.innerHTML = '';
        duel.style.display = 'none';
    }
    const breakdown = document.getElementById('compare-breakdown');
    if (breakdown) {
        breakdown.innerHTML = '';
        breakdown.style.display = 'none';
    }

    // Spinners
    currentPlayers.forEach(() => {
        const loadDiv = document.createElement('div');
        loadDiv.className = 'card-loading';
        loadDiv.innerHTML = `<div class="spinner"></div>
                             <div class="loading-text">${escapeHtml(LANGS[currentLang].loading)}</div>`;
        container.appendChild(loadDiv);
    });

    // Fetch usuarios y mejores jugadas en paralelo
    const [userResults, bestResults] = await Promise.all([
        Promise.allSettled(currentPlayers.map(name => fetchPlayer(name, currentMode))),
        Promise.allSettled(currentPlayers.map(name => fetchBestPlays(name, currentMode, DUEL_TOP_PLAYS_LIMIT)))
    ]);

    // Timestamp
    const now = new Date();
    document.getElementById('last-update').textContent =
        now.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const users = userResults.map((r, i) => {
        if (r.status === 'fulfilled') return { ok: true, data: r.value, name: currentPlayers[i] };
        return { ok: false, error: r.reason.message, name: currentPlayers[i] };
    });

    const bestPlays = bestResults.map(r => r.status === 'fulfilled' && Array.isArray(r.value) ? r.value : []);
    const topPlays = bestPlays.map(scores => scores[0] || null);
    lastComparisonUsers = users;
    lastComparisonTopPlays = topPlays;
    lastComparisonBestPlays = bestPlays;
    lastComparisonIsSingle = isSingle;

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
    renderCompareDuelControls(users, isSingle);
    renderCompareDuel(users, topPlays, isSingle, bestPlays);
    renderCompareBreakdown(users, topPlays, isSingle);
    const styleTags = getComparisonStyleTags(users, topPlays, isSingle);

    // Render
    container.innerHTML = '';
    users.forEach((u, idx) => {
        if (u.ok) {
            const rank = isSingle ? 1 : (sorted.findIndex(s => s.data.id === u.data.id) + 1);
            const card = renderCard(u.data, rank, maxPP, idx, topPlays[idx], isSingle, styleTags[idx]);
            container.appendChild(card);
        } else {
            const errDiv = document.createElement('div');
            errDiv.className = 'card-error';
            errDiv.style.animationDelay = (idx * 0.15) + 's';
            errDiv.innerHTML = `
                <div class="error-icon">!</div>
                <div class="error-text">${escapeHtml(u.error)}</div>
                <div style="margin-top:0.5rem;font-size:0.7rem;color:#88446688;font-family:'Oswald',sans-serif;letter-spacing:0.1em;">${escapeHtml(u.name)}</div>`;
            container.appendChild(errDiv);
        }
    });

    // Animar barras PP
    setTimeout(() => {
        document.querySelectorAll('.pp-bar-fill').forEach(el => {
            el.style.width = el.dataset.pct + '%';
        });
    }, 200);

    return {
        success: users.filter(user => user.ok).length,
        failed: users.filter(user => !user.ok).length
    };
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
setupPlayerStyleTooltips();
applyLang();
window.addEventListener('hashchange', handleRouteChange);
if (IS_SHARE_COMPARE_MODE) {
    initSharedCompareMode();
} else if (IS_SHARE_ROOM_MODE) {
    initSharedRoomMode();
} else if (HAS_LINKED_COMPARE_PARAMS) {
    initLinkedCompareMode();
    initAuth();
} else {
    hydrateLinkedContextFromUrlParams();
    handleRouteChange();
    initAuth();
}
getPlayerInputs().forEach(input => {
    input.addEventListener('input', syncFriendSelectionsFromInputs);
});
