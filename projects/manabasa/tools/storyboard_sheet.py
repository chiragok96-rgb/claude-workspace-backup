# Lay the storyboard frames out as one labelled sheet (and a two-part version for the phone).
import sys, os
from PIL import Image, ImageDraw, ImageFont
D = sys.argv[1]; OUT = sys.argv[2]
F = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'fonts')
fT = ImageFont.truetype(os.path.join(F, 'CormorantGaramond.ttf'), 25); fT.set_variation_by_axes([600])
fS = ImageFont.truetype(os.path.join(F, 'CormorantGaramond-Italic.ttf'), 23); fS.set_variation_by_axes([500])
fH = ImageFont.truetype(os.path.join(F, 'Cinzel.ttf'), 44)
B = [  # (time of the still, span, style, what happens)
 ('0.0', '0.0 (first frame)', 'CHHAPAN BHOGA', 'From above, in lamplight: bell-metal and clay bowls already blooming in a golden spiral on banana leaves around a ghee lamp. Shallow focus, steam.'),
 ('1.6', '0.1–2.5', '56 BOWLS BLOOM', '“The Jagannath we offer fifty-six bhogas…” All 56 bowls bloom in, one after another on the words: rice, dalma, khiri, saga, rasabali, khaja, pitha…'),
 ('2.9', '2.5–3.3', 'EMPTY → THE LAMP', 'In a breath every bowl empties, from the outside in. The camera falls into the lamp’s flame; its light flares…'),
 ('4.3', '3.1–5.5', 'PURI · SHUT DOORS', '“…once wandered door to door, hungry.” …and the flame is a low sun on a limewashed wall in old Puri. Along it glide two long shadows: the round-headed forms of Jagannath and Balabhadra. Each door shuts as their shadows reach it. Every step has a jhoti for Lakshmi.'),
 ('6.0', '5.5–6.5', 'ONE GRAIN', '“Why?” Silence. A single grain of rice falls through the sunlight, slowly; the camera tilts down with it to the dust.'),
 ('7.9', '6.5–9.2', 'JHOTI · RICE PASTE', 'The grain lands; its ripple opens a red-oxide floor where white rice-paste jhoti draws itself: a lotus mandala around the Mana (the paddy measure, heaped with paddy and marigolds). In gold: Margashira, Manabasa Gurubara.'),
 ('10.2', '9.2–11.2', 'LAKSHMI’S STEPS', '“Lakshmi went to Shriya’s home—” Her golden footprints walk out of the mandala; the camera follows them off the red floor and onto the mud of the lane.'),
 ('12.3', '11.2–13.4', 'THE AVOIDED DOOR', '“…a woman society called untouchable.” The lane from above: everyone else’s footprints bend in a wide arc around one doorstep. Lakshmi’s go straight to it.'),
 ('14.8', '13.4–16.0', 'BROOM AND HAND', '“She swept her home clean and invited Lakshmi in.” A broom sweeps across (the wipe); her hand, with glass bangles, draws a lotus and little footprints leading in, and lights a lamp. Lakshmi’s golden steps fill the footprints she drew.'),
 ('17.6', '16.2–19.5', 'TEMPLE AT NIGHT', '“On her way back, Balabhadra stopped her—” Lamplight and darkness. Her golden steps halt before the sanctum door; above it, Balabhadra’s white face, crowned with flowers, lit from below. “You come from that house?” His eyes narrow.'),
 ('20.4', '19.6–21.3', 'THE DOORS SLAM', '“You shall not enter the temple.” The great studded doors swing shut on the words. A boom; a flash of dust in the lamplight.'),
 ('22.6', '21.5–23.3', 'HER HAND, RAISED', '“Humiliated, Lakshmi spoke—” A woman’s hand rises out of the dark, rimmed in gold, shankha-pola at the wrist, a halo of fire flaring around it. Behind it, a row of twelve temple lamps.'),
 ('24.2', '23.4–24.7', 'TWELVE LAMPS', '“For twelve years…” The twelve lamps go out one by one, each leaving a thread of smoke.'),
 ('25.6', '24.8–26.6', 'A FISTFUL OF NOTHING', '“…not even a fistful of rice.” A handful of rice spills through the dark and scatters on a hot wind into dust…'),
 ('29.0', '26.7–30.4', 'THE LANE AT DUSK', '“At last, the two brothers were fed by such a house…” …the dust settles on the same lane at dusk, every door shut, the two shadows slower now. Far along, one door glows.'),
 ('31.0', '30.4–32.9', 'THE ONE LIT DOOR', '“…where no one would set foot.” The shadows reach the only open door, lamplit from within; we push into its light.'),
 ('34.6', '32.8–35.4', 'THE FIRST MORSEL', '“From the first morsel, Jagannath knew—” A meal on a banana leaf from above, steaming; then Jagannath’s face in lamplight, his great round eyes widening.'),
 ('36.6', '35.5–37.5', 'HER COOKING', '“…this cooking was Lakshmi’s.” The rice begins to glow gold, and out of its steam rise her footprints.'),
 ('38.9', '37.7–40.2', 'THE DOOR OPENS', '“Lakshmi returned, on one condition—” The temple doors swing open on warm light, and her golden steps walk in.'),
 ('41.6', '40.3–43.2', 'ONE RING OF LEAVES', '“At Mahaprasad, there will be no caste.” From above: banana leaves in a ring around one great kudua of Mahaprasad, divided by chalk lines. The lines break apart and dissolve.'),
 ('44.4', '43.3–45.8', 'ANANDA BAZAR', '“Even today, at Srimandir’s Ananda Bazar…” Dusk: the temple’s shikhara with the Nilachakra and the Patitapabana flag, rows of earthen pots of Mahaprasad, lamps, steam.'),
 ('47.6', '45.9–48.9', 'EVERY HAND', '“…devotees of every caste eat abadha together.” Back above the ring: hands reach in from every side to the one pot. Glass bangles, a sacred thread, a steel kada, a wristwatch, a red thread, every skin.'),
 ('50.6', '49.0–51.7', 'PALM-LEAF BOOK', '“The lesson our society still needs…” Lamp-lit palm leaves bound with red string. A stylus line engraves itself in Odia: “Mahaprasad khaibabele…”'),
 ('53.5', '51.8–55.8', 'PURANA → LOOP', '“…our Lakshmi Purana gave centuries ago.” “Jatibheda chalibani” is engraved; the leaf bears the title “Lakshmi Purana” and her footprints. The camera sinks to the lamp beside the book, which becomes the lamp at the centre of the 56 bowls: the film loops.'),
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
sheet(B, OUT, 'MANABASA GURUBARA  ·  STORYBOARD')
COLS = 3
sheet(B[:12], OUT.replace('.jpg', '_part1.jpg'), 'STORYBOARD  ·  1 / 2'); sheet(B[12:], OUT.replace('.jpg', '_part2.jpg'), 'STORYBOARD  ·  2 / 2', 12)
