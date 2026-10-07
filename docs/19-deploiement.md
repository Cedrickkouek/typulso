# Installer, déployer et exploiter Typulso

> **Actualisé le 7 octobre 2026 · production Railway observée.**\
> Échéance initialement annoncée : 5 octobre, avant 23 h 55 à Toronto; cette recette ne prouve pas une remise à cette date.


## Production observée · 7 octobre 2026

| Élément | Preuve actuelle |
|---|---|
| Site | [Typulso sur Railway](https://typulso-production.up.railway.app/) |
| Dépôt | [Cedrickkouek/typulso](https://github.com/Cedrickkouek/typulso), privé |
| Version applicative vérifiée | [4d23075](https://github.com/Cedrickkouek/typulso/commit/4d23075557799c02acbb8253bd830409f8ebe446) |
| CI | [Exécution 37648917231](https://github.com/Cedrickkouek/typulso/actions/runs/37648917231), réussie |
| Déploiements | Statuts Railway web et realtime réussis sur ce commit. |
| Fonctionnement en ligne | HTTPS, healthcheck web avec base disponible, compte créé et relu après reconnexion, salon/code et mises à jour entre deux sessions HTTP/Socket.IO. |

Les 14 vérifications de production couvrent santé HTTPS/PostgreSQL, inscription, reconnexion au même compte, profil relu, session invitée, création et code réel, admission et arrivée partagée, durée 60→45 propagée, configuration refusée au non-hôte et prêt partagé. La CI emploie une base isolée et constitue une preuve distincte. Les valeurs privées de connexion, le domaine du service temps réel et les réglages du compte Railway ne sont pas publiés ici. Les exemples ci-dessous sont des **instructions de configuration**, pas une capture exhaustive des variables de production.

L’origine web observée est `https://typulso-production.up.railway.app`. `APP_URL` doit correspondre exactement à l’adresse officielle utilisée; une autre origine provoque le refus de connexion. Si PostgreSQL signale `relation "rate_limits" does not exist`, vérifier que l’application vise la bonne base et que les migrations ont été appliquées à cette base. Ajouter `DATABASE_URL` ne crée pas les tables à lui seul. Ne pas réinitialiser une base contenant des données pour résoudre ce problème.

La restauration des sauvegardes, la charge à 30 personnes, les coûts et les vrais retours OAuth ne sont pas attestés par cette recette. Le guide conserve les opérations nécessaires pour les vérifier.

## Installation

Utiliser Node.js 24 LTS, Bun 1.4.1 et PostgreSQL 18. Les versions des packages sont fixées dans `package.json` et `bun.lock`.

```bash
bun install --frozen-lockfile
cp .env.example .env.local
docker compose up -d postgres
bun run db:migrate
bun run dev
```

`bun run dev` lance Next.js sur `http://127.0.0.1:3000` et Socket.IO sur `http://127.0.0.1:3001`. Si PostgreSQL est installé directement, créer une base dédiée et régler `DATABASE_URL` au lieu de démarrer le conteneur. Docker Desktop doit fonctionner pour les commandes Compose.

Le développement local préparé le 3 octobre utilise un cluster temporaire sur **55432**, distinct des bases existantes. Sa configuration se trouve uniquement dans `.env.local`, ignoré par Git. Ce cluster est un outil de vérification; il ne constitue pas un hébergement durable. Pour continuer normalement, choisir le PostgreSQL de Compose ou une instance locale durable et lancer les migrations.

Pour les tests d'intégration locaux, copier cette configuration dans `.env.test` (`cp .env.local .env.test`) : Bun utilise l'environnement de test. En CI, les variables sont injectées directement et aucun fichier contenant des secrets n'est versionné.

## Variables

| Variable | Service | Usage |
|---|---|---|
| `DATABASE_URL` | Web + temps réel + migration | Connexion PostgreSQL serveur. Ne jamais préfixer par `NEXT_PUBLIC_`. |
| `APP_URL` | Web + temps réel | Origine exacte autorisée, sans slash final; HTTPS en production. |
| `NEXT_PUBLIC_REALTIME_URL` | Build web + temps d'exécution web | URL publique du service de course, HTTPS en production. Doit être fixée **avant** `next build`. |
| `REALTIME_PORT` | Temps réel | Port d'écoute du processus persistant. |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | Web | Application OAuth GitHub; absence = méthode désactivée. |
| `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET` | Web | Application OAuth Discord; absence = méthode désactivée. |
| `TRUST_PROXY` | Web | Activer uniquement derrière un proxy contrôlé qui remplace les en-têtes d'adresse. |

Les secrets sont injectés par l'hébergeur ou un fichier local ignoré. Aucun secret réel n'est nécessaire pour lire la documentation et construire l'interface. Les mots de passe locaux sont hachés avec Argon2id, sans récupération par courriel.

Pour OAuth, créer les applications avec les retours exacts :

```text
https://<domaine-app>/api/auth/oauth/github/callback
https://<domaine-app>/api/auth/oauth/discord/callback
```

Les comptes externes ne sont pas fusionnés à partir d'un pseudonyme identique. Les retours OAuth et les permissions seront vérifiés avec de vraies applications avant de les déclarer opérationnels en ligne.

## Build de production

```bash
bun run lint
bun run format:check
bun run typecheck
bun run test
bun run build
bun run build:realtime
# Chaque commande suivante tourne dans un processus distinct :
bun run start
bun run start:realtime
```

Le build Next.js produit `.next/standalone` et y copie les actifs `public/` et `.next/static/`. `bun run start` exécute son `server.js`; `Dockerfile` utilise ce même format avec Node.js 24 et les fichiers statiques. `Dockerfile.realtime` compile le serveur TypeScript pour Node.js. Le transport doit conserver les connexions WebSocket; un hébergement de fonctions courtes seul ne suffit pas pour le service de course.

## Avec Docker Compose

```bash
docker compose up --build -d
docker compose ps
```

Compose attend PostgreSQL, exécute la migration, puis démarre les deux services. Les ports locaux sont liés à 127.0.0.1. Le volume PostgreSQL 18 est monté sur `/var/lib/postgresql`; ne pas utiliser les chemins d'anciennes images sans vérifier leur compatibilité. La configuration par défaut vise un essai local. En production, injecter une connexion dédiée, un mot de passe fort, les deux origines HTTPS et un proxy chiffrant les échanges.

Ce chemin suit l'[image PostgreSQL officielle](https://hub.docker.com/_/postgres). Les versions des actions suivent les exemples officiels de [checkout](https://github.com/actions/checkout), [setup-node](https://github.com/actions/setup-node) et [setup-bun](https://github.com/oven-sh/setup-bun), vérifiés le 3 octobre.

**Le conteneur n'a pas été exécuté pendant la vérification locale si Docker Desktop n'est pas démarré.** Le rapport de vérification indique précisément ce qui a été testé.

## Déployer sur Railway

La préparation Docker du 7 octobre a été suivie du déploiement que j’ai effectué sur Railway. L’état observé et les preuves figurent en début de document. La procédure ci-dessous permet de reproduire les trois services; elle n’affirme pas que tous les réglages ou sauvegardes du compte d’hébergement ont été audités.

Vérification locale du 7 octobre : `bun run check` réussi (formatage, lint, types, 69 tests unitaires, builds web et realtime). Les deux images ont été construites puis démarrées avec Node.js 24 et un PostgreSQL 18 temporaire isolé. Migration initiale appliquée et rejouée sans changement, deux healthchecks avec base disponible, accueil HTTP 200 et inscription HTTP 201 avec Argon2 natif. La commande par défaut de l'image web est bien `node server.js`. Les conteneurs et le réseau de cet essai ont été supprimés; la base locale existante n'a pas été utilisée. Les tests d'intégration multijoueurs n'ont pas été relancés pour cette préparation de livraison.

### 1. Créer les trois services

Dans un projet Railway, ajouter **Postgres**, puis deux services du même dépôt GitHub : **web** et **realtime**. Garder la racine du dépôt `/` pour les deux. Choisir la même région pour les trois services, proche du public attendu.

Créer les deux services applicatifs sans lancer immédiatement leurs déploiements, ou désactiver temporairement les déploiements automatiques, afin de renseigner les URLs et les variables avant le premier build web. Les fichiers locaux `.env.local` et `.env.test` ne doivent pas être envoyés.

| Réglage | web | realtime |
|---|---|---|
| `RAILWAY_DOCKERFILE_PATH` dans Variables | `Dockerfile` | `Dockerfile.realtime` |
| Commande de démarrage | Laisser vide : image `node server.js` | Laisser vide : image `node dist/realtime.mjs` |
| Commande Pre-deploy | Aucune | `node dist/migrate.mjs` |
| Délai Pre-deploy | — | 300 secondes |
| Port public cible | 3000 | 3001 |
| Healthcheck | `/api/health` | `/health` |
| Nombre d'instances | 1 au départ | **1 uniquement** |
| Serverless / mise en sommeil | Désactivé au départ | **Désactivé** |

Le Dockerfile principal termine par l'image du site : Railway peut l'utiliser sans sélectionner de cible spéciale. La cible `migrator` reste utilisable par Compose. L'image realtime contient le script de migration compilé pour Node.js et les fichiers SQL; elle n'a pas besoin de Bun au démarrage.

### 2. Générer les URLs et renseigner les variables

Dans Settings → Networking, générer une URL publique pour chacun des deux services, avec les ports cibles indiqués ci-dessus. Noter les deux origines HTTPS, **sans slash final**. Si Railway ne permet de générer l'URL qu'après une première tentative de déploiement, obtenir les URLs puis corriger les variables et reconstruire le web avant d'utiliser le site.

Les valeurs entre chevrons ci-dessous sont des exemples à remplacer. La référence `Postgres` doit correspondre au nom exact du service de base de données.

**Variables du web :**

```text
RAILWAY_DOCKERFILE_PATH=Dockerfile
DATABASE_URL=${{Postgres.DATABASE_URL}}
APP_URL=https://<domaine-web>
NEXT_PUBLIC_REALTIME_URL=https://<domaine-realtime>
PORT=3000
HOSTNAME=0.0.0.0
```

**Variables du realtime :**

```text
RAILWAY_DOCKERFILE_PATH=Dockerfile.realtime
DATABASE_URL=${{Postgres.DATABASE_URL}}
APP_URL=https://<domaine-web>
REALTIME_PORT=3001
PORT=3001
```

Utiliser la connexion privée PostgreSQL du projet; ne pas reprendre la connexion `127.0.0.1` de développement. Garder `NEXT_PUBLIC_REALTIME_URL` publique : le navigateur des joueurs doit pouvoir l'atteindre. Cette valeur est intégrée au build web; après une modification, reconstruire l'image web, un simple redémarrage ne suffit pas.

Les identifiants OAuth sont facultatifs. Garder `TRUST_PROXY` désactivé tant que le traitement des en-têtes d'adresse par le proxy n'a pas été vérifié.

### 3. Déployer et vérifier

1. Attendre que Postgres soit disponible et vérifier son volume persistant. Activer les sauvegardes selon l'offre choisie.
2. Déployer **realtime en premier**. Sa commande Pre-deploy applique les migrations avant son démarrage; si elle échoue, résoudre l'erreur avant de continuer. Ne pas exécuter les migrations pendant le build, qui n'a pas accès au réseau privé.
3. Déployer **web** avec les deux URLs HTTPS définitives.
4. Ouvrir `https://<domaine-web>/api/health` et `https://<domaine-realtime>/health` : chacun doit répondre avec `ok: true` et `database: true`.
5. Créer un compte sur le site publié, rejoindre une salle depuis un second navigateur et terminer une course. Vérifier le classement, la reconnexion et la présence du résultat dans le profil.
6. Configurer une alerte de budget et vérifier une restauration de sauvegarde avant d'ouvrir largement le jeu.

Les prochains déploiements realtime se font hors course active : un redémarrage interrompt les courses en cours. Garder une seule instance, sans activer de mise à l'échelle automatique. La capacité à 30 joueurs reste à mesurer sur l'hébergement choisi.

Sources Railway vérifiées le 7 octobre 2026 : [Dockerfiles et variables de build](https://docs.railway.com/builds/dockerfiles), [variables et références entre services](https://docs.railway.com/variables), [commande Pre-deploy](https://docs.railway.com/deployments/pre-deploy-command), [réseau privé](https://docs.railway.com/networking/private-networking/how-it-works), [domaines](https://docs.railway.com/networking/domains/working-with-domains), [base de données et responsabilités](https://docs.railway.com/databases).

## Topologie de première production

Déployer une application Next.js, **une seule instance** du service Socket.IO et un PostgreSQL durable. Les services utilisent la même base et la même origine `APP_URL`. Les certificats et le proxy de l'hébergeur fournissent HTTPS et WSS. Le navigateur ouvre Socket.IO vers `NEXT_PUBLIC_REALTIME_URL`; cette origine n'autorise pas d'autres sites à commander la salle.

Le service temps réel doit rester actif, sans mise en sommeil pendant les courses. Configurer les sauvegardes PostgreSQL et vérifier la restauration. Une panne ou un redémarrage interrompt une course active; aucun résultat gagnant n'est attribué à une course interrompue. Une mise à l'échelle horizontale demande un changement d'architecture et des tests supplémentaires.

Les endpoints `/api/health` et `/health` vérifient aussi la base. Exécuter les migrations avant de recevoir des utilisateurs, une seule étape de livraison suffit grâce au verrou de migration.

Les tests navigateur sont dans `e2e/`. Avec les deux services lancés et une base de test dédiée : installer Chromium avec `bunx playwright install chromium`, puis lancer `bun run test:e2e`. Ils vérifient navigation responsive, langue/thème, deux contextes indépendants de salle et entraînement mesuré. Leur exécution automatique est prévue dans la CI; la recette visuelle locale est consignée séparément dans le rapport.

## Recette et exploitation

| Vérification | État au 7 octobre |
|---|---|
| HTTPS et PostgreSQL | Healthcheck web en ligne réussi, compte relu après reconnexion et salle persistée/utilisée. |
| Salon et permissions | Création/admission par code, arrivée, durée, état prêt et refus du non-hôte vérifiés par deux sessions de production. |
| Interface FR/EN et thèmes | Recettes locales et scénario navigateur CI réussis; revue exhaustive en production non réalisée. |
| CI | [Exécution réussie sur 4d23075](https://github.com/Cedrickkouek/typulso/actions/runs/37648917231), avec migrations, intégration et navigateur. |
| Reconnexion, succession, courses et arcade | Contrôles locaux/CI consignés; recette complète de ces parcours en production encore ouverte. |
| Sauvegarde/restauration | Configuration et essai de restauration à vérifier; aucune réussite déclarée. |
| Capacité, latence, coût | Limite de 30 configurée; mesures de charge, latence et budget d’exploitation non consignées. |

Le test de charge, l’équilibrage arcade et les essais avec le public restent des recettes distinctes. Une migration et un déploiement réussis ne constituent pas un essai de restauration.

## Dépôt et remise

Le dépôt GitHub existe et contient l’application et le dossier; il reste **privé**. Vérifier les droits de l’évaluateur avant la remise. Cette actualisation documentaire ne change pas sa visibilité et ne déclare pas un audit exhaustif des secrets de tout l’historique Git.

Le dossier CP1 rassemble les liens réels du site, du dépôt, du commit applicatif vérifié et de la CI. Les fichiers d’environnement, bases locales, journaux et identités de recette restent hors des documents livrés. Toute soumission scolaire reste une action distincte à effectuer par moi.
