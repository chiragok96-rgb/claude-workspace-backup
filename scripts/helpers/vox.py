import librosa, numpy as np
y, sr = librosa.load('audio/song.mp3', sr=22050)
H, P = librosa.effects.hpss(y, margin=3.0)
S = np.abs(librosa.stft(H, n_fft=2048, hop_length=256)); f = librosa.fft_frequencies(sr=sr, n_fft=2048)
band = S[(f > 250) & (f < 3500)]
env = librosa.onset.onset_strength(S=librosa.amplitude_to_db(band, ref=np.max), sr=sr, hop_length=256)
ons = librosa.onset.onset_detect(onset_envelope=env, sr=sr, hop_length=256, units='time', backtrack=True, delta=.08)
st = env.std()
for name, a, b in [('L1 jadu', 0, 4.5), ('L2 luniya/meetha', 4.5, 8.96), ('L3 amba', 8.96, 13.4), ('L4 mahani', 13.4, 17.86), ('C1 chagali', 17.86, 20.06), ('C2 kajala', 20.06, 22.29), ('C3 koyili', 22.29, 24.52), ('C4 kuhu', 24.52, 26.73), ('K kuni', 26.73, 31.18), ('P pahantiya', 31.18, 35.6), ('M chunmuni', 35.6, 40.05), ('H haladi', 40.05, 43.87)]:
    o = [x for x in ons if a <= x < b]
    strong = [x for x in o if env[int(x * sr / 256)] > 1.0 * st]
    print(f'{name:18s}', ' '.join(f'{x:.2f}' for x in o))
