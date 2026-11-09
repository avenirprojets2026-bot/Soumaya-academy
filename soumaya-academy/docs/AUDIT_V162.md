# Audit de la version de départ (Phase A)

## Fichiers reçus
| Fichier | Contenu constaté |
|---|---|
| `Soumaya_Academy_FINAL_Corrigee_Teste-2.html` (14,97 Mo) | « version réparée V162 » : 5 428 lignes, **151 scripts**, **150 feuilles de style**, ~1,27 Mo de JavaScript, ~278 Ko de CSS, 42 images embarquées (décors, 5 poses de Mimi, vignettes), le jeu historique complet (731 Ko) encodé en base64 dans la page, et le PDF officiel interdiocésain P4 de juin 2025 (Document 1). |
| `…Premium_Visuelle_Stable.zip` | La même V162 + **une couche de patch supplémentaire** (95 lignes, `saPremiumArtV1` : en-tête dessiné en SVG). Ce n’est donc pas une version « meilleure » : c’est la V162 avec un empilement de plus. |
| `…Scene_Premium_Jouable.zip` | Prototype d’une scène : 6 portails, **une seule question par portail**, mascotte en emoji, et un bouton qui ouvre le jeu historique dans une iframe. Son LISEZ_MOI le dit lui-même : « pas un jeu 3D final ». |
| `attachment.txt` | Cahier des charges de la mission. |

**Projet Replit :** non fourni (ni lien, ni archive). Je n’ai donc pas pu le sauvegarder ni créer de branche dessus. Les fichiers ci-dessus (copiés intacts dans `backup/`) ont servi de base de référence ; la refonte vit dans un dossier séparé.

## Constats
1. **Architecture non maintenable** : chaque correctif graphique ou fonctionnel est une couche `<script id="saNN…">` / `<style>` qui en surcharge d’autres (ex. 6 contrôleurs de carte successifs, 14 réécritures de la navigation). Les règles CSS se combattent à coups de `!important`.
2. **Cause des symptômes décrits** (boutons morts, menus superposés, personnage dupliqué, écrans non fermables, exercices qui n’avancent plus) : plusieurs scripts ajoutent chacun leur propre panneau, leurs propres écouteurs et leur propre copie de Mimi au même endroit, sans orchestrateur commun.
3. **Contenu pédagogique dispersé et dupliqué** : ~25 scripts portent des banques de questions de formats différents ; « le pluriel de cheval » apparaît dans au moins 6 endroits. Après extraction : 760 questions uniques utiles (17 doublons fusionnés), 39 textes, 43 consignes libres, 12 explorations, 6 histoires.
4. **Couverture inégale** : presque tout est aux niveaux 3 à 5 (≈ 650 questions sur 760). Niveaux 1, 2 et 6 à 10 quasi vides en français et en éveil ; histoire/géographie absentes au-delà du niveau 5.
5. **Illustrations** : de vraies images de qualité (décors, Soumaya, Mimi) mais mélangées à des maquettes d’interface cuites dans l’image (boutons, textes), et plusieurs images avec bandes noires ou pictogrammes de visionneuse. **Soumaya n’existe qu’en illustrations fixes ; seule Mimi possède de vraies sprites** (5 poses détourées).
6. **PDF interdiocésain 2025** : présent et lisible. Ses questions sont à réponses écrites/dessinées ; 3 des 10 sous-questions seulement ont un équivalent partiel dans les exercices. Voir `content-src/pdf2025_inventaire.md`.
7. **Cohérence narrative** : Mimi est tantôt un chat, tantôt une chouette selon les textes. Corrigé en « petit chat » dans la nouvelle base.

## Décision d’architecture
Reconstruction propre plutôt que fusion des scripts : une application modulaire (sauvegarde, moteur pédagogique, rendu des salles, interface, récompenses), un seul orchestrateur de panneaux (jamais deux ouverts), un seul acteur par salle, et une base de contenu unique. Rien n’est supprimé : les contenus sont repris, dédoublonnés et vérifiés ; l’ancienne progression (`soumaya-academy-v1`) est migrée (pièces, étoiles).
