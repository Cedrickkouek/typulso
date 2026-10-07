"use client";

import type { ReactNode } from "react";
import { Bot, Check, Flag, Shield, Timer, WifiOff, Zap } from "lucide-react";
import { nearestTrapRival, trapAvailable } from "@/lib/domain/arcade";
import type { Ability, PlayerSnapshot, RaceSnapshot, RoomSnapshot } from "@/types/game";
import { useTranslation } from "./providers";
import { Avatar, Metric } from "./ui";

export function formatRaceTime(seconds: number) {
  const value = Math.max(0, Math.floor(seconds));
  return `${Math.floor(value / 60)
    .toString()
    .padStart(2, "0")}:${(value % 60).toString().padStart(2, "0")}`;
}

export function RaceDashboard({
  time,
  timeLabel,
  wpm,
  accuracy,
  progress,
  action,
}: {
  time: string;
  timeLabel: string;
  wpm: ReactNode;
  accuracy: ReactNode;
  progress: ReactNode;
  action?: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <div className="race-hud">
      <div className="race-hud-metrics">
        <div className="race-hud-time">
          <span className="race-hud-icon" aria-hidden="true">
            <Timer size={20} />
          </span>
          <div className="metric">
            <strong role="timer" aria-label={timeLabel}>
              {time}
            </strong>
            <span>{timeLabel}</span>
          </div>
        </div>
        <Metric value={wpm} label={t("MPM (mots par minute)", "WPM (words per minute)")} />
        <Metric value={accuracy} label={t("Précision", "Accuracy")} />
        <Metric value={progress} label={t("Progression", "Progress")} />
      </div>
      {action && <div className="race-hud-action">{action}</div>}
    </div>
  );
}

export function ArcadeControls({
  self,
  players,
  connected,
  busy,
  race,
  now,
  onAbility,
}: {
  self: PlayerSnapshot | undefined;
  players: PlayerSnapshot[];
  connected: boolean;
  busy: boolean;
  race: RaceSnapshot;
  now: number;
  onAbility: (ability: Ability, targetId?: string) => void;
}) {
  const { t } = useTranslation();
  const energy = Math.round(self?.energy || 0);
  const leader = Math.max(
    ...players
      .filter((player) => player.role === "participant" && player.status !== "left")
      .map((player) => player.progress),
    0,
  );
  const deficit = leader - (self?.progress || 0);
  const unavailable = !self || self.finished || self.status !== "active";
  const canUse =
    !unavailable &&
    connected &&
    self.connected &&
    !busy &&
    !self.abilityUsed &&
    self.energy >= 100 &&
    deficit >= 5;
  const target = self ? nearestTrapRival(players, self.id) : undefined;
  const canTrap = canUse && trapAvailable(target, race, now);
  const explanation = unavailable
    ? t(
        "La capacité reste réservée aux participants en course.",
        "Abilities are for active racers.",
      )
    : !connected || !self.connected
      ? t("Retrouve la connexion pour utiliser ta capacité.", "Reconnect to use your ability.")
      : self.abilityUsed
        ? t(
            "Ta capacité a été utilisée pour cette manche.",
            "Your ability has been used this round.",
          )
        : self.energy < 100
          ? t(
              "Continue à bien taper pour remplir ton énergie.",
              "Keep typing accurately to fill your energy.",
            )
          : deficit < 5
            ? t(
                "Ta capacité se débloque à 5 points de retard.",
                "Your ability unlocks with a 5-point deficit.",
              )
            : busy
              ? t("Un instant, ton action est en cours.", "One moment, your action is in progress.")
              : t(
                  "À toi de choisir : pulsation, bouclier ou virgule piégée.",
                  "Your choice: pulse, shield or comma trap.",
                );
  return (
    <section className="race-arcade" aria-label={t("Capacité arcade", "Arcade ability")}>
      <div className="race-arcade-energy">
        <div className="race-arcade-heading">
          <span className="race-arcade-symbol" aria-hidden="true">
            <Zap size={20} />
          </span>
          <strong>{t("Ton énergie", "Your energy")}</strong>
          <span className="race-arcade-value">{energy} %</span>
        </div>
        <div
          className="race-energy-bar"
          role="progressbar"
          aria-label={t("Ton énergie", "Your energy")}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={energy}
        >
          <span style={{ width: `${energy}%` }} />
        </div>
        <p className="race-ability-explanation" id="arcade-availability">
          {explanation}
        </p>
      </div>
      <div className="race-arcade-choices">
        <div className="race-power-grid">
          {[
            {
              ability: "boost" as const,
              Icon: Zap,
              name: t("Pulsation", "Pulse"),
              note: t(
                "Un bonus au score arcade, sans sauter de lettres.",
                "An arcade score bonus, without skipping letters.",
              ),
              tone: "lime",
              enabled: canUse,
            },
            {
              ability: "shield" as const,
              Icon: Shield,
              name: t("Bouclier", "Shield"),
              note: t(
                "Trois erreurs protégées sur 8 s, ou un piège absorbé.",
                "Three protected mistakes over 8 s, or one absorbed trap.",
              ),
              tone: "sky",
              enabled: canUse,
            },
            {
              ability: "trap" as const,
              Icon: Zap,
              name: t("Virgule piégée", "Comma trap"),
              note: canTrap
                ? `${t("Cible :", "Target:")} ${target!.username} · ${t("3 s, jusqu’à −2 au score.", "3 s, up to −2 score.")}`
                : t(
                    "Rival actif devant toi, hors immunité et loin de l’arrivée. Pas dans les 5 premières/dernières secondes.",
                    "An active rival ahead, without immunity and away from the finish. Not in the first/last 5 seconds.",
                  ),
              tone: "coral",
              enabled: canTrap,
            },
          ].map(({ ability, Icon, name, note, tone, enabled }) => (
            <button
              className="race-power subtle"
              key={ability}
              data-tone={tone}
              disabled={!enabled}
              aria-describedby="arcade-availability"
              onClick={() => onAbility(ability, ability === "trap" ? target?.id : undefined)}
            >
              <span className="race-power-icon">
                {ability === "trap" ? (
                  <span aria-hidden="true" style={{ fontSize: 28, lineHeight: 1 }}>
                    ,
                  </span>
                ) : (
                  <Icon size={22} />
                )}
              </span>
              <strong>{name}</strong>
              <small>{note}</small>
            </button>
          ))}
        </div>
        <p>
          {t(
            "100 d’énergie · 5 points de retard · un usage",
            "100 energy · 5-point deficit · one use",
          )}
        </p>
      </div>
    </section>
  );
}

export function RaceTracks({ room, selfId }: { room: RoomSnapshot; selfId: string }) {
  const { t } = useTranslation();
  const players = room.players
    .filter((player) => player.role === "participant" && player.status !== "left")
    .sort((a, b) => a.joinedAt - b.joinedAt || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const underway = players.some((player) => player.progress > 0);
  return (
    <section className="race-tracks" aria-labelledby="live-race-heading">
      <div className="race-tracks-heading">
        <div>
          <p className="eyebrow">{t("Ensemble sur la piste", "Together on the track")}</p>
          <h3 id="live-race-heading">{t("La course en direct", "The race, live")}</h3>
        </div>
        <span className="race-player-count">
          {players.length} {t("participants", "participants")}
        </span>
      </div>
      <ol className="race-track-list">
        {players.map((player, index) => {
          const personal = player.id === selfId;
          const position = 1 + players.filter((other) => other.progress > player.progress).length;
          const progress = Math.max(0, Math.min(100, player.progress));
          const moving =
            room.phase === "racing" &&
            player.connected &&
            !player.finished &&
            player.status === "active";
          const racerColor = [
            "var(--accent)",
            "var(--pink)",
            "var(--lavender)",
            "var(--sky)",
            "var(--coral)",
          ][index % 5];
          return (
            <li className={`race-track-row ${personal ? "race-track-self" : ""}`} key={player.id}>
              <span
                className="race-track-position"
                title={t("Position selon la progression", "Position by progress")}
              >
                <span className="visually-hidden">
                  {t("Position selon la progression", "Position by progress")}{" "}
                </span>
                {underway ? position : "—"}
              </span>
              <div className="race-track-identity">
                <Avatar name={player.username} index={index} />
                <div className="race-track-name">
                  <div className="race-track-title">
                    <strong title={player.username}>{player.username}</strong>
                    {personal && <span className="race-self-tag">{t("Toi", "You")}</span>}
                  </div>
                  <div className="race-track-state">
                    {player.kind === "bot" && (
                      <span>
                        <Bot size={13} aria-hidden="true" />
                        Bot
                      </span>
                    )}
                    {player.finished && (
                      <span>
                        <Check size={13} aria-hidden="true" />
                        {t("Terminé", "Finished")}
                      </span>
                    )}
                    {!player.connected && (
                      <span>
                        <WifiOff size={13} aria-hidden="true" />
                        {t("Déconnecté", "Disconnected")}
                      </span>
                    )}
                    {!player.finished && player.connected && (
                      <span>{t("En course", "Racing")}</span>
                    )}
                  </div>
                </div>
              </div>
              <div
                className="race-track-line"
                role="progressbar"
                aria-label={`${t("Progression de", "Progress of")} ${player.username}`}
                aria-valuenow={Math.round(progress)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div className="race-track-rail" aria-hidden="true">
                  <span style={{ width: `${progress}%` }} />
                </div>
                <Flag className="race-finish-flag" size={19} aria-hidden="true" />
                <span
                  className="key-racer"
                  data-moving={moving || undefined}
                  data-finished={player.finished || undefined}
                  data-shield={
                    ((player.shieldRemaining ?? 0) > 0 &&
                      room.serverTime < (player.shieldUntil ?? 0)) ||
                    undefined
                  }
                  data-trap={(!!player.trap && room.serverTime < player.trap.endsAt) || undefined}
                  style={{ left: `calc(${progress}% - ${progress * 0.48}px)`, color: racerColor }}
                  aria-hidden="true"
                >
                  <svg className="key-racer-body" viewBox="0 0 48 48" fill="none">
                    <path
                      className="key-racer-trail"
                      d="M1 16h5M0 23h6M2 30h4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <rect
                      x="9"
                      y="5"
                      width="34"
                      height="30"
                      rx="8"
                      fill="currentColor"
                      stroke="#171c2b"
                      strokeWidth="1.5"
                    />
                    <path d="M13 30h26" stroke="#171c2b" strokeWidth="1.5" opacity=".3" />
                    <circle cx="21" cy="16" r="2" fill="#171c2b" />
                    <circle cx="32" cy="16" r="2" fill="#171c2b" />
                    <path
                      d="M22 22q4.5 5 9 0"
                      stroke="#171c2b"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <circle cx="17" cy="37" r="5" fill="#171c2b" />
                    <circle cx="36" cy="37" r="5" fill="#171c2b" />
                    <circle cx="17" cy="37" r="2" fill="currentColor" />
                    <circle cx="36" cy="37" r="2" fill="currentColor" />
                  </svg>
                </span>
              </div>
              <span className="race-track-percent">{Math.round(player.progress)} %</span>
            </li>
          );
        })}
      </ol>
      <p className="race-track-note">
        {t(
          "Les positions suivent la progression. Le classement final tient aussi compte de la précision.",
          "Positions follow progress. Final standings also account for accuracy.",
        )}
      </p>
    </section>
  );
}
