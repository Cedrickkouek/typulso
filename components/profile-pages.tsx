"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";
import type { ProfileData, StoredResult, RoomSnapshot } from "@/types/game";
import { api, useApi } from "@/lib/client/api";
import { disconnectRealtime } from "@/lib/client/realtime";
import { useSession, useTranslation } from "./providers";
import {
  AuthGate,
  Avatar,
  Empty,
  ErrorNotice,
  Field,
  Heading,
  Loading,
  Metric,
  Notice,
} from "./ui";
import { Heatmap, ResultsPanel } from "./results";

export function ProfilePage({ history = false }: { history?: boolean }) {
  const { t } = useTranslation();
  const { session, loading, refresh } = useSession();
  const router = useRouter();
  const profile = useApi<ProfileData>(session?.user ? "/api/profile" : null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState("all");
  const [language, setLanguage] = useState("all");
  async function logout() {
    setBusy(true);
    try {
      await api("/api/auth/logout", {});
      disconnectRealtime();
      await refresh();
      router.push("/");
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (loading) return <Loading />;
  if (!session?.user) return <AuthGate destination={history ? "/historique" : "/profil"} />;
  if (profile.loading) return <Loading />;
  if (profile.error) return <ErrorNotice message={profile.error} retry={profile.retry} />;
  if (!profile.data)
    return (
      <Empty
        title={t("Aucun profil disponible", "No profile available")}
        description={t("Réessaie dans un instant.", "Try again in a moment.")}
      />
    );
  const data = profile.data;
  const results = data.results.filter(
    (result) =>
      (mode === "all" || result.gameMode === mode) &&
      (language === "all" || result.language === language),
  );
  const aggregate = new Map<string, { key: string; attempts: number; errors: number }>();
  data.results.forEach((result) =>
    result.heatmap.forEach((metric) => {
      const previous = aggregate.get(metric.key) || { key: metric.key, attempts: 0, errors: 0 };
      aggregate.set(metric.key, {
        key: metric.key,
        attempts: previous.attempts + metric.attempts,
        errors: previous.errors + metric.errors,
      });
    }),
  );
  return (
    <>
      {history ? (
        <Heading
          title={t("Tes courses, touche après touche.", "Your races, key by key.")}
          description={t(
            "Filtre les mêmes modes et langues pour lire ta progression.",
            "Filter matching modes and languages to read your progress.",
          )}
        />
      ) : (
        <div className="profile-banner">
          <Avatar name={data.user.username} />
          <div className="profile-name">
            <p className="eyebrow">{t("Ton espace", "Your space")}</p>
            <h1>{data.user.username}</h1>
            <p className="small">
              {data.user.kind === "guest"
                ? t("Session invitée", "Guest session")
                : t(
                    "Chaque course fait avancer ton rythme.",
                    "Every race moves your rhythm forward.",
                  )}
            </p>
          </div>
          <button className="subtle" disabled={busy} onClick={() => void logout()}>
            <LogOut size={17} />
            {t("Déconnexion", "Sign out")}
          </button>
        </div>
      )}{" "}
      {data.user.kind === "guest" && (
        <Notice>
          <strong>
            {t(
              "Cette progression appartient à ta session invitée.",
              "This progress belongs to your guest session.",
            )}
          </strong>
          <p>
            {t(
              "Un compte permet de conserver les prochains résultats. Les données invitées ne deviennent pas automatiquement un historique de compte.",
              "An account keeps future results. Guest data does not automatically become account history.",
            )}
          </p>
          <Link className="subtle mt-3" href="/inscription">
            {t("Créer un compte", "Create account")}
          </Link>
        </Notice>
      )}
      {error && <ErrorNotice message={error} />}
      <nav className="detail-tabs" aria-label={t("Progression", "Progress")}>
        <Link href="/profil" aria-current={!history ? "page" : undefined}>
          {t("Vue d’ensemble", "Overview")}
        </Link>
        <Link href="/historique" aria-current={history ? "page" : undefined}>
          {t("Historique", "History")}
        </Link>
      </nav>
      {!history && (
        <div className="metric-grid">
          {[
            [data.stats.races, t("Courses", "Races")],
            [data.stats.wins, t("Victoires", "Wins")],
            [Math.round(data.stats.averageWpm), t("MPM moyens", "Average WPM")],
            [
              `${Math.round(data.stats.averageAccuracy)} %`,
              t("Précision moyenne", "Average accuracy"),
            ],
            [Math.round(data.stats.bestWpm), t("Meilleur MPM", "Best WPM")],
            [data.stats.averageRank.toFixed(1), t("Rang moyen", "Average rank")],
          ].map(([value, label]) => (
            <div className="box metric-box" key={label}>
              <Metric value={data.stats.races ? value : "—"} label={String(label)} />
            </div>
          ))}
        </div>
      )}
      {history && (
        <div className="filter-bar">
          <Field id="history-mode" label={t("Mode", "Mode")}>
            <select
              id="history-mode"
              value={mode}
              onChange={(event) => setMode(event.target.value)}
            >
              <option value="all">{t("Tous", "All")}</option>
              <option value="classic">{t("Classique", "Classic")}</option>
              <option value="arcade">Arcade</option>
            </select>
          </Field>
          <Field id="history-language" label={t("Langue du texte", "Text language")}>
            <select
              id="history-language"
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
            >
              <option value="all">{t("Toutes", "All")}</option>
              <option value="fr">{t("Français", "French")}</option>
              <option value="en">{t("Anglais", "English")}</option>
            </select>
          </Field>
        </div>
      )}
      {results.length === 0 ? (
        <Empty
          symbol="↗"
          title={t("La première course t’attend.", "Your first race awaits.")}
          description={t(
            "Tes résultats réels apparaîtront ici après une course, ou après avoir changé ces filtres.",
            "Your real results appear here after a race, or after changing these filters.",
          )}
        >
          <Link className="primary" href="/courses">
            {t("Trouver une course", "Find a race")}
          </Link>
        </Empty>
      ) : (
        <div className="box">
          <ResultTable results={history ? results : results.slice(0, 6)} />
        </div>
      )}
      {!history && aggregate.size > 0 && (
        <div className="box mt-6">
          <Heatmap metrics={Array.from(aggregate.values())} />
        </div>
      )}
    </>
  );
}
function ResultTable({ results }: { results: StoredResult[] }) {
  const { t, locale } = useTranslation();
  return (
    <div className="score-table-wrap">
      <table className="score-table">
        <caption>{t("Tes résultats enregistrés", "Your saved results")}</caption>
        <thead>
          <tr>
            <th>Date</th>
            <th>{t("Course", "Race")}</th>
            <th>Mode</th>
            <th>{t("Texte", "Text")}</th>
            <th>{t("MPM", "WPM")}</th>
            <th>{t("Précision", "Accuracy")}</th>
            <th>{t("Rang", "Rank")}</th>
            <th>{t("Détails", "Details")}</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            <tr key={result.id}>
              <td>
                {new Date(result.createdAt).toLocaleDateString(locale === "fr" ? "fr-CA" : "en-CA")}
              </td>
              <td>{result.roomName}</td>
              <td>{result.gameMode === "arcade" ? "Arcade" : t("Classique", "Classic")}</td>
              <td>{result.language.toUpperCase()}</td>
              <td>{Math.round(result.wpm)}</td>
              <td>{Math.round(result.accuracy)} %</td>
              <td>{result.rank}</td>
              <td>
                <Link
                  className="ghost"
                  href={`/resultats/${result.id}`}
                  aria-label={`${t("Résultats de", "Results for")} ${result.roomName}`}
                >
                  {t("Voir", "View")}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export function ResultPage({ id }: { id: string }) {
  const { t } = useTranslation();
  const { session, loading } = useSession();
  const result = useApi<{ result: StoredResult; room: RoomSnapshot | null }>(
    session?.user ? `/api/results/${encodeURIComponent(id)}` : null,
  );
  if (loading) return <Loading />;
  if (!session?.user) return <AuthGate destination={`/resultats/${id}`} />;
  if (result.loading) return <Loading />;
  if (result.error) return <ErrorNotice message={result.error} retry={result.retry} />;
  if (!result.data) return <Notice>{t("Résultat introuvable.", "Result not found.")}</Notice>;
  const { result: personal, room } = result.data;
  return (
    <>
      <Heading
        title={personal.roomName}
        description={`${t("Résultat enregistré", "Saved result")} · ${personal.language.toUpperCase()}`}
      />
      <ResultsPanel
        results={
          room?.race?.id === personal.raceId && room.results.length ? room.results : [personal]
        }
        selfId={personal.playerId}
        arcade={personal.gameMode === "arcade"}
      />
    </>
  );
}
