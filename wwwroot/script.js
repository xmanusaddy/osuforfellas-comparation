/* ══════════════════════════════════════
   fellas comparation — script.js
   ══════════════════════════════════════ */

// ══ IDIOMAS ══
let currentLang = localStorage.getItem('lang') || 'es';

const LANGS = {
    es: {
        search: '▶ BUSCAR JUGADORES',
        loading: 'Cargando...',
        updated: 'Actualizado',
        refresh: '⟳ Actualizar',
        refreshing: '⟳ Actualizando...',
        leader: '👑 Líder',
        back: '← Volver',
        theme: 'Tema',
        focusBtn: '⤢',
        playedOnLazer: 'Jugado en Lazer',
        playedOnStable: 'Jugado en Stable',
        openMap: '↗ VER BEATMAP EN OSU!',
        topPlay: 'TOP PLAY',
        ppGained: 'PP GANADOS',
        noTopPlay: 'Sin top play',
        misses: 'Misses',
        downloadReplay: 'Descargar Replay',
        replayUnavailable: 'Replay no disponible',
        clickToExpand: 'CLICK PARA EXPANDIR',
        errors: {
            userNotFound: 'Jugador "{user}" no encontrado',
            one: 'Un jugador no fue encontrado',
            two: 'Dos jugadores no fueron encontrados',
            all: 'Ningún jugador fue encontrado',
            mixed: 'No se puede comparar: hay jugadores inválidos'
        },
        players: { one: 'jugador', many: 'jugadores' },
        modes: { osu: 'osu!', taiko: 'osu!Taiko', fruits: 'osu!Catch', mania: 'osu!Mania' },
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
        loading: 'Loading...',
        updated: 'Updated',
        refresh: '⟳ Refresh',
        refreshing: '⟳ Refreshing...',
        leader: '👑 Leader',
        back: '← Back',
        theme: 'Theme',
        focusBtn: '⤢',
        playedOnLazer: 'Played on Lazer',
        playedOnStable: 'Played on Stable',
        openMap: '↗ OPEN BEATMAP IN OSU!',
        topPlay: 'TOP PLAY',
        ppGained: 'PP GAINED',
        noTopPlay: 'No top play',
        misses: 'Misses',
        downloadReplay: 'Download Replay',
        replayUnavailable: 'Replay unavailable',
        clickToExpand: 'CLICK TO EXPAND',
        errors: {
            userNotFound: 'Player "{user}" not found',
            one: 'One player was not found',
            two: 'Two players were not found',
            all: 'No players were found',
            mixed: 'Cannot compare: some players are invalid'
        },
        players: { one: 'player', many: 'players' },
        modes: { osu: 'osu!', taiko: 'osu!Taiko', fruits: 'osu!Catch', mania: 'osu!Mania' },
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
        loading: 'Wird geladen...',
        updated: 'Aktualisiert',
        refresh: '⟳ Aktualisieren',
        refreshing: '⟳ Wird aktualisiert...',
        leader: '👑 Anführer',
        back: '← Zurück',
        theme: 'Thema',
        focusBtn: '⤢',
        playedOnLazer: 'Gespielt auf Lazer',
        playedOnStable: 'Gespielt auf Stable',
        openMap: '↗ BEATMAP IN OSU! ÖFFNEN',
        topPlay: 'TOP PLAY',
        ppGained: 'PP ERHALTEN',
        noTopPlay: 'Kein Top-Play',
        misses: 'Misses',
        downloadReplay: 'Replay herunterladen',
        replayUnavailable: 'Replay nicht verfügbar',
        clickToExpand: 'KLICKEN ZUM ERWEITERN',
        errors: {
            userNotFound: 'Spieler "{user}" nicht gefunden',
            one: 'Ein Spieler wurde nicht gefunden',
            two: 'Zwei Spieler wurden nicht gefunden',
            all: 'Keine Spieler gefunden',
            mixed: 'Vergleich nicht möglich: ungültige Spieler vorhanden'
        },
        players: { one: 'Spieler', many: 'Spieler' },
        modes: { osu: 'osu!', taiko: 'osu!Taiko', fruits: 'osu!Catch', mania: 'osu!Mania' },
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
    document.getElementById('btn-search').textContent = t.search;
    document.getElementById('btn-refresh').textContent = t.refresh;
    document.getElementById('btn-back').textContent = t.back;
    document.getElementById('theme-label').textContent = t.theme;
    document.getElementById('theme-select').setAttribute('aria-label', t.theme);

    const label = document.querySelector('.podium-label');
    if (label) label.textContent = t.leader;

    document.querySelector('.refresh-info').innerHTML =
        `${t.updated}: <span id="last-update">—</span>`;

    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.lang-btn[data-lang='${currentLang}']`)?.classList.add('active');

    if (document.getElementById('results').style.display !== 'none') {
        loadCards();
    }
}

function changeLang(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    applyLang();
}

// ══ ESTADO ══
let currentPlayers = [];
let currentMode = 'osu';
let refreshTimer = null;
// Cache de top plays para el Focus Mode: { 'username': scoreData | null }
let topPlayCache = {};

// ══ FONDO ANIMADO ══
(function bgInit() {
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');
    let W, H, circles = [];

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
        requestAnimationFrame(tick);
    }
    tick();
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
        const res = await fetch(`/api/osu/${mode}/${encodeURIComponent(username)}/best`);
        if (!res.ok) { topPlayCache[cacheKey] = null; return null; }
        const data = await res.json();
        // El endpoint devuelve un array con 1 score
        const score = Array.isArray(data) ? data[0] : null;
        topPlayCache[cacheKey] = score || null;
        return topPlayCache[cacheKey];
    } catch {
        topPlayCache[cacheKey] = null;
        return null;
    }
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
    const m = mod.toUpperCase();
    if (m === 'HD') return 'mod-hd';
    if (m === 'HR') return 'mod-hr';
    if (m === 'DT' || m === 'NC') return 'mod-dt';
    if (m === 'FL') return 'mod-fl';
    if (m === 'EZ') return 'mod-ez';
    if (m === 'NF') return 'mod-nf';
    return '';
}

function renderModChips(mods) {
    return mods.map(m => `<span class="mod-chip ${modClass(m)}">${m}</span>`).join('');
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

    document.getElementById('focus-pp').innerHTML =
        `${fmtNum(pp)}<span class="focus-pp-unit">pp</span>`;

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
    if (e.key === 'Escape') closeFocusBtn();
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

    currentPlayers = names;
    currentMode = document.getElementById('gamemode').value;

    document.getElementById('landing').style.display = 'none';
    document.getElementById('results').style.display = 'block';
    document.getElementById('lang-switch').classList.add('results-mode');
    document.getElementById('theme-switch').classList.add('results-mode');


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
    if (refreshTimer) clearInterval(refreshTimer);
    closeFocusBtn();
    document.getElementById('results').style.display = 'none';
    document.getElementById('landing').style.display = 'flex';
    document.getElementById('lang-switch').classList.remove('results-mode');
    document.getElementById('theme-switch').classList.remove('results-mode');

    topPlayCache = {};
}

// ══ HIDE LANG-SWITCH ON SCROLL ══
let lastScrollY = window.scrollY;
window.addEventListener('scroll', () => {
    const langSwitch = document.querySelector('.lang-switch');
    const themeSwitch = document.querySelector('.theme-switch');
    if (window.scrollY > lastScrollY && window.scrollY > 80) {
        langSwitch.classList.add('hidden');
        themeSwitch.classList.add('hidden');
    } else {
        langSwitch.classList.remove('hidden');
        themeSwitch.classList.remove('hidden');
    }
    lastScrollY = window.scrollY;
});

// Init
applyLang();
