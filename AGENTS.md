# AGENTS.md

## Proyecto

osu! For Fellas Comparison

Aplicacion ASP.NET Core para comparar perfiles de jugadores de osu! de forma visual y atractiva.

La filosofia del proyecto es ofrecer una comparacion rapida, estetica y moderna entre jugadores, no reemplazar la pagina oficial de osu!.

---

## Estructura Principal

### Frontend

* `wwwroot/index.html`

  * Interfaz principal.
  * Contiene el selector de idiomas, selector de themes, formulario de busqueda, resultados, navegacion de rooms y contenedores principales.
  * Contiene el contenedor `#auth-widget` para login OAuth con osu!.
  * Contiene `#room-view` para las secciones internas tipo Friends, History, perfil extendido y Top Plays.

* `wwwroot/styles.css`

  * Hoja de estilos principal.
  * Contiene el diseno cyberpunk actual.
  * Contiene variables CSS semanticas para themes.
  * Contiene overrides del theme Heaven.
  * Contiene estilos de comparativas, Top Play, Focus Mode, rooms, perfil extendido, Top Plays ampliados, Friends/History y responsive.

* `wwwroot/script.js`

  * Logica frontend.
  * Sistema de idiomas.
  * UI de login/logout OAuth.
  * Comparacion de jugadores.
  * Renderizado de resultados.
  * Focus Mode.
  * Top Play.
  * Rooms internas por hash route.
  * Friends Room.
  * History Room.
  * Perfil extendido de jugador.
  * Sala de Top Plays.
  * Resumen comparativo entre jugadores.
  * Indicador osu!lazer / osu!stable dentro de Focus Mode.
  * Tooltips para mostrar nombres completos de mods al pasar el mouse.

* `wwwroot/theme-manager.js`

  * Sistema de themes.
  * Aplica el theme mediante `document.documentElement.dataset.theme`.
  * Guarda el theme seleccionado en `localStorage` usando la key `theme`.
  * Rellena el selector `#theme-select`.

### Backend

* `Controllers/OsuController.cs`

  * Comunicacion con la API de osu!.
  * Endpoint principal: `/api/osu`.
  * Para Top Plays usa el header `x-api-version: 20220705`.
  * Ese header es necesario para recibir el Score object moderno y leer `legacy_score_id`.
  * Mantiene el flujo publico/client credentials para busqueda manual, Top Play y Top Plays ampliados.
  * Endpoint de best plays acepta `limit` por query y lo limita internamente entre 1 y 20.

* `Controllers/AuthController.cs`

  * Maneja OAuth Authorization Code Flow con osu!.
  * Rutas principales:

    * `GET /auth/osu/login`
    * `GET /auth/osu/callback`
    * `POST /auth/logout`
    * `GET /auth/logout`
    * `GET /api/me`
    * `GET /api/me/friends`

  * No debe exponer `access_token` ni `refresh_token` al frontend.
  * Guarda la sesion del usuario en backend mediante session/cookie.
  * Fase actual: login con lista de amigos, favoritos locales y seleccion de amigos para comparacion.

### Prototipos

* `prototypes/heaven-theme-prototype.html`

  * Prototipo aislado para experimentar con fondo Heaven.
  * No es parte del flujo principal de produccion.

---

## Idiomas

El proyecto soporta:

* Espanol
* Ingles
* Aleman

### Regla Obligatoria

Toda nueva funcionalidad visible para el usuario debe implementarse en los tres idiomas.

No dejar textos visibles hardcodeados.

Utilizar siempre el sistema de traducciones existente en `wwwroot/script.js`.

Traducciones ya incluidas para features recientes:

* Selector de theme: `Tema`, `Theme`, `Thema`.
* OAuth/login:

  * `Iniciar sesion con osu!`
  * `Cerrar sesion`
  * `Conectado como`
  * `Error al iniciar sesion`
  * `Sign in with osu!`
  * `Log out`
  * `Connected as`
  * `Sign-in failed`
  * `Mit osu! anmelden`
  * `Abmelden`
  * `Verbunden als`
  * `Anmeldung fehlgeschlagen`

* Indicador de cliente:

  * `Jugado en Lazer`
  * `Jugado en Stable`
  * `Played on Lazer`
  * `Played on Stable`
  * `Gespielt auf Lazer`
  * `Gespielt auf Stable`

* Resumen comparativo:

  * Ventaja PP / PP Lead / PP-Vorsprung.
  * Mejor precision / Best Accuracy / Beste Genauigkeit.
  * Partidas jugadas / Play Count / Spielanzahl.
  * Mejor Top Play / Best Top Play / Bestes Top Play.
  * La ventaja PP debe indicar el nombre real del segundo jugador, no un texto generico como "Top 2".

---

## Diseno

### Estilo General

Mantener la estetica cyberpunk actual como base del proyecto.

Caracteristicas principales:

* Fondos oscuros.
* Glows.
* Acentos neon.
* Diseno moderno.
* Tarjetas visualmente atractivas.
* Tipografia fuerte y estilo arcade/cyberpunk.

### No hacer

* No convertir la interfaz en una copia de la pagina oficial de osu!.
* No eliminar glows ni elementos visuales importantes.
* No simplificar excesivamente la interfaz.
* No introducir textos visibles sin traduccion.
* No romper la comparacion de hasta 4 jugadores.

---

## Funcionalidades Implementadas

### Navegacion por Rooms

Implementado sistema de secciones internas usando hash routes.

Rutas actuales:

* `#/compare`
* `#/results`
* `#/friends`
* `#/history`
* `#/player/:username`
* `#/top-plays/:username`
* `#/recent/:username`

Detalles:

* `#/compare` es el landing/formulario principal.
* `#/results` muestra la comparacion activa.
* `#/friends` muestra una vista amplia de amigos.
* `#/history` muestra historial de comparaciones y jugadores recientes.
* `#/player/:username` muestra perfil extendido del jugador.
* `#/top-plays/:username` muestra las mejores jugadas del jugador.
* `#/recent/:username` esta preparado como habitacion futura, pero aun no tiene feature completa.
* `roomBack()` debe volver de forma contextual:

  * Desde perfil extendido con comparacion activa: volver a `#/results`.
  * Desde Top Plays: volver al perfil extendido del jugador.
  * Si no hay comparacion activa: volver a `#/compare`.

* `Escape` debe cerrar Focus Mode si esta abierto.
* `Escape` desde perfil extendido debe volver a resultados si hay comparacion activa.
* `Escape` desde Top Plays debe volver al perfil.
* No mostrar textos temporales tipo "room ready" en produccion.

### Comparacion de jugadores

* Soporta hasta 4 jugadores.
* Comparacion visual lado a lado.
* Ranking visual por PP.
* Banner de lider.
* Resumen comparativo superior (`compare-summary`) cuando hay 2 o mas jugadores.

El resumen comparativo muestra:

* Ventaja PP del lider contra el segundo jugador.
* Mejor precision.
* Mayor play count.
* Mejor Top Play por PP.

Regla visual del resumen comparativo:

* Si el jugador destacado es `manu is washed`, solo el nombre principal de la metrica debe usar el rojo especial `creator-name`.
* La linea secundaria, por ejemplo `contra manu is washed` o `vs manu is washed`, debe quedarse como informacion secundaria gris.

### Friends Room

Disponible en `#/friends`.

Objetivo:

* Dar mas espacio a la gestion de amigos sin cargar el landing.
* Mantener el panel compacto del landing fuera de la pantalla principal.

Incluye:

* Resumen de amigos totales, favoritos y seleccionados.
* Buscador.
* Filtro Friends/Favorites con iconos.
* Lista amplia responsive.
* Fila de seleccionados.
* Boton para comparar seleccionados reutilizando `doSearch()`.

Reglas:

* No hacer llamadas extra innecesarias a la API.
* Usar los datos ya cargados en memoria cuando sea posible.
* Mantener compatibilidad Cyberpunk y Heaven.

### History Room

Disponible en `#/history`.

Incluye:

* Comparaciones recientes.
* Comparaciones favoritas.
* Jugadores recientes.
* Buscador.
* Filtros con iconos.
* Acciones para repetir comparacion o recuperar jugadores.

Persistencia local:

* `osu_recent_comparisons_<userId|guest>`
* `osu_favorite_comparisons_<userId|guest>`

Reglas:

* El historial debe separarse por usuario logueado.
* Si no hay usuario, usar contexto `guest`.
* No reemplazar el flujo de busqueda manual.

### Perfil extendido

Disponible en `#/player/:username`.

Se puede abrir desde Focus Mode mediante el boton de perfil completo.

Incluye:

* Avatar grande.
* Username, bandera y titulo.
* PP.
* Rank global, rank de pais y nivel.
* Peak rank y tendencia cuando la API lo ofrece.
* Stats principales.
* Top Play principal.
* Acciones:

  * Ver Top Plays.
  * Ver Recent Plays.
  * Abrir perfil en osu!.

Reglas UX:

* No mostrar el username gigante duplicado en la cabecera.
* No incluir boton "Compare player" dentro del perfil extendido.
* Debe poder volver a la comparacion activa sin obligar al usuario a rehacer la busqueda.

### OAuth osu!

Implementado login con osu! y lectura de amigos.

Flujo actual:

* Boton `Iniciar sesion con osu!` en la UI.
* Redireccion a osu! OAuth.
* Callback en backend.
* Sesion guardada del lado servidor.
* Endpoint `/api/me` para consultar si hay usuario logueado.
* Endpoint `/api/me/friends` para consultar amigos del usuario logueado.
* Mini-card del usuario logueado en landing y resultados.
* Logout.

Scopes actuales:

* `identify`
* `public`
* `friends.read`

No implementar integraciones sociales adicionales sin pedirlo explicitamente.

Reglas de seguridad:

* No exponer tokens al frontend.
* No guardar secrets en archivos versionados.
* Local debe usar .NET User Secrets.
* Render/produccion debe usar Environment Variables.
* `appsettings.json` debe quedarse con placeholders vacios.
* `appsettings.Development.json` no debe contener ClientSecret.

Configuracion usada por OAuth:

* `OsuApi:ClientId`
* `OsuApi:ClientSecret`
* `OsuApi:RedirectUri`

En Render usar formato de variables:

* `OsuApi__ClientId`
* `OsuApi__ClientSecret`
* `OsuApi__RedirectUri`

Local User Secrets:

* El proyecto tiene `UserSecretsId` en `osuforfellascomparison.csproj`.
* Ruta Windows esperada:

  * `C:\Users\darly\AppData\Roaming\Microsoft\UserSecrets\osuforfellascomparison-local-oauth\secrets.json`

Callback local esperado:

* `http://localhost:8080/auth/osu/callback`

Callback produccion esperado:

* `https://osu-comparison-api.onrender.com/auth/osu/callback`

Si osu! solo permite un callback por OAuth App, usar apps separadas para local y produccion.

UI login:

* `#auth-widget` vive cerca del selector de theme.
* Debe funcionar en landing y results.
* Debe ocultarse/mostrarse junto con los controles superiores al hacer scroll.
* Debe verse coherente en Cyberpunk y Heaven.
* Si el usuario logueado es `manu is washed`, usar `creator-name` y tag `PAGE CREATOR`.
* Para otros usuarios, usar tag normal via `getUserTitle(pp)`.

### Amigos osu!

Implementado con OAuth y scope `friends.read`.

Backend:

* Endpoint: `GET /api/me/friends`.
* Devuelve 401 si no hay usuario logueado.
* No expone tokens al frontend.

Frontend:

* La lista de amigos se carga solo si hay sesion.
* Muestra avatar, username y pais cuando esta disponible.
* Tiene loading, error y empty states traducidos.
* Tiene buscador de amigos.
* Tiene filtros compactos con iconos:

  * Friends / Amigos / Freunde.
  * Favorites / Favoritos / Favoriten.

* Los favoritos se guardan en `localStorage` por usuario logueado, usando el id de osu! del usuario para separar cuentas.
* Cada card tiene estrella:

  * Gris = no favorito.
  * Dorada = favorito.

* Click en la estrella solo marca/desmarca favorito.
* Click en la card selecciona o deselecciona amigo para comparacion.
* Maximo 4 amigos seleccionados.
* Si al menos un input fue rellenado desde amigos, el boton principal cambia a:

  * `Comparar amigos`
  * `Compare friends`
  * `Freunde vergleichen`

* No crear un flujo nuevo para comparar amigos; reutilizar siempre `doSearch()`.

### Top Play

Incluye:

* Cover del beatmap.
* PP obtenidos.
* Mods.
* Accuracy.
* Combo.
* Rank.
* Misses.
* Fecha.
* Enlace al beatmap.
* Descarga de replay cuando este disponible.
* Mods con tooltip de nombre completo al pasar el mouse.

### Top Plays ampliados

Disponible en `#/top-plays/:username`.

Estado actual:

* La UI muestra 5 Top Plays por jugador.
* El sistema queda preparado para subir a 10 o mas en el futuro.
* `DEFAULT_TOP_PLAYS_LIMIT = 5`.
* `MAX_TOP_PLAYS_LIMIT = 20`.
* El backend acepta `?limit=` y limita el valor entre 1 y 20.

La sala muestra:

* Header compacto del jugador.
* Top Plays cargadas.
* PP promedio.
* Accuracy promedio.
* Mod mas usado.
* Lista de plays con:

  * Posicion.
  * Cover.
  * Titulo/artista/dificultad.
  * Stars.
  * Mods.
  * PP.
  * Accuracy.
  * Rank.
  * Misses.
  * Fecha.
  * Cliente osu!lazer/osu!stable.
  * Link al beatmap.
  * Link de replay si esta disponible.

Importante:

* Si solo aparece 1/5, revisar que el backend local este actualizado y reiniciado.
* Si aun asi sigue 1/5, puede ser que la API solo este devolviendo una score para ese usuario/modo.
* No asumir que siempre habra 5 scores.

### Tooltips de Mods

Implementado.

Funcionamiento:

* Los chips de mods conservan su apariencia actual.
* Al pasar el mouse por encima aparece el nombre completo del mod.
* No usa imagenes externas.
* Usa `data-mod-name` y CSS con `::after` / `::before`.
* Incluye variante visual para Heaven.

Ejemplos:

* `HD` => `Hidden`.
* `HR` => `Hard Rock`.
* `DT` => `Double Time`.
* `NC` => `Nightcore`.
* `FL` => `Flashlight`.
* `NM` => `No Mod`.

Los nombres de mods son nombres oficiales de osu!, por eso se mantienen en ingles.

### Focus Mode

* Disponible al seleccionar una tarjeta de jugador.
* Muestra informacion ampliada.
* Es una funcionalidad central del proyecto.
* No modificar su comportamiento sin necesidad.

Detalles actuales:

* El indicador osu!lazer / osu!stable se muestra solamente en Focus Mode.
* No se muestra en tarjetas compactas, comparacion principal ni vista normal de resultados.
* La linea decorativa inferior del Focus Mode debe estar al final del contenido, no flotando sobre el Top Play. Esto evita deformaciones al usar zoom o scroll.

### Indicador osu!lazer / osu!stable

Implementado solo dentro de Focus Mode.

Fuente de datos:

* Header requerido en backend: `x-api-version: 20220705`.
* Campo usado en frontend: `legacy_score_id`.

Regla:

* `legacy_score_id != null` => osu!stable.
* `legacy_score_id == null` => osu!lazer.

No inventar otras heuristicas para detectar el cliente.

### Sistema de Themes

Implementado.

Funcionamiento actual:

* El theme se aplica con `data-theme` en el elemento `html`.
* El theme seleccionado se guarda en `localStorage`.
* Al recargar la pagina se mantiene el theme elegido.
* El selector de themes esta visible en Landing page y Pantalla de resultados.

Themes registrados actualmente:

* `cyberpunk`
* `heaven`

Notas:

* Cyberpunk sigue siendo el theme base y referencia visual principal.
* Heaven existe como theme en desarrollo/experimental y puede requerir optimizacion de rendimiento, especialmente en PCs modestos con graficos integrados.
* Horror Rhythm sigue planificado para futuro.

Al agregar themes futuros:

* Registrar el theme en `wwwroot/theme-manager.js`.
* Agregar variables/overrides usando `[data-theme="theme-id"]`.
* Mantener los nombres visuales traducibles si aparecen en la UI.
* No reestructurar el sistema de themes si no es necesario.

---

## Perfiles Especiales

Existen personalizaciones visuales para determinados usuarios.

Ejemplo:

* Manu Is Washed

  * Nombre en rojo sangre.
  * Tag `PAGE CREATOR` personalizado.
  * Marco/avatar con glow rojo.
  * El nombre tambien debe verse rojo cuando aparezca como jugador destacado en el resumen comparativo.
  * Si inicia sesion por OAuth, la mini-card de login tambien debe usar el tratamiento creator.

Estas personalizaciones deben mantenerse.

---

## Rendimiento

Tener cuidado con:

* Fondos animados.
* Filtros pesados.
* Animaciones permanentes.
* SVG filters complejos.
* Multiples capas visuales en themes claros como Heaven.

Heaven Theme puede sentirse mas lento que Cyberpunk en hardware modesto. Cualquier mejora futura debe priorizar:

* Menos repaints.
* Animaciones con `transform` y `opacity`.
* Respeto a `prefers-reduced-motion`.
* Evitar filtros SVG animados pesados en produccion si afectan FPS.

---

## Migracion a PC Nueva

Contexto:

* El usuario esta migrando el proyecto a una PC nueva.
* El repo de GitHub es la fuente para mover el codigo.
* Los chats de Codex no forman parte del repo.
* Este `AGENTS.md` debe funcionar como memoria portable del proyecto.

Repo:

* Remoto usado:

  * `https://github.com/xmanusaddy/osuforfellas-comparation.git`

* Rama principal actual:

  * `master`

Ultimos commits relevantes ya pusheados:

* `feat: add app rooms and expanded player views`
* `feat: add mod name tooltips`
* `feat: add "created by manu is washed" footer`
* `updating README.md with the new stuff`
* `docs: update project context`

Al preparar una PC nueva:

1. Instalar Visual Studio con workload `ASP.NET and web development`.
2. Confirmar `.NET 8 SDK`.
3. Instalar Git y GitHub Desktop si se desea.
4. Clonar el repo desde GitHub.
5. Abrir `osuforfellascomparison.csproj` si `.slnx` muestra Migration Report.
6. Ejecutar `git pull origin master` si GitHub Desktop muestra `Pull origin`.
7. Verificar que aparecen los commits nuevos:

   * `feat: add app rooms and expanded player views`
   * `feat: add mod name tooltips`

Secrets locales:

* Los .NET User Secrets no viajan con GitHub.
* En cada PC hay que configurarlos de nuevo.
* Ejecutar desde la carpeta donde esta `osuforfellascomparison.csproj`:

```powershell
dotnet user-secrets set "OsuApi:ClientId" "TU_CLIENT_ID"
dotnet user-secrets set "OsuApi:ClientSecret" "TU_CLIENT_SECRET"
dotnet user-secrets set "OsuApi:RedirectUri" "http://localhost:8080/auth/osu/callback"
dotnet user-secrets list
```

Render:

* Render ya tiene sus propias Environment Variables.
* No depende de los User Secrets locales.
* En Render las keys deben usar doble underscore:

  * `OsuApi__ClientId`
  * `OsuApi__ClientSecret`
  * `OsuApi__RedirectUri`

OAuth local:

* El callback local esperado sigue siendo:

  * `http://localhost:8080/auth/osu/callback`

* Si Visual Studio abre otro puerto, mantener o ajustar el perfil para usar `8080`, o cambiar el RedirectUri en secrets y en la OAuth App de osu!.

Codex/chat:

* Si el historial de chat no aparece en la PC nueva, abrir un chat nuevo y pedir:

  * `Lee AGENTS.md y continua con este proyecto.`

* No subir chats completos al repo.
* Mantener este archivo actualizado despues de cambios grandes.

---

## Reglas de Desarrollo

Antes de realizar cambios:

1. Revisar el impacto en los tres idiomas.
2. Revisar el impacto en Focus Mode.
3. Revisar el impacto en Top Play.
4. Mantener compatibilidad con comparacion de hasta 4 jugadores.
5. Revisar que el sistema de themes siga funcionando.
6. Si se levanta un servidor local para pruebas, cerrarlo al terminar para no bloquear el puerto `8080` en Visual Studio.
7. Revisar que OAuth local siga usando User Secrets y que no se filtren secrets al repo.

Priorizar siempre:

* Experiencia visual.
* Claridad.
* Consistencia del diseno.
* Escalabilidad futura.
* Buen rendimiento en equipos modestos.
