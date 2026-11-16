import librosa, numpy as np
y, sr = librosa.load('audio/song.mp3', sr=22050)
tempo, beats = librosa.beat.beat_track(y=y, sr=sr, units='time')
print('dur %.2f tempo %.1f'%(len(y)/sr, np.atleast_1d(tempo)[0]))
print('beats', ' '.join('%.2f'%b for b in beats))
H,P=librosa.effects.hpss(y); S=np.abs(librosa.stft(H,n_fft=2048,hop_length=512)); f=librosa.fft_frequencies(sr=sr,n_fft=2048)
voc=S[(f>300)&(f<3400)].sum(0); rms=librosa.feature.rms(y=y,hop_length=512)[0]; tt=librosa.frames_to_time(np.arange(len(rms)),sr=sr,hop_length=512)
sm=lambda x,k=9:np.convolve(x,np.ones(k)/k,'same'); voc=sm(voc); rms=sm(rms)
for t0 in np.arange(0,len(y)/sr,0.5):
    m=(tt>=t0)&(tt<t0+.5); print('%5.1f rms %.3f %s'%(t0,rms[m].mean(),'#'*int(voc[m].mean()/voc.max()*40)))
