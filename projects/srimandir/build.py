# Builds the whole film scene → srimandir.blend.  Run: /home/user/bpyenv/bin/python build.py [--static]
import bpy, sys, math, random, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from geo import *
import mats as MATS, world as WD, temple as TP, people as PP, rath as RT, kitchen as KT

HERE = os.path.dirname(os.path.abspath(__file__)); STATIC = '--static' in sys.argv
DUR = 84.4
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene; sc.render.fps = FPS; sc.frame_start = 0; sc.frame_end = F(DUR) - 1
sc.unit_settings.system = 'METRIC'
M = MATS.make()
M['dust'] = mat_basic('dust', (.38, .3, .2), 1.0); M['rathpaint'] = mat_basic('rathpaint', (.42, .10, .05), .6); M['rope'] = mat_stone('rope', (.52, .42, .28), var=.1, rough=.95, scale=20, bump=.6, dirt=0); M['flag_white'] = mat_basic('cloth_white', (.88, .86, .8), .8)
for nm, x, nw, Hh, ca, cb in RT.RATHS: M['stripe_' + nm] = RT.stripe_mat('stripe_' + nm, ca, cb)
PP.people_mats(M); FIGS = PP.figure_collection(M)
FIG_NAM = PP.figure_collection(M, 'figs_namaste', 'namaste'); FIG_PULL = PP.figure_collection(M, 'figs_pull', 'pull', ('dhoti', 'dhoti', 'kurta', 'dhoti', 'dhoti')); FIG_WALK = PP.figure_collection(M, 'figs_walk', 'walk'); FIG_BHOGA = PP.figure_collection(M, 'figs_bhoga', 'bhoga', ('dhoti', 'kurta', 'dhoti', 'dhoti', 'kurta'))
CW = coll('world'); CT = coll('temple'); CX = coll('extras')

# ———————— land, sea, sky ————————
WD.terrain(M, CW); WD.sea(M, CW)
SUN_KEYS = [(0, 6, 100), (7, 9, 104), (20, 15, 112), (40, 22, 150), (52, 20, 205), (60, 16, 230), (72, 11, 245), (84.4, 6.5, 255)]   # golden morning → long afternoon shadows → evening glow
sky, sun = WD.sky_and_sun(sc, SUN_KEYS); WD.sky_clouds(sc, sky, dur=DUR)
WD.palms(M, CW, WD.palm_spots()); WD.town(M, CW); WD.ship(M, CX, -66, -323, math.radians(-60))

# ———————— the inner terrace (the site): a low stone platform on the sand ————————
V, Fc = boxv(-38, -45, -1, 92, 45, TP.TER - .01); terr = mesh_obj('terrace', V, Fc, M['stone'], CT); bevel(terr, .08)
V, Fc = boxv(-38.6, -45.6, -1, 92.6, 45.6, .5); mesh_obj('terrace_base', V, Fc, M['laterite'], CT)
# paving of the outer compound
V, Fc = boxv(-75, -98, -.3, 128, 98, .02); pav = mesh_obj('outer_paving', V, Fc, M['steps'], CT)

BUILD = []    # (object, arrival time)
v_out, v_top, v_wt = TP.vimana(M, CT, 0, 0, 11.5, TP.TER, 7.6, 9.8, 14.05); BUILD += v_out
# "otherwise it collapses": a translucent straight-walled extension appears on the narrowing tower, cracks and slides off
M['ghostred'] = bpy.data.materials.new('ghostred'); M['ghostred'].use_nodes = True
_gb = M['ghostred'].node_tree.nodes['Principled BSDF']; _gb.inputs['Base Color'].default_value = (.85, .55, .45, 1); _gb.inputs['Alpha'].default_value = .38; _gb.inputs['Roughness'].default_value = .6
GHOST = []; rg = random.Random(13)
for k in range(6):
    za = TP.TER + 44.6 + k * .55
    for j, (x0, x1) in enumerate(((-11.5, -3.9), (-3.8, 3.8), (3.9, 11.5))):
        V, Fc = boxv(x0, -11.5, za, x1, 11.5, za + .53); ob = mesh_obj(f'ghost{k}_{j}', V, Fc, M['ghostred'], CX); bevel(ob, .04)
        t_in = 12.5 + k * .07; t_fall = 13.0 + k * .04 + j * .05
        ob.location = (0, 0, 1.5); ob.keyframe_insert('location', frame=F(t_in - .25)); ob.location = (0, 0, 0); ob.keyframe_insert('location', frame=F(t_in)); ob.keyframe_insert('location', frame=F(t_fall))
        ob.keyframe_insert('rotation_euler', frame=F(t_fall))
        dx = (j - 1) * rg.uniform(4, 7) + rg.uniform(-1, 1); dy = rg.uniform(-5, 5)
        ob.location = (dx, dy, -14 - k); ob.rotation_euler = (rg.uniform(-.7, .7), rg.uniform(-.9, .9), rg.uniform(-.3, .3)); ob.keyframe_insert('location', frame=F(t_fall + .85)); ob.keyframe_insert('rotation_euler', frame=F(t_fall + .85))
        for fc in fcurves(ob.animation_data.action):
            for kp in fc.keyframe_points:
                if int(round(kp.co[0])) == F(t_fall): kp.interpolation = 'QUAD'; kp.easing = 'EASE_IN'
        hide(ob, t_in - .25, 13.95); GHOST.append((ob.name, t_fall))
ch, st, pole, z_pole = TP.nilachakra(M, CT, 0, 0, v_top); BUILD += [(st, 14.85), (ch, 15.05), (pole, 15.25)]
BUILD += [(TP.flag(M, CT, 'flag_big', .08, 0, z_pole + 7.2, 7.5, 2.8, 'flagcloth'), 15.45), (TP.flag(M, CT, 'flag_small', .08, 0, z_pole + 4.4, 4.5, 1.6, 'flag2'), 15.6)]
j_out, j_top = TP.pidha_deul(M, CT, 'jaga', 27, 0, 10.5, 12, (5, 4, 3), 1.05, TP.TER, 26.6, 29.6); BUILD += j_out
n_out, n_top = TP.natamandapa(M, CT, 51.5, 0, 9.5, 9.0, 11, TP.TER, 33.0, 35.6); BUILD += n_out
b_out, b_top = TP.pidha_deul(M, CT, 'bhoga', 71, 0, 7.6, 8, (4, 3, 2), .95, TP.TER, 34.9, 37.4); BUILD += b_out
# subsidiary shrines on the terrace
rnd = random.Random(4)
SPOTS = [(-26, -30, 2.2, 'rekha'), (-26, 30, 2.2, 'rekha'), (-12, -34, 1.6, 'pidha'), (-12, 34, 1.6, 'pidha'), (8, -34, 2.6, 'rekha'), (8, 34, 2.0, 'rekha'), (40, -36, 1.8, 'pidha'), (40, 36, 1.8, 'pidha'),
         (62, -34, 2.2, 'rekha'), (62, 34, 2.4, 'rekha'), (84, -36, 1.6, 'pidha'), (84, 36, 1.6, 'pidha'), (-30, -14, 1.4, 'pidha'), (-30, 14, 1.4, 'pidha'), (24, -36, 1.5, 'pidha'), (24, 36, 1.5, 'pidha')]
for i, (x, y, s_, k) in enumerate(SPOTS):
    BUILD.append((TP.shrine(M, CT, f'shrine{i}', x, y, s_, TP.TER, k), 30.6 + i * .32))
# Rosaghara (the kitchen) in the outer compound, south-east
ros = []
for k in range(10):
    za = k * .6; segs = [boxv(62, -88, za, 112, -87.2, za + .59), boxv(62, -62.8, za, 82, -62, za + .59), boxv(86, -62.8, za, 112, -62, za + .59), boxv(62, -88, za, 62.8, -62, za + .59), boxv(111.2, -88, za, 112, -62, za + .59)]
    if za >= 3.0: segs.append(boxv(82, -62.8, za, 86, -62, za + .59))     # lintel above the door
    V, Fc = merge(segs); ob = mesh_obj(f'ros_wall{k}', V, Fc, M['laterite'], CT); bevel(ob, .03); ros.append((ob, 40.75 + k * .1))
hole = (82, -82, 87, -77)
roof = [boxv(61.6, -88.4, 6, 112.4, hole[1], 6.5), boxv(61.6, hole[3], 6, 112.4, -61.6, 6.5), boxv(61.6, hole[1], 6, hole[0], hole[3], 6.5), boxv(hole[2], hole[1], 6, 112.4, hole[3], 6.5)]
roof += [boxv(hole[0] - .5, hole[1] - .5, 6.5, hole[2] + .5, hole[1], 8.0), boxv(hole[0] - .5, hole[3], 6.5, hole[2] + .5, hole[3] + .5, 8.0), boxv(hole[0] - .5, hole[1], 6.5, hole[0], hole[3], 8.0), boxv(hole[2], hole[1], 6.5, hole[2] + .5, hole[3], 8.0)]
roof += [boxv(66 + i * 9, -80, 6.5, 69 + i * 9, -77, 7.6) for i in (0, 1, 3, 4)]
V, Fc = merge(roof); ob = mesh_obj('ros_roof', V, Fc, M['laterite'], CT); bevel(ob, .04); ros.append((ob, 42.0))
k_out, fires = KT.build(M, CT); BUILD += k_out
V, Fc = boxv(62.8, -87.2, -.05, 111.2, -62.8, .05); mesh_obj('ros_floor', V, Fc, M['chulha'], CT)
BUILD += ros
# walls: Kurmabedha (inner) and Meghanada pacheri (outer), with their gates
BUILD += TP.wall_ring(M, CT, 'kurma', -38, -45, 92, 45, TP.TER, 5.0, 1.6, 54.2, 57.2, gates=[('E', 0, 6), ('W', 0, 5), ('N', 25, 5), ('S', 25, 5)], mat='laterite')
BUILD += TP.wall_ring(M, CT, 'megha', -75, -98, 128, 98, 0, 6.0, 2.4, 57.0, 59.6, gates=[('E', 0, 8), ('W', 0, 6), ('N', 20, 6), ('S', 20, 6)], mat='laterite', merlons=True)   # Meghanada pacheri: 6.1 m
BUILD += TP.gate_tower(M, CT, 'singhadwara', 128, 0, 8, True, 0, 58.6, 59.9, 'sandstone')
for nm, (x, y, ax) in (('gateW', (-75, 0, True)), ('gateN', (20, 98, False)), ('gateS', (20, -98, False))): BUILD += TP.gate_tower(M, CT, nm, x, y, 6, ax, 0, 58.8, 59.9, 'laterite')
BUILD += TP.gate_tower(M, CT, 'innerE', 92, 0, 6, True, TP.TER, 56.4, 57.4, 'laterite')
BUILD += TP.steps22(M, CT, 92 + 3.5, 92 + 3.5 + 13.2, 0, 8, TP.TER, 71.1, 72.2)

# ———————— people ————————
CP = coll('people')
door = PP.scatter((15.8, -6.5, 22.5, 6.5), 70, 1, lambda x, y: TP.TER, minsep=.62); dc = PP.crowd('devotees_door', door, FIG_NAM, CP, face=math.pi / 2, spread=.45); hide(dc, 21.4, 26.5)
dc.keyframe_insert('location', frame=F(25.6)); dc.location.x += 3.0; dc.keyframe_insert('location', frame=F(26.5))   # they turn back out before the hall rises
spect = PP.scatter((140, 17, 480, 34), 1500, 2, minsep=.75) + PP.scatter((140, -34, 480, -17), 1500, 3, minsep=.75); sc_ = PP.crowd('spectators', spect, FIG_NAM, CP); hide(sc_, 60.0)
# ———————— nacha and bhoga at the Natamandapa: Odissi dancers on the terrace, servitors carrying pots of mahaprasad ————————
PP.dancers(M, CP, [(46.0 + i * 1.6, -12.4 - (i % 2) * 1.5, TP.TER, (i % 3 - 1) * .45 + math.pi * .15) for i in range(8)], 32.8, 38.6)
bh = [(60.5 + k * 1.15 + random.Random(k).uniform(-.2, .2), -14.0 - (k % 2) * .9, TP.TER) for k in range(12)]
bc = PP.crowd('bhoga_carriers', bh, FIG_BHOGA, CP, bob=.04, face=-math.pi / 2, spread=.12); hide(bc, 32.8, 40.2)
bc.keyframe_insert('location', frame=F(33.0)); bc.location.x += 4.5; bc.keyframe_insert('location', frame=F(40.0))
# ———————— thousands of devotees in the outer compound by the Rosaghara ————————
ros_c = PP.scatter((58, -60, 126, -48), 520, 41, minsep=.7) + PP.scatter((114, -95, 126, -62), 120, 43, minsep=.7); rc = PP.crowd('rosei_crowd', ros_c, FIG_NAM, CP); hide(rc, 38.8, 45.5)
ros_c2 = PP.scatter((58, -60, 126, -48), 380, 42, minsep=.7); rc2 = PP.crowd('rosei_crowd2', ros_c2, FIG_WALK, CP); hide(rc2, 38.8, 45.5)
# ———————— the raths, their ropes and the pullers; they roll east together ————————
CR = coll('raths'); RX = {'taladhwaja': 385, 'darpadalana': 300, 'nandighosa': 215}
for i, (nm, x, nw, Hh, ca, cb) in enumerate(RT.RATHS):
    par, parts, L_ = RT.rath(M, CR, nm, RX[nm], nw, Hh, ca, cb, 62.9 + .35 * (2 - i), {'taladhwaja': (.05, .045, .04), 'darpadalana': (.55, .08, .05), 'nandighosa': (.9, .88, .84)}[nm])
    for ob, t in parts: BUILD.append((ob, t))
    rp = RT.ropes(M, CR, nm, L_ / 2 + .2, 72)
    for r in rp: r.parent = par; hide(r, 65.0 + .1 * i)
    pull = PP.scatter((L_ / 2 + 4, -5.2, L_ / 2 + 72, 5.2), 640, 10 + i, minsep=.6); pc = PP.crowd(nm + '_pullers', pull, FIG_PULL, CP, bob=.06, face=-math.pi / 2, spread=.15, lean=-.25); pc.parent = par; hide(pc, 64.6)
    par.keyframe_insert('location', frame=F(65.6)); par.location.x += 14; par.keyframe_insert('location', frame=F(71.0))
# ———————— armies; the sevayat; the new flag ————————
PP.army(M, CX)
z_rel = lambda z: z - TP.TER
def east_x(z):
    zr = z - TP.TER; u = (zr - TP.H_BADA) / (TP.H_GANDI - TP.H_BADA); w = TP.gandi_w(zr, 11.5); return w * (1 + .17 * (1 - .45 * u)) + .42
wt = v_wt; T_ = TP.TER
path = [(74.9 + i * .3, east_x(T_ + 44 + i * 1.6), .3, T_ + 44 + i * 1.6, math.pi / 2) for i in range(6)]          # up the gandi
path += [(77.2, wt * .78 + .45, .3, T_ + 52.4, math.pi / 2), (77.8, wt * .75 + .35, .3, T_ + 54.4, math.pi / 2),           # the beki
         (78.3, wt * 1.25 + .4, .3, T_ + 56.0, math.pi / 2), (78.7, wt * .52 + .35, .3, T_ + 58.0, math.pi / 2),          # over the amalaka, the khapuri
         (79.0, 1.6, .3, T_ + 60.5, math.pi / 2), (79.25, .2, -.5, z_pole - 2.2, 0.), (82.0, .2, -.5, z_pole - 2.2, 0.)]     # past the kalasha to the wheel
PP.climber(M, CX, path, 74.9, 82.0, 79.3)
fb = bpy.data.objects['flag_big']   # the old flag comes down the pole into his hands...
fb.keyframe_insert('location', frame=F(79.35)); fb.location.z = -6.6; fb.keyframe_insert('location', frame=F(79.95)); fb.hide_render = True; fb.keyframe_insert('hide_render', frame=F(80.0))
nf = TP.flag(M, CT, 'flag_new', .08, 0, z_pole + 7.2, 7.5, 2.8, 'flagcloth'); nf.location.z = -6.6; nf.keyframe_insert('location', frame=F(80.0)); nf.location.z = 0; nf.keyframe_insert('location', frame=F(80.9)); hide(nf, 80.0)   # ...and the new one rises
# ———————— the site at dawn: dressed stones waiting on the sand ————————
rnd2 = random.Random(8)
for k in range(34):
    cx_, cy_ = ((26, -57) if k < 20 else (-22, -53)); x = cx_ + rnd2.uniform(-6, 6); y = cy_ + rnd2.uniform(-3.5, 3.5); z = (k % 3) * .62
    V, Fc = boxv(-.75, -.45, 0, .75, .45, .6); ob = mesh_obj(f'pile{k}', [(a + x, b + y, c + z) for a, b, c in V], Fc, M['stone'], CX); bevel(ob, .04); ob.rotation_euler = (0, 0, rnd2.uniform(-.15, .15)); hide(ob, -1, 24.5)
# ———————— the hook: teams haul dressed stones on wooden sledges up from the beach; masons wait at the site ————————
TEAMS = [(22, -192), (37, -184), (52, -177), (8, -186)]   # on the camera's path over the beach: the hook
for i, (x, y) in enumerate(TEAMS):
    tm = bpy.data.objects.new(f'team{i}', None); CP.objects.link(tm)
    V, Fc = boxv(-.75, -1.3, 0, .75, 1.3, .28); sl = mesh_obj(f'sledge{i}', V, Fc, M['wood'], CP); bevel(sl, .03); sl.parent = tm
    V, Fc = boxv(-.7, -.95, .28, .7, .95, 1.12); bk = mesh_obj(f'haulstone{i}', V, Fc, M['stone'], CP); bevel(bk, .05); bk.parent = tm
    for rx in (-.45, .45):
        rings = []
        for k in range(30):
            u = k / 29; yy = 1.3 + u * 12.5; zz = .25 + .6 * u + .05 * math.sin(u * 3.14)
            rings.append([(rx + .03 * math.cos(2 * math.pi * j / 6), yy, zz + .03 * math.sin(2 * math.pi * j / 6)) for j in range(6)])
        V, Fc = loft(rings); rp = mesh_obj(f'haulrope{i}{rx}', V, Fc, M['rope'], CP, True); rp.parent = tm
    men = [(sx * .62 + random.Random(i * 50 + k).uniform(-.08, .08), 3.2 + k * 1.15, 0) for k in range(9) for sx in (-1, 1)]
    cw = PP.crowd(f'haulers{i}', men, FIG_PULL, CP, bob=.035, face=0., spread=.12, lean=-.30); cw.parent = tm
    tm.location = (x, y, 0); tm.keyframe_insert('location', frame=F(0)); tm.location = (x, y + 9.0, 0); tm.keyframe_insert('location', frame=F(21.0))
    for fc in fcurves(tm.animation_data.action):
        for kp in fc.keyframe_points: kp.interpolation = 'LINEAR'
    for o in [tm] + list(tm.children): hide(o, -1, 21.0)
def _clear(x, y): return not ((20 < x < 32.8 and -61 < y < -53) or (-28.8 < x < -15.2 and -57 < y < -49))
mas = [p for p in PP.scatter((17, -64, 36, -49), 34, 31, minsep=1.1) + PP.scatter((-31, -60, -12, -45), 30, 32, minsep=1.1) if _clear(p[0], p[1])]
mc = PP.crowd('masons', mas, FIG_WALK, CP, bob=.02); hide(mc, -1, 21.0)   # only by the stone piles on the sand: nobody stands where the temple rises
# the ship rolls gently
shp = bpy.data.objects['ship']
for k in range(0, 85):
    shp.rotation_euler = (math.radians(1.6 * math.sin(k * 1.3)), math.radians(.8 * math.sin(k * .9)), math.radians(-60)); shp.location.z = -1.2 + .25 * math.sin(k * 1.1); shp.location.x = -70 + k * .2
    shp.keyframe_insert('rotation_euler', frame=F(k)); shp.keyframe_insert('location', frame=F(k))
if STATIC:
    pass
else:
    for ob, t in BUILD:
        d_ = .32 if ob.name.startswith(('v_', 'jaga', 'bhoga', 'nata')) else .45
        if ob.name.count('_') >= 2 and ob.name.startswith('v_') or ob.name.startswith(('wheel', 'step', 'ros_wall')) or ob.parent is not None:
            appear(ob, t, d_, 2.0 if ob.name.startswith('v_') else 1.4)          # stone upon stone, close up
        else:   # each part slides in from a side and locks into place: the temple assembles itself
            rr = random.Random(ob.name); ax = rr.random() < .5; sgn = 1 if rr.random() < .5 else -1; mag = rr.uniform(3.5, 6.5)
            loc = ob.location.copy(); off = (sgn * mag if ax else 0, 0 if ax else sgn * mag, rr.uniform(1.0, 2.5))
            ob.location = (loc.x + off[0], loc.y + off[1], loc.z + off[2]); ob.keyframe_insert('location', frame=F(t - d_ * 1.3) - 1)
            ob.location = loc; ob.keyframe_insert('location', frame=F(t)); hide(ob, t - d_ * 1.3)
        # a stone glows warm gold while it is laid, then settles to its own colour
        ob.color = (0, 1, 1, 1); ob.keyframe_insert('color', frame=F(t - d_) - 1); ob.keyframe_insert('color', frame=F(t))
        ob.color = (1, 1, 1, 1); ob.keyframe_insert('color', frame=F(t + .75))
# ———————— white dust bursting out when the over-tall tower cracks (13.0 s) ————————
dm = bpy.data.materials.new('dustcloud'); dm.use_nodes = True; nt = dm.node_tree; N_ = nt.nodes; nt.nodes.remove(N_['Principled BSDF'])
pv = N_.new('ShaderNodeVolumePrincipled'); pv.inputs['Color'].default_value = (.92, .9, .86, 1)
gr = N_.new('ShaderNodeTexGradient'); gr.gradient_type = 'SPHERICAL'; tc_ = N_.new('ShaderNodeTexCoord'); nt.links.new(tc_.outputs['Object'], gr.inputs['Vector'])
nz = N_.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 2.5; nz.inputs['Detail'].default_value = 3; nt.links.new(tc_.outputs['Object'], nz.inputs['Vector'])
mu_ = N_.new('ShaderNodeMath'); mu_.operation = 'MULTIPLY'; nt.links.new(gr.outputs['Fac'], mu_.inputs[0]); nt.links.new(nz.outputs['Fac'], mu_.inputs[1])
dk = N_.new('ShaderNodeMath'); dk.operation = 'MULTIPLY'; nt.links.new(mu_.outputs[0], dk.inputs[0]); nt.links.new(dk.outputs[0], pv.inputs['Density']); nt.links.new(pv.outputs[0], N_['Material Output'].inputs['Volume'])
dk.inputs[1].default_value = 0; dk.inputs[1].keyframe_insert('default_value', frame=F(12.95)); dk.inputs[1].default_value = 1.6; dk.inputs[1].keyframe_insert('default_value', frame=F(13.25)); dk.inputs[1].default_value = 0; dk.inputs[1].keyframe_insert('default_value', frame=F(14.5))
for k_, (dx, dy) in enumerate(((-9, -6), (9, -5), (0, -10), (-6, 8), (7, 7))):
    sv, sf = lathe([(0, -1), (.7, -.7), (1, 0), (.7, .7), (0, 1)], 16); ob = mesh_obj(f'dust{k_}', sv, sf, dm, CX, True); ob.location = (dx, dy, TP.TER + 45.5 - k_ * .8)
    ob.scale = (1.5, 1.5, 1.2); ob.keyframe_insert('scale', frame=F(12.95)); ob.scale = (7, 7, 5); ob.keyframe_insert('scale', frame=F(14.4))
    ob.keyframe_insert('location', frame=F(12.95)); ob.location.z -= 9; ob.location.x += dx * .5; ob.keyframe_insert('location', frame=F(14.4)); hide(ob, 12.95, 14.5)

# ———————— label masks: pass index per named part ————————
IDX = [(('v_',), 1), (('jaga',), 2), (('nata',), 3), (('bhoga',), 4), (('ros_', 'chulha', 'handi'), 5), (('megha', 'singhadwara', 'gateW', 'gateN', 'gateS'), 6), (('kurma', 'innerE'), 7), (('nilachakra', 'chakra_staff', 'flag_pole', 'flag_big', 'flag_small', 'flag_new'), 8), (('nandighosa_',), 9), (('step',), 10)]
for ob in bpy.data.objects:
    for pre, k_ in IDX:
        if ob.name.startswith(pre) and 'rope' not in ob.name: ob.pass_index = k_
# ———————— render settings ————————
sc.render.engine = 'CYCLES'; cy = sc.cycles; cy.device = 'CPU'
cy.samples = 12; cy.use_adaptive_sampling = True; cy.adaptive_threshold = .02; cy.use_denoising = True; cy.denoising_prefilter = 'FAST'; cy.denoising_quality = 'BALANCED'
cy.max_bounces = 4; cy.diffuse_bounces = 2; cy.glossy_bounces = 1; cy.transmission_bounces = 2; cy.transparent_max_bounces = 4; cy.caustics_reflective = False; cy.caustics_refractive = False
cy.use_auto_tile = False; sc.render.use_persistent_data = True
sc.render.resolution_x, sc.render.resolution_y = 720, 1280
sc.view_settings.view_transform = 'AgX'
try: sc.view_settings.look = 'AgX - Punchy'
except Exception: pass
sc.view_settings.exposure = -.25; sc.view_settings.keyframe_insert('exposure', frame=0); sc.view_settings.exposure = -.6; sc.view_settings.keyframe_insert('exposure', frame=F(7))
# aerial perspective: depth haze over the geometry (not the sky), in the compositor
vl = sc.view_layers[0]; vl.use_pass_mist = True; vl.use_pass_z = True
ms = sc.world.mist_settings; ms.start = 80; ms.depth = 3200; ms.falloff = 'QUADRATIC'
ng = bpy.data.node_groups.new('comp', 'CompositorNodeTree'); sc.compositing_node_group = ng
ng.interface.new_socket('Image', in_out='OUTPUT', socket_type='NodeSocketColor')
rl = ng.nodes.new('CompositorNodeRLayers'); gout = ng.nodes.new('NodeGroupOutput')
mixh = ng.nodes.new('ShaderNodeMix'); mixh.data_type = 'RGBA'; mixh.inputs['B'].default_value = (.80, .76, .70, 1)
k1 = ng.nodes.new('ShaderNodeMath'); k1.operation = 'MULTIPLY'; k1.inputs[1].default_value = .26
geo_ = ng.nodes.new('ShaderNodeMath'); geo_.operation = 'LESS_THAN'; geo_.inputs[1].default_value = 30000
k2 = ng.nodes.new('ShaderNodeMath'); k2.operation = 'MULTIPLY'
ng.links.new(rl.outputs['Mist'], k1.inputs[0]); ng.links.new(rl.outputs['Depth'], geo_.inputs[0]); ng.links.new(k1.outputs[0], k2.inputs[0]); ng.links.new(geo_.outputs[0], k2.inputs[1])
ng.links.new(k2.outputs[0], mixh.inputs['Factor']); ng.links.new(rl.outputs['Image'], mixh.inputs['A'])
gl = ng.nodes.new('CompositorNodeGlare')    # a soft bloom on the brightest highlights (gold, sun on white plaster)
try:
    gl.inputs['Type'].default_value = 'Bloom'
except Exception: pass
gl.inputs['Threshold'].default_value = 1.0; gl.inputs['Strength'].default_value = .35
ng.links.new(mixh.outputs['Result'], gl.inputs['Image']); ng.links.new(gl.outputs[0], gout.inputs[0])
vl.use_pass_object_index = True
dv_ = ng.nodes.new('ShaderNodeMath'); dv_.operation = 'DIVIDE'; dv_.inputs[1].default_value = 255; ng.links.new(rl.outputs['Object Index'], dv_.inputs[0])
fo = ng.nodes.new('CompositorNodeOutputFile'); fo.name = 'idxout'; fo.directory = '//idx/'; fo.file_name = 'm'
fo.format.media_type = 'IMAGE'; fo.format.file_format = 'PNG'; fo.format.color_mode = 'BW'; fo.format.color_depth = '8'; fo.save_as_render = False
fo.file_output_items.new('FLOAT', 'm'); ng.links.new(dv_.outputs[0], fo.inputs[0])
bpy.ops.object.camera_add(); cam = bpy.context.object; cam.name = 'cam'; sc.camera = cam; cam.data.lens = 35; cam.data.clip_end = 6000; cam.data.sensor_width = 36
cam.data.dof.use_dof = True; cam.data.dof.aperture_fstop = 4
tgt = bpy.data.objects.new('cam_target', None); sc.collection.objects.link(tgt)
tc = cam.constraints.new('TRACK_TO'); tc.target = tgt; tc.track_axis = 'TRACK_NEGATIVE_Z'; tc.up_axis = 'UP_Y'; cam.data.dof.focus_object = tgt
if not STATIC:
    import anim; anim.camera(cam, tgt, sc)
import json
json.dump({'build': [(o.name, round(t, 3)) for o, t in BUILD], 'ghost': GHOST}, open(os.path.join(HERE, 'events.json'), 'w'))
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, 'srimandir_static.blend' if STATIC else 'srimandir.blend'))
print('built', len(bpy.data.objects), 'objects')
