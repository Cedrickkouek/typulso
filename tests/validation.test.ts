import { describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";
import {
  credentialsSchema,
  guestSchema,
  preferencesSchema,
  sessionDataSchema,
} from "../lib/validation";
import { validateCommand } from "../lib/server/rooms";
import { readJson } from "../lib/server/security";

describe("Zod boundaries", () => {
  test("account and guest schemas normalize Unicode and reject injected account fields", () => {
    expect(
      credentialsSchema.parse({ username: "  E\u0301milie_7 ", password: "Strong_password" }),
    ).toEqual({ username: "Émilie_7", password: "Strong_password" });
    for (const body of [
      { username: "Émilie", password: 12345678901 },
      { username: "Émilie", password: "short" },
      { username: "Émilie", password: "Strong_password", role: "admin" },
      [],
    ])
      expect(credentialsSchema.safeParse(body).success).toBe(false);
    expect(
      guestSchema.safeParse({ username: "Visitor", password: "ignored-password" }).success,
    ).toBe(false);
  });
  test("a malformed stored preference falls back independently without enabling sounds", () => {
    expect(
      preferencesSchema.parse({
        locale: "en",
        theme: "dark",
        sounds: "true",
        raceSounds: 1,
        soundVolume: "100",
      }),
    ).toEqual({
      locale: "en",
      theme: "dark",
      reducedMotion: false,
      sounds: false,
      effects: true,
      raceSounds: false,
      soundVolume: 35,
    });
    expect(preferencesSchema.parse({ soundVolume: -20 }).soundVolume).toBe(0);
    expect(preferencesSchema.parse({ soundVolume: 500 }).soundVolume).toBe(100);
    expect(preferencesSchema.safeParse(null).success).toBe(false);
  });
  test("session responses cannot turn a guest into an unsupported identity", () => {
    const response = {
      user: { id: randomUUID(), username: "Visitor", kind: "guest" },
      oauth: { github: false, discord: false },
    };
    expect(sessionDataSchema.safeParse(response).success).toBe(true);
    expect(
      sessionDataSchema.safeParse({ ...response, user: { ...response.user, kind: "admin" } })
        .success,
    ).toBe(false);
    expect(
      sessionDataSchema.safeParse({ ...response, oauth: { github: "true", discord: false } })
        .success,
    ).toBe(false);
  });
  test("command validation checks payloads as well as the envelope, without coercion", () => {
    for (const [kind, payload] of [
      ["ready", { ready: "true" }],
      ["role", { memberId: randomUUID(), role: "host" }],
      ["kick", { memberId: "arbitrary" }],
      ["start", { force: true }],
      ["create", { botCount: "2" }],
      ["configure", { isAdmin: true }],
      ["ability", { raceId: randomUUID(), ability: "trap" }],
      [
        "input",
        { raceId: randomUUID(), sequence: "1", operations: [{ kind: "insert", text: "a" }] },
      ],
    ])
      expect(() => validateCommand({ commandId: randomUUID(), kind, payload })).toThrow();
    expect(() =>
      validateCommand({ commandId: randomUUID(), kind: "sync", isAdmin: true }),
    ).toThrow();
  });
  test("joining rejects ambiguous selectors and preserves one normalized code", () => {
    expect(
      validateCommand({
        commandId: randomUUID(),
        kind: "join",
        payload: { code: " abcde2 ", role: "spectator" },
      }).payload,
    ).toEqual({ code: "ABCDE2", role: "spectator" });
    for (const payload of [
      {},
      { code: "ABCDE2", roomId: randomUUID() },
      { invitation: "x", code: "ABCDE2" },
      { code: "ABCDEF", role: "host" },
    ])
      expect(() => validateCommand({ commandId: randomUUID(), kind: "join", payload })).toThrow();
  });
  test("frappe batches normalize composed accents and refuse hidden fields and paste", () => {
    const envelope = {
      commandId: randomUUID(),
      kind: "input",
      payload: {
        raceId: randomUUID(),
        sequence: 1,
        operations: [{ kind: "insert", text: "e\u0301" }],
      },
    };
    expect(validateCommand(envelope).payload?.operations).toEqual([{ kind: "insert", text: "é" }]);
    for (const operations of [
      [{ kind: "delete", text: "secret" }],
      [{ kind: "insert", text: "\u200b" }],
      [{ kind: "insert", text: "pasted text" }],
      [
        { kind: "insert", text: "abcd" },
        { kind: "insert", text: "efgh" },
        { kind: "insert", text: "i" },
      ],
    ])
      expect(() =>
        validateCommand({ ...envelope, payload: { ...envelope.payload, operations } }),
      ).toThrow();
  });
  test("HTTP JSON shape and limits refuse arrays, malformed JSON and oversized bodies", async () => {
    const request = (body: string, type = "application/json") =>
      new Request("http://localhost", { method: "POST", headers: { "Content-Type": type }, body });
    expect(await readJson(request('{"username":"Visitor"}'))).toEqual({ username: "Visitor" });
    for (const body of ["[]", "null", "broken", JSON.stringify({ value: "x".repeat(16001) })])
      await expect(readJson(request(body))).rejects.toThrow();
    await expect(readJson(request("{}", "text/plain"))).rejects.toThrow("invalid_json");
  });
});
