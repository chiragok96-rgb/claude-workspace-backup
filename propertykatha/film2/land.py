"""PropertyKatha v2 - the land: laterite road, iron gate, laterite walls, coconut palms, grass, paddy.
Look-dev scene (Blender 5 / Cycles).  Run:
  /home/user/bpyenv/bin/python land.py <shot> <out.png> [scale] [samples]
shots: hook (low on the road, gate + board) | aerial (crane over the gate)
"""
import sys, os, random, math, bpy, bmesh
from math import radians as R, sin, cos, pi, atan2
from mathutils import Vector, Matrix, Euler
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "skills", "code-motion", "scripts"))
import bl_lib as B

HERE = os.path.dirname(os.path.abspath(__file__))
shot = sys.argv[1] if len(sys.argv) > 1 else "hook"
out = sys.argv[2] if len(sys.argv) > 2 else "/tmp/land.png"
scale = float(sys.argv[3]) if len(sys.argv) > 3 else 0.25
spp = int(sys.argv[4]) if len(sys.argv) > 4 else 32
random.seed(11)
B.reset(); SC = B.SC

# ---------------------------------------------------------------- node helpers
def nodes(m):
    nt = m.node_tree; return nt, nt.nodes, nt.links
def N(nt, t, **kw):
    n = nt.nodes.new(t)
    for k, v in kw.items():
        if k in n.inputs: n.inputs[k].default_value = v
        else: setattr(n, k, v)
    return n
def ramp(nt, stops):
    r = nt.nodes.new("ShaderNodeValToRGB"); el = r.color_ramp.elements
    el[0].position, el[0].color = stops[0][0], (*stops[0][1], 1)
    el[1].position, el[1].color = stops[-1][0], (*stops[-1][1], 1)
    for p, c in stops[1:-1]:
        e = el.new(p); e.color = (*c, 1)
    return r

# ---------------------------------------------------------------- materials
def m_ground():
    m = bpy.data.materials.new("ground"); m.use_nodes = True
    nt, ns, L = nodes(m); bs = ns["Principled BSDF"]
    tc = N(nt, "ShaderNodeTexCoord")
    sep = N(nt, "ShaderNodeSeparateXYZ"); L.new(tc.outputs["Object"], sep.inputs[0])
    ax = N(nt, "ShaderNodeMath", operation="ABSOLUTE"); L.new(sep.outputs["X"], ax.inputs[0])
    # wobbly road edge
    wob = N(nt, "ShaderNodeTexNoise", Scale=0.35, Detail=3.0); L.new(tc.outputs["Object"], wob.inputs["Vector"])
    wb = N(nt, "ShaderNodeMath", operation="MULTIPLY_ADD"); wb.inputs[1].default_value = 0.9; wb.inputs[2].default_value = -0.45
    L.new(wob.outputs["Fac"], wb.inputs[0])
    ax2 = N(nt, "ShaderNodeMath", operation="ADD"); L.new(ax.outputs[0], ax2.inputs[0]); L.new(wb.outputs[0], ax2.inputs[1])
    road = N(nt, "ShaderNodeMapRange", interpolation_type="SMOOTHSTEP")
    road.inputs["From Min"].default_value = 2.15; road.inputs["From Max"].default_value = 3.2
    road.inputs["To Min"].default_value = 1.0; road.inputs["To Max"].default_value = 0.0
    L.new(ax2.outputs[0], road.inputs["Value"])
    # laterite colour: large blotches + fine grit
    n1 = N(nt, "ShaderNodeTexNoise", Scale=0.9, Detail=8.0, Roughness=0.6); L.new(tc.outputs["Object"], n1.inputs["Vector"])
    c1 = ramp(nt, [(0.30, (0.27, 0.075, 0.03)), (0.55, (0.42, 0.13, 0.05)), (0.75, (0.55, 0.21, 0.08))])
    L.new(n1.outputs["Fac"], c1.inputs[0])
    # road: paler, dusty, tyre ruts along Y
    wv = N(nt, "ShaderNodeTexWave", wave_type="BANDS", bands_direction="X", Scale=0.55, Distortion=1.2, **{"Detail": 4.0})
    L.new(tc.outputs["Object"], wv.inputs["Vector"])
    rut = N(nt, "ShaderNodeMath", operation="POWER"); rut.inputs[1].default_value = 3.0; L.new(wv.outputs["Fac"], rut.inputs[0])
    c2 = ramp(nt, [(0.2, (0.50, 0.20, 0.085)), (0.8, (0.66, 0.33, 0.16))]); L.new(n1.outputs["Fac"], c2.inputs[0])
    # grass tint under the tufts (where not road)
    n3 = N(nt, "ShaderNodeTexNoise", Scale=2.2, Detail=6.0); L.new(tc.outputs["Object"], n3.inputs["Vector"])
    c3 = ramp(nt, [(0.35, (0.10, 0.11, 0.03)), (0.65, (0.30, 0.20, 0.06))]); L.new(n3.outputs["Fac"], c3.inputs[0])
    mixg = N(nt, "ShaderNodeMix", data_type="RGBA"); mixg.inputs["Factor"].default_value = 0.55
    L.new(c1.outputs[0], mixg.inputs["A"]); L.new(c3.outputs[0], mixg.inputs["B"])
    mix = N(nt, "ShaderNodeMix", data_type="RGBA")
    L.new(road.outputs[0], mix.inputs["Factor"]); L.new(mixg.outputs["Result"], mix.inputs["A"]); L.new(c2.outputs[0], mix.inputs["B"])
    L.new(mix.outputs["Result"], bs.inputs["Base Color"])
    bs.inputs["Roughness"].default_value = 0.93
    # bump: voronoi pits (laterite) + ruts
    vo = N(nt, "ShaderNodeTexVoronoi", Scale=14.0); L.new(tc.outputs["Object"], vo.inputs["Vector"])
    gr = N(nt, "ShaderNodeTexNoise", Scale=60.0, Detail=4.0); L.new(tc.outputs["Object"], gr.inputs["Vector"])
    hh = N(nt, "ShaderNodeMath", operation="ADD"); L.new(vo.outputs["Distance"], hh.inputs[0]); L.new(gr.outputs["Fac"], hh.inputs[1])
    hr = N(nt, "ShaderNodeMath", operation="MULTIPLY_ADD"); L.new(rut.outputs[0], hr.inputs[0]); L.new(road.outputs[0], hr.inputs[1]); L.new(hh.outputs[0], hr.inputs[2])
    bump = N(nt, "ShaderNodeBump", Strength=0.35, Distance=0.05); L.new(hr.outputs[0], bump.inputs["Height"])
    L.new(bump.outputs[0], bs.inputs["Normal"])
    return m

def m_leaf(name, col, trans=0.45):
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt, ns, L = nodes(m); bs = ns["Principled BSDF"]; out = ns["Material Output"]
    oi = N(nt, "ShaderNodeObjectInfo")
    hv = N(nt, "ShaderNodeHueSaturation"); hv.inputs["Color"].default_value = (*col, 1)
    rr = N(nt, "ShaderNodeMath", operation="MULTIPLY_ADD"); rr.inputs[1].default_value = 0.08; rr.inputs[2].default_value = 0.46
    L.new(oi.outputs["Random"], rr.inputs[0]); L.new(rr.outputs[0], hv.inputs["Hue"])
    vv = N(nt, "ShaderNodeMath", operation="MULTIPLY_ADD"); vv.inputs[1].default_value = 0.5; vv.inputs[2].default_value = 0.75
    L.new(oi.outputs["Random"], vv.inputs[0]); L.new(vv.outputs[0], hv.inputs["Value"])
    L.new(hv.outputs[0], bs.inputs["Base Color"])
    bs.inputs["Roughness"].default_value = 0.45
    tr = N(nt, "ShaderNodeBsdfTranslucent"); tr.inputs["Color"].default_value = (col[0]*2.2, col[1]*2.4, col[2]*1.2, 1)
    mx = N(nt, "ShaderNodeMixShader"); mx.inputs["Fac"].default_value = trans
    L.new(bs.outputs[0], mx.inputs[1]); L.new(tr.outputs[0], mx.inputs[2]); L.new(mx.outputs[0], out.inputs["Surface"])
    return m

def m_iron():
    m = bpy.data.materials.new("iron"); m.use_nodes = True
    nt, ns, L = nodes(m); bs = ns["Principled BSDF"]
    tc = N(nt, "ShaderNodeTexCoord")
    nz = N(nt, "ShaderNodeTexNoise", Scale=9.0, Detail=10.0, Roughness=0.7); L.new(tc.outputs["Object"], nz.inputs["Vector"])
    c = ramp(nt, [(0.55, (0.018, 0.017, 0.016)), (0.68, (0.16, 0.06, 0.025))]); L.new(nz.outputs["Fac"], c.inputs[0])
    L.new(c.outputs[0], bs.inputs["Base Color"])
    rg = ramp(nt, [(0.55, (0.32, 0.32, 0.32)), (0.68, (0.85, 0.85, 0.85))]); L.new(nz.outputs["Fac"], rg.inputs[0])
    L.new(rg.outputs[0], bs.inputs["Roughness"]); bs.inputs["Metallic"].default_value = 0.55
    return m

def m_laterite():
    m = bpy.data.materials.new("lat"); m.use_nodes = True
    nt, ns, L = nodes(m); bs = ns["Principled BSDF"]
    tc = N(nt, "ShaderNodeTexCoord"); oi = N(nt, "ShaderNodeObjectInfo")
    vo = N(nt, "ShaderNodeTexVoronoi", Scale=38.0); L.new(tc.outputs["Object"], vo.inputs["Vector"])
    nz = N(nt, "ShaderNodeTexNoise", Scale=6.0, Detail=6.0); L.new(tc.outputs["Object"], nz.inputs["Vector"])
    a = N(nt, "ShaderNodeMath", operation="ADD"); L.new(nz.outputs["Fac"], a.inputs[0]); L.new(oi.outputs["Random"], a.inputs[1])
    a2 = N(nt, "ShaderNodeMath", operation="MULTIPLY"); a2.inputs[1].default_value = 0.5; L.new(a.outputs[0], a2.inputs[0])
    c = ramp(nt, [(0.25, (0.30, 0.085, 0.035)), (0.5, (0.47, 0.17, 0.07)), (0.75, (0.60, 0.29, 0.13))]); L.new(a2.outputs[0], c.inputs[0])
    pit = ramp(nt, [(0.0, (0.25, 0.25, 0.25)), (0.12, (1, 1, 1))]); L.new(vo.outputs["Distance"], pit.inputs[0])
    mm = N(nt, "ShaderNodeMix", data_type="RGBA", blend_type="MULTIPLY"); mm.inputs["Factor"].default_value = 1.0
    L.new(c.outputs[0], mm.inputs["A"]); L.new(pit.outputs[0], mm.inputs["B"])
    L.new(mm.outputs["Result"], bs.inputs["Base Color"]); bs.inputs["Roughness"].default_value = 0.95
    bump = N(nt, "ShaderNodeBump", Strength=0.6, Distance=0.02); L.new(vo.outputs["Distance"], bump.inputs["Height"])
    L.new(bump.outputs[0], bs.inputs["Normal"])
    return m

def m_image(name, path, rough=0.6, metal=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt, ns, L = nodes(m); bs = ns["Principled BSDF"]
    it = N(nt, "ShaderNodeTexImage"); it.image = bpy.data.images.load(path)
    L.new(it.outputs["Color"], bs.inputs["Base Color"])
    bs.inputs["Roughness"].default_value = rough; bs.inputs["Metallic"].default_value = metal
    return m

M_GROUND = m_ground(); M_IRON = m_iron(); M_LAT = m_laterite()
M_FROND = m_leaf("frond", (0.10, 0.20, 0.035)); M_GRASS = m_leaf("grass", (0.20, 0.24, 0.05), 0.35)
M_PADDY = m_leaf("paddy", (0.16, 0.30, 0.04), 0.4)
M_TRUNK = B.mat("trunk", (0.16, 0.12, 0.09), rough=0.9)
M_BRASS = B.mat("brass", (0.80, 0.55, 0.20), rough=0.28, metal=1.0)
M_MORTAR = B.mat("mortar", (0.55, 0.47, 0.38), rough=0.95)
M_CAP = B.mat("cap", (0.62, 0.56, 0.48), rough=0.8)
M_POST = B.mat("post", (0.10, 0.07, 0.05), rough=0.8)
M_FAR = m_leaf("far", (0.06, 0.10, 0.03), 0.2)

# ---------------------------------------------------------------- terrain
def terrain():
    bm = bmesh.new()
    bmesh.ops.create_grid(bm, x_segments=240, y_segments=300, size=1)
    bmesh.ops.scale(bm, vec=(160, 260, 1), verts=bm.verts)
    bmesh.ops.translate(bm, vec=(0, 110, 0), verts=bm.verts)
    for v in bm.verts:
        x, y = v.co.x, v.co.y
        ax = abs(x)
        rd = max(0.0, min(1.0, (ax - 2.2) / 1.5))  # 0 on road
        h = 0.06 * sin(x * 0.7 + y * 0.31) + 0.05 * sin(y * 0.9 - x * 0.4) + 0.03 * sin(x * 2.3 + y * 1.7)
        v.co.z = h * rd + 0.10 * rd - 0.02 * (1 - rd) + 0.01 * sin(y * 1.9)
    me = bpy.data.meshes.new("terrain"); bm.to_mesh(me); bm.free()
    for p in me.polygons: p.use_smooth = True
    o = bpy.data.objects.new("terrain", me); B.link(o); me.materials.append(M_GROUND)
    return o
def ground_z(x, y):
    ax = abs(x); rd = max(0.0, min(1.0, (ax - 2.2) / 1.5))
    h = 0.06 * sin(x * 0.7 + y * 0.31) + 0.05 * sin(y * 0.9 - x * 0.4) + 0.03 * sin(x * 2.3 + y * 1.7)
    return h * rd + 0.10 * rd - 0.02 * (1 - rd) + 0.01 * sin(y * 1.9)

# ---------------------------------------------------------------- palm
def palm_mesh(seed, height=9.0, lean=0.6, nfr=24):
    rnd = random.Random(seed)
    bm = bmesh.new()
    # trunk: tapered tube along a gentle curve, with growth rings
    seg, rings = 10, 34
    pts = []
    for i in range(rings + 1):
        t = i / rings
        c = Vector((lean * t * t * 1.6, 0.25 * lean * sin(t * 2.4), height * t))
        r = 0.21 * (1 - 0.35 * t) * (1.0 + (0.5 * (1 - t) ** 8)) * (1.0 + 0.05 * ((i % 2) * 2 - 1))
        pts.append((c, r))
    vr = []
    for c, r in pts:
        vr.append([bm.verts.new(c + Vector((cos(2 * pi * k / seg) * r, sin(2 * pi * k / seg) * r, 0))) for k in range(seg)])
    tf = []
    for a, b in zip(vr, vr[1:]):
        for k in range(seg):
            tf.append(bm.faces.new((a[k], a[(k + 1) % seg], b[(k + 1) % seg], b[k])))
    for f in tf: f.material_index = 0; f.smooth = True
    top = pts[-1][0]
    # fronds
    for j in range(nfr):
        az = 2 * pi * j / nfr + rnd.uniform(-0.15, 0.15)
        tier = j % 3
        up = R([44, 22, 2][tier] + rnd.uniform(-8, 8))
        Lf = rnd.uniform(3.6, 4.6) * (0.85 if tier == 0 else 1.0)
        droop = rnd.uniform(1.6, 2.4) + 0.4 * tier
        dirh = Vector((cos(az), sin(az), 0))
        side = Vector((-sin(az), cos(az), 0))
        n = 26
        spine = []
        for i in range(n + 1):
            s = i / n
            horiz = Lf * s * cos(up) * (1 - 0.1 * s)
            vert = Lf * s * sin(up) - droop * s ** 2.2
            spine.append(top + dirh * horiz + Vector((0, 0, vert)))
        # rachis
        for i in range(n):
            p0, p1 = spine[i], spine[i + 1]
            w = 0.035 * (1 - i / n) + 0.006
            a0 = bm.verts.new(p0 - side * w); a1 = bm.verts.new(p0 + side * w)
            b1 = bm.verts.new(p1 + side * w * 0.9); b0 = bm.verts.new(p1 - side * w * 0.9)
            f = bm.faces.new((a0, a1, b1, b0)); f.material_index = 1
        # leaflets: V-shaped pairs hanging down and out
        for i in range(2, n):
            s = i / n
            p = spine[i]; tan = (spine[i + 1] - spine[i - 1]).normalized()
            ll = (0.95 * sin(pi * min(1, s * 1.15)) + 0.15) * rnd.uniform(0.85, 1.1)
            for sd in (-1, 1):
                for sub in (0, 0.5):
                    q = spine[i] + (spine[i + 1] - spine[i]) * sub
                    out = (side * sd * 0.82 + Vector((0, 0, -0.55 - 0.25 * s)) + tan * 0.35).normalized()
                    tip = q + out * ll + Vector((0, 0, -0.12 * ll * ll))
                    mid = q + out * ll * 0.5 + Vector((0, 0, -0.02))
                    wv = tan * 0.035
                    v0 = bm.verts.new(q); v1 = bm.verts.new(mid + wv); v2 = bm.verts.new(tip); v3 = bm.verts.new(mid - wv)
                    f = bm.faces.new((v0, v1, v2, v3)); f.material_index = 1
    # coconuts cluster
    me = bpy.data.meshes.new(f"palm{seed}"); bm.to_mesh(me); bm.free()
    me.materials.append(M_TRUNK); me.materials.append(M_FROND)
    return me

def tuft_mesh(seed, n=14, h=0.5):
    rnd = random.Random(seed); bm = bmesh.new()
    for i in range(n):
        a = rnd.uniform(0, 2 * pi); r0 = rnd.uniform(0, 0.12)
        base = Vector((cos(a) * r0, sin(a) * r0, 0))
        lean = Vector((cos(a), sin(a), 0)) * rnd.uniform(0.08, 0.3)
        hh = h * rnd.uniform(0.5, 1.2); w = 0.012
        side = Vector((-sin(a), cos(a), 0))
        prev = None
        segs = 4
        for s in range(segs + 1):
            t = s / segs
            c = base + lean * t * t * 1.4 + Vector((0, 0, hh * t))
            ww = w * (1 - t) + 0.001
            pair = (bm.verts.new(c - side * ww), bm.verts.new(c + side * ww))
            if prev: bm.faces.new((prev[0], prev[1], pair[1], pair[0]))
            prev = pair
    me = bpy.data.meshes.new(f"tuft{seed}"); bm.to_mesh(me); bm.free(); me.materials.append(M_GRASS)
    return me

def tree_blob_mesh(seed):
    """Distant mango/banyan canopy: clustered spheres, displaced."""
    rnd = random.Random(seed); bm = bmesh.new()
    for k in range(9):
        c = Vector((rnd.uniform(-2.5, 2.5), rnd.uniform(-2.5, 2.5), rnd.uniform(3.5, 6.0)))
        r = rnd.uniform(1.6, 2.6)
        g = bmesh.ops.create_icosphere(bm, subdivisions=2, radius=r)
        for v in g["verts"]:
            v.co += c; v.co.z = max(v.co.z, c.z - r * 0.4)
    g = bmesh.ops.create_cone(bm, cap_ends=True, segments=8, radius1=0.35, radius2=0.25, depth=4)
    for v in g["verts"]: v.co.z += 2.0
    me = bpy.data.meshes.new(f"tree{seed}"); bm.to_mesh(me); bm.free(); me.materials.append(M_FAR)
    for p in me.polygons: p.use_smooth = True
    return me

# ---------------------------------------------------------------- gate + walls
def gate_leaf(x0, x1, name, rot_z=0.0, pivot=None):
    parts = []; H = 2.25; w = x1 - x0; nb = int(abs(w) / 0.115)
    for i in range(nb + 1):
        x = x0 + (x1 - x0) * i / nb
        parts.append(B.box((0.026, 0.026, H), (x, 0, 0.12 + H / 2), m=M_IRON))
        bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=4, radius1=0.04, radius2=0.0, depth=0.14)
        parts.append(B._fin(bm, "spear", (x, 0, 0.12 + H + 0.07), (0, 0, R(45)), M_IRON))
    xm, xw = (x0 + x1) / 2, abs(x1 - x0)
    for z in (0.22, 0.62, 1.55, 2.25):
        parts.append(B.box((xw, 0.05, 0.05), (xm, 0, z), m=M_IRON))
    # rings between lower rails
    for i in range(int(xw / 0.32)):
        x = min(x0, x1) + 0.16 + i * 0.32
        tor = torus(0.155, 0.012, (x, 0, 0.42))
        parts.append(tor)
    o = B.merge(parts, name)
    return o

def torus(R0, r, loc, rot=(R(90), 0, 0), seg=24, sseg=6, m=None):
    bm = bmesh.new(); rings = []
    for i in range(seg):
        a = 2 * pi * i / seg
        c = Vector((cos(a) * R0, sin(a) * R0, 0)); d = Vector((cos(a), sin(a), 0))
        rings.append([bm.verts.new(c + d * cos(2 * pi * k / sseg) * r + Vector((0, 0, sin(2 * pi * k / sseg) * r))) for k in range(sseg)])
    for i in range(seg):
        A, Bb = rings[i], rings[(i + 1) % seg]
        for k in range(sseg):
            f = bm.faces.new((A[k], A[(k + 1) % sseg], Bb[(k + 1) % sseg], Bb[k])); f.smooth = True
    return B._fin(bm, "tor", loc, rot, m or M_IRON)

def wall(x0, x1, y=0.0, h=1.55, name="wall"):
    bl = bpy.data.meshes.new("block")
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1); bmesh.ops.scale(bm, vec=(0.39, 0.30, 0.19), verts=bm.verts)
    bmesh.ops.bevel(bm, geom=bm.edges[:], offset=0.012, segments=1, affect='EDGES')
    bm.to_mesh(bl); bm.free(); bl.materials.append(M_LAT)
    rows = int(h / 0.2); n = int(abs(x1 - x0) / 0.4)
    sgn = 1 if x1 > x0 else -1
    def place(i):
        r, c = divmod(i, n)
        x = x0 + sgn * (0.2 + c * 0.4 + (0.2 if r % 2 else 0))
        if (x - x1) * sgn > 0: return None
        return ((x, y + random.uniform(-0.01, 0.01), ground_z(x, y) + 0.1 + r * 0.2),
                random.uniform(-0.015, 0.015), (1, 1, 1))
    par, _ = B.instance(bl, rows * n, place, name)
    mo = B.box((abs(x1 - x0), 0.26, rows * 0.2), ((x0 + x1) / 2, y, rows * 0.1 + 0.05), m=M_MORTAR)
    cap = B.box((abs(x1 - x0), 0.36, 0.07), ((x0 + x1) / 2, y, rows * 0.2 + 0.08), m=M_CAP)
    return par

def pillar(x, y=0.0):
    parts = [B.box((0.62, 0.62, 2.55), (x, y, 1.27), m=M_LAT),
             B.box((0.74, 0.74, 0.1), (x, y, 2.6), m=M_CAP),
             B.box((0.52, 0.52, 0.12), (x, y, 2.71), m=M_CAP)]
    sp = B.sph(0.16, (x, y, 2.9), m=M_CAP)
    return parts

# ---------------------------------------------------------------- build world
terrain()
GATE_OPEN = float(os.environ.get("GATE_OPEN", "0"))   # 0 closed .. 1 open
leaves = []
if GATE_OPEN >= 0:
    leaves = [(gate_leaf(-1.95, 0.0, "gateL"), -1.95, 1), (gate_leaf(0.0, 1.95, "gateR"), 1.95, -1)]
# hinge pivots at the pillars
for o, hx, sg in leaves:
    me = o.data; me.transform(Matrix.Translation((-hx, 0, 0))); o.location = (hx, 0, 0)
    o.rotation_euler = (0, 0, sg * R(100) * GATE_OPEN)
pillar(-2.3); pillar(2.3)
wall(-2.62, -40); wall(2.62, 40)
# chain + padlock across the meeting stiles (only when closed)
LOCK = []; BOARD = []
if 0 <= GATE_OPEN < 0.05:
    _n0 = set(bpy.data.objects.keys())
    for i in range(9):
        a = i / 8
        x = -0.22 + 0.44 * a; z = 1.05 - 0.08 * sin(pi * a)
        torus(0.032, 0.007, (x, -0.04, z), rot=(R(90) * (i % 2), R(90) * ((i + 1) % 2), 0), seg=14, sseg=5, m=M_IRON)
    B.box((0.11, 0.035, 0.12), (0.02, -0.07, 0.86), m=M_BRASS)
    torus(0.04, 0.009, (0.02, -0.07, 0.93), rot=(R(90), 0, 0), seg=16, sseg=5, m=M_IRON)
    LOCK = [bpy.data.objects[k] for k in set(bpy.data.objects.keys()) - _n0]
    _n0 = set(bpy.data.objects.keys())
    # neighbour's board wired to the gate
    bw, bh = 1.7, 0.68
    bmb = bmesh.new(); bmb.loops.layers.uv.new(); bmesh.ops.create_grid(bmb, x_segments=1, y_segments=1, size=0.5, calc_uvs=True)
    bmesh.ops.scale(bmb, vec=(bw, bh, 1), verts=bmb.verts)
    bd = B._fin(bmb, "board", (0, -0.075, 1.85), (R(90), 0, 0), m_image("board", os.path.join(HERE, "tex/board.png"), rough=0.55, metal=0.25))
    bd.rotation_euler = (R(88), R(1.5), 0)
    B.box((bw + 0.02, 0.012, bh + 0.02), (0, -0.066, 1.85), m=M_POST)
    BOARD = [bpy.data.objects[k] for k in set(bpy.data.objects.keys()) - _n0]

# the plot: brass-capped survey pegs with gold ribbon at y 40..58
_p0 = set(bpy.data.objects.keys())
M_GOLD = B.mat("goldr", (0.95, 0.68, 0.25), rough=0.35, metal=0.6)
for (px, py) in ((-7, 40), (7, 40), (-7, 58), (7, 58)):
    B.box((0.08, 0.08, 0.55), (px, py, ground_z(px, py) + 0.27), m=M_POST)
    B.sph(0.06, (px, py, ground_z(px, py) + 0.58), m=M_BRASS)
for (a, b) in (((-7, 40), (7, 40)), ((7, 40), (7, 58)), ((7, 58), (-7, 58)), ((-7, 58), (-7, 40))):
    mx, my = (a[0] + b[0]) / 2, (a[1] + b[1]) / 2; L = ((b[0]-a[0])**2 + (b[1]-a[1])**2) ** .5
    o = B.box((L, 0.02, 0.008), (mx, my, 0.45), m=M_GOLD); o.rotation_euler = (0, 0, atan2(b[1]-a[1], b[0]-a[0]))
PEGS = [bpy.data.objects[k] for k in set(bpy.data.objects.keys()) - _p0]
_h0 = set(bpy.data.objects.keys())
if os.environ.get("HOUSE") == "1":
    # A calm modern Odisha home on the plot: laterite plinth, white plaster volumes, a cantilevered upper floor
    # with teak fins, warm-lit glazing with bronze mullions, low laterite compound wall, lawn and a paved drive.
    M_WALLW = B.mat("wallw", (0.84, 0.81, 0.75), rough=0.82)
    M_TEAK = B.mat("teak", (0.30, 0.14, 0.055), rough=0.5)
    M_BRONZE = B.mat("bronze", (0.10, 0.075, 0.05), rough=0.35, metal=0.8)
    M_PAVE = B.mat("pave", (0.55, 0.50, 0.44), rough=0.75)
    M_LAWN = m_leaf("lawn", (0.13, 0.22, 0.05), 0.15)
    M_WARM = B.mat("warmroom", (1.0, 0.75, 0.48), rough=0.9, emit=(1.0, 0.66, 0.36), es=2.2)
    M_ROOM = B.mat("room", (0.22, 0.13, 0.07), rough=0.85, emit=(1.0, 0.58, 0.28), es=0.35)
    M_LAMP = B.mat("lamp", (1.0, 0.8, 0.5), rough=0.5, emit=(1.0, 0.70, 0.40), es=14.0)
    gm = bpy.data.materials.new("glass"); gm.use_nodes = True
    _g = gm.node_tree.nodes["Principled BSDF"]; _g.inputs["Base Color"].default_value = (0.85, 0.88, 0.86, 1)
    _g.inputs["Roughness"].default_value = 0.03; _g.inputs["Transmission Weight"].default_value = 1.0; _g.inputs["IOR"].default_value = 1.5
    hy = 51.5
    # compound wall along the front (gap for the drive) and the sides, with lamp pillars
    for (x0, x1) in ((-7.0, -1.9), (1.9, 7.0)):
        B.box((x1 - x0, 0.3, 0.9), ((x0 + x1) / 2, 40.2, 0.45), m=M_LAT); B.box((x1 - x0 + 0.06, 0.38, 0.06), ((x0 + x1) / 2, 40.2, 0.93), m=M_CAP)
    for sx in (-1, 1):
        B.box((0.3, 17.6, 0.9), (sx * 7.0, 49.0, 0.45), m=M_LAT); B.box((0.38, 17.6, 0.06), (sx * 7.0, 49.0, 0.93), m=M_CAP)
        B.box((0.5, 0.5, 1.5), (sx * 1.9, 40.2, 0.75), m=M_LAT); B.box((0.36, 0.36, 0.28), (sx * 1.9, 40.2, 1.64), m=M_WARM)
    B.box((13.6, 17.4, 0.06), (0, 49.0, 0.03), m=M_LAWN)                       # lawn
    B.box((3.0, 8.6, 0.08), (0.6, 44.6, 0.05), m=M_PAVE)                        # drive
    B.box((11.6, 7.6, 0.5), (0, hy, 0.25), m=M_LAT)                            # plinth
    B.box((2.4, 0.9, 0.18), (0.6, hy - 4.15, 0.09), m=M_CAP)                    # step
    # ground floor: solid left block with a tall teak pivot door, glass living room on the right
    B.box((4.6, 6.8, 3.1), (-3.3, hy + 0.3, 2.05), m=M_WALLW)
    B.box((1.15, 0.08, 2.5), (-1.55, hy - 3.07, 1.75), m=M_TEAK)
    B.box((5.6, 6.0, 3.1), (2.6, hy + 0.9, 2.05), m=M_ROOM)                     # dim warm interior seen through glass
    for (lx, lz) in ((1.0, 2.55), (2.6, 2.75), (4.2, 2.55)):                      # pendant lamps inside
        B.sph(0.16, (lx, hy - 1.2, lz), m=M_LAMP); B.box((0.01, 0.01, 0.9), (lx, hy - 1.2, lz + 0.5), m=M_BRONZE)
    il = bpy.data.lights.new('interior', type='AREA'); il.size = 4.5; il.energy = 260; il.color = (1, 0.62, 0.32)
    io = bpy.data.objects.new('interior', il); B.link(io); io.location = (2.6, hy - 0.6, 3.4)
    B.box((5.6, 0.04, 3.0), (2.6, hy - 2.25, 2.0), m=gm)                        # glazing
    for k in range(6):                                                         # bronze mullions
        B.box((0.06, 0.08, 3.05), (-0.2 + k * 1.12, hy - 2.2, 2.02), m=M_BRONZE)
    B.box((5.7, 0.1, 0.08), (2.6, hy - 2.2, 3.55), m=M_BRONZE); B.box((5.7, 0.1, 0.08), (2.6, hy - 2.2, 0.53), m=M_BRONZE)
    # first-floor slab and the cantilevered upper volume
    B.box((11.8, 8.4, 0.28), (0.2, hy + 0.1, 3.74), m=M_WALLW)
    B.box((8.2, 6.6, 2.9), (1.2, hy - 0.2, 5.33), m=M_WALLW)
    B.box((6.6, 0.06, 1.7), (1.2, hy - 3.54, 5.25), m=M_ROOM)                   # long window strip (dim warm room)
    for lx in (-1.2, 0.6, 2.4, 4.2):
        B.sph(0.12, (lx, hy - 3.4, 5.85), m=M_LAMP)
    for ux in (-5.2, -3.4, -1.0):                                                 # facade uplights
        sp = bpy.data.lights.new('up', type='SPOT'); sp.energy = 90; sp.spot_size = math.radians(40); sp.color = (1, 0.66, 0.36)
        so = bpy.data.objects.new('up', sp); B.link(so); so.location = (ux, hy - 3.35, 0.55); so.rotation_euler = (math.radians(-8), 0, 0)
    for k in range(27):                                                        # teak fins over it
        B.box((0.07, 0.24, 2.0), (-2.05 + k * 0.25, hy - 3.66, 5.25), m=M_TEAK)
    B.box((9.0, 7.4, 0.24), (1.2, hy - 0.2, 6.9), m=M_WALLW)                    # roof slab with overhang
    B.box((3.6, 3.6, 0.9), (-3.0, hy + 1.5, 7.45), m=M_WALLW)                   # stair head
    # garden: low clipped shrubs along the plinth
    _sh = tuft_mesh(77, n=30, h=0.6); _sh.materials[0] = M_LAWN
    for k in range(18):
        o = bpy.data.objects.new("shrub", _sh); B.link(o); o.location = (-5.4 + k * 0.62, hy - 4.1, 0.05)
        o.scale = (1.4, 1.4, 1.0); o.rotation_euler = (0, 0, k * 1.7)
    pl = bpy.data.lights.new("porch", type='POINT'); pl.energy = 220; pl.color = (1, 0.64, 0.34); pl.shadow_soft_size = 0.6
    po = bpy.data.objects.new("porch", pl); B.link(po); po.location = (-1.0, hy - 3.6, 3.2)
HOUSE_OBJS = [bpy.data.objects[k] for k in set(bpy.data.objects.keys()) - _h0]
# palms: three variants, instanced along both sides of the road and in the fields
pm = [palm_mesh(s, height=random.uniform(8, 11), lean=random.uniform(0.3, 1.2)) for s in (1, 2, 3)]
spots = [(-5.5, 3.5), (6.2, 6.0), (-8.0, 14), (9.5, 18), (-4.8, 26), (5.6, 33), (-13, 8), (15, 12), (-18, 22),
         (20, 30), (-8.6, 44), (9.0, 53), (-24, 40), (26, 46), (-3.6, -2.4), (11, -1.0), (-30, 70), (32, 64), (-12, 80), (14, 90),
         (-4.6, -9), (4.9, -15), (-5.0, -22), (4.7, -29), (-4.8, -36), (5.1, -43), (-5.2, -50), (4.8, -57),
         (-10.5, -18), (12, -31), (-14, -44), (16, -12), (-20, -30), (22, -50)]
PALMS = []
for i, (x, y) in enumerate(spots):
    o = bpy.data.objects.new("palm", pm[i % 3]); B.link(o); PALMS.append(o)
    o.location = (x, y, ground_z(x, y) - 0.05)
    o.rotation_euler = (0, 0, random.uniform(0, 2 * pi)); s = random.uniform(0.85, 1.15); o.scale = (s, s, s)

# grass tufts along verges (dense near camera), sparse on the land
tm = [tuft_mesh(s) for s in range(4)]
par = bpy.data.objects.new("grass", None); B.link(par)
cnt = 0; TUFTS = []
for i in range(15000):
    y = random.uniform(-62, 60); x = random.choice((-1, 1)) * random.uniform(2.0, 2.0 + 10 * random.random() ** 1.5)
    if abs(y) < 0.35 and abs(x) > 2.5: continue
    if abs(x) < 7.4 and 39.6 < y < 58.4: continue   # the cleared plot
    if 1.9 < x < 3.4 and -5.25 < y < -3.0: continue   # clear sight-line from the low camera to the board
    o = bpy.data.objects.new("t", tm[i % 4]); B.link(o); o.parent = par
    o.location = (x, y, ground_z(x, y) - 0.02); o.rotation_euler = (0, 0, random.uniform(0, 6.28))
    s = random.uniform(0.6, 1.5) * (0.8 if abs(x) < 2.6 else 1.0); o.scale = (s, s, s * random.uniform(0.8, 1.3)); cnt += 1; TUFTS.append(o)

# paddy beyond the walls (fields of fine tufts on bunded beds)
pdm = tuft_mesh(99, n=22, h=0.75); pdm.materials[0] = M_PADDY
for i in range(7000):
    x = random.choice((-1, 1)) * random.uniform(14, 70); y = random.uniform(-60, 120)
    if (x % 9) < 0.6 or (y % 11) < 0.6: continue  # bunds
    o = bpy.data.objects.new("p", pdm); B.link(o); o.parent = par
    o.location = (x, y, ground_z(x, y) - 0.05); o.rotation_euler = (0, 0, random.uniform(0, 6.28)); TUFTS.append(o)

# distant tree line
tr = [tree_blob_mesh(s) for s in range(3)]
for i in range(70):
    x = random.uniform(-120, 120); y = random.uniform(130, 210)
    o = bpy.data.objects.new("tree", tr[i % 3]); B.link(o)
    o.location = (x, y, 0); s = random.uniform(0.8, 1.6); o.scale = (s, s, s * random.uniform(0.8, 1.2))
for i in range(40):
    x = random.uniform(-110, 110); y = random.uniform(120, 200)
    o = bpy.data.objects.new("palm", pm[i % 3]); B.link(o); o.location = (x, y, 0); o.rotation_euler = (0, 0, random.uniform(0, 6.28))

# ---------------------------------------------------------------- light + sky
SUNROT, ELEV = float(os.environ.get("SUNROT", "40")), float(os.environ.get("ELEV", "4"))
w, nt, sky, bg = B.world_sky(sun_rotation=SUNROT, elev=ELEV, sun_intensity=1.0, aerosol=2.4, ambient=0.10)
for nd in nt.nodes:
    if nd.type == 'MATH' and nd.operation == 'MULTIPLY': nd.inputs[1].default_value = float(os.environ.get("SKYCAM", "0.6"))
B.sky_clouds(nt, sky, bg, sun_rotation=SUNROT, elev=ELEV, cover=0.52, cover2=0.7)
B.sun_rig(sun_rotation=SUNROT, elev=ELEV, energy=6.5, color=(1.0, 0.62, 0.32), fill=float(os.environ.get("FILL","0.2")), bounce=1.0)
# warm bounce card from behind camera-left: lifts the shadow side of gate/board (cinema fill)
ad = bpy.data.lights.new("card", type='AREA'); ad.shape = 'RECTANGLE'; ad.size = 6; ad.size_y = 3
ad.energy = float(os.environ.get("CARD", "900")); ad.color = (1.0, 0.72, 0.45)
ao = bpy.data.objects.new("card", ad); B.link(ao); ao.location = (-4.0, -9.0, 2.5)
ao.rotation_euler = (Vector((0.3, 9.0, -1.0))).to_track_quat('-Z', 'Y').to_euler()
# atmospheric haze: a thin homogeneous volume over the whole scene
if os.environ.get("HAZE", "1") == "1":
    vb = B.box((400, 400, 60), (0, 100, 29.0), name="haze")
    vm = bpy.data.materials.new("haze"); vm.use_nodes = True
    nt2 = vm.node_tree; nt2.nodes.remove(nt2.nodes["Principled BSDF"])
    vs = nt2.nodes.new("ShaderNodeVolumePrincipled"); vs.inputs["Density"].default_value = float(os.environ.get("HAZE_D", "0.0012"))
    vs.inputs["Color"].default_value = (1.0, 0.82, 0.62, 1); vs.inputs["Anisotropy"].default_value = 0.6
    nt2.links.new(vs.outputs[0], nt2.nodes["Material Output"].inputs["Volume"])
    vb.data.materials.append(vm)

# ---------------------------------------------------------------- camera
if shot == "anim":
    pass
elif shot == "hook":
    cam, tgt = B.camera((2.9, -5.6, 0.55), (-0.35, 0.0, 1.6), lens=38, fstop=2.8)
elif shot == "aerial":
    cam, tgt = B.camera((-1.5, -10.0, 30.0), (0.5, 26.0, 0.0), lens=24, fstop=None)
elif shot == "road":
    cam, tgt = B.camera((0.7, -16.0, 1.3), (0.0, 30.0, 1.6), lens=28, fstop=None)
elif shot == "slam":
    cam, tgt = B.camera((0.4, -3.4, 1.35), (0.0, 3.0, 1.45), lens=24, fstop=5.6)
elif shot == "open":
    cam, tgt = B.camera((0.3, -4.5, 1.5), (0.0, 30.0, 1.5), lens=26, fstop=None)
elif shot == "house":
    cam, tgt = B.camera((1.2, 24.0, 1.7), (0.0, 50.0, 2.6), lens=30, fstop=None)
SC.cycles.volume_step_rate = 4.0
SC.cycles.volume_bounces = 0
if shot != "anim": B.render(out, int(1080 * scale), int(1920 * scale), samples=spp, exposure=float(os.environ.get("EXPO", "-0.3")))
print("done", out)
