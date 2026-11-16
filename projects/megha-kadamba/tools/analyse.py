import librosa, numpy as np, json
y, sr = librosa.load('audio/song.mp3', sr=22050, mono=True)
dur = len(y)/sr
tempo, beats = librosa.beat.beat_track(y=y, sr=sr, units='time')
on = librosa.onset.onset_strength(y=y, sr=sr)
# harmonic/percussive + vocal-band energy
H, Pc = librosa.effects.hpss(y)
S = np.abs(librosa.stft(H, n_fft=2048, hop_length=512))
f = librosa.fft_frequencies(sr=sr, n_fft=2048)
voc = S[(f>300)&(f<3400)].sum(0); lo = S[f<250].sum(0)
rms = librosa.feature.rms(y=y, hop_length=512)[0]
tt = librosa.frames_to_time(np.arange(len(rms)), sr=sr, hop_length=512)
def sm(x,k=9): return np.convolve(x, np.ones(k)/k, 'same')
voc=sm(voc); rms=sm(rms)
print('dur %.2f tempo %s nbeats %d' % (dur, np.atleast_1d(tempo)[0], len(beats)))
print('beats', ' '.join('%.2f'%b for b in beats))
# 0.25s table
for t0 in np.arange(0, dur, 0.5):
    m=(tt>=t0)&(tt<t0+0.5)
    print('%5.1f rms %.3f voc %6.1f' % (t0, rms[m].mean(), voc[m].mean()), '#'*int(voc[m].mean()/voc.max()*40))
onsets = librosa.onset.onset_detect(y=y, sr=sr, units='time', backtrack=False)
json.dump({'dur':dur,'tempo':float(np.atleast_1d(tempo)[0]),'beats':[float(b) for b in beats],'onsets':[float(o) for o in onsets]}, open('audio/analysis.json','w'), indent=0)
