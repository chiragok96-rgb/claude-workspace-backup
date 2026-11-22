# Lay the storyboard frames out as one labelled sheet (and a two-part version for the phone).
import sys, os
from PIL import Image, ImageDraw, ImageFont
D = sys.argv[1]; OUT = sys.argv[2]
F = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'fonts')
fT = ImageFont.truetype(os.path.join(F, 'CormorantGaramond.ttf'), 25); fT.set_variation_by_axes([600])
fS = ImageFont.truetype(os.path.join(F, 'CormorantGaramond-Italic.ttf'), 23); fS.set_variation_by_axes([500])
fH = ImageFont.truetype(os.path.join(F, 'Cinzel.ttf'), 44)
B = [  # (time of the still, span, style, what happens)
 ('0.0', '0.0 (first frame)', 'DAWN RIVER · LOW GLIDE', 'No macro. We open already moving: low over the river, out-of-focus lamps drifting past the lens, four banana-bark dangas ahead, the temple across the water. A real flame (white core, gold body, blue root), clay diyas, handmade-paper sails.'),
 ('2.4', '0.0–3.7 (song)', 'SYLLABLES IGNITE', 'Each sail lights up as its syllable is sung, Aa… Ka… Ma… Bai: the alta-red letter burns gold and the paper glows like a lantern from the diya beneath it.'),
 ('4.6', '3.8–5.2', 'CHILDHOOD · FAR GHAT', '“We’ve sung it since childhood…” The glide drifts toward the far ghat: children in silhouette against the gold mist, one holding out a lamp, one setting hers on the water.'),
 ('7.0', '5.3–8.8', 'RIVER → SKY', '“…but these four letters…” The river falls away below; the four syllables lift off their sails and rise one after another into a warm night sky.'),
 ('11.8', '9.4–13.0', 'FOUR MOONS', 'Each syllable becomes a full moon (a lunar month, a Purnima). On each spoken month its moon names itself: Ashadha, Kartika, Magha, Baisakha.'),
 ('15.2', '13.5–17.0', 'MOONLIT SEA · BOITA', '“The tally of the Sadhabas’ voyages.” The sea rises into frame; a great boita sails beneath the moons while smaller moons rise and set: a voyage counted in moons.'),
 ('20.4', '17.0–21.3', 'THE GHAT · HER', '“Who kept the tally?” The camera sweeps along the shore to the ghat: a mother in profile, red saree, gold border, pallu over her head, moonlight on her face, watching the sails go.'),
 ('23.0', '21.6–24.4', 'HAND AGAINST THE MOON', 'Her hand, with shankha and pola, raised against a giant moon. The moon wanes and waxes behind it, and with each cycle one finger folds: a month counted.'),
 ('25.6', '24.8–26.1', 'MOON → HEADLIGHT', '“Today there is no boita.” The hand lowers, the moon sinks to the horizon and flares into a train’s headlight (a light flash that builds and decays).'),
 ('26.9', '26.2–27.7', 'TRAIN WINDOW · WL 47', '“A waiting-list ticket.” Through the barred window of a night train, a young man’s phone lights his face: PNR status WL 47.'),
 ('28.3', '27.8–29.2', 'NIGHT TRAIN · BOARDS', 'Pull back: the train on the bridge, girders streaking. Each coach is wider than the frame, so one complete bilingual board at a time, on each spoken city: “from Odisha”, Bengaluru…'),
 ('29.9', '29.2–30.6', 'NIGHT TRAIN · BOARDS', '…Pune… Hyderabad (Odia name large, English below; no Mumbai, no origin city). One lit window grows until its light fills the frame.'),
 ('32.5', '30.9–35.0', 'HOME · NIGHT', 'That light becomes her window. A lamp-lit room; the same mother, now in profile at the barred window, the calendar on the wall. “Not months, but festivals.”'),
 ('36.5', '35.3–39.4', 'HOME · FESTIVALS', 'Outside, Dussehra’s lights; we lean to the calendar and her red pen crosses the date out. The page turns: Diwali diyas and fireworks outside, crossed out too.'),
 ('40.6', '39.6–41.2', 'HOME · MONSOON · PHONE', 'She lifts the phone to her ear, its light on her face. Outside, the monsoon arrives and an empty Raja swing sways under the tree.'),
 ('42.8', '41.2–43.4', 'HOME · RAJA', '“You’ll come for Raja, won’t you?” The page turns to June; her pen circles the Raja dates, hopefully.'),
 ('44.1', '43.4–44.6', 'WINDOW → DAWN', 'Dawn fills the window and we push through it. The temple seen in the window lands exactly where the temple of the next shot stands, so the room dissolves into the river with no cut.'),
 ('45.5', '44.6–47.3', 'DAWN · WATER’S EDGE', 'The climax, low and close: mother and daughter kneel on the last step in profile, her arm around the girl; the girl holds the danga. The sun rises behind the shikhara. The sail reads Aa: the song’s first syllable, and in Odia, “come”.'),
 ('48.4', '47.3–49.0', 'THE PRAYER', '“It’s a prayer to come home.” The girl sets it on the water and lets go; it drifts toward the rising sun, its flame lighting their faces.'),
 ('51.6', '49.1–53.6', 'MAP · HOW FAR', '“And you? How far from home?” The sun’s glow flares and resolves into India at night: gold threads run home to Odisha from every city, with Odia names and kilometres. Then back to the river, and the film loops.'),
]
TW, TH, PAD, LAB = 330, 587, 22, 300
COLS = 10
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
sheet(B, OUT, 'AA KA MA BAI  ·  BOITA BANDANA  ·  STORYBOARD v3')
COLS = 3
sheet(B[:10], OUT.replace('.jpg', '_part1.jpg'), 'STORYBOARD v3  ·  1 / 2'); sheet(B[10:], OUT.replace('.jpg', '_part2.jpg'), 'STORYBOARD v3  ·  2 / 2', 10)
