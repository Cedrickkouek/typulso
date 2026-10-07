# Vérification des pages et des parcours

> **Portée :** je conserve ici mes recherches, propositions ou observations à leur date. Ces éléments expliquent ma démarche de conception; une maquette ou un test prévu ne constitue pas une preuve de fonctionnement en production.

> **2 octobre 2026 · America/Toronto · aperçu local v0.5**  
> Périmètre : pages, états, contenus, interactions locales et styles de la maquette.  
> Source des résultats ci-dessous : contrôles effectués dans cette session avec le navigateur CUA, lecture du DOM et couleurs calculées.


**La maquette couvre 20 écrans et 74 combinaisons page/état, avec 32 libellés d’état.** Les 74 combinaisons comprennent les 20 situations normales et 54 variantes supplémentaires. Ces nombres décrivent l’inventaire et les contrôles de design, pas des routes Next.js réalisées ni des tests du moteur serveur.

Les mesures finales des 20 situations normales ne relèvent aucun groupe de texte sous la cible de **7:1** : minimum **7,31:1 en clair** et **7,92:1 en sombre**. Les limites de cette mesure sont précisées ci-dessous; ce rapport ne déclare pas une conformité globale du produit.

## 1. Ce qui a été vérifié

| Objet | Contrôle effectué | Résultat observé |
|---|---|---|
| Inventaire | Pages et variantes de la maquette comparées au plan | 20 écrans, 74 combinaisons dont 54 variantes supplémentaires; 32 libellés d’état |
| Petit écran clair | Parcours des 20 situations normales à **390 px CSS** | Aucun débordement horizontal général relevé; un seul `h1` par écran; aucune erreur JavaScript remontée pendant ces contrôles |
| Petit écran sombre | Parcours des **74 combinaisons** à **390 px CSS** | Aucun débordement horizontal général relevé; un seul `h1` par écran; aucune erreur JavaScript remontée pendant ces contrôles |
| Spectateur | Lecture des états et des contrôles de course | Aucun champ compétitif de frappe dans la vue spectateur |
| Participant arrêté | États terminé, temps expiré et inactivité | Aucun champ actif de frappe dans ces états |
| Palette | Couleurs v0.4 appliquées aux nouvelles pages | Citron, rose et lavande conservés; textes encre sur panneaux expressifs et couleurs sémantiques adaptées aux surfaces de chaque thème |
| Contenus | Statuts, unités, règles d’accès et mentions de démonstration | Parcours locaux et données d’exemple distingués de l’application future; compte local sans récupération; privé sans code commun |
| Fichiers et versions | Organisation de l’aperçu | `preview/index.html` expose les pages v0.5; l’ancienne planche v0.4 est conservée dans atelier.html |

La vérification de largeur porte sur le document et les zones attendues. Une heatmap ou un tableau de détail peut disposer d’un défilement horizontal **interne** : cela ne doit pas entraîner toute la page au-delà du viewport.

## 2. Contraste : mesure et correction

Le contrôle lit les couleurs calculées des groupes de texte visibles du DOM et reconstitue les fonds par composition d’aplats. Le rapport sRGB utilise la luminance linéarisée et la formule `(Lclair + 0,05) / (Lsombre + 0,05)`. Un groupe contrôlé est une entrée de mesure; il ne représente ni une page entière ni une certification.

| Série | Groupes contrôlés | Résultat |
|---|---:|---|
| 20 situations normales, thème clair | **956** | Minimum **7,31:1**; aucun groupe mesuré sous 7:1 |
| Première série des 20 situations normales, thème sombre | Correction ciblée nécessaire | Badge « Classique » des résultats à **1,30:1** sur lavande; le reste de cette série avait un minimum de 7,92:1 |
| Série finale des 20 situations normales, thème sombre | **956** | Badge corrigé en texte encre; minimum **7,92:1**; aucun groupe mesuré sous 7:1 |

La correction du badge conserve la surface lavande et adapte son premier plan; elle ne change pas la direction artistique. Les nouvelles pages font aussi attention au focus dans les contextes teintés : le bleu fonctionnel des surfaces sombres ne doit pas être repris automatiquement sur une surface rose ou lavande.

**Portée exacte.** Les deux séries de 956 groupes concernent les **20 situations normales**. Les 54 variantes supplémentaires ont été parcourues en sombre pour leur structure, leurs contrôles et leurs erreurs JavaScript; elles ne sont pas présentées comme une seconde série exhaustive de contraste textuel. Les images, glyphes dessinés en SVG, effets de survol, opacités transitoires, superpositions et toutes les paires de focus/bordure ne sont pas certifiés par le seul calcul des groupes de texte.

Les seuils de conception demeurent 7:1 pour les textes fonctionnels et au moins 3:1 pour les repères essentiels. Les références officielles et les mesures des tokens sont consignées dans le rapport précédent. La validation de l’application réelle devra porter sur ses composants et tous leurs états effectifs.

## 3. Parcours réellement exécutés

Toutes les actions de cette section concernent la **maquette locale**, ses données d’exemple et ses scénarios. Une navigation réussie ne constitue pas une admission serveur, une authentification réelle ou une écriture en base de données.

### Entrée, identité et préparation

| Cas exécuté | Résultat constaté |
|---|---|
| Saisir **BAD**, puis **K7M2PX** | Le premier code affiche son erreur; le code d’exemple conduit au choix de l’identité |
| Continuer en invité **Cam**, puis se préparer | Parcours vers le salon; changement d’état prêt; focus restauré sur la commande concernée |
| Ouvrir le catalogue des pages, puis utiliser **Escape** | Dialogue fermé; focus retourné au bouton « Toutes les pages » (`map-button`) |
| Invité → création | Accès intercepté **avant** le formulaire de configuration; proposition de connexion |
| Simulation de Discord → compte → création | La maquette active une identité d’exemple et permet le parcours de création; aucun OAuth réel exécuté |

### Configuration et invitation privée

| Cas exécuté | Résultat constaté |
|---|---|
| Contraintes excluant **é** face au texte standard qui en contient | Configuration refusée avec un retour explicite |
| Texte personnalisé compatible, accès privé, durée **120 secondes** | Salon d’exemple créé avec les valeurs choisies et **sans code de salle privé** |
| Consulter ensuite la minuterie | Affichage **02:00**, cohérent avec 120 secondes |
| Invitation → connexion locale simulée avec un pseudonyme de **24 W** → retour à l’invitation → acceptation explicite | La destination invitation est conservée; la connexion seule ne remplace pas son acceptation |
| Consulter le profil du pseudonyme de 24 W à **390 px** | Aucun débordement horizontal général relevé après les adaptations des noms longs |

Le passage d’une invitation à la connexion et son retour ont été vérifiés dans le prototype. Le caractère individuel, l’usage unique, l’expiration et la reprise du même membre restent des contrats de la future application serveur; cette interaction locale ne les démontre pas.

### Frappe et changement d’apparence

| Cas exécuté | Résultat constaté |
|---|---|
| Taper **Bonjour** avec les touches réelles dans le texte personnalisé de **37 caractères** | Précision locale **100 %**, progression **19 %**; la vitesse n’est pas présentée comme une mesure réelle |
| Changer le thème puis passer l’interface en anglais | La saisie est conservée; l’exercice français demeure français |
| Activer le scénario de reconnexion après cette saisie | Champ et commande Recommencer désactivés; progression locale **19 %** conservée |
| Mode bloquant : taper **BonX** | Une faute signalée; progression bloquée à **8 %** |
| Corriger puis atteindre **Bonjour** | Progression locale **19 %** après correction |
| Tentative de collage au clavier | Collage bloqué; texte saisi inchangé |

Ces constats vérifient le retour local de saisie et les états simulés. Le scénario Reconnexion ne provoque pas une véritable panne réseau ni une reprise de connexion au serveur. Le blocage du collage observé ne prouve pas une protection complète contre la triche, ni le comportement de tous les menus de collage et claviers.

### Observation et résultats

| Cas exécuté | Résultat constaté |
|---|---|
| Regarder la salle publique **La touche surprise** | La bonne salle est ouverte, en **Arcade**, avec contenu français et sans champ compétitif de frappe |
| Résultats avec seulement deux concurrents | Podium à **deux places** et classement à **deux lignes**; aucune troisième personne inventée |
| Vérifier les tables du même état | Deux lignes de classement et cinq lignes de heatmap, soit **sept lignes de données au total** |
| Comparer les valeurs d’erreur de l’exemple final | **7 erreurs** dans les métriques et **7 erreurs / 327 frappes** dans la heatmap; précision **98 %** après arrondi |

Ces résultats sont des exemples cohérents de présentation. Ils ne proviennent pas d’une course multijoueur enregistrée; les valeurs, les concurrents et le podium sont fictifs. La règle de classement finale, le calcul de vitesse et les comparaisons de progression nécessitent encore leur implémentation de domaine.

## 4. Captures locales vérifiées

Les **six captures** ont été enregistrées dans le dossier du projet et inspectées visuellement. Elles montrent les compositions finales, avec les noms et données d’exemple. Leur présence est contrôlée; ces fichiers locaux ne constituent pas un hébergement public. Le navigateur applique un facteur de zoom : les dimensions des images ne remplacent pas les mesures du viewport CSS décrites plus haut.

| Capture | Ce qu’elle documente |
|---|---|
| Accueil clair | Promesse, entrée par code, accès rapide et personnalité v0.4 |
| Création claire | Groupes de réglages et hiérarchie du formulaire |
| Salon clair | Groupe, accès, réglages et préparation |
| Résultats sombres | Podium, résultat personnel et contrastes après correction |
| Profil clair | Historique, progression proposée et heatmap de course |
| Accueil mobile | Composition de l’entrée sur petit écran |

Une capture documente un état visible. Elle ne démontre pas à elle seule son parcours clavier, le fonctionnement de son bouton ou sa synchronisation réseau. Les contrôles exécutés sont décrits séparément dans les sections précédentes.

## 5. Limites et vérifications futures

| Objet | Statut honnête |
|---|---|
| Polices | L’aperçu utilise les polices de secours; intégration de Space Grotesk et IBM Plex Mono, licences et stabilité de métrique restent à vérifier dans l’application |
| IME et accents | Protection de la composition relue dans le code; **aucun essai réel de saisie IME revendiqué** dans cette série |
| Participation tactile | Affichage mobile testé; frappe au clavier virtuel, orientation et interactions tactiles réelles restent à essayer |
| Lecteur d’écran | Structures, noms et états prévus; parcours avec un lecteur d’écran réel encore à effectuer |
| Zoom 200 % | Test encore à effectuer; les contrôles à 390 px ne le remplacent pas |
| Public de 12–17 ans | Aucune séance avec des adolescents ni mesure de compréhension revendiquée |
| Mouvement et effets | Mode gris et mouvement réduit activés par les contrôles; classes `wireframe no-motion` observées. Le chiffre du départ utilise encre `#171C2B` sur gris `#DDD`. Préférences système et validation exhaustive des effets restent à tester |
| Authentification | Discord, GitHub et compte local sont simulés; pas de compte réel créé dans ces parcours |
| Application et données | Pas de preuve de backend Next.js, PostgreSQL connecté, persistance ou contrôle de permissions serveur |
| Temps réel | Pas de serveur multijoueur ni de test de capacité, latence, départ commun ou reconnexion réelle |
| Production et CP1 | Pas de déploiement HTTPS ou de CI prouvés par ce rapport; les preuves attendues restent celles du checkpoint |
| Conformité | Audit partiel de design et de prototype; aucune déclaration de conformité WCAG globale |

La prochaine validation portera sur le produit réellement construit : commandes serveur, quatre accès, admission privée, phases synchronisées, résultats confirmés, historique, tests de charge et usage avec le public. Les preuves devront être ajoutées au fur et à mesure, sans convertir rétrospectivement ces données de maquette en résultats de production.

## 6. Sources et continuité du dossier

Le PDF fourni est conservé en copie locale. Sa lecture textuelle et sa réconciliation avec les réponses client sont documentées dans le plan des pages et le registre des sources. Les familles PG-* ne sont pas de nouveaux IDs du client.

La spécification détaillée donne le contenu, les permissions et les états à réaliser; ce rapport consigne ce qui a effectivement été essayé dans l’aperçu. La direction v0.4 et le skill général de planification sont conservés : cette extension des pages ne revendique ni une nouvelle recherche d’inspiration ni une modification supplémentaire du skill. L’ancienne planche demeure consultable dans l’atelier v0.4.

## 7. Contrôle final du dossier

Le contrôle des **31 fichiers Markdown** relève **264 références locales**, sans destination manquante ni bloc de code non fermé. Les six captures sont présentes. La syntaxe de `pages.js` et du `prototype.js` de l’atelier est valide. Le skill général existe toujours à son emplacement installé; sa copie dans le projet est identique. Le PDF d’origine est conservé, ainsi que sa copie dans `sources/`; les rendus temporaires de lecture ont été retirés.

Le formulaire conserve aussi nom, accès privé et texte personnalisé lors d’un changement de langue et de thème; l’instruction d’accès et l’aperçu suivent les champs conservés. Ce comportement a été vérifié avec une configuration locale avant sa création d’exemple.

## 8. Ajustement de navigation · 3 octobre 2026

Le menu possède désormais un fond commun, une bordure et des coins arrondis. La destination active reste repérée par `aria-current`, un fond citron et une bordure encre. Les contrastes textuels mesurés sur les quatre liens atteignent 8,67:1 en clair, 8,59:1 en sombre et 14,76:1 pour la sélection citron. La hauteur calculée des liens est d’environ 44 px.

Contrôles ciblés : navigation contenue et absence de débordement horizontal du document à 1280 et 390 px CSS dans les deux thèmes; à 320 px, disposition corrigée sur deux colonnes puis vérifiée en français et en anglais. Le focus clavier reste visible et le panneau ne le masque pas. Ces contrôles concernent le menu du prototype, sans nouvelle validation exhaustive de toutes les pages. La capture de la navigation claire a été enregistrée puis inspectée visuellement.

### Espacement aux breakpoints · correction complémentaire

Le panneau ne s’étire plus sur toute la largeur aux tailles intermédiaires. À 1000 px CSS, sa largeur française passe de 936 à 412 px : les marges internes latérales reviennent à 6 px. L’écart entre le bas du menu et le début de l’accueil passe de 72–80 à 30 px. Cette correction s’applique à 1050 px et moins; sur petit écran, la carte de connexion par code suit normalement le contenu introductif.

Tailles parcourues en français/clair : 1280, 1051, 1050, 1000, 801, 800, 541, 540, 390, 381, 380 et 320 px CSS. Après le dernier ajustement mobile, les six tailles de 541 à 320 px ont été vérifiées de nouveau. Tailles contrôlées en anglais/sombre : 320, 390, 540, 541, 800, 801, 1000, 1050, 1051 et 1280 px CSS. Aucun débordement horizontal du document ni lien sortant du panneau; hauteur des cibles d’environ 44 px. Les captures tablette et mobile ont été inspectées. La taille de viewport temporaire a été réinitialisée après les contrôles.
