import { mcq, tf, num, ord, mat, gap, type Mission, type ExamBlock } from "../kit";

// Banque « Compréhension de lecture » — monde « Le Village des Contes ».
// Tous les textes et questions sont originaux.

export const QS_RANGE = [5, 5] as [number, number];

export const MISSIONS: Mission[] = [
  // ───────────── Niveau 1 : récit très simple ─────────────
  {
    id: "le-1",
    level: 1,
    title: "Le phare de Mimi",
    intro: "Mimi, le chaton ailé, t’attend devant sa chaumière-livre. Lis son petit récit avec attention !",
    text: {
      title: "Un matin au phare",
      body: [
        "Mimi, le chaton ailé, vit dans une chaumière-livre au bord du Village des Contes. Chaque matin, il vole jusqu’au phare pour réveiller Yanis, le gardien.",
        "Ce matin, Mimi trouve la lanterne éteinte. Il miaule très fort. Yanis arrive en pantoufles et rallume la flamme avec une allumette dorée. Pour remercier Mimi, il lui donne un bol de lait tiède.",
      ],
    },
    qs: [
      mcq("Où vit Mimi le chaton ailé ?", "Dans une chaumière-livre", ["Dans le phare", "Dans une forêt parlante", "Dans la maison de Yanis"],
        "Le texte dit au début : « Mimi vit dans une chaumière-livre au bord du Village des Contes »."),
      ord("Remets les événements dans l’ordre du récit.",
        ["Mimi vole jusqu’au phare", "Mimi trouve la lanterne éteinte", "Yanis rallume la flamme", "Mimi reçoit un bol de lait tiède"],
        "Mimi arrive d’abord au phare, puis il voit la lanterne éteinte. Yanis la rallume, et Mimi est enfin remercié avec du lait."),
      tf("Yanis est le gardien du phare.", true,
        "Dans le premier paragraphe, on lit que Mimi réveille « Yanis, le gardien »."),
      mcq("Que veut dire le mot « tiède » dans « un bol de lait tiède » ?", "Ni froid ni brûlant", ["Très chaud", "Glacé", "Sucré"],
        "Tiède signifie un peu chaud, agréable à boire : ni froid, ni brûlant. C’est parfait pour un chaton !"),
      num("Avec quoi Yanis rallume-t-il la flamme ? Réponds par un seul mot.", ["allumette", "une allumette", "une allumette dorée"],
        "Relis la fin du deuxième paragraphe : Yanis rallume la flamme « avec une allumette dorée »."),
    ],
  },

  // ───────────── Niveau 2 : poème ─────────────
  {
    id: "le-2",
    level: 2,
    title: "Le chant de la forêt",
    intro: "Dans la forêt du Village des Contes, chaque arbre a sa chanson. Écoute bien ce poème !",
    text: {
      title: "Le chant de la forêt",
      body: [
        "Quand le soleil se lève\nAu-dessus des grands pins,\nLa forêt se réveille\nEt chante son refrain.",
        "Le ruisseau fait des rires,\nLe vent joue du tambour,\nLes feuilles, en soupirs,\nSe disent : « Bonjour ! »",
        "Les oiseaux sont des cloches\nQui sonnent dans les nids,\nPuis la lune s’approche\nEt murmure : « Bonne nuit. »",
        "Au Village des Contes,\nChaque arbre a sa chanson.\nFerme les yeux, écoute :\nTu connaîtras leur nom.",
      ],
    },
    qs: [
      mcq("Quand la forêt se réveille-t-elle ?", "Quand le soleil se lève", ["Quand la lune apparaît", "Quand le vent s’arrête", "Quand il se met à pleuvoir"],
        "Dans la première strophe : « Quand le soleil se lève [...] La forêt se réveille »."),
      mat("Relie chaque élément de la forêt à ce qu’il fait dans le poème.",
        [["Le ruisseau", "fait des rires"], ["Le vent", "joue du tambour"], ["Les feuilles", "se disent « Bonjour ! »"], ["La lune", "murmure « Bonne nuit »"]],
        "Chaque élément est associé à son action dans les strophes 2 et 3. Le poète fait « parler » la nature, comme dans un conte."),
      mcq("Que veut dire le poète avec « Les oiseaux sont des cloches » ?", "Leurs chants sonnent comme des cloches", ["Les oiseaux sont faits de métal", "Les oiseaux vivent dans une église", "Les oiseaux ont peur des cloches"],
        "Le poète compare le chant clair des oiseaux au son des cloches. C’est une image, pas une vraie cloche !"),
      tf("Dans ce poème, la journée commence avec le soleil et se termine avec la lune.", true,
        "Le poème commence par « Quand le soleil se lève » et la troisième strophe finit avec la lune qui dit « Bonne nuit »."),
      gap("Complète : Le poème parle d’une ___ qui chante. Le ___ fait des rires et la ___ dit « Bonne nuit ».",
        ["forêt", "ruisseau", "lune"], ["forêt", "ruisseau", "lune", "vent", "soleil"],
        "La forêt chante (strophe 1), le ruisseau fait des rires (strophe 2) et c’est la lune qui murmure « Bonne nuit » (strophe 3)."),
    ],
  },

  // ───────────── Niveau 3 : dialogue / saynète ─────────────
  {
    id: "le-3",
    level: 3,
    title: "Le dragon enrhumé",
    intro: "Quelque chose d’étrange arrive à Pistache, le dragon du village. Lis cette petite saynète !",
    text: {
      title: "Pistache a un problème",
      body: [
        "Personnages : Noé, Aya et Pistache, le petit dragon.",
        "Le dragon est assis devant la boulangerie du village.",
        "AYA (inquiète) — Pistache, pourquoi des bulles sortent-elles de ta bouche au lieu de flammes ?",
        "PISTACHE (d’une petite voix) — Atchoum ! Je suis enrhumé depuis hier soir. J’ai dormi sans mon écharpe.",
        "NOÉ — Pas de panique ! Ma grand-mère prépare une tisane au miel et au thym. Elle soigne tous les rhumes.",
        "AYA — Alors courons chez elle. Pistache, couvre-toi bien !",
        "PISTACHE (soulagé) — Merci, les amis. Sans mes flammes, je ne pouvais même plus chauffer le pain du boulanger.",
      ],
    },
    qs: [
      mcq("Pourquoi des bulles sortent-elles de la bouche de Pistache ?", "Parce qu’il est enrhumé", ["Parce qu’il a peur des enfants", "Parce qu’il joue avec Aya", "Parce que le boulanger l’a puni"],
        "Pistache répond lui-même : « Je suis enrhumé depuis hier soir ». Son rhume l’empêche de cracher des flammes."),
      mcq("Qui propose la tisane au miel et au thym ?", "Noé", ["Aya", "Pistache", "Le boulanger"],
        "C’est Noé qui parle de la tisane. Attention : la grand-mère qui la prépare est la sienne, pas celle d’Aya."),
      tf("La grand-mère qui prépare la tisane est celle d’Aya.", false,
        "Noé dit : « Ma grand-mère prépare une tisane ». C’est donc la grand-mère de Noé."),
      mcq("Que signifie le mot « soulagé » dans « PISTACHE (soulagé) » ?", "Content, car son souci devient plus léger", ["Fâché contre ses amis", "Très fatigué", "Surpris par une mauvaise nouvelle"],
        "Pistache remercie ses amis car une solution existe : il se sent soulagé, comme si un poids disparaissait."),
      ord("Remets les moments de la saynète dans l’ordre.",
        ["Aya remarque les bulles", "Pistache explique qu’il est enrhumé", "Noé parle de la tisane de sa grand-mère", "Pistache remercie ses amis"],
        "Suis les répliques : Aya pose la question, Pistache répond, Noé propose son idée, puis Pistache dit merci à la fin."),
    ],
  },

  // ───────────── Niveau 4 : documentaire (animal) ─────────────
  {
    id: "le-4",
    level: 4,
    title: "Le hérisson des jardins",
    intro: "Au Village des Contes, le hérisson est un voisin discret. Découvre sa vie grâce à ce texte documentaire.",
    text: {
      title: "Le hérisson, petit habitant des jardins",
      body: [
        "Le hérisson est un petit animal couvert de piquants. Le jour, il dort dans un tas de feuilles. La nuit, il se promène pour chercher sa nourriture : des escargots, des vers de terre et des insectes. Il ne mange pas de feuilles.",
        "Quand un danger approche, il se roule en boule et ses piquants le protègent. En automne, il mange beaucoup pour faire des réserves de graisse. Puis, quand le froid arrive, il s’endort dans un abri bien caché : c’est l’hibernation. Il se réveille au printemps.",
        "Pour l’aider, on peut laisser un coin de jardin sauvage avec des feuilles mortes.",
      ],
      source: "Petit livre des animaux du Village des Contes",
    },
    qs: [
      mcq("Que mange le hérisson ?", "Des escargots, des vers de terre et des insectes", ["Des feuilles et des fruits", "Des poissons et des grenouilles", "Des graines et des noisettes"],
        "Le texte le dit clairement : « des escargots, des vers de terre et des insectes. Il ne mange pas de feuilles »."),
      tf("Le hérisson cherche sa nourriture en plein jour.", false,
        "Le texte explique que « le jour, il dort » et que « la nuit, il se promène pour chercher sa nourriture »."),
      mcq("Que signifie le mot « hibernation » dans le texte ?", "Passer l’hiver endormi dans un abri", ["Voyager vers des pays chauds", "Manger toute la nuit", "Se rouler en boule"],
        "La phrase l’explique : quand le froid arrive, le hérisson « s’endort dans un abri bien caché : c’est l’hibernation »."),
      mcq("Pourquoi le hérisson mange-t-il beaucoup en automne ?", "Pour faire des réserves de graisse avant l’hiver", ["Pour faire grandir ses piquants", "Parce qu’il y a moins d’escargots", "Pour se réveiller plus vite au printemps"],
        "Le texte dit : « En automne, il mange beaucoup pour faire des réserves de graisse ». Ces réserves l’aident à passer l’hiver."),
      mat("Relie chaque moment à ce que fait le hérisson.",
        [["Le jour", "il dort dans les feuilles"], ["La nuit", "il cherche à manger"], ["En cas de danger", "il se roule en boule"], ["En automne", "il fait des réserves de graisse"], ["Au printemps", "il se réveille"]],
        "Chaque information se trouve dans le texte : le jour et la nuit (1er paragraphe), le danger, l’automne et le printemps (2e paragraphe)."),
    ],
  },

  // ───────────── Niveau 5 : lettre ─────────────
  {
    id: "le-5",
    level: 5,
    title: "Une invitation sous le phare",
    intro: "Le facteur du village a déposé une lettre dans ta boîte. Qui l’a écrite, et pourquoi ?",
    text: {
      title: "Une lettre pour Elias",
      body: [
        "Cher Elias,",
        "Comment vas-tu ? Moi, je vais très bien. Je t’écris parce que samedi prochain, nous organisons la Fête des Lanternes au pied du grand phare. Tous les enfants du village y viendront avec une lanterne qu’ils ont fabriquée eux-mêmes. La mienne est en papier bleu et je l’ai décorée d’étoiles dorées.",
        "Mimi, mon chaton ailé, portera une petite clochette pour guider le cortège. À la fin, nous mangerons des gaufres chaudes et nous écouterons un conte raconté par la vieille Dame Rose. Apporte une lanterne et un manteau, car le soir, il fait frais près de la mer.",
        "Réponds-moi vite : j’ai tellement hâte de te voir !",
        "Je t’embrasse très fort,",
        "Soumaya",
      ],
    },
    qs: [
      mcq("Pourquoi Soumaya écrit-elle cette lettre à Elias ?", "Pour l’inviter à la Fête des Lanternes", ["Pour lui raconter ses vacances", "Pour lui demander une lanterne", "Pour remercier Dame Rose"],
        "Soumaya annonce : « Je t’écris parce que samedi prochain, nous organisons la Fête des Lanternes ». Elle l’invite donc."),
      num("Quel jour de la semaine la fête a-t-elle lieu ? Réponds par un seul mot.", ["samedi", "le samedi", "samedi prochain"],
        "Dans le premier paragraphe : « samedi prochain, nous organisons la Fête des Lanternes »."),
      tf("La lanterne de Soumaya est en papier rouge.", false,
        "Soumaya écrit : « La mienne est en papier bleu » et décorée d’étoiles dorées."),
      mat("Relie chaque personnage ou objet à son rôle pendant la fête.",
        [["La clochette de Mimi", "guider le cortège"], ["Les gaufres chaudes", "se régaler à la fin"], ["Dame Rose", "raconter un conte"], ["Les étoiles dorées", "décorer la lanterne"]],
        "La clochette guide le cortège, les gaufres sont pour la fin et Dame Rose raconte le conte (deuxième paragraphe) ; les étoiles dorées décorent la lanterne de Soumaya (premier paragraphe)."),
      mcq("Que montre la phrase « j’ai tellement hâte de te voir » ?", "Soumaya est impatiente de retrouver Elias", ["Soumaya est fâchée contre Elias", "Soumaya a peur de la fête", "Soumaya est très fatiguée"],
        "« Avoir hâte » veut dire attendre avec impatience et plaisir. Soumaya est donc joyeuse et pressée de voir son ami."),
    ],
  },

  // ───────────── Niveau 6 : actualité (écologie) ─────────────
  {
    id: "le-6",
    level: 6,
    title: "Opération plage propre",
    intro: "Le « Journal des enfants » du village raconte comment des élèves prennent soin de la mer. Lis l’article !",
    text: {
      title: "Des écoliers nettoient la plage",
      source: "Le Journal des enfants du Village des Contes",
      body: [
        "Cette semaine, les élèves de l’école des Mouettes ont passé une matinée entière sur la plage. Équipés de gants et de grands sacs, ils ont ramassé des bouteilles en plastique, des emballages et même un vieux seau. « Les déchets ne disparaissent pas tout seuls, explique la maîtresse, Mme Karima. Quand la marée monte, ils sont emportés vers la mer. »",
        "En effet, le plastique met très longtemps à disparaître. Il peut blesser les oiseaux et les poissons, qui le prennent parfois pour de la nourriture. Après le ramassage, les enfants ont trié les déchets : le verre, le plastique et le papier n’ont pas été jetés dans la même poubelle, afin d’être recyclés.",
        "Pour finir, chaque classe a dessiné une affiche pour demander aux promeneurs de garder la plage propre. Nour est fier de son travail : « Demain, je rapporterai mes déchets à la maison ! »",
      ],
    },
    qs: [
      mcq("Quel titre résume le mieux cet article ?", "Des écoliers nettoient la plage", ["Une classe découvre un trésor", "Les poissons apprennent à nager", "La marée monte jusqu’à l’école"],
        "L’article raconte le ramassage des déchets sur la plage par les élèves de l’école des Mouettes."),
      ord("Remets les actions des élèves dans l’ordre du texte.",
        ["Les élèves ramassent les déchets", "Ils trient le verre, le plastique et le papier", "Chaque classe dessine une affiche", "Nour promet de rapporter ses déchets"],
        "L’article suit cet ordre : ramassage, tri, affiches pour les promeneurs, et enfin la promesse de Nour."),
      mcq("Pourquoi le plastique est-il dangereux pour les animaux marins ?", "Ils peuvent le prendre pour de la nourriture", ["Il rend l’eau trop chaude", "Il fait trop de bruit", "Il change la couleur des poissons"],
        "Le deuxième paragraphe précise : il peut blesser les oiseaux et les poissons, « qui le prennent parfois pour de la nourriture »."),
      tf("D’après la maîtresse, les déchets disparaissent tout seuls sur la plage.", false,
        "Mme Karima dit le contraire : « Les déchets ne disparaissent pas tout seuls ». Quand la marée monte, ils partent vers la mer."),
      mcq("Que veut dire le verbe « trier » dans « les enfants ont trié les déchets » ?", "Les séparer par catégorie", ["Les jeter n’importe où", "Les brûler", "Les laver"],
        "Les enfants ont mis le verre, le plastique et le papier à des endroits différents pour que chacun soit recyclé."),
    ],
  },

  // ───────────── Niveau 7 : conte / récit ─────────────
  {
    id: "le-7",
    level: 7,
    title: "La forêt qui parle",
    intro: "Lina s’enfonce dans une forêt où les arbres bavardent. Saura-t-elle retrouver ce qu’elle a perdu ?",
    text: {
      title: "Lina et le bonnet rouge",
      body: [
        "Ce matin-là, Lina s’enfonça dans la forêt parlante pour retrouver son bonnet rouge, celui que sa grand-mère avait tricoté pour elle. Les arbres de cette forêt bavardaient du matin au soir, et Lina savait qu’ils connaissaient tous les secrets.",
        "— Avez-vous vu mon bonnet ? demanda-t-elle au vieux chêne.",
        "— Hum, hum, grommela-t-il d’une voix grave. Moi, je dormais. Interroge plutôt le hêtre : il voit tout, même la nuit.",
        "Le hêtre murmura : « Un écureuil l’a emporté ce matin. Il grelottait, car l’hiver approche. Tu le trouveras tout en haut, dans le creux du vieux sapin. »",
        "Lina grimpa avec prudence, branche après branche. Dans le nid, elle découvrit l’écureuil, blotti au chaud sous le bonnet rouge. Il la regarda avec de grands yeux inquiets. Lina hésita. Puis elle sourit doucement : « Garde-le, petit frileux. Moi, je demanderai à ma grand-mère d’en tricoter un autre. »",
        "En redescendant, elle entendit tous les arbres applaudir. Elle se sentit fière et légère, comme si elle avait reçu un cadeau.",
      ],
    },
    qs: [
      ord("Remets les moments de l’histoire dans l’ordre.",
        ["Lina interroge le vieux chêne", "Le hêtre lui parle de l’écureuil", "Lina grimpe jusqu’au nid", "Lina laisse le bonnet à l’écureuil", "Les arbres applaudissent"],
        "Suis les paragraphes : le chêne d’abord, puis le hêtre, la montée vers le nid, le geste généreux de Lina et enfin les applaudissements."),
      mcq("Pourquoi Lina laisse-t-elle le bonnet à l’écureuil ?", "Elle voit qu’il a froid et décide de l’aider", ["Elle n’aime plus la couleur rouge", "Le vieux chêne le lui a ordonné", "Elle n’arrive pas à attraper l’écureuil"],
        "L’écureuil « grelottait » de froid et se trouve « blotti au chaud sous le bonnet ». Lina comprend qu’il en a besoin."),
      tf("Le vieux chêne a vu l’écureuil emporter le bonnet.", false,
        "Le chêne répond : « Moi, je dormais ». C’est le hêtre qui « voit tout » et qui connaît la réponse."),
      mcq("Comment Lina se sent-elle à la fin de l’histoire ?", "Fière et légère", ["Triste et fâchée", "Inquiète et pressée", "Ennuyée"],
        "La dernière phrase le dit : « Elle se sentit fière et légère, comme si elle avait reçu un cadeau »."),
      mcq("Quel est le type de ce texte ?", "Un conte, c’est-à-dire un récit imaginaire", ["Un documentaire sur les forêts", "Une recette de cuisine", "Un article de journal"],
        "Des arbres qui parlent n’existent pas dans la réalité : c’est un conte, une histoire inventée avec des personnages et des dialogues."),
    ],
  },

  // ───────────── Niveau 8 : documentaire (phénomène) ─────────────
  {
    id: "le-8",
    level: 8,
    title: "Les secrets de la marée",
    intro: "Le gardien du phare connaît bien la mer. Il t’explique pourquoi l’eau monte et descend.",
    text: {
      title: "Les marées : quand la mer respire",
      source: "Le carnet du gardien de phare",
      body: [
        "Si tu passes tes vacances au bord de la mer, tu as peut-être remarqué que l’eau monte, puis redescend. Ce mouvement s’appelle la marée. Quand l’eau monte, on parle de marée haute. Quand elle descend et laisse apparaître le sable, on parle de marée basse.",
        "Les marées ont lieu environ deux fois par jour. Elles sont causées surtout par la Lune. Par sa force d’attraction, la Lune attire un peu l’eau des océans, et celle-ci se soulève. Le Soleil joue lui aussi un rôle, mais moins important.",
        "À marée basse, la plage devient un vrai terrain de jeu : on peut y chercher des coquillages, des crabes ou des étoiles de mer. Mais il faut être prudent ! Avant de partir, on doit toujours se renseigner sur l’heure de la marée haute, pour ne pas être surpris par l’eau qui revient. Les gardiens de phare, eux, consultent des tables des marées pour prévenir les bateaux.",
      ],
    },
    qs: [
      mat("Relie chaque mot à son explication.",
        [["Marée haute", "l’eau est montée"], ["Marée basse", "le sable apparaît"], ["La Lune", "attire l’eau des océans"], ["Le gardien de phare", "consulte les tables des marées"]],
        "Chaque explication se trouve dans le texte : les deux marées (1er paragraphe), la Lune (2e paragraphe) et le gardien de phare (dernière phrase)."),
      mcq("D’après le texte, quelle est la cause principale des marées ?", "L’attraction de la Lune", ["Le vent", "Le passage des bateaux", "La chaleur du Soleil seule"],
        "Le texte dit : « Elles sont causées surtout par la Lune ». Le Soleil joue un rôle moins important."),
      tf("Les marées ont lieu environ deux fois par jour.", true,
        "C’est écrit au début du deuxième paragraphe : « Les marées ont lieu environ deux fois par jour »."),
      mcq("Pourquoi faut-il connaître l’heure de la marée haute avant de jouer sur la plage ?", "Pour ne pas être surpris par l’eau qui revient", ["Pour trouver plus de coquillages", "Pour savoir s’il y aura du soleil", "Pour réveiller le gardien du phare"],
        "Le texte explique qu’on doit se renseigner « pour ne pas être surpris par l’eau qui revient ». C’est une règle de prudence."),
      mcq("Quel est le but principal de ce texte ?", "Expliquer un phénomène naturel au lecteur", ["Faire rire avec une histoire drôle", "Donner une recette", "Inviter le lecteur à une fête"],
        "Le texte donne des informations vraies et des explications sur les marées : c’est un texte documentaire qui cherche à informer."),
    ],
  },

  // ───────────── Niveau 9 : documentaire (animal marin) ─────────────
  {
    id: "le-9",
    level: 9,
    title: "La grande chanteuse des mers",
    intro: "Un voyageur du village a rapporté ce texte sur une géante des océans. Découvre ses secrets !",
    text: {
      title: "La baleine à bosse, la grande chanteuse des océans",
      source: "Petit livre des animaux du Village des Contes",
      body: [
        "La baleine à bosse est l’un des plus grands animaux de la planète, mais ce n’est pas un poisson. C’est un mammifère : elle respire de l’air grâce à des narines situées sur le dessus de sa tête, qu’on appelle des évents. Régulièrement, elle remonte à la surface pour souffler un jet d’eau et reprendre de l’air.",
        "Cette baleine est célèbre pour ses chants. Les mâles produisent des suites de sons longs et variés, un peu comme des mélodies, que l’on peut entendre à de très grandes distances sous l’eau. Les scientifiques pensent que ces chants servent à communiquer, mais ils cherchent encore à bien les comprendre.",
        "Chaque année, les baleines à bosse font un long voyage. En été, elles vivent dans des mers froides, où elles trouvent beaucoup de nourriture : de petits poissons et le krill, des animaux minuscules qui ressemblent à des crevettes. En hiver, elles nagent vers des eaux plus chaudes, où naissent les bébés. Le baleineau boit le lait de sa mère, comme tous les mammifères.",
        "Parfois, on voit une baleine à bosse sauter hors de l’eau et retomber avec un énorme éclaboussement. Personne ne sait vraiment pourquoi elle fait cela : pour jouer, pour parler aux autres ou pour se débarrasser de petits passagers collés sur sa peau ? Le mystère reste entier.",
      ],
    },
    qs: [
      tf("Comme les poissons, la baleine à bosse respire sous l’eau grâce à des branchies.", false,
        "Le texte précise que ce n’est pas un poisson mais un mammifère : elle respire de l’air par des évents, sur le dessus de sa tête."),
      mcq("Dans quel but l’auteur a-t-il écrit ce texte ?", "Informer le lecteur sur la vie d’un animal", ["Raconter une aventure imaginaire", "Convaincre d’acheter un livre", "Faire peur au lecteur"],
        "Le texte donne des faits sur la baleine à bosse (respiration, chant, voyage) : c’est un texte documentaire qui informe."),
      ord("Remets les étapes de la vie de la baleine à bosse dans l’ordre du texte.",
        ["Elle vit dans les mers froides et mange du krill", "Elle nage vers des eaux plus chaudes", "Son baleineau naît", "Il boit le lait de sa mère"],
        "Le troisième paragraphe suit le voyage de la baleine : été dans les mers froides, hiver dans les eaux chaudes, naissance puis lait maternel."),
      mcq("D’après le texte, que désigne le mot « baleineau » ?", "Le bébé de la baleine", ["Un petit poisson mangé par la baleine", "Le jet d’eau de la baleine", "Un chant de baleine"],
        "La phrase « où naissent les bébés. Le baleineau boit le lait de sa mère » montre que le baleineau est le bébé de la baleine."),
      mcq("Pourquoi la baleine à bosse saute-t-elle hors de l’eau ?", "On ne le sait pas vraiment", ["Pour attraper des oiseaux", "Pour chanter plus fort", "Pour se réchauffer"],
        "Le texte dit : « Personne ne sait vraiment pourquoi elle fait cela [...] Le mystère reste entier ». Seules des hypothèses sont proposées."),
    ],
  },

  // ───────────── Niveau 10 : actualité (exploration spatiale) ─────────────
  {
    id: "le-10",
    level: 10,
    title: "Cap sur la Lune",
    intro: "Depuis le phare, on aperçoit la Lune. Le « Journal des enfants » raconte comment on se prépare à l’explorer.",
    text: {
      title: "Cap sur la Lune : les explorateurs de demain se préparent",
      source: "Le Journal des enfants du Village des Contes",
      body: [
        "Depuis quelques années, plusieurs pays du monde préparent de nouvelles missions pour aller explorer la Lune. Des fusées de plus en plus performantes, des robots et des astronautes travaillent ensemble pour que ces voyages réussissent.",
        "Avant le départ, les astronautes s’entraînent longtemps. Pour apprendre à bouger sans pesanteur, c’est-à-dire quand on flotte comme dans l’espace, ils s’exercent dans de grandes piscines. Sous l’eau, leurs mouvements ressemblent un peu à ceux que l’on fait là-haut. Ils apprennent aussi à réparer du matériel, à travailler en équipe et à garder leur calme, même quand un problème survient.",
        "Que vont-ils chercher sur la Lune ? D’abord, ils veulent étudier les roches lunaires pour mieux comprendre comment la Lune s’est formée. Ensuite, des instruments ont repéré de la glace d’eau cachée au fond de certains cratères, de grands trous ronds. Si l’on peut l’utiliser un jour, elle servirait à boire ou à fabriquer de l’air respirable, ce qui rendrait les séjours plus faciles.",
        "Mais pourquoi retourner sur la Lune, alors que des astronautes y sont déjà allés il y a longtemps ? Les scientifiques répondent que la Lune est un excellent terrain d’essai : en y testant de nouvelles machines, on se prépare à des voyages plus lointains, peut-être un jour vers la planète Mars.",
        "Ces projets demandent beaucoup de patience, car chaque détail doit être vérifié avec soin. Mais ils font rêver de nombreux enfants, qui seront peut-être les astronautes ou les ingénieurs de demain.",
      ],
    },
    qs: [
      mcq("Quel est le sujet principal de cet article ?", "La préparation de nouvelles missions vers la Lune", ["L’histoire de la planète Mars", "La construction d’une piscine géante", "La vie quotidienne des enfants astronautes"],
        "Le titre et le premier paragraphe l’annoncent : des pays « préparent de nouvelles missions pour aller explorer la Lune »."),
      tf("Pour s’habituer à l’absence de pesanteur, les astronautes s’entraînent dans de grandes piscines.", true,
        "Le deuxième paragraphe l’explique : « ils s’exercent dans de grandes piscines. Sous l’eau, leurs mouvements ressemblent un peu à ceux que l’on fait là-haut »."),
      mcq("Pourquoi la glace d’eau trouvée dans les cratères intéresse-t-elle les scientifiques ?", "Elle pourrait servir à boire ou à fabriquer de l’air respirable", ["Elle permettrait de construire des fusées plus vite", "Elle prouve que des habitants vivent sur la Lune", "Elle rend les cratères plus brillants"],
        "Le troisième paragraphe dit que, si on peut l’utiliser, la glace « servirait à boire ou à fabriquer de l’air respirable »."),
      mat("Relie chaque élément à son utilité d’après le texte.",
        [["Les grandes piscines", "s’entraîner à bouger sans pesanteur"], ["Les roches lunaires", "comprendre comment la Lune s’est formée"], ["La glace d’eau", "boire ou fabriquer de l’air"], ["La Lune comme terrain d’essai", "se préparer à aller vers Mars"]],
        "Chaque association est dans le texte : piscines (paragraphe 2), roches et glace (paragraphe 3), terrain d’essai pour aller vers Mars (paragraphe 4)."),
      mcq("Quel est le but principal de l’auteur de cet article ?", "Informer les jeunes lecteurs sur un sujet d’actualité", ["Faire rire avec une histoire imaginaire", "Vendre des billets pour la Lune", "Donner les étapes d’une recette"],
        "L’article, publié dans un journal pour enfants, explique des faits réels (missions, entraînement, découvertes) : il sert à informer."),
    ],
  },
];

// ───────────── Examens blancs ─────────────

export const EXAM_P4: ExamBlock[] = [
  {
    title: "Texte 1 : le dragon et le cerf-volant",
    ctx: {
      title: "Zéphyr veut voler",
      body: [
        "Au sommet de la colline, Zéphyr le petit dragon rêvait de voler comme les oiseaux. Mais chaque fois qu’il battait des ailes, il retombait dans l’herbe. « Je suis trop lourd ! » soupirait-il.",
        "Un matin, Inès, la fille du meunier, lui apporta un cerf-volant jaune. « Regarde, dit-elle, il monte parce que le vent le porte. Écoute le vent, Zéphyr ! » Le dragon ferma les yeux, déplia ses ailes et attendit une grande bourrasque. Cette fois, il décolla ! Il tourna trois fois au-dessus du moulin sous les cris de joie d’Inès. Depuis ce jour, il vole chaque soir pour saluer la fillette.",
      ],
    },
    qs: [
      mcq("Pourquoi Zéphyr pense-t-il qu’il ne peut pas voler ?", "Il se croit trop lourd", ["Il a peur des oiseaux", "Ses ailes sont cassées", "Il n’aime pas le vent"],
        "Zéphyr soupire : « Je suis trop lourd ! ». C’est ce qu’il croit, avant d’essayer avec le vent."),
      tf("Inès apporte à Zéphyr un cerf-volant bleu.", false,
        "Le texte précise qu’Inès lui apporte « un cerf-volant jaune »."),
      ord("Remets les événements dans l’ordre.",
        ["Zéphyr retombe dans l’herbe", "Inès apporte un cerf-volant", "Zéphyr ferme les yeux et attend le vent", "Le dragon décolle au-dessus du moulin"],
        "Au début, Zéphyr retombe. Puis Inès arrive avec son cerf-volant, Zéphyr écoute le vent et il décolle enfin."),
      mcq("Quel conseil Inès donne-t-elle au dragon ?", "Écouter le vent", ["Battre des ailes plus fort", "Manger moins de pain", "Grimper sur le moulin"],
        "Inès dit : « Écoute le vent, Zéphyr ! ». Elle l’invite à profiter du vent, comme le cerf-volant."),
    ],
  },
  {
    title: "Texte 2 : les abeilles",
    ctx: {
      title: "Les abeilles, petites ouvrières",
      body: [
        "Dans une ruche vivent de très nombreuses abeilles, et chacune a son travail. Les butineuses partent récolter le nectar des fleurs. Pendant qu’elles se posent de fleur en fleur, du pollen se colle sur leurs pattes et passe d’une fleur à l’autre : c’est ce qui permet aux plantes de fabriquer des fruits.",
        "Dans la ruche, d’autres abeilles transforment le nectar en miel, qu’elles rangent dans de petites cases en cire. L’hiver, les abeilles restent au chaud et mangent leurs réserves de miel. Il est important de les protéger : sans elles, il y aurait beaucoup moins de fruits et de légumes.",
      ],
    },
    qs: [
      mcq("Que récoltent les butineuses sur les fleurs ?", "Du nectar", ["De la cire", "Du miel déjà prêt", "Des fruits"],
        "Le texte dit que les butineuses « partent récolter le nectar des fleurs ». Le miel est fabriqué ensuite, dans la ruche."),
      mcq("Pourquoi les abeilles aident-elles les plantes à fabriquer des fruits ?", "Elles transportent le pollen d’une fleur à l’autre", ["Elles plantent des graines", "Elles arrosent les fleurs", "Elles mangent les mauvaises herbes"],
        "Le pollen se colle sur leurs pattes et passe d’une fleur à l’autre : « c’est ce qui permet aux plantes de fabriquer des fruits »."),
      tf("En hiver, les abeilles mangent leurs réserves de miel.", true,
        "Le deuxième paragraphe l’indique : « L’hiver, les abeilles restent au chaud et mangent leurs réserves de miel »."),
      num("Dans quoi les abeilles rangent-elles le miel ? Complète : de petites cases en ___ (un mot).", ["cire", "en cire"],
        "La phrase est dans le deuxième paragraphe : le miel est rangé « dans de petites cases en cire »."),
    ],
  },
];

export const EXAM_P5: ExamBlock[] = [
  {
    title: "Texte 1 : la fable de la lanterne",
    ctx: {
      title: "La Lanterne et la Luciole",
      body: [
        "Chaque soir, la grande lanterne du phare brillait au-dessus de la mer. Elle se croyait la plus utile du monde. Un soir, elle aperçut une petite luciole qui voletait près des rochers.",
        "— Pauvre minuscule ! se moqua-t-elle. Que peut faire ta lueur ? Moi, j’éclaire les navires à des kilomètres d’ici.",
        "La luciole ne répondit rien et poursuivit son vol.",
        "Cette nuit-là, un épais brouillard monta de la mer. La lumière de la lanterne se perdit dans la brume comme une tache de lait dans une tasse. Le petit bateau de pêche d’Elias, qui rentrait au port, ne savait plus où se trouvaient les rochers. Alors la luciole vint se poser à l’avant du bateau. Sa lueur, toute proche, éclairait l’eau juste devant lui, et Elias put contourner les rochers un à un jusqu’au quai.",
        "Le lendemain, la lanterne, un peu honteuse, murmura : « Pardonne-moi, petite luciole. Je croyais que seule ma grande lumière comptait. »",
        "Morale : ce que l’on croit petit peut devenir précieux quand on en a besoin.",
      ],
    },
    qs: [
      mcq("Pourquoi la lanterne se moque-t-elle de la luciole ?", "Elle se croit beaucoup plus utile qu’elle", ["La luciole l’a dérangée en plein sommeil", "La luciole vole trop près du phare", "Elle a peur des rochers"],
        "Au début, la lanterne « se croyait la plus utile du monde » et trouve la lueur de la luciole bien minuscule."),
      tf("La luciole répond à la lanterne par des moqueries.", false,
        "Le texte précise : « La luciole ne répondit rien et poursuivit son vol »."),
      ord("Remets les événements de la fable dans l’ordre.",
        ["La lanterne se moque de la luciole", "Un épais brouillard monte de la mer", "La luciole éclaire le chemin du bateau d’Elias", "La lanterne s’excuse"],
        "La moquerie vient en premier, puis le brouillard. La luciole sauve le bateau pendant la nuit, et la lanterne s’excuse le lendemain."),
      mcq("Quelle est la morale de cette fable ?", "Il ne faut pas mépriser ce qui paraît petit", ["Il faut toujours éviter le brouillard", "Les phares sont inutiles la nuit", "Les plus grands sont toujours les plus forts"],
        "La dernière phrase donne la morale : ce que l’on croit petit peut devenir précieux. La lanterne l’apprend grâce à la luciole."),
    ],
  },
  {
    title: "Texte 2 : des robots au fond de l’océan",
    ctx: {
      title: "Des robots explorent les profondeurs",
      body: [
        "Le fond des océans est encore l’un des endroits les moins connus de notre planète. Pour l’explorer, les scientifiques envoient des robots sous-marins. Ces machines peuvent descendre très profondément, là où il fait noir et où la pression de l’eau, c’est-à-dire la force avec laquelle elle appuie, est bien trop forte pour des plongeurs.",
        "Équipés de caméras et de projecteurs, les robots filment des animaux étranges, parfois jamais vus auparavant : des poissons transparents, des méduses qui brillent dans l’obscurité, des vers vivant près de sources chaudes. Les chercheurs prélèvent aussi un peu d’eau et de sable pour les étudier.",
        "Ces découvertes sont précieuses : elles aident à mieux comprendre la vie dans les océans et à les protéger contre la pollution. Un chercheur explique : « Chaque nouvelle expédition nous rappelle qu’il reste énormément à découvrir. » Quant aux élèves, ils peuvent parfois suivre une exploration en direct sur un écran, dans leur classe.",
      ],
    },
    qs: [
      mcq("Pourquoi envoie-t-on des robots plutôt que des plongeurs au fond de l’océan ?", "Il y fait noir et la pression de l’eau est trop forte pour des plongeurs", ["Les robots nagent plus vite que les poissons", "Les plongeurs ne savent pas filmer", "Les océans sont interdits aux humains"],
        "Le premier paragraphe l’explique : les robots descendent là où il fait noir et où la pression est « bien trop forte pour des plongeurs »."),
      tf("D’après le texte, les scientifiques connaissent déjà tous les animaux des océans.", false,
        "Le texte parle d’animaux « jamais vus auparavant » et le chercheur dit qu’il « reste énormément à découvrir »."),
      mcq("À quoi servent surtout les découvertes faites par les robots ?", "À mieux comprendre la vie dans les océans et à les protéger", ["À fabriquer de nouveaux projecteurs", "À organiser des concours dans les écoles", "À construire de nouvelles plages"],
        "Le dernier paragraphe dit que ces découvertes « aident à mieux comprendre la vie dans les océans et à les protéger contre la pollution »."),
      gap("Complète : les robots sont équipés de ___ et de ___. Ils filment des ___ qui brillent dans l’obscurité.",
        ["caméras", "projecteurs", "méduses"], ["caméras", "projecteurs", "méduses", "poissons", "plongeurs"],
        "Le deuxième paragraphe parle de « caméras et de projecteurs », et de « méduses qui brillent dans l’obscurité » (les poissons, eux, sont transparents)."),
    ],
  },
];
