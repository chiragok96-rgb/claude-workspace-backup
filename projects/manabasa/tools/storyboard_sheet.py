# Lay the storyboard frames out as one labelled sheet (and a two-part version for the phone).
import sys, os
from PIL import Image, ImageDraw, ImageFont
D = sys.argv[1]; OUT = sys.argv[2]
F = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'fonts')
fT = ImageFont.truetype(os.path.join(F, 'CormorantGaramond.ttf'), 25); fT.set_variation_by_axes([600])
fS = ImageFont.truetype(os.path.join(F, 'CormorantGaramond-Italic.ttf'), 23); fS.set_variation_by_axes([500])
fH = ImageFont.truetype(os.path.join(F, 'Cinzel.ttf'), 44)
B = [  # (time of the still, span, style, what happens)
 ('0.0', '0.0 (first frame)', 'THE SANCTUM', 'Lamplight in the dark: Jagannath, crowned with flowers, the aarti of five flames circling before him, smoke drifting. The camera is already gliding in.'),
 ('1.6', '0.1–2.7', '56 BHOGAS', '“The Jagannath we offer fifty-six bhogas…” As the words come, tiers of earthen kudua rise out of the dark on both sides and below him, steaming. The offering shown as the pots, never as drawn food.'),
 ('4.3', '2.7–5.5', 'PURI · SHUT DOORS', '“…once wandered door to door, hungry.” We push into an aarti flame; its flash becomes a low sun on an old Puri wall. The long shadows of Jagannath and Balabhadra glide along it, and each door shuts as they reach it.'),
 ('6.0', '5.5–6.5', 'ONE GRAIN', '“Why?” Silence. A single grain of rice falls through the light; the camera tilts down with it.'),
 ('7.9', '6.5–9.2', 'JHOTI', 'The grain lands, and its ripple opens a red-earth floor where a rice-paste jhoti draws itself round the Mana. In gold: Margashira, Manabasa Gurubara.'),
 ('10.2', '9.2–11.2', 'HER STEPS', '“Lakshmi went to Shriya’s home—” Lakshmi’s golden footprints walk out of the mandala onto the mud lane.'),
 ('12.3', '11.2–13.4', 'THE AVOIDED DOOR', '“…a woman society called untouchable.” Everyone else’s footprints bend wide around one doorstep. Lakshmi’s go straight to it.'),
 ('14.4', '13.4–15.0', 'SHRIYA', '“She swept her home clean…” Dawn at her mud house: Shriya, in a plain white sari with a red border, kneels at her swept step drawing jhoti, her lamp lit, her broom against the wall.'),
 ('15.6', '15.0–16.1', 'THE INVITATION', '“…and invited Lakshmi in.” A golden light comes across the step, and gold footprints walk onto the ones she drew.'),
 ('17.8', '16.2–19.6', 'THE TEMPLE AT NIGHT', '“On her way back, Balabhadra stopped her—” Lakshmi, crowned, in red and gold, before the temple door. Above it, Balabhadra’s white face in the lamplight. “You come from that house?” His eyes harden.'),
 ('20.5', '19.65–21.3', 'THE DOORS SLAM', '“You shall not enter the temple.” The studded doors swing shut in front of her. A boom; a breath of dust in the light.'),
 ('22.8', '21.4–23.4', 'HER CURSE', '“Humiliated, Lakshmi spoke—” She lifts her hand. A gold fire gathers round it, and her shadow rises huge on the temple wall.'),
 ('24.0', '23.4–24.7', 'TWELVE LAMPS', '“For twelve years…” The twelve lamps along the temple wall go out one by one, each leaving a thread of smoke. Lakshmi fades with them: the light leaves the temple.'),
 ('25.6', '24.7–26.6', 'A FISTFUL', '“…not even a fistful of rice.” In the dark, a handful of rice falls and scatters on a hot wind into dust…'),
 ('29.0', '26.7–30.4', 'THE LANE AT DUSK', '“At last, the two brothers were fed by such a house…” The same lane at dusk, every door shut, their shadows slower now. One door glows.'),
 ('31.0', '30.4–32.9', 'THE ONE LIT DOOR', '“…where no one would set foot.” Their shadows reach the only open door; we push into its light.'),
 ('34.0', '32.8–34.3', 'HER HEARTH', '“From the first morsel…” Inside: Lakshmi in disguise, in a plain ochre sari, kneels at a clay hearth, a pot of rice steaming in the firelight.'),
 ('34.8', '34.3–35.4', 'HE KNEW', '“…Jagannath knew—” His face in the lamplight, the great round eyes widening.'),
 ('36.8', '35.5–37.6', 'HER STEPS IN THE STEAM', '“This cooking was Lakshmi’s.” The steam turns gold, and her footprints rise out of it.'),
 ('38.9', '37.7–40.2', 'THE DOORS OPEN', '“Lakshmi returned, on one condition—” The temple doors open on warm light; her golden steps walk in.'),
 ('42.9', '40.3–43.2', 'NO CASTE', '“At Mahaprasad there will be no caste.” From above: footprints of every size kept apart by red lines round one earthen pot. The lines dissolve, and they all gather in one ring.'),
 ('46.0', '43.3–48.9', 'ANANDA BAZAR TODAY', '“Even today, at Srimandir’s Ananda Bazar, devotees of every caste eat abadha together.” The shikhara with its wheel and flag at dusk. A long row of devotees in silhouette, each different (a priest’s tuft, a farmer’s gamuchha, a woman’s pallu, a child, an old man’s cap), eating from leaves side by side as the camera tracks along them.'),
 ('50.6', '49.0–51.7', 'PALM-LEAF BOOK', '“The lesson our society still needs…” Lamp-lit palm leaves bound with red string; “Mahaprasad khaibabele…” engraves itself.'),
 ('53.5', '51.8–55.8', 'PURANA → LOOP', '“…our Lakshmi Purana gave centuries ago.” “Jatibheda chalibani” and “Lakshmi Purana” with her footprints. The lamp by the book becomes the aarti before Jagannath: the film loops.'),
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
sheet(B, OUT, 'MANABASA GURUBARA  ·  STORYBOARD v3')
COLS = 3
sheet(B[:12], OUT.replace('.jpg', '_part1.jpg'), 'STORYBOARD v3  ·  1 / 2'); sheet(B[12:], OUT.replace('.jpg', '_part2.jpg'), 'STORYBOARD v3  ·  2 / 2', 12)
