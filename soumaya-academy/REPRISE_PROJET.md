# REPRISE_PROJET — Soumaya Academy (et Maissa Academy)

Document de reprise rédigé le 9 novembre 2026, en fin de conversation. Légende :
- **[V]** fait vérifié par une commande ou un test dans cette conversation ;
- **[C]** information venant de la conversation (décision ou demande de Karim), non revérifiable dans le code ;
- **[?]** incertitude.

---

## 1. L'application

**Soumaya Academy — La Quête des Savoirs** est un jeu éducatif web (navigateur, hors ligne après le premier chargement) qui prépare Soumaya (9 ans, P4, école El Hikma, Belgique francophone) aux évaluations interdiocésaines de fin de P4. [C]

Soumaya, dessinée, explore un château de 27 mondes ; chaque objet touché ouvre un exercice ; corrections expliquées, étoiles, pièces, badges, cinématiques, voix de Papa (clonée). [V dans le code]

**Maissa Academy** est une copie séparée pour Maissa (8 ans) et Mohamed (7 ans) : leurs prénoms et photos, École belge de Rabat, voix du papa de Maissa, anglais à la place du néerlandais. [C][V : dossier `maissa/` du site]

## 2. Où se trouve quoi

| Élément | Emplacement | Statut |
|---|---|---|
| Code source Soumaya (travail) | `/home/claude/work/soumaya-academy` (conteneur cloud de la session, **pas un dépôt git**) | [V] contient aussi une modification non publiée (voir §6) |
| Code source Maissa (travail) | `/home/claude/work/maissa-academy` (idem) | [V] |
| **Sauvegarde des sources** | dépôt GitHub `avenirprojets2026-bot/Soumaya-academy`, **branche `sauvegarde-source-2026-11-09`** (dossiers `soumaya-academy/` et `maissa-academy/`, sans `node_modules`, `dist`, `dist-single`, `backups`, `reports`) | voir §10 pour la preuve |
| Site publié (dépôt de publication) | même dépôt, branche `main`, clone local `/home/claude/soumaya-academy` | [V] |
| Point de restauration du site | tag git `sauvegarde-2026-11-09` sur le commit `c80f574` de `main` | voir §10 |
| **Soumaya Academy en ligne** | https://avenirprojets2026-bot.github.io/Soumaya-academy/sa-4fw5xaxekogy/ | [V] déployée (commit c80f574, run GitHub Pages « success ») |
| Maissa Academy en ligne | https://avenirprojets2026-bot.github.io/Soumaya-academy/maissa/ | [V] |
| Ancienne adresse `…/premium/` et racine `…/Soumaya-academy/` | page « Ce lien n'est plus disponible » + service worker qui vide le cache | [V] |
| Anciennes versions Replit | `SoumayaAcademyCarteCinematiqueInteractive-1zip` (soumaya-academy-carte-cinematique-interactive-1-zip.replit.app) et `Maissa-Academy-V2` (maissa-academy-v-2.replit.app) | [V] encore publiées ; Karim doit les couper lui-même (Deployments → Shut down) [C] |
| Carte d'accès dans Jarvis | artefact « J.A.R.V.I.S. 12 » (claude.ai/artifact/YRKnuRYvWnkF3ekLYkhfoS), Famille → Enfants → Scolarité et Jeux, carte « 🏰 Soumaya Academy » visible seulement pour Soumaya | [V] publiée (version 1794220232-9f86 ; version précédente 1792981315-b2e7 dans l'historique) |
| Fiches Docs | « Soumaya Academy — Table des matières et chemins » (claude.ai/artifact/4syS8rqDmqVcF1dfX5zJJj) et « Soumaya Academy — Présentation » (claude.ai/artifact/Ec61jJEZz8fHSpVDYVembG) | [V] |

**Attention [V]** : le dépôt `Soumaya-academy` est **public** ; le nom du dossier secret `sa-4fw5xaxekogy` y est visible pour qui cherche le dépôt.

## 3. Technologies et organisation du code

- JavaScript sans framework (modules ES), CSS, HTML ; build `esbuild` via `tools/build.mjs` ; serveur local `server.js` (Node, sans dépendance). [V]
- `npm run build` → `content/content.json` (fusion du contenu) + `dist/` (site PWA avec service worker) + `dist-single/` (un seul fichier HTML ~112 Mo). [V]
- Les assets (décors `.webp`, cinématiques `.webm` VP9, voix `.ogg` opus) sont dans `public/assets/`. [V]

Fichiers principaux (`src/js/`, 78 fichiers) :

| Fichier | Rôle |
|---|---|
| `main.js`, `game.js` | démarrage ; `openPanel(p)` route chaque objet vers son module (`else if (p === …)`) |
| `scenes.js` | scènes (décor, objets cliquables `hotspots` avec x/y, actions `panel`/`go`/`action`, cinématiques `intro`) et la Carte des mondes |
| `world.js` | déplacement, `WORLD_ORDER` (ordre « Monde suivant », finit par `examens`), voix d'arrivée |
| `content.js` + `content/content.json` | banque principale (≈2 109 questions, dont 322 inspirées des interdiocésaines 2025) |
| `save.js` | sauvegarde locale (localStorage) : étoiles, pièces, badges, `reussites` |
| `voice.js`, `sfx.js` | voix et sons |
| `examens.js` | Salle des Examens (amis, surveillante, tableau) |
| `examblanc.js` | examens blancs : évaluations décimaux CM1/CM2 (A/PA/NA), Mes réussites P1→P4, Fractions simples (leçon, 5 entraînements, test) |
| `interdio.js` | interdiocésaines 2022 et 2024 (épreuves + entraînements) |
| `cahier.js` | cahier d'exercices par matière |
| `abaque.js`, `grandeurs.js`, `decimals.js`, `infinitif.js` | maths et français spécifiques |
| `leesbos.js` + `leesbos_data.js` | lecture néerlandaise (5 livres de meester Bart, vidéos YouTube intégrées) |
| `neerlandais.js`, `vlaanderen*.js` | Maison du Néerlandais |
| `vivant.js` | Forêt des Mystères Vivants (régimes, chaînes, documentaire, jour/nuit, eau) |
| `papeterie.js`, `rabat.js` | mondes cachés Papeterie et El Hikma |
| `tools/build.mjs` | build ; le service worker télécharge `.js/.css/.html` avec `cache:'no-cache'` |

Table des matières complète (chaque matière, son chemin, sa position) : fiche Docs citée au §2.

## 4. Fonctionnalités opérationnelles [V : tests du §8]

- 27 mondes, carte, « Monde suivant », cinématiques, voix, récompenses.
- Français, maths, éveil, langues (néerlandais, anglais, Leesbos), numérique, arts.
- Salle des Examens (dernier monde) : cahier, tableau des évaluations, interdiocésaines 2022/2024, examens blancs, fractions simples.
- Grimoire des interdiocésaines 2025 dans les Archives (parchemin puis horloge sur 9 h).
- Forêt vivante : onglet « 📖 Leçon + autres régimes » (granivore, frugivore, nectarivore, folivore, insectivore, piscivore ; 6 types d'exercices) — **publié**.

## 5. Choix validés à préserver [C]

- Tout en **français** ; réponses concises.
- Soumaya **dessinée** partout (pas de 3D) ; elle saute de joie plutôt que faire coucou ; dit « Waouh, c'est trop beau » en arrivant.
- Chat **Muezza** (jamais « Mimi ») ; **aucune voix de chat**.
- Voix de **Papa** clonée (version v5) ; alterner « Soumaya », « ma chérie »… Voix guides : Gommette = preset Zoe, Bellarej = preset Luna (Higgsfield).
- Qualité « premium » des décors ; les voix ne se chevauchent pas (attente de la voix d'arrivée).
- Amis de Soumaya dans la Salle des Examens : Ihsane, Sayaline, Sakaïna, Zayd, Ismaël, Souhaib, Souhayb, Naïla, Kamilia, Assia, Aya, Layan, Bilal, Maïssa.
- **Droits d'auteur** : on ne publie pas les fiches d'éditeurs (Averbode, Pass-Education, Magnard, ACCÈS, MDI…) ; on recrée les exercices avec de nouveaux nombres ; pas d'extraction de l'audio YouTube (vidéos intégrées). Les documents interdiocésains officiels, eux, sont publiés tels quels.
- Appareils : Samsung Galaxy Z Fold (Samsung Internet / Chrome), PC, tablette.

## 6. Contraintes et état en cours

- **Pas de dépense** (crédits Higgsfield, Replit…) sans estimation et accord.
- **Pas de publication** sans accord explicite (« Publie ») ; montrer des maquettes avant.
- Ne jamais supprimer les voix enregistrées ; garder une sauvegarde de l'ancienne version.
- **Modification construite mais NON publiée** [V] : onglet néerlandais **« 🦊 Wat eten de dieren? »** dans `src/js/neerlandais.js` (leçon nl/fr avec 🔊, 10 questions de 6 types). Elle est dans le dossier de travail et dans `dist/` local, pas dans le site en ligne. Maquettes montrées ; **Karim n'a pas encore validé la publication**.
- Maissa Academy n'a pas reçu les derniers ajouts de Soumaya (examens blancs, fractions, régimes) [V : pas de commit maissa depuis b125b64].

## 7. Services externes (aucun secret ici)

- **GitHub** : dépôt `avenirprojets2026-bot/Soumaya-academy`, GitHub Pages depuis `main`. Les jetons d'accès sont fournis par l'environnement de session ; ne jamais les recopier.
- **Higgsfield / Lovable MCP** : images (gpt_image), vidéos (kling), voix (seed_audio, voix clonées de Papa et des guides).
- **Replit** : anciennes versions encore publiées (§2).
- **Cloudflare** (prévu, non fait) : protection par e-mail (Cloudflare Pages + Access). En attente : Karim doit créer le compte et fournir un jeton API + Account ID. Adresses à autoriser proposées : avenir.projets2026@gmail.com et soumaya.bochouari@gmail.com (Soumaya) ; avenir.projets2026@gmail.com (Maissa, + papa de Maissa si Karim le souhaite).

## 8. Vérifications réellement faites (9 nov. 2026)

- `node tests/content.test.mjs` → 24/24 [V] ; `SOFTGL=1 node tests/e2e.mjs desktop` → 21/21 [V, avant les derniers ajouts examens blancs/fractions].
- Générateurs examens blancs : 50 000 tirages, 0 erreur ; fractions : 54 000 tirages, 0 erreur [V].
- Parcours Playwright : examens blancs, fractions, régimes, Wat eten de dieren? — sans erreur JavaScript [V].
- Déploiements GitHub Pages c80f574, 48745db, 5a64fc4 : « success » [V].
- **Non vérifié** : rendu sur le vrai Galaxy Z Fold ; écoute des voix (impossible pour Claude) ; affichage du site en ligne depuis le conteneur (inaccessible).

## 9. Prochaines actions (par priorité)

1. Faire valider puis publier « Wat eten de dieren? » (Maison du Néerlandais).
2. Protection par e-mail (Cloudflare) dès que Karim fournit le jeton et l'Account ID.
3. Couper les deux anciennes versions Replit (action de Karim).
4. Si Karim le demande : reporter les ajouts récents dans Maissa Academy.
5. Offres en suspens, à ne lancer que sur demande : refaire 3 images de la Papeterie (≈6 crédits), vrai décor de forêt pour le Leesbos (≈30–40 crédits), minutage de la vidéo « Kies maar iets », audio « Écouter » 2022.

## 10. Démarrer, tester, publier, restaurer

```bash
# Récupérer les sources sauvegardées (nouvelle session)
git clone -b sauvegarde-source-2026-11-09 https://github.com/avenirprojets2026-bot/Soumaya-academy src-backup
cd src-backup/soumaya-academy && npm install        # esbuild
npm run build                                       # → dist/ et dist-single/
node tests/content.test.mjs                         # 24/24 attendu
node server.js                                      # http://localhost:3000

# Publier Soumaya (seulement avec l'accord de Karim)
git clone https://github.com/avenirprojets2026-bot/Soumaya-academy pub && cd pub
rm -rf sa-4fw5xaxekogy/* && cp -r <sources>/dist/* sa-4fw5xaxekogy/
git add -A && git commit -m "…" && git push      # puis suivre le run GitHub Pages
# Maissa : même chose avec maissa-academy/dist/* → maissa/

# Restaurer le site à l'état sauvegardé
git checkout sauvegarde-2026-11-09 -- sa-4fw5xaxekogy maissa && git commit -m "Restauration" && git push
```

Après chaque modification, vérifier : build, `content.test`, ouverture du panneau concerné (`window.__game.openPanel('<route>')` dans Playwright), absence d'erreur console.
