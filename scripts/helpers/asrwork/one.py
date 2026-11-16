import sys, json, numpy as np, soundfile as sf, sherpa_onnx
from scipy.signal import resample_poly
M='/tmp/claude-0/asr/models/sherpa-onnx-whisper-turbo/'
rec=sherpa_onnx.OfflineRecognizer.from_whisper(encoder=M+'turbo-encoder.int8.onnx', decoder=M+'turbo-decoder.int8.onnx', tokens=M+'turbo-tokens.txt', language='hi', task='transcribe', num_threads=4)
W = json.load(open('/home/user/panchuka/words.json')); ln = int(sys.argv[1]); ws = [w for w in W['words'] if w['line'] == ln]
for f in sys.argv[2:]:
    y, sr = sf.read(f); y = y.mean(1) if y.ndim > 1 else y; y16 = resample_poly(y, 16000, sr).astype(np.float32)
    for pad_a, pad_b, name in [(.1, .15, 'tight'), (.02, .5, 'own+tail'), (1.5, .3, 'with context')]:
        a, b = ws[0]['start'] - pad_a, ws[-1]['end'] + pad_b
        s = rec.create_stream(); s.accept_waveform(16000, np.concatenate([np.zeros(1600, np.float32), y16[int(a*16000):int(b*16000)], np.zeros(16000*8, np.float32)])); rec.decode_stream(s)
        print('%-16s %-13s %s' % (f.split('/')[-1], name, s.result.text.strip()))
