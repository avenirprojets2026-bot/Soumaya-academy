import { BookOpen, Calculator, Clock, FlaskConical, Globe2, ScrollText, Feather } from "lucide-react";
import type { World } from "@/data/catalog";

const MAP = { book: BookOpen, calc: Calculator, clock: Clock, flask: FlaskConical, scroll: ScrollText, globe: Globe2, feather: Feather };
export function WorldIcon({ icon, className }: { icon: World["icon"]; className?: string }) {
  const I = MAP[icon];
  return <I className={className} aria-hidden />;
}
export const hsl = (hue: number, s = 62, l = 42) => `hsl(${hue} ${s}% ${l}%)`;
export const pinGradient = (hue: number) => `linear-gradient(160deg, hsl(${hue} 70% 56%), hsl(${hue} 70% 32%))`;
