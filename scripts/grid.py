import sys
from PIL import Image, ImageDraw, ImageFont
n=sys.argv[1]
img=Image.open(f'/tmp/nwclone/public/pages/a1-kb/{n}.jpg').convert('RGB')
W,H=img.size
d=ImageDraw.Draw(img)
f=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',18)
for x in range(0,W,50):
    d.line([(x,0),(x,H)], fill=(0,160,255) if x%200 else (0,90,200))
for y in range(0,H,50):
    d.line([(0,y),(W,y)], fill=(0,160,255) if y%200 else (0,90,200))
for x in range(0,W,200): d.text((x+2,2), str(x), fill=(200,0,0), font=f)
for y in range(0,H,200): d.text((2,y+2), str(y), fill=(200,0,0), font=f)
img.crop((0,0,W,H//2)).save(f'/tmp/shots/grid-{n}-top.png')
img.crop((0,H//2,W,H)).save(f'/tmp/shots/grid-{n}-bot.png')
print('ok',n,W,H)
