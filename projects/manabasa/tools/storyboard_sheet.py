# Lay the storyboard frames out as one labelled sheet (and a two-part version for the phone).
import sys, os
from PIL import Image, ImageDraw, ImageFont
D = sys.argv[1]; OUT = sys.argv[2]
F = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'fonts')
fT = ImageFont.truetype(os.path.join(F, 'CormorantGaramond.ttf'), 25); fT.set_variation_by_axes([600])
fS = ImageFont.truetype(os.path.join(F, 'CormorantGaramond-Italic.ttf'), 23); fS.set_variation_by_axes([500])
fH = ImageFont.truetype(os.path.join(F, 'Cinzel.ttf'), 44)
B = [  # (time of the still, span, style, what happens)
 ('0.0', '0.0 (first frame)', 'RICE ON BLACK STONE', 'The whole Purana is told in rice: white rice, turmeric akshata, red kumkum, on dark stone by one ghee lamp. Frame one: grains are still flying in, settling into Jagannath’s face.'),
 ('0.8', '0.6–1.0', 'HIS FACE, IN RICE', '“The Jagannath we offer…” The great round eyes ringed in kumkum, a gold crown, the smile. The viewer’s first thought is “that’s made of rice?”'),
 ('2.2', '1.0–2.5', '56 BOWLS', '“…fifty-six bhogas…” The face shrinks to the centre and its grains burst out into 56 bowls in a golden spiral: rings of akshata filled with rice and kumkum.'),
 ('5.38', '2.5–5.4', 'DOOR TO DOOR', '“…once wandered door to door, hungry.” The bowls empty in a breath; the grains rush into a row of doorways, the two brothers’ faces small before them. One by one the doors slam shut, each a rush of grains.'),
 ('6.0', '5.45–6.5', 'WHY?', 'Everything scatters to the edges. A few grains in the dark, and the camera leans in. Silence.'),
 ('8.6', '6.5–9.2', 'MANABASA', 'From every edge the rice pours back as a jhoti: a lotus mandala round the Mana heaped with gold paddy, kumkum dots, and “Manabasa Gurubara” written in gold grains.'),
 ('10.8', '9.2–11.2', 'HER STEPS', '“Lakshmi went to Shriya’s home—” The mandala becomes a path of Lakshmi’s footprints in gold, walking to a small thatched house.'),
 ('12.6', '11.2–13.4', 'THE AVOIDED DOOR', '“…a woman society called untouchable.” Everyone else’s white footprints swing wide around her door; Lakshmi’s go straight to it.'),
 ('14.2', '13.4–14.3', 'SHE SWEEPS', '“She swept her home clean…” A sweep wave (a broom made of motion) carries the grains into Shriya herself, bent over her broom, red bangles, dust flying.'),
 ('15.9', '14.3–16.1', 'THE INVITATION', '“…and invited Lakshmi in.” She becomes a lotus at her threshold, a lamp and white footprints leading in; the goddess’s gold steps fill them.'),
 ('17.6', '16.2–19.6', 'BALABHADRA', '“On her way back, Balabhadra stopped her— You come from that house?” His white face in rice, kumkum-ringed eyes; her golden steps halted at a line.'),
 ('20.8', '19.65–21.3', 'THE DOORS', '“You shall not enter the temple.” Gathered in with a slam: the temple’s great studded doors, shut.'),
 ('22.5', '21.4–22.6', 'HER HAND', '“Humiliated, Lakshmi spoke—” The doors burst into Lakshmi’s raised hand in gold, alta on the palm and fingertips, kumkum and akshata rays of anger.'),
 ('23.3', '22.6–24.6', 'TWELVE LAMPS', '“For twelve years…” Her rays become twelve lamps in an arc; one by one their flames fall away, leaving cold lamps.'),
 ('26.0', '24.6–26.5', 'A FISTFUL', '“…not even a fistful of rice.” A cupped hand of rice, and the rice running out of it in a thin stream.'),
 ('30.5', '26.5–32.4', 'THE LIT DOOR', '“At last the two brothers were fed by such a house, where no one would set foot.” A wind blows the stream into the row of doors, all shut, the brothers small before them; then one door fills with gold light, and we lean into it.'),
 ('34.0', '32.5–34.0', 'THE MEAL', '“From the first morsel…” The light bursts into a meal on a banana leaf: a heap of rice, dalma, saga.'),
 ('34.9', '34.0–35.4', 'HE KNEW', '“…Jagannath knew—” His face again, the eyes opening wide.'),
 ('37.0', '35.45–37.6', 'GOLDEN RICE', '“This cooking was Lakshmi’s.” Back to the meal, and the rice turns gold, grain by grain; her footprints rise from it.'),
 ('39.0', '37.6–40.2', 'THE DOORS OPEN', '“Lakshmi returned, on one condition—” The doors are open; her golden steps walk in.'),
 ('41.3', '40.2–43.2', 'NO CASTE', '“At Mahaprasad there will be no caste.” A ring of leaves round one pot, split by kumkum lines; a sweep erases the lines.'),
 ('45.3', '43.2–45.8', 'ANANDA BAZAR', '“Even today, at Srimandir’s Ananda Bazar…” The shikhara with its wheel and flag, and rows of devotees, a red gamuchha on each shoulder.'),
 ('48.2', '45.8–49.0', 'EVERY HAND', '“…devotees of every caste eat abadha together.” Eight hands reach in to one pot from every side, each with different bangles: kumkum, akshata, white.'),
 ('53.6', '49.0–55.8', 'LAKSHMI PURANA → LOOP', '“The lesson our society still needs… our Lakshmi Purana gave centuries ago.” Palm leaves, then “Lakshmi Purana” in rice and her red footprints. Then the grains gather into Jagannath’s face, the first frame again.'),
]
TW, TH, PAD, LAB = 330, 587, 22, 330
COLS = 12
def sheet(items, out, title, n0=0):
    rows = (len(items) + COLS - 1) // COLS; cols = min(COLS, len(items))
    Wd = cols * (TW + PAD) + PAD; Hd = 120 + rows * (TH + LAB + PAD) + PAD
    im = Image.new('RGB', (Wd, Hd), '#140d0a'); d = ImageDraw.Draw(im)
    d.text((PAD, 34), title, font=fH, fill='#efe2c6')
    for k, (ts, span, med, txt) in enumerate(items):
        x = PAD + (k % COLS) * (TW + PAD); y = 120 + (k // COLS) * (TH + LAB + PAD)
        im.paste(Image.open(os.path.join(D, f't_{ts}.jpg')).resize((TW, TH), Image.LANCZOS), (x, y))
        d.text((x, y + TH + 8), f'{k + 1 + n0:02d}  ·  {span} s', font=fT, fill='#e7b45a'); d.text((x, y + TH + 36), med, font=fT, fill='#b98f52')
        words, line, ly = txt.split(), '', y + TH + 70
        for w in words:
            if d.textlength(line + ' ' + w, font=fS) > TW and line: d.text((x, ly), line, font=fS, fill='#d9ccb4'); ly += 26; line = w
            else: line = (line + ' ' + w).strip()
        d.text((x, ly), line, font=fS, fill='#d9ccb4')
    im.save(out, quality=92); print(out, im.size)
sheet(B, OUT, 'MANABASA GURUBARA  ·  STORYBOARD v2  ·  TOLD IN RICE')
COLS = 3
sheet(B[:12], OUT.replace('.jpg', '_part1.jpg'), 'STORYBOARD v2  ·  1 / 2'); sheet(B[12:], OUT.replace('.jpg', '_part2.jpg'), 'STORYBOARD v2  ·  2 / 2', 12)
