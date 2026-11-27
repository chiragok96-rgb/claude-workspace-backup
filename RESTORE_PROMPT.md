# Starting a new Claude Code cloud session from this repo

1. Make sure GitHub is connected to the account (claude.ai → Settings → Connectors / https://claude.ai/connect-github).
2. Start a Claude Code **cloud** session with repository **`chiragok96-rgb/claude-workspace-backup`**, branch **`stage`**.
3. Paste this as the first message:

```
This repo is my film studio and its memory. Before anything else:
1) Run `bash scripts/bootstrap.sh --instruments` (add `--asr` too if I am about to send a new voiceover) and then `bash scripts/verify.sh --render` (it must end ALL GOOD; fix anything that fails).
2) Read CLAUDE.md (auto-loaded), then read CURRENT_STATE.md for the current project status and any pending work.
3) Treat them as my standing instructions, taste, workflow and lessons. Work only under /home/user, keep my existing work untouched,
   and commit/push to the `stage` branch.
4) The other knowledge files (CREATIVE_PREFERENCES.md, STYLE_INDEX.md, REPO_INDEX.md, PROVEN_WORKFLOWS.md, KNOWN_ERRORS.md) are
   read on demand — CLAUDE.md tells you when. memory/ is the legacy archive; it is still valid, read it when you need deep context.
5) Reply with a short summary: what was restored, which checks passed, the current film in progress (from CURRENT_STATE.md), and
   the 5 rules you consider most important. Then wait for my next request.
```

The "memory" is `CLAUDE.md` + the new knowledge files + `memory/` archive + the code itself: chats cannot move between sessions,
but this repo carries everything needed to work the same way.
