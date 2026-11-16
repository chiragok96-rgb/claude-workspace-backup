from faster_whisper import WhisperModel
import sys
m = WhisperModel('small', device='cpu', compute_type='int8')
for lang in ['bn','hi']:
    segs,_ = m.transcribe('audio/song.mp3', language=lang, word_timestamps=True, vad_filter=False, beam_size=5)
    print('==', lang)
    for s in segs:
        print('%6.2f-%6.2f %s' % (s.start, s.end, s.text))
        print('   ', ' '.join('%.2f:%s' % (w.start, w.word.strip()) for w in s.words))
