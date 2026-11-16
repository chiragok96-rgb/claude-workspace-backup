from PIL import Image, ImageDraw, ImageFont
rows=[('3.2','1','0.0–4.5s','Dusk window · lamp lights on the beats','JADU · gold dust spirals from her eye'),
('7.0','2','4.5–9.0s','Close profile · tilt down','MEETHA · a sweet drop on salty lips…'),
('8.4','2b','','…falls into the lotus pond','ripples on the beat'),
('11.6','3','9.0–13.4s','Lateral travel through the orchard','AMBA BAULA · golden scent drifts'),
('15.8','4','13.4–17.9s','Moonrise · she looks up','MAHANI · enchanted; fireflies'),
('19.2','5','17.9–20.1s','Her eye · iris darts on beats','CHAGALI · restless eyes'),
('21.4','6','20.1–22.3s','Kohl wing slides in · rack focus','KAJALA'),
('23.8','7','22.3–24.5s','Giant moon · cuckoo lands','KOYILI'),
('26.0','8','24.5–26.7s','Pull back: she listens on the balcony','KUHU KUHU · rings of song')]
tw,th,pad,cap=300,533,14,92
S=Image.new('RGB',(pad+5*(tw+pad),60+2*(th+cap+pad)),(16,12,18)); d=ImageDraw.Draw(S)
f=lambda n,b=False: ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans%s.ttf'%('-Bold' if b else ''),n)
d.text((pad,18),'JADU GUNI v2 — paper-cut lightbox, dusk → moonlight · 1080×1920 · 30 fps · song only · accent: alta red + lamp gold',fill=(255,200,140),font=f(16,True))
for i,(t,n,du,fr,ln) in enumerate(rows):
    x=pad+(i%5)*(tw+pad); y=60+(i//5)*(th+cap+pad)
    S.paste(Image.open(f'storyboard/sb_{t}.jpg').resize((tw,th),Image.LANCZOS),(x,y))
    d.text((x,y+th+6),f'#{n}  {du}',fill=(244,228,200),font=f(15,True)); d.text((x,y+th+28),fr,fill=(232,150,44),font=f(13)); d.text((x,y+th+50),ln,fill=(220,205,185),font=f(13))
S.save('storyboard/storyboard_v2.jpg',quality=92); print(S.size)
