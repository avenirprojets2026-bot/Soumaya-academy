import { motion } from 'framer-motion';

export type Mood = 'happy' | 'think' | 'surprise' | 'win';
export interface Hero { id: number; name: string; age: number; img: string; skin: string; hair: string; style: 'long' | 'hijab' | 'puffs' | 'braids' | 'short' | 'cap'; blurb: string }
const H = (id: number, pic: number, name: string, age: number, skin: string, hair: string, style: Hero['style'], blurb: string): Hero => ({ id, name, age, img: `heroes/h${pic}.webp`, skin, hair, style, blurb });
export const HEROES: Hero[] = [
  H(0, 0, 'Soumaya', 9, '#e8bd98', '#6b3f22', 'long', 'Curieuse et rapide'),
  H(1, 1, 'Nour', 8, '#e4b087', '#2e6fb5', 'hijab', 'Calme et maligne'),
  H(2, 2, 'Lina', 8, '#7a4a2e', '#1c1210', 'puffs', 'Joyeuse et courageuse'),
  H(3, 3, 'Yasmine', 9, '#c98a60', '#8a3a1a', 'braids', 'Patiente et précise'),
  H(4, 4, 'Amira', 8, '#b9774a', '#3a2418', 'cap', 'Énergique et drôle'),
  H(5, 5, 'Hana', 9, '#f0c9a8', '#1c1210', 'short', 'Réfléchie et douce'),
  H(6, 6, 'Safiya', 9, '#d9a07c', '#c2528a', 'hijab', 'Sûre d’elle'),
  H(7, 7, 'Lamia', 8, '#f6d9c4', '#b8431a', 'long', 'Aventurière'),
  H(8, 8, 'Malak', 9, '#c69064', '#14100e', 'braids', 'Créative et joueuse'),
];
export const OUTFITS = ['#7b4dff', '#ff5c8a', '#18b7a0', '#ff9f1c', '#2f80ed', '#e84a5f'];

function HairBack({ h }: { h: Hero }) {
  switch (h.style) {
    case 'long': return <path d="M22 44c-4 26 0 40 6 48h44c6-8 10-22 6-48-4-22-52-22-56 0z" fill={h.hair} />;
    case 'hijab': return <path d="M18 50c0-30 20-36 32-36s32 6 32 36c0 22-8 36-14 42H32c-6-6-14-20-14-42z" fill={h.hair} />;
    case 'puffs': return <g fill={h.hair}><circle cx="22" cy="30" r="13" /><circle cx="78" cy="30" r="13" /></g>;
    case 'braids': return <g fill={h.hair}><rect x="20" y="44" width="10" height="46" rx="5" /><rect x="70" y="44" width="10" height="46" rx="5" /></g>;
    default: return null;
  }
}
function HairFront({ h }: { h: Hero }) {
  switch (h.style) {
    case 'long': case 'braids': case 'puffs': return <path d="M26 42c2-18 14-24 24-24s22 6 24 24c-8-8-16-10-24-10s-16 2-24 10z" fill={h.hair} />;
    case 'hijab': return <path d="M24 46c0-18 12-26 26-26s26 8 26 26c-6-6-12-8-26-8s-20 2-26 8z" fill={h.hair} />;
    case 'short': return <path d="M26 44c-2-20 10-28 24-28s26 8 24 28c-4-10-12-14-24-14s-20 4-24 14z" fill={h.hair} />;
    case 'cap': return <g><path d="M26 42c0-18 10-26 24-26s24 8 24 26z" fill="#e84a5f" /><rect x="22" y="40" width="40" height="6" rx="3" fill="#b83246" /></g>;
  }
}

export function Avatar({ hero, outfit, accessory = 'aucun', mood = 'happy', size = 140 }: { hero: Hero; outfit: string; accessory?: string; mood?: Mood; size?: number }) {
  if (hero.img) {
    const a2 = mood === 'win' ? { y: [0, -10, 0] } : mood === 'think' ? { rotate: [0, -2, 0] } : mood === 'surprise' ? { scale: [1, 1.06, 1] } : { y: [0, -2, 0] };
    return (
      <motion.div animate={a2} transition={{ duration: mood === 'win' ? 0.7 : 2.4, repeat: Infinity, ease: 'easeInOut' }} role="img" aria-label={`${hero.name}, ${hero.age} ans`} className="relative shrink-0" style={{ width: size, height: size }}>
        <img src={hero.img} alt="" draggable={false} className="w-full h-full object-cover rounded-full" style={{ border: `${Math.max(3, size / 24)}px solid ${outfit}`, boxShadow: `0 0 ${size / 6}px ${outfit}88` }} />
        {accessory === 'couronne' && <svg viewBox="0 0 100 40" className="absolute left-1/2 -translate-x-1/2" style={{ top: -size * 0.16, width: size * 0.5 }}><path d="M6 36l6-28 20 16 18-22 18 22 20-16 6 28z" fill="#ffd23f" stroke="#c99700" strokeWidth="3" /></svg>}
        {accessory === 'casque' && <svg viewBox="0 0 100 60" className="absolute left-1/2 -translate-x-1/2" style={{ top: -size * 0.1, width: size * 0.8 }}><path d="M6 56C6 20 28 4 50 4s44 16 44 52z" fill="#b8c2cc" stroke="#6b7782" strokeWidth="4" opacity=".92" /></svg>}
      </motion.div>);
  }
  const anim = mood === 'win' ? { y: [0, -14, 0], rotate: [0, -4, 4, 0] } : mood === 'think' ? { rotate: [0, -3, 0] } : mood === 'surprise' ? { scale: [1, 1.08, 1] } : { y: [0, -3, 0] };
  return (
    <motion.svg viewBox="0 0 100 120" width={size} height={size * 1.2} animate={anim} transition={{ duration: mood === 'win' ? 0.7 : 2.4, repeat: Infinity, ease: 'easeInOut' }} role="img" aria-label={`Avatar ${hero.name}`}>
      {accessory === 'cape' && <path d="M24 78l-8 36h68l-8-36z" fill="#c1121f" />}
      <HairBack h={hero} />
      <rect x="28" y="76" width="44" height="38" rx="14" fill={outfit} />
      <rect x="40" y="70" width="20" height="12" rx="5" fill={hero.skin} />
      <circle cx="50" cy="48" r="26" fill={hero.skin} />
      <HairFront h={hero} />
      <ellipse cx="40" cy="50" rx="3.2" ry={mood === 'surprise' ? 5 : 4} fill="#2b1b1b" />
      <ellipse cx="60" cy="50" rx="3.2" ry={mood === 'surprise' ? 5 : 4} fill="#2b1b1b" />
      <circle cx="41" cy="48.5" r="1.1" fill="#fff" /><circle cx="61" cy="48.5" r="1.1" fill="#fff" />
      <circle cx="33" cy="58" r="4" fill="#ff8aa0" opacity=".45" /><circle cx="67" cy="58" r="4" fill="#ff8aa0" opacity=".45" />
      {mood === 'surprise' ? <ellipse cx="50" cy="63" rx="4" ry="5" fill="#7a2a2a" /> : mood === 'think' ? <path d="M44 63h12" stroke="#7a2a2a" strokeWidth="2.4" strokeLinecap="round" /> : <path d="M41 60c4 7 14 7 18 0" fill={mood === 'win' ? '#7a2a2a' : 'none'} stroke="#7a2a2a" strokeWidth="2.4" strokeLinecap="round" />}
      {accessory === 'lunettes' && <g fill="rgba(180,230,255,.35)" stroke="#333" strokeWidth="2"><circle cx="40" cy="50" r="8" /><circle cx="60" cy="50" r="8" /><path d="M48 50h4" /></g>}
      {accessory === 'couronne' && <path d="M32 24l6-12 6 8 6-12 6 12 6-8 6 12z" fill="#ffd23f" stroke="#c99700" strokeWidth="1.5" />}
      {accessory === 'casque' && <g><path d="M24 46c0-20 12-30 26-30s26 10 26 30z" fill="#b8c2cc" stroke="#6b7782" strokeWidth="2" /><rect x="47" y="8" width="6" height="12" fill="#e63946" /></g>}
      <g fill={hero.skin}><circle cx="26" cy="96" r="6" /><circle cx="74" cy="96" r="6" /></g>
      {mood === 'win' && <g fill="#ffd23f"><path d="M12 30l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" /><path d="M88 22l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" /></g>}
    </motion.svg>
  );
}

export function Mimi({ size = 90, mood = 'happy' }: { size?: number; mood?: Mood }) {
  return (
    <motion.svg viewBox="0 0 100 100" width={size} height={size} animate={{ y: [0, -8, 0], rotate: mood === 'think' ? [0, -8, 8, 0] : [0, 4, -4, 0] }} transition={{ duration: 3, repeat: Infinity }} role="img" aria-label="Mimi, la petite étoile">
      <defs><radialGradient id="mimiG" cx="50%" cy="40%"><stop offset="0" stopColor="#fff3a0" /><stop offset="1" stopColor="#ffb703" /></radialGradient></defs>
      <path d="M50 6l12 26 28 3-21 19 6 28-25-14-25 14 6-28L10 35l28-3z" fill="url(#mimiG)" stroke="#e08a00" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="41" cy="48" r="3.4" fill="#3a2500" /><circle cx="59" cy="48" r="3.4" fill="#3a2500" />
      <path d={mood === 'surprise' ? 'M46 58a4 4 0 108 0a4 4 0 10-8 0' : 'M42 56c4 6 12 6 16 0'} fill={mood === 'surprise' ? '#8a4b00' : 'none'} stroke="#8a4b00" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="34" cy="56" r="3" fill="#ff9a8b" opacity=".6" /><circle cx="66" cy="56" r="3" fill="#ff9a8b" opacity=".6" />
    </motion.svg>
  );
}

export function MimiBubble({ children, mood = 'happy' }: { children: React.ReactNode; mood?: Mood }) {
  return (
    <div className="flex items-start gap-3" role="status" aria-live="polite">
      <Mimi size={72} mood={mood} />
      <div className="panel px-4 py-3 text-lg leading-snug max-w-xl relative">{children}</div>
    </div>
  );
}
