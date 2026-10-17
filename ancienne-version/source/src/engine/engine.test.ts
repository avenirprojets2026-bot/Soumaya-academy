import { describe, it, expect } from 'vitest';
import { makeRng } from './rng';
import { generate, SKILLS } from './generators';
import { isCorrect } from './grading';
import { parseNum, fr } from './format';
import { masteryEstimate, updateStats, emptyStats } from './mastery';
import type { SkillId, Attempt } from './types';

const skills = Object.keys(SKILLS) as SkillId[];

describe('formatage', () => {
  it('formate à la française', () => { expect(fr(10184.5)).toBe('10 184,5'); expect(fr(0.25)).toBe('0,25'); });
  it('lit virgule et espaces', () => { expect(parseNum('10 184,5')).toBe(10184.5); expect(parseNum('abc')).toBeNull(); });
});

describe('générateurs', () => {
  for (const s of skills) {
    it(`${s} : 300 exercices valides, correction cohérente`, () => {
      for (let seed = 1; seed <= 100; seed++) for (const d of [1, 2, 3]) {
        const ex = generate(s, makeRng(seed * 7 + d), d);
        expect(ex.answers.length).toBeGreaterThan(0);
        expect(ex.hints.length).toBeGreaterThan(0);
        expect(isCorrect(ex, ex.answers[0])).toBe(true);
        // un indice ne doit jamais contenir la réponse brute pour les calculs numériques longs
        if (ex.kind === 'number' && ex.answers[0].length >= 4) for (const h of ex.hints) expect(h.replace(/\s/g, '')).not.toContain(`= ${ex.answers[0]}`);
        if (ex.kind === 'choice') expect(ex.choices).toContain(ex.answers[0]);
      }
    });
  }
  it('addition/soustraction : valeurs exactes', () => {
    for (let i = 1; i < 200; i++) {
      const a = generate('addition', makeRng(i), 2); const m = a.prompt.match(/: (.+) \+ (.+)$/)!;
      const x = parseNum(m[1])!, y = parseNum(m[2])!; expect(Math.abs(x + y - Number(a.answers[0]))).toBeLessThan(1e-6);
      const b = generate('soustraction', makeRng(i), 3); const n = b.prompt.match(/: (.+) − (.+)$/)!;
      const u = parseNum(n[1])!, v = parseNum(n[2])!; expect(u).toBeGreaterThan(v); expect(Math.abs(u - v - Number(b.answers[0]))).toBeLessThan(1e-6);
    }
  });
  it('comparaison correcte', () => {
    for (let i = 1; i < 300; i++) { const c = generate('comparer', makeRng(i), 2); const m = c.prompt.match(/: (.+) {2}\? {2}(.+)$/)!;
      const a = parseNum(m[1])!, b = parseNum(m[2])!; expect(c.answers[0]).toBe(a < b ? '<' : a > b ? '>' : '='); }
  });
});

describe('grandeurs', () => {
  it('conversion exacte', () => {
    for (let i = 1; i < 300; i++) for (const d of [1, 2, 3]) {
      const c = generate('conversion', makeRng(i * 3 + d), d);
      const m = c.prompt.match(/^(.+) (\S+) = \? (\S+)$/)!; const v = parseNum(m[1])!;
      const F: Record<string, number> = { 'm>cm': 100, 'km>m': 1000, 'hm>m': 100, 'kg>g': 1000, 'L>cl': 100, 'L>mL': 1000, 'cm>mm': 10, 'h>min': 60, 'dm>cm': 10 };
      const k = F[`${m[2]}>${m[3]}`]; const exp = k ? v * k : v / F[`${m[3]}>${m[2]}`];
      expect(Math.abs(exp - Number(c.answers[0]))).toBeLessThan(1e-6);
    }
  });
  it('heure : choix distincts et réponse présente', () => {
    for (let i = 1; i < 400; i++) { const e = generate('heure', makeRng(i), (i % 3) + 1); expect(new Set(e.choices).size).toBe(e.choices!.length); expect(e.choices).toContain(e.answers[0]); }
  });
  it('durée : choix distincts', () => {
    for (let i = 1; i < 400; i++) { const e = generate('duree', makeRng(i), (i % 3) + 1); expect(new Set(e.choices).size).toBe(4); }
  });
});

describe('maîtrise', () => {
  const mk = (correct: boolean, hints = 0): Attempt => ({ t: Date.now(), skill: 'suites', correct, hintsUsed: hints, ms: 1000, levelId: 'n1', mode: 'training', prompt: '', given: '', expected: '' });
  it('refuse d’estimer avec trop peu de données', () => { expect(masteryEstimate([mk(true), mk(true)], 'suites')).toBeNull(); });
  it('estime avec assez de données', () => { expect(masteryEstimate(Array.from({ length: 8 }, () => mk(true)), 'suites')).toBe(100); });
  it('répétition espacée : la boîte monte puis retombe', () => {
    let s = updateStats(emptyStats(), mk(true)); expect(s.box).toBe(2); s = updateStats(s, mk(false)); expect(s.box).toBe(1);
  });
});

describe('mots', () => {
  const fr6: SkillId[] = ['homophones', 'pluriel', 'accord', 'conjugaison', 'nature', 'vocabulaire'];
  it('chaque exercice de français : réponse unique dans les choix, choix distincts, indices non vides', () => {
    for (const sk of fr6) for (let d = 1; d <= 3; d++) for (let seed = 1; seed <= 150; seed++) {
      const ex = generate(sk, makeRng(seed * 7 + d), d);
      expect(ex.choices, sk).toBeTruthy();
      expect(new Set(ex.choices).size, `${sk} d${d} ${ex.prompt}`).toBe(ex.choices!.length);
      expect(ex.choices!.length).toBeGreaterThanOrEqual(2);
      expect(ex.choices!.filter((c) => ex.answers.includes(c)).length, `${sk} ${ex.prompt}`).toBe(1);
      expect(ex.hints.length).toBeGreaterThan(0);
      expect(isCorrect(ex, ex.answers[0])).toBe(true);
    }
  });
  it('pluriel : cheval → chevaux, nez reste nez', () => {
    const seen = new Map<string, string>();
    for (let i = 1; i < 400; i++) { const ex = generate('pluriel', makeRng(i), 3); seen.set(ex.prompt, ex.answers[0]); }
    expect(seen.get('Quel est le pluriel de « un cheval » ?')).toBe('chevaux');
    expect(seen.get('Quel est le pluriel de « un nez » ?')).toBe('nez');
    expect(seen.get('Quel est le pluriel de « un bijou » ?')).toBe('bijoux');
  });
  it('conjugaison : j’ai, nous allons, ils font', () => {
    const seen = new Set<string>();
    for (let i = 1; i < 600; i++) { const ex = generate('conjugaison', makeRng(i), 3); seen.add(ex.answers[0]); }
    for (const f of ['j’ai', 'nous allons', 'ils font', 'nous mangeons', 'vous êtes']) expect(seen.has(f), f).toBe(true);
  });
});

describe('formes', () => {
  const g6: SkillId[] = ['polygones', 'angles', 'quadrilateres', 'perimetre', 'solides', 'symetrie'];
  it('exercices de géométrie cohérents', () => {
    for (const sk of g6) for (let d = 1; d <= 3; d++) for (let seed = 1; seed <= 120; seed++) {
      const ex = generate(sk, makeRng(seed * 13 + d), d);
      if (ex.kind === 'choice') { expect(new Set(ex.choices).size).toBe(ex.choices!.length); expect(ex.choices!.filter((c) => ex.answers.includes(c)).length, ex.prompt).toBe(1); }
      expect(isCorrect(ex, ex.answers[0])).toBe(true); expect(ex.hints.length).toBeGreaterThan(0);
    }
  });
  it('faits : cube 12 arêtes, rectangle 2 axes, carré de périmètre 36 → 9', () => {
    const m = new Map<string, string>();
    for (let i = 1; i < 800; i++) for (const sk of ['solides', 'symetrie', 'perimetre'] as SkillId[]) { const ex = generate(sk, makeRng(i), 3); m.set(ex.prompt, ex.answers[0]); }
    expect(m.get('Combien un cube a-t-il d’arêtes ?')).toBe('12');
    expect(m.get('Combien un rectangle (qui n’est pas un carré) a-t-il d’axes de symétrie ?')).toBe('2');
    expect(m.get('Un carré a un périmètre de 36 cm. Combien mesure un côté ? (en cm)')).toBe('9');
  });
});

describe('découvertes', () => {
  const g: SkillId[] = ['frise', 'siecles', 'terre', 'decalage', 'epc', 'statistiques'];
  it('exercices cohérents', () => {
    for (const sk of g) for (let d = 1; d <= 3; d++) for (let seed = 1; seed <= 150; seed++) {
      const ex = generate(sk, makeRng(seed * 17 + d), d);
      if (ex.kind === 'choice') { expect(new Set(ex.choices).size, ex.prompt).toBe(ex.choices!.length); expect(ex.choices!.filter((c) => ex.answers.includes(c)).length, ex.prompt).toBe(1); }
      expect(isCorrect(ex, ex.answers[0])).toBe(true); expect(ex.hints.length).toBeGreaterThan(0);
    }
  });
  it('faits : 1914 → 20e siècle, 1900 → 19e, 10 h Bruxelles → 4 h Québec, plus haute barre', () => {
    const m = new Map<string, string>();
    for (let i = 1; i < 1500; i++) for (const sk of ['siecles', 'decalage'] as SkillId[]) for (const d of [1, 2, 3]) { const ex = generate(sk, makeRng(i), d); m.set(ex.prompt, ex.answers[0]); }
    expect(m.get('Dans quel siècle se trouve l’année 1914 ? (écris le numéro du siècle, par exemple 18 pour le 18e siècle)')).toBe('20');
    expect(m.get('Dans quel siècle se trouve l’année 1900 ? (écris le numéro du siècle, par exemple 18 pour le 18e siècle)')).toBe('19');
    expect(m.get('Il est 10 h à Bruxelles. Il y a 6 heures de décalage avec Québec, où il est plus tôt. Quelle heure est-il à Québec ? (écris le nombre d’heures)')).toBe('4');
    for (let i = 1; i < 300; i++) { const ex = generate('statistiques', makeRng(i), 1); const v = ex.visual as { items: [string, number][] }; if (ex.prompt.startsWith('Quel choix')) { const top = [...v.items].sort((a, b) => b[1] - a[1])[0][0]; expect(ex.answers[0]).toBe(top); } }
  });
});
