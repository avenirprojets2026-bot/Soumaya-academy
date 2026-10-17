import { mcq, tf, num, ord, mat, gap, type Mission, type ExamBlock } from "../kit";

// Banque de français — monde « La Bibliothèque des Mots » (contenu original, P4 → P5).

export const MISSIONS: Mission[] = [
  // ───────────── 1. Nature des mots, phrase, ponctuation ─────────────
  {
    id: "fr-1",
    level: 1,
    title: "Le Portail des Lettres",
    intro: "Les lettres vivantes de la Bibliothèque se sont mélangées ! Aide les gardiens à reconnaître chaque mot et à reconstruire de vraies phrases.",
    qs: [
      mcq(
        "Mimi le chaton ailé lit sur un parchemin : « Le dragon timide dort. » Quel mot est un adjectif ?",
        "timide",
        ["dragon", "dort", "Le"],
        "L'adjectif donne une précision sur le nom : on peut dire « un dragon timide ». « Dort » est le verbe, « dragon » le nom, « Le » le déterminant."
      ),
      mat(
        "Dans la phrase « Ces lettres brillantes dansent », relie chaque mot à sa nature.",
        [
          ["Ces", "déterminant"],
          ["lettres", "nom"],
          ["brillantes", "adjectif"],
          ["dansent", "verbe"],
        ],
        "Le déterminant se place devant le nom, l'adjectif décrit le nom et le verbe dit ce que l'on fait. Astuce : le verbe change si on change le temps (« elles dansaient »)."
      ),
      tf(
        "Soumaya écrit dans son carnet magique : « Elle ouvre le grimoire. » Le mot « Elle » est un pronom.",
        true,
        "Oui ! « Elle » remplace un nom (par exemple « Soumaya ») : c'est un pronom personnel."
      ),
      ord(
        "Les mots du sort se sont envolés ! Remets-les dans l'ordre pour former une phrase.",
        ["Le", "petit", "lutin", "range", "les", "livres."],
        "Une phrase commence par une majuscule et finit par un point. On commence par le groupe du sujet (« Le petit lutin »), puis le verbe, puis ce qu'il range."
      ),
      mcq(
        "Dans la phrase « Mimi vole vers Bruxelles », quels mots sont des noms propres (ils prennent une majuscule) ?",
        "Mimi et Bruxelles",
        ["vole et vers", "Mimi et vole", "Bruxelles et vers"],
        "Un nom propre désigne un être ou un lieu unique (un chaton, une ville) et commence par une majuscule. Un nom commun, lui, désigne n'importe quel chat ou n'importe quelle ville."
      ),
      gap(
        "Yanis complète la règle gravée sur la porte : « Une phrase commence par une ___ et se termine par un ___. »",
        ["majuscule", "point"],
        ["majuscule", "point", "virgule", "tiret"],
        "On met une majuscule au début de la phrase et un point à la fin (ou un ? ou un ! selon la phrase). La virgule, elle, sert à faire une petite pause au milieu."
      ),
    ],
  },

  // ───────────── 2. Genre, nombre, accords dans le groupe nominal ─────────────
  {
    id: "fr-2",
    level: 2,
    title: "L'Atelier des Accords",
    intro: "Dans l'atelier des gardiens-correcteurs, chaque mot du groupe nominal doit porter le même genre et le même nombre que son nom. À toi de les accorder !",
    qs: [
      mcq(
        "Noé étiquette des livres ensorcelés. Quel groupe nominal est correctement accordé ?",
        "des histoires magiques",
        ["des histoire magiques", "des histoires magique", "un histoires magiques"],
        "Le nom « histoires » est au pluriel : le déterminant (« des ») et l'adjectif (« magiques ») prennent aussi la marque du pluriel."
      ),
      num(
        "Le chaton Mimi veut tout compter par deux. Écris au pluriel : « la lettre vivante ».",
        ["les lettres vivantes"],
        "Au pluriel, « la » devient « les », et le nom comme l'adjectif prennent un -s : « les lettres vivantes »."
      ),
      tf(
        "Dans le groupe nominal « une fée gentille », le mot « gentille » est au féminin singulier.",
        true,
        "Oui : « fée » est féminin singulier, donc l'adjectif s'accorde : gentille (féminin, avec -e), sans -s (singulier)."
      ),
      mat(
        "Relie chaque nom du royaume à son pluriel.",
        [
          ["un oiseau", "des oiseaux"],
          ["un cheval", "des chevaux"],
          ["une souris", "des souris"],
          ["un château", "des châteaux"],
        ],
        "Beaucoup de noms en -eau font -eaux, ceux en -al font souvent -aux, et les noms qui finissent déjà par -s ne changent pas au pluriel (une souris, des souris)."
      ),
      gap(
        "Aya complète la phrase avec les bonnes terminaisons : « Des fée___ joyeu___ chantent. »",
        ["s", "ses"],
        ["s", "ses", "x", "se"],
        "« Fées » est féminin pluriel : fées (-s) et joyeuses (-ses). L'adjectif en -eux devient -euse au féminin, puis -euses au pluriel."
      ),
      mcq(
        "La fée interroge Rayan : « Peux-tu m'aider » Quel signe de ponctuation faut-il à la fin de cette phrase ?",
        "un point d'interrogation",
        ["un point d'exclamation", "un point", "une virgule"],
        "La phrase pose une question : elle se termine par un point d'interrogation. Une phrase qui raconte finit par un point, une phrase qui exprime une émotion par un point d'exclamation."
      ),
    ],
  },

  // ───────────── 3. Le présent ─────────────
  {
    id: "fr-3",
    level: 3,
    title: "Le Grimoire du Présent",
    intro: "Le grand grimoire ne s'ouvre qu'avec les bonnes formules magiques : les verbes conjugués au présent. Récite-les sans te tromper !",
    qs: [
      num(
        "Les lutins se dépêchent vers la salle des contes. Écris le verbe « aller » au présent : « Les lutins ___ à la bibliothèque. »",
        ["vont"],
        "« Aller » est irrégulier : il va, ils vont. Astuce : remplace « les lutins » par « ils »."
      ),
      mcq(
        "Soumaya et Lina dessinent un dragon. Complète : « Vous ___ (faire) un beau dessin. »",
        "faites",
        ["faisez", "fesez", "faient"],
        "Avec « vous », le verbe « faire » fait « vous faites » (comme « vous dites » et « vous êtes »). C'est une exception à retenir."
      ),
      mat(
        "Pour ouvrir la serrure, relie chaque sujet à la bonne forme du verbe « avoir » au présent.",
        [
          ["j'", "ai"],
          ["tu", "as"],
          ["il", "a"],
          ["nous", "avons"],
          ["ils", "ont"],
        ],
        "« Avoir » au présent : j'ai, tu as, il a, nous avons, vous avez, ils ont. Une formule à connaître par cœur !"
      ),
      gap(
        "À la porte du donjon : « Nous ___ (prendre) la clé, tu la ___ (tenir) et elles ___ (vouloir) ouvrir. »",
        ["prenons", "tiens", "veulent"],
        ["prenons", "tiens", "veulent", "prennent", "tient", "veut"],
        "Nous prenons, tu tiens, elles veulent : pour chaque verbe, repère le sujet pour choisir la bonne forme."
      ),
      tf(
        "Tom écrit sur la porte : « Tu chante sous la lune. » La phrase est correcte.",
        false,
        "Faux ! Au présent, les verbes en -er se terminent par -es avec « tu » : « tu chantes ». Souviens-toi : un « tu » ne sort jamais sans son s !"
      ),
      mcq(
        "Le chaton ailé a bien mangé. Complète : « Nous ___ (finir) la lecture avant la nuit. »",
        "finissons",
        ["finons", "finissont", "finisons"],
        "Les verbes du 2e groupe (finir) intercalent -iss- : nous finissons, vous finissez, ils finissent."
      ),
    ],
  },

  // ───────────── 4. Les homophones ─────────────
  {
    id: "fr-4",
    level: 4,
    title: "Le Duel des Jumeaux",
    intro: "Dans la Forêt des Sons, des mots jumeaux se prononcent pareil mais s'écrivent différemment. Utilise les astuces de remplacement pour les départager !",
    qs: [
      mcq(
        "Mimi savoure une boisson magique dans la cuisine de la bibliothèque. Quelle écriture du mot « boisson » est correcte ?",
        "boisson",
        ["boison", "boizon", "boissson"],
        "Entre deux voyelles, la lettre s se prononce « z » : pour faire le son « s », on écrit ss (boisson, moisson). Dans « cousine », le s se prononce « z »."
      ),
      gap(
        "Nour décrit le petit lutin : « Le lutin ___ petit ___ rapide. »",
        ["est", "et"],
        ["est", "et", "es"],
        "« Est » peut se remplacer par « était » (le lutin était petit). « Et » peut se remplacer par « et puis » : il relie deux mots."
      ),
      tf(
        "Le mot « accident » s'écrit avec deux c : un c qui fait le son « k » et un c qui fait le son « s ».",
        true,
        "Oui : dans « accident », le premier c fait le son « k » et le second le son « s ». C'est la même chose dans « accélérer »."
      ),
      mcq(
        "Nour cherche un mot de la forêt. Lequel est bien écrit ?",
        "jambon",
        ["janbon", "jabon", "jamebon"],
        "Devant les lettres b et p, on écrit toujours m et non n : jambon, ampoule, emporter, impossible, ombre."
      ),
      mat(
        "Relie chaque phrase à l'homophone qui manque.",
        [
          ["Je ne sais pas ___ est le grimoire.", "où"],
          ["Veux-tu du thé ___ du chocolat ?", "ou"],
          ["___ lit un conte.", "On"],
          ["Les fées ___ des ailes.", "ont"],
        ],
        "« Où » (avec accent) indique le lieu ; « ou » peut se remplacer par « ou bien » ; « on » peut se remplacer par « il » ; « ont » par « avaient »."
      ),
      num(
        "Rayan voulait jouer avec le dragon, ___ il pleuvait. Écris le mot qui manque (mes ou mais).",
        ["mais"],
        "On écrit « mais » quand on peut le remplacer par « cependant ». « Mes » accompagne un nom au pluriel et se remplace par « tes » (mes plumes)."
      ),
    ],
  },

  // ───────────── 5. Passé composé, imparfait, futur simple ─────────────
  {
    id: "fr-5",
    level: 5,
    title: "La Machine à Remonter le Temps",
    intro: "Les pages du grand livre voyagent dans le temps ! Retrouve si l'histoire se passe avant, maintenant ou après, et conjugue les verbes au bon moment.",
    qs: [
      mcq(
        "Pour réveiller le chaton Mimi, Lina promet : « Demain, je l\'___ (appeler) dès l\'aube. » Quelle forme est correcte ?",
        "appellerai",
        ["appelerai", "appellerais", "appelleras"],
        "Au futur simple, appeler double le l : j'appellerai. La terminaison -ai correspond à « je »."
      ),
      num(
        "Hier, Soumaya a trouvé un vieux livre. Conjugue « ouvrir » au passé composé : « Hier, Soumaya ___ le grimoire. »",
        ["a ouvert"],
        "Passé composé = auxiliaire avoir au présent + participe passé : « a ouvert ». Le participe passé d'ouvrir est « ouvert »."
      ),
      mat(
        "Relie chaque phrase au temps utilisé.",
        [
          ["Demain, la fée chantera.", "futur simple"],
          ["Hier, la fée a chanté.", "passé composé"],
          ["Autrefois, la fée chantait.", "imparfait"],
          ["Maintenant, la fée chante.", "présent"],
        ],
        "Les petits mots (demain, hier, autrefois, maintenant) aident à repérer le temps, mais regarde aussi la fin du verbe : -era, a + participe, -ait, -e."
      ),
      num(
        "Le gardien ordonne à Noé : « ___ (choisir) un livre ! » Écris le verbe à l'impératif présent (tu).",
        ["choisis"],
        "À l'impératif, on garde la forme de « tu choisis » : choisis. Avec « nous » : choisissons ; avec « vous » : choisissez."
      ),
      gap(
        "Inès raconte : « Hier, Tom ___ le conte jusqu'au bout ; demain, il le ___ à sa sœur. »",
        ["a lu", "lira"],
        ["a lu", "lira", "lis", "liront"],
        "Hier = passé composé (a lu) ; demain = futur simple (lira). Les autres formes ne s'accordent pas avec « il »."
      ),
      ord(
        "Les lutins récitent le verbe « chanter » à l'imparfait. Remets-le dans l'ordre des pronoms : je, tu, il, nous, vous, ils.",
        ["je chantais", "tu chantais", "il chantait", "nous chantions", "vous chantiez", "ils chantaient"],
        "À l'imparfait, les terminaisons sont -ais, -ais, -ait, -ions, -iez, -aient. Elles ressemblent à une petite chanson à retenir."
      ),
    ],
  },

  // ───────────── 6. Sujet, compléments, types et formes de phrase ─────────────
  {
    id: "fr-6",
    level: 6,
    title: "La Tour des Phrases",
    intro: "Au sommet de la tour, les phrases se construisent comme des escaliers : un sujet, un verbe, des compléments. Reconnais leur type et leur forme pour monter plus haut !",
    qs: [
      mcq(
        "Le gardien surveille la porte. Dans « Le gardien de la tour ferme la grande porte », quel est le sujet du verbe « ferme » ?",
        "Le gardien de la tour",
        ["la tour", "la grande porte", "ferme"],
        "Pour trouver le sujet, pose la question « Qui est-ce qui ferme ? » : c'est « le gardien de la tour ». Ce groupe de mots est le sujet en entier."
      ),
      num(
        "Complète : « Les fées de la forêt ___ (chanter) au clair de lune. » Écris le verbe conjugué au présent.",
        ["chantent"],
        "Le sujet est « les fées » (pluriel), pas « la forêt ». Remplace-le par « elles » : elles chantent."
      ),
      mat(
        "Relie chaque phrase à son type.",
        [
          ["Où est ma plume ?", "interrogative"],
          ["Range ton grimoire.", "impérative"],
          ["Quel beau dragon !", "exclamative"],
          ["La fée lit une histoire.", "déclarative"],
        ],
        "Une phrase interrogative pose une question, l'impérative donne un ordre, l'exclamative exprime un sentiment fort et la déclarative raconte un fait."
      ),
      tf(
        "« Le lutin ne dort pas. » est une phrase de forme négative.",
        true,
        "Oui : la négation « ne ... pas » entoure le verbe. Sans elle, la phrase serait affirmative : « Le lutin dort. »"
      ),
      mcq(
        "Dans « Mimi dort dans la bibliothèque », à quelle question répond le groupe « dans la bibliothèque » ?",
        "Où ?",
        ["Quand ?", "Qui ?", "Pourquoi ?"],
        "« Dans la bibliothèque » indique le lieu de l'action : il répond à la question « Où ? ». C'est un complément de phrase."
      ),
      gap(
        "Noé met la phrase à la forme négative : « Le dragon ___ crache ___ de feu. »",
        ["ne", "pas"],
        ["ne", "pas", "non", "si"],
        "La négation se forme avec deux petits mots placés de chaque côté du verbe : ne ... pas."
      ),
    ],
  },

  // ───────────── 7. Conjugaison approfondie, accords du participe, pronoms (P5) ─────────────
  {
    id: "fr-7",
    level: 7,
    title: "Le Labyrinthe des Verbes",
    intro: "Les couloirs du labyrinthe cachent des verbes rusés : participes à accorder, futurs irréguliers et pronoms qui remplacent les mots. Garde ton sang-froid de P5 !",
    qs: [
      mcq(
        "Les apprenties magiciennes sont rentrées. Complète : « Elles sont ___ (arriver) à la tour avant la nuit. »",
        "arrivées",
        ["arrivé", "arrivés", "arriver"],
        "Avec l'auxiliaire être, le participe passé s'accorde avec le sujet. « Elles » est féminin pluriel : arrivées."
      ),
      num(
        "Dans le conte de demain, les elfes traverseront la forêt. Écris le verbe « courir » au futur simple : « Elles ___ jusqu'au château. »",
        ["courront"],
        "« Courir » fait « courr- » au futur (je courrai, elles courront) : on entend un r double."
      ),
      tf(
        "Dans « Lina a mangé des fruits magiques », le participe passé « mangé » s'accorde avec « Lina ».",
        false,
        "Faux ! Avec l'auxiliaire avoir, le participe passé ne s'accorde pas avec le sujet (Lina). Il s'accorde seulement avec un COD placé avant le verbe."
      ),
      mat(
        "Relie chaque verbe à sa forme du présent.",
        [
          ["rire (ils)", "rient"],
          ["courir (je)", "cours"],
          ["rendre (tu)", "rends"],
          ["tenir (nous)", "tenons"],
        ],
        "Retiens ces verbes irréguliers : ils rient, je cours, tu rends, nous tenons."
      ),
      gap(
        "Récit d'hier : « Les fillettes ___ allées à la tour et elles ___ vu un dragon. »",
        ["sont", "ont"],
        ["sont", "ont", "a", "est"],
        "« Aller » se conjugue avec être (elles sont allées) alors que « voir » se conjugue avec avoir (elles ont vu)."
      ),
      mcq(
        "Le lutin cherche la clé magique. Complète en remplaçant « la clé » par un pronom : « Le lutin ___ trouve sous un livre. »",
        "la",
        ["le", "lui", "les"],
        "« La clé » est un nom féminin singulier ; le pronom qui le remplace est « la » (le lutin la trouve)."
      ),
    ],
  },

  // ───────────── 8. Vocabulaire ─────────────
  {
    id: "fr-8",
    level: 8,
    title: "Le Dictionnaire Enchanté",
    intro: "Le dictionnaire géant de la Bibliothèque garde les secrets de tous les mots : leurs jumeaux, leurs contraires, leur famille et leurs sens cachés.",
    qs: [
      mcq(
        "Mimi a fait une erreur dans son devoir de magie. Quel mot est un synonyme d'« erreur » ?",
        "faute",
        ["fête", "réponse", "travail"],
        "Un synonyme a presque le même sens : erreur = faute. D'autres paires de synonymes : travail = emploi, content = joyeux, habile = adroit."
      ),
      mat(
        "Relie chaque mot à son contraire (son antonyme).",
        [
          ["richesse", "pauvreté"],
          ["accepter", "refuser"],
          ["monter", "descendre"],
          ["courageux", "peureux"],
        ],
        "Un antonyme a un sens opposé. Pense à la question « le contraire de... ? » pour vérifier."
      ),
      num(
        "Dans la famille du mot « fleur », écris le nom de la personne qui vend des fleurs.",
        ["fleuriste", "un fleuriste", "une fleuriste", "le fleuriste", "la fleuriste"],
        "On a ajouté le suffixe -iste au radical « fleur- » : fleuriste. Les mots d'une même famille partagent le même radical."
      ),
      tf(
        "Le mot « souris » a le même sens dans « la souris mange du fromage » et dans « la souris de l'ordinateur ».",
        false,
        "Faux ! Dans le dictionnaire, un même mot peut avoir plusieurs sens. Ici, il s'agit d'abord d'un petit animal, puis de l'objet qui sert à déplacer le curseur sur l'écran."
      ),
      mcq(
        "Lina soupire : « Ce bruit de tambour me tape sur les nerfs ! » Que veut-elle dire ?",
        "Il m'énerve.",
        ["Il me fait mal aux bras.", "Il me fait rire.", "Il m'endort."],
        "« Taper sur les nerfs de quelqu'un », c'est l'agacer. Cette expression imagée ne se comprend pas mot à mot."
      ),
      ord(
        "Pour retrouver un mot dans le dictionnaire, il faut les classer. Range ces mots dans l'ordre alphabétique.",
        ["cadeau", "calme", "carte", "chat", "clé"],
        "Ils commencent tous par c : on regarde la 2e lettre (a, a, a, h, l), puis la 3e quand c'est nécessaire (d, l, r) : cadeau, calme, carte, chat, clé."
      ),
    ],
  },

  // ───────────── 9. Orthographe avancée ─────────────
  {
    id: "fr-9",
    level: 9,
    title: "Le Pavillon des Pièges",
    intro: "Les gardiens-correcteurs ont caché des pièges d'orthographe dans le pavillon. Utilise tes astuces de remplacement pour éviter chaque erreur !",
    qs: [
      mcq(
        "Mimi déploie les ailes qui lui appartiennent. Complète : « Mimi étire ___ ailes. »",
        "ses",
        ["ces", "c'est"],
        "On écrit « ses » quand on peut mettre le nom au singulier avec « son » ou « sa » (son aile). « Ces » sert à montrer : on peut dire « ces ailes-ci »."
      ),
      mcq(
        "Le lutin a eu peur. Complète : « Le lutin ___ caché derrière le rideau. »",
        "s'est",
        ["c'est", "ces", "ses"],
        "« S'est » est le verbe « se cacher » au passé composé. Astuce : mets la phrase à « je » : « je me suis caché »."
      ),
      num(
        "Les deux elfes rangent les plumes qui sont à eux. Écris le mot qui manque (leur ou leurs) : « Les deux elfes rangent ___ plumes. »",
        ["leurs"],
        "Le nom « plumes » est au pluriel : on écrit « leurs » avec un -s. Quand « leur » est un déterminant, il s'accorde avec le nom."
      ),
      gap(
        "Léa demande : « ___ est ta plume ? » Zoé répond : « Je crois ___ est dorée. »",
        ["Quelle", "qu'elle"],
        ["Quelle", "qu'elle", "Quel", "qu'il"],
        "« Quelle » (en un mot) s'accorde avec « plume », un nom féminin ; « qu'elle » peut se remplacer par « qu'il » (au masculin). Ici, la plume est dorée : elle."
      ),
      mat(
        "Relie chaque nom singulier à son pluriel.",
        [
          ["un travail", "des travaux"],
          ["un pneu", "des pneus"],
          ["un bal", "des bals"],
          ["un chou", "des choux"],
        ],
        "Ces pluriels sont des exceptions : travail → travaux, chou → choux. Mais pneu → pneus et bal → bals prennent un -s tout simple."
      ),
      tf(
        "Dans « Elle m'a offert une plume », on écrit « m'a » avec une apostrophe parce qu'on peut dire « elle t'a offert ».",
        true,
        "Oui ! « m'a » vient de « me » + « a » (verbe avoir). On écrit « ma » sans apostrophe quand on peut dire « ta » devant un nom (ma plume)."
      ),
    ],
  },

  // ───────────── 10. Maîtrise ─────────────
  {
    id: "fr-10",
    level: 10,
    title: "L'Épreuve du Grand Correcteur",
    intro: "Dernière épreuve : le Grand Correcteur te confie des textes pleins de fautes et des phrases piégeuses. Montre que tu es une experte de la grammaire !",
    qs: [
      mcq(
        "Le Grand Correcteur relit : « Les fées sont arrivé hier et elles on chanté. » Combien de fautes d'orthographe y a-t-il ?",
        "2 fautes",
        ["1 faute", "3 fautes", "4 fautes"],
        "Il y a deux fautes : « arrivé » doit être « arrivées » (accord avec « les fées ») et « on » doit être « ont » (verbe avoir)."
      ),
      num(
        "Corrige la phrase du parchemin : « Soumaya et Inès sont parti en forêt. » Écris le participe passé bien accordé.",
        ["parties"],
        "Le verbe « partir » est conjugué avec être : le participe s'accorde avec le sujet « Soumaya et Inès » (féminin pluriel) : parties."
      ),
      gap(
        "Phrase difficile : « Les plumes que Noé a ___ sont très ___. »",
        ["rangées", "belles"],
        ["rangées", "rangé", "belles", "beau"],
        "Le COD « que » (= les plumes) est placé avant le verbe avoir : le participe s'accorde (rangées). L'adjectif « belles » s'accorde aussi avec « plumes »."
      ),
      mat(
        "Relie chaque phrase fautive au mot qui la corrige.",
        [
          ["Elles ce sont perdues.", "se"],
          ["Il à faim.", "a"],
          ["Les chats son partis.", "sont"],
          ["Tu peut venir.", "peux"],
        ],
        "Pour chaque faute, utilise ton astuce : « se » devant un verbe, « a » = avait, « sont » = étaient, « peux » avec tu."
      ),
      ord(
        "Remets ce récit dans l'ordre grâce aux mots qui organisent l'histoire.",
        [
          "D'abord, Soumaya ouvre le grimoire.",
          "Ensuite, une lettre s'envole.",
          "Puis, elle forme un mot doré.",
          "Enfin, la porte du château s'ouvre.",
        ],
        "Les mots « d'abord, ensuite, puis, enfin » indiquent l'ordre des événements. Ils t'aident à reconstituer un récit."
      ),
      tf(
        "Dans « Quand tu viendras, apporte ton livre », le verbe « viendras » est au futur simple.",
        true,
        "Oui : « tu viendras » est le futur simple de venir. « Apporte » est un verbe à l'impératif (un ordre)."
      ),
    ],
  },
];

// ───────────── Examen blanc P4 (niveau P4 avancé) ─────────────
export const EXAM_P4: ExamBlock[] = [
  {
    title: "Le carnet de la fée Nour",
    ctx: {
      title: "Le carnet doré",
      body: [
        "Chaque soir, Nour ouvre son carnet doré.",
        "Elle y note les mots rares que les lettres vivantes lui murmurent.",
        "Ce soir, le mot « lumière » brille sur la page.",
      ],
    },
    qs: [
      mcq(
        "Dans la phrase « Chaque soir, Nour ouvre son carnet doré », quel mot est un adjectif ?",
        "doré",
        ["ouvre", "soir", "son"],
        "« Doré » décrit le nom « carnet » : c'est l'adjectif. « Ouvre » est le verbe et « son » le déterminant."
      ),
      mcq(
        "À quel temps est le verbe « murmurent » dans le texte ?",
        "au présent",
        ["à l'imparfait", "au futur simple", "au passé composé"],
        "Les lettres « murmurent » ce soir, au moment où l'on parle : c'est le présent (-ent, comme « elles »)."
      ),
      num(
        "Dans « Elle y note les mots rares », quel est le sujet du verbe « note » ? (Écris le mot.)",
        ["elle", "Elle"],
        "On pose la question « Qui est-ce qui note ? » : c'est « elle », un pronom qui remplace Nour."
      ),
    ],
  },
  {
    title: "Les exercices du château",
    qs: [
      gap(
        "Le dragon des douves est gentil : « Le dragon ___ gentil ___ il ___ un grand cœur. »",
        ["est", "et", "a"],
        ["est", "et", "a", "à"],
        "« Est » = était, « et » = et puis, « a » = avait. Chaque petit mot a son test de remplacement."
      ),
      num(
        "Le sorcier annonce : « Vous (dire) ___ la formule magique. » Écris le verbe « dire » au présent.",
        ["dites"],
        "Avec « vous », le verbe « dire » fait « vous dites » (comme « vous faites » et « vous êtes »)."
      ),
      tf(
        "Dans la phrase « Les elfes joue dans la clairière », le verbe est bien accordé.",
        false,
        "Faux ! Le sujet « les elfes » est pluriel : il faut écrire « jouent ». Astuce : remplace par « ils jouent »."
      ),
      mat(
        "Relie chaque mot de la potion à son synonyme.",
        [
          ["content", "joyeux"],
          ["habile", "adroit"],
          ["travail", "emploi"],
          ["peur", "crainte"],
        ],
        "Deux synonymes ont un sens très proche et sont de même nature. Remplace l'un par l'autre dans une phrase pour vérifier."
      ),
      mcq(
        "Le chaton Mimi regarde par la fenêtre. Quel mot est bien écrit ?",
        "fenêtre",
        ["fenètre", "fênetre", "fenettre"],
        "Dans ce mot, l'accent circonflexe est sur le deuxième e (fe-nê-tre), les autres e n'en portent pas. Pour t'aider, pense à la famille du mot : « fenêtre » vient de l'ancien « fenestre »."
      ),
      mcq(
        "Zoé veut ___ sa lampe magique avec elle. Quel verbe est bien écrit ?",
        "emporter",
        ["enporter", "emmporter", "emporer"],
        "Devant la lettre p, on écrit m : emporter, impossible, ampoule. Après « veut », le verbe est à l'infinitif, en -er."
      ),
      ord(
        "Les mots d'un parchemin sont tombés par terre. Remets-les dans l'ordre pour former une phrase.",
        ["Les", "fées", "dorment", "dans", "la", "tour."],
        "On commence par le sujet (« Les fées »), puis le verbe, puis le complément de lieu. La phrase finit par un point."
      ),
      mcq(
        "Quelle phrase est écrite au futur simple ?",
        "Demain, Mimi boira du lait.",
        ["Hier, Mimi a bu du lait.", "Mimi buvait du lait.", "Mimi boit du lait."],
        "« Boira » (-ra) exprime ce qui se passera plus tard : c'est le futur simple. Les autres formes sont au passé composé, à l'imparfait et au présent."
      ),
      mcq(
        "Choisis la phrase correctement orthographiée.",
        "Ces fées ont perdu leurs ailes.",
        ["Ses fées on perdu leur ailes.", "Ces fées ont perdu leur ailes.", "Ces fées sont perdu leurs ailes."],
        "« Ces fées » montre, « ont » = avaient, et « leurs ailes » prend un -s car « ailes » est pluriel."
      ),
    ],
  },
];

// ───────────── Examen blanc P5 ─────────────
export const EXAM_P5: ExamBlock[] = [
  {
    title: "La nuit des lettres",
    ctx: {
      title: "La lettre de Zoé",
      body: [
        "Les lettres de l'alphabet se sont réveillées pendant la nuit.",
        "Elles ont sauté de la page et se sont cachées sous les étagères.",
        "Le gardien, très inquiet, les cherchera demain matin.",
      ],
    },
    qs: [
      mcq(
        "Dans « Elles se sont cachées », pourquoi le participe « cachées » prend-il un -e et un -s ?",
        "Il s'accorde avec le sujet « elles » (féminin pluriel).",
        ["Il s'accorde avec « étagères ».", "Il s'accorde avec « page ».", "Il ne s'accorde pas : c'est une erreur."],
        "Avec l'auxiliaire être, le participe passé s'accorde avec le sujet. « Elles » est féminin pluriel : cachées."
      ),
      num(
        "Quel est l'infinitif du verbe « cherchera » ? (Écris le verbe.)",
        ["chercher"],
        "« Cherchera » est le futur simple du verbe « chercher » (1er groupe)."
      ),
      mcq(
        "Dans « Le gardien, très inquiet, les cherchera », que remplace le pronom « les » ?",
        "Les lettres",
        ["Le gardien", "Les étagères", "La page"],
        "C'est ce que le gardien cherche : les lettres qui se sont enfuies. « Les » reprend « Les lettres de l'alphabet »."
      ),
      tf(
        "Dans « Elles ont sauté de la page », le participe passé « sauté » reste invariable car l'auxiliaire est avoir et aucun COD n'est placé avant.",
        true,
        "Oui : avec avoir, le participe ne s'accorde pas avec le sujet. Il s'accorde seulement avec un COD placé avant le verbe, ce qui n'est pas le cas ici."
      ),
    ],
  },
  {
    title: "Le défi du Grand Magicien",
    qs: [
      gap(
        "Hier soir, au retour de la fête : « Elias ___ rentré tard ; ses sœurs, elles, ___ rentrées tôt. »",
        ["est", "sont"],
        ["est", "sont", "a", "ont"],
        "Le verbe « rentrer » se conjugue avec être. Le participe s'accorde : Elias est rentré, ses sœurs sont rentrées."
      ),
      mat(
        "Relie chaque mot-valise aux deux mots qui l'ont formé.",
        [
          ["courriel", "courrier + électronique"],
          ["franglais", "français + anglais"],
          ["informatique", "information + automatique"],
          ["bureautique", "bureau + informatique"],
        ],
        "Un mot-valise est fabriqué en collant le début d'un mot et la fin d'un autre. Il condense deux idées en un seul mot."
      ),
      mcq(
        "Quelle phrase emploie une expression au sens figuré ?",
        "Le gardien a un cœur de pierre.",
        ["Le gardien porte une pierre.", "La pierre est tombée du mur.", "Le gardien range les pierres."],
        "« Avoir un cœur de pierre », c'est être dur et sans pitié. Dans les autres phrases, « pierre » a son sens propre."
      ),
      mcq(
        "Complète le souvenir de Lina : « Quand j'étais petite, je ___ de voler au-dessus du château. » (verbe rêver)",
        "rêvais",
        ["rêvai", "rêverai", "rêvait"],
        "Le souvenir qui dure dans le passé se conjugue à l'imparfait. Avec « je », la terminaison est -ais : je rêvais."
      ),
      num(
        "Le Grand Magicien commande : « Nous ___ ouvrir la porte du donjon. » Écris le verbe « vouloir » au présent.",
        ["voulons"],
        "Avec « nous », le verbe « vouloir » fait « nous voulons » (je veux, nous voulons, ils veulent)."
      ),
      num(
        "Le magicien gronde le chaton : « Mimi, ___ (être) sage ! » Écris le verbe à l'impératif présent.",
        ["sois"],
        "L'impératif d'être est irrégulier : sois, soyons, soyez. Pour avoir, c'est : aie, ayons, ayez."
      ),
      tf(
        "Dans « Quelles belles plumes ! », le mot « quelles » s'écrit avec deux l et un -s parce qu'il s'accorde avec « plumes ».",
        true,
        "Oui : « quelles » est un déterminant exclamatif féminin pluriel, comme le nom « plumes ». À ne pas confondre avec « qu'elles » (que + elles)."
      ),
    ],
  },
];
