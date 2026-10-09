"use client";

import { RaceExperience } from "./race-experience";
import { Select } from "./select";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Copy, Crown, Eye, Users, Wifi, WifiOff } from "lucide-react";
import type { InputOperation, CommandKind, RoomSettings } from "@/types/game";
import { command, currentRoom, reconnectRealtime, useRealtime } from "@/lib/client/realtime";
import { useSession, useTranslation } from "./providers";
import { AuthGate, Avatar, Dialog, ErrorNotice, Field, Heading, Loading, Notice } from "./ui";
import { TypingZone } from "./typing-zone";
import { TypingPassage } from "./typing-passage";
import { ResultsPanel } from "./results";
import { RoomConfiguration } from "./room-configuration";
import { LobbyOverview } from "./lobby-overview";
import { ArcadeControls, RaceDashboard, RaceTracks } from "./race-interface";

function useClock() {
  const [now, setNow] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(timer);
  }, []);
  return now;
}
const timeLabel = (seconds: number) =>
  `${Math.floor(Math.max(0, seconds) / 60)
    .toString()
    .padStart(2, "0")}:${Math.floor(Math.max(0, seconds) % 60)
    .toString()
    .padStart(2, "0")}`;
export function RoomPage({ id }: { id: string }) {
  const { t } = useTranslation();
  const { session, error: sessionError } = useSession();
  const realtime = useRealtime();
  const router = useRouter();
  const query = useSearchParams();
  const room = realtime.rooms[id];
  const user = session?.user;
  const self = room?.players.find((player) => player.id === user?.id);
  const host = room?.hostId === user?.id;
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [joined, setJoined] = useState(false);
  const [dialog, setDialog] = useState<"leave" | "people" | "rules" | null>(null);
  const [invitation, setInvitation] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const clock = useClock();
  const joinedRef = useRef("");
  const queue = useRef<Array<{ operation: InputOperation; revision: number }>>([]);
  const inflight = useRef(false);
  const sequence = useRef(0);
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [successor, setSuccessor] = useState("");
  const activeRace = useRef("");
  const inputGeneration = useRef(0);
  const [inputEpoch, setInputEpoch] = useState(0);
  const [acknowledgement, setAcknowledgement] = useState({ raceId: "", revision: 0 });
  const [pendingInput, setPendingInput] = useState(false);
  const [restoringInput, setRestoringInput] = useState(false);
  const [inputFailure, setInputFailure] = useState<{ raceId: string; message: string } | null>(
    null,
  );
  const inputError =
    room?.phase === "racing" && inputFailure && inputFailure.raceId === room.race?.id
      ? inputFailure.message
      : null;
  const roomUnavailable =
    room?.phase === "closed" ||
    room?.phase === "interrupted" ||
    error === "room_closed" ||
    inputError === "room_closed";
  useEffect(() => {
    if (!roomUnavailable) return;
    queue.current = [];
    inputGeneration.current++;
    if (flushTimer.current) clearTimeout(flushTimer.current);
    flushTimer.current = null;
    // Replace the obsolete room so Back cannot reopen its error screen.
    router.replace("/");
  }, [roomUnavailable, router]);
  useEffect(() => {
    if (!user || roomUnavailable || joinedRef.current === `${id}:${user.id}`) return;
    joinedRef.current = `${id}:${user.id}`;
    command("join", { roomId: id, ...(query.get("watch") === "1" ? { role: "spectator" } : {}) })
      .then((response) => {
        sequence.current = response.data.room.self?.sequence || 0;
        setJoined(true);
      })
      .catch((error) => {
        setError(error.message);
        joinedRef.current = "";
      });
  }, [id, user, query, roomUnavailable]);
  useEffect(
    () => () => {
      if (flushTimer.current) clearTimeout(flushTimer.current);
    },
    [],
  );
  async function flush() {
    if (
      inflight.current ||
      queue.current.length === 0 ||
      !room?.race ||
      currentRoom(id)?.race?.id !== room.race.id
    )
      return;
    const latestRoom = currentRoom(id);
    const estimatedNow =
      (latestRoom?.serverTime ?? room.serverTime) +
      Math.max(0, Date.now() - (realtime.receivedAt[id] || Date.now()));
    if (
      latestRoom?.phase !== "racing" ||
      (room.race.endsAt !== null && estimatedNow >= room.race.endsAt)
    ) {
      queue.current = [];
      setPendingInput(false);
      return;
    }
    inflight.current = true;
    const raceId = room.race.id;
    const generation = inputGeneration.current;
    const isCurrentInput = () =>
      inputGeneration.current === generation && currentRoom(id)?.race?.id === raceId;
    const operations: InputOperation[] = [];
    let acknowledgedRevision = 0;
    let characters = 0;
    while (queue.current.length && operations.length < 8) {
      const next = queue.current[0];
      const operation = next.operation;
      const cost =
        operation.kind === "insert" ? Array.from(operation.text.normalize("NFC")).length : 0;
      if (characters + cost > 8 && operations.length) break;
      operations.push(queue.current.shift()!.operation);
      acknowledgedRevision = next.revision;
      characters += cost;
    }
    const nextSequence = sequence.current + 1;
    try {
      const response = await command("input", { raceId, sequence: nextSequence, operations }, id);
      if (isCurrentInput()) {
        sequence.current = response.data.room.self?.sequence ?? nextSequence;
        setAcknowledgement({ raceId, revision: acknowledgedRevision });
      }
    } catch (error) {
      if (isCurrentInput()) {
        queue.current = [];
        if (currentRoom(id)?.phase === "racing")
          setInputFailure({ raceId, message: (error as Error).message });
      }
    } finally {
      if (isCurrentInput()) {
        inflight.current = false;
        if (queue.current.length)
          flushTimer.current = setTimeout(() => {
            flushTimer.current = null;
            void flush();
          }, 200);
        else setPendingInput(false);
      }
    }
  }
  function sendInput(operations: InputOperation[], revision: number) {
    if (activeRace.current !== room?.race?.id) {
      inputGeneration.current++;
      activeRace.current = room?.race?.id || "";
      sequence.current = room?.self?.sequence || 0;
      queue.current = [];
      inflight.current = false;
      if (flushTimer.current) clearTimeout(flushTimer.current);
      flushTimer.current = null;
    }
    // Revisions count wire operations, so splitting a long edit does not acknowledge its tail.
    const firstRevision = revision - operations.length + 1;
    queue.current.push(
      ...operations.map((operation, index) => ({ operation, revision: firstRevision + index })),
    );
    setPendingInput(true);
    if (!flushTimer.current && !inflight.current)
      flushTimer.current = setTimeout(() => {
        flushTimer.current = null;
        void flush();
      }, 200);
  }
  async function act(kind: CommandKind, payload: Record<string, unknown> = {}) {
    setBusy(true);
    setError(null);
    try {
      const response = await command(kind, payload, id);
      if (response.data.invitationUrl) setInvitation(response.data.invitationUrl);
      if (kind === "leave") router.push("/courses");
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function reconnect() {
    setRestoringInput(true);
    inputGeneration.current++;
    queue.current = [];
    inflight.current = false;
    if (flushTimer.current) clearTimeout(flushTimer.current);
    flushTimer.current = null;
    setBusy(true);
    setError(null);
    try {
      await reconnectRealtime();
      const response = await command("sync", {}, id);
      sequence.current = response.data.room.self?.sequence || 0;
      queue.current = [];
      activeRace.current = response.data.room.race?.id || "";
      setAcknowledgement({ raceId: activeRace.current, revision: 0 });
      setInputEpoch((epoch) => epoch + 1);
      setPendingInput(false);
      setInputFailure(null);
      setJoined(true);
    } catch (error) {
      setError((error as Error).message);
      if (room?.race) setInputFailure({ raceId: room.race.id, message: (error as Error).message });
    } finally {
      setRestoringInput(false);
      setBusy(false);
    }
  }
  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopyStatus(t("Copié !", "Copied!"));
    } catch {
      setCopyStatus(t("Copie manuellement le texte affiché.", "Copy the displayed text manually."));
    }
  }
  if (roomUnavailable)
    return <Loading label={t("Retour à la page de jeu…", "Returning to the play page…")} />;
  if (sessionError) return <ErrorNotice message={sessionError} />;
  if (!user) return <AuthGate destination={`/salles/${id}`} />;
  if (!room)
    return error ? (
      <ErrorNotice
        message={error}
        retry={() => {
          setError(null);
          void command("join", { roomId: id })
            .then((response) => {
              sequence.current = response.data.room.self?.sequence || 0;
              setJoined(true);
            })
            .catch((error) => setError(error.message));
        }}
      />
    ) : (
      <Loading label={t("On retrouve ta salle…", "Finding your room…")} />
    );
  const serverNow =
    room.serverTime + (clock ? Math.max(0, clock - (realtime.receivedAt[id] || clock)) : 0);
  const racing = room.phase === "racing";
  const countdown = room.race ? Math.max(0, Math.ceil((room.race.startsAt - serverNow) / 1000)) : 0;
  const remaining = room.race?.endsAt ? Math.max(0, (room.race.endsAt - serverNow) / 1000) : null;
  const participant = self?.role === "participant" && self.status !== "left";
  return (
    <>
      <div className={racing ? "race-room-heading" : undefined}>
        <Heading
          eyebrow={room.settings.gameMode === "arcade" ? "Arcade" : t("Classique", "Classic")}
          title={room.settings.name}
          description={`${room.settings.language === "fr" ? t("Texte français", "French text") : t("Texte anglais", "English text")} · ${room.settings.errorMode === "blocking" ? t("Erreurs bloquantes", "Blocking errors") : t("Frappe libre", "Free typing")}`}
          actions={
            <>
              <span className="race-connection" data-connected={realtime.connected}>
                {realtime.connected ? (
                  <Wifi size={16} aria-hidden="true" />
                ) : (
                  <WifiOff size={16} aria-hidden="true" />
                )}
                {realtime.connected
                  ? t("Connecté", "Connected")
                  : t("Connexion en pause", "Connection paused")}
              </span>
              <button className="subtle" onClick={() => setDialog("leave")}>
                {t("Quitter", "Leave")}
              </button>
            </>
          }
        />
      </div>
      {(error || inputError) && (
        <ErrorNotice
          message={error || inputError || ""}
          retry={inputError && !restoringInput ? () => void reconnect() : undefined}
        />
      )}{" "}
      {!realtime.connected && joined && (
        <Notice error>
          <strong>{t("La connexion fait une pause.", "Your connection is paused.")}</strong>
          <p>
            {t(
              "La saisie est suspendue. Reconnecte-toi pour reprendre ta participation.",
              "Typing is paused. Reconnect to resume your participation.",
            )}
          </p>
          <button className="primary mt-3" disabled={busy} onClick={() => void reconnect()}>
            {t("Se reconnecter", "Reconnect")}
          </button>
        </Notice>
      )}
      {room.race && (
        <RaceExperience
          room={room}
          selfId={user.id}
          now={serverNow}
          connected={realtime.connected}
        />
      )}
      {room.phase === "lobby" ? (
        <div className="panel room-panel">
          <div className="panel-top">
            <div className="room-title">
              <span className="room-symbol">
                <Users />
              </span>
              <div>
                <h2>{t("Le salon", "The lobby")}</h2>
                <p className="small">
                  {t("On se retrouve, puis on se lance.", "Meet up, then get going.")}
                </p>
              </div>
            </div>
            <span className="room-count">{room.players.length}</span>
          </div>
          <div className="lobby-grid">
            <section className="lobby-main">
              <div className="lobby-banner">
                <div>
                  <strong>{t("La bande se rassemble.", "Your people are gathering.")}</strong>
                  <span>
                    {t(
                      "Passe prêt quand tu as trouvé ta place.",
                      "Mark yourself ready when you have found your place.",
                    )}
                  </span>
                </div>
              </div>
              {room.code && room.settings.visibility !== "private" && (
                <div className="invite-strip">
                  <div>
                    <p className="eyebrow">{t("Code de la salle", "Room code")}</p>
                    <span className="code">{room.code}</span>
                  </div>
                  <button className="subtle" onClick={() => void copy(room.code || "")}>
                    <Copy size={16} />
                    {t("Copier", "Copy")}
                  </button>
                </div>
              )}
              {host && room.settings.visibility === "private" && (
                <div className="invite-strip">
                  <div>
                    <p className="eyebrow">
                      {t("Invitations individuelles", "Individual invitations")}
                    </p>
                    <p className="small">
                      {t("Un nouveau lien pour chaque personne.", "A new link for each person.")}
                    </p>
                  </div>
                  <button className="subtle" disabled={busy} onClick={() => void act("invite")}>
                    {t("Créer une invitation", "Create invitation")}
                  </button>
                </div>
              )}
              {invitation && (
                <Notice>
                  <p className="invitation-url">{invitation}</p>
                  <button
                    className="subtle mt-3"
                    onClick={() => void copy(new URL(invitation, window.location.origin).href)}
                  >
                    <Copy size={15} />
                    {t("Copier l’invitation", "Copy invitation")}
                  </button>
                </Notice>
              )}
              <p className="small" role="status">
                {copyStatus}
              </p>
              <div className="player-grid mt-5">
                {room.players
                  .filter((player) => player.status !== "left")
                  .map((player, index) => (
                    <div
                      className={`player ${player.id === user.id ? "player-self" : ""}`}
                      key={player.id}
                    >
                      <Avatar name={player.username} index={index} />
                      <strong>{player.username}</strong>
                      {player.id === room.hostId && (
                        <span className="badge badge-host">
                          <Crown size={12} />
                          {t("Hôte", "Host")}
                        </span>
                      )}
                      <span className={`badge ${player.ready ? "badge-ready" : ""}`}>
                        {player.role === "spectator"
                          ? t("Spectateur", "Spectator")
                          : !player.connected
                            ? t("Déconnecté", "Disconnected")
                            : player.ready
                              ? t("Prêt", "Ready")
                              : t("Pas encore prêt", "Not ready yet")}
                      </span>
                    </div>
                  ))}
              </div>
              <div className="player-tools">
                {participant && (
                  <button
                    className="primary"
                    disabled={busy || !realtime.connected}
                    onClick={() => void act("ready", { ready: !self?.ready })}
                  >
                    <Check size={17} />
                    {self?.ready
                      ? t("Je ne suis plus prêt", "I’m not ready")
                      : t("Je suis prêt", "I’m ready")}
                  </button>
                )}
                {host && (
                  <>
                    <button className="subtle" onClick={() => setDialog("rules")}>
                      {t("Modifier les règles", "Edit rules")}
                    </button>
                    <button className="subtle" onClick={() => setDialog("people")}>
                      {t("Gérer les participants", "Manage participants")}
                    </button>
                    <button
                      className="primary"
                      disabled={busy || !realtime.connected}
                      onClick={() => void act("start")}
                    >
                      {t("Lancer la course", "Start race")}
                      <ArrowRight size={17} />
                    </button>
                  </>
                )}
              </div>
            </section>
            <aside className="lobby-aside">
              <LobbyOverview
                settings={room.settings}
                durationLabel={
                  room.settings.durationSeconds
                    ? timeLabel(room.settings.durationSeconds)
                    : t("Fin du texte", "Text completion")
                }
              />
            </aside>
          </div>
        </div>
      ) : room.phase === "countdown" ? (
        <section className="box countdown-card">
          <p className="eyebrow">{t("Les mains sur le clavier", "Hands on the keyboard")}</p>
          <h2>{t("Trouve ton rythme.", "Find your rhythm.")}</h2>
          <div
            className="countdown-number"
            key={countdown}
            role="timer"
            aria-label={t("Secondes avant le départ", "Seconds until start")}
          >
            {countdown}
          </div>
          <p className="small">
            {t("Le même départ pour toute la bande.", "The same start for everyone.")}
          </p>
        </section>
      ) : racing && room.race ? (
        <div className="race-page race-interface">
          <section className="panel">
            <RaceDashboard
              time={
                remaining === null
                  ? timeLabel((serverNow - room.race.startsAt) / 1000)
                  : timeLabel(remaining)
              }
              timeLabel={
                remaining === null
                  ? t("Temps écoulé", "Elapsed time")
                  : t("Temps restant", "Time left")
              }
              wpm={self ? Math.round(self.wpm) : "—"}
              accuracy={self ? `${Math.round(self.accuracy)} %` : "—"}
              progress={self ? `${Math.round(self.progress)} %` : "—"}
            />
            {participant && self?.status === "active" && !self.finished ? (
              <TypingZone
                key={`${room.race.id}:${inputEpoch}`}
                text={room.race.text}
                players={room.players}
                selfId={user.id}
                blocking={room.settings.errorMode === "blocking"}
                startTime={room.race.startsAt}
                disabled={!realtime.connected || restoringInput || !!inputError || remaining === 0}
                authoritativeValue={!pendingInput ? room.self?.value : undefined}
                authoritativeSequence={!pendingInput ? room.self?.sequence : undefined}
                authoritativeRevision={
                  acknowledgement.raceId === room.race.id ? acknowledgement.revision : 0
                }
                onOperations={sendInput}
              />
            ) : (
              <div className="race">
                <Notice>
                  <strong>
                    <Eye className="inline" size={16} />{" "}
                    {participant
                      ? t("Ta course est terminée", "Your race is complete")
                      : t("Tu observes la course", "You are watching")}
                  </strong>
                  <p>
                    {t(
                      "Le classement se met à jour avec la progression du groupe.",
                      "Standings update as the group progresses.",
                    )}
                  </p>
                </Notice>
                <TypingPassage text={room.race.text} players={room.players} selfId={user.id} />
              </div>
            )}
            {remaining === 0 && (
              <Notice>
                <strong>{t("Course terminée", "Race finished")}</strong>
                <p>{t("Le classement arrive…", "The standings are on their way…")}</p>
              </Notice>
            )}
            {room.settings.gameMode === "arcade" && participant && remaining !== 0 && (
              <ArcadeControls
                self={self}
                players={room.players}
                connected={realtime.connected}
                busy={busy}
                race={room.race}
                now={serverNow}
                onAbility={(ability, targetId) =>
                  void act("ability", {
                    ability,
                    raceId: room.race!.id,
                    ...(targetId ? { targetId } : {}),
                  })
                }
              />
            )}
            <RaceTracks room={room} selfId={user.id} />
          </section>
        </div>
      ) : room.phase === "results" ? (
        <>
          <ResultsPanel
            results={room.results}
            selfId={user.id}
            arcade={room.settings.gameMode === "arcade"}
          />
          {host && (
            <button className="primary mt-5" disabled={busy} onClick={() => void act("rematch")}>
              {t("Une autre course", "One more race")}
            </button>
          )}
        </>
      ) : (
        <Notice>
          <strong>
            {room.phase === "closed"
              ? t("Cette salle est fermée.", "This room is closed.")
              : t("La course a été interrompue.", "This race was interrupted.")}
          </strong>
          <Link className="primary mt-4" href="/courses">
            {t("Trouver une autre course", "Find another race")}
          </Link>
        </Notice>
      )}
      <Dialog
        open={dialog === "leave"}
        title={t("Quitter la salle ?", "Leave the room?")}
        onClose={() => setDialog(null)}
      >
        <p>
          {host
            ? t(
                "En quittant, tu transfères ton rôle au participant le plus ancien. Tu peux choisir une personne avant de partir.",
                "Leaving transfers your host role to the oldest participant. You can choose someone before leaving.",
              )
            : t(
                "Ton départ sera visible pour le groupe.",
                "Your departure will be visible to the group.",
              )}
        </p>
        {host && (
          <Field id="successor" label={t("Prochain hôte", "Next host")}>
            <Select id="successor" value={successor} onValueChange={(value) => setSuccessor(value)}>
              <option value="">{t("Participant le plus ancien", "Oldest participant")}</option>
              {room.players
                .filter(
                  (player) =>
                    player.id !== user.id &&
                    player.kind !== "bot" &&
                    player.status !== "left" &&
                    player.role === "participant",
                )
                .map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.username}
                  </option>
                ))}
            </Select>
          </Field>
        )}
        <div className="actions">
          <button className="subtle" onClick={() => setDialog(null)}>
            {t("Rester", "Stay")}
          </button>
          <button
            className="primary"
            disabled={busy}
            onClick={() => void act("leave", successor ? { successorId: successor } : {})}
          >
            {t("Quitter", "Leave")}
          </button>
        </div>
      </Dialog>
      <Dialog
        open={dialog === "people"}
        title={t("La bande & les rôles", "Your people & roles")}
        onClose={() => setDialog(null)}
      >
        {room.players
          .filter(
            (player) => player.id !== user.id && player.kind !== "bot" && player.status !== "left",
          )
          .map((player) => (
            <div className="player-row" key={player.id}>
              <Avatar name={player.username} />
              <div>
                <strong>{player.username}</strong>
                <p className="small">
                  {player.role === "spectator"
                    ? t("Spectateur", "Spectator")
                    : t("Participant", "Participant")}
                </p>
              </div>
              <div className="actions">
                <button
                  className="subtle"
                  disabled={busy}
                  onClick={() =>
                    void act("role", {
                      memberId: player.id,
                      role: player.role === "spectator" ? "participant" : "spectator",
                    })
                  }
                >
                  {player.role === "spectator"
                    ? t("Faire participer", "Make participant")
                    : t("Faire observer", "Make spectator")}
                </button>
                <button
                  className="ghost"
                  disabled={busy}
                  onClick={() => void act("kick", { memberId: player.id })}
                >
                  {t("Exclure", "Remove")}
                </button>
              </div>
            </div>
          ))}
      </Dialog>
      <Dialog
        open={dialog === "rules"}
        title={t("Les règles du groupe", "The group rules")}
        onClose={() => setDialog(null)}
      >
        {dialog === "rules" && (
          <RoomConfiguration
            settings={room.settings}
            busy={busy}
            onSave={async (settings: RoomSettings) => {
              setBusy(true);
              try {
                await command("configure", settings as unknown as Record<string, unknown>, id);
                setDialog(null);
              } finally {
                setBusy(false);
              }
            }}
          />
        )}
      </Dialog>
    </>
  );
}
