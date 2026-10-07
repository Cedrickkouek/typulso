"use client";
import { useEffect, useRef } from "react";
import { ArrowRight, Shield, Sparkles, Target, Zap } from "lucide-react";
import type { RoomSnapshot } from "@/types/game";
import { playRaceSound } from "@/lib/client/race-audio";
import { useTranslation } from "./providers";
export function RaceExperience({
  room,
  selfId,
  now,
  connected,
}: {
  room: RoomSnapshot;
  selfId: string;
  now: number;
  connected: boolean;
}) {
  const { t } = useTranslation(),
    self = room.players.find((p) => p.id === selfId);
  const rivals = room.players.filter(
    (p) =>
      p.id !== selfId &&
      p.role === "participant" &&
      p.connected &&
      p.status === "active" &&
      !p.finished,
  );
  const rival = self
    ? rivals.sort(
        (a, b) =>
          Math.abs(a.progress - self.progress) - Math.abs(b.progress - self.progress) ||
          a.id.localeCompare(b.id),
      )[0]
    : undefined;
  const rank = self
    ? 1 +
      room.players.filter(
        (p) => p.role === "participant" && p.status !== "left" && p.progress > self.progress,
      ).length
    : 0;
  const leader = Math.max(
    0,
    ...room.players
      .filter((p) => p.role === "participant" && p.status !== "left")
      .map((p) => p.progress),
  );
  const energyReady =
    !!self &&
    room.settings.gameMode === "arcade" &&
    self.status === "active" &&
    !self.abilityUsed &&
    self.energy >= 100 &&
    leader - self.progress >= 5;
  const previous = useRef<{
    raceId: string;
    phase: string;
    count: number;
    streak: number;
    energy: boolean;
    rank: number;
    candidate: number;
    candidateAt: number;
    passAt: number;
    sprint: boolean;
    connected: boolean;
  } | null>(null);
  const seen = useRef(new Set<string>());
  useEffect(() => {
    if (!room.race) return;
    const count = Math.max(0, Math.ceil((room.race.startsAt - now) / 1000));
    const baseline = () => {
      seen.current = new Set((room.events ?? []).map((e) => e.id));
      previous.current = {
        raceId: room.race!.id,
        phase: room.phase,
        count,
        streak: self?.bestStreak ?? 0,
        energy: energyReady,
        rank,
        candidate: 0,
        candidateAt: 0,
        passAt: 0,
        sprint: false,
        connected,
      };
    };
    if (!previous.current || previous.current.raceId !== room.race.id) {
      baseline();
      if (room.phase === "countdown" && count > 0 && count <= 3) void playRaceSound("countdown");
      return;
    }
    const prev = previous.current;
    if (!connected || !prev.connected || document.hidden) {
      baseline();
      return;
    }
    if (room.phase === "countdown" && count > 0 && count !== prev.count)
      void playRaceSound("countdown");
    if (prev.phase === "countdown" && room.phase === "racing") void playRaceSound("go");
    if (prev.phase !== "results" && room.phase === "results") {
      void playRaceSound("finish");
      if (room.results.find((r) => r.playerId === selfId)?.personalBest)
        void playRaceSound("record");
    }
    if (room.phase === "racing" && self?.role === "participant" && self.status === "active") {
      if ([10, 25, 50, 100].some((n) => prev.streak < n && (self.bestStreak ?? 0) >= n))
        void playRaceSound("streak");
      if (energyReady && !prev.energy) void playRaceSound("energy");
      if (rank < prev.rank) {
        if (prev.candidate !== rank) {
          prev.candidate = rank;
          prev.candidateAt = now;
        } else if (now - prev.candidateAt >= 500) {
          if (now - prev.passAt >= 4000) {
            void playRaceSound("pass");
            prev.passAt = now;
          }
          prev.rank = rank;
          prev.candidate = 0;
        }
      } else {
        prev.rank = rank;
        prev.candidate = 0;
      }
      const sprint =
        room.race.endsAt !== null ? room.race.endsAt - now <= 10000 : self.progress >= 90;
      if (sprint && !prev.sprint) {
        void playRaceSound("energy");
        prev.sprint = true;
      }
    }
    for (const event of room.events ?? []) {
      if (seen.current.has(event.id)) continue;
      seen.current.add(event.id);
      if (now - event.at > 4000) continue;
      if (event.actorId === selfId || event.targetId === selfId)
        void playRaceSound(event.kind === "trap-blocked" ? "counter" : event.kind);
    }
    prev.phase = room.phase;
    prev.count = count;
    prev.streak = self?.bestStreak ?? 0;
    prev.energy = energyReady;
    prev.connected = connected;
  }, [room, self, selfId, now, connected, energyReady, rank]);
  if (room.phase !== "racing" || !self || self.role !== "participant") return null;
  const event = (room.events ?? [])
    .filter((e) => (e.actorId === selfId || e.targetId === selfId) && now - e.at < 5000)
    .at(-1);
  const trap = self.trap && now < self.trap.endsAt ? self.trap : null;
  const name = (id: string | undefined) =>
    room.players.find((p) => p.id === id)?.username ?? t("Un rival", "A rival");
  const shieldActive = (self.shieldRemaining ?? 0) > 0 && now < (self.shieldUntil ?? 0);
  const sprint =
    room.race &&
    (room.race.endsAt !== null ? room.race.endsAt - now <= 10000 : self.progress >= 90);
  let title = t("Chaque touche compte.", "Every key counts."),
    detail = t("Garde ton rythme, et vise juste.", "Keep your rhythm and aim for accuracy."),
    Icon = Sparkles;
  if (rival) {
    title = `${rival.username} · ${Math.abs(rival.progress - self.progress).toFixed(1)} ${t("points", "points")} ${rival.progress >= self.progress ? t("devant", "ahead") : t("derrière", "behind")}`;
    detail = t(
      "Le duel suit la progression réelle. Le classement final tient aussi compte de la précision.",
      "The duel follows actual progress. Final standings also account for accuracy.",
    );
    Icon = Target;
  }
  if (sprint) {
    title = t("Dernière ligne droite !", "Final stretch!");
    detail = t("Le sprint se joue aussi à la précision.", "Accuracy matters in the sprint too.");
  }
  if (event) {
    Icon = Zap;
    if (event.kind === "boost") {
      title = t("Pulsation activée", "Pulse activated");
      detail = t(
        "Le bonus améliore ton score arcade. Il ne saute aucune lettre.",
        "The bonus improves your arcade score. It never skips letters.",
      );
    }
    if (event.kind === "shield") {
      title = t("Bouclier activé", "Shield activated");
      detail = t(
        "Jusqu’à trois erreurs protégées pendant huit secondes, ou un piège absorbé.",
        "Up to three protected mistakes for eight seconds, or one absorbed trap.",
      );
      Icon = Shield;
    }
    if (event.kind === "trap") {
      title = `${t("Virgule envoyée à", "Comma sent to")} ${name(event.targetId)}`;
      detail = t(
        "Le rival peut éviter la pénalité en tapant juste.",
        "Your rival can avoid the penalty by typing accurately.",
      );
    }
    if (event.kind === "trap-blocked") {
      title =
        event.actorId === selfId
          ? t("Bouclier : virgule contrée !", "Shield: comma blocked!")
          : t("Ta virgule a été contrée.", "Your comma was blocked.");
      detail = t(
        "La frappe continue. Le bouclier a absorbé le piège et s’est dissipé.",
        "Typing continues. The shield absorbed the trap and expired.",
      );
      Icon = Shield;
    }
  }
  if (trap) {
    title =
      now < trap.warningEndsAt
        ? `${t("Virgule annoncée par", "Comma incoming from")} ${name(trap.sourceId)}`
        : t("Virgule active : vise juste !", "Comma active: aim for accuracy!");
    detail =
      now < trap.warningEndsAt
        ? t(
            "Le texte reste lisible. Ton bouclier peut absorber l’impact.",
            "The text stays readable. Your shield can absorb the impact.",
          )
        : `${t("Chaque nouvelle erreur coûte 1 point arcade, maximum 2.", "Each new mistake costs 1 arcade point, maximum 2.")} ${Math.max(0, Math.ceil((trap.endsAt - now) / 1000))} s · −${trap.charged}/2`;
  }
  return (
    <section
      className="race-moment"
      data-trap={!!trap || undefined}
      aria-label={t("Moment de course", "Race moment")}
    >
      <span className="race-moment-icon" aria-hidden="true">
        <Icon size={23} />
      </span>
      <div
        className="race-moment-copy"
        role="status"
        aria-live={trap || event || sprint ? "polite" : "off"}
      >
        <strong>{title}</strong>
        <p>{detail}</p>
      </div>
      <div className="race-moment-tags">
        {(self.streak ?? 0) >= 10 && (
          <span>
            <Sparkles size={16} />
            {self.streak} {t("touches justes", "clean keys")}
          </span>
        )}
        {shieldActive && (
          <span>
            <Shield size={16} />
            {Math.ceil(((self.shieldUntil ?? 0) - now) / 1000)} s
          </span>
        )}
        {energyReady && (
          <span>
            <Zap size={16} />
            {t("Énergie prête", "Energy ready")}
            <ArrowRight size={16} />
          </span>
        )}
      </div>
    </section>
  );
}
