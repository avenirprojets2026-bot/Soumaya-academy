// La Tour de Cristal : nombres, calcul et problèmes. 10 niveaux (1-6 : P4, 7-10 : P5).
// Tous les énoncés sont générés à partir d'une graine et leurs corrigés sont calculés (jamais saisis à la main).
import type { Mission, Question } from "./kit";
import { fmt, euro, fresh, hashSeed, mulberry32, numDistractors, pick, ri, shuffled, words, type Rng } from "./gen-core";
import { mcq, tf, num, ord, mat } from "./kit";

export type G = (r: Rng) => Question;

const FEM = ["Soumaya", "Inès", "Aya", "Lina", "Nour", "Jade", "Mila", "Léa"];
const MAS = ["Yanis", "Noé", "Elias", "Rayan", "Tom", "Adam"];
const NAMES = [...FEM, ...MAS];
const she = (n: string) => (FEM.includes(n) ? "elle" : "il");
const THINGS: [string, string][] = [
  ["cristaux lumineux", "cristal"],
  ["étoiles filantes", "étoile"],
  ["pièces d'or", "pièce d'or"],
  ["perles de sirène", "perle"],
  ["cartes de dragons", "carte"],
  ["graines magiques", "graine"],
  ["lanternes volantes", "lanterne"],
  ["billes de cristal", "bille"],
];

// ---------- Numération ----------
const wordsToDigits = (lo: number, hi: number): G => (r) => {
  const n = ri(r, lo, hi);
  return num(`Écris en chiffres : ${words(n)}.`, String(n), `${words(n)} s'écrit ${fmt(n)}. Découpe le nombre par paquets : ${hi >= 1000 ? "milliers, centaines, dizaines, unités" : "centaines, dizaines, unités"}.`);
};
const digitsToWords = (lo: number, hi: number): G => (r) => {
  const n = ri(r, lo, hi);
  const cand = new Set<number>([n + 10, n - 10, n + 100, n - 100, n + 1, Math.floor(n / 10) * 10 + Math.floor(n / 10 % 10)]);
  const ko = [...cand].filter((x) => x !== n && x > 0).slice(0, 3).map((x) => words(x));
  return mcq(`Comment écrit-on ${fmt(n)} en lettres ?`, words(n), ko, `${fmt(n)} se lit « ${words(n)} » (en Belgique : septante, nonante).`);
};
const compare = (lo: number, hi: number): G => (r) => {
  const a = ri(r, lo, hi);
  let b = a + pick(r, [-1, 1]) * ri(r, 1, Math.max(2, Math.floor((hi - lo) / 40)));
  if (b === a || b < lo) b = a + 7;
  const sign = a < b ? "<" : ">";
  return mcq(`Choisis le bon signe : ${fmt(a)} … ${fmt(b)}`, sign, [a < b ? ">" : "<", "="], `On compare les chiffres de gauche à droite : ${fmt(a)} ${sign} ${fmt(b)}. Le plus grand nombre est ${fmt(Math.max(a, b))}.`);
};
const order = (k: number, lo: number, hi: number): G => (r) => {
  const s = new Set<number>();
  const base = ri(r, lo, hi);
  s.add(base);
  while (s.size < k) s.add(Math.max(lo, Math.min(hi, base + ri(r, -Math.floor((hi - lo) / 8), Math.floor((hi - lo) / 8)))));
  const asc = [...s].sort((x, y) => x - y);
  return ord(`Range ces nombres du plus petit au plus grand : ${shuffled(r, asc).map(fmt).join(" ; ")}.`, asc.map(fmt), `On compare d'abord le nombre de chiffres, puis les chiffres en partant de la gauche : ${asc.map(fmt).join(" < ")}.`);
};
const skip = (step: number, count = 4): G => (r) => {
  const start = ri(r, 2, 60) * (step >= 100 ? 10 : 1) + (step === 5 ? ri(r, 0, 4) : 0);
  const seq = Array.from({ length: count }, (_, i) => start + i * step);
  const next = start + count * step;
  return num(`Les lutins comptent de ${step} en ${step} : ${seq.join(", ")}, … Quel est le nombre suivant ?`, String(next), `On ajoute ${step} à chaque fois : ${seq[count - 1]} + ${step} = ${next}.`);
};
const place = (digits: number): G => (r) => {
  const n = ri(r, 10 ** (digits - 1), 10 ** digits - 1);
  const names = ["unités", "dizaines", "centaines", "milliers", "dizaines de mille"];
  const idx = ri(r, 0, digits - 1);
  const d = Math.floor(n / 10 ** idx) % 10;
  return num(`Dans ${fmt(n)}, quel est le chiffre des ${names[idx]} ?`, String(d), `On lit de droite à gauche : unités, dizaines, centaines, milliers… Dans ${fmt(n)}, le chiffre des ${names[idx]} est ${d}.`);
};
const decompose = (thousands: boolean): G => (r) => {
  const m = thousands ? ri(r, 1, 9) : 0, c = ri(r, 1, 9), d = ri(r, 0, 9), u = ri(r, 0, 9);
  const n = m * 1000 + c * 100 + d * 10 + u;
  const parts = [thousands ? `${m} millier${m > 1 ? "s" : ""}` : "", `${c} centaine${c > 1 ? "s" : ""}`, d ? `${d} dizaine${d > 1 ? "s" : ""}` : "", u ? `${u} unité${u > 1 ? "s" : ""}` : ""].filter(Boolean);
  return num(`Quel nombre se cache dans ${parts.join(" + ")} ?`, String(n), `${thousands ? `${m} × 1 000 + ` : ""}${c} × 100 + ${d} × 10 + ${u} = ${fmt(n)}.`);
};
const between: G = (r) => {
  const a = ri(r, 200, 900);
  const b = a + ri(r, 3, 6);
  const ok = Array.from({ length: b - a - 1 }, (_, i) => String(a + 1 + i));
  return num(`Écris un nombre naturel qui convient : ${a} < … < ${b}`, ok, `Tous les nombres entre ${a} et ${b} conviennent : ${ok.join(", ")}.`);
};
const digitsForm: G = (r) => {
  const ds = shuffled(r, [1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3);
  const big = Number([...ds].sort((a, b) => b - a).join("")), small = Number([...ds].sort((a, b) => a - b).join(""));
  const askBig = r() < 0.5;
  return num(`Avec les chiffres ${ds.join(", ")} (chacun une seule fois), écris le plus ${askBig ? "grand" : "petit"} nombre possible.`, String(askBig ? big : small), `Pour le plus ${askBig ? "grand" : "petit"}, on place les chiffres du ${askBig ? "plus grand au plus petit" : "plus petit au plus grand"} : ${askBig ? big : small}.`);
};
const doubleHalf: G = (r) => {
  const dbl = r() < 0.5;
  const n = dbl ? ri(r, 12, 480) : ri(r, 6, 250) * 2;
  return num(dbl ? `Le double de ${n} est…` : `La moitié de ${n} est…`, String(dbl ? n * 2 : n / 2), dbl ? `Double = ×2 : ${n} × 2 = ${n * 2}.` : `Moitié = ÷2 : ${n} : 2 = ${n / 2}.`);
};
const round = (to: 10 | 100 | 1000): G => (r) => {
  const n = ri(r, to === 1000 ? 12000 : 1000, to === 1000 ? 98999 : 9899);
  const res = Math.round(n / to) * to;
  const name = to === 10 ? "la dizaine" : to === 100 ? "la centaine" : "le millier";
  return num(`Arrondis ${fmt(n)} à ${name} la plus proche.`, [String(res)], `On regarde le chiffre juste à droite : s'il est 5 ou plus, on arrondit vers le haut. ${fmt(n)} ≈ ${fmt(res)}.`);
};
const calcMove: G = (r) => {
  let n = ri(r, 300, 700);
  const steps: string[] = [];
  const start = n;
  const units: [string, number][] = [["unités", 1], ["dizaines", 10], ["centaines", 100]];
  for (let i = 0; i < 3; i++) {
    const [name, v] = pick(r, units);
    const k = ri(r, 1, 5);
    const plus = i === 0 ? true : r() < 0.5;
    n += (plus ? 1 : -1) * k * v;
    steps.push(`${plus ? "+" : "−"} ${k} ${k > 1 || name === "unités" ? name : name.replace(/s$/, "")}`);
  }
  return num(`Avec la calculatrice du mage, pars de ${start} et fais : ${steps.join(", ")}. Quel nombre s'affiche à la fin ?`, String(n), `Une dizaine = 10, une centaine = 100. On enchaîne les étapes : on arrive à ${n}.`);
};
const opFind: G = (r) => {
  const a = ri(r, 120, 800);
  const k = pick(r, [10, 20, 30, 35, 100, 200, 27, 45]);
  const plus = r() < 0.5;
  const b = plus ? a + k : a - k;
  const ok = `${plus ? "+" : "−"} ${k}`;
  return mcq(`Le compteur affiche ${a}. Après une opération, il affiche ${b}. Quelle opération as-tu faite ?`, ok, [`${plus ? "−" : "+"} ${k}`, `${plus ? "+" : "−"} ${k + 10}`, `${plus ? "+" : "−"} ${Math.max(1, k - 5)}`], `De ${a} à ${b}, l'écart est ${k}. Comme ${plus ? "le nombre augmente" : "le nombre diminue"}, c'est ${ok}.`);
};

// ---------- Calcul ----------
const table = (tables: number[]): G => (r) => {
  const a = pick(r, tables), b = ri(r, 2, 10);
  const form = ri(r, 0, 2);
  if (form === 0) return num(`${a} × ${b} = ?`, String(a * b), `${a} × ${b} = ${a * b}. Astuce : ${b} × ${a} donne le même résultat.`);
  if (form === 1) return num(`… × ${a} = ${a * b}`, String(b), `On cherche combien de fois ${a} dans ${a * b} : ${b} × ${a} = ${a * b}.`);
  return num(`${a * b} : ${a} = ?`, String(b), `La division est l'inverse de la multiplication : ${a} × ${b} = ${a * b}, donc ${a * b} : ${a} = ${b}.`);
};
const tableMat = (tables: number[]): G => (r) => {
  const prods = new Map<number, string>();
  let guard = 0;
  while (prods.size < 4 && guard++ < 50) {
    const a = pick(r, tables), b = ri(r, 3, 10);
    if (!prods.has(a * b)) prods.set(a * b, `${a} × ${b}`);
  }
  const pairs = [...prods.entries()].map(([p, t]) => [t, String(p)] as [string, string]);
  return mat(`Relie chaque multiplication à son résultat : ${pairs.map(([t]) => t).join(" ; ")}.`, pairs, "Les tables se retiennent en les récitant : " + pairs.map(([t, p]) => `${t} = ${p}`).join(" ; ") + ".");
};
const tableTF: G = (r) => {
  const a = ri(r, 3, 9), b = ri(r, 3, 9);
  const real = a * b;
  const good = r() < 0.5;
  const shown = good ? real : real + pick(r, [-a, a, -1, 1, b, -b]);
  return tf(`Vrai ou faux : ${a} × ${b} = ${shown}`, shown === real, `${a} × ${b} = ${real}. ${shown === real ? "C'est exact !" : `Donc ${shown} est faux.`}`);
};
const holeAdd: G = (r) => {
  const a = ri(r, 11, 60), s = a + ri(r, 5, 40);
  return num(`Complète l'addition à trou : ${a} + … = ${s}`, String(s - a), `${s} − ${a} = ${s - a}. Vérification : ${a} + ${s - a} = ${s}.`);
};
const complement: G = (r) => {
  const b = ri(r, 17, 48), a = b + ri(r, 12, 49);
  return num(`Pour calculer ${a} − ${b}, transforme la soustraction en addition à trou : ${b} + … = ${a}. Quel est le résultat de ${a} − ${b} ?`, String(a - b), `${b} + ${a - b} = ${a}, donc ${a} − ${b} = ${a - b}.`);
};
const addW = (da: number, db: number): G => (r) => {
  const a = ri(r, 10 ** (da - 1) + 120, 10 ** da - 1);
  const b = ri(r, 10 ** (db - 1), 10 ** db - 1);
  return num(`${fmt(a)} + ${fmt(b)} = ?`, String(a + b), `En colonnes : on additionne unités, dizaines, centaines… sans oublier les retenues. ${fmt(a)} + ${fmt(b)} = ${fmt(a + b)}.`);
};
const subW = (da: number, db: number): G => (r) => {
  const b = ri(r, 10 ** (db - 1), 10 ** db - 1);
  const a = ri(r, Math.max(10 ** (da - 1), b + 20), 10 ** da - 1);
  return num(`${fmt(a)} − ${fmt(b)} = ?`, String(a - b), `Vérifie avec l'addition : ${fmt(a - b)} + ${fmt(b)} = ${fmt(a)}. Le résultat est ${fmt(a - b)}.`);
};
const missingDigit: G = (r) => {
  const a = ri(r, 200, 899), b = ri(r, 21, 98), s = a + b;
  const digits = String(a).split("");
  const pos = ri(r, 0, 2);
  const hidden = digits[pos];
  digits[pos] = "▢";
  return num(`Quel chiffre cache la case ▢ ?   ${digits.join("")} + ${b} = ${s}`, hidden, `On calcule ${s} − ${b} = ${a}. Le chiffre caché est donc ${hidden}.`);
};
const mulW = (digits: number, mults: number[]): G => (r) => {
  const a = digits === 2 ? ri(r, 12, 99) : ri(r, 102, 499);
  const m = pick(r, mults);
  const tens = Math.floor(a / 10) * 10, u = a % 10;
  const ex = digits === 2 ? `${a} = ${tens} + ${u} ; ${tens} × ${m} = ${tens * m} et ${u} × ${m} = ${u * m} ; ${tens * m} + ${u * m} = ${a * m}.` : `On décompose ${a} en centaines, dizaines, unités, on multiplie chaque partie par ${m}, puis on additionne : ${a * m}.`;
  return num(`${a} × ${m} = ?`, String(a * m), ex);
};
const mulDecomp: G = (r) => {
  const a = ri(r, 21, 79), m = ri(r, 3, 9);
  const t = Math.floor(a / 10) * 10, u = a % 10;
  return num(`Décompose pour calculer : ${a} × ${m} = (${t} × ${m}) + (${u} × ${m}) = … + … = ?`, String(a * m), `${t} × ${m} = ${t * m} et ${u} × ${m} = ${u * m}. ${t * m} + ${u * m} = ${a * m}.`);
};
const mulChoice: G = (r) => {
  const a = ri(r, 24, 98), m = ri(r, 3, 8);
  const p = a * m;
  const ko = [p - 10, p + 10, p - 1].filter((x) => x !== p).map(fmt);
  return mcq(`Calcule, puis choisis le bon résultat : ${a} × ${m}`, fmt(p), ko, `${a} × ${m} = ${fmt(p)}. Attention aux retenues : c'est là qu'on se trompe le plus !`);
};
const mulTen = (mults: number[]): G => (r) => {
  const a = ri(r, 2, 19), m = pick(r, mults);
  const first = (a * m) / 10;
  return num(`${a} × ${m} = ?`, String(a * m), `${m} = ${m / 10} × 10. Donc ${a} × ${m / 10} = ${first}, puis × 10 = ${a * m}. (Pour × 10, on ajoute un zéro.)`);
};
const mulTwo: G = (r) => {
  const a = ri(r, 12, 29), b = ri(r, 11, 19);
  return num(`${a} × ${b} = ?`, String(a * b), `${a} × ${b} = ${a} × 10 + ${a} × ${b - 10} = ${a * 10} + ${a * (b - 10)} = ${a * b}.`);
};
const divEuclid: G = (r) => {
  const d = ri(r, 3, 9), q = ri(r, 6, 25), rem = ri(r, 1, d - 1);
  const a = d * q + rem;
  return mcq(`Effectue la division : ${a} : ${d}`, `${q} reste ${rem}`, [`${q} reste ${rem + 1 >= d ? rem - 1 : rem + 1}`, `${q + 1} reste ${rem}`, `${q - 1} reste ${rem}`], `${d} × ${q} = ${d * q}, et ${a} − ${d * q} = ${rem}. Le reste doit être plus petit que ${d}.`);
};
const calcOrder: G = (r) => {
  const a = ri(r, 2, 9), b = ri(r, 2, 9), c = ri(r, 2, 9);
  return num(`Calcule en respectant les priorités : ${a} + ${b} × ${c}`, String(a + b * c), `La multiplication passe avant l'addition : ${b} × ${c} = ${b * c}, puis ${a} + ${b * c} = ${a + b * c}.`);
};

// ---------- Problèmes ----------
const money = (n: number) => euro(n);
const P = {
  add: ((r) => {
    const [n] = pick(r, THINGS), who = pick(r, NAMES), a = ri(r, 24, 190), b = ri(r, 20, 150);
    return num(`${who} récolte ${a} ${n} le matin et ${b} l'après-midi. Combien en a-${she(who) === "elle" ? "t-elle" : "t-il"} en tout ?`, String(a + b), `Total : ${a} + ${b} = ${a + b}.`);
  }) as G,
  sub: ((r) => {
    const [n] = pick(r, THINGS), who = pick(r, NAMES), a = ri(r, 60, 240), b = ri(r, 15, 59);
    return num(`${who} possède ${a} ${n}. ${she(who) === "elle" ? "Elle" : "Il"} en perd ${b} dans la tempête. Combien lui en reste-t-il ?`, String(a - b), `Il en reste : ${a} − ${b} = ${a - b}.`);
  }) as G,
  mul: ((r) => {
    const [n] = pick(r, THINGS), k = ri(r, 3, 9), m = ri(r, 4, 12);
    return num(`Un coffre contient ${m} ${n}. Le roi ouvre ${k} coffres. Combien de ${n} y a-t-il ?`, String(k * m), `${k} × ${m} = ${k * m}.`);
  }) as G,
  div: ((r) => {
    const k = ri(r, 3, 8), q = ri(r, 4, 12), who = pick(r, NAMES);
    return num(`${who} partage équitablement ${k * q} billes de cristal entre ${k} lutins. Combien chaque lutin en reçoit-il ?`, String(q), `${k * q} : ${k} = ${q}, car ${k} × ${q} = ${k * q}.`);
  }) as G,
  age: ((r) => {
    const a = ri(r, 35, 70), d = ri(r, 8, 24);
    return num(`Le magicien Anselme a ${a} ans. Sa sœur Mélusine a ${d} ans de moins que lui. Quel est l'âge de Mélusine ?`, String(a - d), `« De moins » : on soustrait. ${a} − ${d} = ${a - d} ans.`);
  }) as G,
  diff: ((r) => {
    const a = ri(r, 9, 17), b = a + ri(r, 2, 9);
    return num(`Léa a ${a} ans et Mila en a ${b}. Quelle est leur différence d'âge ?`, String(b - a), `On cherche l'écart : ${b} − ${a} = ${b - a} ans.`);
  }) as G,
  reverse: ((r) => {
    const who = pick(r, NAMES), g = ri(r, 25, 70), after = ri(r, 120, 260);
    return num(`${who} collectionne des cartes. On lui en offre ${g} pour son anniversaire et ${she(who)} en a alors ${after}. Combien en avait-${she(who) === "elle" ? "elle" : "il"} avant son anniversaire ?`, String(after - g), `Avant + ${g} = ${after}, donc avant = ${after} − ${g} = ${after - g}.`);
  }) as G,
  rest: ((r) => {
    const k = ri(r, 2, 4), each = ri(r, 3, 6), tot = k * each + ri(r, 0, k - 1);
    return num(`La professeure a ${tot} gommes. Elle en distribue ${each} à chacun des ${k} élèves. Combien de gommes lui reste-t-il ?`, String(tot - k * each), `${k} × ${each} = ${k * each} gommes distribuées. ${tot} − ${k * each} = ${tot - k * each}.`);
  }) as G,
  change: ((r) => {
    const k = ri(r, 2, 4), p = ri(r, 6, 14);
    return num(`Elfie achète ${k} potions à ${money(p)} chacune et paie avec un billet de 100 €. Combien la marchande lui rend-elle (en €) ?`, [String(100 - k * p)], `${k} × ${p} = ${k * p} €. On rend : 100 − ${k * p} = ${100 - k * p} €.`, "€");
  }) as G,
  afford: ((r) => {
    const a = ri(r, 3, 7), b = ri(r, 2, 4), c = ri(r, 1, 3), d = ri(r, 3, 6);
    const total = a * 2 + b * 5 + c * 10 + d;
    const price = total + pick(r, [-6, -4, 3, 5, 8]);
    return tf(`Les enfants comptent leurs économies : ${a} pièces de 2 €, ${b} billets de 5 €, ${c} billet${c > 1 ? "s" : ""} de 10 € et ${d} pièces de 1 €. Vrai ou faux : ils peuvent offrir à leur maman un chapeau à ${price} €.`, total >= price, `${a} × 2 + ${b} × 5 + ${c} × 10 + ${d} × 1 = ${total} €. ${total >= price ? `${total} € ≥ ${price} € : ils peuvent l'acheter.` : `${total} € < ${price} € : il leur manque ${price - total} €.`}`);
  }) as G,
  hours: ((r) => {
    const h = ri(r, 3, 8), d = ri(r, 4, 6);
    return num(`La gardienne du phare travaille ${h} heures par jour pendant ${d} jours. Combien d'heures travaille-t-elle en tout ?`, String(h * d), `${h} × ${d} = ${h * d} heures.`, "heures");
  }) as G,
  shopping: ((r) => {
    const a = ri(r, 2, 3), pa = ri(r, 18, 35), b = ri(r, 2, 4), pb = ri(r, 8, 15), c = ri(r, 2, 6);
    const total = a * pa + b * pb + c;
    return num(`Madame Caba va au marché avec 150 €. Elle achète ${a} capes à ${pa} € chacune, ${b} livres à ${pb} € chacun et une plume à ${c} €. Combien lui reste-t-il (en €) ?`, [String(150 - total)], `Capes : ${a} × ${pa} = ${a * pa} €. Livres : ${b} × ${pb} = ${b * pb} €. Dépense : ${a * pa} + ${b * pb} + ${c} = ${total} €. Reste : 150 − ${total} = ${150 - total} €.`, "€");
  }) as G,
  yoghurt: ((r) => {
    const t = ri(r, 4, 6), e = ri(r, 6, 9), p = ri(r, 3, 5), per = ri(r, 10, 12);
    const kids = t * e, yog = p * per;
    return tf(`Au réfectoire du château, il y a ${t} tables de ${e} enfants. Le cuisinier a acheté ${p} paquets de ${per} yaourts. Vrai ou faux : il y a un yaourt pour chaque enfant.`, yog >= kids, `${t} × ${e} = ${kids} enfants et ${p} × ${per} = ${yog} yaourts. ${yog >= kids ? "Il y en a assez." : `Il manque ${kids - yog} yaourts.`}`);
  }) as G,
  train: ((r) => {
    const a = ri(r, 60, 95), d = ri(r, 12, 30), u = ri(r, 10, 25);
    return num(`${a} voyageurs sont installés dans un wagon de dragon-volant. Au premier arrêt, ${d} descendent et ${u} montent. Combien y a-t-il de voyageurs quand le dragon repart ?`, String(a - d + u), `${a} − ${d} = ${a - d}, puis ${a - d} + ${u} = ${a - d + u}.`);
  }) as G,
  pairs: ((r) => {
    const k = ri(r, 3, 6), m = ri(r, 5, 12), x = ri(r, 3, 9);
    return num(`Une boîte de crayons magiques coûte ${m} €. Un album coûte ${x} €. Nina achète ${k} boîtes et ${k + 2} albums. Combien dépense-t-elle (en €) ?`, [String(k * m + (k + 2) * x)], `${k} × ${m} = ${k * m} € et ${k + 2} × ${x} = ${(k + 2) * x} €. Total : ${k * m + (k + 2) * x} €.`, "€");
  }) as G,
  boxes: ((r) => {
    const per = ri(r, 4, 6), want = per * ri(r, 6, 12);
    return num(`Dans une école, ${want} élèves doivent recevoir un cahier. Les cahiers sont vendus par paquets de ${per}. Combien de paquets faut-il acheter ?`, String(want / per), `${want} : ${per} = ${want / per} paquets.`);
  }) as G,
};

// ---------- Fractions et décimaux (P5) ----------
const fracOf: G = (r) => {
  const den = pick(r, [2, 3, 4, 5, 10]), k = ri(r, 3, 12) * den;
  const name = ({ 2: "la moitié", 3: "le tiers", 4: "le quart", 5: "le cinquième", 10: "le dixième" } as Record<number, string>)[den];
  return num(`Quel est ${name} de ${k} ?`, String(k / den), `${name} de ${k}, c'est ${k} : ${den} = ${k / den}.`);
};
const fracName: G = (r) => {
  const den = pick(r, [4, 5, 6, 8, 10]), k = ri(r, 2, den - 1);
  return mcq(`Un gâteau de fée est coupé en ${den} parts égales. Yanis en mange ${k}. Quelle fraction du gâteau a-t-il mangée ?`, `${k}/${den}`, [`${den}/${k}`, `${den - k}/${den}`, `${k}/${den + 1}`].filter((x) => x !== `${k}/${den}`), `Le dénominateur (${den}) dit en combien de parts on partage ; le numérateur (${k}) dit combien on en prend : ${k}/${den}.`);
};
const fracCompare: G = (r) => {
  const ds = shuffled(r, [2, 3, 4, 5, 6, 8, 10]).slice(0, 4);
  const max = Math.min(...ds);
  return mcq(`Quelle fraction est la plus grande ? ${ds.map((d) => `1/${d}`).join(" ; ")}`, `1/${max}`, ds.filter((d) => d !== max).map((d) => `1/${d}`), `Plus on partage en peu de parts, plus chaque part est grande. 1/${max} est la plus grande.`);
};
const decCompare: G = (r) => {
  const a = ri(r, 11, 49) / 10, b = Math.round((a + pick(r, [-0.15, 0.05, 0.25, -0.05, 0.1])) * 100) / 100;
  const f = (x: number) => String(x).replace(".", ",");
  const sign = a < b ? "<" : a > b ? ">" : "=";
  return mcq(`Choisis le bon signe : ${f(a)} … ${f(b)}`, sign, ["<", ">", "="].filter((s) => s !== sign), `On compare d'abord la partie entière, puis les dixièmes, puis les centièmes : ${f(a)} ${sign} ${f(b)}.`);
};
const decMoney: G = (r) => {
  const a = ri(r, 105, 499) / 100, b = ri(r, 55, 349) / 100;
  const f = (x: number) => x.toFixed(2).replace(".", ",");
  return num(`Un parchemin coûte ${f(a)} € et une plume ${f(b)} €. Combien paie-t-on pour les deux (en €) ?`, [f(a + b), f(a + b).replace(/,?0$/, "")], `${f(a)} + ${f(b)} = ${f(a + b)} €. On aligne les virgules avant d'additionner.`, "€");
};
const fracEquiv: G = (r) => {
  const n = ri(r, 1, 3), d = pick(r, [4, 5, 6]), m = pick(r, [2, 3]);
  return num(`Complète l'égalité de fractions : ${n}/${d} = …/${d * m}`, String(n * m), `On multiplie le dénominateur par ${m} (${d} × ${m} = ${d * m}), donc on multiplie aussi le numérateur : ${n} × ${m} = ${n * m}.`);
};

const decStr = (x: number, d = 2) => x.toFixed(d).replace(/,?0+$/, (m) => (m.startsWith(",") ? "" : m)).replace(".", ",");
const decWrite: G = (r) => {
  const k = ri(r, 0, 2);
  if (k === 0) {
    const u = ri(r, 2, 19), d = ri(r, 1, 9);
    return num(`Écris en chiffres : ${u} unités et ${d} dixièmes.`, [`${u},${d}`, `${u}.${d}`], `${d} dixièmes = 0,${d}. Donc ${u} unités et ${d} dixièmes s'écrit ${u},${d}.`);
  }
  if (k === 1) {
    const u = ri(r, 1, 9), c = ri(r, 11, 99);
    return num(`Écris en chiffres : ${u} unités et ${c} centièmes.`, [`${u},${String(c).padStart(2, "0")}`, `${u}.${String(c).padStart(2, "0")}`], `${c} centièmes = 0,${String(c).padStart(2, "0")}. On obtient ${u},${String(c).padStart(2, "0")}.`);
  }
  const n = ri(r, 12, 98), d = ri(r, 1, 9);
  const v = `${n},${d}`;
  return mcq(`Dans ${v}, que représente le chiffre ${d} ?`, "des dixièmes", ["des centièmes", "des unités", "des dizaines"], `Le premier chiffre après la virgule est le chiffre des dixièmes : dans ${v}, ${d} dixièmes.`);
};
const decOrder: G = (r) => {
  const base = ri(r, 2, 9);
  const vals = shuffled(r, [base + 0.08, base + 0.8, base + 0.18, base + 0.008, base + 0.5, base + 0.05]).slice(0, 4);
  const asc = [...vals].sort((a, b) => a - b);
  const f = (x: number) => String(x).replace(".", ",");
  return ord(`Range dans l'ordre croissant : ${shuffled(r, asc).map(f).join(" ; ")}.`, asc.map(f), `On compare les unités, puis les dixièmes, puis les centièmes… : ${asc.map(f).join(" < ")}.`);
};
void decStr;

// ---------- Suites et logique ----------
const seqArith: G = (r) => {
  const a = ri(r, 3, 40), step = pick(r, [4, 6, 7, 9, 11, 12, 15]);
  const seq = [0, 1, 2, 3, 4].map((i) => a + i * step);
  return num(`Trouve la règle et continue la suite des runes : ${seq.join(", ")}, …`, String(a + 5 * step), `La règle : on ajoute ${step} à chaque fois. ${seq[4]} + ${step} = ${a + 5 * step}.`);
};
const seqGeo: G = (r) => {
  const a = ri(r, 2, 6), m = pick(r, [2, 3]);
  const seq = [0, 1, 2, 3].map((i) => a * m ** i);
  return num(`Continue la suite magique : ${seq.join(", ")}, …`, String(a * m ** 4), `Chaque nombre est multiplié par ${m} : ${seq[3]} × ${m} = ${a * m ** 4}.`);
};
const missingOp: G = (r) => {
  const a = ri(r, 3, 9), b = ri(r, 3, 9);
  const ops = [["+", a + b], ["×", a * b], ["−", a + b + 5 > a ? a + b + 5 : 0]] as [string, number][];
  const [sym, res] = pick(r, [["+", a + b], ["×", a * b]] as [string, number][]);
  void ops;
  return mcq(`Quelle opération manque ? ${a} … ${b} = ${res}`, sym, ["+", "×", "−"].filter((s) => s !== sym), `${a} ${sym} ${b} = ${res}. On teste chaque signe avec les deux nombres.`);
};
const logicOrder: G = (r) => {
  const [x, y, z] = shuffled(r, ["Ali", "Ben", "Cléo", "Dina", "Eli", "Fay"]).slice(0, 3);
  return mcq(`Dans la file du château, ${x} est plus grand que ${y}. ${y} est plus grand que ${z}. Qui est le plus petit ?`, z, [x, y, "On ne peut pas savoir"], `${x} > ${y} > ${z}. Le plus petit est ${z}.`);
};

// ---------- Programme des 10 niveaux ----------
export const MA_SPEC: Record<number, { title: string; intro: string; gens: G[] }> = {
  1: { title: "Les nombres jusqu'à 999", intro: "Lire, écrire, comparer et ranger les nombres.", gens: [wordsToDigits(100, 999), digitsToWords(100, 999), compare(100, 999), order(5, 100, 999), skip(10), place(3)] },
  2: { title: "Le sortilège des petites tables", intro: "Tables de 2, 3, 4 et 5 ; doubles et moitiés.", gens: [table([2, 3, 4, 5]), table([2, 3, 4, 5]), tableMat([2, 3, 4, 5]), doubleHalf, tableTF, skip(5)] },
  3: { title: "Les grandes tables et les compléments", intro: "Tables de 6 à 10 et additions à trou.", gens: [table([6, 7, 8, 9]), table([6, 7, 8, 9, 10]), tableMat([6, 7, 8, 9]), holeAdd, complement, tableTF] },
  4: { title: "Additions et soustractions", intro: "Calcule avec les nombres jusqu'à 999.", gens: [addW(3, 3), subW(3, 2), addW(3, 2), missingDigit, calcMove, opFind] },
  5: { title: "La multiplication en colonnes", intro: "Multiplie un nombre de 2 ou 3 chiffres par un chiffre.", gens: [mulW(2, [2, 3, 4, 5]), mulW(3, [2, 3, 4]), mulTen([10, 20, 30]), mulDecomp, mulChoice, mulW(2, [6, 7, 8, 9])] },
  6: { title: "Les problèmes du royaume et les décimaux", intro: "Choisis la bonne opération ; lis et range des nombres à virgule.", gens: [P.sub, P.div, P.afford, P.change, decWrite, decOrder] },
  7: { title: "Les géants jusqu'à 100 000", intro: "P5 · Lire, comparer et arrondir de grands nombres.", gens: [wordsToDigits(1000, 99999), digitsToWords(1000, 99999), compare(10000, 99999), round(100), place(5), decompose(true)] },
  8: { title: "Le grand calcul", intro: "P5 · Multiplications et divisions plus longues.", gens: [mulTwo, mulTen([30, 40, 50, 100]), divEuclid, addW(4, 4), subW(4, 3), calcOrder] },
  9: { title: "Le festin des fractions et des décimaux", intro: "P5 · Fractions, décimaux, argent.", gens: [fracOf, fracName, fracCompare, decCompare, decMoney, fracEquiv] },
  10: { title: "Le grand défi de la reine", intro: "P5 · Problèmes à étapes et logique.", gens: [P.shopping, P.pairs, P.yoghurt, seqArith, seqGeo, missingOp] },
};
// Problèmes supplémentaires réservés à la révision et aux examens
export const MA_EXTRA: G[] = [P.add, P.mul, P.age, P.diff, P.reverse, P.rest, P.hours, P.train, P.boxes, logicOrder, between, digitsForm, numDistractorsProblem];
function numDistractorsProblem(r: Rng): Question {
  const a = ri(r, 12, 60), b = ri(r, 12, 60);
  return mcq(`Quel calcul donne le même résultat que ${a} + ${b} ?`, `${b} + ${a}`, [`${a} − ${b}`, `${a} × ${b}`, `${a} + ${b} + 1`], `L'addition est commutative : on peut changer l'ordre des nombres sans changer le résultat.`);
}
void numDistractors;

export function buildMissions(prefix: string, spec: typeof MA_SPEC): Mission[] {
  return Object.entries(spec).map(([lv, s]) => {
    const level = Number(lv);
    const r = mulberry32(hashSeed(`${prefix}-${level}`));
    return { id: `${prefix}-${level}`, title: s.title, intro: s.intro, level, qs: s.gens.map((g) => fresh(() => g(r))) } satisfies Mission;
  });
}
export const MISSIONS: Mission[] = buildMissions("ma", MA_SPEC);

/** Questions de maths pour un examen blanc (graine propre, nombres nouveaux). */
export function mathExam(levels: number[], seed: string, perLevel: number): Question[] {
  const r = mulberry32(hashSeed(seed));
  const out: Question[] = [];
  for (const lv of levels) {
    const pool = shuffled(r, [...MA_SPEC[lv].gens, ...(lv >= 6 ? MA_EXTRA : [])]);
    for (const g of pool.slice(0, perLevel)) out.push(fresh(() => g(r)));
  }
  return out;
}
