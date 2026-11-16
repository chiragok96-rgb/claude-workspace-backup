import sys; sys.path.insert(0, '/home/user/radha-pada-darshan/tools')
from pt import *
P = Patta(1080, 1920, seed=3)
box = P.border(40, 300, 1000, 1100)
P.field(box, PIG['night'])
x, y, w, h = box; gy = y + h - 230
pedestal(P, 540, gy, 760)
# Gopinath: the yellow dhoti hem, the garland ends, his crossed blue feet
P.poly(path(((230, gy - 330), (290, gy - 350), (360, gy - 350), (420, gy - 330)), (430, gy - 250), ((430, gy - 250), (360, gy - 236), (290, gy - 236), (220, gy - 252))), PIG['yel'])
for i in range(5): P.line(bez((262 + i * 30, gy - 332), (260 + i * 31, gy - 300), (258 + i * 32, gy - 270), (256 + i * 33, gy - 244)), 1.4)
P.poly(path((220, gy - 266), ((220, gy - 266), (290, gy - 252), (360, gy - 252), (430, gy - 264)), (430, gy - 250), ((430, gy - 250), (360, gy - 236), (290, gy - 236), (220, gy - 252))), PIG['red'], True, 1.4)
foot_front(P, 290, gy, .95, 1, skin=PIG['blue'], alta=False, anklet=PIG['yel'], toering=False, leg=250)
foot_front(P, 360, gy, .95, -1, skin=PIG['blue'], alta=False, anklet=PIG['yel'], toering=False, leg=270, tiptoe=.7, rot=-.18)
# the empty place at his left: bare primed cloth with the painter's faint guide line only
P.fill(P.mask([(560, gy - 420), (900, gy - 420), (900, gy - 2), (560, gy - 2)]), PIG['cream'], .97, wander=1.5)
P.line([(590, gy - 6), (870, gy - 6)], 1.2, PIG['red'], .35)
P.save(sys.argv[1]); print('ok')
