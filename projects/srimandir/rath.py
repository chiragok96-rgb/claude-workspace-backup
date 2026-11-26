# The three raths on Bada Danda: wheels, the wooden body, the striped cloth canopy, the crown; ropes and the devotees pulling.
import bpy, math
from geo import *
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

RATHS = [  # name, x, wheels per side, height, canopy colours (main, accent)
    ('taladhwaja', 300, 7, 13.2, (.62, .05, .03), (.06, .30, .10)),     # Balabhadra: red and green, 14 wheels, black horses
    ('darpadalana', 262, 6, 12.9, (.62, .05, .03), (.05, .04, .04)),    # Subhadra: red and black, 12 wheels, red horses
    ('nandighosa', 222, 8, 13.7, (.66, .05, .03), (.92, .62, .06)),     # Jagannath: red and yellow, 16 wheels, white horses
]

def stripe_mat(name, a, b):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; L = nt.links; bs = N['Principled BSDF']
    tc = N.new('ShaderNodeTexCoord'); sep = N.new('ShaderNodeSeparateXYZ'); L.new(tc.outputs['Object'], sep.inputs[0])
    at = N.new('ShaderNodeMath'); at.operation = 'ARCTAN2'; L.new(sep.outputs['Y'], at.inputs[0]); L.new(sep.outputs['X'], at.inputs[1])
    mu = N.new('ShaderNodeMath'); mu.operation = 'MULTIPLY'; mu.inputs[1].default_value = 8 / math.pi; L.new(at.outputs[0], mu.inputs[0])
    fr = N.new('ShaderNodeMath'); fr.operation = 'PINGPONG'; fr.inputs[1].default_value = 1; L.new(mu.outputs[0], fr.inputs[0])
    gt = N.new('ShaderNodeMath'); gt.operation = 'GREATER_THAN'; gt.inputs[1].default_value = .5; L.new(fr.outputs[0], gt.inputs[0])
    mx = N.new('ShaderNodeMix'); mx.data_type = 'RGBA'; mx.inputs['A'].default_value = (*a, 1); mx.inputs['B'].default_value = (*b, 1); L.new(gt.outputs[0], mx.inputs['Factor'])
    L.new(mx.outputs['Result'], bs.inputs['Base Color']); bs.inputs['Roughness'].default_value = .78
    try: bs.inputs['Sheen Weight'].default_value = .5
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
    out = []; R = 1.07; L_ = 11.0; Wd = 11.0
    par = bpy.data.objects.new(name, None); C.objects.link(par); par.location = (x0, 0, 0)
    def add(nm, V, Fc, mat, t, smooth=False):
        ob = mesh_obj(f'{name}_{nm}', V, Fc, mat, C, smooth); ob.parent = par; out.append((ob, t)); return ob
    if f'horsewood_{name}' not in M: M[f'horsewood_{name}'] = mat_basic(f'horsewood_{name}', horse_col, .55)
    if 'panelpaint' not in M:
        M['panelpaint'] = [mat_basic(f'panel{i}', c, .6) for i, c in enumerate(((.10, .32, .18), (.85, .52, .08), (.06, .16, .42), (.62, .1, .05), (.9, .86, .74)))]
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
            add(f'pil{side}{k}', *boxv(x - .16, y - .16, zd, x + .16, y + .16, zd + hp), M['rathpaint'], t0 + .75)
            if k < n and not (side == 3 and k in (2, 3)):
                v = u + (L_ - .5) / n / 2; pw = .55
                x, y = [(v, -Wd / 2 + .22), (v, Wd / 2 - .22), (-L_ / 2 + .22, v), (L_ / 2 - .22, v)][side]
                ax = side < 2
                bx = boxv(x - pw, y - .06, zd + .5, x + pw, y + .06, zd + 1.9) if ax else boxv(x - .06, y - pw, zd + .5, x + .06, y + pw, zd + 1.9)
                add(f'panel{side}{k}', *bx, M['panelpaint'][(side * 3 + k) % 5], t0 + .8)
    add('sanctum', *boxv(-2.2, -2.2, zd, 2.2, 2.2, zd + hp - .2), M['rathpaint'], t0 + .9)
    add('cornice', *merge([boxv(-L_ / 2 - .35, -Wd / 2 - .35, zd + hp, L_ / 2 + .35, Wd / 2 + .35, zd + hp + .25), boxv(-L_ / 2 - .2, -Wd / 2 - .2, zd + hp + .25, L_ / 2 + .2, Wd / 2 + .2, zd + hp + .4)]), M['kalasha'], t0 + 1.0)
    zc = zd + hp + .4
    # the canopy: flares out over the deck, then rises in a rekha curve (16-sided, alternating red / yellow panels)
    Hc = H - zc - .6; prof = [(7.4, -.25), (7.6, 0.0)]
    for k in range(1, 19):
        u = k / 18; r = 6.9 * (1 - .82 * u ** 1.25) if u < .95 else 6.9 * .18 * (1 - (u - .95) * 14); prof.append((max(.2, r), u * Hc))
    cv, cf = lathe(prof, 16)
    add('canopy', [(a, b, c + zc) for a, b, c in cv], cf, M['stripe_' + name], t0 + 1.3)
    for hb in (.0, .3, .62):
        r = 6.9 * (1 - .82 * hb ** 1.25) + .05; bv, bf = lathe([(r, 0), (r, .16)], 16)
        add(f'band{hb}', [(a, b, c + zc + hb * Hc) for a, b, c in bv], bf, M['kalasha'], t0 + 1.4)
    kv, kf = lathe([(.55, 0), (1.0, .45), (.9, 1.0), (.4, 1.3), (.55, 1.45), (.1, 1.75)], 32); add('kalasha', [(a, b, c + zc + Hc) for a, b, c in kv], kf, M['kalasha'], t0 + 1.7, True)
    fv, ff = boxv(-.05, -.05, zc + Hc + 1.7, .05, .05, zc + Hc + 4.6); add('flagpole', fv, ff, M['wood'], t0 + 1.8)
    # four rearing wooden horses, large, in front; the charioteer on a seat behind them; a ladder
    hv, hf = horse(1.55)
    for k, yy in enumerate((-3.9, -1.3, 1.3, 3.9)):
        add(f'horse{k}', [(a + L_ / 2 + .6, b + yy, c + zb - .2) for a, b, c in hv], hf, M[f'horsewood_{name}'], t0 + 1.1 + .05 * k, True)
    from people import figure_mesh
    me = figure_mesh(f'{name}_sarathi', 'kurta', M, 1.75, 'namaste'); ob = bpy.data.objects.new(f'{name}_sarathi', me); C.objects.link(ob); ob.parent = par
    ob.location = (L_ / 2 + .1, 0, zd); ob.rotation_euler = (0, 0, -math.pi / 2); out.append((ob, t0 + 1.2))
    add('ladder', *merge([boxv(L_ / 2 + .25, -.8, zd - .3 - i * .3, L_ / 2 + .55 + i * .32, .8, zd - .2 - i * .3) for i in range(int(zd / .3))]), M['wood'], t0 + 1.0)
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
