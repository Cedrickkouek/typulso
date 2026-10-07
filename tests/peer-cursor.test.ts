import { describe, expect, test } from "bun:test";
import { peerCursorIndex } from "../lib/client/peer-cursor";

describe("peer cursor projection", () => {
  test("reflects backward progress when a player deletes input", () => {
    expect(peerCursorIndex("abcdefghij", 60)).toBe(6);
    expect(peerCursorIndex("abcdefghij", 30)).toBe(3);
  });
  test("maps server code points to visible emoji and combined graphemes", () => {
    expect(peerCursorIndex("a👩‍💻b", 80)).toBe(2);
    expect(peerCursorIndex("e\u0301ab", 100 / 3)).toBe(1);
    expect(peerCursorIndex("a👩‍💻b", 100)).toBe(3);
  });
  test("handles empty text and bounds invalid progress", () => {
    expect(peerCursorIndex("", 100)).toBe(0);
    expect(peerCursorIndex("abc", -5)).toBe(0);
    expect(peerCursorIndex("abc", 120)).toBe(3);
    expect(peerCursorIndex("abc", NaN)).toBe(0);
  });
});
