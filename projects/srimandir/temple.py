# Srimandir, procedurally: rekha deula (vimana), pidha deulas (jagamohana, bhogamandapa), natamandapa, shrines, walls, gates, steps,
# rosaghara. All courses are separate objects so they can be laid stone upon stone. Real proportions: the vimana is 65 m (214 ft).
import bpy, math, random
from geo import *

TER = 3.0            # the inner terrace (Kurmabedha compound) is 3 m above the outer compound (the 22 steps climb it)

def side_offsets():
    """saptaratha: (y0, y1, projection) along one face, as fractions of the half-width, centre → corner, with recessed notches"""
    core = [(0, .2, .17), (.23, .40, .105), (.43, .60, .05), (.63, 1.0, 0.)]   # deep pagas: strong vertical ribs
    out = []; prev = 0
    for a, b, p in core:
        if a > prev: out.append((prev, a, -.03))
        out.append((a, b, p)); prev = b
    return out

SEGS = side_offsets()
def plan(w, k=1.0, depth=1.0):
    """CCW saptaratha plan with half-width w; k scales the projections (1 at the bada, smaller up the gandi)"""
    pts = []
    side = []   # along the +x face, y from -w to +w
    segs = [(-b, -a, p) for a, b, p in reversed(SEGS)] + [(a, b, p) for a, b, p in SEGS]
    for a, b, p in segs:
        x = w * (1 + p * k * depth); side += [(x, a * w * (1 + 0 * p)), (x, b * w)]
    # merge into a closed CCW polygon by rotating the face to all four sides (corner kanika meets kanika)
    for r in range(4):
        c, s = math.cos(r * math.pi / 2), math.sin(r * math.pi / 2)
        for x, y in side: pts.append((x * c - y * s, x * s + y * c))
    # drop duplicate consecutive points
    clean = []
    for p in pts:
        if not clean or abs(p[0] - clean[-1][0]) + abs(p[1] - clean[-1][1]) > 1e-6: clean.append(p)
    if abs(clean[0][0] - clean[-1][0]) + abs(clean[0][1] - clean[-1][1]) < 1e-6: clean.pop()
    return clean

def clip(poly, axis, lo, hi):
    """clip a polygon to lo <= coord[axis] <= hi (Sutherland–Hodgman, two half-planes)"""
    def half(P, keep, val):
        out = []
        for i in range(len(P)):
            a, b = P[i], P[(i + 1) % len(P)]; ia, ib = keep(a[axis]), keep(b[axis])
            if ia: out.append(a)
            if ia != ib:
                t = (val - a[axis]) / (b[axis] - a[axis]); out.append((a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])))
        return out
    P = half(poly, lambda v: v >= lo, lo)
    return half(P, lambda v: v <= hi, hi) if len(P) > 2 else []

def rib_amalaka(n=36, depth=.11):
    return lambda th, z: 1 - depth * (0.5 - 0.5 * math.cos(n * th)) ** 2

# ———————————— the rekha deula ————————————
H_PITHA, H_BADA, H_GANDI = 2.4, 17.0, 52.0
def gandi_w(z, w0):
    u = (z - H_BADA) / (H_GANDI - H_BADA); return w0 * (1 - .50 * u ** 2.3)   # convex: straight low, rounding into the shoulder

def vimana(mats, C, cx=0., cy=0., w0=11.5, z0=TER, t0=7.6, t_bada=9.8, t_top=14.05, blocks=True):
    """returns the list of (object, arrival time) — the deula built stone upon stone"""
    stone = mats['stone']; out = []
    def course(name, poly, za, zb, t, mat=stone, extra=None, bev=.05):
        V, Fc = prism(poly, za, zb)
        if extra: V, Fc = merge([(V, Fc)] + extra)
        ob = mesh_obj(name, [(x + cx, y + cy, z) for x, y, z in V], Fc, mat, C); bevel(ob, bev, 2); out.append((ob, t)); return ob
    # pitha (platform with mouldings)
    zz = z0; prof_p = [(w0 * 1.22, .5), (w0 * 1.18, .4), (w0 * 1.2, .5), (w0 * 1.15, .5), (w0 * 1.13, .5)]
    n_bada = 0
    # the first courses of the bada are laid as separate blocks (stone upon stone, close up), then whole courses
    bada_prof = []
    z = zz
    for k, (w, h) in enumerate(prof_p): bada_prof.append(('pitha', w, z, z + h, 1.25)); z += h
    zb = z
    # pabhaga mouldings (khura, kumbha, pata, kani, basanta): alternating swellings, then the plain jangha, the baranda mouldings
    mould = [1.06, 1.0, 1.045, .985, 1.03, 1.0]
    while z < z0 + H_BADA - .3:
        i = len(bada_prof)
        rel = (z - zb) / (z0 + H_BADA - zb)
        f = mould[i % len(mould)] if rel < .18 else (1.0 if rel < .78 else [1.035, .99, 1.05][i % 3])
        bada_prof.append(('bada', w0 * f, z, z + .6, 1.0)); z += .6
    nb = len(bada_prof)
    for i, (kind, w, za, zb_, k) in enumerate(bada_prof):
        t = t0 + (t_bada - t0) * (i / nb) ** 1.35
        poly = plan(w, k)
        if blocks and i < 5:          # individual blocks, alternating bond
            ax = i % 2; strips = 7; lo = -w * 1.3; step = 2 * w * 1.3 / strips
            for j in range(strips):
                part = clip(poly, ax, lo + j * step + .02, lo + (j + 1) * step - .02)
                if len(part) < 3: continue
                tj = t + (j - strips / 2) * .055 if i > 0 else t0 + j * .14
                course(f'v_{kind}{i}_{j}', part, za, zb_ - .015, tj, bev=.04)
        else:
            course(f'v_{kind}{i}', poly, za, zb_ - .012, t)
    # gandi: the curve, the bhumi-amalakas at the corners every 7 m
    z = z0 + H_BADA; i = 0; n_g = int((H_GANDI - H_BADA) / .55)
    while z < z0 + H_GANDI - .2:
        zr = z - z0; w = gandi_w(zr + .275, w0); kk = 1 - .45 * (zr - H_BADA) / (H_GANDI - H_BADA)
        extra = []
        bh = (zr - H_BADA) % 5.5
        if bh < .55 and zr > H_BADA + 3:   # bhumi-amalaka on the four kanika corners
            for sx in (-1, 1):
                for sy in (-1, 1):
                    r = w * .19; extra.append(lathe([(r * .55, 0), (r, .18), (r * 1.02, .3), (r, .42), (r * .55, .55)], 24, rib_amalaka(16, .14), sx * w * .86, sy * w * .86, z))
        t = t_bada + (t_top - t_bada) * (i / n_g) ** 1.15
        course(f'v_gandi{i}', plan(w * (1.028 if bh < .55 and zr > H_BADA + 3 else 1.0), kk), z, z + .55 - .012, t, extra=extra or None, bev=.045)   # bhumi bands
        z += .55; i += 1
    # mastaka: beki (neck), amalaka (ribbed disc), khapuri (cap), kalasha, ayudha (the Nilachakra) and the flags
    zt = z0 + H_GANDI; wt = gandi_w(H_GANDI, w0)
    beki = lathe([(wt * .78, 0), (wt * .72, .6), (wt * .7, 1.7), (wt * .78, 2.2)], 32)
    ob = mesh_obj('v_beki', [(x + cx, y + cy, z + zt) for x, y, z in beki[0]], beki[1], stone, C, smooth=True); out.append((ob, t_top + .1))
    am = lathe([(wt * .75, 0), (wt * .98, .35), (wt * 1.18, .95), (wt * 1.25, 1.55), (wt * 1.22, 2.1), (wt * 1.05, 2.7), (wt * .7, 3.2), (wt * .62, 3.5)], 192, rib_amalaka(72, .055))
    ob = mesh_obj('v_amalaka', [(x + cx, y + cy, z + zt + 2.2) for x, y, z in am[0]], am[1], stone, C, smooth=True); out.append((ob, t_top + .3))
    kh = lathe([(wt * .5, 0), (wt * .52, .35), (wt * .44, 1.0), (wt * .26, 1.6), (.2, 2.0)], 64)
    ob = mesh_obj('v_khapuri', [(x + cx, y + cy, z + zt + 5.7) for x, y, z in kh[0]], kh[1], stone, C, smooth=True); out.append((ob, t_top + .5))
    ka = lathe([(.25, 0), (.9, .3), (1.25, .9), (1.2, 1.4), (.7, 1.8), (.45, 2.0), (.6, 2.2), (.35, 2.5), (.08, 2.8)], 48)
    ob = mesh_obj('v_kalasha', [(x + cx, y + cy, z + zt + 7.8) for x, y, z in ka[0]], ka[1], mats['kalasha'], C, smooth=True); out.append((ob, t_top + .7))
    top = z0 + H_GANDI + 10.6
    return out, top, wt

def nilachakra(mats, C, cx, cy, z, R=1.75):
    """the eight-metal wheel: rim, hub, eight spokes with petals, standing in the east–west plane, on a short staff"""
    parts = []
    def torus(R, r, seg=96, rs=12):
        V, Fc = [], []
        for i in range(seg):
            a = 2 * math.pi * i / seg
            for j in range(rs):
                b = 2 * math.pi * j / rs; V.append(((R + r * math.cos(b)) * math.cos(a), r * math.sin(b), (R + r * math.cos(b)) * math.sin(a)))
        for i in range(seg):
            for j in range(rs): Fc.append((i * rs + j, i * rs + (j + 1) % rs, ((i + 1) % seg) * rs + (j + 1) % rs, ((i + 1) % seg) * rs + j))
        return V, Fc
    parts += [torus(R, .11), torus(R * .9, .05), torus(R * .32, .08)]
    for k in range(8):   # spokes (tapered bars in the wheel's plane) and a lotus-bud ornament between each pair
        a = k * math.pi / 4; ca, sa = math.cos(a), math.sin(a); V, Fc = [], []
        for i in range(9):
            sr = .3 * R + (.9 * R - .3 * R) * i / 8; w = .05 + .035 * math.sin(math.pi * i / 8) ** 2
            for (dy, dz) in ((-w, -w * .7), (w, -w * .7), (w, w * .7), (-w, w * .7)):
                px_, pz_ = sr, dz; V.append((px_ * ca - pz_ * sa, dy, px_ * sa + pz_ * ca))
        for i in range(8):
            for j in range(4): Fc.append((i * 4 + j, i * 4 + (j + 1) % 4, (i + 1) * 4 + (j + 1) % 4, (i + 1) * 4 + j))
        parts.append((V, Fc))
        a2 = a + math.pi / 8; pv, pf = lathe([(0, -.1), (.1, -.06), (.14, .04), (.07, .14), (0, .18)], 12)
        pv = [(px + R * .72 * math.cos(a2), pz * .5, py + R * .72 * math.sin(a2)) for px, py, pz in pv]; parts.append((pv, pf))
    hub = lathe([(.0, -.18), (.22, -.15), (.3, 0), (.22, .15), (0, .18)], 24); hub = ([(x, z, y) for x, y, z in hub[0]], hub[1]); parts.append(hub)
    V, Fc = merge(parts)
    ob = mesh_obj('nilachakra', [(x + cx, y + cy, zz + z + R + .6) for x, y, zz in V], Fc, mats['chakra'], C, smooth=True)
    staff = boxv(-.09, -.09, 0, .09, .09, R + .7); s = mesh_obj('chakra_staff', [(x + cx, y + cy, zz + z) for x, y, zz in staff[0]], staff[1], mats['chakra'], C)
    pole = lathe([(.07, 0), (.06, 10.0), (.03, 10.3)], 12); p = mesh_obj('flag_pole', [(x + cx, y + cy, zz + z + 2 * R + .9) for x, y, zz in pole[0]], pole[1], mats['wood'], C, smooth=True)
    return ob, s, p, z + 2 * R + .9

def flag(mats, C, name, x, y, z, L=7.0, Hh=2.6, mat='flag', segs=(28, 8)):
    """a triangular cloth flag hung from a pole top; a shape animated by the wind (sine waves via a wave modifier)"""
    nu, nv = segs; V, Fc = [], []
    for i in range(nu + 1):
        u = i / nu
        for j in range(nv + 1):
            v = j / nv; hh = Hh * (1 - u * .85); V.append((x + u * L * .81, y + u * L * .59, z - v * hh))
    for i in range(nu):
        for j in range(nv): Fc.append((i * (nv + 1) + j, (i + 1) * (nv + 1) + j, (i + 1) * (nv + 1) + j + 1, i * (nv + 1) + j + 1))
    ob = mesh_obj(name, V, Fc, mats[mat], C, smooth=True)
    uv = ob.data.uv_layers.new(name='UVMap')
    for poly in ob.data.polygons:
        for li in poly.loop_indices:
            vi = ob.data.loops[li].vertex_index; i, j = divmod(vi, nv + 1); uv.data[li].uv = (i / nu, 1 - j / nv)
    sd = ob.modifiers.new('solid', 'SOLIDIFY'); sd.thickness = .02
    w = ob.modifiers.new('wave', 'WAVE'); w.use_normal = False; w.use_y = False; w.use_x = True; w.height = .55; w.width = 2.6; w.narrowness = 1.0; w.speed = .22
    w.start_position_x = x; w.start_position_y = y; w.falloff_radius = 0
    return ob

# ———————————— pidha deula (jagamohana, bhogamandapa) ————————————
def pidha_deul(mats, C, name, cx, cy, w0, h_bada, pots=(5, 4, 3), pidha_h=1.05, z0=TER, t0=0., t1=1., door=None):
    stone = mats['stone']; out = []
    def course(nm, poly, za, zb, t, extra=None, mat=stone, bev=.045):
        V, Fc = prism(poly, za, zb)
        if extra: V, Fc = merge([(V, Fc)] + extra)
        ob = mesh_obj(nm, [(x + cx, y + cy, z) for x, y, z in V], Fc, mat, C); bevel(ob, bev, 2); out.append((ob, t)); return ob
    pieces = []
    z = z0
    pieces.append(('pitha', w0 * 1.12, z, z + 1.2, .8)); z += 1.2
    mould = [1.05, 1.0, 1.04, .985]
    while z < z0 + h_bada:
        rel = (z - z0) / h_bada; f = mould[len(pieces) % 4] if rel < .25 else (1.0 if rel < .8 else 1.03)
        pieces.append(('bada', w0 * f, z, z + .7, .75)); z += .7
    # the roof: potalas of stepped pidhas, each slab overhangs and is a little smaller, a recessed kanthi between potalas
    w = w0 * 1.08
    for pi, n in enumerate(pots):
        for k in range(n):
            pieces.append(('pidha', w, z, z + pidha_h * .78, .35)); pieces.append(('pidhak', w * .9, z + pidha_h * .78, z + pidha_h, .3))
            z += pidha_h; w -= w0 * .062
        if pi < len(pots) - 1:
            pieces.append(('kanthi', w * .82, z, z + 1.4, .3)); z += 1.4; w -= w0 * .02
    N = len(pieces)
    for i, (kind, w, za, zb, k) in enumerate(pieces):
        t = t0 + (t1 - t0 - .9) * (i / N) ** 1.1
        course(f'{name}_{kind}{i}', plan(w, k), za, zb - .01, t, bev=.06 if kind.startswith('pidha') else .04, mat=mats['ochre'] if kind == 'kanthi' else (mats['sandstone'] if kind in ('pitha', 'bada') else stone))
    # crown: the ghanta (bell), amalaka, khapuri, kalasha
    wt = w
    gh = lathe([(wt * 1.0, 0), (wt * .95, .6), (wt * .8, 1.6), (wt * .55, 2.4), (wt * .35, 2.8)], 64, rib_amalaka(32, .05))
    ob = mesh_obj(f'{name}_ghanta', [(x + cx, y + cy, zz + z) for x, y, zz in gh[0]], gh[1], stone, C, smooth=True); out.append((ob, t1 - .7))
    am = lathe([(wt * .3, 0), (wt * .5, .4), (wt * .56, .8), (wt * .5, 1.2), (wt * .28, 1.5)], 64, rib_amalaka(28, .12))
    ob = mesh_obj(f'{name}_amalaka', [(x + cx, y + cy, zz + z + 2.8) for x, y, zz in am[0]], am[1], stone, C, smooth=True); out.append((ob, t1 - .45))
    ka = lathe([(.15, 0), (.5, .25), (.68, .6), (.6, .9), (.3, 1.1), (.4, 1.25), (.05, 1.6)], 32)
    ob = mesh_obj(f'{name}_kalasha', [(x + cx, y + cy, zz + z + 4.3) for x, y, zz in ka[0]], ka[1], mats['kalasha'], C, smooth=True); out.append((ob, t1 - .2))
    return out, z + 5.9

def natamandapa(mats, C, cx, cy, wx, wy, h, z0=TER, t0=0., t1=1.):
    """a flat-roofed hall with a moulded base, pilastered walls, a parapet cornice"""
    stone = mats['stone']; out = []; z = z0; i = 0
    def slab(nm, hx, hy, za, zb, t, bev=.04):
        V, Fc = boxv(cx - hx, cy - hy, za, cx + hx, cy + hy, zb); ob = mesh_obj(nm, V, Fc, stone if 'cornice' in nm else mats['sandstone'], C); bevel(ob, bev, 2); out.append((ob, t)); return ob
    pieces = [(1.07, 1.0), (1.03, .6), (1.05, .5)]
    zz = z
    for f, hh in pieces: slab(f'nata_base{i}', wx * f, wy * f, zz, zz + hh - .01, t0 + i * .12); zz += hh; i += 1
    nwall = int((h - 3.5) / .7)
    for k in range(nwall):
        f = 1.0 if k % 6 else 1.015; slab(f'nata_wall{k}', wx * f, wy * f, zz, zz + .69, t0 + .4 + (t1 - t0 - 1.2) * k / nwall); zz += .7
    for k, f in enumerate([1.05, 1.08, 1.03, 1.0]): slab(f'nata_cornice{k}', wx * f, wy * f, zz, zz + .35, t1 - .7 + k * .12, .05); zz += .35
    # pilasters on the long walls
    for s in (-1, 1):
        for k in range(9):
            x = cx - wx + (k + .5) * 2 * wx / 9; V, Fc = boxv(x - .35, cy + s * wy - .25, z0 + 2.1, x + .35, cy + s * wy + .25, zz - 1.4)
            ob = mesh_obj(f'nata_pil{s}{k}', V, Fc, mats['ochre'], C); bevel(ob, .03); out.append((ob, t0 + .6 + k * .07))
    return out, zz

def wall_ring(mats, C, name, x0, y0, x1, y1, z0, h, th, t0, t1, gates=(), mat='laterite', course_h=.6, merlons=False):
    """a stone enclosure built course by course; gates = [(side, centre, width)] leave openings"""
    out = []; n = int(h / course_h)
    for k in range(n):
        za = z0 + k * course_h; zb = za + course_h - .012; segs = []
        sides = [('S', (x0, y0 - th / 2), (x1, y0 + th / 2), 0), ('N', (x0, y1 - th / 2), (x1, y1 + th / 2), 0), ('W', (x0 - th / 2, y0), (x0 + th / 2, y1), 1), ('E', (x1 - th / 2, y0), (x1 + th / 2, y1), 1)]
        for sd, (ax0, ay0), (ax1, ay1), ax in sides:
            cuts = sorted([(c - w / 2, c + w / 2) for s, c, w in gates if s == sd])
            lo = ax0 if ax == 0 else ay0; hi = ax1 if ax == 0 else ay1; p = lo
            for a, b in cuts + [(hi, hi)]:
                if a > p + .1: segs.append(boxv(p, ay0, za, a, ay1, zb) if ax == 0 else boxv(ax0, p, za, ax1, a, zb))
                p = b
        V, Fc = merge(segs); ob = mesh_obj(f'{name}{k}', V, Fc, mats[mat], C); bevel(ob, .035); out.append((ob, t0 + (t1 - t0) * k / n))
    # a coping on top
    za = z0 + n * course_h; segs = []
    for sd, (ax0, ay0), (ax1, ay1), ax in [('S', (x0 - .3, y0 - th / 2 - .15), (x1 + .3, y0 + th / 2 + .15), 0), ('N', (x0 - .3, y1 - th / 2 - .15), (x1 + .3, y1 + th / 2 + .15), 0), ('W', (x0 - th / 2 - .15, y0), (x0 + th / 2 + .15, y1), 1), ('E', (x1 - th / 2 - .15, y0), (x1 + th / 2 + .15, y1), 1)]:
        cuts = sorted([(c - w / 2, c + w / 2) for s, c, w in gates if s == sd]); lo = ax0 if ax == 0 else ay0; hi = ax1 if ax == 0 else ay1; p = lo
        for a, b in cuts + [(hi, hi)]:
            if a > p + .1:
                segs.append(boxv(p, ay0, za, a, ay1, za + .35) if ax == 0 else boxv(ax0, p, za, ax1, a, za + .35))
                if merlons:   # crenellations along the outer wall
                    m = p + .6
                    while m + 1.2 < a:
                        segs.append(boxv(m, ay0 + .2, za + .35, m + 1.2, ay1 - .2, za + 1.25) if ax == 0 else boxv(ax0 + .2, m, za + .35, ax1 - .2, m + 1.2, za + 1.25)); m += 2.6
            p = b
    V, Fc = merge(segs); ob = mesh_obj(f'{name}_coping', V, Fc, mats[mat], C); bevel(ob, .05); out.append((ob, t1 + .1))
    return out

def gate_tower(mats, C, name, cx, cy, w, along_x=True, z0=0., t0=0., t1=1., mat='stone'):
    """a gateway: two massive jambs, a lintel and a stepped pidha roof over it"""
    out = []; d = 7.0
    hx, hy = (d / 2, w / 2 + 3.2) if along_x else (w / 2 + 3.2, d / 2)
    def blk(nm, a, b, c, d_, za, zb, t, bev=.05):
        V, Fc = boxv(a, b, za, c, d_, zb); ob = mesh_obj(nm, V, Fc, mats[mat], C); bevel(ob, bev); out.append((ob, t)); return ob
    if along_x:
        blk(f'{name}_jambS', cx - hx, cy - hy, cx + hx, cy - w / 2, z0, z0 + 9, t0); blk(f'{name}_jambN', cx - hx, cy + w / 2, cx + hx, cy + hy, z0, z0 + 9, t0 + .1)
    else:
        blk(f'{name}_jambW', cx - hx, cy - hy, cx - w / 2, cy + hy, z0, z0 + 9, t0); blk(f'{name}_jambE', cx + w / 2, cy - hy, cx + hx, cy + hy, z0, z0 + 9, t0 + .1)
    blk(f'{name}_lintel', cx - hx, cy - hy, cx + hx, cy + hy, z0 + 9, z0 + 11, t0 + .25)
    z = z0 + 11; ww = 1.0
    for k in range(6):
        f = 1.06 - k * .08; blk(f'{name}_pidha{k}', cx - hx * f, cy - hy * f, cx + hx * f, cy + hy * f, z, z + .8, t0 + .35 + k * (t1 - t0 - .6) / 6, .07); z += 1.0
    am = lathe([(1.2, 0), (2.0, .5), (2.2, 1.0), (1.8, 1.5), (.8, 1.8)], 48, rib_amalaka(24, .12))
    ob = mesh_obj(f'{name}_amalaka', [(x + cx, y + cy, zz + z) for x, y, zz in am[0]], am[1], mats[mat], C, smooth=True); out.append((ob, t1 - .1))
    return out

def steps22(mats, C, x_top, x_bot, cy, w, z_top, t0, t1):
    """Baisi Pahacha: 22 steps from the outer compound up to the inner gate"""
    out = []; n = 22; run = (x_bot - x_top) / n; rise = z_top / n
    for i in range(n):
        xa = x_top + i * run; za = z_top - (i + 1) * rise
        V, Fc = boxv(xa, cy - w / 2, 0, xa + run + .02, cy + w / 2, za + rise); ob = mesh_obj(f'step{i}', V, Fc, mats['steps'], C); bevel(ob, .03); out.append((ob, t0 + (t1 - t0) * (n - i) / n))
    return out

def shrine(mats, C, name, cx, cy, s, z0=TER, kind='rekha'):
    """a small subsidiary temple in the compound (scaled rekha or pidha), static"""
    parts = []
    if kind == 'rekha':
        z = z0
        for k, f in enumerate([1.2, 1.1, 1.05, 1.0, 1.0, 1.03, 1.0]):
            parts.append(prism(plan(s * f, .8), z, z + .5 * s)); z += .5 * s
        for k in range(10):
            u = k / 10; w = s * (1 - .45 * u ** 1.6); parts.append(prism(plan(w, .5), z, z + .45 * s)); z += .45 * s
        parts.append(lathe([(s * .5, 0), (s * .66, .3 * s), (s * .7, .5 * s), (s * .6, .75 * s), (s * .3, .95 * s)], 32, rib_amalaka(24, .1)))
        parts[-1] = ([(x, y, zz + z) for x, y, zz in parts[-1][0]], parts[-1][1])
    else:
        z = z0
        for k in range(5): parts.append(prism(plan(s * (1.1 if k == 0 else 1), .6), z, z + .55 * s)); z += .55 * s
        w = s * 1.08
        for k in range(5): parts.append(prism(plan(w, .3), z, z + .4 * s)); z += .45 * s; w -= s * .12
        parts.append(lathe([(w, 0), (w * .8, .4 * s), (w * .4, .7 * s)], 24)); parts[-1] = ([(x, y, zz + z) for x, y, zz in parts[-1][0]], parts[-1][1])
    V, Fc = merge(parts); ob = mesh_obj(name, [(x + cx, y + cy, z) for x, y, z in V], Fc, mats['sandstone'], C); bevel(ob, .03); return ob
