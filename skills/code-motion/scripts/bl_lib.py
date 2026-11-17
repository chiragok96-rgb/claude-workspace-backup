"""
bl_lib - fast procedural geometry + correct light rigging for Blender-as-a-module (bpy).

Why this exists:
  * bpy.ops.* is O(scene) per call. Building 5k objects with ops takes ~90s;
    the bmesh/data-API equivalents here take ~1.5s. Always prefer these.
  * merge() preserves MATERIAL SLOTS. The naive bmesh merge silently drops them
    and every object renders default grey - the single most expensive trap here.
  * sun_rig() encodes the *measured* relationship between the Sky texture's
    sun_rotation and a Sun lamp's euler. Getting this wrong puts your sky glow
    and your shadows on opposite sides, which looks "flat" rather than "broken".

Usage:
    import bl_lib as B
    B.reset()
    m = B.mat("gold", (0.8,0.56,0.12), rough=0.25, metal=1.0)
    B.cyl(1.0, 0.3, (0,0,1), m=m)
"""
import bpy, bmesh, random
from math import radians as R, pi, sin, cos
from mathutils import Matrix, Euler

SC = None; COLL = None; _MC = {}

def reset():
    global SC, COLL, _MC
    bpy.ops.wm.read_factory_settings(use_empty=True)
    SC = bpy.context.scene; COLL = SC.collection; _MC = {}
    return SC

def link(o):
    COLL.objects.link(o); return o

# ---------------------------------------------------------------- materials
def mat(name, col, rough=0.6, metal=0.0, ior=1.45, emit=None, es=0.0):
    """Cached - call with the same name to reuse. Thousands of one-off
    materials will balloon the .blend and slow BVH build."""
    if name in _MC: return _MC[name]
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*col, 1)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    b.inputs["IOR"].default_value = ior
    if emit:
        b.inputs["Emission Color"].default_value = (*emit, 1)
        b.inputs["Emission Strength"].default_value = es
    _MC[name] = m; return m

def radial_stripes(name, c1, c2, count=24, rough=0.86):
    """Vertical stripes wrapped around the object's local Z axis.
    Uses OBJECT coordinates -> the object's origin must stay on the axis,
    so do NOT merge a striped object into a parent with a different origin."""
    if name in _MC: return _MC[name]
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; N = nt.nodes; L = nt.links
    b = N["Principled BSDF"]; b.inputs["Roughness"].default_value = rough
    tc = N.new("ShaderNodeTexCoord"); sep = N.new("ShaderNodeSeparateXYZ")
    L.new(tc.outputs["Object"], sep.inputs["Vector"])
    at = N.new("ShaderNodeMath"); at.operation = 'ARCTAN2'
    L.new(sep.outputs["Y"], at.inputs[0]); L.new(sep.outputs["X"], at.inputs[1])
    mu = N.new("ShaderNodeMath"); mu.operation = 'MULTIPLY'
    mu.inputs[1].default_value = count/(2*pi); L.new(at.outputs[0], mu.inputs[0])
    fr = N.new("ShaderNodeMath"); fr.operation = 'FRACT'; L.new(mu.outputs[0], fr.inputs[0])
    rp = N.new("ShaderNodeValToRGB"); rp.color_ramp.interpolation = 'CONSTANT'
    e = rp.color_ramp.elements
    e[0].position = 0.0; e[0].color = (*c1, 1)
    e[1].position = 0.5; e[1].color = (*c2, 1)
    L.new(fr.outputs[0], rp.inputs["Fac"]); L.new(rp.outputs["Color"], b.inputs["Base Color"])
    _MC[name] = m; return m

# ---------------------------------------------------------------- primitives
def _obj(me, name, loc=(0,0,0), rot=(0,0,0), m=None):
    o = bpy.data.objects.new(name, me); link(o)
    o.location = loc; o.rotation_euler = rot
    if m and not me.materials: me.materials.append(m)
    return o

def _fin(bm, name, loc, rot, m, smooth=False):
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    if smooth:
        for p in me.polygons: p.use_smooth = True
    return _obj(me, name, loc, rot, m)

def cyl(r, d, loc=(0,0,0), rot=(0,0,0), v=20, m=None, name="cyl"):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=v,
                          radius1=r, radius2=r, depth=d)
    return _fin(bm, name, loc, rot, m)

def cone(r1, r2, d, loc=(0,0,0), rot=(0,0,0), v=24, m=None, name="cone"):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=v,
                          radius1=r1, radius2=r2, depth=d)
    return _fin(bm, name, loc, rot, m)

def box(sc, loc=(0,0,0), rot=(0,0,0), m=None, name="box"):
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1)
    bmesh.ops.scale(bm, vec=sc, verts=bm.verts)
    return _fin(bm, name, loc, rot, m)

def sph(r, loc=(0,0,0), seg=16, m=None, name="sph"):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=max(6, seg//2), radius=r)
    return _fin(bm, name, loc, (0,0,0), m, smooth=True)

def plane(sx, sy, loc=(0,0,0), rot=(0,0,0), m=None, name="pl"):
    bm = bmesh.new(); bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=0.5)
    bmesh.ops.scale(bm, vec=(sx, sy, 1), verts=bm.verts)
    return _fin(bm, name, loc, rot, m)

def lathe(prof, seg=56, name="lathe", smooth=True, m=None, loc=(0,0,0), rot=(0,0,0)):
    """Revolve a [(radius, z), ...] profile around Z. The workhorse for domes,
    spires, canopies, vases, columns. Keep the top radius > 0 to avoid
    degenerate faces at the pole."""
    bm = bmesh.new(); rings = []
    for (r, z) in prof:
        rings.append([bm.verts.new((cos(2*pi*i/seg)*r, sin(2*pi*i/seg)*r, z))
                      for i in range(seg)])
    for k in range(len(rings)-1):
        A, Bv = rings[k], rings[k+1]
        for i in range(seg):
            j = (i+1) % seg
            try: bm.faces.new((A[i], A[j], Bv[j], Bv[i]))
            except ValueError: pass
    return _fin(bm, name, loc, rot, m, smooth)

# ---------------------------------------------------------------- merging
def local_matrix(o):
    """Depsgraph-independent. o.matrix_world is STALE for freshly created
    objects until a scene update, which silently bakes wrong transforms."""
    return Matrix.LocRotScale(o.location, Euler(o.rotation_euler), o.scale)

def merge(objs, name):
    """Merge into one mesh, preserving transforms AND material slots."""
    bm = bmesh.new(); mats = []
    for o in objs:
        om = list(o.data.materials) or [None]
        remap = []
        for mm in om:
            if mm not in mats: mats.append(mm)
            remap.append(mats.index(mm))
        tmp = o.data.copy(); tmp.transform(local_matrix(o))
        before = len(bm.faces)
        bm.from_mesh(tmp); bm.faces.ensure_lookup_table()
        for f in bm.faces[before:]:
            f.material_index = remap[min(f.material_index, len(remap)-1)]
        bpy.data.meshes.remove(tmp); bpy.data.objects.remove(o, do_unlink=True)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    for mm in mats:
        if mm: me.materials.append(mm)
    o = bpy.data.objects.new(name, me); link(o)
    return o

def instance(mesh_data, n, place_fn, parent_name="inst"):
    """Linked duplicates share mesh data -> Cycles instances them.
    This is how you get 10k+ crowd members for near-zero memory.
    place_fn(i) -> (loc, rot_z, scale) or None to skip."""
    par = bpy.data.objects.new(parent_name, None); link(par)
    made = 0
    for i in range(n):
        r = place_fn(i)
        if r is None: continue
        loc, rz, sc = r
        o = bpy.data.objects.new("i", mesh_data); link(o)
        o.location = loc; o.rotation_euler = (0, 0, rz)
        o.scale = (sc, sc, sc) if isinstance(sc, (int, float)) else sc
        o.parent = par; made += 1
    return par, made

# ---------------------------------------------------------------- sky + sun
# MEASURED (Blender 5.3, equirectangular probe):
#   sky azimuth = sun_rotation - 8deg, swept from +Y toward +X.
#   A matching Sun lamp is   euler = (90 - elev, 0, 188 - sun_rotation).
# Blender 4.x named this sky type NISHITA; 5.x renames it MULTIPLE_SCATTERING
# and replaces dust_density with aerosol_density.
SKY_AZ_OFFSET = 8.0

def sky_sun_vector(sun_rotation_deg, elev_deg):
    a = R(sun_rotation_deg - SKY_AZ_OFFSET); e = R(elev_deg)
    return (sin(a)*cos(e), cos(a)*cos(e), sin(e))

def world_sky(sun_rotation=270, elev=8.0, sun_intensity=1.4, aerosol=1.6,
              air=1.0, ozone=1.0, ambient=0.12, sun_size=2.0):
    """Physical sky whose brightness to the CAMERA is independent of its
    brightness as a LIGHT SOURCE. Without this split a hazy sky acts as a
    giant softbox and washes every surface to pastel - set ambient ~0.05-0.15."""
    w = bpy.data.worlds.new("W"); SC.world = w; w.use_nodes = True
    nt = w.node_tree; nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputWorld"); bg = nt.nodes.new("ShaderNodeBackground")
    sky = nt.nodes.new("ShaderNodeTexSky")
    for st in ('MULTIPLE_SCATTERING', 'NISHITA', 'HOSEK_WILKIE'):
        try: sky.sky_type = st; break
        except TypeError: continue
    sky.sun_elevation = R(elev); sky.sun_rotation = R(sun_rotation)
    sky.sun_intensity = sun_intensity; sky.sun_size = R(sun_size); sky.sun_disc = True
    for attr, val in (("altitude", 15), ("air_density", air),
                      ("aerosol_density", aerosol), ("dust_density", aerosol),
                      ("ozone_density", ozone)):
        try: setattr(sky, attr, val)
        except AttributeError: pass
    nt.links.new(sky.outputs[0], bg.inputs["Color"])
    lp = nt.nodes.new("ShaderNodeLightPath")
    m1 = nt.nodes.new("ShaderNodeMath"); m1.operation='MULTIPLY'; m1.inputs[1].default_value = 1.0-ambient
    m2 = nt.nodes.new("ShaderNodeMath"); m2.operation='ADD';      m2.inputs[1].default_value = ambient
    nt.links.new(lp.outputs['Is Camera Ray'], m1.inputs[0])
    nt.links.new(m1.outputs[0], m2.inputs[0]); nt.links.new(m2.outputs[0], bg.inputs["Strength"])
    nt.links.new(bg.outputs[0], out.inputs["Surface"])
    return w, nt, sky, bg

def sun_rig(sun_rotation=270, elev=8.0, energy=10.0, color=(1.0,0.58,0.28),
            angle=2.0, fill=0.35, bounce=0.8):
    """Key sun aligned to world_sky(), plus a cool sky fill and a warm
    ground-bounce. The bounce is what stops backlit subjects reading as
    flat silhouettes."""
    sd = bpy.data.lights.new("sun", type='SUN')
    sd.energy = energy; sd.angle = R(angle); sd.color = color
    so = bpy.data.objects.new("sun", sd); link(so)
    so.rotation_euler = (R(90-elev), 0, R(180+SKY_AZ_OFFSET-sun_rotation))
    if fill:
        fd = bpy.data.lights.new("fill", type='SUN')
        fd.energy = fill; fd.angle = R(50); fd.color = (0.38,0.55,0.95)
        fo = bpy.data.objects.new("fill", fd); link(fo); fo.rotation_euler = (R(52),0,R(150))
    if bounce:
        bd = bpy.data.lights.new("bounce", type='SUN')
        bd.energy = bounce; bd.angle = R(60); bd.color = (1.0,0.74,0.48)
        bo = bpy.data.objects.new("bounce", bd); link(bo)
        bo.rotation_euler = (R(118), 0, R(180+SKY_AZ_OFFSET-sun_rotation))
    return so

def sky_clouds(nt, sky, bg, sun_rotation=270, elev=8.0, scale=1.5, cover=0.48,
               cover2=0.66, spread=0.30):
    """Clouds evaluated in the WORLD shader: the view ray is projected onto a
    virtual cloud plane. Costs nothing (a volumetric cloud box costs ~10x the
    render AND shows its flat bottom edge as a hard line across the sky)."""
    SUNV = sky_sun_vector(sun_rotation, elev)
    tc = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(tc.outputs["Generated"], sep.inputs["Vector"])
    zc = nt.nodes.new("ShaderNodeMath"); zc.operation='MAXIMUM'; zc.inputs[1].default_value=0.045
    nt.links.new(sep.outputs["Z"], zc.inputs[0])
    du = nt.nodes.new("ShaderNodeMath"); du.operation='DIVIDE'
    nt.links.new(sep.outputs["X"], du.inputs[0]); nt.links.new(zc.outputs[0], du.inputs[1])
    dv = nt.nodes.new("ShaderNodeMath"); dv.operation='DIVIDE'
    nt.links.new(sep.outputs["Y"], dv.inputs[0]); nt.links.new(zc.outputs[0], dv.inputs[1])
    cmb = nt.nodes.new("ShaderNodeCombineXYZ")
    nt.links.new(du.outputs[0], cmb.inputs["X"]); nt.links.new(dv.outputs[0], cmb.inputs["Y"])
    mp = nt.nodes.new("ShaderNodeMapping"); mp.inputs["Scale"].default_value=(spread,spread,1)
    nt.links.new(cmb.outputs[0], mp.inputs["Vector"])
    nz = nt.nodes.new("ShaderNodeTexNoise")
    nz.inputs["Scale"].default_value=scale; nz.inputs["Detail"].default_value=11.0
    nz.inputs["Roughness"].default_value=0.56
    nt.links.new(mp.outputs["Vector"], nz.inputs["Vector"])
    rp = nt.nodes.new("ShaderNodeValToRGB")
    rp.color_ramp.elements[0].position=cover; rp.color_ramp.elements[1].position=cover2
    nt.links.new(nz.outputs["Fac"], rp.inputs["Fac"])
    fade = nt.nodes.new("ShaderNodeMapRange"); fade.interpolation_type='SMOOTHSTEP'
    fade.inputs["From Min"].default_value=0.012; fade.inputs["From Max"].default_value=0.16
    nt.links.new(sep.outputs["Z"], fade.inputs["Value"])
    fac = nt.nodes.new("ShaderNodeMath"); fac.operation='MULTIPLY'
    nt.links.new(rp.outputs["Color"], fac.inputs[0]); nt.links.new(fade.outputs[0], fac.inputs[1])
    nrm = nt.nodes.new("ShaderNodeVectorMath"); nrm.operation='NORMALIZE'
    nt.links.new(tc.outputs["Generated"], nrm.inputs[0])
    dp = nt.nodes.new("ShaderNodeVectorMath"); dp.operation='DOT_PRODUCT'
    dp.inputs[1].default_value = SUNV
    nt.links.new(nrm.outputs["Vector"], dp.inputs[0])
    dr = nt.nodes.new("ShaderNodeMapRange")
    dr.inputs["From Min"].default_value=0.25; dr.inputs["From Max"].default_value=0.97
    nt.links.new(dp.outputs["Value"], dr.inputs["Value"])
    cc = nt.nodes.new("ShaderNodeMixRGB")
    cc.inputs["Color1"].default_value=(0.60,0.57,0.60,1)
    cc.inputs["Color2"].default_value=(1.00,0.90,0.70,1)
    nt.links.new(dr.outputs[0], cc.inputs["Fac"])
    mix = nt.nodes.new("ShaderNodeMixRGB")
    nt.links.new(fac.outputs[0], mix.inputs["Fac"])
    nt.links.new(sky.outputs[0], mix.inputs["Color1"])
    nt.links.new(cc.outputs[0], mix.inputs["Color2"])
    nt.links.new(mix.outputs[0], bg.inputs["Color"])

# ---------------------------------------------------------------- camera/render
def camera(loc, target, lens=35, fstop=None, vertical=True, sensor=36):
    cd = bpy.data.cameras.new("cam"); cd.lens = lens
    cd.sensor_fit = 'VERTICAL' if vertical else 'HORIZONTAL'
    cd.sensor_height = sensor
    cam = bpy.data.objects.new("cam", cd); link(cam); cam.location = loc
    tgt = bpy.data.objects.new("tgt", None); link(tgt); tgt.location = target
    c = cam.constraints.new('TRACK_TO')
    c.target = tgt; c.track_axis='TRACK_NEGATIVE_Z'; c.up_axis='UP_Y'
    SC.camera = cam
    if fstop:
        cd.dof.use_dof = True; cd.dof.focus_object = tgt; cd.dof.aperture_fstop = fstop
    return cam, tgt

def render(path, rx=1080, ry=1920, samples=160, exposure=0.0, denoise=True, look='punchy'):
    SC.render.engine='CYCLES'; SC.cycles.device='CPU'
    SC.cycles.samples=samples; SC.cycles.use_denoising=denoise
    SC.cycles.max_bounces=5; SC.cycles.diffuse_bounces=3
    SC.cycles.glossy_bounces=3; SC.cycles.transmission_bounces=2
    SC.render.resolution_x=rx; SC.render.resolution_y=ry
    SC.render.filepath=path
    try:
        SC.view_settings.view_transform='AgX'
        if look=='punchy':
            for lk in ('AgX - Punchy','Punchy','AgX - High Contrast'):
                try: SC.view_settings.look=lk; break
                except Exception: pass
    except Exception:
        SC.view_settings.view_transform='Filmic'
    SC.view_settings.exposure=exposure
    bpy.ops.render.render(write_still=True)
    return path
