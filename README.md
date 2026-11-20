# claude-workspace-backup (private)

Backup of a Claude Code **cloud workspace** used to produce code-made films: skills, Opuscar films, projects, scripts,
helper tools, source audio, and the final deliverables. Created from a live session; nothing was removed from the source.

| Path | What |
|---|---|
| `CLAUDE.md` | Owner's standing rules + toolchain facts. Copy to `~/CLAUDE.md` when restoring. |
| `RESTORE_PROMPT.md` | Paste-in first message for a new account. |
| `INSTALL.md` | Step-by-step restore + dependency installation. |
| `MANIFEST.md` | Pinned upstream commits, what is included/excluded, sizes. |
| `skills/huashu-art-motion/` | The installed Claude skill (v1.3.0). Restore to `~/.claude/skills/`. |
| `opuscar-overlay/films/` | Custom films that live inside the Opuscar clone (`bali-rap`, `bali-toon`). |
| `projects/*` | Standalone film projects: bali-yatra, harihara-besha, jadu-guni(+ext), jagannath-3d, megha-kadamba, panchuka(+reel), radha-pada(+darshan), bali-rap, bali-toon, bj-wind ("Kartika Wind": ribbon + real wind map + Saura crow; render film.js directly), balijatra-vo (Bali Jatra voiceover film: one-take shore → stone → earth → shadow play → fair; render with `film.js` via `?p=film`). |
| `third-party/` | Working copies of `alchaincyf/huashu-art-motion` and `zlhad/openvideoharness`. |
| `scripts/` | `bootstrap.sh` (restore), `verify.sh` (check), `helpers/` (ASR/prosody/one-off scripts). |
| `env/` | Exact package freezes (`pip freeze`) for the ASR, TTS and Opuscar venvs; plugin registry. |
| `inputs/audio/` | The owner's source songs / voiceovers. |
| `deliverables/` | Final share encodes + covers (Bali Jatra voiceover film, Bali Jatra rap). |

## Quick restore
```bash
git clone <this-repo> ~/claude-workspace-backup && cd ~/claude-workspace-backup
bash scripts/bootstrap.sh          # idempotent; never overwrites existing files
bash scripts/verify.sh
```
See `INSTALL.md` for details and optional heavy tiers (ASR / voice models).

## Not stored here (and why)
Secrets/tokens (none stored), `node_modules/`, venvs, ffmpeg binaries (re-downloaded), downloaded ML models
(`asr` 1.8 GB, `tts` 9.8 GB — reinstall per INSTALL.md), intermediate renders/frames, large `.mp4/.wav`
(re-renderable from source), third-party reference videos, and the raw chat transcript.
