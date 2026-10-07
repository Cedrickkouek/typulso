# Design des pages et des états

> **Lecture actuelle · 7 octobre 2026 :** ce document conserve la conception ou les observations à leur date. L’état du code et des choix implémentés figure dans [18](18-implementation.md); les procédures utilisables dans [19](19-deploiement.md); les preuves locales, CI et Railway dans [CP1](08-plan-checkpoint.md) et la synthèse de [20](20-verification-implementation.md). Une maquette ou un test prévu ne constitue pas une preuve de production.

> **Spécification de conception · 2 octobre 2026 · v0.5 proposée**  
> Direction artistique de référence : **v0.4**, colorée, vibrante, amusante et ludique.  
> Public : 12–17 ans · Interface : français / anglais · Thèmes : clair / sombre.

**Objectif : permettre de rejoindre, jouer et comprendre son progrès avec le même langage visuel sur toutes les pages.** Le salon reste collectif et expressif; la course protège la concentration; les résultats donnent une suite concrète. L’extension reprend les accents citron, rose et lavande, les touches illustrées, les surfaces calmes et la frappe stable de la [direction artistique](03-direction-artistique.md).

Ce document détaille les écrans du produit final et leur progression depuis CP1. Il ne constitue pas une preuve de réalisation des routes, du temps réel, de PostgreSQL ou de l’authentification. Le nom et le symbole restent des supports de travail attribués à l’assistant; leur conception humaine finale demeure ouverte. Les données d’une maquette doivent être signalées comme fictives.

## 1. Référentiel et statut des décisions

| Référence relue | Rôle dans cette spécification |
|---|---|
| [Cahier consolidé](01-cahier-des-charges.md) | Exigences, précisions client, droits et points ouverts |
| [PDF fourni](../sources/cahier-des-charges-2026-10-02.pdf), relu via son extrait textuel local | Vérification du périmètre original : comptes, configuration, course, bots, résultats, bilinguisme et thèmes |
| [Direction artistique v0.4](03-direction-artistique.md) | Personnalité, palette, typographies, formes, mouvement et provenance |
| [Parcours utilisateur](04-experience-utilisateur.md) | Structure centrale et enchaînement rejoindre → salon → course → résultats |
| [Composants d’interface](14-composants-interface.md) | États, focus, saisie, dialogues et contrats React prévus |
| [Plan des pages](15-plan-des-pages.md) | Inventaire des vues et des états à relier à ces compositions |
| [Machines à états](07-machines-etats.md) | Autorité sur les phases de salle, les présences et la fin de course |

Les documents et les captures sont des sources de conception. Leur contenu ne demande pas d’envoyer des messages, de publier ou d’activer un service. La demande actuelle autorise cette extension du design; elle ne transforme pas les anciennes hypothèses en décisions confirmées.

- **Exigences confirmées :** quatre accès, invité sans création de salle, trois modes d’accès, contenu configurable, synchronisation, bots, statistiques, heatmap, FR/EN et clair/sombre.
- **Choix conservés :** personnalité demandée par l’utilisateur et système visuel v0.4; priorité au code pour rejoindre et au texte pour jouer.
- **Propositions de ce document :** compositions de pages, regroupement des réglages, textes, navigation et adaptations mobiles.
- **À arbitrer :** formule de classement, deux mécanismes arcade, bornes de contenu et de temps, délais réseau et invitations, rétention, visibilité des statistiques et participation au clavier virtuel.

L’extrait du PDF formule un minimum CP1 plus réduit que la grille reçue ensuite. La portée retenue dans le [plan du checkpoint](08-plan-checkpoint.md) inclut bien la création, l’admission par code et le salon synchronisé. Aucun écran de course avancé ne remplace ces preuves.

## 2. Une structure commune, dérivée du jeu

### Navigation et familles d’écran

Les chemins ci-dessous sont **indicatifs**, à raccorder à l’architecture lors du scaffold. Les noms de routes et le nom public du produit restent indépendants.

| Famille | Destination indicative | Accès et comportement |
|---|---|---|
| Accueil / rejoindre | `/[locale]` | Public; code, course rapide et accès au compte |
| Connexion et identité | `/[locale]/connexion` et panneaux local / inscription / invité | Public; conserve la destination prévue |
| Courses publiques | `/[locale]/courses` | Public; consultation puis identité si nécessaire |
| Création | `/[locale]/salles/nouvelle` | Compte requis avant les réglages |
| Salle | `/[locale]/salles/[id]` | Une même route; salon, départ, course et résultats dépendent de l’état serveur |
| Invitation privée | `/[locale]/invitation/[token]` | Validation puis admission explicite; lien individuel |
| Entraînement | `/[locale]/entrainement` | Configuration et pratique avec bots; accès invité à arbitrer |
| Historique / profil | `/[locale]/profil` et détail de résultat autorisé | Compte : données permanentes; invité : session active |
| Préférences | `/[locale]/preferences` | Apparence accessible avant connexion; persistance selon l’identité |
| Incidents | À la destination concernée, ou page introuvable | Explication contextualisée et issue claire |

**La salle n’est pas un ensemble d’onglets librement navigables.** Le serveur décide du passage salon → compte à rebours → course → résultats. Les onglets de la planche de discussion permettent seulement de comparer des designs. Dans le produit, les onglets servent aux détails d’un même écran : statistiques, heatmap ou règles, par exemple.

### Enveloppe des pages

L’en-tête comporte la signature de travail, un lien Accueil, l’accès aux courses publiques et à l’entraînement, puis le menu du compte ou « Connexion ». Les commandes nommées **Langue** et **Thème** restent faciles à trouver. Sur mobile, les destinations secondaires se regroupent dans un menu explicite; une commande active n’est jamais représentée uniquement par une couleur.

**Ajustement du 3 octobre 2026.** Dans la maquette, les quatre destinations Jouer, Entraînement, Mon progrès et Préférences partagent un panneau de navigation à fond `--surface`, bordure discrète et coins de 16 px. La destination active utilise le citron et un texte encre, dans les deux thèmes. Les liens conservent une hauteur minimale de 44 px et un focus visible. Sous 380 px, les options passent sur deux colonnes pour rester contenues dans le panneau.

À 1050 px et moins, le fond du menu conserve la largeur de ses options et se centre sur une ligne dédiée. L’en-tête utilise une grille à deux colonnes sur tablette, puis retrouve une disposition souple sur mobile pour permettre aux commandes de passer à la ligne. L’espacement avant le contenu de l’accueil est ramené à 30 px; les deux colonnes de son introduction sont alignées en haut. La disposition sur deux colonnes du menu à 380 px et moins conserve des cibles de 44 px.

L’accueil et les pages de consultation reprennent les touches et aplats expressifs. Les formulaires utilisent des panneaux sobres avec une illustration périphérique. La course réduit l’enveloppe à l’identité de la salle, l’état réseau et les commandes utiles : les destinations générales restent accessibles sans concurrencer le texte. Le bas de page vient après le contenu, sans bloc promotionnel au milieu d’une course.

| Règle commune | Application à toutes les familles |
|---|---|
| Hiérarchie | Un titre qui situe la page, une action dominante par zone, puis les détails et actions secondaires |
| Composition | Largeur de référence 1232 px; formulaire plus étroit; grilles souples; une colonne pour la tâche sur petit écran |
| Lisibilité | Tokens [clair / sombre](assets/design-tokens.css), texte fonctionnel visant 7:1, repères essentiels au moins 3:1; aucune opacité arbitraire sur les états utiles |
| Contrôles | Cibles de 44 px, dimensions constantes pendant une requête; libellés visibles; lien pour naviguer, bouton pour agir |
| Focus | Repère de 3 px indépendant du survol; ordre de lecture logique; aucune bordure de panneau ne coupe ce repère |
| Chargement | Forme et espace réservés; annonce sobre; aucun joueur, chiffre, résultat ou record inventé |
| Erreur | Près du champ ou de l’action; synthèse si plusieurs champs; texte conservé et nouvelle tentative possible |
| Notifications | Confirmation polie sans focus volé; une erreur durable demeure aussi dans son contexte |
| Mouvement | Retours brefs, pas de décoration continue dans la frappe; aucune information perdue avec mouvement réduit |
| Permissions | Capacité affichée clairement; vérification serveur pour chaque commande, y compris après un changement d’hôte |

À **390 px**, réserver 16 px de marge extérieure, permettre aux actions de passer à la ligne et conserver un champ lisible de 16 px. Les textes anglais peuvent être plus longs : aucun bouton ou badge essentiel n’utilise une hauteur fixe qui les tronque. Le zoom et l’agrandissement du texte doivent pouvoir augmenter la hauteur des blocs.

## 3. Accueil : entrer dans le rythme

**But :** rejoindre une activité en comprenant immédiatement ce qui est possible. **Exigences :** ROOM-01 à ROOM-03, AUTH-02, UX-01 et UX-02.

**Ordre de lecture :** promesse courte → code et Rejoindre → course rapide → autres possibilités. Le premier écran montre « Ton clavier. Toute une arène. », une illustration de touches en périphérie et un champ unique. Le panneau d’admission reste le point le plus net; les sections de présentation viennent ensuite.

| Zone | Contenu proposé |
|---|---|
| Entrée | « Rejoins le groupe. Trouve ton rythme. » |
| Code | Libellé « Code de la salle »; aide « Ton hôte t’a partagé un code ? Entre-le ici. »; bouton **Rejoindre** |
| Accès direct | Bouton **Course rapide**; aide « Rejoins une course publique en attente. » |
| Autres chemins | Liens **Voir les courses**, **S’entraîner avec des bots**, **Créer une salle** |
| Compréhension | Trois étapes brèves : Rejoins le salon · Tape avec le groupe · Découvre tes progrès |

Le format du code sera celui décidé par le domaine. Normaliser les caractères autorisés sans déplacer le curseur pendant la saisie. Ne pas imposer silencieusement un code de six caractères à partir du seul exemple de la planche. Une invitation privée ouvre son propre parcours et ne demande pas un code.

**États.** « Vérification du code… » bloque le double envoi; « Ce code ne correspond à aucune salle active. » reste associé au champ. Salle pleine : « Cette salle est pleine. Essaie une course publique ou demande une autre invitation. » Une course commencée propose l’observation selon les autorisations. Si aucune course publique n’attend, l’utilisateur connecté reçoit le parcours de création prévu par ROOM-03; l’invité reçoit **Se connecter** et une explication. Ne pas créer une salle avec son identité temporaire.

**Mobile, clavier, thèmes.** Code et action sur une colonne, bouton pleine largeur; illustration réduite avant de réduire la lisibilité. `Entrée` soumet le formulaire de code, sans activer simultanément Course rapide. Le citron porte un texte encre et un contour essentiel lisible dans les deux thèmes.

## 4. Connexion, inscription locale et invité

**But :** choisir une identité sans perdre la salle visée. **Exigences :** AUTH-01 à AUTH-04 et ROLE-01.

La page conserve le contexte « Pour rejoindre Le sprint des mots » ou « Pour créer ta salle ». Discord et GitHub sont les deux actions visibles en premier, avec leur nom. Le compte local et l’invité restent deux chemins secondaires distincts; aucun choix n’est présenté comme obligatoire pour simplement participer.

| Écran / panneau | Hiérarchie et contenu réel |
|---|---|
| Choix d’accès | Titre **Entre dans le groupe**; **Continuer avec Discord**, **Continuer avec GitHub**; séparation « Ou »; **Compte local**; **Continuer en invité** |
| Connexion locale | Titre **Retrouve ton compte**; Nom d’utilisateur, Mot de passe, **Se connecter**; contrôle nommé Afficher/Masquer le mot de passe; lien **Créer un compte local** |
| Inscription locale | Titre **Crée ton compte local**; Nom d’utilisateur, Mot de passe et confirmation proposée; règles de saisie visibles; **Créer le compte** |
| Invité | Titre **Une place, sans compte**; Pseudonyme, aide « Tu peux rejoindre et jouer. Créer une salle demande un compte. »; **Continuer** |

Avant l’inscription locale, afficher : **« Ce compte n’utilise pas de courriel. Il n’y a pas de récupération de mot de passe. Garde tes identifiants. »** Ne pas ajouter un lien Mot de passe oublié qui promettrait un mécanisme absent. Les seuils de mot de passe et de pseudonyme sont ceux de la politique serveur, encore à fixer; les aides doivent les refléter lors de l’implémentation.

Pour l’invité : « Tes résultats restent disponibles pendant ta session active. » La durée exacte n’étant pas décidée, la page ne promet ni conservation au lendemain ni transfert automatique de ces résultats vers un futur compte.

**États.** Redirection fournisseur : « Ouverture de Discord… » ou « Ouverture de GitHub… »; annulation : retour au choix avec la destination conservée. Connexion locale refusée : « Nom d’utilisateur ou mot de passe incorrect. » Inscription : erreur précise pour un nom indisponible ou une confirmation différente. Session expirée : « Reconnecte-toi pour continuer. » Préserver le pseudonyme et la destination, mais ne pas réinjecter des secrets dans une URL. Une invitation privée en attente ne doit pas être consommée pendant cette étape.

**Mobile, clavier, thèmes.** Formulaire unique, champs pleine largeur, commandes Afficher et Continuer toujours visibles. Autoriser le collage et le gestionnaire de mots de passe ici : CONF-10 concerne le champ de frappe compétitive. À l’envoi invalide, diriger le focus vers la synthèse d’erreurs ou le premier champ concerné; associer les aides et erreurs aux champs. Les marques des fournisseurs ne remplacent pas leurs libellés.

## 5. Courses publiques : trouver une place

**But :** choisir une activité à rejoindre. **Exigences :** ROOM-01, ROOM-02, ROOM-05 et ROOM-08.

Le titre **Trouve ta prochaine course** précède une action **Course rapide** et les filtres utiles : langue du contenu, mode et état. La liste montre d’abord les salles en attente. Les salles déjà lancées indiquent **Regarder**, jamais un faux bouton Participer.

Chaque entrée contient le nom, la langue de l’exercice, le mode, le nombre de participants, l’état et les règles essentielles. « Semi-public » et « Privé » n’apparaissent pas dans ce répertoire. Le nombre affiché vient de la disponibilité réelle; aucune entrée fictive n’habille un état vide.

**États.** Pendant le chargement, réserver quelques emplacements sans faux noms. Vide : « Aucune course publique en attente. » avec création pour le compte, connexion pour l’invité et entraînement selon ses permissions. Filtre sans résultat : **Effacer les filtres**. Une place prise entre affichage et clic produit un message près de l’action et une liste actualisée. Réseau indisponible : conserver éventuellement la dernière liste comme **Données non actualisées**, empêcher une admission faussement confirmée, proposer **Réessayer**.

**Mobile, clavier, thèmes.** La liste devient des lignes ou cartes verticales; nom puis résumé puis action. Les filtres se replient dans un panneau nommé avec leur nombre actif. Les boutons restent distincts du bloc informatif. Une actualisation n’efface pas le filtre et ne déplace pas le focus sous le pointeur.

## 6. Création : des règles faciles à expliquer

**But :** configurer une salle puis la créer. **Exigences :** ROLE-01, ROOM-01 et CONF-01 à CONF-09.

Vérifier le compte **avant** les champs. Une personne invitée voit « Connecte-toi pour créer une salle. Tu pourras ensuite choisir les règles. » et un retour vers son activité, sans remplir une longue configuration inutilisable.

**Ordre de lecture :** identité et accès de la salle → exercice → règles → résumé → **Créer la salle**. Les réglages avancés appartiennent à des groupes explicites, sans changer les valeurs à l’ouverture d’un panneau. Le formulaire peut se lire en entier; une étape cachée ne doit pas rendre une erreur impossible à atteindre.

| Groupe | Contrôles prévus | Contenu / garde-fou |
|---|---|---|
| Salle | Nom, accès Public / Semi-public / Privé | Chaque choix explique qui peut entrer : répertoire, code ou invitation individuelle |
| Contenu | Texte cohérent / Suite de mots / Texte personnalisé; langue du contenu | « La langue du texte est indépendante de celle de l’interface. » |
| Texte personnalisé | Zone de texte, longueur et aperçu | Données conservées en cas d’erreur; source et autorisation du contenu à clarifier |
| Cible | Thèmes, accents, ponctuation, chiffres, caractères spéciaux | Contrôles nommés; résumé des choix, pas une série d’icônes ambiguës |
| Longueur | Valeur et unité, caractères interdits | Bornes du domaine; erreur si le texte personnalisé et les exclusions se contredisent |
| Temps | Limite activée ou désactivée, durée si activée | « Sans limite de temps » est une valeur visible; inactivité et fin restent définies par la règle serveur |
| Vitesse | Objectif facultatif, souhaitable / P2 | Afficher son unité et son effet; ne pas confondre objectif personnel et classement |
| Erreurs | Bloquantes / Non bloquantes | Aide : « Corrige avant de continuer » / « Les erreurs restent comptées et influencent le résultat » |
| Mode | Classique / Arcade | Règle de classement et mécanismes arcade à définir avant leur mise en service |

Le résumé final indique accès, langue, contenu, longueur, temps, règle d’erreur et mode. Le futur corpus produit des contenus par banques et règles : aucun bouton « Générer avec l’IA » n’est ajouté. Les permissions serveur valident la création et la cohérence des choix.

**États.** Création en cours : bouton de largeur stable et libellé « Création… »; aucun code affiché avant la réponse. Erreurs de champs : messages au groupe concerné et résumé cliquable. Incident réseau : conserver le brouillon, permettre de vérifier le résultat de la commande avant un nouvel envoi pour éviter deux salles. Session expirée : renouer l’identité puis revalider les permissions; ne pas confirmer une création locale.

**Mobile, clavier, thèmes.** Un groupe par section et un résumé compact après les réglages. Radios pour choix exclusifs, cases pour options indépendantes, labels complets. Aucun formulaire coincé entre deux colonnes étroites. Un panneau avancé s’ouvre au clavier et conserve sa position et ses valeurs; focus placé sur l’erreur même si son groupe était replié.

## 7. Salon : hôte, participant et observateur

**But :** savoir qui est là, quelles sont les règles et ce qui déclenche le départ. **Exigences :** ROOM-04, ROLE-02, CLIENT-05 et CLIENT-06.

La composition suit la planche v0.4 : en-tête de salle; invitation; groupe; réglages; préparation. L’hôte et le participant voient le même contenu confirmé, avec des commandes différentes. Les cartes identifient séparément rôle, présence et état prêt.

| Zone | Participant | Hôte |
|---|---|---|
| En-tête | Nom, accès, hôte, nombre de membres, connexion | Même contenu; accès aux commandes de salle |
| Invitation | Code semi-public si le partage est autorisé; règle d’accès | Code semi-public ou gestion des invitations privées |
| Groupe | Pseudonymes; repère Vous; Prêt / En attente / Reconnexion; bots et spectateurs identifiés | Actions séparées pour participant/spectateur, exclusion et ajout de bots |
| Réglages | Résumé en lecture seule | Modification tant que la phase serveur l’autorise |
| Action principale | **Je suis prêt** puis **Modifier mon état** | **Lancer la course**, avec raison lisible si indisponible |
| Sortie | **Quitter la salle** | **Quitter et transmettre** ou **Fermer la salle**, selon la phase et la règle retenue |

Un spectateur voit « Tu regardes cette course. L’hôte peut te faire participer à la suivante. » et ne reçoit pas un bouton de préparation pour la course actuelle. Une arrivée tardive n’est pas présentée comme une reconnexion d’un joueur existant.

**États.** Salle vide pour l’hôte : « Ta salle est prête. Invite le groupe. » Participants insuffisants : explication à côté de Lancer, avec **Ajouter un bot** si autorisé; le seuil minimal reste une décision de domaine. Préparation en cours : le bouton conserve son focus et annonce son état confirmé. Réglage refusé : garder la dernière valeur serveur et le choix proposé visible avec une erreur. Nouveau réglage confirmé : annoncer sobrement le changement; la remise éventuelle des états prêts reste une règle à décider. Exclusion : confirmation nommant la personne; pas une action destructive au simple clic sur sa carte.

**Mobile, clavier, thèmes.** En-tête puis invitation puis participants puis réglages et action. Grille de membres souple, liste dense possible à 30 personnes, aucun avatar ne masque le pseudonyme. Les menus d’hôte ont un nom « Actions pour Nova » et retournent le focus à leur déclencheur. Le statut prêt reste écrit, avec une icône; la lavande et le rose servent de surface avec texte encre.

## 8. Invitation privée : vérifier, puis entrer

**But :** admettre la bonne personne avec un lien individuel. **Exigences :** ROOM-01, CLIENT-04 et CLIENT-08.

### Côté destinataire

La page présente **Tu as une place dans le groupe**, le nom de salle disponible et la règle « Invitation individuelle ». Elle propose l’identité nécessaire puis **Rejoindre cette salle**. Le chargement vérifie la disponibilité; une lecture, un aperçu de lien ou une connexion ne consomme pas l’invitation. Son utilisation effective correspond à l’admission confirmée et doit rester cohérente en cas de nouvelle tentative réseau.

**États.** Expirée : « Cette invitation a expiré. Demande un nouveau lien à l’hôte. » Utilisée : « Cette invitation a déjà été utilisée. » Si le même membre dispose d’un droit de reconnexion, proposer **Reprendre ma place** selon l’état serveur, sans remettre le jeton en circulation. Révoquée, salle fermée ou identité non admise : message spécifique seulement si l’information est autorisée; autrement, « Cette invitation ne permet plus de rejoindre la salle. » La page n’expose pas inutilement la liste des membres d’une salle privée.

### Côté hôte

`InviteDialog` indique **Un lien par personne**; génération, expiration et état Utilisable / Utilisée / Expirée / Révoquée. Les durées affichées viennent d’une politique décidée, pas d’un exemple inventé. **Créer une invitation**, **Copier le lien**, **Révoquer** restent des actions distinctes. Le lien est sélectionnable si la copie échoue; le succès est annoncé dans le dialogue tant que celui-ci est ouvert.

**Mobile, clavier, thèmes.** Panneau simple, lien pouvant se répartir sur plusieurs lignes sans tronquer la commande Copier. Dialogue nommé, fond inerte, focus contenu, Escape et retour au déclencheur. Aucun code commun ni QR privé ne contourne le lien individuel. Le token n’est pas repris dans le titre, les notifications, l’analytique ou les journaux; les détails de transport sont à traiter dans l’architecture.

## 9. Spectateur : suivre le groupe sans faux contrôle

**But :** comprendre la course et attendre sa prochaine occasion de participer. **Exigences :** ROOM-05, ROLE-02 et RACE-04.

L’en-tête écrit **Mode spectateur** et situe la phase. La priorité devient temps et leaders → progression du groupe → règles de course. Le texte de l’exercice peut rester consultable, mais aucun champ de frappe actif, jauge d’énergie personnelle ou bouton prêt n’apparaît pour l’épreuve en cours.

La liste complète présente rang, pseudonyme, progression et états Terminé / Abandonné / Reconnexion. Les bots sont nommés comme tels; les spectateurs ne deviennent pas des concurrents classés. « Tu pourras rejoindre la prochaine course si l’hôte te place parmi les participants. » évite de promettre une participation automatique.

**États.** Reconnexion : dernière situation connue avec statut de fraîcheur, puis instantané restauré. Groupe réduit : montrer les personnes présentes sans compléter artificiellement un podium. Course terminée : résultats publics autorisés et attente de revanche. Transfert d’hôte : notification sobre et commandes mises à jour après confirmation.

**Mobile, clavier, thèmes.** Liste verticale avant toute piste décorative; classement intégral repliable. Aucune mise à jour ne vole le focus ni déplace une action que l’utilisateur allait activer. Le spectateur peut réduire le mouvement et couper le son indépendamment des autres.

## 10. Compte à rebours et course

**But :** commencer ensemble, taper sans déplacement du texte et comprendre la règle. **Exigences :** RACE-01 à RACE-05, CONF-07 à CONF-10 et BONUS-01 à BONUS-03.

### Départ commun

Le compte à rebours remplace les réglages éditables par leur résumé figé. Titre **Prêt ? À tes touches.**, participants prêts, départ commun et état réseau. Le serveur fournit la chronologie; le navigateur ne crée pas son propre départ à la fin d’une animation. La durée du décompte est à fixer. Un repère textuel subsiste avec mouvement réduit et sans son.

Le contrôle de frappe est présent et peut recevoir le focus avant le départ sans accepter une progression compétitive prématurée. Définir et tester un transfert de focus utile vers ce contrôle au début de la phase active, sans y envoyer un spectateur et sans interrompre une composition. L’annonce du départ ne lit pas chaque chiffre du décompte.

### Course classique

**Ordre de lecture :** texte → caractère courant → temps et connexion → progression personnelle → concurrents. Le texte conserve la police monospace, la graisse, la chasse, les mots et les retours à la ligne pendant la frappe. L’erreur change le soulignement ou le fond, jamais la largeur du caractère. Le curseur est superposé; une position de fin existe après le dernier caractère.

Le tableau de bord montre **Vitesse**, **Précision**, **Temps**, avec unités et chiffres tabulaires. Avant une saisie, progression **0 %** et précision **—**; aucune mesure de démonstration n’est présentée comme personnelle. Sans minuterie, écrire **Sans limite**. Le comptage correct/erreur et les pénalités suivent la règle définie; les caractères en surplus ne disparaissent pas des erreurs.

Le champ réel possède son libellé **À toi de jouer** et une instruction adaptée : « Corrige le caractère souligné pour continuer. » ou « Les erreurs sont comptées; tu peux les corriger. » Le collage est bloqué ici avec un retour « Tape le texte au clavier pour cette course. » Cette protection n’est ni appliquée aux champs de compte ni présentée comme une garantie complète contre la triche.

La composition IME et les accents sont évalués à la fin d’une composition valide. La valeur brute saisie reste immédiate; sa normalisation pour comparaison ne doit pas réécrire le champ à chaque frappe. Pas d’annonce vocale par lettre, par seconde ou par déplacement. Les aides possèdent un emplacement réservé pour ne pas pousser le texte.

Les pistes compactes montrent les trois leaders, soi et les voisins, sans doublons; **Classement complet** ouvre les autres entrées. Rang et nom restent à côté de la barre. À 30 participants, le classement consulté ne se réordonne pas sous une action ou un focus actif; une évolution peut être signalée sans rendre la liste inutilisable.

### Course arcade

La même structure de frappe est conservée. Avant le départ, le mode annonce ses règles de rattrapage et son classement. Une zone périphérique peut afficher **Énergie**, capacité, état Disponible / En recharge et effet annoncé. Les personnages à énergie sont une piste acceptée, pas le système définitivement retenu. Deux mécanismes restent à choisir et à équilibrer.

Chaque capacité a un bouton nommé et une explication courte de la cible, de la durée et de l’effet effectivement retenu. Éviter un raccourci constitué d’une lettre que l’exercice demande de taper; tout raccourci optionnel doit être configurable et testé avec la frappe. Le mouvement réduit et la désactivation des effets forts conservent une indication textuelle équivalente. Si un effet change le contenu, la longueur ou le score, sa présentation reste compatible avec la stabilité du texte; ce contrat doit être résolu avant implémentation. Les performances arcade ne sont pas comparées naïvement aux temps d’une course classique.

**États.** Texte indisponible : pas de départ, explication et retour salon autorisé. Déconnexion : valeur locale et texte conservés, acceptation compétitive suspendue; aucune frappe hors ligne créditée au retour. Terminé : champ arrêté selon la règle, texte conservé et « Tu as terminé. Le groupe finit sa course. » Résultats en calcul : pas de faux podium. Annulée : « La course a été interrompue. Aucun vainqueur n’est attribué. »

**Mobile, clavier, thèmes.** Zone de texte pleine largeur, métriques compactes, classement après la saisie. Pas de barre flottante cachant le champ ou le clavier virtuel. Le texte ne se recentre pas et ne défile pas automatiquement à chaque frappe; une zone longue offre un défilement manuel. L’adaptation à l’ouverture du clavier, aux accents et à la rotation doit être testée. L’interface permet la consultation et l’observation sur mobile; la participation au clavier virtuel reste une décision, sans message d’impossibilité technique inventé.

## 11. Entraînement avec bots

**But :** pratiquer même sans groupe disponible. **Exigences :** BOT-01, BOT-02, CONF et STAT.

Titre **Trouve ton rythme**; explication « Entraîne-toi avec des adversaires simulés. » Choisir le contenu, la langue, la règle d’erreur, le temps et le niveau des bots. Les réglages essentiels sont visibles; les réglages avancés réutilisent la création. Le résumé distingue nombre d’humains et nombre de bots.

Les niveaux portent des noms explicites, par exemple Débutant / Intermédiaire / Rapide, à calibrer. Ne pas promettre une vitesse exactement constante; les bots font varier leur rythme et leurs erreurs. Un éventuel niveau Impossible est identifié sans humilier le joueur. **Commencer l’entraînement** lance le parcours départ → course → résultats; **Refaire cet exercice** et **Changer les réglages** servent ensuite deux intentions distinctes.

L’accès d’un invité à ce parcours reste à cadrer. S’il est autorisé à participer à un entraînement préparé, ses résultats restent temporaires; il ne reçoit pas le pouvoir de créer une salle. Le design ne contourne pas cette restriction par une création silencieuse. Tant que l’accès n’est pas résolu, conserver son état de permission explicite.

**États.** Préparation des bots : attente nommée sans faux départ. Configuration invalide : erreur au groupe concerné. Aucun bot disponible ou incident moteur : garder les réglages et proposer Réessayer. Aucune performance permanente pour l’invité; aucun résultat de bot mélangé à la heatmap personnelle.

**Mobile, clavier, thèmes.** Configuration en une colonne, niveaux avec description textuelle; même TypingField que la course collective. Les bots gardent leur badge pendant la course, le podium et l’historique. Les effets arcade ne sont pas imposés à un entraînement comparable.

## 12. Résultats : le groupe, puis ton progrès

**But :** reconnaître la course, expliquer sa performance et choisir la suite. **Exigences :** STAT-01 à STAT-06 et ROOM-09.

**Ordre de lecture :** état final → podium / classement → résultat personnel → détails → prochaine action. Le podium utilise rose, citron et lavande; le panneau personnel reste sobre. Le rang est écrit. L’ordre accessible est 1, 2, 3 même si la composition bureau place visuellement 2, 1, 3.

| Zone | Contenu attendu |
|---|---|
| Résumé de l’épreuve | Salle, mode, langue, règle, durée et statut; résultat confirmé par le serveur |
| Podium et classement | Noms, rangs, vitesse, précision et score si sa définition est retenue; Terminé / Abandonné explicités |
| Résultat personnel | Vitesse, précision, erreurs, corrections et évolution pendant la course; unités et définitions accessibles |
| Progrès comparable | Une comparaison avec un exercice aux règles comparables, si les données permettent cette conclusion |
| Heatmap | Touches et fréquence d’erreur, légende numérique, méthode de calcul et tableau équivalent |
| Suite | Hôte : **Lancer une revanche** / **Fermer la salle**; participant : état d’attente, **Quitter**; entraînement : **Recommencer** |

« Chaque touche compte. » peut ouvrir le résultat. « 3 erreurs de moins. Bien joué. » n’apparaît que si les données le démontrent. Première course : « Premier repère. Rejoue pour suivre ton progrès. » Données non comparables : « Ces exercices ont des règles différentes. » Ne pas calculer un écart rassurant à partir d’un exercice plus court, d’une autre langue ou d’effets arcade. Les dimensions exactes d’une comparaison seront définies dans le domaine.

La heatmap écrit les touches et leurs valeurs; sa légende distingue **Aucune erreur mesurée**, les classes d’erreurs et **Pas de donnée**. La disposition du clavier représenté doit être choisie ou confirmée; ne pas déduire le clavier de la seule langue d’interface. Un tableau Touche / Erreurs / Frappes / Indicateur retenu fournit les mêmes informations sans couleur. La fréquence et les nombres bruts restent distinguables.

**États.** Calcul : « Résultats en préparation… »; partiel : indiquer les données manquantes sans afficher zéro. Course annulée : état dédié, pas de victoire ni de record attribué. Heatmap vide : « Pas assez de données pour afficher les touches à travailler. » Zéro erreur observée : le dire, sans prétendre qu’aucune difficulté n’existe. Invitation à créer un compte : facultative pour l’invité, sans promettre migration automatique de sa session.

**Mobile, clavier, thèmes.** Podium en liste compacte si trois colonnes nuisent aux noms. Résultat personnel avant graphiques secondaires. Tableau accessible par lecture et défilement horizontal nommé si nécessaire; résumé lisible sans défilement. Onglets de détail clavier, contenus disponibles sans célébration. Les touches colorées gardent un texte encre ou une paire sémantique vérifiée dans le thème choisi.

## 13. Profil, historique et session invitée

**But :** voir une progression durable ou retrouver les résultats de la session. **Exigences :** STAT-04 à STAT-06 et AUTH-04.

Le profil de compte commence par pseudonyme et synthèse personnelle : courses, vitesse moyenne, classement moyen, victoires. Les définitions et la période sont visibles. Puis viennent historique filtrable et évolution comparable. La **heatmap de chaque course est essentielle / P1**; la **heatmap globale du profil est souhaitable / P2**, comme le précise le PDF du 2 octobre. Les avatars de touche reprennent le système existant; aucune boutique cosmétique ou réseau social n’est ajouté.

L’historique présente date, mode, langue du contenu, règle / longueur utiles, vitesse, précision, rang et statut. Une ligne mène à un détail autorisé. Les filtres Classique / Arcade, période et langue ne mélangent pas les bases de comparaison. Le nombre de courses affiché est réel; une donnée manquante vaut **—**, pas zéro.

La session invitée porte le titre **Tes courses de cette session**, conserve les résultats successifs autorisés et écrit leur caractère temporaire. Elle n’affiche pas de bilan permanent ni de record sur plusieurs jours. Les statistiques privées ne deviennent pas consultables par un enseignant du seul fait de son métier; la visibilité publique et la rétention restent à décider.

**États.** Aucun historique : « Ton prochain départ sera ton premier repère. » avec **Rejoindre une course** et entraînement autorisé. Filtre vide : Effacer les filtres. Lecture refusée : retour vers ses propres résultats sans révéler d’autres données. Session invitée terminée : « Les résultats de cette session ne sont plus disponibles. » Erreur réseau : réessayer sans remplacer le bilan par de faux zéros.

**Mobile, clavier, thèmes.** Métriques sur deux colonnes ou lignes; historique en cartes à libellés plutôt qu’un tableau écrasé. Graphiques accompagnés d’un résumé et de données lisibles. La navigation des détails revient au filtre et à la position de consultation lorsque cela peut être conservé.

## 14. Préférences : une expérience qui te convient

**But :** régler l’interface sans altérer la course. **Exigences :** UX-02, CONF-03 et RACE-05.

Titre **À ton rythme**; groupes Apparence, Langue et Effets. Contrôles natifs quand ils suffisent.

| Groupe | Choix et explication |
|---|---|
| Thème | Clair / Sombre; Système possible comme proposition complémentaire |
| Langue d’interface | Français / English; « Ce choix ne change pas le texte de la course. » |
| Sons | Actifs / Coupés; le navigateur peut demander une interaction préalable |
| Mouvement | Respect de la préférence système; réduction explicite proposée |
| Effets forts | Désactivation des animations fortes et obstructions; retour de jeu textuel conservé |

Une modification d’apparence s’applique sans perdre le focus ni réinitialiser la saisie. La langue change les libellés et messages, pas le texte figé de l’exercice. Les réglages de course demeurent dans la salle. Éviter un bouton Sauvegarder décoratif si chaque choix est effectivement enregistré au changement; si la sauvegarde est différée, l’action et l’état sont explicites.

**États.** Sauvegarde : confirmation polie. Échec : « Appliqué sur cet appareil; la sauvegarde du compte a échoué. Réessayer. » seulement si ce repli local a réellement réussi. Une préférence locale inexistante n’est pas présentée comme persistée. Sans compte, expliquer la portée sur l’appareil/session selon le mécanisme retenu; ne pas annoncer une synchronisation multi-appareils.

**Mobile, clavier, thèmes.** Une ligne par réglage, libellé et aide avant le contrôle si l’espace manque. Le changement de thème vérifie également menu, dialogue, champs, graphiques et focus. Le mouvement réduit supprime les déplacements sans supprimer les badges, les messages ou l’état d’une capacité.

## 15. Incidents, reconnexion et départ volontaire

Les états suivants font partie du design de toutes les pages. Ils ne se résument pas à une erreur générique dans un toast.

| Situation | Message proposé | Action utile et données conservées |
|---|---|---|
| Page introuvable | « Cette page n’est plus ici. » | **Accueil**; lien Courses publiques si pertinent |
| Salle inconnue / non accessible | « Cette salle n’est pas accessible avec cet accès. » | Corriger le code ou obtenir un lien, sans divulguer une salle privée |
| Salle fermée | « Cette salle est fermée. » | Courses publiques / Accueil; résultat antérieur uniquement si sa lecture reste autorisée |
| Salle pleine | « Toutes les places sont prises. » | Réessayer ou choisir une autre salle; pas d’admission locale inventée |
| Arrivée après départ | « La course est en cours. Tu peux la regarder. » | **Regarder**, si autorisé; rôle spectateur jusqu’à la suivante |
| Exclusion | « L’hôte t’a retiré de cette salle. » | Retour aux courses; ne pas proposer une reconnexion qui contourne l’exclusion |
| Reconnexion courte | « Reconnexion… Ta place est conservée pendant la reprise autorisée. » | Dernier état identifié, texte et valeur locale conservés; reprise sur instantané confirmé |
| Reprise impossible | « Ta place ne peut plus être reprise dans cette course. » | Accueil ou observation autorisée; ancienne identité non réadmise comme participant après le départ |
| Interruption serveur | « La course a été interrompue. » | Retour salon si disponible; pas de gagnant déclaré |
| Résultats indisponibles | « Les résultats ne sont pas disponibles pour le moment. » | **Réessayer**; distinguer incident temporaire et suppression définitive |

Les délais précis ne sont pas codés dans les textes avant décision. Un simple retrait du réseau ne vaut pas départ volontaire. Pendant une reprise, les commandes serveur restent suspendues; le client ne modifie ni hôte ni classement de sa propre autorité. La nouvelle réponse confirme la phase, la place et les permissions.

### Quitter et transmettre l’hôte

Pour un participant, le dialogue **Quitter cette course ?** explique l’abandon et propose **Rester** puis **Quitter**. Son effet sur la course et les résultats dépend de la règle de domaine; aucun résultat gagnant n’est attribué à un abandon.

Pour l’hôte, **Quitter et transmettre** présente les membres éligibles et l’option de choisir un successeur. Texte : « Choisis qui reprend le salon. Sans choix, le plus ancien participant éligible prend le relais. » L’éligibilité exacte reste à définir; bots, spectateurs ou membres déconnectés ne sont pas déclarés admissibles par le seul design. Un invité héritier pourrait recevoir une autorité temporaire, si cette proposition est retenue, sans droit de création ailleurs.

**Fermer la salle** est une action distincte qui annonce l’effet sur tout le groupe et attend la confirmation du serveur. À l’échec, le dialogue conserve le contexte. À la réussite, la sortie dirige vers une page logique; le bouton déclencheur disparu ne peut plus recevoir le focus. Pour les personnes qui restent, un statut annonce « Nova reprend l’hôte » et le même instantané met à jour badge, résumé et commandes. La frappe ne doit pas être interrompue par une modale à chaque transfert.

**Mobile, clavier, thèmes.** Dialogues accessibles, actions empilées au besoin, texte lisible sans défilement sous le bouton. La couleur d’erreur peut renforcer Fermer ou Quitter mais ne remplace pas le libellé et son explication. Escape revient à la salle tant qu’une commande irréversible n’est pas déjà confirmée; ne pas prétendre annuler une commande serveur exécutée.

## 16. Français / anglais et contenu réel

Tous les titres, aides, erreurs, statuts, labels de graphiques et noms accessibles sont traduits. La langue du document et le format des dates suivent l’interface. La langue de l’exercice reste celle décidée par l’hôte; elle est signalée séparément et peut porter son propre attribut de langue.

| Situation | Français proposé | Anglais proposé |
|---|---|---|
| Accueil | Ton clavier. Toute une arène. | Your keyboard. A whole arena. |
| Admission | Rejoindre avec un code | Join with a code |
| Liste publique | Trouve ta prochaine course | Find your next race |
| Création | Crée la course du groupe | Set up the group’s race |
| Invité | Une place, sans compte | A place, no account needed |
| Compte local | Pas de récupération de mot de passe | No password recovery |
| Préparation | Je suis prêt | I’m ready |
| Départ | Prêt ? À tes touches. | Ready? Keys set. |
| Spectateur | Tu regardes cette course | You’re watching this race |
| Erreur bloquante | Corrige le caractère souligné pour continuer | Correct the underlined character to continue |
| Fin personnelle | Tu as terminé. Le groupe finit sa course. | You’re done. The group is finishing the race. |
| Calcul | Résultats en préparation… | Preparing results… |
| Premier résultat | Premier repère. Rejoue pour suivre ton progrès. | Your first benchmark. Play again to track your progress. |
| Invitation utilisée | Cette invitation a déjà été utilisée | This invitation has already been used |
| Reprise | Reprendre ma place | Resume my place |
| Préférences | Ce choix ne change pas le texte de la course | This won’t change the race text |

Les traductions ci-dessus sont des propositions à relire avec les utilisateurs; elles ne constituent pas une traduction humaine validée. Les pluriels, formats et messages variables ne sont pas assemblés par fragments traduits. Afficher **MPM / mots par minute** en français et **WPM / words per minute** en anglais avec la même définition de mesure, à fixer dans le domaine. Ne pas changer le calcul lorsque le libellé change.

## 17. Réalisation future avec React, Next.js et Tailwind

La pile demandée reste **React, Next.js, TypeScript, Tailwind CSS et PostgreSQL**. Cette spécification n’ajoute ni dépendance ni version. Les références techniques déjà consultées et les comportements proposés sont développés dans [les composants](14-composants-interface.md).

| Frontière | Contrat à réaliser |
|---|---|
| Pages et layouts Next.js | Lecture initiale de l’identité, autorisations et données permises côté serveur; enveloppe de navigation partagée; destination conservée pendant la connexion |
| Îlots interactifs React | Formulaires, menu, dialogues, préférences et abonnements ciblés; ne pas rendre tout le layout client pour une seule interaction |
| Salle en direct | Une phase confirmée; commandes identifiées; chargement, refus et résultat séparés; rendu stable par identifiant de membre |
| Zone de frappe | Champ jamais remonté à chaque instantané; état local immédiat isolé; composition respectée; texte fixe et événements validables distincts |
| Données personnelles | Résultats et historique lus selon l’identité; session temporaire distincte du compte; aucune donnée privée ajoutée au client par commodité |
| Tokens Tailwind | Alias sémantiques sur les variables existantes; pas une palette réinventée par page; variantes focus, attente, refus et thème |
| Primitives | HTML natif pour contrôles simples; une bibliothèque de primitives accessible à sélectionner pour comportements complexes; style original conservé |
| Polices | Fichiers autorisés et chargement maîtrisé avant le départ; vérification des glyphes FR/EN et des métriques de repli |

Les erreurs de route, de chargement et de domaine n’ont pas le même sens. Le rendu doit distinguer **données absentes**, **permission refusée** et **réseau indisponible**. Une garde visuelle ne remplace jamais la validation de la commande ou de l’accès côté serveur.

Les mises à jour optimistes éventuelles restent explicitement provisoires. Une copie de presse-papiers est confirmée par son API locale; génération d’invitation, préparation, modification de règles, départ, exclusion et transfert attendent l’autorité prévue. Les retours d’attente conservent les dimensions et empêchent les doubles commandes sans confondre chargement et indisponibilité.

## 18. Vérifications avant de considérer une page terminée

| Vérification | Critère observable à réaliser |
|---|---|
| Parcours de bout en bout | Accueil → identité → admission → salon → départ → course → résultat; branche invité et branche hôte distinctes |
| Toutes les variantes d’accès | Public listé, semi-public par code, privé par lien individuel; aucune autre entrée privée inventée |
| Permissions | Invité bloqué avant création; réglages hôte seulement; spectateur sans contrôle de frappe; permissions actualisées après transfert |
| États | Chargement, vide, erreur, refus, hors ligne, terminé et annulé réellement distinguables; données et actions conservées quand c’est utile |
| Deux langues | Aucun label, erreur, nom accessible ou unité oublié; UI indépendante du contenu; boutons anglais sans troncature |
| Deux thèmes | Texte, contours, focus, dialogues, heatmap et états vérifiés sur leurs fonds réels; accents expressifs conservés |
| Petit écran | Parcours à 390 px; pas de défilement horizontal général; clavier virtuel et zoom testés; données longues consultables |
| Clavier | Liens, formulaires, menus, onglets et dialogues utilisables; retour de focus; pas de raccourci volant une lettre à l’exercice |
| Frappe | Début à 0 %, fin sans curseur disparu, accents et IME, correction et surplus; aucune variation de largeur due à l’état; pas de défilement automatique |
| Réseau | Reprise du même membre, snapshot et permissions; exclusion distincte d’une panne; aucune frappe hors ligne créditée |
| Groupe | Affichage et navigation avec 30 personnes; bots identifiés; spectateurs exclus du classement des concurrents |
| Résultats | Classement confirmé, données manquantes explicites, heatmap avec table, comparaison justifiée; aucun record inventé |
| Réduction des effets | Son facultatif, mouvement réduit et effets forts désactivables; information équivalente conservée |

### Ordre de réalisation

1. **CP1 :** enveloppe FR/EN et clair/sombre, authentification initiale, création autorisée, admission par code, salon et réglages synchronisés. Démontrer la persistance, la CI et le déploiement avec des preuves séparées du design.
2. **Course centrale :** départ, frappe classique, reconnexion, classement et résultats confirmés; cohérence de toutes les erreurs et permissions.
3. **Produit final :** accès complets, privé, bots, historique, heatmap de course et progression; **au moins deux mécanismes de rattrapage essentiels en finale**, avec règles documentées et testées. Le choix des effets, leur attribution et leur équilibrage restent à arbitrer, sans remettre leur inclusion en attente. L’objectif de vitesse et la heatmap globale enrichissent ensuite ce noyau comme éléments souhaitables / P2.

Cette extension réutilise la recherche et la direction v0.4; elle n’ouvre pas une nouvelle exploration de 50 sites. Elle précise les pages nécessaires pour que la personnalité du projet accompagne tout le parcours, y compris ses interruptions, avec des comportements à réaliser et à vérifier honnêtement.
