"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Keyboard } from "lucide-react";
import { createTypingEngine, graphemes, type TypingState } from "@/lib/client/typing-engine";
import { playFeedback } from "@/lib/client/preferences";
import type { InputOperation } from "@/types/game";
import { useTranslation } from "./providers";

export function TypingZone({
  text,
  blocking,
  disabled = false,
  startTime,
  authoritativeValue,
  authoritativeSequence,
  authoritativeRevision,
  onOperations,
  onMetrics,
}: {
  text: string;
  blocking: boolean;
  disabled?: boolean;
  startTime?: number;
  authoritativeValue?: string;
  authoritativeSequence?: number;
  authoritativeRevision?: number;
  onOperations?: (operations: InputOperation[], revision: number) => void;
  onMetrics?: (metrics: TypingState) => void;
}) {
  const { t, sounds } = useTranslation();
  const [engine] = useState(() =>
    createTypingEngine(text, blocking, startTime, authoritativeValue),
  );
  const metrics = useSyncExternalStore(
    engine.subscribe,
    engine.getSnapshot,
    engine.getServerSnapshot,
  );
  const [feedback, setFeedback] = useState("");
  const [composition, setComposition] = useState<string | null>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const sample = useMemo(() => graphemes(text), [text]);
  const typed = graphemes(metrics.value);
  const words = useMemo(() => {
    let index = 0;
    return (text.match(/\S+\s*|\s+/g) || []).map((word) =>
      graphemes(word).map((char) => ({ char, index: index++ })),
    );
  }, [text]);
  useEffect(() => {
    const timer = setInterval(() => engine.tick(Date.now()), 250);
    return () => clearInterval(timer);
  }, [engine]);
  useEffect(() => {
    if (authoritativeValue !== undefined) {
      engine.reconcile(
        authoritativeValue,
        authoritativeSequence ?? 0,
        authoritativeRevision ?? 0,
        Date.now(),
      );
    }
  }, [authoritativeValue, authoritativeSequence, authoritativeRevision, engine]);
  useEffect(() => {
    onMetrics?.(metrics);
  }, [metrics, onMetrics]);
  function update(value: string) {
    const operations = engine.update(value, Date.now());
    if (operations.length) {
      onOperations?.(operations, engine.getSnapshot().revision);
      if (operations.some((operation) => operation.kind === "insert")) playFeedback(sounds);
    }
    if (
      blocking &&
      graphemes(engine.getSnapshot().value).some((char, index) => char !== sample[index])
    )
      setFeedback(
        t(
          "Corrige la touche soulignée avant de poursuivre.",
          "Correct the underlined key before continuing.",
        ),
      );
    else setFeedback("");
  }
  function paste(event: React.ClipboardEvent) {
    event.preventDefault();
    setFeedback(
      t("Le collage est désactivé pendant l’exercice.", "Paste is disabled during the exercise."),
    );
  }
  return (
    <div className="race">
      <div className="typing-text" aria-hidden="true">
        {words.map((word, wordIndex) => (
          <span className="typing-word" key={wordIndex}>
            {word.map(({ char, index }) => (
              <span
                key={index}
                className={`${index < typed.length ? (typed[index] === char ? "correct" : "error") : ""} ${index === typed.length ? "cursor" : ""} ${typed.length >= sample.length && index === sample.length - 1 ? "end-cursor" : ""}`}
              >
                {char}
              </span>
            ))}
          </span>
        ))}
      </div>
      <label className="visually-hidden" htmlFor="typing-input">
        {t("Recopie le texte de l’exercice", "Type the exercise text")}
      </label>
      <div className="typing-field">
        <textarea
          ref={input}
          id="typing-input"
          className="typing-input"
          value={composition ?? metrics.value}
          disabled={disabled || metrics.finished}
          onChange={(event) => {
            if (composition !== null) setComposition(event.target.value);
            else update(event.target.value);
          }}
          onCompositionStart={(event) => setComposition(event.currentTarget.value)}
          onCompositionEnd={(event) => {
            setComposition(null);
            update(event.currentTarget.value);
          }}
          onPaste={paste}
          onDrop={(event) => event.preventDefault()}
          onKeyDown={(event) => {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "v") {
              event.preventDefault();
              setFeedback(
                t(
                  "Le collage est désactivé pendant l’exercice.",
                  "Paste is disabled during the exercise.",
                ),
              );
            }
          }}
          placeholder={
            disabled
              ? t("La saisie est suspendue", "Typing is paused")
              : t("Clique ici, puis trouve ton rythme…", "Click here, then find your rhythm…")
          }
          aria-describedby="typing-help typing-feedback"
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          autoComplete="off"
        />
        <Keyboard className="icon" size={18} />
      </div>
      <p className="small typing-instruction" id="typing-help">
        {t("Texte à recopier :", "Text to type:")} <span className="visually-hidden">{text}</span>
        {t(
          "Le texte reste stable. Les erreurs sont soulignées.",
          "The text stays stable. Mistakes are underlined.",
        )}
      </p>
      <p className="small" id="typing-feedback" role="status" aria-live="polite">
        {feedback ||
          (metrics.finished ? t("Texte terminé. Bien joué !", "Text complete. Well played!") : "")}
      </p>
    </div>
  );
}
