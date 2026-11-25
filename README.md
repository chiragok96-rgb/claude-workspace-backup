# claude-workspace-backup (private)

Backup of a Claude Code **cloud workspace** used to produce code-made films: skills, Opuscar films, projects, scripts,
helper tools, source audio, and the final deliverables. Created from a live session; nothing was removed from the source.

---

## ⭐ Just the skills (the usual case)

The skills are the portable part — they carry the know-how. Everything else (films, audio, deliverables)
is ~597 MB of output you do **not** need on a new account.

**Fast path — skills only, no big download:**
```bash
git clone --filter=blob:none --sparse https://github.com/chiragok96-rgb/claude-workspace-backup.git
cd claude-workspace-backup
git sparse-checkout set skills scripts
bash scripts/install-skills.sh          # -> ~/.claude/skills/
```
Then start a new Claude Code session. That's it — no Opuscar, no ffmpeg, no venvs.

**Already cloned the whole repo?** Just run `bash scripts/install-skills.sh`.

| Skill | Size | What it does |
|---|---|---|
| `skills/huashu-art-motion/` | 74 MB | Art & video animation (v1.3.0). 36 built styles + 16 research recipes, 9 explainer grammars, storyboard lint → QA → delivery gate. Needs the Opuscar stack for rendering (see INSTALL.md). |
| `skills/code-motion/` | 200 KB | Cinematic 3D & motion graphics from code. Blender-as-a-module (`pip install bpy`) + Cycles, headless Three.js, FFmpeg. Fast procedural geometry, a measured sun/sky rig, an engine-agnostic post-grade, and a worked example. Self-contained — no other setup. |

> Adding to a skill is the point. When a session discovers something that will matter next time
> (an API trap, a lighting rule, a measured constant), write it into the skill and push — not into chat.

---

## Full restore (only if you need the films too)

| Path | What |
|---|---|
| `CLAUDE.md` | Owner's standing rules + toolchain facts. Copy to `~/CLAUDE.md` when restoring. |
| `RESTORE_PROMPT.md` | Paste-in first message for a new account. |
| `INSTALL.md` | Step-by-step restore + dependency installation. |
| `MANIFEST.md` | Pinned upstream commits, what is included/excluded, sizes. |
| `skills/huashu-art-motion/` | The installed Claude skill (v1.3.0). Restore to `~/.claude/skills/`. |
| `opuscar-overlay/films/` | Custom films that live inside the Opuscar clone (`bali-rap`, `bali-toon`). |
| `projects/*` | Standalone film projects: bali-yatra, harihara-besha, jadu-guni(+ext), jagannath-3d, megha-kadamba, panchuka(+reel), radha-pada(+darshan), bali-rap, bali-toon. |
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


## PropertyKatha (Odisha property Instagram page)
See `propertykatha/HANDOFF.md` for the brief, Chirag's preferences, the toolchain, how to re-render, and the delivered videos.
