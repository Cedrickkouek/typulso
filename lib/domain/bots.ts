import type { InputOperation, RoomSettings } from "../../types/game";
import { applyInput, type DomainPlayer } from "./engine";
import { codepoints } from "./settings";

const profiles = {
  easy: { wpm: 25, errorChance: 0.065 },
  medium: { wpm: 45, errorChance: 0.04 },
  hard: { wpm: 75, errorChance: 0.025 },
} as const;

export interface BotPlan {
  operations: InputOperation[];
  nextAt: number;
  randomState: number;
}

/** Pure scheduling: no timer or Math.random, bounded catch-up, same edits as human participants. */
export function nextBotOperations(
  player: DomainPlayer,
  settings: RoomSettings,
  text: string,
  startsAt: number,
  now: number,
): BotPlan {
  let state = player.botRandomState;
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
  let nextAt = player.botNextAt;
  const operations: InputOperation[] = [];
  if (
    player.kind !== "bot" ||
    player.role !== "participant" ||
    !player.connected ||
    player.finished ||
    player.status !== "active" ||
    now < startsAt
  ) {
    return { operations, nextAt, randomState: state };
  }
  if (nextAt <= startsAt) nextAt = startsAt + 180 + random() * 400;
  const profile = profiles[settings.botLevel];
  const target = codepoints(text);
  const value = codepoints(player.value);
  while (nextAt <= now && operations.length < 8 && value.length < target.length) {
    const wrongAt = value.findIndex((character, index) => character !== target[index]);
    if (wrongAt >= 0 && (settings.errorMode === "blocking" || random() < 0.8)) {
      operations.push({ kind: "delete" });
      value.pop();
    } else {
      const expected = target[value.length]!;
      const shouldErr = random() < profile.errorChance;
      const character = shouldErr ? (expected === "x" ? "z" : "x") : expected;
      operations.push({ kind: "insert", text: character });
      value.push(character);
    }
    nextAt += (60000 / (profile.wpm * 5)) * (0.65 + random() * 0.7);
    if (random() < 0.025) nextAt += 400 + random() * 800;
  }
  // A delayed process must not produce a giant, implausible backlog on its next tick.
  if (operations.length === 8 && nextAt < now) nextAt = now + 60000 / (profile.wpm * 5);
  return { operations, nextAt, randomState: state };
}

export function makeBotTick(
  player: DomainPlayer,
  settings: RoomSettings,
  text: string,
  startsAt: number,
  now: number,
): DomainPlayer {
  const plan = nextBotOperations(player, settings, text, startsAt, now);
  const scheduled = { ...player, botNextAt: plan.nextAt, botRandomState: plan.randomState };
  if (
    !plan.operations.length ||
    (settings.durationSeconds !== null && now >= startsAt + settings.durationSeconds * 1000)
  )
    return scheduled;
  return applyInput(scheduled, plan.operations, settings, text, startsAt, now);
}
