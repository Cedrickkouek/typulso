# Checkpoint 1 — dossier et preuves vérifiées

**Auteur : YANN CEDRICK KOUEKAM TELEWOU**

> **Authentification actuelle :** j’ai limité la connexion aux comptes au **pseudonyme et au mot de passe**. Les options **OAuth GitHub/Discord sont prévues pour la suite**; le code préparatoire ne constitue pas une connexion externe livrée. L’accès invité reste distinct de l’authentification d’un compte.

> **État actualisé le 7 octobre 2026 · America/Toronto.**\
> Échéance annoncée dans la source : lundi 5 octobre 2026, avant 23 h 55.\
> Cette actualisation ne prouve pas une remise effectuée à cette échéance.


## Identification et accès

| Pièce | Lien réel / état |
|---|---|
| Application HTTPS | [Typulso sur Railway](https://typulso-production.up.railway.app/) |
| Dépôt GitHub | [Cedrickkouek/typulso](https://github.com/Cedrickkouek/typulso) — privé, accès de lecture nécessaire |
| Version applicative vérifiée | [4d23075557799c02acbb8253bd830409f8ebe446](https://github.com/Cedrickkouek/typulso/commit/4d23075557799c02acbb8253bd830409f8ebe446) |
| CI de cette version | [Vérifications Typulso · exécution 37648917231](https://github.com/Cedrickkouek/typulso/actions/runs/37648917231) — réussie le 7 octobre |
| Installation | Bun 1.4.1, Node.js 24, PostgreSQL 18; installer les dépendances, renseigner les variables, appliquer les migrations puis lancer web et realtime. |
| Périmètre | Courses de frappe, comptes/invités, salles, règles communes, classique/arcade, statistiques, FR/EN et thèmes. |
| Attribution créative | Mes choix et critiques sont personnels; recherches, propositions graphiques et code ont bénéficié de l’assistance de l’IA. |

Le commit ci-dessus fixe la version applicative des preuves. La consolidation documentaire du 7 octobre peut avoir un commit ultérieur; elle ne change pas rétroactivement la version testée. Les statuts GitHub du commit applicatif indiquent un déploiement Railway réussi pour les services web et temps réel. La vérification fonctionnelle en ligne est consignée ci-dessous.

## Grille officielle

| Critère | Points | Pièces et preuve obtenue | Limite à connaître |
|---|---:|---|---|
| Cahier des charges | 20 | Je cadre une application de courses de frappe pour les 12–17 ans : comptes et invités, admission par code, règles communes, temps réel, statistiques et accessibilité. Le référentiel compte 49 exigences produit, 10 hypothèses et 8 précisions client. | Une documentation complète n’est pas une validation de toutes les exigences finales. |
| Démarche créative et direction artistique : nom, logo, moodboard, palette, typographies | 20 | J’utilise Typulso et un signe clavier/pulsation. Mon moodboard associe touches et mouvement; ma palette utilise citron, rose, lavande, bleu ciel et corail. Space Grotesk sert à l’interface, IBM Plex Mono à la frappe. Mes choix et l’aide de l’IA sont distingués. | **Attribution partielle :** les esquisses assistées ne prouvent pas une création originale humaine. Mes éventuels croquis originaux restent à joindre; les esquisses assistées sont attribuées. |
| Architecture : modèle de données, machine à états, ADR temps réel | 20 | J’utilise deux processus Node.js, Next.js et Socket.IO, et une base PostgreSQL commune. Les entités principales sont comptes, acteurs, sessions, salles, membres, courses et résultats. Les phases sont salon, compte à rebours, course, résultats, fermeture et interruption; le serveur arbitre les transitions. | Charge à 30 personnes et reprise d’une course après panne non validées; l’implémentation interrompt la course après redémarrage. |
| Déploiement fonctionnel : HTTPS, authentification, base de données | 20 | HTTPS et healthcheck avec PostgreSQL disponible; inscription, déconnexion, reconnexion et relecture du profil réussies sur Railway. | Authentification actuelle par pseudonyme/mot de passe vérifiée. OAuth GitHub/Discord prévu ultérieurement; restauration de sauvegarde non contrôlée. |
| Salle créée et rejointe par code, mise à jour en temps réel | 10 | Deux sessions indépendantes HTTP/Socket.IO sur Railway : création, code, admission invitée, arrivée propagée, modification de durée propagée, refus du non-hôte, état prêt propagé. | Cette recette utilise le protocole réel; elle ne constitue pas une recette visuelle de deux navigateurs en production. |
| CI, langue et thème, qualité initiale du code, matrice | 10 | CI distante réussie : format, lint, types, unités, builds, intégration et navigateur. Les trois scénarios Playwright couvrent FR/EN, thème, responsive, salon à deux contextes et pratique. Je distingue exigences réalisées, preuves obtenues et validations encore ouvertes. | Tests navigateur exécutés dans l’environnement isolé de CI, pas sur Railway. Accès GitHub nécessaire pour consulter la preuve. |
| **Total de la grille** | **100** | Les pièces correspondent aux six critères. | **Aucune note ni conformité totale n’est revendiquée.** |

## Environnements et portée des preuves

| Environnement | Ce qui a été contrôlé | Ce que cela ne prouve pas |
|---|---|---|
| Local · 7 octobre | 69 tests unitaires, 1 116 assertions, aucun échec; passe dédiée PostgreSQL/HTTP/Socket.IO : 9 tests, 99 assertions; builds web et temps réel. Recettes UI locales datées, distinctes des contrôles en ligne. | Une publication ou un fonctionnement sur l’hébergement. Les 11 entrées ignorées dans la passe unitaire appartiennent aux suites exécutées séparément. |
| GitHub Actions · commit 4d23075 | Exécution réussie, du 7 octobre 16:02:42 à 16:05:38 UTC, sur PostgreSQL isolé et services locaux à la CI. Toutes les étapes du workflow ont réussi, y compris intégration et trois scénarios navigateur. | Une utilisation de la base ou des URLs Railway. |
| Railway · 7 octobre | 14 vérifications HTTP/Socket.IO concluantes sur le site public; deux identités indépendantes, compte et invité. | Toutes les parties arcade, tous les parcours UI, la charge, la restauration ou les tests auprès de jeunes. |

### Recette de production réellement exécutée

1. HTTPS : `/api/health` renvoie HTTP 200 avec `ok: true`, `database: true`, service web.
2. Inscription d’un compte de vérification réussie.
3. Déconnexion puis connexion : même identifiant de compte relu.
4. Profil authentifié relu depuis le service.
5. Session invitée indépendante obtenue.
6. Le compte crée une salle par la connexion Socket.IO de production.
7. Le serveur fournit un code réel de six caractères.
8. L’invité rejoint par ce code la même salle.
9. L’hôte reçoit l’arrivée de l’invité dans l’état partagé.
10. L’hôte change la durée de 60 à 45 secondes.
11. L’invité reçoit la nouvelle durée sans rechargement.
12. La même commande de configuration est refusée au non-hôte.
13. La commande « prêt » de l’invité est acceptée.
14. L’hôte reçoit ce nouvel état prêt.

La salle a été fermée, les connexions arrêtées et les sessions déconnectées après la recette. Un compte de vérification sans course reste dans la base; aucun score n’a été produit par cet essai. Aucun identifiant de session, mot de passe, jeton ou donnée nominative de la recette n’est publié ici.

## Démonstration que je peux présenter

Ce parcours est un guide de démonstration, distinct des preuves déjà exécutées.

1. Ouvrir le [site](https://typulso-production.up.railway.app/) avec un compte dans le navigateur A; créer une salle par code.
2. Dans une session séparée B, entrer le code avec un invité; montrer les présences communes.
3. Modifier un réglage en A, observer sa mise à jour en B; montrer que B n’a pas les commandes de l’hôte.
4. Passer B à « prêt » et observer l’état en A; quitter B puis terminer proprement la salle.
5. Montrer les sélecteurs FR/EN et clair/sombre, puis les documents d’architecture et la CI du commit testé.

## Points encore ouverts pour le dossier

- Joindre mes éventuels croquis ou transformations originales du nom/logo, avec leur date. Je distingue déjà mes choix personnels de l’assistance de l’IA.
- Vérifier l’accès de l’évaluateur au dépôt privé et à ses exécutions CI. La visibilité du dépôt n’a pas été modifiée.
- Ne pas confondre les exigences finales encore à valider (charge, sauvegarde, équilibre arcade et essais utilisateurs; l’ajout d’OAuth est prévu pour la suite) avec les preuves obtenues pour ce checkpoint.

Je prépare ce dossier pour ma remise; il ne constitue pas une preuve de dépôt sur la plateforme scolaire.
