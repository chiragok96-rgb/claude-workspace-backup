from PIL import Image, ImageDraw, ImageFont
rows=[('3.4','1','Lightbox','Full · dolly in','0.0–3.9s','Sun-hole opens on beat; her paper profile'),
('6.6','2','Lightbox','Wide · tilt up + rack focus','3.9–7.9s','Konark wheel, light turns one spoke'),
('10.6','3','Watercolor','Medium · slow push','7.9–11.9s','Alta feet; mandar bursts on downbeat'),
('14.2','4','Watercolor','Tilt up','11.9–15.9s','Phagun flame-tree; mist breath; red pools'),
('18.6','5','Impasto','Wide · push-in','15.9–19.9s','Red becomes knife paint: monsoon kadamba'),
('22.4','6','Impasto','Wide · truck','19.9–23.9s','Rain; vermilion umbrella; light swells'),
('25.9','7','Impasto','Macro · push','23.9–27.9s','One blossom; gold sparks on each beat'),
('30.6','8','Impasto','Pull back','27.9–32.2s','Blossom becomes the sun wheel; light sinks')]
tw,th=360,640; pad=16; cap=96
S=Image.new('RGB',(pad+4*(tw+pad),pad+2*(th+cap+pad)+60),(24,12,12)); d=ImageDraw.Draw(S)
f=lambda n,b=False: ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans%s.ttf'%('-Bold' if b else ''),n)
d.text((pad,18),'MEGHA KADAMBA — storyboard · 1080×1920 · 30 fps · song only · palette: alta #C8321E · marigold · kadamba gold',fill=(242,184,62),font=f(17,True))
for i,(t,n,st,fr,du,ln) in enumerate(rows):
    x=pad+(i%4)*(tw+pad); y=60+(i//4)*(th+cap+pad)
    S.paste(Image.open(f'storyboard/sb_{t}.jpg').resize((tw,th),Image.LANCZOS),(x,y))
    d.text((x,y+th+6),f'#{n} {st} · {du}',fill=(244,228,200),font=f(16,True))
    d.text((x,y+th+30),fr,fill=(232,150,44),font=f(14))
    d.text((x,y+th+52),ln,fill=(220,205,185),font=f(13))
S.save('storyboard/storyboard.jpg',quality=92); print(S.size)
