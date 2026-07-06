---
applyTo: "data/gamefolio.data.md"
---

# gamefolio.data.md instructions

This file lists games published by the user on itch.io (source: https://danioquero.itch.io/).

## Schema

One `##` section per game. Each section must contain, in this order:

- — two sentences (~2 lines) describing the game. Cover what it is, its genre/platform, core gameplay loop, and any notable mechanics or context.
- `Link:` — full public URL to the game's itch.io page.

## How to write or update a Description

1. Fetch the game's itch.io page to read the description text, genre tags, and platform info.
2. Combine what you found into two concise English sentences:
   - Sentence 1: what the game is, its genre, platform, and core concept.
   - Sentence 2: notable mechanics, controls, context (e.g. tutorial series, first project), or distinguishing features.
3. Never invent facts — only write what the fetched source confirms.
4. Each new game must be added as a new section at the beginning of the file, preserving the order of existing entries.

## Rules

- Use web fetch on `https://danioquero.itch.io/` (or the specific game page) to confirm title, description, and URL before adding an entry.
- Do not add unpublished, private, or draft entries.
- Preserve the exact title as shown on itch.io.
- Write everything in English.
- Use the `contribute-data` skill to append or update entries.
