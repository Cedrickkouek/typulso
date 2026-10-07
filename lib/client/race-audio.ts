"use client";
export type RaceSound =
  | "start"
  | "key"
  | "error"
  | "streak"
  | "energy"
  | "pass"
  | "boost"
  | "shield"
  | "trap"
  | "counter"
  | "finish"
  | "record";
type Cue = RaceSound | "countdown" | "go";
const notes: Record<Cue, number[][]> = {
  start: [
    [440, 0, 0.09],
    [440, 1, 0.09],
    [440, 2, 0.09],
    [660, 3, 0.13],
    [880, 3.12, 0.18],
  ],
  countdown: [[440, 0, 0.09]],
  go: [
    [660, 0, 0.13],
    [880, 0.12, 0.18],
  ],
  key: [[520, 0, 0.03]],
  error: [[180, 0, 0.08]],
  streak: [
    [523, 0, 0.08],
    [659, 0.09, 0.08],
    [784, 0.18, 0.13],
  ],
  energy: [
    [620, 0, 0.12],
    [930, 0.14, 0.15],
  ],
  pass: [
    [440, 0, 0.07],
    [660, 0.07, 0.08],
    [880, 0.15, 0.1],
  ],
  boost: [
    [320, 0, 0.06],
    [640, 0.06, 0.08],
    [960, 0.14, 0.14],
  ],
  shield: [
    [880, 0, 0.14],
    [1174, 0.08, 0.2],
  ],
  trap: [
    [240, 0, 0.08],
    [360, 0.12, 0.08],
    [240, 0.24, 0.1],
  ],
  counter: [
    [200, 0, 0.06],
    [784, 0.08, 0.12],
    [1046, 0.2, 0.15],
  ],
  finish: [
    [523, 0, 0.12],
    [659, 0.13, 0.12],
    [784, 0.26, 0.13],
    [1046, 0.4, 0.3],
  ],
  record: [
    [659, 0, 0.15],
    [880, 0.15, 0.15],
    [1318, 0.3, 0.3],
  ],
};
let config = { typing: false, events: false, volume: 35 };
let context: AudioContext | null = null,
  master: GainNode | null = null,
  unlocked = false,
  installed = false,
  generation = 0;
const voices = new Set<{ oscillator: OscillatorNode; channel: "typing" | "events" }>();
const last = new Map<Cue, number>();
function silence(channel?: "typing" | "events") {
  generation++;
  for (const voice of voices)
    if (!channel || voice.channel === channel) {
      try {
        voice.oscillator.stop();
      } catch {}
      voices.delete(voice);
    }
}
export function configureRaceAudio(value: typeof config) {
  if (config.typing && !value.typing) silence("typing");
  if (config.events && !value.events) silence("events");
  config = value;
  if (context && master)
    master.gain.setValueAtTime((value.volume / 100) * 0.2, context.currentTime);
}
export function installRaceAudio() {
  if (installed) return () => {};
  installed = true;
  const gesture = () => {
    if (config.typing || config.events) void unlockRaceAudio();
  };
  const visibility = () => {
    if (document.hidden) {
      silence();
      if (context) void context.suspend();
    }
  };
  document.addEventListener("pointerdown", gesture);
  document.addEventListener("keydown", gesture);
  document.addEventListener("visibilitychange", visibility);
  return () => {
    installed = false;
    silence();
    document.removeEventListener("pointerdown", gesture);
    document.removeEventListener("keydown", gesture);
    document.removeEventListener("visibilitychange", visibility);
  };
}
async function unlockRaceAudio() {
  try {
    if (!context) {
      context = new AudioContext();
      master = context.createGain();
      master.connect(context.destination);
    }
    await context.resume();
    unlocked = context.state === "running";
    return unlocked;
  } catch {
    return false;
  }
}
export async function playRaceSound(name: Cue, preview = false): Promise<boolean> {
  if (typeof window === "undefined" || document.hidden) return false;
  const channel: "typing" | "events" = name === "key" || name === "error" ? "typing" : "events";
  if (!preview && (!config[channel] || !unlocked || config.volume === 0)) return false;
  const now = Date.now(),
    gap = name === "key" ? 83 : name === "error" ? 500 : name === "pass" ? 4000 : 0;
  if (!preview && now - (last.get(name) ?? 0) < gap) return false;
  last.set(name, now);
  if (preview) silence();
  const token = generation;
  if (!(await unlockRaceAudio()) || token !== generation || document.hidden || !context || !master)
    return false;
  master.gain.setValueAtTime((config.volume / 100) * 0.2, context.currentTime);
  // A small voice budget protects the typing path from a burst of announcements.
  while (voices.size + notes[name].length > 8 && voices.size) {
    const first = voices.values().next().value!;
    try {
      first.oscillator.stop();
    } catch {}
    voices.delete(first);
  }
  for (const [hz, offset, duration] of notes[name]) {
    const o = context.createOscillator(),
      gain = context.createGain(),
      at = context.currentTime + offset;
    o.type = name === "boost" ? "triangle" : "sine";
    o.frequency.setValueAtTime(hz, at);
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(name === "key" ? 0.2 : 0.6, at + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
    o.connect(gain);
    gain.connect(master);
    const voice = { oscillator: o, channel };
    voices.add(voice);
    o.onended = () => {
      voices.delete(voice);
      o.disconnect();
      gain.disconnect();
    };
    o.start(at);
    o.stop(at + duration + 0.02);
  }
  return true;
}
