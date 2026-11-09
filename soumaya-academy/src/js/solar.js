// Système solaire animé (Observatoire) : rotation de la Terre sur son axe, révolution autour du Soleil, les 8 planètes.
import * as UI from './ui.js';
import { h } from './ui.js';
import * as Voice from './voice.js';
import * as Sfx from './sfx.js';

const PLANETS = [
  { n: 'Mercure', c: '#b9b2a8', r: 4, d: 0.16, p: 0.24, f: 'la planète la plus proche du Soleil et la plus petite.' },
  { n: 'Vénus', c: '#f1d38a', r: 6, d: 0.235, p: 0.62, f: 'la planète la plus chaude, cachée sous d’épais nuages.' },
  { n: 'Terre', c: '#3f8de0', r: 6.5, d: 0.31, p: 1, f: 'notre planète ! La seule où l’on connaît la vie. Elle tourne autour du Soleil en un an.' },
  { n: 'Mars', c: '#d8653b', r: 5, d: 0.385, p: 1.88, f: 'la planète rouge, couverte de poussière de fer rouillé.' },
  { n: 'Jupiter', c: '#d9b48a', r: 13, d: 0.53, p: 11.86, f: 'la plus grande planète du système solaire.', bands: true },
  { n: 'Saturne', c: '#e7cf8f', r: 11, d: 0.66, p: 29.46, f: 'célèbre pour ses magnifiques anneaux.', ring: true },
  { n: 'Uranus', c: '#9fe3e8', r: 8, d: 0.78, p: 84, f: 'une planète glacée qui tourne couchée sur le côté.' },
  { n: 'Neptune', c: '#4a6fe0', r: 8, d: 0.89, p: 164.8, f: 'la planète la plus lointaine, où soufflent des vents terribles.' },
];
// continents très simplifiés (latitude, longitude, demi-largeur en longitude, demi-hauteur en latitude), en degrés
const LANDS = [[52, 15, 20, 12], [8, 20, 20, 26], [-22, 25, 12, 14], [52, 95, 50, 16], [25, 78, 9, 12], [30, 105, 18, 12], [48, -100, 32, 18], [20, -100, 10, 9], [-12, -58, 17, 20], [-38, -66, 8, 14], [-25, 134, 17, 10], [74, -40, 14, 7], [-82, 0, 180, 7], [36, 138, 4, 8], [53, -2, 3, 5]];

export function open() {
  const cv = h('canvas', { class: 'sol-cv', width: 900, height: 620, role: 'img', 'aria-label': 'Animation du système solaire' });
  const info = h('div', { class: 'be-say sol-say', 'aria-live': 'polite' });
  let mode = 'rot', t = 0, last = performance.now(), raf = 0, speed = 1, sel = null;
  const talk = (s, v = true) => { info.textContent = s; if (v) Voice.speak(s); };
  const tabs = [['rot', '🌍 La Terre tourne sur elle-même'], ['rev', '☀️ La Terre tourne autour du Soleil'], ['sys', '🪐 Les 8 planètes']].map(([k, l]) => h('button', { class: 'btn small' + (k === mode ? ' primary' : ''), type: 'button', 'data-mode': k, onclick: () => setMode(k) }, l));
  const fast = h('button', { class: 'btn small ghost', type: 'button', onclick: () => { speed = speed === 1 ? 3 : 1; fast.textContent = speed === 1 ? '⏩ Plus vite' : '▶️ Normal'; } }, '⏩ Plus vite');
  function setMode(k) {
    mode = k; t = 0; sel = null; tabs.forEach((b) => b.classList.toggle('primary', b.dataset.mode === k)); Sfx.tap();
    if (k === 'rot') talk('La Terre tourne sur elle-même autour d’un axe un peu penché. Un tour complet dure un jour : 24 heures. Le côté éclairé par le Soleil, c’est le jour ; l’autre côté, c’est la nuit.');
    if (k === 'rev') talk('La Terre tourne aussi autour du Soleil : c’est la révolution. Un tour complet dure un an, environ 365 jours. Comme son axe reste penché dans la même direction, nous avons des saisons.');
    if (k === 'sys') talk('Voici les 8 planètes, de la plus proche à la plus lointaine du Soleil. Touche une planète pour la découvrir !');
  }
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height;
  const stars = Array.from({ length: 140 }, () => [Math.random() * W, Math.random() * H, Math.random() * 1.4 + 0.3, Math.random() * 6]);
  const sky = () => {
    const g = ctx.createRadialGradient(W * 0.5, H * 0.5, 40, W * 0.5, H * 0.5, W * 0.7); g.addColorStop(0, '#1c1650'); g.addColorStop(1, '#050414'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // galaxie spirale discrète
    ctx.save(); ctx.translate(W * 0.82, H * 0.2); ctx.rotate(t * 0.02); ctx.globalAlpha = 0.25;
    for (let i = 0; i < 160; i++) { const a = i * 0.25, rr = 4 + i * 0.55; ctx.fillStyle = i % 3 ? '#b9a7ff' : '#ffffff'; ctx.beginPath(); ctx.arc(Math.cos(a) * rr, Math.sin(a) * rr * 0.55, 1.2, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(-Math.cos(a) * rr, -Math.sin(a) * rr * 0.55, 1.2, 0, 7); ctx.fill(); }
    ctx.restore(); ctx.globalAlpha = 1;
    for (const [x, y, r, ph] of stars) { ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 2 + ph); ctx.fillStyle = '#fff'; ctx.fillRect(x, y, r, r); } ctx.globalAlpha = 1;
  };
  const sun = (x, y, r) => {
    const g = ctx.createRadialGradient(x, y, r * 0.2, x, y, r * 2.4); g.addColorStop(0, '#fff7c0'); g.addColorStop(0.35, '#ffcf3a'); g.addColorStop(0.5, '#ff9a1f88'); g.addColorStop(1, '#ff9a1f00');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 2.4, 0, 7); ctx.fill(); ctx.fillStyle = '#ffd84a'; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  };
  // Terre en projection orthographique : spin = angle de rotation, tilt = inclinaison de l'axe, light = direction du Soleil (radians, dans le plan de l'écran)
  const earth = (x, y, R, spin, tilt, light) => {
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, R, 0, 7); ctx.clip();
    ctx.fillStyle = '#2f76d6'; ctx.fillRect(x - R, y - R, 2 * R, 2 * R);
    ctx.fillStyle = '#5fbf5a';
    const ct = Math.cos(tilt), st = Math.sin(tilt), dot = Math.max(1.4, R * 3.2 * Math.PI / 180 * 0.78);
    for (let la = -86; la <= 86; la += 3.2) for (let lo = -180; lo < 180; lo += 3.2) {
      if (!LANDS.some(([a, b, dlo, dla]) => { let dl = ((lo - b + 540) % 360) - 180; return (dl / dlo) ** 2 + ((la - a) / dla) ** 2 <= 1; })) continue;
      const lat = la * Math.PI / 180, lon = lo * Math.PI / 180 + spin;
      const X = Math.cos(lat) * Math.sin(lon), Y = Math.sin(lat), Z = Math.cos(lat) * Math.cos(lon);
      if (Z <= 0) continue;
      const sx = X * ct + Y * st, sy = -(-X * st + Y * ct);
      ctx.beginPath(); ctx.arc(x + sx * R, y + sy * R, dot * (0.6 + 0.4 * Z), 0, 7); ctx.fill();
    }
    // nuit : moitié opposée au Soleil
    const lx = Math.cos(light), ly = Math.sin(light);
    const g = ctx.createLinearGradient(x + lx * R, y + ly * R, x - lx * R, y - ly * R); g.addColorStop(0, '#0000'); g.addColorStop(0.46, '#0000'); g.addColorStop(0.56, '#0008'); g.addColorStop(1, '#000a');
    ctx.fillStyle = g; ctx.fillRect(x - R, y - R, 2 * R, 2 * R); ctx.restore();
    ctx.strokeStyle = '#9fd0ff88'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, R, 0, 7); ctx.stroke();
    // axe de rotation penché
    ctx.strokeStyle = '#ffe893'; ctx.lineWidth = 3; ctx.setLineDash([8, 6]); ctx.beginPath(); ctx.moveTo(x + st * R * 1.35, y - ct * R * 1.35); ctx.lineTo(x - st * R * 1.35, y + ct * R * 1.35); ctx.stroke(); ctx.setLineDash([]);
  };
  const label = (s, x, y, col = '#fff6c8', sz = 18, al = 'center') => { ctx.font = `700 ${sz}px system-ui,sans-serif`; ctx.textAlign = al; ctx.lineWidth = 4; ctx.strokeStyle = '#0009'; ctx.strokeText(s, x, y); ctx.fillStyle = col; ctx.fillText(s, x, y); };
  const tilt = 23.5 * Math.PI / 180;
  let hits = [];
  function draw(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now; t += dt * speed; sky(); hits = [];
    if (mode === 'rot') {
      sun(70, H / 2, 46); label('Soleil', 70, H / 2 + 80);
      for (let i = 0; i < 5; i++) { ctx.strokeStyle = '#ffd84a33'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(150, H / 2 - 120 + i * 60); ctx.lineTo(W * 0.5, H / 2 - 120 + i * 60); ctx.stroke(); }
      const spin = t * 0.9; earth(W * 0.6, H / 2, 200, spin, tilt, Math.PI);
      label('☀️ JOUR', W * 0.6 - 120, H / 2 - 222, '#ffe893', 20); label('🌙 NUIT', W * 0.6 + 120, H / 2 - 252, '#b9c6ff', 20);
      label('axe de rotation (penché)', W * 0.6 + 175, 96, '#ffe893', 16);
      const hr = Math.floor(((spin / (Math.PI * 2)) * 24) % 24); label(`1 tour = 1 jour = 24 heures · ${String(hr).padStart(2, '0')} h`, W / 2, H - 22, '#fff', 20);
    } else if (mode === 'rev') {
      const cx = W / 2, cy = H / 2, A = 330, B = 200;
      ctx.strokeStyle = '#ffffff44'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(cx, cy, A, B, 0, 0, 7); ctx.stroke();
      sun(cx, cy, 38);
      const marks = [[0, '21 juin · été au nord'], [Math.PI / 2, '23 septembre · automne'], [Math.PI, '21 décembre · hiver au nord'], [Math.PI * 1.5, '21 mars · printemps']];
      for (const [a, s] of marks) { const mx = cx + Math.cos(a + Math.PI) * A, my = cy + Math.sin(a + Math.PI) * B; ctx.fillStyle = '#ffffff55'; ctx.beginPath(); ctx.arc(mx, my, 4, 0, 7); ctx.fill(); label(s, mx, my + (Math.sin(a + Math.PI) > 0.1 ? 34 : Math.sin(a + Math.PI) < -0.1 ? -26 : 34), '#cfe0ff', 14); }
      const ang = t * 0.35, ex = cx + Math.cos(ang + Math.PI) * A, ey = cy + Math.sin(ang + Math.PI) * B;
      earth(ex, ey, 30, t * 6, tilt, Math.atan2(cy - ey, cx - ex));
      const mo = t * 2.2; ctx.fillStyle = '#ddd'; ctx.beginPath(); ctx.arc(ex + Math.cos(mo) * 48, ey + Math.sin(mo) * 30, 6, 0, 7); ctx.fill();
      label('Terre', ex, ey - 44); label('Lune', ex + Math.cos(mo) * 48, ey + Math.sin(mo) * 30 + 22, '#ddd', 13);
      const day = Math.floor((((ang / (Math.PI * 2)) % 1) * 365 + 172) % 365) + 1;
      label(`1 tour = 1 an ≈ 365 jours · jour ${day}`, W / 2, H - 20, '#fff', 20);
    } else {
      const cx = W * 0.5, cy = H * 0.52, M = W * 0.47;
      sun(cx, cy, 26); hits.push({ x: cx, y: cy, r: 34, n: 'Soleil', f: 'une étoile, une énorme boule de gaz brûlant. Toutes les planètes tournent autour de lui.' });
      for (const p of PLANETS) {
        const a = M * p.d, b = a * 0.62, ang = t * 0.8 / Math.sqrt(p.p) + p.d * 9;
        ctx.strokeStyle = sel === p.n ? '#ffe89399' : '#ffffff2a'; ctx.lineWidth = sel === p.n ? 2.5 : 1.2; ctx.beginPath(); ctx.ellipse(cx, cy, a, b, 0, 0, 7); ctx.stroke();
        const x = cx + Math.cos(ang) * a, y = cy + Math.sin(ang) * b;
        if (p.ring) { ctx.strokeStyle = '#f3e2b0'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(x, y, p.r * 2, p.r * 0.7, -0.35, 0, 7); ctx.stroke(); }
        ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(x, y, p.r, 0, 7); ctx.fill();
        if (p.bands) { ctx.strokeStyle = '#a5784e'; ctx.lineWidth = 2; for (const k of [-0.4, 0.15, 0.5]) { ctx.beginPath(); ctx.moveTo(x - p.r * 0.95, y + k * p.r); ctx.lineTo(x + p.r * 0.95, y + k * p.r); ctx.stroke(); } }
        if (sel === p.n) { ctx.strokeStyle = '#ffe893'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, p.r + 7, 0, 7); ctx.stroke(); }
        label(p.n, x, y - p.r - 8, sel === p.n ? '#ffe893' : '#fff', 13);
        hits.push({ x, y, r: Math.max(16, p.r + 8), n: p.n, f: p.f });
      }
      label('Les tailles et les distances ne sont pas à l’échelle.', W / 2, H - 16, '#cfd6ff', 14);
    }
    raf = requestAnimationFrame(draw);
  }
  cv.addEventListener('click', (e) => {
    if (mode !== 'sys') return;
    const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) * W / r.width, y = (e.clientY - r.top) * H / r.height;
    const hit = hits.reduce((best, q) => { const d = Math.hypot(q.x - x, q.y - y); return d < q.r && (!best || d < best.d) ? { ...q, d } : best; }, null);
    if (hit) { sel = hit.n; Sfx.coin(); talk(`${hit.n} : ${hit.f}`); }
  });
  UI.openDialog(h('div', { class: 'panel be-panel' }, UI.closeButton(),
    h('h2', null, '🪐 La Terre et le système solaire'),
    h('div', { class: 'actions wrap' }, ...tabs, fast),
    h('div', { class: 'be-wrap sol-wrap' }, cv, info)), { label: 'Système solaire', onClose: () => cancelAnimationFrame(raf) });
  setMode('rot'); raf = requestAnimationFrame(draw);
}
