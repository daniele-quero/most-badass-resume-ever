---
applyTo: "data/academy.data.md"
---

# academy.data.md instructions

This file lists formal academic degrees (BS, MS, PhD, and equivalent).

## Schema

One `##` section per degree. Each section must contain, in this order:

- `Description` — a very short factual description (one or two sentences). Web fetch may be used to enrich the description with public information about the program.
- `Institution` — full institution name and location.
- `Score` — final score/grade (e.g. `110/110 cum laude`) or `N/A` if not applicable.
- `Date of achievement` — month and year in `MMM YYYY` format, or `TBD` if unknown.

## Rules

- One entry per degree. Do not merge multiple degrees into a single entry.
- Preserve degree titles and institution names exactly as written by the source.
- Descriptions must be factual and source-backed; do not fabricate coursework or specializations.
- Write everything in English.
- Use the `contribute-data` skill to append or update entries.
