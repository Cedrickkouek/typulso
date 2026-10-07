"use client";

import { Select } from "./select";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { ArrowRight, RotateCcw } from "lucide-react";
import { useSession, useTranslation } from "./providers";
import { command } from "@/lib/client/realtime";
import { defaultSettings } from "@/lib/client/settings";
import type { TypingState } from "@/lib/client/typing-engine";
import { ErrorNotice, Field, Heading, Notice } from "./ui";
import { Heatmap } from "./results";
import { TypingZone } from "./typing-zone";
import { RaceDashboard, formatRaceTime } from "./race-interface";

const samples = {
  fr: "Bonjour la bande ! Chaque touche ouvre une nouvelle possibilité. Trouve ton rythme, garde les yeux sur les mots et laisse tes doigts faire le reste.",
  en: "Hello everyone! Every key opens a new possibility. Find your rhythm, keep your eyes on the words and let your fingers do the rest.",
};
export function PracticePage() {
  const { t } = useTranslation();
  const { session } = useSession();
  const router = useRouter();
  const [language, setLanguage] = useState<"fr" | "en">("fr");
  const [blocking, setBlocking] = useState(false);
  const [started, setStarted] = useState(false);
  const [revision, setRevision] = useState(0);
  const [metrics, setMetrics] = useState<TypingState | null>(null);
  const [bots, setBots] = useState(1);
  const [level, setLevel] = useState<"easy" | "medium" | "hard">("medium");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const onMetrics = useCallback((value: TypingState) => setMetrics(value), []);
  async function trainWithBots() {
    if (session?.user?.kind !== "account") return router.push("/connexion?next=%2Fentrainement");
    setBusy(true);
    setError(null);
    try {
      const response = await command("create", {
        ...defaultSettings,
        name: t("Mon entraînement", "My practice"),
        visibility: "code",
        language,
        errorMode: blocking ? "blocking" : "free",
        botCount: bots,
        botLevel: level,
      });
      router.push(`/salles/${response.data.room.id}`);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function reset() {
    setStarted(false);
    setMetrics(null);
    setRevision((value) => value + 1);
  }
  return (
    <>
      <Heading
        eyebrow={t("Avant le grand départ", "Before the big start")}
        title={t("Trouve ton rythme.", "Find your rhythm.")}
        description={t(
          "Un échauffement solo dans ce navigateur, ou de vrais adversaires automatisés dans une salle.",
          "A solo warm-up in this browser, or real automated opponents in a room.",
        )}
      />
      {!started ? (
        <div className="content-grid">
          <section className="box">
            <h2>{t("Échauffement solo", "Solo warm-up")}</h2>
            <p className="small">
              {t(
                "Tes mesures sont calculées à partir de ta frappe. Cet échauffement reste local et ne crée pas de résultat dans ton compte.",
                "Your metrics come from your typing. This warm-up stays local and does not create a result in your account.",
              )}
            </p>
            <div className="field-row mt-5">
              <Field id="practice-language" label={t("Langue du texte", "Text language")}>
                <Select
                  id="practice-language"
                  value={language}
                  onValueChange={(value) => setLanguage(value as "fr" | "en")}
                >
                  <option value="fr">{t("Français", "French")}</option>
                  <option value="en">{t("Anglais", "English")}</option>
                </Select>
              </Field>
              <Field id="practice-errors" label={t("Erreurs", "Errors")}>
                <Select
                  id="practice-errors"
                  value={blocking ? "blocking" : "free"}
                  onValueChange={(value) => setBlocking(value === "blocking")}
                >
                  <option value="free">{t("Frappe libre", "Free typing")}</option>
                  <option value="blocking">
                    {t("Correction obligatoire", "Correction required")}
                  </option>
                </Select>
              </Field>
            </div>
            <button className="primary" onClick={() => setStarted(true)}>
              {t("Commencer l’échauffement", "Start warming up")}
              <ArrowRight size={17} />
            </button>
          </section>
          <aside className="box">
            <h2>{t("Une piste avec des bots", "A track with bots")}</h2>
            <p className="small">
              {t(
                "La salle utilise le moteur de course réel. Le compte permet de préparer les règles et de conserver ton résultat.",
                "This room uses the real race engine. An account lets you prepare the rules and keep your result.",
              )}
            </p>
            <div className="field-row mt-5">
              <Field id="practice-bots" label={t("Adversaires", "Opponents")}>
                <Select
                  id="practice-bots"
                  value={bots}
                  onValueChange={(value) => setBots(Number(value))}
                >
                  {[1, 2, 3, 5].map((value) => (
                    <option value={value} key={value}>
                      {value}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field id="practice-level" label={t("Niveau", "Level")}>
                <Select
                  id="practice-level"
                  value={level}
                  onValueChange={(value) => setLevel(value as "easy" | "medium" | "hard")}
                >
                  <option value="easy">{t("Débutant", "Easy")}</option>
                  <option value="medium">{t("Intermédiaire", "Medium")}</option>
                  <option value="hard">{t("Rapide", "Hard")}</option>
                </Select>
              </Field>
            </div>
            {error && <ErrorNotice message={error} />}
            <button className="subtle" disabled={busy} onClick={() => void trainWithBots()}>
              {session?.user?.kind === "account"
                ? t("Préparer la salle", "Prepare room")
                : t("Me connecter pour préparer", "Sign in to prepare")}
            </button>
          </aside>
        </div>
      ) : (
        <div className="race-page race-interface">
          <section className="panel">
            <RaceDashboard
              time={formatRaceTime((metrics?.elapsedMs || 0) / 1000)}
              timeLabel={t("Temps écoulé", "Elapsed time")}
              wpm={metrics ? Math.round(metrics.wpm) : 0}
              accuracy={metrics?.attempts ? `${Math.round(metrics.accuracy)} %` : "—"}
              progress={`${Math.round(metrics?.progress || 0)} %`}
              action={
                <button className="subtle" onClick={reset}>
                  <RotateCcw size={16} />
                  {t("Recommencer", "Restart")}
                </button>
              }
            />
            <TypingZone
              key={revision}
              text={samples[language]}
              blocking={blocking}
              onMetrics={onMetrics}
            />
          </section>
          {metrics?.finished && (
            <section className="box mt-6">
              <h2>{t("Ton échauffement en chiffres", "Your warm-up in numbers")}</h2>
              <p className="small">
                {Math.round(metrics.wpm)} {t("MPM (mots par minute)", "WPM (words per minute)")} ·{" "}
                {Math.round(metrics.accuracy)} % · {metrics.errors} {t("erreurs", "mistakes")} ·{" "}
                {metrics.corrections} {t("corrections", "corrections")}
              </p>
              <div className="mt-5">
                <Heatmap metrics={metrics.heatmap} />
              </div>
              <div className="actions mt-5">
                <Link className="primary" href="/courses">
                  {t("Trouver une course", "Find a race")}
                </Link>
                <button className="subtle" onClick={reset}>
                  {t("Encore une fois", "Once more")}
                </button>
              </div>
            </section>
          )}
          <Notice>
            {t(
              "Échauffement local : le temps commence à ta première frappe.",
              "Local warm-up: timing starts with your first keystroke.",
            )}
          </Notice>
        </div>
      )}
    </>
  );
}
