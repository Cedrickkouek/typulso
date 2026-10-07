import type {
  Ability,
  ArcadeEvent,
  PlayerSnapshot,
  RaceSnapshot,
  RoomSettings,
} from "../../types/game";
import { applyAbility, type DomainPlayer } from "./engine";
import { DomainError } from "./settings";
export const arcadePolicy = {
  warningMs: 1200,
  activeMs: 3000,
  immunityMs: 10000,
  edgeMs: 5000,
} as const;
/** Choose the nearest active rival ahead before checking immunity; never silently retarget. */
export function nearestTrapRival(
  players: readonly PlayerSnapshot[],
  selfId: string,
): PlayerSnapshot | undefined {
  const self = players.find((p) => p.id === selfId);
  if (!self) return;
  return players
    .filter(
      (p) =>
        p.id !== selfId &&
        p.role === "participant" &&
        p.connected &&
        p.status === "active" &&
        !p.finished &&
        p.progress > self.progress,
    )
    .sort(
      (a, b) => a.progress - b.progress || a.joinedAt - b.joinedAt || a.id.localeCompare(b.id),
    )[0];
}
export function trapAvailable(
  target: PlayerSnapshot | undefined,
  race: Pick<RaceSnapshot, "startsAt" | "endsAt">,
  now: number,
): boolean {
  return (
    !!target &&
    target.progress < 95 &&
    now >= race.startsAt + arcadePolicy.edgeMs &&
    (race.endsAt === null || now < race.endsAt - arcadePolicy.edgeMs) &&
    now >= (target.trapImmuneUntil ?? 0) &&
    (!target.trap || now >= target.trap.endsAt)
  );
}
type Event = Omit<ArcadeEvent, "id">;
export function applyArcadeAbility<T extends DomainPlayer>(
  players: readonly T[],
  actorId: string,
  ability: Ability,
  settings: RoomSettings,
  race: Pick<RaceSnapshot, "startsAt" | "endsAt">,
  now: number,
): { players: T[]; events: Event[] } {
  if (now < race.startsAt || (race.endsAt !== null && now >= race.endsAt))
    throw new DomainError("ABILITY_UNAVAILABLE", "La course doit être en cours.");
  const actor = players.find((p) => p.id === actorId);
  if (!actor) throw new DomainError("PLAYER_INACTIVE", "Participant absent.");
  if (ability !== "boost" && ability !== "shield" && ability !== "trap")
    throw new DomainError("INVALID_ABILITY", "Capacité inconnue.");
  // Reuse the earned-energy, deficit and single-use guard; trap never grants the boost.
  const spent = applyAbility(
    actor,
    ability === "trap" ? "boost" : ability,
    players,
    settings.gameMode,
    now,
  );
  if (ability !== "trap")
    return {
      players: players.map((p) => (p.id === actorId ? { ...p, ...spent } : p)),
      events: [{ kind: ability, actorId, at: now }],
    };
  const target = nearestTrapRival(players, actorId);
  if (!trapAvailable(target, race, now))
    throw new DomainError(
      "TRAP_UNAVAILABLE",
      "Le rival est protégé ou trop proche du départ ou de l’arrivée.",
    );
  return {
    players: players.map((p) =>
      p.id === actorId
        ? { ...p, ...spent, arcadeBonus: actor.arcadeBonus }
        : p.id === target!.id
          ? {
              ...p,
              trap: {
                sourceId: actorId,
                warningEndsAt: now + arcadePolicy.warningMs,
                endsAt: now + arcadePolicy.warningMs + arcadePolicy.activeMs,
                charged: 0,
              },
            }
          : p,
    ),
    events: [{ kind: "trap", actorId, targetId: target!.id, at: now }],
  };
}
/** Expiry/disconnection cancels future charges; a shield absorbs the impact and expires. */
export function settleArcade<T extends DomainPlayer>(
  players: readonly T[],
  now: number,
): { players: T[]; events: Event[] } {
  const events: Event[] = [];
  return {
    players: players.map((p) => {
      if (!p.trap) return p;
      const ended = now >= p.trap.endsAt;
      const inactive = !p.connected || p.finished || p.status !== "active";
      const blocked =
        !ended &&
        !inactive &&
        now >= p.trap.warningEndsAt &&
        (p.shieldRemaining ?? 0) > 0 &&
        now < (p.shieldUntil ?? 0);
      if (!ended && !inactive && !blocked) return p;
      if (blocked)
        events.push({ kind: "trap-blocked", actorId: p.id, targetId: p.trap.sourceId, at: now });
      return {
        ...p,
        trap: null,
        trapImmuneUntil: Math.max(p.trapImmuneUntil ?? 0, now + arcadePolicy.immunityMs),
        ...(blocked ? { shieldRemaining: 0, shieldUntil: null } : {}),
      };
    }),
    events,
  };
}
