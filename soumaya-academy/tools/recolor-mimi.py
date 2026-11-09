import numpy as np, sys
from PIL import Image
import matplotlib.colors as mc
from scipy import ndimage as ndi
def recolor(src, dst, bow=None):
    im=Image.open(src).convert('RGBA'); a=np.array(im).astype(float)/255
    rgb=a[...,:3]; al=a[...,3].copy()
    hsv=mc.rgb_to_hsv(rgb); h,s,v=hsv[...,0]*360,hsv[...,1],hsv[...,2]
    # 1) retirer les restes de décor (brun/orangé terne)
    H_,W_=al.shape
    gold=(h>34)&(h<56)&(s>0.45)&(v>0.8)&(al>0.5); gold[int(H_*0.75):,:]=False
    gl,gn=ndi.label(gold); pend=np.zeros_like(gold)
    if gn:
        gs=ndi.sum(gold,gl,range(1,gn+1)); pend=ndi.binary_dilation(gl==1+int(np.argmax(gs)),iterations=14)
    warm=(h>6)&(h<52)&(s>0.30)&(~pend)
    band=ndi.distance_transform_edt(al>0.2)<7
    junk=warm&(v<0.88)&band
    yy,xx=np.mgrid[0:H_,0:W_]
    zone=((xx<62)&(yy>100)&(yy<205))|(yy>236)
    junk|=warm&(v<0.92)&zone&(s>0.26)
    junk=ndi.binary_dilation(junk,iterations=2)&(al>0)&(~pend)
    al[junk]=0
    al=np.where(ndi.binary_opening(al>0.2,iterations=1),al,0)
    # garder la plus grande composante
    lab,n=ndi.label(al>0.2)
    if n>1:
        sizes=ndi.sum(al>0.2,lab,range(1,n+1)); keep=1+int(np.argmax(sizes)); al[(lab!=keep)]=0
    # 2) zone des yeux (bleu) pour protéger les reflets
    blue=(h>180)&(h<260)&(s>0.35)&(al>0.5)
    eye=ndi.binary_dilation(blue,iterations=10)
    # 3) pelage = peu saturé
    fur=np.clip((0.36-s)/0.10,0,1)
    fur=np.maximum(fur,((h>6)&(h<52)&(~pend)&(al>0.2)).astype(float))
    fur*= (1-ndi.gaussian_filter(blue.astype(float),1.0).clip(0,1))
    L=0.299*rgb[...,0]+0.587*rgb[...,1]+0.114*rgb[...,2]
    Ln=np.clip((L-0.45)/0.55,0,1)           # 0 = ombre, 1 = lumière
    t=0.05+0.20*Ln**1.8                      # noir velouté
    rim=np.clip((Ln-0.85)/0.15,0,1)*0.10    # liseré de lumière
    dark=np.stack([t*0.95+rim*0.9, t*0.98+rim*0.95, t*1.25+rim*1.1],-1)
    hl0=eye&(v>0.9)&(s<0.12)
    hl_l,hl_n=ndi.label(hl0); hl=np.zeros_like(hl0); sclera=np.zeros_like(hl0)
    for i in range(1,hl_n+1):
        c=hl_l==i
        (hl if c.sum()<45 else sclera).__setitem__(c,True)
    w=fur[...,None]*(~hl)[...,None]
    out=rgb*(1-w)+np.clip(dark,0,1)*w
    sc=ndi.gaussian_filter(sclera.astype(float),0.8)[...,None]
    out=out*(1-sc)+np.array([0.16,0.18,0.30])*sc
    # 4) variante de nœud
    if bow:
        bm=(s>0.40)&((h>315)|(h<14))&(v>0.5)&(~eye)&(yy>165)&(yy<240)&(xx>170)&(xx<310)
        # exclut nez/langue/oreilles : on ne garde que la zone du nœud (bas du visage -> cou)
        ys,xs=np.nonzero(bm)
        bmm=bm.copy()
        hh=mc.rgb_to_hsv(out)
        hh[...,0]=np.where(bmm,(bow/360.0),hh[...,0]); out=mc.hsv_to_rgb(hh)
    res=np.dstack([out,al]); Image.fromarray((np.clip(res,0,1)*255).astype(np.uint8),'RGBA').save(dst,quality=92,method=6)
if __name__=='__main__':
    recolor(sys.argv[1],sys.argv[2])
