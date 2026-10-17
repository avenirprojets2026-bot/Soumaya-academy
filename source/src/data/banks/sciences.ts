// Banque d'éveil scientifique — monde « Le Jardin des Étoiles ». Contenu original.
import { mcq, tf, num, ord, mat, gap, type Mission, type ExamBlock } from "../kit";

export const MISSIONS: Mission[] = [
  {
    id: "sc-1",
    title: "Les cinq sens des lutins",
    intro: "Dans le Jardin des Étoiles, les lutins-chercheurs ouvrent leur laboratoire : ici, on explore les sens et le corps humain !",
    level: 1,
    qs: [
      mcq(
        "Noé le lutin-chercheur goûte un nectar sucré cueilli sur une fleur lumineuse. Quel organe lui permet de reconnaître ce goût ?",
        "La langue",
        ["Le nez", "L'oreille", "L'œil"],
        "La langue est l'organe du goût : elle repère le sucré, le salé, l'acide et l'amer. Le nez aide aussi à apprécier les saveurs, mais c'est bien la langue qui goûte.",
      ),
      mcq(
        "Mimi le chaton ailé pose sa patte sur une pierre brûlante du jardin et la retire aussitôt. Quel organe a senti la chaleur ?",
        "La peau",
        ["Le cœur", "Les poumons", "L'estomac"],
        "La peau est l'organe du toucher : elle sent le chaud, le froid, la douceur et la douleur. Elle prévient le corps d'un danger très vite.",
      ),
      tf(
        "Sous le télescope géant, Soumaya affirme : « Le squelette soutient notre corps, et le crâne protège le cerveau. » A-t-elle raison ?",
        true,
        "Le squelette donne sa forme au corps et protège les organes fragiles : le crâne entoure le cerveau, et les côtes entourent le cœur et les poumons.",
      ),
      num(
        "Dans la serre qui chante, Lina compte les sens de l'être humain : la vue, l'ouïe, l'odorat, le goût… Combien y en a-t-il en tout ?",
        ["5", "cinq"],
        "Nous avons cinq sens : la vue, l'ouïe, l'odorat, le goût et le toucher. Chacun a son organe : œil, oreille, nez, langue et peau.",
      ),
      mat(
        "Les lutins rangent les organes dans leur boîte magique. Relie chaque organe à sa fonction.",
        [
          ["Le cœur", "Il envoie le sang dans tout le corps"],
          ["Les poumons", "Ils permettent de respirer"],
          ["L'estomac", "Il commence à digérer les aliments"],
          ["Le cerveau", "Il commande le corps et permet de penser"],
        ],
        "Chaque organe a un travail précis, et tous collaborent. Le cœur est une pompe, les poumons captent l'air, l'estomac digère et le cerveau est le chef d'orchestre.",
      ),
      gap(
        "Yanis observe un lutin qui saute : quand les ___ se contractent, ils tirent sur les ___ et font bouger le corps.",
        ["muscles", "os"],
        ["muscles", "os", "poumons", "nerfs"],
        "Les muscles sont attachés aux os. En se contractant, ils les tirent et provoquent le mouvement.",
      ),
    ],
  },
  {
    id: "sc-2",
    title: "La cuisine des champignons lumineux",
    intro: "Les champignons lumineux dirigent la cuisine du royaume ! Découvre comment bien manger, dormir et prendre soin de ton corps.",
    level: 2,
    qs: [
      mcq(
        "Aya veut des os et des dents solides pour grimper aux arbres du jardin. Quel aliment l'aide le plus, grâce à son calcium ?",
        "Un yaourt",
        ["Un bonbon", "Un sirop très sucré", "Une barre de chewing-gum"],
        "Les produits laitiers (lait, yaourt, fromage) apportent du calcium, un minéral qui renforce les os et les dents. Les sucreries, elles, abîment les dents.",
      ),
      tf(
        "Le lutin Elias se brosse les dents après le repas. Cela aide à éviter les caries.",
        true,
        "Le brossage enlève les restes de nourriture et les microbes qui fabriquent des acides. Ce sont ces acides qui creusent les dents et provoquent les caries.",
      ),
      num(
        "Dans la salle des sourires, un lutin-dentiste examine la bouche d'un enfant qui a toutes ses dents de lait. Combien en compte-t-il ?",
        ["20", "vingt"],
        "Un enfant a 20 dents de lait. Elles tombent peu à peu et sont remplacées par les dents définitives, qu'il faut protéger toute la vie.",
      ),
      ord(
        "Un petit biscuit magique voyage dans le corps de Nour. Remets son trajet dans l'ordre.",
        ["La bouche", "L'œsophage", "L'estomac", "L'intestin grêle", "Le gros intestin"],
        "Les aliments sont mâchés dans la bouche, descendent par l'œsophage, sont brassés dans l'estomac, puis l'intestin grêle absorbe les nutriments. Le gros intestin termine le trajet.",
      ),
      mat(
        "Au banquet des champignons, chaque plat a son rôle. Relie chaque aliment à ce qu'il apporte surtout.",
        [
          ["Des pâtes", "De l'énergie pour courir et jouer"],
          ["Un œuf", "De quoi construire et réparer les muscles"],
          ["Une orange", "Des vitamines pour rester en forme"],
          ["Un verre de lait", "Du calcium pour les os"],
        ],
        "Une alimentation variée est la meilleure : les féculents donnent de l'énergie, les œufs de la protéine pour les muscles, les fruits des vitamines et le lait du calcium.",
      ),
      gap(
        "Inès prépare sa routine santé : avant de manger, on se lave les ___ ; la nuit, on dort pour que le corps ___ ; et on boit de l'___ pour s'hydrater.",
        ["mains", "récupère", "eau"],
        ["mains", "récupère", "eau", "pieds", "s'agite"],
        "Se laver les mains éloigne les microbes. Pendant le sommeil, le corps se repose, répare et grandit. L'eau est la meilleure boisson pour s'hydrater.",
      ),
    ],
  },
  {
    id: "sc-3",
    title: "La serre qui chante",
    intro: "Dans la grande serre, les plantes chantent quand elles sont heureuses. Apprenons ce dont elles ont besoin pour pousser !",
    level: 3,
    qs: [
      mat(
        "Le jardinier-lutin présente une plante à Soumaya. Relie chaque partie de la plante à son rôle.",
        [
          ["Les racines", "Elles absorbent l'eau du sol"],
          ["La tige", "Elle soutient la plante et transporte la sève"],
          ["Les feuilles", "Elles fabriquent la nourriture de la plante avec la lumière"],
          ["La fleur", "Elle permet de former les graines"],
        ],
        "Chaque partie a sa mission : les racines boivent, la tige soutient, les feuilles captent la lumière pour fabriquer la nourriture, et la fleur prépare les graines.",
      ),
      mcq(
        "Inès glisse une graine de haricot dans un petit pot de coton humide, rangé dans un tiroir sombre mais tiède. Que peut-il arriver ?",
        "La graine peut germer, car la lumière n'est pas nécessaire pour germer",
        ["La graine ne peut pas germer sans soleil", "La graine germe seulement si on la chante", "La graine ne germe que dans la terre, jamais dans du coton"],
        "Pour germer, une graine a surtout besoin d'eau, d'air et d'une température adaptée. La lumière devient indispensable plus tard, quand la jeune plante a ses feuilles.",
      ),
      ord(
        "Remets dans l'ordre la vie d'un haricot de la serre.",
        [
          "La graine est semée dans la terre humide",
          "La graine germe : une racine sort",
          "Une jeune plante avec ses premières feuilles pousse",
          "La plante adulte fleurit",
          "Le fruit (la gousse) contient de nouvelles graines",
        ],
        "Le cycle de vie d'une plante recommence toujours : graine, germination, croissance, floraison, puis fruit contenant de nouvelles graines.",
      ),
      tf(
        "Lina pense que les racines servent seulement à tenir la plante dans le sol, mais qu'elles ne boivent pas. Est-ce exact ?",
        false,
        "Les racines tiennent la plante, mais elles absorbent aussi l'eau et les sels minéraux du sol. Sans elles, la plante ne pourrait pas boire.",
      ),
      num(
        "Mimi le chaton ailé plante 12 graines de radis. Neuf d'entre elles germent. Combien de graines n'ont pas germé ?",
        ["3", "trois"],
        "12 − 9 = 3. Toutes les graines ne germent pas toujours : certaines sont abîmées ou manquent d'eau ou de chaleur.",
      ),
      gap(
        "Pour germer, une graine a besoin d'___, d'air et d'une température adaptée. Plus tard, la feuille verte fabrique la nourriture de la plante grâce à la ___.",
        ["eau", "lumière"],
        ["eau", "lumière", "sel", "ombre"],
        "L'eau réveille la graine. Ensuite, les feuilles utilisent la lumière pour fabriquer la nourriture de la plante.",
      ),
    ],
  },
  {
    id: "sc-4",
    title: "Le zoo des étoiles filantes",
    intro: "Quand une étoile filante passe, tous les animaux du royaume viennent se faire classer par les lutins-chercheurs !",
    level: 4,
    qs: [
      mat(
        "Les lutins classent les animaux croisés cette nuit. Relie chaque animal à son groupe.",
        [
          ["Le chat", "Mammifère"],
          ["L'aigle", "Oiseau"],
          ["La grenouille", "Amphibien"],
          ["Le saumon", "Poisson"],
          ["La couleuvre", "Reptile"],
        ],
        "Le chat allaite ses petits, l'aigle a des plumes, la grenouille vit d'abord dans l'eau puis sur terre, le saumon respire avec des branchies et la couleuvre a des écailles.",
      ),
      num(
        "Nour observe un papillon sous le télescope. Combien de pattes possède un insecte adulte ?",
        ["6", "six"],
        "Tous les insectes ont six pattes, un corps en trois parties (tête, thorax, abdomen) et souvent des ailes. Les araignées en ont huit.",
      ),
      tf(
        "Elias montre une araignée et déclare : « C'est un insecte, comme la fourmi. » A-t-il raison ?",
        false,
        "L'araignée a huit pattes et un corps en deux parties : c'est un arachnide, pas un insecte.",
      ),
      mcq(
        "Dans le lac scintillant, Aya voit un dauphin sauter. Dans quel groupe d'animaux le classe-t-elle ?",
        "Les mammifères",
        ["Les poissons", "Les reptiles", "Les amphibiens"],
        "Le dauphin vit dans l'eau mais respire de l'air avec des poumons et allaite son petit : c'est un mammifère, pas un poisson.",
      ),
      ord(
        "Une chenille se transforme en papillon près du champignon lumineux. Remets les étapes dans l'ordre.",
        ["L'œuf", "La chenille", "La chrysalide", "Le papillon adulte"],
        "Le papillon change complètement d'apparence en grandissant : œuf, chenille, chrysalide, puis papillon. On appelle cela une métamorphose.",
      ),
      gap(
        "Soumaya complète son carnet : les ___ ont des plumes et pondent des ___, tandis que les ___ allaitent leurs petits.",
        ["oiseaux", "œufs", "mammifères"],
        ["oiseaux", "œufs", "mammifères", "poissons", "reptiles"],
        "Les oiseaux sont les seuls animaux à avoir des plumes. Les mammifères nourrissent leurs petits avec leur lait.",
      ),
    ],
  },
  {
    id: "sc-5",
    title: "Qui mange qui dans la clairière ?",
    intro: "Dans la clairière enchantée, chacun mange et peut être mangé. Les lutins-chercheurs étudient les chaînes alimentaires et les saisons.",
    level: 5,
    qs: [
      ord(
        "Dans le potager du royaume, Yanis suit une chaîne alimentaire. Range-la dans l'ordre : de celui qui est mangé en premier à celui qui mange en dernier.",
        ["La feuille de chou", "La chenille", "La mésange", "L'épervier"],
        "Une chaîne alimentaire commence par un végétal. La chenille mange la feuille, la mésange mange la chenille, et l'épervier peut manger la mésange.",
      ),
      mcq(
        "Sur le panneau du lutin Noé, on lit : herbe → lapin → renard. Que veut dire la flèche ?",
        "« Est mangé par »",
        ["« Mange »", "« Ressemble à »", "« Habite avec »"],
        "La flèche indique ce que devient la nourriture : l'herbe est mangée par le lapin, qui est mangé par le renard. Elle va toujours du mangé vers le mangeur.",
      ),
      mat(
        "Les animaux du jardin ont des atouts pour survivre. Relie chaque animal à son adaptation.",
        [
          ["Le canard", "Des pattes palmées pour nager"],
          ["La taupe", "Des pattes larges pour creuser"],
          ["Le poisson", "Des branchies pour respirer dans l'eau"],
          ["Le hérisson", "Des piquants pour se défendre"],
        ],
        "Chaque animal est adapté à son milieu : la forme de son corps l'aide à se déplacer, respirer ou se protéger.",
      ),
      tf(
        "Le hérisson du jardin s'endort profondément pendant l'hiver : on appelle cela l'hibernation.",
        true,
        "En hiver, les insectes et les vers sont rares. Le hérisson ralentit son corps et vit sur ses réserves de graisse jusqu'au printemps.",
      ),
      num(
        "Lina chante les saisons du Jardin des Étoiles : printemps, été, … puis l'hiver. Quelle saison vient juste après l'été ?",
        ["automne", "l'automne"],
        "L'ordre des saisons est toujours : printemps, été, automne, hiver. En automne, les feuilles de beaucoup d'arbres tombent.",
      ),
      gap(
        "Dans la clairière, une plante verte fabrique elle-même sa nourriture ; le lapin, qui mange des plantes, est un ___ ; la chouette, qui mange des souris, est un ___.",
        ["herbivore", "carnivore"],
        ["herbivore", "carnivore", "omnivore", "insectivore"],
        "Un herbivore mange des végétaux, un carnivore mange d'autres animaux. La chouette chasse des souris, c'est donc un carnivore.",
      ),
    ],
  },
  {
    id: "sc-6",
    title: "Le lac de cristal et le vent",
    intro: "Le lac de cristal change d'aspect selon la température, et le vent souffle des secrets : l'eau et l'air n'ont plus de mystère pour les lutins !",
    level: 6,
    qs: [
      mat(
        "Les lutins observent l'eau sous toutes ses formes. Relie chaque transformation à son nom.",
        [
          ["Eau liquide → glace", "La solidification"],
          ["Glace → eau liquide", "La fusion"],
          ["Eau liquide → vapeur d'eau", "La vaporisation"],
          ["Vapeur d'eau → gouttelettes", "La condensation"],
        ],
        "L'eau change d'état selon la température : elle gèle (solidification), fond (fusion), s'évapore (vaporisation) ou redevient liquide au contact du froid (condensation).",
      ),
      ord(
        "Dans le ciel du Jardin des Étoiles, l'eau voyage sans cesse. Remets le cycle de l'eau dans l'ordre.",
        [
          "L'eau du lac s'évapore sous la chaleur du Soleil",
          "La vapeur se condense et forme des nuages",
          "La pluie ou la neige tombe",
          "L'eau s'écoule dans les rivières et retourne au lac",
        ],
        "L'eau ne disparaît jamais : elle s'évapore, forme des nuages, retombe en pluie, puis revient vers les rivières, les lacs et la mer.",
      ),
      num(
        "En plein hiver, le lac de cristal gèle. À quelle température l'eau pure gèle-t-elle (en degrés Celsius) ?",
        ["0", "zéro"],
        "L'eau pure gèle à 0 °C. En dessous de cette température, elle devient de la glace.",
        "°C",
      ),
      tf(
        "Mimi le chaton ailé souffle dans un sac vide : le sac se gonfle. L'air est un gaz qui occupe de la place, même quand on ne le voit pas.",
        true,
        "L'air est invisible, mais il existe : il remplit le sac et le fait gonfler. Comme tous les gaz, il occupe de la place.",
      ),
      mcq(
        "Inès retourne un verre vide et l'enfonce droit dans une bassine d'eau. L'eau n'arrive pas à remplir tout le verre. Pourquoi ?",
        "Le verre est rempli d'air qui prend la place de l'eau",
        ["Le verre est vide, il n'y a donc rien dedans", "L'eau est trop lourde pour monter dans le verre", "Le verre fabrique de la glace"],
        "Un verre « vide » contient de l'air. Cet air est piégé et empêche l'eau d'entrer, ce qui prouve que l'air occupe de la place.",
      ),
      gap(
        "Quand l'eau bout, elle devient de la vapeur d'eau, qui est un ___ ; sur un miroir froid, elle se transforme en gouttelettes liquides : c'est la ___.",
        ["gaz", "condensation"],
        ["gaz", "condensation", "solide", "fusion"],
        "La vapeur d'eau est un gaz invisible. En refroidissant, elle se condense en petites gouttes, comme la buée sur un miroir.",
      ),
    ],
  },
  {
    id: "sc-7",
    title: "L'atelier des mélanges",
    intro: "Dans l'atelier du lutin-alchimiste, on mélange, on filtre et on trie. Et chaque déchet peut avoir une seconde vie !",
    level: 7,
    qs: [
      mcq(
        "Elias verse une cuillère de sucre dans sa tisane de fleurs lumineuses, remue, et le sucre « disparaît ». Que s'est-il passé ?",
        "Le sucre s'est dissous dans l'eau : il est toujours là, mais invisible",
        ["Le sucre a disparu pour toujours", "Le sucre s'est transformé en eau", "Le sucre est devenu un gaz"],
        "Le sucre est soluble : ses minuscules morceaux se mélangent à l'eau. On ne les voit plus, mais on les goûte, et on peut les retrouver en faisant évaporer l'eau.",
      ),
      mat(
        "Le lutin-alchimiste doit séparer des mélanges. Relie chaque mélange à la bonne méthode.",
        [
          ["Sable et eau", "La filtration"],
          ["Sel dissous dans l'eau", "L'évaporation de l'eau"],
          ["Gros cailloux et sable fin", "Le tamisage"],
          ["Clous en fer et sable", "L'aimant"],
        ],
        "On choisit la méthode selon les propriétés de chaque matière : taille des grains, solubilité ou magnétisme.",
      ),
      tf(
        "Aya dissout du sucre dans de l'eau. La masse totale du mélange est égale à la masse de l'eau plus la masse du sucre.",
        true,
        "Dissoudre ne fait rien disparaître : toute la matière est encore dans le mélange. La masse est donc la somme des masses.",
      ),
      num(
        "Nour dissout 50 g de sel dans 200 g d'eau. Quelle est la masse du mélange obtenu ?",
        ["250", "250 g"],
        "200 g + 50 g = 250 g. Le sel dissous est invisible, mais sa masse est toujours là.",
        "g",
      ),
      ord(
        "Soumaya veut rendre claire l'eau boueuse du fossé. Remets les étapes de la filtration dans l'ordre.",
        [
          "Placer un filtre dans un entonnoir au-dessus d'un récipient",
          "Verser doucement l'eau boueuse dans le filtre",
          "La boue reste sur le filtre",
          "L'eau plus claire s'écoule dans le récipient",
        ],
        "Le filtre laisse passer l'eau mais retient les grosses particules. Attention : l'eau obtenue n'est pas forcément propre à boire !",
      ),
      gap(
        "Au Jardin des Étoiles, le verre, le papier et le métal peuvent être ___ pour fabriquer de nouveaux objets, et les épluchures deviennent du ___ dans le composteur.",
        ["recyclés", "compost"],
        ["recyclés", "compost", "jetés", "sable"],
        "Recycler permet de réutiliser la matière et de produire moins de déchets. Les déchets de cuisine se transforment en compost, un engrais naturel.",
      ),
    ],
  },
  {
    id: "sc-8",
    title: "Les fils de lumière et les aimants",
    intro: "Le lutin Yanis fabrique des lanternes avec des piles, des fils et des aimants. Mais il faut respecter les règles de sécurité !",
    level: 8,
    qs: [
      mcq(
        "Yanis relie une pile, des fils et une ampoule. Pour que l'ampoule s'allume, comment doit être le circuit ?",
        "Fermé, sans coupure",
        ["Ouvert, avec un fil détaché", "Sans pile", "Le plus long possible"],
        "Le courant circule seulement si le chemin est fermé en boucle : de la pile vers l'ampoule, puis retour à la pile. Une coupure l'arrête.",
      ),
      mcq(
        "Aya voit une prise de courant à moitié sortie du mur, avec des fils qui dépassent. Que doit-elle faire ?",
        "Ne pas y toucher et prévenir un adulte",
        ["Remettre les fils avec ses doigts", "Enfoncer un clou pour tout réparer", "Jouer avec, avec les mains mouillées"],
        "L'électricité de la maison est dangereuse. Il ne faut jamais toucher aux prises abîmées, ni les approcher d'eau : on prévient toujours un adulte.",
      ),
      mat(
        "Dans le circuit de la lanterne, chaque élément a sa mission. Relie-le à son rôle.",
        [
          ["La pile", "Elle fournit l'énergie électrique"],
          ["L'ampoule", "Elle transforme l'électricité en lumière"],
          ["L'interrupteur", "Il ouvre ou ferme le circuit"],
          ["Le fil de cuivre", "Il conduit le courant"],
        ],
        "Pour qu'un circuit fonctionne, il faut une source d'énergie, un récepteur, des fils conducteurs et souvent un interrupteur.",
      ),
      tf(
        "Les fils électriques sont recouverts de plastique parce que le plastique est un isolant : il ne laisse pas passer le courant.",
        true,
        "Le cuivre à l'intérieur conduit le courant. Le plastique à l'extérieur est isolant et protège les personnes d'un choc électrique.",
      ),
      ord(
        "Lina monte son premier circuit. Remets les étapes dans l'ordre.",
        [
          "Rassembler une pile, deux fils et une ampoule",
          "Relier un premier fil entre la pile et l'ampoule",
          "Relier le second fil entre l'ampoule et l'autre borne de la pile",
          "Observer l'ampoule : elle brille",
        ],
        "Le circuit doit former une boucle complète. C'est seulement quand le second fil est branché que le courant peut circuler.",
      ),
      gap(
        "Elias teste son aimant : il attire les objets en ___, comme un clou, mais pas le plastique. Deux pôles identiques se ___ , et deux pôles différents s'___.",
        ["fer", "repoussent", "attirent"],
        ["fer", "repoussent", "attirent", "bois", "cuivre"],
        "Les aimants attirent le fer. Entre deux aimants : « pôles pareils, on se repousse ; pôles contraires, on s'attire ».",
      ),
    ],
  },
  {
    id: "sc-9",
    title: "Ombres et échos du jardin",
    intro: "Quand la nuit tombe, les lutins jouent avec les ombres des champignons lumineux et écoutent l'écho des vallées.",
    level: 9,
    qs: [
      mcq(
        "Noé place sa main devant une lampe de poche contre le mur : une ombre apparaît. Pourquoi ?",
        "La main est opaque : elle arrête la lumière",
        ["La lampe fabrique de l'obscurité", "La main produit de la lumière noire", "La lumière traverse toujours tous les objets"],
        "Une ombre est la zone que la lumière n'atteint pas, parce qu'un objet opaque se trouve sur son chemin.",
      ),
      mat(
        "Les lutins testent des matériaux devant une lampe. Relie chaque matériau à la façon dont il laisse passer la lumière.",
        [
          ["Une vitre claire", "Transparent"],
          ["Du papier calque", "Translucide"],
          ["Un carton épais", "Opaque"],
        ],
        "Un matériau transparent laisse voir nettement à travers, un translucide laisse passer la lumière sans image nette, et un opaque la bloque.",
      ),
      ord(
        "Soumaya mesure l'ombre d'un champignon lumineux géant pendant une journée de beau temps. Range les ombres de la plus longue du matin à celle du soir, dans l'ordre du jour.",
        ["Ombre longue du matin", "Ombre courte de midi", "Ombre longue du soir"],
        "Le matin et le soir, le Soleil est bas dans le ciel et les ombres sont longues. À midi, il est au plus haut et les ombres sont les plus courtes.",
      ),
      mcq(
        "Pendant l'orage, Inès voit l'éclair, puis entend le tonnerre quelques secondes plus tard. Pourquoi ?",
        "La lumière se déplace beaucoup plus vite que le son",
        ["Le tonnerre se produit toujours après l'éclair, par hasard", "Le son est plus rapide que la lumière", "Le son n'existe qu'après la pluie"],
        "L'éclair et le tonnerre naissent en même temps. Mais la lumière nous parvient presque instantanément, alors que le son voyage bien plus lentement.",
      ),
      num(
        "Mimi le chaton ailé regarde un arc-en-ciel au-dessus des serres. Combien de couleurs distingue-t-on habituellement dans un arc-en-ciel ?",
        ["7", "sept"],
        "On distingue habituellement sept couleurs : rouge, orange, jaune, vert, bleu, indigo et violet. Elles viennent de la lumière blanche décomposée par les gouttes d'eau.",
      ),
      gap(
        "Dans la vallée, Lina frappe un tambour : un son naît d'une ___. Plus la vibration est ___, plus le son est aigu.",
        ["vibration", "rapide"],
        ["vibration", "rapide", "lente", "lumière"],
        "Quand la peau du tambour vibre, elle fait vibrer l'air qui transporte le son jusqu'à nos oreilles. Une vibration rapide donne un son aigu.",
      ),
    ],
  },
  {
    id: "sc-10",
    title: "Voyage jusqu'aux étoiles",
    intro: "Dernière mission ! Le télescope géant s'allume : jour, nuit, saisons, planètes… et comment protéger notre belle planète.",
    level: 10,
    qs: [
      mcq(
        "Depuis le télescope géant, Soumaya se demande pourquoi il y a un jour puis une nuit. Quelle est la bonne explication ?",
        "La Terre tourne sur elle-même, face au Soleil puis dos au Soleil",
        ["Le Soleil tourne autour de la Terre en 24 heures", "Le Soleil s'éteint la nuit", "La Lune cache le Soleil chaque soir"],
        "La Terre tourne sur elle-même en environ 24 heures. Quand notre région est face au Soleil, c'est le jour ; quand elle lui tourne le dos, c'est la nuit.",
      ),
      mcq(
        "Yanis cherche pourquoi il y a des saisons sur Terre. Quelle explication est correcte ?",
        "L'axe de la Terre est incliné pendant qu'elle tourne autour du Soleil",
        ["La Terre s'éloigne beaucoup du Soleil en hiver", "La Lune chauffe plus ou moins la Terre", "Le Soleil change de taille chaque saison"],
        "L'axe de la Terre est incliné. Selon sa position autour du Soleil, un hémisphère reçoit les rayons plus directement (été) ou plus de biais (hiver).",
      ),
      ord(
        "Les lutins-chercheurs rangent des planètes en partant de la plus proche du Soleil. Aide-les à les ordonner.",
        ["Mercure", "La Terre", "Mars", "Jupiter", "Saturne"],
        "L'ordre des planètes à partir du Soleil est : Mercure, Vénus, la Terre, Mars, Jupiter, Saturne, Uranus, Neptune.",
      ),
      mat(
        "Dans le ciel du Jardin des Étoiles, relie chaque astre à ce qu'il est.",
        [
          ["Le Soleil", "Une étoile qui produit sa lumière"],
          ["La Terre", "Une planète qui tourne autour du Soleil"],
          ["La Lune", "Le satellite naturel de la Terre"],
        ],
        "Le Soleil est une étoile, la Terre est une planète, et la Lune tourne autour de la Terre : c'est son satellite naturel.",
      ),
      tf(
        "Nour affirme que la Lune produit sa propre lumière, comme le Soleil. Est-ce exact ?",
        false,
        "La Lune ne produit pas de lumière : elle renvoie vers nous la lumière du Soleil. C'est pour cela qu'elle brille.",
      ),
      gap(
        "Le Soleil et le vent fournissent des énergies ___ . Pour protéger la planète, on peut aussi ___ l'énergie en éteignant les lampes inutiles.",
        ["renouvelables", "économiser"],
        ["renouvelables", "économiser", "gaspiller", "polluantes"],
        "Les énergies renouvelables se reconstituent naturellement. Éteindre ce qu'on n'utilise pas aide à ménager les ressources de la Terre.",
      ),
    ],
  },
];

export const EXAM_P4: ExamBlock[] = [
  {
    title: "Le hérisson du jardin",
    ctx: {
      title: "Texte à lire",
      body: [
        "Le hérisson vit dans les jardins et les haies. Le jour, il dort dans un tas de feuilles. La nuit, il cherche des escargots, des vers et des insectes. Son dos est couvert de piquants qui le protègent. Les petits boivent le lait de leur mère. En hiver, le hérisson s'endort profondément dans un abri : c'est l'hibernation.",
      ],
    },
    qs: [
      mcq(
        "D'après le texte, quel indice montre que le hérisson est un mammifère ?",
        "Les petits boivent le lait de leur mère",
        ["Il a des piquants", "Il dort le jour", "Il vit dans les haies"],
        "Les mammifères allaitent leurs petits. Les piquants, les habitudes de sommeil ou le lieu de vie ne suffisent pas à classer un animal.",
      ),
      tf(
        "D'après le texte, le hérisson mange surtout de l'herbe.",
        false,
        "Le texte dit qu'il mange des escargots, des vers et des insectes : ce sont des animaux. Le hérisson n'est donc pas un herbivore.",
      ),
      num(
        "Combien de saisons le hérisson passe-t-il en hibernation, si l'on sait que cela dure seulement l'hiver ?",
        ["1", "une", "un"],
        "L'hibernation a lieu pendant l'hiver seulement : c'est une saison sur les quatre.",
      ),
    ],
  },
  {
    title: "L'expérience de la lentille",
    ctx: {
      title: "Expérience",
      body: [
        "Aya prépare trois pots de graines de lentilles. Pot A : arrosé, placé près de la fenêtre. Pot B : jamais arrosé, placé près de la fenêtre. Pot C : arrosé, placé dans un placard sombre. Après une semaine, les graines des pots A et C ont germé, mais pas celles du pot B.",
      ],
    },
    qs: [
      mcq(
        "Que montre cette expérience ?",
        "Une graine a besoin d'eau pour germer",
        ["Une graine a besoin de lumière pour germer", "Une graine ne germe que dans le noir", "L'eau ne sert à rien pour une graine"],
        "Les pots A et B ne diffèrent que par l'eau, et seul A a germé. Le pot C a germé dans le noir : la lumière n'est donc pas nécessaire pour germer.",
      ),
      num(
        "Dans l'expérience d'Aya, combien de pots ont des graines qui ont germé ?",
        ["2", "deux"],
        "Les pots A et C ont germé, le pot B non : cela fait deux pots.",
      ),
    ],
  },
  {
    title: "Le laboratoire des lutins",
    qs: [
      mat(
        "Mimi le chaton ailé explore le jardin. Relie chaque organe au sens qu'il permet.",
        [
          ["L'œil", "La vue"],
          ["L'oreille", "L'ouïe"],
          ["Le nez", "L'odorat"],
          ["La langue", "Le goût"],
          ["La peau", "Le toucher"],
        ],
        "Chaque sens a son organe : l'œil voit, l'oreille entend, le nez sent, la langue goûte et la peau touche.",
      ),
      ord(
        "Le lutin Elias range des animaux du plus petit au plus grand.",
        ["La fourmi", "La souris", "Le chat", "Le cheval"],
        "Une fourmi mesure quelques millimètres, une souris quelques centimètres, un chat environ cinquante centimètres, et un cheval plus de deux mètres.",
      ),
      gap(
        "Le lutin-dentiste explique à Nour : les ___ coupent les aliments et les ___ les broient.",
        ["incisives", "molaires"],
        ["incisives", "molaires", "gencives", "langues"],
        "Les incisives, à l'avant, coupent. Les molaires, à l'arrière, sont larges et écrasent la nourriture avant la digestion.",
      ),
      mcq(
        "Dans le jardin enchanté, Inès observe un champignon, un lapin et une pomme. Parmi eux, lequel est un animal herbivore ?",
        "Le lapin",
        ["La pomme", "Le champignon", "Aucun des trois"],
        "Le lapin est un animal qui se nourrit de végétaux : c'est un herbivore. La pomme est un fruit et le champignon n'est pas un animal.",
      ),
    ],
  },
];

export const EXAM_P5: ExamBlock[] = [
  {
    title: "Le glaçon de Nour",
    ctx: {
      title: "Expérience",
      body: [
        "Nour pose un glaçon de 40 g dans un verre et le laisse fondre dans une pièce chaude. Quand il est entièrement fondu, elle pèse l'eau obtenue : 40 g.",
      ],
    },
    qs: [
      mcq(
        "Que montre cette pesée ?",
        "La fusion ne change pas la masse : la matière se conserve",
        ["La glace est plus lourde que l'eau liquide", "Une partie du glaçon a disparu en fondant", "L'eau liquide est toujours plus lourde que la glace"],
        "Quand la glace fond, elle change d'état mais rien ne disparaît : la masse reste identique, 40 g avant comme après.",
      ),
      num(
        "Un autre glaçon de 25 g fond complètement. Quelle sera la masse de l'eau obtenue ?",
        ["25", "25 g"],
        "La masse se conserve lors d'un changement d'état : 25 g de glace donnent 25 g d'eau.",
        "g",
      ),
      tf(
        "Quand le glaçon fond, il disparaît complètement.",
        false,
        "Il ne disparaît pas : il se transforme en eau liquide. Elle est encore dans le verre, avec la même masse.",
      ),
    ],
  },
  {
    title: "La lanterne qui ne brille pas",
    ctx: {
      title: "Observation",
      body: [
        "Inès a relié une pile, une ampoule et un interrupteur avec des fils de cuivre. Mais l'interrupteur est en position ouverte et l'ampoule reste éteinte.",
      ],
    },
    qs: [
      mcq(
        "Que doit faire Inès pour allumer l'ampoule ?",
        "Fermer l'interrupteur pour que le circuit soit fermé",
        ["Retirer l'ampoule du circuit", "Remplacer les fils de cuivre par des fils de plastique", "Casser la pile en deux"],
        "Un interrupteur ouvert coupe le circuit. En le fermant, on referme la boucle et le courant peut circuler.",
      ),
      tf(
        "Une cuillère en métal, placée dans un circuit simple à la place d'un fil, laisse passer le courant.",
        true,
        "Les métaux sont de bons conducteurs : la cuillère peut remplacer un fil. Le bois sec ou le plastique, eux, seraient isolants.",
      ),
    ],
  },
  {
    title: "Défis du royaume",
    qs: [
      ord(
        "Lina suit le voyage d'une bouteille en plastique recyclée. Remets les étapes dans l'ordre.",
        [
          "On jette la bouteille dans la bonne poubelle",
          "Au centre de tri, on sépare les matières",
          "La matière est broyée, nettoyée puis fondue",
          "On fabrique un nouvel objet",
        ],
        "Le recyclage commence par un bon tri à la maison. Ensuite, la matière est récupérée et transformée en nouveaux objets.",
      ),
      gap(
        "Une ombre se forme quand un objet ___ arrête la lumière. Si la lampe se rapproche de l'objet, l'ombre devient plus ___.",
        ["opaque", "grande"],
        ["opaque", "grande", "transparent", "petite"],
        "Un objet opaque bloque la lumière. Plus la lampe est proche, plus l'ombre s'agrandit, comme tu peux le tester avec ta main.",
      ),
      mcq(
        "Au Jardin des Étoiles, Elias cherche une énergie renouvelable. Laquelle choisit-il ?",
        "Le vent",
        ["Le pétrole", "Le charbon", "Le gaz naturel"],
        "Le vent se renouvelle sans cesse. Le pétrole, le charbon et le gaz se sont formés pendant des millions d'années et finiront par manquer.",
      ),
      tf(
        "Dans le vide complet de l'espace, le son ne peut pas se propager.",
        true,
        "Le son a besoin de matière (air, eau, solide) pour se déplacer. Dans le vide, il n'y a rien pour transmettre la vibration.",
      ),
    ],
  },
];
