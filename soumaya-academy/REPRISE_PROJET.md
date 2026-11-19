# REPRISE_PROJET — Soumaya Academy (et Maissa Academy)

Document de reprise rédigé le 9 novembre 2026, mis à jour le 18 novembre 2026. Légende :
- **[V]** fait vérifié par une commande ou un test ;
- **[C]** information venant de la conversation (décision ou demande de Karim), non revérifiable dans le code ;
- **[?]** incertitude.

## 0. Mises à jour des 18 et 19 novembre 2026

- 19 nov. : atelier **« 🧵 Le périmètre — De omtrek »** (`src/js/omtrek.js`) : leçon + vocabulaire NL, 8 entraînements (virgules, entourer, ranger, comparer, même périmètre, tracer sur quadrillage, chemin, vrai/faux). Version française dans l'Atelier des merveilles (route `omtrek`), version **entièrement néerlandaise** dans la Maison du Néerlandais (route `nl-omtrek`). « 📏 Le contour déplié » (modèle interdiocésaine 2026, doc 12 Q5) dans `quest.js` (porte magique, route `contour-deplie`) ; figures colorées ajoutées au « Soleil du périmètre ». **Publié** (commit `94cb231`, « success ») ; sources sur `sauvegarde-source-2026-11-18` (`4c6e321`) [V].
- 2025 : aucune question de périmètre dans les interdiocésaines ; 2026 : une seule (contour déplié d'un pentagone, 15 cm d'après le dessin) [V].

- **Sources les plus récentes** : branche **`sauvegarde-source-2026-11-18`** (part de `livre-monde-2026-11-15`, qui contenait les ajouts Livre-Monde et Interdiocésaines juin 2026 faits dans une autre session) [V].
- Le conteneur de session a été remplacé : `/home/claude/work/` est recréé à partir de cette branche (`git archive … | tar -x`) puis `npm ci` [V].
- Nouvel onglet néerlandais **« 🗺️ De provincies »** (`src/js/neerlandais.js`, fonction `provincies`, carte SVG à partir de `belgique.json`, 10 provinces numérotées, noms en néerlandais, chefs-lieux en français ; 4 types de questions dont « touche le numéro sur la carte ») : **publié** le 18 nov. 2026 (commit `3b05625`, déploiement « success ») [V]. Route : `openPanel('nl-provincies')`.
- Voix flamande Bram (Higgsfield, preset 549ff70a-…) pour « Wat eten de dieren? » : essais faits le 9 nov., **non publiés et perdus** avec l'ancien conteneur ; Karim a choisi la vitesse normale. À refaire si Karim le demande (≈25 crédits, 43 phrases) [C].

---

## 1. L'application

**Soumaya Academy — La Quête des Savoirs** est un jeu éducatif web (navigateur, hors ligne après le premier chargement) qui prépare Soumaya (9 ans, P4, école El Hikma, Belgique francophone) aux évaluations interdiocésaines de fin de P4. [C]

Soumaya, dessinée, explore un château de 27 mondes ; chaque objet touché ouvre un exercice ; corrections expliquées, étoiles, pièces, badges, cinématiques, voix de Papa (clonée). [V dans le code]

**Maissa Academy** est une copie séparée pour Maissa (8 ans) et Mohamed (7 ans) : leurs prénoms et photos, École belge de Rabat, voix du papa de Maissa, anglais à la place du néerlandais. [C][V : dossier `maissa/` du site]

## 2. Où se trouve quoi

| Élément | Emplacement | Statut |
|---|---|---|
| Code source Soumaya (travail) | `/home/claude/work/soumaya-academy` (conteneur cloud de la session, **pas un dépôt git**, perdu si le conteneur est remplacé) | [V] |
| Code source Maissa (travail) | `/home/claude/work/maissa-academy` (idem) | [V] |
| **Sauvegarde des sources (la plus récente)** | dépôt GitHub `avenirprojets2026-bot/Soumaya-academy`, **branche `sauvegarde-source-2026-11-18`** (dossiers `soumaya-academy/` et `maissa-academy/`) | [V] poussée |
| Anciennes sauvegardes des sources | branches `livre-monde-2026-11-15` et `sauvegarde-source-2026-11-09` | [V] |
| Site publié (dépôt de publication) | même dépôt, branche `main`, clone local `/home/claude/soumaya-academy` | [V] |
| Point de restauration du site | branche `sauvegarde-site-2026-11-09` = commit `c80f574` de `main` | [V] |
| **Soumaya Academy en ligne** | https://avenirprojets2026-bot.github.io/Soumaya-academy/sa-4fw5xaxekogy/ | [V] déployée (commit 3b05625, run GitHub Pages « success ») |
| Maissa Academy en ligne | https://avenirprojets2026-bot.github.io/Soumaya-academy/maissa/ | [V] |
| Ancienne adresse `…/premium/` et racine `…/Soumaya-academy/` | page « Ce lien n'est plus disponible » + service worker qui vide le cache | [V] |
| Anciennes versions Replit | `SoumayaAcademyCarteCinematiqueInteractive-1zip` et `Maissa-Academy-V2` | [V] encore publiées ; Karim doit les couper lui-même (Deployments → Shut down) [C] |
| Carte d'accès dans Jarvis | artefact « J.A.R.V.I.S. 12 » (claude.ai/artifact/YRKnuRYvWnkF3ekLYkhfoS), Famille → Enfants → Scolarité et Jeux, carte « 🏰 Soumaya Academy » | [V] publiée |
| Fiches Docs | « Soumaya Academy — Table des matières et chemins » (claude.ai/artifact/4syS8rqDmqVcF1dfX5zJJj) et « Soumaya Academy — Présentation » (claude.ai/artifact/Ec61jJEZz8fHSpVDYVembG) | [V] |

**Attention [V]** : le dépôt `Soumaya-academy` est **public** ; le nom du dossier secret `sa-4fw5xaxekogy` y est visible pour qui cherche le dépôt.

## 3. Technologies et organisation du code

- JavaScript sans framework (modules ES), CSS, HTML ; build `esbuild` via `tools/build.mjs` ; serveur local `server.js` (Node, sans dépendance). [V]
- `npm run build` → `content/content.json` (fusion du contenu) + `dist/` (site PWA avec service worker) + `dist-single/` (un seul fichier HTML ~112 Mo). [V]
- Les assets (décors `.webp`, cinématiques `.webm` VP9, voix `.ogg` opus) sont dans `public/assets/`. [V]

Fichiers principaux (`src/js/`) :

| Fichier | Rôle |
|---|---|
| `main.js`, `game.js` | démarrage ; `openPanel(p)` route chaque objet vers son module (`else if (p === …)`) ; `nl-<onglet>` ouvre la Maison du Néerlandais sur cet onglet |
| `scenes.js` | scènes (décor, objets cliquables `hotspots` avec x/y, actions `panel`/`go`/`action`, cinématiques `intro`) et la Carte des mondes |
| `world.js` | déplacement, `WORLD_ORDER` (ordre « Monde suivant », finit par `examens`), voix d'arrivée |
| `content.js` + `content/content.json` | banque principale de questions |
| `save.js` | sauvegarde locale (localStorage) : étoiles, pièces, badges, `reussites` |
| `voice.js`, `sfx.js` | voix et sons |
| `examens.js` | Salle des Examens (amis, surveillante, tableau) |
| `examblanc.js` | examens blancs : évaluations décimaux CM1/CM2 (A/PA/NA), Mes réussites P1→P4, Fractions simples |
| `interdio.js` | interdiocésaines (épreuves + entraînements) |
| `cahier.js` | cahier d'exercices par matière |
| `quest.js` | Atelier des merveilles : énigmes de la porte (périmètre, aire, angles, quadrilatères) |
| `belgium.js` + `belgique.json` | grande carte de la Belgique (villes, régions et provinces, fleuves) |
| `leesbos.js` + `leesbos_data.js` | lecture néerlandaise (livres de meester Bart, vidéos YouTube intégrées) |
| `neerlandais.js`, `vlaanderen*.js` | Maison du Néerlandais (dont « Wat eten de dieren? » et « De provincies ») |
| `vivant.js` | Forêt des Mystères Vivants (régimes, chaînes, documentaire, jour/nuit, eau) |
| `papeterie.js`, `rabat.js` | mondes cachés Papeterie et El Hikma |
| `tools/build.mjs` | build ; le service worker télécharge `.js/.css/.html` avec `cache:'no-cache'` |

Table des matières complète (chaque matière, son chemin, sa position) : fiche Docs citée au §2.

## 4. Fonctionnalités opérationnelles [V]

- 27 mondes, carte, « Monde suivant », cinématiques, voix, récompenses.
- Français, maths, éveil, langues (néerlandais, anglais, Leesbos), numérique, arts.
- Salle des Examens (dernier monde) : cahier, tableau des évaluations, interdiocésaines, examens blancs, fractions simples.
- Grimoire des interdiocésaines dans les Archives.
- Forêt vivante : onglet « 📖 Leçon + autres régimes » — **publié**.
- Périmètre : Carte des mondes → Atelier des merveilles → « Les énigmes de la porte » (☀️ Le soleil du périmètre) ; aussi dans la Papeterie et les examens blancs.
- Maison du Néerlandais : « Wat eten de dieren? » et « De provincies » — **publiés**.

## 5. Choix validés à préserver [C]

- Tout en **français** ; réponses concises.
- Soumaya **dessinée** partout (pas de 3D) ; elle saute de joie plutôt que faire coucou ; dit « Waouh, c'est trop beau » en arrivant.
- Chat **Muezza** (jamais « Mimi ») ; **aucune voix de chat**.
- Voix de **Papa** clonée (version v5) ; alterner « Soumaya », « ma chérie »… Voix guides : Gommette = preset Zoe, Bellarej = preset Luna (Higgsfield).
- Qualité « premium » des décors ; les voix ne se chevauchent pas (attente de la voix d'arrivée).
- Amis de Soumaya dans la Salle des Examens : Ihsane, Sayaline, Sakaïna, Zayd, Ismaël, Souhaib, Souhayb, Naïla, Kamilia, Assia, Aya, Layan, Bilal, Maïssa.
- **Droits d'auteur** : on ne publie pas les fiches d'éditeurs (Averbode, Pass-Education, Magnard, ACCÈS, MDI…) ; on recrée les exercices avec de nouveaux nombres ; pas d'extraction de l'audio YouTube (vidéos intégrées). Les documents interdiocésains officiels, eux, sont publiés tels quels.
- Néerlandais : provinces en néerlandais, chefs-lieux en français ; prononciation flamande (vlaams) souhaitée ; voix Bram à vitesse normale.
- Appareils : Samsung Galaxy Z Fold (Samsung Internet / Chrome), PC, tablette.

## 6. Contraintes et état en cours

- **Pas de dépense** (crédits Higgsfield, Replit…) sans estimation et accord.
- **Pas de publication** sans accord explicite (« Publie ») ; montrer des maquettes avant.
- Ne jamais supprimer les voix enregistrées ; garder une sauvegarde de l'ancienne version.
- Maissa Academy n'a pas reçu les derniers ajouts de Soumaya (examens blancs, fractions, régimes, provinces) [V].

## 7. Services externes (aucun secret ici)

- **GitHub** : dépôt `avenirprojets2026-bot/Soumaya-academy`, GitHub Pages depuis `main`. Les jetons d'accès sont fournis par l'environnement de session ; ne jamais les recopier.
- **Higgsfield / Lovable MCP** : images (gpt_image), vidéos (kling), voix (seed_audio, voix clonées de Papa et des guides ; preset flamand Bram).
- **Replit** : anciennes versions encore publiées (§2).
- **Cloudflare** (prévu, non fait) : protection par e-mail (Cloudflare Pages + Access). En attente : Karim doit créer le compte et fournir un jeton API + Account ID. Adresses à autoriser proposées : avenir.projets2026@gmail.com et soumaya.bochouari@gmail.com (Soumaya) ; avenir.projets2026@gmail.com (Maissa, + papa de Maissa si Karim le souhaite).

## 8. Vérifications réellement faites

- 18 nov. 2026 : build OK, `node tests/content.test.mjs` → 24/24 ; parcours Playwright de « De provincies » (paysage et téléphone, 10/10, sans erreur JavaScript) ; déploiement 3b05625 « success » [V].
- 9 nov. 2026 : générateurs examens blancs (50 000 tirages) et fractions (54 000 tirages), 0 erreur ; parcours examens blancs, fractions, régimes, Wat eten de dieren? sans erreur [V].
- Les tags git sont refusés par le proxy de la session (HTTP 403) : la sauvegarde passe par des branches.
- **Non vérifié** : rendu sur le vrai Galaxy Z Fold ; écoute des voix (impossible pour Claude) ; affichage du site en ligne depuis le conteneur (inaccessible).

## 9. Prochaines actions (par priorité)

1. Protection par e-mail (Cloudflare) dès que Karim fournit le jeton et l'Account ID.
2. Couper les deux anciennes versions Replit (action de Karim).
3. Si Karim le demande : voix flamande Bram pour « Wat eten de dieren? » (≈25 crédits) et éventuellement pour « De provincies ».
4. Si Karim le demande : reporter les ajouts récents dans Maissa Academy.
5. Offres en suspens, à ne lancer que sur demande : refaire 3 images de la Papeterie (≈6 crédits), vrai décor de forêt pour le Leesbos (≈30–40 crédits), minutage de la vidéo « Kies maar iets », audio « Écouter » 2022.

## 10. Démarrer, tester, publier, restaurer

```bash
# Récupérer les sources sauvegardées (nouvelle session)
git clone -b sauvegarde-source-2026-11-18 https://github.com/avenirprojets2026-bot/Soumaya-academy src-backup
cd src-backup/soumaya-academy && npm ci             # esbuild
npm run build                                       # → dist/ et dist-single/
node tests/content.test.mjs                         # 24/24 attendu
node server.js                                      # http://localhost:3000

# Publier Soumaya (seulement avec l'accord de Karim)
git clone https://github.com/avenirprojets2026-bot/Soumaya-academy pub && cd pub
rm -rf sa-4fw5xaxekogy/* && cp -r <sources>/dist/* sa-4fw5xaxekogy/
git add -A && git commit -m "…" && git push      # puis suivre le run GitHub Pages
# Après publication : pousser aussi les sources modifiées sur une branche sauvegarde-source-<date>
# Maissa : même chose avec maissa-academy/dist/* → maissa/

# Restaurer le site à l'état sauvegardé
git fetch origin sauvegarde-site-2026-11-09 && git checkout origin/sauvegarde-site-2026-11-09 -- sa-4fw5xaxekogy maissa && git commit -m "Restauration" && git push
```

Après chaque modification, vérifier : build, `content.test`, ouverture du panneau concerné (`window.__game.openPanel('<route>')` dans Playwright), absence d'erreur console.
