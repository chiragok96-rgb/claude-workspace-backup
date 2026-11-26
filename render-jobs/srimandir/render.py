# Resumable frame renderer: /home/user/bpyenv/bin/python render.py <blend> <out_dir> <start> <end> <step> <pct> <spp>
# Frames with smoke/steam volumes get more samples.
import bpy, sys, os, time
a = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
blend, out, f0, f1, st, pct, spp = a[0], a[1], int(a[2]), int(a[3]), int(a[4]), int(a[5]), int(a[6])
bpy.ops.wm.open_mainfile(filepath=blend); sc = bpy.context.scene; sc.render.resolution_percentage = pct
sc.cycles.volume_step_rate = 2.5
sc.render.image_settings.file_format = 'PNG'; os.makedirs(out, exist_ok=True)
fps = sc.render.fps
for f in range(f0, f1 + 1, st):
    p = os.path.join(out, f'f_{f:05d}.png')
    if os.path.exists(p): continue
    t = f / fps; sc.cycles.samples = 24 if 47.1 < t < 51.8 else spp
    sc.frame_set(f); sc.render.filepath = p + '.tmp.png'; t0 = time.time(); bpy.ops.render.render(write_still=True); os.replace(p + '.tmp.png', p)
    print('frame', f, round(time.time() - t0, 1), flush=True)
print('ALL DONE', flush=True)
