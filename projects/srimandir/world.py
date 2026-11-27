# The land, the sea, the sky and the sun; coconut palms; the town along Bada Danda; a sailing ship.
import bpy, math, random
from geo import *

SHORE_Y = -230.0
def ground_h(x, y):
    """flat compound and road; gentle dunes elsewhere; the beach falls into the sea south of SHORE_Y"""
    d = 0.0
    inside = (-90 < x < 140 and -110 < y < 110) or (120 < x < 1500 and -45 < y < 45)
    if not inside:
        d = .7 * math.sin(x * .021 + 1.3) * math.sin(y * .017 + .4) + .35 * math.sin(x * .053 + y * .041) + .2 * math.sin(x * .11 - y * .07)
        e = min(1, max(0, (min(abs(x - 25), abs(y)) - 0) / 60)) if not (-90 < x < 140 and -110 < y < 110) else 0
        d *= .8
    beach = 0.0
    if y < -150:
        u = (-150 - y) / (abs(SHORE_Y) - 150)        # 0 at the dunes' edge, 1 at the shoreline
        beach = -1.6 * u if u < 1 else -1.6 - (u - 1) * 6.0
        d *= max(0, 1 - u)
    if y > -150: d = .35 + .5 * (d + 1.2) / 2.4 if not ((-90 < x < 140 and -110 < y < 110) or (120 < x < 1500 and -45 < y < 45)) else d
    return d + beach

def terrain(mats, C):
    n_x, n_y = 260, 240; x0, x1, y0, y1 = -900, 1700, -700, 900
    V, Fc = [], []
    for j in range(n_y + 1):
        # denser rows near the temple and the shore
        v = j / n_y; y = y0 + (y1 - y0) * v
        for i in range(n_x + 1):
            u = i / n_x; x = x0 + (x1 - x0) * u; V.append((x, y, ground_h(x, y)))
    for j in range(n_y):
        for i in range(n_x): a = j * (n_x + 1) + i; Fc.append((a, a + 1, a + n_x + 2, a + n_x + 1))
    ob = mesh_obj('ground', V, Fc, mats['sand'], C, smooth=True)
    sub = ob.modifiers.new('sub', 'SUBSURF'); sub.levels = 1; sub.render_levels = 1
    return ob

def sea(mats, C):
    bpy.ops.mesh.primitive_plane_add(size=2, location=(400, -1000, -.15)); ob = bpy.context.object; ob.name = 'sea'
    for c in ob.users_collection: c.objects.unlink(ob)
    C.objects.link(ob)
    oc = ob.modifiers.new('ocean', 'OCEAN'); oc.geometry_mode = 'GENERATE'; oc.spatial_size = 90; oc.repeat_x = 39; oc.repeat_y = 25; oc.resolution = 11
    oc.wave_scale = 1.7; oc.choppiness = 1.1; oc.wind_velocity = 10; oc.wave_alignment = .6; oc.wave_direction = math.radians(80); oc.use_foam = True; oc.foam_layer_name = 'foam'; oc.foam_coverage = -.1
    oc.time = 0; ob.data.materials.append(mats['water'])
    ob.location = (-1500, -2450, -.2)
    # beyond the simulated tiles: a far sea to the horizon, and the far land to the north
    bpy.ops.mesh.primitive_plane_add(size=80000, location=(0, -40000 - 200, -.45)); far = bpy.context.object; far.name = 'far_sea'; far.data.materials.append(mats['water'])
    bpy.ops.mesh.primitive_plane_add(size=80000, location=(0, 40000 + 880, .35)); fl = bpy.context.object; fl.name = 'far_land'; fl.data.materials.append(mats['farland'])
    for o in (far, fl):
        for c in o.users_collection: c.objects.unlink(o)
        C.objects.link(o)
    # waves move: animate the ocean time linearly
    oc.time = 0.0; ob.keyframe_insert('modifiers["ocean"].time', frame=0); oc.time = 84.0 * .9; ob.keyframe_insert('modifiers["ocean"].time', frame=F(84.0))
    for fc in fcurves(ob.animation_data.action):
        for k in fc.keyframe_points: k.interpolation = 'LINEAR'
    return ob

def sky_and_sun(sc, keys):
    """keys: [(t, elevation°, azimuth°)] — azimuth measured from north, clockwise (east = 90)"""
    w = bpy.data.worlds.new('sky'); sc.world = w; w.use_nodes = True; nt = w.node_tree
    sky = nt.nodes.new('ShaderNodeTexSky'); sky.sky_type = 'MULTIPLE_SCATTERING'; sky.sun_disc = False
    bg = nt.nodes['Background']; bg.inputs['Strength'].default_value = .08; nt.links.new(sky.outputs[0], bg.inputs[0])
    sky.air_density = 1.1; sky.aerosol_density = 1.6
    bpy.ops.object.light_add(type='SUN'); sun = bpy.context.object; sun.name = 'sun'; sun.data.angle = math.radians(.9); sun.data.energy = 4.2
    for t, el, az in keys:
        f = F(t); sky.sun_elevation = math.radians(el); sky.sun_rotation = math.radians(90 - az) + math.pi / 2
        sky.keyframe_insert('sun_elevation', frame=f); sky.keyframe_insert('sun_rotation', frame=f)
        # sun lamp: points from the sun toward the scene
        azr = math.radians(az); elr = math.radians(el)
        d = (math.sin(azr) * math.cos(elr), math.cos(azr) * math.cos(elr), math.sin(elr))
        sun.rotation_euler = (Vector(d) * -1).to_track_quat('-Z', 'Y').to_euler(); sun.keyframe_insert('rotation_euler', frame=f)
        warm = max(0, 1 - el / 35); sun.data.color = (1, 1 - .18 * warm, 1 - .42 * warm); sun.data.keyframe_insert('color', frame=f)
        sun.data.energy = 2.4 + 2.4 * min(1, el / 30); sun.data.keyframe_insert('energy', frame=f)
    return sky, sun

# ———————————— a coconut palm (one mesh, reused as linked duplicates) ————————————
def palm_mesh(mats, seed=0):
    rnd = random.Random(seed); parts = []; H = rnd.uniform(11, 16); lean = rnd.uniform(.4, 1.6)
    # trunk: rings with a slight bulge at the base and ring scars
    rings = []; n = 18
    for k in range(n + 1):
        u = k / n; r = .24 * (1 + .55 * (1 - u) ** 4) * (1 + .03 * math.sin(k * 3.1)); cx = lean * u * u; ring = []
        for i in range(10):
            a = 2 * math.pi * i / 10; ring.append((cx + r * math.cos(a), r * math.sin(a), H * u))
        rings.append(ring)
    parts.append(loft(rings)); top = (lean, 0, H)
    # fronds: a curved rachis with leaflets on both sides
    nf = 15
    for f in range(nf):
        az = 2 * math.pi * f / nf + rnd.uniform(-.15, .15); up = rnd.uniform(-.2, .55); L = rnd.uniform(4.2, 5.6)
        pts = []
        for k in range(14):
            u = k / 13; s = L * u; dz = s * math.sin(up) - 1.6 * u * u * L / 5; pts.append((s * math.cos(up), dz))
        ca, sa = math.cos(az), math.sin(az)
        V, Fc = [], []
        for k in range(1, 13):
            (s0, z0), (s1, z1) = pts[k], pts[k + 1]
            ll = (1.05 - abs(k / 13 - .45)) * .95
            for side in (-1, 1):
                b = len(V)
                p0 = (s0, 0, z0); p1 = (s1, 0, z1); tip = (s0 + .45 * ll, side * ll, z0 - .5 * ll)
                for (x, y, z) in (p0, p1, tip, (s0 + .2, side * .06, z0)):
                    V.append((top[0] + x * ca - y * sa, top[1] + x * sa + y * ca, top[2] + z))
                Fc.append((b, b + 1, b + 2)); Fc.append((b, b + 2, b + 3))
        parts.append((V, Fc))
    # a cluster of coconuts
    for k in range(5):
        a = k * 1.3; v, f_ = lathe([(0, -.17), (.15, -.12), (.18, 0), (.15, .12), (0, .17)], 10)
        parts.append(([(x + top[0] + .35 * math.cos(a), y + .35 * math.sin(a), z + top[2] - .5) for x, y, z in v], f_))
    V, Fc = merge(parts)
    me = bpy.data.meshes.new(f'palm{seed}'); me.from_pydata(V, [], Fc); me.validate()
    for p in me.polygons: p.use_smooth = True
    # material slots: trunk (first loft) vs leaves: assign by height of face centre
    me.materials.append(mats['trunk']); me.materials.append(mats['leaf']); me.materials.append(mats['coconut'])
    nt = len(loft(rings)[1])
    for i, p in enumerate(me.polygons): p.material_index = 0 if i < nt else (2 if i >= len(me.polygons) - 5 * len(lathe([(0, -.17), (.15, -.12), (.18, 0), (.15, .12), (0, .17)], 10)[1]) else 1)
    return me

def palms(mats, C, spots, seed=3):
    rnd = random.Random(seed); meshes = [palm_mesh(mats, s) for s in range(5)]; out = []
    for i, (x, y) in enumerate(spots):
        ob = bpy.data.objects.new(f'palm_{i}', meshes[i % 5]); ob.location = (x, y, ground_h(x, y) - .1); ob.rotation_euler = (0, 0, rnd.uniform(0, 6.28))
        s = rnd.uniform(.85, 1.15); ob.scale = (s, s, s); C.objects.link(ob); out.append(ob)
    return out

def palm_spots(seed=5):
    rnd = random.Random(seed); out = []
    def ok(x, y):
        if -100 < x < 145 and -115 < y < 115: return False    # the complex
        if x > 120 and -55 < y < 55: return False             # Bada Danda and its houses
        if y < SHORE_Y + 25: return False
        return True
    while len(out) < 420:
        x, y = rnd.uniform(-700, 900), rnd.uniform(-215, 700)
        # groves: denser along the beach and west of the temple
        w = 1.0 if y < -120 else (.6 if x < -100 else .35)
        if ok(x, y) and rnd.random() < w: out.append((x, y))
    return out

# ———————————— the town along Bada Danda ————————————
def town(mats, C, seed=9):
    rnd = random.Random(seed); parts = {k: [] for k in ('w1', 'w2', 'w3', 'w4')}; wins = []
    for side in (-1, 1):
        x = 150
        while x < 1400:
            wd = rnd.uniform(8, 16); dp = rnd.uniform(10, 18); h = rnd.choice([4.5, 7.5, 7.5, 10.5]); y0 = side * 36; y1 = side * (36 + dp)
            ya, yb = min(y0, y1), max(y0, y1)
            k = rnd.choice(list(parts)); parts[k].append(boxv(x, ya, 0, x + wd, yb, h))
            parts[k].append(boxv(x, ya, h, x + wd, yb, h + .9) if False else boxv(x - .1, ya - .1, h, x + wd + .1, yb + .1, h + .25))
            # parapet
            for (a, b, c, d) in ((x, ya, x + wd, ya + .25), (x, yb - .25, x + wd, yb), (x, ya, x + .25, yb), (x + wd - .25, ya, x + wd, yb)):
                parts[k].append(boxv(a, b, h + .25, c, d, h + 1.1))
            # windows on the street face
            yf = (36 if side > 0 else -36); fl = int(h / 3)
            for f in range(fl):
                for wx in range(int(wd / 3.2)):
                    xx = x + 1.2 + wx * 3.2; wins.append(boxv(xx, yf - .05 * side - .05, f * 3 + 1, xx + 1.2, yf + .05, f * 3 + 2.4))
            x += wd + rnd.uniform(.3, 2.5)
    out = []
    for k, segs in parts.items():
        if segs: V, Fc = merge(segs); ob = mesh_obj(f'town_{k}', V, Fc, mats['house_' + k], C); bevel(ob, .03); out.append(ob)
    V, Fc = merge(wins); out.append(mesh_obj('town_windows', V, Fc, mats['window'], C))
    return out

# ———————————— a sailing ship of the 1600s (the sailors who called it the White Pagoda) ————————————
def ship(mats, C, x, y, rot=0.):
    parts_h, parts_w, parts_s = [], [], []
    L, B, D = 34, 9, 6.5
    rings = []
    for k in range(17):
        u = k / 16; s = -L / 2 + L * u; half = B / 2 * math.sin(math.pi * min(1, u * 1.1 + .05)) ** .55; sheer = D + 1.6 * (abs(u - .5) * 2) ** 2.2
        ring = []
        for i in range(11):
            v = i / 10; ang = math.pi * v; yy = -half * math.cos(ang); zz = -D * .55 * math.sin(ang) ** .8 if 0 < v < 1 else 0
            ring.append((s, yy, zz))
        ring = [(s, -half, sheer)] + ring + [(s, half, sheer)]
        rings.append(ring)
    V, Fc = loft(rings, False, False); parts_h.append((V, Fc))
    parts_h.append(boxv(-L / 2 + 1, -B / 2 + .3, D - 1, L / 2 - 1, B / 2 - .3, D - .8))    # deck
    parts_h.append(boxv(-L / 2, -B / 2 + .4, D, -L / 2 + 7, B / 2 - .4, D + 3))           # the stern castle
    for mx, mh in ((-7, 24), (3, 29), (12, 22)):
        v, f = lathe([(.35, 0), (.3, mh * .6), (.2, mh)], 10, x0=mx); parts_w.append((v, f))
        for k, (yz, yl) in enumerate(((mh * .45, 9), (mh * .78, 6.5))):
            v, f = lathe([(.14, -yl), (.18, 0), (.14, yl)], 8); parts_w.append(([(mx + xx, zz, yz + yy) for xx, yy, zz in v], f))
            # a square sail under each yard, bellied forward by the wind (wider at the foot)
            nu, nv = 12, 10; sv, sf = [], []; hgt = mh * (.3 if k == 0 else .26)
            for i in range(nu + 1):
                for j in range(nv + 1):
                    u_, v_ = i / nu, j / nv; half = yl * .92 * (1 + .12 * v_); yy = -half + 2 * half * u_; zz = yz - hgt * v_
                    belly = 2.2 * math.sin(math.pi * u_) * math.sin(math.pi * (.15 + .85 * v_)) ** .8
                    sv.append((mx + belly, yy, zz))
            for i in range(nu):
                for j in range(nv): sf.append((i * (nv + 1) + j, (i + 1) * (nv + 1) + j, (i + 1) * (nv + 1) + j + 1, i * (nv + 1) + j + 1))
            parts_s.append((sv, sf))
    v, f = lathe([(.25, 0), (.15, 14)], 8); parts_w.append(([(L / 2 - 2 + zz * .9, yy, D + zz * .4) for xx, yy, zz in v], f))   # bowsprit
    out = []
    for nm, parts, mat in (('ship_hull', parts_h, 'shiphull'), ('ship_spars', parts_w, 'wood'), ('ship_sails', parts_s, 'sail')):
        V, Fc = merge(parts); ob = mesh_obj(nm, V, Fc, mats[mat], C, smooth=nm != 'ship_hull'); out.append(ob)
    par = bpy.data.objects.new('ship', None); C.objects.link(par); par.location = (x, y, -1.2); par.rotation_euler = (0, 0, rot)
    for o in out:
        o.parent = par
        if o.name == 'ship_sails': sd = o.modifiers.new('s', 'SOLIDIFY'); sd.thickness = .04
    return par


# ———————————— a field of fair-weather cumulus on one high layer (sun-lit from above, translucent from below) ————————————
def clouds(C, z=1700, R=24000):
    m = bpy.data.materials.new('clouds'); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; L = nt.links; nt.nodes.remove(N['Principled BSDF'])
    tc = N.new('ShaderNodeTexCoord'); mp = N.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (1 / 2600, 1 / 2600, 1 / 2600); L.new(tc.outputs['Object'], mp.inputs[0])
    nz = N.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 1.0; nz.inputs['Detail'].default_value = 4; nz.inputs['Roughness'].default_value = .5; L.new(mp.outputs[0], nz.inputs['Vector'])
    big = N.new('ShaderNodeTexNoise'); big.inputs['Scale'].default_value = .22; big.inputs['Detail'].default_value = 2; L.new(mp.outputs[0], big.inputs['Vector'])
    ad = N.new('ShaderNodeMath'); ad.operation = 'MULTIPLY_ADD'; ad.inputs[1].default_value = .45; L.new(big.outputs['Fac'], ad.inputs[0]); L.new(nz.outputs['Fac'], ad.inputs[2])
    mr = N.new('ShaderNodeMapRange'); mr.inputs['From Min'].default_value = .74; mr.inputs['From Max'].default_value = .90; L.new(ad.outputs[0], mr.inputs['Value'])
    # fade toward the rim of the disc (no visible edge)
    sep = N.new('ShaderNodeSeparateXYZ'); L.new(tc.outputs['Object'], sep.inputs[0]); cx = N.new('ShaderNodeCombineXYZ'); L.new(sep.outputs['X'], cx.inputs['X']); L.new(sep.outputs['Y'], cx.inputs['Y'])
    ln = N.new('ShaderNodeVectorMath'); ln.operation = 'LENGTH'; L.new(cx.outputs[0], ln.inputs[0])
    rim = N.new('ShaderNodeMapRange'); rim.inputs['From Min'].default_value = R * .55; rim.inputs['From Max'].default_value = R * .95; rim.inputs['To Min'].default_value = 1; rim.inputs['To Max'].default_value = 0; L.new(ln.outputs['Value'], rim.inputs['Value'])
    a = N.new('ShaderNodeMath'); a.operation = 'MULTIPLY'; L.new(mr.outputs['Result'], a.inputs[0]); L.new(rim.outputs['Result'], a.inputs[1])
    df = N.new('ShaderNodeBsdfDiffuse'); df.inputs['Color'].default_value = (1, 1, 1, 1); tl = N.new('ShaderNodeBsdfTranslucent'); tl.inputs['Color'].default_value = (.95, .95, .95, 1)
    m1 = N.new('ShaderNodeMixShader'); m1.inputs[0].default_value = .6; L.new(df.outputs[0], m1.inputs[1]); L.new(tl.outputs[0], m1.inputs[2])
    tr = N.new('ShaderNodeBsdfTransparent'); m2 = N.new('ShaderNodeMixShader'); L.new(a.outputs[0], m2.inputs[0]); L.new(tr.outputs[0], m2.inputs[1]); L.new(m1.outputs[0], m2.inputs[2])
    L.new(m2.outputs[0], N['Material Output'].inputs['Surface'])
    n = 64; V = [(0, 0, 0)] + [(R * math.cos(2 * math.pi * i / n), R * math.sin(2 * math.pi * i / n), 0) for i in range(n)]
    Fc = [(0, 1 + i, 1 + (i + 1) % n) for i in range(n)]
    ob = mesh_obj('clouds', V, Fc, m, C); ob.location = (0, 0, z); ob.visible_shadow = False
    return ob


def sky_clouds(sc, sky, h=1700.0, dur=84.4):
    """clouds painted into the world shader: each view ray meets a cloud layer at height h; noise there → cover.
    Deterministic (no transparency speckle at low samples); the cloud takes the sky's own brightness, desaturated and warm-tinted."""
    nt = sc.world.node_tree; N = nt.nodes; L = nt.links; bg = N['Background']
    tc = N.new('ShaderNodeTexCoord'); sep = N.new('ShaderNodeSeparateXYZ'); L.new(tc.outputs['Generated'], sep.inputs[0])
    mz = N.new('ShaderNodeMath'); mz.operation = 'MAXIMUM'; mz.inputs[1].default_value = .012; L.new(sep.outputs['Z'], mz.inputs[0])
    k = N.new('ShaderNodeMath'); k.operation = 'DIVIDE'; k.inputs[0].default_value = h; L.new(mz.outputs[0], k.inputs[1])
    hx = N.new('ShaderNodeMath'); hx.operation = 'MULTIPLY'; L.new(sep.outputs['X'], hx.inputs[0]); L.new(k.outputs[0], hx.inputs[1])
    hy = N.new('ShaderNodeMath'); hy.operation = 'MULTIPLY'; L.new(sep.outputs['Y'], hy.inputs[0]); L.new(k.outputs[0], hy.inputs[1])
    cb = N.new('ShaderNodeCombineXYZ'); L.new(hx.outputs[0], cb.inputs['X']); L.new(hy.outputs[0], cb.inputs['Y'])
    mp = N.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (1 / 2600, 1 / 2600, 1); L.new(cb.outputs[0], mp.inputs[0])
    nz = N.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 1.0; nz.inputs['Detail'].default_value = 6; nz.inputs['Roughness'].default_value = .52; L.new(mp.outputs[0], nz.inputs['Vector'])
    big = N.new('ShaderNodeTexNoise'); big.inputs['Scale'].default_value = .22; big.inputs['Detail'].default_value = 2; L.new(mp.outputs[0], big.inputs['Vector'])
    ad = N.new('ShaderNodeMath'); ad.operation = 'MULTIPLY_ADD'; ad.inputs[1].default_value = .45; L.new(big.outputs['Fac'], ad.inputs[0]); L.new(nz.outputs['Fac'], ad.inputs[2])
    mr = N.new('ShaderNodeMapRange'); mr.inputs['From Min'].default_value = .74; mr.inputs['From Max'].default_value = .92; L.new(ad.outputs[0], mr.inputs['Value'])
    hz = N.new('ShaderNodeMapRange'); hz.inputs['From Min'].default_value = .03; hz.inputs['From Max'].default_value = .22; L.new(sep.outputs['Z'], hz.inputs['Value'])
    cov = N.new('ShaderNodeMath'); cov.operation = 'MULTIPLY'; L.new(mr.outputs['Result'], cov.inputs[0]); L.new(hz.outputs['Result'], cov.inputs[1])
    bw = N.new('ShaderNodeRGBToBW'); L.new(sky.outputs[0], bw.inputs[0])
    g = N.new('ShaderNodeMath'); g.operation = 'MULTIPLY'; g.inputs[1].default_value = 2.3; L.new(bw.outputs[0], g.inputs[0])
    tint = N.new('ShaderNodeMix'); tint.data_type = 'RGBA'; tint.blend_type = 'MULTIPLY'; tint.inputs['Factor'].default_value = 1
    L.new(g.outputs[0], tint.inputs['A']); tint.inputs['B'].default_value = (1.0, .96, .91, 1)
    mx = N.new('ShaderNodeMix'); mx.data_type = 'RGBA'; L.new(cov.outputs[0], mx.inputs['Factor']); L.new(sky.outputs[0], mx.inputs['A']); L.new(tint.outputs['Result'], mx.inputs['B'])
    L.new(mx.outputs['Result'], bg.inputs['Color'])
    # a slow drift with the sea wind
    mp.inputs['Location'].default_value = (0, 0, 0); mp.inputs['Location'].keyframe_insert('default_value', frame=0)
    mp.inputs['Location'].default_value = (.35, .12, 0); mp.inputs['Location'].keyframe_insert('default_value', frame=F(dur))
    for fc in fcurves(nt.animation_data.action):
        if 'Mapping' in fc.data_path or 'nodes["Mapping' in fc.data_path:
            for kp in fc.keyframe_points: kp.interpolation = 'LINEAR'
