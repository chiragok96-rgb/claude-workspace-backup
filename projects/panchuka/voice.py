# Directed Odia narration on AI4Bharat Indic-TTS (FastPitch + HiFi-GAN, Odia, male speaker).
# FastPitch predicts, for every letter, how long it lasts and what pitch it carries. We intercept both before the
# decoder, so a line can be slowed, lowered, or given stressed words, a lifted question ending, a falling close.
import json, os, re, tempfile
import numpy as np, torch
from TTS.utils.synthesizer import Synthesizer
from TTS.tts.utils.helpers import sequence_mask

MD = '/tmp/claude-0/tts/model/or'
ST = 6.4          # semitones per model pitch unit (measured: +1 unit 129→188 Hz, −1 unit 129→90 Hz)
SR = 22050
HOP = 256


def _config():
    c = json.load(open(f'{MD}/fastpitch/config.json'))
    c['speakers_file'] = f'{MD}/fastpitch/speakers.pth'
    if isinstance(c.get('model_args'), dict) and 'speakers_file' in c['model_args']:
        c['model_args']['speakers_file'] = f'{MD}/fastpitch/speakers.pth'
    p = os.path.join(tempfile.gettempdir(), 'or_fastpitch_config.json'); json.dump(c, open(p, 'w'), ensure_ascii=False); return p


def norm_text(t):
    t = t.replace('ଡ଼', 'ଡ଼').replace('ଢ଼', 'ଢ଼')   # ଡ଼ ଢ଼ → the precomposed letters the model knows
    return re.sub(r'\s+', ' ', t).strip()


SYN = Synthesizer(tts_checkpoint=f'{MD}/fastpitch/best_model.pth', tts_config_path=_config(), tts_speakers_file=f'{MD}/fastpitch/speakers.pth',
                  vocoder_checkpoint=f'{MD}/hifigan/best_model.pth', vocoder_config=f'{MD}/hifigan/config.json', use_cuda=False)
M = SYN.tts_model
CTRL = {}      # set per render: 'dur' (T,), 'padd' (T,), 'pscale' float
LAST = {}      # filled per render: per-token frame durations


@torch.no_grad()
def _inference(x, aux_input={'d_vectors': None, 'speaker_ids': None}):
    g = M._set_speaker_input(aux_input)
    x_lengths = torch.tensor(x.shape[1:2]).to(x.device)
    x_mask = torch.unsqueeze(sequence_mask(x_lengths, x.shape[1]), 1).to(x.dtype).float()
    o_en, x_mask, g, _ = M._forward_encoder(x, x_mask, g)
    o_dr_log = M.duration_predictor(o_en.squeeze(), x_mask)
    o_dr = (torch.exp(o_dr_log) - 1) * x_mask * M.length_scale
    T = o_dr.shape[-1]
    if 'dur' in CTRL: o_dr = o_dr * torch.tensor(CTRL['dur'][:T], dtype=o_dr.dtype).view(1, 1, -1)
    for k, fr in CTRL.get('set', {}).items(): o_dr[..., k] = float(fr)          # exact pause lengths at commas
    o_dr[o_dr < 1] = 1.0; o_dr = torch.round(o_dr).squeeze(1)
    y_lengths = o_dr.sum(1)
    o_pitch = M.pitch_predictor(o_en, x_mask)
    LAST['pitch0'] = o_pitch.detach().numpy().ravel().copy()
    mean = o_pitch.mean()
    o_pitch = mean + (o_pitch - mean) * CTRL.get('pscale', 1.0)
    if 'padd' in CTRL: o_pitch = o_pitch + torch.tensor(CTRL['padd'][:T], dtype=o_pitch.dtype).view(1, 1, -1)
    if CTRL.get('targets') or CTRL.get('ramp'):
        p = o_pitch[0, 0].clone(); letters = torch.tensor(CTRL['letters'][:T]); ref = p[letters].median()
        for a, b, st in CTRL.get('targets', []):
            m = letters[a:b]; cur = p[a:b][m].mean(); p[a:b] = p[a:b] + (ref + st / ST - cur)
        for a, b, s0, s1 in CTRL.get('ramp', []):
            seg = p[a:b]; shape = (seg - seg.mean()) * .4; p[a:b] = ref + torch.linspace(s0, s1, b - a) ** 1 / ST + shape
        o_pitch = p.view(1, 1, -1)
    o_en = o_en + M.pitch_emb(o_pitch)
    if M.args.use_energy:
        o_energy_emb, _ = M._forward_energy_predictor(o_en, x_mask); o_en = o_en + o_energy_emb
    o_de, attn = M._forward_decoder(o_en, o_dr, x_mask, y_lengths, g=None)
    LAST['dur'] = o_dr.detach().numpy().ravel().copy(); LAST['pitch'] = o_pitch.detach().numpy().ravel().copy()
    return {'model_outputs': o_de, 'alignments': attn, 'pitch': o_pitch, 'energy': None, 'durations_log': o_dr_log}


M.inference = _inference


def tokens(text):
    return M.tokenizer.text_to_ids(text)


def span(text, sub, nth=0):
    """token index range [a, b) of the nth occurrence of sub in text"""
    i = -1
    for _ in range(nth + 1): i = text.index(sub, i + 1)
    a = len(tokens(text[:i])) if i > 0 else 0
    b = len(tokens(text[:i + len(sub)]))
    off = len(tokens(text)) - len(tokens(text))   # (tokenizer adds no bos/eos here; kept for clarity)
    return a + off, b + off


def render(text, rate=1.0, pitch=0.0, emph=(), end=None, cpause=()):
    """rate > 1 slower · pitch: whole-line offset (model units) · emph: [(word, semitones vs line median, stretch)]
    end: ('rise'|'fall', from_st, to_st) contour on the last word · cpause: exact seconds for successive commas"""
    text = norm_text(text); ids = tokens(text); n = len(ids)
    letters = np.array([ch not in ' ,।?' for ch in text], bool) if n == len(text) else np.ones(n, bool)
    dur = np.full(n, rate, np.float32); padd = np.full(n, pitch, np.float32); targets = []; ramp = []
    for e in emph:
        w, st, dm = e[:3]; nth = e[3] if len(e) > 3 else 0
        a, b = span(text, norm_text(w), nth); dur[a:b] *= dm
        if st is not None: targets.append((a, b, st))
    if end:
        kind, s0, s1 = end; lw = [m for m in re.finditer(r'[^\s,।?]+', text)][-1]
        a = len(tokens(text[:lw.start()])); b = len(tokens(text[:lw.end()]))
        ramp.append((a, b, s0, s1)); dur[a:b] *= 1.12 if kind == 'rise' else 1.06
    st_ = {}
    for k, sec in zip([i for i, ch in enumerate(text) if ch == ','], cpause):
        st_[k] = round(sec * SR / HOP)
        if k + 1 < n and text[k + 1] == ' ': st_[k + 1] = 1
    CTRL.clear(); CTRL.update(dur=dur, padd=padd, set=st_, targets=targets, ramp=ramp, letters=letters)
    wav = np.array(SYN.tts(text, speaker_name='male', split_sentences=False), np.float32)
    CTRL.clear()
    return wav, LAST['dur'].copy(), n
