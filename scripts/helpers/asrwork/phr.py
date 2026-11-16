import sys, numpy as np, sherpa_onnx, subprocess
M='/tmp/claude-0/asr/models/sherpa-onnx-whisper-turbo/'
rec=sherpa_onnx.OfflineRecognizer.from_whisper(encoder=M+'turbo-encoder.int8.onnx', decoder=M+'turbo-decoder.int8.onnx', tokens=M+'turbo-tokens.txt', language='hi', task='transcribe', num_threads=4)
w=subprocess.run(['/home/user/tools/ffmpeg/bin/ffmpeg','-v','error','-i',sys.argv[1],'-ac','1','-ar','16000','-f','f32le','-'],capture_output=True,check=True).stdout
y=np.frombuffer(w,np.float32); ph=np.load(sys.argv[2])
for k,(a,b) in enumerate(ph,1):
    s=rec.create_stream(); s.accept_waveform(16000, np.concatenate([y[int(max(0,a-.08)*16000):int((b+.1)*16000)], np.zeros(16000*8,np.float32)])); rec.decode_stream(s)
    print('P%-2d %6.2f-%6.2f  %s'%(k,a,b,s.result.text.strip()), flush=True)
