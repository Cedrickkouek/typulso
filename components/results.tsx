"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { ArrowRight, ChartNoAxesCombined, Trophy } from "lucide-react";
import {
  heatLevel,
  keyboardHeatmap,
  type HeatLevel,
  type KeyboardLayout,
} from "@/lib/client/keyboard-heatmap";
import type { KeyMetric, ResultSnapshot } from "@/types/game";
import { useTranslation } from "./providers";
import { Avatar } from "./ui";

export function Heatmap({ metrics }: { metrics: KeyMetric[] }) {
  const { t } = useTranslation();
  const [table, setTable] = useState(false);
  const [layout, setLayout] = useState<KeyboardLayout>("QWERTY");
  const keyboard = keyboardHeatmap(metrics, layout);
  const [filter, setFilter] = useState<HeatLevel | null>(null);
  const matchesFilter = (attempts: number, errors: number) =>
    filter === null || heatLevel(attempts, errors) === filter;
  const filteredMetrics = metrics.filter((metric) => matchesFilter(metric.attempts, metric.errors));
  const matchedKeys = [...keyboard.rows.flat(), ...keyboard.other].filter(
    (key) => matchesFilter(key.attempts, key.errors) && key.attempts > 0,
  ).length;
  const filterOptions = [
    { level: "none", label: "0 %", color: "var(--background)" },
    { level: "1", label: "1–4 %", color: "var(--sky)" },
    { level: "2", label: "5–14 %", color: "var(--lavender)" },
    { level: "3", label: "≥15 %", color: "var(--coral)" },
  ] as const;
  const renderKey = (characters: string, attempts: number, errors: number) => {
    const rate = attempts ? errors / attempts : null;
    const label = characters === " " ? t("Espace", "Space") : characters;
    const details = `${label} · ${attempts} ${t("frappes", "attempts")} · ${errors} ${t("erreurs", "errors")}`;
    return (
      <div
        className="heat-key"
        key={characters}
        data-level={heatLevel(attempts, errors)}
        data-filtered={!matchesFilter(attempts, errors) || undefined}
        aria-hidden={!matchesFilter(attempts, errors) || undefined}
        data-space={characters === " " || undefined}
        title={details}
        aria-label={details}
      >
        <span>{label}</span>
        <small>{rate === null ? "—" : `${Math.round(rate * 100)} %`}</small>
      </div>
    );
  };
  return (
    <section className="keyboard-statistics">
      <div className="section-heading keyboard-statistics-heading">
        <div>
          <h2>{t("Les touches sous la loupe", "Your keys, up close")}</h2>
          <p className="small">
            {t("Explore ton taux d’erreur par touche.", "Explore your error rate by key.")}
          </p>
        </div>
        <button className="subtle" onClick={() => setTable((value) => !value)}>
          {table ? t("Vue touches", "Key view") : t("Vue tableau", "Table view")}
        </button>
      </div>
      <div className="keyboard-statistics-toolbar">
        <div className="keyboard-filter-controls">
          <p className="keyboard-control-label">{t("Filtrer les touches", "Filter keys")}</p>
          <div
            className="heat-legend heat-filters"
            role="group"
            aria-label={t("Filtrer par taux d’erreur", "Filter by error rate")}
          >
            {filterOptions.map((option) => (
              <button
                type="button"
                key={option.level}
                aria-pressed={filter === option.level}
                onClick={() =>
                  setFilter((current) => (current === option.level ? null : option.level))
                }
              >
                <i
                  aria-hidden="true"
                  className="legend-color"
                  style={{ background: option.color, borderColor: "var(--on-color)" }}
                />
                {option.label}
              </button>
            ))}
            {filter !== null && (
              <button type="button" onClick={() => setFilter(null)}>
                {t("Tout afficher", "Show all")}
              </button>
            )}
          </div>
        </div>
        {!table && (
          <div className="keyboard-layout-controls">
            <p className="keyboard-control-label">
              {t("Disposition du clavier", "Keyboard layout")}
            </p>
            <div
              className="keyboard-layout-picker"
              role="group"
              aria-label={t("Disposition du clavier", "Keyboard layout")}
            >
              {(["AZERTY", "QWERTY"] as const).map((value) => (
                <button
                  type="button"
                  className="subtle"
                  aria-pressed={layout === value}
                  onClick={() => setLayout(value)}
                  key={value}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {filter !== null && (
        <p className="small heat-filter-status" role="status">
          {t("Touches correspondantes :", "Matching keys:")}{" "}
          {table ? filteredMetrics.length : matchedKeys}.
        </p>
      )}
      {table && filteredMetrics.length === 0 ? (
        <p className="small mt-4">
          {t(
            filter === null
              ? "Aucune frappe enregistrée pour ce résultat."
              : "Aucune touche ne correspond à ce filtre.",
            filter === null
              ? "No keystrokes were recorded for this result."
              : "No keys match this filter.",
          )}
        </p>
      ) : table ? (
        <div className="score-table-wrap mt-4">
          <table className="score-table">
            <caption>{t("Précision par touche", "Accuracy by key")}</caption>
            <thead>
              <tr>
                <th>{t("Touche", "Key")}</th>
                <th>{t("Frappes", "Attempts")}</th>
                <th>{t("Erreurs", "Errors")}</th>
                <th>{t("Taux d’erreur", "Error rate")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredMetrics.map((metric) => (
                <tr key={metric.key}>
                  <td>{metric.key === " " ? t("Espace", "Space") : metric.key}</td>
                  <td>{metric.attempts}</td>
                  <td>{metric.errors}</td>
                  <td>
                    {metric.attempts ? Math.round((metric.errors / metric.attempts) * 100) : 0} %
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          <div
            className="keyboard-heatmap-scroll"
            tabIndex={0}
            role="region"
            aria-label={t(
              "Taux d’erreur sur le clavier, défilement horizontal possible",
              "Keyboard error rates, horizontal scrolling available",
            )}
          >
            <div className="keyboard-heatmap">
              {keyboard.rows.map((row, index) => (
                <div className="keyboard-heatmap-row" data-row={index} key={index}>
                  {row.map((key) => renderKey(key.characters, key.attempts, key.errors))}
                </div>
              ))}
            </div>
          </div>
          <div className="keyboard-reading-guide">
            <p className="small">
              {t(
                "AZERTY français et QWERTY américain. Majuscules et symboles d’une même touche sont regroupés. — : touche non utilisée. La couleur et le pourcentage indiquent le taux d’erreur. Clique à nouveau sur un filtre pour tout afficher.",
                "French AZERTY and US QWERTY. Capitals and symbols on the same key are combined. —: unused key. Color and percentage show the error rate. Click the selected filter again to show all.",
              )}
            </p>
          </div>
          {keyboard.other.length > 0 && (
            <div className="keyboard-other">
              <h3>{t("Autres caractères", "Other characters")}</h3>
              <div className="heatmap-grid">
                {keyboard.other.map((metric) =>
                  renderKey(metric.key, metric.attempts, metric.errors),
                )}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
export function ResultsPanel({
  results,
  selfId,
  arcade = false,
}: {
  results: ResultSnapshot[];
  selfId?: string;
  arcade?: boolean;
}) {
  const { t } = useTranslation();
  const personalTitleId = useId();
  const personal = results.find((result) => result.playerId === selfId);
  const ordered = [...results].sort((a, b) => a.rank - b.rank);
  const podium = ordered.filter((result) => result.rank <= 3).slice(0, 3);
  const comparisonNote = arcade
    ? t(
        "Le score arcade inclut les effets du jeu. Compare ta frappe avec des courses de même mode, langue et règles.",
        "Arcade scores include game effects. Compare typing with races using the same mode, language and rules.",
      )
    : t(
        "Compare ta progression entre des courses de même langue et de mêmes règles.",
        "Compare your progress between races with the same language and rules.",
      );

  return (
    <div className="results-refresh">
      <section className="results-refresh-panel">
        <header className="results-refresh-heading">
          <div>
            <p className="results-refresh-kicker">
              {t("Bien joué, la bande", "Well played, everyone")}
            </p>
            <h2>{t("Chaque touche a compté.", "Every key counted.")}</h2>
          </div>
          <span className="badge">{arcade ? "Arcade" : t("Classique", "Classic")}</span>
        </header>

        {personal && (
          <section className="results-refresh-personal" aria-labelledby={personalTitleId}>
            <div className="results-refresh-personal-heading">
              <div className="results-refresh-identity">
                <Avatar name={personal.username} index={Math.max(0, personal.rank - 1)} />
                <div>
                  <p className="results-refresh-kicker">{t("Ta course", "Your race")}</p>
                  <h3 id={personalTitleId}>{personal.username}</h3>
                </div>
              </div>
              <span className="results-refresh-rank">
                <Trophy size={18} aria-hidden="true" />
                {t("Rang", "Rank")} {personal.rank}
              </span>
            </div>
            <dl className="results-refresh-metrics">
              <div>
                <dt>{t("Mots par minute", "Words per minute")}</dt>
                <dd>{Math.round(personal.wpm)}</dd>
              </div>
              <div>
                <dt>{t("Précision", "Accuracy")}</dt>
                <dd>{Math.round(personal.accuracy)} %</dd>
              </div>
              <div>
                <dt>{t("Erreurs", "Errors")}</dt>
                <dd>{personal.errors}</dd>
              </div>
              <div>
                <dt>{t("Corrections", "Corrections")}</dt>
                <dd>{personal.corrections}</dd>
              </div>
            </dl>
            <p className="results-refresh-note">{comparisonNote}</p>
          </section>
        )}

        <nav
          className="results-refresh-actions"
          aria-label={t("Après la course", "After the race")}
        >
          <Link className="subtle results-refresh-action" href="/profil">
            <ChartNoAxesCombined size={18} aria-hidden="true" />
            {t("Voir ma progression", "View my progress")}
          </Link>
          <Link className="ghost results-refresh-action" href="/courses">
            {t("Autres courses", "Other races")}
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </nav>

        {podium.length > 0 && (
          <section
            className="results-refresh-podium-section"
            aria-label={t("Le podium", "The podium")}
          >
            <h3>{t("Le podium", "The podium")}</h3>
            <ol className="results-refresh-podium">
              {podium.map((result) => (
                <li
                  className="results-refresh-podium-person"
                  data-rank={result.rank}
                  key={result.playerId}
                >
                  <Avatar name={result.username} index={Math.max(0, result.rank - 1)} />
                  <strong className="results-refresh-podium-name">{result.username}</strong>
                  <p className="results-refresh-podium-measures">
                    {Math.round(result.wpm)} {t("MPM", "WPM")} · {Math.round(result.accuracy)} %
                  </p>
                  <div className="results-refresh-podium-step">
                    <span className="results-refresh-place-label">{t("Rang", "Rank")}</span>
                    <strong>{result.rank}</strong>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        <div className="results-refresh-standings">
          <div
            className="results-refresh-table-wrap"
            role="region"
            aria-label={t("Classement de la course", "Race standings")}
            tabIndex={0}
          >
            <table className="results-refresh-table">
              <caption>{t("Classement de la course", "Race standings")}</caption>
              <thead>
                <tr>
                  <th scope="col">{t("Rang", "Rank")}</th>
                  <th scope="col">{t("Pseudo", "Nickname")}</th>
                  <th scope="col">{t("MPM", "WPM")}</th>
                  <th scope="col">{t("Précision", "Accuracy")}</th>
                  <th scope="col">{t("Erreurs", "Errors")}</th>
                  {arcade && <th scope="col">Score</th>}
                </tr>
              </thead>
              <tbody>
                {ordered.map((result) => (
                  <tr key={result.playerId} data-personal={result.playerId === selfId}>
                    <td>{result.rank}</td>
                    <th scope="row">
                      <span className="results-refresh-table-name">{result.username}</span>
                      {result.playerId === selfId && (
                        <span className="results-refresh-you">{t("Toi", "You")}</span>
                      )}
                      {result.kind === "bot" && <span className="badge">Bot</span>}
                    </th>
                    <td>{Math.round(result.wpm)}</td>
                    <td>{Math.round(result.accuracy)} %</td>
                    <td>{result.errors}</td>
                    {arcade && <td>{Math.round(result.score)}</td>}
                  </tr>
                ))}
                {ordered.length === 0 && (
                  <tr>
                    <td colSpan={arcade ? 6 : 5} className="results-refresh-empty">
                      {t(
                        "Aucun résultat disponible pour cette course.",
                        "No results are available for this race.",
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {!personal && <p className="results-refresh-note">{comparisonNote}</p>}
        </div>
      </section>
      {personal && (
        <div className="results-refresh-keys">
          <Heatmap metrics={personal.heatmap} />
        </div>
      )}
    </div>
  );
}
