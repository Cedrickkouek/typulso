# Typulso

**Un clavier. Toute une arène.**

Une application de courses de frappe pour jouer ensemble et progresser, avec une direction colorée, vibrante et ludique. L’application livrée utilise le nom **Typulso** et son logo clavier/pulsation. Les choix et retours du porteur du projet sont consignés dans la [démarche créative](docs/03-direction-artistique.md); l’origine humaine d’éventuels croquis ou idées de marque reste à compléter avec l’équipe.

[Jouer en production](https://typulso-production.up.railway.app/) · [Dépôt GitHub](https://github.com/Cedrickkouek/typulso) · [CI vérifiée](https://github.com/Cedrickkouek/typulso/actions/runs/37648917231) · [Dossier du checkpoint 1](docs/08-plan-checkpoint.md)

**État vérifié le 7 octobre 2026 :** inscription et connexion locales, PostgreSQL et salon rejoint par code contrôlés sur Railway avec deux sessions HTTP/Socket.IO indépendantes. Les modes classique/arcade, les sons optionnels, les statistiques et la frappe directe sont intégrés au code; les contrôles de parties détaillés restent des preuves locales et de CI. Le dépôt est privé : sa consultation demande les droits GitHub appropriés.

![Direction artistique](docs/assets/moodboard.png)

[Dossier de conception](docs/README.md) · [Architecture actuelle](docs/18-implementation.md) · [Installer et déployer](docs/19-deploiement.md) · [Cahier des charges](docs/01-cahier-des-charges.md)

## Stack

React **19.3.0** dans Next.js **16.3.8** avec App Router et React Compiler, TypeScript strict **6.0.2**, Tailwind CSS **4.3.3**, PostgreSQL **18**, Drizzle et Socket.IO. Le dépôt utilise Bun **1.4.1**; la production cible Node.js **24 LTS**. Les dépendances sont verrouillées dans `bun.lock`. TypeScript 6 est retenu parce que l'analyseur ESLint de cette version ne prend pas encore TypeScript 7 en charge.

## Démarrage local

Avec Bun, Node.js 24 et Docker Desktop démarré :

```bash
bun install --frozen-lockfile
cp .env.example .env.local
docker compose up -d postgres
bun run db:migrate
bun run dev
```

Ouvrir [l'application locale](http://127.0.0.1:3000). Le service de course écoute sur le port 3001. Avec PostgreSQL déjà installé, remplacer `DATABASE_URL` dans `.env.local` et créer une base vide dédiée avant les migrations. Ne pas pointer les tests sur une base de production.

Les clés GitHub et Discord sont facultatives pour le démarrage local; les boutons correspondants n'activent une connexion que si leurs fournisseurs sont configurés. Le compte local utilise un pseudonyme et un mot de passe, sans courriel ni récupération.

## Organisation

```text
app/                 Pages App Router et routes HTTP
components/          Interface React et composants réutilisés
lib/client/          Préférences, session et connexion temps réel
lib/domain/          Règles pures du jeu et génération du contenu
lib/server/          Authentification et opérations PostgreSQL
server/              Service Socket.IO persistant
db/                  Schéma et migrations SQL
types/game.ts        Contrat partagé
tests/               Tests du moteur, du serveur et d'intégration
e2e/                 Parcours navigateur exécutés dans la CI
docs/                Direction artistique, architecture, exigences, ADR
.agents/skills/      Méthode de développement du projet
skills/              Copies portables des skills
```

La structure reprend le projet de cours `cours-next-js` : `app/`, `lib/`, TypeScript et Bun à la racine. PostgreSQL remplace sa base SQLite de démonstration. Le serveur temps réel est un processus distinct.

## Vérifications

```bash
bun run check
# Avec PostgreSQL migré et les deux services lancés :
bun run test:integration
```

GitHub Actions a exécuté avec succès les contrôles, les migrations, l’intégration avec PostgreSQL et les trois scénarios navigateur au [commit applicatif 4d23075](https://github.com/Cedrickkouek/typulso/commit/4d23075557799c02acbb8253bd830409f8ebe446). La [CI consultable](https://github.com/Cedrickkouek/typulso/actions/runs/37648917231) utilise une base isolée; elle ne teste pas le site Railway. Le [rapport de vérification](docs/20-verification-implementation.md) distingue ces preuves des contrôles réalisés en production.

## Checkpoint 1 · état du 7 octobre 2026

Les [six critères et leurs preuves](docs/08-plan-checkpoint.md) sont reliés aux documents et au commit applicatif vérifié. L’échéance annoncée était le 5 octobre; ce dossier actualisé ne constitue pas une preuve de remise à cette date. Les contributions créatives connues sont attribuées; les croquis humains et leurs auteurs restent à renseigner si l’équipe en a réalisés. Le test de charge à 30 personnes, les vrais retours OAuth et la restauration des sauvegardes ne sont pas déclarés vérifiés.
