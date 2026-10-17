// Supports visuels des questions (horloge, polygones, plan quadrillé, droite graduée), dessinés en SVG.
import type { Vis } from "@/data/kit";

const INK = "hsl(200 60% 14%)";
const GOLD = "hsl(40 90% 48%)";

function Clock({ h, m }: { h: number; m: number }) {
  const cx = 100, cy = 100;
  const hourAngle = ((h % 12) + m / 60) * 30;
  const minAngle = m * 6;
  const pt = (deg: number, r: number) => [cx + r * Math.sin((deg * Math.PI) / 180), cy - r * Math.cos((deg * Math.PI) / 180)];
  const [hx, hy] = pt(hourAngle, 48);
  const [mx, my] = pt(minAngle, 70);
  return (
    <svg viewBox="0 0 200 200" role="img" aria-label="Une horloge à aiguilles" className="h-44 w-44">
      <defs>
        <radialGradient id="clk" cx="50%" cy="40%" r="70%"><stop offset="0" stopColor="hsl(44 100% 96%)" /><stop offset="1" stopColor="hsl(40 70% 88%)" /></radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r="94" fill={GOLD} />
      <circle cx={cx} cy={cy} r="88" fill="url(#clk)" stroke="hsl(30 60% 30%)" strokeWidth="3" />
      {Array.from({ length: 60 }, (_, i) => {
        const [x1, y1] = pt(i * 6, i % 5 === 0 ? 76 : 82), [x2, y2] = pt(i * 6, 86);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={INK} strokeWidth={i % 5 === 0 ? 3 : 1} strokeLinecap="round" />;
      })}
      {Array.from({ length: 12 }, (_, i) => {
        const [x, y] = pt((i + 1) * 30, 62);
        return <text key={i} x={x} y={y + 6} textAnchor="middle" fontSize="18" fontWeight="800" fill={INK} fontFamily="Fraunces Variable, serif">{i + 1}</text>;
      })}
      <line x1={cx} y1={cy} x2={hx} y2={hy} stroke={INK} strokeWidth="7" strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={mx} y2={my} stroke="hsl(8 80% 48%)" strokeWidth="4" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="6" fill={INK} />
    </svg>
  );
}

const POLY: Record<string, string> = {
  triangle: "20,100 110,18 150,100",
  "rect-tri": "30,100 30,22 140,100",
  iso: "20,100 80,20 140,100",
  equi: "20,100 80,16 140,100",
  square: "35,22 125,22 125,100 35,100",
  rect: "15,30 145,30 145,100 15,100",
  rhombus: "80,14 145,60 80,106 15,60",
  pentagon: "80,14 142,56 120,108 40,108 18,56",
  hexagon: "50,16 110,16 142,60 110,104 50,104 18,60",
  quad: "20,92 52,22 140,38 124,104",
};

function Poly({ shape }: { shape: string }) {
  return (
    <svg viewBox="0 0 160 124" role="img" aria-label="Une figure géométrique" className="h-32 w-44">
      <polygon points={POLY[shape] ?? POLY.quad} fill="hsl(186 72% 78% / .75)" stroke="hsl(186 72% 24%)" strokeWidth="4" strokeLinejoin="round" />
      {(POLY[shape] ?? POLY.quad).split(" ").map((p, i) => { const [x, y] = p.split(",").map(Number); return <circle key={i} cx={x} cy={y} r="4.5" fill="hsl(8 86% 56%)" />; })}
    </svg>
  );
}

const EMOJI: [RegExp, string][] = [[/tour/i, "🏰"], [/puits/i, "⛲"], [/moulin/i, "🌾"], [/forge/i, "⚒️"], [/verger/i, "🍎"], [/phare/i, "🗼"]];
const emojiFor = (l: string) => EMOJI.find(([r]) => r.test(l))?.[1] ?? "📍";

function Plan({ cols, rows, items, title }: Extract<Vis, { t: "plan" }>) {
  const cell = 44, pad = 26;
  const W = cols * cell + pad, H = rows * cell + pad;
  const letters = "ABCDEFGHIJ";
  return (
    <figure className="max-w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={title ?? "Plan quadrillé"} style={{ width: Math.min(W * 1.15, 340) }} className="mx-auto h-auto">
        <rect x={pad} y={pad} width={cols * cell} height={rows * cell} rx="6" fill="hsl(96 55% 88%)" stroke="hsl(96 40% 36%)" strokeWidth="2" />
        {Array.from({ length: cols + 1 }, (_, i) => <line key={`v${i}`} x1={pad + i * cell} y1={pad} x2={pad + i * cell} y2={H} stroke="hsl(96 30% 55%)" strokeWidth="1.2" />)}
        {Array.from({ length: rows + 1 }, (_, i) => <line key={`h${i}`} x1={pad} y1={pad + i * cell} x2={W} y2={pad + i * cell} stroke="hsl(96 30% 55%)" strokeWidth="1.2" />)}
        {Array.from({ length: cols }, (_, i) => <text key={`c${i}`} x={pad + i * cell + cell / 2} y={17} textAnchor="middle" fontSize="15" fontWeight="800" fill={INK}>{letters[i]}</text>)}
        {Array.from({ length: rows }, (_, i) => <text key={`r${i}`} x={12} y={pad + i * cell + cell / 2 + 5} textAnchor="middle" fontSize="15" fontWeight="800" fill={INK}>{i + 1}</text>)}
        {items.map((it) => (
          <g key={it.label}>
            <text x={pad + (it.c - 1) * cell + cell / 2} y={pad + (it.r - 1) * cell + cell / 2 + 3} textAnchor="middle" fontSize="22">{emojiFor(it.label)}</text>
            <text x={pad + (it.c - 1) * cell + cell / 2} y={pad + (it.r - 1) * cell + cell - 5} textAnchor="middle" fontSize="9" fontWeight="700" fill={INK}>{it.label.replace(/^(le|la|l'|les) ?/i, "")}</text>
          </g>
        ))}
      </svg>
      {title && <figcaption className="mt-1 text-center text-xs font-bold text-muted-foreground">{title}</figcaption>}
    </figure>
  );
}

function NumLine({ min, max, marks }: Extract<Vis, { t: "numline" }>) {
  const W = 320, x0 = 20, x1 = W - 20;
  const px = (v: number) => x0 + ((v - min) / (max - min)) * (x1 - x0);
  const steps = 4;
  return (
    <svg viewBox={`0 0 ${W} 80`} role="img" aria-label="Une droite graduée" className="h-20 w-full max-w-sm">
      <line x1={x0} y1="44" x2={x1} y2="44" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      {Array.from({ length: steps + 1 }, (_, i) => {
        const v = min + ((max - min) * i) / steps;
        return <g key={i}><line x1={px(v)} y1="36" x2={px(v)} y2="52" stroke={INK} strokeWidth="2.5" /><text x={px(v)} y="70" textAnchor="middle" fontSize="12" fontWeight="800" fill={INK}>{v}</text></g>;
      })}
      {marks.filter((m) => m.label).map((m) => (
        <g key={m.v}>
          <path d={`M ${px(m.v)} 40 l -7 -14 h 14 z`} fill="hsl(8 86% 56%)" />
          <text x={px(m.v)} y="17" textAnchor="middle" fontSize="15" fontWeight="900" fill="hsl(8 86% 46%)">{m.label}</text>
        </g>
      ))}
    </svg>
  );
}

export function VisView({ vis }: { vis: Vis }) {
  return (
    <div className="my-3 flex justify-center rounded-2xl border-2 border-[hsl(44_60%_82%)] bg-white/70 p-3" data-testid="question-visual">
      {vis.t === "clock" && <Clock h={vis.h} m={vis.m} />}
      {vis.t === "poly" && <Poly shape={vis.shape} />}
      {vis.t === "plan" && <Plan {...vis} />}
      {vis.t === "numline" && <NumLine {...vis} />}
    </div>
  );
}
