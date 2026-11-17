import bpy, math, numpy as np
from math import radians as R
for rot in (0, 90, 180, 270):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc=bpy.context.scene
    w=bpy.data.worlds.new("W"); sc.world=w; w.use_nodes=True
    nt=w.node_tree; nt.nodes.clear()
    o=nt.nodes.new("ShaderNodeOutputWorld"); b=nt.nodes.new("ShaderNodeBackground")
    s=nt.nodes.new("ShaderNodeTexSky"); s.sky_type='MULTIPLE_SCATTERING'
    s.sun_elevation=R(9); s.sun_rotation=R(rot); s.sun_intensity=8.0; s.sun_disc=True
    s.sun_size=R(3)
    nt.links.new(s.outputs[0],b.inputs["Color"]); nt.links.new(b.outputs[0],o.inputs["Surface"])
    cd=bpy.data.cameras.new("c"); cd.type='PANO'
    try: cd.panorama_type='EQUIRECTANGULAR'
    except Exception as e: print("pano",e)
    cam=bpy.data.objects.new("c",cd); sc.collection.objects.link(cam)
    cam.rotation_euler=(R(90),0,0)   # look along +Y, horizon centred
    sc.camera=cam
    sc.render.engine='CYCLES'; sc.cycles.samples=4; sc.cycles.use_denoising=False
    sc.render.resolution_x=360; sc.render.resolution_y=180
    sc.view_settings.view_transform='Standard'
    sc.render.filepath=f"/tmp/sky{rot}.png"
    bpy.ops.render.render(write_still=True)
    im=bpy.data.images.load(f"/tmp/sky{rot}.png")
    a=np.array(im.pixels[:]).reshape(180,360,4)[:,:,:3].sum(2)
    yy,xx=np.unravel_index(a.argmax(), a.shape)
    # equirect: camera looks +Y at image centre; x spans 360deg
    az_img=(xx-180)/360.0*360.0
    print(f"sun_rotation={rot:4d}  brightest px x={xx:3d} y={yy:3d}  -> {az_img:+7.1f} deg from +Y (CCW+)")
    bpy.data.images.remove(im)
