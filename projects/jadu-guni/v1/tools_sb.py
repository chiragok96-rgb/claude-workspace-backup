from PIL import Image, ImageDraw, ImageFont
rows=[('2.6','1','One-line','0.0–4.5s','Macro → composed','Jadu · the spell spirals into her eye'),
('7.6','2','One-line','4.5–9.0s','Push down the profile','Meetha · lips turn red; a drop falls'),
('12.4','3','One-line','9.0–13.4s','Pull back, drift up','Amba Baula · hair becomes a mango branch'),
('16.6','4','One-line','13.4–17.9s','Reveal, then push into the eye','Mahani · scent curls into the moon; night'),
('19.0','5','Lightbox','17.9–20.1s','Slow push','Chagali · the iris darts on every beat'),
('21.3','6','Lightbox','20.1–22.3s','Rack focus to front','Kajal · the kohl wing slides in'),
('23.6','7','Lightbox','22.3–24.5s','Lateral parallax','Koyili · iris slides away, cuckoo lands'),
('25.6','8','Lightbox','24.5–26.7s','Pull out of the box','Kuhu kuhu · rings of light on the beats')]
tw,th,pad,cap=360,640,16,96
S=Image.new('RGB',(pad+4*(tw+pad),60+2*(th+cap+pad)),(18,14,20)); d=ImageDraw.Draw(S)
f=lambda n,b=False: ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans%s.ttf'%('-Bold' if b else ''),n)
d.text((pad,18),'JADU GUNI — storyboard · 1080×1920 · 30 fps · song only · accent: alta #C8321E + lamp gold',fill=(255,200,140),font=f(17,True))
for i,(t,n,st,du,fr,ln) in enumerate(rows):
    x=pad+(i%4)*(tw+pad); y=60+(i//4)*(th+cap+pad)
    S.paste(Image.open(f'storyboard/sb_{t}.jpg').resize((tw,th),Image.LANCZOS),(x,y))
    d.text((x,y+th+6),f'#{n} {st} · {du}',fill=(244,228,200),font=f(16,True)); d.text((x,y+th+30),fr,fill=(232,150,44),font=f(14)); d.text((x,y+th+52),ln,fill=(220,205,185),font=f(13))
S.save('storyboard/storyboard.jpg',quality=92); print(S.size)
