from PIL import Image, ImageDraw, ImageFont, ImageFilter
B='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'; R='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
T={'el':('Βρες το ιδανικό πακέτο','εταιρικών παροχών σε 2 λεπτά','7 ερωτήσεις · Πρόταση με αιτιολόγηση · Χωρίς δέσμευση'),
   'en':('Find the right employee','benefits package in 2 minutes','7 questions · A reason for every solution · No commitment')}
P=[('FlexOne','#9f51ae'),('Up Gift','#5e7a78'),('Fitpass','#e6441f'),('Up Expense','#0772f8'),('Chèque Déjeuner','#ff8500')]
for lang,(l1,l2,l3) in T.items():
    W,H=1200,630; im=Image.new('RGB',(W,H),'#191919')
    glow=Image.new('RGB',(W,H),'#191919'); g=ImageDraw.Draw(glow)
    g.ellipse((780,-260,1460,420),fill='#ff8500'); g.ellipse((-200,380,500,980),fill='#6b3375')
    glow=glow.filter(ImageFilter.GaussianBlur(160)); im=Image.blend(im,glow,0.55)
    d=ImageDraw.Draw(im)
    d.ellipse((72,64,124,116),fill='#ff8500'); d.text((98,90),'Up',font=ImageFont.truetype(B,20),fill='white',anchor='mm')
    d.text((140,90),'Benefits Builder',font=ImageFont.truetype(B,30),fill='white',anchor='lm')
    d.text((72,200),l1,font=ImageFont.truetype(B,62),fill='white')
    d.text((72,276),l2,font=ImageFont.truetype(B,62),fill='#ff9d33')
    d.text((72,372),l3,font=ImageFont.truetype(R,28),fill='#e5e5e5')
    x=72; f=ImageFont.truetype(B,24)
    for n,c in P:
        w=d.textlength(n,font=f)+64
        if x+w>W-60: break
        d.rounded_rectangle((x,470,x+w,524),radius=27,fill='#2b2b2b',outline='#3a3a3a')
        d.ellipse((x+18,489,x+34,505),fill=c); d.text((x+44,497),n,font=f,fill='white',anchor='lm'); x+=w+12
    d.text((72,580),'Concept prototype · not an official Up Hellas page',font=ImageFont.truetype(R,20),fill='#8f8f8f')
    im.save(f'assets/og-{lang}.png',optimize=True)
print('ok')
