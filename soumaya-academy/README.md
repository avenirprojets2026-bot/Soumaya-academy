# Soumaya Academy — jeu d’aventure éducatif 2.5D (P4)

Soumaya et son petit chat Mimi explorent un château magique : chaque salle cache des objets qui brillent, chaque objet déclenche une mission pédagogique (français, mathématiques, éveil), et chaque réussite rallume une page du Grimoire des Savoirs.

## Lancer le jeu

| Besoin | Comment |
|---|---|
| **Le plus simple (téléphone, tablette, PC)** | Ouvrir `dist-single/Soumaya_Academy.html` dans Chrome ou Samsung Internet. Un seul fichier, hors ligne. |
| **Version installable (PWA, hors ligne)** | Héberger le dossier `dist/` sur un serveur HTTPS (Replit, Netlify…). Menu du navigateur → « Ajouter à l’écran d’accueil ». |
| **Replit** | Importer ce dossier. Le bouton *Run* lance `node server.js` (aucune dépendance). |
| **En local** | `node server.js` puis ouvrir http://localhost:3000 |

> Sur Android, la version `dist/` servie en HTTP(S) est préférable : le service worker met tout en cache. Le fichier unique fonctionne aussi, mais sans mise en cache automatique.

## Reconstruire et tester

```bash
npm install            # esbuild uniquement
npm run build          # fusionne le contenu + construit dist/ et dist-single/
npm run test:content   # contrôles du contenu et du moteur pédagogique
npm run test:e2e       # parcours utilisateur (Playwright, 5 formats d'écran)
```

Les tests de parcours nécessitent Playwright + Chromium (`npm i -D playwright`, ou `PW_MODULES=<dossier node_modules>`).

## Contenu : comment l’enrichir

`content-src/` contient les sources : `harvest.json` (exercices repris de la V162), `generated-maths.json` (généré par `tools/gen-math.mjs`, réponses calculées), `authored/` (rédigé). `tools/merge-content.mjs` dédoublonne, contrôle le schéma et écrit `content/content.json`, embarqué dans l’application.

Schéma d’une question : `id, subject (francais|maths|eveil), domain, level (1-10), type (qcm|saisie), prompt, choices[], answer, accepted[], explanation, hint, passage`.

## Documentation

- `docs/ARCHITECTURE.md` — organisation du code.
- `docs/RAPPORT_TESTS.md` — tests exécutés et résultats.
- `docs/LIMITATIONS.md` — ce qui n’est pas terminé, honnêtement.
- `docs/AUDIT_V162.md` — audit de la version de départ.
