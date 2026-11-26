# Rosaghara interior: clay chulhas in a row along the south wall; on each, seven earthen handis stacked one on another;
# wood fire only beneath; steam rises from the topmost pot (the one farthest from the fire cooks too).
import bpy, math, random
from geo import *

HY = -84.6                      # the hearth row (y)
HX = [66, 72, 78, 84, 90, 96, 102, 108]
MAIN = 84
POT = [(.12, 0), (.24, .06), (.31, .17), (.3, .27), (.24, .35), (.17, .39), (.2, .42), (.21, .44), (.17, .45)]
PZ = .37                        # stacking step

def clay_mats(M):
    M['handi'] = mat_stone('handi', (.40, .18, .085), var=.14, rough=.75, scale=7, bump=.3, dirt=.0)
    M['chulha'] = mat_stone('chulha', (.42, .27, .17), var=.18, rough=.95, scale=4, bump=.7, dirt=.0)
    M['soot'] = mat_basic('soot', (.03, .025, .02), .95)
    f = bpy.data.materials.new('flame'); f.use_nodes = True; nt = f.node_tree; N = nt.nodes; L = nt.links; nt.nodes.remove(N['Principled BSDF'])
    em = N.new('ShaderNodeEmission'); em.inputs['Color'].default_value = (1.0, .42, .09, 1)
    nz = N.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 6; nz.inputs['Detail'].default_value = 4
    tc = N.new('ShaderNodeTexCoord'); L.new(tc.outputs['Object'], nz.inputs['Vector'])
    mr = N.new('ShaderNodeMapRange'); mr.inputs['To Min'].default_value = 4; mr.inputs['To Max'].default_value = 26; L.new(nz.outputs['Fac'], mr.inputs['Value']); L.new(mr.outputs['Result'], em.inputs['Strength'])
    tr = N.new('ShaderNodeBsdfTransparent'); mx = N.new('ShaderNodeMixShader'); gt = N.new('ShaderNodeMath'); gt.operation = 'GREATER_THAN'; gt.inputs[1].default_value = .42
    L.new(nz.outputs['Fac'], gt.inputs[0]); L.new(gt.outputs[0], mx.inputs[0]); L.new(tr.outputs[0], mx.inputs[1]); L.new(em.outputs[0], mx.inputs[2])
    L.new(mx.outputs[0], N['Material Output'].inputs['Surface']); M['flame'] = f
    s = bpy.data.materials.new('steam'); s.use_nodes = True; nt = s.node_tree; N = nt.nodes; L = nt.links; nt.nodes.remove(N['Principled BSDF'])
    pv = N.new('ShaderNodeVolumePrincipled'); pv.inputs['Color'].default_value = (.95, .94, .92, 1)
    nz = N.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 2.2; nz.inputs['Detail'].default_value = 3
    gr = N.new('ShaderNodeTexGradient'); gr.gradient_type = 'SPHERICAL'; tc = N.new('ShaderNodeTexCoord'); L.new(tc.outputs['Object'], gr.inputs['Vector']); L.new(tc.outputs['Object'], nz.inputs['Vector'])
    mu = N.new('ShaderNodeMath'); mu.operation = 'MULTIPLY'; L.new(gr.outputs['Fac'], mu.inputs[0]); L.new(nz.outputs['Fac'], mu.inputs[1])
    mr = N.new('ShaderNodeMapRange'); mr.inputs['From Min'].default_value = .15; mr.inputs['From Max'].default_value = .55; mr.inputs['To Max'].default_value = .9; L.new(mu.outputs[0], mr.inputs['Value'])
    L.new(mr.outputs['Result'], pv.inputs['Density']); L.new(pv.outputs[0], N['Material Output'].inputs['Volume']); M['steam'] = s

def chulha(M, C, x, name):
    """a clay hearth: a block with a fire mouth facing north and a ring on top where the first pot sits"""
    parts = [boxv(x - 1.0, HY - .8, 0, x - .32, HY + .8, .85), boxv(x + .32, HY - .8, 0, x + 1.0, HY + .8, .85), boxv(x - .32, HY - .8, 0, x + .32, HY + .55, .85),
             boxv(x - .32, HY + .55, .52, x + .32, HY + .8, .85)]
    V, Fc = merge(parts); ob = mesh_obj(name, V, Fc, M['chulha'], C); bevel(ob, .06, 3)
    rv, rf = lathe([(.33, 0), (.36, .04), (.3, .08)], 24); mesh_obj(name + '_ring', [(a + x, b + HY, c + .85) for a, b, c in rv], rf, M['chulha'], C, True)
    sv, sf = boxv(x - .3, HY + .5, .02, x + .3, HY + .82, .5); mesh_obj(name + '_mouth', sv, sf, M['soot'], C)
    return ob

def pot(M, C, name, x, z):
    v, f = lathe(POT, 28); return mesh_obj(name, [(a + x, b + HY, c + z) for a, b, c in v], f, M['handi'], C, True)

def build(M, C):
    clay_mats(M); out = []; fires = []
    for i, x in enumerate(HX):
        chulha(M, C, x, f'chulha{i}')
        for k in range(7):
            ob = pot(M, C, f'handi{i}_{k}', x, .87 + k * PZ)
            t = 42.75 + k * .43 + (0 if x == MAIN else .06 * abs(i - 3) + .03)
            out.append((ob, t))
        # fire: flame tongues in the mouth, a flickering light
        fl = []
        for j in range(5):
            v, f = lathe([(.0, 0), (.09, .06), (.07, .2), (.0, .34)], 10); fx = x - .2 + j * .1
            o = mesh_obj(f'flame{i}_{j}', [(a + fx, b + HY + .62, c + .04) for a, b, c in v], f, M['flame'], C, True); fl.append(o)
        bpy.ops.object.light_add(type='POINT', location=(x, HY + .9, .3)); lt = bpy.context.object; lt.name = f'firelight{i}'; lt.data.color = (1, .5, .18); lt.data.shadow_soft_size = .25
        for c_ in lt.users_collection: c_.objects.unlink(lt)
        C.objects.link(lt)
        t_on = 45.95 + .07 * abs(i - 3)
        lt.data.energy = 0; lt.data.keyframe_insert('energy', frame=F(t_on) - 1)
        rnd = random.Random(i); t = t_on
        while t < 51.5:
            lt.data.energy = rnd.uniform(140, 260) * min(1, (t - t_on) / .4 + .05); lt.data.keyframe_insert('energy', frame=F(t)); t += rnd.uniform(.08, .2)
        for o in fl:
            hide(o, t_on)
            o.scale = (1, 1, .2); o.keyframe_insert('scale', frame=F(t_on)); o.scale = (1, 1, 1); o.keyframe_insert('scale', frame=F(t_on + .35))
        fires.append(lt)
    # interior light: a soft skylight from the roof vents, warm
    bpy.ops.object.light_add(type='AREA', location=(87, -78, 5.6)); a = bpy.context.object; a.name = 'kitchen_sky'; a.data.shape = 'RECTANGLE'; a.data.size = 46; a.data.size_y = 22; a.data.energy = 5200; a.location = (87, -75, 5.9); a.data.color = (1, .86, .7)
    for c_ in a.users_collection: c_.objects.unlink(a)
    C.objects.link(a)
    # steam from the topmost pot of the main hearth: one plume whose noise drifts upward (a continuous, wispy column)
    top = .87 + 7 * PZ
    st = bpy.data.materials.new('steamplume'); st.use_nodes = True; nt = st.node_tree; N = nt.nodes; L = nt.links; nt.nodes.remove(N['Principled BSDF'])
    pv = N.new('ShaderNodeVolumePrincipled'); pv.inputs['Color'].default_value = (.96, .95, .93, 1)
    tc = N.new('ShaderNodeTexCoord'); mp = N.new('ShaderNodeMapping'); L.new(tc.outputs['Object'], mp.inputs[0])
    nz = N.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 1.6; nz.inputs['Detail'].default_value = 5; nz.inputs['Roughness'].default_value = .62; L.new(mp.outputs[0], nz.inputs['Vector'])
    sep = N.new('ShaderNodeSeparateXYZ'); L.new(tc.outputs['Object'], sep.inputs[0])
    rad = N.new('ShaderNodeMath'); rad.operation = 'MULTIPLY_ADD'; L.new(sep.outputs['Z'], rad.inputs[0]); rad.inputs[1].default_value = .18; rad.inputs[2].default_value = .28   # plume radius grows with height
    vl = N.new('ShaderNodeVectorMath'); vl.operation = 'LENGTH'; cx = N.new('ShaderNodeCombineXYZ'); L.new(sep.outputs['X'], cx.inputs['X']); L.new(sep.outputs['Y'], cx.inputs['Y']); L.new(cx.outputs[0], vl.inputs[0])
    dv = N.new('ShaderNodeMath'); dv.operation = 'DIVIDE'; L.new(vl.outputs['Value'], dv.inputs[0]); L.new(rad.outputs[0], dv.inputs[1])
    fall = N.new('ShaderNodeMapRange'); fall.inputs['From Min'].default_value = .3; fall.inputs['From Max'].default_value = 1.0; fall.inputs['To Min'].default_value = 1; fall.inputs['To Max'].default_value = 0; L.new(dv.outputs[0], fall.inputs['Value'])
    hz = N.new('ShaderNodeMapRange'); hz.inputs['From Min'].default_value = 0; hz.inputs['From Max'].default_value = 5.5; hz.inputs['To Min'].default_value = 1; hz.inputs['To Max'].default_value = 0; L.new(sep.outputs['Z'], hz.inputs['Value'])
    nm = N.new('ShaderNodeMapRange'); nm.inputs['From Min'].default_value = .42; nm.inputs['From Max'].default_value = .72; L.new(nz.outputs['Fac'], nm.inputs['Value'])
    m1 = N.new('ShaderNodeMath'); m1.operation = 'MULTIPLY'; L.new(fall.outputs['Result'], m1.inputs[0]); L.new(nm.outputs['Result'], m1.inputs[1])
    m2 = N.new('ShaderNodeMath'); m2.operation = 'MULTIPLY'; L.new(m1.outputs[0], m2.inputs[0]); L.new(hz.outputs['Result'], m2.inputs[1])
    m3 = N.new('ShaderNodeMath'); m3.operation = 'MULTIPLY'; m3.inputs[1].default_value = 0.0; L.new(m2.outputs[0], m3.inputs[0]); L.new(m3.outputs[0], pv.inputs['Density'])
    L.new(pv.outputs[0], N['Material Output'].inputs['Volume'])
    # the noise drifts upward (steam rising) and the plume fades in when the topmost pot begins to cook
    mp.inputs['Location'].default_value = (0, 0, 0); mp.inputs['Location'].keyframe_insert('default_value', frame=F(47.0))
    mp.inputs['Location'].default_value = (0, 0, -7.0); mp.inputs['Location'].keyframe_insert('default_value', frame=F(51.6))
    m3.inputs[1].default_value = 0.0; m3.inputs[1].keyframe_insert('default_value', frame=F(47.25)); m3.inputs[1].default_value = 1.4; m3.inputs[1].keyframe_insert('default_value', frame=F(48.0))
    for fc in fcurves(nt.animation_data.action):
        for kp in fc.keyframe_points: kp.interpolation = 'LINEAR'
    V, Fc = lathe([(.25, 0), (.7, 1.5), (1.3, 3.5), (1.7, 5.6)], 24); pl = mesh_obj('steam_plume', V, Fc, st, C)
    pl.location = (MAIN, HY, top + .02); hide(pl, 47.2, 51.7)
    return out, fires
