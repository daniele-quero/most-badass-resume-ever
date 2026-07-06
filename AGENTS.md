# AGENTS.md

## Scope
This repository contains a single-page PWA resume built with React + TypeScript + Vite.
These instructions apply to all coding agents working in this workspace.

## Start Here
- Read [README.md](README.md) first for setup and full command reference.
- Runtime baseline: Node.js 20+ and npm 10+.
- Keep changes focused and small; avoid unrelated refactors.

## Commands Agents Should Use
- Install deps: `npm install`
- Dev server: `npm run dev`
- Tests: `npm run test`
- Lint: `npm run lint`
- Production build: `npm run build`
- Local preview: `npm run preview`

## Project Map
- App shell/layout: `src/App.tsx`
- Tabs logic and accessibility: `src/components/Tabs.tsx`
- Chat placeholder UI and local behavior: `src/components/ChatPlaceholder.tsx`
- Fallout terminal visual theme: `src/index.css`
- App bootstrap + SW registration: `src/main.tsx`
- PWA manifest/caching config: `vite.config.ts`
- Component tests: `src/components/*.test.tsx`

## Working Conventions
- Keep TypeScript strict-friendly; avoid introducing `any` unless justified.
- Preserve in-page tab navigation (no route-based replacement for tabs).
- Preserve ARIA semantics and keyboard support in tabs (arrows, Home, End).
- Keep chat as a local placeholder unless the task explicitly adds backend/AI wiring.
- Keep visual direction consistent with Fallout terminal style (CRT frame, glow, scanline, green/amber palette).
- Prefer local assets in `public/`; do not require remote assets for core UI.

## Validation Before Finishing
Run all three checks after code changes:
1. `npm run test`
2. `npm run lint`
3. `npm run build`

If behavior changes, update tests in `src/components/*.test.tsx` and align docs in [README.md](README.md).

## Guardrails
- Do not modify `.gitignore` unless explicitly requested.
- Do not edit user documents (`*.docx`, `*.pdf`) unless explicitly requested.
- Do not rely on generated folders (`dist/`, `coverage/`, `node_modules/`) for source changes.
- Keep PWA registration and manifest icon paths coherent when touching PWA config.

## Structured Personal Data (`data/`)

The `data/` folder holds English-language, source-attested Markdown files that describe the person behind this resume. Each file is scoped by a matching Copilot instruction file under `.github/instructions/`.

- [data/thisisme.data.md](data/thisisme.data.md) — identity and personality; no phone, email, or address. Personality is populated by the `Digital-Twin-Maker` agent.
- [data/academy.data.md](data/academy.data.md) — formal academic degrees.
- [data/work.data.md](data/work.data.md) — professional experience, most recent first.
- [data/research.data.md](data/research.data.md) — academic and research activities and publications.
- [data/courses.data.md](data/courses.data.md) — personal training outside school and university.
- [data/gamefolio.data.md](data/gamefolio.data.md) — published games (source: itch.io).
- [data/repofolio.data.md](data/repofolio.data.md) — public GitHub repositories.
- [data/skills.data.md](data/skills.data.md) — hard and soft skills.

Each file has a scoped instruction file under `.github/instructions/<name>.instructions.md` that defines its exact schema and rules via `applyTo`.

### Digital-Twin-Maker agent
[.github/agents/Digital-Twin-Maker.agent.md](.github/agents/Digital-Twin-Maker.agent.md) — HR-style interviewer with a psychology background. Its only job is to interview the user (respectfully, one turn at a time) and expand `data/thisisme.data.md` using evidence-based profiling frameworks (Big Five, HEXACO). It writes exclusively through the `contribute-data` skill.

### contribute-data skill
[.github/skills/contribute-data/SKILL.md](.github/skills/contribute-data/SKILL.md) — the only sanctioned way for any agent to add or update entries in `data/*.data.md`. Enforces schema fidelity, English-only, source attribution, deduplication, no PII beyond schema, and non-destructive edits.

### Data workflow rules
- Never modify a `data/*.data.md` file without first reading the matching `.github/instructions/<name>.instructions.md`.
- Never invent facts. Use `TBD` or `N/A` when a source is missing.
- Never add phone numbers or other PII outside each file's declared schema.
- All data files, instructions, agent files, and skill files must remain in English.

## Related Documentation
- Setup, commands, architecture notes: [README.md](README.md)

## Local Run Protocol (Mandatory)
When the user asks to "run locally", agents must follow this protocol:

1. Ensure dependencies are installed:
	- `npm install`
2. Ensure `.env` exists and contains at least one valid `AI_KEY_*` value.
3. Start the app with Netlify dev (not plain Vite) so Functions are available:
	- `npx --yes netlify@26.1.0 dev --offline`
4. Confirm local Functions are reachable:
	- `http://localhost:8888/.netlify/functions/ai-providers` should return HTTP 200.
5. Share the correct manual access URL with the user:
	- `http://localhost:8888`

Important behavior rule:
- Do not open the browser automatically.
- Do not use browser-opening tools unless the user explicitly requests browser automation.
- Always provide the localhost link and let the user open it manually.

Clarification:
- `npm run dev` serves only the frontend on port 5173.
- For end-to-end local behavior (including AI proxy), use Netlify dev and port 8888.
