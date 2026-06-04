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
  * Contiene el selector de idiomas, selector de themes, formulario de busqueda, resultados y contenedores principales.
  * Contiene el contenedor `#auth-widget` para login OAuth con osu!.

* `wwwroot/styles.css`

  * Hoja de estilos principal.
  * Contiene el diseno cyberpunk actual.
  * Contiene variables CSS semanticas para themes.
  * Contiene overrides del theme Heaven.
  * Contiene estilos de comparativas, Top Play, Focus Mode y responsive.

* `wwwroot/script.js`

  * Logica frontend.
  * Sistema de idiomas.
  * UI de login/logout OAuth.
  * Comparacion de jugadores.
  * Renderizado de resultados.
  * Focus Mode.
  * Top Play.
  * Resumen comparativo entre jugadores.
  * Indicador osu!lazer / osu!stable dentro de Focus Mode.

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
  * Mantiene el flujo publico/client credentials para busqueda manual y Top Play.

* `Controllers/AuthController.cs`

  * Maneja OAuth Authorization Code Flow con osu!.
  * Rutas principales:

    * `GET /auth/osu/login`
    * `GET /auth/osu/callback`
    * `POST /auth/logout`
    * `GET /auth/logout`
    * `GET /api/me`

  * No debe exponer `access_token` ni `refresh_token` al frontend.
  * Guarda la sesion del usuario en backend mediante session/cookie.
  * Fase actual: login basico solamente; no implementar amigos aqui todavia.

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

### OAuth osu! Fase 1

Implementado login basico con osu!, sin amigos.

Flujo actual:

* Boton `Iniciar sesion con osu!` en la UI.
* Redireccion a osu! OAuth.
* Callback en backend.
* Sesion guardada del lado servidor.
* Endpoint `/api/me` para consultar si hay usuario logueado.
* Mini-card del usuario logueado en landing y resultados.
* Logout.

Scopes actuales:

* `identify`
* `public`

No pedir `friends.read` todavia.

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
