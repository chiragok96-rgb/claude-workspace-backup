# Version traps and hard-won fixes

Symptoms first — these all *look like* art problems, not bugs, which is what
makes them expensive.

## 1. Everything renders default grey/white
**Cause:** a hand-rolled bmesh merge. `bm.from_mesh()` copies per-face
`material_index`, but if the destination mesh has no material slots every index
resolves to nothing.
**Fix:** collect each source mesh's materials, build a remap table, rewrite
`face.material_index` for newly added faces, then append the slots to the
destination mesh. Implemented in `bl_lib.merge()`.

## 2. Rotations silently ignored; parts end up flat or mis-oriented
**Cause:** reading `obj.matrix_world` on a freshly created object. It is only
refreshed when the depsgraph evaluates, so you bake an identity matrix.
**Fix:** compute it yourself —
`Matrix.LocRotScale(o.location, Euler(o.rotation_euler), o.scale)`
(`bl_lib.local_matrix`). Or call `bpy.context.view_layer.update()` first, which
is far slower in a loop.

## 3. Scene looks flat and pastel no matter how strong the sun is
**Cause:** a physical sky bright enough to look right to the camera is an
enormous area light. At Background Strength 1.0 it dominates the key.
**Fix:** drive Strength from `Light Path → Is Camera Ray`: 1.0 for camera rays,
0.05–0.15 otherwise. `bl_lib.world_sky(ambient=...)`.
Measured: ambient 0.30 → washed pastel; ambient 0.06 → rich and saturated.

## 4. Sky glow on one side, shadows from the other
**Cause:** `ShaderNodeTexSky.sun_rotation` and a Sun lamp's euler use different
conventions.
**Measured (Blender 5.3):** sky azimuth = `sun_rotation − 8°`, swept from +Y
toward +X; matching lamp euler = `(90° − elev, 0, 188° − sun_rotation)`.
**Re-probe on any new Blender version** with the script at the bottom.

## 5. `sky_type = 'NISHITA'` raises TypeError
Blender 5.x renamed the enum. Available: `SINGLE_SCATTERING`,
`MULTIPLE_SCATTERING`, `PREETHAM`, `HOSEK_WILKIE`. `MULTIPLE_SCATTERING` is the
Nishita replacement. `dust_density` is now `aerosol_density`.
Guard with a try/except chain over several names.

## 6. `scene.node_tree` is None / `AttributeError`
Blender 5.x moved compositing to `scene.compositing_node_group` (a node group),
and `scene.compositor_effects` exposes only `active`. The 4.x
`scene.use_nodes = True; scene.node_tree...` pattern is gone.
**Recommendation:** don't composite in Blender at all. Render clean and grade in
a separate pass (`scripts/grade.py`) — faster to iterate, and reusable across
engines.

## 7. Volumetric clouds show a hard horizontal line across the sky
**Cause:** you are seeing the flat bottom face of the volume box.
**Fixes:** multiply density by a vertical falloff derived from local Z, *or*
(much better) skip volumetrics and evaluate clouds in the world shader by
projecting the view ray onto a virtual cloud plane — `bl_lib.sky_clouds()`.
Measured: volumetric box 91 s/frame → world-shader clouds 9 s/frame, and no edge.

## 8. Build takes longer than the render
`bpy.ops.*` is O(scene) per call — `bpy.ops.object.join()` calls
`select_all(DESELECT)` across every object. Creating props *after* a 2 600-object
crowd took 85 s; reordering and switching to bmesh took it to 1.5 s.
Rule: all `merge()` calls first, instancing last.

## 9. Blender won't download
`download.blender.org` is commonly blocked by egress proxies. `pip install bpy`
works and ships the full renderer as a Python module.

## 10. AgX looks desaturated
That is AgX doing its job. Use the `AgX - Punchy` look, and restore saturation
in the grade (`sat=1.10–1.25`) rather than by over-driving light intensities.
Look names vary by version — loop over candidates in a try/except.

---

## Sky azimuth probe (re-run per Blender version)

```python
import bpy, numpy as np
from math import radians as R
for rot in (0, 90, 180, 270):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    w = bpy.data.worlds.new("W"); sc.world = w; w.use_nodes = True
    nt = w.node_tree; nt.nodes.clear()
    o = nt.nodes.new("ShaderNodeOutputWorld"); b = nt.nodes.new("ShaderNodeBackground")
    s = nt.nodes.new("ShaderNodeTexSky"); s.sky_type = 'MULTIPLE_SCATTERING'
    s.sun_elevation = R(9); s.sun_rotation = R(rot)
    s.sun_intensity = 8.0; s.sun_disc = True; s.sun_size = R(3)
    nt.links.new(s.outputs[0], b.inputs["Color"]); nt.links.new(b.outputs[0], o.inputs["Surface"])
    cd = bpy.data.cameras.new("c"); cd.type = 'PANO'
    cd.panorama_type = 'EQUIRECTANGULAR'
    cam = bpy.data.objects.new("c", cd); sc.collection.objects.link(cam)
    cam.rotation_euler = (R(90), 0, 0)          # look along +Y, horizon centred
    sc.camera = cam
    sc.render.engine = 'CYCLES'; sc.cycles.samples = 4; sc.cycles.use_denoising = False
    sc.render.resolution_x = 360; sc.render.resolution_y = 180
    sc.view_settings.view_transform = 'Standard'
    sc.render.filepath = f"/tmp/sky{rot}.png"
    bpy.ops.render.render(write_still=True)
    im = bpy.data.images.load(f"/tmp/sky{rot}.png")
    a = np.array(im.pixels[:]).reshape(180, 360, 4)[:, :, :3].sum(2)
    yy, xx = np.unravel_index(a.argmax(), a.shape)
    print(f"sun_rotation={rot:4d} -> {(xx-180):+4d} deg from +Y (toward +X)")
```

Expected on 5.3: `0 → −8`, `90 → +82`, `180 → +172`, `270 → −96`.
