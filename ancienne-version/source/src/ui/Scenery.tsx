import { motion } from 'framer-motion';
import { useMemo } from 'react';

export function Stars({ n = 50 }: { n?: number }) {
  const stars = useMemo(() => Array.from({ length: n }, () => ({ x: Math.random() * 100, y: Math.random() * 60, s: 1 + Math.random() * 2.5, d: 2 + Math.random() * 4, delay: Math.random() * 4 })), [n]);
  return <div className="absolute inset-0 pointer-events-none" aria-hidden>{stars.map((s, i) => <span key={i} style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, animation: `twinkle ${s.d}s ${s.delay}s infinite` }} className="absolute rounded-full bg-white" />)}</div>;
}
export function Clouds() {
  return <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
    {[8, 22, 36].map((t, i) => <svg key={i} viewBox="0 0 200 70" className="absolute" style={{ top: `${t}%`, width: 160 + i * 50, opacity: 0.55, animation: `drift ${70 + i * 30}s linear ${-i * 25}s infinite` }}><path d="M30 60a22 22 0 010-44 28 28 0 0152-8 26 26 0 0136 20 20 20 0 010 32z" fill="#ffffff" /></svg>)}
  </div>;
}
export function Castle({ className = '' }: { className?: string }) {
  const win = (x: number, y: number, k: number) => <rect key={k} x={x} y={y} width="8" height="14" rx="4" fill="#ffe27a"><animate attributeName="opacity" values="1;.55;1" dur={`${2 + (k % 3)}s`} repeatCount="indefinite" /></rect>;
  return (
    <svg viewBox="0 0 400 300" className={className} aria-hidden>
      <defs><linearGradient id="wall" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#d9c8ff" /><stop offset="1" stopColor="#8f78e0" /></linearGradient><linearGradient id="roof" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff7aa8" /><stop offset="1" stopColor="#c2305f" /></linearGradient></defs>
      <rect x="130" y="110" width="140" height="170" fill="url(#wall)" />
      <rect x="70" y="150" width="60" height="130" fill="url(#wall)" /><rect x="270" y="150" width="60" height="130" fill="url(#wall)" />
      <rect x="168" y="50" width="64" height="70" fill="url(#wall)" />
      {[[70, 110, 60], [270, 110, 60]].map(([x, y, w], i) => <path key={i} d={`M${x - 6} ${y + 42} L${x + w / 2} ${y - 25} L${x + w + 6} ${y + 42}z`} fill="url(#roof)" />)}
      <path d="M162 58L200 -20l38 78z" fill="url(#roof)" />
      <path d="M200 -20V-48" stroke="#fff" strokeWidth="3" /><path d="M200 -48l26 8-26 8z" fill="#ffd23f"><animateTransform attributeName="transform" type="rotate" values="-4 200 -48;4 200 -48;-4 200 -48" dur="2s" repeatCount="indefinite" /></path>
      {win(190, 70, 1)}{win(92, 175, 2)}{win(292, 175, 3)}{win(160, 150, 4)}{win(232, 150, 5)}
      <path d="M170 280v-50a30 30 0 0160 0v50z" fill="#4b2e9a" /><path d="M200 230v50" stroke="#2f1a70" strokeWidth="3" />
      <g fill="url(#wall)">{[130, 150, 170, 190, 210, 230, 250].map((x) => <rect key={x} x={x} y="98" width="14" height="16" />)}</g>
    </svg>
  );
}
export function Hills() {
  return <svg viewBox="0 0 800 200" preserveAspectRatio="none" className="absolute bottom-0 left-0 w-full h-1/3" aria-hidden>
    <path d="M0 120C150 40 280 60 400 110s300 40 400-20v110H0z" fill="#3a2a9a" /><path d="M0 160C120 100 260 110 380 150s300 20 420-30v80H0z" fill="#2a8f6a" /><path d="M0 190C150 150 300 170 450 185s250-10 350-25v40H0z" fill="#1f7a56" />
  </svg>;
}
export function Sky({ children, reduce }: { children?: React.ReactNode; reduce?: boolean }) {
  return <div className={`relative w-full h-full overflow-hidden ${reduce ? 'reduce-motion' : ''}`} style={{ background: 'linear-gradient(#150b4d,#3b2a9a 45%,#ff8fb1 100%)' }}><Stars /><Clouds />{children}</div>;
}
export const Logo = ({ small = false }: { small?: boolean }) => (
  <motion.div initial={{ scale: 0.6, opacity: 0, y: -30 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 120, damping: 12 }} className="text-center select-none">
    <div className={`font-game font-extrabold tracking-wide ${small ? 'text-3xl' : 'text-5xl md:text-7xl'}`} style={{ color: '#ffe27a', textShadow: '0 4px 0 #b36b00, 0 10px 24px rgba(0,0,0,.45)' }}>SOUMAYA ACADEMY</div>
    <div className={`font-game ${small ? 'text-base' : 'text-xl md:text-3xl'}`} style={{ color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,.5)' }}>✦ La Quête des Savoirs ✦</div>
  </motion.div>
);
