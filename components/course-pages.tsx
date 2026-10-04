"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Eye, Plus, Shuffle, Users } from "lucide-react";
import { useSession, useTranslation } from "./providers";
import { api, useApi } from "@/lib/client/api";
import { command } from "@/lib/client/realtime";
import { defaultSettings } from "@/lib/client/settings";
import type { RoomSettings, RoomSummary } from "@/types/game";
import { AuthGate, Empty, ErrorNotice, Field, Heading, Loading, Notice } from "./ui";

export function CoursesPage() {
  const { t } = useTranslation();
  const { session } = useSession();
  const router = useRouter();
  const listing = useApi<{ rooms: RoomSummary[] }>("/api/rooms");
  const [language, setLanguage] = useState("all");
  const [mode, setMode] = useState("all");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const rooms =
    listing.data?.rooms.filter(
      (room) =>
        (language === "all" || room.language === language) &&
        (mode === "all" || room.gameMode === mode),
    ) || [];
  async function join(roomId?: string, spectator = false) {
    if (!session?.user)
      return router.push(
        `/invite?next=${encodeURIComponent(roomId ? `/salles/${roomId}${spectator ? "?watch=1" : ""}` : "/courses")}`,
      );
    setBusy(true);
    setError(null);
    try {
      const response = roomId
        ? await command("join", { roomId, ...(spectator ? { role: "spectator" } : {}) })
        : await command("quick", {});
      router.push(`/salles/${response.data.room.id}`);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Heading
        eyebrow={t("La bande est là", "Your people are here")}
        title={t("Trouve ta prochaine course.", "Find your next race.")}
        description={t(
          "Des salles publiques pour jouer ensemble. Les salles par code et privées restent à l’abri du catalogue.",
          "Public rooms to play together. Code and private rooms stay outside this catalog.",
        )}
        actions={
          <Link className="primary" href="/salles/nouvelle">
            <Plus size={17} />
            {t("Créer une salle", "Create a room")}
          </Link>
        }
      />
      <div className="filter-bar">
        <Field id="language-filter" label={t("Langue du texte", "Text language")}>
          <select
            id="language-filter"
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
          >
            <option value="all">{t("Toutes", "All")}</option>
            <option value="fr">{t("Français", "French")}</option>
            <option value="en">{t("Anglais", "English")}</option>
          </select>
        </Field>
        <Field id="mode-filter" label={t("Mode", "Mode")}>
          <select id="mode-filter" value={mode} onChange={(event) => setMode(event.target.value)}>
            <option value="all">{t("Tous", "All")}</option>
            <option value="classic">{t("Classique", "Classic")}</option>
            <option value="arcade">Arcade</option>
          </select>
        </Field>
        <button className="subtle" onClick={() => void join()} disabled={busy}>
          <Shuffle size={17} />
          {t("Course rapide", "Quick race")}
        </button>
        <button className="ghost" onClick={listing.retry}>
          {t("Actualiser", "Refresh")}
        </button>
      </div>
      {error && <ErrorNotice message={error} />}{" "}
      {listing.loading ? (
        <Loading />
      ) : listing.error ? (
        <ErrorNotice message={listing.error} retry={listing.retry} />
      ) : rooms.length === 0 ? (
        <Empty
          symbol="↗"
          title={t("La piste est libre.", "The track is open.")}
          description={t(
            "Aucune salle ne correspond à ces filtres. Crée la tienne ou reviens dans un instant.",
            "No rooms match these filters. Create yours or come back in a moment.",
          )}
        >
          <Link className="primary" href="/salles/nouvelle">
            {t("Créer une salle", "Create a room")}
          </Link>
        </Empty>
      ) : (
        <div className="cards-grid">
          {rooms.map((room, index) => (
            <article className="box room-card" key={room.id}>
              <div
                className="card-art"
                style={
                  {
                    "--tint": ["var(--pink)", "var(--lavender)", "var(--accent)"][index % 3],
                  } as React.CSSProperties
                }
              >
                <span aria-hidden="true">{room.gameMode === "arcade" ? "✳" : "az"}</span>
                <span className="badge">
                  {room.gameMode === "arcade" ? "Arcade" : t("Classique", "Classic")}
                </span>
              </div>
              <h2>{room.name}</h2>
              <div className="room-meta">
                <span className="badge">
                  <Users size={14} />
                  {room.playerCount}
                </span>
                <span className="badge">
                  {room.language === "fr" ? t("Français", "French") : t("Anglais", "English")}
                </span>
                <span className="badge">
                  {room.phase === "lobby"
                    ? t("Dans le salon", "In the lobby")
                    : t("Course en cours", "Racing")}
                </span>
              </div>
              <div className="actions">
                <button
                  className="primary"
                  disabled={busy}
                  onClick={() => void join(room.id, room.phase !== "lobby")}
                >
                  {room.phase === "lobby" ? t("Rejoindre", "Join") : t("Observer", "Watch")}
                  <ArrowRight size={15} />
                </button>
                <button
                  className="subtle"
                  disabled={busy}
                  aria-label={`${t("Observer", "Watch")} ${room.name}`}
                  onClick={() => void join(room.id, true)}
                >
                  <Eye size={17} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

export function CreatePage() {
  const { t } = useTranslation();
  const { session, loading, error: sessionError } = useSession();
  const router = useRouter();
  const [settings, setSettings] = useState<RoomSettings>(defaultSettings);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [previewBusy, setPreviewBusy] = useState(false);
  function set<K extends keyof RoomSettings>(key: K, value: RoomSettings[K]) {
    setSettings((previous) => ({ ...previous, [key]: value }));
    setPreview("");
  }
  async function validate() {
    setPreviewBusy(true);
    setError(null);
    try {
      const data = await api<{ text: string; settings: RoomSettings }>("/api/content/preview", {
        settings,
      });
      setPreview(data.text);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setPreviewBusy(false);
    }
  }
  async function create(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api("/api/content/preview", { settings });
      const response = await command("create", settings as unknown as Record<string, unknown>);
      router.push(`/salles/${response.data.room.id}`);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (loading) return <Loading />;
  if (sessionError) return <ErrorNotice message={sessionError} />;
  if (session?.user?.kind !== "account") return <AuthGate account destination="/salles/nouvelle" />;
  return (
    <>
      <Heading
        eyebrow={t("À toi de donner le rythme", "Set the rhythm")}
        title={t("Prépare ta salle.", "Prepare your room.")}
        description={t(
          "Des règles claires pour une course qui ressemble à ton groupe.",
          "Clear rules for a race that fits your group.",
        )}
      />
      <form className="content-grid" onSubmit={create}>
        <div className="box">
          <section className="editor-section">
            <h2>
              <span className="step-dot">01</span>
              {t("La bande & l’accès", "Your people & access")}
            </h2>
            <Field id="room-name" label={t("Nom de la salle", "Room name")}>
              <input
                id="room-name"
                value={settings.name}
                onChange={(event) => set("name", event.target.value)}
                maxLength={60}
                required
              />
            </Field>
            <fieldset className="field">
              <legend>{t("Qui peut entrer ?", "Who can join?")}</legend>
              <div className="choice-grid">
                {(
                  [
                    [
                      "public",
                      t("Publique", "Public"),
                      t("Visible au catalogue", "Visible in the catalog"),
                    ],
                    [
                      "code",
                      t("Par code", "By code"),
                      t("Un code pour le groupe", "One code for your group"),
                    ],
                    [
                      "private",
                      t("Privée", "Private"),
                      t("Invitation individuelle", "Individual invitation"),
                    ],
                  ] as const
                ).map(([value, label, note]) => (
                  <label className="choice" key={value}>
                    <input
                      type="radio"
                      name="access"
                      checked={settings.visibility === value}
                      onChange={() => set("visibility", value)}
                    />
                    <span>
                      <strong>{label}</strong>
                      <small>{note}</small>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          </section>
          <section className="editor-section">
            <h2>
              <span className="step-dot">02</span>
              {t("Le texte & le rythme", "The text & rhythm")}
            </h2>
            <div className="field-row">
              <Field id="content-language" label={t("Langue du texte", "Text language")}>
                <select
                  id="content-language"
                  value={settings.language}
                  onChange={(event) =>
                    set("language", event.target.value as RoomSettings["language"])
                  }
                >
                  <option value="fr">{t("Français", "French")}</option>
                  <option value="en">{t("Anglais", "English")}</option>
                </select>
              </Field>
              <Field id="content-mode" label={t("Contenu", "Content")}>
                <select
                  id="content-mode"
                  value={settings.contentMode}
                  onChange={(event) =>
                    set("contentMode", event.target.value as RoomSettings["contentMode"])
                  }
                >
                  <option value="text">{t("Texte", "Text")}</option>
                  <option value="words">{t("Liste de mots", "Word list")}</option>
                  <option value="custom">{t("Texte personnalisé", "Custom text")}</option>
                </select>
              </Field>
            </div>
            {settings.contentMode === "custom" ? (
              <Field
                id="custom-text"
                label={t("Ton texte", "Your text")}
                note={t(
                  "Le serveur vérifie sa compatibilité avec les caractères exclus.",
                  "The server checks compatibility with excluded characters.",
                )}
              >
                <textarea
                  id="custom-text"
                  value={settings.customText}
                  onChange={(event) => set("customText", event.target.value)}
                  maxLength={6000}
                  required
                  aria-describedby="custom-text-note"
                />
              </Field>
            ) : (
              <div className="field-row">
                <Field id="content-length" label={t("Longueur demandée", "Requested length")}>
                  <input
                    type="number"
                    id="content-length"
                    min={10}
                    max={200}
                    value={settings.length}
                    onChange={(event) => set("length", Number(event.target.value))}
                  />
                </Field>
                <Field id="topic" label={t("Thématique", "Topic")}>
                  <select
                    id="topic"
                    value={settings.topic}
                    onChange={(event) => set("topic", event.target.value as RoomSettings["topic"])}
                  >
                    <option value="everyday">{t("Quotidien", "Everyday")}</option>
                    <option value="science">Science</option>
                    <option value="gaming">{t("Jeu vidéo", "Gaming")}</option>
                  </select>
                </Field>
              </div>
            )}
            <div className="field-row">
              <Field id="duration" label={t("Durée maximale", "Time limit")}>
                <select
                  id="duration"
                  value={settings.durationSeconds ?? "none"}
                  onChange={(event) =>
                    set(
                      "durationSeconds",
                      event.target.value === "none" ? null : Number(event.target.value),
                    )
                  }
                >
                  <option value="none">
                    {t("Jusqu’à la fin du texte", "Until the text is complete")}
                  </option>
                  {[30, 60, 120, 180].map((value) => (
                    <option key={value} value={value}>
                      {value} s
                    </option>
                  ))}
                </select>
              </Field>
              <Field id="errors" label={t("Gestion des erreurs", "Error handling")}>
                <select
                  id="errors"
                  value={settings.errorMode}
                  onChange={(event) =>
                    set("errorMode", event.target.value as RoomSettings["errorMode"])
                  }
                >
                  <option value="free">
                    {t("Libre — erreur pénalisée", "Free — mistakes penalized")}
                  </option>
                  <option value="blocking">
                    {t("Bloquante — corriger pour avancer", "Blocking — correct to continue")}
                  </option>
                </select>
              </Field>
            </div>
          </section>
          <section className="editor-section">
            <h2>
              <span className="step-dot">03</span>
              {t("Le jeu", "The game")}
            </h2>
            <Field id="game-mode" label={t("Mode de course", "Race mode")}>
              <select
                id="game-mode"
                value={settings.gameMode}
                onChange={(event) =>
                  set("gameMode", event.target.value as RoomSettings["gameMode"])
                }
              >
                <option value="classic">{t("Classique", "Classic")}</option>
                <option value="arcade">Arcade</option>
              </select>
            </Field>
            {settings.gameMode === "arcade" && (
              <Notice>
                {t(
                  "Deux capacités : accélération et bouclier. L’énergie et les effets sont calculés par le serveur.",
                  "Two abilities: boost and shield. Energy and effects are calculated by the server.",
                )}
              </Notice>
            )}
            <div className="field-row">
              <Field id="bots" label={t("Adversaires automatisés", "Automated opponents")}>
                <select
                  id="bots"
                  value={settings.botCount}
                  onChange={(event) => set("botCount", Number(event.target.value))}
                >
                  {[0, 1, 2, 3, 5].map((value) => (
                    <option value={value} key={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </Field>
              <Field id="bot-level" label={t("Niveau des adversaires", "Opponent level")}>
                <select
                  id="bot-level"
                  value={settings.botLevel}
                  onChange={(event) =>
                    set("botLevel", event.target.value as RoomSettings["botLevel"])
                  }
                >
                  <option value="easy">{t("Débutant", "Easy")}</option>
                  <option value="medium">{t("Intermédiaire", "Medium")}</option>
                  <option value="hard">{t("Rapide", "Hard")}</option>
                </select>
              </Field>
            </div>
            <details className="accordion">
              <summary>{t("Réglages avancés", "Advanced settings")}</summary>
              <div>
                <Field id="excluded" label={t("Caractères exclus", "Excluded characters")}>
                  <input
                    id="excluded"
                    value={settings.excludedCharacters}
                    onChange={(event) => set("excludedCharacters", event.target.value)}
                    maxLength={64}
                  />
                </Field>
                <fieldset>
                  <legend className="small">{t("Touches à travailler", "Keys to practice")}</legend>
                  <div className="check-group">
                    {(["accents", "numbers", "punctuation"] as const).map((target) => (
                      <label key={target}>
                        <input
                          type="checkbox"
                          checked={settings.targets.includes(target)}
                          onChange={(event) =>
                            set(
                              "targets",
                              event.target.checked
                                ? [...settings.targets, target]
                                : settings.targets.filter((value) => value !== target),
                            )
                          }
                        />
                        {target === "accents"
                          ? t("Accents", "Accents")
                          : target === "numbers"
                            ? t("Chiffres", "Numbers")
                            : t("Ponctuation", "Punctuation")}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <Field
                  id="target-wpm"
                  label={t(
                    "Objectif personnel en MPM (facultatif)",
                    "Personal WPM target (optional)",
                  )}
                >
                  <input
                    type="number"
                    id="target-wpm"
                    min={10}
                    max={250}
                    value={settings.targetWpm ?? ""}
                    onChange={(event) =>
                      set("targetWpm", event.target.value ? Number(event.target.value) : null)
                    }
                  />
                </Field>
              </div>
            </details>
          </section>
        </div>
        <aside className="box editor-aside">
          <p className="eyebrow">{t("Avant le départ", "Before you start")}</p>
          <h2>{settings.name || t("Ta salle", "Your room")}</h2>
          <p className="small">
            {settings.visibility === "private"
              ? t(
                  "Chaque invitation privée est individuelle et à usage unique. Aucun code public.",
                  "Each private invitation is individual and single use. No public code.",
                )
              : t(
                  "Les règles seront visibles dans le salon avant le départ.",
                  "Rules will be visible in the lobby before the race.",
                )}
          </p>
          <button
            className="subtle full my-5"
            type="button"
            onClick={() => void validate()}
            disabled={previewBusy || busy}
          >
            {previewBusy
              ? t("Vérification…", "Checking…")
              : t("Vérifier & prévisualiser le texte", "Check & preview text")}
          </button>
          {preview && <p className="preview-text">{preview}</p>}
          {error && <ErrorNotice message={error} />}
          <button className="primary full mt-5" disabled={busy || previewBusy}>
            {busy ? t("Création…", "Creating…") : t("Créer la salle", "Create room")}
            <ArrowRight size={17} />
          </button>
        </aside>
      </form>
    </>
  );
}
