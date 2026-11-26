# The one-take camera: [t, camera position, look-at point, lens mm, f-stop]. Bezier-smoothed between keys.
import bpy, math
from geo import *

KEYS = [
 (0.0,  (70, -380, 3.6),   (8, 0, 18),      30, 8),     # over the morning sea, toward Puri
 (2.6,  (48, -215, 6.0),   (20, -110, 3.0), 30, 8),     # over the surf and the beach
 (5.2,  (32, -105, 8),     (2, -4, 6),      32, 8),     # onto the site
 (7.4,  (24, -46, 6.5),    (2, -8, 4.0),    35, 4),     # the first stones are laid
 (9.8,  (30, -44, 15),     (0, 0, 13),      30, 5.6),
 (12.4, (40, -62, 36),     (0, 0, 34),      28, 8),     # higher, narrower
 (14.3, (62, -112, 50),    (0, 0, 42),      28, 8),     # the crown
 (16.8, (55, -262, 40),    (0, 0, 38),      34, 11),    # 214 ft, drifting out over the beach
 (19.2, (-60, -430, 4.5),  (6, 0, 38),      55, 8),     # out over the sea: the sailors' view, past a ship
 (21.4, (-56, -425, 5.0),  (6, 0, 40),      57, 8),     # "White Pagoda"
 (23.0, (-4, -190, 55),    (12, 0, 10),     32, 8),     # a high arc back over the beach
 (24.6, (36, -30, 7.5),    (15, 0, 5.5),    30, 5),     # devotees crowd the small sanctum door
 (25.6, (40, -36, 9),      (17, 0, 6),      28, 5.6),
 (29.7, (78, -84, 34),     (26, 0, 18),     30, 8),     # Jagamohana
 (33.0, (106, -88, 30),    (50, 0, 12),     30, 8),
 (35.2, (57, -21.5, 4.7),  (51, -13, 4.2),  28, 4),     # nacha: the dancers on the terrace, bhoga carried past
 (37.3, (96, -40, 15),     (70, -6, 6),     28, 8),     # the Bhogamandapa
 (40.2, (118, -46, 24),    (86, -74, 3),    30, 8),     # Rosaghara
 (42.4, (84, -46, 4.5),    (84, -70, 2.5),  28, 6),
 (43.7, (84, -61, 2.2),    (84, -76, 1.6),  24, 5),     # through the kitchen door
 (45.7, (84, -72.5, 2.0),  (84, -84, 1.8),  28, 4),     # pots stacked on the chulha
 (47.6, (84.3, -79.5, 3.6),(84, -84.6, 3.3), 32, 3.5),  # the topmost pot steams
 (49.2, (84, -82.5, 5.6),  (84, -84.6, 6.5), 28, 5),    # rise with the steam
 (50.4, (84.5, -80, 9),    (84, -84, 3),    24, 8),     # out through the roof
 (53.2, (130, -210, 175),  (25, 0, 10),     28, 11),    # high above: the armies come
 (57.4, (165, -235, 150),  (25, 0, 5),      30, 11),    # two walls
 (59.8, (205, -150, 62),   (128, 0, 8),     32, 11),
 (62.6, (150, -22, 13),    (240, 0, 8),     30, 8),     # out of Singhadwara onto Bada Danda
 (65.6, (178, -26, 9),     (222, 0, 9),     35, 8),     # three new raths
 (69.0, (205, -30, 7),     (235, 0, 9),     32, 8),     # the ropes, the pull
 (70.8, (200, -2, 10),     (150, 0, 8),     30, 8),
 (72.4, (114, 0, 3.2),     (98, 0, 5),      26, 8),     # back through the gate: the 22 steps
 (73.5, (102, -32, 34),    (10, 0, 60),     38, 8),     # rising beside the compound toward the spire
 (74.7, (27, -30, 68.5),   (0, 0, 68.2),    60, 5.6),   # the Nilachakra
 (76.2, (18, -8, 52.5),     (8.6, .3, 52.5),  50, 5.6),   # the sevayat climbing, close
 (77.6, (14, -8, 56.5),     (5, .3, 56.5),   50, 5.6),
 (78.8, (11, -9, 62.5),     (2.5, 0, 62),    45, 5.6),
 (79.9, (7, -9.5, 70.5),    (0, 0, 71),      40, 5.6),   # the flag changed
 (81.2, (18, -24, 74),     (0, 0, 72),      34, 6),
 (84.4, (150, 165, 88),    (22, -12, 12),   30, 11),    # you built Puri's Srimandir: the whole complex, sea beyond
]

def camera(cam, tgt, sc):
    for t, loc, look, lens, fs in KEYS:
        f = F(t); cam.location = loc; tgt.location = look; cam.data.lens = lens; cam.data.dof.aperture_fstop = fs
        cam.keyframe_insert('location', frame=f); tgt.keyframe_insert('location', frame=f)
        cam.data.keyframe_insert('lens', frame=f); cam.data.keyframe_insert('dof.aperture_fstop', frame=f)
    for idb in (cam, tgt, cam.data):
        for fc in fcurves(idb.animation_data.action):
            for k in fc.keyframe_points: k.interpolation = 'BEZIER'; k.handle_left_type = 'AUTO_CLAMPED'; k.handle_right_type = 'AUTO_CLAMPED'
            fc.update()
