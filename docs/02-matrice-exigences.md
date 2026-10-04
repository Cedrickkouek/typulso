# Matrice des exigences

> Référentiel : [cahier consolidé](01-cahier-des-charges.md) · Version du 2 octobre 2026  
> **Mise à jour du 3 octobre 2026 : implémentation locale vérifiée pour les parcours consignés ci-dessous; publication GitHub et production encore à effectuer.**

Cette matrice conserve les **49 exigences** et les **10 hypothèses** numérotées du cahier initial. Elle ajoute **8 précisions client** et **10 exigences de checkpoint**. Les IDs de l'analyse détaillée ne sont pas utilisés comme alias : certains désignent d'autres besoins. Le [registre des sources](09-sources-et-decisions.md) explique cette règle.

Le [PDF fourni le 2 octobre](../sources/cahier-des-charges-2026-10-02.pdf) précise les priorités finales : partie rapide, revanche, bots variables et deux mécanismes de rattrapage sont essentiels. La heatmap de course reste obligatoire; la heatmap globale est souhaitable. Les réponses CLIENT-* et la grille CP1 continuent de s'appliquer. HYP-01 garde son sens historique; **PDF-HYP-01**, accès invité aux trois salles, est distingué dans le [plan des pages](15-plan-des-pages.md).

## Comment lire la matrice

| Valeur | Sens |
|---|---|
| **CP1** | Résultat nécessaire dès le premier checkpoint |
| **CP1 partiel → final** | Une fondation est démontrée à CP1; la couverture complète est requise ensuite |
| **Final** | Besoin du produit final, absent du minimum explicitement décrit par la grille de CP1 |
| **À arbitrer** | Ambiguïté conservée; une proposition ne remplace pas la validation |
| **Cadré** | Besoin documenté; aucun comportement applicatif vérifié |
| **Proposé** | Choix de conception ou valeur encore à confirmer |
| **Confirmé par source** | Réponse client lisible dans une capture; ne signifie pas « implémenté » |

Les tableaux de cadrage et leurs méthodes prévues restent historiques. Le **registre de réalisation** en fin de document donne maintenant les liens de code et les preuves locales obtenues. Une fonctionnalité présente dans le code ne signifie pas que toute sa méthode de validation, les essais humains ou sa production ont été réalisés. Le [rapport applicatif](20-verification-implementation.md) distingue ces niveaux.

## Exigences produit

### Comptes et permissions

| ID | Besoin traçable | Portée | État du cadrage | Méthode de validation prévue |
|---|---|---|---|---|
| AUTH-01 | Discord, GitHub, local et invité | CP1 partiel → final | Cadré; couverture exacte CP1 à préciser | Parcours réussi pour chaque méthode; sessions isolées; fournisseur indisponible traité. À CP1, démontrer au moins une vraie authentification. |
| AUTH-02 | Fournisseurs mis en évidence | CP1 interface → final | Cadré | Revue des écrans FR/EN et clavier : Discord/GitHub visibles; local accessible comme choix secondaire. |
| AUTH-03 | Local sans courriel ni récupération | Final; CP1 si local retenu | Cadré | Créer un compte, se reconnecter, refuser un mauvais mot de passe; contrôle du hachage et des contraintes; aucune promesse de récupération. |
| AUTH-04 | Invité pseudonyme/session, participation seule | CP1 salon → final | Cadré + CLIENT-02 | Rejoindre avec un pseudonyme; consulter ses résultats de session; tenter de créer via interface et API et constater le refus. |
| ROLE-01 | Comptes enseignants/étudiants créateurs | CP1 | Confirmé par CLIENT-01 | Deux comptes sans rôle scolaire créent chacun une salle; permissions limitées à leur rôle dans la salle. |
| ROLE-02 | Hôte désigne participant/spectateur et exclut | Final; contrôle des droits CP1 | Cadré | Hôte modifie un rôle/exclut; autre membre ne peut pas le faire par requête directe; effet visible dans toutes les sessions. |

### Salle et accès

| ID | Besoin traçable | Portée | État du cadrage | Méthode de validation prévue |
|---|---|---|---|---|
| ROOM-01 | Public, semi-public code, privé lien unique | CP1 code → final trois modes | Cadré + CLIENT-03/04 | Public listé; semi-public absent de la liste et accessible par code; privé absent de la liste et sans accès par code; invitation consommable une seule fois. |
| ROOM-02 | Rejoindre rapidement une course en attente | Final essentiel | Cadré; priorité précisée par PDF | Action principale rejoint uniquement une salle publique admissible; affiche une réponse utile si aucune salle n'est disponible. |
| ROOM-03 | Repli par création si aucune salle publique | Final essentiel | À arbitrer pour invités | Compte autorisé obtient une salle; concurrence de deux requêtes traitée; invité ne peut pas contourner CLIENT-02. |
| ROOM-04 | Membres/réglages propagés, modification par hôte | CP1 | Cadré | Deux sessions sur la production : arrivée, départ, réglage visibles sans rechargement; modification interdite au non-hôte côté serveur. |
| ROOM-05 | Arrivée tardive spectatrice | Final | Cadré | Nouveau membre pendant une course reçoit le rôle spectateur; participant reconnu après reconnexion reprend sa course; prochaine course rend le nouveau membre admissible. |
| ROOM-06 | Reprise identité/progression après interruption | Final; politique CP1 | Cadré; délai proposé à définir | Couper/restaurer le réseau avant et après la fenêtre retenue; progression cohérente; identité non récupérable par un autre membre; hôte couvert. |
| ROOM-07 | Abandon et inactivité sans blocage de fin | Final | Cadré; délais à choisir | Abandon explicite et participant inactif dans une course sans minuterie; course se termine selon une politique finie et visible. |
| ROOM-08 | Classe d'environ 30 personnes | Final | Cadré; capacité non mesurée | Test à 30 connexions sur environnement nommé; latence, pertes/reprises et durée consignées; visualisation relue avec 30 entrées. |
| ROOM-09 | Revanche ou fermeture après résultats | Final essentiel | Cadré; priorité précisée par PDF | Revanche réutilise la salle et réinitialise la course; fermeture informe les membres et refuse les nouvelles entrées. |

### Configuration

| ID | Besoin traçable | Portée | État du cadrage | Méthode de validation prévue |
|---|---|---|---|---|
| CONF-01 | Texte cohérent, suite de mots, personnalisé | Final | Cadré | Créer une course dans chaque mode; participants reçoivent le même contenu; texte invalide refusé avec message clair. |
| CONF-02 | Variation par règles/corpus, sans IA intégrée | Final | Cadré | Générations avec graine et règles connues; inspection des sources/corpus et de l'absence de dépendance IA pour ce parcours. |
| CONF-03 | Langue d'interface indépendante du contenu | CP1 interface → final | Cadré | Passer FR↔EN sans changer le texte de course; choix du contenu dans une langue distincte visible aux membres. |
| CONF-04 | Thèmes et catégories de caractères | Final | Cadré | Jeux de contenus couvrant accents, ponctuation, chiffres et caractères spéciaux; règles de génération vérifiées. |
| CONF-05 | Longueur et interdiction de caractères | Final | Cadré; bornes à fixer | Cas limites de longueur; génération excluant les caractères interdits; combinaison de contraintes impossible signalée. |
| CONF-06 | Minuterie facultative; objectif de vitesse en enrichissement | Final essentiel pour minuterie; objectif souhaitable | Cadré; distinction précisée par PDF | Courses avec/sans limite; expiration serveur. Si ajouté, objectif visible et indépendant de la politique de fin tant que non décidé autrement. |
| CONF-07 | Erreurs bloquantes ou non bloquantes | Final | Cadré | Même erreur dans les deux modes : blocage/correction d'un côté, progression et comptabilisation de l'autre. |
| CONF-08 | Pénalité anti-frappe aléatoire | Final | À arbitrer : formule | Comparer frappe correcte lente, frappe rapide aléatoire et frappe rapide précise; règle identique appliquée au classement et expliquée aux joueurs. |
| CONF-09 | Fin tous actifs terminés ou expiration | Final | Cadré; inactivité/délai à préciser | Tous finis, temps expiré, abandons, interruptions et AFK; un seul événement final; résultats stables malgré concurrence. |
| CONF-10 | Collage interdit | Final | Cadré | Coller par raccourci/menu dans la zone de course; saisie normale et technologies d'assistance contrôlées; limites de protection documentées. |

### Temps réel

| ID | Besoin traçable | Portée | État du cadrage | Méthode de validation prévue |
|---|---|---|---|---|
| RACE-01 | Départ simultané, règles figées | Final | Cadré | Sessions avec latences différentes utilisent le départ serveur; modification après départ refusée; contenu identique. |
| RACE-02 | Progression et positions en direct | Final | Cadré | Progrès et dépassement apparaissent dans les autres sessions; reconvergence après retard/perte d'un message; ordre autoritaire. |
| RACE-03 | Temps, frappe, erreurs, corrections, connexion | Final | Cadré | Séquence de frappes connue donne les compteurs attendus; correction, reconnexion et fin n'ajoutent pas de données en double. |
| RACE-04 | Lisibilité avec environ 30 participants | Final | Cadré | Revue UX de la course remplie à 30 sur large/petit écran; le texte et la position personnelle restent lisibles. |
| RACE-05 | Sons et effets désactivables | Final; base accessible CP1 | Cadré | Son coupé, mouvement réduit et obstruction désactivée; ces préférences persistent selon la portée retenue et sont respectées pendant les événements. |

### Bots et arcade

| ID | Besoin traçable | Portée | État du cadrage | Méthode de validation prévue |
|---|---|---|---|---|
| BOT-01 | Pratique solo et collective avec bots | Final essentiel | Cadré; HYP-03 à confirmer | Un humain plus bot peut pratiquer; ajout à une salle multi-humaine; bots ne créent pas de compte humain ni de droits d'hôte par défaut. |
| BOT-02 | Niveaux et comportement variable plausible | Final essentiel | Cadré; priorité précisée par PDF | Plusieurs graines/courses produisent distribution de vitesses et erreurs autour du niveau; pas de résultat invariant; niveau spécial explicitement nommé. |
| BONUS-01 | Au moins deux mécanismes de rattrapage | Final essentiel | Priorité clarifiée par PDF; effets à choisir | Deux mécanismes identifiables et jouables démontrés; règle, déclenchement, effets et options d'accessibilité documentés. L'ancienne contradiction de priorité reste au registre des sources. |
| BONUS-02 | Aide au retard sans victoire garantie | Final | Cadré + CLIENT-07 | Simulations et essais humains avec écarts de niveau; mécanismes offrent un rattrapage observable sans inverser systématiquement les résultats. |
| BONUS-03 | Attribution documentée et testable | Final | Cadré; personnages proposés | Tests reproductibles de déclenchement/énergie; joueur comprend la règle; options d'accessibilité respectées; performances brutes conservées séparément du jeu. |

### Statistiques et progression

| ID | Besoin traçable | Portée | État du cadrage | Méthode de validation prévue |
|---|---|---|---|---|
| STAT-01 | Podium et classement vitesse/précision | Final | Formule à arbitrer | Jeux de résultats connus, égalités et moins de trois participants; même règle pendant la course et au podium. |
| STAT-02 | Statistiques de course et personnelles | Final | Visibilité à arbitrer | Compteurs d'une course connue; membre voit les données autorisées et aucun historique tiers non autorisé; séparation métriques arcade/frappe. |
| STAT-03 | Heatmap de course | Final | Cadré | Erreurs ciblées sur des touches donnent les valeurs attendues; légende et alternative textuelle compréhensibles en clair/sombre. |
| STAT-04 | Historique, moyennes, victoires et nombre de courses permanents | Final essentiel | Cadré; rétention à fixer | Se reconnecter retrouve ses courses; moyennes, classements, victoires et nombre de courses concordent; suppression et contrôle d'accès testés selon politique retenue. |
| STAT-05 | Résultats successifs de session invité | Final | Durée à arbitrer | Plusieurs courses d'une session visibles; fin de session applique la politique; invité n'accède pas aux données d'un autre. |
| STAT-06 | Amélioration visible dans le temps | Final | Forme proposée à définir | Jeu de sessions montrant une amélioration réelle et un plateau; progression compréhensible, sans récompenses fictives ni confusion entre vitesse et précision. |

**Enrichissement souhaitable sans nouvel ID obligatoire : heatmap globale.** Le PDF p. 5 distingue cette carte cumulative de STAT-03, heatmap obligatoire après chaque course. Si réalisée, vérifier période et modes retenus, calculs par touche, légende, alternative tabulaire et permissions personnelles. La progression minimale de STAT-06 demeure essentielle; sa forme détaillée est souhaitable. Voir PG-10/14 dans le [plan des pages](15-plan-des-pages.md).

### Expérience et technique

| ID | Besoin traçable | Portée | État du cadrage | Méthode de validation prévue |
|---|---|---|---|---|
| UX-01 | DA originale et adaptée 12–17 ans | CP1 partiel → final | Proposition à valider | Revue du dossier et de chaque écran; essais avec public visé; personnalité, concentration et lisibilité cohérentes. |
| UX-02 | FR/EN, clair/sombre, adaptatif | CP1 écrans livrés → final | Cadré; tactile à arbitrer | Parcours de CP1 puis final dans les quatre combinaisons langue/thème; largeurs ordinateur/tablette/téléphone; clavier et absence de débordement. |
| UX-03 | Nom/logo de conception humaine documentée | CP1 → final | Contribution humaine à réaliser/documenter | Journal des pistes et modifications; auteur et rôle des outils explicites; validation réelle du nom/logo; aucun résultat assisté déclaré humain sans preuve. |
| TECH-01 | React, Next, TS, Tailwind, PostgreSQL | CP1 | Cadré | Dépendances/verrouillage, modules TypeScript et typage contrôlés; styles Tailwind; migration et requête PostgreSQL fonctionnelles. |
| TECH-02 | HTTPS et choix temps réel justifié | CP1 salon → final course | ADR proposé; fonctionnement non vérifié | URL HTTPS; transport sécurisé; contrôle du salon à deux sessions; limites mesurées documentées en final. |
| TECH-03 | Gratuité ou coûts/limites approuvés | CP1 puis exploitation | Fournisseur à choisir/vérifier | Offre datée et limites consignées; si payant, approbation explicite avant engagement. Aucun abonnement supposé actif. |
| TECH-04 | GitHub public, sans secrets, documentation | CP1 puis final | Documentation préparée | Clonage et installation neufs; secrets absents des fichiers/historique publiés; README et procédures concordent avec le commit livré. |
| TECH-05 | Tests unitaires et E2E automatiques | CP1 base → final | Plan de contrôles préparé | Exécution GitHub Actions consultable; tests de permissions et parcours à deux sessions; échec bloque ou signale selon politique CI retenue. |

## Précisions client

| ID | Réponse source | Portée | État du cadrage | Méthode de validation prévue |
|---|---|---|---|---|
| CLIENT-01 | Pas de rôle scolaire; tous les comptes créent | CP1 → final | Confirmé par image 1 | Modèle et permissions n'imposent pas de type enseignant/étudiant; rôle d'hôte lié à la salle. |
| CLIENT-02 | Invité participe, ne crée pas | CP1 → final | Confirmé par image 1 | Requêtes de création sans compte refusées; entrée valide par code autorisée avec pseudonyme. |
| CLIENT-03 | Semi-public par code, QR optionnel | CP1 code; QR facultatif | Confirmé par image 3 | Code partagé permet l'entrée; format documenté; présence éventuelle d'un QR ne change pas les permissions. |
| CLIENT-04 | Privé accessible seulement par lien | Final | Confirmé par image 3 | Code et liste publique ne donnent pas accès au privé; lien unique contrôlé côté serveur; consommation concurrente testée. |
| CLIENT-05 | Hôte revient après courte interruption | Final; politique CP1 | Confirmé par image 1 | Court incident réseau ne transfère pas prématurément le rôle; identité et état rétablis pendant la fenêtre retenue. |
| CLIENT-06 | Successeur choisi, sinon participant le plus ancien | Final | Confirmé; éligibilité à préciser | Départ volontaire avec/sans choix; ancienneté et égalités déterministes; une seule attribution d'hôte; cas invité/offline/spectateur/bot explicités. |
| CLIENT-07 | Capacités de personnages acceptées si rattrapage | Final | Alternative permise, pas choix définitif | Si retenues, énergie liée à frappe correcte et aide au retard validées; pas de promesse que le talent seul détermine toujours la victoire. |
| CLIENT-08 | Durée du lien privé décidée par équipe | Final | Délégation confirmée; valeur à choisir | Expiration côté serveur testée avant/après borne; date claire; révocation et usage unique indépendants du délai. |

## Exigences du checkpoint

| ID | Résultat CP1 | Poids de grille associé | État du cadrage | Preuve d'acceptation prévue |
|---|---|---|---|---|
| CP1-01 | Application publique HTTPS | Déploiement : 20 | Cadré | Ouvrir l'URL depuis un autre navigateur/réseau; certificat et parcours fonctionnels. |
| CP1-02 | Première authentification | Déploiement : 20 | Cadré | Connexion réelle et session reconnue; une route protégée refuse les accès non autorisés. |
| CP1-03 | DA visible et démarche complète | Création : 20 | Proposition préparée | Dossier nom/logo/moodboard/palette/typos et intégration sur les écrans livrés, avec provenance honnête. |
| CP1-04 | Moteur complet exclu, salon toujours obligatoire | Salon : 10; portée | Correction de la portée initiale | Revue du jalon : absence de course complète acceptée; création/rejoindre et propagation démontrées. |
| CP1-05 | PostgreSQL en production | Déploiement : 20 | Cadré | Écriture par application et relecture indépendante après nouvelle session; migrations reproductibles. |
| CP1-06 | Création/rejoindre par code et temps réel | Salon : 10 | Exigence ajoutée depuis grille | Deux sessions de production partagent membres et réglages sans rechargement; droits côté serveur contrôlés. |
| CP1-07 | Données, états et ADR cohérents | Architecture : 20 | Documents préparés | Revue croisée documents/code : mêmes états, entités, événements et autorité. |
| CP1-08 | CI exécutée | Qualité : 10 | Cadré | Lien vers un run réussi sur le commit livré, avec commandes adaptées et échec visible. |
| CP1-09 | Langue, thème, qualité et traçabilité | Qualité : 10 | Couverture proposée | Écrans CP1 FR/EN clair/sombre; contrôles initiaux; matrice actualisée avec preuves réelles. |
| CP1-10 | Cahier Markdown et liens de remise | Cahier : 20; remise | Documents préparés; liens manquants | Relecture du cahier, installation/lecture depuis dépôt; fichier avec vraies URLs GitHub/site. |

Les poids sont associés à des **critères**, pas additionnés à chaque ligne. Ils restent au total **20 + 20 + 20 + 20 + 10 + 10 = 100**.

## Hypothèses conservées

| ID | Hypothèse du cahier initial | État de décision | Validation ou action nécessaire |
|---|---|---|---|
| HYP-01 | Transcription prioritaire sur notes | Méthode conservée avec réponses écrites plus récentes | Signaler les divergences; ne pas prétendre avoir relu les sources brutes uniquement mentionnées par l'analyse. |
| HYP-02 | Hôte, sans autorité scolaire permanente | Confirmée par CLIENT-01 | Vérifier modèle et permissions. |
| HYP-03 | Minimum deux concurrents dont un humain | À valider | Décider si un bot suffit comme second; tester solo/pratique. |
| HYP-04 | Cible 30 personnes, extension mesurée | Cible de cadrage, non mesurée | Test de charge et limites publiées. |
| HYP-05 | Invités conservés seulement en session | À préciser | Définir stockage, expiration et suppression; vérifier avec plusieurs onglets/reconnexions. |
| HYP-06 | Règles immuables au départ | Proposition cohérente avec RACE-01 | Refus serveur de modification après départ. |
| HYP-07 | Arcade séparé de l'entraînement sans bonus | À valider | Confirmer les modes et la comparaison des statistiques. |
| HYP-08 | Corpus libres/autorisés, texte hôte | À documenter | Sources/licences du corpus connues avant intégration; politique du personnalisé. |
| HYP-09 | Tactile au minimum spectateur | À décider pour participation | Essai ergonomique; annoncer clairement les modes supportés. |
| HYP-10 | Effets désactivables | Conservée comme exigence | Contrôle des préférences et alternatives lisibles. |

## Registre de réalisation · 3 octobre 2026

Environnement : application compilée locale `http://127.0.0.1:3000`, service Socket.IO `:3001`, PostgreSQL 18 dédié sur `:55432`. Les fichiers sont dans un **arbre Git local non commité**, sans URL GitHub ou HTTPS publique. Les contrôles automatisés et la recette visuelle sont détaillés dans le [rapport 20](20-verification-implementation.md). Les sources ci-dessous permettent d'examiner la réalisation; elles ne valent pas certificat de conformité complet.

| Exigence(s) | Code ou document | Preuve / couverture locale | Limite restante |
|---|---|---|---|
| AUTH-01, AUTH-02 | [Authentification](../lib/server/auth.ts), [OAuth](../lib/server/oauth.ts), [écrans](../components/entry-pages.tsx) | Compte local et invité vérifiés en HTTP/Socket.IO; écran de connexion parcouru. Fournisseurs affichés avec indisponibilité explicite. | GitHub/Discord à configurer et tester avec leurs vrais retours. |
| AUTH-03, AUTH-04 | [Authentification](../lib/server/auth.ts), [tests PostgreSQL](../tests/backend.database.test.ts) | Hachage, session, révocation et refus de création invité contrôlés. | Pas de récupération de mot de passe; conservation invité à préciser pour exploitation. |
| ROLE-01, ROLE-02 | [Commandes serveur](../lib/server/rooms.ts), [gestion du salon](../components/room-page.tsx) | Aucun rôle scolaire permanent; droits d'hôte et refus du non-hôte testés. Gestion des rôles/exclusion implémentée. | Recette humaine de tous les cas de gestion à compléter. |
| ROOM-01 | [Admission serveur](../lib/server/rooms.ts), [tests d'intégration](../tests/integration.test.ts) | Code réel, public/privé filtrés, invitation individuelle consommée une seule fois; concurrence testée en PostgreSQL. | Recette des trois modes sur HTTPS. QR facultatif non ajouté. |
| ROOM-02, ROOM-03 | [Courses](../components/course-pages.tsx), [commande quick](../lib/server/rooms.ts) | Rejoint une salle publique admissible ou crée pour un compte; invité ne crée pas. | Parcours de partie rapide et concurrence à exercer en production. |
| ROOM-04 | [Temps réel](../server/index.ts), [intégration](../tests/integration.test.ts) | Deux sessions indépendantes partagent arrivées, prêt et règles avec contrôle serveur. | Latence en ligne à mesurer. |
| ROOM-05, ROOM-06, ROOM-07 | [Cycle des salles](../lib/server/rooms.ts), [tests PostgreSQL](../tests/backend.database.test.ts), [moteur](../lib/domain/engine.ts) | Reprise et transfert après grâce testés; arrivée tardive spectatrice, abandon et AFK implémentés/testés dans le domaine. | Coupure réseau réelle et toutes les transitions UI à exercer en ligne. |
| ROOM-08, RACE-04 | [Limite et projections](../lib/server/rooms.ts), [vue course](../components/room-page.tsx) | Limite de 30 configurée; interface responsive examinée. | **Aucun test de charge ni revue à 30 personnes réalisé.** |
| ROOM-09 | [Revanche et fermeture](../lib/server/rooms.ts), [résultats salon](../components/room-page.tsx) | Commandes et interface implémentées, règles de cycle testées. | Recette multi-utilisateur de revanche/fermeture à compléter. |
| CONF-01, CONF-02, CONF-04, CONF-05 | [Génération](../lib/domain/text.ts), [validation](../lib/domain/settings.ts), [tests](../tests/domain.test.ts) | Corpus local original, graine, contraintes, langues, modes, caractères exclus et bornes contrôlés; prévisualisation réelle parcourue. | Élargissement et revue éditoriale du corpus. |
| CONF-03, UX-02 | [Préférences](../lib/client/preferences.ts), [interface](../components/providers.tsx) | FR/EN indépendants du texte, clair/sombre et largeurs 320–1440 examinés. | Recette tactile sur appareils réels. |
| CONF-06, CONF-09 | [Moteur et minuterie](../lib/domain/engine.ts), [serveur](../lib/server/rooms.ts) | Expiration et fin déterminées côté serveur; course persistée vérifiée. Minuterie facultative et objectif MPM implémentés. | Cas sans minuterie et inactivité prolongée à exercer visuellement. |
| CONF-07, CONF-08, RACE-03 | [Moteur](../lib/domain/engine.ts), [tests](../tests/domain.test.ts), [frappe client](../lib/client/typing-engine.ts) | Correction bloquante/libre, Unicode, compteurs et score MPM × précision² vérifiés. | Formule proposée à confirmer par essais humains. |
| CONF-10 | [Zone de frappe](../components/typing-zone.tsx), [limites](18-implementation.md) | Collage/raccourci/drop refusés dans l'interface; taille/séquence contrôlées au serveur. | Le navigateur ne prouve pas qu'une frappe vient d'un humain; assistance et contournements restent des limites explicites. |
| RACE-01, RACE-02 | [Transport](../lib/client/realtime.ts), [service](../server/index.ts), [intégration](../tests/integration.test.ts) | Départ commun, saisie, progression autoritaire et résultat testés à deux sessions. | Latences variées, pertes réseau et charge à mesurer. |
| RACE-05 | [Préférences](../lib/client/preferences.ts), [styles](../app/globals.css) | Son/mouvement réglables, persistance locale et réduction de mouvement implémentés. | Revue humaine des effets arcade avec chaque préférence. |
| BOT-01, BOT-02 | [Bots](../lib/domain/bots.ts), [tests](../tests/domain.test.ts), [entraînement](../components/practice-page.tsx) | Variations et erreurs reproductibles testées; un bot dans une vraie salle observé. Échauffement local distinct des résultats en compte. | Plausibilité avec joueurs et plusieurs niveaux à évaluer. |
| BONUS-01, BONUS-02, BONUS-03 | [Capacités](../lib/domain/engine.ts), [architecture](18-implementation.md), [tests](../tests/domain.test.ts) | Accélération/bouclier, énergie, déficit et plafond de 6 points testés; métriques brutes conservées. | Équilibrage et rattrapage avec public réel non validés. |
| STAT-01, STAT-02, STAT-03 | [Résultats](../components/results.tsx), [API personnelle](../app/api/results/[id]/route.ts), [moteur](../lib/domain/engine.ts) | Classement, métriques et heatmap calculés; résultat en base et restriction à son acteur testés. | Revue des égalités et accessibilité de la heatmap en ligne. |
| STAT-04, STAT-05, STAT-06 | [Profil/historique](../components/profile-pages.tsx), [API](../app/api/profile/route.ts) | Historique et agrégats PostgreSQL réels; aucun score d'exemple ajouté. | Rétention/suppression à définir; amélioration dans le temps à tester avec plusieurs vraies sessions. |
| UX-01, UX-03 | [Direction artistique](03-direction-artistique.md), [pages](16-design-pages-et-etats.md) | Base artistique intégrée; contrastes ciblés et responsive contrôlés. | Essais 12–17 ans et contribution humaine au nom/logo encore requis. |
| TECH-01 | [Dépendances](../package.json), [schema](../db/schema.ts), [ADR structure](adr/0002-structure-app-router.md) | Versions verrouillées, typage/lint, builds, migrations et PostgreSQL réel vérifiés. | Reproduction sur machine vierge/conteneurs à vérifier. |
| TECH-02, TECH-03 | [ADR temps réel](adr/0001-temps-reel.md), [guide](19-deploiement.md) | Choix des deux processus et limites documentés; fonctionnement local vérifié. | **Hébergeur, coût approuvé, HTTPS et WSS non établis.** |
| TECH-04, TECH-05 | [README](../README.md), [CI](../.github/workflows/ci.yml), [tests navigateur](../e2e/parcours.spec.ts) | Dépôt local, documentation, contrôles locaux et CI/E2E préparés. Fichiers d'environnement ignorés. | **Publication, clonage GitHub et exécution CI/E2E distante à faire.** |

### Précisions client et checkpoint

Les CLIENT-01/02/03/04/05/06 sont reliés aux lignes ROLE/ROOM ci-dessus. CLIENT-07 correspond à l'implémentation arcade proposée et conserve sa validation humaine à faire. CLIENT-08 utilise une durée proposée de **24 h**, contrôlée serveur, indépendante de l'usage unique; voir [architecture](18-implementation.md).

| Critère | Preuve présente | Ce qui reste à démontrer |
|---|---|---|
| CP1-01, CP1-05 | Application et base réelles localement | HTTPS et PostgreSQL durable sur la production. |
| CP1-02, CP1-06 | Authentification locale et salle/code/temps réel à deux sessions testés | Mêmes parcours sur URL publique. |
| CP1-03 | DA, moodboard, palette, typographies et interface | Choix final et provenance humaine du nom/logo. |
| CP1-04 | Salon et moteur de course implémentés | Recette de première livraison selon périmètre de CP1. |
| CP1-07 | Modèle, états et ADR mis en accord avec le code dans le document 18 | Revue sur le commit publié. |
| CP1-08 | Workflow et contrôles locaux | Lien vers une exécution GitHub Actions verte. |
| CP1-09 | FR/EN, thèmes, tests et ce registre | Validation sur production et matériels ciblés. |
| CP1-10 | Cahier et documents Markdown intégrés | Deux vraies URLs GitHub/site à remettre. |

Les hypothèses de cadrage restent identifiées plus haut; leur présence ne vaut pas décision client. Les valeurs techniques retenues sont exposées comme choix d'implémentation dans le document 18.
