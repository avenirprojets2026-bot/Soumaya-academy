# Notes de moisson (harvest)

Sources lues en lecture seule : /home/claude/work/harvest/scripts (151 scripts NNN_*.js et L00 à L13) ; PDF 2025 : seulement listé (pdf2025_inventaire.md). Scripts d'extraction : /home/claude/work/tools/harvest/ (`node build.js` régénère harvest.json, duplicates.json, issues.json). Les littéraux de données sont évalués via `vm` ; aucun code DOM n'est exécuté.

## Règle de niveau (1 à 10)
1 = très facile début de P4, 10 = difficile fin de P4 / début de P5. Niveau de base selon l'étiquette source : Facile 3, Moyen 5, Difficile 7 ; Explorateur 3-4, Aventurier 5-6, Expert 8 ; séries A/B ajustées ; livres P5 : 9 ; L01 selon le thème. Ajustements : tables ≤ 12 donnent ≤ 3 ; décimaux donnent ≥ 6 (≥ 5 en grandeurs) ; nombres ≥ 10 000 donnent ≥ 6 ; problèmes à au moins 3 nombres donnent ≥ 5. Résultat : aucun item aux niveaux 1 et 10 (estimation prudente, à recalibrer sur données d'élèves).

## Extensions du schéma
- domain « citoyennete » (éducation à la philosophie et à la citoyenneté).
- Passages possibles hors français (maths, éveil).
- Champs optionnels : flag, note, dupGroup (quasi-doublons non fusionnés), visual (horloge), unit.
- openTasks : champs optionnels passage, expected, note, flag. explorations : kinds exploration, actualite, carte_des_12_explorations, nouveau_monde (leurs questions sont référencées par id).

## Déduplication
Clé = énoncé normalisé (minuscules, sans accents, ponctuation ni espaces) plus ensemble de choix ; énoncés reformulés des examens reliés par altPrompts. Conservée : l'occurrence à la meilleure explication. 17 items fusionnés, journalisés dans duplicates.json. Même énoncé et même réponse avec distracteurs différents : non fusionnés, marqués dupGroup.

## Normalisation des réponses saisies (recommandation pour le moteur)
NFC, minuscules, trim, espaces multiples réduits, ponctuation finale retirée, virgule = point décimal, espaces des milliers retirés ; ne pas ignorer les accents en orthographe. accepted[0] est la forme canonique.

## Vérifications exécutées
- Maths (367 questions) : recalcul de l'énoncé en Node pour 142 ; 227 par valeur finale de l'explication ; 265 par l'un ou l'autre ; environ 100 non parsables (dénombrement, définitions, comparaisons) relues à la main. Chaînes « a op b = c » des explications : 205 vérifiées, une incohérence détectée et traitée (h0718, corrigée, voir issues.json).
- Français (196) et éveil (197) : relecture personnelle intégrale ; aucune erreur pédagogique trouvée ; reclassements de domaine uniquement (conjugaison, grammaire). Limite : je suis un relecteur automatique, une relecture humaine par un enseignant reste recommandée.
- Structure : index de réponse valide, une seule bonne réponse et pas de choix équivalents (contrôle automatique des doublons et équivalents numériques), accepted non vide pour les saisies.
- Toute correction est tracée dans issues.json (corrigé:true) ; tout doute porte flag « à_vérifier ».

## Non converti ou limité
- Narrations audio (004, 007), guides (088, 112, 142), art, PDF 020 : pas de question extractible.
- Activités interactives (glisser-déposer, miroir, cartes à toucher) : converties en tâche libre ou ignorées ; hotspots de 069 non repris.
- Textes absents des scripts : passages de h0483 et h0484, récit de h0424 (ordre reconstitué) ; la question 11 de la Série 1 d’examen était incomplète dans la source (non convertie, mention ici seulement).
- Classement par positions : la bonne réponse est souvent en première place (voir inventory.md) ; mélanger à l'affichage.
- Faits d'actualité datés (Artemis II, news L12/024) : à revérifier avant publication.
