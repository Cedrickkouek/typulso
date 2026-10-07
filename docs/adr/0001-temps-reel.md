# ADR 0001 — service Socket.IO dédié et serveur autoritaire

**Auteur : YANN CEDRICK KOUEKAM TELEWOU**

> **Statut : retenu et implémenté · actualisé le 7 octobre 2026.**\
> Décision initiale : 1er octobre. Structure effective : racine App Router selon l’ADR 0002.\
> Version applicative des preuves : 4d23075.


## Contexte et options

Une classe doit partager présences, règles et progression d’une course, avec un hôte temporaire et des permissions serveur. Polling HTTP et SSE imposent des compromis de fréquence ou deux chemins de commandes/diffusion. WebSocket natif demande d’écrire gestion de canaux, reconnexion et acquittements. Un broker ou une plateforme gérée ajouterait une dépendance d’exploitation sans retirer le besoin d’un moteur autoritaire.

**Décision :** un processus Node.js Socket.IO (`server/index.ts`) distinct reçoit les commandes et diffuse les états; Next.js conserve pages et routes HTTP. Les deux utilisent PostgreSQL. Ce choix permet une horloge de course persistante et un contrôle explicite du cycle du moteur. La décision ne dépend pas d’une affirmation générale sur les capacités WebSocket d’un autre hébergeur.

## Contrat effectivement utilisé

Le contrat partagé (`types/game.ts`) définit :

```ts
interface RoomCommand {
  commandId: string;
  kind: CommandKind;
  roomId?: string;
  expectedVersion?: number;
  payload?: Record<string, unknown>;
}
```

Le client émet `command` et reçoit un acquittement `CommandResponse` : soit `{ ok: true, data: { room, invitationUrl? } }`, soit `{ ok: false, error }`. Les types de commandes comprennent `create`, `join`, `sync`, `configure`, `ready`, `start`, `input`, `leave`, `kick`, `role`, `invite`, `rematch`, `close`, `ability` et `quick`.

L’acteur vient du ticket/session vérifié, pas du message. `commandId` identifie la répétition; `expectedVersion` protège les mutations de contrôle lorsqu’il est fourni. L’identifiant de course et la séquence de frappe sont dans le **payload de `input`**, pas dans une ancienne enveloppe `protocolVersion`/`inputSequence`. Le serveur valide forme, taille, débit, admission, phase et droits.

## Traitement et durabilité

1. Valider la session, l’origine et la structure; appliquer la limite de débit.
2. Ouvrir la transaction; retrouver le reçu d’une commande répétée et verrouiller les données concernées, notamment la ligne de salle.
3. Vérifier version, permissions, phase et règles de course; appliquer la commande.
4. Enregistrer état de salle, membres, données de course/résultat utiles, projection versionnée et reçu.
5. Valider la transaction, puis diffuser l’instantané filtré et acquitter.

`command_receipts` évite le double effet d’une répétition reconnue. **Exception volontaire :** le reçu d’une invitation ne conserve ni URL ni jeton secret en clair. Son rejeu renvoie `invitation_already_issued`; une nouvelle invitation requiert un autre identifiant de commande.

L’état validé survit à une perte de diffusion. Au retour, le client demande `sync` et reçoit l’état courant. `room_events` garde des projections versionnées mais **n’est pas une outbox rejouant automatiquement chaque événement perdu**. Le projet ne promet pas une livraison réseau exactement une fois.

## Diffusion et reprise

Le serveur publie `room:state` : un **snapshot complet par destinataire**, plutôt qu’une suite de deltas `type/payload` à rejouer. Les clients utilisent la version pour ne pas remplacer un état récent par un ancien. Le ticker fonctionne toutes les **250 ms**; les commandes de contrôle déclenchent une diffusion après leur transaction. Cette période ne prouve ni une latence maximale ni une capacité à 30 joueurs.

La reprise du transport est complétée par un ticket autorisé et `sync`; la correction métier ne repose pas sur une récupération automatique du transport. Aucune saisie privée d’un autre joueur, empreinte de session ou secret d’invitation n’est publié. Seules les positions et métriques autorisées accompagnent le texte.

## Conséquences et limites

Une seule instance temps réel est prévue. Plusieurs instances exigeraient une coordination des diffusions, de l’horloge et de la propriété des salles. PostgreSQL arbitre les mutations avec des verrous transactionnels; aucune file de salle en mémoire n’est présentée comme une garantie durable.

Une courte coupure dispose de 60 secondes de grâce. Au redémarrage du processus, les courses actives sont interrompues, les salons conservés et aucune victoire inventée. Une reprise équitable de course demanderait une nouvelle décision sur l’horloge et la reconnexion. Le guide Railway prévoit le processus persistant et la migration préalable.

## Preuves disponibles

Les contrôles locaux et la CI distante couvrent sessions, deux connexions, admission, commandes refusées, répétition, invitation unique, séquence, fin et résultats. Le 7 octobre, le salon par code et ses modifications ont aussi été vérifiés en production avec un compte et un invité HTTP/Socket.IO; voir bilan du checkpoint 1. Les scénarios de charge à 30 clients, la latence au 95e percentile et toutes les pannes de production restent **à mesurer**, et ne sont pas cochés comme réussis.
