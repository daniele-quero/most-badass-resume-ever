---
applyTo: "data/research.data.md"
---

# research.data.md instructions

This file lists academic and research experiences: activities during university and PhD, conferences, and published articles.

## Schema

One `##` section per experience. Each section must contain, in this order:

- `Description` — one to three sentences describing the activity or contribution.
- `Date` — indicative month and year (`MMM YYYY` or a range). Use `TBD` when unknown.
- `Institution` — hosting institution (optional; use `N/A` when not applicable).
- `Article title` — title of the associated published article (optional; use `N/A` or `TBD`).
- `Journal` — journal or venue name (optional; use `N/A` or `TBD`).
- `Article link` — public URL to the article, preprint, or record (optional; use `N/A` or `TBD`).

## Rules

- Use web fetch (INSPIRE-HEP, arXiv, DOI resolvers, publisher pages, institutional repositories) to look up article titles, journals and links before adding a publication entry.
- Do not fabricate titles, journals, or links. If a source cannot be confirmed, leave the field as `TBD`.
- One entry per article or per distinct activity.
- Write everything in English.
- Use the `contribute-data` skill to append or update entries.
