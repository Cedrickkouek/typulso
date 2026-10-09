import { randomUUID } from "node:crypto";
import { hash, verify } from "@node-rs/argon2";
import type { PoolClient } from "pg";
import type { SessionUser } from "../../types/game";
import { getPool, transaction } from "../../db";
import { digest, limited, parseAuthBody, secret, ServiceError } from "./security";
import { credentialsSchema, guestSchema, opaqueTokenSchema } from "../validation";

export const SESSION_COOKIE = "typulso_session";
export interface AuthSession {
  id: string;
  actorId: string;
  userId: string | null;
  user: SessionUser;
  expiresAt: Date;
}
export function cookieValue(request: Request, name = SESSION_COOKIE): string | null {
  const part = request.headers
    .get("cookie")
    ?.split(";")
    .find((value) => value.trim().startsWith(`${name}=`));
  try {
    return part ? decodeURIComponent(part.trim().slice(name.length + 1)) : null;
  } catch {
    return null;
  }
}
export async function sessionForToken(token: string | null): Promise<AuthSession | null> {
  if (!token || token.length > 128) return null;
  const result = await getPool().query(
    `SELECT s.id,s.actor_id,s.expires_at,a.username,a.kind,a.user_id FROM sessions s JOIN actors a ON a.id=s.actor_id
    WHERE s.token_hash=$1 AND s.revoked_at IS NULL AND s.expires_at>now() AND (a.kind='account' OR s.last_seen_at>now()-interval '12 hours')`,
    [digest(token)],
  );
  const row = result.rows[0];
  if (!row) return null;
  await getPool().query(
    "UPDATE sessions SET last_seen_at=now() WHERE id=$1 AND last_seen_at<now()-interval '1 minute'",
    [row.id],
  );
  return {
    id: row.id,
    actorId: row.actor_id,
    userId: row.user_id,
    user: { id: row.actor_id, username: row.username, kind: row.kind },
    expiresAt: row.expires_at,
  };
}
export async function sessionForRequest(request: Request): Promise<AuthSession | null> {
  return sessionForToken(cookieValue(request));
}
export async function requireSession(request: Request): Promise<AuthSession> {
  const session = await sessionForRequest(request);
  if (!session) throw new ServiceError("unauthenticated", 401);
  return session;
}
export async function issueSession(actorId: string, kind: "account" | "guest", client: PoolClient) {
  const token = secret(),
    id = randomUUID();
  const expiresAt = new Date(Date.now() + (kind === "account" ? 30 * 86400000 : 12 * 3600000));
  await client.query(
    "INSERT INTO sessions(id,actor_id,token_hash,expires_at) VALUES($1,$2,$3,$4)",
    [id, actorId, digest(token), expiresAt],
  );
  return { token, kind };
}
export async function register(body: Record<string, unknown>, key: string) {
  const { username: name, password: pass } = parseAuthBody(credentialsSchema, body);
  await limited(`register:${key}`, 6, 600);
  const encoded = await hash(pass, {
    algorithm: 2,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });
  return transaction(async (client) => {
    const id = randomUUID();
    try {
      await client.query(
        "INSERT INTO users(id,username,username_key,password_hash) VALUES($1,$2,$3,$4)",
        [id, name, name.toLocaleLowerCase("fr"), encoded],
      );
    } catch (error) {
      if ((error as { code?: string }).code === "23505")
        throw new ServiceError("username_taken", 409);
      throw error;
    }
    await client.query("INSERT INTO actors(id,user_id,username,kind) VALUES($1,$1,$2,'account')", [
      id,
      name,
    ]);
    return {
      ...(await issueSession(id, "account", client)),
      user: { id, username: name, kind: "account" as const },
    };
  });
}
let dummyHash: Promise<string> | undefined;
export async function login(body: Record<string, unknown>, key: string) {
  const { username: name, password: pass } = parseAuthBody(credentialsSchema, body);
  const normalized = name.toLocaleLowerCase("fr");
  await limited(`login:${key}`, 30, 600);
  await limited(`login-name:${normalized}`, 10, 600);
  const row = (await getPool().query("SELECT * FROM users WHERE username_key=$1", [normalized]))
    .rows[0];
  dummyHash ||= hash(secret(), { algorithm: 2, memoryCost: 19456, timeCost: 2, parallelism: 1 });
  const valid = await verify(row?.password_hash || (await dummyHash), pass);
  if (!row?.password_hash || !valid) throw new ServiceError("invalid_credentials", 401);
  return transaction(async (client) => ({
    ...(await issueSession(row.id, "account", client)),
    user: { id: row.id, username: row.username, kind: "account" as const },
  }));
}
export async function guest(body: Record<string, unknown>, key: string) {
  const { username: name } = parseAuthBody(guestSchema, body);
  await limited(`guest:${key}`, 30, 600);
  return transaction(async (client) => {
    const id = randomUUID();
    await client.query("INSERT INTO actors(id,username,kind) VALUES($1,$2,'guest')", [id, name]);
    return {
      ...(await issueSession(id, "guest", client)),
      user: { id, username: name, kind: "guest" as const },
    };
  });
}
export async function logout(request: Request) {
  const token = cookieValue(request);
  if (token)
    await getPool().query("UPDATE sessions SET revoked_at=now() WHERE token_hash=$1", [
      digest(token),
    ]);
}
export async function createRealtimeTicket(session: AuthSession) {
  await limited(`ticket:${session.actorId}`, 30, 60);
  const ticket = secret();
  await getPool().query(
    "INSERT INTO realtime_tickets(token_hash,session_id,expires_at) VALUES($1,$2,now()+interval '60 seconds')",
    [digest(ticket), session.id],
  );
  return { ticket, url: process.env.NEXT_PUBLIC_REALTIME_URL || "http://127.0.0.1:3001" };
}
export async function consumeRealtimeTicket(ticket: unknown): Promise<AuthSession> {
  const parsed = opaqueTokenSchema.safeParse(ticket);
  if (!parsed.success) throw new ServiceError("invalid_ticket", 401);
  return transaction(async (client) => {
    const result = await client.query(
      `UPDATE realtime_tickets t SET consumed_at=now() FROM sessions s,actors a
      WHERE t.token_hash=$1 AND t.consumed_at IS NULL AND t.expires_at>now() AND s.id=t.session_id AND s.revoked_at IS NULL AND s.expires_at>now()
      AND a.id=s.actor_id AND (a.kind='account' OR s.last_seen_at>now()-interval '12 hours')
      RETURNING s.id,s.actor_id,s.expires_at,a.username,a.kind,a.user_id`,
      [digest(parsed.data)],
    );
    const row = result.rows[0];
    if (!row) throw new ServiceError("invalid_ticket", 401);
    await client.query("UPDATE sessions SET last_seen_at=now() WHERE id=$1", [row.id]);
    return {
      id: row.id,
      actorId: row.actor_id,
      userId: row.user_id,
      user: { id: row.actor_id, username: row.username, kind: row.kind },
      expiresAt: row.expires_at,
    };
  });
}
