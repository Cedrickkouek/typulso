"use client";

import { RaceFilters } from "./race-filters";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowUpRight,
  Flag,
  Gauge,
  History,
  LogOut,
  Medal,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import type { ProfileData, StoredResult, RoomSnapshot } from "@/types/game";
import { api, useApi } from "@/lib/client/api";
import { disconnectRealtime } from "@/lib/client/realtime";
import { useSession, useTranslation } from "./providers";
import { AuthGate, Avatar, Empty, ErrorNotice, Heading, Loading, Metric, Notice } from "./ui";
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
    <div className={history ? undefined : "profile-page-layout"}>
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
      {!history && <ProfileMetrics stats={data.stats} />}
      {history && (
        <RaceFilters
          id="history-filter"
          language={language}
          mode={mode}
          onLanguage={setLanguage}
          onMode={setMode}
        />
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
    </div>
  );
}
export function ProfileMetrics({ stats }: { stats: ProfileData["stats"] }) {
  const { t } = useTranslation();
  return (
    <div className="metric-grid profile-metric-grid">
      {[
        { value: stats.races, label: t("Courses", "Races"), icon: Flag, tone: "sky" },
        { value: stats.wins, label: t("Victoires", "Wins"), icon: Trophy, tone: "lime" },
        {
          value: Math.round(stats.averageWpm),
          label: t("MPM moyens (mots par minute)", "Average WPM (words per minute)"),
          icon: Gauge,
          tone: "lavender",
        },
        {
          value: `${Math.round(stats.averageAccuracy)} %`,
          label: t("Précision moyenne", "Average accuracy"),
          icon: Target,
          tone: "pink",
        },
        {
          value: Math.round(stats.bestWpm),
          label: t("Meilleur MPM (mots par minute)", "Best WPM (words per minute)"),
          icon: Zap,
          tone: "lime",
        },
        {
          value: stats.averageRank.toFixed(1),
          label: t("Rang moyen", "Average rank"),
          icon: Medal,
          tone: "sky",
        },
      ].map(({ value, label, icon: Icon, tone }) => (
        <div className="box metric-box profile-stat-card" key={label} data-tone={tone}>
          <span className="profile-stat-icon" aria-hidden="true">
            <Icon size={23} strokeWidth={2} />
          </span>
          <Metric value={stats.races ? value : "—"} label={label} />
        </div>
      ))}
    </div>
  );
}
export function ResultTable({ results }: { results: StoredResult[] }) {
  const { t, locale } = useTranslation();
  return (
    <div className="score-table-wrap saved-results-wrap">
      <table className="score-table saved-results-table">
        <caption>
          <span className="saved-results-heading">
            <History size={22} aria-hidden="true" />
            {t("Tes résultats enregistrés", "Your saved results")}
          </span>
          <span className="saved-results-count">
            {results.length}{" "}
            {t(
              results.length === 1 ? "course" : "courses",
              results.length === 1 ? "race" : "races",
            )}
          </span>
        </caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">{t("Course", "Race")}</th>
            <th scope="col">{t("Vitesse", "Speed")}</th>
            <th scope="col">{t("Précision", "Accuracy")}</th>
            <th scope="col">{t("Rang", "Rank")}</th>
            <th scope="col">{t("Détails", "Details")}</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            <tr key={result.id}>
              <td>
                <time dateTime={result.createdAt}>
                  {new Date(result.createdAt).toLocaleDateString(
                    locale === "fr" ? "fr-CA" : "en-CA",
                    { day: "numeric", month: "short", year: "numeric" },
                  )}
                </time>
              </td>
              <th scope="row" className="saved-results-course">
                <span className="saved-results-name">{result.roomName}</span>
                <span className="saved-results-tags">
                  <span>{result.gameMode === "arcade" ? "Arcade" : t("Classique", "Classic")}</span>
                  <span>{result.language.toUpperCase()}</span>
                </span>
              </th>
              <td>
                <span className="saved-results-speed">{Math.round(result.wpm)}</span>
                <span className="saved-results-unit">
                  {t("MPM (mots par minute)", "WPM (words per minute)")}
                </span>
              </td>
              <td>
                <strong className="saved-results-accuracy">{Math.round(result.accuracy)} %</strong>
                <span className="saved-results-meter" aria-hidden="true">
                  <span style={{ width: `${Math.max(0, Math.min(100, result.accuracy))}%` }} />
                </span>
              </td>
              <td>
                <span
                  className="saved-results-rank"
                  data-podium={result.rank <= 3 ? result.rank : undefined}
                >
                  {result.rank === 1 && <Trophy size={16} aria-hidden="true" />}
                  <span>#{result.rank}</span>
                </span>
              </td>
              <td>
                <Link
                  className="saved-results-link"
                  href={`/resultats/${result.id}`}
                  aria-label={`${t("Résultats de", "Results for")} ${result.roomName}`}
                >
                  {t("Voir", "View")}
                  <ArrowUpRight size={18} aria-hidden="true" />
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
