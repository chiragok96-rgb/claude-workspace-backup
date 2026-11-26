# Geometry and material helpers for the Srimandir film (Blender 5, metres, x = east, y = north, z = up).
import bpy, bmesh, math, random
from mathutils import Vector, Matrix

FPS = 24
def F(t): return round(t * FPS)          # seconds → frame

def link(obj, coll=None):
    (coll or bpy.context.scene.collection).objects.link(obj); return obj

def coll(name, parent=None):
    c = bpy.data.collections.new(name); (parent or bpy.context.scene.collection).children.link(c); return c

def mesh_obj(name, verts, faces, mat=None, coll_=None, smooth=False):
    me = bpy.data.meshes.new(name); me.from_pydata([tuple(v) for v in verts], [], faces); me.validate(); me.update()
    if smooth:
        for p in me.polygons: p.use_smooth = True
    ob = bpy.data.objects.new(name, me)
    if mat: me.materials.append(mat)
    return link(ob, coll_)

def prism(poly, z0, z1, cap=True):
    """verts/faces of a vertical prism over a CCW polygon [(x,y)...]"""
    n = len(poly); V = [(x, y, z0) for x, y in poly] + [(x, y, z1) for x, y in poly]
    Fc = [(i, (i + 1) % n, n + (i + 1) % n, n + i) for i in range(n)]
    if cap: Fc += [tuple(range(n))[::-1], tuple(range(n, 2 * n))]
    return V, Fc

def merge(parts):
    V, Fc = [], []
    for v, f in parts:
        o = len(V); V += v; Fc += [tuple(i + o for i in ff) for ff in f]
    return V, Fc

def loft(rings, cap_bottom=True, cap_top=True):
    """rings: list of equal-length closed rings [(x,y,z)...] → a skin"""
    n = len(rings[0]); V = [p for r in rings for p in r]; Fc = []
    for k in range(len(rings) - 1):
        a, b = k * n, (k + 1) * n
        Fc += [(a + i, a + (i + 1) % n, b + (i + 1) % n, b + i) for i in range(n)]
    if cap_bottom: Fc.append(tuple(range(n))[::-1])
    if cap_top: Fc.append(tuple(range((len(rings) - 1) * n, len(rings) * n)))
    return V, Fc

def lathe(profile, seg=48, rib=None, x0=0, y0=0, z0=0):
    """profile: [(r, z)] bottom→top; rib(theta, z) → radial multiplier"""
    rings = []
    for r, z in profile:
        ring = []
        for i in range(seg):
            th = 2 * math.pi * i / seg; m = rib(th, z) if rib else 1
            ring.append((x0 + r * m * math.cos(th), y0 + r * m * math.sin(th), z0 + z))
        rings.append(ring)
    return loft(rings)

def boxv(x0, y0, z0, x1, y1, z1):
    return prism([(x0, y0), (x1, y0), (x1, y1), (x0, y1)], z0, z1)

def bevel(ob, w=.04, seg=2, angle=40):
    m = ob.modifiers.new('bevel', 'BEVEL'); m.width = w; m.segments = seg; m.limit_method = 'ANGLE'; m.angle_limit = math.radians(angle); m.harden_normals = False
    return m

# ———————————— materials ————————————
def _bsdf(m): return m.node_tree.nodes['Principled BSDF']
def mat_basic(name, col, rough=.6, metal=0., spec=.5):
    m = bpy.data.materials.new(name); m.use_nodes = True; b = _bsdf(m)
    b.inputs['Base Color'].default_value = (*col, 1); b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal
    return m

def mat_stone(name, col, var=.12, rough=.82, scale=1.6, bump=.35, block=None, dirt=.25, joints=None):
    """stone with per-block tone variation (object/world space noise), micro bump and grime in the lower parts"""
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; L = nt.links; b = _bsdf(m)
    tc = N.new('ShaderNodeTexCoord'); mp = N.new('ShaderNodeMapping'); L.new(tc.outputs['Object'], mp.inputs[0])
    n1 = N.new('ShaderNodeTexNoise'); n1.inputs['Scale'].default_value = scale; n1.inputs['Detail'].default_value = 6; L.new(mp.outputs[0], n1.inputs['Vector'])
    vor = N.new('ShaderNodeTexVoronoi'); vor.inputs['Scale'].default_value = .9; L.new(mp.outputs[0], vor.inputs['Vector'])
    ramp = N.new('ShaderNodeValToRGB'); cr = ramp.color_ramp
    c0 = [max(0, c * (1 - var)) for c in col]; c1 = [min(1, c * (1 + var * .6)) for c in col]
    cr.elements[0].color = (*c0, 1); cr.elements[1].color = (*c1, 1)
    mixv = N.new('ShaderNodeMath'); mixv.operation = 'MULTIPLY_ADD'; mixv.inputs[1].default_value = .55; mixv.inputs[2].default_value = .2
    L.new(n1.outputs['Fac'], mixv.inputs[0])
    mix2 = N.new('ShaderNodeMix'); mix2.data_type = 'FLOAT'; mix2.inputs['Factor'].default_value = .45
    L.new(mixv.outputs[0], mix2.inputs['A']); L.new(vor.outputs['Distance'], mix2.inputs['B'])
    L.new(mix2.outputs['Result'], ramp.inputs['Fac'])
    # grime: darker toward the ground (world z)
    sep = N.new('ShaderNodeSeparateXYZ'); L.new(tc.outputs['Generated'] if False else N.new('ShaderNodeNewGeometry').outputs['Position'], sep.inputs[0])
    g = N.new('ShaderNodeMapRange'); g.inputs['From Min'].default_value = 0; g.inputs['From Max'].default_value = 6; g.inputs['To Min'].default_value = 1 - dirt; g.inputs['To Max'].default_value = 1
    L.new(sep.outputs['Z'], g.inputs['Value'])
    mul = N.new('ShaderNodeMix'); mul.data_type = 'RGBA'; mul.blend_type = 'MULTIPLY'; mul.inputs['Factor'].default_value = 1
    L.new(ramp.outputs['Color'], mul.inputs['A']); comb = N.new('ShaderNodeCombineColor'); L.new(g.outputs['Result'], comb.inputs[0]); L.new(g.outputs['Result'], comb.inputs[1]); L.new(g.outputs['Result'], comb.inputs[2])
    L.new(comb.outputs[0], mul.inputs['B'])
    stm = N.new('ShaderNodeMapping'); stm.inputs['Scale'].default_value = (1.4, 1.4, .06); L.new(N.new('ShaderNodeNewGeometry').outputs['Position'], stm.inputs[0])
    sn = N.new('ShaderNodeTexNoise'); sn.inputs['Scale'].default_value = 1.2; sn.inputs['Detail'].default_value = 3; L.new(stm.outputs[0], sn.inputs['Vector'])
    sr = N.new('ShaderNodeMapRange'); sr.inputs['From Min'].default_value = .45; sr.inputs['From Max'].default_value = .7; sr.inputs['To Min'].default_value = 1; sr.inputs['To Max'].default_value = 1 - .16 * (1 if dirt > 0 else 0); L.new(sn.outputs['Fac'], sr.inputs['Value'])
    st2 = N.new('ShaderNodeMix'); st2.data_type = 'RGBA'; st2.blend_type = 'MULTIPLY'; st2.inputs['Factor'].default_value = 1; L.new(mul.outputs['Result'], st2.inputs['A'])
    cmb = N.new('ShaderNodeCombineColor'); L.new(sr.outputs['Result'], cmb.inputs[0]); L.new(sr.outputs['Result'], cmb.inputs[1]); L.new(sr.outputs['Result'], cmb.inputs[2]); L.new(cmb.outputs[0], st2.inputs['B'])
    L.new(st2.outputs['Result'], b.inputs['Base Color'])
    b.inputs['Roughness'].default_value = rough
    jfac = None
    if joints:   # staggered vertical joints (and optional horizontal rows): fract((x+y)/w + 0.5*floor(z/h))
        rh, bw = joints; P = N.new('ShaderNodeNewGeometry'); sp = N.new('ShaderNodeSeparateXYZ'); L.new(P.outputs['Position'], sp.inputs[0])
        def M_(op, a_, b_=None, v=None):
            m_ = N.new('ShaderNodeMath'); m_.operation = op
            for k_, src in enumerate((a_, b_)):
                if src is None: continue
                if isinstance(src, (int, float)): m_.inputs[k_].default_value = src
                else: L.new(src, m_.inputs[k_])
            return m_.outputs[0]
        row = M_('FLOOR', M_('DIVIDE', sp.outputs['Z'], rh)); u = M_('ADD', M_('DIVIDE', M_('ADD', sp.outputs['X'], sp.outputs['Y']), bw), M_('MULTIPLY', row, .5))
        fr = M_('FRACT', u); vj = M_('GREATER_THAN', M_('ABSOLUTE', M_('SUBTRACT', fr, .5)), .5 - .012 / bw)
        hz = M_('GREATER_THAN', M_('ABSOLUTE', M_('SUBTRACT', M_('FRACT', M_('DIVIDE', sp.outputs['Z'], rh)), .5)), .5 - .012 / rh)
        jfac = M_('MAXIMUM', vj, hz)
    n2 = N.new('ShaderNodeTexNoise'); n2.inputs['Scale'].default_value = 14; n2.inputs['Detail'].default_value = 8; L.new(mp.outputs[0], n2.inputs['Vector'])
    bp = N.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = bump; bp.inputs['Distance'].default_value = .02; L.new(n2.outputs['Fac'], bp.inputs['Height'])
    if jfac is not None:
        bj = N.new('ShaderNodeBump'); bj.invert = True; bj.inputs['Strength'].default_value = .6; bj.inputs['Distance'].default_value = .012; L.new(jfac, bj.inputs['Height']); L.new(bj.outputs['Normal'], bp.inputs['Normal'])
        dk = N.new('ShaderNodeMix'); dk.data_type = 'RGBA'; dk.blend_type = 'MULTIPLY'; L.new(jfac, dk.inputs['Factor']); L.new(b.inputs['Base Color'].links[0].from_socket, dk.inputs['A']); dk.inputs['B'].default_value = (.62, .58, .54, 1)
        L.new(dk.outputs['Result'], b.inputs['Base Color'])
    L.new(bp.outputs['Normal'], b.inputs['Normal'])
    return m

def mat_emit(name, col, strength):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; nt.nodes.remove(_bsdf(m))
    e = nt.nodes.new('ShaderNodeEmission'); e.inputs['Color'].default_value = (*col, 1); e.inputs['Strength'].default_value = strength
    nt.links.new(e.outputs[0], nt.nodes['Material Output'].inputs['Surface']); return m

# ———————————— animation helpers ————————————
def key(ob, path, frame, value, interp='BEZIER', index=-1):
    if isinstance(value, (tuple, list)):
        setattr(ob, path, value) if not path.startswith('[') else None
    else:
        if index >= 0: getattr(ob, path)[index] = value
        else: setattr(ob, path, value)
    ob.keyframe_insert(data_path=path, frame=frame, index=index)
    ad = ob.animation_data
    if ad and ad.action:
        for fc in fcurves(ad.action):
            if fc.data_path == path:
                for kp in fc.keyframe_points:
                    if int(round(kp.co[0])) == frame: kp.interpolation = interp

def fcurves(action):
    if hasattr(action, 'fcurves') and action.fcurves is not None:
        try: return list(action.fcurves)
        except Exception: pass
    out = []
    for layer in getattr(action, 'layers', []):
        for strip in layer.strips:
            for cb in strip.channelbags: out += list(cb.fcurves)
    return out

def appear(ob, t, dur=.5, drop=1.5, scale_from=1.0, settle=True):
    """the object drops into place from `drop` metres above, arriving at time t (seconds)"""
    loc = ob.location.copy(); f1 = F(t); f0 = F(t - dur)
    ob.location = (loc.x, loc.y, loc.z + drop); ob.scale = (scale_from, scale_from, scale_from) if scale_from != 1 else ob.scale
    ob.keyframe_insert('location', frame=f0 - 1); ob.keyframe_insert('scale', frame=f0 - 1)
    ob.location = loc; ob.scale = (1, 1, 1)
    ob.keyframe_insert('location', frame=f1); ob.keyframe_insert('scale', frame=f1)
    hide(ob, t - dur)

def hide(ob, t_show, t_hide=None):
    """render visibility on from t_show (off before), optionally off again after t_hide"""
    f = F(t_show)
    ob.hide_render = True; ob.keyframe_insert('hide_render', frame=f - 1)
    ob.hide_render = False; ob.keyframe_insert('hide_render', frame=f)
    if t_hide is not None:
        ob.hide_render = True; ob.keyframe_insert('hide_render', frame=F(t_hide))
    ob.hide_viewport = False
