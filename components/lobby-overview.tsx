"use client";

import { Bot, Crown, Eye, Gamepad2, KeyRound, Keyboard, LockKeyhole, Timer } from "lucide-react";
import type { RoomSettings } from "@/types/game";
import { useTranslation } from "./providers";

export function LobbyOverview({
  settings,
  durationLabel,
}: {
  settings: RoomSettings;
  durationLabel: string;
}) {
  const { t } = useTranslation();
  const rules = [
    { icon: Timer, color: "sky", label: t("Durée maximale", "Time limit"), value: durationLabel },
    {
      icon: Gamepad2,
      color: "lavender",
      label: t("Mode de jeu", "Game mode"),
      value: settings.gameMode === "arcade" ? "Arcade" : t("Classique", "Classic"),
    },
    {
      icon: Bot,
      color: "coral",
      label: t("Adversaires automatisés", "Automated opponents"),
      value: settings.botCount,
    },
    {
      icon: KeyRound,
      color: "pink",
      label: t("Accès à la salle", "Room access"),
      value:
        settings.visibility === "private"
          ? t("Privé", "Private")
          : settings.visibility === "code"
            ? t("Par code", "By code")
            : t("Public", "Public"),
    },
  ];
  return (
    <section className="lobby-overview" aria-labelledby="lobby-overview-title">
      <div className="lobby-preview">
        <p className="lobby-preview-eyebrow">
          <Keyboard size={18} aria-hidden="true" />
          {t("Le terrain de jeu", "The playing field")}
        </p>
        <div className="lobby-preview-heading">
          <h3 id="lobby-overview-title">
            {settings.contentMode === "custom"
              ? t("Ton texte personnalisé", "Your custom text")
              : settings.contentMode === "words"
                ? t("Une piste de mots", "A track of words")
                : t("Un texte à parcourir", "A text to race through")}
          </h3>
          <div className="lobby-preview-keys" aria-hidden="true">
            <span>A</span>
            <span>Z</span>
            <span>↵</span>
          </div>
        </div>
        <p className="lobby-preview-note">
          <LockKeyhole size={16} aria-hidden="true" />
          {t("Le texte commun est dévoilé au départ.", "The shared text is revealed at the start.")}
        </p>
      </div>
      <dl className="lobby-rule-grid">
        {rules.map(({ icon: Icon, color, label, value }) => (
          <div className="lobby-rule" key={color}>
            <dt>
              <span className={`lobby-rule-icon lobby-rule-icon-${color}`}>
                <Icon size={18} aria-hidden="true" />
              </span>
              {label}
            </dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <div className="lobby-overview-help">
        <p>
          <Crown size={17} aria-hidden="true" />
          {t("L’hôte donne le départ.", "The host starts the race.")}
        </p>
        <p>
          <Eye size={17} aria-hidden="true" />
          {t("Les spectateurs observent, sans saisir.", "Spectators watch without typing.")}
        </p>
      </div>
    </section>
  );
}
