import { mcq, tf, num, ord, mat, ecrit, oral, type BlancExam, type ExamSection, type Question, type Vis } from "../kit";

// Examens blancs « interdiocésains » P4 : 8 épreuves de 100 points (lire 20, langue 15, écrire 15, maths 25, éveil 15, écouter 5, parler 5).
// Documents originaux et non officiels de la famille ; corrigés recalculés et corrigés si besoin.

const P = <T extends Question>(pts: number, q: T): T => ({ ...q, pts });
const V = <T extends Question>(vis: Vis, q: T): T => ({ ...q, vis });
const A = (title: string, text: string, qs: Question[]): Question[] => qs.map((q) => ({ ...q, audio: { title, text } }));
const S = (id: ExamSection["id"], title: string, max: number, qs: Question[], ctx?: { title: string; body: string[] }): ExamSection => ({
  id,
  title,
  max,
  qs,
  ...(ctx ? { ctx } : {}),
});

const CRIT_ECRIT = [
  "Respect de la consigne (sujet, nombre de lignes, connecteurs demandés) : 3 points",
  "Organisation : un début, un événement, une fin : 4 points",
  "Cohérence et vocabulaire précis : 3 points",
  "Orthographe et accords : 3 points",
  "Ponctuation et lisibilité : 2 points",
];
const CRIT_ORAL = [
  "Présentation structurée (début, milieu, fin) : 2 points",
  "Articulation et débit : 1 point",
  "Vocabulaire précis : 1 point",
  "Réponse pertinente aux questions de l’adulte : 1 point",
];
const AIDE_ECRIT = ["Commence par présenter le lieu et les personnages.", "Utilise au moins trois connecteurs : d’abord, ensuite, puis, soudain, enfin.", "Relis-toi : majuscules, points, accords des noms et des verbes."];
const AIDE_ORAL = ["Prépare trois idées : ce que tu as appris, ce qui t’a surpris(e), ce que tu retiens.", "Parle lentement et regarde la personne qui t’écoute.", "Utilise « d’abord », « ensuite », « enfin »."];

// ───────────────────────── EXAMEN 1 — Le jardin de l’école ─────────────────────────
const EX1: BlancExam = {
  id: "blanc-1",
  title: "Examen blanc 1 : Le jardin de l’école",
  theme: "Le jardin de l’école",
  level: "P4",
  sections: [
    S("lire", "Lire et comprendre", 20, [
      P(4, mcq("Pourquoi les élèves de la classe de Lina créent-ils un jardin ?", "Pour transformer un coin de la cour en jardin", ["Pour agrandir le terrain de jeux", "Pour remplacer la cantine", "Pour vendre des radis au marché"],
        "Le texte dit que la classe « décide de transformer un coin de la cour en jardin ». Bravo si tu as retrouvé cette phrase !")),
      P(4, mcq("Que constatent les élèves après deux semaines ?", "De petites feuilles vertes poussent, mais certains plants semblent fatigués", ["Tous les plants ont disparu", "Les radis sont déjà prêts à être mangés", "Les abeilles ont détruit les fleurs"],
        "Lina remarque de petites feuilles vertes, « pourtant, certains plants semblent fatigués ». Le mot « pourtant » annonce le problème.")),
      P(4, mcq("Quelle solution les élèves trouvent-ils pour économiser l’eau ?", "Ils installent un récupérateur d’eau de pluie", ["Ils arrosent en plein midi", "Ils plantent seulement des fleurs", "Ils utilisent l’eau de la cantine"],
        "La classe installe « un récupérateur d’eau de pluie » et arrose le matin. Récupérer la pluie évite de gaspiller l’eau du robinet.")),
      P(4, mcq("Quel autre titre convient bien à ce texte ?", "Un jardin qui grandit à l’école", ["La course des radis", "Le concierge en vacances", "Une cantine sans repas"],
        "Un bon titre résume l’histoire : des élèves créent un jardin et le font pousser. Les autres titres parlent de choses absentes du texte.")),
      P(4, mcq("Quel groupe de mots appartient au champ lexical du jardin ?", "plants, terre, arroser", ["poisson, vague, plage", "stylo, cahier, règle", "train, gare, billet"],
        "Le champ lexical regroupe les mots d’un même thème. « Plants », « terre » et « arroser » parlent tous du jardin.")),
    ], {
      title: "Un jardin dans la cour",
      body: [
        "Au début du printemps, la classe de Lina décide de transformer un coin de la cour en jardin. Le concierge prête des outils et les élèves dessinent un plan. Ils choisissent des radis, des fraisiers et des fleurs pour les abeilles. Chaque équipe reçoit une tâche : retourner la terre, planter, arroser ou fabriquer des étiquettes.",
        "Après deux semaines, Lina remarque de petites feuilles vertes. Pourtant, certains plants semblent fatigués. La classe découvre que le sol reste trop sec sous le soleil de midi. Les élèves installent alors un récupérateur d’eau de pluie et décident d’arroser le matin. À la fin du trimestre, ils offrent leur première récolte à la cantine.",
      ],
    }),
    S("langue", "Maîtrise de la langue", 15, [
      P(3, mcq("Remplace le groupe sujet par un pronom : « Les élèves et leur enseignante observent le paysage. »", "Ils observent le paysage.", ["Elles observent le paysage.", "Nous observons le paysage.", "Il observe le paysage."],
        "Le groupe sujet est pluriel et contient des filles et des garçons : on utilise « Ils ». Le verbe s’accorde : ils observent.")),
      P(3, num("Mets cette phrase au pluriel : « Le petit animal traverse le chemin. »", ["Les petits animaux traversent les chemins.", "Les petits animaux traversent les chemins"],
        "Tous les mots du groupe changent : les petits animaux (aux), traversent (verbe en -ent), les chemins. Bien vu si tu n’as rien oublié !")),
      P(3, mcq("Quelle phrase est correcte au passé composé ?", "Nous avons préparé une affiche et nous avons choisi des images.", ["Nous avons préparer une affiche et nous avons choisi des images.", "Nous sommes préparé une affiche et nous sommes choisi des images.", "Nous préparions une affiche et nous choisissons des images."],
        "Le passé composé = auxiliaire avoir au présent + participe passé : « avons préparé », « avons choisi ». Ces verbes prennent « avoir ».")),
      P(3, mcq("Quelle phrase est bien ponctuée ?", "Pourquoi les enfants sont-ils contents ?", ["pourquoi les enfants sont ils contents.", "Pourquoi les enfants sont ils, contents !", "Pourquoi, les enfants sont-ils contents."],
        "Une question commence par une majuscule, relie le verbe et le pronom par un trait d’union (sont-ils) et se termine par un point d’interrogation.")),
      P(3, num("Complète par g, ge ou gu : une ba__e ; nous man__ons ; une __itare ; une __irlande. Écris les quatre mots séparés par des virgules.", ["bague, mangeons, guitare, guirlande", "bague,mangeons,guitare,guirlande", "bague ; mangeons ; guitare ; guirlande", "bague;mangeons;guitare;guirlande"],
        "On met « gu » devant e et i pour garder le son [g] (bague, guitare, guirlande). On met « ge » devant a, o pour garder le son « j » : mangeons.")),
    ]),
    S("ecrire", "Produire un texte", 15, [
      P(15, ecrit("Raconte une découverte faite dans un jardin (8 à 12 lignes). Prévois un début, un événement et une fin, et utilise au moins trois connecteurs temporels.", AIDE_ECRIT, CRIT_ECRIT,
        "Un matin, j’ai remarqué une petite tache rouge entre les feuilles. D’abord, j’ai cru que c’était une fleur. Ensuite, je me suis approchée doucement : c’était une coccinelle ! Puis elle s’est envolée sur mon doigt. Enfin, je l’ai remise sur une feuille de fraisier et j’ai raconté ma découverte à toute la classe.",
        "Une bonne production a un début (où, qui), un événement (la découverte) et une fin. Les connecteurs comme « d’abord », « ensuite » et « enfin » aident le lecteur à suivre.", 50)),
    ]),
    S("maths", "Mathématiques", 25, [
      P(3, num("48 plants sont répartis également dans 6 bacs. Combien de plants y a-t-il dans chaque bac ?", ["8", "8 plants"], "On partage : 48 ÷ 6 = 8, car 6 × 8 = 48. Il y a 8 plants par bac.")),
      P(3, num("Un rectangle mesure 9 m sur 4 m. Calcule son périmètre.", ["26", "26 m"], "Périmètre = (9 + 4) × 2 = 13 × 2 = 26. Le périmètre est le tour de la figure : 26 mètres.", "m")),
      P(3, num("Une jardinière achète 3 sachets de graines à 2,50 € chacun. Quel est le total à payer, en euros ?", ["7,50", "7.50", "7,5", "7.5"], "3 × 2,50 = 7,50. Astuce : 3 × 2 = 6 et 3 × 0,50 = 1,50, donc 6 + 1,50 = 7,50 €.", "€")),
      P(3, num("Calcule : 3 408 + 2 795", ["6203", "6 203"], "3 408 + 2 795 = 6 203. On additionne les unités : 8 + 5 = 13, on retient 1, et ainsi de suite.")),
      P(3, num("Calcule : 6 002 − 1 876", ["4126", "4 126"], "6 002 − 1 876 = 4 126. Vérifie en additionnant : 4 126 + 1 876 = 6 002.")),
      P(3, num("Calcule : 36 × 7", ["252"], "36 × 7 = 30 × 7 + 6 × 7 = 210 + 42 = 252.")),
      P(4, num("On trace un rectangle de 6 cm sur 3 cm. Quel est son périmètre, en centimètres ?", ["18", "18 cm"], "(6 + 3) × 2 = 9 × 2 = 18. Il suffit d’additionner les quatre côtés : 6 + 3 + 6 + 3 = 18 cm.", "cm")),
      P(3, num("Quelle est l’aire de ce rectangle de 6 cm sur 3 cm, en cm² ?", ["18", "18 cm²", "18 cm2"], "Aire = longueur × largeur = 6 × 3 = 18 cm². Attention : le périmètre se mesure en cm, l’aire en cm².", "cm²")),
    ]),
    S("eveil", "Sciences et sciences humaines", 15, [
      P(3, mcq("Quels sont trois besoins essentiels d’une plante ?", "L’eau, la lumière et l’air", ["Le sucre, le sel et le bruit", "Le vent, la neige et le sable", "La chaleur d’un four, l’huile et le feu"],
        "Une plante a besoin d’eau, de lumière et d’air (et de nutriments dans le sol) pour grandir.")),
      P(3, ord("Remets dans l’ordre le trajet de l’eau de pluie jusqu’au récupérateur.", ["La pluie tombe sur le toit", "L’eau coule dans la gouttière", "Elle descend dans le tuyau", "Elle arrive dans le récupérateur"],
        "L’eau suit la pente : toit, gouttière, tuyau, puis récupérateur. C’est la gravité qui la fait descendre.")),
      P(3, mcq("Où le soleil se lève-t-il ?", "À l’est", ["À l’ouest", "Au nord", "Au sud"], "Le soleil se lève à l’est et se couche à l’ouest. À midi, il est vers le sud (dans notre pays).")),
      P(3, mcq("Sur un plan, comment repérer le nord ?", "Il est indiqué par une flèche ou une rose des vents, souvent vers le haut du plan", ["Il est toujours à droite du plan", "Il se trouve là où il y a le plus d’arbres", "Il se trouve à l’endroit où l’on a le plus chaud"],
        "Sur un plan, une flèche N ou une rose des vents indique le nord. Une boussole montre aussi le nord avec son aiguille.")),
      P(3, tf("Les abeilles ont besoin des fleurs pour se nourrir.", true, "Les abeilles butinent le nectar et le pollen des fleurs. En plantant des fleurs, la classe aide aussi les abeilles.")),
    ]),
    S("ecouter", "Écouter", 5, A("Jardin", "Dans la cour de l’école, un jardin vient d’être créé. Une semaine sans pluie a desséché la terre. Les élèves remplissent un arrosoir avec l’eau conservée dans un récupérateur et arrosent tôt le matin. Les plantes reprennent de la vigueur.", [
      P(1, mcq("Où se passe l’histoire ?", "Dans la cour de l’école", ["Dans un parc public", "Dans une forêt", "Dans la cantine"], "Le texte commence par « Dans la cour de l’école ». Le lieu est donné dès la première phrase.")),
      P(1, mcq("Quel est le problème ?", "La terre est desséchée après une semaine sans pluie", ["Les plantes sont trop grandes", "Il pleut trop", "Le jardin est détruit"], "Le texte dit qu’une semaine sans pluie a desséché la terre. C’est le problème du jardin.")),
      P(1, mcq("Quelle est la solution ?", "Arroser avec l’eau conservée dans un récupérateur", ["Remplacer toutes les plantes", "Attendre un mois", "Couvrir la terre de sable"], "Les élèves utilisent l’eau de pluie conservée dans un récupérateur pour arroser.")),
      P(1, mcq("À quel moment de la journée les élèves arrosent-ils ?", "Tôt le matin", ["À midi", "Le soir", "La nuit"], "Les élèves arrosent « tôt le matin », quand il fait frais et que l’eau s’évapore moins.")),
      P(1, mcq("Que deviennent les plantes à la fin ?", "Elles reprennent de la vigueur", ["Elles meurent", "Elles se fanent encore plus", "Elles changent de couleur"], "La dernière phrase dit que les plantes reprennent de la vigueur : elles vont mieux grâce à l’arrosage.")),
    ])),
    S("parler", "Parler", 5, [
      P(5, oral("Présente oralement en une minute ce que tu as appris sur le jardin de l’école, puis réponds à deux questions d’un adulte.", AIDE_ORAL, CRIT_ORAL,
        "Une bonne présentation est organisée : on annonce le sujet, on donne deux ou trois informations précises, puis on conclut. Répondre calmement aux questions rapporte aussi des points.")),
    ]),
  ],
};

// ───────────────────────── EXAMEN 2 — Le mystère du musée ─────────────────────────
const EX2: BlancExam = {
  id: "blanc-2",
  title: "Examen blanc 2 : Le mystère du musée",
  theme: "Le mystère du musée",
  level: "P4",
  sections: [
    S("lire", "Lire et comprendre", 20, [
      P(4, mcq("Avec qui Noé visite-t-il le musée ?", "Avec sa grand-mère", ["Avec son grand frère", "Avec sa classe", "Avec le gardien"], "La première phrase dit que Noé visite un musée des inventions « avec sa grand-mère ».")),
      P(4, mcq("Pourquoi l’alarme retentit-elle ?", "Parce que c’est un exercice de sécurité", ["Parce qu’un voleur est entré", "Parce qu’un incendie a éclaté", "Parce que le musée ferme"], "Le gardien rassure les visiteurs : « il s’agit d’un exercice de sécurité ». Personne n’est en danger.")),
      P(4, mcq("Quel projet Noé prépare-t-il ?", "Comparer les inventions d’autrefois avec celles d’aujourd’hui et les présenter à sa classe", ["Construire une bicyclette géante", "Écrire un roman policier", "Réparer la radio du musée"], "À la fin du texte, Noé veut comparer les usages d’autrefois et d’aujourd’hui, puis présenter ses découvertes à sa classe.")),
      P(4, mcq("Quel autre titre irait bien à ce texte sur le musée ?", "Un samedi au musée des inventions", ["La bicyclette qui s’envole", "Noé perd son carnet", "Une radio en panne"], "Le titre doit résumer le texte : une visite au musée des inventions, un samedi. Les autres propositions inventent des faits.")),
      P(4, mcq("Quel groupe de mots appartient au champ lexical des inventions ?", "machine à écrire, radio, bicyclette", ["pomme, poire, banane", "neige, glace, hiver", "chat, chien, cheval"], "Ces trois objets sont des inventions citées dans le texte. Les autres groupes parlent d’autres thèmes.")),
    ], {
      title: "Au musée des inventions",
      body: [
        "Samedi, Noé visite un musée des inventions avec sa grand-mère. Dans la première salle, une ancienne bicyclette attire son attention : ses roues sont presque aussi grandes que lui ! Un guide explique que les objets exposés ont changé la vie quotidienne. Plus loin, Noé découvre une machine à écrire et une radio à boutons.",
        "Soudain, une alarme retentit. Tout le monde s’arrête. Le gardien rassure les visiteurs : il s’agit d’un exercice de sécurité. À la sortie, Noé note trois inventions dans son carnet. Il veut comparer leurs usages d’autrefois avec ceux d’aujourd’hui et présenter ses découvertes à sa classe.",
      ],
    }),
    S("langue", "Maîtrise de la langue", 15, [
      P(3, mcq("Remplace le groupe sujet par un pronom : « Noé note trois inventions dans son carnet. »", "Il note trois inventions dans son carnet.", ["Elle note trois inventions dans son carnet.", "Ils notent trois inventions dans son carnet.", "Nous notons trois inventions dans son carnet."], "Noé est un garçon, au singulier : on le remplace par « Il ». Le verbe reste « note ».")),
      P(3, num("Mets au pluriel : « Le vieux tableau est accroché dans la grande salle. »", ["Les vieux tableaux sont accrochés dans les grandes salles.", "Les vieux tableaux sont accrochés dans les grandes salles"], "Chaque mot change : les vieux tableaux, sont accrochés (accord du participe), dans les grandes salles.")),
      P(3, mcq("Quelle phrase de la visite est correcte au passé composé ?", "Les visiteurs ont écouté le guide et ont traversé la salle.", ["Les visiteurs ont écouter le guide et ont traversé la salle.", "Les visiteurs sont écouté le guide et sont traversé la salle.", "Les visiteurs écoutaient le guide et traversent la salle."], "Au passé composé, « écouter » et « traverser » se conjuguent avec avoir + participe passé en -é : ont écouté, ont traversé.")),
      P(3, mcq("Quelle phrase du musée est bien ponctuée ?", "« Où est la sortie ? » demande Noé.", ["« Où est la sortie » ? demande Noé.", "Où est la sortie, demande Noé !", "« Où est la sortie, » demande Noé ?"], "Le point d’interrogation reste dans les guillemets, car c’est la question qui est posée. Puis on écrit « demande Noé ».")),
      P(3, num("Complète par g, ge ou gu : un oran__e ; nous na__eons ; une ba__ette ; la __erre. Écris les quatre mots séparés par des virgules.", ["orange, nageons, baguette, guerre", "orange,nageons,baguette,guerre", "orange ; nageons ; baguette ; guerre", "orange;nageons;baguette;guerre"], "On écrit « ge » devant a ou o pour garder le son « j » : nageons. On écrit « gu » devant e ou i pour le son [g] : baguette, guerre.")),
    ]),
    S("ecrire", "Produire un texte", 15, [
      P(15, ecrit("Raconte une visite dans un musée où tu fais une découverte surprenante (8 à 12 lignes). Prévois un début, un événement et une fin, et utilise au moins trois connecteurs temporels.", AIDE_ECRIT, CRIT_ECRIT,
        "Samedi, j’ai visité un musée avec mon père. D’abord, nous avons regardé de vieux jouets en bois. Ensuite, j’ai découvert une boîte à musique cachée derrière une vitrine. Soudain, elle s’est mise à jouer une mélodie douce. Enfin, le guide m’a expliqué qu’elle avait plus de cent ans.",
        "Un bon récit situe le moment et le lieu, raconte la surprise et se termine clairement. Les connecteurs temporels montrent l’ordre des événements.", 50)),
    ]),
    S("maths", "Mathématiques", 25, [
      P(3, num("Une entrée coûte 7 € et un carnet 3 €. Combien paient en tout 4 enfants qui achètent chacun une entrée et un carnet ?", ["40", "40 €"], "Un enfant paie 7 + 3 = 10 €. Pour 4 enfants : 4 × 10 = 40 €.", "€")),
      P(3, num("Un musée ouvre à 9 h 30 et ferme à 17 h. Combien de temps reste-t-il ouvert ? (écris par exemple 3 h 15)", ["7 h 30", "7h30", "7 h 30 min", "7 heures 30"], "De 9 h 30 à 10 h : 30 min, de 10 h à 17 h : 7 h. Au total 7 h 30 min.")),
      P(3, num("Une exposition accueille 135 personnes le matin et 187 l’après-midi. Combien de visiteurs en tout ?", ["322", "322 visiteurs"], "135 + 187 = 322. Astuce : 135 + 200 = 335, puis on enlève 13 : 322.")),
      P(3, num("Quelle est la somme de 3 408 et 2 795 ?", ["6203", "6 203"], "3 408 + 2 795 = 6 203. N’oublie pas les retenues quand tu additionnes.")),
      P(3, num("Quelle est la différence entre 6 002 et 1 876 ?", ["4126", "4 126"], "6 002 − 1 876 = 4 126. On peut vérifier : 4 126 + 1 876 = 6 002.")),
      P(3, num("Quel est le produit de 36 par 7 ?", ["252"], "36 × 7 = 210 + 42 = 252.")),
      P(4, num("Quelle longueur de ruban faut-il, en centimètres, pour entourer exactement un rectangle de 6 cm sur 3 cm ?", ["18", "18 cm"], "Le ruban fait le tour du rectangle : 6 + 3 + 6 + 3 = 18 cm, soit (6 + 3) × 2.", "cm")),
      P(3, num("Combien de carrés de 1 cm de côté faut-il pour recouvrir entièrement un rectangle de 6 cm sur 3 cm ?", ["18", "18 carrés"], "Il y a 3 rangées de 6 carrés : 3 × 6 = 18 carrés. C’est l’aire : 18 cm².")),
    ]),
    S("eveil", "Sciences et sciences humaines", 15, [
      P(3, mat("Relie chaque objet ancien à son équivalent actuel.", [["Machine à écrire", "Ordinateur"], ["Lampe à huile", "Ampoule électrique"], ["Téléphone à cadran", "Smartphone"], ["Lettre sur papier", "Courriel"]], "Chaque invention a été remplacée par un objet plus récent qui rend le même service : écrire, éclairer, téléphoner, envoyer un message.")),
      P(3, ord("Classe ces événements du plus ancien au plus récent.", ["L’invention de l’écriture (Antiquité)", "L’époque des châteaux forts (Moyen Âge)", "L’invention de l’imprimerie (Temps modernes)", "L’invention de la bicyclette (Époque contemporaine)"], "On suit la frise : Antiquité, Moyen Âge, Temps modernes, Époque contemporaine. La bicyclette date du XIXe siècle, donc de l’époque contemporaine.")),
      P(3, mcq("Sur un plan du musée, la flèche N est dirigée vers le haut. Que signifie-t-elle ?", "Le haut du plan est orienté vers le nord", ["Le haut du plan est le côté de l’entrée", "Le haut du plan est orienté vers le sud", "La flèche indique la sortie de secours"], "La lettre N veut dire nord. Elle te permet d’orienter le plan comme le paysage réel.")),
      P(3, mcq("Tu te tournes vers le nord. De quel côté se trouve l’est ?", "À ta droite", ["À ta gauche", "Devant toi", "Derrière toi"], "Face au nord, l’est est à droite, l’ouest à gauche et le sud derrière. On peut retenir : Nord, Est, Sud, Ouest dans le sens des aiguilles d’une montre.")),
      P(3, mcq("À quoi sert un exercice d’alarme dans un lieu public ?", "À apprendre à sortir calmement en cas de vrai danger", ["À faire peur aux visiteurs", "À fermer le musée plus tôt", "À tester la radio ancienne"], "Un exercice permet de s’entraîner à garder son calme et à connaître le chemin de sortie et le point de rassemblement.")),
    ]),
    S("ecouter", "Écouter", 5, A("Musée", "Au musée des inventions, un groupe observe une ancienne radio. Une alarme se déclenche pendant un exercice de sécurité. Le guide accompagne calmement les visiteurs vers la sortie et explique le point de rassemblement.", [
      P(1, mcq("Où se passe la scène du musée ?", "Au musée des inventions", ["À la bibliothèque", "Dans une gare", "Dans une école"], "Le texte commence par « Au musée des inventions ». Le lieu est donné tout de suite.")),
      P(1, mcq("Quel objet le groupe observe-t-il ?", "Une ancienne radio", ["Une vieille horloge", "Une machine à écrire", "Une bicyclette"], "Le groupe observe « une ancienne radio » au début du récit.")),
      P(1, mcq("Quel problème interrompt la visite ?", "Une alarme se déclenche", ["Un visiteur se perd", "La lumière s’éteint", "Le guide est absent"], "Une alarme se déclenche pendant un exercice de sécurité : c’est l’événement qui interrompt la visite.")),
      P(1, mcq("Comment le guide résout-il la situation ?", "Le guide accompagne calmement les visiteurs vers la sortie", ["Les visiteurs courent partout", "Le groupe reste dans la salle", "On éteint la radio"], "Le guide reste calme et conduit les visiteurs à la sortie, jusqu’au point de rassemblement.")),
      P(1, tf("Selon le texte, l’alarme est causée par un vrai incendie.", false, "Le texte parle d’un exercice de sécurité, donc ce n’est pas un vrai danger. L’affirmation est fausse.")),
    ])),
    S("parler", "Parler", 5, [
      P(5, oral("Présente oralement en une minute une invention ancienne et explique en quoi elle a changé la vie, puis réponds à deux questions d’un adulte.", AIDE_ORAL, CRIT_ORAL,
        "Choisis une invention, dis à quoi elle servait, compare avec aujourd’hui. Une conclusion courte rend ta présentation claire.")),
    ]),
  ],
};

// ───────────────────────── EXAMEN 3 — Expédition à la rivière ─────────────────────────
const EX3: BlancExam = {
  id: "blanc-3",
  title: "Examen blanc 3 : Expédition à la rivière",
  theme: "Expédition à la rivière",
  level: "P4",
  sections: [
    S("lire", "Lire et comprendre", 20, [
      P(4, mcq("Quelle est la mission scientifique du groupe de Maya ?", "Observer les animaux sans les déranger et mesurer la température de l’eau", ["Pêcher le plus de poissons possible", "Construire un pont sur la rivière", "Dessiner la carte du village"], "Le texte indique que le groupe doit « observer les animaux sans les déranger et mesurer la température de l’eau ».")),
      P(4, mcq("Pourquoi les élèves doivent-ils porter des gants ?", "Pour ramasser les déchets en sécurité", ["Pour avoir moins froid aux mains", "Pour toucher les libellules", "Pour décorer leur tenue"], "L’enseignante rappelle qu’il faut des gants pour ramasser les déchets en sécurité, afin d’éviter de se blesser ou de se salir.")),
      P(4, mcq("Quel message Maya veut-elle transmettre avec son affiche ?", "Il faut réduire les déchets pour protéger la rivière", ["Il faut interdire de visiter la rivière", "Il faut pêcher davantage", "Il faut construire plus de routes"], "Maya prépare une affiche pour convaincre les familles de réduire les déchets et de protéger la rivière.")),
      P(4, mcq("Quel autre titre irait bien à ce texte sur la rivière ?", "Des élèves au secours de la rivière", ["Le grand match de football", "Le trésor du pirate", "La neige sur la montagne"], "Ce titre résume l’histoire : des élèves observent la rivière, ramassent des déchets et sensibilisent leurs familles.")),
      P(4, mcq("Quel groupe de mots appartient au champ lexical de la rivière ?", "berge, libellule, courant", ["tableau, craie, bureau", "four, casserole, assiette", "ballon, filet, but"], "Berge, libellule et courant sont des mots liés à la rivière et à son milieu de vie.")),
    ], {
      title: "Une sortie scientifique",
      body: [
        "Maya participe à une sortie scientifique près d’une rivière. Son groupe doit observer les animaux sans les déranger et mesurer la température de l’eau. Les enfants aperçoivent des libellules et des traces d’oiseaux sur la berge. Au milieu du parcours, ils découvrent plusieurs emballages abandonnés.",
        "Leur enseignante leur rappelle qu’il faut porter des gants pour ramasser les déchets en sécurité. Les élèves classent ensuite leurs observations dans un tableau. Ils comprennent que la rivière abrite de nombreux êtres vivants et que les gestes humains peuvent protéger ou fragiliser ce milieu. De retour à l’école, Maya prépare une affiche pour convaincre les familles de réduire les déchets.",
      ],
    }),
    S("langue", "Maîtrise de la langue", 15, [
      P(3, mcq("Remplace le groupe sujet par un pronom : « Les libellules volent au-dessus de l’eau. »", "Elles volent au-dessus de l’eau.", ["Ils volent au-dessus de l’eau.", "Elle vole au-dessus de l’eau.", "Nous volons au-dessus de l’eau."], "« Les libellules » est féminin pluriel : on emploie « Elles ». Le verbe s’accorde : elles volent.")),
      P(3, num("Mets au pluriel : « La libellule bleue se pose sur le roseau. »", ["Les libellules bleues se posent sur les roseaux.", "Les libellules bleues se posent sur les roseaux"], "On accorde le déterminant, le nom, l’adjectif et le verbe : les libellules bleues se posent sur les roseaux. Attention : « roseau » prend un x au pluriel.")),
      P(3, mcq("Quelle phrase sur la sortie est correcte au passé composé ?", "Maya a ramassé un emballage et a rangé ses gants.", ["Maya a ramasser un emballage et a ranger ses gants.", "Maya est ramassé un emballage et est rangé ses gants.", "Maya ramassait un emballage et range ses gants."], "Avec « avoir », le participe passé de verbes en -er se termine par -é : a ramassé, a rangé.")),
      P(3, mcq("Quelle phrase de la rivière est bien ponctuée ?", "« Combien d’animaux as-tu vus ? » demande l’enseignante.", ["Combien d’animaux as-tu vus, demande l’enseignante.", "« Combien d’animaux as-tu vus » ? demande l’enseignante.", "combien d’animaux as-tu vus ? demande l’enseignante"], "On met une majuscule, un point d’interrogation à l’intérieur des guillemets, puis la précision « demande l’enseignante » avec un point final.")),
      P(3, num("Complète par ou ou où : ___ est la rivière ? Veux-tu marcher ___ rester ici ? Voici le sentier ___ nous passons. Écris les trois mots séparés par des virgules.", ["où, ou, où", "où,ou,où", "où ; ou ; où", "où;ou;où"], "« Où » avec accent indique un lieu. « Ou » sans accent propose un choix et peut se remplacer par « ou bien ».")),
    ]),
    S("ecrire", "Produire un texte", 15, [
      P(15, ecrit("Raconte une sortie au bord de l’eau pendant laquelle tu fais une découverte (8 à 12 lignes). Prévois un début, un événement et une fin, et utilise au moins trois connecteurs temporels.", AIDE_ECRIT, CRIT_ECRIT,
        "Mercredi, notre classe est allée au bord de la rivière. D’abord, nous avons mesuré la température de l’eau. Ensuite, j’ai aperçu un martin-pêcheur bleu sur une branche. Soudain, il a plongé et a attrapé un petit poisson. Enfin, nous avons noté notre découverte dans le carnet et nous sommes rentrés heureux.",
        "Le texte doit avoir un début (où, quand), un événement (la découverte) et une fin. Les connecteurs temporels guident le lecteur dans le temps.", 50)),
    ]),
    S("maths", "Mathématiques", 25, [
      P(3, num("Un trajet comporte 2 km 350 m puis 1 km 750 m. Quelle est la distance totale, en mètres ?", ["4100", "4 100", "4100 m", "4 100 m"], "2 350 m + 1 750 m = 4 100 m. Tu peux aussi calculer 2 km + 1 km = 3 km, puis 350 + 750 = 1 100 m, soit 4 100 m.", "m")),
      P(3, num("Un carré a un côté de 7 cm. Quel est son périmètre, en centimètres ?", ["28", "28 cm"], "Un carré a 4 côtés égaux : 4 × 7 = 28 cm.", "cm")),
      P(3, num("Quelle est l’aire de ce carré de 7 cm de côté, en cm² ?", ["49", "49 cm²", "49 cm2"], "Aire du carré = côté × côté = 7 × 7 = 49 cm².", "cm²")),
      P(3, num("24 élèves forment des équipes de 4. Combien d’équipes obtient-on ?", ["6", "6 équipes"], "24 ÷ 4 = 6, car 4 × 6 = 24. On obtient 6 équipes.")),
      P(3, num("Combien font 2 795 + 3 408 ?", ["6203", "6 203"], "On peut changer l’ordre d’une addition : 2 795 + 3 408 = 6 203.")),
      P(3, num("Combien font 6 002 − 1 876 ?", ["4126", "4 126"], "6 002 − 1 876 = 4 126. Pour vérifier, additionne 4 126 + 1 876 : tu retrouves 6 002.")),
      P(3, num("Combien font 7 × 36 ?", ["252"], "7 × 36 = 7 × 30 + 7 × 6 = 210 + 42 = 252.")),
      P(4, num("Un rectangle a pour dimensions 6 cm et 3 cm. Quel est son périmètre, en centimètres ?", ["18", "18 cm"], "On ajoute les quatre côtés : 6 + 3 + 6 + 3 = 18 cm.", "cm")),
    ]),
    S("eveil", "Sciences et sciences humaines", 15, [
      P(3, ord("Remets dans l’ordre cette chaîne alimentaire de la rivière (qui est mangé par qui).", ["Les algues", "Un têtard", "Un héron"], "Une chaîne alimentaire commence par un végétal (algues), mangé par un animal herbivore (têtard), lui-même mangé par un prédateur (héron).")),
      P(3, mcq("Quel geste protège les cours d’eau ?", "Jeter ses déchets dans les poubelles de tri", ["Laver sa voiture dans la rivière", "Laisser ses emballages sur la berge", "Verser de l’huile dans l’eau"], "Trier et jeter correctement les déchets évite que des matières polluantes arrivent dans l’eau.")),
      P(3, mcq("Sur un plan où le nord est en haut, la rivière coule du haut vers le bas. Vers quel point cardinal coule-t-elle ?", "Vers le sud", ["Vers le nord", "Vers l’est", "Vers l’ouest"],
        "Quand le nord est en haut du plan, le sud est en bas. Une rivière qui descend vers le bas du plan coule donc vers le sud.")),
      P(3, mat("Relie l’état de l’eau à l’exemple.", [["Solide", "Un glaçon"], ["Liquide", "L’eau de la rivière"], ["Gazeux", "La vapeur d’eau"]], "L’eau existe sous trois états : solide (glace), liquide (eau) et gazeux (vapeur).")),
      P(3, mat("Relie chaque déchet à la bonne poubelle.", [["Bouteille en plastique", "Sac bleu (PMC)"], ["Journal", "Papiers-cartons"], ["Épluchures", "Déchets organiques"]], "Le tri permet de recycler : les plastiques, métaux et cartons à boissons vont au PMC, le papier à part, les épluchures aux déchets organiques.")),
    ]),
    S("ecouter", "Écouter", 5, A("Rivière", "Près de la rivière, les élèves découvrent des papiers et des bouteilles. Ils préviennent leur enseignante. Avec des gants et sous sa surveillance, ils ramassent les déchets non dangereux et les trient dans les poubelles adaptées.", [
      P(1, mcq("Où se passe la scène près de l’eau ?", "Près de la rivière", ["Dans une forêt", "Dans un musée", "Sur la plage"], "Le texte commence par « Près de la rivière » : c’est le lieu.")),
      P(1, mcq("Quel problème les élèves découvrent-ils ?", "Des papiers et des bouteilles ont été abandonnés", ["La rivière déborde", "Les élèves sont perdus", "Il y a trop de poissons"], "Les élèves découvrent des papiers et des bouteilles : ce sont les déchets qui posent problème.")),
      P(1, mcq("Qui les élèves préviennent-ils ?", "Leur enseignante", ["Un pêcheur", "Le directeur", "Le guide du musée"], "Ils préviennent leur enseignante avant de toucher aux déchets.")),
      P(1, mcq("Quelle solution les élèves mettent-ils en œuvre ?", "Ramasser les déchets avec des gants et les trier", ["Cacher les déchets sous des feuilles", "Jeter les déchets dans l’eau", "Partir sans rien faire"], "Les élèves portent des gants, ramassent sous surveillance et trient les déchets dans les bonnes poubelles.")),
      P(1, tf("Les élèves ramassent aussi les déchets dangereux.", false, "Le texte précise qu’ils ramassent les déchets non dangereux. Pour les autres, il faut un adulte.")),
    ])),
    S("parler", "Parler", 5, [
      P(5, oral("Présente oralement en une minute deux gestes pour protéger une rivière et explique pourquoi ils sont utiles, puis réponds à deux questions d’un adulte.", AIDE_ORAL, CRIT_ORAL,
        "Annonce les deux gestes, explique l’effet de chacun sur la rivière et ses habitants, puis conclus par un message clair.")),
    ]),
  ],
};

// ───────────────────────── EXAMEN 4 — La boîte aux souvenirs ─────────────────────────
const AUDIO4 = "Un dimanche matin, Inès traversait le parc avec son grand frère Sami. Le soleil éclairait les bancs encore humides de rosée. Près d’un massif de fleurs, Inès aperçut une petite boîte métallique bleue, posée sous un arbre.\n\nElle l’ouvrit avec précaution. À l’intérieur se trouvaient trois photographies anciennes, une carte postale et une montre arrêtée. « Quelqu’un doit y tenir beaucoup », dit Sami. Sur le couvercle, une étiquette portait ces mots : « André Martin, maison du jardinier ».\n\nLes deux enfants se rendirent à la petite maison située à l’entrée du parc. Un monsieur aux cheveux blancs leur ouvrit. En voyant la boîte, ses yeux s’illuminèrent. « Je la cherchais depuis hier ! » s’exclama-t-il. Il expliqua que les photographies représentaient sa famille et que la montre avait appartenu à son père.\n\nMonsieur André remercia chaleureusement les enfants. Il leur offrit une pomme de son jardin. Sur le chemin du retour, Inès sourit : elle était heureuse d’avoir rendu à quelqu’un un objet précieux.";

const EX4: BlancExam = {
  id: "blanc-4",
  title: "Examen blanc 4 : La boîte aux souvenirs",
  theme: "La boîte aux souvenirs",
  level: "P4",
  sections: [
    S("lire", "Lire et comprendre", 20, [
      P(4, mcq("Où Léo accompagne-t-il son grand-père le dimanche ?", "Dans le grenier de la vieille ferme", ["Dans la cave de l’école", "Dans l’étable", "Dans le salon"], "La première phrase indique que Léo accompagne son grand-père « dans le grenier de la vieille ferme ».")),
      P(4, mcq("À quoi servait la lanterne rouillée autrefois ?", "À éclairer l’étable", ["À décorer le salon", "À chauffer la maison", "À guider les bateaux"], "Grand-père dit que la lanterne « éclairait l’étable » quand il avait l’âge de Léo.")),
      P(4, mcq("Que signifie le mot « délicatesse » dans « avec délicatesse » ?", "Avec douceur et attention", ["Avec rapidité", "Avec colère", "Avec bruit"], "Tourner les pages avec délicatesse, c’est faire très attention pour ne pas abîmer de vieilles photos.")),
      P(4, mcq("Qui est le petit garçon qui tient un agneau sur la photo ?", "C’est le grand-père quand il était enfant", ["C’est Léo", "C’est le père de Léo", "C’est le voisin"], "Le texte dit : « c’est grand-père ! ». Cela montre que la photo est très ancienne.")),
      P(4, mcq("Pourquoi Léo prépare-t-il de petites étiquettes ?", "Pour expliquer l’histoire de chaque souvenir", ["Pour vendre les objets", "Pour cacher les photos", "Pour décorer la caisse"], "Léo écrit des étiquettes pour que les visiteurs comprennent l’histoire de chaque objet de l’exposition.")),
    ], {
      title: "Le grenier de grand-père",
      body: [
        "Le dimanche, Léo accompagne son grand-père dans le grenier de la vieille ferme. L’air sent la poussière et le bois ciré. Entre deux malles, le garçon découvre une lanterne rouillée et un album de photographies jaunies. « Cette lanterne éclairait l’étable quand j’avais ton âge », raconte grand-père en souriant.",
        "Léo tourne les pages de l’album avec délicatesse. Sur une photo, un petit garçon tient fièrement un agneau dans ses bras : c’est grand-père ! Ils décident de ranger les objets dans une caisse propre, puis de les exposer dans le salon. Léo prépare même de petites étiquettes pour expliquer l’histoire de chaque souvenir. Ce soir-là, toute la famille vient admirer l’exposition.",
      ],
    }),
    S("langue", "Maîtrise de la langue", 15, [
      P(3, mcq("Remplace le groupe « la lanterne » par un pronom : « Léo range la lanterne. »", "Léo la range.", ["Léo le range.", "Léo lui range.", "Léo les range."], "« La lanterne » est féminin singulier et complète le verbe : on la remplace par « la ». Le pronom se place devant le verbe.")),
      P(3, num("Mets au pluriel : « Le bijou précieux brille sous la lampe. »", ["Les bijoux précieux brillent sous les lampes.", "Les bijoux précieux brillent sous les lampes"], "Bijou prend un x au pluriel (bijoux). « Précieux » reste précieux, le verbe devient « brillent » et lampe devient lampes.")),
      P(3, mcq("Autrefois, nous (jouer) dans le grenier. Quelle est la bonne forme à l’imparfait ?", "jouions", ["jouons", "jouerons", "jouaient"], "L’imparfait de « jouer » avec « nous » se termine par -ions : nous jouions. On l’emploie pour une habitude du passé.")),
      P(3, num("Écris le verbe au futur simple : « Demain, tu (prendre) l’album. » Réponds par le verbe seul.", ["prendras", "tu prendras"], "Le futur de « prendre » est « prendras » avec « tu » : on garde le radical prend- et on ajoute -ras.")),
      P(3, mcq("Quel mot appartient à la famille du mot « souvenir » ?", "se souvenir", ["souvent", "souterrain", "soulever"], "Se souvenir vient du même mot que souvenir. Les autres mots ressemblent seulement par le début.")),
    ]),
    S("ecrire", "Produire un texte", 15, [
      P(15, ecrit("Décris un objet précieux de ta famille et raconte son histoire (8 à 12 lignes). Prévois un début, un événement et une fin, et utilise au moins trois connecteurs temporels.", AIDE_ECRIT, CRIT_ECRIT,
        "Dans ma famille, il y a une petite horloge en bois que mon arrière-grand-père a fabriquée. D’abord, il l’a offerte à sa fiancée. Ensuite, elle a voyagé dans plusieurs maisons. Un jour, elle s’est arrêtée, mais mon père l’a réparée. Enfin, elle a retrouvé sa place sur la cheminée et elle sonne chaque heure.",
        "Un bon texte décrit l’objet, raconte une étape de son histoire et se termine clairement. Utilise des mots précis pour la description.", 50)),
    ]),
    S("maths", "Mathématiques", 25, [
      P(2, num("Dans une école, 96 crayons sont rangés dans des boîtes de 12. Combien de boîtes remplit-on ?", ["8", "8 boîtes"], "96 ÷ 12 = 8, car 12 × 8 = 96. On remplit 8 boîtes.")),
      P(1, num("Écris en chiffres : soixante-trois-mille-quatre-cent-neuf.", ["63409", "63 409"], "Soixante-trois-mille = 63 000, plus quatre-cent-neuf = 409. Cela donne 63 409.")),
      P(1, num("Écris en chiffres : sept unités et trente-cinq centièmes.", ["7,35", "7.35"], "7 unités, puis 35 centièmes : 7 + 0,35 = 7,35.")),
      P(1, mcq("Dans 483 205, quelle est la valeur du chiffre 8 ?", "80 000", ["8 000", "800 000", "8"], "Le 8 est au rang des dizaines de mille : il vaut 8 × 10 000 = 80 000.")),
      P(1, mcq("Quelle est la décomposition de 50 604 ?", "50 000 + 600 + 4", ["50 000 + 60 + 4", "5 000 + 600 + 4", "50 000 + 6 000 + 4"], "50 604 = 5 dizaines de mille, 0 unité de mille, 6 centaines, 0 dizaine, 4 unités : 50 000 + 600 + 4.")),
      P(2, num("Complète avec <, > ou = : 8,09 ___ 8,9 ; 120,50 ___ 120,5 ; 0,75 ___ 0,7 ; 3/4 ___ 0,75. Écris les quatre signes séparés par des points-virgules.", ["< ; = ; > ; =", "<;=;>;=", "<, =, >, =", "<,=,>,="], "8,09 < 8,9 ; 120,50 = 120,5 (un zéro final ne change rien) ; 0,75 > 0,7 ; 3/4 = 0,75.")),
      P(2, ord("Range ces nombres du plus petit au plus grand : 4,08 ; 4,8 ; 4,18 ; 4,008.", ["4,008", "4,08", "4,18", "4,8"], "On compare les dixièmes puis les centièmes : 4,008 < 4,08 < 4,18 < 4,8.")),
      P(1, num("Complète la suite : 125 ; 150 ; 175 ; ___ ; ___. Écris les deux nombres séparés par un point-virgule.", ["200 ; 225", "200;225", "200, 225", "200,225"], "La règle est + 25 : 175 + 25 = 200, puis 225.")),
      P(1, num("Complète la suite : 1,2 ; 2,4 ; 4,8 ; ___ ; ___. Écris les deux nombres séparés par un point-virgule.", ["9,6 ; 19,2", "9,6;19,2", "9.6 ; 19.2", "9.6;19.2"], "La règle est × 2 : 4,8 × 2 = 9,6 puis 9,6 × 2 = 19,2.")),
      P(1, num("Pose et effectue : 7 846 + 2 975", ["10821", "10 821"], "7 846 + 2 975 = 10 821. Additionne colonne par colonne en gardant les retenues.")),
      P(1, num("Pose et effectue : 9 000 − 3 468", ["5532", "5 532"], "9 000 − 3 468 = 5 532. Vérification : 5 532 + 3 468 = 9 000.")),
      P(1, num("Pose et effectue : 248 × 16", ["3968", "3 968"], "248 × 16 = 248 × 10 + 248 × 6 = 2 480 + 1 488 = 3 968.")),
      P(1, num("Pose et effectue : 936 ÷ 8", ["117"], "936 ÷ 8 = 117, car 117 × 8 = 936.")),
      P(3, num("Un musée reçoit 6 classes de 24 élèves. Chaque billet coûte 4 €. Combien le musée encaisse-t-il, en euros ?", ["576", "576 €"], "Étape 1 : 6 × 24 = 144 élèves. Étape 2 : 144 × 4 = 576 €.", "€")),
      P(1, num("Calcule mentalement 25 × 12.", ["300"], "25 × 12 = 25 × 4 × 3 = 100 × 3 = 300. Regrouper pour obtenir 100 est une bonne astuce.")),
      P(2, mat("Relie chaque fraction ou nombre à son égal.", [["1/2", "5/10"], ["3/4", "75/100"], ["2/5", "4/10"], ["0,25", "25/100"]], "On rend le dénominateur égal : 1/2 = 5/10, 3/4 = 75/100, 2/5 = 4/10, et 0,25 = 25 centièmes.")),
      P(2, num("Une bibliothèque possède 1 250 livres. Elle en reçoit 175, puis en prête 328. Combien de livres reste-t-il sur ses rayons ?", ["1097", "1 097", "1097 livres", "1 097 livres"], "1 250 + 175 = 1 425, puis 1 425 − 328 = 1 097 livres.")),
      P(1, num("Encadre 7 486 entre deux centaines consécutives, puis arrondis-le à la centaine la plus proche. Écris seulement l’arrondi.", ["7500", "7 500"], "7 400 < 7 486 < 7 500. 86 est plus proche de 100 que de 0, donc l’arrondi est 7 500.")),
    ]),
    S("eveil", "Sciences et sciences humaines", 15, [
      P(3, ord("Range les grandes périodes de l’histoire de la plus ancienne à la plus récente.", ["Préhistoire", "Antiquité", "Moyen Âge", "Temps modernes", "Époque contemporaine"], "La frise du temps suit cet ordre : Préhistoire, Antiquité, Moyen Âge, Temps modernes, Époque contemporaine.")),
      P(3, mat("Relie chaque élément à sa période.", [["Les hommes qui vivaient dans des cavernes", "Préhistoire"], ["Les pyramides et les pharaons", "Antiquité"], ["Les châteaux forts", "Moyen Âge"], ["Internet", "Époque contemporaine"]], "Chaque événement correspond à une période : cavernes (Préhistoire), pyramides (Antiquité), châteaux forts (Moyen Âge), Internet (époque actuelle).")),
      P(3, mcq("Comment s’appelle le passage de l’eau liquide à la glace ?", "La solidification", ["La fusion", "L’évaporation", "La condensation"], "Quand l’eau gèle, elle passe de l’état liquide à l’état solide : c’est la solidification. L’inverse est la fusion.")),
      P(3, mcq("Quel point cardinal est opposé à l’ouest ?", "L’est", ["Le nord", "Le sud", "Le nord-ouest"], "L’est et l’ouest sont opposés, comme le nord et le sud. Le soleil se lève à l’est.")),
      P(3, mcq("Dans la chaîne alimentaire « herbe → lapin → renard », qui est le prédateur ?", "Le renard", ["L’herbe", "Le lapin", "Aucun des trois"], "Le prédateur est celui qui mange les autres : le renard mange le lapin. L’herbe est le producteur.")),
    ]),
    S("ecouter", "Écouter", 5, A("La boîte aux souvenirs", AUDIO4, [
      P(1, mcq("Où se déroule le début de l’histoire ?", "Dans un parc", ["Dans une gare", "Dans une école", "Dans un musée"], "Inès traverse le parc avec son frère Sami au début du récit.")),
      P(1, mcq("Quel objet Inès découvre-t-elle ?", "Une petite boîte métallique bleue", ["Un carnet de notes", "Une montre en or", "Un ballon rouge"], "Inès aperçoit « une petite boîte métallique bleue » sous un arbre.")),
      P(1, mcq("Quel indice permet de retrouver le propriétaire ?", "L’étiquette sur le couvercle", ["Une photo de famille sur un banc", "Un panneau dans le parc", "La montre arrêtée"], "L’étiquette porte le nom « André Martin » et l’adresse « maison du jardinier ». Les enfants peuvent donc aller le voir.")),
      P(1, mcq("Quelle émotion ressent Monsieur André en retrouvant sa boîte ?", "De la joie et du soulagement", ["De la colère", "De l’ennui", "De la peur"], "Ses yeux s’illuminent et il s’exclame : « Je la cherchais depuis hier ! ». Il est heureux et soulagé.")),
      P(1, ord("Remets les événements dans l’ordre de l’histoire.", ["Inès découvre une boîte", "Inès remarque une étiquette", "Inès rencontre Monsieur André", "Inès repart heureuse"], "Inès trouve la boîte, lit l’étiquette, rencontre Monsieur André, puis repart contente de son geste honnête.")),
    ])),
    S("parler", "Parler", 5, [
      P(5, oral("Présente oralement en une minute un objet-souvenir que tu aimes (réel ou imaginé), puis réponds à deux questions d’un adulte.", AIDE_ORAL, CRIT_ORAL,
        "Décris l’objet (forme, couleur), dis d’où il vient et pourquoi il compte pour toi. Conclus par une phrase simple.")),
    ]),
  ],
};

// ───────────────────────── EXAMEN 5 — Le carnet du vieux chêne ─────────────────────────
const AUDIO5 = "Chaque samedi matin, Mila se rendait à la bibliothèque du village. Ce jour-là, un vent léger soulevait les feuilles sur le chemin. En passant devant le vieux chêne de la place, elle aperçut un petit carnet coincé entre deux grosses racines. Sa couverture était usée, ses pages jaunies, et un ruban bleu dépassait du milieu.\n\nMila le ramassa avec précaution. Sur la première page, elle lut : « Souvenirs de mon jardin ». Elle chercha autour d’elle, mais personne ne semblait avoir perdu quoi que ce soit. Près du banc, un vieil homme regardait le sol avec inquiétude.\n\n« Où est mon carnet ? » murmurait-il. Mila s’approcha et lui montra sa découverte. « Tu as trouvé mon carnet ! » s’exclama-t-il, soulagé. Il expliqua qu’il y notait depuis trente ans les fleurs, les oiseaux et les arbres de son jardin. Mila lui rendit le carnet. Le vieil homme la remercia chaleureusement, puis elle reprit le chemin de la bibliothèque.";

const EX5: BlancExam = {
  id: "blanc-5",
  title: "Examen blanc 5 : Le carnet du vieux chêne",
  theme: "Le carnet du vieux chêne",
  level: "P4",
  sections: [
    S("lire", "Lire et comprendre", 20, [
      P(4, mcq("Où le marché aux fleurs s’installe-t-il ?", "Sur la place du village", ["Dans la cour de l’école", "Au bord de la mer", "Dans un jardin privé"], "Le texte dit que le marché « s’installe sur la place du village ».")),
      P(4, mcq("Quand le marché a-t-il lieu ?", "Chaque mois", ["Chaque jour", "Chaque semaine", "Une fois par an"], "La première phrase commence par « Chaque mois ». Le marché revient donc tous les mois.")),
      P(4, mcq("Pourquoi la dame hésite-t-elle devant le stand ?", "Elle cherche un cadeau pour son voisin malade", ["Elle a perdu son porte-monnaie", "Elle n’aime pas les fleurs", "Elle veut vendre des tulipes"], "Vers dix heures, une dame hésite : elle cherche un cadeau pour son voisin malade.")),
      P(4, mcq("Pourquoi Camille conseille-t-elle des jacinthes en pot ?", "Parce qu’elles sont plus résistantes qu’un bouquet coupé", ["Parce qu’elles sont moins chères", "Parce qu’il ne reste que celles-là", "Parce que le voisin déteste les roses"], "Camille explique que le pot est « plus résistant qu’un bouquet coupé » : le cadeau durera plus longtemps.")),
      P(4, mcq("Que signifie le mot « ravie » dans « fatiguée mais ravie » ?", "Très contente", ["Très triste", "Très en colère", "Très surprise"], "Être ravie, c’est être très contente. Camille est fatiguée, mais contente de sa journée.")),
    ], {
      title: "Le marché aux fleurs",
      body: [
        "Chaque mois, le marché aux fleurs s’installe sur la place du village. Dès sept heures, les marchands déballent leurs caisses de tulipes, de roses et de pensées. Camille aide sa tante à installer le stand. Elle dispose les bouquets par couleurs, du plus clair au plus foncé, pour attirer les clients.",
        "Vers dix heures, une dame s’arrête et hésite : elle cherche un cadeau pour son voisin malade. Camille lui conseille un petit pot de jacinthes parfumées, plus résistant qu’un bouquet coupé. La dame sourit, paie et promet de revenir le mois prochain. À midi, il ne reste presque plus de fleurs, et Camille, fatiguée mais ravie, range les caisses vides.",
      ],
    }),
    S("langue", "Maîtrise de la langue", 15, [
      P(3, mcq("Remplace le groupe sujet par un pronom : « Les marchands et moi installons les caisses. »", "Nous installons les caisses.", ["Ils installent les caisses.", "Vous installez les caisses.", "Elles installent les caisses."], "Quand « moi » fait partie du groupe sujet, on emploie « nous », et le verbe se termine par -ons.")),
      P(3, num("Mets au pluriel : « Le journal du soir annonce une bonne nouvelle. »", ["Les journaux du soir annoncent de bonnes nouvelles.", "Les journaux du soir annoncent des bonnes nouvelles.", "Les journaux du soir annoncent de bonnes nouvelles"], "Journal fait journaux, le verbe devient « annoncent », et « une bonne nouvelle » devient « de bonnes nouvelles ».")),
      P(3, mcq("Hier, elles (aller) au marché. Quelle est la bonne forme au passé composé ?", "sont allées", ["ont allé", "sont allé", "ont allées"], "Le verbe « aller » se conjugue avec être : le participe s’accorde avec le sujet féminin pluriel, donc « sont allées ».")),
      P(3, mcq("Quelle phrase du marché est bien ponctuée ?", "Camille vend des tulipes, des roses et des pensées.", ["Camille vend, des tulipes des roses, et des pensées.", "Camille vend des tulipes des roses, et des pensées,", "Camille vend des tulipes, des roses, et, des pensées"], "Dans une énumération, on sépare les éléments par des virgules, puis « et » avant le dernier, sans virgule.")),
      P(3, num("Complète par a ou à : Camille ___ un bouquet. Elle va ___ la gare. Écris les deux mots séparés par une virgule.", ["a, à", "a,à", "a ; à", "a;à"], "« A » sans accent est le verbe avoir (il se remplace par « avait »). « À » avec accent est une préposition.")),
    ]),
    S("ecrire", "Produire un texte", 15, [
      P(15, ecrit("Raconte comment tu aides quelqu’un un jour de marché (8 à 12 lignes). Prévois un début, un événement et une fin, et utilise au moins trois connecteurs temporels.", AIDE_ECRIT, CRIT_ECRIT,
        "Samedi, j’ai aidé mon oncle à installer son stand de fruits. D’abord, j’ai rangé les pommes par couleur. Ensuite, une cliente m’a demandé un conseil et j’ai choisi des poires bien mûres. Puis j’ai rendu la monnaie sans me tromper. À la fin de la matinée, mon oncle m’a remercié et m’a offert une pêche.",
        "Un bon récit présente le lieu, raconte l’aide apportée et finit clairement. Les connecteurs aident à suivre l’ordre des actions.", 50)),
    ]),
    S("maths", "Mathématiques", 25, [
      P(2, num("On regroupe 80 étoiles en paquets de 20. Combien de paquets obtient-on ?", ["4", "4 paquets"], "80 ÷ 20 = 4, car 20 × 4 = 80. On obtient 4 paquets.")),
      P(2, num("Écris en chiffres (comme dans un tableau de numération) : quarante-deux-mille-huit unités.", ["42008", "42 008"], "42 000 + 8 = 42 008. Le chiffre des centaines et des dizaines est 0.")),
      P(2, num("Écris en chiffres : quarante-deux unités et huit dixièmes.", ["42,8", "42.8"], "42 unités, puis 8 dixièmes : 42 + 0,8 = 42,8.")),
      P(2, num("Complète avec <, > ou = : 14,05 ___ 14,5 ; 73,40 ___ 73,4. Écris les deux signes séparés par un point-virgule.", ["< ; =", "<;=", "<, =", "<,="], "14,05 < 14,5 car 0 dixième < 5 dixièmes. 73,40 = 73,4 car le zéro final ne change pas la valeur.")),
      P(2, mcq("Laquelle de ces égalités est exacte ?", "100 000 = 10 × 10 000", ["100 000 = 10 × 1 000", "100 000 = 50 000 + 5 000", "100 000 = 100 × 100"], "10 × 10 000 = 100 000. Les autres donnent 10 000, 55 000 et 10 000.")),
      P(1, mcq("Quelle est la règle de la suite 5 ; 17 ; 29 ; 41 ?", "+ 12", ["+ 10", "× 3", "+ 14"], "17 − 5 = 12, 29 − 17 = 12, 41 − 29 = 12 : on ajoute 12 à chaque fois.")),
      P(1, mcq("Quelle est la règle de la suite 0,5 ; 2 ; 8 ; 32 ?", "× 4", ["+ 1,5", "× 2", "× 3"], "0,5 × 4 = 2 ; 2 × 4 = 8 ; 8 × 4 = 32. On multiplie par 4 à chaque étape.")),
      P(1, num("Pose et effectue : 6 458 + 3 726,5", ["10184,5", "10 184,5", "10184.5", "10 184.5"], "6 458 + 3 726,5 = 10 184,5. Aligne bien les virgules : 6 458,0 + 3 726,5.")),
      P(1, num("Pose et effectue : 5 002 − 748,6", ["4253,4", "4 253,4", "4253.4", "4 253.4"], "5 002,0 − 748,6 = 4 253,4. Vérification : 4 253,4 + 748,6 = 5 002.")),
      P(1, num("Pose et effectue : 326 × 24", ["7824", "7 824"], "326 × 24 = 326 × 20 + 326 × 4 = 6 520 + 1 304 = 7 824.")),
      P(2, mat("Relie chaque situation à l’opération qui permet de la résoudre.", [["36 biscuits répartis entre 9 enfants", "Une division"], ["18 rangées de 14 sièges", "Une multiplication"], ["410 voyageurs, puis 65 descendent", "Une soustraction"]], "Partager équitablement : division. Rangées égales : multiplication. Des voyageurs qui partent : soustraction.")),
      P(2, num("Calcule 47,8 + 69, puis arrondis le résultat à l’unité.", ["117"], "Estimation : 48 + 69 ≈ 117. Calcul exact : 116,8 ; 8 dixièmes, on arrondit à 117.")),
      P(1, num("Calcule astucieusement : 20 − 0,45", ["19,55", "19.55"], "20 − 0,45 = 19,55. Astuce : 20 − 0,5 = 19,5 puis on rajoute 0,05.")),
      P(1, num("Calcule astucieusement : 160 × 9", ["1440", "1 440"], "160 × 9 = 160 × 10 − 160 = 1 600 − 160 = 1 440.")),
      P(1, num("Calcule astucieusement : 3 600 ÷ 40", ["90"], "3 600 ÷ 40 = 360 ÷ 4 = 90 : on enlève un zéro aux deux nombres.")),
      P(2, mat("Relie chaque écriture à son égal.", [["1/4", "0,25"], ["0,7", "7/10"], ["3/2", "1,5"]], "1/4 = 25 centièmes = 0,25 ; 0,7 = 7 dixièmes ; 3/2 = 1 + 1/2 = 1,5.")),
      P(1, mcq("Quel nombre correspond à 5 CM (centaines de mille), 2 UM (unités de mille), 7 D (dizaines), 4 U (unités) et 6 dixièmes ?", "502 074,6", ["520 074,6", "502 704,6", "500 274,6"], "5 CM = 500 000 ; 2 UM = 2 000 ; 7 D = 70 ; 4 U = 4 ; 6 dixièmes = 0,6. Total : 502 074,6.")),
    ]),
    S("eveil", "Sciences et sciences humaines", 15, [
      V({ t: "plan", cols: 3, rows: 3, title: "Plan du village (nord en haut)", items: [{ c: 1, r: 0, label: "Gare" }, { c: 0, r: 1, label: "École" }, { c: 1, r: 1, label: "Mairie" }, { c: 2, r: 1, label: "Église" }, { c: 1, r: 2, label: "Parc" }] },
        P(3, mcq("Sur ce plan, le nord est en haut. Quel bâtiment est au sud de la mairie ?", "Le parc", ["La gare", "L’école", "L’église"], "Le sud est en bas du plan. Sous la mairie, on trouve le parc. La gare est au nord, l’école à l’ouest et l’église à l’est."))),
      P(3, ord("Remets dans l’ordre cette chaîne alimentaire.", ["Le blé", "La souris", "La chouette"], "Le blé (producteur) est mangé par la souris, qui est mangée par la chouette (prédateur).")),
      P(3, mcq("Que devient l’eau quand elle bout dans une casserole ?", "De la vapeur d’eau (un gaz)", ["De la glace", "De la neige", "Du sable"], "Chauffée à 100 °C, l’eau liquide passe à l’état gazeux. On dit qu’elle bout et se transforme en vapeur.")),
      P(3, mcq("Quelle période de l’histoire vient juste après le Moyen Âge ?", "Les Temps modernes", ["L’Antiquité", "La Préhistoire", "L’Époque contemporaine"], "Sur la frise : Préhistoire, Antiquité, Moyen Âge, Temps modernes, puis Époque contemporaine.")),
      P(3, mcq("Quelle partie de la plante absorbe l’eau dans le sol ?", "Les racines", ["Les feuilles", "Les fleurs", "La tige"], "Les racines puisent l’eau et les sels minéraux dans le sol. Elles ancrent aussi la plante, comme celles du vieux chêne.")),
    ]),
    S("ecouter", "Écouter", 5, A("Le carnet du vieux chêne", AUDIO5, [
      P(1, mcq("Où Mila se rend-elle chaque samedi matin ?", "À la bibliothèque", ["Au marché", "À la piscine", "À l’école"], "Le texte débute par « Chaque samedi matin, Mila se rendait à la bibliothèque du village ».")),
      P(1, mcq("Pourquoi Mila s’arrête-t-elle devant le vieux chêne ?", "Elle aperçoit un carnet coincé entre les racines", ["Elle veut se reposer à l’ombre", "Elle entend un oiseau", "Elle cherche un banc"], "En passant devant le chêne, Mila aperçoit un petit carnet coincé entre deux grosses racines.")),
      P(1, mcq("Qui dit : « Tu as trouvé mon carnet ! » ?", "Le vieil homme", ["Mila", "La bibliothécaire", "Un enfant"], "C’est le vieil homme, propriétaire du carnet, qui s’exclame, soulagé.")),
      P(1, mcq("Quelle émotion ressent le vieil homme en retrouvant son carnet ?", "Le soulagement", ["La colère", "La peur", "L’ennui"], "Le texte dit qu’il s’exclame « soulagé » : il craignait d’avoir perdu un objet très important pour lui.")),
      P(1, ord("Remets les événements dans l’ordre.", ["Mila part à la bibliothèque", "Le vent soulève les feuilles", "Mila découvre le carnet", "Le propriétaire remercie Mila"], "Mila part, le vent souffle sur le chemin, elle découvre le carnet, puis le vieil homme la remercie.")),
    ])),
    S("parler", "Parler", 5, [
      P(5, oral("Présente oralement en une minute une plante ou un arbre que tu aimes, puis réponds à deux questions d’un adulte.", AIDE_ORAL, CRIT_ORAL,
        "Dis comment s’appelle la plante, où elle pousse, à quoi elle ressemble et pourquoi tu l’aimes. Conclus en une phrase.")),
    ]),
  ],
};

// ───────────────────────── EXAMEN 6 — Série A : L’exposition des saisons ─────────────────────────
const EX6: BlancExam = {
  id: "blanc-6",
  title: "Examen blanc 6 : Série A, l’exposition des saisons",
  theme: "Série A : l’exposition des saisons",
  level: "P4",
  sections: [
    S("lire", "Lire et comprendre", 20, [
      P(4, mcq("Sur quel thème les élèves de P4 préparent-ils une exposition ?", "Les saisons", ["Les animaux de la ferme", "Les métiers", "Les planètes"], "La première phrase dit que les élèves préparent « une exposition sur les saisons ».")),
      P(4, mcq("Quelle saison le groupe de Nora a-t-il choisie ?", "L’automne", ["L’hiver", "Le printemps", "L’été"], "Le texte précise : « Le groupe de Nora a choisi l’automne », et ils ramassent des feuilles rousses.")),
      P(4, mcq("Quel problème l’institutrice remarque-t-elle mardi ?", "L’affiche du groupe de l’hiver est encore vide", ["Les feuilles ont disparu", "Les parents ne viennent pas", "Nora est absente"], "Mardi, l’institutrice remarque que l’affiche du groupe de l’hiver est vide : c’est le problème à résoudre.")),
      P(4, mcq("Comment Nora aide-t-elle le groupe de l’hiver ?", "Elle dessine un bonhomme de neige et des flocons", ["Elle écrit un texte sur l’été", "Elle colle des feuilles rousses", "Elle appelle les parents"], "Nora propose son aide et dessine un bonhomme de neige et des flocons, des éléments de l’hiver.")),
      P(4, mcq("Que signifie le mot « collaboration » ?", "Le fait de travailler ensemble", ["Le fait de se disputer", "Le fait de partir en vacances", "Le fait de dessiner seul"], "Collaborer, c’est travailler avec d’autres pour réussir un projet commun, comme les enfants de la classe.")),
    ], {
      title: "L’exposition des saisons",
      body: [
        "Cette semaine, les élèves de P4 préparent une exposition sur les saisons. Chaque groupe choisit une saison et fabrique une affiche. Le groupe de Nora a choisi l’automne. Les enfants ramassent des feuilles rousses dans le parc, puis les collent sur un grand carton. Ils écrivent aussi un petit texte pour expliquer pourquoi les arbres perdent leurs feuilles.",
        "Mardi, l’institutrice remarque que l’affiche du groupe de l’hiver est encore vide. Nora propose alors son aide : elle dessine un bonhomme de neige et des flocons. Le vendredi, tous les parents viennent visiter l’exposition. Ils félicitent les enfants pour leur travail et leur belle collaboration.",
      ],
    }),
    S("langue", "Maîtrise de la langue", 15, [
      P(3, mcq("Remplace le groupe sujet par un pronom personnel : « Les élèves de P4 préparent une exposition. »", "Ils préparent une exposition.", ["Elles préparent une exposition.", "Il prépare une exposition.", "Nous préparons une exposition."], "Le groupe sujet est pluriel : on utilise « ils » et le verbe prend la terminaison -ent.")),
      P(3, num("Réécris au pluriel : « Le petit cheval traverse le chemin. »", ["Les petits chevaux traversent les chemins.", "Les petits chevaux traversent les chemins"], "Cheval fait chevaux. Tous les mots s’accordent : les petits chevaux traversent les chemins.")),
      P(3, num("Conjugue au présent : nous (finir), vous (prendre), elles (aller), je (faire). Écris les quatre formes séparées par des points-virgules.", ["finissons ; prenez ; vont ; fais", "finissons;prenez;vont;fais", "finissons, prenez, vont, fais", "finissons,prenez,vont,fais"], "Finir : nous finissons. Prendre : vous prenez. Aller : elles vont. Faire : je fais. Ce sont des formes à bien connaître.")),
      P(3, mcq("Quelle écriture est correctement ponctuée ?", "« Où vas-tu ? » demande Lina. « Je vais à la bibliothèque. »", ["Où vas tu demande Lina je vais à la bibliothèque.", "« Où vas-tu » ? demande Lina « je vais à la bibliothèque ».", "« Où vas-tu ! » demande lina. « je vais à la bibliothèque »"], "On met des guillemets pour les paroles, une majuscule au nom propre, un point d’interrogation pour la question, un trait d’union dans « vas-tu ».")),
      P(3, num("Complète par c ou ç : un gar__on ; une le__on ; nous avan__ons ; un __itron. Écris les quatre mots séparés par des points-virgules.", ["garçon ; leçon ; avançons ; citron", "garçon;leçon;avançons;citron", "garçon, leçon, avançons, citron", "garçon,leçon,avançons,citron"], "On met une cédille (ç) devant a, o, u pour garder le son [s] : garçon, leçon, avançons. Devant i on écrit c : citron.")),
    ]),
    S("ecrire", "Produire un texte", 15, [
      P(15, ecrit("Raconte comment ta classe prépare une exposition ou un spectacle pour les parents (8 à 12 lignes). Prévois un début, un événement et une fin, et utilise au moins trois connecteurs temporels.", AIDE_ECRIT, CRIT_ECRIT,
        "Lundi, notre classe a décidé de préparer un spectacle de théâtre. D’abord, nous avons choisi les rôles. Ensuite, nous avons fabriqué des costumes avec du papier crépon. Mercredi, un décor est tombé pendant la répétition, mais nous l’avons vite réparé. Enfin, vendredi, les parents nous ont applaudis longtemps.",
        "Un bon récit donne le projet de départ, un petit imprévu ou événement, puis une conclusion. Les connecteurs temporels organisent ton texte.", 50)),
    ]),
    S("maths", "Mathématiques", 25, [
      P(3, num("Un jardin rectangulaire mesure 9 m de long et 4 m de large. Quel est son périmètre, en mètres ?", ["26", "26 m"], "Périmètre = (9 + 4) × 2 = 26 m. On additionne tous les côtés : 9 + 4 + 9 + 4.", "m")),
      P(3, num("Un carré a un périmètre de 28 cm. Quelle est la longueur d’un côté, en centimètres ?", ["7", "7 cm"], "Un carré a 4 côtés égaux : 28 ÷ 4 = 7 cm.", "cm")),
      P(4, mat("On trace sur un quadrillage un rectangle de 6 cm sur 3 cm et un carré de 4 cm de côté. Relie chaque mesure à sa valeur.", [["Périmètre du rectangle de 6 cm sur 3 cm", "18 cm"], ["Périmètre du carré de 4 cm de côté", "16 cm"], ["Aire du rectangle de 6 cm sur 3 cm", "18 cm²"], ["Aire du carré de 4 cm de côté", "16 cm²"]],
        "Rectangle : périmètre (6 + 3) × 2 = 18 cm, aire 6 × 3 = 18 cm². Carré : périmètre 4 × 4 = 16 cm, aire 4 × 4 = 16 cm². Le périmètre est en cm, l’aire en cm².")),
      P(3, num("Un pot de peinture coûte 12,50 €. Combien coûtent 4 pots, en euros ?", ["50", "50 €", "50,00"], "4 × 12,50 = 50. Astuce : 4 × 12 = 48 et 4 × 0,50 = 2, donc 48 + 2 = 50 €.", "€")),
      P(3, num("Lina a 5,40 € et achète un cahier à 2,85 €. Combien lui reste-t-il, en euros ?", ["2,55", "2.55", "2,55 €"], "5,40 − 2,85 = 2,55. Vérification : 2,55 + 2,85 = 5,40.", "€")),
      P(2, num("Convertis : 3 m 50 cm = ... cm.", ["350", "350 cm"], "3 m = 300 cm, donc 3 m 50 cm = 300 + 50 = 350 cm.", "cm")),
      V({ t: "clock", h: 3, m: 45 }, P(2, num("L’horloge indique l’heure d’arrivée du bus. Quelle heure sera-t-il 30 minutes plus tard ? (écris par exemple 5 h 10)", ["4 h 15", "4h15", "16 h 15", "16h15", "4 h 15 min"], "3 h 45 + 15 min = 4 h, puis encore 15 min : 4 h 15."))),
      P(2, num("135 billes sont partagées équitablement entre 5 enfants. Combien de billes reçoit chaque enfant ?", ["27", "27 billes"], "135 ÷ 5 = 27, car 5 × 27 = 135.")),
      P(3, num("Combien font les 1/4 de 24 ?", ["6"], "Prendre 1/4, c’est diviser par 4 : 24 ÷ 4 = 6.")),
    ]),
    S("eveil", "Sciences et sciences humaines", 15, [
      P(3, mcq("Pourquoi les arbres perdent-ils leurs feuilles en automne ?", "Pour économiser l’énergie pendant l’hiver", ["Parce qu’ils sont malades", "Parce que des animaux les mangent", "Parce qu’il pleut trop"], "Les arbres à feuilles caduques laissent tomber leurs feuilles quand les jours raccourcissent et que le froid arrive : ils se mettent au repos.")),
      P(3, mcq("Que montre toujours l’aiguille d’une boussole ?", "Le nord", ["Le sud", "L’ouest", "Le soleil"], "L’aiguille aimantée de la boussole s’oriente vers le nord magnétique. On trouve ensuite les autres points cardinaux.")),
      P(3, mcq("Quelle période de l’histoire commence avec l’invention de l’écriture ?", "L’Antiquité", ["La Préhistoire", "Le Moyen Âge", "L’Époque contemporaine"], "La Préhistoire est la période avant l’écriture. L’Antiquité commence avec l’écriture (Égyptiens, Grecs, Romains…).")),
      P(3, mat("Relie chaque changement d’état de l’eau à son nom.", [["Glace qui devient eau liquide", "Fusion"], ["Eau liquide qui devient vapeur", "Évaporation"], ["Vapeur qui devient eau liquide", "Condensation"]], "La fusion fait fondre la glace, l’évaporation transforme le liquide en gaz, la condensation fait revenir le gaz en liquide.")),
      P(3, tf("Le soleil se couche à l’ouest.", true, "Le soleil se lève à l’est et se couche à l’ouest. Retiens : l’est est du côté du lever.")),
    ]),
    S("ecouter", "Écouter", 5, A("Pixel au parc", "Samedi après-midi, au parc de la ville, Léna joue au ballon avec son petit chien Pixel. Soudain, Pixel court derrière un écureuil et disparaît entre les buissons. Léna l’appelle, mais il ne revient pas. Un jardinier lui conseille de rester calme et de siffler comme d’habitude. Léna siffle trois fois. Quelques secondes plus tard, Pixel revient en remuant la queue, la truffe pleine de terre.", [
      P(1, mcq("Dans quel endroit Léna joue-t-elle avec son chien ?", "Au parc de la ville", ["À la maison", "À l’école", "À la plage"], "Le texte dit « au parc de la ville ».")),
      P(1, mcq("Quel problème survient pour Léna ?", "Pixel poursuit un écureuil et disparaît", ["Léna perd son ballon", "Pixel est malade", "Le parc ferme"], "Pixel court derrière un écureuil et disparaît entre les buissons.")),
      P(1, mcq("Qui conseille Léna ?", "Un jardinier", ["Sa maman", "Un policier", "Un enfant"], "C’est un jardinier qui lui dit de rester calme et de siffler comme d’habitude.")),
      P(1, mcq("Quelle solution Léna applique-t-elle ?", "Léna siffle comme d’habitude", ["Léna lance un autre ballon", "Léna rentre sans Pixel", "Léna crie très fort"], "Léna suit le conseil : elle siffle, et Pixel reconnaît le signal habituel.")),
      P(1, mcq("Combien de fois Léna siffle-t-elle ?", "Trois fois", ["Une fois", "Deux fois", "Cinq fois"], "Le texte précise que Léna siffle trois fois avant que Pixel ne revienne.")),
    ])),
    S("parler", "Parler", 5, [
      P(5, oral("Présente oralement en une minute ta saison préférée et explique pourquoi, puis réponds à deux questions d’un adulte.", AIDE_ORAL, CRIT_ORAL,
        "Nomme ta saison, donne deux raisons précises (météo, activités, paysages) et conclus. Utilise des mots variés.")),
    ]),
  ],
};

// ───────────────────────── EXAMEN 7 — Série B : Chez le boulanger ─────────────────────────
const EX7: BlancExam = {
  id: "blanc-7",
  title: "Examen blanc 7 : Série B, chez le boulanger",
  theme: "Série B : chez le boulanger",
  level: "P4",
  sections: [
    S("lire", "Lire et comprendre", 20, [
      P(4, mcq("À quelle heure le boulanger commence-t-il son travail ?", "À cinq heures du matin", ["À midi", "À huit heures du soir", "À dix heures du matin"], "Le texte précise : « Il est cinq heures du matin quand le boulanger commence son travail ».")),
      P(4, mcq("Quels ingrédients le boulanger ajoute-t-il pour faire la pâte ?", "De la farine, de l’eau, de la levure et du sel", ["Du sucre, du lait et du chocolat", "Du riz et des légumes", "De l’huile et du poivre"], "Le boulanger pèse la farine et ajoute de l’eau, de la levure et une pincée de sel.")),
      P(4, mcq("Pourquoi laisse-t-il reposer la pâte sous un linge ?", "Pour qu’elle gonfle", ["Pour qu’elle refroidisse", "Pour la cacher", "Pour qu’elle sèche"], "Le repos permet à la pâte de gonfler grâce à la levure.")),
      P(4, mcq("Que demande le métier de boulanger, selon lui ?", "De la patience et de la précision", ["De la force et de la vitesse", "De la chance et du hasard", "De la musique et du silence"], "À la fin, le boulanger explique que son métier demande de la patience et de la précision.")),
      P(4, mcq("Que signifie le verbe « pétrir » ?", "Travailler la pâte avec les mains", ["Peser la farine", "Couper le pain en tranches", "Allumer le four"], "Pétrir signifie malaxer la pâte pour la rendre lisse. Le boulanger la pétrit longtemps.")),
    ], {
      title: "Chez le boulanger",
      body: [
        "Mercredi, Adam et sa sœur Salma visitent la boulangerie du quartier. Il est cinq heures du matin quand le boulanger commence son travail. Il pèse la farine, ajoute de l’eau, de la levure et une pincée de sel, puis il pétrit la pâte longtemps. Ensuite, il la laisse reposer sous un linge pour qu’elle gonfle.",
        "Adam observe attentivement chaque geste. Quand les pains sortent du four, une bonne odeur remplit la boutique. Salma goûte un petit croissant encore tiède. Le boulanger explique que son métier demande de la patience et de la précision. En partant, les enfants achètent une baguette pour le déjeuner.",
      ],
    }),
    S("langue", "Maîtrise de la langue", 15, [
      P(3, mcq("Remplace le groupe sujet par un pronom personnel : « Ma sœur et moi visitons le musée. »", "Nous visitons le musée.", ["Ils visitent le musée.", "Elles visitent le musée.", "Vous visitez le musée."], "Quand le groupe sujet contient « moi », on emploie « nous », et le verbe se termine par -ons.")),
      P(3, num("Réécris au pluriel : « Un beau journal est posé sur la table. »", ["De beaux journaux sont posés sur les tables.", "Des beaux journaux sont posés sur les tables.", "De beaux journaux sont posés sur les tables"], "Beau fait beaux, journal fait journaux, est posé fait sont posés, la table fait les tables. « Un » devient « de » devant un adjectif.")),
      P(3, num("Conjugue au présent : tu (venir), ils (être), nous (voir), elle (choisir). Écris les quatre formes séparées par des points-virgules.", ["viens ; sont ; voyons ; choisit", "viens;sont;voyons;choisit", "viens, sont, voyons, choisit", "viens,sont,voyons,choisit"], "Venir : tu viens. Être : ils sont. Voir : nous voyons. Choisir : elle choisit.")),
      P(3, mcq("Quelle écriture du boulanger est correctement ponctuée ?", "« Attention ! » crie Adam. « Le ballon arrive vite ! »", ["Attention crie Adam le ballon arrive vite", "« Attention » ! crie Adam « le ballon arrive vite »", "« attention ? » crie Adam. « le ballon arrive vite. »"], "Un cri se termine par un point d’exclamation. Les paroles sont entre guillemets, avec une majuscule, et on précise qui parle (crie Adam).")),
      P(3, num("Complète par c ou ç : une fa__ade ; un __adeau ; nous pla__ons ; un gla__on. Écris les quatre mots séparés par des points-virgules.", ["façade ; cadeau ; plaçons ; glaçon", "façade;cadeau;plaçons;glaçon", "façade, cadeau, plaçons, glaçon", "façade,cadeau,plaçons,glaçon"], "Devant a, o, u, on met ç (cédille) pour garder le son [s] : façade, plaçons, glaçon. Dans « cadeau », le c fait le son [k].")),
    ]),
    S("ecrire", "Produire un texte", 15, [
      P(15, ecrit("Raconte la visite d’un atelier ou d’un commerce où tu découvres un métier (8 à 12 lignes). Prévois un début, un événement et une fin, et utilise au moins trois connecteurs temporels.", AIDE_ECRIT, CRIT_ECRIT,
        "Mercredi dernier, je suis allé chez un menuisier avec ma classe. D’abord, il nous a montré ses outils. Ensuite, il a scié une planche et j’ai senti l’odeur du bois. Soudain, il m’a laissé poncer un petit morceau. Enfin, il m’a offert un cube en bois comme souvenir.",
        "Dis où tu vas, ce que tu observes, ce qui t’étonne, puis termine par ce que tu en retiens.", 50)),
    ]),
    S("maths", "Mathématiques", 25, [
      P(3, num("Une cour rectangulaire mesure 12 m sur 5 m. Quel est son périmètre, en mètres ?", ["34", "34 m"], "(12 + 5) × 2 = 17 × 2 = 34 m.", "m")),
      P(3, num("Un carré a un périmètre de 36 cm. Quelle est la longueur de son côté, en centimètres ?", ["9", "9 cm"], "36 ÷ 4 = 9 cm, car 4 × 9 = 36.", "cm")),
      P(4, mat("On trace sur un quadrillage un rectangle de 7 cm sur 2 cm et un carré de 3 cm de côté. Relie chaque mesure à sa valeur.", [["Périmètre du rectangle de 7 cm sur 2 cm", "18 cm"], ["Aire du rectangle de 7 cm sur 2 cm", "14 cm²"], ["Périmètre du carré de 3 cm de côté", "12 cm"], ["Aire du carré de 3 cm de côté", "9 cm²"]],
        "Rectangle : (7 + 2) × 2 = 18 cm et 7 × 2 = 14 cm². Carré : 4 × 3 = 12 cm et 3 × 3 = 9 cm². Le périmètre est en cm, l’aire en cm².")),
      P(3, num("Un sac de pommes pèse 2,5 kg. Combien pèsent 6 sacs, en kilogrammes ?", ["15", "15 kg"], "6 × 2,5 = 15. Astuce : 6 × 2 = 12 et 6 × 0,5 = 3, donc 12 + 3 = 15 kg.", "kg")),
      P(3, num("Samir a 10 €. Il achète un livre à 6,75 €. Combien lui reste-t-il, en euros ?", ["3,25", "3.25", "3,25 €"], "10 − 6,75 = 3,25. Vérification : 3,25 + 6,75 = 10.", "€")),
      P(2, num("Convertis : 4 m 20 cm = ... cm.", ["420", "420 cm"], "4 m = 400 cm, donc 4 m 20 cm = 400 + 20 = 420 cm.", "cm")),
      V({ t: "clock", h: 8, m: 20 }, P(2, num("L’horloge indique l’heure à laquelle le boulanger sort les pains. Quelle heure sera-t-il 40 minutes plus tard ? (écris par exemple 5 h 10)", ["9 h", "9h", "9 h 00", "9h00", "9 heures"], "8 h 20 + 40 min = 8 h 60 min, c’est-à-dire 9 h 00."))),
      P(2, num("144 élèves sont répartis en 6 classes égales. Combien d’élèves y a-t-il dans chaque classe ?", ["24", "24 élèves"], "144 ÷ 6 = 24, car 6 × 24 = 144.")),
      P(3, num("Combien font les 1/5 de 40 ?", ["8"], "Prendre 1/5, c’est diviser par 5 : 40 ÷ 5 = 8.")),
    ]),
    S("eveil", "Sciences et sciences humaines", 15, [
      P(3, mcq("Que devient de l’eau liquide mise au congélateur ?", "De la glace (un solide)", ["De la vapeur", "De l’air", "Du sable"], "En dessous de 0 °C, l’eau gèle : elle passe de l’état liquide à l’état solide.")),
      P(3, ord("Remets dans l’ordre les étapes du cycle de l’eau.", ["L’eau s’évapore sous l’effet du soleil", "La vapeur se condense en nuages", "La pluie tombe", "L’eau rejoint les ruisseaux et les rivières"], "Le cycle de l’eau : évaporation, condensation, précipitations (pluie), puis écoulement vers les cours d’eau.")),
      P(3, mcq("À midi, dans notre pays, vers quel point cardinal se trouve le soleil ?", "Le sud", ["Le nord", "L’est", "L’ouest"], "Dans l’hémisphère nord, le soleil est au sud à midi. Il se lève à l’est et se couche à l’ouest.")),
      P(3, mcq("À quelle période appartiennent les châteaux forts et les chevaliers ?", "Le Moyen Âge", ["L’Antiquité", "La Préhistoire", "L’Époque contemporaine"], "Les châteaux forts datent du Moyen Âge, qui vient après l’Antiquité.")),
      P(3, mcq("Dans la liste « carotte, lapin, renard », qui est le producteur ?", "La carotte", ["Le lapin", "Le renard", "Aucun des trois"], "Le producteur est le végétal qui fabrique sa nourriture grâce à la lumière. Le lapin mange la carotte, le renard mange le lapin.")),
    ]),
    S("ecouter", "Écouter", 5, A("La panne de courant", "Mardi matin, dans la classe de Karim, la lumière s’éteint à cause d’une panne de courant. Les élèves ont un peu peur dans le couloir sombre. Leur institutrice reste calme et sort une lampe de poche de son tiroir. Elle guide la classe jusqu’à la cour, où il y a de la lumière du jour. Une heure plus tard, l’électricité revient, et les enfants retournent s’installer en classe.", [
      P(1, mcq("Dans quel lieu se déroule la panne de courant ?", "Dans l’école de Karim", ["Dans un parc", "Au musée", "À la plage"], "L’histoire commence dans la classe de Karim, puis dans le couloir et la cour de l’école.")),
      P(1, mcq("Quel problème survient dans l’école ?", "Une panne de courant plonge l’école dans le noir", ["Un élève est malade", "Le toit est cassé", "Le directeur est absent"], "La lumière s’éteint à cause d’une panne de courant : le couloir devient sombre.")),
      P(1, mcq("Qu’utilise l’institutrice pour guider la classe ?", "Une lampe de poche", ["Une bougie", "Un téléphone", "Un briquet"], "Elle sort une lampe de poche de son tiroir.")),
      P(1, mcq("Où l’institutrice emmène-t-elle les élèves ?", "Dans la cour", ["Dans la cantine", "Dans la cave", "Dans la rue"], "La classe est guidée jusqu’à la cour, qui reçoit la lumière du jour.")),
      P(1, mcq("Quel jour et à quel moment se passe l’histoire ?", "Mardi matin", ["Lundi soir", "Mercredi midi", "Vendredi matin"], "Le texte commence par « Mardi matin ».")),
    ])),
    S("parler", "Parler", 5, [
      P(5, oral("Présente oralement en une minute un métier que tu aimerais découvrir et explique pourquoi, puis réponds à deux questions d’un adulte.", AIDE_ORAL, CRIT_ORAL,
        "Nomme le métier, dis ce que la personne fait et pourquoi cela te plaît. Termine par une phrase de conclusion.")),
    ]),
  ],
};

// ───────────────────────── EXAMEN 8 — Mystères et frissons dans la nuit étoilée ─────────────────────────
const EX8: BlancExam = {
  id: "blanc-8",
  title: "Examen blanc 8 : Mystères et frissons dans la nuit étoilée",
  theme: "Mystères et frissons dans la nuit étoilée",
  level: "P4",
  sections: [
    S("lire", "Lire et comprendre", 20, [
      P(4, mcq("Où la classe de Sofia passe-t-elle la nuit ?", "Sous des tentes, au bord d’un lac", ["Dans une grotte", "Dans un hôtel de la ville", "Dans le gymnase de l’école"], "Le texte dit que la classe « passe une nuit sous tente au bord du lac ».")),
      P(4, mcq("Pourquoi la maîtresse éteint-elle les lampes ?", "Pour que tout le monde puisse observer le ciel", ["Pour faire peur aux élèves", "Parce que les piles sont vides", "Pour aller dormir tout de suite"], "Dans le noir, les étoiles se voient mieux : la maîtresse éteint les lampes pour observer le ciel.")),
      P(4, mcq("D’où vient le cri étrange qui fait sursauter le groupe ?", "D’une chouette hulotte qui appelle ses petits", ["D’un loup", "D’un enfant perdu", "D’un fantôme"], "La maîtresse explique qu’il s’agit d’une chouette hulotte qui appelle ses petits. Le mystère est résolu.")),
      P(4, mcq("Que signifie le verbe « sursauter » ?", "Faire un petit bond sous l’effet de la surprise", ["Se mettre à chanter", "Dormir profondément", "Courir très vite"], "On sursaute quand on est surpris ou effrayé par un bruit soudain.")),
      P(4, mcq("Pourquoi la maîtresse distribue-t-elle des lampes rouges ?", "Parce qu’elles ne dérangent pas les animaux de la nuit", ["Parce qu’elles sont plus belles", "Parce qu’il n’y a plus d’autres lampes", "Parce qu’elles chauffent les mains"], "Le texte précise que ces lampes ne dérangent pas les animaux de la nuit.")),
    ], {
      title: "Une nuit sous les étoiles",
      body: [
        "Pour la fin de l’année, la classe de Sofia passe une nuit sous tente au bord du lac. Après le repas, la maîtresse éteint les lampes pour que tout le monde puisse observer le ciel. Les enfants découvrent des milliers d’étoiles scintillantes. Soudain, un cri étrange venu de la forêt fait sursauter le groupe. Sofia serre fort la main de son amie Inès.",
        "La maîtresse sourit et explique qu’il s’agit d’une chouette hulotte qui appelle ses petits. Elle distribue des lampes rouges qui ne dérangent pas les animaux de la nuit. Rassurés, les élèves écoutent les bruits de la forêt jusqu’à s’endormir, des étoiles plein les yeux.",
      ],
    }),
    S("langue", "Maîtrise de la langue", 15, [
      P(3, mcq("Dans la phrase « Cette nuit-là, les redoutables hiboux chassaient silencieusement dans le noir. », quelle est la classe grammaticale du mot « redoutables » ?", "Un adjectif qualificatif", ["Un nom propre", "Un pronom personnel", "Un verbe d’action"], "« Redoutables » décrit les hiboux et s’accorde avec eux : c’est un adjectif qualificatif.")),
      P(3, num("Écris le verbe « observer » au futur simple : « Demain, Soumaya et ses amies ___ une étoile filante. »", ["observeront"], "Au futur, avec « elles », on ajoute -ont à l’infinitif : observer + ont = observeront.")),
      P(3, num("Écris le verbe « bondir » au passé composé : « Hier, le chat de la voisine ___ sur le muret en silence. »", ["a bondi"], "Passé composé = auxiliaire avoir au présent + participe passé : le chat a bondi.")),
      P(3, mcq("Dans la phrase « À minuit, le petit chat noir miaule doucement sur le toit. », quel est le groupe sujet ?", "le petit chat noir", ["À minuit", "miaule doucement", "sur le toit"], "On trouve le sujet en posant « Qui est-ce qui miaule ? » : le petit chat noir.")),
      P(3, mcq("Dans la même phrase, quel est le complément circonstanciel de lieu ?", "sur le toit", ["À minuit", "doucement", "le petit chat noir"], "Il répond à la question « Où ? » : sur le toit. « À minuit » répond à « Quand ? », c’est un complément de temps.")),
    ]),
    S("ecrire", "Produire un texte", 15, [
      P(15, ecrit("Raconte une nuit étoilée pendant laquelle tu entends un bruit mystérieux (8 à 12 lignes). Prévois un début, un événement et une fin, et utilise au moins trois connecteurs temporels.", AIDE_ECRIT, CRIT_ECRIT,
        "Samedi soir, j’ai dormi dans le jardin avec mon frère. D’abord, nous avons compté les étoiles. Ensuite, un craquement étrange est venu des buissons. Soudain, deux yeux brillants sont apparus : c’était un hérisson ! Enfin, nous l’avons regardé boire dans une soucoupe d’eau, puis nous nous sommes endormis.",
        "Le suspense (un bruit mystérieux) puis la résolution (un hérisson) donnent un bon récit. Les connecteurs temporels et les mots précis rendent le texte vivant.", 50)),
    ]),
    S("maths", "Mathématiques", 25, [
      P(2, num("Calcule astucieusement : 25 × 7 × 4", ["700"], "25 × 4 = 100, puis 100 × 7 = 700. Changer l’ordre des facteurs rend le calcul facile.")),
      P(2, num("Calcule : 1 450 + 890 + 550", ["2890", "2 890"], "1 450 + 550 = 2 000, puis 2 000 + 890 = 2 890.")),
      P(2, num("Un carré a des côtés de 4 cm. Quelle est son aire, en cm² ?", ["16", "16 cm²", "16 cm2"], "Aire du carré = 4 × 4 = 16 cm².", "cm²")),
      P(2, num("Quel est le périmètre de ce carré de 4 cm de côté, en centimètres ?", ["16", "16 cm"], "Périmètre = 4 × 4 = 16 cm. Ici, l’aire et le périmètre ont la même mesure, mais pas la même unité.", "cm")),
      P(1, num("Convertis : 6 m = ... cm", ["600", "600 cm"], "1 m = 100 cm, donc 6 m = 600 cm.", "cm")),
      P(1, num("Convertis : 9 cm = ... mm", ["90", "90 mm"], "1 cm = 10 mm, donc 9 cm = 90 mm.", "mm")),
      P(1, num("Convertis : 4 km = ... m", ["4000", "4 000", "4000 m", "4 000 m"], "1 km = 1 000 m, donc 4 km = 4 000 m.", "m")),
      P(1, num("Convertis : 800 cm = ... m", ["8", "8 m"], "100 cm = 1 m, donc 800 cm = 8 m.", "m")),
      P(1, num("Convertis : 2 m et 40 cm = ... cm", ["240", "240 cm"], "2 m = 200 cm, donc 2 m 40 cm = 240 cm.", "cm")),
      P(1, num("Convertis 375 cm en mètres et centimètres. Écris par exemple 1 m 20 cm.", ["3 m 75 cm", "3 m 75", "3m75cm", "3m75"], "375 cm = 300 cm + 75 cm = 3 m 75 cm.")),
      P(2, num("Compare avec <, > ou = : 3 m ___ 250 cm ; 60 mm ___ 6 cm ; 2 km ___ 2 500 m. Écris les trois signes séparés par des points-virgules.", ["> ; = ; <", ">;=;<", "> , = , <", ">,=,<"], "3 m = 300 cm > 250 cm ; 60 mm = 6 cm ; 2 km = 2 000 m < 2 500 m. Il faut convertir avant de comparer.")),
      P(2, num("La princesse a un ruban de 3 m. Elle utilise 80 cm pour sa couronne, puis 70 cm pour un nœud. Quelle longueur a-t-elle utilisée en tout, en centimètres ?", ["150", "150 cm"], "80 + 70 = 150 cm de ruban utilisés.", "cm")),
      P(2, num("Un ruban mesure 3 m. Combien de centimètres reste-t-il après avoir utilisé 150 cm de ce ruban ?", ["150", "150 cm"], "3 m = 300 cm, donc 300 − 150 = 150 cm.", "cm")),
      P(1, num("Il reste 150 cm de ruban. Écris cette longueur en mètres et centimètres. Écris par exemple 1 m 20 cm.", ["1 m 50 cm", "1 m 50", "1m50cm", "1m50"], "150 cm = 100 cm + 50 cm = 1 m 50 cm.")),
      P(2, ord("Range ces longueurs de la plus petite à la plus grande : 95 cm, 2 m, 120 cm, 1 m.", ["95 cm", "1 m", "120 cm", "2 m"], "On convertit en centimètres : 95 cm, 100 cm, 120 cm et 200 cm. L’ordre est donc 95 cm < 1 m < 120 cm < 2 m.")),
      P(2, num("La princesse marche 450 m, puis 1 km 250 m. Quelle distance parcourt-elle en tout, en mètres ?", ["1700", "1 700", "1700 m", "1 700 m"], "1 km 250 m = 1 250 m. Puis 450 + 1 250 = 1 700 m.", "m")),
    ]),
    S("eveil", "Sciences et sciences humaines", 15, [
      P(3, mcq("Comment appelle-t-on le mouvement de la Terre qui tourne sur elle-même ?", "La rotation", ["La révolution", "L’évaporation", "La translation du Soleil"], "La Terre tourne sur elle-même (rotation). C’est ce qui crée l’alternance du jour et de la nuit.")),
      P(3, mcq("Combien de temps la Terre met-elle environ pour faire un tour complet sur elle-même ?", "24 heures (un jour)", ["Un mois", "Une heure", "Un an"], "Un tour complet dure environ 24 heures. Un an correspond au tour de la Terre autour du Soleil.")),
      P(3, ord("Range ces événements du plus ancien au plus récent.", ["L’invention de l’écriture (Antiquité)", "L’époque des châteaux forts (Moyen Âge)", "L’utilisation des smartphones (Époque contemporaine)"], "L’écriture date de l’Antiquité, les châteaux forts du Moyen Âge, et les smartphones de l’époque actuelle, l’Époque contemporaine.")),
      P(3, mcq("Qu’est-ce qu’une étoile filante ?", "Un petit morceau de roche qui brûle dans l’atmosphère", ["Une vraie étoile qui tombe", "Un avion très rapide", "Un satellite en panne"], "Une étoile filante est un petit morceau de roche venu de l’espace. Il s’échauffe et brille en traversant l’air de la Terre.")),
      P(3, mcq("La Terre tourne d’ouest en est. Où le Soleil semble-t-il se lever ?", "À l’est", ["À l’ouest", "Au nord", "Au sud"], "Comme la Terre tourne vers l’est, le Soleil nous apparaît à l’est le matin, puis se couche à l’ouest.")),
    ]),
    S("ecouter", "Écouter", 5, A("Le télescope de Hugo", "Un soir d’été, Hugo et son papa montent sur la colline pour observer les étoiles avec un télescope. Mais le ciel est couvert de nuages et Hugo est déçu. Papa lui propose d’attendre un peu en buvant un chocolat chaud. Une demi-heure plus tard, le vent chasse les nuages. Hugo découvre alors la Lune toute ronde et des étoiles brillantes.", [
      P(1, mcq("Où Hugo et son papa observent-ils le ciel ?", "Sur une colline", ["Dans une forêt", "Sur une plage", "Dans un musée"], "Hugo et son papa montent sur la colline pour observer le ciel.")),
      P(1, mcq("Avec qui Hugo observe-t-il les étoiles ?", "Avec son papa", ["Avec sa maîtresse", "Avec sa sœur", "Tout seul"], "Le texte dit que Hugo monte avec son papa.")),
      P(1, mcq("Quel problème gêne Hugo ?", "Le ciel est couvert de nuages", ["Le télescope est cassé", "Il pleut très fort", "Hugo est fatigué"], "Les nuages cachent les étoiles : Hugo est déçu.")),
      P(1, mcq("Que fait papa pour aider Hugo à patienter ?", "Il lui propose d’attendre en buvant un chocolat chaud", ["Il lui offre un jeu", "Il rentre à la maison", "Il lui raconte un conte"], "Papa propose d’attendre un peu en buvant un chocolat chaud.")),
      P(1, mcq("Qu’est-ce qui résout le problème ?", "Le vent chasse les nuages", ["Le soleil se lève", "Papa déplace la colline", "La pluie s’arrête"], "Une demi-heure plus tard, le vent chasse les nuages et le ciel se dégage.")),
    ])),
    S("parler", "Parler", 5, [
      P(5, oral("Présente oralement en une minute ce que tu sais sur les étoiles, la Lune ou la nuit, puis réponds à deux questions d’un adulte.", AIDE_ORAL, CRIT_ORAL,
        "Choisis deux ou trois informations vraies et précises (par exemple : la Terre tourne, la Lune éclaire, les étoiles brillent). Termine par une phrase de conclusion.")),
    ]),
  ],
};

export const BLANCS: BlancExam[] = [EX1, EX2, EX3, EX4, EX5, EX6, EX7, EX8];
