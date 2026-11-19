# Lay the storyboard frames out as one labelled sheet (and a two-part version for the phone).
import sys, os
from PIL import Image, ImageDraw, ImageFont
D = sys.argv[1]; OUT = sys.argv[2]
F = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'fonts')
fT = ImageFont.truetype(os.path.join(F, 'CormorantGaramond.ttf'), 25); fT.set_variation_by_axes([600])
fS = ImageFont.truetype(os.path.join(F, 'CormorantGaramond-Italic.ttf'), 23); fS.set_variation_by_axes([500])
fH = ImageFont.truetype(os.path.join(F, 'Cinzel.ttf'), 44)
B = [  # (frame, time, medium, what happens)
 (1, '0.0–4.5', 'WATERCOLOUR', 'Dawn on the Kalinga shore. The scent of cloves rises from the far isles as a gold thread and drifts in on the breeze; it settles on a palm leaf lying on the sand.'),
 (2, '5.0–7.7', 'PALM LEAF', 'The camera sinks into the leaf. A stylus incises Kalidasa’s own line, Raghuvamsha 6.57, in Odia script; “lavanga-pushpai” (clove blossoms) is laid in gold.'),
 (3, '8.3–15.2', 'CHITRA-POTHI', 'A painting opens across the leaves: the Kalinga king enthroned on a rearing wave, under the parasol, boitas on the horizon. “Mahodadhipati” is cut, then gilded.'),
 (4, '15.8–19.7', 'PALM LEAF', 'A sea-chart is incised: Kalinga’s coast, the far islands. The dotted route sails out, turns back, and curls into a question mark; the clove is its dot.'),
 (5, '20.4–23.8', 'WATERCOLOUR · EARTH', '“Not only in poetry…” The stylus groove deepens into a trench; the camera sinks with the clove through the sand beds of the old port.'),
 (6, '24.8–31.2', 'WATERCOLOUR · EARTH', 'Two kendis (spouted jars) in the earth: Manikapatna’s and Bali–Java’s. Their rouletted bands light up row by row, and a gold seam joins them: they match.'),
 (7, '31.9–34.3', 'RAVANA CHHAYA', 'A lamp is lit behind the earth: everything turns to shadow on cloth. The pot tries to swim the sea by itself, flails, and starts to sink.'),
 (8, '34.8–37.4', 'RAVANA CHHAYA', '“Who carried it?” A Sadhaba puppet on bamboo rods lifts the pot to his shoulder: “Sadhaba”.'),
 (9, '38.0–42.7', 'SHADOW → WAYANG', 'The sails unfold on “pala kholi”. The boita sails; three isles rise on their names (Bali, Java, Sumatra) and the kayon of Wayang greets it. The puppets take on Javanese filigree.'),
 (10, '43.3–47.3', 'SHADOW · LAMP DIMS', '“The voyages ended…” The lamp dims and the sails fold, but the boita’s outline stays lit in gold: it never left memory.'),
 (11, '47.9–50.1', 'PAPER LIGHTBOX', 'The gold outline shrinks into a single lamp-boat. Night on the Mahanadi, a hundred lamp-boats, Cuttack’s fair; a woman watches the boats she set afloat. “Bali Jatra” glows in cut paper.'),
 (12, '50.6–57.6', 'PAPER LIGHTBOX', '“This year?” A Balinese split gate opens onto a Kalinga torana. Above, a garland of ikat diamonds and batik kawung: Indonesia, the partner country.'),
 (13, '58.1–62.1', 'LIGHTBOX → LOOP', 'Kalidasa’s leaf glows above the fair; on “melare” its lines run on as the fair’s festoons. The scent drifts out to sea and the screen washes into the dawn shore: frame 1.'),
]
TW, TH, PAD, LAB = 330, 587, 22, 175
COLS = 7
def sheet(items, out):
    rows = (len(items) + COLS - 1) // COLS
    Wd = COLS * (TW + PAD) + PAD; Hd = 120 + rows * (TH + LAB + PAD) + PAD
    im = Image.new('RGB', (Wd, Hd), '#17110d'); d = ImageDraw.Draw(im)
    d.text((PAD, 34), 'BALI JATRA  ·  STORYBOARD', font=fH, fill='#efe2c6')
    for k, (f, t, med, txt) in enumerate(items):
        x = PAD + (k % COLS) * (TW + PAD); y = 120 + (k // COLS) * (TH + LAB + PAD)
        im.paste(Image.open(os.path.join(D, f'f{f}_0.jpg')).resize((TW, TH), Image.LANCZOS), (x, y))
        d.text((x, y + TH + 8), f'{f:02d}  ·  {t} s', font=fT, fill='#e7b45a'); d.text((x, y + TH + 36), med, font=fT, fill='#b98f52')
        words, line, ly = txt.split(), '', y + TH + 70
        for w in words:
            if d.textlength(line + ' ' + w, font=fS) > TW and line: d.text((x, ly), line, font=fS, fill='#d9ccb4'); ly += 26; line = w
            else: line = (line + ' ' + w).strip()
        d.text((x, ly), line, font=fS, fill='#d9ccb4')
    im.save(out, quality=92); print(out, im.size)
sheet(B, OUT)
sheet(B[:7], OUT.replace('.jpg', '_part1.jpg')); sheet(B[7:], OUT.replace('.jpg', '_part2.jpg'))
