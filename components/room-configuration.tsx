"use client";
import { useState } from "react";
import type { RoomSettings } from "@/types/game";
import { api } from "@/lib/client/api";
import { useTranslation } from "./providers";
import { ErrorNotice, Field } from "./ui";

export function RoomConfiguration({
  settings: initial,
  onSave,
  busy,
}: {
  settings: RoomSettings;
  onSave: (settings: RoomSettings) => Promise<void>;
  busy: boolean;
}) {
  const { t } = useTranslation();
  const [settings, setSettings] = useState(initial);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  function set<K extends keyof RoomSettings>(key: K, value: RoomSettings[K]) {
    setSettings((previous) => ({ ...previous, [key]: value }));
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setChecking(true);
    setError(null);
    try {
      await api("/api/content/preview", { settings });
      await onSave(settings);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setChecking(false);
    }
  }
  return (
    <form onSubmit={submit}>
      <p className="small mb-5">
        {t(
          "Modifier les règles remet les participants en attente de validation. Changer l’accès révoque les invitations non utilisées.",
          "Changing rules resets participant readiness. Changing access revokes unused invitations.",
        )}
      </p>
      <Field id="edit-name" label={t("Nom", "Name")}>
        <input
          id="edit-name"
          value={settings.name}
          onChange={(event) => set("name", event.target.value)}
          maxLength={60}
          minLength={2}
          required
        />
      </Field>
      <div className="field-row">
        <Field id="edit-visibility" label={t("Accès", "Access")}>
          <select
            id="edit-visibility"
            value={settings.visibility}
            onChange={(event) =>
              set("visibility", event.target.value as RoomSettings["visibility"])
            }
          >
            <option value="public">{t("Public", "Public")}</option>
            <option value="code">{t("Par code", "By code")}</option>
            <option value="private">{t("Privé", "Private")}</option>
          </select>
        </Field>
        <Field id="edit-language" label={t("Langue du texte", "Text language")}>
          <select
            id="edit-language"
            value={settings.language}
            onChange={(event) => set("language", event.target.value as RoomSettings["language"])}
          >
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
        </Field>
      </div>
      <div className="field-row">
        <Field id="edit-mode" label={t("Mode", "Mode")}>
          <select
            id="edit-mode"
            value={settings.gameMode}
            onChange={(event) => set("gameMode", event.target.value as RoomSettings["gameMode"])}
          >
            <option value="classic">{t("Classique", "Classic")}</option>
            <option value="arcade">Arcade</option>
          </select>
        </Field>
        <Field id="edit-errors" label={t("Erreurs", "Errors")}>
          <select
            id="edit-errors"
            value={settings.errorMode}
            onChange={(event) => set("errorMode", event.target.value as RoomSettings["errorMode"])}
          >
            <option value="free">{t("Libre", "Free")}</option>
            <option value="blocking">{t("Bloquantes", "Blocking")}</option>
          </select>
        </Field>
      </div>
      <div className="field-row">
        <Field id="edit-content" label={t("Contenu", "Content")}>
          <select
            id="edit-content"
            value={settings.contentMode}
            onChange={(event) =>
              set("contentMode", event.target.value as RoomSettings["contentMode"])
            }
          >
            <option value="text">{t("Texte", "Text")}</option>
            <option value="words">{t("Mots", "Words")}</option>
            <option value="custom">{t("Personnalisé", "Custom")}</option>
          </select>
        </Field>
        <Field id="edit-duration" label={t("Durée maximale (secondes)", "Time limit (seconds)")}>
          <select
            id="edit-duration"
            value={settings.durationSeconds ?? "none"}
            onChange={(event) =>
              set(
                "durationSeconds",
                event.target.value === "none" ? null : Number(event.target.value),
              )
            }
          >
            <option value="none">{t("Fin du texte", "Text completion")}</option>
            {[30, 60, 120, 180, 300, 600].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </Field>
      </div>
      {settings.contentMode === "custom" ? (
        <Field id="edit-custom" label={t("Texte personnalisé", "Custom text")}>
          <textarea
            id="edit-custom"
            value={settings.customText}
            onChange={(event) => set("customText", event.target.value)}
            maxLength={6000}
            required
          />
        </Field>
      ) : (
        <div className="field-row">
          <Field id="edit-length" label={t("Nombre de mots", "Word count")}>
            <input
              id="edit-length"
              type="number"
              value={settings.length}
              min={10}
              max={200}
              onChange={(event) => set("length", Number(event.target.value))}
            />
          </Field>
          <Field id="edit-topic" label={t("Thématique", "Topic")}>
            <select
              id="edit-topic"
              value={settings.topic}
              onChange={(event) => set("topic", event.target.value as RoomSettings["topic"])}
            >
              <option value="everyday">{t("Quotidien", "Everyday")}</option>
              <option value="science">Science</option>
              <option value="gaming">{t("Jeu vidéo", "Gaming")}</option>
            </select>
          </Field>
        </div>
      )}
      <div className="field-row">
        <Field id="edit-bots" label={t("Adversaires automatisés", "Automated opponents")}>
          <input
            id="edit-bots"
            type="number"
            value={settings.botCount}
            min={0}
            max={29}
            onChange={(event) => set("botCount", Number(event.target.value))}
          />
        </Field>
        <Field id="edit-level" label={t("Niveau", "Level")}>
          <select
            id="edit-level"
            value={settings.botLevel}
            onChange={(event) => set("botLevel", event.target.value as RoomSettings["botLevel"])}
          >
            <option value="easy">{t("Débutant", "Easy")}</option>
            <option value="medium">{t("Intermédiaire", "Medium")}</option>
            <option value="hard">{t("Rapide", "Hard")}</option>
          </select>
        </Field>
      </div>
      <Field id="edit-excluded" label={t("Caractères exclus", "Excluded characters")}>
        <input
          id="edit-excluded"
          value={settings.excludedCharacters}
          maxLength={64}
          onChange={(event) => set("excludedCharacters", event.target.value)}
        />
      </Field>
      <fieldset>
        <legend className="small">{t("Touches à travailler", "Keys to practice")}</legend>
        <div className="check-group">
          {(["accents", "numbers", "punctuation"] as const).map((target) => (
            <label key={target}>
              <input
                type="checkbox"
                checked={settings.targets.includes(target)}
                onChange={(event) =>
                  set(
                    "targets",
                    event.target.checked
                      ? [...settings.targets, target]
                      : settings.targets.filter((value) => value !== target),
                  )
                }
              />
              {target === "accents"
                ? t("Accents", "Accents")
                : target === "numbers"
                  ? t("Chiffres", "Numbers")
                  : t("Ponctuation", "Punctuation")}
            </label>
          ))}
        </div>
      </fieldset>
      <Field id="edit-target" label={t("Objectif MPM (facultatif)", "WPM target (optional)")}>
        <input
          id="edit-target"
          type="number"
          min={10}
          max={250}
          value={settings.targetWpm ?? ""}
          onChange={(event) =>
            set("targetWpm", event.target.value ? Number(event.target.value) : null)
          }
        />
      </Field>
      {error && <ErrorNotice message={error} />}
      <button className="primary full" disabled={busy || checking}>
        {t("Appliquer les règles", "Apply rules")}
      </button>
    </form>
  );
}
