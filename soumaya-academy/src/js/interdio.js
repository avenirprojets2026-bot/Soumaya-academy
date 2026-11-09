// Évaluations interdiocésaines P4 des autres années (2022, 2024) : l'épreuve officielle en version interactive
// + un entraînement « même type, nouveaux nombres » généré à chaque partie.
import * as UI from './ui.js';
import { h } from './ui.js';
import * as S from './save.js';
import * as Sfx from './sfx.js';
import * as Voice from './voice.js';
import { burst, shuffle, ri } from './workshop.js';

const star = (n = 1) => { const b = S.get(); b.bonusStars = (b.bonusStars || 0) + n; b.coins += 2 * n; S.save(); };
const pick = (a) => a[ri(0, a.length - 1)];
const fr = (x) => { const [i, d] = String(+x.toFixed(4)).split('.'); return i.replace(/\B(?=(\d{3})+$)/g, ' ') + (d ? ',' + d : ''); };
const norm = (s) => String(s).trim().replace(/\s/g, '').replace('.', ',').replace(/^,/, '0,').replace(/^0+(?=\d)/, '').replace(/(,\d*?)0+$/, '$1').replace(/,$/, '').toLowerCase();

// ---------- l'épreuve officielle 2022 (Document 2 · Les nombres), questions recopiées en interactif ----------
const OFF2022 = [
  { q: 'Q1 · Il y a 104 fleurs. On les entoure par paquets de 20. Quel calcul permet de les dénombrer ?', o: ['5 × 20 + 4', '20 + 4', '10 × 10 + 4', '5 + 20 + 4'], r: '5 × 20 + 4', why: '5 paquets de 20 = 100, plus 4 fleurs : 104.' },
  { q: 'Q1 · En tout, combien y a-t-il de fleurs ?', s: '104', why: '5 × 20 + 4 = 104.' },
  { q: 'Q2 · Écris en chiffres : soixante-six-mille-six unités.', s: '66006', why: '66 006 : 6 DM, 6 UM, 0 C, 0 D, 6 U.' },
  { q: 'Q2 · Écris en chiffres : soixante unités six dixièmes.', s: '60,6', why: '60,6 : 6 D, 0 U, 6 d.' },
  { q: 'Q3 · 11,01 … 11,1', o: ['<', '=', '>'], r: '<', why: '11,01 = 11,01 et 11,1 = 11,10 : 1 centième < 10 centièmes.' },
  { q: 'Q3 · 89,20 … 89,2', o: ['<', '=', '>'], r: '=', why: 'Un zéro à la fin de la partie décimale ne change rien : 89,20 = 89,2.' },
  { q: 'Comme Q4 · 100 000 = 50 000 + …', s: '50000', why: 'La moitié de 100 000 est 50 000.' },
  { q: 'Comme Q4 · 100 000 = 75 000 + …', s: '25000', why: '100 000 − 75 000 = 25 000.' },
  { q: 'Comme Q4 · 100 000 = 20 000 + … + 20 000 + 20 000 + 20 000 (5 parts égales)', s: '20000', why: '100 000 : 5 = 20 000.' },
  { q: 'Q5 · Règle de la suite 0 · 11 · 22 · 33 · 44 · 55', o: ['+ 11', '× 11', '+ 10', '× 2'], r: '+ 11', why: 'On ajoute 11 à chaque fois.' },
  { q: 'Q5 · Règle de la suite 0,25 · 1 · 4 · 16 · 64 · 256', o: ['× 4', '+ 0,75', '× 2', '+ 4'], r: '× 4', why: 'Chaque nombre est 4 fois plus grand que le précédent.' },
  { q: 'Q6 · 8 775 + 2 857,6 =', s: '11632,6', why: 'Aligne les virgules : 8 775,0 + 2 857,6 = 11 632,6.' },
  { q: 'Q6 · 3 704 − 836,3 =', s: '2867,7', why: '3 704,0 − 836,3 = 2 867,7.' },
  { q: 'Q6 · 483 × 35 =', s: '16905', why: '483 × 30 = 14 490 ; 483 × 5 = 2 415 ; total 16 905.' },
  { q: 'Q7 · « François partage 24 petits pains entre 6 personnes. Chacun reçoit 4. » Quelle opération ?', o: ['Division', 'Multiplication', 'Soustraction', 'Addition'], r: 'Division', why: 'Partager équitablement = diviser : 24 : 6 = 4.' },
  { q: 'Q7 · « 15 rangées de 12 places : 180 places. » Quelle opération ?', o: ['Multiplication', 'Addition', 'Division', 'Soustraction'], r: 'Multiplication', why: '15 × 12 = 180.' },
  { q: 'Q7 · « 329 passagers, il en reste 292 : 37 sont descendus. » Quelle opération ?', o: ['Soustraction', 'Addition', 'Division', 'Multiplication'], r: 'Soustraction', why: '329 − 292 = 37.' },
  { q: 'Q8 · 29,7 + 86 : quelle est la meilleure estimation ?', o: ['environ 116', 'environ 106', 'environ 1 156', 'environ 56'], r: 'environ 116', why: '29,7 ≈ 30 ; 30 + 86 = 116.' },
  { q: 'Q8 · 29,7 + 86 =', s: '115,7', why: '29,7 + 86,0 = 115,7.' },
  { q: 'Q8 · Arrondis 115,7 à l’unité.', s: '116', why: '7 dixièmes ≥ 5 : on arrondit à l’unité supérieure.' },
  { q: 'Q9 · 15 − 0,36 = 15 − 0,4 + … = 14,64', s: '0,04', why: 'On a enlevé 0,04 de trop : on les rajoute.' },
  { q: 'Q9 · 180 × 9 = 180 × 10 − … = 1 620', s: '180', why: '× 9 = × 10 puis on enlève une fois 180.' },
  { q: 'Q9 · 4 000 : 50 = 4 000 : 100 × … = 80', s: '2', why: 'Diviser par 50, c’est diviser par 100 puis multiplier par 2.' },
  { q: 'Q10 · 1/4 =', s: '0,25', why: 'Un quart = 25 centièmes.' },
  { q: 'Q10 · … /10 = 0,6', s: '6', why: '0,6 = 6 dixièmes = 6/10.' },
  { q: 'Q10 · 3/2 =', s: '1,5', why: 'Trois demis = 1 et une demie = 1,5.' },
  { q: 'Q11 · J’ai 3 U, 4 UM, 8 d, 5 D et 7 CM. Je suis…', o: ['704 053,8', '754 003,8', '4 753,8', '754 783,5'], r: '704 053,8', why: 'CM 7, DM 0, UM 4, C 0, D 5, U 3, d 8 → 704 053,8.' },
];
// Document 8 · 2024 · Question 13 (texte et image)
const OFF2024 = [
  // Écrire
  { q: 'Écrire Q1 · « Le scénariste et la réalisatrice travaillent ensemble le scénario de leur film. … y détaillent chaque scène. »', o: ['Ils', 'Elles', 'Il', 'Lui'], r: 'Ils', why: 'Un homme + une femme = Ils (le masculin l’emporte).' },
  { q: 'Écrire Q1 · « L’écriture prend du temps. … peut même évoluer durant le tournage. »', o: ['Elle', 'Il', 'Lui', 'Elles'], r: 'Elle', why: '« L’écriture » est un nom féminin singulier → Elle.' },
  { q: 'Écrire Q1 · « Avant d’écrire l’histoire d’un film, le scénariste se documente. … regarde des films et des vidéos. »', o: ['Il', 'Lui', 'Ils', 'Je'], r: 'Il', why: '« Le scénariste » = masculin singulier, sujet du verbe → Il.' },
  { q: 'Écrire Q2 · « Le comédien bavard parle à sa merveilleuse assistante. » → La … ', o: ['La comédienne bavarde parle à son merveilleux assistant.', 'La comédienne bavard parle à son merveilleuse assistant.', 'La comédiene bavarde parle à sa merveilleux assistant.'], r: 'La comédienne bavarde parle à son merveilleux assistant.', why: 'On change le genre des deux personnes : comédien → comédienne, bavard → bavarde, sa merveilleuse assistante → son merveilleux assistant.' },
  { q: 'Écrire Q3 · J’ (être) … aux commandes du film. (passé composé)', s: 'ai été', why: 'Être au passé composé : j’ai été.' },
  { q: 'Écrire Q3 · Quand le clap (résonner) … (passé composé)', s: 'a résonné', why: 'Résonner → avoir + participe passé : il a résonné.' },
  { q: 'Écrire Q3 · … l’acteur (entrer) … (passé composé)', s: 'est entré', why: 'Entrer se conjugue avec être : il est entré.' },
  { q: 'Écrire Q4 · « Comment est né le cinéma … » Quelle ponctuation ?', o: ['?', '.', '!'], r: '?', why: '« Comment… » pose une question : point d’interrogation.' },
  { q: 'Écrire Q5 · La maquilleu…e crée des masques', o: ['s', 'ss'], r: 's', why: 'Entre deux voyelles, un seul s fait le son [z] : maquilleuse.' },
  { q: 'Écrire Q5 · … des masques qui vieilli…ent', o: ['ss', 's'], r: 'ss', why: 'Pour faire le son [s] entre deux voyelles, on double le s : vieillissent.' },
  // Lire · Sam se fait son cinéma
  { q: 'Lire Q1 · Le personnage principal de « Sam se fait son cinéma » s’appelle…', o: ['Samantha (Sam)', 'Madame Tongue', 'Monsieur Florent', 'Sam Bond le directeur'], r: 'Samantha (Sam)', why: 'L’histoire suit Samantha, que l’on appelle Sam.' },
  { q: 'Lire Q2 · « Madame Tongue semble tout-à-fait désensorcelée ! » « désensorcelée » veut dire que…', o: ['c’est le contraire d’ensorcelée', 'c’est ensorcelé au féminin', 'des sorcières sont partout', 'plusieurs sorcières se réunissent'], r: 'c’est le contraire d’ensorcelée', why: 'Le préfixe « dés- » veut dire le contraire.' },
  { q: 'Lire Q2 · « Un malfaiteur ? Un génie du mal ? » « un malfaiteur », c’est…', o: ['quelqu’un qui fait du mal', 'quelqu’un qui fait mal la fête', 'une chose mal faite', 'quelqu’un qui fait bien les choses'], r: 'quelqu’un qui fait du mal', why: 'mal + faiteur (celui qui fait) : celui qui fait le mal.' },
  { q: 'Lire Q5 · « Vite, elle sort son yoyo magique pour l’empêcher de nuire. Elle le lance et gagné ! » « le » remplace…', o: ['son yoyo', 'Samantha', 'monsieur Florent', 'madame Tongue'], r: 'son yoyo', why: 'Ce qu’on lance, c’est le yoyo.' },
  { q: 'Lire Q5 · « Madame Tongue rejoint sa classe et la laisse seule sur une chaise. » « la » remplace…', o: ['Samantha', 'madame Tongue', 'son yoyo', 'monsieur Florent'], r: 'Samantha', why: 'Madame Tongue laisse Samantha seule : « la » = Samantha.' },
  { q: 'Lire Q6 · « Tu n’as même pas fini de copier les exercices ! » Quel est le nom au pluriel ?', o: ['exercices', 'copier', 'même', 'fini'], r: 'exercices', why: '« les exercices » : déterminant pluriel « les » et le nom finit par -s.' },
  { q: 'Lire Q7 · « Elle sort alors son arme secrète… » « sort » est un verbe. Quel autre mot est aussi un verbe ?', o: ['vise', 'étrange', 'secrète', 'monde'], r: 'vise', why: '« Elle vise » : on peut le conjuguer, c’est un verbe.' },
  { q: 'Lire Q7 · « secrète » et « étrange » sont des…', o: ['adjectifs', 'verbes', 'noms', 'déterminants'], r: 'adjectifs', why: 'Ils disent comment est le nom : une arme secrète, un individu étrange.' },
  // Lire · Les coulisses du cinéma
  { q: 'Lire Q9 · « Les coulisses du cinéma » : quelle est l’intention du texte ?', o: ['Informer', 'Convaincre', 'Donner du plaisir', 'Enjoindre'], r: 'Informer', why: 'Le texte explique comment on fabrique un film : il informe.' },
  { q: 'Lire Q10 · « … où des rêves deviennent réalité » : deviennent est à l’indicatif…', o: ['présent', 'futur simple', 'passé composé', 'imparfait'], r: 'présent', why: 'Cela se passe maintenant ; terminaison -ent du présent.' },
  { q: 'Lire Q10 · « La prochaine fois que tu regarderas un film » : regarderas est à l’indicatif…', o: ['futur simple', 'présent', 'imparfait', 'passé composé'], r: 'futur simple', why: '« La prochaine fois » + terminaison -ras (infinitif + as) : futur simple.' },
  { q: 'Lire Q11 · Carte mentale : bande sonore, effets spéciaux, la première… Quel moment clé du film ?', o: ['La postproduction', 'Le casting', 'Le scénario', 'Le public'], r: 'La postproduction', why: 'Après le tournage : le son, les effets spéciaux, puis la première projection.' },
  // Lire · Question 13 (texte et image)
  { q: 'Lire Q13 · « Les spectateurs croyaient que le train allait sortir de l’écran » : où se trouve cette information ?', o: ['Seulement dans le texte', 'Seulement dans l’image', 'Dans l’image et dans le texte'], r: 'Seulement dans le texte', why: 'L’image ne montre pas les spectateurs : c’est écrit dans le texte.' },
  { q: 'Lire Q13 · « L’arrivée d’un train en gare » : où se trouve cette information ?', o: ['Dans l’image et dans le texte', 'Seulement dans le texte', 'Seulement dans l’image'], r: 'Dans l’image et dans le texte', why: 'On voit le train en gare et le titre du film le dit.' },
  { q: 'Lire Q13 · Quelle stratégie as-tu utilisée ?', o: ['J’ai relié le texte et les illustrations.', 'J’ai résumé le texte.', 'J’ai lu entre les lignes.'], r: 'J’ai relié le texte et les illustrations.', why: 'On compare ce que dit le texte et ce que montre l’image.' },
];
// entraînement 2024 : mêmes compétences, nouvelles phrases
const GEN24 = [
  () => pick([
    { q: 'La boulangère et son apprenti préparent le pain. … travaillent très tôt.', o: ['Ils', 'Elles', 'Il', 'Lui'], r: 'Ils', why: 'Une femme + un homme → Ils.' },
    { q: 'Les actrices répètent la scène. … connaissent leur texte par cœur.', o: ['Elles', 'Ils', 'Elle', 'Lui'], r: 'Elles', why: 'Que des femmes au pluriel → Elles.' },
    { q: 'La caméra est prête. … filme la première scène.', o: ['Elle', 'Il', 'Lui', 'Elles'], r: 'Elle', why: '« La caméra » est féminin singulier → Elle.' },
    { q: 'Le metteur en scène crie « Action ! ». … dirige les acteurs.', o: ['Il', 'Lui', 'Ils', 'Elle'], r: 'Il', why: 'Masculin singulier sujet → Il.' },
    { q: 'Le décor et le costume sont terminés. … sont magnifiques.', o: ['Ils', 'Il', 'Elles', 'Lui'], r: 'Ils', why: 'Deux noms masculins → Ils.' },
  ]),
  () => pick([
    { q: 'Mets au féminin : « Le chanteur joyeux salue son petit voisin. »', o: ['La chanteuse joyeuse salue sa petite voisine.', 'La chanteuse joyeux salue son petite voisine.', 'La chanteure joyeuse salue sa petit voisine.'], r: 'La chanteuse joyeuse salue sa petite voisine.', why: 'chanteur → chanteuse, joyeux → joyeuse, son petit voisin → sa petite voisine.' },
    { q: 'Inverse le genre : « L’acteur sportif parle à sa gentille maquilleuse. »', o: ['L’actrice sportive parle à son gentil maquilleur.', 'L’acteure sportif parle à son gentille maquilleur.', 'L’actrice sportif parle à sa gentil maquilleur.'], r: 'L’actrice sportive parle à son gentil maquilleur.', why: 'acteur → actrice, sportif → sportive, sa gentille maquilleuse → son gentil maquilleur.' },
    { q: 'Inverse le genre : « La directrice sérieuse écoute son nouvel élève. »', o: ['Le directeur sérieux écoute sa nouvelle élève.', 'Le directeur sérieuse écoute son nouvelle élève.', 'Le directrice sérieux écoute sa nouvel élève.'], r: 'Le directeur sérieux écoute sa nouvelle élève.', why: 'directrice → directeur, sérieuse → sérieux, nouvel → nouvelle.' },
  ]),
  () => pick([
    { q: 'Passé composé : Nous (filmer) … la scène.', s: 'avons filmé', why: 'avoir + filmé : nous avons filmé.' }, { q: 'Passé composé : Elle (arriver) … en retard.', s: 'est arrivée', why: 'Arriver se conjugue avec être ; on accorde avec « elle » : arrivée.' },
    { q: 'Passé composé : Tu (avoir) … de la chance.', s: 'as eu', why: 'Avoir au passé composé : tu as eu.' }, { q: 'Passé composé : Ils (partir) … à l’heure.', s: 'sont partis', why: 'Partir + être ; accord au masculin pluriel : partis.' },
    { q: 'Passé composé : J’ (finir) … mon dessin.', s: 'ai fini', why: 'avoir + fini.' }, { q: 'Passé composé : Le public (applaudir) …', s: 'a applaudi', why: 'avoir + applaudi.' },
  ]),
  () => pick([
    { q: 'Quelle ponctuation ? « Quel film veux-tu regarder … »', o: ['?', '.', '!'], r: '?', why: 'C’est une question.' }, { q: 'Quelle ponctuation ? « Quelle belle scène … »', o: ['!', '?', '.'], r: '!', why: 'On exprime une émotion forte : point d’exclamation.' },
    { q: 'Quelle ponctuation ? « Le tournage commence à huit heures … »', o: ['.', '?', '!'], r: '.', why: 'Une phrase qui donne une information : point final.' }, { q: 'Quelle ponctuation ? « Où se trouve le studio … »', o: ['?', '!', '.'], r: '?', why: '« Où » pose une question.' },
  ]),
  () => pick([
    { q: 'Complète : une coiffeu…e', o: ['s', 'ss'], r: 's', why: 'Son [z] entre deux voyelles : un seul s.' }, { q: 'Complète : ils grandi…ent', o: ['ss', 's'], r: 'ss', why: 'Son [s] entre deux voyelles : ss (grandissent).' },
    { q: 'Complète : une cai…e', o: ['ss', 's'], r: 'ss', why: 'Son [s] entre deux voyelles : caisse.' }, { q: 'Complète : une ro…e', o: ['s', 'ss'], r: 's', why: 'Son [z] : rose.' }, { q: 'Complète : du poi…on', o: ['ss', 's'], r: 'ss', why: 'On entend [s] : poisson (le poison, c’est autre chose !).' },
  ]),
  () => pick([
    { q: '« Le petit chat noir dort. » Quelle est la classe de « noir » ?', o: ['adjectif', 'nom', 'verbe', 'déterminant'], r: 'adjectif', why: 'Il précise comment est le chat.' }, { q: '« Les enfants courent vite. » Quelle est la classe de « courent » ?', o: ['verbe', 'nom', 'adjectif', 'déterminant'], r: 'verbe', why: 'On peut le conjuguer : je cours, ils courent.' },
    { q: '« Une étrange lumière brille. » Quelle est la classe de « lumière » ?', o: ['nom', 'adjectif', 'verbe', 'pronom'], r: 'nom', why: 'On peut mettre « une » devant : une lumière.' }, { q: '« Ces actrices jouent bien. » Quelle est la classe de « ces » ?', o: ['déterminant', 'nom', 'adjectif', 'verbe'], r: 'déterminant', why: 'Il est placé devant le nom « actrices ».' },
  ]),
  () => pick([
    { q: '« Demain, nous irons au cinéma. » irons est à l’indicatif…', o: ['futur simple', 'présent', 'imparfait', 'passé composé'], r: 'futur simple', why: '« Demain » + terminaison -ons du futur (ir-ons).' }, { q: '« Autrefois, les films étaient muets. » étaient est à l’indicatif…', o: ['imparfait', 'présent', 'futur simple', 'passé composé'], r: 'imparfait', why: '« Autrefois » + terminaison -aient.' },
    { q: '« Hier, j’ai vu un dessin animé. » ai vu est à l’indicatif…', o: ['passé composé', 'imparfait', 'présent', 'futur simple'], r: 'passé composé', why: 'Auxiliaire (ai) + participe passé (vu).' }, { q: '« Maintenant, la salle se remplit. » se remplit est à l’indicatif…', o: ['présent', 'futur simple', 'imparfait', 'passé composé'], r: 'présent', why: '« Maintenant » : présent.' },
  ]),
  () => pick([
    { q: '« Hajar prend sa trousse et la range. » « la » remplace…', o: ['sa trousse', 'Hajar', 'la range'], r: 'sa trousse', why: 'Ce qu’elle range, c’est la trousse.' }, { q: '« Zakaria voit le ballon et le frappe. » « le » remplace…', o: ['le ballon', 'Zakaria', 'le but'], r: 'le ballon', why: 'Il frappe le ballon.' },
    { q: '« Papa appelle Soumaya et lui donne un livre. » « lui » remplace…', o: ['Soumaya', 'Papa', 'un livre'], r: 'Soumaya', why: 'Papa donne le livre à Soumaya.' },
  ]),
  () => pick([
    { q: '« Ce texte explique comment fonctionne un volcan. » Son intention ?', o: ['Informer', 'Convaincre', 'Donner du plaisir', 'Enjoindre'], r: 'Informer', why: 'Il explique : il informe.' }, { q: '« Achetez vite notre nouveau jeu, le meilleur de tous ! » Son intention ?', o: ['Convaincre', 'Informer', 'Donner du plaisir', 'Enjoindre'], r: 'Convaincre', why: 'Une publicité veut convaincre.' },
    { q: '« Il était une fois un dragon qui avait peur du noir… » Son intention ?', o: ['Donner du plaisir', 'Informer', 'Convaincre', 'Enjoindre'], r: 'Donner du plaisir', why: 'Un conte raconte une histoire pour le plaisir.' }, { q: '« Mélange la farine et les œufs, puis enfourne 20 minutes. » Son intention ?', o: ['Enjoindre', 'Informer', 'Convaincre', 'Donner du plaisir'], r: 'Enjoindre', why: 'Une recette donne des consignes : elle enjoint (fait faire).' },
  ]),
  () => pick([
    { q: 'Que veut dire « défaire » ?', o: ['le contraire de faire', 'faire deux fois', 'faire très bien'], r: 'le contraire de faire', why: 'Le préfixe dé- indique le contraire.' }, { q: 'Que veut dire « malheureux » ?', o: ['pas heureux', 'très heureux', 'heureux le matin'], r: 'pas heureux', why: 'mal- donne le sens contraire.' },
    { q: 'Que veut dire « refaire » ?', o: ['faire à nouveau', 'ne pas faire', 'faire vite'], r: 'faire à nouveau', why: 're- = de nouveau.' }, { q: 'Que veut dire « impossible » ?', o: ['pas possible', 'très possible', 'possible demain'], r: 'pas possible', why: 'im- = pas.' },
  ]),
];

// ---------- entraînement : même type de questions, nouveaux nombres ----------
const lettresN = (n) => { const U = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize'], D = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'septante', 'quatre-vingt', 'nonante'];
  const s100 = (x) => x < 17 ? U[x] : x < 20 ? 'dix-' + U[x - 10] : (x % 10 === 0 ? (x === 80 ? 'quatre-vingts' : D[x / 10]) : D[Math.floor(x / 10)] + (x % 10 === 1 && x !== 81 && x !== 91 ? ' et un' : '-' + U[x % 10]));
  const s1000 = (x, fin = true) => { const c = Math.floor(x / 100), r = x % 100; let s = c === 0 ? '' : c === 1 ? 'cent' : U[c] + (r === 0 && fin ? '-cents' : '-cent'); if (r) s += (s ? '-' : '') + s100(r); return s; };
  const m = Math.floor(n / 1000), r = n % 1000; return [m ? (m === 1 ? 'mille' : s1000(m, false) + '-mille') : '', r ? s1000(r) : ''].filter(Boolean).join('-') || 'zéro'; };
const GEN = [
  () => { const g = pick([10, 20, 25]), k = ri(3, 6), r = ri(1, g - 1), n = g * k + r; return { q: `Il y a ${n} billes. On les range par paquets de ${g}. Quel calcul permet de les compter ?`, o: [`${k} × ${g} + ${r}`, `${g} + ${r}`, `${k} + ${g} + ${r}`, `${k + 1} × ${g}`], r: `${k} × ${g} + ${r}`, why: `${k} paquets de ${g} = ${k * g}, plus ${r} = ${n}.` }; },
  () => { const n = ri(1, 9) * 10000 + ri(0, 9) * 1000 + pick([0, 0, ri(1, 9) * 100]) + ri(0, 9); return { q: `Écris en chiffres : ${lettresN(n)} unités.`, s: String(n), why: `${fr(n)}.` }; },
  () => { const a = ri(10, 99), d = ri(1, 9); return { q: `Écris en chiffres : ${lettresN(a)} unités ${lettresN(d)} dixième${d > 1 ? 's' : ''}.`, s: fr(a + d / 10), why: `${fr(a + d / 10)}.` }; },
  () => { const a = ri(10, 99), x = ri(1, 9), y = ri(1, 9); const A = +(a + x / 100).toFixed(2), B = +(a + y / 10).toFixed(1); const r = A < B ? '<' : A > B ? '>' : '='; return { q: `${fr(A)} … ${fr(B)}`, o: ['<', '=', '>'], r, why: 'Compare dixième par dixième, puis centième par centième.' }; },
  () => { const a = ri(10, 99), d = ri(1, 9); return { q: `${a},${d}0 … ${a},${d}`, o: ['<', '=', '>'], r: '=', why: 'Un zéro à la fin de la partie décimale ne change pas le nombre.' }; },
  () => { const T = pick([10000, 100000, 1000]), a = ri(1, 9) * T / 10 + pick([0, T / 20]); return { q: `${fr(T)} = ${fr(a)} + …`, s: String(T - a), why: `${fr(T)} − ${fr(a)} = ${fr(T - a)}.` }; },
  () => { const s = ri(3, 15), st = ri(0, 5); const seq = Array.from({ length: 6 }, (_, i) => st + i * s); return { q: `Quelle est la règle ? ${seq.join(' · ')}`, o: [`+ ${s}`, `× ${s}`, `+ ${s + 1}`, `− ${s}`], r: `+ ${s}`, why: `On ajoute ${s} à chaque fois.` }; },
  () => { const m = pick([2, 3, 4, 5]), st = pick([0.25, 0.5, 1, 2, 3]); const seq = Array.from({ length: 5 }, (_, i) => st * Math.pow(m, i)); return { q: `Quelle est la règle ? ${seq.map(fr).join(' · ')}`, o: [`× ${m}`, `+ ${fr(seq[1] - seq[0])}`, `× ${m + 1}`, `+ ${m}`], r: `× ${m}`, why: `Chaque nombre est ${m} fois plus grand.` }; },
  () => { const a = ri(1000, 9999), b = ri(1000, 4999) + ri(1, 9) / 10; return { q: `${fr(a)} + ${fr(b)} =`, s: fr(a + b), why: 'Aligne les virgules (ajoute ,0 au nombre entier).' }; },
  () => { const a = ri(2000, 9999), b = ri(100, 999) + ri(1, 9) / 10; return { q: `${fr(a)} − ${fr(b)} =`, s: fr(a - b), why: `${fr(a)},0 − ${fr(b)} = ${fr(a - b)}.` }; },
  () => { const a = ri(120, 899), b = ri(12, 49); return { q: `${a} × ${b} =`, s: String(a * b), why: `${a} × ${Math.floor(b / 10) * 10} + ${a} × ${b % 10} = ${fr(a * b)}.` }; },
  () => { const t = pick(['div', 'mul', 'sub', 'add']); const P = { div: () => { const k = ri(3, 8), e = ri(3, 9); return [`On partage ${k * e} bonbons entre ${k} enfants. Chacun reçoit ${e} bonbons.`, 'Division']; }, mul: () => { const a = ri(6, 15), b = ri(8, 14); return [`Il y a ${a} boîtes de ${b} crayons, soit ${a * b} crayons.`, 'Multiplication']; }, sub: () => { const a = ri(200, 400), b = ri(20, 80); return [`Dans le bus, il y a ${a} passagers. Il en reste ${a - b} : ${b} sont descendus.`, 'Soustraction']; }, add: () => { const a = ri(100, 300), b = ri(50, 200); return [`Soumaya a ${a} autocollants. On lui en donne ${b}. Elle en a ${a + b}.`, 'Addition']; } }[t](); return { q: `« ${P[0]} » Quelle opération ?`, o: ['Addition', 'Soustraction', 'Multiplication', 'Division'], r: P[1], why: P[1] === 'Division' ? 'Partager équitablement = diviser.' : P[1] === 'Multiplication' ? 'Des groupes égaux = multiplier.' : P[1] === 'Soustraction' ? 'Chercher ce qui part = soustraire.' : 'On réunit = additionner.' }; },
  () => { const a = ri(10, 89) + ri(1, 9) / 10, b = ri(20, 99); const s = a + b; return { q: `Calcule ${fr(a)} + ${b}, puis arrondis le résultat à l’unité.`, s: String(Math.round(s)), why: `${fr(a)} + ${b} = ${fr(s)} → arrondi : ${Math.round(s)}.` }; },
  () => { const a = pick([120, 150, 180, 240, 250]), m = pick([9, 99]); return { q: `${a} × ${m} = ${a} × ${m + 1} − … = ${fr(a * m)}`, s: String(a), why: `× ${m} = × ${m + 1} puis on enlève une fois ${a}.` }; },
  () => { const [n, d, v] = pick([[1, 4, '0,25'], [3, 4, '0,75'], [1, 2, '0,5'], [3, 2, '1,5'], [5, 2, '2,5'], [7, 10, '0,7'], [1, 5, '0,2'], [2, 5, '0,4'], [9, 10, '0,9'], [5, 4, '1,25']]); return { q: `${n}/${d} =`, s: v, why: `${n} : ${d} = ${v}.` }; },
  () => { const U = ri(1, 9), UM = ri(1, 9), d = ri(1, 9), D = ri(1, 9), CM = ri(1, 9); const v = CM * 100000 + UM * 1000 + D * 10 + U + d / 10; const w1 = CM * 100000 + UM * 10000 + D * 10 + U + d / 10, w2 = UM * 1000 + CM * 100 + D * 10 + U + d / 10, w3 = CM * 100000 + UM * 1000 + D * 100 + U * 10 + d; return { q: `J’ai ${U} U, ${UM} UM, ${d} d, ${D} D et ${CM} CM. Je suis…`, o: [fr(v), fr(w1), fr(w2), fr(w3)], r: fr(v), why: 'Place chaque chiffre dans sa colonne : les colonnes vides reçoivent un 0.' }; },
];

function quiz(body, talk, items, title, onEnd) {
  let i = 0, ok = 0;
  const top = h('p', { class: 'muted' }), head = h('p', { class: 'prompt' }), actions = h('div', { class: 'actions wrap' }), help = h('p', { class: 'muted' });
  body.replaceChildren(top, head, actions, help);
  const next = () => {
    if (i >= items.length) {
      const pc = Math.round(100 * ok / items.length); if (pc >= 80) { star(3); burst(body); }
      head.textContent = `${pc >= 80 ? '🏆' : pc >= 50 ? '💪' : '📚'} ${ok} / ${items.length}`; help.textContent = pc >= 80 ? 'Excellent ! 3 étoiles bonus.' : 'Relis les corrections et recommence : tu vas progresser !';
      actions.replaceChildren(h('button', { class: 'btn primary', type: 'button', 'data-testid': 'idq-again', onclick: () => onEnd() }, '↻ Recommencer')); talk(`${ok} sur ${items.length}.`); return;
    }
    const it = items[i]; top.textContent = `${title} · ${i + 1}/${items.length}`; head.textContent = it.q; help.textContent = '';
    const done = (good, given) => { if (good) { ok++; star(); Sfx.win(); } else Sfx.tap(); help.textContent = (good ? '✓ ' : `✗ Attendu : ${it.r || it.s}. `) + it.why; talk(good ? 'Juste !' : 'Regarde la correction.', true); i++; setTimeout(next, good ? 1600 : 3600); };
    if (it.o) actions.replaceChildren(...shuffle(it.o).map((o) => h('button', { class: 'btn', type: 'button', 'data-testid': o === it.r ? 'idq-ok' : 'idq-ko', onclick: (e) => { actions.querySelectorAll('button').forEach((b) => { b.disabled = true; }); e.currentTarget.classList.add(o === it.r ? 'ok' : 'ko'); done(o === it.r); } }, o)));
    else { const inp = h('input', { type: 'text', inputmode: 'decimal', class: 'dc-in', 'data-testid': 'idq-rep', 'aria-label': 'Réponse' }); const go = () => { if (!inp.value.trim()) return; inp.disabled = true; done(norm(inp.value) === norm(it.s)); }; inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); }); actions.replaceChildren(inp, h('button', { class: 'btn primary', type: 'button', 'data-testid': 'idq-check', onclick: go }, '✓ Vérifier')); setTimeout(() => inp.focus(), 50); }
    talk(it.q, true);
  };
  next();
}

export function open() {
  const single = typeof window !== 'undefined' && window.__ASSETS;
  const url = (f) => (single ? 'https://avenirprojets2026-bot.github.io/Soumaya-academy/sa-4fw5xaxekogy/' : '') + 'assets/docs/' + f;
  const say = h('div', { class: 'be-say cc-say', 'aria-live': 'polite' });
  const talk = (s, v = true) => { say.textContent = s; if (v) Voice.speak(s); };
  const body = h('div');
  const home = () => body.replaceChildren(
    h('div', { class: 'ch-cat' }, h('h3', null, '📅 Juin 2022 · Document 2 · Les nombres'),
      h('div', { class: 'actions wrap' }, h('button', { class: 'btn primary', type: 'button', 'data-testid': 'id22-off', onclick: () => quiz(body, talk, OFF2022, '2022 · épreuve officielle', home) }, `🏆 L’épreuve de 2022 (${OFF2022.length} questions)`),
        h('button', { class: 'btn', type: 'button', 'data-testid': 'id22-train', onclick: () => { const run = () => quiz(body, talk, shuffle(GEN).slice(0, 12).map((g) => g()), 'Entraînement · nouveaux nombres', run); run(); } }, '🔁 Entraînement : même type, nouveaux nombres'),
        h('a', { class: 'doc-link', href: url('p4_2022_doc02_nombres_ecouter.pdf'), target: '_blank', rel: 'noopener' }, '📄 Le document officiel (à imprimer)')),
      h('p', { class: 'muted' }, 'La partie « Écouter » de 2022 a besoin de l’enregistrement audio de l’école : elle est dans le document à imprimer.')),
    h('div', { class: 'ch-cat' }, h('h3', null, '📅 Juin 2024 · Document 8 · Écrire et Lire'),
      h('div', { class: 'actions wrap' }, h('button', { class: 'btn primary', type: 'button', 'data-testid': 'id24-off', onclick: () => quiz(body, talk, OFF2024, '2024 · épreuve officielle', home) }, `🏆 L’épreuve de 2024 (${OFF2024.length} questions)`),
        h('button', { class: 'btn', type: 'button', 'data-testid': 'id24-train', onclick: () => { const run = () => quiz(body, talk, shuffle(GEN24).map((g) => g()), 'Entraînement · nouvelles phrases', run); run(); } }, '🔁 Entraînement : mêmes compétences, nouvelles phrases'),
        h('a', { class: 'doc-link', href: url('p4_2024_doc08_ecrire_lire.pdf'), target: '_blank', rel: 'noopener' }, '📄 Le document officiel (8 pages, à imprimer)')),
      h('p', { class: 'muted' }, 'Les textes « Sam se fait son cinéma » et « Les coulisses du cinéma » sont dans le carnet de lecture de l’école : les questions 3, 4, 8, 11 a et 12 se font sur le document imprimé.')),
    h('p', { class: 'muted' }, 'Les documents de juin 2025 sont dans le grimoire des Grands Explorateurs (Archives du temps).'));
  UI.openDialog(h('div', { class: 'panel be-panel ws-panel ab-panel' }, UI.closeButton(), h('h2', null, '📚 Évaluations interdiocésaines P4 · 2022 et 2024'), body, say), { label: 'Évaluations interdiocésaines 2022 et 2024', onClose: () => Voice.stop() });
  home();
  talk('Choisis une année : l’épreuve officielle, ou un entraînement avec de nouveaux nombres.');
}
