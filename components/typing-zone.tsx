"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { createTypingEngine, graphemes, type TypingState } from "@/lib/client/typing-engine";
import { playFeedback } from "@/lib/client/preferences";
import type { InputOperation, PlayerSnapshot } from "@/types/game";
import { useTranslation } from "./providers";
import { TypingPassage } from "./typing-passage";

export function TypingZone({
  text,
  players,
  selfId,
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
  players?: PlayerSnapshot[];
  selfId?: string;
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
  const canType = !disabled && !metrics.finished;
  useEffect(() => {
    if (canType) input.current?.focus({ preventScroll: true });
  }, [canType]);
  const sample = useMemo(() => graphemes(text), [text]);
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
  const update = useCallback(
    (value: string) => {
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
    },
    [blocking, engine, onOperations, sample, sounds, t],
  );
  useEffect(() => {
    if (!canType) return;
    function resumeTyping(event: KeyboardEvent) {
      const field = input.current;
      if (
        !field ||
        document.activeElement === field ||
        event.defaultPrevented ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.isComposing ||
        (event.key.length !== 1 && event.key !== "Backspace")
      )
        return;
      const target = event.target instanceof Element ? event.target : null;
      // Leave controls, dialogs and IME input in charge of their own keyboard events.
      if (
        target?.closest(
          'input, textarea, select, button, a, [contenteditable=""], [contenteditable="true"], [role="textbox"], [role="combobox"], [role="listbox"], [role="menu"], [role="slider"], [role="dialog"], dialog',
        ) ||
        document.querySelector(
          'dialog[open], [role="dialog"][aria-modal="true"], [popover]:popover-open',
        )
      )
        return;
      event.preventDefault();
      field.focus({ preventScroll: true });
      const current = engine.getSnapshot().value;
      field.setSelectionRange(current.length, current.length);
      update(
        event.key === "Backspace" ? graphemes(current).slice(0, -1).join("") : current + event.key,
      );
    }
    document.addEventListener("keydown", resumeTyping);
    return () => document.removeEventListener("keydown", resumeTyping);
  }, [canType, engine, update]);
  function paste(event: React.ClipboardEvent) {
    event.preventDefault();
    setFeedback(
      t("Le collage est désactivé pendant l’exercice.", "Paste is disabled during the exercise."),
    );
  }
  return (
    <div className="race">
      <TypingPassage
        text={text}
        value={metrics.value}
        players={players}
        selfId={selfId}
        onPointerDown={(event) => {
          if (canType) {
            event.preventDefault();
            input.current?.focus({ preventScroll: true });
          }
        }}
      />
      <label className="visually-hidden" htmlFor="typing-input">
        {t("Recopie le texte de l’exercice", "Type the exercise text")}
      </label>
      <textarea
        ref={input}
        id="typing-input"
        className="visually-hidden typing-capture"
        value={composition ?? metrics.value}
        disabled={!canType}
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
            : t("Commence à écrire, trouve ton rythme…", "Start typing, find your rhythm…")
        }
        aria-describedby="typing-help typing-feedback"
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
        autoComplete="off"
      />
      <p className="small typing-instruction" id="typing-help">
        {t("Texte à recopier :", "Text to type:")} <span className="visually-hidden">{text}</span>
        {t(
          "Écris directement pour continuer. Le texte reste stable et les erreurs sont soulignées.",
          "Type directly to continue. The text stays stable and mistakes are underlined.",
        )}
      </p>
      <p className="small" id="typing-feedback" role="status" aria-live="polite">
        {feedback ||
          (metrics.finished ? t("Texte terminé. Bien joué !", "Text complete. Well played!") : "")}
      </p>
    </div>
  );
}
