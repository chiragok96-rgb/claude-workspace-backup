# The performance: your script, line by line, with direction. Pitch numbers are model units (1 unit ≈ 6.4 semitones);
# rate > 1 is slower; emph = (word, pitch lift, stretch); pause = silence after the line, in seconds.
import sys, json, numpy as np, soundfile as sf
sys.path.insert(0, '/home/user/panchuka'); import voice as V

BASE = -.2      # the narrator's register: about 1.3 semitones below the model's natural voice
SCORE = [   # emph: (word, pitch in semitones vs the line's median, stretch) · end: (contour, from, to) in semitones
  # ¶1 storyteller: intrigue; a held comma after "it is said"
  dict(t='କୁହାଯାଏ, ପଞ୍ଚୁକର ପାଞ୍ଚ ଦିନ ବଗ ବି ମାଛ ଛୁଏଁ ନାହିଁ।', rate=1.06, cpause=[.42], emph=[('କୁହାଯାଏ', 1.5, 1.1), ('ବଗ ବି', 3.0, 1.25), ('ମାଛ', 1.0, 1.05)], end=('fall', 0, -3), pause=.95, mood='storyteller'),
  # ¶2 the twist: "…is not five days" stays up, suspended; then "four days" lands low and slow
  dict(t='କିନ୍ତୁ ଏ ବର୍ଷ ପଞ୍ଚୁକ ପାଞ୍ଚ ଦିନର ନୁହେଁ,', rate=1.03, emph=[('କିନ୍ତୁ', 2.5, 1.15), ('ପାଞ୍ଚ', 1.5, 1.08)], end=('rise', 2.0, 3.5), pause=.72, mood='twist'),
  dict(t='ଚାରି ଦିନର।', rate=1.22, pitch=-.05, emph=[('ଚାରି', 1.2, 1.08)], pause=1.05),   # weight from slowness and the pause before it (auditioned: clearest take)
  # ¶3 steady explanation (the dash is a held comma)
  dict(t='ପଞ୍ଚୁକ ହେଉଛି କାର୍ତ୍ତିକର ଶେଷ ପାଞ୍ଚ ଦିନ, ବଡ଼ ଏକାଦଶୀରୁ ପୂର୍ଣ୍ଣିମା।', rate=1.0, cpause=[.4], emph=[('ଶେଷ ପାଞ୍ଚ ଦିନ', 1.5, 1.1), ('ବଡ଼ ଏକାଦଶୀରୁ', 1.0, 1.04)], end=('fall', .5, -2.5), pause=.55, mood='explain'),
  dict(t='ଯିଏ ମାସ ସାରା ବ୍ରତ ରଖିପାରିନଥିଲା, ସେ ଏହି କେଇ ଦିନ ଆମିଷ ଛାଡ଼େ।', rate=1.0, cpause=[.3], emph=[('ବ୍ରତ', 1.2, 1.08), ('ଆମିଷ', .8, 1.1)], end=('fall', 0, -2.5), pause=.95),
  # ¶4 reverent: the five beshas in one breath, each name given its moment; the last is grandest
  dict(t='ଏହି ପାଞ୍ଚ ଦିନ, ମହାପ୍ରଭୁଙ୍କ ପାଞ୍ଚ ବେଶ, ଲକ୍ଷ୍ମୀନାରାୟଣ, ବାଙ୍କଚୂଡ଼ା, ତ୍ରିବିକ୍ରମ, ଲକ୍ଷ୍ମୀନୃସିଂହ, ଆଉ ପୂର୍ଣ୍ଣିମାରେ ରାଜରାଜେଶ୍ୱର।', rate=1.04, cpause=[.3, .45, .32, .32, .32, .38],
       emph=[('ମହାପ୍ରଭୁଙ୍କ', 2.0, 1.1), ('ଲକ୍ଷ୍ମୀନାରାୟଣ', 1.0, 1.06), ('ବାଙ୍କଚୂଡ଼ା', 1.0, 1.06), ('ତ୍ରିବିକ୍ରମ', 1.0, 1.08), ('ଲକ୍ଷ୍ମୀନୃସିଂହ', 1.0, 1.06), ('ପୂର୍ଣ୍ଣିମାରେ', .5, 1.05)], end=('fall', 2.5, -1.5), pause=1.1, mood='reverent'),
  # ¶5 tension, then loss
  dict(t='କିନ୍ତୁ ଏଥର ପାଞ୍ଜିରୁ ଦ୍ୱାଦଶୀ ତିଥି ହିଁ ହଜିଯାଇଛି।', rate=1.03, emph=[('କିନ୍ତୁ', 2.0, 1.12), ('ଦ୍ୱାଦଶୀ', 1.5, 1.1)], end=('fall', 2.5, -1.0), pause=.68, mood='tension'),
  dict(t='ଯେଉଁ ତିଥି କୌଣସି ସୂର୍ଯ୍ୟୋଦୟକୁ ଛୁଏଁ ନାହିଁ, ପାଞ୍ଜି ତାକୁ ଗଣେ ନାହିଁ।', rate=.99, cpause=[.3], emph=[('ସୂର୍ଯ୍ୟୋଦୟକୁ', 1.0, 1.06), ('ଗଣେ', .8, 1.1)], end=('fall', 0, -2.5), pause=.62),
  dict(t='ତେଣୁ ଦ୍ୱାଦଶୀର ବାଙ୍କଚୂଡ଼ା ବେଶ,', rate=1.06, emph=[('ବାଙ୍କଚୂଡ଼ା', 2.0, 1.12)], end=('rise', .5, 1.5), pause=.82),
  dict(t='ଏ ବର୍ଷ ହେବ ନାହିଁ।', rate=1.22, pitch=-.18, emph=[('ହେବ', -.5, 1.15)], end=('fall', -1.0, -3.5), pause=1.15, mood='loss'),
  # ¶6 consoling, wise
  dict(t='ମାସ ସାରା ପାରିନଥିଲେ ବି, ଶେଷ କେଇ ଦିନ ଯଥେଷ୍ଟ।', rate=1.04, pitch=-.05, cpause=[.32], emph=[('ଶେଷ କେଇ ଦିନ', 1.0, 1.06), ('ଯଥେଷ୍ଟ', 1.0, 1.12)], pause=.72, mood='consoling'),
  dict(t='ଆରମ୍ଭ କରିବାକୁ ଡେରି ହୁଏ ନାହିଁ,', rate=1.06, emph=[('ଡେରି', 1.5, 1.12)], end=('fall', .5, -.5), pause=.78),
  dict(t='କେବଳ ସମୟ କମିଯାଏ।', rate=1.2, pitch=-.18, emph=[('କେବଳ', 1.0, 1.1)], end=('fall', -.5, -3.0), pause=1.15),
  # ¶7 the gentle challenge, ending on a real question
  dict(t='ବଗ ଯଦି ପାଞ୍ଚ ଦିନ ପାରେ,', rate=1.06, emph=[('ପାଞ୍ଚ', 2.5, 1.18)], end=('rise', .5, 1.5), pause=.72, mood='challenge'),
  dict(t='ଆମେ ଚାରି ଦିନ ପାରିବା ନାହିଁ?', rate=1.08, emph=[('ଆମେ', 1.0, 1.08), ('ଚାରି', 3.0, 1.28)], end=('rise', 0, 5.0), pause=0),
]
LEAD, TAIL = .4, .9

def trim(w, thr_db=-40):
    e = np.convolve(w ** 2, np.ones(256) / 256, 'same'); db = 10 * np.log10(e + 1e-12); ref = db.max()
    on = np.where(db > ref + thr_db)[0]; a, b = max(0, on[0] - 220), min(len(w), on[-1] + 660)
    return w[a:b], a

import re, pyworld as pw
STF = lambda hz: 12 * np.log2(hz / 100.0)

def word_spans(text, dur, cut):
    fr = np.concatenate([[0], np.cumsum(dur)]) * V.HOP / V.SR - cut / V.SR; out = []
    for m in re.finditer(r'[^\s,।?]+', text):
        a = len(V.tokens(text[:m.start()])); b = len(V.tokens(text[:m.end()])); out.append((m.group(), max(0, fr[a]), fr[b]))
    return out

def measure(w, spans, L):
    x = w.astype(np.float64); f0, t = pw.harvest(x, V.SR, f0_floor=55, f0_ceil=350, frame_period=5); f0 = pw.stonemask(x, f0, t, V.SR)
    pm = lambda a, b: (lambda m: np.median(f0[m]) if m.sum() > 2 else np.nan)((t >= a) & (t <= b) & (f0 > 0))
    ref = pm(spans[0][1], spans[-1][2]); res = {}
    for j, e in enumerate(L.get('emph', [])):
        key = V.norm_text(e[0]).split(); k = [q for q in range(len(spans)) if spans[q][0].rstrip(',।?') == key[0]]
        if k and e[1] is not None: k = k[0]; res[('e', j)] = STF(pm(spans[k][1], spans[k + len(key) - 1][2])) - STF(ref)
    if L.get('end'):
        _, a, b = spans[-1]; m = (t >= a) & (t <= b) & (f0 > 0); s = f0[m]; n = len(s)
        if n > 6: res[('s0',)] = STF(np.median(s[:n // 3])) - STF(ref); res[('s1',)] = STF(np.median(s[-n // 3:])) - STF(ref)
    return res

def perform(L, passes=5, tol=.6):
    """render a line, measure it, correct the commands by the error, re-render: like notes between takes"""
    txt = V.norm_text(L['t']); emph = [list(e) for e in L.get('emph', [])]; end = list(L['end']) if L.get('end') else None; best = None
    for it in range(passes):
        w, dur, n = V.render(L['t'], rate=L.get('rate', 1.0), pitch=BASE + L.get('pitch', 0.0), emph=[tuple(e) for e in emph], end=tuple(end) if end else None, cpause=L.get('cpause', ()))
        w2, cut = trim(w); spans = word_spans(txt, dur, cut); res = measure(w2, spans, L)
        errs = {}
        for j, e in enumerate(L.get('emph', [])):
            if ('e', j) in res and not np.isnan(res[('e', j)]): errs[('e', j)] = e[1] - res[('e', j)]
        if end:
            for k, idx in (('s0',), 1), (('s1',), 2):
                if k in res and not np.isnan(res[k]): errs[k] = L['end'][idx] - res[k]
        worst = max([abs(v) for v in errs.values()] or [0])
        if best is None or worst < best[0]: best = (worst, w2, dur, cut, it)
        if worst < tol: break
        for k, v in errs.items():
            if k[0] == 'e': emph[k[1]][1] = float(np.clip(emph[k[1]][1] + .85 * v, L['emph'][k[1]][1] - 3, L['emph'][k[1]][1] + 3))
            else: idx = 1 if k[0] == 's0' else 2; end[idx] = float(np.clip(end[idx] + .85 * v, max(-4.0, L['end'][idx] - 3), L['end'][idx] + 3))   # never into the gravel
    return best

if __name__ == '__main__':
    out, words, t = [np.zeros(int(LEAD * V.SR), np.float32)], [], LEAD
    for i, L in enumerate(SCORE):
        worst, w, dur, cut, it = perform(L)
        print('   take %d, worst stress error %.1f st' % (it + 1, worst))
        # word timings from the model's own durations (frames of 256 samples)
        txt = V.norm_text(L['t']); fr = np.concatenate([[0], np.cumsum(dur)]) * V.HOP / V.SR - cut / V.SR
        for m in re.finditer(r'[^\s,।?]+', txt):
            a = len(V.tokens(txt[:m.start()])); b = len(V.tokens(txt[:m.end()]))
            words.append(dict(line=i, word=m.group(), start=round(t + max(0, fr[a]), 3), end=round(t + min(len(w) / V.SR, fr[b]), 3)))
        out.append(w.astype(np.float32)); t += len(w) / V.SR
        if L['pause']: out.append(np.zeros(int(L['pause'] * V.SR), np.float32)); t += L['pause']
        print('%2d %5.2fs + %.2fs  %s' % (i, len(w) / V.SR, L['pause'], L['t']))
    out.append(np.zeros(int(TAIL * V.SR), np.float32))
    y = np.concatenate(out); sf.write('/home/user/panchuka/raw_22k.wav', y, V.SR)
    json.dump(dict(lines=[dict(i=i, text=L['t'], mood=L.get('mood', '')) for i, L in enumerate(SCORE)], words=words), open('/home/user/panchuka/words.json', 'w'), ensure_ascii=False, indent=1)
    print('total %.2fs' % (len(y) / V.SR))
