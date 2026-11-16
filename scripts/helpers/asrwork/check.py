import json, sys, numpy as np, soundfile as sf, sherpa_onnx
from scipy.signal import resample_poly
M='/tmp/claude-0/asr/models/sherpa-onnx-whisper-turbo/'
rec=sherpa_onnx.OfflineRecognizer.from_whisper(encoder=M+'turbo-encoder.int8.onnx', decoder=M+'turbo-decoder.int8.onnx', tokens=M+'turbo-tokens.txt', language='hi', task='transcribe', num_threads=4)
y, sr = sf.read(sys.argv[1]); y = y.astype(np.float32)
if y.ndim > 1: y = y.mean(1)
y16 = resample_poly(y, 16000, sr).astype(np.float32)
W = json.load(open(sys.argv[2]))
for L in W['lines']:
    ws = [w for w in W['words'] if w['line'] == L['i']]; a, b = ws[0]['start'] - .1, ws[-1]['end'] + .15
    s = rec.create_stream(); s.accept_waveform(16000, np.concatenate([y16[int(a*16000):int(b*16000)], np.zeros(16000*8, np.float32)])); rec.decode_stream(s)
    print('%2d %5.2f  %s\n      heard: %s' % (L['i'], a, L['text'], s.result.text.strip()), flush=True)
