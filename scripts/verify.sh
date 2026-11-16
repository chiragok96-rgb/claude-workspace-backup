#!/usr/bin/env bash
# Check that the restored workspace is complete and usable.
H="${HOME:-/home/user}"; ok=1; chk(){ if eval "$2" >/dev/null 2>&1; then echo "ok   $1"; else echo "FAIL $1"; ok=0; fi; }
chk "skill huashu-art-motion"   "[ -f $H/.claude/skills/huashu-art-motion/SKILL.md ]"
chk "opuscar clone"             "[ -f $H/lemomo-ai/lemo-opuscar/AGENTS.md ]"
chk "film bali-rap (film.js)"   "[ -f $H/lemomo-ai/lemo-opuscar/films/bali-rap/film.js ]"
chk "project bali-yatra"        "[ -f $H/bali-yatra/film.js ]"
chk "node >= 20"                "node -e 'process.exit(+process.versions.node.split(\".\")[0]>=20?0:1)'"
chk "ffmpeg >= 7"               "$H/tools/ffmpeg/bin/ffmpeg -version | head -1 | grep -E 'version (n?[7-9]|n?[1-9][0-9])'"
chk "three installed"           "[ -d $H/lemomo-ai/lemo-opuscar/node_modules/three ]"
chk "opuscar venv"              "[ -x $H/lemomo-ai/lemo-opuscar/.venv/bin/python ]"
[ $ok = 1 ] && echo "ALL GOOD" || { echo "SOME CHECKS FAILED"; exit 1; }
