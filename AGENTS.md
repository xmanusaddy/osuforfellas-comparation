# AGENTS.md

## Fuente De Verdad

Ultima sincronizacion: 2026-06-24.

Este archivo describe el estado real del proyecto segun el codigo del workspace actual. No asumir features desde chats viejos: antes de tocar una feature, verificar en codigo.

Proyecto: `osu! For Fellas Comparison`.

Aplicacion ASP.NET Core + frontend estatico para comparar perfiles de jugadores de osu! con una UI cyberpunk/moderna, rooms internas, OAuth con osu!, bot de Discord por Interactions HTTP, capturas visuales con Chromium, animaciones GSAP y sonidos UI.

La filosofia sigue siendo: comparacion rapida, visual y con personalidad para amigos/fellas. No intenta reemplazar la pagina oficial de osu!.

---

## Estructura Actual

### Raiz

* `Program.cs`
  * Configura servicios ASP.NET Core.
  * Registra `OsuApiService`, servicios de Discord, session/cookie y controllers.
  * Sirve archivos estaticos/default files.
  * Agrega headers de seguridad: `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`.
  * Mapea `/terms` y `/privacy` a paginas HTML estaticas.
  * Usa `PORT` si existe; si no, levanta `http://0.0.0.0:8080`.

* `osuforfellascomparison.csproj`
  * Target: `.NET 8`.
  * `UserSecretsId`: `osuforfellascomparison-local-oauth`.
  * Paquetes: `BouncyCastle.Cryptography`, `Microsoft.AspNetCore.OpenApi`.

* `appsettings.json`
  * Contiene placeholders vacios para osu!, Discord, URL publica y Chromium.
  * No debe contener secrets reales.

* `appsettings.Development.json`
  * Solo logging. No contiene secrets.

* `Dockerfile`
  * Publica la app .NET.
  * Instala Chromium, fonts y emoji fonts en runtime.
  * Define `CHROMIUM_PATH=/usr/bin/chromium`.

* `Properties/launchSettings.json`
  * Perfil local de Visual Studio usa `http://localhost:5188` y `https://localhost:7044`.
  * Ojo: esto no es lo mismo que el fallback de `Program.cs` en `8080`.

* `README.md`
  * Documento publico del proyecto, con changelog hasta Discord/Recent/Choke.

* `osuforfellascomparison.http`
  * Archivo helper de Visual Studio. Actualmente apunta a `/weatherforecast/`, que no representa los endpoints reales.

* `.github`
  * Existe, pero no contiene archivos relevantes en el workspace actual.

* `.agents`
  * Existe, pero no contiene archivos relevantes en el workspace actual.

* `Backup/osuforfellascomparison.slnx`
  * Copia de solucion. No forma parte del flujo activo.

* `bin`, `obj`, `.vs`, `UpgradeLog.htm`
  * Generados/locales. No usarlos como fuente de verdad.

### Backend

* `Features/Osu/OsuController.cs`
  * Endpoint base: `/api/osu`.
  * `GET /api/osu/{mode}/{username}`.
  * `GET /api/osu/{mode}/{username}/best?limit=...`.
  * `GET /api/osu/{mode}/{username}/recent?limit=...`.
  * Modos validos: `osu`, `taiko`, `fruits`, `mania`.
  * Username maximo: 100 caracteres.

* `Features/Osu/OsuApiService.cs`
  * Usa OAuth client credentials con scope `public`.
  * Cachea token publico con lock.
  * Resuelve usuario antes de pedir scores.
  * Best plays: `/api/v2/users/{id}/scores/best`, `include_fails=0`, limit clamp 1..20.
  * Recent plays con limit: clamp 1..20, `include_fails=1`.
  * Recent plays sin limit: pagina de 20 en 20 hasta 50 paginas o hasta que osu! devuelva menos de 20.
  * Scores usan header `x-api-version: 20220705` para recibir score object moderno y `legacy_score_id`.

* `Controllers/AuthController.cs`
  * Maneja OAuth Authorization Code Flow con osu!.
  * Rutas:
    * `GET /auth/osu/login`
    * `GET /auth/osu/callback`
    * `POST /auth/logout`
    * `GET /auth/logout`
    * `GET /api/me`
    * `GET /api/me/friends`
  * Scopes: `identify public friends.read`.
  * Usa `state` en session y comparacion fixed-time.
  * Guarda access token, refresh token, expiry y user JSON en session backend.
  * Refresca access token si expira.
  * `/api/me` no expone tokens al frontend.
  * `/api/me/friends` requiere sesion y llama `https://osu.ppy.sh/api/v2/friends`.

* `Features/Discord/DiscordController.cs`
  * Endpoint health: `GET /discord/health`.
  * Endpoint Interactions: `POST /discord/interactions`.
  * Verifica firmas Ed25519 antes de procesar.
  * Responde `PING` con `PONG`.
  * Comandos actuales:
    * `/osu-profile`
    * `/osu-compare`
  * Maneja componentes de Discord para refresh, select menu, cambio de vista y paginacion.

* `Features/Discord/DiscordCommandRegistrationService.cs`
  * Registra comandos globales al iniciar si existen `Discord:ApplicationId` y `Discord:BotToken`.
  * `/osu-profile`: `username`, `mode`.
  * `/osu-compare`: `player1`, `player2`, `player3`, `player4`, `mode`, `theme`, `language`.
  * Usa `integration_types` y `contexts`, asi que soporta instalacion en servidor/usuario segun configuracion de Discord.

* `Features/Discord/DiscordCompareImageService.cs`
  * Genera imagenes PNG para Discord usando share mode y Chromium.
  * Mantiene estado temporal en memoria por 6 horas.
  * Vista compare: imagen de comparacion visual.
  * Vistas room: `profile`, `top`, `recent`.
  * Top/Recent en Discord usan paginas de 4 items.
  * Componentes actuales:
    * Open visual compare / Open in website.
    * Refresh image.
    * Select menu por jugador: Profile, Top Plays, Recent Plays.
    * Botones Profile, Top Plays, Recent.
    * Prev, Next, Refresh para Top/Recent.
  * Intenta captura publica en produccion y fallback local cuando aplica.

* `Features/Discord/ChromiumScreenshotService.cs`
  * Controla Chromium headless via Chrome DevTools Protocol.
  * Solo permite capturar URLs loopback o dentro de `App:PublicBaseUrl`/URL publica configurada.
  * Espera `window.__osuShareReady === true`.
  * Captura PNG 1280x720.
  * Limpia proceso y perfil temporal.

* `Features/Discord/DiscordSignatureVerifier.cs`
  * Verifica `X-Signature-Ed25519` y `X-Signature-Timestamp`.
  * Tolerancia de timestamp: 5 minutos.
  * Usa `Discord:PublicKey`.

### Frontend

* `wwwroot/index.html`
  * HTML principal.
  * Contiene landing, resultados, room view, focus overlay, controles de idioma/theme/audio/auth.
  * Carga scripts en este orden: `sound-system.js`, `animation-system.js`, `theme-manager.js`, `script.js`.

* `wwwroot/script.js`
  * Logica principal del frontend.
  * Traducciones ES/EN/DE.
  * Rutas hash.
  * Comparacion manual.
  * Focus Mode.
  * Rooms.
  * OAuth UI.
  * Friends/History.
  * Top Plays/Recent Plays.
  * Choke Detector.
  * Style tags.
  * Share mode.
  * Integracion con `window.UISounds` y `window.AppAnimations`.

* `wwwroot/styles.css`
  * CSS principal.
  * Cyberpunk base, Heaven overrides, responsive, Focus Mode, rooms, Discord share layouts, Duel Mode, sonidos, tooltips, legal-adjacent UI.
  * Incluye `@media` para resoluciones/anchos bajos y `prefers-reduced-motion`.

* `wwwroot/theme-manager.js`
  * Registra themes actuales: `cyberpunk`, `heaven`.
  * Guarda theme en `localStorage` key `theme`.
  * Aplica `document.documentElement.dataset.theme`.

* `wwwroot/animation-system.js`
  * Carga GSAP desde CDN: `https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js`.
  * Expone `window.AppAnimations`.
  * Desactiva animaciones GSAP en share mode y con `prefers-reduced-motion`.
  * Animaciones actuales: Duel Mode, Focus Mode, shell/contents de rooms.
  * Agrega clases `gsap-ready` o `gsap-fallback`.

* `wwwroot/sound-system.js`
  * Sistema de sonidos UI.
  * Expone `window.UISounds`.
  * Carga `/sounds/ui/manifest.json`.
  * Guarda mute/volumen en `localStorage`.
  * Sonidos validos: `click`, `back`, `success`, `error`, `duel`, `profile`, `comparison-1`, `comparison-2`, `comparison-3`, `comparison-4`.
  * Desactiva sonidos en share mode.
  * Tiene fallback sintetico si falta un asset.

* `wwwroot/sounds/ui`
  * Assets `.wav` actuales:
    * `main-click.wav`
    * `back.wav`
    * `api-error.wav`
    * `duel-glitch.wav`
    * `full-profile.wav`
    * `comparison-1.wav`
    * `comparison-2.wav`
    * `comparison-3.wav`
    * `comparison-4.wav`
  * `manifest.json` deja `success` vacio, por lo que usa fallback sintetico.

* `wwwroot/terms.html`, `wwwroot/privacy.html`, `wwwroot/legal.css`
  * Paginas legales para Discord verification/links publicos.
  * Contenido en ES/EN/DE.
  * Servidas tambien por `/terms` y `/privacy`.

---

## Funcionalidades Implementadas

### Idiomas

* ES, EN y DE en `LANGS` dentro de `wwwroot/script.js`.
* Toda feature visible nueva debe agregar textos en los tres idiomas.
* Evitar textos visibles hardcodeados fuera de `LANGS`, salvo nombres oficiales de mods o textos de marca.

### Themes

* Themes activos: `cyberpunk`, `heaven`.
* Cyberpunk es la referencia visual principal.
* Heaven existe como theme funcional con overrides amplios, pero puede requerir optimizacion visual/rendimiento en el futuro.
* El theme se conserva en `localStorage`.
* Share mode acepta `theme`.

### Comparacion Manual

* Soporta 1 a 4 jugadores.
* Modos soportados: `osu`, `taiko`, `fruits`, `mania`.
* Inputs `p1` a `p4`.
* Resultados en `#/results`.
* Se ordena visualmente por PP.
* Multi-player muestra banner de lider.
* Auto-refresh de comparacion cada 60 segundos cuando no esta en share mode.
* Error global para usuarios invalidos o busquedas mixtas.
* Si el link trae `player`/`players`, `mode`, `theme` o `lang`, puede hidratar la comparacion desde URL.
* Al volver al landing desde un link con parametros, `cleanCompareUrlIfNeeded()` limpia query params normales.

### Resumen Comparativo

* `compare-summary` aparece con 2 o mas jugadores.
* Muestra:
  * Ventaja PP del lider contra el segundo.
  * Mejor precision.
  * Mayor play count.
  * Mejor Top Play.
* Si el jugador destacado es `manu is washed`, conserva `creator-name` solo en el nombre principal.

### Comparison Breakdown

* `compare-breakdown` aparece con 2 o mas jugadores.
* Actualmente compara:
  * PP total.
  * Accuracy.
  * Play count.
  * Play time.
  * Global rank.
  * Top Play.
* Muestra rankings por metrica, barras, delta contra lider y labels de gap: parejo, ventaja clara, gap grande.
* En Duel Mode se oculta para no duplicar ruido visual.

### Style Tags

* Tags por jugador en comparaciones multi-player.
* Tags actuales:
  * `ppLeader`
  * `accuracyDemon`
  * `grinder`
  * `topPlayCarry`
  * `underdog`
  * `balanced`
* Maximo 3 tags por jugador.
* Tienen tooltip flotante con explicacion ES/EN/DE.
* No se muestran en single player.

### Direct Duel / 1v1

* Disponible solo cuando hay exactamente 2 jugadores validos y no es share mode.
* Se activa con boton en resultados; no reemplaza por defecto la comparacion tradicional.
* Es overlay/focus propio, con cierre, Escape, botones de idioma/theme internos y animaciones/glitch.
* Usa fotos de ambos jugadores.
* Score por rounds calculado con metricas comparativas.
* Categorias:
  * General.
  * Pico de skill.
  * Consistencia.
  * Actividad general.
* Metricas del duelo:
  * PP total.
  * Accuracy.
  * Play count.
  * Play time.
  * Global rank.
  * Top Play.
  * Top 5 PP.
  * Total score.
  * Total hits.
  * Max combo.
  * Replays vistos por otros.
* Cada metrica tiene tolerancia de empate (`tieAbs`/`tieRatio`) para evitar puntos por diferencias pequenas.
* Incluye lectura por estilo y Top 5 plays por lado.

### Cards De Jugador

* Avatar, bandera, nombre, titulo, actividad, PP, barra PP, style tags, Top Play compacto, stats y ranks.
* Actividad usa `last_visit`:
  * Activo ahora si <= 15 min.
  * Minutos, horas, dias o meses para el resto.
* Click en la card abre Focus Mode.
* Boton de focus tambien abre Focus Mode.

### Top Play Compacto Y Full

* Top Play compacto en cards.
* Top Play full en single player, perfil extendido y Focus Mode.
* Muestra cover, mapa, artista, dificultad, estrellas, mods, PP, accuracy, combo, rank, misses, fecha y links.
* Replay download aparece si `replay` o `has_replay` es true y hay `score.id`.

### Focus Mode

* Modal/overlay central al seleccionar un jugador.
* Muestra avatar, bandera, titulo, actividad, PP, ranks, Peak Rank, tendencia 90 dias, Top Play y stats extendidos.
* Stats extendidos actuales:
  * Accuracy.
  * Play count.
  * Play time.
  * Total score.
  * Max combo.
  * Total hits.
  * Replays vistos por otros.
* Boton "Ver perfil completo" navega a `#/player/:username`.
* Cierra con Escape, boton o click fuera.
* Usa GSAP si esta disponible.

### Peak Rank Y 90 Day Rank Trend

* Peak Rank usa `user.rank_highest?.rank`.
* Trend usa `user.rank_history.data`.
* Diferencia positiva significa mejora de rank.
* Si la diferencia absoluta es menor a 50, se considera estable.
* Solo se muestra si la API trae datos suficientes.

### Stable/Lazer Indicator

* Se basa exclusivamente en `legacy_score_id`.
* `legacy_score_id != null` => osu!stable.
* `legacy_score_id == null` => osu!lazer.
* Backend usa `x-api-version: 20220705` para score objects modernos.
* Se muestra en Focus Mode y en listas Top/Recent, no como metrica global de usuario.

### Rooms

Rutas actuales:

* `#/compare`
* `#/results`
* `#/friends`
* `#/history`
* `#/player/:username`
* `#/top-plays/:username`
* `#/recent/:username`

Reglas:

* `roomBack()` vuelve contextual:
  * Desde profile con comparacion activa: `#/results`.
  * Desde Top Plays/Recent: perfil del jugador.
  * Sin comparacion activa: `#/compare`.
* Escape:
  * Cierra Duel Mode si esta activo.
  * Cierra Focus Mode si esta activo.
  * Desde profile con comparacion activa vuelve a results.
  * Desde Top/Recent vuelve a profile.

### Player Profile Room

* Ruta: `#/player/:username`.
* Carga usuario + top play.
* Cache: `playerProfileCache`.
* Muestra:
  * Hero con avatar/flag/nombre/titulo/actividad/PP/ranks.
  * Peak Rank y tendencia si existen.
  * Accuracy, play count, play time, total score, max combo, total hits, replays vistos.
  * Top Play full.
  * Acciones: Top Plays, Recent Plays, perfil en osu!.
* Sonido de carga: `profile`.

### Top Plays Room

* Ruta: `#/top-plays/:username`.
* `DEFAULT_TOP_PLAYS_LIMIT = 10`.
* `MAX_TOP_PLAYS_LIMIT = 20`.
* Backend clampa 1..20.
* Carga usuario + best scores.
* Cache: `topPlaysCache`.
* Muestra header, refresh, resumen, PP promedio, accuracy promedio, mod mas usado y lista.
* Lista incluye position, cover, map, artist, mods, choke chip, stars, diff, client, accuracy, rank, misses, date, PP, beatmap link y replay link si aplica.
* Auto-refresh de score rooms cada 90 segundos.
* Share room pagina Top Plays en bloques de 3-4 segun config de share.

### Recent Plays Room

* Ruta: `#/recent/:username`.
* Implementada de verdad.
* Frontend llama `fetchRecentPlays(username, mode)` sin limit por defecto.
* Backend pagina todos los scores recientes disponibles segun osu! API, con `include_fails=1`, hasta 50 paginas de 20.
* Cache: `recentPlaysCache`.
* Muestra header, refresh, resumen, ultima jugada, accuracy promedio, mod mas usado y lista igual a Top Plays.
* Si osu! no devuelve jugadas recientes, muestra empty state.
* Auto-refresh de score rooms cada 90 segundos.
* Share room pagina Recent en bloques de 3-4 segun config de share.

### Choke Detector

* Implementado en listas Top Plays y Recent Plays.
* Chips:
  * `1 miss choke`.
  * High acc choke.
  * Combo drop.
* Usa accuracy, misses, combo del score y max combo del beatmap.
* No muestra chip si no hay senal clara.
* Incluye tooltip con accuracy, misses y combo.

### Mod Tooltips

* Chips de mods usan `data-mod-name`.
* Tooltips CSS para nombres completos.
* Nombres de mods se mantienen en ingles por ser nombres oficiales de osu!.

### OAuth osu!

* Login con osu! funcionando via backend.
* Tokens nunca deben exponerse al frontend.
* `#auth-widget` muestra login o mini-card de usuario.
* Logout disponible por POST/GET.
* Sesion backend con cookie `.OsuForFellas.Session`.
* Cookie HttpOnly, SameSite Lax, Secure Always fuera de Development, 7 dias idle.
* User Secrets locales requeridos para `OsuApi:ClientId`, `OsuApi:ClientSecret`, `OsuApi:RedirectUri`.

### Friends

* Requiere login y scope `friends.read`.
* Endpoint: `/api/me/friends`.
* Friends panel compacto y Friends Room amplia.
* Busqueda por username/country.
* Filtro friends/favorites.
* Favoritos por usuario en `localStorage`: `osu_friend_favorites_<userId>`.
* Seleccion de hasta 4 amigos para comparacion reutilizando `doSearch()`.
* Si inputs vienen de friends, boton principal cambia a "compare friends" traducido.

### History

* History panel y History Room.
* Guarda comparaciones recientes y favoritas por usuario logueado o `guest`.
* Keys:
  * `osu_recent_comparisons_<userId|guest>`.
  * `osu_favorite_comparisons_<userId|guest>`.
* Limite de recientes: 20.
* Permite buscar, marcar favorito, rellenar comparacion, repetir comparacion y recuperar jugadores recientes.

### Discord Bot

* Bot vive dentro del mismo proyecto ASP.NET.
* Usa Interactions HTTP, no Gateway; puede verse offline aunque funcione.
* Health: `/discord/health`.
* Interactions: `/discord/interactions`.
* `/osu-profile`:
  * Embed con avatar, PP, global/country rank, accuracy, play count, top play resumida y links.
* `/osu-compare`:
  * Deferred response.
  * Genera PNG visual estilo pagina.
  * Acepta 2 a 4 jugadores.
  * Acepta mode, theme, language.
  * Botones y select menu permiten abrir Profile, Top Plays, Recent Plays como imagenes.
  * Top/Recent tienen Prev/Next/Refresh.
* Estados de componentes viven en memoria, asi que reiniciar la app puede invalidar botones viejos.
* No guardar token/public key/secrets en archivos versionados.

### Share Mode

* Compare:
  * `/?share=compare&mode=osu&theme=cyberpunk&lang=es&player=user1&player=user2`
* Room:
  * `/?share=room&room=player&mode=osu&theme=cyberpunk&lang=es&player=user`
  * `room=top-plays` y `room=recent` soportan `page` y `pageSize`.
* Share mode:
  * Agrega clases `share-mode`, `share-compare-mode` o `share-room-mode`.
  * Oculta controles no necesarios.
  * Desactiva sonidos y animaciones GSAP.
  * Marca `window.__osuShareReady = true` cuando termina.
* Discord depende de este modo para capturas; revisar share mode si se cambia layout importante.

### Legal Pages

* `/terms` y `/privacy` existen y apuntan a HTML estatico.
* Footer del sitio enlaza Terms/Privacy de forma discreta.
* Las paginas legales estan pensadas tambien para Discord Developer Portal.

### Animaciones

* CSS sigue manejando animaciones simples/transiciones/estados hover.
* GSAP se usa para:
  * Entrada/salida de Duel Mode.
  * Entrada/salida de Focus Mode.
  * Entrada de rooms y contenido cargado.
  * Glitch/impactos del Duel Mode.
* GSAP no debe usarse para cada hover pequeno.
* Respetar `prefers-reduced-motion`.
* Evitar animaciones que dejen estado inline roto al reabrir modales/rooms.

### Sonidos

* Sistema implementado con `sound-system.js`.
* Controles visibles: boton mute y slider volumen.
* `localStorage`:
  * `osu_ui_sounds_muted`.
  * `osu_ui_sounds_volume`.
* Eventos actuales:
  * Click general.
  * Back/cerrar/Escape.
  * Error.
  * Duel Mode.
  * Profile loaded.
  * Comparison loaded segun cantidad de jugadores.
  * Success fallback para Top/Recent.
* El sonido `success` personalizado no esta asignado en manifest; usa fallback sintetico.

### Perfiles Especiales

* `manu is washed` tiene tratamiento especial:
  * Nombre rojo (`creator-name`).
  * Tag/titulo `PAGE CREATOR`.
  * Avatar/frame con glow rojo.
  * Aplica en cards, auth widget, resumen comparativo, profile/focus y otros lugares donde se renderiza via helpers.

---

## Reglas De Desarrollo

### Seguridad

* Nunca commitear secrets reales.
* `appsettings.json` debe quedarse con placeholders vacios.
* `appsettings.Development.json` no debe contener secrets.
* Local: usar `.NET User Secrets`.
* Produccion/Render: usar environment variables con doble underscore:
  * `OsuApi__ClientId`
  * `OsuApi__ClientSecret`
  * `OsuApi__RedirectUri`
  * `Discord__ApplicationId`
  * `Discord__PublicKey`
  * `Discord__BotToken`
  * `App__PublicBaseUrl`
  * `Screenshot__ChromiumPath` si hace falta.
* No exponer `access_token` ni `refresh_token` al frontend.
* Mantener verificacion de firma Discord antes de procesar interactions.
* Screenshot service no debe capturar URLs arbitrarias fuera de loopback o base publica permitida.

### UI/UX

* Mantener identidad visual cyberpunk: oscuro, neon, glows, arcade, moderno.
* No convertir la UI en copia de osu! oficial.
* No simplificar de forma que pierda personalidad.
* Evitar cards dentro de cards salvo componentes repetidos o modales.
* No introducir textos visibles sin traduccion ES/EN/DE.
* Cuidar resoluciones 1920x1080 con escala del sistema y 2560x1440.
* Verificar que textos no se salgan de contenedores.
* Focus Mode es central: no tocar su comportamiento salvo necesidad real.
* Duel Mode es opcional: la comparacion tradicional debe seguir siendo default.

### Themes

* Registrar nuevos themes en `wwwroot/theme-manager.js`.
* Agregar CSS con `[data-theme="theme-id"]`.
* Cyberpunk es baseline.
* Heaven debe seguir funcionando cuando se cambien componentes.
* Revisar share mode si el cambio afecta capturas Discord.

### Idiomas

* Toda nueva feature visible debe ir en `LANGS.es`, `LANGS.en`, `LANGS.de`.
* Mantener placeholders consistentes (`{player}`, `{score}`, etc.).
* Nombres oficiales de mods pueden quedarse en ingles.

### API osu!

* Mantener `x-api-version: 20220705` en endpoints de scores.
* No inventar heuristicas para Stable/Lazer: usar solo `legacy_score_id`.
* No asumir que todos los usuarios tienen top plays o recent plays.
* `replays_watched_by_others` puede venir ausente; la UI debe soportar guion.
* Recent Plays depende de lo que devuelva osu! en su ventana reciente.

### Discord

* Bot usa Interactions HTTP, no Gateway.
* Despues de cambiar comandos, recordar que comandos globales pueden tardar en propagarse.
* Los botones/selects usan `custom_id`; no duplicarlos dentro del mismo mensaje.
* Si se cambia layout de rooms o cards, probar share mode porque Discord captura esa vista.
* No romper `window.__osuShareReady`.

### Animaciones Y Sonidos

* GSAP para entradas/salidas complejas y secuencias grandes.
* CSS para hover, transiciones pequenas y estados.
* Respetar `prefers-reduced-motion`.
* Share mode sin sonidos ni animaciones GSAP.
* Si se cambia un overlay animado, probar abrir/cerrar varias veces en la misma comparacion.
* Sonidos deben ser cortos y sin silencio inicial.

### Git Y Archivos

* No modificar `bin`, `obj`, `.vs`, `Backup` ni archivos generados.
* No editar `AGENTS.md` por rutina: actualizarlo cuando el usuario lo pida o tras cambios grandes confirmados.
* Antes de commit, revisar `git status` para no mezclar secrets ni basura local.

---

## Pendientes Reales / Por Verificar

Estos puntos salen de codigo actual, no de memoria vieja:

* Tests automatizados: no se detecto proyecto de tests dedicado. Por verificar si se quiere agregar smoke tests/backend tests.
* `osuforfellascomparison.http` sigue apuntando a `/weatherforecast/`, endpoint que no existe en la app actual. Es helper obsoleto.
* Local dev tiene dos referencias de puerto:
  * `Program.cs` fallback y Docker: `8080`.
  * `launchSettings.json`: `5188`/`7044`.
  * Al configurar OAuth local, confirmar cual puerto se esta usando realmente.
* `wwwroot/sounds/ui/manifest.json` no tiene asset custom para `success`; usa fallback sintetico.
* Horror Rhythm Theme no existe en codigo. Solo aparece como idea/futuro en README.
* No existe `prototypes/heaven-theme-prototype.html` en el workspace actual, aunque versiones viejas de AGENTS lo mencionaban.
* Las vistas de Discord dependen de estado en memoria; tras reinicio, componentes antiguos pueden no funcionar. Esto es comportamiento actual, no persistencia.
* Cualquier texto con acentos visto raro en consola puede ser tema de encoding de PowerShell; verificar en navegador/editor antes de corregir.

---

## Como Continuar Sin Perder Contexto

1. Leer este `AGENTS.md`.
2. Revisar `git status --short`.
3. Si se va a tocar frontend, empezar por `wwwroot/script.js`, `wwwroot/styles.css`, `wwwroot/index.html`.
4. Si se va a tocar osu! API, revisar `Features/Osu/OsuApiService.cs` y `Features/Osu/OsuController.cs`.
5. Si se va a tocar Discord, revisar `Features/Discord/*` y share mode en `wwwroot/script.js`.
6. Si se va a tocar OAuth/amigos, revisar `Controllers/AuthController.cs` y las funciones Friends en `wwwroot/script.js`.
7. Si se agregan textos visibles, hacerlo en ES/EN/DE.
8. Si se cambia layout principal, verificar:
   * Comparacion 1, 2, 3 y 4 jugadores.
   * Focus Mode.
   * Player Profile.
   * Top Plays.
   * Recent Plays.
   * Friends.
   * History.
   * Duel Mode.
   * Cyberpunk y Heaven.
   * Share mode de Discord.
9. Si se cambia animacion, probar abrir/cerrar varias veces el mismo overlay.
10. Si se cambia sonido, probar mute, volumen y share mode.

---

## Configuracion Local Basica

Desde la carpeta del proyecto:

```powershell
dotnet user-secrets set "OsuApi:ClientId" "TU_CLIENT_ID"
dotnet user-secrets set "OsuApi:ClientSecret" "TU_CLIENT_SECRET"
dotnet user-secrets set "OsuApi:RedirectUri" "http://localhost:5188/auth/osu/callback"
dotnet user-secrets list
```

Si corres la app por `dotnet run` sin launch profile y usa `8080`, el redirect local deberia ser:

```text
http://localhost:8080/auth/osu/callback
```

En produccion Render:

```text
https://osu-comparison-api.onrender.com/auth/osu/callback
```

Si osu! solo permite un callback por OAuth App, usar apps OAuth separadas para local y produccion.

---

## Resumen Corto Del Estado Actual

La app ya tiene comparacion manual hasta 4 jugadores, Focus Mode, perfil extendido, Top Plays 10, Recent Plays real, Choke Detector, Style Tags, Comparison Breakdown, Direct Duel 1v1, OAuth osu!, Friends, History, themes Cyberpunk/Heaven, idiomas ES/EN/DE, GSAP, sonidos UI, legal pages, Discord bot con visual compare y capturas de profile/top/recent.

No tratar Recent Plays, Duel Mode, GSAP, sonidos, legal pages o share room como pendientes: existen en codigo actual.
