# The three raths on Bada Danda: wheels, the wooden body, the striped cloth canopy, the crown; ropes and the devotees pulling.
import bpy, math
from geo import *

RATHS = [  # name, x, wheels per side, height, canopy colours (main, accent)
    ('taladhwaja', 300, 7, 13.2, (.62, .05, .03), (.06, .30, .10)),
    ('darpadalana', 262, 6, 12.9, (.62, .05, .03), (.05, .04, .04)),
    ('nandighosa', 222, 8, 13.7, (.62, .05, .03), (.85, .58, .06)),
]

def stripe_mat(name, a, b):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; L = nt.links; bs = N['Principled BSDF']
    tc = N.new('ShaderNodeTexCoord'); sep = N.new('ShaderNodeSeparateXYZ'); L.new(tc.outputs['Object'], sep.inputs[0])
    at = N.new('ShaderNodeMath'); at.operation = 'ARCTAN2'; L.new(sep.outputs['Y'], at.inputs[0]); L.new(sep.outputs['X'], at.inputs[1])
    mu = N.new('ShaderNodeMath'); mu.operation = 'MULTIPLY'; mu.inputs[1].default_value = 4 / math.pi; L.new(at.outputs[0], mu.inputs[0])
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

def rath(M, C, name, x0, nw, H, ca, cb, t0):
    out = []; R = 1.1; L_ = nw * 2.5 + 1.0; Wd = 10.5
    par = bpy.data.objects.new(name, None); C.objects.link(par); par.location = (x0, 0, 0)
    def add(nm, V, Fc, mat, t, smooth=False):
        ob = mesh_obj(f'{name}_{nm}', V, Fc, mat, C, smooth); ob.parent = par; out.append((ob, t)); return ob
    wv, wf = wheel(R)
    for side in (-1, 1):
        for k in range(nw):
            x = -L_ / 2 + 1.25 + k * 2.5; add(f'wheel{side}{k}', [(a + x, b + side * (Wd / 2 + .3), c + R) for a, b, c in wv], wf, M['wood'], t0 + .05 * k, True)
    # the wooden body: chassis, a carved railing tier, the sanctum box
    add('chassis', *boxv(-L_ / 2, -Wd / 2, R + .2, L_ / 2, Wd / 2, R + .9), M['wood'], t0 + .5)
    add('deck', *boxv(-L_ / 2 - .3, -Wd / 2 - .3, R + .9, L_ / 2 + .3, Wd / 2 + .3, R + 1.15), M['rathpaint'], t0 + .65)
    for k in range(10):
        x = -L_ / 2 + .4 + k * (L_ - .8) / 9
        for s in (-1, 1): add(f'post{k}{s}', *boxv(x - .09, s * (Wd / 2 + .1) - .09, R + 1.15, x + .09, s * (Wd / 2 + .1) + .09, R + 4.1), M['rathpaint'], t0 + .8 + .02 * k)
    add('sanctum', *boxv(-3.4, -3.4, R + 1.15, 3.4, 3.4, R + 4.4), M['rathpaint'], t0 + 1.0)
    add('cornice', *boxv(-L_ / 2 - .2, -Wd / 2 - .5, R + 4.1, L_ / 2 + .2, Wd / 2 + .5, R + 4.6), M['rathpaint'], t0 + 1.15)
    # the canopy: an octagonal, rekha-curved cloth superstructure in wide panels (main / accent), with gold bands
    zc = R + 4.6; Hc = H - zc - 1.6; prof = []
    for k in range(15):
        u = k / 14; r = 4.9 * (1 - .62 * u ** 1.9) if u < .93 else 4.9 * .5 * (1 - (u - .93) * 9); prof.append((max(.3, r), u * Hc))
    cv, cf = lathe(prof, 8)
    rot = math.pi / 8; cv = [(a * math.cos(rot) - b * math.sin(rot), a * math.sin(rot) + b * math.cos(rot), c) for a, b, c in cv]
    add('canopy', [(a, b, c + zc) for a, b, c in cv], cf, M['stripe_' + name], t0 + 1.4)
    for hb in (.0, .28, .55, .8):
        r = 4.9 * (1 - .62 * hb ** 1.9) + .06; bv, bf = lathe([(r, 0), (r, .22)], 8); bv = [(a * math.cos(rot) - b * math.sin(rot), a * math.sin(rot) + b * math.cos(rot), c) for a, b, c in bv]
        add(f'band{hb}', [(a, b, c + zc + hb * Hc) for a, b, c in bv], bf, M['kalasha'], t0 + 1.5)
    kv, kf = lathe([(.5, 0), (.9, .4), (.8, .9), (.35, 1.2), (.5, 1.35), (.1, 1.6)], 32); add('kalasha', [(a, b, c + zc + Hc) for a, b, c in kv], kf, M['kalasha'], t0 + 1.8, True)
    fv, ff = boxv(-.04, -.04, zc + Hc + 1.6, .04, .04, zc + Hc + 4.2); add('flagpole', fv, ff, M['wood'], t0 + 1.9)
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
