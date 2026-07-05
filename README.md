# Most Badass Resume Ever

PWA React + TypeScript costruita con Vite, con UI stile terminale Fallout e layout curriculum interattivo.

## Stack

- Vite + React + TypeScript
- vite-plugin-pwa
- Vitest + Testing Library + jsdom
- ESLint

## Requisiti

- Node.js 20+
- npm 10+

## Setup

```bash
npm install
```

## Comandi

```bash
npm run dev
```
Avvia ambiente di sviluppo.

```bash
npm run build
```
Esegue type-check (`tsc -b`) e build di produzione Vite.

```bash
npm run test
```
Esegue test unitari (tabs + chat placeholder).

```bash
npm run lint
```
Esegue lint su file TypeScript/TSX.

```bash
npm run preview
```
Avvia preview del build locale.

## Layout implementato

- Colonna riassuntiva a sinistra
- Header con cover image bassa e larga
- Avatar circolare in alto a destra
- Tabs centrali in-place: Benvenuto, Formazione, Esperienze, Skill
- Chat placeholder sotto i tabs pronta per integrazione AI
- Estetica CRT/terminal con glow, scanlines e palette verde/ambra

## Accessibilita tabs

Il componente tabs implementa:

- ARIA roles: `tablist`, `tab`, `tabpanel`
- Navigazione tastiera: frecce, Home, End
- Focus management e `aria-selected`

## PWA

Configurata tramite vite-plugin-pwa con:

- Manifest web app locale
- Icone locali SVG (192/512)
- Registrazione service worker (`virtual:pwa-register`)
- Caching statico e fallback app shell offline

## Integrazione AI futura (chat)

La chat e un placeholder pronto a integrazione:

1. Sostituire la risposta fallback in `src/components/ChatPlaceholder.tsx` con chiamata API LLM.
2. Gestire streaming token (SSE/WebSocket o fetch stream).
3. Aggiungere stato di loading/error e retry.
4. Collegare auth e rate limiting lato backend.
5. Estendere test per mock API e casi di errore rete.

## Note asset

Tutti gli asset grafici usati sono locali (SVG in `public/`) e non dipendono da risorse esterne.
