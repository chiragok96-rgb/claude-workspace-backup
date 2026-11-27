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

def arrival_glow(m):
    """a stone glows warm gold while it is being laid: driven by the object's colour (R = 1 normal, 0 = full glow)"""
    nt = m.node_tree; N = nt.nodes; L = nt.links; b = N['Principled BSDF']
    oi = N.new('ShaderNodeObjectInfo'); sp = N.new('ShaderNodeSeparateColor'); L.new(oi.outputs['Color'], sp.inputs[0])
    inv = N.new('ShaderNodeMath'); inv.operation = 'SUBTRACT'; inv.inputs[0].default_value = 1; L.new(sp.outputs[0], inv.inputs[1])
    k = N.new('ShaderNodeMath'); k.operation = 'MULTIPLY'; k.inputs[1].default_value = 1.5; L.new(inv.outputs[0], k.inputs[0])
    mx = N.new('ShaderNodeMix'); mx.data_type = 'RGBA'; L.new(sp.outputs[2], mx.inputs['Factor']); mx.inputs['A'].default_value = (1.0, .95, .88, 1); mx.inputs['B'].default_value = (1.0, .66, .26, 1)
    L.new(mx.outputs['Result'], b.inputs['Emission Color']); L.new(k.outputs[0], b.inputs['Emission Strength'])   # B = 1 warm gold, B = 0 soft white (the walls)

def flag_mat():
    """the Patitapabana bana: red-orange cloth with the crescent and sun near the hoist (a texture drawn here, mapped by the flag's UVs)"""
    import os
    p = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'flag_tex.png')
    if False:
        W, H = 1024, 512; im = Image.new('RGB', (W, H), (214, 58, 16)); d = ImageDraw.Draw(im)
        d.rectangle((0, 0, W, 26), fill=(240, 186, 40)); d.rectangle((0, H - 26, W, H), fill=(240, 186, 40))
        cx, cy, r = 250, 250, 120
        d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(246, 238, 220)); d.ellipse((cx - r + 46, cy - r - 18, cx + r + 46, cy + r - 18), fill=(214, 58, 16))   # crescent
        d.ellipse((cx + 20, cy - 10, cx + 84, cy + 54), fill=(246, 210, 90))                                                                       # the sun inside it
        im.save(p)
    mt = bpy.data.materials.new('patitapabana'); mt.use_nodes = True; nt = mt.node_tree; N = nt.nodes; L = nt.links; b = N['Principled BSDF']
    tx = N.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(p); tx.image.pack(); L.new(tx.outputs['Color'], b.inputs['Base Color']); b.inputs['Roughness'].default_value = .7
    try: b.inputs['Sheen Weight'].default_value = .5
    except Exception: pass
    return mt

def make():
    M = {}
    M['stone'] = mat_stone('limeplaster', (.80, .765, .69), var=.07, rough=.8, scale=1.4, bump=.4, dirt=.34, joints=(99., 1.45))   # lime-plastered white, grey in the recesses
    M['laterite'] = mat_stone('laterite', (.55, .26, .15), var=.16, rough=.92, scale=2.2, bump=.6, dirt=.18, joints=(.6, 1.15))
    M['steps'] = mat_stone('steps', (.50, .45, .39), var=.1, rough=.7, scale=2, bump=.25, dirt=.3, joints=(99., 2.2))
    M['kalasha'] = mat_basic('gilt', (.83, .62, .28), .28, 1.0)
    M['chakra'] = mat_basic('ashtadhatu', (.11, .09, .075), .3, .9)   # the eight-metal wheel reads near-black
    M['wood'] = mat_basic('wood', (.30, .19, .11), .7)
    M['trunk'] = mat_stone('trunk', (.42, .36, .29), var=.15, rough=.9, scale=3, bump=.6, dirt=0)
    M['leaf'] = mat_basic('palmleaf', (.10, .22, .045), .55)
    M['coconut'] = mat_basic('coconut', (.25, .3, .09), .5)
    M['sand'] = sand('sand'); M['water'] = water('sea')
    M['flag'] = cloth('flag_red', (.72, .05, .03)); M['flag2'] = cloth('flag_yellow', (.92, .62, .05))
    M['ochre'] = mat_basic('ochre_band', (.62, .16, .06), .7); M['plaster_dark'] = mat_stone('bada_plaster', (.70, .66, .59), var=.08, rough=.85, scale=1.4, bump=.4, dirt=.4, joints=(99., 1.45))
    for k, c in (('w1', (.86, .84, .79)), ('w2', (.84, .74, .58)), ('w3', (.76, .56, .36)), ('w4', (.80, .64, .56))):
        M['house_' + k] = mat_stone('house_' + k, c, var=.06, rough=.92, scale=.6, bump=.15, dirt=.3)
    M['window'] = mat_basic('window', (.05, .04, .035), .5)
    M['shiphull'] = mat_stone('shiphull', (.20, .12, .07), var=.15, rough=.65, scale=3, bump=.3, dirt=0)
    M['sail'] = cloth('sail', (.86, .81, .70), .3)
    M['clay'] = mat_stone('clay', (.55, .27, .14), var=.12, rough=.8, scale=6, bump=.4, dirt=.1)
    M['ghost'] = mat_basic('ghost', (.9, .88, .84), .6)
    M['sandstone'] = mat_stone('sandstone', (.44, .29, .19), var=.12, rough=.88, scale=1.6, bump=.45, dirt=.3, joints=(99., 1.45))   # the halls' bases and the side shrines: weathered brown stone
    M['flagcloth'] = flag_mat()
    for k in ('stone', 'laterite', 'plaster_dark', 'clay', 'ochre', 'sandstone'): arrival_glow(M[k])
    M['farland'] = mat_stone('farland', (.30, .32, .17), var=.25, rough=.95, scale=.004, bump=0, dirt=0)
    return M
