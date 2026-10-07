# Typulso — présentation de mon projet

**Auteur : YANN CEDRICK KOUEKAM TELEWOU**

> **Authentification actuelle :** j’ai limité la connexion aux comptes au **pseudonyme et au mot de passe**. Les options **OAuth GitHub/Discord sont prévues pour la suite**; le code préparatoire ne constitue pas une connexion externe livrée. L’accès invité reste distinct de l’authentification d’un compte.

> **Projet individuel · Web V · état du 7 octobre 2026.**

Je développe **Typulso**, une application de courses de frappe destinée principalement aux 12–17 ans. Mon objectif est de rendre la pratique du clavier amusante et compétitive, tout en montrant les progrès réels en vitesse et en précision.

[Application en production](https://typulso-production.up.railway.app/) · [Dépôt GitHub](https://github.com/Cedrickkouek/typulso) · [CI vérifiée](https://github.com/Cedrickkouek/typulso/actions/runs/37648917231)

## Ce que propose l’application

- Authentification actuelle par **pseudonyme et mot de passe**; accès invité distinct pour rejoindre. Les options **OAuth GitHub/Discord sont prévues pour la suite**, avec des éléments de code préparatoire.
- Création de salles par un compte, admission par code ou invitation, présence et réglages partagés en temps réel.
- Texte commun, départ serveur, progression et classement; classique pour les mesures de frappe, arcade avec Pulsation, Bouclier et Virgule piégée.
- Entraînement, résultats réels, historique, statistiques et clavier d’erreurs AZERTY/QWERTY avec filtres.
- Interface FR/EN, thèmes clair/sombre, sons optionnels, volume et réduction de mouvement.

## Mes choix de conception

J’ai demandé une identité colorée, vibrante et ludique, des motifs de clavier sur le fond, des pistes animées et une saisie directement dans le texte. J’ai aussi orienté les itérations par mes retours sur la lisibilité, les espaces, les menus et les statistiques.

Le nom utilisé est **Typulso**. L’identité visuelle associe clavier, pulsation et touches en mouvement. La palette actuelle utilise citron `#D7FF3F`, rose `#FF8FCE`, lavande `#BBA3FF`, bleu ciel `#82B4FF` et corail `#FF9478`, avec un texte encre sur les surfaces colorées. Space Grotesk sert à l’interface et IBM Plex Mono à la frappe.

![Moodboard du projet](assets/moodboard.png)

J’ai utilisé l’assistance de l’IA pour les recherches, les propositions de noms et de symboles, le moodboard, le code et les vérifications. Je distingue cette aide de mes décisions personnelles. Aucun croquis manuel original n’est déclaré réalisé sans pièce correspondante.

## Architecture et état vérifié

L’application utilise React 19.3.0 dans Next.js 16.3.8, TypeScript 6.0.2, Tailwind CSS 4.3.3, Bun 1.4.1 et PostgreSQL 18. La production utilise deux processus Node.js : le site Next.js et le service Socket.IO, qui partagent la même base. Le navigateur ne décide ni des permissions ni du score final.

Le commit applicatif vérifié est `4d23075557799c02acbb8253bd830409f8ebe446`. Les contrôles locaux comprennent 69 tests unitaires réussis, 1 116 assertions et les compilations web/realtime; la passe dédiée d’intégration comprend 9 tests et 99 assertions. La CI distante a exécuté les migrations, le format, le lint, les types, les tests, les compilations, l’intégration et trois scénarios navigateur avec succès.

Sur Railway, 14 vérifications HTTP/Socket.IO ont confirmé HTTPS, PostgreSQL disponible, inscription puis reconnexion au même compte, profil relu, invité indépendant, création/admission par code, arrivée partagée, modification de durée partagée, refus du non-hôte et état prêt partagé. Cet essai utilise les vrais services; il ne représente pas une recette visuelle exhaustive ni toutes les courses arcade en production.

Le dépôt reste privé : mon évaluateur doit disposer de l’accès nécessaire. Les tests de charge à 30 personnes, la latence mesurée, l’ajout ultérieur des connexions OAuth, la restauration des sauvegardes et les essais avec les 12–17 ans restent à vérifier.

## Présentation des pièces de remise

Je rédige chaque document pour qu’il puisse être lu séparément : contexte, décisions, état réel et limites sont expliqués directement dans la pièce concernée. Je conserve les recherches et observations anciennes avec leur date. Les maquettes fictives, les contrôles locaux, la CI et les preuves de production sont distingués.
