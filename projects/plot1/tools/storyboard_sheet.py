# Lay the storyboard frames out as labelled sheets: the full board, and three phone-sized parts (3 x 3).
import sys, os
from PIL import Image, ImageDraw, ImageFont
D = sys.argv[1]; OUT = sys.argv[2]
F = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'fonts')
def cg(sz, w, it=False):
    f = ImageFont.truetype(os.path.join(F, 'CormorantGaramond-Italic.ttf' if it else 'CormorantGaramond.ttf'), sz); f.set_variation_by_axes([w]); return f
fT, fS, fM = cg(25, 700), cg(23, 500, True), cg(22, 600)
fO = ImageFont.truetype(os.path.join(F, 'NotoSerifOriya.ttf'), 21, layout_engine=ImageFont.Layout.RAQM); fO.set_variation_by_axes([600])
fH = ImageFont.truetype(os.path.join(F, 'Cinzel.ttf'), 40); fH2 = cg(26, 500, True)
B = [  # (still time, span, title, Odia line, what happens)
 ('0.0', '0.0', 'HOOK · THE MODEL', '', 'A warm-white architectural model of an Odisha neighbourhood on a dark plinth, every plot faintly lit by a projector. The camera is already diving in.'),
 ('1.3', '0.1–2.7', '₹ 20 LAKH', 'କୋଡ଼ିଏ ଲକ୍ଷ ଟଙ୍କାରେ Plot କିଣିଲେ।', 'The other plots give their light back; only ours keeps it, in gold. The buyer stands on it. The price rolls up to ₹20,00,000.'),
 ('4.2', '2.7–4.9', 'THREE MONTHS', 'ହେଲେ, ତିନି ମାସ ପରେ,', 'The sun runs one full turn round the model and every shadow sweeps with it. The counter rolls to 90 days.'),
 ('6.4', '4.8–7.4', 'THE GATE', 'Plot କୁ ଯିବା ରାସ୍ତାରେ Gate ଲାଗିଗଲା।', 'The camera cranes over the plot to look down the lane; a path of light runs to the road. On “Gate” two pillars rise and the leaves slam shut (a clang, a small shake). Vermilion light falls on it; the path breaks.'),
 ('8.9', '7.5–9.2', 'THE NEIGHBOUR', 'ପାଖ ଜମି ମାଲିକ କହିଲେ—', 'The camera orbits round the gate to the other side: a pool of light on the neighbour standing behind it.'),
 ('10.2', '9.2–10.8', 'HIS CLAIM', '“ଏ ରାସ୍ତା ମୋ ଜମି।”', 'On his words, vermilion light floods out from his house over his land, and across the lane.'),
 ('11.8', '11.0–12.5', 'HE WASN’T WRONG', 'ଆଉ ସେ ଭୁଲ୍ କହୁନଥିଲେ।', 'The flood crisps into survey lines: the lane is a plot of its own (341), hatched and pinned “private”.'),
 ('14.2', '12.7–14.7', 'LIGHTS OUT', 'କାରଣ ଆଖିକୁ ଦିଶୁଥିବା Road,', 'The house lights cut. In the dark, only the record is projected: every boundary, every plot number. The road the eye sees is a dashed white outline.'),
 ('15.8', '14.7–16.7', 'NOT A PUBLIC ROAD', 'ସବୁବେଳେ ସରକାରୀ Road ନୁହେଁ।', 'The dashed road breaks and the record shows through: the lane is private (vermilion), only the main road is public (gold). The camera cranes to top-down.'),
 ('17.4', '16.6–17.9', 'TO THE RECORDS', '', 'Still looking straight down, the camera glides off the model to the light table beside the plinth; its light flickers on under the papers.'),
 ('18.6', '17.8–19.4', 'BEFORE THE ADVANCE', 'Advance ପୂର୍ବରୁ,', 'The Bhulekh sheet, two pattas, the old deeds and an advance cheque. A brass weight is set down on the cheque: hold the money.'),
 ('20.5', '19.0–20.9', 'BHULEKH MAP', 'Bhulekh Map ରେ ରାସ୍ତାର Plot Number', 'Push into the map sheet (the same plan as the model). Gold rings are drawn round the lane’s number (341) and the road’s (1024).'),
 ('21.6', '20.9–22.8', 'THE PATTA', 'ବାହାର କରି ପଟ୍ଟା ଦେଖନ୍ତୁ।', 'Both numbers lift off the map and fly to their own pattas (records of rights). A loupe comes down.'),
 ('23.7', '23.0–26.7', 'ODISHA SARKAR', 'ସେଠି “ଓଡ଼ିଶା ସରକାର” କିମ୍ବା “କିସମ ରାସ୍ତା” ଲେଖାଥିଲେ—', 'Inside the loupe, on the road’s patta: owner “Odisha Sarkar”, then kisam “Rasta”, each underlined in gold on its word.'),
 ('27.2', '26.9–28.5', 'NO TENSION', 'ବଢ଼ିଆ, କିଛି tension ନାହିଁ।', 'A gold tick is drawn beside it. Calm.'),
 ('31.6', '28.8–31.9', 'BEWARE', 'କିନ୍ତୁ କୌଣସି ବ୍ୟକ୍ତିଙ୍କ ନାମ ଥିଲେ— ସାବଧାନ୍!', 'The loupe slides to the lane’s patta: a person’s name, underlined in red. On “sabadhan” it is ringed, a red “Sabadhan” stamp lands, and the loupe’s rim flashes red.'),
 ('35.0', '32.3–35.5', 'THE OLD DEED', 'Sale Deed ଓ ପୁରୁଣା Documents ରେ Right of Way', 'The camera glides to the 1998 sale deed, older papers fanned beneath. The loupe reads the schedule, then the boundaries, line by line…'),
 ('36.6', '35.5–37.6', 'IS IT THERE?', 'ର ପ୍ରମାଣ ଅଛି କି ନାହିଁ ଯାଞ୍ଚ କରନ୍ତୁ।', '…then “Access / Right of Way:”. A cursor runs along the blank and finds nothing: “— none”, in red.'),
 ('39.3', '37.8–39.6', 'REGISTERED', 'ନ ଥିଲେ, ତାଙ୍କଠୁ Registered କାଗଜରେ', 'A new right-of-way deed slides in on top. On “Registered” a seal press comes down and leaves an embossed gold seal.'),
 ('40.6', '39.7–41.0', 'THE WAY', 'ବାଟ ନିଅନ୍ତୁ—', 'In the deed’s site sketch, the way from the road to the plot is inked in gold; both parties sign.'),
 ('41.6', '41.0–42.4', 'NOT WORD OF MOUTH', 'ମୁହଁ କଥାରେ ନୁହେଁ।', 'The words “muhan katha” (in Odia) form out of smoke above the paper, hold for a breath, and blow away. The paper stays.'),
 ('43.6', '42.4–44.1', 'BACK TO THE LAND', 'Gate ଲାଗିବା ପରେ ନୁହେଁ—', 'The camera lifts off the table and glides back over the model; the house lights return slowly. The gate is still shut, lit vermilion.'),
 ('44.8', '44.3–45.6', 'REWIND', 'Advance ଦେବା ପୂର୍ବରୁ', 'The sun runs backwards, 90 → 0 days; the gate swings open and sinks back into the ground. It never happened.'),
 ('47.3', '45.7–48.1', 'SECURED', 'ରାସ୍ତାର ଅଧିକାର ନିଶ୍ଚିତ କରନ୍ତୁ।', 'Gold light runs from the public road up the lane to the plot; a gold seal blooms at the lane’s mouth: “Right of way · registered”.'),
 ('50.8', '48.4–51.4', 'SEND IT HOME', 'ଘରେ କେହି ଜମି କିଣିବାକୁ ଭାବୁଛନ୍ତି? ତାଙ୍କୁ ପଠାନ୍ତୁ।', 'Dusk on the model, windows lighting up. A thread of gold travels from the secured lane to the door of one lit home.'),
 ('53.5', '51.7–55.3', 'FOLLOW', 'ଆଉ Property ବିଷୟରେ ଏମିତି ଜରୁରୀ ତଥ୍ୟ ପାଇଁ Follow କରନ୍ତୁ।', 'Crane up: plot after plot lights up across the model. End card: FOLLOW + the Odia line “property facts that matter” (your channel name goes here).'),
 ('55.6', '55.3–55.7 → 0', 'LOOP', '', 'Back to the wide first frame with every plot lit: the film flows straight into its own opening dive.'),
]
TW, TH, PAD, LAB = 330, 587, 22, 340
def wrap(d, x, y, txt, font, fill, width, lh):
    line = ''
    for w in txt.split():
        if d.textlength(line + ' ' + w, font=font) > width and line: d.text((x, y), line, font=font, fill=fill); y += lh; line = w
        else: line = (line + ' ' + w).strip()
    d.text((x, y), line, font=font, fill=fill); return y + lh
def sheet(items, out, title, cols, n0=0):
    rows = (len(items) + cols - 1) // cols; cols = min(cols, len(items))
    Wd = cols * (TW + PAD) + PAD; Hd = 150 + rows * (TH + LAB + PAD) + PAD
    im = Image.new('RGB', (Wd, Hd), '#120e0b'); d = ImageDraw.Draw(im)
    d.text((PAD, 30), title, font=fH, fill='#efe2c6'); d.text((PAD, 88), 'One take · model lit by a projector → the records → back · 55.7 s · loops', font=fH2, fill='#b98f52')
    for k, (ts, span, med, od, txt) in enumerate(items):
        x = PAD + (k % cols) * (TW + PAD); y = 150 + (k // cols) * (TH + LAB + PAD)
        im.paste(Image.open(os.path.join(D, f't_{ts}.jpg')).resize((TW, TH), Image.LANCZOS), (x, y))
        d.text((x, y + TH + 8), f'{k + 1 + n0:02d}  ·  {span} s', font=fT, fill='#e7b45a'); d.text((x, y + TH + 36), med, font=fM, fill='#c9a36a')
        ly = y + TH + 68
        if od: ly = wrap(d, x, ly, od, fO, '#f0e6d4', TW, 30) + 4
        wrap(d, x, ly, txt, fS, '#d9ccb4', TW, 26)
    im.save(out, quality=90); print(out, im.size)
sheet(B, OUT, 'PLOT · RIGHT OF WAY  ·  STORYBOARD v1', 9)
for i in range(3): sheet(B[i * 9:(i + 1) * 9], OUT.replace('.jpg', f'_part{i + 1}.jpg'), f'STORYBOARD v1  ·  {i + 1} / 3', 3, i * 9)
