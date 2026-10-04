import type {
  IdentityKind,
  InputOperation,
  KeyMetric,
  PlayerSnapshot,
  ResultSnapshot,
  RoomSettings,
} from "../../types/game";
import { codepoints, DomainError } from "./settings";

/** JSON-safe persisted state. Only the room service may authorize commands or accept sequences. */
export interface DomainPlayer extends PlayerSnapshot {
  value: string;
  sequence: number;
  attempts: number;
  successfulAttempts: number;
  heatmap: KeyMetric[];
  lastInputAt: number;
  finishedAt: number | null;
  stoppedAt: number | null;
  energyHighWater: number;
  arcadeBonus: number;
  shieldUntil: number | null;
  shieldRemaining: number;
  protectedErrors: number;
  botNextAt: number;
  botRandomState: number;
}

export type Ability = "boost" | "shield";
export const racePolicy = {
  countdownMs: 3000,
  afkWarningMs: 45000,
  afkAbandonMs: 60000,
  reconnectGraceMs: 60000,
  noLimitAfterFirstFinishMs: 60000,
  noLimitSafetyMs: 600000,
} as const;

function hash(value: string): number {
  let state = 2166136261;
  for (const character of codepoints(value))
    state = Math.imul(state ^ character.codePointAt(0)!, 16777619);
  return state >>> 0;
}

function validClock(now: number): void {
  if (!Number.isFinite(now) || now < 0) throw new DomainError("INVALID_CLOCK", "Horloge invalide.");
}

function copy(player: DomainPlayer): DomainPlayer {
  return { ...player, heatmap: player.heatmap.map((entry) => ({ ...entry })) };
}

export function initializePlayer(
  id: string,
  username: string,
  kind: IdentityKind,
  role: PlayerSnapshot["role"],
  now: number,
): DomainPlayer {
  validClock(now);
  return {
    id,
    username,
    kind,
    role,
    ready: kind === "bot",
    connected: true,
    joinedAt: now,
    progress: 0,
    correct: 0,
    errors: 0,
    corrections: 0,
    wpm: 0,
    accuracy: 100,
    finished: false,
    energy: 0,
    abilityUsed: false,
    status: "active",
    value: "",
    sequence: 0,
    attempts: 0,
    successfulAttempts: 0,
    heatmap: [],
    lastInputAt: now,
    finishedAt: null,
    stoppedAt: null,
    energyHighWater: 0,
    arcadeBonus: 0,
    shieldUntil: null,
    shieldRemaining: 0,
    protectedErrors: 0,
    botNextAt: now,
    botRandomState: hash(id),
  };
}

/** A command is a bounded edit batch, never a replacement buffer or an arbitrary paste. */
export function validateInputOperations(input: unknown): InputOperation[] {
  if (!Array.isArray(input) || input.length === 0 || input.length > 8) {
    throw new DomainError(
      "INVALID_INPUT",
      "Une frappe doit contenir entre une et huit opérations.",
    );
  }
  let inserted = 0;
  return input.map((operation: unknown) => {
    if (!operation || typeof operation !== "object" || Array.isArray(operation)) {
      throw new DomainError("INVALID_INPUT", "Opération de frappe invalide.");
    }
    const op = operation as Record<string, unknown>;
    if (op.kind === "delete" && Object.keys(op).length === 1) return { kind: "delete" };
    if (op.kind !== "insert" || typeof op.text !== "string" || Object.keys(op).length !== 2) {
      throw new DomainError("INVALID_INPUT", "Opération de frappe invalide.");
    }
    const text = op.text.normalize("NFC");
    const characters = codepoints(text);
    inserted += characters.length;
    if (
      characters.length < 1 ||
      characters.length > 4 ||
      inserted > 8 ||
      /[\p{Cc}\p{Cf}\p{Cs}]/u.test(text)
    ) {
      throw new DomainError(
        "INVALID_INPUT",
        "Le collage ou un lot de frappe trop long est refusé.",
      );
    }
    // Composition commits such as an accented letter are normalized before they are scored.
    return { kind: "insert", text };
  });
}

/** Current correct positions, not lifetime correct attempts, determine speed and visible progress. */
export function updateMetrics(
  player: DomainPlayer,
  text: string,
  startsAt: number,
  now: number,
  errorMode: RoomSettings["errorMode"] = "free",
): DomainPlayer {
  validClock(startsAt);
  validClock(now);
  const target = codepoints(text);
  const value = codepoints(player.value);
  const correct = value.reduce(
    (count, character, index) => count + Number(character === target[index]),
    0,
  );
  const firstError = value.findIndex((character, index) => character !== target[index]);
  const progressLength = errorMode === "blocking" && firstError >= 0 ? firstError : value.length;
  const stoppedAt = player.status === "left" ? (player.stoppedAt ?? now) : player.stoppedAt;
  const end = player.finishedAt ?? stoppedAt ?? now;
  // A minimum one-second sample avoids an infinite speed at the exact start instant.
  const elapsedMs = Math.max(1000, end - startsAt);
  return {
    ...player,
    stoppedAt,
    correct,
    progress: target.length ? Math.min(100, (progressLength / target.length) * 100) : 0,
    wpm: now < startsAt ? 0 : (correct * 12000) / elapsedMs,
    accuracy: player.attempts ? (player.successfulAttempts / player.attempts) * 100 : 100,
  };
}

function recordAttempt(player: DomainPlayer, expected: string, correct: boolean): void {
  const existing = player.heatmap.find((entry) => entry.key === expected);
  const metric = existing ?? { key: expected, attempts: 0, errors: 0 };
  if (!existing) player.heatmap.push(metric);
  metric.attempts += 1;
  if (!correct) metric.errors += 1;
  player.attempts += 1;
  if (correct) player.successfulAttempts += 1;
  else player.errors += 1;
}

/** Atomic validation precedes edits. Wrong keys are game data, not rejected commands. */
export function applyInput(
  player: DomainPlayer,
  input: unknown,
  settings: RoomSettings,
  text: string,
  startsAt: number,
  now: number,
): DomainPlayer {
  validClock(startsAt);
  validClock(now);
  if (now < startsAt)
    throw new DomainError("RACE_NOT_STARTED", "La course n'a pas encore commencé.");
  if (settings.durationSeconds !== null && now >= startsAt + settings.durationSeconds * 1000) {
    throw new DomainError("TIME_EXPIRED", "Le temps de course est écoulé.");
  }
  if (now < player.lastInputAt)
    throw new DomainError("INVALID_CLOCK", "La frappe précède la dernière activité.");
  if (
    player.role !== "participant" ||
    !player.connected ||
    player.status !== "active" ||
    player.finished
  ) {
    throw new DomainError("PLAYER_INACTIVE", "Ce joueur ne peut pas saisir dans cette course.");
  }
  const operations = validateInputOperations(input);
  const target = codepoints(text);
  if (!target.length) throw new DomainError("INVALID_INPUT", "Le texte de course est vide.");
  const result = copy(player);
  const value = codepoints(player.value);
  let changed = false;
  for (const operation of operations) {
    if (result.finished) break;
    if (operation.kind === "delete") {
      if (value.length) {
        value.pop();
        result.corrections += 1;
        changed = true;
      }
      continue;
    }
    for (const character of codepoints(operation.text)) {
      if (result.finished || value.length >= target.length) break;
      // Keep the erroneous letter visible. A backspace is required before inserting again.
      if (
        settings.errorMode === "blocking" &&
        value.some((entered, index) => entered !== target[index])
      )
        break;
      const joined = value.join("") + character;
      if (joined.normalize("NFC") !== joined) {
        throw new DomainError(
          "INVALID_INPUT",
          "Valide la composition complète avant de transmettre la frappe.",
        );
      }
      const index = value.length;
      const isCorrect = character === target[index];
      recordAttempt(result, target[index]!, isCorrect);
      value.push(character);
      changed = true;
      if (isCorrect && index >= result.energyHighWater) {
        result.energy = Math.min(100, result.energy + 2);
        result.energyHighWater = index + 1;
      }
      if (
        !isCorrect &&
        settings.gameMode === "arcade" &&
        result.shieldRemaining > 0 &&
        now < (result.shieldUntil ?? 0)
      ) {
        result.protectedErrors += 1;
        result.shieldRemaining -= 1;
      }
      if (value.length === target.length && (settings.errorMode === "free" || isCorrect)) {
        result.finished = true;
        result.finishedAt = now;
        result.status = "finished";
      }
    }
  }
  result.value = value.join("");
  result.sequence += 1;
  if (changed) result.lastInputAt = now;
  if (now >= (result.shieldUntil ?? Infinity)) result.shieldRemaining = 0;
  return updateMetrics(result, text, startsAt, now, settings.errorMode);
}

/** Proposed transparent classification: current correct WPM × cumulative accuracy². */
export function score(
  player: Pick<
    DomainPlayer,
    "wpm" | "accuracy" | "attempts" | "errors" | "protectedErrors" | "arcadeBonus"
  >,
  mode: RoomSettings["gameMode"] = "classic",
): number {
  const accuracy = Math.max(0, Math.min(1, player.accuracy / 100));
  const base = Math.max(0, player.wpm) * accuracy ** 2;
  if (mode === "classic") return base;
  const effectiveAccuracy = player.attempts
    ? Math.max(
        0,
        Math.min(1, (player.attempts - player.errors + player.protectedErrors) / player.attempts),
      )
    : 1;
  const shieldAdvantage = Math.max(0, player.wpm * effectiveAccuracy ** 2 - base);
  return base + Math.min(6, Math.max(0, player.arcadeBonus) + shieldAdvantage);
}

/** At least a five-percentage-point deficit; one use, earned energy, no raw metric changes. */
export function applyAbility(
  player: DomainPlayer,
  ability: Ability,
  players: readonly DomainPlayer[],
  mode: RoomSettings["gameMode"],
  now: number,
): DomainPlayer {
  validClock(now);
  if (ability !== "boost" && ability !== "shield")
    throw new DomainError("INVALID_ABILITY", "Capacité inconnue.");
  const rivals = players.filter(
    (candidate) =>
      candidate.id !== player.id && candidate.role === "participant" && candidate.status !== "left",
  );
  const leaderProgress = Math.max(
    player.progress,
    ...rivals.map((candidate) => candidate.progress),
  );
  const deficit = leaderProgress - player.progress;
  if (
    mode !== "arcade" ||
    player.role !== "participant" ||
    !player.connected ||
    player.status !== "active" ||
    player.finished ||
    player.abilityUsed ||
    player.energy < 100 ||
    deficit < 5
  ) {
    throw new DomainError(
      "ABILITY_UNAVAILABLE",
      "La capacité exige 100 d'énergie et au moins cinq points de retard en mode arcade.",
    );
  }
  return {
    ...player,
    abilityUsed: true,
    energy: 0,
    arcadeBonus: ability === "boost" ? Math.min(6, deficit * 0.15) : player.arcadeBonus,
    shieldUntil: ability === "shield" ? now + 8000 : player.shieldUntil,
    shieldRemaining: ability === "shield" ? 3 : player.shieldRemaining,
  };
}

export function resultForPlayer(
  player: DomainPlayer,
  startsAt: number,
  now: number,
  rank = 0,
  mode: RoomSettings["gameMode"] = "classic",
): ResultSnapshot {
  validClock(startsAt);
  validClock(now);
  const stoppedAt = player.status === "left" ? (player.stoppedAt ?? now) : player.stoppedAt;
  const end = player.finishedAt ?? stoppedAt ?? now;
  // `correct` is the last validated buffer measurement. Final elapsed time still includes idle time.
  const effective = {
    ...player,
    stoppedAt,
    wpm: now < startsAt ? 0 : (player.correct * 12000) / Math.max(1000, end - startsAt),
    accuracy: player.attempts ? (player.successfulAttempts / player.attempts) * 100 : 100,
  };
  return {
    playerId: player.id,
    username: player.username,
    kind: player.kind,
    rank,
    wpm: effective.wpm,
    accuracy: effective.accuracy,
    errors: player.errors,
    corrections: player.corrections,
    correct: player.correct,
    progress: player.progress,
    durationMs: Math.max(0, (player.finishedAt ?? effective.stoppedAt ?? now) - startsAt),
    score: score(effective, mode),
    heatmap: player.heatmap
      .map((entry) => ({ ...entry }))
      .sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0)),
  };
}

/** All comparisons use full precision. Display rounding must not change the rank. */
export function rankPlayers(
  players: readonly DomainPlayer[],
  startsAt: number,
  now: number,
  mode: RoomSettings["gameMode"] = "classic",
): ResultSnapshot[] {
  return players
    .filter((player) => player.role === "participant")
    .map((player) => resultForPlayer(player, startsAt, now, 0, mode))
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.correct - a.correct ||
        a.durationMs - b.durationMs ||
        (a.playerId < b.playerId ? -1 : a.playerId > b.playerId ? 1 : 0),
    )
    .map((result, index) => ({ ...result, rank: index + 1 }));
}

export function inactivityState(
  player: DomainPlayer,
  startsAt: number,
  now: number,
): "active" | "warning" | "abandoned" {
  if (
    player.kind === "bot" ||
    player.role === "spectator" ||
    player.finished ||
    player.status === "left"
  )
    return "active";
  const idle = now - Math.max(startsAt, player.lastInputAt);
  return idle >= racePolicy.afkAbandonMs
    ? "abandoned"
    : idle >= racePolicy.afkWarningMs
      ? "warning"
      : "active";
}

/** Disconnection remains nonterminal until the service expires its reconnect grace. */
export function raceIsComplete(
  players: readonly DomainPlayer[],
  settings: RoomSettings,
  startsAt: number,
  now: number,
): boolean {
  if (now < startsAt) return false;
  if (settings.durationSeconds !== null && now >= startsAt + settings.durationSeconds * 1000)
    return true;
  const participants = players.filter((player) => player.role === "participant");
  return participants.every((player) => player.finished || player.status === "left");
}
