"use client";

import { Select } from "./select";

import Link from "next/link";
import { updatePreferences } from "@/lib/client/preferences";
import { useTranslation } from "./providers";
import { Field, Heading } from "./ui";
import { ArrowRight, CheckCheck, Eye, Gauge, Sparkles, Type, WifiOff } from "lucide-react";

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
              <Select
                id="pref-language"
                value={preferences.locale}
                onValueChange={(value) => updatePreferences({ locale: value as "fr" | "en" })}
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
              </Select>
            </Field>
            <Field id="pref-theme" label={t("Thème", "Theme")}>
              <Select
                id="pref-theme"
                value={preferences.theme}
                onValueChange={(value) => updatePreferences({ theme: value as "light" | "dark" })}
              >
                <option value="light">{t("Clair", "Light")}</option>
                <option value="dark">{t("Sombre", "Dark")}</option>
              </Select>
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
  const steps = keyboard
    ? [
        {
          keys: ["Tab", t("Maj + Tab", "Shift + Tab")],
          title: t("Se déplacer", "Move between controls"),
          description: t(
            "Passe au contrôle suivant, ou reviens au précédent avec Maj + Tab.",
            "Move to the next control, or back with Shift + Tab.",
          ),
        },
        {
          keys: [t("Entrée", "Enter"), t("Espace", "Space")],
          title: t("Activer", "Activate"),
          description: t(
            "Entrée ouvre un lien. Entrée ou Espace active un bouton.",
            "Enter opens a link. Enter or Space activates a button.",
          ),
        },
        {
          keys: [t("Échap", "Esc")],
          title: t("Fermer une fenêtre", "Close a dialog"),
          description: t(
            "Ferme la confirmation et retrouve le focus sur le bouton d’origine.",
            "Close the confirmation and return focus to the original button.",
          ),
        },
        {
          keys: ["Tab"],
          title: t("Aller au contenu", "Skip to content"),
          description: t(
            "Le premier lien de la page mène directement au contenu.",
            "The first link on the page takes you straight to the content.",
          ),
        },
      ]
    : [
        {
          title: t("Rejoins ton groupe", "Join your group"),
          description: t(
            "Choisis une salle publique, entre un code ou ouvre ton invitation privée.",
            "Choose a public room, enter a code or open your private invitation.",
          ),
        },
        {
          title: t("Choisis ton identité", "Choose your identity"),
          description: t(
            "Un compte peut préparer une salle. Un invité peut participer.",
            "An account can prepare a room. A guest can participate.",
          ),
        },
        {
          title: t("Prépare ton départ", "Get ready"),
          description: t(
            "Lis les règles du salon, puis indique que tu es prêt.",
            "Read the lobby rules, then mark yourself ready.",
          ),
        },
        {
          title: t("Pars avec les autres", "Start together"),
          description: t("L’hôte lance le départ commun.", "The host starts everyone together."),
        },
      ];
  const typingTips = [
    {
      icon: CheckCheck,
      title: t("Des erreurs bien repérées", "Clear error cues"),
      description: t(
        "Les lettres restent à leur place. Les erreurs sont soulignées : la couleur n’est jamais le seul repère.",
        "Letters stay in place. Mistakes are underlined: color is never the only cue.",
      ),
    },
    {
      icon: Type,
      title: t("Une frappe personnelle", "Your own typing"),
      description: t(
        "Le collage est désactivé. Les accents et caractères composés sont validés à la fin de leur saisie.",
        "Paste is disabled. Accents and composed characters are validated when their input is complete.",
      ),
    },
    {
      icon: WifiOff,
      title: t("Une pause si tu perds la connexion", "A pause if you lose connection"),
      description: t(
        "La frappe se suspend. Reconnecte-toi pour retrouver la saisie confirmée par le serveur.",
        "Typing pauses. Reconnect to restore the input confirmed by the server.",
      ),
    },
    {
      icon: Eye,
      title: t("Une place pour observer", "A place to watch"),
      description: t(
        "Les spectateurs n’ont pas de champ de frappe. Si tu arrives pendant une course, tu la regardes.",
        "Spectators have no typing field. If you arrive during a race, you watch it.",
      ),
    },
  ];
  return (
    <div className="help-page">
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
      <div className="help-grid">
        <section className="box help-panel">
          <h2>
            {keyboard
              ? t("Naviguer sans souris", "Navigate without a mouse")
              : t("Avant la course", "Before the race")}
          </h2>
          <ol className="help-steps">
            {steps.map((step, index) => (
              <li key={step.title}>
                {"keys" in step ? (
                  <div className="help-keys">
                    {step.keys.map((key) => (
                      <kbd key={key}>{key}</kbd>
                    ))}
                  </div>
                ) : (
                  <span className="help-step-number" aria-hidden="true">
                    {index + 1}
                  </span>
                )}
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
        <section className="box help-panel">
          <h2>
            {keyboard
              ? t("Pendant la frappe", "While typing")
              : t("Pendant & après", "During & after")}
          </h2>
          <ul className="help-tips">
            {typingTips.map(({ icon: Icon, title, description }) => (
              <li key={title}>
                <span className="help-tip-icon" aria-hidden="true">
                  <Icon size={20} />
                </span>
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </li>
            ))}
          </ul>
          <Link className="ghost help-preferences" href="/preferences">
            {t("Régler mes préférences", "Adjust my preferences")}
            <ArrowRight size={18} />
          </Link>
        </section>
      </div>
      <aside className="help-score-guide" aria-label={t("Comparer les courses", "Comparing races")}>
        <div className="help-score-heading">
          <h2>{t("Compare ce qui se ressemble.", "Compare like with like.")}</h2>
          <p>
            {t(
              "Garde les mêmes règles et la même langue pour comparer tes courses.",
              "Use the same rules and language when comparing races.",
            )}
          </p>
        </div>
        <div className="help-score-modes">
          <div>
            <Gauge size={22} aria-hidden="true" />
            <div>
              <h3>{t("Classique", "Classic")}</h3>
              <p>{t("Lis ta vitesse et ta précision.", "Read your speed and accuracy.")}</p>
            </div>
          </div>
          <div>
            <Sparkles size={22} aria-hidden="true" />
            <div>
              <h3>{t("Arcade", "Arcade")}</h3>
              <p>{t("Le score inclut les capacités.", "The score includes abilities.")}</p>
            </div>
          </div>
        </div>
      </aside>
      <div className="actions help-actions">
        <Link className="primary" href="/rejoindre">
          {t("Rejoindre une course", "Join a race")}
          <ArrowRight size={18} />
        </Link>
        <Link className="subtle" href="/entrainement">
          {t("M’entraîner", "Practice")}
        </Link>
      </div>
    </div>
  );
}
