import { describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";
import { getPool } from "../db";
import {
  consumeRealtimeTicket,
  createRealtimeTicket,
  guest,
  register,
  sessionForToken,
} from "../lib/server/auth";
import { markDisconnected, roomForMember, runCommand, tickRooms } from "../lib/server/rooms";
import { defaultSettings } from "../lib/domain";

describe.skipIf(process.env.INTEGRATION_TEST !== "1")("PostgreSQL backend invariants", () => {
  test("sessions persist only hashes, single-use tickets cannot authenticate twice, revocation applies", async () => {
    const value = await guest({ username: `Guest_${randomUUID().slice(0, 8)}` }, randomUUID());
    const session = (await sessionForToken(value.token))!;
    expect(session.user.kind).toBe("guest");
    const stored = (
      await getPool().query("SELECT token_hash FROM sessions WHERE id=$1", [session.id])
    ).rows[0];
    expect(stored.token_hash).not.toBe(value.token);
    const ticket = await createRealtimeTicket(session);
    expect((await consumeRealtimeTicket(ticket.ticket)).actorId).toBe(session.actorId);
    await expect(consumeRealtimeTicket(ticket.ticket)).rejects.toThrow("invalid_ticket");
    await getPool().query("UPDATE sessions SET revoked_at=now() WHERE id=$1", [session.id]);
    expect(await sessionForToken(value.token)).toBeNull();
    const command = await runCommand(session, {
      commandId: randomUUID(),
      kind: "create",
      payload: defaultSettings,
    });
    expect(command).toEqual({ ok: false, error: "unauthenticated" });
  });
  test("creation is account-only and atomically idempotent; full private admission preserves invitation", async () => {
    const account = await register(
      { username: `Owner_${randomUUID().slice(0, 8)}`, password: "secure-test-password" },
      randomUUID(),
    );
    const visitor = await guest({ username: `Visit_${randomUUID().slice(0, 8)}` }, randomUUID());
    const host = (await sessionForToken(account.token))!,
      guestSession = (await sessionForToken(visitor.token))!;
    const forbidden = await runCommand(guestSession, {
      commandId: randomUUID(),
      kind: "create",
      payload: defaultSettings,
    });
    expect(forbidden).toEqual({ ok: false, error: "account_required" });
    const create = {
      commandId: randomUUID(),
      kind: "create",
      payload: { ...defaultSettings, visibility: "private", botCount: 29 },
    };
    const [first, retry] = await Promise.all([runCommand(host, create), runCommand(host, create)]);
    expect(retry).toEqual(first);
    if (!first.ok) throw Error(first.error);
    const roomId = first.data.room.id;
    expect(first.data.room.code).toBeNull();
    expect(first.data.room.players).toHaveLength(30);
    const inviteCommand = { commandId: randomUUID(), kind: "invite", roomId, payload: {} };
    const invitation = await runCommand(host, inviteCommand);
    if (!invitation.ok) throw Error(invitation.error);
    const token = invitation.data.invitationUrl!.split("/").at(-1)!;
    const receipt = (
      await getPool().query(
        "SELECT response FROM command_receipts WHERE actor_id=$1 AND command_id=$2",
        [host.actorId, inviteCommand.commandId],
      )
    ).rows[0];
    expect(JSON.stringify(receipt.response)).not.toContain(token);
    expect(await runCommand(host, inviteCommand)).toEqual({
      ok: false,
      error: "invitation_already_issued",
    });
    expect(
      await runCommand(guestSession, {
        commandId: randomUUID(),
        kind: "join",
        payload: { invitation: token },
      }),
    ).toEqual({ ok: false, error: "room_full" });
    const row = (
      await getPool().query("SELECT consumed_at FROM invitations WHERE room_id=$1", [roomId])
    ).rows[0];
    expect(row.consumed_at).toBeNull();
    const configured = await runCommand(host, {
      commandId: randomUUID(),
      kind: "configure",
      roomId,
      payload: { botCount: 28 },
    });
    expect(configured.ok).toBe(true);
    const joined = await runCommand(guestSession, {
      commandId: randomUUID(),
      kind: "join",
      payload: { invitation: token },
    });
    expect(joined.ok).toBe(true);
    const second = await guest({ username: `Again_${randomUUID().slice(0, 8)}` }, randomUUID());
    const secondSession = (await sessionForToken(second.token))!;
    // Capacity refusal also preserves the token's already-consumed state; freeing a place reveals one-use refusal.
    await runCommand(host, {
      commandId: randomUUID(),
      kind: "configure",
      roomId,
      payload: { botCount: 27 },
    });
    expect(
      await runCommand(secondSession, {
        commandId: randomUUID(),
        kind: "join",
        payload: { invitation: token },
      }),
    ).toEqual({ ok: false, error: "invalid_invitation" });
    const left = await runCommand(host, {
      commandId: randomUUID(),
      kind: "leave",
      roomId,
      payload: {},
    });
    if (!left.ok) throw Error(left.error);
    expect(left.data.room.hostId).toBe(guestSession.actorId);
    expect(
      await runCommand(guestSession, {
        commandId: randomUUID(),
        kind: "create",
        payload: defaultSettings,
      }),
    ).toEqual({ ok: false, error: "account_required" });
    const closed = await runCommand(guestSession, {
      commandId: randomUUID(),
      kind: "close",
      roomId,
      payload: {},
    });
    expect(closed.ok).toBe(true);
  });
  test("short reconnection preserves host; grace expiry transfers to the oldest guest participant", async () => {
    const owner = await register(
      { username: `Grace_${randomUUID().slice(0, 8)}`, password: "secure-test-password" },
      randomUUID(),
    );
    const visitor = await guest({ username: `Peer_${randomUUID().slice(0, 8)}` }, randomUUID());
    const host = (await sessionForToken(owner.token))!,
      peer = (await sessionForToken(visitor.token))!;
    const created = await runCommand(host, {
      commandId: randomUUID(),
      kind: "create",
      payload: defaultSettings,
    });
    if (!created.ok) throw Error(created.error);
    const roomId = created.data.room.id;
    expect(
      (
        await runCommand(peer, {
          commandId: randomUUID(),
          kind: "join",
          payload: { code: created.data.room.code },
        })
      ).ok,
    ).toBe(true);
    await markDisconnected(host.actorId, roomId);
    const reconnected = await runCommand(host, {
      commandId: randomUUID(),
      kind: "sync",
      roomId,
      payload: {},
    });
    if (!reconnected.ok) throw Error(reconnected.error);
    expect(reconnected.data.room.hostId).toBe(host.actorId);
    expect(reconnected.data.room.players.find((p) => p.id === host.actorId)?.connected).toBe(true);
    await markDisconnected(host.actorId, roomId);
    // The test advances only this persisted room's disconnect clock, without waiting a minute.
    await getPool().query(
      "UPDATE rooms SET state=jsonb_set(state,'{players,0,disconnectedAt}',to_jsonb($2::bigint)) WHERE id=$1",
      [roomId, Date.now() - 60001],
    );
    await tickRooms();
    const transferred = await roomForMember(roomId, peer.actorId);
    expect(transferred?.hostId).toBe(peer.actorId);
    const closed = await runCommand(peer, {
      commandId: randomUUID(),
      kind: "close",
      roomId,
      payload: {},
    });
    expect(closed.ok).toBe(true);
  });
  test("concurrent admission consumes an invitation exactly once", async () => {
    const owner = await register(
      { username: `Invite_${randomUUID().slice(0, 8)}`, password: "secure-test-password" },
      randomUUID(),
    );
    const host = (await sessionForToken(owner.token))!;
    const visitors = await Promise.all([
      guest({ username: `First_${randomUUID().slice(0, 8)}` }, randomUUID()),
      guest({ username: `Next_${randomUUID().slice(0, 8)}` }, randomUUID()),
    ]);
    const peers = await Promise.all(visitors.map((v) => sessionForToken(v.token)));
    const created = await runCommand(host, {
      commandId: randomUUID(),
      kind: "create",
      payload: { ...defaultSettings, visibility: "private" },
    });
    if (!created.ok) throw Error(created.error);
    const roomId = created.data.room.id;
    const invited = await runCommand(host, {
      commandId: randomUUID(),
      kind: "invite",
      roomId,
      payload: {},
    });
    if (!invited.ok) throw Error(invited.error);
    const token = invited.data.invitationUrl!.split("/").at(-1)!;
    const attempts = await Promise.all(
      peers.map((peer) =>
        runCommand(peer!, {
          commandId: randomUUID(),
          kind: "join",
          payload: { invitation: token },
        }),
      ),
    );
    expect(attempts.filter((response) => response.ok)).toHaveLength(1);
    expect(attempts.filter((response) => !response.ok)).toEqual([
      { ok: false, error: "invalid_invitation" },
    ]);
    expect(
      (await runCommand(host, { commandId: randomUUID(), kind: "close", roomId, payload: {} })).ok,
    ).toBe(true);
  });
});
