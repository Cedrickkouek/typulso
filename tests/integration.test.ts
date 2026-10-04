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
