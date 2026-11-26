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
CW = coll('world'); CT = coll('temple'); CX = coll('extras')

# ———————— land, sea, sky ————————
WD.terrain(M, CW); WD.sea(M, CW)
SUN_KEYS = [(0, 4.5, 100), (7, 9, 104), (20, 24, 112), (40, 52, 150), (52, 40, 205), (60, 30, 230), (72, 20, 245), (84.4, 11, 255)]
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
BUILD += [(TP.flag(M, CT, 'flag_big', .08, 0, z_pole + 7.2, 7.5, 2.8, 'flag'), 15.45), (TP.flag(M, CT, 'flag_small', .08, 0, z_pole + 4.4, 4.5, 1.6, 'flag2'), 15.6)]
j_out, j_top = TP.pidha_deul(M, CT, 'jaga', 27, 0, 10.5, 12, (5, 4, 3), 1.05, TP.TER, 25.45, 29.6); BUILD += j_out
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
BUILD += TP.wall_ring(M, CT, 'megha', -75, -98, 128, 98, 0, 7.2, 2.4, 57.0, 59.6, gates=[('E', 0, 8), ('W', 0, 6), ('N', 20, 6), ('S', 20, 6)], mat='laterite')
BUILD += TP.gate_tower(M, CT, 'singhadwara', 128, 0, 8, True, 0, 58.6, 59.9, 'laterite')
for nm, (x, y, ax) in (('gateW', (-75, 0, True)), ('gateN', (20, 98, False)), ('gateS', (20, -98, False))): BUILD += TP.gate_tower(M, CT, nm, x, y, 6, ax, 0, 58.8, 59.9, 'laterite')
BUILD += TP.gate_tower(M, CT, 'innerE', 92, 0, 6, True, TP.TER, 56.4, 57.4, 'laterite')
BUILD += TP.steps22(M, CT, 92 + 3.5, 92 + 3.5 + 13.2, 0, 8, TP.TER, 71.1, 72.2)

# ———————— people ————————
CP = coll('people')
door = PP.scatter((12.5, -7.5, 19, 7.5), 70, 1, lambda x, y: TP.TER); dc = PP.crowd('devotees_door', door, FIGS, CP); hide(dc, 21.4, 30.5)
spect = PP.scatter((140, 17, 480, 34), 1500, 2, minsep=.75) + PP.scatter((140, -34, 480, -17), 1500, 3, minsep=.75); sc_ = PP.crowd('spectators', spect, FIGS, CP); hide(sc_, 60.0)
# ———————— the raths, their ropes and the pullers; they roll east together ————————
CR = coll('raths'); RX = {'taladhwaja': 385, 'darpadalana': 300, 'nandighosa': 215}
for i, (nm, x, nw, Hh, ca, cb) in enumerate(RT.RATHS):
    par, parts, L_ = RT.rath(M, CR, nm, RX[nm], nw, Hh, ca, cb, 62.9 + .35 * (2 - i))
    for ob, t in parts: BUILD.append((ob, t))
    rp = RT.ropes(M, CR, nm, L_ / 2 + .2, 72)
    for r in rp: r.parent = par; hide(r, 65.0 + .1 * i)
    pull = PP.scatter((L_ / 2 + 4, -5.2, L_ / 2 + 72, 5.2), 640, 10 + i, minsep=.6); pc = PP.crowd(nm + '_pullers', pull, FIGS, CP, bob=.06, face=0.); pc.parent = par; hide(pc, 64.6)
    par.keyframe_insert('location', frame=F(65.6)); par.location.x += 14; par.keyframe_insert('location', frame=F(71.0))
# ———————— armies; the sevayat; the new flag ————————
PP.army(M, CX)
z_rel = lambda z: z - TP.TER
def east_x(z):
    zr = z - TP.TER; u = (zr - TP.H_BADA) / (TP.H_GANDI - TP.H_BADA); w = TP.gandi_w(zr, 11.5); return w * (1 + .10 * (1 - .45 * u)) + .45
path = [(75.0 + i * .2, east_x(48 + i * .45) + .0, .3, 48 + i * .45, math.pi / 2) for i in range(16)]
wt = v_wt; path += [(78.3, wt * .8 + .5, .3, TP.TER + 52.6, math.pi / 2), (78.8, wt * 1.3 + .4, .3, TP.TER + 55.6, math.pi / 2), (79.3, wt * .9, .3, TP.TER + 59.3, math.pi / 2)]
PP.climber(M, CX, path, 74.9, 79.4)
fb = bpy.data.objects['flag_big']; fb.hide_render = True; fb.keyframe_insert('hide_render', frame=F(79.35))
nf = TP.flag(M, CT, 'flag_new', .08, 0, z_pole + 7.2, 7.5, 2.8, 'flag'); nf.location.z = -6.0; nf.keyframe_insert('location', frame=F(79.35)); nf.location.z = 0; nf.keyframe_insert('location', frame=F(80.5)); hide(nf, 79.35)
# ———————— the site at dawn: dressed stones waiting on the sand ————————
rnd2 = random.Random(8)
for k in range(34):
    cx_, cy_ = ((26, -57) if k < 20 else (-22, -53)); x = cx_ + rnd2.uniform(-6, 6); y = cy_ + rnd2.uniform(-3.5, 3.5); z = (k % 3) * .62
    V, Fc = boxv(-.75, -.45, 0, .75, .45, .6); ob = mesh_obj(f'pile{k}', [(a + x, b + y, c + z) for a, b, c in V], Fc, M['stone'], CX); bevel(ob, .04); ob.rotation_euler = (0, 0, rnd2.uniform(-.15, .15)); hide(ob, -1, 24.5)
# ———————— the hook: teams haul dressed stones on wooden sledges up from the beach; masons wait at the site ————————
TEAMS = [(8, -104), (24, -95), (41, -86), (-9, -90)]
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
    cw = PP.crowd(f'haulers{i}', men, FIGS, CP, bob=.035, face=0., spread=.12, lean=-.30); cw.parent = tm
    tm.location = (x, y, 0); tm.keyframe_insert('location', frame=F(0)); tm.location = (x, y + 9.0, 0); tm.keyframe_insert('location', frame=F(21.0))
    for fc in fcurves(tm.animation_data.action):
        for kp in fc.keyframe_points: kp.interpolation = 'LINEAR'
    for o in [tm] + list(tm.children): hide(o, -1, 21.0)
def _clear(x, y): return not ((20 < x < 32.8 and -61 < y < -53) or (-28.8 < x < -15.2 and -57 < y < -49))
mas = [p for p in PP.scatter((17, -64, 36, -49), 34, 31, minsep=1.1) + PP.scatter((-31, -60, -12, -45), 30, 32, minsep=1.1) if _clear(p[0], p[1])]
mas += PP.scatter((-17, -21, 17, -15.5), 26, 33, lambda x, y: TP.TER, minsep=1.3)
mc = PP.crowd('masons', mas, FIGS, CP, bob=.02); hide(mc, -1, 21.0)
# the ship rolls gently
shp = bpy.data.objects['ship']
for k in range(0, 85):
    shp.rotation_euler = (math.radians(1.6 * math.sin(k * 1.3)), math.radians(.8 * math.sin(k * .9)), math.radians(-60)); shp.location.z = -1.2 + .25 * math.sin(k * 1.1); shp.location.x = -70 + k * .2
    shp.keyframe_insert('rotation_euler', frame=F(k)); shp.keyframe_insert('location', frame=F(k))
if STATIC:
    pass
else:
    for ob, t in BUILD: appear(ob, t, .32 if ob.name.startswith(('v_', 'jaga', 'bhoga', 'nata')) else .45, 2.0 if ob.name.startswith('v_') else 1.4)

# ———————— render settings ————————
sc.render.engine = 'CYCLES'; cy = sc.cycles; cy.device = 'CPU'
cy.samples = 12; cy.use_adaptive_sampling = True; cy.adaptive_threshold = .02; cy.use_denoising = True; cy.denoising_prefilter = 'FAST'; cy.denoising_quality = 'BALANCED'
cy.max_bounces = 4; cy.diffuse_bounces = 2; cy.glossy_bounces = 1; cy.transmission_bounces = 2; cy.transparent_max_bounces = 4; cy.caustics_reflective = False; cy.caustics_refractive = False
cy.use_auto_tile = False; sc.render.use_persistent_data = True
sc.render.resolution_x, sc.render.resolution_y = 720, 1280
sc.view_settings.view_transform = 'AgX'
try: sc.view_settings.look = 'AgX - Medium High Contrast'
except Exception: pass
sc.view_settings.exposure = -.25; sc.view_settings.keyframe_insert('exposure', frame=0); sc.view_settings.exposure = -.6; sc.view_settings.keyframe_insert('exposure', frame=F(7))
# aerial perspective: depth haze over the geometry (not the sky), in the compositor
vl = sc.view_layers[0]; vl.use_pass_mist = True; vl.use_pass_z = True
ms = sc.world.mist_settings; ms.start = 80; ms.depth = 3200; ms.falloff = 'QUADRATIC'
ng = bpy.data.node_groups.new('comp', 'CompositorNodeTree'); sc.compositing_node_group = ng
ng.interface.new_socket('Image', in_out='OUTPUT', socket_type='NodeSocketColor')
rl = ng.nodes.new('CompositorNodeRLayers'); gout = ng.nodes.new('NodeGroupOutput')
mixh = ng.nodes.new('ShaderNodeMix'); mixh.data_type = 'RGBA'; mixh.inputs['B'].default_value = (.70, .70, .69, 1)
k1 = ng.nodes.new('ShaderNodeMath'); k1.operation = 'MULTIPLY'; k1.inputs[1].default_value = .5
geo_ = ng.nodes.new('ShaderNodeMath'); geo_.operation = 'LESS_THAN'; geo_.inputs[1].default_value = 30000
k2 = ng.nodes.new('ShaderNodeMath'); k2.operation = 'MULTIPLY'
ng.links.new(rl.outputs['Mist'], k1.inputs[0]); ng.links.new(rl.outputs['Depth'], geo_.inputs[0]); ng.links.new(k1.outputs[0], k2.inputs[0]); ng.links.new(geo_.outputs[0], k2.inputs[1])
ng.links.new(k2.outputs[0], mixh.inputs['Factor']); ng.links.new(rl.outputs['Image'], mixh.inputs['A']); ng.links.new(mixh.outputs['Result'], gout.inputs[0])
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
