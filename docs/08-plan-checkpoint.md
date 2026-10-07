# Checkpoint 1 — dossier et preuves vérifiées

> **État actualisé le 7 octobre 2026 · America/Toronto.**\
> Échéance annoncée dans la source : lundi 5 octobre 2026, avant 23 h 55.\
> Cette actualisation ne prouve pas une remise effectuée à cette échéance.

[← Documentation](README.md) · [Exigences](02-matrice-exigences.md) · [Rapport détaillé](20-verification-implementation.md)

## Liens de remise

| Pièce | Lien réel / état |
|---|---|
| Application HTTPS | [Typulso sur Railway](https://typulso-production.up.railway.app/) |
| Dépôt GitHub | [Cedrickkouek/typulso](https://github.com/Cedrickkouek/typulso) — privé, accès de lecture nécessaire |
| Version applicative vérifiée | [4d23075557799c02acbb8253bd830409f8ebe446](https://github.com/Cedrickkouek/typulso/commit/4d23075557799c02acbb8253bd830409f8ebe446) |
| CI de cette version | [Vérifications Typulso · exécution 37648917231](https://github.com/Cedrickkouek/typulso/actions/runs/37648917231) — réussie le 7 octobre |
| Installation | [README](../README.md) et [guide des services](19-deploiement.md) |
| Documentation | [Index](README.md), [cahier](01-cahier-des-charges.md), [matrice](02-matrice-exigences.md) |
| Attribution créative | [Registre de direction artistique](03-direction-artistique.md) |

Le commit ci-dessus fixe la version applicative des preuves. La consolidation documentaire du 7 octobre peut avoir un commit ultérieur; elle ne change pas rétroactivement la version testée. Les statuts GitHub du commit applicatif indiquent un déploiement Railway réussi pour les services web et temps réel. La vérification fonctionnelle en ligne est consignée ci-dessous.

## Grille officielle

| Critère | Points | Pièces et preuve obtenue | Limite à connaître |
|---|---:|---|---|
| Cahier des charges | 20 | [01](01-cahier-des-charges.md) reprend les exigences sources et leurs priorités; [02](02-matrice-exigences.md) relie réalisation et preuve. | Une documentation complète n’est pas une validation de toutes les exigences finales. |
| Démarche créative et direction artistique : nom, logo, moodboard, palette, typographies | 20 | [03](03-direction-artistique.md) contient ces éléments, l’identité intégrée, les décisions et retours humains identifiables. Logo et favicon utilisés dans l’application. | **Attribution partielle :** les esquisses assistées ne prouvent pas une création originale humaine. Idées/croquis de l’équipe et auteurs restent à fournir s’ils existent. |
| Architecture : modèle de données, machine à états, ADR temps réel | 20 | [05](05-architecture.md), [06](06-modele-donnees.md), [07](07-machines-etats.md) et [ADR 0001](adr/0001-temps-reel.md) concordent avec les répertoires, migrations et contrat présents. | Charge à 30 personnes et reprise d’une course après panne non validées; l’implémentation interrompt la course après redémarrage. |
| Déploiement fonctionnel : HTTPS, authentification, base de données | 20 | HTTPS et healthcheck avec PostgreSQL disponible; inscription, déconnexion, reconnexion et relecture du profil réussies sur Railway. | Authentification locale vérifiée; vrais retours GitHub/Discord et restauration de sauvegarde non contrôlés. |
| Salle créée et rejointe par code, mise à jour en temps réel | 10 | Deux sessions indépendantes HTTP/Socket.IO sur Railway : création, code, admission invitée, arrivée propagée, modification de durée propagée, refus du non-hôte, état prêt propagé. | Cette recette utilise le protocole réel; elle ne constitue pas une recette visuelle de deux navigateurs en production. |
| CI, langue et thème, qualité initiale du code, matrice | 10 | CI distante réussie : format, lint, types, unités, builds, intégration et navigateur. Les trois scénarios Playwright couvrent FR/EN, thème, responsive, salon à deux contextes et pratique. [02](02-matrice-exigences.md) actualisée. | Tests navigateur exécutés dans l’environnement isolé de CI, pas sur Railway. Accès GitHub nécessaire pour consulter la preuve. |
| **Total de la grille** | **100** | Les pièces correspondent aux six critères. | **Aucune note ni conformité totale n’est revendiquée.** |

## Environnements et portée des preuves

| Environnement | Ce qui a été contrôlé | Ce que cela ne prouve pas |
|---|---|---|
| Local · 7 octobre | 69 tests unitaires, 1 116 assertions, aucun échec; passe dédiée PostgreSQL/HTTP/Socket.IO : 9 tests, 99 assertions; builds web et temps réel. Recettes UI datées dans le rapport 20. | Une publication ou un fonctionnement sur l’hébergement. Les 11 entrées ignorées dans la passe unitaire appartiennent aux suites exécutées séparément. |
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

## Démonstration à présenter

Ce parcours est un guide de démonstration, distinct des preuves déjà exécutées.

1. Ouvrir le [site](https://typulso-production.up.railway.app/) avec un compte dans le navigateur A; créer une salle par code.
2. Dans une session séparée B, entrer le code avec un invité; montrer les présences communes.
3. Modifier un réglage en A, observer sa mise à jour en B; montrer que B n’a pas les commandes de l’hôte.
4. Passer B à « prêt » et observer l’état en A; quitter B puis terminer proprement la salle.
5. Montrer les sélecteurs FR/EN et clair/sombre, puis les documents d’architecture et la CI du commit testé.

## Points encore ouverts pour le dossier

- Compléter la contribution originale de l’équipe au nom/logo avec les auteurs, idées, croquis ou modifications réellement réalisés. Les choix de direction et critiques identifiables sont déjà documentés.
- Vérifier l’accès de l’évaluateur au dépôt privé et à ses exécutions CI. La visibilité du dépôt n’a pas été modifiée.
- Ne pas confondre les exigences finales encore à valider (charge, OAuth réel, sauvegarde, équilibre arcade, essais utilisateurs) avec les preuves obtenues pour ce checkpoint.

Le dossier prépare la remise; il n’envoie aucun message à l’enseignant et ne dépose aucun fichier sur la plateforme scolaire.
