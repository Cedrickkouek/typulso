import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { io, type Socket } from "socket.io-client";
import type {
  CommandResponse,
  RoomCommand,
  RoomSettings,
  RoomSnapshot,
  SessionUser,
} from "../types/game";

const suite = process.env.INTEGRATION_TEST === "1" ? describe : describe.skip;
const origin = process.env.APP_URL || "http://127.0.0.1:3000";
const sockets: Socket[] = [];
interface Actor {
  user: SessionUser;
  cookie: string;
  socket: Socket;
}
const delay = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function request(path: string, body?: unknown, cookie?: string, requestOrigin = origin) {
  return fetch(`${origin}${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: {
      ...(body === undefined ? {} : { "Content-Type": "application/json", Origin: requestOrigin }),
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
async function actor(kind: "register" | "guest", prefix: string): Promise<Actor> {
  const username = `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
  const response = await request(`/api/auth/${kind}`, {
    username,
    ...(kind === "register" ? { password: `Test_${crypto.randomUUID()}` } : {}),
  });
  expect(response.ok).toBe(true);
  const { user } = (await response.json()) as { user: SessionUser };
  const cookie = response.headers.get("set-cookie")!.split(";")[0];
  const ticketResponse = await request("/api/realtime-ticket", {}, cookie);
  expect(ticketResponse.ok).toBe(true);
  const { ticket, url } = (await ticketResponse.json()) as { ticket: string; url: string };
  const socket = io(url, {
    auth: { ticket },
    extraHeaders: { Origin: origin },
    transports: ["websocket"],
    reconnection: false,
    autoConnect: false,
  });
  sockets.push(socket);
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Realtime connection timeout")), 10000);
    socket.once("connect", () => {
      clearTimeout(timeout);
      resolve();
    });
    socket.once("connect_error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    socket.connect();
  });
  return { user, cookie, socket };
}
async function send(who: Actor, message: RoomCommand): Promise<CommandResponse> {
  return new Promise((resolve, reject) =>
    who.socket
      .timeout(10000)
      .emit("command", message, (error: Error | null, response: CommandResponse) =>
        error ? reject(error) : resolve(response),
      ),
  );
}
async function command(
  who: Actor,
  kind: RoomCommand["kind"],
  payload: Record<string, unknown> = {},
  roomId?: string,
) {
  return send(who, { commandId: crypto.randomUUID(), kind, payload, roomId });
}
function success(response: CommandResponse): RoomSnapshot {
  if (!response.ok) throw new Error(`Command refused: ${response.error}`);
  return response.data.room;
}
const settings: RoomSettings = {
  name: "Recette integration",
  visibility: "code",
  language: "fr",
  contentMode: "custom",
  customText: "chat joue avec toi puis nous allons taper ensemble ici",
  length: 10,
  durationSeconds: 15,
  errorMode: "blocking",
  gameMode: "classic",
  botCount: 0,
  botLevel: "medium",
  excludedCharacters: "",
  targets: [],
  topic: "everyday",
  targetWpm: null,
};

suite("PostgreSQL + HTTP + Socket.IO avec sessions indépendantes", () => {
  let host: Actor;
  let guest: Actor;
  let other: Actor;
  let room: RoomSnapshot;
  beforeAll(async () => {
    expect((await request("/api/health")).ok).toBe(true);
    host = await actor("register", "testh");
    guest = await actor("guest", "testg");
    other = await actor("guest", "testo");
  });
  afterAll(() => sockets.forEach((socket) => socket.disconnect()));

  test("Zod refuse les corps HTTP et commandes invalides avant une modification", async () => {
    for (const [path, body, code] of [
      ["/api/auth/register", { username: "ValidName", password: "short" }, "invalid_password"],
      [
        "/api/auth/register",
        { username: "ValidName", password: "strong-test-password", role: "admin" },
        "invalid_json",
      ],
      ["/api/auth/login", { username: "ValidName", password: 12345678901 }, "invalid_password"],
      ["/api/auth/guest", { username: "Visitor", role: "host" }, "invalid_json"],
      ["/api/auth/login", [], "invalid_json"],
    ] as const) {
      const response = await request(path, body);
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ error: code });
    }
    const preview = await request(
      "/api/content/preview",
      { settings: { length: "50" } },
      host.cookie,
    );
    expect(preview.status).toBe(400);
    expect(await preview.json()).toEqual({ error: "invalid_settings" });
    expect(await command(host, "ready", { ready: "true" }, crypto.randomUUID())).toEqual({
      ok: false,
      error: "invalid_command",
    });
    expect(await command(host, "configure", { botCount: "2" }, crypto.randomUUID())).toEqual({
      ok: false,
      error: "invalid_settings",
    });
  });

  test("Suspense livre le profil dans le HTML serveur sans partager les identités", async () => {
    const [owner, visitor, anonymous] = await Promise.all([
      request("/profil", undefined, host.cookie),
      request("/profil", undefined, guest.cookie),
      request("/profil"),
    ]);
    const [ownerHtml, visitorHtml, anonymousHtml] = await Promise.all([
      owner.text(),
      visitor.text(),
      anonymous.text(),
    ]);
    expect(owner.status).toBe(200);
    expect(visitor.status).toBe(200);
    expect(anonymous.status).toBe(200);
    expect(ownerHtml).toContain(host.user.username);
    expect(visitorHtml).toContain(guest.user.username);
    expect(ownerHtml).not.toContain(guest.user.username);
    expect(visitorHtml).not.toContain(host.user.username);
    expect(anonymousHtml).not.toContain(host.user.username);
    expect(anonymousHtml).not.toContain(guest.user.username);
    expect(ownerHtml).toContain("Ton espace");
    expect(visitorHtml).toContain("Ton espace");
    expect(ownerHtml).toContain('aria-busy="true"');
  });

  test("permissions, code, événement partagé et commande idempotente", async () => {
    const wrongOrigin = await request(
      "/api/realtime-ticket",
      {},
      host.cookie,
      "https://untrusted.example",
    );
    expect(wrongOrigin.status).toBe(403);
    expect((await command(guest, "create", { ...settings })).ok).toBe(false);
    const create: RoomCommand = {
      commandId: crypto.randomUUID(),
      kind: "create",
      payload: { ...settings },
    };
    room = success(await send(host, create));
    const duplicate = success(await send(host, create));
    expect(duplicate.id).toBe(room.id);
    expect(room.code).toMatch(/^[A-Z0-9]{6}$/);
    expect((await command(other, "join", { roomId: room.id })).ok).toBe(false);
    const observed = new Promise<RoomSnapshot>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("Host did not observe admission")), 5000);
      const handler = (snapshot: RoomSnapshot) => {
        if (
          snapshot.id === room.id &&
          snapshot.players.some((player) => player.id === guest.user.id)
        ) {
          clearTimeout(timeout);
          host.socket.off("room:state", handler);
          resolve(snapshot);
        }
      };
      host.socket.on("room:state", handler);
    });
    room = success(await command(guest, "join", { code: room.code }));
    expect((await observed).players.filter((player) => player.role === "participant")).toHaveLength(
      2,
    );
    expect((await command(guest, "configure", { name: "Interdit" }, room.id)).ok).toBe(false);
    room = success(await command(host, "configure", { name: "Recette confirmee" }, room.id));
    expect(room.settings.name).toBe("Recette confirmee");
    expect(JSON.stringify(room)).not.toContain("token_hash");
    expect(room.self?.value || "").toBe("");
  });

  test("départ commun, saisie validée, résultats persistés et hôte transféré", async () => {
    success(await command(host, "ready", { ready: true }, room.id));
    success(await command(guest, "ready", { ready: true }, room.id));
    room = success(await command(host, "start", {}, room.id));
    expect(room.phase).toBe("countdown");
    expect(room.race).not.toBeNull();
    const raceId = room.race!.id;
    expect(
      (
        await command(
          host,
          "input",
          { raceId, sequence: 1, operations: [{ kind: "insert", text: "c" }] },
          room.id,
        )
      ).ok,
    ).toBe(false);
    await delay(Math.max(0, room.race!.startsAt - Date.now()) + 300);
    const typed = success(
      await command(
        host,
        "input",
        { raceId, sequence: 1, operations: [..."chat "].map((text) => ({ kind: "insert", text })) },
        room.id,
      ),
    );
    expect(typed.self?.sequence).toBe(1);
    expect(typed.players.find((player) => player.id === host.user.id)!.correct).toBeGreaterThan(0);
    const guestTyped = success(
      await command(
        guest,
        "input",
        { raceId, sequence: 1, operations: [..."chXt"].map((text) => ({ kind: "insert", text })) },
        room.id,
      ),
    );
    expect(
      guestTyped.players.find((player) => player.id === guest.user.id)!.errors,
    ).toBeGreaterThan(0);
    expect(guestTyped.self?.value).not.toBe(typed.self?.value);
    expect(
      (
        await command(
          host,
          "input",
          { raceId: crypto.randomUUID(), sequence: 2, operations: [] },
          room.id,
        )
      ).ok,
    ).toBe(false);
    const deadline = Date.now() + 18000;
    do {
      await delay(250);
      room = success(await command(host, "sync", {}, room.id));
    } while (room.phase !== "results" && Date.now() < deadline);
    expect(room.phase).toBe("results");
    expect(room.results).toHaveLength(2);
    const finalResults = room.results;
    // Both independently authenticated sockets can deliver their final batch late.
    const hostLate = success(
      await command(
        host,
        "input",
        {
          raceId,
          sequence: 2,
          operations: [{ kind: "insert", text: "a" }],
        },
        room.id,
      ),
    );
    const guestLate = success(
      await command(
        guest,
        "input",
        {
          raceId,
          sequence: 2,
          operations: [{ kind: "insert", text: "b" }],
        },
        room.id,
      ),
    );
    expect(hostLate.phase).toBe("results");
    expect(guestLate.phase).toBe("results");
    expect(hostLate.self?.value).toBe(typed.self?.value);
    expect(guestLate.self?.value).toBe(guestTyped.self?.value);
    expect(hostLate.results).toEqual(finalResults);
    // Heatmaps are private to each recipient; compare the shared race measurements.
    expect(guestLate.results.map((result) => ({ ...result, heatmap: [] }))).toEqual(
      finalResults.map((result) => ({ ...result, heatmap: [] })),
    );
    expect(guestLate.results.find((result) => result.playerId === host.user.id)?.heatmap).toEqual(
      [],
    );
    const profileResponse = await request("/api/profile", undefined, host.cookie);
    expect(profileResponse.ok).toBe(true);
    const profile = (await profileResponse.json()) as {
      stats: { races: number };
      results: Array<{ raceId: string; id: string }>;
    };
    expect(profile.stats.races).toBeGreaterThanOrEqual(1);
    const persisted = profile.results.find((result) => result.raceId === raceId);
    expect(persisted).toBeDefined();
    expect((await request(`/api/results/${persisted!.id}`, undefined, other.cookie)).status).toBe(
      404,
    );
    room = success(await command(host, "leave", {}, room.id));
    expect(room.hostId).toBe(guest.user.id);
    success(await command(guest, "close", {}, room.id));
  }, 30000);

  test("arcade partagé : cible explicite, piège idempotent, contre et record comparable", async () => {
    const text = "a ".repeat(100).trim();
    const arena = success(
      await command(host, "create", {
        ...settings,
        name: "Arcade vérifiée",
        gameMode: "arcade",
        errorMode: "free",
        customText: text,
        length: 100,
        durationSeconds: 30,
      }),
    );
    const id = arena.id;
    success(await command(guest, "join", { code: arena.code }));
    success(await command(other, "join", { code: arena.code, role: "spectator" }));
    success(await command(host, "role", { memberId: other.user.id, role: "participant" }, id));
    for (const who of [host, guest, other])
      success(await command(who, "ready", { ready: true }, id));
    let round = success(await command(host, "start", {}, id));
    const raceId = round.race!.id;
    await delay(Math.max(0, round.race!.startsAt + 5100 - Date.now()));
    const sequences = new Map<string, number>();
    async function type(who: Actor, start: number, end: number, currentRace: string) {
      for (let index = start; index < end; index += 8) {
        const seq = (sequences.get(who.user.id) ?? 0) + 1;
        sequences.set(who.user.id, seq);
        round = success(
          await command(
            who,
            "input",
            {
              raceId: currentRace,
              sequence: seq,
              operations: [...text.slice(index, Math.min(index + 8, end))].map((text) => ({
                kind: "insert",
                text,
              })),
            },
            id,
          ),
        );
      }
    }
    await type(host, 0, 50, raceId);
    await type(guest, 0, 80, raceId);
    await type(other, 0, 120, raceId);
    expect(
      await command(
        host,
        "ability",
        { raceId: crypto.randomUUID(), ability: "trap", targetId: guest.user.id },
        id,
      ),
    ).toEqual({ ok: false, error: "invalid_phase" });
    expect(
      await command(host, "ability", { raceId, ability: "trap", targetId: other.user.id }, id),
    ).toEqual({ ok: false, error: "trap_unavailable" });
    const attack: RoomCommand = {
      commandId: crypto.randomUUID(),
      kind: "ability",
      roomId: id,
      payload: { raceId, ability: "trap", targetId: guest.user.id },
    };
    const accepted = await send(host, attack);
    const replay = await send(host, attack);
    expect(replay).toEqual(accepted);
    const victim = success(await command(guest, "sync", {}, id));
    expect(victim.players.find((p) => p.id === guest.user.id)?.trap?.sourceId).toBe(host.user.id);
    expect(victim.events?.filter((e) => e.kind === "trap")).toHaveLength(1);
    success(await command(guest, "ability", { raceId, ability: "shield" }, id));
    await delay(1400);
    const countered = success(await command(guest, "sync", {}, id));
    const shield = countered.players.find((p) => p.id === guest.user.id)!;
    expect(shield.trap).toBeNull();
    expect(shield.shieldRemaining).toBe(0);
    expect(shield.trapPenalty).toBe(0);
    expect(countered.events?.filter((e) => e.kind === "trap-blocked")).toHaveLength(1);
    expect((await command(host, "ability", { raceId, ability: "boost" }, id)).ok).toBe(false);
    expect(countered.players[0]).not.toHaveProperty("value");
    await type(host, 50, text.length, raceId);
    await type(guest, 80, text.length, raceId);
    await type(other, 120, text.length, raceId);
    expect(round.phase).toBe("results");
    expect(
      round.results.every(
        (r) => r.firstReference && !r.personalBest && r.bestStreak === text.length,
      ),
    ).toBe(true);
    success(await command(host, "rematch", {}, id));
    for (const who of [host, guest, other])
      success(await command(who, "ready", { ready: true }, id));
    round = success(await command(host, "start", {}, id));
    const nextRace = round.race!.id;
    await delay(Math.max(0, round.race!.startsAt - Date.now()) + 100);
    sequences.clear();
    for (const who of [host, guest, other]) await type(who, 0, text.length, nextRace);
    expect(round.phase).toBe("results");
    expect(round.results.every((r) => r.personalBest && !r.firstReference)).toBe(true);
    expect(round.events).toEqual([]);
    expect(round.results.every((r) => r.arcade?.penalty === 0)).toBe(true);
    success(await command(host, "close", {}, id));
  });

  test("invitation individuelle à usage unique et déconnexion révocable", async () => {
    const privateRoom = success(
      await command(host, "create", {
        ...settings,
        visibility: "private",
        name: "Invitation integration",
      }),
    );
    expect(privateRoom.code).toBeNull();
    const invited = await command(host, "invite", {}, privateRoom.id);
    expect(invited.ok).toBe(true);
    if (!invited.ok) return;
    const token = new URL(invited.data.invitationUrl!).pathname.split("/").pop()!;
    expect((await command(other, "join", { roomId: privateRoom.id })).ok).toBe(false);
    success(await command(guest, "join", { invitation: token }));
    expect((await command(other, "join", { invitation: token })).ok).toBe(false);
    success(await command(host, "close", {}, privateRoom.id));
    expect((await request("/api/auth/logout", {}, guest.cookie)).ok).toBe(true);
    expect((await request("/api/realtime-ticket", {}, guest.cookie)).status).toBe(401);
    expect((await command(guest, "sync", {}, privateRoom.id)).ok).toBe(false);
  });
});
