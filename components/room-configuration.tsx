"use client";

import { Select } from "./select";
import { useState } from "react";
import type { RoomSettings } from "@/types/game";
import { api } from "@/lib/client/api";
import { DomainError, validateSettings } from "@/lib/domain/settings";
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
      const validated = validateSettings(settings);
      await api("/api/content/preview", { settings: validated });
      await onSave(validated);
    } catch (error) {
      setError(error instanceof DomainError ? error.code.toLowerCase() : (error as Error).message);
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
          <Select
            id="edit-visibility"
            value={settings.visibility}
            onValueChange={(value) => set("visibility", value as RoomSettings["visibility"])}
          >
            <option value="public">{t("Public", "Public")}</option>
            <option value="code">{t("Par code", "By code")}</option>
            <option value="private">{t("Privé", "Private")}</option>
          </Select>
        </Field>
        <Field id="edit-language" label={t("Langue du texte", "Text language")}>
          <Select
            id="edit-language"
            value={settings.language}
            onValueChange={(value) => set("language", value as RoomSettings["language"])}
          >
            <option value="fr">Français</option>
            <option value="en">English</option>
          </Select>
        </Field>
      </div>
      <div className="field-row">
        <Field id="edit-mode" label={t("Mode", "Mode")}>
          <Select
            id="edit-mode"
            value={settings.gameMode}
            onValueChange={(value) => set("gameMode", value as RoomSettings["gameMode"])}
          >
            <option value="classic">{t("Classique", "Classic")}</option>
            <option value="arcade">Arcade</option>
          </Select>
        </Field>
        <Field id="edit-errors" label={t("Erreurs", "Errors")}>
          <Select
            id="edit-errors"
            value={settings.errorMode}
            onValueChange={(value) => set("errorMode", value as RoomSettings["errorMode"])}
          >
            <option value="free">{t("Libre", "Free")}</option>
            <option value="blocking">{t("Bloquantes", "Blocking")}</option>
          </Select>
        </Field>
      </div>
      <div className="field-row">
        <Field id="edit-content" label={t("Contenu", "Content")}>
          <Select
            id="edit-content"
            value={settings.contentMode}
            onValueChange={(value) => set("contentMode", value as RoomSettings["contentMode"])}
          >
            <option value="text">{t("Texte", "Text")}</option>
            <option value="words">{t("Mots", "Words")}</option>
            <option value="custom">{t("Personnalisé", "Custom")}</option>
          </Select>
        </Field>
        <Field id="edit-duration" label={t("Durée maximale (secondes)", "Time limit (seconds)")}>
          <Select
            id="edit-duration"
            value={settings.durationSeconds ?? "none"}
            onValueChange={(value) =>
              set("durationSeconds", value === "none" ? null : Number(value))
            }
          >
            <option value="none">{t("Fin du texte", "Text completion")}</option>
            {[30, 60, 120, 180, 300, 600].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </Select>
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
            <Select
              id="edit-topic"
              value={settings.topic}
              onValueChange={(value) => set("topic", value as RoomSettings["topic"])}
            >
              <option value="everyday">{t("Quotidien", "Everyday")}</option>
              <option value="science">Science</option>
              <option value="gaming">{t("Jeu vidéo", "Gaming")}</option>
            </Select>
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
          <Select
            id="edit-level"
            value={settings.botLevel}
            onValueChange={(value) => set("botLevel", value as RoomSettings["botLevel"])}
          >
            <option value="easy">{t("Débutant", "Easy")}</option>
            <option value="medium">{t("Intermédiaire", "Medium")}</option>
            <option value="hard">{t("Rapide", "Hard")}</option>
          </Select>
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
      <Field
        id="edit-target"
        label={t(
          "Objectif en MPM — mots par minute (facultatif)",
          "WPM target — words per minute (optional)",
        )}
      >
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
