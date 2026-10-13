# SOUMAYA ACADEMY — La Quête des Savoirs (v0.1)

## Lancer
```bash
npm install
npm run dev        # http://localhost:5173 (accessible sur le réseau local, ex. depuis le téléphone)
npm test           # 17 tests du moteur pédagogique
npm run build && npm run preview
```
## Déployer
`npm run build` produit `dist/` (site statique) : Netlify, Vercel, Cloudflare Pages, GitHub Pages.
`npx vite build -c vite.single.config.ts` produit un fichier HTML unique (`dist-single/`).

## Architecture
- `src/engine/` moteur pédagogique (sans React) : générateurs d'exercices, correction, maîtrise, répétition espacée, niveaux, sons.
- `src/store/` sauvegarde locale versionnée (localStorage) et progression/récompenses.
- `src/ui/` écrans, personnages SVG, scènes, lecteur de niveau, espace parent.

## Fait
Monde 3 « Vallée des Grandeurs » : 8 niveaux (conversions, horloge SVG, durées, fractions, aires, monnaie, boss).
Accueil animé, 6 héros SVG + tenues + accessoires débloqués par étoiles, Mimi, carte des 6 mondes,
Royaume des Nombres (10 niveaux, 5 types de scène, boss), indices progressifs, révision du jour,
mode examen (aucune aide, correction à la fin), évaluation blanche Nombres, badges, espace parent protégé par code
(compétences, historique, export JSON, impression), voix du navigateur (fr-FR), sons synthétisés, mode réduit d'animations.

## Pas encore fait (honnêtement)
- Mondes 2 à 5 (Mots, Grandeurs, Formes, Découvertes) : seulement annoncés sur la carte.
- Pipeline d'importation des PDF interdiocésains (extraction, validation adulte, banque tracée) : non développé.
  Les PDF fournis ont servi à cibler les compétences ; aucune question officielle n'est reproduite.
- Phaser / Three.js / Supabase : non utilisés (scènes en React + Framer Motion + SVG, sauvegarde locale).
- Mimi : indices écrits et lecture vocale ; pas de dialogue IA libre ni reconnaissance vocale.
- Assets : décors et personnages SVG originaux, mais certains éléments (drapeau, dragon, gobelin, icônes de mondes) sont encore des émojis à remplacer par des illustrations.
- Musique : mélodie douce synthétisée, pas de composition. Pas de service worker (PWA complète à ajouter).
- Pas de test sur appareil réel (Samsung Internet) ; testé sous Chromium bureau et mobile émulé.
- Conformité RGPD à vérifier avant mise en ligne (aucune donnée n'est envoyée, tout reste sur l'appareil).

## Séries d'examens et épreuves officielles (Château des Examens)

- `tools/import_series.py <dossier_pdf> <public_out> <json_out>` : découpe les 5 séries « Examen complet » en une image par question et associe le corrigé du guide parent (175 questions, statut `a_valider`).
- `tools/import_official.py` : importe les documents officiels juin 2025 (Docs 1, 2, 4, 5, 6, 8, 10) page par page (39 pages). Aucun corrigé officiel n'est fourni et aucun n'est inventé : la correction est faite par un adulte.
- Les données sont dans `public/bank/` (`bank.json`, `official.json`, images). Chaque entrée garde source, page et statut de validation.
- Dans l'app : Château → choisir le mode (examen / entraînement) → série, partie ou document → répondre/noter → « Remettre et corriger » → l'adulte choisit les points → résultat enregistré (tableau de bord parent).
- Limites : extraction automatique à vérifier par un adulte ; les parties audio/vidéo des épreuves officielles nécessitent un adulte (fichiers non fournis) ; importation de nouveaux PDF uniquement en ligne de commande ; documents officiels sous droits : usage privé familial, ne pas publier.
- Réglage « Niveaux libres » (par défaut activé) : tous les niveaux des mondes sont ouverts.

## Monde 2 — La Forêt des Mots (français)

9 niveaux (m1–m9, boss « Gardien des Mots ») et 6 compétences : homophones (a/à, et/est, on/ont, son/sont), pluriel des noms, accord verbe/adjectif, conjugaison au présent, nature des mots, synonymes/contraires. Exercices générés, tous à choix multiples, avec indices progressifs et explication. Tests : `npm test` (réponse unique et choix distincts vérifiés sur des centaines de tirages).
Limite honnête : ces contenus sont écrits d'après le programme général de P4, pas extraits de tes documents interdiocésains. Ils sont étiquetés « Programme P4 (à valider) » : un adulte doit les relire.

## Monde 4 — Le Temple des Formes (géométrie)

8 niveaux (f1–f8, boss « Gardien des Formes »), 6 compétences : polygones (dessinés), angles (dessinés), quadrilatères (parallèles/perpendiculaires), périmètre, solides (faces/arêtes/sommets), axes de symétrie. Même limite que le monde des Mots : contenu écrit d'après le programme général, étiqueté « Programme P4 (à valider) ».

## Monde 5 — La Planète des Découvertes (histoire, sciences, EPC, statistique)

7 niveaux (d1–d7, boss « Gardien des Découvertes »), 6 compétences inspirées des thèmes de tes documents officiels de juin 2025 : frise du temps et siècles (Doc 1), mouvements de la Terre et décalage horaire Bruxelles–Québec (Doc 2), règle de vie ou loi (Doc 4), diagramme à bandes et sondage (Doc 5). Les exercices sont générés par le jeu (pas copiés des épreuves) et étiquetés « contenu généré (à valider) ». Les exercices de type « écrire / parler » (Doc 6) et les parties audio/vidéo restent hors jeu.

## Hors connexion, illustrations, import de PDF

- **Hors connexion** : `public/sw.js` (service worker) met le jeu en cache après le premier chargement ; Réglages → « Préparer le hors connexion » précharge les 214 pages de séries/épreuves. Testé en coupant le réseau (navigateur de test). Nécessite un hébergement HTTPS (ou `localhost`) qui sert le jeu depuis son propre site ; dans un aperçu intégré/sandboxé, le navigateur peut refuser le service worker (le jeu fonctionne alors normalement, mais seulement en ligne).
- **Illustrations** : `src/ui/Icons.tsx` (SVG originaux : drapeau, adversaires et gardiens par monde, pièce, étoile, icônes de mondes et de badges). Plus aucun emoji d'illustration.
- **Import de PDF** (Espace parent → « Importer un document PDF ») : lecture dans le navigateur avec pdf.js 3.11.174 (chargé depuis cdnjs, connexion nécessaire pour importer ; héberger les deux fichiers soi-même et définir `window.__PDFJS_BASE__` pour un usage 100 % local). Chaque page devient une image + son texte ; stockage dans IndexedDB sur l'appareil, rien n'est envoyé. Traçabilité : fichier source, date, nombre de pages, version, statut « à valider » → « validé » (l'enfant ne voit que les documents validés). Un corrigé importé est lié à son épreuve et affiché à l'adulte pendant la correction. Limites : 60 pages / 40 Mo par fichier ; pas de découpage automatique par question (une page = un élément) ; les points se saisissent à la main ; les scans sans texte s'affichent mais n'ont pas de texte extrait.

## Hébergement

Version en ligne : GitHub Pages du dépôt `avenirprojets2026-bot/Soumaya-academy` (branche `main`, racine). Le site est public mais non indexé (`noindex`, `robots.txt`) ; il contient les 5 séries et, à la demande de l'enseignant, les documents officiels de juin 2025. Ne pas partager le lien publiquement. Pour retirer les documents officiels : supprimer `bank/off25/` et `bank/official.json` du dépôt (le jeu s'adapte).

## Corrigés proposés — juin 2025
Les 39 pages officielles ont un corrigé **proposé** (champ `corrige` de `public/bank/official.json`, `corrigeStatut: "proposition"`), rédigé par Claude à la demande de l’enseignant à partir des pages numérisées. Ce ne sont pas des corrigés officiels : 101 réponses sûres, 35 libres (critères d’acceptation), 19 dépendant d’un document non fourni (textes de lecture, dictée, cahier de documents), 13 à vérifier. Les marques ⚠ et ✎ sont affichées dans le jeu. À valider par l’enseignant ; modifier le JSON pour corriger.

## Reconstruire depuis ce dépôt
Le code source est dans le dossier `source/`. Le site publié (à la racine du dépôt) est le résultat de `npm install && npx vite build` (dossier `dist/`), copié à la racine avec `.nojekyll`, `robots.txt` et la balise `noindex` dans `index.html`.
