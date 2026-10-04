"use client";

import { useSyncExternalStore } from "react";
import { io, type Socket } from "socket.io-client";
import type { RoomCommand, RoomSnapshot, CommandResponse, CommandKind } from "@/types/game";
import { api } from "./api";

interface RealtimeState {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  rooms: Record<string, RoomSnapshot>;
  receivedAt: Record<string, number>;
}
const initial: RealtimeState = {
  connected: false,
  connecting: false,
  error: null,
  rooms: {},
  receivedAt: {},
};
let state = initial;
let socket: Socket | null = null;
let pendingConnection: Promise<Socket> | null = null;
const listeners = new Set<() => void>();
const publish = (change: Partial<RealtimeState>) => {
  state = { ...state, ...change };
  listeners.forEach((listener) => listener());
};
const acceptRoom = (room: RoomSnapshot) => {
  if (!state.rooms[room.id] || state.rooms[room.id].version <= room.version)
    publish({
      rooms: { ...state.rooms, [room.id]: room },
      receivedAt: { ...state.receivedAt, [room.id]: Date.now() },
    });
};
export function reconnectRealtime() {
  socket?.disconnect();
  socket = null;
  pendingConnection = null;
  publish({ connected: false, connecting: false, error: null });
  return connectRealtime();
}
export function disconnectRealtime() {
  socket?.disconnect();
  socket = null;
  pendingConnection = null;
  publish({ ...initial, rooms: {} });
}
async function connectRealtime(): Promise<Socket> {
  if (socket?.connected) return socket;
  if (pendingConnection) return pendingConnection;
  publish({ connecting: true, error: null });
  pendingConnection = (async () => {
    const ticket = await api<{ ticket: string; url: string }>("/api/realtime-ticket", {});
    const connection = io(ticket.url, {
      auth: { ticket: ticket.ticket },
      autoConnect: false,
      reconnection: false,
    });
    socket = connection;
    connection.on("room:state", (room: RoomSnapshot) => acceptRoom(room));
    connection.on("disconnect", () =>
      publish({
        connected: false,
        connecting: false,
        error:
          "Connexion interrompue. Reconnecte-toi pour reprendre. / Connection lost. Reconnect to resume.",
      }),
    );
    return new Promise<Socket>((resolve, reject) => {
      const timeout = setTimeout(() => {
        connection.disconnect();
        reject(
          new Error("Le serveur de course ne répond pas. / The race server is not responding."),
        );
      }, 10000);
      connection.once("connect", () => {
        clearTimeout(timeout);
        publish({ connected: true, connecting: false, error: null });
        resolve(connection);
      });
      connection.once("connect_error", (error: Error) => {
        clearTimeout(timeout);
        connection.disconnect();
        reject(error);
      });
      connection.connect();
    });
  })();
  try {
    return await pendingConnection;
  } catch (error) {
    publish({ connected: false, connecting: false, error: (error as Error).message });
    throw error;
  } finally {
    pendingConnection = null;
  }
}
export async function command(
  kind: CommandKind,
  payload: Record<string, unknown> = {},
  roomId?: string,
): Promise<CommandResponse & { ok: true }> {
  const connection = await connectRealtime();
  const message: RoomCommand = {
    commandId: crypto.randomUUID(),
    kind,
    payload,
    ...(roomId ? { roomId } : {}),
  };
  return new Promise((resolve, reject) => {
    connection
      .timeout(10000)
      .emit("command", message, (timeout: Error | null, response: CommandResponse) => {
        if (timeout)
          return reject(
            new Error(
              "La commande n’a pas été confirmée. Synchronise la salle avant de réessayer. / The command was not confirmed. Sync the room before trying again.",
            ),
          );
        if (!response?.ok)
          return reject(new Error(response?.error || "Commande refusée. / Command refused."));
        const room = response.data.room;
        acceptRoom(room);
        resolve(response);
      });
  });
}
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
export function currentRoom(id: string) {
  return state.rooms[id];
}
export function useRealtime() {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => initial,
  );
}
