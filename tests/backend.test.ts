import { describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";
import { defaultSettings, initializePlayer } from "../lib/domain";
import { publicRoom, validateCommand, type InternalRoom } from "../lib/server/rooms";
import { appUrl, checkOrigin, digest, password, secret, username } from "../lib/server/security";

describe("Backend boundaries", () => {
  test("public projection never broadcasts another player's input or private engine state", () => {
    const first = {
      ...initializePlayer(randomUUID(), "First", "account", "participant", 1000),
      value: "private-input",
      sequence: 8,
      heatmap: [{ key: "a", attempts: 5, errors: 2 }],
    };
    const other = {
      ...initializePlayer(randomUUID(), "Other", "guest", "participant", 1000),
      value: "other-secret",
      sequence: 4,
    };
    const room: InternalRoom = {
      id: randomUUID(),
      code: "ABCDE2",
      settings: defaultSettings,
      phase: "lobby",
      version: 1,
      hostId: first.id,
      players: [first, other],
      race: null,
      results: [],
      createdAt: 1000,
      lastTickAt: 1000,
    };
    const snapshot = publicRoom(room, first.id, 2000);
    expect(snapshot.self).toEqual({ value: "private-input", sequence: 8 });
    expect(JSON.stringify(snapshot.players)).not.toContain("private-input");
    expect(JSON.stringify(snapshot)).not.toContain("other-secret");
    expect(snapshot.players[0]).not.toHaveProperty("heatmap");
    expect(publicRoom(room).self).toBeUndefined();
  });
  test("commands reject malformed identity, unbounded payloads and non-integer versions", () => {
    expect(() => validateCommand({ commandId: "x", kind: "create" })).toThrow();
    expect(() => validateCommand({ commandId: randomUUID(), kind: "root" })).toThrow();
    expect(() =>
      validateCommand({
        commandId: randomUUID(),
        kind: "input",
        payload: { text: "x".repeat(18001) },
      }),
    ).toThrow();
    expect(() =>
      validateCommand({ commandId: randomUUID(), kind: "sync", expectedVersion: 1.1 }),
    ).toThrow();
    expect(validateCommand({ commandId: randomUUID(), kind: "sync", payload: {} }).kind).toBe(
      "sync",
    );
  });
  test("mutations require the configured browser origin", () => {
    expect(() => checkOrigin(new Request(appUrl(), { method: "POST" }))).toThrow();
    expect(() =>
      checkOrigin(
        new Request(appUrl(), { method: "POST", headers: { origin: "https://other.example" } }),
      ),
    ).toThrow();
    expect(() =>
      checkOrigin(
        new Request(appUrl(), { method: "POST", headers: { origin: new URL(appUrl()).origin } }),
      ),
    ).not.toThrow();
  });
  test("identity validation accepts French names without permitting controls or arbitrary text", () => {
    expect(username("  Émilie_7  ")).toBe("Émilie_7");
    expect(() => username("guest\nname")).toThrow();
    expect(() => username("a")).toThrow();
    expect(() => password("123456789")).toThrow();
    expect(password("long-password")).toBe("long-password");
  });
  test("opaque credentials have 256 bits of entropy and are represented by a distinct digest", () => {
    const token = secret();
    expect(Buffer.from(token, "base64url").length).toBe(32);
    expect(digest(token)).toHaveLength(64);
    expect(digest(token)).not.toContain(token);
    expect(secret()).not.toBe(token);
  });
});
