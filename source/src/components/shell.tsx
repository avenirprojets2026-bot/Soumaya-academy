import { type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { AlertTriangle, Compass, Crown, Dumbbell, HardDrive, Home, Scroll, Star } from "lucide-react";
import { useProgress } from "@/lib/progress";

export function StarCount({ n, max, className = "" }: { n: number; max?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 font-extrabold ${className}`} data-testid="text-stars">
      <Star className="h-5 w-5 fill-[hsl(var(--gold))] text-[hsl(40_90%_42%)]" aria-hidden />
      <span>{n}{max !== undefined && <span className="opacity-60">/{max}</span>}</span>
      <span className="sr-only">étoiles</span>
    </span>
  );
}

export function Stars3({ value, size = "h-5 w-5" }: { value: number; size?: string }) {
  return (
    <span className="inline-flex gap-0.5" role="img" aria-label={`${value} étoile${value > 1 ? "s" : ""} sur 3`}>
      {[0, 1, 2].map((i) => (
        <Star key={i} aria-hidden className={`${size} ${i < value ? "fill-[hsl(var(--gold))] text-[hsl(40_90%_42%)]" : "fill-transparent text-[hsl(40_30%_72%)]"}`} />
      ))}
    </span>
  );
}

const TABS = [
  { href: "/", label: "Accueil", Icon: Home, id: "home", match: (p: string) => p === "/" },
  { href: "/aventure", label: "Aventure", Icon: Compass, id: "adventure", match: (p: string) => p.startsWith("/aventure") || p.startsWith("/monde") },
  { href: "/epreuves", label: "Épreuves", Icon: Crown, id: "exams", match: (p: string) => p.startsWith("/epreuve") },
  { href: "/entrainement", label: "S'entraîner", Icon: Dumbbell, id: "train", match: (p: string) => p.startsWith("/entrainement") },
  { href: "/carnet", label: "Carnet", Icon: Scroll, id: "book", match: (p: string) => p.startsWith("/carnet") || p.startsWith("/progression") || p.startsWith("/parent") || p.startsWith("/revision") },
];

/** Pendant un exercice, l'interface est « immersive » : la barre d'onglets disparaît. */
const IMMERSIVE = (p: string) => p.startsWith("/mission/") || p === "/revision/jouer" || /^\/epreuve\/[^/]+$/.test(p);

export function Shell({ children }: { children: ReactNode }) {
  const [path] = useLocation();
  const immersive = IMMERSIVE(path);
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <a href="#contenu" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 btn-royal z-50">Aller au contenu</a>
      <div className={`flex-1 ${immersive ? "" : "app-main"}`} id={immersive ? undefined : "contenu"}>{children}</div>
      {!immersive && (
        <nav className="tabbar" aria-label="Navigation principale">
          <ul>
            {TABS.map(({ href, label, Icon, id, match }) => (
              <li key={id}>
                <Link href={href} className="tab" aria-current={match(path) ? "page" : undefined} data-testid={`tab-${id}`}>
                  <Icon aria-hidden />
                  <span>{label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}

export function PageTitle({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <header className="px-4 pb-2 pt-[max(1rem,env(safe-area-inset-top))]">
      <h1 className="font-display text-3xl font-black leading-tight text-[hsl(var(--deep))] sm:text-4xl">{children}</h1>
      {sub && <p className="mt-1 text-[1.02rem] font-semibold text-muted-foreground">{sub}</p>}
    </header>
  );
}

export function StorageNotice({ compact = false }: { compact?: boolean }) {
  const { available, lastWriteOk, save } = useProgress();
  if (!available || !lastWriteOk) {
    return (
      <div role="alert" className="flex gap-3 rounded-2xl border-2 border-[hsl(8_78%_75%)] bg-[hsl(8_100%_96%)] p-4 text-sm" data-testid="status-storage-unavailable">
        <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" aria-hidden />
        <p><strong>Sauvegarde impossible sur ce navigateur.</strong> Tu peux jouer normalement, mais les étoiles disparaîtront en fermant la page (navigation privée ou stockage bloqué).</p>
      </div>
    );
  }
  return (
    <div className="flex gap-3 rounded-2xl border-2 border-[hsl(186_40%_80%)] bg-[hsl(186_60%_97%)] p-4 text-sm" data-testid="status-storage">
      <HardDrive className="h-5 w-5 shrink-0 text-[hsl(var(--secondary))]" aria-hidden />
      <p>
        <strong>Sauvegarde locale active</strong>
        {save.updatedAt && !compact && <> (dernière : {new Date(save.updatedAt).toLocaleString("fr-BE", { dateStyle: "short", timeStyle: "short" })})</>}.
        {" "}Les progrès restent sur cet appareil et ce navigateur et ne se synchronisent pas automatiquement. Tu peux les transférer manuellement depuis le Carnet. En navigation privée, ils peuvent être effacés.
      </p>
    </div>
  );
}
