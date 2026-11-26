# Materials: pale limestone for the temple (it reads white in the sun — the "White Pagoda"), red laterite walls, sand, sea, cloth, metal.
import bpy
from geo import *

def water(name):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; L = nt.links; b = N['Principled BSDF']
    b.inputs['Base Color'].default_value = (.012, .055, .06, 1); b.inputs['Roughness'].default_value = .045; b.inputs['IOR'].default_value = 1.333
    at = N.new('ShaderNodeAttribute'); at.attribute_name = 'foam'
    pos = N.new('ShaderNodeNewGeometry'); sep = N.new('ShaderNodeSeparateXYZ'); L.new(pos.outputs['Position'], sep.inputs[0])
    shore = N.new('ShaderNodeMapRange'); shore.inputs['From Min'].default_value = -246; shore.inputs['From Max'].default_value = -231; L.new(sep.outputs['Y'], shore.inputs['Value'])
    nz = N.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = .35; nz.inputs['Detail'].default_value = 8; L.new(pos.outputs['Position'], nz.inputs['Vector'])
    mul = N.new('ShaderNodeMath'); mul.operation = 'MULTIPLY'; mul.inputs[1].default_value = 0; L.new(shore.outputs['Result'], mul.inputs[0])
    mx = N.new('ShaderNodeMath'); mx.operation = 'MAXIMUM'; L.new(mul.outputs[0], mx.inputs[0]); L.new(at.outputs['Fac'], mx.inputs[1])
    rmp = N.new('ShaderNodeMapRange'); rmp.inputs['From Min'].default_value = .55; rmp.inputs['From Max'].default_value = .75; L.new(mx.outputs[0], rmp.inputs['Value'])
    mixc = N.new('ShaderNodeMix'); mixc.data_type = 'RGBA'; mixc.inputs['A'].default_value = (.012, .055, .06, 1); mixc.inputs['B'].default_value = (.85, .88, .86, 1)
    L.new(rmp.outputs['Result'], mixc.inputs['Factor']); L.new(mixc.outputs['Result'], b.inputs['Base Color'])
    mr = N.new('ShaderNodeMapRange'); mr.inputs['To Min'].default_value = .045; mr.inputs['To Max'].default_value = .7; L.new(rmp.outputs['Result'], mr.inputs['Value']); L.new(mr.outputs['Result'], b.inputs['Roughness'])
    n2 = N.new('ShaderNodeTexNoise'); n2.inputs['Scale'].default_value = 2.2; n2.inputs['Detail'].default_value = 10; L.new(pos.outputs['Position'], n2.inputs['Vector'])
    bp = N.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = .35; bp.inputs['Distance'].default_value = .08; L.new(n2.outputs['Fac'], bp.inputs['Height']); L.new(bp.outputs['Normal'], b.inputs['Normal'])
    return m

def sand(name):
    m = mat_stone(name, (.60, .47, .31), var=.08, rough=.95, scale=.08, bump=.25, dirt=0)
    nt = m.node_tree; N = nt.nodes; L = nt.links; b = N['Principled BSDF']
    # wet sand toward the waterline
    pos = N.new('ShaderNodeNewGeometry'); sep = N.new('ShaderNodeSeparateXYZ'); L.new(pos.outputs['Position'], sep.inputs[0])
    wet = N.new('ShaderNodeMapRange'); wet.inputs['From Min'].default_value = -224; wet.inputs['From Max'].default_value = -236; L.new(sep.outputs['Y'], wet.inputs['Value'])
    src = b.inputs['Base Color'].links[0].from_socket
    mixc = N.new('ShaderNodeMix'); mixc.data_type = 'RGBA'; mixc.blend_type = 'MULTIPLY'; L.new(wet.outputs['Result'], mixc.inputs['Factor']); L.new(src, mixc.inputs['A']); mixc.inputs['B'].default_value = (.55, .5, .44, 1)
    L.new(mixc.outputs['Result'], b.inputs['Base Color'])
    # wind ripples
    wv = N.new('ShaderNodeTexWave'); wv.inputs['Scale'].default_value = 1.6; wv.inputs['Distortion'].default_value = 6; wv.inputs['Detail'].default_value = 3; L.new(pos.outputs['Position'], wv.inputs['Vector'])
    bp = N.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = .12; bp.inputs['Distance'].default_value = .02; L.new(wv.outputs['Fac'], bp.inputs['Height'])
    L.new(b.inputs['Normal'].links[0].from_socket, bp.inputs['Normal']); L.new(bp.outputs['Normal'], b.inputs['Normal'])
    return m

def cloth(name, col, sheen=.6):
    m = mat_basic(name, col, .75); b = m.node_tree.nodes['Principled BSDF']
    try: b.inputs['Sheen Weight'].default_value = sheen
    except Exception: pass
    return m

def make():
    M = {}
    M['stone'] = mat_stone('limestone', (.66, .60, .51), var=.1, rough=.85, scale=1.4, bump=.45, dirt=.22, joints=(99., 1.45))
    M['laterite'] = mat_stone('laterite', (.48, .29, .19), var=.16, rough=.92, scale=2.2, bump=.6, dirt=.18, joints=(.6, 1.15))
    M['steps'] = mat_stone('steps', (.50, .45, .39), var=.1, rough=.7, scale=2, bump=.25, dirt=.3, joints=(99., 2.2))
    M['kalasha'] = mat_basic('gilt', (.83, .62, .28), .28, 1.0)
    M['chakra'] = mat_basic('ashtadhatu', (.74, .55, .32), .3, 1.0)
    M['wood'] = mat_basic('wood', (.30, .19, .11), .7)
    M['trunk'] = mat_stone('trunk', (.42, .36, .29), var=.15, rough=.9, scale=3, bump=.6, dirt=0)
    M['leaf'] = mat_basic('palmleaf', (.10, .22, .045), .55)
    M['coconut'] = mat_basic('coconut', (.25, .3, .09), .5)
    M['sand'] = sand('sand'); M['water'] = water('sea')
    M['flag'] = cloth('flag_red', (.62, .045, .03)); M['flag2'] = cloth('flag_yellow', (.85, .55, .06))
    for k, c in (('w1', (.86, .84, .79)), ('w2', (.84, .74, .58)), ('w3', (.76, .56, .36)), ('w4', (.80, .64, .56))):
        M['house_' + k] = mat_stone('house_' + k, c, var=.06, rough=.92, scale=.6, bump=.15, dirt=.3)
    M['window'] = mat_basic('window', (.05, .04, .035), .5)
    M['shiphull'] = mat_stone('shiphull', (.20, .12, .07), var=.15, rough=.65, scale=3, bump=.3, dirt=0)
    M['sail'] = cloth('sail', (.86, .81, .70), .3)
    M['clay'] = mat_stone('clay', (.55, .27, .14), var=.12, rough=.8, scale=6, bump=.4, dirt=.1)
    M['ghost'] = mat_basic('ghost', (.9, .88, .84), .6)
    M['farland'] = mat_stone('farland', (.30, .32, .17), var=.25, rough=.95, scale=.004, bump=0, dirt=0)
    return M
