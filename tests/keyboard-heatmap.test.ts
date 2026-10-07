import { describe, expect, test } from "bun:test";
import { heatLevel, keyboardHeatmap } from "../lib/client/keyboard-heatmap";

describe("keyboard heatmap", () => {
  test("combines upper/lower case with weighted attempt counts", () => {
    const result = keyboardHeatmap(
      [
        { key: "a", attempts: 20, errors: 1 },
        { key: "A", attempts: 2, errors: 1 },
      ],
      "QWERTY",
    );
    expect(result.rows.flat().find((key) => key.characters === "a")).toEqual({
      characters: "a",
      attempts: 22,
      errors: 2,
    });
    expect(result.other).toEqual([]);
  });
  test("maps accented number keys in AZERTY without discarding other characters", () => {
    const metrics = [
      { key: "é", attempts: 3, errors: 1 },
      { key: "2", attempts: 2, errors: 0 },
      { key: "🙂", attempts: 1, errors: 0 },
    ];
    const azerty = keyboardHeatmap(metrics, "AZERTY");
    expect(azerty.rows[0].find((key) => key.characters === "é2")?.attempts).toBe(5);
    expect(azerty.other.map((key) => key.key)).toEqual(["🙂"]);
    expect(keyboardHeatmap(metrics, "QWERTY").other.map((key) => key.key)).toEqual(["é", "🙂"]);
  });
  test("empty metrics retain a full keyboard with no fabricated attempts", () => {
    const result = keyboardHeatmap([], "AZERTY");
    expect(result.rows).toHaveLength(5);
    expect(result.rows.flat().every((key) => key.attempts === 0 && key.errors === 0)).toBe(true);
  });
});

test("filter categories agree with displayed rounded percentages and exclude unused keys", () => {
  expect(heatLevel(0, 0)).toBe("unplayed");
  expect(heatLevel(100, 0)).toBe("none");
  expect(heatLevel(100, 4)).toBe("1");
  expect(heatLevel(1000, 46)).toBe("2");
  expect(heatLevel(100, 14)).toBe("2");
  expect(heatLevel(1000, 146)).toBe("3");
  expect(heatLevel(100, 50)).toBe("3");
});
