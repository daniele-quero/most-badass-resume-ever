---
applyTo: "data/gamefolio.data.md"
---

# gamefolio.data.md instructions

This file lists games published by the user on itch.io (source: https://danioquero.itch.io/).

## Schema

One `##` section per game. Each section must contain, in this order:

- `Description` — one short sentence describing the game.
- `Link` — full public URL to the game's itch.io page.

## Rules

- Use web fetch on `https://danioquero.itch.io/` (or the specific game page) to confirm title, description, and URL before adding an entry.
- Do not add unpublished, private, or draft entries.
- Preserve the exact title as shown on itch.io.
- Write everything in English.
- Use the `contribute-data` skill to append or update entries.
