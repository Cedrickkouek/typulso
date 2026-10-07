import type { KeyMetric } from "@/types/game";

export type KeyboardLayout = "AZERTY" | "QWERTY";

// Reference layouts: shifted characters share their physical key.
const layouts: Record<KeyboardLayout, string[][]> = {
  QWERTY: [
    ["`~", "1!", "2@", "3#", "4$", "5%", "6^", "7&", "8*", "9(", "0)", "-_", "=+"],
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[{", "]}", "\\|"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";:", "'\""],
    ["z", "x", "c", "v", "b", "n", "m", ",<", ".>", "/?"],
    [" "],
  ],
  AZERTY: [
    ["²", "&1", "é2", '\"3', "'4", "(5", "-6", "è7", "_8", "ç9", "à0", ")°", "=+"],
    ["a", "z", "e", "r", "t", "y", "u", "i", "o", "p", "^¨", "$£"],
    ["q", "s", "d", "f", "g", "h", "j", "k", "l", "m", "ù%", "*µ"],
    ["<>", "w", "x", "c", "v", "b", "n", ",?", ";.", ":/", "!§"],
    [" "],
  ],
};

export function keyboardHeatmap(metrics: KeyMetric[], layout: KeyboardLayout) {
  const remaining = new Set(metrics);
  const rows = layouts[layout].map((row) =>
    row.map((characters) => {
      const matching = metrics.filter((metric) =>
        [...characters].includes(metric.key.normalize("NFC").toLowerCase()),
      );
      matching.forEach((metric) => remaining.delete(metric));
      return {
        characters,
        attempts: matching.reduce((sum, metric) => sum + metric.attempts, 0),
        errors: matching.reduce((sum, metric) => sum + metric.errors, 0),
      };
    }),
  );
  return { rows, other: [...remaining] };
}

export type HeatLevel = "none" | "1" | "2" | "3" | "unplayed";

export function heatLevel(attempts: number, errors: number): HeatLevel {
  if (!attempts) return "unplayed";
  const percent = Math.round((errors / attempts) * 100);
  return percent === 0 ? "none" : percent < 5 ? "1" : percent < 15 ? "2" : "3";
}
