// Contenus pédagogiques originaux, non officiels, inspirés des compétences attendues en 4e primaire (Belgique).

export type Question = {
  q: string;
  choices: string[];
  a: number; // index de la bonne réponse
  e: string; // explication
};

export type Mission = {
  id: string;
  title: string;
  intro: string;
  text?: { title: string; body: string[] };
  questions: Question[];
};

export type World = {
  id: string;
  name: string;
  subject: string;
  tagline: string;
  hue: number;
  pos: { x: number; y: number }; // position du portail sur la carte, en %
  missions: Mission[];
};

export const WORLDS: World[] = [
  {
    id: "francais",
    name: "La Bibliothèque des Mots",
    subject: "Français",
    tagline: "Les livres volants gardent les secrets de la grammaire.",
    hue: 345,
    pos: { x: 23, y: 21 },
    missions: [
      {
        id: "fr-1",
        title: "La famille des mots",
        intro: "Reconnais le nom, le verbe, l'adjectif et leurs amis.",
        questions: [
          { q: "Dans « Le petit chat dort », quel mot est un adjectif ?", choices: ["Le", "petit", "chat", "dort"], a: 1, e: "« Petit » donne une précision sur le nom « chat » : c'est un adjectif." },
          { q: "Quel est le verbe dans « Mamie prépare une tarte » ?", choices: ["Mamie", "prépare", "une", "tarte"], a: 1, e: "« Prépare » dit ce que fait Mamie. On peut le conjuguer : je prépare, nous préparons." },
          { q: "Quel mot est un nom commun ?", choices: ["rapidement", "jardin", "joli", "chanter"], a: 1, e: "On peut mettre un déterminant devant « jardin » : le jardin, un jardin. C'est un nom commun." },
          { q: "Quel déterminant convient ? « ___ oranges sont mûres. »", choices: ["Le", "La", "Les", "Un"], a: 2, e: "« Oranges » est au pluriel (avec un s), il faut donc un déterminant pluriel : les." },
          { q: "Dans « Elle chante fort », le mot « Elle » est…", choices: ["un nom", "un adjectif", "un pronom personnel", "un verbe"], a: 2, e: "« Elle » remplace un nom (par exemple « Maïssa »). C'est un pronom personnel." },
        ],
      },
      {
        id: "fr-2",
        title: "Le grimoire du présent",
        intro: "Conjugue les verbes au présent de l'indicatif.",
        questions: [
          { q: "Nous (finir) nos devoirs.", choices: ["finons", "finissons", "finissez", "finirons"], a: 1, e: "« Finir » est un verbe du 2e groupe : nous finissons, avec « -iss- »." },
          { q: "Ils (aller) à la piscine.", choices: ["allent", "vont", "vas", "va"], a: 1, e: "« Aller » est irrégulier : je vais, tu vas, il va, nous allons, vous allez, ils vont." },
          { q: "Tu (être) très courageuse.", choices: ["est", "es", "ai", "et"], a: 1, e: "Avec « tu », le verbe être s'écrit « es » : tu es." },
          { q: "Vous (faire) un gâteau.", choices: ["faisez", "faites", "fait", "faisons"], a: 1, e: "C'est une exception à retenir : vous faites (comme vous dites, vous êtes)." },
          { q: "Je (prendre) mon cartable.", choices: ["prend", "prends", "prenons", "prent"], a: 1, e: "Avec « je », prendre se termine par « -ds » : je prends, tu prends, il prend." },
        ],
      },
      {
        id: "fr-3",
        title: "Les jumeaux trompeurs",
        intro: "Accords et homophones : a ou à, et ou est…",
        questions: [
          { q: "Il ___ un nouveau vélo.", choices: ["a", "à"], a: 0, e: "On peut dire « il avait un vélo » : c'est le verbe avoir, donc « a » sans accent." },
          { q: "Les fleurs sont ___.", choices: ["joli", "jolis", "jolie", "jolies"], a: 3, e: "« Fleurs » est féminin pluriel : l'adjectif prend un e et un s, jolies." },
          { q: "Je vais ___ la mer cet été.", choices: ["a", "à"], a: 1, e: "On ne peut pas dire « je vais avait la mer » : c'est la préposition « à » avec un accent." },
          { q: "Mon frère ___ ma sœur jouent ensemble.", choices: ["est", "et"], a: 1, e: "On peut dire « mon frère et puis ma sœur » : c'est « et » qui relie deux mots." },
          { q: "Elle ___ contente de son dessin.", choices: ["est", "et"], a: 0, e: "On peut dire « elle était contente » : c'est le verbe être, donc « est »." },
        ],
      },
    ],
  },
  {
    id: "maths",
    name: "La Tour de Cristal",
    subject: "Mathématiques",
    tagline: "Chaque cristal cache un nombre à apprivoiser.",
    hue: 265,
    pos: { x: 51, y: 12 },
    missions: [
      {
        id: "ma-1",
        title: "Les géants des nombres",
        intro: "Lis, écris et compare les nombres jusqu'à 100 000.",
        questions: [
          { q: "Comment écrit-on « quarante-trois mille deux cent six » ?", choices: ["43 260", "43 206", "4 326", "430 206"], a: 1, e: "43 milliers, 2 centaines, 0 dizaine et 6 unités : 43 206." },
          { q: "Dans 58 714, quel est le chiffre des milliers ?", choices: ["5", "8", "7", "1"], a: 1, e: "On lit de droite à gauche : 4 unités, 1 dizaine, 7 centaines, 8 milliers." },
          { q: "Quel est le plus grand nombre ?", choices: ["70 099", "70 909", "70 990", "69 999"], a: 2, e: "Les dizaines de mille et les milliers sont égaux (70). On compare les centaines : 9 centaines dans 70 909 et 70 990, puis les dizaines : 9 contre 0. C'est 70 990." },
          { q: "Arrondis 4 680 à la centaine la plus proche.", choices: ["4 600", "4 700", "4 000", "5 000"], a: 1, e: "Le chiffre des dizaines est 8 (5 ou plus), on arrondit vers le haut : 4 700." },
          { q: "25 000 + 3 000 = ?", choices: ["28 000", "25 300", "55 000", "22 000"], a: 0, e: "25 milliers + 3 milliers = 28 milliers, donc 28 000." },
        ],
      },
      {
        id: "ma-2",
        title: "Le sortilège des tables",
        intro: "Calcul mental et opérations écrites.",
        questions: [
          { q: "7 × 8 = ?", choices: ["54", "56", "63", "48"], a: 1, e: "7 × 8 = 56. Une astuce : 5, 6, 7, 8 → 56 = 7 × 8." },
          { q: "63 : 9 = ?", choices: ["6", "7", "8", "9"], a: 1, e: "9 × 7 = 63, donc 63 : 9 = 7." },
          { q: "25 × 4 = ?", choices: ["90", "100", "125", "80"], a: 1, e: "4 fois 25, c'est comme 4 pièces de 25 cents : 100." },
          { q: "345 + 278 = ?", choices: ["513", "613", "623", "633"], a: 2, e: "5 + 8 = 13 (je retiens 1), 4 + 7 + 1 = 12 (je retiens 1), 3 + 2 + 1 = 6 : 623." },
          { q: "502 − 147 = ?", choices: ["355", "365", "445", "455"], a: 0, e: "Vérification : 355 + 147 = 502. La réponse est donc 355." },
        ],
      },
      {
        id: "ma-3",
        title: "Le festin des fractions",
        intro: "Fractions simples et petits problèmes.",
        questions: [
          { q: "Un gâteau est coupé en 8 parts égales. Maïssa en mange 3. Quelle fraction a-t-elle mangée ?", choices: ["3/5", "5/8", "3/8", "8/3"], a: 2, e: "On prend 3 parts sur 8 parts égales : 3/8." },
          { q: "Quelle est la moitié de 46 ?", choices: ["22", "23", "24", "26"], a: 1, e: "46 = 40 + 6. La moitié de 40 est 20, la moitié de 6 est 3 : 23." },
          { q: "Quelle fraction est la plus grande ?", choices: ["1/2", "1/3", "1/4", "1/8"], a: 0, e: "Plus on partage en peu de parts, plus chaque part est grande. 1/2 est la plus grande." },
          { q: "Un livre coûte 12 €. Combien coûtent 3 livres ?", choices: ["15 €", "24 €", "36 €", "32 €"], a: 2, e: "3 × 12 € = 36 €." },
          { q: "24 billes sont partagées équitablement entre 4 enfants. Combien chacun en reçoit-il ?", choices: ["4", "6", "8", "20"], a: 1, e: "24 : 4 = 6, car 4 × 6 = 24." },
        ],
      },
    ],
  },
  {
    id: "grandeurs",
    name: "Le Pont des Horloges",
    subject: "Grandeurs",
    tagline: "Les engrenages mesurent tout : le temps, le poids, la distance.",
    hue: 32,
    pos: { x: 79, y: 22 },
    missions: [
      {
        id: "gr-1",
        title: "La règle enchantée",
        intro: "Longueurs, conversions et périmètre.",
        questions: [
          { q: "1 mètre = combien de centimètres ?", choices: ["10 cm", "100 cm", "1 000 cm", "50 cm"], a: 1, e: "1 m = 10 dm = 100 cm." },
          { q: "3 km = combien de mètres ?", choices: ["30 m", "300 m", "3 000 m", "30 000 m"], a: 2, e: "1 km = 1 000 m, donc 3 km = 3 000 m." },
          { q: "250 cm, c'est…", choices: ["25 m", "2,5 m", "0,25 m", "2 m 5 cm"], a: 1, e: "100 cm = 1 m. 250 cm = 2 m et 50 cm, soit 2,5 m." },
          { q: "Quelle unité choisir pour mesurer une gomme ?", choices: ["le kilomètre", "le mètre", "le centimètre", "le litre"], a: 2, e: "Une gomme mesure quelques centimètres. Le litre mesure une capacité, pas une longueur." },
          { q: "Quel est le périmètre d'un carré de 5 cm de côté ?", choices: ["10 cm", "20 cm", "25 cm", "15 cm"], a: 1, e: "Un carré a 4 côtés égaux : 4 × 5 cm = 20 cm." },
        ],
      },
      {
        id: "gr-2",
        title: "La balance des géants",
        intro: "Masses et capacités.",
        questions: [
          { q: "1 kg = combien de grammes ?", choices: ["10 g", "100 g", "1 000 g", "10 000 g"], a: 2, e: "Kilo veut dire mille : 1 kg = 1 000 g." },
          { q: "1 litre = combien de centilitres ?", choices: ["10 cl", "100 cl", "1 000 cl", "50 cl"], a: 1, e: "1 L = 10 dl = 100 cl." },
          { q: "Une grande bouteille d'eau contient environ…", choices: ["1,5 cl", "1,5 L", "15 L", "150 L"], a: 1, e: "Les grandes bouteilles d'eau du magasin contiennent souvent 1,5 L." },
          { q: "Qu'est-ce qui est le plus lourd ?", choices: ["2 kg", "1 500 g", "1 kg 800 g", "1 999 g"], a: 0, e: "2 kg = 2 000 g. C'est plus que 1 500 g, 1 800 g et 1 999 g." },
          { q: "Un demi-litre, c'est…", choices: ["5 cl", "50 cl", "500 cl", "25 cl"], a: 1, e: "1 L = 100 cl, la moitié fait 50 cl." },
        ],
      },
      {
        id: "gr-3",
        title: "L'horloge et la bourse",
        intro: "Durées, heures et monnaie.",
        questions: [
          { q: "Combien de minutes dans une heure ?", choices: ["30", "60", "100", "24"], a: 1, e: "1 heure = 60 minutes." },
          { q: "Un film commence à 14 h 30 et dure 1 h 45. À quelle heure finit-il ?", choices: ["15 h 75", "16 h 15", "16 h 45", "15 h 45"], a: 1, e: "14 h 30 + 1 h = 15 h 30. Puis + 45 min : 15 h 30 + 30 min = 16 h, + 15 min = 16 h 15." },
          { q: "Combien d'heures dure une journée complète ?", choices: ["12 h", "24 h", "60 h", "7 h"], a: 1, e: "Un jour complet (jour et nuit) dure 24 heures." },
          { q: "Tu paies un jouet de 7,50 € avec un billet de 10 €. Combien te rend-on ?", choices: ["3,50 €", "2,50 €", "2,05 €", "3 €"], a: 1, e: "7,50 € + 2,50 € = 10 €. On te rend 2,50 €." },
          { q: "Combien de minutes dans un quart d'heure ?", choices: ["15", "25", "30", "45"], a: 0, e: "Un quart de 60 minutes : 60 : 4 = 15 minutes." },
        ],
      },
    ],
  },
  {
    id: "sciences",
    name: "Le Jardin des Étoiles",
    subject: "Sciences",
    tagline: "Champignons lumineux et télescope géant : observe le monde.",
    hue: 168,
    pos: { x: 20, y: 70 },
    missions: [
      {
        id: "sc-1",
        title: "Le palais du corps",
        intro: "Découvre comment ton corps fonctionne.",
        questions: [
          { q: "Quel organe pompe le sang dans tout le corps ?", choices: ["les poumons", "le cœur", "l'estomac", "le cerveau"], a: 1, e: "Le cœur est un muscle qui fait circuler le sang dans les vaisseaux sanguins." },
          { q: "À quoi servent les poumons ?", choices: ["à digérer", "à respirer", "à voir", "à marcher"], a: 1, e: "Les poumons font entrer l'air et donnent l'oxygène au sang." },
          { q: "Combien de sens avons-nous ?", choices: ["3", "4", "5", "6"], a: 2, e: "La vue, l'ouïe, l'odorat, le goût et le toucher : 5 sens." },
          { q: "Quel os protège le cerveau ?", choices: ["le fémur", "le crâne", "les côtes", "la colonne"], a: 1, e: "Le crâne est une boîte osseuse solide qui protège le cerveau." },
          { q: "Quel aliment est riche en calcium, bon pour les os ?", choices: ["le yaourt", "les chips", "le sucre", "la limonade"], a: 0, e: "Les produits laitiers comme le yaourt et le fromage apportent du calcium." },
        ],
      },
      {
        id: "sc-2",
        title: "Les secrets du vivant",
        intro: "Plantes, animaux et saisons.",
        questions: [
          { q: "De quoi une plante verte a-t-elle besoin pour fabriquer sa nourriture ?", choices: ["de sucre et de sel", "de lumière, d'eau et d'air", "de nuit totale", "de lait"], a: 1, e: "Grâce à la lumière, à l'eau et au gaz de l'air, les feuilles fabriquent la nourriture de la plante." },
          { q: "Quel animal pond des œufs (ovipare) ?", choices: ["le chien", "la vache", "la poule", "le chat"], a: 2, e: "La poule pond des œufs. Le chien, la vache et le chat mettent au monde des petits vivants." },
          { q: "En quoi la chenille se transforme-t-elle ?", choices: ["en papillon", "en abeille", "en araignée", "en ver de terre"], a: 0, e: "La chenille fabrique une chrysalide, puis devient papillon : c'est la métamorphose." },
          { q: "Quel animal est herbivore ?", choices: ["le lion", "le lapin", "le requin", "le loup"], a: 1, e: "Le lapin mange des plantes : herbe, feuilles, carottes. Il est herbivore." },
          { q: "En Belgique, à quelle saison beaucoup d'arbres perdent-ils leurs feuilles ?", choices: ["au printemps", "en été", "en automne", "jamais"], a: 2, e: "En automne, les feuilles changent de couleur puis tombent." },
        ],
      },
      {
        id: "sc-3",
        title: "Matière et ciel",
        intro: "L'eau, les aimants et la Terre.",
        questions: [
          { q: "À quelle température l'eau pure gèle-t-elle ?", choices: ["0 °C", "10 °C", "50 °C", "100 °C"], a: 0, e: "L'eau devient glace à 0 °C. Elle bout à 100 °C." },
          { q: "Combien de temps met la Terre pour tourner sur elle-même ?", choices: ["environ 1 heure", "environ 24 heures", "environ 1 semaine", "environ 1 an"], a: 1, e: "Un tour sur elle-même prend environ 24 h : c'est ce qui fait le jour et la nuit." },
          { q: "Un glaçon qui fond devient…", choices: ["solide", "liquide", "gazeux", "invisible"], a: 1, e: "La glace (solide) fond et devient de l'eau liquide." },
          { q: "Autour de quoi la Terre tourne-t-elle en un an ?", choices: ["la Lune", "le Soleil", "Mars", "une étoile filante"], a: 1, e: "La Terre fait le tour du Soleil en un an environ." },
          { q: "Quel objet est attiré par un aimant ?", choices: ["un trombone en fer", "une gomme", "un crayon en bois", "une feuille"], a: 0, e: "L'aimant attire le fer. Le bois, le papier et le caoutchouc ne sont pas attirés." },
        ],
      },
    ],
  },
  {
    id: "lecture",
    name: "Le Village des Contes",
    subject: "Lecture",
    tagline: "Dans chaque chaumière, une histoire t'attend.",
    hue: 205,
    pos: { x: 52, y: 86 },
    missions: [
      {
        id: "le-1",
        title: "Le phare de Lila",
        intro: "Lis l'histoire, puis réponds. Tu peux relire le texte à tout moment.",
        text: {
          title: "Le phare de Lila",
          body: [
            "Lila habite une petite maison près de la mer du Nord, juste à côté d'un vieux phare. Chaque soir, son grand-père Émile monte les cent douze marches pour vérifier la grande lampe.",
            "Un soir de tempête, la lampe s'éteint. Lila attrape sa lampe de poche bleue, grimpe derrière son grand-père et éclaire l'escalier. Ensemble, ils changent l'ampoule.",
            "Au loin, un petit bateau de pêche fait clignoter ses lumières trois fois. « Il nous dit merci », sourit Émile.",
          ],
        },
        questions: [
          { q: "Où habite Lila ?", choices: ["à la montagne", "près de la mer du Nord", "dans une grande ville", "sur un bateau"], a: 1, e: "Le texte dit : « Lila habite une petite maison près de la mer du Nord »." },
          { q: "Qui vérifie la lampe chaque soir ?", choices: ["Lila", "le pêcheur", "le grand-père Émile", "la maman de Lila"], a: 2, e: "« Son grand-père Émile monte les cent douze marches pour vérifier la grande lampe. »" },
          { q: "Combien de marches compte le phare ?", choices: ["102", "112", "120", "211"], a: 1, e: "Cent douze marches, c'est 112." },
          { q: "Comment Lila aide-t-elle pendant la tempête ?", choices: ["elle appelle les pompiers", "elle éclaire l'escalier avec sa lampe de poche", "elle reste dans son lit", "elle conduit le bateau"], a: 1, e: "Elle prend sa lampe de poche bleue et éclaire l'escalier." },
          { q: "Pourquoi le bateau clignote-t-il trois fois ?", choices: ["il est en panne", "il veut dire merci", "il a peur", "il joue"], a: 1, e: "Émile explique : « Il nous dit merci ». Le phare remarche et guide le bateau." },
        ],
      },
      {
        id: "le-2",
        title: "Le potager de l'école",
        intro: "Une classe qui jardine. Lis attentivement.",
        text: {
          title: "Le potager de l'école",
          body: [
            "La classe de madame Nadia a reçu un coin de terre derrière la cour. En mars, les élèves sèment des radis, des carottes et des tournesols.",
            "Yanis veut bien faire : il arrose les radis tous les jours, matin et soir. Bientôt, certaines graines pourrissent. Madame Nadia explique qu'une plante a besoin d'eau, mais pas d'un bain !",
            "En juin, les tournesols dépassent la grille de l'école. Les enfants vendent leurs radis à la fête de l'école et achètent un nouvel arrosoir avec l'argent récolté.",
          ],
        },
        questions: [
          { q: "À quel moment les élèves sèment-ils les graines ?", choices: ["en janvier", "en mars", "en juin", "en octobre"], a: 1, e: "« En mars, les élèves sèment des radis, des carottes et des tournesols. »" },
          { q: "Pourquoi certaines graines de radis pourrissent-elles ?", choices: ["il fait trop froid", "Yanis les arrose trop", "les oiseaux les mangent", "elles manquent de soleil"], a: 1, e: "Yanis arrose matin et soir : trop d'eau fait pourrir les graines." },
          { q: "Que veut dire madame Nadia par « pas d'un bain » ?", choices: ["il faut laver les plantes", "trop d'eau abîme la plante", "les plantes aiment la piscine", "il ne faut jamais arroser"], a: 1, e: "C'est une image : la plante a besoin d'un peu d'eau, pas d'être noyée." },
          { q: "Que se passe-t-il en juin ?", choices: ["les tournesols dépassent la grille", "le potager est fermé", "il neige", "Yanis déménage"], a: 0, e: "« En juin, les tournesols dépassent la grille de l'école. »" },
          { q: "Qu'achètent les enfants avec l'argent ?", choices: ["des bonbons", "un nouvel arrosoir", "des graines de fraises", "un ballon"], a: 1, e: "Ils achètent un nouvel arrosoir avec l'argent de la vente des radis." },
        ],
      },
      {
        id: "le-3",
        title: "Le dragon qui avait peur du noir",
        intro: "Un conte du royaume. Lis-le jusqu'au bout.",
        text: {
          title: "Le dragon qui avait peur du noir",
          body: [
            "Dans la montagne de Brumevent vivait Pistache, un jeune dragon vert. Tout le monde le croyait féroce, mais Pistache avait un secret : il avait peur du noir. Chaque nuit, il crachait de petites flammes pour éclairer sa grotte.",
            "Un soir, une fillette nommée Inès se perdit dans la montagne. Elle aperçut une lumière orange qui dansait entre les rochers et s'approcha. Pistache, tout timide, lui offrit une place près de son feu.",
            "Au matin, il la raccompagna jusqu'au village. Depuis ce jour, les habitants l'appellent « le gardien lumineux ».",
          ],
        },
        questions: [
          { q: "Quel est le secret de Pistache ?", choices: ["il ne sait pas voler", "il a peur du noir", "il aime les bonbons", "il est très vieux"], a: 1, e: "Le texte dit : « Pistache avait un secret : il avait peur du noir »." },
          { q: "Pourquoi crache-t-il des flammes la nuit ?", choices: ["pour faire peur", "pour éclairer sa grotte", "pour cuisiner", "pour jouer"], a: 1, e: "« Il crachait de petites flammes pour éclairer sa grotte. »" },
          { q: "Comment Inès trouve-t-elle la grotte ?", choices: ["elle suit une carte", "elle voit une lumière orange", "elle entend une chanson", "un oiseau la guide"], a: 1, e: "Elle aperçoit la lumière orange du feu de Pistache et s'approche." },
          { q: "Quels mots décrivent le mieux Pistache ?", choices: ["féroce et méchant", "gentil et timide", "paresseux et triste", "bruyant et fier"], a: 1, e: "Les gens le croyaient féroce, mais il est timide et il aide Inès : il est gentil." },
          { q: "Quel surnom les villageois lui donnent-ils ?", choices: ["le dragon vert", "le gardien lumineux", "le roi de Brumevent", "le cracheur de feu"], a: 1, e: "« Les habitants l'appellent le gardien lumineux. »" },
        ],
      },
    ],
  },
  {
    id: "defis",
    name: "Le Château d'Or",
    subject: "Défis P4",
    tagline: "Les grandes épreuves mélangées, pour les vraies aventurières.",
    hue: 45,
    pos: { x: 80, y: 72 },
    missions: [
      {
        id: "de-1",
        title: "L'énigme des suites",
        intro: "Logique et raisonnement.",
        questions: [
          { q: "Continue la suite : 3, 6, 12, 24, …", choices: ["30", "36", "48", "27"], a: 2, e: "Chaque nombre est doublé : 24 × 2 = 48." },
          { q: "Continue la suite : 100, 91, 82, …", choices: ["72", "73", "74", "81"], a: 1, e: "On enlève 9 à chaque fois : 82 − 9 = 73." },
          { q: "Aujourd'hui, c'est lundi. Quel jour serons-nous après-demain ?", choices: ["mardi", "mercredi", "jeudi", "dimanche"], a: 1, e: "Demain : mardi. Après-demain : mercredi." },
          { q: "Ali est plus grand que Ben. Ben est plus grand que Cléo. Qui est le plus petit ?", choices: ["Ali", "Ben", "Cléo", "on ne sait pas"], a: 2, e: "Ali > Ben > Cléo. Cléo est la plus petite." },
          { q: "Combien de côtés a un hexagone ?", choices: ["5", "6", "7", "8"], a: 1, e: "Hexa veut dire six : un hexagone a 6 côtés, comme une alvéole d'abeille." },
        ],
      },
      {
        id: "de-2",
        title: "Les formes du château",
        intro: "Géométrie : figures et solides.",
        questions: [
          { q: "Combien d'angles droits a un rectangle ?", choices: ["2", "3", "4", "0"], a: 2, e: "Un rectangle a 4 angles droits, un à chaque coin." },
          { q: "Comment s'appelle une figure à 3 côtés ?", choices: ["un carré", "un triangle", "un cercle", "un losange"], a: 1, e: "Tri veut dire trois : le triangle a 3 côtés." },
          { q: "Combien de faces a un cube ?", choices: ["4", "6", "8", "12"], a: 1, e: "Un cube, comme un dé, a 6 faces carrées." },
          { q: "Deux droites qui ne se croisent jamais sont…", choices: ["perpendiculaires", "parallèles", "courbes", "sécantes"], a: 1, e: "Les droites parallèles gardent toujours le même écart, comme les rails d'un train." },
          { q: "Quel solide peut rouler dans toutes les directions ?", choices: ["le cube", "la boule", "la pyramide", "le pavé"], a: 1, e: "La boule (sphère) n'a aucune face plate : elle roule dans tous les sens." },
        ],
      },
      {
        id: "de-3",
        title: "Le grand défi de la reine",
        intro: "Problèmes mélangés. Prends ton temps.",
        questions: [
          { q: "Maïssa lit 15 pages par jour pendant 6 jours. Combien de pages lit-elle ?", choices: ["21", "80", "90", "96"], a: 2, e: "15 × 6 = 90 pages (10 × 6 = 60 et 5 × 6 = 30)." },
          { q: "Un bus a 48 places. 29 sont occupées. Combien restent libres ?", choices: ["19", "21", "29", "77"], a: 0, e: "48 − 29 = 19. Vérification : 29 + 19 = 48." },
          { q: "Une ficelle de 2 m est coupée en 4 morceaux égaux. Combien mesure un morceau ?", choices: ["25 cm", "50 cm", "40 cm", "2 cm"], a: 1, e: "2 m = 200 cm. 200 : 4 = 50 cm." },
          { q: "Une pomme coûte 0,40 €. Combien coûtent 3 pommes ?", choices: ["1,20 €", "1,40 €", "0,43 €", "12 €"], a: 0, e: "3 × 40 cents = 120 cents = 1,20 €." },
          { q: "Une classe a 24 élèves. La moitié sont des filles. Un tiers des filles porte des lunettes. Combien de filles portent des lunettes ?", choices: ["3", "4", "6", "8"], a: 1, e: "La moitié de 24 = 12 filles. Un tiers de 12 = 4 filles." },
        ],
      },
    ],
  },
];

export const ALL_MISSIONS = WORLDS.flatMap((w) => w.missions.map((m) => ({ ...m, world: w })));
export const MAX_STARS = ALL_MISSIONS.reduce((s, m) => s + m.questions.length, 0);

export function findMission(id: string) {
  return ALL_MISSIONS.find((m) => m.id === id);
}
export function findWorld(id: string) {
  return WORLDS.find((w) => w.id === id);
}
