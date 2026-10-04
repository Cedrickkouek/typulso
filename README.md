# Typulso

**Un clavier. Toute une arène.**

Une application de courses de frappe pour jouer ensemble et progresser, avec une direction colorée, vibrante et ludique. **Typulso est un nom de travail**; le choix final et la création humaine du logo restent à documenter avec l'équipe.

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
e2e/                 Parcours navigateur prévus dans la CI
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

La configuration GitHub Actions exécute ces contrôles avec PostgreSQL. Sa présence dans le dépôt ne prouve pas une exécution distante. Le [rapport de livraison](docs/20-verification-implementation.md) consigne les vérifications effectivement réalisées.

## Première livraison · lundi 5 octobre 2026

La première version doit être accessible en **HTTPS**, avec authentification, PostgreSQL et salle rejointe par code en temps réel. Le [guide de déploiement](docs/19-deploiement.md) décrit les deux services et la configuration. Le domaine public, l'hébergement, les applications OAuth et les liens de remise seront renseignés après leur création et leurs contrôles; aucun lien de production fictif n'est affiché.
