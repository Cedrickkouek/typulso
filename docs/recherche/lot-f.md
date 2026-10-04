# Lot F — composants soignés et systèmes d’interface

> Recherche complémentaire du **1er octobre 2026** · **17 nouvelles identités de sites effectivement ouvertes** · React, Next.js, Tailwind CSS et qualité des composants · aucune dépendance choisie ou installée.

Ce lot étudie le soin apporté aux états, à la composition et aux interactions. Il complète les inspirations de marque et de jeu : une personnalité colorée, vibrante, amusante et ludique peut s’appuyer sur des contrôles précis et prévisibles.

Les preuves ci-dessous proviennent des **pages finales officielles ouvertes et de leur contenu textuel/code extrait**. Ce relevé ne constitue pas une observation des pixels, des couleurs réellement rendues, des animations en mouvement ou de la navigation au clavier. Les personnalités indiquées sont des **interprétations du positionnement et de la documentation**, pas des évaluations visuelles. Les formulations d’accessibilité des éditeurs sont rapportées comme leurs engagements ; elles ne certifient pas notre future application.

Chaque identité compte une fois : Untitled UI Figma/React, les documents d’un même système, les redirections et les exemples ne créent pas de sites supplémentaires. Les documentations React/Next/Tailwind de fin de page constituent des vérifications techniques, sans augmenter le total de ce lot. Aucun des 17 sites retenus n’appartient aux lots A–C ni aux références Kahoot, Wooclap et Monkeytype.

## Registre des visites

| ID | Site / page finale officielle | Date de visite | Preuve du contenu accessible | Personnalité interprétée / intérêt |
|---|---|---|---|---|
| F01 | [shadcn/ui](https://ui.shadcn.com/) | 2026-10-01 | Démonstrations de boutons, dialogues et formulaires ; documentation proposant plusieurs bases de composants. | Modulaire et précis : personnaliser une base cohérente. |
| F02 | [Radix UI](https://www.radix-ui.com/) | 2026-10-01 | Catalogue Themes/Primitives ; guide explicite de labels, focus et navigation clavier. | Structuré : le comportement fait partie de la finition. |
| F03 | [Headless UI](https://headlessui.com/) | 2026-10-01 | Catalogue React ; Dialog, Tabs et formulaires ; exemples avec classes Tailwind. | Discret et adaptable : conserver notre propre expression. |
| F04 | [React Aria](https://react-aria.adobe.com/) | 2026-10-01 | Composition de champs ; exemples Tailwind avec états ; paragraphes clavier, tactile et gestion du focus. | Méticuleux : adapter l’interaction au mode d’entrée. |
| F05 | [Mantine](https://mantine.dev/) | 2026-10-01 | Exemples de champs, combobox, hooks et thèmes ; guide Next.js accessible. | Complet : prévoir les cas ordinaires et les erreurs. |
| F06 | [Chakra UI](https://chakra-ui.com/) | 2026-10-01 | Tokens, typographie et recipes ; documentation Button avec tailles, chargement et largeur stable. | Systémique : faire évoluer les variantes ensemble. |
| F07 | [HeroUI](https://heroui.com/) | 2026-10-01 | Démonstrations et documentation React Aria/Tailwind ; Button documente les états interactifs. | Soigné et adaptable : rendre les états explicites. |
| F08 | [daisyUI](https://daisyui.com/) | 2026-10-01 | Classes sémantiques, couleurs de contenu et thèmes nommés ; composants CSS. | Expressif : thème joyeux et rôles de couleurs séparés. |
| F09 | [Flowbite React](https://flowbite-react.com/) | 2026-10-01 | Catalogue React/Tailwind, dark mode et theming ; guide Next.js avec gestion du thème avant hydratation. | Pratique : cohérence entre les écrans et les modes. |
| F10 | [Motion](https://motion.dev/) | 2026-10-01 | Documentation React des gestes, transitions de layout et adaptation au mouvement réduit. | Réactif : mouvement guidé par l’action. |
| F11 | [Aceternity UI](https://ui.aceternity.com/) | 2026-10-01 | Catalogue React/Tailwind/Motion ; page Card Hover Effect avec exemple et propriétés. | Démonstratif : explorer une expression ponctuelle. |
| F12 | [Magic UI](https://magicui.design/) | 2026-10-01 | Bibliothèque d’effets React/Tailwind ; Number Ticker documente valeur finale, départ et délai. | Ludique : réserver l’animation à des moments lisibles. |
| F13 | [Untitled UI](https://www.untitledui.com/) | 2026-10-01 | Présentation Figma/React ; page React détaillant Tailwind, React Aria, variables et starter Next.js. | Cohérent : relier composants, tokens et iconographie. |
| F14 | [Base UI](https://base-ui.com/) | 2026-10-01 | Bibliothèque React sans styles ; Dialog détaille anatomie, état contrôlé et focus personnalisé. | Sobre et exigeant : séparer comportement et apparence. |
| F15 | [IBM Carbon](https://www.carbondesignsystem.com/) | 2026-10-01 | Fondations/composants/patterns ; guide Button avec niveaux d’importance et libellés d’action. | Structuré : repère utile de hiérarchie et de précision. |
| F16 | [Shopify Polaris](https://shopify.dev/docs/api/polaris) | 2026-10-01 | Page officielle par surfaces, documentant le framework actuel de web components. | Opérationnel : continuité et limites explicites du système. |
| F17 | [PrimeReact](https://primereact.dev/) | 2026-10-01 | Démonstration de tableau de bord ; couches Styled/Tailwind/Primitive/Headless ; tokens et focus documentés. | Dense et adaptable : une même logique, plusieurs habillages. |

## Observations applicables et limites

### F01 · shadcn/ui — composer une base que l’on maîtrise

**Preuve complémentaire :** [Dialog](https://ui.shadcn.com/docs/components/base/dialog), effectivement ouvert après redirection, décrit titre, description, contenu et actions séparés ; il propose Base UI, React Aria et Radix. Ne pas supposer que tout le catalogue repose obligatoirement sur un seul moteur.

**Application proposée :** faire de `Button`, `Field`, `Dialog`, `Badge` et `Tabs` une petite base partagée ; y raccorder nos tokens et états. Le salon, la configuration et les résultats doivent employer les mêmes règles de taille et de hiérarchie.

**Couleur/mouvement/layout :** la personnalisation et l’anatomie sont documentées ; les pixels et transitions restent à observer. Copier un exemple ne démontre pas les contrastes, le focus ou l’adaptation mobile de notre version.

### F02 · Radix UI — soigner le comportement autant que le contour

**Preuve complémentaire :** [Accessibility](https://www.radix-ui.com/primitives/docs/overview/accessibility), effectivement ouvert, explique les rôles ARIA, les noms accessibles et le déplacement du focus ; son exemple d’alerte place le focus sur l’annulation.

**Application proposée :** pour quitter une course, prévoir un retour sûr vers l’action d’origine ; pour rejoindre un salon, nommer le champ et les actions explicitement. Les onglets de paramètres doivent fonctionner au clavier.

**Couleur/mouvement/layout :** intérêt principal comportemental. Une primitive n’impose ni nos couleurs ni le placement de nos blocs. Son usage ne dispense pas de fournir les labels et de vérifier l’interface intégrée.

### F03 · Headless UI — donner notre personnalité aux contrôles

**Preuve complémentaire :** [Dialog](https://headlessui.com/react/dialog), effectivement ouvert, documente `DialogPanel`, titre, description, fond, défilement et focus initial ; le contenu extérieur devient inerte pendant l’ouverture.

**Application proposée :** une modale courte pour rejoindre une salle, avec code et message de validation ; un panneau de règles qui reste lisible sur petit écran. Le style citron/rose/lavande peut être conservé sans réécrire le mécanisme de focus.

**Couleur/mouvement/layout :** exemples Tailwind lus, pas rendus. Les choix de fond, marge, contraste et animation sont à définir. La documentation du système ne prouve pas que notre modale future restitue correctement le focus dans tous ses parcours.

### F04 · React Aria — traiter le clavier et le tactile avec précision

**Preuve :** la page ouverte expose du code Tailwind pour un combobox, des attributs d’état et des textes sur les gestes tactiles, les survols à la souris et la restauration du focus.

**Application proposée :** un sélecteur de langue et de difficulté possédant sélection, focus et désactivation reconnaissables ; une erreur de code reliée au champ ; des noms accessibles pour les boutons à icône.

**Couleur/mouvement/layout :** états documentés, rendu non inspecté. La réaction tactile et le focus devront être testés réellement. Les gestes avancés du catalogue n’impliquent pas d’ajouter du drag-and-drop ou de la multisélection au jeu.

### F05 · Mantine — prévoir les cas ordinaires et les variantes

**Preuve complémentaire :** [Usage with Next.js](https://mantine.dev/guides/next/), effectivement ouvert, distingue les composants nécessitant le contexte client et les formes d’import de composants composés. La page d’accueil décrit des champs, combobox et hooks.

**Application proposée :** préciser les états des formulaires, les aides, la validation et les tailles de contrôle avant l’intégration. Garder la densité des paramètres calme, même si le salon est expressif.

**Couleur/mouvement/layout :** thèmes et Styles API documentés ; aucune inspection visuelle ici. Mantine fournit son propre système de styles : sa présence dans ce corpus ne justifie pas son ajout à côté d’autres kits complets.

### F06 · Chakra UI — organiser les variantes comme un système

**Preuve complémentaire :** [Button](https://chakra-ui.com/docs/components/button), effectivement ouvert, documente variants, taille, `loadingText`, spinner et un exemple de chargement conservant la largeur du bouton.

**Application proposée :** une action « Créer une salle » garde sa place lorsqu’elle devient « Création… » ; « Prêt » possède un état sélectionné, et non un simple changement de couleur. Les recettes de composants doivent partager hauteur, rayon et espacements.

**Couleur/mouvement/layout :** propriétés et recettes lues, pas pixels observés. Les palettes de l’éditeur ne remplacent pas notre palette. Les garanties devront être évaluées dans la version effectivement retenue.

### F07 · HeroUI — formaliser les états qui donnent de la finition

**Preuve complémentaire :** [Button](https://heroui.com/en/docs/react/components/button), effectivement ouvert, distingue survol, pression, focus visible, désactivation et attente via pseudo-classes ou attributs.

**Application proposée :** un bouton réagit à la pression, affiche son focus, reste stable pendant une requête et distingue l’indisponibilité de l’attente. L’icône accompagne un libellé clair lorsqu’il existe de l’espace.

**Couleur/mouvement/layout :** comportement décrit, rendu non vérifié. HeroUI combine actuellement React Aria et Tailwind pour le web ; ce fait sert à la comparaison, sans sélection de package. Les effets de ripple restent une option esthétique à tester.

### F08 · daisyUI — séparer couleur expressive et couleur de contenu

**Preuve :** la page ouverte présente des rôles sémantiques distincts, dont contenu sur accent et contenu sur base, ainsi que des thèmes nommés tels que cupcake, valentine et lemonade.

**Application proposée :** adopter le principe de paires fond/texte explicites : citron avec encre, rose avec encre, surfaces avec texte principal et secondaire. Les variantes d’un bouton gardent le même squelette.

**Couleur/mouvement/layout :** noms de thèmes et exemple de code lus ; leur rendu n’a pas été observé. Le catalogue repose sur le CSS : l’apparence d’une modale ou d’un menu ne garantit pas à elle seule les comportements clavier et focus attendus.

### F09 · Flowbite React — rendre les modes cohérents dès le chargement

**Preuve complémentaire :** [Use with Next.js](https://flowbite-react.com/docs/guides/nextjs), effectivement ouvert, décrit l’intégration App Router et un script de thème destiné à éviter le clignotement avant hydratation.

**Application proposée :** le mode clair/sombre doit être cohérent dès la première image, puis conserver les mêmes rôles de badge, champ et bouton. Le chargement d’un salon doit posséder un état explicite.

**Couleur/mouvement/layout :** dark mode et theming documentés ; aucun contraste mesuré sur ce site. La racine `flowbite.com` a renvoyé 403 ; seule la branche officielle React accessible est comptée, une fois pour Flowbite.

### F10 · Motion — faire suivre le mouvement à l’intention

**Preuve complémentaire :** [useReducedMotion](https://motion.dev/docs/react-use-reduced-motion), effectivement ouvert, explique comment adapter ou supprimer les déplacements selon la préférence du système.

**Application proposée :** réserver une brève réaction à la pression, l’entrée d’un participant ou l’apparition des résultats. Pendant la saisie, le texte et le curseur restent immédiatement lisibles ; la valeur réelle ne doit pas attendre une animation.

**Couleur/mouvement/layout :** API de mouvement lue, animations non observées. Prévoir une variante à mouvement réduit et vérifier la fluidité sur une machine modeste. La présence de Motion dans le corpus ne rend pas nécessaire une bibliothèque pour chaque micro-interaction CSS.

### F11 · Aceternity UI — sélectionner un effet qui sert la lecture

**Preuve complémentaire :** [Card Hover Effect](https://ui.aceternity.com/components/card-hover-effect), effectivement ouvert, décrit un effet glissant entre cartes survolées et expose titre, description et lien.

**Application proposée :** explorer une indication de carte sélectionnée dans le choix d’un mode ou d’un personnage, en conservant l’action au clavier et au toucher. Une illustration de touche peut exprimer le jeu dans l’accueil ou le salon.

**Couleur/mouvement/layout :** effet décrit dans la documentation, pas vu en mouvement. Le catalogue cible surtout les landing pages ; parallax, pointeurs suiveurs et décors ne sont pas proposés pour la zone de frappe. Une carte sélectionnée doit rester reconnaissable sans survol.

### F12 · Magic UI — animer le résultat sans retarder l’information

**Preuve complémentaire :** [Number Ticker](https://magicui.design/docs/components/number-ticker), effectivement ouvert, documente valeur finale, valeur de départ, décimales et délai.

**Application proposée :** étudier une animation de score à l’arrivée, avec valeur finale immédiatement disponible sous forme textuelle et version sans mouvement. Éviter un compteur animé sur les mesures utilisées pour suivre la course en direct.

**Couleur/mouvement/layout :** catalogue et API consultés, pas animations rendues. Les effets servent de pistes ponctuelles ; ils ne constituent pas une base complète de formulaires, dialogues ou gestion du focus.

### F13 · Untitled UI — relier les variantes et l’iconographie

**Preuve complémentaire :** [Untitled UI React](https://www.untitledui.com/react), effectivement ouvert, décrit une base React Aria/Tailwind, des variables de mode sombre et un starter Next.js. Figma et React restent une seule identité dans ce lot.

**Application proposée :** définir une convention d’icônes, des tailles cohérentes et des variantes communes aux champs, badges et cartes. Une icône, son texte et son état doivent exprimer la même action.

**Couleur/mouvement/layout :** cohérence revendiquée et mécanismes documentés, pas audit visuel. Le ton du kit ne doit pas remplacer notre personnalité ludique ; les composants gratuits et les ensembles payants doivent être distingués si une intégration est envisagée.

### F14 · Base UI — séparer mécanique et habillage

**Preuve complémentaire :** [Dialog](https://base-ui.com/react/components/dialog), effectivement ouvert, détaille les parties du composant, état contrôlé, fermeture et focus personnalisé. La page d’accueil confirme l’absence de CSS imposé et la possibilité d’utiliser Tailwind.

**Application proposée :** garder l’état métier du salon et de la course en dehors des composants décoratifs ; donner à une modale un titre, une description, une fermeture et un retour de focus précis.

**Couleur/mouvement/layout :** anatomie/API lues, pas rendu évalué. Ne pas ajouter des dialogues imbriqués ou des gestes simplement parce qu’ils existent dans la documentation. Le composant futur doit rester simple pour notre parcours.

### F15 · Carbon — clarifier la priorité des actions

**Preuve complémentaire :** [Button usage](https://carbondesignsystem.com/components/button/usage/), effectivement ouvert, distingue actions principales, auxiliaires et dangereuses ; il explique les libellés d’action et le chargement.

**Application proposée :** faire ressortir l’action pertinente du salon, « Démarrer la course » pour l’hôte ou « Je suis prêt » pour un participant. « Quitter » possède un poids différent et une conséquence lisible. Le soin vient aussi des libellés et de la hiérarchie.

**Couleur/mouvement/layout :** guide textuel consulté, pas audit de palette. Cette référence plus opérationnelle sert de contraste utile dans la recherche ; ses règles de marque, d’alignement et de densité ne sont pas importées comme exigences du jeu.

### F16 · Polaris — maintenir la continuité sans ignorer le contexte

**Preuve :** `polaris.shopify.com` redirige vers la page officielle [Polaris references](https://shopify.dev/docs/api/polaris), effectivement ouverte. Elle décrit des composants disponibles selon les surfaces Shopify et le framework actuel fondé sur les web components.

**Application proposée :** garder un vocabulaire et des états cohérents entre création, attente et résultats ; documenter où chaque composant peut être utilisé et ce qu’il fait.

**Couleur/mouvement/layout :** structure des références lue, pas interface finale rendue. Polaris concerne les surfaces de Shopify ; il constitue ici une référence de système et de continuité. Ce relevé ne propose pas d’en faire notre bibliothèque React/Tailwind indépendante.

### F17 · PrimeReact — choisir le niveau d’abstraction utile

**Preuve :** `primereact.org` redirige vers [primereact.dev](https://primereact.dev/), effectivement ouvert. La page expose couches Styled/Tailwind/Primitive/Headless, tokens et documentation de navigation clavier/focus.

**Application proposée :** comparer une base sans styles à un kit habillé sur un véritable formulaire et une modale ; observer le coût de personnalisation avant de choisir. Le classement pourrait adopter une structure claire de données tout en gardant des repères de joueurs expressifs.

**Couleur/mouvement/layout :** démonstration et code extraits, pas pixels vérifiés. Le tableau de bord financier n’est pas un modèle visuel à reproduire. Vérifier les API et la compatibilité de la version retenue avant l’intégration.

## Traduction proposée dans nos composants

Ces décisions sont des **propositions issues de la recherche**, à confronter aux parcours et au prototype.

| Composant / situation | Finition attendue | Références consultées |
|---|---|---|
| Bouton d’action | Tailles cohérentes, focus visible, réaction à la pression, état d’attente avec libellé et largeur stable. | F06, F07, F15 |
| Champ de code / pseudo | Label persistant, aide reliée au champ, erreur explicite, placeholder lisible, même structure sur mobile. | F04, F05, F09 |
| Modale de rejoindre / quitter | Titre et description, focus initial adapté à l’intention, clavier contenu, fermeture compréhensible, restauration du focus. | F01, F02, F03, F14 |
| Choix de langue / difficulté | Valeur sélectionnée reconnaissable, navigation clavier, états indisponibles expliqués. | F03, F04, F05 |
| Carte de participant | Avatar, pseudo, présence et statut textuels ; le même état est visible sans dépendre du survol ou d’une seule couleur. | F07, F08, F11 |
| Badge et repère de progression | Paire fond/texte contextuelle, forme ou libellé complémentaire, alignement stable. | F08, F13, F17 |
| Zone de frappe | Saisie immédiate ; mise à jour synchrone ; décoration indépendante du texte et du caret. | React officiel, F10 |
| Résultat et célébration | Valeur finale lisible, animation brève facultative et variante à mouvement réduit. | F10, F12 |
| Modes clair / sombre | Tokens sémantiques communs, chargement cohérent et contrastes vérifiés dans les deux modes. | F08, F09, F13 |

Le standing recherché doit être vérifiable dans **une planche de composants montrant leurs états**, puis dans les parcours complets. La sélection d’une base comportementale ou d’un kit intervient après cette comparaison ; empiler plusieurs bibliothèques complètes ne résout pas la cohérence de l’interface.

## Vérifications officielles de la future stack

Ces pages ont été ouvertes le 2026-10-01 et sont **hors du décompte des 17 identités**.

- [React — input](https://react.dev/reference/react-dom/components/input) : un champ contrôlé exige une mise à jour synchrone de sa valeur ; la documentation explique labels, caret et réduction des rerenders. Proposition pour le jeu : isoler l’état de saisie, conserver la valeur saisie brute et calculer son affichage sans transformation qui déplace le caret.
- [Next.js — Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) : placer la frontière client près des composants interactifs réduit le JavaScript envoyé. Proposition : composants client pour saisie, états de salon et contrôles interactifs ; vérifier la compatibilité de la base choisie avant de concevoir les providers.
- [Tailwind CSS — Hover, focus, and other states](https://tailwindcss.com/docs/hover-focus-and-other-states) : variantes de focus, pression, désactivation et attributs d’état. Proposition : les utiliser pour exprimer des règles communes, sans supprimer un indicateur de focus sans remplacement.
- [Mantine — Next.js](https://mantine.dev/guides/next/) et [Flowbite React — Next.js](https://flowbite-react.com/docs/guides/nextjs) : exemples officiels utiles pour comparer les contraintes de contexte client et d’hydratation. Ces guides ne valent pas décision d’intégration.

## Sélection pour une prochaine inspection visuelle

Le relevé de ce lot demeure textuel. Pour examiner réellement le soin des composants, les pages officielles suivantes offrent des points d’observation précis :

| Page | Manipulation à observer | Ce que l’observation devra confirmer |
|---|---|---|
| [shadcn/ui Dialog](https://ui.shadcn.com/docs/components/base/dialog) | Ouvrir, parcourir au clavier, fermer. | Hiérarchie du contenu, espace des actions, focus et retour à l’origine. |
| [Headless UI Dialog](https://headlessui.com/react/dialog) | Comparer code et preview ; tester Tab/Escape. | Composition libre et comportement de la modale. |
| [HeroUI Button](https://heroui.com/en/docs/react/components/button) | Comparer normal, pression, chargement et désactivation. | Densité, silhouette, lisibilité et stabilité. |
| [React Aria](https://react-aria.adobe.com/) | Essayer les champs et la navigation sans souris. | Sélection, feedback et continuité du focus. |
| [daisyUI](https://daisyui.com/) | Comparer thèmes et composants, puis réduire la largeur. | Cohérence des paires fond/contenu ; limites des styles seuls. |
| [Magic UI Number Ticker](https://magicui.design/docs/components/number-ticker) | Observer l’arrivée à la valeur et le mode sans mouvement. | Valeur finale lisible et animation non gênante. |

## Limites et exclusions du relevé

- **17 pages finales officielles accessibles retenues**, avec approfondissements sur leurs propres documentations. Aucun résultat de recherche ou simple vignette de galerie n’est compté.
- **0 observation visuelle rendue effectuée par l’auteur de ce lot**. Les captures ou manipulations réalisées ailleurs doivent être consignées séparément, avec leur propre contexte.
- `flowbite.com` : réponse 403 ; remplacé dans le relevé par la branche officielle `flowbite-react.com`, accessible et reliée à l’écosystème Flowbite.
- [Park UI](https://park-ui.com/) a été ouvert, mais **exclu du total** pour éviter de multiplier les entrées d’une même famille : son site annonce actuellement le rapprochement avec Chakra et affiche Chakra Systems. PrimeReact fournit la 17e identité retenue.
- Les bibliothèques et documentations ne constituent pas des choix définitifs de packages, de versions ou d’hébergement. Aucune installation, aucun achat et aucune création de compte n’a été effectuée.
- L’identité propre du projet — nom, logo, palette, typographies et tone of voice — reste à concevoir et valider avec l’équipe. Les marques, templates et actifs de ces références ne sont pas reproduits.
