# Vérification de la première implémentation

> **3 octobre 2026 · recette locale de la version 0.1**

[← Documentation](README.md) · [Architecture](18-implementation.md) · [Déploiement](19-deploiement.md) · [Exigences et preuves](02-matrice-exigences.md)

Ce rapport concerne l'application React/Next.js dans `/Users/admin/Documents/typulso`. Les rapports 11 et 17 restent les preuves historiques du prototype HTML. Le dépôt Git local est initialisé sur `main`, sans commit, remote ni publication GitHub. Aucun contrôle ci-dessous ne constitue une preuve de production.

## Environnement effectivement utilisé

- Next.js **16.3.8**, React **19.3.0**, Tailwind **4.3.3**, TypeScript **6.0.2**, Bun **1.4.1**; dépendances verrouillées.
- Services de production compilés lancés sous **Node.js 24.21.0**, archive officielle vérifiée par son SHA-256, sans remplacer le Node de la machine.
- Application `http://127.0.0.1:3000`; Socket.IO `http://127.0.0.1:3001`.
- PostgreSQL **18.3**, base isolée `typulso` sur `127.0.0.1:55432`; aucune base existante modifiée. Cluster temporaire local, sans valeur d'hébergement durable.
- `.env.local` et `.env.test` ignorés par Git; identités générées uniquement pour la recette.

## Contrôles exécutés

| Contrôle | Résultat effectif |
|---|---|
| Migrations | Migration initiale appliquée à une base vide; nouvelle exécution sans duplication. |
| Formatage, lint et TypeScript | Réussis sur les sources du projet. Les documents historiques sont exclus du formatage automatique. |
| Tests unitaires | **53 réussis, 0 échec, 1 044 assertions**, après le correctif de réconciliation. Les tests de base sont volontairement ignorés dans cette commande. |
| Intégration réelle | **7 tests réussis, 0 échec, 60 assertions**, 18,98 s, contre PostgreSQL et les deux services compilés sous Node 24, avec le serveur web standalone final. |
| Build Next.js | Réussi : pages statiques, pré-rendues partiellement et routes dynamiques selon leurs accès runtime; aucun échec de pré-rendu. |
| Build du temps réel | Réussi; bundle Node du service Socket.IO démarré. |
| Docker Compose | `docker compose config --quiet` réussi. **Images et conteneurs non exécutés : Docker Desktop indisponible.** |
| Skill de développement | Validateur officiel du skill réussi dans son emplacement final. Skill général de design conservé et copie portable présente. |
| Liens documentaires | 345 références locales contrôlées, aucune cible manquante au contrôle du 3 octobre. |
| Tests navigateur automatiques | Scénarios Playwright créés, relus et typés; exécution locale automatique **non réalisée**. Exécution prévue dans la CI. |
| CI distante | Workflow GitHub Actions livré; **aucune exécution sur GitHub réalisée**. |

### Ce que l'intégration vérifie

Les tests [HTTP/Socket.IO](../tests/integration.test.ts) utilisent deux identités et connexions indépendantes : inscription et invité, contrôle d'origine, salle/code, droits de modification, état partagé, idempotence, départ commun, saisie validée, résultat persisté, transfert d'hôte, invitation unique et révocation à la déconnexion.

Les tests [PostgreSQL directs](../tests/backend.database.test.ts) vérifient les empreintes des sessions/tickets, le ticket à usage unique, l'interdiction de créer en invité, la création idempotente, l'admission pleine qui ne consomme pas l'invitation, la grâce de reconnexion et la consommation concurrente d'une invitation par un seul acteur.

Le moteur couvre notamment Unicode, erreurs/corrections, progression bloquante, score, génération, contraintes, bots variables et capacités arcade. Ces contrôles ne démontrent pas l'équilibrage avec des adolescents ou la charge à 30.

## Recette visuelle dans le navigateur

La recette a utilisé l'interface réellement rendue, avec navigation et frappe, sur les services locaux. Les comptes de test ont été créés pour cet environnement; aucun score fictif n'a été injecté dans l'interface.

| Parcours | Observation |
|---|---|
| Responsive | Largeurs CSS **1440, 1080, 900, 468, 390, 384 et 320 px** examinées; pas de débordement horizontal. Liens principaux d'au moins 44 px. |
| Navigation | Fond visible; bloc compact à 900/390 px; navigation 2 × 2 à 320 px. Espace sous le header cohérent avec les lignes nécessaires. |
| Entraînement local | Frappe de « Bonjour la bande » : 100 % de précision et 11 % de progression; vitesse mesurée depuis la frappe. Ce mode reste local au navigateur. |
| FR/EN et thème | Libellés et thèmes changent sans changer le texte français d'un exercice déjà commencé. |
| Création | Connexion locale, réglage d'une salle par code avec un bot et 30 s, prévisualisation réelle, création et état prêt parcourus. |
| Course et résultat | Départ de trois secondes, bot en progression, expiration, classement/heatmap et résultat visible dans le profil persisté observés. La frappe rapide du préfixe complet conserve tous ses caractères après le correctif : **100 % de précision, 17 % de progression**, puis erreur volontaire corrigée et progression à **21 % / 99 %**. Aucun écrasement par les instantanés précédents lors de cette nouvelle recette. Résultat final : **30 MPM, 99 %, une erreur et une correction**, retrouvé dans le profil avec les deux courses enregistrées. |

### Lisibilité : contrôle ciblé

Le contrôle de contraste a porté sur des groupes de texte visibles et des champs, avec calcul de la couleur composée sur leurs fonds unis. La zone de texte décorative `aria-hidden`, les gradients et tous les états d'interaction ne sont pas couverts par ce seul relevé.

| Vue à 390 px | Thème | Groupes contrôlés | Ratio minimal |
|---|---|---|---|
| Entraînement | Clair | 28 | 7,31:1 |
| Entraînement | Sombre | 28 | 8,11:1 |
| Création | Clair | 62 | 7,31:1 |
| Création | Sombre | 62 | 7,92:1 |
| Salon | Clair | 46 | 7,31:1 |
| Accueil à 1280 px | Clair | 38 | 7,31:1 |
| Accueil à 1280 px | Sombre | 38 | 7,92:1 |

Le focus clavier de l’action principale a été observé : contour visible de 3 px. La dernière vérification à 320 px confirme une largeur de document de 320 px, une navigation de 288 × 104 px en deux lignes et quatre liens de 44 px de haut. Le compte de recette a été déconnecté; l’accueil est laissé ouvert.

[Accueil clair](assets/app-v01/accueil.png) · [Accueil sombre](assets/app-v01/accueil-sombre.png) · [Écran de 320 px](assets/app-v01/mobile-320.png)

Ces relevés ciblés soutiennent la lisibilité observée; ils ne constituent pas une certification d'accessibilité. Focus clavier, tableaux, mouvement réduit et noms accessibles sont présents dans l'implémentation et demandent aussi une recette avec les appareils et technologies d'assistance ciblés.

## À vérifier avant et après publication

- **Lundi :** URL HTTPS valide, WSS, base durable, migrations, sauvegardes, deux navigateurs sur le site public, création/rejoindre par code, droits et reconnexion.
- **GitHub :** dépôt, commit, revue des sources à partager, clonage neuf, CI verte et deux liens réels de remise.
- **OAuth :** applications GitHub/Discord, secrets serveur et retours externes effectivement testés.
- **Produit final :** charge/latence avec 30 personnes, essais avec les 12–17 ans, équilibrage arcade, conservation/suppression des données et ergonomie tactile.
- **Marque :** Typulso reste un nom de travail; choix final et contribution humaine au nom/logo à documenter.

Le [guide de déploiement](19-deploiement.md) décrit les étapes et les limites de la première topologie. Une configuration livrée n'est pas présentée comme un service cloud déjà déployé.


## Ajustement de largeur · 4 octobre 2026

La demande concerne la présentation : utiliser davantage l'écran et agrandir les composants en conservant la direction artistique. Le cadre de 1 232 px et les limites de largeur des panneaux sont retirés. Les marges, boutons, champs, cartes et titres suivent une échelle commune. Les icônes des cartes colorées gardent leur encre sombre dans les deux thèmes.

| Mesure réelle sur l'accueil à 1 920 px | Avant | Après |
|---|---:|---:|
| Largeur extérieure du contenu | 1 232 px | 1 920 px |
| Début du contenu depuis le bord gauche | 376 px | 38,4 px |
| Taille du titre principal | 64 px | 96 px |
| Hauteur du bouton Rejoindre | 44 px | 56 px |
| Taille du code dans le champ | 16 px | 28 px |

- Accueil examiné à **2 560, 1 920, 1 440, 1 201, 1 150, 1 050, 900, 800, 540, 390 et 320 px** : largeur du document identique à celle du viewport; aucun débordement des éléments visibles du contenu et de l'en-tête.
- Entraînement, exercice démarré, préférences et connexion examinés à **1 920, 900, 390 et 320 px**. Les configurations d'entraînement et la connexion sont également observées à 1 150 px; la connexion à 800 px. La zone de course mesure **1 843 px** à 1 920 px et **358 px** à 390 px.
- À 1 150 px, la navigation occupe une ligne séparée de **509 × 66 px**, avec 12 px entre les deux lignes d'en-tête. À 320 px, les quatre liens de navigation restent dans une grille de **288 × 104 px**.
- Accueil examiné en clair et sombre; préférences en sombre à 320 px. Le focus clavier du lien principal conserve un contour bleu solide de **3 px**.
- Formatage, lint, TypeScript, compilation Next.js et compilation temps réel contrôlés. Les **53 tests unitaires** réussissent, avec **1 044 assertions**; les tests d'intégration ne sont pas réexécutés pour cette modification CSS.

[Accueil large clair](assets/app-v01/largeur-clair-1920.png) · [Accueil large sombre](assets/app-v01/largeur-sombre-1920.png) · [Accueil mobile](assets/app-v01/largeur-mobile-390.png)

La liste des courses est également examinée à 1 920, 900, 390 et 320 px dans son **état d'indisponibilité**. Pendant cette recette, PostgreSQL configuré sur `127.0.0.1:5432` refuse la connexion : le catalogue ne se charge pas et le build signale cette indisponibilité pendant certains pré-rendus, tout en réussissant sa compilation. Aucune nouvelle preuve de fonctionnement des comptes, salles ou données n'est déduite de ces contrôles visuels. Les captures de connexion ne sont pas livrées, pour éviter de publier des valeurs mémorisées dans le navigateur.


### Navigation centrée · 4 octobre 2026

L'en-tête utilise deux colonnes latérales symétriques autour d'une colonne de navigation. Le menu est centré sur l'écran, indépendamment de la largeur du logo et des commandes de compte. Les liens gardent leur fond et leurs dimensions existantes.

Mesures dans le navigateur à **1 920, 1 440, 1 280, 1 201, 1 200, 1 150, 900, 390 et 320 px** : écart entre le centre du menu et celui du viewport de **0 px**, aucune superposition avec le logo ou les commandes, aucune largeur de document supérieure au viewport. À 1 920 px, le centre est **960 px** en français comme en anglais. Le menu reste centré sur sa deuxième ligne aux formats intermédiaires et dans sa grille mobile.

[Capture de la navigation centrée](assets/app-v01/navigation-centree.png).


### Composition de l'accueil · 4 octobre 2026

Première version du rééquilibrage : le texte et la carte partagent la largeur disponible à parts égales. Les actions restent proches du paragraphe et les touches décoratives, plus grandes, occupent l'espace vers le centre à partir de 1 400 px. Cette version masquait l'illustration aux formats plus étroits; la correction suivante rétablit sa visibilité et limite la largeur de la carte. Les mesures et captures ci-dessous documentent cette première version.

- À **1 920 px**, les deux colonnes mesurent **902 px** et leur écart **38 px**. À **1 440 px**, elles mesurent **677 px**, séparées de **29 px**. Les deux actions restent sur la même ligne dans les deux langues à ces largeurs.
- Accueil examiné à **1 920, 1 440, 1 401, 1 399, 1 201, 1 200, 1 050, 900, 800, 390 et 320 px** : aucun débordement horizontal du document, actions contenues dans leur zone, navigation toujours centrée. À 390 px, texte et carte mesurent chacun **358 px**; à 320 px, **288 px**.
- Versions FR/EN et thèmes clair/sombre observés. La validation d'un code vide affiche son erreur dans la carte et conserve `aria-invalid`; le bouton Rejoindre garde son focus clavier visible et sa hauteur de **56 px** sur ordinateur.
- Formatage, lint, TypeScript, les **53 tests unitaires** (**1 044 assertions**) et les compilations Next.js/temps réel réussissent. Les tests avec PostgreSQL ne sont pas réexécutés pour cette modification de présentation; la limite de connexion à la base décrite plus haut reste applicable.

[Accueil rééquilibré](assets/app-v01/hero-equilibre.jpg) · [Thème sombre et focus clavier](assets/app-v01/hero-equilibre-sombre.jpg) · [Version mobile](assets/app-v01/hero-equilibre-mobile.jpg).


### Carte compacte et lettres sur mobile · 4 octobre 2026

La carte d'accueil est limitée à **640 px**, avec des marges intérieures de **24 à 36 px** et un titre plafonné à **40 px**. Les règles qui masquaient les lettres aux formats étroits sont supprimées pour cette illustration. Les lettres gardent leurs animations et passent à une taille compacte sous 1 400 px; à 390 et 320 px, leur scène mesure **210 px** de large et chaque touche **84 px** avant rotation. La réduction de mouvement reste traitée par la règle globale existante.

- Version anglaise examinée à **1 920, 1 440, 1 200, 1 050, 900, 800, 600, 540, 390 et 320 px** : lettres et scène visibles, animations `key-a` et `key-z` actives, aucun chevauchement avec la zone des actions ni débordement horizontal. La navigation reste centrée.
- Version française et thème sombre examinés à **1 920, 600, 390 et 320 px**. À 320 px, la validation du code vide et le focus clavier du bouton Rejoindre restent visibles, sans débordement.
- Largeur réelle de la carte : **640 px** à 1 920 et 1 440 px, **358 px** à 390 px et **288 px** à 320 px.
- Formatage, lint, TypeScript, les **53 tests unitaires** (**1 044 assertions**) et les compilations Next.js/temps réel réussissent. Les tests avec PostgreSQL ne sont pas réexécutés pour cette modification CSS; la limite de connexion à la base décrite plus haut reste applicable.

[Carte compacte sur ordinateur](assets/app-v01/carte-compacte.jpg) · [Lettres visibles sur mobile](assets/app-v01/carte-compacte-mobile.jpg).


### Décalage de la carte et longueur du paragraphe · 4 octobre 2026

La carte est centrée dans sa colonne pour la déplacer vers la droite en utilisant l'espace libre, tout en gardant son plafond de 640 px. Le paragraphe d'introduction est limité à **20 em**, sans saut de ligne forcé. Ce relevé précède le centrage de l'introduction sur les petits écrans documenté ci-dessous.

- À **1 920 px**, le bord gauche de la carte passe de **979 à 1 110 px**, soit un déplacement de **131 px**. À **1 440 px**, il se situe à **753 px**; le déplacement diminue naturellement lorsque la colonne offre moins d'espace.
- Sur ordinateur, le paragraphe mesure **420 px** et affiche trois lignes. La première ligne anglaise est exactement « Meet your group, challenge your friends ». À 900 px, sa limite mesure **340 px**; à 390 px, **300 px**. À 320 px, il occupe les **288 px** disponibles et passe à quatre lignes.
- Mesures dans le navigateur à **1 920, 1 440, 1 200, 900, 800, 540, 390 et 320 px** : largeur du document égale au viewport, navigation centrée et illustration des lettres visible. Mesures FR et sombre à **1 920, 900 et 390 px** : trois lignes pour le paragraphe et aucun débordement horizontal.
- Formatage, lint, TypeScript, les **53 tests unitaires** (**1 044 assertions**) et les compilations Next.js/temps réel réussissent. Les tests avec PostgreSQL ne sont pas réexécutés pour cette modification CSS; la limite de connexion à la base décrite plus haut reste applicable.

[Accueil avec texte limité et carte décalée](assets/app-v01/accueil-texte-limite.jpg).


### Introduction centrée lorsque la carte passe en dessous · 4 octobre 2026

À **800 px et moins**, l'introduction et son paragraphe occupent toute la largeur disponible. Le titre, le texte, les actions, les repères et les lettres sont centrés. Les lettres restent sous les actions, y compris sur tablette. La carte garde son plafond de 640 px et se centre sous l'introduction. Au-dessus de ce seuil, la composition à deux colonnes conserve le paragraphe limité et la carte décalée vers la droite.

| Largeur du viewport | Introduction et paragraphe | Écart au centre : boutons, repères, lettres et carte |
|---:|---:|---:|
| 800 px | 760 px | 0 px |
| 600 px | 560 px | 0 px |
| 390 px | 358 px | 0 px |
| 320 px | 288 px | 0 px |

Les mesures en anglais couvrent **1 920, 801, 800, 600, 390 et 320 px**. À 801 px, la carte reste à côté et le texte est aligné à gauche; à 800 px, la carte passe dessous et le texte se centre. Les mesures FR et sombre à **800, 390 et 320 px** confirment le centrage de tous les groupes, y compris lorsque les actions se répartissent sur plusieurs lignes. Aucun débordement horizontal du document n'est relevé.

Formatage, lint, TypeScript, les **53 tests unitaires** (**1 044 assertions**) et les compilations Next.js/temps réel réussissent. Les tests avec PostgreSQL ne sont pas réexécutés pour cette modification CSS; la limite de connexion à la base décrite plus haut reste applicable.

[Introduction centrée sur mobile](assets/app-v01/introduction-centree-mobile.jpg).


### Titres en gras · 4 octobre 2026

Les titres de page et de carte partagent la graisse **700** de Space Grotesk. Les styles calculés dans le navigateur confirment cette graisse pour les cinq titres de l'accueil. Vérification EN à **1 920, 900, 800, 390 et 320 px**, puis FR et sombre à **390 et 320 px** : aucun débordement horizontal, centrage mobile conservé et lettres toujours visibles.

Formatage, lint, TypeScript, **53 tests unitaires** (**1 044 assertions**) et compilations Next.js/temps réel réussissent. Les tests PostgreSQL restent hors de cette vérification CSS; la limite de connexion décrite plus haut demeure applicable.

[Accueil avec titres en gras](assets/app-v01/titres-gras.jpg).


### Lettres plus expressives · 4 octobre 2026

Rebonds amplifiés, rotations et léger changement d’échelle, sur deux cycles de **3,2 / 3,8 secondes**. Les déplacements en pourcentage suivent la taille des touches. Styles calculés observés à **1 920, 900, 390 et 320 px** : animations actives, matrices de transformation différentes au cours du mouvement et aucun débordement horizontal. Rendu examiné en clair sur ordinateur et sombre sur mobile.

Le réglage **Réduire les animations** est activé pour vérification : les deux animations passent à `none` et les lettres restent visibles. Le réglage initial est ensuite rétabli. Formatage, lint, TypeScript, **53 tests unitaires** (**1 044 assertions**) et compilations Next.js/temps réel réussissent; les vérifications PostgreSQL ne sont pas réexécutées pour cette modification CSS.

[Capture d’une phase du rebond](assets/app-v01/lettres-expressives.jpg). La capture fixe documente la disposition; le mouvement s’observe dans l’aperçu local.


### Écart régulier entre les lettres · 4 octobre 2026

Les positions des touches suivent un écart de base fixe de **72 px**, avec une scène dimensionnée à partir de leurs tailles. Elles ne sont plus ancrées aux deux bords d’une colonne de largeur variable. La grille réserve la largeur de la scène sur ordinateur, tout en conservant les tailles des touches et les rebonds amplifiés. La distance visuelle varie naturellement pendant les rotations; l’écart de mise en page reste identique entre les formats.

Mesures EN à **1 920, 1 440, 1 400, 1 399, 900, 800, 390 et 320 px** : écart calculé de **72 px** (écart d’arrondi inférieur à 0,01 px), touches séparées dans les phases observées, aucun débordement horizontal. Vérification FR et sombre à **1 400, 900 et 320 px** : aucun chevauchement avec les actions. Formatage, lint, TypeScript, **53 tests unitaires** (**1 044 assertions**) et compilations Next.js/temps réel réussissent après cette correction; les tests PostgreSQL restent hors de cette vérification CSS.

[Espacement sur ordinateur](assets/app-v01/lettres-espace-regulier.jpg) · [Espacement sur mobile](assets/app-v01/lettres-espace-mobile.jpg).


### Couleurs initiales rétablies · 4 octobre 2026

Les essais de texte blanc sur violet sont annulés à la demande de l’utilisateur. Les surfaces lavande retrouvent le texte encre `#171C2B` et leur fond initial `#BBA3FF` dans les deux thèmes. Les tokens et règles ajoutés pour les premiers plans blancs, ainsi que les adaptations d’avatars et de vignettes correspondantes, sont retirés. La direction artistique et les instructions du projet retrouvent la règle d’origine.

Styles calculés confirmés sur l’accueil anglais à **1 920 px**, en clair et en sombre : lavande d’origine et textes sombres sur le titre, les instructions et le sticker. Le bouton citron reste identique. Aucun débordement horizontal relevé à **1 920, 900 et 390 px**. Les rapports d’essais de blanc sur violet sont retirés de ce document pour conserver la référence actuelle.

[Capture de la palette initiale rétablie](assets/app-v01/couleurs-initiales-retablies.jpg).


### Footer composé · 4 octobre 2026

Panneau arrondi avec identité Typulso, trois destinations illustrées et retour vers les courses publiques. La palette initiale est conservée. L’identité et les liens utilisent les surfaces de leur thème; seuls les pictogrammes et l’action finale emploient les accents expressifs.

- Rendu observé sur l’accueil anglais sombre et français clair à **1 920 px**. Focus clavier confirmé sur le lien des préférences : contour bleu de 3 px, sans découpe par le panneau.
- Mesures françaises claires à **1 101, 1 100, 900, 701, 700, 390 et 320 px** : aucun débordement horizontal du document ou des liens. À 390 px, les lignes de navigation mesurent **88 px**; à 320 px, la hauteur augmente avec le texte. La composition à trois colonnes passe à une colonne sous 700 px.
- Le lien « Comment jouer » ouvre la route `/aide`, dont le titre et le contenu sont observés. Les trois autres destinations utilisent les routes existantes `/touches`, `/preferences` et `/courses`; leur URL est vérifiée dans le composant. Ce passage ne constitue pas une preuve de fonctionnement de PostgreSQL.
- `bun run check` réussit : formatage, lint, TypeScript, **53 tests** (**1 044 assertions**), builds Next.js et temps réel. **9 tests avec base sont ignorés**; les deux avertissements PostgreSQL local indisponible restent présents pendant le build, qui termine avec succès.

[Footer clair](assets/app-v01/footer-clair.jpg) · [Footer sombre avec focus](assets/app-v01/footer-sombre.jpg) · [Liens sur mobile](assets/app-v01/footer-mobile.jpg).

### Footer et piste au centre · 4 octobre 2026

Cette itération intègre les premières pistes de la [recherche ciblée](21-recherche-footer-et-jeu.md) : signature et groupes de liens du footer, bande de mesures compacte, frappe centrale, commandes arcade sous la saisie et lignes de joueurs stables. Le bilan personnel et les prochaines destinations précèdent désormais le podium. La palette initiale, les règles de course et l’autorité des résultats serveur sont conservées.

| Parcours local observé | Preuve de cette itération |
|---|---|
| Footer complet | Clair FR à **1 536, 900, 390 et 320 px**, sombre EN à **1 536 px**; largeur du document égale au viewport aux formats mesurés. Les liens mesurent au moins **44 px**, l’action **52 px** et le focus clavier **3 px**. Le lien d’aide clavier ouvre sa destination. |
| Échauffement | Clair FR à **1 536 et 900 px**, sombre FR à **390 px**. Frappe réelle puis deux corrections : « Bonjour la bande », **94 % de précision / 11 % de progression**. Focus visible. |
| Salle arcade réelle | Compte local de recette, invité indépendant et un bot, avec PostgreSQL et Socket.IO : départ commun, saisie et pistes observés. L’ordre des lignes reste stable malgré l’évolution des positions. Rendu clair à **1 536 et 390 px**, sans débordement horizontal mesuré. |
| Capacité et correction | À **100 d’énergie** avec un déficit d’au moins 5 points, Accélération est activée; l’énergie passe à 0 et les deux boutons deviennent indisponibles. Une erreur est ensuite corrigée avec Retour arrière et le texte est terminé. |
| Résultats | Bilan personnel avant podium vérifié. Rang officiel **3**, **26 MPM, 99 %, une erreur et une correction**, également retrouvé dans le profil persistant. Clair à **1 536 px**, sombre EN à **900, 390 et 320 px**, sans débordement horizontal mesuré. Le compte de recette est déconnecté à la fin. |

La vérification finale `bun run check` réussit : formatage, lint, TypeScript, **53 tests unitaires** (**1 044 assertions**) et compilations Next.js/temps réel; **9 tests PostgreSQL sont ignorés dans la commande unitaire**. L’intégration est relancée ensemble avec PostgreSQL sur `127.0.0.1:5432` : **7 tests réussis, 0 échec, 60 assertions**, environ 19 s. Un premier essai utilisait encore l’ancien port `55432` dans l’environnement du terminal et faisait échouer les quatre tests directs de base; la relance explicite sur `5432` corrige cet écart de configuration. Les preuves historiques ci-dessus restent celles de leur environnement d’origine.

La règle CSS du mode concentration qui masque le footer est conservée dans le code; son activation n’est pas exercée pendant cette recette. Cette itération n’ajoute pas de preuve visuelle de perte réseau, de reconnexion ou de parcours spectateur, ni de preuve de production. Aucun classement ou score fictif n’est injecté.

Seules des captures neutres de footer et d’échauffement sont livrées, sans identités de recette : [footer clair](assets/app-v01/footer-refresh-clair.jpg), [footer sombre](assets/app-v01/footer-refresh-sombre.jpg), [footer mobile](assets/app-v01/footer-refresh-mobile.jpg) et [échauffement](assets/app-v01/jeu-refresh-clair.jpg).



### Footer complet sur Practice · 4 octobre 2026

Le choix de variante est corrigé à la demande de l’utilisateur : `/entrainement` affiche le même footer complet que les pages ordinaires, y compris pendant l’échauffement. La variante compacte reste réservée aux salles. Le rendu est observé en anglais sombre à **1 536 px**, puis à **900 px** et en anglais clair à **390 px**; aucune largeur du document supérieure au viewport sur les formats mesurés. `bun run check` réussit : formatage, lint, TypeScript, **53 tests unitaires** et compilations Next.js/temps réel. Les tests PostgreSQL ne sont pas relancés pour ce changement de sélection visuelle.

[Footer complet de Practice](assets/app-v01/practice-footer-complet.jpg).


### Dialogues centrés et espacés · 4 octobre 2026

La remise à zéro des marges de Tailwind plaçait les dialogues au bord du viewport. Le style partagé rétablit `margin: auto` et réserve 16 à 32 px sur chaque côté. Le dialogue « Your people & roles » est ouvert dans une vraie salle locale; les règles de salle servent à vérifier le défilement d’un contenu long. Aucune règle n’est enregistrée pendant cette recette.

| Viewport CSS | Dialogue observé | Résultat |
|---|---|---|
| 1 066 × 750 px | Participants · sombre | Largeur 540 px, centré; aucun débordement interne horizontal. |
| 659 × 743 px | Participants · clair | Largeur 540 px, marges latérales 59,5 px; centré verticalement. |
| 390 × 844 px | Participants · clair | Marges latérales 16 px; titre et fermeture restent dans le panneau. |
| 320 × 500 px | Participants puis règles · clair | Marges latérales 16 px; le formulaire long conserve aussi 16 px en haut et en bas et défile à l’intérieur. |
| 844 × 390 px | Règles · clair | Largeur 540 px, marges verticales d’environ 25,3 px; défilement interne sans débordement horizontal. |

Échap ferme les dialogues et rend le focus au bouton qui les ouvre. `bun run check` réussit : formatage, lint, TypeScript, **53 tests unitaires** (**1 044 assertions**) et compilations Next.js/temps réel. Les **9 tests PostgreSQL sont ignorés dans la commande unitaire**; ils ne sont pas relancés pour cette correction CSS. Le compte local de recette est déconnecté et l’aperçu revient à l’entraînement après les vérifications.
