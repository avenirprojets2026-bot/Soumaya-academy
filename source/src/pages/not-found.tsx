import { Link } from "wouter";
import { Map as MapIcon } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60dvh] max-w-md flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-7xl font-black text-[hsl(var(--primary))]">404</p>
      <h1 className="font-display mt-2 text-2xl font-black text-[hsl(var(--secondary))]">Ce chemin s'est perdu dans les nuages</h1>
      <p className="mt-2 text-muted-foreground">Aucune île ne se trouve ici. Retourne à l’accueil pour repartir à l’aventure.</p>
      <Link href="/" className="btn-royal mt-6" data-testid="link-404-home">
        <MapIcon className="h-5 w-5" aria-hidden /> Retour à l’accueil
      </Link>
    </div>
  );
}
