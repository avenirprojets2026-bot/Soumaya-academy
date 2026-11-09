// Het Leesbos van meester Bart : lire en néerlandais avec les vidéos de meester Bart (lecteur YouTube intégré),
// puis comprendre (questions par passage) et s'exercer (vocabulaire, de/het, pluriel, diminutif, passé, vrai/faux, sentiments).
import * as UI from './ui.js';
import { h } from './ui.js';
import * as S from './save.js';
import * as Sfx from './sfx.js';
import * as Voice from './voice.js';
import { burst, shuffle } from './workshop.js';
import { BOOKS } from './leesbos_data.js';

const star = (n = 1) => { const b = S.get(); b.bonusStars = (b.bonusStars || 0) + n; b.coins += 2 * n; S.save(); };
const ST = () => { const b = S.get(); b.leesbos = b.leesbos || {}; return b.leesbos; };
const BK = (id) => { const s = ST(); s[id] = s[id] || { stukken: {}, oef: {} }; return s[id]; };
const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

// voix néerlandaise de l'appareil (si elle existe) pour relire une question ; sinon rien
function nlSpeak(t) {
  try {
    const vs = speechSynthesis.getVoices(), v = vs.find((x) => /^nl[-_]BE/i.test(x.lang)) || vs.find((x) => /^nl/i.test(x.lang));
    if (!v) return false;
    Voice.stop(); speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(t); u.voice = v; u.lang = v.lang; u.rate = 0.85; speechSynthesis.speak(u); return true;
  } catch (e) { return false; }
}
const nlBtn = (t) => h('button', { class: 'btn small lb-say', type: 'button', title: 'Lees voor', onclick: () => { if (!nlSpeak(t)) UI.toast?.('Pas de voix néerlandaise sur cet appareil'); } }, '🔊');

// lecteur YouTube intégré : la voix et les pages de meester Bart, sans rien copier
function player(yt, start, end) {
  const q = new URLSearchParams({ autoplay: '1', rel: '0', modestbranding: '1', playsinline: '1' });
  if (start != null) q.set('start', String(Math.floor(start)));
  if (end != null) q.set('end', String(Math.ceil(end)));
  return h('div', { class: 'lb-player' },
    h('iframe', { src: `https://www.youtube-nocookie.com/embed/${yt}?${q}`, title: 'Meester Bart leest voor', allow: 'autoplay; encrypted-media; picture-in-picture', allowfullscreen: '', referrerpolicy: 'strict-origin-when-cross-origin' }),
    h('a', { class: 'lb-yt', href: `https://youtu.be/${yt}${start ? '?t=' + Math.floor(start) : ''}`, target: '_blank', rel: 'noopener' }, 'La vidéo ne s’affiche pas ? Ouvrir sur YouTube ↗'));
}

// une question à choix (le 1er choix de « o » est le bon)
function vraag(host, item, onDone, { fr = true } = {}) {
  let done = false;
  const help = h('p', { class: 'lb-fr', hidden: true }, '🇫🇷 ' + (item.fr || ''));
  const opts = shuffle(item.o.map((t, i) => ({ t, ok: i === 0 })));
  const row = h('div', { class: 'actions wrap lb-opts' }, ...opts.map((o) => h('button', { class: 'btn', type: 'button', 'data-testid': o.ok ? 'lb-ok' : 'lb-ko', onclick: (e) => {
    if (done) return; done = true;
    e.currentTarget.classList.add(o.ok ? 'ok' : 'ko');
    if (!o.ok) row.querySelector('[data-testid=lb-ok]').classList.add('ok');
    if (o.ok) { Sfx.win(); star(); } else Sfx.tap();
    setTimeout(() => onDone(o.ok), o.ok ? 900 : 1700);
  } }, o.t)));
  host.replaceChildren(h('div', { class: 'lb-q' }, h('p', { class: 'prompt' }, item.q, ' ', nlBtn(item.q), item.fr && fr ? h('button', { class: 'btn small', type: 'button', onclick: () => { help.hidden = !help.hidden; } }, '🇫🇷') : null), help, row));
}
function reeks(host, items, title, onEnd) {
  let i = 0, ok = 0;
  const top = h('p', { class: 'muted' }), box = h('div');
  host.replaceChildren(top, box);
  const next = () => {
    if (i >= items.length) {
      const perfect = ok === items.length; if (perfect && items.length > 2) { star(2); burst(host); }
      box.replaceChildren(h('p', { class: 'prompt' }, `${perfect ? '🏆 ' : ''}Goed gedaan! ${ok} / ${items.length} juist.`), h('button', { class: 'btn primary', type: 'button', 'data-testid': 'lb-again', onclick: () => reeks(host, shuffle(items), title, onEnd) }, '↻ Opnieuw'));
      onEnd && onEnd(ok, items.length); return;
    }
    top.textContent = `${title} — ${i + 1}/${items.length}`;
    vraag(box, items[i], (good) => { if (good) ok++; i++; next(); });
  };
  next();
}
const pick3 = (pool, right, n = 2) => shuffle(pool.filter((x) => x !== right)).slice(0, n);

// ---------- les exercices (tirés des fiches) ----------
const OEF = [
  ['woordenschat', '📚 Woordenschat', (o) => shuffle(o.woordenschat).map(([w, d]) => ({ q: `Welk woord past bij: “${d}”?`, fr: 'Quel mot correspond à cette explication ?', o: [w, ...pick3(o.woordenschat.map((x) => x[0]), w)] }))],
  ['tegendeel', '↔️ Het tegenovergestelde', (o) => shuffle(o.tegendeel).map(([a, b]) => ({ q: `Wat is het tegenovergestelde van “${a}”?`, fr: 'Quel est le contraire ?', o: [b, ...pick3(o.tegendeel.map((x) => x[1]), b)] }))],
  ['dehet', '🔤 De of het?', (o) => shuffle(o.dehet).map(([w, a]) => ({ q: `… ${w}`, fr: 'Quel article : de ou het ?', o: [a, a === 'de' ? 'het' : 'de'] }))],
  ['meervoud', '👥 Meervoud', (o) => shuffle(o.meervoud).map(([e, m]) => ({ q: `Eén ${e}, twee …?`, fr: 'Quel est le pluriel ?', o: [m, ...pick3([e + 's', e + 'en', e + 'n', e + 'es', e + 'ten', ...o.meervoud.map((x) => x[1])].filter((x) => x !== m && x.startsWith(e.slice(0, 3))), m)] }))],
  ['verkleinwoord', '🔎 Verkleinwoord', (o) => shuffle(o.verkleinwoord).map(([w, k]) => ({ q: `Klein, klein, klein: ${w} → …?`, fr: 'Quel est le diminutif ?', o: [k, ...pick3([w + 'je', w + 'tje', w + 'pje', w + 'etje', w + 'ke'].filter((x) => x !== k), k)] }))],
  ['verleden', '⏪ Verleden tijd', (o) => shuffle(o.verleden).map(([n, v]) => ({ q: `Vandaag ${n} hij … Gisteren …?`, fr: 'Mets le verbe au passé.', o: [v, ...pick3(o.verleden.map((x) => x[1]), v)] }))],
  ['waar', '✅ Waar of niet waar?', (o) => shuffle(o.waar).map(([z, w, fix]) => ({ q: z, fr: w ? 'C’est vrai.' : 'C’est faux : ' + (fix || ''), o: w ? ['Waar', 'Niet waar'] : ['Niet waar', 'Waar'] }))],
  ['gevoel', '💗 Hoe voelt hij of zij zich?', (o) => shuffle(o.gevoel.zinnen).map(([z, g]) => ({ q: z, fr: 'Quel sentiment ?', o: [g, ...pick3(o.gevoel.keuze, g, 3)] }))],
];

function boek(body, b, talk) {
  const st = BK(b.id);
  const tabsHost = h('div', { class: 'actions wrap' }), view = h('div');
  const T = [
    ['kijk', '🎬 Kijk en luister', () => {
      view.replaceChildren(h('p', { class: 'muted' }, 'Meester Bart leest het hele boek voor. Kijk naar de bladzijden en luister goed.'), player(b.yt));
      talk('Écoute meester Bart lire tout le livre. Ensuite, va dans Lees mee pour répondre aux questions.', false);
    }],
    ['lees', '📖 Lees mee', () => {
      if (!b.stukken.length) {
        view.replaceChildren(h('p', { class: 'muted' }, 'Kijk eerst naar de video, of lees het boekje. Beantwoord dan de vragen.'), h('div'));
        reeks(view.lastChild, b.vragenBoek, 'Vragen over het boek', (ok, n) => { st.stukken.boek = Math.max(st.stukken.boek || 0, ok); S.save(); });
        talk('Réponds aux questions sur l’histoire.', false); return;
      }
      const list = h('div', { class: 'lb-stukken' }, ...b.stukken.map((s, i) => h('button', { class: 'btn lb-stuk' + (st.stukken[i] ? ' done' : ''), type: 'button', 'data-testid': 'lb-stuk-' + i, onclick: () => stuk(i) },
        h('b', null, `${i + 1}. ${s.titel}`), h('small', null, `${s.t ? fmt(s.t[0]) + ' → ' + fmt(s.t[1]) : '📖 blz. ' + s.blz}${st.stukken[i] ? ' · ⭐' : ''}`))));
      view.replaceChildren(h('p', { class: 'muted' }, 'Kies een stuk. Meester Bart leest het voor, daarna beantwoord je 2 vragen.'), list);
      talk('Choisis un passage : meester Bart le lit, puis tu réponds à deux questions.', false);
      function stuk(i) {
        const s = b.stukken[i], qs = h('div');
        const go = h('button', { class: 'btn primary', type: 'button', 'data-testid': 'lb-vragen', onclick: () => { go.remove(); reeks(qs, s.vragen, s.titel, (ok) => { st.stukken[i] = Math.max(st.stukken[i] || 0, ok); S.save(); }); } }, '✏️ Naar de vragen');
        view.replaceChildren(h('div', { class: 'actions' }, h('button', { class: 'btn small', type: 'button', onclick: () => T[1][2]() }, '← Alle stukken'), h('b', null, `${i + 1}. ${s.titel}`)),
          s.t ? player(b.yt, s.t[0], s.t[1]) : h('div', { class: 'lb-boekje' }, h('p', { class: 'prompt' }, `📖 Lees bladzijde ${s.blz} in je boekje.`), h('p', { class: 'muted' }, 'Lis ces pages dans ton livre, à voix haute si tu peux. Puis réponds aux questions.')),
          h('div', { class: 'actions' }, go, s.t ? h('button', { class: 'btn small', type: 'button', onclick: () => stuk(i) }, '🔁 Nog eens luisteren') : null), qs);
      }
    }],
    ['oef', '✏️ Oefeningen', () => {
      const pickH = h('div', { class: 'actions wrap' }), zone = h('div');
      OEF.forEach(([k, l, mk]) => pickH.append(h('button', { class: 'btn small' + (st.oef[k] ? ' done' : ''), type: 'button', 'data-testid': 'lb-oef-' + k, onclick: () => {
        pickH.querySelectorAll('button').forEach((x) => x.classList.remove('primary')); pickH.querySelector(`[data-testid=lb-oef-${k}]`).classList.add('primary');
        reeks(zone, mk(b.oefeningen), l.replace(/^\S+ /, ''), (ok, n) => { st.oef[k] = Math.max(st.oef[k] || 0, ok); S.save(); });
      } }, l + (st.oef[k] ? ' ⭐' : ''))));
      view.replaceChildren(pickH, zone);
      talk('Choisis un exercice : vocabulaire, de ou het, pluriel, diminutif, passé…', false);
    }],
    ['badge', '🏅 Mijn badge', () => {
      const sk = b.stukken.length ? b.stukken.filter((_, i) => st.stukken[i]).length : (st.stukken.boek ? 1 : 0), tot = b.stukken.length || 1;
      const oe = OEF.filter(([k]) => st.oef[k]).length;
      const pct = Math.round(100 * (sk / tot + oe / OEF.length) / 2);
      view.replaceChildren(h('div', { class: 'lb-badge' + (pct >= 100 ? ' gold' : '') }, h('div', { class: 'lb-medal' }, pct >= 100 ? '🏆' : b.icon), h('h3', null, b.titel), h('p', null, `Lees mee: ${sk}/${tot} · Oefeningen: ${oe}/${OEF.length}`),
        h('div', { class: 'lb-bar' }, h('span', { style: `width:${pct}%` })), h('p', { class: 'muted' }, pct >= 100 ? 'Proficiat! Je hebt dit boek helemaal uitgelezen!' : 'Nog even doorzetten!')));
      talk(pct >= 100 ? 'Bravo, tu as terminé ce livre !' : `Tu as fait ${pct} pour cent du livre.`);
    }],
  ];
  T.forEach(([k, l, f]) => tabsHost.append(h('button', { class: 'btn small', type: 'button', 'data-testid': 'lb-tab-' + k, onclick: () => { tabsHost.querySelectorAll('button').forEach((x) => x.classList.toggle('primary', x.dataset.testid === 'lb-tab-' + k)); Voice.stop(); f(); } }, l)));
  body.replaceChildren(h('div', { class: 'lb-head' }, h('button', { class: 'btn small', type: 'button', 'data-testid': 'lb-back', onclick: () => shelf(body, talk) }, '← Boekenkast'), h('h3', { class: 'lb-title', style: `color:${b.kleur}` }, `${b.icon} ${b.titel}`)),
    h('p', { class: 'muted' }, b.samenvatting), tabsHost, view);
  tabsHost.firstChild.click();
}

function shelf(body, talk) {
  body.replaceChildren(h('p', { class: 'muted' }, 'Kies een boek. Meester Bart leest het voor!'),
    h('div', { class: 'lb-shelf' }, ...BOOKS.map((b) => h('button', { class: 'lb-book', type: 'button', style: `--c:${b.kleur}`, 'data-testid': 'lb-book-' + b.id, onclick: () => boek(body, b, talk) },
      h('span', { class: 'lb-ico' }, b.icon), h('b', null, b.titel), h('small', null, b.samenvatting)))));
  talk('Bienvenue dans la forêt de lecture de meester Bart ! Choisis un livre.');
}

export function open() {
  const say = h('div', { class: 'be-say cc-say', 'aria-live': 'polite' });
  const talk = (s, v = true) => { say.textContent = s; if (v) Voice.speak(s); };
  const body = h('div');
  try { Sfx.stopAmbient(); } catch (e) { /* */ }
  UI.openDialog(h('div', { class: 'panel be-panel ws-panel lb-panel' }, UI.closeButton(), h('h2', null, '🌳 Het Leesbos van meester Bart'), body, say),
    { label: 'Het Leesbos van meester Bart', onClose: () => { Voice.stop(); try { Sfx.ambient(); } catch (e) { /* */ } } });
  shelf(body, talk);
}
