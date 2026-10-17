// Banque « Expression écrite et orale » — monde « L’Atelier des Merveilles ».
// Productions auto-évaluées avec un parent grâce à une grille de critères.
import { mcq, tf, ord, mat, gap, ecrit, oral, type Mission } from "../kit";

export const QS_RANGE = [4, 5] as [number, number];

export const MISSIONS: Mission[] = [
  // ───────────────────────── 1. Une phrase correcte, décrire un objet
  {
    id: "at-1",
    level: 1,
    title: "La plume dorée",
    intro: "Bienvenue dans l’Atelier des Merveilles ! Mimi, le chaton ailé, te confie ta première plume magique. Elle n’écrit bien que les phrases correctes.",
    text: {
      title: "La plume de Pimpin",
      body: [
        "Dans l’Atelier des Merveilles, une plume dorée est posée sur un coussin de velours. Elle brille comme un petit soleil.",
        "Quand Soumaya la prend, la plume écrit toute seule sa première phrase : « Bienvenue, apprentie conteuse ! »",
      ],
      source: "Texte original « à la manière de » un conte féerique",
    },
    qs: [
      ord(
        "Remets les morceaux dans l’ordre pour reconstituer une phrase correcte.",
        ["Mimi,", "le chaton ailé,", "survole", "la scène des lutins."],
        "Une phrase a du sens quand ses groupes de mots sont bien placés : qui ? (Mimi, le chaton ailé), que fait-il ? (survole), où ? (la scène des lutins).",
      ),
      tf(
        "Vrai ou faux ? Une phrase commence par une majuscule et se termine par un point (ou un point d’exclamation ou d’interrogation).",
        true,
        "Bravo ! La majuscule au début et le signe de ponctuation à la fin sont les deux signes qui montrent qu’une phrase est terminée.",
      ),
      mcq(
        "Dans la phrase « La plume dorée brille dans la lumière », quel mot est un adjectif qui décrit la plume ?",
        "dorée",
        ["brille", "plume", "lumière"],
        "L’adjectif « dorée » nous dit comment est la plume. « Brille » est un verbe et « plume » un nom.",
      ),
      ecrit(
        "Mimi le chaton ailé te tend une plume magique. Écris une phrase qui la décrit : sa couleur, sa forme ou ce qu’elle sait faire.",
        [
          "Mots utiles : brillante, légère, douce, longue, argentée, étincelante.",
          "Amorce : « Ma plume magique est… » ou « Ma plume sait… ».",
          "Relis ta phrase : elle doit commencer par une majuscule et finir par un point.",
        ],
        [
          "J’ai commencé ma phrase par une majuscule et je l’ai finie par un point.",
          "J’ai utilisé au moins un adjectif pour décrire ma plume.",
          "Ma phrase a du sens quand je la relis à voix haute.",
          "J’ai relu pour vérifier que je n’ai pas oublié de mot.",
        ],
        "Ma plume magique est longue, argentée et légère comme un flocon de neige.",
        "Ta phrase est claire ? Bravo ! Pour t’améliorer, essaie d’ajouter un mot précis : « argentée » est plus joli que « belle ».",
        8,
      ),
      oral(
        "Choisis ton objet magique préféré de l’atelier (un miroir, un chapeau, un livre…) et présente-le à voix haute en deux ou trois phrases.",
        [
          "Dis d’abord comment il s’appelle ou ce que c’est.",
          "Dis ensuite comment il est : couleur, taille, matière.",
          "Termine en disant ce qu’il peut faire de magique.",
        ],
        [
          "J’ai fait deux ou trois phrases complètes.",
          "J’ai parlé assez fort et sans lire.",
          "J’ai décrit mon objet avec au moins deux mots précis.",
          "J’ai regardé la personne qui m’écoutait.",
        ],
        "Chaque phrase dite à voix haute doit être complète. Parle lentement : c’est plus facile pour bien choisir tes mots.",
        "Mon objet préféré est un petit miroir rond. Il est bleu et brillant comme un lac. Quand je le regarde, il me raconte une histoire.",
      ),
    ],
  },

  // ───────────────────────── 2. Décrire un personnage / un lieu avec les cinq sens
  {
    id: "at-2",
    level: 2,
    title: "La forêt des cinq sens",
    intro: "Pour que le miroir-conteur te montre un lieu ou un personnage, il faut le décrire avec précision. Utilise tes cinq sens !",
    text: {
      title: "La clairière des murmures",
      body: [
        "Dans la clairière des murmures, des lucioles dorées dansent entre les arbres. On entend un doux tintement de clochettes.",
        "L’air sent le miel et la mousse est moelleuse sous les pieds. Le lutin Pimpin, minuscule et rieur, offre à chaque visiteur une tarte sucrée à la framboise.",
      ],
      source: "Texte original « à la manière de » un conte féerique",
    },
    qs: [
      mat(
        "Relie chaque sens à ce que l’on perçoit dans la clairière des murmures.",
        [
          ["La vue", "des lucioles dorées"],
          ["L’ouïe", "un tintement de clochettes"],
          ["L’odorat", "une odeur de miel"],
          ["Le toucher", "une mousse moelleuse"],
          ["Le goût", "une tarte sucrée"],
        ],
        "Chaque sens apporte un détail : voir, entendre, sentir, toucher, goûter. Une bonne description en utilise plusieurs.",
      ),
      mcq(
        "Quel groupe de mots contient deux adjectifs pour décrire un personnage ?",
        "un lutin minuscule et rieur",
        ["un lutin et son chapeau", "le lutin court vite", "un lutin dans la forêt"],
        "« Minuscule » et « rieur » disent comment est le lutin : ce sont des adjectifs. Dans les autres groupes, il n’y en a pas.",
      ),
      ecrit(
        "Le miroir-conteur veut dessiner un nouveau personnage de l’atelier : un lutin, une fée ou un animal magique. Décris-le en trois ou quatre phrases pour que le miroir puisse le dessiner.",
        [
          "Parle de son apparence : taille, couleur, vêtements, visage.",
          "Parle de son caractère : gentil, farceur, timide, curieux, courageux.",
          "Mots utiles : minuscule, espiègle, lumineux, rusé, souriant, bavard.",
          "Amorces : « Il a… », « Il porte… », « Il est… ».",
        ],
        [
          "J’ai écrit au moins trois phrases, chacune avec une majuscule et un point.",
          "J’ai utilisé au moins trois adjectifs.",
          "J’ai décrit son apparence et son caractère.",
          "J’ai évité de répéter toujours le même mot.",
        ],
        "Zélie est une fée minuscule aux ailes argentées. Elle porte une robe bleue brodée d’étoiles et un bonnet pointu. Elle est curieuse, rieuse et très serviable : elle aide toujours les apprentis conteurs.",
        "Pour que ta description soit vivante, mélange ce qu’on voit et ce qu’on devine du caractère. Bravo pour tes efforts !",
        25,
      ),
      oral(
        "Ferme les yeux et imagine la scène des lutins pendant le spectacle. Décris ce lieu à voix haute en utilisant au moins trois de tes cinq sens.",
        [
          "Commence par : « Dans la scène des lutins, je vois… ».",
          "Continue avec : « J’entends… », « Je sens… », « Je touche… ».",
          "Mots utiles : scintillant, vacarme, parfumé, velouté, joyeux, rouge et or.",
        ],
        [
          "J’ai utilisé au moins trois sens différents.",
          "J’ai dit au moins quatre phrases.",
          "J’ai parlé assez fort et clairement.",
          "J’ai employé des adjectifs précis.",
        ],
        "Décrire un lieu, ce n’est pas seulement dire ce qu’on voit ! Les sons et les odeurs donnent envie d’entrer dans l’histoire.",
        "Sur la scène des lutins, je vois un rideau rouge et or qui brille. J’entends les petits tambours et les rires. Je sens l’odeur du pain chaud, et le plancher est lisse et tiède sous mes pieds.",
      ),
    ],
  },

  // ───────────────────────── 3. Raconter en trois temps (La Fontaine)
  {
    id: "at-3",
    level: 3,
    title: "L’histoire en trois temps",
    intro: "La machine à histoires ne fonctionne que si le récit a un début, un milieu et une fin. Elle aime aussi les petits mots qui annoncent le temps : d’abord, ensuite, enfin…",
    text: {
      title: "La Cigale et la Fourmi (début)",
      body: [
        "La Cigale, ayant chanté",
        "Tout l’été,",
        "Se trouva fort dépourvue",
        "Quand la bise fut venue.",
      ],
      source: "Jean de La Fontaine, « La Cigale et la Fourmi », Fables, livre I (1668)",
    },
    qs: [
      mcq(
        "Dans ce début de fable, que veut dire « fort dépourvue » ?",
        "qui n’a plus rien du tout",
        ["qui est très fatiguée", "qui chante très fort", "qui est en colère"],
        "« Dépourvue » veut dire sans provisions, sans rien. « La bise » est le vent froid de l’hiver : la Cigale n’a plus rien à manger.",
      ),
      ord(
        "Remets les phrases dans l’ordre pour reconstituer le récit.",
        [
          "Au début, Nour trouve une vieille clé sous un champignon.",
          "Ensuite, la clé ouvre un petit coffre rempli de cartes magiques.",
          "Enfin, Nour offre les cartes à ses amis pour inventer un jeu.",
        ],
        "Un récit se raconte en trois temps : le début (la situation), le milieu (ce qui arrive) et la fin (ce qui se termine). Les mots « au début, ensuite, enfin » t’aident à t’y retrouver.",
      ),
      gap(
        "Complète le récit avec les bons connecteurs temporels : ___, Elias ouvre la porte de l’atelier. ___, il entend un drôle de bruit. ___, il découvre un petit dragon endormi.",
        ["D’abord", "Soudain", "Enfin"],
        ["D’abord", "Soudain", "Enfin", "Parce que", "Pourtant"],
        "« D’abord », « soudain » et « enfin » font avancer l’histoire dans le temps. « Parce que » explique et « pourtant » s’oppose : ils ne conviennent pas ici.",
      ),
      ecrit(
        "La machine à histoires te propose un début : « Un matin, Nour entre dans l’atelier et trouve une machine qui clignote. » Raconte la suite en trois temps : le début, le milieu et la fin.",
        [
          "Début : que fait Nour quand elle voit la machine ?",
          "Milieu : que se passe-t-il quand elle appuie sur un bouton ?",
          "Fin : comment l’aventure se termine-t-elle ?",
          "Connecteurs utiles : d’abord, ensuite, puis, soudain, enfin, finalement.",
        ],
        [
          "Mon récit a un début, un milieu et une fin.",
          "J’ai utilisé au moins trois connecteurs de temps (d’abord, ensuite, enfin…).",
          "J’ai commencé chaque phrase par une majuscule et fini par un point.",
          "J’ai écrit au moins quatre phrases.",
        ],
        "D’abord, Nour s’approche de la machine et lit une étiquette : « Appuie sur le bouton vert. » Ensuite, elle appuie, et la machine crache un nuage de papillons de papier. Soudain, les papillons se mettent à raconter une histoire de dragon farceur. Enfin, Nour les range dans un livre, très heureuse de sa trouvaille.",
        "Quand tu racontes, pense toujours à ces trois temps. Les connecteurs sont comme des panneaux qui guident le lecteur.",
        40,
      ),
      oral(
        "Raconte à voix haute, en trois temps, ta plus belle aventure imaginaire dans l’Atelier des Merveilles.",
        [
          "Commence par : « Il était une fois… » ou « Un jour… ».",
          "Utilise : d’abord, ensuite, puis, enfin.",
          "Pense à ce qui change pendant l’histoire : un problème, une solution.",
        ],
        [
          "J’ai raconté un début, un milieu et une fin.",
          "J’ai utilisé au moins trois mots pour annoncer le temps.",
          "J’ai parlé sans trop de « euh » et sans lire.",
          "Mon histoire avait du sens du début à la fin.",
        ],
        "Pour raconter sans notes, retiens trois images : celle du début, celle du milieu, celle de la fin. Le reste viendra tout seul !",
        "Il était une fois un apprenti qui trouvait une clé d’or. D’abord, il ouvrait un coffre plein de cloches. Ensuite, les cloches se mettaient à chanter et réveillaient tous les lutins. Enfin, ils organisaient une grande fête.",
      ),
    ],
  },

  // ───────────────────────── 4. Écrire une lettre / un message (solidarité)
  {
    id: "at-4",
    level: 4,
    title: "Le courrier de l’atelier",
    intro: "Le facteur-hibou vient de déposer des lettres devant la porte de l’atelier. À toi d’écrire aux habitants d’un village voisin !",
    text: {
      title: "Des livres pour le village du Saule",
      body: [
        "Une grande tempête a abîmé la bibliothèque du village du Saule. Beaucoup de livres sont trop mouillés pour être lus.",
        "Les lutins de l’atelier ont alors organisé une collecte. Chacun apporte un livre qu’il a aimé et y glisse un petit mot pour son futur lecteur. Ainsi, les enfants du village retrouveront bientôt des histoires.",
      ],
      source: "Texte original inspiré de l’actualité",
    },
    qs: [
      ord(
        "Remets les parties d’une lettre dans l’ordre.",
        [
          "Le lieu et la date",
          "La formule d’appel (« Chère Lina, »)",
          "Le message",
          "La formule de politesse",
          "La signature",
        ],
        "Une lettre s’organise toujours de la même manière : on situe d’abord la lettre, on salue la personne, on écrit son message, on termine poliment, puis on signe.",
      ),
      mcq(
        "Quelle phrase convient pour terminer une lettre à une amie ?",
        "À bientôt, je t’embrasse très fort.",
        ["Fin de la lettre.", "Voilà, c’est tout.", "Réponds-moi vite sinon je me fâche."],
        "Une formule de politesse est chaleureuse et respectueuse. Elle montre qu’on pense à la personne qui lira la lettre.",
      ),
      tf(
        "Vrai ou faux ? On écrit de la même façon à son meilleur ami et au directeur d’une école.",
        false,
        "On adapte son ton : avec un ami, on peut dire « tu » et être joyeux. Avec un adulte qu’on connaît peu, on est plus poli et on dit « vous ».",
      ),
      ecrit(
        "Le facteur-hibou t’apporte du papier doré. Écris un petit mot pour l’enfant du village du Saule qui recevra ton livre préféré.",
        [
          "Commence par : « Cher / Chère … » puis une virgule.",
          "Explique quel livre tu offres et pourquoi tu l’as aimé.",
          "Finis avec une formule de politesse puis signe.",
          "Amorces : « J’espère que… », « Ce livre m’a fait… ».",
        ],
        [
          "J’ai écrit une formule d’appel au début (Cher… / Chère…).",
          "J’ai expliqué quel livre j’offre et pourquoi je l’aime.",
          "J’ai terminé par une formule de politesse et ma signature.",
          "Mes phrases commencent par une majuscule et finissent par un point.",
        ],
        "Chère Lina,\nJe t’offre mon livre préféré, celui qui raconte les voyages d’un renard curieux. Je l’ai beaucoup aimé : il m’a fait rire et rêver. J’espère qu’il te plaira aussi.\nÀ bientôt, je t’embrasse.\nSoumaya",
        "Une lettre soignée donne le sourire à celui qui la reçoit. N’oublie jamais de signer !",
        40,
      ),
      oral(
        "Yanis, un lutin du village du Saule, t’a laissé un message vocal sur le miroir-conteur. Réponds-lui à voix haute pour le remercier et lui proposer d’envoyer d’autres livres.",
        [
          "Commence par saluer : « Bonjour Yanis ! ».",
          "Remercie-le, puis fais ta proposition.",
          "Termine par une formule de fin : « À bientôt ! ».",
        ],
        [
          "J’ai salué au début et dit au revoir à la fin.",
          "J’ai dit merci et fait une proposition.",
          "J’ai parlé poliment, assez fort et sans lire.",
          "J’ai fait des phrases complètes.",
        ],
        "Un message oral doit être clair et poli. Respire avant de parler : ta voix sera plus calme.",
        "Bonjour Yanis ! Merci beaucoup pour ton message. Les lutins de l’atelier ont encore beaucoup de livres. Si tu veux, je t’en envoie une grande boîte la semaine prochaine. À bientôt !",
      ),
    ],
  },

  // ───────────────────────── 5. Continuer un récit, dialogues (Perrault)
  {
    id: "at-5",
    level: 5,
    title: "Un chat qui parle",
    intro: "Dans la bibliothèque de l’atelier, un conte de Perrault s’est ouvert tout seul. Les personnages attendent que tu continues leur histoire.",
    text: {
      title: "Le Chat botté (début)",
      body: [
        "Un meunier ne laissa pour tout bien à trois enfants qu’il avait, que son moulin, son âne et son chat.",
        "L’aîné eut le moulin, le second eut l’âne, et le plus jeune n’eut que le chat.",
      ],
      source: "Charles Perrault, « Le Maître chat ou le Chat botté », Histoires ou contes du temps passé (1697), orthographe modernisée",
    },
    qs: [
      mcq(
        "Dans ce conte, que veut dire l’expression « pour tout bien » ?",
        "pour toute richesse",
        ["pour toute joie", "pour tout travail", "pour tout cadeau de fête"],
        "« Le bien » désigne ici ce que l’on possède. Le meunier laisse à ses enfants uniquement son moulin, son âne et son chat.",
      ),
      mcq(
        "Quelle phrase est correctement ponctuée ?",
        "« Je t’aiderai », dit le chat.",
        ["Je t’aiderai, dit le chat.", "« Je t’aiderai dit le chat ».", "« Je t’aiderai, dit le chat. »"],
        "Les paroles sont entre guillemets. Le verbe de parole (« dit le chat ») est placé après, et le point final se met à la fin de la phrase.",
      ),
      tf(
        "Vrai ou faux ? Dans un dialogue écrit, on change de ligne quand un autre personnage se met à parler.",
        true,
        "Passer à la ligne à chaque nouvelle parole aide le lecteur à comprendre qui parle.",
      ),
      ecrit(
        "Continue le conte : Elias, le plus jeune fils, est seul avec son chat. Soudain, le chat se met à lui parler ! Écris la suite avec au moins deux répliques.",
        [
          "Dis comment Elias réagit : il est surpris, il rit, il a peur ?",
          "Écris les paroles entre guillemets : « … », dit le chat.",
          "Utilise des verbes de parole variés : demande, répond, murmure, s’écrie.",
          "Pense aux virgules et au point à la fin de chaque réplique.",
        ],
        [
          "J’ai écrit au moins deux répliques entre guillemets.",
          "J’ai utilisé un verbe de parole pour chaque réplique (dit, répond…).",
          "J’ai changé de ligne quand un autre personnage parle.",
          "Ma suite est logique avec le début du conte.",
          "J’ai mis les majuscules et les points.",
        ],
        "Elias regardait son chat avec tristesse quand une petite voix s’éleva.\n« Ne sois pas triste, mon maître », dit le chat.\nElias sursauta.\n« Tu parles ? s’écria-t-il.\n— Bien sûr, répondit le chat en souriant. Donne-moi une paire de bottes et je t’aiderai. »",
        "Un dialogue donne de la vie à un récit. Relis tes répliques à voix haute pour vérifier qu’elles sonnent bien.",
        45,
      ),
      oral(
        "Joue la scène avec un parent : tu es Elias, il ou elle est le chat qui parle. Inventez ensemble un petit dialogue d’au moins quatre répliques.",
        [
          "Changez de voix : une voix douce pour Elias, une voix rusée pour le chat.",
          "Le chat explique son plan, Elias pose des questions.",
          "Pense à utiliser des expressions : « Je te promets que… », « Fais-moi confiance ! ».",
        ],
        [
          "Nous avons dit au moins quatre répliques.",
          "J’ai changé ma voix pour jouer mon personnage.",
          "J’ai parlé assez fort et sans lire.",
          "Mes répliques répondaient à celles de mon partenaire.",
        ],
        "Jouer un dialogue demande d’écouter l’autre. Prends ton temps et amuse-toi avec ta voix !",
        "— Que veux-tu faire, petit chat ? — Je veux t’aider à devenir riche. Fais-moi confiance ! — Mais comment ? — C’est mon secret, mon maître.",
      ),
    ],
  },

  // ───────────────────────── 6. Donner son avis et le justifier (océans et plastique)
  {
    id: "at-6",
    level: 6,
    title: "La baie des sirènes",
    intro: "La reine des sirènes demande l’avis des enfants de l’atelier. Donner son avis, c’est bien ; le justifier avec « parce que » ou « car », c’est encore mieux !",
    text: {
      title: "Des déchets sur la plage",
      body: [
        "Chaque jour, la mer rapporte sur la plage des bouteilles, des sacs et des morceaux de plastique. Certains animaux marins les prennent pour de la nourriture, et cela peut les rendre malades.",
        "Alors, des écoles organisent des nettoyages de plage. Les enfants ramassent les déchets, les trient, et apprennent à utiliser une gourde plutôt qu’une bouteille jetable.",
      ],
      source: "Texte original inspiré de l’actualité",
    },
    qs: [
      tf(
        "Vrai ou faux ? D’après le texte, certains animaux marins peuvent prendre le plastique pour de la nourriture.",
        true,
        "C’est écrit dans le premier paragraphe : les animaux confondent parfois les déchets avec leur nourriture, et cela peut les rendre malades.",
      ),
      mcq(
        "Quelle phrase donne un avis justifié ?",
        "Je trouve que les nettoyages de plage sont utiles parce qu’ils protègent les animaux.",
        ["Les plages existent depuis longtemps.", "Hier, j’ai mangé une glace au citron.", "Je trouve que oui."],
        "Un avis justifié contient une opinion (« je trouve que… ») et une raison introduite par « parce que » ou « car ».",
      ),
      gap(
        "Complète : Je pense qu’une gourde est une bonne idée ___ elle évite de jeter des bouteilles. Les poissons sont en danger, ___ il faut agir.",
        ["parce que", "donc"],
        ["parce que", "donc", "mais", "pourtant"],
        "« Parce que » introduit une raison. « Donc » introduit une conséquence : puisque les poissons sont en danger, il faut agir.",
      ),
      ecrit(
        "La reine des sirènes pose cette question : « Les enfants peuvent-ils vraiment aider à protéger la mer ? » Donne ton avis et justifie-le avec au moins deux raisons.",
        [
          "Commence par : « Je pense que… » ou « À mon avis… ».",
          "Justifie avec : « parce que », « car », « en effet ».",
          "Donne un exemple : ramasser, trier, utiliser une gourde.",
          "Termine par une phrase de conclusion : « C’est pourquoi… ».",
        ],
        [
          "J’ai donné clairement mon avis dans la première phrase.",
          "J’ai donné au moins deux raisons avec « parce que » ou « car ».",
          "J’ai ajouté un exemple précis.",
          "J’ai terminé par une phrase de conclusion.",
          "Mes phrases commencent par une majuscule et finissent par un point.",
        ],
        "À mon avis, les enfants peuvent vraiment aider à protéger la mer. D’abord, ils peuvent ramasser les déchets sur la plage, car chaque déchet en moins est un danger de moins pour les animaux. Ensuite, ils peuvent utiliser une gourde parce que cela évite de jeter des bouteilles. C’est pourquoi je pense que même les petits gestes comptent.",
        "Un bon avis a toujours une raison. Chaque fois que tu écris « je pense que », demande-toi : pourquoi ?",
        40,
      ),
      oral(
        "Tu rencontres un poisson-lanterne qui demande : « Quel animal de la mer faut-il le plus protéger, selon toi ? » Choisis-en un et explique ton choix à voix haute en au moins trois phrases.",
        [
          "Commence par : « Selon moi, il faut protéger… ».",
          "Donne une raison avec « parce que ».",
          "Ajoute un détail sur cet animal : où il vit, ce qu’il mange, comment il est.",
        ],
        [
          "J’ai nommé un animal et donné mon avis.",
          "J’ai utilisé « parce que » ou « car » pour justifier.",
          "J’ai parlé assez fort et regardé mon auditeur.",
          "J’ai fait au moins trois phrases complètes.",
        ],
        "Pour convaincre à l’oral, parle lentement et accentue les mots importants.",
        "Selon moi, il faut protéger les tortues de mer parce qu’elles confondent parfois les sacs plastiques avec des méduses. Elles vivent très longtemps et voyagent dans tous les océans. Si on les protège, la mer sera plus belle.",
      ),
    ],
  },

  // ───────────────────────── 7. Résumer / exposé d’une minute (espace)
  {
    id: "at-7",
    level: 7,
    title: "Le télescope de l’atelier",
    intro: "Bienvenue en P5 ! Le télescope magique observe les étoiles. Pour partager ses découvertes, tu dois apprendre à résumer et à présenter un exposé clair.",
    text: {
      title: "Explorer l’espace",
      body: [
        "Depuis longtemps, des astronautes vivent quelques mois dans une station qui tourne autour de la Terre. Ils y font des expériences utiles aux scientifiques et apprennent à vivre sans pesanteur.",
        "D’autres machines, appelées sondes ou robots, voyagent encore plus loin. Elles explorent d’autres planètes, prennent des photos et envoient leurs découvertes vers la Terre. Grâce à elles, les chercheurs comprennent mieux l’univers.",
      ],
      source: "Texte original inspiré de l’actualité",
    },
    qs: [
      mcq(
        "Quelle phrase résume le mieux ce texte ?",
        "Des astronautes et des robots explorent l’espace pour mieux comprendre l’univers.",
        [
          "Les astronautes mangent seulement des repas en tube.",
          "La Terre est une planète très loin du Soleil.",
          "Les robots ont remplacé tous les astronautes.",
        ],
        "Un résumé garde l’idée principale : on explore l’espace avec des astronautes et des robots pour découvrir l’univers. Les autres phrases ajoutent des informations fausses ou absentes du texte.",
      ),
      mat(
        "Relie chaque mot à sa définition.",
        [
          ["Un astronaute", "une personne qui voyage dans l’espace"],
          ["Une sonde", "une machine envoyée explorer l’espace"],
          ["La pesanteur", "la force qui nous attire vers le sol"],
          ["Une expérience", "un test pour mieux comprendre quelque chose"],
        ],
        "Connaître le sens des mots clés d’un texte aide à le résumer sans se tromper.",
      ),
      ord(
        "Remets dans l’ordre les étapes d’un petit exposé d’une minute.",
        [
          "Je me présente et j’annonce mon sujet.",
          "Je développe une première idée avec un exemple.",
          "Je développe une deuxième idée avec un exemple.",
          "Je conclus et je remercie mon public.",
        ],
        "Un exposé a toujours un plan : une introduction, un développement en plusieurs idées, puis une conclusion.",
      ),
      ecrit(
        "Le télescope magique te demande de résumer le texte « Explorer l’espace » en trois phrases au maximum, avec tes propres mots.",
        [
          "Cherche d’abord l’idée principale de chaque paragraphe.",
          "N’écris que l’essentiel : pas de détails, pas d’exemples.",
          "Connecteurs utiles : d’abord, d’autre part, grâce à cela.",
          "Mots clés : astronautes, station, sondes, planètes, découvertes.",
        ],
        [
          "Mon résumé fait trois phrases au plus.",
          "J’ai gardé les deux idées principales du texte.",
          "J’ai utilisé mes propres mots, sans recopier le texte.",
          "Je n’ai rien inventé qui ne soit pas dans le texte.",
        ],
        "Des astronautes vivent dans une station autour de la Terre pour faire des expériences. De leur côté, des sondes explorent d’autres planètes et envoient des photos. Ainsi, les chercheurs comprennent mieux l’univers.",
        "Résumer, c’est choisir ! Demande-toi pour chaque phrase : est-ce indispensable pour comprendre le texte ?",
        25,
      ),
      oral(
        "Prépare un mini-exposé d’une minute sur le thème « Si j’étais astronaute dans l’Atelier des Merveilles ». Présente-le à voix haute avec un plan en trois parties.",
        [
          "Introduction : « Aujourd’hui, je vais vous parler de… ».",
          "Développement : deux idées avec un exemple chacune (ce que je ferais, ce que je verrais).",
          "Conclusion : « Pour terminer… » puis « Merci de m’avoir écouté ».",
          "Aide-toi de mots clés écrits sur une feuille, sans tout écrire.",
        ],
        [
          "J’ai suivi mon plan : introduction, développement, conclusion.",
          "J’ai présenté deux idées avec un exemple.",
          "J’ai parlé environ une minute, sans trop me presser.",
          "J’ai parlé assez fort et j’ai regardé mon public.",
          "J’ai remercié à la fin.",
        ],
        "Un exposé réussi tient dans un plan clair. Entraîne-toi avec un chronomètre : une minute passe vite !",
        "Aujourd’hui, je vais vous parler de mon voyage d’astronaute. D’abord, je visiterais une planète rouge pour observer ses montagnes. Ensuite, je ferais pousser une graine dans la station pour voir si elle grandit. Pour terminer, je rapporterais des photos pour les enfants de l’atelier. Merci de m’avoir écouté.",
      ),
    ],
  },

  // ───────────────────────── 8. Argumenter, convaincre (La Fontaine)
  {
    id: "at-8",
    level: 8,
    title: "Le grand débat des lutins",
    intro: "Sur la scène des lutins, le grand débat commence ! Pour convaincre le public, il faut des arguments solides et des mots pour les relier.",
    text: {
      title: "Le Lièvre et la Tortue (début)",
      body: [
        "Rien ne sert de courir ; il faut partir à point :",
        "Le Lièvre et la Tortue en sont un témoignage.",
        "« Gageons, dit celle-ci, que vous n’atteindrez point",
        "Sitôt que moi ce but. »",
      ],
      source: "Jean de La Fontaine, « Le Lièvre et la Tortue », Fables, livre VI (1668)",
    },
    qs: [
      mcq(
        "Quelle leçon (morale) La Fontaine annonce-t-il dans les deux premiers vers ?",
        "Il ne sert à rien de se précipiter : il faut commencer au bon moment.",
        [
          "Il faut toujours courir plus vite que les autres.",
          "Il ne faut jamais faire de pari.",
          "Il vaut mieux rester immobile.",
        ],
        "« Partir à point » veut dire partir au bon moment, bien préparé. Se presser ne suffit pas pour gagner.",
      ),
      mcq(
        "Quel groupe de mots sert à AJOUTER un argument dans un discours ?",
        "De plus",
        ["Pourtant", "Hier soir", "Si bien que ce matin"],
        "« De plus » ajoute une idée à la précédente. « Pourtant » exprime plutôt une opposition.",
      ),
      gap(
        "Complète ce discours : Je pense qu’il faut jouer franc jeu. ___, tricher gâche le plaisir du jeu. ___, les autres joueurs perdent confiance. ___, on se sent fier quand on a gagné honnêtement.",
        ["D’abord", "De plus", "Enfin"],
        ["D’abord", "De plus", "Enfin", "Mais", "Autrefois"],
        "« D’abord », « de plus » et « enfin » organisent les arguments d’un discours dans un ordre clair.",
      ),
      ecrit(
        "Le roi des lutins hésite : pour la grande fête, faut-il faire un concours avec un prix pour le seul gagnant, ou une fête où tout le monde reçoit un cadeau ? Choisis ton camp et écris un petit discours pour le convaincre.",
        [
          "Annonce ta position : « Je pense qu’il faut… ».",
          "Donne trois arguments avec : d’abord, de plus, enfin.",
          "Prévois une objection : « Certains diront que… mais… ».",
          "Conclus pour convaincre : « C’est pourquoi, Majesté… ».",
        ],
        [
          "J’ai annoncé clairement ma position.",
          "J’ai donné au moins trois arguments reliés par des connecteurs.",
          "J’ai répondu à une objection possible.",
          "J’ai terminé par une phrase de conclusion qui s’adresse au roi.",
          "J’ai relu mon texte pour corriger les majuscules et les points.",
        ],
        "Majesté, je pense qu’il faut organiser une fête où tout le monde reçoit un cadeau. D’abord, tous les lutins ont travaillé dur pour préparer la fête. De plus, un concours rend triste ceux qui ne gagnent pas. Enfin, un cadeau pour chacun donne envie de recommencer l’année prochaine. Certains diront qu’un prix motive les champions, mais le plaisir de partager est plus fort. C’est pourquoi je vous demande de choisir la fête pour tous.",
        "Un bon discours est organisé : une position, des arguments, une conclusion. Pense à prévoir l’objection de l’adversaire pour être encore plus convaincant.",
        45,
      ),
      oral(
        "Débat avec un parent : « Vaut-il mieux gagner à tout prix ou jouer loyalement ? » Prends le parti du fair-play et défends-le pendant une minute. Ton adversaire essaiera de te répondre !",
        [
          "Commence par : « Je défends l’idée que… ».",
          "Donne deux arguments avec un exemple (un match, un jeu de société).",
          "Écoute l’autre, puis réponds : « Je comprends ton idée, mais… ».",
          "Reste poli, même si tu n’es pas d’accord.",
        ],
        [
          "J’ai donné au moins deux arguments.",
          "J’ai écouté l’autre sans l’interrompre.",
          "J’ai répondu à son idée avec « mais » ou « pourtant », poliment.",
          "J’ai parlé assez fort et clairement.",
        ],
        "Un bon débatteur écoute autant qu’il parle. Reste calme : c’est la qualité de tes arguments qui compte, pas le volume de ta voix.",
        "Je défends l’idée qu’il faut jouer loyalement. D’abord, gagner en trichant n’est pas une vraie victoire. Ensuite, quand on respecte les règles, tout le monde a envie de rejouer avec nous.",
      ),
    ],
  },

  // ───────────────────────── 9. Inventer un univers féerique : comparaisons, métaphores
  {
    id: "at-9",
    level: 9,
    title: "L’univers du miroir-conteur",
    intro: "Le miroir-conteur t’invite à inventer un monde entier : ses paysages, ses habitants, ses règles magiques. Pour le rendre vivant, utilise des comparaisons et des métaphores.",
    text: {
      title: "Le royaume des nuages",
      body: [
        "Au-dessus de l’atelier flotte le royaume des nuages. Ses tours sont fines comme des aiguilles de glace et son sol est un tapis de coton.",
        "Le soleil est une lanterne qui s’allume chaque matin, et le vent est un messager qui court d’une tour à l’autre. Les habitants, légers comme des plumes, glissent sur des échelles de brume.",
      ],
      source: "Texte original « à la manière de » un conte féerique",
    },
    qs: [
      mat(
        "Relie chaque début de comparaison à la fin qui convient le mieux.",
        [
          ["Doux comme", "un agneau"],
          ["Brillant comme", "une étoile"],
          ["Léger comme", "une plume"],
          ["Rusé comme", "un renard"],
        ],
        "Une comparaison relie deux choses avec un mot comme « comme ». Elle aide à imaginer une qualité (doux, léger, rusé…).",
      ),
      mcq(
        "Dans le texte, laquelle de ces phrases contient une métaphore (une comparaison sans le mot « comme ») ?",
        "Le soleil est une lanterne qui s’allume chaque matin.",
        [
          "Ses tours sont fines comme des aiguilles de glace.",
          "Les habitants, légers comme des plumes, glissent.",
          "Au-dessus de l’atelier flotte le royaume des nuages.",
        ],
        "Dans une métaphore, on dit que le soleil EST une lanterne, sans écrire « comme ». Les deux autres phrases utilisent « comme » : ce sont des comparaisons.",
      ),
      gap(
        "Complète avec le mot qui convient : Le ciel du soir est ___ grand manteau bleu. Mimi est légère ___ une plume. Le château brille ___ un diamant.",
        ["un", "comme", "comme"],
        ["un", "comme", "mais", "quand"],
        "Dans la métaphore « Le ciel est un grand manteau bleu », il n’y a pas de « comme ». Dans une comparaison, ce mot relie les deux éléments.",
      ),
      ecrit(
        "Inventer un royaume féerique complet ! Décris-le pour le miroir-conteur : son nom, son paysage, ses habitants et une règle magique qu’on y respecte. Utilise au moins deux comparaisons et une métaphore.",
        [
          "Trouve un nom étonnant : le Royaume des Étoiles-Bonbons, la Vallée des Flûtes…",
          "Décris le paysage avec plusieurs sens : couleurs, sons, odeurs.",
          "Présente les habitants (qui sont-ils ? comment vivent-ils ?).",
          "Invente une règle magique : « Ici, on ne peut jamais… ».",
        ],
        [
          "J’ai donné un nom à mon royaume et décrit son paysage.",
          "J’ai parlé de ses habitants.",
          "J’ai inventé une règle magique.",
          "J’ai utilisé au moins deux comparaisons et une métaphore.",
          "J’ai écrit au moins six phrases correctement ponctuées.",
        ],
        "Dans la Vallée des Flûtes, les collines sont des vagues de velours vert. Le vent y chante comme un violon et les arbres brillent comme des bougies. Les habitants, des musiciens à plumes, vivent dans des nids en forme de clochers. Ils sont doux comme des agneaux et accueillants avec tous les voyageurs. Dans cette vallée, personne ne peut parler fort : on doit s’exprimer en musique. Ainsi, chaque conversation devient un petit concert.",
        "Ton royaume est un vrai monde quand le lecteur peut le voir, l’entendre et comprendre ses règles. Les comparaisons rendent les images plus vivantes.",
        55,
      ),
      oral(
        "Tu es guide touristique de ton royaume féerique. Invite un visiteur à le découvrir pendant une minute : présente deux lieux à visiter et une chose à ne surtout pas manquer.",
        [
          "Commence par accueillir : « Bienvenue au royaume de… ! ».",
          "Utilise des mots d’invitation : « Venez voir… », « Ne manquez pas… ».",
          "Ajoute au moins une comparaison pour faire rêver.",
          "Termine par une phrase de départ : « Bonne visite ! ».",
        ],
        [
          "J’ai accueilli le visiteur et présenté deux lieux.",
          "J’ai utilisé au moins une comparaison.",
          "J’ai donné envie de visiter, avec un ton joyeux.",
          "J’ai parlé sans lire, en gardant un rythme régulier.",
        ],
        "Un bon guide donne envie ! Ta voix peut sourire : cela s’entend.",
        "Bienvenue dans le royaume des nuages ! Venez voir la tour de Cristal, fine comme une aiguille de glace. Ne manquez pas le jardin des brumes, doux comme un tapis de coton. Et surtout, goûtez les gâteaux au vent. Bonne visite !",
      ),
    ],
  },

  // ───────────────────────── 10. Production finale (énergies renouvelables) + relecture
  {
    id: "at-10",
    level: 10,
    title: "Le grand livre final",
    intro: "Dernière épreuve de l’atelier ! Tu vas écrire un récit complet, le relire, le corriger, puis présenter un exposé structuré. Tu es devenu(e) un(e) vrai(e) conteur(se).",
    text: {
      title: "La vallée Claire",
      body: [
        "Dans la vallée Claire, le moulin à vent tourne, le soleil chauffe de grands panneaux brillants et la rivière fait avancer une roue. Voilà trois façons de fabriquer de l’énergie sans épuiser la nature.",
        "On les appelle énergies renouvelables, parce que le vent, le soleil et l’eau reviennent toujours. Elles polluent beaucoup moins que d’autres énergies et aident à protéger la planète pour les enfants de demain.",
      ],
      source: "Texte original inspiré de l’actualité",
    },
    qs: [
      ord(
        "Remets dans l’ordre les étapes d’une bonne relecture.",
        [
          "J’écris mon brouillon sans m’arrêter.",
          "Je relis en vérifiant les majuscules et les points.",
          "Je vérifie l’orthographe et les accords.",
          "Je recopie mon texte proprement.",
        ],
        "Relire par étapes, c’est plus efficace : on ne cherche pas toutes les erreurs en même temps.",
      ),
      mcq(
        "Quelle phrase est correctement orthographiée ?",
        "Les lutins ont allumé les lanternes.",
        [
          "Les lutins on allumé les lanternes.",
          "Les lutin ont allumés les lanternes.",
          "Les lutins ont allumer les lanternes.",
        ],
        "Il faut « ont » (verbe avoir), le pluriel « lutins » et le participe passé « allumé » (on peut le remplacer par « éteint »).",
      ),
      gap(
        "Complète avec « a » ou « à » : Aya ___ ouvert la porte de la tour. Elle va ___ la fenêtre et regarde le moulin ___ vent.",
        ["a", "à", "à"],
        ["a", "à", "as"],
        "« A » (sans accent) est le verbe avoir : on peut le remplacer par « avait ». « À » (avec accent) est une préposition qui ne se remplace pas.",
      ),
      ecrit(
        "Production finale : écris un récit complet intitulé « La nuit où l’Atelier des Merveilles s’est éteint ». Raconte comment les personnages (Soumaya, Mimi, Noé…) retrouvent la lumière. Ton récit comprend une situation de départ, un problème, des péripéties et une fin heureuse. Relis-le et corrige-le avant de terminer.",
        [
          "Début : où sont les personnages ? Que se passe-t-il quand la lumière s’éteint ?",
          "Milieu : quel problème doivent-ils résoudre ? Quelle idée ont-ils ? (Pourquoi pas le vent ou le soleil ?)",
          "Fin : comment l’atelier se rallume-t-il ? Que ressentent-ils ?",
          "Utilise des connecteurs, un dialogue et au moins une comparaison.",
        ],
        [
          "Mon récit a une situation de départ, un problème, des actions et une fin.",
          "J’ai utilisé des connecteurs de temps et au moins un dialogue bien ponctué.",
          "J’ai relu mon texte et corrigé au moins trois erreurs.",
          "J’ai vérifié les majuscules, les points et les accords.",
          "J’ai écrit au moins huit phrases.",
        ],
        "Une nuit, toutes les lanternes de l’Atelier des Merveilles s’éteignirent d’un coup. Soumaya et Mimi, le chaton ailé, restèrent seules dans le noir. « Que faire ? » murmura Soumaya. « Cherchons une source de lumière ! » répondit Mimi. D’abord, elles grimpèrent sur le toit pour appeler Noé. Ensuite, il suggéra d’utiliser le vent : « Faisons tourner le grand moulin ! » Ils tournèrent la manivelle et, peu à peu, les lanternes se rallumèrent, brillantes comme des étoiles. Enfin, l’atelier retrouva sa lumière, et tous les lutins applaudirent. Grâce à leur idée, la nuit redevint une belle fête.",
        "Un bon récit se construit, se relit et se corrige. Prends toujours le temps de relire : tu trouveras des erreurs que tu n’avais pas vues !",
        70,
      ),
      oral(
        "Exposé structuré d’une minute : présente à un auditoire de lutins le thème « Pourquoi le vent, le soleil et l’eau sont des énergies d’avenir ». Utilise ce que tu as appris dans le texte « La vallée Claire ».",
        [
          "Plan : introduction (annonce du thème), deux idées, conclusion.",
          "Idées possibles : elles ne s’épuisent pas ; elles polluent beaucoup moins.",
          "Utilise des connecteurs : d’abord, ensuite, enfin, c’est pourquoi.",
          "Entraîne-toi avec des mots clés, sans lire un texte entier.",
        ],
        [
          "J’ai annoncé mon thème dès le début.",
          "J’ai présenté deux idées avec des mots pour les relier.",
          "J’ai terminé par une conclusion et un remerciement.",
          "J’ai parlé environ une minute, assez fort, sans lire.",
          "J’ai utilisé au moins trois mots précis du texte (énergie, renouvelable, vent…).",
        ],
        "Un exposé structuré se prépare : un plan, quelques mots clés, et de l’entraînement. Tu as bien progressé depuis la première mission !",
        "Aujourd’hui, je vais vous parler des énergies renouvelables. D’abord, le vent, le soleil et l’eau ne s’épuisent pas, car ils reviennent toujours. Ensuite, ces énergies polluent beaucoup moins que d’autres. C’est pourquoi elles protègent la planète pour les enfants de demain. Merci de m’avoir écouté.",
      ),
    ],
  },
];
