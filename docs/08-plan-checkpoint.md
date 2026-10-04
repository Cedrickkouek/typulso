# Checkpoint 1 — plan de livraison et preuves

> **Échéance annoncée : lundi 5 octobre 2026, avant 23 h 55 — America/Toronto.**  
> Source : capture 5, message du 28 septembre 2026.  
> Plan préparé le 1er octobre 2026 · Statut : préparation documentaire

Le premier checkpoint ne se limite pas à une page d'accueil et une authentification. La grille exige aussi une **salle créée et rejointe par code, avec mises à jour en temps réel**, ainsi qu'une base de données fonctionnelle en production. Le moteur complet de frappe reste un jalon ultérieur.

## Grille officielle et preuves à constituer

| Critère de la grille | Points | Preuve concrète attendue | État au stade de préparation |
|---|---:|---|---|
| Cahier des charges | 20 | [Cahier consolidé](01-cahier-des-charges.md), besoins numérotés, hypothèses et points ouverts | Document préparé; validation complète de l'utilisateur à faire |
| Démarche créative et direction artistique : nom, logo, moodboard, palette, typographies | 20 | [Dossier de DA](03-direction-artistique.md), assets et démarche de conception honnêtement attribuée; résultat visible dans l'application | Proposition préparée; adoption humaine et intégration dans l'application à vérifier |
| Architecture : modèle de données, machine à états, ADR temps réel | 20 | [Architecture](05-architecture.md), [modèle](06-modele-donnees.md), [états](07-machines-etats.md) et [ADR](adr/0001-temps-reel.md) concordant avec le code | Documents de conception; conformité du code non vérifiée |
| Déploiement fonctionnel en production : HTTPS, authentification, base de données | 20 | URL publique HTTPS; connexion réussie; donnée persistée dans PostgreSQL et relue après une nouvelle session | Implémentation et production non vérifiées |
| Salle créée et rejointe par code, mise à jour en temps réel | 10 | Démonstration avec deux sessions distinctes : création, code, arrivée, réglage propagé, départ visible sans rechargement | Implémentation et production non vérifiées |
| Intégration continue, langue et thème, qualité initiale du code, matrice des exigences | 10 | Exécution CI consultable; sélecteurs langue/thème; code contrôlé; [matrice](02-matrice-exigences.md) actualisée | Matrice préparée; CI et comportement de l'application non vérifiés |
| **Total** | **100** | Les preuves documentaires et fonctionnelles couvrent des critères différents | Aucun score de réussite revendiqué |

## Trois états à distinguer

| État | Signification | Exemple |
|---|---|---|
| **Préparé** | Besoin, maquette ou procédure rédigés; décision proposée ou à valider | ADR rédigé, palette définie, scénario de test prévu |
| **Implémenté et vérifié** | Code présent et contrôle concluant dans un environnement identifié | Deux navigateurs locaux reçoivent le même changement de salle |
| **Déployé et vérifié** | Même comportement contrôlé sur l'URL publique avec services de production | Connexion et salon fonctionnent sur HTTPS avec PostgreSQL de production |

Un document rédigé n'est pas une implémentation; une capture de maquette n'est pas une preuve de production. À chaque preuve, noter la date, le commit, l'environnement, le résultat et les limites observées. Ne pas compter une case vide ou un test planifié comme réussi.

## Ordre de travail proposé

Ces jalons constituent une proposition de planification, pas un historique de travaux déjà accomplis.

| Date cible locale | Jalon | Résultat nécessaire pour passer au suivant |
|---|---|---|
| **1er octobre** | Cadrage et conception | Exigences consolidées; proposition de nom/logo et DA reviewable; schéma et cycle de salle; choix technique du temps réel; décisions ouvertes clairement indiquées |
| **2 octobre** | Fondation technique | Projet Next.js/React en TypeScript; Tailwind; configuration PostgreSQL; première authentification; secrets hors Git; migrations reproductibles |
| **3 octobre** | Salon partagé | Création autorisée seulement aux comptes; code de salle; rejoindre par compte ou invité; identité des membres; serveur autoritaire; propagation des présences et réglages |
| **4 octobre** | Production et contrôles | HTTPS; authentification et persistance vérifiées en production; démonstration du salon entre deux sessions; CI; écrans de CP1 FR/EN et clair/sombre |
| **5 octobre, avant 23 h 55** | Revue et dossier de remise | Liens réels, installation reproductible, preuves datées, matrice mise à jour, limites connues et documents cohérents avec le commit livré |

Si le salon temps réel manque, CP1 n'est pas entièrement couvert même si le site est en ligne. La priorité d'implémentation doit donc rester la chaîne **authentification → PostgreSQL → création/rejoindre → propagation temps réel → HTTPS vérifié**.

## Démonstration minimale du salon

1. Dans la session A, un compte se connecte et crée une salle semi-publique.
2. A reçoit un code lisible. La session B entre le code avec un compte ou un pseudonyme invité.
3. Les deux sessions voient le même identifiant de salle et la présence des membres sans recharger la page.
4. A modifie un réglage : B reçoit la nouvelle valeur et ne peut pas la modifier lui-même, y compris en envoyant directement une requête interdite.
5. B quitte ou perd brièvement sa connexion. La présence est mise à jour et une reprise identifiée restaure sa place selon la politique retenue.
6. Le serveur refuse un invité qui tente de créer une salle et un code inexistant ou invalide; l'interface affiche une erreur utile.
7. Refaire la chaîne sur l'URL HTTPS de production, avec des sessions indépendantes; vérifier la persistance des données qui doivent survivre à une nouvelle connexion.

La reconnexion détaillée et le transfert d'hôte font partie du produit final. Une première politique cohérente doit être documentée pour CP1; leur couverture complète n'est pas explicitement demandée par la ligne de grille du salon.

## Contrôles avant remise

- Le dépôt contient la documentation et les assets utiles, avec des liens relatifs fonctionnels; aucun secret n'est commis.
- Une installation neuve suit le README et trouve les variables d'environnement documentées sans leurs valeurs privées.
- La CI exécute les vérifications appropriées au code existant. Au minimum, les règles de permissions et le scénario à deux sessions ont une preuve concluante.
- La page de connexion, la création de salle et le salon sont utilisables en français et en anglais, en clair et en sombre selon la portée proposée de CP1.
- L'authentification et PostgreSQL sont contrôlés en production; la présence d'un écran de connexion ou d'une variable de base de données ne suffit pas.
- Les bugs et limites connus restent visibles; les exigences non implémentées ne sont pas cochées.
- UX-03 reste honnêtement documenté : les propositions assistées et la contribution humaine ne sont pas confondues.

## Pièce de remise à préparer une fois les liens disponibles

La capture 5 demande un fichier qui contient le lien du dépôt GitHub et celui du site en ligne. Ces liens restent à renseigner; ne pas en inventer.

| Champ | Valeur à fournir |
|---|---|
| Dépôt GitHub clonable | À renseigner après création du dépôt |
| Site public HTTPS | À renseigner après déploiement et contrôle |
| Commit livré | À renseigner après stabilisation de CP1 |
| Installation et configuration | Lien vers le README du dépôt |
| Documentation CP1 | Lien vers l'index des documents |
| Limites connues | Lien vers la section des limites réellement observées |

L'annonce de remise et les demandes de contact dans les captures sont des informations source. La préparation de ce dossier n'envoie rien sur Léa, ne contacte personne et ne crée pas automatiquement un dépôt ou un déploiement. Les prochaines actions pourront suivre la portée autorisée par l'utilisateur quand le projet sera prêt.
