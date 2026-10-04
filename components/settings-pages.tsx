"use client";

import Link from "next/link";
import { updatePreferences } from "@/lib/client/preferences";
import { useTranslation } from "./providers";
import { Field, Heading, Notice } from "./ui";

export function PreferencesPage() {
  const preferences = useTranslation();
  const { t } = preferences;
  return (
    <>
      <Heading
        eyebrow={t("Les détails qui te vont bien", "The details that suit you")}
        title={t("Ton espace, ton rythme.", "Your space, your rhythm.")}
        description={t(
          "Langue, lumière et effets. Tes choix de lecture ne changent pas les règles du groupe.",
          "Language, light and effects. Your reading choices do not change the group’s rules.",
        )}
      />
      <div className="content-grid">
        <section className="box">
          <h2>{t("Lecture & apparence", "Reading & appearance")}</h2>
          <div className="field-row mt-5">
            <Field id="pref-language" label={t("Langue de l’interface", "Interface language")}>
              <select
                id="pref-language"
                value={preferences.locale}
                onChange={(event) =>
                  updatePreferences({ locale: event.target.value as "fr" | "en" })
                }
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </Field>
            <Field id="pref-theme" label={t("Thème", "Theme")}>
              <select
                id="pref-theme"
                value={preferences.theme}
                onChange={(event) =>
                  updatePreferences({ theme: event.target.value as "light" | "dark" })
                }
              >
                <option value="light">{t("Clair", "Light")}</option>
                <option value="dark">{t("Sombre", "Dark")}</option>
              </select>
            </Field>
          </div>
          <h2 className="mt-6">{t("Mouvement & retours", "Motion & feedback")}</h2>
          {[
            {
              key: "reducedMotion" as const,
              title: t("Réduire les animations", "Reduce animations"),
              note: t("Garde les repères, limite le mouvement.", "Keep visual cues, limit motion."),
            },
            {
              key: "effects" as const,
              title: t("Effets expressifs", "Expressive effects"),
              note: t(
                "Les touches décoratives prennent vie. Les règles du jeu restent identiques.",
                "Decorative keys come alive. Game rules stay the same.",
              ),
            },
            {
              key: "sounds" as const,
              title: t("Son de frappe discret", "Quiet typing sounds"),
              note: t(
                "Un petit retour sonore à chaque frappe, désactivé par défaut.",
                "A small sound on each keystroke, off by default.",
              ),
            },
          ].map((item) => (
            <label className="switch-row" key={item.key}>
              <span>
                <strong>{item.title}</strong>
                <small>{item.note}</small>
              </span>
              <input
                type="checkbox"
                checked={preferences[item.key]}
                onChange={(event) => updatePreferences({ [item.key]: event.target.checked })}
              />
            </label>
          ))}
          <p className="small mt-5" role="status">
            {t(
              "Tes préférences sont enregistrées sur cet appareil.",
              "Your preferences are saved on this device.",
            )}
          </p>
        </section>
        <aside className="box tinted">
          <p className="eyebrow">{t("Toujours le même texte", "Always the same text")}</p>
          <h2>{t("Lis à ta façon.", "Read your way.")}</h2>
          <p>
            {t(
              "Passer l’interface en anglais ne traduit pas le texte de ta course. Le thème et les effets gardent ta saisie intacte.",
              "Switching the interface to English does not translate your race text. Theme and effects keep your typing intact.",
            )}
          </p>
          <Link className="subtle mt-5" href="/touches">
            {t("Repères clavier & accessibilité", "Keyboard & accessibility")}
          </Link>
        </aside>
      </div>
    </>
  );
}
export function HelpPage({ keyboard = false }: { keyboard?: boolean }) {
  const { t } = useTranslation();
  return (
    <>
      <Heading
        title={
          keyboard
            ? t("Les mains sur le clavier.", "Hands on the keyboard.")
            : t("Une place pour jouer, un rythme à trouver.", "A place to play, a rhythm to find.")
        }
        description={
          keyboard
            ? t("Des repères simples pour jouer et naviguer.", "Simple cues to play and navigate.")
            : t(
                "Retrouve ton groupe et fais avancer les mots.",
                "Meet your group and keep the words moving.",
              )
        }
      />
      <div className="equal-grid">
        <section className="box">
          <h2>
            {keyboard
              ? t("Naviguer sans souris", "Navigate without a mouse")
              : t("Avant la course", "Before the race")}
          </h2>
          {keyboard ? (
            <ol className="list-decimal space-y-4 pl-5">
              <li>
                {t(
                  "Tab passe au contrôle suivant ; Maj + Tab revient au précédent.",
                  "Tab moves to the next control; Shift + Tab moves to the previous one.",
                )}
              </li>
              <li>
                {t(
                  "Entrée active un lien. Entrée ou Espace active un bouton.",
                  "Enter activates a link. Enter or Space activates a button.",
                )}
              </li>
              <li>
                {t(
                  "Échap ferme une fenêtre de confirmation et rend le focus au bouton d’origine.",
                  "Escape closes a confirmation window and restores focus to its original button.",
                )}
              </li>
              <li>
                {t(
                  "Le premier lien permet d’aller directement au contenu.",
                  "The first link lets you skip straight to the content.",
                )}
              </li>
            </ol>
          ) : (
            <ol className="list-decimal space-y-4 pl-5">
              <li>
                {t(
                  "Rejoins une salle publique, entre un code ou accepte ton invitation privée.",
                  "Join a public room, enter a code or accept your private invitation.",
                )}
              </li>
              <li>
                {t(
                  "Un compte peut préparer une salle. Un invité peut participer.",
                  "An account can prepare a room. A guest can participate.",
                )}
              </li>
              <li>
                {t(
                  "Lis les règles du salon, puis indique que tu es prêt.",
                  "Read the lobby rules, then mark yourself ready.",
                )}
              </li>
              <li>{t("L’hôte lance le départ commun.", "The host starts everyone together.")}</li>
            </ol>
          )}
        </section>
        <section className="box">
          <h2>
            {keyboard
              ? t("Pendant la frappe", "While typing")
              : t("Pendant & après", "During & after")}
          </h2>
          <p>
            {t(
              "Les lettres correctes et les erreurs restent à la même place. Les erreurs sont soulignées ; la couleur seule n’est jamais le repère.",
              "Correct letters and mistakes stay in the same place. Mistakes are underlined; color is never the only cue.",
            )}
          </p>
          <p>
            {t(
              "Le collage est désactivé pour l’exercice. La composition d’accents et de caractères est validée quand la saisie est terminée.",
              "Paste is disabled for the exercise. Accent and character composition is validated when input is complete.",
            )}
          </p>
          <p>
            {t(
              "Si la connexion s’interrompt, la frappe se suspend. Reconnecte-toi pour retrouver la valeur confirmée par le serveur.",
              "If your connection is interrupted, typing pauses. Reconnect to restore the value confirmed by the server.",
            )}
          </p>
          <p>
            {t(
              "Les spectateurs observent sans champ de frappe. Les nouvelles arrivées pendant une course sont spectatrices.",
              "Spectators watch without a typing field. New arrivals during a race become spectators.",
            )}
          </p>
          <Link className="subtle" href="/preferences">
            {t("Régler mes préférences", "Adjust my preferences")}
          </Link>
        </section>
      </div>
      <Notice>
        {t(
          "En classique, lis ta vitesse et ta précision. En arcade, le score inclut les capacités. Compare des courses de mêmes règles et langue.",
          "In classic mode, read your speed and accuracy. In arcade, the score includes abilities. Compare races with matching rules and language.",
        )}
      </Notice>
      <div className="actions mt-5">
        <Link className="primary" href="/rejoindre">
          {t("Rejoindre une course", "Join a race")}
        </Link>
        <Link className="subtle" href="/entrainement">
          {t("M’entraîner", "Practice")}
        </Link>
      </div>
    </>
  );
}
