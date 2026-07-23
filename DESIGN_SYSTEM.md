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
| **TuskerGrotesk** (400 medium, self-hosted `.woff2`) | `src/assets/main.scss` `@font-face` | Títulos, subtítulos, botones CTA vía `.tusker-font` | ✅ OK, pero hay un `@font-face` duplicado y roto en `index.html:19-24` (ruta `./assets/fonts/...` inexistente) — candidato a limpieza |
| **Space Mono** | Google Fonts (comentado en `index.html:18`) | Eyebrow del hero en Photography | 🐛 **Roto**: el link está comentado, nunca se descarga la fuente, cae a `monospace` genérico del sistema |
| **Material Symbols Outlined** | Google Fonts | Iconos de estrella en Contact | ✅ OK |

No hay una pila de fallback definida (`sans-serif`/`monospace` a secas, sin fuentes de sistema intermedias).

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
- `#a41623` inline en `Photography.jsx:183` (duplica `$color-red-500`)
- `white` y `rgba(0,0,0,0.12)` sueltos en varios lugares

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
| `Navbar`, `Card`, `Icon`, `TypedText` | Únicos componentes reutilizables reales |
| Botones CTA | **3 estilos distintos** para el mismo rol: `.home__button` (píldora roja), `.photography__contact-btn` (esquinas rectas), `.photography__category-btn` (outline) — sin componente `Button` compartido |
| Section headings | `.home__subtitle` en Home vs. clases propias por sección en Photography (`__hero-title`, `__about-title`, `__contact-title`) — mismo rol semántico, sin compartir |
| Gallery/masonry, marquee de skills | Patrones autocontenidos, no reutilizados en otras vistas |

**Conclusión del estado actual**: el estilo es ad hoc por vista. Solo dos utilidades son realmente globales: `.red-text` y `.tusker-font`.

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
- Descomentar/arreglar el `<link>` de Space Mono en `index.html` (o quitar la fuente si no vale la pena mantenerla).
- Eliminar el `@font-face` duplicado y roto de TuskerGrotesk en `index.html:19-24` (dejar solo el de `main.scss`).
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
| `<Button variant="solid" \| "outline" \| "ghost">` | `.home__button`, `.photography__contact-btn`, `.photography__category-btn` | Un solo componente, radio y color por variante |
| `<SectionHeading>` | `.home__subtitle`, `__hero-title`, `__about-title`, `__contact-title` | Usa `$font-size-3xl`/`4xl` según prop `size` |
| `<Card>` (ya existe) | — | Reemplazar `bgColor` string por token/constante nombrada |

### 2.5 Roadmap sugerido (sin romper nada de golpe)

1. Arreglar bugs de fuentes (Space Mono, `@font-face` duplicado) — riesgo bajo, impacto visual inmediato.
2. Introducir los tokens nuevos en `_variables.scss` junto a los existentes (sin borrar nada aún).
3. Migrar Photography a los breakpoints y escala tipográfica compartidos.
4. Extraer `<Button>` y `<SectionHeading>`, migrar Home y Photography a usarlos.
5. Limpiar tokens muertos (`$color-blue-300`, `$size-640/768/896/1024` si siguen sin uso) y el archivo `webpackmockup.config.js` si se confirma que no se usa.
