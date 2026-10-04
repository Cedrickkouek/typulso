import { describe, expect, test } from "bun:test";
import {
  applyAbility,
  applyInput,
  codepoints,
  defaultSettings,
  DomainError,
  generateText,
  inactivityState,
  initializePlayer,
  makeBotTick,
  raceIsComplete,
  rankPlayers,
  resultForPlayer,
  score,
  updateMetrics,
  validateSettings,
} from "../lib/domain";
import type { DomainPlayer } from "../lib/domain";
import type { InputOperation, RoomSettings } from "../types/game";

const settings = (changes: Partial<RoomSettings> = {}, base?: RoomSettings) =>
  validateSettings(changes, base);
const player = (id = "human") => initializePlayer(id, id, "account", "participant", 1000);
const insert = (text: string): InputOperation[] => [{ kind: "insert", text }];
function errorCode(action: () => unknown): string | undefined {
  try {
    action();
  } catch (error) {
    if (error instanceof DomainError) return error.code;
    throw error;
  }
  return undefined;
}

describe("validated settings and local text corpus", () => {
  test("partial updates preserve defaults without sharing a mutable targets array", () => {
    const value = settings({ name: "  Cours   du matin  ", language: "en", durationSeconds: null });
    expect(value.name).toBe("Cours du matin");
    expect(value.language).toBe("en");
    expect(value.durationSeconds).toBeNull();
    value.targets.length = 0;
    expect(defaultSettings.targets).toEqual(["accents", "punctuation"]);
    expect(settings({ length: 10 }, settings({ length: 200 })).length).toBe(10);
  });

  test.each(
    [
      null,
      [],
      { length: "50" },
      { length: 9 },
      { length: 201 },
      { length: NaN },
      { durationSeconds: 14 },
      { durationSeconds: 601 },
      { botCount: 30 },
      { botCount: -1 },
      { targetWpm: Infinity },
      { targetWpm: 0 },
      { gameMode: "other" },
      { targets: ["unknown"] },
      { excludedCharacters: " " },
      { name: "\u0000abc" },
      { targets: ["numbers", "numbers", "numbers", "numbers"] },
      { isAdmin: true },
      { excludedCharacters: "x".repeat(65) },
    ].map((input) => [input] as const),
  )("rejects invalid values without silent coercion: %j", (input) => {
    expect(errorCode(() => validateSettings(input))).toBe("INVALID_SETTINGS");
  });

  test("custom text normalizes NFC and whitespace; excluded characters are never silently removed", () => {
    const customText = "Un e\u0301le\u0300ve apprend chaque jour\navec ses amis dans une classe.";
    const value = settings({ contentMode: "custom", customText, targets: [] });
    expect(value.length).toBe(11);
    expect(generateText(value)).toBe("Un élève apprend chaque jour avec ses amis dans une classe.");
    expect(errorCode(() => settings({ ...value, excludedCharacters: "é" }))).toBe(
      "INVALID_SETTINGS",
    );
    expect(errorCode(() => settings({ contentMode: "custom", customText: "trop court" }))).toBe(
      "INVALID_SETTINGS",
    );
  });

  test("both languages, topics and modes obey word count, targets and determinism", () => {
    for (const language of ["fr", "en"] as const) {
      for (const topic of ["everyday", "science", "gaming"] as const) {
        for (const contentMode of ["text", "words"] as const) {
          for (const length of [10, 47, 200]) {
            const value = settings({
              language,
              topic,
              contentMode,
              length,
              targets: ["accents", "numbers", "punctuation"],
            });
            const text = generateText(value, 23);
            expect(text).toBe(text.normalize("NFC"));
            expect(text.split(" ")).toHaveLength(length);
            expect(text).toMatch(/\d/u);
            expect(text).toMatch(/\p{P}/u);
            expect(text.normalize("NFD")).toMatch(/\p{M}/u);
            expect(generateText(value, 23)).toBe(text);
          }
        }
      }
    }
    expect(generateText(settings({ contentMode: "words" }), 1)).not.toBe(
      generateText(settings({ contentMode: "words" }), 2),
    );
  });

  test("exclusions apply after all target injections and impossible constraints are explicit", () => {
    const value = settings({
      contentMode: "words",
      targets: [],
      excludedCharacters: "éé!",
      length: 200,
    });
    expect(value.excludedCharacters).toBe("é!");
    expect(generateText(value, 42)).not.toMatch(/[é!]/u);
    expect(generateText(value, 42).normalize("NFD")).not.toMatch(/\p{M}/u);
    expect(
      errorCode(() =>
        generateText(
          settings({
            contentMode: "words",
            excludedCharacters: "abcdefghijklmnopqrstuvwxyzéèêàâîïôùûç",
            targets: [],
          }),
        ),
      ),
    ).toBe("IMPOSSIBLE_CONTENT");
    expect(
      errorCode(() =>
        generateText(
          settings({
            contentMode: "words",
            targets: ["numbers"],
            excludedCharacters: "0123456789",
          }),
        ),
      ),
    ).toBe("IMPOSSIBLE_CONTENT");
  });

  test("target categories survive one another across generated exercises", () => {
    for (const language of ["fr", "en"] as const)
      for (let seed = 0; seed < 100; seed++) {
        const text = generateText(
          settings({
            language,
            contentMode: "words",
            length: 10,
            targets: ["numbers", "accents", "punctuation"],
          }),
          seed,
        );
        expect(text.normalize("NFD")).toMatch(/\p{M}/u);
        expect(text).toMatch(/\d/u);
        expect(text).toMatch(/\p{P}/u);
      }
  });

  test("a short targeted text is a complete original sentence, not arbitrary word substitution", () => {
    expect(
      generateText(
        settings({
          contentMode: "text",
          language: "fr",
          length: 10,
          targets: ["numbers", "accents", "punctuation"],
        }),
        23,
      ),
    ).toMatch(/^Au café, Léa regarde \d+ étoiles avec sa meilleure amie\.$/u);
    expect(
      generateText(
        settings({
          contentMode: "text",
          language: "en",
          length: 10,
          targets: ["numbers", "accents", "punctuation"],
        }),
        23,
      ),
    ).toMatch(/^The café serves \d+ meals while our friends plan adventures\.$/u);
  });
});

describe("authoritative edit reduction", () => {
  test("blocking error remains visible and must be deleted; attempts remain cumulative", () => {
    const original = player();
    const wrong = applyInput(original, insert("x"), settings(), "abc", 2000, 3000);
    expect(wrong.value).toBe("x");
    expect(wrong.errors).toBe(1);
    expect(wrong.progress).toBe(0);
    const blocked = applyInput(wrong, insert("b"), settings(), "abc", 2000, 4000);
    expect(blocked.value).toBe("x");
    expect(blocked.attempts).toBe(1);
    expect(blocked.lastInputAt).toBe(3000);
    const fixed = applyInput(
      blocked,
      [{ kind: "delete" }, { kind: "insert", text: "abc" }],
      settings(),
      "abc",
      2000,
      5000,
    );
    expect(fixed.value).toBe("abc");
    expect(fixed.finished).toBe(true);
    expect(fixed.errors).toBe(1);
    expect(fixed.corrections).toBe(1);
    expect(fixed.attempts).toBe(4);
    expect(fixed.accuracy).toBe(75);
    expect(fixed.heatmap.find((entry) => entry.key === "a")).toEqual({
      key: "a",
      attempts: 2,
      errors: 1,
    });
    expect(original.value).toBe("");
    expect(original.heatmap).toEqual([]);
    expect(wrong.heatmap[0]!.attempts).toBe(1);
    expect(fixed.sequence).toBe(3);
  });

  test("free errors allow completion but random typing loses against accurate typing", () => {
    const value = settings({ errorMode: "free" });
    const random = applyInput(player("random"), insert("xxxx"), value, "abcd", 2000, 3000);
    const accurate = applyInput(player("accurate"), insert("abcd"), value, "abcd", 2000, 12000);
    expect(random.finished).toBe(true);
    expect(random.errors).toBe(4);
    expect(random.correct).toBe(0);
    expect(random.accuracy).toBe(0);
    expect(random.progress).toBe(100);
    expect(score(random)).toBe(0);
    expect(rankPlayers([random, accurate], 2000, 12000)[0]!.playerId).toBe("accurate");
  });

  test("blocking progress is the valid prefix; free progress includes an erroneous visible suffix", () => {
    const blocking = applyInput(
      player(),
      insert("ax"),
      settings({ errorMode: "blocking" }),
      "abc",
      2000,
      3000,
    );
    const free = applyInput(
      player(),
      insert("ax"),
      settings({ errorMode: "free" }),
      "abc",
      2000,
      3000,
    );
    expect(blocking.value).toBe("ax");
    expect(free.value).toBe("ax");
    expect(blocking.progress).toBeCloseTo(100 / 3);
    expect(free.progress).toBeCloseTo(200 / 3);
    expect(updateMetrics(blocking, "abc", 2000, 4000, "blocking").progress).toBeCloseTo(100 / 3);
  });

  test("Unicode composed accents and emoji use codepoints, not UTF-16 offsets", () => {
    const text = "é😀a";
    const accented = applyInput(player(), insert("e\u0301"), settings(), text, 2000, 3000);
    expect(accented.value).toBe("é");
    expect(accented.correct).toBe(1);
    expect(accented.attempts).toBe(1);
    const emoji = applyInput(accented, insert("😀"), settings(), text, 2000, 4000);
    expect(emoji.correct).toBe(2);
    const removed = applyInput(emoji, [{ kind: "delete" }], settings(), text, 2000, 5000);
    expect(removed.value).toBe("é");
    expect(removed.correct).toBe(1);
    expect(removed.corrections).toBe(1);
    const done = applyInput(removed, insert("😀a"), settings(), text, 2000, 6000);
    expect(done.finished).toBe(true);
    expect(done.attempts).toBe(4);
    expect(done.accuracy).toBe(100);
    expect(done.heatmap.reduce((sum, entry) => sum + entry.attempts, 0)).toBe(done.attempts);
    const uncommitted = applyInput(
      player(),
      insert("e"),
      settings({ errorMode: "free" }),
      "éabc",
      2000,
      3000,
    );
    expect(
      errorCode(() =>
        applyInput(
          uncommitted,
          insert("\u0301"),
          settings({ errorMode: "free" }),
          "éabc",
          2000,
          4000,
        ),
      ),
    ).toBe("INVALID_INPUT");
    expect(uncommitted.value).toBe("e");
  });

  test("invalid whole-buffer paste is rejected atomically before any edit", () => {
    const original = player();
    for (const operations of [
      insert("the complete exercise"),
      [
        { kind: "insert", text: "a" },
        { kind: "insert", text: "12345" },
      ],
      Array.from({ length: 9 }, () => ({ kind: "insert", text: "a" })),
      [{ kind: "delete", amount: 50 }],
      insert("\n"),
      insert("\u200b"),
      insert("\ud800"),
      insert(""),
    ]) {
      expect(errorCode(() => applyInput(original, operations, settings(), "abc", 2000, 3000))).toBe(
        "INVALID_INPUT",
      );
      expect(original.attempts).toBe(0);
      expect(original.sequence).toBe(0);
    }
  });

  test("delete and retype cannot farm speed, precision or energy", () => {
    const text = "abcdefghij";
    let value = applyInput(player(), insert("abc"), settings(), text, 2000, 3000);
    const earnedEnergy = value.energy;
    const firstWpm = value.wpm;
    value = applyInput(
      value,
      [{ kind: "delete" }, { kind: "delete" }, { kind: "delete" }],
      settings(),
      text,
      2000,
      4000,
    );
    expect(value.correct).toBe(0);
    expect(value.wpm).toBe(0);
    value = applyInput(value, insert("abc"), settings(), text, 2000, 5000);
    expect(value.correct).toBe(3);
    expect(value.attempts).toBe(6);
    expect(value.energy).toBe(earnedEnergy);
    expect(value.wpm).toBeLessThan(firstWpm);
  });

  test("server time, role, connectivity and deadline are hard guards", () => {
    expect(errorCode(() => applyInput(player(), insert("a"), settings(), "abc", 2000, 1999))).toBe(
      "RACE_NOT_STARTED",
    );
    expect(
      errorCode(() =>
        applyInput(player(), insert("a"), settings({ durationSeconds: 15 }), "abc", 2000, 17000),
      ),
    ).toBe("TIME_EXPIRED");
    for (const value of [
      { ...player(), connected: false },
      { ...player(), role: "spectator" as const },
      { ...player(), status: "left" as const },
    ]) {
      expect(errorCode(() => applyInput(value, insert("a"), settings(), "abc", 2000, 3000))).toBe(
        "PLAYER_INACTIVE",
      );
    }
    const value = applyInput(player(), insert("a"), settings(), "abc", 2000, 4000);
    expect(errorCode(() => applyInput(value, insert("b"), settings(), "abc", 2000, 3000))).toBe(
      "INVALID_CLOCK",
    );
  });

  test("a finished player's timing is frozen while incomplete speed includes idle time", () => {
    const done = applyInput(player(), insert("abc"), settings(), "abc", 2000, 5000);
    expect(resultForPlayer(done, 2000, 60000).durationMs).toBe(3000);
    expect(resultForPlayer(done, 2000, 60000).wpm).toBe(12);
    const pending = applyInput(player(), insert("a"), settings(), "abc", 2000, 3000);
    expect(resultForPlayer(pending, 2000, 12000).wpm).toBeCloseTo(1.2);
    expect(updateMetrics({ ...pending, status: "left" }, "abc", 2000, 4000).stoppedAt).toBe(4000);
  });

  test("disconnection is not abandonment and AFK clocks begin at the race start", () => {
    const value = settings({ durationSeconds: null });
    const disconnected: DomainPlayer = { ...player(), connected: false, status: "disconnected" };
    expect(raceIsComplete([disconnected], value, 100000, 100001)).toBe(false);
    expect(inactivityState(disconnected, 100000, 144999)).toBe("active");
    expect(inactivityState(disconnected, 100000, 145000)).toBe("warning");
    expect(inactivityState(disconnected, 100000, 160000)).toBe("abandoned");
    expect(raceIsComplete([{ ...disconnected, status: "left" }], value, 100000, 160000)).toBe(true);
    expect(raceIsComplete([player()], settings({ durationSeconds: 15 }), 100000, 115000)).toBe(
      true,
    );
    expect(raceIsComplete([], value, 100000, 99999)).toBe(false);
  });
});

describe("bounded catch-up abilities", () => {
  const rear = (): DomainPlayer => ({
    ...player("rear"),
    progress: 30,
    energy: 100,
    correct: 30,
    attempts: 30,
    successfulAttempts: 30,
    wpm: 30,
  });
  const leader = (): DomainPlayer => ({
    ...player("leader"),
    progress: 80,
    correct: 80,
    attempts: 80,
    successfulAttempts: 80,
    wpm: 60,
  });

  test("boost helps a trailing player without changing raw metrics and is capped at six points", () => {
    const before = rear();
    const after = applyAbility(before, "boost", [before, leader()], "arcade", 3000);
    expect(score(after, "arcade") - score(after, "classic")).toBeLessThanOrEqual(6);
    for (const field of [
      "correct",
      "errors",
      "corrections",
      "wpm",
      "accuracy",
      "progress",
      "attempts",
    ] as const)
      expect(after[field]).toBe(before[field]);
    expect(after.energy).toBe(0);
    expect(after.abilityUsed).toBe(true);
    expect(errorCode(() => applyAbility(after, "shield", [after, leader()], "arcade", 4000))).toBe(
      "ABILITY_UNAVAILABLE",
    );
    expect(
      errorCode(() => applyAbility(before, "boost", [before, leader()], "classic", 3000)),
    ).toBe("ABILITY_UNAVAILABLE");
    expect(
      errorCode(() => applyAbility(leader(), "boost", [before, leader()], "arcade", 3000)),
    ).toBe("ABILITY_UNAVAILABLE");
  });

  test("shield records genuine errors, protects at most three and expires after eight seconds", () => {
    const original = {
      ...rear(),
      value: "a",
      progress: 1,
      attempts: 1,
      successfulAttempts: 1,
      correct: 1,
    };
    let protectedPlayer = applyAbility(original, "shield", [original, leader()], "arcade", 3000);
    protectedPlayer = applyInput(
      protectedPlayer,
      insert("xxxx"),
      settings({ gameMode: "arcade", errorMode: "free" }),
      "abcdefghij",
      2000,
      4000,
    );
    expect(protectedPlayer.errors).toBe(4);
    expect(protectedPlayer.protectedErrors).toBe(3);
    expect(protectedPlayer.shieldRemaining).toBe(0);
    expect(protectedPlayer.accuracy).toBe(20);
    expect(score(protectedPlayer, "arcade") - score(protectedPlayer)).toBeLessThanOrEqual(6);
    const expired = applyInput(
      applyAbility(original, "shield", [original, leader()], "arcade", 3000),
      insert("x"),
      settings({ gameMode: "arcade", errorMode: "free" }),
      "abcdefghij",
      2000,
      11000,
    );
    expect(expired.protectedErrors).toBe(0);
  });
});

describe("deterministic variable bots and stable results", () => {
  function runBot(id: string, level: RoomSettings["botLevel"]): DomainPlayer {
    const value = settings({
      botLevel: level,
      durationSeconds: null,
      contentMode: "words",
      length: 30,
    });
    const text = generateText(value, 14);
    let bot = initializePlayer(id, id, "bot", "participant", 1000);
    for (let now = 2000; now <= 300000 && !bot.finished; now += 100)
      bot = makeBotTick(bot, value, text, 2000, now);
    expect(bot.finished).toBe(true);
    expect(bot.correct).toBe(codepoints(text).length);
    expect(bot.heatmap.reduce((sum, entry) => sum + entry.errors, 0)).toBe(bot.errors);
    return bot;
  }

  test("bots obey the human error reducer and fluctuate reproducibly", () => {
    const first = runBot("bot-one", "medium");
    expect(runBot("bot-one", "medium")).toEqual(first);
    expect(runBot("bot-two", "medium").finishedAt).not.toBe(first.finishedAt);
    expect(first.errors).toBeGreaterThan(0);
    expect(first.corrections).toBeGreaterThan(0);
    expect(runBot("bot-easy", "easy").wpm).toBeLessThan(runBot("bot-hard", "hard").wpm);
  });

  test("result ties use a stable id and spectators are excluded", () => {
    const rows = rankPlayers(
      [player("z"), { ...player("observer"), role: "spectator" }, player("a")],
      2000,
      4000,
    );
    expect(rows.map((row) => row.playerId)).toEqual(["a", "z"]);
    expect(rows.map((row) => row.rank)).toEqual([1, 2]);
    expect(rows[0]!.heatmap).not.toBe(player().heatmap);
  });
});
