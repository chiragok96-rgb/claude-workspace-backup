from PIL import Image, ImageDraw, ImageFont
rows=[('2.4','1','0.0–4.5s','One-line · macro on the pen','JADU GUNI · the spell spirals into her eye'),
('7.4','2','4.5–9.0s','One-line · down the profile','MEETHA · red lips, a sweet drop falls'),
('12.2','3','9.0–13.4s','One-line · pull back','AMBA BAULA · hair becomes a mango branch'),
('16.6','4','13.4–17.9s','One-line · the whole portrait','MAHANI · curls become the moon; night falls'),
('17.75','4b','17.6–18.0s','Transition','the ink eye becomes a lit paper eye'),
('19.0','5','17.9–20.1s','Lightbox · iris darts on beats','CHAGALI · restless eyes'),
('21.4','6','20.1–22.3s','Lightbox · kohl slides in','KAJALA'),
('23.8','7','22.3–24.5s','Lightbox · giant moon, cuckoo lands','KOYILI'),
('26.0','8','24.5–26.7s','Pull back · she listens','KUHU KUHU · rings of song')]
tw,th,pad,cap=300,533,14,92
S=Image.new('RGB',(pad+5*(tw+pad),60+2*(th+cap+pad)),(16,12,18)); d=ImageDraw.Draw(S)
f=lambda n,b=False: ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans%s.ttf'%('-Bold' if b else ''),n)
d.text((pad,18),'JADU GUNI v3 — one-line portrait → paper-cut lightbox night · 1080×1920 · 30 fps · song only · accent: alta red + lamp gold',fill=(255,200,140),font=f(16,True))
for i,(t,n,du,fr,ln) in enumerate(rows):
    x=pad+(i%5)*(tw+pad); y=60+(i//5)*(th+cap+pad)
    S.paste(Image.open(f'storyboard/sb_{t}.jpg').resize((tw,th),Image.LANCZOS),(x,y))
    d.text((x,y+th+6),f'#{n}  {du}',fill=(244,228,200),font=f(15,True)); d.text((x,y+th+28),fr,fill=(232,150,44),font=f(13)); d.text((x,y+th+50),ln,fill=(220,205,185),font=f(13))
S.save('storyboard/storyboard_v3.jpg',quality=92); print(S.size)
