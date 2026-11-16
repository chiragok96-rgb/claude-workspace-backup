import sys, numpy as np, soundfile as sf, sherpa_onnx, subprocess
M='/tmp/claude-0/asr/models/sherpa-onnx-whisper-turbo/'
lang=sys.argv[1] if len(sys.argv)>1 else 'hi'
rec=sherpa_onnx.OfflineRecognizer.from_whisper(encoder=M+'turbo-encoder.int8.onnx', decoder=M+'turbo-decoder.int8.onnx', tokens=M+'turbo-tokens.txt', language=lang, task='transcribe', num_threads=4, tail_paddings=int(sys.argv[2]) if len(sys.argv)>2 else -1)
w=subprocess.run(['/home/user/tools/ffmpeg/bin/ffmpeg','-v','error','-i','/home/user/harihara-besha/audio/voiceover.mp3','-ac','1','-ar','16000','-f','f32le','-'],capture_output=True,check=True).stdout
y=np.frombuffer(w,np.float32)
phr=[(0.12,4.18),(4.66,5.89),(6.26,7.57),(7.93,9.34),(9.68,10.78),(11.16,14.20),(14.54,16.26),(16.62,17.09),(17.47,21.33),(21.69,23.28),(23.53,24.96),(25.22,26.08),(26.32,26.91),(27.24,30.03),(30.26,32.49),(32.82,35.23),(35.57,37.80),(38.17,41.18),(41.64,44.40)]
for k,(a,b) in enumerate(phr,1):
    s=rec.create_stream(); s.accept_waveform(16000, np.concatenate([y[int((a-.12)*16000):int((b+.12)*16000)], np.zeros(16000*8, np.float32)])); rec.decode_stream(s)
    print('P%-2d %5.2f-%5.2f  %s'%(k,a,b,s.result.text.strip()), flush=True)
