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
    """a Rath Yatra chariot: four axles of big wheels under a square body (~10.5 m), carved painted tiers, a pillared sanctum,
    a tall rekha-curved cloth canopy in alternating panels, gold bands, kalasha and flag; four wooden horses and a charioteer in front"""
    out = []; R = 1.07; L_ = 10.5; Wd = 10.5
    par = bpy.data.objects.new(name, None); C.objects.link(par); par.location = (x0, 0, 0)
    def add(nm, V, Fc, mat, t, smooth=False):
        ob = mesh_obj(f'{name}_{nm}', V, Fc, mat, C, smooth); ob.parent = par; out.append((ob, t)); return ob
    if f'horsewood_{name}' not in M: M[f'horsewood_{name}'] = mat_basic(f'horsewood_{name}', horse_col, .55)
    wv, wf = wheel(R, .36, 16)
    for side in (-1, 1):
        for k in range(4):
            x = -L_ / 2 + 1.3 + k * (L_ - 2.6) / 3
            for yy in (Wd / 2 + .25, Wd / 2 - 1.15):
                add(f'wheel{side}{k}{yy:.0f}', [(a + x, b + side * yy, c + R) for a, b, c in wv], wf, M['wood'], t0 + .05 * k, True)
    zb = 2 * R + .08
    add('chassis', *boxv(-L_ / 2, -Wd / 2 + .6, zb, L_ / 2, Wd / 2 - .6, zb + .7), M['wood'], t0 + .5)
    for k, (f, hh) in enumerate(((1.0, .35), (.97, .3), (1.02, .25))):      # carved, painted tiers
        z = zb + .7 + sum(h_ for _, h_ in ((1.0, .35), (.97, .3), (1.02, .25))[:k])
        add(f'tier{k}', *boxv(-L_ / 2 * f, -Wd / 2 * f, z, L_ / 2 * f, Wd / 2 * f, z + hh - .01), M['rathpaint'] if k != 1 else M['kalasha'], t0 + .6 + .05 * k)
    zd = zb + 1.6
    for k in range(4):      # pillars at the corners and along the sides, painted
        for s in (-1, 1):
            for x in (-L_ / 2 + .5 + k * (L_ - 1) / 3,):
                add(f'post{k}{s}', *boxv(x - .14, s * (Wd / 2 - .5) - .14, zd, x + .14, s * (Wd / 2 - .5) + .14, zd + 2.4), M['rathpaint'], t0 + .8 + .02 * k)
    add('sanctum', *merge([boxv(-2.6, -2.6, zd, 2.6, -2.2, zd + 2.35), boxv(-2.6, 2.2, zd, 2.6, 2.6, zd + 2.35), boxv(-2.6, -2.6, zd, -2.2, 2.6, zd + 2.35), boxv(1.6, -2.6, zd + 1.85, 2.6, 2.6, zd + 2.35)]), M['rathpaint'], t0 + 1.0)
    add('sanctum_trim', *merge([boxv(2.55, -2.6, zd, 2.7, -1.3, zd + 2.35), boxv(2.55, 1.3, zd, 2.7, 2.6, zd + 2.35), boxv(2.55, -1.3, zd + 1.75, 2.7, 1.3, zd + 1.95)]), M['kalasha'], t0 + 1.05)
    zc = zd + 2.4
    add('cornice', *merge([boxv(-L_ / 2 - .2, -Wd / 2 - .2, zc, L_ / 2 + .2, Wd / 2 + .2, zc + .3), boxv(-L_ / 2 + .2, -Wd / 2 + .2, zc + .3, L_ / 2 - .2, Wd / 2 - .2, zc + .55)]), M['kalasha'], t0 + 1.15)
    zc += .55
    # the canopy: a tall rekha curve (straight, then rounding in), octagonal, alternating cloth panels
    Hc = H - zc - .8; prof = []
    for k in range(17):
        u = k / 16; r = 3.5 * (1 - .8 * u ** 1.35) if u < .94 else 3.5 * .2 * (1 - (u - .94) * 12); prof.append((max(.25, r), u * Hc))
    cv, cf = lathe(prof, 16)
    rot = 0.0; cv = [(a * math.cos(rot) - b * math.sin(rot), a * math.sin(rot) + b * math.cos(rot), c) for a, b, c in cv]
    add('canopy', [(a, b, c + zc) for a, b, c in cv], cf, M['stripe_' + name], t0 + 1.4)
    for hb in (.0, .5, .9):
        r = 3.5 * (1 - .8 * hb ** 1.35) + .04; bv, bf = lathe([(r, 0), (r, .12)], 16); bv = [(a * math.cos(rot) - b * math.sin(rot), a * math.sin(rot) + b * math.cos(rot), c) for a, b, c in bv]
        add(f'band{hb}', [(a, b, c + zc + hb * Hc) for a, b, c in bv], bf, M['kalasha'], t0 + 1.5)
    kv, kf = lathe([(.5, 0), (.9, .4), (.8, .9), (.35, 1.2), (.5, 1.35), (.1, 1.6)], 32); add('kalasha', [(a, b, c + zc + Hc) for a, b, c in kv], kf, M['kalasha'], t0 + 1.8, True)
    fv, ff = boxv(-.04, -.04, zc + Hc + 1.6, .04, .04, zc + Hc + 4.4); add('flagpole', fv, ff, M['wood'], t0 + 1.9)
    # four wooden horses leaping forward from the front, side by side
    hv, hf = horse(1.05)
    for k, yy in enumerate((-3.0, -1.0, 1.0, 3.0)):
        add(f'horse{k}', [(a + L_ / 2 + .3, b + yy, c + zb + .1) for a, b, c in hv], hf, M[f'horsewood_{name}'], t0 + 1.2 + .05 * k, True)
    add('ladder', *merge([boxv(L_ / 2, -.7, zb + .1 - i * .3, L_ / 2 + .35 + i * .35, .7, zb + .2 - i * .3) for i in range(7)]), M['wood'], t0 + 1.0)
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
