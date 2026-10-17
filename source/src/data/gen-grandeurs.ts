// Le Pont des Horloges : grandeurs, mesures et géométrie. Réponses calculées, jamais saisies à la main.
import type { Mission, Question } from "./kit";
import { mcq, tf, num, ord, mat } from "./kit";
import { fmt, hashSeed, mulberry32, pick, ri, shuffled, fresh, type Rng } from "./gen-core";
import { buildMissions, type G } from "./gen-maths";

const hh = (h: number, m: number) => `${h} h${m ? ` ${String(m).padStart(2, "0")}` : ""}`;
const hhAlt = (h: number, m: number) => `${h}:${String(m).padStart(2, "0")}`;
const dec = (x: number) => String(x).replace(".", ",");

// ---------- Heures et durées ----------
const clockRead = (step: 15 | 5): G => (r) => {
  const h = ri(r, 1, 12), m = ri(r, 0, 60 / step - 1) * step;
  const label = hh(h, m);
  const ko = new Set<string>();
  while (ko.size < 3) {
    const h2 = ri(r, 1, 12), m2 = ri(r, 0, 60 / step - 1) * step;
    if (hh(h2, m2) !== label) ko.add(hh(h2, m2));
  }
  return { ...mcq("Quelle heure indique l'horloge du pont ?", label, [...ko], `Petite aiguille sur ${h}, grande aiguille sur ${m / 5} : il est ${label}.`), vis: { t: "clock", h, m } };
};
const clockWriteQ: G = (r) => {
  const h = ri(r, 1, 12), m = pick(r, [0, 15, 30, 45]);
  return clockWriteCore(r, h, m);
};
const clockWrite: G = (r) => clockWriteCore(r, ri(r, 1, 12), pick(r, [0, 15, 30, 45, 5, 10, 20, 25, 35, 40, 50, 55]));
function clockWriteCore(_r: Rng, h: number, m: number): Question {
  return { ...num("Écris l'heure indiquée (exemple : 3 h 15).", [hh(h, m), hhAlt(h, m), `${h}h${m ? String(m).padStart(2, "0") : ""}`, hh(h, m).replace(/ /g, "")], `La petite aiguille montre l'heure (${h}), la grande les minutes (${m}) : ${hh(h, m)}.`), vis: { t: "clock", h, m } };
}
const duration: G = (r) => {
  const h1 = ri(r, 7, 14), m1 = pick(r, [0, 15, 30, 45]);
  const dm = pick(r, [45, 75, 90, 105, 120, 135, 150]);
  const total = h1 * 60 + m1 + dm;
  const h2 = Math.floor(total / 60), m2 = total % 60;
  return num(`Le spectacle des dragons commence à ${hh(h1, m1)} et finit à ${hh(h2, m2)}. Combien de minutes dure-t-il ?`, [String(dm)], `De ${hh(h1, m1)} à ${hh(h2, m2)} : ${Math.floor(dm / 60)} h ${dm % 60} min, soit ${dm} minutes.`, "min");
};
const endTime: G = (r) => {
  const h1 = ri(r, 8, 15), m1 = pick(r, [0, 15, 30, 45]);
  const dm = pick(r, [30, 45, 50, 75, 90]);
  const total = h1 * 60 + m1 + dm;
  const h2 = Math.floor(total / 60), m2 = total % 60;
  return num(`Le cours de magie commence à ${hh(h1, m1)} et dure ${dm} minutes. À quelle heure finit-il ? (exemple : 10 h 45)`, [hh(h2, m2), hhAlt(h2, m2), hh(h2, m2).replace(/ /g, "")], `${hh(h1, m1)} + ${dm} min = ${hh(h2, m2)}.`);
};
const openHours: G = (r) => {
  const h1 = ri(r, 8, 10), m1 = pick(r, [0, 30]);
  const h2 = ri(r, 16, 18), m2 = pick(r, [0, 30]);
  const mins = h2 * 60 + m2 - (h1 * 60 + m1);
  const ok = `${Math.floor(mins / 60)} h${mins % 60 ? ` ${mins % 60}` : ""}`;
  return num(`La bibliothèque ouvre à ${hh(h1, m1)} et ferme à ${hh(h2, m2)}. Quelle est la durée d'ouverture ? (exemple : 7 h 30)`, [ok, ok.replace(/ /g, ""), `${Math.floor(mins / 60)} heures${mins % 60 ? ` ${mins % 60}` : ""}`], `De ${hh(h1, m1)} à ${hh(h2, m2)} : ${Math.floor(mins / 60)} h ${mins % 60} min.`);
};
const timeConv: G = (r) => {
  const k = ri(r, 0, 3);
  if (k === 0) { const h = ri(r, 2, 6); return num(`${h} heures = … minutes`, String(h * 60), `1 h = 60 min, donc ${h} × 60 = ${h * 60} min.`, "min"); }
  if (k === 1) { const m = ri(r, 2, 9); return num(`${m} minutes = … secondes`, String(m * 60), `1 min = 60 s, donc ${m} × 60 = ${m * 60} s.`, "s"); }
  if (k === 2) { const d = ri(r, 2, 6); return num(`${d} jours = … heures`, String(d * 24), `1 jour = 24 h, donc ${d} × 24 = ${d * 24} h.`, "h"); }
  const w = ri(r, 2, 5); return num(`${w} semaines = … jours`, String(w * 7), `1 semaine = 7 jours, donc ${w} × 7 = ${w * 7} jours.`, "jours");
};
const timeCompare: G = (r) => {
  const m = ri(r, 70, 170);
  const hours = Math.round(m / 6) / 10;
  void hours;
  const h = ri(r, 1, 3), mm = ri(r, 10, 50);
  const total = h * 60 + mm;
  const other = total + pick(r, [-10, 10, 20, -20]);
  const sign = total < other ? "<" : total > other ? ">" : "=";
  return mcq(`Compare : ${h} h ${mm} min … ${other} min`, sign, ["<", ">", "="].filter((s) => s !== sign), `${h} h ${mm} min = ${total} min. Et ${total} ${sign} ${other}.`);
};

// ---------- Monnaie ----------
const eur = (c: number) => (c % 100 === 0 ? `${c / 100} €` : `${(c / 100).toFixed(2).replace(".", ",")} €`);
const coins: G = (r) => {
  const picks = [[2, 200], [1, 100], [0.5, 50], [0.2, 20], [0.1, 10]] as const;
  const parts: string[] = [];
  let total = 0;
  for (const [, c] of shuffled(r, [...picks]).slice(0, 3)) {
    const n = ri(r, 1, 3);
    total += n * c;
    parts.push(`${n} pièce${n > 1 ? "s" : ""} de ${eur(c)}`);
  }
  return num(`Dans sa bourse, Soumaya a ${parts.join(", ")}. Quelle somme possède-t-elle en tout (en €) ?`, [dec(total / 100), (total / 100).toFixed(2).replace(".", ",")], `On additionne : ${parts.join(" + ")} = ${eur(total)}.`, "€");
};
const rendu: G = (r) => {
  const price = ri(r, 105, 890) / 100;
  const pay = pick(r, [10, 20, 50]);
  const back = Math.round((pay - price) * 100) / 100;
  return num(`Un livre de contes coûte ${dec(price.toFixed(2) as unknown as number)} €. Tu paies avec ${pay} €. Combien la libraire te rend-elle (en €) ?`, [back.toFixed(2).replace(".", ","), String(back).replace(".", ",")], `${pay} − ${dec(price.toFixed(2) as unknown as number)} = ${back.toFixed(2).replace(".", ",")} €. On peut compter à partir du prix jusqu'à ${pay} €.`, "€");
};
const promo: G = (r) => {
  const p = pick(r, [20, 30, 40, 50, 60, 80]) , k = pick(r, [3, 4, 5]);
  return num(`Un ruban magique coûte ${p} € le mètre. Combien coûtent ${k} mètres (en €) ?`, [String(p * k)], `${k} × ${p} = ${p * k} €.`, "€");
};

// ---------- Longueurs, masses, capacités ----------
const unitsL = ["km", "hm", "dam", "m", "dm", "cm", "mm"] as const;
const lenConv: G = (r) => {
  const pairs: [string, string, number][] = [["m", "cm", 100], ["cm", "mm", 10], ["km", "m", 1000], ["m", "dm", 10], ["dam", "m", 10], ["hm", "m", 100]];
  const [a, b, f] = pick(r, pairs);
  const n = ri(r, 2, 9);
  return num(`${n} ${a} = … ${b}`, String(n * f), `Chaque case vers la droite dans le tableau km–hm–dam–m–dm–cm–mm multiplie par 10. De ${a} à ${b} : × ${f}. ${n} × ${f} = ${n * f}.`, b);
};
const lenConvBack: G = (r) => {
  const pairs: [string, string, number][] = [["cm", "m", 100], ["mm", "cm", 10], ["m", "km", 1000]];
  const [a, b, f] = pick(r, pairs);
  const n = ri(r, 2, 9);
  return num(`${n * f} ${a} = … ${b}`, String(n), `On passe vers la gauche : ÷ ${f}. ${n * f} : ${f} = ${n}.`, b);
};
const lenMixed: G = (r) => {
  const m = ri(r, 1, 6), cm = ri(r, 10, 95);
  return num(`${m} m et ${cm} cm = … cm`, String(m * 100 + cm), `${m} m = ${m * 100} cm, puis ${m * 100} + ${cm} = ${m * 100 + cm} cm.`, "cm");
};
const lenSplit: G = (r) => {
  const t = ri(r, 130, 880);
  return num(`${t} cm = … m et … cm (écris : 3 m 75 cm)`, [`${Math.floor(t / 100)} m ${t % 100} cm`, `${Math.floor(t / 100)}m${t % 100}cm`, `${Math.floor(t / 100)} m et ${t % 100} cm`], `${t} cm : on cherche les centaines (les mètres) : ${Math.floor(t / 100)} m, et il reste ${t % 100} cm.`);
};
const lenCompare: G = (r) => {
  const m = ri(r, 1, 5), cm = ri(r, 5, 18) * 10 + pick(r, [-20, 0, 20, -10]);
  const sign = m * 100 < cm ? "<" : m * 100 > cm ? ">" : "=";
  return mcq(`Compare : ${m} m … ${cm} cm`, sign, ["<", ">", "="].filter((s) => s !== sign), `Convertis en cm : ${m} m = ${m * 100} cm. On compare ${m * 100} et ${cm} : ${m * 100} ${sign} ${cm}.`);
};
const lenOrder: G = (r) => {
  const vals = [ri(r, 60, 99), ri(r, 100, 130), ri(r, 135, 190), pick(r, [100, 200])];
  const set = [...new Set(vals)];
  if (set.length < 4) set.push(210);
  const items = shuffled(r, set).slice(0, 4).map((cm) => (cm % 100 === 0 ? { cm, t: `${cm / 100} m` } : { cm, t: `${cm} cm` }));
  const asc = [...items].sort((a, b) => a.cm - b.cm);
  return ord(`Range ces longueurs de la plus petite à la plus grande : ${items.map((i) => i.t).join(" — ")}.`, asc.map((i) => i.t), `Transforme tout en centimètres : ${asc.map((i) => `${i.t} = ${i.cm} cm`).join(" ; ")}. Puis range.`);
};
const ribbon: G = (r) => {
  const tot = ri(r, 3, 6), a = ri(r, 4, 9) * 10, b = ri(r, 3, 8) * 10;
  const left = tot * 100 - a - b;
  return num(`Le ruban de la princesse mesure ${tot} m. Elle en utilise ${a} cm pour sa couronne puis ${b} cm pour un nœud. Combien de centimètres de ruban lui reste-t-il ?`, [String(left)], `${tot} m = ${tot * 100} cm. ${tot * 100} − ${a} − ${b} = ${left} cm, soit ${Math.floor(left / 100)} m ${left % 100} cm.`, "cm");
};
const massConv: G = (r) => {
  const k = ri(r, 0, 2);
  const n = ri(r, 2, 9);
  if (k === 0) return num(`${n} kg = … g`, String(n * 1000), `1 kg = 1 000 g, donc ${n} × 1 000 = ${n * 1000} g.`, "g");
  if (k === 1) return num(`${n * 1000} g = … kg`, String(n), `1 000 g = 1 kg, donc ${n * 1000} : 1 000 = ${n} kg.`, "kg");
  return num(`${n} kg et ${n * 50} g = … g`, String(n * 1000 + n * 50), `${n} kg = ${n * 1000} g. On ajoute ${n * 50} g : ${n * 1000 + n * 50} g.`, "g");
};
const capConv: G = (r) => {
  const k = ri(r, 0, 2);
  const n = ri(r, 2, 9);
  if (k === 0) return num(`${n} L = … cL`, String(n * 100), `1 L = 100 cL, donc ${n} × 100 = ${n * 100} cL.`, "cL");
  if (k === 1) return num(`${n} L = … mL`, String(n * 1000), `1 L = 1 000 mL, donc ${n} × 1 000 = ${n * 1000} mL.`, "mL");
  return num(`${n * 100} cL = … L`, String(n), `100 cL = 1 L, donc ${n * 100} : 100 = ${n} L.`, "L");
};
const potion: G = (r) => {
  const b = pick(r, [25, 50, 75]) , k = ri(r, 3, 8);
  const total = b * k;
  return num(`Chaque flacon contient ${b} cL de potion. La sorcière remplit ${k} flacons. Combien de litres de potion a-t-elle utilisés ? (écris un nombre, ex. 1,5)`, [dec(total / 100), String(total / 100)], `${k} × ${b} cL = ${total} cL. Comme 100 cL = 1 L, cela fait ${dec(total / 100)} L.`, "L");
};
const unitChoice: G = (r) => {
  const items: [string, string, string[]][] = [
    ["la longueur d'un crayon magique", "cm", ["km", "L", "kg"]],
    ["la distance entre deux villes du royaume", "km", ["cm", "g", "mL"]],
    ["la masse d'un œuf de dragon", "kg", ["m", "L", "km"]],
    ["la masse d'une plume", "g", ["km", "L", "m"]],
    ["le contenu d'un tonneau de potion", "L", ["cm", "g", "km"]],
    ["la contenance d'une cuillère à soupe", "mL", ["km", "kg", "m"]],
    ["la hauteur de la tour de cristal", "m", ["g", "mL", "kg"]],
  ];
  const [what, ok, ko] = pick(r, items);
  return mcq(`Quelle unité convient pour mesurer ${what} ?`, ok, ko, `On choisit l'unité de la bonne grandeur (longueur, masse ou capacité) et de la bonne taille : ici ${ok}.`);
};
const matUnits: G = (r) => {
  const all: [string, string][] = [["1 m", "100 cm"], ["1 km", "1 000 m"], ["1 kg", "1 000 g"], ["1 L", "100 cL"], ["1 cm", "10 mm"], ["1 h", "60 min"], ["1 min", "60 s"], ["1 L", "1 000 mL"]];
  const used = new Set<string>(), usedR = new Set<string>();
  const pairs: [string, string][] = [];
  for (const p of shuffled(r, all)) { if (!used.has(p[0]) && !usedR.has(p[1])) { pairs.push(p); used.add(p[0]); usedR.add(p[1]); } if (pairs.length === 4) break; }
  return mat(`Relie les équivalences : ${pairs.map((p) => p[0]).join(" ; ")}.`, pairs, pairs.map((p) => `${p[0]} = ${p[1]}`).join(" ; ") + ".");
};

// ---------- Périmètre et aire ----------
const perimRect: G = (r) => {
  const L = ri(r, 5, 18), l = ri(r, 2, L - 1);
  return num(`Un jardin rectangulaire mesure ${L} m de long et ${l} m de large. Calcule son périmètre.`, [String(2 * (L + l))], `Périmètre = 2 × (${L} + ${l}) = 2 × ${L + l} = ${2 * (L + l)} m. C'est la longueur du tour.`, "m");
};
const perimSquare: G = (r) => {
  const c = ri(r, 3, 12);
  return num(`Un carré a un côté de ${c} cm. Quel est son périmètre ?`, [String(4 * c)], `Un carré a 4 côtés égaux : 4 × ${c} = ${4 * c} cm.`, "cm");
};
const sideFromPerim: G = (r) => {
  const c = ri(r, 4, 14);
  return num(`Un carré a un périmètre de ${4 * c} cm. Quelle est la longueur d'un côté ?`, [String(c)], `4 côtés égaux : ${4 * c} : 4 = ${c} cm.`, "cm");
};
const areaRect: G = (r) => {
  const L = ri(r, 4, 14), l = ri(r, 2, 9);
  return num(`Un tapis rectangulaire mesure ${L} cm sur ${l} cm. Quelle est son aire (en cm²) ?`, [String(L * l)], `Aire du rectangle = longueur × largeur = ${L} × ${l} = ${L * l} cm².`, "cm²");
};
const areaSquare: G = (r) => {
  const c = ri(r, 3, 12);
  return num(`Un carré a un côté de ${c} cm. Quelle est son aire (en cm²) ?`, [String(c * c)], `Aire du carré = côté × côté = ${c} × ${c} = ${c * c} cm².`, "cm²");
};
const perimVsArea: G = (r) => {
  const c = ri(r, 3, 9);
  return mcq(`Un carré a un côté de ${c} cm. Que vaut son aire ?`, `${c * c} cm²`, [`${4 * c} cm²`, `${2 * c} cm²`, `${c * c} cm`], `L'aire se mesure en cm² : ${c} × ${c} = ${c * c} cm². (${4 * c} serait le périmètre, en cm.)`);
};
const fenceTF: G = (r) => {
  const L = ri(r, 6, 15), l = ri(r, 3, 8);
  const p = 2 * (L + l);
  const have = p + pick(r, [-4, -2, 2, 6]);
  return tf(`Vrai ou faux : avec ${have} m de clôture, on peut entourer entièrement un enclos rectangulaire de ${L} m sur ${l} m.`, have >= p, `Le tour mesure 2 × (${L} + ${l}) = ${p} m. ${have >= p ? `${have} m suffisent.` : `Il manque ${p - have} m.`}`);
};
const compoundPerim: G = (r) => {
  const a = ri(r, 3, 9), b = ri(r, 3, 9), c = ri(r, 3, 9);
  return num(`Un triangle a des côtés de ${a} cm, ${b} cm et ${c} cm. Quel est son périmètre ?`, [String(a + b + c)], `Le périmètre est la somme des côtés : ${a} + ${b} + ${c} = ${a + b + c} cm.`, "cm");
};
const areaGrid: G = (r) => {
  const L = ri(r, 3, 8), l = ri(r, 2, 5);
  return num(`Sur un quadrillage, un rectangle recouvre ${L} carreaux en longueur et ${l} carreaux en largeur. Combien de carreaux (unités d'aire) recouvre-t-il ?`, [String(L * l)], `${L} × ${l} = ${L * l} carreaux.`);
};
const areaTri: G = (r) => {
  const b = ri(r, 2, 8) * 2, h = ri(r, 3, 9);
  return num(`Un triangle rectangle a deux côtés perpendiculaires qui mesurent ${b} cm et ${h} cm. Son aire est la moitié de celle du rectangle ${b} cm × ${h} cm. Quelle est son aire (en cm²) ?`, [dec(b * h / 2), String(b * h / 2)], `Le rectangle a une aire de ${b} × ${h} = ${b * h} cm². Le triangle en fait la moitié : ${dec(b * h / 2)} cm².`, "cm²");
};

const frame: G = (r) => {
  const L = ri(r, 8, 15), l = ri(r, 6, 10), w = ri(r, 1, 2);
  const out = L * l, inn = (L - 2 * w) * (l - 2 * w);
  return num(`Un miroir rectangulaire de ${L} cm sur ${l} cm est entouré d'un cadre doré de ${w} cm de large. Le verre (à l'intérieur) mesure ${L - 2 * w} cm sur ${l - 2 * w} cm. Quelle est l'aire du cadre doré (en cm²) ?`, [String(out - inn)], `Aire totale : ${L} × ${l} = ${out} cm². Aire du verre : ${L - 2 * w} × ${l - 2 * w} = ${inn} cm². Cadre : ${out} − ${inn} = ${out - inn} cm².`, "cm²");
};
const paint: G = (r) => {
  const L = ri(r, 4, 9), l = ri(r, 3, 6), p = pick(r, [3, 4, 5, 6]);
  return num(`Le mur d'une salle du château mesure ${L} m sur ${l} m. La peinture coûte ${p} € par m². Combien coûte la peinture pour tout le mur (en €) ?`, [String(L * l * p)], `Aire : ${L} × ${l} = ${L * l} m². Prix : ${L * l} × ${p} = ${L * l * p} €.`, "€");
};
const speedLike: G = (r) => {
  const a = ri(r, 2, 5), d = ri(r, 3, 9) * 10, h = ri(r, 2, 6);
  return num(`Un dragon parcourt ${d} km en 1 heure. Combien de kilomètres parcourt-il en ${h} heures ?`, [String(d * h)], `${h} × ${d} = ${d * h} km.${a ? "" : ""}`, "km");
};

// ---------- Géométrie ----------
type Shape = { key: "triangle" | "square" | "rect" | "rhombus" | "pentagon" | "hexagon" | "quad" | "iso" | "equi" | "rect-tri"; name: string; sides: number; verts: number };
const SHAPES: Shape[] = [
  { key: "triangle", name: "un triangle", sides: 3, verts: 3 },
  { key: "square", name: "un carré", sides: 4, verts: 4 },
  { key: "rect", name: "un rectangle", sides: 4, verts: 4 },
  { key: "pentagon", name: "un pentagone", sides: 5, verts: 5 },
  { key: "hexagon", name: "un hexagone", sides: 6, verts: 6 },
  { key: "rhombus", name: "un losange", sides: 4, verts: 4 },
];
const shapeName: G = (r) => {
  const s = pick(r, SHAPES);
  const ko = shuffled(r, SHAPES.filter((x) => x.key !== s.key && x.sides !== s.sides)).slice(0, 3).map((x) => x.name.replace(/^un /, ""));
  return { ...mcq("Comment s'appelle ce polygone de la salle des miroirs ?", s.name.replace(/^un /, ""), ko, `Il a ${s.sides} côtés${s.key === "square" ? " égaux et 4 angles droits" : s.key === "rect" ? " et 4 angles droits" : s.key === "rhombus" ? " tous égaux, mais pas d'angle droit" : ""} : c'est ${s.name}.`), vis: { t: "poly", shape: s.key } };
};
const shapeCount: G = (r) => {
  const s = pick(r, SHAPES);
  return { ...num(`Combien de côtés a ce polygone ?`, [String(s.sides)], `On compte les côtés (les segments qui ferment la figure) : ${s.sides}. Un polygone a autant de côtés que de sommets.`), vis: { t: "poly", shape: s.key } };
};
const shapeVerts: G = (r) => {
  const s = pick(r, SHAPES.filter((x) => x.key !== "square"));
  return { ...num(`Combien de sommets (coins) a cette figure ?`, [String(s.verts)], `Les sommets sont les coins. Ici ${s.verts}, comme le nombre de côtés.`), vis: { t: "poly", shape: s.key } };
};
const shapeMat: G = (r) => {
  const pool = shuffled(r, SHAPES.filter((x) => x.key !== "rect")).slice(0, 4);
  const pairs = pool.map((s) => [s.name.replace(/^un /, ""), `${s.sides} côtés`] as [string, string]);
  const dedup = new Map<string, [string, string]>();
  for (const p of pairs) if (!dedup.has(p[1])) dedup.set(p[1], p);
  const out = [...dedup.values()];
  if (out.length < 3) out.push(["hexagone", "6 côtés"], ["pentagone", "5 côtés"], ["triangle", "3 côtés"]);
  const fin = out.filter((p, i, a) => a.findIndex((x) => x[1] === p[1]) === i && a.findIndex((x) => x[0] === p[0]) === i).slice(0, 4);
  return mat(`Relie chaque figure à son nombre de côtés : ${fin.map((p) => p[0]).join(" ; ")}.`, fin, "Triangle 3, quadrilatères 4, pentagone 5, hexagone 6 côtés. Le préfixe grec t'aide : penta = 5, hexa = 6.");
};
const rightAngle: G = (r) => {
  const pairs: [string, boolean][] = [["un carré", true], ["un rectangle", true], ["un losange", false], ["un triangle équilatéral", false]];
  const [name, yes] = pick(r, pairs);
  return tf(`Vrai ou faux : ${name} a toujours des angles droits.`, yes, yes ? `Oui ! ${name[0].toUpperCase() + name.slice(1)} a ses angles droits.` : `Non : ${name} n'a pas d'angle droit en général (un losange peut en avoir si c'est un carré, mais pas toujours).`);
};
const parPerp: G = (r) => {
  const q = pick(r, [
    ["Deux droites qui ne se coupent jamais, même prolongées, sont…", "parallèles", ["perpendiculaires", "sécantes en un point", "égales"], "Des droites parallèles restent toujours à la même distance : elles ne se croisent jamais."],
    ["Deux droites qui se coupent en formant un angle droit sont…", "perpendiculaires", ["parallèles", "égales", "confondues"], "Perpendiculaires : elles se coupent à angle droit, comme les bords d'une page."],
    ["Les côtés opposés d'un rectangle sont…", "parallèles", ["perpendiculaires", "obliques", "sécants"], "Dans un rectangle, les côtés opposés sont parallèles et ceux qui se suivent sont perpendiculaires."],
    ["Deux côtés qui se suivent dans un carré sont…", "perpendiculaires", ["parallèles", "égaux mais obliques", "confondus"], "Dans un carré, les côtés consécutifs forment un angle droit : ils sont perpendiculaires."],
  ] as [string, string, string[], string][]);
  return mcq(q[0], q[1], q[2], q[3]);
};
const quadProps: G = (r) => {
  const items: [string, string, string[]][] = [
    ["4 côtés égaux et 4 angles droits", "un carré", ["un rectangle", "un losange", "un triangle"]],
    ["4 angles droits et deux longueurs différentes", "un rectangle", ["un carré", "un losange", "un pentagone"]],
    ["3 côtés et 3 sommets", "un triangle", ["un carré", "un hexagone", "un losange"]],
    ["6 côtés", "un hexagone", ["un pentagone", "un triangle", "un carré"]],
  ];
  const [d, ok, ko] = pick(r, items);
  return mcq(`Quelle figure a ${d} ?`, ok, ko, `La description « ${d} » correspond à ${ok}.`);
};
const triangleKind: G = (r) => {
  const a = ri(r, 3, 9);
  const kind = pick(r, ["equi", "iso", "scal"]);
  const sides = kind === "equi" ? [a, a, a] : kind === "iso" ? [a, a, a + ri(r, 1, 3)] : [a, a + 1, a + 3];
  const label = kind === "equi" ? "équilatéral" : kind === "iso" ? "isocèle" : "quelconque";
  return mcq(`Un triangle a des côtés de ${sides.join(" cm, ")} cm. Quel est ce triangle ?`, label, ["équilatéral", "isocèle", "quelconque"].filter((x) => x !== label), kind === "equi" ? "3 côtés égaux : équilatéral." : kind === "iso" ? "Exactement 2 côtés égaux : isocèle." : "Aucun côté égal : triangle quelconque.");
};
const symmetry: G = (r) => {
  const items: [string, number][] = [["carré", 4], ["rectangle", 2], ["triangle équilatéral", 3], ["cercle", 0]];
  const [name, n] = pick(r, items.slice(0, 3));
  return num(`Combien d'axes de symétrie a un ${name} ?`, [String(n)], `Un ${name} possède ${n} axes de symétrie (lignes qui le plient en deux moitiés qui se superposent).`);
};
const gridPos = (cols: number, rows: number): G => (r) => {
  const names = ["la tour", "le puits", "le moulin", "la forge", "le verger", "le phare"];
  const chosen = shuffled(r, names).slice(0, 4);
  const used = new Set<string>();
  const items = chosen.map((label) => {
    let c: number, rr: number;
    do { c = ri(r, 1, cols); rr = ri(r, 1, rows); } while (used.has(`${c}-${rr}`));
    used.add(`${c}-${rr}`);
    return { c, r: rr, label };
  });
  const t = items[0];
  const letters = "ABCDEFGHIJ";
  const coord = (i: { c: number; r: number }) => `${letters[i.c - 1]}${i.r}`;
  return { ...num(`Sur le plan du village, où se trouve ${t.label} ? (écris la colonne puis la ligne, par exemple B3)`, [coord(t), coord(t).toLowerCase(), `${letters[t.c - 1]}${t.r}`], `On lit la colonne (lettre) puis la ligne (chiffre) : ${t.label} est en ${coord(t)}.`), vis: { t: "plan", cols, rows, items, title: "Plan du village" } };
};
const gridWhat: G = (r) => {
  const cols = 5, rows = 4;
  const names = ["la tour", "le puits", "le moulin", "la forge", "le verger", "le phare"];
  const chosen = shuffled(r, names).slice(0, 4);
  const used = new Set<string>();
  const items = chosen.map((label) => {
    let c: number, rr: number;
    do { c = ri(r, 1, cols); rr = ri(r, 1, rows); } while (used.has(`${c}-${rr}`));
    used.add(`${c}-${rr}`);
    return { c, r: rr, label };
  });
  const t = items[1];
  const letters = "ABCDE";
  return { ...mcq(`Que trouve-t-on en ${letters[t.c - 1]}${t.r} ?`, t.label, items.filter((i) => i !== t).map((i) => i.label), `En ${letters[t.c - 1]}${t.r} (colonne ${letters[t.c - 1]}, ligne ${t.r}), il y a ${t.label}.`), vis: { t: "plan", cols, rows, items, title: "Plan du village" } };
};
const scale: G = (r) => {
  const cm = ri(r, 2, 9), sc = pick(r, [10, 100, 50]);
  return num(`Sur le plan du château, 1 cm représente ${sc} m. Deux tours sont séparées de ${cm} cm sur le plan. Quelle est la distance réelle (en m) ?`, [String(cm * sc)], `${cm} × ${sc} = ${cm * sc} m dans la réalité.`, "m");
};
const volumeBoxes: G = (r) => {
  const a = ri(r, 2, 5), b = ri(r, 2, 4), c = ri(r, 2, 4);
  return num(`Un coffre est rempli de cubes de 1 cm de côté : ${a} cubes en longueur, ${b} en largeur et ${c} en hauteur. Combien de cubes contient-il ?`, [String(a * b * c)], `${a} × ${b} × ${c} = ${a * b * c} cubes (volume en cm³).`);
};
const numline: G = (r) => {
  const start = ri(r, 0, 5) * 100, step = pick(r, [50, 100, 25]);
  const k = ri(r, 1, 3);
  const v = start + k * step;
  return { ...num(`Quel nombre marque la flèche sur la droite graduée ?`, [String(v)], `La graduation avance de ${step} en ${step} : ${start}, ${start + step}, … Le repère est à ${v}.`), vis: { t: "numline", min: start, max: start + 4 * step, marks: [{ v: start }, { v: start + 4 * step }, { v, label: "?" }] } };
};

export const GR_SPEC: Record<number, { title: string; intro: string; gens: G[] }> = {
  1: { title: "Lire l'heure", intro: "Heures entières, quarts et demi-heures.", gens: [clockRead(15), clockRead(15), clockWriteQ, timeConv, timeCompare, clockRead(15)] },
  2: { title: "Durées et horaires", intro: "Calcule la durée d'un spectacle ou l'heure de fin.", gens: [duration, endTime, openHours, timeConv, clockWrite, clockRead(5)] },
  3: { title: "L'argent du royaume", intro: "Pièces, billets, rendu de monnaie.", gens: [coins, rendu, promo, coins, rendu, promo] },
  4: { title: "Longueurs en mètres et centimètres", intro: "Convertis, compare, range.", gens: [lenConv, lenConvBack, lenMixed, lenSplit, lenCompare, lenOrder] },
  5: { title: "Masses, capacités et unités", intro: "Grammes, kilos, litres, centilitres.", gens: [massConv, capConv, unitChoice, matUnits, potion, ribbon] },
  6: { title: "Périmètre et aire", intro: "Le tour d'une figure et sa surface.", gens: [perimRect, perimSquare, sideFromPerim, areaRect, areaSquare, perimVsArea] },
  7: { title: "Les figures de la salle des miroirs", intro: "P5 · Polygones, sommets, côtés.", gens: [shapeName, shapeCount, shapeVerts, shapeMat, quadProps, rightAngle] },
  8: { title: "Droites, angles et symétrie", intro: "P5 · Parallèles, perpendiculaires, triangles, axes.", gens: [parPerp, triangleKind, symmetry, compoundPerim, areaTri, fenceTF] },
  9: { title: "Le plan du village", intro: "P5 · Se repérer sur un quadrillage et lire une échelle.", gens: [gridPos(5, 4), gridWhat, gridPos(6, 5), scale, numline, areaGrid] },
  10: { title: "Le grand chantier", intro: "P5 · Mesures, aires et volumes à étapes.", gens: [frame, paint, volumeBoxes, speedLike, areaTri, fenceTF] },
};
export const GR_EXTRA: G[] = [areaRect, perimRect, lenConv, duration, coins, shapeName, gridPos(5, 4), massConv, capConv, lenSplit, endTime, clockRead(5)];

export const MISSIONS: Mission[] = buildMissions("gr", GR_SPEC);

export function grExam(levels: number[], seed: string, perLevel: number): Question[] {
  const r: Rng = mulberry32(hashSeed(seed));
  const out: Question[] = [];
  for (const lv of levels) {
    const pool = shuffled(r, [...GR_SPEC[lv].gens, ...GR_EXTRA]);
    for (const g of pool.slice(0, perLevel)) out.push(fresh(() => g(r)));
  }
  return out;
}
void fmt;
