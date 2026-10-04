---
print_background: true
puppeteer:
  format: Letter
---

@import "cahier-des-charges.css"

<div class="course-masthead"><strong>Web V</strong><span>Paradigme de programmation fonctionnelle et<br>intégration back-end</span></div>

<div class="document-eyebrow">PROJET DE SESSION <span>·</span> 420-5U3-SO</div>

# Cahier des charges

<p class="document-subtitle">Plateforme de courses de frappe au clavier</p>

<div class="document-meta"><span>Version 01</span><span>22 septembre 2026</span><span>Document de cadrage</span></div>

**Intention du projet.** Transformer l’apprentissage de la frappe en une expérience de compétition conviviale, accessible et motivante pour les jeunes.

## <span class="section-number">01</span> Vision du produit

La plateforme s'adresse principalement aux jeunes de 12 à 17 ans qui souhaitent améliorer leur vitesse et leur précision au clavier, en classe, dans une activité parascolaire ou à la maison. Elle transforme la pratique de la frappe en courses amicales en temps réel. Un hôte configure une salle, les participants tapent simultanément et le classement évolue sous leurs yeux. Des statistiques et une progression durable doivent ensuite aider chaque personne à reconnaître ses forces et les touches à travailler. L'expérience doit être professionnelle, dynamique et attrayante pour les jeunes sans ressembler à un exercice scolaire traditionnel.

## <span class="section-number">02</span> Glossaire

| Terme | Définition |
|:---|:---|
| **Hôte** | Personne qui crée, configure et administre une salle. |
| **Salle** | Espace d'attente regroupant les personnes avant, pendant et après une course. |
| **Participant** | Personne ou bot qui tape le texte et peut être classé. |
| **Spectateur** | Personne qui observe la course sans pouvoir y participer. |
| **Invité** | Utilisateur sans compte permanent, identifié par un pseudonyme temporaire. |
| **Course publique** | Course visible et accessible depuis la plateforme. |
| **Course semi-publique** | Course non répertoriée accessible avec un code. |
| **Course privée** | Course accessible par des invitations individuelles à usage unique. |
| **Bonus** | Effet de rattrapage destiné surtout aux personnes en retard. |
| **Heatmap** | Clavier coloré selon la fréquence des erreurs par touche. |

<!-- pagebreak -->

## <span class="section-number">03</span> Exigences numérotées

Les exigences décrivent le produit attendu. Les idées seulement évoquées pendant la rencontre sont classées dans la priorisation.

### Comptes et permissions

- **AUTH-01** Offrir quatre accès : Discord, GitHub, compte local et mode invité.
- **AUTH-02** Mettre Discord et GitHub en évidence; conserver le compte local comme solution secondaire.
- **AUTH-03** Créer un compte local avec nom d'utilisateur et mot de passe, sans courriel ni récupération.
- **AUTH-04** Permettre à l'invité de choisir un pseudonyme et de participer sans créer de compte permanent.
- **ROLE-01** Permettre à un étudiant ou à un enseignant de créer une salle et d'en devenir l'hôte.
- **ROLE-02** Permettre à l'hôte de désigner les spectateurs et d'exclure une personne de sa salle.

### Accès et cycle de la salle

- **ROOM-01** Proposer les modes public, semi-public par code et privé par liens individuels à usage unique.
- **ROOM-02** Mettre en évidence une action qui rejoint rapidement une course publique en attente.
- **ROOM-03** Créer une salle si aucune course publique n'est prête lorsque l'action rapide est utilisée.
- **ROOM-04** Afficher en temps réel les réglages choisis par l'hôte sans permettre aux autres de les modifier.
- **ROOM-05** Transformer toute nouvelle arrivée après le départ en spectateur jusqu'à la prochaine course.
- **ROOM-06** Restaurer l'identité et la progression après une interruption temporaire du réseau.
- **ROOM-07** Permettre l'abandon volontaire et empêcher une personne inactive de bloquer la fin.
- **ROOM-08** Soutenir au minimum une classe d'environ 30 personnes et documenter la limite testée.
- **ROOM-09** Permettre à l'hôte de lancer une revanche ou de fermer la salle après les résultats.

### Configuration de la course

- **CONF-01** Choisir un texte cohérent, une suite de mots ou un texte personnalisé.
- **CONF-02** Générer des contenus variables selon des règles et des banques de mots, sans IA intégrée.
- **CONF-03** Choisir séparément la langue de l'interface et celle du contenu de la course.
- **CONF-04** Cibler des thèmes, accents, signes de ponctuation, chiffres ou caractères spéciaux.
- **CONF-05** Définir la longueur du texte et interdire certains caractères.
- **CONF-06** Configurer une limite de temps facultative et, si désiré, un objectif de vitesse.
- **CONF-07** Choisir si une erreur bloque la frappe ou si elle est comptabilisée sans arrêter le participant.
- **CONF-08** Appliquer en mode non bloquant une pénalité qui empêche de gagner en tapant au hasard.
- **CONF-09** Terminer lorsque tous les participants actifs ont fini ou lorsque le temps expire.
- **CONF-10** Bloquer le collage dans la zone de frappe.

<!-- pagebreak -->

### Course en temps réel

- **RACE-01** Démarrer simultanément pour tous les participants et figer les règles au départ.
- **RACE-02** Afficher en direct la progression, la position et les dépassements importants.
- **RACE-03** Enregistrer le temps, les frappes correctes, les erreurs, les corrections et l'état de connexion.
- **RACE-04** Garder la visualisation lisible avec environ 30 participants.
- **RACE-05** Rendre les sons et les effets visuels désactivables.

### Bots et bonus

- **BOT-01** Permettre une pratique individuelle ou collective avec des bots.
- **BOT-02** Offrir plusieurs niveaux et faire varier la vitesse et les erreurs de façon plausible.
- **BONUS-01** Inclure au moins deux bonus de rattrapage dans le mode arcade final.
- **BONUS-02** Favoriser surtout les personnes en retard sans garantir leur victoire.
- **BONUS-03** Documenter et tester la règle d'attribution des bonus.

### Résultats et progression

- **STAT-01** Afficher un podium et un classement fondé sur une règle commune de vitesse et de précision.
- **STAT-02** Présenter les statistiques publiques de la course et les statistiques personnelles de chaque participant.
- **STAT-03** Afficher une heatmap des erreurs par touche après la course.
- **STAT-04** Conserver pour les comptes l'historique, les moyennes, les victoires et la heatmap globale.
- **STAT-05** Conserver les statistiques d'un invité pendant sa session active.
- **STAT-06** Rendre l'amélioration visible dans le temps au moyen d'un système de progression.

### Expérience et contraintes techniques

- **UX-01** Offrir une direction artistique originale, professionnelle et adaptée aux 12 à 17 ans.
- **UX-02** Fournir les interfaces française et anglaise, les modes clair et sombre et une mise en page adaptative.
- **UX-03** Concevoir humainement le nom et le logo et documenter la démarche de création.
- **TECH-01** Utiliser React, Next.js, TypeScript, Tailwind CSS et PostgreSQL.
- **TECH-02** Déployer en HTTPS avec une solution temps réel justifiée, par exemple WebSocket ou MQTT.
- **TECH-03** Garder les services externes gratuits ou faire approuver leurs coûts et limites.
- **TECH-04** Publier le code sur GitHub sans secrets et documenter l'installation, l'architecture et le déploiement.
- **TECH-05** Exécuter automatiquement les tests unitaires et de bout en bout lors des changements.

<!-- pagebreak -->

## <span class="section-number">04</span> Contradictions et zones floues

1. Le client demande un nombre illimité de joueurs, mais une capacité doit être mesurée. La cible certaine est une classe d'environ 30 personnes.
2. L'invité est décrit comme temporaire, mais le client aimerait parfois retrouver ses statistiques le lendemain. Cette conservation exigerait un identifiant persistant.
3. Les notes parlent d'un code QR pour les courses semi-publiques; l'enregistrement confirme surtout un code partageable.
4. Une course exige deux personnes, tandis que la pratique individuelle est obligatoire. Il faut décider si un bot compte comme second concurrent.
5. La fin peut dépendre de tous les participants, d'une limite de temps, d'un délai après le premier arrivé ou de l'inactivité. Une règle unique manque.
6. Le gagnant est tour à tour décrit comme le premier arrivé, le plus précis ou le meilleur score. La formule de classement doit être fixée.
7. Les bonus modifient la longueur du texte de certains participants, ce qui rend la comparaison des temps bruts moins équitable.
8. Le site doit fonctionner sur tablette et téléphone, mais la participation au clavier virtuel n'est pas décidée.
9. Les extraits de livres ou de films peuvent être protégés par le droit d'auteur. La source des textes doit être définie.
10. Le compte local sans courriel ni récupération simplifie le projet, mais augmente les comptes perdus et les risques d'usurpation.

## <span class="section-number">05</span> Questions au client

1. Un invité peut-il créer une salle ou cette action exige-t-elle un compte?
2. Faut-il des rôles permanents d'enseignant et d'étudiant, ou seulement le rôle temporaire d'hôte?
3. Le mode semi-public doit-il proposer un code, un code QR ou les deux?
4. Combien de connexions simultanées devons-nous garantir et tester?
5. Quelle formule détermine le podium lorsque les erreurs ne bloquent pas la frappe?
6. Quel délai termine une course après l'arrivée du premier joueur ou après une période d'inactivité?
7. Combien de temps un participant déconnecté peut-il reprendre sa place?
8. Combien de temps faut-il conserver les statistiques et l'identité d'un invité?
9. Qui peut consulter les statistiques permanentes d'un mineur?
10. Les quatre modes d'accès doivent-ils fonctionner dès le premier checkpoint?
11. Les bonus sont-ils obligatoires dans la version finale minimale?
12. La participation sur écran tactile doit-elle être permise ou limitée au mode spectateur?

<!-- pagebreak -->

## <span class="section-number">06</span> Hypothèses

- **HYP-01** La transcription prévaut sur les notes lorsqu'elles se contredisent, car elle conserve davantage le contexte de la rencontre.
- **HYP-02** Les commandes appartiennent à l'hôte plutôt qu'au professeur, puisque les étudiants peuvent aussi créer une salle.
- **HYP-03** Une course comprend au moins deux concurrents, dont un humain; un bot peut être le second.
- **HYP-04** La version minimale garantit 30 personnes. Toute capacité supérieure sera testée et documentée.
- **HYP-05** Les données d'un invité persistent seulement dans sa session de navigateur.
- **HYP-06** La configuration devient immuable au départ afin que tous participent selon les mêmes règles.
- **HYP-07** Les bonus appartiennent à un mode arcade. Un mode entraînement sans bonus mesure la progression de manière comparable.
- **HYP-08** Les textes intégrés proviennent de sources libres ou autorisées; le texte personnalisé relève de l'hôte.
- **HYP-09** Les appareils tactiles permettent au minimum de consulter le site et d'être spectateur.
- **HYP-10** Les sons, animations fortes et obstructions visuelles peuvent être désactivés.

## <span class="section-number">07</span> Priorisation

| Niveau | Portée |
|:---|:---|
| **Essentiel** | Comptes et invités; trois modes d'accès; salon et course en temps réel; reconnexion; règles de frappe; classement; résultats et heatmap; bots de base; bilinguisme; interface adaptative; pile technique imposée; HTTPS; tests et documentation. |
| **Souhaitable** | Partie rapide; liaison de plusieurs fournisseurs; progression détaillée; revanche; au moins deux bonus; bots plus humains; sons; détection de comportements anormaux; participation complète sur tablette. |
| **Moins prioritaire** | Équipes; import de fichiers; saisie de code; difficulté automatique; statistiques invitées entre plusieurs jours; dictionnaire externe; nombreux bonus; personnalisation cosmétique avancée. |

### Portée du premier checkpoint

Le premier checkpoint comprend une application accessible en ligne par HTTPS, une première authentification fonctionnelle, la structure technique initiale, un début visible de direction artistique et une documentation de démarrage. Le moteur complet de course, les bots, les bonus et les statistiques avancées sont exclus de ce checkpoint.
