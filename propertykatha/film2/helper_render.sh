#!/bin/bash
# PropertyKatha "The Gate" v2 - render one contiguous chunk of the Cycles land frames on a helper session.
#   bash propertykatha/film2/helper_render.sh <part> <frame-spec>        e.g.  bash ... 3 160-239
# Resumable: run it again after a timeout and it continues where it stopped.
# Output: branch render-gate-p<part> holding lossless chunks (libx264rgb -qp 0, bit-exact vs PNG) + per-frame JSON.
set -euo pipefail
PART="$1"; SPEC="$2"; CHECK=1560
ROOT="$(git rev-parse --show-toplevel)"; cd "$ROOT"
git fetch -q origin propertykatha-backup
if [ -d /tmp/pk_src ]; then (cd /tmp/pk_src && git checkout -q --detach FETCH_HEAD); else git worktree add -q --detach /tmp/pk_src FETCH_HEAD; fi
SRC=/tmp/pk_src/propertykatha/film2
PY=/home/user/bpyenv/bin/python
if [ ! -x "$PY" ]; then
  export PATH=/root/.local/bin:$PATH
  uv venv -q --python 3.11 /home/user/bpyenv && uv pip install -q --python "$PY" bpy==5.0.1 numpy
fi
OUT=/tmp/pk_frames_p$PART; mkdir -p "$OUT"
echo "rendering part $PART: $SPEC (+ check frame $CHECK)"
"$PY" "$SRC/anim.py" "$OUT" "$SPEC,$CHECK" 1.0 28 2>&1 | grep --line-buffered -E "FRAME|Error|Traceback" || true
# verify every frame exists
python3 - "$OUT" "$SPEC" <<'EOF'
import os, sys
out, spec = sys.argv[1], sys.argv[2]; need = []
for p in spec.split(","):
    a, b = (p.split("-") + [p])[:2]; need += range(int(a), int(b) + 1)
miss = [f for f in need if not os.path.exists(os.path.join(out, "f_%05d.png" % f))]
print("missing:", len(miss)); sys.exit(1 if miss else 0)
EOF
# pack: lossless chunks of 30 frames (stays under GitHub's 100 MB file limit)
PK=/tmp/pk_pack_p$PART; rm -rf "$PK"; mkdir -p "$PK"
cd "$OUT"; ls f_*.png | sort > /tmp/pk_list_$PART
split -l 30 -d -a 3 /tmp/pk_list_$PART /tmp/pk_grp_${PART}_
for g in /tmp/pk_grp_${PART}_???; do
  first=$(head -1 "$g" | sed 's/^f_0*\([0-9][0-9]*\)\.png$/\1/')
  SQ=/tmp/pk_seq_$PART; rm -rf "$SQ"; mkdir -p "$SQ"; i=0
  while read -r f; do ln -s "$OUT/$f" "$SQ/s_$(printf %05d $i).png"; i=$((i + 1)); done < "$g"
  ffmpeg -loglevel error -y -framerate 30 -i "$SQ/s_%05d.png" -frames:v "$i" -c:v libx264rgb -qp 0 -preset veryfast "$PK/chunk_$(printf %05d "$first").mkv"
  cp "$g" "$PK/chunk_$(printf %05d "$first").txt"
done
tar -cf "$PK/json.tar" -C "$OUT" $(cd "$OUT" && ls f_*.json)
cd "$PK"; git init -q; git checkout -q -b "render-gate-p$PART"
git add . && git -c user.name="render-helper" -c user.email="render-helper@users.noreply.github.com" commit -q -m "The Gate v2 render part $PART ($SPEC)"
git remote add origin "$(cd "$ROOT" && git remote get-url origin)"
for i in 1 2 3 4; do git push -q -f origin "render-gate-p$PART" && break || sleep $((i * 5)); done
echo "ALL DONE part $PART -> branch render-gate-p$PART"
