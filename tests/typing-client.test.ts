import { describe, expect, test } from "bun:test";
import { createTypingEngine, graphemes } from "../lib/client/typing-engine";
describe("Client typing state", () => {
  test("normalizes a composed accent before emitting input", () => {
    const engine = createTypingEngine("été", false);
    expect(engine.update("e\u0301", 1000)).toEqual([{ kind: "insert", text: "é" }]);
    expect(engine.getSnapshot().value).toBe("é");
    expect(engine.getSnapshot().errors).toBe(0);
  });
  test("blocking mode keeps the mistake visible and requires a correction", () => {
    const engine = createTypingEngine("Bonjour", true);
    engine.update("BonX", 1000);
    expect(engine.getSnapshot().progress).toBeCloseTo((3 / 7) * 100);
    expect(engine.update("BonXo", 1100)).toEqual([]);
    expect(engine.getSnapshot().value).toBe("BonX");
    expect(engine.update("Bon", 1200)).toEqual([{ kind: "delete" }]);
    engine.update("Bonj", 1300);
    expect(engine.getSnapshot().value).toBe("Bonj");
    expect(engine.getSnapshot().errors).toBe(1);
    expect(engine.getSnapshot().corrections).toBe(1);
  });
  test("a finished sample stops its elapsed time", () => {
    const engine = createTypingEngine("ab", false);
    engine.update("a", 1000);
    engine.update("ab", 2000);
    const finished = engine.getSnapshot();
    engine.tick(5000);
    expect(engine.getSnapshot()).toBe(finished);
    expect(finished.finished).toBe(true);
    expect(finished.wpm).toBe(24);
  });
  test("server synchronization restores the confirmed input", () => {
    const engine = createTypingEngine("abc", false, 1000);
    engine.update("ab", 2000);
    engine.sync("a", 2500);
    expect(engine.getSnapshot().value).toBe("a");
    expect(engine.getSnapshot().progress).toBeCloseTo(100 / 3);
  });
  test("emoji and NFC accents occupy one visual grapheme", () => {
    expect(graphemes("e\u0301👩‍💻")).toEqual(["é", "👩‍💻"]);
  });
});

describe("Authoritative input reconciliation", () => {
  test("a delayed ack cannot overwrite a correct prefix typed after its render", () => {
    const text = "Au cafe Lea regarde plusieurs etoiles dans le ciel.";
    const engine = createTypingEngine(text, true, 1000);
    engine.update("Au", 1100);
    const acknowledgedRevision = engine.getSnapshot().revision;
    const deferredEffect = () => engine.reconcile("Au", 1, acknowledgedRevision, 1400);
    engine.update("Au c", 1300);
    expect(deferredEffect()).toBe(false);
    expect(engine.getSnapshot().value).toBe("Au c");
    engine.update("Au cafe Lea regarde", 1500);
    expect(engine.getSnapshot().value).toBe("Au cafe Lea regarde");
    expect(engine.getSnapshot().accuracy).toBe(100);
    expect(engine.getSnapshot().errors).toBe(0);
    expect(engine.reconcile("Au cafe Lea regarde", 2, engine.getSnapshot().revision, 1600)).toBe(
      true,
    );
  });

  test("an edit split across batches stays local until its last operation is acknowledged", () => {
    const engine = createTypingEngine("Au cafe Lea regarde plusieurs etoiles.", true);
    const operations = engine.update("Au cafe Lea regarde", 1000);
    expect(operations.length).toBeGreaterThan(8);
    expect(engine.reconcile("Au cafe ", 1, 8, 1200)).toBe(false);
    expect(engine.getSnapshot().value).toBe("Au cafe Lea regarde");
    expect(engine.reconcile("Au cafe Lea regar", 2, 16, 1400)).toBe(false);
    expect(engine.reconcile("Au cafe Lea regarde", 3, operations.length, 1600)).toBe(true);
  });

  test("fully acknowledged edits accept correction but older sequences cannot rewind them", () => {
    const engine = createTypingEngine("abcdef", false);
    engine.update("abc", 1000);
    const revision = engine.getSnapshot().revision;
    expect(engine.reconcile("ab", 2, revision, 1200)).toBe(true);
    expect(engine.reconcile("a", 1, revision, 1300)).toBe(false);
    expect(engine.getSnapshot().value).toBe("ab");
    expect(engine.reconcile("ab", 2, revision, 1400)).toBe(true);
  });

  test("a deferred sequence can be retried once its local operations are acknowledged", () => {
    const engine = createTypingEngine("abcdef", false);
    engine.update("abc", 1000);
    expect(engine.reconcile("ab", 2, 2, 1200)).toBe(false);
    expect(engine.reconcile("abc", 2, 3, 1300)).toBe(true);
    const revision = engine.getSnapshot().revision;
    expect(engine.update("abc", 1400)).toEqual([]);
    expect(engine.getSnapshot().revision).toBe(revision);
  });

  test("a reconnected editor starts from confirmed input with a fresh local revision", () => {
    const engine = createTypingEngine("abcdef", false, 1000, "abc");
    expect(engine.getSnapshot().value).toBe("abc");
    expect(engine.getSnapshot().revision).toBe(0);
    expect(engine.update("abcd", 1400)).toEqual([{ kind: "insert", text: "d" }]);
    expect(engine.reconcile("abcd", 9, 1, 1600)).toBe(true);
  });
});
