// Scène 2.5D : plusieurs plans de profondeur qui réagissent au doigt, à la souris ou à l'inclinaison de l'appareil.
import { useEffect, useMemo, useRef, type CSSProperties, type ReactNode } from "react";
import { adventureAsset } from "@/data/adventure-assets";
import { mulberry32, hash } from "@/lib/engine";

const reduced = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** Fournit --px et --py (de -1 à 1) à tous les plans enfants. */
export function Stage({ children, className = "", style, strength = 1, tilt = true }: { children: ReactNode; className?: string; style?: CSSProperties; strength?: number; tilt?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced()) return;
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0, last = 0;
    const set = (x: number, y: number) => { tx = Math.max(-1, Math.min(1, x)) * strength; ty = Math.max(-1, Math.min(1, y)) * strength; };
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      set(((e.clientX - r.left) / r.width - 0.5) * 2, ((e.clientY - r.top) / r.height - 0.5) * 2);
    };
    const leave = () => set(0, 0);
    const orient = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      set(e.gamma / 28, (e.beta - 45) / 40);
    };
    const tick = (t: number) => {
      // Dérive lente pour que la scène vive même sans interaction
      const drift = Math.sin(t / 2600) * 0.18, driftY = Math.cos(t / 3300) * 0.12;
      cx += (tx + drift - cx) * 0.07; cy += (ty + driftY - cy) * 0.07;
      if (t - last > 16) { el.style.setProperty("--px", cx.toFixed(3)); el.style.setProperty("--py", cy.toFixed(3)); last = t; }
      raf = requestAnimationFrame(tick);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    window.addEventListener("deviceorientation", orient);
    const visible = () => { if (document.hidden) cancelAnimationFrame(raf); else raf = requestAnimationFrame(tick); };
    document.addEventListener("visibilitychange", visible);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave);
      window.removeEventListener("deviceorientation", orient); document.removeEventListener("visibilitychange", visible);
    };
  }, [strength]);
  return (
    <div ref={ref} className={`stage ${tilt ? "stage-tilt" : ""} ${className}`} style={{ "--px": 0, "--py": 0, ...style } as CSSProperties}>
      {children}
    </div>
  );
}

/** Un plan de profondeur : `depth` en pixels de déplacement maximal (négatif = recule en sens inverse). */
export function Layer({ depth, children, className = "", style }: { depth: number; children?: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div className={`layer ${className}`} style={{ transform: `translate3d(calc(var(--px) * ${depth}px), calc(var(--py) * ${depth * 0.6}px), 0)`, ...style }}>
      {children}
    </div>
  );
}

/** Lucioles et poussières de lumière, déterministes (sans Math.random à chaque rendu). */
export function Motes({ count = 14, seed = "motes", hue = 44, className = "" }: { count?: number; seed?: string; hue?: number; className?: string }) {
  const items = useMemo(() => {
    const r = mulberry32(hash(seed));
    return Array.from({ length: count }, () => ({ x: r() * 100, y: 20 + r() * 80, s: 3 + r() * 6, d: 5 + r() * 7, de: -r() * 9 }));
  }, [count, seed]);
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {items.map((m, i) => (
        <span key={i} className="mote" style={{ left: `${m.x}%`, top: `${m.y}%`, width: m.s, height: m.s, animationDuration: `${m.d}s`, animationDelay: `${m.de}s`, background: `hsl(${hue} 100% 80%)`, boxShadow: `0 0 ${m.s * 3}px ${m.s}px hsl(${hue} 100% 70% / .55)` }} />
      ))}
    </div>
  );
}

/** Scène illustrée en 3 plans : fond, lumière + particules, voile de premier plan. */
export function SceneArt({ image, className = "", hue = 44, focus = "50% 50%", children, strength = 1, rounded = true }: { image: string; className?: string; hue?: number; focus?: string; children?: ReactNode; strength?: number; rounded?: boolean }) {
  return (
    <Stage className={`scene ${rounded ? "rounded-[2rem]" : ""} ${className}`} strength={strength}>
      <Layer depth={-14} className="scene-bg">
        <img src={adventureAsset(image)} alt="" draggable={false} className="scene-img" style={{ objectPosition: focus }} />
      </Layer>
      <Layer depth={10} className="pointer-events-none">
        <div className="light-rays" style={{ "--hue": hue } as CSSProperties} />
      </Layer>
      <Layer depth={26} className="pointer-events-none"><Motes seed={image} hue={hue} /></Layer>
      <div aria-hidden className="scene-vignette" />
      {children}
    </Stage>
  );
}
