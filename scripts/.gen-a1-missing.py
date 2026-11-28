import os, subprocess
from PIL import Image

PDF = '/downloads/NWn A1 KB.pdf'
OUT = '/tmp/nwclone/public/pages/a1-kb'
TMP = '/tmp/a1gen'
os.makedirs(TMP, exist_ok=True)

pages = list(range(1, 8)) + list(range(28, 41)) + list(range(164, 176))
print('pages:', len(pages), flush=True)

for pr in pages:
    pn = pr + 1
    png = f'{TMP}/{pr:03d}.png'
    if not os.path.exists(png):
        subprocess.run(['pdftoppm', '-f', str(pn), '-l', str(pn), '-r', '150', '-png',
                        '-singlefile', PDF, f'{TMP}/{pr:03d}'], check=True, stderr=subprocess.DEVNULL)
    im = Image.open(png).convert('RGB')
    assert im.size == (1241, 1753), (pr, im.size)
    base = f'{OUT}/{pr:03d}'
    im.save(base + '.jpg', quality=85, optimize=True)
    im.save(base + '.webp', quality=80, method=6)
    im.resize((900, 1271), Image.LANCZOS).save(base + '-900.webp', quality=80, method=6)
    im.resize((28, 40), Image.LANCZOS).save(base + '-tiny.webp', quality=80, method=6)
    if pr == 1:
        im.resize((160, 224), Image.LANCZOS).save(base + '-cover.webp', quality=82, method=6)
    print(pr, 'ok', os.path.getsize(base + '.jpg'), os.path.getsize(base + '.webp'), flush=True)
print('DONE', flush=True)
