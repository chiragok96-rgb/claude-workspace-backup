# The three raths on Bada Danda: wheels, the wooden body, the striped cloth canopy, the crown; ropes and the devotees pulling.
import bpy, math
from geo import *
from people import _limb, _ball
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

RATHS = [  # name, x, wheels per side, height, canopy colours (main, accent)
    ('taladhwaja', 300, 7, 13.2, (.62, .05, .03), (.06, .30, .10)),     # Balabhadra: red and green, 14 wheels, black horses
    ('darpadalana', 262, 6, 12.9, (.62, .05, .03), (.05, .04, .04)),    # Subhadra: red and black, 12 wheels, red horses
    ('nandighosa', 222, 8, 13.7, (.66, .05, .03), (.92, .62, .06)),     # Jagannath: red and yellow, 16 wheels, white horses
]

def stripe_mat(name, a, b):
    """canopy cloth: the main colour, with narrow accent bands down the four corners (as on the real raths)"""
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; L = nt.links; bs = N['Principled BSDF']
    tc = N.new('ShaderNodeTexCoord'); sep = N.new('ShaderNodeSeparateXYZ'); L.new(tc.outputs['Object'], sep.inputs[0])
    at = N.new('ShaderNodeMath'); at.operation = 'ARCTAN2'; L.new(sep.outputs['Y'], at.inputs[0]); L.new(sep.outputs['X'], at.inputs[1])
    mu = N.new('ShaderNodeMath'); mu.operation = 'MULTIPLY'; mu.inputs[1].default_value = 2 / math.pi; L.new(at.outputs[0], mu.inputs[0])
    ad = N.new('ShaderNodeMath'); ad.operation = 'ADD'; ad.inputs[1].default_value = .5; L.new(mu.outputs[0], ad.inputs[0])
    fr = N.new('ShaderNodeMath'); fr.operation = 'FRACT'; L.new(ad.outputs[0], fr.inputs[0])
    d = N.new('ShaderNodeMath'); d.operation = 'SUBTRACT'; d.inputs[1].default_value = .5; L.new(fr.outputs[0], d.inputs[0])
    ab = N.new('ShaderNodeMath'); ab.operation = 'ABSOLUTE'; L.new(d.outputs[0], ab.inputs[0])
    gt = N.new('ShaderNodeMath'); gt.operation = 'GREATER_THAN'; gt.inputs[1].default_value = .36; L.new(ab.outputs[0], gt.inputs[0])   # near a corner → accent
    mx = N.new('ShaderNodeMix'); mx.data_type = 'RGBA'; mx.inputs['A'].default_value = (*a, 1); mx.inputs['B'].default_value = (*b, 1); L.new(gt.outputs[0], mx.inputs['Factor'])
    L.new(mx.outputs['Result'], bs.inputs['Base Color']); bs.inputs['Roughness'].default_value = .72
    try: bs.inputs['Sheen Weight'].default_value = .6
    except Exception: pass
    return m

def wheel(R=1.1, w=.32, spokes=16):
    parts = []; n = 48
    rim = []
    for side in (-1, 1):
        for rr in (R, R * .86):
            rim.append([(rr * math.cos(2 * math.pi * i / n), side * w / 2, rr * math.sin(2 * math.pi * i / n)) for i in range(n)])
    V = [p for r in rim for p in r]; Fc = []
    def band(a, b): return [(a * n + i, a * n + (i + 1) % n, b * n + (i + 1) % n, b * n + i) for i in range(n)]
    Fc = band(0, 2) + band(2, 3) + band(3, 1) + band(1, 0); parts.append((V, Fc))
    for k in range(spokes):
        a = 2 * math.pi * k / spokes; ca, sa = math.cos(a), math.sin(a); V, Fc = [], []
        for r in (.18, R * .87):
            for dy, dz in ((-.05, -.04), (.05, -.04), (.05, .04), (-.05, .04)): V.append((r * ca - dz * sa, dy, r * sa + dz * ca))
        Fc = [(0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)]; parts.append((V, Fc))
    hub = lathe([(.0, -.3), (.22, -.28), (.26, 0), (.22, .28), (0, .3)], 16); parts.append(([(x, z, y) for x, y, z in hub[0]], hub[1]))
    return merge(parts)

def horse(R_=1.0):
    """a carved wooden chariot horse, rearing forward (+x): body, neck, head, mane, four legs, tail"""
    P = []
    from people import _limb, _ball
    body = lathe([(0, -.95), (.32, -.8), (.42, -.3), (.4, .35), (.3, .8), (0, .95)], 14); P.append(([(z, y, x * .9 + 1.55) for x, y, z in body[0]], body[1]))
    P.append(_limb((.75, 0, 1.75), (1.15, 0, 2.45), .26, .17, 12))                       # neck
    P.append(_limb((1.12, 0, 2.5), (1.62, 0, 2.28), .16, .09, 12))                        # head
    P.append(_limb((1.25, .07, 2.62), (1.32, .09, 2.78), .04, .01, 6)); P.append(_limb((1.25, -.07, 2.62), (1.32, -.09, 2.78), .04, .01, 6))   # ears
    for sy in (-1, 1):
        P.append(_limb((.65, sy * .2, 1.35), (1.05, sy * .2, 1.0), .11, .07)); P.append(_limb((1.05, sy * .2, 1.0), (1.2, sy * .2, .62), .07, .05))   # forelegs raised
        P.append(_limb((-.7, sy * .2, 1.3), (-.95, sy * .22, .55), .13, .07)); P.append(_limb((-.95, sy * .22, .55), (-.85, sy * .22, .05), .07, .05))  # hind legs planted
    P.append(_limb((-.92, 0, 1.75), (-1.35, 0, 1.0), .09, .04))                           # tail
    V, Fc = merge(P); return [(x * R_, y * R_, z * R_) for x, y, z in V], Fc

def rath(M, C, name, x0, nw, H, ca, cb, t0, horse_col=(.9, .88, .84)):
    """a Rath Yatra chariot (after Nandighosa: ~13.7 m tall, 16 wheels of 7 ft): heavy wheels under a square wooden platform,
    a painted level of pillars and side-deity panels, and over it the great canopy: red and yellow cloth in vertical panels,
    flaring wide over the deck and rising in a temple-like curve to the gilt kalasha, the chakra and the flag; four rearing
    wooden horses, a charioteer and a ladder in front"""
    out = []; R = 1.07; L_ = 9.6; Wd = 9.6
    par = bpy.data.objects.new(name, None); C.objects.link(par); par.location = (x0, 0, 0)
    def add(nm, V, Fc, mat, t, smooth=False):
        ob = mesh_obj(f'{name}_{nm}', V, Fc, mat, C, smooth); ob.parent = par; out.append((ob, t)); return ob
    if f'horsewood_{name}' not in M: M[f'horsewood_{name}'] = mat_basic(f'horsewood_{name}', horse_col, .55)
    if 'panelpaint' not in M:
        M['panelpaint'] = [mat_basic(f'panel{i}', c, .6) for i, c in enumerate(((.42, .2, .08), (.85, .55, .1), (.55, .08, .05), (.32, .16, .07), (.8, .45, .1)))]
    wv, wf = wheel(R, .38, 16)
    for side in (-1, 1):
        for k in range(4):
            x = -L_ / 2 + 1.25 + k * (L_ - 2.5) / 3
            for yy in (Wd / 2 - .1, Wd / 2 - 1.5):
                add(f'wheel{side}{k}{yy:.0f}', [(a + x, b + side * yy, c + R) for a, b, c in wv], wf, M['wood'], t0 + .05 * k, True)
    zb = 2 * R + .05
    add('chassis', *boxv(-L_ / 2, -Wd / 2 + .55, zb, L_ / 2, Wd / 2 - .55, zb + .65), M['wood'], t0 + .45)
    add('deck', *boxv(-L_ / 2 - .25, -Wd / 2 - .25, zb + .65, L_ / 2 + .25, Wd / 2 + .25, zb + .95), M['rathpaint'], t0 + .55)
    add('deck_trim', *boxv(-L_ / 2 - .3, -Wd / 2 - .3, zb + .95, L_ / 2 + .3, Wd / 2 + .3, zb + 1.07), M['kalasha'], t0 + .6)
    zd = zb + 1.07; hp = 2.3
    # the painted level: carved pillars all round, and between them coloured panels of the side deities
    n = 6
    for side in range(4):
        for k in range(n + 1):
            u = -L_ / 2 + .25 + k * (L_ - .5) / n
            x, y = [(u, -Wd / 2 + .25), (u, Wd / 2 - .25), (-L_ / 2 + .25, u), (L_ / 2 - .25, u)][side]
            pv_, pf_ = lathe([(.2, 0), (.24, .15), (.15, .3), (.17, hp * .5), (.13, hp * .8), (.2, hp - .15), (.24, hp)], 12); add(f'pil{side}{k}', [(a_ + x, b_ + y, c_ + zd) for a_, b_, c_ in pv_], pf_, M['wood'], t0 + .75, True)
            if k < n and not (side == 3 and k in (2, 3)):
                v = u + (L_ - .5) / n / 2; pw = .55
                x, y = [(v, -Wd / 2 + .22), (v, Wd / 2 - .22), (-L_ / 2 + .22, v), (L_ / 2 - .22, v)][side]
                ax = side < 2
                bx = boxv(x - pw, y - .06, zd + .5, x + pw, y + .06, zd + 1.9) if ax else boxv(x - .06, y - pw, zd + .5, x + .06, y + pw, zd + 1.9)
                add(f'panel{side}{k}', *bx, M['panelpaint'][(side * 3 + k) % 5], t0 + .8)
    add('sanctum', *boxv(-2.2, -2.2, zd, 2.2, 2.2, zd + hp - .2), M['rathpaint'], t0 + .9)
    add('cornice', *merge([boxv(-L_ / 2 - .35, -Wd / 2 - .35, zd + hp, L_ / 2 + .35, Wd / 2 + .35, zd + hp + .25), boxv(-L_ / 2 - .2, -Wd / 2 - .2, zd + hp + .25, L_ / 2 + .2, Wd / 2 + .2, zd + hp + .4)]), M['kalasha'], t0 + 1.0)
    zc = zd + hp + .4
    # the canopy: a tall bulbous rekha, swelling out over the deck, then tapering to the crown; red with accent corners
    Hc = 8.4; Rm = 4.05; prof = [(3.7, -.3), (3.9, 0.0)]
    KN = [(0, .88), (.1, .98), (.22, 1.0), (.4, .93), (.58, .78), (.74, .57), (.86, .37), (.95, .17), (1, .05)]   # tall, pointed: swells, then a long taper
    for k in range(1, 25):
        u = k / 24; j = max(i for i in range(len(KN) - 1) if KN[i][0] <= u); (u0, r0), (u1, r1) = KN[j], KN[j + 1]
        r = Rm * (r0 + (r1 - r0) * ((u - u0) / (u1 - u0)) ** 1.0); prof.append((r, u * Hc))
    cv, cf = lathe(prof, 32)
    add('canopy', [(a, b, c + zc) for a, b, c in cv], cf, M['stripe_' + name], t0 + 1.3)
    for hb in (.0, .45, .78):
        k_ = min(range(len(prof)), key=lambda i: abs(prof[i][1] - hb * Hc)); r = prof[k_][0] + .05; bv, bf = lathe([(r, 0), (r, .14)], 32)
        add(f'band{hb}', [(a, b, c + zc + hb * Hc) for a, b, c in bv], bf, M['kalasha'], t0 + 1.4)
    kv, kf = lathe([(.45, 0), (.85, .4), (.75, .9), (.35, 1.2), (.5, 1.35), (.1, 1.7)], 32); add('kalasha', [(a, b, c + zc + Hc) for a, b, c in kv], kf, M['kalasha'], t0 + 1.7, True)
    fv, ff = boxv(-.05, -.05, zc + Hc + 1.6, .05, .05, zc + Hc + 4.6); add('flagpole', fv, ff, M['wood'], t0 + 1.8)
    # the front hood: a pointed arch standing out over the deity, red with a gold rim
    hood = []
    for k in range(25):
        u = k / 24; yy = (u - .5) * 4.2; zz = 3.6 * (1 - abs(2 * u - 1) ** 1.6)
        hood.append([(Rm * .9, yy, zc - .6 + zz), (Rm * .9 + 1.0, yy * 1.05, zc - .6 + zz * 1.02)])
    V = [p for pr in hood for p in pr]; Fc = [(2 * i, 2 * i + 1, 2 * i + 3, 2 * i + 2) for i in range(24)]
    rim = merge([_limb(hood[i][1], hood[i + 1][1], .09, .09, 6) for i in range(24)])
    hv_ = merge([(V, Fc)] + [(boxv(Rm * .9, -2.1, zc - .7, Rm * .9 + 1.0, 2.1, zc - .55))])
    ob = add('hood', *hv_, M['stripe_' + name], t0 + 1.35); sd = ob.modifiers.new('s', 'SOLIDIFY'); sd.thickness = .12
    add('hood_rim', *rim, M['kalasha'], t0 + 1.36, True)
    # garlands: red and yellow festoons sagging from the canopy rim, with tassels
    if 'festoonY' not in M: M['festoonY'] = mat_basic('festoonY', (.95, .7, .08), .6); M['festoonR'] = mat_basic('festoonR', (.75, .05, .04), .6)
    for side in range(4):
        for k in range(5):
            pts = []
            for j in range(9):
                u = -1 + 2 * (k + j / 8) / 5; sag = .55 * math.sin(math.pi * j / 8)
                q = (u * (L_ / 2 + .1), Wd / 2 + .15, zc - .05 - sag)
                pts.append([(q[0], q[1], q[2]), (-q[0], -q[1], q[2]), (q[1], -q[0], q[2]), (-q[1], q[0], q[2])][side])
            add(f'fest{side}{k}', *merge([_limb(pts[j], pts[j + 1], .08, .08, 6) for j in range(8)]), M['festoonY' if k % 2 else 'festoonR'], t0 + 1.45, True)
            add(f'tassel{side}{k}', *_ball((pts[0][0], pts[0][1], pts[0][2] - .3), .14), M['festoonR' if k % 2 else 'festoonY'], t0 + 1.45, True)
    # railing round the deck, and a wide stair rising to the front
    rail = []
    for side in range(4):
        for k in range(15):
            u = -1 + 2 * k / 14; q = (u * (L_ / 2 + .1), Wd / 2 + .1)
            if side == 3 and abs(u) < .3: continue
            x, y = [(q[0], q[1]), (q[0], -q[1]), (q[1], q[0]), (-q[1], q[0])][side]
            rail.append(_limb((x, y, zd), (x, y, zd + .8), .06, .06, 6))
    rail.append(boxv(-L_ / 2 - .2, -Wd / 2 - .2, zd + .8, L_ / 2 + .2, -Wd / 2, zd + .92)); rail.append(boxv(-L_ / 2 - .2, Wd / 2, zd + .8, L_ / 2 + .2, Wd / 2 + .2, zd + .92))
    rail.append(boxv(-L_ / 2 - .2, -Wd / 2, zd + .8, -L_ / 2, Wd / 2, zd + .92))
    add('railing', *merge(rail), M['rathpaint'], t0 + .95)
    # Lord Jagannath on the deck, under the hood: the dark round face, the great round eyes, the gold crown and a garland
    if 'jag_face' not in M:
        M['jag_face'] = mat_basic('jag_face', (.02, .02, .025), .4); M['jag_eye'] = mat_basic('jag_eye', (.95, .94, .9), .4); M['jag_red'] = mat_basic('jag_red', (.7, .05, .04), .5)
    fx = L_ / 2 - .7; fz = zd + 1.5
    fc = {'nandighosa': (.02, .02, .025), 'taladhwaja': (.92, .9, .86), 'darpadalana': (.9, .66, .12)}[name]   # Jagannath dark, Balabhadra white, Subhadra yellow
    if f'face_{name}' not in M: M[f'face_{name}'] = mat_basic(f'face_{name}', fc, .4)
    add('deity_face', *_ball((fx, 0, fz), .62, 20), M[f'face_{name}'], t0 + 1.9, True)
    for sy in (-1, 1):
        add(f'deity_eye{sy}', *_ball((fx + .52, sy * .26, fz + .08), .2, 16), M['jag_eye'], t0 + 1.9, True)
        add(f'deity_pupil{sy}', *_ball((fx + .69, sy * .26, fz + .08), .08, 12), M['jag_face'], t0 + 1.9, True)
    add('deity_mouth', *_limb((fx + .55, -.22, fz - .3), (fx + .55, .22, fz - .3), .05, .05, 8), M['jag_red'], t0 + 1.9, True)
    add('deity_body', *_limb((fx - .05, 0, zd), (fx - .05, 0, fz - .45), .55, .45, 16), M['jag_red'], t0 + 1.9, True)
    cv_, cf_ = lathe([(.0, 0), (.55, .05), (.5, .35), (.3, .7), (.06, .95)], 16); add('deity_crown', [(a + fx, b, c + fz + .45) for a, b, c in cv_], cf_, M['kalasha'], t0 + 1.9, True)
    add('deity_garland', *merge([_limb((fx + .45 * math.cos(a0), .62 * math.sin(a0), fz - .55 - .25 * math.cos(a0) ** 2), (fx + .45 * math.cos(a0 + .35), .62 * math.sin(a0 + .35), fz - .55 - .25 * math.cos(a0 + .35) ** 2), .07, .07, 6) for a0 in [i * .35 - 1.6 for i in range(10)]]), M['festoonY'], t0 + 1.9, True)
    return par, out, L_

def ropes(M, C, name, x_front, length, ys=(-3.6, -1.2, 1.2, 3.6)):
    out = []
    for i, y in enumerate(ys):
        pts = []
        for k in range(40):
            u = k / 39; x = x_front + u * length; z = .9 * (1 - u) ** 2 + .9 + .12 * math.sin(u * 9)
            pts.append((x, y + .6 * math.sin(u * 3 + i), z * (1 - u * .1)))
        rings = []
        for x, y_, z in pts: rings.append([(x, y_ + .07 * math.cos(2 * math.pi * j / 8), z + .07 * math.sin(2 * math.pi * j / 8)) for j in range(8)])
        V, Fc = loft(rings); ob = mesh_obj(f'{name}_rope{i}', V, Fc, M['rope'], C, True); out.append(ob)
    return out
