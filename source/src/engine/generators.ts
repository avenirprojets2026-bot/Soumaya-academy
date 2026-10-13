import type { Exercise, SkillId, Skill } from './types';
import { fr } from './format';
import type { Rng } from './rng';

export const SKILLS: Record<SkillId, Skill> = {
  suites: { id: 'suites', label: 'Compléter une suite et trouver sa règle', source: 'Fiche P4 §5' },
  abaque: { id: 'abaque', label: 'Lire et écrire les nombres (abaque, valeur des chiffres)', source: 'Fiche P4 §5' },
  comparer: { id: 'comparer', label: 'Comparer des nombres décimaux', source: 'Fiche P4 §5' },
  decomposer: { id: 'decomposer', label: 'Décomposer un nombre, compléter une unité', source: 'Fiche P4 §5' },
  addition: { id: 'addition', label: 'Additionner avec un décimal', source: 'Fiche P4 §6' },
  soustraction: { id: 'soustraction', label: 'Soustraire avec échanges', source: 'Fiche P4 §6' },
  tables: { id: 'tables', label: 'Multiplier malin (×4, ×9, ×11) et tables', source: 'Fiche P4 §6' },
  division: { id: 'division', label: 'Diviser (÷10, ÷5, ÷40)', source: 'Fiche P4 §6' },
  'choix-operation': { id: 'choix-operation', label: 'Choisir la bonne opération', source: 'Fiche P4 §6' },
  probleme: { id: 'probleme', label: 'Résoudre un problème à étapes', source: 'Fiche P4 §7' },
  frise: { id: 'frise', label: 'Frise du temps : les périodes historiques', source: 'Thème du document officiel juin 2025 — contenu généré (à valider) — Doc 1 Formation historique' },
  siecles: { id: 'siecles', label: 'Siècles et millénaires', source: 'Thème du document officiel juin 2025 — contenu généré (à valider) — Doc 1 Formation historique' },
  terre: { id: 'terre', label: 'Les mouvements de la Terre (rotation, révolution, jour et nuit)', source: 'Thème du document officiel juin 2025 — contenu généré (à valider) — Doc 2 Sciences DIS' },
  decalage: { id: 'decalage', label: 'Décalage horaire Bruxelles–Québec', source: 'Thème du document officiel juin 2025 — contenu généré (à valider) — Doc 2 Sciences DIS' },
  epc: { id: 'epc', label: 'Règle de vie ou loi ?', source: 'Thème du document officiel juin 2025 — contenu généré (à valider) — Doc 4 EPC' },
  statistiques: { id: 'statistiques', label: 'Lire un diagramme à bandes et un sondage', source: 'Thème du document officiel juin 2025 — contenu généré (à valider) — Doc 5 Statistique' },
  polygones: { id: 'polygones', label: 'Nommer un polygone (triangle, pentagone, hexagone…)', source: 'Programme P4 (à valider)' },
  angles: { id: 'angles', label: 'Reconnaître angle droit, aigu, obtus, plat', source: 'Programme P4 (à valider)' },
  quadrilateres: { id: 'quadrilateres', label: 'Propriétés des quadrilatères (parallèles, perpendiculaires)', source: 'Programme P4 (à valider)' },
  perimetre: { id: 'perimetre', label: 'Calculer un périmètre', source: 'Programme P4 (à valider)' },
  solides: { id: 'solides', label: 'Solides : faces, arêtes, sommets', source: 'Programme P4 (à valider)' },
  symetrie: { id: 'symetrie', label: 'Axes de symétrie', source: 'Programme P4 (à valider)' },
  homophones: { id: 'homophones', label: 'Choisir le bon homophone (a/à, et/est, on/ont, son/sont)', source: 'Programme P4 (à valider)' },
  pluriel: { id: 'pluriel', label: 'Écrire le pluriel des noms (-s, -x, -aux)', source: 'Programme P4 (à valider)' },
  accord: { id: 'accord', label: 'Accorder le verbe et l’adjectif', source: 'Programme P4 (à valider)' },
  conjugaison: { id: 'conjugaison', label: 'Conjuguer au présent', source: 'Programme P4 (à valider)' },
  nature: { id: 'nature', label: 'Reconnaître la nature des mots', source: 'Programme P4 (à valider)' },
  vocabulaire: { id: 'vocabulaire', label: 'Synonymes et contraires', source: 'Programme P4 (à valider)' },
  conversion: { id: 'conversion', label: 'Convertir des mesures (m, cm, kg, g, L, cl, h, min)', source: 'Fiche P4 §8' },
  heure: { id: 'heure', label: 'Lire l’heure sur une horloge', source: 'Fiche P4 §8' },
  duree: { id: 'duree', label: 'Calculer une durée ou une heure de fin', source: 'Fiche P4 §8' },
  fractions: { id: 'fractions', label: 'Fractions, décimaux et fractions équivalentes', source: 'Fiche P4 §8' },
  aire: { id: 'aire', label: 'Aire et périmètre du rectangle', source: 'Fiche P4 §8' },
  monnaie: { id: 'monnaie', label: 'Monnaie et proportionnalité', source: 'Fiche P4 §8' },
};

let counter = 0;
const uid = (s: string) => `${s}-${++counter}`;
/** Calcul décimal sûr : valeurs en dixièmes (entiers) → texte */
const tenths = (t: number) => (t % 10 === 0 ? String(t / 10) : (t / 10).toFixed(1));

type Gen = (r: Rng, d: number) => Exercise;

const suites: Gen = (r, d) => {
  const steps = d === 1 ? [2, 5, 10, 25, 50, 100, 250] : d === 2 ? [12, 15, 25, 125, 250, 500] : [0.5, 1.5, 12.5, 250, 750];
  const step = r.pick(steps);
  const start = d === 1 ? r.int(0, 10) * step : r.int(1, 30) * (Number.isInteger(step) ? 1 : 1);
  const len = 5, hole = r.int(1, len - 2);
  const vals = Array.from({ length: len }, (_, i) => Math.round((start + i * step) * 100) / 100);
  const items = vals.map((v, i) => (i === hole ? null : fr(v)));
  const gap = vals[hole + 1] - vals[hole - 1];
  return {
    id: uid('suite'), skill: 'suites', kind: 'number', origin: 'generated',
    prompt: 'Complète la suite de nombres. Quel nombre manque ?',
    visual: { type: 'sequence', items }, answers: [String(vals[hole])],
    hints: [
      'Regarde deux nombres qui se suivent : de combien avance la suite à chaque pas ?',
      `Entre ${fr(vals[hole - 1])} et ${fr(vals[hole + 1])}, il y a deux pas qui valent ensemble ${fr(gap)}. Combien vaut un seul pas ?`,
      `La règle est « +${fr(step)} ». Applique-la au nombre juste avant le trou.`,
    ],
    explanation: `La règle est +${fr(step)} à chaque pas. ${fr(vals[hole - 1])} + ${fr(step)} = ${fr(vals[hole])}.`,
  };
};

const NAMES = ['CM', 'DM', 'UM', 'C', 'D', 'U'];
const FULL = ['centaines de mille', 'dizaines de mille', 'unités de mille', 'centaines', 'dizaines', 'unités'];
const POW = [100000, 10000, 1000, 100, 10, 1];

const abaque: Gen = (r, d) => {
  const digits = POW.map(() => r.int(0, 9));
  if (digits[0] === 0) digits[0] = r.int(1, 9);
  if (d === 1) { digits[0] = 0; digits[1] = r.int(1, 9); }
  const dec = d >= 2 ? r.int(1, 9) : 0;
  const value = digits.reduce((s, x, i) => s + x * POW[i], 0);
  const parts: string[] = [];
  digits.forEach((x, i) => { if (x !== 0) parts.push(`${x} ${NAMES[i]}`); });
  if (dec) parts.push(`${dec} dixième${dec > 1 ? 's' : ''}`);
  const text = parts.length > 1 ? parts.slice(0, -1).join(', ') + ' et ' + parts[parts.length - 1] : parts[0];
  const answer = dec ? `${value}.${dec}` : String(value);
  const map: Record<string, string> = {};
  NAMES.forEach((n, i) => (map[n] = String(digits[i])));
  if (dec) map['d'] = String(dec);
  if (d === 3 && r.next() < 0.5) {
    // question inverse : chiffre d'une position
    const idx = r.int(0, 5);
    const num = fr(value);
    return {
      id: uid('abq'), skill: 'abaque', kind: 'number', origin: 'generated',
      prompt: `Dans le nombre ${num}, quel est le chiffre des ${FULL[idx]} ?`,
      answers: [String(digits[idx])],
      hints: ['Place le nombre dans un tableau CM · DM · UM · C · D · U, de la droite vers la gauche.', `Les ${FULL[idx]} se trouvent dans la colonne ${NAMES[idx]}.`],
      explanation: `Dans ${num}, la colonne ${NAMES[idx]} contient le chiffre ${digits[idx]}.`,
      visual: { type: 'abacus', digits: map },
    };
  }
  return {
    id: uid('abq'), skill: 'abaque', kind: 'number', origin: 'generated',
    prompt: `Quel nombre correspond à ${text} ?`, answers: [answer],
    visual: { type: 'abacus', digits: map },
    hints: [
      'Place chaque quantité dans la bonne colonne de l’abaque. Les colonnes oubliées contiennent 0.',
      'Écris les chiffres de gauche à droite : CM, DM, UM, puis C, D, U. S’il y a des dixièmes, mets une virgule avant.',
    ],
    explanation: `On place chaque chiffre dans sa colonne et on met 0 dans les colonnes vides : ${fr(Number(answer))}.`,
  };
};

const comparer: Gen = (r, d) => {
  // valeurs en centièmes (entiers)
  let a: number, b: number;
  const mode = r.int(0, 2);
  if (mode === 0 && d >= 2) { a = r.int(10, 99) * 100 + r.int(1, 9); b = a - (a % 100) + r.int(1, 9) * 10; } // 14,05 vs 14,5
  else if (mode === 1) { a = r.int(100, 999) * 10; b = a / 10 + 0; b = a; } // égalité 73,40 vs 73,4
  else { a = r.int(100, 9999); b = r.int(100, 9999); }
  const plain = (x: number) => String(x / 100).replace('.', ',');
  const txtA = mode === 1 ? (a / 100).toFixed(2).replace('.', ',') : plain(a);
  const txtB = mode === 1 ? (b / 100).toFixed(1).replace('.', ',') : plain(b);
  const sym = a < b ? '<' : a > b ? '>' : '=';
  return {
    id: uid('cmp'), skill: 'comparer', kind: 'choice', origin: 'generated',
    prompt: `Compare : ${txtA}  ?  ${txtB}`, choices: ['<', '=', '>'], answers: [sym],
    hints: [
      'Compare d’abord la partie entière (avant la virgule).',
      'Si elle est identique, compare les dixièmes, puis les centièmes. Tu peux ajouter un 0 à la fin d’un décimal sans changer sa valeur.',
    ],
    explanation: `${txtA} et ${txtB} : on aligne les chiffres après la virgule. Résultat : ${txtA} ${sym} ${txtB}.`,
  };
};

const decomposer: Gen = (r, d) => {
  const t = r.int(0, d === 1 ? 2 : 4);
  if (t === 0) {
    const th = r.int(1, 9), h = r.int(1, 9), te = r.int(1, 9), u = r.int(1, 9);
    const total = th * 1000 + h * 100 + te * 10 + u;
    return { id: uid('dec'), skill: 'decomposer', kind: 'number', origin: 'generated',
      prompt: `${fr(th * 1000)} + ${h * 100} + ${te * 10} + ${u} = ?`, answers: [String(total)],
      hints: ['Chaque nombre va dans sa colonne : milliers, centaines, dizaines, unités.'],
      explanation: `${th} milliers, ${h} centaines, ${te} dizaines et ${u} unités s’écrivent ${fr(total)}.` };
  }
  if (t === 1) {
    const pairs: [number, number][] = [[1, 3], [1, 4], [1, 6], [1, 2], [1, 8], [1, 9]];
    const [, x] = r.pick(pairs);
    const a = x, rest = 10 - a;
    return { id: uid('dec'), skill: 'decomposer', kind: 'number', origin: 'generated',
      prompt: `Complète pour faire une unité : 1 = 0,${a} + ?`, answers: [`0.${rest}`],
      hints: ['Une unité, c’est 10 dixièmes.', `Tu as déjà ${a} dixièmes. Combien en manque-t-il pour arriver à 10 ?`],
      explanation: `1 = 10 dixièmes. ${a} dixièmes + ${rest} dixièmes = 10 dixièmes, donc 1 = 0,${a} + 0,${rest}.` };
  }
  if (t === 2) {
    const k = r.pick([10, 100, 50, 20, 25]);
    const total = r.pick([100000, 1000, 10000]);
    const other = total / k;
    return { id: uid('dec'), skill: 'decomposer', kind: 'number', origin: 'generated',
      prompt: `Complète : ${fr(total)} = ${fr(k)} × ?`, answers: [String(other)],
      hints: ['Cherche par quoi multiplier pour retrouver le grand nombre.', `Tu peux diviser ${fr(total)} par ${fr(k)}.`],
      explanation: `${fr(total)} ÷ ${fr(k)} = ${fr(other)}, donc ${fr(total)} = ${fr(k)} × ${fr(other)}.` };
  }
  if (t === 3) {
    const k = r.pick([2, 4, 5, 10]);
    return { id: uid('dec'), skill: 'decomposer', kind: 'number', origin: 'generated',
      prompt: `Complète : 1 = ${k} × ?`, answers: [String(1 / k)],
      hints: ['Une unité coupée en parts égales : pense aux dixièmes, aux quarts et aux moitiés.'],
      explanation: `${k} parts égales de 1 valent chacune 1 ÷ ${k} = ${fr(1 / k)}.` };
  }
  const q = r.int(3, 9), z = r.int(1, 9);
  return { id: uid('dec'), skill: 'decomposer', kind: 'number', origin: 'generated',
    prompt: `Combien font ${q} dizaines et ${z} unités ?`, answers: [String(q * 10 + z)],
    hints: ['Une dizaine = 10 unités.'], explanation: `${q} dizaines = ${q * 10}, puis on ajoute ${z} : ${q * 10 + z}.` };
};

const addition: Gen = (r, d) => {
  const A = r.int(d === 1 ? 100 : 1000, d === 1 ? 999 : 9999) * 10; // en dixièmes
  const B = d === 1 ? r.int(10, 900) * 10 + r.int(1, 9) : r.int(1000, 9999) * 10 + r.int(1, 9);
  const sum = A + B;
  return { id: uid('add'), skill: 'addition', kind: 'number', origin: 'generated',
    prompt: `Pose et calcule : ${fr(A / 10)} + ${fr(B / 10)}`,
    visual: { type: 'column', a: fr(A / 10), b: fr(B / 10), op: '+' }, answers: [tenths(sum)],
    hints: ['Aligne les virgules l’une sous l’autre. Un nombre entier a une virgule invisible à sa droite.', 'Additionne en commençant par les dixièmes, puis les unités, dizaines… Pense aux retenues.'],
    explanation: `En alignant les virgules : ${fr(A / 10)} + ${fr(B / 10)} = ${fr(sum / 10)}.` };
};

const soustraction: Gen = (r, d) => {
  const A = (d === 1 ? r.int(2, 9) * 100 + r.int(0, 9) : r.int(1, 9) * 1000 + r.int(0, 2) * 100 + r.int(0, 9)) * 10;
  const B = r.int(Math.floor(A / 100), Math.floor(A / 20)) * 10 + r.int(1, 9);
  const diff = A - B;
  return { id: uid('sub'), skill: 'soustraction', kind: 'number', origin: 'generated',
    prompt: `Pose et calcule : ${fr(A / 10)} − ${fr(B / 10)}`,
    visual: { type: 'column', a: fr(A / 10), b: fr(B / 10), op: '−' }, answers: [tenths(diff)],
    hints: ['Aligne les virgules. Ajoute des 0 après la virgule si cela t’aide.', 'Quand un chiffre du haut est trop petit, échange : prends 1 à la colonne de gauche, il vaut 10 dans la colonne actuelle.'],
    explanation: `En alignant les virgules et en échangeant quand il le faut : ${fr(A / 10)} − ${fr(B / 10)} = ${fr(diff / 10)}.` };
};

const tables: Gen = (r, d) => {
  const t = r.int(0, d === 1 ? 1 : 3);
  if (t === 0) { const a = r.int(2, 9), b = r.int(3, 9); return { id: uid('tab'), skill: 'tables', kind: 'number', origin: 'generated',
    prompt: `${a} × ${b} = ?`, answers: [String(a * b)], hints: ['Utilise une table que tu connais bien, puis ajoute ou retire un paquet.'], explanation: `${a} × ${b} = ${a * b}.` }; }
  if (t === 1) { const n = r.int(2, 9) * (d === 1 ? 10 : 10) + (d === 1 ? 0 : r.int(0, 9) * 0); const m = r.pick([9, 11]);
    return { id: uid('tab'), skill: 'tables', kind: 'number', origin: 'generated', prompt: `${n} × ${m} = ?`, answers: [String(n * m)],
      hints: m === 9 ? ['Pour × 9 : multiplie par 10, puis retire une fois le nombre.'] : ['Pour × 11 : multiplie par 10, puis ajoute une fois le nombre.'],
      explanation: m === 9 ? `${n} × 9 = ${n} × 10 − ${n} = ${n * 10} − ${n} = ${n * 9}.` : `${n} × 11 = ${n} × 10 + ${n} = ${n * 10} + ${n} = ${n * 11}.` }; }
  if (t === 2) { const n = r.int(12, 99); return { id: uid('tab'), skill: 'tables', kind: 'number', origin: 'generated', prompt: `${n} × 4 = ?  (astuce : double, puis double encore)`, answers: [String(n * 4)],
    hints: [`Le double de ${n}, c’est ${n * 2}.`], explanation: `${n} × 2 = ${n * 2}, puis × 2 encore = ${n * 4}.` }; }
  const n = r.int(2, 9) * 10 + r.int(1, 9), m = r.pick([9, 11, 5]);
  return { id: uid('tab'), skill: 'tables', kind: 'number', origin: 'generated', prompt: `${n} × ${m} = ?`, answers: [String(n * m)],
    hints: ['Choisis une astuce : ×9 = ×10 − 1 fois ; ×11 = ×10 + 1 fois ; ×5 = ×10 puis moitié.'], explanation: `${n} × ${m} = ${n * m}.` };
};

const division: Gen = (r, d) => {
  const t = r.int(0, d === 1 ? 1 : 3);
  if (t === 0) { const n = r.int(11, 999);
    return { id: uid('div'), skill: 'division', kind: 'number', origin: 'generated', prompt: `${fr(n)} ÷ 10 = ?`, answers: [tenths(n)],
      hints: ['Diviser par 10, c’est rendre chaque chiffre 10 fois plus petit : il passe à la colonne de droite.'], explanation: `${fr(n)} ÷ 10 = ${fr(n / 10)}. Chaque chiffre se décale d’une colonne vers la droite.` }; }
  if (t === 1) { const q = r.int(3, 19), n = q * 10; const m = r.pick([2, 5]);
    return { id: uid('div'), skill: 'division', kind: 'number', origin: 'generated', prompt: `${fr(n * m)} ÷ ${m * 10} = ?`, answers: [String(q)],
      hints: [`Divise d’abord par 10, puis par ${m}.`], explanation: `${fr(n * m)} ÷ 10 = ${fr(n * m / 10)}, puis ÷ ${m} = ${q}.` }; }
  if (t === 2) { const q = r.int(12, 99); const n = q * 5;
    return { id: uid('div'), skill: 'division', kind: 'number', origin: 'generated', prompt: `${n} ÷ 5 = ?  (astuce : double, puis ÷ 10)`, answers: [String(q)],
      hints: [`Le double de ${n} est ${n * 2}.`, `Divise ${n * 2} par 10.`], explanation: `${n} × 2 = ${n * 2} ; ${n * 2} ÷ 10 = ${q}. Donc ${n} ÷ 5 = ${q}.` }; }
  const q = r.int(4, 90), n = q * 40;
  return { id: uid('div'), skill: 'division', kind: 'number', origin: 'generated', prompt: `${fr(n)} ÷ 40 = ?`, answers: [String(q)],
    hints: ['40 = 4 × 10. Divise par 10, puis par 4.'], explanation: `${fr(n)} ÷ 10 = ${fr(n / 10)} ; ${fr(n / 10)} ÷ 4 = ${q}.` };
};

const OPS = ['addition', 'soustraction', 'multiplication', 'division'];
const choixOp: Gen = (r) => {
  const t = r.int(0, 3);
  const nm = r.pick(['Inès', 'Nora', 'Adam', 'Yanis', 'Lina', 'Samy']);
  let prompt = '', ans = '', why = '';
  if (t === 0) { const e = r.pick([3, 4, 6, 7, 9]), k = r.int(4, 9); prompt = `${e * k} biscuits sont répartis équitablement entre ${e} enfants. Combien chacun en reçoit-il ?`; ans = 'division'; why = 'On partage en parts égales : c’est une division.'; }
  else if (t === 1) { const a = r.int(12, 25), b = r.int(8, 16); prompt = `Dans une salle, il y a ${a} rangées de ${b} sièges. Combien de sièges y a-t-il ?`; ans = 'multiplication'; why = 'Des paquets égaux répétés : c’est une multiplication.'; }
  else if (t === 2) { const a = r.int(200, 500), b = r.int(20, 90); prompt = `Dans un train, il y a ${a} voyageurs, puis ${b} descendent. Combien en reste-t-il ?`; ans = 'soustraction'; why = 'On enlève une quantité : c’est une soustraction.'; }
  else { const a = r.int(100, 300), b = r.int(20, 80); prompt = `${nm} a ${a} billes. On lui en offre ${b} de plus. Combien en a-t-${nm === 'Adam' || nm === 'Yanis' || nm === 'Samy' ? 'il' : 'elle'} maintenant ?`; ans = 'addition'; why = 'On ajoute des quantités : c’est une addition.'; }
  return { id: uid('op'), skill: 'choix-operation', kind: 'choice', origin: 'generated', prompt, choices: OPS, answers: [ans],
    hints: ['Lis la question : est-ce qu’on ajoute, on enlève, on répète des paquets égaux ou on partage ?'], explanation: why };
};

const probleme: Gen = (r, d) => {
  const budget = r.int(4, 9) * 10;
  const n = r.int(2, 5), p = r.int(2, 6), extra = r.int(2, 9);
  const spend = n * p + extra;
  if (spend >= budget) return probleme(r, d);
  const left = budget - spend;
  const useless = d >= 2 ? ' Le magasin ouvre à 9 h et ferme à 18 h.' : '';
  const ex: Exercise = { id: uid('pb'), skill: 'probleme', kind: 'number', origin: 'generated',
    prompt: `Léa a ${budget} €. Elle achète ${n} cahiers à ${p} € pièce et un stylo à ${extra} €.${useless} Combien d’argent lui reste-t-il ?`,
    answers: [String(left)],
    hints: [d >= 2 ? 'Barre l’information inutile (les heures d’ouverture n’aident pas).' : 'Cherche d’abord ce que Léa dépense en tout.',
      `Étape 1 : le prix des ${n} cahiers (${n} × ${p}). Étape 2 : ajoute le stylo. Étape 3 : retire le total de ce qu’elle avait.`],
    explanation: `${n} × ${p} = ${n * p} € ; ${n * p} + ${extra} = ${spend} € dépensés ; ${budget} − ${spend} = ${left} €.` };
  return ex;
};

const CONV: [string, string, number][] = [['m', 'cm', 100], ['km', 'm', 1000], ['hm', 'm', 100], ['kg', 'g', 1000], ['L', 'cl', 100], ['L', 'mL', 1000], ['cm', 'mm', 10], ['h', 'min', 60], ['dm', 'cm', 10]];
const conversion: Gen = (r, d) => {
  const lim = d === 1 ? CONV.filter((c) => c[0] !== 'h' && c[0] !== 'dm') : CONV;
  const [big, small, f] = r.pick(lim);
  const t = d === 1 ? r.int(2, 9) * 10 : r.int(11, 99); // en dixièmes
  const small2big = d === 3 && r.next() < 0.5;
  const bigTxt = fr(t / 10), smallVal = (t * f) / 10;
  if (small2big) return { id: uid('cv'), skill: 'conversion', kind: 'number', origin: 'generated',
    prompt: `${fr(smallVal)} ${small} = ? ${big}`, answers: [String(t / 10)],
    hints: [`Combien de ${small} dans 1 ${big} ?`, `1 ${big} = ${fr(f)} ${small}. Pour passer de ${small} à ${big}, on divise.`],
    explanation: `1 ${big} = ${fr(f)} ${small}, donc ${fr(smallVal)} ${small} ÷ ${fr(f)} = ${bigTxt} ${big}.` };
  return { id: uid('cv'), skill: 'conversion', kind: 'number', origin: 'generated',
    prompt: `${bigTxt} ${big} = ? ${small}`, answers: [String(smallVal)],
    hints: [`Combien de ${small} dans 1 ${big} ?`, `1 ${big} = ${fr(f)} ${small}. Pour passer de ${big} à ${small} (unité plus petite), on multiplie.`],
    explanation: `1 ${big} = ${fr(f)} ${small}, donc ${bigTxt} × ${fr(f)} = ${fr(smallVal)} ${small}.` };
};

const fmtT = (h: number, m: number) => `${((h % 24) + 24) % 24} h${m ? ' ' + String(m).padStart(2, '0') : ''}`;
const heure: Gen = (r, d) => {
  const h = r.int(1, 12), m = r.int(0, 11) * 5;
  const ok = fmtT(h, m);
  const opts = new Set<string>([ok]);
  const cands = [fmtT(m === 0 ? 12 : m / 5, h * 5 % 60), fmtT(h + 1, m), fmtT(h - 1 || 12, m), fmtT(h, (m + 5) % 60), fmtT(h, (m + 55) % 60), fmtT(h === 12 ? 1 : h + 1, 60 - m === 60 ? 0 : 60 - m)];
  for (const c of r.shuffle(cands)) { if (opts.size >= (d === 1 ? 3 : 4)) break; opts.add(c); }
  return { id: uid('hr'), skill: 'heure', kind: 'choice', origin: 'generated', visual: { type: 'clock', h, m },
    prompt: 'Quelle heure indique l’horloge ?', choices: r.shuffle([...opts]), answers: [ok],
    hints: ['La petite aiguille donne l’heure, la grande aiguille donne les minutes.', 'Quand la grande aiguille est sur le 3, il est « et quart » (15 min) ; sur le 6, « et demie » (30 min) ; sur le 9, « moins le quart » (45 min).'],
    explanation: `La petite aiguille est près du ${h}, la grande montre ${m} minutes : il est ${ok}.` };
};

const duree: Gen = (r, d) => {
  const h = r.int(7, 20), m = r.int(0, 11) * 5, dur = r.int(d === 1 ? 3 : 6, d === 1 ? 12 : 34) * 5;
  const end = h * 60 + m + dur; const eh = Math.floor(end / 60), em = end % 60;
  const ok = fmtT(eh, em);
  const opts = new Set([ok, fmtT(eh + 1, em), fmtT(eh, (em + 10) % 60), fmtT(eh - 1, em)]);
  const dh = Math.floor(dur / 60), dm = dur % 60;
  const durTxt = `${dh ? dh + ' h' : ''}${dm ? (dh ? ' ' : '') + dm + ' min' : ''}`;
  return { id: uid('du'), skill: 'duree', kind: 'choice', origin: 'generated',
    prompt: `Le film commence à ${fmtT(h, m)} et dure ${durTxt}. À quelle heure se termine-t-il ?`, choices: r.shuffle([...opts]), answers: [ok],
    hints: ['Ajoute d’abord les heures, puis les minutes.', 'Si les minutes dépassent 60, retire 60 et ajoute 1 heure (1 h = 60 min).'],
    explanation: `${fmtT(h, m)} + ${durTxt} = ${ok}.` };
};

const fractions: Gen = (r, d) => {
  const t = r.int(0, d === 1 ? 2 : 4);
  if (t === 0) { const [n, dn, v] = r.pick<[number, number, number]>([[1, 4, 0.25], [1, 2, 0.5], [3, 4, 0.75], [1, 5, 0.2], [1, 10, 0.1], [3, 2, 1.5]]);
    return { id: uid('fr'), skill: 'fractions', kind: 'number', origin: 'generated', prompt: `${n}/${dn} = ? (écris le nombre décimal)`, answers: [String(v)],
      hints: ['Une fraction est une division : le numérateur divisé par le dénominateur.', 'Pense à la monnaie : 1/4 d’euro, c’est 25 centimes.'], explanation: `${n} ÷ ${dn} = ${fr(v)}.` }; }
  if (t === 1) { const x = r.int(1, 9);
    return { id: uid('fr'), skill: 'fractions', kind: 'number', origin: 'generated', prompt: `0,${x} = ?/10`, answers: [String(x)],
      hints: ['Le premier chiffre après la virgule compte les dixièmes.'], explanation: `0,${x} se lit « ${x} dixième${x > 1 ? 's' : ''} », donc ${x}/10.` }; }
  if (t === 2) { const dn = r.pick([5, 6, 8, 10]), a = r.int(1, dn - 2), b = r.int(1, dn - 1 - a);
    return { id: uid('fr'), skill: 'fractions', kind: 'number', origin: 'generated', prompt: `${a}/${dn} + ${b}/${dn} = ?/${dn}  (écris le numérateur)`, answers: [String(a + b)],
      hints: ['Quand le dénominateur est le même, on ne le change pas : on additionne seulement les numérateurs.'], explanation: `${a} + ${b} = ${a + b}, donc ${a}/${dn} + ${b}/${dn} = ${a + b}/${dn}.` }; }
  if (t === 3) { const k = r.int(2, 4), a = r.int(1, 3), dn = r.pick([3, 4, 5]);
    return { id: uid('fr'), skill: 'fractions', kind: 'number', origin: 'generated', prompt: `${a}/${dn} = ?/${dn * k}  (fraction équivalente)`, answers: [String(a * k)],
      hints: [`Le dénominateur a été multiplié par ${k}. Que faut-il faire au numérateur pour garder la même valeur ?`], explanation: `On multiplie le numérateur et le dénominateur par ${k} : ${a}/${dn} = ${a * k}/${dn * k}.` }; }
  const k = r.int(2, 5), a = r.int(2, 4);
  return { id: uid('fr'), skill: 'fractions', kind: 'number', origin: 'generated', prompt: `${k} × ${a}/${k + 3} = ?/${k + 3}  (écris le numérateur)`, answers: [String(k * a)],
    hints: ['Multiplier une fraction par un entier : on multiplie le numérateur, le dénominateur reste le même.'], explanation: `${k} × ${a} = ${k * a}, donc ${k} × ${a}/${k + 3} = ${k * a}/${k + 3}.` };
};

const aire: Gen = (r, d) => {
  const L = r.int(4, 12), l = r.int(2, L - 1);
  if (d === 1) return { id: uid('ai'), skill: 'aire', kind: 'number', origin: 'generated', prompt: `Un rectangle mesure ${L} cm de long et ${l} cm de large. Quelle est son aire en cm² ?`, answers: [String(L * l)],
    hints: ['Aire du rectangle : longueur × largeur.', 'Imagine un quadrillage : il y a ' + l + ' rangées de carrés.'], explanation: `${L} × ${l} = ${L * l} cm².` };
  if (d === 2) return { id: uid('ai'), skill: 'aire', kind: 'number', origin: 'generated', prompt: `Un rectangle mesure ${L} cm de long et ${l} cm de large. Quel est son périmètre en cm ?`, answers: [String(2 * (L + l))],
    hints: ['Le périmètre, c’est le tour de la figure : la somme de tous les côtés.', 'Un rectangle a 2 longueurs et 2 largeurs.'], explanation: `${L} + ${l} + ${L} + ${l} = ${2 * (L + l)} cm.` };
  return { id: uid('ai'), skill: 'aire', kind: 'number', origin: 'generated', prompt: `L’aire d’un rectangle est de ${L * l} cm² et sa longueur est de ${L} cm. Quelle est sa largeur en cm ?`, answers: [String(l)],
    hints: ['Aire = longueur × largeur. Quel nombre faut-il multiplier par ' + L + ' pour obtenir ' + L * l + ' ?'], explanation: `${L * l} ÷ ${L} = ${l} cm.` };
};

const monnaie: Gen = (r, d) => {
  if (d === 1 || r.next() < 0.4) { const p = r.int(2, 9), n = r.int(3, 9);
    return { id: uid('mo'), skill: 'monnaie', kind: 'number', origin: 'generated', prompt: `Un billet de cinéma coûte ${p} €. Combien coûtent ${n} billets ? (en €)`, answers: [String(p * n)],
      hints: ['Tableau de proportionnalité : 1 billet → ' + p + ' €. Pour ' + n + ' billets, on multiplie.'], explanation: `${n} × ${p} = ${p * n} €.` }; }
  const centsEach = r.int(2, 9) * 100 + 50, n = r.int(2, 4), pay = Math.ceil((centsEach * n) / 1000) * 1000 + (r.next() < 0.5 ? 0 : 1000);
  const back = pay - centsEach * n;
  return { id: uid('mo'), skill: 'monnaie', kind: 'number', origin: 'generated', prompt: `${n} jus coûtent chacun ${fr(centsEach / 100)} €. Tu paies avec ${pay / 100} €. Combien la caissière te rend-elle ? (en €)`, answers: [String(back / 100)],
    hints: ['Étape 1 : calcule le prix des ' + n + ' jus. Étape 2 : retire ce prix de la somme donnée.'], explanation: `${n} × ${fr(centsEach / 100)} = ${fr((centsEach * n) / 100)} € ; ${pay / 100} − ${fr((centsEach * n) / 100)} = ${fr(back / 100)} €.` };
};




/* ---------- Planète des Découvertes (histoire, sciences, EPC, statistique) ---------- */
export const DISC_SKILLS: SkillId[] = ['frise', 'siecles', 'terre', 'decalage', 'epc', 'statistiques'];
const PERIODES = ['la Préhistoire', 'l’Antiquité', 'le Moyen Âge', 'les Temps modernes', 'l’Époque contemporaine'];
const frise: Gen = (r, d) => {
  if (d >= 2 && r.next() < 0.4) {
    const i = r.int(1, 4); const nm = PERIODES[i];
    return { id: uid('fr'), skill: 'frise', kind: 'number', origin: 'generated', prompt: `Sur la frise, les périodes sont numérotées dans l’ordre : 1 = Préhistoire, 2 = Antiquité, 3 = Moyen Âge, 4 = Temps modernes, 5 = Époque contemporaine. Quel numéro porte ${nm} ?`, answers: [String(i + 1)],
      hints: ['Récite les périodes dans l’ordre, de la plus ancienne à la plus récente.', 'Préhistoire, Antiquité, Moyen Âge, Temps modernes, Époque contemporaine.'], explanation: `${cap1(nm)} est la période numéro ${i + 1}.` };
  }
  const after = r.next() < 0.5; const lo = d === 1 ? 1 : 0, hi = d === 1 ? 3 : 4;
  let i = r.int(lo, hi); if (after && i === 4) i = 3; if (!after && i === 0) i = 1;
  const ans = PERIODES[after ? i + 1 : i - 1];
  const opts = r.shuffle([ans, ...r.shuffle(PERIODES.filter((x) => x !== ans && x !== PERIODES[i])).slice(0, d === 1 ? 2 : 3)]);
  return { id: uid('fr'), skill: 'frise', kind: 'choice', origin: 'generated', prompt: after ? `Quelle période vient juste après ${PERIODES[i]} ?` : `Quelle période vient juste avant ${PERIODES[i]} ?`, choices: opts, answers: [ans],
    hints: ['Pense à la frise : les périodes se suivent dans l’ordre du temps.', 'Préhistoire, Antiquité, Moyen Âge, Temps modernes, Époque contemporaine.'],
    explanation: `L’ordre est : Préhistoire, Antiquité, Moyen Âge, Temps modernes, Époque contemporaine. ${after ? 'Après' : 'Avant'} ${PERIODES[i]} : ${ans}.` };
};
const siecles: Gen = (r, d) => {
  if (d === 1) {
    const q = r.pick([['un siècle', 100], ['un millénaire', 1000], ['une décennie', 10], ['2 siècles', 200], ['3 siècles', 300], ['2 millénaires', 2000], ['5 siècles', 500]] as [string, number][]);
    return { id: uid('si'), skill: 'siecles', kind: 'number', origin: 'generated', prompt: `Combien d’années y a-t-il dans ${q[0]} ?`, answers: [String(q[1])],
      hints: ['Un siècle = 100 ans, un millénaire = 1 000 ans, une décennie = 10 ans.', 'Multiplie si on en a plusieurs.'], explanation: `${cap1(q[0])} = ${fr(q[1])} ans.` };
  }
  const years = d === 2 ? [1914, 1789, 1500, 1066, 1969, 2025, 1815, 1250, 1750, 1990] : [1900, 2000, 1800, 1901, 2001, 1600];
  const y = r.pick(years); const c = Math.ceil(y / 100);
  return { id: uid('si'), skill: 'siecles', kind: 'number', origin: 'generated', prompt: `Dans quel siècle se trouve l’année ${y} ? (écris le numéro du siècle, par exemple 18 pour le 18e siècle)`, answers: [String(c)],
    hints: ['Le 1er siècle va de l’an 1 à l’an 100, le 2e de 101 à 200…', y % 100 === 0 ? 'Attention : une année qui finit par 00 est la dernière du siècle.' : 'Prends les deux premiers chiffres de l’année et ajoute 1.'],
    explanation: `${y} est dans le ${c}e siècle ${y % 100 === 0 ? '(l’année ' + y + ' est la dernière de ce siècle)' : '(' + Math.floor(y / 100) + ' + 1 = ' + c + ')'}.` };
};
const TERRE: { d: number; q: string; ok: string; bad: string[]; tip: string }[] = [
  { d: 1, q: 'Quel est le nom du mouvement de la Terre quand elle tourne sur elle-même ?', ok: 'la rotation', bad: ['la révolution', 'l’éclipse'], tip: 'La rotation : la Terre tourne sur elle-même, comme une toupie.' },
  { d: 1, q: 'Quel est le nom du mouvement de la Terre autour du Soleil ?', ok: 'la révolution', bad: ['la rotation', 'la gravité'], tip: 'La révolution : la Terre tourne autour du Soleil.' },
  { d: 1, q: 'Combien de temps dure une rotation de la Terre sur elle-même ?', ok: 'environ 24 heures', bad: ['environ 1 heure', 'environ 1 mois', 'environ 1 an'], tip: 'Une rotation dure environ 24 heures : c’est un jour entier.' },
  { d: 1, q: 'Qu’est-ce qui crée l’alternance du jour et de la nuit ?', ok: 'la rotation de la Terre', bad: ['la révolution de la Terre', 'les nuages', 'la Lune qui bouge'], tip: 'Quand la Terre tourne sur elle-même, chaque endroit passe face au Soleil (jour) puis à l’opposé (nuit).' },
  { d: 1, q: 'Quand une partie de la Terre est face au Soleil, c’est…', ok: 'le jour', bad: ['la nuit', 'l’hiver'], tip: 'Face au Soleil, elle est éclairée : c’est le jour.' },
  { d: 2, q: 'Combien de temps dure une révolution de la Terre autour du Soleil ?', ok: 'environ 1 an', bad: ['environ 24 heures', 'environ 1 mois', 'environ 1 semaine'], tip: 'Un tour complet autour du Soleil dure environ 365 jours : un an.' },
  { d: 2, q: 'Dans quel sens la Terre tourne-t-elle sur elle-même ?', ok: 'd’Ouest en Est', bad: ['d’Est en Ouest', 'de haut en bas'], tip: 'La Terre tourne d’Ouest en Est.' },
  { d: 2, q: 'À cause de la rotation de la Terre, de quel côté le Soleil se lève-t-il ?', ok: 'à l’Est', bad: ['à l’Ouest', 'au Nord'], tip: 'La Terre tourne d’Ouest en Est, donc le Soleil se lève à l’Est.' },
  { d: 2, q: 'Vrai ou faux : le jour et la nuit arrivent partout sur la Terre au même moment.', ok: 'faux', bad: ['vrai'], tip: 'Quand c’est le jour d’un côté de la Terre, c’est la nuit de l’autre côté.' },
];
const terre: Gen = (r, d) => {
  const pool = TERRE.filter((x) => x.d <= d); const t = r.pick(pool.filter((x) => x.d === d).length && r.next() < 0.6 ? pool.filter((x) => x.d === d) : pool);
  return { id: uid('te'), skill: 'terre', kind: 'choice', origin: 'generated', prompt: t.q, choices: r.shuffle([t.ok, ...t.bad]), answers: [t.ok], hints: ['Pense à la toupie et au tour autour du Soleil.', t.tip], explanation: t.tip };
};
const decalage: Gen = (r, d) => {
  if (d === 1 || r.next() < 0.5) { const h = r.int(8, 23);
    return { id: uid('de'), skill: 'decalage', kind: 'number', origin: 'generated', prompt: `Il est ${h} h à Bruxelles. Il y a 6 heures de décalage avec Québec, où il est plus tôt. Quelle heure est-il à Québec ? (écris le nombre d’heures)`, answers: [String(h - 6)],
      hints: ['Québec est à l’Ouest : le Soleil s’y lève plus tard, il y est plus tôt qu’à Bruxelles.', 'Retire 6 heures.'], explanation: `${h} − 6 = ${h - 6} : il est ${h - 6} h à Québec.` }; }
  const q = r.int(2, 17);
  return { id: uid('de'), skill: 'decalage', kind: 'number', origin: 'generated', prompt: `Il est ${q} h à Québec. Il y a 6 heures de décalage avec Bruxelles, où il est plus tard. Quelle heure est-il à Bruxelles ? (écris le nombre d’heures)`, answers: [String(q + 6)],
    hints: ['Bruxelles est plus à l’Est : il y est plus tard qu’à Québec.', 'Ajoute 6 heures.'], explanation: `${q} + 6 = ${q + 6} : il est ${q + 6} h à Bruxelles.` };
};
const LOI = ['Je mets ma ceinture de sécurité en voiture.', 'Je m’arrête au feu rouge.', 'Je ne vole pas ce qui appartient aux autres.', 'Je respecte la limitation de vitesse sur la route.'];
const REGLE = ['Je me lave les mains avant de manger.', 'Je lève la main pour parler en classe.', 'Je range mes jouets avant d’aller au lit.', 'Je ne cours pas dans les couloirs de l’école.', 'Je dis bonjour en arrivant en classe.'];
const epc: Gen = (r, d) => {
  const isLoi = r.next() < 0.5; const sent = r.pick(isLoi ? LOI : REGLE); const ok = isLoi ? 'une loi' : 'une règle de vie';
  return { id: uid('ep'), skill: 'epc', kind: 'choice', origin: 'generated', prompt: `Est-ce une règle de vie ou une loi ? « ${sent} »`, choices: r.shuffle(['une règle de vie', 'une loi']), answers: [ok],
    hints: ['Une loi est décidée pour tout le pays et s’applique à tout le monde.', 'Une règle de vie est décidée dans un groupe (la classe, l’école, la famille) pour bien vivre ensemble.'],
    explanation: `${sent} → ${ok}. ${isLoi ? 'La loi est la même pour tout le monde dans le pays.' : 'Cette règle est propre à un groupe : la classe, l’école ou la famille.'}` };
void d;
};
const THEMES: string[][] = [['Livre', 'Musique', 'Télé', 'Jeu vidéo'], ['Pomme', 'Banane', 'Fraise', 'Orange'], ['Chien', 'Chat', 'Lapin', 'Poisson'], ['Football', 'Natation', 'Danse', 'Vélo']];
const statistiques: Gen = (r, d) => {
  const labels = r.pick(THEMES); const vals = r.shuffle(Array.from({ length: 12 }, (_, i) => i + 1)).slice(0, 4); const items = labels.map((l, i) => [l, vals[i]] as [string, number]);
  const visual = { type: 'bars' as const, items };
  const i = r.int(0, 3), j = (i + r.int(1, 3)) % 4; const [a, va] = items[i], [b, vb] = items[j];
  const kind = d === 1 ? r.int(0, 2) : r.int(1, 4);
  if (kind === 0) return { id: uid('st'), skill: 'statistiques', kind: 'number', origin: 'generated', visual, prompt: `Combien d’élèves ont choisi « ${a} » ?`, answers: [String(va)], hints: ['Regarde la hauteur de la barre.', 'Suis la barre jusqu’à l’échelle à gauche.'], explanation: `La barre « ${a} » monte jusqu’à ${va}.` };
  if (kind === 2) { const top = items.reduce((m, x) => (x[1] > m[1] ? x : m)); return { id: uid('st'), skill: 'statistiques', kind: 'choice', origin: 'generated', visual, prompt: 'Quel choix a été fait par le plus d’élèves ?', choices: labels, answers: [top[0]], hints: ['Cherche la barre la plus haute.', 'Compare toutes les barres.'], explanation: `La barre la plus haute est « ${top[0]} » (${top[1]}).` }; }
  if (kind === 1) return { id: uid('st'), skill: 'statistiques', kind: 'number', origin: 'generated', visual, prompt: `Combien d’élèves ont choisi « ${a} » ou « ${b} » en tout ?`, answers: [String(va + vb)], hints: ['Lis chaque barre.', 'Additionne les deux nombres.'], explanation: `${va} + ${vb} = ${va + vb}.` };
  if (kind === 3) { const hi = va > vb ? [a, va, b, vb] : [b, vb, a, va]; return { id: uid('st'), skill: 'statistiques', kind: 'number', origin: 'generated', visual, prompt: `Combien d’élèves de plus ont choisi « ${hi[0]} » que « ${hi[2]} » ?`, answers: [String((hi[1] as number) - (hi[3] as number))], hints: ['Lis les deux barres.', 'Fais une soustraction : le plus grand moins le plus petit.'], explanation: `${hi[1]} − ${hi[3]} = ${(hi[1] as number) - (hi[3] as number)}.` }; }
  const tot = vals.reduce((x, y) => x + y, 0);
  return { id: uid('st'), skill: 'statistiques', kind: 'number', origin: 'generated', visual, prompt: 'Combien d’élèves ont répondu au sondage en tout ?', answers: [String(tot)], hints: ['Lis la valeur de chaque barre.', 'Additionne les quatre nombres.'], explanation: `${vals.join(' + ')} = ${tot}.` };
};

/* ---------- Temple des Formes (géométrie) ---------- */
export const GEO_SKILLS: SkillId[] = ['polygones', 'angles', 'quadrilateres', 'perimetre', 'solides', 'symetrie'];
const POLY: [number, string][] = [[3, 'triangle'], [4, 'quadrilatère'], [5, 'pentagone'], [6, 'hexagone'], [8, 'octogone']];
const polygones: Gen = (r, d) => {
  const pool = POLY.filter(([n]) => d >= 2 || n <= 6); const [n, name] = r.pick(pool);
  const opts = r.shuffle([name, ...r.shuffle(POLY.map((x) => x[1]).filter((x) => x !== name)).slice(0, d === 1 ? 2 : 3)]);
  return { id: uid('po'), skill: 'polygones', kind: 'choice', origin: 'generated', visual: { type: 'polygon', sides: n }, prompt: 'Comment s’appelle cette figure ?', choices: opts, answers: [name],
    hints: ['Compte les côtés de la figure, un par un.', 'Triangle = 3 côtés, quadrilatère = 4, pentagone = 5, hexagone = 6, octogone = 8.'],
    explanation: `La figure a ${n} côtés : c’est un ${name}.` };
};
const angles: Gen = (r, d) => {
  const list: [number, string][] = [[90, 'droit'], [30, 'aigu'], [45, 'aigu'], [60, 'aigu'], [120, 'obtus'], [135, 'obtus'], [150, 'obtus'], ...(d >= 2 ? [[180, 'plat'] as [number, string]] : [])];
  const [deg, nm] = r.pick(list); const all = d >= 2 ? ['droit', 'aigu', 'obtus', 'plat'] : ['droit', 'aigu', 'obtus'];
  return { id: uid('an'), skill: 'angles', kind: 'choice', origin: 'generated', visual: { type: 'angle', deg }, prompt: 'Cet angle est…', choices: r.shuffle(all), answers: [nm],
    hints: ['Compare avec un angle droit, comme le coin d’une feuille.', 'Plus petit qu’un angle droit : aigu. Plus grand : obtus. Une ligne droite : plat.'],
    explanation: `Cet angle est ${nm}. Droit = coin de feuille (90°), aigu = plus petit, obtus = plus grand mais moins qu’une ligne droite, plat = ligne droite (180°).` };
};
const QUAD: { d: number; q: string; ok: string; bad: string[]; tip: string }[] = [
  { d: 1, q: 'Quelle figure a 4 côtés égaux et 4 angles droits ?', ok: 'le carré', bad: ['le rectangle', 'le triangle', 'le losange'], tip: 'Le carré est le seul à avoir 4 côtés égaux ET 4 angles droits.' },
  { d: 1, q: 'Combien un rectangle a-t-il d’angles droits ?', ok: '4', bad: ['2', '3', '0'], tip: 'Un rectangle a 4 angles droits, un à chaque coin.' },
  { d: 1, q: 'Dans un rectangle, les côtés opposés sont…', ok: 'parallèles', bad: ['perpendiculaires', 'obliques', 'tous égaux'], tip: 'Les côtés opposés d’un rectangle ne se rejoignent jamais : ils sont parallèles (et de même longueur).' },
  { d: 1, q: 'Deux droites qui se coupent en formant un angle droit sont…', ok: 'perpendiculaires', bad: ['parallèles', 'égales', 'obtuses'], tip: 'Perpendiculaires = elles se croisent en angle droit.' },
  { d: 1, q: 'Deux droites qui ne se croisent jamais, toujours à la même distance, sont…', ok: 'parallèles', bad: ['perpendiculaires', 'sécantes', 'obtuses'], tip: 'Parallèles = comme les rails d’un train.' },
  { d: 2, q: 'Quelle figure a 4 côtés égaux mais pas forcément d’angle droit ?', ok: 'le losange', bad: ['le rectangle', 'le trapèze', 'le triangle'], tip: 'Le losange a 4 côtés égaux ; ses angles ne sont pas droits en général.' },
  { d: 2, q: 'Un trapèze a…', ok: 'au moins une paire de côtés parallèles', bad: ['4 angles droits', '4 côtés égaux', '3 côtés'], tip: 'Un trapèze a au moins deux côtés parallèles (les « bases »).' },
  { d: 2, q: 'Dans un carré, deux côtés qui se suivent (côtés consécutifs) sont…', ok: 'perpendiculaires', bad: ['parallèles', 'obliques', 'plats'], tip: 'Les côtés consécutifs d’un carré forment un angle droit.' },
  { d: 2, q: 'Quel quadrilatère a ses côtés opposés parallèles et de même longueur, mais pas d’angle droit ?', ok: 'le parallélogramme', bad: ['le carré', 'le rectangle', 'le triangle'], tip: 'Le parallélogramme est comme un rectangle « penché ».' },
  { d: 2, q: 'Combien un carré a-t-il de côtés égaux ?', ok: '4', bad: ['2', '3', '1'], tip: 'Les 4 côtés du carré ont la même longueur.' },
];
const quadrilateres: Gen = (r, d) => {
  const pool = QUAD.filter((x) => x.d <= d); const q = r.pick(pool.filter((x) => x.d === d).length && r.next() < 0.6 ? pool.filter((x) => x.d === d) : pool);
  return { id: uid('qu'), skill: 'quadrilateres', kind: 'choice', origin: 'generated', prompt: q.q, choices: r.shuffle([q.ok, ...q.bad.slice(0, d === 1 ? 2 : 3)]), answers: [q.ok],
    hints: ['Imagine la figure et dessine-la dans ta tête.', q.tip], explanation: q.tip };
};
const perimetre: Gen = (r, d) => {
  if (d === 1) { const L = r.int(4, 15), l = r.int(2, L - 1);
    return { id: uid('pe'), skill: 'perimetre', kind: 'number', origin: 'generated', prompt: `Un rectangle mesure ${L} cm de long et ${l} cm de large. Quel est son périmètre ? (en cm)`, answers: [String(2 * (L + l))],
      hints: ['Le périmètre, c’est le tour de la figure : on additionne tous les côtés.', 'Un rectangle a 2 longueurs et 2 largeurs.'], explanation: `${L} + ${l} + ${L} + ${l} = ${2 * (L + l)} cm.` }; }
  if (d === 2) { const a = r.int(3, 12), b = r.int(3, 12), c = r.int(3, 12);
    return { id: uid('pe'), skill: 'perimetre', kind: 'number', origin: 'generated', prompt: `Un triangle a des côtés de ${a} cm, ${b} cm et ${c} cm. Quel est son périmètre ? (en cm)`, answers: [String(a + b + c)],
      hints: ['Additionne les trois côtés.', 'Le périmètre est la longueur du tour.'], explanation: `${a} + ${b} + ${c} = ${a + b + c} cm.` }; }
  const c = r.int(3, 15);
  return { id: uid('pe'), skill: 'perimetre', kind: 'number', origin: 'generated', prompt: `Un carré a un périmètre de ${4 * c} cm. Combien mesure un côté ? (en cm)`, answers: [String(c)],
    hints: ['Un carré a 4 côtés égaux.', 'Divise le périmètre par 4.'], explanation: `${4 * c} ÷ 4 = ${c} cm.` };
};
const SOL: { n: string; f: number; e: number; s: number; d: number }[] = [
  { n: 'un cube', f: 6, e: 12, s: 8, d: 1 }, { n: 'un pavé droit', f: 6, e: 12, s: 8, d: 1 },
  { n: 'une pyramide à base carrée', f: 5, e: 8, s: 5, d: 2 }, { n: 'un prisme droit à base triangulaire', f: 5, e: 9, s: 6, d: 2 }, { n: 'un tétraèdre (pyramide à base triangulaire)', f: 4, e: 6, s: 4, d: 3 },
];
const solides: Gen = (r, d) => {
  const sol = r.pick(SOL.filter((x) => x.d <= d)); const w = r.pick([['faces', 'f'], ['arêtes', 'e'], ['sommets', 's']] as const);
  const ans = sol[w[1]];
  return { id: uid('so'), skill: 'solides', kind: 'number', origin: 'generated', prompt: `Combien ${sol.n} a-t-il ${w[0] === 'arêtes' ? 'd’' : 'de '}${w[0]} ?`, answers: [String(ans)],
    hints: ['Aide-toi d’une boîte réelle : une boîte de céréales ou un dé.', 'Une face est une surface plate, une arête est le bord où deux faces se touchent, un sommet est un coin.'],
    explanation: `${cap1(sol.n)} a ${sol.f} faces, ${sol.e} arêtes et ${sol.s} sommets.` };
};
const SYM: { n: string; a: number; d: number }[] = [
  { n: 'un carré', a: 4, d: 1 }, { n: 'un rectangle (qui n’est pas un carré)', a: 2, d: 1 }, { n: 'un triangle équilatéral (3 côtés égaux)', a: 3, d: 1 },
  { n: 'un losange (qui n’est pas un carré)', a: 2, d: 2 }, { n: 'un pentagone régulier', a: 5, d: 2 }, { n: 'un hexagone régulier', a: 6, d: 3 },
];
const symetrie: Gen = (r, d) => {
  const f = r.pick(SYM.filter((x) => x.d <= d));
  return { id: uid('sy'), skill: 'symetrie', kind: 'number', origin: 'generated', prompt: `Combien ${f.n} a-t-il d’axes de symétrie ?`, answers: [String(f.a)],
    hints: ['Un axe de symétrie est une ligne de pliage : les deux moitiés se superposent exactement.', 'Imagine que tu plies la figure de toutes les façons possibles.'],
    explanation: `${cap1(f.n)} a ${f.a} axes de symétrie.` };
};

/* ---------- Monde des Mots (français) ---------- */
export const FRENCH_SKILLS: SkillId[] = ['homophones', 'pluriel', 'accord', 'conjugaison', 'nature', 'vocabulaire'];
const cap1 = (t: string) => t[0].toUpperCase() + t.slice(1);

const HOMO: { d: number; s: string; ok: string; pair: string[]; tip: string }[] = [
  { d: 1, s: 'Léa ___ un chat noir.', ok: 'a', pair: ['a', 'à'], tip: 'Essaie « avait » : « Léa avait un chat noir » est correct, donc on écrit a (verbe avoir).' },
  { d: 1, s: 'Nous allons ___ l’école.', ok: 'à', pair: ['a', 'à'], tip: 'Essaie « avait » : « Nous allons avait l’école » ne va pas, donc on écrit à.' },
  { d: 1, s: 'Mon frère ___ dix ans.', ok: 'a', pair: ['a', 'à'], tip: 'On peut dire « avait » : c’est le verbe avoir, donc a.' },
  { d: 1, s: 'Il donne un livre ___ Sam.', ok: 'à', pair: ['a', 'à'], tip: '« Il donne un livre avait Sam » ne va pas : on écrit à.' },
  { d: 1, s: 'Le chien ___ faim.', ok: 'a', pair: ['a', 'à'], tip: 'Remplace par « avait » : le verbe avoir s’écrit a, sans accent.' },
  { d: 1, s: 'Je pense ___ toi.', ok: 'à', pair: ['a', 'à'], tip: 'Impossible de dire « je pense avait toi » : on écrit à.' },
  { d: 1, s: 'Le ciel ___ bleu.', ok: 'est', pair: ['et', 'est'], tip: 'Remplace par « était » : « Le ciel était bleu » est correct, donc est.' },
  { d: 1, s: 'Du pain ___ du beurre.', ok: 'et', pair: ['et', 'est'], tip: '« Du pain était du beurre » ne va pas : c’est le petit mot qui relie, et.' },
  { d: 1, s: 'Mon sac ___ lourd.', ok: 'est', pair: ['et', 'est'], tip: 'Remplace par « était » : ça marche, donc est.' },
  { d: 1, s: 'Je lis ___ j’écris.', ok: 'et', pair: ['et', 'est'], tip: 'On peut remplacer par « et puis » : c’est et, qui relie deux mots ou deux phrases.' },
  { d: 1, s: 'Elle ___ contente.', ok: 'est', pair: ['et', 'est'], tip: 'Remplace par « était » : « Elle était contente » est correct, donc est.' },
  { d: 1, s: 'Hajar ___ Zakaria jouent dehors.', ok: 'et', pair: ['et', 'est'], tip: 'On relie deux prénoms : on écrit et.' },
  { d: 2, s: 'Ce soir, ___ va au cinéma.', ok: 'on', pair: ['on', 'ont'], tip: 'Remplace par « il » : « Il va au cinéma » est correct, donc on.' },
  { d: 2, s: 'Les élèves ___ fini.', ok: 'ont', pair: ['on', 'ont'], tip: 'Remplace par « avaient » : « Les élèves avaient fini » est correct, donc ont (verbe avoir).' },
  { d: 2, s: 'À la récré, ___ joue au ballon.', ok: 'on', pair: ['on', 'ont'], tip: 'Remplace par « il » : ça marche, donc on.' },
  { d: 2, s: 'Ils ___ de la chance.', ok: 'ont', pair: ['on', 'ont'], tip: 'Remplace par « avaient » : c’est le verbe avoir, donc ont.' },
  { d: 2, s: 'Les fleurs ___ jolies.', ok: 'sont', pair: ['son', 'sont'], tip: 'Remplace par « étaient » : « Les fleurs étaient jolies » est correct, donc sont.' },
  { d: 2, s: 'Il range ___ cartable.', ok: 'son', pair: ['son', 'sont'], tip: 'Remplace par « mon » : « Il range mon cartable » est correct, donc son.' },
  { d: 2, s: 'Elles ___ parties tôt.', ok: 'sont', pair: ['son', 'sont'], tip: 'Remplace par « étaient » : ça marche, donc sont (verbe être).' },
  { d: 2, s: 'Léa lave ___ vélo.', ok: 'son', pair: ['son', 'sont'], tip: 'Remplace par « mon » : « Léa lave mon vélo » est correct, donc son.' },
  { d: 3, s: 'Les enfants ___ rangé ___ cartable.', ok: 'ont|son', pair: ['ont|son', 'on|sont', 'ont|sont', 'on|son'], tip: 'Essaie « avaient » pour le premier trou et « mon » pour le second.' },
  { d: 3, s: '___ dit qu’ils ___ contents de ___ cadeau.', ok: 'on|sont|son', pair: ['on|sont|son', 'ont|son|sont', 'on|son|sont', 'ont|sont|son'], tip: 'Teste chaque trou : « il », « étaient », « mon ».' },
];
const homophones: Gen = (r, d) => {
  const pool = HOMO.filter((h) => h.d <= d);
  const h = r.pick(pool.filter((x) => x.d === d).length ? pool.filter((x) => x.d === d || r.next() < 0.3) : pool);
  const multi = h.ok.includes('|');
  const ok = h.ok;
  const finalChoices = r.shuffle([...h.pair]);
  const filled = multi ? h.s.split('___').reduce((acc, part, i) => acc + part + (ok.split('|')[i] ?? ''), '') : h.s.replace('___', ok);
  return { id: uid('ho'), skill: 'homophones', kind: 'choice', origin: 'generated',
    prompt: multi ? `Quels mots complètent la phrase, dans l’ordre ? « ${h.s} »` : `Complète : « ${h.s} »`, choices: finalChoices, answers: [ok],
    hints: ['Remplace le mot par un autre mot pour tester.', h.tip], explanation: `${h.tip} La phrase correcte est : « ${filled} »` };
};

const PLURALS: { s: string; p: string; d: number; rule: string }[] = [
  { s: 'fleur', p: 'fleurs', d: 1, rule: 'Règle générale : on ajoute -s.' },
  { s: 'enfant', p: 'enfants', d: 1, rule: 'Règle générale : on ajoute -s.' },
  { s: 'maison', p: 'maisons', d: 1, rule: 'Règle générale : on ajoute -s.' },
  { s: 'bateau', p: 'bateaux', d: 1, rule: 'Les noms en -eau prennent -x au pluriel.' },
  { s: 'gâteau', p: 'gâteaux', d: 1, rule: 'Les noms en -eau prennent -x au pluriel.' },
  { s: 'cadeau', p: 'cadeaux', d: 1, rule: 'Les noms en -eau prennent -x au pluriel.' },
  { s: 'jeu', p: 'jeux', d: 1, rule: 'Les noms en -eu prennent -x au pluriel.' },
  { s: 'cheveu', p: 'cheveux', d: 1, rule: 'Les noms en -eu prennent -x au pluriel.' },
  { s: 'cheval', p: 'chevaux', d: 2, rule: 'Les noms en -al font souvent -aux au pluriel.' },
  { s: 'journal', p: 'journaux', d: 2, rule: 'Les noms en -al font souvent -aux au pluriel.' },
  { s: 'animal', p: 'animaux', d: 2, rule: 'Les noms en -al font souvent -aux au pluriel.' },
  { s: 'hôpital', p: 'hôpitaux', d: 2, rule: 'Les noms en -al font souvent -aux au pluriel.' },
  { s: 'nez', p: 'nez', d: 2, rule: 'Un nom qui finit par -z, -s ou -x ne change pas au pluriel.' },
  { s: 'bras', p: 'bras', d: 2, rule: 'Un nom qui finit par -z, -s ou -x ne change pas au pluriel.' },
  { s: 'souris', p: 'souris', d: 2, rule: 'Un nom qui finit par -z, -s ou -x ne change pas au pluriel.' },
  { s: 'pays', p: 'pays', d: 2, rule: 'Un nom qui finit par -z, -s ou -x ne change pas au pluriel.' },
  { s: 'chou', p: 'choux', d: 3, rule: 'Exception à retenir : chou, bijou, genou, caillou, hibou, joujou prennent -x.' },
  { s: 'bijou', p: 'bijoux', d: 3, rule: 'Exception à retenir : chou, bijou, genou, caillou, hibou, joujou prennent -x.' },
  { s: 'genou', p: 'genoux', d: 3, rule: 'Exception à retenir : chou, bijou, genou, caillou, hibou, joujou prennent -x.' },
  { s: 'travail', p: 'travaux', d: 3, rule: 'Exception : travail fait travaux au pluriel.' },
];
const pluriel: Gen = (r, d) => {
  const pool = PLURALS.filter((x) => x.d <= d); const it = r.pick(pool.filter((x) => x.d === d).length && r.next() < 0.7 ? pool.filter((x) => x.d === d) : pool);
  const cand = [it.s + 's', it.s + 'x', it.s.replace(/al$/, 'als'), it.s.replace(/al$/, 'aux'), it.s, it.s.replace(/ail$/, 'ails')];
  const wrong = r.shuffle([...new Set(cand)].filter((c) => c !== it.p));
  const opts = r.shuffle([it.p, ...wrong.slice(0, d === 1 ? 2 : 3)]);
  return { id: uid('pl'), skill: 'pluriel', kind: 'choice', origin: 'generated', prompt: `Quel est le pluriel de « un ${it.s} » ?`, choices: opts, answers: [it.p],
    hints: ['Regarde comment le mot se termine.', it.rule], explanation: `Un ${it.s}, des ${it.p}. ${it.rule}` };
};

const VERB_ACC: { s: string; ok: string; bad: string; rest: string }[] = [
  { s: 'Les enfants', ok: 'jouent', bad: 'joue', rest: 'dans la cour.' },
  { s: 'Mon frère', ok: 'chante', bad: 'chantent', rest: 'sous la douche.' },
  { s: 'Les oiseaux', ok: 'volent', bad: 'vole', rest: 'dans le ciel.' },
  { s: 'Le chat', ok: 'dort', bad: 'dorment', rest: 'sur le canapé.' },
  { s: 'Zakaria et Hajar', ok: 'dessinent', bad: 'dessine', rest: 'un cheval.' },
  { s: 'Soumaya', ok: 'lit', bad: 'lisent', rest: 'un livre.' },
  { s: 'Les élèves', ok: 'écoutent', bad: 'écoute', rest: 'la maîtresse.' },
  { s: 'La fillette', ok: 'regarde', bad: 'regardent', rest: 'la télévision.' },
  { s: 'Mes parents', ok: 'préparent', bad: 'prépare', rest: 'le repas.' },
  { s: 'Le cuisinier', ok: 'mange', bad: 'mangent', rest: 'une pomme.' },
];
const ADJ_ACC: { t: string; ok: string; bad: string[]; hint: string }[] = [
  { t: 'Une robe ___', ok: 'blanche', bad: ['blanc', 'blancs'], hint: 'Le nom « robe » est féminin singulier.' },
  { t: 'Des fleurs ___', ok: 'rouges', bad: ['rouge'], hint: 'Le nom « fleurs » est au pluriel : on ajoute -s.' },
  { t: 'Un petit garçon ___', ok: 'content', bad: ['contente', 'contents'], hint: '« garçon » est masculin singulier.' },
  { t: 'Les filles sont ___', ok: 'contentes', bad: ['content', 'contente'], hint: '« filles » est féminin pluriel : -e et -s.' },
  { t: 'Des chaussures ___', ok: 'neuves', bad: ['neuf', 'neufs'], hint: '« chaussures » est féminin pluriel.' },
  { t: 'Une grande maison ___', ok: 'ancienne', bad: ['ancien', 'anciens'], hint: '« maison » est féminin singulier.' },
  { t: 'Des gâteaux ___', ok: 'délicieux', bad: ['délicieuse', 'délicieuses'], hint: '« gâteaux » est masculin pluriel ; délicieux se termine déjà par -x.' },
  { t: 'Mes amies sont ___', ok: 'gentilles', bad: ['gentil', 'gentils'], hint: '« amies » est féminin pluriel.' },
];
const accord: Gen = (r, d) => {
  if (d >= 2 && r.next() < 0.5) {
    const a = r.pick(ADJ_ACC); const opts = r.shuffle([a.ok, ...a.bad.filter((x) => x !== a.ok)]).slice(0, 3);
    if (!opts.includes(a.ok)) opts[0] = a.ok;
    return { id: uid('ac'), skill: 'accord', kind: 'choice', origin: 'generated', prompt: `Accorde l’adjectif : « ${a.t} »`, choices: r.shuffle(opts), answers: [a.ok],
      hints: ['Cherche le nom que l’adjectif décrit : est-il masculin ou féminin, singulier ou pluriel ?', a.hint], explanation: `${a.hint} On écrit : « ${a.t.replace('___', a.ok)} ».` };
  }
  const v = r.pick(VERB_ACC);
  return { id: uid('ac'), skill: 'accord', kind: 'choice', origin: 'generated', prompt: `Choisis le bon verbe : « ${v.s} ___ ${v.rest} »`, choices: r.shuffle([v.ok, v.bad]), answers: [v.ok],
    hints: ['Trouve le sujet : est-ce qu’il y a une seule personne (ou chose) ou plusieurs ?', 'Au présent, un sujet pluriel donne une terminaison en -ent ; un sujet singulier, -e ou -t.'],
    explanation: `Le sujet est « ${v.s} » : le verbe s’écrit « ${v.ok} ». « ${v.s} ${v.ok} ${v.rest} »` };
};

type Forms = [string, string, string, string, string, string];
const VERBS: { inf: string; f: Forms; d: number }[] = [
  { inf: 'être', f: ['suis', 'es', 'est', 'sommes', 'êtes', 'sont'], d: 1 },
  { inf: 'avoir', f: ['ai', 'as', 'a', 'avons', 'avez', 'ont'], d: 1 },
  { inf: 'chanter', f: ['chante', 'chantes', 'chante', 'chantons', 'chantez', 'chantent'], d: 1 },
  { inf: 'jouer', f: ['joue', 'joues', 'joue', 'jouons', 'jouez', 'jouent'], d: 1 },
  { inf: 'regarder', f: ['regarde', 'regardes', 'regarde', 'regardons', 'regardez', 'regardent'], d: 1 },
  { inf: 'aller', f: ['vais', 'vas', 'va', 'allons', 'allez', 'vont'], d: 2 },
  { inf: 'faire', f: ['fais', 'fais', 'fait', 'faisons', 'faites', 'font'], d: 2 },
  { inf: 'dire', f: ['dis', 'dis', 'dit', 'disons', 'dites', 'disent'], d: 3 },
  { inf: 'manger', f: ['mange', 'manges', 'mange', 'mangeons', 'mangez', 'mangent'], d: 3 },
  { inf: 'finir', f: ['finis', 'finis', 'finit', 'finissons', 'finissez', 'finissent'], d: 3 },
];
const PRON = ['je', 'tu', 'il', 'nous', 'vous', 'ils'];
const withPron = (p: string, f: string) => (p === 'je' && /^[aeiouhéèêâ]/i.test(f) ? 'j’' + f : p + ' ' + f);
const conjugaison: Gen = (r, d) => {
  const pool = VERBS.filter((v) => v.d <= d); const v = r.pick(pool.filter((x) => x.d === d).length && r.next() < 0.6 ? pool.filter((x) => x.d === d) : pool);
  const pi = r.int(0, 5); const ok = v.f[pi];
  const wrong = r.shuffle([...new Set(v.f.filter((f) => f !== ok))]);
  const opts = r.shuffle([ok, ...wrong.slice(0, d === 1 ? 2 : 3)]).map((f) => withPron(PRON[pi], f));
  const okFull = withPron(PRON[pi], ok);
  return { id: uid('cj'), skill: 'conjugaison', kind: 'choice', origin: 'generated', prompt: `Au présent, avec « ${PRON[pi]} » : ${v.inf}`, choices: opts, answers: [okFull],
    hints: ['Le verbe change de terminaison selon la personne (je, tu, il, nous, vous, ils).', pi < 3 ? 'Pour je / tu / il, la terminaison est courte.' : 'Pour nous, la terminaison est -ons ; pour vous, -ez (sauf dites, faites, êtes) ; pour ils, -ent (sauf être, avoir, aller, faire…).'],
    explanation: `Au présent, « ${v.inf} » donne : ${PRON.map((p, i) => withPron(p, v.f[i])).join(' ; ')}.` };
};

const NATURE: { sent: string; w: string; nat: string }[] = [
  { sent: 'Le chat dort.', w: 'chat', nat: 'nom' }, { sent: 'Le chat dort.', w: 'dort', nat: 'verbe' },
  { sent: 'La maison est belle.', w: 'maison', nat: 'nom' }, { sent: 'La maison est belle.', w: 'belle', nat: 'adjectif' },
  { sent: 'Hajar dessine un cheval.', w: 'dessine', nat: 'verbe' }, { sent: 'Hajar dessine un cheval.', w: 'cheval', nat: 'nom' },
  { sent: 'Elle porte une robe rouge.', w: 'rouge', nat: 'adjectif' }, { sent: 'Elle porte une robe rouge.', w: 'porte', nat: 'verbe' },
  { sent: 'Un petit oiseau chante.', w: 'petit', nat: 'adjectif' }, { sent: 'Un petit oiseau chante.', w: 'oiseau', nat: 'nom' },
  { sent: 'Nous jouons dehors.', w: 'jouons', nat: 'verbe' }, { sent: 'Soumaya lit un livre.', w: 'livre', nat: 'nom' },
  { sent: 'Le gâteau est délicieux.', w: 'délicieux', nat: 'adjectif' }, { sent: 'Mon frère chante.', w: 'frère', nat: 'nom' },
  { sent: 'Les enfants jouent.', w: 'Les', nat: 'déterminant' }, { sent: 'Mon cartable est lourd.', w: 'Mon', nat: 'déterminant' },
  { sent: 'Une pomme tombe.', w: 'Une', nat: 'déterminant' }, { sent: 'Zakaria range ses jouets.', w: 'ses', nat: 'déterminant' },
];
const NAT_HINT: Record<string, string> = {
  nom: 'Un nom désigne une personne, un animal, une chose. On peut mettre « un » ou « une » devant.',
  verbe: 'Un verbe dit ce qu’on fait ou ce qu’on est. Il change si on change le temps (hier, demain).',
  adjectif: 'Un adjectif décrit un nom : il dit comment il est (grand, rouge, délicieux).',
  déterminant: 'Un déterminant se place devant un nom (le, la, les, un, une, mon, ses…).',
};
const nature: Gen = (r, d) => {
  const pool = NATURE.filter((x) => d >= 2 || x.nat !== 'déterminant'); const it = r.pick(pool);
  const all = d >= 2 ? ['nom', 'verbe', 'adjectif', 'déterminant'] : ['nom', 'verbe', 'adjectif'];
  return { id: uid('na'), skill: 'nature', kind: 'choice', origin: 'generated', prompt: `Dans « ${it.sent} », quelle est la nature du mot « ${it.w} » ?`, choices: r.shuffle(all), answers: [it.nat],
    hints: ['Pense à ce que le mot fait dans la phrase.', NAT_HINT[it.nat]], explanation: `« ${it.w} » est un ${it.nat}. ${NAT_HINT[it.nat]}` };
};

const CONTR: [string, string][] = [['grand', 'petit'], ['chaud', 'froid'], ['rapide', 'lent'], ['content', 'triste'], ['facile', 'difficile'], ['jour', 'nuit'], ['ouvrir', 'fermer'], ['monter', 'descendre'], ['fort', 'faible'], ['propre', 'sale'], ['plein', 'vide'], ['tôt', 'tard'], ['lourd', 'léger'], ['gagner', 'perdre'], ['arriver', 'partir'], ['devant', 'derrière']];
const SYN: [string, string][] = [['joli', 'beau'], ['content', 'heureux'], ['commencer', 'débuter'], ['voiture', 'auto'], ['bateau', 'navire'], ['cadeau', 'présent'], ['médecin', 'docteur'], ['terminer', 'finir'], ['gentil', 'aimable'], ['se dépêcher', 'se hâter'], ['peur', 'frayeur']];
const vocabulaire: Gen = (r, d) => {
  const useSyn = d >= 2 && r.next() < 0.5; const bank = useSyn ? SYN : CONTR;
  const [w, ans] = r.pick(bank);
  const pool = [...CONTR, ...SYN].flatMap((p) => p).filter((x) => x !== w && x !== ans && !bank.some(([a, b]) => (a === w && b === x) || (b === w && a === x)) && !SYN.some(([a, b]) => (a === w && b === x) || (b === w && a === x)) && !CONTR.some(([a, b]) => (a === w && b === x) || (b === w && a === x)));
  const opts = r.shuffle([ans, ...r.shuffle([...new Set(pool)]).slice(0, d === 1 ? 2 : 3)]);
  return { id: uid('vo'), skill: 'vocabulaire', kind: 'choice', origin: 'generated', prompt: useSyn ? `Quel mot a presque le même sens que « ${w} » ?` : `Quel est le contraire de « ${w} » ?`, choices: opts, answers: [ans],
    hints: [useSyn ? 'Un synonyme veut dire à peu près la même chose.' : 'Un contraire a le sens opposé.', `Pense à une phrase avec « ${w} » et teste chaque mot.`],
    explanation: useSyn ? `« ${w} » et « ${ans} » ont presque le même sens (synonymes).` : `Le contraire de « ${w} » est « ${ans} ».` };
};
void cap1;

export const GENERATORS: Record<SkillId, Gen> = {
  suites, abaque, comparer, decomposer, addition, soustraction, tables, division, 'choix-operation': choixOp, probleme,
  conversion, heure, duree, fractions, aire, monnaie, frise, siecles, terre, decalage, epc, statistiques, polygones, angles, quadrilateres, perimetre, solides, symetrie, homophones, pluriel, accord, conjugaison, nature, vocabulaire,
};

export function generate(skill: SkillId, rng: Rng, difficulty = 1): Exercise {
  return GENERATORS[skill](rng, Math.min(3, Math.max(1, difficulty)));
}
