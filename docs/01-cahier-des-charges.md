# Cahier des charges — plateforme de courses de frappe

> **Web V · 420-5U3-SO**  
> Version consolidée du 2 octobre 2026 · Référentiel produit proposé  
> Public principal : jeunes de 12 à 17 ans · Langues : français et anglais

**Intention.** Transformer la pratique du clavier en une compétition conviviale qui donne envie de recommencer, tout en montrant clairement les progrès en vitesse et en précision.

Ce document reprend le [cahier initial](../sources/cahier-des-charges.md), complète ses formulations à partir de l'[analyse des besoins](../sources/analyse-des-besoins-cahier-des-charges.md) et intègre les réponses client et la grille du checkpoint fournies en captures. Il conserve les identifiants du cahier initial. Les réponses client confirmées sont séparées des propositions de conception. La consolidation, les noms proposés, le logo et les choix techniques n'ont pas encore fait l'objet d'une validation complète par l'utilisateur.

Le [PDF fourni le 2 octobre 2026](../sources/cahier-des-charges-2026-10-02.pdf) confirme les 49 exigences produit et précise leur priorisation finale : partie rapide, revanche, bots variables et deux bonus sont essentiels; la heatmap globale est souhaitable. Les réponses client spécifiques et la grille CP1 plus détaillée continuent de s'appliquer. Le [plan complet des pages](15-plan-des-pages.md) documente les écarts avec les versions précédentes, sans changer les IDs historiques.

## Sommaire

- [Vision et public](#vision-et-public)
- [Glossaire](#glossaire)
- [Exigences du produit](#exigences-du-produit)
- [Précisions client](#précisions-client)
- [Exigences du checkpoint 1](#exigences-du-checkpoint-1)
- [Hypothèses et décisions à valider](#hypothèses-et-décisions-à-valider)
- [Priorisation](#priorisation)
- [Critères de réussite et livrables](#critères-de-réussite-et-livrables)

## Vision et public

Un hôte crée une salle, choisit les règles et invite des participants. Tous reproduisent un contenu au clavier, tandis que leur progression et leurs positions se mettent à jour en direct. Après la course, le classement, les statistiques et une heatmap expliquent ce qui a bien fonctionné et ce qui mérite de la pratique. Des bots rendent l'entraînement possible lorsqu'aucun autre joueur n'est disponible.

Le produit doit fonctionner en classe, dans une activité parascolaire et à la maison. Les enseignants et les étudiants possèdent les mêmes capacités de création : l'autorité dans une salle appartient à son hôte. Aucun espace particulier de gestion de classe ou d'accès enseignant aux résultats n'est requis par les réponses fournies.

L'utilisateur souhaite une énergie inspirée de **Kahoot**, une entrée en activité aussi claire que **Wooclap** et une qualité de concentration inspirée de **Monkeytype**. Ces références orientent la conception; elles ne définissent ni une reproduction de leurs interfaces ni un nouveau catalogue de fonctionnalités. La direction recherchée est originale, captivante, accessible et adaptée aux adolescents.

Le projet utilisera l'écosystème **React / Next.js / Tailwind CSS / PostgreSQL** demandé. Le cahier initial impose aussi **TypeScript** pour les modules applicatifs. « React JS » et « Next JS » sont ici compris comme les technologies, avec du code applicatif TypeScript; ce point est explicité pour éviter une divergence silencieuse.

## Glossaire

| Terme | Définition |
|---|---|
| **Hôte** | Membre qui configure et administre la salle. Il peut être enseignant ou étudiant; ce rôle appartient à la salle. |
| **Salle / salon** | Espace partagé avant, pendant et après une course. Le salon désigne son écran d'attente et de configuration. |
| **Course** | Épreuve de frappe simultanée. Le minimum de deux concurrents, dont un humain, reste une hypothèse; un bot pourrait être le second. |
| **Participant** | Personne ou bot qui reproduit le contenu et peut être classé. |
| **Spectateur** | Membre qui observe sans participer à la course en cours. |
| **Invité** | Personne sans compte permanent, identifiée par un pseudonyme et une session temporaire. Elle peut rejoindre une course, mais ne peut pas en créer. |
| **Course publique** | Course visible et accessible depuis la plateforme. |
| **Course semi-publique** | Course non répertoriée accessible avec un code. Un QR est un raccourci facultatif. |
| **Course privée** | Course accessible uniquement par lien d'invitation individuel à usage unique. |
| **Erreur bloquante** | Erreur à corriger avant de poursuivre. |
| **Erreur non bloquante** | Erreur comptabilisée qui n'interrompt pas immédiatement la frappe. |
| **Bonus de rattrapage** | Effet destiné principalement aux participants en retard, sans garantir leur victoire. |
| **Statistiques de session** | Données visibles pendant la session active d'un invité; leur durée précise reste à fixer. |
| **Statistiques permanentes** | Historique associé à un compte, disponible lors des connexions suivantes. |
| **Heatmap** | Clavier dont les touches représentent la fréquence des erreurs, accompagné de valeurs lisibles sans dépendre seulement de la couleur. |

## Exigences du produit

Les identifiants suivants proviennent du cahier initial. Un énoncé décrit un besoin attendu; il ne constitue pas une preuve de réalisation. La [matrice des exigences](02-matrice-exigences.md) précise leur validation et leur place dans le checkpoint.

### Comptes et permissions

| ID | Exigence |
|---|---|
| **AUTH-01** | Offrir quatre accès : Discord, GitHub, compte local et mode invité. Une première méthode fonctionnelle suffit pour amorcer CP1; la grille ne précise pas lesquels des quatre doivent déjà être opérationnels. |
| **AUTH-02** | Mettre Discord et GitHub en évidence; conserver le compte local comme solution secondaire. |
| **AUTH-03** | Créer un compte local avec nom d'utilisateur et mot de passe, sans courriel ni récupération. Informer clairement l'utilisateur de l'absence de récupération; hacher les mots de passe côté serveur. |
| **AUTH-04** | Permettre à l'invité de choisir un pseudonyme temporaire et de participer sans compte permanent. Lui refuser la création d'une salle. Les résultats successifs restent visibles pendant sa session active. |
| **ROLE-01** | Permettre à tout utilisateur avec compte, enseignant ou étudiant, de créer une salle et d'en devenir l'hôte. Ne pas créer de permissions permanentes fondées sur le statut scolaire. |
| **ROLE-02** | Permettre à l'hôte de désigner les participants et les spectateurs avant le départ et d'exclure une personne de sa salle. Les restrictions doivent être appliquées par le serveur. |

### Accès et cycle de la salle

| ID | Exigence |
|---|---|
| **ROOM-01** | Proposer les modes public, semi-public par code et privé par liens individuels à usage unique. Le privé se rejoint exclusivement par lien; un QR semi-public peut être ajouté comme commodité. |
| **ROOM-02** | Mettre en évidence une action permettant de rejoindre rapidement une course publique en attente. |
| **ROOM-03** | Créer une salle si aucune course publique n'est prête lorsque l'action rapide est utilisée par une personne autorisée à créer. Pour un invité, le comportement de repli reste à choisir sans lui accorder la création. |
| **ROOM-04** | Montrer en temps réel les réglages choisis par l'hôte et les membres présents; les autres membres ne peuvent pas modifier la configuration. |
| **ROOM-05** | Transformer toute nouvelle arrivée après le départ en spectateur jusqu'à la prochaine course. Distinguer cette arrivée d'une reconnexion authentifiée d'un participant existant. |
| **ROOM-06** | Restaurer l'identité et la progression après une interruption temporaire du réseau, y compris pour l'hôte. La fenêtre de reprise et le mécanisme d'identité doivent être définis. |
| **ROOM-07** | Permettre l'abandon volontaire et traiter l'inactivité ou la déconnexion prolongée pour empêcher une personne de bloquer indéfiniment la fin. |
| **ROOM-08** | Soutenir au minimum une classe d'environ 30 personnes. Mesurer et documenter la capacité, la latence et les conditions de test. Ne pas annoncer une capacité illimitée. |
| **ROOM-09** | Permettre à l'hôte de lancer une revanche dans la même salle ou de fermer la salle après les résultats. |

### Configuration de la course

| ID | Exigence |
|---|---|
| **CONF-01** | Choisir un texte cohérent, une suite de mots ou un texte personnalisé. |
| **CONF-02** | Produire des contenus variables selon des règles et des banques de mots, sans IA générative intégrée au produit. |
| **CONF-03** | Choisir indépendamment la langue de l'interface et celle du contenu. Ne pas traduire automatiquement l'exercice choisi par l'hôte. |
| **CONF-04** | Cibler des thèmes, accents, signes de ponctuation, chiffres ou caractères spéciaux. |
| **CONF-05** | Définir la longueur du texte et interdire certains caractères; vérifier leur absence dans le contenu généré. Les bornes de longueur restent à fixer. |
| **CONF-06** | Configurer une limite de temps facultative et, si désiré, un objectif de vitesse. |
| **CONF-07** | Choisir si une erreur bloque la frappe jusqu'à sa correction ou si elle est comptabilisée sans arrêter le participant. |
| **CONF-08** | Appliquer en mode non bloquant une pénalité qui empêche de gagner en tapant au hasard. La formule commune de classement reste à valider. |
| **CONF-09** | Terminer lorsque tous les participants actifs ont fini ou lorsque le temps expire; appliquer explicitement les règles d'abandon et d'inactivité. Un éventuel délai après le premier arrivé reste à décider. |
| **CONF-10** | Bloquer le collage dans la zone de frappe. Cette protection ne suffit pas, à elle seule, à démontrer l'absence de triche. |

### Course en temps réel

| ID | Exigence |
|---|---|
| **RACE-01** | Démarrer simultanément pour tous les participants et figer le contenu et les règles au départ. La synchronisation doit s'appuyer sur l'autorité du serveur. |
| **RACE-02** | Afficher en direct la progression, la position et les dépassements importants. |
| **RACE-03** | Enregistrer le temps, la progression, les frappes correctes, les erreurs, les corrections et l'état de connexion de chaque participant. |
| **RACE-04** | Garder la visualisation compréhensible avec environ 30 participants sans détourner excessivement l'attention du texte. |
| **RACE-05** | Permettre de désactiver les sons et de réduire ou supprimer les animations fortes et les effets visuels, y compris les obstructions. |

### Bots et bonus

| ID | Exigence |
|---|---|
| **BOT-01** | Permettre la pratique individuelle avec des bots ainsi que l'ajout de bots dans une course collective. |
| **BOT-02** | Offrir plusieurs niveaux et faire fluctuer la vitesse et les erreurs de façon plausible. Les résultats ne doivent pas être systématiquement égaux à une vitesse théorique. Un éventuel niveau « impossible » doit être présenté comme tel. |
| **BONUS-01** | Inclure au moins deux mécanismes de rattrapage dans la version finale. Leur priorité essentielle est confirmée par le PDF fourni le 2 octobre; les effets et l'équilibrage restent à définir. Un mode arcade distinct demeure une proposition. |
| **BONUS-02** | Favoriser surtout les personnes en retard, sans garantir leur victoire ni neutraliser systématiquement les meilleures. |
| **BONUS-03** | Documenter, rendre compréhensible et tester la règle d'attribution. Les capacités de personnages sont autorisées comme piste de conception à condition de préserver le rattrapage. Les effets doivent respecter les options d'accessibilité. |

L'ajout de mots au meneur, le retrait de mots au joueur en retard et l'obstruction temporaire du texte sont des **exemples issus de l'analyse**, pas une liste d'effets déjà choisie. Modifier les longueurs rend les temps bruts difficilement comparables : les performances pédagogiques et le résultat de jeu devront rester distinguables.

### Résultats et progression

| ID | Exigence |
|---|---|
| **STAT-01** | Afficher un podium, normalement les trois meilleurs résultats, et un classement fondé sur une règle commune et visible de vitesse et de précision. |
| **STAT-02** | Présenter les statistiques publiques de la course et les statistiques personnelles de chaque participant, dont vitesse, précision, erreurs et évolution pendant l'épreuve. Définir la visibilité des données permanentes avant livraison. |
| **STAT-03** | Montrer une heatmap des erreurs par touche après la course. |
| **STAT-04** | Conserver pour les comptes l'historique, les vitesses moyennes, les classements moyens, les victoires et le nombre de courses. La rétention et la visibilité restent à définir. |
| **STAT-05** | Conserver les résultats successifs d'un invité pendant sa session active. Ne pas promettre un suivi entre plusieurs jours sans décision explicite et mécanisme d'identification. |
| **STAT-06** | Rendre l'amélioration visible dans le temps par un système de progression. La forme des récompenses reste à concevoir. |

La **heatmap globale** constitue un enrichissement souhaitable selon le PDF fourni le 2 octobre. Elle est distincte de la heatmap de chaque course, obligatoire au titre de STAT-03. La version consolidée précédente l'incluait dans STAT-04; cette priorité est corrigée sans retirer le besoin de conception ni supprimer un ID.

### Expérience et contraintes techniques

| ID | Exigence |
|---|---|
| **UX-01** | Offrir une direction artistique originale, professionnelle, dynamique et adaptée aux 12 à 17 ans sur l'accueil, le salon, la course, les résultats, les statistiques et les paramètres. |
| **UX-02** | Fournir les interfaces française et anglaise, des sélecteurs visibles de langue et de thème clair/sombre ainsi qu'une mise en page adaptative sur ordinateur, tablette et téléphone. La participation au clavier virtuel reste à décider. |
| **UX-03** | Concevoir humainement le nom et le logo et documenter la démarche. Les propositions de l'assistant sont des supports de travail; leur adoption, leur évolution et la conception finale doivent être attribuées honnêtement. Un logo générique non modifié ne répond pas au besoin. |
| **TECH-01** | Utiliser React, Next.js, TypeScript, Tailwind CSS et PostgreSQL. Justifier l'outil d'accès aux données; ne pas écrire de nouveau module applicatif JavaScript en contradiction avec le cahier initial. |
| **TECH-02** | Déployer en HTTPS avec une solution temps réel adaptée et justifiée, par exemple WebSocket ou MQTT. Documenter les limites mesurées de capacité, de latence et de reconnexion. |
| **TECH-03** | Choisir des services externes gratuits ou faire approuver explicitement leurs coûts et leurs limites. Le fournisseur et les conditions de l'offre devront être vérifiés avant activation. |
| **TECH-04** | Héberger le code dans un dépôt GitHub public sans secrets. Documenter l'installation, la configuration, l'architecture, l'organisation du code et le déploiement. Ne jamais publier les mots de passe ni les jetons. |
| **TECH-05** | Exécuter automatiquement les tests unitaires et de bout en bout lors des changements sur GitHub. Aucun chatbot ou système d'IA n'est requis dans l'application finale. |

## Précisions client

Les captures fournies le 1er octobre 2026 résolvent plusieurs questions anciennes. Elles ajoutent les identifiants suivants, sans modifier rétrospectivement les IDs du cahier initial.

| ID | Précision confirmée | Source |
|---|---|---|
| **CLIENT-01** | Les enseignants n'ont pas de rôle particulier; les comptes ont les mêmes capacités de création. L'hôte est un rôle temporaire de salle. | Image 1 |
| **CLIENT-02** | Les invités peuvent seulement participer à une course; ils ne peuvent pas en créer. | Image 1 |
| **CLIENT-03** | Une course semi-publique se rejoint par code. Le QR est une option appréciée, sans être obligatoire. Le format alphabétique, numérique ou alphanumérique revient à l'équipe. | Image 3 |
| **CLIENT-04** | Une course privée se rejoint seulement par lien d'invitation. Le caractère individuel et à usage unique provient du cahier initial. | Image 3 + cahier |
| **CLIENT-05** | Après une courte déconnexion, l'hôte doit pouvoir revenir dans la course comme les participants. | Image 1 |
| **CLIENT-06** | Si l'hôte abandonne et quitte, le participant qu'il a choisi avant son départ devient hôte; sans choix, le participant le plus ancien prend le relais. Les égalités et l'éligibilité exacte d'un invité doivent être définies. | Image 1 |
| **CLIENT-07** | Les personnages à capacités uniques, alimentées par la frappe correcte, sont une alternative acceptée aux bonus aléatoires. Ils doivent conserver une chance de rattrapage pour les participants en difficulté. | Image 2 |
| **CLIENT-08** | L'équipe décide de la durée de validité d'un lien privé. La durée n'a pas été fixée par le client. | Image 1 |

## Exigences du checkpoint 1

La grille des images 4 et 5 remplace la portée trop restreinte du paragraphe CP1 du cahier initial. **Créer une salle, la rejoindre par code et voir les mises à jour en temps réel sont exigés dès CP1.** Le moteur complet de frappe demeure hors de ce minimum.

| ID | Résultat attendu à CP1 |
|---|---|
| **CP1-01** | Application accessible publiquement en HTTPS. |
| **CP1-02** | Première authentification réellement fonctionnelle. Les quatre modes complets restent un objectif du produit final; leur obligation à CP1 n'est pas précisée. |
| **CP1-03** | Direction artistique amorcée et visible dans l'interface; dossier créatif couvrant nom, logo, moodboard, palette et typographies. |
| **CP1-04** | Le moteur complet de course, les bots, les bonus et les statistiques avancées ne sont pas nécessaires au minimum de CP1; cette exclusion ne dispense pas du salon en temps réel. |
| **CP1-05** | PostgreSQL connecté à l'application déployée avec persistance vérifiable. |
| **CP1-06** | Un compte peut créer une salle; une autre session la rejoint par code; les changements de membres et de réglages se voient en temps réel. |
| **CP1-07** | Modèle de données, machine à états et ADR du temps réel documentés et cohérents avec le code de CP1. |
| **CP1-08** | Intégration continue initiale configurée et exécutée avec preuves consultables. |
| **CP1-09** | Langue, thème, qualité initiale du code et matrice des exigences démontrables. Le niveau exact de couverture linguistique reste à cadrer; proposer FR/EN et clair/sombre sur tous les écrans de CP1. |
| **CP1-10** | Cahier et documents de conception lisibles en Markdown dans le futur dépôt; liens de remise réels vers le dépôt et le site une fois créés et déployés. |

Les identifiants CP1-01 à CP1-04 correspondent aux thèmes déjà présents dans l'analyse. Les suivants explicitent les nouveaux critères de la grille. Voir le [plan du checkpoint](08-plan-checkpoint.md) pour les poids et les preuves attendues.

## Hypothèses et décisions à valider

Ces identifiants sont conservés pour la traçabilité du cahier initial. Leur statut a été actualisé au lieu de les présenter comme des engagements confirmés.

| ID | Hypothèse initiale et état actuel |
|---|---|
| **HYP-01** | La transcription prévaut sur les notes quand elles divergent. Pour cette consolidation, les réponses écrites plus précises des captures corrigent les points qu'elles traitent. Les sources d'origine non directement relues ne sont pas présentées comme vérifiées. |
| **HYP-02** | Les commandes appartiennent à l'hôte plutôt qu'au professeur. **Confirmé** par CLIENT-01. |
| **HYP-03** | Une course comprend au moins deux concurrents, dont un humain; un bot peut être le second. **À valider.** |
| **HYP-04** | La cible minimale est de 30 personnes; une capacité supérieure est mesurée. **Cible de cadrage**, sans preuve de capacité actuelle. |
| **HYP-05** | Les données d'un invité persistent seulement pendant sa session de navigateur. **À préciser** : fermeture d'onglet, session serveur, durée maximale et suppression. |
| **HYP-06** | Le contenu et la configuration deviennent immuables au départ. **Règle proposée**, cohérente avec RACE-01. |
| **HYP-07** | Les bonus appartiennent à un mode arcade; un entraînement sans bonus conserve des mesures comparables. **À valider**, avec CLIENT-07. |
| **HYP-08** | Les textes intégrés proviennent de sources libres ou autorisées; le texte personnalisé relève de l'hôte. **Source et licences à définir** avant intégration du corpus. |
| **HYP-09** | Les appareils tactiles offrent au moins consultation et mode spectateur. **Participation au clavier virtuel à décider** après essai. |
| **HYP-10** | Sons, animations fortes et obstructions peuvent être désactivés. **Exigence d'expérience conservée**; validation ergonomique à effectuer. |

### Points ouverts

1. Fixer la formule de classement et séparer les résultats arcade des mesures pédagogiques.
2. Définir les délais de reconnexion, d'inactivité, de fin sans minuterie et d'expiration des invitations. Le client délègue le dernier choix à l'équipe; aucune valeur n'est encore confirmée.
3. Préciser le transfert d'hôte quand le participant le plus ancien est invité, déconnecté, spectateur ou bot. Le client interdit la création aux invités mais ne précise pas explicitement leur succession comme hôte.
4. Choisir le format du code semi-public et le repli de la partie rapide pour un invité lorsque toutes les salles sont indisponibles.
5. Définir visibilité, rétention et suppression des données permanentes et temporaires. Aucun droit supplémentaire de consultation n'est accordé automatiquement à un enseignant.
6. Choisir les bornes des contenus, les corpus et leurs licences ainsi que la politique sur les pseudonymes. L'exclusion manuelle est conservée; un filtre automatique n'est pas confirmé.
7. Décider la participation au clavier virtuel et tester l'ergonomie avec les utilisateurs visés.
8. Définir les deux mécanismes de rattrapage, leur attribution et leur équilibre. Le PDF fourni le 2 octobre résout l'ancienne ambiguïté de priorité en les classant essentiels; il ne choisit pas leurs effets.
9. Confirmer comment les propositions de nom et de logo assistées respectent UX-03 et documenter la contribution humaine réelle. La validation de l'utilisateur ne doit pas être inventée.
10. Vérifier les offres d'hébergement et d'authentification, leurs limites et les moyens d'activation autorisés avant déploiement.

## Priorisation

Une exigence numérotée n'est pas supprimée parce qu'une version précédente la présentait comme « souhaitable ». La priorisation ci-dessous est actualisée d'après le PDF fourni le 2 octobre; le [registre des sources](09-sources-et-decisions.md) conserve l'ancienne contradiction des bonus et explique sa clarification.

| Niveau | Portée proposée |
|---|---|
| **CP1 — obligatoire maintenant** | Cahier et matrice; démarche créative; architecture et ADR; application HTTPS avec authentification et PostgreSQL; salon créé et rejoint par code avec mises à jour en temps réel; CI, langue, thème et qualité initiale. |
| **Noyau final — essentiel** | Quatre accès; mêmes droits pour les comptes et création interdite aux invités; trois modes de salle; partie rapide; course synchronisée et reconnexion; configuration et règles de frappe; classement, statistiques, heatmap de course, historique et progression minimale; transfert d'hôte et revanche; bots de plusieurs niveaux aux comportements variables; deux mécanismes de rattrapage; interface bilingue et adaptative; sécurité, tests et documentation. |
| **Souhaitable après le minimum** | Liaison de fournisseurs; progression détaillée; heatmap globale; objectif de vitesse; sons; détection d'anomalies; participation complète sur tablette/clavier virtuel. Les modes d'erreur, l'historique et la progression minimale restent essentiels. |
| **Rattrapage — effets à choisir** | Au moins deux mécanismes essentiels selon BONUS-01 et le PDF du 2 octobre. Définir attribution, limites et comparaison des résultats. Les personnages à énergie issue de la frappe correcte sont une piste autorisée; un mode arcade séparé reste proposé. |
| **Extensions hors minimum** | Équipes; import de fichiers; exercices de programmation; difficulté automatique; statistiques invitées sur plusieurs jours; dictionnaire externe; nombreux bonus; personnalisation cosmétique avancée. |

## Critères de réussite et livrables

Le produit réussit si les participants rejoignent facilement une salle, comprennent la course, peuvent se concentrer sur leur frappe et reçoivent des résultats utiles. L'enthousiasme pendant la course doit coexister avec la lisibilité du texte, les options d'accessibilité et une progression observable.

La documentation Markdown prévue comprend :

| Livrable | Document |
|---|---|
| Cahier consolidé et validation | Ce document + [matrice](02-matrice-exigences.md) |
| Démarche créative, nom, logo, moodboard, palette, typographies | [Direction artistique](03-direction-artistique.md) |
| Parcours, structure, hiérarchie et maquettes | [Expérience utilisateur](04-experience-utilisateur.md) |
| Architecture et choix des services | [Architecture](05-architecture.md) |
| Entités, relations et contraintes | [Modèle de données](06-modele-donnees.md) |
| Cycle de salle, course et reconnexion | [Machines à états](07-machines-etats.md) |
| Choix du temps réel | [ADR 0001](adr/0001-temps-reel.md) |
| Jalons, grille et preuves | [Plan du checkpoint](08-plan-checkpoint.md) |
| Sources, contradictions et décisions | [Sources et décisions](09-sources-et-decisions.md) |
| Installation, qualité, configuration et exploitation | [Développement et déploiement](10-developpement-et-deploiement.md) |

**État de livraison.** Ces documents préparent le projet. Ils ne prouvent ni une application implémentée, ni un test réussi, ni un déploiement. La matrice et le plan du checkpoint devront être mis à jour avec des preuves une fois le code et les environnements disponibles.
