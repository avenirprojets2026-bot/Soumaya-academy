import type { ReactNode } from 'react';

/** Illustrations vectorielles originales du jeu (aucun emoji : rendu identique sur tous les appareils). */
const S = ({ size, children, label, className }: { size: number | string; children: ReactNode; label?: string; className?: string }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} className={className} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true} style={{ display: 'inline-block', verticalAlign: '-0.2em', flexShrink: 0 }}>{children}</svg>
);

const star5 = 'M50 8l12.5 27.2 29.7 3.4-22 20.3 6 29.4L50 73.4 23.8 88.3l6-29.4-22-20.3 29.7-3.4z';
type IcoName = 'coin' | 'star' | 'lock' | 'gear' | 'bulb' | 'speaker' | 'check' | 'cross' | 'sparkle' | 'review' | 'print' | 'flag' | 'upload' | 'cloud';

export function Ico({ n, s = '1.1em', label, className }: { n: IcoName; s?: number | string; label?: string; className?: string }) {
  const p = { size: s, label, className };
  switch (n) {
    case 'coin': return <S {...p}><circle cx="50" cy="50" r="42" fill="#f5b800" stroke="#b07a00" strokeWidth="6" /><circle cx="50" cy="50" r="30" fill="#ffd54a" stroke="#d99a00" strokeWidth="4" /><path d="M50 30v40M40 40h14a7 7 0 010 14H40" fill="none" stroke="#b07a00" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" /></S>;
    case 'star': return <S {...p}><path d={star5} fill="#ffc933" stroke="#d98f00" strokeWidth="6" strokeLinejoin="round" /></S>;
    case 'lock': return <S {...p}><rect x="20" y="42" width="60" height="46" rx="9" fill="#7d6bd6" stroke="#4a2fb0" strokeWidth="6" /><path d="M32 42V32a18 18 0 0136 0v10" fill="none" stroke="#4a2fb0" strokeWidth="9" strokeLinecap="round" /><circle cx="50" cy="63" r="6" fill="#ffe27a" /></S>;
    case 'gear': return <S {...p}><g fill="currentColor"><path d="M44 8h12l3 12a30 30 0 019 5l11-6 8 8-6 11a30 30 0 015 9l12 3v12l-12 3a30 30 0 01-5 9l6 11-8 8-11-6a30 30 0 01-9 5l-3 12H44l-3-12a30 30 0 01-9-5l-11 6-8-8 6-11a30 30 0 01-5-9L2 56V44l12-3a30 30 0 015-9l-6-11 8-8 11 6a30 30 0 019-5z" /></g><circle cx="50" cy="50" r="14" fill="#2b1b6e" /></S>;
    case 'bulb': return <S {...p}><path d="M50 8a28 28 0 00-16 51c3 3 4 6 4 10h24c0-4 1-7 4-10A28 28 0 0050 8z" fill="#ffd54a" stroke="#d99a00" strokeWidth="5" strokeLinejoin="round" /><rect x="38" y="74" width="24" height="7" rx="3" fill="#9aa0b4" /><rect x="42" y="84" width="16" height="7" rx="3.5" fill="#7d8398" /></S>;
    case 'speaker': return <S {...p}><path d="M14 38h18l22-18v60L32 62H14z" fill="currentColor" /><path d="M66 36a20 20 0 010 28M76 26a34 34 0 010 48" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" /></S>;
    case 'check': return <S {...p}><path d="M18 52l22 22 42-46" fill="none" stroke="currentColor" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" /></S>;
    case 'cross': return <S {...p}><path d="M24 24l52 52M76 24L24 76" fill="none" stroke="currentColor" strokeWidth="13" strokeLinecap="round" /></S>;
    case 'sparkle': return <S {...p}><path d="M50 6l9 31 31 9-31 9-9 31-9-31-31-9 31-9z" fill="#fff3a0" stroke="#ffc933" strokeWidth="4" strokeLinejoin="round" /></S>;
    case 'review': return <S {...p}><path d="M80 40A32 32 0 1050 82" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" /><path d="M84 14v28H56" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" /></S>;
    case 'print': return <S {...p}><rect x="26" y="10" width="48" height="26" rx="3" fill="none" stroke="currentColor" strokeWidth="7" /><rect x="10" y="36" width="80" height="34" rx="8" fill="currentColor" /><rect x="26" y="56" width="48" height="32" rx="3" fill="#fff" stroke="currentColor" strokeWidth="7" /></S>;
    case 'upload': return <S {...p}><path d="M50 66V16M30 36l20-20 20 20" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" /><path d="M16 66v18h68V66" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" /></S>;
    case 'cloud': return <S {...p}><path d="M28 78a20 20 0 01-3-39 26 26 0 0150-4 22 22 0 01-2 43z" fill="currentColor" /></S>;
    case 'flag': return <Flag size={s} />;
  }
}

export function Flag({ size = 56 }: { size?: number | string }) {
  return (<S size={size}><rect x="18" y="8" width="7" height="86" rx="3" fill="#6b4a2b" /><g>{Array.from({ length: 12 }).map((_, i) => <rect key={i} x={25 + (i % 4) * 14} y={12 + Math.floor(i / 4) * 14} width="14" height="14" fill={(i + Math.floor(i / 4)) % 2 ? '#222' : '#fff'} />)}</g><rect x="25" y="12" width="56" height="42" fill="none" stroke="#222" strokeWidth="2" /></S>);
}

const WORLD_COLORS = ['#ffb300', '#4cc46a', '#35b6ff', '#c46cff', '#ff6b8b', '#ff8a3d'];
export function WorldIcon({ id, size = '1em' }: { id: number; size?: number | string }) {
  const c = WORLD_COLORS[id - 1] ?? '#fff';
  switch (id) {
    case 1: return <S size={size}><rect x="14" y="80" width="72" height="8" rx="3" fill="#fff" /><rect x="22" y="14" width="6" height="68" fill="#fff" /><rect x="47" y="14" width="6" height="68" fill="#fff" /><rect x="72" y="14" width="6" height="68" fill="#fff" />{[[25, 30], [25, 46], [50, 38], [50, 54], [50, 70], [75, 62]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="8" fill="#7a3a00" stroke="#fff" strokeWidth="2.5" />)}</S>;
    case 2: return <S size={size}><rect x="44" y="52" width="12" height="38" rx="3" fill="#7a4a1c" /><circle cx="50" cy="34" r="26" fill="#fff" /><circle cx="34" cy="48" r="17" fill="#fff" /><circle cx="66" cy="48" r="17" fill="#fff" /><circle cx="50" cy="34" r="11" fill={c} opacity=".55" /></S>;
    case 3: return <S size={size}><g transform="rotate(-35 50 50)"><rect x="6" y="36" width="88" height="28" rx="5" fill="#fff" />{Array.from({ length: 9 }).map((_, i) => <rect key={i} x={14 + i * 9} y="36" width="3" height={i % 2 ? 12 : 18} fill={c} />)}</g></S>;
    case 4: return <S size={size}><path d="M50 8l36 42-36 42L14 50z" fill="#fff" /><path d="M50 8l12 42-12 42M50 8L38 50l12 42M14 50h72" fill="none" stroke={c} strokeWidth="4" strokeLinejoin="round" /></S>;
    case 5: return <S size={size}><circle cx="50" cy="50" r="24" fill="#fff" /><ellipse cx="50" cy="52" rx="46" ry="12" fill="none" stroke="#fff" strokeWidth="6" transform="rotate(-20 50 52)" /><circle cx="42" cy="44" r="5" fill={c} opacity=".6" /><circle cx="58" cy="58" r="7" fill={c} opacity=".6" /></S>;
    default: return <S size={size}><path d="M14 90V36h12v10h10V36h12v10h4V36h12v10h10V36h12v54z" fill="#fff" /><path d="M14 36l6-14h60l6 14" fill="#fff" /><path d="M42 90V66a8 8 0 0116 0v24z" fill={c} /></S>;
  }
}

export function BadgeIcon({ id, size = '1.2em' }: { id: string; size?: number | string }) {
  switch (id) {
    case 'premiers-pas': return <S size={size}><path d="M50 90V50" stroke="#3a9a4a" strokeWidth="7" strokeLinecap="round" /><path d="M50 52C28 52 16 38 14 22c22 0 36 8 36 30z" fill="#5fd36e" /><path d="M50 60c0-18 12-28 34-28 0 20-12 28-34 28z" fill="#8be39a" /></S>;
    case 'etoile-doree': return <Ico n="star" s={size} />;
    case 'perseverance': return <S size={size}><path d="M50 8c4 18 26 24 26 48a26 26 0 01-52 0c0-12 6-18 12-26 2 8 6 12 10 12 0-14-2-24 4-34z" fill="#ff8a3d" stroke="#d9531a" strokeWidth="4" strokeLinejoin="round" /><path d="M50 52c3 10 12 12 12 24a12 12 0 01-24 0c0-10 8-14 12-24z" fill="#ffd54a" /></S>;
    case 'sans-indice': return <Ico n="bulb" s={size} />;
    case 'gardien-mots': return <Guardian v="treant" size={size} />;
    case 'gardien-formes': return <Guardian v="crystal" size={size} />;
    case 'gardien-decouvertes': return <WorldIcon id={5} size={size} />;
    case 'dragon': return <Guardian v="dragon" size={size} />;
    default: return <S size={size}><path d="M24 12h52v62a14 14 0 01-14 14H30a6 6 0 01-6-6z" fill="#f4e4b8" stroke="#a37a2c" strokeWidth="5" /><path d="M36 30h28M36 44h28M36 58h20" stroke="#a37a2c" strokeWidth="5" strokeLinecap="round" /></S>;
  }
}

export type FoeKind = 'chiffres' | 'mesures' | 'mots' | 'formes' | 'robot';
export function Foe({ v = 'chiffres', size = 80 }: { v?: FoeKind; size?: number | string }) {
  const col = { chiffres: '#7a54d6', mesures: '#2f9fd6', mots: '#4cae4c', formes: '#c455c4', robot: '#7d8698' }[v];
  const dark = { chiffres: '#4a2fa0', mesures: '#1a6e98', mots: '#2b7a2b', formes: '#8a2f8a', robot: '#4a5260' }[v];
  return (<S size={size}>
    {v === 'robot' ? <><rect x="26" y="26" width="48" height="44" rx="10" fill={col} stroke={dark} strokeWidth="4" /><path d="M50 26V12" stroke={dark} strokeWidth="4" /><circle cx="50" cy="10" r="5" fill="#ff5c5c" /><rect x="34" y="70" width="32" height="18" rx="5" fill={dark} /></>
      : <><path d="M22 36L8 20l24 6zM78 36l14-16-24 6z" fill={dark} /><ellipse cx="50" cy="56" rx="32" ry="30" fill={col} stroke={dark} strokeWidth="4" />
        {v === 'mots' && <path d="M50 28c-10-14-26-8-26-8s4 16 26 8z" fill="#8be39a" stroke={dark} strokeWidth="3" />}
        {v === 'formes' && <path d="M50 12l14 20H36z" fill="#ffd54a" stroke={dark} strokeWidth="3" strokeLinejoin="round" />}</>}
    <circle cx="39" cy="52" r="8" fill="#fff" /><circle cx="61" cy="52" r="8" fill="#fff" /><circle cx="41" cy="53" r="4" fill="#222" /><circle cx="59" cy="53" r="4" fill="#222" />
    <path d="M38 72q12 8 24 0" fill="none" stroke={v === 'robot' ? '#222' : '#fff'} strokeWidth="4" strokeLinecap="round" /></S>);
}

export type GuardKind = 'dragon' | 'treant' | 'golem' | 'crystal' | 'robot';
export function Guardian({ v = 'dragon', size = 110 }: { v?: GuardKind; size?: number | string }) {
  switch (v) {
    case 'treant': return (<S size={size}><rect x="36" y="46" width="28" height="46" rx="6" fill="#7a4a1c" /><path d="M36 60l-22-8M64 60l22-8" stroke="#7a4a1c" strokeWidth="8" strokeLinecap="round" /><circle cx="50" cy="30" r="26" fill="#3fae4f" /><circle cx="28" cy="38" r="16" fill="#4cc46a" /><circle cx="72" cy="38" r="16" fill="#4cc46a" /><circle cx="43" cy="56" r="4" fill="#fff" /><circle cx="57" cy="56" r="4" fill="#fff" /><circle cx="43" cy="57" r="2" fill="#222" /><circle cx="57" cy="57" r="2" fill="#222" /><path d="M44 68q6 5 12 0" stroke="#3b2208" strokeWidth="3" fill="none" strokeLinecap="round" /></S>);
    case 'golem': return (<S size={size}><rect x="26" y="20" width="48" height="50" rx="8" fill="#6aa7d8" stroke="#2f6a9c" strokeWidth="4" /><rect x="10" y="38" width="16" height="34" rx="6" fill="#4d8fc4" /><rect x="74" y="38" width="16" height="34" rx="6" fill="#4d8fc4" /><rect x="30" y="72" width="16" height="20" rx="4" fill="#4d8fc4" /><rect x="54" y="72" width="16" height="20" rx="4" fill="#4d8fc4" />{[0, 1, 2, 3, 4].map((i) => <rect key={i} x={32 + i * 8} y="20" width="3" height={i % 2 ? 7 : 11} fill="#fff" />)}<circle cx="40" cy="42" r="6" fill="#fff" /><circle cx="60" cy="42" r="6" fill="#fff" /><circle cx="41" cy="43" r="3" fill="#222" /><circle cx="59" cy="43" r="3" fill="#222" /><path d="M40 58h20" stroke="#fff" strokeWidth="4" strokeLinecap="round" /></S>);
    case 'crystal': return (<S size={size}><path d="M50 4l30 28-8 52H28L20 32z" fill="#c96cf0" stroke="#7d2fa8" strokeWidth="4" strokeLinejoin="round" /><path d="M50 4l-10 28 10 52 10-52zM20 32h60" fill="none" stroke="#e8b6ff" strokeWidth="3" /><circle cx="40" cy="48" r="5" fill="#fff" /><circle cx="60" cy="48" r="5" fill="#fff" /><circle cx="41" cy="49" r="2.5" fill="#222" /><circle cx="59" cy="49" r="2.5" fill="#222" /><path d="M42 62q8 6 16 0" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" /></S>);
    case 'robot': return (<S size={size}><circle cx="50" cy="52" r="34" fill="#ff8fb1" stroke="#c9486f" strokeWidth="4" /><ellipse cx="50" cy="52" rx="48" ry="11" fill="none" stroke="#ffd54a" strokeWidth="5" transform="rotate(-18 50 52)" /><circle cx="50" cy="44" r="16" fill="#fff" stroke="#c9486f" strokeWidth="3" /><circle cx="50" cy="44" r="8" fill="#222" /><circle cx="53" cy="41" r="3" fill="#fff" /><path d="M42 72q8 6 16 0" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" /><path d="M50 18V6" stroke="#c9486f" strokeWidth="4" /><circle cx="50" cy="6" r="4" fill="#ffd54a" /></S>);
    default: return (<S size={size}>
      <path d="M12 60C4 40 22 24 40 34l-4 20z" fill="#d95a4a" /><path d="M88 60c8-20-10-36-28-26l4 20z" fill="#d95a4a" />
      <path d="M30 94c-8-18 0-40 20-40s28 22 20 40z" fill="#4cc46a" stroke="#2b8a45" strokeWidth="4" strokeLinejoin="round" /><ellipse cx="50" cy="78" rx="13" ry="16" fill="#c9f2b0" />
      <circle cx="50" cy="38" r="22" fill="#4cc46a" stroke="#2b8a45" strokeWidth="4" /><path d="M32 22l-8-14 16 8zM68 22l8-14-16 8z" fill="#ffd54a" stroke="#c99a00" strokeWidth="2.5" strokeLinejoin="round" />
      <ellipse cx="50" cy="48" rx="14" ry="9" fill="#9be07f" /><circle cx="45" cy="47" r="2.2" fill="#2b8a45" /><circle cx="55" cy="47" r="2.2" fill="#2b8a45" />
      <circle cx="41" cy="33" r="6" fill="#fff" /><circle cx="59" cy="33" r="6" fill="#fff" /><circle cx="42" cy="34" r="3" fill="#222" /><circle cx="58" cy="34" r="3" fill="#222" />
      <path d="M42 56q8 5 16 0" fill="none" stroke="#2b8a45" strokeWidth="3" strokeLinecap="round" /></S>);
  }
}
