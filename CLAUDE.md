# CLAUDE.md — film studio entry point (auto-loaded every session)

This repo (`chiragok96-rgb/claude-workspace-backup`, branch **`stage`**) is the owner's code-made film studio.
We make short **vertical 9:16 Odia-culture reels** (Bali Jatra, Panchuka, Radha Pada Darshan, Manabasa Gurubara,
Jagannath lore, real-estate / property channel), always aiming for **virality**.
Work lives under `/home/user/` even though `HOME=/root`; always use absolute `/home/user/...` paths.

## Session start (do this every time)
1. `bash /home/user/claude-workspace-backup/scripts/bootstrap.sh`
2. `bash /home/user/claude-workspace-backup/scripts/verify.sh --render`  → must end `ALL GOOD`
3. Read `CURRENT_STATE.md` — project status, pending work, open issues.
4. Confirm briefly and wait for the owner's request.

## Read these files when doing this work
| File | Read when |
|---|---|
| `CURRENT_STATE.md` | session start; update after every delivery or feedback round |
| `CREATIVE_PREFERENCES.md` | concepting, reviewing feedback, choosing fonts/captions/transitions |
| `STYLE_INDEX.md` | choosing a style or engine for any line or scene |
| `REPO_INDEX.md` | something is missing, path is wrong, or setting up a new film |
| `PROVEN_WORKFLOWS.md` | producing (intake → timing → build → render → score → gate → deliver) |
| `KNOWN_ERRORS.md` | any error or unexpected result, before rendering Blender, before encoding |
| `memory/` | legacy archive (valid; do not delete; read individual files when deep context is needed) |

## 12 standing rules (always follow)
1. **Never install on the owner's local computer.** Cloud container only.
2. **Captions:** Cormorant Garamond 600 (50 px) + one gold italic accent (#f0c672, 56 px). Never childish fonts.
   For Odia in the picture: **Noto Sans Oriya 2.x** (not Serif Oriya 1.051 — it mis-renders conjuncts).
   Safe zone: top 250 px and bottom 450 px are clear; baselines y ≤ ~1470.  Rap films: no captions unless asked.
3. **Transitions:** one continuous camera; every scene becomes the next through a physical carrier (thread, light,
   shadow, doorway, eye, 2.5D tilt, dust wipe). No plain dissolves, no swipes, no pops.
4. **Metaphor for every voice line**, synced to the exact word. Content: classy, viral, loopable.
5. **Mix styles per line.** Never one style for a whole film. Never copy a previous film's look.
6. **Cheapest model that keeps quality.** Reuse existing code instead of rebuilding.
7. **References are references only.** Never copy another film's characters, art, music or layout.
8. **Do not delete or overwrite the owner's work.** New versions sit next to old ones.
9. **Deliver a finished video** (not a storyboard) when the owner says so. Be honest about flaws.
10. **No jabardasti (forced changes).** Decide independently; say when something should stay.
11. **Hook the first 10–20 s.** Nothing childish; people read as people; deities dignified.
12. **Every delivery:** stills → render → pop scan → mux −14 LUFS → gate → two-pass encode → SendUserFile →
    honest summary → back up to `projects/<film>` + `deliverables/` and push to `stage`.

## Maintenance protocol (keep knowledge current)
- After every delivery: update `CURRENT_STATE.md` (new deliverable, open items).
- After every feedback round: update `CURRENT_STATE.md`; add new lessons to `KNOWN_ERRORS.md` or `CREATIVE_PREFERENCES.md`.
- Each fact lives in exactly one file. Entries carry a date when time-sensitive.
- Also update `memory/07_lessons.md` and `memory/08_films_and_status.md` for the legacy archive.
- Commit with the session's attribution lines and push to `stage`.

## Toolchain quick reference
```
export PATH=/home/user/tools/ffmpeg/bin:$PATH; LIB=/home/user/lemomo-ai/lemo-opuscar
node $LIB/core/render/still.mjs <dir> <t...> --size 1080x1920 --out <dir>
node $LIB/core/render/video.mjs <dir> --fps 30 --size 1080x1920 --workers 3 --out x.mp4
sh $LIB/core/render/mux.sh video.mp4 mix.wav out.mp4 30 0
cd /home/user/.claude/skills/huashu-art-motion && uv run scripts/film_gate.py out.mp4
/home/user/bpyenv/bin/python build.py   # Srimandir: writes srimandir.blend (NOT seg.py)
```
Full commands and Blender pipeline: `PROVEN_WORKFLOWS.md`. Environment details: `REPO_INDEX.md`.
