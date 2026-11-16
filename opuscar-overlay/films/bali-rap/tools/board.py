import textwrap
from PIL import Image, ImageDraw, ImageFont
R = '/home/user/lemomo-ai/lemo-opuscar/films/bali-rap/'
F = lambda n, s: ImageFont.truetype('/home/user/radha-pada-darshan/fonts/' + n, s)
fT, fH, fB, fI = F('Cinzel.ttf', 40), F('Cinzel.ttf', 18), F('CormorantGaramond.ttf', 22), F('CormorantGaramond-Italic.ttf', 22)
B = [
 ('sb1', '0:00', 'L1 · NEON', 'Who says Cuttack sleeps at night?', 'A wet street at night. Only CUTTACK glows blue under a crescent moon; a sleepy neon Z Z Z. The big sign below is cold, unlit glass.', 'Opens on darkness = the question.'),
 ('sb2', '0:02', 'L2 · NEON', 'When Bali Jatra comes — who can sleep!', 'On the downbeat the camera whips right; BALIJATRA strikes on (flash–flicker–full), the Z Z Z dies, the stall lights and festoons come up. The street floods with colour.', 'Strike on the beat.'),
 ('sb3', '0:04', 'L3 · LOW-POLY', "The Mahanadi's sands — a riot of coloured stalls", 'The fair on the riverbed as a glowing miniature island in the Mahanadi; stalls pop up row by row on the 8th-notes (bouncy, Townscaper-style).', 'IN: tilt down into a puddle on the neon street; its reflection becomes the river.'),
 ('sb4', '0:08', 'L5 · LOW-POLY', 'Up on the Ramdoli, looking down —', 'Killa Maidan: the fort gate, the merry-go-round, the Ramdoli of bulbs. We ride a car up and tilt down. (L4 between: laughter as warm light rings pulsing across the maidan.)', 'One continuous camera through the island.'),
 ('sb5', '0:10', 'L6 · LOW-POLY', 'a river of light flows across the ground', 'From the top of the wheel: the lanes full of people and lamps flow like a second river beside the Mahanadi.', 'Continues from the ride.'),
 ('sb6', '0:12', 'L7 · STUDIO', 'Dahibara-aludum — a thali of thunka puri', 'Hero food in a dark studio, strip-lights sweeping: dahibara-aludum in a sal-leaf khali, then the thunka puri thali with chhena tarkari.', 'IN: we dive into a stall\'s glowing doorway; the glow becomes the strip light. (Food will match your reference photos.)'),
 ('sb7', '0:16', 'L9 · STUDIO to LOW-POLY', 'Lost my friend — then the phone rang', 'The phone buzzes: caller "Sanga". Its screen shows the fair from above with two dots. (L8 before: the wallet opens, the last coin spins and falls.)', 'OUT: the screen fills the frame and becomes the real fair; the two little people run to each other (L10), fireworks.'),
 ('sb8', '0:21', 'L11 · WATERCOLOUR', "A dawn of floating boats — Taapoi's song", 'Dawn on the Mahanadi, painted stroke by stroke: women float banana-stem boats with diyas; Taapoi sings on the ghat. Lyrics in ink, in the sky.', 'IN: the last firework\'s sparks fall and bloom into ink on wet paper.'),
 ('sb9', '0:23', 'L12 · WATERCOLOUR', 'Bali Jatra night — the past, alive', "The lamps' reflections paint a great boita rising out of the river: peacock prow, saffron sails.", 'The past appears out of today\'s ritual.'),
 ('sb10', '0:25', 'L13 · 3D MAP', 'Once the boitas sailed — to faraway Bali', 'The painted boita sails off the paper onto a night relief map (real terrain and sea depth); a low-poly boita follows the glowing lane through the Malacca Strait to Bali.', 'IN: paper texture lifts, the painted river becomes the lane.'),
 ('sb11', '0:29', 'L15 · 3D MAP', "Asia's biggest fair — Cuttack's pride", 'Pull back over the Bay of Bengal: a pillar of light rises from Cuttack. (L14 before: we dive into Cuttack and the fair dresses itself in light strings.)', 'OUT: the pillar of light becomes a neon tube.'),
 ('sb13', '0:31', 'L16 · NEON', "Bali Jatra! Bali Jatra! — Odisha's soul", 'Back on the neon street: BALIJATRA twice on the beat, then a pan to ODISHARA PRANA with a heart that beats with the kick. Blackout to loops to shot 1.', 'Loop: the signs switch off = the opening darkness.'),
]
TW, TH, PAD, NOTE = 400, 711, 22, 330
def sheet(items, name, title, sub):
    cols = 6; rows = (len(items) + cols - 1) // cols
    W = cols * (TW + PAD) + PAD; H = 150 + rows * (TH + NOTE + PAD)
    im = Image.new('RGB', (W, H), (12, 10, 14)); d = ImageDraw.Draw(im)
    d.text((PAD, 28), title, font=fT, fill=(250, 236, 210)); d.text((PAD, 88), sub, font=fI, fill=(200, 180, 150))
    for i, (f, tc, tag, en, pic, tr) in enumerate(items):
        x = PAD + (i % cols) * (TW + PAD); y = 150 + (i // cols) * (TH + NOTE + PAD)
        im.paste(Image.open(R + 'sb/' + f + '_0.jpg').resize((TW, TH), Image.LANCZOS), (x, y))
        d.rectangle([x, y + TH, x + TW, y + TH + NOTE - 6], fill=(26, 20, 24))
        d.text((x + 12, y + TH + 10), tc + '  ·  ' + tag, font=fH, fill=(255, 200, 140))
        yy = y + TH + 40
        for ln in textwrap.wrap('“' + en + '”', 38): d.text((x + 12, yy), ln, font=fI, fill=(255, 240, 215)); yy += 25
        yy += 6
        for ln in textwrap.wrap(pic, 42): d.text((x + 12, yy), ln, font=fB, fill=(225, 210, 190)); yy += 24
        yy += 6
        for ln in textwrap.wrap(tr, 42): d.text((x + 12, yy), ln, font=fI, fill=(150, 200, 220)); yy += 24
    im.save(R + name, quality=90); print(name, im.size)
sheet(B[:6], 'STORYBOARD_1.jpg', 'BALIJATRA RAP  ·  STORYBOARD 1/2', 'Light now (neon + a glossy low-poly fair island), the food as studio heroes. Every frame is rendered by the real style engines.')
sheet(B[6:], 'STORYBOARD_2.jpg', 'BALIJATRA RAP  ·  STORYBOARD 2/2', 'Brush then (watercolour dawn, Taapoi, the boita), the voyage on a real 3D map, and back to the neon chant.')
