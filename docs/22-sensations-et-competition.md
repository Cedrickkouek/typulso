# Une course qui donne envie d’une revanche


> **Recherche du 6 octobre · intégration du 7 octobre 2026**  
> **Mon choix : un mélange, avec les modes classique et arcade.**\
> Les sons, duels, séries, reconnaissances mesurées et trois capacités sont maintenant intégrés aux vraies parties. Les mini-séries, fantômes, cosmétiques et musique restent proposés. Le prototype interactif conserve son scénario fictif ; l’application utilise les données et commandes du serveur.

La direction recommandée est une **arène de touches** : une frappe agréable, des adversaires reconnaissables, une occasion claire de revenir et une arrivée qui récompense le progrès. La personnalité et la palette actuelles restent la base. Le texte à reproduire garde sa stabilité ; la piste, les sons et quelques messages courts portent le spectacle.

## Le cahier et le choix actuel

Le cahier consolidé, fondé sur le PDF fourni le 2 octobre, demande deux mécanismes de rattrapage (**BONUS-01**), un avantage surtout destiné aux personnes derrière sans victoire garantie (**BONUS-02**), des règles compréhensibles et testées (**BONUS-03**), un classement visible de vitesse et précision (**STAT-01**) et un progrès perceptible (**STAT-06**). Le départ, le texte et les règles sont communs et figés (**RACE-01**). Le public principal a 12–17 ans, avec interface français/anglais et options d’accessibilité.

Les attaques entre joueurs, une boutique ou un championnat ne sont pas imposés par l’énoncé. Les pièges répondent à ma nouvelle demande ; ils enrichissent le mode arcade choisi, sans devenir la condition de réussite du minimum scolaire.

## Audit initial avant intégration

État observé le 6 octobre, avant les changements décrits dans « État des livrables ». Audit du moteur (`lib/domain/engine.ts`), des commandes arcade (`components/race-interface.tsx`), de la frappe (`components/typing-zone.tsx`) et des préférences (`lib/client/preferences.ts`).

| Élément | Comportement présent | Occasion d’amélioration |
|---|---|---|
| Classique / arcade | Deux modes ; vitesse et précision brutes restent séparées du bonus arcade | Expliquer le choix avant la partie et le calcul après |
| Énergie | +2 pour un nouveau caractère correct ; plafond 100 ; effacer et retaper ne rapporte pas à nouveau | Un signal unique lorsque l’action devient réellement disponible ; vérifier les textes courts, qui peuvent empêcher d’atteindre 100 |
| Capacité | 100 d’énergie, au moins 5 points de progression derrière le leader, un choix par manche | Donner de la présence au moment du choix, avec son et état confirmé |
| Boost | Ajoute `min(6, retard × 0,15)` au score arcade | Le nom « Accélération » peut laisser croire à un saut de progression ; proposer **Pulsation**, avec le montant réel affiché |
| Bouclier | Pendant 8 s, jusqu’à 3 erreurs protégées dans le calcul arcade ; avantage total plafonné à 6 | Montrer durée et charges restantes. Actuellement, il ne bloque pas une attaque adverse |
| Son | Un même bip de 520 Hz sur une insertion, correcte ou non ; activable, désactivé par défaut | Distinguer les événements. Le code crée et ferme un contexte audio pour chaque bip : mutualiser le contexte |
| Course | Pistes avec touches sur roues et initiales des autres sur le texte | Écart avec un rival, dépassement et dernier sprint clairement annoncés |
| Résultats | Statistiques réelles, classement et revanche | Récompenser aussi une précision ou un progrès mesuré, avec des comparaisons de mêmes règles |

**Attention au vocabulaire :** la progression sur le texte et le classement final sont différents. Le score classique est la vitesse correcte × précision². Le score arcade ajoute un avantage plafonné à 6. Faire bondir la position d’une touche lors du boost actuel serait une représentation fausse.

## Ce que les références apportent

Cette étude approfondit **7 expériences**, dont **3 revues à l’écran**. Elle complète le corpus de la recherche précédente, sans annoncer 50 nouveaux sites ni changer la direction artistique. Le registre sépare contenu lu, rendu et interaction.

| Référence officielle | Observation vérifiée | Transposition proposée |
|---|---|---|
| [Monkeytype — réglages](https://monkeytype.com/settings) | Choix distincts pour son de frappe, erreur et avertissement de temps ; volume ; curseur de rythme et relance rapide | Frappe discrète personnalisable, événements importants différenciés, fantôme personnel plus tard. Préserver Tab et les contrôles accessibles |
| [TypeRacer — Competitions 2.0](https://blog.typeracer.com/2026/02/24/introducing-competitions-2-0/) | Défi quotidien avec même citation ; badges évolutifs pour le top 3 et participation au défi ; compétitions séparées des entraînements | Comparaisons comparables, défis communs et reconnaissance de plusieurs formes de progrès |
| [Nitro Type — Nitro Radio](https://www.nitrotype.com/news/read/275/tune-in-and-turn-it-up-introducing-nitro-radio) | L’annonce officielle décrit une musique continue entre course, podium et nouvelle course | Une ambiance qui conserve le rythme entre les manches ; musique facultative et indépendante des effets |
| [Kahoot — paramètres](https://support.kahoot.com/hc/en-us/articles/115016055107-Live-game-settings) et [points](https://support.kahoot.com/hc/en-us/articles/115002303908-How-points-work) | Musique de salon prévisualisable, effets désactivables, réglages de contraste ; les séries de bonnes réponses n’ajoutent pas de points | Ritualiser départ et arrivée ; célébrer une série sans multiplier automatiquement le score |
| [Mario Kart World — Nintendo](https://www.nintendo.com/en-gb/Games/Nintendo-Switch-2-games/Mario-Kart-World-2790000.html) | Objets offensifs, esquives, courses en plusieurs étapes, fantômes et personnalisation décrits | Une action offensive lisible doit avoir une réponse ; une mini-série crée un enjeu supplémentaire |
| [Gimkit — actions](https://help.gimkit.com/en/article/quick-actions-149wiq2/) et [modes](https://help.gimkit.com/en/article/select-a-game-mode-6v16fo/) | L’hôte peut modifier les balances dans certains modes ; les modes portent des descriptions d’ambiance | Annoncer le type d’expérience avant de jouer. Éviter d’importer un rééquilibrage arbitraire de l’hôte dans une compétition de frappe |
| [ZType](https://zty.pe/) | Menu puis première vague de mots sur des cibles descendantes observés | Donner aux touches une présence physique et un but immédiat, en gardant mon texte collectif stable |

Ces observations n’établissent pas que telle mécanique explique le succès d’un jeu. Le bénéfice attendu pour Typulso est une hypothèse de conception à vérifier avec des joueurs.

## Une manche en six moments

| Moment | Ce que le joueur ressent | Présentation et déclenchement proposés |
|---|---|---|
| **Départ** | « On part ensemble » | 3–2–1, trois impulsions puis un accord de départ. Temps fourni par le serveur ; aucun rejeu complet lors d’une reconnexion |
| **Rythme** | « Ma frappe fonctionne » | Petit retour de touche correct ; erreur douce facultative. Séries de 10 / 25 / 50 nouvelles touches correctes, avec un signal ponctuel sur la piste |
| **Duel** | « Je peux le rejoindre » | Rival proche et écart en points de progression. Exemple : « Lina, 4 points devant ». Pas de conversion inventée en secondes |
| **Décision** | « J’ai une occasion » | Énergie prête + motif sonore unique. Pulsation immédiate ou protection à garder au bon moment ; choix à confirmer par le serveur |
| **Sprint** | « La fin approche » | Avertissement unique à 10 s pour une course chronométrée ; à 90 % de progression personnelle si elle n’a pas de limite. Pas de clignotement continu |
| **Arrivée** | « J’ai réussi quelque chose » | D’abord résultat personnel et podium ; puis reconnaissance mesurée, explication du score et revanche dans la même salle |

La série compte de **nouvelles positions correctes** : supprimer et retaper ne permet pas de répéter une récompense. Une faute remet la série à zéro sans message humiliant. Une correction réussie n’efface pas le fait qu’une erreur a eu lieu. Aucun multiplicateur de score n’est recommandé pour cette première version.

Un changement d’écart n’est pas un événement sonore. Pour un dépassement, exiger la position gagnée stable pendant 500 ms, puis au moins 4 s avant une nouvelle annonce. Les pistes gardent leur ordre ; le rang reste lisible séparément. N’annoncer que les moments de la personne qui joue, pas les dépassements des 29 autres concurrents.

## Une identité sonore, pas un bruit permanent

Le prototype présente **12 sons synthétisés originaux**. Une palette correspondante est maintenant intégrée à l’application, avec douze aperçus dans les préférences, deux commandes indépendantes (frappe/événements) et un volume commun. La musique reste proposée.

| Son | Intention | Budget proposé en application |
|---|---|---|
| Touche correcte | Clic doux, 20–35 ms | Option indépendante ; maximum 12 sons/s, sans retarder la saisie |
| Erreur | Son grave court, sans buzzer | Maximum 2/s ; option désactivable |
| Départ | Trois impulsions puis résolution | Une séquence par départ ; synchroniser sur l’horloge serveur |
| Série parfaite | Trois notes ascendantes | Paliers 10 / 25 / 50 ; pas de répétition à chaque touche |
| Énergie prête | Deux notes contrastées | Au passage indisponible → disponible, une fois ; reconnexion silencieuse |
| Dépassement | Montée courte | Position confirmée et temporisation, seulement pour soi |
| Pulsation | Montée électrique | Après acquittement serveur, jamais sur un clic refusé |
| Bouclier | Timbre cristallin | Activation confirmée ; petit impact distinct si une charge est consommée |
| Piège annoncé | Motif d’alerte | Un avertissement pour la cible et un signal de lancement pour l’auteur |
| Piège contré | Impact puis résolution | Après événement confirmé, dédupliqué |
| Arrivée | Petite fanfare | Fin confirmée, une fois par course |
| Record personnel | Accord distinct | Seulement après comparaison avec un historique admissible réel |

Trois commandes : **frappe**, **événements**, **musique**, chacune avec son état ; volume accessible. Conserver le silence par défaut tant que la personne n’a pas choisi. La musique sans paroles reste basse et s’atténue temporairement sous une alerte. Une première intégration peut livrer les événements sans musique.

Réutiliser un `AudioContext`, créé ou repris après une interaction autorisée, et un gain maître. Lorsqu’on coupe le son, interrompre aussi les notes déjà programmées ; en onglet masqué, arrêter l’ambiance et ne pas rattraper tous les anciens sons au retour. [MDN recommande de réutiliser le contexte audio](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext) et rappelle les [contraintes de démarrage audio](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices). Limiter les voix simultanées et donner priorité à départ/fin/alerte devant les petits clics.

## Arcade : commencer avec trois choix, une seule utilisation

**Version intégrée :** Pulsation (nom affiché du boost), Bouclier et Virgule piégée, 100 d’énergie, 5 points derrière le leader, un seul choix par manche.

**Virgule piégée intégrée, équilibre à tester avec des joueurs.** L’attaque met la précision sous pression et conserve la frappe normale.

| Règle intégrée | Valeur initiale de test |
|---|---|
| Coût et attribution | 100 d’énergie et ≥5 points derrière le leader ; remplace le choix Pulsation/Bouclier de la manche, sans usage supplémentaire |
| Cible | Concurrent actif et connecté le plus proche devant soi ; identifié avant le lancement et revalidé par le serveur |
| Avertissement | 1,2 s, icône virgule et message sur la piste ; texte à taper intact |
| Effet | Pendant 3 s, chaque nouvelle erreur coûte 1 point **arcade**, maximum 2. Les erreurs restent comptées normalement dans la précision brute |
| Réponse par le talent | Ne pas faire de nouvelle erreur pendant l’effet : aucune pénalité |
| Réponse par le bouclier v2 | Un bouclier encore actif à l’impact absorbe une attaque et expire, en complément de sa protection de trois erreurs pendant 8 s. Une activation tardive n’efface pas les pénalités déjà reçues |
| Protection collective | Aucun cumul d’attaques actives ; 10 s d’immunité après résolution ; total des pénalités adverses plafonné à 4 par personne et par manche |
| Fin et départ | Pas d’attaque dans les 5 premières secondes ni dans les 5 dernières secondes d’une course chronométrée ; ni sur une cible déjà à 95 % |
| Cible disparue | Refuser sans débiter l’énergie si la cible n’est plus admissible à l’acceptation. Après acceptation, une déconnexion annule l’effet restant sans nouvelle cible |
| Score proposé | `max(0, base + min(6, avantageBoost + avantageBouclier) − min(4, pénalitéPièges))` |

La pénalité amplifie temporairement le coût d’une erreur : elle peut donc frustrer. Tester d’abord **1 point maximum** puis 2 ; conserver la variante qui crée un choix sans rendre la défaite arbitraire. Pas de hasard dans l’attribution ni d’accélération invisible des bots. La possibilité de riposte doit être compréhensible même sans son.

Les effets sont sur la piste : une petite virgule en approche, un impact, une protection qui absorbe. Avec mouvements réduits, remplacer les déplacements décoratifs par des icônes et textes stables. Ne pas introduire mots cachés, touches inversées, saisie gelée ou caractères imposés à un seul joueur : ils dégraderaient la tâche commune et les comparaisons.

**Éviter un catalogue au départ.** Trois choix suffisent pour tester attaque, protection et rattrapage. Des personnages peuvent changer l’apparence et le timbre plus tard, sans avantage payant ni changement secret des règles.

## Un enjeu qui dépasse la première place

À court terme, ajouter une reconnaissance au résultat quand les données la justifient :

- **Précision remarquable** : ≥98 %, minimum 20 tentatives ; ne pas récompenser le 100 % d’une absence de frappe.
- **Belle remontée** : au moins 2 places de progression gagnées entre un instant de référence à mi-course et la fin ; les entrants spectateurs ne modifient pas le groupe comparé.
- **Nouveau meilleur** : vitesse supérieure au meilleur résultat admissible du même mode, langue et famille de règles. Si l’historique manque, afficher simplement « Première référence ».
- **Série solide** : longueur de la meilleure série correcte de nouvelles positions, réellement enregistrée.

Montrer un ou deux moments pertinents, sans inventer une récompense pour tout le monde. Les vainqueurs gardent leur podium ; ceux qui progressent ont aussi une raison de revenir.

Ensuite, une **mini-série de trois manches** crée un enjeu partagé : « 1–1, dernière manche ». Il faut un identifiant de série, des participants et règles verrouillés, un calcul de points annoncé, une gestion des départs et de vraies données persistées. La revanche existante reste l’action immédiate ; afficher un compteur de série sans ce modèle serait trompeur.

Autres pistes après validation : défi commun quotidien, fantôme personnel construit depuis ses propres progressions enregistrées, skins de touches gagnés par des objectifs accessibles. La musique continue peut renforcer la transition entre les manches. Ces idées restent derrière la qualité de la course et des résultats.

## Livraison recommandée

| Ordre | Lot | Pourquoi commencer ici | Preuve attendue |
|---|---|---|---|
| **P0** | Fin de course fiable, saisie et reconnexion | Une erreur à chaque arrivée détruit la satisfaction | Deux sessions réelles ; aucune frappe acceptée après l’échéance ; un résultat par participant |
| **P1** | Palette de sons, départ/arrivée, énergie prête, états de bonus et nom exact | Forte amélioration des sensations sans nouveau score | Sons optionnels, dédupliqués, aucune annonce après refus ; FR/EN et deux thèmes |
| **P1** | Rival proche, dépassement mesuré, sprint et récompense personnelle étayée | Rend lisibles duel et progrès | Cas de tie, corrections, faible nombre de touches, arrivée/reconnexion |
| **P2** | Virgule piégée + contre-mesure | Ajoute de la tactique ; change le moteur et demande équilibrage | Tests serveur, deux clients, plafond/cooldown, privé/collectif, 30 joueurs |
| **P3** | Série de trois manches, défi, fantôme et cosmétiques | Renforce l’envie de revenir | Vrai stockage, comparaison de mêmes règles, migration et récupération |

Le prototype conserve une démonstration fictive ; P0, les sons et duels de P1 et les règles de piège de P2 sont intégrés. La récompense « Belle remontée » et P3 restent proposés. Les durées et nombres sont des paramètres initiaux, pas un équilibre prouvé.

## Vérifier le plaisir avec des joueurs

Faire jouer 4–6 personnes de niveaux variés, avec au moins une personne débutante : deux manches classiques puis deux arcades, puis inverser l’ordre dans un autre groupe. Comparer la compréhension du classement, l’envie volontaire de revanche, le plaisir et la frustration, sans confondre un petit essai avec une mesure statistique du succès.

Questions après la manche : « Pourquoi as-tu gagné ou perdu ? », « À quel moment as-tu senti que tu pouvais revenir ? », « Le piège t’a-t-il laissé une réponse ? », « Quel son t’a gêné ? ». Relever si une attaque interrompt la lecture, si l’énergie arrive trop tard sur un texte court, et si le joueur désactive spontanément les sons.

Vérification technique pour l’intégration : commandes idempotentes, effets calculés par le serveur, ordre et identité des événements, statut spectateur, changement de manche, départ/expiration de cible, reconnexion, Unicode/composition et correction. Ne pas diffuser la saisie des autres pour produire ces effets ; les progressions publiques suffisent aux repères visuels.

## État des livrables · intégration du 7 octobre

- **Dans les vraies parties :** départ sonore synchronisé au snapshot, frappe correcte/erreur différenciées, séries à 10/25/50/100 nouvelles positions correctes, énergie prête, dépassement stable, dernier sprint, arrivée et record comparable. Les sons restent désactivés par défaut ; douze aperçus et volume sont disponibles dans les préférences.
- **Arcade serveur :** Pulsation, Bouclier et Virgule piégée. Avertissement de 1,2 s, pression de 3 s, jusqu’à −2 points par attaque et −4 par manche ; dix secondes d’immunité à la résolution. Aucune attaque dans les cinq premières/dernières secondes, ni sur une cible à 95 %. La cible identifiée est revalidée ; elle n’est pas remplacée silencieusement. Effets et commandes idempotents, événements publics bornés, aucune saisie privée adverse diffusée.
- **Résultats réels :** précision remarquable (≥98 %, au moins 20 tentatives), meilleure série d’au moins dix touches, nouveau record ou première référence admissible. La famille de comparaison inclut mode, langue, correction, type/longueur/durée de texte, texte personnalisé et contraintes du corpus. Les anciens résultats dépourvus de ces repères ne servent pas de référence. Les bonus et pénalités arcade sont séparés des mesures brutes.
- **Restent proposés :** musique, reconnaissance de remontée à mi-course, série de trois manches, défis quotidiens, fantômes et cosmétiques. Aucune donnée inventée ne les remplace dans l’application.
- **Conservé :** mode classique, palette, texte stable, saisie directe sans rectangle, corrections de fin de course et sortie vers Jouer après fermeture.

Les contrôles complets passent : **69 tests unitaires**, **9 tests d’intégration PostgreSQL/HTTP/Socket.IO** (dont le scénario arcade à trois sessions), TypeScript, lint et compilations. La recette navigateur utilise une véritable salle avec un hôte de fixture, un bot et une session invitée : frappe, énergie, lancement de piège, usage unique, FR/EN, clair/sombre, mobile à 390 px sans débordement, aperçu Bouclier et commandes sonores. Voir le rapport.

L’écoute humaine sur différents équipements et l’équilibrage avec des joueurs restent à réaliser. Le prototype demeure une illustration distincte des parties persistées.
