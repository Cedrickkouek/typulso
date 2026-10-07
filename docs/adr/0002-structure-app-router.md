# ADR 0002 · App Router à la racine et service temps réel séparé

- **Date :** 3 octobre 2026
- **Statut :** retenu et utilisé dans l’application actuelle; confirmé par la revue documentaire du 7 octobre 2026

## Contexte

L'architecture initiale proposait `apps/web`, `apps/realtime` et `packages/*`. Le projet de cours fourni comme référence utilise directement `app/`, `lib/`, Bun et TypeScript. La première livraison du 5 octobre demande un projet compréhensible et exploitable rapidement, avec PostgreSQL et un vrai service de salle.

## Décision

Conserver une application Next.js App Router à la racine. Séparer domaine, accès serveur, clients et base dans `lib/domain`, `lib/server`, `lib/client` et `db`. Le service Socket.IO reste un processus persistant séparé dans `server/`, partageant les contrats de `types/game.ts` et PostgreSQL.

La base SQLite de démonstration du projet de cours n'est pas reprise. Les migrations PostgreSQL sont livrées dans ce dépôt. Les documents de conception sont placés dans `docs/` avec un index Markdown visible dans GitHub. La copie du skill général reste dans `skills/`; sa version générale n'est ni déplacée ni remplacée.

## Conséquences

Une installation et un lockfile suffisent. Le domaine est testable sans navigateur; les permissions restent côté serveur. Le déploiement nécessite deux services et une base. Les documents 05 et ADR 0001 ont été harmonisés avec le code le 7 octobre; le document 10 conserve le plan initial daté. Cette décision remplace seulement l’arborescence envisagée dans les documents 05 et 10, pas les invariants de l'ADR 0001. Un monorepo pourra être introduit quand des consommateurs supplémentaires le justifieront.
