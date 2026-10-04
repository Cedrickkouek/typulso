# Un clavier. Toute une arène.

[← Dossier du projet](../README.md)

> **Dossier de conception · Web V · 2 octobre 2026 · proposition v0.5**  
> Courses de frappe collectives pour les 12–17 ans  
> **Nom en exploration : Rytapo · Typulso · Frappiq**

![Direction proposée](assets/moodboard.png)

Ce dossier prépare le projet **React dans Next.js, TypeScript, Tailwind CSS et PostgreSQL**. Il reprend les échanges antérieurs, le cahier des charges et les nouvelles précisions client. Les documents sont en Markdown compatible GitHub; les diagrammes utilisent Mermaid et les visuels sont locaux.

**Mise à jour du 3 octobre :** le dossier de conception est intégré au projet applicatif. Lire l'[architecture réellement implémentée](18-implementation.md), le [guide de déploiement](19-deploiement.md) et le [rapport de vérification](20-verification-implementation.md). Les documents 01–17 gardent la démarche et les contrôles historiques du prototype. Le nom et le logo restent à choisir et à créer humainement selon le cahier. Les maquettes historiques utilisent des données fictives; l'application utilise ses services et PostgreSQL.

La deuxième recherche ajoute **51 nouvelles références** aux 51 sites initiaux : **102 sites distincts cumulés dans les lots A–F**, hors Kahoot, Wooclap et Monkeytype. La v0.4 conserve la personnalité et la palette de la v0.3, puis précise boutons, invitations, statuts, zone de frappe, pistes et résultats. Les [contrats des futurs composants](14-composants-interface.md) distinguent cette spécification de l’aperçu HTML local.

La **v0.5** conserve cette base artistique et complète les pages à partir du [PDF fourni le 2 octobre](../sources/cahier-des-charges-2026-10-02.pdf). Le [plan détaillé](15-plan-des-pages.md) relie les 49 exigences produit aux parcours; le [design des pages](16-design-pages-et-etats.md) précise leurs contenus et comportements.

**Recherche du 4 octobre :** le [dossier footer et jeu](21-recherche-footer-et-jeu.md) rassemble 54 références exploitables parmi 79 candidats, dont 8 revues à l’écran. Il propose une évolution du footer et de la hiérarchie du jeu en conservant la palette actuelle. Le [registre](recherche/footer-jeu-2026-10-04.md) distingue texte, rendu et interaction ; cette collecte ne modifie pas le code applicatif. Les revisites ne sont pas ajoutées au total historique.

## Lire le dossier

| Document | Question traitée |
|---|---|
| [01 · Cahier des charges](01-cahier-des-charges.md) | Quel produit devons-nous livrer ? |
| [02 · Matrice des exigences](02-matrice-exigences.md) | Comment relier chaque exigence à une preuve ? |
| [03 · Direction artistique](03-direction-artistique.md) | Quel nom, quel logo et quelle personnalité ? |
| [04 · Expérience utilisateur](04-experience-utilisateur.md) | Comment rejoindre, attendre, taper et progresser ? |
| [05 · Architecture](05-architecture.md) | Où vivent les responsabilités techniques ? |
| [06 · Modèle de données](06-modele-donnees.md) | Quelles entités, relations et contraintes ? |
| [07 · Machines à états](07-machines-etats.md) | Comment évoluent salle, course et membres ? |
| [ADR 0001 · Temps réel](adr/0001-temps-reel.md) | Pourquoi cette solution de synchronisation ? |
| [08 · Plan du checkpoint](08-plan-checkpoint.md) | Que faut-il démontrer avant la remise ? |
| [09 · Sources et décisions](09-sources-et-decisions.md) | Qu'est-ce qui est confirmé, proposé ou ouvert ? |
| [10 · Développement et déploiement](10-developpement-et-deploiement.md) | Comment préparer l'installation, la CI et la production ? |
| [11 · Vérification du dossier](11-verification.md) | Qu'a-t-on réellement contrôlé à ce stade ? |
| [12 · Recherche d'inspiration](12-recherche-inspiration.md) | Quelles pistes apportent les 51 sites initiaux des lots A–C ? |
| [13 · Recherche de composants](13-recherche-composants.md) | Que retenir des 51 nouvelles références des lots D–F pour la v0.4 ? |
| [14 · Composants d’interface](14-composants-interface.md) | Quelle anatomie, quels états et quels comportements réaliser dans la future application ? |
| [15 · Plan complet des pages](15-plan-des-pages.md) | Quels parcours, droits et variantes relient les 20 écrans au cahier ? |
| [16 · Design de chaque page](16-design-pages-et-etats.md) | Quelle hiérarchie, quels contenus et quels états réaliser ? |
| [17 · Vérification des pages v0.5](17-verification-pages.md) | Quels parcours, dimensions et contrastes avons-nous réellement vérifiés ? |
| [18 · Implémentation](18-implementation.md) | Comment le code est-il réellement organisé ? |
| [19 · Déploiement](19-deploiement.md) | Comment installer les services et préparer lundi ? |
| [20 · Vérification applicative](20-verification-implementation.md) | Qu'a-t-on vérifié avec la vraie application et PostgreSQL ? |
| [21 · Recherche footer et jeu](21-recherche-footer-et-jeu.md) | Quelles références et propositions peuvent enrichir le footer et la course ? |
| [ADR 0002 · Structure App Router](adr/0002-structure-app-router.md) | Pourquoi la structure du cours remplace-t-elle le monorepo envisagé ? |

## Voir la proposition

Le [site de conception v0.5](preview/index.html) propose **20 écrans et 74 combinaisons de pages et d’états**. Le bouton **Toutes les pages** ouvre un catalogue; les menus bleus **Page / État** comparent les variantes. On peut suivre les parcours avec les liens et boutons : invité par code, compte d’exemple, création privée, salon, course et résultats. Préférences rassemble langue, thème, mouvement réduit, noms de travail et mode gris.

Les accès, invitations, bots et résultats restent des exemples locaux. La saisie mesure uniquement la progression et la précision de l’exercice local; la minuterie est figée. Les permissions sont représentées pour discuter l’interface, sans constituer une sécurité serveur.

L’[atelier de marque v0.4](preview/atelier.html) reste disponible pour comparer les logos et la palette.

Pour la consulter depuis le **dossier du projet** avec Python installé :

```bash
python3 -m http.server 4173 --bind 127.0.0.1 --directory docs
```

Ouvrir ensuite `http://127.0.0.1:4173/preview/`. L'HTML peut aussi s'ouvrir directement. GitHub affiche le Markdown et les images; il ne transforme pas cet HTML en application. Le serveur ci-dessus sert seulement le dossier local de conception, pas le futur site en production.

## Méthode réutilisable

Le [skill site-design-spec révisé](../skills/site-design-spec/SKILL.md) intègre les slides : choisir une personnalité liée au public, structurer une fonctionnalité centrale en monochrome, puis limiter et réutiliser les choix de style. Il impose aussi une recherche de **50–100 sites supplémentaires**, puis une revue visuelle ciblée et un registre distinguant texte, rendu et mouvement réellement observé. La [référence des slides](../skills/site-design-spec/references/sources-slides.md) garde leur correspondance avec les images 6–17.

## Préparer le futur dépôt

Conserver `docs/`, ses actifs, la copie `skills/site-design-spec/`, `sources/` et `outils/` dans le futur dépôt. Les sources historiques sont réunies dans `sources/`; la version consolidée du dossier devient la base de travail. Le skill général de Codex reste installé à son emplacement habituel. Avant publication, choisir les pièces de provenance à partager : les captures Discord contiennent des identités et ne sont pas automatiquement incluses dans les actifs publics.

Le GitHub public et le lien du site seront renseignés lorsqu'ils existeront. Le dossier ne contient pas de lien fictif ni de déclaration de livraison.
