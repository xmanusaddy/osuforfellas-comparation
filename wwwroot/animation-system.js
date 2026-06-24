const GSAP_CDN_URL = 'https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js';
const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const isShareMode = new URLSearchParams(window.location.search).has('share');

let duelTimeline = null;
let duelNameGlitchTimeline = null;
let duelNameGlitchTimer = null;
let focusTimeline = null;
let roomTimeline = null;
let roomContentTimeline = null;

function canAnimate() {
    return Boolean(window.gsap) && !reducedMotionQuery.matches && !isShareMode;
}

function killTimeline(timeline) {
    if (timeline) timeline.kill();
}

function clearAnimationProps(elements) {
    if (!window.gsap || !elements.length) return;
    window.gsap.set(elements, {
        clearProps: 'opacity,visibility,transform,transformOrigin,clipPath,filter'
    });
}

function getElements(root, selectors) {
    return selectors
        .flatMap(selector => [...root.querySelectorAll(selector)])
        .filter(Boolean);
}

function stopDuelNameGlitches() {
    if (duelNameGlitchTimer) {
        clearTimeout(duelNameGlitchTimer);
        duelNameGlitchTimer = null;
    }
    killTimeline(duelNameGlitchTimeline);
    duelNameGlitchTimeline = null;
    clearDuelTextGlitches();
}

function getDuelTextTargets(root, namesOnly = false) {
    if (!root) return [];
    const selector = namesOnly
        ? '.compare-duel-player-name'
        : '.compare-duel-player-name, .compare-duel-glitch-text';
    return [...root.querySelectorAll(selector)];
}

function clearDuelTextGlitches(root = document) {
    getDuelTextTargets(root).forEach(element => {
        element.classList.remove('is-glitching', 'is-heavy-glitching');
    });
    const rootClassTarget = root.matches?.('.compare-duel') ? root : root.querySelector?.('.compare-duel');
    rootClassTarget?.classList.remove('is-glitching', 'is-impacting');
}

function addDuelNameGlitch(timeline, root, position, intensity = 1, namesOnly = false) {
    const targets = getDuelTextTargets(root, namesOnly);
    if (!targets.length) return [];

    const rootClassTarget = root.matches?.('.compare-duel') ? root : root.querySelector?.('.compare-duel');
    const isHeavy = intensity >= 0.9;
    const className = isHeavy ? 'is-heavy-glitching' : 'is-glitching';
    const duration = isHeavy ? 0.58 : 0.42;

    timeline
        .add(() => {
            rootClassTarget?.classList.add('is-glitching');
            targets.forEach(element => {
                element.classList.add('is-glitching', className);
            });
        }, position)
        .to(targets,
            {
                keyframes: [
                    { x: -6 * intensity, y: 1 * intensity, skewX: -2.2 * intensity, duration: 0.035 },
                    { x: 7 * intensity, y: -1 * intensity, skewX: 1.6 * intensity, duration: 0.04 },
                    { x: -3 * intensity, y: 0, skewX: -0.8 * intensity, duration: 0.035 },
                    { x: 2 * intensity, skewX: 0.45 * intensity, duration: 0.03 },
                    { x: 0, y: 0, skewX: 0, duration: 0.06 }
                ],
                ease: 'steps(1)'
            },
            position + 0.015)
        .add(() => {
            rootClassTarget?.classList.remove('is-glitching');
            targets.forEach(element => {
                element.classList.remove('is-glitching', 'is-heavy-glitching');
            });
        }, position + duration);

    return targets;
}

function addDuelImpact(timeline, root, position, duration = 1.95) {
    if (!root) return;

    timeline
        .add(() => root.classList.add('is-impacting'), position)
        .add(() => root.classList.remove('is-impacting'), position + duration);
}

function addDuelGlitchPulse(timeline, layer, bars, position, intensity = 0.65) {
    if (!layer || !bars.length) return;
    const selectedBars = bars.filter((_, index) => index % 2 === (intensity > 0.7 ? 0 : 1));
    const pulseBars = selectedBars.length ? selectedBars : bars;

    timeline
        .set(layer, { autoAlpha: 1 }, position)
        .fromTo(pulseBars,
            {
                autoAlpha: 0,
                xPercent: index => index % 2 === 0 ? -14 : 14,
                scaleX: 0.24,
                immediateRender: false
            },
            {
                autoAlpha: intensity,
                xPercent: 0,
                scaleX: 1,
                duration: 0.06,
                stagger: 0.012,
                ease: 'steps(2)'
            },
            position)
        .to(pulseBars,
            {
                autoAlpha: 0,
                xPercent: index => index % 2 === 0 ? 9 : -9,
                duration: 0.075,
                stagger: 0.01,
                ease: 'steps(2)'
            },
            position + 0.075)
        .set(layer, { autoAlpha: 0 }, position + 0.18);
}

function scheduleDuelNameGlitch(root, delay = null) {
    stopDuelNameGlitches();
    if (!canAnimate() || !root?.classList.contains('is-open')) return;

    const wait = delay ?? (3500 + Math.random() * 4200);
    duelNameGlitchTimer = setTimeout(() => {
        duelNameGlitchTimer = null;
        if (!canAnimate() || !root.isConnected || !root.classList.contains('is-open')) return;

        const animated = [];
        duelNameGlitchTimeline = window.gsap.timeline({
            onComplete: () => {
                clearAnimationProps(animated);
                duelNameGlitchTimeline = null;
                scheduleDuelNameGlitch(root);
            }
        });
        animated.push(...addDuelNameGlitch(duelNameGlitchTimeline, root, 0, 0.95, true));
    }, wait);
}

const AppAnimations = {
    get available() {
        return canAnimate();
    },

    enterDuel(root) {
        if (!canAnimate() || !root) return false;

        const gsap = window.gsap;
        const shell = root.querySelector('.compare-duel-shell');
        const header = root.querySelector('.compare-duel-header');
        const leftPlayer = root.querySelector('.compare-duel-player--left');
        const center = root.querySelector('.compare-duel-center');
        const rightPlayer = root.querySelector('.compare-duel-player--right');
        const verdict = root.querySelector('.compare-duel-verdict');
        const roundsTitle = root.querySelector('.compare-duel-rounds-title');
        const scoreboard = root.querySelector('.compare-duel-scoreboard');
        const duelTitle = root.querySelector('.compare-duel-header h2');
        const glitchLayer = root.querySelector('.compare-duel-glitch');
        const glitchBars = [...root.querySelectorAll('.compare-duel-glitch-bar')];
        const duelTextTargets = getDuelTextTargets(root);
        const rounds = [...root.querySelectorAll('.compare-duel-metric')];
        const fills = [...root.querySelectorAll('.compare-duel-fill')];
        const impactValues = getElements(root, [
            '.compare-duel-score-pill',
            '.compare-duel-player-pp',
            '.compare-duel-center strong'
        ]);
        const animated = [shell, header, leftPlayer, center, rightPlayer, verdict, roundsTitle, scoreboard, duelTitle, glitchLayer, ...glitchBars, ...duelTextTargets, ...rounds, ...fills, ...impactValues]
            .filter(Boolean);

        stopDuelNameGlitches();
        killTimeline(duelTimeline);
        gsap.killTweensOf(animated);

        duelTimeline = gsap.timeline({
            defaults: { ease: 'power3.out' },
            onComplete: () => {
                root.classList.remove('is-impacting');
                clearAnimationProps(animated);
                scheduleDuelNameGlitch(root);
            }
        });

        duelTimeline
            .add(() => clearDuelTextGlitches(root), 0)
            .add(() => root.classList.add('is-impacting'), 0.04)
            .fromTo(shell,
                {
                    autoAlpha: 0,
                    y: 20,
                    scale: 0.982,
                    clipPath: 'inset(48% 0 48% 0)'
                },
                {
                    autoAlpha: 1,
                    y: 0,
                    scale: 1,
                    clipPath: 'inset(0% 0 0% 0)',
                    duration: 0.5,
                    ease: 'expo.out'
                })
            .fromTo(glitchLayer,
                { autoAlpha: 0 },
                { autoAlpha: 1, duration: 0.025, ease: 'steps(1)' },
                0.03)
            .fromTo(glitchBars,
                {
                    autoAlpha: 0,
                    xPercent: index => index % 2 === 0 ? -32 : 32,
                    scaleX: 0.08
                },
                {
                    autoAlpha: 1,
                    xPercent: 0,
                    scaleX: 1,
                    duration: 0.105,
                    stagger: 0.014,
                    ease: 'steps(2)'
                },
                0.055)
            .to(glitchBars,
                {
                    autoAlpha: 0,
                    xPercent: index => index % 2 === 0 ? 22 : -22,
                    scaleX: 0.25,
                    duration: 0.105,
                    stagger: 0.011,
                    ease: 'steps(2)'
                },
                0.18)
            .to(scoreboard,
                {
                    keyframes: [
                        { x: -14, skewX: -1.2, filter: 'brightness(1.9)', duration: 0.035 },
                        { x: 12, skewX: 0.9, filter: 'brightness(1.35)', duration: 0.04 },
                        { x: -5, skewX: -0.35, filter: 'brightness(1.6)', duration: 0.035 },
                        { x: 0, skewX: 0, filter: 'brightness(1)', duration: 0.075 }
                    ],
                    ease: 'steps(1)'
                },
                0.08)
            .to(duelTitle,
                {
                    keyframes: [
                        { x: 9, skewX: 2, duration: 0.035 },
                        { x: -7, skewX: -1.4, duration: 0.035 },
                        { x: 3, skewX: 0.4, duration: 0.03 },
                        { x: 0, skewX: 0, duration: 0.06 }
                    ],
                    ease: 'steps(1)'
                },
                0.17)
            .set(glitchLayer, { autoAlpha: 0 }, 0.42)
            .from(header,
                { autoAlpha: 0, y: -18, duration: 0.3 },
                0.22)
            .addLabel('players', 0.42)
            .from(leftPlayer,
                {
                    autoAlpha: 0,
                    x: -120,
                    scaleX: 0.965,
                    skewX: -3,
                    filter: 'brightness(1.35)',
                    transformOrigin: 'left center',
                    duration: 0.58,
                    ease: 'expo.out'
                },
                'players')
            .from(rightPlayer,
                {
                    autoAlpha: 0,
                    x: 120,
                    scaleX: 0.965,
                    skewX: 3,
                    filter: 'brightness(1.35)',
                    transformOrigin: 'right center',
                    duration: 0.58,
                    ease: 'expo.out'
                },
                'players')
            .from(center,
                {
                    autoAlpha: 0,
                    scaleX: 0.18,
                    scaleY: 1.12,
                    rotation: -2,
                    filter: 'brightness(2.2)',
                    duration: 0.5,
                    ease: 'back.out(2.6)'
                },
                'players+=0.12')
            .from(impactValues,
                { autoAlpha: 0, y: 12, scale: 0.78, stagger: 0.04, duration: 0.34, ease: 'back.out(2)' },
                'players+=0.26')
            .from(verdict,
                { autoAlpha: 0, x: -18, scaleX: 0.86, transformOrigin: 'left center', duration: 0.32 },
                'players+=0.54')
            .from(roundsTitle,
                { autoAlpha: 0, x: -18, duration: 0.24 },
                '-=0.1')
            .from(rounds,
                { autoAlpha: 0, y: 22, scale: 0.985, stagger: 0.06, duration: 0.36 },
                '-=0.06')
            .from(fills,
                { scaleX: 0, transformOrigin: 'left center', stagger: 0.025, duration: 0.34 },
                '-=0.28')
            .add(() => root.classList.remove('is-impacting'), 2.05);

        addDuelImpact(duelTimeline, root, 0.04, 2.02);
        addDuelNameGlitch(duelTimeline, root, 0.26, 1.25);
        addDuelGlitchPulse(duelTimeline, glitchLayer, glitchBars, 0.64, 0.8);
        addDuelNameGlitch(duelTimeline, root, 0.86, 1.05);
        addDuelGlitchPulse(duelTimeline, glitchLayer, glitchBars, 1.22, 0.92);
        addDuelNameGlitch(duelTimeline, root, 1.48, 0.88, true);
        addDuelGlitchPulse(duelTimeline, glitchLayer, glitchBars, 1.72, 0.62);

        return true;
    },

    exitDuel(root) {
        stopDuelNameGlitches();
        clearDuelTextGlitches(root);
        if (!canAnimate() || !root) return false;

        const gsap = window.gsap;
        const shell = root.querySelector('.compare-duel-shell');
        const rounds = [...root.querySelectorAll('.compare-duel-metric')];
        if (!shell) return false;

        killTimeline(duelTimeline);
        gsap.killTweensOf([shell, ...rounds]);

        duelTimeline = gsap.timeline({ defaults: { ease: 'power2.in' } })
            .to(rounds, {
                autoAlpha: 0,
                y: 8,
                stagger: { each: 0.018, from: 'end' },
                duration: 0.12
            })
            .to(shell, {
                autoAlpha: 0,
                y: 12,
                scale: 0.992,
                duration: 0.18
            }, '-=0.06');

        return true;
    },

    enterFocus(overlay) {
        if (!canAnimate() || !overlay) return false;

        const gsap = window.gsap;
        const modal = overlay.querySelector('.focus-modal');
        const header = overlay.querySelector('.focus-header');
        const avatar = overlay.querySelector('.focus-avatar-wrap');
        const identity = overlay.querySelector('.focus-identity');
        const ranks = overlay.querySelector('.focus-ranks');
        const topPlay = overlay.querySelector('.focus-topplay');
        const statsGrid = overlay.querySelector('.focus-stats-grid');
        const stats = [...overlay.querySelectorAll('.focus-stat-cell')];
        const animated = [overlay, modal, avatar, identity, ranks, topPlay, ...stats].filter(Boolean);
        const resetElements = [...animated, header, statsGrid].filter(Boolean);

        killTimeline(focusTimeline);
        gsap.killTweensOf(resetElements);
        clearAnimationProps(resetElements);

        focusTimeline = gsap.timeline({
            defaults: { ease: 'power3.out' },
            onComplete: () => clearAnimationProps(animated)
        });

        focusTimeline
            .fromTo(overlay,
                { autoAlpha: 0 },
                { autoAlpha: 1, duration: 0.2 })
            .fromTo(modal,
                { autoAlpha: 0, y: 28, scale: 0.96 },
                { autoAlpha: 1, y: 0, scale: 1, duration: 0.42 },
                0)
            .from(avatar,
                { autoAlpha: 0, x: -24, scale: 0.9, duration: 0.34 },
                '-=0.2')
            .from(identity,
                { autoAlpha: 0, y: 14, duration: 0.3 },
                '-=0.25')
            .from(ranks,
                { autoAlpha: 0, x: 24, duration: 0.32 },
                '<')
            .from(topPlay,
                { autoAlpha: 0, y: 18, duration: 0.34 },
                '-=0.18')
            .from(stats,
                { autoAlpha: 0, y: 12, stagger: 0.045, duration: 0.28 },
                '-=0.18');

        return true;
    },

    exitFocus(overlay, onComplete) {
        if (!canAnimate() || !overlay) return false;

        const gsap = window.gsap;
        const modal = overlay.querySelector('.focus-modal');
        const content = getElements(overlay, ['.focus-topplay', '.focus-header', '.focus-stats-grid']);
        if (!modal) return false;

        killTimeline(focusTimeline);
        gsap.killTweensOf([overlay, modal, ...content]);

        focusTimeline = gsap.timeline({
            defaults: { ease: 'power2.in' },
            onComplete: () => {
                onComplete?.();
                clearAnimationProps([overlay, modal, ...content]);
            }
        })
            .to(content, {
                autoAlpha: 0,
                y: 8,
                stagger: { each: 0.025, from: 'end' },
                duration: 0.12
            })
            .to(modal, {
                autoAlpha: 0,
                y: 14,
                scale: 0.985,
                duration: 0.18
            }, '-=0.06')
            .to(overlay, {
                autoAlpha: 0,
                duration: 0.14
            }, '-=0.08');

        return true;
    },

    enterRoom(root) {
        if (!canAnimate() || !root) return false;

        const gsap = window.gsap;
        const header = root.querySelector('.room-header');
        const logo = root.querySelector('.room-logo');
        const back = root.querySelector('.room-back');
        const panel = root.querySelector('.room-panel');
        const title = root.querySelector('.room-title');
        const copy = root.querySelector('.room-copy');
        const animated = [header, logo, back, panel, title, copy].filter(Boolean);

        killTimeline(roomTimeline);
        gsap.killTweensOf(animated);
        clearAnimationProps(animated);

        roomTimeline = gsap.timeline({
            defaults: { ease: 'power3.out' },
            onComplete: () => clearAnimationProps(animated)
        });

        roomTimeline
            .fromTo(panel,
                { autoAlpha: 0, y: 28, scale: 0.985 },
                { autoAlpha: 1, y: 0, scale: 1, duration: 0.42 })
            .from(logo,
                { autoAlpha: 0, x: -20, duration: 0.28 },
                0.04)
            .from(back,
                { autoAlpha: 0, x: 18, duration: 0.28 },
                0.08)
            .from(title,
                { autoAlpha: 0, y: 18, duration: 0.34 },
                0.16)
            .from(copy,
                { autoAlpha: 0, y: 12, duration: 0.3 },
                0.23);

        return true;
    },

    enterRoomContent(root, roomName) {
        if (!canAnimate() || !root) return false;

        const gsap = window.gsap;
        const state = root.querySelector('.player-profile-state, .top-plays-state, .friends-room-state, .history-room-state');
        const hasRoomContent = Boolean(root.querySelector('.player-profile-room, .top-plays-room, .friends-room, .history-room'));
        const animated = [];
        const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
        const add = elements => {
            const clean = (Array.isArray(elements) ? elements : [elements]).filter(Boolean);
            gsap.killTweensOf(clean);
            clearAnimationProps(clean);
            animated.push(...clean);
            return clean;
        };

        killTimeline(roomContentTimeline);

        if (state && !hasRoomContent) {
            add(state);
            timeline.from(state, { autoAlpha: 0, y: 14, duration: 0.3 });
        } else if (roomName === 'player') {
            const hero = add(root.querySelector('.player-profile-hero'))[0];
            const avatar = add(root.querySelector('.player-profile-avatar-wrap'))[0];
            const identity = add(root.querySelector('.player-profile-identity'))[0];
            const ranks = add(root.querySelector('.player-profile-ranks'))[0];
            const rankline = add(root.querySelector('.player-profile-rankline'))[0];
            const stats = add([...root.querySelectorAll('.player-profile-stat')]);
            const topPlay = add(root.querySelector('.player-profile-topplay'))[0];
            const actions = add([...root.querySelectorAll('.player-profile-actions .room-action-link')]);

            if (hero) timeline.from(hero, { autoAlpha: 0, y: 20, duration: 0.38 });
            if (avatar) timeline.from(avatar, { autoAlpha: 0, x: -26, scale: 0.92, duration: 0.34 }, '-=0.22');
            if (identity) timeline.from(identity, { autoAlpha: 0, y: 14, duration: 0.3 }, '-=0.24');
            if (ranks) timeline.from(ranks, { autoAlpha: 0, x: 24, duration: 0.32 }, '<');
            if (rankline) timeline.from(rankline, { autoAlpha: 0, scaleX: 0.94, transformOrigin: 'left center', duration: 0.28 }, '-=0.12');
            if (stats.length) timeline.from(stats, { autoAlpha: 0, y: 12, stagger: 0.045, duration: 0.28 }, '-=0.12');
            if (topPlay) timeline.from(topPlay, { autoAlpha: 0, y: 18, duration: 0.34 }, '-=0.14');
            if (actions.length) timeline.from(actions, { autoAlpha: 0, y: 10, stagger: 0.05, duration: 0.24 }, '-=0.14');
        } else if (roomName === 'top-plays' || roomName === 'recent') {
            const player = add(root.querySelector('.top-plays-player'))[0];
            const avatar = add(root.querySelector('.top-plays-avatar'))[0];
            const playerInfo = add(root.querySelector('.top-plays-player-info'))[0];
            const playerActions = add(root.querySelector('.top-plays-player-actions'))[0];
            const summary = add([...root.querySelectorAll('.top-plays-stat')]);
            const rows = add([...root.querySelectorAll('.top-play-row')].slice(0, 12));
            const emptyState = rows.length ? null : add(state)[0];

            if (player) timeline.from(player, { autoAlpha: 0, y: 18, duration: 0.34 });
            if (avatar) timeline.from(avatar, { autoAlpha: 0, x: -18, scale: 0.9, duration: 0.28 }, '-=0.2');
            if (playerInfo) timeline.from(playerInfo, { autoAlpha: 0, x: -12, duration: 0.26 }, '<');
            if (playerActions) timeline.from(playerActions, { autoAlpha: 0, x: 16, duration: 0.26 }, '<');
            if (summary.length) timeline.from(summary, { autoAlpha: 0, y: 12, stagger: 0.045, duration: 0.28 }, '-=0.12');
            if (rows.length) timeline.from(rows, { autoAlpha: 0, y: 18, stagger: { amount: 0.38 }, duration: 0.34 }, '-=0.1');
            if (emptyState) timeline.from(emptyState, { autoAlpha: 0, y: 12, duration: 0.28 }, '-=0.1');
        } else if (roomName === 'friends') {
            const summary = add([...root.querySelectorAll('.friends-room-stat')]);
            const toolbar = add(root.querySelector('.friends-room-toolbar'))[0];
            const selected = add(root.querySelector('.friends-selected-row'))[0];
            const cards = add([...root.querySelectorAll('.friends-room-grid .friend-card')]);
            const emptyState = cards.length ? null : add(state)[0];

            if (summary.length) timeline.from(summary, { autoAlpha: 0, y: 14, stagger: 0.055, duration: 0.3 });
            if (toolbar) timeline.from(toolbar, { autoAlpha: 0, x: -16, duration: 0.28 }, '-=0.12');
            if (selected) timeline.from(selected, { autoAlpha: 0, scaleX: 0.96, transformOrigin: 'left center', duration: 0.28 }, '-=0.12');
            if (cards.length) timeline.from(cards, { autoAlpha: 0, y: 10, stagger: { amount: 0.28 }, duration: 0.26 }, '-=0.18');
            if (emptyState) timeline.from(emptyState, { autoAlpha: 0, y: 12, duration: 0.28 }, '-=0.1');
        } else if (roomName === 'history') {
            const summary = add([...root.querySelectorAll('.history-room-stat')]);
            const toolbar = add(root.querySelector('.history-room-toolbar'))[0];
            const players = add(root.querySelector('.history-players-row'))[0];
            const cards = add([...root.querySelectorAll('.history-room-grid .history-card')]);
            const emptyState = cards.length ? null : add(state)[0];

            if (summary.length) timeline.from(summary, { autoAlpha: 0, y: 14, stagger: 0.055, duration: 0.3 });
            if (toolbar) timeline.from(toolbar, { autoAlpha: 0, x: -16, duration: 0.28 }, '-=0.12');
            if (players) timeline.from(players, { autoAlpha: 0, scaleX: 0.96, transformOrigin: 'left center', duration: 0.28 }, '-=0.12');
            if (cards.length) timeline.from(cards, { autoAlpha: 0, y: 10, stagger: { amount: 0.24 }, duration: 0.26 }, '-=0.18');
            if (emptyState) timeline.from(emptyState, { autoAlpha: 0, y: 12, duration: 0.28 }, '-=0.1');
        }

        if (!animated.length || timeline.duration() === 0) {
            timeline.kill();
            return false;
        }

        timeline.eventCallback('onComplete', () => clearAnimationProps(animated));
        roomContentTimeline = timeline;
        return true;
    }
};

window.AppAnimations = AppAnimations;

function markFallback() {
    document.documentElement.classList.add('gsap-fallback');
}

function loadGsap() {
    if (isShareMode || reducedMotionQuery.matches) {
        markFallback();
        return;
    }

    if (window.gsap) {
        document.documentElement.classList.add('gsap-ready');
        return;
    }

    const script = document.createElement('script');
    script.src = GSAP_CDN_URL;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.onload = () => {
        if (window.gsap) document.documentElement.classList.add('gsap-ready');
        else markFallback();
    };
    script.onerror = markFallback;
    document.head.appendChild(script);
}

loadGsap();
