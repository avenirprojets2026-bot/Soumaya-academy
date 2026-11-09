# Normalise les poses générées de Maissa : recadrage, taille commune, ancrage par les pieds, export WebP.
import sys, glob, os
from PIL import Image
import numpy as np
src, dst = sys.argv[1], sys.argv[2]
CW, CH, TARGET = 520, 640, 590
os.makedirs(dst, exist_ok=True)
SAME_SCALE = {'joie', 'assise'}          # poses non debout : même échelle que les autres
info = {}
for f in sorted(glob.glob(os.path.join(src, '*.png'))):
    n = os.path.splitext(os.path.basename(f))[0]
    im = Image.open(f).convert('RGBA'); a = np.array(im)[:, :, 3]
    ys, xs = np.where(a > 24)
    box = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
    cx = float((xs * (a[ys, xs] / 255.0)).sum() / (a[ys, xs] / 255.0).sum())
    info[n] = (im, box, cx)
ks = [TARGET / (b[3] - b[1]) for k, (im, b, c) in info.items() if k not in SAME_SCALE]
kmean = sum(ks) / len(ks)
for n, (im, b, cx) in info.items():
    k = kmean if n in SAME_SCALE else TARGET / (b[3] - b[1])
    crop = im.crop(b); w, h = crop.size
    crop = crop.resize((max(1, round(w * k)), max(1, round(h * k))), Image.LANCZOS)
    ox = round(CW / 2 - (cx - b[0]) * k)
    oy = CH - 6 - crop.size[1]
    can = Image.new('RGBA', (CW, CH), (0, 0, 0, 0))
    can.alpha_composite(crop, (max(-ox, 0) * 0 + ox if ox >= 0 else ox, max(oy, 0)))
    can.save(os.path.join(dst, n + '.webp'), 'WEBP', quality=86, method=6)
    print(n, crop.size, ox, oy)
