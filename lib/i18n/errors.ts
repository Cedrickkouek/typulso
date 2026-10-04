import type { Locale } from "@/types/game";
const messages: Record<string, [string, string]> = {
  service_unavailable: [
    "Le service est indisponible. Réessaie dans un instant.",
    "The service is unavailable. Try again in a moment.",
  ],
  invalid_username: [
    "Choisis un pseudo de 3 à 24 lettres, chiffres, _ ou -.",
    "Choose a nickname with 3 to 24 letters, numbers, _ or -.",
  ],
  invalid_password: [
    "Le mot de passe doit contenir de 10 à 128 caractères.",
    "Your password must contain 10 to 128 characters.",
  ],
  invalid_credentials: [
    "Le pseudo ou le mot de passe ne correspond pas.",
    "The nickname or password does not match.",
  ],
  username_taken: [
    "Ce pseudo appartient déjà à un compte.",
    "This nickname already belongs to an account.",
  ],
  auth_required: ["Connecte-toi pour continuer.", "Sign in to continue."],
  authentication_required: ["Connecte-toi pour continuer.", "Sign in to continue."],
  account_required: [
    "Un compte est nécessaire pour préparer une salle.",
    "An account is required to prepare a room.",
  ],
  forbidden: ["Ton rôle ne permet pas cette action.", "Your role does not allow this action."],
  host_required: [
    "Seul l’hôte peut effectuer cette action.",
    "Only the host can perform this action.",
  ],
  room_not_found: [
    "Cette salle est introuvable ou n’est plus accessible.",
    "This room could not be found or is no longer accessible.",
  ],
  room_closed: [
    "Cette salle est fermée. Retrouve une autre course.",
    "This room is closed. Find another race.",
  ],
  room_full: [
    "La salle est complète. Réessaie ou choisis une autre course.",
    "The room is full. Try again or choose another race.",
  ],
  invalid_code: [
    "Ce code ne correspond à aucune salle accessible.",
    "This code does not match an accessible room.",
  ],
  invalid_invitation: [
    "Cette invitation a expiré, a été utilisée ou a été révoquée.",
    "This invitation has expired, has been used, or has been revoked.",
  ],
  invitation_required: [
    "Une invitation individuelle est nécessaire pour cette salle privée.",
    "An individual invitation is required for this private room.",
  ],
  private_room_required: [
    "Les invitations individuelles sont réservées aux salles privées.",
    "Individual invitations are available for private rooms.",
  ],
  invalid_phase: [
    "La salle a changé d’étape. Synchronise-la puis réessaie l’action disponible.",
    "The room phase has changed. Sync it and retry an available action.",
  ],
  not_ready: [
    "Les participants doivent être prêts avant le départ.",
    "Participants must be ready before the start.",
  ],
  players_not_ready: [
    "Tous les participants doivent être prêts et connectés avant le départ.",
    "All participants must be ready and connected before the start.",
  ],
  unauthenticated: [
    "Ta session a expiré. Connecte-toi pour continuer.",
    "Your session has expired. Sign in to continue.",
  ],
  code_required: [
    "Entre le code fourni par l’hôte pour rejoindre cette salle.",
    "Enter the code provided by the host to join this room.",
  ],
  invalid_settings: [
    "Ces réglages ne sont pas compatibles. Vérifie les longueurs, les caractères exclus et le texte personnalisé (10 à 200 mots).",
    "These settings are not compatible. Check lengths, excluded characters and the custom text (10 to 200 words).",
  ],
  invalid_input: [
    "Cette saisie ne peut pas être confirmée. Termine la composition du caractère puis resynchronise la salle.",
    "This input cannot be confirmed. Finish composing the character, then sync the room.",
  ],
  stale_version: [
    "Les règles ou les rôles ont changé. Relis le salon puis réessaie.",
    "Rules or roles have changed. Review the lobby and try again.",
  ],
  ability_unavailable: [
    "Il faut 100 d’énergie, au moins 5 points de retard et une capacité encore disponible.",
    "You need 100 energy, at least a 5-point deficit and an unused ability.",
  ],
  time_expired: [
    "Le temps de course est écoulé. Le serveur prépare les résultats.",
    "Race time has elapsed. The server is preparing the results.",
  ],
  player_inactive: [
    "Ta participation ne permet plus la frappe. Synchronise la salle pour retrouver son état.",
    "Your participation no longer allows typing. Sync the room to restore its state.",
  ],
  rate_limited: [
    "Beaucoup d’actions sont arrivées. Attends quelques secondes puis réessaie.",
    "Many actions arrived at once. Wait a few seconds and try again.",
  ],
  stale_sequence: [
    "Ta frappe doit être resynchronisée. Reconnecte-toi pour reprendre.",
    "Your typing needs to be synced. Reconnect to resume.",
  ],
  result_not_found: [
    "Ce résultat est introuvable ou appartient à une autre identité.",
    "This result could not be found or belongs to another identity.",
  ],
  kicked: ["L’hôte t’a retiré de cette salle.", "The host removed you from this room."],
  invalid_origin: [
    "Cette connexion ne correspond pas à l’adresse du service. Recharge la page depuis son adresse officielle.",
    "This connection does not match the service address. Reload the page from its official address.",
  ],
  oauth_unavailable: [
    "Ce fournisseur de connexion n’est pas disponible pour le moment. Utilise ton compte local.",
    "This sign-in provider is unavailable. Use your local account.",
  ],
};
export function errorMessage(message: string, locale: Locale) {
  if (messages[message]) return messages[message][locale === "en" ? 1 : 0];
  if (/^[a-z_]+$/.test(message))
    return locale === "fr"
      ? "L’action n’a pas pu être confirmée. Actualise ou réessaie dans un instant."
      : "The action could not be confirmed. Refresh or try again in a moment.";
  const parts = message.split(" / ");
  return parts.length === 2 ? parts[locale === "en" ? 1 : 0] : message;
}
