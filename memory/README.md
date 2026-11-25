# Project memory (read this folder at the start of every session)

This folder is the long-term memory of the film studio that lives in this repo. Chats do not carry over between sessions;
these files do. `CLAUDE.md` (repo root) is the entry point and is loaded automatically; it points here.

| File | Read when | Contents |
|---|---|---|
| [01_owner_profile.md](01_owner_profile.md) | always, first | who the owner is, how they talk, the 16 standing instructions, their taste, what they liked |
| [02_quality_bar.md](02_quality_bar.md) | before designing or delivering | format, captions, the transition standard, metaphor & word sync, characters, mandatory checks |
| [03_workflow.md](03_workflow.md) | when producing | intake → timing (ASR, word onsets) → concept → storyboard → build → stills → render → mix → pop scan → mux → gate → encode → deliver → backup, with exact commands |
| [04_environment.md](04_environment.md) | at session start / when something is missing | container layout (`/home/user` vs `HOME=/root`), repos & pins, skills, plugin, instruments, ASR, fonts, network limits |
| [05_styles_and_engines.md](05_styles_and_engines.md) | when choosing styles | every engine/style/transition machine we built and where its code is (reuse, don't rewrite) |
| [06_audio.md](06_audio.md) | when scoring | the `mix.py` template, synth instruments, ducking, loop wrap, sync rules |
| [07_lessons.md](07_lessons.md) | before every new film and every revision | rejected approaches and fixes, film by film |
| [08_films_and_status.md](08_films_and_status.md) | to know where things stand | film index, deliverables, the Manabasa v7 timeline, open items |

## New-session checklist (do this before anything else)
1. `bash /home/user/claude-workspace-backup/scripts/bootstrap.sh --instruments` (idempotent; add `--asr` when a new VO must be timed).
2. `bash /home/user/claude-workspace-backup/scripts/verify.sh --render` → must end with `ALL GOOD`.
3. Read `memory/01` → `02` → `07` → `08`; skim `03`–`06`.
4. Reply to the owner with a short confirmation (what is restored, latest film = Manabasa final v7) and wait for the next request.

## Keeping memory up to date
After every delivered film or significant feedback round, update `07_lessons.md` (what was rejected/accepted and why) and
`08_films_and_status.md` (deliverable name, status, open items); add new engines to `05`; new owner preferences to `01`.
Commit to branch `stage` with the attribution lines and push.
