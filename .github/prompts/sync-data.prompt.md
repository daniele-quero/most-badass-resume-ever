---
agent: agent
description: Fetch the public web sources and quickly retrieve news/updates for the relevant data/*.data.md files.
model: GPT-5.4 mini (copilot)
---

# Sync data files from web sources

Quickly check the authoritative public web sources for new or changed items and reconcile them into the matching `data/*.data.md` files. Only the data files whose source is a fetchable public URL are in scope.

## Sources in scope

| Target data file | Source URL |
| --- | --- |
| `data/gamefolio.data.md` | https://danioquero.itch.io/ |
| `data/repofolio.data.md` | https://github.com/daniele-quero?tab=repositories |

## Steps

1. For each row above, read the matching instruction file under `.github/instructions/<name>.instructions.md` and the current `data/<name>.data.md` end to end, using `read_file`.
2. Use `fetch_webpage` on the source URL to retrieve the current list of items (games / repositories), including title, description, and canonical link. For repositories, paginate/scroll if the profile lists more repos than a single page shows.
3. Diff the fetched items against the existing entries:
   - **New**: item present at the source but missing from the data file.
   - **Updated**: item present in both but with a changed description, link, or (for repos) last-updated info.
   - **Missing**: item in the data file but no longer present at the source — do NOT delete; report it for user review.
4. Apply additions and in-place updates through the `contribute-data` skill, following each file's schema exactly (English only, source-attributed, no fabrication, idempotent, non-destructive).
5. Re-read each edited file to confirm formatting and ordering are intact.

## Constraints

- Preserve titles and repository names exactly as shown at the source.
- Never invent descriptions or links; if a field cannot be confirmed, use `TBD`/`N/A` per the instruction file.
- Never delete existing entries automatically — surface removals to the user for approval.
- Do not touch data files whose source is not in the table above.

## Report

At the end, output a concise summary per source:

- Target file
- New entries added
- Entries updated (with which fields changed)
- Possible removals flagged for review
- Source URLs used
