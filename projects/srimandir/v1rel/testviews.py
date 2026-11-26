# Render look-test views of the static scene: /home/user/bpyenv/bin/python testviews.py <out_dir> <scale%> <samples> [view names]
import bpy, sys, os, math, time
HERE = os.path.dirname(os.path.abspath(__file__))
args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
out, pct, spp = args[0], int(args[1]), int(args[2]); names = args[3:]
bpy.ops.wm.open_mainfile(filepath=os.path.join(HERE, 'srimandir_static.blend'))
sc = bpy.context.scene; cam = bpy.data.objects['cam']; tgt = bpy.data.objects['cam_target']
sc.render.resolution_percentage = pct; sc.cycles.samples = spp
VIEWS = {
  'aerial': ((260, -330, 170), (25, 0, 18), 35, 12, 30),
  'ground': ((45, -58, 6), (0, 0, 32), 24, 4, 30),
  'sea':    ((-150, -470, 4.5), (0, 0, 36), 85, 5.6, 20),
  'chakra': ((5, -9, 69.5), (0, 0, 68.2), 50, 2.8, 15),
  'east':   ((150, -40, 14), (40, 0, 20), 28, 8, 25),
  'morning':((60, -190, 30), (0, 0, 30), 40, 8, 5),
}
os.makedirs(out, exist_ok=True)
for n in names or VIEWS:
    loc, look, lens, fstop, t = VIEWS[n]
    sc.frame_set(round(t * 30)); cam.location = loc; tgt.location = look; cam.data.lens = lens; cam.data.dof.aperture_fstop = fstop
    sc.render.filepath = os.path.join(out, n + '.png'); t0 = time.time(); bpy.ops.render.render(write_still=True); print(n, round(time.time() - t0, 1), 's', flush=True)
