# Brief : exercices inspirés des évaluations interdiocésaines P4 de juin 2025

Contexte : « Maissa Academy » est un jeu éducatif (HTML) pour Maissa, élève de 4e primaire (P4) en Belgique francophone, qui prépare l'évaluation interdiocésaine de fin de P4. Son papa a fourni les PDF officiels de juin 2025. On veut (1) un relevé de ce que chaque document évalue, (2) des exercices ORIGINAUX inspirés de ces questions (même compétence, même format quand c'est possible, mais d'autres nombres, d'autres prénoms, d'autres contextes, d'autres textes : ne jamais recopier une question ni un texte du PDF).

## Où sont les PDF
Dossier : /mnt/user-data/attachments/53fcc39f-49fc-5303-baa9-92dfd9863ff3/
Lis-les avec l'outil Read (paramètre pages, ex. "1-4"), ou `pdftotext fichier.pdf -` en complément. Les images des PDF (frises, cartes, schémas) se voient avec Read.

## Ce que tu livres (pour chacun de tes documents)
1. Un relevé en markdown : /home/claude/work/soumaya-academy/content-src/i2025/inventaire-<cle>.md
   Tableau : question | points | compétence affichée | ce qui est évalué (résumé, pas recopié) | format | exercice(s) du jeu créé(s) (ids) ou « non transposable, pourquoi ».
2. Un fichier JSON : /home/claude/work/soumaya-academy/content-src/i2025/<cle>.json au format :
   { "questions": [...], "passages": [...], "openTasks": [...] }

Clés de documents (champ exam2025) : doc01 (Formation historique), doc02 (Sciences), doc03 (Écouter), doc04 (EPC), doc05 (Organisation des données / statistique), doc06 (Écrire, parler), doc07 (Géométrie, sciences), doc08 (Lire, grandeurs), doc09 (fichier P41B3C1.PDF : Écrire, statistique, formation économique et sociale), doc10 (Arithmétique / algèbre), doc11 (ECA, formation géographique, grandeurs), fmttn (Formation manuelle, technique, technologique et numérique, avec son correctif), religion.

### Question QCM
{"id":"i25-doc05-01","subject":"maths","domain":"statistique","level":6,"type":"qcm","prompt":"…","choices":["…","…","…"],"answer":1,"explanation":"…","hint":"…","passage":null,"source":"inspire_2025","exam2025":"doc05"}
### Question à saisir
{"id":"i25-doc10-03","subject":"maths","domain":"operations","level":6,"type":"saisie","prompt":"…","accepted":["forme canonique","variantes acceptées"],"explanation":"…","hint":"","passage":null,"source":"inspire_2025","exam2025":"doc10"}
### Texte (lecture ou écoute)
{"id":"i25-p-doc08-a","title":"…","text":"…","subject":"francais","domain":"lecture","level":6,"source":"inspire_2025","exam2025":"doc08"}  (pour l'écoute : domain "ecoute" et ajoute "mode":"audio" ; le jeu lit le texte à voix haute)
Les questions liées à un texte ont "passage":"i25-p-doc08-a" (au moins 3 questions par texte).
### Production libre (écrire, parler, dessiner : non corrigée par l'ordinateur)
{"id":"i25-o-doc06-1","subject":"francais","domain":"expression","level":6,"prompt":"…","rubric":["…","…"],"exam2025":"doc06"}

subject : francais | maths | eveil.
domain autorisés — francais : conjugaison, ecoute, expression, grammaire, lecture, orthographe, vocabulaire ; maths : fractions, geometrie, grandeurs, logique, numeration, operations, problemes, statistique ; eveil : citoyennete, geographie, histoire, sciences, religion, numerique, artistique, economie.
level : 1 à 10 (le niveau de l'évaluation de juin P4 correspond à 5-7 ; mets quelques 4 pour s'échauffer et quelques 8).

## Règles de qualité
- Français de Belgique, adapté à une enfant de 9-10 ans, phrases courtes, vouvoiement interdit (tutoiement). Euros, unités du système métrique. Pas de « septante/nonante » obligatoire mais acceptes-les comme réponses saisies quand un nombre s'écrit en lettres.
- Une seule bonne réponse, des distracteurs plausibles (erreurs typiques), 3 ou 4 choix. Ne place pas toujours la bonne réponse au même rang.
- Saisie : accepted[0] = forme canonique ; ajoute les variantes raisonnables (avec/sans unité, « 1 250 » et « 1250 », « 3,5 » et « 3.5 »). Le jeu ignore majuscules, accents, espaces des milliers et ponctuation finale.
- Explication courte qui montre la méthode (calcul posé, règle).
- Les questions qui reposent sur une image : décris la situation en mots dans l'énoncé (ex. « Sur une frise, … »), ou transforme-la en production libre ; si ce n'est pas faisable, note-le dans le relevé.
- Maths : vérifie CHAQUE calcul en exécutant node (ex. `node -e "console.log(37*12)"`). Aucune erreur tolérée.
- Vise 12 à 20 questions par document (davantage pour les gros documents à plusieurs parties), plus 1 à 3 productions libres si le document a des questions d'écriture ou d'expression orale.
- Religion : reste factuel et respectueux (« Dans la Bible, … », « Les chrétiens … »), sans demander d'adhésion personnelle.
- Ne touche à AUCUN autre fichier du projet. Ne lance ni build ni tests du jeu.

## Contrôle
Avant de rendre : `cd /home/claude/work/soumaya-academy && node tools/check-2025.mjs content-src/i2025/<cle>.json` doit afficher OK. Corrige jusqu'à OK.

## Ton rapport final (court)
Par document : nombre de questions/textes/productions, ce qui n'a pas pu être transposé, et tout doute.
