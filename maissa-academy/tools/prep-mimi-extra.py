# Poses supplémentaires de Mimi (noir) : recadrage 348x312, ancrage bas-centre, variantes de nœud par teinte.
import sys, os
import numpy as np
from PIL import Image
import matplotlib.colors as mc
from scipy import ndimage as ndi
src, out = sys.argv[1], sys.argv[2]
CW, CH = 348, 312
BOWS = {'rose': None, 'bleu': 205, 'violet': 275, 'dore': 45, 'vert': 130}
def fit(im):
    a = np.array(im)[:, :, 3]; ys, xs = np.where(a > 24)
    im = im.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)); w, h = im.size
    k = min((CW - 8) / w, (CH - 6) / h); im = im.resize((round(w * k), round(h * k)), Image.LANCZOS)
    can = Image.new('RGBA', (CW, CH)); can.alpha_composite(im, ((CW - im.width) // 2, CH - 4 - im.height)); return can
def bow_mask(a):
    rgb = a[..., :3] / 255.0; hsv = mc.rgb_to_hsv(rgb); h, s, v = hsv[..., 0] * 360, hsv[..., 1], hsv[..., 2]
    m = ((h > 305) | (h < 12)) & (s > 0.50) & (v > 0.55) & (a[..., 3] > 128)
    lab, n = ndi.label(ndi.binary_dilation(m, iterations=1))
    keep = np.zeros_like(m)
    for i in range(1, n + 1):
        c = lab == i
        if c.sum() > 350 and np.nonzero(c)[0].mean() > 0.40 * a.shape[0]: keep |= c & m
    return ndi.binary_dilation(keep, iterations=1) & (a[..., 3] > 128)
for f in sorted(os.listdir(src)):
    if not f.endswith('.png'): continue
    name = os.path.splitext(f)[0]; can = fit(Image.open(os.path.join(src, f)).convert('RGBA')); a = np.array(can)
    m = bow_mask(a); print(name, 'bow px', int(m.sum()))
    for bow, hue in BOWS.items():
        d = os.path.join(out, 'noir-' + bow); os.makedirs(d, exist_ok=True)
        b = a.copy()
        if hue is not None:
            hsv = mc.rgb_to_hsv(b[..., :3] / 255.0); hsv[..., 0] = np.where(m, hue / 360.0, hsv[..., 0])
            b[..., :3] = (mc.hsv_to_rgb(hsv) * 255).astype(np.uint8)
        Image.fromarray(b, 'RGBA').save(os.path.join(d, name + '.webp'), 'WEBP', quality=88, method=6)
