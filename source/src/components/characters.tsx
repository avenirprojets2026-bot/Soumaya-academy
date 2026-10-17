// Soumaya (l'héroïne) et Mimi (son petit chat ailé). Une seule pose illustrée par personnage :
// les expressions passent par l'animation du corps (respiration, saut, inclinaison) et par une bulle.
import { adventureAsset, COMPANION, COMPANION_NAME, HEROINE } from "@/data/adventure-assets";
import { Layer } from "@/components/stage";

export type Mood = "idle" | "joy" | "think" | "surprise" | "sad" | "walk";

export function Soumaya({ mood = "idle", className = "", size = 260 }: { mood?: Mood; className?: string; size?: number }) {
  return (
    <div className={`char char-${mood} ${className}`} style={{ width: size * 0.585, height: size }} data-testid="char-soumaya" data-mood={mood}>
      <span aria-hidden className="char-shadow" />
      <img data-char="soumaya" src={adventureAsset(HEROINE)} alt="Soumaya, l'héroïne" draggable={false} width={527} height={900} className="char-img" />
    </div>
  );
}

export function Mimi({ mood = "idle", className = "", size = 120 }: { mood?: Mood; className?: string; size?: number }) {
  return (
    <div className={`char mimi mimi-${mood} ${className}`} style={{ width: size, height: size * 0.96 }} data-testid="char-mimi" data-mood={mood}>
      <img data-char="mimi" src={adventureAsset(COMPANION)} alt={`${COMPANION_NAME}, le petit chat ailé`} draggable={false} width={418} height={400} className="char-img" />
    </div>
  );
}

/** Bulle de parole (ne masque jamais un bouton : elle est dans le flux de la scène). */
export function Bubble({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p role="status" className={`bubble anim-pop ${className}`}>{children}</p>;
}

/** Le duo, posé en avant-plan d'une scène 2.5D (réagit à la profondeur). */
export function Duo({ mood = "idle", size = 250, speech }: { mood?: Mood; size?: number; speech?: string }) {
  return (
    <Layer depth={34} className="duo pointer-events-none">
      <div className="duo-inner">
        {speech && <Bubble className="duo-bubble">{speech}</Bubble>}
        <Mimi mood={mood} size={size * 0.46} className="duo-mimi" />
        <Soumaya mood={mood} size={size} />
      </div>
    </Layer>
  );
}
