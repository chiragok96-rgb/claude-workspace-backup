import html, sys, os
D = os.path.dirname(os.path.abspath(__file__))
tpl = open(os.path.join(D, "tpl.html")).read()

# ---- tiny sketch kit (viewBox 90x160) -----------------------------------------------
G = '#cfa45a'; IV = '#f0e7d4'; LAT = '#a9502f'; DK = '#120d09'; PAPER = '#e9dcc0'; RED = '#d9573c'
def sky(top='#3a2a1e', bot='#d9a35f', h=92):
    return (f'<defs><linearGradient id="s{h}{top[1:]}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{top}"/>'
            f'<stop offset="1" stop-color="{bot}"/></linearGradient></defs><rect width="90" height="{h}" fill="url(#s{h}{top[1:]})"/>')
def ground(y=92, c='#6b2f19'): return f'<rect y="{y}" width="90" height="{160-y}" fill="{c}"/>'
def road(y=92, w=10): return f'<path d="M{45-w/2} {y} L{45+w/2} {y} L80 160 L10 160Z" fill="#9a5432"/>'
def palm(x, y, s=1.0):
    return (f'<g stroke="#140f0a" fill="none" stroke-width="{1.1*s}"><path d="M{x} {y} q{2*s} {-14*s} {1*s} {-26*s}"/>'
            f'<path d="M{x+1*s} {y-26*s} q{-8*s} {-1*s} {-12*s} {5*s} M{x+1*s} {y-26*s} q{8*s} {-1*s} {12*s} {6*s} '
            f'M{x+1*s} {y-26*s} q{-4*s} {-6*s} {-10*s} {-5*s} M{x+1*s} {y-26*s} q{5*s} {-6*s} {11*s} {-4*s}"/></g>')
def gate(y=96, closed=1.0, w=40):
    bars = ''.join(f'<line x1="{45-w/2+i*w/14:.1f}" y1="{y-32}" x2="{45-w/2+i*w/14:.1f}" y2="{y+2}"/>' for i in range(15))
    return (f'<g stroke="#0b0806" stroke-width="1.1">{bars}<line x1="{45-w/2}" y1="{y-28}" x2="{45+w/2}" y2="{y-28}"/>'
            f'<line x1="{45-w/2}" y1="{y-6}" x2="{45+w/2}" y2="{y-6}"/></g>'
            f'<rect x="{45-w/2-6}" y="{y-38}" width="6" height="40" fill="{LAT}"/><rect x="{45+w/2}" y="{y-38}" width="6" height="40" fill="{LAT}"/>')
def text(x, y, t, size=6, c=IV, fam='Noto Serif Oriya', w=700, anchor='middle', style=''):
    return f'<text x="{x}" y="{y}" font-family="{fam}" font-size="{size}" font-weight="{w}" fill="{c}" text-anchor="{anchor}" style="{style}">{html.escape(t)}</text>'
def label(x, y, t, c=G): return text(x, y, t.upper(), 3.0, c, 'Inter Tight', 600, style='letter-spacing:.5px')
def paper(x, y, w, h, rot=0, c=PAPER):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{c}" transform="rotate({rot} {x+w/2} {y+h/2})" rx="0.6"/>'
def lines(x, y, w, n, gap=3.2, c='#9c8b70'):
    return ''.join(f'<line x1="{x}" y1="{y+i*gap}" x2="{x+w*(0.6 if i%3==2 else 1)}" y2="{y+i*gap}" stroke="{c}" stroke-width=".6"/>' for i in range(n))
def desk(): return '<rect width="90" height="160" fill="#2a1a10"/><radialGradient id="lamp" cx=".55" cy=".35" r=".7"><stop offset="0" stop-color="#7a4f2c" stop-opacity=".9"/><stop offset="1" stop-color="#2a1a10" stop-opacity="0"/></radialGradient><rect width="90" height="160" fill="url(#lamp)"/>'
def arrow(x1, y1, x2, y2, c=G):
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{c}" stroke-width=".8" stroke-dasharray="2 1.5"/><circle cx="{x2}" cy="{y2}" r="1.2" fill="{c}"/>'
def svg(inner, aria): return f'<svg viewBox="0 0 90 160" role="img" aria-label="{html.escape(aria)}">{inner}</svg>'

import base64
KF = '/home/user/claude-workspace-backup/propertykatha/film2/look/kf/'
IMGS = [KF+'g_b1.jpg', KF+'g_b2.jpg', KF+'g_b3.jpg', KF+'g_b4.jpg', KF+'g_b5.jpg',
        '/home/user/claude-workspace-backup/propertykatha/film2/storyboard/v1_18.6.jpg', '/home/user/claude-workspace-backup/propertykatha/film2/storyboard/v1_21.0.jpg', '/home/user/claude-workspace-backup/propertykatha/film2/storyboard/v1_26.5.jpg', '/home/user/claude-workspace-backup/propertykatha/film2/storyboard/v1_31.2.jpg', '/home/user/claude-workspace-backup/propertykatha/film2/storyboard/v1_35.6.jpg', '/home/user/claude-workspace-backup/propertykatha/film2/storyboard/v1_40.2.jpg',
        KF+'g_b12.jpg', KF+'g_b13.jpg']
TAGS = ['Cycles keyframe']*5 + ['v1 paper scene (kept, polished)']*6 + ['Cycles keyframe']*2
def thumb(i, aria):
    from PIL import Image; import io
    im = Image.open(IMGS[i]).convert('RGB'); im.thumbnail((360, 640)); bio = io.BytesIO(); im.save(bio, 'JPEG', quality=80)
    return (f'<figure class="kf"><img alt="{html.escape(aria)}" src="data:image/jpeg;base64,{base64.b64encode(bio.getvalue()).decode()}">'
            f'<figcaption>{TAGS[i]}</figcaption></figure>')
B = []; NB = [0]
def beat(tc, vo, tr, sketch, aria, picture, camera, chips, sound):
    ch = ''
    for c in chips:
        h, l = c[0], c[1]; kind = c[2] if len(c) > 2 else ''
        cls = 'h acc' if kind == 'acc' else 'h'
        ch += f'<span class="chip {"warn" if kind=="warn" else ""}"><span class="{cls}">{html.escape(h)}</span><span class="l">{html.escape(l)}</span></span>'
    i = NB[0]; NB[0] += 1
    B.append(f'''<article class="beat">{thumb(i, aria)}<div class="sheet"><span class="tc">{tc}</span>
<p class="vo">{html.escape(vo)}<small>{html.escape(tr)}</small></p>
<dl><dt>Picture</dt><dd>{picture}</dd><dt>Camera</dt><dd>{camera}</dd>
<dt>On screen</dt><dd><div class="ost">{ch or '<span class="muted">No overlay: the text is in the scene.</span>'}</div></dd>
<dt>Sound</dt><dd>{sound}</dd></dl></div></article>''')

# 1 -------------------------------------------------------------------------------
beat('0.00 – 2.70 s', 'କୋଡ଼ିଏ ଲକ୍ଷ ଟଙ୍କାରେ Plot କିଣିଲେ।', 'Bought a plot for ₹20 lakh.',
     sky() + ground() + road() + palm(14, 100, 1.2) + palm(78, 104, 1.4) + palm(30, 92, .6)
     + '<g stroke="#e9c27a" stroke-width=".7"><line x1="58" y1="99" x2="58" y2="93"/><line x1="70" y1="100" x2="70" y2="94"/></g>'
     + text(45, 42, '₹20,00,000', 9.5, G, 'Noto Serif', 500) + label(45, 48, 'Plot bought')
     + '<path d="M45 150 l-3 -5 m3 5 l3 -5" stroke="#f0e7d4" stroke-width=".7" fill="none" opacity=".6"/>',
     'Low glide along a laterite road at golden hour, price in gold at the top',
     'Frame 1 is already moving: a low drone glide along a laterite road at golden hour, palms flicking past. Ahead, fresh survey pegs with a small brass tag mark the new plot.',
     'Fast forward glide about 1.5 m off the road, easing off as the price lands.',
     [('₹20,00,000', 'Plot bought')],
     'Air whoosh, birds, a single bright piano note on the price.')
# 2
beat('2.73 – 4.54 s', 'ହେଲେ, ତିନି ମାସ ପରେ,', 'But three months later,',
     sky('#2a2433', '#c98b55') + ground() + road()
     + ''.join(f'<path d="M{20+i*8} 92 l{-25+i*4} 68" stroke="#3b1a0d" stroke-width="3" opacity=".35"/>' for i in range(6))
     + '<circle cx="70" cy="30" r="5" fill="#f3c77d" opacity=".9"/><path d="M20 34 A30 30 0 0 1 70 30" stroke="#f3c77d" stroke-width=".5" stroke-dasharray="1.5 1.5" fill="none"/>'
     + text(45, 58, 'ତିନି ମାସ ପରେ', 8) + label(45, 64, 'Three months later'),
     'The glide freezes; a time-lapse sweeps sun and shadows across the road',
     'On "ହେଲେ" the glide stops dead. Time-lapse: the sun arcs across the sky three times, shadows of the palms sweep over the road, clouds streak, the grass grows taller.',
     'Locked off for 1.8 s: the only stillness in the film, so the stop itself feels like a beat.',
     [('ତିନି ମାସ ପରେ', 'Three months later')],
     'A clock tick that accelerates, then a reverse swell into the next beat.')
# 3
beat('4.83 – 7.04 s', 'Plot କୁ ଯିବା ରାସ୍ତାରେ Gate ଲାଗିଗଲା।', 'A gate went up on the road to the plot.',
     sky('#2a1d16', '#f2c27d') + ground() + road() + '<circle cx="47" cy="84" r="7" fill="#fff1cf" opacity=".85"/>' + gate()
     + '<g fill="#d9b07a" opacity=".55"><circle cx="30" cy="104" r="1.4"/><circle cx="60" cy="106" r="1.8"/><circle cx="40" cy="110" r="1.1"/><circle cx="52" cy="101" r="1"/></g>'
     + text(45, 40, 'Gate ଲାଗିଗଲା', 8) + label(45, 46, 'A gate went up'),
     'The iron gate slams shut in front of the lens, sun splitting through the bars',
     'The glide resumes toward the plot. At 6.4 s two iron gate leaves swing shut into frame from both sides, just ahead of the lens. Dust jumps off the road, the low sun splits into beams between the bars, a chain wraps, the padlock snaps.',
     'A small recoil on the impact (the one deliberate hit in the film), then a slow settle.',
     [('Gate ଲାଗିଗଲା', 'A gate went up')],
     'Deep braam plus metal clang and chain rattle; the music cuts out.')
# 4
beat('7.49 – 10.50 s', 'ପାଖ ଜମି ମାଲିକ କହିଲେ — "ଏ ରାସ୍ତା ମୋ ଜମି।"', 'The neighbouring landowner said, "This road is my land."',
     sky('#2a1d16', '#f2c27d') + ground() + road() + '<circle cx="47" cy="84" r="7" fill="#fff1cf" opacity=".85"/>' + gate()
     + '<rect x="22" y="62" width="46" height="16" fill="#4a2015" stroke="#e2d6be" stroke-width=".5"/>' + text(45, 72.5, 'ଏ ରାସ୍ତା ମୋ ଜମି', 6.2)
     + label(45, 36, "The neighbour's board"),
     'Close on the rusted tin board wired to the gate: this road is my land',
     'The neighbour\'s tin board, hand-painted in white enamel, swings down on its wire and settles against the bars: "ଏ ରାସ୍ତା ମୋ ଜମି". Backlit, grass soft in the foreground. This is the cover frame.',
     'Slow push-in on the board. No people are shown; the board is the neighbour\'s voice.',
     [('This road is my land', "The neighbour's board", 'acc')],
     'Board creak, wind through the bars, a low cello enters.')
HOOK = '\n'.join(B); B.clear()

# 5
beat('10.96 – 16.63 s', 'ଆଉ ସେ ଭୁଲ୍ କହୁନଥିଲେ। କାରଣ ଆଖିକୁ ଦିଶୁଥିବା Road, ସବୁବେଳେ ସରକାରୀ Road ନୁହେଁ।', "And he wasn't wrong. The road you can see is not always a government road.",
     '<rect width="90" height="160" fill="#5d3a1f"/>' + '<path d="M38 160 L44 0 L50 0 L54 160Z" fill="#9a5432"/>'
     + '<rect x="18" y="40" width="54" height="70" fill="none" stroke="' + RED + '" stroke-width=".9" stroke-dasharray="3 2"/>'
     + '<rect x="50" y="10" width="30" height="26" fill="#6e4a22" stroke="' + G + '" stroke-width=".9"/>' + label(65, 25, 'Your plot')
     + '<line x1="44" y1="160" x2="46" y2="112" stroke="' + G + '" stroke-width="1.4"/>' + label(68, 120, 'Govt road ends', G)
     + label(30, 76, "Neighbour's land", '#f0b49e') + text(45, 140, 'ସରକାରୀ Road ନୁହେଁ', 6.4),
     'Aerial view: the neighbour\'s boundary encloses the road; the government road stops short',
     'The camera cranes up over the gate. From high above, survey lines draw themselves on the ground in light: the neighbour\'s boundary (laterite red, dashed) encloses the road, and the gold government-road line stops short at the field edge. Our plot, marked by brass pegs and gold ribbon, sits beyond, cut off.',
     'One continuous crane from 1.5 m to about 40 m, the gate bars passing just under the lens.',
     [('ସେ ଭୁଲ୍ କହୁନଥିଲେ', "He wasn't wrong"), ('ସରକାରୀ Road ନୁହେଁ', 'Not always a government road')],
     'String swell; a fine shimmer as each survey line draws.')
# 6
beat('16.95 – 18.81 s', 'Advance ପୂର୍ବରୁ,', 'Before you pay the advance,',
     desk() + '<rect x="16" y="46" width="58" height="46" fill="#6b3f22" stroke="#3b2414" stroke-width="1.2"/>'
     + '<path d="M42 92 L45 46 L48 46 L50 92Z" fill="#9a5432"/>' + palm(26, 70, .4) + palm(64, 66, .45)
     + paper(14, 104, 30, 16, -6, '#d8cdb3') + text(29, 113, 'ADVANCE', 3.2, '#5a4632', 'Noto Serif', 500)
     + '<line x1="50" y1="120" x2="70" y2="104" stroke="' + G + '" stroke-width="1.6"/>'
     + text(45, 36, 'Advance ପୂର୍ବରୁ', 7.4) + label(45, 42, 'Before you pay the advance'),
     'Pull back: the land is a scale model on a teak desk, cheque book and pen beside it',
     'The camera reaches a straight-down view. The land\'s colour drains along the survey lines into cream paper: fields become parcels, the road becomes a numbered strip. We are now on the map, with no cut.',
     'The crane finishes its tilt to straight down; the move carries on across the paper.',
     [('Advance ପୂର୍ବରୁ', 'Before you pay the advance')],
     'Wind fades under a paper rustle and a wall clock; one low piano note.')
# 7
beat('19.02 – 22.77 s', 'Bhulekh Map ରେ ରାସ୍ତାର Plot Number ବାହାର କରି ପଟ୍ଟା ଦେଖନ୍ତୁ।', "Find the road's plot number on the Bhulekh map and check its patta.",
     desk() + paper(10, 40, 70, 84, -2) + '<g stroke="#8f7c5f" stroke-width=".5" fill="none"><rect x="16" y="46" width="24" height="30"/><rect x="50" y="46" width="24" height="30"/><rect x="16" y="88" width="24" height="30"/><rect x="50" y="88" width="24" height="30"/></g>'
     + '<rect x="42" y="42" width="6" height="80" fill="' + G + '" opacity=".75"/>' + text(45, 84, '412', 5, '#3a2a1a', 'Noto Serif', 500)
     + paper(52, 112, 30, 36, 8, '#f3ead6') + text(67, 124, 'ପଟ୍ଟା', 4.4, '#3a2a1a') + lines(57, 130, 18, 4)
     + text(45, 28, 'Bhulekh Map', 8, G, 'Cormorant Garamond', 500, style='font-style:italic') + label(45, 34, "Find the road's plot number"),
     'Cadastral map beside the model; a gold line traces road plot 412; the patta slides out',
     'As in v1: a gold ink line traces the road parcel on the map and its number, 412, embosses in; then the patta lifts off the map toward the lens. The map is styled like Bhulekh but is not a copy of the government site.',
     'Low glide over the paper, focus racing from the map to the patta.',
     [('Bhulekh Map', "Find the road's plot number", 'acc'), ('ପଟ୍ଟା ଦେଖନ୍ତୁ', 'Check its patta (record of rights)')],
     'Pen nib on paper as the line draws; a paper slide.')
# 8
beat('23.07 – 28.48 s', 'ସେଠି "ଓଡ଼ିଶା ସରକାର" କିମ୍ବା "କିସମ ରାସ୍ତା" ଲେଖାଥିଲେ — ବଢ଼ିଆ, କିଛି tension ନାହିଁ।', 'If it says "Government of Odisha" or "Kisam: road", good. No tension.',
     desk() + paper(16, 30, 58, 92, 0, '#f3ead6') + text(45, 42, 'ଅଧିକାର ଅଭିଲେଖ', 4.6, '#3a2a1a') + lines(22, 52, 46, 3)
     + text(24, 70, 'ମାଲିକ', 3.4, '#7a6a52', anchor='start') + text(66, 70, 'ଓଡ଼ିଶା ସରକାର', 4.2, '#2c4a2b', anchor='end')
     + text(24, 84, 'କିସମ', 3.4, '#7a6a52', anchor='start') + text(66, 84, 'ରାସ୍ତା', 4.2, '#2c4a2b', anchor='end')
     + '<path d="M68 67 l1.5 1.8 l3 -4 M68 81 l1.5 1.8 l3 -4" stroke="#3f7a40" stroke-width=".9" fill="none"/>' + lines(22, 96, 46, 6)
     + text(45, 140, 'ବଢ଼ିଆ', 7) + label(45, 146, 'All clear'),
     'The patta under the lamp: owner Government of Odisha, kisam road, green ticks',
     'The patta under the brass lamp. The owner field reads "ଓଡ଼ିଶା ସରକାର" and the kisam field reads "ରାସ୍ତା"; a green-ink nib draws a tick beside each. Warm, calm light.',
     'Slow drift across the two fields, holding on the ticks.',
     [('ଓଡ଼ିଶା ସରକାର · କିସମ ରାସ୍ତା', 'Government land · road'), ('ବଢ଼ିଆ', 'All clear')],
     'A soft major chord, pen scratches, the clock.')
# 9
beat('28.80 – 31.85 s', 'କିନ୍ତୁ କୌଣସି ବ୍ୟକ୍ତିଙ୍କ ନାମ ଥିଲେ — ସାବଧାନ୍!', "But if it shows a person's name, be careful!",
     '<rect width="90" height="160" fill="#1c130d"/>' + paper(18, 30, 56, 92, 3, '#e7ddc6') + text(46, 42, 'ଅଧିକାର ଅଭିଲେଖ', 4.6, '#3a2a1a')
     + text(26, 72, 'ମାଲିକ', 3.4, '#7a6a52', anchor='start') + text(68, 72, 'ଶ୍ରୀ ରମାକାନ୍ତ ଦାସ', 4.0, '#3a2a1a', anchor='end')
     + '<path d="M40 75 q14 2 29 -1" stroke="' + RED + '" stroke-width="1" fill="none"/>' + lines(24, 90, 46, 7)
     + text(45, 142, 'ସାବଧାନ୍', 8, '#f2b7a1') + label(45, 148, 'Caution', '#e9a089'),
     "A second patta with a person's name as owner, underlined in red; the light cools",
     "A second patta slides over the first. The owner is a person (a made-up name). The lamp dims and cools a touch, a red pencil underlines the name, and the camera pushes in slowly.",
     'Slow push-in on the name; everything else falls out of focus.',
     [("ବ୍ୟକ୍ତିଙ୍କ ନାମ", "A person's name"), ('ସାବଧାନ୍', 'Caution', 'warn')],
     'The music drops to a single held cello note; a soft double thump.')
# 10
beat('32.30 – 37.57 s', 'Sale Deed ଓ ପୁରୁଣା Documents ରେ Right of Way ର ପ୍ରମାଣ ଅଛି କି ନାହିଁ ଯାଞ୍ଚ କରନ୍ତୁ।', 'Check the sale deed and old documents for proof of a right of way.',
     desk() + paper(10, 40, 50, 74, -8, '#d9c9a6') + paper(22, 34, 52, 80, 4, '#efe4cc') + '<rect x="12" y="70" width="64" height="3" fill="' + RED + '" transform="rotate(-4 44 72)"/>'
     + text(48, 50, 'SALE DEED', 4.2, '#3a2a1a', 'Cormorant Garamond', 600) + lines(30, 58, 38, 10, 3.4)
     + '<circle cx="50" cy="84" r="11" fill="#fff6dd" fill-opacity=".35" stroke="' + G + '" stroke-width="1.6"/><line x1="58" y1="92" x2="72" y2="108" stroke="#5a3a1c" stroke-width="2.6"/>'
     + text(50, 86, 'Right of Way', 4.2, '#7a4f12', 'Cormorant Garamond', 600, style='font-style:italic')
     + text(45, 136, 'Right of Way', 8, G, 'Cormorant Garamond', 500, style='font-style:italic') + label(45, 142, 'Is there proof of passage?'),
     'Old deeds in red cotton tape; a brass magnifier over the Right of Way clause',
     'The camera slides to a bundle of old deeds tied in red cotton tape. The tape slips and the papers fan out. A brass magnifier glides over the clause "…together with the Right of Way over Plot No. 412…", and the glass genuinely magnifies and bends the print.',
     'Overhead three-quarter angle, following the magnifier.',
     [('Sale Deed · ପୁରୁଣା Documents', 'Sale deed and old documents'), ('Right of Way', 'Is there proof of passage?', 'acc')],
     'Paper fans out, tape slides off, the lens clicks down on the glass.')
# 11
beat('37.83 – 42.36 s', 'ନ ଥିଲେ, ତାଙ୍କଠୁ Registered କାଗଜରେ ବାଟ ନିଅନ୍ତୁ — ମୁହଁ କଥାରେ ନୁହେଁ।', 'If not, get the passage from them on registered paper, not by word of mouth.',
     desk() + paper(16, 32, 56, 90, -1, '#e8ecd9') + '<rect x="20" y="36" width="48" height="16" fill="#cfe0c9" stroke="#6f8f69" stroke-width=".5"/>'
     + text(44, 46, '₹100', 4.6, '#3e5c3a', 'Noto Serif', 500) + lines(22, 62, 44, 9)
     + '<circle cx="58" cy="104" r="9" fill="none" stroke="#9b2f3a" stroke-width="1.4"/>' + text(58, 105.5, 'REGD', 3, '#9b2f3a', 'Inter Tight', 600)
     + '<g transform="rotate(-18 76 30)">' + paper(66, 22, 18, 10, 0, '#f4efe2') + text(75, 29, 'ମୁହଁ କଥା', 3.2, '#5a4632') + '</g>' + arrow(70, 34, 86, 14, '#ab9d88')
     + text(45, 140, 'Registered କାଗଜ', 7) + label(45, 146, 'On registered paper'),
     'Green stamp paper, a registration seal stamps; a verbal-promise chit blows away',
     'A green ₹100 stamp paper slides in, headed "Right of Way Agreement". A wooden registration seal thumps down and leaves a red-violet ring. A small handwritten chit, "ମୁହଁ କଥା" (a verbal promise), lifts in the fan\'s draught and flutters off the desk: spoken words fly away, registered paper stays.',
     'Steady hold for the stamp, then a gentle tilt following the chit out of frame.',
     [('Registered କାଗଜ', 'On registered paper'), ('ମୁହଁ କଥାରେ ନୁହେଁ', 'Not a verbal promise')],
     'Felt thump on the seal at 39.6 s; paper flutter; the clock.')
# 12
beat('42.71 – 48.05 s', 'Gate ଲାଗିବା ପରେ ନୁହେଁ — Advance ଦେବା ପୂର୍ବରୁ ରାସ୍ତାର ଅଧିକାର ନିଶ୍ଚିତ କରନ୍ତୁ।', 'Not after the gate goes up: secure the road right before you pay the advance.',
     sky('#3a2a1e', '#f5cf88') + ground() + '<path d="M40 92 L50 92 L80 160 L10 160Z" fill="#c9883f"/>' + '<circle cx="45" cy="84" r="9" fill="#fff4d8"/>'
     + '<g stroke="#0b0806" stroke-width="1.1"><line x1="8" y1="64" x2="8" y2="98"/><line x1="12" y1="64" x2="12" y2="98"/><line x1="16" y1="66" x2="16" y2="96"/><line x1="74" y1="66" x2="74" y2="96"/><line x1="78" y1="64" x2="78" y2="98"/><line x1="82" y1="64" x2="82" y2="98"/></g>'
     + palm(20, 94, .9) + palm(70, 92, .8) + text(45, 40, 'ରାସ୍ତାର ଅଧିକାର', 8) + label(45, 46, 'Secure the right of way first'),
     'Back inside the model at full scale: the gate swings open onto a golden road',
     'The papers slide away and the map\'s road strip turns back into land under the camera; we tilt up and descend to the gate, which now swings open. Sunlight floods through and the road ahead glows gold all the way to the plot.',
     'The reverse of beat 6: from straight down over the map to road level, then forward through the open gate.',
     [('Gate ଲାଗିବା ପରେ ନୁହେଁ', 'Not after the gate'), ('Advance ଦେବା ପୂର୍ବରୁ', 'Before the advance'), ('ରାସ୍ତାର ଅଧିକାର', 'Secure the right of way first')],
     'The harmony turns to D major, the gate creaks open, birds return.')
# 13
beat('48.40 – 55.56 s', 'ଘରେ କେହି ଜମି କିଣିବାକୁ ଭାବୁଛନ୍ତି? — ତାଙ୍କୁ ପଠାନ୍ତୁ। ଆଉ Property ବିଷୟରେ ଏମିତି ଜରୁରୀ ତଥ୍ୟ ପାଇଁ Follow କରନ୍ତୁ।', 'Someone at home thinking of buying land? Send this to them. Follow for more essential property facts.',
     sky('#3a2a1e', '#efc27e') + ground() + road() + '<rect x="34" y="72" width="22" height="16" fill="#e6d7bb"/><path d="M31 73 L45 62 L59 73Z" fill="#7a3a22"/><rect x="42" y="78" width="5" height="10" fill="' + G + '"/>'
     + '<circle cx="45" cy="30" r="9" fill="#f0e7d4"/><path d="M40 33 l5 -6 l5 6 v4 h-10z" fill="#5a3a22"/>' + text(45, 50, 'PropertyKatha', 7, '#3a2414', 'Cormorant Garamond', 600)
     + '<rect x="33" y="54" width="24" height="7" rx="3.5" fill="#5a3a22"/>' + text(45, 59.2, 'FOLLOW', 3, IV, 'Inter Tight', 600)
     + text(45, 130, 'ତାଙ୍କୁ ପଠାନ୍ତୁ', 7) + label(45, 136, 'Send this to them'),
     'Glide down the open road to a home on the plot; logo and Follow end card',
     'Through the gate and down the golden road to the plot, where a calm modern home now stands with warm windows (its design will be refined). "ତାଙ୍କୁ ପଠାନ୍ତୁ" with a small send arrow, then the end card: logo, PropertyKatha in Cormorant and a Follow pill on a soft cream glow. The last frames match frame 1, so the reel loops seamlessly.',
     'Forward glide that slows to a rest; the end card resolves in the sky above the house.',
     [('ଘରେ କେହି ଜମି କିଣିବାକୁ ଭାବୁଛନ୍ତି?', 'Someone at home buying land?'), ('ତାଙ୍କୁ ପଠାନ୍ତୁ', 'Send this to them'), ('Follow', 'PropertyKatha', 'acc')],
     'Strings rise into a short two-note logo sting; the room tone fades out.')
REST = '\n'.join(B)

rt = sys.argv[1] if len(sys.argv) > 1 else 'to be measured'
out = (tpl.replace('{{HOOK}}', HOOK).replace('{{REST}}', REST).replace('{{RENDER}}', rt)
       .replace('{{V1}}', open(os.path.join(D, 'v1_gate.b64')).read()).replace('{{V2}}', open(os.path.join(D, 'v2_gate.b64')).read()))
dst = '/home/user/claude-workspace-backup/propertykatha/docs/the-gate-v2-storyboard.html'
open(dst, 'w').write(out); print('wrote', dst, len(out))
