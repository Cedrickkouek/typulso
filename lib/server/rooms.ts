import { randomBytes, randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import { getPool, transaction } from "../../db";
import {
  applyAbility,
  applyInput,
  defaultSettings,
  generateText,
  inactivityState,
  initializePlayer,
  makeBotTick,
  raceIsComplete,
  racePolicy,
  rankPlayers,
  updateMetrics,
  validateSettings,
  type DomainPlayer,
} from "../domain";
import type {
  CommandResponse,
  PlayerSnapshot,
  ProfileData,
  RoomCommand,
  RoomSnapshot,
  RoomSummary,
  StoredResult,
} from "../../types/game";
import type { AuthSession } from "./auth";
import { appUrl, digest, errorCode, limited, secret, ServiceError } from "./security";

export interface RoomPlayer extends DomainPlayer {
  disconnectedAt?: number | null;
  raceParticipant?: boolean;
  abandoned?: boolean;
}
export interface InternalRoom extends Omit<RoomSnapshot, "players" | "serverTime" | "self"> {
  players: RoomPlayer[];
  createdAt: number;
  lastTickAt: number;
}
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const kinds = new Set([
  "create",
  "join",
  "sync",
  "ready",
  "configure",
  "start",
  "input",
  "leave",
  "kick",
  "role",
  "invite",
  "rematch",
  "close",
  "ability",
  "quick",
]);
export function validateCommand(value: unknown): RoomCommand {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new ServiceError("invalid_command");
  const command = value as RoomCommand;
  if (
    !uuid.test(command.commandId || "") ||
    !kinds.has(command.kind) ||
    (command.roomId !== undefined && !uuid.test(command.roomId)) ||
    (command.expectedVersion !== undefined &&
      (!Number.isSafeInteger(command.expectedVersion) || command.expectedVersion < 1)) ||
    (command.payload !== undefined &&
      (!command.payload ||
        typeof command.payload !== "object" ||
        Array.isArray(command.payload))) ||
    JSON.stringify(value).length > 18000
  )
    throw new ServiceError("invalid_command");
  return command;
}
export function publicRoom(room: InternalRoom, actorId?: string, now = Date.now()): RoomSnapshot {
  const players: PlayerSnapshot[] = room.players
    .filter((p) => p.status !== "left" || (p.raceParticipant && room.phase !== "lobby"))
    .map((p) => ({
      id: p.id,
      username: p.username,
      kind: p.kind,
      role: p.role,
      ready: p.ready,
      connected: p.connected,
      joinedAt: p.joinedAt,
      progress: p.progress,
      correct: p.correct,
      errors: p.errors,
      corrections: p.corrections,
      wpm: p.wpm,
      accuracy: p.accuracy,
      finished: p.finished,
      energy: p.energy,
      abilityUsed: p.abilityUsed,
      status: p.status,
    }));
  const self = room.players.find((p) => p.id === actorId);
  return {
    id: room.id,
    code: room.code,
    settings: room.settings,
    phase: room.phase,
    version: room.version,
    hostId: room.hostId,
    players,
    race: room.race,
    results: room.results.map((r) => ({ ...r, heatmap: r.playerId === actorId ? r.heatmap : [] })),
    serverTime: now,
    ...(self ? { self: { value: self.value, sequence: self.sequence } } : {}),
  };
}
function ensureHost(room: InternalRoom, actorId: string) {
  if (room.hostId !== actorId) throw new ServiceError("host_required", 403);
}
function activePlayers(room: InternalRoom) {
  return room.players.filter((p) => p.status !== "left" || p.abandoned);
}
function member(room: InternalRoom, actorId: string) {
  const p = room.players.find((p) => p.id === actorId);
  if (!p || (p.status === "left" && !p.abandoned)) throw new ServiceError("not_member", 403);
  return p;
}
function code(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(randomBytes(6), (n) => alphabet[n % alphabet.length]).join("");
}
async function makeBots(db: PoolClient, count: number, now: number): Promise<RoomPlayer[]> {
  const players: RoomPlayer[] = [];
  for (let i = 0; i < count; i++) {
    const id = randomUUID(),
      name = `Bot ${i + 1}`;
    await db.query("INSERT INTO actors(id,username,kind) VALUES($1,$2,'bot')", [id, name]);
    players.push(initializePlayer(id, name, "bot", "participant", now));
  }
  return players;
}
async function persist(db: PoolClient, room: InternalRoom, increment = true): Promise<void> {
  if (increment) room.version++;
  await db.query(
    "UPDATE rooms SET host_actor_id=$2,code=$3,visibility=$4,phase=$5,version=$6,state=$7,updated_at=now() WHERE id=$1",
    [
      room.id,
      room.hostId || null,
      room.code,
      room.settings.visibility,
      room.phase,
      room.version,
      JSON.stringify(room),
    ],
  );
  for (const p of room.players)
    await db.query(
      `INSERT INTO room_members(room_id,actor_id,role,status,joined_at) VALUES($1,$2,$3,$4,$5)
    ON CONFLICT(room_id,actor_id) DO UPDATE SET role=excluded.role,status=CASE WHEN room_members.status='kicked' THEN 'kicked' ELSE excluded.status END`,
      [
        room.id,
        p.id,
        p.role,
        p.status === "left" && !p.abandoned ? "left" : "active",
        new Date(p.joinedAt),
      ],
    );
  await db.query(
    "INSERT INTO room_events(room_id,version,data) VALUES($1,$2,$3) ON CONFLICT DO NOTHING",
    [room.id, room.version, JSON.stringify(publicRoom(room))],
  );
}
async function createRoom(
  db: PoolClient,
  session: AuthSession,
  input: unknown,
  now: number,
): Promise<InternalRoom> {
  if (session.user.kind !== "account" || !session.userId)
    throw new ServiceError("account_required", 403);
  const settings = validateSettings(input),
    id = randomUUID();
  const room: InternalRoom = {
    id,
    code: settings.visibility === "private" ? null : code(),
    settings,
    phase: "lobby",
    version: 1,
    hostId: session.actorId,
    players: [
      initializePlayer(session.actorId, session.user.username, "account", "participant", now),
      ...(await makeBots(db, settings.botCount, now)),
    ],
    race: null,
    results: [],
    createdAt: now,
    lastTickAt: now,
  };
  // The deferred composite host FK is satisfied by members inserted in this same transaction.
  await db.query(
    "INSERT INTO rooms(id,creator_user_id,host_actor_id,code,visibility,phase,version,state,expires_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,now()+interval '24 hours')",
    [
      id,
      session.userId,
      room.hostId,
      room.code,
      settings.visibility,
      room.phase,
      room.version,
      JSON.stringify(room),
    ],
  );
  await persist(db, room, false);
  return room;
}
async function load(db: PoolClient, id: string): Promise<InternalRoom> {
  const row = (await db.query("SELECT state,expires_at FROM rooms WHERE id=$1 FOR UPDATE", [id]))
    .rows[0];
  if (!row || row.expires_at.getTime() <= Date.now()) throw new ServiceError("room_not_found", 404);
  return row.state as InternalRoom;
}
async function admit(
  db: PoolClient,
  session: AuthSession,
  payload: Record<string, unknown>,
  now: number,
): Promise<InternalRoom> {
  let id: string | undefined, invitationHash: string | undefined;
  if (typeof payload.invitation === "string" && payload.invitation.length <= 128) {
    invitationHash = digest(payload.invitation);
    id = (await db.query("SELECT room_id FROM invitations WHERE token_hash=$1", [invitationHash]))
      .rows[0]?.room_id;
  } else if (typeof payload.code === "string" && /^[A-Z2-9]{6}$/i.test(payload.code.trim()))
    id = (
      await db.query("SELECT id FROM rooms WHERE code=$1 AND visibility IN ('public','code')", [
        payload.code.trim().toUpperCase(),
      ])
    ).rows[0]?.id;
  else if (typeof payload.roomId === "string" && uuid.test(payload.roomId)) id = payload.roomId;
  if (!id) throw new ServiceError("room_not_found", 404);
  const room = await load(db, id);
  if (room.phase === "closed" || room.phase === "interrupted")
    throw new ServiceError("room_closed", 409);
  const existing = (
    await db.query("SELECT status FROM room_members WHERE room_id=$1 AND actor_id=$2", [
      id,
      session.actorId,
    ])
  ).rows[0];
  if (existing?.status === "kicked") throw new ServiceError("kicked", 403);
  const current = room.players.find(
    (p) => p.id === session.actorId && (p.status !== "left" || p.abandoned),
  );
  if (current) {
    current.connected = true;
    current.disconnectedAt = null;
    if (current.status === "disconnected") current.status = "active";
    await persist(db, room);
    return room;
  }
  if (activePlayers(room).length >= 30) throw new ServiceError("room_full", 409);
  if (room.settings.visibility === "private") {
    if (!invitationHash) throw new ServiceError("invitation_required", 403);
    const invitation = (
      await db.query("SELECT * FROM invitations WHERE token_hash=$1 AND room_id=$2 FOR UPDATE", [
        invitationHash,
        id,
      ])
    ).rows[0];
    if (
      !invitation ||
      invitation.revoked_at ||
      invitation.consumed_at ||
      invitation.expires_at.getTime() <= now
    )
      throw new ServiceError("invalid_invitation", 403);
    await db.query("UPDATE invitations SET consumed_at=now(),consumed_by=$2 WHERE token_hash=$1", [
      invitationHash,
      session.actorId,
    ]);
  } else if (room.settings.visibility === "code" && typeof payload.code !== "string")
    throw new ServiceError("code_required", 403);
  const role =
    room.phase === "countdown" || room.phase === "racing" || payload.role === "spectator"
      ? "spectator"
      : "participant";
  const previous = room.players.find((p) => p.id === session.actorId);
  if (previous) {
    previous.connected = true;
    previous.status = "active";
    previous.role = role;
    previous.ready = false;
    previous.disconnectedAt = null;
  } else
    room.players.push(
      initializePlayer(session.actorId, session.user.username, session.user.kind, role, now),
    );
  await persist(db, room);
  return room;
}
function successor(room: InternalRoom, excluded: string, chosen?: string) {
  const eligible = room.players
    .filter(
      (p) =>
        p.id !== excluded &&
        p.kind !== "bot" &&
        p.connected &&
        (p.status !== "left" || p.abandoned),
    )
    .sort(
      (a, b) =>
        (a.role === "participant" ? 0 : 1) - (b.role === "participant" ? 0 : 1) ||
        a.joinedAt - b.joinedAt ||
        a.id.localeCompare(b.id),
    );
  return (chosen ? eligible.find((p) => p.id === chosen) : undefined)?.id || eligible[0]?.id || "";
}
function close(room: InternalRoom, interrupted = false) {
  room.phase = interrupted ? "interrupted" : "closed";
  room.hostId = "";
  room.code = room.settings.visibility === "private" ? null : room.code;
}
async function finish(db: PoolClient, room: InternalRoom, now: number): Promise<void> {
  if (!room.race || room.phase !== "racing") return;
  room.players = room.players.map((p) =>
    updateMetrics(p, room.race!.text, room.race!.startsAt, now, room.settings.errorMode),
  );
  room.results = rankPlayers(
    room.players.map((p) => ({ ...p, role: p.raceParticipant ? "participant" : "spectator" })),
    room.race.startsAt,
    now,
    room.settings.gameMode,
  );
  room.phase = "results";
  await db.query("UPDATE races SET phase='results',finished_at=$2 WHERE id=$1", [
    room.race.id,
    new Date(now),
  ]);
  for (const result of room.results) {
    const id = randomUUID();
    const stored: StoredResult = {
      ...result,
      id,
      roomId: room.id,
      roomName: room.settings.name,
      raceId: room.race.id,
      createdAt: new Date(now).toISOString(),
      language: room.settings.language,
      gameMode: room.settings.gameMode,
    };
    await db.query(
      "INSERT INTO results(id,race_id,room_id,actor_id,data,created_at) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(race_id,actor_id) DO NOTHING",
      [id, room.race.id, room.id, result.playerId, JSON.stringify(stored), new Date(now)],
    );
  }
}
async function start(db: PoolClient, room: InternalRoom, now: number) {
  if (room.phase !== "lobby") throw new ServiceError("invalid_phase", 409);
  const participants = activePlayers(room).filter((p) => p.role === "participant");
  if (!participants.length || participants.some((p) => !p.ready || !p.connected))
    throw new ServiceError("players_not_ready", 409);
  const text = generateText(room.settings, randomBytes(4).readUInt32BE()),
    startsAt = now + racePolicy.countdownMs;
  room.race = {
    id: randomUUID(),
    text,
    startsAt,
    endsAt:
      room.settings.durationSeconds === null
        ? null
        : startsAt + room.settings.durationSeconds * 1000,
  };
  room.phase = "countdown";
  room.results = [];
  room.players = room.players.map((p) => ({
    ...initializePlayer(p.id, p.username, p.kind, p.role, now),
    joinedAt: p.joinedAt,
    connected: p.connected,
    disconnectedAt: p.disconnectedAt,
    raceParticipant: p.role === "participant" && p.status !== "left",
    status: p.status,
  }));
  await db.query(
    "INSERT INTO races(id,room_id,phase,text,settings,starts_at,ends_at) VALUES($1,$2,'countdown',$3,$4,$5,$6)",
    [
      room.race.id,
      room.id,
      text,
      JSON.stringify(room.settings),
      new Date(startsAt),
      room.race.endsAt ? new Date(room.race.endsAt) : null,
    ],
  );
}
export async function runCommand(session: AuthSession, input: unknown): Promise<CommandResponse> {
  let command: RoomCommand;
  try {
    command = validateCommand(input);
    await limited(
      `command:${session.actorId}:${command.kind === "input" ? "input" : "control"}`,
      command.kind === "input" ? 1800 : 300,
      60,
    );
  } catch (error) {
    return { ok: false, error: errorCode(error) };
  }
  try {
    return await transaction(async (db) => {
      await db.query("SELECT id FROM actors WHERE id=$1 FOR UPDATE", [session.actorId]);
      const alive = (
        await db.query(
          "SELECT 1 FROM sessions WHERE id=$1 AND revoked_at IS NULL AND expires_at>now()",
          [session.id],
        )
      ).rowCount;
      if (!alive) throw new ServiceError("unauthenticated", 401);
      const receipt = (
        await db.query(
          "SELECT response FROM command_receipts WHERE actor_id=$1 AND command_id=$2",
          [session.actorId, command.commandId],
        )
      ).rows[0];
      if (receipt) return receipt.response as CommandResponse;
      const now = Date.now(),
        payload = command.payload || {};
      let room: InternalRoom;
      let invitationUrl: string | undefined;
      if (command.kind === "create") room = await createRoom(db, session, payload, now);
      else if (command.kind === "quick") {
        if (session.user.kind !== "account") throw new ServiceError("account_required", 403);
        const available = (
          await db.query(
            "SELECT id,code FROM rooms WHERE visibility='public' AND phase='lobby' AND expires_at>now() ORDER BY created_at DESC LIMIT 30",
          )
        ).rows;
        let selected: InternalRoom | undefined;
        for (const candidate of available) {
          const state = await load(db, candidate.id);
          if (activePlayers(state).length < 30) {
            selected = await admit(db, session, { roomId: candidate.id }, now);
            break;
          }
        }
        room =
          selected ||
          (await createRoom(
            db,
            session,
            {
              ...defaultSettings,
              visibility: "public",
              name: session.user.username + " · Course rapide",
            },
            now,
          ));
      } else if (command.kind === "join") room = await admit(db, session, payload, now);
      else {
        let id = command.roomId;
        if (!id && command.kind === "sync")
          id = (
            await db.query(
              "SELECT m.room_id FROM room_members m JOIN rooms r ON r.id=m.room_id WHERE m.actor_id=$1 AND m.status='active' AND r.phase NOT IN ('closed','interrupted') ORDER BY r.updated_at DESC LIMIT 1",
              [session.actorId],
            )
          ).rows[0]?.room_id;
        if (!id) throw new ServiceError("room_not_found", 404);
        room = await load(db, id);
        const player = member(room, session.actorId);
        if (
          (
            await db.query("SELECT status FROM room_members WHERE room_id=$1 AND actor_id=$2", [
              id,
              session.actorId,
            ])
          ).rows[0]?.status === "kicked"
        )
          throw new ServiceError("kicked", 403);
        if (room.phase === "closed" || room.phase === "interrupted") {
          if (command.kind !== "sync") throw new ServiceError("room_closed", 409);
        }
        if (
          command.expectedVersion !== undefined &&
          ["configure", "start", "role", "kick", "rematch", "close"].includes(command.kind) &&
          command.expectedVersion !== room.version
        )
          throw new ServiceError("stale_version", 409);
        if (command.kind === "sync") {
          player.connected = true;
          player.disconnectedAt = null;
          if (player.status === "disconnected") player.status = "active";
        } else if (command.kind === "ready") {
          if (
            room.phase !== "lobby" ||
            player.role !== "participant" ||
            typeof payload.ready !== "boolean"
          )
            throw new ServiceError("invalid_phase", 409);
          player.ready = payload.ready;
        } else if (command.kind === "configure") {
          ensureHost(room, session.actorId);
          if (room.phase !== "lobby") throw new ServiceError("invalid_phase", 409);
          const settings = validateSettings(payload, room.settings);
          const humans = activePlayers(room).filter((p) => p.kind !== "bot");
          if (humans.length + settings.botCount > 30) throw new ServiceError("room_full", 409);
          await db.query(
            "UPDATE room_members SET status='left' WHERE room_id=$1 AND actor_id IN (SELECT id FROM actors WHERE kind='bot')",
            [id],
          );
          room.players = room.players.filter((p) => p.kind !== "bot");
          room.players.push(...(await makeBots(db, settings.botCount, now)));
          const visibilityChanged = room.settings.visibility !== settings.visibility;
          room.settings = settings;
          room.code = settings.visibility === "private" ? null : room.code || code();
          room.players.forEach((p) => (p.ready = p.kind === "bot"));
          if (visibilityChanged)
            await db.query(
              "UPDATE invitations SET revoked_at=now() WHERE room_id=$1 AND consumed_at IS NULL",
              [id],
            );
        } else if (command.kind === "start") {
          ensureHost(room, session.actorId);
          await start(db, room, now);
        } else if (command.kind === "input") {
          if (room.phase === "countdown" && room.race && now >= room.race.startsAt) {
            room.phase = "racing";
            await db.query("UPDATE races SET phase='racing' WHERE id=$1", [room.race.id]);
          }
          if (
            room.phase !== "racing" ||
            !room.race ||
            payload.raceId !== room.race.id ||
            !Number.isSafeInteger(payload.sequence) ||
            (payload.sequence as number) < 1
          )
            throw new ServiceError("invalid_phase", 409);
          const sequence = payload.sequence as number;
          if (sequence > player.sequence + 1) throw new ServiceError("stale_sequence", 409);
          if (sequence === player.sequence + 1)
            room.players = room.players.map((p) =>
              p.id === player.id
                ? {
                    ...p,
                    ...applyInput(
                      p,
                      payload.operations,
                      room.settings,
                      room.race!.text,
                      room.race!.startsAt,
                      now,
                    ),
                  }
                : p,
            );
          if (
            raceIsComplete(
              room.players.filter((p) => p.raceParticipant),
              room.settings,
              room.race.startsAt,
              now,
            )
          )
            await finish(db, room, now);
        } else if (command.kind === "ability") {
          if (room.phase !== "racing") throw new ServiceError("invalid_phase", 409);
          room.players = room.players.map((p) =>
            p.id === player.id
              ? {
                  ...p,
                  ...applyAbility(
                    p,
                    payload.ability as "boost" | "shield",
                    room.players,
                    room.settings.gameMode,
                    now,
                  ),
                }
              : p,
          );
        } else if (command.kind === "invite") {
          ensureHost(room, session.actorId);
          if (room.settings.visibility !== "private")
            throw new ServiceError("private_room_required");
          const token = secret();
          await db.query(
            "INSERT INTO invitations(token_hash,room_id,expires_at) VALUES($1,$2,now()+interval '24 hours')",
            [digest(token), id],
          );
          invitationUrl = `${appUrl()}/invitation/${token}`;
        } else if (command.kind === "role") {
          ensureHost(room, session.actorId);
          if (
            room.phase !== "lobby" ||
            (payload.role !== "participant" && payload.role !== "spectator")
          )
            throw new ServiceError("invalid_phase", 409);
          const target = member(room, String(payload.memberId));
          if (target.kind === "bot") throw new ServiceError("invalid_member");
          target.role = payload.role;
          target.ready = false;
        } else if (command.kind === "kick") {
          ensureHost(room, session.actorId);
          const target = member(room, String(payload.memberId));
          if (target.id === player.id) throw new ServiceError("invalid_member");
          target.status = "left";
          target.abandoned = false;
          target.connected = false;
          target.stoppedAt = now;
          await db.query(
            "UPDATE room_members SET status='kicked' WHERE room_id=$1 AND actor_id=$2",
            [id, target.id],
          );
        } else if (command.kind === "leave") {
          player.status = "left";
          player.abandoned = false;
          player.connected = false;
          player.stoppedAt = now;
          if (room.hostId === player.id) {
            room.hostId = successor(
              room,
              player.id,
              typeof payload.successorId === "string" ? payload.successorId : undefined,
            );
            if (!room.hostId) close(room, room.phase === "countdown" || room.phase === "racing");
          }
        } else if (command.kind === "close") {
          ensureHost(room, session.actorId);
          close(room, room.phase === "countdown" || room.phase === "racing");
        } else if (command.kind === "rematch") {
          ensureHost(room, session.actorId);
          if (room.phase !== "results") throw new ServiceError("invalid_phase", 409);
          room.phase = "lobby";
          room.race = null;
          room.results = [];
          room.players = activePlayers(room).map((p) => ({
            ...initializePlayer(p.id, p.username, p.kind, p.role, now),
            joinedAt: p.joinedAt,
            connected: p.connected,
            disconnectedAt: p.disconnectedAt,
          }));
        }
        await persist(db, room);
      }
      const response: CommandResponse = {
        ok: true,
        data: {
          room: publicRoom(room, session.actorId, now),
          ...(invitationUrl ? { invitationUrl } : {}),
        },
      };
      const storedResponse: CommandResponse = invitationUrl
        ? { ok: false, error: "invitation_already_issued" }
        : response;
      await db.query(
        "INSERT INTO command_receipts(actor_id,command_id,room_id,response) VALUES($1,$2,$3,$4)",
        [session.actorId, command.commandId, room.id, JSON.stringify(storedResponse)],
      );
      return response;
    });
  } catch (error) {
    return { ok: false, error: errorCode(error) };
  }
}
export async function roomForMember(id: string, actorId: string): Promise<InternalRoom | null> {
  if (!uuid.test(id)) return null;
  const row = (
    await getPool().query(
      "SELECT r.state FROM rooms r JOIN room_members m ON m.room_id=r.id WHERE r.id=$1 AND m.actor_id=$2 AND m.status<>'kicked'",
      [id, actorId],
    )
  ).rows[0];
  return row?.state || null;
}
export async function listRooms(): Promise<RoomSummary[]> {
  const rows = (
    await getPool().query(
      "SELECT state FROM rooms WHERE visibility='public' AND phase IN ('lobby','countdown','racing') AND expires_at>now() ORDER BY updated_at DESC LIMIT 100",
    )
  ).rows;
  return rows.map(({ state }) => ({
    id: state.id,
    name: state.settings.name,
    language: state.settings.language,
    gameMode: state.settings.gameMode,
    phase: state.phase,
    playerCount: activePlayers(state).length,
  }));
}
export async function profile(session: AuthSession): Promise<ProfileData> {
  const items = (
    await getPool().query(
      "SELECT data FROM results WHERE actor_id=$1 ORDER BY created_at DESC LIMIT 100",
      [session.actorId],
    )
  ).rows.map((r) => r.data as StoredResult);
  const aggregate = (
    await getPool().query(
      `SELECT count(*)::integer races,count(*) FILTER(WHERE (data->>'rank')::integer=1 AND (data->>'correct')::integer>0)::integer wins,coalesce(avg((data->>'wpm')::numeric),0)::float average_wpm,coalesce(avg((data->>'accuracy')::numeric),0)::float average_accuracy,coalesce(max((data->>'wpm')::numeric),0)::float best_wpm,coalesce(avg((data->>'rank')::numeric),0)::float average_rank FROM results WHERE actor_id=$1`,
      [session.actorId],
    )
  ).rows[0];
  return {
    user: session.user,
    stats: {
      races: aggregate.races,
      wins: aggregate.wins,
      averageWpm: aggregate.average_wpm,
      averageAccuracy: aggregate.average_accuracy,
      bestWpm: aggregate.best_wpm,
      averageRank: aggregate.average_rank,
    },
    results: items,
  };
}
export async function storedResult(id: string, session: AuthSession) {
  if (!uuid.test(id)) throw new ServiceError("result_not_found", 404);
  const row = (
    await getPool().query("SELECT data FROM results WHERE id=$1 AND actor_id=$2", [
      id,
      session.actorId,
    ])
  ).rows[0];
  if (!row) throw new ServiceError("result_not_found", 404);
  const result = row.data as StoredResult;
  const room = await roomForMember(result.roomId, session.actorId);
  return { result, room: room ? publicRoom(room, session.actorId) : null };
}
export async function markDisconnected(
  actorId: string,
  roomId: string,
): Promise<InternalRoom | null> {
  return transaction(async (db) => {
    const room = await load(db, roomId);
    const p = room.players.find((p) => p.id === actorId);
    if (
      !p ||
      (p.status === "left" && !p.abandoned) ||
      room.phase === "closed" ||
      room.phase === "interrupted"
    )
      return null;
    p.connected = false;
    p.disconnectedAt = Date.now();
    if (!p.finished && !p.abandoned) p.status = "disconnected";
    await persist(db, room);
    return room;
  });
}
export async function tickRooms(): Promise<InternalRoom[]> {
  const changed: InternalRoom[] = [];
  const candidates = (
    await getPool().query(
      "SELECT id FROM rooms WHERE phase IN ('lobby','countdown','racing','results')",
    )
  ).rows;
  for (const candidate of candidates) {
    const changedRoom = await transaction(async (db) => {
      const row = (
        await db.query("SELECT state,expires_at FROM rooms WHERE id=$1 FOR UPDATE SKIP LOCKED", [
          candidate.id,
        ])
      ).rows[0];
      if (!row) return null;
      const room = row.state as InternalRoom,
        now = Date.now();
      let dirty = false;
      if (row.expires_at.getTime() <= now) {
        close(room, room.phase === "countdown" || room.phase === "racing");
        dirty = true;
      }
      for (const p of room.players) {
        if (
          p.kind !== "bot" &&
          (p.status !== "left" || p.abandoned) &&
          !p.connected &&
          p.disconnectedAt &&
          now - p.disconnectedAt >= racePolicy.reconnectGraceMs
        ) {
          p.status = "left";
          p.abandoned = false;
          p.stoppedAt = now;
          dirty = true;
          if (room.hostId === p.id) {
            room.hostId = successor(room, p.id);
            if (!room.hostId) close(room, room.phase === "countdown" || room.phase === "racing");
          }
        }
      }
      if (room.phase === "countdown" && room.race && now >= room.race.startsAt) {
        room.phase = "racing";
        await db.query("UPDATE races SET phase='racing' WHERE id=$1", [room.race.id]);
        dirty = true;
      }
      if (room.phase === "racing" && room.race) {
        room.players = room.players.map((p) => {
          let next: RoomPlayer = {
            ...p,
            ...(p.kind === "bot"
              ? makeBotTick(p, room.settings, room.race!.text, room.race!.startsAt, now)
              : updateMetrics(
                  p,
                  room.race!.text,
                  room.race!.startsAt,
                  now,
                  room.settings.errorMode,
                )),
          };
          if (
            next.connected &&
            next.status !== "left" &&
            inactivityState(next, room.race!.startsAt, now) === "abandoned"
          ) {
            next = { ...next, status: "left", abandoned: true, stoppedAt: now };
          }
          return next;
        });
        const first = Math.min(
          ...room.players.filter((p) => p.finishedAt !== null).map((p) => p.finishedAt!),
        );
        const noLimitExpired =
          room.settings.durationSeconds === null &&
          (now - room.race.startsAt >= racePolicy.noLimitSafetyMs ||
            (Number.isFinite(first) && now - first >= racePolicy.noLimitAfterFirstFinishMs));
        if (
          noLimitExpired ||
          raceIsComplete(
            room.players.filter((p) => p.raceParticipant),
            room.settings,
            room.race.startsAt,
            now,
          )
        )
          await finish(db, room, now);
        dirty = true;
      }
      if (dirty) {
        room.lastTickAt = now;
        await persist(db, room);
        if (room.phase === "interrupted" && room.race)
          await db.query("UPDATE races SET phase='interrupted',finished_at=$2 WHERE id=$1", [
            room.race.id,
            new Date(now),
          ]);
        return room;
      }
      return null;
    });
    if (changedRoom) changed.push(changedRoom);
  }
  return changed;
}
export async function recoverAfterRestart(): Promise<void> {
  await transaction(async (db) => {
    const rows = (
      await db.query(
        "SELECT state FROM rooms WHERE phase NOT IN ('closed','interrupted') FOR UPDATE",
      )
    ).rows;
    for (const { state } of rows) {
      const room = state as InternalRoom;
      if (room.phase === "countdown" || room.phase === "racing") {
        close(room, true);
        if (room.race)
          await db.query("UPDATE races SET phase='interrupted',finished_at=now() WHERE id=$1", [
            room.race.id,
          ]);
      } else {
        room.players.forEach((p) => {
          if (p.kind !== "bot" && p.status !== "left") {
            p.connected = false;
            p.disconnectedAt = Date.now();
            p.ready = false;
            if (!p.finished && !p.abandoned) p.status = "disconnected";
          }
        });
      }
      await persist(db, room);
    }
  });
}
