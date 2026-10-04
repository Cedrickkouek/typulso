import { createServer } from "node:http";
import { Server } from "socket.io";
import { databaseHealthy, getPool } from "../db";
import { consumeRealtimeTicket, type AuthSession } from "../lib/server/auth";
import {
  markDisconnected,
  publicRoom,
  recoverAfterRestart,
  roomForMember,
  runCommand,
  tickRooms,
  type InternalRoom,
} from "../lib/server/rooms";
import { appUrl } from "../lib/server/security";

const allowedOrigin = new URL(appUrl()).origin;
const http = createServer(async (request, response) => {
  if (request.url !== "/health") {
    response.writeHead(404, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ error: "not_found" }));
    return;
  }
  const database = await databaseHealthy();
  response.writeHead(database ? 200 : 503, {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify({ ok: database, database, service: "realtime" }));
});
const io = new Server(http, {
  cors: { origin: allowedOrigin, credentials: true },
  maxHttpBufferSize: 20000,
  transports: ["websocket", "polling"],
  allowRequest: (request, callback) => callback(null, request.headers.origin === allowedOrigin),
});
interface SocketData {
  session: AuthSession;
  roomId?: string;
}
const connections = new Map<string, Set<string>>();
async function disconnectFromRoom(actorId: string, roomId: string) {
  const present = (await io.in(roomId).fetchSockets()).some(
    (socket) => (socket.data as SocketData).session.actorId === actorId,
  );
  if (present) return;
  const room = await markDisconnected(actorId, roomId);
  if (room) await broadcast(room);
}
async function broadcast(room: InternalRoom) {
  const sockets = await io.in(room.id).fetchSockets();
  for (const socket of sockets) {
    const data = socket.data as SocketData;
    const member = room.players.find((p) => p.id === data.session.actorId);
    socket.emit("room:state", publicRoom(room, data.session.actorId));
    if (!member || (member.status === "left" && !member.abandoned)) {
      await socket.leave(room.id);
      data.roomId = undefined;
    }
  }
}
io.use(async (socket, next) => {
  try {
    socket.data.session = await consumeRealtimeTicket(socket.handshake.auth?.ticket);
    next();
  } catch {
    next(new Error("invalid_ticket"));
  }
});
io.on("connection", (socket) => {
  const data = socket.data as SocketData;
  const ids = connections.get(data.session.actorId) || new Set<string>();
  ids.add(socket.id);
  connections.set(data.session.actorId, ids);
  socket.on("command", async (command: unknown, ack: unknown) => {
    if (typeof ack !== "function") return;
    let acknowledged = false;
    try {
      if (Date.now() >= data.session.expiresAt.getTime()) {
        ack({ ok: false, error: "unauthenticated" });
        socket.disconnect(true);
        return;
      }
      const response = await runCommand(data.session, command);
      ack(response);
      acknowledged = true;
      if (!response.ok) return;
      const roomId = response.data.room.id;
      if (data.roomId !== roomId) {
        if (data.roomId) {
          const previous = data.roomId;
          await socket.leave(previous);
          await disconnectFromRoom(data.session.actorId, previous);
        }
        await socket.join(roomId);
        data.roomId = roomId;
      }
      const room = await roomForMember(roomId, data.session.actorId);
      if (room) await broadcast(room);
    } catch (error) {
      if (!acknowledged) ack({ ok: false, error: "service_unavailable" });
      console.error("Command delivery failed", error instanceof Error ? error.message : error);
    }
  });
  socket.on("disconnect", async () => {
    const actorConnections = connections.get(data.session.actorId);
    actorConnections?.delete(socket.id);
    if (!actorConnections?.size) connections.delete(data.session.actorId);
    if (data.roomId) {
      try {
        await disconnectFromRoom(data.session.actorId, data.roomId);
      } catch (error) {
        console.error(
          "Disconnect persistence failed",
          error instanceof Error ? error.message : error,
        );
      }
    }
  });
});

// Lobby membership survives a restart. Interrupted races never award invented results.
await recoverAfterRestart();
let ticking = false;
const timer = setInterval(async () => {
  if (ticking) return;
  ticking = true;
  try {
    for (const room of await tickRooms()) await broadcast(room);
  } catch (error) {
    console.error("Room tick failed", error instanceof Error ? error.message : error);
  } finally {
    ticking = false;
  }
}, 250);
http.listen(Number(process.env.REALTIME_PORT || 3001), "0.0.0.0", () =>
  console.log(`Typulso realtime listening on ${process.env.REALTIME_PORT || 3001}`),
);
async function shutdown() {
  clearInterval(timer);
  await new Promise<void>((resolve) => io.close(() => resolve()));
  await getPool().end();
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
