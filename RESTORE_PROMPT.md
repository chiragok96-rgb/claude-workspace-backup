# Using this backup from any other Claude account

1. Connect GitHub on the new account (https://claude.ai/connect-github) and start a Claude Code cloud session with THIS repo selected.
2. Paste this as your first message:

> Restore my workspace from this repo. Read README.md, CLAUDE.md and INSTALL.md, run `bash scripts/bootstrap.sh`, then `bash scripts/verify.sh`.
> Treat CLAUDE.md as my standing rules and memory (styles, caption rules, transition rules, lessons). My skills are in `skills/`,
> my films in `projects/` and `opuscar-overlay/films/`, my songs in `inputs/audio/`. Confirm what was restored, then wait for my next film request.

The "memory" is `CLAUDE.md` (rules and lessons) plus the code itself: chats cannot move between accounts, but this repo carries everything needed to behave the same way.
