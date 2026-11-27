#!/bin/bash
ST=/home/user/render-in/srimandir3fix4; mkdir -p $ST; cd /home/user/srimandir; P=/home/user/lemomo-ai/lemo-opuscar/.venv/bin/python; export PATH=/home/user/tools/ffmpeg/bin:$PATH
until [ $(ls $ST/m_* 2>/dev/null | wc -l) -ge 3 ] && grep -q "ALL DONE" fix7.log; do bash /home/user/claude-workspace-backup/scripts/tools/merge2.sh srimandir3 /home/user/srimandir/final3 /home/user/srimandir/chk3/f_00228.png $ST 37:render-srimandir4-p37 38:render-srimandir4-p38 39:render-srimandir4-p39 | grep -i mismatch; sleep 45; done
cp fix7/f_*.png final3/ && cp fix7/idx/f_*.png final3/idx/
for d in final3_hd final3_clean; do for i in $(seq 1566 1650); do rm -f $d/f_$(printf %05d $i).jpg; done; done
$P finish.py final3 final3_hd 1566 1650 >/dev/null 2>&1 & $P finish.py final3 final3_clean 1566 1650 clean >/dev/null 2>&1 & wait
for v in hd clean; do ffmpeg -v error -y -framerate 24 -i final3_$v/f_%05d.jpg -c:v libx264 -crf 14 -preset medium -pix_fmt yuv420p video3_$v.mp4; done
$P /home/user/claude-workspace-backup/scripts/tools/popscan.py video3_clean.mp4 2>&1 | sed -n 1,4p
L=/home/user/lemomo-ai/lemo-opuscar
for v in hd clean; do sh $L/core/render/mux.sh video3_$v.mp4 out/mix.wav final3_$v.mp4 24 0 > /dev/null 2>&1; done
(cd /home/user/.claude/skills/huashu-art-motion && uv run scripts/film_gate.py /home/user/srimandir/final3_hd.mp4 2>&1 | grep -E "结论|门禁")
cd /tmp/claude-0/-home-user-claude-workspace-backup/162e8fef-e282-5ed2-abcc-1ee0a64a54ac/scratchpad
for v in hd clean; do O=/home/user/claude-workspace-backup/deliverables/Srimandir_3D_v3$([ $v = clean ] && echo _no_text).mp4
  ffmpeg -v error -y -i /home/user/srimandir/final3_$v.mp4 -c:v libx264 -b:v 9M -pass 1 -pix_fmt yuv420p -an -f null /dev/null && ffmpeg -v error -y -i /home/user/srimandir/final3_$v.mp4 -c:v libx264 -b:v 9M -pass 2 -pix_fmt yuv420p -c:a aac -b:a 256k -movflags +faststart $O; ffprobe -v error -show_entries format=duration,size -of csv=p=0 $O; done
echo DELIVERY READY
