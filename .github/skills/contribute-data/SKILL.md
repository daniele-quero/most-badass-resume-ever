# contribute-data

Safe, structured additions and updates to any `data/*.data.md` file in this repository.

## When to use

Use this skill whenever an agent needs to add, extend, or correct content inside one of the data files under `data/`:

- `data/thisisme.data.md`
- `data/academy.data.md`
- `data/work.data.md`
- `data/research.data.md`
- `data/courses.data.md`
- `data/gamefolio.data.md`
- `data/repofolio.data.md`
- `data/skills.data.md`

Do NOT use this skill to edit source code, tests, configuration, or documentation outside `data/`.

## Pre-flight

1. Identify the exact target file under `data/` based on the type of information being contributed.
2. Read the matching instruction file under `.github/instructions/<name>.instructions.md` and follow its schema and rules literally.
3. Read the target data file end to end before proposing any change, so you can preserve existing structure and detect duplicates.
4. Gather sources:
   - For personal identity or personality traits, only accept explicit user confirmation.
   - For public data (games, repositories, courses, publications, institutions), use `fetch_webpage` on an authoritative public URL and record the source.

## Contribution rules

- Language: always write in English. Translate content when the source is not in English; keep proper nouns and titles as written.
- Idempotence: never create a duplicate entry. Match on the section heading (title/company/repository name/etc.) before appending. If a matching entry exists, update fields in place instead of adding a new section.
- Append semantics: new sections are appended at the end of the appropriate group, unless the target file explicitly defines an ordering (e.g. `work.data.md` orders most recent first — insert accordingly).
- Merge semantics: when updating an existing section, change only the specific fields that need updating and preserve every other line and its formatting.
- Schema fidelity: use exactly the field names, order, and formatting defined by the matching instruction file. Do not add fields that are not in the schema.
- Source attribution: for any factual claim derived from the web, include the source URL either inline or as a short parenthetical after the field it supports. For claims derived from a user interview, include a short parenthetical such as `(user interview, YYYY-MM-DD)`.
- No fabrication: if a required field cannot be sourced, write `TBD` (or `N/A` when the field does not apply) rather than inventing a value.
- No PII beyond the schema: never add phone numbers, physical addresses, personal emails, government IDs, or financial data to any data file.
- No destructive edits: do not delete previously confirmed content; propose a deletion to the user and only apply it after explicit approval.

## Workflow

1. Read `.github/instructions/<target>.instructions.md`.
2. Read the target `data/<target>.data.md`.
3. Draft the change as a minimal diff (append or in-place merge).
4. Show the diff and the sources to the user.
5. On confirmation, apply the diff using `replace_string_in_file` for surgical merges or by appending to the end of the file for new entries.
6. Re-read the file after the edit to verify formatting and ordering.

## Output

Return a short report containing:

- Target file path.
- Kind of change: `append` or `merge`.
- Number of entries added or updated.
- Sources used, as a bulleted list of URLs and/or interview references.
