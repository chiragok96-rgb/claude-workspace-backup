# claude-workspace-backup (private)

Backup of a Claude Code **cloud workspace** used to produce code-made films: skills, Opuscar films, projects, scripts,
helper tools, source audio, and the final deliverables. Created from a live session; nothing was removed from the source.

| Path | What |
|---|---|
| `CLAUDE.md` | **Central memory entry point**: owner's standing rules, session-start steps, toolchain facts (auto-loaded by Claude Code). |
| `memory/` | **Detailed project memory**: owner profile, quality bar, workflow, environment, styles/engines, audio, lessons, film status. Start at `memory/README.md`. |
| `.claude/settings.json` | Declares the Opuscar plugin marketplace (`lemomo-ai/lemo-opuscar`) and enables `lemo-opuscar@lemolab`. |
| `RESTORE_PROMPT.md` | Paste-in first message for a new session / account. |
| `INSTALL.md` | Step-by-step restore + dependency installation. |
| `MANIFEST.md` | Pinned upstream commits, what is included/excluded, sizes. |
| `skills/huashu-art-motion/` | The installed Claude skill (v1.3.0). Restore to `~/.claude/skills/`. |
| `opuscar-overlay/films/` | Custom films that live inside the Opuscar clone (`bali-rap`, `bali-toon`). |
| `projects/*` | Standalone film projects: bali-yatra, harihara-besha, jadu-guni(+ext), jagannath-3d, megha-kadamba, panchuka(+reel), radha-pada(+darshan), bali-rap, bali-toon, bj-wind ("Kartika Wind": ribbon + real wind map + Saura crow; render film.js directly), balijatra-vo (Bali Jatra voiceover film: one-take shore → stone → earth → shadow play → fair; render with `film.js` via `?p=film`), danga (Aa Ka Ma Bai / Boita Bandana), manabasa (Manabasa Gurubara, one-take, final v7). |
| `third-party/` | Working copies of `alchaincyf/huashu-art-motion` and `zlhad/openvideoharness`. |
| `scripts/` | `bootstrap.sh` (restore into `/home/user` + skills into `~/.claude`), `verify.sh` (check; `--render` renders a test frame), `tools/` (`popscan.py`, `contact_sheet.py`), `helpers/` (ASR/prosody/one-off scripts). |
| `env/` | Exact package freezes (`pip freeze`) for the ASR, TTS and Opuscar venvs; plugin registry; `user-settings.json` (plugin settings template). |
| `inputs/audio/` | The owner's source songs / voiceovers. |
| `deliverables/` | Final share encodes, covers and storyboards (latest: `Manabasa_Gurubara_final_v7.mp4`, `AaKaMaBai_BoitaBandana_final_v2.mp4`, `KartikaWind_BaliJatra_v3.mp4`, `BaliJatra_VO_final_v3.mp4`, rap). |

## Quick restore
```bash
# in a Claude Code cloud session this repo is already at /home/user/claude-workspace-backup (branch: stage)
bash scripts/bootstrap.sh                 # idempotent; never overwrites; add --instruments (audio libs) / --asr (timing) when needed
bash scripts/verify.sh --render           # must end with ALL GOOD
```
See `INSTALL.md` for details and optional heavy tiers (ASR / voice models).

## Not stored here (and why)
Secrets/tokens (none stored), `node_modules/`, venvs, ffmpeg binaries (re-downloaded), downloaded ML models
(`asr` 1.8 GB, `tts` 9.8 GB — reinstall per INSTALL.md), intermediate renders/frames, large `.mp4/.wav`
(re-renderable from source), third-party reference videos, and the raw chat transcript.
