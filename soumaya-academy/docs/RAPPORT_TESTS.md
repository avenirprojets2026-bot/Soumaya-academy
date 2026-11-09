# Rapport de tests

Tous les résultats ci-dessous proviennent d'exécutions réelles (Chromium headless via Playwright, rendu logiciel sans GPU). Résultats bruts : `reports/e2e-full.txt`, `reports/content-last.txt`, captures dans `reports/shots/`.

**Non exécuté :** aucun test sur un vrai appareil Android / Samsung Internet ; aucun test avec lecteur d'écran ; la synthèse vocale n'est pas testée automatiquement.

## Contenu et moteur pédagogique — `npm run test:content` : 24/24
Identifiants uniques, niveaux 1–10 valides, QCM (réponse dans les choix, choix distincts, 2 à 5 choix), saisies avec réponses acceptées, explication partout, passages existants, aucune question signalée, maths : réponse = recalcul indépendant (397 vérifiées, 0 écart), mélange des choix, normalisation des saisies (casse, accents, espaces, virgule décimale), couverture ≥ 15 questions par matière et niveau, missions de 5 questions constructibles partout, missions de lecture, 12 examens blancs de 10 questions, progression (étoiles, déblocage, niveau 10), export/import JSON.

Volumes (questions par niveau 1→10, ligne = matière) :
```
maths    31 44 155 141 120 89 60 68 55 51
francais 35 40 99 108 71 45 36 45 43 35
eveil    22 22 57 162 41 23 22 23 22 22
```

## Parcours utilisateur — `npm run test:e2e` : 100/100 (20 tests × 5 formats, dont le bouton Quitter, Mimi, la voix et les sons)
Formats : téléphone portrait 390×844, téléphone paysage 844×390, pliable ouvert 720×840, tablette 1024×768, PC 1280×720 (tactile émulé pour les 4 premiers).

Chaque format exécute : 01 lancement sans erreur ; 02 bouton Jouer → histoire → grande salle ; 03 carte des mondes et salles ; 04 interaction décor → exercice → réponses → résultat ; 05 récompenses (badge, pièces, galerie) ; 06 niveau suivant puis échec sans blocage ; 07 sauvegarde/restauration après rechargement ; 08 retour à l'accueil ; 09 examen blanc complet (10 questions, correction) ; 10 atelier d'écriture ; 10b lecture (texte + questions) ; 10c missions français, éveil et maths dans chaque salle ; 10d exploration complète ; 10e bouton Quitter (mission et examen, Non puis Oui) ; 10f Mimi (câlin, sommeil/réveil, croquette, nœud, pelage, bulle après réponse, absence de texte « null ») ; 11 aucune erreur JavaScript/réseau sur tout le parcours ; 12 performance.
Contrôles transversaux répétés : un seul panneau ouvert, un seul personnage, pas de défilement parasite de la page.

Images/s mesurées (animation en cours, rendu logiciel) : portrait 60, paysage 60, pliable 59, tablette 54, PC 43. Seuil du test : 20.

## Défauts trouvés puis corrigés pendant la validation
- Mimi se déplaçait à peine (unités du vecteur) ; carte rognée en paysage ; indicateurs de bord dupliqués ou superposés ; étiquettes coupées au bord ; examen « mixte » de 11 questions ; chute à 17 i/s sur PC (fusions de calques supprimées).
- Trois tests (04–06 sur tablette) ont échoué une fois de façon aléatoire pendant la mise au point (délai) puis sont repassés sans modification du jeu : une instabilité de timing du test est possible et n'est pas exclue.

## Relecture du contenu rédigé
605 questions de français et d'éveil rédigées pour combler les niveaux vides ont été relues par un second passage automatisé indépendant (1 énoncé corrigé). Ce n'est pas une relecture par un enseignant.

## Correctif « bouton Quitter » (signalé par l'utilisateur)
Cause probable : le bouton utilisait la boîte `confirm()` du navigateur, que Samsung Internet et les applications installées peuvent bloquer ou ignorer, et qu'aucun test n'exerçait. Remplacé par une confirmation intégrée (Oui / Non) pour Quitter et pour « Tout effacer ». Test 10e ajouté (mission et examen). Je n'ai pas pu reproduire le défaut sur un vrai Samsung : la cause est une hypothèse, la correction est vérifiée sur Chromium uniquement.

## Développement de Mimi
Mimi est un petit chat noir (sprites recolorés), avec 5 nœuds, un lien d'amitié (6 niveaux), un coin dans la grande salle, des câlins, des croquettes (10 pièces), un sommeil après inactivité, des réactions aux réponses, 3 nouveaux badges. Le test 10f vérifie ces comportements sur Chromium. Il a aussi révélé et fait corriger une erreur JavaScript (variable utilisée avant sa définition dans la marche de Mimi) et un défaut plus ancien : le mot « null » s'affichait dans le retour des questions. Non vérifié : le rendu sonore (miaulement/ronronnement) et la vibration, qui ne sont pas testables ici.

## Voix de synthèse (signalée par l'utilisateur)
Changement : sélection automatique de la meilleure voix française de l'appareil (voix « naturelles », Google, féminines, Belgique/France en priorité ; voix robotiques écartées), texte préparé pour la parole (×, =, %, €, unités, émojis), découpage en phrases (coupures sur Android), vitesse réglable, liste des voix et bouton « Tester la voix » dans les réglages, avec la marche à suivre pour installer une voix Google de meilleure qualité sur Android. Vérifié : la préparation du texte (tests de contenu) et l'ouverture des réglages/test sans erreur (Chromium sans voix réelle). **Non vérifié : la qualité sonore réelle sur un Samsung** : elle dépend des voix installées sur l'appareil, et je ne peux pas l'écouter ici. Une voix vraiment naturelle exigerait des enregistrements ou une synthèse neuronale pré-générée, non réalisables depuis cet environnement.

## Fluidité
La fluidité sur PC avait chuté dans l'environnement de test (rendu logiciel) : particules allégées (canvas basse résolution, halo pré-dessiné), rayons de lumière sans animation lourde. Mesures : portrait/paysage/pliable ≥ 56 i/s, tablette et PC ≈ 37 i/s dans cet environnement sans carte graphique.


## Soumaya à l'écran et nouveaux décors (V2)
- 16 poses de Soumaya (planche de référence validée, `tools/prep-soumaya.py` : recadrage, échelle commune, ancrage sur les pieds, WebP) ; marche en 4 images ; Mimi la suit.
- 9 salles redessinées dans un style homogène (hall, galerie royale ajoutée, bibliothèque, salle des nombres, forêt, atelier, archives, observatoire) ; zones interactives repositionnées.
- Tests : contenu 24/24 ; parcours 95/95 (19 × 5 formats), **exécutés un format à la fois**. Lancés tous ensemble dans un seul processus, des échecs de délai apparaissent sur le conteneur de test (2 CPU, rendu logiciel), sans erreur JavaScript ; ce sont des dépassements de délai, pas des défauts fonctionnels constatés. Le test 10f supposait une question à choix ; il gère maintenant les questions à saisie libre.
- Images/s mesurées (rendu logiciel, donc pessimistes) : téléphone portrait 61, paysage 60, pliant 53, tablette 41, bureau 38.
- Contrôle visuel par captures d'écran de toutes les salles sur téléphone paysage et ordinateur ; hall, bibliothèque et salle des nombres aussi en portrait.
- **Non testé** : appareil Samsung réel, performances sur un téléphone d'entrée de gamme (les décors font désormais ~330 Ko chacun, le fichier HTML unique pèse 5,5 Mo).

## Correctif « fichier unique » (signalé par l'utilisateur)
- Défaut : dans `Soumaya_Academy.html`, Soumaya (cadre vide) et Mimi (pattes seules) n'apparaissaient pas, car les images à chemin composé n'étaient pas intégrées ; mes tests tournaient sur la version dossier, pas sur le fichier unique.
- Correction : table `window.__ASSETS` générée au build + `src/js/asset.js`. Nouveau test `npm run test:single` : ouvre le fichier en `file://`, vérifie dans 8 salles (téléphone portrait et ordinateur) que décor, Soumaya et Mimi sont réellement chargés, ainsi que la marche, sans erreur ni requête échouée : OK. Le fichier pèse maintenant 7,4 Mo.

## Sons, carte, portraits, interface (V3)
- Sons synthétisés (`src/js/sfx.js`) : réussite, erreur, victoire, pièces, pas, amitié avec Mimi, musique d'ambiance douce (tonalité par salle) ; interrupteurs « Sons » et « Musique » dans les réglages ; test 10h. **La qualité sonore n'a pas pu être écoutée par l'auteur du code** : à juger sur l'appareil.
- Nouvelle carte des mondes (illustration originale), zones repositionnées ; sur écran étroit, carte agrandie et déplaçable au doigt.
- Portraits (titre, histoire, avatar) refaits d'après le Soumaya du jeu ; champ de réponse à saisie : le bouton « Valider » ne déborde plus.
- Images préchargées conservées (plus de requête annulée signalée par le test 11).
- Exécution finale, **un format à la fois** : 20/20 sur chacun des 5 formats ; contenu 24/24 ; fichier unique (`npm run test:single`) OK. Lancés en parallèle ou à plusieurs séries simultanées, des dépassements de délai apparaissent sur la machine de test (2 CPU, rendu logiciel) sans être reproductibles isolément : ce sont des artefacts de charge, pas de défauts constatés.
- Images/s (rendu logiciel, pessimistes) : portrait 56, paysage 57, pliant 58, tablette 40, bureau 33.


## V4 — voix du papa, nouvelles poses, finitions
Voix : 33 clips (Opus mono, ~416 Ko) générés avec la voix clonée de l'utilisateur (moteur ElevenLabs via Higgsfield, enregistrement de référence nettoyé), intégrés hors ligne et déclenchés par les événements du jeu (bonne/mauvaise réponse, mission, badge, examen, salles, bienvenue). Nouvelles poses : Soumaya « salut » à l'entrée des salles ; Mimi noir dort/assis/toilette. Finitions d'interface. Vérifié par tests automatiques (contenu 24/24, fichier unique, parcours 5 formats). **Non vérifié : l'écoute réelle des voix et le rendu sur un vrai Samsung Fold.**

## V5 — Voix 5, phrases variées, actions 2,5D
Voix : 94 clips avec la « Voix 5 » (clone ElevenLabs + chaîne de filtres maximale) ; l'appellation « Soumaya » revient souvent, avec « ma chérie », « mon trésor », « ma puce », etc. Nouveaux déclencheurs : séries de 3/5/8/12 bonnes réponses, début de mission, pause/quitter, câlin à Mimi, inactivité (max 2 par session). Actions : escaliers (4 salles), tabouret, chaudron (5 nouvelles poses + moteur d'animation `doAction`), vérifiées par captures d'écran automatiques ; mouvement réduit = pose fixe. **Non vérifié : écoute réelle, vrai Samsung Fold.**


## V6 — Soumaya en vraie 3D
Modèle riggé + 10 animations (hero3d.js, assets/models/soumaya.glb 3,5 Mo), rendu vérifié par captures (escalier du hall, tabouret, chaudron) en version serveur et fichier unique (h3 actif). Tests : contenu 24/24, fichier unique OK, e2e 100/100 (poses dessinées, ?h3=0, car la 3D logicielle est trop lente pour ce banc d’essai ; 3D vérifiée par captures).

## V7 — Scènes 3D (8 salles)
stage3d.js : décor peint projeté sur géométrie, Soumaya et trajets 3D (escalier central du hall, colimaçon, échelle, tabouret). Vérifié par captures. Les 100 tests de parcours tournent avec ?h3=0 (poses dessinées) car le rendu logiciel de l'environnement de test est trop lent pour la 3D.
