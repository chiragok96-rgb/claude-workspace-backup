"""Caption layer for video 2 (The Dream Home), reusing The Gate v2 caption system (film2/compose.py).
  python3 cap3.py <base_dir> <out_dir> <frames "a-b,c">   base frames: f_NNNNN.png (or s_TTTTT.png stills with --stills)"""
import os, sys, numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, "..", "film2"))
_argv = sys.argv; sys.argv = ["compose", "/tmp/_unused", "0"]
import compose as C
sys.argv = _argv
from compose import Block, blit, line_mask, inr, ss, cl, eo, W, H, SER6, CG6I, GOLD, IVORY
FPS = 30
CAPS = []
def cap(t0, t1, y, mode="sweep", glint=False, din=0.45, dout=0.3, **kw):
    CAPS.append((t0, t1, Block(**kw), y, dict(mode=mode, glint=glint, din=din, dout=dout)))
GREEN = (159, 208, 169)
cap(0.15, 1.72, 420, hero="ନିଜର ଗୋଟିଏ ଘର", size=88, label="A HOME OF YOUR OWN", dout=.25)
cap(1.80, 3.60, 420, hero="ସ୍ୱପ୍ନ କାହାର ବା ନଥାଏ?", size=82, accent="Everyone dreams of one.", accsize=52)
cap(3.85, 5.60, 400, hero="ଘର କିଣିବା କଥା ଆସିଲେ", size=74, label="WHEN IT COMES TO BUYING", dout=.2)
cap(5.85, 7.38, 400, mode="hard", hero="Home Loan", size=100, latin=CG6I, lscale=1.0, color=IVORY, dout=.12)
cap(7.40, 8.00, 400, mode="hard", hero="EMI", size=110, latin=CG6I, lscale=1.0, color=IVORY, dout=.1)
cap(8.02, 9.30, 400, mode="hard", hero="ଟଙ୍କାର ହିସାବ", size=92, label="AND ALL THE MONEY MATH")
cap(9.40, 10.40, 420, hero="କିନ୍ତୁ ଜାଣିଛନ୍ତି?", size=88, label="BUT DID YOU KNOW?", din=.3, dout=.2)
cap(10.45, 12.10, 420, hero="Government ର Scheme", size=78, label="A GOVERNMENT SCHEME", dout=.2)
cap(17.38, 18.75, 430, glint=True, hero="PMAY-Urban 2.0", size=118, latin=CG6I, lscale=1.0, color=GOLD, label="PRADHAN MANTRI AWAS YOJANA", din=.35)
cap(18.80, 22.30, 400, hero="ବାର୍ଷିକ Income ₹9 ଲକ୍ଷ ଭିତରେ", size=66, label="FAMILY INCOME UP TO 9 LAKH A YEAR")
cap(22.50, 24.85, 400, hero="ଘରର Value ₹35 ଲକ୍ଷ ଭିତରେ", size=68, label="HOUSE VALUE UP TO 35 LAKH")
cap(25.00, 27.45, 400, hero="Home Loan ₹25 ଲକ୍ଷ ଭିତରେ", size=68, label="HOME LOAN UP TO 25 LAKH")
cap(27.65, 29.95, 400, hero="ଏହି Scheme ଆପଣଙ୍କ କାମରେ ଆସିପାରେ", size=62, label="THIS SCHEME COULD BE FOR YOU", labcol=GREEN)
cap(30.15, 32.65, 400, hero="ନିଜର ପକ୍କା ଘର ନଥିବା", size=80, label="NO PUCCA HOUSE OF YOUR OWN")
cap(32.75, 35.35, 400, hero="ଅନ୍ୟ Eligibility Rules", size=76, label="PLUS THE SCHEME'S OTHER RULES")
cap(35.60, 37.20, 400, hero="Home Loan ନେବା ପୂର୍ବରୁ", size=76, label="BEFORE YOU TAKE THE LOAN")
cap(37.40, 40.75, 400, hero="Official Website · ନିଜ Bank", size=70, label="CHECK ONLINE AND AT YOUR BANK")
cap(40.95, 43.30, 410, glint=True, hero="Eligibility Check", size=108, latin=CG6I, lscale=1.0, color=GOLD, label="CHECK YOUR ELIGIBILITY FIRST")
cap(43.60, 46.40, 410, hero="କେବଳ ଟଙ୍କାର ହିସାବ ନୁହେଁ", size=74, label="IT IS NOT JUST MONEY MATH")
cap(46.70, 48.35, 410, glint=True, hero="ବର୍ଷ ବର୍ଷର ସ୍ୱପ୍ନ", size=96, color=GOLD, label="IT IS A DREAM OF YEARS")
cap(48.55, 51.70, 400, hero="ଚିହ୍ନାଜଣାରେ କେହି ଘରର ସ୍ୱପ୍ନ ଦେଖୁଛନ୍ତି?", size=58, label="SOMEONE YOU KNOW DREAMING OF A HOME?", dout=.25)
cap(52.00, 53.70, 430, hero="ଏହି Reel ଟି ତାଙ୍କୁ ପଠାନ୍ତୁ", size=74, label="SEND THIS REEL TO THEM", dout=.3)

def subsidy_block(v):
    return Block(hero_mask=line_mask("₹" + inr(int(v)), 150, latin=SER6, lscale=0.93), color=GOLD, accent="Interest Subsidy", accsize=60)

def captions(fr, t):
    if 12.10 <= t < 17.30:                                   # ₹1,80,000 counter on "ek lakh ashi hazar"
        v = 180000 * (1 - (1 - ss(12.15, 13.7, t)) ** 3); v = round(v / 1000) * 1000
        a = ss(12.10, 12.35, t) * (1 - ss(17.0, 17.3, t))
        blit(fr, subsidy_block(v), W / 2, 470, alpha=a, sweep=eo((t - 12.1) / .4), glint=cl((t - 13.8) / .6) if 13.8 < t < 14.4 else -1)
    for t0, t1, blk, y, o in CAPS:
        if t < t0 or t > t1: continue
        aout = 1 - ss(t1 - o["dout"], t1, t)
        if o["mode"] == "hard":
            k = eo((t - t0) / .12); blit(fr, blk, W / 2, y, alpha=k * aout, scale=1.06 - .06 * k)
        else:
            k = eo((t - t0) / o["din"]); g = cl((t - t0 - o["din"]) / .7) if o["glint"] and t - t0 > o["din"] else -1
            blit(fr, blk, W / 2, y, alpha=min(1, k * 1.4) * aout, sweep=k, dy=12 * (1 - k) - 6 * (1 - aout), glint=g if 0 <= g < 1 else -1)
    if 52.0 <= t < 53.7: C.send_icon(fr, ss(52.0, 52.3, t) * (1 - ss(53.4, 53.7, t)), 540, 300)
    C.end_card(fr, ss(53.75, 54.3, t) * (1 - ss(56.7, 57.1, t)))

if __name__ == "__main__":
    base, outd, spec = sys.argv[1:4]; stills = "--stills" in sys.argv; os.makedirs(outd, exist_ok=True)
    for name in sorted(os.listdir(base)):
        if not name.endswith(".png"): continue
        t = int(name[2:7]) / (100 if stills else FPS)
        fr = np.asarray(Image.open(os.path.join(base, name)).convert("RGB")).astype(np.float32).copy()
        captions(fr, t); Image.fromarray(np.clip(fr, 0, 255).astype(np.uint8)).save(os.path.join(outd, name[:-4] + ".jpg"), quality=95)
