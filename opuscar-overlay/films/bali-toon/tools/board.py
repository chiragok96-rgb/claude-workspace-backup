import textwrap
from PIL import Image, ImageDraw, ImageFont
R = '/home/user/lemomo-ai/lemo-opuscar/films/bali-toon/'
F = lambda n, s: ImageFont.truetype('/home/user/radha-pada-darshan/fonts/' + n, s)
fT, fH, fB, fI = F('Cinzel.ttf', 40), F('Cinzel.ttf', 18), F('CormorantGaramond.ttf', 22), F('CormorantGaramond-Italic.ttf', 22)
B = [
 ('0:00', 'L1 · THE HOOK', 'Who says Cuttack sleeps at night?', 'Cuttack asleep: the Moon snores in a nightcap, Bulu snores in bed. The word SHUE (sleeps) lies down on its own pillow; the "?" yawns.', 'IN (loop): the last frame of the reel is this bed.', 'Beat: soft hum, Zzz bubbles pop on the hi-hats.'),
 ('0:02', 'L2 · BOOM', 'When Bali Jatra comes, who can sleep!', 'The fair\'s first firework: the Moon\'s and Bulu\'s eyes POP like Jagannath\'s. The blanket flies. The word NIDA (sleep) SHATTERS like glass.', 'OUT: Bulu leaps out of the window and the camera falls with him.', 'Beat: the drop. Glass-smash + crowd roar.'),
 ('0:04', 'L3 · MAHANADI PATHA', "The Mahanadi's sands, colourful stalls", 'He lands on the sandy riverbed and runs. Every footstep makes a stall spring up out of the sand; RANGINA is spelt in the stall colours, letter by letter.', 'IN: one continuous fall from the window to the sand.', 'Beat: a stall pops on every 8th note.'),
 ('0:06', 'L4 · GUNJE', "Cuttacki laughter rings across the maidan", 'Killa Maidan under the fort gate: the crowd laughs; the laughter ripples across the ground like rings in water. GUNJE echoes out in fading copies; MAIDANA lies flat on the grass.', 'IN: Bulu runs through the gate into the crowd.', 'Beat: a laugh sample echoes in time.'),
 ('0:08', 'L5 · CLIMB', 'Up on the Ramdoli, looking down', 'Camera starts at the foot of the wheel and climbs with Bulu\'s car to the top; he grips the bar, eyes pop, wind lines. The letters of RAMDOLI ride the rim; TALAKU CHAHEN drops down the screen.', 'IN: the ripple runs up the wheel\'s spokes.', 'Beat: a rising riser, a gulp at the top.'),
 ('0:10', 'L6 · RIVER OF LIGHT', 'A river of light flows across the ground', 'His POV straight down, his feet dangling: the fair\'s lanes flow with lights like a second river beside the Mahanadi and its floating lamps. BAHE ripples like water.', 'Continues from the top of the wheel (tilt down).', 'Beat: shimmering pad.'),
 ('0:12', 'L7 · FOOD', 'Dahibara-aludum, a thali of thunka puri', 'A halo of food spins behind Bulu\'s head; heart-eyes. Dahibara-aludum and the thunka puri thali swap on the beats and fly into his mouth. The words are dressed as the food (curd-white, puffed gold).', 'IN: zoom into a stall bulb; it becomes the halo.', 'Beat: munch/crunch on the snare.'),
 ('0:14', 'L8 · POCKET', 'Ate and ate, forgot: the pocket went empty!', 'Food coma: ballooned belly, spiral eyes, stars circling, drool. He turns out his pocket: nothing. A moth flies out. KHALI falls out of the pocket letter by letter.', 'IN: the belly inflates out of the last bite.', 'Beat: a sad trombone "wah-wah".'),
]
B2 = [
 ('0:16', 'L9 · LOST', 'Lost my friend, then the phone rang', 'The crowd swirls; Tuku\'s place is an empty dotted outline with a "?". HAJILA is drawn dotted (missing). The phone BUZZES in his hand: "Sanga" calling. BAJILA vibrates in two colours.', 'IN: the pocket lining flaps aside to show Tuku gone.', 'Beat: phone buzz on the beat.'),
 ('0:18', 'L10 · FOUND', 'Found again, and the fair came alive!', 'Tuku bursts OUT of the phone screen into Bulu\'s arms; fireworks, confetti. MILI and GALA, two halves of the word, slide together and hug. JAMILA bounces.', 'OUT: firework smoke drifts and turns pink: dawn.', 'Beat: a crowd cheer; the hook\'s energy peak.'),
 ('0:20', 'L11 · DAWN', "A dawn of floating boats: Taapoi's song", 'Morning on the ghat: women and children float banana-stem boats with diyas; Taapoi sings, music notes over the water; Bulu and Tuku sleepy-eyed. The words float and bob like little boats.', 'IN: smoke to dawn mist, the colour of the whole world turning.', 'Beat: the song breathes; water lapping.'),
 ('0:23', 'L12 · THE PAST', 'Bali Jatra night: the past, alive', 'Night returns. Behind Bulu\'s little lamp-boat a great golden swan boita rises out of the river, the ghost of the sadhabas on deck. JIANTA ATITA glows like a memory.', 'IN: the lamp-boat floats out; its light grows into the boita.', 'Beat: a deep gong.'),
 ('0:25', 'L13 · VOYAGE', 'Once the boitas sailed to faraway Bali', 'The swan boita races anime-fast across a 2.5D map, speed lines and a wake, from Cuttack to Bali (production: a 3D ship sailing this map). DURA BALI DESHA trails behind it like its wake.', 'IN: the camera rises above the boita; the river flattens into the map.', 'Beat: a whoosh on the bar.'),
 ('0:27', 'L14 · DRESSED UP', 'Today Cuttack wears bright new colours', 'Back to Cuttack: the buildings themselves grin and put on garlands of light-bulbs and bunting; a temple spire wears a crown; Bulu in his best kurta. RANGINA NUA BESHA is strung with bulbs.', 'IN: the map whips back north and dives into Cuttack.', 'Beat: bells and a brass hit.'),
 ('0:29', 'L15 · PRIDE', "Asia's biggest fair, Cuttack's pride", 'Pull back to the map of Asia: a golden crown drops onto Cuttack; Bulu and Tuku flex on top of it. BADA (big) is GIANT; SHAAN wears the crown.', 'IN: one long pull-back from the street to the continent.', 'Beat: a stadium "hey!".'),
 ('0:31', 'L16 · THE SOUL', "Bali Jatra! Bali Jatra!: Odisha's soul", 'Everyone dances: Bulu, Tuku, Taapoi, the crowd, even the Moon. The Ramdoli becomes a giant heart of bulbs that beats with the kick; PRANA sits in a beating heart.', 'OUT (loop): the lights go out, the Moon puts on its nightcap, Bulu falls asleep: back to frame 1.', 'Beat: the final chant; the heart beats on the kick.'),
]
TW, TH, PAD, NOTE = 330, 587, 20, 400
def sheet(items, files, name, title, sub):
    cols = 4; rows = 2; W = cols * (TW + PAD) + PAD; H = 150 + rows * (TH + NOTE + PAD)
    im = Image.new('RGB', (W, H), (16, 12, 30)); d = ImageDraw.Draw(im)
    d.text((PAD, 28), title, font=fT, fill=(255, 230, 160)); d.text((PAD, 88), sub, font=fI, fill=(210, 190, 230))
    for i, ((tc, tag, en, pic, tr, beat), f) in enumerate(zip(items, files)):
        x = PAD + (i % cols) * (TW + PAD); y = 150 + (i // cols) * (TH + NOTE + PAD)
        im.paste(Image.open(R + 'sb/' + f).resize((TW, TH), Image.LANCZOS), (x, y))
        d.rectangle([x, y + TH, x + TW, y + TH + NOTE - 6], fill=(30, 24, 52))
        d.text((x + 10, y + TH + 8), tc + '  ·  ' + tag, font=fH, fill=(255, 210, 90)); yy = y + TH + 36
        for ln in textwrap.wrap('“' + en + '”', 34): d.text((x + 10, yy), ln, font=fI, fill=(255, 245, 225)); yy += 24
        yy += 5
        for ln in textwrap.wrap(pic, 33): d.text((x + 10, yy), ln, font=fB, fill=(230, 220, 240)); yy += 23
        yy += 5
        for ln in textwrap.wrap(tr, 34): d.text((x + 10, yy), ln, font=fI, fill=(140, 210, 230)); yy += 22
        for ln in textwrap.wrap(beat, 34): d.text((x + 10, yy), ln, font=fI, fill=(255, 160, 190)); yy += 22
    im.save(R + name, quality=90); print(name, im.size)
sheet(B, ['s%d_0.jpg' % i for i in range(8)], 'STORYBOARD_1.jpg', 'BALI JATRA  ·  "LIVING LYRICS"  ·  1/2', 'Bulu & Tuku\'s night at the fair. Every Odia word acts out its meaning. One continuous journey, bed to bed, so the reel loops.')
sheet(B2, ['s%d_0.jpg' % i for i in range(8, 16)], 'STORYBOARD_2.jpg', 'BALI JATRA  ·  "LIVING LYRICS"  ·  2/2', 'Lost and found, dawn and Taapoi, the swan boita\'s voyage, Cuttack dressed up, and the beating heart of the fair.')
