(() => {
    const params = new URLSearchParams(window.location.search);
    const isShareMode = params.has('share');
    const isPublicRuntime = document.documentElement.classList.contains('public-runtime');
    const soundsDisabled = isShareMode || isPublicRuntime;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    const MUTED_KEY = 'osu_ui_sounds_muted';
    const VOLUME_KEY = 'osu_ui_sounds_volume';
    const DEFAULT_VOLUME = 0.28;
    const VALID_TYPES = new Set([
        'click',
        'back',
        'success',
        'error',
        'duel',
        'profile',
        'comparison-1',
        'comparison-2',
        'comparison-3',
        'comparison-4'
    ]);

    let context = null;
    let masterGain = null;
    let muted = localStorage.getItem(MUTED_KEY) === 'true';
    let volume = Number(localStorage.getItem(VOLUME_KEY));
    let labels = { enable: 'Enable sounds', disable: 'Mute sounds', volume: 'Sound volume' };
    let manifest = { sounds: {} };
    let preloadStarted = false;

    const buffers = new Map();
    const loadingBuffers = new Map();
    const unavailableBuffers = new Set();

    if (!Number.isFinite(volume)) volume = DEFAULT_VOLUME;
    volume = Math.min(1, Math.max(0, volume));

    const manifestReady = soundsDisabled
        ? Promise.resolve(manifest)
        : fetch('/sounds/ui/manifest.json', { cache: 'no-cache' })
            .then(response => response.ok ? response.json() : manifest)
            .then(data => {
                manifest = data && typeof data === 'object' ? data : manifest;
                const configuredVolume = Number(manifest.volume);
                if (localStorage.getItem(VOLUME_KEY) == null && Number.isFinite(configuredVolume)) {
                    volume = Math.min(1, Math.max(0, configuredVolume));
                }
                syncMasterGain();
                syncControls();
                return manifest;
            })
            .catch(() => manifest);

    function ensureContext() {
        if (soundsDisabled || !AudioContextClass) return null;
        if (!context) {
            context = new AudioContextClass();
            masterGain = context.createGain();
            masterGain.connect(context.destination);
            syncMasterGain();
        }
        return context;
    }

    function syncMasterGain() {
        if (!context || !masterGain) return;
        masterGain.gain.setValueAtTime(muted ? 0 : volume, context.currentTime);
    }

    function normalizeAssetUrl(path) {
        if (!path || typeof path !== 'string') return '';
        try {
            const url = new URL(path, window.location.origin);
            return url.origin === window.location.origin ? url.href : '';
        } catch {
            return '';
        }
    }

    async function loadBuffer(type) {
        if (!VALID_TYPES.has(type) || buffers.has(type) || unavailableBuffers.has(type)) {
            return buffers.get(type) || null;
        }
        if (loadingBuffers.has(type)) return loadingBuffers.get(type);

        const promise = (async () => {
            await manifestReady;
            const audio = ensureContext();
            const assetUrl = normalizeAssetUrl(manifest.sounds?.[type]);
            if (!audio || !assetUrl) {
                unavailableBuffers.add(type);
                return null;
            }

            try {
                const response = await fetch(assetUrl, { cache: 'force-cache' });
                if (!response.ok) throw new Error(`sound_${response.status}`);
                const buffer = await audio.decodeAudioData(await response.arrayBuffer());
                buffers.set(type, buffer);
                return buffer;
            } catch {
                unavailableBuffers.add(type);
                return null;
            } finally {
                loadingBuffers.delete(type);
            }
        })();

        loadingBuffers.set(type, promise);
        return promise;
    }

    function preloadCustomSounds() {
        if (preloadStarted || isShareMode) return;
        preloadStarted = true;
        manifestReady.then(() => {
            VALID_TYPES.forEach(type => {
                if (normalizeAssetUrl(manifest.sounds?.[type])) loadBuffer(type);
            });
        });
    }

    function playBuffer(buffer) {
        if (!context || !masterGain || !buffer) return;
        const source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(masterGain);
        source.start();
    }

    function tone(startFrequency, endFrequency, offset, duration, wave = 'triangle', gainValue = 0.08) {
        if (!context || !masterGain) return;

        const start = context.currentTime + offset;
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = wave;
        oscillator.frequency.setValueAtTime(startFrequency, start);
        oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, endFrequency), start + duration);
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        oscillator.connect(gain);
        gain.connect(masterGain);
        oscillator.start(start);
        oscillator.stop(start + duration + 0.01);
    }

    function playFallback(type) {
        if (!context) return;

        if (type === 'duel') {
            tone(95, 62, 0, 0.13, 'sawtooth', 0.065);
            tone(1450, 430, 0.012, 0.07, 'square', 0.035);
            tone(720, 1180, 0.065, 0.085, 'square', 0.038);
            tone(980, 410, 0.68, 0.075, 'square', 0.028);
            tone(560, 1320, 1.31, 0.085, 'sawtooth', 0.026);
            tone(1240, 320, 1.82, 0.11, 'square', 0.024);
            return;
        }
        if (type === 'profile') {
            tone(260, 430, 0, 0.12, 'triangle', 0.055);
            tone(430, 690, 0.09, 0.18, 'sine', 0.06);
            return;
        }
        const comparisonMatch = /^comparison-([1-4])$/.exec(type);
        if (comparisonMatch) {
            const playerCount = Number(comparisonMatch[1]);
            const frequencies = [260, 390, 560, 780];
            frequencies.slice(0, playerCount).forEach((frequency, index) => {
                tone(frequency, frequency * 1.28, index * 0.085, 0.15, index % 2 ? 'sine' : 'triangle', 0.052);
            });
            return;
        }
        if (type === 'back') {
            tone(540, 260, 0, 0.11, 'triangle', 0.055);
            return;
        }
        if (type === 'success') {
            tone(400, 540, 0, 0.09, 'sine', 0.06);
            tone(540, 760, 0.075, 0.12, 'sine', 0.065);
            return;
        }
        if (type === 'error') {
            tone(210, 125, 0, 0.14, 'sawtooth', 0.045);
            return;
        }
        tone(650, 420, 0, 0.045, 'triangle', 0.055);
    }

    function play(type = 'click') {
        if (soundsDisabled || muted || !VALID_TYPES.has(type)) return false;
        const audio = ensureContext();
        if (!audio) return false;
        preloadCustomSounds();

        const trigger = () => {
            const buffer = buffers.get(type);
            if (buffer) playBuffer(buffer);
            else {
                playFallback(type);
                loadBuffer(type);
            }
        };

        if (audio.state === 'suspended') {
            audio.resume().then(trigger).catch(() => {});
        } else {
            trigger();
        }
        return true;
    }

    function syncControls() {
        document.querySelectorAll('[data-ui-sound-toggle]').forEach(button => {
            const label = muted ? labels.enable : labels.disable;
            button.setAttribute('aria-pressed', String(muted));
            button.setAttribute('aria-label', label);
            button.setAttribute('title', label);
            const icon = button.querySelector('.sound-toggle-icon');
            if (icon) icon.textContent = muted || volume === 0 ? '🔇' : (volume < 0.45 ? '🔉' : '🔊');
        });

        document.querySelectorAll('[data-ui-sound-volume]').forEach(slider => {
            slider.value = String(volume);
            slider.setAttribute('aria-label', labels.volume);
            slider.setAttribute('title', `${labels.volume}: ${Math.round(volume * 100)}%`);
            slider.style.setProperty('--sound-volume-pct', `${Math.round(volume * 100)}%`);
        });
    }

    function setMuted(nextMuted) {
        muted = Boolean(nextMuted);
        localStorage.setItem(MUTED_KEY, String(muted));
        syncMasterGain();
        syncControls();
    }

    function toggleMuted() {
        const wasMuted = muted;
        setMuted(!muted);
        if (wasMuted) play('click');
        return muted;
    }

    function setVolume(nextVolume) {
        const parsed = Number(nextVolume);
        if (!Number.isFinite(parsed)) return volume;
        volume = Math.min(1, Math.max(0, parsed));
        localStorage.setItem(VOLUME_KEY, String(volume));
        syncMasterGain();
        syncControls();
        return volume;
    }

    function classifyInteraction(element) {
        const explicit = element.dataset.uiSound;
        if (explicit === 'none') return '';
        if (VALID_TYPES.has(explicit)) return explicit;

        if (element.matches('.compare-duel-toggle')) {
            return element.classList.contains('active') ? 'back' : 'duel';
        }
        if (element.matches('.settings-toggle') && element.getAttribute('aria-expanded') === 'true') {
            return 'back';
        }
        if (element.matches('.focus-close, .settings-close, .compare-duel-close, .btn-back, .room-back, .top-plays-profile-link')) {
            return 'back';
        }
        return 'click';
    }

    const interactiveSelector = 'button, a[href], select, [role="button"], .player-card';
    document.addEventListener('click', event => {
        if (soundsDisabled) return;
        const element = event.target.closest?.(interactiveSelector);
        if (!element || element.matches(':disabled') || element.getAttribute('aria-disabled') === 'true') return;

        if (element.matches('[data-ui-sound-toggle]')) {
            toggleMuted();
            return;
        }

        const type = classifyInteraction(element);
        if (type) play(type);
    }, true);

    document.addEventListener('keydown', event => {
        if (soundsDisabled || !['Enter', ' '].includes(event.key)) return;
        const element = event.target.closest?.('[role="button"]:not(button):not(a)');
        if (!element) return;
        const type = classifyInteraction(element);
        if (type) play(type);
    }, true);

    document.addEventListener('input', event => {
        if (!event.target.matches?.('[data-ui-sound-volume]')) return;
        setVolume(event.target.value);
    });

    const UISounds = {
        play,
        setMuted,
        toggleMuted,
        setVolume,
        syncButtons: syncControls,
        syncControls,
        setLabels(nextLabels = {}) {
            labels = { ...labels, ...nextLabels };
            syncControls();
        },
        get muted() {
            return muted;
        },
        get volume() {
            return volume;
        }
    };

    window.UISounds = UISounds;
    window.toggleUiSounds = toggleMuted;
    syncControls();
})();
