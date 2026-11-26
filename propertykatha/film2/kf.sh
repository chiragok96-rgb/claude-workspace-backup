#!/bin/bash
# half-res storyboard keyframes for the 3D beats
cd "$(dirname "$0")"
C="SUNROT=335 ELEV=6 HAZE_D=0.0004 CARD=2500 EXPO=-0.45 FILL=0.15"
run(){ env $C $1 /home/user/bpyenv/bin/python land.py $2 look/kf/h_$3.png 0.5 48 >/dev/null 2>&1
  python3 /home/user/claude-workspace-backup/skills/code-motion/scripts/grade.py look/kf/h_$3.png look/kf/g_$3.jpg bloom=0.22 halo=0.4 vig=0.3 contrast=0.2 sat=1.1 warm=0.07 grain=0.008 >/dev/null; echo "$3 done"; }
run "GATE_OPEN=-1" road b1
run "GATE_OPEN=-1 SUNROT=60 ELEV=28" road b2
run "GATE_OPEN=0.3" slam b3
run "GATE_OPEN=0 SUNROT=340 ELEV=8 EXPO=-0.7" hook b4
run "GATE_OPEN=0" aerial b5
run "GATE_OPEN=1" open b12
run "GATE_OPEN=1 HOUSE=1" house b13
