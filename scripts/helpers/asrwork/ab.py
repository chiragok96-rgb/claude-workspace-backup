import sys, glob, os, numpy as np, soundfile as sf, sherpa_onnx
from scipy.signal import resample_poly
M='/tmp/claude-0/asr/models/sherpa-onnx-whisper-turbo/'
rec=sherpa_onnx.OfflineRecognizer.from_whisper(encoder=M+'turbo-encoder.int8.onnx', decoder=M+'turbo-decoder.int8.onnx', tokens=M+'turbo-tokens.txt', language='hi', task='transcribe', num_threads=4)
for f in sorted(glob.glob(sys.argv[1] + '/*.wav')):
    y, sr = sf.read(f); y16 = resample_poly(y, 16000, sr).astype(np.float32)
    s = rec.create_stream(); s.accept_waveform(16000, np.concatenate([np.zeros(1600, np.float32), y16, np.zeros(16000*8, np.float32)])); rec.decode_stream(s)
    print('%-16s heard: %s' % (os.path.basename(f)[:-4], s.result.text.strip()))
