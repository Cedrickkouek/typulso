# Plan complet des pages et des états

**Auteur : YANN CEDRICK KOUEKAM TELEWOU**

> **Authentification actuelle :** j’ai limité la connexion aux comptes au **pseudonyme et au mot de passe**. Les options **OAuth GitHub/Discord sont prévues pour la suite**; le code préparatoire ne constitue pas une connexion externe livrée. L’accès invité reste distinct de l’authentification d’un compte.

> **Portée :** je conserve ici mes recherches, propositions ou observations à leur date. Ces éléments expliquent ma démarche de conception; une maquette ou un test prévu ne constitue pas une preuve de fonctionnement en production.

> **2 octobre 2026 · Direction artistique v0.4 conservée**  
> Périmètre : conception de tous les parcours du produit, avec français/anglais et clair/sombre  
> Statut : plan de design; les données de maquette sont fictives, les garanties serveur restent à réaliser


La demande actuelle complète les pages en conservant la direction choisie. Elle n'ouvre pas une nouvelle recherche de style. Toutes les vues réutilisent la DA v0.4 : action citron, accents rose/lavande/bleu, surfaces calmes, formes de touches originales, contrôles de 44 px et rayons de référence 12/24/16 px. La zone de frappe demeure stable; les effets sont secondaires, désactivables et interrompus en mode concentration ou mouvement réduit.

**Le nom Typulso et les symboles restent des propositions de travail.** Conserver cette DA pour concevoir les pages ne prouve ni le choix définitif du nom, ni une création humaine du logo. UX-03 demande une démarche humaine documentée; les contributions assistées doivent garder leur attribution réelle.

## 1. Sources et priorités

Le PDF fourni le 2 octobre, **`cahier-des-charges.pdf`**, comporte cinq pages. Ce plan utilise la lecture intégrale de son extraction textuelle locale, comparée aux documents 01, 02, 04 et au registre des réponses client. Cette lecture vérifie le contenu textuel; elle ne constitue pas une inspection de la mise en page du PDF. L'extraction est un fichier de travail, pas une preuve d'application fonctionnelle.

| Repère | Contenu source |
|---|---|
| **PDF p. 1** | Vision 12–17 ans et glossaire : hôte, salle, participant, spectateur, invité, accès et heatmap |
| **PDF p. 2–3** | AUTH, ROLE, ROOM, CONF, RACE, BOT, BONUS, STAT, UX et TECH : les 49 IDs produit concordent avec le cahier consolidé |
| **PDF p. 4–5** | Contradictions, questions, dix hypothèses, priorité finale et portée initiale de CP1 |
| **CLIENT-01 à CLIENT-08** | Réponses écrites : égalité des comptes, invités, codes/liens, reconnexion, succession et piste des personnages |
| **CP1-01 à CP1-10** | Grille postérieure : salon créé/rejoint par code en temps réel, authentification, PostgreSQL, HTTPS, CI et documents |
| **DA / UX / composants** | Structure et habillage v0.4 conservés; routes et organisation des panneaux restent des propositions d'implémentation |

Les IDs **PG-*** ci-dessous identifient des vues de conception, pas de nouvelles exigences du client. Une vue peut être un panneau ou un état d'une même route. Les routes proposées reprennent le préfixe `/[locale]`; elles ne sont pas présentées comme déjà implémentées.

| Priorité | Signification pour le produit | Signification pour le travail de design actuel |
|---|---|---|
| **P0 · CP1** | Écran ou fondation nécessaire au premier checkpoint | À concevoir et vérifier avec les états d'accès et de réseau pertinents |
| **P1 · final essentiel** | Exigence finale; le moteur complet peut suivre CP1 | À concevoir maintenant dans la même DA, sans annoncer son fonctionnement réel |
| **P2 · souhaitable** | Enrichissement explicitement souhaitable ou choix de conception | Prévoir une variante identifiée; ne pas le rendre nécessaire pour terminer un parcours essentiel |
| **P3 · extension** | Fonction hors minimum | Ne pas introduire de page indispensable ni d'engagement de réalisation |

### Divergences à conserver visibles

La comparaison ci-dessous décrit les versions documentaires **avant leur mise à jour du 2 octobre**. Les documents 01, 02 et 09 intègrent maintenant les priorités précisées par le PDF; les écarts restent consignés pour comprendre la correction.

| Point | PDF fourni | Documents existants | Traitement dans ce plan |
|---|---|---|---|
| **Partie rapide, revanche, bots variables** | Essentiels dans la priorisation p. 5 | Le document 01 place partie rapide, revanche et bots avancés après le noyau | Conception **P1 finale** de l'accès rapide, de la revanche et de plusieurs niveaux variables; les raffinements restent différables |
| **Deux bonus** | BONUS-01 et priorisation p. 5 les classent essentiels | 01/02/09 conservent une ancienne contradiction « obligatoire / souhaitable » | Le PDF clarifie leur priorité finale : dessiner les états de **deux mécanismes**. Leurs effets, attribution et équilibre ne sont pas encore choisis |
| **Heatmap globale** | Heatmap après course obligatoire; heatmap globale souhaitable p. 5 | 01 STAT-04 ajoute la heatmap globale à l'historique obligatoire | **PG-10 : heatmap de course P1**; **PG-14 : heatmap globale P2**, sans supprimer son design |
| **Objectif de vitesse** | Souhaitable p. 5; CONF-06 impose seulement la limite de temps facultative | 01/02 le joignent à CONF-06 | Option **P2**, distincte des règles de fin |
| **Progression détaillée** | Progression minimale essentielle; progression détaillée souhaitable | 01 diffère l'enrichissement | **PG-12/14 P1** pour l'amélioration visible; récompenses, objectifs et analyses détaillés **P2** |
| **HYP-01** | Accès des invités aux trois types de salle | 01/02 : priorité de la transcription sur les notes | Écrire **PDF-HYP-01** pour ce besoin dans ce plan; ne pas réattribuer silencieusement l'ID canonique |
| **Rôles et création invité** | Questions encore ouvertes p. 4 | Réponses client : aucun rôle enseignant particulier; invité ne crée pas | CLIENT-01/02 résolvent ces questions; aucune page de gestion de classe |
| **Code QR et privé** | Ambiguïté du QR semi-public p. 4 | CLIENT-03/04 : code semi-public, QR facultatif; privé par lien uniquement | QR seulement pour le semi-public; aucune entrée privée par code ou QR |
| **CP1** | HTTPS/authentification/DA; moteur complet peut attendre p. 5 | Grille plus précise : création, admission par code et propagation temps réel dès CP1 | Appliquer **CP1-06**; la formulation initiale ne retire pas le salon du checkpoint |
| **Arcade distinct** | HYP-07 distingue les résultats avec bonus selon leurs règles | 01 propose un mode arcade et un entraînement sans bonus | Mode séparé utile mais proposé; toujours afficher les conditions et conserver les métriques de frappe distinctes du score de jeu |

La réconciliation documentaire de priorité est effectuée dans 01/02/09, sans supprimer d'ID. Les paramètres encore ouverts restent à décider et les comportements à vérifier avant l'acceptation finale, sans changer la DA.

## 2. Rôles et règles transversales

| Identité ou rôle | Peut voir | Peut agir | Restrictions à représenter |
|---|---|---|---|
| **Visiteur sans identité active** | Accueil, modes d'accès, salles publiques et préférences de consultation | Choisir une méthode d'accès, saisir un code ou ouvrir son invitation | L'admission demande ensuite une identité de compte ou un pseudo invité; aucune création de salle |
| **Compte** | Ses statistiques permanentes et les données publiques autorisées des courses | Créer, rejoindre, pratiquer; devenir hôte de sa salle | Étudiant/enseignant : mêmes droits, sans bouton ni tableau de bord réservé au professeur |
| **Invité** | Salle admise, course et ses résultats de session | Rejoindre les trois accès avec leur justificatif; participer selon l'état de la salle | Pas de création, pas de reprise automatique sur plusieurs jours, pas d'historique de compte; transfert d'hôte à un invité reste un cas à arbitrer |
| **Hôte temporaire** | Même contenu que les membres; commandes et invitations de sa salle | Régler avant départ, désigner les spectateurs, exclure, lancer, choisir le successeur, revanche ou fermeture | Droits attachés à cette salle; une courte déconnexion n'est pas un abandon volontaire |
| **Participant** | Texte, progression, position et résultats autorisés | Se préparer, taper pendant sa course, abandonner ou quitter | Réglages en lecture seule; pas de collage; règles figées au départ |
| **Spectateur** | Course et classement autorisés, état du groupe | Observer et quitter; devenir admissible à la course suivante selon le rôle retenu | Aucun champ actif de frappe ni capacité de jeu pendant cette course; arrivée tardive reçoit cet état |
| **Bot** | Représentation clairement étiquetée dans le salon, la piste et les résultats | Concurrence simulée selon un niveau annoncé | Pas de compte humain ni commandes d'hôte; les règles et l'admission humaine restent indépendantes |

**Visibilité des données.** Un hôte n'obtient pas automatiquement l'historique personnel des autres. Un enseignant n'obtient aucun accès supplémentaire. Le profil, les moyennes permanentes, la progression et la heatmap globale d'une autre personne ne sont pas exposés tant que la politique de visibilité n'est pas décidée. Les statistiques publiques d'une course restent distinctes des données privées de compte. Sources : STAT-02/04/05, CLIENT-01, question PDF p. 4 sur les données des mineurs.

**Accès.** Une salle publique est répertoriée; une salle semi-publique ne l'est pas et se rejoint par code; une salle privée ne l'est pas et exige un lien individuel à usage unique. Le QR ne change jamais les permissions. La session d'un membre déjà admis permet la reconnexion sans consommer une seconde fois l'invitation; un nouvel entrant ne peut pas réutiliser son jeton. Le détail de liaison du jeton à l'identité reste un contrat serveur à vérifier.

## 3. Inventaire des vues

| Vue | Page ou panneau / route indicative | Priorité | Rôles | Sources principales |
|---|---|---|---|---|
| **PG-01** | Accueil et partie rapide · `/[locale]` | P0 accueil; P1 partie rapide | Tous | ROOM-02/03, AUTH-01/02, UX-01/02, CLIENT-02 |
| **PG-02** | Salles publiques · `/[locale]/salles` ou panneau d'accueil | P1 | Tous; admission après identité | ROOM-01/02/08, PDF p. 1, CLIENT-03/04 |
| **PG-03** | Rejoindre par code · panneau d'accueil ou `/[locale]/rejoindre` | P0 | Compte/invité; visiteur guidé vers identité | ROOM-01/04, AUTH-04, CLIENT-03, CP1-06 |
| **PG-04** | Choisir son accès / connexion · `/[locale]/connexion` | P0 première méthode; P1 quatre accès | Visiteur; compte déconnecté | AUTH-01/02/03/04, CLIENT-02, CP1-02 |
| **PG-05** | Inscription locale et pseudo invité · panneaux de PG-04 | P0 si méthode retenue; P1 final | Visiteur | AUTH-03/04, STAT-05, CLIENT-02 |
| **PG-06** | Admission par invitation privée · `/[locale]/invitation/[token]` | P1 | Compte/invité invité; hôte pour réémission | ROOM-01/05/06, CLIENT-04/08, PDF-HYP-01 |
| **PG-07** | Créer/configurer · `/[locale]/salles/nouvelle` puis panneau du salon | P0 création/bases; P1 règles complètes | Compte créateur; hôte de cette salle | ROLE-01, ROOM-01/04, CONF-01 à CONF-08, BOT-01/02, BONUS-01/03 |
| **PG-08** | Salon, membres et invitations · `/[locale]/salles/[id]` | P0 partagé; P1 droits/cycle complet | Hôte, participants, spectateurs | ROLE-02, ROOM-04 à ROOM-09, RACE-01, CLIENT-03 à CLIENT-06, CP1-06 |
| **PG-09** | Course participant / spectateur · même route selon l'état serveur | P1 | Participants; spectateurs; bots étiquetés | CONF-07 à CONF-10, RACE-01 à RACE-05, ROOM-05/06/07/08, BONUS-01 à BONUS-03 |
| **PG-10** | Résultats, classement et heatmap de course · même salle; détail personnel autorisé | P1 | Membres autorisés; hôte pour commandes | STAT-01 à STAT-05, ROOM-09, CONF-08/09, PDF p. 3 |
| **PG-11** | Entraînement et bots · `/[locale]/entrainement` | P1 | Comptes; entrée invité à arbitrer | BOT-01/02, HYP-03, CLIENT-02, CONF-01 à CONF-10 |
| **PG-12** | Profil personnel / session · `/[locale]/profil` | P1 | Compte propriétaire; invité pour sa session | STAT-04/05/06, AUTH-04, CLIENT-01 |
| **PG-13** | Historique et détail d'une course · `/[locale]/profil/historique` et détail autorisé | P1 | Propriétaire; invité limité à sa session | STAT-01/02/03/04/05, HYP-07 |
| **PG-14** | Progression et heatmap globale · panneau du profil | P1 progression minimale; P2 heatmap globale/détail | Compte propriétaire; progression de session si données disponibles | STAT-04/05/06, PDF p. 5 souhaitable |
| **PG-15** | Préférences · `/[locale]/preferences` | P0 langue/thème; P1 effets et expérience complète | Tous, avec portée de sauvegarde explicite | UX-02, RACE-05, CONF-03, HYP-09/10 |
| **PG-16** | Règles, aide contextuelle et capacités · panneaux des modes/course/résultats | P1 explication; page autonome facultative | Tous selon contexte | CONF-07/08/09, BONUS-01/02/03, CLIENT-07, STAT-01 |
| **PG-17** | Indisponible, accès refusé, fermé ou introuvable · états contextualisés | P0 sur écrans CP1; P1 partout | Tous | ROOM-01/06/07/09, AUTH-01/04, CLIENT-02/04/05/06, UX-02 |

La navigation n'offre pas librement « Salon / Course / Résultats » comme des pages interchangeables dans le produit réel : ces vues suivent l'état de la salle. Un sélecteur d'aperçu peut les exposer pour la revue, à condition de l'identifier comme outil de démonstration.

## 4. Entrée, action, sortie et états de chaque vue

### PG-01 — Accueil et partie rapide

**Entrée :** visite directe, retour d'une salle ou déconnexion du compte. **Action principale :** rejoindre par code; actions voisines : partie rapide et création pour compte. La connexion actuelle utilise le pseudonyme et le mot de passe; les accès OAuth Discord/GitHub sont réservés à une évolution ultérieure. **Sortie :** admission → PG-08; besoin d'identité → PG-04/05 avec la destination conservée; créer → PG-07; découvrir une salle publique → PG-02.

**États :** visiteur, compte, invité actif; recherche de course en cours, salle trouvée, aucune disponible, service indisponible. Pour un compte autorisé, le repli de la partie rapide crée une salle si aucune n'est prête. Pour l'invité, proposer connexion/inscription ou retour aux salles : aucune création automatique. Ce repli invité reprend la proposition de UX 04, pas une réponse client nouvelle. Ne pas afficher de faux nombre de joueurs en ligne. Sources : ROOM-02/03, CLIENT-02.

### PG-02 — Salles publiques

**Entrée :** accueil ou retour après salle fermée. **Actions :** lire une liste, rejoindre une salle publique en attente, revenir au code ou créer avec compte. Une carte affiche nom, état, langue du contenu, mode, règles résumées et places à partir de données confirmées. **Sortie :** identité si nécessaire, puis PG-08; arrivée durant une course → PG-09 spectateur, si admise.

**États :** chargement, liste disponible, aucune salle, complet, départ survenu pendant l'admission, liste obsolète, indisponible, hors ligne. Semi-public et privé sont absents de la liste. La capacité annoncée n'est pas « illimitée »; la cible de 30 personnes n'est pas présentée comme un test réussi. Le tri et les filtres sont des choix de conception; ils ne doivent pas devenir des prérequis pour rejoindre. Sources : ROOM-01/05/08.

### PG-03 — Rejoindre par code

**Entrée :** action de l'accueil ou code déjà transmis. **Actions :** saisir le code, corriger, soumettre; conserver le code au travers de PG-04/05 sans afficher d'information privée. **Sortie :** admission confirmée → PG-08; nouvel arrivant après départ → PG-09 spectateur; annuler → PG-01.

**États :** champ vide, format invalide, soumission, code inconnu/expiré, salle complète/fermée, exclusion, admission réussie, réseau indisponible. Le format exact reste mon choix de conception : ne pas coder visuellement une longueur comme exigence du client. Le formulaire ne permet pas l'accès privé. Le QR facultatif représente le même accès semi-public. Sources : ROOM-01/05, CLIENT-03/04, CP1-06.

### PG-04 — Choisir son accès / connexion

**Entrée :** compte déconnecté, admission en attente ou tentative de création par invité. **Actions actuelles :** connexion par pseudonyme/mot de passe; continuer en invité pour rejoindre; annuler. **Évolution prévue :** options OAuth Discord et GitHub. **Sortie :** vers la destination autorisée conservée. Une entrée invitée ne poursuit jamais vers PG-07.

**États actuels :** identifiants incorrects, session expirée, compte déjà connecté. **États prévus avec OAuth :** fournisseur indisponible, redirection, consentement refusé et callback en attente/échoué. Dans un aperçu local, une action OAuth indique clairement qu'elle est simulée; elle ne promet pas une connexion réelle. Pas de champ courriel, pas de lien « mot de passe oublié » proposant une récupération inexistante. Liaison de fournisseurs multiples : P2, pas un passage obligé. Sources : AUTH-01 à AUTH-04, CLIENT-02.

### PG-05 — Inscription locale / pseudo invité

**Entrée :** choix correspondant dans PG-04. **Actions :** créer un compte local avec nom et mot de passe; ou choisir un pseudo de session pour rejoindre. L'avertissement d'absence de récupération apparaît avant la création locale; la durée et la portée des statistiques invitées sont expliquées sans valeur inventée. **Sortie :** compte → PG-07 ou admission demandée; invité → admission demandée; retour → PG-04.

**États :** vide, erreur de champ, nom indisponible, pseudo invalide, enregistrement en cours, service indisponible, identité active, expiration de session. Les bornes de nom/mot de passe et le filtrage automatique sont à choisir; ne pas les attribuer au cahier. Aucun rôle enseignant/étudiant à choisir pour obtenir des droits différents. Sources : AUTH-03/04, STAT-05, CLIENT-01/02.

### PG-06 — Invitation privée

**Entrée :** lien individuel. **Actions :** comprendre la destination autorisée, choisir son identité si nécessaire, accepter l'invitation; revenir ou demander un nouveau lien à l'hôte. **Sortie :** PG-08 ou PG-09 spectateur selon état; lien inutilisable → PG-17 contextuel. Conserver l'intention pendant la connexion sans exposer le token dans une vue de profil ou des journaux.

**États :** vérification, valide, admission en cours, expirée, consommée par un autre entrant, révoquée, invalide, salle fermée/complète, membre déjà admis qui revient. Ne pas consommer le jeton au simple affichage ou avant l'identité/admission confirmée. L'usage unique et l'expiration sont indépendants. Une reconnexion reconnue rejoint sa place existante; un lien copié ne donne pas une deuxième admission. La durée est que je définis, aucune valeur n'est confirmée par CLIENT-08.

### PG-07 — Créer et configurer

**Entrée :** compte autorisé; invité intercepté par PG-04 avant une longue saisie. **Actions :** choisir accès public/semi-public/privé et créer; hôte règle ensuite la course. **Sortie :** création confirmée → PG-08; annulation → origine; validation refusée → garder les valeurs corrigibles. Les autres membres voient le résumé sans pouvoir modifier.

**Groupes de réglages à couvrir :**

| Groupe | Contrôles / contenus | Sources / portée |
|---|---|---|
| Contenu | Texte cohérent, suite de mots, personnalisé; prévisualisation; langue du contenu indépendante de l'interface | CONF-01/02/03, P1; génération par corpus/règles sans IA |
| Difficulté de texte | Thème, accents, ponctuation, chiffres, caractères spéciaux; longueur; caractères interdits | CONF-04/05, P1; contraintes impossibles avec retour explicite |
| Temps et erreurs | Limite facultative; mode bloquant/non bloquant; pénalité expliquée; politique de fin | CONF-06/07/08/09, P1; objectif de vitesse P2 |
| Concurrents | Humains présents, bots identifiés, plusieurs niveaux de bots | BOT-01/02, P1; minimum humain+bot selon HYP-03 encore proposé |
| Rattrapage | Deux mécanismes prévus en final, règle d'attribution lisible; personnage/énergie si cette piste est retenue | BONUS-01/02/03, CLIENT-07; effets exacts à arbitrer |
| Invitation | Code pour semi-public; liste de liens individuels pour privé; public répertorié | ROOM-01, CLIENT-03/04/08 |

**États :** défauts identifiés comme proposés, modification en attente, succès serveur, erreur, conflit de version, droits perdus après transfert, règles figées après départ, texte vide/trop long/contraintes incompatibles, création refusée. La prévisualisation d'une génération ne doit pas apparaître comme un contenu final commun avant confirmation serveur. Aucun réglage « illimité », IA intégrée, équipes ou import de fichiers n'est ajouté au minimum.

### PG-08 — Salon, groupe et commandes d'hôte

**Entrée :** création ou admission confirmée, revanche, reconnexion ou retour d'une course annulée. **Action principale :** se préparer pour le membre; lancer pour l'hôte selon conditions. **Actions secondaires :** invitation, régler, désigner spectateur, exclure, ajouter un bot, quitter, choisir un successeur. **Sortie :** départ serveur → PG-09; départ personnel → PG-01/02; fermeture → PG-17.

Le salon présente nom/accès/hôte, nombre et identité des membres, prêt/attente, participant/spectateur/bot, contenu et règles communes. L'état prêt est une proposition UX; les conditions qui bloquent le départ doivent être écrites. La limite de deux concurrents et le bot comme deuxième restent une hypothèse; ne pas afficher une interdiction comme décision client définitive.

**Invitations :** public → accès à la salle publique; semi-public → code copiable et QR optionnel; privé → générer un lien individuel, connaître disponible/consommé/expiré/révoqué, réémettre et révoquer selon contrat retenu. Pas de code/QR privé. « Copié » exige réussite Clipboard API ou confirmation manuelle; « créé/révoqué » exige une confirmation serveur.

**Départ de l'hôte :** dialogue expliquant le transfert; choisir un successeur, puis quitter. Sans choix, le participant le plus ancien devient hôte selon CLIENT-06. Les cas invités, hors ligne, spectateurs, bots et égalités restent à préciser : l'aperçu peut montrer un scénario proposé en le nommant. Une courte interruption garde l'hôte et sa place durant la fenêtre prévue; ne pas déclencher le transfert au premier signal réseau perdu.

**États :** seul/vide, membres en attente, tous prêts, pas assez de concurrents, bot présent, réglage propagé, nouvelle arrivée, exclusion, perte temporaire du réseau, hôte remplacé, lancement en cours/refusé, fermeture confirmée. Sources : ROLE-02, ROOM-04 à ROOM-09, CLIENT-05/06.

### PG-09 — Course participant / spectateur

**Entrée :** même départ serveur pour tous; nouvel arrivant → variante spectateur; participant reconnu après incident → reprise de sa course. **Actions :** taper pour un participant actif, corriger selon mode, utiliser une capacité autorisée si retenue, ouvrir le classement complet, activer concentration/couper effets, abandonner. **Sortie :** course terminée → PG-10; abandon → résultat de son état ou observation selon politique; annulation → PG-08 avec explication.

Hiérarchie : texte à saisir, caractère courant, état/temps, progression personnelle, autres concurrents. Déjà saisi/courant/restant gardent la géométrie du texte; erreur signalée par signe et texte, pas seulement couleur. Collage refusé avec retour bref; accents et composition IME ne sont pas pénalisés prématurément. Les réglages figés restent consultables.

**Classe de 30 :** premier groupe, joueur et voisins sans doublons, puis classement complet; la variante spectateur peut montrer l'ensemble. Les rangs et pourcentages sont écrits. Un tableau ne se réordonne pas sous le focus ou le pointeur. La capacité réelle sera testée; la maquette à 30 prouve seulement la proposition de lisibilité.

**Deux mécanismes :** prévoir indisponible, disponible, activation en attente, appliqué, terminé; indiquer ressource, bénéficiaire, effet et durée/règle confirmée. Aucun obstacle n'empêche l'usage d'une préférence d'accessibilité. La capacité d'un personnage alimentée par une frappe correcte est permise, pas choisie définitivement. Le rattrapage n'offre pas une victoire garantie.

**États :** compte à rebours, active, bloquée par faute, erreur non bloquante, collage refusé, arrivée personnelle, temps expiré, abandon, alerte inactivité, déconnexion/reprise, délai dépassé, spectateur tardif, serveur annulé. Règle commune de fin : tous actifs terminés ou limite expirée, complétée par une politique d'inactivité explicite. Délai après premier arrivé, formule et égalités restent à décider. Sources : CONF-07 à CONF-10, RACE-01 à RACE-05, ROOM-05/06/07/08, BONUS-01 à BONUS-03.

### PG-10 — Résultats et heatmap de la course

**Entrée :** fin autoritaire; accès direct uniquement si autorisé. **Actions :** lire podium/classement/règle, ouvrir ses mesures et heatmap, comparer une performance réellement comparable; hôte lance revanche ou ferme; autre membre attend ou quitte. **Sortie :** revanche → PG-08; historique → PG-13 pour compte ou session; entraînement ciblé → PG-11; départ → PG-01.

**Résultat commun :** rang, pseudo, bot explicite, statut fini/abandonné/déconnecté, score selon formule commune, temps et précision autorisés. Un podium à moins de trois concurrents n'invente pas de personnes. Les courses annulées n'attribuent pas une victoire. Les résultats avec rattrapage montrent les règles et distinguent le résultat arcade des mesures de frappe.

**Panneau personnel obligatoire :** vitesse et unité, précision, erreurs, corrections/temps selon données collectées; progrès seulement si référence comparable; aucun message inventé « meilleur record ». Afficher la portée « cette course » ou « session invitée ».

**Heatmap de course obligatoire :** clavier par touche, erreur/fréquence définie, légende avec valeurs et alternative tabulaire triable. Montrer « pas de donnée » pour touche non pratiquée, distinct de « zéro erreur ». Préciser le texte et le dénominateur utilisé; une touche très fréquente ne paraît pas moins maîtrisée par simple comptage brut. Le calcul exact est à définir. Les accents/caractères spéciaux suivent une convention documentée, pas une correspondance silencieuse avec une touche physique inexistante. Couleur, libellé et valeur coexistent en clair/sombre. Sources : STAT-01/02/03, RACE-03.

**États :** calcul/chargement, confirmé, partiellement indisponible, aucune frappe, zéro erreur, touches non pratiquées, moins de trois résultats, données invitées, comparaison non disponible, revanche en attente/refusée, hôte parti, salle fermée. Les détails privés des autres ne sont pas accessibles par un simple clic sur leur pseudo.

### PG-11 — Entraînement avec bots

**Entrée :** accueil ou prochaine pratique suggérée après résultat. **Actions :** choisir contenu/règles, un niveau de bot ou plusieurs, puis lancer une pratique; rejoindre un entraînement collectif autorisé. **Sortie :** salon/course/résultats réutilisent PG-08/09/10; fin → retour entraînement/profil.

**Restriction invité :** BOT-01 rend la pratique individuelle obligatoire, CLIENT-02 interdit la création aux invités. En l'absence d'arbitrage, l'invité peut rejoindre une salle d'entraînement existante; lancer une nouvelle session de course exige un compte. Un exercice local sans salle pour invité serait une proposition supplémentaire à identifier, pas un contournement implicitement autorisé. Pour un compte, un humain plus bot est le scénario proposé de HYP-03.

**États :** choix du niveau, bot ajouté/retiré, niveau indisponible, création en cours, prêt, en course, résultat. Les niveaux annoncent une plage plausible, pas une vitesse constante garantie. Un niveau spécial « impossible » serait clairement nommé. Aucun bot ne devient hôte; les résultats et moyennes suivent des règles comparables aux autres modes. Sources : BOT-01/02, CLIENT-02, HYP-03/07.

### PG-12 — Profil personnel / session invitée

**Entrée :** menu personnel ou résultats. **Actions :** voir moyenne de vitesse, moyenne de classement, victoires, nombre de courses, derniers résultats; naviguer historique/progression/préférences. **Sortie :** PG-13/14/15 ou reprise d'activité.

**Compte :** ses données permanentes après connexion. **Invité :** variante « Ta session » avec résultats successifs et portée temporelle explicite; proposition de créer un compte sans promettre un transfert des anciennes données non défini. **États :** chargé, premier usage sans historique, aucune course comparable, données indisponibles, session invitée, session expirée, compte déconnecté. Ne pas afficher un profil public d'un autre joueur ni une vue classe pour enseignants. Sources : STAT-04/05/06, CLIENT-01.

### PG-13 — Historique et détail

**Entrée :** PG-12 ou résultat autorisé. **Actions :** lire les courses avec date, mode/règles, vitesse/précision, classement/statut et victoire; ouvrir le détail et la heatmap de la course; filtre léger si utile. **Sortie :** détail → PG-10 en lecture; retour → PG-12; pratiquer → PG-11.

**États :** historique chargé/vide, pagination en cours si choisie, filtre sans résultat, détail inexistant, non autorisé, session expirée, course annulée, mesures non comparables. L'invité n'a que sa session active. Un détail historique ne permet pas de rouvrir une salle fermée ni de lancer une revanche ancienne par une commande de simple lecture. Import/export, partage public et classement permanent global ne sont pas des obligations du cahier. Sources : STAT-01/02/03/04/05, HYP-07.

### PG-14 — Progression et heatmap globale

**Entrée :** PG-12/13. **Actions P1 :** lire l'évolution réelle de vitesse/précision sur des courses comparables, reconnaître une amélioration ou un plateau, choisir une pratique suivante. **Actions P2 :** période, objectif de vitesse, progression détaillée, heatmap cumulée. **Sortie :** entraînement ciblé → PG-11; détail d'une course → PG-13.

**États :** pas encore de données, une seule course, plusieurs comparables, modes incompatibles exclus de la comparaison, plateau, données manquantes, période vide. Aucun gain calculé sur des règles/longueurs modifiées n'est présenté comme un progrès directement comparable. Des badges peuvent illustrer une règle explicite si choisis; ne pas inventer un système de points permanent.

La **heatmap globale P2** reprend légende/table/absence de donnée de PG-10 avec un périmètre explicite, par exemple période et modes retenus. Elle reste personnelle. Pour l'invité, un cumul limité à la session peut être proposé; « demain » et plusieurs appareils ne sont pas promis. Source : STAT-06; PDF p. 5, souhaitable; divergence STAT-04 du document 01.

### PG-15 — Préférences

**Entrée :** commandes visibles de langue/thème ou menu. **Actions :** interface FR/EN, clair/sombre, sons, effets visuels/mouvement, concentration; valeurs système éventuelles identifiées comme options. **Sortie :** retour à l'écran précédent sans perdre l'intention de rejoindre ni modifier le texte/règles de la course.

**États :** préférences actuelles, modification locale, sauvegarde compte en attente/réussie/échouée si retenue, session invitée, hors ligne. Langue d'interface et langue du contenu sont deux réglages distincts. Les préférences n'accordent aucun avantage de classement. Ordinateur/tablette/téléphone sont couverts pour consultation/salon/spectateur; la participation tactile reste à arbitrer après essai. Sources : UX-02, CONF-03, RACE-05, HYP-09/10.

### PG-16 — Règles et aide contextuelle

**Entrée :** depuis un mode, un réglage, une capacité ou le score. **Actions :** lire une explication courte, un exemple et la condition de fin; refermer. **Sortie :** même écran, avec focus restauré et valeurs conservées.

Le texte explique mode bloquant/non bloquant, pénalité, départ, abandon, inactivité, bot, rattrapage et formule du podium. Une valeur non décidée porte « proposition » dans la revue; elle ne devient pas une promesse produit. Deux fiches de mécanisme couvrent BONUS-01 sans figer leurs effets. Aucun chatbot/IA n'est ajouté. Une page d'aide autonome est optionnelle; l'information essentielle reste accessible dans le contexte. Sources : CONF-07/08/09, BONUS-01/02/03, STAT-01.

### PG-17 — Accès et incidents

**Entrée :** navigation inconnue, autorisation refusée, service indisponible ou changement de cycle. **Actions :** corriger, réessayer, revenir, se connecter ou rejoindre une autre salle selon cause. **Sortie :** une destination réellement admissible; aucune action ne réutilise une invitation consommée ou ne recrée une salle pour un invité.

Éviter l'écran d'erreur générique unique : garder le contexte et une issue adaptée. Une salle fermée n'est pas une déconnexion; une reconnexion courte n'est pas un abandon; un participant exclu ne reçoit pas « réessayer » comme si un incident réseau permettait de reprendre. Une course annulée explique l'absence de victoire et retourne au salon quand celui-ci existe. Sources : ROOM-06/07/09, CLIENT-02/04/05/06.

## 5. États transversaux et dialogues à dessiner

Ces états complètent les pages; ils ne nécessitent pas tous une route supplémentaire.

| ID de design | Déclencheur / retour visible | Action ou issue | Sources |
|---|---|---|---|
| **ET-01** | Chargement d'une page ou admission | Emplacements réservés; pas de données inventées; annuler si pertinent | UX-02, ROOM-04 |
| **ET-02** | Service indisponible ou hors ligne | Dernier état confirmé explicitement daté/signalé; réessayer; ne pas annoncer une sauvegarde ou copie fictive | ROOM-06, TECH-02 |
| **ET-03** | Réponse d'action en attente puis confirmée/refusée | Retour près du contrôle; conserver la saisie; empêcher les doubles actions | ROOM-04, ROLE-02 |
| **ET-04** | Code vide, invalide, inconnu ou salle complète | Corriger; aucune recherche privée par code | ROOM-01, CLIENT-03/04 |
| **ET-05** | Lien privé valide, expiré, consommé, révoqué ou invalide | Accepter uniquement si admissible; obtenir un nouveau lien; retour | ROOM-01, CLIENT-04/08 |
| **ET-06** | Session expirée actuellement; refus/indisponibilité de fournisseur dans l’évolution OAuth | Autre accès disponible, sans contourner les permissions | AUTH-01/02/04 |
| **ET-07** | Invité tente créer, y compris repli de partie rapide | Connexion/inscription ou retour; aucune création | CLIENT-02, ROOM-03 |
| **ET-08** | Fenêtre invitation du salon | Copier avec résultat réel; générer/révoquer lien selon type et confirmation serveur | ROOM-01, CLIENT-03/04/08 |
| **ET-09** | Configuration invalide ou devenue immuable | Corriger avant départ; après départ afficher règles figées | CONF-01/05, RACE-01 |
| **ET-10** | Prêt/lancement refusé, attente d'un concurrent | Explication précise; attendre ou ajouter bot si autorisé | BOT-01, HYP-03, RACE-01 |
| **ET-11** | Arrivée après départ | Spectateur jusqu'à la suivante; aucune saisie active | ROOM-05 |
| **ET-12** | Réseau perdu brièvement | Reconnexion, identité/progression conservées dans la fenêtre retenue | ROOM-06, CLIENT-05 |
| **ET-13** | Fenêtre dépassée / inactivité / abandon | Statut distinct et règle de fin visible, puis issue finie | ROOM-07, CONF-09 |
| **ET-14** | Hôte quitte volontairement | Choisir successeur, confirmer transfert/départ, annuler | CLIENT-06 |
| **ET-15** | Hôte transféré à un autre membre | Nom annoncé, droits et commandes actualisés | CLIENT-06, ROOM-04 |
| **ET-16** | Désigner spectateur / exclure | Commande réservée à l'hôte; cible et conséquence explicites; confirmation exclusion | ROLE-02 |
| **ET-17** | Départ commun et course en cours | Compte à rebours/état, texte figé, classement confirmé | RACE-01/02 |
| **ET-18** | Erreur bloquante/non bloquante, collage ou composition | Instruction locale pertinente; signal non chromatique; correction | CONF-07/08/10, RACE-03 |
| **ET-19** | Capacité indisponible/disponible/appliquée/terminée | Ressource et effet expliqués; option effets respectée | BONUS-01/02/03, CLIENT-07 |
| **ET-20** | Course finie, temps écoulé ou annulée | Résultats stables; annulation sans victoire | CONF-09, STAT-01, ROOM-06 |
| **ET-21** | Podium de 1–2 personnes ou participants non finis | Pas de personnes ajoutées; statuts distincts | STAT-01, ROOM-07 |
| **ET-22** | Heatmap sans frappe, zéro erreur ou touche non pratiquée | Légende/table et différence explicite entre zéro et absence de mesure | STAT-03 |
| **ET-23** | Premier historique, comparaison absente ou filtre vide | Invitation à pratiquer; aucun progrès inventé | STAT-04/05/06 |
| **ET-24** | Session invitée active/expirée | Portée limitée clairement nommée; nouvelle identité si nécessaire | AUTH-04, STAT-05 |
| **ET-25** | Revanche ou fermeture | Hôte confirme; membres voient le nouvel état; fermeture avec retour possible | ROOM-09 |
| **ET-26** | FR/EN, clair/sombre, focus et mouvement réduit | Même information et permissions; texte de course inchangé | UX-02, CONF-03, RACE-05 |
| **ET-27** | Route introuvable / donnée non autorisée | Issue compréhensible sans révéler un contenu privé | ROOM-01, CLIENT-04, STAT-02/04 |

Dialogues prioritaires : invitation; exclusion; abandon/quitter; succession de l'hôte; fermer la salle; règles/capacité. Les formulaires et boutons ont des libellés visibles, un focus contrasté, une erreur associée, un état en cours et un résultat confirmé. Les contrats de focus et de fermeture suivent le document 14; aucune annonce vocale à chaque frappe ou seconde n'est ajoutée.

## 6. Couverture de toutes les exigences produit

Cette table vérifie la **présence dans le plan**, pas leur réalisation. Les exigences techniques servent aussi la livraison; un dessin ne peut pas les valider.

| Groupe / IDs | Vues et états de couverture | Contrôle de conception |
|---|---|---|
| **AUTH-01, AUTH-02** | PG-04, ET-06 | Actuel : pseudonyme/mot de passe et accès invité. Évolution prévue : OAuth Discord/GitHub et mise en avant de ces options |
| **AUTH-03** | PG-04/05 | Identifiants locaux; aucun courriel/récupération |
| **AUTH-04** | PG-05/12/13, ET-24 | Pseudo et session; pas de création |
| **ROLE-01, ROLE-02** | PG-07/08, ET-14/15/16 | Même capacité des comptes; droits temporaires hôte, spectateur et exclusion |
| **ROOM-01** | PG-02/03/06/07/08 | Public listé, semi-public code, privé lien unique |
| **ROOM-02, ROOM-03** | PG-01/02, ET-07 | Partie rapide et repli compte; invité intercepté |
| **ROOM-04** | PG-07/08, ET-02/03/15 | Membres/règles confirmés; non-hôte en lecture |
| **ROOM-05, ROOM-06, ROOM-07** | PG-08/09/17, ET-11/12/13/20 | Spectateur tardif, reprise, abandon et fin non bloquée |
| **ROOM-08** | PG-02/08/09 | Densité à 30 et capacité annoncée mesurable |
| **ROOM-09** | PG-10/17, ET-25 | Revanche et fermeture réservées à l'hôte |
| **CONF-01, CONF-02, CONF-03** | PG-07/11/15 | Trois contenus; corpus sans IA; deux langues indépendantes |
| **CONF-04, CONF-05, CONF-06** | PG-07/16, ET-09 | Catégories, longueur/interdits, temps facultatif; objectif P2 |
| **CONF-07, CONF-08** | PG-07/09/10/16, ET-18 | Modes d'erreur et formule expliquée |
| **CONF-09, CONF-10** | PG-09/10/17, ET-13/18/20 | Fin commune, inactivité et collage |
| **RACE-01, RACE-02** | PG-08/09, ET-17 | Départ commun et progression |
| **RACE-03, RACE-04** | PG-09/10/13 | Métriques, connexion et classe de 30 lisible |
| **RACE-05** | PG-09/15, ET-26 | Effets désactivables et concentration |
| **BOT-01, BOT-02** | PG-07/08/11 | Pratique solo/collective et niveaux variables |
| **BONUS-01, BONUS-02, BONUS-03** | PG-07/09/16, ET-19 | Deux mécanismes finaux, rattrapage et attribution; effets encore à choisir |
| **STAT-01, STAT-02, STAT-03** | PG-10/13, ET-20/21/22 | Podium/règle, statistiques et heatmap après course |
| **STAT-04, STAT-05, STAT-06** | PG-12/13/14, ET-23/24 | Historique compte, session invitée et progrès; global P2 |
| **UX-01, UX-02** | PG-01 à PG-17, ET-26 | DA v0.4, FR/EN, clair/sombre et responsive sur tout le parcours |
| **UX-03** | Dossier DA et introduction de ce plan | Propositions attribuées; conception humaine et choix final non inventés |
| **TECH-01, TECH-02** | Toutes vues; PG-08/09 pour temps réel | React/Next/TypeScript/Tailwind/PostgreSQL et HTTPS : preuves d'implémentation nécessaires |
| **TECH-03, TECH-04, TECH-05** | Dossier déploiement et plan CP1 | Coûts, GitHub sans secrets, documentation et CI : pas de page produit artificielle |

## 7. Contradictions restant à arbitrer

| Sujet | Design couvert maintenant | Limite à ne pas masquer |
|---|---|---|
| Capacité illimitée / 30 | Salon et course à 30; état complet | Limite réelle et latence non mesurées |
| Invité demain / session | Profil de session et expiration | Aucun identifiant persistant ou suivi multi-jour confirmé |
| Solo / deux concurrents | Compte humain + bot; invité rejoint seulement | Minimum et accès invité à une pratique sans création restent à décider |
| Fin et inactivité | Minuterie, tous actifs finis, abandon, inactivité, reprise | Délais proposés dans l'architecture ne deviennent pas des décisions client |
| Gagnant / pénalité | Règle consultable et résultat cohérent | Formule, égalités et effets exacts non validés |
| Bonus / longueurs | Effet annoncé, score arcade distinct, mesures brutes conservées | Comparabilité à définir; deux mécanismes essentiels selon PDF, pas deux effets déjà choisis |
| Mobile / clavier virtuel | Consultation, salon, spectateur et variantes adaptatives | Participation tactile à tester/décider; pas d'interdiction technique inventée |
| Corpus / droits | Source des contenus prévue et texte personnalisé validé | Licences, bornes et politique des textes à établir |
| Compte local perdu | Avertissement clair avant inscription | Pas de récupération; politique d'identité/usurpation à préciser |
| Succession | Choisi d'abord, sinon plus ancien; état transfert | Cas invité, bot, spectateur, hors ligne et égalité à fixer |
| Statistiques d'autrui | Publiques de course vs personnelles du compte | Visibilité/rétention/suppression et droits sur données permanentes à décider |
| Nom et logo | Mot de travail et propositions de symbole conservés dans les pages | Contribution humaine, attribution et choix final à documenter; DA conservée ne suffit pas à satisfaire UX-03 |

## 8. Vérification de la complétude du design

Pour la revue, chaque vue PG-01 à PG-17 doit posséder un scénario principal et ses erreurs pertinentes, avec les restrictions ci-dessus. Les écrans essentiels ne sont pas laissés sous une mention générique « bientôt ». Les variantes P2 sont identifiées et n'empêchent pas le parcours P1.

- Parcours compte : accès → créer/configurer → inviter → salon → course → résultats/heatmap → revanche → historique/progression.
- Parcours invité : pseudo → code/lien/public → salon/course → résultats et statistiques de session; création refusée avec une issue utile.
- Parcours privé : invitation valide, déjà consommée, expirée, révoquée et reconnexion d'un membre admis; aucun champ de code privé.
- Parcours spectateur : arrivée tardive, course observable, aucune frappe/capacité, retour à l'admissibilité pour la suivante selon rôle.
- Parcours hôte : réglages avant départ, exclusion, successeur choisi ou plus ancien, courte coupure distincte du départ, revanche et fermeture.
- Parcours statistiques : aucune donnée, zéro erreur, touche non pratiquée, données comparables ou non, heatmap de course P1 et globale P2.
- Variantes transversales : FR/EN, clair/sombre, petit/grand écran, focus clavier, zoom, son coupé et mouvement réduit; aucun pseudo, code, mesure ou message essentiel masqué par le style.

**Une page conçue n'est pas une page connectée.** La future preuve distingue design présent, interactions locales démontrées, comportement serveur testé et déploiement vérifié. Le PDF ne demande pas une nouvelle marque ni une nouvelle exploration de sites pour compléter ces vues; la DA v0.4 demeure la base commune.

## 9. Concordance avec l'aperçu v0.5

L'aperçu de toutes les pages étend les parcours en conservant la DA v0.4. L'atelier de marque reste accessible séparément pour discuter l'identité, la palette et les composants. Cette concordance repose sur une **lecture du catalogue et des fonctions de conception de pages.js (`preview/pages.js`), le 2 octobre 2026**. Elle ne certifie pas le rendu de chaque combinaison, les permissions d'un serveur ou le déploiement.

Les **17 PG sont des familles de parcours**, tandis que le catalogue v0.5 complété comporte **20 écrans de prototype**. PG-05 est séparée en deux écrans, inscription et invité; PG-09 en trois écrans, départ, course et spectateur. PG-14 possède maintenant son écran « Mes touches / Heatmap globale », en plus de la progression résumée dans le profil PG-12. Cette organisation donne **17 + 1 + 2 = 20** sans créer ni supprimer un ID PG ou ET. Le catalogue antérieur de 19 écrans regroupait encore PG-12 et PG-14 dans le profil; ce regroupement ne décrit plus toute la version actuelle.

### Catalogue des écrans et variantes déclarées

| Écran de l'aperçu | Famille(s) de ce plan | États proposés par le sélecteur | Nombre |
|---|---|---|---:|
| Accueil · `home` | PG-01 | `normal`, `empty` | 2 |
| Courses publiques · `rooms` | PG-02 | `normal`, `empty`, `loading`, `error` | 4 |
| Rejoindre par code · `join` | PG-03 | `normal`, `error` | 2 |
| Connexion · `auth` | PG-04 | `normal`, `error`, `oauth-wait`, `oauth-error`, `session-expired` | 5 |
| Compte local · `register` | PG-05 | `normal`, `error` | 2 |
| Mode invité · `guest` | PG-05 | `normal`, `error` | 2 |
| Créer une salle · `create` | PG-07 | `normal`, `private`, `arcade`, `error` | 4 |
| Salon · `lobby` | PG-08 | `normal`, `host`, `private`, `empty`, `crowd`, `reconnect`, `transfer` | 7 |
| Invitation privée · `invitation` | PG-06 | `normal`, `expired`, `used`, `invalid` | 4 |
| Départ commun · `countdown` | PG-09 · début de course | `normal`, `reconnect` | 2 |
| Course · `race` | PG-09 · participant | `normal`, `blocking`, `arcade`, `reconnect`, `interrupted`, `finished`, `timeout`, `afk`, `energy-empty`, `energy-ready`, `energy-active`, `energy-ended` | 12 |
| Spectateur · `spectator` | PG-09 · observation | `normal`, `crowd`, `reconnect` | 3 |
| Résultats · `results` | PG-10; détail de PG-13 réutilisé | `normal`, `host`, `arcade`, `empty`, `few`, `history` | 6 |
| Entraînement · `practice` | PG-11 | `normal`, `error` | 2 |
| Profil et progression · `profile` | PG-12; progression résumée de PG-14 | `normal`, `empty`, `guest` | 3 |
| Historique · `history` | PG-13 | `normal`, `empty`, `guest` | 3 |
| Préférences · `preferences` | PG-15 | `normal` | 1 |
| Comment jouer · `help` | PG-16 | `normal` | 1 |
| Accès indisponible · `unavailable` | PG-17 | `normal`, `closed`, `excluded`, `interrupted`, `full`, `admission` | 6 |
| Heatmap globale · `global-map` | PG-14 · enrichissement P2 | `normal`, `empty`, `guest` | 3 |
| **Total du catalogue v0.5 complété** | **20 écrans rattachés aux 17 familles** | **74 combinaisons écran/état déclarées** | **74** |

Le total comprend **20 états `normal` et 54 variantes supplémentaires**, répartis entre **32 libellés d'état distincts**. Il ne signifie pas 74 mises en page entièrement différentes : `home/empty`, par exemple, modifie le repli de l'action « Course rapide »; `results/empty` signifie absence de comparaison, pas absence de tous les résultats. Les variantes dépendent aussi de l'identité locale et des choix de salle. Les langues FR/EN, les thèmes clair/sombre et les dialogues ne sont pas ajoutés à ce décompte; leur présence dans le code ne vaut pas vérification de toutes leurs combinaisons.

Les invitations par code ou privées, la gestion des rôles, l'ajout de bots, les deux fiches de capacité, le classement à 30, la règle de score, le départ volontaire avec succession et la fermeture possèdent des **dialogues contextuels**. Ils complètent notamment PG-08/09/10/16 et ET-08/14/16/19/25, sans devenir des pages supplémentaires.

### Couverture observée après les compléments

La lecture croisée de 01, 02, 09 et de ce plan confirme la présence des principales familles : quatre accès représentés, création réservée au compte, public listé/semi-public par code/privé par lien personnel unique, salon, départ, course, spectateur, résultats avec heatmap de course, bots, profil/session, historique et préférences. Aucun espace enseignant doté de droits permanents n'est requis. L'exercice local proposé à un invité dans l'aperçu est explicitement présenté comme une hypothèse sans création de salle; il ne modifie pas CLIENT-02.

Les compléments suivants retirent des lacunes de conception précédemment relevées. Ils restent des **écrans et valeurs d'exemple**, sans fournisseur OAuth, base de données ni synchronisation réseau :

| Vue ou état représenté | Référence existante | Couverture de conception observée |
|---|---|---|
| Moyenne des classements | PG-12 · STAT-04 | Valeur d'exemple ajoutée aux autres métriques du profil, avec variante de session invitée. Aucun calcul permanent n'est exécuté. |
| Évolution pendant une course | PG-10/13 · STAT-02 | Six repères MPM espacés de dix secondes dans le détail; chiffres et graphique d'exemple. L'enregistrement requis par RACE-03 reste à implémenter. |
| Attente OAuth, échec OAuth et session expirée | PG-04 · ET-06/24 | `oauth-wait`, `oauth-error`, `session-expired` donnent une explication et un retour aux méthodes d'accès. Ces états sont figés; aucun fournisseur externe n'est contacté. |
| Salle complète et admission refusée | PG-17, accès PG-02/03/06 · ET-04/05/27 | `full` et `admission` complètent les états fermé/exclu/introuvable. Leur présence ne démontre pas un contrôle des droits côté serveur. |
| Fin individuelle, expiration normale et inactivité | PG-09/17 · ET-13/20 | `finished` attend la fin du groupe; `timeout` distingue la validation des résultats de l'annulation; `afk` explique que l'inactivité ne bloque pas les autres. Les délais restent à choisir. |
| Podium réduit | PG-10 · ET-21 | `few` dessine deux places et une table de deux résultats. Le cas d'un seul résultat reste à préciser. |
| Quatre états d'énergie | PG-09/16 · ET-19 | `energy-empty`, `energy-ready`, `energy-active`, `energy-ended` illustrent l'indisponibilité, la disponibilité, l'effet en cours et sa fin pour Tempo. L'action ouvre une explication; elle n'exécute aucun bonus. |
| Détail historique en lecture seule | PG-10/13 · ET-27 | `history` retire les commandes de revanche et revient à l'historique plutôt qu'au salon. Aucun ancien résultat n'est chargé depuis une base. |
| Heatmap globale | PG-14 | Écran **P2** `global-map` avec périmètre d'exemple, valeurs/table et trois états : compte, vide, invité orienté vers ses cartes de course de session. L'agrégation et les suggestions ne sont pas calculées. |

### États encore partiels à préciser

La présence des 20 écrans ne signifie pas que chaque ET possède déjà toutes ses variantes. Les éléments suivants restent partiels dans les fonctions lues; ils peuvent réutiliser les panneaux existants :

| Vue ou état à préciser | Référence existante | Limite de conception conservée |
|---|---|---|
| Admission en attente puis confirmée/refusée | PG-02/03/06 · ET-01/03 | Chargement de liste et refus présents; attente de l'admission, protection contre la double soumission et conservation du contexte restent à détailler. |
| Invitation révoquée et retour d'un membre déjà admis | PG-06/08 · ET-05/08/12 | **P1** : invitation valide, expirée, utilisée ou inconnue et commande de révocation illustrées; pas de vue destinataire révoquée ni d'admission de retour explicitement distinguée. |
| Commande hôte en attente/refusée et confirmation d'exclusion | PG-08 · ET-03/16 | **P0/P1 selon la commande** : gestion des rôles et exclusion illustrées par des messages; les états de confirmation, d'attente et de refus ne forment pas encore un parcours complet. |
| Fenêtre de reconnexion dépassée | PG-09/17 · ET-13 | **P1** : reconnexion brève, inactivité et départ volontaire sont représentés; dépassement de la fenêtre de reprise à distinguer explicitement de l'AFK. |
| Un seul résultat ou course sans aucune frappe | PG-10 · ET-21/22 | **P1** : podium à deux, zéro erreur et touche non pratiquée présents; un seul résultat et une course entièrement sans données restent à préciser. |
| Application des états d'énergie au second mécanisme | PG-09/16 · ET-19 | **P1** : Tempo porte les quatre exemples d'état; Relais possède une fiche explicative. Une présentation partagée ou propre à Relais est à préciser, sans inventer ses effets et seuils définitifs. |

Les états techniques peuvent réutiliser les panneaux existants; leur absence ne justifie ni la création d'un rôle enseignant, ni une récupération de compte local, ni un accès privé par code. La garde « un compte pour créer », les refus d'accès, la consommation unique du lien et la portée des données invitées doivent encore être vérifiés côté serveur dans le produit.

**Limite de preuve CP1.** Cet aperçu représente les écrans et quelques interactions locales. Il ne valide pas React/Next/Tailwind/PostgreSQL, une vraie authentification, HTTPS en production, la propagation du salon entre deux sessions, la CI ou la création humaine du nom/logo. La matrice 02 conserve donc ses statuts non vérifiés; les références de sources et les priorités de 09 restent inchangées.
