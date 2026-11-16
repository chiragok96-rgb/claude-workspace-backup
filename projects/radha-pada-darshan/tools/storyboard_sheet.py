# Lay the storyboard frames out as one labelled sheet (and a two-part version for the phone).
import sys, os
from PIL import Image, ImageDraw, ImageFont
D = sys.argv[1]; OUT = sys.argv[2]
F = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'fonts')
fT = ImageFont.truetype(os.path.join(F, 'CormorantGaramond.ttf'), 25); fT.set_variation_by_axes([600])
fS = ImageFont.truetype(os.path.join(F, 'CormorantGaramond-Italic.ttf'), 23); fS.set_variation_by_axes([500])
fH = ImageFont.truetype(os.path.join(F, 'Cinzel.ttf'), 44)
B = [  # (frame, time, medium, what happens)
 (1, '0.0–6.4', 'WATERCOLOUR', 'The hem rests on the pedestal. Its fringe: a thread for each day. One turns alta red; the hem lifts for a glimpse of feet, then falls.'),
 (2, '7.0–12.1', 'WATERCOLOUR', 'Aonla Navami. The red thread runs from the hem to the amla tree; women’s feet circle it, winding the thread round the trunk.'),
 (3, '12.4–16.0', 'WATERCOLOUR', '“Dhadi bandhanti”: the thread pulls taut to the horizon and becomes the line of two lakh people to Sakshigopal. Camera cranes up.'),
 (4, '16.6–21.9', 'JHOTI', 'The camera sinks to the earth floor: the legend is drawn in rice paste. Gopinath’s blue feet, flute, feather. Beside him, an empty seat.'),
 (5, '22.5–26.6', 'JHOTI', 'Lakshmi’s small red footprints, again and again: a sun is drawn for each day she comes.'),
 (6, '27.2–30.8', 'JHOTI · NIGHT', 'Night falls on the floor. Blue footprints leave the temple and walk the lane to her lamp-lit door.'),
 (7, '31.3–33.5', 'JHOTI · DAWN', 'Dawn. A real golden flute lies on the drawing, at her threshold.'),
 (8, '34.1–37.1', 'JHOTI', 'Heavy feet crowd in and smudge the paste. Shadows of pointing hands. The music drops away.'),
 (9, '37.4–43.8', 'JHOTI · DREAM', 'The king’s dream: her footprint opens into a lotus. Lakshmi is Radha. Footprints arrive from the north.'),
 (10, '44.1–50.8', 'JHOTI', 'The empty seat fills with red lotus feet; then a ghagra is drawn down over them, hiding them.'),
 (11, '51.2–53.0', 'LOOM', 'The drawn ghagra becomes real cloth, frays into thread, and an Odia ikat saree is woven from it, border feathering in.'),
 (13, '53.1–56.6', 'WATERCOLOUR', '“Charana dekhagala!” The saree ends above her ankles: the feet, alta, anklets, lit. Marigolds fall.'),
 (14, '57.1–64.8', 'WATERCOLOUR', 'Once a year, on Aonla Navami: Odiani besha beside Natabara besha, their feet on one pedestal.'),
 (15, '65.2–73.5', 'JHOTI → END', 'The accusers’ footprints turn round into a queue, all facing her feet. End card; the thread leads back to frame 1 (loop).'),
]
TW, TH, PAD, LAB = 330, 587, 22, 175
COLS = 7
def sheet(items, out):
    rows = (len(items) + COLS - 1) // COLS
    Wd = COLS * (TW + PAD) + PAD; Hd = 120 + rows * (TH + LAB + PAD) + PAD
    im = Image.new('RGB', (Wd, Hd), '#17110d'); d = ImageDraw.Draw(im)
    d.text((PAD, 34), 'RADHA PADA DARSHAN  ·  STORYBOARD', font=fH, fill='#efe2c6')
    for k, (f, t, med, txt) in enumerate(items):
        x = PAD + (k % COLS) * (TW + PAD); y = 120 + (k // COLS) * (TH + LAB + PAD)
        im.paste(Image.open(os.path.join(D, f'f{f}_0.jpg')).resize((TW, TH), Image.LANCZOS), (x, y))
        d.text((x, y + TH + 8), f'{k + 1:02d}  ·  {t} s', font=fT, fill='#e7b45a'); d.text((x, y + TH + 36), med, font=fT, fill='#b98f52')
        words, line, ly = txt.split(), '', y + TH + 70
        for w in words:
            if d.textlength(line + ' ' + w, font=fS) > TW and line: d.text((x, ly), line, font=fS, fill='#d9ccb4'); ly += 26; line = w
            else: line = (line + ' ' + w).strip()
        d.text((x, ly), line, font=fS, fill='#d9ccb4')
    im.save(out, quality=92); print(out, im.size)
sheet(B, OUT)
sheet(B[:7], OUT.replace('.jpg', '_part1.jpg')); sheet(B[7:], OUT.replace('.jpg', '_part2.jpg'))
