# Architecture

Application web statique, JavaScript ES modules sans framework, assemblée par esbuild (un seul bundle IIFE).

```
src/index.html        coque : #stage (décor), #hud, #dialog-layer, #toast
src/css/app.css       tout le style (points chauds lumineux, panneaux, feuilles basses sur mobile)
src/js/main.js        point d'entrée : charge le contenu, démarre le jeu, enregistre le service worker
src/js/save.js        état et sauvegarde (localStorage `soumaya-academy-v2`), migration depuis v1, export/import JSON
src/js/content.js     moteur pédagogique : sélection des questions, mélange, normalisation des réponses, missions, examens
src/js/scenes.js      définition des 8 salles : image, zone de marche, points chauds, action associée
src/js/world.js       rendu 2.5D d'une salle : caméra panoramique, parallaxe, profondeur, déplacement de Mimi, particules
src/js/ui.js          panneaux (un seul ouvert à la fois), quiz, résultats, passeport, galerie, réglages
src/js/mimi.js        Mimi : sprites (pelage/nœud), lien d'amitié, humeur, voix synthétisée, phrases
src/js/rewards.js     badges (15) et pages du Grimoire (10)
src/js/game.js        orchestrateur : titre, histoire, navigation entre salles, missions, examens, explorations
content/content.json  banque de questions fusionnée (générée)
tools/                gen-math.mjs (maths à réponses calculées), merge-content.mjs (fusion + contrôles), build.mjs
tests/                content.test.mjs (contenu/moteur), e2e.mjs (parcours Playwright), smoke.mjs
```

## Principes
- **Un seul orchestrateur de panneaux** : `openDialog` ferme tout panneau ouvert avant d'en afficher un autre ; Échap ferme ; aucun empilement.
- **Un acteur par salle** : `Room` crée Mimi une fois et la détruit au changement de salle.
- **Exercices dans l'aventure** : chaque point chaud déclenche directement une mission (livre → lecture, coffre/escalier → maths, etc.). Les menus ne servent qu'au passeport, à la galerie et aux examens.
- **Contenu séparé du code** : questions en JSON, schéma contrôlé à la fusion ; les réponses de maths sont recalculées indépendamment.
- **Progression** : 3 matières × 10 niveaux ; mission de 5 questions ; ≥ 60 % réussi (1★), 80 % (2★), 100 % (3★) ; la réussite débloque le niveau suivant.
- **Hors-ligne** : service worker (`dist/`) ou fichier unique (`dist-single/`, images en data URI).
- **Rendu** : calques DOM + canvas de particules (pas de moteur 3D) pour rester fluide sur téléphone Android.

## Chaîne de build
`npm run content` (fusion) → `npm run build` (bundle, service worker, fichier unique).
