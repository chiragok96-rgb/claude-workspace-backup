"""Odia words -> neon tube centrelines. The browser shapes and renders each word (data/glyph_0.jpg, one word per row);
here: threshold, skeletonize, trace the skeleton graph into paths, prune spurs, simplify, smooth -> data/neon_odia.json.
Units: metres on the sign (word height ~1 m), x right, y up, origin at the word's left baseline."""
import json, os, numpy as np
from PIL import Image
from skimage.morphology import skeletonize
from scipy.ndimage import binary_dilation
HERE = os.path.dirname(os.path.abspath(__file__)); D = os.path.join(HERE, '..', 'data')
WORDS = ['ବାଲିଯାତ୍ରା', 'କଟକ', 'ଓଡ଼ିଶାର', 'ପ୍ରାଣ', 'ଶୁଏ?', 'ମେଳା']
img = np.asarray(Image.open(os.path.join(D, 'glyph_0.jpg')).convert('L')) > 128
NB = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]
def rdp(P, eps):
    if len(P) < 3: return P
    a, b = np.array(P[0]), np.array(P[-1]); d = b - a; L = np.hypot(*d) or 1e-9
    dist = [abs(d[1] * (p[0] - a[0]) - d[0] * (p[1] - a[1])) / L for p in P]; k = int(np.argmax(dist))
    return rdp(P[:k + 1], eps)[:-1] + rdp(P[k:], eps) if dist[k] > eps else [P[0], P[-1]]
def chaikin(P, n=2, closed=False):
    for _ in range(n):
        Q = [P[0]] if not closed else []
        for i in range(len(P) - (0 if closed else 1)):
            a, b = np.array(P[i]), np.array(P[(i + 1) % len(P)]); Q += [list(.75 * a + .25 * b), list(.25 * a + .75 * b)]
        if not closed: Q.append(P[-1])
        P = Q
    return P
out = {}
for wi, word in enumerate(WORDS):
    y0, y1 = 260 + wi * 310 - 240, 260 + wi * 310 + 70
    m = img[max(0, y0):y1]
    m = binary_dilation(m, iterations=1)
    sk = skeletonize(m)
    pts = set(zip(*np.nonzero(sk)))
    deg = {p: sum((p[0] + a, p[1] + b) in pts for a, b in NB) for p in pts}
    nodes = {p for p, d in deg.items() if d != 2}
    used = set(); paths = []
    def walk(a, b):
        path = [a, b]; used.add((a, b)); used.add((b, a)); prev, cur = a, b
        while cur not in nodes:
            nx = [(cur[0] + i, cur[1] + j) for i, j in NB if (cur[0] + i, cur[1] + j) in pts and (cur[0] + i, cur[1] + j) != prev and ((cur, (cur[0] + i, cur[1] + j)) not in used)]
            if not nx: break
            n = nx[0]; used.add((cur, n)); used.add((n, cur)); path.append(n); prev, cur = cur, n
            if n == a: break
        return path
    for a in nodes:
        for i, j in NB:
            b = (a[0] + i, a[1] + j)
            if b in pts and (a, b) not in used: paths.append(walk(a, b))
    # pure loops (no nodes): e.g. a closed ring
    rest = [p for p in pts if all(((p, (p[0] + i, p[1] + j)) in used) or ((p[0] + i, p[1] + j) not in pts) for i, j in NB) is False]
    for p in pts:
        if p in nodes: continue
        nbr = [(p[0] + i, p[1] + j) for i, j in NB if (p[0] + i, p[1] + j) in pts]
        if any((p, q) not in used for q in nbr): nodes.add(p); paths.append(walk(p, [q for q in nbr if (p, q) not in used][0]))
    strokes = []
    for P in paths:
        if len(P) < 14: continue       # spur
        Q = [[c, -(r + max(0, y0) - (260 + wi * 310))] for r, c in P]   # x, y-up relative to baseline (px)
        Q = rdp(Q, 1.2); Q = chaikin(Q, 2)
        strokes.append([[round(x / 200, 4), round(y / 200, 4)] for x, y in Q])   # 200 px = 1 m
    xs = [p[0] for s in strokes for p in s]; x0 = min(xs)
    strokes = [[[round(x - x0, 4), y] for x, y in s] for s in strokes]
    out[word] = {'strokes': strokes, 'w': round(max(xs) - x0, 3)}
    print(word, len(strokes), 'strokes', 'w', out[word]['w'])
json.dump(out, open(os.path.join(D, 'neon_odia.json'), 'w'), ensure_ascii=False)
