import { describe, expect, test } from "bun:test";
import {
  applyArcadeAbility,
  applyInput,
  settleArcade,
  nearestTrapRival,
  trapAvailable,
  initializePlayer,
  defaultSettings,
  score,
  resultForPlayer,
} from "../lib/domain";
const settings = {
  ...defaultSettings,
  gameMode: "arcade" as const,
  errorMode: "free" as const,
  durationSeconds: 30,
};
const race = { startsAt: 1000, endsAt: 31000 };
const actor = () => ({
  ...initializePlayer("actor", "Actor", "account", "participant", 1000),
  progress: 30,
  energy: 100,
  wpm: 30,
  attempts: 30,
  successfulAttempts: 30,
});
const target = () => ({
  ...initializePlayer("target", "Target", "guest", "participant", 1000),
  progress: 50,
  wpm: 50,
  attempts: 50,
  successfulAttempts: 50,
});
const launch = () => applyArcadeAbility([actor(), target()], "actor", "trap", settings, race, 7000);
describe("Arcade: announced, bounded and counterable comma trap", () => {
  test("nearest target is selected before protection; spectators/disconnected/finished rivals are excluded", () => {
    const near = { ...target(), id: "near", progress: 40 };
    expect(nearestTrapRival([actor(), target(), near], "actor")?.id).toBe("near");
    expect(nearestTrapRival([actor(), { ...near, connected: false }, target()], "actor")?.id).toBe(
      "target",
    );
    for (const p of [
      { ...near, role: "spectator" as const },
      { ...near, finished: true },
      { ...near, status: "left" as const },
    ])
      expect(nearestTrapRival([actor(), p], "actor")).toBeUndefined();
    expect(trapAvailable({ ...near, trapImmuneUntil: 9000 }, race, 7000)).toBe(false);
  });
  test("energy is spent once, warning precedes impact and no raw progress is granted", () => {
    const result = launch();
    expect(result.players[0].energy).toBe(0);
    expect(result.players[0].abilityUsed).toBe(true);
    expect(result.players[0].arcadeBonus).toBe(0);
    expect(result.players[0].progress).toBe(30);
    expect(result.players[1].trap).toEqual({
      sourceId: "actor",
      warningEndsAt: 8200,
      endsAt: 11200,
      charged: 0,
    });
    expect(result.events).toEqual([
      { kind: "trap", actorId: "actor", targetId: "target", at: 7000 },
    ]);
    expect(() =>
      applyArcadeAbility(result.players, "actor", "shield", settings, race, 8000),
    ).toThrow();
  });
  test("classic, unearned energy, leading actor, first/last five seconds and a finished target refuse without mutations", () => {
    const candidates = [actor(), target()];
    for (const now of [1000, 5999, 26000, 31000])
      expect(() => applyArcadeAbility(candidates, "actor", "trap", settings, race, now)).toThrow();
    expect(() =>
      applyArcadeAbility(
        candidates,
        "actor",
        "trap",
        { ...settings, gameMode: "classic" },
        race,
        7000,
      ),
    ).toThrow();
    expect(() =>
      applyArcadeAbility(
        [{ ...actor(), energy: 99 }, target()],
        "actor",
        "trap",
        settings,
        race,
        7000,
      ),
    ).toThrow();
    expect(() =>
      applyArcadeAbility(
        [actor(), { ...target(), progress: 95 }],
        "actor",
        "trap",
        settings,
        race,
        7000,
      ),
    ).toThrow();
    expect(candidates[0].energy).toBe(100);
    expect(candidates[1].trap).toBeNull();
  });
  test("warning does not charge, active mistakes cost at most two, and metrics stay genuine", () => {
    const victim = launch().players[1];
    const before = applyInput(
      victim,
      [{ kind: "insert", text: "x" }],
      settings,
      "abcdef",
      1000,
      8000,
    );
    expect(before.trapPenalty).toBe(0);
    const charged = applyInput(
      before,
      [{ kind: "insert", text: "xxx" }],
      settings,
      "abcdef",
      1000,
      9000,
    );
    expect(charged.trapPenalty).toBe(2);
    expect(charged.errors).toBe(4);
    expect(charged.trap?.charged).toBe(2);
    expect(victim.trap?.charged).toBe(0);
    const raw = score(charged, "classic");
    expect(score(charged, "arcade")).toBe(Math.max(0, raw - 2));
  });
  test("accurate input counters the penalty by skill; expiration and deletion add no charges", () => {
    const victim = launch().players[1];
    const clean = applyInput(
      victim,
      [{ kind: "insert", text: "abc" }],
      settings,
      "abcdef",
      1000,
      9000,
    );
    expect(clean.trapPenalty).toBe(0);
    const back = applyInput(clean, [{ kind: "delete" }], settings, "abcdef", 1000, 9500);
    expect(back.trapPenalty).toBe(0);
    const late = applyInput(back, [{ kind: "insert", text: "x" }], settings, "abcdef", 1000, 11200);
    expect(late.trapPenalty).toBe(0);
    expect(settleArcade([late], 11200).players[0].trap).toBeNull();
  });
  test("shield absorbs at impact, expires and grants ten seconds immunity; replay produces no extra event", () => {
    const incoming = launch().players;
    const shielded = incoming.map((p) =>
      p.id === "target" ? { ...p, shieldUntil: 15000, shieldRemaining: 3 } : p,
    );
    expect(settleArcade(shielded, 8199).events).toHaveLength(0);
    const blocked = settleArcade(shielded, 8200);
    expect(blocked.events[0].kind).toBe("trap-blocked");
    expect(blocked.players[1].shieldRemaining).toBe(0);
    expect(blocked.players[1].trap).toBeNull();
    expect(blocked.players[1].trapImmuneUntil).toBe(18200);
    expect(settleArcade(blocked.players, 8300).events).toHaveLength(0);
  });
  test("expired shield does not block; disconnected target cancels future effect without retargeting", () => {
    const incoming = launch().players;
    expect(
      settleArcade(
        incoming.map((p) => ({ ...p, shieldRemaining: 3, shieldUntil: 8200 })),
        8200,
      ).events,
    ).toHaveLength(0);
    const disconnected = settleArcade(
      incoming.map((p) => (p.id === "target" ? { ...p, connected: false } : p)),
      8000,
    );
    expect(disconnected.players[1].trap).toBeNull();
    expect(disconnected.players[0].energy).toBe(0);
  });
  test("active traps cannot stack and cumulative penalties cap at four without making scores negative", () => {
    const players = launch().players;
    expect(() =>
      applyArcadeAbility(
        [{ ...players[0], abilityUsed: false, energy: 100 }, players[1]],
        "actor",
        "trap",
        settings,
        race,
        8000,
      ),
    ).toThrow();
    const capped = applyInput(
      { ...players[1], trapPenalty: 3 },
      [{ kind: "insert", text: "xxx" }],
      settings,
      "abcdef",
      1000,
      9000,
    );
    expect(capped.trapPenalty).toBe(4);
    expect(score({ ...capped, wpm: 0 }, "arcade")).toBe(0);
    expect(resultForPlayer(capped, 1000, 10000, 1, "arcade").arcade?.penalty).toBe(4);
  });
  test("clean streaks count new correct positions only; a mistake breaks them", () => {
    let p = initializePlayer("p", "P", "guest", "participant", 1000);
    p = applyInput(p, [{ kind: "insert", text: "abc" }], settings, "abcdef", 1000, 7000);
    expect(p.bestStreak).toBe(3);
    p = applyInput(
      p,
      [{ kind: "delete" }, { kind: "insert", text: "c" }],
      settings,
      "abcdef",
      1000,
      7100,
    );
    expect(p.bestStreak).toBe(3);
    p = applyInput(p, [{ kind: "insert", text: "x" }], settings, "abcdef", 1000, 7200);
    expect(p.streak).toBe(0);
    expect(p.bestStreak).toBe(3);
  });
});
