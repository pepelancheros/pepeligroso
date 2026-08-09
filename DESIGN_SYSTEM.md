# Design System — pepeligroso

Este documento tiene dos partes:

1. **Estado actual** — inventario fiel de lo que existe hoy en el código (tokens, fuentes, componentes), con las inconsistencias detectadas.
2. **Propuesta consolidada** — el objetivo hacia el que migrar: un único set de tokens y componentes compartidos entre Home y Photography.

Fuente de verdad actual de tokens: [`src/assets/_variables.scss`](src/assets/_variables.scss).

---

## 1. Estado actual

### 1.1 Tipografía

| Fuente | Origen | Uso actual | Estado |
|---|---|---|---|
| **Montserrat** (100–900, itálica) | Google Fonts (`index.html`) | Texto base (`body`), título del navbar | ✅ OK |
| **TuskerGrotesk** (una sola cara, self-hosted `.woff2`) | `src/assets/main.scss` `@font-face` | Títulos, subtítulos y CTAs vía `.tusker-font` / `.cta-button`; en Photography también los nombres de país y el título de galería | ⚠️ Hay un `@font-face` duplicado y roto en `index.html:17-20` (apunta a `./assets/fonts/`, que no existe) — candidato a limpieza. Ver además la nota de pesos abajo |
| **Space Mono** | Google Fonts (`index.html:15`) | Eyebrow del hero y `__tile-cta` en Photography | ✅ OK |
| **Material Symbols Outlined** | Google Fonts | Iconos de estrella en Contact | ✅ OK |

No hay una pila de fallback definida (`sans-serif`/`monospace` a secas, sin fuentes de sistema intermedias).

**🐛 Pesos sintéticos de TuskerGrotesk**: el `@font-face` declara **un solo archivo** con `font-weight: normal`. Cualquier peso por encima de 400 no existe y el navegador lo falsifica engordando los trazos. Hoy `.photography__hero-title` pide `font-weight: 700` y es el único elemento del sitio con negrita sintética — el resto usa `300`, que resuelve a la cara real. Mismo problema que tenía la itálica de Cormorant (oblicua sintética), que ya se retiró. Pendiente de decidir junto con el rework del texto de ese hero.

**Escala de tamaños**: no existe una escala tipográfica dedicada. Home/Navbar reutilizan los tokens de espaciado (`$size-24`, `$size-96`...) como `font-size`. Photography usa en cambio literales `pxToRem(Npx)` y `clamp()` ad hoc. Son dos escalas paralelas e inconsistentes.

### 1.2 Colores

Definidos en `src/assets/_variables.scss:1-14`, todo en Sass (sin CSS custom properties, sin modo oscuro):

```scss
$color-black-500: #384347;  // texto principal
$color-gray-200:  #d9d9d9;  // fondos secundarios / cards
$color-gray-800:  #424242;  // texto muted (solo Photography)
$color-red-500:   #a41623;  // acento de marca — el más usado
$color-beige-500: #efe5df;  // fondo de página
$color-green-500: #597656;  // uso único
$color-blue-300:  #0f52ba;  // declarado, sin uso real
$color-blue-500:  #07004d;  // hover de links
$generic-border:  rgba(56, 67, 71, 0.37); // borde, derivado de black-500
```

**Colores fuera del sistema** (hardcodeados, no tokenizados):

- `#741720` — blob de hover en `Card.scss:59`
- `#006CB6`, `#200c54`, `#151526` — prop `bgColor` de las tarjetas de proyecto en `Home.jsx`
- `white` en `Card.scss:47` — último literal de color de texto que queda; Photography ya no tiene ninguno
- `rgba(0,0,0,0.12)` — la sombra del CTA, hoy en un solo sitio (`main.scss`), candidata al token `$shadow-hover` de §2.3

No hay soporte de modo oscuro. El único bloque "invertido" es `.photography__about` (fondo `$color-black-500`, texto `$color-beige-500`), tratado como caso puntual y no como tema.

### 1.3 Espaciado y tamaños

Escala única en `_variables.scss:16-35` (rem, vía `pxToRem()`), reutilizada para spacing, font-size y max-width:

```
4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192, 256, 384, 512, 640, 768, 896, 1024, 1280 (px)
```

Los tokens 640/768/896/1024 están declarados pero no se usan en ningún componente.

- **Border-radius**: sin token — valores sueltos (`50px`, `50%`, `2px`, o esquinas rectas en Photography).
- **Shadows**: una sola sombra en todo el proyecto (`Home.scss:62-65`).
- **Breakpoints**: dos convenciones distintas conviviendo:
  - Home/Navbar/Card/Icon/TypedText → `@media (min-width: 48em)`
  - Photography → `@media (max-width: 900px)` / `(max-width: 560px)`
  - Un hook JS (`useWindowDimensions`) duplica el corte con el literal `768` en `Icon.jsx`/`Home.jsx`

### 1.4 Componentes

| Componente | Estado |
|---|---|
| `Navbar`, `Card`, `Icon`, `TypedText` | Únicos componentes reutilizables reales. `Icon` acepta `variant="hero" \| "navbar"` y es instanciable varias veces; `TypedText` todavía no (lista hardcodeada y `getElementById` global) |
| Botones CTA | ✅ **Resuelto**: los dos "SEND ME AN EMAIL" comparten la utilidad `.cta-button`. Cada vista solo aporta layout (`.home__button`) o el ajuste de hover sobre fondo oscuro (`.photography__contact-btn`). El `.photography__category-btn` (outline) que existía ya no está en el código |
| Section headings | `.home__subtitle` en Home vs. clases propias por sección en Photography (`__hero-title`, `__about-title`, `__contact-title`) — mismo rol semántico, sin compartir |
| Gallery/masonry, marquee de skills | Patrones autocontenidos, no reutilizados en otras vistas |

**Conclusión del estado actual**: el estilo sigue siendo mayormente ad hoc por vista, pero ya hay tres utilidades globales — `.red-text`, `.tusker-font` y `.cta-button` — y el ícono de marca aparece en las dos páginas.

---

## 2. Propuesta consolidada

Objetivo: un solo set de tokens y un solo componente por rol, usado igual en Home y Photography.

### 2.1 Tipografía — tokens propuestos

```scss
// Familias
$font-display: "TuskerGrotesk", sans-serif;   // títulos, CTAs
$font-body:    "Montserrat", sans-serif;      // texto corrido
$font-mono:    "Space Mono", monospace;       // eyebrows / labels técnicos

// Escala (independiente del spacing scale)
$font-size-xs:   pxToRem(13px);
$font-size-sm:   pxToRem(15px);
$font-size-base: pxToRem(16px);
$font-size-lg:   pxToRem(18px);
$font-size-xl:   pxToRem(24px);
$font-size-2xl:  pxToRem(32px);
$font-size-3xl:  clamp(pxToRem(40px), 6vw, pxToRem(72px));  // section titles
$font-size-4xl:  clamp(pxToRem(56px), 10vw, pxToRem(120px)); // hero
```

**Acciones para llegar aquí**:
- Eliminar el `@font-face` duplicado y roto de TuskerGrotesk en `index.html:17-20` (dejar solo el de `main.scss`).
- Decidir qué hacer con los pesos de TuskerGrotesk: o se aceptan solo `300`/`400` (la cara real) y se corrige el `700` sintético del hero de Photography, o se consigue un segundo archivo de verdad para la negrita.
- Migrar Photography de `pxToRem(Npx)` literales a esta escala nombrada.

### 2.2 Colores — tokens propuestos

Mantener la paleta actual (ya es coherente y pequeña), pero:

- Eliminar `$color-blue-300` (no usado) o darle un uso real.
- Tokenizar `#741720` como `$color-red-700` (variante oscura del rojo de marca) y usarlo en el hover del Card.
- Mover los `bgColor` de las tarjetas de proyecto (`#006CB6`, `#200c54`, `#151526`) a una lista de constantes con nombre (ej. `PROJECT_ACCENT_COLORS`) en vez de strings sueltos en JSX.
- Reemplazar el `style={{ color: "#a41623" }}` inline en Photography por la clase `.red-text`.
- Introducir un token semántico de superficie invertida (`$color-surface-inverse: $color-black-500` / `$color-on-inverse: $color-beige-500`) para formalizar el patrón que hoy solo existe en `.photography__about`.

### 2.3 Espaciado, radio y breakpoints — tokens propuestos

```scss
// Breakpoints (una sola convención: min-width, em)
$breakpoint-tablet:  48em;  // 768px
$breakpoint-desktop: 64em;  // 1024px

// Border-radius
$radius-sm:   pxToRem(2px);   // elementos angulares (Photography)
$radius-full: 50px;           // píldoras/CTAs (Home)
$radius-circle: 50%;          // blobs/avatares

// Shadow
$shadow-hover: 0 16px 24px 0 rgba(0, 0, 0, 0.12);
```

**Acciones**: retirar los tokens de spacing no usados (640/768/896/1024) o documentarlos como reservados; migrar las media queries de Photography a `$breakpoint-tablet`/`$breakpoint-desktop`; reemplazar el literal `768` en `useWindowDimensions`/`Icon.jsx`/`Home.jsx` por una constante compartida con el breakpoint SCSS.

### 2.4 Componentes — consolidación propuesta

| Componente nuevo | Reemplaza | Variantes |
|---|---|---|
| ~~`<Button>`~~ → utilidad `.cta-button` | `.home__button`, `.photography__contact-btn` | ✅ **Hecho**. Se resolvió como utilidad CSS, no como componente React: con un solo rol de botón en el sitio, un componente no aportaba nada sobre una clase. Si aparece una segunda variante (outline, ghost) conviene reevaluarlo |
| `<SectionHeading>` | `.home__subtitle`, `__hero-title`, `__about-title`, `__contact-title` | Usa `$font-size-3xl`/`4xl` según prop `size` |
| `<Card>` (ya existe) | — | Reemplazar `bgColor` string por token/constante nombrada |

**Nota sobre el reparto**: el patrón que quedó del CTA es *piel global, layout local* — `.cta-button` define tipografía, color, padding y radio; cada vista solo pone alineación y márgenes. Vale la pena repetirlo al consolidar `<SectionHeading>`.

### 2.5 Roadmap sugerido (sin romper nada de golpe)

1. Arreglar lo que queda de fuentes: el `@font-face` duplicado y roto de `index.html`, y el `font-weight: 700` sintético de `.photography__hero-title` — riesgo bajo, impacto visual inmediato. (Space Mono ya carga bien; Cormorant Garamond se retiró.)
2. Introducir los tokens nuevos en `_variables.scss` junto a los existentes (sin borrar nada aún).
3. Migrar Photography a los breakpoints y escala tipográfica compartidos.
4. Extraer `<Button>` y `<SectionHeading>`, migrar Home y Photography a usarlos.
5. Limpiar tokens muertos (`$color-blue-300`, `$size-640/768/896/1024` si siguen sin uso) y el archivo `webpackmockup.config.js` si se confirma que no se usa.
