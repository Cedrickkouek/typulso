"use client";

import type { ReactNode } from "react";
import { Gamepad2, Languages, SlidersHorizontal, RotateCcw } from "lucide-react";
import { useTranslation } from "./providers";
import { Field } from "./ui";
import { Select } from "./select";

export function RaceFilters({
  id,
  language,
  mode,
  onLanguage,
  onMode,
  children,
}: {
  id: string;
  language: string;
  mode: string;
  onLanguage: (value: string) => void;
  onMode: (value: string) => void;
  children?: ReactNode;
}) {
  const { t } = useTranslation();
  const active = Number(language !== "all") + Number(mode !== "all");
  return (
    <section className="race-filters" aria-labelledby={`${id}-title`}>
      <div className="race-filters-intro">
        <span className="race-filters-symbol" aria-hidden="true">
          <SlidersHorizontal size={21} />
        </span>
        <div>
          <h2 id={`${id}-title`}>{t("À toi de choisir", "Your choice")}</h2>
          <p>{t("Une langue, une façon de jouer.", "A language. A way to play.")}</p>
        </div>
      </div>
      <div className="race-filters-fields">
        <Field
          id={`${id}-language`}
          label={
            <>
              <Languages size={16} aria-hidden="true" />
              {t("Langue du texte", "Text language")}
            </>
          }
        >
          <Select id={`${id}-language`} value={language} onValueChange={onLanguage}>
            <option value="all">{t("Toutes les langues", "All languages")}</option>
            <option value="fr">{t("Français", "French")}</option>
            <option value="en">{t("Anglais", "English")}</option>
          </Select>
        </Field>
        <Field
          id={`${id}-mode`}
          label={
            <>
              <Gamepad2 size={16} aria-hidden="true" />
              {t("Mode de jeu", "Game mode")}
            </>
          }
        >
          <Select id={`${id}-mode`} value={mode} onValueChange={onMode}>
            <option value="all">{t("Tous les modes", "All modes")}</option>
            <option value="classic">{t("Classique", "Classic")}</option>
            <option value="arcade">Arcade</option>
          </Select>
        </Field>
      </div>
      {(children || active > 0) && (
        <div className="race-filters-actions">
          {active > 0 && (
            <button
              className="ghost"
              onClick={() => {
                onLanguage("all");
                onMode("all");
              }}
            >
              <RotateCcw size={16} />
              {t("Tout afficher", "Show all")}
            </button>
          )}
          {children}
        </div>
      )}
    </section>
  );
}
