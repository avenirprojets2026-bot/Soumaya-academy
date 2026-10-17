// Banque « Éveil : géographie, histoire et citoyenneté » — monde « L'Archipel des Sirènes ».
// Contenu original. Faits stables uniquement (pas de chiffres qui changent, pas de dirigeants actuels).
import { mcq, tf, num, ord, mat, gap, type Mission, type ExamBlock } from "../kit";

export const MISSIONS: Mission[] = [
  // ───────────────────────── L1 — Se repérer
  {
    id: "mo-1",
    title: "Les phares-boussoles",
    intro: "Les sirènes cartographes t'apprennent à lire une carte et à ne jamais te perdre entre les îles flottantes.",
    level: 1,
    qs: [
      mcq(
        "Soumaya tient la boussole du grand phare : l'aiguille rouge indique le Nord. Si elle se tient face au Nord, quelle direction se trouve dans son dos ?",
        "Le Sud",
        ["L'Est", "L'Ouest"],
        "Le Sud est toujours à l'opposé du Nord. Si tu regardes le Nord, le Sud est derrière toi."
      ),
      tf(
        "Mimi le chaton ailé se réveille à l'aube sur l'île des Coraux. Le soleil se lève du côté de l'Est.",
        true,
        "Le soleil se lève à l'Est et se couche à l'Ouest. Bravo si tu t'en souvenais !"
      ),
      mat(
        "La sirène Coralie a gravé des lettres sur sa rose des vents. Relie chaque lettre à la direction qu'elle représente.",
        [
          ["N", "Nord"],
          ["S", "Sud"],
          ["E", "Est"],
          ["O", "Ouest"],
        ],
        "N pour Nord, S pour Sud, E pour Est et O pour Ouest. Ces quatre lettres sont les points cardinaux."
      ),
      num(
        "Sur la carte de Yanis, 1 cm représente 20 m dans la réalité. Le pont de nacre mesure 4 cm sur la carte. Quelle est sa longueur réelle ?",
        ["80", "80 m", "80 mètres"],
        "4 cm × 20 m = 80 m. L'échelle te dit combien de mètres réels cache chaque centimètre de la carte.",
        "m"
      ),
      mcq(
        "Un oiseau-lune survole l'île et dessine ce qu'il voit en regardant tout droit vers le bas. Comment s'appelle ce point de vue ?",
        "La vue de dessus",
        ["La vue de face", "La vue de côté", "La vue de dessous"],
        "Un plan est dessiné en vue de dessus, comme si on regardait depuis le ciel."
      ),
      gap(
        "Sur la carte du royaume, la ___ explique ce que veulent dire les symboles, et l'___ indique le rapport entre la carte et la réalité.",
        ["légende", "échelle"],
        ["légende", "échelle", "boussole", "couleur"],
        "La légende explique les symboles ; l'échelle permet de calculer les vraies distances."
      ),
    ],
  },

  // ───────────────────────── L2 — Paysages
  {
    id: "mo-2",
    title: "Les paysages des îles flottantes",
    intro: "Inès survole l'archipel sur le dos d'une raie géante et découvre des paysages tous différents.",
    level: 2,
    qs: [
      mcq(
        "Depuis son nuage, Inès aperçoit un sommet couvert de neige aux pentes très raides. Quel paysage observe-t-elle ?",
        "Une montagne",
        ["Une plaine", "Un littoral", "Un marais"],
        "Une montagne est un relief très élevé, avec des pentes raides et parfois de la neige au sommet."
      ),
      tf(
        "Sur l'île des Blés d'or, Noé marche pendant des heures sans rencontrer de relief. C'est une plaine : une grande étendue plate.",
        true,
        "Une plaine est une vaste étendue de terrain plat, souvent idéale pour les champs."
      ),
      ord(
        "Une goutte d'eau enchantée voyage depuis la montagne jusqu'à l'océan. Remets les étapes de son voyage dans l'ordre.",
        ["La source", "Le ruisseau", "La rivière", "Le fleuve", "La mer"],
        "Un cours d'eau naît à la source, grossit en ruisseau, puis en rivière, devient un fleuve et se jette dans la mer."
      ),
      mat(
        "Lina dessine quatre cartes postales du royaume. Relie chaque paysage à ce qu'on y voit.",
        [
          ["Montagne", "Un sommet"],
          ["Littoral", "Une plage"],
          ["Campagne", "Des champs et des fermes"],
          ["Ville", "Des immeubles et des rues commerçantes"],
        ],
        "Chaque paysage a ses éléments typiques : sommets en montagne, plages au littoral, champs à la campagne, immeubles en ville."
      ),
      mcq(
        "Le fleuve de cristal se jette dans la mer des Sirènes. Comment appelle-t-on l'endroit où un fleuve arrive à la mer ?",
        "L'embouchure",
        ["La source", "Le sommet", "La falaise"],
        "L'embouchure est la fin du fleuve, là où il rejoint la mer. La source, c'est son début."
      ),
      gap(
        "Le ___ est la zone où la terre rencontre la mer. Un ___ est un très grand cours d'eau qui se jette dans la mer.",
        ["littoral", "fleuve"],
        ["littoral", "fleuve", "sommet", "plaine"],
        "Le littoral borde la mer. Le fleuve, lui, est un grand cours d'eau qui finit son voyage dans la mer."
      ),
    ],
  },

  // ───────────────────────── L3 — La Belgique
  {
    id: "mo-3",
    title: "La carte de Belgique des sirènes",
    intro: "La bibliothèque du temps garde une carte magique de la Belgique. Aya t'aide à la déchiffrer.",
    level: 3,
    qs: [
      mcq(
        "Aya dépose un cristal doré sur la capitale de la Belgique, sur la carte magique. Quelle ville choisit-elle ?",
        "Bruxelles",
        ["Namur", "Liège", "Anvers"],
        "Bruxelles est la capitale de la Belgique. Namur, elle, est la capitale de la Wallonie."
      ),
      mat(
        "Mimi livre des perles dans trois grandes villes belges. Relie chaque ville à sa Région.",
        [
          ["Anvers", "Région flamande"],
          ["Liège", "Région wallonne"],
          ["Bruxelles", "Région de Bruxelles-Capitale"],
        ],
        "La Belgique compte trois Régions : la Région flamande, la Région wallonne et la Région de Bruxelles-Capitale."
      ),
      tf(
        "Un parchemin du royaume affirme : « La Belgique compte trois Communautés : la flamande, la française et la germanophone. »",
        true,
        "C'est exact ! Les trois Communautés sont définies par la langue : néerlandais, français et allemand."
      ),
      num(
        "Dans la bibliothèque, Elias compte les écussons des provinces wallonnes : Brabant wallon, Hainaut, Liège, Luxembourg, Namur. Combien de provinces compte la Wallonie ?",
        ["5", "cinq"],
        "La Wallonie compte cinq provinces, et la Flandre en compte aussi cinq : cela fait dix provinces pour toute la Belgique."
      ),
      mcq(
        "Une sirène remonte le fleuve qui traverse Namur et Liège, avant de rejoindre les Pays-Bas. Comment s'appelle ce fleuve ?",
        "La Meuse",
        ["L'Escaut", "Le Rhin", "La Seine"],
        "La Meuse traverse Namur et Liège. L'Escaut, lui, passe notamment par Gand et Anvers."
      ),
      gap(
        "Sur la carte, la ___ borde le nord-ouest de la Belgique, et l'___ est une région de collines boisées dans le sud.",
        ["mer du Nord", "Ardenne"],
        ["mer du Nord", "Ardenne", "Meuse", "Escaut"],
        "La mer du Nord forme le littoral belge. L'Ardenne est une région de collines et de forêts au sud de la Wallonie."
      ),
    ],
  },

  // ───────────────────────── L4 — Voisins, Europe, continents
  {
    id: "mo-4",
    title: "Les voisins du royaume",
    intro: "Nour part en barque-voilier explorer les pays voisins de la Belgique, puis l'Europe et le monde.",
    level: 4,
    qs: [
      mat(
        "Au port des Sirènes, Nour apporte une lettre dans la capitale de chaque pays voisin de la Belgique. Relie chaque pays à sa capitale.",
        [
          ["France", "Paris"],
          ["Allemagne", "Berlin"],
          ["Pays-Bas", "Amsterdam"],
          ["Luxembourg", "Luxembourg (ville)"],
        ],
        "Paris, Berlin, Amsterdam et Luxembourg sont les capitales de nos quatre pays voisins."
      ),
      mcq(
        "Le capitaine-sirène demande : « Lequel de ces pays touche la Belgique ? »",
        "Les Pays-Bas",
        ["L'Espagne", "L'Italie", "La Suisse"],
        "Les Pays-Bas sont au nord de la Belgique. L'Espagne, l'Italie et la Suisse ne la touchent pas."
      ),
      num(
        "Sur la carte de Nour, un trait relie la Belgique à chacun de ses voisins directs. Combien de pays voisins la Belgique a-t-elle ?",
        ["4", "quatre"],
        "La Belgique a quatre voisins : la France, le Luxembourg, l'Allemagne et les Pays-Bas."
      ),
      tf(
        "Dans la bibliothèque du temps, Yanis lit : « L'Europe est un continent. »",
        true,
        "Oui, l'Europe est l'un des continents, avec l'Afrique, l'Asie, l'Amérique du Nord, l'Amérique du Sud, l'Océanie et l'Antarctique."
      ),
      mcq(
        "Le bateau de Soumaya accoste à Madrid. Dans quel pays se trouve-t-elle ?",
        "En Espagne",
        ["Au Portugal", "En Italie", "En France"],
        "Madrid est la capitale de l'Espagne. Rome est celle de l'Italie, et Lisbonne celle du Portugal."
      ),
      gap(
        "Nous vivons sur le continent ___. Le plus grand des océans, qui borde l'Asie et l'Amérique, est le ___.",
        ["Europe", "Pacifique"],
        ["Europe", "Pacifique", "Afrique", "Atlantique"],
        "La Belgique est en Europe. Le Pacifique est le plus vaste de tous les océans."
      ),
    ],
  },

  // ───────────────────────── L5 — Vivre ensemble
  {
    id: "mo-5",
    title: "La commune des Sirènes",
    intro: "Dans la commune de Perle-Claire, tout le monde participe aux décisions. Lina découvre comment vivre ensemble.",
    level: 5,
    qs: [
      mcq(
        "Lina visite la maison communale de Perle-Claire. Qui dirige la commune, avec les échevins ?",
        "Le bourgmestre",
        ["Le roi", "Le directeur de l'école", "Le capitaine du port"],
        "Le bourgmestre dirige la commune, aidé des échevins et du conseil communal."
      ),
      tf(
        "Sur le parchemin des droits de l'enfant, Noé lit : « Tous les enfants ont droit à l'éducation, c'est-à-dire d'aller à l'école. » Est-ce prévu par la Convention internationale des droits de l'enfant ?",
        true,
        "Oui. Cette Convention, adoptée en 1989, protège notamment le droit à l'éducation, à la santé, au jeu et à un nom."
      ),
      mcq(
        "Sur le grand drapeau noir, jaune et rouge flotte une devise gravée en lettres d'or. Laquelle est la devise de la Belgique ?",
        "L'union fait la force",
        ["Chacun pour soi", "Tout vient à point à qui sait attendre", "Liberté, égalité, fraternité"],
        "« L'union fait la force » est la devise de la Belgique : ensemble, on est plus forts. « Liberté, égalité, fraternité » est celle de la France."
      ),
      ord(
        "Jour d'élection à Perle-Claire ! Remets dans l'ordre les gestes d'un électeur.",
        [
          "Je reçois ma convocation",
          "Je me rends au bureau de vote",
          "Je vote dans l'isoloir",
          "Je glisse mon bulletin dans l'urne",
        ],
        "On reçoit sa convocation, on va au bureau de vote, on remplit son bulletin dans l'isoloir (en secret), puis on le dépose dans l'urne."
      ),
      mat(
        "La sirène archiviste classe quatre fiches sur la Belgique. Relie chaque fiche à sa réponse.",
        [
          ["Les couleurs du drapeau", "Noir, jaune, rouge"],
          ["La devise", "L'union fait la force"],
          ["La capitale", "Bruxelles"],
          ["La fête nationale", "Le 21 juillet"],
        ],
        "Le drapeau belge est noir, jaune et rouge, la capitale est Bruxelles, et la fête nationale a lieu le 21 juillet."
      ),
      gap(
        "Dans une démocratie, les citoyens ___ pour choisir leurs représentants. Chaque enfant a des ___ protégés par une Convention.",
        ["votent", "droits"],
        ["votent", "droits", "obéissent", "pirates"],
        "En démocratie, on choisit ses représentants en votant. Les droits de l'enfant sont protégés par une Convention internationale."
      ),
    ],
  },

  // ───────────────────────── L6 — Repérer le temps
  {
    id: "mo-6",
    title: "La frise de la bibliothèque du temps",
    intro: "Elias range les parchemins de la bibliothèque du temps : il faut savoir compter les années et les siècles.",
    level: 6,
    qs: [
      ord(
        "Sur la frise de la vie de Mimi, les étiquettes sont tombées. Remets les événements dans l'ordre chronologique.",
        [
          "Mimi naît dans un nid de nuages",
          "Mimi apprend à voler",
          "Mimi entre à l'école des Sirènes",
          "Mimi devient cartographe",
        ],
        "Une frise chronologique classe les événements du plus ancien au plus récent, de gauche à droite."
      ),
      num(
        "Un siècle est une longue période de temps. Combien d'années compte un siècle ?",
        ["100", "cent"],
        "Un siècle dure 100 ans. Dix siècles forment un millénaire."
      ),
      mcq(
        "Le parchemin d'Elias porte l'année 1830. Dans quel siècle se situe cette année ?",
        "Le XIXe siècle",
        ["Le XVIIIe siècle", "Le XXe siècle", "Le XVIIe siècle"],
        "Le XIXe siècle va de 1801 à 1900, donc 1830 en fait partie."
      ),
      num(
        "La bibliothèque du temps a ouvert ses portes en 1950. En 1985, Aya y fête un anniversaire. Combien d'années se sont écoulées entre ces deux dates ?",
        ["35", "35 ans"],
        "1985 − 1950 = 35. Pour calculer une durée, on soustrait la date la plus ancienne de la plus récente.",
        "ans"
      ),
      tf(
        "Sur une pierre du phare, Nour lit l'année 2005. Cette année appartient au XXe siècle.",
        false,
        "Faux : le XXe siècle va de 1901 à 2000. L'année 2005 appartient au XXIe siècle."
      ),
      mat(
        "Relie chaque siècle aux années qu'il contient.",
        [
          ["XVIIe siècle", "1601 à 1700"],
          ["XVIIIe siècle", "1701 à 1800"],
          ["XIXe siècle", "1801 à 1900"],
          ["XXe siècle", "1901 à 2000"],
        ],
        "Le numéro du siècle est toujours en avance d'une unité sur les « centaines » de l'année : 1830 se trouve au XIXe siècle."
      ),
    ],
  },

  // ───────────────────────── L7 — Préhistoire et Antiquité
  {
    id: "mo-7",
    title: "Les voyageurs du temps ancien",
    intro: "Une porte de la bibliothèque s'ouvre sur des temps très anciens : Yanis y rencontre des Gaulois et des Romains.",
    level: 7,
    qs: [
      mcq(
        "Dans la grotte aux peintures, la sirène-guide explique : « La Préhistoire se termine quand les humains inventent… » Quoi donc ?",
        "L'écriture",
        ["L'imprimerie", "Le téléphone", "L'électricité"],
        "La Préhistoire s'achève avec l'invention de l'écriture, qui marque le début de l'Histoire."
      ),
      ord(
        "Sur le grand mur de la bibliothèque du temps, les cinq grandes périodes de l'histoire sont mélangées. Remets-les dans l'ordre.",
        ["La Préhistoire", "L'Antiquité", "Le Moyen Âge", "Les Temps modernes", "L'époque contemporaine"],
        "Les périodes se suivent : Préhistoire, Antiquité, Moyen Âge, Temps modernes, puis l'époque contemporaine, où nous vivons."
      ),
      tf(
        "Dans un récit des Gaulois du royaume, Inès apprend qu'Ambiorix était le chef des Éburons, un peuple qui vivait sur le territoire de la Belgique actuelle.",
        true,
        "Exact : Ambiorix, chef des Éburons, a résisté au général romain Jules César."
      ),
      mat(
        "Mimi découvre trois inventions des Romains. Relie chaque invention à son utilité.",
        [
          ["Les voies romaines", "Des routes droites et pavées pour relier les villes"],
          ["Les aqueducs", "Des ponts pour amener l'eau jusqu'aux villes"],
          ["Les thermes", "Des bains publics pour se laver et se détendre"],
        ],
        "Les Romains ont construit des routes, des aqueducs et des thermes. Beaucoup de nos routes suivent encore d'anciennes voies romaines."
      ),
      mcq(
        "Au Néolithique, Soumaya observe un village de la préhistoire. Quel grand changement les humains ont-ils vécu à cette époque ?",
        "Ils deviennent agriculteurs et éleveurs, et s'installent dans des villages",
        ["Ils construisent des châteaux forts", "Ils inventent l'imprimerie", "Ils découvrent l'Amérique"],
        "Au Néolithique, les humains cultivent la terre, élèvent des animaux et vivent dans des villages au lieu de se déplacer sans cesse."
      ),
      gap(
        "Avant l'arrivée des Romains, notre région était habitée par les ___. Le général romain ___ a conquis la Gaule.",
        ["Gaulois", "César"],
        ["Gaulois", "César", "Vikings", "Charlemagne"],
        "Jules César, général romain, a conquis la Gaule, où vivaient les Gaulois, dont les Éburons."
      ),
    ],
  },

  // ───────────────────────── L8 — Moyen Âge
  {
    id: "mo-8",
    title: "Le château de la Reine des Marées",
    intro: "Noé traverse un miroir de la bibliothèque et se retrouve au Moyen Âge, devant un château fort bâti sur une île.",
    level: 8,
    qs: [
      mcq(
        "Noé lève la tête : au centre du château fort se dresse la plus haute tour, où vit le seigneur. Comment s'appelle-t-elle ?",
        "Le donjon",
        ["Le pont-levis", "Les douves", "Le rempart"],
        "Le donjon est la tour principale d'un château fort. Les douves sont les fossés, et le pont-levis permet de franchir les douves."
      ),
      mat(
        "Dans la cour du château, Aya rencontre quatre personnages. Relie chacun à son rôle.",
        [
          ["Le seigneur", "Possède le château et les terres"],
          ["Le chevalier", "Se bat à cheval avec une armure"],
          ["Le paysan", "Cultive la terre"],
          ["Le moine", "Prie et copie des livres à la main"],
        ],
        "Au Moyen Âge, chacun a son rôle : le seigneur protège ses terres, le chevalier combat, le paysan cultive et le moine copie des livres."
      ),
      ord(
        "Dans la société féodale simplifiée racontée par le héraut, remets les personnages du plus haut placé au moins haut placé.",
        ["Le roi", "Le grand seigneur", "Le chevalier", "Le paysan"],
        "Dans la féodalité, le roi est au sommet, puis les grands seigneurs, les chevaliers et enfin les paysans qui travaillent la terre."
      ),
      tf(
        "En visitant la cathédrale gothique de la ville, Lina admire ses grands vitraux colorés qui laissent entrer la lumière.",
        true,
        "Oui : les cathédrales gothiques ont de grandes fenêtres décorées de vitraux."
      ),
      num(
        "Le héraut annonce : « Le roi Charlemagne est couronné empereur à Noël de l'an… ». Quelle année annonce-t-il ?",
        ["800", "l'an 800"],
        "Charlemagne est couronné empereur à Noël de l'an 800, au début du Moyen Âge."
      ),
      gap(
        "Une ville du Moyen Âge est entourée de ___ pour la protéger. Les artisans d'un même métier se regroupent en ___.",
        ["remparts", "corporations"],
        ["remparts", "corporations", "volcans", "pyramides"],
        "Les remparts protégeaient la ville, et les corporations réunissaient les artisans d'un même métier."
      ),
    ],
  },

  // ───────────────────────── L9 — Temps modernes et naissance de la Belgique
  {
    id: "mo-9",
    title: "La naissance du royaume de Belgique",
    intro: "Le grand horloger de la bibliothèque t'emmène jusqu'au moment où la Belgique est devenue un pays indépendant.",
    level: 9,
    qs: [
      mcq(
        "Dans le salon de l'horloger, un portrait montre le premier roi des Belges. Qui est-il ?",
        "Léopold Ier",
        ["Léopold II", "Charlemagne", "Napoléon"],
        "Léopold Ier a prêté serment en 1831 et est devenu le premier roi des Belges."
      ),
      num(
        "L'horloger fait sonner sa cloche à chaque année importante. En quelle année la Belgique est-elle devenue indépendante ?",
        ["1830"],
        "La Révolution belge a éclaté en 1830 : la Belgique est alors devenue indépendante."
      ),
      ord(
        "Elias accroche quatre grands événements sur la frise de l'horloger. Remets-les dans l'ordre.",
        [
          "Christophe Colomb atteint l'Amérique (1492)",
          "La Révolution française (1789)",
          "L'indépendance de la Belgique (1830)",
          "La Première Guerre mondiale commence (1914)",
        ],
        "Du plus ancien au plus récent : 1492, 1789, 1830, 1914. Regarder les dates aide à ne pas se tromper."
      ),
      tf(
        "L'horloger raconte : « Avant son indépendance, le territoire de la Belgique faisait partie du Royaume des Pays-Bas. »",
        true,
        "C'est vrai. En 1830, les Belges se sont révoltés contre ce royaume et ont fondé leur propre État."
      ),
      mcq(
        "Dans l'atelier de la révolution industrielle, Nour admire une machine qui transforme la chaleur d'un feu de charbon en force. Quelle est cette machine ?",
        "La machine à vapeur",
        ["Le moulin à vent", "L'ordinateur", "Le voilier"],
        "La machine à vapeur a fait fonctionner les usines, les mines et les trains. La Belgique a été l'un des premiers pays à s'industrialiser."
      ),
      mat(
        "Mimi colle trois dates sur le grand calendrier. Relie chaque année à l'événement.",
        [
          ["1830", "La Belgique devient indépendante"],
          ["1831", "Léopold Ier devient le premier roi des Belges"],
          ["1835", "Premier chemin de fer du continent, entre Bruxelles et Malines"],
        ],
        "La Belgique a été indépendante dès 1830, son premier roi a prêté serment en 1831, et le premier train continental a roulé en 1835."
      ),
    ],
  },

  // ───────────────────────── L10 — Époque contemporaine
  {
    id: "mo-10",
    title: "Le grand tour du monde d'aujourd'hui",
    intro: "Avant de quitter l'Archipel, Soumaya compare hier et aujourd'hui, de la Belgique à l'Europe jusqu'au monde entier.",
    level: 10,
    qs: [
      mcq(
        "Un message magique arrive de la Commission européenne, l'une des grandes institutions de l'Union européenne. Dans quelle ville se trouve son siège ?",
        "Bruxelles",
        ["Paris", "Rome", "Berlin"],
        "La Commission européenne siège à Bruxelles, qui est aussi la capitale de la Belgique."
      ),
      tf(
        "Sur la bannière de l'Archipel, Inès reconnaît le drapeau de l'Union européenne : douze étoiles dorées disposées en cercle sur un fond bleu.",
        true,
        "Oui : le drapeau européen a un fond bleu et douze étoiles d'or en cercle."
      ),
      num(
        "Dans un parchemin sur la Seconde Guerre mondiale, Yanis lit les dates 1939 et 1945. Combien d'années cette guerre a-t-elle duré ?",
        ["6", "6 ans", "six"],
        "1945 − 1939 = 6. Cette guerre a duré six ans.",
        "ans"
      ),
      mat(
        "Dans la salle « hier et aujourd'hui », Lina relie chaque objet d'autrefois à son équivalent actuel.",
        [
          ["Une bougie", "Une ampoule électrique"],
          ["Une lettre sur papier", "Un message sur téléphone"],
          ["Une diligence", "Un train rapide"],
        ],
        "Les techniques évoluent : on éclaire, on communique et on voyage plus facilement qu'autrefois."
      ),
      ord(
        "Sur la dernière frise de la bibliothèque, remets ces événements dans l'ordre.",
        [
          "1830 : la Belgique devient indépendante",
          "1914 : début de la Première Guerre mondiale",
          "1957 : traité de Rome, début de l'Europe unie",
          "1969 : des humains marchent sur la Lune",
          "2002 : l'euro circule en pièces et en billets",
        ],
        "Du plus ancien au plus récent : 1830, 1914, 1957, 1969, 2002. La Belgique est l'un des pays fondateurs de l'Europe unie."
      ),
      gap(
        "La ___ désigne les échanges de plus en plus nombreux entre tous les pays du monde. Beaucoup de pays européens utilisent la même monnaie : l'___.",
        ["mondialisation", "euro"],
        ["mondialisation", "euro", "colonisation", "dollar"],
        "La mondialisation relie les pays par les échanges et les communications. L'euro est la monnaie commune de nombreux pays européens."
      ),
    ],
  },
];

// ───────────────────────── Examens blancs
export const EXAM_P4: ExamBlock[] = [
  {
    title: "Se repérer et connaître la Belgique",
    ctx: {
      title: "Le plan de l'île du Phare",
      body: [
        "Sur le plan de l'île du Phare : le triangle rouge représente le phare, le carré bleu représente la bibliothèque.",
        "Échelle : 1 cm sur le plan représente 50 m dans la réalité.",
        "Le phare est dessiné à 3 cm à l'Est de la bibliothèque.",
      ],
    },
    qs: [
      num(
        "D'après le plan, quelle distance réelle sépare la bibliothèque du phare ?",
        ["150", "150 m", "150 mètres"],
        "3 cm × 50 m = 150 m. On multiplie la distance sur le plan par la valeur de l'échelle.",
        "m"
      ),
      mcq(
        "Dans quelle direction un visiteur doit-il marcher depuis la bibliothèque pour atteindre le phare ?",
        "Vers l'Est",
        ["Vers l'Ouest", "Vers le Nord", "Vers le Sud"],
        "Le texte dit que le phare est situé à l'Est de la bibliothèque : il faut donc aller vers l'Est."
      ),
      mcq(
        "Sur la carte d'Hajar, un voisin de la Belgique a pour capitale Berlin. De quel pays s'agit-il ?",
        "L'Allemagne",
        ["La France", "Le Luxembourg", "Les Pays-Bas"],
        "Berlin est la capitale de l'Allemagne, pays voisin de la Belgique à l'Est."
      ),
      mat(
        "Hajar relie chaque territoire à sa capitale.",
        [
          ["La Belgique", "Bruxelles"],
          ["La France", "Paris"],
          ["La Wallonie", "Namur"],
        ],
        "Bruxelles est la capitale de la Belgique, Paris celle de la France et Namur celle de la Wallonie."
      ),
      tf(
        "Dans l'atlas de la bibliothèque, Zakaria lit : « La Meuse est un fleuve qui traverse la Belgique. »",
        true,
        "Oui, la Meuse traverse notamment Namur et Liège avant de continuer vers les Pays-Bas."
      ),
    ],
  },
  {
    title: "Vivre ensemble et se situer dans le temps",
    ctx: {
      title: "La fête du village flottant",
      body: [
        "Aujourd'hui, le village flottant de Brume-Douce organise une grande fête.",
        "Les habitants ont voté pour choisir le thème de la fête, et les enfants ont préparé des affiches sur leurs droits.",
      ],
    },
    qs: [
      mcq(
        "Sur une affiche, Elias écrit un droit de l'enfant reconnu par la Convention internationale. Lequel ?",
        "Le droit de jouer",
        ["Le droit de ne jamais aller à l'école", "Le droit de choisir le bourgmestre", "Le droit de ne jamais dire la vérité"],
        "La Convention internationale des droits de l'enfant reconnaît notamment le droit de jouer, d'apprendre, d'être soigné et d'avoir un nom."
      ),
      tf(
        "Dans l'atelier des drapeaux, Nour affirme : « Le drapeau belge est composé de trois bandes horizontales. »",
        false,
        "Faux : les trois bandes du drapeau belge (noir, jaune, rouge) sont verticales."
      ),
      mcq(
        "Le plus vieux livre de la bibliothèque porte l'année 1950. À quel siècle appartient cette année ?",
        "Le XXe siècle",
        ["Le XIXe siècle", "Le XXIe siècle", "Le XVIIIe siècle"],
        "Le XXe siècle va de 1901 à 2000, donc 1950 en fait partie."
      ),
      ord(
        "Sur la frise de Brume-Douce, remets ces moments de la fête dans l'ordre chronologique.",
        [
          "Les habitants votent pour choisir le thème",
          "Les enfants préparent les affiches",
          "Le village se décore de lanternes",
          "La fête commence au coucher du soleil",
        ],
        "On vote d'abord, on prépare ensuite, on décore, puis la fête commence : l'ordre chronologique suit le déroulement du temps."
      ),
      gap(
        "Dans une démocratie, chaque citoyen peut donner son avis grâce au ___. La devise de la Belgique est « L'union fait la ___ ».",
        ["vote", "force"],
        ["vote", "force", "hasard", "paresse"],
        "Le vote permet à chacun de s'exprimer, et la devise belge rappelle que l'union fait la force."
      ),
    ],
  },
];

export const EXAM_P5: ExamBlock[] = [
  {
    title: "Des Gaulois au Moyen Âge",
    ctx: {
      title: "Le récit du vieux chroniqueur",
      body: [
        "Au Ier siècle avant notre ère, le général romain Jules César conquiert la Gaule. Parmi les peuples qui lui résistent se trouvent les Éburons, conduits par Ambiorix.",
        "Les Romains construisent des routes pavées, les voies romaines, pour relier leurs villes.",
        "Plus tard, au Moyen Âge, des seigneurs font bâtir des châteaux forts et des villes se développent autour de leurs remparts.",
      ],
    },
    qs: [
      mcq(
        "D'après le récit, quel général romain a conquis la Gaule ?",
        "Jules César",
        ["Ambiorix", "Charlemagne", "Léopold Ier"],
        "Le récit cite Jules César, général romain. Ambiorix, lui, était le chef des Éburons qui lui ont résisté."
      ),
      tf(
        "D'après le récit, Ambiorix dirigeait les Romains.",
        false,
        "Faux : Ambiorix était le chef des Éburons, qui résistaient à Jules César."
      ),
      mcq(
        "Pourquoi les Romains ont-ils construit des voies pavées ?",
        "Pour relier facilement leurs villes",
        ["Pour fabriquer des vitraux", "Pour creuser des douves", "Pour faire voter les habitants"],
        "Les voies romaines permettaient de déplacer rapidement armées, marchands et messages entre les villes."
      ),
      ord(
        "Sur la frise du chroniqueur, remets ces époques dans l'ordre.",
        ["La Préhistoire", "L'Antiquité romaine", "Le Moyen Âge", "Les Temps modernes"],
        "Les périodes se suivent dans cet ordre : Préhistoire, Antiquité, Moyen Âge, Temps modernes."
      ),
      mat(
        "Relie chaque élément du château fort à son rôle.",
        [
          ["Le donjon", "La tour principale où vit le seigneur"],
          ["Les douves", "Les fossés qui protègent le château"],
          ["Le pont-levis", "Le pont mobile pour entrer dans le château"],
        ],
        "Le donjon abrite le seigneur, les douves entourent le château et le pont-levis se lève pour fermer l'entrée."
      ),
    ],
  },
  {
    title: "La Belgique et l'Europe",
    ctx: {
      title: "Le carnet de voyage de la sirène Maëlys",
      body: [
        "En 1830, la Belgique devient un pays indépendant. En 1831, Léopold Ier devient son premier roi.",
        "En 1835, le premier chemin de fer du continent européen relie Bruxelles à Malines.",
        "Aujourd'hui, la Belgique fait partie de l'Union européenne, dont de grandes institutions siègent à Bruxelles.",
      ],
    },
    qs: [
      num(
        "D'après le carnet, combien d'années séparent l'indépendance de la Belgique du premier chemin de fer du continent ?",
        ["5", "5 ans", "cinq"],
        "1835 − 1830 = 5. Il s'est écoulé cinq ans entre ces deux événements.",
        "ans"
      ),
      mcq(
        "D'après le carnet, qui devient le premier roi de la Belgique indépendante ?",
        "Léopold Ier",
        ["Charlemagne", "Jules César", "Ambiorix"],
        "Le carnet précise que Léopold Ier devient roi en 1831."
      ),
      tf(
        "D'après le carnet, le premier chemin de fer du continent européen reliait Bruxelles à Malines.",
        true,
        "Oui, la première ligne du continent relie Bruxelles et Malines en 1835."
      ),
      mcq(
        "Dans quel siècle se situe l'année 1835 ?",
        "Le XIXe siècle",
        ["Le XVIIIe siècle", "Le XXe siècle", "Le XVIIe siècle"],
        "Le XIXe siècle va de 1801 à 1900 ; 1835 en fait partie."
      ),
      gap(
        "Beaucoup de pays européens ont la même monnaie, l'___. La Belgique est un pays de l'Union ___.",
        ["euro", "européenne"],
        ["euro", "européenne", "africaine", "médiévale"],
        "L'euro est la monnaie commune de nombreux pays, et la Belgique est membre de l'Union européenne."
      ),
    ],
  },
];
