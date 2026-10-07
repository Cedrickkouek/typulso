"use client";
import { useState } from "react";
import { playRaceSound, type RaceSound } from "@/lib/client/race-audio";
import { updatePreferences } from "@/lib/client/preferences";
import { useTranslation } from "./providers";
export const soundLabels: Array<[RaceSound, string, string]> = [
  ["start", "Départ", "Start"],
  ["key", "Touche correcte", "Correct key"],
  ["error", "Erreur douce", "Soft error"],
  ["streak", "Série parfaite", "Clean streak"],
  ["energy", "Énergie prête", "Energy ready"],
  ["pass", "Dépassement", "Overtake"],
  ["boost", "Pulsation", "Pulse"],
  ["shield", "Bouclier", "Shield"],
  ["trap", "Piège annoncé", "Trap warning"],
  ["counter", "Piège contré", "Trap blocked"],
  ["finish", "Arrivée", "Finish"],
  ["record", "Record personnel", "Personal best"],
];
export function RaceSounds() {
  const preferences = useTranslation(),
    { t } = preferences;
  const [status, setStatus] = useState("");
  return (
    <section className="race-sound-settings">
      <h2>{t("Les sons de l’arène", "Arena sounds")}</h2>
      <p className="small">
        {t(
          "Départ, duel, bonus et arrivée : chaque moment a son son. Tout reste facultatif.",
          "Start, duels, abilities and finish: each moment has a sound. All sounds are optional.",
        )}
      </p>
      <label className="switch-row">
        <span>
          <strong>{t("Sons de course", "Race sounds")}</strong>
          <small>
            {t(
              "Les moments confirmés de ta partie, sans bruit continu.",
              "Confirmed moments of your race, without continuous noise.",
            )}
          </small>
        </span>
        <input
          type="checkbox"
          checked={preferences.raceSounds}
          onChange={(e) => updatePreferences({ raceSounds: e.target.checked })}
        />
      </label>
      <label className="race-volume">
        <span>
          {t("Volume des sons", "Sound volume")} · {preferences.soundVolume} %
        </span>
        <input
          type="range"
          min="0"
          max="100"
          value={preferences.soundVolume}
          onChange={(e) => updatePreferences({ soundVolume: Number(e.target.value) })}
        />
      </label>
      <div className="race-sound-previews">
        {soundLabels.map(([name, fr, en]) => (
          <button
            className="subtle"
            key={name}
            aria-label={`${t("Écouter :", "Audition:")} ${t(fr, en)}`}
            onClick={async () =>
              setStatus(
                (await playRaceSound(name, true))
                  ? `${t("Aperçu :", "Preview:")} ${t(fr, en)}`
                  : t("Le son n’est pas disponible ici.", "Audio is unavailable here."),
              )
            }
          >
            ▷ {t(fr, en)}
          </button>
        ))}
      </div>
      <p className="small" role="status">
        {status ||
          t(
            "L’écoute d’un aperçu n’active pas les sons des parties.",
            "Auditioning a sound does not enable race sounds.",
          )}
      </p>
    </section>
  );
}
