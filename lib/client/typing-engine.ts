import type { InputOperation, KeyMetric } from "@/types/game";

const segmenter = new Intl.Segmenter("fr", { granularity: "grapheme" });
export const graphemes = (text: string) =>
  Array.from(segmenter.segment(text.normalize("NFC")), (item) => item.segment);
export interface TypingState {
  value: string;
  revision: number;
  correct: number;
  errors: number;
  corrections: number;
  attempts: number;
  progress: number;
  accuracy: number;
  wpm: number;
  elapsedMs: number;
  finished: boolean;
  heatmap: KeyMetric[];
}
export function createTypingEngine(
  text: string,
  blocking: boolean,
  startTime?: number,
  initialValue = "",
) {
  const sample = graphemes(text);
  let startedAt = startTime || 0;
  let state: TypingState = {
    value: initialValue.normalize("NFC"),
    revision: 0,
    correct: 0,
    errors: 0,
    corrections: 0,
    attempts: 0,
    progress: 0,
    accuracy: 100,
    wpm: 0,
    elapsedMs: 0,
    finished: false,
    heatmap: [],
  };
  let serverSequence = -1;
  const listeners = new Set<() => void>();
  const keys = new Map<string, KeyMetric>();
  const publish = () => listeners.forEach((listener) => listener());
  function measure(now: number) {
    const chars = graphemes(state.value);
    let firstError = -1,
      correct = 0;
    chars.forEach((char, index) => {
      if (char === sample[index]) correct++;
      else if (firstError === -1) firstError = index;
    });
    const length = blocking && firstError !== -1 ? firstError : chars.length;
    const elapsedMs = startedAt ? Math.max(0, now - startedAt) : 0;
    state = {
      ...state,
      correct,
      elapsedMs,
      progress: sample.length ? Math.min(100, (length / sample.length) * 100) : 0,
      accuracy: state.attempts ? ((state.attempts - state.errors) / state.attempts) * 100 : 100,
      wpm: elapsedMs > 0 ? correct / 5 / (elapsedMs / 60000) : 0,
      finished: sample.length > 0 && length >= sample.length,
      heatmap: Array.from(keys.values()).map((metric) => ({ ...metric })),
    };
  }
  measure(startTime || 0);
  const initial = state;
  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: () => state,
    getServerSnapshot: () => initial,
    tick(now: number) {
      if (startedAt && !state.finished) {
        measure(now);
        publish();
      }
    },
    sync(value: string, now: number) {
      state = { ...state, value: value.normalize("NFC") };
      measure(now);
      publish();
    },
    reconcile(value: string, sequence: number, acknowledgedRevision: number, now: number) {
      // An effect may run after another keystroke. Never rewind unacknowledged local edits.
      // Equality is allowed so a snapshot initially deferred can be retried after its ack.
      if (sequence < serverSequence || acknowledgedRevision < state.revision) return false;
      serverSequence = sequence;
      state = { ...state, value: value.normalize("NFC") };
      measure(now);
      publish();
      return true;
    },
    update(value: string, now: number): InputOperation[] {
      if (state.finished) return [];
      const before = graphemes(state.value);
      let next = graphemes(value);
      if (blocking) {
        const errorIndex = before.findIndex((char, index) => char !== sample[index]);
        if (errorIndex !== -1 && next.length > before.length) return [];
        const nextError = next.findIndex((char, index) => char !== sample[index]);
        if (nextError !== -1) next = next.slice(0, nextError + 1);
      }
      next = next.slice(0, sample.length);
      let prefix = 0;
      while (prefix < before.length && prefix < next.length && before[prefix] === next[prefix])
        prefix++;
      // The wire protocol deletes one NFC codepoint; the visual editor edits graphemes.
      const operations: InputOperation[] = before
        .slice(prefix)
        .flatMap((char) => Array.from(char).map(() => ({ kind: "delete" as const })));
      let errors = 0;
      next.slice(prefix).forEach((char, relative) => {
        const index = prefix + relative;
        operations.push({ kind: "insert", text: char });
        const key = sample[index] || char;
        const metric = keys.get(key) || { key, attempts: 0, errors: 0 };
        metric.attempts++;
        if (char !== sample[index]) {
          metric.errors++;
          errors++;
        }
        keys.set(key, metric);
      });
      if (!operations.length) return [];
      if (!startedAt && next.length) startedAt = now;
      state = {
        ...state,
        value: next.join(""),
        revision: state.revision + operations.length,
        errors: state.errors + errors,
        corrections: state.corrections + before.length - prefix,
        attempts: state.attempts + next.length - prefix,
      };
      measure(now);
      publish();
      return operations;
    },
  };
}
