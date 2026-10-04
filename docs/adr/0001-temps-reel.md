# ADR 0001 — Temps réel avec serveur autoritaire dédié

| Champ | Valeur |
|---|---|
| Date | 1er octobre 2026 |
| Statut | Proposé; à confirmer au scaffold et par les essais |
| Décision | Petit service Node.js persistant avec Socket.IO, état durable PostgreSQL, une instance initiale |
| Exigences | Synchronisation de salle au checkpoint 1; course, reconnexion et capacité d'une classe dans la version finale |

[← Architecture](../05-architecture.md) · [Modèle de données](../06-modele-donnees.md) · [Machines à états](../07-machines-etats.md)

## Contexte

Les participants doivent voir les admissions et les réglages immédiatement, puis recevoir les progressions pendant la course. La courte déconnexion doit conserver l'identité. Le serveur doit arbitrer les règles et transmettre l'autorité d'hôte selon la réponse client. La cible initiale est 30 connexions humaines dans une salle; sa réalisation reste à mesurer.

Le temps réel est bidirectionnel : les clients envoient des commandes et le serveur diffuse un état partagé. Il faut maîtriser les doublons, les reconnexions et les pannes sans introduire plusieurs services de coordination dès le premier checkpoint.

## Options examinées

| Option | Avantages | Coût ou limite pour ce projet |
|---|---|---|
| Polling HTTP | Facile à déployer et à inspecter | Multiplication des requêtes; fluidité limitée du classement. |
| SSE avec commandes HTTP | Diffusion serveur simple | Deux chemins de transport à coordonner; reprise et arbitrage métier restent à construire. |
| WebSocket natif | Protocole léger et flexible | Reconnexion, acquittements, canaux et reprise à écrire. |
| Socket.IO dédié | Canaux de salle, reconnexion du transport, acquittements et types partagés | Processus persistant à exploiter; livraison et reprise métier doivent être explicites. |
| MQTT avec broker | Distribution pub/sub | Broker et modèle de permissions supplémentaires, sans avantage décisif pour une classe. |
| Service temps réel géré | Exploitation réduite | Quotas, dépendance et offre gratuite à vérifier; moteur autoritaire toujours nécessaire. |

## Décision proposée

Un service `apps/realtime` recevra les commandes, exécutera les règles de `packages/domain`, persistera la décision puis publiera les événements de salle. Next.js conservera son serveur web standard. L'état des connexions et les files de commandes seront en mémoire; l'état reconnu des salles sera dans PostgreSQL.

Ce choix ne repose pas sur une interdiction générale de WebSocket chez un hébergeur. Les offres évoluent; la documentation actuelle de Vercel mentionne un support WebSocket en bêta. Un transport accepté par une plateforme ne garantit toutefois pas la continuité d'un processus ni sa mémoire. Nous choisissons un service dédié pour gérer explicitement le cycle du moteur; un Route Handler Next.js ne sera jamais présumé permanent. [Limites Vercel Functions](https://vercel.com/docs/functions/limitations).

L'interface web peut être hébergée séparément ou avec le service temps réel derrière le même domaine. La configuration du proxy et des connexions persistantes devra être vérifiée sur l'hébergeur retenu.

## Garanties réellement construites

Socket.IO conserve l'ordre des messages reçus, mais sa livraison par défaut est **au plus une fois** : une interruption peut perdre un message. Les acquittements et tentatives ne procurent pas seuls une exécution unique. Le protocole applicatif ajoutera une identité de commande et une réponse durable pour dédoublonner les répétitions. [Garanties de livraison Socket.IO](https://socket.io/docs/v4/delivery-guarantees/).

La fonctionnalité de récupération de connexion Socket.IO peut aider lors d'une interruption courte, mais sa réussite n'est pas garantie. Elle sera une optimisation; la reprise reposera toujours sur une session vérifiée et un instantané PostgreSQL. Les vérifications d'autorisation ne seront pas sautées à la reconnexion. [Récupération de connexion Socket.IO](https://socket.io/docs/v4/connection-state-recovery/).

### Contrat de commande

```ts
type CommandEnvelope<T> = Readonly<{
  protocolVersion: 1;
  commandId: string;
  roomId?: string;
  raceId?: string;
  inputSequence?: number;
  expectedRoomVersion?: number;
  payload: T;
}>;
```

- L'acteur vient de la session vérifiée, jamais d'un champ libre du message.
- `roomId` est obligatoire pour les mutations d'une salle connue; une création ou une admission par code utilise son contrat spécifique puis reçoit l'identifiant autorisé du serveur.
- `commandId` sert au dédoublonnage durable.
- `inputSequence` ordonne les lots d'une entrée de course; un trou demande une resynchronisation.
- `expectedRoomVersion` protège les modifications de réglages contre un formulaire périmé. Il n'est pas imposé à chaque frappe, car les autres participants font avancer la version globale.
- `raceId` empêche qu'un lot tardif de la course précédente modifie la revanche.
- Le serveur borne taille, fréquence, caractères et structure des messages.

### Traitement transactionnel

1. Vérifier transport, ticket, session, origine, appartenance et droits de commande.
2. Entrer dans la file de la salle; verrouiller sa ligne dans PostgreSQL. Pour la création, verrouiller le compte et dédoublonner par acteur et identifiant de commande avant l'insertion.
3. Retrouver le reçu si `commandId` a déjà été traité; retourner son résultat.
4. Valider l'état et la séquence, puis appliquer le réducteur pur.
5. Insérer ensemble instantané versionné, événement filtré et reçu d'acquittement.
6. Valider la transaction. Publier la version et acquitter la commande.

Si le processus tombe entre le commit et la diffusion, l'état est conservé. Une répétition retrouve le reçu; une reconnexion charge la version actuelle. Le journal joue aussi le rôle de file de publication durable : au retour du processus, ses événements non diffusés peuvent être retransmis. Les clients ignorent toute version déjà appliquée. Aucune promesse de livraison réseau « exactement une fois » n'est faite.

### Synchronisation serveur → navigateur

**Précision de l'implémentation du 3 octobre 2026.** L'acquittement d'une création d'invitation n'est pas rejoué à l'identique : son reçu ne conserve jamais le jeton ni son URL en clair. Une répétition renvoie `invitation_already_issued` et ne crée aucun second lien. Après une perte d'acquittement, l'hôte peut demander une nouvelle invitation avec un autre `commandId`. Les autres commandes conservent leur réponse de dédoublonnage. Le contrat effectivement utilisé et les limites de la première version figurent dans [l'architecture d'implémentation](../18-implementation.md).

Chaque événement porte `roomId`, `version`, `type` et `payload`. Le navigateur accepte la version attendue, ignore les doublons et demande un instantané après un trou. L'instantané remplace l'état courant avec sa version; les événements plus anciens sont ignorés. Après chaque reconnexion, un instantané est demandé même si le transport annonce une récupération réussie.

Un membre reçoit uniquement les données autorisées. Les tickets, invitations, identifiants de session et tampons privés de frappe ne sont pas des événements publics. L'identifiant `socket.id` n'est pas l'identité d'un membre.

## Fréquence et sensation de jeu

Proposition initiale : saisie locale immédiate, lots de frappe environ toutes les 200 ms et classement partagé autour de 5 Hz. Les changements de rôle, de configuration et de phase sont publiés dès leur commit. Les compteurs et positions sont validés par le serveur; le navigateur interpole uniquement l'animation.

À 30 participants envoyant cinq lots par seconde, la charge de conception atteint environ 150 lots entrants par seconde, plus leurs diffusions. Ce calcul décrit le scénario de test, pas une preuve de capacité. Chaque lot acquitté aura été persisté; si cette stratégie dépasse le budget de latence, toute modification des garanties sera documentée avant optimisation.

## Déconnexion, panne et montée en charge

Une interruption client dispose d'une grâce proposée de 60 secondes. Le client suspend les entrées classées hors ligne et demande l'état reconnu à son retour. Un départ volontaire ne bénéficie pas de cette grâce. Le transfert d'hôte et la clôture suivent les [machines à états](../07-machines-etats.md).

Pour la première version, un redémarrage du serveur annule les courses actives, conserve les salons et n'attribue aucune victoire. Cette limite est explicite. Une reprise de course après panne exigera une nouvelle décision sur l'horloge, les participants et l'équité.

Une seule instance temps réel sera déployée initialement. Plusieurs instances imposeraient au minimum un propriétaire unique de chaque salle, une coordination des diffusions et des garanties de reprise vérifiées pour l'adaptateur choisi. Aucun Redis, broker ou cluster n'est ajouté sans besoin mesuré.

## Vérification prévue

| Essai | Preuve à enregistrer |
|---|---|
| Deux navigateurs créent/rejoignent une salle | Réglages et membres identiques; refus serveur des commandes non autorisées. |
| Commande répétée après perte de l'acquittement | Un seul effet, même réponse et version cohérente. |
| Paquet supprimé ou numéro sauté | Détection du trou et instantané rétablissant l'état. |
| Déconnexion puis retour | Identité, entrée et progression reconnue restaurées. |
| Invitation consommée simultanément | Une seule admission; un refus ne brûle pas un autre jeton. |
| 30 clients sur le scénario documenté | Latence au 95e percentile, mémoire, CPU, débit DB, erreurs et reconnexions. |
| Redémarrage après commit | Salon durable; annulation claire de course; aucun score doublé. |

L'objectif proposé d'affichage est un 95e percentile sous 300 ms sur le réseau et l'hébergement de test. La mesure inclura le traitement, la base et la diffusion. Les résultats, conditions et limites seront ajoutés à ce document après exécution.
