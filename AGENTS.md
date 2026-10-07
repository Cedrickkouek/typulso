# Développer Typulso

Lire le [skill du projet](.agents/skills/typulso-development/SKILL.md) avant de modifier l'application. Les demandes de l'utilisateur ont priorité sur ce document.

## Contrats et sources

- `docs/01-cahier-des-charges.md` et `docs/02-matrice-exigences.md` : exigences produit.
- `docs/03-direction-artistique.md`, `docs/14-composants-interface.md`, `docs/16-design-pages-et-etats.md` : direction visuelle conservée.
- `docs/18-implementation.md` : structure réellement implémentée et limites.
- `types/game.ts` : contrat partagé entre le navigateur et le serveur.
- `docs/19-deploiement.md` : installation, vérifications et production.

## Next.js de cette version

Ne pas présumer que les anciennes conventions Next.js restent valides. Lire les guides concernés dans `node_modules/next/dist/docs/` avant de changer une API du framework. `cookies()`, `params` et `searchParams` sont asynchrones. `cacheComponents` est activé : isoler les données de session et les accès runtime sous Suspense; ne jamais mettre les permissions en cache partagé.

## Documents à remettre

Le projet est individuel. Rédiger les décisions personnelles à la première personne (« je », « mon projet »), sans attribuer les travaux à une équipe. Chaque document doit pouvoir être remis et lu séparément : expliquer directement les informations nécessaires et ne pas créer de liens hypertextes vers d’autres fichiers/documentations du dépôt. Les liens vers le site déployé, le dépôt, la CI et les sources publiques en ligne peuvent être conservés. Garder les illustrations intégrées, les dates, la portée des preuves et une attribution exacte de l’assistance IA; ne jamais transformer une proposition assistée en création humaine déclarée.

Pour les pièces de remise, ajouter sous le titre « Auteur : YANN CEDRICK KOUEKAM TELEWOU ». Le périmètre actuel de connexion des comptes est pseudonyme et mot de passe; présenter OAuth GitHub/Discord comme une évolution prévue pour la suite, même si routes, variables ou tables préparatoires existent déjà. L’accès invité est distinct d’un compte authentifié.

## Contrôles

Utiliser Bun et le lockfile existant. Avant une livraison : `bun run lint`, `bun run typecheck`, `bun run test`, `bun run build`, `bun run build:realtime`. Vérifier les modifications de données et de permissions contre PostgreSQL avec `bun run test:integration` lorsque les deux services sont lancés. Les assertions de production ne sont valables qu'après vérification de l'URL déployée.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
