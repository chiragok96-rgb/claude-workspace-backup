"""The Gate v2 - animated 3D land (Cycles).  Renders global frame numbers (30 fps).
  /home/user/bpyenv/bin/python anim.py <outdir> <frames: "a-b,c,d-e"> [scale=1] [spp=32]
Segment A = frames 0..587 (0-19.6 s), segment B = 1290..1666 (43.0-55.56 s).
Writes <outdir>/f_NNNNN.png and <outdir>/f_NNNNN.json (screen positions of labelled world points)."""
import os, sys, json, math
os.environ.setdefault("GATE_OPEN", "0"); os.environ.setdefault("HOUSE", "1"); os.environ.setdefault("HAZE", "0")
os.environ.setdefault("SUNROT", "335"); os.environ.setdefault("ELEV", "6")
os.environ.setdefault("CARD", "2500"); os.environ.setdefault("FILL", "0.15")
OUT = sys.argv[1]; SPEC = sys.argv[2]
SCALE = float(sys.argv[3]) if len(sys.argv) > 3 else 1.0; SPP = int(sys.argv[4]) if len(sys.argv) > 4 else 28
HERE = os.path.dirname(os.path.abspath(__file__))
sys.argv = [sys.argv[0], "anim", "/dev/null"]
exec(open(os.path.join(HERE, "land.py")).read())          # builds the world, skips camera/render

import bpy
from mathutils import Vector, Euler
from bpy_extras.object_utils import world_to_camera_view
FPS = 30.0

def frames(spec):
    out = []
    for part in spec.split(","):
        if "-" in part: a, b = map(int, part.split("-")); out += list(range(a, b + 1))
        elif part: out.append(int(part))
    return out
def cl(x, a=0.0, b=1.0): return max(a, min(b, x))
def ss(a, b, t): x = cl((t - a) / (b - a)); return x * x * (3 - 2 * x)
def sm5(a, b, t): x = cl((t - a) / (b - a)); return x ** 3 * (x * (6 * x - 15) + 10)
def lerp(a, b, k): return a + (b - a) * k
def vl(a, b, k): return Vector(a).lerp(Vector(b), k)

# ---------------------------------------------------------------- camera keys (t, loc, target, lens)
KA = [(0.0, (0.6, -46.0, 1.45), (0.0, 10.0, 1.6), 28),
      (2.6, (0.6, -17.2, 1.35), (0.0, 10.0, 1.6), 28),
      (4.75, (0.62, -16.4, 1.36), (0.0, 10.0, 1.62), 28),
      (6.35, (0.85, -4.3, 1.32), (0.0, 4.0, 1.50), 26),
      (7.35, (0.95, -4.60, 1.25), (0.0, 2.0, 1.65), 28),
      (10.5, (2.70, -5.30, 0.62), (-0.3, 0.0, 1.78), 36),
      (11.6, (1.60, -4.40, 2.60), (0.0, 1.0, 1.80), 32),
      (13.2, (0.40, -4.50, 9.00), (0.0, 8.0, 0.80), 30),
      (15.6, (0.00, -8.00, 24.0), (0.0, 20.0, 0.00), 26),
      (17.6, (0.00, 2.00, 38.0), (0.0, 19.0, 0.00), 26),
      (19.7, (0.00, 15.0, 46.0), (0.0, 15.6, 0.00), 26)]
KB = [(43.0, (0.00, 15.0, 46.0), (0.0, 15.6, 0.00), 26),
      (44.7, (0.00, -14.0, 12.0), (0.0, 4.0, 1.50), 26),
      (46.0, (0.30, -5.60, 1.50), (0.0, 6.0, 1.50), 26),
      (48.4, (0.20, 9.00, 1.60), (0.0, 40.0, 1.80), 27),
      (51.6, (0.55, 23.5, 1.70), (0.0, 50.0, 2.60), 30),
      (55.6, (0.70, 26.5, 1.95), (0.0, 50.0, 3.30), 30)]

def catmull(keys, t):
    """Centripetal-ish Catmull-Rom through key positions, eased per segment (smooth stops at holds)."""
    if t <= keys[0][0]: k = keys[0]; return Vector(k[1]), Vector(k[2]), k[3]
    if t >= keys[-1][0]: k = keys[-1]; return Vector(k[1]), Vector(k[2]), k[3]
    i = 0
    while t > keys[i + 1][0]: i += 1
    a, b = keys[i], keys[i + 1]
    u = (t - a[0]) / (b[0] - a[0])
    hold = (i in HOLD_IN.get(id(keys), ()))
    if keys is KA and i == 0: u = 1 - (1 - u) ** 2.2
    else: u = sm5(0, 1, u) if hold else (u * u * (3 - 2 * u) * 0.5 + u * 0.5)
    p0 = keys[max(i - 1, 0)]; p3 = keys[min(i + 2, len(keys) - 1)]
    def cr(j):
        P0, P1, P2, P3 = (Vector(p0[j]), Vector(a[j]), Vector(b[j]), Vector(p3[j]))
        return 0.5 * ((2 * P1) + (-P0 + P2) * u + (2 * P0 - 5 * P1 + 4 * P2 - P3) * u * u + (-P0 + 3 * P1 - 3 * P2 + P3) * u ** 3)
    return cr(1), cr(2), lerp(a[3], b[3], u)
# segments that start/finish at rest get a quintic ease
HOLD_IN = {id(KA): (1, 2), id(KB): (4,)}

def camera_at(t):
    if t < 30:
        loc, tgt, lens = catmull(KA, t)
        if 6.42 < t < 7.2:   # recoil from the slam
            k = (t - 6.42); loc = loc + Vector((0, -0.10 * math.exp(-k * 7) * math.sin(k * 26), 0.02 * math.exp(-k * 7) * math.sin(k * 31)))
        if t < 2.6:          # tiny handheld float on the fast glide
            loc = loc + Vector((0.03 * math.sin(t * 2.1), 0, 0.02 * math.sin(t * 3.3)))
    else:
        loc, tgt, lens = catmull(KB, t)
    return loc, tgt, lens

# ---------------------------------------------------------------- rig objects
SCN = bpy.context.scene
cd = bpy.data.cameras.new("cam"); cd.sensor_fit = 'VERTICAL'; cd.sensor_height = 36
CAM = bpy.data.objects.new("cam", cd); B.link(CAM); SCN.camera = CAM
TGT = bpy.data.objects.new("tgt", None); B.link(TGT)
c = CAM.constraints.new('TRACK_TO'); c.target = TGT; c.track_axis = 'TRACK_NEGATIVE_Z'; c.up_axis = 'UP_Y'
cd.dof.use_dof = True; cd.dof.focus_object = TGT; cd.dof.aperture_fstop = 4.0

GL, GR = bpy.data.objects["gateL"], bpy.data.objects["gateR"]
# board hinge: rotate the board + backing about its top edge
HINGE = bpy.data.objects.new("hinge", None); B.link(HINGE); HINGE.location = (0, -0.07, 2.19)
for o in BOARD:
    mw = o.matrix_basis.copy(); o.parent = HINGE; o.matrix_parent_inverse = HINGE.matrix_basis.inverted()

def emis(name, col, strength):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree
    bs = nt.nodes["Principled BSDF"]; bs.inputs["Base Color"].default_value = (*col, 1)
    bs.inputs["Emission Color"].default_value = (*col, 1); bs.inputs["Emission Strength"].default_value = strength
    return m
M_LINE_RED = emis("line_red", (1.0, 0.30, 0.16), 3.5)
M_LINE_GOLD = emis("line_gold", (1.0, 0.55, 0.14), 1.9)
# neighbour's boundary (dashed) enclosing the road, y 0.4 .. 38, x +-9
DASH = []
def dashes(p, q, step=1.1, frac=0.6):
    p, q = Vector(p), Vector(q); L = (q - p).length; n = int(L / step); d = (q - p).normalized()
    for i in range(n):
        a = p + d * (i * step); o = B.box((step * frac, 0.09, 0.03), tuple(a + d * step * frac / 2), m=M_LINE_RED)
        o.rotation_euler = (0, 0, math.atan2(d.y, d.x)); o.location.z = ground_z(o.location.x, o.location.y) + 0.14
        DASH.append(o)
for p, q in (((-9, 0.6), (9, 0.6)), ((9, 0.6), (9, 38)), ((9, 38), (-9, 38)), ((-9, 38), (-9, 0.6))):
    dashes((*p, 0), (*q, 0))
GOVT = B.box((0.08, 1.0, 0.02), (0, 0, 0.04), m=M_LINE_GOLD)     # govt road centre line, grows from y=-60 to y=-0.3
EDGES = [B.box((0.05, 1.0, 0.02), (sx * 2.05, 0, 0.04), m=M_LINE_GOLD) for sx in (-1, 1)]  # beat 12: right-of-way corridor, gate -> plot

SUN = bpy.data.objects["sun"]; BOUNCE = bpy.data.objects.get("bounce")
SKY = [n for n in SCN.world.node_tree.nodes if n.type == 'TEX_SKY'][0]
CLOUDMAP = [n for n in SCN.world.node_tree.nodes if n.type == 'MAPPING'][0]
DOT = [n for n in SCN.world.node_tree.nodes if n.type == 'VECT_MATH' and n.operation == 'DOT_PRODUCT']
def set_sun(rot, el):
    for n in DOT: n.inputs[1].default_value = B.sky_sun_vector(rot, el)
    SKY.sun_rotation = math.radians(rot); SKY.sun_elevation = math.radians(el)
    SUN.rotation_euler = (math.radians(90 - el), 0, math.radians(188 - rot))
    if BOUNCE: BOUNCE.rotation_euler = (math.radians(118), 0, math.radians(188 - rot))

T_BASE = [(o, o.rotation_euler.z, tuple(o.scale)) for o in TUFTS]
P_BASE = [(o, o.rotation_euler.z) for o in PALMS]

# labelled world points for the caption layer
POINTS = {"neighbour": (-5.0, 20.0, 0.3), "plot": (0.0, 49.0, 0.5), "govt": (0.0, -14.0, 0.2), "board": (0.0, -0.07, 1.85),
          "house": (0.0, 51.0, 6.6), "gate": (0.0, 0.0, 1.2)}

def keyed(t):
    loc, tgt, lens = camera_at(t)
    if t < 30:
        k = 1 - sm5(6.30, 6.44, t) ** 2.2 if t < 6.44 else 0.0
        if 6.44 <= t < 7.0: k = 0.025 * math.exp(-(t - 6.44) * 9) * abs(math.sin((t - 6.44) * 30))
    else:
        k = sm5(45.9, 47.4, t)
    q = t - 7.45
    if q < 0: hz, ang = 6.0, 0.0
    elif q < 0.27: hz, ang = 6.0 - (6.0 - 2.19) * (q / 0.27) ** 2, 0.0
    else: r = q - 0.27; hz, ang = 2.19, math.radians(24) * math.exp(-r * 2.6) * math.sin(r * 7.0)
    return loc, tgt, lens, k, hz, ang

def keyframe_all(fs):
    bpy.context.preferences.edit.keyframe_new_interpolation_type = 'LINEAR'
    for f in range(min(fs) - 1, max(fs) + 2):
        loc, tgt, lens, k, hz, ang = keyed(f / FPS)
        CAM.location = loc; TGT.location = tgt; cd.lens = lens
        GL.rotation_euler = (0, 0, math.radians(100) * k); GR.rotation_euler = (0, 0, -math.radians(100) * k)
        HINGE.location = (0, -0.07, hz); HINGE.rotation_euler = (ang, 0, 0)
        CAM.keyframe_insert("location", frame=f); TGT.keyframe_insert("location", frame=f); cd.keyframe_insert("lens", frame=f)
        GL.keyframe_insert("rotation_euler", frame=f); GR.keyframe_insert("rotation_euler", frame=f)
        HINGE.keyframe_insert("location", frame=f); HINGE.keyframe_insert("rotation_euler", frame=f)
    for idb in (CAM, TGT, cd, GL, GR, HINGE):
        ad = idb.animation_data
        if ad and ad.action:
            for fc in getattr(ad.action, "fcurves", []):
                for kp in fc.keyframe_points: kp.interpolation = 'LINEAR'

def state(t):
    loc, tgt, lens = camera_at(t)
    dist = (tgt - loc).length
    cd.dof.aperture_fstop = 2.8 if (7.3 < t < 11.0) else (5.6 if dist < 30 else 11)
    # sun: golden base; time-lapse 2.75-4.65 sweeps two days of sun
    tl = ss(2.75, 3.0, t) * (1 - ss(4.4, 4.7, t)); ph = ss(2.75, 4.65, t)
    BASE_ROT, BASE_EL = (335.0, 6.0) if t < 30 else (118.0, 7.0)
    rot = BASE_ROT + 540 * ph; el = BASE_EL + tl * (22 + 14 * math.sin(ph * math.pi * 3))
    set_sun(rot % 360, el)
    CLOUDMAP.inputs["Location"].default_value = (0.02 * t + 1.6 * ph, 0.01 * t, 0)
    # grass grows during the time-lapse; wind always
    grow = 1 + 0.28 * ss(2.8, 4.6, t)
    for i, (o, rz, sc) in enumerate(T_BASE):
        x, y = o.location.x, o.location.y
        w = 0.07 * math.sin(0.33 * x + 0.11 * y - 2.1 * t) + 0.05 * math.sin(0.9 * y - 1.3 * t + 0.4 * x) + 0.03
        o.rotation_euler = (w * 0.6, w, rz); o.scale = (sc[0], sc[1], sc[2] * grow)
    for o, rz in P_BASE:
        x, y = o.location.x, o.location.y
        o.rotation_euler = (0.010 * math.sin(0.7 * t + y * 0.2), 0.014 * math.sin(0.9 * t + x * 0.3), rz)
    # gate: hidden before 4.8 s; folded open until the slam at 6.30-6.44; closed; opens 45.9-47.3
    show = t >= 3.7     # the gate is installed mid time-lapse
    for o in (GL, GR): o.hide_render = not show
    # chain + padlock after the slam (segment A only); board swings down 7.45-8.9
    for o in LOCK: o.hide_render = not (6.44 <= t < 30)
    bshow = 7.45 <= t < 30
    for o in BOARD: o.hide_render = not bshow
    pass
    # survey lines draw 12.9-15.8 (segment A only)
    nd = len(DASH); kd = ss(12.9, 15.8, t) if t < 30 else 0.0
    for i, o in enumerate(DASH): o.hide_render = not (i < kd * nd)
    kg = ss(13.4, 15.2, t) if t < 30 else 0.0
    GOVT.hide_render = kg <= 0.001
    if kg > 0.001:
        L = 60 * kg; GOVT.scale = (1, L, 1); GOVT.location = (0, -60 + L / 2 - 0.3, ground_z(0, -30) + 0.05)
    kr = ss(46.3, 48.6, t) if t >= 30 else 0.0
    for e, sx in zip(EDGES, (-1, 1)):
        e.hide_render = kr <= 0.001
        if kr > 0.001:
            L = 39.6 * kr; e.scale = (1, L, 1); e.location = (sx * 2.05, 0.3 + L / 2, ground_z(sx * 2.05, 10) + 0.03)
    # the house exists only in segment B (after the right of way is secured)
    for o in HOUSE_OBJS: o.hide_render = t < 30
    for o in PEGS: o.hide_render = t >= 30

# ---------------------------------------------------------------- render settings
SCN.render.engine = 'CYCLES'; SCN.cycles.device = 'CPU'
SCN.cycles.samples = SPP; SCN.cycles.use_adaptive_sampling = True; SCN.cycles.adaptive_threshold = 0.025
SCN.cycles.use_denoising = True
SCN.cycles.max_bounces = 4; SCN.cycles.diffuse_bounces = 2; SCN.cycles.glossy_bounces = 2; SCN.cycles.transmission_bounces = 2
SCN.cycles.seed = 7
SCN.render.use_persistent_data = True
SCN.render.resolution_x = int(1080 * SCALE); SCN.render.resolution_y = int(1920 * SCALE)
SCN.render.image_settings.file_format = 'PNG'; SCN.render.image_settings.color_depth = '8'
SCN.view_settings.view_transform = 'AgX'
for lk in ('AgX - Punchy', 'Punchy'):
    try: SCN.view_settings.look = lk; break
    except Exception: pass
SCN.view_settings.exposure = float(os.environ.get("EXPO", "-0.45"))
SCN.render.film_transparent = False
SCN.render.use_motion_blur = True; SCN.render.motion_blur_shutter = 0.5

import time
T0 = time.time()
os.makedirs(OUT, exist_ok=True)
FS = frames(SPEC)
keyframe_all(FS)
for f in FS:
    t = f / FPS
    SCN.frame_set(f)
    state(t)
    bpy.context.view_layer.update()
    pts = {}
    for k, p in POINTS.items():
        v = world_to_camera_view(SCN, CAM, Vector(p)); pts[k] = [v.x, 1 - v.y, v.z]
    path = os.path.join(OUT, "f_%05d.png" % f)
    if os.path.exists(path) and os.path.exists(path[:-4] + ".json"): continue
    SCN.render.filepath = path
    bpy.ops.render.render(write_still=True)
    json.dump({"t": t, "pts": pts}, open(path[:-4] + ".json", "w"))
    print("FRAME", f, "%.1fs" % (time.time() - T0), flush=True); T0 = time.time()
