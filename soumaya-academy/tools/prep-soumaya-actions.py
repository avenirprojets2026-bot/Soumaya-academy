# Poses d'action de Soumaya (monter l'escalier, remuer le chaudron, s'asseoir) : même échelle que les poses debout.
import sys, os
from PIL import Image
import numpy as np
src, dst = sys.argv[1], sys.argv[2]
CW, CH, K = 520, 640, 590 / 1120.0
os.makedirs(dst, exist_ok=True)
for n in ['monte_1', 'monte_2', 'remue_1', 'remue_2', 'assis_tab']:
    im = Image.open(os.path.join(src, n + '.png')).convert('RGBA'); a = np.array(im)[:, :, 3]
    ys, xs = np.where(a > 24)
    b = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
    w8 = a[ys, xs] / 255.0; cx = float((xs * w8).sum() / w8.sum())
    crop = im.crop(b); w, h = crop.size
    crop = crop.resize((max(1, round(w * K)), max(1, round(h * K))), Image.LANCZOS)
    ox = round(CW / 2 - (cx - b[0]) * K); oy = CH - 6 - crop.size[1]
    can = Image.new('RGBA', (CW, CH), (0, 0, 0, 0)); can.alpha_composite(crop, (ox, max(oy, 0)))
    can.save(os.path.join(dst, n + '.webp'), 'WEBP', quality=86, method=6); print(n, crop.size, ox, oy)
