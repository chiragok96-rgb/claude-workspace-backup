# People: correctly proportioned figures (dhoti / sari variants) instanced with geometry nodes; the sevayat who climbs the spire;
# the armies (dark columns) that came for the temple's wealth.
import bpy, math, random
from geo import *

def _cyl(r0, r1, z0, z1, n=10, x=0, y=0, sx=1.0, sy=1.0):
    V = [(x + r0 * sx * math.cos(2 * math.pi * i / n), y + r0 * sy * math.sin(2 * math.pi * i / n), z0) for i in range(n)] + [(x + r1 * sx * math.cos(2 * math.pi * i / n), y + r1 * sy * math.sin(2 * math.pi * i / n), z1) for i in range(n)]
    Fc = [(i, (i + 1) % n, n + (i + 1) % n, n + i) for i in range(n)] + [tuple(range(n))[::-1], tuple(range(n, 2 * n))]
    return V, Fc

def _limb(p0, p1, r0, r1, n=8):
    """a tapered tube from p0 to p1 (a bone with flesh), closed at both ends"""
    from mathutils import Vector
    A, B = Vector(p0), Vector(p1); d = (B - A); L_ = d.length or 1e-4; z = d / L_
    x = z.cross(Vector((0, 0, 1)) if abs(z.z) < .9 else Vector((1, 0, 0))).normalized(); y = z.cross(x)
    V = []
    for P, r in ((A, r0), (B, r1)):
        for i in range(n):
            a = 2 * math.pi * i / n; q = P + x * (r * math.cos(a)) + y * (r * math.sin(a)); V.append(tuple(q))
    Fc = [(i, (i + 1) % n, n + (i + 1) % n, n + i) for i in range(n)] + [tuple(range(n))[::-1], tuple(range(n, 2 * n))]
    return V, Fc

def _ball(c, r, n=8):
    v, f = lathe([(0, -r), (r * .7, -r * .7), (r, 0), (r * .7, r * .7), (0, r)], n); return [(x + c[0], y + c[1], z + c[2]) for x, y, z in v], f

# arm poses: (elbow, wrist) for the +x arm in units of a 1.7 m figure (the -x arm mirrors x unless given separately); legs: (knee, ankle) per side
POSES = {
    'stand':   dict(arm=(((.23, .0, 1.12), (.25, .04, .84)), None), leg=(((.09, .0, .47), (.09, .0, .07)), ((-.09, .0, .47), (-.09, .0, .07)))),
    'namaste': dict(arm=(((.21, .14, 1.13), (.03, .24, 1.27)), None), leg=(((.09, .0, .47), (.09, .0, .07)), ((-.09, .0, .47), (-.09, .0, .07)))),
    'pull':    dict(arm=(((.25, -.07, 1.13), (.17, -.22, .93)), None), leg=(((.1, .2, .47), (.1, .3, .07)), ((-.1, -.16, .45), (-.1, -.36, .1)))),
    'walk':    dict(arm=(((.22, .1, 1.12), (.22, .2, .88)), ((-.22, -.1, 1.12), (-.22, -.2, .88))), leg=(((.09, .14, .47), (.09, .22, .07)), ((-.09, -.12, .47), (-.09, -.24, .1)))),
    'dance':   dict(arm=(((.36, .02, 1.58), (.13, .04, 1.86)), ((-.45, .02, 1.38), (-.72, .04, 1.43))), leg=(((.24, .05, .5), (.2, .0, .07)), ((-.24, .05, .5), (-.2, .0, .07)))),
}

def figure_mesh(name, kind, mats, h=1.68, pose='stand'):
    """kind: 'dhoti' (bare-chested man, knee-length dhoti, uttariya), 'sari' (woman), 'kurta'. Jointed arms/legs in a pose.
    Two materials: cloth (random per instance), skin."""
    s = h / 1.7; S = lambda p: (p[0] * s, p[1] * s, p[2] * s); cloth, skin, hairl = [], [], []
    P = POSES[pose]
    head = lathe([(0, -.11), (.072, -.095), (.095, -.03), (.092, .05), (.06, .1), (0, .118)], 14); skin.append(([S((x, y, z + 1.585)) for x, y, z in head[0]], head[1]))
    skin.append(_limb(S((0, .0, 1.38)), S((0, .0, 1.5)), .05 * s, .045 * s))                    # neck
    hair = lathe([(0, -.02), (.097, .03), (.09, .1), (0, .125)], 12)
    hairl.append(([S((x, y - .012, z + 1.6)) for x, y, z in hair[0]], hair[1]))
    hairl.append(_ball(S((0, -.1, 1.62 if kind == 'sari' else 1.7)), .05 * s))
    torso = [(.92, .165, .11), (1.05, .14, .1), (1.2, .165, .11), (1.32, .195, .115), (1.41, .175, .1)]
    for (za, ra, ya), (zb, rb, yb) in zip(torso, torso[1:]):
        V, Fc = _cyl(ra * s, rb * s, za * s, zb * s, 14, sy=ya / ra); (cloth if kind in ('kurta', 'sari') else skin).append((V, Fc))
    for sx in (-1, 1):
        skin.append(_ball(S((sx * .19, 0, 1.39)), .058 * s))                                        # shoulder
        arm = P['arm'][0] if (sx == 1 or P['arm'][1] is None) else P['arm'][1]
        if sx == -1 and P['arm'][1] is None: arm = tuple((-p[0], p[1], p[2]) for p in arm)
        el, wr = arm; sh = (sx * .19, 0, 1.38)
        skin.append(_limb(S(sh), S(el), .046 * s, .038 * s)); skin.append(_ball(S(el), .038 * s)); skin.append(_limb(S(el), S(wr), .036 * s, .028 * s))
        skin.append(_ball(S((wr[0], wr[1], wr[2] - .03)), .042 * s))                               # hand
        kn, an = P['leg'][0] if sx == 1 else P['leg'][1]; hp = (sx * .09, 0, .93)
        skin.append(_limb(S(hp), S(kn), .07 * s, .05 * s)); skin.append(_limb(S(kn), S(an), .048 * s, .034 * s))
        skin.append(_limb(S((an[0], an[1] - .04, .03)), S((an[0], an[1] + .14, .03)), .035 * s, .03 * s))   # foot
    if kind == 'sari':
        cloth.append(_cyl(.24 * s, .17 * s, .02 * s, .98 * s, 16, sy=.8))                           # the pleated skirt to the ankle
        cloth.append(_limb(S((.16, .02, 1.36)), S((-.14, .05, .95)), .07 * s, .09 * s, 10))        # the pallu across the chest
    else:
        dz = .1 if kind == 'kurta' else .44
        cloth.append(_cyl(.2 * s, .16 * s, dz * s, .98 * s, 14, sy=.75))                            # dhoti (to the shin for labourers)
        if kind == 'dhoti': cloth.append(_limb(S((.17, .0, 1.38)), S((-.15, .02, 1.0)), .05 * s, .06 * s, 8))   # uttariya over the shoulder
    me = bpy.data.meshes.new(name); V, Fc = merge(cloth + skin + hairl); me.from_pydata(V, [], Fc); me.validate()
    me.materials.append(mats['garment']); me.materials.append(mats['skin']); me.materials.append(mats['hair'])
    nc = len(merge(cloth)[1]); ns = len(merge(skin)[1])
    for i, p in enumerate(me.polygons): p.material_index = 0 if i < nc else (1 if i < nc + ns else 2); p.use_smooth = True
    return me

def people_mats(M):
    g = bpy.data.materials.new('garment'); g.use_nodes = True; nt = g.node_tree; N = nt.nodes; L = nt.links; b = N['Principled BSDF']
    oi = N.new('ShaderNodeObjectInfo'); r = N.new('ShaderNodeValToRGB'); cr = r.color_ramp; cr.interpolation = 'CONSTANT'
    cols = [(.88, .86, .80), (.86, .40, .06), (.70, .06, .05), (.88, .66, .12), (.90, .88, .84), (.12, .32, .16), (.55, .08, .22), (.92, .90, .86), (.80, .30, .10)]
    cr.elements[0].color = (*cols[0], 1); cr.elements[0].position = 0
    for i, c in enumerate(cols[1:], 1): e = cr.elements.new(i / len(cols)); e.color = (*c, 1)
    L.new(oi.outputs['Random'], r.inputs['Fac']); L.new(r.outputs['Color'], b.inputs['Base Color']); b.inputs['Roughness'].default_value = .8
    s = mat_basic('skin', (.36, .21, .13), .55)
    try: s.node_tree.nodes['Principled BSDF'].inputs['Subsurface Weight'].default_value = .15
    except Exception: pass
    M['garment'] = g; M['skin'] = s; M['hair'] = mat_basic('hair', (.02, .018, .016), .5)
    M['dark_army'] = mat_basic('army', (.06, .05, .045), .85)

def figure_collection(M, name='figures', pose='stand', kinds=('dhoti', 'sari', 'kurta', 'dhoti', 'sari')):
    c = bpy.data.collections.new(name)   # not linked to the scene: used only by instancing
    for i, k in enumerate(kinds):
        me = figure_mesh(f'{name}_{k}{i}', k, M, h=random.Random(i).uniform(1.55, 1.78), pose=pose); ob = bpy.data.objects.new(f'{name}_{k}{i}', me); c.objects.link(ob)
    return c

def crowd(name, pts, figs, C, bob=.04, face=None, spread=.5, lean=0.):
    """points → instances of random figures with random facing (or facing angle `face`), a gentle sway"""
    me = bpy.data.meshes.new(name + '_pts'); me.from_pydata(pts, [], []); ob = bpy.data.objects.new(name, me); C.objects.link(ob)
    ng = bpy.data.node_groups.new(name + '_gn', 'GeometryNodeTree')
    ng.interface.new_socket('Geometry', in_out='INPUT', socket_type='NodeSocketGeometry'); ng.interface.new_socket('Geometry', in_out='OUTPUT', socket_type='NodeSocketGeometry')
    N = ng.nodes; L = ng.links; gi = N.new('NodeGroupInput'); go = N.new('NodeGroupOutput')
    ci = N.new('GeometryNodeCollectionInfo'); ci.inputs['Collection'].default_value = figs; ci.inputs['Separate Children'].default_value = True; ci.inputs['Reset Children'].default_value = True
    iop = N.new('GeometryNodeInstanceOnPoints'); iop.inputs['Pick Instance'].default_value = True
    ri = N.new('FunctionNodeRandomValue'); ri.data_type = 'INT'; ri.inputs['Min'].default_value = 0; ri.inputs['Max'].default_value = 4
    rr = N.new('FunctionNodeRandomValue'); rr.data_type = 'FLOAT_VECTOR'; rr.inputs['Min'].default_value = (lean * .8, 0, (face - spread) if face is not None else 0); rr.inputs['Max'].default_value = (lean * 1.2, 0, (face + spread) if face is not None else 6.28)
    rs = N.new('FunctionNodeRandomValue'); rs.data_type = 'FLOAT'; rs.inputs['Min'].default_value = .93; rs.inputs['Max'].default_value = 1.07
    # sway: offset z by a small sine of (time + random phase)
    tm = N.new('GeometryNodeInputSceneTime'); ph = N.new('FunctionNodeRandomValue'); ph.data_type = 'FLOAT'; ph.inputs['Max'].default_value = 6.28
    ad = N.new('ShaderNodeMath'); ad.operation = 'MULTIPLY_ADD'; ad.inputs[1].default_value = 4.0
    L.new(tm.outputs['Seconds'], ad.inputs[0]); L.new(ph.outputs[1], ad.inputs[2])
    sn = N.new('ShaderNodeMath'); sn.operation = 'SINE'; L.new(ad.outputs[0], sn.inputs[0])
    mu = N.new('ShaderNodeMath'); mu.operation = 'MULTIPLY'; mu.inputs[1].default_value = bob; L.new(sn.outputs[0], mu.inputs[0])
    cv = N.new('ShaderNodeCombineXYZ'); L.new(mu.outputs[0], cv.inputs['Z'])
    sp = N.new('GeometryNodeSetPosition'); L.new(gi.outputs[0], sp.inputs['Geometry']); L.new(cv.outputs[0], sp.inputs['Offset'])
    L.new(sp.outputs[0], iop.inputs['Points']); L.new(ci.outputs[0], iop.inputs['Instance']); L.new(ri.outputs[2], iop.inputs['Instance Index'])
    L.new(rr.outputs[0], iop.inputs['Rotation']); L.new(rs.outputs[1], iop.inputs['Scale']); L.new(iop.outputs[0], go.inputs[0])
    mod = ob.modifiers.new('crowd', 'NODES'); mod.node_group = ng
    return ob

def scatter(rect, n, seed, zf=lambda x, y: 0., minsep=.55):
    rnd = random.Random(seed); x0, y0, x1, y1 = rect; pts = []
    for _ in range(n * 3):
        if len(pts) >= n: break
        x, y = rnd.uniform(x0, x1), rnd.uniform(y0, y1)
        if all((x - a) ** 2 + (y - b) ** 2 > minsep ** 2 for a, b, _ in pts[-40:]): pts.append((x, y, zf(x, y)))
    return pts

# ———————— the sevayat: a man in a white dhoti who climbs the spire every day ————————
def climber(M, C, path, t0, t1):
    """path: [(t, x, y, z)] — the climber's hips; limbs alternate as he climbs"""
    s = 1.0; parts = {}
    def part(nm, V, Fc, mat, parent=None, loc=(0, 0, 0)):
        ob = mesh_obj(nm, V, Fc, M[mat], C, smooth=True); ob.location = loc
        if parent: ob.parent = parent
        return ob
    root = bpy.data.objects.new('sevayat', None); C.objects.link(root)
    tor = [(-.02, .165, .11), (.12, .14, .1), (.28, .165, .11), (.4, .195, .115), (.5, .175, .1)]
    body = part('sev_body', *merge([_cyl(ra, rb, za, zb, 14, sy=ya / ra) for (za, ra, ya), (zb, rb, yb) in zip(tor, tor[1:])] + [_ball((.19, 0, .48), .058), _ball((-.19, 0, .48), .058), _limb((0, 0, .48), (0, 0, .6), .05, .045)]), 'skin', root)
    hr = lathe([(0, -.02), (.097, .03), (.09, .1), (0, .125)], 12); part('sev_hair', *merge([([(x, y - .012, z + .69) for x, y, z in hr[0]], hr[1]), _ball((0, -.1, .79), .05)]), 'hair', root)
    part('sev_dhoti', *merge([_cyl(.21, .17, -.42, .07, 14, sy=.75), _limb((.17, 0, .47), (-.15, .02, .1), .05, .06)]), 'flag_white', root)
    hd = lathe([(0, -.11), (.075, -.09), (.098, -.02), (.09, .06), (.05, .1), (0, .115)], 12); part('sev_head', [(x, y, z + .72) for x, y, z in hd[0]], hd[1], 'skin', root)
    limbs = []
    for nm, x, z0, ln, rr in (('armL', .2, .5, -.62, .042), ('armR', -.2, .5, -.62, .042), ('legL', .08, -.05, -.85, .06), ('legR', -.08, -.05, -.85, .06)):
        piv = bpy.data.objects.new('sev_' + nm, None); C.objects.link(piv); piv.parent = root; piv.location = (x, 0, z0)
        V, Fc = merge([_cyl(rr, rr * .75, ln, 0, 8), _ball((0, .03 if 'leg' in nm else 0, ln - .03), rr * 1.05)]); part('sev_' + nm + '_m', V, Fc, 'skin', piv); limbs.append(piv)
    for t, x, y, z, rot in path:
        root.location = (x, y, z); root.rotation_euler = (0, 0, rot); root.keyframe_insert('location', frame=F(t)); root.keyframe_insert('rotation_euler', frame=F(t))
    # climbing cycle: arms reach up alternately, legs push
    t = t0; k = 0
    while t <= t1:
        for i, piv in enumerate(limbs):
            ph = (k + (i % 2)) % 2; up = i < 2
            piv.rotation_euler = ((math.radians(160 if ph else 120) if up else math.radians(-35 if ph else 10)), 0, 0); piv.keyframe_insert('rotation_euler', frame=F(t))
        t += .55; k += 1
    hide(root, t0 - .1)
    for o in [root] + list(root.children_recursive): hide(o, t0 - .1)
    return root

def army(M, C, seed=18):
    """18 dark columns converging over the land toward the walls (49.2 → 56), halting as the walls rise; then they fade away"""
    rnd = random.Random(seed); out = []
    for k in range(18):
        ang = math.radians(-15 + k * (210 / 17) + rnd.uniform(-4, 4))      # from the land (west, north, east), never from the sea
        r0, r1 = 720 + rnd.uniform(-60, 60), 205 + rnd.uniform(-10, 25)
        parts = []; red = []
        for row in range(24):
            wdt = min(9, 3 + row // 2)
            for col in range(wdt):
                x, y = -row * 1.8 + rnd.uniform(-.35, .35), (col - (wdt - 1) / 2) * 1.2 + rnd.uniform(-.25, .25)
                parts.append(_cyl(.3, .24, 0, 1.72, 6, x=x, y=y)); parts.append(lathe([(0, 0), (.15, .08), (.12, .25), (0, .3)], 6, x0=x, y0=y, z0=1.72))
                if (row + col) % 2 == 0: parts.append(boxv(x + .25, y - .025, .4, x + .3, y + .025, 3.3))        # a spear
            if row % 6 == 2:
                y = ((row // 6) % 2 * 2 - 1) * 2.4; red.append(boxv(-row * 1.8 - .05, y - .05, 0, -row * 1.8 + .05, y + .05, 5.2)); red.append(boxv(-row * 1.8 + .05, y - .02, 4.0, -row * 1.8 + 2.0, y + .02, 5.2))
        V, Fc = merge(parts + red); ob = mesh_obj(f'army{k}', V, Fc, M['dark_army'], C); ob.data.materials.append(M['flag'])
        nred = len(merge(red)[1]) if red else 0
        for p_ in list(ob.data.polygons)[len(ob.data.polygons) - nred:]: p_.material_index = 1
        cx, cy = 25, 0; d = (math.cos(ang), math.sin(ang))
        ob.rotation_euler = (0, 0, ang + math.pi)
        for t, r in ((49.0, r0), (53.4, r1 + 60), (56.0, r1)):
            ob.location = (cx + d[0] * r, cy + d[1] * r, .2); ob.keyframe_insert('location', frame=F(t))
        hide(ob, 48.9, 60.2); out.append(ob)
    return out
