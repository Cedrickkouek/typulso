# Composants d’interface

> **Lecture actuelle · 7 octobre 2026 :** ce document conserve la conception ou les observations à leur date. L’état du code et des choix implémentés figure dans [18](18-implementation.md); les procédures utilisables dans [19](19-deploiement.md); les preuves locales, CI et Railway dans [CP1](08-plan-checkpoint.md) et la synthèse de [20](20-verification-implementation.md). Une maquette ou un test prévu ne constitue pas une preuve de production.

> **Statut : catalogue initial du 1er octobre 2026, complété par les intégrations du 4 octobre.** Les comportements proposés ci-dessous restent des critères de réalisation et de vérification. Les sections d’intégration et le [rapport d’implémentation](18-implementation.md) précisent ce qui existe dans l’application React.

Cette bibliothèque donne à Typulso — nom de travail — une identité accueillante : des surfaces calmes pour lire et taper, des accents francs pour agir, des détails de touches de clavier pour reconnaître la marque. Les composants suivent les [parcours utilisateur](04-experience-utilisateur.md), l’[architecture prévue](05-architecture.md) et la [recherche de composants](13-recherche-composants.md).

La [planche interactive](preview/index.html) sert à discuter la direction visuelle. Son HTML, son CSS et ses interactions de démonstration ne prouvent pas que les contrats React, le temps réel ou l’accessibilité décrits ici sont réalisés.

## 1. Fondations communes

Les [tokens CSS](assets/design-tokens.css) sont la source de référence. Les [styles de la planche](preview/styles.css) donnent un premier aperçu de leur application. Les valeurs ci-dessous sont des choix de projet, à vérifier sur les futurs composants dans les deux thèmes.

| Fondation | Proposition | Usage |
|---|---|---|
| Contrôles | Hauteur minimale **44 px**, rayon **12 px** | Boutons, saisies, commandes d’onglets ; largeur minimale de 44 px pour une commande composée uniquement d’une icône |
| Surfaces | Rayon **24 px**, bordure discrète, ombre douce | Salon, course, dialogue ; les cartes de joueur gardent un rayon de 16 px |
| Espacement | Échelle 4, 8, 12, 16, 24, 32, 48 et 64 px | Un même rythme entre libellé, aide, champ, groupe et panneau |
| Interface | **Space Grotesk** ; secours Arial, sans-serif | Titres, boutons et instructions |
| Frappe et chiffres | **IBM Plex Mono** ; secours Menlo, Consolas, monospace | Texte à recopier, code d’accès, compte à rebours, métriques ; chiffres tabulaires |
| Action principale | Citron `#D7FF3F` et encre `#171C2B` | Une action dominante par zone : rejoindre, être prêt, lancer |
| Couleurs expressives | Rose, lavande, bleu ciel et corail | Avatars, accueil, exercice, podium ; toujours avec un texte lisible |
| Sémantique | `--blue`, `--error`, `--muted`, `--border` | Focus, erreur, aide et délimitation ; valeurs adaptées au thème sombre |
| Mouvement | 160 ms pour un retour bref, 220 ms pour une entrée | Aucune animation décorative continue dans la zone de frappe ; version réduite sans déplacements |

Une couleur renforce une information déjà exprimée par un libellé, une icône ou une forme. « Prêt », « Hôte », « Reconnexion » et « Erreur » restent compréhensibles sans distinguer leurs couleurs. Le focus visible proposé est un contour de 3 px avec un décalage de 4 px ; il doit rester visible sur chaque fond et ne pas être coupé par un panneau.

Les composants ont une peau originale commune. La recommandation est d’utiliser le HTML natif pour les contrôles simples, puis **une seule bibliothèque de primitives accessibles**, à choisir après la [comparaison](13-recherche-composants.md), pour les comportements complexes. Une primitive apporte une structure et un comportement ; les tokens, la composition, les illustrations et les textes apportent l’identité du projet. Ce document n’ajoute aucune dépendance et ne fixe aucune version.

## 2. Catalogue proposé

| Composant | Composition et détail visuel | Contrat fonctionnel |
|---|---|---|
| **Button** | Variantes principale citron, secondaire surface, discrète texte ; icône facultative de 18 px | Élément `button` pour agir, lien pour naviguer. Nom visible ; type explicite dans un formulaire. Une variante ne change pas les permissions. |
| **Badge** | Petite capsule, texte court, icône facultative | Information non interactive. Variantes prêt, hôte, invité, bot, accès et connexion. Ne pas ajouter de focus à un simple statut. |
| **RoomHeader** | Symbole de salle, titre, accès, hôte et nombre de participants | Résumé issu du serveur ; « 12 / 30 » accompagné du libellé « participants ». Les actions restent des boutons séparés. |
| **InviteCode** | Code en monospace, caractères espacés, bouton Copier de 44 px | Code pour une salle semi-publique ; aide explicite pour le partager. Une salle privée présente des liens individuels dans `InviteDialog`. |
| **JoinCodeField** | Libellé « Code de la salle », champ unique, aide puis bouton Rejoindre | Normalisation conforme au format décidé dans le domaine. Erreur « Code inconnu », « Salle pleine » ou « Course commencée » affichée près du champ. |
| **InviteDialog** | Panneau sobre, titre, règle d’accès, génération et liste des invitations | L’hôte crée les liens privés individuels. Un lien utilisé ou expiré conserve un état explicite. La copie est confirmée localement par Clipboard API ; révocation et génération attendent une confirmation serveur. |
| **PlayerCard** | Avatar de touche, pseudonyme, rôle, badge prêt ; repère « Vous » | Carte informative stable par identifiant. Le bouton de préparation est distinct ; le rôle d’hôte peut être transmis à un invité déjà présent. |
| **RoomSettings** | Lignes alignées, libellés précis, valeurs ou contrôles | Modifiables par l’hôte selon l’état de la salle ; lecture seule pour les autres. Toute modification est validée par le serveur. |
| **RaceDashboard** | Vitesse, précision et temps en chiffres tabulaires ; unités visibles | Métriques personnelles et temps de course, avec distinction entre estimation locale et valeur confirmée lorsqu’elle est nécessaire. |
| **TypingField** | Texte fixe, champ réel, libellé visible, instruction et espace d’erreur réservé | Saisie immédiate locale, composition IME respectée, validation serveur distincte. L’avancement ne modifie pas la géométrie du texte. |
| **RaceLane** | Rang, pseudonyme, repère personnel, piste et pourcentage | Progression confirmée, nom accessible de la barre, rang en texte. Un participant terminé reste visible avec son état. |
| **RankingList** | Liste des leaders, de soi et des voisins ; accès au classement complet | Identifiants stables et règles de tri du domaine. Ne pas déplacer le focus à chaque évolution du classement. |
| **Podium** | Trois places expressives avec noms et rangs écrits | Classement confirmé ; ordre de lecture 1, 2, 3 même si la disposition visuelle est 2, 1, 3. Adaptation en liste sur petit écran. |
| **ResultSummary** | Résultat personnel puis vitesse, précision, erreurs et suite possible | Résultats serveur. Pas de record ni de progression historique inventés ; l’invité voit les données de sa session. |
| **Tabs** | Groupe compact, sélection citron, libellés courts | Pour des panneaux d’un même écran. Les étapes salon/course/résultats du produit suivent l’état serveur et ne sont pas librement activables comme les onglets de démonstration. |
| **Toast** | Message bref, icône et fermeture si utile | Confirmation non bloquante. Une erreur à corriger reste aussi près de l’action ou du champ concerné. |
| **ThemeToggle / LanguageSelect** | Commandes de 44 px, libellés compréhensibles | Thème clair/sombre ; option système possible. Français/anglais. Préférence persistée avec secours local si la sauvegarde échoue. |
| **ConnectionBanner / EmptyState** | Message calme, titre court, prochaine action utile | Distingue absence de données, chargement et indisponibilité réseau. Aucun faux chiffre ni faux joueur pendant un chargement. |

Pour les champs React, associer explicitement le libellé et l’identifiant du champ et garder un `type` de bouton cohérent évite des interactions ambiguës dans les formulaires. [Référence React : input](https://react.dev/reference/react-dom/components/input).

## 3. Contrats des interactions principales

### Button : une action claire et un retour stable

Le bouton principal utilise le citron, une bordure encre et une ombre courte de 2 px. Son survol peut remonter de 1 px ; sa pression peut descendre de 1 px. Ces déplacements disparaissent lorsque la réduction du mouvement est active. Le bouton secondaire change surtout de fond. Le focus possède son propre contour ; il ne dépend pas du survol.

Pendant une requête, garder la largeur, la hauteur et un libellé compréhensible, par exemple « Connexion… ». Un petit indicateur peut accompagner le texte. `aria-busy` indique l’attente ; une garde empêche les doubles commandes. Si la primitive utilise `aria-disabled` pour conserver le focus, le gestionnaire doit effectivement bloquer l’action. L’état indisponible emploie le `disabled` natif quand il convient, sans curseur d’attente : **indisponible et en chargement sont deux états différents**.

L’aide explique une indisponibilité utile : « Connecte-toi pour créer une salle », « Seul l’hôte peut lancer » ou « Reconnexion en cours ». Masquer un bouton selon le rôle facilite le parcours ; les contrôles d’autorité restent appliqués sur le serveur.

### InviteDialog : inviter sans perdre le contexte

Le dialogue indique d’abord la règle : code commun pour le mode semi-public, lien individuel à usage unique pour le mode privé. Il n’affiche pas un code privé qui permettrait de contourner cette règle. La génération d’une invitation n’est pas annoncée comme réussie avant la réponse du serveur.

À l’ouverture, placer le focus dans le dialogue : sur le premier contrôle pertinent, ou sur le titre rendu focalisable si le contenu demande d’abord une lecture. `Tab` et `Maj + Tab` restent à l’intérieur ; `Escape` ferme ; un bouton Fermer possède un nom explicite. Le fond devient inerte. À la fermeture, restaurer le focus sur le déclencheur s’il existe encore, sinon sur un contrôle logique du salon. N’indiquer `aria-modal="true"` que lorsque ces comportements sont effectifs. [Modèle WAI-ARIA : dialogue modal](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).

Copier un lien conserve le focus sur son bouton. La confirmation apparaît après la résolution de `navigator.clipboard.writeText`, qui signale la mise à jour locale du presse-papiers ; aucune réponse serveur n’est nécessaire pour cette copie. L’API exige un contexte sécurisé et peut refuser l’écriture : une erreur présente alors le lien sélectionnable pour une copie manuelle. La génération ou la révocation d’une invitation restent, elles, des commandes confirmées par le futur serveur. [Référence MDN : Clipboard.writeText](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText).

Le QR code reste une option du mode semi-public ; sa pertinence et sa réalisation seront validées séparément.

### PlayerCard : distinguer identité, présence et préparation

« Prêt » est un état du membre, « Hôte » une autorité de salle et « Reconnexion » une présence réseau : les badges peuvent coexister. Une déconnexion courte ne transforme pas automatiquement le joueur en nouveau participant. Le bouton « Je suis prêt » appartient au membre courant et attend la confirmation de son état ; la carte des autres joueurs ne devient pas cliquable sans action réelle à proposer.

Lors d’un transfert d’hôte, actualiser le badge, le résumé et les commandes autorisées à partir du même état confirmé. Un invité devenu hôte peut disposer de cette autorité temporaire dans la salle ; cela ne lui donne pas le droit de créer une nouvelle salle.

### TypingField : le texte reste à sa place

Le texte de la course est fixé avant le départ. Chaque caractère garde la même police, graisse, taille, chasse et position pendant la frappe. Les états attendu, courant, correct et erroné changent la couleur, le fond ou le soulignement ; ils n’ajoutent pas de caractère, ne passent pas une lettre en gras et ne changent pas une bordure qui affecte la largeur. Le curseur utilise un repère superposé ou un fond, sans insertion dans le flux.

La saisie ne supprime pas les mots déjà tapés, ne recentre pas la ligne et ne déclenche pas de défilement automatique. La zone garde sa hauteur prévue, et l’espace d’aide ou d’erreur est réservé. Les changements de largeur, de zoom ou d’orientation peuvent demander une nouvelle mise en page ; ils ne doivent pas être confondus avec une animation à chaque frappe. Pour un texte long, prévoir dès le départ une zone lisible et un défilement manuel utilisable.

Le contrôle reste un `input` ou un `textarea` réel avec un libellé visible. L’état contrôlé est mis à jour immédiatement avec la valeur du champ ; éviter un changement de clé, un remontage du contrôle ou une transformation asynchrone de cette valeur qui ferait sauter le curseur. La saisie doit vivre dans une petite frontière de composants afin de ne pas rendre toute la page à chaque modification. [Référence React : saisie contrôlée et performances](https://react.dev/reference/react-dom/components/input).

Les événements de composition sont pris en compte. `InputEvent.isComposing` identifie une saisie entre le début et la fin d’une composition IME ; un accent ou une composition provisoire ne reçoit pas une pénalité prématurée. L’implémentation devra distinguer la mise à jour locale du champ de l’envoi d’une opération validable, puis éviter de transmettre deux fois la même validation à la fin de composition. `Entrée` utilisée pour terminer une composition ne doit pas lancer une commande de salle. [Référence MDN : isComposing](https://developer.mozilla.org/en-US/docs/Web/API/InputEvent/isComposing).

Une erreur de saisie est associée au champ, et sa règle de correction est visible. Éviter d’annoncer chaque lettre ou chaque pénalité dans une région live. En cas de perte de connexion, conserver le texte et la valeur locale pour comprendre la situation, suspendre l’acceptation compétitive et afficher l’état réseau. Aucune frappe hors ligne n’est créditée rétroactivement.

### RaceDashboard, RaceLane et résultats : lisibles en un regard

Le tableau de bord privilégie trois mesures stables : vitesse avec unité, précision avec pourcentage, temps avec format constant. Des zones réservées et les chiffres tabulaires empêchent les sauts de mise en page. Le chronomètre ne déclenche pas une annonce vocale à chaque seconde.

Chaque piste garde le pseudonyme et le rang en dehors de la barre. Préférer un élément `<progress>` nommé ; si une barre personnalisée utilise `role="progressbar"`, fournir son nom et une valeur valide entre 0 et 100. Les descendants d’une barre ARIA étant présentatifs, le rang et les statuts doivent rester dans des éléments voisins. La mise à jour de la barre n’implique pas une région live à chaque mouvement. [Référence MDN : progressbar](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/progressbar_role).

À 30 participants, la vue compacte montre les leaders, soi et les voisins sans doublons, puis permet d’ouvrir le classement complet. Ne pas réordonner une commande sous le pointeur ou déplacer le focus pendant que l’utilisateur consulte cette liste. Les annonces concernent les étapes utiles : départ, reconnexion, fin de sa course, résultat confirmé.

Le podium présente le rang en texte et une liste ordonnée dans l’ordre réel du classement. Une éventuelle célébration est courte, désactivable et absente en mode de mouvement réduit. Les résultats personnels restent accessibles sans cette célébration ; un tableau peut compléter une représentation visuelle des erreurs.

### Tabs, Toast et préférences

Les onglets ont les rôles `tablist`, `tab` et `tabpanel`, une sélection explicite et un seul onglet dans l’ordre de tabulation. Pour une liste horizontale, les flèches gauche/droite déplacent le focus ; `Entrée` ou `Espace` activent le panneau dans le mode manuel proposé. `Home` et `End` permettent d’aller aux extrémités. Les liens entre pages restent des liens. Une activation automatique ne sera retenue que si le panneau est immédiatement disponible. [Modèle WAI-ARIA : onglets](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/).

Les confirmations ordinaires utilisent une région `role="status"`, dont l’annonce est polie, sans déplacement du focus. Une erreur durable reste dans son contexte. Les interruptions urgentes peuvent nécessiter une annonce plus directe, à vérifier avec le lecteur d’écran ; elles ne doivent pas transformer toutes les notifications en alertes. [Référence MDN : status](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/status_role).

Pour le thème, un contrôle natif nommé « Thème » peut proposer Clair, Sombre et éventuellement Système. Le nom reste stable lorsque la valeur change. Le thème applique les tokens à tout l’écran sans déplacer le focus ni modifier la course. La langue change les libellés et aides ; elle ne remplace pas le texte d’une course en cours.

## 4. Matrices d’états

**Lecture :** « — » signifie que l’état n’a pas de sens pour ce composant. Le focus, le survol et la pression des boutons contenus suivent `Button` ; ils ne rendent pas un panneau informatif interactif. Une donnée absente n’est ni zéro ni une erreur réseau.

### États d’interaction

| Composant | Normal | Survol | Focus clavier | Pression / sélection |
|---|---|---|---|---|
| Button | Variante et action visibles | Fond ou ombre renforcés | Contour visible | Retour bref ; pas de changement de dimensions |
| InviteCode / JoinCodeField | Code nommé / champ vide avec libellé | Bouton Copier seulement | Bouton ou champ encadré | Copie / demande d’admission |
| InviteDialog | Contenu et règle d’accès | Contrôles seulement | Focus contenu et piégé | Action ciblée ; fermeture restaurée |
| PlayerCard | Identité, rôle et présence | — | — ; contrôle Prêt séparé | État prêt confirmé avec libellé |
| RoomSettings | Valeurs et droits lisibles | Contrôles modifiables | Contrôle courant encadré | Choix proposé puis confirmé |
| TypingField | Texte fixe et champ nommé | Aucun effet sur le texte | Repère stable du champ | Valeur locale immédiate ; repère de caractère sans déplacement |
| Tabs | Sélection unique visible | Fond discret | Repère distinct de la sélection | Activation clavier ou pointeur |
| ThemeToggle / LanguageSelect | Valeur explicite | Contrôle seulement | Contour visible | Préférence appliquée ; focus conservé |
| Toast | Message bref | Fermer, si présent | Fermer seulement | Fermeture volontaire sans déplacer le focus ailleurs |
| Badge, RoomHeader, RaceDashboard, RaceLane, RankingList, Podium, ResultSummary | Information nommée | — | — ; liens et commandes séparés | — |

### États de données et de disponibilité

| Composant | Chargement | Indisponible | Vide | Erreur | Hors ligne |
|---|---|---|---|---|---|
| Button | Libellé d’attente, garde contre les doublons | Style distinct et raison utile | — | Erreur près de l’action ; réessai possible | Commande serveur suspendue avec explication |
| Badge / RoomHeader | Emplacement réservé, état « Chargement » | — | « Aucun participant » si cela correspond à la donnée | Résumé indisponible, sans faux nombre | Dernier résumé marqué « Reconnexion » |
| InviteCode / JoinCodeField | Admission ou copie en attente, espace stable | Partage selon le mode ; admission selon l’état de salle | Instruction de saisie | Code ou copie en échec, solution visible | Partage local possible si valable ; admission suspendue |
| InviteDialog | Action ciblée occupée | Génération selon autorité et état de salle | « Aucune invitation créée » et action utile | Échec associé à l’invitation concernée | Liens déjà connus visibles ; mutations suspendues |
| PlayerCard | Carte réservée sans faux membre | Prêt impossible dans certains états | Traité par la liste, pas une carte fictive | Échec de préparation près du bouton | Identité conservée, présence indiquée |
| RoomSettings | Valeurs en attente, pas de valeurs arbitraires | Lecture seule selon droits ou phase | Valeur absente explicitée | Modification refusée et valeur confirmée conservée | Dernières valeurs lisibles, édition suspendue |
| TypingField | Texte attendu avant départ ; aucune frappe compétitive | Avant départ, après fin ou course suspendue | Pas de course sélectionnée, prochaine étape visible | Règle de correction et état du champ | Saisie compétitive suspendue ; valeur locale conservée |
| RaceDashboard / RaceLane / RankingList | Donnée inconnue affichée « — » | — | Classement pas encore disponible | Région indisponible avec réessai approprié | Dernières valeurs confirmées identifiées, sans simulation de progression |
| Podium / ResultSummary | « Résultats en cours de confirmation » | — | Course annulée ou aucun résultat valide | Chargement des résultats en échec | Résultat déjà reçu lisible ; sinon attente explicite |
| Tabs | Panneau sélectionné chargé localement ou attente explicite | Onglet indisponible avec raison si nécessaire | État vide dans son panneau | Erreur dans son panneau | Panneaux locaux consultables ; actions réseau suspendues |
| Toast | Pas de notification de succès anticipée | — | Aucune notification | Erreur brève complémentaire au contexte durable | Indication réseau durable dans `ConnectionBanner` |
| ThemeToggle / LanguageSelect | — pour l’application locale de la préférence | — | Préférence par défaut explicite | Échec de sauvegarde sans bloquer le choix local | Commandes locales utilisables |
| ConnectionBanner / EmptyState | Message de connexion distinct | Action selon la situation | Titre et prochaine action | Cause compréhensible et réessai | Bandeau persistant avec état de reconnexion |

Une course annulée après redémarrage du service suit le comportement prévu dans l’[architecture](05-architecture.md) : aucun podium gagnant ni récompense fabriqués. L’interface annonce l’annulation et la possibilité de revenir au salon.

## 5. Intégration future dans Next.js et Tailwind

### Tokens et polices

Le futur projet reprend les variables sémantiques du fichier de tokens. Les couleurs de fond, de texte et de bordure s’adaptent alors par `data-theme`, sans recopier une palette dans chaque composant. Tailwind peut exposer ces variables par des alias `@theme inline` ; chaque alias a un nom distinct de la variable qu’il référence. [Documentation Tailwind : thème](https://tailwindcss.com/docs/theme).

Exemple de raccordement **à réaliser lors du scaffold**, à adapter à l’organisation du projet :

```css
@import "tailwindcss";
@import "./tokens.css";

@theme inline {
  --color-page: var(--background);
  --color-surface: var(--surface);
  --color-ink: var(--text);
  --color-muted: var(--muted);
  --color-action: var(--accent);
  --color-focus: var(--blue);
  --color-error: var(--error);
  --radius-button: var(--radius-control);
  --radius-card: var(--radius-panel);
  --font-interface: var(--font-ui);
  --font-race: var(--font-typing);
}
```

Les variantes spécifiques peuvent être raccordées à l’attribut `data-theme` selon la [documentation Tailwind du mode sombre](https://tailwindcss.com/docs/dark-mode). La préférence initiale devra être appliquée avant l’affichage du contenu autant que possible ; le comportement au premier rendu et à l’hydratation reste à tester.

Prévoir des fichiers de polices locaux réellement disponibles et dont la licence est vérifiée, puis utiliser `next/font/local` avec les chemins correspondants et des variables dédiées. Les deux familles sont choisies dans les tokens, mais ce document ne fournit pas encore leurs fichiers WOFF2. Leur chargement et les polices de secours devront être vérifiés avant le départ pour éviter un changement de métrique du texte pendant une course. [Documentation Next.js : polices](https://nextjs.org/docs/app/getting-started/fonts).

### Frontières serveur et client

| Partie | Serveur | Client |
|---|---|---|
| Entrée de page | Identité, autorisations, données initiales autorisées | Commandes de connexion et d’admission |
| Salon | Vérification de chaque commande, règles et état durable | Abonnement au salon, dialogue, prêt et retours d’attente |
| Course | Texte, chronologie et validation des opérations | Saisie locale, affichage du temps et instantanés confirmés |
| Résultats | Calcul et lecture des résultats confirmés | Consultation, onglets de détail et célébration facultative |
| Apparence | Préférence initiale lorsqu’elle est disponible | Thème, langue et préférence de mouvement |

Dans l’App Router, les événements, hooks et API du navigateur appartiennent aux composants clients. Garder ces frontières proches de l’interaction, transmettre des données sérialisables et conserver les accès base de données et secrets côté serveur. Une page complète n’a pas besoin de devenir cliente parce qu’un de ses boutons est interactif. [Documentation Next.js : composants serveur et client](https://nextjs.org/docs/app/getting-started/server-and-client-components).

Le futur `packages/ui` contient la présentation et les contrats des contrôles. Le domaine contient les règles de course ; la couche temps réel contient l’autorité et les événements. `Button` et `PlayerCard` ne recalculent pas eux-mêmes les permissions ou le classement.

### Ne pas rendre toute l’application à chaque frappe

L’état du champ, le caractère courant et la composition IME restent dans la zone de frappe. Le reste de l’écran reçoit des mises à jour aux moments utiles : métriques recalculées, instantané serveur ou changement de phase. Éviter un contexte global contenant la valeur tapée et éviter de remonter la saisie dans le layout de l’application.

Un abonnement ciblé à un store externe pourra être utile pour le temps réel. S’il utilise `useSyncExternalStore`, ses instantanés doivent être stables et mis en cache tant que la donnée n’a pas changé ; une fonction qui crée systématiquement un nouvel objet n’est pas un contrat correct. Cette possibilité ne nécessite pas d’ajouter une bibliothèque de gestion d’état maintenant. [Référence React : useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore).

L’objectif est une saisie immédiate et une interface stable. La fréquence des envois, la portée réelle des rendus et les budgets de performance seront mesurés dans l’application ; ils ne sont pas garantis par cette spécification.

## 6. Critères de réalisation et de vérification

| Vérification future | Résultat attendu |
|---|---|
| Contrôles dans les deux thèmes | Texte, contour, icônes et focus lisibles dans tous les états applicables |
| Navigation clavier | Ordre logique ; dialogue contenu puis focus restauré ; onglets utilisables sans souris |
| Frappe réelle | Accents, IME, correction et frappes rapides testés dans les navigateurs visés ; aucun déplacement de caractère provoqué par son état |
| Réseau et autorité | Attente, refus, reconnexion et transfert d’hôte distincts ; aucune action serveur annoncée avant confirmation |
| Données de course | Départ, terminé, abandonné, course annulée et résultats en attente représentés sans faux gagnant |
| Charge d’affichage | Vue compacte et classement complet avec 30 participants ; saisie isolée contrôlée avec les outils de profilage |
| Zoom et petits écrans | Libellés non tronqués, actions accessibles, code copiable, tableau de résultats consultable |
| Réduction du mouvement | Déplacements et célébrations supprimés ; aucune information perdue |
| Français et anglais | Libellés, aides, erreurs et notifications complets ; place prévue pour des textes de longueur différente |
| Lecteur d’écran | Noms et états des contrôles compréhensibles ; annonces utiles sans lecture de chaque frappe, seconde ou mouvement de piste |

Pour le **checkpoint 1**, privilégier Button, champs de connexion et de code, RoomHeader, InviteCode, PlayerCard, RoomSettings, ConnectionBanner, thème et langue : ils servent le parcours compte → création → admission → salon synchronisé. TypingField, RaceDashboard, RaceLane et résultats seront réalisés avec la course complète. Les primitives communes doivent pouvoir évoluer vers ces écrans sans imposer d’abord toutes leurs fonctionnalités.

Les tests React, les essais de lecteur d’écran et les mesures de performance ci-dessus restent à effectuer après la création de l’application. Les vérifications de la planche ne les remplacent pas.


## Pied de page et jeu implémentés · 4 octobre 2026

Le catalogue initial ci-dessus reste la spécification de référence; le [rapport d’implémentation](18-implementation.md) décrit les composants React réalisés. Le footer comporte une signature, un motif de touches, deux groupes de liens dans une navigation nommée « Navigation de bas de page » et une action citron. L’entraînement utilise le footer complet, comme les pages ordinaires. Les salles utilisent sa variante compacte « Aide pour jouer ». Destinations existantes, traductions FR/EN, icônes décoratives, focus visible et cibles de 44 px sont conservés.

`RaceDashboard` partage quatre mesures entre course et échauffement; `ArcadeControls` affiche l’énergie réelle et les conditions des capacités; `RaceTracks` conserve des lignes stables avec position selon progression, état et piste de chaque participant. Le résultat personnel précède le podium, qui utilise les rangs officiels. La palette initiale, les textes encre sur les surfaces pastel et les préférences de mouvement restent la base.

Le [registre de recherche](21-recherche-footer-et-jeu.md) explique les choix. Le [rapport de vérification](20-verification-implementation.md) précise les écrans et les comportements réellement exercés, ainsi que leurs limites.
