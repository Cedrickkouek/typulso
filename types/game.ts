export type Locale = "fr" | "en";
export type IdentityKind = "account" | "guest" | "bot";
export interface SessionUser {
  id: string;
  username: string;
  kind: "account" | "guest";
}
export interface SessionData {
  user: SessionUser | null;
  oauth: { github: boolean; discord: boolean };
}
export interface RoomSettings {
  name: string;
  visibility: "public" | "code" | "private";
  language: Locale;
  contentMode: "text" | "words" | "custom";
  customText: string;
  length: number;
  durationSeconds: number | null;
  errorMode: "free" | "blocking";
  gameMode: "classic" | "arcade";
  botCount: number;
  botLevel: "easy" | "medium" | "hard";
  excludedCharacters: string;
  targets: Array<"accents" | "numbers" | "punctuation">;
  topic: "everyday" | "science" | "gaming";
  targetWpm: number | null;
}
export type RoomPhase = "lobby" | "countdown" | "racing" | "results" | "closed" | "interrupted";
export type Ability = "boost" | "shield" | "trap";
export interface TrapEffect {
  sourceId: string;
  warningEndsAt: number;
  endsAt: number;
  charged: number;
}
export interface ArcadeEvent {
  id: string;
  kind: Ability | "trap-blocked";
  actorId: string;
  targetId?: string;
  at: number;
}
export interface PlayerSnapshot {
  id: string;
  username: string;
  kind: IdentityKind;
  role: "participant" | "spectator";
  ready: boolean;
  connected: boolean;
  joinedAt: number;
  progress: number;
  correct: number;
  errors: number;
  corrections: number;
  wpm: number;
  accuracy: number;
  finished: boolean;
  energy: number;
  abilityUsed: boolean;
  shieldUntil?: number | null;
  shieldRemaining?: number;
  trap?: TrapEffect | null;
  trapImmuneUntil?: number;
  trapPenalty?: number;
  streak?: number;
  bestStreak?: number;
  status: "active" | "finished" | "left" | "disconnected";
}
export interface KeyMetric {
  key: string;
  attempts: number;
  errors: number;
}
export interface ResultSnapshot {
  playerId: string;
  username: string;
  kind: IdentityKind;
  rank: number;
  wpm: number;
  accuracy: number;
  errors: number;
  corrections: number;
  correct: number;
  durationMs: number;
  progress: number;
  score: number;
  heatmap: KeyMetric[];
  attempts?: number;
  bestStreak?: number;
  arcade?: { bonus: number; penalty: number };
  personalBest?: boolean;
  firstReference?: boolean;
}
export interface RaceSnapshot {
  id: string;
  text: string;
  startsAt: number;
  endsAt: number | null;
}
export interface RoomSnapshot {
  id: string;
  code: string | null;
  settings: RoomSettings;
  phase: RoomPhase;
  version: number;
  hostId: string;
  players: PlayerSnapshot[];
  race: RaceSnapshot | null;
  results: ResultSnapshot[];
  serverTime: number;
  events?: ArcadeEvent[];
  self?: { value: string; sequence: number };
}
export interface RoomSummary {
  id: string;
  name: string;
  language: Locale;
  gameMode: "classic" | "arcade";
  phase: RoomPhase;
  playerCount: number;
}
export type InputOperation = { kind: "insert"; text: string } | { kind: "delete" };
export type CommandKind =
  | "create"
  | "join"
  | "sync"
  | "ready"
  | "configure"
  | "start"
  | "input"
  | "leave"
  | "kick"
  | "role"
  | "invite"
  | "rematch"
  | "close"
  | "ability"
  | "quick";
export interface RoomCommand {
  commandId: string;
  kind: CommandKind;
  roomId?: string;
  expectedVersion?: number;
  payload?: Record<string, unknown>;
}
export type CommandResponse =
  { ok: true; data: { room: RoomSnapshot; invitationUrl?: string } } | { ok: false; error: string };
export interface StoredResult extends ResultSnapshot {
  id: string;
  roomId: string;
  roomName: string;
  raceId: string;
  createdAt: string;
  language: Locale;
  gameMode: "classic" | "arcade";
  rulesKey?: string;
}
export interface ProfileData {
  user: SessionUser;
  stats: {
    races: number;
    wins: number;
    averageWpm: number;
    averageAccuracy: number;
    bestWpm: number;
    averageRank: number;
  };
  results: StoredResult[];
}
