// Rendu 2.5D d'une salle : décor panoramique à caméra, zones interactives, Muezza animée en profondeur,
// particules et lumière en parallaxe. Un seul acteur, jamais dupliqué.
import * as Mimi from './mimi.js';
import { asset } from './asset.js';
import * as Sfx from './sfx.js';
import * as Voice from './voice.js';
import { mountRoom as mountClock, grimoireAwake } from './horloge.js';
import { mountValley } from './eau.js';
import { mountForest } from './soleil.js';
import { SCENES } from './scenes.js';
import * as H3 from './hero3d.js';
import * as S3 from './stage3d.js';
const INTRO_SEEN = new Set();
const POSES = ['repos', 'pas_gauche', 'pas_droit', 'bond', 'joie', 'dort', 'assis', 'toilette'];
// Maissa : poses illustrées (assets/sprites/soumaya). Marche = 4 images, vues de profil tournées vers la droite.
const HPOSES = ['face', 'trois_quarts', 'profil_droite', 'marche_1', 'marche_2', 'marche_3', 'marche_4', 'marche_5', 'marche_6', 'marche_7', 'marche_8', 'joie', 'oups', 'bravo', 'reflexion', 'lecture', 'ecoute', 'ecrit', 'coffre', 'assise', 'salut', 'monte_1', 'monte_2', 'remue_1', 'remue_2', 'assis_tab', 'geste_1', 'geste_2', 'dos', 'saut_ouvert', 'saut_joint'];
const heroUrl = (p) => asset(`assets/sprites/soumaya/${p}.webp`);
const WALK = ['marche_1', 'marche_2', 'marche_3', 'marche_4', 'marche_5', 'marche_6', 'marche_7', 'marche_8'];

// ordre du parcours des mondes (cercle « Monde suivant ») ; on saute les salles absentes de ce jeu et on reboucle au début
const WORLD_ORDER = ['hall', 'biblio', 'ocean', 'foret', 'atelier', 'corps', 'nombres', 'archives', 'observatoire', 'theatre', 'tour', 'vivant', 'donnees', 'village', 'vallee', 'galerie', 'miroirs', 'etats', 'gare', 'neerlandais', 'anglais', 'philo', 'bouclier', 'poemes'];
function nextWorld(id) {
  const list = WORLD_ORDER.filter((k) => SCENES[k]);
  const i = list.indexOf(id);
  const n = list[(i < 0 ? 0 : i + 1) % list.length];
  return n && n !== id ? { id: n, title: SCENES[n].title } : null;
}

export class Room {
  constructor(root, def, opts = {}) {
    this.root = root;
    this.def = def;
    this.opts = opts;
    this.destroyed = false;
    this.pos = def.start ? { ...def.start } : { x: 0.5, y: 0.9 };
    this.mpos = { x: this.pos.x - 0.08, y: Math.min(0.98, this.pos.y + 0.012) }; // Muezza suit Maissa
    this.hpose = 'trois_quarts'; this.hfacing = 1; this.mimiMoving = false; this.mwalkT = 0;
    this.target = null;
    this.pending = null;
    this.facing = 1;
    this.pose = 'repos';
    this.walkT = 0;
    this.cam = { fx: 0.5, fy: 0.5, ox: 0, oy: 0 };
    this.motion = opts.motion !== false && !matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.tilt = { x: 0, y: 0 };
    this.last = performance.now();
    this.lastAct = this.last; this.nextIdle = this.last + 5000 + Math.random() * 4000; this.sleeping = false; this.trickT = null;
    this.build();
    if (this.def.rain && this.motion !== false && !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) this.startRain(this.def.rain);
    // petit salut de Maissa à l'arrivée dans la pièce
    this.hposeT = setTimeout(() => { if (!this.destroyed && !this.target && this.hsprite && this.motion !== false && !this.anim) { this.heroPose('face', 2200); this.hsay(['Waouh, c’est trop beau !', 'Ouah, c’est magnifique ici !', 'Waouh !'][Math.floor(Math.random() * 3)], 2200); } }, 1700);
    this.resize = this.resize.bind(this);
    this.tick = this.tick.bind(this);
    window.addEventListener('resize', this.resize);
    this.ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(this.resize) : null;
    this.ro && this.ro.observe(root);
    this.resize();
    if (this.def.critter && this.motion && this.hero) this.critterT = setTimeout(() => this.critterGo(), this.def.critter.delay || 2600);
    // petite scène d'arrivée (une fois par session), ex. la Salle des Nombres : elle court regarder par la fenêtre
    if (this.def.intro && this.motion && this.hero && !INTRO_SEEN.has(this.def.id) && !(this.def.id === 'hall' && location.search.indexOf('qa=1') >= 0)) this.introT = setTimeout(() => {
      if (this.destroyed || this.anim || this.target || document.querySelector('.dlg-wrap')) return;
      INTRO_SEEN.add(this.def.id); const a = { ...this.def.intro, intro: true };
      this.doAction(a, () => this.opts.onActivity && 0);
    }, this.def.intro.delay || 4000);
    this.raf = requestAnimationFrame(this.tick);
    // arrivée par un passage magique : Maissa « sort » de la lumière
    if (this.opts.arrive && this.hero) { this.root.classList.add('arrive', 'ak-' + this.opts.arrive); setTimeout(() => { if (!this.destroyed) { this.puff(this.pos.x, this.pos.y - 0.2, '✨', 8); } }, 200); setTimeout(() => { if (!this.destroyed) this.root.classList.remove('arrive'); }, 1600); }
    // passage déjà ouvert à l'arrivée : il brille et une traînée d'étoiles y mène
    if (this.passEl && this.opts.passOpen) { this.passEl.classList.add('opened'); }
  }

  build() {
    const d = this.def;
    this.root.innerHTML = '';
    [...this.root.classList].filter((c) => /^(passing|arrive|pk-|ak-)/.test(c)).forEach((c) => this.root.classList.remove(c));
    this.root.dataset.scene = d.id;
    const wrap = el('div', 'room');
    if (d.fit === 'contain') {
      this.blur = el('img', 'bgblur'); this.blur.src = d.img; this.blur.alt = ''; this.blur.setAttribute('aria-hidden', 'true');
      wrap.append(this.blur);
    }
    this.world = el('div', 'world');
    this.img = el('img', 'bg');
    this.img.src = d.img; this.img.alt = ''; this.img.draggable = false;
    this.world.append(this.img);
    if (d.falls) {
      // cascade animée (eau qui tombe + écume) et bruit de chute d'eau
      for (const f of d.falls) {
        const w = el('div', 'fall'); w.setAttribute('aria-hidden', 'true');
        w.style.cssText = `left:${f.x * 100}%;top:${f.y * 100}%;width:${f.w * 100}%;height:${f.h * 100}%`;
        w.innerHTML = '<i class="fall-water"></i><i class="fall-water b"></i><i class="fall-foam"></i>';
        this.world.append(w);
      }
      const startW = () => { if (!this.destroyed && !this.stopWater) this.stopWater = Sfx.water(); };
      if (this.motion !== false) { startW(); this.waterArm = () => startW(); window.addEventListener('pointerdown', this.waterArm, { once: true }); }
    }
    if (d.fallMask) {
      // grande cascade : l'eau du décor s'anime (masque en forme de chute), brume, gouttelettes et bruit de chute
      const f = d.fallMask, w = el('div', 'fallm'); w.setAttribute('aria-hidden', 'true');
      w.style.cssText = `left:${f.x * 100}%;top:${f.y * 100}%;width:${f.w * 100}%;height:${f.h * 100}%;--m:url("${f.src}")`;
      w.innerHTML = '<i class="fm-flow"></i><i class="fm-flow b"></i><i class="fm-glint"></i>' + (f.mist || []).map(([x, y, r], k) => `<b class="fm-mist" style="left:${x * 100}%;top:${y * 100}%;width:${r * 100}%;animation-delay:-${k * 0.9}s"></b>`).join('');
      this.world.append(w);
      const startW = () => { if (!this.destroyed && !this.stopWater) this.stopWater = Sfx.water(f.vol || 0.16, true); };
      if (this.motion !== false) { startW(); this.waterArm = () => startW(); window.addEventListener('pointerdown', this.waterArm, { once: true }); }
    }
    if (d.bigClock) this.stopClock = mountClock(this.world, d, this);
    if (d.butterflies && this.motion !== false) this.mkButterflies(d.butterflies);
    if (d.valleyFx) this.stopValley = mountValley(this.world, this);
    if (d.sunFx) this.stopSun = mountForest(this.world, this);
    if (d.anims) for (const A of d.anims) {
      // dessins animés posés dans le décor (ex. : constellations qui bougent dans le ciel de l'observatoire)
      const w = el('div', 'anim-ov ' + (A.cls || '')); w.setAttribute('aria-hidden', 'true');
      w.style.cssText = `left:${A.x * 100}%;top:${A.y * 100}%;width:${A.w * 100}%;height:${A.h * 100}%`;
      const im = el('img'); im.src = asset(A.img); im.alt = ''; im.draggable = false; w.append(im); this.world.append(w);
    }
    document.addEventListener('grimoire:awake', this.onGrim = () => { const hs = this.hotspots && this.hotspots.find((x) => x.def.needs === 'grimoire'); if (hs) { hs.el.hidden = false; this.hsRelayed = false; this.layoutHotspots(); } });
    if (d.orrery) {
      // petit système solaire animé dans la voûte (décor)
      const o = el('div', 'orrery'); o.setAttribute('aria-hidden', 'true'); o.style.cssText = `left:${d.orrery.x * 100}%;top:${d.orrery.y * 100}%;width:${d.orrery.r * 200}%`;
      o.innerHTML = '<i class="o-sun"></i>' + [['#c9c2b8', 0.26, 2.6, 2.4], ['#f6dc95', 0.38, 3.4, 4], ['#4f9bf0', 0.5, 3.6, 6], ['#e8754b', 0.62, 3, 9], ['#e9c49a', 0.78, 6, 16], ['#f0d99a', 0.94, 5, 24]].map(([c, r, s, p], k) => `<b style="--r:${r};--p:${p}s;animation-delay:-${k * 1.7}s"><i class="${k === 5 ? 'ring' : ''}" style="background:${c};width:${s / r}%"></i></b>`).join('');
      this.world.append(o); this.orreryEl = o;
    }
    // éléments du décor qui tournent (ex. : ailes du moulin)
    if (d.spin) (Array.isArray(d.spin) ? d.spin : [d.spin]).forEach((sp) => { const im = el('img', 'spin-fx'); im.src = asset(sp.src); im.alt = ''; im.draggable = false; im.setAttribute('aria-hidden', 'true'); im.style.cssText = `left:${sp.x * 100}%;top:${sp.y * 100}%;width:${sp.w * 100}%;animation-duration:${sp.dur || 9}s`; this.world.append(im); });
    if (d.overlay) { const ov = el('img', 'sky-ov'); ov.src = d.overlay; ov.alt = ''; ov.draggable = false; ov.setAttribute('aria-hidden', 'true'); this.world.append(ov); }

    this.hsLayer = el('div', 'hotspots');
    this.world.append(this.hsLayer);
    const wrapLater = [];
    const isMap = (h) => h.act && h.act.type === 'go' && h.act.scene === 'map';
    let defs = d.id === 'map' || d.fit === 'contain' || d.hotspots.some(isMap) ? [...d.hotspots] : [...d.hotspots, { id: d.id + '-carte', label: 'Carte des mondes', icon: '🗺️', x: 0.5, y: 0.92, act: { type: 'go', scene: 'map' } }];
    if (d.id !== 'map' && d.fit !== 'contain') defs.push({ id: d.id + '-surprise', label: 'Salle surprise', icon: '🎲', fixed2: true, act: { type: 'go', scene: 'random' } });
    // cercle « Monde suivant » : dans toutes les salles, on peut passer au monde suivant du parcours
    const nxt = d.id !== 'map' && d.fit !== 'contain' ? nextWorld(d.id) : null;
    if (nxt) defs.push({ id: d.id + '-suivant', label: 'Monde suivant : ' + nxt.title, icon: '➡️', fixed4: true, act: { type: 'go', scene: nxt.id } });
    if (this.opts.back && d.id !== 'map' && d.fit !== 'contain') defs.push({ id: d.id + '-retour', label: 'Retour', icon: this.opts.back.icon, fixed3: true, act: { type: 'go', scene: this.opts.back.scene, back: true } });
    this.hotspots = defs.map((h) => {
      const b = el('button', 'hotspot');
      b.type = 'button';
      b.dataset.id = h.id;
      if (h.cls) b.classList.add(h.cls);
      if (h.needs === 'grimoire' && !grimoireAwake()) b.hidden = true;
      b.setAttribute('aria-label', h.label);
      b.innerHTML = `<span class="hs-ring"></span><span class="hs-icon" aria-hidden="true">${h.icon}</span><span class="hs-label">${h.label}</span><span class="hs-meta"></span>`;
      if (d.labelAlways) b.classList.add('always');
      b.addEventListener('click', (e) => { e.stopPropagation(); Sfx.tap(); this.activate(h); });
      // la carte des mondes : toujours au même endroit (en bas à gauche de l'écran), dans toutes les salles
      const fixed = !!(h.fixed2 || h.fixed3 || h.fixed4 || (h.act && h.act.type === 'go' && h.act.scene === 'map'));
      if (fixed) { b.classList.add(h.fixed2 ? 'hs-fixed2' : h.fixed3 ? 'hs-fixed3' : h.fixed4 ? 'hs-fixed4' : 'hs-fixed', 'hs-fixed', 'always'); if (h.fixed4) b.querySelector('.hs-label').textContent = 'Monde suivant'; if (!h.fixed2 && !h.fixed3 && !h.fixed4) b.querySelector('.hs-label').textContent = 'Carte'; wrapLater.push(b); } else this.hsLayer.append(b);
      if (h.act && h.act.type === 'passage') { b.classList.toggle('locked', !this.opts.passOpen); b.insertAdjacentHTML('beforeend', '<span class="hs-lock" aria-hidden="true">🔒</span>'); this.passEl = b; this.passDef = h; }
      return { def: h, el: b, fixed };
    });

    if (d.actor !== false) {
      this.hero = el('div', 'hero');
      this.hshadow = el('div', 'hshadow');
      this.hsprite = el('img', 'hsprite');
      this.hsprite.alt = ''; this.hsprite.draggable = false; this.hsprite.src = heroUrl('trois_quarts');
      this.hero.setAttribute('aria-hidden', 'true');
      this.hero.append(this.hshadow, this.hsprite);
      if (d.stardust) { const st = el('span', 'hstar'); st.setAttribute('aria-hidden', 'true'); this.hero.append(st); }
      this.world.append(this.hero);
      this.h3 = false;
      this.hx = H3;
      const fallback3d = () => { if (this.opts.hero3d !== false) H3.load().then((okk) => { if (okk && !this.destroyed && !this.st) this.enable3d(); }); };
      if (this.opts.hero3d !== false && S3.stageSupported(d.id)) {
        const start = () => S3.load(d.id, this.img).then((stg) => { if (this.destroyed) { stg && stg.dispose(); return; } if (stg) this.enableStage(stg); else fallback3d(); });
        if (this.img.complete && this.img.naturalWidth) start(); else this.img.addEventListener('load', start, { once: true });
      } else fallback3d();
      this.actor = el('div', 'actor');
      this.shadow = el('div', 'shadow');
      this.sprite = el('img', 'sprite');
      this.sprite.alt = '';
      this.sprite.draggable = false;
      this.sprite.src = Mimi.spriteUrl('repos');
      this.actor.setAttribute('role', 'button'); this.actor.tabIndex = 0;
      this.actor.setAttribute('aria-label', 'Muezza, le petit chat. Touche-la pour la câliner.');
      this.actor.append(this.shadow, this.sprite);
      this.world.append(this.actor);
      this.actor.addEventListener('pointerdown', (e) => e.stopPropagation());
      this.actor.addEventListener('click', (e) => { e.stopPropagation(); this.petMimi(); });
      this.actor.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.petMimi(); } });
      this.onMimiChange = () => { this.refreshSprite(); this.kittyCheck(); };
      document.addEventListener('mimi:changed', this.onMimiChange);
      this.preload();
    }
    this.fx = el('canvas', 'fx');
    this.fx.setAttribute('aria-hidden', 'true');
    this.rays = el('div', 'rays');
    this.fore = el('div', 'fore');
    this.vign = el('div', 'vignette');
    wrap.append(this.world, this.rays, this.fx, this.fore, this.vign, ...wrapLater);
    this.root.append(wrap);
    this.wrap = wrap;

    // toucher sur le sol = déplacement ; glisser = regarder autour (utile sur écran étroit)
    let drag = null;
    this.world.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.hotspot')) return;
      drag = { x: e.clientX, y: e.clientY, ox: this.camNow ? this.camNow.ox : 0, oy: this.camNow ? this.camNow.oy : 0, moved: false, id: e.pointerId };
    });
    window.addEventListener('pointermove', this.onDrag = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.moved && Math.hypot(dx, dy) > 10) drag.moved = true;
      if (drag.moved) { this.manual = { ox: clamp(drag.ox + dx, this.W - this.iw, 0), oy: this.def.fit === 'contain' ? drag.oy : clamp(drag.oy + dy, this.H - this.ih, 0), until: performance.now() + (this.def.fit === 'contain' && this.iw > this.W ? 1e12 : 5000) }; }
    });
    window.addEventListener('pointerup', this.onUp = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag; drag = null;
      if (d.moved || !this.actor) return;
      const r = this.world.getBoundingClientRect();
      this.manual = null;
      this.moveTo((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
    });
    window.addEventListener('pointercancel', this.onCancel = () => { drag = null; });
    if (this.motion) {
      window.addEventListener('pointermove', this.onMove = (e) => {
        if (e.pointerType === 'touch') return;
        this.tilt.x = (e.clientX / innerWidth - 0.5); this.tilt.y = (e.clientY / innerHeight - 0.5);
      });
    }
    this.edges = this.hotspots.map((hs) => {
      const b = el('button', 'edge');
      b.type = 'button'; b.hidden = true;
      b.setAttribute('aria-label', hs.def.label + ' (hors de vue)');
      b.innerHTML = `<span class="ei">${hs.def.icon}</span><span class="ea">›</span>`;
      b.addEventListener('click', () => this.activate(hs.def));
      wrap.append(b);
      return b;
    });
    this.initParticles();
  }

  updateEdges() {
    if (!this.edges || !this.camNow) return;
    const { ox, oy } = this.camNow, m = 26;
    const placed = [], busy = [];
    // les ronds visibles (et leurs étiquettes) sont des obstacles pour les indicateurs de bord
    this.hotspots.forEach((hs) => {
      if (hs.fixed || hs.el.hidden) return;
      const px = (parseFloat(hs.el.style.left) || hs.def.x * this.iw) + ox, py = (parseFloat(hs.el.style.top) || hs.def.y * this.ih) + oy;
      if (px < 44 || px > this.W - 44 || py < 62 || py > this.H - m) return;
      busy.push([px - 34, py - 34, 68, 68]);
      const lw = hs.lw || 120, sd = hs.side || 'b';
      busy.push(sd === 'r' ? [px + 28, py - 14, lw, 28] : sd === 'l' ? [px - 28 - lw, py - 14, lw, 28] : sd === 't' ? [px - lw / 2, py - 60, lw, 28] : [px - lw / 2, py + 30, lw, 28]);
    });
    const hit = (cx, cy) => placed.some((q) => Math.hypot(q.x - cx, q.y - cy) < 56) || busy.some(([rx, ry, rw, rh]) => cx + 26 > rx && cx - 26 < rx + rw && cy + 26 > ry && cy - 26 < ry + rh);
    this.hotspots.forEach((hs, i) => {
      if (hs.fixed || hs.el.hidden) { this.edges[i].hidden = true; return; }
      const x = hs.def.x * this.iw + ox, y = hs.def.y * this.ih + oy;
      const out = x < 44 || x > this.W - 44 || y < 62 || y > this.H - m;
      const b = this.edges[i];
      b.hidden = !out;
      hs.el.style.visibility = out ? 'hidden' : '';
      // l'étiquette ne doit jamais sortir de l'écran quand la caméra glisse : on la décale horizontalement
      if (!out && hs.lw) { const sd = hs.side || 'b', lw = hs.lw; const l = sd === 'r' ? x + 28 : sd === 'l' ? x - 28 - lw : x - lw / 2;
        const sh = Math.max(0, 6 - l) - Math.max(0, l + lw - (this.W - 6)); const v = Math.round(sh) + 'px';
        if (hs.lx !== v) { hs.lx = v; const lab = hs.el.querySelector('.hs-label'); if (lab) lab.style.translate = sh ? v + ' 0' : ''; } }
      if (out) {
        // le coin bas-gauche est réservé à la carte des mondes
        const maxY = x < this.W / 2 ? this.H - 150 : this.H - 36, maxX = this.W - 30, minX = y > this.H - 160 ? 190 : 30;
        let cx = clamp(x, minX, maxX), cy = clamp(y, 76, maxY);
        // évite que deux indicateurs se superposent : on les écarte le long du bord (vers le bas puis vers le haut)
        const onSide = cx <= minX || cx >= maxX, c0 = { x: cx, y: cy };
        for (let k = 1; k < 24 && hit(cx, cy); k++) {
          const off = Math.ceil(k / 2) * 30 * (k % 2 ? 1 : -1);
          if (onSide) cy = clamp(c0.y + off, 76, maxY); else cx = clamp(c0.x + off, minX, maxX);
        }
        placed.push({ x: cx, y: cy });
        b.style.left = cx + 'px'; b.style.top = cy + 'px';
        const ang = Math.atan2(y - cy, x - cx);
        b.querySelector('.ea').style.transform = `rotate(${(ang * 180 / Math.PI).toFixed(0)}deg)`;
      }
    });
  }

  resize() {
    if (this.destroyed) return;
    const W = this.root.clientWidth || innerWidth, H = this.root.clientHeight || innerHeight;
    const ar = this.def.ar;
    // « cover » : l'illustration remplit toujours l'écran, la caméra se déplace dans le surplus
    const contain = this.def.fit === 'contain';
    const top = contain ? 56 : 0; // la carte entière reste visible sous la barre du haut
    let w = contain ? Math.min(W, (H - top) * ar) : Math.max(W, H * ar), h = w / ar;
    // carte : sur écran étroit, on agrandit (au moins minH de la hauteur) et on fait glisser horizontalement
    if (contain && this.def.minH && h < (H - top) * this.def.minH) { h = (H - top) * this.def.minH; w = h * ar; }
    const zoom = contain ? 1 : 1.04;
    w *= zoom; h *= zoom;
    this.W = W; this.H = H; this.iw = w; this.ih = h;
    this.world.style.width = w + 'px';
    this.world.style.height = h + 'px';
    const q = Math.min(1, 560 / W); this.fx.width = Math.round(W * q); this.fx.height = Math.round(H * q); this.fxScale = q; this.glow = null;
    this.layoutHotspots();
    this.layoutActor();
    this.updateCamera(true);
  }

  layoutHotspots() {
    // Placement sans chevauchement : 1) on écarte les ronds trop proches ; 2) chaque étiquette choisit le côté libre
    // (dessous, dessus, droite, gauche) ; 3) s'il reste un conflit, on écarte encore les ronds concernés, puis en dernier
    // recours l'étiquette passe en format compact (deux lignes, plus petite).
    const L = this.hotspots.filter(({ el: b, fixed }) => !fixed && !b.hidden && b.style.display !== 'none');
    const R = 30, MIN = 74, CAP = this.def.fit === 'contain' ? 60 : 100;
    const P = L.map(({ def }) => ({ x0: def.x * this.iw, y0: def.y * this.ih, x: def.x * this.iw, y: def.y * this.ih }));
    const capIt = (p) => { const ox = p.x - p.x0, oy = p.y - p.y0, m = Math.hypot(ox, oy); if (m > CAP) { p.x = p.x0 + ox * CAP / m; p.y = p.y0 + oy * CAP / m; } p.x = clamp(p.x, 34, this.iw - 34); p.y = clamp(p.y, 46, this.ih - 34); };
    const relax = () => { for (let it = 0; it < 40; it++) { let moved = false;
      for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) {
        const a = P[i], b = P[j]; let dx = b.x - a.x, dy = b.y - a.y; const d = Math.hypot(dx, dy);
        if (d >= MIN) continue; if (d < 0.01) { dx = 1; dy = 0; } const k = (MIN - d) / 2 / (d || 1);
        a.x -= dx * k; a.y -= dy * k; b.x += dx * k; b.y += dy * k; moved = true;
      }
      P.forEach(capIt); if (!moved) break; } };
    const compact = L.map(({ el: b }) => b.classList.contains('compact'));
    const lsize = (i) => { const s = L[i].el.querySelector('.hs-label'); const w = (s && s.offsetWidth) || L[i].def.label.length * 7.4 + 24; return compact[i] ? [Math.min(w, 124), 34] : [Math.min(w, this.W * 0.6), 26]; };
    const xMax = Math.min(this.iw, this.W) - 6; // l'étiquette sera recalée à l'écran (cf. updateEdges) : on simule ce décalage
    const rect0 = (p, [w, lh], side) => side === 'b' ? [p.x - w / 2, p.y + 30, w, lh] : side === 't' ? [p.x - w / 2, p.y - 30 - lh, w, lh] : side === 'r' ? [p.x + 28, p.y - lh / 2, w, lh] : [p.x - 28 - w, p.y - lh / 2, w, lh];
    const rectOf = (p, sz, side) => { const r = rect0(p, sz, side); if (this.iw <= this.W + 1) r[0] = clamp(r[0], 6, xMax - r[2]); return r; };
    const ov = (a, b) => Math.max(0, Math.min(a[0] + a[2], b[0] + b[2]) - Math.max(a[0], b[0])) * Math.max(0, Math.min(a[1] + a[3], b[1] + b[3]) - Math.max(a[1], b[1]));
    let side = [], rects = [];
    const assign = () => {
      const circles = P.map((p) => [p.x - R, p.y - R, R * 2, R * 2]);
      const placed = [], order = P.map((p, i) => i).sort((i, j) => P[i].y - P[j].y); side = []; rects = [];
      for (const i of order) {
        const sz = lsize(i); let best = 'b', bestS = Infinity;
        for (const [sd, bias] of [['b', 0], ['t', 90], ['r', 160], ['l', 160]]) {
          const r = rectOf(P[i], sz, sd); let sc = bias;
          circles.forEach((c, j) => { if (j !== i) sc += ov(r, c) * 4; });
          placed.forEach((q) => { sc += ov(r, q.r) * 4; });
          if (r[1] < 46 || r[1] + r[3] > this.ih - 4 || r[0] < 2 || r[0] + r[2] > this.iw - 2) sc += 5000;
          if (sc < bestS) { bestS = sc; best = sd; }
        }
        side[i] = best; rects[i] = rectOf(P[i], sz, best); placed.push({ i, r: rects[i] });
      }
      return circles;
    };
    const conflicts = (circles) => { const out = [];
      for (let i = 0; i < P.length; i++) for (let j = 0; j < P.length; j++) { if (i === j) continue;
        if (ov(rects[i], circles[j]) > 60) out.push([i, j]);
        if (j > i && ov(rects[i], rects[j]) > 60) out.push([i, j]); }
      return out; };
    relax();
    for (let round = 0; round < 14; round++) {
      const c = conflicts(assign()); if (!c.length) break;
      for (const [i, j] of c) { const a = P[i], b = P[j]; let dx = b.x - a.x, dy = b.y - a.y; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d; a.x -= dx * 12; a.y -= dy * 12; b.x += dx * 12; b.y += dy * 12; capIt(a); capIt(b); }
      if (round === 4 || round === 9) c.forEach(([i, j]) => { compact[i] = true; if (round === 9) compact[j] = true; });
    }
    assign();
    L.forEach(({ el: b }, i) => {
      b.style.left = P[i].x + 'px'; b.style.top = P[i].y + 'px'; b.classList.toggle('compact', !!compact[i]);
      for (const sd of ['b', 't', 'r', 'l']) b.classList.toggle('p-' + sd, side[i] === sd && sd !== 'b');
      L[i].side = side[i]; L[i].lw = rects[i][2]; L[i].lx = null;
    });
    if (!this.hsRelayT && !this.hsRelayed) this.hsRelayT = setTimeout(() => { this.hsRelayT = 0; if (!this.destroyed && this.iw) { this.hsRelayed = true; this.layoutHotspots(); } }, 400);
  }

  scaleAt(y) {
    const w = this.def.walk || {};
    // perspective : la taille diminue en s'approchant de la ligne d'horizon du décor
    if (w.yh != null) return Math.max(0.2, ((y - w.yh) / (0.88 - w.yh)) * 0.96);
    const { y0, y1 } = this.def.walk || { y0: 0.8, y1: 0.97 };
    const t = Math.max(0, Math.min(1, (y - y0) / Math.max(0.001, y1 - y0)));
    return 0.72 + 0.42 * t; // plus loin = plus petit
  }

  layoutActor() {
    if (!this.actor) return;
    const base = (this.def.mimiBase || 0.2) * Math.min(this.iw, this.ih * 1.15) * 0.82;
    const s = this.mScaleOv || this.scaleAt(this.mpos.y);
    this.actor.style.width = base * s + 'px';
    this.actor.style.left = this.mpos.x * this.iw + 'px';
    this.actor.style.top = this.mpos.y * this.ih + 'px';
    this.actor.style.zIndex = String(Math.round(this.mpos.y * 100));
    this.sprite.style.transform = `scaleX(${this.facing})`;
    this.layoutHero();
  }

  layoutHero() {
    if (!this.hero) return;
    const hs = this.hscaleOv != null ? this.hscaleOv : this.scaleAt(this.pos.y);
    // la hauteur de Maissa suit la hauteur de l'illustration (et non la largeur) pour rester lisible partout
    const h = (this.def.heroH || 0.34) * Math.min(this.ih, this.iw / 1.2) * hs;
    this.hero.style.height = h + 'px';
    this.hero.style.width = h * (520 / 640) + 'px';
    this.hero.style.left = this.pos.x * this.iw + 'px';
    this.hero.style.top = this.pos.y * this.ih + 'px';
    this.hero.style.zIndex = String(Math.round(this.pos.y * 100) + 1);
    this.hsprite.style.transform = `scaleX(${this.hfacing})`;
  }

  heroPose(p, ms = 0) {
    this.showPose(p);
    clearTimeout(this.hposeT);
    if (ms) this.hposeT = setTimeout(() => { if (!this.destroyed && !this.target) this.heroPose('trois_quarts'); }, ms);
  }

  // affiche une pose : modèle 3D animé si disponible, sinon illustration
  showPose(p) {
    this.hpose = p;
    if (this.h3) {
      this.hx.playPose(p);
      if (!/^(marche|monte)/.test(p)) this.hx.setYaw(p === 'face' || p === 'salut' || p === 'joie' || p === 'bravo' ? 0.05 : 0.38);
    } else if (this.hsprite) this.hsprite.src = heroUrl(p);
  }

  // salle entièrement en 3D : géométrie réelle + Maissa dans la même scène
  enableStage(stg) {
    this.hx = stg; this.st = true; this.h3 = true;
    stg.canvas.className = 'stage3d'; this.world.insertBefore(stg.canvas, this.hsLayer);
    this.hero.classList.add('instage'); this.root.classList.add('is-stage');
    stg.setFloor(this.pos.x, this.pos.y); stg.setVisible(true); this.showPose(this.hpose || 'trois_quarts');
    this.kittyCheck(); stg.render();
  }
  // Muezza est dessinée partout (pelage tigré d'après les photos ; l'ancien modèle 3D était noir)
  kittyCheck() {
    if (!this.st || !this.actor) return;
    const m = Mimi.state(), ok = false && !!this.hx.kitty;
    this.k3 = ok; this.actor.classList.toggle('mimi3d', ok); this.hx.mimiVisible(ok);
    if (ok) { this.hx.kitty.setBow(m.bow || 'rose'); this.hx.mimiFloor(this.mpos.x, this.mpos.y); }
  }
  syncKitty() {
    const A = this.anim, hx = this.hx;
    if (A && A.kind === 'climb' && A.s3 && A.s3 !== 'ladder' && hx.pathK != null) {
      const lag = 0.13; const k = A.phase === 'up' ? hx.pathK - lag : A.phase === 'top' ? 1 - lag : A.phase === 'down' ? hx.pathK + lag : null;
      if (k != null) { hx.mimiPath(A.s3, k); hx.mimiState({ pose: '', sleeping: false, yaw: null }); const sp = hx.mimiScreen(); if (sp) { this.mpos = { x: sp.x, y: sp.y }; this.layoutActor(); } return; }
    }
    hx.mimiFloor(this.mpos.x, this.mpos.y); hx.mimiState({ pose: this.pose, sleeping: this.sleeping, yaw: this.facing > 0 ? 0.9 : -0.9 });
  }

  enable3d() {
    const c = this.hx.canvas(); if (!c || !this.hero) return;
    this.hero.classList.add('is3d'); this.hero.insertBefore(c, this.hsprite);
    this.hx.tint(this.def.tint); this.hx.setVisible(true); this.h3 = true;
    this.showPose(this.hpose || 'trois_quarts');
  }

  clampWalk(x, y) {
    const w = this.def.walk || { x0: 0.1, x1: 0.9, y0: 0.8, y1: 0.97 };
    const cy = Math.max(w.y0, Math.min(w.y1, y)), t = w.fx0 != null ? Math.max(0, Math.min(1, (cy - w.y0) / Math.max(0.001, 0.86 - w.y0))) : 1;
    const x0 = w.fx0 != null ? w.fx0 + (w.x0 - w.fx0) * t : w.x0, x1 = w.fx1 != null ? w.fx1 + (w.x1 - w.fx1) * t : w.x1;
    return { x: Math.max(x0, Math.min(x1, x)), y: cy };
  }

  moveTo(x, y, then) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) { if (then) then(); return; }
    if (this.anim && this.anim.a && this.anim.a.intro) this.endAction();
    if (this.anim) return;
    if (!this.actor) { if (then) then(); return; }
    this.wake(true); this.touch();
    this.target = this.clampWalk(x, y);
    this.manual = null;
    this.pending = then || null;
    this.root.dispatchEvent(new CustomEvent('room:walk', { detail: this.target }));
  }

  activate(h) {
    clearTimeout(this.introT); // l'enfant a choisi quelque chose : pas de scène d'arrivée automatique par-dessus
    if (this.anim && this.anim.a && this.anim.a.intro) this.endAction();
    if (this.anim) return;
    // bouton ↩ Retour (fixe, sans position dans le décor) : petit geste puis retour immédiat
    if (h.fixed4) { if (this.hero && this.motion) { this.heroPose('joie', 1200); this.puff(this.pos.x, this.pos.y - 0.22, '✨', 2); } Sfx.coin(); clearTimeout(this.goT); this.goT = setTimeout(() => { if (!this.destroyed) this.opts.onAct && this.opts.onAct(h.act, h); }, 500); return; }
    if (h.fixed3) { if (this.hero && this.motion) { this.heroPose('geste_1', 1200); this.puff(this.pos.x, this.pos.y - 0.22, '↩️', 1); } Sfx.coin(); clearTimeout(this.goT); this.goT = setTimeout(() => { if (!this.destroyed) this.opts.onAct && this.opts.onAct(h.act, h); }, 500); return; }
    if (h.fixed2) {
      if (!this.hero || !this.motion) { this.opts.onAct && this.opts.onAct(h.act, h); return; }
      this.heroPose(['geste_1', 'geste_2', 'joie'][Math.floor(Math.random() * 3)], 1500); this.puff(this.pos.x, this.pos.y - 0.25, '🎲', 1); this.puff(this.pos.x, this.pos.y - 0.2, '✨', 5); Sfx.coin();
      this.hsay(['Surprise ! Où vais-je atterrir ?', 'Une salle au hasard… c’est parti !', 'Abracadabra… surprise !'][Math.floor(Math.random() * 3)], 1500);
      clearTimeout(this.goT); this.goT = setTimeout(() => { if (!this.destroyed) this.opts.onAct && this.opts.onAct(h.act, h); }, 1200);
      return;
    }
    if (h.act && h.act.type === 'passage') { this.goPassage(h); return; }
    this.opts.onSpot && this.opts.onSpot(h);
    if (h.act && h.act.type === 'action') { this.goAndAct(h); return; }
    if (this.opts.onBeforeActivate && this.opts.onBeforeActivate(h) === false) return;
    if (!this.actor) { this.fire(h); return; }
    if (h.here && h.pre && this.motion) { this.fire(h); return; }
    const s = h.stand || { x: h.x, y: h.y };
    // marche d'abord, déclenche à l'arrivée ; si déjà proche (ou mouvement réduit), déclenche tout de suite
    const t = this.clampWalk(s.x, s.y);
    const dist = Math.hypot((t.x - this.pos.x) * this.iw, (t.y - this.pos.y) * this.ih);
    if (!this.motion || dist < 30) { this.pos = t; this.layoutActor(); this.fire(h); return; }
    this.moveTo(s.x, s.y, () => this.fire(h));
  }

  fire(h) {
    if (this.destroyed) return;
    if (h.pre && this.motion && !h._pre) { h._pre = true; this.doAction(h.pre, () => { this.fire(h); h._pre = false; }); return; }
    if (h.leap && this.motion && !h._leapt) { h._leapt = true; this.doAction({ kind: 'leap', ...h.leap }, () => { this.fire(h); h._leapt = false; }); return; }
    if (h.climb && this.motion && !h._climbed) { h._climbed = true; this.doAction({ kind: 'climb', ...h.climb }, () => { this.fire(h); h._climbed = false; }); return; }
    // passage vers une autre salle : Maissa touche le cercle (geste choisi au hasard), qui s'illumine, puis on part
    if (h.act && h.act.type === 'go' && h.act.scene !== 'map' && this.motion && this.hero) {
      const g = ['geste_2', 'geste_1', 'salut', 'geste_2'][Math.floor(Math.random() * 4)];
      this.hfacing = h.x >= this.pos.x ? 1 : -1; this.heroPose(g, 1600); this.layoutHero();
      const hs = this.hotspots.find((x) => x.def === h); if (hs) { hs.el.classList.remove('touched'); void hs.el.offsetWidth; hs.el.classList.add('touched'); }
      this.puff(h.x, h.y, '✨', 5); this.puff(h.x, h.y, h.icon, 1); Sfx.coin();
      this.hsay(['On y va !', 'Hop, en route !', 'Allons-y !', 'C’est parti !'][Math.floor(Math.random() * 4)], 1200);
      clearTimeout(this.goT); this.goT = setTimeout(() => { if (!this.destroyed) this.opts.onAct && this.opts.onAct(h.act, h); }, 950);
      return;
    }
    this.heroPose(this.poseFor(h), 2200); this.trick('hop', 700); this.heroJump();
    this.opts.onAct && this.opts.onAct(h.act, h);
  }

  // ---------- actions 2,5D : escaliers, chaise, chaudron ----------
  goAndAct(h) {
    const a = h.act, s = h.stand || { x: h.x, y: h.y };
    const t = this.clampWalk(s.x, s.y);
    const dist = Math.hypot((t.x - this.pos.x) * this.iw, (t.y - this.pos.y) * this.ih);
    // panelDelay : un temps d'émerveillement avant les questions (ex. écouter la baleine chanter), avec une phrase et un son
    const after0 = a.panelAfter ? () => { if (this.destroyed) return; if (a.pauseSay) setTimeout(() => { if (!this.destroyed) { this.heroPose('joie', 1600); this.hsay(a.pauseSay, Math.max(2600, (a.panelDelay || 0) - 1400)); } }, 900); if (a.pauseSfx === 'whale') Sfx.whaleCall(); setTimeout(() => { if (!this.destroyed) this.opts.onAct && this.opts.onAct({ type: 'panel', panel: a.panelAfter }, h); }, a.panelDelay || 400); } : null;
    const after = () => { if (this.destroyed) return; if (after0) after0(); else this.opts.onActivity && this.opts.onActivity(h);
      // ex. la grande salle : après l'escalier, Maissa traverse d'elle-même le grand vitrail
      const gA = a.goAfter || (a.then && a.then.goAfter); if (gA) setTimeout(() => { if (!this.destroyed) this.opts.onAct && this.opts.onAct({ type: 'go', scene: gA }, h); }, 300);
      if (a.autoPass && this.passDef) setTimeout(() => { if (!this.destroyed && !this.anim) { this.unlockPassage(false); this.goPassage(this.passDef); } }, 500); };
    const go = () => this.doAction(a, after);
    if (!this.motion) { this.doAction(a, after); return; }
    if (dist < 30) { this.pos = t; this.layoutActor(); go(); return; }
    this.moveTo(s.x, s.y, go);
  }

  hsay(text, ms = 2200) {
    if (!this.hero) return;
    this.hero.querySelectorAll('.hero-say').forEach((n) => n.remove());
    const b = el('div', 'hero-say'); b.textContent = text; b.setAttribute('aria-hidden', 'true');
    this.hero.append(b); if (ms >= 2500 || text.length > 24) this.talking(ms);
    setTimeout(() => b.remove(), ms);
  }

  // pendant une réplique : bulle devant tout, boutons atténués (sinon le texte est masqué par les étiquettes)
  talking(ms) {
    if (!this.wrap) return;
    this.wrap.classList.add('talking'); this.talkUntil = Math.max(this.talkUntil || 0, performance.now() + ms);
    clearTimeout(this.talkT); this.talkT = setTimeout(() => { if (this.wrap && performance.now() >= this.talkUntil - 30) this.wrap.classList.remove('talking'); }, this.talkUntil - performance.now());
  }

  puff(x, y, glyph = '🫧', n = 3) {
    if (!this.motion || !this.world) return;
    for (let i = 0; i < n; i++) {
      const p = el('span', 'puff'); p.textContent = glyph; p.setAttribute('aria-hidden', 'true');
      p.style.left = (x + (Math.random() - 0.5) * 0.05) * this.iw + 'px'; p.style.top = y * this.ih + 'px';
      p.style.animationDelay = (i * 0.12) + 's'; p.style.zIndex = '999';
      this.world.append(p); setTimeout(() => p.remove(), 1800 + i * 120);
    }
  }

  // a : { kind:'climb'|'stir'|'sit', ... } ; done : appelé à la fin
  doAction(a, done) {
    if (this.destroyed || !this.hero || this.anim) { done && done(); return; }
    this.wake(true); this.touch();
    if (a.voiceStart && Sfx.soundOn()) Voice.playUrl(a.voiceStart);
    const start = { ...this.pos };
    if (!this.motion) {
      // mouvement réduit : simple pose fixe, sans trajet animé
      this.heroPose(a.kind === 'stir' ? 'remue_1' : a.kind === 'sit' ? 'assise' : 'joie', 1500);
      if (a.say) this.hsay(a.say, 1800);
      setTimeout(() => { if (!this.destroyed) { this.heroPose('trois_quarts'); done && done(); } }, 1500);
      return;
    }
    this.root.classList.add('acting');
    this.anim = { kind: a.kind, a, t: 0, phase: 'main', start, done, s0: this.scaleAt(start.y), n: 0, last: -1 };
    const A = this.anim;
    // cinématique vidéo (sauf chaudron 3D, lancée quand elle est sur l'escabeau)
    const stir3d = a.kind === 'stir' && this.st && this.hx.cfg.props && this.hx.cfg.props.spot;
    if (a.cine && a.kind !== 'stir') { A.cineOn = true; this.cine(a.cine, (ok) => { A.cineOn = false; if (this.anim === A && (ok || a.intro || (a.hold || 0) >= 30)) { this.endAction(); if (!ok && a.failVoice && Sfx.soundOn()) Voice.playUrl(a.failVoice); if (a.afterSay) { this.heroPose('joie', 2600); this.hsay(a.afterSay, 3200); } } }, a.cineSub); }
    void stir3d;
    if (a.kind === 'climb') {
      const pts = [{ x: start.x, y: start.y }, ...a.path.map((q) => ({ ...q }))];
      let L = 0; pts.forEach((q, i) => { q.l = i ? L += Math.hypot((q.x - pts[i - 1].x) * this.iw, (q.y - pts[i - 1].y) * this.ih) : 0; });
      Object.assign(A, { pts, L, phase: 'up', dUp: Math.max(2.2, Math.min(3.6, L / (this.iw * 0.14))) });
      A.dDown = A.dUp * 0.75; this.hsay(a.say || 'Je monte !', 1800);
      if (this.st && a.path3d && this.hx.cfg.paths[a.path3d]) { const len = this.hx.pathLen(a.path3d); Object.assign(A, { s3: a.path3d, phase: 'in', p0: this.hx.pos.clone(), dUp: Math.max(3.2, Math.min(5.5, len * 1.0)), dDown: Math.max(2.6, Math.min(4.5, len * 0.8)) }); }
    } else if (a.kind === 'stir') {
      A.dur = a.dur || 3.8; this.hsay(a.say || 'Je mélange !', 1800);
      this.showPose('remue_1'); if (this.h3) this.hx.prop(true); if (this.st) { A.free = true; this.hx.play('idle'); }
      if (a.cine && !(this.st && this.hx.cfg.props && this.hx.cfg.props.spot)) { A.cineOn = true; this.cine(a.cine, (ok) => { A.cineOn = false; if (ok && this.anim === A) this.endAction(); }, a.cineSub); }
      if (this.h3) this.hx.setYaw(a.yaw != null ? a.yaw : 1.3);
    } else if (a.kind === 'door') {
      this.hsay(a.say || 'J’ouvre la porte !', 1600); A.ph = 'in';
    } else if (a.kind === 'flip') {
      A.dur = a.dur || 3.6; this.hsay(a.say || 'Je retourne le sablier !', 1800); this.showPose('geste_1'); this.hfacing = a.facing || 1;
    } else if (a.kind === 'leap') {
      A.free = true; this.hsay(a.say || 'Je vais attraper la clé !', 1800);
    } else if (a.kind === 'globe') {
      A.dur = a.dur || 4.5; this.hsay(a.say || 'Je fais tourner le globe !', 1800);
      this.showPose('geste_1'); if (this.h3) this.hx.setYaw(a.yaw != null ? a.yaw : -1.2);
      this.mkGlobe(a.globe); if (this.st) { this.hx.swayOn = false; A.free = true; this.hx.play('idle'); }
    } else if (a.kind === 'signs') {
      A.dur = 1.2 + a.signs.length * 5.5 + 1.6; A.step = -1; this.hsay(a.say || 'Regarde !', 1400); this.mkSigns(a.signs);
    } else if (a.kind === 'cardinal') {
      A.dur = 7.4; A.step = -1; this.hsay(a.say || 'Je te montre les points cardinaux !', 1600); this.mkRose(a.map);
    } else if (a.kind === 'marelle') {
      // marelle sur le tapis aux flèches : petits sauts de case en case, chaque case s'allume de sa couleur
      const seq = a.steps ? a.steps.map((_, i) => i) : (a.seq || [0, 1, 2, 3, 4, 3, 2]);
      Object.assign(A, { phase: 'walk', from: { x: start.x, y: start.y }, wdur: 1.3, seq, hop: -1, hdur: a.hopDur || 0.72 });
      A.dur = A.wdur + seq.length * A.hdur + 1.4;
      this.hsay(a.say || 'On joue à la marelle !', 1800);
    } else if (a.kind === 'cross') {
      // traversée de la pièce à pied (ex. : aller voir le passeport)
      const pts = [{ x: start.x, y: start.y }, ...a.path.map((q) => ({ ...q }))];
      let L = 0; pts.forEach((q, i) => { q.l = i ? L += Math.hypot((q.x - pts[i - 1].x) * this.iw, (q.y - pts[i - 1].y) * this.ih) : 0; });
      Object.assign(A, { pts, L, phase: 'walk', dur: Math.max(1.8, Math.min(4.5, L / (this.iw * (a.run ? 0.45 : 0.3)))) });
      this.hsay(a.say || 'J’y vais !', 1800);
    } else if (a.kind === 'sit') {
      // le « sol » sous le tabouret : le modèle 3D s'assoit sur place (hanches au niveau de l'assise)
      const fl = a.floor || { x: a.seat.x, y: a.seat.y + 0.11 };
      const h = (this.def.heroH || 0.34) * Math.min(this.ih, this.iw / 1.2) * this.scaleAt(fl.y);
      A.floor = this.h3 ? fl : { x: a.seat.x, y: a.seat.y + 0.4 * h / this.ih };
      Object.assign(A, { phase: 'in', dIn: a.dIn || 0.7, dDown: this.h3 ? 2.7 : 0.01, dur: a.dur || 4.5, dUp: this.h3 ? 2.7 : 0.01 });
      this.hsay(a.say || 'On s’assoit un peu !', 1800);
    }
  }

  // globe qui tourne : on découpe le globe peint dans le décor, on le tuile en miroir et on le fait défiler dans un disque ombré
  // sablier qui se retourne : on découpe le sablier peint et on le fait pivoter d'un demi-tour
  mkFlip(r) {
    try {
      const im = this.img, nw = im.naturalWidth, nh = im.naturalHeight; if (!nw) return;
      const cv = document.createElement('canvas'), W = Math.round(r.w * nw), H = Math.round(r.h * nh); cv.width = W; cv.height = H;
      cv.getContext('2d').drawImage(im, r.x * nw, r.y * nh, W, H, 0, 0, W, H);
      const d = el('div', 'flip-glass'); d.setAttribute('aria-hidden', 'true');
      d.style.cssText = `width:${r.w * this.iw}px;height:${r.h * this.ih}px;left:${r.x * this.iw}px;top:${r.y * this.ih}px;background-image:url(${cv.toDataURL('image/webp', 0.85)})`;
      this.world.append(d); this.globeEl = d;
    } catch (e) { /* sans effet */ }
  }

  // porte qui s'ouvre : deux battants découpés dans la peinture pivotent, une lumière apparaît derrière
  mkDoor(r) {
    try {
      const im = this.img, nw = im.naturalWidth, nh = im.naturalHeight; if (!nw) return;
      const wrap = el('div', 'door-open'); wrap.setAttribute('aria-hidden', 'true');
      wrap.style.cssText = `left:${r.x * this.iw}px;top:${r.y * this.ih}px;width:${r.w * this.iw}px;height:${r.h * this.ih}px`;
      const glow = el('div', 'door-glow'); wrap.append(glow);
      ['l', 'r'].forEach((side, i) => {
        const cv = document.createElement('canvas'), W = Math.round(r.w / 2 * nw), H = Math.round(r.h * nh); cv.width = W; cv.height = H;
        cv.getContext('2d').drawImage(im, (r.x + i * r.w / 2) * nw, r.y * nh, W, H, 0, 0, W, H);
        const leaf = el('div', 'door-leaf ' + side); leaf.style.backgroundImage = `url(${cv.toDataURL('image/webp', 0.85)})`; wrap.append(leaf);
      });
      this.world.append(wrap); this.doorEl = wrap; requestAnimationFrame(() => wrap.classList.add('go'));
    } catch (e) { /* sans effet */ }
  }

  mkGlobe(g) {
    // vrai globe : carte du monde projetée sur une sphère (projection orthographique), qui tourne puis s'arrête sur le Japon
    try {
      const D = g.r * 2 * this.iw, N = Math.min(220, Math.max(96, Math.round(D * Math.min(2, devicePixelRatio || 1))));
      const cv = document.createElement('canvas'); cv.width = cv.height = N; cv.className = 'globe-spin'; cv.setAttribute('aria-hidden', 'true');
      cv.style.cssText = `width:${D}px;height:${D}px;left:${g.x * this.iw - D / 2}px;top:${g.y * this.ih - D / 2}px`;
      this.world.append(cv); this.globeEl = cv;
      const tex = new Image(); tex.src = asset('assets/scenes/globe_map.webp');
      const G = { cv, ctx: cv.getContext('2d'), N, lon: 0, data: null };
      tex.onload = () => { const tc = document.createElement('canvas'); tc.width = 512; tc.height = 256; const c = tc.getContext('2d'); c.drawImage(tex, 0, 0, 512, 256); G.data = c.getImageData(0, 0, 512, 256).data; G.out = G.ctx.createImageData(N, N); this.drawGlobe(G); };
      this.globeG = G;
    } catch (e) { /* sans effet : le globe reste fixe */ }
  }
  drawGlobe(G) {
    if (!G || !G.data) return;
    const { N, data, out } = G, o = out.data, R = N / 2, lon0 = G.lon * Math.PI / 180, tilt = 0.32, ct = Math.cos(tilt), st = Math.sin(tilt);
    for (let py = 0; py < N; py++) for (let px = 0; px < N; px++) {
      const x = (px + 0.5 - R) / R, y = (py + 0.5 - R) / R, rr = x * x + y * y, k = (py * N + px) * 4;
      if (rr > 1) { o[k + 3] = 0; continue; }
      const z = Math.sqrt(1 - rr), y2 = y * ct - z * st, z2 = y * st + z * ct; // axe incliné vers nous
      const lat = Math.asin(-y2), lon = Math.atan2(x, z2) + lon0;
      let u = ((lon / (2 * Math.PI) + 0.5) % 1 + 1) % 1, v = 0.5 - lat / Math.PI;
      const tx = Math.min(511, (u * 512) | 0), ty = Math.min(255, Math.max(0, (v * 256) | 0)), t = (ty * 512 + tx) * 4;
      const sh = 0.55 + 0.45 * (z * 0.8 + (-x * 0.35 - y * 0.35) * 0.5), rim = rr > 0.86 ? 1 - (rr - 0.86) * 2.2 : 1, f = Math.max(0.25, sh) * rim;
      o[k] = data[t] * f + 18 * (1 - rim); o[k + 1] = data[t + 1] * f + 14 * (1 - rim); o[k + 2] = data[t + 2] * f + 8; o[k + 3] = 255;
    }
    G.ctx.putImageData(out, 0, 0);
  }
  spinGlobe(t, T) {
    // ralentit jusqu'à s'arrêter pile sur le Japon (≈ 138° E)
    const G = this.globeG; if (!G) return;
    const u = Math.min(1, t / T), e = 1 - Math.pow(1 - u, 3);
    G.lon = 138 - 900 * (1 - e); this.drawGlobe(G);
  }

  // panneaux en bois plantés dans le décor (vocabulaire de la rivière)
  mkSigns(list) {
    try {
      const w = el('div', 'signs'); w.setAttribute('aria-hidden', 'true');
      for (const sg of list) { const b = el('span', 'sign'); b.textContent = sg.t; b.style.left = sg.x * this.iw + 'px'; b.style.top = sg.y * this.ih + 'px'; w.append(b); }
      this.world.querySelectorAll('.signs').forEach((o) => o.remove());
      this.world.append(w); this.signsEl = w;
    } catch (e) { /* sans effet */ }
  }

  // rose des vents magique posée sur la carte accrochée (archives)
  mkRose(r) {
    try {
      const d = el('div', 'rose-map'); d.setAttribute('aria-hidden', 'true');
      d.style.cssText = `left:${r.x * this.iw}px;top:${r.y * this.ih}px;width:${r.w * this.iw}px;height:${r.h * this.ih}px`;
      d.innerHTML = '<div class="rose">✦</div><b class="cn">N ❄️</b><b class="ce">E 🌅</b><b class="cs">S ☀️</b><b class="co">O 🌇</b>';
      this.world.append(d); this.roseEl = d; requestAnimationFrame(() => d.classList.add('go'));
    } catch (e) { /* sans effet */ }
  }

  // cercle doré tracé au compas sur la table (atelier)
  mkCircle(c) {
    try {
      const D = c.r * 2 * this.iw, d = el('div', 'compass-draw'); d.setAttribute('aria-hidden', 'true');
      d.style.cssText = `width:${D}px;height:${D}px;left:${c.x * this.iw - D / 2}px;top:${c.y * this.ih - D / 2}px`;
      d.innerHTML = '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" pathLength="100"/></svg><span>📐</span>';
      this.world.append(d); this.circleEl = d;
    } catch (e) { /* sans effet */ }
  }

  // ---------- le Chemin des Mondes : passage vers la salle suivante ----------
  passVoice(k) { if (Sfx.soundOn()) Voice.playUrl(`assets/voice/${k}.ogg`, { keep: k === 'pass_go' }); }
  goPassage(h) {
    if (this.anim || this.passing) return;
    if (this.passEl && this.passEl.classList.contains('locked')) {
      this.passEl.classList.remove('nope'); void this.passEl.offsetWidth; this.passEl.classList.add('nope');
      this.heroPose('reflexion', 2200); this.passVoice('pass_locked'); if (!Sfx.soundOn()) this.hsay('Je dois d’abord réussir une activité ici !', 2200);
      const cand = this.hotspots.find((x) => !x.fixed && x.def.act && ['panel', 'mission', 'action'].includes(x.def.act.type));
      if (cand && this.suggest) this.suggest(cand.def.id);
      return;
    }
    this.opts.onSpot && this.opts.onSpot(h);
    const s = h.stand || { x: h.x, y: h.y };
    if (!this.actor || !this.motion) { this.passThrough(h); return; }
    const t = this.clampWalk(s.x, s.y), dist = Math.hypot((t.x - this.pos.x) * this.iw, (t.y - this.pos.y) * this.ih);
    if (dist < 30) { this.passThrough(h); return; }
    this.moveTo(s.x, s.y, () => this.passThrough(h));
  }
  passThrough(h) {
    if (this.destroyed || this.passing) return; this.passing = true;
    const k = h.act.kind || 'light';
    this.passVoice('pass_go'); Sfx.coin();
    if (this.hero) { this.hfacing = h.x >= this.pos.x ? 1 : -1; this.heroPose('geste_2', 1400); this.layoutHero(); }
    const fx = el('div', 'pass-fx k-' + k); fx.style.left = h.x * this.iw + 'px'; fx.style.top = h.y * this.ih + 'px';
    fx.innerHTML = '<i></i><i></i><i></i><b></b>'; this.world.append(fx);
    if (this.passEl) this.passEl.classList.add('going');
    this.puff(h.x, h.y, '✨', 8);
    setTimeout(() => { if (this.destroyed) return; if (this.hero) this.hero.classList.add('pass-out'); this.root.classList.add('passing', 'pk-' + k); }, 700);
    setTimeout(() => { if (!this.destroyed) this.opts.onAct && this.opts.onAct({ type: 'go', scene: h.act.scene, via: k }, h); }, 1700);
  }
  unlockPassage(announce) {
    if (!this.passEl || !this.passEl.classList.contains('locked')) return;
    this.passEl.classList.remove('locked'); this.passEl.classList.add('opened');
    if (!announce || !this.passDef) return;
    Sfx.win && Sfx.win(); this.passVoice('pass_open'); if (!Sfx.soundOn()) this.hsay('Un passage magique s’est ouvert ! Par ici !', 2600);
    this.heroPose('joie', 1800); this.heroJump();
    this.mkTrail();
  }
  mkTrail() {
    if (!this.passDef || !this.hero) return;
    if (this.trailEl) this.trailEl.remove();
    const s = this.passDef.stand, a = { x: this.pos.x, y: this.pos.y - 0.02 }, e = { x: this.passDef.x, y: this.passDef.y + 0.07 }, n = 14, t = el('div', 'pass-trail');
    for (let i = 1; i <= n; i++) { const u = i / (n + 1), x = a.x + (e.x - a.x) * u, y = a.y + (e.y - a.y) * u - Math.sin(u * Math.PI) * 0.04; const st = el('i'); st.textContent = '✦'; st.style.left = x * this.iw + 'px'; st.style.top = y * this.ih + 'px'; st.style.animationDelay = (i * 0.12) + 's'; t.append(st); }
    
    this.world.append(t); this.trailEl = t;
    // Muezza court jusqu'au passage et attend (sans miauler)
    this.mimiGoal = { x: s.x + 0.04, y: Math.min(0.98, s.y + 0.01) }; this.mimiGoalT = performance.now();
    clearTimeout(this.trailT); this.trailT = setTimeout(() => { if (this.trailEl) { this.trailEl.classList.add('fade'); } }, 14000);
  }

  endAction() {
    if (this.circleEl) { this.circleEl.remove(); this.circleEl = null; }
    if (this.roseEl) { this.roseEl.remove(); this.roseEl = null; }
    if (this.signsEl) { this.signsEl.remove(); this.signsEl = null; }
    if (this.globeEl) { this.globeEl.remove(); this.globeEl = null; this.globeG = null; }
    if (this.doorEl) { this.doorEl.remove(); this.doorEl = null; }
    if (this.hero) this.hero.style.opacity = '';
    if (this.st) { this.hx.swayOn = true; this.hx.yOff = 0; this.hx.ikOff(); }
    if (this.h3) this.hx.prop(false);
    const A = this.anim; this.anim = null; this.hscaleOv = null; this.root.classList.remove('acting');
    this.pos = A.a && A.a.stay ? this.clampWalk(this.pos.x, this.pos.y) : { ...A.start }; this.hfacing = 1; this.heroPose('trois_quarts'); this.layoutHero();
    if (A.a && A.a.then && !this.destroyed) { const nx = A.a.then; setTimeout(() => { if (!this.destroyed) this.doAction(nx, A.done); }, 60); return; }
    A.done && A.done();
  }

  // petit saut de joie (« contente d'apprendre ») : 3D et dessin
  heroJump() { if (this.motion === false) return; this.jumpT0 = performance.now(); if (this.h3) this.hx.play && this.showPose('joie'); }

  // montée dans une vraie scène 3D : le long des marches modélisées
  climb3(A) {
    const hx = this.hx, P = hx.cfg.paths[A.s3], p0 = P.pts[0];
    const place = (v) => { hx.pos.copy(v); const sp = hx.project(v); this.pos = { x: sp.x, y: sp.y }; };
    const stepSfx = (per) => { const fr = Math.floor(A.t / per) % 2; if (fr !== A.last) { A.last = fr; Sfx.step(); } };
    if (A.phase === 'in') {
      const u = Math.min(1, A.t / 0.9); this.showPose('marche_1'); hx.setYaw(Math.atan2(p0.x - A.p0.x, p0.z - A.p0.z)); place(A.p0.clone().lerp(p0, u)); stepSfx(0.26);
      if (u >= 1) { A.phase = 'up'; A.t = 0; }
    } else if (A.phase === 'up' || A.phase === 'down') {
      const D = A.phase === 'up' ? A.dUp : A.dDown, u = Math.min(1, A.t / D), k = A.phase === 'up' ? u : 1 - u;
      const sp = hx.setPath(A.s3, k); this.pos = { x: sp.x, y: sp.y };
      if (A.t < 0.05 || hx.rig.curName !== 'idle') hx.play('idle'); hx.climbIK(A.s3, k, A.phase === 'up' ? 1 : -1);
      stepSfx(A.phase === 'up' ? 0.4 : 0.34);
      if (u >= 1) { A.t = 0; A.phase = A.phase === 'up' ? 'top' : 'out'; if (A.phase === 'top') { this.hsay(A.a.topSay || 'Quelle belle vue !', 1400); Sfx.coin(); } else A.p1 = hx.floorAt(A.start.x, A.start.y); }
    } else if (A.phase === 'top') {
      hx.ikOff(); if (A.t < 0.05) { this.showPose('joie'); this.heroJump(); } hx.setYaw(0.05);
      if (A.t > 1.9) { A.t = 0; A.phase = 'down'; this.hsay('Je redescends !', 1200); }
    } else {
      const u = Math.min(1, A.t / 0.9); this.showPose('marche_1'); hx.setYaw(Math.atan2(A.p1.x - p0.x, A.p1.z - p0.z)); place(p0.clone().lerp(A.p1, u)); stepSfx(0.26);
      if (u >= 1) this.endAction();
    }
    this.layoutHero();
  }

  // cinématique plein écran (vidéo pré-calculée) ; touche pour passer ; done() à la fin ou en cas d'échec
  cine(src, done, subs) {
    // vidéo plein écran ; done(true) si elle a été vue (ou passée), done(false) si elle n'a pas pu se lancer
    let fin = false, seen = false; const end = (ok) => { if (fin) return; fin = true; ov.classList.add('out'); try { let k = 0; const v0 = v.volume, tm = setInterval(() => { k++; try { v.volume = Math.max(0, v0 * (1 - k / 6)); } catch (e) { /* */ } if (k >= 6) { clearInterval(tm); try { v.pause(); } catch (e) { /* */ } } }, 50); } catch (e) { /* */ } setTimeout(() => ov.remove(), 350); done && done(ok); };
    const ov = el('div', 'cine'), v = document.createElement('video'), skip = el('button', 'cine-skip');
    v.src = asset(src); v.playsInline = true; v.setAttribute('playsinline', ''); v.preload = 'auto'; v.muted = !Sfx.soundOn();
    skip.type = 'button'; skip.textContent = 'Passer ⏭'; skip.onclick = (e) => { e.stopPropagation(); end(seen); };
    ov.append(v, skip); ov.onclick = () => end(seen); (this.root || document.body).append(ov);
    v.addEventListener('playing', () => { seen = true; });
    if (subs && subs.length && (!Sfx.soundOn() || subs.always)) {
      // sous-titres ponctuels (ex. la réplique de Soumaya sur le canapé)
      const sb = el('div', 'cine-sub'); ov.append(sb);
      v.addEventListener('timeupdate', () => { const cur = subs.find((x) => v.currentTime >= x.t && v.currentTime < x.t + (x.d || 2.6)); sb.textContent = cur ? cur.txt : ''; sb.classList.toggle('on', !!cur); });
    }
    v.onended = () => end(true); v.onerror = () => end(false); setTimeout(() => end(seen), 40000);
    const p = v.play(); if (p && p.catch) p.catch(() => { v.muted = true; v.play().catch(() => end(false)); });
  }


  // forêt (version dessinée) : champignon, grand saut vers la clé, retombée
  leap2(A) {
    const L = A.a.pts || {}, base = L.base || { x: 0.9, y: 0.84 }, cap = L.cap || { x: 0.95, y: 0.62 }, key = L.key || { x: 0.84, y: 0.21 };
    const sm = (u) => u * u * (3 - 2 * u), lerp = (a, b, u) => ({ x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u });
    if (!A.ph) { A.ph = 'in'; A.t = 0; A.s0 = this.scaleAt(base.y); const hFrac = (this.def.heroH || 0.34) * Math.min(this.ih, this.iw / 1.2) * A.s0 / this.ih; A.top = { x: key.x + 0.01, y: key.y + hFrac * 0.97 }; A.land = { x: key.x, y: 0.88 }; }
    const step = (per) => { const fr = Math.floor(A.t / per) % 2; if (fr !== A.last) { A.last = fr; Sfx.step(); } };
    if (A.ph === 'in') { const u = Math.min(1, A.t / 1.2); this.pos = lerp(A.start, base, u); this.hfacing = base.x >= A.start.x ? 1 : -1; this.showPose(WALK[Math.floor(A.t / 0.12) % 8]); step(0.26); if (u >= 1) { A.ph = 'hop'; A.t = 0; this.hscaleOv = A.s0; } }
    else if (A.ph === 'hop') { const u = Math.min(1, A.t / 0.7); const p = lerp(base, cap, sm(u)); p.y -= Math.sin(Math.PI * u) * 0.08; this.pos = p; this.showPose('monte_1'); if (u >= 1) { A.ph = 'ready'; A.t = 0; Sfx.bloop(); this.showPose('trois_quarts'); this.hsay('Un, deux, trois… hop !', 1300); } }
    else if (A.ph === 'ready') { this.pos = { ...cap }; this.hfacing = -1; if (A.t > 1.0) { A.ph = 'jump'; A.t = 0; this.showPose('joie'); } }
    else if (A.ph === 'jump') { const u = Math.min(1, A.t / 0.85); this.pos = lerp(cap, A.top, Math.sqrt(u)); if (u >= 1) { A.ph = 'grab'; A.t = 0; this.puff(key.x, key.y, '✨', 4); this.puff(key.x, key.y, '🗝️', 1); Sfx.coin(); this.hsay('Je l’ai !', 1200); } }
    else if (A.ph === 'grab') { this.pos = { ...A.top }; if (A.t > 0.45) { A.ph = 'fall'; A.t = 0; } }
    else if (A.ph === 'fall') { const u = Math.min(1, A.t / 0.7); this.pos = { x: A.top.x + (A.land.x - A.top.x) * u, y: A.top.y + (A.land.y - A.top.y) * u * u }; this.showPose('monte_2'); this.hscaleOv = A.s0 + (this.scaleAt(A.land.y) - A.s0) * u; if (u >= 1) { A.ph = 'joy'; A.t = 0; this.hscaleOv = null; this.showPose('bravo'); this.heroJump(); this.hsay('J’ai la clé des phrases !', 1600); Sfx.win(); } }
    else if (A.ph === 'joy') { this.pos = { ...A.land }; if (A.t > 1.5 && !A.cineOn) { this.endAction(); return; } }
    this.layoutHero();
  }

  // forêt : monter sur le champignon puis sauter attraper la clé suspendue
  leap3(A) {
    const hx = this.hx, P = hx.cfg.props, sm = (u) => u * u * (3 - 2 * u), V3 = hx.pos.constructor;
    const arc = (a, b, u, h) => { const p = a.clone().lerp(b, sm(u)); p.y += Math.sin(Math.PI * u) * h; return p; };
    if (!A.ph) { A.ph = 'in'; A.t = 0; A.p0 = hx.pos.clone(); A.top = new V3(P.key.x, P.key.y - (hx.cfg.hero || 1.4) * 1.08, P.key.z); A.land = new V3(P.key.x, 0, P.key.z + 0.4); }
    const walk = (from, to, d) => { const u = Math.min(1, A.t / d); this.showPose('marche_1'); hx.faceTo(to); hx.pos.lerpVectors(from, to, u); const fr = Math.floor(A.t / 0.26) % 2; if (fr !== A.last) { A.last = fr; Sfx.step(); } return u >= 1; };
    if (A.ph === 'in') { if (walk(A.p0, P.base, 1.3)) { A.ph = 'hop'; A.t = 0; hx.play('idle'); Sfx.tap(); } }
    else if (A.ph === 'hop') { const u = Math.min(1, A.t / 0.75); hx.pos.copy(arc(P.base, P.cap, u, 0.45)); hx.faceTo(P.key); if (u >= 1) { A.ph = 'ready'; A.t = 0; Sfx.bloop(); this.hsay('Un, deux, trois… hop !', 1300); } }
    else if (A.ph === 'ready') { hx.faceTo(P.key); hx.pos.copy(P.cap); hx.pos.y -= Math.sin(Math.min(1, A.t / 0.9) * Math.PI) * 0.12; if (A.t > 0.9) { A.ph = 'jump'; A.t = 0; hx.play('cheer', { speed: 1.2, once: true }); } }
    else if (A.ph === 'jump') { const u = Math.min(1, A.t / 0.95); hx.pos.copy(arc(P.cap, A.top, Math.sqrt(u), 0.25)); if (u >= 1) { A.ph = 'grab'; A.t = 0; const sp = hx.project(P.key); this.puff(sp.x, sp.y, '✨', 4); this.puff(sp.x, sp.y, '🗝️', 1); Sfx.coin(); this.hsay('Je l’ai !', 1200); } }
    else if (A.ph === 'grab') { hx.pos.copy(A.top); if (A.t > 0.45) { A.ph = 'fall'; A.t = 0; } }
    else if (A.ph === 'fall') { const u = Math.min(1, A.t / 0.8); const p = A.top.clone().lerp(A.land, u); p.y = A.top.y * (1 - u * u); hx.pos.copy(p); if (u >= 1) { A.ph = 'joy'; A.t = 0; Sfx.tap(); hx.play('cheer', { speed: 1.1, once: true }); this.heroJump(); this.hsay('J’ai la clé des phrases !', 1600); Sfx.win(); } }
    else if (A.ph === 'joy') { hx.pos.copy(A.land); hx.setYaw(0.1); if (A.t > 1.5 && !A.cineOn) { A.ph = 'out'; A.t = 0; hx.play('idle'); } }
    else if (walk(A.land, A.p0, 1.2)) { this.endAction(); return; }
    const sp = hx.project(hx.pos); this.pos = { x: sp.x, y: sp.y }; this.layoutHero();
  }

  // chaudron en 3D : marcher jusqu'à l'escabeau, monter, touiller dans la marmite, redescendre, revenir
  stir3(A) {
    const hx = this.hx, P = hx.cfg.props, sm = (u) => u * u * (3 - 2 * u);
    if (!A.ph) { A.ph = 'in'; A.t = 0; A.p0 = hx.pos.clone(); hx.prop(false); A.pre = P.spot.clone().add(P.spot.clone().sub(P.rim).setY(0).normalize().multiplyScalar(0.45)); }
    const walk = (from, to, d) => { const u = Math.min(1, A.t / d); this.showPose('marche_1'); hx.faceTo(to); hx.pos.lerpVectors(from, to, u); const fr = Math.floor(A.t / 0.26) % 2; if (fr !== A.last) { A.last = fr; Sfx.step(); } return u >= 1; };
    if (A.ph === 'in') { if (walk(A.p0, A.pre, 1.4)) { A.ph = 'up'; A.t = 0; hx.play('idle'); Sfx.tap(); } }
    else if (A.ph === 'up') { const u = Math.min(1, A.t / 0.8); hx.yOff = P.stepH * sm(Math.min(1, u * 1.4)); hx.pos.lerpVectors(A.pre, P.spot, sm(u)); hx.faceTo(P.rim); if (u >= 1) { A.ph = 'stir'; A.t = 0; hx.prop(true); if (A.a.cine && this.motion) { A.cineOn = true; this.cine(A.a.cine, () => { A.cineOn = false; }); } } }
    else if (A.ph === 'stir') {
      hx.stirIK(A.t, A.a);
      const fr = Math.floor(A.t / 0.38) % 2; if (fr !== A.last) { A.last = fr; Sfx.bloop(); this.puff(A.a.puff.x, A.a.puff.y, Math.random() < 0.5 ? '🫧' : '✨', 2); }
      if (A.t > (A.a.dur || 3.8) + 1 && !A.cineOn) { this.hsay(A.a.endSay || 'Ça sent bon !', 1500); this.puff(A.a.puff.x, A.a.puff.y, '⭐', 4); Sfx.win(); hx.ikOff(); hx.prop(false); A.ph = 'down'; A.t = 0; }
    } else if (A.ph === 'down') { const u = Math.min(1, A.t / 0.8); hx.yOff = P.stepH * (1 - sm(Math.max(0, u * 1.4 - 0.4))); hx.pos.lerpVectors(P.spot, A.pre, sm(u)); if (u >= 1) { A.ph = 'out'; A.t = 0; Sfx.tap(); } }
    else if (walk(A.pre, A.p0, 1.4)) { this.endAction(); return; }
    const sp = hx.project(hx.pos); this.pos = { x: sp.x, y: sp.y }; this.layoutHero();
  }

  stepAnim(dt) {
    const A = this.anim;
    A.t += dt;
    const yawDir = (dx, dy) => { if (this.h3 && (Math.abs(dx) + Math.abs(dy)) > 1e-5) this.hx.setYaw(Math.atan2(dx * this.iw, dy * this.ih * 2.2)); };
    if (A.kind === 'climb' && A.s3) { this.climb3(A); }
    else if (A.kind === 'climb') {
      if (A.phase === 'up' || A.phase === 'down') {
        const D = A.phase === 'up' ? A.dUp : A.dDown, u = Math.min(1, A.t / D), k = A.phase === 'up' ? u : 1 - u;
        const target = k * A.L; let i = 1; while (i < A.pts.length - 1 && A.pts[i].l < target) i++;
        const p0 = A.pts[i - 1], p1 = A.pts[i], seg = Math.max(1e-6, p1.l - p0.l), f = Math.max(0, Math.min(1, (target - p0.l) / seg));
        this.pos = { x: p0.x + (p1.x - p0.x) * f, y: p0.y + (p1.y - p0.y) * f };
        const end = A.a.endScale || 0.55; this.hscaleOv = A.s0 * (1 + (end - 1) * k);
        const sgn = A.phase === 'up' ? 1 : -1;
        if (A.phase === 'up') {
          if (A.a.run) { this.hfacing = p1.x >= p0.x ? 1 : -1; this.showPose(WALK[Math.floor(A.t / 0.045) % 8]); const fr = Math.floor(A.t / 0.18) % 2; if (fr !== A.last) { A.last = fr; Sfx.step(); } }
          else {
          this.hfacing = 1; this.showPose('monte_1'); yawDir(p1.x - p0.x, p1.y - p0.y);
          const fr = Math.floor(A.t / 0.35) % 2; if (fr !== A.last) { A.last = fr; Sfx.step(); }
          }
        } else {
          this.showPose('marche_1'); yawDir(-(p1.x - p0.x), -(p1.y - p0.y));
          const fr = Math.floor(A.t / 0.26) % 2; if (fr !== A.last) { A.last = fr; Sfx.step(); }
          if (A.a.run) { this.hfacing = p0.x >= p1.x ? 1 : -1; this.showPose(WALK[Math.floor(A.t / 0.045) % 8]); }
          else if (!this.h3) { this.hfacing = (A.pts[A.pts.length - 1].x >= A.start.x ? -1 : 1); this.showPose(WALK[Math.floor(A.t / 0.12) % 8]); }
        }
        void sgn;
        if (u >= 1) { A.t = 0; A.phase = A.phase === 'up' ? 'top' : 'end'; if (A.phase === 'top') { this.hsay(A.a.topSay || 'Quelle belle vue !', 1400); Sfx.coin(); if (A.a.grab) { this.puff(A.a.grab.x, A.a.grab.y, '✨', 4); this.puff(A.a.grab.x, A.a.grab.y, '🍃', 2); } } }
      } else if (A.phase === 'top') { this.hfacing = 1; if (A.t < 0.05) { this.showPose('joie'); this.heroJump(); } if (this.h3) this.hx.setYaw(0.05); if (A.a.lean && A.t > 0.9 && !A.leant) { A.leant = 1; this.showPose('face'); this.puff(this.pos.x, this.pos.y - 0.12, '✨', 3); } if (A.t > (A.a.topHold || 1.9) && !A.cineOn) { A.t = 0; A.phase = 'down'; this.hsay(A.a.backSay || 'Je redescends !', 1200); } }
      else this.endAction();
    } else if (A.kind === 'door') {
      const d = A.a, at = d.at, inside = d.inside, lerp = (p, q, u) => ({ x: p.x + (q.x - p.x) * u, y: p.y + (q.y - p.y) * u });
      if (A.ph === 'in') { const u = Math.min(1, A.t / 0.9); this.pos = lerp(A.start, at, u); this.showPose(WALK[Math.floor(A.t / 0.12) % 8]); this.hfacing = at.x >= A.start.x ? 1 : -1; if (u >= 1) { A.ph = 'open'; A.t = 0; this.showPose('remue_1'); this.mkDoor(d.door); Sfx.tap(); } }
      else if (A.ph === 'open') { if (A.t > 1.3) { A.ph = 'walk'; A.t = 0; this.hsay(d.inSay || 'J’entre !', 1200); Sfx.coin(); } }
      else if (A.ph === 'walk') { const u = Math.min(1, A.t / 1.2); this.pos = lerp(at, inside, u); this.showPose(WALK[Math.floor(A.t / 0.12) % 8]); this.hscaleOv = this.scaleAt(at.y) * (1 - 0.35 * u); if (this.hero) this.hero.style.opacity = String(1 - Math.max(0, u - 0.4) / 0.6); if (u >= 1 && !A.cineOn) { this.hscaleOv = null; this.endAction(); return; } }
    } else if (A.kind === 'signs') {
      const k = Math.floor((A.t - 1.2) / 5.5), n = A.a.signs.length;
      if (k >= 0 && k < n && k !== A.step) { A.step = k; const sg = A.a.signs[k]; this.hsay(sg.s, 5200); Sfx.bloop(); this.showPose(k % 2 ? 'salut' : 'reflexion'); this.hfacing = sg.x >= this.pos.x ? 1 : -1; if (this.signsEl) this.signsEl.children[k].classList.add('on'); }
      if (k >= n && A.step < n) { A.step = n; this.showPose('joie'); this.heroJump(); Sfx.win(); this.hsay(A.a.endSay || 'Bravo !', 1800); }
      if (A.t > A.dur && !A.cineOn) { const el0 = this.signsEl; this.signsEl = null; this.endAction(); if (el0) { el0.classList.add('stay'); setTimeout(() => el0.remove(), 25000); } }
    } else if (A.kind === 'cardinal') {
      const P = [['n', 'Le nord, en haut : là où il fait froid ! ❄️'], ['e', 'L’est, à droite : le soleil se lève ! 🌅'], ['s', 'Le sud, en bas : il fait chaud ! ☀️'], ['o', 'L’ouest, à gauche : le soleil se couche ! 🌇']];
      const k = Math.floor((A.t - 0.9) / 1.25);
      if (k >= 0 && k < 4 && k !== A.step) { A.step = k; this.hsay(P[k][1], 1250); Sfx.bloop(); this.showPose(k % 2 ? 'salut' : 'reflexion'); if (this.roseEl) this.roseEl.classList.add('on-' + P[k][0]); }
      if (k >= 4 && A.step < 4) { A.step = 4; this.showPose('joie'); this.heroJump(); Sfx.win(); if (this.roseEl) this.roseEl.classList.add('spin'); this.hsay(A.a.endSay || 'N, E, S, O : je connais la rose des vents !', 1800); }
      if (A.t > A.dur && !A.cineOn) this.endAction();
    } else if (A.kind === 'marelle') {
      const a = A.a, T = a.tiles, lerp = (p, q, u) => ({ x: p.x + (q.x - p.x) * u, y: p.y + (q.y - p.y) * u });
      this.hscaleOv = a.scaleMin || null;
      if (A.t < A.wdur) { const u = A.t / A.wdur; this.pos = lerp(A.from, a.entry, u); this.hfacing = a.entry.x >= A.from.x ? 1 : -1; this.showPose(['marche_1', 'marche_2', 'marche_3', 'marche_4'][Math.floor(A.t / 0.13) % 4]); }
      else {
        const k = Math.floor((A.t - A.wdur) / A.hdur), f = ((A.t - A.wdur) % A.hdur) / A.hdur;
        if (k < A.seq.length && a.steps) {
          // vraie marelle sur le tapis aux flèches : pieds joints / jambes écartées en alternance, les cases touchées brillent en arc-en-ciel
          const S = a.steps, src = k === 0 ? a.entry : S[k - 1], dst = S[k];
          const q = lerp(src, dst, Math.min(1, f / 0.62)); q.y -= Math.sin(Math.PI * Math.min(1, f / 0.62)) * (a.hopH || 0.045); this.pos = q;
          this.hfacing = 1; this.showPose(f < 0.62 ? (dst.open ? 'saut_ouvert' : 'saut_joint') : (dst.open ? 'saut_ouvert' : 'saut_joint'));
          if (f >= 0.62 && A.hop !== k) { A.hop = k; this.marelleGlow(a.quads, dst.tiles); Sfx.coin(); this.hsay(dst.say || (dst.open ? 'Écarté !' : 'Joint !'), 650); }
        } else if (k < A.seq.length) {
          const src = k === 0 ? a.entry : T[A.seq[k - 1]], dst = T[A.seq[k]];
          const q = lerp(src, dst, Math.min(1, f / 0.7)); q.y -= Math.sin(Math.PI * Math.min(1, f / 0.7)) * (a.hopH || 0.05); this.pos = q;
          this.hfacing = dst.x >= src.x ? 1 : -1; this.showPose(f < 0.7 ? 'joie' : (k % 2 ? 'bravo' : 'salut'));
          if (f >= 0.7 && A.hop !== k) { A.hop = k; this.marelleTile(dst, T[A.seq[k]].c || '#ffd84a'); Sfx.coin(); if (dst.say) this.hsay(dst.say, 900); }
        } else if (A.hop < A.seq.length) { A.hop = A.seq.length; if (a.steps && a.quads) this.marelleGlow(a.quads, Object.keys(a.quads), true); this.showPose('bravo'); this.heroJump(); Sfx.win(); this.hsay(a.endSay || 'Bravo, j’ai gagné la marelle ! 🎉', 2000); this.puff(this.pos.x, this.pos.y - 0.25, '⭐', 5); }
      }
      if (A.t > A.dur && !A.cineOn) { this.hscaleOv = null; this.endAction(); }
    } else if (A.kind === 'cross') {
      if (A.phase === 'walk') {
        const u = Math.min(1, A.t / A.dur), target = u * A.L; let i = 1; while (i < A.pts.length - 1 && A.pts[i].l < target) i++;
        const p0 = A.pts[i - 1], p1 = A.pts[i], f = Math.max(0, Math.min(1, (target - p0.l) / Math.max(1e-6, p1.l - p0.l)));
        this.pos = { x: p0.x + (p1.x - p0.x) * f, y: p0.y + (p1.y - p0.y) * f }; this.hscaleOv = A.a.scaleMin ? Math.max(this.scaleAt(this.pos.y), A.a.scaleMin) : null;
        this.hfacing = p1.x >= p0.x ? 1 : -1; this.showPose(['marche_1', 'marche_2', 'marche_3', 'marche_4'][Math.floor(A.t / (A.a.run ? 0.09 : 0.13)) % 4]);
        const fr = Math.floor(A.t / 0.26) % 2; if (fr !== A.last) { A.last = fr; Sfx.step(); }
        if (u >= 1) { A.phase = 'end'; A.t = 0; this.showPose('joie'); this.heroJump(); Sfx.coin(); if (A.a.icon) this.puff(this.pos.x, this.pos.y - 0.25, A.a.icon, 3); if (A.a.lookBack) { this.showPose('dos'); A.turned = 1; } else { if (A.a.endSay && !(A.a.voice && Sfx.soundOn())) this.hsay(A.a.endSay, 1600); if (A.a.voice && !A.cineOn && Sfx.soundOn()) Voice.playUrl(A.a.voice); } }
      } else { if (A.a.turn && A.t > 0.7 && !A.turned) { A.turned = 1; this.showPose(A.a.endPose || 'face'); }
        if (A.a.lookBack && A.t > A.a.lookBack && A.turned === 1) { A.turned = 2; this.showPose(A.a.endPose || 'face'); this.hfacing = 1; this.layoutHero(); this.heroJump(); if (A.a.endSay && !(A.a.voice && Sfx.soundOn())) this.hsay(A.a.endSay, 2600); if (A.a.voice && Sfx.soundOn()) Voice.playUrl(A.a.voice); } if (A.t > (A.a.hold || 1.4) && !A.cineOn) this.endAction(); }
    } else if (A.kind === 'flip') {
      if (!A.flipped && A.t > 0.5) { A.flipped = true; this.mkFlip(A.a.glass); Sfx.tap(); this.showPose('geste_1'); }
      if (A.flipped && !A.sand && A.t > 1.8) { A.sand = true; this.puff(A.a.glass.x + A.a.glass.w / 2, A.a.glass.y + A.a.glass.h * 0.6, '✨', 4); this.hsay(A.a.endSay || 'Le sable du temps s’écoule…', 1800); Sfx.bloop(); this.showPose('joie'); }
      if (A.t > A.dur && !A.cineOn) { Sfx.win(); this.endAction(); }
    } else if (A.kind === 'leap') {
      if (this.st && this.hx.cfg.props && this.hx.cfg.props.key) this.leap3(A); else this.leap2(A);
    } else if (A.kind === 'stir' && this.st && this.hx.cfg.props && this.hx.cfg.props.spot) {
      this.stir3(A, dt);
    } else if (A.kind === 'stir') {
      this.hfacing = 1; const fr = Math.floor(A.t / 0.38) % 2;
      if (!this.h3) this.showPose(fr ? 'remue_2' : 'remue_1');
      if (fr !== A.last) { A.last = fr; Sfx.bloop(); this.puff(A.a.puff.x, A.a.puff.y, Math.random() < 0.5 ? '🫧' : '✨', 2); }
      if (A.t > A.dur && !A.cineOn) { this.hsay(A.a.endSay || 'Ça sent bon !', 1500); this.puff(A.a.puff.x, A.a.puff.y, '⭐', 4); Sfx.win(); this.endAction(); }
    } else if (A.kind === 'globe') {
      if (this.st) this.hx.globeIK(A.t, A.a);
      const T = Math.max(2.5, A.dur - 2.2); this.spinGlobe(A.t, T); this.hfacing = A.a.globe.x >= this.pos.x ? 1 : -1;
      if (!this.h3) this.showPose(A.t < 1.1 ? 'geste_1' : A.t < T - 0.5 ? 'trois_quarts' : 'geste_2');
      if (A.t < T - 0.6) { const fr = Math.floor(A.t / 0.6) % 2; if (fr !== A.last) { A.last = fr; Sfx.bloop(); this.puff(A.a.globe.x, A.a.globe.y - 0.05, '✨', 2); } }
      else if (!A.stopped) { A.stopped = true; Sfx.coin(); this.puff(A.a.globe.x, A.a.globe.y, '🗾', 1); this.puff(A.a.globe.x, A.a.globe.y - 0.03, '✨', 4); this.hsay(A.a.endSay || 'Le monde est grand !', 2000); if (this.globeG) this.globeG.cv.classList.add('stop'); }
      if (A.t > A.dur && !A.cineOn) { Sfx.win(); this.endAction(); }
    } else if (A.kind === 'sit') {
      this.hfacing = 1;
      const tween = (from, to, u) => { const e = u * u * (3 - 2 * u); return { x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e }; };
      if (A.phase === 'in') {
        const u = Math.min(1, A.t / A.dIn);
        this.showPose(this.h3 ? 'marche_1' : (A.a.sitPose || 'assise')); yawDir(A.floor.x - A.start.x, A.floor.y - A.start.y); if (!this.h3) { this.showPose(A.a.sitPose || 'assise'); }
        A.front = A.front || (this.st ? { x: A.floor.x, y: A.floor.y + 0.04 } : A.floor);
        this.pos = tween(A.start, A.front, u) ; if (!this.h3) this.pos.y -= Math.sin(u * Math.PI) * 0.03;
        if (u >= 1) { A.phase = 'down'; A.t = 0; if (this.h3) { this.hx.setYaw(0.1); this.hx.play('sit_down', { speed: 1.75, once: true }); } Sfx.tap(); }
      } else if (A.phase === 'down') {
        const k = Math.min(1, A.t / A.dDown), lift = A.a.seatLift != null ? A.a.seatLift : 0.2;
        this.pos = tween(A.front || A.floor, A.floor, Math.min(1, k * 1.3)); if (this.st) this.hx.yOff = lift * (k * k * (3 - 2 * k));
        if (A.t >= A.dDown) { A.phase = 'sit'; A.t = 0; if (this.h3) this.hx.play('sit_idle', { speed: 1 }); }
      } else if (A.phase === 'sit') {
        this.pos = { ...A.floor }; if (!A.said && A.t > 0.6) { A.said = 1; this.hsay(A.a.sitSay || 'Ah, c’est confortable !', 2000); if (A.a.sheet) { const hp = this.pos; this.puff(hp.x + 0.03, hp.y - 0.2, '📄', 1); this.puff(hp.x + 0.03, hp.y - 0.22, '🔢', 2); } if (A.a.icons) { const hp = this.pos; A.a.icons.forEach((ic, k) => this.puff(hp.x + 0.02, hp.y - 0.2 - k * 0.02, ic, 2)); } if (A.a.circle) this.mkCircle(A.a.circle); }
        if (A.t > A.dur && !A.cineOn) { A.phase = 'up'; A.t = 0; if (this.h3) this.hx.play('stand_up', { speed: 1.75, once: true }); }
      } else if (A.phase === 'up') {
        const k = Math.min(1, A.t / A.dUp), lift = A.a.seatLift != null ? A.a.seatLift : 0.2;
        this.pos = tween(A.floor, A.front || A.floor, k); if (this.st) this.hx.yOff = lift * (1 - k * k * (3 - 2 * k));
        if (A.t >= A.dUp) { A.phase = 'out'; A.t = 0; }
      } else {
        const u = Math.min(1, A.t / 0.6); this.showPose(this.h3 ? 'marche_1' : 'trois_quarts'); yawDir(A.start.x - A.floor.x, A.start.y - A.floor.y);
        this.pos = tween(A.front || A.floor, A.start, u); if (!this.h3) this.pos.y -= Math.sin(u * Math.PI) * 0.03;
        if (u >= 1) this.endAction();
      }
    }
    this.layoutHero();
  }

  // les images préchargées sont conservées (sinon le navigateur peut annuler un chargement en cours)
  preload() { POSES.forEach((p) => keepImg(Mimi.spriteUrl(p))); HPOSES.forEach((p) => keepImg(heroUrl(p))); }
  refreshSprite() { if (this.sprite) { this.sprite.src = Mimi.spriteUrl(this.pose); this.preload(); } }
  touch() { this.lastAct = performance.now(); this.nextIdle = this.lastAct + 6000 + Math.random() * 5000; }

  // ---------- vie de Muezza : bulles, cœurs, petites animations, sommeil ----------
  say(text, ms = 1800) {
    if (!this.actor) return;
    this.actor.querySelectorAll('.mimi-say').forEach((n) => n.remove());
    const b = el('div', 'mimi-say'); b.textContent = text; b.setAttribute('aria-hidden', 'true');
    this.actor.append(b); setTimeout(() => b.remove(), ms);
  }
  hearts(n = 4, glyph = '💗') {
    if (!this.actor || !this.motion) return;
    for (let i = 0; i < n; i++) {
      const h = el('span', 'mimi-heart'); h.textContent = glyph; h.setAttribute('aria-hidden', 'true');
      h.style.left = (30 + Math.random() * 40) + '%'; h.style.animationDelay = (i * 0.12) + 's';
      this.actor.append(h); setTimeout(() => h.remove(), 1700 + i * 120);
    }
  }
  trick(name, ms = 900) {
    if (!this.sprite || !this.motion) return;
    this.sprite.classList.remove('tr-wash', 'tr-hop', 'tr-wiggle', 'tr-stretch', 'tr-oops');
    void this.sprite.offsetWidth;
    this.sprite.classList.add('tr-' + name);
    clearTimeout(this.trickT); this.trickT = setTimeout(() => this.sprite && this.sprite.classList.remove('tr-' + name), ms);
  }
  sleep() {
    if (this.sleeping || !this.actor || this.target) return;
    this.sleeping = true; this.actor.classList.add('sleeping'); this.setPose('dort'); this.sprite.style.scale = ''; this.sprite.style.translate = ''; this.say('Zzz…', 4000);
    this.zzzT = setInterval(() => this.sleeping ? this.say('Zzz…', 2600) : clearInterval(this.zzzT), 3200);
  }
  wake(silent) {
    if (!this.sleeping) return;
    this.sleeping = false; this.actor.classList.remove('sleeping'); clearInterval(this.zzzT); if (this.pose === 'dort') this.setPose('repos');
    if (!silent) { this.say(Mimi.line('wake')); this.trick('hop', 700); Mimi.meow(1.1); }
  }
  petMimi() {
    if (!this.actor) return;
    const wasAsleep = this.sleeping; this.wake(true); this.touch();
    if (wasAsleep) { this.say(Mimi.line('wake')); this.trick('hop', 700); Mimi.meow(1.15); return; }
    const gained = Mimi.pet();
    this.setPose('joie', 1600); this.trick('wiggle', 1100); this.hearts(gained ? 5 : 3);
    this.say(Mimi.line('pet')); Mimi.purr(); Mimi.buzz([25, 40, 25, 40, 25]);
    if (gained) this.root.dispatchEvent(new CustomEvent('mimi:petted', { bubbles: true }));
  }
  // kind : 'ok' | 'ko' | 'win'
  mimiReact(kind) {
    if (!this.actor) return;
    this.wake(true); this.touch();
    if (kind === 'ko') { this.heroPose('oups', 1800); this.setPose('repos'); this.trick('oops', 1000); this.say(Mimi.line('ko')); return; }
    this.heroPose(kind === 'win' ? 'bravo' : 'joie', kind === 'win' ? 2600 : 1700);
    this.setPose('joie', 1700); this.trick(kind === 'win' ? 'hop' : 'wiggle', 1000);
    this.hearts(kind === 'win' ? 6 : 2, kind === 'win' ? '⭐' : '💗'); this.say(Mimi.line(kind)); Mimi.meow(kind === 'win' ? 1.2 : 1);
  }
  idleStep(now) {
    if (this.anim || this.target || this.mimiMoving || !this.motion || this.sleeping) return;
    if (now - this.lastAct > 32000) { this.sleep(); return; }
    if (now < this.nextIdle) return;
    this.nextIdle = now + 6000 + Math.random() * 6000;
    if (this.hero && Math.random() < 0.45) {
      // Maissa, gaie et curieuse : un petit rire et un mot pour Muezza
      const L = ['Muezza, viens voir !', 'Tu as vu, Muezza ? C’est magnifique !', 'Hihi ! Muezza, on explore ?', 'Oh, regarde Muezza, là-bas !', 'Je suis contente d’être ici avec toi, Muezza !', 'Muezza, je me demande ce qu’il y a derrière…', 'On va découvrir plein de choses, Muezza !'];
      const R = ['Miaou !', 'Prrrr…', 'Miaou miaou !', 'Mrrr ?'];
      this.hsay(L[Math.floor(Math.random() * L.length)], 2300); Sfx.laugh(); this.heroPose('joie', 1500);
      setTimeout(() => { if (!this.destroyed && !this.sleeping) { this.say(R[Math.floor(Math.random() * R.length)], 1300); Mimi.meow(1); } }, 1500);
      return;
    }
    if (Math.random() < 0.3 && this.hpose === 'trois_quarts') { this.heroPose(Math.random() < 0.5 ? 'face' : 'reflexion', 1800); }
    const r = Math.random();
    if (r < 0.3) { this.setPose('toilette', 2600); }
    else if (r < 0.5) { this.facing = -this.facing; this.layoutActor(); this.say(Mimi.line('idle'), 1400); }
    else if (r < 0.72) { this.setPose('bond', 600); this.trick('hop', 700); }
    else if (r < 0.9) { this.trick('stretch', 1500); }
    else { this.setPose('assis', 3000); this.say(Mimi.line('idle'), 1600); Mimi.meow(0.9); }
  }

  setPose(p, ms = 0) {
    this.pose = p;
    if (this.sprite) this.sprite.src = Mimi.spriteUrl(p);
    if (ms) { clearTimeout(this.poseT); this.poseT = setTimeout(() => this.setPose('repos'), ms); }
  }

  celebrate() { this.setPose('joie', 1800); this.heroPose('bravo', 2400); }

  // pose de Maissa selon l'activité de la zone touchée
  poseFor(h) {
    const a = h.act || {};
    if (h.pose) return h.pose;
    if (a.domain === 'lecture') return 'lecture';
    if (a.domain === 'ecoute') return 'ecoute';
    if (a.domain === 'expression') return 'ecrit';
    if (a.type === 'panel' && (a.panel === 'gallery' || a.panel === 'mimi')) return a.panel === 'mimi' ? 'joie' : 'coffre';
    if (a.type === 'mission' || a.type === 'open') return 'reflexion';
    return 'face';
  }

  updateCamera(snap) {
    const W = this.W, H = this.H;
    const focus = this.actor ? this.pos : { x: 0.5, y: 0.5 };
    const fx = this.actor ? focus.x : 0.5, fy = this.actor ? Math.min(focus.y, 0.7) : 0.5;
    let tx = clamp(W / 2 - fx * this.iw, W - this.iw, 0);
    let ty = clamp(H / 2 - fy * this.ih, H - this.ih, 0);
    if (this.def.fit === 'contain') { tx = this.iw > W ? (this.manual ? tx : (W - this.iw) / 2) : (W - this.iw) / 2; ty = 56 + (H - 56 - this.ih) / 2; }
    if (this.manual) {
      if (performance.now() > this.manual.until && !this.target) this.manual = null;
      else { tx = this.manual.ox; ty = this.manual.oy; }
    }
    // petite parallaxe à la souris / inclinaison
    const px = this.motion && this.def.fit !== 'contain' ? -this.tilt.x * 14 : 0, py = this.motion && this.def.fit !== 'contain' ? -this.tilt.y * 8 : 0;
    const k = snap ? 1 : this.manual ? 0.35 : 0.08;
    this.cam.ox += (tx - this.cam.ox) * k; this.cam.oy += (ty - this.cam.oy) * k;
    const ox = this.cam.ox + px, oy = this.cam.oy + py;
    this.world.style.transform = `translate3d(${ox.toFixed(1)}px,${oy.toFixed(1)}px,0)`;
    // premier plan : se déplace plus vite que le décor (profondeur)
    this.fore.style.transform = `translate3d(0,${(oy * 0.1).toFixed(1)}px,0)`;
    this.camNow = { ox, oy };
    this.updateEdges();
  }

  // Muezza trottine derrière Maissa et s'arrête près d'elle
  // cases du tapis (quadrilatères en coordonnées de la scène) qui brillent en arc-en-ciel
  marelleGlow(quads, keys, big) {
    if (!quads || !keys) return;
    const NS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 1000 1000'); svg.setAttribute('preserveAspectRatio', 'none'); svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('class', 'mar-glow' + (big ? ' big' : ''));
    const gid = 'mg' + Math.random().toString(36).slice(2, 8);
    svg.innerHTML = `<defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff3b5c"/><stop offset=".17" stop-color="#ff9a1f"/><stop offset=".34" stop-color="#ffe14a"/><stop offset=".5" stop-color="#3fe07a"/><stop offset=".67" stop-color="#3fa8ff"/><stop offset=".84" stop-color="#7b5cff"/><stop offset="1" stop-color="#e05cff"/></linearGradient></defs>` +
      keys.filter((k) => quads[k]).map((k) => `<polygon points="${quads[k].map(([x, y]) => `${(x * 1000).toFixed(1)},${(y * 1000).toFixed(1)}`).join(' ')}" fill="url(#${gid})" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/>`).join('');
    this.world.append(svg); setTimeout(() => svg.remove(), big ? 2200 : 1300);
  }
  marelleTile(t, c) {
    const d = el('div', 'mar-tile'); d.setAttribute('aria-hidden', 'true');
    d.style.cssText = `left:${t.x * 100}%;top:${(t.ty || t.y) * 100}%;width:${(t.w || 0.06) * 100}%;--c:${c}`;
    this.world.append(d); setTimeout(() => d.remove(), 1600);
  }
  // Muezza traverse le lac à la nage, se secoue sur l'autre rive, puis revient
  runSwim(dt, MT) {
    const T = this.mtrick; T.t += dt;
    if (!this.mScaleOv) this.mScaleOv = this.scaleAt(MT.floor || 0.88) * 0.9;
    const pose = (p) => { if (this.pose !== p) { this.pose = p; this.sprite.src = Mimi.spriteUrl(p); } };
    const lerp = (a, b, u) => ({ x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u });
    const P = MT.path; // [rive de départ (sol), entrée dans l'eau, …, sortie de l'eau, autre rive]
    const swimLeg = (a, b, dur, next) => { const u = Math.min(1, T.t / dur); this.mpos = lerp(a, b, u); this.mpos.y += Math.sin(T.t * 7) * 0.004; this.facing = b.x >= a.x ? 1 : -1; pose(Math.floor(T.t / 0.22) % 2 ? 'pas_droit' : 'pas_gauche'); if ((T.k = (T.k || 0) + dt) > 0.6) { T.k = 0; this.puff(this.mpos.x - this.facing * 0.02, this.mpos.y - 0.01, '💧', 1); } if (u >= 1) { T.ph = next; T.t = 0; } };
    const hop = (a, b, dur, next, clipAfter) => { const u = Math.min(1, T.t / dur); const q = lerp(a, b, u); q.y -= Math.sin(Math.PI * u) * 0.06; this.mpos = q; pose('bond'); this.facing = b.x >= a.x ? 1 : -1; if (u >= 1) { T.ph = next; T.t = 0; this.sprite.style.clipPath = clipAfter ? 'inset(0 0 46% 0)' : ''; this.puff(b.x, b.y - 0.02, clipAfter ? '💦' : '💨', 3); } };
    if (T.ph === 'run') {
      const g = P[0], dx = (g.x - this.mpos.x) * this.iw, dy = (g.y - this.mpos.y) * this.ih, d = Math.hypot(dx, dy);
      if (d > this.iw * 0.01) { const k = Math.min(1, this.iw * 0.6 * dt / d); this.mpos.x += dx * k / this.iw; this.mpos.y += dy * k / this.ih; if (Math.abs(dx) > 2) this.facing = dx > 0 ? 1 : -1; this.mwalkT += dt; pose(Math.floor(this.mwalkT / 0.09) % 2 ? 'pas_droit' : 'pas_gauche'); }
      else { T.ph = 'in'; T.t = 0; if (!this.h3) this.hsay(MT.say || 'Muezza nage !', 2600); }
      if (T.t > 6) { T.ph = 'in'; T.t = 0; }
    } else if (T.ph === 'in') hop(P[0], P[1], 0.5, 'swim', true);
    else if (T.ph === 'swim') swimLeg(P[1], P[2], MT.swimDur || 4.5, 'out');
    else if (T.ph === 'out') hop(P[2], P[3], 0.45, 'rest', false);
    else if (T.ph === 'rest') { pose(T.t < 1.2 ? 'joie' : 'repos'); if (!T.sh && T.t > 0.3) { T.sh = 1; this.puff(this.mpos.x, this.mpos.y - 0.03, '💦', 5); } if (T.t > (MT.rest || 2.6)) { T.ph = 'in2'; T.t = 0; } }
    else if (T.ph === 'in2') hop(P[3], P[2], 0.45, 'swim2', true);
    else if (T.ph === 'swim2') swimLeg(P[2], P[1], (MT.swimDur || 4.5) * 0.75, 'out2');
    else if (T.ph === 'out2') hop(P[1], P[0], 0.45, 'done', false);
    else { this.mtrick = null; this.mScaleOv = 0; this.trickDone = true; this.mFastUntil = performance.now() + 3500; this.mimiGoal = null; this.puff(this.mpos.x, this.mpos.y - 0.03, '💦', 3); }
    this.layoutActor();
  }
  runTrick(dt, MT) {
    if (MT.kind === 'swim') { this.runSwim(dt, MT); return; }
    const T = this.mtrick; T.t += dt;
    if (!this.mScaleOv) this.mScaleOv = this.scaleAt(MT.floor || 0.88) * 1.05;
    const tub = { x: MT.x, y: MT.y }, pre = { x: MT.x + (MT.dx || 0.07), y: MT.floor || 0.88 };
    const lerp = (a, b, u) => ({ x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u });
    const pose = (p) => { if (this.pose !== p) { this.pose = p; this.sprite.src = Mimi.spriteUrl(p); } };
    if (T.ph === 'run') {
      const dx = (pre.x - this.mpos.x) * this.iw, dy = (pre.y - this.mpos.y) * this.ih, d = Math.hypot(dx, dy);
      if (d > this.iw * 0.01) { const k = Math.min(1, this.iw * 0.6 * dt / d); this.mpos.x += dx * k / this.iw; this.mpos.y += dy * k / this.ih; if (Math.abs(dx) > 2) this.facing = dx > 0 ? 1 : -1; this.mwalkT += dt; pose(Math.floor(this.mwalkT / 0.09) % 2 ? 'pas_droit' : 'pas_gauche'); this.mimiMoving = true; }
      else { T.ph = 'jump'; T.t = 0; T.from = { ...this.mpos }; this.facing = tub.x > this.mpos.x ? 1 : -1; if (!this.h3) this.hsay(MT.say || 'Muezza, non !', 2400); }
      if (T.t > 6) { T.ph = 'jump'; T.t = 0; T.from = { ...this.mpos }; }
    } else if (T.ph === 'jump') {
      const u = Math.min(1, T.t / 0.55), q = lerp(T.from, tub, u); q.y -= Math.sin(Math.PI * u) * 0.14; this.mpos = q; pose('bond');
      if (u >= 1) { T.ph = 'in'; T.t = 0; this.sprite.style.clipPath = 'inset(0 0 34% 0)'; pose('joie'); this.puff(tub.x, tub.y - 0.06, MT.icon || '❄️', 7); Sfx.bloop(); }
    } else if (T.ph === 'in') {
      if (!T.p2 && T.t > 0.7) { T.p2 = 1; this.puff(tub.x, tub.y - 0.08, '🧊', 4); }
      if (T.t > (MT.hold || 1.8)) { T.ph = 'out'; T.t = 0; this.sprite.style.clipPath = ''; this.facing = pre.x > tub.x ? 1 : -1; }
    } else if (T.ph === 'out') {
      const u = Math.min(1, T.t / 0.5), q = lerp(tub, pre, u); q.y -= Math.sin(Math.PI * u) * 0.1; this.mpos = q; pose('bond');
      if (u >= 1) { this.mtrick = null; this.mScaleOv = 0; this.trickDone = true; this.mFastUntil = performance.now() + 3500; this.mimiGoal = null; pose('pas_droit'); this.puff(this.mpos.x, this.mpos.y - 0.04, '💨', 2); }
    }
    this.layoutActor();
  }

  followMimi(dt, heroMoving, now) {
    // petite bêtise de Muezza propre à certaines salles (ex. : saut dans le seau de glaçons du labo des trois états)
    const MT = this.def.mimiTrick;
    if (MT && this.motion && !this.trickDone) {
      if (!this.trickAt) this.trickAt = performance.now() + (MT.delay || 4500);
      if (!this.mtrick && performance.now() > this.trickAt && !this.anim && !this.target && !heroMoving && !this.sleeping) this.mtrick = { ph: 'run', t: 0 };
      if (this.mtrick) { this.runTrick(dt, MT); return; }
    }
    const hp = this.anim && (this.anim.kind === 'climb' || this.anim.kind === 'leap') ? this.anim.start : this.pos;
    if (this.mimiGoal && (heroMoving || performance.now() - this.mimiGoalT > 15000)) this.mimiGoal = null;
    const want = this.mimiGoal || { x: hp.x - this.hfacing * 0.075, y: Math.min(0.985, hp.y + 0.012) };
    if (this.sleeping && !heroMoving) { this.mimiMoving = false; return; }
    if (heroMoving) this.wake(true);
    const dx = (want.x - this.mpos.x) * this.iw, dy = (want.y - this.mpos.y) * this.ih, d = Math.hypot(dx, dy);
    const near = this.iw * 0.03;
    if (d > near) {
      const sp = Math.max(this.iw * (performance.now() < (this.mFastUntil || 0) ? 0.75 : 0.34) * dt, d * dt * 3.2);
      const k = Math.min(1, sp / d);
      this.mpos.x += dx * k / this.iw; this.mpos.y += dy * k / this.ih;
      if (Math.abs(dx) > 3) this.facing = dx > 0 ? 1 : -1;
      this.mimiMoving = true; this.mwalkT += dt;
      const p = Math.floor(this.mwalkT / 0.13) % 2 ? 'pas_droit' : 'pas_gauche';
      if (this.pose !== p) { this.pose = p; this.sprite.src = Mimi.spriteUrl(p); }
      this.layoutActor();
    } else if (this.mimiMoving) {
      this.mimiMoving = false;
      if (this.pose === 'pas_droit' || this.pose === 'pas_gauche') this.setPose('repos');
    }
  }

  tick(now) {
    if (this.destroyed) return;
    const dt = Math.min(0.08, (now - this.last) / 1000);
    this.last = now;
    let moving = false;
    const hadAnim = !!this.anim;
    if (hadAnim) this.stepAnim(dt);
    if (this.def.stardust && this.hero) this.dust(now);
    if (hadAnim) { /* animation en cours */ }
    else if (this.actor && this.target) {
      const dx = this.target.x - this.pos.x, dy = this.target.y - this.pos.y;
      const frac = Math.hypot(dx * this.iw, dy * this.ih) / this.iw;
      const speed = Math.min(0.46, Math.max(0.22, frac / 2)); // vraie marche (pas de glissade) : vitesse d'enfant, foulées visibles
      const dpx = Math.hypot(dx * this.iw, dy * this.ih);
      const step = speed * this.iw * dt * (0.6 + 0.4 * this.scaleAt(this.pos.y));
      if (dpx <= Math.max(step, 2)) {
        this.pos = { ...this.target }; this.target = null;
        this.heroPose('trois_quarts');
        const cb = this.pending; this.pending = null; cb && cb();
      } else {
        moving = true;
        this.pos.x += (dx * this.iw / dpx) * step / this.iw; this.pos.y += (dy * this.ih / dpx) * step / this.ih;
        if (Math.abs(dx) > 0.002) this.hfacing = dx > 0 ? 1 : -1;
        this.walkT += dt;
        const p = WALK[Math.floor(this.walkT / 0.15) % 8];
        if (this.hpose !== p) { this.showPose(p); if (p === 'marche_1' || p === 'marche_5') Sfx.step(); }
        if (this.h3) this.hx.setYaw(Math.atan2(dx * this.iw, dy * this.ih * 2.2));
      }
      this.layoutHero();
    }
    if (this.actor) this.followMimi(dt, moving, now);
    if (this.actor && this.motion) this.idleStep(now);
    if (this.hsprite && this.motion) {
      const bob = moving ? 0 : Math.sin(now / 900) * -1.2;
      const jk = this.jumpT0 ? (performance.now() - this.jumpT0) / 650 : 2; const jump = jk < 1 ? Math.sin(Math.PI * jk) : 0; if (jk >= 1) this.jumpT0 = 0;
      this.hsprite.style.translate = `0 ${(bob - jump * 0.09 * this.ih * (this.def.heroH || 0.34)).toFixed(1)}px`;
      if (this.st) this.hx.jump = jump * 0.3;
      this.hsprite.style.scale = moving ? '1' : `1 ${(1 + Math.sin(now / 900) * 0.008).toFixed(4)}`;
    }
    if (this.actor && this.motion && !this.mimiMoving && !this.sleeping) this.sprite.style.scale = `1 ${(1 + Math.sin(now / 700) * 0.012).toFixed(4)}`;
    if (this.actor && this.motion && !this.sleeping) {
      const bob = this.mimiMoving ? Math.sin(this.mwalkT * 22) * 3 : Math.sin(now / 600) * 1.5;
      this.sprite.style.translate = `0 ${bob.toFixed(1)}px`;
    }
    if (this.st && !(this.anim && (this.anim.s3 || this.anim.free))) this.hx.setFloor(this.pos.x, this.pos.y);
    if (this.k3) this.syncKitty();
    if (this.h3) this.hx.frame(this.motion ? dt : 0);
    if (this.cr) this.critterStep(dt);
    if (this.bfs) this.butterStep(dt);
    this.updateCamera(false);
    this.drawParticles(now, dt);
    this.raf = requestAnimationFrame(this.tick);
  }

  // ---------- particules ----------
  initParticles() {
    const n = this.motion ? 30 : 0;
    this.parts = Array.from({ length: n }, () => ({
      x: Math.random(), y: Math.random(), r: 0.8 + Math.random() * 2.6, v: 0.01 + Math.random() * 0.03,
      z: 0.4 + Math.random() * 1.2, ph: Math.random() * 6.28,
    }));
  }

  drawParticles(now, dt) {
    const c = this.fx.getContext('2d');
    if (!c) return;
    const W = this.fx.width, H = this.fx.height;
    c.clearRect(0, 0, W, H);
    if (!this.parts.length) return;
    c.globalCompositeOperation = 'lighter';
    const tint = this.def.tint || '#ffe9a0';
    const cx = (this.camNow ? this.camNow.ox : 0);
    const glow = this.glowSprite(tint), Wv = this.W, Hv = this.H;
    for (const p of this.parts) {
      p.y -= p.v * dt * p.z; if (p.y < -0.05) { p.y = 1.05; p.x = Math.random(); }
      const x = ((p.x * Wv * 1.3 + cx * p.z * 0.35 + Math.sin(now / 1500 + p.ph) * 14) % (Wv * 1.3) + Wv * 1.3) % (Wv * 1.3) - Wv * 0.15;
      const y = p.y * Hv;
      const a = 0.35 + 0.35 * Math.sin(now / 700 + p.ph);
      const rad = p.r * 4 * p.z * this.fxScale;
      c.globalAlpha = Math.max(0, Math.min(1, a));
      c.drawImage(glow, x * this.fxScale - rad, y * this.fxScale - rad, rad * 2, rad * 2);
    }
    c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
  }

  glowSprite(tint) {
    if (this.glow && this.glowTint === tint) return this.glow;
    const g = document.createElement('canvas'); g.width = g.height = 64;
    const c = g.getContext('2d'), gr = c.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, hexA(tint, 1)); gr.addColorStop(1, hexA(tint, 0));
    c.fillStyle = gr; c.fillRect(0, 0, 64, 64);
    this.glow = g; this.glowTint = tint; return g;
  }

  /** Met à jour les badges (étoiles/niveau) des zones, fournis par le jeu. */
  decorate(fn) {
    this.hotspots.forEach((h) => {
      const m = fn(h.def);
      const meta = h.el.querySelector('.hs-meta');
      if (!m) { meta.textContent = ''; h.el.classList.remove('done'); return; }
      meta.textContent = m.text || '';
      h.el.classList.toggle('done', !!m.done);
      h.el.classList.toggle('suggest', !!m.suggest);
    });
  }

  suggest(id) { this.hotspots.forEach((h) => h.el.classList.toggle('suggest', h.def.id === id)); }

  // poussière d'étoiles qui suit Maissa quand elle se déplace (Observatoire)
  dust(now) {
    if (this.motion === false || document.hidden) return;
    const p = this.pos, lp = this.dustP || (this.dustP = { x: p.x, y: p.y });
    const moved = Math.hypot((p.x - lp.x) * this.iw, (p.y - lp.y) * this.ih);
    if (moved < 6 || now - (this.dustT || 0) < 70) return;
    this.dustT = now; this.dustP = { x: p.x, y: p.y };
    if (this.world.querySelectorAll('.sdust').length > 40) return;
    const h = parseFloat(this.hero.style.height) || 100;
    for (let k = 0; k < 2; k++) {
      const d = el('span', 'sdust' + (Math.random() < 0.18 ? ' big' : '')); d.setAttribute('aria-hidden', 'true');
      const sz = (0.012 + Math.random() * 0.014) * this.ih;
      d.style.cssText = `left:${p.x * this.iw + (Math.random() - 0.5) * h * 0.35}px;top:${p.y * this.ih - h * (0.25 + Math.random() * 0.4)}px;width:${sz}px;height:${sz}px;--dx:${(Math.random() - 0.5) * h * 0.25}px;--dy:${-h * (0.05 + Math.random() * 0.15)}px;z-index:${Math.round(p.y * 100)}`;
      this.world.append(d); setTimeout(() => d.remove(), 1700);
    }
  }

  // pluie de lettres (le prénom de l'héroïne) qui tombent doucement dans le décor
  startRain(word) {
    let i = 0;
    const drop = () => {
      if (this.destroyed || !this.world) return;
      if (document.hidden || this.world.querySelectorAll('.rain-l').length > 26) return;
      const c = word[i++ % word.length], d = el('span', 'rain-l'); d.textContent = c; d.setAttribute('aria-hidden', 'true');
      const dur = 6 + Math.random() * 4, size = (0.03 + Math.random() * 0.03) * this.ih;
      d.style.cssText = `left:${(0.03 + Math.random() * 0.94) * this.iw}px;font-size:${size}px;animation-duration:${dur}s,${2 + Math.random() * 2}s;--sw:${(Math.random() - 0.5) * 0.08 * this.iw}px;--fall:${this.ih * 1.05}px`;
      this.world.append(d); setTimeout(() => d.remove(), dur * 1000 + 200);
    };
    for (let k = 0; k < 7; k++) setTimeout(drop, k * 260);
    this.rainT = setInterval(drop, 550);
  }

  // ---------- papillons qui volent (ailes en 3D qui battent, vol papillonnant, se posent sur les fleurs) ----------
  mkButterflies(list) {
    this.bfs = list.map((B) => {
      const e = el('div', 'bfly'), src = asset(B.img); e.setAttribute('aria-hidden', 'true');
      e.innerHTML = `<i class="bw l" style="background-image:url(${src})"></i><i class="bw r" style="background-image:url(${src})"></i>`;
      this.world.append(e);
      e.addEventListener('pointerdown', (ev) => { ev.stopPropagation(); const b = this.bfs.find((x) => x.e === e); if (b) { b.mode = 'fly'; b.t = 0; b.rest = 0; b.boost = 2.2; b.tg = this.bfTarget(b, true); this.puff(b.p.x, b.p.y, '✨', 3); Sfx.bloop(); } });
      return { B, e, p: { x: B.x, y: B.y }, v: { x: 0, y: 0 }, mode: 'rest', t: 0, rest: 1 + Math.random() * 2, ph: Math.random() * 6, tg: null, boost: 1, ang: 0 };
    });
    this.bfs.forEach((b) => { b.tg = this.bfTarget(b); });
  }
  bfTarget(b, far) {
    const A = b.B.area || { x0: 0.05, x1: 0.95, y0: 0.12, y1: 0.7 }, perches = b.B.perches || [];
    if (!far && perches.length && Math.random() < 0.45) { const q = perches[Math.floor(Math.random() * perches.length)]; return { x: q[0], y: q[1], land: true }; }
    return { x: A.x0 + Math.random() * (A.x1 - A.x0), y: A.y0 + Math.random() * (A.y1 - A.y0), land: false };
  }
  butterStep(dt) {
    for (const b of this.bfs) {
      b.t += dt; b.ph += dt;
      let flap;
      if (b.mode === 'rest') { flap = 0.5 + 0.5 * Math.sin(b.ph * 3); if (b.t > b.rest) { b.mode = 'fly'; b.t = 0; b.tg = this.bfTarget(b); } }
      else {
        const dx = (b.tg.x - b.p.x) * this.iw, dy = (b.tg.y - b.p.y) * this.ih, d = Math.hypot(dx, dy);
        const sp = (0.07 * this.iw) * (b.boost || 1); b.boost = Math.max(1, (b.boost || 1) - dt * 0.6);
        // papillonnage : trajectoire ondulée
        const wob = Math.sin(b.ph * 5.3) * 0.6 + Math.sin(b.ph * 2.1) * 0.4;
        const ax = dx / (d || 1) * sp - (-dy / (d || 1)) * wob * sp * 0.5, ay = dy / (d || 1) * sp + (dx / (d || 1)) * wob * sp * 0.5 + Math.sin(b.ph * 7) * sp * 0.4;
        b.v.x += (ax - b.v.x) * Math.min(1, dt * 2.5); b.v.y += (ay - b.v.y) * Math.min(1, dt * 2.5);
        b.p.x += b.v.x * dt / this.iw; b.p.y += b.v.y * dt / this.ih;
        flap = Math.abs(Math.sin(b.ph * 16));
        if (d < 12 || b.t > 9) { if (b.tg.land) { b.mode = 'rest'; b.t = 0; b.rest = 2 + Math.random() * 4; } else { b.t = 0; b.tg = this.bfTarget(b); } }
        b.ang += ((Math.atan2(b.v.y, b.v.x) * 180 / Math.PI + 90) - b.ang) * Math.min(1, dt * 4);
      }
      const sz = (b.B.size || 0.03) * this.iw * (0.75 + 0.35 * this.scaleAt(Math.max(0.6, b.p.y)));
      const fa = 8 + flap * 68;
      b.e.style.cssText = `left:${b.p.x * this.iw}px;top:${b.p.y * this.ih}px;width:${sz}px;height:${sz * 0.84}px;transform:translate(-50%,-50%) rotate(${(b.mode === 'rest' ? 0 : b.ang * 0.35).toFixed(1)}deg)`;
      b.e.firstChild.style.transform = `rotateY(${fa.toFixed(0)}deg)`; b.e.lastChild.style.transform = `rotateY(${(-fa).toFixed(0)}deg)`;
    }
  }

  // ---------- petit animal qui jaillit (ex. : l'écureuil de la forêt vivante) ----------
  critterGo() {
    if (this.destroyed || this.cr) return;
    const C = this.def.critter, e = el('div', 'critter'), im = el('img', 'cr-img');
    im.alt = ''; im.draggable = false; im.src = asset(C.img.run); e.setAttribute('aria-hidden', 'true'); e.append(el('i', 'cr-shadow'), im); this.world.append(e);
    [...Object.values(C.img), ...(C.walk || [])].forEach((u) => { const i = new Image(); i.src = asset(u); });
    const near = () => ({ x: Math.max(0.12, Math.min(0.88, this.pos.x + (this.pos.x > C.from.x ? -1 : 1) * (C.kid ? 0.14 : 0.075))), y: Math.min(0.97, this.pos.y + 0.01) });
    this.cr = { C, e, im, ph: 'pop', t: 0, p: { ...C.from }, a: { ...C.from }, b: { ...C.land }, face: C.land.x >= C.from.x ? 1 : -1, near };
    if (this.motion) Sfx.bloop();
  }
  critterStep(dt) {
    const R = this.cr, C = R.C, sm = (u) => u * u * (3 - 2 * u);
    R.t += dt; let pose = 'run', hop = 0, pop = 1;
    const leg = (a, b, dur, hgt, next) => { const u = Math.min(1, R.t / dur); R.p = { x: a.x + (b.x - a.x) * sm(u), y: a.y + (b.y - a.y) * u }; hop = Math.sin(Math.PI * u) * hgt; R.face = b.x >= a.x ? 1 : -1; if (u >= 1) { R.ph = next; R.t = 0; } };
    if (R.ph === 'pop') { pop = Math.min(1, R.t / 0.35); pose = 'sit'; R.face = C.land.x >= C.from.x ? 1 : -1; if (R.t > 0.9) { R.ph = 'leap'; R.t = 0; } }
    else if (R.ph === 'leap') { pose = 'jump'; leg(C.from, C.land, C.leapDur || 0.75, C.leapH != null ? C.leapH : 0.07, 'hops'); if (R.ph === 'hops') { R.a = { ...C.land }; R.b = R.near(); R.hopN = 0; } }
    else if (R.ph === 'hops') {
      const dur = C.hopDur || 0.36, k = Math.floor(R.t / dur), u = (R.t % dur) / dur, n = Math.max(2, Math.round(Math.hypot((R.b.x - R.a.x) * this.iw, (R.b.y - R.a.y) * this.ih) / (this.iw * 0.045)));
      if (k >= n) { R.p = { ...R.b }; R.ph = 'hello'; R.t = 0; this.hfacing = R.p.x >= this.pos.x ? 1 : -1; this.heroPose('joie', 2400); if (!(C.voice && Sfx.soundOn())) this.hsay(C.say || 'Oh ! Bonjour, petit écureuil !', 2600); Sfx.coin(); this.puff(R.p.x, R.p.y - (C.kid ? 0.3 : 0.12), C.puff || '🌰', 2); if (C.voice && Sfx.soundOn()) Voice.playUrl(C.voice); }
      else { const f = (k + u) / n; R.p = { x: R.a.x + (R.b.x - R.a.x) * f, y: R.a.y + (R.b.y - R.a.y) * f }; hop = Math.sin(Math.PI * u) * (C.hopH != null ? C.hopH : 0.025); pose = u < 0.5 ? 'jump' : 'run'; R.face = R.b.x >= R.a.x ? 1 : -1; if (k !== R.hopN) { R.hopN = k; Sfx.step(); } }
    } else if (R.ph === 'hello') { pose = 'sit'; R.face = this.pos.x >= R.p.x ? 1 : -1; hop = Math.max(0, Math.sin(R.t * 9)) * (R.t < 1.2 ? 0.008 : 0); if (R.t > (C.hold || 3.4)) { R.ph = 'back'; R.t = 0; R.a = { ...R.p };
      // ex. dans la grande salle : dès qu'elle a fini de dire coucou à Mohamed, Maissa monte l'escalier
      if (C.after && !this.afterDone && !this.anim && !document.querySelector('.dlg-wrap')) { const nx = this.def.hotspots.find((x) => x.id === C.after); if (nx) { this.afterDone = true; this.activate(nx); } } } }
    else if (R.ph === 'back') { pose = C.kid ? (Math.floor(R.t / 0.15) % 2 ? 'run' : 'jump') : 'jump'; leg(R.a, C.land, C.kid ? 1.6 : 1.1, C.kid ? 0.006 : 0.05, 'home'); }
    else if (R.ph === 'home') { pose = 'jump'; leg(C.land, C.from, C.leapDur || 0.7, C.leapH != null ? C.leapH : 0.07, 'gone'); }
    else if (R.ph === 'gone') { pop = Math.max(0, 1 - R.t / 0.3); pose = 'sit'; if (R.t > 0.35) { R.e.remove(); this.cr = null; if (C.every) this.critterT = setTimeout(() => this.critterGo(), C.every * 1000); return; } }
    // enfants (Soumaya, Mohamed) : vrai cycle de marche en 4 images, comme Maissa
    if (C.walk && (pose === 'run' || pose === 'jump') && R.ph !== 'pop' && R.ph !== 'gone') { R.wt = (R.wt || 0) + dt; pose = 'w' + (Math.floor(R.wt / (C.stepDur || 0.13)) % 4); hop = Math.abs(Math.sin(R.wt * Math.PI / (C.stepDur || 0.13) / 2)) * 0.004; }
    const src = pose[0] === 'w' && C.walk ? C.walk[+pose[1]] : (C.img[pose] || C.img.run); if (R.im.dataset.p !== pose) { R.im.dataset.p = pose; R.im.src = asset(src); }
    const base = C.kid ? C.kid * (this.def.heroH || 0.34) * Math.min(this.ih, this.iw / 1.2) * this.scaleAt(R.p.y) * (520 / 640) : (C.size || 0.1) * Math.min(this.iw, this.ih * 1.15) * this.scaleAt(R.p.y);
    R.e.style.width = base + 'px'; R.e.style.left = R.p.x * this.iw + 'px'; R.e.style.top = R.p.y * this.ih + 'px'; R.e.style.zIndex = String(Math.round(R.p.y * 100));
    const fx = C.kid && pose === 'sit' ? 1 : R.face;
    R.im.style.transform = `translateY(${(-hop * this.ih).toFixed(1)}px) scale(${fx * pop}, ${pop})`;
  }

  destroy() {
    clearTimeout(this.introT);
    if (this.onGrim) document.removeEventListener('grimoire:awake', this.onGrim);
    if (this.stopClock) this.stopClock();
    if (this.stopValley) this.stopValley();
    if (this.stopSun) this.stopSun();
    clearInterval(this.rainT); clearTimeout(this.critterT);
    if (this.stopWater) { this.stopWater(); this.stopWater = null; }
    if (this.waterArm) window.removeEventListener('pointerdown', this.waterArm);
    this.destroyed = true;
    cancelAnimationFrame(this.raf);
    this.anim = null; clearTimeout(this.poseT); clearTimeout(this.hposeT); clearTimeout(this.trickT); clearInterval(this.zzzT);
    if (this.onMimiChange) document.removeEventListener('mimi:changed', this.onMimiChange);
    window.removeEventListener('resize', this.resize);
    if (this.onMove) window.removeEventListener('pointermove', this.onMove);
    window.removeEventListener('pointermove', this.onDrag); window.removeEventListener('pointerup', this.onUp); window.removeEventListener('pointercancel', this.onCancel);
    this.ro && this.ro.disconnect();
    if (this.st && this.hx && this.hx.dispose) this.hx.dispose();
    this.root.innerHTML = '';
  }
}

const KEEP = new Map();
function keepImg(src) { if (KEEP.has(src)) return; const i = new Image(); i.src = src; KEEP.set(src, i); }
function el(tag, cls) { const e = document.createElement(tag); e.className = cls; return e; }
function clamp(v, lo, hi) { return Math.max(Math.min(lo, hi), Math.min(hi, v)); }
function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${Math.max(0, Math.min(1, a)).toFixed(3)})`;
}
