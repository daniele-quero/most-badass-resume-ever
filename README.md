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
Avvia il frontend Vite in locale.

```bash
npm run build
```
Esegue type-check (`tsc -b`) e build di produzione Vite.

```bash
npm run test
```
Esegue i test unitari e di integrazione leggera su tabs, chat e App.

```bash
npm run lint
```
Esegue lint su file TypeScript/TSX.

```bash
npm run preview
```
Avvia preview del build locale.

## Struttura del progetto

- `src/App.tsx` compone la shell, lo stato della tab attiva e l'aggancio della chat.
- `src/components/resume/` contiene i blocchi della UI curriculum estratti da App.
- `src/components/resume/sections/` ha una section component per ogni blocco dati.
- `src/components/resume/markdownSection.ts` gestisce il parsing condiviso dei file markdown in `data/`.
- `src/components/Tabs.tsx` mantiene la navigazione accessibile tra le tab.
- `src/components/Chat.tsx` gestisce la chat AI con streaming progressivo.
- `data/*.data.md` contiene i contenuti testuali del profilo, separati per dominio.

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

## Chat AI

La chat usa le Netlify Functions in `src/components/Chat.tsx` e mostra le risposte in streaming mentre arrivano.

Il backend prova i provider in fallback e si ferma sul primo token disponibile; se il provider preferito non risponde in tempo, passa al successivo.

Prima di costruire il prompt, il contenuto dei file `data/*.data.md` viene filtrato in memoria: le righe bullet che contengono link o date vengono scartate e la sezione `research` non viene inviata al modello.

Per provarla con le Netlify Functions:

1. crea un `.env` con almeno una chiave `CHAT_GEMINI_API_KEY` o `CHAT_GROQ_API_KEY`;
2. avvia `npx --yes netlify@26.1.0 dev --offline`;
3. apri l'app su `http://localhost:8888`.

Nota: `npm run dev` serve solo il frontend Vite.

## PWA

Configurata tramite vite-plugin-pwa con:

- Manifest web app locale
- Icone locali SVG (192/512)
- Registrazione service worker (`virtual:pwa-register`)
- Caching statico e fallback app shell offline

## Note asset

Tutti gli asset grafici usati sono locali (SVG in `public/`) e non dipendono da risorse esterne.
