# Changelog

Alle noemenswaardige wijzigingen aan dit project. Nieuwste bovenaan.
Format gebaseerd op [Keep a Changelog](https://keepachangelog.com/nl/1.1.0/).

Categorieën: **Toegevoegd**, **Gewijzigd**, **Opgelost**, **Verwijderd**, **Beveiliging**, **Onderhoud**.

Eerdere wijzigingen (vóór oktober 2026) staan alleen in de git-geschiedenis.

## [Unreleased]

### Gewijzigd
- Paginatransities volgens `_standards/TRANSITIONS.md`: één CSS-crossfade, voortgangsbalk `PageProgress` + `src/lib/page-transitions.ts` (met fixes voor de swap van `<html>`-attributen, een late eerste `page-load` en dubbelklikken). Reveals boven de vouw starten op `page:transition-end` in plaats van de reveal-gate.
- Eerste-load-preloader vervangen door `Intro.astro` volgens §5: 1× per sessie, ±1,2 s, puur CSS, niet bij reduced motion of in de Presentation tool, wacht niet op afbeeldingen.
- Thema bij navigatie via `ThemeScript.astro` (`astro:after-swap`) in plaats van de `before-swap`-hack.
- Lenis wordt één keer aangemaakt en rond navigaties gestopt/gestart in plaats van steeds opnieuw opgebouwd.
- Reveal-scripts uit `DefaultLayout.astro` samengevoegd in `src/lib/reveal-on-view.ts`.

### Verwijderd
- `public/js/preloader.js`, `public/css/preloader.css`, `src/components/Preloader.astro`, `docs/preloader-blueprint.md`.
- Blur/grayscale-filter tijdens navigatie (`nav-transition-active`) en de Safari-UA-sniff (`is-safari`).
- Reveal-gate (`window.__navRevealGateOpen`, `window.__deferReveal`, safety-timer) en het event `preloader:nav-complete`.

## [2026-10-07] (PR #39)

### Opgelost
- Presentation tool na navigatie: de adresbalk bleef op `/api/preview` staan, het documentpaneel toonde de vorige pagina en de Edit-toggle reageerde niet meer. Eigen `VisualEditing`-component (`src/sanity/components/VisualEditing.tsx`) met een history-adapter: elke pagina meldt zijn URL aan de Studio, en navigatie vanuit de Studio werkt.

### Onderhoud
- `@sanity/visual-editing` 2.15.4 als directe dependency (dezelfde versie die `@sanity/astro` gebruikt).

## [2026-10-06] (PR #38)

### Beveiliging
- De preview-cookie is nu ondertekend (HMAC met `SANITY_API_READ_TOKEN`) en verloopt na 12 uur. Voorheen kon iedereen met een zelfgezette cookie `sanity-preview=true` en de header `Sec-Fetch-Dest: iframe` drafts opvragen.
- Responses aan requests met een geldige preview-cookie krijgen `Cache-Control: private, no-store` en `Vary: Cookie, Sec-Fetch-Dest`.

### Opgelost
- Navigeren in de Presentation tool brak de preview (*"narwalcreative.netlify.apphttps's server IP address could not be found"*). De page transitions (`ClientRouter`) halen pagina's op via `fetch`, zonder `Sec-Fetch-Dest: iframe`, waardoor Visual Editing wegviel. In de preview wordt elke klik nu een volledige page load; voor bezoekers blijven de transitions gelijk.

## [2026-10-06] (PR #37)

### Beveiliging
- Drafts zijn niet langer voor iedereen zichtbaar via `?preview=true`. Visual Editing gaat nu alleen aan via draft mode: `/api/preview` valideert het preview-secret van de Studio (`@sanity/preview-url-secret`) en zet een httpOnly-cookie.

### Gewijzigd
- Visual Editing staat per request aan (`src/middleware.ts`) in plaats van via `PUBLIC_SANITY_VISUAL_EDITING_ENABLED`, en alleen binnen de iframe van de Presentation tool (`Sec-Fetch-Dest: iframe`).
- Presentation tool gebruikt `previewMode` (`/api/preview`, `/api/preview/disable`); `?preview=true` weggehaald uit de document-locaties in `resolve.ts`.
- Perspective `previewDrafts` vervangen door `drafts`.
- `astro.config.mjs`: `output: 'server'`.
- Studio verplaatst van `/studio` naar `/admin` (standaard; voorkomt botsing met een pagina met slug `studio`).
- In de gedeployde Studio op `*.sanity.studio` wijst de Presentation tool naar de site in plaats van naar sanity.studio.
- Netlify-rewrite beperkt van `/api/*` naar `/api/newsletter`, zodat `/api/preview` een Astro-route blijft.
- SEO-data wordt met `stegaClean()` schoongemaakt, zodat in de preview geen stega-tekens in `<head>` belanden.

### Opgelost
- `site` in `astro.config.mjs` wees naar `narwal.netlify.app` (bestaat niet); nu `narwalcreative.netlify.app`. Canonical- en `og:url` kloppen weer.

### Verwijderd
- Env-variabele `PUBLIC_SANITY_VISUAL_EDITING_ENABLED` en de URL-parameter `?preview=true`.
- `searchParams`-parameter van `loadQuery()`, `getNodeData()`, `getHomeData()`, `getPageData()` en `getProjectData()`.

### Onderhoud
- `CHANGELOG.md`, `AGENTS.md` en `CLAUDE.md` toegevoegd.
- `@sanity/preview-url-secret` toegevoegd; `@sanity/client` in de lockfile mee bijgewerkt naar 7.27.
