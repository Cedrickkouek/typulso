# Analyse des besoins - Plateforme de courses de frappe au clavier

## Note méthodologique

Cette analyse distingue trois niveaux d'information :

1. **Les exigences du travail scolaire**, tirées de l'énoncé du cahier des charges;
2. **Le contexte pédagogique**, tiré du plan d'étude du cours Web V;
3. **Les besoins du produit**, tirés de la transcription de la rencontre client et complétés par les notes de l'étudiant.

La transcription est considérée comme la source principale des besoins du client. Les notes servent de complément lorsqu'elles ajoutent une information absente de la transcription. Toute divergence est signalée comme une zone à valider plutôt que transformée automatiquement en exigence.

## 1. Vision du produit

Le produit est une plateforme Web bilingue de courses de frappe destinée principalement aux jeunes de 12 à 17 ans, en classe, dans une activité parascolaire ou à la maison. Elle vise à rendre l'apprentissage de la frappe plus motivant grâce à des compétitions amicales en temps réel, une présentation visuelle dynamique, des statistiques utiles et un sentiment de progression.

Un hôte, souvent un enseignant mais possiblement un étudiant, crée et configure une course. Les participants tapent simultanément un texte et voient l'évolution du classement en direct. La plateforme doit également permettre la pratique individuelle avec des adversaires simulés. L'expérience recherchée s'inspire de l'engagement de Kahoot et de l'équilibrage de Mario Kart, sans donner l'apparence d'un produit scolaire traditionnel.

Le succès du produit repose sur quatre résultats : motiver les jeunes à pratiquer, améliorer leur vitesse et leur précision, créer de l'engouement pendant les courses et donner une rétroaction utile après chaque activité.

## 2. Glossaire

| Terme | Définition retenue |
|---|---|
| **Hôte** | Personne qui crée et administre une salle. Elle peut être enseignante ou étudiante. |
| **Salle** | Espace d'attente et de configuration qui regroupe les personnes avant, pendant et après une course. |
| **Course** | Épreuve de frappe simultanée opposant au moins deux concurrents, humains ou simulés. |
| **Participant** | Personne qui tape le texte et peut être classée. |
| **Spectateur** | Personne qui observe la progression et les résultats sans pouvoir taper durant la course en cours. |
| **Invité** | Participant sans compte permanent, identifié temporairement par un pseudonyme. |
| **Compte local** | Compte créé uniquement avec un nom d'utilisateur et un mot de passe, sans adresse courriel. |
| **Course publique** | Course visible et accessible depuis la liste publique du site. |
| **Course semi-publique** | Course non répertoriée, accessible à toute personne possédant son code. |
| **Course privée** | Course accessible au moyen d'invitations individuelles à usage unique. |
| **Texte de course** | Contenu exact à reproduire : texte cohérent, mots aléatoires, contenu thématique, code ou texte personnalisé. |
| **Erreur bloquante** | Erreur que le participant doit corriger avant de poursuivre. |
| **Erreur non bloquante** | Erreur enregistrée sans interrompre immédiatement la progression. |
| **Bonus de rattrapage** | Effet temporaire aidant un participant en retard ou ralentissant les meneurs. |
| **Bot** | Adversaire simulé dont la vitesse et les erreurs imitent un comportement humain. |
| **Statistiques de session** | Données conservées tant que la session d'un invité demeure active. |
| **Statistiques permanentes** | Historique rattaché à un compte et disponible lors de connexions futures. |
| **Heatmap du clavier** | Représentation du clavier où la couleur des touches indique la fréquence des erreurs. |

## 3. Exigences numérotées et regroupées par thème

### 3.1 Utilisateurs, comptes et permissions

- **AUTH-01** - Le système doit proposer quatre modes d'accès : Discord, GitHub, compte local et mode invité.
- **AUTH-02** - Discord et GitHub doivent être visuellement présentés comme les méthodes privilégiées.
- **AUTH-03** - Le compte local doit utiliser un nom d'utilisateur et un mot de passe, sans exiger d'adresse courriel.
- **AUTH-04** - Le système ne doit pas offrir de récupération de mot de passe pour les comptes locaux.
- **AUTH-05** - Un invité doit pouvoir rejoindre une course après avoir choisi un pseudonyme temporaire.
- **AUTH-06** - Un utilisateur possédant un compte doit pouvoir consulter des statistiques permanentes et ses paramètres.
- **AUTH-07** - Le système devrait permettre de relier plusieurs fournisseurs d'authentification au même compte.
- **ROLE-01** - Un utilisateur, y compris un étudiant, doit pouvoir créer une salle et en devenir l'hôte.
- **ROLE-02** - L'hôte doit pouvoir désigner un membre de la salle comme participant ou spectateur avant le départ.
- **ROLE-03** - Un hôte doit pouvoir exclure une personne de sa salle, notamment en cas de pseudonyme vulgaire ou de comportement inadéquat.

### 3.2 Accès aux salles et cycle d'une course

- **ROOM-01** - Une course publique doit être découvrable et accessible depuis le site.
- **ROOM-02** - Une course semi-publique doit être accessible avec un code partageable.
- **ROOM-03** - Une course privée doit être accessible au moyen de liens individuels à usage unique.
- **ROOM-04** - La page d'accueil doit mettre fortement en évidence une action permettant de rejoindre rapidement une course.
- **ROOM-05** - L'action rapide doit rejoindre une course publique en attente; si aucune n'est disponible, elle doit créer une nouvelle salle.
- **ROOM-06** - Un utilisateur qui rejoint après le départ doit devenir spectateur pour la course en cours et participant admissible à la suivante.
- **ROOM-07** - Un participant doit pouvoir abandonner volontairement une course.
- **ROOM-08** - Une interruption temporaire de réseau ne doit pas retirer définitivement un participant; son identité et sa progression doivent être restaurées à la reconnexion.
- **ROOM-09** - Une course doit accepter au minimum un groupe scolaire d'environ 30 personnes.
- **ROOM-10** - Les paramètres modifiés par l'hôte dans le salon doivent être visibles en temps réel par les autres membres, sans leur être modifiables.
- **ROOM-11** - Une fois la course commencée, sa configuration doit être figée jusqu'à la fin.
- **ROOM-12** - Après les résultats, l'hôte doit pouvoir lancer une revanche avec la même salle ou fermer la salle et déconnecter ses membres.

### 3.3 Configuration du contenu et des règles

- **CONF-01** - L'hôte doit pouvoir choisir entre un texte cohérent et une suite de mots sans lien logique.
- **CONF-02** - L'hôte doit pouvoir fournir un texte personnalisé.
- **CONF-03** - Le système doit pouvoir produire des contenus variables à partir de règles et de banques de mots, sans intelligence artificielle générative intégrée au produit.
- **CONF-04** - L'hôte doit pouvoir choisir la langue du contenu de la course indépendamment de la langue de l'interface.
- **CONF-05** - Le contenu doit pouvoir cibler des thèmes ou types de caractères : accents, ponctuation, chiffres et caractères spéciaux.
- **CONF-06** - L'hôte doit pouvoir choisir la longueur du contenu, incluant des épreuves courtes et longues.
- **CONF-07** - L'hôte doit pouvoir interdire certains caractères; le générateur doit garantir leur absence du contenu final.
- **CONF-08** - L'hôte doit pouvoir fixer ou non une limite de temps.
- **CONF-09** - L'hôte devrait pouvoir définir un objectif de vitesse.
- **CONF-10** - L'hôte doit pouvoir choisir si une erreur bloque la frappe jusqu'à sa correction ou si elle est seulement comptabilisée.
- **CONF-11** - En mode non bloquant, le classement doit appliquer une pénalité qui empêche de gagner en tapant des caractères au hasard.
- **CONF-12** - La course doit se terminer lorsque tous les participants actifs ont fini ou lorsque la limite de temps est atteinte.
- **CONF-13** - Le système doit traiter explicitement les personnes inactives, déconnectées ou ayant abandonné afin qu'elles ne bloquent pas indéfiniment la fin d'une course.
- **CONF-14** - Le système doit empêcher le collage du texte de course dans la zone de frappe.
- **CONF-15** - Le contenu de programmation, l'importation de fichiers texte et une difficulté calculée automatiquement sont des extensions possibles, mais non confirmées comme exigences essentielles.

### 3.4 Déroulement en temps réel

- **RACE-01** - Tous les participants doivent commencer la même course au même moment.
- **RACE-02** - Chaque participant doit voir en direct sa progression, sa position et les changements importants au classement.
- **RACE-03** - La visualisation doit demeurer compréhensible avec environ 30 participants sans détourner excessivement l'attention de la frappe.
- **RACE-04** - Le système doit enregistrer le temps, la progression, les frappes correctes, les erreurs, les corrections et l'état de chaque participant.
- **RACE-05** - Les effets sonores peuvent renforcer les départs, dépassements, bonus et résultats, mais doivent pouvoir être coupés.

### 3.5 Bots et pratique individuelle

- **BOT-01** - Un utilisateur doit pouvoir lancer une course avec des bots afin de pratiquer sans autre personne disponible.
- **BOT-02** - L'hôte doit pouvoir ajouter des bots à une course comportant déjà des humains.
- **BOT-03** - Plusieurs niveaux doivent être disponibles, par exemple débutant, intermédiaire, expert et impossible.
- **BOT-04** - Sauf exception assumée pour le niveau impossible, la vitesse d'un bot doit fluctuer et ses erreurs doivent être générées de manière plausible.
- **BOT-05** - Les résultats d'un bot ne doivent pas toujours correspondre exactement à sa vitesse théorique.

### 3.6 Bonus et équilibrage

- **BONUS-01** - Le produit final doit inclure au moins deux mécanismes de rattrapage inspirés des propositions du client ou justifiés par l'équipe.
- **BONUS-02** - Les bonus doivent favoriser surtout les personnes en retard sans garantir leur victoire ni neutraliser systématiquement les meilleures.
- **BONUS-03** - Les effets possibles comprennent l'ajout de mots au meneur, le retrait de mots au participant en retard ou l'obstruction temporaire du texte des 50 % de tête.
- **BONUS-04** - L'algorithme d'attribution doit être documenté, testable et compréhensible.
- **BONUS-05** - Les bonus ne doivent pas empêcher complètement une personne de jouer et doivent respecter les options d'accessibilité.

### 3.7 Résultats, statistiques et progression

- **STAT-01** - La fin d'une course doit afficher un podium des trois meilleurs résultats.
- **STAT-02** - Le classement doit combiner vitesse et précision selon une règle identique et visible pour tous.
- **STAT-03** - La page de résultats doit présenter des statistiques publiques de la course, par exemple le classement, la meilleure précision et la vitesse de chaque participant.
- **STAT-04** - Chaque participant doit recevoir des statistiques personnelles, notamment sa vitesse, sa précision, ses erreurs et son évolution pendant la course.
- **STAT-05** - Une heatmap doit montrer les touches les plus souvent manquées dans la course.
- **STAT-06** - Un compte permanent doit conserver l'historique des courses, la vitesse moyenne, le classement moyen, les victoires, le nombre de courses et une heatmap globale.
- **STAT-07** - Un invité doit voir les résultats de ses courses successives pendant sa session courante.
- **STAT-08** - La plateforme doit rendre l'amélioration visible dans le temps et offrir un sentiment de progression; la forme exacte des récompenses reste à concevoir.

### 3.8 Expérience, identité et accessibilité

- **UX-01** - L'interface doit viser les 12 à 17 ans tout en conservant une apparence professionnelle, originale et non scolaire.
- **UX-02** - Une direction artistique cohérente doit couvrir l'accueil, le salon, la course, les résultats, les statistiques et les paramètres.
- **UX-03** - Le nom, le logo et leur démarche de conception doivent provenir de l'équipe humaine et être documentés; le logo ne doit pas être une icône générique non modifiée.
- **UX-04** - L'interface complète doit être disponible en français et en anglais au moyen d'un sélecteur visible.
- **UX-05** - Un sélecteur doit permettre de passer entre les modes clair et sombre.
- **UX-06** - Le site doit être adaptatif et consultable sur ordinateur, tablette et téléphone.
- **UX-07** - La participation à une course sur écran tactile doit être décidée explicitement; à défaut, ces appareils offriront au minimum le mode spectateur.
- **UX-08** - Les animations, sons et effets d'obstruction doivent proposer des solutions de réduction ou de désactivation pour ne pas nuire à l'accessibilité.

### 3.9 Contraintes techniques, qualité et exploitation

- **TECH-01** - L'application doit utiliser React avec Next.js.
- **TECH-02** - Le code applicatif doit être écrit en TypeScript; aucun nouveau module applicatif ne doit être écrit en JavaScript.
- **TECH-03** - L'interface doit utiliser Tailwind CSS.
- **TECH-04** - Les données persistantes doivent être stockées dans PostgreSQL; le choix de l'outil d'accès aux données est libre et doit être justifié.
- **TECH-05** - Les fonctions en temps réel doivent utiliser une solution adaptée, par exemple WebSocket ou MQTT, choisie et justifiée par l'équipe.
- **TECH-06** - L'application doit être déployée sur un service accessible publiquement en HTTPS.
- **TECH-07** - Les services externes doivent être gratuits ou leur coût et leurs limites doivent être explicitement approuvés.
- **TECH-08** - Les secrets, mots de passe et jetons ne doivent jamais être publiés dans le dépôt public; les mots de passe locaux doivent être hachés de manière sécuritaire.
- **TECH-09** - Le code doit être hébergé dans un dépôt GitHub public.
- **TECH-10** - Le projet doit comporter des tests unitaires et des tests de bout en bout exécutés automatiquement lors des changements sur GitHub.
- **TECH-11** - La documentation doit expliquer l'installation, la configuration, l'architecture, l'organisation du code, le déploiement et les décisions technologiques.
- **TECH-12** - Les limites mesurées de capacité, de latence et de reconnexion doivent être documentées plutôt que promettre un nombre réellement illimité de joueurs.
- **TECH-13** - Aucune intelligence artificielle ou fonction de chatbot n'est requise dans l'application livrée.

### 3.10 Premier checkpoint

- **CP1-01** - Une version fonctionnelle doit être accessible en ligne avec HTTPS au premier checkpoint.
- **CP1-02** - Une première version de l'authentification doit fonctionner.
- **CP1-03** - La direction artistique doit être amorcée et visible dans l'interface.
- **CP1-04** - Le système complet de course n'est pas exigé au premier checkpoint.

## 4. Contradictions et zones floues

1. **Nombre de joueurs.** Le client dit qu'il n'y a pas de maximum, mais aucun système ne peut garantir une capacité illimitée. Le besoin mesurable est plutôt de soutenir au moins une classe d'environ 30 personnes et de documenter la limite testée.
2. **Invités et conservation des données.** Le compte invité est décrit comme inexistant après la session, mais le client aimerait aussi reconnaître un invité revenu le lendemain. Ces deux attentes sont incompatibles sans identifiant persistant, stockage local ou compte.
3. **Code ou code QR.** Les notes parlent d'un code QR alors que la transcription confirme surtout un code partageable. Un QR peut représenter le code ou le lien, mais son caractère obligatoire n'est pas établi.
4. **Toutes les courses seraient ouvertes.** Cette formulation des notes contredit les trois niveaux d'accès. La transcription indique plutôt que toute course utilise l'un des modes public, semi-public ou privé.
5. **Minimum de deux personnes et pratique solo.** Une course exigerait deux personnes, mais la pratique individuelle doit être possible avec des bots. Il faut préciser qu'il s'agit de deux concurrents, dont au moins un humain.
6. **Créateur, enseignant et hôte.** Plusieurs formulations attribuent les commandes au professeur, tandis que les étudiants peuvent aussi créer une course. Les permissions doivent donc dépendre du rôle d'hôte et non du statut scolaire.
7. **Fin d'une course.** Trois solutions sont évoquées : attendre tous les joueurs, terminer à la limite de temps ou démarrer un court compte à rebours après le premier arrivé. Les personnes AFK ou déconnectées rendent la première solution insuffisante.
8. **Déconnexion et arrivée tardive.** Une arrivée après le départ devient spectatrice, mais une personne déconnectée doit reprendre comme participante. Le serveur doit pouvoir distinguer une reconnexion d'une nouvelle arrivée.
9. **Détermination du gagnant.** Le client parle du premier arrivé, du moins grand nombre d'erreurs et du meilleur score. Sans formule unique, le podium peut contredire le classement affiché pendant la course.
10. **Bonus qui modifient la longueur.** Si les participants n'ont plus la même quantité de texte, comparer leur temps brut ou leurs mots par minute peut devenir trompeur. Les statistiques doivent distinguer performance de frappe et résultat de jeu.
11. **Textes de livres et de films.** Le client évoque des extraits existants, mais leur utilisation peut poser des questions de droit d'auteur. La source et la licence des corpus doivent être définies.
12. **Génération automatique sans IA.** Le client veut des textes variables, mais refuse l'IA dans le produit. Une génération déterministe à partir de corpus licenciés respecte ces deux demandes; cette distinction doit être confirmée.
13. **Mise à jour automatique du vocabulaire.** L'idée d'obtenir les nouveaux mots pendant plusieurs années implique une source externe, des conditions d'utilisation et une maintenance non définies.
14. **Compte local sans courriel ni récupération.** Ce choix simplifie le projet, mais augmente les comptes perdus et les risques d'usurpation de noms d'utilisateur.
15. **Mineurs et courses publiques.** Des jeunes pourraient être mis en relation avec des inconnus et exposer leur pseudonyme ou leurs statistiques. Les règles de modération, de confidentialité et de rétention ne sont pas définies.
16. **Tablettes et téléphones.** L'affichage adaptatif est obligatoire, mais la possibilité de participer avec un clavier virtuel est laissée à l'équipe.
17. **Contenu de programmation.** Les notes citent Java; la transcription évoque plus largement des langages de programmation comme idée intéressante. Cette fonction ne devrait pas être considérée essentielle sans confirmation.
18. **Fonctions ajoutées seulement dans les notes.** L'exclusion des pseudonymes vulgaires et l'interdiction du copier-coller sont pertinentes, mais leur statut exact auprès du client doit être confirmé puisqu'elles ne figurent pas clairement dans la transcription fournie.

## 5. Questions précises à poser au client

### Questions critiques avant la conception

1. Quelle source doit prévaloir lorsqu'une note et l'enregistrement diffèrent : l'enregistrement, les notes ou une prochaine réponse écrite?
2. Au-delà de l'hôte, faut-il de véritables rôles « enseignant » et « étudiant », ou tous les comptes ont-ils les mêmes capacités de création?
3. Un invité peut-il créer et administrer une salle, ou cette action exige-t-elle un compte?
4. Pour une course semi-publique, exigez-vous un code alphanumérique, un code QR, ou les deux?
5. Combien de participants simultanés doit-on garantir et tester : 30, 50, 100 ou davantage?
6. Quelle règle exacte détermine le podium en mode d'erreurs non bloquantes : temps avec pénalités, score vitesse-précision, seuil minimal de précision ou autre?
7. Voulez-vous obligatoirement un compte à rebours après l'arrivée du premier joueur? Si oui, quelle durée et comment traiter les courses très longues?
8. Après combien de temps hors ligne un participant perd-il le droit de reprendre sa course? Sa progression continue-t-elle d'être comparée pendant son absence?
9. Les statistiques d'un invité doivent-elles disparaître à la fermeture de l'onglet, à la fin de la journée ou après une durée définie?
10. Qui peut voir les statistiques permanentes d'un mineur : lui seul, les participants de la course, l'hôte ou un enseignant?
11. Les courses publiques doivent-elles permettre des interactions entre inconnus, ou faut-il limiter les communications et masquer certaines informations?
12. Les quatre méthodes d'accès doivent-elles déjà fonctionner au premier checkpoint, ou une première méthode suffit-elle?

### Questions de contenu et d'expérience

13. Les extraits cohérents doivent-ils provenir de corpus libres de droits, être fournis par l'hôte, ou les deux?
14. Quelles bornes de longueur faut-il imposer aux textes personnalisés et générés?
15. Les deux bonus constituent-ils une exigence de la version finale minimale ou une fonctionnalité souhaitable si le temps le permet?
16. Souhaitez-vous séparer un « mode entraînement sérieux » sans bonus d'un « mode arcade » avec bonus?
17. Sur tablette et téléphone, préférez-vous autoriser la participation au clavier virtuel ou limiter ces appareils au mode spectateur?
18. Le système doit-il filtrer automatiquement les pseudonymes vulgaires en plus de permettre leur exclusion manuelle?
19. L'interdiction de collage suffit-elle, ou faut-il aussi détecter les frappes anormalement rapides et autres formes de triche?
20. Y a-t-il un hébergeur, un budget maximal ou une interdiction de fournir une carte de crédit pour activer une offre gratuite?

## 6. Hypothèses documentées et justifiées

- **HYP-01** - La transcription prévaut sur les notes lorsqu'elles se contredisent, car elle conserve plus fidèlement les propos du client. Les notes restent valides comme pistes à confirmer.
- **HYP-02** - « Professeur » est interprété comme « hôte » pour les permissions, car le client autorise aussi les étudiants à créer des courses.
- **HYP-03** - Une course exige au moins deux concurrents, dont un humain; un bot peut être le second. Cela rend la pratique individuelle compatible avec le minimum annoncé.
- **HYP-04** - La version minimale garantit 30 connexions dans une salle. Une capacité supérieure sera mesurée et documentée plutôt que qualifiée d'illimitée.
- **HYP-05** - Les données d'un invité persistent seulement dans sa session de navigateur. Une conservation au-delà de cette session nécessitera un consentement et un mécanisme d'identification supplémentaire.
- **HYP-06** - Le code QR est un raccourci optionnel vers le code ou le lien d'une salle, et non un quatrième mode d'accès.
- **HYP-07** - La configuration devient immuable au départ pour garantir que tous les participants courent selon les mêmes règles.
- **HYP-08** - Une reconnexion est autorisée grâce à un jeton de session temporaire non réutilisable par une autre personne.
- **HYP-09** - En l'absence de limite de temps, une personne inactive pendant 30 secondes est marquée AFK, puis abandonnée après confirmation. La valeur doit être testée, car 30 secondes peut être trop courte dans certains contextes.
- **HYP-10** - En mode non bloquant, le résultat de jeu utilise un temps ajusté par les erreurs; les statistiques pédagogiques conservent séparément la vitesse brute et la précision. Cela réduit la triche sans masquer les difficultés réelles.
- **HYP-11** - Les bonus appartiennent à un mode arcade activable. Un mode entraînement sans bonus reste disponible pour mesurer la progression de manière comparable.
- **HYP-12** - Les textes cohérents intégrés au système proviennent de sources libres ou sous licence; un texte personnalisé demeure sous la responsabilité de l'hôte.
- **HYP-13** - Le site est intégralement bilingue, mais un texte de course n'est pas traduit automatiquement, afin de ne pas modifier l'exercice choisi par l'hôte.
- **HYP-14** - Les appareils tactiles peuvent consulter toutes les pages et regarder une course. Leur participation active n'est promise qu'après un test d'ergonomie concluant.
- **HYP-15** - Les effets sonores, animations fortes et obstructions visuelles sont désactivables pour préserver l'accessibilité et permettre une utilisation en classe.
- **HYP-16** - Les fonctionnalités explicitement présentées comme idées bonus - équipes, import de fichier, saisie de code et mise à jour automatique du dictionnaire - sont hors du produit minimal.

## 7. Priorisation

### Essentiel - produit minimal viable final

- Authentification de base, mode invité et sécurité des comptes;
- création d'une salle et trois modes d'accès;
- salon avec paramètres visibles en temps réel;
- course simultanée, classement en direct, abandon et reconnexion;
- textes cohérents ou aléatoires, langue, longueur, caractères ciblés, liste noire, temps et gestion des erreurs;
- classement cohérent qui tient compte des erreurs;
- résultats, statistiques de course et heatmap individuelle;
- pratique avec au moins quelques niveaux de bots;
- interface bilingue, claire/sombre, adaptative et dotée d'une direction artistique originale;
- architecture React, Next.js, TypeScript, Tailwind CSS et PostgreSQL;
- déploiement HTTPS, dépôt public, documentation et tests automatisés.

### Souhaitable - forte valeur après le noyau

- liaison de plusieurs fournisseurs au même compte;
- bouton de partie rapide avec création automatique d'une salle;
- historique détaillé, progression, récompenses et heatmap globale;
- revanche avec la même salle;
- mode arcade avec au moins deux bonus de rattrapage;
- variété avancée et comportement très humain des bots;
- sons et animations de dépassement;
- détection de comportements de frappe anormaux;
- participation complète sur tablette avec clavier virtuel.

### Moins prioritaire - extensions

- courses en équipe;
- importation de fichiers texte;
- exercices de programmation dans plusieurs langages;
- difficulté calculée automatiquement;
- conservation des statistiques d'un invité entre plusieurs jours;
- synchronisation automatique avec un dictionnaire externe;
- grand catalogue de bonus ou algorithme d'équilibrage complexe;
- personnalisation cosmétique poussée.

### Portée du premier checkpoint

Le premier checkpoint doit se limiter à une fondation crédible : application déployée en HTTPS, première authentification fonctionnelle, structure technique initiale, début visible de la direction artistique et documentation minimale de démarrage. Le moteur de course complet, les bots, les bonus et les statistiques avancées sont hors de ce checkpoint.
