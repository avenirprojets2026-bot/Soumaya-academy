import * as THREE from 'three';

/** Texture dessinée par code (aucune image à télécharger : tout marche hors connexion). */
export function canvasTex(w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d')!;
  draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

const glowCache = new Map<string, THREE.CanvasTexture>();
/** Halo doux (dégradé radial) utilisé pour les lueurs additives. */
export function glowTex(color: string): THREE.CanvasTexture {
  const hit = glowCache.get(color);
  if (hit) return hit;
  const t = canvasTex(128, 128, (g, w, h) => {
    const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    gr.addColorStop(0, color); gr.addColorStop(0.25, color + 'cc'); gr.addColorStop(1, color + '00');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  });
  glowCache.set(color, t);
  return t;
}

export function glowSprite(color: string, size: number, opacity = 0.9): THREE.Sprite {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(color), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity }));
  s.scale.set(size, size, 1);
  return s;
}

const FONT = '"Baloo 2", "Trebuchet MS", system-ui, sans-serif';
export const font = (px: number, weight = 800) => `${weight} ${px}px ${FONT}`;

/** Lettre ou symbole brillant, comme une luciole. */
export function symbolTex(txt: string, color: string, bg = 'rgba(0,0,0,0)'): THREE.CanvasTexture {
  return canvasTex(128, 128, (g, w, h) => {
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    g.font = font(txt.length > 2 ? 52 : 86); g.textAlign = 'center'; g.textBaseline = 'middle';
    g.shadowColor = color; g.shadowBlur = 18; g.fillStyle = '#fff'; g.fillText(txt, w / 2, h / 2 + 6);
    g.shadowBlur = 0; g.lineWidth = 6; g.strokeStyle = color; g.strokeText(txt, w / 2, h / 2 + 6); g.fillText(txt, w / 2, h / 2 + 6);
  });
}

export function cubeFaceTex(txt: string, bg: string, fg: string): THREE.CanvasTexture {
  return canvasTex(128, 128, (g, w, h) => {
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    g.strokeStyle = fg; g.globalAlpha = 0.5; g.lineWidth = 8; g.strokeRect(6, 6, w - 12, h - 12); g.globalAlpha = 1;
    g.font = font(txt.length > 2 ? 54 : 88); g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = fg; g.fillText(txt, w / 2, h / 2 + 6);
  });
}

export function pageTex(): THREE.CanvasTexture {
  return canvasTex(256, 192, (g, w, h) => {
    g.fillStyle = '#fff6df'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#c2410c'; g.font = font(70); g.textAlign = 'left'; g.textBaseline = 'top'; g.fillText('Aa', 18, 8);
    g.fillStyle = '#8a7a5a'; for (let i = 0; i < 6; i++) g.fillRect(20, 92 + i * 15, i % 3 === 2 ? 130 : 210, 5);
    g.fillStyle = '#2f9e6a'; g.beginPath(); g.arc(205, 36, 18, 0, Math.PI * 2); g.fill();
  });
}

export function clockTex(): THREE.CanvasTexture {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#fffaf0'; g.beginPath(); g.arc(w / 2, h / 2, 120, 0, Math.PI * 2); g.fill();
    g.lineWidth = 12; g.strokeStyle = '#2b6cb0'; g.stroke();
    g.fillStyle = '#1e3a5f'; g.font = font(34); g.textAlign = 'center'; g.textBaseline = 'middle';
    for (let i = 1; i <= 12; i++) { const a = (i / 12) * Math.PI * 2 - Math.PI / 2; g.fillText(String(i), w / 2 + Math.cos(a) * 92, h / 2 + Math.sin(a) * 92 + 2); }
  });
}

export function rulerTex(): THREE.CanvasTexture {
  return canvasTex(512, 64, (g, w, h) => {
    g.fillStyle = '#ffd23f'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#5a3d00'; g.font = font(22); g.textAlign = 'center';
    for (let i = 0; i <= 20; i++) { const x = 12 + i * 24.4; const long = i % 2 === 0; g.fillRect(x - 1.5, 0, 3, long ? 26 : 14); if (long) g.fillText(String(i / 2), x, 52); }
  });
}

/** Étiquette flottante d'un royaume : nom + progression. */
export function labelTex(name: string, sub: string, color: string, locked = false): THREE.CanvasTexture {
  return canvasTex(512, 160, (g, w, h) => {
    const r = 44;
    g.fillStyle = 'rgba(14,8,50,.85)';
    g.beginPath(); g.moveTo(r, 8); g.arcTo(w - 8, 8, w - 8, h - 8, r); g.arcTo(w - 8, h - 8, 8, h - 8, r); g.arcTo(8, h - 8, 8, 8, r); g.arcTo(8, 8, w - 8, 8, r); g.closePath(); g.fill();
    g.lineWidth = 8; g.strokeStyle = color; g.stroke();
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#fff';
    let px = 52; g.font = font(px); while (g.measureText(name).width > w - 70 && px > 24) { px -= 2; g.font = font(px); }
    g.fillText(name, w / 2, sub ? 62 : 80);
    if (sub) { g.font = font(36, 700); g.fillStyle = locked ? '#bbb' : '#ffe27a'; g.fillText(sub, w / 2, 114); }
  });
}
