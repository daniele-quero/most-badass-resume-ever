---
applyTo: "data/repofolio.data.md"
---

# repofolio.data.md instructions

This file lists **public** GitHub repositories owned by the user (source: https://github.com/daniele-quero?tab=repositories). Also, non-personal repositories with contributions from the user `daniele-quero` are included (to be searched in https://github.com/daniele-quero). The file is used to generate a portfolio of the user's work.

## Schema

One `##` section per repository. Each section must contain, in this order:

- Two sentences (~2 lines) describing the repository. Cover what the project does, its tech stack (primary languages, notable tools), and any distinguishing features (WebGL build, .unitypackage, boss AI, etc.).
- `Link:` — full **public** URL to the repository on GitHub.

## How to write or update a Description

1. Fetch the repository page on GitHub to read the About blurb, language breakdown, and folder structure.
2. If the About field is empty or too short, also fetch the raw `README.md` (e.g. `https://raw.githubusercontent.com/daniele-quero/<repo>/<master or main>/README.md`) and scan commit messages for context.
3. Combine what you found into two concise English sentences:
   - Sentence 1: what the project is and what it does.
   - Sentence 2: notable tech, tools, or structure details (language percentages, exported packages, tested patterns, etc.).
4. Never invent facts — only write what the fetched sources confirm.
5. Each new repository must be added as a new section at the beginning of the file, preserving the order of existing entries.
6. Use the `contribute-data` skill to append or update entries.

## Rules

- Only include repositories that are **public**.
- Remove any repository that is no longer **public** or has been deleted.
- Use web fetch on the repositories page or the individual repo page to confirm name, description, and URL before adding an entry.
- Preserve the exact repository name.
- Write everything in English.
- Use the `contribute-data` skill to append or update entries.
- Ignore `b-w-clicker` and `domande` repositories.