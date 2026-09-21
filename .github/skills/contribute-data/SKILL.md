---
name: contribute-data
description: Add, update, correct, or sync structured resume-profile data in data/*.data.md. Invoke for compact chat requests such as "add React to skills", "aggiungi esperienza ACME", "sync GitHub repos", or "update my degree"; never use it for source code or non-data documentation.
---

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

## Compact chat activation

Invoke this skill immediately when a short chat message clearly asks to maintain resume-profile data, even when it does not name a file. Treat the following as activation phrases, in English or Italian:

- Add, update, correct, remove, refresh, import, sync, or reconcile profile/resume/CV data.
- `add <technology> to skills`, `add my <degree>`, `add experience at <company>`, `add my <course>`, `add <game>`, `add <repository>`, or `add <publication>`.
- `aggiungi <tecnologia> alle skill`, `aggiungi esperienza in <azienda>`, `aggiorna il mio titolo`, `sincronizza repo GitHub`, `importa corso`, or `correggi il profilo`.

Resolve an omitted target from the subject of the message:

| Subject | Target |
| --- | --- |
| identity, bio, preferences, personality | `thisisme.data.md` |
| degree, university, school, academic qualification | `academy.data.md` |
| job, role, employer, professional experience | `work.data.md` |
| publication, paper, research activity | `research.data.md` |
| course, certification, training | `courses.data.md` |
| game, itch.io release | `gamefolio.data.md` |
| GitHub repository, open-source project | `repofolio.data.md` |
| technology, competency, soft skill | `skills.data.md` |

If the request identifies more than one target, handle each target independently. If the subject does not map unambiguously to one target, ask one focused clarification question before reading or editing data. Do not infer factual details that the compact message does not supply.

### Compact request examples

| Chat request | Action |
| --- | --- |
| `Add TypeScript to my skills` | Invoke this skill and update `data/skills.data.md`. |
| `aggiungi esperienza in ACME` | Invoke this skill and prepare a contribution for `data/work.data.md`; ask only for fields required by its schema that are missing. |
| `sync my GitHub repos` | Invoke this skill and reconcile `data/repofolio.data.md` from authoritative public sources. |
| `Update the navbar component` | Do not invoke this skill; this is a source-code request. |

## Pre-flight

1. Identify the exact target file under `data/` based on the type of information being contributed.
2. Read the matching instruction file under `.github/instructions/<name>.instructions.md` and follow its schema and rules literally.
3. Read the target data file end to end before proposing any change, so you can preserve existing structure and detect duplicates.
4. Gather sources:
   - For personal identity or personality traits, only accept explicit user confirmation.
   - For public data (games, repositories, courses, publications, institutions), use `fetch_webpage` on an authoritative public URL and record the source.
   - For compact messages that lack a required schema field, ask only for that missing field; never fill it by assumption.

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
5. On confirmation, apply the diff with the repository's available surgical file-editing mechanism or append a new entry as appropriate.
6. Re-read the file after the edit to verify formatting and ordering.

## Output

Return a short report containing:

- Target file path.
- Kind of change: `append` or `merge`.
- Number of entries added or updated.
- Sources used, as a bulleted list of URLs and/or interview references.
