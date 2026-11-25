SG=${1:-4}
ffmpeg -hide_banner -y -i vo.mp3 -i sfx.wav -filter_complex "[0:a]aresample=48000,pan=stereo|c0=c0|c1=c0,volume=3.1dB,asplit=2[v][vk];[1:a]volume=${SG}dB[s];[s][vk]sidechaincompress=threshold=0.05:ratio=4:attack=20:release=380[sd];[v][sd]amix=inputs=2:normalize=0,atrim=0:55.56[m]" -map "[m]" -c:a pcm_s16le premix_nm.wav 2>/dev/null
I=$(ffmpeg -hide_banner -i premix_nm.wav -af ebur128 -f null - 2>&1 | grep -E "^\s+I:" | tail -1 | awk '{print $2}')
G=$(python3 -c "print(-14.0-($I))")
ffmpeg -hide_banner -y -i premix_nm.wav -af "volume=${G}dB,alimiter=limit=0.82:attack=3:release=60:level=disabled" -c:a pcm_s16le mix_nm.wav 2>/dev/null
ffmpeg -hide_banner -i mix_nm.wav -af ebur128=peak=true -f null - 2>&1 | grep -E "I:|Peak:" | tail -2
