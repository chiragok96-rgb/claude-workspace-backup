# Storyboard sheets: frames from the film itself, with time, line, picture and sound notes.
import textwrap
from PIL import Image, ImageDraw, ImageFont
R = '/home/user/bali-yatra/'
F = lambda n, s: ImageFont.truetype(R + 'fonts/' + n, s)
fT, fH, fB, fI, fO = F('Cinzel.ttf', 44), F('Cinzel.ttf', 22), F('CormorantGaramond.ttf', 23), F('CormorantGaramond-Italic.ttf', 23), F('NotoSerifOriya.ttf', 20)
B = [
 ('0.5', '0:00', 'THE FAIR\'S SAND · 3D', 'The sand beneath your feet…', 'Low dolly over a trail of footprints in the fair\'s sand; Ramdoli and stalls glow as bokeh behind.', 'Far crowd murmur, sand crunch, one bansuri breath.'),
 ('4.6', '0:04', 'CRANE UP', '…not where the name comes from.', 'The camera rises to look straight down on one footprint. A gust smooths all the other prints away.', 'Wind gust; murmur thins.'),
 ('6.1', '0:06', 'TRANSITION · THE LIGHT FLIPS', 'It comes from an island —', 'Same sand, same footprint: the fair\'s lights die and a lightbox glows from beneath. The print (thin sand) lights up first.', 'A low swell; tanpura drone enters.'),
 ('7.6', '0:07', 'SAND ART · LIGHTBOX', 'It comes from an island —', 'The glowing footprint flows into the true coastline of Bali; the big toe drifts off to become Nusa Penida.', 'Grains trickling under the voice.'),
 ('9.6', '0:09', 'TITLE', 'Bali, Indonesia.', 'BALI · INDONESIA. Lombok and Java\'s tip appear around it.', 'Soft metallophone note (a hint of gamelan).'),
 ('13.0', '0:13', 'PULL BACK 4,000 KM', 'Four thousand km away.', 'A fingertip drags the sea lane from Bali back to Odisha as we rise; the km counter runs to 4,000+.', 'A sand-drag foley that follows the line.'),
 ('16', '0:16', 'THE SADHABAS', 'A thousand years ago…', 'A sand boita (peacock prow, two sails) appears at Kalinga\'s coast; a bright fingertip retraces the voyage.', 'Bansuri melody begins; waves far off.'),
 ('20.8', '0:20', 'THE ISLANDS', 'Bali, Java, Sumatra.', 'Each island brightens as it is named, labels pinned to the sand.', 'Three bell strokes, one per island.'),
 ('22.3', '0:22', 'NO ENGINE', 'No engine.', 'A gear is drawn in the sand — and swept away by a palm.', 'Music drops out. A dry sweep.'),
 ('23.4', '0:23', 'NO GPS', 'No GPS.', 'A map pin is drawn — and swept away.', 'Second sweep. Silence.'),
 ('25.2', '0:25', 'ONLY THE WIND', 'Only the wind.', 'The whole Bay is raked with streamlines: the wind, blowing onshore. The boita waits, sails slack.', 'Wind swells in; drone returns.'),
 ('28.8', '0:28', 'KARTIKA · THE WIND TURNS', 'The wind turns, and carries the boita out.', 'The rake lines swing round to blow out to sea; the sails fill and the boita leaves along the lane.', 'Sail-fill whump; music lifts.'),
 ('32.5', '0:32', 'THEY WAITED', 'They did not fight the wind…', 'The wind lines fade. A moon is cleared in the sand, waxing from crescent toward full.', 'Held flute note; slow drum heartbeat.'),
 ('35.5', '0:35', 'TRANSITION · INTO THE MOON', '…they waited for it.', 'Full moon: a disc of pure light in the sand. We push into it until it burns white.', 'Rising swell into a conch (shankha).'),
 ('37.6', '0:37', 'KARTIKA NIGHT · 3D', 'Kartika Purnima…', 'Out of the white: the real full moon. The lens widens and tilts down to the sea.', 'Conch decays into open sea.'),
 ('38.6', '0:38', 'THE DEPARTURE', '…the day they sailed.', 'The boita sails into the moon\'s path, sails lit by its deck lamp.', 'Waves, rigging creak, full theme.'),
 ('41.0', '0:41', 'TITLE', 'Bali Jatra.', 'BALI JATRA / ବାଲିଯାତ୍ରା in the sky above the ship.', 'Theme peaks; mardala accent.'),
 ('44.0', '0:44', 'THE SHIP RECEDES', 'Today, on the same night…', 'The boita shrinks toward the horizon; the sea begins to calm into a river.', 'Theme softens; water lapping.'),
 ('46.2', '0:46', 'TRANSITION · SHIP TO LAMP-BOAT', 'little boats of light set out…', 'Where the ship was, a banana-stem boat with a diya and a betel leaf floats up; hundreds light outward behind it.', 'Bells and soft voices on the bank.'),
 ('50.8', '0:50', 'CUTTACK', 'On the banks of the Mahanadi.', 'Crane up from the river of lamps; the fair glows on the bank, Ramdoli turning.', 'Fair music rises from a distance.'),
 ('53.8', '0:53', 'INTO THE FAIR', '65 lakh people came last year.', 'Down a lane of festoons toward the Ramdoli; the crowd is points of light flowing; the counter runs to 65,00,000.', 'Crowd swells, festival drums.'),
 ('55.6', '0:55', 'THE FOOD · MACRO GLIDE', 'Doli, dahibara, thunka puri…', 'A glide along the counters, the fair in bokeh behind: Dahibara-Aludum, Thunka Puri (sold only at this fair), Gupchup, Kulfi, toys, with Odia labels.', 'Sizzle, ladle on brass, vendor calls.'),
 ('59.4', '0:59', 'THE RAMDOLI & THE MOON', 'This year, for the second year running,', 'Look up: the Ramdoli turns beside the full moon.', 'Fair noise falls away; one gamelan bell.'),
 ('60.3', '1:00', 'TRANSITION · INTO THE MOON', '', 'Push into the moon until it burns white —', 'Swell.'),
 ('62.6', '1:02', 'SAND ART · LIGHTBOX', 'Indonesia, partner country.', '— and out of it the sand moon on the lightbox; pull back to the map. INDONESIA · partner country.', 'Gamelan metallophones enter and harmonise with the flute.'),
 ('64.8', '1:04', 'THE LANE', 'The island our boitas sailed to…', 'The lane glows again from Odisha to Bali.', 'Flute and gamelan in dialogue.'),
 ('66.8', '1:06', 'THE ISLAND SAILS', '…now comes to Cuttack.', 'Bali itself lifts out of the map and sails up the old lane, toward Cuttack.', 'Both musics together, rising.'),
 ('68.9', '1:08', 'ARRIVAL', 'This time, at the fair…', 'The island settles off Odisha and fills the frame; the map dissolves.', 'Music resolves to the drone.'),
 ('70.2', '1:10', 'TRANSITION · LIGHT FLIPS BACK', '…the sand beneath your feet…', 'The lightbox dims, the fair\'s lights return: Bali\'s outline becomes a footprint in the fair\'s sand.', 'Crowd murmur returns.'),
 ('73.0', '1:13', 'LOOP', '…remember the Bali across the sea.', 'Back down to the low dolly of the opening. The last frame is the first frame: the reel loops seamlessly.', 'One bansuri breath, as at the start.'),
]
TW, TH, PAD, NOTE = 400, 711, 22, 300
def sheet(items, name, title, sub):
    cols = 5; rows = (len(items) + cols - 1) // cols
    W = cols * (TW + PAD) + PAD; H = 150 + rows * (TH + NOTE + PAD)
    im = Image.new('RGB', (W, H), (14, 10, 8)); d = ImageDraw.Draw(im)
    d.text((PAD, 30), title, font=fT, fill=(250, 236, 210)); d.text((PAD, 92), sub, font=fI, fill=(200, 180, 150))
    for i, (t, tc, tag, vo, pic, snd) in enumerate(items):
        x = PAD + (i % cols) * (TW + PAD); y = 150 + (i // cols) * (TH + NOTE + PAD)
        fr = Image.open(R + 'out/sb/f_%s.jpg' % t).resize((TW, TH), Image.LANCZOS); im.paste(fr, (x, y))
        tr = 'TRANSITION' in tag or 'LOOP' in tag
        d.rectangle([x, y + TH, x + TW, y + TH + NOTE - 6], fill=(40, 22, 12) if tr else (26, 20, 16))
        d.text((x + 12, y + TH + 10), tc + '  ·  ' + tag, font=fH, fill=(255, 196, 120) if tr else (240, 214, 170))
        yy = y + TH + 44
        if vo:
            for ln in textwrap.wrap('“' + vo + '”', 36): d.text((x + 12, yy), ln, font=fI, fill=(255, 240, 215)); yy += 26
        yy += 6
        for ln in textwrap.wrap(pic, 39): d.text((x + 12, yy), ln, font=fB, fill=(225, 210, 190)); yy += 25
        yy += 6
        for ln in textwrap.wrap('Sound: ' + snd, 39): d.text((x + 12, yy), ln, font=fI, fill=(170, 200, 210)); yy += 25
    im.save(R + name, quality=90); print(name, im.size)
sheet(B[:10], 'STORYBOARD_1.jpg', 'BALI JATRA  ·  STORYBOARD  1/3', 'One handful of sand, lit two ways: the fair at night (3D) → the lightbox (sand art). Frames rendered from the film itself.')
sheet(B[10:20], 'STORYBOARD_2.jpg', 'BALI JATRA  ·  STORYBOARD  2/3', 'The wind, the moon, and the Kartika night (3D): the moon is the hinge between the two worlds.')
sheet(B[20:], 'STORYBOARD_3.jpg', 'BALI JATRA  ·  STORYBOARD  3/3', 'The fair today, back through the moon, the island sails to Cuttack, and the light flips back: the end is the beginning.')
