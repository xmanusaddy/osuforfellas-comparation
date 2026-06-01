# AGENTS.md

## Proyecto

osu! For Fellas Comparison

Aplicación ASP.NET Core para comparar perfiles de jugadores de osu! de forma visual y atractiva.

La filosofía del proyecto es ofrecer una comparación rápida, estética y moderna entre jugadores, no reemplazar la página oficial de osu!.

---

## Estructura Principal

### Frontend

* `wwwroot/index.html`

  * Interfaz principal.

* `wwwroot/styles.css`

  * Hoja de estilos principal.
  * Contiene todo el diseño cyberpunk actual.

* `wwwroot/script.js`

  * Lógica frontend.
  * Sistema de idiomas.
  * Comparación de jugadores.
  * Renderizado de resultados.
  * Focus Mode.
  * Top Play.

### Backend

* `Controllers/OsuController.cs`

  * Comunicación con la API de osu!.
  * Endpoint principal: `/api/osu`.

---

## Idiomas

El proyecto soporta:

* Español
* Inglés
* Alemán

### Regla Obligatoria

Toda nueva funcionalidad visible para el usuario debe implementarse en los tres idiomas.

No dejar textos hardcodeados.

Utilizar siempre el sistema de traducciones existente.

---

## Diseño

### Estilo General

Mantener la estética cyberpunk actual.

Características principales:

* Fondos oscuros.
* Glows.
* Acentos neón.
* Diseño moderno.
* Tarjetas visualmente atractivas.

### No hacer

* No convertir la interfaz en una copia de la página oficial de osu!.
* No eliminar glows ni elementos visuales importantes.
* No simplificar excesivamente la interfaz.

---

## Funcionalidades Principales

### Comparación de jugadores

* Soporta hasta 4 jugadores.
* Comparación visual lado a lado.

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
* Descarga de replay cuando esté disponible.

### Focus Mode

* Disponible al seleccionar una tarjeta de jugador.
* Muestra información ampliada.
* Es una funcionalidad central del proyecto.
* No modificar su comportamiento sin necesidad.

---

## Perfiles Especiales

Existen personalizaciones visuales para determinados usuarios.

Ejemplo:

* Manu Is Washed

  * Nombre en rojo sangre.
  * Tag "Page Creator" personalizado.

Estas personalizaciones deben mantenerse.

---

## Funcionalidades Planificadas

### Sistema de Themes

El sistema debe ser escalable.

Actualmente está planificado:

* Default Cyberpunk Theme
* Heaven Theme
* Horror Rhythm Theme

En el futuro podrán añadirse más.

Diseñar el sistema pensando en múltiples themes.

### Lazer / Stable

Está planificado mostrar si una score fue realizada en:

* osu!lazer
* osu!stable

Solo mostrar esta información si puede determinarse correctamente mediante la API.

---

## Reglas de Desarrollo

Antes de realizar cambios:

1. Revisar el impacto en los tres idiomas.
2. Revisar el impacto en Focus Mode.
3. Revisar el impacto en Top Play.
4. Mantener compatibilidad con comparación de hasta 4 jugadores.

Priorizar siempre:

* Experiencia visual.
* Claridad.
* Consistencia del diseño.
* Escalabilidad futura.
