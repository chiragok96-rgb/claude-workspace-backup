# Starting a new Claude Code cloud session from this repo

1. Make sure GitHub is connected to the account (claude.ai → Settings → Connectors / https://claude.ai/connect-github).
2. Start a Claude Code **cloud** session with repository **`chiragok96-rgb/claude-workspace-backup`**, branch **`stage`**.
3. Paste this as the first message:

```
This repo is my film studio and its memory. Before anything else:
1) Run `bash scripts/bootstrap.sh --instruments` and then `bash scripts/verify.sh --render` (it must end with ALL GOOD; fix anything that fails).
2) Read CLAUDE.md and every file in memory/ (start with memory/README.md; 01, 02, 07 and 08 carefully).
3) Treat them as my standing instructions, taste, workflow and lessons. Work only under /home/user, keep my existing work untouched,
   and commit/push to the `stage` branch.
4) Reply with a short summary: what was restored, which checks passed, the latest film and its status, and the 5 rules you consider
   most important for my videos. Then wait for my next request.
```

The "memory" is `CLAUDE.md` + `memory/` plus the code itself: chats cannot move between sessions, but this repo carries
everything needed to work the same way.
