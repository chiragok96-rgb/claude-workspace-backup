#!/usr/bin/env bash
# Install ONLY the skills from this repo - no films, audio, projects or deliverables.
# Idempotent: never overwrites a skill that is already present.
#   bash scripts/install-skills.sh            -> ~/.claude/skills
#   bash scripts/install-skills.sh <dir>      -> custom destination
set -euo pipefail
SRC="$(cd "$(dirname "$0")/.." && pwd)"
DEST="${1:-${HOME:-/home/user}/.claude/skills}"
mkdir -p "$DEST"
n=0
for s in "$SRC"/skills/*/; do
  name=$(basename "$s")
  if [ -e "$DEST/$name" ]; then
    echo "skip      $name  (already installed)"
  else
    cp -r "$s" "$DEST/"; echo "installed $name  ($(du -sh "$DEST/$name" | cut -f1))"
    n=$((n+1))
  fi
done
echo
echo "$n skill(s) installed to $DEST"
echo "Start a new Claude Code session (or reload) to pick them up."
