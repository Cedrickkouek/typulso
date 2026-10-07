---
name: typulso-development
description: Développer et vérifier Typulso avec React, Next.js App Router, Tailwind et PostgreSQL. Utiliser pour les écrans, comptes, salles, moteur de frappe, temps réel, migrations et préparation des livraisons de ce projet.
---

# Développement cohérent de Typulso

## Avant de changer le code

1. Identifier l'exigence dans `docs/02-matrice-exigences.md`, le parcours dans `docs/16-design-pages-et-etats.md` et le composant dans `docs/14-composants-interface.md`.
2. Lire `docs/18-implementation.md` et `types/game.ts`. Si le contrat change, modifier ses consommateurs ensemble.
3. Pour une API Next.js, lire le guide installé dans `node_modules/next/dist/docs/`. Conserver les versions compatibles verrouillées dans `bun.lock`; ne pas passer à `latest` sans vérifier les pairs, compiler et tester.

## Frontière client / serveur

- Garder les routes et layouts serveur par défaut; limiter `use client` aux interactions, préférences et Socket.IO. Le client n'importe jamais `lib/server`, PostgreSQL ou des secrets.
- Accès runtime et sessions sous Suspense avec `cacheComponents`. `cookies()` et les paramètres de route sont asynchrones. Aucun cache partagé d'une identité, permission, invitation ou résultat privé.
- Compte, session et hôte sont distincts. L'hôte est un rôle temporaire. L'invité rejoint une salle mais n'en crée pas.
- Valider identité, origine, schéma, admission, capacités et limite de débit sur le serveur à chaque opération. Les boutons désactivés ne constituent pas une permission.

## Course et temps réel

- Le moteur dans `lib/domain` est testable et indépendant de React, du réseau et de l'horloge implicite. Passer le temps explicitement.
- Le serveur détient phase, départ, texte, scores et classement. L'interface peut afficher une saisie optimiste, puis se corrige avec l'acquittement. Ne jamais inventer un score pour remplir un état vide.
- Préserver l'idempotence des commandes, la version de salle, l'identifiant de course et la séquence de saisie. Une reprise de connexion reçoit un état complet filtré pour son destinataire.
- Ne pas diffuser les secrets d'invitation, les sessions ni la saisie privée des autres joueurs. Les migrations PostgreSQL sont versionnées; la salle se modifie sous verrou transactionnel.
- Tester Unicode, corrections, erreurs, spectateurs, départ commun, abandon, reconnexion et transfert d'hôte lorsqu'ils sont touchés.

## Direction artistique et accessibilité

- Conserver la personnalité colorée, vibrante, amusante et ludique et les tokens existants. Employer les accents comme surfaces avec texte encre, et des textes lisibles dans les deux thèmes.
- Construire d'abord le parcours central et sa hiérarchie. Réutiliser les boutons, champs, cartes, états et espacements. Navigation compacte aux breakpoints intermédiaires, grille sur les plus petits écrans, contrôles d'au moins 44 px.
- Tout contrôle a un nom, un focus visible et un comportement clavier. Respecter la réduction de mouvement. Prévoir chargement, vide, erreur, succès et interruption; traduire FR/EN.
- Pour une nouvelle direction visuelle, appliquer `site-design-spec` et son registre de recherche. Une correction locale d'un composant existant ne nécessite pas de recommencer les 50–100 références déjà étudiées.

## Vérifier et documenter

- Exécuter les contrôles adaptés : lint, TypeScript, tests du moteur, build Next.js et build du service temps réel. Pour une permission ou transaction, faire un test avec PostgreSQL réel et deux sessions indépendantes.
- Garder `bun run format:check` vert. `bun run format` applique Prettier et l'ordre des classes Tailwind; les documents historiques et sources sont exclus du formatage automatique.
- Examiner les écrans concernés en clair/sombre, à 390 px et au breakpoint intermédiaire, sans débordement et avec focus clavier. Une capture ne prouve pas le fonctionnement d'un serveur.
- Mettre à jour les docs quand une décision change. Distinguer spécification, implémentation locale vérifiée, CI exécutée à distance et production vérifiée. Ne pas cocher une preuve non réalisée.
- Ne pas intégrer de secrets, de données de test ou de captures nominatives au dépôt public. Garder le nom et le logo exploratoires tant que le porteur du projet individuel ne les a pas validés.
